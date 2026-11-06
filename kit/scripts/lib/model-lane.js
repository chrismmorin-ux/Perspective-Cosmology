'use strict';
/**
 * model-lane.js — which model a queue item's work should run on, and the rule that
 * keeps a cheaper model from being assigned on faith (WS-1170).
 *
 * WHY THIS EXISTS. Measured 2026-10-09..15 by cwos-resource-board (WS-1169): Opus did
 * 99% of the fleet's token volume, and 72% of 321 helper dispatches named no model at
 * all, so they inherited the session's Opus. Nothing on a queue item said which model
 * its work needed, so nothing could choose deliberately. Tokens are surplus and compute
 * is scarce: this is about ALLOCATION — top models where the work is deep, simpler
 * models where they thrive — not cost-cutting.
 *
 * THREE PIECES, ONE FILE (pure; no I/O except readLedger/ledgerPath):
 *
 *   1. classifyLane(item) — a lane from STRUCTURAL signals only: compute_job, runs_on,
 *      type, decision_flags, effort, declared file paths, and an optional repo-declared
 *      program map. Never prose keywords — a keyword backfill over a domain corpus once
 *      labelled 18 poker engine items as phone errands ("call", "check"), and that lesson
 *      is the reason this ladder reads fields, not sentences. Every result names the
 *      signal that decided it, so a wrong lane is traceable to the token that produced it.
 *
 *   2. Lane -> model, read from fleet/anchors/routing-ledger.yaml (`classes:` entries
 *      carrying `lane:`). The ledger is the only place a lane's model lives; no default
 *      model is hard-coded here, so a ledger that cannot be read is an error, not a
 *      silent "opus".
 *
 *   3. The demotion gate. Founder ruling 2026-10-15: a task type moves to a cheaper model
 *      only after a scored trial shows it holds quality, and the top model is tried at a
 *      lower effort BEFORE a cheaper model is. So a lane whose model (or effort) sits below
 *      its baseline must cite a recorded PASS in the ledger's demotion_log whose evidence
 *      file exists — and a model demotion additionally needs the baseline model's
 *      lower-effort trial on record. Otherwise the lane is REFUSED, naming the trial that
 *      is missing. The gate covers EVERY class entry (resolveClass), not only the lanes; a PASS is
 *      the structured `result: pass`; evidence is a file under fleet/anchors/; every class carries
 *      a `baseline`, and PINNED_BASELINES stops baselines moving down. Resolution never falls back to the baseline: a lane that was lowered
 *      without evidence must be fixed, and a quiet fallback would hide that it happened.
 */

const fs = require('fs');
const path = require('path');

const LANES = Object.freeze(['deep-reasoning', 'deep-code', 'mechanical', 'compute', 'founder']);
const PROVENANCE = Object.freeze(['rule', 'trial', 'founder']);

/** Rank order per engines/procedures/agent-dispatch.md: haiku < sonnet < opus < fable. */
const MODEL_RANK = Object.freeze({ haiku: 1, sonnet: 2, opus: 3, fable: 4 });
/** Claude Code effort levels. Unset means "the harness default", ranked as high. */
const EFFORT_RANK = Object.freeze({ low: 1, medium: 2, high: 3, xhigh: 4, max: 5 });
const DEFAULT_EFFORT_RANK = EFFORT_RANK.high;
/** Lanes whose work is not done by a dispatched model at all. */
const NO_MODEL = 'none';

const LEDGER_REL = path.join('fleet', 'anchors', 'routing-ledger.yaml');

// ─── 1. classification ──────────────────────────────────────────────────────

const FOUNDER_TYPES = new Set(['decision', 'founder-decision', 'errand']);
const REASONING_TYPES = new Set(['research', 'investigation', 'spike', 'design', 'analysis', 'audit', 'measurement', 'experiment']);
const MECHANICAL_TYPES = new Set(['chore', 'documentation', 'docs', 'maintenance', 'cleanup', 'records']);
const COMPUTE_RUNS_ON = new Set(['compute', 'node1']);
const SMALL_EFFORT = new Set(['XS', 'S']);

const PATH_RE = /(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+\.(?:jsx|tsx|css|js|mjs|cjs|ts|py|ps1|sh|go|rs|java|rb|html|md|yaml|yml|json|jsonl|toml|txt|csv)\b/g;
const CODE_EXT = /\.(?:jsx|tsx|css|js|mjs|cjs|ts|py|ps1|sh|go|rs|java|rb|html)$/i;
// Governance/config files change behaviour like code does (CI, settings, package manifests, the
// routing ledger), so they are code paths, never prose. A bare *.yaml elsewhere stays prose/config.
const GOVERNANCE_PATH = /(?:^|\/)\.github\/|\.(?:json|yml)$|(?:^|\/)\.cwos-[^/]*\.ya?ml$|(?:^|\/)\.claude\/settings[^/]*$|(?:^|\/)routing-ledger\.ya?ml$/i;
const isCodePath = (p) => CODE_EXT.test(p) || GOVERNANCE_PATH.test(p);
const PROSE_CONFIG = /\.(?:md|yaml|jsonl|toml|txt|csv)$/i;

const str = (v) => (v === undefined || v === null ? '' : String(v).trim());
const lower = (v) => str(v).toLowerCase();

/** Every path-like token in a string, de-duplicated, in first-seen order. */
function extractPaths(text) {
  const out = [];
  const seen = new Set();
  for (const m of String(text || '').match(PATH_RE) || []) {
    const p = m.replace(/^\.\//, '').replace(/[.,;:)]+$/, '');
    if (p && !seen.has(p)) { seen.add(p); out.push(p); }
  }
  return out;
}

/**
 * The paths an item cites. Declared lists win (files_involved, files_likely_involved);
 * only when none is declared are path tokens taken from the item's own description and
 * accept criteria. A path is a structural token wherever it is written — the rule
 * excludes vocabulary, not file names.
 */
function citedPaths(item) {
  const declared = []
    .concat(Array.isArray(item.files_involved) ? item.files_involved : [])
    .concat(Array.isArray(item.files_likely_involved) ? item.files_likely_involved : [])
    .map((p) => String(p).split('\\').join('/').replace(/^\.\//, '').trim())
    .filter(Boolean);
  if (declared.length) return { paths: declared, from: 'files_involved' };
  const text = []
    .concat(item.description || [])
    .concat(Array.isArray(item.accept_criteria) ? item.accept_criteria : (item.accept_criteria || []))
    .join('\n');
  return { paths: extractPaths(text), from: 'text' };
}

/**
 * The ladder. Stop at the first yes. `programLanes` is an optional repo-declared
 * { program: lane } map (.cwos-config.yaml `model_lanes.programs`) — the kit cannot know
 * what a repo's programs mean, so it ships none.
 *
 *   1. founder         type is a founder decision/errand, or the item names the founder as owner
 *   2. compute         a compute_job block, or runs_on compute (legacy node1)
 *   3. program map     a lane the repo declared for this program
 *   4. deep-reasoning  decision_flags to frame, a research/design/measurement type, or effort XL
 *   5. mechanical      runs_on light (only when no code/governance path is cited); or small effort (XS/S) whose cited paths are all prose/config,
 *                      or a chore/documentation type at small effort
 *   6. deep-code       a cited code path, or runs_on browser
 *   7. deep-code       default — no signal. The honest default is the lane that keeps the top
 *                      code model, not a cheaper guess a reader would then trust.
 *
 * @returns {{lane: string, reason: string}}
 */
function classifyLane(item, opts = {}) {
  const it = item || {};
  const type = lower(it.type);
  const runsOn = lower(it.runs_on);
  const effort = str(it.effort).toUpperCase();
  const owner = lower(it.owner || it.assignee);

  if (FOUNDER_TYPES.has(type)) return { lane: 'founder', reason: `type ${type}` };
  if (owner === 'founder') return { lane: 'founder', reason: 'owner founder' };

  if (it.compute_job && typeof it.compute_job === 'object') return { lane: 'compute', reason: 'compute_job block' };
  if (COMPUTE_RUNS_ON.has(runsOn)) return { lane: 'compute', reason: `runs_on ${runsOn}` };

  const programLanes = opts.programLanes || {};
  const mapped = it.program ? programLanes[it.program] : null;
  if (mapped && LANES.includes(mapped)) return { lane: mapped, reason: `program ${it.program} (repo map)` };

  const flags = Array.isArray(it.decision_flags) ? it.decision_flags.filter(Boolean) : [];
  if (flags.length) return { lane: 'deep-reasoning', reason: `${flags.length} decision_flag(s)` };
  if (REASONING_TYPES.has(type)) return { lane: 'deep-reasoning', reason: `type ${type}` };
  if (effort === 'XL') return { lane: 'deep-reasoning', reason: 'effort XL' };

  const { paths, from } = citedPaths(it);
  const code = paths.find(isCodePath);
  // A cited code/governance path outranks the light shortcut: the cheapest lane must not own CI or settings.
  if (!code && (runsOn === 'light' || runsOn === 'phone')) return { lane: 'mechanical', reason: `runs_on ${runsOn}` };
  if (SMALL_EFFORT.has(effort) && paths.length && !code && paths.every((p) => PROSE_CONFIG.test(p))) {
    return { lane: 'mechanical', reason: `effort ${effort}, prose/config only (${paths.length} path(s) from ${from})` };
  }
  if (SMALL_EFFORT.has(effort) && MECHANICAL_TYPES.has(type) && !code) {
    return { lane: 'mechanical', reason: `type ${type}, effort ${effort}` };
  }

  if (code) return { lane: 'deep-code', reason: `code path ${code} (from ${from})` };
  if (runsOn === 'browser' || runsOn === 'g16') return { lane: 'deep-code', reason: `runs_on ${runsOn}` };
  return { lane: 'deep-code', reason: paths.length ? 'no lane signal (default)' : 'no path cited (default)' };
}

// ─── 2. the ledger ──────────────────────────────────────────────────────────

function ledgerPath(homeBaseRoot) {
  return homeBaseRoot ? path.join(homeBaseRoot, LEDGER_REL) : null;
}

/** {ok, data, error}. Reads through the kit YAML reader so the parse matches every other reader. */
function readLedger(file) {
  if (!file) return { ok: false, error: 'HomeBase not reachable — the routing ledger lives at fleet/anchors/routing-ledger.yaml there' };
  if (!fs.existsSync(file)) return { ok: false, error: `routing ledger missing: ${file}` };
  const { readYAMLFile } = require('./cwos-utils');
  const r = readYAMLFile(file);
  if (!r.ok || !r.data) return { ok: false, error: `routing ledger unreadable: ${r.error || 'empty'}` };
  return { ok: true, data: r.data };
}

/** `"opus@low"`, `"sonnet (and haiku …)"`, `"haiku"` -> { model, effort }. */
function parseTarget(v) {
  const m = lower(v).match(/^([a-z]+)(?:@([a-z]+))?/);
  if (!m) return { model: null, effort: null };
  return { model: m[1], effort: m[2] || null };
}

/** A rank for an effort that must be NAMED and known; null otherwise (never the default). */
const namedEffortRank = (e) => (str(e) ? (EFFORT_RANK[lower(e)] || null) : null);

/**
 * Baselines never move down — a passed demotion moves `tier`, never `baseline`.
 * This map freezes every class's baseline as of 2026-10-21 (the lane classes ran at opus
 * before any trial; the rest are their tier on that date). checkLedger reports a ledger
 * baseline BELOW its pin, which closes "lower tier and baseline together" (engine-findings
 * item 2). Raising a baseline is allowed; a class with no pin is allowed but still needs a
 * valid baseline. To add a class, add its pin here in the same change.
 */
const PINNED_BASELINES = Object.freeze({
  'lane-deep-reasoning': 'opus',
  'lane-deep-code': 'opus',
  'lane-mechanical': 'opus',
  'lane-compute': 'none',
  'lane-founder': 'none',
  'kit-update-triage': 'haiku',
  'fleet-aggregation': 'haiku',
  'kit-catchup-prs': 'sonnet',
  'engine-phase1-scan': 'sonnet',
  'engine-cross-critique': 'opus',
  'engine-synthesis': 'opus',
  'pre-pr-review': 'opus',
  'pc2-physics-research': 'fable',
  'poker-design-decisions': 'fable',
  'poker-execution': 'opus',
  'syn-risk-loadbearing': 'fable',
  'anchor-runs': 'fable',
  'intent-vs-shape-audit': 'opus',
  'compliance-probes': 'haiku',
});
/**
 * Pinned baseline_effort (unset = high, the harness default). Every class is pinned at high:
 * a ledger baseline_effort below the pin would make a lower effort look like "at baseline".
 */
const PINNED_BASELINE_EFFORT = 'high';
const classKey = (c) => (typeof c === 'string' ? c.trim().toLowerCase() : '');
const baselineRank = (b) => (b === NO_MODEL ? 0 : MODEL_RANK[b] || null);

/** The lane entries in the ledger, keyed by lane. */
function laneEntries(ledger) {
  const out = {};
  for (const c of (ledger && Array.isArray(ledger.classes) ? ledger.classes : [])) {
    if (c && c.lane) out[String(c.lane)] = c;
  }
  return out;
}

/** Lane names that more than one entry claims (laneEntries would silently keep the last). */
function duplicateLanes(ledger) {
  const seen = new Set(); const dup = new Set();
  for (const c of (ledger && Array.isArray(ledger.classes) ? ledger.classes : [])) {
    if (!c || !c.lane) continue;
    const l = String(c.lane);
    if (seen.has(l)) dup.add(l); else seen.add(l);
  }
  return dup;
}

/** Every class entry in the ledger (lane or not). */
function classEntries(ledger) {
  return (ledger && Array.isArray(ledger.classes) ? ledger.classes : []).filter((c) => c && typeof c === 'object');
}

const labelOf = (entry) => (entry.lane ? `lane ${entry.lane} (${entry.class})` : `class ${entry.class}`);

/** A PASS is the structured `result: pass` only. `verdict` stays prose and is never parsed. */
function isPass(row) { return !!row && typeof row.result === 'string' && lower(row.result) === 'pass'; }

/**
 * Does this log row's trial_evidence count? A relative path with no `..` segment that
 * resolves inside <homeBaseRoot>/fleet/anchors/trials/ (not the ledger, not ANCHORS.md) and is a regular FILE. With no
 * homeBaseRoot it cannot be checked, so it does not count (no fail-open).
 */
function evidenceCounts(row, homeBaseRoot) {
  const p = str(row && row.trial_evidence);
  if (!p || !homeBaseRoot) return false;
  const norm = p.split('\\').join('/');
  if (path.isAbsolute(p) || path.posix.isAbsolute(norm) || /^[A-Za-z]:/.test(norm)) return false;
  if (norm.split('/').includes('..')) return false;
  const anchors = path.resolve(homeBaseRoot, 'fleet', 'anchors', 'trials');
  const full = path.resolve(homeBaseRoot, norm);
  if (!full.startsWith(anchors + path.sep)) return false;
  try {
    if (!fs.statSync(full).isFile()) return false;
    const realAnchors = fs.realpathSync(anchors);
    return fs.realpathSync(full).startsWith(realAnchors + path.sep);
  } catch { return false; }
}

/**
 * Tier-independent problems with an entry: baseline missing/unknown, unknown effort strings,
 * unknown floor, baseline `none` with a model tier, baseline below its pin.
 */
function entryShapeProblems(entry) {
  const out = [];
  const L = labelOf(entry);
  if (typeof entry.class !== 'string' || !entry.class.trim()) return [`a classes[] entry has no class name (${L})`];
  const base = lower(entry.baseline);
  const baseOk = base === NO_MODEL || !!MODEL_RANK[base];
  if (!base) out.push(`${L} has no baseline (every class entry must name a model or ${NO_MODEL})`);
  else if (!baseOk) out.push(`${L} baseline '${base}' is not a known model (valid: ${Object.keys(MODEL_RANK).join(', ')}, ${NO_MODEL})`);
  if (str(entry.effort) && !EFFORT_RANK[lower(entry.effort)]) out.push(`${L} names unknown effort '${str(entry.effort)}' (valid: ${Object.keys(EFFORT_RANK).join(', ')})`);
  if (str(entry.baseline_effort) && !EFFORT_RANK[lower(entry.baseline_effort)]) out.push(`${L} names unknown baseline_effort '${str(entry.baseline_effort)}' (valid: ${Object.keys(EFFORT_RANK).join(', ')})`);
  if (str(entry.floor) && !MODEL_RANK[lower(entry.floor)] && lower(entry.floor) !== NO_MODEL) out.push(`${L} names unknown floor '${str(entry.floor)}'`);
  if (baseOk && base === NO_MODEL && lower(entry.tier) !== NO_MODEL) {
    out.push(`${L} has baseline ${NO_MODEL} but tier '${lower(entry.tier)}' — a ${NO_MODEL}-baseline class must stay at ${NO_MODEL}`);
  }
  const pin = PINNED_BASELINES[classKey(entry.class)];
  if (!pin) {
    out.push(`${L} has no entry in PINNED_BASELINES (kit/scripts/lib/model-lane.js) — adding a class requires a kit change to that map in the same PR`);
  } else if (pin === NO_MODEL) {
    if (base !== NO_MODEL || lower(entry.tier) !== NO_MODEL) out.push(`${L} is pinned ${NO_MODEL} (PINNED_BASELINES): baseline and tier must both be exactly ${NO_MODEL}`);
  } else if (baseOk && baselineRank(base) < baselineRank(pin)) {
    out.push(`${L} baseline ${base} is below its pinned baseline ${pin} (PINNED_BASELINES) — baselines never move down; a passed demotion moves tier, not baseline`);
  }
  if (str(entry.baseline_effort) && EFFORT_RANK[lower(entry.baseline_effort)] < EFFORT_RANK[PINNED_BASELINE_EFFORT]) {
    out.push(`${L} baseline_effort ${lower(entry.baseline_effort)} is below its pinned ${PINNED_BASELINE_EFFORT} (unset = ${PINNED_BASELINE_EFFORT}) — baselines never move down`);
  }
  return out;
}

/**
 * Does a PASS row's `to` effort license the target effort? Target with an effort: the row must
 * name exactly it. Target without one (= the harness default, high): the row may name no
 * effort, or a known one that is not above the default. So haiku@high never licenses haiku@low.
 */
function effortMatches(rowEffort, targetEffort, sameModelLowerEffort) {
  if (targetEffort) return lower(rowEffort) === lower(targetEffort);
  if (sameModelLowerEffort) return false;
  if (!rowEffort) return true;
  const r = namedEffortRank(rowEffort);
  return r !== null && r <= DEFAULT_EFFORT_RANK;
}

/**
 * What a class at `model`/`effort` needs on record, given its entry's baseline.
 * Returns [] when the configuration is at or above baseline (nothing to earn).
 * An entry whose baseline/model/effort cannot be read yields one unsatisfiable
 * requirement (fail-closed), never [].
 * Each requirement is { kind, class, to, need_pass, satisfied_by|null, text }.
 */
function demotionRequirements(entry, model, effort, ledger, homeBaseRoot) {
  const cls = String(entry.class).trim();
  const baseModel = lower(entry.baseline);
  const baseEffortR = entry.baseline_effort ? namedEffortRank(entry.baseline_effort) : DEFAULT_EFFORT_RANK;
  const m = lower(model);
  const mR = MODEL_RANK[m];
  const bR = MODEL_RANK[baseModel];
  const eR = effort ? namedEffortRank(effort) : DEFAULT_EFFORT_RANK;
  if (!mR || !bR || !baseEffortR || !eR) {
    return [{
      kind: 'unreadable-shape', class: cls, to: m, need_pass: false, satisfied_by: null,
      text: `a readable baseline, model and effort for ${cls} (baseline '${baseModel}', model '${m}', effort '${str(effort)}', baseline_effort '${str(entry.baseline_effort)}')`,
    }];
  }
  const lowerModel = mR < bR;
  const lowerEffort = mR === bR && eR < baseEffortR;
  if (!lowerModel && !lowerEffort) return [];

  const log = Array.isArray(ledger && ledger.demotion_log) ? ledger.demotion_log : [];
  const find = (pred) => log.find((e) => e && String(e.class) === cls && typeof e.class === 'string' && e.class.trim() === cls && pred(parseTarget(e.to), e)) || null;
  const reqs = [];
  const to = effort && lowerEffort ? `${m}@${lower(effort)}` : m;
  const pass = find((t, e) => t.model === m
    && effortMatches(t.effort, effort, lowerEffort)
    && isPass(e) && evidenceCounts(e, homeBaseRoot));
  reqs.push({
    kind: 'passing-trial', class: cls, to, need_pass: true, satisfied_by: pass,
    text: `a PASS (result: pass) in demotion_log for {class: ${cls}, to: ${to}} whose trial_evidence is a file under fleet/anchors/trials/`,
  });
  if (lowerModel) {
    // Founder ruling 2026-10-15: test the top model at lower effort before demoting.
    // ANY verdict/result satisfies it (the ruling asks that it was TRIED, not that it passed),
    // but the row must be a real trial: known lower effort, counted evidence, and `from`
    // (when given) the baseline model.
    const tried = find((t, e) => t.model === baseModel
      && namedEffortRank(t.effort) !== null && namedEffortRank(t.effort) < baseEffortR
      && evidenceCounts(e, homeBaseRoot)
      && typeof e.result === 'string' && ['pass', 'fail'].includes(lower(e.result))
      && typeof e.from === 'string' && parseTarget(e.from).model === baseModel);
    reqs.push({
      kind: 'lower-effort-first', class: cls, to: `${baseModel}@low|medium`, need_pass: false, satisfied_by: tried,
      text: `a recorded trial of ${baseModel} at lower effort for ${cls} (demotion_log from: ${baseModel}, to: ${baseModel}@low or ${baseModel}@medium, result: pass|fail, evidence file under fleet/anchors/trials/), any verdict`,
    });
  }
  return reqs;
}

/**
 * A tier that cannot be used at all, whatever trials say: an unknown model,
 * `none` on a class whose baseline is a model (that would route work to nobody), or a
 * tier below the class floor (the ledger rule: below-floor tiers are measured, never used).
 * A baseline-`none` class with a model tier is reported by entryShapeProblems.
 */
function laneShapeProblem(entry, model) {
  const base = lower(entry.baseline);
  const L = labelOf(entry);
  if (base === NO_MODEL && model !== NO_MODEL) return `${L} has baseline ${NO_MODEL} and cannot be set to '${model}' — nothing runs a ${NO_MODEL}-baseline class`;
  if (model === NO_MODEL) {
    return base === NO_MODEL ? null : `${L} set to ${NO_MODEL} but its baseline is ${base || 'missing'} — a model class cannot route to nobody`;
  }
  if (!MODEL_RANK[model]) return `${L} names unknown model '${model}' (valid: ${Object.keys(MODEL_RANK).join(', ')}, ${NO_MODEL})`;
  const f = lower(entry.floor);
  if (f && MODEL_RANK[f] && MODEL_RANK[model] < MODEL_RANK[f]) {
    return `${L} tier ${model} is below its floor ${f} — below-floor tiers are measured, never used`;
  }
  return null;
}

/** Shared by resolveLane and resolveClass. Never falls back. */
function resolveEntry(e, ledger, homeBaseRoot) {
  const base = { class: e.class };
  if (e.lane) base.lane = e.lane;
  const refuse = (refused, extra) => Object.assign({ ok: false, model: null }, base, extra || {}, { refused });
  const shapeProblems = entryShapeProblems(e);
  if (shapeProblems.length) return refuse(shapeProblems.join('; '));
  const model = lower(e.tier);
  const shape = laneShapeProblem(e, model);
  if (shape) return refuse(shape);
  if (model === NO_MODEL) return Object.assign({ ok: true, model: NO_MODEL, effort: null, status: e.status || null }, base);
  const missing = demotionRequirements(e, model, e.effort, ledger, homeBaseRoot).filter((r) => !r.satisfied_by);
  if (missing.length) {
    return refuse(
      `${labelOf(e)} is set to ${model}${e.effort ? '@' + e.effort : ''}, below baseline ${lower(e.baseline)}, without ${missing.map((r) => r.text).join('; and ')}`,
      { missing });
  }
  return Object.assign({ ok: true, model, effort: e.effort ? lower(e.effort) : null, status: e.status || null }, base);
}

/**
 * Lane -> what dispatch should use. Never falls back.
 * @returns {{lane, ok, model, effort, status, class, refused?: string, missing?: object[]}}
 */
function resolveLane(lane, ledger, homeBaseRoot) {
  const e = laneEntries(ledger)[lane];
  if (!e) return { lane, ok: false, model: null, refused: `lane ${lane} has no entry in the routing ledger (classes[].lane)` };
  if (duplicateLanes(ledger).has(lane)) return { lane, ok: false, model: null, class: e.class, refused: `lane ${lane} is claimed by more than one ledger entry` };
  return Object.assign({ lane }, resolveEntry(e, ledger, homeBaseRoot));
}

/** Class name -> what dispatch should use. The same gate as resolveLane, for every class. */
function resolveClass(className, ledger, homeBaseRoot) {
  const e = classEntries(ledger).find((c) => classKey(c.class) === classKey(className));
  if (!e) return { class: className, ok: false, model: null, refused: `class ${className} has no entry in the routing ledger` };
  return resolveEntry(e, ledger, homeBaseRoot);
}

/** Every lane and every class entry, resolved — the validator INV-098 runs and /next reads. */
function checkLedger(ledger, homeBaseRoot) {
  const problems = [];
  const entries = laneEntries(ledger);
  for (const lane of LANES) {
    if (!entries[lane]) problems.push(`lane ${lane} has no entry in the routing ledger (classes[].lane)`);
  }
  for (const lane of Object.keys(entries)) {
    if (!LANES.includes(lane)) problems.push(`ledger names unknown lane '${lane}' (valid: ${LANES.join(', ')})`);
  }
  for (const l of duplicateLanes(ledger)) problems.push(`lane ${l} is claimed by more than one ledger entry`);
  const counts = {};
  for (const c of classEntries(ledger)) counts[classKey(c.class)] = (counts[classKey(c.class)] || 0) + 1;
  for (const k of Object.keys(PINNED_BASELINES)) {
    if (!counts[k]) problems.push(`pinned class ${k} is missing from the ledger (PINNED_BASELINES) — a class cannot be removed or renamed without a kit change`);
    else if (counts[k] > 1) problems.push(`pinned class ${k} appears ${counts[k]} times in the ledger`);
  }
  for (const c of classEntries(ledger)) {
    const r = resolveEntry(c, ledger, homeBaseRoot);
    if (!r.ok) problems.push(r.refused);
  }
  return { ok: problems.length === 0, problems };
}

/** A short display string for a resolved lane: "opus", "opus@low", "none", "REFUSED". */
function displayModel(r) {
  if (!r) return '?';
  if (!r.ok) return 'REFUSED';
  return r.effort ? `${r.model}@${r.effort}` : r.model;
}

/**
 * Lower (or set) a lane's model in the ledger TEXT, gated. Pure: returns
 * { ok, content?, refused?, missing? }. Raising is always allowed (the opt-up
 * procedure's justification lives in the ledger comment the founder writes);
 * lowering is refused unless every requirement is on record.
 */
function setLaneModel(ledgerText, ledger, lane, target, homeBaseRoot) {
  const entries = laneEntries(ledger);
  const e = entries[lane];
  if (!e) return { ok: false, refused: `lane ${lane} has no entry in the routing ledger` };
  const t = parseTarget(target);
  if (!t.model) return { ok: false, refused: `unknown model '${target}'` };
  if (t.effort && !EFFORT_RANK[t.effort]) return { ok: false, refused: `unknown effort '${t.effort}' (valid: ${Object.keys(EFFORT_RANK).join(', ')})` };
  const entryProblems = entryShapeProblems(e);
  if (entryProblems.length) return { ok: false, refused: `refusing: ${entryProblems.join('; ')}` };
  const shape = laneShapeProblem(e, t.model);
  if (shape) return { ok: false, refused: `refusing: ${shape}` };
  const missing = demotionRequirements(e, t.model, t.effort, ledger, homeBaseRoot).filter((r) => !r.satisfied_by);
  if (missing.length) {
    return {
      ok: false, missing,
      refused: `refusing to lower lane ${lane} to ${target}: missing ${missing.map((r) => r.text).join('; and ')}. `
        + 'Run the anchor trial (fleet/anchors/ANCHORS.md protocol), record it in demotion_log, then retry.',
    };
  }
  // Edit only this lane's block, line by line: from its `- class:` line to the next
  // list item or the next top-level key. Everything else in the ledger — comments,
  // evidence prose, other classes — is left byte-for-byte.
  const eol = /\r\n/.test(ledgerText) ? '\r\n' : '\n';
  const lines = ledgerText.split(/\r?\n/);
  const classOf = (l) => {
    const m = l.match(/^([ \t]*)-[ \t]+class:[ \t]*["']?([^"'#\s]+)/);
    return m ? { indent: m[1], cls: m[2] } : null;
  };
  const startIdx = lines.findIndex((l) => { const c = classOf(l); return c && c.cls === String(e.class); });
  if (startIdx < 0) return { ok: false, refused: `could not locate class ${e.class} in the ledger text` };
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (classOf(lines[i]) || /^\S/.test(lines[i])) { endIdx = i; break; }
  }
  const fieldIndent = classOf(lines[startIdx]).indent + '  ';
  const block = lines.slice(startIdx, endIdx);
  const keyIdx = (key) => block.findIndex((l, i) => i > 0 && new RegExp(`^[ \t]+${key}:`).test(l));
  const setField = (key, value) => {
    const i = keyIdx(key);
    if (value === null) { if (i >= 0) block.splice(i, 1); return; }
    const line = `${fieldIndent}${key}: ${value}`;
    if (i >= 0) block[i] = line; else block.splice(1, 0, line);
  };
  setField('effort', t.effort ? t.effort : null);
  setField('tier', t.model);
  const out = lines.slice(0, startIdx).concat(block, lines.slice(endIdx));
  return { ok: true, content: out.join(eol) };
}

module.exports = {
  LANES, PROVENANCE, MODEL_RANK, EFFORT_RANK, NO_MODEL, LEDGER_REL,
  extractPaths, citedPaths, classifyLane,
  ledgerPath, readLedger, parseTarget, laneEntries, demotionRequirements,
  resolveLane, resolveClass, classEntries, checkLedger, displayModel, setLaneModel,
  PINNED_BASELINES, PINNED_BASELINE_EFFORT, BASELINE_MODELS: Object.keys(MODEL_RANK),
};
