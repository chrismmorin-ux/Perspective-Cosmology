/**
 * remote-ids — what the REMOTE already knows, read without leaving the machine.
 *
 * Issue #26 (2026-09-17). `id-allocator` made an id unique per checkout: lock,
 * scan the local tree, take max+1. That is exactly as far as a lock can reach.
 * HomeBase runs on two nodes (ADR-057); both run the unattended sweeps; each
 * minted WS-844..851 from its own directory listing, for eight different work
 * items. Nothing failed. The G16's HomeBase just stopped being able to pull,
 * and "WS-846" came to mean two things depending on which machine said it.
 *
 * The remote-tracking ref is a second source of truth that is already on disk:
 * `git ls-tree origin/master` answers "which ids has the rest of the fleet
 * published?" with no network at all. Unioning it into the scan means a node
 * that is merely BEHIND mints above what it has not pulled yet — which was the
 * whole of the measured incident (CM-NODE1's items were on origin for hours
 * before the G16 minted over them).
 *
 * `refreshRemote` narrows the remaining window — ids another node minted and
 * pushed since this node last fetched — to a throttle interval. What this
 * module can NOT close is two nodes minting while neither has pushed. That is
 * not reachable from one machine; `lib/id-collision.js` is the detector that
 * makes it loud and mechanically repairable instead of a broken pull.
 *
 * Everything here is best-effort and silent on failure, deliberately: an
 * adopted repo with no remote, a tmpdir fixture, or a node with no network must
 * allocate exactly as it did before this file existed.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/** Refs tried in order. `origin/HEAD` is whatever the remote calls its default. */
const REMOTE_REF_CANDIDATES = ['origin/HEAD', 'origin/master', 'origin/main'];

/** A fetch younger than this is fresh enough — the sweep cadence is 15 minutes. */
const DEFAULT_FETCH_MAX_AGE_MS = 10 * 60 * 1000;

/**
 * A fetch that needs credentials it cannot get HANGS rather than fails on a
 * headless Windows session (the GCM dialog opens where nobody can see it), so
 * the timeout is load-bearing, not defensive.
 */
const FETCH_TIMEOUT_MS = 20 * 1000;
const GIT_TIMEOUT_MS = 10 * 1000;

function git(cwd, args, opts = {}) {
  let r;
  try {
    r = spawnSync('git', args, {
      cwd,
      encoding: 'utf8',
      timeout: opts.timeoutMs || GIT_TIMEOUT_MS,
      windowsHide: true,
      maxBuffer: 64 * 1024 * 1024,
      env: opts.env || process.env,
    });
  } catch (e) {
    return { ok: false, stdout: '', error: e.message };
  }
  if (r.error || r.status !== 0) {
    return { ok: false, stdout: r.stdout || '', error: (r.error && r.error.message) || (r.stderr || '').trim() || `exit ${r.status}` };
  }
  return { ok: true, stdout: r.stdout || '' };
}

/**
 * The remote-tracking ref to read, or null when there is none (or no repo).
 * One spawn, not one per candidate: this runs on every id allocation, and in a
 * directory that is not a repo at all every probe is a failed process launch.
 */
function resolveRemoteRef(cwd) {
  if (!cwd || !fs.existsSync(cwd)) return null;
  const r = git(cwd, ['for-each-ref', '--format=%(refname)', ...REMOTE_REF_CANDIDATES.map((c) => `refs/remotes/${c}`)]);
  if (!r.ok) return null;
  const present = new Set(r.stdout.split(/\r?\n/).filter(Boolean));
  for (const c of REMOTE_REF_CANDIDATES) if (present.has(`refs/remotes/${c}`)) return c;
  return null;
}

/**
 * Basenames of the entries directly inside each of `relDirs` at `ref`.
 * `relDirs` are relative to `cwd`, which is how `git ls-tree` reads a pathspec.
 * A directory absent at the ref contributes nothing.
 */
function remoteTreeNames(cwd, ref, relDirs) {
  const out = [];
  if (!ref) return out;
  for (const rel of relDirs) {
    const spec = rel.replace(/\\/g, '/').replace(/\/*$/, '/');
    const r = git(cwd, ['ls-tree', '--name-only', ref, '--', spec]);
    if (!r.ok) continue;
    for (const line of r.stdout.split(/\r?\n/)) {
      if (line) out.push(path.posix.basename(line));
    }
  }
  return out;
}

/** Contents of one file at `ref` (path relative to `cwd`), or null. */
function remoteFileText(cwd, ref, relPath) {
  if (!ref) return null;
  // `./` anchors the path to cwd; a bare `ref:path` is read from the repo root.
  const r = git(cwd, ['show', `${ref}:./${relPath.replace(/\\/g, '/')}`]);
  return r.ok ? r.stdout : null;
}

/** Milliseconds since the last fetch in this checkout, or null if never/unknown. */
function fetchAgeMs(cwd) {
  const r = git(cwd, ['rev-parse', '--git-path', 'FETCH_HEAD']);
  if (!r.ok) return null;
  const p = path.resolve(cwd, r.stdout.trim());
  try { return Date.now() - fs.statSync(p).mtimeMs; } catch { return null; }
}

/**
 * Bring the remote-tracking refs up to date, at most once per `maxAgeMs`.
 * Touches nothing but `refs/remotes/` — no merge, no checkout, no working tree.
 *
 * @returns {{fetched: boolean, skipped?: string, error?: string, age_ms?: number|null}}
 */
function refreshRemote(cwd, opts = {}) {
  if (process.env.CWOS_ID_NO_FETCH === '1') return { fetched: false, skipped: 'CWOS_ID_NO_FETCH' };
  // `opts.ref` lets a caller that has already resolved the ref skip the probe.
  if (!(opts.ref || resolveRemoteRef(cwd))) return { fetched: false, skipped: 'no remote' };
  const maxAgeMs = typeof opts.maxAgeMs === 'number' ? opts.maxAgeMs : DEFAULT_FETCH_MAX_AGE_MS;
  const age = fetchAgeMs(cwd);
  if (age !== null && age < maxAgeMs) return { fetched: false, skipped: 'fresh', age_ms: age };
  const r = git(cwd, ['fetch', '--quiet', '--no-tags', 'origin'], {
    timeoutMs: opts.timeoutMs || FETCH_TIMEOUT_MS,
    // Never prompt: there is nobody to answer, and a prompt is a hang.
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never' },
  });
  return r.ok ? { fetched: true } : { fetched: false, error: r.error, age_ms: age };
}

module.exports = {
  REMOTE_REF_CANDIDATES,
  DEFAULT_FETCH_MAX_AGE_MS,
  git,
  resolveRemoteRef,
  remoteTreeNames,
  remoteFileText,
  fetchAgeMs,
  refreshRemote,
};
