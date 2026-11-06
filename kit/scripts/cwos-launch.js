#!/usr/bin/env node
/**
 * cwos-launch — validate and report on a managed launch (ADR-072).
 *
 * A managed launch declares its levers (what the business may change), its
 * signals (what it learns about customers, and how), and its experiments (one
 * controlled change to one lever each). This script is the deterministic check
 * that the three agree, and the weekly view of what is live.
 *
 *   validate  cross-reference levers, guardrails, metrics, signals and
 *             experiments. The rules that carry the weight:
 *               - a locked lever is never experimented on;
 *               - every experiment has a metric, a guardrail and a stop rule
 *                 written before it runs;
 *               - a price experiment has a fairness guardrail;
 *               - health or intimate signals never go to a third party, and
 *                 identifying them needs explicit consent;
 *               - a signal learned by ASKING says why behavior couldn't answer it;
 *               - no experiment runs on an unverified metric, and a randomized
 *                 result counts only if its sample-ratio check passed.
 *
 *   status    what each lever is set to, which experiments are running and for
 *             how long, and which are overdue for a decision.
 *
 * Zero dependencies beyond lib/.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { cliGate } = require('./lib/cli');
const { parseYAML, findRepoRoot } = require('./lib/cwos-utils');

const CLI = {
  name: 'cwos-launch',
  summary: 'validate and report on a managed launch — levers, signals, experiments (ADR-072)',
  usage: 'cwos-launch <validate|status> [options]',
  subcommands: {
    validate: 'check levers.yaml, signals.yaml and experiments/ against each other',
    status: 'what is live, what is running, what is overdue for a decision',
  },
  flags: {
    dir: { type: 'string', placeholder: 'path', describe: 'launch directory (default: <repo>/launch)' },
    today: { type: 'string', placeholder: 'YYYY-MM-DD', describe: 'status: evaluate as of this date (default: now)' },
    human: { type: 'boolean', describe: 'readable report instead of JSON' },
  },
  notes: 'validate exits 1 on any error; warnings alone exit 0.',
};

const LEVER_KINDS = ['lane', 'feature', 'price', 'copy', 'channel', 'offer'];
const CHANGE_MODES = ['experiment', 'deliberate', 'locked'];
const GUARD_KINDS = ['floor', 'ceiling', 'locked-content', 'fairness', 'privacy'];
const ALLOCATIONS = ['random', 'rotation', 'deliberate'];
const STATUSES = ['draft', 'running', 'stopped', 'decided'];
const IDENTITY = ['none', 'pseudonymous', 'identified'];
const SENSITIVITY = ['health', 'intimate', 'financial', 'commercial', 'operational'];
const CONSENT = ['none', 'notice', 'explicit'];
const SENSITIVE = new Set(['health', 'intimate']);
// Measuring the measurement: a metric is unverified until someone has shown it
// counts what it claims (instrumented: events fire and reconcile against a
// known test; validated: an A/A test or independent count agrees).
const VERIFY = ['unverified', 'instrumented', 'validated'];
const SRM = ['pending', 'pass', 'fail'];

function readYaml(file) {
  if (!fs.existsSync(file)) return null;
  const text = fs.readFileSync(file, 'utf8');
  // The kit's YAML parser drops `- {a: b}` list items without a word. Refuse them.
  const flow = text.split('\n').map((l, i) => (/^\s*-\s*\{/.test(l) ? i + 1 : 0)).filter(Boolean);
  if (flow.length) throw new Error(`${path.basename(file)}: inline "- { … }" list items on line(s) ${flow.join(', ')} — the kit YAML parser drops them silently; write them in block style`);
  return parseYAML(text) || {};
}

function readExperiments(dir) {
  const d = path.join(dir, 'experiments');
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d)
    .filter((f) => f.endsWith('.md') && f !== 'README.md' && !f.startsWith('_'))
    .sort()
    .map((f) => {
      const file = path.join(d, f);
      const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
      const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      return { file, meta: m ? (parseYAML(m[1]) || {}) : null, body: m ? m[2] : text };
    });
}

function load(dir) {
  const levers = readYaml(path.join(dir, 'levers.yaml'));
  const signals = readYaml(path.join(dir, 'signals.yaml'));
  return {
    levers: (levers && levers.levers) || [],
    guardrails: (levers && levers.guardrails) || [],
    metrics: (levers && levers.metrics) || [],
    signals: (signals && signals.signals) || [],
    experiments: readExperiments(dir),
    missing: [!levers && 'levers.yaml', !signals && 'signals.yaml'].filter(Boolean),
  };
}

const PLACEHOLDER = /<slug>|<a>|<b>|YYYY-MM-DD|EXP-NNN/;
const hasSection = (body, name) => new RegExp(`^## +${name}\\s*\\n+(?!## )\\S`, 'im').test(body);

// ─── validate ───────────────────────────────────────────────────────────────

function validate(dir) {
  const L = load(dir);
  const issues = [];
  const add = (level, where, msg) => issues.push({ level, where, msg });

  for (const f of L.missing) add('error', f, 'missing');

  const index = (list, prefix, label) => {
    const map = new Map();
    for (const x of list) {
      if (!x || !new RegExp(`^${prefix}-[a-z0-9-]+$`).test(x.id || '')) { add('error', label, `id must match ${prefix}-<slug> (got ${x && x.id})`); continue; }
      if (map.has(x.id)) add('error', x.id, 'duplicate id');
      map.set(x.id, x);
    }
    return map;
  };
  const LEV = index(L.levers, 'LEV', 'levers');
  const GRD = index(L.guardrails, 'GRD', 'guardrails');
  const MET = index(L.metrics, 'MET', 'metrics');
  const SIG = index(L.signals, 'SIG', 'signals');

  for (const g of GRD.values()) {
    if (!GUARD_KINDS.includes(g.kind)) add('error', g.id, `kind must be one of ${GUARD_KINDS.join('|')}`);
    if (!g.rule) add('error', g.id, 'guardrail has no rule');
    if (g.metric && !MET.has(g.metric)) add('error', g.id, `metric ${g.metric} does not exist`);
  }

  for (const m of MET.values()) {
    const vf = m.verified || {};
    const vs = vf.status || 'unverified';
    if (!VERIFY.includes(vs)) add('error', m.id, `verified.status must be one of ${VERIFY.join('|')}`);
    if (vs !== 'unverified' && !vf.method) add('error', m.id, `verified.status ${vs} needs a method — how was it checked?`);
    if (vs === 'validated' && Number.isNaN(Date.parse(vf.checked))) add('error', m.id, 'validated needs a checked date');
    if (!m.definition) add('error', m.id, 'metric has no definition');
    if (!['up', 'down'].includes(m.direction)) add('error', m.id, 'direction must be up or down');
    if (!m.signal) add('error', m.id, 'metric names no signal — what is it computed from?');
    else if (!SIG.has(m.signal)) add('error', m.id, `signal ${m.signal} does not exist`);
  }

  for (const lv of LEV.values()) {
    if (!LEVER_KINDS.includes(lv.kind)) add('error', lv.id, `kind must be one of ${LEVER_KINDS.join('|')}`);
    if (!CHANGE_MODES.includes(lv.change_mode)) add('error', lv.id, `change_mode must be one of ${CHANGE_MODES.join('|')}`);
    const variants = Array.isArray(lv.variants) ? lv.variants.map(String) : [];
    if (!variants.length) add('error', lv.id, 'no variants declared');
    if (!variants.includes(String(lv.current))) add('error', lv.id, `current "${lv.current}" is not one of its variants`);
    if (lv.change_mode !== 'locked') {
      if (!lv.primary_metric) add('error', lv.id, 'a changeable lever needs a primary_metric');
      else if (!MET.has(lv.primary_metric)) add('error', lv.id, `primary_metric ${lv.primary_metric} does not exist`);
      if (!(lv.guardrails || []).length) add('error', lv.id, 'a changeable lever needs at least one guardrail');
    }
    for (const g of lv.guardrails || []) if (!GRD.has(g)) add('error', lv.id, `guardrail ${g} does not exist`);
    if (lv.kind === 'price' && lv.change_mode !== 'locked'
        && !(lv.guardrails || []).some((g) => GRD.has(g) && GRD.get(g).kind === 'fairness')) {
      add('error', lv.id, 'a changeable price lever needs a fairness guardrail (same customer never sees two prices; no price keyed to a sensitive signal)');
    }
  }

  for (const s of SIG.values()) {
    if (!s.want_to_know) add('error', s.id, 'want_to_know is empty — a signal with no question is collection for its own sake');
    if (!s.observed_as) add('error', s.id, 'observed_as is empty');
    if (!IDENTITY.includes(s.identity)) add('error', s.id, `identity must be one of ${IDENTITY.join('|')}`);
    if (!SENSITIVITY.includes(s.sensitivity)) add('error', s.id, `sensitivity must be one of ${SENSITIVITY.join('|')}`);
    if (!CONSENT.includes(s.consent)) add('error', s.id, `consent must be one of ${CONSENT.join('|')}`);
    if (!(Number(s.retention_days) > 0)) add('error', s.id, 'retention_days must be a positive number');
    if (s.asked === true && !s.why_ask) add('error', s.id, 'asked: true needs why_ask — why can behavior not answer this?');
    const dests = Array.isArray(s.destinations) ? s.destinations.map(String) : [];
    if (!dests.length) add('error', s.id, 'no destinations declared');
    if (SENSITIVE.has(s.sensitivity)) {
      const third = dests.filter((d) => d.startsWith('third-party'));
      if (third.length) add('error', s.id, `${s.sensitivity} signal sent to ${third.join(', ')} — never share health or intimate signals with a third party`);
      if (s.identity === 'identified' && s.consent !== 'explicit') add('error', s.id, `identified ${s.sensitivity} signal needs consent: explicit`);
      if (Number(s.retention_days) > 365) add('warn', s.id, `${s.sensitivity} signal kept over a year — is that needed?`);
    }
  }

  const running = new Map();
  for (const e of L.experiments) {
    const where = path.basename(e.file);
    const m = e.meta;
    if (!m) { add('error', where, 'no frontmatter'); continue; }
    if (!/^EXP-\d{3,}$/.test(m.id || '')) add('error', where, 'id must match EXP-NNN');
    if (PLACEHOLDER.test(JSON.stringify(m))) add('error', where, 'template placeholders left unfilled');
    if (!STATUSES.includes(m.status)) add('error', where, `status must be one of ${STATUSES.join('|')}`);
    if (!ALLOCATIONS.includes(m.allocation)) add('error', where, `allocation must be one of ${ALLOCATIONS.join('|')}`);
    const lv = LEV.get(m.lever);
    if (!lv) { add('error', where, `lever ${m.lever} does not exist`); continue; }
    if (lv.change_mode === 'locked') add('error', where, `${m.lever} is locked — it cannot be experimented on`);
    const vs = (m.variants || []).map(String);
    if (vs.length < 2) add('error', where, 'an experiment needs at least two variants');
    const lvVariants = (lv.variants || []).map(String);
    for (const v of vs) if (!lvVariants.includes(v)) add('error', where, `variant "${v}" is not a declared value of ${m.lever}`);
    if (m.allocation !== 'deliberate') {
      const split = (m.split || []).map(Number);
      if (split.length !== vs.length) add('error', where, 'split must give one share per variant');
      else if (split.reduce((a, b) => a + b, 0) !== 100) add('error', where, 'split must sum to 100');
    }
    if (!m.primary_metric || !MET.has(m.primary_metric)) add('error', where, `primary_metric ${m.primary_metric} does not exist`);
    if (!(m.guardrails || []).length) add('error', where, 'no guardrails — what stops a harmful variant?');
    for (const g of m.guardrails || []) if (!GRD.has(g)) add('error', where, `guardrail ${g} does not exist`);
    if (lv.kind === 'price' && !(m.guardrails || []).some((g) => GRD.has(g) && GRD.get(g).kind === 'fairness')) {
      add('error', where, 'a price experiment must carry a fairness guardrail');
    }
    if (!(Number(m.min_sample) > 0) && !(Number(m.max_days) > 0)) add('error', where, 'needs min_sample or max_days — when does it end?');
    if (!hasSection(e.body, 'Hypothesis')) add('error', where, 'missing Hypothesis — write it before running');
    if (!hasSection(e.body, 'Stop rule')) add('error', where, 'missing Stop rule — write it before running');
    const integ = m.integrity || {};
    if (integ.srm != null && !SRM.includes(integ.srm)) add('error', where, `integrity.srm must be one of ${SRM.join('|')}`);
    if (m.status === 'running') {
      const pm = MET.get(m.primary_metric);
      if (pm && ((pm.verified || {}).status || 'unverified') === 'unverified') {
        add('error', where, `${m.primary_metric} is unverified — don't run an experiment on a metric nobody has checked`);
      }
      if (!m.started) add('error', where, 'running with no started date');
      if (running.has(m.lever)) add('error', where, `${m.lever} already has a running experiment (${running.get(m.lever)}) — one change per lever at a time`);
      running.set(m.lever, m.id);
    }
    if (m.status === 'decided') {
      if (m.allocation !== 'deliberate' && m.outcome !== 'none' && integ.srm !== 'pass') {
        add('error', where, 'a randomized result needs integrity.srm: pass — if the traffic split came out wrong, the result is not a result');
      }
      if (!m.outcome) add('error', where, 'decided with no outcome');
      else if (m.outcome !== 'none' && !vs.includes(String(m.outcome))) add('error', where, `outcome "${m.outcome}" is not one of its variants`);
      if (!hasSection(e.body, 'Decision')) add('error', where, 'decided with no Decision section');
    }
  }

  const errors = issues.filter((i) => i.level === 'error').length;
  return {
    dir,
    counts: { levers: LEV.size, guardrails: GRD.size, metrics: MET.size, signals: SIG.size, experiments: L.experiments.length },
    errors,
    warnings: issues.length - errors,
    issues,
    exit_code: errors ? 1 : 0,
  };
}

// ─── status ─────────────────────────────────────────────────────────────────

function status(dir, today = new Date()) {
  const L = load(dir);
  const days = (d) => Math.floor((today - Date.parse(d)) / 86400000);
  const byLever = new Map();
  for (const e of L.experiments) if (e.meta && e.meta.lever) {
    if (!byLever.has(e.meta.lever)) byLever.set(e.meta.lever, []);
    byLever.get(e.meta.lever).push(e.meta);
  }
  const levers = L.levers.map((lv) => {
    const exps = byLever.get(lv.id) || [];
    const run = exps.find((x) => x.status === 'running');
    return {
      id: lv.id, kind: lv.kind, mode: lv.change_mode, current: lv.current,
      running: run ? { id: run.id, variants: run.variants, days: run.started ? days(run.started) : null } : null,
      drafts: exps.filter((x) => x.status === 'draft').map((x) => x.id),
    };
  });
  const overdue = L.experiments
    .map((e) => e.meta)
    .filter((m) => m && m.status === 'running' && m.started && Number(m.max_days) > 0 && days(m.started) > Number(m.max_days))
    .map((m) => ({ id: m.id, lever: m.lever, days: days(m.started), max_days: Number(m.max_days) }));
  const asked = L.signals.filter((s) => s.asked === true).map((s) => s.id);
  const measurement = { unverified: [], instrumented: [], validated: [] };
  for (const mt of L.metrics) {
    const st = (mt.verified && mt.verified.status) || 'unverified';
    (measurement[st] || measurement.unverified).push(mt.id);
  }
  return {
    dir, levers, overdue, measurement,
    signals: { total: L.signals.length, observed: L.signals.length - asked.length, asked },
  };
}

// ─── Output ─────────────────────────────────────────────────────────────────

function renderValidate(r) {
  const c = r.counts;
  const lines = [`launch: ${c.levers} levers, ${c.guardrails} guardrails, ${c.metrics} metrics, ${c.signals} signals, ${c.experiments} experiments in ${r.dir}`];
  for (const i of r.issues) lines.push(`  ${i.level === 'error' ? 'ERROR' : 'warn '} ${i.where}: ${i.msg}`);
  lines.push(r.errors ? `FAIL — ${r.errors} error(s), ${r.warnings} warning(s)` : `OK — ${r.warnings} warning(s)`);
  return lines.join('\n') + '\n';
}

function renderStatus(r) {
  const lines = ['levers:'];
  for (const l of r.levers) {
    let s = `  ${l.id.padEnd(28)} ${String(l.mode).padEnd(10)} now: ${l.current}`;
    if (l.running) s += `   RUNNING ${l.running.id} (${l.running.variants.join(' vs ')}, day ${l.running.days})`;
    if (l.drafts.length) s += `   queued: ${l.drafts.join(', ')}`;
    lines.push(s);
  }
  lines.push(r.overdue.length ? 'overdue for a decision:' : 'nothing overdue for a decision');
  for (const o of r.overdue) lines.push(`  ${o.id} on ${o.lever}: day ${o.days} of ${o.max_days}`);
  const ms = r.measurement;
  lines.push(`measurement: ${ms.validated.length} validated, ${ms.instrumented.length} instrumented, ${ms.unverified.length} unverified${ms.unverified.length ? ' (' + ms.unverified.join(', ') + ')' : ''}`);
  lines.push(`signals: ${r.signals.total} (${r.signals.observed} observed from behavior, ${r.signals.asked.length} asked${r.signals.asked.length ? ': ' + r.signals.asked.join(', ') : ''})`);
  return lines.join('\n') + '\n';
}

function main() {
  const { values, sub } = cliGate(process.argv.slice(2), CLI);
  const dir = path.resolve(values.dir || path.join(findRepoRoot() || process.cwd(), 'launch'));
  try { load(dir); } catch (e) { process.stderr.write(`cwos-launch: ${e.message}\n`); process.exit(2); }
  if (sub === 'status') {
    const today = values.today ? new Date(values.today) : new Date();
    if (Number.isNaN(today.getTime())) { process.stderr.write('cwos-launch: --today must be YYYY-MM-DD\n'); process.exit(2); }
    const r = status(dir, today);
    process.stdout.write(values.human ? renderStatus(r) : JSON.stringify(r, null, 2) + '\n');
    return;
  }
  if (sub !== 'validate') {
    process.stderr.write('cwos-launch: choose a subcommand — validate or status (see --help)\n');
    process.exit(2);
  }
  const r = validate(dir);
  process.stdout.write(values.human ? renderValidate(r) : JSON.stringify(r, null, 2) + '\n');
  process.exit(r.exit_code);
}

module.exports = { validate, status };

if (require.main === module) main();
