#!/usr/bin/env node
/**
 * cwos-git — stage what is YOURS, and make file ownership computable (WS-564).
 *
 * THE PROBLEM, MEASURED. The founder runs 3-4 concurrent sessions (laptop left
 * running, remote-controlled from a phone, HomeBase-dispatched autopilot) on topics
 * that start unrelated and converge. They share one working tree, so `git add -A`
 * sweeps whatever is in it — mine or not. On 2026-08-01 a blanket stage in
 * claude-poker-tracker would have committed a third session's mid-edit files; it was
 * avoided only by hand-auditing mtimes. The cost is not the commit, it is what the
 * commit destroys: WS-312's fix landed inside a commit named for a different ticket
 * and the item stayed open at P0 for two days, because nobody could tell what that
 * commit actually contained.
 *
 * THREE THINGS THAT DO NOT WORK, all measured 2026-08-02:
 *
 *   - `listLiveSessions()` / `registryHealth()`. With three sessions concurrently
 *     editing the repo they returned [] and {ok:true}: a confident all-clear computed
 *     from a heartbeat hook that had been dead for two days. That specific fail-open
 *     is fixed elsewhere in this item, but it is not what ownership should rest on
 *     anyway — "is another PROCESS alive" is the wrong question. A crashed session's
 *     abandoned edits are equally not-mine and equally wrong to sweep into my commit.
 *   - Counting `status: active` records heartbeat-independently. Eight zombie records
 *     from 2026-07-30 would fence tree staging permanently — friction with no safety
 *     left in it.
 *   - Trusting the session to remember. It does not, and a rule that lives only in
 *     prose is FIND-119: the AI read prog-*.yaml directly for ten straight days
 *     against a documented rule saying not to.
 *
 * SO OWNERSHIP IS COMPUTED FROM TWO SOURCES, one a proof and one a record:
 *
 *   mtime < session start   PROOF of non-ownership. This session had not begun, so
 *                           it cannot have written that change. Needs no bookkeeping
 *                           and cannot rot. One-sided on purpose: a file touched
 *                           after my start might be mine or a peer's.
 *   files_locked            RECORD of ownership, written by `record` (a PostToolUse
 *                           hook) and by `stage`. Closes the gap the proof cannot
 *                           see — a session that started before mine and edited
 *                           after I began is invisible to mtime.
 *
 * Subcommands:
 *   stage [paths...]  stage this session's files, never the whole tree
 *   record <paths...> note that this session modified these files (hook entry)
 *   locks             who holds what, and whether they are still live
 *   guard             PreToolUse Bash hook: refuse tree-wide staging/stashing, and a
 *                     plain commit whose index holds another session's work (WS-534)
 *   worktree ...      isolation for unattended runs (see `worktree --help` notes)
 *
 * Exit codes: 0 ok | 1 refused / conflict | 2 bad command line.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { cliGate } = require('./lib/cli');
const { runGit, runNode } = require('./lib/shell-safe');
const { findWorkstreamDir, findRepoRoot, repoRootForPath, writeFileAtomic, readYAMLFile } = require('./lib/cwos-utils');
const { describeTree } = require('./lib/worktree-guard');
const {
  resolveSessionId, readSessionDoc, lockFiles, listFileLocks, findFileLockConflicts,
  listLiveSessions, staleActiveSessions,
} = require('./lib/cwos-claims');

/**
 * Shared derived state: rebuilt by `cwos-reconcile`, written by whichever session
 * happens to run a command, owned by none of them.
 *
 * Bundling these into a session's commit is what forces whoever commits to carry
 * every other session's state churn — the founder's actual complaint. They are
 * excluded from scoped staging by default and reinstated with --include-derived
 * for the deliberate case (a reconcile whose whole point IS the index refresh).
 *
 * Hardcoded rather than configurable on purpose: these four are CWOS's own files
 * and identical in every adopted repo, and a config key nothing else reads is the
 * declaration-without-a-consumer class this item is filed under.
 */
// WS-884: the list moved to lib/derived-state.js so the SessionStart
// autocommit, snapshot-diff and cwos-dialogue read the SAME one. Re-exported
// below unchanged for the callers that import it from here.
const { SHARED_DERIVED, isNodeLocal } = require('./lib/derived-state');

/**
 * A session record belongs to the session it names — a PROOF of ownership as
 * strong as mtime, and one that mtime gets wrong: a peer's heartbeat rewrites
 * its record after my session started, so the timestamp test reads it as mine.
 * Measured on this very change: a scoped stage picked up two peers' records.
 */
function peerSessionRecord(file, mySessionId) {
  const m = file.match(/^\.claude\/workstream\/sessions\/(?:session-)?(.+)\.yaml$/);
  if (!m) return false;
  return !mySessionId || m[1] !== mySessionId;
}

/** The mirror: a session record whose id IS ours. */
function ownSessionRecord(file, mySessionId) {
  const m = file.match(/^\.claude\/workstream\/sessions\/(?:session-)?(.+)\.yaml$/);
  return !!(m && mySessionId && m[1] === mySessionId);
}

// ─── guard: the legacy verdict is the FLOOR ─────────────────────────────────
//
// WS-824. The guard decides in two steps, and the order is the whole design:
//
//   1. legacyVerdict — the regex guard below, unchanged from before WS-824. If
//      it allows, the command is allowed: nothing here makes the guard looser
//      than it was by finding new things to allow.
//   2. relaxVerdict — only when legacy REFUSES. It may turn the refusal into an
//      allow only if it can PROVE the whole command consists of shapes it
//      positively recognises (see SAFE SHAPES). Any token, construct, wrapper or
//      command it does not recognise keeps the refusal.
//
// Why not a smarter parser that decides on its own: two inspection rounds found
// 30+ commands that a shell-aware parser judged harmless and real git ran as a
// tree sweep (glob and magic pathspecs, `| sh`, `xargs sh -c`, `node -e`,
// `powershell -Command`, variables, aliases, ...). Enumerating the dangerous
// forms cannot be finished; enumerating the safe forms can.
//
// The false positives the fleet filed, and which this relaxes, are: text inside
// quotes or heredocs read as a command (commit messages, `--do "..."` prose, a
// heredoc to a file, a `-m "$(cat <<'EOF' ... EOF)"` message); an explicit-path
// commit whose message holds `;`, `&` or `|`; `cd <other repo> && git ...` and
// `git -C <other repo> ...` judged against THIS tree; and `ssh host "git ..."`.

/**
 * Tree-wide staging/stashing: sweeps whatever is in the tree, mine or not.
 *
 * `git add <path>` is deliberately absent — explicit paths are the workflow this
 * steers toward, and blocking them would make the repo unusable.
 *
 * Every pattern is anchored to a COMMAND BOUNDARY (start of line, or after a
 * `;`, `&&`, `||`, or pipe). Without the anchor, a command that merely mentions
 * the string — `echo '{"command":"git add -A"}' | node …`, or a grep for it —
 * is blocked, and a guard that cries wolf gets disabled.
 *
 * Matched CASE-SENSITIVELY, against the raw command: git flags are case
 * sensitive, and lowercasing first silently turns `-A` into `-a` and makes every
 * pattern here dead on arrival.
 */
const BOUNDARY = '(?:^|[;&|]\\s*|\\n\\s*)';
const SWEEPS_TREE = [
  new RegExp(`${BOUNDARY}git\\s+add\\s+(?:-[A-Za-z]*\\s+)*(?:-A|--all|\\.)(?:\\s|$)`),
  new RegExp(`${BOUNDARY}git\\s+add\\s+-[A-Za-z]*A`),               // bundled short flags, e.g. -uA
  new RegExp(`${BOUNDARY}git\\s+commit\\s+(?:-a|--all)(?:\\s|$)`),
  new RegExp(`${BOUNDARY}git\\s+commit\\s+-[A-Za-z]*a[A-Za-z]*(?:\\s|$)`), // -am, -na, ...
  // `git stash` sweeps other sessions' work into a stash. Its READ-ONLY
  // subcommands do not, and blocking them is the cry-wolf failure that gets a
  // guard disabled — caught the first time a diagnostic ran `git stash list`.
  new RegExp(`${BOUNDARY}git\\s+stash(?!\\s+(?:list|show)\\b)(?:\\s|$)`),
];

/**
 * A plain `git commit` — the one sweep the list above cannot see (WS-534).
 *
 * `git commit` without `-a` stages nothing, so it is not a tree sweep; it commits
 * whatever the INDEX holds, and the index is shared by every session in the
 * checkout. That is the exact WS-514 incident: one session staged its files, a
 * second ran `git commit -m ...` for its own, and the first session's work left
 * under the second's message. Nothing in SWEEPS_TREE fires on it.
 *
 * So a commit is judged on what is STAGED, not on who is alive: it blocks only
 * when a staged file is provably someone else's.
 *
 * `git commit ... -- <paths>` commits only the named paths whatever the index
 * holds, so it is never blocked — the same rule as `git add <path>`: naming a
 * file is an assertion of ownership.
 */
const COMMITS = new RegExp(`${BOUNDARY}git\\s+commit(?:\\s|$)`);
const COMMIT_PATHSPEC = /(?:^|[\s;&|])git\s+commit\s[^;&|]*\s--\s+\S/;

/**
 * Split a shell command into tokens, for relaxVerdict.
 *
 *   { w, q, dollar, substs }  a word. q: some part was quoted. dollar: a `$` the
 *                             shell would expand (outside single quotes, and not
 *                             a `$(`). substs: raw `$( … )`/backtick texts in it.
 *   { op }                    ; && || | & ( )
 *   { redir, kind }           the next word is a redirection target; kind is
 *                             '<<<' for a here-string, 'io' otherwise
 *   { hdStart }               a `<<` heredoc operator in this statement
 *   { heredoc, quoted }       a heredoc body; quoted = delimiter was quoted
 *   { subst, toks }           tokens of a substitution
 *
 * `stopAtParen` lexes the inside of `$(`: it returns at the `)` that closes it.
 * `bad` is set for anything the lexer could mis-read (an unterminated quote).
 */
function lexShell(s, start, stopAtParen) {
  const toks = [];
  const pending = [];
  let word = null;
  let quoted = false;
  let dollar = false;
  let substs = [];
  let uq = ''; // the word's UNQUOTED characters: what brace/glob/tilde expansion sees
  let depth = 0;
  let bad = false;
  let i = start;
  const endWord = () => {
    if (word !== null) toks.push({ w: word, q: quoted, dollar, substs, uq, tilde: uq.startsWith('~') && word.startsWith('~') });
    word = null; quoted = false; dollar = false; substs = []; uq = '';
  };
  const op = (o) => { endWord(); toks.push({ op: o }); };
  const add = (t) => { word = (word || '') + t; };
  const subst = (p) => {
    const r = lexShell(s, p + 2, true);
    if (r.bad || r.end >= s.length) bad = true;
    const raw = s.slice(p, Math.min(r.end + 1, s.length));
    toks.push({ subst: true, toks: r.toks });
    add(raw); substs.push(raw); quoted = true;
    return r.end + 1;
  };
  const backtick = (p) => {
    let k = p + 1;
    while (k < s.length && s[k] !== '`') k += s[k] === '\\' ? 2 : 1;
    if (k >= s.length) bad = true;
    const raw = s.slice(p, Math.min(k + 1, s.length));
    toks.push({ subst: true, toks: lexShell(s.slice(p + 1, k), 0, false).toks });
    add(raw); substs.push(raw); quoted = true;
    return k + 1;
  };

  while (i < s.length) {
    const c = s[i];
    if (c === '\n') {
      endWord();
      i++;
      while (pending.length) {
        const h = pending.shift();
        const lines = [];
        let closed = false;
        while (i < s.length) {
          let j = s.indexOf('\n', i);
          if (j === -1) j = s.length;
          const line = s.slice(i, j).replace(/\r$/, '');
          i = j + 1;
          if ((h.strip ? line.replace(/^\t+/, '') : line) === h.delim) { closed = true; break; }
          lines.push(line);
        }
        if (!closed) bad = true;
        toks.push({ heredoc: lines.join('\n'), quoted: h.quoted });
      }
      if (i > s.length) i = s.length;
      toks.push({ op: ';' });
      continue;
    }
    if (c === ' ' || c === '\t' || c === '\r') { endWord(); i++; continue; }
    if (c === '\\') {
      if (s[i + 1] === '\n') { i += 2; continue; }
      add(s[i + 1] || ''); quoted = true; i += 2; continue;
    }
    if (c === "'") {
      const j = s.indexOf("'", i + 1);
      if (j === -1) bad = true;
      const end = j === -1 ? s.length : j;
      add(s.slice(i + 1, end)); quoted = true; i = end + 1; continue;
    }
    if (c === '"') {
      let j = i + 1;
      quoted = true;
      if (word === null) word = '';
      while (j < s.length && s[j] !== '"') {
        if (s[j] === '\\' && j + 1 < s.length && '"\\$`\n'.includes(s[j + 1])) {
          if (s[j + 1] !== '\n') add(s[j + 1]);
          j += 2; continue;
        }
        if (s[j] === '$' && s[j + 1] === '(') { j = subst(j); continue; }
        if (s[j] === '`') { j = backtick(j); continue; }
        if (s[j] === '$') dollar = true;
        add(s[j]); j++;
      }
      if (j >= s.length) bad = true;
      i = j + 1; continue;
    }
    if (c === '#' && word === null) {
      const j = s.indexOf('\n', i);
      i = j === -1 ? s.length : j;
      continue;
    }
    if (c === '<' && s.startsWith('<<<', i)) { endWord(); toks.push({ redir: true, kind: '<<<' }); i += 3; continue; }
    if (c === '<' && s[i + 1] === '<') {
      endWord();
      toks.push({ hdStart: true });
      let j = i + 2;
      let strip = false;
      let hq = false;
      if (s[j] === '-') { strip = true; j++; }
      while (s[j] === ' ' || s[j] === '\t') j++;
      let delim = '';
      while (j < s.length && !/[\s;&|<>()]/.test(s[j])) {
        if (s[j] === "'" || s[j] === '"') {
          hq = true;
          const k = s.indexOf(s[j], j + 1);
          const e = k === -1 ? s.length : k;
          delim += s.slice(j + 1, e); j = e + 1; continue;
        }
        if (s[j] === '\\') { hq = true; delim += s[j + 1] || ''; j += 2; continue; }
        if (s[j] === '$' || s[j] === '`') bad = true;
        delim += s[j]; j++;
      }
      if (delim) pending.push({ delim, strip, quoted: hq }); else bad = true;
      i = j; continue;
    }
    if (c === '>' || c === '<' || (c === '&' && s[i + 1] === '>')) {
      if (word !== null && !quoted && /^\d+$/.test(word)) { word = null; dollar = false; substs = []; }
      endWord();
      let j = i + 1;
      if (c === '&') j++;
      if (s[j] === '>' || s[j] === '&' || s[j] === '|') j++;
      if (s[j - 1] === '&' && s[j] === '-') j++;
      toks.push({ redir: true, kind: 'io' });
      i = j; continue;
    }
    if (c === '$' && s[i + 1] === '(') { i = subst(i); continue; }
    if (c === '`') { i = backtick(i); continue; }
    if (c === '$') { dollar = true; add(c); uq += c; i++; continue; }
    if (c === '&') {
      if (s[i + 1] === '&') { op('&&'); i += 2; continue; }
      op('&'); i++; continue;
    }
    if (c === '|') {
      if (s[i + 1] === '|') { op('||'); i += 2; continue; }
      op('|'); i += s[i + 1] === '&' ? 2 : 1; continue;
    }
    if (c === ';') { op(';'); i += s[i + 1] === ';' ? 2 : 1; continue; }
    if (c === '(') { depth++; op('('); i++; continue; }
    if (c === ')') {
      if (stopAtParen && depth === 0) { endWord(); return { toks, end: i, bad }; }
      depth--; op(')'); i++; continue;
    }
    add(c); uq += c; i++;
  }
  endWord();
  if (pending.length) bad = true;
  return { toks, end: s.length, bad };
}

function tokenizeShell(src) {
  return lexShell(String(src || ''), 0, false).toks;
}

// ─── SAFE SHAPES (relaxVerdict) ─────────────────────────────────────────────
//
// The ONLY shapes that may lift a legacy refusal. Deliberately minimal: three
// inspection rounds turned every broader set (node scripts, ssh, tee, redirects,
// unquoted flag values) into a real sweep.
//
//   1. git commit [-m '<quoted>' | -m "$(cat <<'EOF' … EOF)" | -F <path> | -q | -s |
//      --signoff | -v | --no-edit | --allow-empty]... -- <literal paths>
//   2. git add [--] <literal paths>                    (no flags at all)
//   3. echo / printf / grep / rg with literal words    (rg: -n -i -l -c -F -e --glob)
//   4. read-only git: status log diff show rev-parse ls-files blame describe
//   5. a literal existing `cd X &&` / `git -C X` into ANOTHER repo — judged there
//   6. mkdir / ls / cat / true with literal words
//   7. git stash [push] [-u | --include-untracked | -a | --all | -k | --keep-index |
//      --no-keep-index | -q | --quiet | -S | --staged | -m '<quoted>']... -- <literal paths>
//      (WS-1270: a stash scoped to named paths takes only those, the same assertion
//      of ownership as shape 2; a bare stash sweeps the tree and stays refused)
//
// joined by `&&`, `;` or newline; a pipe only from 3/4/6 into a read-only filter.
// No redirection of any kind, no heredoc but the commit-message form, nothing
// after a mkdir, no path under .git/.

const PLAIN_COMMANDS = new Set(['mkdir', 'ls', 'cat', 'true']);
const PIPE_FILTERS = new Set(['grep', 'head', 'tail', 'wc', 'sort', 'uniq', 'cut', 'cat', 'less']);
const GIT_READ_ONLY = new Set(['status', 'log', 'diff', 'show', 'rev-parse', 'ls-files', 'blame', 'describe']);
const COMMIT_FLAGS = new Set(['-q', '-s', '--signoff', '-v', '--no-edit', '--allow-empty']);
// Flags that only narrow or annotate a scoped stash. Not -p (interactive), not
// --pathspec-from-file (the paths would come from somewhere the guard cannot read).
const STASH_FLAGS = new Set(['-u', '--include-untracked', '-a', '--all', '-k', '--keep-index', '--no-keep-index',
  '-q', '--quiet', '-S', '--staged']);
const RG_FLAGS = new Set(['-n', '-i', '-l', '-c', '-F']);
const RG_VALUE_FLAGS = new Set(['-e', '--glob']);
const UNDER_GIT_DIR = /(?:^|[/\\])\.git(?:[/\\]|$)/i;

/**
 * THE WORD RULE. Nothing for the shell to expand — no variable, no substitution,
 * no brace/glob/tilde expansion in the UNQUOTED part (brace expansion turned
 * `-m {x,-i}` into `--include`) — and no path under .git/ (hooks).
 */
function plainWord(t) {
  return !t.dollar && !t.substs.length && !/[{}*?[\]$`]/.test(t.uq) && !t.tilde && !UNDER_GIT_DIR.test(t.w);
}

/** Entirely inside quotes: a -m value. */
const quotedWord = (t) => plainWord(t) && t.q && t.uq === '';

/**
 * A path that names exactly what it says: plain, relative, no glob or pathspec
 * magic (even quoted), no `.`/`..`/empty segment, not an option.
 */
function literalPath(t) {
  if (!plainWord(t)) return false;
  const p = t.w;
  if (!p || p.startsWith('-') || p.startsWith('~') || p.startsWith('/') || /^[A-Za-z]:/.test(p)) return false;
  if (/[*?[\]:!^(){}\\]/.test(p)) return false;
  return p.split('/').every((seg, k, all) => (seg !== '' || k === all.length - 1) && seg !== '.' && seg !== '..');
}

/**
 * A stash pathspec that takes exactly one file nobody else shares (WS-1270
 * reinspection, 2026-11-01). literalPath alone let `git stash push -u -- .claude/workstream`
 * prove safe, and `stash -u` REMOVES what it takes from disk: a live peer's
 * untracked session record and the shared event log with it. So a stash path
 * must also not be a directory — on disk, or by a trailing `/` — and must not
 * name, or be an ancestor of, `.claude/workstream` (case-folded, and through
 * any link on disk). Resolved against the directory git runs in.
 */
const SHARED_STATE_SEGS = ['.claude', 'workstream'];
function namesSharedState(absPath) {
  const segs = String(absPath).split(/[\\/]+/).map((s) => s.toLowerCase());
  for (let i = 0; i < segs.length; i++) {
    if (segs[i] !== SHARED_STATE_SEGS[0]) continue;
    if (i === segs.length - 1 || segs[i + 1] === SHARED_STATE_SEGS[1]) return true; // .claude itself, or under .claude/workstream
  }
  return false;
}
function stashFilePath(dir, t) {
  if (!literalPath(t)) return false;
  if (t.w.endsWith('/')) return false;
  const abs = path.resolve(dir, t.w);
  if (namesSharedState(abs)) return false;
  try {
    if (fs.statSync(abs).isDirectory()) return false;
    if (namesSharedState(fs.realpathSync.native(abs))) return false;
  } catch { /* not on disk: the stash cannot take it from disk either */ }
  return true;
}

/** `-m "$(cat <<'EOF' … EOF\n)"` — the one substitution allowed: a quoted heredoc fed to cat. */
function heredocMessage(t, substTok) {
  if (t.dollar || t.uq !== '' || t.substs.length !== 1 || t.w !== t.substs[0] || !t.w.startsWith('$(')) return false;
  if (!substTok || UNDER_GIT_DIR.test(t.w)) return false;
  const words = substTok.toks.filter((x) => x.w !== undefined);
  const bodies = substTok.toks.filter((x) => x.heredoc !== undefined);
  const other = substTok.toks.filter((x) => x.w === undefined && x.heredoc === undefined && !x.hdStart && x.op !== ';');
  return words.length === 1 && words[0].w === 'cat' && !words[0].q && plainWord(words[0])
    && bodies.length === 1 && bodies[0].quoted
    && substTok.toks.filter((x) => x.hdStart).length === 1 && other.length === 0;
}

/** A literal directory that exists — the only kind a cd or -C may move to. */
function literalDir(cwd, t) {
  if (!t || !plainWord(t) || /[*?[\]{}~]/.test(t.w) || !t.w) return null;
  let p = t.w;
  if (process.platform === 'win32') {
    const m = p.match(/^\/([a-zA-Z])(\/.*)?$/); // Git Bash: /c/Users/...
    if (m) p = `${m[1]}:${m[2] || '/'}`;
  }
  const d = path.isAbsolute(p) ? path.resolve(p) : path.resolve(cwd, p);
  try { return fs.statSync(d).isDirectory() ? d : null; } catch { return null; }
}

/** Shapes 1, 2, 4 and 7: true only for exactly those. `dir` is where git runs (after any cd / -C). */
function gitSafeShape(sub, args, substToks, dir) {
  if (GIT_READ_ONLY.has(sub)) return args.every((t) => plainWord(t) && !t.w.startsWith('--output'));
  if (sub === 'add') {
    const paths = args[0] && args[0].w === '--' && plainWord(args[0]) ? args.slice(1) : args;
    return paths.length > 0 && paths.every(literalPath);
  }
  if (sub === 'commit') {
    for (let k = 0; k < args.length; k++) {
      const t = args[k];
      if (t.w === '--' && plainWord(t)) {
        const paths = args.slice(k + 1);
        return paths.length > 0 && paths.every(literalPath);
      }
      if (t.w === '-m' || t.w === '--message') {
        const v = args[k + 1];
        if (!plainWord(t) || !v || !(quotedWord(v) || heredocMessage(v, substToks.get(v)))) return false;
        k++; continue;
      }
      if (t.w === '-F') {
        if (!plainWord(t) || !args[k + 1] || !literalPath(args[k + 1])) return false;
        k++; continue;
      }
      if (!plainWord(t) || !COMMIT_FLAGS.has(t.w)) return false;
    }
    return false; // `--` and paths are required
  }
  if (sub === 'stash') {
    // Shape 7 (WS-1270). `push` is optional to git (`git stash -u -- <path>` is
    // the same command); every other subcommand — pop, apply, save, create,
    // branch, -p — is not a scoped push and stays with the legacy verdict.
    let k = args[0] && args[0].w === 'push' && plainWord(args[0]) ? 1 : 0;
    for (; k < args.length; k++) {
      const t = args[k];
      if (t.w === '--' && plainWord(t)) {
        const paths = args.slice(k + 1);
        return paths.length > 0 && paths.every((t) => stashFilePath(dir, t));
      }
      if (t.w === '-m' || t.w === '--message') {
        const v = args[k + 1];
        if (!plainWord(t) || !v || !quotedWord(v)) return false; // as commit: the message is quoted, whole
        k++; continue;
      }
      if (!plainWord(t) || !STASH_FLAGS.has(t.w)) return false;
    }
    return false; // `--` and paths are required: that is what makes it scoped
  }
  return false;
}

/**
 * Prove the command is made only of the safe shapes. null = cannot (keep the
 * legacy refusal); else { dirs: [{ dir, judge }] } — every directory a cd or -C
 * moved to, each of which relaxVerdict must confirm is ANOTHER repo; `judge`
 * marks an add/commit/stash there that is not a safe shape, for that repo's guard.
 */
function proveSafe(command, startDir) {
  if (/[\r\0]/.test(String(command || ''))) return null; // bash does not split on CR; do not guess
  const lexed = lexShell(String(command || ''), 0, false);
  if (lexed.bad) return null;

  const stmts = [];
  let cur = { words: [], prev: null };
  const substToks = new Map();
  let lastSubst = null;
  for (const t of lexed.toks) {
    // No redirection of any kind, and no heredoc outside the commit-message form
    // (whose tokens live inside its substitution, not here).
    if (t.redir || t.hdStart || t.heredoc !== undefined) return null;
    if (t.subst) { lastSubst = t; continue; }
    if (t.w !== undefined) {
      if (t.substs.length) { if (t.substs.length !== 1 || !lastSubst) return null; substToks.set(t, lastSubst); }
      lastSubst = null;
      cur.words.push(t); continue;
    }
    if (!['&&', ';', '|'].includes(t.op)) return null; // || & ( ) — no relax
    if (!cur.words.length) { if (t.op !== ';') return null; cur.prev = t.op; continue; }
    cur.sep = t.op;
    stmts.push(cur);
    cur = { words: [], prev: t.op };
  }
  if (cur.words.length) { cur.sep = null; stmts.push(cur); }

  const dirs = [];
  let cwd = path.resolve(startDir);
  let moved = false;
  let uncertain = false;
  for (let n = 0; n < stmts.length; n++) {
    const st = stmts[n];
    if (n > 0 && stmts[n - 1].sep === ';' && moved) uncertain = true; // did that cd succeed?
    const [head, ...args] = st.words;
    if (!head || head.q || !plainWord(head) || /[=/\\]/.test(head.w)) return null;
    const cmd = head.w;

    if (st.prev === '|') {
      if (!PIPE_FILTERS.has(cmd) || !args.every(plainWord)) return null;
      if (args.some((t) => /^--compress|^\+/.test(t.w))) return null; // sort/less run programs
      continue;
    }
    const pipesOut = st.sep === '|';
    if (cmd === 'cd' || cmd === 'pushd') {
      if (uncertain || pipesOut || args.length !== 1) return null;
      const d = literalDir(cwd, args[0]);
      if (!d || (st.sep !== '&&' && st.sep !== null)) return null;
      cwd = d; moved = true;
      dirs.push({ dir: d, judge: false });
      continue;
    }
    if (cmd === 'echo' || cmd === 'printf' || cmd === 'grep') { if (!args.every(plainWord)) return null; continue; }
    if (cmd === 'rg') {
      for (let k = 0; k < args.length; k++) {
        const t = args[k];
        if (!plainWord(t)) return null;
        if (RG_VALUE_FLAGS.has(t.w)) { if (!args[k + 1] || !plainWord(args[k + 1])) return null; k++; continue; }
        if (t.w.startsWith('-') && !RG_FLAGS.has(t.w)) return null;
      }
      continue;
    }
    if (PLAIN_COMMANDS.has(cmd)) {
      if (!args.every(plainWord)) return null;
      if (cmd === 'mkdir' && n !== stmts.length - 1) return null; // nothing after a statement that writes
      continue;
    }
    if (cmd !== 'git') return null;

    // git [-C <literal dir>]... [--no-pager] <sub> ...
    let dir = cwd;
    let viaC = false;
    let k = 0;
    while (k < args.length) {
      const a = args[k];
      if (!plainWord(a)) return null;
      if (a.w === '-C') { dir = literalDir(dir, args[k + 1]); if (!dir) return null; viaC = true; k += 2; continue; }
      if (a.w === '--no-pager') { k++; continue; }
      if (a.w.startsWith('-')) return null; // -c, --git-dir, --work-tree, ...
      break;
    }
    if ((uncertain && !viaC) || k >= args.length) return null;
    const sub = args[k].w;
    const rest = args.slice(k + 1);
    const safe = gitSafeShape(sub, rest, substToks, dir);
    if (pipesOut && !(safe && GIT_READ_ONLY.has(sub))) return null;
    const elsewhere = moved || viaC;
    if (safe) { if (elsewhere) dirs.push({ dir, judge: false }); continue; }
    // Not a safe shape: only provably in ANOTHER repo may it go to that repo's guard.
    if (!elsewhere || !['add', 'commit', 'stash'].includes(sub) || !rest.every(plainWord)) return null;
    dirs.push({ dir, judge: true });
  }
  return { dirs };
}

/** Toplevel and common git dir, real paths, as git itself resolves them from `dir`. */
function gitIdentity(dir) {
  const r = runGit(['rev-parse', '--path-format=absolute', '--show-toplevel', '--git-common-dir'], { cwd: dir, timeout: 15000 });
  if (!r.ok) return null;
  const [top, common] = String(r.stdout).trim().split(/\r?\n/);
  if (!top || !common) return null;
  const real = (p) => { try { return fs.realpathSync.native(p); } catch { return path.resolve(p); } };
  return { top: real(top), common: real(common) };
}

/**
 * The relaxed verdict, when the shape is proven. Every directory a cd/-C moved
 * to must be ANOTHER repo by git's own reckoning (a junction, a linked worktree
 * or a .git file pointing back here is this repo); a non-safe statement there is
 * judged by that repo's own sessions (a repo with no CWOS registry has none).
 */
function relaxVerdict(command, startDir, ctx) {
  const proof = proveSafe(command, startDir);
  if (!proof) return null;
  const here = proof.dirs.length ? gitIdentity(ctx.root) : null;
  for (const d of proof.dirs) {
    const there = gitIdentity(d.dir);
    if (!here || !there || samePath(there.top, here.top) || samePath(there.common, here.common)) return null;
    if (!d.judge) continue;
    const tctx = targetContext(ctx, d.dir);
    if (!tctx) continue;
    const v = guardSweep(tctx);
    if (v.code) return v;
  }
  return { code: 0, lines: [] };
}

/** The pre-WS-824 guard, verbatim in its decision: { code, lines }. */
function legacyVerdict(command, ctx) {
  const cmd = String(command).replace(/\s+/g, ' ').trim();
  if (!cmd) return { code: 0, lines: [] };
  if (!SWEEPS_TREE.some((re) => re.test(cmd))) {
    return COMMITS.test(cmd) && !COMMIT_PATHSPEC.test(cmd) ? guardCommit(ctx) : { code: 0, lines: [] };
  }
  return guardSweep(ctx, { stash: STASHES.test(cmd) });
}
const STASHES = new RegExp(`${BOUNDARY}git\\s+stash(?:\\s|$)`);

const CLI = {
  name: 'cwos-git',
  summary: 'session-scoped staging and per-file ownership',
  subcommands: {
    stage: 'stage this session\'s changed files (never the whole tree)',
    record: 'record that this session modified <paths> (PostToolUse hook entry)',
    locks: 'report which session holds which files',
    guard: 'PreToolUse Bash hook — refuse tree-wide staging when the tree is shared, and a commit carrying another session\'s staged files',
    worktree: 'create/list/remove an isolated worktree for unattended work',
  },
  flags: {
    'dry-run': { type: 'boolean', describe: 'print what would be staged, stage nothing' },
    'include-derived': { type: 'boolean', describe: 'also stage shared derived state (indexes, event log)' },
    'include-unknown': { type: 'boolean', describe: 'also stage files whose ownership cannot be proven' },
    'bash-window': { type: 'boolean', describe: 'record (PostToolUse Bash): note files this session\'s command wrote' },
    json: { type: 'boolean', describe: 'machine-readable output' },
    quiet: { type: 'boolean', describe: 'suppress non-error output' },
    force: { type: 'boolean', describe: 'stage paths even when another live session holds them' },
    'repo-root': { type: 'string', placeholder: 'path', describe: 'override repo root discovery' },
  },
  notes: [
    'stage with no paths  — every changed file this session can prove is its own',
    'stage <paths...>     — those paths, refused if a live peer holds one (--force overrides)',
    '',
    'Shared derived state (queue-index.yaml, sprint-index.yaml, events/current.jsonl,',
    'system/events.log.md) is excluded unless --include-derived: reconcile rebuilds it,',
    'and bundling it makes whoever commits carry every session\'s churn.',
    '',
    'worktree create <topic> | worktree list | worktree remove <topic>',
    'Worktrees carry CODE. Workstream state stays in the main tree — see',
    'docs/worktree-isolation.md and lib/worktree-guard.js.',
  ].join('\n'),
};

// ─── context ────────────────────────────────────────────────────────────────

function context(values) {
  const root = values['repo-root'] ? path.resolve(values['repo-root']) : findRepoRoot(process.cwd());
  let wsDir = null;
  try { wsDir = findWorkstreamDir(root); } catch { /* not a CWOS repo */ }
  const sessionId = wsDir ? resolveSessionId(wsDir, { create: false }) : null;
  return { root, wsDir, sessionId };
}

/** Wall-clock ms this session started, from its own registry record. */
function sessionStartMs(wsDir, sessionId) {
  if (!wsDir || !sessionId) return null;
  const doc = readSessionDoc(path.join(wsDir, 'sessions', `${sessionId}.yaml`));
  if (!doc) return null;
  const t = Date.parse(String(doc.started_at || '').replace(/^"|"$/g, ''));
  return Number.isFinite(t) ? t : null;
}

/**
 * Changed paths, repo-relative with posix separators.
 *
 * `-uall` is load-bearing: by default git COLLAPSES an untracked directory to a
 * single entry (`.claude/`). Staging that one entry sweeps every new file
 * underneath it — including other sessions' — which is precisely the behaviour
 * this script exists to prevent, arriving through the back door. Caught by the
 * fixture suite, where a scoped stage reported staging exactly `.claude/`.
 */
function changedFiles(root) {
  const r = runGit(['status', '--porcelain', '-z', '-uall'], { cwd: root, timeout: 15000 });
  if (!r.ok) return [];
  // -z: NUL-separated, no quoting/escaping of unicode or spaces. The non-z form
  // wraps such paths in quotes, and a quoted path handed back to `git add` does
  // not match anything — a silent partial stage.
  const out = [];
  for (const rec of String(r.stdout).split('\0')) {
    if (!rec || rec.length < 4) continue;
    const status = rec.slice(0, 2);
    let p = rec.slice(3);
    if (status[0] === 'R' || status[1] === 'R') continue; // rename: dest arrives separately
    out.push(p.split('\\').join('/'));
  }
  return out;
}

// Node-local files (liveness sidecars, stamps, mutex, lock/tmp leftovers) are
// excluded on the same path as derived state, and unlike derived state there is
// no flag to include them: they are never anyone's change (WS-884).
const isDerived = (f) => SHARED_DERIVED.includes(f) || isNodeLocal(f);

// ─── stage ──────────────────────────────────────────────────────────────────

/**
 * Classify every changed file as mine / foreign / UNKNOWN / derived.
 *
 * THE THREE-WAY SPLIT IS THE WHOLE POINT (WS-565). The first cut had two
 * buckets, and everything not provably foreign fell into `mine`. That is the
 * identical fail-open WS-564 exists to remove — absence of evidence rendered as
 * an all-clear — and it survived inside the tool built to fix it. Caught within
 * hours, by another session running `stage --dry-run` as CLAUDE.md now directs:
 * of eight proposed files, five were not its own. Four were untracked benchmark
 * specs written by a session in a different repo; one was a template rewritten
 * by a script. Nothing in the output marked any of them as uncertain.
 *
 * The buckets, and the evidence each requires:
 *
 *   mine     POSITIVE record: the file is in this session's own `files_locked`,
 *            written by `record` (PostToolUse) or by a previous `stage`.
 *   foreign  PROOF of non-ownership: a peer holds a lock on it, it is a peer's
 *            registry record, or its mtime predates this session's start.
 *   unknown  Neither. Untracked files nobody recorded, script output, work from
 *            before the recorder was wired. Excluded by default and REPORTED,
 *            because the honest answer is "cannot tell", and a staging proposal
 *            without its conditioning set is not reviewable — the same argument
 *            WS-564 makes about claim_conflicts.
 *
 * `cannot_tell` (whole-session) is separate and stronger: this process cannot
 * identify itself at all, so nothing can be classified. Unprovable solitude is
 * what burned 2026-08-01.
 */
function classifyChanges(ctx, opts = {}) {
  const files = changedFiles(ctx.root);
  const startMs = sessionStartMs(ctx.wsDir, ctx.sessionId);
  const cannotTell = !ctx.sessionId || !startMs;

  const locks = ctx.wsDir ? listFileLocks(ctx.wsDir) : [];
  const heldByOther = new Map();
  const held = new Set();
  for (const h of locks) {
    if (h.session_id === ctx.sessionId) { for (const f of h.files) held.add(f); continue; }
    for (const f of h.files) heldByOther.set(f, h);
  }
  // A lock is a lease, not a deed. Nothing releases `files_locked` — a session
  // records a lock, commits its work, and ends, and the entry outlives it. Left
  // as-is, a DEAD peer's lock fences a file from every future session forever,
  // which is precisely the zombie failure WS-564 removed for claims and this
  // reintroduced for files. Found by dogfooding within the hour:
  // kit/scripts/cwos-verify.js was unstageable because a session that had
  // already committed its change to it still listed it.
  //
  // So liveness decides which bucket. A live holder is a real conflict; a dead
  // holder is evidence worth reading, not a veto — it demotes the file to
  // `unknown`, where it is reported and reviewable rather than silently skipped.
  // Files this session's own shell commands wrote. Local, per-node, never
  // visible to peers — see readTouchedLedger.
  const touched = ctx.wsDir ? readTouchedLedger(ctx.wsDir, ctx.sessionId) : new Set();

  const mine = [];
  const foreign = [];
  const unknown = [];
  const derived = [];
  for (const f of files) {
    if (isDerived(f)) { derived.push(f); continue; }

    // Only a LIVE peer outranks everything: someone may be mid-edit right now.
    const holder = heldByOther.get(f);
    if (holder && holder.live) { foreign.push({ file: f, why: `held by ${holder.session_id} (live)` }); continue; }
    if (peerSessionRecord(f, ctx.sessionId)) {
      foreign.push({ file: f, why: 'another session\'s registry record' });
      continue;
    }
    if (cannotTell) { unknown.push({ file: f, why: 'this session has no registry record' }); continue; }

    // Our own registry record is ours by construction (see below), and is
    // tested BEFORE the mtime rule: the record is written in the same breath
    // as its started_at, and Linux stamps files from a coarse clock that can
    // read a few ms behind Date.now(), so its mtime can land "before" the
    // session began and the session's own record blocked its own stash.
    if (ownSessionRecord(f, ctx.sessionId)) {
      mine.push({ file: f, why: 'this session\'s own registry record' });
      continue;
    }

    let mtime = null;
    try { mtime = fs.statSync(path.join(ctx.root, f)).mtimeMs; } catch { /* deleted */ }
    if (mtime != null && mtime < startMs) {
      foreign.push({ file: f, why: 'modified before this session started' });
      continue;
    }

    if (held.has(f)) { mine.push({ file: f, why: 'recorded in files_locked' }); continue; }
    if (touched.has(f)) { mine.push({ file: f, why: 'written by a command this session ran' }); continue; }
    // (Own registry record: handled above the mtime rule. Ours by construction
    // — the id in the path IS this session; the mirror of the peer test, and
    // without it every session leaves its own record stranded in `unknown`.)

    // A dead peer's lease reaches here only when WE have no record of our own.
    // Tested after the `mine` proofs on purpose: my live record outranks the
    // leftover entry of a session that has since committed and ended.
    if (holder) {
      unknown.push({ file: f, why: `held by ${holder.session_id}, which is no longer live — stale lease, verify before staging` });
      continue;
    }

    // Newer than our start, unheld, unrecorded. That is NOT evidence of
    // ownership — the four benchmark specs were exactly this shape.
    unknown.push({
      file: f,
      why: mtime == null ? 'deleted; no record' : 'no ownership record (untracked, or changed outside a recorded edit)',
    });
  }
  return {
    files, mine, foreign, unknown, derived,
    cannot_tell: cannotTell, session_start: startMs,
  };
}

/**
 * Files written by shell commands this session ran.
 *
 * WHY A SEPARATE, LOCAL LEDGER rather than more entries in `files_locked`
 * (WS-565 AC #3). Script output has no tool-call to hook: `cwos-reconcile.js`
 * rewriting a template is a Bash call, not an Edit, so no PostToolUse recorder
 * sees the file. Attributing it by time window is unavoidable, and a time window
 * is a guess — it will occasionally sweep in a file a peer wrote in the same few
 * seconds. Publishing a guess into `files_locked` would let this session BLOCK a
 * peer from staging their own work, which is strictly worse than the problem.
 *
 * So the ledger lives under `state/` — per-node, gitignored, rebuildable (ADR-058)
 * — and is read only by the session that wrote it. It can promote a file from
 * unknown to mine for ME; it can never demote anything for anyone else. A peer's
 * explicit lock still wins, because `heldByOther` is tested first.
 */
function touchedLedgerPath(wsDir, sessionId) {
  return path.join(wsDir, 'state', `session-touched-${sessionId}.json`);
}

function readTouchedLedger(wsDir, sessionId) {
  if (!sessionId) return new Set();
  try {
    const raw = fs.readFileSync(touchedLedgerPath(wsDir, sessionId), 'utf8');
    const j = JSON.parse(raw);
    return new Set(Array.isArray(j.files) ? j.files : []);
  } catch { return new Set(); }
}

/** Where `guard` stamps the moment a Bash command started, per session. */
function bashMarkPath(wsDir, sessionId) {
  return path.join(wsDir, 'state', `session-bashmark-${sessionId}.json`);
}

/**
 * PostToolUse Bash: everything in the tree whose mtime lands inside the window
 * the just-finished command occupied belongs to this session.
 *
 * The window comes from the mark `guard` wrote in PreToolUse, so it is the
 * command's actual duration rather than a fixed guess — seconds, usually
 * milliseconds. Files a peer happened to write inside that window are
 * mis-attributed, which is why this only ever lands in the LOCAL ledger and
 * never in `files_locked`: it can promote a file to mine for me, and can never
 * take one away from anyone else.
 */
function recordBashWindow(ctx) {
  if (!ctx.wsDir || !ctx.sessionId) return 0;
  let since = null;
  try { since = JSON.parse(fs.readFileSync(bashMarkPath(ctx.wsDir, ctx.sessionId), 'utf8')).at; } catch { /* no mark */ }
  if (!Number.isFinite(since)) return 0;

  const fresh = [];
  for (const f of changedFiles(ctx.root)) {
    if (isDerived(f) || peerSessionRecord(f, ctx.sessionId)) continue;
    try {
      // -50ms: a command that writes instantly can stamp a file a hair before
      // the mark's own write lands.
      if (fs.statSync(path.join(ctx.root, f)).mtimeMs >= since - 50) fresh.push(f);
    } catch { /* deleted */ }
  }
  if (!fresh.length) return 0;

  const p = touchedLedgerPath(ctx.wsDir, ctx.sessionId);
  const merged = new Set([...readTouchedLedger(ctx.wsDir, ctx.sessionId), ...fresh]);
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    writeFileAtomic(p, JSON.stringify({ session: ctx.sessionId, files: [...merged] }, null, 2) + '\n');
  } catch { /* best-effort — this is evidence, never a dependency */ }
  return 0;
}

/** PreToolUse Bash: stamp the start of the command, for recordBashWindow. */
function stampBashMark(ctx) {
  if (!ctx.wsDir || !ctx.sessionId) return;
  try {
    const p = bashMarkPath(ctx.wsDir, ctx.sessionId);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    writeFileAtomic(p, JSON.stringify({ session: ctx.sessionId, at: Date.now() }) + '\n');
  } catch { /* best-effort */ }
}

function cmdStage(ctx, values, paths) {
  const dry = values['dry-run'];
  const out = { staged: [], skipped: [], refused: [], derived_excluded: [] };

  let toStage;
  if (paths.length) {
    // Explicit paths: the founder (or the AI) named them, so the only question is
    // whether a LIVE peer holds one. A dead session's lock is history, not a veto.
    const conflicts = ctx.wsDir
      ? findFileLockConflicts(ctx.wsDir, ctx.sessionId, paths).filter((c) => c.live)
      : [];
    if (conflicts.length && !values.force) {
      out.refused = conflicts;
      report(values, out, ctx,
        `Refusing to stage ${conflicts.length} file(s) held by another LIVE session:\n`
        + conflicts.map((c) => `  ${c.file} — ${c.session_id}`).join('\n')
        + '\n\nCoordinate, or override with --force if you know the other session is done.');
      return 1;
    }
    toStage = paths.map((p) => String(p).split('\\').join('/'));
  } else {
    const cls = classifyChanges(ctx);
    if (cls.cannot_tell) {
      report(values, { ...out, cannot_tell: true }, ctx,
        'Cannot identify this session (no registry record), so ownership cannot be\n'
        + 'established. Failing closed rather than guessing — stage by explicit path:\n'
        + '  node kit/scripts/cwos-git.js stage <path> [<path> ...]');
      return 1;
    }
    // Only PROVEN ownership stages by default. `unknown` is reported, never
    // silently swept — WS-565.
    const takeUnknown = values['include-unknown'] || values.force;
    toStage = cls.mine.map((m) => m.file).concat(takeUnknown ? cls.unknown.map((u) => u.file) : []);
    out.evidence = cls.mine;
    out.skipped = cls.foreign;
    out.unknown = takeUnknown ? [] : cls.unknown;
    out.unknown_staged = takeUnknown ? cls.unknown : [];
    out.derived_excluded = cls.derived;
  }

  if (values['include-derived']) {
    const present = new Set(changedFiles(ctx.root));
    for (const d of SHARED_DERIVED) if (present.has(d)) toStage.push(d);
    out.derived_excluded = [];
  }

  if (!toStage.length) {
    report(values, out, ctx, 'Nothing to stage for this session.');
    return 0;
  }

  if (!dry) {
    // Chunked: a Windows command line caps out well before a large sweep does.
    for (let i = 0; i < toStage.length; i += 50) {
      const chunk = toStage.slice(i, i + 50);
      const r = runGit(['add', '--', ...chunk], { cwd: ctx.root, timeout: 30000 });
      if (!r.ok) {
        report(values, out, ctx, `git add failed: ${String(r.stderr).trim()}`);
        return 1;
      }
      out.staged.push(...chunk);
    }
    // Staging a file is an assertion of ownership — record it so a peer's guard
    // can SEE it rather than infer it from timestamps.
    if (ctx.wsDir && ctx.sessionId) lockFiles(ctx.wsDir, ctx.sessionId, out.staged);
  } else {
    out.staged = toStage;
  }

  // Every line carries the evidence that put the file where it is (WS-565 AC #4).
  const lines = [`${dry ? 'Would stage' : 'Staged'} ${out.staged.length} file(s) for ${ctx.sessionId || 'this session'}:`];
  for (const m of (out.evidence || []).slice(0, 30)) lines.push(`  ${m.file} — ${m.why}`);
  if ((out.evidence || []).length > 30) lines.push(`  ... and ${out.evidence.length - 30} more`);
  if (out.unknown_staged && out.unknown_staged.length) {
    lines.push(`Staged WITHOUT proof, on your instruction (${out.unknown_staged.length}):`);
    for (const u of out.unknown_staged.slice(0, 20)) lines.push(`  ${u.file} — ${u.why}`);
  }
  if (out.unknown && out.unknown.length) {
    lines.push(`UNKNOWN — cannot prove these are yours, so not staged (${out.unknown.length}):`);
    for (const u of out.unknown.slice(0, 20)) lines.push(`  ${u.file} — ${u.why}`);
    if (out.unknown.length > 20) lines.push(`  ... and ${out.unknown.length - 20} more`);
    lines.push('  Review them, then `git add <path>` the ones that are yours, or re-run');
    lines.push('  with --include-unknown to take the whole set.');
  }
  if (out.skipped.length) {
    lines.push(`Left alone — not this session's (${out.skipped.length}):`);
    for (const s of out.skipped.slice(0, 20)) lines.push(`  ${s.file} — ${s.why}`);
    if (out.skipped.length > 20) lines.push(`  ... and ${out.skipped.length - 20} more`);
  }
  if (out.derived_excluded.length) {
    lines.push(`Shared derived state excluded (${out.derived_excluded.length}) — reconcile rebuilds it; --include-derived to override:`);
    for (const d of out.derived_excluded) lines.push(`  ${d}`);
  }
  report(values, out, ctx, lines.join('\n'));
  return 0;
}

// ─── record (hook entry) ────────────────────────────────────────────────────

/**
 * Note that this session modified these files.
 *
 * Wired as a PostToolUse hook on Edit|Write|NotebookEdit, this is what gives
 * `files_locked` a live writer — the field has existed in the session schema
 * since adoption with zero writers anywhere in the kit, which is the same shape
 * WS-533 diagnosed for `claimed_by` and fixed only for items.
 *
 * OWNERSHIP FOLLOWS THE FILE, NOT THE CWD. The first cut of this resolved one
 * workstream dir from process.cwd() and recorded everything there, which is
 * wrong for the founder's normal pattern: a session whose cwd is repo A editing
 * files in repo B. It showed up within hours — three benchmark specs were
 * written into HomeBase's tree by a session running in claude-poker-tracker, and
 * HomeBase's scoped staging classified all three as MINE, because no lock named
 * them and their mtime was newer than my session start. Both ownership arms
 * blind, on the exact cross-repo case the fleet produces daily.
 *
 * So files are grouped by the workstream dir that CONTAINS them, and each group
 * is recorded against that repo's registry. If the session has no record there,
 * one is minted — a session editing repo B's files is working in repo B, and B's
 * gate, guard and staging all need to be able to see it. The mint deliberately
 * does NOT move B's `.current-session` pointer: registering an identity is a
 * fact, claiming to be the session in that repo is not.
 */
function cmdRecord(ctx, values, paths) {
  if (values['bash-window']) return recordBashWindow(ctx);

  let files = paths.slice();
  if (!files.length) {
    // Hook payload on stdin: { tool_input: { file_path | notebook_path | edits } }
    try {
      const raw = fs.readFileSync(0, 'utf8');
      if (raw && raw.trim()) {
        const p = JSON.parse(raw);
        const ti = (p && p.tool_input) || {};
        for (const k of ['file_path', 'notebook_path', 'path']) {
          if (ti[k]) files.push(String(ti[k]));
        }
      }
    } catch { /* not a hook invocation */ }
  }
  if (!files.length) return 0; // silent: a hook must never be noisy

  // (wsDir, repoRoot) -> { wsDir, repoRoot, files[] }
  //
  // Keyed on the PAIR, not on wsDir alone. One registry legitimately receives
  // files from several roots now — the primary tree and every linked worktree
  // redirect to the same wsDir — and keying on wsDir alone would report all of
  // them under whichever root happened to be seen first.
  const groups = new Map();
  const unplaceable = [];
  for (const f of files) {
    const abs = path.isAbsolute(f) ? f : path.resolve(ctx.root || process.cwd(), f);
    let wsDir;
    try { wsDir = findWorkstreamDir(path.dirname(abs)); } catch { continue; } // not a CWOS repo
    // NOT `path.resolve(wsDir, '..', '..')`. wsDir has ALREADY redirected to the
    // primary tree for a linked worktree, so relativising against it makes every
    // worktree path start with `..` and get dropped — FND-141, which left
    // `files_locked` empty for 15 of 16 checkouts. The registry stays wsDir;
    // only the relativisation base changes.
    const repoRoot = repoRootForPath(abs);
    if (!repoRoot) { unplaceable.push([abs, 'no .git found above it']); continue; }
    const rel = path.relative(repoRoot, abs).split('\\').join('/');
    if (!rel || rel.startsWith('..')) { unplaceable.push([abs, `resolves outside ${repoRoot}`]); continue; }
    const key = `${wsDir}\u0000${repoRoot}`;
    if (!groups.has(key)) groups.set(key, { wsDir, repoRoot, files: [] });
    groups.get(key).files.push(rel);
  }

  // COULD NOT LOOK is not NOTHING TO RECORD. Dropping these silently is how the
  // defect above survived: a path that cannot be placed and a run with no work
  // to do both returned 0 with no output, and the second reading was always the
  // one taken. Never fatal — a hook must not fail a turn — but never silent.
  for (const [file, why] of unplaceable) {
    process.stderr.write(`cwos-git record: DEGRADED — could not place ${file} (${why}); ownership not recorded\n`);
  }

  const recorded = [];
  for (const g of groups.values()) {
    // create: true — a foreign session editing this repo must become visible in
    // it. pointer: false — see resolveSessionId; minting an identity is not the
    // same as claiming to be this repo's current session.
    const sessionId = resolveSessionId(g.wsDir, { create: true, pointer: false });
    if (!sessionId) continue;
    const held = lockFiles(g.wsDir, sessionId, g.files);
    recorded.push({ repo: g.repoRoot.split('\\').join('/'), session: sessionId, files: g.files, held: held.length });
  }

  // Emitted even when empty, and BEFORE the early return that used to precede
  // it: `--json` previously printed nothing at all on a run that placed no
  // files, so a caller could not distinguish "no output" from "not run".
  if (values.json) {
    process.stdout.write(JSON.stringify({ recorded, unplaceable: unplaceable.map(([f, w]) => ({ file: f, why: w })) }, null, 2) + '\n');
  } else if (!values.quiet) {
    for (const r of recorded) process.stdout.write(`recorded ${r.files.length} file(s) for ${r.session} in ${r.repo}\n`);
  }
  return 0;
}

// ─── locks ──────────────────────────────────────────────────────────────────

function cmdLocks(ctx, values) {
  const holders = ctx.wsDir ? listFileLocks(ctx.wsDir) : [];
  if (values.json) {
    process.stdout.write(JSON.stringify({ session: ctx.sessionId, holders }, null, 2) + '\n');
    return 0;
  }
  if (!holders.length) {
    process.stdout.write('No file locks held.\n');
    return 0;
  }
  for (const h of holders) {
    // The invoking process is live BY DEFINITION — it is running. Reporting the
    // current session as "NOT heartbeating" (which it does whenever a turn takes
    // longer than the staleness window, or the founder walks away mid-session) is
    // alarming and false, and it is the kind of noise that gets a tool ignored.
    const me = h.session_id === ctx.sessionId;
    const state = me ? 'this session' : (h.live ? 'live' : 'NOT heartbeating');
    process.stdout.write(`${h.session_id} — ${state}${h.host ? ` on ${h.host}` : ''}\n`);
    for (const f of h.files.slice(0, 40)) process.stdout.write(`  ${f}\n`);
    if (h.files.length > 40) process.stdout.write(`  ... and ${h.files.length - 40} more\n`);
  }
  return 0;
}

// ─── guard (PreToolUse hook) ────────────────────────────────────────────────

/**
 * Refuse a tree-wide stage/stash while the tree holds work that is not ours.
 *
 * Promoted from claude-poker-tracker's repo-local `.claude/hooks/git-guard.cjs`,
 * which proved the shape in production. Its documented gap — "a session that
 * started BEFORE ours and edits AFTER we began is invisible to both arms" — is
 * closed here by the third arm, `files_locked`, which now has a live writer.
 *
 * Blocking is the recoverable direction: `git add <path>` is never blocked, and
 * a commit spanning three workstreams is what makes a defect unattributable
 * later. Reads the hook payload on stdin; exit 2 blocks, exit 0 allows.
 */
function cmdGuard(ctx, values) {
  let command = '';
  let payloadCwd = null;
  try {
    const raw = fs.readFileSync(0, 'utf8');
    if (raw && raw.trim()) {
      const p = JSON.parse(raw);
      command = (p.tool_input || {}).command || '';
      if (typeof p.cwd === 'string' && p.cwd) payloadCwd = p.cwd;
      // The harness hands a hook its session id on stdin (WS-1140). The
      // environment variable context() resolved from is not guaranteed in a
      // hook process, and without it an adopted repo's session — registered by
      // agent_session_id like every other — never resolved here, so every
      // stash and tree-wide stage failed closed. Same resolver, same rule
      // (no pointer fallback once an identity is in hand); a payload id that
      // matches nothing leaves the context()'s answer standing.
      if (typeof p.session_id === 'string' && p.session_id) {
        ctx.agentId = p.session_id;
        if (ctx.wsDir) ctx.sessionId = resolveSessionId(ctx.wsDir, { create: false, agentId: p.session_id }) || ctx.sessionId;
      }
    }
  } catch { return 0; } // unparseable payload: not our business

  // Every Bash call, not just the sweeps: mark when this command began so the
  // PostToolUse pass can attribute whatever it writes. Script output has no
  // tool-call of its own to hook (WS-565).
  stampBashMark(ctx);

  if (!String(command).trim()) return 0;
  // Where the command starts: --repo-root pins it; otherwise the hook payload's
  // cwd (the session's shell), else this process's.
  const start = values['repo-root'] ? ctx.root
    : (payloadCwd && fs.existsSync(payloadCwd) ? payloadCwd : process.cwd());
  // The legacy verdict is the floor. Only a refusal is ever revisited, and only
  // a command proven to be made of safe shapes can turn it into an allow.
  let v = legacyVerdict(command, ctx);
  if (v.code) v = relaxVerdict(command, start, ctx) || v;
  for (const line of v.lines) process.stderr.write(line + '\n');
  return v.code;
}

function samePath(a, b) {
  const n = (p) => { const r = path.resolve(p); return process.platform === 'win32' ? r.toLowerCase() : r; };
  return n(a) === n(b);
}

/**
 * The context a git command must be judged in: the repo it RUNS in. A stage in
 * another repo is judged against that repo's tree and sessions, never this one's.
 * null = nothing to protect there (not a git repo, or not a CWOS repo, so no
 * sessions are recorded in it). An unknowable directory (dir null) is judged
 * against this tree, as the guard always did.
 */
function targetContext(ctx, dir) {
  if (dir == null) return ctx;
  const root = repoRootForPath(path.join(dir, '.cwos-probe'));
  if (!root) return null;
  if (samePath(root, ctx.root)) return ctx;
  let wsDir = null;
  try { wsDir = findWorkstreamDir(root); } catch { return null; }
  // findWorkstreamDir walks upward; a plain repo nested under a CWOS repo must
  // not borrow its parent's registry. A linked worktree's registry is its main tree's.
  const owner = path.resolve(wsDir, '..', '..');
  const info = describeTree(root);
  if (!samePath(owner, root) && !(info.linked && info.mainTree && samePath(owner, info.mainTree))) return null;
  return { root, wsDir, sessionId: resolveSessionId(wsDir, { create: false, agentId: ctx.agentId || null }), elsewhere: true };
}

/** Verdict on a tree-wide stage/stash: { code: 0|2, lines } — printed by the caller. */
function guardSweep(ctx, { stash = false } = {}) {
  const cls = classifyChanges(ctx);
  const peers = ctx.wsDir ? listLiveSessions(ctx.wsDir, ctx.sessionId) : [];
  if (!cls.foreign.length && !peers.length && !cls.cannot_tell) return { code: 0, lines: [] };

  const lines = [];
  const say = (s) => lines.push(s);
  say('BLOCKED: tree-wide staging would capture work that is not this session\'s.');
  if (ctx.elsewhere) say(`(judged against ${ctx.root}, the repo the command runs in)`);
  say('');
  if (cls.foreign.length) {
    say(`Not this session's (${cls.foreign.length}):`);
    for (const f of cls.foreign.slice(0, 30)) say(`  ${f.file} — ${f.why}`);
    if (cls.foreign.length > 30) say(`  ... and ${cls.foreign.length - 30} more`);
    say('');
  }
  if (peers.length) {
    say(`Sessions live right now (${peers.length}) — possibly mid-edit:`);
    for (const p of peers) {
      const items = p.claimed_items.length ? ` holds ${p.claimed_items.join(', ')}` : '';
      say(`  - ${p.id}${items} (heartbeat ${p.last_heartbeat || 'never'})`);
    }
    say('');
  }
  if (cls.cannot_tell) {
    say('This process has no resolvable session record, so ownership cannot be');
    say('established at all. Failing closed rather than guessing.');
    say('A session is registered at SessionStart (cwos-session-register.js) or,');
    say('failing that, at its first tool call (cwos-lease-check.js pre) — both');
    say('wired by kit/scripts/install-claude-hooks.mjs. Or register by hand:');
    say('  node kit/scripts/cwos-session-register.js --quiet');
    say('');
  }
  say('Stage your own files — never blocked:');
  say('  node kit/scripts/cwos-git.js stage        # everything provably yours');
  say('  git add <path> [<path> ...]               # or by explicit path');
  if (stash) {
    say('Stash your own files — never blocked (a bare stash takes the whole tree,');
    say('a live peer\'s untracked record and the shared event log included):');
    say('  git stash push -u -m "<msg>" -- <path> [<path> ...]');
  }
  say('');
  const stale = ctx.wsDir ? staleActiveSessions(ctx.wsDir, { selfId: ctx.sessionId }) : [];
  if (stale.length) {
    say(`${stale.length} stale 'active' record(s) inflate this. Close them with /session-end, or:`);
    say('  node kit/scripts/cwos-session-recovery.js --auto');
  }
  return { code: 2, lines };
}

/**
 * The commit half of the guard (WS-534): block a plain `git commit` only when
 * the index holds a file that is provably another session's.
 *
 * Deny on proof, warn on doubt. `foreign` (a live peer's lock, a peer's registry
 * record, a change older than this session) blocks. A session that cannot
 * identify itself WARNS rather than blocks: every commit in an unregistered repo
 * would otherwise stop, and WS-534's rule is that a missing registry degrades to
 * a warning — never to a silent allow, never to a wall.
 */
function guardCommit(ctx) {
  const r = runGit(['diff', '--cached', '--name-only', '-z'], { cwd: ctx.root, timeout: 15000 });
  if (!r.ok) return { code: 0, lines: [] };
  const staged = new Set(String(r.stdout).split('\0').filter(Boolean).map((p) => p.split('\\').join('/')));
  if (!staged.size) return { code: 0, lines: [] };

  const lines = [];
  const say = (s) => lines.push(s);
  const cls = classifyChanges(ctx);
  if (cls.cannot_tell) {
    say(`WARNING: committing ${staged.size} staged file(s) with no session record — cannot`);
    say('tell whether another session staged any of them. Check `git diff --cached --stat`.');
    return { code: 0, lines };
  }
  const fromMerge = mergeArrivals(ctx.root);
  const theirs = cls.foreign.filter((f) => staged.has(f.file) && !(fromMerge && fromMerge.has(f.file)));
  if (!theirs.length) return { code: 0, lines: [] };

  say('BLOCKED: the index holds staged work that is not this session\'s — a plain');
  say('`git commit` would ship it under this session\'s message.');
  say('');
  say(`Staged, not this session's (${theirs.length}):`);
  for (const f of theirs.slice(0, 30)) say(`  ${f.file} — ${f.why}`);
  if (theirs.length > 30) say(`  ... and ${theirs.length - 30} more`);
  say('');
  say('Commit only your own files — never blocked:');
  say('  git commit -m "<msg>" -- <path> [<path> ...]');
  say('If a file listed above IS yours, name it in that path list.');
  return { code: 2, lines };
}

/**
 * Files a merge in progress put in the index (2026-11-01): null when no merge is
 * in progress, else the set of staged paths that came from committed history.
 *
 * Bringing a PR branch up to date (`git merge origin/master`) stages every file
 * master changed. Those files carry master's newer mtimes, peers' session records
 * and paths a live peer has locked, so the guard read them as another session's
 * work and refused the merge commit. Its suggested way out,
 * `git commit -- <paths>`, is refused by git itself during a merge. So the guard
 * blocked every branch catch-up, and that is the commonest repair for a DIRTY PR.
 *
 * Proof, not a guess: git's own merge of HEAD and MERGE_HEAD is recomputed
 * (`merge-tree --write-tree`), and a staged file counts as arriving with the
 * merge only when its staged content is byte-identical to that result, or when
 * that file conflicted (its content is the committer's resolution of two
 * committed sides). A file someone staged on top of the merge differs from the
 * result and is still judged as before. An octopus merge, or a git too old to
 * recompute the merge, gets no exemption (null).
 */
function mergeArrivals(root) {
  const mh = runGit(['rev-parse', '-q', '--verify', 'MERGE_HEAD^{commit}'], { cwd: root, timeout: 5000 });
  if (!mh.ok) return null;
  const heads = String(mh.stdout).trim().split(/\s+/).filter(Boolean);
  if (heads.length !== 1) return null;
  const mt = runGit(['merge-tree', '--write-tree', '--name-only', '-z', 'HEAD', heads[0]], { cwd: root, timeout: 30000 });
  // Exit 1 = the merge has conflicts, which is the case this exists for.
  if (mt.code !== 0 && mt.code !== 1) return null;
  const parts = String(mt.stdout || '').split('\0');
  const tree = parts[0];
  if (!/^[0-9a-f]{40,64}$/.test(tree)) return null;
  const conflicted = [];
  for (let i = 1; i < parts.length && parts[i] !== ''; i++) conflicted.push(parts[i]);
  const staged = runGit(['diff', '--cached', '--name-only', '-z'], { cwd: root, timeout: 15000 });
  const differs = runGit(['diff-index', '--cached', '--name-only', '-z', tree], { cwd: root, timeout: 15000 });
  if (!staged.ok || !differs.ok) return null;
  const norm = (p) => p.split('\\').join('/');
  const off = new Set(String(differs.stdout).split('\0').filter(Boolean).map(norm));
  const out = new Set(conflicted.map(norm));
  for (const f of String(staged.stdout).split('\0').filter(Boolean).map(norm)) if (!off.has(f)) out.add(f);
  return out;
}

// ─── worktree ───────────────────────────────────────────────────────────────

/**
 * Isolation for unattended runs (WS-564 AC #10).
 *
 * POLICY. An interactive session works in the main tree: the founder is watching,
 * and visibility is the right tool — seeing another session's changes in
 * `git status` is information, not contention. An UNATTENDED run (HomeBase-
 * dispatched autopilot, /fleet-run, a scheduled cycle) has nobody watching, runs
 * for hours, and stages repeatedly. That is where a shared tree stops being
 * visibility and becomes a race, so it gets its own worktree.
 *
 * WORKTREES CARRY CODE, THE MAIN TREE OWNS STATE (WS-532, made structural by
 * WS-576). `.claude/workstream/` is tracked, so a worktree checks out its own
 * forked copy — but `findWorkstreamDir` now resolves to the PRIMARY worktree's
 * copy from anywhere, including from inside a linked worktree. There is exactly
 * one queue, one event log, one set of claims regardless of which checkout you
 * are standing in.
 *
 * WS-575: this comment used to prescribe pointing every state command back at
 * the main tree explicitly, appending a "workstream-dir" argument naming the
 * main tree's .claude/workstream to a cwos-next gate call.
 *
 * cwos-next has never accepted that argument — zero occurrences — and
 * under ADR-063 an unrecognised flag is fatal (exit 2). So the recipe did not
 * silently do the wrong thing; it hard-failed, which means it had almost
 * certainly never been run. The flag is deliberately NOT being added: WS-576
 * removed the need for it, and adding it would create a second way to be right
 * that every future script must remember to support.
 *
 * A worktree-resident process finds the right state directory without being
 * told. Just invoke the script.
 */
const MARKER = '.cwos-worktree.json';

/** The primary checkout, from anywhere — including from inside a linked worktree. */
function mainTreeOf(root) {
  const info = describeTree(root);
  return info.linked && info.mainTree ? path.resolve(info.mainTree) : root;
}

/**
 * The branch work merges back into. Adopted repos use `main` as often as
 * `master`, and the merge-back instructions used to hard-code `master`.
 * origin/HEAD first (what the remote calls default), then a local main/master,
 * then whatever the main tree has checked out.
 */
function defaultBranch(root) {
  const ref = runGit(['symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD'], { cwd: root, timeout: 15000 });
  if (ref.ok && String(ref.stdout).trim()) return String(ref.stdout).trim().replace(/^origin\//, '');
  for (const b of ['main', 'master']) {
    if (runGit(['rev-parse', '--verify', '--quiet', `refs/heads/${b}`], { cwd: root, timeout: 15000 }).ok) return b;
  }
  const head = runGit(['symbolic-ref', '--quiet', '--short', 'HEAD'], { cwd: root, timeout: 15000 });
  return head.ok && String(head.stdout).trim() ? String(head.stdout).trim() : null;
}

/** `.cwos-config.yaml` → `worktree.link_ignored: [paths]`. Absent = []. */
function readWorktreeConfig(root) {
  const cfg = readYAMLFile(path.join(root, '.cwos-config.yaml'));
  const wt = cfg && cfg.ok && cfg.data && cfg.data.worktree;
  const list = wt && wt.link_ignored;
  return Array.isArray(list) ? list.map((x) => String(x).trim()).filter(Boolean) : [];
}

const hasEntries = (d) => { try { return fs.readdirSync(d).length > 0; } catch { return false; } };

/**
 * Give a fresh worktree the slash commands the main tree has.
 *
 * Where `.claude/commands/` is TRACKED (adopted repos) git already put it there.
 * Where it is gitignored (HomeBase) it is absent until rebuilt. HomeBase ships
 * cwos-node-bootstrap.js for that; adopted repos do not (kit/manifest-exclusions.yaml
 * keeps it HomeBase-side), and telling them to run it was a MODULE_NOT_FOUND on
 * every create. So this does the job itself and never prints a command the repo
 * cannot run: bootstrap if the worktree has it, otherwise copy the main tree's.
 */
function ensureCommands(main, dir) {
  const rel = '.claude/commands';
  const dst = path.join(dir, '.claude', 'commands');
  if (hasEntries(dst)) return { how: 'present' };
  const src = path.join(main, '.claude', 'commands');
  if (!hasEntries(src)) return { how: 'none' };
  const bootstrap = path.join(dir, 'kit', 'scripts', 'cwos-node-bootstrap.js');
  if (fs.existsSync(bootstrap) && fs.existsSync(path.join(dir, 'fleet', 'registry.yaml'))) {
    runNode(bootstrap, ['--skip-tools'], { cwd: dir, timeout: 60000 });
    if (hasEntries(dst)) return { how: 'bootstrap' };
  }
  try {
    fs.cpSync(src, dst, { recursive: true });
    return { how: 'copied', provisioned: { path: rel, how: 'copy' } };
  } catch (e) {
    return { how: 'failed', why: e.message, src, dst };
  }
}

/**
 * Bring declared git-ignored paths (db/.env, lean/.lake/packages, built assets)
 * from the main tree into the worktree. Git carries tracked files; nothing
 * carries ignored ones, and a worktree without them fails in ways that look like
 * code defects. Files are COPIED (small, and a file symlink needs privilege on
 * Windows); directories are LINKED (junction on Windows), because they are the
 * large ones. Only ignored paths qualify: anything else travels with git.
 */
function provisionIgnored(main, dir, rels) {
  const provisioned = [];
  const skipped = [];
  for (const raw of rels) {
    const rel = raw.split('\\').join('/').replace(/\/+$/, '');
    if (!rel || path.isAbsolute(rel) || /^[a-zA-Z]:/.test(rel) || rel.split('/').includes('..')) {
      skipped.push({ path: raw, why: 'must be a repo-relative path without ..' });
      continue;
    }
    const src = path.join(main, rel);
    const dst = path.join(dir, rel);
    let st;
    try { st = fs.statSync(src); } catch { skipped.push({ path: rel, why: 'not present in the main tree' }); continue; }
    if (fs.existsSync(dst)) { skipped.push({ path: rel, why: 'already present in the worktree' }); continue; }
    const probe = st.isDirectory() ? `${rel}/` : rel;
    if (runGit(['check-ignore', '-q', '--', probe], { cwd: main, timeout: 15000 }).code !== 0) {
      skipped.push({ path: rel, why: 'not git-ignored, so git already decides whether it travels' });
      continue;
    }
    try {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      if (st.isDirectory()) {
        fs.symlinkSync(src, dst, process.platform === 'win32' ? 'junction' : 'dir');
        provisioned.push({ path: rel, how: 'link' });
      } else {
        fs.copyFileSync(src, dst);
        provisioned.push({ path: rel, how: 'copy' });
      }
    } catch (e) {
      skipped.push({ path: rel, why: e.message });
    }
  }
  return { provisioned, skipped };
}

/**
 * Undo provisionIgnored/ensureCommands before removal. A LINK is unlinked, never
 * recursed into — deleting through a junction would delete the main tree's copy.
 */
function unprovision(dir, entries) {
  for (const e of entries || []) {
    if (!e || typeof e.path !== 'string' || e.path.split('/').includes('..')) continue;
    const p = path.join(dir, e.path);
    let st;
    try { st = fs.lstatSync(p); } catch { continue; }
    try {
      if (st.isSymbolicLink()) {
        try { fs.unlinkSync(p); } catch { fs.rmdirSync(p); }
      } else if (e.how === 'copy') {
        fs.rmSync(p, { recursive: true, force: true });
      }
    } catch { /* left for git to report */ }
  }
}

/**
 * The marker is cwos-git's own file; git must never count it as the user's
 * untracked work, or `worktree remove` refuses the worktree it just made.
 * info/exclude lives in the COMMON git dir, shared by every worktree.
 */
function excludeMarker(dir) {
  const r = runGit(['rev-parse', '--git-common-dir'], { cwd: dir, timeout: 15000 });
  if (!r.ok) return;
  const p = path.join(path.resolve(dir, String(r.stdout).trim()), 'info', 'exclude');
  let text = '';
  try { text = fs.readFileSync(p, 'utf8'); } catch { /* none yet */ }
  const line = `/${MARKER}`;
  if (text.split(/\r?\n/).includes(line)) return;
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    writeFileAtomic(p, `${text}${text && !text.endsWith('\n') ? '\n' : ''}${line}\n`);
  } catch { /* remove still deletes the marker itself */ }
}

function isRegistered(main, dir) {
  const r = runGit(['worktree', 'list', '--porcelain'], { cwd: main, timeout: 15000 });
  if (!r.ok) return true; // cannot tell: assume it is, and say nothing rash
  return String(r.stdout).split(/\r?\n/).some((l) => l.startsWith('worktree ') && samePath(l.slice(9), dir));
}

function cmdWorktree(ctx, values, positionals) {
  const action = positionals[0] || 'list';
  const topic = positionals[1];
  // Always the PRIMARY tree: run from inside a worktree, ctx.root is that
  // worktree, and wt-<topic> under it does not exist (or would nest).
  const main = mainTreeOf(ctx.root);

  if (action === 'list') {
    const r = runGit(['worktree', 'list'], { cwd: main, timeout: 15000 });
    process.stdout.write(r.ok ? r.stdout : `worktree list failed: ${r.stderr}\n`);
    return r.ok ? 0 : 1;
  }

  if (action === 'remove') {
    if (!topic) { process.stderr.write('worktree remove needs a <topic>\n'); return 2; }
    const dir = path.join(main, '.claude', 'worktrees', `wt-${topic}`);
    if (!fs.existsSync(dir) && !isRegistered(main, dir)) {
      process.stderr.write(`no worktree wt-${topic} under ${path.join(main, '.claude', 'worktrees')}\n`);
      return 1;
    }
    // Stand outside it. On Windows a process whose cwd is inside a directory
    // locks it, and git then unregisters the worktree but cannot delete it.
    try { process.chdir(main); } catch { /* best-effort */ }

    const markerPath = path.join(dir, MARKER);
    let marker = null;
    try { marker = JSON.parse(fs.readFileSync(markerPath, 'utf8')); } catch { /* none, or not ours */ }
    if (!marker || marker.kind !== 'cwos-worktree') marker = null;

    // Judge cleanliness OURSELVES first, ignoring our own marker, so a refusal
    // leaves the worktree exactly as it was (marker, links and copies intact).
    const ours = ((marker && marker.provisioned) || []).map((e) => String(e.path || ''));
    if (!values.force && fs.existsSync(dir)) {
      const st = runGit(['status', '--porcelain', '--ignore-submodules=none'], { cwd: dir, timeout: 30000 });
      const dirty = st.ok ? String(st.stdout).split(/\r?\n/).filter((l) => l && l.slice(3) !== MARKER
        && !ours.some((o) => l.slice(3) === o || l.slice(3).startsWith(o + '/'))) : [];
      if (dirty.length) {
        process.stderr.write(`worktree remove refused: wt-${topic} has uncommitted changes:\n`
          + dirty.slice(0, 20).map((l) => `  ${l}\n`).join('')
          + 'Commit or discard them first; --force removes the worktree and discards them.\n');
        return 1;
      }
    }
    if (marker) unprovision(dir, marker.provisioned);
    try { fs.unlinkSync(markerPath); } catch { /* absent */ }

    const r = runGit(['worktree', 'remove', ...(values.force ? ['--force'] : []), dir], { cwd: main, timeout: 30000 });
    if (!r.ok) {
      if (!isRegistered(main, dir) && fs.existsSync(dir)) {
        try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }); } catch { /* below */ }
      }
      if (fs.existsSync(dir) || isRegistered(main, dir)) {
        if (!isRegistered(main, dir)) {
          process.stderr.write(`worktree wt-${topic} was unregistered, but its folder could not be deleted:\n  ${dir}\n`
            + 'A process has its current directory inside it (usually a shell). cd out of it,\n'
            + `e.g. \`cd "${main}"\`, then delete the folder.\n`);
        } else {
          process.stderr.write(`worktree remove failed: ${String(r.stderr).trim()}\n`);
          if (marker) {
            try { writeFileAtomic(markerPath, JSON.stringify(marker, null, 2) + '\n'); } catch { /* best-effort */ }
          }
        }
        return 1;
      }
    }
    const br = runGit(['branch', '-d', `wt/${topic}`], { cwd: main, timeout: 15000 });
    process.stdout.write(`removed worktree wt-${topic}\n`);
    if (!br.ok && runGit(['rev-parse', '--verify', '--quiet', `refs/heads/wt/${topic}`], { cwd: main }).ok) {
      process.stdout.write(`kept branch wt/${topic}: ${String(br.stderr).trim().split('\n')[0]}\n`);
    }
    return 0;
  }

  if (action !== 'create') {
    process.stderr.write(`unknown worktree action: ${action} (create|list|remove)\n`);
    return 2;
  }
  if (!topic || !/^[a-z0-9][a-z0-9-]*$/i.test(topic)) {
    process.stderr.write('worktree create needs a <topic> of [a-z0-9-]\n');
    return 2;
  }

  const dir = path.join(main, '.claude', 'worktrees', `wt-${topic}`);
  if (fs.existsSync(dir)) {
    process.stderr.write(`worktree already exists: ${dir}\n`);
    return 1;
  }
  const add = runGit(['worktree', 'add', dir, '-b', `wt/${topic}`], { cwd: main, timeout: 60000 });
  if (!add.ok) {
    process.stderr.write(`worktree add failed: ${String(add.stderr).trim()}\n`);
    return 1;
  }
  const base = defaultBranch(main);
  excludeMarker(dir);
  const commands = ensureCommands(main, dir);
  const links = provisionIgnored(main, dir, readWorktreeConfig(main));

  // The marker is what makes the isolation contract legible from inside the
  // worktree — including to a session that did not create it.
  const marker = {
    kind: 'cwos-worktree',
    topic,
    branch: `wt/${topic}`,
    main_tree: main.split('\\').join('/'),
    default_branch: base,
    workstream_dir: path.join(main, '.claude', 'workstream').split('\\').join('/'),
    created_by_session: ctx.sessionId || null,
    created_at: new Date().toISOString(),
    provisioned: [...(commands.provisioned ? [commands.provisioned] : []), ...links.provisioned],
    contract: 'Code lives here. Workstream state lives in main_tree — run /next, /workstream, '
            + '/pulse and any event-emitting command from there (see docs/worktree-isolation.md).',
  };
  try { fs.writeFileSync(path.join(dir, MARKER), JSON.stringify(marker, null, 2) + '\n'); }
  catch { /* non-fatal */ }

  if (values.json) {
    process.stdout.write(JSON.stringify({ ...marker, commands: commands.how, link_skipped: links.skipped }, null, 2) + '\n');
    return 0;
  }
  const cmdLine = commands.how === 'failed'
    ? `Slash commands: could NOT be copied (${commands.why}). Copy them by hand:\n`
      + `  cp -r "${commands.src}" "${path.dirname(commands.dst)}"`
    : {
      present: 'Slash commands: already in the worktree (tracked by git).',
      none: 'Slash commands: the main tree has none, so there is nothing to set up.',
      bootstrap: 'Slash commands: rebuilt in the worktree by cwos-node-bootstrap.js.',
      copied: 'Slash commands: copied from the main tree (.claude/commands/ is gitignored here).',
    }[commands.how];
  const b = base || '<your main branch>';
  const out = [
    `Created worktree ${dir} on branch wt/${topic}.`,
    '',
    'Code goes here. Workstream state stays in the main tree — but since WS-576',
    'that is automatic: state commands run from inside this worktree resolve to',
    `  ${path.join(main, '.claude', 'workstream')}`,
    'on their own. Invoke them normally; no flag is needed or accepted.',
    '',
    cmdLine,
  ];
  if (links.provisioned.length) {
    out.push('', 'Git-ignored paths brought in from the main tree (.cwos-config.yaml worktree.link_ignored):');
    for (const p of links.provisioned) out.push(`  ${p.path} (${p.how === 'link' ? 'linked' : 'copied'})`);
  }
  if (links.skipped.length) {
    out.push('', 'Declared in worktree.link_ignored but NOT brought in:');
    for (const s of links.skipped) out.push(`  ${s.path} — ${s.why}`);
  }
  out.push(
    '',
    `Merge back, from the MAIN tree with ${b} checked out (a branch cannot be checked out twice):`,
    `  git -C "${dir}" rebase ${b}`,
    `  git merge --ff-only wt/${topic}`,
    `  node kit/scripts/cwos-git.js worktree remove ${topic}`,
    '',
  );
  process.stdout.write(out.join('\n'));
  return 0;
}

// ─── output ─────────────────────────────────────────────────────────────────

function report(values, payload, ctx, text) {
  if (values.json) {
    process.stdout.write(JSON.stringify({ session: ctx.sessionId, ...payload }, null, 2) + '\n');
  } else if (!values.quiet) {
    process.stdout.write(text + '\n');
  }
}

// ─── entry ──────────────────────────────────────────────────────────────────

function main() {
  const { values, positionals, sub } = cliGate(process.argv.slice(2), CLI);
  const ctx = context(values);

  switch (sub) {
    case 'stage':    return cmdStage(ctx, values, positionals);
    case 'record':   return cmdRecord(ctx, values, positionals);
    case 'locks':    return cmdLocks(ctx, values);
    case 'guard':    return cmdGuard(ctx, values);
    case 'worktree': return cmdWorktree(ctx, values, positionals);
    default:         return 2;
  }
}

module.exports = {
  SHARED_DERIVED, classifyChanges, changedFiles,
  tokenizeShell, proveSafe, defaultBranch, readWorktreeConfig,
};

if (require.main === module) {
  try {
    process.exit(main());
  } catch (err) {
    // `guard` runs as a PreToolUse hook: a crash here must not block every Bash
    // call in the session, so it fails OPEN and says why. Every other subcommand
    // is invoked deliberately and reports the failure honestly.
    const isGuard = process.argv[2] === 'guard';
    process.stderr.write(`cwos-git: ${err.message}\n`);
    process.exit(isGuard ? 0 : 1);
  }
}
