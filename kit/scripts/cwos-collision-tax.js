#!/usr/bin/env node
/**
 * cwos-collision-tax — measure what the git policy exists to minimize.
 *
 * The git policy says: commit at chunk boundaries and get work to the main line
 * early. The reason is a cost that was never measured: time spent repairing
 * collisions between sessions, and redoing work that sat unmerged until it
 * conflicted. This script puts a number on both sides.
 *
 *   exposure  LEADING. For each branch with work not on the main line: commits
 *             ahead, hours since the oldest of them, commit-hours at risk (the
 *             product), files it shares with changes on the main line since
 *             they diverged, and whether it would conflict right now
 *             (`git merge-tree --write-tree`, which touches nothing).
 *
 *   cost      LAGGING. Over a window of main-line history: merge commits whose
 *             parents actually conflicted (re-computed with merge-tree),
 *             reverts, and commits whose subject says they repair a merge or
 *             restore lost work — as a share of all commits. The repair share
 *             is the collision tax.
 *
 *   gate      exit 1 when the current branch carries more unmerged work than the
 *             thresholds allow, or would conflict with the main line. Meant for
 *             session end and stop hooks: sitting on finished work becomes a
 *             failure you see, not a habit you're reminded of (MIS-012).
 *
 * Read-only: never checks out, merges, fetches or writes. Fetch first if you want
 * origin to be current.
 */

'use strict';

const { execFileSync } = require('child_process');
const { cliGate } = require('./lib/cli');

const CLI = {
  name: 'cwos-collision-tax',
  summary: 'measure unmerged-work exposure and collision-repair cost; gate on exposure',
  usage: 'cwos-collision-tax <exposure|cost|gate> [options]',
  subcommands: {
    exposure: 'every branch with work off the main line: commit-hours at risk, overlap, predicted conflicts',
    cost: 'repair commits (conflicted merges, reverts, "fix merge") as a share of main-line commits',
    gate: 'exit 1 if the current branch is over the exposure thresholds or would conflict',
  },
  flags: {
    repo: { type: 'string', placeholder: 'path', describe: 'repository (default: current directory)' },
    main: { type: 'string', placeholder: 'ref', describe: 'main line to measure against (default: origin/master, else origin/main, else master/main)' },
    since: { type: 'string', placeholder: 'git-date', describe: 'cost: history window (default: "30 days ago")' },
    'max-hours': { type: 'string', placeholder: 'n', describe: 'gate: oldest unmerged commit may be at most this old (default 8)' },
    'max-commits': { type: 'string', placeholder: 'n', describe: 'gate: at most this many commits off the main line (default 10)' },
    now: { type: 'string', placeholder: 'ISO date', describe: 'evaluate ages as of this time (tests)' },
    human: { type: 'boolean', describe: 'readable output instead of JSON' },
  },
  notes: 'gate exits 1 when over threshold or conflicting, 0 otherwise. exposure and cost always exit 0.',
};

const REPAIR_SUBJECT = /(resolv\w*|fix\w*)\b.*\b(merge|conflict)|\bmerge conflict|\brestor\w* (lost|deleted|overwritten)|\bre-?apply|\bredo\b|\brecover\w*\b/i;

function git(repo, args, { allowFail = false } = {}) {
  try {
    return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    if (allowFail) return { failed: true, status: e.status, stdout: String(e.stdout || '').trim() };
    throw e;
  }
}

const exists = (repo, ref) => typeof git(repo, ['rev-parse', '--verify', '--quiet', ref], { allowFail: true }) === 'string';

const isShallow = (repo) => git(repo, ['rev-parse', '--is-shallow-repository'], { allowFail: true }) === 'true';

function mainRef(repo, explicit) {
  if (explicit) return explicit;
  return ['origin/master', 'origin/main', 'master', 'main'].find((r) => exists(repo, r)) || null;
}

/** Would `branch` conflict with `main` if merged now? Uses merge-tree; touches nothing. */
function predictConflicts(repo, main, branch) {
  const r = git(repo, ['merge-tree', '--write-tree', '--name-only', '--no-messages', main, branch], { allowFail: true });
  if (typeof r === 'string') return [];
  if (r.status === 1) return r.stdout.split('\n').slice(1).filter(Boolean);
  return null; // merge-tree unavailable or errored — unknown, not "none"
}

function branchExposure(repo, main, branch, now) {
  const [behind, ahead] = git(repo, ['rev-list', '--left-right', '--count', `${main}...${branch}`]).split(/\s+/).map(Number);
  if (!ahead) return null;
  const times = git(repo, ['log', '--format=%ct', `${main}..${branch}`]).split('\n').filter(Boolean).map(Number);
  const oldestHours = (now - Math.min(...times) * 1000) / 3600000;
  const base = git(repo, ['merge-base', main, branch], { allowFail: true });
  if (typeof base !== 'string') {
    // No common ancestor in this clone (shallow history, or unrelated): the
    // counts above are not trustworthy either, so say so instead of guessing.
    return { branch, ahead, behind, oldest_unmerged_hours: Math.round(oldestHours * 10) / 10,
      commit_hours_at_risk: Math.round(ahead * oldestHours), files_changed: null, overlapping_files: null,
      would_conflict: 'unknown', conflicting_files: [], history: 'no common ancestor in this clone — fetch deeper history to measure' };
  }
  const mine = new Set(git(repo, ['diff', '--name-only', base, branch]).split('\n').filter(Boolean));
  const theirs = git(repo, ['diff', '--name-only', base, main]).split('\n').filter(Boolean);
  const overlap = theirs.filter((f) => mine.has(f));
  const conflicts = predictConflicts(repo, main, branch);
  return {
    branch, ahead, behind,
    oldest_unmerged_hours: Math.round(oldestHours * 10) / 10,
    commit_hours_at_risk: Math.round(ahead * oldestHours),
    files_changed: mine.size,
    overlapping_files: overlap.length,
    would_conflict: conflicts === null ? 'unknown' : conflicts.length > 0,
    conflicting_files: conflicts || [],
  };
}

function exposure(repo, main, now) {
  const refs = git(repo, ['for-each-ref', '--format=%(refname:short)', 'refs/heads', 'refs/remotes'])
    .split('\n').filter((r) => r && !/\/HEAD$/.test(r) && r !== main && r !== main.replace(/^origin\//, ''));
  // A local branch that points at the same commit as its origin twin is one
  // piece of work, not two.
  const sha = (r) => git(repo, ['rev-parse', r]);
  const originShas = new Set(refs.filter((r) => r.startsWith('origin/')).map(sha));
  const rows = [];
  for (const r of refs) {
    if (!r.startsWith('origin/') && originShas.has(sha(r))) continue;
    const e = branchExposure(repo, main, r, now);
    if (e) rows.push(e);
  }
  // Only measurable rows count toward totals: a shallow clone's ahead-counts for
  // a branch with no common ancestor are artifacts, not exposure.
  rows.sort((a, b) => (a.history ? 1 : 0) - (b.history ? 1 : 0) || b.commit_hours_at_risk - a.commit_hours_at_risk);
  const measured = rows.filter((x) => !x.history);
  return {
    main,
    shallow: isShallow(repo),
    unmeasurable: rows.filter((x) => x.history).length,
    branches_with_unmerged_work: measured.length,
    total_commit_hours_at_risk: measured.reduce((s, x) => s + x.commit_hours_at_risk, 0),
    conflicting_now: measured.filter((x) => x.would_conflict === true).length,
    branches: rows,
  };
}

function cost(repo, main, since) {
  const lines = git(repo, ['log', '--first-parent', `--since=${since}`, '--format=%H%x09%P%x09%s', main]).split('\n').filter(Boolean);
  const repairs = [];
  for (const l of lines) {
    const [sha, parents, subject] = l.split('\t');
    const ps = parents.split(' ').filter(Boolean);
    let why = null;
    if (ps.length > 1) {
      const c = predictConflicts(repo, ps[0], ps[1]);
      if (c && c.length) why = `merge resolved ${c.length} conflicting file(s)`;
    }
    if (!why && /^Revert "/.test(subject)) why = 'revert';
    if (!why && REPAIR_SUBJECT.test(subject)) why = 'subject names a repair';
    if (why) repairs.push({ sha: sha.slice(0, 8), subject, why });
  }
  const total = lines.length;
  return {
    main, since, commits: total, shallow: isShallow(repo),
    repair_commits: repairs.length,
    repair_share: total ? Math.round((repairs.length / total) * 1000) / 10 : 0,
    repairs,
    note: 'repair_share is the collision tax: the fraction of main-line work spent undoing or reconciling other work. Commit counts, not minutes — time spent is not recorded in git.',
  };
}

function gate(repo, main, now, maxHours, maxCommits) {
  const branch = git(repo, ['rev-parse', '--abbrev-ref', 'HEAD']);
  const e = branchExposure(repo, main, 'HEAD', now);
  const reasons = [];
  if (e) {
    if (e.oldest_unmerged_hours > maxHours) reasons.push(`oldest unmerged commit is ${e.oldest_unmerged_hours}h old (max ${maxHours}h)`);
    if (e.ahead > maxCommits) reasons.push(`${e.ahead} commits off ${main} (max ${maxCommits})`);
    if (e.would_conflict === true) reasons.push(`would conflict with ${main} in ${e.conflicting_files.length} file(s): ${e.conflicting_files.slice(0, 5).join(', ')}`);
  }
  return {
    branch, main, exposure: e,
    pass: reasons.length === 0,
    reasons,
    remedy: reasons.length ? 'Get this work onto the main line now: open (or update) the PR, merge the main line in if it conflicts, and ask for the merge. Finished work off the main line is the collision tax accruing.' : null,
  };
}

function human(sub, r) {
  const L = [];
  if (sub === 'exposure') {
    if (r.shallow) L.push('WARNING: shallow clone — branches without a common ancestor here are marked "?"; fetch deeper history for full numbers');
    L.push(`${r.branches_with_unmerged_work} branch(es) with work off ${r.main}; ${r.total_commit_hours_at_risk} commit-hours at risk; ${r.conflicting_now} would conflict now; ${r.unmeasurable} unmeasurable in this clone`);
    for (const b of r.branches.filter((x) => !x.history)) {
      L.push(`  ${b.branch.padEnd(56)} +${String(b.ahead).padEnd(4)} -${String(b.behind).padEnd(5)} ${String(b.oldest_unmerged_hours + 'h').padEnd(9)} ${String(b.commit_hours_at_risk).padEnd(7)} overlap ${String(b.overlapping_files).padEnd(4)} ${b.would_conflict === true ? 'CONFLICT (' + b.conflicting_files.length + ')' : b.would_conflict === 'unknown' ? '?' : 'clean'}`);
    }
  } else if (sub === 'cost') {
    if (r.shallow) L.push('WARNING: shallow clone — only the history present here was counted');
    L.push(`${r.repair_commits} of ${r.commits} commits on ${r.main} since ${r.since} were repair work — collision tax ${r.repair_share}%`);
    for (const x of r.repairs) L.push(`  ${x.sha} ${x.why.padEnd(38)} ${x.subject.slice(0, 90)}`);
    L.push(`  (${r.note})`);
  } else {
    L.push(r.pass ? `PASS — ${r.branch} is within exposure limits against ${r.main}` : `FAIL — ${r.branch}: ${r.reasons.join('; ')}`);
    if (r.remedy) L.push(`  ${r.remedy}`);
  }
  return L.join('\n') + '\n';
}

function main() {
  const { values, sub } = cliGate(process.argv.slice(2), CLI);
  const repo = values.repo || process.cwd();
  if (!['exposure', 'cost', 'gate'].includes(sub)) {
    process.stderr.write('cwos-collision-tax: choose exposure, cost or gate (see --help)\n');
    process.exit(2);
  }
  const m = mainRef(repo, values.main);
  if (!m) { process.stderr.write('cwos-collision-tax: no main line found (tried origin/master, origin/main, master, main); pass --main\n'); process.exit(2); }
  const now = values.now ? Date.parse(values.now) : Date.now();
  let r;
  if (sub === 'exposure') r = exposure(repo, m, now);
  else if (sub === 'cost') r = cost(repo, m, values.since || '30 days ago');
  else r = gate(repo, m, now, Number(values['max-hours'] || 8), Number(values['max-commits'] || 10));
  process.stdout.write(values.human ? human(sub, r) : JSON.stringify(r, null, 2) + '\n');
  if (sub === 'gate') process.exit(r.pass ? 0 : 1);
}

module.exports = { exposure, cost, gate, branchExposure, predictConflicts, REPAIR_SUBJECT };

if (require.main === module) main();
