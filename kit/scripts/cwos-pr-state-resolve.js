#!/usr/bin/env node
/**
 * cwos-pr-state-resolve.js — make a pull request's workstream/state conflicts go away without a
 * human, and refuse to touch anything that is a real conflict.
 *
 *   node kit/scripts/cwos-pr-state-resolve.js --repo <owner/repo> --pr <n> [--path <checkout>] [--apply] [--json]
 *   node kit/scripts/cwos-pr-state-resolve.js --local --path <checkout> --base <ref> --head <ref> [--keep]
 *   node kit/scripts/cwos-pr-state-resolve.js --self-test
 *
 * WHY (ADR-080, founder 2026-10-19: "Do we need to do something so state or work stream files stop
 * being hindrances and fail checks to otherwise successful merges?"). Hooks write tracked state
 * (claims, releases, stamps, derived indexes) on whatever branch a checkout is parked on, so a PR
 * conflicts with main on files no human edited. GitHub's merge button runs no merge drivers, so the
 * only thing that turns DIRTY into CLEAN is a merge commit on the PR branch. PT-by-AI #32 was done
 * by hand on 2026-10-19 (take main's deletions, merge the records, keep both journals); this is that
 * recipe as a tool, with the rules written down and tested.
 *
 * WHAT IT DOES. In a throwaway worktree at the PR head it merges the base branch in, then walks every
 * unmerged path:
 *   - a path OUTSIDE the state set           -> REAL CONFLICT: abort, report the files, change nothing
 *   - deleted on main, changed on the branch -> take the deletion if main archived it
 *                                               (queue/archive/<id>.yaml exists on main) or the
 *                                               branch's change was lease-only (a claim, a release, a
 *                                               stamp); otherwise conflict
 *   - deleted on the branch, changed on main -> take main's
 *   - added on both                          -> same bytes: take main's; different: conflict
 *   - record YAML changed on both            -> lib/state-merge.js mergeRecordText with main named
 *     (queue, sprints, findings, sessions,      as main (close beats claim, later lease wins, lists
 *      programs)                                union, anything else fails closed)
 *   - derived index changed on both          -> take main's; the next reconcile rebuilds it
 *     (queue-index, sprint-index, system-summary, usage.yaml, system/state.md)
 *   - a journal the repo marks merge=union   -> line union (ours, then main's lines ours lacks)
 *     in .gitattributes (events/*.jsonl,
 *      system/events.log.md, ...)
 *   - any other state file changed on both   -> conflict
 * Then: every YAML it wrote must parse; only state paths may be in the result; it commits a merge
 * commit on the branch. With --apply it pushes that commit (never force; a moved remote refuses).
 * Without --apply it reports what it would do and leaves nothing behind.
 *
 * WHAT IT REFUSES, always: a PR that is not OPEN, is a draft, or carries a held:* label; a PR whose
 * remote head moved since it was read; any run where the worktree merge produced a conflict the
 * table above does not decide. It never runs cwos-reconcile inside the worktree: findWorkstreamDir
 * resolves to the PRIMARY worktree (WS-576), so that would rewrite the main checkout's state.
 *
 * FAIL CLOSED. Any exception is a non-zero exit and an aborted merge; the worktree is removed.
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { mergeRecordText, isLeaseOnlyChange } = require('./lib/state-merge');
const { parseYAML } = require('./lib/cwos-utils');

const STATE_RE = /^(\.claude\/workstream\/|system\/(state|events\.log|decisions|failures)\.md$|\.cwos-(feedback|health)\.yaml$)/;
const RECORD_RE = /^\.claude\/workstream\/(queue|sprints|findings|sessions|programs)\/(?:.*\/)?[^/]+\.ya?ml$/;
const DERIVED = new Set(['.claude/workstream/queue-index.yaml', '.claude/workstream/sprint-index.yaml', '.claude/workstream/system-summary.yaml', '.claude/workstream/usage.yaml', 'system/state.md']);
// Program records carry counters that cwos-reconcile recomputes from the queue (cwos-reconcile.js
// ~2190-2200: work_items_open, findings_open, cap_breach; health comes from the pulse). Both sides
// changing one of these is not a disagreement about anything; main's value is taken.
const PROGRAM_DERIVED = new Set(['work_items_open', 'findings_open', 'cap_breach', 'health_score', 'health_ceiling', 'health_ceiling_reason', 'last_run_by_protocol', 'updated_at']);

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); const n = argv[i + 1]; if (n === undefined || n.startsWith('--')) out[k] = true; else { out[k] = n; i++; } }
    else out._.push(a);
  }
  return out;
}

function git(dir, args, opts = {}) {
  return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', timeout: opts.timeout || 120000, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}
function tryGit(dir, args, opts = {}) { try { return { ok: true, out: git(dir, args, opts) }; } catch (e) { return { ok: false, out: String(e.stdout || ''), err: String(e.stderr || e.message) }; } }
function gh(args) { return execFileSync('gh', args, { encoding: 'utf8', timeout: 60000, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }); }

function show(dir, spec) { const r = tryGit(dir, ['show', spec]); return r.ok ? r.out : null; }
function unionLines(ours, theirs) {
  const o = String(ours || '').split(/\r?\n/).filter((l) => l !== '');
  const seen = new Set(o);
  const out = [...o];
  for (const l of String(theirs || '').split(/\r?\n/)) if (l !== '' && !seen.has(l)) { seen.add(l); out.push(l); }
  return out.join('\n') + '\n';
}
function mergeAttr(dir, file) {
  const r = tryGit(dir, ['check-attr', 'merge', '--', file]);
  if (!r.ok) return null;
  const m = /: merge: (.+)$/.exec(r.out.trim());
  return m ? m[1].trim() : null;
}

/** Core: merge baseRef into headRef in a throwaway worktree; resolve state conflicts by the table. */
function resolve({ repoPath, baseRef, headRef, keep = false }) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cwos-psr-'));
  const wt = path.join(tmp, 'wt');
  const report = { base: baseRef, head: headRef, resolved: [], conflicts: [], touched: [], commit: null, alreadyClean: false };
  let worktreeAdded = false;
  const cleanup = () => {
    if (!worktreeAdded || keep) return;
    tryGit(repoPath, ['worktree', 'remove', '--force', wt]);
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) { /* best effort */ }
  };
  try {
    git(repoPath, ['worktree', 'add', '--detach', wt, headRef]);
    worktreeAdded = true;
    const m = tryGit(wt, ['merge', '--no-commit', '--no-ff', baseRef]);
    if (m.ok) {
      // No conflict at all: either already contains base, or git merged cleanly. Nothing for us.
      tryGit(wt, ['merge', '--abort']);
      report.alreadyClean = true;
      return report;
    }
    // A merge that failed WITHOUT entering a merge (a case-collision on Windows, an untracked file in
    // the way, a bad ref) leaves no MERGE_HEAD and no unmerged entries; proceeding would commit nothing
    // and call it resolved. That is a real conflict for a human, with git's own words.
    if (!tryGit(wt, ['rev-parse', '-q', '--verify', 'MERGE_HEAD']).ok) {
      const tail = [m.out, m.err].join('\n').split('\n').filter((l) => l.trim()).slice(-4).join(' | ').slice(0, 500);
      report.conflicts.push({ file: '*', why: `git could not start the merge: ${tail}` });
      return report;
    }
    const lsu = git(wt, ['ls-files', '-u', '-z']);
    const stages = new Map(); // path -> {1,2,3}
    for (const rec of lsu.split('\0')) {
      if (!rec) continue;
      const [meta, file] = rec.split('\t');
      const stage = meta.split(' ')[2];
      if (!stages.has(file)) stages.set(file, {});
      stages.get(file)[stage] = true;
    }
    for (const [file, st] of stages) {
      const isState = STATE_RE.test(file);
      if (!isState) { report.conflicts.push({ file, why: 'outside the state set: a real conflict' }); continue; }
      const base = st['1'] ? show(wt, `:1:${file}`) : null;
      const ours = st['2'] ? show(wt, `:2:${file}`) : null;   // the PR branch (HEAD of the worktree)
      const theirs = st['3'] ? show(wt, `:3:${file}`) : null; // main (the base branch)
      const take = (text, why) => { fs.mkdirSync(path.dirname(path.join(wt, file)), { recursive: true }); fs.writeFileSync(path.join(wt, file), text); git(wt, ['add', '--', file]); report.resolved.push({ file, rule: why }); report.touched.push(file); };
      const drop = (why) => { tryGit(wt, ['rm', '-q', '--cached', '--', file]); try { fs.unlinkSync(path.join(wt, file)); } catch (_) { /* gone */ } report.resolved.push({ file, rule: why }); report.touched.push(file); };
      if (!st['3']) {
        // deleted on main
        const id = path.posix.basename(file);
        const archived = /^\.claude\/workstream\/queue\/[^/]+\.ya?ml$/.test(file) && tryGit(wt, ['cat-file', '-e', `${baseRef}:.claude/workstream/queue/archive/${id}`]).ok;
        if (archived) { drop(`main archived it (queue/archive/${id}); the branch's copy goes`); continue; }
        if (base && ours && RECORD_RE.test(file) && isLeaseOnlyChange(base, ours)) { drop('main deleted it; the branch only touched the lease (claim/release/stamp)'); continue; }
        if (DERIVED.has(file)) { drop('main no longer tracks this derived file'); continue; }
        report.conflicts.push({ file, why: 'deleted on main, changed on the branch beyond the lease' });
        continue;
      }
      if (!st['2']) { take(theirs, 'deleted on the branch, changed on main: main\'s kept'); continue; }
      if (!st['1']) {
        if (ours.replace(/\r\n/g, '\n') === theirs.replace(/\r\n/g, '\n')) { take(theirs, 'added on both with the same content'); continue; }
        if (DERIVED.has(file)) { take(theirs, 'derived index added on both: main\'s taken, reconcile rebuilds it'); continue; }
        if (mergeAttr(wt, file) === 'union') { take(unionLines(ours, theirs), 'journal (merge=union) added on both: both sides\' lines kept'); continue; }
        report.conflicts.push({ file, why: 'added on both sides with different content' });
        continue;
      }
      if (DERIVED.has(file)) { take(theirs, 'derived index: main\'s taken, reconcile rebuilds it'); continue; }
      if (RECORD_RE.test(file)) {
        const r = mergeRecordText({ base, main: theirs, branch: ours, takeMain: /\/programs\//.test(file) ? PROGRAM_DERIVED : null });
        if (r.ok) { take(r.text, `record merged (${r.resolved.map((x) => `${x.key}: ${x.rule}`).join('; ') || 'one-sided changes'})`); continue; }
        report.conflicts.push({ file, why: `record merge refused: ${r.conflicts.map((c) => `${c.key}: ${c.why}`).join(' | ')}` });
        continue;
      }
      const attr = mergeAttr(wt, file);
      if (attr === 'union') { take(unionLines(ours, theirs), 'journal (merge=union): both sides\' lines kept'); continue; }
      report.conflicts.push({ file, why: `state file changed on both sides with no rule (merge attr: ${attr || 'unspecified'})` });
    }
    if (report.conflicts.length) { tryGit(wt, ['merge', '--abort']); return report; }
    // Every YAML we wrote must parse, and nothing outside the state set may be staged by us.
    for (const f of report.touched) {
      const p = path.join(wt, f);
      if (fs.existsSync(p) && /\.ya?ml$/.test(f)) {
        try { parseYAML(fs.readFileSync(p, 'utf8'), []); } catch (e) { report.conflicts.push({ file: f, why: `merged file does not parse: ${e.message}` }); }
      }
    }
    if (report.conflicts.length) { tryGit(wt, ['merge', '--abort']); return report; }
    const still = tryGit(wt, ['diff', '--name-only', '--diff-filter=U']);
    if (still.ok && still.out.trim()) { report.conflicts.push({ file: still.out.trim().split('\n')[0], why: 'still unmerged after resolution (unexpected)' }); tryGit(wt, ['merge', '--abort']); return report; }
    const msg = [`merge ${baseRef} into ${headRef}: workstream state resolved (cwos-pr-state-resolve, ADR-080)`, '',
      ...report.resolved.map((r) => `- ${r.file}: ${r.rule}`), '',
      'Only files under .claude/workstream/ and system/*.md were resolved by rule; every other', 'conflict would have aborted this merge. Derived indexes carry main\'s copy and are rebuilt', 'by cwos-reconcile at the next SessionStart on main.'].join('\n');
    git(wt, ['-c', 'user.name=cwos-pr-state-resolve', '-c', 'user.email=cwos@fleet.local', 'commit', '-q', '-m', msg]);
    report.commit = git(wt, ['rev-parse', 'HEAD']).trim();
    report.worktree = keep ? wt : null;
    return report;
  } catch (e) {
    // A failing hook writes to stdout as often as stderr; the message alone is just the command.
    const err = [String(e.stdout || ''), String(e.stderr || '')].join('\n').trim() || String(e.message).trim();
    const tail = err.split('\n').filter((l) => l.trim()).slice(-4).join(' | ').slice(0, 500);
    report.conflicts.push({ file: '*', why: `aborted: ${tail}` });
    tryGit(wt, ['merge', '--abort']);
    return report;
  } finally {
    if (!report.commit || !keep) cleanup();
  }
}

function render(rep, { apply, pushed, pr }) {
  const L = [];
  if (pr) L.push(`${pr.url}  ${pr.mergeStateStatus}  head ${pr.headRefOid.slice(0, 7)}`);
  if (rep.alreadyClean) { L.push('  no conflict between head and base: nothing to resolve'); return L.join('\n'); }
  for (const r of rep.resolved) L.push(`  RESOLVED  ${r.file} — ${r.rule}`);
  for (const c of rep.conflicts) L.push(`  CONFLICT  ${c.file} — ${c.why}`);
  if (rep.conflicts.length) L.push(`  => REAL CONFLICTS (${rep.conflicts.length}); nothing was written or pushed.`);
  else if (rep.commit) L.push(`  => merge commit ${rep.commit.slice(0, 7)} ${pushed ? 'PUSHED to the PR branch' : apply ? 'NOT pushed (push failed, see above)' : 'built and discarded (dry run; --apply pushes it)'}`);
  return L.join('\n');
}

function prMode(args) {
  const slug = args.repo, prNum = Number(args.pr);
  if (!slug || !prNum) throw new Error('--repo <owner/repo> and --pr <n> are required');
  const repoPath = args.path ? String(args.path) : process.cwd();
  const pr = JSON.parse(gh(['pr', 'view', String(prNum), '-R', slug, '--json', 'number,url,state,isDraft,headRefName,baseRefName,headRefOid,mergeStateStatus,labels']));
  const held = (pr.labels || []).map((l) => l.name).filter((n) => /^held:/.test(n));
  const refusals = [];
  if (pr.state !== 'OPEN') refusals.push(`PR is ${pr.state}`);
  if (pr.isDraft) refusals.push('PR is a draft');
  if (held.length) refusals.push(`PR carries ${held.join(', ')}`);
  if (refusals.length) { const out = { pr: pr.url, refused: refusals }; console.log(args.json ? JSON.stringify(out, null, 2) : `${pr.url}\n  REFUSED: ${refusals.join('; ')}`); return 3; }
  git(repoPath, ['fetch', '-q', 'origin', pr.baseRefName, pr.headRefName]);
  const remoteHead = git(repoPath, ['rev-parse', `origin/${pr.headRefName}`]).trim();
  if (remoteHead !== pr.headRefOid) { console.log(`${pr.url}\n  REFUSED: remote head ${remoteHead.slice(0, 7)} != PR head ${pr.headRefOid.slice(0, 7)} (moved while reading)`); return 3; }
  const rep = resolve({ repoPath, baseRef: `origin/${pr.baseRefName}`, headRef: pr.headRefOid, keep: Boolean(args.apply) });
  let pushed = false;
  if (args.apply && rep.commit && !rep.conflicts.length) {
    const p = tryGit(rep.worktree, ['push', 'origin', `HEAD:refs/heads/${pr.headRefName}`], { timeout: 30 * 60 * 1000 });
    pushed = p.ok;
    if (!p.ok) rep.conflicts.push({ file: '*', why: `push refused: ${p.err.trim().split('\n').slice(-1)[0]}` });
    tryGit(repoPath, ['worktree', 'remove', '--force', rep.worktree]);
  }
  const out = { pr: pr.url, head: pr.headRefOid, ...rep, pushed };
  console.log(args.json ? JSON.stringify(out, null, 2) : render(rep, { apply: Boolean(args.apply), pushed, pr }));
  return rep.conflicts.length ? 1 : 0;
}

function localMode(args) {
  if (!args.path || !args.base || !args.head) throw new Error('--local needs --path, --base and --head');
  const rep = resolve({ repoPath: String(args.path), baseRef: String(args.base), headRef: String(args.head), keep: Boolean(args.keep) });
  console.log(args.json ? JSON.stringify(rep, null, 2) : render(rep, { apply: false, pushed: false }));
  return rep.conflicts.length ? 1 : 0;
}

// ---- self-test: a scratch repo with the shapes the failure review named -------------------------
function selfTest() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cwos-psr-test-'));
  const g = (...a) => git(dir, a);
  const w = (f, t) => { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), t); };
  const rec = (id, over = {}) => { const o = { id: `"${id}"`, title: '"t"', status: 'backlog', claimed_by: 'null', claimed_at: 'null', released_by: 'null', released_at: 'null', priority_score: '50', ...over }; return Object.entries(o).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n'; };
  g('init', '-q', '-b', 'main'); g('config', 'user.email', 't@t'); g('config', 'user.name', 't');
  w('.gitattributes', '.claude/workstream/events/*.jsonl merge=union\n');
  w('.claude/workstream/queue/WS-1.yaml', rec('WS-1'));
  w('.claude/workstream/queue/WS-2.yaml', rec('WS-2'));
  w('.claude/workstream/queue/WS-3.yaml', rec('WS-3', { notes: '"base"' }));
  w('.claude/workstream/queue-index.yaml', 'items: 3\n');
  w('.claude/workstream/events/current.jsonl', '{"id":"e0"}\n');
  w('src/app.js', 'const a = 1;\n');
  g('add', '-A'); g('commit', '-q', '-m', 'base');
  g('checkout', '-q', '-b', 'feature');
  w('.claude/workstream/queue/WS-1.yaml', rec('WS-1', { claimed_by: 'ses-branch', claimed_at: '"2026-10-19T09:00:00Z"' }));
  w('.claude/workstream/queue/WS-2.yaml', rec('WS-2', { claimed_by: 'ses-branch', claimed_at: '"2026-10-19T09:00:00Z"' }));
  w('.claude/workstream/queue-index.yaml', 'items: 3\nbranch: yes\n');
  w('.claude/workstream/events/current.jsonl', '{"id":"e0"}\n{"id":"e-branch"}\n');
  w('src/feature.js', 'export const f = 2;\n');
  g('add', '-A'); g('commit', '-q', '-m', 'branch work');
  g('checkout', '-q', 'main');
  w('.claude/workstream/queue/WS-1.yaml', rec('WS-1', { status: 'done', completed_at: '"2026-10-19T10:00:00Z"' }));
  fs.mkdirSync(path.join(dir, '.claude/workstream/queue/archive'), { recursive: true });
  g('mv', '.claude/workstream/queue/WS-2.yaml', '.claude/workstream/queue/archive/WS-2.yaml');
  w('.claude/workstream/queue-index.yaml', 'items: 2\nmain: yes\n');
  w('.claude/workstream/events/current.jsonl', '{"id":"e0"}\n{"id":"e-main"}\n');
  w('src/app.js', 'const a = 2;\n');
  g('add', '-A'); g('commit', '-q', '-m', 'main moved');
  const results = [];
  const t = (name, ok) => results.push([name, ok]);

  // 1. state-only conflicts resolve: close beats claim, archive beats lease-only change, index = main's, journal union
  const r1 = resolve({ repoPath: dir, baseRef: 'main', headRef: 'feature', keep: true });
  t('state-only PR resolves with no conflicts', r1.conflicts.length === 0 && Boolean(r1.commit));
  if (r1.commit) {
    const ws1 = parseYAML(git(dir, ['show', `${r1.commit}:.claude/workstream/queue/WS-1.yaml`]), []);
    t('close on main beats the branch claim', ws1.status === 'done' && ws1.claimed_by === null);
    t('archived-on-main record is dropped from the branch', !tryGit(dir, ['cat-file', '-e', `${r1.commit}:.claude/workstream/queue/WS-2.yaml`]).ok);
    t('derived index carries main\'s copy', /main: yes/.test(git(dir, ['show', `${r1.commit}:.claude/workstream/queue-index.yaml`])));
    const ev = git(dir, ['show', `${r1.commit}:.claude/workstream/events/current.jsonl`]);
    t('union journal keeps both sides\' lines', /e-branch/.test(ev) && /e-main/.test(ev));
    t('the branch\'s code is still there and main\'s code change arrived', tryGit(dir, ['cat-file', '-e', `${r1.commit}:src/feature.js`]).ok && /a = 2/.test(git(dir, ['show', `${r1.commit}:src/app.js`])));
    t('the merge commit has two parents', git(dir, ['rev-list', '--parents', '-n', '1', r1.commit]).trim().split(' ').length === 3);
    tryGit(dir, ['worktree', 'remove', '--force', r1.worktree]);
  }
  // 2. a code conflict aborts and names the file, leaving the branch untouched
  g('checkout', '-q', 'feature'); w('src/app.js', 'const a = 3;\n'); g('add', '-A'); g('commit', '-q', '-m', 'branch edits app too');
  const before = g('rev-parse', 'feature').trim();
  const r2 = resolve({ repoPath: dir, baseRef: 'main', headRef: 'feature' });
  t('a real code conflict aborts', r2.conflicts.length === 1 && /src\/app\.js/.test(r2.conflicts[0].file) && !r2.commit);
  t('an aborted run leaves the branch where it was', g('rev-parse', 'feature').trim() === before);
  // 3. a scalar both-changed (notes) is a conflict, not a guess
  g('reset', '-q', '--hard', 'HEAD~1'); w('.claude/workstream/queue/WS-3.yaml', rec('WS-3', { notes: '"branch"' })); g('add', '-A'); g('commit', '-q', '-m', 'branch notes');
  g('checkout', '-q', 'main'); w('.claude/workstream/queue/WS-3.yaml', rec('WS-3', { notes: '"main"' })); g('add', '-A'); g('commit', '-q', '-m', 'main notes');
  const r3 = resolve({ repoPath: dir, baseRef: 'main', headRef: 'feature' });
  t('notes changed on both sides is refused, named by key', r3.conflicts.length === 1 && /notes/.test(r3.conflicts[0].why) && !r3.commit);
  // 4. nothing to do when there is no conflict
  g('checkout', '-q', '-b', 'clean', 'main'); w('docs.md', 'x\n'); g('add', '-A'); g('commit', '-q', '-m', 'clean branch');
  const r4 = resolve({ repoPath: dir, baseRef: 'main', headRef: 'clean' });
  t('a branch that merges cleanly is reported as nothing to do', r4.alreadyClean === true && !r4.commit);
  tryGit(dir, ['worktree', 'prune']);
  const wl = g('worktree', 'list').trim().split('\n'); // the scratch repo itself is line one
  if (wl.length > 1) console.log('leftover worktrees:\n' + wl.slice(1).join('\n'));
  t('no worktrees are left behind', wl.length === 1);
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) { /* windows file locks */ }
  let fail = 0;
  for (const [name, ok] of results) { if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); }
  console.log(`${results.length - fail}/${results.length} passed`);
  return fail ? 1 : 0;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args['self-test']) return selfTest();
  if (args.help) { process.stdout.write(fs.readFileSync(__filename, 'utf8').split('*/')[0] + '\n'); return 0; }
  try { return args.local ? localMode(args) : prMode(args); }
  catch (e) { process.stderr.write(`cwos-pr-state-resolve: ${String(e.stderr || e.message).trim()}\n`); return 2; }
}

if (require.main === module) process.exitCode = main();
module.exports = { resolve, STATE_RE, RECORD_RE, DERIVED };
