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
  const dirty = status.split('\n').filter(Boolean);
  if (!dirty.length) { sayVerbose('clean: no uncommitted state'); return 0; }

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
  if (!gitOk(repoRoot, ['diff', '--cached', '--quiet'])) {
    say(`skipped: index has staged changes (${dirty.length} state file(s) remain uncommitted)`);
    return 0;
  }

  if (dryRun) {
    say(`would commit ${dirty.length} state file(s):`);
    for (const line of dirty) process.stdout.write(`  ${line}\n`);
    return 0;
  }

  try {
    git(repoRoot, ['add', '-A', '--', ...specs]);
    if (gitOk(repoRoot, ['diff', '--cached', '--quiet'])) {
      sayVerbose('clean: nothing staged after add (ignored paths only)');
      return 0;
    }
    const message =
      `CWOS state auto-commit: carry forward ${dirty.length} state file(s)\n\n` +
      'Written by cwos-state-autocommit.js from the SessionStart hook so\n' +
      'workstream/system state survives sessions that never run /session-end.\n' +
      'Contains only CWOS state paths; founder code is out of scope by design.';
    git(repoRoot, ['commit', '--quiet', '-m', message]);
    const sha = git(repoRoot, ['rev-parse', '--short', 'HEAD']).trim();
    say(`committed ${dirty.length} state file(s) as ${sha}`);
    emitEvent('T15:session-end', 'state-autocommitted', { commit: sha, files: dirty.length });
  } catch (err) {
    // A pre-commit hook rejection or lock contention lands here. Report and
    // unwind the staging we did, so the founder's index is as we found it.
    say(`commit failed: ${String(err.message).split('\n')[0]} (state remains uncommitted)`);
    try { git(repoRoot, ['reset', '--quiet', '--', ...specs]); } catch { /* best effort */ }
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

module.exports = { statePathspecs, operationInProgress };
