/**
 * codex-usage — Codex sessions, tokens per model, and Codex's own rate-limit
 * position, read from ~/.codex/sessions/<y>/<m>/<d>/rollout-*.jsonl (WS-1169).
 *
 * What the rollout files carry (measured 2026-10-15, codex cli 0.162.1):
 *   - session_meta: start time, cwd, source (a subagent says so)
 *   - turn_context.payload.model: the model each turn ran on
 *   - event_msg/token_count.info.total_token_usage: CUMULATIVE per session
 *     (input_tokens includes cached_input_tokens, OpenAI convention;
 *     total_tokens = input + output). info is null on some events.
 *   - event_msg/token_count.rate_limits: primary (window_minutes 300) and
 *     secondary (window_minutes 10080 = the weekly window), used_percent, resets_at.
 * Tokens are attributed per token_count increment to the model of the turn
 * in force, so a window cuts a long session correctly. Streamed; never reads a
 * file whole. Zero dependencies.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { forEachLine } = require('./transcript-usage');

const FIELDS = ['input_tokens', 'cached_input_tokens', 'output_tokens', 'reasoning_output_tokens', 'total_tokens'];
const empty = () => Object.fromEntries(FIELDS.map((k) => [k, 0]));
const DAY = 86400000;

function defaultRoot() {
  return path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'sessions');
}

/** Rollout files whose day dir could hold activity in the window (one day of slack each side). */
function rolloutFiles(root, sinceMs, untilMs) {
  const out = [];
  const list = (d) => { try { return fs.readdirSync(d); } catch { return []; } };
  for (const y of list(root)) {
    for (const m of list(path.join(root, y))) {
      for (const d of list(path.join(root, y, m))) {
        const day = Date.parse(`${y}-${m}-${d}T00:00:00Z`);
        if (Number.isNaN(day)) continue;
        if (untilMs != null && day > untilMs + DAY) continue;
        const dir = path.join(root, y, m, d);
        for (const f of list(dir)) {
          if (!/^rollout-.*\.jsonl$/.test(f)) continue;
          const file = path.join(dir, f);
          // A session started before the window can still be running in it, so the day filter alone is not enough.
          if (sinceMs != null && day < sinceMs - DAY) {
            try { if (fs.statSync(file).mtimeMs < sinceMs) continue; } catch { continue; }
          }
          out.push(file);
        }
      }
    }
  }
  return out;
}

/**
 * Measure Codex usage. Returns { root, readable, usage_recorded, sessions, subagent_sessions,
 * files_scanned, by_model: [{model, sessions, ...FIELDS}], total, rate_limits }.
 * rate_limits is the newest observed reading, with its timestamp, or null.
 */
function measureCodex({ root = defaultRoot(), sinceMs = null, untilMs = null } = {}) {
  if (!fs.existsSync(root)) return { root, readable: false, reason: 'no Codex sessions folder', usage_recorded: false };
  const inWin = (t) => !Number.isNaN(t) && (sinceMs == null || t >= sinceMs) && (untilMs == null || t < untilMs);
  const byModel = {};
  const total = empty();
  let sessions = 0;
  let subSessions = 0;
  let sawUsage = false;
  let rate = null;
  const files = rolloutFiles(root, sinceMs, untilMs);

  for (const file of files) {
    let model = 'unknown';
    let prev = null;
    let active = false;
    let isSub = false;
    forEachLine(file, (line) => {
      if (line.indexOf('"session_meta"') === -1 && line.indexOf('"turn_context"') === -1 && line.indexOf('"token_count"') === -1) return;
      let j;
      try { j = JSON.parse(line); } catch { return; }
      const p = j.payload || {};
      const t = Date.parse(j.timestamp || p.timestamp || '');
      if (j.type === 'session_meta') {
        isSub = !!(p.source && typeof p.source === 'object' && p.source.subagent);
        if (inWin(t)) active = true;
      } else if (j.type === 'turn_context') {
        if (typeof p.model === 'string' && p.model) model = p.model;
      } else if (p.type === 'token_count') {
        const rl = p.rate_limits;
        if (rl && (rl.primary || rl.secondary) && !Number.isNaN(t) && (!rate || t > Date.parse(rate.at))) {
          rate = { at: new Date(t).toISOString(), plan_type: rl.plan_type || null, primary: rl.primary || null, secondary: rl.secondary || null };
        }
        const cum = p.info && p.info.total_token_usage;
        if (!cum) return;
        sawUsage = true;
        const inc = {};
        for (const k of FIELDS) inc[k] = Math.max(0, (cum[k] || 0) - ((prev && prev[k]) || 0));
        prev = cum;
        if (!inWin(t)) return;
        active = true;
        const row = byModel[model] || (byModel[model] = { ...empty(), sessions: new Set() });
        for (const k of FIELDS) { row[k] += inc[k]; total[k] += inc[k]; }
        row.sessions.add(file);
      }
    });
    if (active) { sessions += 1; if (isSub) subSessions += 1; }
  }

  return {
    root, readable: true, files_scanned: files.length, usage_recorded: sawUsage,
    sessions, subagent_sessions: subSessions,
    by_model: Object.entries(byModel).map(([model, r]) => ({ model, ...r, sessions: r.sessions.size }))
      .sort((a, b) => b.total_tokens - a.total_tokens),
    total,
    rate_limits: rate,
  };
}

module.exports = { measureCodex, rolloutFiles, defaultRoot };
