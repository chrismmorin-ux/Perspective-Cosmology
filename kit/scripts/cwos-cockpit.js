#!/usr/bin/env node
'use strict';

/**
 * cwos-cockpit — every Claude session on this machine on one screen, the ones
 * that need Chris first (option C, phase 1: read-only).
 *
 * WHY THIS EXISTS. On 2026-11-03 twelve sessions were open across six repos,
 * held in VS Code windows. One had been waiting on a permission prompt and no
 * surface showed it. CWOS's own session registry counted six sessions from
 * Oct 31 as live. Claude Code itself already knows the truth: `claude agents
 * --json` lists every running session, pid-backed, with its status and what it
 * is waiting for. This script reads that and adds what Claude Code does not
 * show: memory held, context size, minutes since the session last wrote
 * anything, and the CWOS work items it claims.
 *
 * READ-ONLY. It never stops, starts or messages a session. Phase 2 adds those.
 *
 * SOURCES, and what happens when one is unreadable:
 *   claude agents --json   the live list. Unreadable -> BLIND, never an empty OK.
 *   tasklist               memory per pid. Missing -> "unknown", not 0.
 *   ~/.claude/projects     transcript tail: context tokens + last write time.
 *   <repo>/.claude/workstream/sessions   CWOS claims; and CWOS rows that say
 *                          "active" with no live process on this host (ghosts).
 *
 * KNOBS (pr-backlog-standard: every signal carries a metric and a knob):
 *   --restart-context, --cold-minutes   when a quiet session is cheaper restarted
 *                    from a handoff than continued (session-restart-payback.md)
 *   --stall-minutes  a busy session with no transcript write this long
 *   --idle-hours     an idle session this old is a close candidate
 */

require('./lib/preflight');

const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawnSync } = require('child_process');
const { cliGate } = require('./lib/cli');

const CLI = {
  name: 'cwos-cockpit',
  summary: 'every Claude session on this machine on one screen, the ones that need you first (read-only)',
  usage: 'cwos-cockpit <show|serve> [options]',
  subcommands: {
    show: 'print the board once (default)',
    serve: 'serve the board as a self-refreshing page on 127.0.0.1',
    handoffs: 'the handoff measure: of sessions that stopped in the window, how many left a ready handoff (target 80%)',
  },
  flags: {
    json: { type: 'boolean', describe: 'show: machine-readable output' },
    port: { type: 'string', describe: 'serve: port on 127.0.0.1 (default 4317)' },
    'restart-context': { type: 'string', describe: 'context tokens at which a cold session is cheaper restarted from a handoff (default 240000)' },
    'cold-minutes': { type: 'string', describe: 'quiet this long = prompt cache cold (default 60, the 1-hour TTL)' },
    'stall-minutes': { type: 'string', describe: 'busy with no transcript write this long = stalled (default 20)' },
    'idle-hours': { type: 'string', describe: 'idle this long = close candidate (default 8)' },
    days: { type: 'string', describe: 'handoffs: window in days (default 7)' },
    root: { type: 'string', describe: 'handoffs: folder holding the repos to census (default: the folder this repo sits in)' },
  },
  notes: [
    'Exit codes: 0 board printed (any state), 1 the live session list was unreadable (BLIND), 2 bad command line.',
  ],
};

const HOME = process.env.USERPROFILE || os.homedir();
// restart lane = docs/designs/session-restart-payback.md decision 2: restarting
// pays only when the prompt cache is cold (idle past its 1-hour TTL) and the live
// context C is well above a fresh session's start-up context S (C - S > 150k).
// S measured 2026-11-03: median first-reply context 88k over 31 local sessions
// (homebase, ai-personal, claude-poker-tracker, deckside), so C >= ~240k.
// A warm, working session is never told to restart (decision 1 of that doc).
const DEFAULTS = { restartContext: 240000, coldMinutes: 60, stallMinutes: 20, idleHours: 8, port: 4317 };
const TAIL_BYTES = 256 * 1024;

// ─── readers (impure, each degrades to "unknown") ───────────────────────────

/** The live list from Claude Code itself. Returns {ok, agents|why}. */
function readAgents() {
  const r = spawnSync('claude', ['agents', '--json'], { encoding: 'utf8', timeout: 30000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
  if (r.error) return { ok: false, why: `claude agents could not run: ${r.error.code || r.error.message}` };
  if (r.status !== 0) return { ok: false, why: `claude agents exited ${r.status}: ${(r.stderr || '').trim().slice(0, 200)}` };
  try {
    const agents = JSON.parse(r.stdout);
    if (!Array.isArray(agents)) return { ok: false, why: 'claude agents --json did not return a list' };
    return { ok: true, agents };
  } catch (e) {
    return { ok: false, why: `claude agents --json was not JSON: ${e.message}` };
  }
}

/** pid -> resident memory in MB, from tasklist. Empty map when unreadable. */
function readMemory() {
  if (process.platform !== 'win32') return new Map();
  const r = spawnSync('tasklist', ['/FO', 'CSV', '/NH'], { encoding: 'utf8', timeout: 15000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
  return r.status === 0 ? parseTasklist(r.stdout) : new Map();
}

/** Where Claude Code keeps a session's transcript. Null when not found. */
function transcriptPath(cwd, sessionId) {
  const root = path.join(HOME, '.claude', 'projects');
  const direct = path.join(root, encodeProjectDir(cwd), `${sessionId}.jsonl`);
  if (fs.existsSync(direct)) return direct;
  try {
    for (const d of fs.readdirSync(root)) {
      const p = path.join(root, d, `${sessionId}.jsonl`);
      if (fs.existsSync(p)) return p;
    }
  } catch { /* no projects dir */ }
  return null;
}

/** {lastWriteMs, contextTokens} from a transcript, each null when unknown. */
function readTranscript(file) {
  if (!file) return { lastWriteMs: null, contextTokens: null };
  try {
    const st = fs.statSync(file);
    const len = Math.min(st.size, TAIL_BYTES);
    const fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, st.size - len);
    fs.closeSync(fd);
    return { lastWriteMs: st.mtimeMs, contextTokens: lastContextTokens(buf.toString('utf8')) };
  } catch {
    return { lastWriteMs: null, contextTokens: null };
  }
}

/** The CWOS workstream dir for a session's cwd (main tree for a worktree). */
function workstreamFor(cwd) {
  try {
    const { findWorkstreamDir } = require('./lib/cwos-utils');
    const ws = findWorkstreamDir(cwd);
    return ws && fs.existsSync(path.join(ws, 'sessions')) ? ws : null;
  } catch { return null; }
}

/**
 * The rolling handoff the report hook keeps for a session (session-handoff.js):
 * {handoff, facts}, each null when the session has written none yet.
 */
function readHandoff(ws, sessionId) {
  const empty = { handoff: null, facts: null };
  if (!ws || !sessionId) return empty;
  const dir = path.join(ws, 'reports');
  const short = String(sessionId).slice(0, 8);
  try {
    const hit = fs.readdirSync(dir).find((f) => f.endsWith(`-${short}.md`));
    if (!hit) return empty;
    const { fromFrontmatter } = require('./lib/session-handoff');
    return fromFrontmatter(fs.readFileSync(path.join(dir, hit), 'utf8'));
  } catch { return empty; }
}

/** All CWOS session rows in a workstream: [{id, status, host, agentSessionId, claims}]. */
function readCwosSessions(ws) {
  const dir = path.join(ws, 'sessions');
  const rows = [];
  let names = [];
  try { names = fs.readdirSync(dir).filter((n) => /^ses-.*\.yaml$/.test(n)); } catch { return rows; }
  for (const n of names) {
    try { rows.push(parseCwosSession(fs.readFileSync(path.join(dir, n), 'utf8'))); } catch { /* unreadable row */ }
  }
  return rows;
}

// ─── pure helpers (tested) ──────────────────────────────────────────────────

/**
 * Last path segment, for either separator. path.basename on Linux does not split
 * on "\", and claude agents reports Windows paths: CI caught that on 2026-11-03.
 */
function baseName(p) {
  const parts = String(p || '').split(/[\\/]+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '';
}

/** "<repo>/.claude/workstream" (either separator) -> "<repo>". */
function repoOfWorkstream(ws) {
  const parts = String(ws || '').split(/[\\/]+/).filter(Boolean);
  return parts.length >= 3 ? parts[parts.length - 3] : baseName(ws);
}

/** "C:\Users\chris\repos\homebase" -> "C--Users-chris-repos-homebase". */
function encodeProjectDir(cwd) {
  return String(cwd || '').replace(/[^a-zA-Z0-9]/g, '-');
}

/** tasklist /FO CSV /NH text -> Map(pid -> {mb, image}). */
function parseTasklist(text) {
  const m = new Map();
  for (const line of String(text || '').split(/\r?\n/)) {
    const cells = line.match(/"([^"]*)"/g);
    if (!cells || cells.length < 5) continue;
    const image = cells[0].slice(1, -1);
    const pid = Number(cells[1].slice(1, -1));
    const kb = Number(cells[4].slice(1, -1).replace(/[^0-9]/g, ''));
    if (Number.isFinite(pid) && Number.isFinite(kb)) m.set(pid, { mb: Math.round(kb / 1024), image });
  }
  return m;
}

/** The window holders whose cost the cockpit makes visible: image -> {processes, mb}. */
const HOLDERS = ['Code.exe', 'Cursor.exe', 'WindowsTerminal.exe'];
function holderMemory(memory) {
  const out = {};
  for (const { mb, image } of memory.values()) {
    if (!HOLDERS.includes(image)) continue;
    out[image] = out[image] || { processes: 0, mb: 0 };
    out[image].processes++;
    out[image].mb += mb;
  }
  return out;
}

/** Context tokens on the last assistant turn; one definition, shared with the report hook. */
const { lastContextTokens } = require('./lib/session-handoff');

/** A CWOS session yaml -> the four fields the cockpit needs. Regex, not a YAML lib: the format is ours. */
function parseCwosSession(text) {
  const field = (k) => { const m = text.match(new RegExp(`^${k}:\\s*"?([^"\\n]*)"?\\s*$`, 'm')); return m ? m[1].trim() : null; };
  const claims = [];
  const block = text.match(/^claimed_items:\s*\n((?:\s+-\s+.*\n?)*)/m);
  if (block) for (const m of block[1].matchAll(/-\s+"?([^"\n]+)"?/g)) claims.push(m[1].trim());
  return { id: field('id'), status: field('status'), host: field('host'), agentSessionId: field('agent_session_id'), claims };
}

/**
 * One row per live session, with a lane and one line of advice.
 * Lanes, in the order they are shown:
 *   needs-you  Claude Code says it is waiting (permission prompt, question)
 *   stalled    busy, but no transcript write for stallMinutes
 *   handed-off not working, and its last handoff block meets its reason's
 *              standard: start a new session with the prompt it left
 *   restart    not working, cache cold, context >= restartContext: a fresh
 *              session from a handoff is cheaper than the next reply here
 *   busy       working
 *   stale      idle for idleHours or more: close candidate
 *   idle       finished its turn, waiting for a next message
 */
function classify(row, now, knobs) {
  const minsQuiet = row.lastWriteMs == null ? null : (now - row.lastWriteMs) / 60000;
  const st = String(row.status || '').toLowerCase();
  const h = row.handoff || null;
  if (st === 'waiting') return { lane: 'needs-you', advice: `waiting for ${row.waitingFor || 'you'}` };
  if (st === 'busy' && minsQuiet != null && minsQuiet >= knobs.stallMinutes) {
    const cold = minsQuiet >= knobs.coldMinutes ? ' Its cache is cold, so ending it and picking up from a handoff costs less than nudging it.' : '';
    const left = h && h.ready ? ' Its last handoff is ready.' : '';
    return { lane: 'stalled', advice: `busy but silent for ${fmtAge(minsQuiet)}.${cold || ' Check it.'}${left}` };
  }
  if (st !== 'busy' && h && h.ready) {
    return { lane: 'handed-off', advice: `${h.reason}: ready to hand off — start a new session with its prompt` };
  }
  if (st !== 'busy' && minsQuiet != null && minsQuiet >= knobs.coldMinutes
      && row.contextTokens != null && row.contextTokens >= knobs.restartContext) {
    return { lane: 'restart', advice: `cache cold (${fmtAge(minsQuiet)} quiet) with ${fmtTokens(row.contextTokens)} of context: hand off and start fresh rather than reply here` };
  }
  if (st === 'busy') return { lane: 'busy', advice: 'working' };
  const notReady = h && !h.ready && h.problems && h.problems.length ? ` · handoff not ready: ${h.problems[0]}` : '';
  if (minsQuiet != null && minsQuiet >= knobs.idleHours * 60) {
    return { lane: 'stale', advice: `idle ${fmtAge(minsQuiet)}: close it if its work is saved${notReady}` };
  }
  return { lane: 'idle', advice: `idle${notReady}` };
}

const LANE_ORDER = ['needs-you', 'stalled', 'handed-off', 'restart', 'busy', 'stale', 'idle'];

/**
 * Pure: everything read -> the board. Inputs are plain data so tests need no
 * processes: agents (claude agents --json), memory Map, transcripts Map(sessionId
 * -> {lastWriteMs, contextTokens}), cwos Map(workstreamDir -> rows), wsBySession
 * Map(sessionId -> workstreamDir), handoffs Map(sessionId -> rolling handoff,
 * optional), host name.
 */
function buildBoard({ agents, memory, transcripts, cwos, wsBySession, handoffs, host, now, knobs }) {
  const liveIds = new Set(agents.map((a) => a.sessionId));
  const rows = agents.map((a) => {
    const t = transcripts.get(a.sessionId) || {};
    const ws = wsBySession.get(a.sessionId) || null;
    const mine = ws ? (cwos.get(ws) || []).find((c) => c.agentSessionId === a.sessionId) : null;
    const row = {
      name: a.name || a.sessionId.slice(0, 8),
      sessionId: a.sessionId,
      pid: a.pid,
      repo: baseName(a.cwd),
      cwd: a.cwd,
      kind: a.kind,
      status: a.status,
      waitingFor: a.waitingFor || null,
      startedMs: a.startedAt || null,
      memoryMB: memory.has(a.pid) ? memory.get(a.pid).mb : null,
      contextTokens: t.contextTokens == null ? null : t.contextTokens,
      lastWriteMs: t.lastWriteMs == null ? null : t.lastWriteMs,
      claims: mine ? mine.claims : [],
      handoff: (handoffs && handoffs.get(a.sessionId)) || null,
    };
    return { ...row, ...classify(row, now, knobs) };
  });
  rows.sort((x, y) => (LANE_ORDER.indexOf(x.lane) - LANE_ORDER.indexOf(y.lane)) || ((x.lastWriteMs || 0) - (y.lastWriteMs || 0)));

  // CWOS rows that say active on this host with no live process behind them.
  const ghosts = [];
  const hostLc = String(host || '').toLowerCase();
  for (const [ws, list] of cwos) {
    for (const c of list) {
      if (c.status !== 'active') continue;
      if (String(c.host || '').toLowerCase() !== hostLc) continue;
      if (c.agentSessionId && liveIds.has(c.agentSessionId)) continue;
      ghosts.push({ id: c.id, repo: repoOfWorkstream(ws), claims: c.claims });
    }
  }

  const count = (lane) => rows.filter((r) => r.lane === lane).length;
  const mem = rows.map((r) => r.memoryMB).filter((v) => v != null);
  return {
    generatedMs: now,
    host,
    knobs,
    health: count('needs-you') || count('stalled') ? 'RED' : 'OK',
    summary: {
      sessions: rows.length,
      needsYou: count('needs-you'),
      stalled: count('stalled'),
      handedOff: count('handed-off'),
      restart: count('restart'),
      busy: count('busy'),
      stale: count('stale'),
      idle: count('idle'),
      memoryMB: mem.length ? mem.reduce((a, b) => a + b, 0) : null,
      memoryKnownFor: mem.length,
      ghosts: ghosts.length,
    },
    holders: holderMemory(memory),
    rows,
    ghosts,
  };
}

/**
 * Pure: the handoff measure (docs/designs/session-handoff.md). reports:
 * [{repo, sessionId, updatedMs, handoff}] one per session. A STOP is a report
 * updated inside the window whose session is no longer live. Baseline before the
 * standard: 1 usable start prompt in 150 endings. Target: 80% ready.
 */
function handoffCensus(reports, liveIds, now, days) {
  const since = now - days * 86400000;
  const seen = new Set();
  const stops = [];
  for (const r of reports) {
    if (!r.sessionId || seen.has(r.sessionId)) continue;
    seen.add(r.sessionId);
    if (r.updatedMs == null || r.updatedMs < since || liveIds.has(r.sessionId)) continue;
    stops.push(r);
  }
  const withBlock = stops.filter((r) => r.handoff);
  const ready = withBlock.filter((r) => r.handoff.ready);
  const byReason = {};
  for (const r of withBlock) byReason[r.handoff.reason || 'unknown'] = (byReason[r.handoff.reason || 'unknown'] || 0) + 1;
  const problems = {};
  for (const r of withBlock) for (const p of r.handoff.problems || []) problems[p.replace(/\d+/g, 'N')] = (problems[p.replace(/\d+/g, 'N')] || 0) + 1;
  const pct = stops.length ? Math.round((ready.length / stops.length) * 100) : null;
  return {
    days,
    stops: stops.length,
    withBlock: withBlock.length,
    ready: ready.length,
    readyPct: pct,
    target: 80,
    health: pct == null ? 'BLIND' : pct >= 80 ? 'OK' : 'RED',
    byReason,
    problems,
  };
}

function fmtAge(mins) {
  if (mins == null) return 'unknown';
  if (mins < 1) return 'now';
  if (mins < 60) return `${Math.round(mins)}m`;
  if (mins < 48 * 60) return `${Math.round(mins / 60)}h`;
  return `${Math.round(mins / 1440)}d`;
}

function fmtTokens(n) {
  if (n == null) return 'unknown';
  return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
}

// ─── gather (impure) ────────────────────────────────────────────────────────

function gather(knobs, now = Date.now()) {
  const live = readAgents();
  if (!live.ok) return { blind: true, why: live.why, generatedMs: now, host: os.hostname() };
  const memory = readMemory();
  const transcripts = new Map();
  const wsBySession = new Map();
  const cwos = new Map();
  const wsByCwd = new Map();
  for (const a of live.agents) {
    transcripts.set(a.sessionId, readTranscript(transcriptPath(a.cwd, a.sessionId)));
    if (!wsByCwd.has(a.cwd)) wsByCwd.set(a.cwd, workstreamFor(a.cwd));
    const ws = wsByCwd.get(a.cwd);
    if (ws) {
      wsBySession.set(a.sessionId, ws);
      if (!cwos.has(ws)) cwos.set(ws, readCwosSessions(ws));
    }
  }
  const handoffs = new Map();
  for (const a of live.agents) {
    const { handoff } = readHandoff(wsBySession.get(a.sessionId), a.sessionId);
    if (handoff) handoffs.set(a.sessionId, handoff);
  }
  return buildBoard({ agents: live.agents, memory, transcripts, cwos, wsBySession, handoffs, host: os.hostname(), now, knobs });
}

/** Every session report under <root>/<repo>/.claude/workstream/reports -> census input. */
function gatherHandoffs(root, days, now = Date.now()) {
  const { fromFrontmatter } = require('./lib/session-handoff');
  const reports = [];
  let repos = [];
  try { repos = fs.readdirSync(root); } catch { return { blind: true, why: `cannot read ${root}` }; }
  for (const repo of repos) {
    const dir = path.join(root, repo, '.claude', 'workstream', 'reports');
    let files = [];
    try { files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')); } catch { continue; }
    for (const f of files) {
      try {
        const file = path.join(dir, f);
        const text = fs.readFileSync(file, 'utf8');
        const sid = (text.match(/^session: (\S+)/m) || [])[1] || null;
        const at = (text.match(/^updated_at: (\S+)/m) || [])[1];
        reports.push({ repo, sessionId: sid, updatedMs: at ? Date.parse(at) : fs.statSync(file).mtimeMs, handoff: fromFrontmatter(text).handoff });
      } catch { /* unreadable report */ }
    }
  }
  reports.sort((a, b) => (b.updatedMs || 0) - (a.updatedMs || 0)); // newest copy of a session wins
  const live = readAgents();
  const liveIds = new Set(live.ok ? live.agents.map((a) => a.sessionId) : []);
  return { ...handoffCensus(reports, liveIds, now, days), root, liveKnown: live.ok };
}

function renderCensus(c) {
  if (c.blind) return `Handoffs: BLIND — ${c.why}\n`;
  const L = [];
  L.push(`Handoffs, last ${c.days} days under ${c.root}: ${c.health} — ${c.ready} of ${c.stops} stopped sessions left a ready handoff${c.readyPct == null ? '' : ` (${c.readyPct}%)`}; target ${c.target}%.`);
  L.push(`  ${c.withBlock} wrote a handoff block; ${c.withBlock - c.ready} of those were not ready.`);
  const reasons = Object.entries(c.byReason).map(([k, v]) => `${k} ${v}`).join(' · ');
  if (reasons) L.push(`  reasons: ${reasons}`);
  const probs = Object.entries(c.problems).sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [p, n] of probs) L.push(`  not ready ×${n}: ${p}`);
  if (!c.liveKnown) L.push('  (live session list unreadable: sessions still running may be counted as stops)');
  return L.join('\n') + '\n';
}

// ─── render ─────────────────────────────────────────────────────────────────

function renderText(b) {
  if (b.blind) return `Cockpit: BLIND — ${b.why}\n`;
  const s = b.summary;
  const L = [];
  L.push(`Cockpit ${b.host}: ${b.health} — ${s.sessions} sessions · ${s.needsYou} need you · ${s.stalled} stalled · ${s.handedOff} handed off · ${s.restart} to restart · ${s.busy} busy · ${s.stale} stale · ${s.idle} idle`);
  L.push(`Memory held: ${s.memoryMB == null ? 'unknown' : `${(s.memoryMB / 1024).toFixed(1)} GB across ${s.memoryKnownFor} sessions`}`);
  const h = Object.entries(b.holders || {}).map(([k, v]) => `${k.replace(/\.exe$/, '')} ${(v.mb / 1024).toFixed(1)} GB in ${v.processes} processes`);
  if (h.length) L.push(`Window holders: ${h.join(' · ')}`);
  L.push('');
  const w = (v, n) => String(v == null ? '' : v).padEnd(n).slice(0, n);
  L.push(`${w('LANE', 10)} ${w('SESSION', 28)} ${w('REPO', 20)} ${w('MEM', 7)} ${w('CONTEXT', 8)} ${w('QUIET', 6)} WORK / ADVICE`);
  for (const r of b.rows) {
    const quiet = r.lastWriteMs == null ? 'unknown' : fmtAge((b.generatedMs - r.lastWriteMs) / 60000);
    const work = r.claims.length ? `[${r.claims.join(', ')}] ` : '';
    L.push(`${w(r.lane, 10)} ${w(r.name, 28)} ${w(r.repo, 20)} ${w(r.memoryMB == null ? '?' : `${r.memoryMB}M`, 7)} ${w(fmtTokens(r.contextTokens), 8)} ${w(quiet, 6)} ${work}${r.advice}`);
    if (r.handoff && r.handoff.ready && r.handoff.prompt) L.push(`${' '.repeat(11)}start a new session with: ${r.handoff.prompt}`);
  }
  if (b.ghosts.length) {
    L.push('');
    L.push(`CWOS registry says active with no live process (${b.ghosts.length}): ${b.ghosts.map((g) => `${g.repo}/${g.id}${g.claims.length ? ` [${g.claims.join(', ')}]` : ''}`).join('; ')}`);
  }
  return L.join('\n') + '\n';
}

function renderPage() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Session Cockpit</title>
<style>
:root{--bg:#f7f7f5;--fg:#1d1d1b;--muted:#6b6b66;--card:#fff;--line:#e3e2dd;--red:#b42318;--amber:#9a6700;--blue:#1f5fbf;--green:#2f7d32}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#151514;--fg:#ecebe6;--muted:#9b9a94;--card:#1f1f1d;--line:#33332f;--red:#ff8a80;--amber:#f2c14e;--blue:#8ab4ff;--green:#81c784}}
:root[data-theme="dark"]{--bg:#151514;--fg:#ecebe6;--muted:#9b9a94;--card:#1f1f1d;--line:#33332f;--red:#ff8a80;--amber:#f2c14e;--blue:#8ab4ff;--green:#81c784}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1100px;margin:0 auto;padding:20px 16px}
h1{font-size:18px;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 16px}
.tiles{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}.tile{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px 12px;min-width:92px}
.tile b{display:block;font-size:20px}.tile span{color:var(--muted);font-size:12px}
.row{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--line);border-radius:8px;padding:10px 12px;margin-bottom:8px;display:grid;grid-template-columns:1fr auto;gap:2px 12px}
.row .name{font-weight:600;overflow-wrap:anywhere}.row .meta{color:var(--muted);font-size:12px;text-align:right;white-space:nowrap}
.row .advice{grid-column:1/-1;font-size:13px}.row .claims{grid-column:1/-1;color:var(--muted);font-size:12px}
.lane{font-size:11px;text-transform:uppercase;letter-spacing:.04em;margin-right:6px}
.needs-you{border-left-color:var(--red)}.needs-you .lane{color:var(--red)}
.stalled{border-left-color:var(--red)}.stalled .lane{color:var(--red)}
.restart{border-left-color:var(--amber)}.restart .lane{color:var(--amber)}
.handed-off{border-left-color:var(--green)}.handed-off .lane{color:var(--green)}
.prompt{grid-column:1/-1;margin-top:6px;display:flex;gap:8px;align-items:flex-start}
.prompt code{flex:1;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:6px 8px;font:12px/1.4 ui-monospace,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere}
.prompt button{font:12px system-ui,sans-serif;padding:6px 10px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--fg);cursor:pointer}
.busy{border-left-color:var(--blue)}.busy .lane{color:var(--blue)}
.stale .lane,.idle .lane{color:var(--muted)}
.ghosts{color:var(--muted);font-size:13px;margin-top:16px}.blind{color:var(--red);font-weight:600}
@media (max-width:560px){.row{grid-template-columns:1fr}.row .meta{text-align:left}}
</style></head><body><main>
<h1>Session Cockpit</h1><p class="sub" id="sub">reading…</p>
<div class="tiles" id="tiles"></div><div id="rows"></div><div class="ghosts" id="ghosts"></div>
</main><script>
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const age=m=>m==null?'unknown':m<1?'now':m<60?Math.round(m)+'m':m<2880?Math.round(m/60)+'h':Math.round(m/1440)+'d';
const tok=n=>n==null?'?':n>=1000?Math.round(n/1000)+'k':n;
async function tick(){
  let b;try{b=await (await fetch('/api',{cache:'no-store'})).json()}catch(e){document.getElementById('sub').innerHTML='<span class="blind">BLIND — the cockpit server is not answering</span>';return}
  const sub=document.getElementById('sub');
  if(b.blind){sub.innerHTML='<span class="blind">BLIND — '+esc(b.why)+'</span>';return}
  const s=b.summary;
  sub.textContent=b.host+' · '+b.health+' · read '+new Date(b.generatedMs).toLocaleTimeString()+(s.memoryMB!=null?' · sessions hold '+(s.memoryMB/1024).toFixed(1)+' GB':'')+Object.entries(b.holders||{}).map(([k,v])=>' · '+k.replace(/[.]exe$/,'')+' '+(v.mb/1024).toFixed(1)+' GB').join('');
  const t=[['need you',s.needsYou],['stalled',s.stalled],['handed off',s.handedOff],['to restart',s.restart],['busy',s.busy],['stale',s.stale],['idle',s.idle]];
  document.getElementById('tiles').innerHTML=t.map(([k,v])=>'<div class="tile"><b>'+v+'</b><span>'+k+'</span></div>').join('');
  document.getElementById('rows').innerHTML=b.rows.map(r=>{
    const quiet=r.lastWriteMs==null?null:(b.generatedMs-r.lastWriteMs)/60000;
    return '<div class="row '+esc(r.lane)+'"><div class="name"><span class="lane">'+esc(r.lane)+'</span>'+esc(r.name)+'</div>'+
      '<div class="meta">'+esc(r.repo)+' · '+(r.memoryMB==null?'?':r.memoryMB+' MB')+' · ctx '+tok(r.contextTokens)+' · quiet '+age(quiet)+'</div>'+
      '<div class="advice">'+esc(r.advice)+'</div>'+(r.claims.length?'<div class="claims">claims '+esc(r.claims.join(', '))+'</div>':'')+
      (r.handoff&&r.handoff.ready&&r.handoff.prompt?'<div class="prompt"><code>'+esc(r.handoff.prompt)+'</code><button data-copy="'+esc(r.handoff.prompt)+'">Copy</button></div>':'')+'</div>'}).join('');
  document.getElementById('ghosts').textContent=b.ghosts.length?'CWOS registry says active with no live process: '+b.ghosts.map(g=>g.repo+'/'+g.id).join(', '):'';
}
document.addEventListener('click',async e=>{const b=e.target.closest('button[data-copy]');if(!b)return;try{await navigator.clipboard.writeText(b.dataset.copy);b.textContent='Copied'}catch{b.textContent='Select and copy'}setTimeout(()=>{b.textContent='Copy'},2000)});
tick();setInterval(tick,10000);
</script></body></html>`;
}

// ─── main ───────────────────────────────────────────────────────────────────

function knobsFrom(values) {
  const num = (v, d) => { const n = Number(v); return v == null || v === '' || !Number.isFinite(n) || n <= 0 ? d : n; };
  return {
    restartContext: num(values['restart-context'], DEFAULTS.restartContext),
    coldMinutes: num(values['cold-minutes'], DEFAULTS.coldMinutes),
    stallMinutes: num(values['stall-minutes'], DEFAULTS.stallMinutes),
    idleHours: num(values['idle-hours'], DEFAULTS.idleHours),
  };
}

function serve(knobs, port) {
  let cache = null;
  const board = () => {
    if (!cache || Date.now() - cache.at > 5000) cache = { at: Date.now(), b: gather(knobs) };
    return cache.b;
  };
  const server = http.createServer((req, res) => {
    const url = (req.url || '/').split('?')[0];
    if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
    if (url === '/api') {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
      res.end(JSON.stringify(board()));
      return;
    }
    if (url === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(renderPage());
      return;
    }
    res.writeHead(404); res.end();
  });
  server.listen(port, '127.0.0.1', () => {
    process.stdout.write(`Cockpit serving at http://127.0.0.1:${port}/ (this machine only; Ctrl+C stops it)\n`);
  });
  server.on('error', (e) => { process.stderr.write(`cockpit: ${e.message}\n`); process.exit(1); });
}

function main() {
  const argv = process.argv.slice(2);
  // A bare `cwos-cockpit` (or one with only flags) means `show`.
  if (!argv.length || argv[0].startsWith('-')) argv.unshift('show');
  if (argv.includes('--help') || argv.includes('-h')) argv.splice(0, argv[0] === 'show' ? 1 : 0);
  const { values, sub } = cliGate(argv, CLI);
  const knobs = knobsFrom(values);
  if (sub === 'serve') {
    const port = Number(values.port) || DEFAULTS.port;
    serve(knobs, port);
    return;
  }
  if (sub === 'handoffs') {
    const days = Number(values.days) > 0 ? Number(values.days) : 7;
    // Default: the folder the MAIN tree sits in (a worktree's own parent is .claude/worktrees).
    const ws = workstreamFor(__dirname);
    // The main tree is the workstream's grandparent; without one, the repo this script sits in
    // (lib/kit-paths, INV-066: no walking up from __dirname by hand). The census reads its parent.
    const repoRoot = ws ? path.dirname(path.dirname(ws)) : require('./lib/kit-paths').resolveRepoRoot({ from: __dirname });
    const root = values.root ? path.resolve(values.root) : (repoRoot ? path.dirname(repoRoot) : null);
    if (!root) { process.stderr.write('cwos-cockpit handoffs: cannot find the repo this script is in; pass --root <folder of repos>\n'); process.exit(1); }
    const c = gatherHandoffs(root, days);
    process.stdout.write(values.json ? JSON.stringify(c, null, 2) + '\n' : renderCensus(c));
    process.exit(c.blind ? 1 : 0);
  }
  const b = gather(knobs);
  process.stdout.write(values.json ? JSON.stringify(b, null, 2) + '\n' : renderText(b));
  process.exit(b.blind ? 1 : 0);
}

if (require.main === module) main();

module.exports = { baseName, repoOfWorkstream, encodeProjectDir, parseTasklist, holderMemory, lastContextTokens, parseCwosSession, classify, buildBoard, renderText, knobsFrom, handoffCensus, renderCensus, DEFAULTS, CLI };
