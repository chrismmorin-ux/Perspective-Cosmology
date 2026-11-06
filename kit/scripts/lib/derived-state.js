'use strict';
/**
 * derived-state — the ONE list of CWOS files that are nobody's change.
 *
 * Two classes, one question ("should a commit ever carry this?"):
 *
 *   SHARED_DERIVED  rebuilt by reconcile from tracked sources. Written by
 *                   whichever session's hook ran last. Tracked, but a session
 *                   stages them only when the index refresh IS the change
 *                   (`cwos-git.js stage --include-derived`).
 *
 *   NODE_LOCAL      written by THIS machine's hooks and timers, read only here,
 *                   and different on every node by construction: liveness
 *                   stamps, the recovery mutex, the test-sweep stamp, the
 *                   invariant firing log, per-session liveness sidecars, and
 *                   the lock/tmp files atomic writes leave behind. Never
 *                   committed — by anyone, for any reason.
 *
 * WHY ONE FILE (WS-884). Four copies of this knowledge drifted: cwos-git's
 * SHARED_DERIVED, snapshot-diff's EXCLUDE_PATTERNS, cwos-dialogue's derived
 * filter, and the SessionStart autocommit — which had NO list at all and ran
 * `git add -A` over the whole workstream dir. On 2026-09-22 that autocommit
 * carried five node-local stamps, a leaked `.tmp` and the recovery mutex into
 * commits on two machines, and every pull between them conflicted on exactly
 * those paths. A list nobody shares is a list somebody forgets.
 */

const path = require('path');

/** Rebuilt from tracked sources; stage only when the refresh is the change. */
const SHARED_DERIVED = [
  '.claude/workstream/queue-index.yaml',
  '.claude/workstream/sprint-index.yaml',
  '.claude/workstream/events/current.jsonl',
  'system/events.log.md',
  '.claude/workstream/.hooks-liveness.yaml',
  '.claude/workstream/.verify-liveness.yaml',
  '.claude/workstream/.current-session',
  // Counters recomputed from runs/, sessions/, decisions.md and queue/ by the
  // cwos-usage-derive SessionStart hook (2026-10-10) — no session authors them.
  '.claude/workstream/usage.yaml',
];

/**
 * Per-node. Exact repo-relative paths, plus directory prefixes (trailing `/`).
 * Lock and temp files are matched by suffix under the workstream dir.
 */
const NODE_LOCAL_FILES = [
  '.claude/workstream/.hooks-liveness.yaml',
  '.claude/workstream/.verify-liveness.yaml',
  '.claude/workstream/.test-sweep.json',
  '.claude/workstream/.session-recovery.mutex',
  '.claude/workstream/.current-session',
  '.claude/workstream/meta/invariant-firing-log.yaml',
  // Dispatch records waiting to reach this node's event log (events/ is itself
  // gitignored); drained by cwos-dispatch-ledger on the next successful record.
  '.claude/workstream/dispatch-spool.jsonl',
];

const NODE_LOCAL_DIRS = [
  '.claude/workstream/liveness/',
  // WS-986: per-commit test sweep records (lib/test-sweep-record.js). Which
  // commit THIS machine swept is a fact about this machine; `state/*.json`
  // does not reach into a subdirectory, so the directory needs its own rule.
  '.claude/workstream/state/test-sweeps/',
];

/** Suffixes that mark an atomic-write leftover or a lock, anywhere under the workstream dir. */
const NODE_LOCAL_SUFFIXES = ['.lock', '.tmp'];

/** gitignore lines that express NODE_LOCAL. Shipped in kit/templates/gitignore-cwos.txt. */
const NODE_LOCAL_IGNORE_LINES = [
  ...NODE_LOCAL_FILES,
  ...NODE_LOCAL_DIRS,
  '.claude/workstream/**/*.lock',
  '.claude/workstream/**/*.tmp',
];

function normalize(p) {
  return String(p || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

/** Is this repo-relative path one this machine must never commit? */
function isNodeLocal(p) {
  const s = normalize(p);
  if (!s) return false;
  if (NODE_LOCAL_FILES.includes(s)) return true;
  if (NODE_LOCAL_DIRS.some((d) => s.startsWith(d))) return true;
  if (s.startsWith('.claude/workstream/')) {
    const base = path.posix.basename(s);
    // `x.yaml.12345.abcdef.tmp`, `x.yaml.lock`, `.session-recovery.mutex.lock`
    if (NODE_LOCAL_SUFFIXES.some((suf) => base.endsWith(suf))) return true;
  }
  return false;
}

function isSharedDerived(p) {
  return SHARED_DERIVED.includes(normalize(p));
}

module.exports = {
  SHARED_DERIVED,
  NODE_LOCAL_FILES,
  NODE_LOCAL_DIRS,
  NODE_LOCAL_SUFFIXES,
  NODE_LOCAL_IGNORE_LINES,
  isNodeLocal,
  isSharedDerived,
};
