#!/usr/bin/env node
/**
 * cwos-user-persona — validate user personas and build blind simulation briefs.
 *
 * ADR-071. A USER persona is a synthetic end user of the product, kept under
 * design/personas/. It is not a reviewer persona (personas/, .claude/agents/),
 * which evaluates code. The two share a word and nothing else, and the fleet had
 * five incompatible formats for the first kind because the kit shipped none.
 *
 * Two subcommands, both deterministic (read-path determinism — the user-sim
 * engine consumes this script's output instead of asking a model to parse files):
 *
 *   validate  check personas, scenarios and proposals against the standard.
 *             The load-bearing rule is the Disclosure & trust posture section:
 *             a persona without one simulates as a person who answers every
 *             question and finishes every flow, which is nobody.
 *
 *   matrix    pair personas with proposals for a simulation run. Each persona
 *             gets the proposals in a different order (rotation, so order
 *             effects cancel across personas) under blind labels ("Design 1"),
 *             and a brief holding ONLY what that person would meet: the persona,
 *             the scenario, and each proposal's "What the user sees" section.
 *             Thesis and rationale never reach the persona agent.
 *
 * Zero dependencies beyond lib/.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { cliGate } = require('./lib/cli');
const { parseYAML, findRepoRoot, writeFileAtomic } = require('./lib/cwos-utils');

const CLI = {
  name: 'cwos-user-persona',
  summary: 'validate user personas (design/personas/) and build blind simulation briefs',
  usage: 'cwos-user-persona <validate|matrix> [options]',
  subcommands: {
    validate: 'check personas, scenarios and proposals against ADR-071',
    matrix: 'pair personas with proposals and emit blind walkthrough briefs',
  },
  flags: {
    dir: { type: 'string', placeholder: 'path', describe: 'design directory holding personas/ scenarios/ proposals/ (default: <repo>/design)' },
    personas: { type: 'string', placeholder: 'ids', describe: 'matrix: comma-separated PER- ids (default: every core and situational persona)' },
    proposals: { type: 'string', placeholder: 'ids', describe: 'matrix: comma-separated PROP- ids (default: every candidate proposal)' },
    scenario: { type: 'string', placeholder: 'id', describe: 'matrix: SCN- id applied to every persona (default: first scenario listing that persona)' },
    'brief-dir': { type: 'string', placeholder: 'path', describe: 'matrix: also write one brief file per persona here' },
    human: { type: 'boolean', describe: 'readable report instead of JSON' },
  },
  notes: [
    'validate exits 1 on any error; warnings alone exit 0.',
    'Files named README.md or starting with "_" are skipped.',
  ].join('\n'),
};

const KINDS = ['core', 'situational', 'variant'];
const GROUNDING = ['assumed', 'secondary-research', 'interviewed', 'observed'];
const DEFAULT_ANSWERS = ['refuse', 'deflect', 'minimal', 'answers'];
const STALE_DAYS = 180;

// ─── Parsing ────────────────────────────────────────────────────────────────

function splitFrontmatter(text) {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  return { meta: parseYAML(m[1]) || {}, body: m[2] };
}

/** Map of lowercased `## heading` → section text (up to the next ## heading). */
function sections(body) {
  const out = {};
  const parts = body.split(/^## +/m).slice(1);
  for (const p of parts) {
    const nl = p.indexOf('\n');
    const head = (nl === -1 ? p : p.slice(0, nl)).trim().toLowerCase();
    out[head] = nl === -1 ? '' : p.slice(nl + 1).trim();
  }
  return out;
}

function findSection(secs, pattern) {
  const key = Object.keys(secs).find((k) => pattern.test(k));
  return key === undefined ? null : secs[key];
}

/** Value after a `**Label:**` bullet inside a section. */
function labeledValue(section, label) {
  const re = new RegExp(`\\*\\*${label}[^*]*:\\*\\*\\s*(.*)`, 'i');
  const m = section.match(re);
  return m ? m[1].trim() : null;
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md' && !f.startsWith('_'))
    .sort()
    .map((f) => path.join(dir, f));
}

function slugOf(file) {
  return path.basename(file).replace(/\.draft\.md$|\.md$/, '');
}

function load(dir) {
  const read = (sub) => listFiles(path.join(dir, sub)).map((file) => {
    const text = fs.readFileSync(file, 'utf8');
    const fm = splitFrontmatter(text);
    return { file, text, meta: fm ? fm.meta : null, body: fm ? fm.body : text };
  });
  return { personas: read('personas'), scenarios: read('scenarios'), proposals: read('proposals') };
}

// ─── validate ───────────────────────────────────────────────────────────────

const PLACEHOLDER = /<slug>|YYYY-MM-DD|<assumption>|<observable>|<first name>/;

function validate(dir, today = new Date()) {
  const { personas, scenarios, proposals } = load(dir);
  const issues = [];
  const add = (level, file, msg) => issues.push({ level, file: path.relative(dir, file), msg });
  const personaIds = new Set(personas.map((p) => p.meta && p.meta.id).filter(Boolean));

  for (const p of personas) {
    const { meta, file, body, text } = p;
    if (!meta) { add('error', file, 'no frontmatter'); continue; }
    if (!/^PER-[a-z0-9-]+$/.test(meta.id || '')) add('error', file, `id must match PER-<slug> (got ${meta.id || 'nothing'})`);
    else if (meta.id !== `PER-${slugOf(file)}`) add('warn', file, `id ${meta.id} does not match file name ${slugOf(file)}`);
    if (!KINDS.includes(meta.kind)) add('error', file, `kind must be one of ${KINDS.join('|')}`);
    if (meta.synthetic !== true) add('error', file, 'synthetic must be true — real customers do not belong in personas/');
    if (!GROUNDING.includes(meta.grounding)) add('error', file, `grounding must be one of ${GROUNDING.join('|')}`);
    else if (meta.grounding !== 'assumed' && !(Array.isArray(meta.evidence) && meta.evidence.length)) {
      add('error', file, `grounding is ${meta.grounding} but evidence is empty`);
    }
    if (PLACEHOLDER.test(text)) add('error', file, 'template placeholders left unfilled');

    const layered = meta.kind === 'situational' || meta.kind === 'variant';
    if (layered) {
      if (!meta.extends) add('error', file, `${meta.kind} persona must declare extends:`);
      else if (!personaIds.has(meta.extends)) add('error', file, `extends ${meta.extends}, which does not exist`);
    }

    const reviewed = Date.parse(meta.last_reviewed);
    if (Number.isNaN(reviewed)) add('warn', file, 'last_reviewed missing or not a date');
    else if ((today - reviewed) / 86400000 > STALE_DAYS) add('warn', file, `last reviewed over ${STALE_DAYS} days ago`);

    const secs = sections(body);
    const posture = findSection(secs, /^disclosure/);
    if (posture === null) {
      // A layered persona may inherit posture from its parent; a core one may not.
      if (!layered) add('error', file, 'missing "Disclosure & trust posture" section — simulations cannot model refusal without it');
    } else {
      const def = (labeledValue(posture, 'Default answer') || '').toLowerCase();
      const word = def.replace(/[^a-z| ]/g, ' ').trim().split(/\s+/)[0];
      if (!DEFAULT_ANSWERS.includes(word) || def.includes('|')) {
        add('error', file, `Default answer to a personal question must start with one of ${DEFAULT_ANSWERS.join('|')}`);
      }
      const never = labeledValue(posture, 'Never shares');
      if (!never || /^what (she|he|they) will not/i.test(never)) add('error', file, '"Never shares" is empty — every real person has a line');
    }
    if (!layered) {
      if (findSection(secs, /^exits/) === null) add('error', file, 'missing "Exits" section');
      if (findSection(secs, /^what would make this persona wrong/) === null) add('error', file, 'missing "What would make this persona wrong" section');
      const words = findSection(secs, /^in (their|her|his) words/);
      if (words === null) add('error', file, 'missing "In their words" section');
      else if (words.split('\n').filter((l) => /^\s*[-*\d]/.test(l)).length < 3) add('warn', file, '"In their words" has fewer than 3 phrases');
    }
  }

  for (const s of scenarios) {
    if (!s.meta) { add('error', s.file, 'no frontmatter'); continue; }
    if (!/^SCN-[a-z0-9-]+$/.test(s.meta.id || '')) add('error', s.file, 'id must match SCN-<slug>');
    for (const id of s.meta.personas || []) {
      if (!personaIds.has(id)) add('error', s.file, `names persona ${id}, which does not exist`);
    }
    if (PLACEHOLDER.test(s.text)) add('error', s.file, 'template placeholders left unfilled');
  }

  for (const pr of proposals) {
    if (!pr.meta) { add('error', pr.file, 'no frontmatter'); continue; }
    if (!/^PROP-[a-z0-9-]+$/.test(pr.meta.id || '')) add('error', pr.file, 'id must match PROP-<slug>');
    const secs = sections(pr.body);
    const seen = findSection(secs, /^what (the user|she|he|they) sees?/);
    if (!seen) add('error', pr.file, 'missing or empty "What the user sees" — the only section a persona agent receives');
    if (findSection(secs, /^what it asks/) === null) add('warn', pr.file, 'no "What it asks of the user" table — refusals cannot be checked against posture');
    if (PLACEHOLDER.test(pr.text)) add('error', pr.file, 'template placeholders left unfilled');
  }

  const errors = issues.filter((i) => i.level === 'error').length;
  return {
    dir,
    counts: { personas: personas.length, scenarios: scenarios.length, proposals: proposals.length },
    errors,
    warnings: issues.length - errors,
    issues,
    exit_code: errors ? 1 : 0,
  };
}

// ─── matrix ─────────────────────────────────────────────────────────────────

function csv(v) {
  return typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : null;
}

function matrix(dir, opts = {}) {
  const { personas, scenarios, proposals } = load(dir);
  const byId = (list) => new Map(list.filter((x) => x.meta && x.meta.id).map((x) => [x.meta.id, x]));
  const P = byId(personas), S = byId(scenarios), R = byId(proposals);

  const pick = (ids, map, fallback, label) => {
    if (!ids) return fallback;
    const missing = ids.filter((id) => !map.has(id));
    if (missing.length) throw new Error(`unknown ${label}: ${missing.join(', ')}`);
    return ids.map((id) => map.get(id));
  };

  const chosenPersonas = pick(csv(opts.personas), P,
    personas.filter((p) => p.meta && p.meta.kind !== 'variant'), 'persona');
  const chosenProposals = pick(csv(opts.proposals), R,
    proposals.filter((p) => p.meta && (p.meta.status || 'candidate') === 'candidate'), 'proposal');
  if (opts.scenario && !S.has(opts.scenario)) throw new Error(`unknown scenario: ${opts.scenario}`);
  if (!chosenPersonas.length || !chosenProposals.length) throw new Error('matrix needs at least one persona and one proposal');

  const surface = (pr) => findSection(sections(pr.body), /^what (the user|she|he|they) sees?/) || '';

  // A persona agent must not see the hypotheses being tested ABOUT it: the
  // falsification section names the designs ("an anonymous Q&A library gets
  // reads") and would prime the walkthrough toward them. Authoring comments go
  // too. What remains is the person, not the experiment.
  const inhabit = (body) => body
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^## +what would make this persona wrong[\s\S]*?(?=^## |(?![\s\S]))/im, '')
    .replace(/^---\s*$/gm, '')
    .trim();

  const walkthroughs = chosenPersonas.map((persona, i) => {
    // Rotation: persona i meets the proposals starting at offset i. Across
    // personas each proposal appears in each position, so "first design seen"
    // bias cancels instead of accumulating on one proposal.
    const n = chosenProposals.length;
    const order = chosenProposals.map((_, k) => chosenProposals[(k + i) % n]);
    const scenario = opts.scenario
      ? S.get(opts.scenario)
      : scenarios.find((s) => s.meta && (s.meta.personas || []).includes(persona.meta.id)) || null;
    const parent = persona.meta.extends ? P.get(persona.meta.extends) : null;

    const labels = order.map((pr, k) => ({ label: `Design ${k + 1}`, proposal: pr.meta.id }));
    const brief = [
      '# Walkthrough brief',
      '',
      'You are the person described below. Stay inside their disclosure posture: if a',
      'design asks for something they would not give, they do not give it — they skip,',
      'lie, or leave, whichever they would do. Do not be more patient, trusting or',
      'articulate than they are.',
      '',
      ...(parent ? ['## Base persona', '', inhabit(parent.body), ''] : []),
      '## Who you are', '', inhabit(persona.body), '',
      '## Where you are right now', '', scenario ? scenario.body.trim() : '(no scenario — use the persona\'s most common trigger)', '',
      ...labels.flatMap((l, k) => [`## ${l.label}`, '', surface(order[k]).trim(), '']),
    ].join('\n');

    return {
      persona: persona.meta.id,
      scenario: scenario ? scenario.meta.id : null,
      order: labels,
      brief,
    };
  });

  if (opts.briefDir) {
    fs.mkdirSync(opts.briefDir, { recursive: true });
    for (const w of walkthroughs) {
      const f = path.join(opts.briefDir, `${w.persona}.md`);
      // writeFileAtomic, not raw fs.writeFileSync (INV-078; WS-986 after MIS-015).
      // With --brief-dir the JSON output drops the brief text, so this file is the
      // ONLY copy a walkthrough subagent reads — a torn brief would be dispatched
      // as a persona with half its surfaces missing, and nothing would notice.
      writeFileAtomic(f, w.brief);
      w.brief_file = f;
    }
  }

  // What each persona actually met, hashed. A run record stores these, so a
  // later run can tell which walkthroughs are still current and re-walk only
  // the proposals whose surface moved (melody-hill-app's persona gate).
  const surfaceHashes = Object.fromEntries(chosenProposals.map((p) => [
    p.meta.id, crypto.createHash('sha256').update(surface(p).trim()).digest('hex').slice(0, 12),
  ]));

  // Biases the first real run (SIM-001) exposed, surfaced before dispatch
  // rather than discovered by the audit: a proposal described in far more
  // detail than its rivals wins by getting the benefit of the doubt, and a
  // placeholder in a surface gets read as a fact about the persona's case.
  const warnings = [];
  const words = chosenProposals.map((p) => [p.meta.id, surface(p).split(/\s+/).filter(Boolean).length]);
  const max = Math.max(...words.map(([, n]) => n));
  const min = Math.min(...words.map(([, n]) => n));
  if (min > 0 && max / min > 1.3) {
    warnings.push(`uneven surface detail: ${words.map(([id, n]) => `${id}=${n}w`).join(', ')} (max/min ${(max / min).toFixed(2)} > 1.3)`);
  }
  for (const p of chosenProposals) {
    const ph = surface(p).match(/\[[^\]\n]{1,40}\]|\(or the real [^)]*\)|\bTBD\b|\be\.g\.\s/g);
    if (ph) warnings.push(`${p.meta.id}: placeholders in the user-facing surface (${[...new Set(ph)].slice(0, 3).join(' · ')})`);
  }

  return { dir, proposals: chosenProposals.map((p) => p.meta.id), surface_hashes: surfaceHashes, warnings, walkthroughs };
}

// ─── Output ─────────────────────────────────────────────────────────────────

function renderValidate(r) {
  const lines = [`user personas: ${r.counts.personas} personas, ${r.counts.scenarios} scenarios, ${r.counts.proposals} proposals in ${r.dir}`];
  for (const i of r.issues) lines.push(`  ${i.level === 'error' ? 'ERROR' : 'warn '} ${i.file}: ${i.msg}`);
  lines.push(r.errors ? `FAIL — ${r.errors} error(s), ${r.warnings} warning(s)` : `OK — ${r.warnings} warning(s)`);
  return lines.join('\n') + '\n';
}

function renderMatrix(r) {
  const lines = [`simulation matrix: ${r.walkthroughs.length} personas × ${r.proposals.length} proposals`];
  for (const w of r.warnings) lines.push(`  warn ${w}`);
  for (const w of r.walkthroughs) {
    lines.push(`  ${w.persona} (${w.scenario || 'no scenario'}): ${w.order.map((o) => `${o.label}=${o.proposal}`).join(', ')}${w.brief_file ? `  → ${w.brief_file}` : ''}`);
  }
  return lines.join('\n') + '\n';
}

function main() {
  const { values, sub } = cliGate(process.argv.slice(2), CLI);
  const dir = path.resolve(values.dir || path.join(findRepoRoot() || process.cwd(), 'design'));

  if (sub === 'matrix') {
    let r;
    try {
      r = matrix(dir, { personas: values.personas, proposals: values.proposals, scenario: values.scenario, briefDir: values['brief-dir'] });
    } catch (err) {
      process.stderr.write(`cwos-user-persona matrix: ${err.message}\n`);
      process.exit(2);
    }
    const out = values.human ? renderMatrix(r)
      : JSON.stringify(values['brief-dir'] ? { ...r, walkthroughs: r.walkthroughs.map(({ brief, ...w }) => w) } : r, null, 2) + '\n';
    process.stdout.write(out);
    return;
  }

  if (sub !== 'validate') {
    process.stderr.write('cwos-user-persona: choose a subcommand — validate or matrix (see --help)\n');
    process.exit(2);
  }
  const r = validate(dir);
  process.stdout.write(values.human ? renderValidate(r) : JSON.stringify(r, null, 2) + '\n');
  process.exit(r.exit_code);
}

module.exports = { validate, matrix, sections, splitFrontmatter };

if (require.main === module) main();
