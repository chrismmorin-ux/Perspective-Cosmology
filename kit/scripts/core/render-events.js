/**
 * render-events.js — deterministic regenerator for system/events.log.md.
 *
 * ADR-018 step 1, WS-173. Reads every event from the shadow log under
 * `.claude/workstream/events/` and produces a founder-facing markdown
 * view grouped by command_id. Frontmatter records
 * `generated_from_event`, `generated_content_hash`, `generated_at`,
 * `source_chunks`, `event_count`.
 *
 * Pre-write hash guard: if the existing file's body hash does not match
 * the frontmatter's `generated_content_hash`, the founder has hand-edited
 * the view. The regenerator refuses to overwrite, appends a
 * `founder-correction` event, and returns a non-ok result — caller
 * decides whether to halt.
 *
 * Invariant: `len(rendered sections)` == `len(JSONL events)` after any
 * successful regeneration. Violation returns non-ok.
 *
 * Shrink guard (WS-104): the existing file's `event_count` is a floor. If the
 * local chunks hold fewer events than the view already records — the clone
 * case, since chunks are gitignored — the regenerator refuses, says why on
 * stderr, and returns `{ ok: false, reason: 'shrink-refused' }`. Pass
 * `{ allowShrink: true }` or set `CWOS_RENDER_ALLOW_SHRINK=1` to accept the
 * rebase; an `events_log_rebased` event is appended first so the loss is
 * itself on the record.
 *
 * Zero external dependencies.
 */

'use strict';

require('../lib/preflight');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { findWorkstreamDir, writeFileAtomic } = require('../lib/cwos-utils');
const events = require('./events');

const DEFAULT_OUTPUT_REL = path.join('system', 'events.log.md');

function defaultOutputPath(repoRoot, workstreamDir) {
  // Prefer an explicit repoRoot. Otherwise derive from the workstream dir
  // (repo root = parent-of-.claude). WS-549: the last resort used to be
  // __dirname-relative — the comment here already noted it "will be wrong when
  // the kit is installed elsewhere", which is now enforced rather than noted.
  if (repoRoot) return path.join(repoRoot, DEFAULT_OUTPUT_REL);
  if (workstreamDir) {
    // workstreamDir ends in .claude/workstream — two levels up is the repo root.
    const root = path.dirname(path.dirname(workstreamDir));
    return path.join(root, DEFAULT_OUTPUT_REL);
  }
  const { resolveRepoRoot } = require('../lib/kit-paths');
  const root = resolveRepoRoot();
  if (!root) throw new Error('render-events: no repoRoot, no workstreamDir, and cwd is not inside a CWOS repo');
  return path.join(root, DEFAULT_OUTPUT_REL);
}

// ─── Hashing ───────────────────────────────────────────────────────────────

function sha256OfString(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

/**
 * Extract + return the body (post-frontmatter) of a rendered file.
 * Returns { frontmatter: object|null, body: string }. The body is used
 * for hash comparison; the frontmatter carries the prior hash.
 */
function splitFrontmatter(content) {
  // WS-104: the writer emits LF, but a Windows checkout under
  // core.autocrlf=true hands the file back with CRLF. Before this
  // normalization the parser saw no frontmatter at all on such a checkout,
  // which silently disabled BOTH pre-write guards (hand-edit and shrink) —
  // exactly the machine where the clone case bites. The body is normalized
  // too, so its hash matches what was written.
  if (content.includes('\r\n')) content = content.replace(/\r\n/g, '\n');
  if (!content.startsWith('---\n')) return { frontmatter: null, body: content };
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) return { frontmatter: null, body: content };
  const fmText = content.slice(4, end);
  const body = content.slice(end + 5); // skip the closing '\n---\n'
  const fm = {};
  for (const line of fmText.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (/^".*"$/.test(val) || /^'.*'$/.test(val)) val = val.slice(1, -1);
    fm[key] = val;
  }
  return { frontmatter: fm, body };
}

// ─── Rendering ─────────────────────────────────────────────────────────────

/**
 * Group events by command_id, preserving chunk+line order within each
 * command. Returns an array of { command_id, events } in order of first
 * appearance.
 */
function groupByCommand(events) {
  const index = new Map();
  const order = [];
  for (const ev of events) {
    const cid = ev.command_id || '(unknown)';
    if (!index.has(cid)) { index.set(cid, []); order.push(cid); }
    index.get(cid).push(ev);
  }
  return order.map((cid) => ({ command_id: cid, events: index.get(cid) }));
}

function renderBody(groups, chunks) {
  const lines = [];
  lines.push('# Events Log');
  lines.push('');
  lines.push('Auto-generated from the shadow event log. **Do not hand-edit** —');
  lines.push('the regenerator detects edits and emits a `founder-correction`');
  lines.push('event. To correct a mis-routed event, use the normal correction');
  lines.push('path, not direct markdown edits.');
  lines.push('');

  if (groups.length === 0) {
    lines.push('_No events recorded yet._');
    lines.push('');
    return lines.join('\n');
  }

  lines.push(`## Summary`);
  lines.push('');
  lines.push(`- Commands recorded: ${groups.length}`);
  const totalEvents = groups.reduce((n, g) => n + g.events.length, 0);
  lines.push(`- Events recorded: ${totalEvents}`);
  lines.push(`- Source chunks: ${chunks.length}`);
  lines.push('');

  for (const group of groups) {
    lines.push(`## Command \`${group.command_id}\``);
    lines.push('');
    const first = group.events[0];
    lines.push(`- Start: ${first.timestamp}`);
    lines.push(`- Events: ${group.events.length}`);
    if (group.events.length > 0) {
      const tracks = new Set(group.events.map((e) => e.source_track).filter(Boolean));
      lines.push(`- Tracks: ${Array.from(tracks).join(', ') || '(none)'}`);
    }
    lines.push('');
    lines.push(`| # | Time | Track | Tag | Summary |`);
    lines.push(`|---|------|-------|-----|---------|`);
    group.events.forEach((ev, i) => {
      const summary = summarizePayload(ev.payload);
      lines.push(`| ${i + 1} | ${ev.timestamp} | ${ev.source_track || ''} | ${ev.track_tag || ''} | ${escapeCell(summary)} |`);
    });
    lines.push('');
  }
  return lines.join('\n');
}

function summarizePayload(payload) {
  if (!payload || typeof payload !== 'object') return '';
  if ('payload_ref' in payload) return `blob:${payload.payload_ref}`;
  const keys = Object.keys(payload);
  if (keys.length === 0) return '{}';
  // Two keys: show both k=v pairs short-form. More: show first two + count.
  const pairs = keys.slice(0, 2).map((k) => `${k}=${shortValue(payload[k])}`);
  if (keys.length > 2) pairs.push(`+${keys.length - 2} more`);
  return pairs.join(', ');
}
function shortValue(v) {
  if (v === null) return 'null';
  if (typeof v === 'string') return v.length > 32 ? JSON.stringify(v.slice(0, 29)) + '...' : JSON.stringify(v);
  if (typeof v === 'object') return `{${Object.keys(v).length} keys}`;
  return String(v);
}
function escapeCell(s) {
  return String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function renderFrontmatter(fm) {
  const lines = ['---'];
  for (const key of Object.keys(fm)) {
    const v = fm[key];
    if (Array.isArray(v)) {
      lines.push(`${key}: [${v.map((x) => JSON.stringify(x)).join(', ')}]`);
    } else if (typeof v === 'string') {
      lines.push(`${key}: ${JSON.stringify(v)}`);
    } else {
      lines.push(`${key}: ${v}`);
    }
  }
  lines.push('---');
  return lines.join('\n') + '\n';
}

// ─── Shrink guard helpers (WS-104) ─────────────────────────────────────────

/** Frontmatter `source_chunks` is rendered as a JSON array; recover it. */
function parseChunkList(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

// Callers (cwos-event, cwos-reconcile) swallow the render result on purpose —
// a view regen must never break an append. So the refusal explains itself on
// stderr, once per process, instead of relying on anyone reading the result.
let _shrinkWarned = false;
function warnShrinkRefused(file, existingCount, got, missingChunks) {
  if (_shrinkWarned) return;
  _shrinkWarned = true;
  const rel = DEFAULT_OUTPUT_REL.replace(/\\/g, '/');
  const missing = missingChunks.length
    ? `${missingChunks.length} source chunk(s) the committed view was rendered from are not on this machine (${missingChunks.slice(0, 3).join(', ')}${missingChunks.length > 3 ? ', …' : ''})`
    : 'the local event log holds fewer events than the committed view';
  process.stderr.write(
    `render-events: refused to shrink ${rel} from ${existingCount} to ${got} events — ${missing}. ` +
    `.claude/workstream/events/ is gitignored, so chunks never leave the machine that wrote them; ` +
    `copy them here (scp from that node) to render the full log, or accept the loss with ` +
    `CWOS_RENDER_ALLOW_SHRINK=1 (records an events_log_rebased event first). Events still append; only the view is held.\n`
  );
}

// ─── Main entry ────────────────────────────────────────────────────────────

/**
 * Regenerate `system/events.log.md` from the shadow event log.
 *
 * Options:
 *   { workstreamDir } — explicit workstream dir (default: findWorkstreamDir)
 *   { outputPath }    — explicit output file (default: <repoRoot>/system/events.log.md)
 *   { repoRoot }      — explicit repo root (used for default output path)
 *   { allowShrink }   — accept a view with fewer events than the existing one
 *                       (also CWOS_RENDER_ALLOW_SHRINK=1); records the rebase
 *
 * Returns:
 *   { ok: true, file, bytesWritten, eventCount, groupCount }
 *   { ok: false, reason: 'founder-edited', correctionEventId, file }
 *   { ok: false, reason: 'shrink-refused', existingCount, got, missingChunks, file }
 *   { ok: false, reason: 'rebase-event-failed', errors, file }
 *   { ok: false, reason: 'invariant', expected, got, file }
 *   { ok: false, reason: 'read-error', warnings }
 */
function renderEventsLog(opts = {}) {
  const workstreamDir = opts.workstreamDir || findWorkstreamDir();
  const outputPath = opts.outputPath || defaultOutputPath(opts.repoRoot, workstreamDir);

  let { events: allEvents, warnings } = events.readAllChunks(workstreamDir);
  let chunkFiles = events.listChunks(workstreamDir).map((p) => path.basename(p));

  // Pre-write hash guard: refuse to overwrite a hand-edited file.
  if (fs.existsSync(outputPath)) {
    const existing = fs.readFileSync(outputPath, 'utf8');
    const { frontmatter, body } = splitFrontmatter(existing);
    if (frontmatter && frontmatter.generated_content_hash) {
      const actual = sha256OfString(body);
      if (actual !== frontmatter.generated_content_hash) {
        const r = events.appendEvent({
          source_track: 'T_meta:correction',
          track_tag: 'founder-correction',
          source_tier: 'founder-prompt',
          payload: {
            file: DEFAULT_OUTPUT_REL.replace(/\\/g, '/'),
            expected_hash: frontmatter.generated_content_hash,
            actual_hash: actual,
            prior_event: frontmatter.generated_from_event || null,
          },
        }, { workstreamDir });
        return {
          ok: false,
          reason: 'founder-edited',
          file: outputPath,
          correctionEventId: r.ok ? r.event.id : null,
          correctionError: r.ok ? null : r.errors,
        };
      }
    }

    // Shrink guard (WS-104, melody-hill 2026-09-02): the chunks under
    // .claude/workstream/events/ are gitignored, so a fresh clone has none of
    // the history the committed view was rendered from. Without this guard
    // the first append on such a clone silently replaced 867 events across
    // 13 chunks with the 7 events the new machine had written — erasing the
    // founder-visible audit trail. A view that says it holds N events is
    // never overwritten by one that would hold fewer, unless the caller
    // explicitly accepts the rebase and the loss itself goes on the record.
    const existingCount = frontmatter ? parseInt(frontmatter.event_count, 10) : NaN;
    if (Number.isFinite(existingCount) && existingCount > allEvents.length) {
      const existingChunks = parseChunkList(frontmatter.source_chunks);
      const missingChunks = existingChunks.filter((c) => !chunkFiles.includes(c));
      const allowShrink = opts.allowShrink === true || process.env.CWOS_RENDER_ALLOW_SHRINK === '1';
      if (!allowShrink) {
        warnShrinkRefused(outputPath, existingCount, allEvents.length, missingChunks);
        return {
          ok: false,
          reason: 'shrink-refused',
          file: outputPath,
          existingCount,
          got: allEvents.length,
          missingChunks,
        };
      }
      const r = events.appendEvent({
        source_track: 'T_meta:correction',
        track_tag: 'events-log-rebased',
        source_tier: 'founder-prompt',
        payload: {
          type: 'events_log_rebased',
          file: DEFAULT_OUTPUT_REL.replace(/\\/g, '/'),
          previous_event_count: existingCount,
          new_event_count: allEvents.length,
          missing_chunks: missingChunks,
          prior_event: frontmatter.generated_from_event || null,
        },
      }, { workstreamDir });
      if (!r.ok) {
        return { ok: false, reason: 'rebase-event-failed', file: outputPath, errors: r.errors };
      }
      // Re-read so the rebase marker is the first thing the new view records.
      ({ events: allEvents, warnings } = events.readAllChunks(workstreamDir));
      chunkFiles = events.listChunks(workstreamDir).map((p) => path.basename(p));
    }
  }

  // Compose new rendered body.
  const groups = groupByCommand(allEvents);
  const body = renderBody(groups, chunkFiles);
  const bodyHash = sha256OfString(body);
  const lastEvent = allEvents[allEvents.length - 1];
  const fm = renderFrontmatter({
    generated_from_event: lastEvent ? lastEvent.id : '',
    generated_content_hash: bodyHash,
    generated_at: new Date().toISOString(),
    source_chunks: chunkFiles,
    event_count: allEvents.length,
  });

  const full = fm + body;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileAtomic(outputPath, full);

  // Invariant check: sections count equals distinct command_ids (should match groups.length).
  // Event count check: sum of group events == total events.
  const summed = groups.reduce((n, g) => n + g.events.length, 0);
  if (summed !== allEvents.length) {
    return { ok: false, reason: 'invariant', expected: allEvents.length, got: summed, file: outputPath };
  }

  return {
    ok: true,
    file: outputPath,
    bytesWritten: Buffer.byteLength(full, 'utf8'),
    eventCount: allEvents.length,
    groupCount: groups.length,
    contentHash: bodyHash,
    warnings,
  };
}

module.exports = {
  renderEventsLog,
  sha256OfString,
  splitFrontmatter,
  groupByCommand,
  renderBody,
  DEFAULT_OUTPUT_REL,
};
