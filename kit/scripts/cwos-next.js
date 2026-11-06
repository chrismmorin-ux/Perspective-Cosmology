#!/usr/bin/env node
/**
 * cwos-next — CLI consolidation of /next (WS-266, ADR-037 Decision #3).
 *
 * Exactly 5 subcommands (Decision #3 / AS-037-4 — non-negotiable):
 *   gate       — Steps 1..1f: active-sprint check, config, activation gate,
 *                sprint blocks, replenish, drift detection. Exits 1 if blocked.
 *   candidates — Steps 2..2d: gather + soft-block + source-class damping.
 *                Returns ranked JSON array.
 *   compose    — Step 3 + Step 4a: anchor select + cluster + cap + classify +
 *                sequence + goal + decisions + anti-goal cross-check. `--human`
 *                emits founder-formatted text + Decision #8 footer.
 *   approve    — Step 5: write SPR-NNN.yaml, claim items, update indexes,
 *                emit `sprint_approved` event with two-field provenance per
 *                ALTERATION-5.
 *   done       — Step 6 closeout: mark items done, resolve linked findings,
 *                recompute program health, run cwos-reconcile.
 *
 * Output convention (mirrors cwos-state-store.js / cwos-event.js):
 *   - JSON to stdout by default; `--human` flag on compose adds formatted text.
 *   - Exit 0 on clean success, 1 on gate-block / validation failure, 2 on
 *     invalid argument. Most error paths exit 0 + stderr (AS-23 discipline).
 *
 * Replay-purity:
 *   - All reads via state-store typed-API; no raw YAML walks of state.
 *   - new Date() / Date.now() ONLY at event-emission boundaries (approve / done).
 *
 * Token-budget gate (Decision #5) gracefully falls back when
 * cwos-token-budget.js (WS-272) is not yet shipped — see runGate().
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let stateStoreMod = null;
try { stateStoreMod = require('./core/state-store'); }
catch { process.exit(0); }

const {
  findWorkstreamDir,
  readYAMLFile,
  writeFileAtomic,
  globFiles,
  todayISO,
  withFileLock,
  upsertYAMLScalarField,
  findRepoRoot,
  blockScalarLines,
} = require('./lib/cwos-utils');
const { loadEventDeps } = require('./lib/cwos-utils');
// WS-533: session identity + item claims. `claimed_by`/`claimed_at` have existed on
// every queue item since adoption and nothing ever wrote them — /next's own docs said
// approve "claims items"; it did not. See lib/cwos-claims.js for the incident.
// WS-564: the conflict list is only meaningful alongside the state that produced
// it — hence registryHealth / listLiveSessions / staleActiveSessions here too.
const {
  resolveSessionId,
  touchSession,
  findClaimConflicts,
  findCheckoutConflicts,
  claimItems,
  releaseItems,
  registryHealth,
  listLiveSessions,
  staleActiveSessions,
  readClaim,
  isSessionLive,
  listFileLocks,
} = require('./lib/cwos-claims');
const { classifySource, classifyMode } = require('./cwos-classify');
// WS-857 (claude-poker-tracker) — THE ranking path. One selector, dependency gate inside it,
// and every surface that shows an ordered list renders its output. A second sort over
// priority_score is a defect; the poker repo's selectSlate.test.js fails the build on one.
// readActiveOverrides / loadProgramCapsByProgram / getRecentSprintAnchors live there now, so
// readContextOverrideClass and the WS-350 test surface read the SAME parser the ranking does.
const {
  selectSlateFromStore, renderSlate,
  emitBlockerRefusals, emitPriorityRefusals,
  readActiveOverrides, loadProgramCapsByProgram, getRecentSprintAnchors,
} = require('./core/select-slate');
const { runClosureSideEffects } = require('./lib/item-closure');
const inspectionGate = require('./lib/inspection-gate');
const maintenanceFindingGate = require('./lib/maintenance-finding-gate');
// Every sprint is a GitHub milestone (founder, 2026-10-31). Fail loud, never fatal.
const githubMilestone = require('./lib/github-milestone');
const { systemPath } = require('./lib/kit-artifacts');
// WS-1170: Needs + Model beside every candidate. The lane's model is read from the
// routing ledger, never defaulted here — an unreachable ledger shows as unknown.
const modelLane = require('./lib/model-lane');
const { resolveHomeBaseRoot } = require('./lib/kit-paths');

const { appendEvent, ensureCommandId } = loadEventDeps();

let computeHealthScore = null;
try { ({ computeHealthScore } = require('./core/health-scoring')); }
catch { /* health-scoring unavailable */ }

let validateStateDrift = null;
let stateCacheMissing = null;
try { ({ validateStateDrift, stateCacheMissing } = require('./cwos-reconcile')); }
catch { /* reconcile unavailable */ }

let computeFrictionDigest = null;
let computeRequestDigest = null;
try { ({ computeDigest: computeFrictionDigest, computeRequestDigest } = require('./lib/friction-digest')); }
catch { /* friction-digest unavailable (older kit) */ }

let computeMaintenanceDigest = null;
try { ({ computeDigest: computeMaintenanceDigest } = require('./lib/maintenance-digest')); }
catch { /* maintenance-digest unavailable (older kit) */ }

// ─── Shared helpers ────────────────────────────────────────────────────────

function writeJson(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

function readFlag(args, name) {
  const i = args.indexOf(`--${name}`);
  if (i === -1 || i === args.length - 1) return null;
  return args[i + 1];
}

function hasFlag(args, name) {
  return args.includes(`--${name}`);
}

// WS-1131: `WS-A,WS-B` → ['WS-A', 'WS-B']. Whitespace-tolerant, empties dropped.
function parseIdList(s) {
  return String(s == null ? '' : s).split(',').map((x) => x.trim()).filter(Boolean);
}

// Set comparison of two id lists: null when equal, else what each side lacks.
// Order is deliberately ignored — the binding is to WHICH items, and the
// sprint's execution order is compose's sequencing, not the founder's yes.
function idSetDiff(expected, found) {
  const e = new Set((expected || []).filter(Boolean));
  const f = new Set((found || []).filter(Boolean));
  const missing = [...e].filter((id) => !f.has(id));
  const unexpected = [...f].filter((id) => !e.has(id));
  if (!missing.length && !unexpected.length) return null;
  return { expected: [...e], found: [...f], missing, unexpected };
}

function loadStore() {
  const store = stateStoreMod.stateStore;
  store.load();
  return store;
}

// WS-576: two different questions that used to have one answer.
//
// `repoRoot()` is WHERE MY CODE IS — the checkout this process is running in.
// In a linked worktree that is the worktree, and it must stay that way: it is
// the cwd for `git rev-parse --short HEAD` (whose answer becomes an item's
// completion_commit), and the base for repo content like system/context.md and
// .cwos-config.yaml, all of which are per-branch.
//
// `stateDir()` is WHERE MY STATE IS — the ONE canonical .claude/workstream/ for
// this repo, shared by every worktree. Deriving repoRoot from it (as this did
// before) silently fused the two, so canonicalizing state resolution would have
// made a worktree record the MAIN tree's HEAD as its completion commit.
function repoRoot() {
  return findRepoRoot(process.cwd());
}

function stateDir() {
  return findWorkstreamDir(process.cwd());
}

// WS-269 (fb-002 / fr-012 / fr-017 / fr-019): the resume-check used to match
// status:'active' only, but nothing in the pipeline ever writes that status —
// approve writes 'approved', done writes 'done'. So an approved-but-unexecuted
// sprint (composed + approved, execution not yet started — e.g. plan-first
// design awaiting founder decisions) was invisible to the resume path, and a
// later /next composed a duplicate sprint over it. On 2026-07-25 that produced
// two sprints independently executing WS-263.
//
// 'active' stays first so any hand-set or future active sprint keeps priority.
function findResumableSprint(sprints, sessionId = null) {
  // ADR-067 owner scoping. Three sprint generations coexist:
  //   - legacy (no `dispatch` field): today's semantics — resumable by any
  //     session, blocks all composition. Every pre-3.24 sprint, including
  //     whatever is open in an adopter at upgrade time (finding 5: without
  //     this, the WS-269 duplicate-sprint incident comes back on day one).
  //   - dispatch: claimed — owner-scoped; only its claimant resumes it.
  //   - dispatch: pooled — deliberately unclaimed; NEVER auto-resumed. Pickup
  //     is an explicit act (gate --pickup), so a fresh session composes new
  //     work by default rather than silently adopting someone's pool.
  const list = (sprints || []).filter(
    (s) => s && s.id && s.status !== 'abandoned' && s.status !== 'done' && s.status !== 'completed'
  );
  const mine = list.filter((s) => {
    if (!('dispatch' in s)) return true;                    // legacy
    if (s.dispatch === 'pooled') return false;              // pickup-only
    return !sessionId || s.claimed_by === sessionId;        // owner-scoped
  });
  const byRecency = (a, b) =>
    String(b.approved_at || b.created_at || '').localeCompare(String(a.approved_at || a.created_at || ''));
  const live = mine.filter((s) => s.status === 'active').sort(byRecency);
  if (live.length) return live[0];
  const approved = mine
    .filter((s) => s.status === 'approved' && !s.completed_at)
    .sort(byRecency);
  return approved.length ? approved[0] : null;
}

// ADR-067: the pickup pool — open sprints deliberately awaiting any session.
// A `dispatch: claimed` sprint whose claimant is no longer live is orphaned
// work and rejoins the pool rather than fencing its items forever.
function findPooledSprints(sprints, wsDir) {
  const out = [];
  for (const s of sprints || []) {
    if (!s || !s.id || !('dispatch' in s)) continue;
    if (s.status !== 'approved' && s.status !== 'active') continue;
    if (s.completed_at) continue;
    if (s.dispatch === 'pooled') { out.push(s); continue; }
    if (s.dispatch === 'claimed' && s.claimed_by && wsDir) {
      // WS-884: a holder with no record is HELD, not orphaned, for the fallback
      // window measured from the lease -- absence of a record is not proof of
      // death (ADR-078 decision 2; the record may simply not have been pulled).
      try { if (!isSessionLive(wsDir, s.claimed_by, undefined, undefined, { claimedAt: s.claimed_at || s.approved_at })) out.push(Object.assign({}, s, { orphaned: true })); }
      catch { /* unknown liveness never pools someone's sprint */ }
    }
  }
  const byRecency = (a, b) =>
    String(b.approved_at || b.created_at || '').localeCompare(String(a.approved_at || a.created_at || ''));
  return out.sort(byRecency);
}

// The pickup order: the whole pool for a bare --pickup, or exactly the one
// sprint --pickup-sprint names (empty when it is not in the pool).
function selectPickupCandidates(pool, wantId) {
  if (!wantId) return pool || [];
  return (pool || []).filter((s) => s && s.id === wantId);
}

// ADR-067: sprint-level lease acquisition. Same three-part shape that makes
// item claims race-safe — per-file lock, write, read-verify — and the caller
// iterates to the next pooled sprint on a lost race instead of dead-ending.
function claimSprintLease(sprintId, sessionId) {
  try {
    const p = path.join(stateDir(), 'sprints', `${sprintId}.yaml`);
    if (!fs.existsSync(p)) return false;
    let ok = false;
    withFileLock(p + '.lock', () => {
      let text = fs.readFileSync(p, 'utf8');
      const dispatch = (text.match(/^dispatch:\s*(\S+)/m) || [])[1];
      if (dispatch !== 'pooled') {
        // dispatch: claimed — adoptable only when the recorded holder is no
        // longer live (the orphan path findPooledSprints already vetted, but
        // the world can change between that read and this lock).
        const holder = ((text.match(/^claimed_by:\s*"?([^"\n]*)"?\s*$/m) || [])[1] || '').trim();
        if (holder && holder !== 'null' && holder !== sessionId) {
          const heldAt = ((text.match(/^(?:claimed_at|approved_at):\s*"?([^"\n]*)"?\s*$/m) || [])[1] || '').trim();
          try { if (isSessionLive(stateDir(), holder, undefined, undefined, { claimedAt: heldAt || undefined })) return; } catch { return; }
        }
      }
      text = text.replace(/^dispatch:\s*.*$/m, 'dispatch: claimed');
      text = text.replace(/^claimed_by:\s*.*$/m, `claimed_by: "${sessionId}"`);
      text = text.replace(/^claimed_at:\s*.*$/m, `claimed_at: "${new Date().toISOString()}"`);
      writeFileAtomic(p, text);
      const back = ((fs.readFileSync(p, 'utf8').match(/^claimed_by:\s*"?([^"\n]*)"?\s*$/m) || [])[1] || '').trim();
      ok = back === sessionId;
    }, { ownerLabel: 'next:pickup', maxWaitMs: 5000 });
    return ok;
  } catch { return false; }
}

// Third resume source: the sprint YAMLs themselves. approve() writes the YAML
// synchronously but state/sprints.json and sprint-index.yaml are only refreshed
// when the T6 reducer / reconcile fires, so a just-approved sprint can be
// absent from both caches. Scanning the dir closes that race window.
function readSprintsFromDir() {
  const out = [];
  try {
    const dir = path.join(stateDir(), 'sprints');
    if (!fs.existsSync(dir)) return out;
    for (const f of fs.readdirSync(dir)) {
      if (!/^SPR-\d{3,4}\.yaml$/.test(f)) continue;
      const r = readYAMLFile(path.join(dir, f));
      if (!r.ok || !r.data) continue;
      const d = r.data;
      const items = Array.isArray(d.items) ? d.items : [];
      out.push({
        id: d.id || f.replace(/\.yaml$/, ''),
        title: d.title || null,
        status: d.status || null,
        approved_at: d.approved_at || null,
        created_at: d.created_at || null,
        completed_at: d.completed_at || null,
        item_count: items.length,
        items_done: items.filter((it) => it && (it.status === 'done' || it.status === 'skipped')).length,
        // WS-568: the item IDs, not just the counts. A sprint's own item
        // statuses drift — items shipped under a LATER sprint stay `pending`
        // here forever — so phantom detection has to ask the queue what
        // actually happened to each id. Deliberately a distinct key: `items`
        // is merged from the state store and other consumers read it.
        item_refs: items
          .filter((it) => it && it.id)
          .map((it) => ({ id: it.id, status: it.status || null })),
      });
      // ADR-067: sprint lease fields, projected ONLY in this dir-scan arm —
      // it is absorbed last in resolveSprintUniverse, so these win the union.
      // Deliberately NOT added to reducers/sprints.js: lease state, not
      // derived state (same replay-purity argument as item claims). Key
      // presence matters — a sprint with no `dispatch` field at all is a
      // pre-ADR-067 legacy sprint and keeps legacy semantics.
      const rec = out[out.length - 1];
      if ('dispatch' in d) rec.dispatch = d.dispatch || null;
      if ('claimed_by' in d) rec.claimed_by = d.claimed_by || null;
      if ('claimed_at' in d) rec.claimed_at = d.claimed_at || null;
    }
  } catch { /* non-fatal — the cache sources still apply */ }
  return out;
}

// Unions the three sources by sprint id — later sources overwrite earlier ones,
// so the freshest record for each id wins (dir scan > sprint-index > state
// store). Union rather than first-hit: a stale cache can hold an old approved
// sprint that a fresher source shows as closed, and picking the most recent
// resumable sprint requires seeing all of them at once.
function resolveSprintUniverse(store) {
  const merged = new Map();
  const absorb = (list) => {
    for (const s of list || []) {
      if (s && s.id) merged.set(s.id, Object.assign({}, merged.get(s.id), s));
    }
  };

  absorb((store && store.sprints && store.sprints.all && store.sprints.all()) || []);

  const idxPath = path.join(stateDir(), 'sprint-index.yaml');
  if (fs.existsSync(idxPath)) {
    const r = readYAMLFile(idxPath);
    if (r.ok && r.data && Array.isArray(r.data.sprints)) absorb(r.data.sprints);
  }

  absorb(readSprintsFromDir());

  return Array.from(merged.values());
}

function resolveResumableSprint(store, sessionId = null) {
  return findResumableSprint(resolveSprintUniverse(store), sessionId);
}

// ─── candidate eligibility (ADR-067) ───────────────────────────────────────
//
// ONE exclusion predicate for BOTH scoring paths (runCandidates and
// candidatesInline are documented drift twins). An item is ineligible when
// (a) any open sprint references it — this protects a pooled sprint's
// deliberately-unclaimed items between approve and pickup, deterministically,
// via the item_refs that readSprintsFromDir already projects; or (b) another
// live session holds its lease (read from queue YAMLs; lease state never
// reaches the reducer store, preserving replay purity).
function buildEligibilityFilter(store) {
  const excluded = { in_open_sprint: 0, claimed_by_live_peer: 0 };
  // WS-993: the counts say HOW MANY were dropped; this says WHICH and WHY, one
  // row per item, so a missing candidate is explainable from the output alone.
  const dropped = [];
  const droppedIds = new Set();
  const noteDrop = (id, reason, extra) => {
    if (droppedIds.has(id)) return;
    droppedIds.add(id);
    dropped.push(Object.assign({ id, reason }, extra));
  };
  // id -> the open sprint naming it, so a refusal can say WHICH sprint.
  const sprintRefIds = new Map();
  try {
    for (const s of resolveSprintUniverse(store)) {
      if (!s || !s.status) continue;
      if (s.status === 'abandoned' || s.status === 'done' || s.status === 'completed' || s.completed_at) continue;
      for (const ref of (s.item_refs || [])) if (ref && ref.id && !sprintRefIds.has(ref.id)) sprintRefIds.set(ref.id, s.id);
    }
  } catch { /* conservative: an unreadable sprint universe excludes nothing */ }

  let wsDir = null;
  let mySession = null;
  try {
    wsDir = findWorkstreamDir(process.cwd());
    mySession = resolveSessionId(wsDir, { create: false });
  } catch { /* claim checks degrade to allow — same posture as today's compose */ }

  // WS-1131: the predicate, with its reason. `eligible` counts; `why` only
  // explains, so compose --items can name what refused an id without skewing
  // the exclusion counters the render reports.
  const why = (itemId) => {
    if (sprintRefIds.has(itemId)) return { reason: 'in_open_sprint', sprint_id: sprintRefIds.get(itemId) };
    if (wsDir) {
      try {
        const claim = readClaim(path.join(wsDir, 'queue', `${itemId}.yaml`));
        if (claim && claim.claimedBy && claim.claimedBy !== mySession
            && claim.status !== 'done'
            && isSessionLive(wsDir, claim.claimedBy)) {
          return { reason: 'claimed_by_live_peer', claimed_by: claim.claimedBy };
        }
      } catch { /* unreadable claim = no exclusion */ }
    }
    return null;
  };
  const eligible = (itemId) => {
    const w = why(itemId);
    if (w) {
      excluded[w.reason]++;
      noteDrop(itemId, w.reason, w.reason === 'in_open_sprint' ? { sprint: w.sprint_id } : { claimed_by: w.claimed_by });
      return false;
    }
    return true;
  };
  return { eligible, why, excluded, dropped };
}

/**
 * WS-993: the checkout-occupancy verdict (hazard | unknown | clear) for
 * candidates and compose, from the same findCheckoutConflicts the gate reads,
 * without invoking the gate. null when it cannot be computed at all, which a
 * caller must not read as clear.
 */
function checkoutBlock() {
  try {
    const wsDir = findWorkstreamDir(process.cwd());
    const co = findCheckoutConflicts(wsDir, resolveSessionId(wsDir, { create: false }));
    return {
      verdict: co.verdict,
      cohabitants: co.cohabitants.map((p) => p.id),
      unknown_reasons: co.unknown_reasons,
      at_stake_count: co.at_stake_count,
    };
  } catch { return null; }
}

// ─── phantom sprints (WS-568) ──────────────────────────────────────────────
//
// A *phantom* is a sprint that still looks resumable — `approved`/`active`,
// no completed_at — but has no work left in it: every item it names is already
// closed in the queue, usually because it shipped under a later sprint. Closing
// one emits zero `item_closed` events; it is pure bookkeeping.
//
// The defect this fixes is throughput, not detection. `findResumableSprint`
// returns exactly ONE sprint and gate exits on it, so clearing N phantoms cost
// N round trips of gate → done → gate, each revealing only the next one down
// (ServeYourNote 2026-08-02: SPR-028 → SPR-026 → SPR-019 → clean). The gate
// already loads every sprint record and the queue; the whole set is knowable in
// one pass.
//
// Why the queue and not the sprint's own item statuses: in that same incident
// gate reported SPR-026 as "2/3 done" and SPR-019 as "0/1 done" while EVERY
// item of both was `status: done` in the queue. A sprint YAML records what its
// own execution wrote; an item shipped under a different sprint never comes
// back to update it. Counting the sprint's own checkboxes would have found one
// of the three.
const CLOSED_ITEM_STATUSES = new Set(['done', 'skipped', 'dismissed']);

// `deferred` is deliberately NOT closed: a deferred item returns to the queue,
// so a sprint holding one still has real work pending. Same conservatism as
// `paused` sprints, which are legitimately parked rather than stale.
function itemIsClosed(status) {
  return status != null && CLOSED_ITEM_STATUSES.has(String(status));
}

/**
 * Authoritative status for one queue item id.
 *
 * The queue YAML wins over state/queue.json for the same reason findClaimConflicts
 * scans the directory: the cache lags item mutation, and a false "closed" here
 * would declare a live sprint phantom. Unknown ids resolve to null, which the
 * caller treats as OPEN — a sprint is never called phantom on missing evidence.
 */
function makeItemStatusLookup(store) {
  const cache = new Map();
  let queueDir = null;
  try { queueDir = path.join(stateDir(), 'queue'); } catch { /* non-fatal */ }
  return (id) => {
    if (!id) return null;
    if (cache.has(id)) return cache.get(id);
    let status = null;
    try {
      const p = queueDir && path.join(queueDir, `${id}.yaml`);
      if (p && fs.existsSync(p)) {
        const r = readYAMLFile(p);
        if (r.ok && r.data && r.data.status) status = String(r.data.status);
      }
    } catch { /* fall through to the store */ }
    if (status == null) {
      try {
        const q = store && store.queue && store.queue.byId && store.queue.byId(id);
        if (q && q.status) status = String(q.status);
      } catch { /* unknown */ }
    }
    cache.set(id, status);
    return status;
  };
}

/**
 * Every phantom in the universe, newest first. Detection only — nothing is
 * mutated and no event is emitted, so re-running is free and idempotent.
 */
function findPhantomSprints(sprints, lookupItemStatus) {
  const out = [];
  for (const s of sprints || []) {
    if (!s || !s.id) continue;
    // Only sprints the resume path would pick up. `paused` is parked on
    // purpose, and done/completed/abandoned are already closed.
    if (s.status !== 'approved' && s.status !== 'active') continue;
    if (s.completed_at) continue;

    const refs = Array.isArray(s.item_refs)
      ? s.item_refs
      : (Array.isArray(s.items) ? s.items.filter((it) => it && it.id).map((it) => ({ id: it.id, status: it.status || null })) : []);

    let itemCount;
    let closedIds;
    let openIds;
    let evidence;
    if (refs.length) {
      evidence = 'queue';
      itemCount = refs.length;
      closedIds = [];
      openIds = [];
      for (const r of refs) {
        if (itemIsClosed(r.status) || itemIsClosed(lookupItemStatus(r.id))) closedIds.push(r.id);
        else openIds.push(r.id);
      }
    } else {
      // Index-only record (sprint-index.yaml / state cache carry counts, not
      // ids). Fall back to the counts; better a coarse answer than none.
      evidence = 'counts';
      itemCount = typeof s.item_count === 'number' ? s.item_count : 0;
      const done = typeof s.items_done === 'number' ? s.items_done : 0;
      if (!itemCount || done < itemCount) continue;
      closedIds = [];
      openIds = [];
    }

    // An itemless sprint is a composition artefact, not a phantom by this
    // rule — leave it to the founder rather than inventing a closure.
    if (!itemCount) continue;
    if (openIds.length) continue;

    const approvedAt = s.approved_at || null;
    const ageDays = (approvedAt && Number.isFinite(Date.parse(approvedAt)))
      ? Math.floor((Date.now() - Date.parse(approvedAt)) / 86400000)
      : null;
    out.push({
      id: s.id,
      title: s.title || null,
      status: s.status,
      item_count: itemCount,
      items_closed: evidence === 'queue' ? closedIds.length : itemCount,
      closed_item_ids: closedIds,
      approved_at: approvedAt,
      age_days: ageDays,
      evidence,
      reason: 'all_items_closed',
    });
  }
  return out.sort((a, b) => String(b.approved_at || '').localeCompare(String(a.approved_at || '')));
}

/**
 * Read every *active* override block from system/context.md.
 *
 * Active = under "## Active overrides", not "## Archived overrides".
 *
 * WS-695: this used to return only the FIRST override class, which made the
 * file single-slot by accident — a second concurrent override was parsed away
 * silently, and the founder had no way to know their new block was shadowed by
 * an older one still sitting above it. More than one phase can legitimately be
 * in force at once (a fleet phase and a customer phase are orthogonal), so the
 * reader now returns all of them in document order.
 *
 * An override MAY carry a machine-readable boost spec in a fenced ```yaml block
 * inside its section. Without one it is prose, exactly as before — which was
 * the whole defect: `override_class` was stamped onto sprints and never scored,
 * so every override ever written was a comment. The spec shape is deliberately
 * tiny and general, so the next override needs no new code:
 *
 *     ```yaml
 *     boost:
 *       match:
 *         customer_impact: ServeYourNote
 *       factor: 2.0
 *     ```
 *
 * `match` is field → value. A queue item matches when that field equals the
 * value, or (when the field holds a list) contains it. `factor` multiplies the
 * candidate's adjusted score.
 *
 * Returns [{ class, boost: {match, factor} | null }]. Never throws.
 */
function readContextOverrideClass() {
  // Back-compat single-slot accessor: the sprint stamp and the
  // internal-investment-phase rotation branch both want one class. First
  // active block wins, which is the pre-WS-695 behaviour verbatim.
  // select-slate reports an Active section with no parseable block as the pseudo-class
  // `section-present-zero-blocks` so its warning is audible. That is a diagnostic, not a
  // class: master's reader returned null here, and stamping it onto a sprint would record
  // an override that does not exist (WS-1673).
  const all = readActiveOverrides().filter((o) => o.class !== 'section-present-zero-blocks');
  return all.length ? all[0].class : null;
}

/**
 * Coerce a config value to a number, tolerating an inline YAML comment riding
 * along on the scalar (WS-569).
 *
 * WS-497 taught the shared YAML reader to strip ` # comment` tails, so on a
 * current kit `max_items: 5   # Max items per sprint` already parses as 5. This
 * guard stays anyway, for two reasons that are not belt-and-braces:
 *
 *   1. **Adopted repos run older parsers.** Every adopted repo is on kit
 *      3.7.1-3.8.5 with its own copy of cwos-utils. A consumer-side coercion
 *      fixes the cap for them without waiting on a kit upgrade.
 *   2. **The failure is silent and total.** `8 >= "5 # ..."` is false, not an
 *      error — the cap simply never fires, and the sprint that results looks
 *      deliberate. This defect was found independently by region-desk
 *      (2026-05-13), ServeYourNote (2026-07-25) and HomeBase (2026-08-02): 83
 *      days, three discoveries, because nothing about it is loud.
 *
 * Returns `fallback` for anything that is not a finite number, INCLUDING a
 * string that parses to NaN. Note `0` is honoured rather than falling through:
 * the previous `||` treated a legitimate zero cap as "unset".
 */
function configNumber(v, fallback) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const head = v.split('#')[0].trim();
    const n = Number(head);
    if (head !== '' && Number.isFinite(n)) return n;
  }
  return fallback;
}

function loadConfig() {
  // Standard defaults if `.cwos-config.yaml` is absent. Per next.md Step 1b.
  const defaults = { ceremony: 'standard', sprints: { max_items: 5, max_effort_sessions: 2 } };
  try {
    const p = path.join(repoRoot(), '.cwos-config.yaml');
    if (!fs.existsSync(p)) return defaults;
    const r = readYAMLFile(p);
    if (!r.ok || !r.data) return defaults;
    const c = r.data;
    const s = c.sprints || {};
    return {
      // ceremony can carry a comment tail on an older parser too.
      ceremony: (typeof c.ceremony === 'string' ? c.ceremony.split('#')[0].trim() : c.ceremony) || defaults.ceremony,
      sprints: {
        max_items: configNumber(s.max_items, defaults.sprints.max_items),
        max_effort_sessions: configNumber(s.max_effort_sessions, defaults.sprints.max_effort_sessions),
      },
    };
  } catch { return defaults; }
}

function ceremonyDefaults(cer) {
  switch (cer) {
    case 'minimal':   return { max_items: 3, max_effort_sessions: 1 };
    case 'strategic': return { max_items: 8, max_effort_sessions: 4 };
    case 'standard':
    default:          return { max_items: 5, max_effort_sessions: 2 };
  }
}

// The cost coordinate. S=0.5, M=1.5, L=3 per next.md Step 3c; XL added here.
//
// WS-857: the previous form was `if S..if M..if L; return 1`, so BOTH `XL` and an
// unset effort fell through to 1 — cheaper than M's 1.5. Measured on the live queue
// at the time: 11 XL items priced BELOW 167 M items, and 8 unsized items priced as
// the cheapest thing in the backlog. A cost ladder that is not monotone in cost is
// not a cost ladder.
//
// An UNSIZED item is deliberately conservative rather than cheap. `provenance-or-refuse`
// forbids an unestimated value presenting as a measurement, and the cheap default is the
// worse direction of the two: it silently promotes unsized work into batches, where the
// conservative default merely keeps it a solo anchor and therefore visible. The real fix
// is to size those items; this makes their absence surface instead of paying a bonus.
const EFFORT_SESSIONS = { S: 0.5, M: 1.5, L: 3, XL: 5 };
const UNSIZED_EFFORT_SESSIONS = EFFORT_SESSIONS.XL;

function effortSessions(effort) {
  const known = EFFORT_SESSIONS[String(effort)];
  return known === undefined ? UNSIZED_EFFORT_SESSIONS : known;
}

/**
 * Step 3b/c — choose the anchor's companions under the item and effort caps.
 *
 * Extracted from runCompose so it can be tested at all. `kit/scripts/` had zero
 * automated coverage, and WS-493 / WS-676 record the same field being silently
 * un-wired TWICE — the second time by a HomeBase kit upgrade shipping a vendored
 * reducer that did not carry this repo's local fix. An untested fix in vendored
 * code is a fix with an expiry date.
 *
 * Returns both the selected items and the effort actually spent; the caller
 * reports `usedSessions` in the sprint record and in capOvershoot.
 */
function selectCompanions(anchor, candidates, cap) {
  const items = [anchor];
  let usedSessions = effortSessions(anchor.effort);
  for (const c of candidates.slice(1)) {
    // Item cap is a genuine terminator: nothing later can fit either.
    if (items.length >= cap.max_items) break;
    // Program filter runs FIRST. Ordering matters: the budget test below must only
    // ever be asked about a candidate that is actually eligible, or an ineligible
    // one can end the loop on behalf of items that were never in contention.
    if (!anchor.program || c.program !== anchor.program) continue;
    // WS-857: this was `break`, not `continue`. Effort is NOT monotone down the
    // candidate list, so one oversized candidate terminated companion selection
    // entirely — including smaller items further down that fit the remaining budget.
    // Measured at the time: with max_effort_sessions=2, an L anchor already spends 3,
    // so all 84 L-effort backlog items could only ever compose as solo anchors, and
    // any sprint whose second candidate was large silently became a sprint of one.
    if (usedSessions + effortSessions(c.effort) > cap.max_effort_sessions) continue;
    items.push(c);
    usedSessions += effortSessions(c.effort);
  }
  return { items, usedSessions };
}

// ─── 1. gate ───────────────────────────────────────────────────────────────

function runGate(args) {
  const json = !hasFlag(args, 'human');
  // WS-272: validate --override-token-budget rationale BEFORE any other
  // checks so malformed input fails fast regardless of active-sprint or
  // other short-circuit paths. Empty/missing flag is fine; it just means
  // the override isn't being used.
  const overridePreCheck = readFlag(args, 'override-token-budget');
  if (overridePreCheck != null && overridePreCheck.length < 20) {
    process.stderr.write(`gate: --override-token-budget rationale must be ≥ 20 characters; got ${overridePreCheck.length}\n`);
    process.exit(2);
  }

  // WS-271: validate --override-read-restraint rationale at the same
  // pre-check boundary; mirrors the WS-272 friction-by-design pattern.
  const readRestraintPreCheck = readFlag(args, 'override-read-restraint');
  if (readRestraintPreCheck != null && readRestraintPreCheck.length < 20) {
    process.stderr.write(`gate: --override-read-restraint rationale must be ≥ 20 characters; got ${readRestraintPreCheck.length}\n`);
    process.exit(2);
  }

  // WS-694: same pre-check boundary for --override-cross-branch-drift, so a
  // malformed rationale fails before any git or event-log work happens.
  const xBranchPreCheck = readFlag(args, 'override-cross-branch-drift');
  if (xBranchPreCheck != null && xBranchPreCheck.length < 20) {
    process.stderr.write(`gate: --override-cross-branch-drift rationale must be ≥ 20 characters; got ${xBranchPreCheck.length}\n`);
    process.exit(2);
  }

  // WS-736 / ADR-067: --override-checkout-shared "<rationale ≥20 chars>". The
  // checkout-hazard block was the one gate block with no override and no
  // recovery path — a dead end the founder could only hand-edit past. Same
  // friction-by-design shape as its siblings; audited via a
  // checkout_shared_acknowledged event where the block would have fired.
  const checkoutSharedOverride = readFlag(args, 'override-checkout-shared');
  if (checkoutSharedOverride != null && checkoutSharedOverride.length < 20) {
    process.stderr.write(`gate: --override-checkout-shared rationale must be ≥ 20 characters; got ${checkoutSharedOverride.length}\n`);
    process.exit(2);
  }

  // WS-411 (this commit): --override-stale-protocol "<program>:<protocol>:<rationale ≥30 chars>"
  // gives the founder an explicit acknowledgment escape hatch for stale-protocol
  // blocks. Symmetric with --override-token-budget. Records a
  // stale_protocol_acknowledged event so the override is auditable. Per-invocation
  // only — the next /next checks fresh staleness. Multiple overrides can be passed
  // by repeating the flag.
  const staleOverrides = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--override-stale-protocol' || args[i].startsWith('--override-stale-protocol=')) {
      let val;
      if (args[i] === '--override-stale-protocol') {
        val = args[i + 1]; i++;
      } else {
        val = args[i].slice('--override-stale-protocol='.length);
      }
      if (val == null) {
        process.stderr.write(`gate: --override-stale-protocol requires a value of the form "<program>:<protocol>:<rationale ≥30 chars>"\n`);
        process.exit(2);
      }
      const m = val.match(/^([^:]+):([^:]+):(.+)$/s);
      if (!m) {
        process.stderr.write(`gate: --override-stale-protocol must be "<program>:<protocol>:<rationale>"; got ${JSON.stringify(val)}\n`);
        process.exit(2);
      }
      const [, prog, proto, rationale] = m;
      if (rationale.length < 30) {
        process.stderr.write(`gate: --override-stale-protocol rationale must be ≥ 30 characters; got ${rationale.length}\n`);
        process.exit(2);
      }
      staleOverrides.push({ program: prog.trim(), protocol: proto.trim(), rationale: rationale.trim() });
    }
  }
  // If valid, emit the acknowledgment event up front so any downstream
  // INV scan sees it. Non-fatal on emission failure (AS-23).
  if (readRestraintPreCheck != null && appendEvent && ensureCommandId) {
    try {
      const commandId = ensureCommandId('read-restraint-ack');
      appendEvent({
        source_track: 'T0:envelope',
        source_tier: 'founder-prompt',
        track_tag: 'read_restraint_acknowledged',
        command_id: commandId,
        payload: {
          type: 'read_restraint_acknowledged',
          rationale: readRestraintPreCheck,
          ack_at: new Date().toISOString(),
          authorized_by: 'founder',
          composed_by: 'cli-deterministic',
        },
      });
    } catch (e) {
      process.stderr.write(`gate: read-restraint-ack event emission failed (non-fatal): ${e.message}\n`);
    }
  }

  // ADR-058 self-heal: state/*.json is an untracked per-node cache. On a
  // fresh clone (or headless `claude -p` / /fleet-run path where the
  // SessionStart --refresh-state hook never fired), the cache is absent —
  // rebuild it via a full reconcile before gating so the candidate pool
  // isn't silently empty. Non-fatal: gate proceeds either way (candidates
  // fall back to queue-index.yaml when state lags).
  let stateRefreshed = false;
  try {
    const wsDirForHeal = findWorkstreamDir(process.cwd());
    if (stateCacheMissing && stateCacheMissing(wsDirForHeal)) {
      const heal = spawnSync(process.execPath, [path.join(__dirname, 'cwos-reconcile.js'), '--quiet'], {
        stdio: 'ignore', timeout: 60000,
      });
      stateRefreshed = heal.status === 0;
      process.stderr.write(`gate: state cache was missing — reconcile rebuild ${stateRefreshed ? 'succeeded' : 'failed (continuing on index fallbacks)'} (ADR-058)\n`);
    }
  } catch { /* non-fatal (AS-23) */ }

  const store = loadStore();
  const result = {
    active_sprint: null,
    // WS-568: EVERY sprint that still looks resumable but has no work left in
    // it, in one pass. `active_sprint` keeps its meaning — the single sprint to
    // resume — and carries `phantom: true` when it is itself one of these.
    // Detection only: nothing here is closed automatically, so the list is
    // stable across re-runs and emits no events.
    phantom_sprints: [],
    config: null,
    activation_gate: { ok: true, reason: null, installed_count: 0, active_count: 0 },
    sprint_blocks: [],
    drift_detected: false,
    drift_items: [],
    replenishment: { needed: [], note: null },
    token_budget: { available: false, exit: null, measured: null, note: null },
    // WS-564: `claim_conflicts` NEVER travels alone. It is computed by filtering
    // on liveness, so an empty list means one of two opposite things — "N peers
    // are live and hold other items" or "liveness is UNKNOWN and this check just
    // failed open". The conditioning set travels with the answer.
    session: {
      id: null,
      claim_conflicts: [],
      conflicts_conditioning: 'unknown',
      live_sessions: [],
      stale_active: [],
      registry: { ok: false, reason: 'not evaluated' },
      checkout: null,
    },
    blocked: false,
    state_refreshed: stateRefreshed,
    // WS-579: advisory, NEVER blocking (founder decision, synthesis §6.2).
    // Null everywhere except the hub — fleet/friction/ only exists there.
    friction_digest: null,
    // WS-699: the courier's return leg — which peer repos are waiting on an
    // answer, and for how long. Same contract: advisory, never blocking,
    // null off-hub (fleet/requests/ only exists at the hub).
    request_digest: null,
    // ADR-066: same contract — advisory, never blocking, null off-hub.
    maintenance_digest: null,
    // WS-987: the daily kit test sweep (.test-sweep.json). Same contract —
    // advisory, never blocking, null wherever cwos-test-sweep.js does not ship.
    test_sweep_digest: null,
    // WS-880: the courier's FORWARD leg, and the mirror of the three above —
    // null in the hub, speaks only in an adopted repo, because what it reports
    // is work addressed TO here. Advisory; it reports and never drains.
    inbox_digest: null,
  };

  // Step 0b: session identity + claim conflicts (WS-533).
  //
  // Runs BEFORE the resumable-sprint check below, which exits early — if another
  // session is already working the sprint we are about to resume, that is precisely
  // when the founder needs to know, so the check must not sit behind that return.
  //
  // Identity comes from CLAUDE_CODE_SESSION_ID where available, NOT from
  // `.current-session`: the pointer holds one id, so with two live sessions it names
  // whichever registered last and every claim we wrote would be attributed to the
  // other session. See resolveSessionId.
  //
  // A conflict counts only when the other session is still ALIVE. A crashed session
  // must never fence off the queue permanently — on a machine that loses power
  // routinely that would be a weekly occurrence — so a claim whose owner stopped
  // heartbeating is silently reclaimable rather than blocking.
  try {
    const wsDirForClaims = findWorkstreamDir(process.cwd());
    const mySession = resolveSessionId(wsDirForClaims);
    result.session.id = mySession;
    touchSession(wsDirForClaims, mySession);
    // Scans the queue DIRECTORY, not state/queue.json — that cache lags item
    // creation, and a safety check that degrades to "no conflicts" on stale input is
    // worse than no check.
    result.session.claim_conflicts = findClaimConflicts(wsDirForClaims, mySession, null);

    // WS-564: the conditioning set. On 2026-08-02 this gate reported
    // `claim_conflicts: []` to a session about to implement WS-312 while three
    // sessions were concurrently editing the repo — the list was empty because
    // the heartbeat hook had been dead for two days and every peer filtered out
    // as not-live. That session's own claim then became reclaimable 90 minutes
    // in, WHILE it was implementing the item. An empty list is only an all-clear
    // when the registry that produced it can be believed.
    result.session.registry = registryHealth(wsDirForClaims);
    result.session.live_sessions = listLiveSessions(wsDirForClaims, mySession)
      .map((s) => ({ id: s.id, host: s.host, foreign_host: s.foreign_host, claimed_items: s.claimed_items }));
    result.session.stale_active = staleActiveSessions(wsDirForClaims, { selfId: mySession })
      .map((s) => ({
        id: s.id, minutes_stale: s.minutes_stale, claimed_items: s.claimed_items,
        recovery_would_act: s.recovery_would_act, recovery_reason: s.recovery_reason,
        recovery_clears_in_hours: s.recovery_clears_in_hours,
      }));
    result.session.conflicts_conditioning = result.session.registry.ok ? 'known' : 'unknown';
    // WS-565: claims answer "has anyone SAID they are on this item". They cannot
    // answer "is anyone standing in this tree with uncommitted work", and on
    // 2026-08-26 that gap handed this checkout to a second session as though it
    // were idle while a peer held 1,434 lines of uncommitted payments code under
    // no claim at all. git status cannot be forgotten the way a declaration can.
    result.session.checkout = findCheckoutConflicts(wsDirForClaims, mySession);

  } catch (e) {
    // Claim bookkeeping must never take the gate down: worst case we degrade to the
    // pre-WS-533 behaviour, which is what shipped for months.
    result.session.error = e.message;
  }

  // Step 0c: friction digest (WS-579). Deliberately BEFORE the resumable-sprint
  // early exit below — the digest's freshness line must appear on EVERY gate
  // invocation, including a resume, or a dead drainer hides behind whichever
  // sprint happens to be open. Read-only, advisory, never touches `blocked`.
  if (computeFrictionDigest) {
    try { result.friction_digest = computeFrictionDigest(); }
    catch { /* advisory — a broken inbox must not take the gate down */ }
  }

  // Step 0c-bis: request digest (WS-699) — the courier's return leg. Same
  // placement and same rationale as 0c: a peer repo waiting on an answer must
  // be visible on every invocation, including a resume. The 101-day silence
  // happened because nothing rendered the fact that anyone was waiting.
  if (computeRequestDigest) {
    try { result.request_digest = computeRequestDigest(); }
    catch { /* advisory — a broken request inbox must not take the gate down */ }
  }

  // Step 0d: maintenance digest (ADR-066). Same placement rationale as 0c —
  // freshness must render on every invocation, including a resume; a sweep
  // whose age reads UNKNOWN is the loud state the digest exists to surface.
  if (computeMaintenanceDigest) {
    try { result.maintenance_digest = computeMaintenanceDigest(); }
    catch { /* advisory — broken maintenance state must not take the gate down */ }
  }

  // Step 0d-bis: test sweep digest (WS-987). The daily kit test sweep was
  // dead for 10 days and its only reader was INV-089, which fires when someone
  // runs /verify. A RED suite or a dead runner now renders on every gate
  // invocation, including a resume, like the four fleet lanes above.
  try {
    const { computeWatermarkDigest } = require('./lib/test-sweep-record');
    result.test_sweep_digest = computeWatermarkDigest();
  } catch { /* advisory — a broken watermark must not take the gate down */ }

  // Step 0e: divergence digest (WS-814). An adopted repo has changed a
  // kit-owned file by enough that the magnitude bounds call it authored work,
  // and the hub would otherwise learn of it only from an upgrade refusal that
  // nobody ran. Advisory, and deliberately never a block — a diverged repo is a
  // standing condition, not a reason to stop composing a sprint.
  try {
    const { computeDigest } = require('./lib/divergence-digest');
    result.divergence_digest = computeDigest();
  } catch { /* advisory */ }

  // Step 0f: inbox digest (WS-880). The forward leg of the courier, and the
  // one digest that speaks in an ADOPTED repo rather than the hub. Same
  // placement rationale as 0c — it must render on every invocation including a
  // resume, because an envelope waiting behind whichever sprint happens to be
  // open is precisely how six of them reached 29 days unseen.
  //
  // It reports; it does not drain. cwos-inbox-drain names "can be not-run" as
  // part of why the DEC-054 boundary is structural, and draining from here
  // would quietly delete that property (founder decision 2026-09-21).
  try {
    const { computeInboxDigest } = require('./lib/inbox-digest');
    result.inbox_digest = computeInboxDigest();
  } catch { /* advisory — an unreachable hub must not take the gate down */ }

  // WS-565: a live peer in THIS checkout with uncommitted work is a hard stop, for
  // the same reason a live foreign claim is: the failure is silent, and it only
  // becomes visible after one session has committed another's work.
  if (result.session.checkout && result.session.checkout.verdict === 'hazard') {
    const co = result.session.checkout;
    // WS-1226: when every cohabitant is this terminal's own conversation from before /clear,
    // say that and when it lifts, rather than calling it a peer.
    const priors = co.cohabitants.filter((p) => p && p.same_process_prior && p.lifts_at);
    const priorHint = priors.length && priors.length === co.cohabitants.length
      ? `${priors.map((p) => p.id).join(', ')} ${priors.length === 1 ? 'is' : 'are'} this terminal's own conversation from before /clear `
        + `(same process, silent since this one began). The block lifts by itself at ${priors.map((p) => p.lifts_at).sort().pop()} `
        + '(10 minutes after its last heartbeat), and `node kit/scripts/cwos-session-recovery.js --close <id>` then closes it. '
        + 'Until then, or if you are not sure: '
      : '';
    const cohabitantHint = priorHint +
      `${co.cohabitants.map((p) => p.id).join(', ')} ${co.cohabitants.length === 1 ? 'is' : 'are'} live in this same checkout `
        + `(${co.worktree}), which has ${co.dirty_count} uncommitted path(s). Do NOT assume uncommitted work here is abandoned — `
        + 'it is very likely theirs. Take a worktree NOW and continue — '
        // WS-728/WS-723: this hint used to name scripts/session-tree.sh, which
        // does not exist — the friction sweep caught it twice before WS-736 did.
        // 2026-09-01 (melody-hill friction): the hint used to read as a founder
        // question; sessions stopped to ask. Taking the worktree is the
        // session's own decision — the hint now says so.
        + '`node kit/scripts/cwos-git.js worktree create <topic>`, then re-run this gate from inside the new tree. '
        + 'That decision is the session\'s to make; do not stop to ask the founder.';
    if (checkoutSharedOverride != null) {
      // WS-736: founder-acknowledged. Advisory instead of a block, audited.
      result.sprint_blocks.push({
        reason: 'checkout-shared-acknowledged',
        advisory: true,
        item: null,
        hint: cohabitantHint,
      });
      if (appendEvent && ensureCommandId) {
        try {
          appendEvent({
            source_track: 'T6:workstream-rebalance',
            source_tier: 'founder-prompt',
            track_tag: '/next',
            command_id: ensureCommandId('gate-checkout-override'),
            payload: {
              type: 'checkout_shared_acknowledged',
              rationale: checkoutSharedOverride,
              cohabitants: co.cohabitants.map((p) => p.id),
              worktree: co.worktree || null,
              dirty_count: co.dirty_count == null ? null : co.dirty_count,
            },
          });
        } catch (e) {
          process.stderr.write(`gate: override event emission failed (non-fatal): ${e.message}\n`);
        }
      }
    } else {
      result.blocked = true;
      result.sprint_blocks.push({
        reason: 'checkout-shared-with-live-session',
        item: null,
        hint: cohabitantHint + ' Founder escape valve: --override-checkout-shared "<rationale ≥20 chars>".',
      });
    }
  } else if (result.session.checkout && result.session.checkout.verdict === 'unknown') {
    // Advisory, never a block. At rollout NO session record carries `worktree`, so
    // blocking on unknown would refuse every session on day one — and a control
    // that refuses everyone is the one people learn to bypass rather than fix
    // (`session-lanes.md`: "how a control earns a reputation for crying wolf").
    // Records self-heal on their next heartbeat, so this state is transient.
    result.sprint_blocks.push({
      reason: 'checkout-occupancy-unknown',
      // Load-bearing: without this the blanket rule below makes this a block.
      advisory: true,
      item: null,
      hint: `Cannot rule out another live session in this checkout: ${result.session.checkout.unknown_reasons.join('; ')}. `
          + `${result.session.checkout.dirty_count === null ? 'Dirty paths could not be read' : `${result.session.checkout.dirty_count} uncommitted path(s) present`}. `
          + 'Treat uncommitted work here as possibly another session\'s until you have asked.',
    });
  }

  // Step 1: resumable sprint? (WS-269)
  // Matches status:active OR status:approved with completed_at:null, across
  // three sources of decreasing staleness — see resolveResumableSprint.
  const sprintUniverse = resolveSprintUniverse(store);

  // Step 1a: phantom sweep (WS-568). Runs BEFORE the resume early-exit — the
  // exit is exactly what used to hide phantoms two-deep, one per invocation.
  try {
    result.phantom_sprints = findPhantomSprints(sprintUniverse, makeItemStatusLookup(store));
  } catch (e) {
    // A broken queue read must not take the gate down (AS-23). An empty list
    // then means "not evaluated", which is the pre-WS-568 behaviour.
    result.phantom_error = e.message;
  }

  // ADR-067: pickup pool, computed BEFORE the resume exit for the same reason
  // the phantom sweep is — capacity must render on every invocation, or an
  // approved pool hides behind whichever sprint happens to be open.
  let wsDirForPool = null;
  try { wsDirForPool = findWorkstreamDir(process.cwd()); } catch { /* degraded: pool reads skip liveness */ }
  const pooledSprints = findPooledSprints(sprintUniverse, wsDirForPool);
  const STALE_POOL_DAYS = 2;
  result.sprint_pool = pooledSprints.map((s) => {
    const ageDays = (s.approved_at && Number.isFinite(Date.parse(s.approved_at)))
      ? Math.floor((Date.now() - Date.parse(s.approved_at)) / 86400000)
      : null;
    return {
      id: s.id,
      title: s.title || null,
      status: s.status || null,
      item_count: s.item_count || 0,
      approved_at: s.approved_at || null,
      age_days: ageDays,
      orphaned: !!s.orphaned,
      // A pool nobody picked up within the window is surfaced for an explicit
      // release-to-backlog decision rather than fossilizing (critique: the
      // 7-day sprint threshold is too slow for "never opened a second
      // terminal", the pool's normal failure mode).
      stale_pool: ageDays !== null && ageDays > STALE_POOL_DAYS,
    };
  });

  let active = findResumableSprint(sprintUniverse, result.session.id);

  // ADR-067: gate --pickup — explicitly adopt the top pooled sprint. Lease
  // shape per the design: lock -> write -> read-verify -> iterate on
  // contention (never dead-end on a lost race; try the next pooled sprint).
  // --pickup-sprint SPR-NNN adopts that one sprint and nothing else: /next
  // renders the whole pool as a choice, and a founder who picks the third row
  // must not be handed the first. A named sprint that is gone or lost to a
  // race reports a reason instead of falling through to another sprint.
  const pickupSprint = readFlag(args, 'pickup-sprint');
  const wantsPickup = hasFlag(args, 'pickup') || !!pickupSprint;
  if (wantsPickup && !active && result.session.id) {
    for (const cand of selectPickupCandidates(pooledSprints, pickupSprint)) {
      const picked = claimSprintLease(cand.id, result.session.id);
      if (!picked) continue;
      const pendingIds = (cand.item_refs || [])
        .filter((r) => r && r.id && r.status !== 'done' && r.status !== 'skipped')
        .map((r) => r.id);
      let claimedIds = [];
      try { claimedIds = claimItems(wsDirForPool, result.session.id, pendingIds); }
      catch { /* item leases degrade to the WS-529 shortfall report below */ }
      result.pickup = {
        sprint_id: cand.id,
        items_claimed: claimedIds,
        items_unclaimed: pendingIds.filter((id) => !claimedIds.includes(id)),
      };
      if (appendEvent && ensureCommandId) {
        try {
          appendEvent({
            source_track: 'T6:workstream-rebalance',
            source_tier: 'founder-prompt',
            track_tag: '/next',
            command_id: ensureCommandId('sprint-pickup'),
            payload: {
              type: 'sprint_claimed', sprint_id: cand.id,
              session: result.session.id, orphaned: !!cand.orphaned,
              items_claimed: claimedIds,
            },
          });
        } catch (e) {
          process.stderr.write(`gate: pickup event emission failed (non-fatal): ${e.message}\n`);
        }
      }
      active = Object.assign({}, cand, { claimed_by: result.session.id, dispatch: 'claimed' });
      break;
    }
    if (!result.pickup) {
      result.pickup = pickupSprint
        ? { sprint_id: null, requested: pickupSprint, reason: pooledSprints.some((s) => s.id === pickupSprint) ? 'contended' : 'not-in-pool' }
        : { sprint_id: null, reason: 'pool-empty-or-contended' };
    }
  } else if (wantsPickup && active) {
    result.pickup = { sprint_id: null, reason: 'own-sprint-exists', own_sprint: active.id };
  }

  if (active) {
    // WS-529: age travels with the resume. 14 approved sprints once
    // accumulated silently because /next resumed the newest and nothing said
    // how old it was — a founder intending fresh work got fossil work with no
    // indication. `stale` marks an approved sprint with ZERO progress past
    // the threshold; next.md then asks resume-or-abandon instead of silently
    // proceeding. Progress at any age is not stale — approved-and-working is
    // exactly what resume exists for. Constant, not config: a threshold that
    // moves is one nobody can hold the gate to.
    const STALE_SPRINT_DAYS = 7;
    const itemsDone = typeof active.items_done === 'number'
      ? active.items_done
      : (Array.isArray(active.items) ? active.items.filter((i) => i && i.status === 'done').length : 0);
    const approvedAt = active.approved_at || null;
    const ageDays = (approvedAt && Number.isFinite(Date.parse(approvedAt)))
      ? Math.floor((Date.now() - Date.parse(approvedAt)) / 86400000)
      : null;
    result.active_sprint = {
      id: active.id,
      title: active.title || null,
      status: active.status || null,
      items_done: itemsDone,
      item_count: active.item_count || (Array.isArray(active.items) ? active.items.length : 0),
      approved_at: approvedAt,
      age_days: ageDays,
      stale: active.status === 'approved' && itemsDone === 0 && ageDays !== null && ageDays > STALE_SPRINT_DAYS,
      // WS-568: additive. True when the sprint /next is about to resume is
      // itself one of `phantom_sprints` — resuming it would find nothing to do.
      phantom: result.phantom_sprints.some((p) => p.id === active.id),
    };
    if (json) writeJson(result);
    // Exit 1 when blocked, matching the compose path at the end of this function.
    // A resumable sprint used to exit 0 unconditionally, so a checkout hazard found
    // on the RESUME path would have been reported in the JSON and signalled nowhere
    // -- and resume is the path that actually failed on 2026-08-26.
    process.exit(result.blocked ? 1 : 0);
  }

  // Step 1b: config
  result.config = loadConfig();

  // Step 1d-pre: program activation gate
  const programsDir = path.join(stateDir(), 'programs');
  let installed = 0;
  let activeProgs = 0;
  if (fs.existsSync(programsDir)) {
    const files = fs.readdirSync(programsDir).filter((f) => /^prog-.+\.yaml$/.test(f) && f !== 'prog-template.yaml');
    installed = files.length;
    const regPath = path.join(programsDir, 'registry.yaml');
    if (fs.existsSync(regPath)) {
      const r = readYAMLFile(regPath);
      if (r.ok && r.data && Array.isArray(r.data.programs)) {
        activeProgs = r.data.programs.filter((p) => p && p.tier && p.tier !== 'dormant').length;
      }
    }
  }
  result.activation_gate.installed_count = installed;
  result.activation_gate.active_count = activeProgs;
  if (installed > 0 && activeProgs === 0) {
    result.activation_gate.ok = false;
    result.activation_gate.reason = 'no_programs_active';
    result.blocked = true;
    if (json) writeJson(result);
    process.exit(1);
  }

  // Step 1d: scan blocking programs (block_sprint: true; skip monitor_only).
  // WS-349 / FIND-231 fix: previously checked p.block_sprint at the protocol
  // level, but block_sprint is only declared at acc.on_stale.block_sprint
  // (program level). The broken inner guard meant the loop always continued,
  // so no protocol was ever flagged stale — block_sprint was inert.
  // Now: outer onStale.block_sprint gate (line 285) decides whether to enter
  // the inner loop; inner loop evaluates per-protocol staleness via
  // acc.on_stale.stale_days (WS-370 schema addition). cadence_days remains the
  // protocol's running schedule and is unrelated to staleness tolerance.
  const today = todayISO();
  if (fs.existsSync(programsDir)) {
    for (const f of fs.readdirSync(programsDir)) {
      if (!/^prog-.+\.yaml$/.test(f) || f === 'prog-template.yaml') continue;
      const r = readYAMLFile(path.join(programsDir, f));
      if (!r.ok || !r.data) continue;
      const d = r.data;
      if (d.monitor_only === true) continue;
      const acc = d.accountability || {};
      const onStale = acc.on_stale || {};
      if (onStale.block_sprint !== true) continue;

      // Source the program-level staleness floor from acc.on_stale.stale_days,
      // then escalation, then a 30-day default. Per WS-410 (this commit), this
      // is a FLOOR not a uniform threshold: each protocol's effective stale
      // window is max(program_floor, cadence_days * 1.5). Rationale: a 30-day-
      // cadence blind_spot shouldn't be considered "stale" at 8 days just
      // because the program-level on_stale.stale_days=7 was tuned for the
      // fastest protocol. Uncadenced protocols (baseline, meta) keep the
      // program floor.
      const escalation = acc.escalation || (acc.on_finding && acc.on_finding.escalation) || {};
      const staleDaysFloor = (typeof onStale.stale_days === 'number' ? onStale.stale_days : null)
        ?? (typeof escalation.stale_days === 'number' ? escalation.stale_days : null)
        ?? 30;

      const protos = d.protocols || {};
      let blockedHere = false;
      let staleProtoName = null;
      let overdueDays = 0;
      let effectiveStaleDays = staleDaysFloor;
      for (const [pname, p] of Object.entries(protos)) {
        if (!p) continue; // skip null/undefined entries; do NOT gate on p.block_sprint (broken)
        // Uncadenced protocols (baseline, meta) don't carry a running schedule
        // and are not the "is this program being watched?" signal — they
        // contribute to maturity, not freshness. Only cadenced protocols
        // count toward sprint-blocking staleness.
        const cadence = (typeof p.cadence_days === 'number' && p.cadence_days > 0) ? p.cadence_days : null;
        if (cadence == null) continue;
        const lastRun = (p.last_run_date)
          || (d.last_run_by_protocol && d.last_run_by_protocol[pname] && d.last_run_by_protocol[pname].date)
          || d.last_run_date
          || null;
        if (!lastRun) continue;
        const days = daysBetween(lastRun, today);
        const protoStale = Math.max(staleDaysFloor, Math.ceil(cadence * 1.5));
        const overdue = days - protoStale;
        if (overdue > 0) {
          blockedHere = true;
          staleProtoName = pname;
          overdueDays = overdue;
          effectiveStaleDays = protoStale;
          break;
        }
      }

      // WS-365 / FIND-247 prong 3: null-lastRun on active/critical block_sprint:true
      // programs surfaces explicitly instead of silent skip. Fires when the program
      // has ≥1 cadenced protocol and EVERY cadenced protocol has lastRun null
      // (never run). Watch/dormant tiers retain the soft path (the gap is
      // acceptable while ramping up). One block per program; bypasses gate-mismatch
      // check + per-protocol override (those gates assume a stale protocol exists).
      if (!blockedHere && (d.tier === 'active' || d.tier === 'critical')) {
        const cadenced = Object.entries(protos).filter(
          ([, p]) => p && typeof p.cadence_days === 'number' && p.cadence_days > 0
        );
        const allNeverRun = cadenced.length > 0 && cadenced.every(([pname, p]) => {
          const lr = (p.last_run_date)
            || (d.last_run_by_protocol && d.last_run_by_protocol[pname] && d.last_run_by_protocol[pname].date)
            || d.last_run_date
            || null;
          return !lr;
        });
        if (allNeverRun) {
          result.sprint_blocks.push({
            program: d.id,
            reason: 'first-run-required',
            tier: d.tier,
            protocols_never_run: cadenced.map(([pname]) => pname),
            hint: `/pulse run ${d.id} <protocol> --completed — first run required to clear block_sprint. `
              + `Run the protocol's engine first; --completed records last_run_by_protocol.<protocol>.date, `
              + `which is the field this gate reads. Without --completed the CLI records intent only and the block persists.`,
          });
          continue;
        }
      }

      // WS-349 part 2: event-log cross-check — if the YAML last_run_date
      // diverges from the most recent protocol_run_intent event in the log
      // by more than the program floor, surface a gate-mismatch warning. The
      // event log is canonical (ADR-045); a YAML that drifted past the log
      // can mask a stale program.
      if (!blockedHere && staleProtoName === null) {
        const mismatch = detectGateMismatch(path.dirname(programsDir), d.id, Object.keys(protos), staleDaysFloor, today);
        if (mismatch) {
          result.gate_mismatches = result.gate_mismatches || [];
          result.gate_mismatches.push(mismatch);
        }
      }

      if (blockedHere) {
        // WS-411: founder-acknowledgment escape hatch. If --override-stale-protocol
        // matches this program+protocol, drop the block + emit an audit event.
        const ovIdx = staleOverrides.findIndex(o => o.program === d.id && o.protocol === staleProtoName);
        if (ovIdx >= 0) {
          const ov = staleOverrides[ovIdx];
          result.stale_protocol_overrides = result.stale_protocol_overrides || [];
          result.stale_protocol_overrides.push({
            program: d.id,
            protocol: staleProtoName,
            overdue_days: overdueDays,
            stale_days: effectiveStaleDays,
            rationale: ov.rationale,
          });
          if (appendEvent && ensureCommandId) {
            try {
              const commandId = ensureCommandId('stale-protocol-ack');
              appendEvent({
                source_track: 'T0:envelope',
                source_tier: 'founder-prompt',
                track_tag: 'stale_protocol_acknowledged',
                command_id: commandId,
                payload: {
                  type: 'stale_protocol_acknowledged',
                  program: d.id,
                  protocol: staleProtoName,
                  overdue_days: overdueDays,
                  stale_days: effectiveStaleDays,
                  rationale: ov.rationale,
                  ack_at: new Date().toISOString(),
                  authorized_by: 'founder',
                  composed_by: 'cli-deterministic',
                },
              });
            } catch (e) {
              process.stderr.write(`gate: stale-protocol-ack event emission failed (non-fatal): ${e.message}\n`);
            }
          }
          staleOverrides.splice(ovIdx, 1); // consume the override; one per block
        } else {
          result.sprint_blocks.push({
            program: d.id,
            protocol: staleProtoName,
            overdue_days: overdueDays,
            stale_days: effectiveStaleDays,
          });
        }
      }
    }
  }
  // AF-2 (adversarial pass, 2026-08-26): filter on `advisory`, not on length.
  // `sprint_blocks` is ONE array accumulated across this whole function, so a
  // length test silently promotes any advisory entry pushed earlier into a hard
  // block. That made the checkout `unknown` verdict -- documented above as
  // "Advisory, never a block" -- a block on the compose path. The resume path
  // exits before reaching here, which is exactly why it tested clean.
  // No pre-existing entry sets `advisory`, so every existing block is unchanged.
  if (result.sprint_blocks.some((b) => !b.advisory)) {
    result.blocked = true;
  }

  // ADR-067: a LIVE foreign claim no longer blocks composition wholesale.
  // The WS-533 hard stop existed because composition was claim-blind — the
  // block was the ONLY protection. Composition now routes around held items
  // (buildEligibilityFilter, the same predicate in both scoring paths), so a
  // conflict elsewhere in the queue is information, not an obstruction. The
  // WS-564 conditioning contract is unchanged: conflicts still travel with
  // registry state, and `unknown` conditioning still refuses to read an empty
  // list as an all-clear. The last line of defense against a true race is
  // approve's verify-after-write (WS-529 shortfall report).
  if (result.session.claim_conflicts.length > 0) {
    for (const c of result.session.claim_conflicts) {
      result.sprint_blocks.push({ reason: 'claimed-by-other-session', advisory: true, item: c.id, hint: c.message });
    }
  } else if (result.session.conflicts_conditioning === 'unknown') {
    // NOT a block — a broken registry must not fence the queue, or the founder
    // loses the ability to work at all in exactly the state where the tooling is
    // already failing them. But it must not read as an all-clear either. This is
    // reported so the composed sprint carries its own caveat.
    result.sprint_blocks.push({
      reason: 'claim-conflicts-unknown',
      item: null,
      hint: `No claim conflicts found, but the session registry cannot be believed: ${result.session.registry.reason}. `
          + 'Treat "no conflicts" as UNKNOWN and check with the other sessions before editing shared files.',
    });
  }

  // Step 1e: replenishment — detect-and-report.
  // Full generation is deferred to cwos-pulse.js (WS-267) because the waterfall
  // depends on per-program tier weights + phase relevance lookups that belong
  // beside the health-score formula. gate surfaces the count so the founder
  // can see the gap; the actual mutation happens in /pulse.
  const backlog = store.queue.byStatus('backlog');
  const autoRecsByProg = new Set(backlog.filter((q) => classifySource(q) === 'auto-rec' && q.program).map((q) => q.program));
  if (fs.existsSync(programsDir)) {
    for (const f of fs.readdirSync(programsDir)) {
      if (!/^prog-.+\.yaml$/.test(f) || f === 'prog-template.yaml') continue;
      const r = readYAMLFile(path.join(programsDir, f));
      if (!r.ok || !r.data) continue;
      const d = r.data;
      if (d.monitor_only === true) continue;
      const score = typeof d.health_score === 'number' ? d.health_score : null;
      if (score === null || score >= 10) continue;
      if (autoRecsByProg.has(d.id)) continue;
      result.replenishment.needed.push({ program: d.id, health_score: score });
    }
  }
  if (result.replenishment.needed.length > 0) {
    result.replenishment.note = 'auto-rec generation deferred to cwos-pulse compute-health (WS-267); gate surfaces counts only';
  }

  // Step 1f: state-drift detection. Per ADR-045 / DEC-034 the detector reads
  // the canonical event log (not commit messages) and auto-reconciles inline.
  // Drift is blocking ONLY when reconcile fails (genuine corruption — e.g.,
  // an item_closed event exists but the queue YAML write fails). Successful
  // auto-reconciles are surfaced as advisory in compose --human output.
  if (validateStateDrift) {
    const queueDir = path.join(stateDir(), 'queue');
    const queueItems = [];
    if (fs.existsSync(queueDir)) {
      for (const f of globFiles(queueDir, 'WS-*.yaml')) {
        const r = readYAMLFile(f);
        if (r.ok && r.data) queueItems.push(r.data);
      }
    }
    try {
      const drifts = validateStateDrift(stateDir(), queueItems, null, { repoRoot: repoRoot() });
      if (Array.isArray(drifts) && drifts.length > 0) {
        const reconciled = drifts.filter((d) => d.auto_reconciled);
        const blocked = drifts.filter((d) => !d.auto_reconciled);
        if (reconciled.length > 0) {
          result.drift_auto_reconciled = reconciled.map((d) => ({
            ws_id: d.ws_id,
            kind: d.kind,
            prior_status: d.prior_status,
            new_status: d.new_status,
            event_id: d.event_id || d.sprint_event_id,
          }));
        }
        if (blocked.length > 0) {
          result.drift_detected = true;
          result.drift_items = blocked.map((d) => ({
            ws_id: d.ws_id,
            kind: d.kind,
            prior_status: d.prior_status,
            event_id: d.event_id,
            // WS-694: name the ref. "Something is wrong" is not actionable;
            // "closed on wt/foo, which is unmerged" is.
            ref: d.ref || null,
            error: d.error,
          }));
          result.blocked = true;
        }
      }
    } catch { /* drift check unavailable; non-fatal */ }
  }

  // WS-694: cross-branch drift escape valve. A repo carrying one junk unmerged
  // branch would otherwise be wedged out of /next permanently, and a blocking
  // check with no honest way past it is how people learn to reach for --force.
  // Same shape as --override-token-budget below: >=20-char rationale, audit
  // event, no silent bypass. Only clears the cross-branch class -- a genuine
  // reconcile failure still blocks.
  const overrideXBranch = readFlag(args, 'override-cross-branch-drift');
  if (overrideXBranch != null) {
    if (overrideXBranch.length < 20) {
      process.stderr.write(`gate: --override-cross-branch-drift rationale must be ≥ 20 characters; got ${overrideXBranch.length}\n`);
      process.exit(2);
    }
    const waived = result.drift_items.filter((d) => d.kind === 'item_closed_on_unmerged_ref');
    result.drift_items = result.drift_items.filter((d) => d.kind !== 'item_closed_on_unmerged_ref');
    result.cross_branch_drift_override = {
      rationale: overrideXBranch,
      waived: waived.map((d) => ({ ws_id: d.ws_id, ref: d.ref, event_id: d.event_id })),
    };
    if (result.drift_items.length === 0) {
      result.drift_detected = false;
      result.blocked = false;
    }
    if (waived.length > 0 && appendEvent && ensureCommandId) {
      try {
        appendEvent({
          source_track: 'T6:workstream-rebalance',
          source_tier: 'founder-prompt',
          track_tag: '/next',
          command_id: ensureCommandId('cross-branch-drift-ack'),
          payload: {
            type: 'cross_branch_drift_acknowledged',
            rationale: overrideXBranch,
            waived: result.cross_branch_drift_override.waived,
            ack_at: new Date().toISOString(),
            authorized_by: 'founder',
          },
        });
      } catch (e) {
        process.stderr.write(`gate: cross_branch_drift_acknowledged event emission failed (non-fatal): ${e.message}\n`);
      }
    }
  }

  // Token-budget gate — graceful fallback per fork-1.
  // WS-272: --override-token-budget "<rationale ≥20 chars>" short-circuits
  // the spawn AND emits a `budget_regression_acknowledged` event so the
  // override is auditable in the event log.
  const overrideRationale = readFlag(args, 'override-token-budget');
  if (overrideRationale != null) {
    if (overrideRationale.length < 20) {
      process.stderr.write(`gate: --override-token-budget rationale must be ≥ 20 characters; got ${overrideRationale.length}\n`);
      process.exit(2);
    }
    // Emit acknowledgment event before continuing
    let ackEventId = null;
    if (appendEvent && ensureCommandId) {
      try {
        const commandId = ensureCommandId('budget-ack');
        const r = appendEvent({
          source_track: 'T0:envelope',
          source_tier: 'founder-prompt',
          track_tag: 'budget_regression_acknowledged',
          command_id: commandId,
          payload: {
            type: 'budget_regression_acknowledged',
            rationale: overrideRationale,
            ack_at: new Date().toISOString(),
            authorized_by: 'founder',
            composed_by: 'cli-deterministic',
          },
        });
        if (r && r.ok && r.event) ackEventId = r.event.id;
      } catch (e) {
        process.stderr.write(`gate: budget-ack event emission failed (non-fatal): ${e.message}\n`);
      }
    }
    result.token_budget.available = true;
    result.token_budget.override = true;
    result.token_budget.rationale = overrideRationale;
    result.token_budget.ack_event_id = ackEventId;
  } else {
    const tbPath = path.join(__dirname, 'cwos-token-budget.js');
    if (fs.existsSync(tbPath)) {
      try {
        const r = spawnSync(process.execPath, [tbPath, '--check'], { cwd: repoRoot() });
        result.token_budget.available = true;
        const tb = interpretTokenBudget(r.status, r.stdout);
        Object.assign(result.token_budget, tb.token_budget);
        if (tb.blocked) result.blocked = true;
      } catch (e) {
        result.token_budget.note = `invocation error: ${e.message}`;
      }
    } else {
      process.stderr.write('[gate] cwos-token-budget.js not present (WS-272 not yet shipped) — token-budget check skipped\n');
      result.token_budget.note = 'cwos-token-budget.js not present (WS-272 not yet shipped); skipped';
    }
  }

  if (json) writeJson(result);
  process.exit(result.blocked ? 1 : 0);
}

// WS-1115: what cwos-token-budget --check's exit means for the gate.
// 0 measured + within budget, 1 regression (blocks), 3 NOT MEASURED (never
// blocks, never clean). Anything else is a broken check: not measured either.
function interpretTokenBudget(status, stdout) {
  const token_budget = { exit: status };
  if (status === 1) {
    return { blocked: true, token_budget: { ...token_budget, measured: true, note: 'budget regression detected' } };
  }
  if (status === 0) return { blocked: false, token_budget: { ...token_budget, measured: true } };
  let out = {};
  try { out = JSON.parse(String(stdout || '')); } catch { /* note stays generic */ }
  if (status === 3) {
    const k = typeof out.sample_count === 'number' ? out.sample_count : null;
    const n = typeof out.window_size === 'number' ? out.window_size : null;
    return { blocked: false, token_budget: { ...token_budget, measured: false, sample_count: k, window_size: n,
      note: `token budget NOT MEASURED — ${k ?? '?'} of ${n ?? '?'} valid /next readings so far` } };
  }
  return { blocked: false, token_budget: { ...token_budget, measured: false, note: `token budget NOT MEASURED — check exited ${status}` } };
}

function daysBetween(isoA, isoB) {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return Math.floor((b - a) / 86400000);
}

// WS-349 part 2: event-log cross-check helper.
// Compares the program's YAML last_run_by_protocol[*].date against the most
// recent protocol_run_intent event in the canonical log. If divergence
// exceeds the staleness threshold, surface a founder-readable warning. The
// event log is canonical (ADR-045); a YAML that drifted past the log can
// mask a stale program from the gate.
//
// Returns null when no mismatch detected (or events unavailable). Otherwise:
//   { program, protocol, yaml_date, event_date, divergence_days, message }
function detectGateMismatch(wsDir, programId, protocolNames, staleDays, today) {
  let readAllChunks = null;
  try { ({ readAllChunks } = require('./core/events')); } catch { return null; }
  if (!readAllChunks) return null;
  let events;
  try { events = readAllChunks(wsDir).events || []; } catch { return null; }
  if (!Array.isArray(events) || events.length === 0) return null;

  // Build last protocol_run_intent date per (program, protocol) from event log.
  const lastIntentByProto = new Map();
  for (const ev of events) {
    if (!ev || !ev.payload || ev.payload.type !== 'protocol_run_intent') continue;
    if (ev.payload.program !== programId) continue;
    const proto = ev.payload.protocol;
    if (!proto) continue;
    const at = ev.payload.emitted_at || (ev.timestamp && ev.timestamp.slice(0, 10));
    if (!at) continue;
    const prior = lastIntentByProto.get(proto);
    if (!prior || at > prior) lastIntentByProto.set(proto, at);
  }

  // Re-read the program YAML once for last_run_by_protocol comparison.
  const progPath = path.join(wsDir, 'programs', `prog-${programId}.yaml`);
  if (!fs.existsSync(progPath)) return null;
  const r = readYAMLFile(progPath);
  if (!r.ok || !r.data) return null;
  const lastByProto = (r.data.last_run_by_protocol && typeof r.data.last_run_by_protocol === 'object')
    ? r.data.last_run_by_protocol
    : {};

  for (const proto of protocolNames) {
    const yamlDate = (lastByProto[proto] && lastByProto[proto].date) || r.data.last_run_date || null;
    const eventDate = lastIntentByProto.get(proto) || null;
    if (!yamlDate || !eventDate) continue;
    // Divergence: event log has run-intent newer than YAML by > staleDays?
    // OR YAML claims newer run than the event log by > staleDays?
    const divergence = Math.abs(daysBetween(yamlDate, eventDate));
    if (divergence > staleDays) {
      return {
        program: programId,
        protocol: proto,
        yaml_date: yamlDate,
        event_date: eventDate,
        divergence_days: divergence,
        message: `YAML last_run_date for ${programId}/${proto} (${yamlDate}) diverges from event log (${eventDate}) by ${divergence} days — gate may be bypassed; reconcile via /pulse run.`,
      };
    }
  }
  return null;
}

// ─── 2. candidates ─────────────────────────────────────────────────────────

// WS-1170: lane -> model, resolved once per candidates()/compose call. Returns
// { lanes: {lane: resolved}, error } — error set when the ledger cannot be read,
// so every candidate says "unknown" rather than an invented default.
function loadLaneModels() {
  try {
    const root = resolveHomeBaseRoot();
    const r = modelLane.readLedger(modelLane.ledgerPath(root));
    if (!r.ok) return { lanes: {}, error: r.error };
    const lanes = {};
    for (const l of modelLane.LANES) lanes[l] = modelLane.resolveLane(l, r.data, root);
    return { lanes, error: null };
  } catch (e) {
    return { lanes: {}, error: e.message };
  }
}

// The routing fields one candidate carries. `model` is display-ready:
// "opus", "opus@low", "none", "REFUSED" (a lane lowered without a passing trial),
// "unknown" (ledger unreachable), or null (item has no model_lane yet).
function routingFields(item, laneModels) {
  const lane = item.model_lane || null;
  let model = null;
  let refused = null;
  if (lane) {
    const r = laneModels.lanes[lane];
    if (!r) model = laneModels.error ? 'unknown' : 'REFUSED';
    else model = modelLane.displayModel(r);
    if (r && !r.ok) refused = r.refused;
    else if (!r && !laneModels.error) refused = `lane ${lane} is not a known lane`;
  }
  const out = {
    runs_on: item.runs_on || null,
    model_lane: lane,
    model_lane_source: item.model_lane_source || null,
    model,
  };
  if (refused) out.model_refused = refused;
  return out;
}

/**
 * ADR-067 eligibility (master) applied to the WS-857 slate (poker): the store the selector
 * reads is narrowed to eligible backlog items BEFORE ranking, so a limit counts eligible
 * items and tie groups describe what is shown. selectSlate itself takes no eligibility
 * predicate yet; when it does, this wrapper goes.
 */
function eligibleStore(store, elig) {
  return Object.assign({}, store, {
    queue: Object.assign({}, store.queue, {
      byStatus: (status) => {
        const xs = store.queue.byStatus(status) || [];
        return status === 'backlog' ? xs.filter((it) => it && elig.eligible(it.id)) : xs;
      },
    }),
  });
}

/**
 * WS-1170 routing fields on every slate candidate. The slate's own runs_on is kept: it is
 * normalized (WS-493 / machine-affinity.md legacy tokens), routingFields' is the raw value.
 */
function withRouting(store, slate, laneModels) {
  for (const c of slate.candidates || []) {
    const src = (store.queue.byId && store.queue.byId(c.id)) || c;
    const runsOn = c.runs_on;
    Object.assign(c, routingFields(src, laneModels));
    if (runsOn !== undefined) c.runs_on = runsOn;
  }
  slate.lane_ledger_error = laneModels.error;
  return slate;
}

function runCandidates(args) {
  const limit = parseInt(readFlag(args, 'limit') || '30', 10);
  const store = loadStore();
  // ADR-067: shared eligibility filter — the SAME predicate compose reads via
  // candidatesInline, so what this command renders matches what compose picks.
  const elig = buildEligibilityFilter(store);
  const slate = selectSlateFromStore(eligibleStore(store, elig), {
    repoRoot: repoRoot(),
    stateDir: stateDir(),
    limit,
    tag: 'cwos-next',
  });
  slate.excluded = elig.excluded;
  slate.excluded_items = elig.dropped;
  slate.checkout = checkoutBlock();
  withRouting(store, slate, loadLaneModels());
  emitBlockerRefusals(slate.blocker_refusals);
  emitPriorityRefusals(slate.priority_refusals);
  if (hasFlag(args, 'human') || hasFlag(args, 'slate')) {
    process.stdout.write(renderSlate(slate, { limit }));
    return;
  }
  writeJson(slate);
}

// ─── 3. compose ────────────────────────────────────────────────────────────

function runCompose(args) {
  const human = hasFlag(args, 'human');
  const candidatesFile = readFlag(args, 'candidates-file');
  const goalArg = readFlag(args, 'goal'); // optional founder-supplied goal
  const composedAt = readFlag(args, 'clock') || new Date().toISOString();
  // WS-1131: founder-directed composition. The founder approved WS-021 +
  // WS-017; releasing four stale pools in the same breath reshuffled the
  // ranking, and the recompose that approve needed anchored on WS-061 — work
  // he never saw. The CLI had no way to say "these items", so the session
  // hand-filtered a --candidates-file. `--items` is that sentence.
  const itemsArg = readFlag(args, 'items');
  let pinnedIds = null;
  if (itemsArg != null) {
    pinnedIds = parseIdList(itemsArg);
    const dupes = pinnedIds.filter((id, i) => pinnedIds.indexOf(id) !== i);
    if (pinnedIds.length === 0 || dupes.length) {
      process.stderr.write(`compose: --items needs a comma-separated list of distinct ids${dupes.length ? `; repeated: ${dupes.join(', ')}` : ''}\n`);
      process.exit(2);
    }
  }
  const store = loadStore();

  // Source candidates either from stdin / a file / a fresh run-candidates pass.
  let candidatesPayload;
  if (candidatesFile) {
    candidatesPayload = JSON.parse(fs.readFileSync(candidatesFile, 'utf8'));
  } else {
    candidatesPayload = candidatesInline(store);
  }
  const candidates = candidatesPayload.candidates || [];

  // Every named id must pass the SAME eligibility the ranked path applies —
  // the candidates list is that filter's output. One refused id refuses the
  // whole composition: silently dropping it would mint a sprint the founder
  // did not name, which is the incident again in a different shape.
  let pinned = null;
  if (pinnedIds) {
    const res = resolvePinnedItems(store, pinnedIds, candidates);
    if (res.rejected.length) {
      writeJson({ ok: false, reason: 'items_ineligible', composed_at: composedAt, requested: pinnedIds, rejected: res.rejected });
      process.exit(1);
    }
    pinned = res.pinned;
  }

  if (candidates.length === 0) {
    writeJson({ ok: false, reason: 'no_candidates', composed_at: composedAt });
    process.exit(1);
  }

  const config = loadConfig();
  const cap = ceremonyDefaults(config.ceremony);
  // configNumber already normalised these; assign unconditionally so an
  // explicit 0 is honoured rather than read as "unset" by a truthiness test.
  if (config.sprints) {
    cap.max_items = configNumber(config.sprints.max_items, cap.max_items);
    cap.max_effort_sessions = configNumber(config.sprints.max_effort_sessions, cap.max_effort_sessions);
  }

  // Step 3a: anchor = top adjusted_score candidate — or, founder-directed, the
  // first item he named.
  let anchor = pinned ? pinned[0] : candidates[0];

  // Step 3a-rotation: fleet-rotation override.
  const overrideClass = readContextOverrideClass();
  let rotationNote = null;
  if (overrideClass === 'internal-investment-phase') {
    rotationNote = 'fleet-rotation override SUPPRESSED via system/context.md active internal-investment-phase block';
  }
  // (Full rotation invariant — last 4 sprints, fleet/repo-goal classification
  // — deferred to a follow-up. The override path is the load-bearing branch
  // for this session because the founder is in an internal-investment phase.)

  // Step 3b/c: pull related items + cap by effort/items. Founder-directed
  // skips the continuity fill: the sprint is exactly what he named, and an
  // over-cap choice is reported (cap_used.over_cap), never trimmed.
  const { items, usedSessions } = pinned
    ? { items: pinned.slice(), usedSessions: pinned.reduce((n, it) => n + effortSessions(it.effort), 0) }
    : selectCompanions(anchor, candidates, cap);

  // Step 3d: classify mode for each item via the shared module.
  const classified = items.map((it) => {
    const queueItem = store.queue.byId(it.id) || {};
    const mode = classifyMode(queueItem);
    return Object.assign({}, it, { mode, queue_item_known: !!queueItem.id });
  });

  // ADR-067 layer 2: portfolio — up to 2 additional POOLED batches from the
  // residue the primary fill did not consume. A batch is offered only when its
  // independence is knowable: different program than the primary, no
  // blocked_by into the portfolio, and — fail-closed, autopilot-Stage-B
  // posture — every item DECLARES files_involved that overlap nothing already
  // in the portfolio and nothing a live peer session has locked. Only ~13-15%
  // of items declare scope today (measured at design time); the exclusion
  // counters below keep that starvation honest in the render instead of
  // silently pooling on unknown overlap.
  const MAX_PARALLEL_BATCHES = 2;
  const consumedIds = new Set(items.map((i) => i.id));
  const parallelBatches = [];
  const parallelExcluded = { no_declared_scope: 0, file_overlap: 0 };
  const filesOf = (id) => {
    const q = store.queue.byId(id) || {};
    return (Array.isArray(q.files_involved) ? q.files_involved : [])
      .map((f) => String(f).split('\\').join('/').replace(/^\.\//, '').replace(/\/+$/, ''))
      .filter(Boolean);
  };
  const overlaps = (a, b) => {
    for (const x of a) for (const y of b) {
      if (x === y || x.startsWith(y + '/') || y.startsWith(x + '/')) return true;
    }
    return false;
  };
  // Everything the portfolio (or a live peer) already touches.
  const takenPaths = [];
  for (const it of items) takenPaths.push(...filesOf(it.id));
  try {
    const wsDirLocks = findWorkstreamDir(process.cwd());
    const mySessionForLocks = resolveSessionId(wsDirLocks, { create: false });
    for (const entry of listFileLocks(wsDirLocks) || []) {
      if (entry && entry.session_id !== mySessionForLocks && Array.isArray(entry.files)) {
        takenPaths.push(...entry.files.map((f) => String(f).replace(/\/+$/, '')));
      }
    }
  } catch { /* lock reads degrade to portfolio-only overlap */ }

  // Every primary item's program, not just the anchor's: the ranked fill only
  // ever takes the anchor's program so the two are the same set there, but a
  // founder-directed sprint can span programs.
  const primaryPrograms = new Set(items.map((i) => i.program).filter(Boolean));
  const residueByProgram = new Map();
  for (const c of candidates) {
    if (consumedIds.has(c.id)) continue;
    if (!c.program || primaryPrograms.has(c.program)) continue;
    if (c.soft_block_factor && c.soft_block_factor < 1) continue; // soft-blocked = bad parallel pick
    if (!residueByProgram.has(c.program)) residueByProgram.set(c.program, []);
    residueByProgram.get(c.program).push(c);
  }
  // Programs in order of their best candidate. `candidates` is already the slate's order
  // (WS-857: one ranking path, with its declared tiebreak chain), and the map was filled
  // walking it, so insertion order IS that order — a re-sort on adjusted_score here would
  // be a second ranking whose ties fall back to Map insertion by accident.
  const programOrder = Array.from(residueByProgram.keys());
  for (const prog of programOrder) {
    if (parallelBatches.length >= MAX_PARALLEL_BATCHES) break;
    const group = residueByProgram.get(prog);
    const batchItems = [];
    const batchPaths = [];
    let batchSessions = 0;
    for (const c of group) {
      if (batchItems.length >= cap.max_items) break;
      if (batchSessions + effortSessions(c.effort) > cap.max_effort_sessions) break;
      const deps = (store.queue.byId(c.id) || {}).blocked_by || [];
      if (deps.some((d) => consumedIds.has(d) || batchItems.some((bi) => bi.id === d))) continue;
      const declared = filesOf(c.id);
      if (declared.length === 0) { parallelExcluded.no_declared_scope++; continue; }
      if (overlaps(declared, takenPaths) || overlaps(declared, batchPaths)) {
        parallelExcluded.file_overlap++;
        continue;
      }
      const queueItem = store.queue.byId(c.id) || {};
      batchItems.push(Object.assign({}, c, {
        mode: classifyMode(queueItem),
        queue_item_known: !!queueItem.id,
        files_involved: declared,
      }));
      batchPaths.push(...declared);
      batchSessions += effortSessions(c.effort);
    }
    if (!batchItems.length) continue;
    takenPaths.push(...batchPaths);
    for (const bi of batchItems) consumedIds.add(bi.id);
    parallelBatches.push({
      program: prog,
      goal: `Ship ${batchItems[0].id}: ${batchItems[0].title || 'work item'}`,
      items: batchItems,
      effort_sessions: batchSessions,
      files: batchPaths,
    });
  }

  // Step 3e: sequence — execute-no-deps first, then deps, then plan-first.
  // Founder-directed keeps his order: "in that order" is part of what he said.
  if (!pinned) {
    classified.sort((a, b) => {
      const am = a.mode === 'execute' ? 0 : 1;
      const bm = b.mode === 'execute' ? 0 : 1;
      if (am !== bm) return am - bm;
      return b.adjusted_score - a.adjusted_score;
    });
  }

  // Step 3f: goal — if --goal was provided, use it; else templated from anchor.
  const goal = goalArg || `Ship ${anchor.id}: ${anchor.title || 'work item'}`;

  // Step 3g: aggregate decisions.
  const decisions = [];
  for (const it of classified) {
    if (it.mode !== 'plan-first') continue;
    const queueItem = store.queue.byId(it.id) || {};
    const flags = Array.isArray(queueItem.decision_flags) ? queueItem.decision_flags : [];
    for (const f of flags) decisions.push(`Item ${it.id}: ${f}`);
  }

  // Step 4a: anti-goal cross-check.
  const checkText = [goal].concat(classified.map((c) => c.title || c.id)).join('; ');
  const anti = runConstitutionalAuditCheck(checkText);

  const sprint = {
    composed_at: composedAt,
    // WS-1131: how the primary items were chosen — `ranked` (anchor + program
    // continuity) or `founder-directed` (compose --items). Machine-readable so
    // approve can carry it into the sprint record and the sprint_approved
    // event; `composed_by` stays `cli-deterministic` (ADR-037 names that
    // field's domain, and this composition is still the CLI's).
    composition: pinned ? 'founder-directed' : 'ranked',
    pinned_items: pinned ? pinned.map((p) => p.id) : null,
    goal,
    program_focus: anchor.program || null,
    override_class: overrideClass || null,
    items: classified,
    decisions_needed: decisions,
    anti_goal_check: anti,
    composition_notes: buildCompositionNotes({
      anchor,
      pinnedIds: pinned ? pinned.map((p) => p.id) : null,
      candidates,
      saturated: candidatesPayload.saturated_classes || [],
      lastClasses: candidatesPayload.last_anchor_classes || [],
      rotationNote,
      effortSessions: usedSessions,
      cap,
      itemCount: classified.length,
      breachedPrograms: candidatesPayload.breached_programs || [],
    }),
    cap_used: {
      items: classified.length,
      effort_sessions: usedSessions,
      ceremony: config.ceremony,
      max_items: cap.max_items,
      max_effort_sessions: cap.max_effort_sessions,
      // WS-569: machine-readable, so a caller never has to re-derive whether a
      // composition fits by parsing the prose notes.
      over_cap: capOvershoot(classified.length, usedSessions, cap),
    },
    // ADR-067: machine-readable like cap_used, NOT in composition_notes (that
    // string is frozen verbatim into the sprint YAML; a transient capacity
    // advisory must not fossilize into the record). Approve --with-pool reads
    // this to mint the pooled batch sprints.
    parallel_batches: parallelBatches,
    parallel_excluded: parallelExcluded,
    // Compose-time exclusion counters from the shared eligibility filter, so
    // a shrunken candidate pool is explainable from the sidecar alone.
    eligibility_excluded: candidatesPayload.excluded || null,
    // WS-993: which items were dropped and why, and the checkout verdict the gate would give.
    eligibility_excluded_items: candidatesPayload.excluded_items || [],
    checkout: checkoutBlock(),
  };

  // FIND-314 fix: always persist the canonical sidecar atomically before
  // emitting stdout. Approve consumes this path; stdout-only would let a
  // stale tmp file silently ratify on the next approve.
  const tmpPath = path.join(repoRoot(), '.claude', '.tmp-sprint.json');
  try { writeFileAtomic(tmpPath, JSON.stringify(sprint, null, 2) + '\n'); }
  catch (e) { process.stderr.write(`compose: sidecar write failed (non-fatal): ${e.message}\n`); }

  if (human) {
    process.stdout.write(renderHumanCompose(sprint));
    return;
  }
  writeJson(sprint);
}

/**
 * In-process slate for `compose`, which does not want to shell out.
 *
 * WS-857: this was a ~110-line copy of runCandidates. It is now the same call, and the
 * duplication that produced the WS-350 / WS-590 / WS-695 drifts cannot recur.
 *
 * `limit` is deliberately NOT passed. `runCompose` hands this whole list to
 * `selectCompanions`, which walks `candidates.slice(1)` filtering on the anchor's program —
 * so a 30-item default here would cut the companion pool from ~435 to 29 and silently shrink
 * every sprint. That is the same shape as the break-vs-continue defect in `selectCompanions`
 * and equally invisible from the output.
 *
 * Signature and payload keys are frozen: `dependencyBlockerResolution.test.js:353` calls this
 * with a one-arg fake store and asserts on `blocker_refusals` / `dependency_resolution`, and
 * `cwos-fleet-compute.js:721` parses `candidates` out of the CLI form.
 */
function candidatesInline(store) {
  // ADR-067: shared eligibility filter — see buildEligibilityFilter.
  const elig = buildEligibilityFilter(store);
  const slate = selectSlateFromStore(eligibleStore(store, elig), {
    repoRoot: repoRoot(),
    stateDir: stateDir(),
    tag: 'cwos-next',
  });
  // ADR-067: how many backlog items the shared eligibility filter removed,
  // so a shrunken candidate list is explainable rather than mysterious.
  slate.excluded = elig.excluded;
  slate.excluded_items = elig.dropped;
  withRouting(store, slate, loadLaneModels());
  emitBlockerRefusals(slate.blocker_refusals);
  emitPriorityRefusals(slate.priority_refusals);
  return slate;
}

/**
 * WS-1131: resolve compose --items against the candidate list.
 *
 * The candidate list IS the shared eligibility filter's output, so membership
 * is the test; everything below only explains a miss. Each reason is checked
 * in the order the filter applies it, and the queue YAML answers status
 * (makeItemStatusLookup) because the state cache lags item mutation — a
 * refusal that blamed the wrong cause would send the founder after the wrong
 * fix.
 *
 * @returns {{ pinned: object[], rejected: Array<{id, reason, ...}> }}
 */
function resolvePinnedItems(store, ids, candidates) {
  const byId = new Map((candidates || []).map((c) => [c.id, c]));
  const statusOf = makeItemStatusLookup(store);
  const elig = buildEligibilityFilter(store);
  const pinned = [];
  const rejected = [];
  for (const id of ids) {
    if (byId.has(id)) { pinned.push(byId.get(id)); continue; }
    const status = statusOf(id);
    if (status == null) { rejected.push({ id, reason: 'unknown', detail: 'no queue item with this id' }); continue; }
    if (status !== 'backlog') {
      rejected.push({ id, reason: 'not_backlog', status, detail: `status is ${status}; only backlog items are composable` });
      continue;
    }
    let deps = [];
    try { deps = ((store.queue.byId(id) || {}).blocked_by) || []; } catch { /* unknown deps */ }
    const open = (Array.isArray(deps) ? deps : []).filter((d) => statusOf(d) !== 'done');
    if (open.length) {
      rejected.push({ id, reason: 'blocked', blocked_by: open, detail: `waiting on ${open.join(', ')}` });
      continue;
    }
    const w = elig.why(id);
    if (w && w.reason === 'in_open_sprint') {
      rejected.push({ id, reason: 'in_open_sprint', sprint_id: w.sprint_id, detail: `already in open sprint ${w.sprint_id}` });
      continue;
    }
    if (w && w.reason === 'claimed_by_live_peer') {
      rejected.push({ id, reason: 'claimed_by_live_peer', claimed_by: w.claimed_by, detail: `held by live session ${w.claimed_by}` });
      continue;
    }
    rejected.push({
      id, reason: 'not_a_candidate',
      detail: 'absent from the candidate list (a --candidates-file that omits it, or a state cache that lags the queue — run cwos-reconcile.js)',
    });
  }
  return { pinned, rejected };
}

function buildCompositionNotes({ anchor, pinnedIds = null, candidates, saturated, lastClasses, rotationNote, effortSessions: used, cap, itemCount, breachedPrograms }) {
  const lines = [];
  // WS-1131: this string is frozen into the sprint YAML, so a founder-directed
  // sprint must say so here — a reader of the record otherwise sees an
  // "Anchor: selected" line and believes the ranking chose it.
  if (Array.isArray(pinnedIds) && pinnedIds.length) {
    lines.push(`Founder-directed: ${pinnedIds.join(', ')} named via compose --items, in that order; anchor ranking and program-continuity fill skipped.`);
  } else {
    lines.push(`Anchor: ${anchor.id} selected (${anchor.raw_score} × ${anchor.soft_block_factor !== 1 ? `${anchor.soft_block_factor} soft-block × ` : ''}${anchor.source_damping !== 1 ? `${anchor.source_damping} source-damping × ` : ''}${anchor.context_boost && anchor.context_boost !== 1 ? `${anchor.context_boost} context-boost` : 'no damping'} = ${anchor.adjusted_score}).`);
  }
  // WS-695: name the override that boosted the anchor. Without this the score
  // is unexplainable from the sprint file, and the founder cannot tell an
  // override-driven anchor from an organically top-ranked one.
  if (Array.isArray(anchor.context_boost_applied) && anchor.context_boost_applied.length > 0) {
    for (const b of anchor.context_boost_applied) {
      const m = Object.entries(b.match).map(([k, v]) => `${k}=${v}`).join(', ');
      lines.push(`Context boost applied: override_class ${b.override_class} matched [${m}] → ${b.factor}×.`);
    }
  }
  if (saturated.length > 0) {
    lines.push(`Source-class damping fired: last 3 anchor classes = [${lastClasses.join(', ')}]; saturated = [${saturated.join(', ')}]; 0.7×.`);
  }
  if (rotationNote) {
    lines.push(rotationNote);
  }
  // WS-350: surface cap-breach state + any priority_floor applications.
  if (Array.isArray(breachedPrograms) && breachedPrograms.length > 0) {
    lines.push(`Program cap-breach: ${breachedPrograms.join(', ')} (priority_floor applied to candidates from these programs).`);
  }
  const floored = (candidates || []).filter((c) => c.priority_floor_applied);
  if (floored.length > 0) {
    const sample = floored.slice(0, 3).map((c) => `${c.id} ${c.priority_floor_applied.from}→${c.priority_floor_applied.to}`).join(', ');
    const more = floored.length > 3 ? ` (+${floored.length - 3} more)` : '';
    lines.push(`priority_floor applied: ${sample}${more}.`);
  }
  lines.push(`Cap usage: ${used} session(s) / ${cap.max_effort_sessions} (${cap.max_items} items max).`);

  // WS-569 second half. Capping the LOOP is not the same as capping the SPRINT:
  // the anchor is seated before the loop runs, so a single L item (3 sessions)
  // overshoots a standard 2-session ceiling and every later break is a no-op.
  // SPR-028's stored record read "Cap usage: 10 session(s) / 2" as a neutral
  // line, which is how a 5x overshoot survived review. An overshoot that does
  // not announce itself is indistinguishable from a sprint that fits.
  const over = capOvershoot(itemCount, used, cap);
  if (over) lines.push(`⚠ OVER CEREMONY CAP — ${over}. Approving accepts the overshoot.`);

  return lines.join('\n');
}

/**
 * Describe how a composition exceeds its ceremony caps, or null if it fits.
 * Exported so the JSON path and the --human path cannot disagree about whether
 * a sprint is over cap.
 */
function capOvershoot(itemCount, usedSessions, cap) {
  const parts = [];
  if (Number.isFinite(cap.max_items) && itemCount > cap.max_items) {
    parts.push(`${itemCount} items against a ${cap.max_items}-item cap`);
  }
  if (Number.isFinite(cap.max_effort_sessions) && usedSessions > cap.max_effort_sessions) {
    parts.push(`${usedSessions} session(s) against a ${cap.max_effort_sessions}-session ceiling`);
  }
  return parts.length ? parts.join(' and ') : null;
}

function runConstitutionalAuditCheck(text) {
  const auditScript = path.join(__dirname, 'cwos-constitutional-audit.js');
  if (!fs.existsSync(auditScript)) return { status: 'unavailable', matches: [] };
  try {
    const r = spawnSync(process.execPath, [auditScript, '--check-text', text], { encoding: 'utf8' });
    if (r.status === 0) return { status: 'passed', matches: [] };
    if (r.status === 1) {
      let parsed;
      try { parsed = JSON.parse(r.stdout || '{}'); } catch { parsed = {}; }
      return { status: 'matched', matches: parsed.matches || [], raw: r.stdout || '' };
    }
    return { status: 'error', exit: r.status, stderr: r.stderr || '' };
  } catch (e) {
    return { status: 'error', error: e.message };
  }
}

// "opus (deep-code)" — the model the lane resolves to, and the lane, so a surprising
// model is traceable to the lane that produced it. "—" when the item has no lane.
function renderModelCell(it) {
  if (!it.model_lane) return '—';
  const src = it.model_lane_source && it.model_lane_source !== 'rule' ? `, ${it.model_lane_source}` : '';
  return `${it.model || '?'} (${it.model_lane}${src})`;
}

function renderHumanCompose(sprint) {
  const out = [];
  out.push(`## Proposed Sprint`);
  out.push(``);
  if (sprint.composition === 'founder-directed') {
    out.push(`Founder-directed: built from the items you named (${(sprint.pinned_items || []).join(', ')}), in that order — not from the ranking.`);
    out.push(``);
  }
  out.push(`### Goal`);
  out.push(sprint.goal);
  out.push(``);
  out.push(`### Items`);
  // WS-1170: Needs (runs_on) and Model (lane -> routing ledger) beside Effort, so the
  // founder sees what each item needs and which model will do it before approving.
  out.push(`| # | ID | Title | Mode | Effort | Needs | Model |`);
  out.push(`|---|----|-------|------|--------|-------|-------|`);
  sprint.items.forEach((it, i) => {
    out.push(`| ${i + 1} | ${it.id} | ${it.title || ''} | ${it.mode === 'execute' ? 'Just do it' : 'Design first'} | ${it.effort || '?'} | ${it.runs_on || '?'} | ${renderModelCell(it)} |`);
  });
  const refusedLanes = sprint.items.filter((it) => it.model_refused);
  if (refusedLanes.length) {
    out.push(``);
    out.push(`Model REFUSED for ${refusedLanes.map((it) => it.id).join(', ')}: ${refusedLanes[0].model_refused}`);
  }
  const unlaned = sprint.items.filter((it) => !it.model_lane).length;
  if (unlaned) out.push(`${unlaned} item(s) carry no model_lane — run cwos-model-lane backfill.`);
  out.push(``);
  out.push(`### Cap usage`);
  out.push(`${sprint.cap_used.items} item(s), ~${sprint.cap_used.effort_sessions} session(s) (${sprint.cap_used.ceremony} ceremony).`);
  out.push(``);
  // ADR-067: the proposal surface. Capacity nobody surfaces does not exist
  // for the founder — this section is the point of the parallel-dispatch
  // release. Renders between Cap usage and Decisions needed; deliberately not
  // part of composition_notes (that string is frozen into the sprint YAML).
  const batches = Array.isArray(sprint.parallel_batches) ? sprint.parallel_batches : [];
  const pex = sprint.parallel_excluded || {};
  if (batches.length > 0) {
    out.push(`### Parallel capacity`);
    out.push(`This queue can run ${batches.length + 1}-wide right now:`);
    out.push(`- This session -> the sprint above: ${sprint.goal}`);
    batches.forEach((b, i) => {
      out.push(`- Ready for pickup -> Batch ${String.fromCharCode(66 + i)} (${b.program}, ${b.items.length} item(s), no declared file overlap): ${b.goal}`);
    });
    out.push(`Approve with pool, then: open another terminal, run /next — it picks up a pooled sprint.`);
    out.push(`Conditioned on declared file scopes and registered sessions only — a session that`);
    out.push(`does not run /next or the git hooks (e.g. a Codex terminal) is invisible to this check.`);
    if (pex.no_declared_scope > 0 || pex.file_overlap > 0) {
      out.push(`Not poolable: ${pex.no_declared_scope || 0} candidate(s) lack declared file scope; ${pex.file_overlap || 0} overlap the portfolio.`);
    }
    out.push(``);
  } else if ((pex.no_declared_scope || 0) > 0) {
    out.push(`### Parallel capacity`);
    out.push(`None offered: ${pex.no_declared_scope} residue candidate(s) lack declared file scope (files_involved) — not poolable. Declare scope to unlock parallel batches.`);
    out.push(``);
  }
  if (sprint.decisions_needed.length > 0) {
    out.push(`### Decisions needed`);
    for (const d of sprint.decisions_needed) out.push(`- ${d}`);
    out.push(``);
  }
  out.push(`### Composition notes`);
  out.push(sprint.composition_notes);
  out.push(``);
  out.push(`### Anti-goal check`);
  if (sprint.anti_goal_check.status === 'passed') out.push(`✓ Anti-goal check: clean.`);
  else if (sprint.anti_goal_check.status === 'matched') out.push(`⚠ Anti-goal check: ${sprint.anti_goal_check.matches.length} match(es) — review before approval.`);
  else out.push(`Anti-goal check: ${sprint.anti_goal_check.status}`);
  out.push(``);
  out.push(`---`);
  // Decision #8 footer — verbatim. Founders learn what is script vs AI judgment.
  out.push(`Sprint composition: deterministic (CLI). Rationale: pre-computed. Anti-goal check: deterministic (CLI).`);
  out.push(``);
  return out.join('\n');
}

// ─── 4. approve ────────────────────────────────────────────────────────────

function runApprove(args) {
  const sprintFile = readFlag(args, 'sprint-file');
  const aiAutonomous = hasFlag(args, 'ai-autonomous');
  const forceStale = hasFlag(args, 'force-stale');
  // ADR-067: also mint the composed parallel batches as POOLED sprints.
  const withPool = hasFlag(args, 'with-pool');
  const approvedAt = readFlag(args, 'clock') || new Date().toISOString();

  // WS-269: rationale validated up front, mirroring the gate's
  // --override-token-budget friction-by-design pattern.
  const overrideActive = readFlag(args, 'override-active-sprint');
  if (overrideActive != null && overrideActive.length < 20) {
    process.stderr.write(`approve: --override-active-sprint rationale must be ≥ 20 characters; got ${overrideActive.length}\n`);
    process.exit(2);
  }

  // WS-582: /next Step 4a option 4 — "Approve with EXEMPTION". next.md has
  // prescribed this flag since WS-227 and the script never had it, so the one
  // branch where a founder consciously accepts a constitutional risk recorded
  // nothing. INV-038 reads `anti_goal_check.status` and expects `exempted`
  // there; without the flag the sprint could only ever land as
  // `accepted_implicit`, which is the shape the invariant calls discouraged.
  // Same ≥20-character friction as --override-active-sprint above: a reason
  // nobody can read later is not accountability.
  const exemptionReason = readFlag(args, 'exemption-reason');
  if (exemptionReason != null && exemptionReason.trim().length < 20) {
    process.stderr.write(`approve: --exemption-reason must be ≥ 20 characters; got ${exemptionReason.trim().length}\n`);
    process.exit(2);
  }

  if (!sprintFile) {
    process.stderr.write('approve: --sprint-file <path-to-compose-output.json> is required\n');
    process.exit(2);
  }
  let sprint;
  try { sprint = JSON.parse(fs.readFileSync(sprintFile, 'utf8')); }
  catch (e) {
    process.stderr.write(`approve: cannot read sprint file: ${e.message}\n`);
    process.exit(2);
  }

  // WS-1131: the founder's yes binds to the items he SAW. Approve consumes a
  // sidecar any later compose may have rewritten — in the incident a recompose
  // after a pool release swapped the anchor for an item he never approved —
  // so the session states what it showed him and approve refuses a mismatch
  // before anything is written. Checked first: a refused binding is the most
  // important thing this run can say. `--expect-pool` does the same for the
  // union of the parallel batches (`none` = expect no pool).
  const bindingMismatches = [];
  const expectItems = readFlag(args, 'expect-items');
  if (expectItems != null) {
    const d = idSetDiff(parseIdList(expectItems), (sprint.items || []).map((it) => it && it.id));
    if (d) bindingMismatches.push(Object.assign({ scope: 'items' }, d));
  }
  const expectPool = readFlag(args, 'expect-pool');
  if (expectPool != null) {
    const poolIds = [];
    for (const b of (Array.isArray(sprint.parallel_batches) ? sprint.parallel_batches : [])) {
      for (const it of (b && Array.isArray(b.items) ? b.items : [])) poolIds.push(it && it.id);
    }
    const want = String(expectPool).trim().toLowerCase() === 'none' ? [] : parseIdList(expectPool);
    const d = idSetDiff(want, poolIds);
    if (d) bindingMismatches.push(Object.assign({ scope: 'pool' }, d));
  }
  if (bindingMismatches.length) {
    writeJson({
      ok: false,
      reason: 'expected_items_mismatch',
      sprint_file: sprintFile,
      composed_at: sprint.composed_at || null,
      mismatches: bindingMismatches,
      hint: 'Nothing was written. Recompose with `compose --items <the ids the founder approved>`, then approve again with --expect-items.',
    });
    process.exit(1);
  }

  // FIND-314 fix: freshness check on composed_at. Stale tmp files are the
  // root cause of phantom sprints (SPR-152/155/157/159). Env var override
  // primarily for tests; 5min default matches FIND-314 accept_criteria.
  const FRESHNESS_WINDOW_MS = parseInt(process.env.CWOS_NEXT_FRESHNESS_MS || '300000', 10);
  const composedAtStr = sprint.composed_at || null;
  if (!composedAtStr) {
    process.stderr.write('approve: sprint file missing composed_at field\n');
    process.exit(2);
  }
  const composedMs = Date.parse(composedAtStr);
  if (Number.isNaN(composedMs)) {
    process.stderr.write(`approve: sprint file has invalid composed_at (${composedAtStr})\n`);
    process.exit(2);
  }
  const ageMs = Date.now() - composedMs;
  const isStale = ageMs > FRESHNESS_WINDOW_MS;
  if (isStale && !forceStale) {
    process.stderr.write(
      `approve: sprint file is stale — composed ${Math.round(ageMs / 1000)}s ago (limit ${FRESHNESS_WINDOW_MS / 1000}s). ` +
      `Recompose with cwos-next.js compose, or pass --force-stale to override.\n`
    );
    process.exit(2);
  }

  // FIND-314 fix: intersection-with-done check. SPR-159's anchor was already
  // status:done — approve should never mint a sprint over closed items.
  const itemIdsForCheck = (sprint.items || []).map((it) => it.id);
  const doneIntersect = [];
  try {
    const store = loadStore();
    for (const id of itemIdsForCheck) {
      const q = store.queue.byId(id);
      if (q && q.status === 'done') doneIntersect.push(id);
    }
  } catch (e) { /* store unavailable; skip check rather than block */ }
  if (doneIntersect.length > 0 && !forceStale) {
    process.stderr.write(
      `approve: sprint includes already-done items: ${doneIntersect.join(', ')}. ` +
      `Recompose, or pass --force-stale to override.\n`
    );
    process.exit(2);
  }

  // --force-stale audit-trail event: emit BEFORE sprint_approved so the
  // override is captured even if the subsequent write fails. Non-fatal.
  if (forceStale && (isStale || doneIntersect.length > 0) && appendEvent && ensureCommandId) {
    try {
      appendEvent({
        source_track: 'T6:workstream-rebalance',
        source_tier: aiAutonomous ? 'llm-emission' : 'founder-prompt',
        track_tag: '/next',
        command_id: ensureCommandId('sprint-approve-force-stale'),
        payload: {
          type: 'force_stale_approve',
          sprint_file: sprintFile,
          composed_at: composedAtStr,
          age_ms: ageMs,
          freshness_window_ms: FRESHNESS_WINDOW_MS,
          intersected_done_ids: doneIntersect,
          stale_acknowledged: true,
        },
      });
    } catch (e) {
      process.stderr.write(`approve: force_stale_approve event emission failed (non-fatal): ${e.message}\n`);
    }
  }

  // WS-269 duplicate-sprint block: approve is the mutation boundary, so refuse
  // to mint a second sprint while an active/approved-unexecuted one is open.
  // The gate normally catches this first; this is the backstop for direct
  // approve calls and for concurrent sessions that gated before the other
  // session's approve landed.
  //
  // ADR-067: OWNER-scoped. findResumableSprint with a session id excludes
  // pooled sprints and other sessions' claimed sprints, so a second session
  // approving its own work no longer trips over the first session's sprint —
  // that is the parallelism this release exists to allow. A LEGACY sprint (no
  // dispatch field) still refuses for everyone, which is exactly the WS-269
  // incident shape this backstop was built for.
  const approvingSessionId = (() => {
    try { return resolveSessionId(findWorkstreamDir(process.cwd())); } catch { return null; }
  })();
  let openSprint = null;
  try { openSprint = resolveResumableSprint(loadStore(), approvingSessionId); }
  catch { /* store unavailable; dir scan inside resolveResumableSprint still applies */ }
  if (openSprint && overrideActive == null) {
    process.stderr.write(
      `approve: sprint ${openSprint.id} is ${openSprint.status === 'active' ? 'active' : 'approved but not executed'} — ` +
      `resume it via /next, abandon it, or pass --override-active-sprint "<rationale ≥20 chars>".\n`
    );
    process.exit(2);
  }
  if (openSprint && overrideActive != null && appendEvent && ensureCommandId) {
    try {
      appendEvent({
        source_track: 'T6:workstream-rebalance',
        source_tier: aiAutonomous ? 'llm-emission' : 'founder-prompt',
        track_tag: '/next',
        command_id: ensureCommandId('sprint-approve-override-active'),
        payload: {
          type: 'duplicate_sprint_acknowledged',
          open_sprint_id: openSprint.id,
          open_sprint_status: openSprint.status || null,
          rationale: overrideActive,
          acknowledged_at: approvedAt,
          authorized_by: aiAutonomous ? 'ai-autonomous' : 'founder',
        },
      });
    } catch (e) {
      process.stderr.write(`approve: duplicate_sprint_acknowledged event emission failed (non-fatal): ${e.message}\n`);
    }
  }

  // WS-582: fold the exemption into the sprint before it is rendered. Refuse
  // to record one when the cross-check found nothing to exempt — an exemption
  // over a clean check is noise in the audit trail, and it would flip a
  // `passed` sprint to `exempted` for no reason.
  if (exemptionReason != null) {
    const anti = sprint.anti_goal_check;
    if (!anti || !Array.isArray(anti.matches) || anti.matches.length === 0) {
      process.stderr.write(
        'approve: --exemption-reason requires an anti-goal match to exempt; ' +
        'this sprint\'s anti_goal_check has none. Approve without the flag.\n'
      );
      process.exit(2);
    }
    anti.status = 'exempted';
    anti.exemption_reason = exemptionReason.trim();
  }

  const sprintsDir = path.join(stateDir(), 'sprints');
  if (!fs.existsSync(sprintsDir)) fs.mkdirSync(sprintsDir, { recursive: true });
  // ADR-067: mint through the locked allocator (WS-574 — written for exactly
  // this and never wired here). The raw readdir+max+1 in nextSprintId let two
  // concurrent approves compute the same id, and the second writeFileAtomic
  // silently clobbered the first sprint whole. The writer callback puts the
  // YAML write inside the allocator's lock, so the next scan sees it and the
  // window is closed, not narrowed.
  // ADR-067: the primary sprint carries this session's lease from birth. No
  // session identity -> legacy-shaped sprint (null lease), today's semantics.
  const primaryLease = approvingSessionId
    ? { claimed_by: approvingSessionId, dispatch: 'claimed' }
    : null;
  const mintSprint = (sprintObj, lease) => {
    let mintedId = null;
    let mintedPath = null;
    try {
      const { allocateId } = require('./lib/id-allocator');
      mintedId = allocateId('spr', {
        wsDir: stateDir(),
        writer: (id) => {
          mintedPath = path.join(sprintsDir, `${id}.yaml`);
          writeFileAtomic(mintedPath, renderSprintYaml(id, sprintObj, approvedAt, lease));
        },
      });
    } catch (e) {
      // Degrade to the pre-ADR-067 unlocked path rather than refusing to
      // approve — a missing/failed allocator is a bug to surface, not a gate.
      process.stderr.write(`approve: locked id allocation failed (${e.message}); falling back to unlocked mint\n`);
      mintedId = nextSprintId(sprintsDir);
      mintedPath = path.join(sprintsDir, `${mintedId}.yaml`);
      writeFileAtomic(mintedPath, renderSprintYaml(mintedId, sprintObj, approvedAt, lease));
    }
    return { id: mintedId, path: mintedPath };
  };
  const minted = mintSprint(sprint, primaryLease);
  const sprintId = minted.id;
  const yamlPath = minted.path;

  // Emit sprint_approved event with default-proposal payload (fork-3) +
  // ALTERATION-5 two-field provenance.
  const itemIds = (sprint.items || []).map((it) => it.id);
  const anchorId = itemIds[0] || null;
  const payload = {
    sprint_id: sprintId,
    program_focus: sprint.program_focus || null,
    item_ids: itemIds,
    anchor_id: anchorId,
    anti_goal_check_status: (sprint.anti_goal_check && sprint.anti_goal_check.status) || 'unknown',
    anti_goal_exemption_reason: (sprint.anti_goal_check && sprint.anti_goal_check.exemption_reason) || null,
    authorized_by: aiAutonomous ? 'ai-autonomous' : 'founder',
    composed_by: 'cli-deterministic',
    // WS-1131: which items, and who chose them. A separate field rather than a
    // new composed_by value — ADR-037 fixes composed_by's domain. null = a
    // sidecar from before the field existed (unknown, not assumed ranked).
    composition: sprint.composition || null,
    pinned_items: Array.isArray(sprint.pinned_items) ? sprint.pinned_items : null,
    items_bound: expectItems != null,
    composed_at: sprint.composed_at || approvedAt,
    approved_at: approvedAt,
    // ADR-067: how this sprint is dispatched — claimed (owner-scoped),
    // pooled (awaiting pickup), or legacy (pre-3.24 shape, no lease).
    dispatch: primaryLease ? primaryLease.dispatch : 'legacy',
  };
  let eventId = null;
  if (appendEvent && ensureCommandId) {
    try {
      const commandId = ensureCommandId('sprint-approve');
      const r = appendEvent({
        source_track: 'T6:workstream-rebalance',
        source_tier: aiAutonomous ? 'llm-emission' : 'founder-prompt',
        track_tag: '/next',
        command_id: commandId,
        payload: Object.assign({ type: 'sprint_approved' }, payload),
      });
      if (r && r.ok && r.event) eventId = r.event.id;
    } catch (e) {
      process.stderr.write(`approve: event emission failed (non-fatal): ${e.message}\n`);
    }
  }

  // ADR-067: --with-pool mints each composed parallel batch as its own POOLED
  // sprint — deliberately unclaimed, awaiting any session's `gate --pickup`.
  // WS-529's "approved but unclaimed = failure" reading does not apply here:
  // `dispatch: pooled` is what distinguishes deliberate from failed-to-claim.
  // Each batch takes its own anti-goal pass; a match SKIPS pooling that batch
  // (the exemption flow is a founder conversation and belongs to the primary
  // approval path, not to unattended pool minting).
  const pooledMinted = [];
  if (withPool && Array.isArray(sprint.parallel_batches) && sprint.parallel_batches.length) {
    for (const batch of sprint.parallel_batches) {
      if (!batch || !Array.isArray(batch.items) || !batch.items.length) continue;
      const batchCheckText = [batch.goal].concat(batch.items.map((c) => c.title || c.id)).join('; ');
      const batchAnti = runConstitutionalAuditCheck(batchCheckText);
      if (batchAnti && Array.isArray(batchAnti.matches) && batchAnti.matches.length > 0) {
        process.stderr.write(
          `approve: pooled batch (${batch.program}) SKIPPED — anti-goal check matched ${batchAnti.matches.length} item(s); ` +
          'pool it via a normal compose/approve so the exemption flow applies.\n'
        );
        continue;
      }
      const batchSprint = {
        composed_at: sprint.composed_at || approvedAt,
        composition: 'ranked',
        goal: batch.goal,
        program_focus: batch.program || null,
        override_class: sprint.override_class || null,
        items: batch.items,
        decisions_needed: [],
        anti_goal_check: batchAnti,
        composition_notes: `Pooled batch minted by approve --with-pool alongside ${sprintId} (ADR-067). `
          + `Independence: declared files_involved only, no overlap with the portfolio at compose time.`,
      };
      const mintedBatch = mintSprint(batchSprint, { claimed_by: null, dispatch: 'pooled' });
      pooledMinted.push(mintedBatch.id);
      if (appendEvent && ensureCommandId) {
        try {
          appendEvent({
            source_track: 'T6:workstream-rebalance',
            source_tier: aiAutonomous ? 'llm-emission' : 'founder-prompt',
            track_tag: '/next',
            command_id: ensureCommandId('sprint-approve-pool'),
            payload: {
              type: 'sprint_approved',
              sprint_id: mintedBatch.id,
              program_focus: batch.program || null,
              item_ids: batch.items.map((c) => c.id),
              anchor_id: batch.items[0].id,
              anti_goal_check_status: (batchAnti && batchAnti.status) || 'unknown',
              anti_goal_exemption_reason: null,
              authorized_by: aiAutonomous ? 'ai-autonomous' : 'founder',
              composed_by: 'cli-deterministic',
              // Batches are always compose's ranked residue, even beside a
              // founder-directed primary.
              composition: 'ranked',
              composed_at: sprint.composed_at || approvedAt,
              approved_at: approvedAt,
              dispatch: 'pooled',
            },
          });
        } catch (e) {
          process.stderr.write(`approve: pooled sprint event emission failed (non-fatal): ${e.message}\n`);
        }
      }
    }
  }

  // Sprint-index.yaml is regenerated by the T6 reducer next time it fires.
  // We DO NOT hand-patch state/queue.json here — the event's reducer dispatch (via
  // state-store) re-reads queue/WS-*.yaml. The founder-edited WS files are the
  // editable surface; approve writes the sprint YAML and the reducer materializes
  // downstream.
  //
  // WS-533 lifts the deferral this comment used to record. Per-item claims were left
  // "in the founder-flow (or in next.md prose) until WS-267/268 templated similar
  // patterns" and were then never picked up — so /next's documented promise that
  // approve "claims items" went unimplemented long enough for two concurrent sessions
  // to collide (2026-07-26, and again in claude-poker-tracker on 2026-07-29).
  //
  // Replay-purity is preserved: claimed_by/claimed_at are LEASE state, not derived
  // state. No reducer computes them, nothing downstream reads them to rebuild
  // anything, and re-running the event log reproduces the same queue regardless of
  // their value. The write takes the same per-item lock as the done-path.
  let claimedIds = [];
  try {
    const wsDir = findWorkstreamDir(process.cwd());
    const sessionId = resolveSessionId(wsDir);
    touchSession(wsDir, sessionId);
    claimedIds = claimItems(wsDir, sessionId, itemIds, approvedAt);
  } catch (e) {
    process.stderr.write(`approve: claim write failed (non-fatal): ${e.message}\n`);
  }

  // WS-529: claimItems now reports what LANDED, so a shortfall is real
  // information rather than an artifact. Say it out loud. An approved sprint
  // whose items are not claimed is precisely what let SPR-194 sit for three
  // hours advertising WS-519 and WS-563 to every other session's /next — and
  // the reason nobody noticed is that approve reported success either way.
  const unclaimed = itemIds.filter((id) => !claimedIds.includes(id));
  if (unclaimed.length) {
    process.stderr.write(
      `approve: WARNING — ${unclaimed.length} of ${itemIds.length} item(s) were NOT claimed: ${unclaimed.join(', ')}. ` +
      `Another session may hold them, or the queue file is unwritable. ` +
      `They remain visible to other sessions' /next. Check with: node kit/scripts/cwos-item.js show <id>\n`
    );
  }

  // Every approved sprint becomes a GitHub milestone, pooled ones included.
  // Never fatal: a failure is a WARN line plus github_milestone_error on the
  // sprint, and the approval stands.
  const milestone = syncSprintMilestone('open', sprintId, yamlPath);
  const pooledMilestones = {};
  for (const pid of pooledMinted) {
    pooledMilestones[pid] = syncSprintMilestone('open', pid, path.join(sprintsDir, `${pid}.yaml`));
  }

  writeJson({
    ok: true, sprint_id: sprintId, sprint_path: yamlPath, event_id: eventId, claimed: claimedIds, pooled: pooledMinted,
    github_milestone: milestone, github_milestone_pooled: pooledMilestones, payload,
    // WS-555: what the sprint record does not carry, said rather than silently dropped.
    item_fields_not_recorded: itemFieldsNotRecorded(sprint),
  });
}

function nextSprintId(sprintsDir) {
  let max = 0;
  for (const f of fs.readdirSync(sprintsDir)) {
    const m = f.match(/^SPR-(\d{3,4})\.yaml$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `SPR-${String(max + 1).padStart(3, '0')}`;
}

// WS-555, the approve half. An approved sprint records each item as id, title,
// mode, effort and `status: pending` (renderSprintYaml below), and nothing else.
// That is deliberate: what compose puts on a candidate row (raw_score,
// adjusted_score, source_class, damping factors, context_boost, routing and
// model_lane, ...) is ranking scaffolding for THAT moment, and it stays in the
// compose sidecar (.claude/.tmp-sprint.json) that approve consumed. Freezing it
// into the record would bloat every sprint file and re-render as stale "facts".
// What was wrong was that the drop was silent: a note or commit list a session
// hand-added to the sidecar vanished with exit 0. So approve now names every
// item field it did not record, on stdout (`item_fields_not_recorded`).
// `done` carries everything forward (CLOSED_ITEM_OWNED_KEYS / emitPassthrough).
const APPROVED_ITEM_RECORDED_KEYS = new Set(['id', 'title', 'mode', 'effort']);

/**
 * The item fields an approve-time render leaves out: [{ field, items: [ids] }],
 * sorted by field. `status` is excluded because approve always writes it
 * (as pending) - it is replaced, not lost.
 */
function itemFieldsNotRecorded(sprint) {
  const byField = new Map();
  for (const it of ((sprint && sprint.items) || [])) {
    if (!it || typeof it !== 'object') continue;
    for (const k of Object.keys(it)) {
      if (APPROVED_ITEM_RECORDED_KEYS.has(k) || k === 'status') continue;
      if (it[k] === undefined) continue;
      if (!byField.has(k)) byField.set(k, []);
      byField.get(k).push(it.id || null);
    }
  }
  return [...byField.keys()].sort().map((field) => ({ field, items: byField.get(field) }));
}

function renderSprintYaml(sprintId, sprint, approvedAt, lease = null) {
  // Pragmatic YAML emit — matches the structure of SPR-104.yaml / SPR-105.yaml.
  // Block scalars (|) for goal/composition_notes; quoted scalars elsewhere.
  const out = [];
  out.push(`id: "${sprintId}"`);
  out.push(`title: ${yamlString(sprint.goal.split('\n')[0].slice(0, 100))}`);
  out.push(`status: approved`);
  // ADR-067 lease fields, right after status like item leases. `lease` absent
  // -> a LEGACY-shaped sprint (no dispatch field): resumable by anyone,
  // blocks composition for everyone — the pre-3.24 semantics, kept for
  // callers (and tests) that never learned about dispatch.
  if (lease && lease.dispatch) {
    out.push(`claimed_by: ${lease.claimed_by ? `"${lease.claimed_by}"` : 'null'}`);
    out.push(`claimed_at: ${lease.claimed_by ? `"${approvedAt}"` : 'null'}`);
    out.push(`dispatch: ${lease.dispatch}`);
  }
  out.push(`approved_at: "${approvedAt}"`);
  if (sprint.program_focus) out.push(`program_focus: "${sprint.program_focus}"`);
  if (sprint.override_class) out.push(`override_class: "${sprint.override_class}"`);
  pushCompositionFields(out, sprint);
  out.push(``);
  out.push(...blockScalarLines('goal', sprint.goal));
  out.push(``);
  if (sprint.anti_goal_check) {
    out.push(`anti_goal_check:`);
    out.push(`  status: ${sprint.anti_goal_check.status}`);
    out.push(`  reviewed_at: "${approvedAt}"`);
    // WS-582: the exemption reason is the whole point of status `exempted`.
    // renderSprintYamlClosed already emitted this field; the approve-time
    // renderer never did, so nothing could ever put it there.
    if (sprint.anti_goal_check.exemption_reason) {
      out.push(`  exemption_reason: ${yamlString(sprint.anti_goal_check.exemption_reason)}`);
    }
    if (Array.isArray(sprint.anti_goal_check.matches) && sprint.anti_goal_check.matches.length > 0) {
      out.push(`  matches: ${JSON.stringify(sprint.anti_goal_check.matches)}`);
    } else {
      out.push(`  matches: []`);
    }
    out.push(``);
  }
  if (sprint.composition_notes) {
    out.push(...blockScalarLines('composition_notes', sprint.composition_notes));
    out.push(``);
  }
  out.push(`items:`);
  for (const it of (sprint.items || [])) {
    out.push(`  - id: "${it.id}"`);
    if (it.title) out.push(`    title: ${yamlString(it.title)}`);
    out.push(`    mode: ${it.mode || 'plan-first'}`);
    if (it.effort) out.push(`    effort: ${it.effort}`);
    out.push(`    status: pending`);
  }
  out.push(``);
  if (Array.isArray(sprint.decisions_needed) && sprint.decisions_needed.length > 0) {
    out.push(`decisions_needed:`);
    for (const d of sprint.decisions_needed) out.push(`  - ${yamlString(d)}`);
    out.push(``);
  }
  out.push(`created_at: "${approvedAt}"`);
  out.push(``);
  return out.join('\n');
}

// WS-1131: composition provenance in the sprint record. Shared by the approve
// and close renderers so `done` — which re-renders the whole file — cannot
// erase how the sprint was chosen. Absent on a pre-WS-1131 sidecar: emit
// nothing rather than guess.
function pushCompositionFields(out, sprint) {
  if (!sprint || !sprint.composition) return;
  out.push(`composition: ${sprint.composition}`);
  const pins = Array.isArray(sprint.pinned_items) ? sprint.pinned_items.filter(Boolean) : [];
  if (pins.length) out.push(`pinned_items: [${pins.map((id) => `"${id}"`).join(', ')}]`);
}

function yamlString(s) {
  if (s == null) return '""';
  const str = String(s);
  if (/[:#\n"'{}\[\]&*!|>%@`]/.test(str)) return JSON.stringify(str);
  return `"${str}"`;
}

// Re-render a sprint YAML at closeout. Mirrors renderSprintYaml's structure
// but emits status=done plus completion metadata, and propagates per-item
// status/completed_at fields from the in-memory sprint object (which runDone
// has already mutated for the items it closed).
/**
 * Find the commit that actually closed ONE ticket, or refuse.
 *
 * WS-678 cleanup, 2026-08-27, and it fixes fr-020 ("cwos-next done never stamps" — logged
 * 2026-08-1x and never actioned).
 *
 * This used to be `git rev-parse --short HEAD`, once, stamped onto EVERY item in the
 * sprint. That is not an attribution, it is a timestamp wearing a sha. Measured over the
 * 69 tickets carrying a completion_commit:
 *
 *   - 41 of 69 shared a sha with another ticket; one commit was stamped on SEVEN.
 *   - only 34.8% of recorded values named their own ticket anywhere in the message.
 *
 * The damage is downstream and quiet: `completion_commit` is the field anyone reads to ask
 * "what change closed this?", and two thirds of the time it answered with whatever happened
 * to be checked out. It also made the shipped-ticket detector look far worse than it is —
 * scored against these labels its attribution reads 22.5%, and against the labels that are
 * not HEAD-stamps it reads 69.2%.
 *
 * The rule here matches scripts/detect-shipped-tickets.mjs deliberately: a CLOSING-TYPE
 * conventional commit (fix|feat|perf|refactor) naming the ticket in its SUBJECT. When
 * several qualify it returns null rather than guessing — naming the newest was measured
 * wrong on 5 of 57 there, and a confident wrong attribution is worse than an absent one
 * (`.claude/rules/provenance-or-refuse.md`).
 *
 * @returns {string|null} short sha, or null when the evidence is absent or plural.
 */
function attributeCompletionCommit(wsId) {
  try {
    const r = spawnSync('git', [
      'log', '--no-merges', '--format=%h%x00%s', '--grep', wsId, '-i', '--max-count', '40',
    ], { cwd: repoRoot(), encoding: 'utf8' });
    if (r.status !== 0 || !r.stdout) return null;

    const idLower = String(wsId).toLowerCase();
    const matches = [];
    const NEWLINE = String.fromCharCode(10);
    // NUL is git's %x00 field separator. Built from a char code on purpose: a literal
    // NUL byte in source made six files invisible to every search tool here (c1bb4408).
    const NUL = String.fromCharCode(0);
    for (const line of r.stdout.split(NEWLINE)) {
      if (!line.trim()) continue;
      const [sha, subject] = line.split(NUL);
      if (!sha || !subject) continue;
      const subjLower = subject.toLowerCase();
      // The id must be in the SUBJECT, not merely somewhere in the body that --grep matched.
      if (!subjLower.includes(idLower)) continue;
      // ...and the commit must not be ABOUT a different ticket. Measured 2026-08-27:
      // `fix(ws-614): the corpus ceiling ... had been sitting unused since WS-512` names
      // WS-512 in its subject as HISTORY, and would otherwise have been recorded as the
      // commit that closed WS-512. A conventional scope naming a ticket id is the commit
      // declaring its own subject; anything else in the line is reference.
      const scopeMatch = /^[a-z]+\(([^)]*)\)/.exec(subjLower);
      const scopeText = scopeMatch ? scopeMatch[1] : '';
      const scopeNamesATicket = scopeText.includes('ws-');
      if (scopeNamesATicket && !scopeText.includes(idLower)) continue;
      const conv = /^([a-z]+)\(/.exec(subjLower);
      const type = conv ? conv[1] : null;
      if (!type || !['fix', 'feat', 'perf', 'refactor'].includes(type)) continue;
      matches.push(sha.trim());
    }
    // Singular evidence only. Plural means "several commits could be the closer", and this
    // function does not get to pick one.
    return matches.length === 1 ? matches[0] : null;
  } catch {
    return null;
  }
}

// WS-555: emit one key/value pair the closer does not own, so a re-render never
// drops it. Handles the shapes the repo's YAML parser reads back faithfully:
// scalars, lists, nested maps. Strings that a double-quoted scalar cannot carry
// (newline, quote, backslash - the parser does not decode escapes) go out as
// block scalars instead.
function emitPassthrough(out, indent, key, value) {
  const pad = ' '.repeat(indent);
  const NEEDS_BLOCK = /[\n"\\]/;
  if (value === null || value === undefined) { out.push(`${pad}${key}: null`); return; }
  if (typeof value === 'string') {
    if (NEEDS_BLOCK.test(value)) {
      out.push(...blockScalarLines(key, value, { indent }));
    } else {
      out.push(`${pad}${key}: ${yamlString(value)}`);
    }
    return;
  }
  if (typeof value !== 'object') { out.push(`${pad}${key}: ${value}`); return; }
  if (Array.isArray(value)) {
    if (value.length === 0) { out.push(`${pad}${key}: []`); return; }
    if (value.every((v) => v === null || typeof v !== 'object')) {
      out.push(`${pad}${key}:`);
      for (const v of value) {
        if (typeof v === 'string' && NEEDS_BLOCK.test(v)) {
          out.push(`${pad}  - ${JSON.stringify(v.replace(/\s+/g, ' '))}`);
        } else {
          out.push(`${pad}  - ${v === null ? 'null' : typeof v === 'string' ? yamlString(v) : v}`);
        }
      }
      return;
    }
    out.push(`${pad}${key}: ${JSON.stringify(value)}`);
    return;
  }
  const keys = Object.keys(value);
  if (keys.length === 0) { out.push(`${pad}${key}: {}`); return; }
  out.push(`${pad}${key}:`);
  for (const k of keys) emitPassthrough(out, indent + 2, k, value[k]);
}

const CLOSED_SPRINT_OWNED_KEYS = new Set([
  'id', 'title', 'status', 'approved_at', 'completed_at', 'completed_by_commit',
  'manual_close_note', 'program_focus', 'override_class', 'goal', 'anti_goal_check',
  'composition_notes', 'items', 'decisions_needed', 'created_at',
]);
const CLOSED_ITEM_OWNED_KEYS = new Set(['id', 'title', 'mode', 'effort', 'status', 'completed_at']);

function renderSprintYamlClosed(sprintId, sprint, completedAt, completionCommit) {
  const out = [];
  const title = sprint.title || (sprint.goal ? sprint.goal.split('\n')[0].slice(0, 100) : sprintId);
  out.push(`id: "${sprintId}"`);
  out.push(`title: ${yamlString(title)}`);
  out.push(`status: done`);
  if (sprint.approved_at) out.push(`approved_at: "${sprint.approved_at}"`);
  out.push(`completed_at: "${completedAt}"`);
  if (completionCommit) out.push(`completed_by_commit: "${completionCommit}"`);
  if (sprint.manual_close_note) out.push(`manual_close_note: ${yamlString(sprint.manual_close_note)}`);
  if (sprint.program_focus) out.push(`program_focus: "${sprint.program_focus}"`);
  if (sprint.override_class) out.push(`override_class: "${sprint.override_class}"`);
  pushCompositionFields(out, sprint);
  out.push(``);
  if (sprint.goal) {
    out.push(...blockScalarLines('goal', sprint.goal));
    out.push(``);
  }
  if (sprint.anti_goal_check) {
    out.push(`anti_goal_check:`);
    out.push(`  status: ${sprint.anti_goal_check.status || 'passed'}`);
    if (sprint.anti_goal_check.reviewed_at) out.push(`  reviewed_at: "${sprint.anti_goal_check.reviewed_at}"`);
    if (sprint.anti_goal_check.exemption_reason) {
      out.push(`  exemption_reason: ${yamlString(sprint.anti_goal_check.exemption_reason)}`);
    }
    const matches = Array.isArray(sprint.anti_goal_check.matches) ? sprint.anti_goal_check.matches : [];
    if (matches.length > 0) {
      out.push(`  matches: ${JSON.stringify(matches)}`);
    } else {
      out.push(`  matches: []`);
    }
    out.push(``);
  }
  if (sprint.composition_notes) {
    out.push(...blockScalarLines('composition_notes', sprint.composition_notes));
    out.push(``);
  }
  out.push(`items:`);
  for (const it of (sprint.items || [])) {
    out.push(`  - id: "${it.id}"`);
    if (it.title) out.push(`    title: ${yamlString(it.title)}`);
    if (it.mode) out.push(`    mode: ${it.mode}`);
    if (it.effort) out.push(`    effort: ${it.effort}`);
    out.push(`    status: ${it.status || 'pending'}`);
    if (it.completed_at) out.push(`    completed_at: "${it.completed_at}"`);
    // WS-555: carry every field the closer does not own (commits, note, provenance...).
    for (const k of Object.keys(it)) {
      if (!CLOSED_ITEM_OWNED_KEYS.has(k)) emitPassthrough(out, 4, k, it[k]);
    }
  }
  out.push(``);
  if (Array.isArray(sprint.decisions_needed) && sprint.decisions_needed.length > 0) {
    out.push(`decisions_needed:`);
    for (const d of sprint.decisions_needed) out.push(`  - ${yamlString(d)}`);
    out.push(``);
  }
  if (sprint.created_at) out.push(`created_at: "${sprint.created_at}"`);
  // WS-555: sprint-level fields the closer does not own survive too.
  for (const k of Object.keys(sprint)) {
    if (!CLOSED_SPRINT_OWNED_KEYS.has(k)) emitPassthrough(out, 0, k, sprint[k]);
  }
  out.push(``);
  return out.join('\n');
}

// ─── 5. done ───────────────────────────────────────────────────────────────

function runDone(args) {
  const sprintId = readFlag(args, 'sprint');
  const completedAt = readFlag(args, 'clock') || new Date().toISOString();
  if (!sprintId) {
    process.stderr.write('done: --sprint SPR-NNN is required\n');
    process.exit(2);
  }
  const sprintsDir = path.join(stateDir(), 'sprints');
  const sprintPath = path.join(sprintsDir, `${sprintId}.yaml`);
  if (!fs.existsSync(sprintPath)) {
    process.stderr.write(`done: sprint file not found: ${sprintPath}\n`);
    process.exit(2);
  }

  // WS-1131: the cancel /next always documented and never had. Sessions
  // hand-edited the sprint YAML and sprint-index.yaml to release stale pools,
  // and one invented a nonstandard item status doing it. A flag on `done`, not
  // a sixth subcommand (AS-037-4): abandon is the other way a sprint closes.
  const abandonReason = readFlag(args, 'abandon');
  if (abandonReason == null && hasFlag(args, 'force')) {
    // ADR-063: a flag that would do nothing is refused, not ignored.
    process.stderr.write('done: --force only applies with --abandon\n');
    process.exit(2);
  }
  if (abandonReason != null) {
    if (abandonReason.trim().length < 20) {
      process.stderr.write(`done: --abandon reason must be ≥ 20 characters; got ${abandonReason.trim().length}\n`);
      process.exit(2);
    }
    return abandonSprint(sprintId, sprintPath, abandonReason.trim(), completedAt, hasFlag(args, 'force'));
  }

  const result = {
    ok: true,
    sprint_id: sprintId,
    completed_at: completedAt,
    event_id: null,
    reconcile: null,
    items_closed: [],
    items_skipped_already_done: [],
    items_skipped_user_skipped: [],
  };

  // Read sprint YAML — items + status. ADR-045 / DEC-034: runDone is
  // responsible for per-item closure (writing status=done to each queue YAML
  // AND emitting an item_closed event for each), in addition to the
  // sprint_completed event. The prior contract — "done emits a boundary
  // signal; founder closes items" — silently dropped item_closed events
  // (FIND-131) and made the auto-promotion failsafe in cwos-reconcile.js
  // unreachable. The current contract: event log records every closure
  // by construction; queue YAMLs are kept in sync atomically.
  const sprintRead = readYAMLFile(sprintPath);
  if (!sprintRead.ok || !sprintRead.data) {
    process.stderr.write(`done: sprint YAML unreadable: ${sprintPath}\n`);
    process.exit(2);
  }
  const sprint = sprintRead.data;
  const sprintItems = Array.isArray(sprint.items) ? sprint.items : [];

  // The sprint's closing HEAD. This is a fact about WHEN the sprint closed and it is
  // recorded on the SPRINT. It is deliberately no longer written to individual items —
  // see attributeCompletionCommit above.
  let sprintHeadCommit = null;
  try {
    const r = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: repoRoot(), encoding: 'utf8' });
    if (r.status === 0 && r.stdout) sprintHeadCommit = r.stdout.trim();
  } catch { /* non-fatal */ }
  const completionCommit = sprintHeadCommit;

  // Per-item closure pass. For each item the sprint references that has not
  // already been closed (or explicitly skipped), emit item_closed event then
  // mutate the queue YAML. Event-log-first: the event is the commit point,
  // YAML mutation is the materialized view. Idempotent — re-running done()
  // emits zero new events for already-closed items.
  const queueDir = path.join(stateDir(), 'queue');

  // WS-941 gap 3: inspection gate, checked for EVERY pending item before any
  // item closes — a sprint is closed whole or not at all, so a half-closed
  // sprint can never be the price of one uninspected item. Items that are
  // high/critical (or carry `inspection: required`) need an independent PASS
  // on record; --skip-inspection "<rationale>" waives it and is logged per item.
  {
    const blocked = [];
    const findingOpen = [];
    for (const spItem of sprintItems) {
      if (!spItem || !spItem.id || spItem.status === 'skipped') continue;
      const qp = path.join(queueDir, `${spItem.id}.yaml`);
      if (!fs.existsSync(qp)) continue;
      const qr = readYAMLFile(qp);
      if (!qr.ok || !qr.data) continue;
      if (qr.data.status === 'done' || qr.data.status === 'skipped') continue;
      const g = inspectionGate.gateItem(qr.data);
      if (!g.ok) blocked.push({ id: spItem.id, reason: g.reason });
      // WS-1311: an item raised for a maintenance finding closes only once
      // that finding has (lib/maintenance-finding-gate.js).
      const mg = maintenanceFindingGate.gateMaintenanceItem(qr.data, path.resolve(queueDir, '..', '..', '..'));
      if (!mg.ok) findingOpen.push({ id: spItem.id, finding_id: mg.finding_id, reason: mg.reason });
    }
    if (findingOpen.length) {
      const why = readFlag(args, 'finding-open');
      if (why == null || String(why).trim().length < maintenanceFindingGate.MIN_OVERRIDE_RATIONALE) {
        process.stderr.write(
          `done: ${sprintId} cannot close: ${findingOpen.length} item(s) were raised for maintenance findings that are still open:\n` +
          findingOpen.map((b) => `  - ${b.id}: ${b.reason}\n`).join('') +
          maintenanceFindingGate.refusalHint(findingOpen[0].finding_id) + '\n');
        process.exit(2);
      }
      result.finding_open_override = findingOpen.map((b) => ({ ...b, rationale: String(why).trim() }));
      for (const b of findingOpen) {
        if (appendEvent && ensureCommandId) {
          try {
            appendEvent({
              source_track: 'T6:workstream', source_tier: 'founder-prompt', track_tag: 'finding_open_override',
              command_id: ensureCommandId('finding-open-override'),
              payload: { type: 'finding_open_override', ws_id: b.id, finding_id: b.finding_id, sprint_id: sprintId,
                rationale: String(why).trim(), closure_path: 'cwos-next done' },
            });
          } catch { /* non-fatal */ }
        }
      }
    }
    if (blocked.length) {
      const waiver = readFlag(args, 'skip-inspection');
      if (waiver == null) {
        process.stderr.write(
          `done: ${sprintId} cannot close — ${blocked.length} item(s) need an independent inspection first:\n` +
          blocked.map((b) => `  - ${b.id}: ${b.reason}\n`).join('') +
          inspectionGate.refusalHint(blocked.map((b) => b.id)) + '\n');
        process.exit(2);
      }
      if (String(waiver).trim().length < inspectionGate.MIN_WAIVER_RATIONALE) {
        process.stderr.write(`done: --skip-inspection rationale must be at least ${inspectionGate.MIN_WAIVER_RATIONALE} chars\n`);
        process.exit(2);
      }
      result.inspection_waived = [];
      for (const b of blocked) {
        if (appendEvent && ensureCommandId) {
          try {
            appendEvent({
              source_track: 'T6:workstream',
              source_tier: 'founder-prompt',
              track_tag: 'inspection_waived',
              command_id: ensureCommandId('inspection-waived'),
              payload: {
                type: 'inspection_waived', ws_id: b.id, sprint_id: sprintId,
                rationale: String(waiver).trim(), reason: b.reason, closure_path: 'cwos-next done',
              },
            });
          } catch { /* non-fatal */ }
        }
        result.inspection_waived.push(b.id);
      }
    }
  }

  for (const spItem of sprintItems) {
    if (!spItem || !spItem.id) continue;
    if (!/^WS-\d+$/.test(spItem.id)) continue;
    if (spItem.status === 'skipped') {
      result.items_skipped_user_skipped.push(spItem.id);
      continue;
    }
    const queuePath = path.join(queueDir, `${spItem.id}.yaml`);
    if (!fs.existsSync(queuePath)) continue;
    const qRead = readYAMLFile(queuePath);
    if (!qRead.ok || !qRead.data) continue;
    const qStatus = qRead.data.status;
    if (qStatus === 'done' || qStatus === 'skipped') {
      result.items_skipped_already_done.push(spItem.id);
      continue;
    }

    // Emit item_closed event FIRST (event-log is commit point per
    // core/rebalance.js convention). If the YAML write below fails, the next
    // cwos-reconcile run promotes it via promoteStaleQueueItemsFromSprints
    // (defense-in-depth). Track is T6:workstream so the workstream + sprints
    // reducers re-materialize state/*.json automatically.
    // Per ITEM, not per sprint. Null when the evidence is absent or plural — an absent
    // attribution is a readable gap; a wrong one is a false record.
    const itemCommit = attributeCompletionCommit(spItem.id);

    let itemEventId = null;
    if (appendEvent && ensureCommandId) {
      try {
        const commandId = ensureCommandId('item-closed');
        const r = appendEvent({
          source_track: 'T6:workstream',
          source_tier: 'founder-prompt',
          track_tag: 'item_closed',
          command_id: commandId,
          payload: {
            type: 'item_closed',
            ws_id: spItem.id,
            sprint_id: sprintId,
            completed_at: completedAt,
            completion_commit: itemCommit,
            sprint_head_commit: sprintHeadCommit,
          },
        });
        if (r && r.ok && r.event) itemEventId = r.event.id;
      } catch (e) { /* non-fatal */ }
    }

    // Mutate the queue YAML in place — preserve hand-edited content
    // (description, accept_criteria, completion_notes) by regex-replacing
    // only the status field and appending closure metadata. Mirrors the
    // pattern in cwos-reconcile.js promoteStaleQueueItemsFromSprints.
    // WS-311: lock per-item to serialize against concurrent reconcile
    // patches at cwos-reconcile.js:315 and :813.
    try {
      withFileLock(queuePath + '.lock', () => {
        const raw = fs.readFileSync(queuePath, 'utf8');
        let patched = raw.replace(/^status:\s*.*$/m, `status: done`);
        // WS-561: these three used to test `!/^key:/m` — key PRESENCE, not
        // value. An item scaffolding `completed_at: null` while open matched,
        // so the write no-opped and `done` reported ok. upsertYAMLScalarField
        // fills absent-or-null and leaves a real value alone.
        patched = upsertYAMLScalarField(patched, 'completed_at', completedAt, { after: 'status' }).content;
        if (itemCommit) {
          patched = upsertYAMLScalarField(patched, 'completion_commit', itemCommit, { after: 'completed_at' }).content;
          // WHERE the value came from, carried with it. Without this, any instrument that
          // scores attribution against these labels is scoring a rule against its own
          // output and will trend to 100% while measuring nothing -- the WS-291 mechanism,
          // pointed at the tool built to detect it. claude-poker-tracker's
          // detectShippedTicketsRecall.test.js excludes `attributed` labels for exactly this.
          patched = upsertYAMLScalarField(patched, 'completion_commit_source', 'attributed', { after: 'completion_commit' }).content;
        }
        if (itemEventId) {
          patched = upsertYAMLScalarField(patched, 'closed_by_event', itemEventId).content;
        }
        writeFileAtomic(queuePath, patched);
      }, { ownerLabel: 'next:done', maxWaitMs: 5000 });
    } catch (e) {
      // Write failure is non-fatal — the item_closed event is already in the
      // log, so the next reconcile run will catch up via the event-log
      // drift detector (validateStateDrift, ADR-045).
    }

    // Mirror the closure into the sprint YAML's items list (so the sprints
    // reducer's items_done counter advances, and so promoteStaleQueueItemsFromSprints
    // sees a matching done state for any future repair pass).
    spItem.status = 'done';
    if (!spItem.completed_at) spItem.completed_at = completedAt;

    result.items_closed.push({ ws_id: spItem.id, event_id: itemEventId });

    // Closure side effects — auto-resolved calibration (WS-310 Phase C) and
    // the friction resolution announce (WS-581) — live in lib/item-closure.js
    // so the sprint path here and cwos-item.js's standalone close cannot drift
    // apart (WS-665). Both are best-effort: the item_closed event above is the
    // commit point, and a thank-you note must never block a closure.
    const sideEffects = runClosureSideEffects({
      repoRoot: repoRoot(),
      queueData: qRead.data,
      wsId: spItem.id,
      sprintId,
      completedAt,
      completionCommit,
      onWarn: (msg) => process.stderr.write(`done: ${msg}\n`),
    });
    if (sideEffects.auto_resolved) {
      if (!result.auto_resolved_writes) result.auto_resolved_writes = [];
      result.auto_resolved_writes.push(sideEffects.auto_resolved);
    }
    if (sideEffects.friction_announce) {
      if (!result.friction_announces) result.friction_announces = [];
      result.friction_announces.push(sideEffects.friction_announce);
    }
  }

  // Persist sprint YAML — status=done + completed_at + completed_by_commit +
  // items[].status updates. Re-render via renderSprintYamlClosed (preserves
  // structure of approve-time render but flips status + adds completion fields).
  try {
    const closedYaml = renderSprintYamlClosed(sprintId, sprint, completedAt, completionCommit);
    writeFileAtomic(sprintPath, closedYaml);
  } catch (e) {
    result.sprint_yaml_write_error = e.message;
  }

  // The sprint's GitHub milestone closes with it, once the closed record is
  // on disk: a sprint whose YAML did not land is not closed.
  if (!result.sprint_yaml_write_error) {
    result.github_milestone = syncSprintMilestone('close', sprintId, sprintPath);
  }

  // Emit sprint_completed event (boundary signal preserved). Track stays at
  // T6:workstream-rebalance to match the historical schema for this event
  // type — schema lookup is tolerant for this track (events.js
  // _resolveSchemaLookup), so no schema migration is required.
  if (appendEvent && ensureCommandId) {
    try {
      const commandId = ensureCommandId('sprint-done');
      const r = appendEvent({
        source_track: 'T6:workstream-rebalance',
        source_tier: 'founder-prompt',
        track_tag: '/next',
        command_id: commandId,
        payload: {
          type: 'sprint_completed',
          sprint_id: sprintId,
          completed_at: completedAt,
          completion_commit: completionCommit,
          items_closed: result.items_closed.map((i) => i.ws_id),
          composed_by: 'cli-deterministic',
        },
      });
      if (r && r.ok && r.event) result.event_id = r.event.id;
    } catch (e) { /* non-fatal */ }
  }

  // WS-533: a closed item releases its lease. Without this the queue accretes claims
  // that outlive the session that took them, and the first stale hold teaches everyone
  // to ignore the conflict warning — which is worse than never having had one.
  try {
    releaseItems(findWorkstreamDir(process.cwd()), result.items_closed.map((i) => i.ws_id));
  } catch (e) {
    process.stderr.write(`done: claim release failed (non-fatal): ${e.message}\n`);
  }

  // Health recompute using the canonical formula. Iterates over programs
  // referenced by the sprint's items. TODO(WS-267): replace with cwos-pulse
  // compute-health when that CLI lands.
  if (computeHealthScore) {
    try {
      const programsDir = path.join(stateDir(), 'programs');
      const findingsPath = path.join(stateDir(), 'findings-index.yaml');
      let findingsIndex = [];
      if (fs.existsSync(findingsPath)) {
        const fr = readYAMLFile(findingsPath);
        if (fr.ok && fr.data && Array.isArray(fr.data.findings)) findingsIndex = fr.data.findings;
      }
      // Collect program-ids from the sprint's items (read sprint YAML).
      const sr = readYAMLFile(sprintPath);
      const programs = new Set();
      if (sr.ok && sr.data && sr.data.program_focus) programs.add(sr.data.program_focus);
      const updates = [];
      const todayISOdate = (completedAt || '').slice(0, 10);
      for (const pid of programs) {
        const pf = path.join(programsDir, `prog-${pid}.yaml`);
        if (!fs.existsSync(pf)) continue;
        const r = readYAMLFile(pf);
        if (!r.ok || !r.data) continue;
        const score = computeHealthScore(r.data, findingsIndex, todayISOdate);
        updates.push({ program: pid, recomputed_score: score });
      }
      result.health_recompute = updates;
    } catch (e) { result.health_recompute = { error: e.message }; }
  }

  // Run cwos-reconcile --quiet (subprocess; mirrors how /next prose did it).
  try {
    const r = spawnSync(process.execPath, [path.join(__dirname, 'cwos-reconcile.js'), '--quiet'], { encoding: 'utf8' });
    result.reconcile = { exit: r.status, stderr: (r.stderr || '').trim() || null };
    if (r.status !== 0) {
      writeJson(result);
      process.exit(1);
    }
  } catch (e) {
    result.reconcile = { error: e.message };
  }

  writeJson(result);
}

// ─── 5b. done --abandon (WS-1131) ─────────────────────────────────────────
//
// Abandon closes a sprint WITHOUT closing its work: done items stay done, open
// items lose their claim and return to the eligible set, and no `item_closed`
// is emitted for anything. The sprint YAML is PATCHED, not re-rendered, so the
// record keeps everything it already said (lease fields, item statuses,
// composition provenance) and gains only the abandonment.
//
// Collision posture, which is the founder's priority: abandoning a sprint
// another LIVE session holds — its lease, or a claim on any open item — would
// pull work out from under a peer mid-edit, so it refuses unless --force.
// Unknown liveness counts as live, same as findPooledSprints.

// "A session was working this" — returned to backlog. blocked/deferred are
// parked on purpose and keep their status; only the claim is released.
const WORKING_ITEM_STATUSES = new Set(['in-progress', 'in_progress', 'claimed', 'active']);

// Replace a top-level scalar line, or insert it after `afterKey`. The value is
// pre-rendered so a reason string goes through yamlString's quoting.
function setTopLevelScalar(text, key, rendered, afterKey) {
  const re = new RegExp(`^${key}:.*$`, 'm');
  if (re.test(text)) return text.replace(re, () => `${key}: ${rendered}`);
  const anchor = new RegExp(`^${afterKey}:.*$`, 'm');
  if (anchor.test(text)) return text.replace(anchor, (m) => `${m}\n${key}: ${rendered}`);
  return text.replace(/\s*$/, '') + `\n${key}: ${rendered}\n`;
}

// ─── GitHub milestone sync (founder decision 2026-10-31) ───────────────────
//
// op 'open' (approve) creates or adopts the sprint's milestone; op 'close'
// (done, done --abandon) closes it. The outcome lands on the sprint YAML:
// `github_milestone: <number>` on success, `github_milestone_error: "<reason>"`
// on failure, with one `WARN github-milestone:` line on stderr. It never
// throws and never changes the sprint operation's exit code.
function syncSprintMilestone(op, sprintId, sprintPath, { abandonReason = null } = {}) {
  let outcome;
  try {
    const sr = readYAMLFile(sprintPath);
    if (!sr.ok || !sr.data) {
      outcome = { error: `sprint YAML unreadable: ${sprintPath}` };
    } else if (op === 'open') {
      outcome = githubMilestone.ensureMilestone({ sprintId, sprint: sr.data, cwd: repoRoot() });
    } else {
      outcome = githubMilestone.closeMilestone({ sprint: sr.data, cwd: repoRoot(), abandonReason });
    }
  } catch (e) {
    outcome = { error: `internal error: ${e.message}` };
  }
  if (outcome.action === 'skipped') return outcome;
  if (outcome.error) {
    outcome.error = githubMilestone.oneLine(outcome.error);
    process.stderr.write(`WARN github-milestone: ${sprintId}: ${outcome.error}\n`);
  }
  try {
    withFileLock(sprintPath + '.lock', () => {
      const raw = fs.readFileSync(sprintPath, 'utf8');
      let text = raw;
      if (outcome.number) text = setTopLevelScalar(text, 'github_milestone', String(outcome.number), 'approved_at');
      if (outcome.error) {
        text = setTopLevelScalar(text, 'github_milestone_error', yamlString(outcome.error), 'approved_at');
      } else {
        // A success clears an earlier attempt's error: the record says what is true now.
        text = text.replace(/^github_milestone_error:.*(\r?\n|$)/m, '');
      }
      if (text !== raw) writeFileAtomic(sprintPath, text);
    }, { ownerLabel: 'next:github-milestone', maxWaitMs: 5000 });
  } catch (e) {
    outcome.record_error = e.message;
    process.stderr.write(`WARN github-milestone: ${sprintId}: could not record the outcome in ${sprintPath}: ${e.message}\n`);
  }
  return outcome;
}

function liveOtherHolder(wsDir, holder, me, claimedAt) {
  if (!holder || holder === me) return false;
  try { return isSessionLive(wsDir, holder, undefined, undefined, { claimedAt: claimedAt || undefined }); }
  catch { return true; }
}

function abandonSprint(sprintId, sprintPath, reason, abandonedAt, force) {
  const wsDir = stateDir();
  const sr = readYAMLFile(sprintPath);
  if (!sr.ok || !sr.data) {
    process.stderr.write(`done: sprint YAML unreadable: ${sprintPath}\n`);
    process.exit(2);
  }
  const sprint = sr.data;
  const status = String(sprint.status || '');

  // Idempotent: the second abandon of a sprint is a no-op success — no event,
  // no writes — so a retried command can never double-release or re-stamp.
  if (status === 'abandoned') {
    writeJson({
      ok: true, sprint_id: sprintId, status: 'abandoned', already_abandoned: true,
      abandoned_at: sprint.abandoned_at || null, event_id: null, items_released: [],
    });
    return;
  }
  // A finished sprint has nothing to cancel, and stamping it abandoned would
  // rewrite what happened.
  if (status === 'done' || status === 'completed') {
    writeJson({ ok: false, reason: 'sprint_already_closed', sprint_id: sprintId, status });
    process.exit(1);
  }

  let me = null;
  try { me = resolveSessionId(wsDir); } catch { /* abandoned_by stays null */ }

  const statusOf = makeItemStatusLookup(null);
  const sprintItems = (Array.isArray(sprint.items) ? sprint.items : []).filter((it) => it && it.id);
  const openIds = [];
  const closedIds = [];
  for (const it of sprintItems) (itemIsClosed(statusOf(it.id)) ? closedIds : openIds).push(it.id);

  const queuePathOf = (id) => path.join(wsDir, 'queue', `${id}.yaml`);
  const holders = [];
  if (liveOtherHolder(wsDir, sprint.claimed_by, me, sprint.claimed_at || sprint.approved_at)) {
    holders.push({ scope: 'sprint', session: sprint.claimed_by });
  }
  for (const id of openIds) {
    const c = readClaim(queuePathOf(id));
    if (c && liveOtherHolder(wsDir, c.claimedBy, me, c.claimedAt)) holders.push({ scope: 'item', id, session: c.claimedBy });
  }
  if (holders.length && !force) {
    writeJson({
      ok: false, reason: 'held_by_live_session', sprint_id: sprintId, holders,
      hint: 'Nothing was written. Another live session is working this sprint; leave it, or pass --force once the founder has decided to take it back.',
    });
    process.exit(1);
  }

  // The sprint record. Under the same lock claimSprintLease takes, with the
  // lease re-checked inside it: a pickup can land between the read above and
  // this write, and abandoning a sprint a peer has just adopted is the exact
  // collision this refuses.
  let lostRace = null;
  try {
    withFileLock(sprintPath + '.lock', () => {
      let text = fs.readFileSync(sprintPath, 'utf8');
      const nowHolder = ((text.match(/^claimed_by:\s*"?([^"\n]*)"?\s*$/m) || [])[1] || '').trim();
      const nowAt = ((text.match(/^claimed_at:\s*"?([^"\n]*)"?\s*$/m) || [])[1] || '').trim();
      if (!force && nowHolder && nowHolder !== 'null' && nowHolder !== String(sprint.claimed_by || '')
          && liveOtherHolder(wsDir, nowHolder, me, nowAt)) {
        lostRace = nowHolder;
        return;
      }
      text = text.replace(/^status:\s*.*$/m, 'status: abandoned');
      text = setTopLevelScalar(text, 'abandoned_at', `"${abandonedAt}"`, 'status');
      text = setTopLevelScalar(text, 'abandoned_reason', yamlString(reason), 'abandoned_at');
      text = setTopLevelScalar(text, 'abandoned_by', me ? `"${me}"` : 'null', 'abandoned_reason');
      // completed_at is set too, and that is deliberate. Every "is this sprint
      // still open?" reader in this file (findResumableSprint,
      // findPooledSprints, buildEligibilityFilter, phantom detection) treats
      // completed_at as closed, and cwos-gc archives `abandoned` sprints by
      // aging completed_at — without it an abandoned sprint is never archived.
      // Filled only when unset: a stamp already there is history.
      text = upsertYAMLScalarField(text, 'completed_at', abandonedAt, { after: 'abandoned_by' }).content;
      writeFileAtomic(sprintPath, text);
    }, { ownerLabel: 'next:abandon', maxWaitMs: 5000 });
  } catch (e) {
    process.stderr.write(`done: could not write ${sprintPath}: ${e.message}\n`);
    process.exit(2);
  }
  if (lostRace) {
    writeJson({
      ok: false, reason: 'held_by_live_session', sprint_id: sprintId,
      holders: [{ scope: 'sprint', session: lostRace }],
      hint: 'Nothing was written. A live session picked this sprint up while it was being abandoned.',
    });
    process.exit(1);
  }

  // The work goes back. Status first (working → backlog, a stale sprint_id
  // pointer cleared), then the claim through the claims library so the
  // release is attributed (released_by) exactly as a closing item's is.
  const returnedToBacklog = [];
  const released = [];
  for (const id of openIds) {
    const qp = queuePathOf(id);
    if (!fs.existsSync(qp)) continue;
    try {
      withFileLock(qp + '.lock', () => {
        const raw = fs.readFileSync(qp, 'utf8');
        let text = raw;
        const st = (text.match(/^status:\s*"?([^"\s]+)"?/m) || [])[1] || '';
        if (WORKING_ITEM_STATUSES.has(st)) {
          text = text.replace(/^status:\s*.*$/m, 'status: backlog');
          returnedToBacklog.push(id);
        }
        const sid = ((text.match(/^sprint_id:\s*"?([^"\n]*)"?\s*$/m) || [])[1] || '').trim();
        if (sid === sprintId) text = text.replace(/^sprint_id:.*$/m, 'sprint_id: null');
        if (text !== raw) writeFileAtomic(qp, text);
      }, { ownerLabel: 'next:abandon', maxWaitMs: 5000 });
    } catch (e) {
      process.stderr.write(`done: could not return ${id} to backlog (non-fatal): ${e.message}\n`);
    }
    released.push(id);
  }
  try { releaseItems(wsDir, released); }
  catch (e) { process.stderr.write(`done: claim release failed (non-fatal): ${e.message}\n`); }

  // Close the sprint's GitHub milestone and say why on it.
  const abandonMilestone = syncSprintMilestone('close', sprintId, sprintPath, { abandonReason: reason });

  const result = {
    ok: true,
    sprint_id: sprintId,
    status: 'abandoned',
    abandoned_at: abandonedAt,
    abandoned_by: me,
    reason,
    event_id: null,
    items_released: released,
    items_returned_to_backlog: returnedToBacklog,
    items_already_closed: closedIds,
    forced_over: force ? holders : [],
    github_milestone: abandonMilestone,
    reconcile: null,
  };

  // One boundary event, the sibling of sprint_completed: same track, same tag.
  if (appendEvent && ensureCommandId) {
    try {
      const r = appendEvent({
        source_track: 'T6:workstream-rebalance',
        source_tier: 'founder-prompt',
        track_tag: '/next',
        command_id: ensureCommandId('sprint-abandon'),
        payload: {
          type: 'sprint_abandoned',
          sprint_id: sprintId,
          abandoned_at: abandonedAt,
          abandoned_by: me,
          reason,
          items_released: released,
          items_already_closed: closedIds,
          forced: !!(force && holders.length),
          forced_over: force ? holders : [],
          composed_by: 'cli-deterministic',
        },
      });
      if (r && r.ok && r.event) result.event_id = r.event.id;
    } catch (e) {
      process.stderr.write(`done: sprint_abandoned event emission failed (non-fatal): ${e.message}\n`);
    }
  }

  // sprint-index.yaml and state/*.json refresh exactly as the close path does.
  try {
    const r = spawnSync(process.execPath, [path.join(__dirname, 'cwos-reconcile.js'), '--quiet'], { encoding: 'utf8' });
    result.reconcile = { exit: r.status, stderr: (r.stderr || '').trim() || null };
    if (r.status !== 0) {
      writeJson(result);
      process.exit(1);
    }
  } catch (e) {
    result.reconcile = { error: e.message };
  }

  writeJson(result);
}

// ─── Dispatch ──────────────────────────────────────────────────────────────

// ─── ADR-063: an unrecognized flag is fatal, never silently ignored ─────────
//
// Every flag below is one this file actually READS. That is the whole point:
// until now `cwos-next` ignored anything it did not recognise and ran anyway,
// exit 0, so `candidates --limit 30 --json` reported success while --json did
// nothing, and `--limit=30` silently fell back to the default because readFlag
// only understands the space form. A caller cannot tell that from a flag that
// worked. The measured cousin of this is in CLAUDE.md: `cwos-verify --quick`
// silently ran the full ~10-minute suite instead of the --fast-mode tier that
// already existed.
//
// `true` = the flag takes a value. Keep this map in step with the readFlag /
// hasFlag calls in each runX function; __tests__/next-cli-contract.test.js
// fails if they drift apart, so this cannot rot into a lie.
const SUBCOMMAND_FLAGS = {
  gate: {
    'human': false,
    'json': false,
    'override-token-budget': true,
    'override-read-restraint': true,
    'override-cross-branch-drift': true,
    'override-stale-protocol': true,
    'override-checkout-shared': true,
    'pickup': false,
    'pickup-sprint': true,
  },
  candidates: { 'limit': true, 'json': false, 'human': false, 'slate': false },
  compose: { 'human': false, 'json': false, 'candidates-file': true, 'goal': true, 'clock': true, 'items': true },
  approve: {
    'sprint-file': true,
    'exemption-reason': true,
    'override-active-sprint': true,
    'force-stale': false,
    'ai-autonomous': false,
    'with-pool': false,
    'clock': true,
    'expect-items': true,
    'expect-pool': true,
  },
  done: { 'sprint': true, 'clock': true, 'skip-inspection': true, 'finding-open': true, 'abandon': true, 'force': false },
  'allocate-ws-id': { 'kind': true },
};

// `--json` is the default on the subcommands that accept it. It is taken
// explicitly rather than rejected because it is the fleet-wide convention, it
// is what a session will type, and it already describes what happens -- while
// refusing it would break `gate --json` for no gain.
const NO_OP_FLAGS = new Set(['json']);

function flagList(spec) {
  return Object.keys(spec).sort()
    .map((f) => (spec[f] ? `--${f} <value>` : `--${f}`))
    .map((n) => `  ${n}`).join('\n');
}

function flagFatal(sub, message, spec) {
  process.stderr.write(
    `cwos-next ${sub}: ${message}\n\n` +
    `valid flags for \`${sub}\`:\n` +
    flagList(spec) + '\n\n' +
    `run \`cwos-next --help\` for the full contract\n`
  );
  process.exit(2);
}

// WS-676: `<sub> --help` is a request, not a mistake. It used to fall through
// to the unrecognized-flag refusal: the right flags were printed, but on stderr
// with exit 2, so a caller following ADR-063 ("--help answers, exit 0") read it
// as a failure. It now prints the same flag block on stdout and exits 0, before
// the subcommand does anything.
function subcommandHelp(sub, spec) {
  process.stdout.write(
    `usage: cwos-next ${sub} [options]\n\n` +
    `flags for \`${sub}\`:\n` +
    flagList(spec) + '\n\n' +
    `run \`cwos-next --help\` for what each flag does\n`
  );
  process.exit(0);
}

function validateFlags(sub, argv) {
  const spec = SUBCOMMAND_FLAGS[sub];
  if (!spec) return; // unknown subcommand is already fatal in main()
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    // In flag position only: a value consumed below (i++) never reaches here.
    if (a === '--help' || a === '-h') subcommandHelp(sub, spec);
    if (typeof a !== 'string' || !a.startsWith('--')) continue;
    const eq = a.indexOf('=');
    const name = eq === -1 ? a.slice(2) : a.slice(2, eq);
    if (!Object.prototype.hasOwnProperty.call(spec, name)) {
      flagFatal(sub, `unrecognized flag "${a}"`, spec);
    }
    if (eq !== -1) {
      // readFlag() resolves `--name value` by index and cannot see an `=`
      // form, so accepting this would silently apply the default instead --
      // the same silent-ignore this check exists to end. The one exception is
      // --override-stale-protocol, which parses both forms itself.
      if (name !== 'override-stale-protocol') {
        flagFatal(sub, `"${a}" uses --flag=value, which this command does not parse; write \`--${name} <value>\``, spec);
      }
      continue;
    }
    if (spec[name] && !NO_OP_FLAGS.has(name)) {
      const next = argv[i + 1];
      if (next === undefined || (typeof next === 'string' && next.startsWith('--'))) {
        flagFatal(sub, `"--${name}" requires a value`, spec);
      }
      i++; // consume the value, so a value is never mistaken for a flag
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const sub = args[0];
  if (!sub || sub === '--help' || sub === '-h') {
    process.stdout.write(
      'usage: cwos-next <gate|candidates|compose|approve|done|allocate-ws-id> [options]\n' +
      '\n' +
      'subcommands:\n' +
      '  gate            check for an active sprint, blocks, drift and claim conflicts\n' +
      '  candidates      ranked backlog candidates (JSON)\n' +
      '  compose         compose a sprint; --human renders the preview\n' +
      '  approve         write the sprint YAML and claim its items\n' +
      '  done            close a sprint and its items\n' +
      '  allocate-ws-id  allocate an id, reserving it so the next call differs\n' +
      '\n' +
      'gate options:\n' +
      '  --human                        render text instead of JSON\n' +
      '  --override-token-budget "<rationale>"        accept a budget regression (≥20 chars)\n' +
      '  --override-cross-branch-drift "<rationale>"  accept item_closed_on_unmerged_ref\n' +
      '        drift (≥20 chars). WS-694: an item was closed by an event that exists\n' +
      '        only on a ref not merged into HEAD. Waiving it says that ref is not\n' +
      '        authority -- it does NOT close the item. Emits\n' +
      '        cross_branch_drift_acknowledged; per-invocation only.\n' +
      '  --override-stale-protocol "<prog>:<proto>:<rationale>"  (≥30 chars)\n' +
      '  --override-read-restraint "<rationale>"      (≥20 chars)\n' +
      '  --override-checkout-shared "<rationale>"     (≥20 chars) accept working in a\n' +
      '        checkout a live peer also occupies (WS-736). Emits\n' +
      '        checkout_shared_acknowledged; per-invocation only.\n' +
      '  --pickup                       ADR-067: adopt the top POOLED sprint for this\n' +
      '        session (lease + item claims), instead of composing fresh work.\n' +
      '  --pickup-sprint <SPR-NNN>      adopt that named pooled sprint only; reports\n' +
      '        pickup.reason not-in-pool | contended rather than taking another.\n' +
      '\n' +
      'compose options:\n' +
      '  --human                        render the founder preview instead of JSON\n' +
      '  --items <WS-A,WS-B,...>        WS-1131: founder-directed — the primary sprint is\n' +
      '        exactly these ids, in this order (ranking and continuity fill skipped).\n' +
      '        Every id must pass the shared eligibility filter; any that does not\n' +
      '        refuses the whole compose (exit 1, JSON naming each id and why).\n' +
      '        Recorded as composition: founder-directed + pinned_items.\n' +
      '  --goal "<text>"                founder-supplied goal\n' +
      '  --candidates-file <path>       compose from this candidates JSON\n' +
      '\n' +
      'approve options:\n' +
      '  --sprint-file <path>           compose output JSON (required)\n' +
      '  --exemption-reason "<text>"    /next Step 4a option 4 — accept a matched\n' +
      '        anti-goal on the record. Sets anti_goal_check.status to `exempted`\n' +
      '        and writes the reason into the sprint YAML, which is what INV-038\n' +
      '        reads. Rationale must be ≥ 20 characters (WS-582).\n' +
      '  --override-active-sprint "<rationale>"  mint over an open sprint (≥20 chars)\n' +
      '  --force-stale                  approve a stale compose file anyway\n' +
      '  --ai-autonomous                attribute authorization to the agent\n' +
      '  --with-pool                    ADR-067: also mint the composed parallel\n' +
      '        batches as POOLED sprints awaiting any session\'s gate --pickup\n' +
      '  --expect-items <WS-A,WS-B>     WS-1131: bind the approval to the items the\n' +
      '        founder saw. If the sprint file\'s primary items differ (as a set),\n' +
      '        refuse with exit 1 and write nothing.\n' +
      '  --expect-pool <WS-C,...|none>  same binding for the parallel batches\' items\n' +
      '\n' +
      'GitHub milestones (approve / done / done --abandon):\n' +
      '  Each approved sprint gets a milestone "SPR-NNN: <title>" on the origin repo\n' +
      '  (description ends with "Sprint: SPR-NNN" and "Items: WS-1, WS-2"), recorded\n' +
      '  as github_milestone; done closes it, --abandon closes it with the reason.\n' +
      '  Failures never block: one WARN line + github_milestone_error on the sprint.\n' +
      '  CWOS_NO_GITHUB_MILESTONE=1 turns it off.\n' +
      '\n' +
      'done options:\n' +
      '  --sprint <SPR-NNN>             the sprint to close (required)\n' +
      '  --skip-inspection "<rationale>"  waive the WS-941 inspection gate\n' +
      '  --abandon "<reason>"           WS-1131: cancel instead of close (≥20 chars).\n' +
      '        status: abandoned + abandoned_at/_reason/_by; done items stay done;\n' +
      '        open items lose their claim and return to backlog; no item_closed;\n' +
      '        emits sprint_abandoned. Re-abandoning is a no-op success. Refuses a\n' +
      '        sprint a LIVE other session holds (lease or item claim).\n' +
      '  --force                        with --abandon: abandon over a live holder\n' +
      '\n' +
      'allocate-ws-id options:\n' +
      '  --kind <ws|spr|find|inv|adr>   which id kind (default: ws)\n' +
      '        ws/spr/find scan workstream state; inv/adr scan the repo tree.\n' +
      '        The returned id is reserved for 24h, so consecutive calls never\n' +
      '        collide even when no file is written between them (WS-574).\n'
    );
    process.exit(sub ? 0 : 1);
  }
  validateFlags(sub, args.slice(1));
  try {
    switch (sub) {
      case 'gate':       return runGate(args.slice(1));
      case 'candidates': return runCandidates(args.slice(1));
      case 'compose':    return runCompose(args.slice(1));
      case 'approve':    return runApprove(args.slice(1));
      case 'done':       return runDone(args.slice(1));
      case 'allocate-ws-id': return runAllocateWsId(args.slice(1));
      default:
        process.stderr.write(`cwos-next: unknown subcommand: ${sub}\n`);
        process.exit(2);
    }
  } catch (err) {
    // Final safety net — AS-23: do not break invoking commands on
    // unexpected internal errors. Surface to stderr; exit non-fatal.
    process.stderr.write(`cwos-next: ${err.message}\n${err.stack || ''}\n`);
    process.exit(0);
  }
}

// WS-040: deterministic WS-id allocation. Engine/AI synthesis flows MUST call this
// instead of eyeballing the active-queue max — the lib scans queue/ + queue/archive/ +
// queue-index.yaml, so it never re-issues a retired (archived) id. Re-issuing an id
// that still lives in queue/archive/ and in a done sprint is what let reconcile
// force-complete a brand-new item (the SPR-018 incident). Output is JSON:
//   { "ok": true, "ws_id": "WS-041" }
// WS-574: this returned the same id on every consecutive call, because it took
// the unlocked scan path and reserved nothing — so until a file existed at the
// returned id, the next caller got it again. It now reserves what it returns.
// `--kind` extends the same guarantee to SPR, FIND, INV and ADR ids, which
// previously had no allocator at all (two sessions both allocated INV-067 on
// 2026-08-03; the collision was caught by hand during a rebase).
function runAllocateWsId(argv = []) {
  const ws = findWorkstreamDir(process.cwd());

  let kind = 'ws';
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--kind') { kind = String(argv[i + 1] || '').toLowerCase(); i++; }
    else if (argv[i].startsWith('--kind=')) kind = argv[i].slice(7).toLowerCase();
    else {
      // ADR-063: an unrecognised flag is fatal rather than silently ignored.
      process.stderr.write(`cwos-next allocate-ws-id: unknown option "${argv[i]}"\n`);
      process.exit(2);
    }
  }

  let allocateId, kindNames, KINDS;
  try { ({ allocateId, kindNames, KINDS } = require('./lib/id-allocator')); }
  catch (e) {
    process.stdout.write(JSON.stringify({ ok: false, error: `allocator lib unavailable: ${e.message}` }) + '\n');
    process.exit(0);
  }

  if (!KINDS[kind]) {
    process.stderr.write(`cwos-next allocate-ws-id: --kind must be one of ${kindNames().join(', ')}\n`);
    process.exit(2);
  }

  // Code root and state root are separate questions on purpose (CLAUDE.md):
  // INV/ADR are branch content and live under the repo root; WS/SPR/FIND are
  // shared state. Never derive one from the other.
  const repoRoot = KINDS[kind].root === 'code' ? findRepoRoot(process.cwd()) : undefined;

  const id = allocateId(kind, { wsDir: ws, repoRoot, reservedBy: `cwos-next:pid:${process.pid}` });
  process.stdout.write(JSON.stringify({
    ok: true,
    kind,
    id,
    ...(kind === 'ws' ? { ws_id: id } : {}),   // back-compat for existing callers
    scanned: KINDS[kind].describe,
    reserved: true,
  }) + '\n');
  return id;
}

if (require.main === module) main();

module.exports = {
  // exported for tests + downstream composition
  runGate, runCandidates, runCompose, runApprove, runDone, runAllocateWsId,
  interpretTokenBudget,
  candidatesInline, buildCompositionNotes, routingFields, renderModelCell, renderHumanCompose, renderSprintYaml, renderSprintYamlClosed, emitPassthrough, itemFieldsNotRecorded,
  readContextOverrideClass, ceremonyDefaults, effortSessions, selectCompanions,
  EFFORT_SESSIONS, UNSIZED_EFFORT_SESSIONS,
  configNumber, capOvershoot, loadConfig,
  nextSprintId,
  findResumableSprint, readSprintsFromDir, resolveResumableSprint, checkoutBlock,
  // ADR-067: pool + eligibility, exported for __tests__/next-pool.test.js.
  findPooledSprints, claimSprintLease, selectPickupCandidates, buildEligibilityFilter,
  resolveSprintUniverse, findPhantomSprints, makeItemStatusLookup,
  loadProgramCapsByProgram,
  // WS-732: exported so __tests__/next-cli-contract.test.js can hold the map
  // against the readFlag/hasFlag calls it claims to describe. A flag map that
  // silently drifts from the code is the same silent-ignore defect one level up.
  SUBCOMMAND_FLAGS, NO_OP_FLAGS, validateFlags, subcommandHelp,
};
