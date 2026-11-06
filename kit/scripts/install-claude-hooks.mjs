#!/usr/bin/env node
/**
 * install-claude-hooks.mjs — wires the kit's Claude Code hooks into
 * .claude/settings.json. The sibling of install-git-hooks.sh, for the other
 * hook system (WS-1128).
 *
 * WHY THIS EXISTS
 *
 * Measured 2026-09-19: the kit ships 436 files and installs git hooks through a
 * dispatcher, but it had NO path at all for Claude Code hooks. `.claude/hooks/`
 * appears nowhere in the kit hash manifest. So a control written as a Claude Code
 * hook — the Stop hook that stops uncommitted work leaving a session, for one —
 * reached exactly the repo it was written in and no other.
 *
 * A kit file that ships but is never wired is the failure kit/declarations.yaml
 * was written about: declared, reported installed, consumed by nobody. Shipping
 * clean-tree-check.cjs into the kit without this installer would have reproduced
 * it precisely.
 *
 * WHY THE SESSION HOOKS ARE HERE (WS-514). Measured 2026-09-30: HomeBase runs
 * nine SessionStart hooks and a PreToolUse git guard; every adopted repo ran
 * none, because nothing but this file can wire a Claude Code hook and nothing
 * ran this file. ServeYourNote — the repo whose session broke on a missing
 * `.current-session` in July — still had no `.current-session` two months
 * later, although `cwos-session-register.js` had shipped to it. The fixes were
 * real and reached one repo. `/kit-upgrade` now runs this installer, so the
 * session hooks travel with the scripts they call.
 *
 * WHAT IT WILL NOT DO
 *
 * It APPENDS, with one exception named below. It never removes or reorders a
 * hook, and never rewrites a hook that runs the adopter's own code, because an
 * adopter's hook chain is their own and a kit upgrade is not a licence to edit
 * it. A hook is left alone when its script is already
 * wired under the same event — in settings.json OR settings.local.json, since
 * HomeBase and several adopters keep their chain in the local file and a second
 * copy in settings.json would run every hook twice. Re-running is a no-op.
 *
 * It never loses a hook to the JSON parser (2026-11-01). A settings file that
 * declares one `hooks.<Event>` key twice — a git merge leaves this — is read with
 * both lists joined, and written joined; a repeated key anywhere else makes it
 * refuse to touch the file. Before any write it checks that every hook the files
 * held is still present, verbatim or as the anchored/guarded kit form, and
 * refuses the write if one is not. See parseSettingsText() and lostHooks().
 *
 * It never wires a hook whose script is absent. A repo installed without the
 * workstream capability has no cwos-session-register.js, and a PreToolUse hook
 * pointing at a missing file errors on every Bash call.
 *
 * THE ONE REWRITE (WS-1093). A command that runs a KIT script by a path relative
 * to the working directory is re-anchored to the project directory, in whichever
 * of the two settings files holds it, whoever wired it. Only the script path
 * changes: flags, redirections and position stay. This is the single case where
 * leaving the adopter's text alone is the harmful choice — the hook silently
 * stops running after a `cd`. settings.local.json is therefore written too, and
 * comes back as 2-space JSON.
 *
 * THE SECOND REWRITE (WS-1140), by the same reasoning. A blocking kit hook
 * wired as a bare `node "<script>" <args>` is wrapped in a missing-script guard
 * (`test ! -f "<script>" || node "<script>" <args>`) so that a checkout without
 * kit/ — a worktree or cloud session in a repo that gitignores the kit — gets a
 * silent no-op instead of a hook error on every call, while a checkout WITH the
 * kit keeps the exit 2 that blocks. See guardCommand().
 *
 * THE THIRD REWRITE (WS-1362). When the kit widens a hook's matcher (WS-1226
 * added `clear` to three SessionStart hooks), a row the kit itself wrote at the
 * old matcher is widened in place. Only the block's `matcher` changes, only for a
 * row whose command IS the kit entry's (anchored/guarded form included), only
 * from a matcher an earlier kit wrote for that entry (`widensFrom`), only to a
 * strict superset of it, and only when every hook in the block is such a row. A
 * matcher the adopter chose, a block shared with another hook, or an adopter's
 * own flags on the kit script are left as they are and reported. A matcher is
 * never narrowed. Without this, "already wired" ignored the matcher and existing
 * installs never got `clear`.
 *
 * WHAT ANCHORING DOES NOT COVER. The commands need a POSIX shell, as they always
 * have (`2>/dev/null || true`). Where a harness runs hooks through PowerShell or
 * cmd, `${CLAUDE_PROJECT_DIR:-.}` is not expanded and an anchored command cannot
 * start at all, where the relative one started at the repo root. Other
 * harnesses' hook files (.codex/hooks.json) are not read or written here.
 *
 * Usage:
 *   node kit/scripts/install-claude-hooks.mjs            # wire anything missing; anchor + guard + widen what is wired
 *   node kit/scripts/install-claude-hooks.mjs --check    # report only; exit 1 if any are missing, cwd-relative, unguarded or on an old kit matcher
 *   node kit/scripts/install-claude-hooks.mjs --dry-run  # print the diff, write nothing
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The kit's Claude Code hooks.
 *
 * `matcher` is omitted where the event takes none (Stop). A new kit hook is added
 * here and nowhere else — this list is what --check grades against, so a hook
 * that ships without an entry is invisible to the check and will not be
 * installed, which is the same silence this file exists to end.
 *
 * `script` is the repo-relative file the command runs: it is both the
 * already-wired test (matched as a substring, so an adopter's own flags on the
 * same script still count as wired) and the presence test. `wired_marker`, when
 * set, must ALSO appear: for a script with several subcommands, a hook running a
 * different one is not this hook (WS-270).
 *
 * SessionStart hooks swallow their own failures (`|| true`): a session that
 * cannot start is worse than a session nobody registered. The guard does not —
 * exit 2 is how it blocks, and it already fails open on its own internal errors.
 * A command written here without `|| true` is wrapped by guardCommand() so a
 * checkout without the script skips it silently (WS-1140).
 *
 * `widensFrom` lists the matchers an EARLIER kit wrote for the same entry. A row
 * the kit wrote with one of them is widened to `matcher` in place (WS-1362); see
 * widenedMatcher(). When a matcher here is widened, add the old one to the list,
 * or existing installs keep the old matcher forever. Never list a matcher the
 * kit did not write: a row at it was narrowed by the adopter, and stays.
 */
const HOOKS_AS_WRITTEN = [
  {
    event: 'Stop',
    script: 'kit/scripts/claude-hooks/clean-tree-check.cjs',
    command: 'node kit/scripts/claude-hooks/clean-tree-check.cjs',
    why: 'uncommitted or unpushed work does not leave a session silently',
  },
  {
    event: 'Stop',
    script: 'kit/scripts/cwos-heartbeat.js',
    command: 'node kit/scripts/cwos-heartbeat.js 2>/dev/null || true',
    why: 'a session beats at every turn end; without it an adopted repo\'s sessions read as stale and lose their claims (WS-1154)',
  },
  {
    event: 'Stop',
    script: 'kit/scripts/claude-hooks/session-report-log.cjs',
    command: 'node kit/scripts/claude-hooks/session-report-log.cjs 2>/dev/null || true',
    why: 'what a session last told the founder is a file in the repo, not only chat, so it can be recalled (WS-945)',
  },
  {
    event: 'PostToolUse',
    matcher: 'Bash',
    script: 'kit/scripts/cwos-heartbeat.js',
    command: 'node kit/scripts/cwos-heartbeat.js --min-interval-minutes 10 2>/dev/null || true',
    why: 'a long turn of tool calls keeps beating, at most once in ten minutes (WS-1154)',
  },
  {
    event: 'SessionStart',
    // WS-1226: 'clear' too. /clear starts a new conversation in the same
    // process; without this nothing registered it, and the gate minted a bare
    // record. The payload's source:"clear" is stamped started_via: clear.
    matcher: 'startup|resume|clear',
    widensFrom: ['startup|resume'],
    script: 'kit/scripts/cwos-session-register.js',
    command: 'node kit/scripts/cwos-session-register.js 2>/dev/null || true',
    why: 'every session registers itself — no hand-made .current-session (WS-514 #1)',
  },
  {
    event: 'SessionStart',
    // 'clear' (WS-1226): the post-clear conversation runs /next next, and dead
    // sessions' claims should be released before it does. The pre-clear record
    // is NOT closed here: no automatic ghost closure (WS-890 scope cut).
    matcher: 'startup|resume|clear',
    widensFrom: ['startup|resume'],
    script: 'kit/scripts/cwos-session-recovery.js',
    command: 'node kit/scripts/cwos-session-recovery.js --auto --quiet 2>/dev/null || true',
    why: 'dead sessions release their claims instead of blocking the next one',
  },
  {
    event: 'SessionStart',
    matcher: 'startup',
    script: 'kit/scripts/cwos-reconcile.js',
    command: 'node kit/scripts/cwos-reconcile.js --check-drift --refresh-state --quiet 2>/dev/null || true',
    why: 'queue/index drift and stale counters heal at start, not by prose protocol (WS-514 #2)',
  },
  {
    event: 'SessionStart',
    matcher: 'startup',
    script: 'kit/scripts/cwos-usage-derive.js',
    command: 'node kit/scripts/cwos-usage-derive.js --write --quiet 2>/dev/null || true',
    why: 'usage counters are computed from disk, not remembered (7% recorded when left to prose, 2026-10-10)',
  },
  {
    event: 'SessionStart',
    // 'clear' (WS-1226): a cleared conversation has none of the old one's
    // context, so answers to act on are shown again. Read-only.
    matcher: 'startup|resume|clear',
    widensFrom: ['startup|resume'],
    script: 'kit/scripts/cwos-desk.js',
    command: 'node kit/scripts/cwos-desk.js answers --quiet 2>/dev/null || true',
    why: 'the founder\'s answers on the desk reach every repo\'s next session; one sat unapplied 11 days when only ai-personal read them (WS-945)',
  },
  {
    event: 'SessionStart',
    matcher: 'startup',
    script: 'kit/scripts/cwos-hygiene.js',
    // cwos-hygiene has other subcommands an adopter may already hook; only the
    // stranded check counts as this hook being wired.
    wired_marker: '--stranded',
    command: 'node kit/scripts/cwos-hygiene.js scan --stranded --quiet --fetch-if-stale 2>/dev/null || true',
    why: 'work left on a branch nothing merged is named at the next session start, in every repo; only ai-personal looked before, with its own sweep (WS-270)',
  },
  {
    event: 'PostToolUse',
    matcher: 'Agent|Task',
    script: 'kit/scripts/cwos-dispatch-ledger.js',
    command: 'node kit/scripts/cwos-dispatch-ledger.js record 2>/dev/null || true',
    why: 'the harness records which model each agent actually ran on (0 of 29 runs named one when left to prose)',
  },
  {
    event: 'PreToolUse',
    matcher: 'Bash',
    script: 'kit/scripts/cwos-git.js',
    command: 'node kit/scripts/cwos-git.js guard',
    why: 'a commit or tree-wide stage cannot sweep another session\'s work (WS-514 #3, WS-534)',
  },
  {
    event: 'PreToolUse',
    matcher: 'Bash',
    script: 'kit/scripts/claude-hooks/piped-push-guard.cjs',
    command: 'node kit/scripts/claude-hooks/piped-push-guard.cjs',
    why: 'a `git push` piped into tail/head/grep cannot hide the gate\'s refusal behind the filter\'s exit 0 (MIS-067, WS-1172)',
  },
  {
    event: 'PreToolUse',
    matcher: 'ExitPlanMode|AskUserQuestion|Write|Edit|MultiEdit|NotebookEdit|Bash',
    script: 'kit/scripts/cwos-lease-check.js',
    command: 'node kit/scripts/cwos-lease-check.js pre',
    why: 'a session waiting on the founder keeps its claims, and one that resumes to find its item taken is stopped before it writes (WS-1073)',
  },
  {
    event: 'PostToolUse',
    matcher: 'ExitPlanMode|AskUserQuestion',
    script: 'kit/scripts/cwos-lease-check.js',
    command: 'node kit/scripts/cwos-lease-check.js post',
    why: 'the claim is re-checked the moment a plan is approved, before the first write (WS-1073)',
  },
  {
    event: 'PostToolUse',
    matcher: 'Bash',
    script: 'kit/scripts/cwos-git.js',
    command: 'node kit/scripts/cwos-git.js record --bash-window --quiet 2>/dev/null || true',
    why: 'files a script writes are attributed to the session that ran it, so the guard can tell',
  },
];

/**
 * A hook command must not depend on the session's current directory (WS-1093).
 *
 * Claude Code runs a hook from wherever the session is standing. Written as
 * `node kit/scripts/x.js`, the command works at the repo root and, one `cd`
 * later, node cannot find the script and exits 1 — which for a PreToolUse hook
 * is a non-blocking error. The commit guard then fails open with nothing said.
 * Measured 2026-10-11 in HomeBase: `git add -A --dry-run` refused at the root,
 * run without a word from kit/scripts; by hand the same command line exits 2
 * at the root and 1 ("Cannot find module …\kit\scripts\kit\scripts\…") below it.
 *
 * So every kit script path is anchored to the project directory the harness
 * exports. `:-.` keeps the old behaviour where the variable is not set (another
 * harness, a hand run) rather than turning the path into `/kit/scripts/…`.
 */
// Also the spellings a hand-wired hook takes: `node.exe`, extra spaces, a
// leading `./`, a quoted path. Not matched, and so not rewritten: a flag between
// node and the script, a backslash path, or another interpreter.
const RELATIVE_KIT_SCRIPT = /(^|[\s;&|(])(node(?:\.exe)?)[ \t]+(["']?)(?:\.\/)?kit\/scripts\/([^\s;&|)"']+)\3/g;
// The existence test of a guarded command (WS-1140, below). A relative one is
// worse than a relative `node`: after a cd it reports the script missing, and
// the guard then skips the gate with exit 0 — silent, where the unguarded
// relative command at least errored.
const RELATIVE_KIT_TEST = /(^|[\s;&|(])(test[ \t]+![ \t]+-f|\[[ \t]+![ \t]+-f)[ \t]+(["']?)(?:\.\/)?kit\/scripts\/([^\s;&|)"'\]]+)\3/g;

/** True when a command runs (or tests for) a kit script by a path relative to the working directory. */
export function isCwdRelative(command) {
  RELATIVE_KIT_SCRIPT.lastIndex = 0;
  RELATIVE_KIT_TEST.lastIndex = 0;
  const c = String(command || '');
  return RELATIVE_KIT_SCRIPT.test(c) || RELATIVE_KIT_TEST.test(c);
}

/** The same command with each kit script path anchored. Flags and redirections are untouched. */
export function anchorCommand(command) {
  return String(command || '')
    .replace(RELATIVE_KIT_SCRIPT,
      (_m, lead, node, _quote, script) => `${lead}${node} "\${CLAUDE_PROJECT_DIR:-.}/kit/scripts/${script}"`)
    .replace(RELATIVE_KIT_TEST,
      (_m, lead, op, _quote, script) => `${lead}${op} "\${CLAUDE_PROJECT_DIR:-.}/kit/scripts/${script}"`);
}

/**
 * A kit hook must not error where the kit is not checked out (WS-1140).
 *
 * Measured 2026-10-15 in ServeYourNote: kit/ is gitignored there (one tracked
 * file), so every linked worktree, cloud checkout and CI runner lacks the
 * scripts. The four blocking hooks, wired as a bare `node "<script>" <args>`,
 * exited 1 — a non-blocking hook error — on every matching tool call, the
 * repo's CI orientation check failed main for two days, and the hooks were
 * unwired (ServeYourNote #378). A gate that is unwired protects nothing.
 *
 * `|| true`, which the SessionStart hooks use, is wrong for these: it also
 * swallows the exit 2 that IS the block. So a blocking hook is wrapped as
 *
 *   test ! -f "<script>" || node "<script>" <args>
 *
 * Script absent: `test` succeeds, the hook is a silent no-op (exit 0).
 * Script present: `test` fails, node runs, and the hook's exit status IS
 * node's — 2 still blocks, 0 still allows, 1 is still a visible error.
 *
 * Only a single anchored kit invocation with no shell operators, redirections
 * or substitutions is wrapped. Anything more (a pipeline, `2>/dev/null ||
 * true`, an adopter's compound command) is left as written: its exit status is
 * already the author's choice, and wrapping a compound command could change it.
 */
const SIMPLE_KIT_INVOCATION = /^\s*(node(?:\.exe)?)[ \t]+"\$\{CLAUDE_PROJECT_DIR:-\.\}\/kit\/scripts\/([^"]+)"([^;&|<>`$()\n]*)$/;

/** True when a command is a bare kit invocation that would error where the script is absent. */
export function isUnguarded(command) {
  return SIMPLE_KIT_INVOCATION.test(String(command || ''));
}

/** The same command wrapped in a missing-script guard. Idempotent; leaves any other shape alone. */
export function guardCommand(command) {
  const c = String(command || '');
  const m = c.match(SIMPLE_KIT_INVOCATION);
  if (!m) return c;
  const p = `"\${CLAUDE_PROJECT_DIR:-.}/kit/scripts/${m[2]}"`;
  return `test ! -f ${p} || ${m[1]} ${p}${m[3].replace(/\s+$/, '')}`;
}

export const KIT_HOOKS = HOOKS_AS_WRITTEN.map((h) => ({ ...h, command: guardCommand(anchorCommand(h.command)) }));

/**
 * Every hook command in one settings object that still runs relative to the
 * working directory (WS-1093), or runs a kit script bare where its absence is
 * an error on every call (WS-1140) — the kit's own from before those fixes,
 * and any a repo wired by hand to a kit script. Returns
 * [{ event, from, to, anchored, guarded }] and rewrites `cfg` in place; pass a copy.
 */
function reanchor(cfg) {
  const out = [];
  for (const [event, blocks] of Object.entries((cfg && cfg.hooks) || {})) {
    for (const b of Array.isArray(blocks) ? blocks : []) {
      for (const x of (b && b.hooks) || []) {
        if (!x || typeof x.command !== 'string') continue;
        const anchored = anchorCommand(x.command);
        const to = guardCommand(anchored);
        if (to === x.command) continue;
        out.push({ event, from: x.command, to, anchored: anchored !== x.command, guarded: to !== anchored });
        x.command = to;
      }
    }
  }
  return out;
}

/** A matcher's `|` alternatives. '' (no matcher: every source) has none. */
const alternatives = (m) => String(m || '').split('|').map((a) => a.trim()).filter(Boolean);

/**
 * The matcher the kit now wants for a row it wrote earlier, or null (WS-1362).
 *
 * Non-null only when, under `event`, the command is a kit entry's own command
 * (verbatim, or relative/unguarded and the same once anchored + guarded), the
 * row's matcher is one an earlier kit wrote for that entry (`widensFrom`), and
 * the entry's matcher holds every alternative of it and more. A narrowed,
 * unrelated or wider matcher, or a command with the adopter's own flags, is null.
 */
export function widenedMatcher(event, matcher, command) {
  const normal = guardCommand(anchorCommand(command));
  const from = (matcher === undefined || matcher === null) ? '' : String(matcher);
  for (const h of KIT_HOOKS) {
    if (h.event !== event || h.command !== normal || !h.matcher || h.matcher === from) continue;
    if (!(h.widensFrom || []).includes(from)) continue;
    const want = new Set(alternatives(h.matcher));
    const had = alternatives(from);
    if (had.length && had.length < want.size && had.every((a) => want.has(a))) return h.matcher;
  }
  return null;
}

/**
 * Widen, in place, every block whose hooks are all kit rows at an old kit
 * matcher (WS-1362). Returns { widened, left }: widened is one
 * { event, from, to, command } per hook whose block was widened; left is one
 * { event, matcher, command, want, why } per hook that runs a kit script under
 * a matcher other than the kit's and was NOT changed — reported, never touched.
 */
function widenMatchers(cfg) {
  const widened = [];
  const left = [];
  for (const [event, blocks] of Object.entries((cfg && cfg.hooks) || {})) {
    for (const b of Array.isArray(blocks) ? blocks : []) {
      const hooks = (b && Array.isArray(b.hooks)) ? b.hooks : [];
      if (!hooks.length) continue;
      const from = (b.matcher === undefined || b.matcher === null) ? '' : String(b.matcher);
      const targets = hooks.map((x) => (x && typeof x.command === 'string' ? widenedMatcher(event, from, x.command) : null));
      if (targets[0] && targets.every((t) => t === targets[0])) {
        b.matcher = targets[0];
        for (const x of hooks) widened.push({ event, from, to: targets[0], command: x.command });
        continue;
      }
      hooks.forEach((x, i) => {
        if (!x || typeof x.command !== 'string') return;
        const kit = KIT_HOOKS.filter((h) => h.event === event && h.matcher && x.command.includes(h.script));
        if (!kit.length || kit.some((h) => h.matcher === from)) return;
        const want = kit.map((h) => h.matcher).join(' or ');
        const why = targets[i] ? 'its block holds a hook the kit would not widen'
          : kit.some((h) => (h.widensFrom || []).includes(from)) ? 'the command is not the kit\'s as written'
          : 'a matcher the kit never wrote for it';
        left.push({ event, matcher: from, command: x.command, want, why });
      });
    }
  }
  return { widened, left };
}

/** Every command string wired under `event` in one settings object. */
function commandsUnder(cfg, event) {
  const blocks = (cfg && cfg.hooks && cfg.hooks[event]) || [];
  return blocks.flatMap((b) => (b.hooks || []).map((x) => String(x.command || '')));
}

/**
 * What an install would do, computed without touching disk.
 *
 * A hook counts as wired when its `script` appears in any command under the same
 * event in either settings file. A hook whose script `exists(script)` denies is
 * skipped, not missing: it cannot be wired, so --check must not fail on it.
 *
 * Returns { missing, skipped, cfg, localCfg, reanchored }. cfg is a NEW
 * settings.json object with the missing hooks appended and any cwd-relative kit
 * command anchored; localCfg is the same for settings.local.json (null when
 * there is none); reanchored lists each rewrite as { file, event, from, to };
 * widened lists each matcher widened in place as { file, event, from, to,
 * command }; matcherLeft lists each kit-script row left at a matcher other than
 * the kit's (WS-1362). Neither input is mutated.
 */
export function planInstall(settings, localSettings, exists = () => true) {
  const cfg = JSON.parse(JSON.stringify(settings || {}));
  cfg.hooks = cfg.hooks || {};
  const missing = [];
  const skipped = [];
  for (const h of KIT_HOOKS) {
    const wired = [cfg, localSettings]
      .some((s) => commandsUnder(s, h.event).some((c) => c.includes(h.script) && (!h.wired_marker || c.includes(h.wired_marker))));
    if (wired) continue;
    if (!exists(h.script)) { skipped.push(h); continue; }
    missing.push(h);
    const blocks = (cfg.hooks[h.event] = cfg.hooks[h.event] || []);
    const entry = { hooks: [{ type: 'command', command: h.command }] };
    if (h.matcher) entry.matcher = h.matcher;
    blocks.push(entry);
  }
  // WS-1093: a hook that is wired but cwd-relative is not "nothing to do".
  // Both files are rewritten, because a command in settings.local.json counts
  // as wired above and would otherwise stay relative forever.
  const localCfg = localSettings ? JSON.parse(JSON.stringify(localSettings)) : null;
  const reanchored = [
    ...reanchor(cfg).map((r) => ({ ...r, file: 'settings.json' })),
    ...(localCfg ? reanchor(localCfg).map((r) => ({ ...r, file: 'settings.local.json' })) : []),
  ];
  // WS-1362: a kit row at a matcher an earlier kit wrote is widened in place.
  const main = widenMatchers(cfg);
  const loc = localCfg ? widenMatchers(localCfg) : { widened: [], left: [] };
  const widened = [
    ...main.widened.map((r) => ({ ...r, file: 'settings.json' })),
    ...loc.widened.map((r) => ({ ...r, file: 'settings.local.json' })),
  ];
  const matcherLeft = [
    ...main.left.map((r) => ({ ...r, file: 'settings.json' })),
    ...loc.left.map((r) => ({ ...r, file: 'settings.local.json' })),
  ];
  return { missing, skipped, cfg, localCfg, reanchored, widened, matcherLeft };
}

function repoRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Parse settings text WITHOUT losing a repeated key (2026-11-01).
 *
 * JSON.parse keeps the last of two equal keys and drops the first without a word
 * (WS-606, INV-082). This installer used to read with JSON.parse and write the
 * object back, so a repeated key in an adopter's file was deleted on disk, not
 * only ignored. Measured in Physical-Therapy-by-AI: a git merge on 2026-10-19
 * (4777893) left two `hooks.PreToolUse` keys, the first holding the repo's own
 * `vault-guard.js` (the guard that keeps the founder's body photos out of
 * sessions), the second the kit's guards. The 3.48.1 upgrade (72dc251) ran this
 * file, and the guard was gone from settings.json.
 *
 * So the text is walked once more, keeping every occurrence:
 *  - a repeated EVENT under `hooks` holds hook blocks, and both lists were
 *    written to run: they are joined in file order, at the first key's place,
 *    and reported in `merged` so the install writes the joined form;
 *  - a repeated key anywhere else has no safe join; it is reported in
 *    `duplicates` and the caller refuses to touch the file.
 *
 * Throws exactly where JSON.parse throws. Returns { value, merged, duplicates };
 * with no repeated key, `value` is JSON.parse's own result.
 */
export function parseSettingsText(raw) {
  const plain = JSON.parse(raw);
  const merged = [];
  const duplicates = [];
  const text = String(raw);
  const lineAt = (pos) => text.slice(0, pos).split('\n').length;
  const put = (obj, k, v) => Object.defineProperty(obj, k, { value: v, writable: true, enumerable: true, configurable: true });
  let i = 0;
  const ws = () => { while (i < text.length && ' \t\n\r'.includes(text[i])) i++; };
  const str = () => {
    const start = i++;
    while (text[i] !== '"') { if (text[i] === '\\') i++; i++; }
    i++;
    return JSON.parse(text.slice(start, i));
  };
  const SCALAR = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/y;
  function val(where) {
    ws();
    const c = text[i];
    if (c === '{') {
      i++;
      const obj = {};
      const firstAt = new Map();
      ws();
      if (text[i] === '}') { i++; return obj; }
      for (;;) {
        ws();
        const at = i;
        const key = str();
        ws(); i++; // ':'
        const v = val(where ? `${where}.${key}` : key);
        if (!firstAt.has(key)) { firstAt.set(key, at); put(obj, key, v); }
        else if (where === 'hooks' && Array.isArray(obj[key]) && Array.isArray(v)) {
          put(obj, key, obj[key].concat(v));
          merged.push({ key: `hooks.${key}`, lines: [lineAt(firstAt.get(key)), lineAt(at)] });
        } else {
          put(obj, key, v);
          duplicates.push({ key: where ? `${where}.${key}` : key, lines: [lineAt(firstAt.get(key)), lineAt(at)] });
        }
        ws();
        if (text[i++] === '}') return obj;
      }
    }
    if (c === '[') {
      i++;
      const arr = [];
      ws();
      if (text[i] === ']') { i++; return arr; }
      for (;;) { arr.push(val(where)); ws(); if (text[i++] === ']') return arr; }
    }
    if (c === '"') return str();
    SCALAR.lastIndex = i;
    const m = SCALAR.exec(text);
    i = SCALAR.lastIndex;
    return JSON.parse(m[0]);
  }
  const value = val('');
  if (!merged.length && !duplicates.length) return { value: plain, merged, duplicates };
  return { value, merged, duplicates };
}

/** Every hook in one settings object as { event, matcher, command }. */
export function hookRows(cfg) {
  const out = [];
  for (const [event, blocks] of Object.entries((cfg && cfg.hooks) || {})) {
    for (const b of Array.isArray(blocks) ? blocks : []) {
      for (const x of (b && b.hooks) || []) {
        if (x && typeof x.command === 'string') out.push({ event, matcher: (b && b.matcher) || '', command: x.command });
      }
    }
  }
  return out;
}

/**
 * The hooks in `before` that `after` no longer carries. A hook is kept when the
 * same event and matcher hold its command verbatim, or the anchored + guarded
 * form of it (the two rewrites above, which only ever touch a kit script path).
 * An adopter's own hook therefore has to survive byte-for-byte. The install
 * refuses to write when this is not empty: it is append-only, and a write that
 * would lose a hook is a defect here, never the adopter's problem to find.
 *
 * The one matcher change it accepts is widenedMatcher()'s (WS-1362): a kit row
 * found under the matcher the kit now wants for it. Any other matcher change —
 * an adopter's row, a narrowing, a row the kit did not write — is a loss.
 */
export function lostHooks(before, after) {
  const k = (event, matcher, command) => `${event}\u0000${matcher}\u0000${command}`;
  const have = new Set(hookRows(after).map((r) => k(r.event, r.matcher, r.command)));
  return hookRows(before).filter((r) => {
    const commands = [r.command, guardCommand(anchorCommand(r.command))];
    const widened = widenedMatcher(r.event, r.matcher, r.command);
    const matchers = widened ? [r.matcher, widened] : [r.matcher];
    return !matchers.some((m) => commands.some((c) => have.has(k(r.event, m, c))));
  });
}

/**
 * Parse a settings file; null when absent, exit when unreadable or when a key
 * repeats outside `hooks`. Returns { value, merged }.
 */
function readSettings(file) {
  if (!existsSync(file)) return { value: null, merged: [] };
  let parsed;
  try {
    parsed = parseSettingsText(readFileSync(file, 'utf8'));
  } catch (e) {
    // Never overwrite a file we could not read: a parse failure here would
    // otherwise silently replace an adopter's whole configuration.
    console.error(`install-claude-hooks: ${file} is not valid JSON (${e.message}). Refusing to touch it.`);
    process.exit(1);
  }
  if (parsed.duplicates.length) {
    for (const d of parsed.duplicates) console.error(`  DUPLICATE-KEY  ${d.key} at lines ${d.lines.join(' and ')} of ${file}`);
    console.error(`install-claude-hooks: ${file} declares a key twice; JSON keeps only the last, and rewriting the file would delete the first (INV-082). Refusing to touch it — join the two by hand.`);
    process.exit(1);
  }
  return parsed;
}

const USAGE = `install-claude-hooks — wire the kit's Claude Code hooks into .claude/settings.json

usage: node kit/scripts/install-claude-hooks.mjs [--check | --dry-run]

  (no flag)   wire anything missing; anchor any kit hook command that runs
              relative to the working directory (WS-1093) and guard any bare
              blocking one against a missing script (WS-1140); widen a kit row
              still on a matcher an earlier kit wrote (WS-1362); both settings files
  --check     report only; exit 1 if any are missing, cwd-relative, unguarded or
              on an old kit matcher, or a hooks event key is declared twice
  --dry-run   print the diff, write nothing
  -h, --help  print this usage and exit without acting
`;

function main() {
  // ADR-063: --help never acts, and an unrecognized flag is fatal. Before this,
  // `--help` fell through to 'install' and rewrote settings.json (2026-10-10).
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { process.stdout.write(USAGE); process.exit(0); }
  const unknown = args.filter((a) => !['--check', '--dry-run'].includes(a));
  if (unknown.length) {
    process.stderr.write(`install-claude-hooks: unrecognized argument(s): ${unknown.join(' ')}\n\n${USAGE}`);
    process.exit(2);
  }
  const ROOT = repoRoot();
  if (!ROOT) {
    console.error('install-claude-hooks: not inside a git repository.');
    process.exit(1);
  }

  const SETTINGS = join(ROOT, '.claude', 'settings.json');
  const mode = process.argv.includes('--check') ? 'check'
    : process.argv.includes('--dry-run') ? 'dry-run'
    : 'install';

  const LOCAL = join(ROOT, '.claude', 'settings.local.json');
  const { value: settings, merged: mergedMain } = readSettings(SETTINGS);
  const { value: local, merged: mergedLocal } = readSettings(LOCAL);
  const { missing, skipped, cfg, localCfg, reanchored, widened, matcherLeft } =
    planInstall(settings, local, (s) => existsSync(join(ROOT, s)));
  const wireable = KIT_HOOKS.length - skipped.length;
  const merges = [
    ...mergedMain.map((m) => ({ ...m, file: 'settings.json' })),
    ...mergedLocal.map((m) => ({ ...m, file: 'settings.local.json' })),
  ];

  for (const h of skipped) console.log(`  skip  ${h.event}: ${h.script} is not installed in this repo`);
  // Reported in every mode, never changed: that matcher is the adopter's (WS-1362).
  for (const r of matcherLeft) {
    console.log(`  = ${r.event} [${r.matcher}] in ${r.file}: left as is, the kit wires it [${r.want}] (${r.why}): ${r.command}`);
  }

  if (mode === 'check') {
    for (const m of merges) {
      console.error(`  DUPLICATE-KEY  ${m.key} in ${m.file} at lines ${m.lines.join(' and ')}\n           (JSON keeps only the last; the hooks under the first never run — install joins them)`);
    }
    if (!missing.length && !reanchored.length && !merges.length && !widened.length) {
      console.log(`install-claude-hooks: all ${wireable} installable kit hook(s) wired, none relative to the working directory, unguarded or on an old kit matcher.`);
      process.exit(0);
    }
    for (const h of missing) console.error(`  UNWIRED  ${h.event}: ${h.command}\n           (${h.why})`);
    for (const r of reanchored) {
      if (r.anchored) console.error(`  CWD-RELATIVE  ${r.event} in ${r.file}: ${r.from}\n           (after a cd it cannot start, and a hook that cannot start does not block — WS-1093)`);
      if (r.guarded) console.error(`  UNGUARDED  ${r.event} in ${r.file}: ${r.from}\n           (where kit/ is not checked out it errors on every call — WS-1140)`);
    }
    for (const r of widened) {
      console.error(`  OLD-MATCHER  ${r.event} [${r.from}] in ${r.file}: ${r.command}\n           (the kit now wires it [${r.to}]; install widens it — WS-1362)`);
    }
    process.exit(1);
  }

  if (!missing.length && !reanchored.length && !merges.length && !widened.length) {
    console.log(`install-claude-hooks: nothing to do — all ${wireable} installable kit hook(s) already wired, anchored and guarded.`);
    process.exit(0);
  }

  // Append-only, checked rather than assumed: every hook either file held,
  // under both copies of a repeated key, must still be there after the plan.
  const lost = [
    ...lostHooks(settings, cfg).map((r) => ({ ...r, file: 'settings.json' })),
    ...(local ? lostHooks(local, localCfg).map((r) => ({ ...r, file: 'settings.local.json' })) : []),
  ];
  if (lost.length) {
    for (const r of lost) console.error(`  WOULD-DROP  ${r.event} [${r.matcher}] in ${r.file}: ${r.command}`);
    console.error('install-claude-hooks: this install would remove a hook it did not write. Refusing to write either settings file.');
    process.exit(1);
  }

  for (const m of merges) console.log(`  ~ ${m.key} in ${m.file}: joined the duplicate keys at lines ${m.lines.join(' and ')} (the first one's hooks were invisible to Claude Code)`);
  for (const h of missing) console.log(`  + ${h.event}: ${h.command}`);
  for (const r of reanchored) {
    const what = [r.anchored && 'anchored', r.guarded && 'guarded'].filter(Boolean).join(' + ');
    console.log(`  ~ ${r.event} in ${r.file}: ${what} ${r.from}`);
  }
  for (const r of widened) console.log(`  ~ ${r.event} in ${r.file}: matcher ${r.from} -> ${r.to} ${r.command}`);

  if (mode === 'dry-run') {
    console.log('install-claude-hooks: --dry-run, nothing written.');
    process.exit(0);
  }

  mkdirSync(join(ROOT, '.claude'), { recursive: true });
  if (missing.length || [...reanchored, ...widened].some((r) => r.file === 'settings.json') || mergedMain.length) {
    writeFileSync(SETTINGS, `${JSON.stringify(cfg, null, 2)}\n`, 'utf8');
    console.log(`install-claude-hooks: wrote ${SETTINGS}`);
  }
  if (localCfg && ([...reanchored, ...widened].some((r) => r.file === 'settings.local.json') || mergedLocal.length)) {
    writeFileSync(LOCAL, `${JSON.stringify(localCfg, null, 2)}\n`, 'utf8');
    console.log(`install-claude-hooks: wrote ${LOCAL}`);
  }
  if (reanchored.length || merges.length || widened.length) {
    console.log('install-claude-hooks: a running session keeps the hooks it started with — restart it to pick up the rewritten hooks.');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
