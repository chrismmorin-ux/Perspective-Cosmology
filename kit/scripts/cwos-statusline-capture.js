#!/usr/bin/env node
/**
 * cwos-statusline-capture — record where this account stands against its
 * weekly and 5-hour limits, every time Claude Code renders the status line (WS-1169).
 *
 * Claude Code pipes a JSON object to the statusLine command on each render. For
 * claude.ai Pro/Max subscribers, after the first API response, it carries
 * rate_limits.seven_day / five_hour = { used_percentage (0-100), resets_at (epoch s) }
 * (code.claude.com/docs/en/statusline.md). Nothing else on disk records that, so
 * the weekly position was invisible to every board. This writes it down.
 *
 * Output file, one per account (config dir):  <config dir>/cwos-rate-limits.json
 *   { account_dir, latest: {ts, seven_day, five_hour, model, session_id},
 *     history: [... up to 48 readings, appended only when a value changed] }
 * A render without rate_limits (early in a session, or a non-subscriber) keeps
 * the last known reading rather than overwriting it with nothing.
 *
 * Wiring (one line in the account's settings.json — not done by this script):
 *   "statusLine": { "type": "command", "command": "node <homebase>/kit/scripts/cwos-statusline-capture.js" }
 * It prints a short status line itself (model · week % · 5h %), so it can BE the
 * status line. To keep an existing status line instead, chain it:
 *   --then "<existing command>"  pipes the same JSON to that command and prints its output.
 *
 * Never fails the render: every path exits 0; a write it could not make goes to stderr.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { cliGate } = require('./lib/cli');

const CLI = {
  name: 'cwos-statusline-capture',
  summary: 'statusLine command: record this account weekly and 5-hour limit position',
  usage: 'cwos-statusline-capture [--then "<command>"] [--quiet]   (status-line JSON on stdin)',
  flags: {
    then: { type: 'string', describe: 'also pipe the JSON to this existing status-line command and print its output' },
    quiet: { type: 'boolean', describe: 'record only; print nothing' },
  },
};

const FILE = 'cwos-rate-limits.json';
const HISTORY_MAX = 48;

function accountDir(env = process.env) {
  return path.resolve(env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'));
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
function windowOf(w) {
  if (!w || typeof w !== 'object') return null;
  const used = num(w.used_percentage);
  if (used == null) return null;
  return { used_percentage: used, resets_at: num(w.resets_at) };
}

/** Pure: statusLine input -> a reading, or null when it carries no limits. */
function readingFrom(input, now = new Date()) {
  const rl = input && input.rate_limits;
  const seven = windowOf(rl && rl.seven_day);
  const five = windowOf(rl && rl.five_hour);
  if (!seven && !five) return null;
  return {
    ts: now.toISOString(),
    seven_day: seven,
    five_hour: five,
    model: (input.model && (input.model.id || input.model.display_name)) || null,
    session_id: typeof input.session_id === 'string' ? input.session_id : null,
  };
}

const same = (a, b) => JSON.stringify([a && a.seven_day, a && a.five_hour]) === JSON.stringify([b && b.seven_day, b && b.five_hour]);

/** Pure: merge a reading into the stored record. */
function record(prev, reading, dir) {
  const base = prev && typeof prev === 'object' ? prev : {};
  const history = Array.isArray(base.history) ? base.history.slice() : [];
  if (!reading) return { account_dir: dir, latest: base.latest || null, history };
  if (!history.length || !same(history[history.length - 1], reading)) history.push(reading);
  return { account_dir: dir, latest: reading, history: history.slice(-HISTORY_MAX) };
}

function readRecord(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function writeRecord(file, rec) {
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(rec, null, 1) + '\n');
  fs.renameSync(tmp, file);
}

function statusText(input, reading) {
  const model = (input && input.model && (input.model.display_name || input.model.id)) || 'Claude';
  const parts = [model];
  if (reading && reading.seven_day) parts.push(`week ${Math.round(reading.seven_day.used_percentage)}%`);
  if (reading && reading.five_hour) parts.push(`5h ${Math.round(reading.five_hour.used_percentage)}%`);
  return parts.join(' · ');
}

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);
  const then = values.then || null;
  const quiet = values.quiet;

  let raw = '';
  try { raw = fs.readFileSync(0, 'utf8'); } catch { /* no stdin */ }
  let input = null;
  try { input = JSON.parse(raw); } catch { /* not JSON: still print something */ }

  const dir = accountDir();
  const reading = readingFrom(input);
  if (reading) {
    const file = path.join(dir, FILE);
    try { writeRecord(file, record(readRecord(file), reading, dir)); }
    catch (err) { process.stderr.write(`cwos-statusline-capture: could not write ${file}: ${err.message}\n`); }
  }

  if (then) {
    const r = spawnSync(then, { input: raw, encoding: 'utf8', shell: true, timeout: 5000 });
    if (r.stdout) process.stdout.write(r.stdout);
    return;
  }
  if (!quiet) process.stdout.write(statusText(input, reading) + '\n');
}

if (require.main === module) {
  try { main(); } catch (err) { process.stderr.write(`cwos-statusline-capture: ${err.message}\n`); }
  process.exitCode = 0;
}

module.exports = { readingFrom, record, accountDir, statusText, FILE };
