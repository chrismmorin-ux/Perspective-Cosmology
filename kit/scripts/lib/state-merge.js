'use strict';
/**
 * state-merge.js — three-way merge of ONE CWOS record file (queue/WS-*.yaml and its siblings),
 * with the merger knowing which side is main. Pure: text in, text out, no git, no filesystem.
 *
 * WHY NOT A GIT MERGE DRIVER (the failure review of ADR-080, 2026-10-19). A low-level driver gets
 * %O %A %B and cannot tell which side is main — during `merge` ours is the branch, during `rebase`
 * ours is upstream, and tool-driven merges flip it again — so any "main's lease wins" rule is
 * direction-dependent there. Here the caller names the sides. The review also showed that the
 * conflicts that actually bit (PT-by-AI #32) were delete/modify and rename/modify, which git never
 * hands to a content driver at all; those are the resolver's tree-level table, not this file.
 *
 * WHAT IT DOES, per top-level key (blocks from lib/merge-strategy.js splitTopLevelBlocks):
 *   - changed on one side only            -> that side
 *   - the LEASE TUPLE changed on both      -> decided as ONE unit (not per key, or you get
 *     `status: done` beside a live `claimed_by`): a closing status beats a lease-only change on the
 *     other side; otherwise the side whose tuple carries the later timestamp wins; no timestamp to
 *     compare -> conflict
 *   - a list changed on both (both sides parse as `- item` sequences, e.g. blocked_by, enables,
 *     files_involved, corrections) -> ordered union, honouring removals against base
 *   - anything else changed on both        -> CONFLICT. `notes:` is a scalar in real data; a textual
 *     "union" of two scalars would be a silent last-wins loss, so it is refused
 *   - `claimed_by: ""` and `claimed_by: null` and an absent claimed_by are the same unset lease
 *
 * FAIL CLOSED. Any side that splitTopLevelBlocks refuses, any side whose split disagrees with the
 * YAML parser's key set (a multi-line quoted scalar with a `Word: text` continuation line would
 * otherwise mint a phantom key), an empty base with both sides adding different content, or a
 * both-changed key with no rule -> { ok: false, conflicts: [...] } and NO text. The caller treats
 * that as a real conflict. Nothing here ever returns ok:true having dropped a side.
 */

const { splitTopLevelBlocks } = require('./merge-strategy');
const { parseYAML } = require('./cwos-utils');

const CLOSING = new Set(['done', 'dismissed', 'completed', 'cancelled', 'decomposed', 'superseded']);

// The fields every status/claim verb writes together (cwos-item.js runTransition, runDoneItem;
// cwos-claims.js claimItems/releaseItems). Merged as one unit when any of them is both-changed.
const LEASE_TUPLE = new Set([
  'status', 'claimed_by', 'claimed_at', 'released_by', 'released_at',
  'completed_at', 'completion_commit', 'completion_notes', 'closed_by_event',
  'transitioned_by_event', 'dismissed_at', 'dismiss_reason', 'deferred_at', 'started_at',
  'updated_at', 'status_note', 'superseded_by', 'blocked_at', 'blocked_reason',
]);
const TUPLE_TIMES = ['claimed_at', 'released_at', 'completed_at', 'dismissed_at', 'deferred_at', 'started_at', 'blocked_at', 'updated_at'];
const UNSET_KEYS = new Set(['claimed_by', 'claimed_at', 'released_by', 'released_at']);

function eolOf(text) { return /\r\n/.test(text) ? '\r\n' : '\n'; }

function normBlock(lines) {
  // Compare without trailing blank lines (upsertYAMLScalarField trims the end on one side and not
  // the other) and without CR, so a CRLF checkout does not read as a change.
  const arr = lines.map((l) => l.replace(/\r$/, ''));
  while (arr.length && /^\s*$/.test(arr[arr.length - 1])) arr.pop();
  return arr.join('\n');
}

/** { ok, order, blocks(Map key->normalized text), raw(Map key->lines), reason } with the phantom-key guard. */
function split(text, label) {
  const t = String(text || '');
  if (!t.trim()) return { ok: true, empty: true, order: [], blocks: new Map(), raw: new Map() };
  const s = splitTopLevelBlocks(t);
  if (!s.ok) return { ok: false, reason: `${label}: ${s.reason}` };
  let parsed;
  try { parsed = parseYAML(t, []); } catch (e) { return { ok: false, reason: `${label}: YAML parse failed: ${e.message}` }; }
  const parsedKeys = parsed && typeof parsed === 'object' ? Object.keys(parsed) : [];
  const splitKeys = s.order;
  const missing = splitKeys.filter((k) => !parsedKeys.includes(k));
  const extra = parsedKeys.filter((k) => !splitKeys.includes(k));
  if (missing.length || extra.length) {
    return { ok: false, reason: `${label}: block split and YAML parser disagree on keys (split-only: ${missing.join(',') || '-'}; parser-only: ${extra.join(',') || '-'}) — refused rather than guess` };
  }
  const blocks = new Map(); const raw = new Map();
  for (const k of s.order) { raw.set(k, s.blocks.get(k)); blocks.set(k, normBlock(s.blocks.get(k))); }
  return { ok: true, empty: false, order: s.order, blocks, raw, parsed };
}

function scalarOf(side, key) {
  const v = side.parsed ? side.parsed[key] : undefined;
  if (v === undefined || v === null) return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  return v;
}
function isUnset(side, key) { return scalarOf(side, key) === null; }
function sameUnset(a, b, key) { return UNSET_KEYS.has(key) && isUnset(a, key) && isUnset(b, key); }

function changed(a, b, key) {
  const ta = a.blocks.get(key), tb = b.blocks.get(key);
  if (ta === undefined && tb === undefined) return false;
  if (ta === undefined || tb === undefined) return !sameUnset(a, b, key);
  if (ta === tb) return false;
  return !sameUnset(a, b, key);
}

function latestTime(side, base) {
  let best = null;
  for (const k of TUPLE_TIMES) {
    if (!changed(base, side, k)) continue; // only times this side actually wrote count
    const v = scalarOf(side, k);
    const t = v ? Date.parse(String(v)) : NaN;
    if (Number.isFinite(t) && (best === null || t > best)) best = t;
  }
  return best;
}

function tupleChangedKeys(base, side) {
  return [...LEASE_TUPLE].filter((k) => changed(base, side, k));
}

/** Decide the lease tuple as a unit. Returns { winner: 'main'|'branch', rule } or { conflict }. */
function decideTuple(base, main, branch) {
  const mainStatus = scalarOf(main, 'status'), branchStatus = scalarOf(branch, 'status'), baseStatus = scalarOf(base, 'status');
  const mainChangedStatus = mainStatus !== baseStatus, branchChangedStatus = branchStatus !== baseStatus;
  const mainCloses = mainChangedStatus && CLOSING.has(String(mainStatus));
  const branchCloses = branchChangedStatus && CLOSING.has(String(branchStatus));
  // A close beats a lease-only change on the other side (a claim on a branch never outranks the
  // work being finished on main, and a finished branch never gets reopened by a later claim on
  // main that only existed because the close had not landed).
  if (mainCloses && !branchChangedStatus) return { winner: 'main', rule: 'close beats lease change' };
  if (branchCloses && !mainChangedStatus) return { winner: 'branch', rule: 'close beats lease change' };
  const tm = latestTime(main, base), tb = latestTime(branch, base);
  if (tm !== null && tb !== null && tm !== tb) return { winner: tm > tb ? 'main' : 'branch', rule: `later timestamp wins (${new Date(Math.max(tm, tb)).toISOString()})` };
  if (tm !== null && tb === null) return { winner: 'main', rule: 'only main carries a timestamp for its change' };
  if (tb !== null && tm === null) return { winner: 'branch', rule: 'only the branch carries a timestamp for its change' };
  return { conflict: `both sides changed the lease/status tuple (main: ${mainStatus}/${scalarOf(main, 'claimed_by') || 'unclaimed'}, branch: ${branchStatus}/${scalarOf(branch, 'claimed_by') || 'unclaimed'}) and no timestamp decides it` };
}

function parseList(side, key) {
  const v = side.parsed ? side.parsed[key] : undefined;
  return Array.isArray(v) ? v : null;
}
const itemKey = (x) => (x && typeof x === 'object' ? JSON.stringify(x) : String(x));

function unionList(base, main, branch, key) {
  const lb = parseList(base, key) || [], lm = parseList(main, key), lr = parseList(branch, key);
  if (!lm || !lr) return null;
  const kb = new Set(lb.map(itemKey)), km = new Set(lm.map(itemKey)), kr = new Set(lr.map(itemKey));
  const removed = new Set([...kb].filter((k) => !km.has(k) || !kr.has(k)));
  const out = []; const seen = new Set();
  for (const x of [...lm, ...lr]) { const k = itemKey(x); if (removed.has(k) && kb.has(k)) continue; if (seen.has(k)) continue; seen.add(k); out.push(x); }
  return out;
}

function renderList(key, items, eol) {
  if (!items.length) return [`${key}: []`];
  const lines = [`${key}:`];
  for (const x of items) {
    if (x && typeof x === 'object' && !Array.isArray(x)) {
      const ks = Object.keys(x);
      ks.forEach((k, i) => lines.push(`${i === 0 ? '  - ' : '    '}${k}: ${yamlScalar(x[k])}`));
    } else lines.push(`  - ${yamlScalar(x)}`);
  }
  return lines;
}
function yamlScalar(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  const s = String(v);
  return /^[A-Za-z0-9_./-]+$/.test(s) ? `"${s}"` : JSON.stringify(s);
}

/**
 * @param {{base:string, main:string, branch:string, takeMain?:Set<string>}} sides
 *   takeMain: keys that are DERIVED counters in this kind of record (program files carry
 *   work_items_open, findings_open, cap_breach, health_score ... which cwos-reconcile recomputes);
 *   when both sides changed one of these, main's value is taken and reconcile rewrites it anyway.
 * @returns {{ok:boolean, text?:string, resolved:Array<{key:string, rule:string}>, conflicts:Array<{key:string, why:string}>}}
 */
function mergeRecordText({ base, main, branch, takeMain = null }) {
  const B = split(base, 'base'), M = split(main, 'main'), R = split(branch, 'branch');
  for (const s of [B, M, R]) if (!s.ok) return { ok: false, resolved: [], conflicts: [{ key: '*', why: s.reason }] };
  if (M.empty && R.empty) return { ok: true, text: '', resolved: [], conflicts: [] };
  if (M.empty || R.empty) return { ok: false, resolved: [], conflicts: [{ key: '*', why: `${M.empty ? 'main' : 'branch'} side is empty: a deleted record is the resolver's call, not a content merge` }] };
  if (B.empty && normBlock(String(main).split('\n')) !== normBlock(String(branch).split('\n'))) {
    return { ok: false, resolved: [], conflicts: [{ key: '*', why: 'added on both sides with different content (two branches filed the same id): refused' }] };
  }
  const eol = eolOf(main);
  const order = [...M.order];
  for (const k of R.order) if (!order.includes(k)) order.push(k);
  const resolved = []; const conflicts = []; const out = new Map();
  const pick = (side, k) => { const raw = side.raw.get(k); if (raw !== undefined) out.set(k, raw.map((l) => l.replace(/\r$/, ''))); };

  // Lease tuple first, as a unit, if both sides touched it.
  const mainTuple = tupleChangedKeys(B, M), branchTuple = tupleChangedKeys(B, R);
  let tupleWinner = null;
  if (mainTuple.length && branchTuple.length) {
    const bothSame = [...new Set([...mainTuple, ...branchTuple])].every((k) => !changed(M, R, k));
    if (!bothSame) {
      const d = decideTuple(B, M, R);
      if (d.conflict) conflicts.push({ key: 'status/claim tuple', why: d.conflict });
      else { tupleWinner = d.winner; resolved.push({ key: 'status/claim tuple', rule: `${d.winner} wins: ${d.rule}` }); }
    }
  }

  for (const k of order) {
    const inM = M.blocks.has(k), inR = R.blocks.has(k);
    if (LEASE_TUPLE.has(k) && tupleWinner) { pick(tupleWinner === 'main' ? M : R, k); continue; }
    const cm = changed(B, M, k), cr = changed(B, R, k);
    if (!cm && !cr) { if (inM) pick(M, k); else if (inR) pick(R, k); continue; }
    if (cm && !cr) { if (inM) pick(M, k); /* else deleted on main */ resolved.push({ key: k, rule: inM ? 'main changed it' : 'main removed it' }); continue; }
    if (cr && !cm) { if (inR) pick(R, k); resolved.push({ key: k, rule: inR ? 'branch changed it' : 'branch removed it' }); continue; }
    // both changed
    if (!changed(M, R, k)) { if (inM) pick(M, k); continue; } // same change on both
    if (!inM || !inR) { conflicts.push({ key: k, why: `removed on ${inM ? 'the branch' : 'main'} and changed on the other side` }); continue; }
    if (takeMain && takeMain.has(k)) { pick(M, k); resolved.push({ key: k, rule: 'derived counter: main\'s taken, reconcile recomputes it' }); continue; }
    const u = unionList(B, M, R, k);
    if (u) { out.set(k, renderList(k, u, eol)); resolved.push({ key: k, rule: 'list union' }); continue; }
    conflicts.push({ key: k, why: `changed on both sides and no rule decides a ${LEASE_TUPLE.has(k) ? 'tuple field outside a tuple decision' : 'scalar/map'} (main: ${JSON.stringify(scalarOf(M, k))}, branch: ${JSON.stringify(scalarOf(R, k))})` });
  }
  if (conflicts.length) return { ok: false, resolved, conflicts };
  const lines = [];
  // Preserve a leading `---` document start if main had one.
  const firstMain = String(main).split(/\r?\n/)[0];
  if (/^---\s*$/.test(firstMain)) lines.push('---');
  for (const k of order) { const blk = out.get(k); if (blk) lines.push(...blk); }
  while (lines.length && /^\s*$/.test(lines[lines.length - 1])) lines.pop();
  const text = lines.join(eol) + eol;
  // The output must itself split and parse to the same key set, or we refuse our own work.
  const check = split(text, 'merged');
  if (!check.ok) return { ok: false, resolved, conflicts: [{ key: '*', why: `merged text failed its own check: ${check.reason}` }] };
  return { ok: true, text, resolved, conflicts: [] };
}

/** True when `side` differs from `base` only in lease-tuple keys (a claim, a release, a stamp). */
function isLeaseOnlyChange(base, side) {
  const B = split(base, 'base'), S = split(side, 'side');
  if (!B.ok || !S.ok || B.empty || S.empty) return false;
  const keys = new Set([...B.order, ...S.order]);
  for (const k of keys) if (changed(B, S, k) && !LEASE_TUPLE.has(k)) return false;
  return true;
}

module.exports = { mergeRecordText, isLeaseOnlyChange, LEASE_TUPLE, CLOSING, split };
