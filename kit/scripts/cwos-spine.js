#!/usr/bin/env node
/**
 * cwos-spine — the market spine: strategy as one traversable graph (ADR-073).
 *
 * market → segments → personas → channels → surfaces → journey → levers/metrics,
 * plus positioning, alternatives and public stances. Personas live in
 * design/personas (ADR-071); levers, metrics and signals in launch/ (ADR-072).
 * The spine is what joins them, so any node can be walked to any other.
 *
 *   validate  every reference resolves; shares and mixes are proportions that
 *             fit; a stance has real options; the journey continues past
 *             checkout; persona inference reads only anonymous aggregate signals.
 *   coverage  enumeration gaps — the places the strategy is silent: a persona no
 *             channel reaches, a segment with no alternative named, a stance
 *             still undecided, a channel mix that is a guess, a metric nobody
 *             has verified. Gaps are warnings; the list is the point.
 *   trace     walk the graph from any id (PER-, SEG-, CHN-, JRN-, LEV-, …).
 *   brief     the founder view: positioning, stances, channels, journey, gaps,
 *             measurement health, experiments.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { cliGate } = require('./lib/cli');
const { parseYAML, findRepoRoot } = require('./lib/cwos-utils');

const CLI = {
  name: 'cwos-spine',
  summary: 'the market spine — validate, find enumeration gaps, trace, brief (ADR-073)',
  usage: 'cwos-spine <validate|coverage|trace|brief|creative-brief> [ID] [options]',
  subcommands: {
    validate: 'every reference resolves and every proportion fits',
    coverage: 'list enumeration gaps: what the strategy has not decided or measured',
    trace: 'walk the graph from one id: cwos-spine trace PER-quiet-fixer',
    brief: 'founder view: positioning, stances, channels, journey, gaps, measurement',
    'creative-brief': 'everything needed to generate creative for one surface: cwos-spine creative-brief SRF-home',
  },
  flags: {
    spine: { type: 'string', placeholder: 'path', describe: 'spine file (default: <repo>/market/spine.yaml)' },
    root: { type: 'string', placeholder: 'path', describe: 'root that refs are relative to (default: repo root)' },
    depth: { type: 'string', placeholder: 'n', describe: 'trace: hops to walk (default 1)' },
    human: { type: 'boolean', describe: 'readable output instead of JSON' },
  },
  notes: 'validate exits 1 on any error. coverage and brief always exit 0.',
};

const CHANNEL_KINDS = ['organic', 'referral', 'community', 'creator', 'partner', 'paid', 'offline'];
// Evidence tags — the canonical-spine vocabulary (melody-hill-app docs/canonical/02).
const TAGS = ['AUTHORIZED', 'MEASURED', 'VERIFIED', 'OBSERVED', 'REPORTED', 'EXTERNAL', 'ASSUMED', 'FOUNDER', 'DECIDED'];
const MIX_BASIS = ['assumed', 'inferred-aggregate', 'measured'];
const STANCE_STATUS = ['proposed', 'adopted', 'retired'];
const EPS = 1e-9;

// ─── Loading ────────────────────────────────────────────────────────────────

function readYaml(file) {
  return fs.existsSync(file) ? (parseYAML(fs.readFileSync(file, 'utf8')) || {}) : null;
}

function personaIds(dir) {
  if (!fs.existsSync(dir)) return new Map();
  const out = new Map();
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md') || f === 'README.md' || f.startsWith('_')) continue;
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    const id = (text.match(/^id:\s*(PER-[a-z0-9-]+)/m) || [])[1];
    const name = (text.match(/^name:\s*"?([^"\n]+)"?/m) || [])[1];
    const words = (label) => ((text.match(new RegExp(`\\*\\*Words that ${label}:\\*\\*\\s*(.+)`, 'i')) || [])[1] || '')
      .replace(/\([^)]*\)/g, '').split(/,/).map((w) => w.trim().replace(/[.'"]+$/g, '').replace(/^['"]+/, '')).filter((w) => w.length > 2);
    const posture = ((text.match(/\*\*Default answer to a personal question:\*\*\s*([a-z]+)/i) || [])[1] || '').toLowerCase();
    const inWords = (text.split(/^## +In (?:their|her|his) words/im)[1] || '').split(/^## /m)[0]
      .split('\n').filter((l) => /^\s*-\s*"/.test(l)).map((l) => l.replace(/^\s*-\s*/, '').trim());
    if (id) out.set(id, { id, name: name || id, land: words('land'), repel: words('repel'), posture, phrases: inWords });
  }
  return out;
}

function experimentsOf(launchDir) {
  const d = path.join(launchDir, 'experiments');
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter((f) => /^EXP-.*\.md$/.test(f)).sort().map((f) => {
    const m = fs.readFileSync(path.join(d, f), 'utf8').replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/);
    return m ? (parseYAML(m[1]) || {}) : {};
  });
}

/** The kit's YAML parser drops `- {a: b}` list items without a word. Refuse them. */
function flowItems(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n')
    .map((l, i) => (/^\s*-\s*\{/.test(l) ? i + 1 : 0)).filter(Boolean);
}

const CS_HOW = ['eliminated', 'controlled', 'accepted', 'not-applicable'];

function load(spineFile, rootOverride) {
  const spine = readYaml(spineFile);
  if (!spine) throw new Error(`spine not found: ${spineFile}`);
  const flow = flowItems(spineFile);
  if (flow.length) throw new Error(`${spineFile}: inline "- { … }" list items on line(s) ${flow.join(', ')} — the kit YAML parser drops them silently; write them in block style`);
  const root = rootOverride ? path.resolve(rootOverride) : (findRepoRoot(path.dirname(spineFile)) || process.cwd());
  const refs = spine.refs || {};
  const launchDir = path.join(root, refs.launch || 'launch');
  const launch = readYaml(path.join(launchDir, 'levers.yaml')) || {};
  const signals = readYaml(path.join(launchDir, 'signals.yaml')) || {};
  const exprFile = path.join(root, refs.expression || 'market/expression.yaml');
  let expression = null;
  if (fs.existsSync(exprFile)) {
    const ef = flowItems(exprFile);
    if (ef.length) throw new Error(`${exprFile}: inline "- { … }" list items on line(s) ${ef.join(', ')} — write them in block style`);
    expression = readYaml(exprFile);
  }
  const fclFile = path.join(root, refs.failure_classes || 'market/failure-classes.yaml');
  const failureClasses = fs.existsSync(fclFile) ? list((readYaml(fclFile) || {}).classes) : null;
  const creativeFile = path.join(root, refs.creative || 'market/creative.yaml');
  let creative = null;
  if (fs.existsSync(creativeFile)) {
    const cf = flowItems(creativeFile);
    if (cf.length) throw new Error(`${creativeFile}: inline "- { … }" list items on line(s) ${cf.join(', ')} — write them in block style`);
    creative = readYaml(creativeFile);
  }
  return {
    spine,
    expression,
    creative,
    failureClasses,
    personas: personaIds(path.join(root, refs.personas || 'design/personas')),
    levers: new Map((launch.levers || []).map((x) => [x.id, x])),
    metrics: new Map((launch.metrics || []).map((x) => [x.id, x])),
    signals: new Map((signals.signals || []).map((x) => [x.id, x])),
    experiments: experimentsOf(launchDir),
  };
}

const list = (v) => (Array.isArray(v) ? v : []);
const sum = (o) => Object.values(o || {}).reduce((a, b) => a + Number(b || 0), 0);

// ─── Graph ──────────────────────────────────────────────────────────────────

/** Every edge in the strategy, as [from, label, to, weight?]. */
function edges(ctx) {
  const s = ctx.spine;
  const E = [];
  const add = (a, label, b, w) => { if (a && b) E.push([a, label, b, w]); };
  for (const seg of list(s.segments)) for (const p of list(seg.personas)) add(seg.id, 'described by', p);
  for (const alt of list(s.alternatives)) for (const seg of list(alt.segments)) add(alt.id, 'used today by', seg);
  const pos = s.positioning || {};
  for (const seg of list(pos.for)) add(pos.id, 'targets', seg);
  for (const alt of list(pos.unlike)) add(pos.id, 'positioned against', alt);
  for (const c of list(s.channels)) {
    for (const [p, w] of Object.entries(c.persona_mix || {})) add(c.id, 'reaches', p, Number(w));
    add(c.id, 'lands on', c.surface);
    add(c.id, 'controlled by', c.lever);
  }
  for (const sf of list(s.surfaces)) for (const p of list(sf.for_personas)) add(sf.id, 'tuned for', p);
  for (const j of list(s.journey)) {
    for (const sf of list(j.surfaces)) add(j.id, 'happens on', sf);
    add(j.id, 'measured by', j.metric);
  }
  list(s.persona_inference).forEach((pi, i) => {
    const id = `INF-${i + 1}`;
    for (const [p, w] of Object.entries(pi.suggests || {})) add(id, 'suggests', p, Number(w));
    add(id, 'read from', pi.signal);
  });
  for (const st of list(s.stances)) {
    add(st.id, 'decided by', st.decided_by);
    for (const ans of Object.values(st.common_sense || {})) if (ans && ans.attested_by) add(st.id, 'rests on', ans.attested_by);
  }
  for (const a of list(s.attestations)) for (const x of list(a.applies_to)) add(a.id, 'affirms', x);
  if (ctx.expression) {
    for (const d of list(ctx.expression.dimensions)) for (const bd of list(d.bounds)) add(d.id, `bounded ${bd.max != null ? '≤' + bd.max : '≥' + bd.min} by`, bd.set_by);
    for (const h of list(ctx.expression.hypotheses)) {
      add(h.id, 'about', h.dimension);
      add(h.id, 'judged by', h.metric);
      add(h.id, 'tested by', h.experiment);
      for (const p of list(h.personas)) add(h.id, 'concerns', p);
    }
    for (const st of list(ctx.expression.settings)) {
      for (const [dim, v] of Object.entries(st.values || {})) add(st.surface, `sets ${v} on`, dim);
      for (const hyp of Object.values(st.because || {})) add(st.surface, 'because', hyp);
    }
  }
  for (const m of ctx.metrics.values()) add(m.id, 'computed from', m.signal);
  for (const l of ctx.levers.values()) {
    add(l.id, 'judged by', l.primary_metric);
  }
  return E;
}

function labelOf(ctx, id) {
  const s = ctx.spine;
  const find = (arr) => list(arr).find((x) => x.id === id);
  if (ctx.personas.has(id)) return ctx.personas.get(id).name;
  const n = find(s.segments) || find(s.alternatives) || find(s.channels) || find(s.surfaces) || find(s.stances);
  if (n) return n.name || n.question || id;
  const j = find(s.journey);
  if (j) return `${j.order}. ${j.stage}`;
  if (ctx.levers.has(id)) return ctx.levers.get(id).description;
  if (ctx.metrics.has(id)) return ctx.metrics.get(id).definition;
  if (ctx.signals.has(id)) return ctx.signals.get(id).want_to_know;
  if (s.positioning && s.positioning.id === id) return 'positioning';
  if (ctx.expression) {
    const d = list(ctx.expression.dimensions).find((x) => x.id === id);
    if (d) return d.name;
    const h = list(ctx.expression.hypotheses).find((x) => x.id === id);
    if (h) return h.statement;
  }
  const inf = /^INF-(\d+)$/.exec(id);
  if (inf) return (list(s.persona_inference)[Number(inf[1]) - 1] || {}).behavior || id;
  return id;
}

function trace(ctx, start, depth = 1) {
  const E = edges(ctx);
  const seen = new Set([start]);
  let frontier = [start];
  const hops = [];
  for (let d = 0; d < depth; d++) {
    const next = [];
    for (const node of frontier) {
      for (const [a, label, b, w] of E) {
        let other = null, dir = null;
        if (a === node) { other = b; dir = 'out'; }
        else if (b === node) { other = a; dir = 'in'; }
        if (!other) continue;
        hops.push({ from: node, dir, label, to: other, weight: w, name: labelOf(ctx, other), depth: d + 1 });
        if (!seen.has(other)) { seen.add(other); next.push(other); }
      }
    }
    frontier = next;
  }
  return { start, name: labelOf(ctx, start), hops };
}

// ─── validate ───────────────────────────────────────────────────────────────

function validate(ctx) {
  const s = ctx.spine;
  const issues = [];
  const add = (level, where, msg) => issues.push({ level, where, msg });
  const ids = new Map();
  const claim = (id, prefix, where) => {
    if (!new RegExp(`^${prefix}-[a-z0-9-]+$`).test(id || '')) { add('error', where, `id must match ${prefix}-<slug> (got ${id})`); return; }
    if (ids.has(id)) add('error', id, 'duplicate id');
    ids.set(id, prefix);
  };
  const needPersona = (p, where) => { if (!ctx.personas.has(p)) add('error', where, `persona ${p} does not exist`); };

  const m = s.market || {};
  claim(m.id, 'MKT', 'market');
  for (const k of ['category', 'problem', 'boundary']) if (!m[k]) add('error', 'market', `${k} is empty`);
  if (!list(m.size).length) add('warn', 'market', 'no size estimate — even a rough one with its basis beats none');
  for (const z of list(m.size)) {
    if (!z.source || !z.basis) add('error', 'market', 'every size estimate needs a basis and a source (or "assumed")');
    if (!TAGS.includes(z.tag)) add('error', 'market', `size estimate needs an evidence tag (${TAGS.join('|')})`);
  }

  for (const seg of list(s.segments)) claim(seg.id, 'SEG', 'segments');
  for (const a of list(s.alternatives)) claim(a.id, 'ALT', 'alternatives');
  for (const c of list(s.channels)) claim(c.id, 'CHN', 'channels');
  for (const sf of list(s.surfaces)) claim(sf.id, 'SRF', 'surfaces');
  for (const j of list(s.journey)) claim(j.id, 'JRN', 'journey');
  for (const st of list(s.stances)) claim(st.id, 'STN', 'stances');
  if (s.positioning) claim(s.positioning.id, 'POS', 'positioning');
  const has = (id, prefix) => ids.get(id) === prefix;

  let shares = 0;
  for (const seg of list(s.segments)) {
    if (!list(seg.personas).length) add('error', seg.id, 'no persona describes this segment');
    list(seg.personas).forEach((p) => needPersona(p, seg.id));
    const sh = Number(seg.share);
    if (!(sh >= 0 && sh <= 1)) add('error', seg.id, 'share must be between 0 and 1');
    shares += sh || 0;
    if (!TAGS.includes(seg.tag)) add('error', seg.id, `tag must be one of ${TAGS.join('|')}`);
  }
  if (shares > 1 + EPS) add('error', 'segments', `segment shares sum to ${shares.toFixed(2)} — more than the whole market`);

  for (const a of list(s.alternatives)) {
    list(a.segments).forEach((x) => { if (!has(x, 'SEG')) add('error', a.id, `segment ${x} does not exist`); });
    if (!a.why_it_fails) add('error', a.id, 'why_it_fails is empty — then why would anyone switch?');
  }

  const pos = s.positioning;
  if (!pos) add('error', 'positioning', 'no positioning statement');
  else {
    for (const k of ['who', 'brand_is', 'that', 'because']) if (!pos[k]) add('error', pos.id, `${k} is empty`);
    if (!list(pos.for).length) add('error', pos.id, 'names no target segment');
    list(pos.for).forEach((x) => { if (!has(x, 'SEG')) add('error', pos.id, `segment ${x} does not exist`); });
    list(pos.unlike).forEach((x) => { if (!has(x, 'ALT')) add('error', pos.id, `alternative ${x} does not exist`); });
    if (list(pos.pillars).length < 2) add('error', pos.id, 'needs at least two pillars');
    if (!list(pos.never).length) add('error', pos.id, 'needs at least one "never" — a brand with no refusals has no position');
  }

  for (const st of list(s.stances)) {
    const opts = list(st.options).map(String);
    if (opts.length < 2) add('error', st.id, 'a stance needs at least two options — one option was never a decision');
    if (!STANCE_STATUS.includes(st.status)) add('error', st.id, `status must be one of ${STANCE_STATUS.join('|')}`);
    if (st.chosen != null && !opts.includes(String(st.chosen))) add('error', st.id, 'chosen is not one of its options');
    if (st.status === 'adopted' && st.chosen == null) add('error', st.id, 'adopted with nothing chosen');
    if (st.status === 'adopted' && !st.decided_by) add('error', st.id, 'adopted stances cite the decision record (decided_by: DEC-/ADR-)');
    if (!st.rationale) add('error', st.id, 'rationale is empty');
    if (!list(st.risks).length) add('warn', st.id, 'no risks named — every public stance costs someone');
    if (Number.isNaN(Date.parse(st.review))) add('error', st.id, 'review date missing — stances are revisited on purpose');
  }

  for (const c of list(s.channels)) {
    if (!CHANNEL_KINDS.includes(c.kind)) add('error', c.id, `kind must be one of ${CHANNEL_KINDS.join('|')}`);
    for (const [p, w] of Object.entries(c.persona_mix || {})) {
      needPersona(p, c.id);
      if (!(Number(w) >= 0 && Number(w) <= 1)) add('error', c.id, `mix for ${p} must be between 0 and 1`);
    }
    const t = sum(c.persona_mix);
    if (t > 1 + EPS) add('error', c.id, `persona mix sums to ${t.toFixed(2)} — the remainder is unattributed, so it must be ≤ 1`);
    if (!MIX_BASIS.includes(c.mix_basis)) add('error', c.id, `mix_basis must be one of ${MIX_BASIS.join('|')}`);
    if (!TAGS.includes(c.tag)) add('error', c.id, `tag must be one of ${TAGS.join('|')}`);
    if (c.mix_basis === 'measured' && c.tag !== 'MEASURED') add('error', c.id, 'mix_basis measured requires tag MEASURED');
    if (!c.surface) add('error', c.id, 'no surface — where does someone from this channel land?');
    else if (!has(c.surface, 'SRF')) add('error', c.id, `surface ${c.surface} does not exist`);
    if (c.lever && !ctx.levers.has(c.lever)) add('error', c.id, `lever ${c.lever} does not exist in launch/levers.yaml`);
  }

  for (const sf of list(s.surfaces)) {
    list(sf.for_personas).forEach((p) => needPersona(p, sf.id));
    for (const d of list(sf.depends_on)) if (ids.get(d) !== 'STN') add('error', sf.id, `depends_on ${d}, which is not a stance`);
    if (!sf.never_differs) add('error', sf.id, 'never_differs is empty — say what a tuned surface may not change (safety, price, privacy)');
  }

  const orders = list(s.journey).map((j) => Number(j.order));
  orders.forEach((o, i) => { if (o !== i + 1) add('error', 'journey', `stages must be ordered 1..n without gaps (position ${i + 1} has order ${o})`); });
  for (const j of list(s.journey)) {
    if (!j.her_goal || !j.our_goal) add('error', j.id, 'every stage names her goal and ours');
    if (!j.metric) add('error', j.id, 'no metric — how would we know this stage works?');
    else if (!ctx.metrics.has(j.metric)) add('error', j.id, `metric ${j.metric} does not exist in launch/levers.yaml`);
    list(j.surfaces).forEach((x) => { if (!has(x, 'SRF')) add('error', j.id, `surface ${x} does not exist`); });
  }
  if (list(s.journey).length && !list(s.journey).some((j) => j.after_checkout === true)) {
    add('error', 'journey', 'the journey ends at checkout — name what happens after she buys');
  }

  for (const [i, pi] of list(s.persona_inference).entries()) {
    const where = `persona_inference[${i + 1}]`;
    for (const p of Object.keys(pi.suggests || {})) needPersona(p, where);
    if (sum(pi.suggests) > 1 + EPS) add('error', where, 'suggestion weights sum above 1');
    if (!TAGS.includes(pi.tag)) add('error', where, `tag must be one of ${TAGS.join('|')}`);
    const sig = ctx.signals.get(pi.signal);
    if (!sig) add('error', where, `signal ${pi.signal} does not exist in launch/signals.yaml`);
    else if (sig.identity !== 'none') add('error', where, `${pi.signal} is ${sig.identity} — persona inference must read anonymous aggregate signals only`);
  }

  if (ctx.expression) validateExpression(ctx, ids, add);
  if (ctx.creative) validateCreative(ctx, ids, add);
  if (ctx.failureClasses) validateCommonSense(ctx, add);
  validateAttestations(ctx, ids, add);

  const errors = issues.filter((x) => x.level === 'error').length;
  return { errors, warnings: issues.length - errors, issues, exit_code: errors ? 1 : 0 };
}

// ─── expression: every brand element a deliberate, recorded setting ─────────
//
// A dimension (DIM-) is one element of how the brand shows up — theme
// intensity, imagery, tone, vocabulary, palette … — with ordered levels.
// Every surface sets every dimension explicitly. A setting that departs from
// the default names the hypothesis (HYP-) it tests; bounds from stances or
// persona trust breakers cap what any surface may do.

const HYP_STATUS = ['untested', 'testing', 'supported', 'refuted'];
const BOUND_SOURCE = /^(STN|DEC|ADR|PER)-[A-Za-z0-9-]+$/;

function levelsOf(d) { return list(d.levels).map((l) => Number(l.level)); }

function boundsFor(d, surfaceId) {
  return list(d.bounds).filter((b) => !list(b.surfaces).length || list(b.surfaces).includes(surfaceId));
}

function validateExpression(ctx, ids, add) {
  const E = ctx.expression;
  const s = ctx.spine;
  const DIM = new Map();
  for (const d of list(E.dimensions)) {
    if (!/^DIM-[a-z0-9-]+$/.test(d.id || '')) { add('error', 'expression', `dimension id must match DIM-<slug> (got ${d.id})`); continue; }
    DIM.set(d.id, d);
    const lv = levelsOf(d);
    if (lv.length < 2) add('error', d.id, 'a dimension needs at least two levels');
    lv.forEach((n, i) => { if (n !== i + 1) add('error', d.id, 'levels must be numbered 1..n in order'); });
    for (const l of list(d.levels)) if (!l.name || !l.looks_like) add('error', d.id, `level ${l.level} needs a name and looks_like`);
    if (!lv.includes(Number(d.default))) add('error', d.id, 'default must be one of its levels');
    for (const b of list(d.bounds)) {
      if (!BOUND_SOURCE.test(b.set_by || '')) add('error', d.id, 'every bound cites what set it (STN-, DEC-, ADR- or PER-)');
      else if (b.set_by.startsWith('STN-')) {
        const st = list(s.stances).find((x) => x.id === b.set_by);
        if (!st) add('error', d.id, `bound set by ${b.set_by}, which does not exist`);
        else if (st.status !== 'adopted') add('warn', d.id, `bound rests on ${b.set_by}, which is still ${st.status}`);
      } else if (b.set_by.startsWith('PER-') && !ctx.personas.has(b.set_by)) add('error', d.id, `bound set by ${b.set_by}, which does not exist`);
      for (const sf of list(b.surfaces)) if (ids.get(sf) !== 'SRF') add('error', d.id, `bound names surface ${sf}, which does not exist`);
      if (b.max != null && !lv.includes(Number(b.max))) add('error', d.id, 'bound max must be one of its levels');
      if (b.min != null && !lv.includes(Number(b.min))) add('error', d.id, 'bound min must be one of its levels');
    }
  }

  const expIds = new Map(ctx.experiments.map((e) => [e.id, e]));
  const HYP = new Map();
  for (const h of list(E.hypotheses)) {
    if (!/^HYP-[a-z0-9-]+$/.test(h.id || '')) { add('error', 'expression', `hypothesis id must match HYP-<slug> (got ${h.id})`); continue; }
    HYP.set(h.id, h);
    if (!h.statement) add('error', h.id, 'statement is empty');
    if (!DIM.has(h.dimension)) add('error', h.id, `dimension ${h.dimension} does not exist`);
    if (!ctx.metrics.has(h.metric)) add('error', h.id, `metric ${h.metric} does not exist`);
    for (const p of list(h.personas)) if (!ctx.personas.has(p)) add('error', h.id, `persona ${p} does not exist`);
    if (!list(h.personas).length) add('error', h.id, 'names no persona — whose behavior is it about?');
    if (!HYP_STATUS.includes(h.status)) add('error', h.id, `status must be one of ${HYP_STATUS.join('|')}`);
    if (!TAGS.includes(h.tag)) add('error', h.id, `tag must be one of ${TAGS.join('|')}`);
    const ex = h.experiment ? expIds.get(h.experiment) : null;
    if (h.experiment && !ex) add('error', h.id, `experiment ${h.experiment} does not exist`);
    if (h.status === 'testing' && (!ex || ex.status !== 'running')) add('error', h.id, 'testing needs a running experiment');
    if (['supported', 'refuted'].includes(h.status) && (!ex || ex.status !== 'decided')) add('error', h.id, `${h.status} needs a decided experiment behind it`);
  }

  const settings = new Map(list(E.settings).map((x) => [x.surface, x]));
  for (const sf of list(s.surfaces)) {
    const st = settings.get(sf.id);
    if (!st) { add('error', sf.id, 'no expression settings — every surface sets every dimension deliberately'); continue; }
    for (const d of DIM.values()) {
      const v = (st.values || {})[d.id];
      if (v == null) { add('error', sf.id, `${d.id} is unset — every element gets a deliberate setting`); continue; }
      if (!levelsOf(d).includes(Number(v))) { add('error', sf.id, `${d.id} = ${v} is not one of its levels`); continue; }
      for (const b of boundsFor(d, sf.id)) {
        if (b.max != null && Number(v) > Number(b.max)) add('error', sf.id, `${d.id} = ${v} exceeds the bound ${b.max} set by ${b.set_by}`);
        if (b.min != null && Number(v) < Number(b.min)) add('error', sf.id, `${d.id} = ${v} is below the bound ${b.min} set by ${b.set_by}`);
      }
      const why = (st.because || {})[d.id];
      if (Number(v) !== Number(d.default)) {
        if (!why) add('error', sf.id, `${d.id} departs from the default (${d.default} → ${v}) without a hypothesis`);
        else if (!HYP.has(why)) add('error', sf.id, `${d.id} cites ${why}, which does not exist`);
        else if (HYP.get(why).dimension !== d.id) add('error', sf.id, `${why} is about ${HYP.get(why).dimension}, not ${d.id}`);
        else if (HYP.get(why).status === 'refuted') add('error', sf.id, `${d.id} rests on ${why}, which was refuted`);
        else if (!list(HYP.get(why).personas).some((p) => list(sf.for_personas).includes(p))) {
          add('error', sf.id, `${d.id} cites ${why}, which is about ${list(HYP.get(why).personas).join(', ')} — none of this surface's personas`);
        }
      }
    }
  }
  for (const sid of settings.keys()) if (ids.get(sid) !== 'SRF') add('error', 'expression', `settings for ${sid}, which is not a surface in the spine`);
}

// ─── common sense: every stance answers every failure class (ADR-077) ────────
//
// Before a stance is adopted, each class in the catalog is answered:
// eliminated (the design removes it), controlled (a named control catches it),
// accepted (with a reason), or not-applicable (with a reason). Proposed stances
// may be partial; coverage lists what is unanswered and what is only controlled.

function validateCommonSense(ctx, add) {
  const FCL = new Set(ctx.failureClasses.map((c) => c.id));
  for (const st of list(ctx.spine.stances)) {
    const cs = st.common_sense || {};
    for (const [cls, ans] of Object.entries(cs)) {
      if (!FCL.has(cls)) { add('error', st.id, `common_sense names ${cls}, which is not in the failure-class catalog`); continue; }
      if (!ans || !CS_HOW.includes(ans.how)) { add('error', st.id, `${cls}: how must be one of ${CS_HOW.join('|')}`); continue; }
      if (!ans.by) add('error', st.id, `${cls}: "${ans.how}" needs a by — the design change, control, or reason`);
    }
    if (st.status === 'adopted') {
      const missing = [...FCL].filter((c) => !cs[c]);
      if (missing.length) add('error', st.id, `adopted without a common-sense answer for ${missing.length} failure class(es): ${missing.join(', ')}`);
    }
  }
}

// ─── attestations: statements a person affirms (ADR-077) ────────────────────
//
// Some checks can't be done by a validator or an AI: walking the room, reading
// the lease, watching an intake. An attestation is a plain statement a named
// role affirms on a cadence ("There is no street-level window into the shooting
// room"). A common-sense answer can rest on one (attested_by: ATT-…), and an
// adopted decision resting on an overdue or never-made attestation fails.

const ATT_ROLES_MIN = 2;

function attestationStatus(a, today) {
  if (!a.last_attested) return 'never';
  const due = Date.parse(a.last_attested) + Number(a.every_days || 0) * 86400000;
  return Number.isNaN(due) ? 'never' : (due < today ? 'overdue' : 'current');
}

function validateAttestations(ctx, ids, add, today = new Date()) {
  const s = ctx.spine;
  const A = new Map();
  for (const a of list(s.attestations)) {
    if (!/^ATT-[a-z0-9-]+$/.test(a.id || '')) { add('error', 'attestations', `id must match ATT-<slug> (got ${a.id})`); continue; }
    A.set(a.id, a);
    if (!a.statement) add('error', a.id, 'statement is empty — what exactly is the person affirming?');
    if (!a.role || String(a.role).length < ATT_ROLES_MIN) add('error', a.id, 'role is empty — who affirms it?');
    if (!(Number(a.every_days) > 0)) add('error', a.id, 'every_days must be a positive number — how often is it re-affirmed?');
    if (a.last_attested && Number.isNaN(Date.parse(a.last_attested))) add('error', a.id, 'last_attested is not a date');
    if (a.last_attested && !a.attested_by) add('error', a.id, 'last_attested needs attested_by — the person (or role holder) who affirmed it');
    for (const target of list(a.applies_to)) if (!ids.has(target) && !(ctx.levers && ctx.levers.has(target))) add('error', a.id, `applies_to ${target}, which does not exist`);
  }
  for (const st of list(s.stances)) {
    for (const [cls, ans] of Object.entries(st.common_sense || {})) {
      if (!ans || !ans.attested_by) continue;
      const a = A.get(ans.attested_by);
      if (!a) { add('error', st.id, `${cls} rests on ${ans.attested_by}, which does not exist`); continue; }
      const state = attestationStatus(a, today);
      if (st.status === 'adopted' && state !== 'current') add('error', st.id, `${cls} rests on ${a.id}, which is ${state} — a person must affirm: "${a.statement}"`);
    }
  }
  return A;
}

// ─── creative: every generated element, checked and traceable (ADR-076) ─────

const ELEMENTS = { headline: 'copy', subhead: 'copy', body: 'copy', cta: 'copy', tagline: 'copy', 'social-post': 'copy', 'alt-text': 'copy', 'image-brief': 'imagery' };
const CRV_STATUS = ['draft', 'reviewed', 'approved', 'live', 'retired'];
const IMG_SOURCE = ['photographer', 'stock', 'illustration', 'ai-generated'];
const RANK = { draft: 0, reviewed: 1, approved: 2, live: 3, retired: 4 };

function surfaceSetting(ctx, sid) {
  return list((ctx.expression || {}).settings).find((x) => x.surface === sid) || null;
}

function validateCreative(ctx, ids, add) {
  const s = ctx.spine;
  const DIM = new Map(list((ctx.expression || {}).dimensions).map((d) => [d.id, d]));
  const HYP = new Map(list((ctx.expression || {}).hypotheses).map((h) => [h.id, h]));
  const seen = new Set();
  for (const c of list(ctx.creative.creative)) {
    if (!/^CRV-[a-z0-9-]+$/.test(c.id || '')) { add('error', 'creative', `id must match CRV-<slug> (got ${c.id})`); continue; }
    if (seen.has(c.id)) add('error', c.id, 'duplicate id');
    seen.add(c.id);
    const sf = list(s.surfaces).find((x) => x.id === c.surface);
    if (!sf) { add('error', c.id, `surface ${c.surface} does not exist`); continue; }
    const channel = ELEMENTS[c.element];
    if (!channel) { add('error', c.id, `element must be one of ${Object.keys(ELEMENTS).join('|')}`); continue; }
    if (!c.text) add('error', c.id, 'text is empty');
    if (!CRV_STATUS.includes(c.status)) add('error', c.id, `status must be one of ${CRV_STATUS.join('|')}`);
    if (!['ai', 'human'].includes(c.generated_by)) add('error', c.id, 'generated_by must be ai or human');

    // Expression: the element must carry its surface's settings, except on the one
    // dimension a cited hypothesis is testing.
    const setting = surfaceSetting(ctx, c.surface);
    const emb = c.embodies || {};
    const testing = c.tests ? HYP.get(c.tests) : null;
    if (c.tests && !testing) add('error', c.id, `tests ${c.tests}, which does not exist`);
    // Common sense (ADR-077): a hypothesis about someone else's page can't justify this one.
    if (testing && !list(testing.personas).some((p) => list(sf.for_personas).includes(p))) {
      add('error', c.id, `tests ${c.tests}, which is about ${list(testing.personas).join(', ')} — not a persona this surface is for`);
    }
    for (const d of DIM.values()) {
      if (!list(d.applies_to).includes(channel)) continue;
      const v = emb[d.id];
      if (v == null) { add('error', c.id, `${d.id} not declared — a ${c.element} must say which level it carries`); continue; }
      const want = setting && setting.values ? setting.values[d.id] : d.default;
      if (Number(v) !== Number(want) && !(testing && testing.dimension === d.id)) {
        add('error', c.id, `${d.id} = ${v}, but ${c.surface} is set to ${want} — cite the hypothesis it tests (tests: HYP-…) or match the surface`);
      }
      for (const b of boundsFor(d, c.surface)) {
        if (b.max != null && Number(v) > Number(b.max)) add('error', c.id, `${d.id} = ${v} exceeds the bound ${b.max} set by ${b.set_by}`);
        if (b.min != null && Number(v) < Number(b.min)) add('error', c.id, `${d.id} = ${v} is below the bound ${b.min} set by ${b.set_by}`);
      }
    }

    // Brand guard: words the surface's own personas say repel them.
    const text = String(c.text || '').toLowerCase();
    for (const pid of list(sf.for_personas)) {
      const p = ctx.personas.get(pid);
      for (const w of (p && p.repel) || []) {
        if (w && new RegExp(`\\b${w.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text)) {
          add(RANK[c.status] >= RANK.approved ? 'error' : 'warn', c.id, `uses "${w}", which repels ${p.name} (${pid})`);
        }
      }
    }

    // Gates (ADR-074): AI output is reviewed by a person; health claims by a clinician;
    // people in images need a release; no generated bodies.
    const r = c.reviews || {};
    if (RANK[c.status] >= RANK.reviewed && !r.brand) add('error', c.id, `${c.status} needs reviews.brand (date) — a person read it`);
    if (RANK[c.status] >= RANK.approved && !c.approved_by) add('error', c.id, `${c.status} needs approved_by (the human role that approved it)`);
    if (c.health_claim === true && RANK[c.status] >= RANK.approved && !r.clinician) add('error', c.id, 'makes a health claim — needs reviews.clinician before approval (CMP-clinician-review)');
    if (c.health_claim == null && channel === 'copy') add('error', c.id, 'health_claim must be true or false');
    if (c.element === 'image-brief') {
      if (!IMG_SOURCE.includes(c.source)) add('error', c.id, `source must be one of ${IMG_SOURCE.join('|')}`);
      if (typeof c.people !== 'boolean') add('error', c.id, 'people must be true or false');
      if (c.people === true && c.source === 'ai-generated') add('error', c.id, 'AI-generated people are never used (CMP-no-generated-bodies)');
      if (c.people === true && RANK[c.status] >= RANK.approved && r.release !== true) add('error', c.id, 'people pictured — needs reviews.release: true (signed release on file)');
    }
    if (c.status === 'live' && c.experiment && !ctx.experiments.some((e) => e.id === c.experiment)) add('error', c.id, `experiment ${c.experiment} does not exist`);
    // FCL-undecided-promise, eliminated: a surface that depends on an undecided
    // stance cannot have approved creative until the stance is adopted.
    if (RANK[c.status] >= RANK.approved && RANK[c.status] < RANK.retired) {
      const open = list(sf.depends_on).filter((id) => { const st = list(s.stances).find((x) => x.id === id); return !st || st.status !== 'adopted'; });
      if (open.length) add('error', c.id, `${c.surface} depends on ${open.join(', ')}, not yet adopted — creative can't be approved on an undecided promise`);
    }
  }
}

/** Everything a writer (human or AI) needs to generate creative for one surface. */
function creativeBrief(ctx, sid) {
  const s = ctx.spine;
  const sf = list(s.surfaces).find((x) => x.id === sid);
  if (!sf) throw new Error(`surface ${sid} does not exist`);
  const E = ctx.expression || {};
  const setting = surfaceSetting(ctx, sid) || { values: {}, because: {} };
  const dims = list(E.dimensions).map((d) => {
    const v = setting.values[d.id] != null ? setting.values[d.id] : d.default;
    const lv = list(d.levels).find((l) => Number(l.level) === Number(v)) || {};
    const hyp = setting.because && setting.because[d.id] ? list(E.hypotheses).find((h) => h.id === setting.because[d.id]) : null;
    return {
      id: d.id, applies_to: d.applies_to, level: v, name: lv.name, looks_like: lv.looks_like,
      bounds: boundsFor(d, sid).map((b) => `${b.max != null ? '≤ ' + b.max : '≥ ' + b.min} (${b.set_by})`),
      because: hyp ? { id: hyp.id, statement: hyp.statement } : null,
    };
  });
  const personas = list(sf.for_personas).map((p) => ctx.personas.get(p)).filter(Boolean)
    .map((p) => ({ id: p.id, name: p.name, posture: p.posture, land: p.land, repel: p.repel, phrases: p.phrases }));
  const pos = s.positioning || {};
  return {
    surface: sid, name: sf.name, differs_by: sf.differs_by, never_differs: sf.never_differs,
    personas, dimensions: dims,
    positioning: { that: pos.that, pillars: list(pos.pillars), never: list(pos.never) },
    stances: list(s.stances).filter((x) => x.status === 'adopted').map((x) => ({ id: x.id, chosen: x.chosen })),
    open_stances: list(s.stances).filter((x) => x.status === 'proposed').map((x) => x.id),
    do_not_assume: list(sf.depends_on).map((id) => list(s.stances).find((x) => x.id === id)).filter((x) => x && x.status !== 'adopted').map((x) => `${x.id}: "${x.question}" is undecided — do not state or imply any option as fact`),
    existing: list((ctx.creative || {}).creative).filter((c) => c.surface === sid).map((c) => ({ id: c.id, element: c.element, status: c.status, text: c.text })),
    gates: ['A person reviews every AI draft (reviews.brand)', 'Any health claim needs a clinician (reviews.clinician)', 'Images with people: photographer or stock with a signed release; never AI-generated people'],
  };
}

// ─── coverage ───────────────────────────────────────────────────────────────

function coverage(ctx) {
  const s = ctx.spine;
  const gaps = [];
  const gap = (kind, id, msg) => gaps.push({ kind, id, msg });
  const inSegment = new Set(list(s.segments).flatMap((x) => list(x.personas)));
  const reached = new Map();
  for (const c of list(s.channels)) for (const [p, w] of Object.entries(c.persona_mix || {})) {
    if (Number(w) > 0) reached.set(p, (reached.get(p) || 0) + 1);
  }
  const tuned = new Set(list(s.surfaces).flatMap((x) => list(x.for_personas)));
  const inferable = new Set(list(s.persona_inference).flatMap((x) => Object.keys(x.suggests || {})));
  const segWithAlt = new Set(list(s.alternatives).flatMap((a) => list(a.segments)));
  const targeted = new Set(list((s.positioning || {}).for));

  for (const p of ctx.personas.keys()) {
    if (!inSegment.has(p)) gap('persona', p, 'belongs to no segment');
    if (!reached.has(p)) gap('persona', p, 'no channel reaches this persona');
    if (!tuned.has(p)) gap('persona', p, 'no surface is tuned for this persona');
    if (!inferable.has(p)) gap('persona', p, 'no behavior suggests this persona — its channel mix can never be measured');
  }
  for (const seg of list(s.segments)) {
    if (!segWithAlt.has(seg.id)) gap('segment', seg.id, 'no alternative named — what does this segment do today?');
    if (!targeted.has(seg.id)) gap('segment', seg.id, 'not targeted by the positioning (deliberate? say so in positioning.never)');
  }
  for (const c of list(s.channels)) if (c.mix_basis === 'assumed') gap('channel', c.id, 'persona mix is a guess — measure it via persona_inference');
  for (const st of list(s.stances)) if (st.status === 'proposed') gap('stance', st.id, `undecided: ${st.question}`);
  for (const j of list(s.journey)) if (!list(j.surfaces).length) gap('journey', j.id, `stage "${j.stage}" has no surface`);
  const jm = new Set(list(s.journey).map((j) => j.metric));
  for (const id of jm) {
    const m = ctx.metrics.get(id);
    const st = m && m.verified ? m.verified.status : 'unverified';
    if (st === 'unverified') gap('measurement', id, 'journey metric never verified — is it measuring what it claims?');
  }
  for (const a of list(s.attestations)) {
    const state = attestationStatus(a, new Date());
    if (state !== 'current') gap('attestation', a.id, `${state}: ${a.role} to affirm "${a.statement}"`);
  }
  if (ctx.failureClasses) {
    const all = ctx.failureClasses.map((c) => c.id);
    for (const st of list(s.stances)) {
      const cs = st.common_sense || {};
      const open = all.filter((c) => !cs[c]);
      if (open.length) gap('common-sense', st.id, `${open.length}/${all.length} failure classes unanswered`);
      const residual = Object.entries(cs).filter(([, a]) => a && (a.how === 'controlled' || a.how === 'accepted')).map(([c, a]) => `${c.replace('FCL-', '')}(${a.how})`);
      if (residual.length) gap('residual-risk', st.id, residual.join(', '));
    }
  } else if (list(s.stances).length) {
    gap('common-sense', 'market/failure-classes.yaml', 'no failure-class catalog — decisions get no common-sense pass');
  }
  if (ctx.expression) {
    const H = list(ctx.expression.hypotheses);
    const relied = new Map();
    for (const st of list(ctx.expression.settings)) for (const h of Object.values(st.because || {})) relied.set(h, (relied.get(h) || 0) + 1);
    for (const h of H) if (h.status === 'untested') gap('expression', h.id, `untested; ${relied.get(h.id) || 0} setting(s) rest on it${h.experiment ? ` (planned: ${h.experiment})` : ' — no experiment planned'}`);
  } else if (list(s.surfaces).length) {
    gap('expression', 'market/expression.yaml', 'no expression layer — tone, imagery and phrasing are undeclared on every surface');
  }
  const summary = {};
  for (const g of gaps) summary[g.kind] = (summary[g.kind] || 0) + 1;
  return { total: gaps.length, summary, gaps, evidence: evidenceMix(s) };
}

/** How much of the strategy rests on each kind of evidence. */
function evidenceMix(s) {
  const mix = {};
  const tally = (t) => { if (t) mix[t] = (mix[t] || 0) + 1; };
  list((s.market || {}).size).forEach((z) => tally(z.tag));
  list(s.segments).forEach((x) => tally(x.tag));
  list(s.channels).forEach((x) => tally(x.tag));
  list(s.persona_inference).forEach((x) => tally(x.tag));
  list(s.stances).filter((x) => x.status === 'adopted').forEach(() => tally('DECIDED'));
  return mix;
}

// ─── brief ──────────────────────────────────────────────────────────────────

function brief(ctx) {
  const s = ctx.spine;
  const v = validate(ctx);
  const c = coverage(ctx);
  const pos = s.positioning || {};
  const segName = (id) => (list(s.segments).find((x) => x.id === id) || {}).name || id;
  const altName = (id) => (list(s.alternatives).find((x) => x.id === id) || {}).name || id;
  const verified = { unverified: 0, instrumented: 0, validated: 0 };
  for (const m of ctx.metrics.values()) verified[(m.verified && m.verified.status) || 'unverified']++;
  return {
    valid: v.errors === 0,
    errors: v.errors,
    positioning: pos.id ? `For ${list(pos.for).map(segName).join(', ')} who ${pos.who}, ${pos.brand_is} ${pos.that}. Unlike ${list(pos.unlike).map(altName).join(', ')}, ${pos.because}.` : null,
    stances: list(s.stances).map((x) => ({ id: x.id, question: x.question, status: x.status, chosen: x.chosen })),
    channels: list(s.channels).map((x) => ({ id: x.id, name: x.name, basis: x.mix_basis, top: Object.entries(x.persona_mix || {}).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([p, w]) => `${(ctx.personas.get(p) || { name: p }).name} ${Math.round(w * 100)}%`) })),
    journey: list(s.journey).map((j) => `${j.order}. ${j.stage}${j.after_checkout ? ' ·' : ''}`),
    gaps: c.summary,
    evidence: c.evidence,
    attestations: list(s.attestations).map((a) => ({ id: a.id, role: a.role, statement: a.statement, state: attestationStatus(a, new Date()) })),
    measurement: verified,
    expression: ctx.expression ? {
      dimensions: list(ctx.expression.dimensions).map((d) => d.id),
      surfaces: list(ctx.expression.settings).map((st) => ({ surface: st.surface, values: st.values || {}, because: st.because || {} })),
      hypotheses: list(ctx.expression.hypotheses).reduce((a, h) => { a[h.status] = (a[h.status] || 0) + 1; return a; }, {}),
    } : null,
    experiments: ctx.experiments.reduce((a, e) => { a[e.status || 'draft'] = (a[e.status || 'draft'] || 0) + 1; return a; }, {}),
  };
}

// ─── Output ─────────────────────────────────────────────────────────────────

function humanBrief(r) {
  const L = [`CREATIVE BRIEF — ${r.surface}: ${r.name}`, `Differs by: ${r.differs_by}`, `Never differs: ${r.never_differs}`, '', 'Written for:'];
  for (const p of r.personas) {
    L.push(`  ${p.name} (${p.id}) — default answer: ${p.posture || '?'}`);
    if (p.phrases.length) L.push(`    says: ${p.phrases.join(' ')}`);
    if (p.land.length) L.push(`    words that land: ${p.land.join(', ')}`);
    if (p.repel.length) L.push(`    NEVER use: ${p.repel.join(', ')}`);
  }
  L.push('', 'Expression settings (carry exactly these levels):');
  for (const d of r.dimensions) L.push(`  ${d.id} = ${d.level} ${d.name}: ${d.looks_like}${d.bounds.length ? '  [bounds ' + d.bounds.join('; ') + ']' : ''}${d.because ? '\n      because ' + d.because.id + ': ' + d.because.statement : ''}`);
  L.push('', `Positioning: ${r.positioning.that}`, `Pillars: ${r.positioning.pillars.join(' · ')}`, `Never: ${r.positioning.never.join(' · ')}`);
  L.push(`Adopted stances: ${r.stances.map((x) => x.id).join(', ')}   Open: ${r.open_stances.join(', ')}`);
  if (r.do_not_assume.length) L.push('', 'DO NOT ASSUME (this page depends on undecided stances):', ...r.do_not_assume.map((x) => `  - ${x}`));
  L.push('', 'Gates:', ...r.gates.map((g) => `  - ${g}`));
  if (r.existing.length) { L.push('', 'Existing creative:'); for (const c of r.existing) L.push(`  ${c.id} [${c.element}, ${c.status}] ${c.text}`); }
  return L.join('\n') + '\n';
}

function human(sub, r) {
  const L = [];
  if (sub === 'validate') {
    for (const i of r.issues) L.push(`  ${i.level === 'error' ? 'ERROR' : 'warn '} ${i.where}: ${i.msg}`);
    L.push(r.errors ? `FAIL — ${r.errors} error(s), ${r.warnings} warning(s)` : `OK — ${r.warnings} warning(s)`);
  } else if (sub === 'coverage') {
    L.push(`${r.total} enumeration gap(s): ${Object.entries(r.summary).map(([k, n]) => `${n} ${k}`).join(', ') || 'none'}`);
    L.push(`evidence behind the strategy: ${Object.entries(r.evidence).map(([k, n]) => `${n} ${k}`).join(', ') || 'none'}`);
    for (const g of r.gaps) L.push(`  ${g.kind.padEnd(11)} ${g.id.padEnd(26)} ${g.msg}`);
  } else if (sub === 'trace') {
    L.push(`${r.start} — ${r.name}`);
    for (const h of r.hops) {
      const w = h.weight != null && !Number.isNaN(h.weight) ? ` (${Math.round(h.weight * 100)}%)` : '';
      L.push(`${'  '.repeat(h.depth)}${h.dir === 'out' ? '→' : '←'} ${h.label}${w}: ${h.to} — ${h.name}`);
    }
  } else if (sub === 'brief') {
    L.push(r.valid ? 'Spine: valid' : `Spine: ${r.errors} error(s) — run validate`);
    if (r.positioning) L.push('', 'Positioning', `  ${r.positioning}`);
    L.push('', 'Stances');
    for (const x of r.stances) L.push(`  ${x.status.padEnd(9)} ${x.id.padEnd(22)} ${x.chosen != null ? '→ ' + x.chosen : x.question}`);
    L.push('', 'Channels (persona mix)');
    for (const x of r.channels) L.push(`  ${x.name.padEnd(32)} ${x.top.join(', ')}  [${x.basis}]`);
    L.push('', 'Journey (· = after checkout)', `  ${r.journey.join('  ')}`);
    L.push('', `Gaps: ${Object.entries(r.gaps).map(([k, n]) => `${n} ${k}`).join(', ') || 'none'}   (cwos-spine coverage for the list)`);
    L.push(`Evidence: ${Object.entries(r.evidence).map(([k, n]) => `${n} ${k}`).join(', ')}`);
    if (r.attestations.length) {
      L.push('', 'For a person to affirm (attestations)');
      for (const a of r.attestations) L.push(`  ${a.state.padEnd(8)} ${a.role.padEnd(18)} ${a.statement}`);
    }
    L.push(`Measurement: ${r.measurement.validated} validated, ${r.measurement.instrumented} instrumented, ${r.measurement.unverified} unverified metrics`);
    if (r.expression) {
      const dims = r.expression.dimensions;
      L.push('', 'Expression (level per dimension; * = departs from default, tied to a hypothesis)');
      L.push(`  ${'surface'.padEnd(24)} ${dims.map((d) => d.replace(/^DIM-/, '').slice(0, 9).padEnd(9)).join(' ')}`);
      for (const x of r.expression.surfaces) {
        L.push(`  ${x.surface.padEnd(24)} ${dims.map((d) => (String(x.values[d] ?? '-') + (x.because[d] ? '*' : '')).padEnd(9)).join(' ')}`);
      }
      L.push(`  hypotheses: ${Object.entries(r.expression.hypotheses).map(([k, n]) => `${n} ${k}`).join(', ')}`);
    }
    L.push(`Experiments: ${Object.entries(r.experiments).map(([k, n]) => `${n} ${k}`).join(', ') || 'none'}`);
  }
  return L.join('\n') + '\n';
}

function main() {
  const { values, sub, positionals } = cliGate(process.argv.slice(2), CLI);
  const root = findRepoRoot() || process.cwd();
  const spineFile = path.resolve(values.spine || path.join(root, 'market', 'spine.yaml'));
  if (!['validate', 'coverage', 'trace', 'brief', 'creative-brief'].includes(sub)) {
    process.stderr.write('cwos-spine: choose validate, coverage, trace, brief or creative-brief (see --help)\n');
    process.exit(2);
  }
  let ctx;
  try { ctx = load(spineFile, values.root); } catch (e) { process.stderr.write(`cwos-spine: ${e.message}\n`); process.exit(2); }
  let r;
  if (sub === 'creative-brief') {
    const id = (positionals || []).find((p) => p !== 'creative-brief');
    if (!id) { process.stderr.write('cwos-spine creative-brief: give a surface id, e.g. SRF-home\n'); process.exit(2); }
    try { r = creativeBrief(ctx, id); } catch (e) { process.stderr.write(`cwos-spine: ${e.message}\n`); process.exit(2); }
    process.stdout.write(values.human ? humanBrief(r) : JSON.stringify(r, null, 2) + '\n');
    return;
  }
  if (sub === 'trace') {
    const id = (positionals || []).find((p) => p !== 'trace');
    if (!id) { process.stderr.write('cwos-spine trace: give an id, e.g. PER-quiet-fixer\n'); process.exit(2); }
    r = trace(ctx, id, Math.max(1, Number(values.depth) || 1));
  } else r = { validate, coverage, brief }[sub](ctx);
  process.stdout.write(values.human ? human(sub, r) : JSON.stringify(r, null, 2) + '\n');
  if (sub === 'validate') process.exit(r.exit_code);
}

module.exports = { load, validate, coverage, trace, brief, edges, creativeBrief, attestationStatus, TAGS };

if (require.main === module) main();
