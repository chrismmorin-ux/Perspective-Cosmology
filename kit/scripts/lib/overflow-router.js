'use strict';
/**
 * overflow-router.js — when the fleet's machines are holding work, spend surplus
 * weekly tokens on cloud sessions instead (WS-1171). Pure decision functions; the
 * CLI (cwos-overflow-router.js) does every read and every launch.
 *
 * WHY. Founder, 2026-10-15: surplus weekly tokens while both machines were clogged.
 * Measured that day: about 60% of the poker repo's open work needs no local compute
 * and no browser — it is token-only — yet cloud sessions had not run since 09-29 and
 * nothing routed work to them. A cloud session (`claude --cloud "task"`) runs on an
 * Anthropic VM, draws on the same plan's usage, and costs the fleet no CPU or memory
 * (code.claude.com/docs/en/claude-code-on-the-web.md).
 *
 * THE RULES THIS FILE HOLDS, each a function a test pins:
 *   eligibility   open, unclaimed, unblocked, no founder decision pending, a model lane
 *                 a dispatched model can do (deep-reasoning | deep-code | mechanical),
 *                 and runs_on that does NOT need a local machine (not compute/browser).
 *   held          route only while an arbiter is holding queued work. A stale or
 *                 unreadable arbiter is unknown, never "held" and never "free".
 *   account       the default lane, unless its weekly use is above the threshold and
 *                 another provisioned lane is below it. No lane under the threshold
 *                 means no launch: above it is not surplus.
 *   batch landing every session pushes its own branch under cloud/<batch>/ and opens NO
 *                 pull request; the batch lands as ONE PR. Each poker PR costs node1 a
 *                 70-minute CI job, so one PR per item would turn spare tokens into a
 *                 compute bill on the very machine that was already holding.
 */

const OPEN_STATUSES = new Set(['backlog', 'ready', 'open', 'todo', 'queued', 'proposed']);
const CLOSED_STATUSES = new Set([
  'done', 'completed', 'dismissed', 'decomposed', 'cancelled', 'canceled', 'superseded',
  'wontfix', 'closed', 'merged', 'archived', 'duplicate', 'skipped',
]);
const ROUTABLE_LANES = new Set(['deep-reasoning', 'deep-code', 'mechanical']);
/** runs_on values whose work needs a fleet machine (legacy machine tokens included). */
const LOCAL_RUNS_ON = new Set(['compute', 'node1', 'browser', 'g16']);
/** An arbiter reading older than this is unknown. The G16 ticks every minute, node1 every 2. */
const HOLD_STALE_MINUTES = 15;
const DEFAULT_MAX = 2;
const DEFAULT_THRESHOLD = 80;
const BRANCH_ROOT = 'cloud';

const str = (v) => (v === undefined || v === null ? '' : String(v).trim());
const lower = (v) => str(v).toLowerCase();
const nonEmptyList = (v) => Array.isArray(v) && v.filter((x) => str(x)).length > 0;

/**
 * The lane an item routes on. A model_lane written on the item wins; otherwise the
 * WS-1170 ladder classifies it now, and the result says it was not on file.
 */
function itemLane(item, opts = {}) {
  const onFile = str(item && item.model_lane);
  if (onFile) return { lane: onFile, source: str(item.model_lane_source) || 'on file', reason: 'model_lane on the item' };
  const ml = require('./model-lane');
  const c = ml.classifyLane(item, { programLanes: opts.programLanes || {} });
  return { lane: c.lane, source: 'rule, not yet written to the item', reason: c.reason };
}

/**
 * Pure. Open queue items -> the ones a cloud session may take, best first, plus every
 * exclusion grouped by reason so nothing disappears silently.
 * `inFlight` maps item id -> batch id for items already launched and not yet landed.
 */
function selectEligible(items, opts = {}) {
  const inFlight = opts.inFlight || new Map();
  const byId = new Map(items.filter((i) => i && i.id).map((i) => [String(i.id), i]));
  const eligible = [];
  const excluded = {};
  const exclude = (reason, id) => { (excluded[reason] = excluded[reason] || []).push(id); };
  for (const it of byId.values()) {
    const id = String(it.id);
    const status = lower(it.status);
    if (!OPEN_STATUSES.has(status)) continue; // closed, deferred, blocked, in progress: not open work
    if (str(it.claimed_by)) { exclude('claimed by a session', id); continue; }
    if (inFlight.has(id)) { exclude(`already launched (batch ${inFlight.get(id)})`, id); continue; }
    const blockers = (Array.isArray(it.blocked_by) ? it.blocked_by : []).map(str).filter(Boolean);
    // A blocker counts until it is closed; one this queue cannot see is not assumed closed.
    const openBlocker = blockers.find((b) => { const d = byId.get(b); return !d || !CLOSED_STATUSES.has(lower(d.status)); });
    if (openBlocker) { exclude('blocked by an item that is not closed', id); continue; }
    if (nonEmptyList(it.decision_flags)) { exclude('needs a founder decision first (decision_flags)', id); continue; }
    const runsOn = lower(it.runs_on) || 'any';
    if (LOCAL_RUNS_ON.has(runsOn)) { exclude(`runs_on ${runsOn} needs a fleet machine`, id); continue; }
    const l = itemLane(it, opts);
    if (!ROUTABLE_LANES.has(l.lane)) { exclude(`model lane ${l.lane} is not done by a dispatched model`, id); continue; }
    eligible.push({
      id, title: str(it.title), lane: l.lane, lane_source: l.source, lane_reason: l.reason,
      priority: Number(it.priority_score) || 0, runs_on: runsOn, effort: str(it.effort) || null,
    });
  }
  eligible.sort((a, b) => (b.priority - a.priority) || a.id.localeCompare(b.id, 'en', { numeric: true }));
  return { eligible, excluded };
}

/**
 * Pure. Arbiter readings -> is local work being held?
 * reading = { node, admission: <admission.json object> | null, why?: string }
 * Held when ANY fresh reading says queued.admit === false.
 */
function holdState(readings, nowMs = Date.now()) {
  const holders = [];
  const admitting = [];
  const unknownNodes = [];
  for (const r of readings || []) {
    const a = r && r.admission;
    if (!a) { unknownNodes.push({ node: r && r.node, why: (r && r.why) || 'no reading' }); continue; }
    const at = Date.parse(a.at);
    if (Number.isNaN(at)) { unknownNodes.push({ node: r.node, why: 'reading has no timestamp' }); continue; }
    const ageMin = (nowMs - at) / 60000;
    if (ageMin > HOLD_STALE_MINUTES) { unknownNodes.push({ node: r.node, why: `reading is ${Math.round(ageMin)} min old (stale after ${HOLD_STALE_MINUTES})` }); continue; }
    const q = a.queued;
    if (!q || typeof q.admit !== 'boolean') { unknownNodes.push({ node: r.node, why: 'reading has no queued-lane verdict' }); continue; }
    (q.admit ? admitting : holders).push({ node: r.node, reason: str(q.reason) || 'no reason given', age_min: Math.round(ageMin) });
  }
  return { held: holders.length > 0, holders, admitting, unknown: unknownNodes };
}

/**
 * Pure. Which account (billing lane) a launch should draw on.
 * lanes = [{ name, isDefault, provisioned, why?, limit: <limitPosition result> }]
 * Returns { lane, reason } or { lane: null, reason } when none has headroom.
 */
function pickAccount(lanes, threshold = DEFAULT_THRESHOLD) {
  const def = (lanes || []).find((l) => l.isDefault);
  if (!def) return { lane: null, reason: 'no default lane is declared' };
  if (def.provisioned === false) return { lane: null, reason: `default lane ${def.name} is not usable: ${def.why || 'not provisioned'}` };
  const pct = (l) => (l && l.limit && l.limit.known ? Number(l.limit.seven_day_pct) : null);
  const dp = pct(def);
  if (dp === null) {
    return { lane: def.name, reason: `default lane ${def.name}: weekly use unknown (${(def.limit && def.limit.why) || 'no reading'}); the default is used rather than guessing it is full` };
  }
  if (dp <= threshold) return { lane: def.name, reason: `default lane ${def.name} is at ${Math.round(dp)}% of its week (threshold ${threshold}%)` };
  const others = (lanes || []).filter((l) => !l.isDefault);
  const notReady = [];
  for (const o of others) {
    if (!o.provisioned) { notReady.push(`${o.name}: ${o.why || 'not provisioned'}`); continue; }
    const op = pct(o);
    if (op === null) { notReady.push(`${o.name}: weekly use unknown (${(o.limit && o.limit.why) || 'no reading'})`); continue; }
    if (op < threshold) return { lane: o.name, reason: `default lane ${def.name} is at ${Math.round(dp)}% (over ${threshold}%); ${o.name} is at ${Math.round(op)}%` };
    notReady.push(`${o.name}: at ${Math.round(op)}%`);
  }
  return { lane: null, reason: `default lane ${def.name} is at ${Math.round(dp)}% (over ${threshold}%) and no other lane is under it${notReady.length ? ` (${notReady.join('; ')})` : ''}` };
}

function batchId(nowMs = Date.now()) {
  return `ovf-${new Date(nowMs).toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-')}`;
}
const batchBranch = (batch) => `${BRANCH_ROOT}/${batch}`;
const itemBranch = (batch, id) => `${BRANCH_ROOT}/${batch}/${id}`;

/** Pure. The task text a cloud session receives. ASCII only. */
function briefFor(item, ctx) {
  const lines = [
    `Work queue item ${item.id} in the ${ctx.repo} repository: ${item.title}`,
    '',
    `1. Read .claude/workstream/queue/${item.id}.yaml first, then the repo's CLAUDE.md and .claude/rules/. Follow them; they bind this session as they bind a local one.`,
    `2. Do the item to its accept criteria. Model lane: ${item.lane}. Run the narrowest tests that cover what you change.`,
    `3. Commit to the branch ${itemBranch(ctx.batch, item.id)} and push it. Do NOT open a pull request.`,
    `   This session is one of overflow batch ${ctx.batch}. The batch lands as ONE pull request (cwos-overflow-router land --batch ${ctx.batch}),`,
    '   because every pull request in this repo costs the compute node a 70-minute CI job.',
    '4. If the item needs a founder decision, a browser, or long local compute after all, stop, push nothing, and say which and why.',
    '5. Finish with a short report: what changed, what was verified and how, and anything left open.',
  ];
  return lines.join('\n').replace(/[^\x09\x0a\x20-\x7e]/g, '-');
}

/**
 * Pure. The whole decision: what would be launched, or why nothing is.
 * Returns { launch: [{item, branch, brief, model, account}], refused: string|null, batch }
 */
function planLaunches({ eligible, hold, account, model, repo, max = DEFAULT_MAX, assumeHeld = false, nowMs = Date.now(), batch = null }) {
  const b = batch || batchId(nowMs);
  const refusals = [];
  if (!hold.held && !assumeHeld) {
    refusals.push(hold.unknown.length && !hold.admitting.length
      ? `no arbiter reading says local work is held (${hold.unknown.map((u) => `${u.node}: ${u.why}`).join('; ')})`
      : 'no machine is holding queued work, so local compute is free - nothing to overflow');
  }
  if (!account.lane) refusals.push(account.reason);
  if (!model || !model.ok) refusals.push(`the lane model could not be resolved: ${(model && model.refused) || 'no routing ledger'}`);
  const n = Math.max(0, Math.floor(Number(max)));
  const picks = (eligible || []).slice(0, n);
  const launch = picks.map((it) => ({
    item: it, branch: itemBranch(b, it.id), account: account.lane,
    model: model && model.ok ? model.byLane[it.lane] : null,
    brief: briefFor(it, { repo, batch: b }),
  }));
  return { batch: b, launch, refused: refusals.length ? refusals.join('; ') : null };
}

/** Pure. `claude --cloud` argv for one launch. */
function launchArgv(l) {
  const argv = ['--cloud', l.brief];
  if (l.model) argv.push('--model', l.model);
  return argv;
}

/** Pure. Pull a session id / url out of the CLI's output. */
function parseLaunchOutput(text) {
  const s = String(text || '');
  const url = (s.match(/https:\/\/claude\.ai\/code\/[A-Za-z0-9_?=&.\-/]+/) || [])[0] || null;
  const id = (s.match(/\b(session_[A-Za-z0-9]+|cse_[A-Za-z0-9]+)\b/) || [])[1] || null;
  return { session_id: id, url };
}

/**
 * Pure. Launch events (+ landed events) -> items in flight: item id -> batch, for
 * batches that have not landed.
 */
function inFlightFrom(events, repo) {
  const landed = new Set();
  for (const e of events || []) {
    const p = e && e.payload;
    if (p && p.type === 'cloud-batch-landed' && (!repo || p.repo === repo)) landed.add(p.batch);
  }
  const m = new Map();
  for (const e of events || []) {
    const p = e && e.payload;
    if (!p || p.type !== 'cloud-session-launched' || !p.ok) continue;
    if (repo && p.repo !== repo) continue;
    if (landed.has(p.batch)) continue;
    m.set(String(p.item), p.batch);
  }
  return m;
}

/** Pure. Remote branch names -> what landing a batch would do. */
function landPlan(batch, remoteBranches) {
  const prefix = `${batchBranch(batch)}/`;
  const items = (remoteBranches || []).filter((b) => b.startsWith(prefix)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  const ids = items.map((b) => b.slice(prefix.length));
  return {
    branch: batchBranch(batch), merges: items, items: ids,
    title: `Overflow batch ${batch}: ${ids.join(', ') || 'no items'}`,
  };
}

module.exports = {
  OPEN_STATUSES, CLOSED_STATUSES, ROUTABLE_LANES, LOCAL_RUNS_ON, HOLD_STALE_MINUTES, DEFAULT_MAX, DEFAULT_THRESHOLD, BRANCH_ROOT,
  itemLane, selectEligible, holdState, pickAccount, batchId, batchBranch, itemBranch,
  briefFor, planLaunches, launchArgv, parseLaunchOutput, inFlightFrom, landPlan,
};
