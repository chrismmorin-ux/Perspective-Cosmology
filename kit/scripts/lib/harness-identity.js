'use strict';

/**
 * harness-identity — which Claude Code build and which model THIS session runs
 * on, and whether this repo, on this machine, has met either before.
 *
 * WS-942 gap A. The harness and the model are the most consequential things
 * the fleet imports, and they arrived unannounced: `cwos-fleet-run.js` probes
 * `claude --version` only to learn the CLI exists and records nothing, so the
 * day a build changed how a hook, a permission or a tool behaved, no record
 * said which build any session had been running.
 *
 * WHERE THE VERSION COMES FROM, AND WHY NOT `claude --version`. Measured on the
 * G16, 2026-10-10: a session's own environment said `claude-code_2-1-295_agent`
 * while `claude --version`, run inside that same session, printed 2.1.296. The
 * binary on disk had updated underneath a running session. `--version` answers
 * "what would a NEW session run", costs a process spawn inside a hook that must
 * be fast, and was wrong about the session asking. So the order is: the harness's own statement about
 * itself (AI_AGENT), then the session's transcript, and otherwise UNKNOWN —
 * recorded as null, never guessed from the binary.
 *
 * WHAT COUNTS AS NEWS. A build or a model this machine has not run before. Not
 * "different from the previous session": two sessions straddling an update
 * alternate builds, and the founder switches models on purpose, so a
 * last-versus-current diff would fire on every alternation and be ignored by
 * the third. The first time is the event; the set of everything seen is what
 * makes "first" answerable.
 *
 * The seen-set is untracked and lives in this repo's workstream directory on
 * this machine, so it is per repo AND per machine: a build is a fact about a
 * node, and a tracked file would report node1's upgrade as the G16's. The
 * consequence is that a new build is announced once in each repo, by the first
 * session there to run on it.
 */

const fs = require('fs');
const path = require('path');
const { writeFileAtomic } = require('./cwos-utils');
const { livenessDir } = require('./session-record');

// Not a session id, so nothing that resolves liveness/<id>.json can collide.
const SEEN_FILE = '_harness.json';
const TRANSCRIPT_PROBE_BYTES = 64 * 1024;

function seenPath(wsDir) {
  return path.join(livenessDir(wsDir), SEEN_FILE);
}

/** `claude-code_2-1-295_agent` -> `2.1.295`. Null when the variable is absent or another shape. */
function versionFromAgentEnv(env) {
  const m = /^claude-code_(\d+)-(\d+)-(\d+)(?:_|$)/.exec(String((env && env.AI_AGENT) || ''));
  return m ? `${m[1]}.${m[2]}.${m[3]}` : null;
}

/**
 * The LAST `"version":"x.y.z"` a transcript records, read from its tail. Null
 * when there is no transcript yet.
 *
 * Last, not first: a resumed session appends to the transcript it had, so the
 * first line names the build the session started on and the newest line names
 * the build that last ran it. A real transcript on the G16 holds 2.1.283 and
 * then 2.1.285. Even the last line is the build of the previous run, not
 * necessarily this one, which is why this is the fallback and not the source.
 */
function versionFromTranscript(transcriptPath) {
  if (!transcriptPath) return null;
  let fd = null;
  try {
    fd = fs.openSync(transcriptPath, 'r');
    const size = fs.fstatSync(fd).size;
    const length = Math.min(size, TRANSCRIPT_PROBE_BYTES);
    const buf = Buffer.alloc(length);
    const n = fs.readSync(fd, buf, 0, length, size - length);
    const all = buf.toString('utf8', 0, n).match(/"version"\s*:\s*"(\d+\.\d+\.\d+)"/g);
    if (!all) return null;
    const m = /(\d+\.\d+\.\d+)/.exec(all[all.length - 1]);
    return m ? m[1] : null;
  } catch {
    return null;
  } finally {
    if (fd !== null) { try { fs.closeSync(fd); } catch { /* already closed */ } }
  }
}

/** The SessionStart payload names the model as a string, or as `{ id }`. */
function modelFromHook(hook) {
  const m = hook && hook.model;
  if (typeof m === 'string' && m.trim()) return m.trim();
  if (m && typeof m === 'object' && typeof m.id === 'string' && m.id.trim()) return m.id.trim();
  return null;
}

/**
 * What this session is running on. Every field is null when it could not be
 * established — a null is a recorded "unknown", which a later reader can count.
 */
function identify(opts) {
  const env = (opts && opts.env) || process.env;
  const hook = (opts && opts.hook) || null;
  let version = versionFromAgentEnv(env);
  let source = version ? 'env:AI_AGENT' : null;
  if (!version) {
    version = versionFromTranscript(hook && hook.transcript_path);
    source = version ? 'transcript' : null;
  }
  return { harness_version: version, harness_version_source: source, model: modelFromHook(hook) };
}

function readSeen(wsDir) {
  try {
    const data = JSON.parse(fs.readFileSync(seenPath(wsDir), 'utf8'));
    if (data && typeof data === 'object') {
      return {
        versions: (data.versions && typeof data.versions === 'object') ? data.versions : {},
        models: (data.models && typeof data.models === 'object') ? data.models : {},
        last: (data.last && typeof data.last === 'object') ? data.last : {},
        unannounced: Array.isArray(data.unannounced) ? data.unannounced : [],
      };
    }
  } catch { /* absent or unreadable: this machine has no baseline yet */ }
  return null;
}

/**
 * Record what this session runs on and return what is new to this machine.
 *
 * `changes` is empty on the very first call (there is nothing to compare a
 * baseline against, and announcing "changed" from no knowledge would be a false
 * alarm on every fresh clone) and for anything already seen. An unknown value
 * is never recorded and never compared: it must not erase a known baseline.
 */
function note(wsDir, current, opts) {
  const now = (opts && opts.now) || new Date().toISOString();
  const sessionId = (opts && opts.sessionId) || null;
  const prior = readSeen(wsDir);
  const seen = prior || { versions: {}, models: {}, last: {}, unannounced: [] };
  const changes = [];

  const axes = [
    ['harness_version', 'versions', 'harness'],
    ['model', 'models', 'model'],
  ];
  for (const [field, bucket, what] of axes) {
    const value = current && current[field];
    if (!value) continue;
    if (!seen[bucket][value]) {
      // A baseline exists only once a real value was seen on this axis. Asked
      // before the write below, which is what makes the first value a baseline.
      const hadBaseline = Object.keys(seen[bucket]).length > 0;
      if (hadBaseline) changes.push({ what, from: seen.last[field] || null, to: value });
      seen[bucket][value] = { first_seen: now, first_session: sessionId };
    }
    seen.last[field] = value;
  }
  seen.last.seen_at = now;
  // Detected is not announced. A registration run with --quiet or --json
  // prints nothing, and kit/commands/workstream.md runs exactly --quiet: if
  // detection alone marked a change as told, that run would spend the one
  // announcement on nobody. A change waits here until a run that prints takes it.
  seen.unannounced.push(...changes);

  save(wsDir, seen);
  return { first: !prior, changes };
}

function save(wsDir, seen) {
  try {
    fs.mkdirSync(livenessDir(wsDir), { recursive: true });
    writeFileAtomic(seenPath(wsDir), JSON.stringify(seen, null, 2) + '\n');
    return true;
  } catch {
    // A baseline that failed to save re-announces next session; never blocks a start.
    return false;
  }
}

/**
 * The changes nobody has been told about yet, handed over once. Called only by
 * a run that is about to print them.
 */
function takeUnannounced(wsDir) {
  const seen = readSeen(wsDir);
  if (!seen || seen.unannounced.length === 0) return [];
  const pending = seen.unannounced;
  seen.unannounced = [];
  save(wsDir, seen);
  return pending;
}

/**
 * One announcement per change, for the session-start report. `dueLine` is
 * called only when a Claude Code build changed, and may return one line saying
 * what is now due to be re-checked against it (WS-1075), or null.
 */
function describe(changes, opts) {
  const lines = [];
  for (const c of changes || []) {
    const label = c.what === 'harness' ? 'Claude Code build' : 'model';
    const from = c.from ? `${c.from} → ` : '';
    lines.push(`⚠ New ${label} for this repo on this machine: ${from}${c.to} (first session on it here).`);
  }
  if (lines.length) {
    lines.push('  What this repo assumes about hooks, permissions and tools was measured before this change.');
    lines.push('  If something now behaves differently, record it so the hub hears:');
    lines.push("    node kit/scripts/cwos-capture.js friction '<what changed>' --component harness");
    const dueLine = opts && opts.dueLine;
    if (typeof dueLine === 'function' && (changes || []).some((c) => c.what === 'harness')) {
      let extra = null;
      try { extra = dueLine(); } catch { /* the announcement never depends on it */ }
      if (extra) lines.push(extra);
    }
  }
  return lines;
}

module.exports = {
  identify,
  note,
  takeUnannounced,
  describe,
  readSeen,
  seenPath,
  versionFromAgentEnv,
  versionFromTranscript,
  modelFromHook,
};
