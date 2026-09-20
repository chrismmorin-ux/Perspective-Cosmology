#!/usr/bin/env node
/**
 * cwos-inbox-drain — pull work HomeBase has addressed to THIS repo.
 *
 * WS-612, receiving half. Runs INSIDE an adopted repo. Reads HomeBase's
 * fleet/outbox/<this repo>/ and materialises each undelivered envelope as a
 * normal work item in this repo's own queue — this repo's id counters, this
 * repo's schema, this repo's /next scoring.
 *
 * WHY THE PULL DIRECTION MATTERS (DEC-054, founder decision 2026-08-22).
 * HomeBase never writes here. It cannot: it only ever writes its own outbox.
 * This script is the sole thing that writes into this repo, it runs under this
 * repo's own session, and it can be not-run, run late, or have its output
 * dismissed like any other backlog item. The boundary is structural rather
 * than a matter of HomeBase behaving well — which is the whole point, because
 * the incident behind DEC-054 was HomeBase behaving badly in good faith.
 *
 * An envelope is a PROPOSAL. `priority_score` and `suggested_program` were set
 * by HomeBase without reading this repo's programs or priorities, and are
 * expected to be wrong. The item lands with source.type: fleet-courier so a
 * triaging session can tell at a glance that the numbers are foreign.
 *
 * Idempotent. A drained envelope is recorded in the local ledger and never
 * re-materialises, so running this on a timer is safe.
 *
 * Exit codes: 0 drained something · 1 nothing to drain · 2 usage/resolution error
 */

require('./lib/preflight');

const fs = require('fs');
const path = require('path');

const {
  readYAMLFile, writeFileAtomic, withFileLock, findWorkstreamDir, findRepoRoot,
  globFiles, todayISO,
} = require('./lib/cwos-utils');

const KNOWN_FLAGS = { drain: ['dry-run', 'json', 'homebase', 'as-repo'] };

function fail(msg, extra) {
  process.stderr.write(`cwos-inbox-drain: ${msg}\n`);
  if (extra) process.stderr.write(JSON.stringify(extra, null, 2) + '\n');
  process.exit(2);
}

function usage(code) {
  process.stdout.write(
    'usage: cwos-inbox-drain [--dry-run] [--json] [--homebase <path>] [--as-repo <Name>]\n' +
    '\n' +
    'Pulls work items HomeBase has addressed to this repo and creates them in\n' +
    'this repo\'s own queue. Idempotent — an already-drained envelope is skipped.\n' +
    '\n' +
    'options:\n' +
    '  --dry-run          show what would be created; write nothing\n' +
    '  --json             machine-readable payload\n' +
    '  --homebase <path>  override HomeBase location (default: .cwos-version\n' +
    '                     homebase_path)\n' +
    '  --as-repo <Name>   override this repo\'s registry name (default: matched\n' +
    '                     from HomeBase fleet/registry.yaml by path)\n' +
    '\n' +
    'Items arrive as proposals: HomeBase set priority and program without\n' +
    'reading this repo\'s state, so rescore them like any external suggestion.\n'
  );
  process.exit(code);
}

function assertKnownFlags(args) {
  const known = new Set(KNOWN_FLAGS.drain);
  const unknown = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) continue;
    const name = a.slice(2).split('=')[0];
    if (!known.has(name)) unknown.push(a);
    else if (!a.includes('=') && (name === 'homebase' || name === 'as-repo')) i++;
  }
  if (unknown.length) fail(`unknown flag(s): ${unknown.join(', ')}`, { accepted: Array.from(known) });
}

function readFlag(args, name) {
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = args.indexOf(`--${name}`);
  return i !== -1 && i + 1 < args.length ? args[i + 1] : null;
}
function hasFlag(args, name) { return args.includes(`--${name}`); }

function resolveHomeBase(repoRoot, override) {
  if (override) return path.resolve(override);
  const vf = path.join(repoRoot, '.cwos-version');
  if (fs.existsSync(vf)) {
    const r = readYAMLFile(vf);
    if (r.ok && r.data && r.data.homebase_path) return path.resolve(String(r.data.homebase_path));
  }
  return null;
}

/**
 * This repo's name AS HOMEBASE KNOWS IT — matched by path, not by directory
 * basename. A repo that has been relocated or cloned under a different folder
 * name would otherwise silently look at an outbox that is not its own.
 */
function resolveRepoName(homebase, repoRoot, override) {
  if (override) return override;
  const reg = path.join(homebase, 'fleet', 'registry.yaml');
  if (!fs.existsSync(reg)) return null;
  const txt = fs.readFileSync(reg, 'utf8');
  const re = /^\s*-\s*name:\s*["']?([^"'\n]+?)["']?\s*\n\s*path:\s*["']?([^"'\n]+?)["']?\s*$/gm;
  const want = path.resolve(repoRoot).toLowerCase().replace(/\\/g, '/');
  let m;
  while ((m = re.exec(txt)) !== null) {
    const p = path.resolve(m[2].trim()).toLowerCase().replace(/\\/g, '/');
    if (p === want) return m[1].trim();
  }
  return null;
}

function ledgerPath(wsDir) { return path.join(wsDir, 'inbox-drained.json'); }

function readLedger(wsDir) {
  const p = ledgerPath(wsDir);
  if (!fs.existsSync(p)) return { drained: {} };
  try {
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    return d && typeof d.drained === 'object' ? d : { drained: {} };
  } catch { return { drained: {} }; }
}

function allocateLocalId(wsDir) {
  // Prefer the repo's own reserving allocator so two drains, or a drain racing
  // a session, cannot mint the same id. Falls back to a max-scan for older kits.
  try {
    const { allocateId } = require('./lib/id-allocator');
    const r = allocateId({ kind: 'ws', workstreamDir: wsDir });
    if (r && r.id) return r.id;
  } catch { /* older kit — fall through */ }
  let max = 0;
  for (const f of globFiles(path.join(wsDir, 'queue'), 'WS-*.yaml')) {
    const m = path.basename(f).match(/WS-(\d+)\.yaml$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `WS-${String(max + 1).padStart(3, '0')}`;
}

/**
 * Does this repo actually have the program HomeBase suggested?
 *
 * Reading our OWN programs directory to map a foreign suggestion onto local
 * reality is this repo acting on itself — the opposite of the cross-repo
 * inference DEC-054 forbids. An unrecognised suggestion is dropped rather than
 * written through, so a courier can never invent a program here.
 */
function localProgram(wsDir, suggested) {
  if (!suggested) return '';
  const dir = path.join(wsDir, 'programs');
  if (!fs.existsSync(dir)) return '';
  const want = String(suggested).replace(/^prog-/, '');
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^prog-(.+)\.yaml$/);
    if (m && m[1] === want) return want;
  }
  return '';
}

function renderItem(id, env, program) {
  const it = env.item || {};
  const q = (s) => String(s).replace(/"/g, '\\"');
  const lines = [
    `id: "${id}"`,
    `title: "${q(it.title || 'Untitled courier item')}"`,
    'status: backlog',
    'claimed_by: null',
    'claimed_at: null',
    `type: ${env.kind || 'work-item'}`,
    `category: "${q(it.category || 'fleet-courier')}"`,
    `program: ${program || '""'}`,
    `priority_score: ${typeof it.priority_score === 'number' ? it.priority_score : 50}`,
    `effort: ${it.effort || 'M'}`,
    `severity: ${it.severity || 'medium'}`,
    `created_at: "${todayISO()}"`,
    'source:',
    '  type: fleet-courier',
    '  created_by: cwos-inbox-drain',
    '  from_repo: HomeBase',
    `  envelope_id: "${q(env.envelope_id)}"`,
  ];
  if (env.ref) lines.push(`  homebase_ref: "${q(env.ref)}"`);
  if (it.suggested_program) lines.push(`  suggested_program: "${q(it.suggested_program)}"`);
  lines.push(`  sent_at: "${q(env.created_at || '')}"`);
  lines.push('  note: >-');
  lines.push('    Delivered by the fleet courier. priority_score and program were');
  lines.push('    suggested by HomeBase without reading this repo\'s state; rescore');
  lines.push('    before trusting them.');
  lines.push('blocked_by: []');
  lines.push('enables: []');
  if (it.why) {
    lines.push('rationale: |');
    for (const ln of String(it.why).split('\n')) lines.push(`  ${ln}`);
  }
  if (it.description) {
    lines.push('description: |');
    for (const ln of String(it.description).split('\n')) lines.push(`  ${ln}`);
  }
  if (it.accept_criteria) {
    lines.push('accept_criteria: |');
    for (const ln of String(it.accept_criteria).split('\n')) lines.push(`  ${ln}`);
  }
  return lines.join('\n') + '\n';
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) usage(0);
  assertKnownFlags(args);

  const repoRoot = findRepoRoot(process.cwd()) || process.cwd();
  let wsDir;
  try { wsDir = findWorkstreamDir(process.cwd()); }
  catch (e) { fail(`no .claude/workstream found: ${e.message}`); }

  const homebase = resolveHomeBase(repoRoot, readFlag(args, 'homebase'));
  if (!homebase) fail('cannot resolve HomeBase — no homebase_path in .cwos-version and no --homebase given');
  if (!fs.existsSync(homebase)) fail(`HomeBase path does not exist: ${homebase}`, { hint: 'the repo may have moved; see /fleet-relocate' });

  const repoName = resolveRepoName(homebase, repoRoot, readFlag(args, 'as-repo'));
  if (!repoName) {
    fail('this repo is not resolvable in HomeBase fleet/registry.yaml by path — pass --as-repo <Name>',
      { repo_root: repoRoot, homebase });
  }

  const dir = path.join(homebase, 'fleet', 'outbox', repoName);
  const dryRun = hasFlag(args, 'dry-run');
  const ledger = readLedger(wsDir);

  const pending = [];
  if (fs.existsSync(dir)) {
    for (const f of globFiles(dir, '*.yaml')) {
      const r = readYAMLFile(f);
      if (!r.ok || !r.data || !r.data.envelope_id) continue;
      if (ledger.drained[r.data.envelope_id]) continue;
      pending.push({ file: f, env: r.data });
    }
  }
  pending.sort((a, b) => String(a.env.created_at).localeCompare(String(b.env.created_at)));

  const created = [];
  for (const { env } of pending) {
    const program = localProgram(wsDir, env.item && env.item.suggested_program);
    if (dryRun) {
      created.push({ envelope_id: env.envelope_id, local_id: '(dry-run)', title: (env.item || {}).title, program: program || null });
      continue;
    }
    const id = allocateLocalId(wsDir);
    const dest = path.join(wsDir, 'queue', `${id}.yaml`);
    writeFileAtomic(dest, renderItem(id, env, program));
    ledger.drained[env.envelope_id] = { local_id: id, at: new Date().toISOString() };
    created.push({ envelope_id: env.envelope_id, local_id: id, title: (env.item || {}).title, program: program || null });

    // Receipt back to HomeBase: this repo volunteering that it took delivery.
    // Best-effort — a failed receipt must never undo a materialised item.
    try {
      const rdir = path.join(dir, '.receipts');
      fs.mkdirSync(rdir, { recursive: true });
      writeFileAtomic(path.join(rdir, `${env.envelope_id}.json`), JSON.stringify({
        envelope_id: env.envelope_id, repo: repoName, local_id: id, at: new Date().toISOString(),
      }, null, 2) + '\n');
    } catch { /* delivery happened regardless */ }
  }

  if (!dryRun && created.length) {
    withFileLock(ledgerPath(wsDir) + '.lock', () => {
      writeFileAtomic(ledgerPath(wsDir), JSON.stringify(ledger, null, 2) + '\n');
    }, { ownerLabel: 'inbox-drain:ledger', maxWaitMs: 5000 });
  }

  if (hasFlag(args, 'json')) {
    process.stdout.write(JSON.stringify({
      ok: true, repo: repoName, homebase, dry_run: dryRun,
      drained: created.length, items: created,
      next: created.length && !dryRun ? 'run cwos-reconcile.js, then triage in /next' : null,
    }, null, 2) + '\n');
    return created.length ? 0 : 1;
  }

  if (!created.length) { process.stdout.write(`inbox empty — nothing addressed to ${repoName}\n`); return 1; }
  process.stdout.write(`\n${dryRun ? 'Would create' : 'Created'} ${created.length} item(s) in ${repoName}:\n`);
  for (const c of created) {
    process.stdout.write(`  ${c.local_id}  ${String(c.title).slice(0, 62)}\n`);
  }
  process.stdout.write(`\nThese are proposals — HomeBase scored them blind. Rescore in triage.\n`);
  if (!dryRun) process.stdout.write('Next: node kit/scripts/cwos-reconcile.js\n');
  return 0;
}

if (require.main === module) process.exit(main());

module.exports = { resolveRepoName, localProgram };
