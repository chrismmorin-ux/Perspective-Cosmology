'use strict';
/**
 * maintenance-finding-gate — an item raised for a maintenance finding cannot
 * close while that finding is still open (WS-1311).
 *
 * WHY. cwos-fleet-maintenance promotes a finding that stays open for three
 * weekly sweeps into a queue item (source.command: fleet-maintenance,
 * source.finding: <id>). Three of those closed "done" while their findings
 * went on firing: WS-660 (CVE-2026-68820, closed 2026-08-26, finding open and
 * pushed weekly for nine more weeks), WS-656 (the S22 sshd probe) and WS-754
 * (Tailscale TS-2026-011). Each fix shipped and nobody re-read the finding it
 * was for. Closing the item is the moment to look, so the close is where the
 * look happens.
 *
 * WHAT IT DOES. Reads fleet/maintenance/findings.yaml in the repo that holds
 * the item. The finding open (disposition null) refuses the close and names
 * what would clear it. Absent file, or a finding no longer in it, does not
 * block: there is nothing to read, and the sweep is not this gate's to judge.
 * `--finding-open "<why>"` (20+ chars) overrides it on the record, for the
 * rare item whose work is genuinely separate from clearing its finding.
 */

const fs = require('fs');
const path = require('path');

const MIN_OVERRIDE_RATIONALE = 20;

/** The maintenance finding an item was raised for, or null. */
function maintenanceFindingFor(item) {
  const s = (item && item.source) || {};
  if (String(s.command || '') !== 'fleet-maintenance') return null;
  const id = String(s.finding || '');
  return /^mnt-[A-Za-z0-9-]+$/.test(id) ? id : null;
}

/**
 * The finding's state from the sweep's own machine-written file: one
 * `  - id: "<id>"` line per finding, then four-space `key: value` lines.
 * Parsed line by line, the same way maintenance-digest.js does, so this needs
 * no YAML library and reads exactly what the sweep wrote.
 */
function readFinding(repoRoot, findingId) {
  const file = path.join(repoRoot, 'fleet', 'maintenance', 'findings.yaml');
  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); } catch { return { known: false }; }
  let cur = null;
  for (const line of raw.split('\n')) {
    const m = /^  - id: "(.*)"\s*$/.exec(line);
    if (m) {
      if (cur) break;
      if (m[1] === findingId) cur = { id: m[1] };
      continue;
    }
    if (!cur) continue;
    const kv = /^    (\w+): (?:"(.*)"|(null|\d+|true|false))\s*$/.exec(line);
    if (kv) cur[kv[1]] = kv[2] !== undefined ? kv[2] : (kv[3] === 'null' ? null : kv[3]);
  }
  if (!cur) return { known: true, present: false };
  return { known: true, present: true, open: !cur.disposition, finding: cur };
}

/**
 * { ok: true } when the item may close; otherwise { ok: false, finding_id,
 * reason } naming the open finding.
 */
function gateMaintenanceItem(item, repoRoot) {
  const fid = maintenanceFindingFor(item);
  if (!fid || !repoRoot) return { ok: true };
  const r = readFinding(repoRoot, fid);
  if (!r.known || !r.present || !r.open) return { ok: true };
  const f = r.finding;
  return {
    ok: false,
    finding_id: fid,
    reason: `its finding ${fid} is still open (last seen ${String(f.last_seen || '?').slice(0, 10)}` +
      `${f.unchecked_since ? `, not checked since ${String(f.unchecked_since).slice(0, 10)}` : ''})`,
  };
}

function refusalHint(fid) {
  return `Clear the finding at its cause and let the sweep confirm it (or record a disposition with ` +
    `its evidence in fleet/maintenance/findings.yaml), then close the item. If the item's work is ` +
    `genuinely separate from clearing ${fid}, pass --finding-open "<why, ${MIN_OVERRIDE_RATIONALE}+ chars>".`;
}

module.exports = { maintenanceFindingFor, readFinding, gateMaintenanceItem, refusalHint, MIN_OVERRIDE_RATIONALE };
