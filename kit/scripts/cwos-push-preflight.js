#!/usr/bin/env node
/**
 * cwos-push-preflight — pre-flight check that a `git push` to origin's default branch
 * would succeed without a rebase/merge dance.
 *
 * WS-224 / DEC-030 / ADR-026. Used by /autopilot Step 1 to refuse trigger
 * registration when the working tree is dirty or origin has moved ahead.
 * Also usable by any other command that registers a Remote-Trigger
 * (trigger prompts clone origin/master and run autonomously — a dirty
 * tree at trigger-register time means stale context enters the autonomous
 * run, and a diverged HEAD means founder work could be clobbered by a
 * forced push that happens after the fact).
 *
 * Checks (in order, short-circuit on first failure):
 *   1. We are in a git repo (`git rev-parse --is-inside-work-tree`)
 *   2. Working tree is clean — OR only paths listed in --allow-paths are dirty
 *   3. Origin's default branch is reachable (fetch < timeout). The branch is
 *      RESOLVED, not assumed — see resolveDefaultBranch().
 *   4. HEAD is at or ahead of that branch (no upstream commits we haven't
 *      merged — pushing would fast-forward or no-op)
 *
 * Flags:
 *   --allow-paths <p1,p2,...>  Comma-separated repo-relative paths that may
 *                              be dirty. Exact path match OR prefix match
 *                              when the entry ends in '/'.
 *   --timeout-ms <n>           Override ls-remote timeout (default 10000).
 *   --quiet                    Silent unless blocked.
 *   --json                     Machine-readable JSON only; no bundle noise.
 *
 * Exits:
 *   0 = push would succeed
 *   1 = blocked (dirty tree, unreachable origin, diverged HEAD, or other
 *       structural failure)
 *
 * Output:
 *   Default — cwos-context-bundle emitted to stdout; human-readable
 *   summary to stderr on failure.
 *   With --json — single JSON object to stdout, nothing to stderr.
 *
 * Usage:
 *   node kit/scripts/cwos-push-preflight.js
 *   node kit/scripts/cwos-push-preflight.js --allow-paths .claude/workstream/autopilot.yaml
 *   node kit/scripts/cwos-push-preflight.js --allow-paths .claude/workstream/
 *   node kit/scripts/cwos-push-preflight.js --json
 */

'use strict';

require('./lib/preflight');

const { execFileSync, execFile } = require('child_process');
const { emitBundle, bundleError } = require('./lib/cwos-orchestrate');

const DEFAULT_TIMEOUT_MS = 10000;

// ─── CLI ───────────────────────────────────────────────────────────────────

// ADR-063: --help explains and exits WITHOUT acting; an unrecognized flag is
// fatal, never silently ignored. Both used to fail here in the same way -- the
// loop below had no `else`, so anything it did not recognise fell through to a
// full preflight run. `--help` therefore executed the check it was asking about,
// which is precisely the "discover interfaces, don't guess them" failure the ADR
// was written for, in a script whose whole job is to be consulted before a push.
const USAGE = [
  'cwos-push-preflight — check whether a push would succeed, before you make one',
  '',
  'usage: cwos-push-preflight [options]',
  '',
  'options:',
  '  --allow-paths <p1,p2,...>  repo-relative paths that may be dirty. Exact match,',
  '                             or prefix match when the entry ends in "/".',
  '  --timeout-ms <n>           override the origin-reachability timeout (default 10000)',
  '  --quiet                    silent unless blocked',
  '  --json                     machine-readable JSON only; no bundle noise',
  '  -h, --help                 print this usage and exit without acting',
  '',
  'checks, in order, short-circuiting on the first failure:',
  '  1. we are inside a git repo',
  '  2. the working tree is clean, or only --allow-paths entries are dirty',
  '  3. the default branch on origin is reachable (resolved, not assumed)',
  '  4. HEAD is at or ahead of that branch',
  '',
  'exits: 0 = a push would succeed | 1 = blocked | 2 = bad usage',
  '',
].join('\n');

function parseCLI() {
  const args = process.argv.slice(2);
  const config = { allowPaths: [], timeoutMs: DEFAULT_TIMEOUT_MS, quiet: false, asJson: false };
  const needsValue = (flag) => {
    process.stderr.write(`push-preflight: ${flag} requires a value\n\n${USAGE}`);
    process.exit(2);
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--help' || a === '-h') {
      process.stdout.write(USAGE);
      process.exit(0);
    } else if (a === '--allow-paths') {
      if (!args[i + 1]) needsValue('--allow-paths');
      config.allowPaths = args[++i].split(',').map(s => s.trim()).filter(Boolean);
    } else if (a === '--timeout-ms') {
      if (!args[i + 1]) needsValue('--timeout-ms');
      config.timeoutMs = Math.max(1000, parseInt(args[++i], 10) || DEFAULT_TIMEOUT_MS);
    } else if (a === '--quiet') {
      config.quiet = true;
    } else if (a === '--json') {
      config.asJson = true;
    } else {
      // Refusing is the cheap, honest answer. Running anyway and reporting
      // success would tell the caller the flag did something.
      process.stderr.write(`push-preflight: unrecognized argument "${a}"\n\n${USAGE}`);
      process.exit(2);
    }
  }
  return config;
}

// ─── git helpers ───────────────────────────────────────────────────────────

function gitSync(args, opts = {}) {
  try {
    const stdout = execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
    return { ok: true, stdout };
  } catch (err) {
    return { ok: false, error: err.stderr || err.message || String(err), code: err.status };
  }
}

function gitAsync(args, timeoutMs) {
  return new Promise(resolve => {
    const child = execFile('git', args, { encoding: 'utf8' }, (err, stdout, stderr) => {
      if (err) resolve({ ok: false, error: stderr || err.message, code: err.code });
      else resolve({ ok: true, stdout });
    });
    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch { /* ignore */ }
      resolve({ ok: false, error: `ls-remote timed out after ${timeoutMs}ms`, code: 'ETIMEDOUT' });
    }, timeoutMs);
    child.on('exit', () => clearTimeout(timer));
  });
}

// ─── Check implementations ─────────────────────────────────────────────────

function checkInRepo() {
  const r = gitSync(['rev-parse', '--is-inside-work-tree']);
  if (!r.ok) return { ok: false, reason: 'not inside a git repository' };
  if (String(r.stdout).trim() !== 'true') return { ok: false, reason: 'not inside a git working tree' };
  return { ok: true };
}

/**
 * Returns { ok, dirty_paths: string[], blocking_paths: string[] }
 *
 * `dirty_paths` lists every path `git status --porcelain` reports.
 * `blocking_paths` is the subset that's NOT covered by allowPaths.
 */
function checkWorkingTreeClean(allowPaths) {
  const r = gitSync(['status', '--porcelain']);
  if (!r.ok) return { ok: false, reason: `git status failed: ${r.error}` };
  const lines = String(r.stdout).split('\n').filter(l => l.length > 0);
  const dirty = lines.map(parsePorcelainLine).filter(Boolean);

  const blocking = dirty.filter(p => !isAllowed(p, allowPaths));
  return { ok: blocking.length === 0, dirty_paths: dirty, blocking_paths: blocking };
}

/**
 * Parse one porcelain-v1 status line. Format: "XY <path>" or "R  <old> -> <new>".
 * Returns the current path, or null for rename-with-split we don't parse here.
 */
function parsePorcelainLine(line) {
  if (line.length < 4) return null;
  // Skip the two status bytes and the space.
  let rest = line.slice(3);
  // Renames: "old -> new" — take the new side.
  const arrow = rest.indexOf(' -> ');
  if (arrow !== -1) rest = rest.slice(arrow + 4);
  return rest;
}

/**
 * True if `path` matches any allowPaths entry.
 * Rules:
 *   - exact match
 *   - prefix match when the entry ends with '/'
 *   - prefix match with '/' inferred when entry has no extension AND no trailing '/' but path starts with entry + '/'
 */
function isAllowed(p, allowPaths) {
  for (const entry of allowPaths) {
    if (p === entry) return true;
    if (entry.endsWith('/') && p.startsWith(entry)) return true;
    if (!entry.includes('.') && !entry.endsWith('/') && p.startsWith(entry + '/')) return true;
  }
  return false;
}

/**
 * Resolve the branch a push would actually target.
 *
 * This used to be the string 'master', hardcoded in four places. HomeBase is on
 * master, so it was written, tested and used for months without anyone hitting
 * the bug -- while every other repo in the fleet is on main, where the check
 * reported "origin unreachable / fetch failed: couldn't find remote ref master"
 * against a perfectly reachable remote. A false BLOCKED is worse than no check:
 * it teaches you to push past the gate.
 *
 * Resolution order, chosen so this can only match or improve on the old
 * behaviour and never regress it:
 *
 *   1. refs/remotes/origin/HEAD -- what origin itself says its default branch
 *      is. Written by `git clone` and by `git remote set-head`. Verified set
 *      and correct in all five checked-out fleet repos on 2026-09-03
 *      (homebase -> origin/master, the rest -> origin/main), which is what
 *      makes this change safe rather than merely plausible.
 *   2. Whichever remote-tracking branch actually exists, master tried FIRST so
 *      a repo that has always worked keeps behaving identically.
 *   3. 'master' -- exactly the old hardcoded value. The floor of this function
 *      is the behaviour it replaces, so the worst case is the status quo.
 *
 * The branch and the rule that chose it are both reported in the payload:
 * a gate that silently picks a branch is a gate you cannot debug when it
 * picks the wrong one.
 */
function resolveDefaultBranch() {
  const head = gitSync(['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']);
  if (head.ok) {
    const ref = String(head.stdout).trim();
    const name = ref.startsWith('origin/') ? ref.slice('origin/'.length) : ref;
    if (name) return { branch: name, source: 'refs/remotes/origin/HEAD' };
  }
  for (const cand of ['master', 'main']) {
    const r = gitSync(['rev-parse', '--verify', '--quiet', `refs/remotes/origin/${cand}`]);
    if (r.ok) return { branch: cand, source: `refs/remotes/origin/${cand}` };
  }
  return { branch: 'master', source: 'fallback: no origin/HEAD and no origin/master or origin/main' };
}

/**
 * Fetch origin/master so subsequent `merge-base --is-ancestor` calls can
 * distinguish `behind` from `diverged`. `git ls-remote` alone returns the
 * SHA but not the objects — without the objects, `merge-base` sees the
 * remote commit as unknown and reports `diverged` even when we're
 * straightforwardly behind.
 */
async function checkOriginReachable(timeoutMs, branch = 'master') {
  const r = await gitAsync(['fetch', '--quiet', 'origin', branch], timeoutMs);
  if (!r.ok) return { ok: false, reason: `origin unreachable / fetch failed: ${r.error}` };
  const sha = gitSync(['rev-parse', 'FETCH_HEAD']);
  if (!sha.ok) return { ok: false, reason: `FETCH_HEAD rev-parse failed: ${sha.error}` };
  const originSha = String(sha.stdout).trim();
  if (!originSha || originSha.length < 40) return { ok: false, reason: 'FETCH_HEAD returned no SHA' };
  return { ok: true, origin_sha: originSha };
}

/**
 * Returns one of:
 *   { ok: true, state: 'same' | 'ahead' }
 *   { ok: false, state: 'diverged' | 'behind', reason: string }
 *
 * Classification:
 *   same      — HEAD === origin_sha
 *   ahead     — origin_sha is an ancestor of HEAD (fast-forward push works)
 *   diverged  — neither is an ancestor of the other
 *   behind    — HEAD is an ancestor of origin_sha (upstream has commits we
 *               don't; pushing would be a no-op but a rebase is pending)
 */
function checkNotDiverged(originSha, branch = 'master') {
  const head = gitSync(['rev-parse', 'HEAD']);
  if (!head.ok) return { ok: false, state: 'unknown', reason: `git rev-parse HEAD failed: ${head.error}` };
  const headSha = String(head.stdout).trim();
  if (headSha === originSha) return { ok: true, state: 'same', head_sha: headSha };

  // Is originSha an ancestor of HEAD? → HEAD is ahead.
  const originAnc = gitSync(['merge-base', '--is-ancestor', originSha, headSha]);
  if (originAnc.ok) return { ok: true, state: 'ahead', head_sha: headSha };

  // Is HEAD an ancestor of originSha? → behind (rebase pending).
  const headAnc = gitSync(['merge-base', '--is-ancestor', headSha, originSha]);
  if (headAnc.ok) return { ok: false, state: 'behind', head_sha: headSha, reason: `origin/${branch} has commits HEAD does not; pull --rebase before registering a trigger` };

  // Neither is ancestor of the other.
  return { ok: false, state: 'diverged', head_sha: headSha, reason: `HEAD and origin/${branch} have diverged; resolve locally before registering a trigger` };
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const startMs = Date.now();
  const config = parseCLI();
  const errors = [];
  let blocked = false;
  const checks = {};

  const inRepo = checkInRepo();
  checks.in_repo = inRepo;
  if (!inRepo.ok) {
    blocked = true;
    errors.push(inRepo.reason);
  }

  if (!blocked) {
    const tree = checkWorkingTreeClean(config.allowPaths);
    checks.working_tree = tree;
    if (!tree.ok) {
      blocked = true;
      errors.push(`working tree dirty (${tree.blocking_paths.length} blocking path(s) outside --allow-paths)`);
    }
  }

  // Resolved once, after we know we are in a repo, and reported in the payload
  // so a wrong answer here is visible rather than buried in a fetch error.
  let target = { branch: 'master', source: 'not resolved (blocked earlier)' };
  if (!blocked) {
    target = resolveDefaultBranch();
    checks.default_branch = target;
  }

  let reach;
  if (!blocked) {
    reach = await checkOriginReachable(config.timeoutMs, target.branch);
    checks.origin_reachable = reach;
    if (!reach.ok) {
      blocked = true;
      errors.push(reach.reason);
    }
  }

  if (!blocked && reach && reach.origin_sha) {
    const div = checkNotDiverged(reach.origin_sha, target.branch);
    checks.head_vs_origin = div;
    if (!div.ok) {
      blocked = true;
      errors.push(div.reason);
    }
  }

  const payload = {
    ok: !blocked,
    blocked,
    allow_paths: config.allowPaths,
    checks,
  };

  if (config.asJson) {
    process.stdout.write(JSON.stringify(payload, null, 2) + '\n');
  } else {
    emitBundle({
      command: 'push-preflight',
      script: 'cwos-push-preflight.js',
      startMs,
      errors,
      data: payload,
    });
    if (blocked && !config.quiet) {
      for (const e of errors) process.stderr.write(`push-preflight: ${e}\n`);
    }
  }

  process.exit(blocked ? 1 : 0);
}

// Only run main() when invoked directly; exports below support unit tests.
if (require.main === module) {
  main().catch(err => {
    bundleError(`push-preflight fatal: ${err.message || err}`);
  });
}

module.exports = {
  parsePorcelainLine,
  resolveDefaultBranch,
  isAllowed,
  checkInRepo,
  checkWorkingTreeClean,
  checkNotDiverged,
};
