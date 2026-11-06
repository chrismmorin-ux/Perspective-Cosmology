'use strict';

/**
 * inspection-gate — an item that matters is not closed on its builder's word.
 *
 * WS-941 gap 3 (edge-claim-truth, "an independent inspector who did not do the
 * work"). /verify was the right checklist walked by the wrong person: the
 * session that built a change also judged it. For an item that requires it,
 * closure now needs a recorded PASS from an inspector given ONLY the item's
 * accept_criteria and the diff — /verify's "Independent inspection" layer
 * spawns that inspector as a fresh subagent, and `cwos-item inspect` records
 * its verdict on the item.
 *
 * Which items: severity high or critical, or any item that opts in with
 * `inspection: required` (founder decision 2026-10-02 — every item would put a
 * multi-minute inspector run on every close; small items stay fast).
 *
 * HONEST LIMIT. Independence is a property of the procedure — a fresh context
 * with no session history — not something this gate can prove. What it does
 * guarantee is that no required item closes without an inspection on record,
 * naming who inspected and what each criterion was checked against. A waiver
 * exists (`--skip-inspection "<rationale>"`) and is itself an event, so a
 * skipped inspection is visible rather than silent.
 *
 * Shared by cwos-item.js `done` and cwos-next.js `done --sprint`, so the two
 * closure paths cannot drift apart (the lib/item-closure.js precedent).
 */

const INSPECTED_SEVERITIES = new Set(['high', 'critical']);
const VERDICTS = new Set(['pass', 'fail']);
const MIN_INSPECTION_EVIDENCE = 40;
const MIN_WAIVER_RATIONALE = 20;

function requiresInspection(item) {
  if (!item || typeof item !== 'object') return false;
  const sev = String(item.severity || '').trim().toLowerCase();
  const opt = String(item.inspection || '').trim().toLowerCase();
  return INSPECTED_SEVERITIES.has(sev) || opt === 'required';
}

/** Newest inspection on record ( `inspections:` is kept newest-first ), or null. */
function latestInspection(item) {
  const list = item && Array.isArray(item.inspections) ? item.inspections : [];
  return list.length && list[0] && typeof list[0] === 'object' ? list[0] : null;
}

/**
 * { required, ok, reason }. ok is true when the item needs no inspection or
 * its newest inspection is a well-formed PASS.
 */
function gateItem(item) {
  if (!requiresInspection(item)) return { required: false, ok: true, reason: null };
  const last = latestInspection(item);
  if (!last) return { required: true, ok: false, reason: 'no inspection on record' };
  const verdict = String(last.verdict || '').trim().toLowerCase();
  if (verdict !== 'pass') return { required: true, ok: false, reason: `newest inspection is ${verdict || 'missing a verdict'}` };
  if (!String(last.inspector || '').trim()) return { required: true, ok: false, reason: 'newest inspection names no inspector' };
  const ev = String(last.evidence || '').trim();
  if (ev.length < MIN_INSPECTION_EVIDENCE) {
    return { required: true, ok: false, reason: `newest inspection evidence is ${ev.length} chars (floor ${MIN_INSPECTION_EVIDENCE})` };
  }
  return { required: true, ok: true, reason: null };
}

/** The instruction a refusal prints: what to run, in order. */
function refusalHint(ids) {
  const list = ids.join(', ');
  return `Run /verify's "Independent inspection" layer for ${list}: a fresh subagent given only the ` +
    'item\'s accept_criteria and the diff checks each criterion and returns PASS/FAIL with a pointer per ' +
    'criterion; record it with `node kit/scripts/cwos-item.js inspect <WS> --verdict pass|fail ' +
    '--inspector "<agent id>" --evidence "<per-criterion pointers>"`. Founder escape valve: ' +
    `--skip-inspection "<rationale ≥${MIN_WAIVER_RATIONALE} chars>" (logged as inspection_waived).`;
}

module.exports = {
  INSPECTED_SEVERITIES, VERDICTS, MIN_INSPECTION_EVIDENCE, MIN_WAIVER_RATIONALE,
  requiresInspection, latestInspection, gateItem, refusalHint,
};
