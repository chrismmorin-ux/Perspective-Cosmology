#!/usr/bin/env node
/**
 * cwos-desk — this repo's door to the founder desk: read his answers, put an ask
 * in front of him, publish a brief.
 *
 * The desk (its own repo, founder-desk) is the ONE place a session asks the
 * founder anything. Its design requires every repo's session start to read
 * answers/ and say "N answers waiting"; until WS-945 only ai-personal did, so a
 * decision he tapped on his phone could sit unapplied for days (review run-034
 * finding 6: eleven). The kit preamble names this script; the SessionStart hook
 * installed by install-claude-hooks.mjs runs `answers --quiet`.
 *
 *   answers   For every desk item whose repo is this one:
 *               WAITING   no answer yet
 *               TO APPLY  answered, not closed -- a session must act on it, then close it
 *               RECHECK   answered, but the ask was edited AFTER he answered -- his
 *                         answer may be to words he never read; confirm before applying
 *               CLOSED    applied and closed
 *   ask       Files items/<id>.json on the desk, commits and pushes it to main
 *             (the server pulls main). Same schema and completeness gate as
 *             ai-personal's founder-desk.js ask, minus attachments.
 *   brief     Hands everything after it to the desk's scripts/brief.js.
 *
 * Finds the desk at $FOUNDER_DESK / $FOUNDER_DESK_PATH, else ../founder-desk
 * beside this repo, else the founder-desk path in HomeBase's fleet/registry.yaml.
 * An absent desk is said out loud (BLIND), never read as "nothing answered".
 *
 * This repo's desk name is its fleet registry name, matched by path, else its
 * folder name. Desk rows carry mixed case (AI-Personal, homebase), so the match
 * ignores case.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { cliGate } = require('./lib/cli');
const { findRepoRoot, findWorkstreamDir, readYAMLFile, writeFileAtomic } = require('./lib/cwos-utils');

const NL = String.fromCharCode(10);
const DESK_URL = 'https://cm-node1.tail26f19d.ts.net:8443';
const KINDS = { decide: ['take', 'no', 'other'], fact: ['answer', 'unknown'], do: ['done', 'notyet', 'drop'] };
const LEVELS = ['high', 'medium', 'low'];
const WHERE = ['phone', 'home', 'computer', 'out'];

const CLI = {
  name: 'cwos-desk.js',
  summary: "this repo's door to the founder desk: his answers, a new ask, a brief",
  subcommands: {
    answers: 'answers for this repo: to apply, recheck, waiting, closed (exit 0 always)',
    ask: 'file an ask on the desk (required: --kind --subject --rec --source --impact --risk --minutes --where)',
    brief: "pass everything after it to the desk's scripts/brief.js (publish|list|check|schema)",
  },
  flags: {
    repo: { type: 'string', placeholder: 'name', describe: "desk repo name (default: this repo's fleet name, else its folder name)" },
    json: { type: 'boolean', describe: 'answers: machine-readable output' },
    quiet: { type: 'boolean', describe: 'answers: print only when something is TO APPLY or RECHECK, or the desk is BLIND (SessionStart)' },
    kind: { type: 'string', placeholder: 'decide|do|fact', describe: 'ask: what he is asked to do' },
    subject: { type: 'string', placeholder: 'text', describe: 'ask: one line he can act on without opening anything' },
    rec: { type: 'string', placeholder: 'text', describe: 'ask: your recommendation' },
    source: { type: 'string', placeholder: 'ref', describe: 'ask: where the context lives (a URL, or repo:path)' },
    why: { type: 'string', placeholder: 'text', describe: 'ask: why it reaches him' },
    taken: { type: 'string', placeholder: 'text', describe: 'ask: what happens if he takes it' },
    declined: { type: 'string', placeholder: 'text', describe: 'ask: what happens if he declines' },
    due: { type: 'string', placeholder: 'YYYY-MM-DD', describe: 'ask: a real date, if there is one' },
    project: { type: 'string', placeholder: 'id', describe: 'ask: desk project this ask belongs to' },
    rank: { type: 'string', placeholder: 'n', describe: 'ask: order within its lane' },
    impact: { type: 'string', placeholder: 'high|medium|low', describe: 'ask: what it moves (money, legal, health, unblocking stopped work is high)' },
    risk: { type: 'string', placeholder: 'high|medium|low', describe: 'ask: what goes wrong if it waits' },
    minutes: { type: 'string', placeholder: 'n', describe: 'ask: his own time, whole minutes' },
    where: { type: 'string', placeholder: 'phone|home|computer|out', describe: 'ask: where he can do it' },
    touches: { type: 'string', placeholder: 'text', describe: 'ask: what it touches' },
    'if-waits': { type: 'string', placeholder: 'text', describe: 'ask: the cost of waiting, in words' },
    id: { type: 'string', placeholder: 'id', describe: 'ask: item id (default: <repo>-<subject slug>)' },
    by: { type: 'string', placeholder: 'text', describe: "ask: created_by (default: '<repo> session <date>')" },
    'force-incomplete': { type: 'boolean', describe: "ask: file it even though the desk's completeness check marks it red" },
  },
  notes: [
    'Documents that must travel with an ask: file it here, then attach with the desk tooling (ai-personal founder-desk.js attach).',
    'Contract: founder-desk docs/DESIGN.md §4; HomeBase WS-945.',
  ],
};

/** Where this checkout's primary worktree lives — the path the registry knows. */
function primaryRoot(repo) {
  const ws = findWorkstreamDir(repo);
  return ws ? path.resolve(ws, '..', '..') : repo;
}

function homebaseOf(primary) {
  if (fs.existsSync(path.join(primary, 'fleet', 'registry.yaml'))) return primary;
  const vf = path.join(primary, '.cwos-version');
  if (fs.existsSync(vf)) {
    const r = readYAMLFile(vf);
    if (r.ok && r.data && r.data.homebase_path) return path.resolve(String(r.data.homebase_path));
  }
  return null;
}

function registryEntries(homebase) {
  if (!homebase) return [];
  let txt;
  try { txt = fs.readFileSync(path.join(homebase, 'fleet', 'registry.yaml'), 'utf8'); } catch { return []; }
  const re = /^\s*-\s*name:\s*["']?([^"'\n]+?)["']?\s*\n\s*path:\s*["']?([^"'\n]+?)["']?\s*$/gm;
  const out = [];
  let m;
  while ((m = re.exec(txt)) !== null) out.push({ name: m[1].trim(), path: m[2].trim() });
  return out;
}

const norm = (p) => path.resolve(p).toLowerCase().replace(/\\/g, '/');

function repoName(primary, entries) {
  const hit = entries.find((e) => norm(e.path) === norm(primary));
  return hit ? hit.name : path.basename(primary);
}

function findDesk(primary, entries) {
  const reg = entries.find((e) => e.name === 'founder-desk');
  const cands = [process.env.FOUNDER_DESK, process.env.FOUNDER_DESK_PATH, path.join(primary, '..', 'founder-desk'), reg && reg.path];
  return cands.find((c) => c && fs.existsSync(path.join(c, 'items'))) || null;
}

function readJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

/**
 * When was this file last changed in git? Returns { at, certain }. In a shallow
 * clone the boundary commit appears to touch every file, so a date from it is
 * not evidence of an edit (found on first run: a false RECHECK dated at the
 * clone's boundary).
 */
function lastChanged(desk, rel) {
  try {
    const [hash, at] = execFileSync('git', ['log', '-1', '--format=%H %cI', '--', rel], { cwd: desk, encoding: 'utf8', windowsHide: true }).trim().split(' ');
    if (!hash) return { at: null, certain: false };
    let shallow = [];
    try { shallow = fs.readFileSync(path.join(desk, '.git', 'shallow'), 'utf8').split(/\s+/).filter(Boolean); } catch { /* not shallow */ }
    return { at, certain: !shallow.includes(hash) };
  } catch { return { at: null, certain: false }; }
}

function readAnswers(desk, name) {
  const want = name.toLowerCase();
  const rows = [];
  for (const f of fs.readdirSync(path.join(desk, 'items')).filter((x) => x.endsWith('.json')).sort()) {
    const it = readJson(path.join(desk, 'items', f));
    if (!it || String(it.repo || '').toLowerCase() !== want) continue;
    const ans = readJson(path.join(desk, 'answers', f));
    const closed = fs.existsSync(path.join(desk, 'closed', f)) || it.status === 'closed';
    let state = 'WAITING';
    let note = '';
    if (closed) state = 'CLOSED';
    else if (ans) {
      state = 'TO APPLY';
      const edited = lastChanged(desk, `items/${f}`);
      if (!edited.certain) note = 'cannot tell whether the ask changed after he answered (shallow clone); fetch full history to check';
      else if (ans.at && Date.parse(edited.at) > Date.parse(ans.at)) { state = 'RECHECK'; note = `ask edited ${edited.at.slice(0, 10)}, after his answer of ${String(ans.at).slice(0, 10)}`; }
    }
    rows.push({ id: it.id, state, kind: it.kind, lane: it.lane || null, rank: it.rank || null, subject: it.subject,
      verdict: ans ? ans.verdict : null, answered_at: ans ? ans.at : null, answer_note: ans ? ans.note || '' : '', note });
  }
  return rows;
}

function answers(ctx, values) {
  const { desk, name } = ctx;
  if (!desk) {
    const msg = `desk (${name}): BLIND -- no founder-desk checkout beside this repo, so his answers cannot be read here (set FOUNDER_DESK or clone it beside this repo)`;
    if (values.json) process.stdout.write(JSON.stringify({ desk: null, repo: name, state: 'BLIND' }) + NL);
    else process.stdout.write(msg + NL);
    return 0;
  }
  const rows = readAnswers(desk, name);
  const act = rows.filter((r) => r.state === 'TO APPLY' || r.state === 'RECHECK');
  if (values.json) { process.stdout.write(JSON.stringify({ desk, repo: name, rows }, null, 1) + NL); return 0; }
  if (values.quiet && !act.length) return 0;
  const count = (s) => rows.filter((r) => r.state === s).length;
  process.stdout.write(`desk (${name}): ${act.length} answer(s) from the founder to act on · ${count('WAITING')} waiting on him · ${count('CLOSED')} closed${NL}`);
  for (const r of act) {
    process.stdout.write(`  ${r.state.padEnd(8)} ${r.id}: he said "${r.verdict}"${r.answer_note ? ` ("${r.answer_note.slice(0, 80)}")` : ''} on ${String(r.answered_at).slice(0, 10)} -- ${r.subject}${r.note ? ` [${r.note}]` : ''}${NL}`);
  }
  if (act.length) process.stdout.write(`  Act on these before other work. Apply each, then close it on the desk (closed/<id>.json with a note), so it stops showing as answered.${NL}`);
  return 0;
}

function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40); }

function ask(ctx, v) {
  const missing = [];
  if (!KINDS[v.kind]) missing.push(`--kind (one of ${Object.keys(KINDS).join('|')})`);
  for (const k of ['subject', 'rec', 'source']) if (!v[k]) missing.push(`--${k}`);
  if (!LEVELS.includes(v.impact)) missing.push('--impact (high|medium|low)');
  if (!LEVELS.includes(v.risk)) missing.push('--risk (high|medium|low)');
  if (!(Number.isInteger(Number(v.minutes)) && Number(v.minutes) >= 1)) missing.push('--minutes (his own time, whole minutes)');
  if (!WHERE.includes(v.where)) missing.push(`--where (${WHERE.join('|')})`);
  if (missing.length) {
    process.stderr.write(`cwos-desk ask: missing ${missing.join(', ')}. NOTHING WAS FILED.${NL}`);
    return 1;
  }
  const { desk, name } = ctx;
  if (!desk || !fs.existsSync(path.join(desk, '.git'))) {
    process.stderr.write(`cwos-desk ask: cannot reach the desk (${desk ? `no git repo at ${desk}` : 'no founder-desk checkout found'}). NOTHING WAS FILED.${NL}`);
    process.stderr.write(`  Do not report this as asked. Set FOUNDER_DESK or clone founder-desk beside this repo.${NL}`);
    return 2;
  }
  const id = v.id || `${slug(name)}-${slug(v.subject)}`;
  const file = path.join(desk, 'items', `${id}.json`);
  if (fs.existsSync(file)) {
    process.stderr.write(`cwos-desk ask: ${id} already exists. Pick another --id or update it deliberately.${NL}`);
    return 1;
  }
  const today = new Date().toISOString().slice(0, 10);
  const item = { id, kind: v.kind, repo: name, subject: v.subject, rec: v.rec, source: v.source, status: 'open',
    created_at: new Date().toISOString(), created_by: v.by || `${name} session ${today}` };
  for (const k of ['why', 'due', 'taken', 'declined', 'project']) if (v[k]) item[k] = v[k];
  if (v.rank) item.rank = Number(v.rank);
  item.priority = { impact: v.impact, risk: v.risk, minutes: Number(v.minutes), where: v.where, by: `session (${name})` };
  if (v.touches) item.priority.touches = v.touches;
  if (v['if-waits']) item.priority.risk_why = v['if-waits'];

  // The same "complete, or red" judgement the desk renders with (founder-desk
  // server/complete.js), so the session that files and the page that shows agree.
  let cm = null;
  try { cm = require(path.join(desk, 'server', 'complete.js')); } catch { /* older desk */ }
  if (cm) {
    const projects = [];
    try { for (const n of fs.readdirSync(path.join(desk, 'projects'))) if (n.endsWith('.json')) projects.push({ id: n.slice(0, -5) }); } catch { /* none */ }
    const judged = cm.completeItem(item, cm.fsContext(fs, desk, path.resolve(ctx.primary, '..'), { fleet: 'homebase' }), { projects });
    for (const r of judged.red) process.stderr.write(`    RED  ${r.text}${NL}`);
    for (const u of judged.unverified) process.stderr.write(`    ?    ${u.text}${NL}`);
    if (judged.red.length && !v['force-incomplete']) {
      process.stderr.write(`cwos-desk ask: ${id} would arrive INCOMPLETE. NOTHING WAS FILED. Carry the content in the row, or --force-incomplete to file it red on purpose.${NL}`);
      return 1;
    }
  } else {
    process.stderr.write(`cwos-desk ask: completeness NOT checked -- the desk checkout has no server/complete.js. Pull founder-desk.${NL}`);
  }

  // A push can hang, not fail, on an expired credential with no one to answer the prompt.
  const git = (args) => spawnSync('git', ['-C', desk, ...args], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
  const branch = (git(['rev-parse', '--abbrev-ref', 'HEAD']).stdout || '').trim();
  if (branch !== 'main') {
    process.stderr.write(`cwos-desk ask: founder-desk is on "${branch}", not main. The server pulls main. NOTHING WAS FILED.${NL}`);
    return 2;
  }
  writeFileAtomic(file, JSON.stringify(item, null, 1) + NL);
  git(['add', path.join('items', `${id}.json`)]);
  const c = git(['commit', '-m', `desk: ${id} — ${v.subject.slice(0, 60)}`]);
  if (c.status !== 0) {
    process.stderr.write(`cwos-desk ask: wrote ${id} but commit failed (${(c.stderr || '').trim()}). It is on disk and NOT on the desk.${NL}`);
    return 2;
  }
  const pushed = git(['push', 'origin', 'main']).status === 0;
  process.stdout.write(`filed ${id}${pushed ? ' (pushed)' : ' (committed, NOT pushed -- it reaches the desk on the next successful push; do not report it as waiting on him)'}${NL}`);
  process.stdout.write(`  Name it this way in your report: NEEDS YOU — ${v.subject}  ${DESK_URL}/#i/${id}${NL}`);
  return pushed ? 0 : 2;
}

function brief(ctx, rest) {
  const script = ctx.desk && path.join(ctx.desk, 'scripts', 'brief.js');
  if (!script || !fs.existsSync(script)) {
    process.stderr.write(`cwos-desk brief: BLIND -- no founder-desk checkout with scripts/brief.js${ctx.desk ? ` at ${ctx.desk}` : ''}. Nothing was published.${NL}`);
    return 2;
  }
  return spawnSync(process.execPath, [script, ...rest], { stdio: 'inherit', windowsHide: true }).status ?? 1;
}

function context(override) {
  const repo = findRepoRoot();
  const primary = primaryRoot(repo);
  const entries = registryEntries(homebaseOf(primary));
  return { repo, primary, name: override || repoName(primary, entries), desk: findDesk(primary, entries) };
}

// brief.js (founder-desk) reads its flags with argv.indexOf, so it neither
// answers --help nor refuses a typo: `publish --file x --no-psuh` would push.
// Its flags are declared here and gated before anything is handed over
// (WS-542, inspection 2026-10-30); the original argv is passed through as is.
const BRIEF_CLI = {
  name: 'cwos-desk.js brief',
  summary: "publish or read a brief on the founder desk (runs the desk's scripts/brief.js)",
  subcommands: {
    publish: 'publish --file <brief.json>: validate, commit and push the brief to the desk',
    list: 'list briefs (--repo narrows it)',
    check: 'check briefs for a repo (--repo, --after)',
    schema: 'print the brief schema',
  },
  flags: {
    file: { type: 'string', placeholder: 'brief.json', describe: 'publish: the brief to publish' },
    visual: { type: 'string', placeholder: 'path', describe: "publish: a local file a section's visual.file names (repeatable)" },
    'no-push': { type: 'boolean', describe: 'publish: commit on the desk but do not push' },
    repo: { type: 'string', placeholder: 'name', describe: 'list/check: desk repo name' },
    after: { type: 'string', placeholder: 'date', describe: 'check: only briefs after this' },
    json: { type: 'boolean', describe: 'machine-readable output' },
    'self-test': { type: 'boolean', describe: "run brief.js's self-test" },
  },
};

function main(argv) {
  if (argv[0] === 'brief') {
    const rest = argv.slice(1);
    // --self-test is brief.js's own mode and takes no subcommand.
    if (rest.length !== 1 || rest[0] !== '--self-test') cliGate(rest, BRIEF_CLI);
    return brief(context(), rest);
  }
  const { values, sub } = cliGate(argv, CLI);
  const ctx = context(values.repo);
  if (sub === 'answers') return answers(ctx, values);
  if (sub === 'ask') return ask(ctx, values);
  return 2;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { readAnswers, repoName, registryEntries, findDesk, KINDS };
