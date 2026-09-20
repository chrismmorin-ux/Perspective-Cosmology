'use strict';
/**
 * state-queue-summary — regenerate the `## Queue Summary` block of state.md
 * from the authoritative queue index (WS-700).
 *
 * Why this exists. The Queue Summary table in system/state.md was prose,
 * hand-transcribed by an AI following a bullet in /session-end Step 4
 * ("Update queue summary counts"). Its numbers duplicate `by_status` in
 * queue-index.yaml, which cwos-reconcile rebuilds from the queue YAMLs and
 * which every other command already reads.
 *
 * ServeYourNote's counts drifted by 57 items, were hand-fixed on 2026-07-24,
 * and had drifted again by 2026-08-22. Nothing detected either drift; a human
 * read the two side by side. The root cause is not carelessness — it is that
 * /session-end is a boundary reached roughly 12% of the time, the same finding
 * ADR-065 already made about implicit decisions and solved by moving the work
 * into cwos-reconcile. This module is that move, for counts.
 *
 * The block is now machine-owned: a hand-edited count is corrected on the next
 * reconcile, silently, with a `state-regenerated` event carrying before/after
 * so the event log preserves that the drift happened (founder decision,
 * 2026-09-08). The Vital Signs table in the same file has worked this way
 * since WS-148 — this follows its precedent rather than inventing one.
 */

const fs = require('fs');
const path = require('path');

const { readYAMLFile, writeFileAtomic } = require('./cwos-utils');
// WS-703: one resolver for "where does this repo keep its system files".
// This module had its own copy for about an hour; two answers to that question
// is the defect kit-artifacts exists to remove.
const { resolveSystemDir } = require('./kit-artifacts');

// Rows are fixed and ordered, so the table reads the same in every repo and a
// diff is legible. `key` is the by_status key; a status absent from the index
// renders 0 rather than vanishing — "no blocked items" and "blocked column
// missing" must not look identical.
//
// `Done` deliberately carries no time window. The index holds status counts
// only, with no completion dates, so a "(30d)" label could only be honoured by
// opening every queue YAML and deriving a second, disagreeing source of truth.
// One number that provably matches every other command beats a narrower one
// that nothing else can reproduce (founder decision, 2026-09-08).
const ROWS = [
  { label: 'Backlog', key: 'backlog' },
  { label: 'In Progress', key: 'in_progress' },
  { label: 'Done', key: 'done' },
  { label: 'Blocked', key: 'blocked' },
];

// Every status the index reports, not just the four above.
//
// ServeYourNote's table carried seven rows — Unclaimed, First pass complete,
// Deferred and Done (cumulative) alongside the canonical four — and every one
// of them is a real status in its index (unclaimed: 26, deferred: 6,
// first_pass_complete: 6). A regenerator that wrote only the fixed four would
// have deleted them on the first reconcile after upgrade, which is a worse
// failure than the drift it was built to fix: wrong numbers can be corrected,
// a silently deleted row is not noticed at all.
//
// The four canonical rows are always present and always first, so every repo's
// table opens the same way and a missing status reads as 0 rather than
// vanishing. Anything else the index knows about follows, alphabetically.
function statusLabel(key) {
  return String(key)
    .split('_')
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function rowsFor(byStatus) {
  const rows = ROWS.map(({ label, key }) => ({
    label,
    count: Number.isFinite(byStatus[key]) ? byStatus[key] : 0,
  }));
  const canonical = new Set(ROWS.map((r) => r.key));
  const extra = Object.keys(byStatus)
    .filter((k) => !canonical.has(k) && Number.isFinite(byStatus[k]))
    .sort();
  for (const key of extra) rows.push({ label: statusLabel(key), count: byStatus[key] });
  return rows;
}

const MARKER = '<!-- generated: queue-summary — rewritten by cwos-reconcile from queue-index.yaml. Do not hand-edit; edits are overwritten. -->';
const HEADING_RE = /^##\s+Queue\s+Summary\s*$/i;
const NEXT_HEADING_RE = /^##\s+/;


/** Read `by_status` from the queue index. Returns null when unreadable — an
 *  unreadable index must leave state.md alone rather than zero it out. */
function readCounts(wsDir) {
  const indexPath = path.join(wsDir, 'queue-index.yaml');
  if (!fs.existsSync(indexPath)) return null;
  const { ok, data } = readYAMLFile(indexPath);
  if (!ok || !data || typeof data !== 'object') return null;
  const byStatus = data.by_status;
  if (!byStatus || typeof byStatus !== 'object') return null;
  // Return the WHOLE map. Narrowing it here is what would silently drop a
  // repo's own statuses; the row builder decides presentation, not this.
  const counts = {};
  for (const [k, v] of Object.entries(byStatus)) {
    if (Number.isFinite(v)) counts[k] = v;
  }
  for (const { key } of ROWS) if (!Number.isFinite(counts[key])) counts[key] = 0;
  return counts;
}

function renderTable(counts) {
  const lines = [MARKER, '', '| Status | Count |', '|--------|-------|'];
  for (const { label, count } of rowsFor(counts)) lines.push(`| ${label} | ${count} |`);
  return lines;
}

/** Parse the counts currently written in the block, for before/after reporting.
 *  Labels are matched case-insensitively and any "(30d)"-style qualifier on the
 *  legacy Done row is tolerated, so an unmigrated repo reports a real `before`
 *  instead of looking like it had no counts at all. */
function parseTable(bodyLines) {
  const found = {};
  for (const line of bodyLines) {
    const m = /^\|\s*([^|]+?)\s*\|\s*(-?\d+)\s*\|\s*$/.exec(line);
    if (!m) continue;
    const label = m[1].replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
    const row = ROWS.find(r => r.label.toLowerCase() === label);
    if (row) found[row.key] = parseInt(m[2], 10);
  }
  return found;
}

/**
 * Rewrite the Queue Summary block of `stateFile` from the index at `wsDir`.
 *
 * Returns { changed, reason, before, after }. Every "did nothing" path carries
 * a reason, because a silent no-op is exactly how the original defect hid.
 * `reason: 'no-section'` is normal, not a failure: a repo whose state.md never
 * carried the block does not get one invented (HomeBase's own did not until
 * this shipped), and inventing sections in someone else's state.md is a
 * bigger surprise than an absent count.
 */
function syncQueueSummary(stateFile, wsDir) {
  if (!stateFile || !fs.existsSync(stateFile)) {
    return { changed: false, reason: 'no-state-file', before: null, after: null };
  }
  const counts = readCounts(wsDir);
  if (!counts) {
    return { changed: false, reason: 'no-index', before: null, after: null };
  }

  const content = fs.readFileSync(stateFile, 'utf8');
  // Preserve the file's existing line ending — state.md is hand-edited on
  // Windows checkouts, and rewriting CRLF as LF would show every line as
  // changed in the diff.
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);

  const start = lines.findIndex(l => HEADING_RE.test(l.trim()));
  if (start === -1) {
    return { changed: false, reason: 'no-section', before: null, after: counts };
  }

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (NEXT_HEADING_RE.test(lines[i])) { end = i; break; }
  }

  const body = lines.slice(start + 1, end);
  const before = parseTable(body);

  // Keep whatever prose sits between the heading and the table, and drop only
  // the marker and the table itself — those are ours to own, the prose is not.
  const tableStart = body.findIndex(l => /^\s*\|/.test(l));
  const prose = (tableStart === -1 ? body : body.slice(0, tableStart))
    .filter(l => l.trim() !== '' && l.trim() !== MARKER);

  const rebuilt = ['', ...prose, ...(prose.length ? [''] : []), ...renderTable(counts), ''];
  const updatedLines = [...lines.slice(0, start + 1), ...rebuilt, ...lines.slice(end)];
  const updated = updatedLines.join(eol);

  if (updated === content) {
    return { changed: false, reason: 'already-current', before, after: counts };
  }
  writeFileAtomic(stateFile, updated);
  return { changed: true, reason: 'rewritten', before, after: counts };
}

/** Convenience wrapper: locate state.md from a repo root via .cwos-config.yaml. */
function stateFileFor(repoRoot) {
  if (!repoRoot) return null;
  return path.join(repoRoot, resolveSystemDir(repoRoot), 'state.md');
}

module.exports = { syncQueueSummary, stateFileFor, readCounts, ROWS, MARKER };
