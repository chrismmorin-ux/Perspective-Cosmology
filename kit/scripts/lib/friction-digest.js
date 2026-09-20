'use strict';
/**
 * friction-digest — read fleet/friction/{inbox.jsonl,last-sweep.json} into the
 * shape the /next gate and /status surface (WS-579).
 *
 * WHY A DIGEST AT ALL. The sprint-cap parsing defect was reported by
 * region-desk on 2026-05-13, by ServeYourNote on 2026-07-25, and reproduced in
 * HomeBase on 2026-08-02 — three repos, 83 days, three separate discoveries of
 * one defect. Nobody could see it was the same defect because seeing it
 * required requesting a report. This module is what puts that fact in the gate
 * the founder already reads.
 *
 * FRESHNESS IS NON-NEGOTIABLE. An empty digest and a dead drainer are
 * indistinguishable, so `swept_at`/`age_hours` are part of the answer, not
 * metadata — callers must render the age even (especially) when there is
 * nothing else to say. The sweep writes last-sweep.json on every run,
 * including no-ops, precisely so this number always exists.
 *
 * SHIPS EVERYWHERE, REAL ONLY AT THE HUB. cwos-next and cwos-status-pre ship
 * to adopted repos; fleet/friction/ exists only in HomeBase. computeDigest
 * returns null when there is no hub in sight — callers render nothing, not an
 * error. Resolution deliberately walks UP from cwd only, without kit-paths'
 * dist-root fallback: the digest belongs to the repo being gated, and the
 * fallback would make a gate run in any random directory on the hub machine
 * report the hub's digest (and would make every fixture test read real data).
 *
 * THE THRESHOLD. >=2 events for a component, or >=2 repos. The WS-567 design
 * names a third arm — >=2 distinct sessions — that is UNMEASURABLE today:
 * friction_detected payloads carry no session id (verified cwos-capture ->
 * core/events; author/command_id are not session identities). Documented
 * rather than silently dropped; the two live arms still cross at the second
 * event, which is what the design's replay criterion demands.
 */

const fs = require('fs');
const path = require('path');
const { assess } = require('./sweep-freshness');

// The recurrence constants live HERE (single-sourced); cwos-fleet-feedback
// re-imports them. Deliberately constants, not config — a threshold that moves
// is one nobody can hold the report to.
const RECURRENCE_REPOS = 2;
const RECURRENCE_EVENTS = 2;

const SEV_RANK = { high: 0, medium: 1, low: 2 };

function daysSince(iso, now) {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return Math.floor(((now || Date.now()) - t) / 86400000);
}

/**
 * Every source_hash with a recorded disposition (resolved or declined),
 * from fleet/friction/dispositions.jsonl (WS-581). Disposed hashes stop
 * counting toward recurrence: a deliberate "no" must not keep re-surfacing
 * as unaddressed, and a FIXED defect that recurs produces NEW hashes.
 */
function readDispositions(frictionDir) {
  const p = path.join(frictionDir, 'dispositions.jsonl');
  const out = new Map();
  if (!fs.existsSync(p)) return out;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try {
      const obj = JSON.parse(t);
      if (obj && obj.source_hash) out.set(obj.source_hash, obj);
    } catch { /* torn line */ }
  }
  return out;
}

/** Parse inbox.jsonl tolerantly — a torn line is skipped, never fatal. */
function readInboxLines(inboxPath) {
  if (!fs.existsSync(inboxPath)) return [];
  const out = [];
  for (const line of fs.readFileSync(inboxPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try {
      const obj = JSON.parse(t);
      if (obj && typeof obj === 'object') out.push(obj);
    } catch { /* torn line */ }
  }
  return out;
}

/** Group inbox lines by component and apply the recurrence predicate. */
function aggregateComponents(lines, now) {
  const byComponent = new Map();
  for (const l of lines) {
    const key = l.component || 'unattributed';
    if (!byComponent.has(key)) {
      byComponent.set(key, { component: key, events: 0, repos: new Set(), severities: [], timestamps: [], source_hashes: [], examples: [] });
    }
    const e = byComponent.get(key);
    e.events++;
    if (l.origin_repo) e.repos.add(l.origin_repo);
    e.severities.push(l.severity || 'medium');
    if (l.timestamp) e.timestamps.push(l.timestamp);
    if (l.source_hash) e.source_hashes.push(l.source_hash);
    if (e.examples.length < 3 && l.detail) {
      e.examples.push({ repo: l.origin_repo || null, severity: l.severity || 'medium', detail: String(l.detail).slice(0, 200) });
    }
  }

  const components = [...byComponent.values()].map((e) => {
    const topSeverity = e.severities.includes('high') ? 'high'
      : e.severities.includes('medium') ? 'medium' : 'low';
    const oldest = e.timestamps.filter(Boolean).sort()[0] || null;
    return {
      component: e.component,
      events: e.events,
      repos: [...e.repos].sort(),
      top_severity: topSeverity,
      oldest,
      days_open: daysSince(oldest, now),
      recurring: e.repos.size >= RECURRENCE_REPOS || e.events >= RECURRENCE_EVENTS,
      source_hashes: e.source_hashes,
      examples: e.examples,
    };
  });

  // Recurring first, then severity, then volume — triage order.
  components.sort((a, b) =>
    (b.recurring - a.recurring)
    || (SEV_RANK[a.top_severity] - SEV_RANK[b.top_severity])
    || (b.events - a.events));
  return components;
}

/**
 * The digest, or null when this repo has no hub in sight (the normal state in
 * every adopted repo). A hub whose friction/ directory does not exist yet also
 * returns null — the sweep has never run, and there is no age to report
 * honestly.
 *
 * @param {object} [opts]
 * @param {string} [opts.from]  directory to resolve the hub from (default cwd)
 * @param {number} [opts.now]   ms epoch for age math (tests)
 */
function findHubUpward(startDir) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'fleet', 'registry.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function computeDigest(opts = {}) {
  let hub = null;
  try { hub = findHubUpward(opts.from || process.cwd()); } catch { return null; }
  if (!hub) return null;

  const frictionDir = path.join(hub, 'fleet', 'friction');
  if (!fs.existsSync(frictionDir)) return null;

  const now = typeof opts.now === 'number' ? opts.now : Date.now();

  // Freshness first: null-tolerant, but a missing stamp is itself reported —
  // an inbox with lines and no last-sweep.json means the sweep predates the
  // stamp or someone hand-edited, and "age unknown" must surface as that.
  let sweptAt = null;
  let reposErrored = 0;
  let cadenceMinutes = null;
  try {
    const stamp = JSON.parse(fs.readFileSync(path.join(frictionDir, 'last-sweep.json'), 'utf8'));
    sweptAt = stamp.swept_at || null;
    reposErrored = Number(stamp.repos_errored) || 0;
    cadenceMinutes = stamp.cadence_minutes;
  } catch { /* no stamp — swept_at stays null and callers must say "age unknown" */ }

  // WS-809: age alone was never enough. A stamp older than a few cadences means
  // the sweep is DOWN, and the caller must say so rather than quietly reporting
  // a number — that is how six days of unswept findings read as "clean".
  const freshness = assess({ swept_at: sweptAt, now, cadence_minutes: cadenceMinutes });

  const lines = readInboxLines(path.join(frictionDir, 'inbox.jsonl'));

  // WS-581: disposed friction (resolved or declined) stops counting toward
  // recurrence. inbox_lines stays the raw total — the inbox is append-only
  // history; the aggregation is what answers "what is still open".
  const disposed = readDispositions(frictionDir);
  const live = disposed.size === 0 ? lines : lines.filter(l => !disposed.has(l.source_hash));

  return {
    ...freshness,
    inbox_lines: lines.length,
    disposed: lines.length - live.length,
    repos_errored: reposErrored,
    components: aggregateComponents(live, now),
  };
}

/**
 * The request lane's digest (WS-699) — the courier's return leg.
 *
 * Deliberately NOT aggregateComponents: a request is not a defect and has no
 * recurrence threshold. One repo asking once is the whole signal, so the digest
 * reports who is waiting and how long, not which component crossed a bar.
 *
 * Freshness is reported the same null-tolerant way friction reports it, for
 * the same WS-567 reason: an empty inbox and a dead drainer must never render
 * identically, so `swept_at: null` has to reach the caller as a fact.
 */
function computeRequestDigest(opts = {}) {
  let hub = null;
  try { hub = findHubUpward(opts.from || process.cwd()); } catch { return null; }
  if (!hub) return null;

  const requestsDir = path.join(hub, 'fleet', 'requests');
  if (!fs.existsSync(requestsDir)) return null;

  const now = typeof opts.now === 'number' ? opts.now : Date.now();

  let sweptAt = null;
  let reposErrored = 0;
  let cadenceMinutes = null;
  try {
    const stamp = JSON.parse(fs.readFileSync(path.join(requestsDir, 'last-sweep.json'), 'utf8'));
    sweptAt = stamp.swept_at || null;
    reposErrored = Number(stamp.repos_errored) || 0;
    cadenceMinutes = stamp.cadence_minutes;
  } catch { /* no stamp — age unknown, and the caller must say so */ }

  const freshness = assess({ swept_at: sweptAt, now, cadence_minutes: cadenceMinutes });   // WS-809

  const lines = readInboxLines(path.join(requestsDir, 'inbox.jsonl'));
  const disposed = readDispositions(requestsDir);
  const live = disposed.size === 0 ? lines : lines.filter(l => !disposed.has(l.source_hash));

  const byRepo = new Map();
  for (const l of live) {
    const repo = l.origin_repo || '(unknown)';
    if (!byRepo.has(repo)) byRepo.set(repo, { repo, open: 0, oldest: null, oldest_days: null, categories: new Set() });
    const e = byRepo.get(repo);
    e.open++;
    if (l.category) e.categories.add(l.category);
    if (l.timestamp && (!e.oldest || l.timestamp < e.oldest)) e.oldest = l.timestamp;
  }
  const repos = [...byRepo.values()].map(e => {
    const t = e.oldest && Number.isFinite(Date.parse(e.oldest)) ? Date.parse(e.oldest) : null;
    return {
      repo: e.repo,
      open: e.open,
      oldest: e.oldest,
      oldest_days: t === null ? null : Math.floor((now - t) / 86400000),
      categories: [...e.categories],
    };
  // Oldest first: the 101-day silence is the failure this channel exists to
  // end, so age leads rather than volume.
  }).sort((a, b) => (b.oldest_days || 0) - (a.oldest_days || 0));

  return {
    ...freshness,
    inbox_lines: lines.length,
    open: live.length,
    disposed: lines.length - live.length,
    repos_errored: reposErrored,
    repos,
  };
}

module.exports = { computeDigest, computeRequestDigest, aggregateComponents, readInboxLines, readDispositions, RECURRENCE_REPOS, RECURRENCE_EVENTS };
