#!/usr/bin/env node
/**
 * clean-tree-check.cjs — Stop hook. Uncommitted or unpushed work does not leave
 * the session silently (WS-1130 / GOAL-001 C14).
 *
 * WHY THIS IS IN THE REPO AND NOT IN A HOME DIRECTORY.
 *
 * Measured 2026-09-18 inside a Claude Code cloud container: the stop hook that
 * enforced commit-and-push for an entire session was `~/.claude/stop-hook-git-check.sh`
 * — USER-level, injected by the cloud harness, absent from this repository. A
 * terminal session on the G16, a VS Code session, or a session inside a linked
 * worktree therefore had NO equivalent. The discipline the founder relies on was
 * a property of one environment, not of this project.
 *
 * Founder 2026-09-18: "I don't want a partial implementation or leftover work
 * getting in the way of a system we should be using and monitor our own compliance."
 *
 * `.claude/settings.json` is tracked, so a hook registered here fires in every
 * environment that opens this repo. That is the whole point — this file is the
 * portable half of a control that already existed in exactly one place.
 *
 * LOOP SAFETY. `stop_hook_active` is honoured first. Without it a blocking Stop
 * hook re-fires against its own continuation forever, which is why every Stop hook
 * in this repo checks it before doing anything else.
 *
 * FAILS OPEN. Not a git repo, git unavailable, or any throw exits 0 silently. A
 * broken compliance hook must never strand the founder mid-session.
 */
'use strict';

const { execFileSync } = require('node:child_process');

/**
 * The repo root is asked of git, never counted from __dirname (WS-1128).
 *
 * This file now ships in the kit, so its depth below the repo root is a property
 * of where an adopter installs it, not a constant. A `..`-counted root is also the
 * exact defect GOAL-001 C3 exists to catch in git-guard.cjs: inside a linked
 * worktree it resolves to the wrong tree. `rev-parse --show-toplevel` answers for
 * whichever tree the session is actually in, which is the tree whose branch needs
 * pushing.
 */
let REPO;
try {
  REPO = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: process.cwd(), encoding: 'utf8', timeout: 15000, stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
} catch { if (require.main === module) process.exit(0); } // not a git repo, or git is unavailable — fail open
if (!REPO && require.main === module) process.exit(0);

const gitRaw = (args) => execFileSync('git', args, {
  cwd: REPO, encoding: 'utf8', timeout: 15000, stdio: ['ignore', 'pipe', 'pipe'],
});
const git = (args) => gitRaw(args).trim();


/**
 * MACHINE CHURN IS NOT LOOSE WORK (measured 2026-09-19).
 *
 * The heartbeat hooks run in this same Stop chain, immediately before this one. So
 * every turn ended with a dirty tree, this hook blocked, a commit and push followed,
 * and that push CANCELLED the in-flight CI run. Three 63-minute lanes died that way
 * on PR #47 before the pattern was visible — and the loop is self-sustaining, because
 * the next turn writes the next heartbeat.
 *
 * That is friction with no safety left in it, which is this repo's own test for a
 * guard that has stopped earning its keep. A per-turn clock tick is not work at risk
 * of being lost; it is bookkeeping, and the repo's own convention batches it into
 * periodic "event tail + heartbeats" commits.
 *
 * So: block on anything a human or an agent authored. Report, without blocking, when
 * the ONLY loose changes are machine-written. The conservative half matters — an
 * untracked file ALWAYS blocks, because a new file is never churn, and a session
 * record blocks the moment its diff touches anything beyond the clock fields.
 */
const CHURN_PATHS = [
  '.claude/workstream/events/',                        // append-only log tail
  '.claude/workstream/meta/invariant-firing-log.yaml', // stamped by every verify
  '.claude/workstream/chain-anchors.yaml',             // stamped by the event chain
];

/**
 * FILES THE KIT'S OWN SESSIONSTART HOOKS WRITE ARE NOT THIS SESSION'S WORK (WS-1085).
 *
 * Measured 2026-10-10 in eight repos upgraded to 3.44.0: a session that opened the
 * repo and did nothing ended blocked, told to commit what cwos-reconcile,
 * cwos-usage-derive and cwos-session-register had just written. Run in an
 * untouched copy, the four SessionStart hooks leave: queue-index.yaml,
 * findings-index.yaml and system-summary.yaml (reconcile), usage.yaml
 * (usage-derive) and this session's own new record under sessions/ (register).
 *
 * cwos-git.js stage already leaves the shared-derived ones out; this hook now
 * reads the same list (lib/derived-state.js) and adds the two reconcile outputs
 * that list does not name. A session record is excused only when it is the
 * RUNNING session's own — a peer's or a dead session's record is still loose work.
 *
 * THE DATED EVENT CHUNK IS THE SAME CASE (WS-1270; ServeYourNote WS-877,
 * measured 2026-10-26 against 3.47.0). Every event append lands in
 * `events/<YYYY-MM-DD>.jsonl`, and the first append of a day CREATES that file,
 * so in a repo that tracks events/ it is a new, untracked path from the first
 * SessionStart until someone commits it. CHURN_PATHS already excuses a
 * MODIFIED chunk; the untracked first-of-the-day chunk was the one path left,
 * and it blocked every session's every turn end for the rest of the day
 * (ServeYourNote's primary tree held six such files at once). It is the same
 * bookkeeping as current.jsonl and rides the same state autocommit.
 */
let DERIVED_STATE = { SHARED_DERIVED: [], isNodeLocal: () => false };
try { DERIVED_STATE = require('../lib/derived-state'); } catch { /* list unavailable: the extras below still apply */ }
const HOOK_WRITTEN = [
  '.claude/workstream/findings-index.yaml',
  '.claude/workstream/system-summary.yaml',
];
// session-report-log.cjs rewrites one of these every turn (WS-945); the next
// session start's cwos-state-autocommit carries them.
const HOOK_WRITTEN_DIRS = ['.claude/workstream/reports/'];
// The event log's daily chunk (cwos-event.js append), see above. Exactly the
// dated name: a hand-made file under events/ is still somebody's work.
const EVENT_CHUNK = /^\.claude\/workstream\/events\/\d{4}-\d{2}-\d{2}\.jsonl$/;

/** True when the kit's own hooks wrote this repo-relative path, or it is the running session's record. */
function isHookWritten(file, sessionId) {
  if (DERIVED_STATE.SHARED_DERIVED.includes(file) || HOOK_WRITTEN.includes(file) || DERIVED_STATE.isNodeLocal(file)) return true;
  if (HOOK_WRITTEN_DIRS.some((d) => file.startsWith(d) && file.endsWith('.md'))) return true;
  if (EVENT_CHUNK.test(file)) return true;
  const mine = sessionId ? String(sessionId).slice(0, 8) : null;
  return !!mine && file.startsWith('.claude/workstream/sessions/') && file.endsWith(`-${mine}.yaml`);
}

const CHURN_KEYS = /^[+-]\s*(last_heartbeat|pid|pid_recorded_at|last_updated|updated_at):/;

/**
 * True only when every loose change is machine-written bookkeeping.
 *
 * Derives the file list from `git diff --name-only` rather than parsing porcelain
 * columns. Found by testing 2026-09-19: `git status --porcelain` prefixes an
 * unstaged change with a SPACE, and trimming the whole output shifts the first
 * line's columns by one — which silently ate the leading dot of `.claude/...` and
 * made every path test fail. Column arithmetic over trimmed output is a trap; a
 * name list has no columns to misread.
 */
function isChurnOnly(excluded = []) {
  let untracked = '', unstaged = '', staged = '';
  try {
    untracked = git(['ls-files', '--others', '--exclude-standard']);
    unstaged = git(['diff', '--name-only']);
    staged = git(['diff', '--cached', '--name-only']);
  } catch { return false; }

  // Paths the caller already set aside (case-collision artifacts, hook-written
  // files) are neither loose nor churn.
  const skip = new Set(excluded);
  if (untracked.split('\n').some((f) => f.trim() && !skip.has(f.trim()))) return false; // a new file is never churn

  const unstagedFiles = unstaged.split('\n').map((f) => f.trim()).filter((f) => f && !skip.has(f));
  const files = [...new Set([...unstagedFiles, ...staged.split('\n').map((f) => f.trim()).filter((f) => f && !skip.has(f))])];
  if (!files.length) return false;

  for (const file of files) {
    if (CHURN_PATHS.some((prefix) => file.startsWith(prefix))) continue;
    if (/^\.claude\/workstream\/sessions\/.*\.yaml$/.test(file)) {
      let diff = '';
      try { diff = `${git(['diff', '--', file])}\n${git(['diff', '--cached', '--', file])}`; }
      catch { return false; }
      const changed = diff.split('\n').filter((l) => /^[+-][^+-]/.test(l));
      if (changed.length && changed.every((l) => CHURN_KEYS.test(l))) continue;
      return false;
    }
    return false;
  }
  return true;
}

function main() {
  let input = {};
  try { input = JSON.parse(require('node:fs').readFileSync(0, 'utf8') || '{}'); } catch { /* not a hook call */ }
  if (input.stop_hook_active) process.exit(0);

  let branch, dirty, ahead = '', hasUpstream = true;
  try {
    branch = git(['branch', '--show-current']);
    // --untracked-files=all: plain porcelain collapses a new directory to `dir/`,
    // which no peer's file lock can match — a live session's new file in a new
    // directory would then read as adoptable. Every path must be a file path.
    dirty = gitRaw(['status', '--porcelain', '--untracked-files=all']).replace(/\n+$/, '');
  } catch { process.exit(0); } // not a git repo, or git is unavailable

  // Detached HEAD: a rebase, bisect or CI checkout. Nothing to push to, and
  // nagging there is friction with no safety in it.
  if (!branch) process.exit(0);

  try { ahead = git(['rev-list', '--count', '@{upstream}..HEAD']); }
  catch { hasUpstream = false; }

  // See localOnlyCommits: a branch with no upstream is at risk only by the
  // commits no remote has, and a fresh agent worktree has none.
  const localOnly = hasUpstream ? 0 : localOnlyCommits();
  const noUpstreamWithCommits = !hasUpstream && localOnly > 0;

  // See caseCollisionArtifacts: two tracked paths that differ only in case are
  // one file on this disk and always read as modified. Not work; never stageable.
  const allDirty = dirty ? dirty.split('\n').filter(Boolean) : [];
  const collisions = allDirty.length ? caseCollisionArtifacts(allDirty) : [];
  const handled = (l) => collisions.includes(l) || isHookWritten(porcelainPath(l), input.session_id);
  const dirtyLines = allDirty.filter((l) => !handled(l));
  const hookWritten = allDirty.filter((l) => !collisions.includes(l) && isHookWritten(porcelainPath(l), input.session_id));
  const aheadCount = hasUpstream ? parseInt(ahead || '0', 10) : 0;
  // See unpushedIsBookkeeping: commits that carry only heartbeats, the event
  // tail and hook-written state are not work at risk, and counting them
  // switched off every exemption below.
  const bookkeepingAhead = aheadCount > 0 && unpushedIsBookkeeping(input.session_id);
  const unpushed = bookkeepingAhead ? 0 : aheadCount;
  const aheadNote = bookkeepingAhead
    ? `${aheadCount} unpushed commit(s) carry bookkeeping only (heartbeats, event tail, hook-written state) — they ride the next real push.`
    : null;

  if (dirtyLines.length === 0 && unpushed === 0 && !noUpstreamWithCommits) {
    const note = [];
    if (aheadNote) note.push(aheadNote);
    if (collisions.length) note.push(...collisionNote(collisions));
    if (note.length) process.stdout.write(JSON.stringify({ decision: 'approve', reason: note.join('\n') }));
    process.exit(0);
  }

  // Churn alone, and nothing unpushed: say so and get out of the way.
  if (unpushed === 0 && !noUpstreamWithCommits && isChurnOnly([...collisions, ...hookWritten].map(porcelainPath))) {
    process.stdout.write(JSON.stringify({
      decision: 'approve',
      reason: `Loose changes are machine churn only (${dirtyLines.length} path(s): heartbeat, event tail, stamps). `
        + 'Not blocking — it rides the next real commit. Blocking here cancels in-flight CI every turn.'
        + (aheadNote ? `\n${aheadNote}` : ''),
    }));
    process.exit(0);
  }

  const peers = liveSessionPeers(input.session_id);
  const { adopted, peerOwned, unattributed } = partitionLoosePaths(dirtyLines.map(porcelainPath), peers);

  // Only a live peer's work is loose, and nothing of ours is unpushed: there is
  // nothing this session may land, so a block here would say "leave these" and
  // refuse to let the turn end in the same breath (WS-1270; the second session
  // of the day in ServeYourNote saw exactly that, on the first session's own
  // untracked record). The peer's own Stop hook holds its work; once its process
  // is gone its record stops counting as a peer and the next session adopts it.
  if (!adopted.length && !unattributed.length && unpushed === 0 && !noUpstreamWithCommits) {
    const note = [`Loose work is a live peer's only (${peerOwned.length} path(s)) — not blocking; its own Stop hook holds it.`];
    if (aheadNote) note.push(aheadNote);
    for (const { path: p, owner } of peerOwned.slice(0, 6)) note.push(`  ${p}   (${owner})`);
    if (collisions.length) note.push(...collisionNote(collisions));
    process.stdout.write(JSON.stringify({ decision: 'approve', reason: note.join('\n') }));
    process.exit(0);
  }

  const reason = [];
  reason.push(`Work is still loose on branch \`${branch}\`.`);
  reason.push('');
  if (adopted.length) {
    reason.push(`YOURS TO LAND — ${adopted.length} path(s). No live session on this machine owns them,`);
    reason.push('so if they were left by a session that died, you are the only one who');
    reason.push('can land them. "Not mine" is not an answer for these: nobody else will.');
    for (const p of adopted.slice(0, 12)) reason.push(`  ${p}`);
    if (adopted.length > 12) reason.push(`  … and ${adopted.length - 12} more`);
    reason.push('');
  }
  if (peerOwned.length) {
    reason.push(`LIVE PEER'S — ${peerOwned.length} path(s). Locked by a session whose process is running.`);
    reason.push('Leave these; landing them would sweep its work mid-edit.');
    for (const { path: p, owner } of peerOwned.slice(0, 12)) reason.push(`  ${p}   (${owner})`);
    reason.push('');
  }
  if (unattributed.length) {
    const who = peers.filter((s) => !s.files.length).map((s) => `${s.id} pid ${s.pid}`).join(', ');
    reason.push(`UNATTRIBUTED — ${unattributed.length} path(s). A live session (${who}) holds no file`);
    reason.push('locks, so these may be its work. Land the ones you can show are yours or');
    reason.push('a dead session\'s; name the rest.');
    for (const p of unattributed.slice(0, 12)) reason.push(`  ${p}`);
    reason.push('');
  }
  if (collisions.length) {
    reason.push(...collisionNote(collisions));
    reason.push('');
  }
  if (noUpstreamWithCommits) {
    reason.push(`NO UPSTREAM — ${localOnly} commit(s) on a branch that has never been pushed,`);
    reason.push('and no remote has them: nothing off this machine has a copy.');
    reason.push('');
  } else if (unpushed > 0) {
    reason.push(`UNPUSHED — ${unpushed} commit(s) exist only on this machine.`);
    reason.push('');
  }
  reason.push('Stage by explicit path — never `git add -A`, which sweeps a peer session');
  reason.push('mid-edit in a shared tree. Then commit and push:');
  reason.push('');
  if (PROTECTED_BRANCHES.has(branch)) {
    // The old text said `git push -u origin main` — an instruction to do the one
    // thing the repo forbids. A protected branch lands through a PR.
    reason.push(`  git switch -c <type>/<slug>          # \`${branch}\` is protected — never commit to it`);
  }
  reason.push(`  git add <path> [<path> ...]`);
  reason.push(`  git commit -m "<what changed>"`);
  reason.push(PROTECTED_BRANCHES.has(branch)
    ? '  git push -u origin HEAD && gh pr create --fill'
    : `  git push -u origin ${branch}`);
  // Measured 2026-11-03: in 75 of 150 session endings the final message was a reply
  // to this block, a git account that buried why the session stopped. The reply this
  // block forces is the session's last words, so ask for the handoff there.
  reason.push('');
  reason.push('Then make your closing message the handoff block (.claude/rules/session-handoff.md):');
  reason.push('its `git:` line names anything you leave and whose it is. No separate git summary.');

  process.stdout.write(JSON.stringify({ decision: 'block', reason: reason.join('\n') }));
  process.exit(0);
}

const PROTECTED_BRANCHES = new Set(['main', 'master']);

/**
 * AN UNPUSHED HEARTBEAT IS NOT UNPUSHED WORK (WS-1049, Claude-Poker-Tracker
 * 2026-11-03; the same condition held in HomeBase).
 *
 * Every exemption in main() — machine churn, hook-written files, a live peer's
 * paths — required `unpushed === 0`. So one peer's heartbeat-only commit, or the
 * session's own record committed a turn ago, made the branch "ahead", and the
 * hook demanded a push whose pre-push gate cost 9-25 minutes under memory
 * pressure (measured 2026-10-09: 25m40s to push one heartbeat commit, after
 * which the branch was one ahead again). The hook's question is "would anything
 * be lost if this machine died now?", and a clock tick would not.
 *
 * Judged COMMIT BY COMMIT, never on the net range (inspection 2026-11-05).
 * A net `@{upstream}..HEAD` diff hides any commit a later one undid: real work
 * added then removed, a `git revert`, a `merge -s ours` of a work branch. Each of
 * those commits exists only on this machine, and the net diff approved them.
 * So every unpushed commit must, on its own:
 *   - have exactly one parent (a merge or a root commit is somebody's act);
 *   - change at least one file (an empty commit is too);
 *   - touch only bookkeeping, with renames split into delete + add so the
 *     source of a rename cannot hide:
 *       a dated event chunk, or a path isHookWritten() excuses;
 *       a MODIFIED stamp file named in CHURN_PATHS (never added or deleted);
 *       a MODIFIED session record whose diff changes only top-level clock keys.
 * A hand-made file under events/, a new or deleted record, any other file, or
 * a git read that fails answers false — the conservative side, which blocks.
 */
const CLOCK_LINE = /^[+-](last_heartbeat|pid|pid_recorded_at|last_updated|updated_at):/;
const STAMP_FILES = CHURN_PATHS.filter((p) => !p.endsWith('/'));

function unpushedIsBookkeeping(sessionId) {
  let list = '';
  try { list = git(['rev-list', '--parents', '@{upstream}..HEAD']); } catch { return false; }
  const commits = list.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.split(/\s+/));
  if (!commits.length) return false;
  for (const [sha, ...parents] of commits) {
    if (parents.length !== 1) return false;
    let changes = '';
    try { changes = git(['diff-tree', '-r', '--no-commit-id', '--no-renames', '--name-status', sha]); } catch { return false; }
    const rows = changes.split('\n').map((l) => l.replace(/\r$/, '')).filter(Boolean)
      .map((l) => { const [st, ...p] = l.split('\t'); return { st: st[0], file: p.join('\t') }; });
    if (!rows.length) return false;
    for (const { st, file } of rows) {
      if (EVENT_CHUNK.test(file) || isHookWritten(file, sessionId)) continue;
      if (st === 'M' && STAMP_FILES.includes(file)) continue;
      if (st === 'M' && /^\.claude\/workstream\/sessions\/[^/]+\.yaml$/.test(file)) {
        let patch = '';
        try { patch = git(['diff-tree', '-p', '--no-commit-id', '--no-renames', sha, '--', file]); } catch { return false; }
        // Every + or - line except the two file headers. Column-0 YAML list
        // items count (a `- WS-2` added to claimed_items is not a tick).
        const changed = patch.split('\n').map((l) => l.replace(/\r$/, ''))
          .filter((l) => /^[+-]/.test(l) && !/^(\+\+\+ (b\/|\/dev\/null)|--- (a\/|\/dev\/null))/.test(l));
        if (changed.length && changed.every((l) => CLOCK_LINE.test(l))) continue;
        return false;
      }
      return false;
    }
  }
  return true;
}

/**
 * A NEVER-PUSHED BRANCH IS AT RISK BY ITS UNIQUE COMMITS, NOT BY ITS NAME
 * (WS-1140, measured in ServeYourNote 2026-10-15).
 *
 * This hook used to block on every branch without an upstream. Every fresh
 * agent worktree is exactly that — `git worktree add -b wt/x origin/main` has
 * no upstream and not one commit of its own — so every turn in every agent
 * worktree was forced to continue, with nothing at risk. The hook's question
 * has always been "does anything off this machine have a copy?", and for a
 * branch with no upstream the answer is the commits no remote-tracking ref
 * reaches. Zero: nothing to say. Any: block, exactly as an upstream branch that
 * is ahead blocks — a worktree removed with a local-only commit loses it.
 *
 * A repo with no remote at all has nowhere to push; telling it to push every
 * turn is friction with no safety in it, so it counts as nothing at risk.
 * Fails toward "at risk" (1) when git cannot answer.
 */
function localOnlyCommits() {
  try {
    if (!git(['remote'])) return 0;
    return parseInt(git(['rev-list', '--count', 'HEAD', '--not', '--remotes']) || '0', 10) || 0;
  } catch { return 1; }
}

/**
 * CASE-COLLISION ARTIFACTS ARE NOT LOOSE WORK (WS-1140, ServeYourNote 2026-10-15).
 *
 * ServeYourNote tracks design/templates/FDB-template.md AND fdb-template.md. On
 * a case-insensitive filesystem the two are one file on disk, so whichever was
 * checked out second always reads as modified against the other's blob. It can
 * never be staged meaningfully — and the hook said "YOURS TO LAND" about it on
 * every turn of every session, which teaches a session to skim this hook.
 *
 * Returns the porcelain lines that are such artifacts: an UNSTAGED modification
 * (` M`) of a tracked path that shares its lower-cased spelling with another
 * tracked path, on a repo git itself records as case-insensitive
 * (core.ignorecase, set at clone/init by probing the filesystem). Narrow on
 * purpose: a staged change, a deletion or an untracked file on one of those
 * paths is somebody's deliberate act — the fix for the collision itself is
 * one — and still blocks. On a case-sensitive filesystem nothing is excused,
 * because there the two files are distinct and an edit to either is real.
 */
function caseCollisionArtifacts(lines) {
  let ignoreCase = '';
  try { ignoreCase = git(['config', '--get', 'core.ignorecase']); } catch { return []; } // unset
  if (ignoreCase.toLowerCase() !== 'true') return [];
  let tracked = '';
  try { tracked = gitRaw(['ls-files', '-z']); } catch { return []; }
  const seen = new Map();
  for (const p of tracked.split('\0')) {
    if (!p) continue;
    const k = p.toLowerCase();
    seen.set(k, (seen.get(k) || 0) + 1);
  }
  return lines.filter((l) => l.startsWith(' M') && (seen.get(porcelainPath(l).toLowerCase()) || 0) > 1);
}

function collisionNote(lines) {
  const out = [`CASE COLLISION — ${lines.length} path(s). Not yours to land, and not loose work:`];
  out.push('the repo tracks two paths that differ only in case, which this filesystem');
  out.push('stores as one file, so one of them always reads as modified. Do not stage it.');
  for (const l of lines.slice(0, 6)) out.push(`  ${porcelainPath(l)}`);
  out.push('The fix is in the repo, not this session: `git mv` one of the pair to a');
  out.push('distinct name (or `git rm --cached` the duplicate) on a case-sensitive checkout.');
  return out;
}

/** `git status --porcelain` line → path. Rename lines (`R  a -> b`) yield the new path. */
function porcelainPath(line) {
  const p = line.slice(3);
  const arrow = p.indexOf(' -> ');
  return (arrow >= 0 ? p.slice(arrow + 4) : p).replace(/^"|"$/g, '');
}

/**
 * DEAD SESSIONS' WORK WAS LOST BY DEFAULT (founder, 2026-10-02).
 *
 * This hook used to end with "if some of it is genuinely not yours to land, say
 * which and why — that is an answer." Every session that started after another
 * one died took that exit: the corpse's recovery record, the event tail, the
 * chain anchor all sat on `main` uncommitted, each new session said "not mine",
 * and nothing would ever land them. Measured that day: three abandoned sessions
 * (pids 36224, 5256, both gone) had left five modified files, and the only
 * running Claude session in the repo declined them. Founder: "Their work being
 * lost by default is the open work problem."
 *
 * "Not mine" is only true when a LIVE session owns the path. So the hook now
 * answers that itself instead of leaving it to a session that cannot see who
 * else is running: it lists the session records on this machine, keeps those
 * whose process is not provably dead (session-liveness.js — a dead pid is proof,
 * a live pid is only "not yet proven dead", so a pid-reuse false-alive errs
 * toward leaving work alone, never toward sweeping it), and attributes each
 * loose path by the peer's `files_locked`. Whatever no live peer can own is the
 * current session's to land.
 *
 * Foreign-host records are skipped: a node1 session's work is not in this tree.
 * A hostless active record counts as a peer only if its pid is running here.
 * If the liveness library cannot be loaded, every active record counts as a
 * peer — the old, conservative behaviour, never a silent sweep.
 */
function liveSessionPeers(currentSessionId) {
  const fs = require('node:fs');
  const path = require('node:path');
  let liveness = null;
  try { liveness = require(path.join(__dirname, '..', 'lib', 'session-liveness.js')); } catch { /* conservative below */ }

  const dir = path.join(REPO, '.claude', 'workstream', 'sessions');
  const mine = currentSessionId ? String(currentSessionId).slice(0, 8) : null;
  let files = [];
  try { files = fs.readdirSync(dir).filter((f) => f.endsWith('.yaml')); } catch { return []; }

  const peers = [];
  for (const f of files) {
    if (mine && f.endsWith(`-${mine}.yaml`)) continue;
    let text = '';
    try { text = fs.readFileSync(path.join(dir, f), 'utf8'); } catch { continue; }
    const rec = parseSessionRecord(text);
    if (rec.status !== 'active') continue;
    let live = true;
    if (liveness) {
      if (rec.host) {
        if (!liveness.isLocalHostRecord(rec)) continue;   // the record, so node_id counts (WS-893)
        live = !liveness.classifySession(rec).proof;
      } else {
        live = liveness.isPidAlive(rec.pid) === true;
      }
    }
    if (!live) continue;
    peers.push({ id: rec.id || f.replace(/\.yaml$/, ''), pid: rec.pid, files: rec.files_locked, record: `.claude/workstream/sessions/${f}` });
  }
  return peers;
}

/** Enough of a session YAML to judge it: top-level scalars and the files_locked list. */
function parseSessionRecord(text) {
  const rec = { files_locked: [] };
  let inLocks = false;
  for (const raw of text.split(/\r?\n/)) {
    const top = raw.match(/^([a-z_]+):\s*(.*)$/);
    if (top) {
      inLocks = top[1] === 'files_locked';
      const v = top[2].trim().replace(/^"|"$/g, '');
      if (!inLocks && v && v !== 'null') rec[top[1]] = top[1] === 'pid' ? parseInt(v, 10) : v;
      continue;
    }
    const item = inLocks && raw.match(/^\s+-\s+"?([^"]+?)"?\s*$/);
    if (item) rec.files_locked.push(item[1]);
  }
  return rec;
}

/**
 * Split loose paths three ways. Pure, so it is tested without git or processes.
 *   peerOwned     a live peer locks it (exact path, or a locked directory prefix),
 *                 or it is that peer's own session record
 *   unattributed  no lock matches, but some live peer holds no locks at all —
 *                 its work cannot be told apart, so it is not swept
 *   adopted       nothing live can own it: the current session lands it
 */
function partitionLoosePaths(paths, peers) {
  const adopted = [], peerOwned = [], unattributed = [];
  const lockless = peers.some((s) => !s.files.length);
  for (const p of paths) {
    const owner = peers.find((s) => s.record === p
      || s.files.some((l) => p === l || (l.endsWith('/') && p.startsWith(l))));
    if (owner) peerOwned.push({ path: p, owner: `${owner.id} pid ${owner.pid}` });
    else if (lockless) unattributed.push(p);
    else adopted.push(p);
  }
  return { adopted, peerOwned, unattributed };
}

module.exports = { partitionLoosePaths, parseSessionRecord, porcelainPath, caseCollisionArtifacts, localOnlyCommits, isHookWritten, unpushedIsBookkeeping };

if (require.main === module) {
  try { main(); } catch { process.exit(0); }
}
