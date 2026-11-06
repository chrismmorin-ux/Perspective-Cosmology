#!/usr/bin/env node
/**
 * cwos-state-autocommit — commit leftover CWOS state at session start.
 *
 * ROOT CAUSE THIS FIXES. State capture assumed /session-end runs; measured
 * reality is ~12% (see CLAUDE.md "Why capture now instead of at session end").
 * The same structural fix as WS-533 applied to durability: maintenance was
 * automatic (hooks rewrite state every session) while the commit was manual
 * (a ceremony that rarely runs). Result observed in physical-therapy-by-ai on
 * 2026-08-13: nine days of governance state — tier escalations, capability
 * briefs, session records, even the hooks wiring itself — existed only in the
 * working tree. The durable record must not depend on the ceremony; it depends
 * on the thing that always happens, which is the NEXT session starting.
 *
 * Commit-on-next-start, not commit-on-stop: a Stop hook fires per response and
 * would litter history with micro-commits; SessionStart yields at most one
 * catch-up commit per session, containing exactly what previous sessions left.
 *
 * SCOPE IS STATE, NEVER CODE. Only these pathspecs are ever staged:
 *   - the workstream dir (.claude/workstream/ or configured equivalent)
 *   - the configured system_dir (default: system/)
 *   - root-level .cwos-* files (.cwos-version, .cwos-config.yaml, ...)
 * Founder code is out of bounds by construction, not by filtering.
 *
 * WHEN IT REFUSES (prints one line, exits 0):
 *   - staged changes already in the index (someone is mid-commit; sweeping
 *     their staging area into an auto-commit would be theft)
 *   - merge / rebase / cherry-pick / revert / bisect in progress
 *   - detached HEAD (an auto-commit nobody can find is worse than none)
 * And silently (exit 0, no output): not a git repo, nothing to commit, or
 * `state_autocommit: false` in .cwos-config.yaml (founder opt-out).
 *
 * NEVER BLOCKS. Always exits 0. Same contract as every SessionStart hook: a
 * session that cannot start is worse than state nobody committed.
 *
 * Usage:
 *   node cwos-state-autocommit.js              # commit if state is dirty
 *   node cwos-state-autocommit.js --dry-run    # report what would be committed
 *   node cwos-state-autocommit.js --verbose    # explain silent skips too
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { cliGate } = require('./lib/cli');
const { readYAMLFile, makeEventEmitter } = require('./lib/cwos-utils');
const { isNodeLocal } = require('./lib/derived-state');

const emitEvent = makeEventEmitter();

const CLI = {
  name: 'cwos-state-autocommit',
  summary: 'commit uncommitted CWOS state (workstream/, system/, .cwos-*) left by previous sessions',
  flags: {
    'dry-run': { type: 'boolean', describe: 'list what would be committed; write nothing' },
    verbose: { type: 'boolean', describe: 'explain skips that are silent by default' },
  },
  notes: 'Always exits 0 — durability bookkeeping must never block a session start.',
};

function git(repoRoot, args, opts) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  });
}

function gitOk(repoRoot, args) {
  try { git(repoRoot, args); return true; } catch { return false; }
}

/** An operation in progress means a human (or another tool) owns the index. */
function operationInProgress(repoRoot) {
  let gitDir;
  try { gitDir = git(repoRoot, ['rev-parse', '--absolute-git-dir']).trim(); } catch { return 'unreadable git dir'; }
  const markers = ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'BISECT_LOG', 'rebase-apply', 'rebase-merge'];
  for (const m of markers) {
    if (fs.existsSync(path.join(gitDir, m))) return m;
  }
  return null;
}

/** State pathspecs that actually exist in this repo. */
function statePathspecs(repoRoot) {
  const specs = [];
  // Workstream dir: honor .cwos-config.yaml workstream_dir if ever set; default location.
  const cfg = readConfig(repoRoot);
  const wsDir = (cfg && cfg.workstream_dir) || '.claude/workstream';
  const sysDir = (cfg && cfg.system_dir) || 'system';
  for (const dir of [wsDir, sysDir]) {
    if (dir && fs.existsSync(path.join(repoRoot, dir))) specs.push(dir);
  }
  for (const entry of fs.readdirSync(repoRoot)) {
    if (entry.startsWith('.cwos-') && fs.statSync(path.join(repoRoot, entry)).isFile()) {
      specs.push(entry);
    }
  }
  return specs;
}

/**
 * Engine runs the pre-commit manifest gate would refuse (WS-305). One run that
 * fails the gate used to fail the whole commit, so from 2026-10-23 every state
 * file in HomeBase sat uncommitted behind run-040 for a week. The gate checks a
 * run when its manifest.yaml is staged; an untracked run shows in status as its
 * directory, which stages the manifest too. Those runs are validated here with
 * the gate's own validator and held back by name; everything else commits.
 * `validate(runId)` returns null when the run passes, else the first error line.
 */
function heldBackRuns(wsDir, toAdd, validate) {
  const prefix = `${wsDir.replace(/\\/g, '/').replace(/\/$/, '')}/runs/`;
  const held = new Map();
  for (const p of toAdd) {
    if (!p.startsWith(prefix)) continue;
    const rest = p.slice(prefix.length);
    const m = /^(run-[^/]+)(\/manifest\.yaml|\/)?$/.exec(rest);
    if (!m || held.has(m[1])) continue;
    const reason = validate(m[1]);
    if (reason) held.set(m[1], reason);
  }
  return held;
}

/**
 * Paths that edit a sealed run the pre-commit-runs-immutability lane would
 * refuse: runs/<id>/manifest.yaml or runs/<id>/artifacts/** for a run whose
 * completed manifest (completed_at) is already in HEAD, as the lane judges, and which an
 * engine_run_completed event has sealed. Map of path -> run id. Empty when the
 * checker is not installed, so a repo without WS-314 behaves as before.
 */
function sealedRunEdits(repoRoot, wsDir, paths, opts = {}) {
  const out = new Map();
  const prefix = `${wsDir.split(String.fromCharCode(92)).join('/').replace(/[/]$/, '')}/runs/`;
  let isSealed = opts.isSealed;
  if (!isSealed) {
    try { isSealed = require('./cwos-runs-sealed').isSealed; } catch { return out; }
  }
  const eventsDir = opts.eventsDir || path.join(findWsDir(repoRoot, wsDir), 'events');
  // The lane's rule exactly: locked only when HEAD's manifest already records
  // completed_at. A first landing, and an incremental run's completion commit
  // (run-036), are the run finishing, not an edit.
  const inHead = opts.inHead || ((id) => {
    try {
      const text = git(repoRoot, ['show', `HEAD:${prefix}${id}/manifest.yaml`]);
      return /^completed_at:[ \t]*"?[0-9]/m.test(text);
    } catch { return false; }
  });
  const verdict = new Map();
  for (const p of paths) {
    if (!p.startsWith(prefix)) continue;
    const m = /^(run-[A-Za-z0-9_-]+)[/](manifest[.]yaml$|artifacts[/])/.exec(p.slice(prefix.length));
    if (!m) continue;
    if (!verdict.has(m[1])) {
      let sealed = false;
      try { sealed = inHead(m[1]) && isSealed(m[1], eventsDir); } catch { sealed = false; }
      verdict.set(m[1], sealed);
    }
    if (verdict.get(m[1])) out.set(p, m[1]);
  }
  return out;
}

/** The workstream dir events live in: the shared one when this is a linked worktree (WS-576). */
function findWsDir(repoRoot, wsDir) {
  try { return require('./lib/cwos-utils').findWorkstreamDir(repoRoot) || path.join(repoRoot, wsDir); }
  catch { return path.join(repoRoot, wsDir); }
}

function manifestValidator(repoRoot) {
  const validator = path.join(__dirname, 'cwos-engine-manifest.js');
  if (!fs.existsSync(validator)) return () => null;
  return (runId) => {
    try {
      execFileSync(process.execPath, [validator, 'validate', '--run-id', runId], {
        cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      });
      return null;
    } catch (err) {
      const out = `${err.stderr || ''}\n${err.stdout || ''}`.split('\n').map((l) => l.trim()).filter(Boolean);
      return out[0] || 'fails the engine-manifest gate';
    }
  };
}

/**
 * May the staged state be committed? (WS-1029)
 *
 * Splits the staged paths into state (under a state pathspec, never node-local)
 * and everything else, then asks whether a LIVE session's file lock covers any
 * staged state path. `listFileLocks` is the same reader `cwos-git locks` uses,
 * so this and the commit guard cannot disagree about who is live.
 *
 * Fails toward skipping: an unreadable index, a lock reader that will not load,
 * or a live holder all return ok: false with the reason for the one-line skip.
 */
function stagedVerdict(repoRoot, specs, wsDir, opts = {}) {
  let names = '';
  // --no-renames: a staged rename otherwise reports only its destination, and
  // a live session's lock on the SOURCE would never be checked (inspection
  // 2026-11-05: half of a locked `git mv` was committed).
  try { names = git(repoRoot, ['diff', '--cached', '--no-renames', '--name-only', '-z']); }
  catch { return { ok: false, why: 'could not read the index' }; }
  const staged = names.split('\0').filter(Boolean).map((p) => p.replace(/\\/g, '/'));
  const norm = (s) => s.replace(/\\/g, '/').replace(/\/$/, '');
  const inState = (p) => specs.some((s) => { const n = norm(s); return p === n || p.startsWith(`${n}/`); });
  const state = staged.filter((p) => inState(p) && !isNodeLocal(p));
  const nonState = staged.filter((p) => !state.includes(p));
  if (!state.length) {
    // Nothing of ours is staged; the staged set is someone's code. Committing the
    // unstaged state around it with --only is safe, and still names what it left.
    return { ok: true, state, nonState };
  }
  let holders;
  try {
    const listFileLocks = opts.listFileLocks || require('./lib/cwos-claims').listFileLocks;
    holders = listFileLocks(path.join(repoRoot, wsDir));
  } catch (err) {
    return { ok: false, why: `could not read session locks (${String(err.message).split('\n')[0]})` };
  }
  const covers = (lock, p) => lock === p || (lock.endsWith('/') && p.startsWith(lock));
  for (const h of holders || []) {
    if (!h.live) continue;
    const hit = state.find((p) => (h.files || []).some((l) => covers(String(l).replace(/\\/g, '/'), p)));
    if (hit) return { ok: false, why: `live session ${h.session_id} holds a lock on staged ${hit}` };
  }
  return { ok: true, state, nonState };
}

function readConfig(repoRoot) {
  const p = path.join(repoRoot, '.cwos-config.yaml');
  if (!fs.existsSync(p)) return null;
  try { return readYAMLFile(p); } catch { return null; }
}

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);
  const dryRun = !!values['dry-run'];
  const verbose = !!values.verbose;
  const say = (msg) => process.stdout.write(`[state-autocommit] ${msg}\n`);
  const sayVerbose = (msg) => { if (verbose) say(msg); };

  let repoRoot;
  try { repoRoot = git(process.cwd(), ['rev-parse', '--show-toplevel']).trim(); }
  catch { sayVerbose('skipped: not a git repository'); return 0; }

  const cfg = readConfig(repoRoot);
  if (cfg && cfg.state_autocommit === false) {
    sayVerbose('skipped: disabled via .cwos-config.yaml state_autocommit: false');
    return 0;
  }

  const specs = statePathspecs(repoRoot);
  if (!specs.length) { sayVerbose('skipped: no CWOS state paths in this repo'); return 0; }

  let status;
  try { status = git(repoRoot, ['status', '--porcelain', '--', ...specs]); }
  catch (err) { say(`skipped: git status failed (${err.message.split('\n')[0]})`); return 0; }
  // NEVER the node-local files (WS-884). This used to `git add -A` the whole
  // workstream dir, which carried every machine's liveness stamps, recovery
  // mutex and leaked .tmp files into commits, and every pull between two
  // machines then conflicted on exactly those paths. The add-list is derived
  // from status and filtered ONCE, so the count, the dry-run, the add and the
  // unwind all agree about what is being committed.
  const dirtyAll = status.split('\n').filter(Boolean);
  const pathOf = (line) => {
    const p = line.slice(3).replace(/\r$/, '');
    const arrow = p.indexOf(' -> ');
    return (arrow >= 0 ? p.slice(arrow + 4) : p).replace(/^"|"$/g, '').replace(/\\/g, '/');
  };
  const wsDir = (cfg && cfg.workstream_dir) || '.claude/workstream';
  const local = dirtyAll.filter((line) => !isNodeLocal(pathOf(line)));
  const held = heldBackRuns(wsDir, local.map(pathOf), manifestValidator(repoRoot));
  const runOf = (p) => { const m = /\/runs\/(run-[^/]+)(\/|$)/.exec(p); return m && m[1]; };
  const kept = local.filter((line) => !held.has(runOf(pathOf(line))));
  for (const [runId, reason] of held) {
    say(`held back ${runId}: fails the engine-manifest gate (${reason}); fix the run, the rest commits`);
  }
  // Edits to a SEALED, already-landed run would be refused by the runs-
  // immutability lane, and one refused path fails the whole commit (WS-1264).
  // Held back by path, so that run's addendum.md and every other file commit.
  const sealedHeld = sealedRunEdits(repoRoot, wsDir, kept.map(pathOf));
  const dirty = kept.filter((line) => !sealedHeld.has(pathOf(line)));
  for (const runId of new Set(sealedHeld.values())) {
    say(`held back edits to sealed ${runId} (manifest/artifacts are immutable once sealed; record changes in its addendum.md); the rest commits`);
  }
  const nodeLocalSkipped = dirtyAll.length - local.length;
  if (!dirty.length) {
    sayVerbose(nodeLocalSkipped
      ? `clean: only ${nodeLocalSkipped} node-local file(s) dirty (never committed)`
      : 'clean: no uncommitted state');
    return 0;
  }
  const toAdd = dirty.map(pathOf).filter(Boolean);

  // Loud skips: state IS dirty but committing would be wrong. These lines are
  // the founder's only signal that durability is being withheld and why.
  if (!gitOk(repoRoot, ['symbolic-ref', '-q', 'HEAD'])) {
    say(`skipped: detached HEAD (${dirty.length} state file(s) remain uncommitted)`);
    return 0;
  }
  const op = operationInProgress(repoRoot);
  if (op) {
    say(`skipped: ${op} in progress (${dirty.length} state file(s) remain uncommitted)`);
    return 0;
  }
  // A STAGED INDEX USED TO STOP THIS FOREVER (WS-1029). Skipping protects a
  // live session's half-built commit, which is right. But once the session that
  // staged dies, nothing ever clears its index: the commit guard refuses every
  // later session's plain commit, this skip refuses the automatic path, and the
  // staged set only grows (43 files on 2026-10-04, including a founder-approved
  // work order, cleared by hand). So the skip now asks whose the staged state
  // is. Held by a live session's lock: skip, naming it. Otherwise: commit the
  // state paths alone with `commit --only`, which leaves every other staged
  // file staged and untouched.
  let onlyPaths = null;
  let leftStaged = [];
  let stagedBefore = [];
  let heldStagedPaths = [];
  if (!gitOk(repoRoot, ['diff', '--cached', '--quiet'])) {
    const verdict = stagedVerdict(repoRoot, specs, wsDir);
    if (!verdict.ok) {
      say(`skipped: index has staged changes — ${verdict.why} (${dirty.length} state file(s) remain uncommitted)`);
      return 0;
    }
    leftStaged = verdict.nonState;
    // The staged state is committed too: it is the dead session's, and
    // committing only the unstaged files would leave it wedging the next start.
    // Except a held-back run's files: "held back" must mean held back, and a
    // run the manifest gate refuses would fail this commit on every start
    // (inspection 2026-11-05). They stay staged, named with the rest.
    // Sealed-run edits likewise (WS-1264): the immutability lane would refuse
    // them, and one refused path fails the whole commit.
    // Judged over the --no-renames staged list too: status (and so sealedHeld)
    // names only a rename's destination, so a staged `git mv` of a sealed
    // artifact hid its source, the sealed file's deletion, which then went
    // into --only and the lane refused the commit on every start (merge
    // inspection, 2026-11-05).
    const sealedStaged = sealedRunEdits(repoRoot, wsDir, verdict.state);
    const isHeld = (q) => held.has(runOf(q)) || sealedHeld.has(q) || sealedStaged.has(q);
    const heldStaged = verdict.state.filter(isHeld);
    stagedBefore = verdict.state.filter((q) => !isHeld(q));
    heldStagedPaths = heldStaged;
    onlyPaths = [...new Set([...toAdd, ...stagedBefore])];
  }

  if (dryRun) {
    say(`would commit ${dirty.length} state file(s)${nodeLocalSkipped ? ` (${nodeLocalSkipped} node-local skipped)` : ''}:`);
    for (const line of dirty) process.stdout.write(`  ${line}\n`);
    if (leftStaged.length) say(`would leave ${leftStaged.length} staged non-state file(s) staged: ${leftStaged.slice(0, 5).join(', ')}${leftStaged.length > 5 ? ', …' : ''}`);
    return 0;
  }

  try {
    // Explicit paths, never the directory: status has already excluded ignored
    // paths, `-A` on a path list still stages deletions, and the node-local
    // filter above is the only thing between a stamp and a commit. Chunked for
    // the Windows command line.
    // A path gone from both the index and the disk (a staged deletion) has
    // nothing to add, and `git add` on it errors; the deletion is already in
    // the index, and --only commits it.
    const addable = onlyPaths
      ? toAdd.filter((q) => fs.existsSync(path.join(repoRoot, q)) || gitOk(repoRoot, ['ls-files', '--error-unmatch', '--', q]))
      : toAdd;
    for (let i = 0; i < addable.length; i += 50) {
      git(repoRoot, ['add', '-A', '--', ...addable.slice(i, i + 50)]);
    }
    if (!onlyPaths && gitOk(repoRoot, ['diff', '--cached', '--quiet'])) {
      sayVerbose('clean: nothing staged after add (ignored paths only)');
      return 0;
    }
    const message =
      `CWOS state auto-commit: carry forward ${dirty.length} state file(s)\n\n` +
      'Written by cwos-state-autocommit.js from the SessionStart hook so\n' +
      'workstream/system state survives sessions that never run /session-end.\n' +
      'Contains only CWOS state paths; founder code is out of scope by design.' +
      (held.size ? `\nHeld back (fail the engine-manifest gate): ${[...held.keys()].join(', ')}.` : '');
    // `--only` with a path list commits exactly those paths and leaves the rest
    // of the index as it was, so a dead session's staged CODE is never swept in.
    if (onlyPaths) git(repoRoot, ['commit', '--quiet', '-m', message, '--only', '--', ...onlyPaths]);
    else git(repoRoot, ['commit', '--quiet', '-m', message]);
    const sha = git(repoRoot, ['rev-parse', '--short', 'HEAD']).trim();
    say(`committed ${onlyPaths ? onlyPaths.length : dirty.length} state file(s) as ${sha}`);
    if (leftStaged.length) {
      say(`left ${leftStaged.length} staged non-state file(s) staged, not ours to commit: ` +
        `${leftStaged.slice(0, 5).join(', ')}${leftStaged.length > 5 ? ', …' : ''}`);
    }
    if (heldStagedPaths.length) {
      say(`left ${heldStagedPaths.length} held-back state file(s) staged, as found: ` +
        `${heldStagedPaths.slice(0, 5).join(', ')}${heldStagedPaths.length > 5 ? ', …' : ''}`);
    }
    emitEvent('T15:session-end', 'state-autocommitted', { commit: sha, files: dirty.length });
  } catch (err) {
    // A pre-commit hook rejection or lock contention lands here. Report and
    // unwind the staging we did, so the founder's index is as we found it.
    say(`commit failed: ${String(err.message).split('\n')[0]} (state remains uncommitted)`);
    // Only what WE staged: paths the dead session had already staged stay
    // staged, so the index is as found.
    const ours = toAdd.filter((q) => !stagedBefore.includes(q));
    try { if (ours.length) git(repoRoot, ['reset', '--quiet', '--', ...ours]); } catch { /* best effort */ }
  }
  return 0;
}

// Entry-point guard per WS-544: requiring this file must not commit anything.
if (require.main === module) {
  try {
    process.exit(main());
  } catch (err) {
    process.stderr.write(`state-autocommit: error — ${err.message}\n`);
    process.exit(0);
  }
}

module.exports = { statePathspecs, operationInProgress, heldBackRuns, sealedRunEdits, stagedVerdict };
