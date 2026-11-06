#!/usr/bin/env node
/**
 * cwos-resource-board — tokens, delegation, weekly-limit position and compute,
 * on one page, in plain English (WS-1169, prog-token-economy).
 *
 * Founder, 2026-10-15: he could not see delegation rates or manage tokens and
 * compute as a resource. Measured that day: 472 Agent dispatches in 164 sessions
 * over two weeks, 80% inheriting the session model, and nothing that rolled any
 * of it up or read the weekly limit. This board is the roll-up.
 *
 *   cwos-resource-board                 last 7 days, human report
 *   cwos-resource-board --days 14
 *   cwos-resource-board --since 2026-10-01 [--until 2026-10-08]
 *   cwos-resource-board --local-only    skip ssh / gh / child scripts (compute side reads unknown)
 *   cwos-resource-board --json
 *
 * Sources (each figure names its own on the page):
 *   Claude tokens + delegation  cwos-token-meter over every config dir's projects folder
 *   accounts                    lib/claude-accounts (history.jsonl per config dir)
 *   weekly limit                <config dir>/cwos-rate-limits.json, written by cwos-statusline-capture
 *   Codex                       lib/codex-usage over ~/.codex/sessions
 *   G16 / local arbiter         ~/fleet/arbiter/status.json
 *   node1 arbiter               ssh <node1> ~/fleet/arbiter/status.json
 *   compute queue               <compute repo>/kit/scripts/cwos-fleet-compute.js status --json
 *   broker + merge backlog      <compute repo>/scripts/check-deploy-freshness.mjs --json
 *   declared lanes              ai-personal nodes/claude-lanes.json (a lane with no config dir here
 *                               is listed as not provisioned, never dropped) (WS-1171)
 *   cloud sessions              HomeBase event log: cloud-session-launched / cloud-batch-landed,
 *                               written by cwos-overflow-router (WS-1171)
 *
 * THE RULE: anything that cannot be read says "unknown (why)". It is never
 * shown as 0, because a zero reads as a measurement and this one would not be.
 * Read-only. Ends with exactly one next-action line.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { cliGate } = require('./lib/cli');

const CLI = {
  name: 'cwos-resource-board',
  summary: 'tokens by model, delegation rate, weekly-limit position and compute state, in plain English',
  usage: 'cwos-resource-board [--days <n>] [--since <date>] [--until <date>] [--local-only] [--json]',
  flags: {
    days: { type: 'string', describe: 'window length in days ending now (default 7)' },
    since: { type: 'string', describe: 'window start (ISO date); overrides --days' },
    until: { type: 'string', describe: 'window end (ISO date, default now)' },
    'local-only': { type: 'boolean', describe: 'do not run ssh, gh or the compute-repo scripts' },
    'compute-repo': { type: 'string', describe: 'fleet repo that holds the compute + broker scripts (default claude-poker-tracker)' },
    'node1-host': { type: 'string', describe: 'ssh alias of the compute node (default cm-node1)' },
    json: { type: 'boolean', describe: 'machine-readable output' },
  },
};

const HOME = process.env.USERPROFILE || os.homedir();
const RATE_FILE = 'cwos-rate-limits.json';
const STALE_LIMIT_HOURS = 24;

// ─── known / unknown ────────────────────────────────────────────────────────

/** A figure that could not be read. Rendered as "unknown (why)", never as 0. */
const unknown = (why) => ({ known: false, why: String(why) });
const isUnknown = (v) => !v || v.known === false;

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')); } catch { return null; }
}

function runJson(cmd, args, { cwd, timeout = 90000 } = {}) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout, windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
  if (r.error) return { error: r.error.code === 'ETIMEDOUT' ? `timed out after ${timeout / 1000}s` : r.error.message };
  const out = String(r.stdout || '');
  const start = out.indexOf('{');
  if (start === -1) return { error: `no JSON on stdout (exit ${r.status})` };
  try { return { value: JSON.parse(out.slice(start)) }; } catch { return { error: `unparseable output (exit ${r.status})` }; }
}

const ageText = (iso, now = Date.now()) => {
  const ms = now - Date.parse(iso);
  if (Number.isNaN(ms)) return 'age unknown';
  const m = Math.round(ms / 60000);
  if (m < 90) return `${m} min old`;
  const h = ms / 3600000;
  return h < 48 ? `${h.toFixed(1)} h old` : `${(h / 24).toFixed(1)} days old`;
};

// ─── fleet lookups ──────────────────────────────────────────────────────────

function resolveRepo(name) {
  const script = path.join(__dirname, 'cwos-fleet-context.js');
  if (!fs.existsSync(script)) return unknown('cwos-fleet-context.js is not installed here');
  const r = runJson(process.execPath, [script, 'resolve', name, '--json'], { timeout: 20000 });
  if (r.error) return unknown(`could not resolve ${name}: ${r.error}`);
  if (!r.value.ok || !r.value.path) return unknown(`${name} is not in the fleet registry`);
  if (!r.value.local || !fs.existsSync(r.value.path)) return unknown(`${name} is not on this machine`);
  return { known: true, path: r.value.path };
}

// ─── weekly limit ───────────────────────────────────────────────────────────

/**
 * Pure. A config dir's rate-limit record -> where the account stands.
 * Unknown when no record exists, when the week the reading belongs to has
 * already reset, or when it is older than STALE_LIMIT_HOURS.
 */
function limitPosition(rec, nowMs = Date.now()) {
  if (!rec || !rec.latest) return unknown('statusLine capture not wired for this account');
  const r = rec.latest;
  const age = ageText(r.ts, nowMs);
  const w = r.seven_day;
  if (!w) return unknown(`last reading (${age}) had no weekly figure`);
  if (w.resets_at && w.resets_at * 1000 <= nowMs) return unknown(`last reading (${age}) belongs to a week that has since reset`);
  if (nowMs - Date.parse(r.ts) > STALE_LIMIT_HOURS * 3600000) return unknown(`last reading is ${age}; no session has rendered a status line since`);
  return {
    known: true,
    seven_day_pct: w.used_percentage,
    seven_day_resets: w.resets_at ? new Date(w.resets_at * 1000).toISOString() : null,
    five_hour_pct: r.five_hour ? r.five_hour.used_percentage : null,
    at: r.ts,
    age,
  };
}

// ─── collection ─────────────────────────────────────────────────────────────

function windowFrom(values, nowMs) {
  const parse = (name, v) => {
    const ms = Date.parse(v);
    if (Number.isNaN(ms)) { console.error(`cwos-resource-board: --${name} "${v}" is not a date`); process.exit(2); }
    return ms;
  };
  const untilMs = values.until ? parse('until', values.until) : null;
  let sinceMs;
  if (values.since) sinceMs = parse('since', values.since);
  else {
    const days = values.days ? Number(values.days) : 7;
    if (!(days > 0)) { console.error('cwos-resource-board: --days must be a positive number'); process.exit(2); }
    sinceMs = (untilMs || nowMs) - days * 86400000;
  }
  return { sinceMs, untilMs };
}

/** Sum token-meter reports from several projects roots into one view. */
function mergeReports(reports) {
  if (reports.length === 1) return reports[0];
  const meter = require('./cwos-token-meter');
  const sumU = (a, b) => { for (const k of Object.keys(a)) a[k] += b[k] || 0; return a; };
  const empty = () => ({ input: 0, cache_write: 0, cache_read: 0, output: 0, replies: 0 });
  const out = { sessions_count: 0, main: empty(), subagents: empty(), by_model: [], by_repo: [], by_account: [] };
  const models = {};
  const calls = [];
  for (const r of reports) {
    out.sessions_count += r.sessions_count;
    sumU(out.main, r.main);
    sumU(out.subagents, r.subagents);
    for (const m of r.by_model) {
      const row = models[m.model] || (models[m.model] = { model: m.model, main: empty(), subagents: empty() });
      sumU(row.main, m.main); sumU(row.subagents, m.subagents);
    }
    out.by_repo.push(...r.by_repo);
    if (r.by_account) out.by_account.push(...r.by_account);
    calls.push(r.delegation);
  }
  out.by_model = Object.values(models).map((m) => ({ ...m, tokens: meter.usageTokens(m.main) + meter.usageTokens(m.subagents), output: m.main.output + m.subagents.output }))
    .sort((a, b) => b.tokens - a.tokens);
  const d = { agent_calls: 0, from_main: 0, named_model: 0, requested: {}, actual: {}, requested_to_actual: {} };
  for (const c of calls) {
    d.agent_calls += c.agent_calls; d.from_main += c.from_main; d.named_model += c.named_model;
    for (const k of ['requested', 'actual', 'requested_to_actual']) for (const [n, v] of Object.entries(c[k])) d[k][n] = (d[k][n] || 0) + v;
  }
  d.main_replies = out.main.replies;
  d.per_100_replies = d.main_replies ? Math.round((1000 * d.from_main) / d.main_replies) / 10 : null;
  d.named_pct = d.agent_calls ? Math.round((1000 * d.named_model) / d.agent_calls) / 10 : null;
  out.delegation = d;
  return out;
}

function collectClaude(win, lanesFile) {
  const meter = require('./cwos-token-meter');
  const { discoverConfigDirs, sessionAccountMap } = require('./lib/claude-accounts');
  const configDirs = discoverConfigDirs({ lanesFile });
  const roots = [...new Map(configDirs.filter((c) => c.projects).map((c) => [c.projects.toLowerCase(), c.projects])).values()];
  const accounts = configDirs.map((c) => ({
    label: c.label, dir: c.dir, email: c.email,
    limit: limitPosition(readJson(path.join(c.dir, RATE_FILE))),
  }));
  if (!roots.length) { addDeclaredLanes(accounts, lanesFile); return { tokens: unknown('no Claude Code projects folder found in any config dir'), accounts }; }
  const sessionMap = sessionAccountMap(configDirs);
  const reports = roots.map((root) => meter.measure(meter.allProjectDirs(root), win.sinceMs, {
    untilMs: win.untilMs, accountOf: (id) => sessionMap.get(id) || null,
  }));
  const r = mergeReports(reports);
  for (const a of accounts) {
    const row = (r.by_account || []).find((g) => g.name === a.label);
    if (row) a.tokens = { known: true, value: row.tokens, sessions: row.sessions };
    else if (!fs.existsSync(path.join(a.dir, 'history.jsonl'))) a.tokens = unknown('no history.jsonl in this config dir to attribute sessions by');
    else a.tokens = { known: true, value: 0, sessions: 0 };
  }
  addDeclaredLanes(accounts, lanesFile);
  const unattributed = (r.by_account || []).find((g) => g.name === meter.UNATTRIBUTED);
  const launchedFrom = {};
  for (const rep of reports) for (const s of rep.sessions || []) {
    if (s.account === meter.UNATTRIBUTED) launchedFrom[s.entrypoint || 'unrecorded'] = (launchedFrom[s.entrypoint || 'unrecorded'] || 0) + 1;
  }
  return {
    source: roots.join(', '),
    tokens: { known: true, report: r },
    accounts,
    unattributed: unattributed ? { tokens: unattributed.tokens, sessions: unattributed.sessions, launched_from: launchedFrom } : null,
  };
}

/**
 * A lane declared in claude-lanes.json but with no config dir on this machine is still a
 * lane: show it as not provisioned rather than leave it off the page, which would read as
 * "there is no second account" (WS-1171). Marks the default lane. Mutates `accounts`.
 */
function addDeclaredLanes(accounts, lanesFile) {
  const j = lanesFile ? readJson(lanesFile) : null;
  if (!j || !Array.isArray(j.lanes)) return accounts;
  const norm = (p) => path.resolve(p).replace(/\\/g, '/').toLowerCase();
  const have = new Set(accounts.map((a) => norm(a.dir)));
  for (const l of j.lanes) {
    if (!l || !l.name) continue;
    const dir = l.configDir ? path.resolve(String(l.configDir).replace(/%USERPROFILE%/gi, HOME).replace(/^~(?=$|[\\/])/, HOME)) : path.join(HOME, '.claude');
    const row = accounts.find((a) => a.label === l.name || norm(a.dir) === norm(dir));
    if (row) { if (l.name === j.defaultLane) row.default = true; continue; }
    if (have.has(norm(dir))) continue;
    const why = `lane declared in claude-lanes.json, but there is no config dir at ${dir} - not provisioned on this machine`;
    accounts.push({ label: String(l.name), dir, email: l.expectedEmail || null, default: l.name === j.defaultLane, declared_only: true, tokens: unknown(why), limit: unknown(why) });
  }
  return accounts;
}

/**
 * Pure. Overflow events -> what the cloud lane did in the window (WS-1171).
 * A readable log with no launches is a measured zero, not an unknown.
 */
function cloudSummary(events, sinceMs, untilMs = null) {
  const inWin = (e) => { const t = Date.parse(e.timestamp); return t >= sinceMs && (untilMs == null || t <= untilMs); };
  const launched = [];
  const landed = [];
  for (const e of events || []) {
    const p = e && e.payload;
    if (!p) continue;
    if (p.type === 'cloud-session-launched' && inWin(e)) launched.push({ ...p, at: e.timestamp });
    if (p.type === 'cloud-batch-landed') landed.push({ ...p, at: e.timestamp });
  }
  const ok = launched.filter((x) => x.ok);
  const count = (rows, key) => rows.reduce((m, x) => { const k = x[key] || 'unknown'; m[k] = (m[k] || 0) + 1; return m; }, {});
  const landedBatches = new Set(landed.map((x) => x.batch));
  const openBatches = [...new Set(ok.map((x) => x.batch))].filter((b) => !landedBatches.has(b));
  return {
    known: true,
    launched: ok.length,
    failed: launched.length - ok.length,
    by_account: count(ok, 'account_lane'),
    by_repo: count(ok, 'repo'),
    batches_open: openBatches,
    batches_landed: landed.filter((x) => inWin({ timestamp: x.at })).map((x) => ({ batch: x.batch, repo: x.repo, pr: x.pr, items: (x.items || []).length })),
    last: ok.length ? ok[ok.length - 1].at : null,
  };
}

function collectCloud(win, opts) {
  let hb = null;
  try {
    const router = require('./cwos-overflow-router');
    const repo = opts.localOnly ? null : resolveRepo(opts.computeRepo);
    hb = router.homebaseRoot({}, repo && repo.known ? repo.path : null);
    const ev = router.readOverflowEvents(hb);
    if (!ev.ok) return unknown(ev.why);
    return { ...cloudSummary(ev.events, win.sinceMs, win.untilMs), source: `${hb} event log` };
  } catch (err) { return unknown(`could not read the overflow events${hb ? ` in ${hb}` : ''}: ${err.message}`); }
}

function collectCodex(win) {
  const { measureCodex } = require('./lib/codex-usage');
  try {
    const c = measureCodex({ sinceMs: win.sinceMs, untilMs: win.untilMs });
    if (!c.readable) return unknown(c.reason);
    return { known: true, ...c };
  } catch (err) { return unknown(`could not read Codex sessions: ${err.message}`); }
}

function collectCompute(opts) {
  const out = {};
  // This machine's own arbiter, if it runs one.
  const st = readJson(path.join(HOME, 'fleet', 'arbiter', 'status.json'));
  const adm = readJson(path.join(HOME, 'fleet', 'arbiter', 'admission.json'));
  out.local_arbiter = st
    ? { known: true, node: (adm && adm.node) || st.node || os.hostname(), at: st.at, source: '~/fleet/arbiter/status.json',
        admit: st.decision ? st.decision.admit : (adm && adm.queued ? adm.queued.admit : null),
        reason: st.decision ? st.decision.reason : (adm && adm.queued ? adm.queued.reason : st.headline || null) }
    : unknown('no ~/fleet/arbiter/status.json on this machine');

  const host = opts.node1Host;
  const onNode1 = os.hostname().toLowerCase() === host.toLowerCase();
  if (onNode1) {
    out.node1_arbiter = out.local_arbiter;
  } else if (opts.localOnly) {
    out.node1_arbiter = unknown('--local-only: ssh not attempted');
  } else {
    const r = spawnSync('ssh', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=8', host,
      'Get-Content $env:USERPROFILE\\fleet\\arbiter\\status.json -Raw'], { encoding: 'utf8', timeout: 20000, windowsHide: true });
    const text = String(r.stdout || '');
    const i = text.indexOf('{');
    let j = null;
    if (i !== -1) { try { j = JSON.parse(text.slice(i)); } catch { j = null; } }
    out.node1_arbiter = j
      ? { known: true, node: j.node || host, at: j.at, source: `ssh ${host} ~/fleet/arbiter/status.json`, headline: j.headline || null,
          alerts: Array.isArray(j.alerts) ? j.alerts.map((a) => a.text || a.id) : [] }
      : unknown(r.error ? `ssh ${host}: ${r.error.code || r.error.message}` : `ssh ${host} returned no status (exit ${r.status})`);
  }

  if (opts.localOnly) {
    out.queue = unknown('--local-only: compute script not run');
    out.broker = unknown('--local-only: broker check not run');
    return out;
  }
  const repo = resolveRepo(opts.computeRepo);
  if (isUnknown(repo)) {
    out.queue = unknown(repo.why);
    out.broker = unknown(repo.why);
    return out;
  }
  const fc = path.join(repo.path, 'kit', 'scripts', 'cwos-fleet-compute.js');
  if (!fs.existsSync(fc)) out.queue = unknown(`${opts.computeRepo} has no cwos-fleet-compute.js`);
  else {
    const r = runJson(process.execPath, [fc, 'status', '--json'], { cwd: repo.path });
    out.queue = r.error ? unknown(`cwos-fleet-compute status: ${r.error}`)
      : r.value.reachable === false ? unknown(`compute node unreachable: ${r.value.reason || 'no reason given'}`)
        : { known: true, source: 'cwos-fleet-compute.js status', host: r.value.host, running: r.value.running, queued: r.value.queued || [],
            idle: r.value.idle, ready: (r.value.ready || []).slice(0, 3), needs_spec: (r.value.needs_spec || []).length, done: r.value.doneCount };
  }
  const df = path.join(repo.path, 'scripts', 'check-deploy-freshness.mjs');
  if (!fs.existsSync(df)) out.broker = unknown(`${opts.computeRepo} has no check-deploy-freshness.mjs`);
  else {
    const r = runJson(process.execPath, [df, '--json'], { cwd: repo.path });
    out.broker = r.error ? unknown(`check-deploy-freshness: ${r.error}`)
      : { known: true, source: `${opts.computeRepo} scripts/check-deploy-freshness.mjs`, repo: opts.computeRepo, deploy: r.value.deploy || null,
          mergeBacklog: r.value.mergeBacklog || null, pipeline: r.value.pipeline || null };
  }
  return out;
}

// ─── next action ────────────────────────────────────────────────────────────

/** Pure. The single most useful thing to do next, from the collected board. */
function nextAction(b) {
  const accounts = (b.claude && b.claude.accounts) || [];
  const br = b.compute && b.compute.broker;
  if (br && br.known && br.deploy && br.deploy.level === 'red' && br.deploy.ciConclusion && br.deploy.ciConclusion !== 'success') {
    const jobs = (br.deploy.failingJobs || []).map((j) => j.name).join(', ') || 'a required job';
    return `Get ${br.repo}'s main branch green again (failing: ${jobs}) - until it is, nothing merges and nothing deploys. Start: gh run view ${br.deploy.ciRunId} --log-failed`;
  }
  const hot = accounts.filter((a) => a.limit && a.limit.known && a.limit.seven_day_pct >= 85);
  if (hot.length) {
    const a = hot[0];
    return `Account ${a.label} has used ${Math.round(a.limit.seven_day_pct)}% of its weekly limit (resets ${a.limit.seven_day_resets}) - send helper agents to Sonnet or hold big runs until then.`;
  }
  if (br && br.known && br.mergeBacklog && br.mergeBacklog.level === 'red') {
    return `Merge finished work: ${br.mergeBacklog.undeployed} commits are not on ${br.repo}'s main, the oldest ${br.mergeBacklog.oldestAgeDays} days old.`;
  }
  const q = b.compute && b.compute.queue;
  if (q && q.known && !q.running && !(q.queued || []).length && q.ready && q.ready.length) {
    return `The compute node is idle with work ready - feed it: node kit/scripts/cwos-fleet-compute.js feed (next: ${q.ready[0].id}).`;
  }
  if (accounts.length && accounts.every((a) => isUnknown(a.limit))) {
    return 'Wire the weekly-limit capture (one statusLine line in settings.json, see cwos-statusline-capture.js) so this board can show how much of the week is left.';
  }
  const d = b.claude && b.claude.tokens && b.claude.tokens.known && b.claude.tokens.report.delegation;
  if (d && d.agent_calls >= 20 && d.named_pct != null && d.named_pct < 30) {
    return `Only ${d.named_pct}% of helper agents named a model; the rest ran on the session's model. Name a cheaper model for search and review helpers.`;
  }
  return 'Nothing needs you: no limit is close, the pipeline is green and the compute node is busy.';
}

// ─── render ─────────────────────────────────────────────────────────────────

const big = (n) => {
  if (n == null) return '-';
  const a = Math.abs(n);
  if (a >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (a >= 1e4) return `${(n / 1e3).toFixed(0)}k`;
  return Number(n).toLocaleString('en-US');
};
const show = (v, fn) => (isUnknown(v) ? `unknown (${v ? v.why : 'not collected'})` : fn(v));
const day = (ms) => new Date(ms).toISOString().slice(0, 16).replace('T', ' ');

function render(b) {
  const L = [];
  const win = `${day(b.window.sinceMs)} -> ${b.window.untilMs ? day(b.window.untilMs) : 'now'} UTC`;
  L.push(`Resource board - ${day(b.generatedMs)} UTC, on ${b.host}`);
  L.push(`Window for every usage figure below: ${win}`);
  L.push('');

  L.push('CLAUDE TOKENS');
  const t = b.claude.tokens;
  if (isUnknown(t)) L.push(`  ${show(t)}`);
  else {
    const r = t.report;
    const total = r.by_model.reduce((s, m) => s + m.tokens, 0);
    const cacheRead = r.main.cache_read + r.subagents.cache_read;
    const subTotal = r.subagents.input + r.subagents.cache_write + r.subagents.cache_read + r.subagents.output;
    L.push(`  source: transcripts in ${b.claude.source}`);
    L.push(`  ${big(total)} tokens in ${r.sessions_count} sessions. ${total ? Math.round((100 * cacheRead) / total) : 0}% of it is context re-read from cache each reply (the cheap kind).`);
    L.push(`  Helper agents (subagents) account for ${big(subTotal)} of it (${total ? Math.round((100 * subTotal) / total) : 0}%).`);
    L.push('  By model                        all tokens     written    share');
    for (const m of r.by_model.slice(0, 6)) {
      L.push(`    ${m.model.padEnd(28)}${big(m.tokens).padStart(12)}${big(m.output).padStart(12)}${`${total ? Math.round((100 * m.tokens) / total) : 0}%`.padStart(8)}`);
    }
    L.push('');
    const d = r.delegation;
    L.push('DELEGATION (same window, same transcripts)');
    L.push(`  ${d.agent_calls} helper agents dispatched; ${d.from_main} of them from ${big(d.main_replies)} main-session replies = ${d.per_100_replies == null ? 'unknown (no main replies in window)' : `${d.per_100_replies} per 100 replies`}.`);
    L.push(`  ${d.named_pct == null ? 'unknown (no dispatches)' : `${d.named_pct}%`} named a model; the rest inherited the session's model.`);
    const pairs = Object.entries(d.requested_to_actual).sort((x, y) => y[1] - x[1]).slice(0, 5)
      .map(([k, v]) => `${k.replace(/claude-/g, '')} ${v}`);
    if (pairs.length) L.push(`  asked -> ran: ${pairs.join('; ')}`);
    L.push('');
    L.push('BY REPO (top 5, all tokens)');
    for (const g of r.by_repo.slice(0, 5)) L.push(`    ${g.name.padEnd(32)}${big(g.tokens).padStart(10)}  ${g.sessions} sessions, ${g.agent_calls} helpers`);
  }
  L.push('');

  L.push('ACCOUNTS AND WEEKLY LIMIT');
  for (const a of b.claude.accounts) {
    const who = `${a.label}${a.default ? ' [default]' : ''}${a.email ? ` (${a.email})` : ''}`;
    const toks = isUnknown(a.tokens) ? show(a.tokens) : `${big(a.tokens.value)} tokens in ${a.tokens.sessions} sessions`;
    L.push(`  ${who} - ${a.dir}`);
    L.push(`    usage: ${toks}`);
    L.push(`    weekly limit: ${show(a.limit, (l) => `${Math.round(l.seven_day_pct)}% used, resets ${l.seven_day_resets ? day(Date.parse(l.seven_day_resets)) : 'unknown'} UTC${l.five_hour_pct != null ? `; 5-hour window ${Math.round(l.five_hour_pct)}%` : ''} (reading ${l.age}, from ${RATE_FILE})`)}`);
  }
  if (b.claude.unattributed) {
    const from = Object.entries(b.claude.unattributed.launched_from || {}).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${v}`).join(', ');
    L.push(`  account unknown for ${big(b.claude.unattributed.tokens)} tokens in ${b.claude.unattributed.sessions} sessions: no config dir's prompt history names them (launched from: ${from || 'unrecorded'})`);
  }
  L.push('');

  L.push('CLOUD SESSIONS (claude --cloud, launched by cwos-overflow-router; Anthropic VMs, no fleet compute)');
  L.push(`  ${show(b.cloud, (c) => {
    const acct = Object.entries(c.by_account).map(([k, v]) => `${k} ${v}`).join(', ');
    const parts = [`${c.launched} launched in the window${acct ? ` (${acct})` : ''}`];
    if (c.failed) parts.push(`${c.failed} failed to start`);
    parts.push(`${c.batches_open.length} batch(es) not yet landed${c.batches_open.length ? `: ${c.batches_open.join(', ')}` : ''}`);
    parts.push(`${c.batches_landed.length} landed as one PR each`);
    return `${parts.join('; ')}. source: ${c.source}`;
  })}`);
  L.push('');

  L.push('CODEX');
  L.push(`  ${show(b.codex, (c) => {
    if (!c.usage_recorded) return `${c.sessions} sessions; the rollout files carry no token usage, so tokens are unknown`;
    const models = c.by_model.map((m) => `${m.model} ${big(m.total_tokens)}`).join(', ') || 'none';
    return `${c.sessions} sessions (${c.subagent_sessions} were Codex sub-agents), ${big(c.total.total_tokens)} tokens: ${models}. source: ${c.root}`;
  })}`);
  if (!isUnknown(b.codex)) {
    const rl = b.codex.rate_limits;
    const sec = rl && rl.secondary;
    let line;
    if (!sec) line = 'unknown (no rate-limit reading in any rollout)';
    else if (sec.resets_at && sec.resets_at * 1000 <= b.generatedMs) line = `unknown (last reading ${ageText(rl.at, b.generatedMs)}; its week has since reset)`;
    else line = `${Math.round(sec.used_percent)}% used at the last Codex run (${ageText(rl.at, b.generatedMs)}), resets ${sec.resets_at ? day(sec.resets_at * 1000) : 'unknown'} UTC; plan ${rl.plan_type || 'unknown'}`;
    L.push(`  weekly limit: ${line}`);
  }
  L.push('');

  L.push('COMPUTE');
  const c = b.compute;
  L.push(`  ${show(c.local_arbiter, (a) => `${a.node} arbiter (${a.source}, ${ageText(a.at, b.generatedMs)}): ${a.admit ? 'admitting queued compute' : 'holding queued compute'} - ${a.reason || 'no reason given'}`)}`
    .replace(/^ {2}unknown/, '  this machine\'s arbiter: unknown'));
  L.push(`  ${show(c.node1_arbiter, (a) => `${a.node} arbiter (${a.source}, ${ageText(a.at, b.generatedMs)}): ${a.headline || 'no headline'}`)}`
    .replace(/^ {2}unknown/, '  node1 arbiter: unknown'));
  L.push(`  ${show(c.queue, (q) => {
    const running = q.running ? `running ${typeof q.running === 'string' ? q.running : (q.running.id || q.running.job || 'a job')}` : 'running nothing';
    const next = q.ready && q.ready.length ? `next ready: ${q.ready[0].id} - ${q.ready[0].title.slice(0, 70)}` : 'nothing ready to run';
    return `compute queue on ${q.host} (${q.source}): ${running}; ${q.queued.length} queued; ${next}`;
  })}`.replace(/^ {2}unknown/, '  compute queue: unknown'));
  L.push(`  ${show(c.broker, (x) => {
    const dep = x.deploy ? `${x.deploy.level.toUpperCase()}${x.deploy.hoursSinceSuccessfulDeploy != null ? `, last deploy ${(x.deploy.hoursSinceSuccessfulDeploy / 24).toFixed(1)} days ago` : ''}${x.deploy.ciConclusion && x.deploy.ciConclusion !== 'success' ? `, main CI ${x.deploy.ciConclusion}` : ''}` : 'unknown (no deploy axis)';
    const pipe = x.pipeline ? `${x.pipeline.armed} PRs armed to merge${x.pipeline.hold ? ` (holding: ${x.pipeline.hold})` : ''}` : 'unknown (no pipeline axis)';
    return `${x.repo} deploy + PR broker (${x.source}): deploy ${dep}; ${pipe}`;
  })}`.replace(/^ {2}unknown/, '  deploy + PR broker: unknown'));
  L.push(`  ${show(c.broker, (x) => (x.mergeBacklog ? `merge backlog: ${x.mergeBacklog.undeployed} commits on local branches not on main, oldest ${x.mergeBacklog.oldestAgeDays} days (${x.mergeBacklog.level})` : 'merge backlog: unknown (no backlog axis)'))}`
    .replace(/^ {2}unknown/, '  merge backlog: unknown'));
  L.push('');
  L.push(`NEXT: ${b.next}`);
  return L.join('\n');
}

// ─── main ───────────────────────────────────────────────────────────────────

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);
  const nowMs = Date.now();
  const win = windowFrom(values, nowMs);
  const localOnly = values['local-only'];
  const ai = localOnly ? unknown('local-only') : resolveRepo('ai-personal');
  const lanesFile = isUnknown(ai) ? null : path.join(ai.path, 'nodes', 'claude-lanes.json');

  const board = { generatedMs: nowMs, host: os.hostname(), window: win };
  try { board.claude = collectClaude(win, lanesFile); }
  catch (err) { board.claude = { tokens: unknown(`token meter failed: ${err.message}`), accounts: [] }; }
  board.codex = collectCodex(win);
  board.cloud = collectCloud(win, { localOnly, computeRepo: values['compute-repo'] || 'claude-poker-tracker' });
  board.compute = collectCompute({ localOnly, computeRepo: values['compute-repo'] || 'claude-poker-tracker', node1Host: values['node1-host'] || 'cm-node1' });
  board.next = nextAction(board);

  if (values.json) {
    const j = { ...board, window: { since: new Date(win.sinceMs).toISOString(), until: win.untilMs ? new Date(win.untilMs).toISOString() : null } };
    if (j.claude.tokens && j.claude.tokens.report) {
      const { sessions, startup, tool_results, command_bodies, context_per_reply, ...keep } = j.claude.tokens.report;
      j.claude = { ...j.claude, tokens: { known: true, ...keep } };
    }
    console.log(JSON.stringify(j, null, 2));
  } else {
    console.log(render(board));
  }
}

if (require.main === module) main();

module.exports = { unknown, isUnknown, limitPosition, nextAction, render, mergeReports, show, addDeclaredLanes, cloudSummary };
