#!/usr/bin/env node
/**
 * cwos-dispatch-contain.js — PreToolUse containment for DISPATCHED sessions.
 *
 * A dispatched session is a `claude -p` that cwos-fleet-run.js (and so
 * cwos-repo-ask.js) started inside a repo's worktree. fleet-run stamps
 * CWOS_DISPATCHED=1 into the composed command, so the marker reaches the
 * session on the same-node path and the ssh path alike. Hooks inherit the
 * session's environment, so this script can tell the two kinds apart.
 *
 * WHY. Founder sessions keep ADR-059's audit-only admin path: a person is
 * watching, and a denylist there blocks legitimate work. A dispatched session
 * runs in auto mode with nobody watching, reads repo content that may carry
 * outside text, and inherits every machine-wide hook script by path. The
 * 2026-10-14 adversarial review traced the worst case: a steered replica takes
 * `ssh chris@localhost` (full admin, no UAC), edits a hook script every session
 * loads, reaches CM-NODE1 the same way, and pushes to every repo with the
 * machine's GitHub credentials. A dispatched session needs none of that to do
 * its job, which is: read its repo, write in its worktree, commit locally.
 *
 * So, only when CWOS_DISPATCHED=1, this refuses (exit 2):
 *   - admin escalation and fleet dispatch (classify() from the audit hook,
 *     which also covers `cwos-fleet-run` / `cwos-repo-ask`: no nesting)
 *   - `git push`, `gh`, `scp`, a nested `claude -p`, RunAs, scheduled-task edits
 *   - Edit/Write/NotebookEdit outside the session's project dir, or under ~/.claude
 * Every refusal is appended to ~/.claude/admin-escalation.log as
 * kind `dispatch-blocked`, so a dispatch run can count what it hit. Each entry
 * carries the CWOS_DISPATCH_ID fleet-run stamped, which is how fleet-run finds
 * the push it must report after the run (WS-1090). When the log cannot be
 * written, a dispatch's refusal goes to a per-id trace in the OS temp dir
 * instead (unrecordedPath), and when that cannot be written either, to a trace
 * in the git dir of the session's repository (gitTraceName); fleet-run reads
 * back both.
 *
 * Limits, stated so nobody believes more than this gives: a Bash or PowerShell
 * command that writes a file by redirection is matched only on its text, and a
 * determined obfuscation (encoded command, variable-built hostnames) is not
 * parsed. This is containment of the documented paths, not a sandbox.
 *
 * Installed via ~/.claude/settings.json PreToolUse, matcher
 * "Bash|PowerShell|Edit|Write|NotebookEdit". Outside a dispatched session it
 * exits 0 immediately.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { classify, LOG_PATH } = require('./cwos-admin-escalation-audit');

const SHELL_TOOLS = new Set(['Bash', 'PowerShell']);
const WRITE_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit']);

// git push in the shapes a shell runs it: bare, git.exe, quoted ("git", 'git'),
// a full path ending in git or git.exe, and with global options before the verb
// (git -C <dir>, git -c k=v, a quoted option value). "push" must be the verb that
// follows git and its options, so `git log --grep push`, `npm run push-docs` and
// `array.push` are not pushes (WS-1090, fifth inspection).
const GIT_PUSH_RE = /\bgit(?:\.exe)?["']?(?:\s+-\S+(?:\s+(?:"[^"]*"|'[^']*'|\S+))?)*\s+push\b/i;
// gh as a command: bare or gh.exe after a command boundary, fully quoted ("gh",
// 'gh.exe'), or a full path ending in gh.exe. A path ending in plain gh counts
// only when a gh subcommand follows, so `ls tools/gh` stays ordinary. A backtick
// (PR=`gh pr create`) and a brace ({gh pr create}) open a command too (WS-1178).
const GH_RE = new RegExp([
  String.raw`(?:^|[\s;&|(\x60{])gh(?:\.exe)?\s`,
  String.raw`(?:^|[\s;&|(\x60{])(?:"gh(?:\.exe)?"|'gh(?:\.exe)?')(?:\s|$)`,
  String.raw`[\\/]gh\.exe["']?(?:\s|$)`,
  String.raw`[\\/]gh["']?\s+(?:pr|repo|release|issue|api|auth|workflow|run|gist|secret|variable|label|browse|search|codespace|ssh-key|gpg-key|cache|ruleset|project|extension|alias|config|status|org)\b`,
].join('|'), 'i');

// Each: what a dispatched session may not do from a shell, and why in a phrase.
const SHELL_REFUSALS = [
  { re: GIT_PUSH_RE, why: 'git push (a dispatched run commits locally; the dispatcher collects)' },
  { re: GH_RE,       why: 'gh (GitHub writes belong to the founder or a reviewed lane)' },
  { re: /(?:^|[\s;&|(])scp(?:\.exe)?\s/i,             why: 'scp to another machine' },
  { re: /\bclaude(?:\.exe)?\s+(?:-p|--print)\b/i,    why: 'a nested claude -p (dispatch does not nest)' },
  { re: /\brunas\b|-Verb\s+RunAs\b/i,                 why: 'elevation' },
  { re: /\bschtasks\b[^|;&]*\/(?:create|change|delete)\b|\b(?:Register|Set|Unregister)-ScheduledTask\b/i,
    why: 'scheduled-task changes' },
];

/**
 * Does this shell command push or run gh? The same patterns verdict() refuses
 * with. cwos-fleet-run.js reads refusals back with this, because a command that
 * also escalates (`git push; ssh cm-node1 x`) is recorded under the escalation
 * reason, not the push one (WS-1090).
 */
function pushesIn(command) {
  const c = String(command || '');
  return GIT_PUSH_RE.test(c) || GH_RE.test(c);
}

function isDispatched(env) {
  return env.CWOS_DISPATCHED === '1' || Boolean(env.CWOS_DIALOGUE_DEPTH);
}

function within(child, parent) {
  const rel = path.relative(path.resolve(parent), path.resolve(child));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/**
 * Pure verdict: { block: false } or { block: true, reason }.
 * input is the PreToolUse JSON; env and home are injectable for tests.
 */
function verdict(input, env = process.env, home = os.homedir()) {
  if (!isDispatched(env)) return { block: false };
  const tool = input.tool_name || '';
  const ti = input.tool_input || {};

  if (SHELL_TOOLS.has(tool)) {
    const cmd = String(ti.command || '');
    const kind = classify(cmd);
    if (kind) return { block: true, reason: `${kind} (admin escalation or fleet dispatch)` };
    for (const { re, why } of SHELL_REFUSALS) {
      if (re.test(cmd)) return { block: true, reason: why };
    }
    return { block: false };
  }

  if (WRITE_TOOLS.has(tool)) {
    const target = String(ti.file_path || ti.notebook_path || '');
    if (!target) return { block: false };
    const project = env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
    const abs = path.resolve(project, target);
    if (within(abs, path.join(home, '.claude'))) {
      return { block: true, reason: 'writes under ~/.claude (settings, hooks, memory)' };
    }
    if (!within(abs, project)) {
      return { block: true, reason: `writes outside this dispatch's worktree (${project})` };
    }
  }
  return { block: false };
}

/**
 * The log entry for one refusal. dispatch_id is the id cwos-fleet-run.js
 * stamps as CWOS_DISPATCH_ID; fleet-run reads back this dispatch's entries
 * after the session ends and fails the run when one is a push or gh refusal.
 */
function entryFor(input, reason, env = process.env) {
  const ti = input.tool_input || {};
  return {
    timestamp: new Date().toISOString(),
    node: os.hostname(),
    kind: 'dispatch-blocked',
    reason,
    tool: input.tool_name || null,
    session_id: input.session_id || null,
    cwd: input.cwd || process.cwd(),
    command: ti.command || ti.file_path || null,
    dispatch_id: env.CWOS_DISPATCH_ID || null,
  };
}

// Where a refusal goes when the log cannot take it: one file per dispatch id in
// the OS temp dir, a path cwos-fleet-run.js computes from the id alone and
// reads back with the log (WS-1090, seventh inspection: a read-only or locked
// log swallowed a refused push and the run read back as exit 0).
const UNRECORDED_DIR = 'cwos-dispatch';

function unrecordedName(dispatchId) {
  return `${String(dispatchId).replace(/[^A-Za-z0-9._-]/g, '_')}.unrecorded.jsonl`;
}

function unrecordedPath(dispatchId, tmpdir = os.tmpdir()) {
  return path.join(tmpdir || os.tmpdir(), UNRECORDED_DIR, unrecordedName(dispatchId));
}

// The third place, used only when the log and the temp trace both failed: a
// file in the git dir of the repository the session works in. For a linked
// worktree that is <repo>/.git/worktrees/<name>, which is what fleet-run's
// read-back resolves from the dispatch's work dir (WS-1090, eighth inspection:
// a log unwritable mid-run plus an unwritable temp dir recorded a refused push
// nowhere, and the run read back all-clear).
function gitTraceName(dispatchId) {
  return `${UNRECORDED_DIR}-${unrecordedName(dispatchId)}`;
}

/** The absolute git dir of dir (git rev-parse --absolute-git-dir); throws when git cannot name it. */
function gitDirOf(dir) {
  if (!dir) throw new Error('no working directory to resolve a git dir from');
  const r = spawnSync('git', ['-C', dir, 'rev-parse', '--absolute-git-dir'],
    { encoding: 'utf8', timeout: 5000, windowsHide: true });
  const out = String(r.stdout || '').trim();
  if (r.status === 0 && out) return out;
  const said = String(r.stderr || '').trim().split(/\r?\n/)[0];
  throw new Error(said || (r.error && r.error.message) || `git exited ${r.status}`);
}

const errText = (err) => String((err && err.message) || err).slice(0, 300);

/**
 * Append the entry to the escalation log. When that fails inside a fleet-run
 * dispatch (CWOS_DISPATCH_ID set), append it to the per-id trace in the temp
 * dir instead, with the log's error; when that fails too, to the trace in the
 * session repository's git dir (projectDir, else CLAUDE_PROJECT_DIR, else the
 * entry's cwd), with both errors. Never throws: a record must never break the
 * session. Returns 'log', 'trace', 'gitdir' or null (recorded nowhere), for tests.
 */
function record(entry, { logPath = LOG_PATH, env = process.env, tmpdir, projectDir, warn } = {}) {
  let logError;
  try {
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(logPath, JSON.stringify(entry) + '\n', 'utf8');
    return 'log';
  } catch (err) { logError = err; }
  if (!env.CWOS_DISPATCH_ID) return null;
  let traceError;
  try {
    const trace = unrecordedPath(env.CWOS_DISPATCH_ID, tmpdir);
    fs.mkdirSync(path.dirname(trace), { recursive: true });
    fs.appendFileSync(trace, JSON.stringify({ ...entry, log_error: errText(logError) }) + '\n', 'utf8');
    return 'trace';
  } catch (err) { traceError = err; }
  let gitError;
  try {
    const gitDir = gitDirOf(projectDir || env.CLAUDE_PROJECT_DIR || (entry && entry.cwd));
    fs.appendFileSync(path.join(gitDir, gitTraceName(env.CWOS_DISPATCH_ID)),
      JSON.stringify({ ...entry, log_error: errText(logError), trace_error: errText(traceError) }) + '\n', 'utf8');
    return 'gitdir';
  } catch (err) { gitError = err; }
  // Recorded nowhere. A session that cannot write its own git dir cannot have
  // committed any work either, so there is nothing for the dispatcher to land.
  // fleet-run cannot see this refusal, though, so the session is told, as a last act.
  try {
    (warn || ((s) => process.stderr.write(s)))(
      `cwos-dispatch-contain: this refusal could not be recorded anywhere (escalation log: ${errText(logError)}; `
      + `temp trace: ${errText(traceError)}; git dir trace: ${errText(gitError)}), so fleet-run cannot see it. `
      + 'Name it in your report.\n');
  } catch { /* never throw */ }
  return null;
}

function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('cwos-dispatch-contain — PreToolUse hook; refuses admin escalation, pushes and\n'
      + 'out-of-worktree writes in sessions stamped CWOS_DISPATCHED=1. Reads hook JSON on stdin.\n'
      + 'exit 0 allowed · exit 2 refused');
    process.exit(0);
  }
  const extra = process.argv.slice(2);
  if (extra.length) { console.error(`cwos-dispatch-contain: unknown argument ${extra[0]}`); process.exit(2); }

  if (!isDispatched(process.env)) process.exit(0);

  let input;
  try { input = JSON.parse(fs.readFileSync(0, 'utf8').replace(/^﻿/, '') || '{}'); }
  catch { process.exit(0); }

  const v = verdict(input);
  if (!v.block) process.exit(0);

  record(entryFor(input, v.reason));
  process.stderr.write(`REFUSED in a dispatched session: ${v.reason}. `
    + 'Do the work inside this worktree and commit locally; record anything that needs '
    + 'wider reach in your report for the dispatcher.\n');
  process.exit(2);
}

if (require.main === module) main();

module.exports = {
  verdict, isDispatched, entryFor, pushesIn, record, unrecordedPath, unrecordedName, UNRECORDED_DIR,
  gitTraceName, gitDirOf,
  SHELL_REFUSALS, GIT_PUSH_RE, GH_RE,
};
