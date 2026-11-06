#!/usr/bin/env node
/**
 * cwos-hygiene — the git broker's instrument for the repo you are standing in.
 *
 * The same findings cwos-fleet-scan --inflight reports for every repo on a node,
 * computed by the same lib (lib/git-hygiene.js), plus the three acts the /hygiene
 * broker is allowed to perform through a gate rather than by typing raw git:
 *
 *   scan              the findings, OPEN vs ACCOUNTED, in the standard shape
 *   archive <fp>      preserve an object under refs/hygiene/archive/..., push the
 *                     archive ref, THEN perform the destructive half (stash drop,
 *                     branch delete, remote branch delete). Refuses when the
 *                     classification does not permit it.
 *   ledger <fp>       record a disposition so the next session sees the finding
 *                     as ACCOUNTED instead of picking it up as new work
 *   ff                fast-forward every local branch that is only behind
 *
 * WHY ARCHIVE IS THE ONLY DESTRUCTIVE PATH. "Limited destructive authority" is
 * enforced by making destruction reversible first: the object stays reachable
 * under refs/hygiene/archive/<host>/<date>/..., and on origin when the push is
 * allowed. A unique stash is dropped only if that push landed — a stash is the
 * one git object that exists on exactly one machine.
 *
 * Exit codes: 0 ok | 1 refused, or --check found open findings | 2 bad command line.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { cliGate } = require('./lib/cli');
const { runGitInRepo } = require('./lib/shell-safe');
const H = require('./lib/git-hygiene');
const { writeFileAtomic } = require('./lib/cwos-utils');

const CLI = {
  name: 'cwos-hygiene',
  summary: 'git hygiene findings, archive-gated cleanup, and the disposition ledger for this repo',
  subcommands: {
    scan: 'report findings (default output is the standard /hygiene block)',
    archive: 'archive <fingerprint> then drop/delete it — only where its class permits',
    ledger: 'ledger <fingerprint> --disposition kept|waiting|owned|resolved --reason "..."',
    ff: 'fast-forward every local branch that is behind its upstream and not ahead',
  },
  flags: {
    json: { type: 'boolean', describe: 'machine-readable output' },
    check: { type: 'boolean', describe: 'scan: exit 1 while any finding is OPEN (not resolved, not ledgered)' },
    all: { type: 'boolean', describe: 'scan: also list ACCOUNTED findings' },
    'dry-run': { type: 'boolean', describe: 'archive/ff: say what would happen, change nothing' },
    'no-push': { type: 'boolean', describe: 'archive: keep the archive ref local (unique stashes are then kept)' },
    judged: { type: 'string', placeholder: 'P-NNN', describe: 'archive: a CONFLICTS remote branch you READ and judged landed — needs a POLICY.md entry + --reason' },
    disposition: { type: 'string', placeholder: 'kind', describe: 'ledger: kept | waiting | owned | resolved' },
    reason: { type: 'string', placeholder: 'text', describe: 'ledger: why — the next session reads this instead of re-investigating' },
    owner: { type: 'string', placeholder: 'who', describe: 'ledger: session id, branch owner, or "founder"' },
    policy: { type: 'string', placeholder: 'P-NNN', describe: 'ledger: the .claude/hygiene/POLICY.md entry this rests on' },
    'recheck-after': { type: 'string', placeholder: 'YYYY-MM-DD', describe: 'ledger: the finding reopens on this date' },
    'stale-days': { type: 'string', placeholder: 'n', describe: 'remote LANDED branches younger than this are left alone (default 7)' },
    stranded: { type: 'boolean', describe: 'scan: only work stranded on branches (refs only, cached, time-budgeted; the SessionStart check)' },
    quiet: { type: 'boolean', describe: 'scan --stranded: print nothing when every branch was read, refs are fresh, and nothing is open' },
    'fetch-if-stale': { type: 'boolean', describe: 'scan --stranded: when refs are a day old, start a background fetch (not waited for) so the NEXT session sees fresh refs' },
    'budget-ms': { type: 'string', placeholder: 'ms', describe: 'scan --stranded: stop classifying after this long; the rest is PENDING and resumes next run (default 5000)' },
    'repo-root': { type: 'string', placeholder: 'path', describe: 'repo to act on (default: the one containing cwd)' },
  },
  notes: [
    'Fingerprints come from `scan --json` (e.g. stash:<sha>, remote:origin/x:<sha>).',
    'A fingerprint names the object state it was judged on: when a branch tip moves,',
    'its old ledger row stops matching and the finding reopens by itself.',
    '',
    'Fleet-wide view of the same findings: cwos-fleet-scan.js --inflight (HomeBase).',
  ].join('\n'),
};

function repoRoot(values) {
  const start = values['repo-root'] ? path.resolve(values['repo-root']) : process.cwd();
  const r = runGitInRepo(start, ['rev-parse', '--show-toplevel'], { timeout: 5000 });
  if (!r.ok) { process.stderr.write(`cwos-hygiene: not a git repo: ${start}\n`); process.exit(1); }
  return String(r.stdout).trim();
}

function git(repo, args, timeout) {
  const r = runGitInRepo(repo, args, { timeout: timeout || 30000 });
  return { ok: r.ok, out: String(r.stdout || '').trim(), err: String(r.stderr || '').trim() };
}

function inFlightCounts(repo) {
  const br = git(repo, ['rev-parse', '--abbrev-ref', 'HEAD']);
  const st = git(repo, ['status', '--porcelain']);
  return {
    branch: br.ok ? br.out : null,
    dirty_count: st.ok ? st.out.split('\n').filter((l) => l.trim()).length : null,
    ref_integrity: br.ok ? 'ok' : null,
  };
}

function collect(repo, values) {
  const inFlight = inFlightCounts(repo);
  const detail = H.getHygieneDetail(repo, inFlight);
  const staleDays = values['stale-days'] ? parseInt(values['stale-days'], 10) : 7;
  const ledger = H.readLedger(repo);
  const findings = H.applyLedger(H.buildFindings(inFlight, detail, { repo, staleDays }), ledger);
  return { repo, inFlight, detail, ledger, findings, summary: H.summarize(findings) };
}

// ─── scan ────────────────────────────────────────────────────────────────────

function printScan(c, values) {
  const name = path.basename(c.repo);
  const d = c.detail;
  console.log(`HYGIENE ${name} @ ${os.hostname()} — ${new Date().toISOString()}`);
  console.log(`  base: ${d.default_ref || 'UNRESOLVED'} · last fetch: ${d.last_fetch_days == null ? 'never/unknown' : d.last_fetch_days + 'd'}` +
    `${d.shallow ? ' · SHALLOW clone (history-dependent reads are partial)' : ''}`);
  console.log(`  findings: ${c.summary.total} · open ${c.summary.open} · accounted ${c.summary.accounted}` +
    `${c.ledger.bad ? ` · ${c.ledger.bad} unreadable ledger rows` : ''}`);
  const order = [H.CLASS.STOP, H.CLASS.GATED, H.CLASS.OWNER, H.CLASS.ARCHIVE, H.CLASS.SAFE];
  for (const cls of order) {
    const rows = c.findings.filter((f) => f.class === cls && (values.all || !f.accounted));
    if (!rows.length) continue;
    console.log(`\n  ${cls}`);
    for (const f of rows) {
      const tag = f.accounted ? `  [ACCOUNTED: ${f.ledger.disposition}${f.ledger.owner ? ' · ' + f.ledger.owner : ''}]` : '';
      console.log(`    ${f.kind.padEnd(9)} ${f.subject} — ${f.state}${tag}`);
      console.log(`              → ${f.action}`);
      console.log(`              fp ${f.fingerprint}`);
    }
  }
  console.log('\n  Not visible from here: other machines\' stashes, unpushed commits and dirty trees.');
  console.log('  Run this on each node, or cwos-fleet-scan.js --inflight on each node, for those.');
}

// ─── archive ─────────────────────────────────────────────────────────────────

/**
 * Content-addressed: the object's own sha is in the name. A positional label
 * (stash@{0}) shifts every time an earlier stash is dropped, so two archives on
 * one day collided and the second silently repointed the first (review, 2026-09-26).
 */
function archiveRefName(f, sha) {
  const date = new Date().toISOString().slice(0, 10);
  const name = f.kind === 'stash'
    ? 'stash'
    : f.subject.replace(/\s.*$/, '').replace(/[^A-Za-z0-9._/-]+/g, '-').replace(/^refs\//, '');
  return `refs/hygiene/archive/${os.hostname().toLowerCase()}/${date}/${f.kind}/${name}-${sha.slice(0, 12)}`;
}

function doArchive(c, fpArg, values) {
  const f = c.findings.find((x) => x.fingerprint === fpArg);
  if (!f) { console.error(`refused: no current finding has fingerprint ${fpArg} (rescan — the object may have moved)`); return 1; }
  // The one widening of the gate: a remote branch that CONFLICTS with the default
  // branch cannot be classified mechanically (a squash-merged branch whose files
  // moved on afterwards looks exactly like unmerged work). A broker who has READ
  // it may archive it — but only on a written precedent, with a reason, and only
  // if the archive reaches origin, so the judgement is recoverable if wrong.
  // STRANDED is never judgeable: a clean merge that changes base IS unlanded work.
  const judged = values.judged;
  if (judged) {
    if (!(f.kind === 'remote' && /^CONFLICTS/.test(f.state))) {
      console.error(`refused: --judged applies only to a remote branch that CONFLICTS; ${f.subject} is ${f.state}`);
      return 1;
    }
    let policy = '';
    try { policy = require('fs').readFileSync(path.join(c.repo, H.POLICY_REL), 'utf8'); } catch { /* absent */ }
    if (!new RegExp(`^## ${judged.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'm').test(policy)) {
      console.error(`refused: ${H.POLICY_REL} has no "## ${judged}" entry — write the precedent first`);
      return 1;
    }
    if (!values.reason || values.reason.length < 12) { console.error('refused: --judged needs --reason (what you read)'); return 1; }
    if (values['no-push']) { console.error('refused: a judged archive must reach origin (drop --no-push)'); return 1; }
  } else if (f.class !== H.CLASS.ARCHIVE) {
    console.error(`refused: ${f.subject} is ${f.class}, not ARCHIVE — ${f.action}`);
    return 1;
  }
  const sha = f.fingerprint.split(':').pop();
  const ref = archiveRefName(f, sha);
  const plan = [`git update-ref ${ref} ${sha}`];
  if (!values['no-push']) plan.push(`git push origin ${ref}`);
  let destroy;
  if (f.kind === 'stash') destroy = ['stash', 'drop', f.subject.split(' ')[0]];
  else if (f.kind === 'branch') destroy = ['branch', '-D', f.subject];
  else if (f.kind === 'remote') {
    // Only origin branches are ever findings; refuse anything else outright.
    if (!f.subject.startsWith('origin/')) { console.error(`refused: ${f.subject} is not on origin`); return 1; }
    destroy = ['push', 'origin', '--delete', f.subject.slice('origin/'.length)];
  } else { console.error(`refused: no archive action for kind ${f.kind}`); return 1; }
  plan.push(`git ${destroy.join(' ')}`);

  if (values['dry-run']) { console.log(`would:\n  ${plan.join('\n  ')}`); return 0; }

  // Create-only (old value = empty): an existing ref is never repointed. The name
  // carries the sha, so an existing ref already holds this object — reuse it.
  const existing = git(c.repo, ['rev-parse', '--verify', '--quiet', ref]);
  if (existing.ok && existing.out !== sha) { console.error(`refused: ${ref} exists and points elsewhere`); return 1; }
  if (!existing.ok) {
    const u = git(c.repo, ['update-ref', ref, sha, '']);
    if (!u.ok) { console.error(`refused: could not write archive ref: ${u.err}`); return 1; }
  }
  let pushed = false;
  if (!values['no-push']) {
    const p = git(c.repo, ['push', 'origin', `${ref}:${ref}`], 60000);
    pushed = p.ok;
    if (!p.ok) console.error(`archive push failed (kept local at ${ref}): ${p.err.split('\n')[0]}`);
  }
  // A unique stash exists nowhere but this disk. Dropping it with only a local
  // archive ref would still leave it on one machine, invisible to the fleet.
  if (judged && !pushed) {
    console.log(`kept ${f.subject}: a judged deletion needs its archive on origin, and the push failed. Ledger it instead.`);
    return 1;
  }
  if (f.kind === 'stash' && f.unique && !pushed) {
    console.log(`kept ${f.subject}: unique content and the archive is local-only. Ledger it:`);
    console.log(`  cwos-hygiene ledger ${f.fingerprint} --disposition kept --reason "..." --owner ...`);
    return 1;
  }
  const d = git(c.repo, destroy, 60000);
  if (!d.ok) { console.error(`archived at ${ref}, but ${destroy.join(' ')} failed: ${d.err.split('\n')[0]}`); return 1; }
  H.appendLedger(c.repo, { fingerprint: f.fingerprint, disposition: 'resolved',
    reason: `archived to ${ref}${pushed ? ' (pushed to origin)' : ' (local only)'} then removed: ${f.state}` +
      (judged ? ` — judged landed: ${values.reason}` : ''),
    archive_ref: ref, policy: judged || null });
  console.log(`archived ${f.subject} → ${ref}${pushed ? ' (on origin)' : ' (local)'}; removed. Restore: git ${
    f.kind === 'stash' ? `stash store -m restored ${sha}` : `branch <name> ${sha}`}`);
  return 0;
}

// ─── ledger ──────────────────────────────────────────────────────────────────

function doLedger(c, fpArg, values) {
  if (!c.findings.some((x) => x.fingerprint === fpArg) && values.disposition !== 'resolved') {
    console.error(`refused: no current finding has fingerprint ${fpArg} (rescan — the object may have moved)`);
    return 1;
  }
  try {
    const row = H.appendLedger(c.repo, {
      fingerprint: fpArg, disposition: values.disposition, reason: values.reason,
      owner: values.owner || null, policy: values.policy || null, recheck_after: values['recheck-after'] || null,
    });
    console.log(`ledgered ${fpArg}: ${row.disposition}${row.owner ? ' · ' + row.owner : ''} → ${H.LEDGER_REL} (commit it)`);
    return 0;
  } catch (e) { console.error(`refused: ${e.message}`); return 1; }
}

// ─── ff ──────────────────────────────────────────────────────────────────────

// Branch -> worktree path for every worktree (WS-1147). Moving a ref under a
// worktree leaves its files at the old commit, so the next commit there reverts.
// null = the list could not be read, which a caller must not treat as "no owners".
function worktreeOwners(repo) {
  const owners = new Map();
  const r = git(repo, ['worktree', 'list', '--porcelain']);
  if (!r.ok) return null;
  let wt = null;
  for (const line of r.out.split('\n')) {
    if (line.startsWith('worktree ')) wt = line.slice(9);
    else if (line.startsWith('branch refs/heads/') && wt) owners.set(line.slice(18), wt);
  }
  return owners;
}

function doFf(c, values) {
  const current = c.inFlight.branch;
  const owners = worktreeOwners(c.repo);
  let rc = 0;
  for (const b of c.detail.local_branches || []) {
    if (!b.upstream || b.upstream_gone || !b.behind || b.ahead) continue;
    if (b.name !== current && owners === null) {
      console.log(`skip ${b.name}: could not list worktrees, so cannot prove no worktree has it checked out`);
      continue;
    }
    if (b.name !== current && owners.has(b.name)) {
      console.log(`skip ${b.name}: OWNER is the worktree at ${owners.get(b.name)} (checked out there; fast-forward it from inside that worktree)`);
      continue;
    }
    const args = b.name === current
      ? ['merge', '--ff-only', '--quiet', b.upstream]
      : ['update-ref', `refs/heads/${b.name}`, b.upstream, b.sha];   // CAS on the old tip
    if (b.name === current && c.inFlight.dirty_count) { console.log(`skip ${b.name}: checked out with uncommitted work`); continue; }
    if (values['dry-run']) { console.log(`would fast-forward ${b.name} by ${b.behind}`); continue; }
    const r = git(c.repo, args);
    if (r.ok) console.log(`fast-forwarded ${b.name} by ${b.behind}`);
    else { console.error(`could not fast-forward ${b.name}: ${r.err.split('\n')[0]}`); rc = 1; }
  }
  return rc;
}

// ─── scan --stranded (WS-270) ────────────────────────────────────────────────

const STRANDED_SHOW = 8;

/** The lines a session sees. Empty only when there is truly nothing to say. */
function strandedLines(r) {
  const out = [];
  const name = path.basename(r.repo);
  if (r.open.length) {
    const stranded = r.open.filter((x) => x.state === 'STRANDED').length;
    out.push(`STRANDED WORK — ${name}: ${r.open.length} branch(es) hold work ${r.base || 'the default branch'} does not have` +
      ` (${stranded} clean to merge, ${r.open.length - stranded} conflicting)`);
    const rows = [...r.open].sort((a, b) => (a.state === 'STRANDED' ? 0 : 1) - (b.state === 'STRANDED' ? 0 : 1));
    for (const x of rows.slice(0, STRANDED_SHOW)) {
      const files = x.files == null ? '' : `, ${x.files} file(s)`;
      const age = x.age_days == null ? '' : `, ${x.age_days}d old`;
      out.push(`  ${x.name} — ${x.state}${files}${age}${x.local ? ` — ${x.local}, exists on this machine only` : ''}`);
    }
    if (rows.length > STRANDED_SHOW) out.push(`  … and ${rows.length - STRANDED_SHOW} more`);
    out.push('  Land it (PR into the default branch), or ledger why it waits so it stops showing:');
    out.push('    node kit/scripts/cwos-hygiene.js scan          # fingerprints');
    out.push('    node kit/scripts/cwos-hygiene.js ledger <fp> --disposition waiting --reason "..." --owner <who>');
  }
  const warn = [];
  if (!r.has_origin) warn.push('no origin remote — remote branches cannot be checked here');
  else if (r.fetch_age_days === null) warn.push('remote refs never fetched here — the stranded count may be LOW');
  else if (r.fetch_age_days >= 1) warn.push(`remote refs ${r.fetch_age_days}d old — the stranded count may be LOW`);
  if (!r.base) warn.push('no default branch resolved — nothing could be classified');
  if (r.unknown.length) {
    const why = [...new Set(r.unknown.map((u) => u.why).filter(Boolean))].slice(0, 2).join('; ');
    warn.push(`${r.unknown.length} branch(es) unclassifiable${r.shallow ? ' (shallow clone)' : ''}${why ? ` — ${why}` : ''}`);
  }
  if (r.pending) warn.push(`check incomplete after ${(r.elapsed_ms / 1000).toFixed(1)}s: ${r.classified + r.unknown.length} of ${r.candidates} branches read; the rest resume next session`);
  if (warn.length) {
    if (!out.length) out.push(`STRANDED WORK — ${path.basename(r.repo)}: not fully checked`);
    for (const w of warn) out.push(`  ⚠ ${w}`);
  }
  return out;
}

/** Fire-and-forget fetch so the next session reads fresh refs. Never waited on. */
function backgroundFetch(repo) {
  const marker = path.join(repo, '.claude', 'workstream', 'liveness', 'stranded-fetch.stamp');
  try {
    // One attempt per 10 minutes, however many sessions start at once.
    if (Date.now() - fs.statSync(marker).mtimeMs < 10 * 60000) return false;
  } catch { /* no marker yet */ }
  try {
    fs.mkdirSync(path.dirname(marker), { recursive: true });
    writeFileAtomic(marker, new Date().toISOString() + '\n');
    const child = spawn('git', ['-c', 'http.lowSpeedLimit=1000', '-c', 'http.lowSpeedTime=10',
      'fetch', '--prune', '--quiet', 'origin'], { cwd: repo, detached: true, stdio: 'ignore', windowsHide: true });
    child.on('error', () => {});
    child.unref();
    return true;
  } catch { return false; }
}

function doStranded(repo, values) {
  const started = new Date().toISOString();
  // Written BEFORE the work on purpose, and overwritten after it: a `start`
  // that is never replaced is how a reader knows the check died mid-run.
  H.writeStrandedHeartbeat(repo, `start ${started}`);
  let r;
  try {
    const budget = values['budget-ms'] != null ? parseInt(values['budget-ms'], 10) : 5000;
    r = H.strandedCheck(repo, { budgetMs: Number.isFinite(budget) ? budget : 5000 });
  } catch (e) {
    const msg = String(e && e.message || e).split('\n')[0].slice(0, 200);
    H.writeStrandedHeartbeat(repo, `error ${new Date().toISOString()} ${msg}`);
    // Even in --quiet: a check that could not run must never look like a clean one.
    console.log(`STRANDED WORK — ${path.basename(repo)}: the check FAILED (${msg}) — not checked, not clean`);
    return values.check ? 1 : 0;
  }
  if (values['fetch-if-stale'] && r.has_origin && (r.fetch_age_days === null || r.fetch_age_days >= 1)) backgroundFetch(repo);
  H.writeStrandedHeartbeat(repo, `done ${new Date().toISOString()} candidates=${r.candidates} classified=${r.classified}` +
    ` unknown=${r.unknown.length} pending=${r.pending} open=${r.open.length} accounted=${r.accounted}` +
    ` fetch_age_days=${r.fetch_age_days == null ? 'never' : r.fetch_age_days} ms=${r.elapsed_ms}`);
  if (values.json) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    const ls = strandedLines(r);
    if (ls.length) console.log(ls.join('\n'));
    else if (!values.quiet) {
      console.log(`stranded work — ${path.basename(repo)}: none open (${r.classified} of ${r.candidates} branches read, ` +
        `${r.accounted} ledgered, refs ${r.fetch_age_days}d old)`);
    }
  }
  return values.check && (r.open.length || r.pending || r.unknown.length) ? 1 : 0;
}

function main() {
  const { values, positionals, sub } = cliGate(process.argv.slice(2), CLI);
  const repo = repoRoot(values);
  // Before collect(): the stranded check exists to avoid the full scan's cost.
  if (sub === 'scan' && values.stranded) process.exit(doStranded(repo, values));
  const c = collect(repo, values);

  if (sub === 'scan') {
    if (values.json) console.log(JSON.stringify({ repo, host: os.hostname(), summary: c.summary,
      detail: c.detail, findings: c.findings }, null, 2));
    else printScan(c, values);
    process.exit(values.check && c.summary.open ? 1 : 0);
  }
  if (sub === 'archive') {
    if (!positionals[0]) { console.error('archive needs a fingerprint'); process.exit(2); }
    process.exit(doArchive(c, positionals[0], values));
  }
  if (sub === 'ledger') {
    if (!positionals[0]) { console.error('ledger needs a fingerprint'); process.exit(2); }
    process.exit(doLedger(c, positionals[0], values));
  }
  if (sub === 'ff') process.exit(doFf(c, values));
}

if (require.main === module) main();

module.exports = { collect, archiveRefName };
