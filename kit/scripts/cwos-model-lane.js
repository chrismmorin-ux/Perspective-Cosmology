#!/usr/bin/env node
/**
 * cwos-model-lane — which model each queue item's work should run on (WS-1170).
 *
 *   classify <WS-NNN>   print the lane the structural ladder assigns, and the signal that decided it
 *   backfill            give every OPEN item a model_lane (+ model_lane_source: rule)
 *                       --dry-run  report, write nothing
 *                       --check  exit 1 if any open item lacks a lane, holds an unknown lane, holds an invalid/missing
 *                       lane under a founder/trial source, or any OPEN queue file fails to parse, has no id, or duplicates id/status/model_lane/model_lane_source
 *                       (other parse warnings, e.g. a duplicate notes:, are listed, never fatal)
 *                       --reclassify  also rewrite rule-sourced lanes the ladder now disagrees with
 *                       --dir <queue dir>  --json
 *   resolve [lane]      lane -> model from fleet/anchors/routing-ledger.yaml (all lanes when omitted)
 *   lower <lane> <model[@effort]>   set a lane's tier in the ledger — REFUSED below baseline
 *                       unless a passing anchor trial is on record (--dry-run to only ask)
 *   check               validate the ledger's lane entries (INV-098 runs the same check)
 *
 * WHY. Measured 2026-10-09..15 (cwos-resource-board, WS-1169): Opus did 99% of token
 * volume and 72% of 321 helper dispatches named no model, inheriting Opus. Nothing on a
 * queue item said what model its work needed, so nothing could choose. The lane is that
 * statement; the ledger is the only place a lane's model lives; and a cheaper model is
 * earned by a scored trial, never by rule (founder ruling 2026-10-15). See
 * lib/model-lane.js for the ladder and the gate.
 *
 * WHAT BACKFILL NEVER DOES
 *   - overwrite a lane whose source is `founder` or `trial` (a person or a measurement
 *     put it there; a rule does not outrank either);
 *   - touch a closed item — its fields are a record of how the work was routed then.
 *
 * EXIT CODES: 0 ok, 1 --check found unlabelled/unknown-lane/kept-source-invalid items or unparseable/id-less open queue files
 * (warnings alone never fail) / a refusal / an invalid ledger, 2 usage.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { cliGate } = require('./lib/cli');
const { findWorkstreamDir, readYAMLFile, writeFileAtomic, loadEventDeps } = require('./lib/cwos-utils');
const { resolveHomeBaseRoot, resolveRepoRoot } = require('./lib/kit-paths');
const ml = require('./lib/model-lane');

const CLI = {
  name: 'cwos-model-lane',
  summary: 'model lane per queue item, and the trial-gated lane -> model routing',
  usage: 'cwos-model-lane <classify|backfill|resolve|lower|check> [args] [options]',
  subcommands: {
    classify: 'classify <WS-NNN>: the lane the ladder assigns and the signal that decided it',
    backfill: 'write model_lane onto every open item that lacks one (--dry-run, --check, --reclassify)',
    resolve: 'resolve [lane]: lane -> model from the routing ledger',
    lower: 'lower <lane> <model[@effort]>: set a lane tier; refused below baseline without a passing trial',
    check: 'validate the routing ledger lane entries',
  },
  flags: {
    'dry-run': { type: 'boolean', describe: 'backfill/lower: report what would change, write nothing' },
    check: { type: 'boolean', describe: 'backfill: exit 1 if any open item lacks a model_lane' },
    reclassify: { type: 'boolean', describe: 'backfill: also rewrite rule-sourced lanes the ladder now disagrees with' },
    dir: { type: 'string', describe: 'queue directory (default: this repo .claude/workstream/queue)' },
    homebase: { type: 'string', describe: 'HomeBase root holding fleet/anchors/routing-ledger.yaml' },
    json: { type: 'boolean', describe: 'machine-readable output' },
  },
};

const CLOSED = new Set([
  'done', 'completed', 'dismissed', 'decomposed', 'cancelled', 'canceled', 'superseded',
  'wontfix', 'closed', 'merged', 'archived', 'duplicate', 'skipped',
]);
const KEPT_SOURCES = new Set(['founder', 'trial']);

/** At most 15 ids, then a count — --check output must stay readable on a 500-item queue. */
function listIds(ids) { return ids.length > 15 ? `${ids.slice(0, 15).join(', ')}, +${ids.length - 15} more` : ids.join(', '); }

function out(s) { process.stdout.write(s + '\n'); }

/** Top-level scalar from raw YAML text, unquoted, inline comment stripped. */
function scalar(text, key) {
  const m = String(text).match(new RegExp(`^${key}:[ \\t]*([^\\r\\n]*)$`, 'm'));
  if (!m) return null;
  const v = m[1].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
  return v === '' || v === 'null' || v === '~' ? null : v;
}

/**
 * Write (or replace) the two lane lines. Pure; preserves line endings. Inserted after
 * the first of runs_on / effort / priority_score / program / status that exists, so the
 * lane sits beside the other routing fields.
 */
function applyLane(text, lane, source, reason, date) {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const laneLine = `model_lane: "${lane}"   # ${source} ${date}: ${String(reason).replace(/[\r\n#]/g, ' ')}`;
  const srcLine = `model_lane_source: "${source}"`;
  let t = text;
  const hasLane = /^model_lane:.*$/m.test(t);
  const hasSrc = /^model_lane_source:.*$/m.test(t);
  if (hasLane) t = t.replace(/^model_lane:.*$/m, laneLine);
  if (hasSrc) t = t.replace(/^model_lane_source:.*$/m, srcLine);
  if (hasLane && !hasSrc) t = t.replace(/^model_lane:.*$/m, (l) => l + eol + srcLine);
  if (hasLane) return t;
  for (const anchor of ['runs_on', 'effort', 'priority_score', 'program', 'status']) {
    const m = t.match(new RegExp(`^${anchor}:[^\\r\\n]*$`, 'm'));
    if (m) {
      const at = m.index + m[0].length;
      return t.slice(0, at) + eol + laneLine + (hasSrc ? '' : eol + srcLine) + t.slice(at);
    }
  }
  return t.replace(/\s*$/, '') + eol + laneLine + (hasSrc ? '' : eol + srcLine) + eol;
}

function programLanes(repoRoot) {
  if (!repoRoot) return {};
  const f = path.join(repoRoot, '.cwos-config.yaml');
  if (!fs.existsSync(f)) return {};
  const r = readYAMLFile(f);
  const m = r.ok && r.data && r.data.model_lanes && r.data.model_lanes.programs;
  return m && typeof m === 'object' ? m : {};
}

function queueDirFrom(values) {
  if (values.dir) return path.resolve(values.dir);
  return path.join(findWorkstreamDir(process.cwd()), 'queue');
}

/**
 * Plan the backfill: one row per open item. Pure over (files, texts).
 * action: keep | write | normalize | reclassify | kept-source | invalid-kept-source | unparseable
 * (unparseable rows are queue files that did not parse or lack an id; they are never written)
 */
function planBackfill(queueDir, opts = {}) {
  const files = fs.readdirSync(queueDir).filter((f) => /^WS-\d+\.yaml$/.test(f)).sort();
  const rows = [];
  for (const f of files) {
    const file = path.join(queueDir, f);
    const text = fs.readFileSync(file, 'utf8');
    const r = readYAMLFile(file);
    if (!r.ok || !r.data || typeof r.data !== 'object' || !r.data.id) {
      // A closed item is never reported, whatever its shape (status read from the raw text when the parse failed).
      const rawStatus = String((r.ok && r.data && r.data.status) || scalar(text, 'status') || '').toLowerCase();
      if (CLOSED.has(rawStatus)) continue;
      // Never skip silently: a file the reader cannot parse is an item nobody can label (and --check must say so).
      const error = !r.ok ? String(r.error || 'YAML parse failed') : 'no id field';
      rows.push({ id: f.replace(/\.yaml$/, ''), file, text, current: null, source: null, lane: null, reason: null, action: 'unparseable', error });
      continue;
    }
    const d = r.data;
    if (CLOSED.has(String(d.status || '').toLowerCase())) continue;
    const warns = Array.isArray(r.warnings) ? r.warnings : [];
    // The lenient reader keeps the LAST duplicate; scalar()/applyLane act on the FIRST line. For the four keys backfill
    // reads or writes that disagreement would mislabel the file, so it is fatal: reported, never written.
    const dup = warns.find((w) => /^duplicate_key:(id|status|model_lane|model_lane_source)$/.test(String(w.reason)));
    if (dup) {
      rows.push({ id: f.replace(/\.yaml$/, ''), file, text, current: null, source: null, lane: null, reason: null, action: 'unparseable',
        error: `duplicate key '${String(dup.reason).split(':')[1]}' (line ${dup.line}) — readers and backfill would disagree on its value` });
      continue;
    }
    // Other warnings (duplicate notes:, orphan items) are reported, never fatal.
    const warning = warns.length ? warns.map((w) => `${w.reason} at line ${w.line}: ${w.snippet}`).join('; ') : null;
    const cls = ml.classifyLane(d, { programLanes: opts.programLanes });
    const current = scalar(text, 'model_lane');
    const source = scalar(text, 'model_lane_source');
    const kept = KEPT_SOURCES.has(String(source || '').trim().toLowerCase());
    let action;
    // Source before validity: a person/measurement put it there, a rule does not outrank either,
    // so an invalid or missing lane from a kept source is reported, never rewritten.
    if (kept && (!current || !ml.LANES.includes(current))) action = 'invalid-kept-source';
    else if (!current) action = 'write';
    else if (!ml.LANES.includes(current)) action = 'normalize';
    else if (kept) action = 'kept-source';
    else if (opts.reclassify && current !== cls.lane) action = 'reclassify';
    else action = 'keep';
    rows.push({ id: d.id, file, text, current, source, lane: cls.lane, reason: cls.reason, action, ...(warning ? { warning } : {}) });
  }
  return rows;
}

function summarize(allRows) {
  const unparseable = allRows.filter((r) => r.action === 'unparseable');
  const rows = allRows.filter((r) => r.action !== 'unparseable');
  const lanes = {};
  for (const r of rows) {
    const final = ['write', 'normalize', 'reclassify'].includes(r.action) ? r.lane : (r.current || r.lane);
    lanes[final] = (lanes[final] || 0) + 1;
  }
  const actions = {};
  for (const r of rows) actions[r.action] = (actions[r.action] || 0) + 1;
  const invalid = rows.filter((r) => r.action === 'invalid-kept-source' || (r.current && !ml.LANES.includes(r.current)));
  if (unparseable.length) actions.unparseable = unparseable.length;
  return {
    open: rows.length, lanes, actions, unlabelled: rows.filter((r) => !r.current && r.action !== 'invalid-kept-source').length,
    invalid: invalid.length, unparseable: unparseable.length, warnings: rows.filter((r) => r.warning).length,
  };
}

function emitBackfilled(queueDir, counts) {
  try {
    const { appendEvent } = loadEventDeps();
    if (!appendEvent) return;
    appendEvent({
      source_track: 'T6:workstream', source_tier: 'reducer-output', track_tag: 'model-lanes-backfilled',
      payload: { type: 'model-lanes-backfilled', ...counts },
    }, { workstreamDir: path.dirname(queueDir) });
  } catch { /* non-fatal (AS-23): the YAML is the record; the event re-materializes state */ }
}

function runBackfill(values) {
  const queueDir = queueDirFrom(values);
  if (!fs.existsSync(queueDir)) { process.stderr.write(`no queue directory: ${queueDir}\n`); process.exit(2); }
  const rows = planBackfill(queueDir, {
    reclassify: !!values.reclassify,
    programLanes: programLanes(resolveRepoRoot({ from: queueDir })),
  });
  const s = summarize(rows);
  const changes = rows.filter((r) => ['write', 'normalize', 'reclassify'].includes(r.action));
  const write = !values['dry-run'] && !values.check;
  if (write && changes.length) {
    const date = new Date().toISOString().slice(0, 10);
    for (const r of changes) {
      const reason = r.action === 'normalize' ? `${r.reason}; was '${r.current}'` : r.reason;
      writeFileAtomic(r.file, applyLane(r.text, r.lane, 'rule', reason, date));
    }
    emitBackfilled(queueDir, { written: changes.length, lanes: s.lanes });
  }
  if (values.json) {
    out(JSON.stringify({ queue_dir: queueDir, wrote: write ? changes.length : 0, ...s,
      rows: rows.map(({ text, file, ...rest }) => rest) }, null, 1));
  } else {
    out(`${s.open} open item(s) in ${queueDir}`);
    out(`lanes${write ? '' : ' (after backfill)'}: ${Object.entries(s.lanes).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}`);
    out(`actions: ${Object.entries(s.actions).map(([k, v]) => `${k} ${v}`).join(', ')}`);
    for (const r of rows.filter((x) => x.action === 'unparseable')) out(`UNPARSEABLE ${path.basename(r.file)}: ${r.error}`);
    for (const r of rows.filter((x) => x.warning)) out(`WARNING ${path.basename(r.file)}: ${r.warning} (read leniently; not a --check failure)`);
    for (const r of rows.filter((x) => x.action === 'invalid-kept-source')) out(`INVALID LANE ${r.id}: '${r.current || '(none)'}' (source ${r.source}) — kept, fix by hand`);
    out(write ? `wrote ${changes.length} item(s)` : `would write ${changes.length} item(s)${values['dry-run'] ? ' (dry run)' : ''}`);
  }
  if (values.check) {
    const msgs = [];
    const unlabelled = rows.filter((r) => r.action !== 'unparseable' && r.action !== 'invalid-kept-source' && !r.current);
    if (unlabelled.length) msgs.push(`${unlabelled.length} open item(s) carry no model_lane (${listIds(unlabelled.map((r) => r.id))}) — run: cwos-model-lane backfill`);
    const kept = rows.filter((r) => r.action === 'invalid-kept-source');
    if (kept.length) msgs.push(`${kept.length} item(s) hold an invalid or missing model_lane under a ${[...KEPT_SOURCES].join('/')} source, which backfill will not overwrite — a person must fix: ${kept.map((r) => `${r.id} '${r.current || '(none)'}' (${r.source})`).join(', ')}`);
    const unknown = rows.filter((r) => r.action !== 'invalid-kept-source' && r.current && !ml.LANES.includes(r.current));
    if (unknown.length) msgs.push(`${unknown.length} item(s) hold an unknown model_lane (valid: ${ml.LANES.join(', ')}): ${unknown.map((r) => `${r.id} '${r.current}'`).join(', ')}`);
    const bad = rows.filter((r) => r.action === 'unparseable');
    if (bad.length) msgs.push(`${bad.length} queue file(s) unparseable or without an id, so cannot be labelled: ${bad.map((r) => `${path.basename(r.file)} (${r.error})`).join(', ')}`);
    if (msgs.length) { process.stderr.write(msgs.join('\n') + '\n'); process.exit(1); }
  }
}

function loadLedger(values) {
  const root = resolveHomeBaseRoot({ homebase: values.homebase });
  const file = ml.ledgerPath(root);
  const r = ml.readLedger(file);
  return { root, file, ...r };
}

function runClassify(values, positionals) {
  const id = positionals[0];
  if (!id) { process.stderr.write('usage: cwos-model-lane classify <WS-NNN>\n'); process.exit(2); }
  const file = path.join(queueDirFrom(values), `${id}.yaml`);
  const r = readYAMLFile(file);
  if (!r.ok || !r.data) { process.stderr.write(`cannot read ${file}: ${r.error || 'empty'}\n`); process.exit(1); }
  const cls = ml.classifyLane(r.data, { programLanes: programLanes(resolveRepoRoot({ from: path.dirname(file) })) });
  const text = fs.readFileSync(file, 'utf8');
  const res = { id, lane: cls.lane, reason: cls.reason, current: scalar(text, 'model_lane'), source: scalar(text, 'model_lane_source') };
  if (values.json) out(JSON.stringify(res)); else out(`${id}: ${cls.lane} — ${cls.reason}${res.current ? ` (on file: ${res.current}, ${res.source || 'no source'})` : ''}`);
}

function runResolve(values, positionals) {
  const L = loadLedger(values);
  if (!L.ok) { process.stderr.write(`REFUSED: ${L.error}\n`); process.exit(1); }
  const lanes = positionals[0] ? [positionals[0]] : ml.LANES;
  const res = lanes.map((l) => ml.resolveLane(l, L.data, L.root));
  if (values.json) out(JSON.stringify(res.map(({ missing, ...r }) => r), null, 1));
  else for (const r of res) out(r.ok ? `${r.lane}: ${ml.displayModel(r)}${r.status ? ` (${r.status})` : ''}` : `${r.lane}: REFUSED — ${r.refused}`);
  if (res.some((r) => !r.ok)) process.exit(1);
}

function runLower(values, positionals) {
  const [lane, target] = positionals;
  if (!lane || !target) { process.stderr.write('usage: cwos-model-lane lower <lane> <model[@effort]> [--dry-run]\n'); process.exit(2); }
  const L = loadLedger(values);
  if (!L.ok) { process.stderr.write(`REFUSED: ${L.error}\n`); process.exit(1); }
  const r = ml.setLaneModel(fs.readFileSync(L.file, 'utf8'), L.data, lane, target, L.root);
  if (!r.ok) { process.stderr.write(`${r.refused}\n`); process.exit(1); }
  if (values['dry-run']) { out(`allowed: lane ${lane} -> ${target} (dry run, ledger unchanged)`); return; }
  writeFileAtomic(L.file, r.content);
  out(`lane ${lane} -> ${target} written to ${L.file}`);
}

function runCheck(values) {
  const L = loadLedger(values);
  if (!L.ok) { process.stderr.write(`REFUSED: ${L.error}\n`); process.exit(1); }
  const c = ml.checkLedger(L.data, L.root);
  if (values.json) out(JSON.stringify(c)); else out(c.ok ? `routing ledger: ${ml.classEntries(L.data).length} classes (${ml.LANES.length} lanes) resolve` : c.problems.map((p) => `FAIL ${p}`).join('\n'));
  if (!c.ok) process.exit(1);
}

function main() {
  const { values, positionals, sub } = cliGate(process.argv.slice(2), CLI);
  switch (sub) {
    case 'classify': return runClassify(values, positionals);
    case 'backfill': return runBackfill(values);
    case 'resolve': return runResolve(values, positionals);
    case 'lower': return runLower(values, positionals);
    case 'check': return runCheck(values);
    default:
      process.stderr.write(`usage: ${CLI.usage}\n`);
      process.exit(2);
  }
}

if (require.main === module) main();

module.exports = { scalar, applyLane, planBackfill, summarize, CLOSED };
