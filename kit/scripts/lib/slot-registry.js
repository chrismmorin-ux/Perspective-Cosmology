'use strict';
/**
 * slot-registry — a machine-scoped, crash-safe lease on "I am about to use a lot
 * of memory" (WS-707).
 *
 * WS-708 gave the fleet a headroom GATE (refuse a run that cannot fit) and
 * WS-711 gave it a SIZER (degrade a run to fewer workers). Both act on one job
 * in isolation. Neither can see the job in the OTHER repo that is about to start
 * two seconds from now, and that is the case that actually broke:
 *
 *   G16 2026-08-22 — three background test shards KILLED mid-run, twice leaving
 *     orphaned vitest workers that had to be reaped by hand. A unit test with a
 *     30,000 ms budget measured 31,235 ms and failed; re-run at 300,000 ms it
 *     passed in the same 31 seconds. It was never a regression, it was
 *     contention. Resident throughout: a 1,190 MB node process belonging to a
 *     DIFFERENT repo's worktree.
 *
 * That last fact is the whole design constraint. THE CONTENTION IS BETWEEN
 * REPOS, so a per-repo lock cannot fix it. The registry is therefore keyed to
 * the MACHINE (~/.claude/), alongside the other machine-scoped state the kit
 * already keeps there (cwos-guard's guards.yaml, the admin-escalation log) —
 * never to a repo, and never to .claude/workstream/, which forks per checkout.
 *
 * WHY THIS IS NOT A SECOND LEASE SYSTEM. The kit already leases work items
 * (cwos-item) and sessions (.claude/workstream/sessions/). Those key on a
 * SESSION and live as long as one. This keys on a JOB and lives for the length
 * of one command. Different key, different lifetime, no shared state. The
 * failure this repo has made repeatedly — two systems that do not know about
 * each other — needs them to be answering the same question, and these do not.
 *
 * FAIL OPEN, LOUDLY (founder decision, 2026-09-11). A registry that cannot be
 * read or locked lets the job RUN, with a warning and a friction event. The
 * worst case is then exactly today's behaviour, which the fleet survives; the
 * alternative is a coordinator bug that can stop every heavy job on every
 * machine with a manual recovery path. Silence is the only outcome ruled out.
 *
 * CRASH SAFETY IS NOT OPTIONAL HERE — three holders were really killed on the
 * day this was filed. Two independent reclaim signals, both evaluated on READ,
 * so there is no cleanup command to forget to run:
 *
 *   1. PID liveness — instant. A killed wrapper's slot is free on the very next
 *      read rather than after a timeout.
 *   2. Heartbeat TTL — the fallback for a RECYCLED pid, where signal 1 says
 *      "alive" about the wrong process. A recycled pid falsely HOLDS a slot
 *      until the TTL expires, i.e. it fails toward waiting rather than toward
 *      the collision this module exists to prevent. That is the right direction.
 *
 * This module is deliberately pure I/O-on-one-file: no spawning, no measuring,
 * no PowerShell. Same reason worker-sizing.js was split out of cwos-headroom.js
 * — the math and the lease can be tested on an idle machine, which is the only
 * kind of machine a test suite is ever allowed to assume.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const { withFileLock, writeFileAtomic } = require('./cwos-utils');

/** Registry lives beside the kit's other machine-scoped state. */
const REGISTRY_PATH = path.join(os.homedir(), '.claude', 'cwos-slots.json');

/**
 * Measured peak of one vitest shard on the G16, 2026-08-22: 2,527 MB across up
 * to 21 processes. This is a MEASUREMENT, not the estimate worker-sizing has to
 * apologise for — it came off the sampling run that produced WS-707. It is still
 * one job class on one machine, so a caller with its own figure should pass it
 * and get `calibrated: true`.
 */
const DEFAULT_PER_JOB_GB = 2.527;

/** Left unallocated for the OS and the session doing the asking. */
const DEFAULT_RESERVE_GB = 2.0;

/** How long a cached capacity figure is trusted before it is re-measured. */
const CAPACITY_TTL_MS = 60_000;

/** A holder that has not heartbeat within this is presumed dead. */
const HEARTBEAT_TTL_MS = 120_000;

/** How often a live wrapper refreshes its own heartbeat. */
const HEARTBEAT_INTERVAL_MS = 30_000;

const EMPTY = () => ({ version: 1, capacity: null, holders: [] });

// ── Liveness ────────────────────────────────────────────────────────────────

/**
 * Is this pid still running?
 *
 * Signal 0 sends nothing; it only runs the kernel's "does this exist and may I
 * signal it" check. ESRCH is the only answer that means gone. EPERM means the
 * process exists but belongs to someone else — alive, and reporting it dead
 * would hand its slot away while it is still allocating.
 *
 * An unknown errno returns ALIVE, on the same principle: this module's mistakes
 * should cost a wait, never a collision.
 */
function pidAlive(pid, kill = process.kill.bind(process)) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    kill(pid, 0);
    return true;
  } catch (err) {
    if (err && err.code === 'ESRCH') return false;
    return true;
  }
}

/**
 * Why a holder is considered dead, or null if it is alive. Returned rather than
 * a bare boolean because a waiting session has to be able to say what it is
 * waiting on and what it reclaimed — an opaque wait is indistinguishable from a
 * hang, and a session that cannot explain its own stall gets killed.
 */
function deadReason(holder, now, opts = {}) {
  const ttl = Number.isFinite(opts.heartbeatTtlMs) ? opts.heartbeatTtlMs : HEARTBEAT_TTL_MS;
  if (!holder || typeof holder !== 'object') return 'malformed entry';
  if (!pidAlive(holder.pid, opts.kill)) return `pid ${holder.pid} is gone`;

  const beat = Date.parse(holder.heartbeat_at || holder.claimed_at || '');
  if (!Number.isFinite(beat)) return 'no parseable heartbeat';

  const age = now - beat;
  if (age > ttl) return `heartbeat ${Math.round(age / 1000)}s old (ttl ${Math.round(ttl / 1000)}s)`;
  return null;
}

/** Split holders into the ones still holding and the ones to reclaim. */
function partitionHolders(holders, now, opts = {}) {
  const live = [];
  const reclaimed = [];
  for (const h of Array.isArray(holders) ? holders : []) {
    const why = deadReason(h, now, opts);
    if (why) reclaimed.push({ holder: h, reason: why });
    else live.push(h);
  }
  return { live, reclaimed };
}

// ── Capacity ────────────────────────────────────────────────────────────────

/**
 * How many heavy jobs this machine can hold at once.
 *
 * THE FLOOR IS 1, NEVER 0 — the same property worker-sizing.js pins, for the
 * same reason. A capacity of 0 would mean "no heavy job may ever run", which is
 * a GATE's verdict (cwos-headroom --require-gb), not a mediator's. A mediator
 * that can return 0 has silently become a gate, and would wedge the machine at
 * exactly the moment it is busiest.
 */
function deriveSlots(opts = {}) {
  const freeGB = Number.isFinite(Number(opts.freeGB)) ? Number(opts.freeGB) : 0;

  const perJobGB = Number.isFinite(Number(opts.perJobGB)) && Number(opts.perJobGB) > 0
    ? Number(opts.perJobGB)
    : DEFAULT_PER_JOB_GB;

  // Absence has to be checked before coercion: Number(null) is 0, and 0 is a
  // legitimate reserve, so an omitted reserve would silently take the OS's
  // memory to zero. This exact bug shipped into worker-sizing.js's first draft.
  const reserveGB = (opts.reserveGB === undefined || opts.reserveGB === null
    || !Number.isFinite(Number(opts.reserveGB)) || Number(opts.reserveGB) < 0)
    ? DEFAULT_RESERVE_GB
    : Number(opts.reserveGB);

  const usableGB = Math.max(0, freeGB - reserveGB);
  const slots = Math.max(1, Math.floor(usableGB / perJobGB));

  return {
    slots,
    freeGB: +freeGB.toFixed(2),
    perJobGB,
    reserveGB,
    usableGB: +usableGB.toFixed(2),
    basis: 'max(1, floor((free - reserve) / per-job))',
    computed_at: new Date(Number.isFinite(opts.now) ? opts.now : Date.now()).toISOString(),
    // Whether the per-job figure was supplied by a caller who measured its own
    // workload, or is this module's figure from the G16 sampling run. Shipped in
    // the output so a number can never be mistaken for evidence it is not.
    calibrated: Number.isFinite(Number(opts.perJobGB)) && Number(opts.perJobGB) > 0,
  };
}

/** Is a cached capacity block still trustworthy? */
function capacityFresh(capacity, now, ttlMs = CAPACITY_TTL_MS) {
  if (!capacity || !Number.isFinite(Number(capacity.slots))) return false;
  const at = Date.parse(capacity.computed_at || '');
  if (!Number.isFinite(at)) return false;
  return now - at < ttlMs;
}

// ── Read / write ────────────────────────────────────────────────────────────

/**
 * Read the registry. NEVER throws — a corrupt or unreadable registry returns an
 * empty one with `degraded` set, which is what turns a coordinator fault into a
 * warning plus an unmediated run instead of a wedged machine.
 */
function readRegistry(registryPath = REGISTRY_PATH) {
  try {
    if (!fs.existsSync(registryPath)) return { registry: EMPTY(), degraded: null };
    const raw = fs.readFileSync(registryPath, 'utf8');
    if (!raw.trim()) return { registry: EMPTY(), degraded: null };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.holders)) {
      return { registry: EMPTY(), degraded: 'registry has no holders array' };
    }
    return {
      registry: { version: parsed.version || 1, capacity: parsed.capacity || null, holders: parsed.holders },
      degraded: null,
    };
  } catch (err) {
    return { registry: EMPTY(), degraded: `unreadable registry: ${err.message}` };
  }
}

function writeRegistry(registry, registryPath = REGISTRY_PATH) {
  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  // writeFileAtomic, not a hand-rolled tmp+rename: it fsyncs before the rename
  // and retries the Win32 EPERM/EBUSY a rename hits while another process has
  // the target open — both of which the bare pair lacked (atomic-state-writes Part D).
  writeFileAtomic(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
}

/**
 * Read-modify-write under the kit's existing mutex.
 *
 * withFileLock, not a new lock: it already absorbs the Win32 shape WS-455
 * measured, where openSync(path, 'wx') against a held lockfile reports EPERM
 * rather than EEXIST and the loser of a race THREW instead of waiting.
 *
 * Returns { degraded } rather than throwing on lock timeout, for the same
 * fail-open reason as readRegistry.
 */
function mutate(fn, opts = {}) {
  const registryPath = opts.registryPath || REGISTRY_PATH;
  try {
    fs.mkdirSync(path.dirname(registryPath), { recursive: true });
    let out;
    withFileLock(`${registryPath}.lock`, () => {
      const { registry, degraded } = readRegistry(registryPath);
      out = fn(registry, degraded);
      if (out && out.write !== false) writeRegistry(registry, registryPath);
    }, { ownerLabel: 'slot-registry', maxWaitMs: opts.maxWaitMs || 5000 });
    return out;
  } catch (err) {
    return { degraded: `slot registry lock failed: ${err.message}` };
  }
}

// ── Claim / release / heartbeat ─────────────────────────────────────────────

let counter = 0;
function newHolderId() {
  counter += 1;
  return `slot-${Date.now().toString(36)}-${process.pid}-${counter}`;
}

/**
 * Try once to take a slot. Does not wait — waiting is the caller's loop, so that
 * the caller owns what it prints while it waits.
 *
 * `capacityProvider` is only invoked when the cached figure is stale or absent.
 * It costs a ~2 s PowerShell round-trip, which is why the fast path must never
 * reach it: measured on cm-node1 2026-09-11, a headroom snapshot is 1,589 /
 * 1,775 / 2,064 ms, and the accept criterion for a granted claim is two orders
 * of magnitude under that.
 *
 * @returns {{granted:boolean, holder?:object, holders:object[], capacity:object|null,
 *            reclaimed:object[], degraded:string|null, waitingOn?:object}}
 */
function tryClaim(opts = {}) {
  const now = Number.isFinite(opts.now) ? opts.now : Date.now();
  const registryPath = opts.registryPath || REGISTRY_PATH;

  const result = mutate((registry, degraded) => {
    const { live, reclaimed } = partitionHolders(registry.holders, now, opts);
    registry.holders = live;

    // Refresh capacity when the cache is stale, OR when we are about to DENY —
    // spending ~2 s to confirm the machine is genuinely full is cheap against
    // making a caller wait minutes on a stale number.
    //
    // AN EMPTY REGISTRY IS NOT A REFRESH TRIGGER, though an earlier draft of
    // this made it one ("nobody is holding, so it is a free moment to
    // re-measure"). It is the exact opposite: an empty registry is the FIRST
    // claim on an idle machine — the single most common call there is — and
    // putting a 2 s PowerShell round-trip on it would have made the mediator's
    // commonest path its slowest. Caught by property 5c before it shipped. The
    // TTL already bounds how stale the figure can be.
    let capacity = registry.capacity;
    const stale = !capacityFresh(capacity, now, opts.capacityTtlMs);
    const wouldDeny = capacity && live.length >= Number(capacity.slots);
    if (opts.capacityProvider && (stale || wouldDeny)) {
      try {
        capacity = opts.capacityProvider();
        registry.capacity = capacity;
      } catch (err) {
        // A measurement failure is not a reason to block. Keep whatever we had;
        // if we had nothing, the null-capacity branch below fails open.
        degraded = degraded || `capacity measurement failed: ${err.message}`;
      }
    }

    // No capacity figure at all and no way to get one: fail open rather than
    // invent a number. An invented capacity is exactly the unmeasured constant
    // this module's lineage forbids.
    if (!capacity || !Number.isFinite(Number(capacity.slots))) {
      return {
        granted: true, holder: null, holders: live, capacity: null, reclaimed,
        degraded: degraded || 'no capacity figure available',
      };
    }

    if (live.length >= Number(capacity.slots)) {
      // Oldest holder first: it is the one most likely to finish next, and it is
      // the honest answer to "what am I waiting for".
      const waitingOn = [...live].sort(
        (a, b) => Date.parse(a.claimed_at || 0) - Date.parse(b.claimed_at || 0),
      )[0];
      return {
        granted: false, holders: live, capacity, reclaimed, degraded, waitingOn, write: true,
      };
    }

    const holder = {
      id: opts.id || newHolderId(),
      pid: Number.isInteger(opts.pid) ? opts.pid : process.pid,
      repo: opts.repo || null,
      session: opts.session || null,
      job: opts.job || 'unnamed',
      claimed_at: new Date(now).toISOString(),
      heartbeat_at: new Date(now).toISOString(),
    };
    registry.holders = [...live, holder];
    return { granted: true, holder, holders: registry.holders, capacity, reclaimed, degraded };
  }, { registryPath, maxWaitMs: opts.maxWaitMs });

  // mutate() only returns a bare { degraded } when the LOCK itself failed.
  if (!result || typeof result.granted !== 'boolean') {
    return {
      granted: true, holder: null, holders: [], capacity: null, reclaimed: [],
      degraded: (result && result.degraded) || 'slot registry unavailable',
    };
  }
  return result;
}

/** Give the slot back. Idempotent — releasing an id that is gone is a no-op. */
function release(id, opts = {}) {
  if (!id) return { released: false, degraded: null };
  const result = mutate((registry) => {
    const before = registry.holders.length;
    registry.holders = registry.holders.filter((h) => h && h.id !== id);
    return { released: registry.holders.length < before };
  }, { registryPath: opts.registryPath || REGISTRY_PATH, maxWaitMs: opts.maxWaitMs });
  return result && typeof result.released === 'boolean' ? result : { released: false, degraded: result && result.degraded };
}

/** Refresh our own heartbeat so a long legitimate job is not reclaimed under us. */
function heartbeat(id, opts = {}) {
  if (!id) return { beat: false };
  const now = Number.isFinite(opts.now) ? opts.now : Date.now();
  const result = mutate((registry) => {
    const h = registry.holders.find((x) => x && x.id === id);
    if (!h) return { beat: false, write: false };
    h.heartbeat_at = new Date(now).toISOString();
    return { beat: true };
  }, { registryPath: opts.registryPath || REGISTRY_PATH, maxWaitMs: opts.maxWaitMs });
  return result || { beat: false };
}

/** Current live holders, with dead ones reclaimed as a side effect of looking. */
function status(opts = {}) {
  const now = Number.isFinite(opts.now) ? opts.now : Date.now();
  const result = mutate((registry, degraded) => {
    const { live, reclaimed } = partitionHolders(registry.holders, now, opts);
    registry.holders = live;
    return { holders: live, capacity: registry.capacity || null, reclaimed, degraded };
  }, { registryPath: opts.registryPath || REGISTRY_PATH, maxWaitMs: opts.maxWaitMs });
  return result && Array.isArray(result.holders)
    ? result
    : { holders: [], capacity: null, reclaimed: [], degraded: (result && result.degraded) || 'slot registry unavailable' };
}

/** "serveyournote/ses-…1234/test (held 4m12s)" — requirement 6, in one line. */
function describeHolder(holder, now = Date.now()) {
  if (!holder) return 'an unnamed job';
  const started = Date.parse(holder.claimed_at || '');
  const heldMs = Number.isFinite(started) ? Math.max(0, now - started) : null;
  const held = heldMs === null
    ? 'held for an unknown time'
    : `held ${Math.floor(heldMs / 60000)}m${String(Math.floor((heldMs % 60000) / 1000)).padStart(2, '0')}s`;
  const who = [holder.repo || 'unknown-repo', holder.session || `pid ${holder.pid}`, holder.job || 'unnamed'];
  return `${who.join('/')} (${held})`;
}

module.exports = {
  REGISTRY_PATH,
  DEFAULT_PER_JOB_GB,
  DEFAULT_RESERVE_GB,
  CAPACITY_TTL_MS,
  HEARTBEAT_TTL_MS,
  HEARTBEAT_INTERVAL_MS,
  pidAlive,
  deadReason,
  partitionHolders,
  deriveSlots,
  capacityFresh,
  readRegistry,
  writeRegistry,
  tryClaim,
  release,
  heartbeat,
  status,
  describeHolder,
};
