#!/usr/bin/env node
/**
 * cwos-worker-guard — the mechanical half of a worker's limits.
 *
 * /get-to-work runs the session as an orchestrator and hands bounded work to
 * `worker` subagents (personas/execution/worker.md). A worker starts with a
 * fresh context: it sees its brief, never the conversation that produced it.
 * Prose telling a worker what it may not do is the tier that measurably fails
 * (DEC-092), so the limits live here, in two halves:
 *
 *   check     PreToolUse hook, wired in the worker's own frontmatter so it runs
 *             only while a worker runs. stdin = hook JSON. Exit 0 = allow,
 *             exit 2 = refuse; stderr is shown to the worker.
 *   snapshot  Orchestrator, BEFORE dispatch: record HEAD, branch, stash count
 *             and the hash of every dirty/untracked file.
 *   delta     Orchestrator, AFTER the worker returns: what changed since the
 *             snapshot, split into in-scope / out-of-scope / touched-someone-
 *             else's, plus any HEAD, branch or stash movement. Exit 1 on any
 *             violation. It reverts nothing — it prints the exact revert
 *             commands for files the worker created out of scope, and never
 *             offers to revert a file that was already dirty before dispatch.
 *
 * What `check` refuses (allowlists, not denylists — anything unrecognised in a
 * git, gh or kit-script position is refused, because a worker that needs it can
 * report the step and the orchestrator can do it):
 *   - git: everything except read-only subcommands and restoring EXPLICIT files.
 *   - gh: everything except reads (view/list/status/diff/checks, GET api calls).
 *   - kit scripts (cwos-*.js): everything except a short read-only list, and
 *     any of them with --help.
 *   - writes to protected paths, whether by Edit/Write or by shell (redirect,
 *     rm/mv/cp/tee/sed -i/..., inline python/node): .git/, .claude/workstream/,
 *     .claude/settings*.json, .claude/agents/, .claude/hooks/,
 *     system/decisions.md, this guard, and secret-shaped files.
 *
 * Commands are tokenised with quoting respected and split on && || ; | & $( `,
 * so `grep -rn "git push" docs` is a grep, not a push, and `sh -c "git push"`
 * is a push. File scope per brief is delta's job — a hook cannot see the brief.
 *
 *   - network senders (WS-1230): curl, wget, nc, ssh, scp, sftp, ftp, telnet,
 *     mail, bitsadmin, certutil -urlcache, openssl s_client, rsync to a host,
 *     registry writes (npm/pnpm/yarn/bun publish, login, ...), web cmdlets in
 *     PowerShell, and inline code (node -e, python -c, ...) that opens a
 *     connection or starts programs. Sending to a person or calling out is never
 *     a worker's job.
 *   - anything it cannot read before it runs (WS-1230): a program name computed
 *     at run time ($x, $(...) or backticks in command position), a shell,
 *     PowerShell or interpreter reading commands from a pipe, heredoc or
 *     here-string, encoded or run-time-built PowerShell, `env -S`, and git
 *     options or environment variables through which git or a program runs
 *     another command (core.fsmonitor, --upload-pack, GIT_SSH_COMMAND, ...).
 *     A sender denylist alone can always be routed around; this rule is what
 *     makes the list worth having. Wrappers (env, nice, timeout, exec, start,
 *     winpty, cmd /c, npx, npm exec, pnpm dlx, ...) are unwrapped, flag values
 *     included, and the command they run is judged.
 *
 * `check` fails open on a payload it cannot parse, like every kit hook (AS-23).
 * It does NOT fail open when the guard itself cannot run: the worker's hook is
 * `... check || exit 2`, so a missing script, a crash or an old Node refuses,
 * and the bare `check` path loads only Node builtins, so editing lib/preflight
 * or lib/cli cannot switch it off (WS-1230).
 *
 * Residual, stated: a script the worker wrote and runs (node x.js, python x.py)
 * can still send. The worker's prompt states the rule and the orchestrator
 * reads the diff; a hook cannot judge what an arbitrary program will do.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DEFAULT_SNAPSHOT = '.claude/.tmp-worker-snapshot.json';

const CLI = {
  name: 'cwos-worker-guard',
  summary: 'limits for worker subagents: a PreToolUse refusal hook, and a before/after diff the orchestrator verifies with',
  usage: 'cwos-worker-guard <check|snapshot|delta> [options] [scope paths...]',
  subcommands: {
    check: 'PreToolUse hook: read hook JSON on stdin; exit 0 allow, exit 2 refuse (reason on stderr)',
    snapshot: 'before dispatch: record HEAD, branch, stash count and every dirty file\'s hash',
    delta: 'after the worker: compare with the snapshot against the brief\'s scope paths; exit 1 on a violation',
  },
  flags: {
    json: { type: 'boolean', describe: 'delta: machine-readable output' },
  },
  notes: [
    'Run snapshot and delta from the same WORKDIR (main tree or worktree). snapshot also',
    `starts a fresh write ledger (${'.claude/.tmp-worker-writes.json'}) that the check hook appends to.`,
    'delta scope paths are repo-relative files, or directories ending in "/".',
    'Example:  cwos-worker-guard snapshot  ...dispatch...  cwos-worker-guard delta src/a.js tests/',
  ],
};

// ─── tokenising ──────────────────────────────────────────────────────────────

/** Split a shell command into segments of words, respecting quotes. Redirect
 *  targets are reported separately. Approximate by design: unknown shapes are
 *  judged by the rules below, which refuse what they do not recognise. */
/** Drop heredoc bodies — they are data (`cat > notes.md <<EOF` ... `git push` ... `EOF`). */
function stripHeredocs(cmd) {
  const lines = String(cmd).split('\n');
  const kept = [];
  for (let i = 0; i < lines.length; i++) {
    kept.push(lines[i]);
    const m = lines[i].match(/<<-?\s*(['"]?)([A-Za-z_]\w*)\1/);
    if (!m) continue;
    while (i + 1 < lines.length && lines[i + 1].trim() !== m[2]) i++;
    i++; // the terminator line
  }
  return kept.join('\n');
}

function segments(cmd) {
  cmd = stripHeredocs(cmd);
  const out = [];
  let words = [];
  let redirects = [];
  let cur = '';
  let has = false;
  let quote = null;
  let pendingRedirect = false;
  let piped = false;       // this segment reads the previous one's output (`a | b`)
  const endWord = () => {
    if (!has) return;
    if (pendingRedirect) { redirects.push(cur); pendingRedirect = false; } else words.push(cur);
    cur = ''; has = false;
  };
  const endSeg = () => {
    endWord();
    if (words.length || redirects.length) out.push({ words, redirects, piped });
    words = []; redirects = []; piped = false;
  };
  // A substitution in COMMAND position (`$(echo curl) x`, `` `echo curl` x ``) names a
  // program only at run time; the guard cannot read it, so it refuses (WS-1230).
  out.computedCommand = false;
  const atCommandPosition = () => !words.length && !has;
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i];
    if (quote) {
      if (c === quote) { quote = null; continue; }
      if (c === '\\' && quote === '"' && i + 1 < cmd.length) { cur += cmd[++i]; continue; }
      cur += c; continue;
    }
    if (c === '\'' || c === '"') { quote = c; has = true; continue; }
    if (c === '\\' && i + 1 < cmd.length) { cur += cmd[++i]; has = true; continue; }
    if (c === ' ' || c === '\t') { endWord(); continue; }
    if (c === '`' && atCommandPosition()) out.computedCommand = true;
    if (c === '\n' || c === ';' || c === '`' || c === '(' || c === ')') { endSeg(); continue; }
    if (c === '$' && cmd[i + 1] === '(') { if (atCommandPosition()) out.computedCommand = true; endSeg(); i++; continue; }
    if (c === '&' || c === '|') {
      const doubled = cmd[i + 1] === c;
      if (doubled) i++;
      if (c === '&' && cmd[i - 1] === '>') continue; // `>&2`
      endSeg();
      if (c === '|' && !doubled) piped = true;   // the segment that starts now is fed by a pipe
      continue;
    }
    if (c === '>') {
      // `2>`/`&>` prefixes: drop a pending fd number
      if (/^\d+$/.test(cur)) { cur = ''; has = false; }
      endWord();
      if (cmd[i + 1] === '>') i++;
      if (cmd[i + 1] === '&') { i++; while (/\d/.test(cmd[i + 1] || '')) i++; continue; } // `>&2` — not a file
      pendingRedirect = true;
      continue;
    }
    cur += c; has = true;
  }
  endSeg();
  return out;
}

const base = (w) => path.basename(String(w).replace(/\\/g, '/')).toLowerCase().replace(/\.exe$/, '');

// ─── protected paths ─────────────────────────────────────────────────────────

const PROTECTED = [
  [/(?:^|\/)\.git(?:\/|$)/i, '.git/ is never edited by hand'],
  [/(?:^|\/)\.claude\/workstream(?:\/|$)/i, 'workstream state is written by the orchestrator, from the main tree'],
  [/(?:^|\/)\.claude\/settings(?:\.local)?\.json$/i, 'harness settings are the founder\'s'],
  [/(?:^|\/)\.claude\/(?:agents|hooks)(?:\/|$)/i, 'agent definitions and hooks — including your own limits — are the orchestrator\'s'],
  [/(?:^|\/)kit\/scripts\/cwos-worker-guard\.js$/i, 'this guard is the orchestrator\'s'],
  [/(?:^|\/)\.claude\/\.tmp-worker-[^/]*$/i, 'the dispatch snapshot and write ledger are the orchestrator\'s'],
  [/(?:^|\/)system\/decisions\.md$/i, 'decisions are recorded by the orchestrator — put the decision in your report'],
];

function normPath(p) {
  let s = String(p || '').replace(/\\/g, '/').replace(/\/{2,}/g, '/');
  if (!s) return '';
  s = path.posix.normalize(s);
  return s === '.' ? '' : s;
}

function isSecretName(name) {
  if (/(?:example|sample|template|dist)/i.test(name)) return false;
  return /^\.env(?:\..+)?$/i.test(name)
    || /\.(?:pem|key|p12|pfx)$/i.test(name)
    || /^id_(?:rsa|ed25519|ecdsa|dsa)(?:\.|$)/i.test(name)
    || /^credentials(?:[.-][\w.-]*)?\.json$/i.test(name);
}

/** Reason string if writing to `p` is out of bounds for a worker, else null. */
function protectedReason(p, opts = {}) {
  let n = normPath(p);
  if (!n) return null;
  if (opts.cwd && !n.startsWith('/') && !/^[a-z]:/i.test(n)) n = normPath(path.posix.join(opts.cwd, n));
  for (const [re, reason] of PROTECTED) if (re.test(n)) return reason;
  if (!opts.dirsOnly && isSecretName(path.posix.basename(n))) return 'secret-shaped files are out of bounds for workers';
  return null;
}

// ─── git ─────────────────────────────────────────────────────────────────────

const GIT_READ = new Set([
  'status', 'diff', 'log', 'show', 'blame', 'annotate', 'grep', 'ls-files', 'ls-tree', 'ls-remote',
  'rev-parse', 'rev-list', 'merge-base', 'cat-file', 'describe', 'shortlog', 'for-each-ref', 'name-rev',
  'check-ignore', 'check-attr', 'check-ref-format', 'diff-tree', 'diff-files', 'diff-index', 'whatchanged',
  'range-diff', 'help', 'version', 'var', 'count-objects', 'show-ref', 'show-branch', 'cherry',
  'verify-commit', 'verify-tag', 'fsck', 'format-patch', 'fetch',
]);
const GIT_VALUE_OPTS = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path', '--super-prefix', '--config-env']);
const BRANCH_LIST_OPTS = new Set(['-a', '-r', '-l', '--list', '-v', '-vv', '--verbose', '--all', '--remotes',
  '--show-current', '--contains', '--no-contains', '--merged', '--no-merged', '--points-at', '--sort',
  '--format', '--color', '--no-color', '--column', '--no-column', '-q', '--quiet', '-i', '--ignore-case', '--abbrev', '--no-abbrev']);
const BRANCH_VALUE_OPTS = new Set(['--contains', '--no-contains', '--merged', '--no-merged', '--points-at', '--sort', '--format']);
const TAG_LIST_FIRST = ['-l', '--list', '-n', '--contains', '--no-contains', '--points-at', '--merged', '--no-merged', '--sort', '--format', '-v', '--verify', '--column'];

/** Explicit file paths only: no whole-tree or directory restores. */
function explicitFiles(paths) {
  if (!paths.length) return false;
  for (const p of paths) {
    if (p === '.' || p === '..' || p.startsWith(':') || /[*?[]/.test(p) || p.endsWith('/')) return false;
    try { if (fs.statSync(p).isDirectory()) return false; } catch { /* a deleted file is fine to restore */ }
  }
  return true;
}

// Config keys and options through which git runs another program — `git -c
// core.fsmonitor="curl x" status` and `git ls-remote --upload-pack="curl x" .` both
// execute, under subcommands that are otherwise reads (WS-1230).
const GIT_EXEC_KEY = /^(?:alias\.|core\.(?:fsmonitor|sshcommand|pager|editor|hookspath|askpass|gitproxy|alternaterefscommand)|diff\.external|diff\..+\.(?:textconv|command)|merge\..+\.driver|filter\.|protocol\.|credential\.|gpg\.|sequence\.editor|uploadpack\.|receivepack\.|remote\..+\.(?:uploadpack|receivepack|proxy|vcs)|https?\.|url\.|include\.|includeif\.|pager\.|interactive\.difffilter|web\.browser|browser\.)/i;
const GIT_EXEC_OPT = /^(?:--upload-pack|--receive-pack|--exec|--open-files-in-pager|--ext-diff|--textconv)(?:=|$)/;
const GIT_EXEC = 'a git option that makes git run another program cannot be judged — refused';

function checkGit(args) {
  let i = 0;
  for (; i < args.length; i++) {
    const a = args[i];
    if (GIT_VALUE_OPTS.has(a)) {
      if (a === '-c' && GIT_EXEC_KEY.test(args[i + 1] || '')) return GIT_EXEC;
      if (a === '--config-env') return GIT_EXEC;
      i++; continue;
    }
    if (/^-c.+/.test(a) && GIT_EXEC_KEY.test(a.slice(2))) return GIT_EXEC;
    if (/^--(?:config-env|exec-path)=/.test(a)) return GIT_EXEC;
    if (a.startsWith('-')) continue;
    break;
  }
  const sub = (args[i] || '').toLowerCase();
  const rest = args.slice(i + 1);
  if (rest.some((a) => GIT_EXEC_OPT.test(a)) || (['ls-remote', 'fetch', 'grep'].includes(sub) && rest.some((a) => a === '-u' || a === '-O' || /^-O./.test(a)))) return GIT_EXEC;
  if (!sub || GIT_READ.has(sub)) return null;

  const OWN = 'changing git history, the index, refs, branches or a remote is the orchestrator\'s job';
  switch (sub) {
    case 'checkout': {
      const dd = rest.indexOf('--');
      const before = dd === -1 ? rest : rest.slice(0, dd);
      const ok = dd !== -1 && (before.length === 0 || (before.length === 1 && before[0] === 'HEAD'));
      return ok && explicitFiles(rest.slice(dd + 1)) ? null
        : 'only `git checkout -- <file>...` (explicit files) is allowed; switching branches or restoring whole directories touches other sessions\' work';
    }
    case 'restore': {
      const files = [];
      for (const a of rest) {
        if (a === '--') continue;
        if (a.startsWith('-')) {
          if (!['-W', '--worktree', '-q', '--quiet'].includes(a)) return 'only `git restore <file>...` on explicit files is allowed (no --source, --staged or patch modes)';
        } else files.push(a);
      }
      return explicitFiles(files) ? null : 'only `git restore <file>...` on explicit files is allowed, never a directory or the whole tree';
    }
    case 'branch': {
      let listing = false;
      for (let k = 0; k < rest.length; k++) {
        const a = rest[k];
        if (a.startsWith('-')) {
          const b = a.split('=')[0];
          if (!BRANCH_LIST_OPTS.has(b)) return OWN;
          if (b === '-l' || b === '--list') listing = true;
          if (BRANCH_VALUE_OPTS.has(b) && !a.includes('=')) k++;
        } else if (!listing) return OWN;
      }
      return null;
    }
    case 'tag':
      return !rest.length || TAG_LIST_FIRST.includes(rest[0].split('=')[0]) ? null : OWN;
    case 'stash':
      return ['list', 'show'].includes(rest[0]) ? null : OWN;
    case 'worktree':
      return rest[0] === 'list' ? null : OWN;
    case 'notes':
      return ['show', 'list'].includes(rest[0]) ? null : OWN;
    case 'reflog':
      return ['expire', 'delete'].includes(rest[0]) ? OWN : null;
    case 'remote':
      return !rest.length || ['-v', '--verbose', 'show', 'get-url'].includes(rest[0]) ? null : OWN;
    case 'submodule':
      return rest[0] === 'status' ? null : OWN;
    case 'config': {
      if (rest.some((a) => /^--(?:unset|add|replace-all|edit|rename-section|remove-section)/.test(a) || a === '-e')) return 'git config writes are the founder\'s';
      const reads = rest.some((a) => ['--get', '--get-all', '--get-regexp', '--list', '-l', '--get-urlmatch'].includes(a));
      const positional = rest.filter((a) => !a.startsWith('-'));
      return reads || positional.length === 1 ? null : 'git config writes are the founder\'s';
    }
    case 'apply':
      // A patch can write any path, protected ones included, and the hook cannot
      // read it; workers edit with Edit/Write, which the hook does judge (WS-1230).
      // `--apply` turns applying back on after an inspect flag (`--stat --apply` writes),
      // and git takes any unique prefix of it (`--ap`, `--app`, `--appl`).
      return rest.some((a) => ['--check', '--stat', '--numstat', '--summary'].includes(a)) && !rest.some((a) => /^--ap(?:p(?:ly?)?)?$/.test(a)) ? null
        : 'only `git apply --check|--stat|--numstat|--summary` is allowed — a patch can write protected paths the hook cannot see; make the edits with Edit/Write';
    default:
      return `\`git ${sub}\` is not on a worker's read-only list — ${OWN}`;
  }
}

// ─── gh ──────────────────────────────────────────────────────────────────────

const GH_READ_VERBS = new Set(['view', 'list', 'status', 'diff', 'checks', 'watch']);

function checkGh(args) {
  const pos = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-R' || a === '--repo') { i++; continue; }
    if (a.startsWith('-')) continue;
    pos.push(a);
  }
  const [s1, s2] = pos;
  if (!s1 || ['help', 'version', 'search', 'status'].includes(s1)) return null;
  if (s1 === 'auth') return s2 === 'status' ? null : 'gh auth changes are the founder\'s';
  if (s1 === 'api') {
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      const m = a.match(/^(?:-X|--method)(?:=|)(.*)$/);
      if (m) {
        const v = (m[1] || args[i + 1] || '').toUpperCase();
        if (v && v !== 'GET') return 'write calls through the GitHub API are the orchestrator\'s job';
      }
      if (/^(?:-f|-F|--field|--raw-field|--input)(?:=|$)/.test(a)) return 'write calls through the GitHub API are the orchestrator\'s job';
    }
    return null;
  }
  return GH_READ_VERBS.has(s2) ? null : `\`gh ${s1} ${s2 || ''}\` is not a read — publishing through gh is the orchestrator's job`;
}

// ─── kit scripts ─────────────────────────────────────────────────────────────

const has = (rest, ...flags) => rest.some((a) => flags.includes(a.split('=')[0]));
const KIT_READ = {
  'cwos-autonomous-gate.js': (r) => !has(r, '--override-vitals'),
  'cwos-verify.js': (r) => !has(r, '--fix', '--fix-hardlinks'),
  'cwos-dispatch-ledger.js': (r) => r[0] === 'report',
  'cwos-hash-manifest.js': (r) => has(r, '--check'),
  'cwos-manifest-deps-validate.js': () => true,
  'cwos-manifest-completeness.js': () => true,
  'cwos-declaration-liveness.js': () => true,
  'cwos-persona-quality.js': () => true,
  'cwos-guard.js': (r) => r[0] === 'budget',
  'cwos-runs.js': (r) => r[0] === 'find',
  'cwos-item.js': (r) => r[0] === 'show',
  'cwos-git.js': (r) => r[0] === 'locks' || (r[0] === 'worktree' && r[1] === 'list'),
  'cwos-worker-guard.js': (r) => r[0] === 'delta' || r[0] === 'check',
};

function checkNode(args) {
  const idx = args.findIndex((a) => /^cwos-[\w-]+\.js$/.test(base(a)));
  if (idx === -1) {
    const inline = args.findIndex((a) => a === '-e' || a === '--eval' || a === '-p' || a === '--print');
    if (inline !== -1) return inlineNet(args.slice(inline + 1)) || inlineProtected(args.slice(inline + 1));
    return null;
  }
  const script = base(args[idx]);
  const rest = args.slice(idx + 1);
  if (has(rest, '--help', '-h')) return null;
  const rule = KIT_READ[script];
  return rule && rule(rest) ? null
    : `\`${script}${rest[0] ? ' ' + rest[0] : ''}\` can write shared workstream state — report what you found and let the orchestrator run it`;
}

/** Inline code that opens a connection or starts other programs (WS-1230). A
 *  script FILE the worker wrote is the stated residual; inline code is readable. */
function inlineNet(words) {
  return words.some((w) => INLINE_NET.test(String(w))) ? SEND : null;
}

/** Inline code (`node -e`, `python -c`): only path-shaped tokens, only the
 *  protected-directory rules — `e.key` is a property, not a key file. */
function inlineProtected(words) {
  for (const w of words) {
    for (const tok of String(w).split(/[\s'"`(),;[\]{}+]+/)) {
      if (!tok.includes('/') && !tok.includes('\\')) continue;
      const r = protectedReason(tok, { dirsOnly: true });
      if (r) return `inline code that names a protected path: ${r}`;
    }
  }
  return null;
}

// ─── segment judgement ───────────────────────────────────────────────────────

// ─── network senders (WS-1230) ───────────────────────────────────────────────

// A denylist of senders can always be routed around (a variable, a wrapper, a pipe into
// a shell). So the rule is the guard's own: what it cannot read before it runs, it
// refuses (UNJUDGEABLE), and the sender list covers the plain spellings.
const SEND = 'sending to a person or calling out is the orchestrator\'s (or the founder\'s) — name the step under "Needs the orchestrator"';
const UNJUDGEABLE = 'a command the guard cannot read before it runs is refused — write it out plainly, or name the step under "Needs the orchestrator"';
const NETWORK = new Set(['curl', 'wget', 'nc', 'ncat', 'netcat', 'telnet', 'ssh', 'scp', 'sftp', 'ftp', 'tftp',
  'sendmail', 'mail', 'mailx', 'mutt', 'invoke-webrequest', 'iwr', 'invoke-restmethod', 'irm', 'send-mailmessage',
  'bitsadmin', 'aria2c', 'httpie', 'http', 'https', 'xh', 'socat', 'websocat']);
const POWERSHELLS = new Set(['powershell', 'pwsh']);
const PS_SENDERS = /\b(?:invoke-webrequest|iwr|invoke-restmethod|irm|send-mailmessage|net\.webclient|system\.net|net\.sockets|tcpclient|udpclient|start-bitstransfer|curl|wget|bitsadmin|certutil)\b/i;
// Code PowerShell builds or decodes at run time cannot be read in advance.
const PS_UNJUDGEABLE = /\b(?:invoke-expression|iex|invoke-command|icm|add-type|start-process|saps)\b|\[scriptblock\]|frombase64string|&\s*[($]|\.\s*\(/i;
const PUBLISHERS = new Set(['npm', 'pnpm', 'yarn', 'bun']);
// Registry writes: publishing, and the account and package ownership around it.
const REGISTRY_WRITES = new Set(['publish', 'unpublish', 'login', 'logout', 'adduser', 'add-user', 'deprecate',
  'dist-tag', 'owner', 'access', 'token', 'star', 'unstar', 'team', 'org', 'hook', 'profile']);
// Inline code that opens a connection, or starts other programs it could send with.
const INLINE_NET = /\b(?:fetch|XMLHttpRequest|WebSocket|urllib|http\.client|httplib|requests\.|aiohttp|httpx|smtplib|socket|ftplib|telnetlib|Net::HTTP|net\/https?|net\/smtp|LWP|IO::Socket|open-uri|child_process|subprocess|os\.system|os\.popen|spawn|execSync|Deno\.run)\b|https?:\/\/|require\(\s*['"](?:node:)?(?:https?|http2|net|tls|dgram)['"]|from\s+['"](?:node:)?(?:https?|http2|net|tls|dgram)['"]/i;
// Environment variables through which a program runs another command.
const EXEC_ENV = /^(?:GIT_SSH(?:_COMMAND)?|GIT_PROXY_COMMAND|GIT_EXTERNAL_DIFF|GIT_PAGER|PAGER|GIT_ASKPASS|SSH_ASKPASS|GIT_EDITOR|EDITOR|VISUAL|GIT_EXEC_PATH|GIT_CONFIG_PARAMETERS|GIT_CONFIG_COUNT|GIT_CONFIG_(?:KEY|VALUE)_\d+|GIT_CONFIG_GLOBAL|GIT_CONFIG_SYSTEM|LD_PRELOAD|DYLD_INSERT_LIBRARIES|NODE_OPTIONS|BASH_ENV|ENV|PROMPT_COMMAND|PERL5OPT|PYTHONSTARTUP|RUBYOPT)=/;

/** rsync is a local copier until one side names a host (`host:path`, `user@host:`, `rsync://`). */
const remoteTarget = (a) => /^rsync:\/\//i.test(a) || /^(?:[\w.-]+@)?[\w.-]+:(?!\\|\/\/)/.test(a) && !/^[a-z]:[\\/]/i.test(a);

const WRAPPERS = new Set(['env', 'command', 'exec', 'nohup', 'nice', 'time', 'sudo', 'builtin', 'stdbuf', 'timeout',
  'winpty', 'start', 'doas', 'chronic', 'unbuffer', 'setsid', 'ionice', 'taskset', 'chrt', 'caffeinate']);
// Wrapper flags that take a separate value, which must be skipped with them (`nice -n 5 curl`).
const WRAPPER_VALUE_FLAGS = {
  env: ['-u', '--unset', '-C', '--chdir'], nice: ['-n', '--adjustment'], timeout: ['-s', '--signal', '-k', '--kill-after'],
  exec: ['-a'], stdbuf: ['-i', '-o', '-e'], time: ['-f', '--format', '-o', '--output'],
  sudo: ['-u', '-g', '-C', '-h', '-p', '-U', '-r', '-t', '-D'], doas: ['-u', '-C'], ionice: ['-c', '-n', '-p'],
  taskset: ['-p'], chrt: ['-p'],
};
const PACKAGE_RUNNERS = new Set(['npx', 'pnpx', 'bunx']);
const RUNNER_SUBS = { npm: ['exec', 'x'], pnpm: ['dlx', 'exec'], yarn: ['dlx', 'exec'], bun: ['x'] };
const SHELLS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh']);
const WRITERS = new Set(['rm', 'rmdir', 'mv', 'cp', 'tee', 'truncate', 'ln', 'chmod', 'chown', 'touch', 'dd',
  'install', 'rsync', 'unlink', 'mkdir', 'shred', 'patch']);

function judgeWords(words, depth, cwd, seg = {}) {
  let w = words.slice();
  if (depth > 6) return 'nested commands too deep to judge';
  // strip env assignments and wrappers (`FOO=1 env timeout 5 git push`)
  for (;;) {
    if (!w.length) return null;
    if (EXEC_ENV.test(w[0])) return UNJUDGEABLE;
    if (/^[A-Za-z_]\w*=/.test(w[0])) { w.shift(); continue; }
    const b = base(w[0]);
    if (b === 'env' && w.some((a) => /^(?:-S|--split-string)(?:=|$)/.test(a))) return UNJUDGEABLE;
    if (WRAPPERS.has(b)) {
      const valued = WRAPPER_VALUE_FLAGS[b] || [];
      w.shift();
      while (w.length) {
        const o = w[0];
        if (b === 'start' && /^\//.test(o)) { w.shift(); continue; }        // `start /b /wait cmd`
        if (!o.startsWith('-')) {
          if ((b === 'timeout' || b === 'nice') && /^[\d.]+[smhd]?$/.test(o)) { w.shift(); continue; }
          break;
        }
        w.shift();
        if (valued.includes(o)) w.shift();
      }
      continue;
    }
    if (b === 'cmd') {                                  // `cmd /c x`, `cmd //c x`, `cmd.exe /K x`
      const ci = w.findIndex((a, k) => k > 0 && /^\/{1,2}[ck]$/i.test(a));
      if (ci === -1) return null;
      return judgeCommand(w.slice(ci + 1).join(' '), depth + 1, cwd);
    }
    // Registry writes first: `npm --registry x publish` must not read the value `x` as `npm x`.
    if (PUBLISHERS.has(b) && w.slice(1).some((a) => REGISTRY_WRITES.has(a))) return SEND;
    if (PACKAGE_RUNNERS.has(b) || (RUNNER_SUBS[b] && RUNNER_SUBS[b].includes(w.slice(1).find((a) => !a.startsWith('-'))))) {
      // a package runner runs the command after it (`npx curl`, `npm exec curl`, `pnpm dlx x`)
      if (!PACKAGE_RUNNERS.has(b)) w.splice(0, w.findIndex((a, k) => k > 0 && !a.startsWith('-')));
      w.shift();
      while (w.length && w[0].startsWith('-')) { const o = w.shift(); if (/^(?:-p|--package|-c|--call)$/.test(o)) w.shift(); }
      continue;
    }
    if (b === 'xargs') {
      w.shift();
      while (w.length && w[0].startsWith('-')) { const o = w.shift(); if (/^-[nLPsdIEa]$/.test(o)) w.shift(); }
      continue;
    }
    break;
  }
  // A program name that exists only at run time (`$x`, `${c}rl`) cannot be judged.
  if (/[$`]/.test(w[0])) return UNJUDGEABLE;
  const cmd = base(w[0]);
  const args = w.slice(1);
  // A shell or PowerShell reading its commands from stdin (a pipe, a heredoc, a
  // here-string, `-s`, `-`) runs text the guard never sees.
  const readsStdin = seg.piped || args.some((a) => /^<</.test(a) || a === '-s' || a === '-');

  if (SHELLS.has(cmd) || cmd === 'eval' || cmd === 'source' || cmd === '.') {
    if (cmd === 'source' || cmd === '.') return null;   // runs a script file: the stated residual
    const ci = cmd === 'eval' ? 0 : args.findIndex((a) => /^-[a-z]*c[a-z]*$/.test(a));
    if (cmd === 'eval' || ci !== -1) {
      const inner = cmd === 'eval' ? args.join(' ') : args[ci + 1] || '';
      return judgeCommand(inner, depth + 1, cwd);
    }
    return readsStdin ? UNJUDGEABLE : null;
  }
  if (NETWORK.has(cmd)) return SEND;
  if (cmd === 'certutil' && args.some((a) => /^[-/](?:urlcache|verifyctl|url|ping)$/i.test(a))) return SEND;
  if (cmd === 'openssl' && args.some((a) => /^(?:s_client|s_server|s_time|ocsp)$/.test(a))) return SEND;
  if (cmd === 'rsync' && args.some((a) => !a.startsWith('-') && remoteTarget(a))) return SEND;
  // Registry writes in ANY position: a value-taking flag or a workspace name can come
  // first (`npm --registry x publish`, `npm -w pkg publish`, `yarn npm publish`).
  if (PUBLISHERS.has(cmd) && args.some((a) => REGISTRY_WRITES.has(a))) return SEND;
  if (POWERSHELLS.has(cmd)) {
    // PowerShell takes any unique prefix of a parameter name: -e, -en, -enc ... -EncodedCommand.
    const pname = (a) => (/^[-/]/.test(a) ? a.slice(1).toLowerCase() : null);
    if (args.some((a) => { const p = pname(a); return p && (p === 'ec' || 'encodedcommand'.startsWith(p) || (p.length > 1 && 'encodedarguments'.startsWith(p))); })) return UNJUDGEABLE;
    if (readsStdin) return UNJUDGEABLE;
    const ci = args.findIndex((a) => { const p = pname(a); return p && (p === 'cwa' || 'command'.startsWith(p) || 'commandwithargs'.startsWith(p)); });
    const inner = ci === -1 ? args.join(' ') : args.slice(ci + 1).join(' ');
    if (PS_SENDERS.test(inner)) return SEND;
    if (PS_UNJUDGEABLE.test(inner)) return UNJUDGEABLE;
    return ci === -1 ? null : judgeCommand(inner, depth + 1, cwd);
  }
  if (cmd === 'git') return checkGit(args);
  if (cmd === 'gh') return checkGh(args);
  if (cmd === 'node' || cmd === 'nodejs') {
    if (readsStdin && !args.some((a) => !a.startsWith('-'))) return UNJUDGEABLE;   // `echo code | node`
    return checkNode(args);
  }
  if (/^(?:python\d?(?:\.\d+)?|py|perl|ruby|deno|bun)$/.test(cmd)) {
    const inline = args.findIndex((a) => /^-[a-z]*[ce]$/i.test(a) || a === 'eval');
    if (inline !== -1) return inlineNet(args.slice(inline + 1)) || inlineProtected(args.slice(inline + 1));
    if (readsStdin && !args.some((a) => !a.startsWith('-'))) return UNJUDGEABLE;   // `echo code | python`
    if (cmd === 'perl' && args.some((a) => /^-[a-z]*i/.test(a))) {
      for (const a of args) if (!a.startsWith('-')) { const r = protectedReason(a); if (r) return r; }
    }
    return null;
  }
  if (cmd === 'find') {
    const ex = args.findIndex((a) => a === '-exec' || a === '-execdir' || a === '-ok' || a === '-okdir');
    if (args.includes('-delete') || args.includes('-fprint')) {
      for (const a of args) if (!a.startsWith('-')) { const r = protectedReason(a, { cwd }); if (r) return r; }
    }
    if (ex !== -1) {
      const end = args.findIndex((a, k) => k > ex && (a === ';' || a === '+' || a === '\\;'));
      const inner = args.slice(ex + 1, end === -1 ? undefined : end);
      // the -exec command runs on the found paths: judge it on its own, and as a writer over them
      const r = judgeWords(inner, depth + 1, cwd);
      if (r) return r;
      if (WRITERS.has(base(inner[0] || '')) || base(inner[0] || '') === 'sed') {
        for (const a of args.slice(0, ex)) if (!a.startsWith('-')) { const r2 = protectedReason(a, { cwd }); if (r2) return r2; }
      }
    }
    return null;
  }
  const inPlace = (cmd === 'sed' && args.some((a) => /^-[a-z]*i|^--in-place/.test(a)))
    || ((cmd === 'awk' || cmd === 'gawk') && args.some((a, k) => a === 'inplace' && args[k - 1] === '-i'));
  if (WRITERS.has(cmd) || inPlace) {
    for (const a of args) {
      if (a.startsWith('-')) continue;
      const r = protectedReason(a, { cwd });
      if (r) return r;
    }
  }
  return null;
}

function judgeCommand(cmd, depth = 0, cwd = '') {
  // `cd` within one command carries into the segments after it, so
  // `cd .claude/workstream && echo x > queue/a.yaml` is judged on the real path.
  let dir = cwd;
  const segs = segments(String(cmd || ''));
  if (segs.computedCommand) return UNJUDGEABLE;
  for (const seg of segs) {
    if (base(seg.words[0] || '') === 'cd' || base(seg.words[0] || '') === 'pushd') {
      const to = seg.words.slice(1).find((a) => !a.startsWith('-')) || '';
      dir = /^(?:\/|[a-z]:)/i.test(to.replace(/\\/g, '/')) ? to : normPath(path.posix.join(dir || '', to));
      continue;
    }
    for (const target of seg.redirects) {
      const r = protectedReason(target, { cwd: dir });
      if (r) return r;
    }
    const r = judgeWords(seg.words, depth, dir, seg);
    if (r) return r;
  }
  return null;
}

const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);

/** Pure: hook input -> { block, reason }. Unknown tools are allowed (the worker's
 *  `tools:` allowlist already decides which tools exist for it). */
function evaluate(input) {
  if (!input || typeof input.tool_name !== 'string') return { block: false };
  const ti = input.tool_input && typeof input.tool_input === 'object' ? input.tool_input : {};
  let reason = null;
  if (input.tool_name === 'Bash') reason = judgeCommand(ti.command || '');
  else if (EDIT_TOOLS.has(input.tool_name)) reason = protectedReason(ti.file_path || ti.notebook_path || '');
  return reason ? { block: true, reason } : { block: false };
}

// ─── snapshot / write ledger / delta ─────────────────────────────────────────
//
// Attribution is the hard part. A shared checkout has other sessions writing
// while a worker runs, so "changed since the snapshot" is NOT "changed by the
// worker". The check hook therefore records every Edit/Write path it ALLOWS into
// a write ledger beside the snapshot, and delta offers a revert only for paths in
// that ledger. Anything else that changed is listed for an ownership check and
// never offered for revert. One orchestrator per checkout: a second session takes
// a worktree (/next Step 1), and each worktree has its own snapshot and ledger.

const LEDGER = '.claude/.tmp-worker-writes.json';   // JSON lines; *.json keeps it under .claude/.tmp-*.json ignores
const IGNORED = [/^\.claude\/workstream\//, /^\.claude\/\.tmp-/];   // peer churn / our own files — never judged

function git(root, args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? r.stdout : null;
}

function repoRoot() {
  const r = git(process.cwd(), ['rev-parse', '--show-toplevel']);
  if (!r) { process.stderr.write('cwos-worker-guard: not inside a git repository\n'); process.exit(2); }
  return r.trim();
}

/** Content fingerprint that cannot fail silently: a directory, link or unreadable
 *  file gets a marker, never null, so "unchanged" is only ever a real match. */
function fingerprint(abs) {
  let st;
  try { st = fs.lstatSync(abs); } catch { return 'absent'; }
  if (st.isDirectory()) return `dir:${st.mtimeMs}`;
  if (st.isSymbolicLink()) { try { return `link:${fs.readlinkSync(abs)}`; } catch { return 'link:?'; } }
  try { return 'sha1:' + require('crypto').createHash('sha1').update(fs.readFileSync(abs)).digest('hex'); } catch {
    return `unreadable:${st.size}:${st.mtimeMs}`;
  }
}

function takeSnapshot(root) {
  const files = {};
  const raw = git(root, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  if (raw === null) throw new Error('git status failed');
  const parts = raw.split('\0');
  for (let i = 0; i < parts.length; i++) {
    const e = parts[i];
    if (!e) continue;
    const xy = e.slice(0, 2);
    const p = e.slice(3);
    if (xy[0] === 'R' || xy[0] === 'C') i++; // the next entry is the rename source
    if (IGNORED.some((re) => re.test(p))) continue;
    files[p] = { xy, hash: fingerprint(path.join(root, p)) };
  }
  const stash = git(root, ['stash', 'list']);
  return {
    version: 2,
    taken_at: new Date().toISOString(),
    head: (git(root, ['rev-parse', 'HEAD']) || '').trim() || null,
    branch: (git(root, ['symbolic-ref', '--short', '-q', 'HEAD']) || '').trim() || null,
    stash_count: stash === null ? null : stash.split('\n').filter(Boolean).length,
    files,
  };
}

/** Hook side: note a path the worker was allowed to write. Never throws. */
function recordWrite(input) {
  try {
    const ti = input.tool_input || {};
    const raw = ti.file_path || ti.notebook_path;
    if (!raw) return;
    const abs = path.resolve(input.cwd || process.cwd(), String(raw));
    let dir = path.dirname(abs);
    for (let k = 0; k < 64; k++) {                      // nearest enclosing checkout (main tree or worktree)
      if (fs.existsSync(path.join(dir, '.git'))) break;
      const up = path.dirname(dir);
      if (up === dir) return;
      dir = up;
    }
    if (!fs.existsSync(path.join(dir, DEFAULT_SNAPSHOT))) return;   // no dispatch armed here
    const rel = path.relative(dir, abs).replace(/\\/g, '/');
    fs.appendFileSync(path.join(dir, LEDGER), JSON.stringify({
      ts: new Date().toISOString(), path: rel, tool: input.tool_name,
      session_id: input.session_id || null, agent_id: input.agent_id || null,
    }) + '\n');
  } catch { /* recording is best effort; delta treats unrecorded changes as unattributed */ }
}

function readLedger(root, since) {
  let raw = '';
  try { raw = fs.readFileSync(path.join(root, LEDGER), 'utf8'); } catch { return new Set(); }
  const out = new Set();
  for (const line of raw.split('\n')) {
    try { const e = JSON.parse(line); if (e && e.path && (!since || e.ts >= since)) out.add(e.path); } catch { /* skip */ }
  }
  return out;
}

function relScope(root, s) {
  let p = String(s).replace(/\\/g, '/');
  const r = root.replace(/\\/g, '/');
  if (p.toLowerCase().startsWith(r.toLowerCase() + '/')) p = p.slice(r.length + 1);
  const dir = p.endsWith('/');
  p = path.posix.normalize(p).replace(/^\.\//, '');
  return dir && !p.endsWith('/') ? p + '/' : p;
}

/** Pure: two snapshots + scope + the worker's recorded writes -> classification. */
function computeDelta(before, after, scope, written = new Set()) {
  const inScope = (p) => scope.some((s) => (s.endsWith('/') ? p.startsWith(s) : p === s));
  const out = { in_scope: [], out_of_scope_new: [], touched_preexisting: [], unattributed: [],
    head_moved: false, branch_changed: false, stash_changed: false };
  const paths = new Set([...Object.keys(before.files || {}), ...Object.keys(after.files || {})]);
  for (const p of [...paths].sort()) {
    if (IGNORED.some((re) => re.test(p))) continue;
    const b = before.files[p];
    const a = after.files[p];
    if (b && a && b.hash === a.hash && b.xy === a.xy) continue;
    if (inScope(p)) { out.in_scope.push(p); continue; }
    if (!written.has(p)) { out.unattributed.push(p); continue; }
    if (b) { out.touched_preexisting.push(p); continue; }
    const revert = a && a.xy === '??' ? `rm -- "${p}"` : `git checkout HEAD -- "${p}"`;
    out.out_of_scope_new.push({ path: p, revert });
  }
  out.head_moved = before.head !== after.head;
  out.branch_changed = before.branch !== after.branch;
  out.stash_changed = before.stash_count !== after.stash_count;
  out.ok = !out.out_of_scope_new.length && !out.touched_preexisting.length
    && !out.head_moved && !out.branch_changed && !out.stash_changed;
  return out;
}

function renderDelta(d, before, after) {
  const L = [];
  // The ledger sees only Edit/Write. A worker's shell commands (sed -i, cp, a script)
  // land in `unattributed` beside a peer's edits, so CLEAN never vouches for them (WS-1230).
  L.push(!d.ok ? 'worker delta: VIOLATIONS — do not accept this work as-is'
    : d.unattributed.length
      ? `worker delta: CLEAN for the worker's own edits — ${d.unattributed.length} change(s) made outside them (its shell commands or a peer): check ownership before accepting`
      : 'worker delta: CLEAN — every change the worker made is inside the declared scope');
  L.push(`  in scope (${d.in_scope.length}): ${d.in_scope.join(', ') || 'none'}`);
  const moved = [];
  if (d.head_moved) moved.push(`HEAD ${String(before.head).slice(0, 12)} -> ${String(after.head).slice(0, 12)}`);
  if (d.branch_changed) moved.push(`branch ${before.branch} -> ${after.branch}`);
  if (d.stash_changed) moved.push(`stash ${before.stash_count} -> ${after.stash_count}`);
  if (moved.length) {
    L.push(`  moved: ${moved.join('; ')}`);
    L.push('    a worker got past its limits OR a live peer session committed — check `git reflog -5` before anything else');
  }
  if (d.out_of_scope_new.length) {
    L.push(`  the worker wrote outside its scope (${d.out_of_scope_new.length}) — new since dispatch, safe to revert:`);
    for (const f of d.out_of_scope_new) L.push(`    ${f.revert}`);
  }
  if (d.touched_preexisting.length) {
    L.push(`  the worker wrote outside its scope into files that were ALREADY dirty (${d.touched_preexisting.length}) — never revert; someone else's work is in them:`);
    for (const p of d.touched_preexisting) L.push(`    ${p}`);
  }
  if (d.unattributed.length) {
    L.push(`  changed by someone, not by a worker edit (${d.unattributed.length}) — a live peer, or the worker's shell commands; check ownership, never revert blindly:`);
    for (const p of d.unattributed) L.push(`    ${p}`);
  }
  return L.join('\n') + '\n';
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

function parseHookInput(raw) {
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : null;
  } catch { return null; }
}

function runCheck() {
  const input = parseHookInput(readStdin());
  const verdict = evaluate(input);
  if (!verdict.block) {
    if (input && EDIT_TOOLS.has(input.tool_name)) recordWrite(input);
    process.exit(0);
  }
  process.stderr.write(
    `BLOCKED by worker limits: ${verdict.reason}.\n`
    + 'Do not retry this another way. Finish what your brief allows, then name this step\n'
    + 'in your report under "Needs the orchestrator" so it can be done there.\n',
  );
  process.exit(2);
}

function main() {
  // The hook's own path: Node builtins only, so no other kit file can switch the
  // guard off (WS-1230). Any flag (--help, a typo) goes through the CLI contract.
  const argv = process.argv.slice(2);
  if (argv.length === 1 && argv[0] === 'check') return runCheck();

  require('./lib/preflight');
  const { cliGate } = require('./lib/cli');
  const { values, positionals, sub } = cliGate(argv, CLI);

  if (sub === 'check') return runCheck();

  if (sub === 'snapshot' || sub === 'delta') {
    const root = repoRoot();
    const file = path.join(root, DEFAULT_SNAPSHOT);
    if (sub === 'snapshot') {
      const snap = takeSnapshot(root);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      // Atomic (INV-078): a torn snapshot would make the delta misattribute
      // every dirty file. skipSizeGate: each dispatch REPLACES both files, and
      // emptying the ledger is the point.
      const { writeFileAtomic } = require('./lib/cwos-utils');
      writeFileAtomic(file, JSON.stringify(snap, null, 1), { skipSizeGate: true });
      writeFileAtomic(path.join(root, LEDGER), '', { skipSizeGate: true });   // a fresh ledger per dispatch
      process.stdout.write(`snapshot: ${Object.keys(snap.files).length} dirty file(s), HEAD ${String(snap.head).slice(0, 12)} on ${snap.branch} — worker writes in ${root} are now recorded\n`);
      return;
    }
    let before;
    try { before = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {
      process.stderr.write(`cwos-worker-guard: no snapshot in ${root} — run \`snapshot\` from the same WORKDIR before dispatching\n`);
      process.exit(2);
    }
    const scope = (positionals || []).map((s) => relScope(root, s)).filter(Boolean);
    const after = takeSnapshot(root);
    const d = computeDelta(before, after, scope, readLedger(root, before.taken_at));
    process.stdout.write(values.json ? JSON.stringify({ scope, ...d }, null, 1) + '\n' : renderDelta(d, before, after));
    process.exit(d.ok ? 0 : 1);
  }

  process.stderr.write(`usage: ${CLI.usage}\n`);
  process.exit(2);
}

if (require.main === module) main();

module.exports = { evaluate, judgeCommand, protectedReason, segments, computeDelta, takeSnapshot, recordWrite, readLedger, DEFAULT_SNAPSHOT, LEDGER };
