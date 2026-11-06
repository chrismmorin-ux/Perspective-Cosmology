#!/usr/bin/env node
/**
 * cwos-usage-derive — usage.yaml counters computed from disk, not remembered.
 *
 * The counters used to be incremented by prose ("update usage.yaml silently").
 * The 2026-10-10 fleet probe measured that: across 14 adopted repos usage.yaml
 * recorded 224 of 3,166 events (7%), and no script wrote the counters at all
 * (fleet/outbox/compliance-probe-recording-2026-10-10.md). The artifacts are the
 * truth (runs/, sessions/, decisions.md, queue/), so the counters are derived
 * from them: they cannot drift, and no model has to remember to bump them.
 *
 *   cwos-usage-derive            print the derived counts (and whether usage.yaml differs)
 *   cwos-usage-derive --write    write them into usage.yaml (no-op when unchanged)
 *   --json / --quiet
 *
 * Owns exactly: command_usage.engine, value_ledger.total_items_completed,
 * value_ledger.decisions_recorded, the per-engine runs/last_run in engine_runs:,
 * and a derived: block. The edit is LINE-LEVEL, never a whole-file re-serialize:
 * comments and every other field stay byte-identical, and the result is re-read
 * and compared before it is written (refuses on any unintended difference).
 * No timestamp is written, so two nodes deriving the same counts write the same
 * bytes. Run by the SessionStart hook (install-claude-hooks KIT_HOOKS).
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { cliGate } = require('./lib/cli');
const {
  findWorkstreamDir, readYAMLFile, parseYAML, writeFileAtomic, boundedSystemDir, makeEventEmitter,
} = require('./lib/cwos-utils');

const emitEvent = makeEventEmitter();

const CLI = {
  name: 'cwos-usage-derive',
  summary: 'compute usage.yaml counters from the artifacts on disk',
  usage: 'cwos-usage-derive [--write] [--json] [--quiet]',
  flags: {
    write: { type: 'boolean', describe: 'write the derived counts into usage.yaml (no-op when unchanged)' },
    json: { type: 'boolean', describe: 'machine-readable output' },
    quiet: { type: 'boolean', describe: 'print nothing unless something fails' },
  },
};

const DECISION_HEAD = /^#{2,4}\s+(?:(?:ADR|DEC|D)-?\d+|\d{4}-\d{2}-\d{2})/gm;
const DONE = /^status:\s*['"]?done\b/m;
const DERIVED_NOTE = '# computed from disk by cwos-usage-derive at session start; hand edits are overwritten';

// ─── counting ───────────────────────────────────────────────────────────────

const listDir = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []);

function walkFiles(dir, pred, out = []) {
  for (const ent of listDir(dir)) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(p, pred, out);
    else if (pred(ent.name)) out.push(p);
  }
  return out;
}

/** Run dirs are the direct children of runs/ and runs/archive/ — never their subfolders. */
function runDirs(wsDir) {
  const base = path.join(wsDir, 'runs');
  return [base, path.join(base, 'archive')].flatMap((d) => listDir(d)
    .filter((e) => e.isDirectory() && e.name.startsWith('run'))
    .map((e) => path.join(d, e.name)));
}

function systemDir(repoRoot) {
  const cfg = readYAMLFile(path.join(repoRoot, '.cwos-config.yaml'));
  const name = cfg.ok && cfg.data && cfg.data.system_dir ? cfg.data.system_dir : 'system';
  return path.join(repoRoot, boundedSystemDir(name));
}

function perEngine(runs) {
  const by = {};
  for (const dir of runs) {
    const m = readYAMLFile(path.join(dir, 'manifest.yaml'));
    const engine = m.ok && m.data && typeof m.data.engine === 'string' && m.data.engine ? m.data.engine : null;
    if (!engine) continue;
    const started = m.data.started_at ? String(m.data.started_at).slice(0, 10) : '';
    const e = (by[engine] = by[engine] || { runs: 0, last_run: '' });
    e.runs += 1;
    if (started > e.last_run) e.last_run = started;
  }
  return by;
}

/** Count the artifacts. Mirrors fleet/autonomous-lane/scripts/probe-recording.py. */
function deriveCounts(wsDir, repoRoot) {
  const runs = runDirs(wsDir);
  const sessions = walkFiles(path.join(wsDir, 'sessions'), (n) => /\.ya?ml$/.test(n));
  const decPath = path.join(systemDir(repoRoot), 'decisions.md');
  const decisions = fs.existsSync(decPath)
    ? (fs.readFileSync(decPath, 'utf8').match(DECISION_HEAD) || []).length : 0;
  const done = walkFiles(path.join(wsDir, 'queue'), (n) => /^WS-.*\.ya?ml$/.test(n))
    .filter((p) => DONE.test(fs.readFileSync(p, 'utf8'))).length;
  return {
    counts: { engine_runs: runs.length, sessions: sessions.length, decisions, items_done: done },
    engines: perEngine(runs),
  };
}

// ─── line-level editing (pure) ──────────────────────────────────────────────

const isTop = (line) => /^\S/.test(line) && !/^#/.test(line);
const topKeyRe = (key) => new RegExp(`^${key}:(\\s.*)?$`);

/** [start, end) line range of top-level `key:`'s block; end stops at the next column-0 line. */
function blockRange(lines, key) {
  const start = lines.findIndex((l) => topKeyRe(key).test(l));
  if (start < 0) return null;
  let end = start + 1;
  while (end < lines.length && !/^\S/.test(lines[end])) end++;
  while (end > start + 1 && lines[end - 1].trim() === '') end--; // leave trailing blanks outside
  return [start, end];
}

/** Set `parent.key: value` in place, keeping any trailing comment; insert it when absent. */
function setScalar(lines, parent, key, value) {
  let r = blockRange(lines, parent);
  if (!r) { lines.push(`${parent}:`, `  ${key}: ${value}`); return; }
  const [s, e] = r;
  const child = lines.slice(s + 1, e).find((l) => /^\s+[A-Za-z_]/.test(l));
  const indent = child ? child.match(/^(\s+)/)[1] : '  ';
  const re = new RegExp(`^${indent}${key}:(\\s*)([^#]*?)(\\s+#.*)?$`);
  for (let i = s + 1; i < e; i++) {
    const m = lines[i].match(re);
    if (m) { lines[i] = `${indent}${key}: ${value}${m[3] || ''}`; return; }
  }
  lines.splice(s + 1, 0, `${indent}${key}: ${value}`);
}

/** Replace (or append) a whole top-level block with generated lines. */
function setBlock(lines, key, blockLines) {
  const r = blockRange(lines, key);
  if (!r) {
    if (lines.length && lines[lines.length - 1].trim() !== '') lines.push('');
    lines.push(...blockLines);
    return;
  }
  lines.splice(r[0], r[1] - r[0], ...blockLines);
}

function engineRunsBlock(engines, existing) {
  const out = [`engine_runs:  ${DERIVED_NOTE}`];
  const names = Object.keys(engines).sort();
  if (!names.length) return [`engine_runs: {}  ${DERIVED_NOTE}`];
  for (const name of names) {
    out.push(`  ${name}:`);
    out.push(`    runs: ${engines[name].runs}`);
    out.push(`    last_run: "${engines[name].last_run}"`);
    // keep fields the disk cannot derive (findings_generated, items_created, ...)
    const prev = existing && typeof existing[name] === 'object' ? existing[name] : {};
    for (const [k, v] of Object.entries(prev)) {
      if (k === 'runs' || k === 'last_run') continue;
      if (typeof v === 'number' || typeof v === 'boolean') out.push(`    ${k}: ${v}`);
      else if (typeof v === 'string') out.push(`    ${k}: ${JSON.stringify(v)}`);
    }
  }
  return out;
}

/** Pure: original text -> updated text. */
function applyToText(text, derived, parsed) {
  const { counts, engines } = derived;
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const trailingNewline = lines.length && lines[lines.length - 1] === '';
  if (trailingNewline) lines.pop();
  setScalar(lines, 'command_usage', 'engine', counts.engine_runs);
  setScalar(lines, 'value_ledger', 'total_items_completed', counts.items_done);
  setScalar(lines, 'value_ledger', 'decisions_recorded', counts.decisions);
  setBlock(lines, 'engine_runs', engineRunsBlock(engines, parsed && parsed.engine_runs));
  setBlock(lines, 'derived', [
    `derived:  ${DERIVED_NOTE}`,
    `  engine_runs: ${counts.engine_runs}`,
    `  sessions: ${counts.sessions}`,
    `  decisions: ${counts.decisions}`,
    `  items_done: ${counts.items_done}`,
  ]);
  return lines.join('\n') + '\n';
}

/** Everything except the owned fields must read back identically. */
function unintendedChanges(before, after) {
  const strip = (d) => {
    const c = JSON.parse(JSON.stringify(d || {}));
    delete c.engine_runs; delete c.derived;
    if (c.command_usage) delete c.command_usage.engine;
    if (c.value_ledger) { delete c.value_ledger.total_items_completed; delete c.value_ledger.decisions_recorded; }
    return c;
  };
  const a = strip(before); const b = strip(after);
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
}

// ─── main ───────────────────────────────────────────────────────────────────

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);
  let wsDir;
  try { wsDir = findWorkstreamDir(process.cwd()); } catch {
    if (!values.quiet) process.stderr.write('cwos-usage-derive: not inside a CWOS repo; nothing to do\n');
    return;
  }
  // State and the decisions it counts come from the SAME tree. From a linked
  // worktree findWorkstreamDir resolves to the primary tree's state (WS-576), so
  // decisions.md is read there too — otherwise the count would follow whichever
  // branch the worktree has checked out and flip-flop between trees.
  const repoRoot = path.resolve(wsDir, '..', '..');
  const usagePath = path.join(wsDir, 'usage.yaml');
  const derived = deriveCounts(wsDir, repoRoot);
  const { counts } = derived;

  let changed = false; let wrote = false;
  if (fs.existsSync(usagePath)) { // creating usage.yaml is /adopt's job, never this hook's
    const text = fs.readFileSync(usagePath, 'utf8');
    const before = readYAMLFile(usagePath);
    const next = applyToText(text, derived, before.ok ? before.data : null);
    changed = next !== text.replace(/\r\n/g, '\n');
    if (values.write && changed) {
      // Check the edit in memory before anything touches disk.
      let after;
      try { after = { ok: true, data: parseYAML(next, []) }; } catch { after = { ok: false, data: null }; }
      const diff = before.ok && after.ok ? unintendedChanges(before.data, after.data) : ['(unparseable)'];
      const ok = after.ok && after.data && after.data.command_usage
        && after.data.command_usage.engine === counts.engine_runs && diff.length === 0;
      if (!ok) {
        process.stderr.write(`cwos-usage-derive: refusing to write usage.yaml — the edit would change ${diff.join(', ') || 'the derived fields incorrectly'}\n`);
        process.exitCode = 1;
      } else {
        writeFileAtomic(usagePath, next);
        emitEvent('T6:workstream', 'usage-derived', { type: 'usage_derived', ...counts });
        wrote = true;
      }
    }
  }

  if (values.quiet) return;
  if (values.json) { process.stdout.write(JSON.stringify({ counts, engines: derived.engines, changed, wrote }) + '\n'); return; }
  process.stdout.write(`derived from disk: ${counts.engine_runs} engine runs, ${counts.sessions} sessions, `
    + `${counts.decisions} decisions, ${counts.items_done} items done`
    + `${wrote ? ' (usage.yaml updated)' : changed ? ' (usage.yaml differs; --write to update)' : ' (usage.yaml current)'}\n`);
}

if (require.main === module) main();

module.exports = { deriveCounts, applyToText, setScalar, setBlock, unintendedChanges, runDirs };
