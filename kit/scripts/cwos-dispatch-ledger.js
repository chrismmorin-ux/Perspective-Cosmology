#!/usr/bin/env node
/**
 * cwos-dispatch-ledger — the harness records which model did the work.
 *
 * The 2026-10-10 fleet probe (fleet/outbox/compliance-probe-recording-2026-10-10.md)
 * measured what happens when recording is left to the model: 0 of 29 engine runs
 * named the model that ran them. Claude Code already knows: a PostToolUse hook on
 * the Agent tool receives `tool_input.model` (what was asked for) and
 * `tool_response.resolvedModel` (what actually ran). So the model is not asked to
 * remember anything; the harness writes it down.
 *
 *   record   PostToolUse hook (matcher Agent): stdin = hook JSON -> agent_dispatched event
 *   report   read the events back: [--since ISO] [--until ISO] [--run run-id] [--json]
 *
 * The session's own model (what an agent with no override inherits) is recorded
 * once, by cwos-session-register (WS-942, lib/harness-identity) in its
 * session-registered event; report reads it from there rather than keeping a
 * second writer of the same fact.
 *
 * Hook subcommands never block and never fail the host turn (exit 0 always, AS-23);
 * a write they could not make is reported on stderr. Events land on the T7:engines
 * track of the one event log (schemas: core/schemas/payloads/engines/).
 * WS-476 (recording half). The assert-vs-declared-tier half builds on these events.
 *
 * WS-1170 — per item. A dispatch whose description or prompt names a work item
 * (WS-NNN) records it in `work_items`; `report --by-item` then lines up, for each
 * item, its model_lane, the model that lane resolves to in the routing ledger, what
 * each dispatch REQUESTED, and what actually RAN. "Inherited" (no model named) is
 * counted apart from "off-lane", because the first is a missing request and the
 * second is a request that was not honoured — two different fixes.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { cliGate } = require('./lib/cli');
const { findWorkstreamDir, readYAMLFile } = require('./lib/cwos-utils');

const CLI = {
  name: 'cwos-dispatch-ledger',
  summary: 'the harness records which model each dispatched agent actually ran on',
  usage: 'cwos-dispatch-ledger <record|report> [options]',
  subcommands: {
    record: 'PostToolUse hook on Agent: read hook JSON on stdin, append agent_dispatched',
    report: 'list recorded dispatches (and the session models) for a window or run',
  },
  flags: {
    since: { type: 'string', describe: 'report: ISO timestamp lower bound' },
    until: { type: 'string', describe: 'report: ISO timestamp upper bound' },
    run: { type: 'string', describe: 'report: run id — window from its manifest started_at..completed_at' },
    json: { type: 'boolean', describe: 'report: machine-readable output' },
    'by-item': { type: 'boolean', describe: 'report: per work item, lane model vs requested vs resolved (WS-1170)' },
  },
};

const DISPATCH_TOOLS = new Set(['Agent', 'Task']);
const ALIASES = new Set(['haiku', 'sonnet', 'opus', 'fable']);
// When the chained append cannot be made (the event-log lock is busy past its
// wait under heavy fan-out, or a worktree refusal), the record goes to a plain
// append-only spool instead of being dropped; the next successful record drains
// it into the log, and report reads both.
const SPOOL = 'dispatch-spool.jsonl';
const str = (v, max) => (typeof v === 'string' && v.length ? (max ? v.slice(0, max) : v) : null);
const numOrNull = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const WORK_ITEM_RE = /\bWS-\d+\b/g;
const MAX_WORK_ITEMS = 10;

/** The work items a dispatch names, in first-seen order. A structural token, not prose. */
function workItemsOf(...texts) {
  const seen = [];
  for (const t of texts) {
    for (const m of (typeof t === 'string' ? t.match(WORK_ITEM_RE) : null) || []) {
      if (!seen.includes(m)) seen.push(m);
      if (seen.length >= MAX_WORK_ITEMS) return seen;
    }
  }
  return seen;
}

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

function parseHookInput(raw) {
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : null;
  } catch { return null; }
}

/** Pure: hook input -> agent_dispatched payload, or null when this is not a dispatch. */
function dispatchPayload(input) {
  if (!input || !DISPATCH_TOOLS.has(input.tool_name)) return null;
  const ti = input.tool_input && typeof input.tool_input === 'object' ? input.tool_input : {};
  const tr = input.tool_response && typeof input.tool_response === 'object' ? input.tool_response : {};
  return {
    type: 'agent_dispatched',
    tool_use_id: str(input.tool_use_id),
    agent_id: str(tr.agentId),
    subagent_type: str(ti.subagent_type),
    description: str(ti.description, 200),
    requested_model: str(ti.model),
    resolved_model: str(tr.resolvedModel),
    models_used: Array.isArray(tr.modelsUsed) ? tr.modelsUsed.filter((m) => typeof m === 'string') : null,
    status: str(tr.status),
    session_id: str(input.session_id),
    parent_agent_id: str(input.agent_id),
    total_tokens: numOrNull(tr.totalTokens),
    work_items: workItemsOf(ti.description, ti.prompt),
  };
}

function chainedAppend(wsDir, tag, payload) {
  const { appendEvent } = require('./core/events');
  return appendEvent({ source_track: 'T7:engines', source_tier: 'reducer-output', track_tag: tag, payload },
    { workstreamDir: wsDir });
}

function append(payload, input, tag) {
  let wsDir;
  try { wsDir = findWorkstreamDir(str(input.cwd) || process.cwd()); } catch { return; } // not a CWOS repo
  const spool = path.join(wsDir, SPOOL);
  try {
    const r = chainedAppend(wsDir, tag, payload);
    if (!r.ok) { process.stderr.write(`cwos-dispatch-ledger: event rejected: ${r.errors.join('; ')}\n`); return; }
  } catch (err) {
    try {
      fs.appendFileSync(spool, JSON.stringify({ timestamp: new Date().toISOString(), tag, payload }) + '\n');
      process.stderr.write(`cwos-dispatch-ledger: event log busy (${err.code || err.message}); spooled\n`);
    } catch { /* nothing left to try; never fail the turn */ }
    return;
  }
  drainSpool(wsDir, spool);
}

/** Move spooled records into the chained log (oldest first); keep any that still fail. */
function drainSpool(wsDir, spool) {
  if (!fs.existsSync(spool)) return;
  const claimed = `${spool}.${process.pid}`;
  try { fs.renameSync(spool, claimed); } catch { return; } // another process is draining
  const keep = [];
  for (const line of fs.readFileSync(claimed, 'utf8').split('\n').filter(Boolean)) {
    try {
      const rec = JSON.parse(line);
      const r = chainedAppend(wsDir, rec.tag, { ...rec.payload, spooled_at: rec.timestamp });
      if (!r.ok) keep.push(line);
    } catch { keep.push(line); }
  }
  if (keep.length) fs.appendFileSync(spool, keep.join('\n') + '\n');
  fs.unlinkSync(claimed);
}

function readSpool(wsDir) {
  const spool = path.join(wsDir, SPOOL);
  if (!fs.existsSync(spool)) return [];
  return fs.readFileSync(spool, 'utf8').split('\n').filter(Boolean).flatMap((l) => {
    try { const r = JSON.parse(l); return [{ timestamp: r.timestamp, payload: r.payload }]; } catch { return []; }
  });
}

function readEvents(wsDir) {
  const events = require('./core/events');
  return events.readFilteredEvents(events.eventsDir(wsDir), {
    typeFilter: (ev) => !!ev && ((ev.payload && ev.payload.type === 'agent_dispatched')
      || ev.track_tag === 'session-registered'),
  }).concat(readSpool(wsDir));
}

function runWindow(wsDir, runId) {
  const r = readYAMLFile(path.join(wsDir, 'runs', runId, 'manifest.yaml'));
  if (!r.ok || !r.data) throw new Error(`no readable manifest for ${runId}`);
  return { since: r.data.started_at || null, until: r.data.completed_at || null };
}

/** session-registered carries the model as a string or as { id } (harness-identity). */
function sessionModel(payload) {
  const m = payload && payload.model;
  if (typeof m === 'string' && m) return m;
  if (m && typeof m === 'object' && typeof m.id === 'string' && m.id) return m.id;
  return null;
}

/** Pure: filter + summarize. `resolved_model` is the truth; requested null = inherited. */
function summarize(evs, since, until) {
  const inWindow = (ev) => (!since || ev.timestamp >= since) && (!until || ev.timestamp <= until);
  const rows = evs.filter(inWindow);
  const dispatches = rows.filter((e) => e.payload.type === 'agent_dispatched');
  const byModel = {};
  for (const d of dispatches) {
    const m = d.payload.resolved_model || '(not reported)';
    byModel[m] = (byModel[m] || 0) + 1;
  }
  // Only a known alias can be "swapped"; anything else (e.g. "inherit") is not a request.
  const mismatched = dispatches.filter((d) => ALIASES.has(d.payload.requested_model)
    && d.payload.resolved_model && !d.payload.resolved_model.includes(d.payload.requested_model));
  return {
    dispatches: dispatches.length,
    by_resolved_model: byModel,
    requested_vs_resolved_mismatch: mismatched.length,
    session_models: [...new Set(rows.filter((e) => e.track_tag === 'session-registered')
      .map((e) => sessionModel(e.payload)).filter(Boolean))],
    rows: dispatches.map((d) => ({
      at: d.timestamp, subagent_type: d.payload.subagent_type, requested: d.payload.requested_model,
      resolved: d.payload.resolved_model, description: d.payload.description,
    })),
  };
}

/** Does a resolved model id ("claude-opus-5-5") match an alias ("opus")? */
function modelMatches(resolved, alias) {
  return !!(resolved && alias && String(resolved).toLowerCase().includes(String(alias).toLowerCase()));
}

/**
 * Pure: per work item, the lane's model vs each dispatch's requested and resolved model.
 *   laneOf(id)       -> { lane, source } | null   (the item's model_lane)
 *   laneModel(lane)  -> a lib/model-lane resolveLane result | null
 * Verdict per dispatch: on-lane | off-lane | inherited-on-lane | inherited-off-lane |
 * no-lane | lane-refused | unreported.
 */
function byItem(dispatchEvents, laneOf, laneModel) {
  const items = {};
  for (const d of dispatchEvents) {
    const p = d.payload || {};
    for (const id of Array.isArray(p.work_items) ? p.work_items : []) {
      if (!items[id]) {
        const l = laneOf(id);
        const r = l && l.lane ? laneModel(l.lane) : null;
        items[id] = {
          id, lane: l ? l.lane : null, lane_source: l ? l.source : null,
          lane_model: r && r.ok ? r.model : null, lane_refused: r && !r.ok ? r.refused : null,
          dispatches: 0, verdicts: {}, rows: [],
        };
      }
      const it = items[id];
      let verdict;
      if (!it.lane) verdict = 'no-lane';
      else if (it.lane_refused) verdict = 'lane-refused';
      else if (!p.resolved_model) verdict = 'unreported';
      else {
        const on = modelMatches(p.resolved_model, it.lane_model);
        if (p.requested_model) verdict = on ? 'on-lane' : 'off-lane';
        else verdict = on ? 'inherited-on-lane' : 'inherited-off-lane';
      }
      it.dispatches++;
      it.verdicts[verdict] = (it.verdicts[verdict] || 0) + 1;
      it.rows.push({ at: d.timestamp, requested: p.requested_model || null, resolved: p.resolved_model || null, verdict });
    }
  }
  return Object.values(items).sort((a, b) => b.dispatches - a.dispatches);
}

/** The item's lane from its queue YAML, and the lane's model from the routing ledger. */
function laneLookups(wsDir) {
  const ml = require('./lib/model-lane');
  const { resolveHomeBaseRoot } = require('./lib/kit-paths');
  const root = resolveHomeBaseRoot({ from: wsDir });
  const led = ml.readLedger(ml.ledgerPath(root));
  const laneOf = (id) => {
    const r = readYAMLFile(path.join(wsDir, 'queue', `${id}.yaml`));
    if (!r.ok || !r.data || !r.data.model_lane) return null;
    return { lane: String(r.data.model_lane), source: r.data.model_lane_source || null };
  };
  const laneModel = (lane) => (led.ok ? ml.resolveLane(lane, led.data, root) : { ok: false, refused: led.error });
  return { laneOf, laneModel };
}

function reportByItem(wsDir, since, until, asJson) {
  const inWindow = (ev) => (!since || ev.timestamp >= since) && (!until || ev.timestamp <= until);
  const evs = readEvents(wsDir).filter((e) => e.payload && e.payload.type === 'agent_dispatched' && inWindow(e));
  const { laneOf, laneModel } = laneLookups(wsDir);
  const items = byItem(evs, laneOf, laneModel);
  const untagged = evs.filter((e) => !(Array.isArray(e.payload.work_items) && e.payload.work_items.length)).length;
  if (asJson) { process.stdout.write(JSON.stringify({ items, untagged_dispatches: untagged }, null, 1) + '\n'); return; }
  process.stdout.write(`${items.length} work item(s) across ${evs.length} dispatch(es); ${untagged} named no work item\n`);
  for (const it of items) {
    const lane = it.lane ? `${it.lane} -> ${it.lane_model || 'REFUSED'}` : 'no model_lane';
    const v = Object.entries(it.verdicts).map(([k, n]) => `${k} ${n}`).join(', ');
    process.stdout.write(`  ${it.id}  [${lane}]  ${it.dispatches} dispatch(es): ${v}\n`);
  }
}

function main() {
  const { values, sub } = cliGate(process.argv.slice(2), CLI);

  if (sub === 'record') {
    const input = parseHookInput(readStdin());
    const payload = dispatchPayload(input);
    if (payload) append(payload, input, 'agent-dispatched');
    process.exit(0);
  }

  if (sub === 'report') {
    const wsDir = findWorkstreamDir(process.cwd());
    let { since, until } = values;
    if (values.run) ({ since, until } = runWindow(wsDir, values.run));
    if (values['by-item']) return reportByItem(wsDir, since || null, until || null, !!values.json);
    const s = summarize(readEvents(wsDir), since || null, until || null);
    if (values.json) { process.stdout.write(JSON.stringify(s, null, 1) + '\n'); return; }
    process.stdout.write(`${s.dispatches} dispatch(es) recorded by the harness`
      + `${since || until ? ` in ${since || '…'} .. ${until || '…'}` : ''}\n`);
    for (const [m, n] of Object.entries(s.by_resolved_model)) process.stdout.write(`  ${m}: ${n}\n`);
    if (s.requested_vs_resolved_mismatch) {
      process.stdout.write(`  ${s.requested_vs_resolved_mismatch} ran on a different model than requested\n`);
    }
    if (s.session_models.length) process.stdout.write(`session model(s): ${s.session_models.join(', ')}\n`);
    return;
  }

  process.stderr.write(`usage: ${CLI.usage}\n`);
  process.exit(2);
}

if (require.main === module) main();

module.exports = { dispatchPayload, summarize, sessionModel, workItemsOf, byItem, modelMatches, DISPATCH_TOOLS, SPOOL };
