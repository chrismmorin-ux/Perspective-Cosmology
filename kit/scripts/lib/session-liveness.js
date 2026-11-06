'use strict';
/**
 * session-liveness — one verdict on whether a session record's process is gone.
 *
 * Before this module there were three liveness checkers with three different
 * notions of "alive", and none of them looked at the one definitive signal
 * already sitting in every session record: the PID.
 *
 *   cwos-session-recovery  heartbeat age > 4h        blind to a process that
 *                                                    died ten minutes ago
 *   cwos-fleet-scan        heartbeat predates boot   blind to any death that
 *                                                    did not involve a reboot
 *   claude-sentinel.ps1    process name only         counted the Claude Desktop
 *                                                    app's Electron helpers
 *
 * Measured 2026-08-03: 18 session records claimed `status: active` while four
 * processes were alive. One corpse (HomeBase ses-20260803-2116-0a7d8844, pid
 * 11880) held WS-567/569/574/575 fenced, and nothing would have freed them for
 * up to four hours — and then only if someone happened to start a session in
 * that same repo. fleet-scan reported a dead pid 21444 as LIVE at the time.
 *
 * ── The asymmetry, which is the whole design ──────────────────────────────
 *
 * A DEAD PID IS PROOF OF DEATH. The process is gone; act immediately, no
 * timeout, no grace period. Nothing about a dead process becomes truer by
 * waiting four hours.
 *
 * A LIVE PID IS NOT PROOF OF LIFE. PIDs get reused, and this fleet demonstrably
 * reuses them: on 2026-08-03 pid 31664 held records in both ai-personal and
 * claude-poker-tracker, and pid 9124 held two records in claude-poker-tracker
 * alone. A live PID means only "not yet proven dead" — the heartbeat and boot
 * rules still have to run.
 *
 * PID CHECKS ARE VALID ONLY ON THE OWNING HOST. A record carries `host`
 * (e.g. `MorinComputer`). Asking this machine whether pid 11880 is running
 * tells you nothing about pid 11880 on CM-NODE1. A record with no `host`
 * predates the field and must NOT be assumed local: the cost of guessing wrong
 * is declaring a live remote session dead and yanking its claims out from under
 * it. Same reasoning as cwos-fleet-scan's isLocalHostRecord (WS-564).
 *
 * Heartbeat staleness is the one rule that survives a foreign host, because a
 * timestamp is wall-clock and means the same thing everywhere. Boot time does
 * not: our uptime says nothing about theirs.
 *
 * ── Consumers ─────────────────────────────────────────────────────────────
 *
 * cwos-session-recovery.js  gates recovery on the verdict instead of a timeout
 * cwos-fleet-scan.js        reports LIVE/STALE from the verdict
 * cwos-session-sweep.js     acts fleet-wide on proof, reports on suspicion
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const nodeIdentity = require('./node-identity');

const DEFAULT_TIMEOUT_HOURS = 4;

/**
 * THE session timeout (ADR-067). One constant governs when a non-heartbeating
 * session's claims stop counting as conflicts, when they become stealable, and
 * when recovery abandons the session. Two values used to govern the same fact —
 * claims went reclaimable-but-unclearable at 90 minutes while recovery waited
 * 4 hours — which left items invisible to the gate yet unclaimable for 2.5h.
 * A claim becomes stealable exactly when recovery would abandon its owner,
 * never earlier (WS-312: the shorter window evicted a live working session).
 */
const SESSION_TIMEOUT_MINUTES = DEFAULT_TIMEOUT_HOURS * 60;

/**
 * How long a record from ANOTHER host is trusted on its owner's word alone
 * (WS-884). The heartbeat no longer travels through git — it lives in the
 * owning node's untracked sidecar — so from here a foreign record carries only
 * `status`, `started_at` and `ended_at`. Its owner's sweep closes it within 15
 * minutes of death and autocommit + RepoPull carry the closure; this fallback
 * exists only so a machine that leaves the fleet cannot fence claims forever.
 * Seven days, not four hours: the shorter number is what made node1 close the
 * G16's live sessions and release their claims (the WS-564 class of theft).
 */
const FOREIGN_HOLD_DAYS = 7;

/**
 * How long a LOCAL record may sit idle with its process verifiably alive
 * before staleness outranks the pid (ADR-078 decision 3). The Stop hook does
 * not beat during a long autonomous turn, so a 4h timeout alone abandoned
 * working sessions and the next Stop revived them — one session was abandoned
 * three times in a day, each cycle rewriting the tracked record twice. A live,
 * post-boot pid vetoes the timeout up to this cap; past it, the pid is presumed
 * to belong to a later conversation in the same process (a `/clear` ghost) and
 * the timeout rule resumes.
 */
const IDLE_ALIVE_CAP_HOURS = 24;

/**
 * How long a session WAITING ON THE FOUNDER holds its claims with no heartbeat
 * (WS-1073, founder decision 2026-10-12). A session that has put a plan up for
 * approval, or asked a question, cannot beat: no turn ends while it waits. On
 * 2026-10-10 SPR-241's plan sat 23h in plan mode, the 4h timeout read the
 * session as dead, a second session adopted the sprint and built WS-943, and
 * then the first was approved to build the same plan. The wait is stamped by
 * cwos-lease-check (PreToolUse on ExitPlanMode / AskUserQuestion) into the
 * per-node sidecar; 72h covers an overnight or weekend answer. Proof of death
 * (dead pid, pre-boot heartbeat) still outranks it.
 */
const WAITING_HOLD_HOURS = 72;

/**
 * The record's founder wait, when it is still inside the hold; else null.
 * @returns {{since:string, kind:string, items:string[], age_hours:number}|null}
 */
function activeWait(record, nowMs = Date.now()) {
  const w = record && record.waiting_on_founder;
  if (!w || typeof w !== 'object') return null;
  const since = Date.parse(String(w.since || ''));
  if (!Number.isFinite(since)) return null;
  const ageHours = (nowMs - since) / 3600000;
  if (ageHours < 0 || ageHours > WAITING_HOLD_HOURS) return null;
  return {
    since: w.since,
    kind: w.kind || 'plan',
    items: Array.isArray(w.items) ? w.items : [],
    age_hours: ageHours,
  };
}

/** Proof the process is gone. Safe to act on with no timeout. */
const DEAD_PID = 'dead-pid';
/** Proof the process is gone: its heartbeat predates the machine's boot. */
const DEAD_BOOT = 'dead-boot';
/** Proof the conversation is over: its process now runs a different one (WS-1294). */
const SUPERSEDED = 'superseded';
/** Suspicion only. Requires the abandon timeout before anyone acts. */
const STALE_HEARTBEAT = 'stale-heartbeat';
/** No reason to think it is gone. */
const ALIVE = 'alive';
/** Not judgeable from here — foreign host, or no host recorded. Never acted on. */
const UNKNOWN = 'unknown';

/**
 * Was this record written by the machine now reading it?
 *
 * Hostless returns false deliberately. See the header: a missing `host` predates
 * the field and cannot be assumed local.
 */
function isLocalHostRecord(recordOrHost, assumeLocal = false) {
  // WS-893: delegates to the one node-identity rule. A bare host string still
  // works; passing the record lets its `node_id` tell sibling cloud containers
  // (all hostname `vm`) apart, which a hostname compare cannot.
  try {
    return nodeIdentity.isLocalRecord(recordOrHost, { assumeLocal });
  } catch {
    return false;
  }
}

/**
 * Approximate wall-clock ms of the last boot. A heartbeat written before this
 * cannot belong to a live process. os.uptime() avoids a shell-out and behaves
 * the same on Windows and POSIX.
 */
function bootTimeMs() {
  try {
    return Date.now() - os.uptime() * 1000;
  } catch {
    return null;
  }
}

/**
 * Is this PID running on THIS machine?
 *
 *   true   running (or running as another user — EPERM still proves existence)
 *   false  definitively gone (ESRCH)
 *   null   cannot tell — malformed pid, or an errno we do not recognise
 *
 * `null` rather than `false` on the unknown path is load-bearing. Returning
 * false for "we could not tell" would manufacture proof of death out of an
 * unrelated failure, and proof of death is the thing this module lets callers
 * act on without a timeout.
 *
 * signal 0 performs the permission-and-existence check without delivering a
 * signal; Node implements it on Windows too.
 */
function isPidAlive(pid) {
  const n = typeof pid === 'number' ? pid : parseInt(pid, 10);
  if (!Number.isInteger(n) || n <= 0) return null;
  if (n === process.pid) return true;
  try {
    process.kill(n, 0);
    return true;
  } catch (err) {
    if (err && err.code === 'ESRCH') return false;
    if (err && err.code === 'EPERM') return true;
    return null;
  }
}

/**
 * Which conversation is this Claude Code process running right now (WS-1294)?
 *
 * Claude Code itself writes `<config dir>/sessions/<pid>.json` for every
 * interactive process and rewrites `sessionId` when /clear or /resume moves the
 * process to another conversation. That is the harness's own word, not an
 * inference: the /clear-ghost rule in cwos-claims (same pid + same worktree)
 * never fired for the founder, because every /next moves the conversation
 * into a fresh worktree. Measured 2026-10-30: ai-personal pid 29364 carried
 * seven `active` records from six cleared conversations, one fencing WS-228.
 *
 * Returns null whenever the file is absent, unreadable or names another pid.
 * Null never condemns anything.
 */
function harnessConversation(pid, opts = {}) {
  const n = typeof pid === 'number' ? pid : parseInt(pid, 10);
  if (!Number.isInteger(n) || n <= 0) return null;
  const dir = opts.harnessSessionsDir
    || path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'), 'sessions');
  let doc;
  try { doc = JSON.parse(fs.readFileSync(path.join(dir, `${n}.json`), 'utf8')); } catch { return null; }
  if (!doc || Number(doc.pid) !== n || typeof doc.sessionId !== 'string' || !doc.sessionId) return null;
  return { sessionId: doc.sessionId, entrypoint: doc.entrypoint || null, kind: doc.kind || null };
}

/**
 * How recently a superseded record may have beaten and still be held. A
 * background subagent can outlive /clear; while it works, its hooks beat the
 * old conversation's record, so a fresh beat keeps the claims. Ten minutes is
 * the PostToolUse heartbeat's min-interval, the same window as cwos-claims'
 * SUPERSEDE_GRACE_MS.
 */
const SUPERSEDE_GRACE_MINUTES = 10;

/**
 * The conversation id now running in this record's process, when that proves
 * the record's own conversation is over; else null.
 *
 * ALL must hold: the record names its conversation (`agent_session_id`); the
 * harness file for its pid exists and is a terminal CLI interactive process
 * (the desktop app and SDK children host several conversations in one pid);
 * the two ids differ; the record has not beaten for SUPERSEDE_GRACE_MINUTES.
 * The caller establishes that the record is local and its pid alive.
 */
function supersededBy(record, opts = {}) {
  const r = record || {};
  const mine = String(r.agent_session_id || '').replace(/^"|"$/g, '').trim();
  if (!mine) return null;
  const conv = harnessConversation(r.pid, opts);
  if (!conv || conv.entrypoint !== 'cli' || conv.kind !== 'interactive') return null;
  if (conv.sessionId === mine) return null;
  const nowMs = Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now();
  const beat = Date.parse(String(r.last_heartbeat || r.started_at || '').replace(/^"|"$/g, ''));
  if (!Number.isFinite(beat) || nowMs - beat <= SUPERSEDE_GRACE_MINUTES * 60000) return null;
  return conv.sessionId;
}

/**
 * Classify one session record.
 *
 * @param {object} record   session YAML data — needs status/pid/host/last_heartbeat
 * @param {object} [opts]
 * @param {number} [opts.timeoutHours]  abandon timeout, default 4
 * @param {number} [opts.nowMs]         injectable clock, for tests
 * @param {number} [opts.bootMs]        injectable boot time, for tests
 * @param {boolean} [opts.assumeLocal]  caller has independent proof this record
 *        is host-local — in practice, fleet/registry.yaml says the repo is
 *        `hosted_on` this node, and repos on this fleet are node-local disk
 *        rather than shared mounts. Upgrades a HOSTLESS record to local so
 *        older kits (which never wrote `host`) can still be judged. It can
 *        never override an explicit foreign host — a record that names another
 *        machine stays foreign no matter what the registry says.
 * @returns {{verdict:string, proof:boolean, reason:string, age_hours:number|null}}
 *          `proof` is true only when the process is provably gone.
 */
function classifySession(record, opts = {}) {
  const timeoutHours = Number.isFinite(opts.timeoutHours) && opts.timeoutHours > 0
    ? opts.timeoutHours
    : DEFAULT_TIMEOUT_HOURS;
  const nowMs = Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now();
  const bootMs = opts.bootMs === undefined ? bootTimeMs() : opts.bootMs;

  const data = record || {};
  const local = isLocalHostRecord(data, opts.assumeLocal);

  const hbRaw = data.last_heartbeat || data.started_at || null;
  const hbMs = hbRaw ? Date.parse(hbRaw) : NaN;
  const hbOk = Number.isFinite(hbMs);
  const ageHours = hbOk ? (nowMs - hbMs) / (60 * 60 * 1000) : null;

  const verdict = (v, reason) => ({
    verdict: v,
    proof: v === DEAD_PID || v === DEAD_BOOT || v === SUPERSEDED,
    reason,
    age_hours: ageHours,
  });

  // ── Host-local rules: the ones that can produce proof ────────────────────
  let alive = null;
  if (local) {
    alive = isPidAlive(data.pid);

    // Strongest signal first. A dead PID ends the question.
    if (alive === false) {
      return verdict(DEAD_PID, `pid ${data.pid} is not running on ${nodeIdentity.nodeIdentity() || os.hostname()}`);
    }

    // WS-351, restored 2026-08-13 (the 3.10.3 kit sync dropped it — FIND-108):
    // a pid RECORDED before the current boot cannot name a surviving process,
    // no matter what the process table says now. If that number is alive today
    // the OS recycled it after the reboot. `pid_recorded_at` is the registrar's
    // stamp; `started_at` is the fallback because that is when both writers
    // stamped the pid before the field existed. Records self-heal on the next
    // SessionStart re-fire, which re-asserts pid AND date — so a resumed
    // session with a pre-boot started_at is NOT condemned.
    if (data.pid != null) {
      const stampRaw = data.pid_recorded_at || data.started_at || null;
      const stampMs = stampRaw ? Date.parse(String(stampRaw).replace(/^"|"$/g, '')) : NaN;
      if (Number.isFinite(stampMs) && Number.isFinite(bootMs) && stampMs < bootMs) {
        const reused = alive === true ? ` (pid ${data.pid} now belongs to another process)` : '';
        return verdict(DEAD_BOOT, `pid recorded before last system boot${reused}`);
      }
    }

    // Independent of whether the PID is alive: if the heartbeat predates boot,
    // the process that wrote it is gone. A live PID here means the OS handed
    // that number to something else — exactly the reuse the header describes.
    if (hbOk && Number.isFinite(bootMs) && hbMs < bootMs) {
      const reused = alive === true ? ` (pid ${data.pid} now belongs to another process)` : '';
      return verdict(DEAD_BOOT, `heartbeat predates last system boot${reused}`);
    }

    // WS-1294: the process lives on, but the harness says it now runs another
    // conversation. Outranks a founder wait: a cleared plan cannot be approved.
    if (alive === true) {
      const successor = supersededBy(data, { ...opts, nowMs });
      if (successor) {
        return verdict(SUPERSEDED, `conversation ended: Claude process ${data.pid} now runs ${successor.slice(0, 8)} (harness record)`);
      }
    }

    // PID unreadable and no boot proof — fall through to the timeout rule.
  }

  // ── A record that NAMES another host is never judged here (WS-884) ───────
  // Its heartbeat lives in that machine's untracked sidecar, so the value we
  // hold is frozen at registration and says nothing about now. Until this was
  // structural, the stale branch below closed the G16's live sessions from
  // CM-NODE1 with node1's own `ended_at`, the G16 closed them again on return,
  // and every pull conflicted on the same record. ADR-065's text always said
  // foreign records are the owning node's to close; the code now agrees.
  // Hostless records (pre-WS-564) keep the wall-clock reading below: they
  // predate the field and are the transient case, not the fleet case.
  if (!local && data.host) {
    return verdict(UNKNOWN, `record host ${data.host} is not this machine; its owner's sweep judges it`);
  }

  // ── Wall-clock staleness (local, or hostless) ────────────────────────────
  if (!hbOk) {
    return local
      ? verdict(STALE_HEARTBEAT, 'no parseable heartbeat')
      : verdict(UNKNOWN, 'no parseable heartbeat, and record is not host-local');
  }
  if (ageHours > timeoutHours) {
    // WS-1073: waiting on the founder is not idleness — no turn can end, so
    // nothing beats. Held up to WAITING_HOLD_HOURS from when the wait began.
    const wait = local ? activeWait(data, nowMs) : null;
    if (wait) {
      return verdict(ALIVE, `waiting on founder (${wait.kind === 'question' ? 'question pending' : 'plan pending'}) for ${wait.age_hours.toFixed(1)}h (hold ${WAITING_HOLD_HOURS}h)`);
    }
    // ADR-078 (3): a verified-alive, post-boot pid vetoes the timeout, up to
    // the idle cap. The Stop hook does not beat during a long autonomous turn;
    // abandoning on the timer alone released a working session's claims and
    // the next Stop revived it, twice a day. Beyond the cap the pid is more
    // likely a `/clear` successor in the same process, and suspicion resumes.
    if (local && alive === true && ageHours <= IDLE_ALIVE_CAP_HOURS) {
      return verdict(ALIVE, `idle ${ageHours.toFixed(1)}h but pid ${data.pid} verified running (cap ${IDLE_ALIVE_CAP_HOURS}h)`);
    }
    return verdict(STALE_HEARTBEAT, `heartbeat ${ageHours.toFixed(1)}h old (timeout ${timeoutHours}h)`);
  }

  // Fresh heartbeat on a hostless record: the most we can say — we cannot
  // check its PID, so "alive" would overclaim.
  if (!local) {
    return verdict(UNKNOWN, 'record has no host; heartbeat is fresh');
  }
  // ALIVE is a VETO on destructive action (--force included), so it must mean
  // "pid verified running", never "nothing looked wrong". A record whose pid is
  // missing or unreadable cannot be vouched for: it stays on the suspicion
  // path, where the timeout (or an explicit --force) governs. Returning ALIVE
  // here is what made --force unable to close pid-less corpses (WS-351).
  if (alive === true) {
    return verdict(ALIVE, 'pid check and heartbeat both clean');
  }
  return verdict(STALE_HEARTBEAT,
    `pid ${data.pid == null ? 'not recorded' : 'unverifiable'}; heartbeat fresh but process cannot be vouched for`);
}

/**
 * Would `cwos-session-recovery --auto` close a session with this verdict? THE
 * one answer (WS-973; moved here by WS-1017 so cwos-claims can ask it without
 * requiring the recovery script).
 */
function recoveryWouldAct(verdict, { timeoutHours, force = false } = {}) {
  if (verdict.proof) return true;
  return verdict.verdict === STALE_HEARTBEAT
    && (force || verdict.age_hours === null || verdict.age_hours > timeoutHours);
}

module.exports = {
  classifySession,
  recoveryWouldAct,
  activeWait,
  WAITING_HOLD_HOURS,
  harnessConversation,
  supersededBy,
  SUPERSEDE_GRACE_MINUTES,
  SUPERSEDED,
  isPidAlive,
  isLocalHostRecord,
  bootTimeMs,
  DEFAULT_TIMEOUT_HOURS,
  SESSION_TIMEOUT_MINUTES,
  FOREIGN_HOLD_DAYS,
  IDLE_ALIVE_CAP_HOURS,
  ALIVE,
  DEAD_PID,
  DEAD_BOOT,
  STALE_HEARTBEAT,
  UNKNOWN,
};
