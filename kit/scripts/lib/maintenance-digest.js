'use strict';
/**
 * maintenance-digest — the read half of the fleet maintenance sweep (ADR-066).
 *
 * Renders `fleet/maintenance/` state into the digest object the /next and
 * /status gates attach. SHIPS with the kit (the gate scripts that require it
 * ship) even though the sweep itself is hub-only — same split as
 * friction-digest.js. Returns null when no hub is in sight or the sweep has
 * never run, so adopted repos render nothing.
 *
 * The digest is never contents-without-freshness: swept_at (last_invoked_at)
 * may be null and callers MUST render that as the loud "age UNKNOWN" form —
 * an empty findings list and a dead sweep are otherwise indistinguishable.
 */

const fs = require('fs');
const path = require('path');
const { assess } = require('./sweep-freshness');

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

function sevRank(s) {
  return { critical: 4, high: 3, medium: 2, low: 1 }[String(s).toLowerCase()] || 0;
}

/**
 * @param {object} [opts]
 * @param {string} [opts.from]  directory to resolve the hub from (default cwd)
 * @param {number} [opts.now]   ms epoch for age math (tests)
 * @returns digest object or null (not a hub / sweep never ran)
 */
function computeDigest(opts = {}) {
  let hub = null;
  try { hub = findHubUpward(opts.from || process.cwd()); } catch { return null; }
  if (!hub) return null;

  const maintDir = path.join(hub, 'fleet', 'maintenance');
  if (!fs.existsSync(maintDir)) return null;

  const now = typeof opts.now === 'number' ? opts.now : Date.now();

  // Freshness first — a missing stamp is itself the report (age UNKNOWN).
  let sweptAt = null;
  let tiers = { daily_at: null, weekly_at: null, monthly_at: null };
  let gaps = 0;
  let cadenceMinutes = null;
  try {
    const stamp = JSON.parse(fs.readFileSync(path.join(maintDir, 'last-sweep.json'), 'utf8'));
    sweptAt = stamp.last_invoked_at || stamp.swept_at || null;
    tiers = { daily_at: stamp.daily_at || null, weekly_at: stamp.weekly_at || null, monthly_at: stamp.monthly_at || null };
    gaps = Number(stamp.gaps) || 0;
    cadenceMinutes = stamp.cadence_minutes;
  } catch { /* no stamp — swept_at stays null; callers must say "age UNKNOWN" */ }

  // WS-809: this is the digest that rendered "clean, last swept 144h ago" for
  // six days while nineteen findings sat unswept. The age was always there; what
  // was missing was anything that judged it. `stale` is that judgement.
  const freshness = assess({ swept_at: sweptAt, now, cadence_minutes: cadenceMinutes });

  // Findings: parse the sweep's own hand-serialized shape line-by-line rather
  // than requiring a YAML lib — the file is machine-written, fixed-shape.
  const open = [];
  try {
    const raw = fs.readFileSync(path.join(maintDir, 'findings.yaml'), 'utf8');
    let cur = null;
    for (const line of raw.split('\n')) {
      const m = /^  - id: "(.*)"$/.exec(line);
      if (m) { if (cur && !cur.disposition) open.push(cur); cur = { id: m[1], disposition: null }; continue; }
      if (!cur) continue;
      const kv = /^    (\w+): (?:"(.*)"|(null|\d+))$/.exec(line);
      if (kv) cur[kv[1]] = kv[2] !== undefined ? kv[2] : (kv[3] === 'null' ? null : Number(kv[3]));
    }
    if (cur && !cur.disposition) open.push(cur);
  } catch { /* no findings file yet — open stays [] */ }

  const high = open.filter(f => sevRank(f.severity) >= sevRank('high'));

  return {
    ...freshness,
    tiers,
    findings_open: open.length,
    findings_high: high.length,
    gaps,
    top: high
      .sort((a, b) => sevRank(b.severity) - sevRank(a.severity))
      .slice(0, 5)
      .map(f => ({ id: f.id, node: f.node, surface: f.surface, severity: f.severity, title: f.title })),
  };
}

module.exports = { computeDigest };
