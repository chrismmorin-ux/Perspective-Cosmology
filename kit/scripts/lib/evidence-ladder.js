'use strict';
/**
 * evidence-ladder.js — computed evidence grades for any repo's records.
 *
 * Common machinery (founder, 2026-09-26: "invest in common machinery"). Lifted
 * from pc2's canon/EVIDENCE.md and first used by nutrition's claim-records:
 *
 *   A record's grade is COMPUTED from what the record contains, never asserted
 *   by the record and never approved by a person. Every rung names what moves a
 *   record onto it. Grades rise on evidence and on nothing else.
 *
 * A repo declares its ladder as data (see kit/templates/evidence/
 * evidence-ladder.template.yaml); this module evaluates it. Zero deps.
 *
 * Ladder shape:
 *   rungs:      ordered list, lowest first. A record holds rung k only if it
 *               holds every rung below k (contiguous, as in pc2's X ladder).
 *     - id, name, next      next = what moves a record ONTO this rung
 *       requires: [cond]    all must hold
 *       downgrades: [{when: cond, reason}]  any hit holds the record one rung down
 *   blockers:   [{when: cond, reason}]  any hit → the floor rung, whatever else holds
 *   fixtures:   [{name, record, expect}] — run by selfTest(). A ladder whose
 *               fixtures never expect the floor rung cannot prove it refuses
 *               anything, and selfTest() fails it (pc2 GATES rule 1).
 *
 * Condition vocabulary. A condition is a flat map with an `op` (flat because
 * the kit's zero-dep YAML reader drops the key of a list item whose only value
 * is a map — measured 2026-09-26 building this):
 *   {op: present, path}                  value at path is not null/undefined/''
 *   {op: in, path, values: [...]}        value at path is one of values
 *   {op: eq, path, value}
 *   {op: lt, path, value}                numeric, and the path is present
 *   {op: quote_has_value, quote, value}  the number at path `value` appears in
 *                                        the text at path `quote` as a whole token
 *   {op: replicated, key, min, independent_by: [path | {path, transform}]}
 *                                        >= min records holding the rung below
 *                                        share `key` and differ on EVERY
 *                                        independent_by value (transform: first_word)
 *   {op: any|all, of: [cond]} · {op: not, of: [cond]}
 */

function getPath(obj, p) {
  if (!p) return undefined;
  return String(p).split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/**
 * True when `value` appears in `text` as a whole number token. "3" must not
 * match inside "30", "0.3" or "13"; "6.3" must not match "6.35". Handles the
 * unicode minus and thin spaces sources actually print.
 */
function quoteContainsValue(text, value) {
  if (typeof text !== 'string' || typeof value !== 'number' || !Number.isFinite(value)) return false;
  // A thousands separator is part of the number: 3400 is in "3,400" and 1234567
  // in "1,234,567" (WS-960; nutrition's WS-107 records quote sources verbatim and
  // the quote must not be edited). Only a well-formed group folds: 1-3 digits,
  // then one or more ",ddd", not preceded by a digit, point or comma and not
  // followed by a digit, so "10,20", "1,2,000" and "12345,678" stay as printed.
  // The fold also stops 400 matching inside "3,400", which it used to.
  const norm = text.replace(/−/g, '-').replace(/[  ]/g, ' ')
    .replace(/(?<![0-9.,])[0-9]{1,3}(?:,[0-9]{3})+(?![0-9])/g, (m) => m.replace(/,/g, ''));
  const v = String(value).replace(/\./g, '\\.');
  // Trailing zeros are the same number: 0.9 is in "0.90" and 280.4 in "280.40000000"
  // (sources print fixed decimals; FDC's API prints eight). An integer may carry ".0+"
  // and nothing else: 28 is in "28.0" but not in "280" or "28.05" (WS-106, kit 3.47.1).
  const tail = v.includes('.') ? '0*' : '(?:\\.0+)?';
  return new RegExp(`(^|[^0-9.])${v}${tail}(?![0-9]|\\.[0-9])`).test(norm);
}

const TRANSFORMS = {
  first_word: (s) => String(s || '').trim().split(/[\s,]/)[0].toLowerCase(),
};

function independentValue(rec, spec) {
  if (typeof spec === 'string') return getPath(rec, spec);
  const raw = getPath(rec, spec.path);
  const t = TRANSFORMS[spec.transform];
  return t ? t(raw) : raw;
}

// ctx = { records, holdsBelow } — only `replicated` needs it.
function evalCond(cond, rec, ctx) {
  if (!cond || typeof cond !== 'object' || !cond.op) {
    throw new Error(`evidence-ladder: a condition needs an op, got ${JSON.stringify(cond)}`);
  }
  const a = cond;
  switch (a.op) {
    case 'present': { const v = getPath(rec, a.path); return v !== undefined && v !== null && v !== ''; }
    case 'in': return (a.values || []).includes(getPath(rec, a.path));
    case 'eq': return getPath(rec, a.path) === a.value;
    case 'lt': { const v = getPath(rec, a.path); return typeof v === 'number' && v < a.value; }
    case 'quote_has_value': return quoteContainsValue(getPath(rec, a.quote), getPath(rec, a.value));
    case 'any': return (a.of || []).some((c) => evalCond(c, rec, ctx));
    case 'all': return (a.of || []).every((c) => evalCond(c, rec, ctx));
    case 'not': {
      if (!Array.isArray(a.of) || a.of.length !== 1) throw new Error('evidence-ladder: not takes exactly one condition in `of`');
      return !evalCond(a.of[0], rec, ctx);
    }
    case 'replicated': {
      if (!ctx || !ctx.records) return false;
      const key = getPath(rec, a.key);
      if (key === undefined || key === null || key === '') return false;
      const specs = a.independent_by || [];
      const peers = ctx.records.filter((o) => o !== rec
        && getPath(o, a.key) === key
        && ctx.holdsBelow(o)
        && specs.every((s) => independentValue(o, s) !== independentValue(rec, s)));
      return peers.length + 1 >= (a.min || 2);
    }
    default: throw new Error(`evidence-ladder: unknown condition op '${a.op}'`);
  }
}

function validateLadder(ladder) {
  const errs = [];
  if (!ladder || !Array.isArray(ladder.rungs) || ladder.rungs.length < 2) errs.push('ladder needs at least two rungs');
  const ids = new Set();
  for (const r of (ladder && ladder.rungs) || []) {
    if (!r.id) errs.push('every rung needs an id');
    if (ids.has(r.id)) errs.push(`duplicate rung id ${r.id}`);
    ids.add(r.id);
  }
  return errs;
}

/**
 * Grades one record given the whole set (the set matters only for replication).
 * Returns { rung, index, reasons[], next }.
 */
function gradeRecord(ladder, rec, records) {
  const rungs = ladder.rungs;
  const floor = rungs[0];
  for (const b of ladder.blockers || []) {
    if (evalCond(b.when, rec, null)) {
      return { rung: floor.id, index: 0, reasons: [`blocked: ${b.reason}`], next: b.next || 'remove the blocking condition' };
    }
  }
  const reasons = [];
  let held = 0; // rung 0 is the floor and always holds
  for (let i = 1; i < rungs.length; i++) {
    const r = rungs[i];
    const ctx = {
      records: records || [],
      holdsBelow: (o) => o === rec || gradeRecord(
        Object.assign({}, ladder, { rungs: rungs.slice(0, i) }), o, records).index === i - 1,
    };
    const unmet = (r.requires || []).filter((c) => !evalCond(c, rec, ctx));
    if (unmet.length) return { rung: rungs[held].id, index: held, reasons, next: r.next || `meet ${r.id}` };
    const hits = (r.downgrades || []).filter((d) => evalCond(d.when, rec, ctx));
    if (hits.length) {
      reasons.push(`${r.id} withheld: ${hits.map((h) => h.reason).join('; ')}`);
      return { rung: rungs[held].id, index: held, reasons, next: r.next || `clear the downgrade to reach ${r.id}` };
    }
    held = i;
    reasons.push(r.name ? `${r.id} ${r.name}` : r.id);
  }
  return { rung: rungs[held].id, index: held, reasons, next: ladder.top_next || 'top of ladder — re-verify when newer evidence appears' };
}

function gradeRecords(ladder, records) {
  const errs = validateLadder(ladder);
  if (errs.length) throw new Error(`evidence-ladder: ${errs.join('; ')}`);
  return records.map((rec) => Object.assign({ record: rec }, gradeRecord(ladder, rec, records)));
}

/**
 * Runs the ladder's own fixtures. Fails when any fixture grades wrong, or when
 * no fixture expects the floor rung — a ladder that never refuses has not
 * shown it can.
 */
function selfTest(ladder) {
  const results = [];
  const errs = validateLadder(ladder);
  if (errs.length) return { ok: false, results, errors: errs };
  const fixtures = ladder.fixtures || [];
  const floor = ladder.rungs[0].id;
  if (!fixtures.length) return { ok: false, results, errors: ['ladder declares no fixtures'] };
  if (!fixtures.some((f) => f.expect === floor)) {
    return { ok: false, results, errors: [`no fixture expects the floor rung ${floor}: the ladder has not shown it refuses anything`] };
  }
  for (const f of fixtures) {
    const got = gradeRecord(ladder, f.record, f.group ? fixtures.filter((o) => o.group === f.group).map((o) => o.record) : [f.record]).rung;
    results.push({ name: f.name, expect: f.expect, got, ok: got === f.expect });
  }
  return { ok: results.every((r) => r.ok), results, errors: [] };
}

module.exports = { getPath, quoteContainsValue, evalCond, gradeRecord, gradeRecords, selfTest, validateLadder };
