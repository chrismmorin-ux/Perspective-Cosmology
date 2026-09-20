#!/usr/bin/env node
/**
 * cwos-runs — answer "has an engine already examined X, and where did the
 * output land?" (WS-702).
 *
 * THE FAILURE THIS CLOSES
 *
 *   Engine runs are the most expensive artifact CWOS produces. On 2026-08-22 a
 *   ServeYourNote session re-derived pricing research from the open web because
 *   it could not find the run that had already done it. It searched queue/,
 *   ops/financials/ and system/decisions.md, found DEC-011 and no engine output,
 *   and concluded none existed.
 *
 *   runs-index.yaml already recorded every run. Five files in the repo referenced
 *   it and all five were WRITERS — nothing read it to answer a question. The
 *   index was not missing; the query was.
 *
 * WHY IT READS FILES ITSELF
 *
 *   No shell-out to rg/grep/find. Kit scripts install into adopted repos on
 *   machines that guarantee none of them, and `target` in the index is free text
 *   ("SPR-candidate (5 items)"), so matching the index alone re-creates the bug —
 *   the pricing analysis lived in the artifact BODIES, not the target field.
 *   Measured before choosing: 186 artifact files, 3.4 MB, across every run
 *   including the archive. Node reads that in well under a second.
 *
 * WHY AN EMPTY RESULT IS LOUD
 *
 *   Per FAIL-018 / INV-088: a search that finds nothing must never be reportable
 *   as "nothing exists". Zero hits prints what was searched — the index path, the
 *   run count, the file count, the terms — so the reader can see the instrument
 *   before trusting the negative. That is the whole lesson of the incident this
 *   script exists for.
 *
 * Exit codes: 0 ok (including zero matches) | 2 invalid arg (ADR-063).
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const {
  readYAMLFile,
  findWorkstreamDir,
  tokenize,
} = require('./lib/cwos-utils');

// Words that carry no discriminating power in an engine target.
const STOPWORDS = [
  'the', 'a', 'an', 'and', 'or', 'of', 'for', 'to', 'in', 'on', 'is', 'it',
  'this', 'that', 'with', 'run', 'engine', 'analysis',
];

// Artifact extensions worth reading. Everything an engine writes is one of these.
const BODY_EXT = new Set(['.md', '.yaml', '.yml']);

const USAGE = `cwos-runs — has an engine already examined this, and where did the output land?

usage:
  cwos-runs find [--target <text>] [--engine <id>] [--since <days>]
                 [--index-only] [--min-score <0-1>] [--limit <n>] [--json]
  cwos-runs list [--json]

find    search prior engine runs by topic. Reads runs-index.yaml AND the run
        artifact bodies, because the index's \`target\` is free text and the
        analysis you are looking for is usually in the artifacts.
list    every indexed run, newest first.

options:
  --target <text>   what you are about to analyse. Free text; tokens are matched
                    against engine, target, and (unless --index-only) artifact bodies.
  --engine <id>     restrict to one engine id.
  --since <days>    only runs from the last N days.
  --index-only      skip artifact bodies. Faster, shallower, and the shape that
                    missed the pricing run — use deliberately.
  --min-score <0-1> match floor (default 0.5). One incidental token is not a
                    match; lower it to widen a search that came back empty.
  --limit <n>       cap results (default 10).
  --json            machine-readable output.
  -h, --help        print this usage and exit without acting.

A run indexed \`abandoned\` is UNHARVESTED work, not absent work: its findings may
exist only in artifacts that were never sealed. Those sort first.

exit 0 — searched (including zero matches)
exit 2 — malformed command line`;

const SUBCOMMAND_FLAGS = {
  find: new Set(['--target', '--engine', '--since', '--index-only', '--min-score', '--limit', '--json', '--workstream-dir']),
  list: new Set(['--json', '--workstream-dir']),
};
const VALUE_FLAGS = new Set(['--target', '--engine', '--since', '--min-score', '--limit', '--workstream-dir']);

function die(msg) {
  process.stderr.write(`cwos-runs: ${msg}\n`);
  process.exit(2);
}

/** Recursive walk. Returns absolute paths of readable body files. */
function walkBodies(dir, out, budget) {
  if (out.length >= budget) return out;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (out.length >= budget) return out;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkBodies(full, out, budget);
    else if (BODY_EXT.has(path.extname(e.name).toLowerCase())) out.push(full);
  }
  return out;
}

/**
 * Where a run's output actually lives. Indexed runs may have been archived to
 * runs/archive/<year>/<run_id>/, so a miss at the hot path is not absence.
 */
function resolveRunDir(runsDir, runId) {
  const hot = path.join(runsDir, runId);
  if (fs.existsSync(hot)) return hot;
  const archive = path.join(runsDir, 'archive');
  let years;
  try { years = fs.readdirSync(archive, { withFileTypes: true }); } catch { return null; }
  for (const y of years) {
    if (!y.isDirectory()) continue;
    const cold = path.join(archive, y.name, runId);
    if (fs.existsSync(cold)) return cold;
  }
  return null;
}

/**
 * Fraction of the query's tokens present in the text. Coverage, not Jaccard:
 * a three-word query against a 4,000-word briefing scores ~0 on Jaccard purely
 * because of the size difference, which would hide every real match.
 */
function coverage(queryTokens, text) {
  if (!queryTokens.size) return 0;
  const T = tokenize(text, STOPWORDS);
  let hit = 0;
  for (const q of queryTokens) if (T.has(q)) hit++;
  return hit / queryTokens.size;
}

function loadRuns(wsDir) {
  const indexPath = path.join(wsDir, 'runs-index.yaml');
  const read = readYAMLFile(indexPath);
  if (!read.ok || !read.data) return { indexPath, runs: [], readable: false };
  const runs = Array.isArray(read.data.runs) ? read.data.runs : [];
  return { indexPath, runs, readable: true };
}

function search(wsDir, opts) {
  const runsDir = path.join(wsDir, 'runs');
  const { indexPath, runs, readable } = loadRuns(wsDir);
  const queryTokens = tokenize(opts.target || '', STOPWORDS);
  const now = Date.now();

  let filesRead = 0;
  const results = [];

  for (const r of runs) {
    if (!r || !r.run_id) continue;
    const runId = String(r.run_id).replace(/^"|"$/g, '');
    const engine = String(r.engine || '').replace(/^"|"$/g, '');
    const target = String(r.target || '').replace(/^"|"$/g, '');
    const status = String(r.status || 'unknown').replace(/^"|"$/g, '');
    const date = String(r.date || '').replace(/^"|"$/g, '');

    if (opts.engine && engine.toLowerCase() !== opts.engine.toLowerCase()) continue;
    if (opts.since && date) {
      const age = (now - Date.parse(date)) / 86400000;
      if (Number.isFinite(age) && age > opts.since) continue;
    }

    const dir = resolveRunDir(runsDir, runId);
    const bodies = dir && !opts.indexOnly ? walkBodies(dir, [], 400) : [];
    const artifacts = dir ? walkBodies(dir, [], 400) : [];

    // Index match is worth more than an incidental body mention: the target
    // field is what the run was ABOUT, a body hit may be a passing reference.
    const indexScore = coverage(queryTokens, `${engine} ${target} ${runId}`);
    let bodyScore = 0;
    const matchedFiles = [];
    for (const f of bodies) {
      let text;
      try { text = fs.readFileSync(f, 'utf8'); } catch { continue; }
      filesRead++;
      const s = coverage(queryTokens, text);
      if (s > 0) {
        matchedFiles.push({ file: path.relative(wsDir, f).replace(/\\/g, '/'), score: Number(s.toFixed(3)) });
        if (s > bodyScore) bodyScore = s;
      }
    }

    const score = Math.max(indexScore, bodyScore * 0.75);
    // A floor, because one incidental token is not a match. Without it a
    // two-word query returned 16 of 26 runs — noise that hides the real hit as
    // effectively as returning nothing does.
    if (queryTokens.size && score < opts.minScore) continue;

    matchedFiles.sort((a, b) => b.score - a.score);
    results.push({
      run_id: runId,
      engine,
      target,
      date,
      status,
      findings_count: r.findings_count === undefined ? null : r.findings_count,
      work_items_created: r.work_items_created === undefined ? null : r.work_items_created,
      output_dir: dir ? path.relative(wsDir, dir).replace(/\\/g, '/') : null,
      artifact_count: artifacts.length,
      matched_in: opts.indexOnly ? [] : matchedFiles.slice(0, 5),
      matched_on: indexScore >= bodyScore * 0.75 ? 'index' : 'artifact-body',
      score: Number(score.toFixed(3)),
    });
  }

  // Abandoned first — unharvested work is the most valuable thing to surface,
  // and the easiest to mistake for absent work.
  results.sort((a, b) => {
    const aa = a.status === 'abandoned' ? 1 : 0;
    const bb = b.status === 'abandoned' ? 1 : 0;
    if (aa !== bb) return bb - aa;
    if (b.score !== a.score) return b.score - a.score;
    return String(b.date).localeCompare(String(a.date));
  });

  return {
    scope: {
      index: path.relative(wsDir, indexPath).replace(/\\/g, '/'),
      index_readable: readable,
      runs_indexed: runs.length,
      artifact_files_read: filesRead,
      index_only: !!opts.indexOnly,
      min_score: opts.minScore,
      terms: Array.from(queryTokens),
    },
    matches: results.slice(0, opts.limit),
    total_matches: results.length,
  };
}

function renderFind(out) {
  const L = [];
  const s = out.scope;

  if (!s.index_readable) {
    L.push('runs-index.yaml could not be read — every prior run is invisible to this query.');
    L.push(`  expected at: ${s.index}`);
    L.push('  That is a fact about the index, NOT about whether prior runs exist.');
    return L.join('\n');
  }

  if (!out.matches.length) {
    // The whole point. A negative is only as good as the search behind it.
    L.push('No prior run matched. What was searched:');
    L.push(`  index          ${s.index} (${s.runs_indexed} run(s))`);
    L.push(`  artifact files ${s.index_only ? 'SKIPPED (--index-only)' : s.artifact_files_read + ' read'}`);
    L.push(`  terms          ${s.terms.length ? s.terms.join(', ') : '(none — no --target given)'}`);
    L.push(`  match floor    ${s.min_score}  (lower with --min-score to widen)`);
    L.push('');
    if (s.index_only) {
      L.push('  --index-only matched the free-text target field alone. The analysis you');
      L.push('  are looking for usually lives in the artifact bodies; re-run without it');
      L.push('  before concluding the work was never done.');
    } else {
      L.push('  This is evidence about these terms, not proof no prior work exists.');
      L.push('  Try broader terms before re-deriving anything expensive.');
    }
    return L.join('\n');
  }

  L.push(`${out.total_matches} prior run(s) matched — showing ${out.matches.length}:`);
  L.push('');
  for (const m of out.matches) {
    const flag = m.status === 'abandoned' ? '  [ABANDONED — unharvested, not absent]' : '';
    const when = m.date ? String(m.date).slice(0, 10) : 'date unrecorded';
    L.push(`  ${m.run_id}  ${m.engine || '(engine unrecorded)'}  (${when})${flag}`);
    L.push(`    target    ${m.target || '(none recorded)'}`);
    L.push(`    status    ${m.status} · ${m.findings_count === null ? '?' : m.findings_count} finding(s) · matched on ${m.matched_on}`);
    if (m.output_dir) {
      L.push(`    output    ${m.output_dir}/  (${m.artifact_count} file(s))`);
      if (m.artifact_count === 0) {
        L.push('              ^ sealed with NO artifacts on disk — the run-004 shape.');
        L.push('                Its analysis may exist only in a lost transcript.');
      }
    } else {
      L.push('    output    DIRECTORY MISSING — indexed but nothing on disk.');
    }
    for (const f of m.matched_in) L.push(`    hit       ${f.file}`);
    L.push('');
  }
  L.push(`Searched ${s.runs_indexed} indexed run(s), ${s.artifact_files_read} artifact file(s).`);
  return L.join('\n');
}

function renderList(runs, wsDir) {
  if (!runs.length) return 'No runs indexed.';
  const L = [`${runs.length} indexed run(s), newest first:`, ''];
  const sorted = runs.slice().sort((a, b) =>
    String(b.date || '').localeCompare(String(a.date || '')));
  for (const r of sorted) {
    const id = String(r.run_id || '?').replace(/^"|"$/g, '');
    const eng = String(r.engine || '?').replace(/^"|"$/g, '');
    const tgt = String(r.target || '').replace(/^"|"$/g, '');
    const st = String(r.status || '?').replace(/^"|"$/g, '');
    L.push(`  ${id.padEnd(28)} ${eng.padEnd(20)} ${st.padEnd(10)} ${String(r.date || '').slice(0, 10)}  ${tgt}`);
  }
  return L.join('\n');
}

function main() {
  const argv = process.argv.slice(2);

  if (argv.includes('-h') || argv.includes('--help')) {
    process.stdout.write(USAGE + '\n');
    process.exit(0);
  }
  if (!argv.length) {
    process.stdout.write(USAGE + '\n');
    process.exit(2);
  }

  const sub = argv[0];
  if (!Object.prototype.hasOwnProperty.call(SUBCOMMAND_FLAGS, sub)) {
    die(`unknown subcommand "${sub}". Expected: find | list. See --help.`);
  }
  const allowed = SUBCOMMAND_FLAGS[sub];

  const opts = { limit: 10, indexOnly: false, json: false, minScore: 0.5 };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) die(`unexpected argument "${a}". See --help.`);
    if (!allowed.has(a)) {
      die(`unknown flag "${a}" for "${sub}". Allowed: ${Array.from(allowed).sort().join(' ')}`);
    }
    if (VALUE_FLAGS.has(a)) {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) die(`${a} requires a value.`);
      if (a === '--target') opts.target = v;
      if (a === '--engine') opts.engine = v;
      if (a === '--workstream-dir') opts.wsDir = path.resolve(v);
      if (a === '--since') {
        opts.since = Number(v);
        if (!Number.isFinite(opts.since) || opts.since <= 0) die('--since must be a positive number of days.');
      }
      if (a === '--min-score') {
        opts.minScore = Number(v);
        if (!Number.isFinite(opts.minScore) || opts.minScore < 0 || opts.minScore > 1) {
          die('--min-score must be between 0 and 1.');
        }
      }
      if (a === '--limit') {
        opts.limit = Number(v);
        if (!Number.isInteger(opts.limit) || opts.limit <= 0) die('--limit must be a positive integer.');
      }
    } else {
      if (a === '--index-only') opts.indexOnly = true;
      if (a === '--json') opts.json = true;
    }
  }

  const wsDir = opts.wsDir || findWorkstreamDir(process.cwd());
  if (!wsDir || !fs.existsSync(wsDir)) {
    process.stderr.write('cwos-runs: no workstream directory found — nothing to search.\n');
    process.exit(0);
  }

  if (sub === 'list') {
    const { runs } = loadRuns(wsDir);
    process.stdout.write(
      (opts.json ? JSON.stringify({ total: runs.length, runs }, null, 2) : renderList(runs, wsDir)) + '\n'
    );
    process.exit(0);
  }

  const out = search(wsDir, opts);
  process.stdout.write((opts.json ? JSON.stringify(out, null, 2) : renderFind(out)) + '\n');
  process.exit(0);
}

if (require.main === module) main();

module.exports = { coverage, resolveRunDir, search, walkBodies, STOPWORDS };
