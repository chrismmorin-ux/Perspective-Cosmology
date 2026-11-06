#!/usr/bin/env node
/**
 * cwos-evidence.js — grade every record against the repo's declared evidence ladder.
 *
 * The ladder is data (default canon/evidence-ladder.yaml); the engine is
 * kit/scripts/lib/evidence-ladder.js. A grade is computed, never asserted.
 *
 * Usage:
 *   node kit/scripts/cwos-evidence.js                 # every record: rung, why, next
 *   node kit/scripts/cwos-evidence.js --write         # also write the ladder's `output` file
 *   node kit/scripts/cwos-evidence.js --self-test     # run the ladder's fixtures
 *   node kit/scripts/cwos-evidence.js --ladder <path> # a ladder other than the default
 *   node kit/scripts/cwos-evidence.js --json
 *
 * Exit: 0 ok · 1 self-test failed, or a gate-confirmed record is below the gate rung
 *       · 2 ladder or records unreadable
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { readYAMLFile, writeFileAtomic } = require('./lib/cwos-utils');
const ladderLib = require('./lib/evidence-ladder');

const { cliGate } = require('./lib/cli');

const CLI = {
  name: 'cwos-evidence',
  summary: "grade every record against the repo's evidence ladder (computed, never asserted)",
  flags: {
    ladder: { type: 'string', placeholder: 'path', describe: 'ladder file (default canon/evidence-ladder.yaml)' },
    write: { type: 'boolean', describe: "write the ladder's `output` file with record_sha256 pins" },
    'self-test': { type: 'boolean', describe: "run the ladder's fixtures; fails if none expects the floor rung" },
    json: { type: 'boolean', describe: 'machine-readable output' },
  },
  notes: [
    'Engine: kit/scripts/lib/evidence-ladder.js. Start a ladder from',
    'kit/templates/evidence/evidence-ladder.template.yaml.',
    '',
    'Exit 1 when the self-test fails, or when a record confirmed by the',
    'ladder gate sits below the gate rung. Exit 2 when the ladder or a record',
    'cannot be read.',
  ].join('\n'),
};

const REPO_ROOT = process.cwd();
const { values } = cliGate(process.argv.slice(2), CLI);
const flag = (f) => Boolean(values[f.replace(/^--/, '')]);
const opt = (f) => values[f.replace(/^--/, '')];

function die(msg) { process.stderr.write(`cwos-evidence: ${msg}\n`); process.exit(2); }

function loadLadder(p) {
  const full = path.resolve(REPO_ROOT, p);
  if (!fs.existsSync(full)) die(`no ladder at ${p}. Copy kit/templates/evidence/evidence-ladder.template.yaml there to start one.`);
  const parsed = readYAMLFile(full);
  if (!parsed.ok || !parsed.data) die(`could not parse ${p}`);
  const errs = ladderLib.validateLadder(parsed.data);
  if (errs.length) die(`${p}: ${errs.join('; ')}`);
  return parsed.data;
}

function loadRecords(ladder) {
  const dir = path.resolve(REPO_ROOT, ladder.records_dir || '.');
  if (!fs.existsSync(dir)) die(`records_dir ${ladder.records_dir} does not exist`);
  return fs.readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort().map((f) => {
    const full = path.join(dir, f);
    const parsed = readYAMLFile(full);
    if (!parsed.ok || !parsed.data) die(`could not parse ${path.relative(REPO_ROOT, full)}`);
    return { file: path.relative(REPO_ROOT, full), rec: parsed.data, sha: crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex') };
  });
}

/**
 * Records a person did not confirm must stand on the ladder instead. When the
 * ladder names a gate (gate.rung + gate.when), every record matching gate.when
 * must reach gate.rung — otherwise it claims a confirmation it has not earned.
 */
function gateViolations(ladder, graded) {
  if (!ladder.gate || !ladder.gate.rung) return [];
  const need = ladder.rungs.findIndex((r) => r.id === ladder.gate.rung);
  if (need < 0) die(`gate.rung ${ladder.gate.rung} is not a rung of this ladder`);
  return graded.filter((g) => (!ladder.gate.when || ladderLib.evalCond(ladder.gate.when, g.record, null)) && g.index < need);
}

const ladderPath = opt('--ladder') || 'canon/evidence-ladder.yaml';
const ladder = loadLadder(ladderPath);

if (flag('--self-test')) {
  const r = ladderLib.selfTest(ladder);
  for (const t of r.results) process.stdout.write(`${t.ok ? 'PASS' : 'FAIL'}  ${t.name} (got ${t.got}, want ${t.expect})\n`);
  for (const e of r.errors) process.stdout.write(`FAIL  ${e}\n`);
  process.stdout.write(r.ok ? `self-test: ${r.results.length} fixture(s) passed\n` : 'self-test: FAILED\n');
  process.exit(r.ok ? 0 : 1);
}

const loaded = loadRecords(ladder);
const graded = ladderLib.gradeRecords(ladder, loaded.map((l) => l.rec));
const idPath = ladder.id_path || 'id';
const violations = gateViolations(ladder, graded);

if (flag('--json')) {
  process.stdout.write(JSON.stringify({
    ladder: ladder.ladder || ladderPath,
    records: graded.map((g, i) => ({ id: ladderLib.getPath(g.record, idPath), file: loaded[i].file, rung: g.rung, why: g.reasons, next: g.next })),
    gate_violations: violations.map((g) => ladderLib.getPath(g.record, idPath)),
  }, null, 2) + '\n');
} else {
  const counts = {};
  for (const r of ladder.rungs) counts[r.id] = 0;
  graded.forEach((g) => {
    counts[g.rung]++;
    process.stdout.write(`${g.rung}  ${ladderLib.getPath(g.record, idPath)}\n      why:  ${g.reasons.join('; ') || '—'}\n      next: ${g.next}\n`);
  });
  process.stdout.write(`\n${graded.length} record(s): ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(' ')}\n`);
  for (const v of violations) {
    process.stdout.write(`GATE  ${ladderLib.getPath(v.record, idPath)} is confirmed by the gate but sits at ${v.rung}, below ${ladder.gate.rung}\n`);
  }
}

if (flag('--write')) {
  if (!ladder.output) die('--write needs `output:` in the ladder');
  const lines = [
    `# GENERATED by kit/scripts/cwos-evidence.js --write from ${ladderPath}. Do not hand-edit; re-run.`,
    '# A grade is computed from the record, never asserted. record_sha256 pins the bytes graded.',
    `ladder_sha256: "${crypto.createHash('sha256').update(fs.readFileSync(path.resolve(REPO_ROOT, ladderPath))).digest('hex')}"`,
    'records:',
  ];
  graded.forEach((g, i) => {
    lines.push(`  - id: ${JSON.stringify(ladderLib.getPath(g.record, idPath))}`);
    lines.push(`    rung: ${g.rung}`);
    lines.push(`    why: ${JSON.stringify(g.reasons.join('; '))}`);
    lines.push(`    next: ${JSON.stringify(g.next)}`);
    lines.push(`    record_sha256: "${loaded[i].sha}"`);
  });
  // writeFileAtomic, not raw fs.writeFileSync (INV-078; WS-986 after MIS-015 put
  // the release PR in the tap lane while atomic-state-writes was RED). The output
  // is a committed gate artifact — record_sha256 pins that later runs and reviews
  // trust — so a power cut mid-write on G16 must leave the previous grades or the
  // new ones, never a truncated file that reads as fewer graded records.
  writeFileAtomic(path.resolve(REPO_ROOT, ladder.output), lines.join('\n') + '\n');
  process.stdout.write(`wrote ${ladder.output}\n`);
}

process.exit(violations.length ? 1 : 0);
