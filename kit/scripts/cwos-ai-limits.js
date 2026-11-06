#!/usr/bin/env node
/**
 * cwos-ai-limits — AI model limits and the compensations workflows owe (ADR-074).
 *
 * A limits profile records what the AI in use gets wrong, per domain (images,
 * text, …), and names the compensating step for each: a human gate, a tool
 * check, a prohibition, a disclosure, a test set. Every AI workflow points at
 * the active profile and must implement every compensation its domain requires.
 *
 * Profiles are per model assessment. When the model changes, a new profile is
 * assessed and workflows are re-pointed; a workflow still on a retired profile,
 * or a profile past its review date, fails validation. That is what makes the
 * compensations "updated by model" instead of written once and forgotten.
 *
 *   validate  profiles, limits, compensations and workflows agree; every
 *             workflow covers its domain's limits; high-severity limits are
 *             never waived; nothing is past review.
 *   check     one workflow: what it owes, what it implements, what is missing.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { cliGate } = require('./lib/cli');
const { parseYAML, findRepoRoot } = require('./lib/cwos-utils');

const CLI = {
  name: 'cwos-ai-limits',
  summary: 'AI model limits and the compensations every AI workflow owes (ADR-074)',
  usage: 'cwos-ai-limits <validate|check> [WF-id] [options]',
  subcommands: {
    validate: 'check the whole limits file',
    check: 'one workflow: required vs implemented compensations',
  },
  flags: {
    file: { type: 'string', placeholder: 'path', describe: 'limits file (default: <repo>/ai/model-limits.yaml)' },
    today: { type: 'string', placeholder: 'YYYY-MM-DD', describe: 'evaluate review dates as of this day (default: now)' },
    human: { type: 'boolean', describe: 'readable output instead of JSON' },
  },
  notes: 'validate exits 1 on any error.',
};

const DOMAINS = ['image', 'text', 'audio', 'video', 'data'];
const SEVERITY = ['high', 'medium', 'low'];
const KINDS = ['human-gate', 'tool-check', 'prohibition', 'disclosure', 'test-set'];
const PLACEHOLDER = /<slug>|YYYY-MM|<what|<how|<the|<role/;
const list = (v) => (Array.isArray(v) ? v : []);

function load(file) {
  if (!fs.existsSync(file)) throw new Error(`limits file not found: ${file}`);
  const text = fs.readFileSync(file, 'utf8');
  const flow = text.split('\n').map((l, i) => (/^\s*-\s*\{/.test(l) ? i + 1 : 0)).filter(Boolean);
  if (flow.length) throw new Error(`inline "- { … }" list items on line(s) ${flow.join(', ')} — the kit YAML parser drops them silently; write them in block style`);
  const d = parseYAML(text) || {};
  return {
    profiles: list(d.profiles), limits: list(d.limits),
    compensations: list(d.compensations), workflows: list(d.workflows),
    placeholders: PLACEHOLDER.test(text),
  };
}

/** What a workflow owes: every compensation of every limit in its profile+domain. */
function owed(D, wf) {
  // scope: people — the limit only bites when a person is in the material
  // (age, consent, identity, body judgments). A product-photo workflow does not
  // owe an ID check; a workflow with people in frame owes all of them.
  const byLimit = D.limits.filter((l) => l.profile === wf.profile && l.domain === wf.domain
    && (l.scope !== 'people' || wf.involves_people === true));
  const waived = new Set(list(wf.waivers).map((w) => w.limit));
  const req = new Map();
  for (const l of byLimit) {
    if (waived.has(l.id)) continue;
    for (const c of list(l.compensations)) {
      if (!req.has(c)) req.set(c, []);
      req.get(c).push(l.id);
    }
  }
  const have = new Set(list(wf.implements));
  const missing = [...req.keys()].filter((c) => !have.has(c));
  return { limits: byLimit.map((l) => l.id), required: [...req.keys()], implemented: [...have], missing, because: Object.fromEntries(req), waived: [...waived] };
}

function validate(D, today = new Date()) {
  const issues = [];
  const add = (level, where, msg) => issues.push({ level, where, msg });
  if (D.placeholders) add('error', 'file', 'template placeholders left unfilled');

  const idx = (arr, prefix, label) => {
    const m = new Map();
    for (const x of arr) {
      if (!new RegExp(`^${prefix}-[A-Za-z0-9-]+$`).test((x && x.id) || '')) { add('error', label, `id must match ${prefix}-… (got ${x && x.id})`); continue; }
      if (m.has(x.id)) add('error', x.id, 'duplicate id');
      m.set(x.id, x);
    }
    return m;
  };
  const P = idx(D.profiles, 'MPR', 'profiles');
  const L = idx(D.limits, 'LIM', 'limits');
  const C = idx(D.compensations, 'CMP', 'compensations');
  const W = idx(D.workflows, 'WF', 'workflows');

  const active = [...P.values()].filter((p) => p.active === true);
  if (!active.length) add('error', 'profiles', 'no active profile — which model assessment governs today?');
  for (const p of P.values()) {
    if (Number.isNaN(Date.parse(p.assessed))) add('error', p.id, 'assessed date missing');
    if (Number.isNaN(Date.parse(p.review_by))) add('error', p.id, 'review_by date missing');
    else if (p.active === true && Date.parse(p.review_by) < today) add('error', p.id, `past review_by (${p.review_by}) — re-assess the model before relying on these compensations`);
    if (p.active === true && !list(p.model_ids).length) add('warn', p.id, 'model_ids is empty — record which model this assessment covers');
  }

  for (const l of L.values()) {
    if (!P.has(l.profile)) add('error', l.id, `profile ${l.profile} does not exist`);
    if (!DOMAINS.includes(l.domain)) add('error', l.id, `domain must be one of ${DOMAINS.join('|')}`);
    if (!SEVERITY.includes(l.severity)) add('error', l.id, `severity must be one of ${SEVERITY.join('|')}`);
    if (l.scope != null && !['any', 'people'].includes(l.scope)) add('error', l.id, 'scope must be any or people');
    if (!l.shortcoming) add('error', l.id, 'shortcoming is empty');
    if (!l.evidence) add('error', l.id, 'evidence is empty — how do we know the model does this?');
    if (!list(l.compensations).length) add('error', l.id, 'a limit with no compensation is a known failure left open');
    for (const c of list(l.compensations)) if (!C.has(c)) add('error', l.id, `compensation ${c} does not exist`);
  }

  for (const c of C.values()) {
    if (!KINDS.includes(c.kind)) add('error', c.id, `kind must be one of ${KINDS.join('|')}`);
    if (!c.step) add('error', c.id, 'step is empty');
    if (!c.owner) add('error', c.id, 'owner is empty — who performs it?');
  }

  for (const w of W.values()) {
    const p = P.get(w.profile);
    if (!p) { add('error', w.id, `profile ${w.profile} does not exist`); continue; }
    if (p.active !== true) add('error', w.id, `on retired profile ${w.profile} — re-point to the active assessment after reviewing its limits`);
    if (!DOMAINS.includes(w.domain)) add('error', w.id, `domain must be one of ${DOMAINS.join('|')}`);
    if (typeof w.involves_people !== 'boolean') add('error', w.id, 'involves_people must be true or false — it decides which limits apply');
    for (const c of list(w.implements)) if (!C.has(c)) add('error', w.id, `implements ${c}, which does not exist`);
    for (const wv of list(w.waivers)) {
      const lim = L.get(wv.limit);
      if (!lim) { add('error', w.id, `waiver for ${wv.limit}, which does not exist`); continue; }
      if (lim.severity === 'high') add('error', w.id, `${wv.limit} is high severity and cannot be waived`);
      if (!wv.reason) add('error', w.id, `waiver for ${wv.limit} has no reason`);
      if (Number.isNaN(Date.parse(wv.expires))) add('error', w.id, `waiver for ${wv.limit} has no expiry`);
      else if (Date.parse(wv.expires) < today) add('error', w.id, `waiver for ${wv.limit} expired ${wv.expires}`);
    }
    const o = owed({ ...D }, w);
    for (const c of o.missing) add('error', w.id, `missing ${c} (required by ${o.because[c].join(', ')})`);
  }

  const errors = issues.filter((i) => i.level === 'error').length;
  return { errors, warnings: issues.length - errors, issues, exit_code: errors ? 1 : 0 };
}

function check(D, id) {
  const w = D.workflows.find((x) => x.id === id);
  if (!w) throw new Error(`workflow ${id} not found`);
  const C = new Map(D.compensations.map((c) => [c.id, c]));
  const o = owed(D, w);
  return { workflow: id, description: w.description, profile: w.profile, domain: w.domain, ...o, steps: o.required.map((c) => ({ id: c, step: (C.get(c) || {}).step, owner: (C.get(c) || {}).owner, done: o.implemented.includes(c) })) };
}

function human(sub, r) {
  if (sub === 'validate') {
    const L = r.issues.map((i) => `  ${i.level === 'error' ? 'ERROR' : 'warn '} ${i.where}: ${i.msg}`);
    L.push(r.errors ? `FAIL — ${r.errors} error(s), ${r.warnings} warning(s)` : `OK — ${r.warnings} warning(s)`);
    return L.join('\n') + '\n';
  }
  const L = [`${r.workflow} — ${r.description}`, `profile ${r.profile}, domain ${r.domain}, ${r.limits.length} limit(s) apply`];
  for (const s of r.steps) L.push(`  ${s.done ? '✓' : '✗'} ${s.id}: ${s.step} [${s.owner}]`);
  if (r.waived.length) L.push(`  waived: ${r.waived.join(', ')}`);
  L.push(r.missing.length ? `MISSING ${r.missing.length}` : 'all compensations in place');
  return L.join('\n') + '\n';
}

function main() {
  const { values, sub, positionals } = cliGate(process.argv.slice(2), CLI);
  const file = path.resolve(values.file || path.join(findRepoRoot() || process.cwd(), 'ai', 'model-limits.yaml'));
  const today = values.today ? new Date(values.today) : new Date();
  let D;
  try { D = load(file); } catch (e) { process.stderr.write(`cwos-ai-limits: ${e.message}\n`); process.exit(2); }
  let r;
  if (sub === 'check') {
    const id = (positionals || []).find((p) => p !== 'check');
    if (!id) { process.stderr.write('cwos-ai-limits check: give a workflow id\n'); process.exit(2); }
    try { r = check(D, id); } catch (e) { process.stderr.write(`cwos-ai-limits: ${e.message}\n`); process.exit(2); }
  } else if (sub === 'validate') {
    r = validate(D, today);
  } else { process.stderr.write('cwos-ai-limits: choose validate or check (see --help)\n'); process.exit(2); }
  process.stdout.write(values.human ? human(sub, r) : JSON.stringify(r, null, 2) + '\n');
  if (sub === 'validate') process.exit(r.exit_code);
}

module.exports = { load, validate, check, owed };

if (require.main === module) main();
