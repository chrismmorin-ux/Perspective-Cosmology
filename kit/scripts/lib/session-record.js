'use strict';
/**
 * session-record — a session's tracked record, with its per-node liveness overlaid.
 *
 * WHY TWO FILES (WS-884, approved on the Founder Desk 2026-09-20 as hb-dr3-d5).
 * A session record used to be one tracked YAML that the Stop hook rewrote on
 * every response: `last_heartbeat`, `pid`, `pid_recorded_at`, `worktree`. The
 * SessionStart autocommit then carried every one of those rewrites into a
 * commit, so two machines working the same repo produced a conflict on every
 * pull — measured 2026-09-22: four repos wedged on CM-NODE1 at once, ten of
 * thirteen conflicted paths being session YAMLs, three daily jobs failing
 * downstream. Cleared by hand, and wedged again the next day, because nothing
 * had stopped the writers.
 *
 * The split is by WHO NEEDS THE FIELD:
 *
 *   tracked record   sessions/<id>.yaml   what another machine needs to know:
 *                    id, status, started_at, ended_at, host, agent_session_id,
 *                    claimed_items, files_locked, handoff_notes. Written at
 *                    register, at claim/lock, and at close. Never per turn.
 *
 *   liveness sidecar liveness/<id>.json   what only THIS machine can judge:
 *                    last_heartbeat, pid, pid_recorded_at, worktree, revived_at.
 *                    Gitignored. Written on every beat. A pid is meaningless on
 *                    any other host and a heartbeat that arrives by git pull is
 *                    hours stale by construction, so nothing is lost by keeping
 *                    them home — the same reasoning ADR-058 applied to state/.
 *
 * A record from another host therefore never has a local sidecar. That is not a
 * gap to paper over: it is the fact `session-liveness` now reads as UNKNOWN,
 * which is what ADR-065 always said a foreign record was.
 *
 * READ THROUGH HERE. `loadSession` / `listSessions` / `overlayLiveness` are the
 * seam every reader goes through, so a caller sees ONE document with the beat
 * in it and does not have to know which file a field came from. Records minted
 * before this shipped still carry the old fields inline; the overlay only wins
 * where a sidecar has something to say, so they keep reading as they did.
 */

const fs = require('fs');
const path = require('path');
const { readYAMLFile, writeFileAtomic, withFileLock } = require('./cwos-utils');

/** Directory under the workstream dir. Gitignored — see kit/templates/gitignore-cwos.txt. */
const LIVENESS_DIR = 'liveness';

/** The fields that live in the sidecar. Anything else on a record is tracked. */
const LIVENESS_FIELDS = ['last_heartbeat', 'pid', 'pid_recorded_at', 'worktree', 'revived_at', 'waiting_on_founder', 'node_id'];

function livenessDir(wsDir) {
  return path.join(wsDir, LIVENESS_DIR);
}

function livenessPath(wsDir, id) {
  return path.join(livenessDir(wsDir), `${id}.json`);
}

/** The sidecar's contents, or `{}` when there is none. Never throws. */
function readLiveness(wsDir, id) {
  if (!wsDir || !id) return {};
  try {
    const raw = fs.readFileSync(livenessPath(wsDir, id), 'utf8');
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : {};
  } catch {
    return {};
  }
}

/**
 * Merge `patch` into the sidecar under a per-file lock.
 *
 * @returns {boolean} whether the write landed. A caller that treats a silent
 * failure as success is how a liveness stamp outlives the liveness it certifies
 * (the `touchSession` contract, carried over).
 */
function writeLiveness(wsDir, id, patch, opts = {}) {
  if (!wsDir || !id || !patch) return false;
  const file = livenessPath(wsDir, id);
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    withFileLock(file + '.lock', () => {
      const current = readLiveness(wsDir, id);
      const next = { ...current };
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined) continue;
        next[k] = v;
      }
      next.id = id;
      writeFileAtomic(file, JSON.stringify(next, null, 2) + '\n', { skipSizeGate: true });
    }, { ownerLabel: opts.ownerLabel || 'liveness', maxWaitMs: opts.maxWaitMs || 5000 });
    return true;
  } catch {
    return false;
  }
}

/** Drop the sidecar. Called when a record closes or is archived. Never throws. */
function removeLiveness(wsDir, id) {
  if (!wsDir || !id) return false;
  try { fs.unlinkSync(livenessPath(wsDir, id)); return true; } catch { return false; }
}

/** `<wsDir>/sessions/<name>.yaml` → `<wsDir>`. */
function wsDirOfSessionFile(file) {
  return path.dirname(path.dirname(path.resolve(file)));
}

/** The record file for `id`, probing both filename generations. Null when absent. */
function sessionFileFor(wsDir, id) {
  if (!wsDir || !id) return null;
  for (const name of [`${id}.yaml`, `session-${id}.yaml`]) {
    const file = path.join(wsDir, 'sessions', name);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

/**
 * The record with its sidecar fields laid over it.
 *
 * Sidecar wins for the LIVENESS_FIELDS it carries; everything else is the
 * record's. `liveness_source` says which file the beat came from, because a
 * reader deciding whether to act on a heartbeat is entitled to know whether
 * that heartbeat was written on this machine.
 */
function overlayLiveness(wsDir, doc, idHint = null) {
  if (!doc || typeof doc !== 'object') return doc;
  const id = doc.id || idHint;
  if (!id || !wsDir) return doc;
  const side = readLiveness(wsDir, id);
  const keys = LIVENESS_FIELDS.filter((k) => side[k] !== undefined && side[k] !== null);
  if (!keys.length) return doc;
  const out = { ...doc };
  for (const k of keys) out[k] = side[k];
  out.liveness_source = 'sidecar';
  return out;
}

/** Unwrap readYAMLFile's `{ok, data}` envelope into the document, or null. */
function parseRecord(file) {
  try {
    const r = readYAMLFile(file);
    const doc = (r && typeof r === 'object' && 'data' in r) ? (r.ok === false ? null : r.data) : r;
    return doc && typeof doc === 'object' ? doc : null;
  } catch {
    return null;
  }
}

/**
 * Load one session by id or by record path, overlaid. Null when unreadable.
 */
function loadSession(wsDir, idOrFile) {
  if (!idOrFile) return null;
  let file;
  if (/\.ya?ml$/i.test(String(idOrFile)) || path.isAbsolute(String(idOrFile))) {
    file = String(idOrFile);
    if (!wsDir) wsDir = wsDirOfSessionFile(file);
  } else {
    file = sessionFileFor(wsDir, idOrFile);
  }
  if (!file || !fs.existsSync(file)) return null;
  const doc = parseRecord(file);
  if (!doc) return null;
  const idHint = path.basename(file, '.yaml').replace(/^session-/, '');
  return overlayLiveness(wsDir, doc, idHint);
}

/**
 * Every record in `sessions/` (one level — `archive/` is not a session),
 * overlaid. `opts.status` filters by status, quote- and case-tolerant.
 *
 * @returns {Array<{id:string, file:string, doc:object}>}
 */
function listSessions(wsDir, opts = {}) {
  const sessDir = path.join(wsDir, 'sessions');
  let names = [];
  try { names = fs.readdirSync(sessDir).filter((n) => n.endsWith('.yaml')); } catch { return []; }
  const want = opts.status ? String(opts.status).toLowerCase() : null;
  const out = [];
  for (const name of names) {
    const file = path.join(sessDir, name);
    const doc = parseRecord(file);
    if (!doc) continue;
    const idHint = name.replace(/\.yaml$/, '').replace(/^session-/, '');
    const merged = overlayLiveness(wsDir, doc, idHint);
    if (want && String(merged.status || '').toLowerCase() !== want) continue;
    out.push({ id: String(merged.id || idHint), file, doc: merged });
  }
  return out;
}

module.exports = {
  LIVENESS_DIR,
  LIVENESS_FIELDS,
  livenessDir,
  livenessPath,
  readLiveness,
  writeLiveness,
  removeLiveness,
  overlayLiveness,
  loadSession,
  listSessions,
  sessionFileFor,
  wsDirOfSessionFile,
  parseRecord,
};
