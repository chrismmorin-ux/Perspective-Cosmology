#!/usr/bin/env node
/**
 * cwos-session-register — register THIS session automatically, and say who else is here.
 *
 * ROOT CAUSE THIS FIXES (WS-533). The session registry rotted from 2026-05-15 to
 * 2026-07-26 for a structural reason, not a broken hook: **registration was manual
 * while maintenance was automatic.** Only `/session-start` wrote
 * `.current-session`, and a Stop hook can only UPDATE a registry entry — it can
 * never create one. So every session that just started talking (i.e. nearly all of
 * them) never registered, `cwos-heartbeat.js` had nothing to beat, and
 * `cwos-session-recovery.js` had nothing to recover. The machinery was alive and
 * the registry was empty.
 *
 * The fix is to register from the SessionStart hook, which fires whether or not
 * anyone remembers a command.
 *
 * IDENTITY COMES FROM THE HARNESS, NOT FROM A CLOCK. Claude Code passes
 * `session_id` on stdin. Using it means:
 *   - no minting race. Two sessions starting in the same minute get distinct
 *     identities; a timestamp-derived id would collide, and worse, both would
 *     overwrite the single `.current-session` pointer and each lose track of itself.
 *   - stability across re-fires. SessionStart also fires on resume, and matching on
 *     `agent_session_id` re-finds the existing record instead of forking a new one.
 *
 * `.current-session` is still written for the consumers that read it
 * (cwos-heartbeat, cwos-verify's INV-026), but it is explicitly NOT the identity of
 * record: one pointer cannot represent N concurrent sessions. The session files are
 * the registry; the pointer is a legacy convenience.
 *
 * NEVER BLOCKS. Always exits 0. A registry is an aid to the founder, and a session
 * that cannot start is worse than a session nobody logged.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { cliGate } = require('./lib/cli');
const { findWorkstreamDir, writeFileAtomic, patchYAMLFile, withFileLock, makeEventEmitter } = require('./lib/cwos-utils');

const emitEvent = makeEventEmitter();
const {
  listLiveSessions, registryHealth, touchSession, findByAgentSessionId,
  staleActiveSessions, localHost, localNodeId,
  currentWorktree, agentSessionIdFromEnv, harnessPid,
  readSessionDoc, isLocalHost, normalizeWorktree, SUPERSEDE_GRACE_MS, handRunPidRefusal,
} = require('./lib/cwos-claims');
const { writeLiveness } = require('./lib/session-record');
const harnessIdentity = require('./lib/harness-identity');

const CLI = {
  name: 'cwos-session-register',
  summary: 'register this session in the repo registry and report other live sessions',
  flags: {
    quiet: { type: 'boolean', describe: 'suppress the report; still registers' },
    'no-register': { type: 'boolean', describe: 'report only — do not create or touch a record' },
    'session-id': { type: 'string', placeholder: 'id', describe: 'harness session id (default: read from stdin JSON)' },
    'workstream-dir': { type: 'string', placeholder: 'path', describe: 'override workstream dir discovery' },
    json: { type: 'boolean', describe: 'emit machine-readable output' },
  },
  notes: 'Always exits 0 — a session start must never be blocked by bookkeeping.',
};

/** SessionStart hook payload: { session_id, cwd, hook_event_name, ... } */
function readHookStdin() {
  // A TTY never carries a hook payload, and reading one blocks until EOF: a
  // hand-run from a terminal would hang instead of registering (WS-890).
  if (process.stdin.isTTY) return null;
  try {
    const raw = fs.readFileSync(0, 'utf8');
    if (!raw || !raw.trim()) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function humanId(agentId, now) {
  const stamp = new Date(now).toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
  const suffix = String(agentId || 'nohook').replace(/[^A-Za-z0-9]/g, '').slice(0, 8) || 'nohook';
  return `ses-${stamp}-${suffix}`;
}

/**
 * Bring this conversation's own closed record back to `active` (WS-890).
 *
 * A SessionStart for a harness id IS that conversation running: startup,
 * resume or compact. So a record recovery marked `abandoned`, or one
 * /session-end marked `completed` before the founder kept working, is
 * contradicted by the event that called us. Without this, the record stayed
 * closed and every claim the session made next was held by a closed record
 * (friction b3a7d55a9c). Matched by harness id only, so it can never revive
 * anyone else's record. Claims recovery released are not re-taken here —
 * /next decides that against the queue as it stands (same rule as the
 * heartbeat's revive).
 */
function reviveOwnRecord(file) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return null; }
  const m = text.match(/^status:\s*["']?([A-Za-z_-]+)["']?\s*$/m);
  const status = m ? m[1].toLowerCase() : '';
  if (status !== 'abandoned' && status !== 'completed') return null;
  let next = text.replace(/^status:.*$/m, 'status: active');
  if (/^ended_at:.*$/m.test(next)) next = next.replace(/^ended_at:.*$/m, 'ended_at: null');
  writeFileAtomic(file, next);
  return status;
}

const stampMs = (v) => { const t = v ? Date.parse(String(v).replace(/^"|"$/g, '')) : NaN; return Number.isFinite(t) ? t : NaN; };

/**
 * A NEWER conversation in this same process and checkout that beat within the
 * grace window, or null (WS-890 review, P6).
 *
 * A hand-run whose CLAUDE_CODE_SESSION_ID / --session-id names an OLDER
 * conversation would otherwise revive that old record and close the live,
 * current one as its "predecessor". Within the grace window the newer record
 * is the one actually running here, so the hand-run is refused instead.
 */
function newerLiveSibling(wsDir, existingDoc, pid, worktree, nowMs) {
  if (!(Number(pid) > 0) || !existingDoc) return null;
  const mineStart = stampMs(existingDoc.started_at);
  let names = [];
  try { names = fs.readdirSync(path.join(wsDir, 'sessions')).filter((n) => n.endsWith('.yaml')); } catch { return null; }
  for (const n of names) {
    const d = readSessionDoc(path.join(wsDir, 'sessions', n));
    if (!d || String(d.id) === String(existingDoc.id)) continue;
    if (String(d.status || '').toLowerCase() !== 'active' || !isLocalHost(d)) continue;
    if (Number(d.pid) !== Number(pid) || normalizeWorktree(d.worktree) !== normalizeWorktree(worktree)) continue;
    if (!(stampMs(d.started_at) > mineStart)) continue;
    const beat = stampMs(d.last_heartbeat || d.started_at);
    if (Number.isFinite(beat) && nowMs - beat <= SUPERSEDE_GRACE_MS) return d.id;
  }
  return null;
}

/**
 * How the harness says this conversation began, when that is worth keeping
 * (WS-1226): 'clear' or null. Only the SessionStart payload's own `source` is
 * read — never an inference — and only "clear" is stamped, because it is the
 * one start that leaves a predecessor running in the same process (its record
 * reads alive until the gate's ghost rule or `recovery --close` judges it).
 */
function startedVia(hook) {
  const src = hook && typeof hook.source === 'string' ? hook.source.trim().toLowerCase() : '';
  return src === 'clear' ? 'clear' : null;
}

function register(wsDir, agentId, pid, identity, { handRun = false, via = null } = {}) {
  const existing = findByAgentSessionId(wsDir, agentId);
  if (existing) {
    const before = readSessionDoc(existing.file);
    const worktree = currentWorktree() || '';
    // P6: only a hand-run is refused. A hook payload is the harness itself
    // saying this conversation is running (startup/resume/compact); even then,
    // nothing here ever closes another record.
    if (handRun) {
      const sibling = newerLiveSibling(wsDir, before, pid, worktree, Date.now());
      if (sibling) {
        return { id: existing.id, created: false, refused: `${sibling} is the newer conversation in this process and beat within ${SUPERSEDE_GRACE_MS / 60000} min — not reviving or touching ${existing.id}` };
      }
      // A record owned by a DIFFERENT live local process is that process's
      // conversation, not ours: stamping our pid over it makes the peer read as
      // dead once we exit, and recovery then releases its claims (WS-890 review,
      // probe8). A hook payload never reaches here; only a hand-run can misname.
      // Only when we KNOW our pid: without CLAUDE_PID nothing is stamped below,
      // so there is nothing to overwrite and the revive stays harmless.
      // The ONE rule (cwos-claims.handRunPidRefusal, WS-890 review r5) decides,
      // judged on the record as read — before touchSession's host-heal.
      const pidRefusal = handRunPidRefusal(wsDir, existing.id, pid);
      if (pidRefusal) {
        return { id: existing.id, created: false, refused: `${pidRefusal} — not reviving or touching it` };
      }
      // A record naming another machine is its owner's to revive (WS-884), and a
      // hostless one is treated as foreign everywhere else (--close, recovery).
      if (!before || !isLocalHost(before)) {
        return { id: existing.id, created: false, refused: `${existing.id} is owned by ${before && before.host ? `host ${before.host}` : 'no recorded host'} — not reviving or touching it` };
      }
    }
    // Revive only a record this machine owns: the base never revived a foreign
    // or hostless record, and reviving one stamps our host and pid onto another
    // node's conversation (WS-890 review r6, probe12 A/B).
    // And only from the hook: a hand-run cannot prove a closed record is its own
    // (without CLAUDE_PID nothing ties it to this process), and the base never
    // revived at all (WS-890 review r7, probe14). The SessionStart payload is
    // the harness saying this conversation is running here.
    const revivedFrom = !handRun && before && isLocalHost(before) ? reviveOwnRecord(existing.file) : null;
    touchSession(wsDir, existing.id, null, { handRun });
    // Re-assert the pid: a resumed session runs in a new process. DATE it in the
    // same write (WS-351): an undated pid cannot be told apart from one recycled
    // across a reboot. Into the SIDECAR (WS-884) — this used to patch the
    // tracked record on every resume, one more per-session tracked write.
    // Only a KNOWN pid (CLAUDE_PID): a hand-run without it must not overwrite
    // the real one with a shell's.
    const now = new Date().toISOString();
    if (Number(pid) > 0) {
      writeLiveness(wsDir, existing.id, {
        pid: Number(pid),
        pid_recorded_at: now,
        ...(revivedFrom ? { revived_at: now } : {}),
      }, { ownerLabel: 'session-register:resume' });
    } else if (revivedFrom) {
      writeLiveness(wsDir, existing.id, { revived_at: now }, { ownerLabel: 'session-register:resume' });
    }
    if (revivedFrom) {
      emitEvent('T15:session-end', 'session-revived', {
        session_id: existing.id, agent_session_id: agentId, from_status: revivedFrom,
      });
    }
    // No predecessor is closed here (WS-890 scope cut): automatic /clear-ghost
    // closure reached live sessions and their claims. The gate ignores its own
    // ghosts read-only; a record is closed only by recovery --close.
    return { id: existing.id, created: false, revived_from: revivedFrom };
  }

  const now = Date.now();
  const id = humanId(agentId, now);
  const ts = new Date(now).toISOString();
  const sessDir = path.join(wsDir, 'sessions');
  try { fs.mkdirSync(sessDir, { recursive: true }); } catch { /* exists */ }
  const file = path.join(sessDir, `${id}.yaml`);

  if (!fs.existsSync(file)) {
    // THE TRACKED HALF (WS-884): identity, lifecycle, owner host, join key,
    // claim lists. Written here and at close. Everything per-turn goes in the
    // sidecar below, so this file never again conflicts between machines.
    writeFileAtomic(file, [
      `id: "${id}"`,
      'status: active',
      `started_at: "${ts}"`,
      'ended_at: null',
      'mode: auto',
      // WS-564: which machine owns this record. `sessions/` is tracked, so
      // records travel between nodes by git pull — without this, the pid in the
      // sidecar and the boot-time proof in cwos-claims are both evaluated against
      // whichever machine happens to be reading, and a live session on another
      // node reads as dead and has its claims taken. A record naming another
      // host is never judged remotely (ADR-065).
      `host: "${localHost() || ''}"`,
      // WS-893: hostname is not an identity (every cloud container is `vm`);
      // the boot-qualified node id is what tells two containers apart.
      `node_id: "${localNodeId() || ''}"`,
      // The harness id is the join key. Keep it: it is what makes re-fires
      // idempotent and what distinguishes concurrent sessions from each other.
      `agent_session_id: "${agentId || ''}"`,
      // WS-1226: the harness said this conversation began with /clear, so an
      // older record on the same pid and checkout is its predecessor. Hook-only.
      ...(via ? [`started_via: ${via}`] : []),
      '',
      '# Registered automatically by cwos-session-register (SessionStart hook, WS-533).',
      '# Registration is deliberately NOT dependent on anyone running /session-start —',
      '# that dependency is why this registry sat empty from 2026-05-15 to 2026-07-26.',
      '# Liveness (heartbeat, pid, worktree) lives in liveness/<id>.json on the owning',
      '# node — per-node and untracked (WS-884). This file changes at claim and close.',
      'claimed_items: []',
      'files_locked: []',
      '',
    ].join('\n'));
    // THE PER-NODE HALF. The session's process: `process.pid` here would be
    // this short-lived hook, useless the moment it exits; the caller passes
    // CLAUDE_PID or `process.ppid` — the Claude Code harness — which outlives
    // the whole session. Load-bearing (WS-351): a dead pid recovers the session
    // without waiting on the timeout, and the date stamp is what makes that
    // safe against post-reboot pid recycling. The worktree lands now too (AF-7,
    // 2026-08-26): until it did, a session had NO worktree until its first Stop
    // beat, a window spanning an entire first turn, and a genuinely cohabiting
    // peer read as unlocatable for all of it.
    writeLiveness(wsDir, id, {
      last_heartbeat: ts,
      pid: Number(pid) || undefined,
      pid_recorded_at: Number(pid) > 0 ? ts : undefined,
      worktree: currentWorktree() || '',
      host: localHost() || '',
      node_id: localNodeId() || '',
    }, { ownerLabel: 'session-register' });
  }

  // WS-560 (INV-028): session registration is the fact every claim-conflict
  // and liveness decision is built on (WS-533). It must leave a trace.
  // WS-942: and which build and model it started on. Nulls are recorded as
  // nulls: "unknown" is a fact a later reader can count, an absent key is not.
  emitEvent('T15:session-end', 'session-registered', Object.assign(
    { session_id: id, agent_session_id: agentId || null, ...(via ? { started_via: via } : {}) },
    identity || {}
  ));

  // Legacy pointer, best-effort and lock-guarded. Not the identity of record.
  try {
    withFileLock(path.join(wsDir, '.current-session.lock'), () => {
      writeFileAtomic(path.join(wsDir, '.current-session'), id);
    }, { ownerLabel: 'session-register', maxWaitMs: 2000 });
  } catch { /* a lost pointer race is harmless — the session file is authoritative */ }

  return { id, created: true };
}

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);

  let wsDir;
  try {
    wsDir = values['workstream-dir']
      ? path.resolve(values['workstream-dir'])
      : findWorkstreamDir(process.cwd());
  } catch {
    return 0; // no workstream here — nothing to register, not an error
  }

  const hook = values['session-id'] ? null : readHookStdin();
  // CLAUDE_CODE_SESSION_ID last (WS-890): a hand-run from a tool shell has no
  // hook stdin, and without the environment fallback it forked a fresh
  // `ses-*-nohook` record and repointed .current-session at it (friction
  // b3a7d55a9c) instead of finding the session's own record.
  const agentId = values['session-id'] || (hook && hook.session_id) || agentSessionIdFromEnv() || null;

  // WS-942: what this session runs on, read before registering so the
  // session-registered event can carry it.
  let identity = null;
  try { identity = harnessIdentity.identify({ hook }); } catch { /* unknown is survivable */ }

  // No harness identity at all — no --session-id, no hook payload, no
  // CLAUDE_CODE_SESSION_ID — means nobody here to register. Minting anyway
  // forked an identity-less `-nohook` record that no later hook could ever
  // match, so it sat `active` until recovery took it (WS-890). Report only.
  let refused = null;
  if (!values['no-register'] && !agentId) {
    refused = 'no harness session id (no --session-id, no hook stdin, no CLAUDE_CODE_SESSION_ID) — not registering';
  }

  let self = { id: null, created: false };
  if (!values['no-register'] && !refused) {
    // The pid is CLAUDE_PID or nothing (WS-890). `process.ppid` was the old
    // fallback; under a hook or a tool shell it is the shell that ran us, which
    // exits at once and turns the record into a false DEAD_PID proof. No pid is
    // merely unverifiable — the timeout governs — and the next beat that has
    // CLAUDE_PID fills it in.
    try { self = register(wsDir, agentId, harnessPid(), identity, { handRun: !hook, via: startedVia(hook) });
      if (self.refused) refused = self.refused; }
    catch { /* registration is best-effort; still report below */ }
  }

  // A build or model this machine has not run before. Checked on resume as
  // well as on a fresh start: a resumed session is a new process, and may be
  // the first one on a build that updated while it was closed.
  let harnessChanges = [];
  if (!values['no-register'] && identity) {
    try {
      harnessChanges = harnessIdentity.note(wsDir, identity, { sessionId: self.id }).changes;
      for (const c of harnessChanges) {
        emitEvent('T15:session-end', 'harness-changed', Object.assign({ session_id: self.id, host: localHost() || null }, c));
      }
    } catch { /* never block a session start */ }
  }

  const others = listLiveSessions(wsDir, self.id);
  const health = registryHealth(wsDir);
  const stale = staleActiveSessions(wsDir, { selfId: self.id });

  if (values.json) {
    process.stdout.write(JSON.stringify({
      self, refused, others, registry: health, stale_active: stale,
      harness: Object.assign({}, identity || {}, { changes: harnessChanges }),
    }) + '\n');
    return 0;
  }
  if (values.quiet) return 0;

  const lines = [];
  if (refused) lines.push(`session-register: ${refused}`);

  // The line that would have prevented the 2026-07-26 incident.
  if (others.length) {
    lines.push(`⚠ ${others.length} other session(s) live in this repo:`);
    for (const o of others) {
      const claims = o.claimed_items.length ? ` — claims ${o.claimed_items.join(', ')}` : '';
      const where = o.foreign_host ? ` on ${o.host || 'an unknown host'}` : '';
      lines.push(`  - ${o.id} (pid ${o.pid == null ? '?' : o.pid})${where}${claims}`);
    }
    lines.push('  Coordinate before editing shared files, or work in a separate worktree.');
  }

  // A dead registry must never read as "all clear" (WS-533 item 4).
  if (!health.ok) {
    lines.push(`⚠ session registry unhealthy: ${health.reason}`);
    lines.push('  Until fixed, "no other session" means UNKNOWN, not none.');
  }

  // WS-564: records that SAY active but stopped heartbeating. They are what makes
  // every concurrency signal unusable in both directions — filtered out as
  // not-live by anything that trusts heartbeats, counted forever by anything that
  // does not. Recovery is supposed to clear them; when it is not running, the
  // population is the symptom that says so.
  if (stale.length) {
    lines.push(`⚠ ${stale.length} session(s) marked active but not heartbeating:`);
    for (const s of stale.slice(0, 6)) {
      const held = s.claimed_items.length ? ` holding ${s.claimed_items.join(', ')}` : '';
      const age = s.minutes_stale == null ? 'no heartbeat' : `${Math.floor(s.minutes_stale / 60)}h stale`;
      lines.push(`  - ${s.id} (${age})${held}`);
    }
    if (stale.length > 6) lines.push(`  - ... and ${stale.length - 6} more`);
    lines.push('  Clear with: node kit/scripts/cwos-session-recovery.js --auto');
  }

  // Taken only here, by the run that prints: a change a --quiet or --json run
  // detected is still waiting, and is announced now.
  // WS-1075: where a repo keeps a probe sheet for what the harness allows
  // (HomeBase's scripts/cwos-harness-probes.js), a build change says how many
  // of its rows are now due. Absent everywhere else, so adopted repos see nothing new.
  const dueLine = () => {
    const probes = path.join(wsDir, '..', '..', 'scripts', 'cwos-harness-probes.js');
    return fs.existsSync(probes) ? require(probes).dueSummary(wsDir) : null;
  };
  try { lines.push(...harnessIdentity.describe(harnessIdentity.takeUnannounced(wsDir), { dueLine })); }
  catch { /* never block a session start */ }

  if (lines.length) process.stdout.write(lines.join('\n') + '\n');
  return 0;
}

// WS-544: guard the entry point so requiring this file for a dependency smoke
// check neither registers a session nor exits the checking process.
if (require.main === module) {
  try { main(); }
  catch { /* never block a session start */ }
  process.exit(0);
}
