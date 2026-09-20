#!/usr/bin/env node
/**
 * cwos-friction-ack — did the fleet answer any of THIS repo's friction
 * reports? (WS-581)
 *
 * The reverse half of the friction loop's last mile: when a hub item born
 * from this repo's friction closes (or is declined with a reason), a
 * friction_resolved / friction_declined event lands in THIS repo's own event
 * log. This script turns those into one line at session start — "a repo that
 * hears 'we looked and said no' keeps filing; a repo that hears nothing
 * stops" (WS-567 synthesis §F4).
 *
 * Contract mirrors cwos-kit-health.js: --line prints at most ONE line;
 * exit 0 = nothing to say (silent), exit 1 = the line was printed. Never
 * blocks, never fails a session start. Events older than 14 days age out —
 * an acknowledgment is news, not a monument.
 *
 * Usage: run with --help.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');

const { cliGate } = require('./lib/cli');

const WINDOW_DAYS = 14;

const CLI = {
  name: 'cwos-friction-ack',
  summary: 'one line when the fleet has answered this repo\'s friction reports recently',
  flags: {
    line: { type: 'boolean', describe: 'print at most one summary line (the session-start mode)' },
    json: { type: 'boolean', describe: 'machine-readable output' },
    quiet: { type: 'boolean', describe: 'accepted for hook symmetry; the line mode is already one line' },
    days: { type: 'string', placeholder: 'n', describe: `look-back window (default ${WINDOW_DAYS})` },
  },
  notes: 'Exit 0 = nothing to say. Exit 1 = acknowledgments found (and printed). Reads only this repo\'s own event log.',
};

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);
  const jsonMode = Boolean(values.json);
  const days = Number(values.days) > 0 ? Number(values.days) : WINDOW_DAYS;

  let findWorkstreamDir, readAllChunks, resolveEventPayload;
  try {
    ({ findWorkstreamDir, resolveEventPayload } = require('./lib/cwos-utils'));
    ({ readAllChunks } = require('./core/events'));
  } catch { return 0; } // older kit — silently nothing to say

  let wsDir;
  try { wsDir = findWorkstreamDir(process.cwd()); } catch { return 0; }

  let events;
  try { ({ events } = readAllChunks(wsDir)); } catch { return 0; }

  const cutoff = Date.now() - days * 86400000;
  const acks = [];
  for (const ev of events || []) {
    const t = Date.parse(ev.timestamp || '');
    if (!Number.isFinite(t) || t < cutoff) continue;
    const p = resolveEventPayload(wsDir, ev);
    const kind = p.type || ev.track_tag;
    if (kind !== 'friction_resolved' && kind !== 'friction_declined') continue;
    acks.push({
      kind,
      components: Array.isArray(p.components) ? p.components : [],
      ws_id: p.ws_id || null,
      detail: p.detail || null,
      at: ev.timestamp,
    });
  }

  if (jsonMode) {
    process.stdout.write(JSON.stringify({ acks, window_days: days }, null, 2) + '\n');
    return acks.length > 0 ? 1 : 0;
  }
  if (acks.length === 0) return 0;

  const parts = acks.slice(0, 4).map(a => {
    const comp = a.components[0] || a.ws_id || 'friction';
    return a.kind === 'friction_resolved'
      ? `${comp}: fixed${a.ws_id ? ` by ${a.ws_id}` : ''}`
      : `${comp}: declined${a.detail ? ` (${String(a.detail).slice(0, 60)})` : ''}`;
  });
  process.stdout.write(`Fleet answered ${acks.length} of this repo's friction report(s): ${parts.join('; ')}${acks.length > 4 ? '; …' : ''}\n`);
  return 1;
}

if (require.main === module) {
  try {
    process.exit(main());
  } catch {
    process.exit(0); // never fail a session start
  }
}

module.exports = {};
