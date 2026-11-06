#!/usr/bin/env node
/**
 * cwos-founder-approval.js — the founder's `founder-approved` label merges a pull request by itself.
 *
 * Ships to every adopted repo as .github/scripts/cwos-founder-approval.js and is run by
 * .github/workflows/founder-approval.yml (main's copy only: the workflow fires on
 * pull_request_target, so the PR's own tree is never executed). It can also be run by hand,
 * read-only, with `decide`.
 *
 * WHY (founder, 2026-10-19): "Get the founder approved label working" — "links for me to start in
 * putting founder approved labels more broadly so you can merge async from me." Until today only
 * deckside acted on the label (pr-gate.yml + pr-risk.js labelApproval, docs/anchors/merge-gates.md);
 * 13 repos carried waiting:founder and nothing that could merge on his word.
 *
 * WHAT COUNTS AS HIS APPROVAL (ported from deckside's labelApproval, with one change of record):
 *   E  the PR's issue events: the latest labeled/unlabeled event for `founder-approved` is a
 *      `labeled` by the founder's own login with no performed_via_github_app (a cloud session acts
 *      through an app; a workflow token acts as github-actions[bot]; both refused), and the label is
 *      on the PR now. Removing it withdraws the approval.
 *   R  the record of WHICH COMMIT he approved. deckside writes it to node1's disk because its gate
 *      runs on a self-hosted runner; the other repos have none, so the record is a commit status
 *      `founder-approval` on the head SHA at the moment he labelled, whose target_url is the
 *      workflow run that wrote it. A status alone is forgeable (any PR-branch workflow posts as
 *      github-actions[bot] too), so `decide` opens the run the status points at and requires: the
 *      run's event is pull_request_target (only main's workflow produces one), its path is this
 *      workflow, its triggering actor is the founder, and it contains a job literally named
 *      `record-approval #<pr> <sha>` with conclusion success. Nobody can put a job into someone
 *      else's run, and that job's name is set by main's workflow from the event it was started by.
 *   A new push removes the label (the `synchronize` run) and has no job named with the new SHA.
 *
 * MERGE only when GitHub itself says the PR can merge right now: OPEN, not a draft,
 * mergeStateStatus CLEAN. BEHIND / BLOCKED / UNSTABLE / DIRTY wait, and the reason is written on
 * the PR. On a strict-protection repo a BEHIND PR is NOT updated by this script (that would make a
 * new head he never approved); a session updates it and he labels again. Method: a merge commit
 * (keeps the approved SHA reachable from main), squash only where merge commits are disallowed.
 *
 * AFTER A MERGE, dispatch the build. The merge is made with the workflow's GITHUB_TOKEN, and GitHub
 * starts no workflow for anything that token does except workflow_dispatch / repository_dispatch.
 * So a repo whose CI runs on `push: main` (and whose deploy runs on CI's completion) got NO CI and
 * NO deploy for any merge this script made: ServeYourNote #432, merged 2026-10-19 22:39Z by
 * github-actions, had zero CI check suites on its merge commit while production stayed on the
 * previous SHA, and nothing said so. `--dispatch-after-merge` names the workflows to start. Every
 * sweep (not only one that merged) checks the tip of each base it merged into plus the default
 * branch, and dispatches when that tip has no run of the workflow AND was merged by the token --
 * so a dispatch that failed is retried by the next sweep, with no state kept (needsBuild,
 * ensureBuilt). A workflow the repo does not have is skipped and said; one it has without a
 * workflow_dispatch trigger FAILS the sweep, because there every merge goes unbuilt.
 *
 * NEVER: adds the label (only he does; a session's tool call that tries is refused by
 * ~/.claude/hooks/founder-label-guard.cjs), merges anything the rules above do not clear, or
 * force-pushes. It removes the label only when it was not his, or when a new commit arrived.
 *
 *   node cwos-founder-approval.js verify-label --repo o/r --pr N --founder login [--sender login]
 *   node cwos-founder-approval.js record       --repo o/r --pr N --sha <40hex> --event-at <iso> --run-id <id> --run-url <url> --founder login
 *   node cwos-founder-approval.js unapprove    --repo o/r --pr N --why "<text>"
 *   node cwos-founder-approval.js decide       --repo o/r --pr N --founder login [--workflow-path .github/workflows/founder-approval.yml] [--json]
 *   node cwos-founder-approval.js merge        --repo o/r --pr N --founder login   (decides first; merges only on MERGE)
 *   node cwos-founder-approval.js sweep        --repo o/r --founder login [--workflow-path ...] [--dispatch-after-merge ci.yml[,...]] [--dry-run]
 *   node cwos-founder-approval.js repair       --repo o/r [--dispatch ci.yml[,...]] [--run-id <id>] [--workflow-path ...] [--dry-run]   (see "repairs" below; never exits red)
 *   node cwos-founder-approval.js --self-test
 */
'use strict';
const { execFileSync } = require('child_process');

const LABEL = 'founder-approved';
const CONTEXT = 'founder-approval';
const DEFAULT_WORKFLOW = '.github/workflows/founder-approval.yml';

// ---- arg parsing (no deps) ------------------------------------------------------------------
function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[k] = true;
      else { out[k] = next; i++; }
    } else out._.push(a);
  }
  return out;
}
const need = (args, k) => { if (!args[k] || args[k] === true) throw new Error(`--${k} is required`); return String(args[k]); };

// ---- gh --------------------------------------------------------------------------------------
function gh(argv, { input } = {}) {
  return execFileSync('gh', argv, { encoding: 'utf8', timeout: 60000, windowsHide: true, input, stdio: ['pipe', 'pipe', 'pipe'] });
}
function ghJson(argv) { return JSON.parse(gh(argv)); }
function ghNdjson(argv) { return gh(argv).split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)); }

// ---- pure decisions (self-tested) ------------------------------------------------------------
const asList = (x) => (Array.isArray(x) ? x : x && typeof x === 'object' ? [x] : []);

/** E: is the label on the PR by his own hand? */
function verifyLabelEvents({ labels, events, founder }) {
  const names = asList(labels).map((l) => (typeof l === 'string' ? l : l && l.name)).filter(Boolean);
  if (!names.includes(LABEL)) return { ok: false, why: `no ${LABEL} label on the PR` };
  if (!founder) return { ok: false, why: 'the founder login was not given: refused' };
  const mine = asList(events)
    .filter((e) => e && (e.event === 'labeled' || e.event === 'unlabeled') && e.label && e.label.name === LABEL)
    .sort((x, y) => Date.parse(x.created_at) - Date.parse(y.created_at));
  const e = mine[mine.length - 1];
  if (!e || e.event !== 'labeled') return { ok: false, why: `the ${LABEL} label is on the PR but its history does not end in it being added: refused` };
  const who = e.actor && e.actor.login;
  if (who !== founder) return { ok: false, why: `${LABEL} was last added by ${who || 'unknown'}, not by the founder: refused` };
  if (e.performed_via_github_app) return { ok: false, why: `${LABEL} was added through the ${e.performed_via_github_app.slug || 'an'} app integration, not by the founder's own tap: refused` };
  if (!Number.isFinite(Date.parse(e.created_at))) return { ok: false, why: `the ${LABEL} event has no time: refused` };
  return { ok: true, event_at: e.created_at, why: `the founder added ${LABEL} at ${e.created_at}` };
}

const runIdOf = (url) => { const m = /\/actions\/runs\/(\d+)/.exec(String(url || '')); return m ? m[1] : null; };
const jobNameFor = (pr, sha) => `record-approval #${pr} ${sha}`;

/** R: does the head carry a record written by main's workflow for exactly this PR and SHA? */
function verifyRecord({ statuses, run, jobs, pr, sha, founder, workflowPath = DEFAULT_WORKFLOW }) {
  const mine = asList(statuses).filter((s) => s && s.context === CONTEXT)
    .sort((x, y) => Date.parse(y.created_at || 0) - Date.parse(x.created_at || 0));
  const latest = mine[0];
  if (!latest) return { ok: false, why: `no ${CONTEXT} status on ${sha.slice(0, 7)}: he has not approved this commit` };
  if (latest.state !== 'success') return { ok: false, why: `the latest ${CONTEXT} status on ${sha.slice(0, 7)} is ${latest.state}: ${latest.description || ''}`.trim() };
  const runId = runIdOf(latest.target_url);
  if (!runId) return { ok: false, why: `the ${CONTEXT} status on ${sha.slice(0, 7)} does not point at a workflow run: refused` };
  if (!run) return { ok: false, why: `run ${runId} named by the status could not be read: refused` };
  if (String(run.id) !== String(runId)) return { ok: false, why: `run mismatch (${run.id} vs ${runId}): refused` };
  if (run.event !== 'pull_request_target') return { ok: false, why: `run ${runId} was a ${run.event} run, not main's pull_request_target workflow: refused` };
  if (run.path !== workflowPath) return { ok: false, why: `run ${runId} ran ${run.path}, not ${workflowPath}: refused` };
  const actor = run.triggering_actor && run.triggering_actor.login;
  if (actor !== founder) return { ok: false, why: `run ${runId} was started by ${actor || 'unknown'}, not the founder: refused` };
  const want = jobNameFor(pr, sha);
  // Every attempt of the run, not only the latest (readJobs asks for filter=all). A re-run never
  // writes a record by design (its job is skipped, or on older copies ends failure); reading only the latest attempt turned a
  // valid approval into a refusal (ai-personal #164, 2026-11-01: the run was re-run because its
  // sweep job had been cancelled). Revocation is the label history and the head SHA, never a re-run.
  // Safe only because founder-approval.yml's record job runs on attempt 1 alone (job-level
  // `github.run_attempt == 1`, WS-1372; the step still exits 1 on GITHUB_RUN_ATTEMPT != 1), so a
  // success can come from attempt 1 alone. Removing that guard makes this an attempt-mixing hole.
  const matching = asList(jobs).filter((j) => j && j.name === want);
  const job = matching.find((j) => j.conclusion === 'success') || matching[matching.length - 1];
  if (!job) return { ok: false, why: `run ${runId} has no job "${want}": his approval was for another commit or another PR. Remove and re-add the label to approve ${sha.slice(0, 7)}` };
  if (job.conclusion !== 'success') return { ok: false, why: `run ${runId} job "${want}" ended ${job.conclusion || job.status}: the add was refused at the time` };
  return { ok: true, run_id: runId, why: `recorded by run ${runId}, job "${want}"` };
}

/** The whole judgement, from data. */
/**
 * UNSTABLE that is only this run. Every run of this workflow posts check runs on the PR's head
 * (label, record-approval, sweep), and while the sweep job is still deciding, GitHub counts it as
 * a pending check and reports the PR UNSTABLE. So the run that his tap starts could never merge
 * what it had just recorded: on 2026-11-01 all four labelled PRs (ServeYourNote #530, ai-personal
 * #153, nutrition #81, PT #36) waited "UNSTABLE" until a later run, and the schedule that is meant
 * to come every 15 minutes came 1.5-3.5 hours apart. UNSTABLE is treated as CLEAN only when every
 * check run on the head that is not green belongs to THIS run (ownRunId, from GITHUB_RUN_ID).
 * Any other pending or failed check still waits. No run id, or an unreadable list, waits.
 *
 * One more is excused: a `sweep` job CANCELLED in an earlier run of this same workflow. The sweep's
 * job-level concurrency group keeps one pending sweep and cancels the one it replaces (by design,
 * see founder-approval.yml: "a replaced pending sweep loses nothing"). But a labeled run is attached
 * to the PR's head, so its cancelled sweep stays on that head as a non-green check, the PR reads
 * UNSTABLE for good, and no later sweep merges it. Measured 2026-11-04: ai-personal #187 and #193
 * sat approved 5h+ on exactly that; re-running the cancelled job merged #193 within minutes.
 * `sameWorkflowRunIds` holds the run ids the caller confirmed ran this workflow's file.
 */
function unstableIsOnlySelf(checkRuns, ownRunId, sameWorkflowRunIds = new Set()) {
  if (!ownRunId || !Array.isArray(checkRuns)) return false;
  const green = new Set(['success', 'skipped', 'neutral']);
  const notGreen = checkRuns.filter((c) => !(c.status === 'completed' && green.has(c.conclusion)));
  const runOf = (c) => runIdOf(c.html_url || c.details_url || '');
  const excused = (c) => (c.status !== 'completed' && runOf(c) === String(ownRunId))
    || (isReplacedSweep(c) && sameWorkflowRunIds.has(String(runOf(c))));
  return notGreen.length > 0 && notGreen.every(excused);
}
function isReplacedSweep(c) {
  return Boolean(c) && c.name === 'sweep' && c.status === 'completed' && c.conclusion === 'cancelled';
}

function decideFromData({ pr, labels, events, statuses, run, jobs, founder, workflowPath, checkRuns, ownRunId, sameWorkflowRunIds }) {
  if (!pr) return { ok: false, stage: 'pr', why: 'no PR' };
  if (pr.state !== 'OPEN') return { ok: false, stage: 'pr', why: `PR is ${pr.state}` };
  if (pr.isDraft) return { ok: false, stage: 'pr', why: 'PR is a draft' };
  const e = verifyLabelEvents({ labels, events, founder });
  if (!e.ok) return { ok: false, stage: 'label', why: e.why };
  const r = verifyRecord({ statuses, run, jobs, pr: pr.number, sha: pr.headRefOid, founder, workflowPath });
  if (!r.ok) return { ok: false, stage: 'record', why: r.why };
  const selfOnly = pr.mergeStateStatus === 'UNSTABLE' && unstableIsOnlySelf(checkRuns, ownRunId, sameWorkflowRunIds);
  if (pr.mergeStateStatus !== 'CLEAN' && !selfOnly) {
    return { ok: false, stage: 'mergeable', why: `approved by the founder at ${e.event_at} for ${pr.headRefOid.slice(0, 7)}, waiting: mergeStateStatus is ${pr.mergeStateStatus}` };
  }
  return { ok: true, stage: 'merge', event_at: e.event_at, run_id: r.run_id, why: `approved by the founder at ${e.event_at} for ${pr.headRefOid.slice(0, 7)}; ${r.why}; ${selfOnly ? 'UNSTABLE only from this run\'s own jobs' : 'CLEAN'}` };
}

// ---- live wrappers ---------------------------------------------------------------------------
function readPr(repo, pr) {
  return ghJson(['pr', 'view', String(pr), '-R', repo, '--json', 'number,state,isDraft,headRefOid,mergeStateStatus,labels,url,baseRefName']);
}
function readEvents(repo, pr) {
  return ghNdjson(['api', `repos/${repo}/issues/${pr}/events`, '--paginate', '--jq', '.[]']);
}
function readStatuses(repo, sha) {
  return ghJson(['api', `repos/${repo}/commits/${sha}/statuses?per_page=100`]);
}
function readRun(repo, runId) {
  try { return ghJson(['api', `repos/${repo}/actions/runs/${runId}`]); } catch { return null; }
}
function readJobs(repo, runId) {
  try { return ghJson(['api', `repos/${repo}/actions/runs/${runId}/jobs?filter=all&per_page=100`]).jobs || []; } catch { return []; }
}
function comment(repo, pr, body) {
  try { gh(['pr', 'comment', String(pr), '-R', repo, '--edit-last', '--body', body]); }
  catch { gh(['pr', 'comment', String(pr), '-R', repo, '--body', body]); }
}
function removeLabel(repo, pr) {
  try { gh(['pr', 'edit', String(pr), '-R', repo, '--remove-label', LABEL]); return true; } catch (e) { return false; }
}

function cmdVerifyLabel(args) {
  const repo = need(args, 'repo'), pr = Number(need(args, 'pr')), founder = need(args, 'founder');
  const prData = readPr(repo, pr);
  const v = verifyLabelEvents({ labels: prData.labels, events: readEvents(repo, pr), founder });
  if (args.sender && args.sender !== founder && v.ok) v.ok = false, v.why = `the labeled event was sent by ${args.sender}, not the founder: refused`;
  console.log(JSON.stringify(v));
  if (!v.ok) {
    removeLabel(repo, pr);
    comment(repo, pr, `founder-approval: ${v.why}. The label was removed; only the founder's own tap in GitHub approves.`);
    return 1;
  }
  return 0;
}

/**
 * The commit he tapped must still be the PR's head when the record is written. The `synchronize`
 * job only runs on a PR whose push payload already carried the label (a billed job per push was
 * the alternative), so a push racing his tap could leave a label on a head he never saw. Reading
 * the LIVE head here closes that: a record is only ever written for the commit that is the head now.
 */
function headStillMatches(liveSha, sha) {
  if (!liveSha || !sha) return { ok: false, why: 'the PR\'s current head could not be read: no record written' };
  if (String(liveSha) !== String(sha)) return { ok: false, why: `the PR moved from ${String(sha).slice(0, 7)} to ${String(liveSha).slice(0, 7)} while the founder's tap was being recorded: no record written` };
  return { ok: true };
}

function cmdRecord(args) {
  const repo = need(args, 'repo'), pr = need(args, 'pr'), sha = need(args, 'sha'), founder = need(args, 'founder');
  const runUrl = need(args, 'run-url'), eventAt = args['event-at'] || '';
  let live = null;
  try { live = readPr(repo, pr).headRefOid; } catch { live = null; }
  const h = headStillMatches(live, sha);
  if (!h.ok) {
    const removed = removeLabel(repo, pr);
    comment(repo, pr, `founder-approval: ${h.why}. The ${LABEL} label was ${removed ? 'removed' : 'NOT removed (edit failed)'}; label the current commit to approve it.`);
    console.log(h.why);
    return 1;
  }
  gh(['api', '-X', 'POST', `repos/${repo}/statuses/${sha}`,
    '-f', 'state=success', '-f', `context=${CONTEXT}`,
    '-f', `description=approved by ${founder}${eventAt ? ` at ${eventAt}` : ''} (PR #${pr}, this commit only)`,
    '-f', `target_url=${runUrl}`]);
  comment(repo, pr, `founder-approval: the founder approved ${sha.slice(0, 7)}${eventAt ? ` at ${eventAt}` : ''}. It merges by itself once GitHub says it can (CLEAN); a new commit needs a new label.`);
  console.log(`recorded ${CONTEXT} success on ${sha} -> ${runUrl}`);
  return 0;
}

function cmdUnapprove(args) {
  const repo = need(args, 'repo'), pr = need(args, 'pr'), why = args.why && args.why !== true ? String(args.why) : 'a new commit arrived';
  const prData = readPr(repo, pr);
  const names = asList(prData.labels).map((l) => l.name);
  if (!names.includes(LABEL)) { console.log('no label to remove'); return 0; }
  const removed = removeLabel(repo, pr);
  comment(repo, pr, `founder-approval: ${why}; the ${LABEL} label was ${removed ? 'removed' : 'NOT removed (edit failed)'}. The founder's approval covered the previous commit only; this one needs its own.`);
  return removed ? 0 : 1;
}

function readCheckRuns(repo, sha) {
  try { return ghJson(['api', `repos/${repo}/commits/${sha}/check-runs?per_page=100`]).check_runs || null; } catch { return null; }
}
function liveDecide(repo, prNum, founder, workflowPath) {
  // UNKNOWN means GitHub has not computed mergeability yet; it settles within seconds of a read.
  let pr = readPr(repo, prNum);
  for (let i = 1; i <= 3 && pr.mergeStateStatus === 'UNKNOWN'; i++) { sleepMs(i * 3000); pr = readPr(repo, prNum); }
  const events = readEvents(repo, prNum);
  const statuses = pr.headRefOid ? readStatuses(repo, pr.headRefOid) : [];
  const latest = asList(statuses).filter((s) => s.context === CONTEXT).sort((x, y) => Date.parse(y.created_at) - Date.parse(x.created_at))[0];
  const runId = latest ? runIdOf(latest.target_url) : null;
  const run = runId ? readRun(repo, runId) : null;
  const jobs = runId ? readJobs(repo, runId) : [];
  const ownRunId = process.env.GITHUB_RUN_ID || null;
  const checkRuns = pr.mergeStateStatus === 'UNSTABLE' && ownRunId && pr.headRefOid ? readCheckRuns(repo, pr.headRefOid) : null;
  // A cancelled `sweep` is excused only once its run is read and found to be this workflow's file.
  const sameWorkflowRunIds = new Set();
  for (const id of new Set(asList(checkRuns).filter(isReplacedSweep).map((c) => String(runIdOf(c.html_url || c.details_url || ''))))) {
    const r = id && id !== 'null' ? readRun(repo, id) : null;
    if (r && r.path === workflowPath) sameWorkflowRunIds.add(id);
  }
  const d = decideFromData({ pr, labels: pr.labels, events, statuses, run, jobs, founder, workflowPath, checkRuns, ownRunId, sameWorkflowRunIds });
  return { pr, decision: d };
}

function cmdDecide(args) {
  const repo = need(args, 'repo'), pr = Number(need(args, 'pr')), founder = need(args, 'founder');
  const { decision, pr: p } = liveDecide(repo, pr, founder, args['workflow-path'] || DEFAULT_WORKFLOW);
  if (args.json) console.log(JSON.stringify({ pr: p.number, url: p.url, head: p.headRefOid, ...decision }, null, 2));
  else console.log(`${p.url} ${decision.ok ? 'MERGE' : 'WAIT'} [${decision.stage}] ${decision.why}`);
  return decision.ok ? 0 : 1;
}

// A merge commit by preference: it keeps the SHA he approved reachable from main, so "he approved
// A" stays checkable later with `git merge-base --is-ancestor A main`. Squash rewrites it away.
// Never rebase. Branch deletion is left to the repo's delete_branch_on_merge setting: deleting a
// branch that is another PR's base closes that PR (women-s-health base.yml records the incident).
function mergeMethod(repo) {
  try {
    const r = ghJson(['api', `repos/${repo}`]);
    if (r.allow_merge_commit) return '--merge';
    if (r.allow_squash_merge) return '--squash';
  } catch { /* fall through */ }
  return '--merge';
}

function mergeBody(decision) {
  return `Founder-approved: ${decision.head || ''} by the founder${decision.event_at ? ` at ${decision.event_at}` : ''}${decision.run_id ? ` (founder-approval run ${decision.run_id})` : ''}`;
}

function doMerge(repo, pr, decision) {
  const method = mergeMethod(repo);
  gh(['pr', 'merge', String(pr), '-R', repo, method, '--body', mergeBody(decision)]);
  return method;
}

function cmdMerge(args) {
  const repo = need(args, 'repo'), pr = Number(need(args, 'pr')), founder = need(args, 'founder');
  const { decision, pr: p } = liveDecide(repo, pr, founder, args['workflow-path'] || DEFAULT_WORKFLOW);
  if (!decision.ok) { console.log(`#${pr} not merged: [${decision.stage}] ${decision.why}`); return 1; }
  const method = doMerge(repo, pr, { ...decision, head: p.headRefOid });
  console.log(`merged #${pr} with ${method}`);
  return 0;
}

/**
 * Why a `gh workflow run` failed: 'absent' (the repo has no such workflow, nothing to build) or
 * 'failed'. Only gh's own missing-workflow wording counts as absent -- observed 2026-10-19 as
 * `HTTP 404: workflow ci.yml not found on the default branch`. Any other 404, a 422 (no
 * workflow_dispatch trigger, unknown ref) or a 403 is a failure: something was merged and is not
 * being built.
 */
function classifyDispatchError(msg) {
  return /HTTP 404: workflow .* not found|could not find any workflows named/i.test(String(msg || '')) ? 'absent' : 'failed';
}
const dispatchList = (v) => (v && v !== true ? String(v).split(',').map((x) => x.trim()).filter(Boolean) : []);

const TOKEN_MERGER = 'github-actions[bot]';
const lastLine = (e, dflt) => String((e && (e.stderr || e.message)) || '').split('\n').filter(Boolean).slice(-1)[0] || dflt;

/**
 * Should the sweep start a build of this tip? Only when nothing has built it yet, and only when the
 * tip is this workflow's responsibility: merged by this sweep just now, or merged earlier by the
 * workflow token. The second clause is what makes the build retry itself -- a dispatch that failed
 * last run, or a merge call that timed out after GitHub had completed it, leaves a tip merged by
 * the token with no run, and the next sweep builds it. A tip somebody pushed or merged by hand
 * starts its own push run, so it is never dispatched (and a slow-to-register push run is not raced).
 */
function needsBuild({ runs, mergedNow, mergedBy }) {
  if (runs > 0) return false;
  return Boolean(mergedNow) || mergedBy === TOKEN_MERGER;
}

/**
 * Build what the token merged. Stateless: it reads the tip of each base and that tip's runs, so it
 * needs no memory between sweeps. `run` and `log` are injectable so the self-test can prove the
 * counting without a network. Returns the number of failures; a failure means a merged tip is not
 * being built, so it fails the sweep (and recurs on every sweep, at least hourly, until somebody fixes it).
 */
// A read that fails is retried here twice, then judged by unreadable(): a sweep that merged into
// this base fails, because it made a tip it cannot confirm is being built; a sweep that merged
// nothing logs and stays green, because the next sweep reads again (at most an hour later). Without that
// split one 502 on an idle schedule run turned the sweep red, then 96 runs a day, and a red sweep that
// is usually a blip is how the real one gets ignored (second adversarial pass, 2026-10-19).
const sleepMs = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function ensureBuilt(repo, workflows, bases, mergedNow, { dry = false, run = gh, log = console.log, sleep = sleepMs } = {}) {
  let failed = 0;
  const api = (path) => {
    for (let attempt = 1; ; attempt++) {
      try { return JSON.parse(run(['api', path])); }
      catch (e) {
        if (attempt >= 3 || /HTTP 404/.test(lastLine(e, ''))) throw e;
        sleep(attempt * 2000);
      }
    }
  };
  const unreadable = (base, what) => {
    if (mergedNow.has(base)) { failed++; log(`BUILD CHECK FAILED on ${base}: ${what} -- this sweep merged into ${base} and cannot confirm it is being built`); }
    else log(`build check skipped on ${base}: ${what} -- nothing was merged this sweep; the next sweep reads again`);
  };
  for (const base of bases) {
    if (!workflows.length) break;
    let sha;
    try { sha = api(`repos/${repo}/commits/${encodeURIComponent(base)}`).sha; }
    catch (e) { unreadable(base, `could not read its tip (${lastLine(e, 'error')})`); continue; }
    let mergedBy;   // read once per tip, and only when some workflow needs it
    for (const wf of workflows) {
      let runs;
      try { runs = api(`repos/${repo}/actions/workflows/${encodeURIComponent(wf)}/runs?head_sha=${sha}&per_page=1`).total_count; }
      catch (e) {
        const msg = lastLine(e, 'error');
        // The tip read above proved the repo and the ref, so a 404 here is the workflow file.
        if (/HTTP 404/.test(msg)) { log(`no ${wf} in ${repo}: nothing to build (${msg})`); continue; }
        unreadable(base, `could not list ${wf} runs for ${sha.slice(0, 7)} (${msg})`); continue;
      }
      const now = mergedNow.has(base);
      if (runs === 0 && !now && mergedBy === undefined) {
        try {
          const pr = asList(api(`repos/${repo}/commits/${sha}/pulls`)).find((p) => p && p.merge_commit_sha === sha);
          mergedBy = pr ? (api(`repos/${repo}/pulls/${pr.number}`).merged_by || {}).login || null : null;
        } catch (e) {
          mergedBy = null;
          log(`could not tell who merged ${sha.slice(0, 7)} on ${base} (${lastLine(e, 'error')}): it has no ${wf} run; the next sweep asks again`);
        }
      }
      if (!needsBuild({ runs, mergedNow: now, mergedBy })) {
        if (now) log(`${wf} on ${base} (${sha.slice(0, 7)}) already has a run: not dispatched`);
        continue;
      }
      const why = now ? 'merged just now with the workflow token, which starts no push run'
        : `merged earlier by ${TOKEN_MERGER} and never built`;
      if (dry) { log(`WOULD DISPATCH ${wf} on ${base} (${sha.slice(0, 7)}): ${why}`); continue; }
      try {
        run(['workflow', 'run', wf, '-R', repo, '--ref', base]);
        log(`DISPATCHED ${wf} on ${base} (${sha.slice(0, 7)}): ${why}`);
      } catch (e) {
        const msg = lastLine(e, 'dispatch failed');
        if (classifyDispatchError(msg) === 'absent') { log(`no ${wf} in ${repo}: nothing to dispatch (${msg})`); continue; }
        failed++;
        log(`DISPATCH FAILED ${wf} on ${base}: ${msg} -- ${sha.slice(0, 7)} on ${base} is NOT being built`);
      }
    }
  }
  return failed;
}

function defaultBranch(repo) {
  try { return ghJson(['api', `repos/${repo}`]).default_branch || null; }
  catch (e) { console.log(`could not read ${repo}'s default branch (${lastLine(e, 'error')}): only bases merged into this sweep are checked`); return null; }
}

function cmdSweep(args) {
  const repo = need(args, 'repo'), founder = need(args, 'founder');
  const workflowPath = args['workflow-path'] || DEFAULT_WORKFLOW;
  const dry = Boolean(args['dry-run']);
  const prs = ghJson(['pr', 'list', '-R', repo, '--state', 'open', '--label', LABEL, '--limit', '100', '--json', 'number']);
  let merged = 0, waiting = 0, failed = 0;
  const mergedInto = new Set();
  for (const { number } of prs) {
    let d, p;
    try { ({ decision: d, pr: p } = liveDecide(repo, number, founder, workflowPath)); }
    catch (e) { failed++; console.log(`#${number} ERROR ${String(e.message).split('\n')[0]}`); continue; }
    if (!d.ok) {
      waiting++;
      console.log(`#${number} WAIT [${d.stage}] ${d.why}`);
      if (d.stage === 'label' && !dry) { removeLabel(repo, number); comment(repo, number, `founder-approval: ${d.why}. The label was removed.`); }
      else if (!dry && d.stage !== 'pr') comment(repo, number, `founder-approval: ${d.why}`);
      continue;
    }
    if (dry) { console.log(`#${number} WOULD MERGE ${d.why}`); merged++; mergedInto.add(p.baseRefName || 'main'); continue; }
    try {
      const method = doMerge(repo, number, { ...d, head: p.headRefOid });
      merged++;
      mergedInto.add(p.baseRefName || 'main');
      console.log(`#${number} MERGED (${method}) ${d.why}`);
    } catch (e) {
      failed++;
      const msg = String(e.stderr || e.message).split('\n').filter(Boolean).slice(-1)[0] || 'merge failed';
      console.log(`#${number} MERGE FAILED ${msg}`);
      comment(repo, number, `founder-approval: approved and CLEAN, but the merge call failed: ${msg}. It will be retried on the next run.`);
    }
  }
  const workflows = dispatchList(args['dispatch-after-merge']);
  const bases = new Set(mergedInto);
  if (workflows.length) { const db = defaultBranch(repo); if (db) bases.add(db); }
  failed += ensureBuilt(repo, workflows, bases, mergedInto, { dry });
  console.log(`sweep ${repo}: ${prs.length} labelled, ${merged} merged, ${waiting} waiting, ${failed} failed${dry ? ' (dry run)' : ''}`);
  return failed ? 1 : 0;
}

// ---- repairs (design docs/designs/pr-flow-end-to-end.md §4, build step 4) --------------------
//
// Two mechanical repairs, run by the sweep with the repo's own GITHUB_TOKEN. Nothing else is
// automated: closing, conflict resolution and escalation stay with sessions and the census.
//   1. BEHIND -> update the branch, at most once per PR per UTC day.
//   2. a required check that timed out or was cancelled -> re-run it once per head; one queued for
//      over NEVER_STARTED_HOURS with no runner is cancelled first, then re-run on a later sweep
//      (WAITING, an environment approval, is never touched); a head with no checks at all gets the
//      DISPATCH_AFTER_MERGE workflows started on its branch, once per head. At most
//      REPAIR_CHECK_CAP of these per sweep.
// Only on a PR that is NOT in the founder's queue (founder-approved / waiting:founder /
// held:founder-decision: a new head would drop his approval), not a draft, not from a fork, idle
// for REPAIR_IDLE_HOURS by the PR's own updated_at (never the commit date, which a session can
// set to anything), in a repo whose Actions are not down and has no job running past STUCK_HOURS.
// Every refusal is a printed line; none turns the sweep red.
//
// GitHub starts no workflow for a push the GITHUB_TOKEN makes, and update-branch is such a push: the
// new head would get no checks at all. So an update is followed by a workflow_dispatch of the
// DISPATCH_AFTER_MERGE workflows on the PR's branch. That runs THE PR BRANCH'S copy of those
// workflows with this token, so neither the update nor a dispatch happens on a PR whose files touch
// .github/** or kit/templates/github/** (review finding 4): its workflow code is unreviewed.
//
// The caps survive runs through a LEDGER: one comment per PR, written by the workflow token, found by
// its marker, and BOUND TO THIS WORKFLOW: it names the sweep run that wrote it, and a ledger is used
// only if that run is this workflow file, started by a non-PR event. An entry is written BEFORE the
// act it records, so a crash between the two cannot repeat the act (finding 11); if the write fails,
// the act is not done. RESIDUAL, stated: a PR-branch workflow posts as github-actions[bot] too, and
// could copy a genuine sweep run id into a forged ledger. That can only SUPPRESS repairs on that PR
// (make it look already repaired), never cause one.

const REPAIR_IDLE_HOURS = 6;
const STUCK_HOURS = 3;
const NEVER_STARTED_HOURS = 2;
const REPAIR_CHECK_CAP = 3;
const REPAIR_UPDATE_CAP = 5;   // per sweep; bounds the CI minutes one tick can start
const REPAIR_MARKER = '<!-- cwos-repair-ledger -->';
const QUEUE_LABELS = [LABEL, 'waiting:founder', 'held:founder-decision'];
const NEVER_STARTED = ['QUEUED', 'PENDING', 'REQUESTED', 'EXPECTED'];   // not WAITING: a deployment approval
const RERUNNABLE = ['TIMED_OUT', 'CANCELLED', 'STARTUP_FAILURE', 'STALE'];
const LEDGER_RUN_EVENTS = ['schedule', 'workflow_run', 'workflow_dispatch', 'pull_request_target'];
const WORKFLOW_CODE = [/^\.github\//i, /^kit\/templates\/github\//i];

/** The census's ACTIONS-DOWN (fleet/bin/pr-backlog.js): five recent runs all failed in under 30 s. */
function actionsDownFrom(runs) {
  const done = (runs || []).filter((r) => r.status === 'completed' && r.conclusion !== 'skipped').slice(0, 5);
  if (done.length < 3) return null;
  return done.every((r) => r.conclusion === 'failure' && (new Date(r.updated_at) - new Date(r.run_started_at || r.created_at)) < 30000);
}

/** The census's CI-STUCK: a JOB (not a run) in progress for more than STUCK_HOURS. */
function stuckJobsFrom(jobs, now) {
  return (jobs || []).filter((j) => j.status === 'in_progress' && j.started_at && now - Date.parse(j.started_at) > STUCK_HOURS * 3600000)
    .map((j) => `${j.name} since ${j.started_at}`);
}

/** Pure: may this sweep run's ledger be trusted? The run must be THIS workflow, from a non-PR event. */
function ledgerRunOk(run, workflowPath) {
  return Boolean(run && run.path === workflowPath && LEDGER_RUN_EVENTS.includes(run.event));
}

/**
 * Pure: the ledger from a PR's comments (all pages). Only a comment by the workflow token, carrying
 * the marker and a `run: <id>` that `verifyRun(id)` accepts, counts; the newest such one wins.
 */
function ledgerFrom(comments, verifyRun = () => false) {
  const cands = asList(comments)
    .filter((x) => x && x.user && x.user.login === TOKEN_MERGER && String(x.body || '').includes(REPAIR_MARKER))
    .sort((a, b) => Date.parse(b.updated_at || b.created_at || 0) - Date.parse(a.updated_at || a.created_at || 0));
  for (const c of cands) {
    const run = (/^run: (\d+)$/m.exec(String(c.body)) || [])[1];
    if (!run || !verifyRun(run)) continue;
    const entries = String(c.body).split('\n').map((l) => /^- (update-branch|rerun|cancel|dispatch) (\S+) (\S+)/.exec(l)).filter(Boolean).map((m) => ({ kind: m[1], key: m[2], sha: m[3] }));
    return { id: c.id, entries };
  }
  return { id: null, entries: [] };
}

/** Pure: may this PR be repaired at all? `lastActivityAt` is the PR's own updated_at. */
function repairEligible(pr, { now, lastActivityAt }) {
  const labels = asList(pr.labels).map((l) => (typeof l === 'string' ? l : l && l.name));
  const queued = labels.filter((l) => QUEUE_LABELS.includes(l));
  if (queued.length) return { ok: false, why: `labelled ${queued.join(', ')}: in the founder's queue, a new head would drop his approval` };
  if (pr.isDraft) return { ok: false, why: 'a draft' };
  if (pr.isCrossRepository) return { ok: false, why: 'from a fork' };
  const t = Date.parse(lastActivityAt || '');
  if (!Number.isFinite(t)) return { ok: false, why: 'the PR\'s last activity time could not be read' };
  const idleH = (now - t) / 3600000;
  if (idleH < REPAIR_IDLE_HOURS) return { ok: false, why: `active ${idleH.toFixed(1)} h ago (< ${REPAIR_IDLE_HOURS} h): a session may still be working on it` };
  return { ok: true, why: `idle ${idleH.toFixed(1)} h` };
}

/** Pure: BEHIND, and not yet updated today (UTC). */
function decideUpdate(pr, ledger, today) {
  if (pr.mergeStateStatus !== 'BEHIND') return { ok: false, why: `mergeStateStatus ${pr.mergeStateStatus || 'unknown'}` };
  if (ledger.entries.some((e) => e.kind === 'update-branch' && e.key === today)) return { ok: false, why: `already updated once today (${today})` };
  return { ok: true };
}

/** Pure: does the PR change workflow code a dispatch on its branch would run? */
const touchesWorkflowCode = (files) => asList(files).some((f) => WORKFLOW_CODE.some((re) => re.test(String(f))));

const runIdFromLink = (link) => { const m = /\/actions\/runs\/(\d+)/.exec(String(link || '')); return m ? m[1] : null; };
const neverStarted = (c) => NEVER_STARTED.includes(String(c.state || '').toUpperCase()) && (!c.startedAt || /^0001-/.test(c.startedAt));

/**
 * Pure: what to do about a head's required checks. `all` is every check on the head (any kind);
 * `runCreatedAt` maps run id -> created_at for the never-started candidates.
 */
function decideCheckRepair({ required, all, head, ledger, dispatchable, runCreatedAt = {}, now = Date.now() }) {
  const did = (kind) => ledger.entries.some((e) => e.kind === kind && e.key === head);
  if (!asList(all).length) {
    if (!dispatchable) return { action: null, why: 'no checks at all on this head, and no DISPATCH_AFTER_MERGE workflow to start' };
    if (did('dispatch')) return { action: null, why: 'no checks on this head; its workflows were already dispatched once' };
    return { action: 'dispatch', why: 'no check ever started on this head' };
  }
  const rerun = asList(required).filter((c) => RERUNNABLE.includes(String(c.state || '').toUpperCase()));
  const old = (c) => { const t = Date.parse(runCreatedAt[runIdFromLink(c.link)] || ''); return Number.isFinite(t) && now - t > NEVER_STARTED_HOURS * 3600000; };
  const stuck = asList(required).filter((c) => neverStarted(c) && old(c));
  const ids = (cs) => [...new Set(cs.map((c) => runIdFromLink(c.link)).filter(Boolean))];
  if (rerun.length) {
    if (did('rerun')) return { action: null, why: `${rerun.map((c) => c.name).join(', ')} ${rerun.length > 1 ? 'are' : 'is'} ${rerun[0].state}; already re-run once on this head` };
    const runIds = ids(rerun);
    if (!runIds.length) return { action: null, why: 'a required check timed out but its run could not be identified' };
    return { action: 'rerun', runIds, why: `${rerun.map((c) => `${c.name} ${c.state}`).join(', ')}` };
  }
  if (stuck.length) {
    if (did('cancel')) return { action: null, why: `${stuck.map((c) => c.name).join(', ')} still never started; already cancelled once on this head` };
    return { action: 'cancel', runIds: ids(stuck), why: `${stuck.map((c) => c.name).join(', ')} queued over ${NEVER_STARTED_HOURS} h and never started (cancelled now, re-run on a later sweep)` };
  }
  return { action: null, why: 'required checks started (or are queued under 2 h, or wait for an approval) and none timed out' };
}

function ledgerBody(entries, runId) {
  return [
    REPAIR_MARKER,
    'founder-approval repairs on this PR (the hourly sweep; at most one branch update a day and one re-run per commit). A session or the founder can ignore this comment.',
    `run: ${runId}`,
    '',
    ...entries.slice(-30).map((e) => `- ${e.kind} ${e.key} ${e.sha}`),
  ].join('\n');
}

/**
 * The repairs, end to end. `run(argv)` is gh (injectable: the self-test passes a fake); it returns
 * stdout or throws. `runId` is this sweep run (GITHUB_RUN_ID): without it nothing is acted on, since
 * the ledger could not be bound to this workflow. Returns { updated, checkRepairs, skipped, errors }.
 */
function runRepairs(repo, { now = Date.now(), dispatch = [], dry = false, runId = null, workflowPath = DEFAULT_WORKFLOW, run = gh, log = console.log } = {}) {
  const res = { updated: 0, checkRepairs: 0, skipped: 0, errors: 0 };
  const api = (p) => JSON.parse(run(['api', p]));
  const lines = (p, jq) => String(run(['api', '--paginate', p, '--jq', jq]) || '').split('\n').filter(Boolean);
  if (!dry && !runId) { log('repairs: no run id (GITHUB_RUN_ID): the ledger could not be bound to this workflow, so this is a dry run'); dry = true; }
  // The repo first: a repo whose Actions are down, or whose runner is hung, gets no repairs (each
  // would start a run that cannot finish).
  try {
    const recent = api(`repos/${repo}/actions/runs?per_page=8`).workflow_runs;
    if (actionsDownFrom(recent) === true) { log('repairs: SKIPPED — Actions is refusing to start jobs here (ACTIONS-DOWN); nothing a repair starts could run'); res.skipped++; return res; }
    const running = api(`repos/${repo}/actions/runs?status=in_progress&per_page=20`).workflow_runs || [];
    const stuck = [];
    for (const r of running.filter((x) => now - Date.parse(x.run_started_at || x.created_at) > STUCK_HOURS * 3600000)) {
      stuck.push(...stuckJobsFrom(api(`repos/${repo}/actions/runs/${r.id}/jobs?per_page=100`).jobs, now));
    }
    if (stuck.length) { log(`repairs: SKIPPED — a job has run past ${STUCK_HOURS} h (CI-STUCK: ${stuck.slice(0, 3).join('; ')}); repairs would queue behind it`); res.skipped++; return res; }
  } catch (e) {
    log(`repairs: SKIPPED — could not tell whether Actions is healthy here (${lastLine(e, 'error')})`); res.errors++; return res;
  }
  let prs;
  try {
    prs = JSON.parse(run(['pr', 'list', '-R', repo, '--state', 'open', '--limit', '100', '--json',
      'number,labels,isDraft,isCrossRepository,headRefName,headRefOid,mergeStateStatus,updatedAt,url']));
  } catch (e) { log(`repairs: could not list open PRs (${lastLine(e, 'error')})`); res.errors++; return res; }
  const today = new Date(now).toISOString().slice(0, 10);
  const runCache = new Map();
  const readRunMeta = (id) => {
    if (!runCache.has(id)) { try { runCache.set(id, api(`repos/${repo}/actions/runs/${id}`)); } catch { runCache.set(id, null); } }
    return runCache.get(id);
  };
  for (const pr of prs) {
    const tag = `#${pr.number} repair:`;
    const el = repairEligible(pr, { now, lastActivityAt: pr.updatedAt });
    if (!el.ok) { log(`${tag} skip — ${el.why}`); res.skipped++; continue; }
    let ledger;
    try {
      const comments = lines(`repos/${repo}/issues/${pr.number}/comments?per_page=100`, '.[]').map((l) => JSON.parse(l));
      ledger = ledgerFrom(comments, (id) => ledgerRunOk(readRunMeta(id), workflowPath));
    } catch (e) { log(`${tag} skip — could not read its repair ledger (${lastLine(e, 'error')})`); res.errors++; continue; }
    // Written BEFORE the act. A failed write means the act is not done (it could not be capped).
    const record = (entry) => {
      if (dry) return true;
      const body = ledgerBody([...ledger.entries, entry], runId);
      try {
        if (ledger.id) run(['api', '-X', 'PATCH', `repos/${repo}/issues/comments/${ledger.id}`, '-f', `body=${body}`]);
        else {
          const made = JSON.parse(run(['api', '-X', 'POST', `repos/${repo}/issues/${pr.number}/comments`, '-f', `body=${body}`]) || '{}');
          if (made && made.id) ledger.id = made.id;
        }
        ledger.entries.push(entry);
        return true;
      } catch (e) { log(`${tag} NOT DONE — the ledger could not be written (${lastLine(e, 'error')}), so the act could not be capped`); res.errors++; return false; }
    };
    let filesCache;
    const workflowCodeTouched = () => {
      if (filesCache === undefined) {
        try { filesCache = lines(`repos/${repo}/pulls/${pr.number}/files?per_page=100`, '.[] | .filename, (.previous_filename // empty)'); }
        catch (e) { filesCache = null; log(`${tag} could not list its files (${lastLine(e, 'error')})`); }
      }
      return filesCache === null ? 'unreadable' : touchesWorkflowCode(filesCache);
    };
    const dispatchOn = (ref) => {
      for (const wf of dispatch) {
        try { run(['workflow', 'run', wf, '-R', repo, '--ref', ref]); log(`${tag} dispatched ${wf} on ${ref}`); }
        catch (e) {
          const msg = lastLine(e, 'dispatch failed');
          if (classifyDispatchError(msg) === 'absent') log(`${tag} no ${wf} in ${repo}: nothing to dispatch`);
          else { res.errors++; log(`${tag} DISPATCH FAILED ${wf} on ${ref}: ${msg}`); }
        }
      }
    };
    // 1. BEHIND -> update the branch, once a day.
    const up = decideUpdate(pr, ledger, today);
    if (up.ok) {
      if (res.updated >= REPAIR_UPDATE_CAP) { log(`${tag} BEHIND, left for the next sweep (cap of ${REPAIR_UPDATE_CAP} updates per sweep reached)`); res.skipped++; continue; }
      const wc = workflowCodeTouched();
      if (wc) { log(`${tag} skip update — ${wc === 'unreadable' ? 'its files could not be read' : 'it changes workflow code, which a dispatch on its branch would run with this token'}`); res.skipped++; continue; }
      if (dry) { log(`${tag} WOULD UPDATE the branch (BEHIND, ${el.why}) and dispatch ${dispatch.join(', ') || 'nothing'} on ${pr.headRefName}`); res.updated++; continue; }
      if (!record({ kind: 'update-branch', key: today, sha: pr.headRefOid })) continue;
      try {
        run(['api', '-X', 'PUT', `repos/${repo}/pulls/${pr.number}/update-branch`, '-f', `expected_head_sha=${pr.headRefOid}`]);
        res.updated++;
        log(`${tag} UPDATED the branch (was BEHIND, ${el.why})`);
        // GitHub starts nothing for this token's push: start the PR's checks on the new head.
        if (dispatch.length) dispatchOn(pr.headRefName);
        else log(`${tag} WARNING no DISPATCH_AFTER_MERGE workflow: the updated head will have no checks until someone pushes`);
      } catch (e) { res.errors++; log(`${tag} update-branch FAILED (${lastLine(e, 'error')}); not retried before tomorrow`); }
      continue;   // the head changed (or tried to): its checks are judged on a later sweep
    }
    // 2. A required check that never started or timed out -> re-run once per head.
    // gh exits 8 while checks are pending and 1 when one failed, printing the JSON either way; with
    // no checks at all it says "no checks reported".
    const readChecks = (extra) => {
      try { return JSON.parse(run(['pr', 'checks', String(pr.number), '-R', repo, ...extra, '--json', 'name,state,link,startedAt']) || '[]'); }
      catch (e) {
        const out = e && e.stdout ? String(e.stdout).trim() : '';
        if (out.startsWith('[')) return JSON.parse(out);
        if (/no (required )?checks reported/i.test(String((e && (e.stderr || e.message)) || ''))) return [];
        throw e;
      }
    };
    let required, all;
    try { all = readChecks([]); required = readChecks(['--required']); }
    catch (e) { log(`${tag} skip checks — could not read them (${lastLine(e, 'error')})`); res.errors++; continue; }
    const runCreatedAt = {};
    for (const c of asList(required).filter(neverStarted)) {
      const id = runIdFromLink(c.link);
      if (id) { const m = readRunMeta(id); if (m) runCreatedAt[id] = m.created_at; }
    }
    const cr = decideCheckRepair({ required, all, head: pr.headRefOid, ledger, dispatchable: dispatch.length > 0, runCreatedAt, now });
    if (!cr.action) { if (pr.mergeStateStatus !== 'CLEAN') log(`${tag} nothing to repair — ${up.why}; ${cr.why}`); continue; }
    if (res.checkRepairs >= REPAIR_CHECK_CAP) { log(`${tag} ${cr.why}: left for the next sweep (cap of ${REPAIR_CHECK_CAP} check repairs per sweep reached)`); res.skipped++; continue; }
    if (cr.action === 'dispatch') {
      const wc = workflowCodeTouched();
      if (wc) { log(`${tag} skip dispatch — ${wc === 'unreadable' ? 'its files could not be read' : 'it changes workflow code, which a dispatch on its branch would run with this token'}`); res.skipped++; continue; }
    }
    res.checkRepairs++;
    if (dry) { log(`${tag} WOULD ${cr.action.toUpperCase()} — ${cr.why}`); continue; }
    if (!record({ kind: cr.action, key: pr.headRefOid, sha: (cr.runIds || []).join(',') || '-' })) continue;
    try {
      if (cr.action === 'dispatch') dispatchOn(pr.headRefName);
      else for (const id of cr.runIds) run(cr.action === 'rerun' ? ['run', 'rerun', id, '-R', repo, '--failed'] : ['run', 'cancel', id, '-R', repo]);
      log(`${tag} ${cr.action.toUpperCase()} — ${cr.why}`);
    } catch (e) { res.errors++; log(`${tag} ${cr.action} FAILED (${lastLine(e, 'error')}); not retried on this head`); }
  }
  return res;
}

function cmdRepair(args) {
  const repo = need(args, 'repo');
  const runId = args['run-id'] && args['run-id'] !== true ? String(args['run-id']) : (process.env.GITHUB_RUN_ID || null);
  const res = runRepairs(repo, { dispatch: dispatchList(args.dispatch), dry: Boolean(args['dry-run']), runId, workflowPath: args['workflow-path'] || DEFAULT_WORKFLOW });
  console.log(`repairs ${repo}: ${res.updated} branch update(s), ${res.checkRepairs} check repair(s), ${res.skipped} skipped, ${res.errors} error(s)${args['dry-run'] ? ' (dry run)' : ''}`);
  return 0;   // a repair problem is a printed line, never a red sweep: the census is the watcher
}

/** runRepairs end to end against a fake gh: every refusal and both caps. */
function repairCases() {
  const R = 'o/r', NOW = Date.parse('2026-10-31T12:00:00Z'), H = (h) => new Date(NOW - h * 3600000).toISOString();
  const SHA = 'd'.repeat(40), RUN = '4242', WF = DEFAULT_WORKFLOW;
  const pr = (n, o = {}) => ({ number: n, labels: [], isDraft: false, isCrossRepository: false, headRefName: `claude/b${n}`, headRefOid: `${SHA.slice(0, 38)}${String(n).padStart(2, '0')}`, mergeStateStatus: 'BEHIND', updatedAt: H(8), url: `u${n}`, ...o });
  const fail = (m) => { const e = new Error(m); e.stderr = m; throw e; };
  const fake = ({ prs, runs = [], running = [], jobs = [], comments = {}, checks = {}, files = {}, runMeta = {}, updateErr, ledgerErr }) => {
    const calls = [];
    const run = (argv) => {
      const s = argv.join(' ');
      calls.push(s);
      if (argv[0] === 'pr' && argv[1] === 'list') return JSON.stringify(prs);
      if (argv[0] === 'pr' && argv[1] === 'checks') return JSON.stringify(checks[argv[2]] || []);
      if (argv[0] === 'workflow' || argv[0] === 'run') return '';
      if (argv[0] === 'api' && argv[1] === '-X') {
        if (/^api -X PUT \S+\/update-branch/.test(s) && updateErr) return fail(updateErr);
        if (/comments/.test(s) && ledgerErr) return fail(ledgerErr);
        return '{"id":99}';
      }
      if (argv[1] === '--paginate') {
        const cm = /issues\/(\d+)\/comments/.exec(argv[2]);
        if (cm) return (comments[cm[1]] || []).map((c) => JSON.stringify(c)).join('\n');
        const fm = /pulls\/(\d+)\/files/.exec(argv[2]);
        if (fm) return (files[fm[1]] || ['docs/a.md']).join('\n');
      }
      const p = argv[1];
      if (/actions\/runs\?status=in_progress/.test(p)) return JSON.stringify({ workflow_runs: running });
      if (/actions\/runs\?per_page/.test(p)) return JSON.stringify({ workflow_runs: runs });
      if (/actions\/runs\/\d+\/jobs/.test(p)) return JSON.stringify({ jobs });
      const rm = /actions\/runs\/(\d+)$/.exec(p);
      if (rm) return JSON.stringify(runMeta[rm[1]] || { id: rm[1], path: WF, event: 'schedule', created_at: H(5) });
      return fail(`unexpected ${s}`);
    };
    return { run, calls };
  };
  const go = (o, extra = {}) => {
    const f = fake(o);
    const r = runRepairs(R, { now: NOW, dispatch: ['ci.yml'], runId: RUN, run: f.run, log: () => {}, ...extra });
    const n = (re) => f.calls.filter((c) => re.test(c)).length;
    const first = (re) => f.calls.findIndex((c) => re.test(c));
    return { ...r, updates: n(/^api -X PUT \S+\/update-branch/), reruns: n(/^run rerun/), cancels: n(/^run cancel/), dispatches: n(/^workflow run/), ledgerWrites: n(/^api -X (PATCH|POST) .*comments/), first, calls: f.calls };
  };
  const ledger = (lines, o = {}) => [{ id: 5, user: { login: TOKEN_MERGER }, created_at: H(20), body: `${REPAIR_MARKER}\nx\nrun: 777\n\n${lines.join('\n')}`, ...o }];
  const down = Array.from({ length: 5 }, () => ({ status: 'completed', conclusion: 'failure', run_started_at: H(1), updated_at: new Date(NOW - 3600000 + 3000).toISOString() }));
  const timedOut = (n) => ({ [n]: [{ name: 'test', state: 'TIMED_OUT', link: 'https://github.com/o/r/actions/runs/77/job/1', startedAt: H(9) }] });
  const queued = (state, runId = '88') => ({ 1: [{ name: 'test', state, link: `https://github.com/o/r/actions/runs/${runId}/job/2`, startedAt: null }] });
  const blocked = (o = {}) => pr(1, { mergeStateStatus: 'BLOCKED', ...o });
  const p1 = pr(1);
  const a = go({ prs: [p1] });
  const b = go({ prs: [pr(1, { labels: [{ name: LABEL }] })] });
  const c = go({ prs: [pr(1, { labels: [{ name: 'waiting:founder' }] })] });
  const d = go({ prs: [pr(1, { updatedAt: H(1) })] });
  const e = go({ prs: [p1], comments: { 1: ledger(['- update-branch 2026-10-31 abc']) } });
  const e2 = go({ prs: [p1], comments: { 1: ledger(['- update-branch 2026-10-31 abc'], { user: { login: 'mallory' } }) } });
  const e3 = go({ prs: [p1], comments: { 1: ledger(['- update-branch 2026-10-31 abc']) }, runMeta: { 777: { path: '.github/workflows/evil.yml', event: 'pull_request' } } });
  const e4 = go({ prs: [p1], comments: { 1: ledger(['- update-branch 2026-10-31 abc']) }, runMeta: { 777: { path: WF, event: 'pull_request' } } });
  const f = go({ prs: [p1], runs: down });
  const g = go({ prs: [p1], running: [{ id: 9, run_started_at: H(5) }], jobs: [{ status: 'in_progress', name: 'test', started_at: H(4) }] });
  const h = go({ prs: [pr(1, { isDraft: true }), pr(2, { isCrossRepository: true })] });
  const i = go({ prs: [1, 2, 3, 4, 5].map((n) => pr(n, { mergeStateStatus: 'BLOCKED' })), checks: Object.assign({}, ...[1, 2, 3, 4, 5].map(timedOut)) });
  const j = go({ prs: [blocked()], checks: timedOut(1), comments: { 1: ledger([`- rerun ${pr(1).headRefOid} 77`]) } });
  const k = go({ prs: [blocked()], checks: { 1: [] } });
  const l = go({ prs: [blocked()], checks: queued('QUEUED'), runMeta: { 88: { id: 88, created_at: H(3) } } });
  const l2 = go({ prs: [blocked()], checks: queued('QUEUED'), runMeta: { 88: { id: 88, created_at: H(1) } } });
  const l3 = go({ prs: [blocked()], checks: queued('WAITING'), runMeta: { 88: { id: 88, created_at: H(30) } } });
  const m = go({ prs: [p1], updateErr: 'HTTP 422: merge conflict' });
  const nn = go({ prs: [1, 2, 3, 4, 5, 6, 7].map((n) => pr(n)) });
  const o = go({ prs: [p1] }, { dry: true });
  const o2 = go({ prs: [p1] }, { runId: null });
  const q = go({ prs: [blocked()], checks: { 1: [{ name: 'test', state: 'FAILURE', link: 'https://github.com/o/r/actions/runs/77/job/1', startedAt: H(9) }] } });
  const w1 = go({ prs: [p1], files: { 1: ['.github/workflows/ci.yml'] } });
  const w2 = go({ prs: [blocked()], checks: { 1: [] }, files: { 1: ['kit/templates/github/x.yml'] } });
  const w3 = go({ prs: [p1], files: { 1: ['docs/a.md', '.GitHub/scripts/x.js'] } });
  const x = go({ prs: [p1], ledgerErr: 'HTTP 500' });
  const y = go({ prs: [blocked()], checks: timedOut(1) });
  const pages = go({ prs: [p1], comments: { 1: [...Array.from({ length: 120 }, (_, n) => ({ id: n, user: { login: 'someone' }, body: 'hi' })), ...ledger(['- update-branch 2026-10-31 abc'])] } });
  return [
    ['repair: an idle BEHIND PR is updated once, its checks dispatched, the ledger written', a.updates === 1 && a.dispatches === 1 && a.ledgerWrites === 1],
    ['repair refuses: labelled founder-approved', b.updates === 0 && b.skipped === 1],
    ['repair refuses: labelled waiting:founder', c.updates === 0],
    ['repair refuses: PR active 1 h ago (updated_at, not the commit date)', d.updates === 0 && d.skipped === 1 && d.calls.every((s) => !/\/commits\//.test(s))],
    ['repair refuses: already updated today (the cap survives runs through the ledger)', e.updates === 0],
    ['repair: a ledger written by someone else does not count', e2.updates === 1],
    ['review 7: a ledger naming a run of another workflow does not count', e3.updates === 1],
    ['review 7: a ledger naming a pull_request run of this workflow file does not count', e4.updates === 1],
    ['review 7: comments are read across pages (the ledger after 120 comments still caps)', pages.updates === 0 && pages.calls.some((s) => /^api --paginate \S+comments/.test(s))],
    ['repair refuses: Actions down (five fast failures)', f.updates === 0 && f.calls.every((s) => !/pr list/.test(s))],
    ['repair refuses: a job running past 3 h', g.updates === 0 && g.calls.every((s) => !/pr list/.test(s))],
    ['repair refuses: drafts and forks', h.updates === 0 && h.skipped === 2],
    ['repair: timed-out required checks re-run, at most 3 per sweep', i.reruns === 3 && i.checkRepairs === 3],
    ['repair refuses: a second re-run on the same head', j.reruns === 0],
    ['repair: a head with no checks at all gets its workflows dispatched', k.dispatches === 1],
    ['repair: a required check queued over 2 h with no runner is cancelled (re-run later)', l.cancels === 1 && l.reruns === 0],
    ['review 5: a check queued under 2 h is left alone', l2.cancels === 0],
    ['review 5: WAITING (an environment approval) is never cancelled', l3.cancels === 0],
    ['repair: a failed update is not retried today (recorded before acting)', m.errors === 1 && m.ledgerWrites === 1],
    ['repair: at most 5 branch updates per sweep', nn.updates === 5],
    ['repair: a dry run changes nothing', o.updates === 0 && o.ledgerWrites === 0 && o.dispatches === 0],
    ['review 7: with no run id the ledger cannot be bound, so nothing is acted on', o2.updates === 0 && o2.ledgerWrites === 0],
    ['repair leaves a real failure alone (only never-started or timed-out are re-run)', q.reruns === 0],
    ['review 4: a PR changing .github/** is neither updated nor dispatched', w1.updates === 0 && w1.dispatches === 0],
    ['review 4: a PR changing kit/templates/github/** gets no dispatch', w2.dispatches === 0],
    ['review 4: workflow paths match case-insensitively', w3.updates === 0],
    ['review 11: the ledger is written before the act; a failed write means no act', x.updates === 0 && x.errors === 1],
    ['review 11: a re-run is recorded before it is made', y.reruns === 1 && y.first(/^api -X (PATCH|POST) .*comments/) < y.first(/^run rerun/)],
    ['actions-down needs three runs to say anything', actionsDownFrom([]) === null],
  ];
}

// ---- self-test (no network) ------------------------------------------------------------------
/** ensureBuilt end to end against a fake gh: proves the calls it makes and the failures it counts. */
function buildCases(F) {
  const R = 'o/r', TIP = 'c'.repeat(40);
  const fail = (stderr) => { const e = new Error(stderr); e.stderr = stderr; throw e; };
  const fake = ({ runs = 0, mergedBy = TOKEN_MERGER, runsErr, dispatchErr, tipErr, tipErrTimes = Infinity } = {}) => {
    const calls = [];
    let tipReads = 0;
    const run = (argv) => {
      calls.push(argv.join(' '));
      if (argv[0] === 'workflow') return dispatchErr ? fail(dispatchErr) : '';
      const p = argv[1];
      if (/\/commits\/[^/]+$/.test(p) && !/pulls$/.test(p)) return tipErr && tipReads++ < tipErrTimes ? fail(tipErr) : JSON.stringify({ sha: TIP });
      if (/\/runs\?/.test(p)) return runsErr ? fail(runsErr) : JSON.stringify({ total_count: runs });
      if (/\/pulls$/.test(p)) return JSON.stringify([{ number: 9, merge_commit_sha: TIP }]);
      if (/\/pulls\/9$/.test(p)) return JSON.stringify({ merged_by: { login: mergedBy } });
      return fail(`unexpected call ${argv.join(' ')}`);
    };
    return { run, calls };
  };
  const go = (opts, mergedNow = ['main'], extra = {}) => {
    const f = fake(opts);
    const failed = ensureBuilt(R, ['ci.yml'], new Set(['main']), new Set(mergedNow), { run: f.run, log: () => {}, sleep: () => {}, ...extra });
    return { failed, dispatched: f.calls.filter((c) => c.startsWith('workflow run')).length, calls: f.calls };
  };
  const a = go({}), b = go({ dispatchErr: "HTTP 422: Workflow does not have 'workflow_dispatch' trigger" });
  const c = go({ runs: 1 }), d = go({ mergedBy: F }, []), e = go({}, []);
  const g = go({ runsErr: 'gh: Not Found (HTTP 404)' }), h = go({}, ['main'], { dry: true });
  const i = go({ tipErr: 'HTTP 502: Bad Gateway' }), j = go({ runsErr: 'HTTP 403: Resource not accessible' });
  const k = go({ tipErr: 'HTTP 502: Bad Gateway' }, []), l = go({ runsErr: 'HTTP 403: Resource not accessible' }, []);
  const m = go({ tipErr: 'HTTP 502: Bad Gateway', tipErrTimes: 2 });
  return [
    ['merged now, no run: dispatches once on main', a.failed === 0 && a.dispatched === 1 && a.calls.includes('workflow run ci.yml -R o/r --ref main')],
    ['a dispatch the workflow refuses counts as a failure', b.failed === 1 && b.dispatched === 1],
    ['a tip that already has a run is not dispatched', c.failed === 0 && c.dispatched === 0],
    ['an earlier tip merged by the founder is not dispatched', d.failed === 0 && d.dispatched === 0],
    ['an earlier tip merged by the token and never built IS dispatched (the retry)', e.failed === 0 && e.dispatched === 1],
    ['a repo without the workflow is skipped and not failed', g.failed === 0 && g.dispatched === 0],
    ['a dry run never dispatches', h.failed === 0 && h.dispatched === 0],
    ['an unreadable tip after a merge counts as a failure', i.failed === 1 && i.dispatched === 0],
    ['an unreadable run list (403) after a merge counts as a failure, not as absent', j.failed === 1 && j.dispatched === 0],
    ['an unreadable tip on a sweep that merged nothing stays green', k.failed === 0 && k.dispatched === 0],
    ['an unreadable run list on a sweep that merged nothing stays green', l.failed === 0 && l.dispatched === 0],
    ['a read that fails twice then succeeds is retried, and dispatches', m.failed === 0 && m.dispatched === 1],
  ];
}

function selfTest() {
  const F = 'chrismmorin-ux', SHA = 'a'.repeat(40), OLD = 'b'.repeat(40), N = 7, WF = DEFAULT_WORKFLOW;
  const lab = (actor, at, extra = {}) => ({ event: 'labeled', label: { name: LABEL }, actor: { login: actor }, created_at: at, ...extra });
  const unlab = (actor, at) => ({ event: 'unlabeled', label: { name: LABEL }, actor: { login: actor }, created_at: at });
  const T0 = '2026-10-19T10:00:00Z', T1 = '2026-10-19T10:05:00Z';
  const status = (sha, state = 'success', url = 'https://github.com/o/r/actions/runs/123', at = T1) => ({ context: CONTEXT, state, target_url: url, created_at: at, description: 'x' });
  const run = (over = {}) => ({ id: 123, event: 'pull_request_target', path: WF, triggering_actor: { login: F }, ...over });
  const jobs = (sha, concl = 'success', pr = N) => [{ name: jobNameFor(pr, sha), conclusion: concl }];
  const pr = (over = {}) => ({ number: N, state: 'OPEN', isDraft: false, headRefOid: SHA, mergeStateStatus: 'CLEAN', labels: [{ name: LABEL }], ...over });
  const cr = (name, st, concl, runId) => ({ name, status: st, conclusion: concl, html_url: `https://github.com/o/r/actions/runs/${runId}/job/1` });
  const D = (o) => decideFromData({ pr: pr(), labels: [{ name: LABEL }], events: [lab(F, T0)], statuses: [status(SHA)], run: run(), jobs: jobs(SHA), founder: F, workflowPath: WF, ...o });
  const cases = [
    ['his label, record for this head, CLEAN -> merge', D({}).ok === true],
    ['label added by a workflow token refuses', D({ events: [lab('github-actions[bot]', T0)] }).stage === 'label'],
    ['label added through an app refuses', D({ events: [lab(F, T0, { performed_via_github_app: { slug: 'claude' } })] }).stage === 'label'],
    ['label removed then not re-added refuses', D({ events: [lab(F, T0), unlab(F, T1)] }).stage === 'label'],
    ['no label on the PR refuses', D({ labels: [] }).stage === 'label'],
    ['record for an older head does not cover a new push', D({ pr: pr({ headRefOid: OLD }), statuses: [status(OLD)], jobs: jobs(SHA) }).stage === 'record'],
    ['no status on the head refuses', D({ statuses: [] }).stage === 'record'],
    ['status pointing at a pull_request run (a PR-branch workflow) refuses', D({ run: run({ event: 'pull_request' }) }).stage === 'record'],
    ['status pointing at another workflow file refuses', D({ run: run({ path: '.github/workflows/ci.yml' }) }).stage === 'record'],
    ['run started by someone else refuses', D({ run: run({ triggering_actor: { login: 'mallory' } }) }).stage === 'record'],
    ['run whose record job is for another PR refuses', D({ jobs: jobs(SHA, 'success', 8) }).stage === 'record'],
    ['record job that failed (the add was refused then) refuses', D({ jobs: jobs(SHA, 'failure') }).stage === 'record'],
    ['a re-run that refused to re-record does not undo the first attempt\'s record', D({ jobs: [...jobs(SHA), ...jobs(SHA, 'failure')] }).ok === true],
    ['every attempt failed still refuses', D({ jobs: [...jobs(SHA, 'failure'), ...jobs(SHA, 'cancelled')] }).stage === 'record'],
    ['status id and run id must agree', D({ run: run({ id: 999 }) }).stage === 'record'],
    ['approved but BEHIND waits, does not merge', D({ pr: pr({ mergeStateStatus: 'BEHIND' }) }).stage === 'mergeable'],
    ['approved but BLOCKED waits', D({ pr: pr({ mergeStateStatus: 'BLOCKED' }) }).stage === 'mergeable'],
    ['approved but DIRTY waits', D({ pr: pr({ mergeStateStatus: 'DIRTY' }) }).stage === 'mergeable'],
    ['UNSTABLE only from this run\'s own pending sweep merges', D({ pr: pr({ mergeStateStatus: 'UNSTABLE' }), ownRunId: '555', checkRuns: [cr('ci', 'completed', 'success', 1), cr('sweep', 'in_progress', null, 555)] }).ok === true],
    ['UNSTABLE with another run\'s pending check waits', D({ pr: pr({ mergeStateStatus: 'UNSTABLE' }), ownRunId: '555', checkRuns: [cr('sweep', 'in_progress', null, 555), cr('e2e', 'in_progress', null, 9)] }).stage === 'mergeable'],
    ['UNSTABLE with a FAILED check waits, even one from this run', D({ pr: pr({ mergeStateStatus: 'UNSTABLE' }), ownRunId: '555', checkRuns: [cr('lint', 'completed', 'failure', 555)] }).stage === 'mergeable'],
    ['UNSTABLE with no run id waits', D({ pr: pr({ mergeStateStatus: 'UNSTABLE' }), ownRunId: null, checkRuns: [cr('sweep', 'in_progress', null, 555)] }).stage === 'mergeable'],
    ['UNSTABLE with an unreadable check list waits', D({ pr: pr({ mergeStateStatus: 'UNSTABLE' }), ownRunId: '555', checkRuns: null }).stage === 'mergeable'],
    ['UNSTABLE only from a sweep this workflow cancelled earlier merges', D({ pr: pr({ mergeStateStatus: 'UNSTABLE' }), ownRunId: '555', sameWorkflowRunIds: new Set(['444']), checkRuns: [cr('ci', 'completed', 'success', 1), cr('sweep', 'completed', 'cancelled', 444)] }).ok === true],
    ['a cancelled sweep from a run not confirmed as this workflow waits', D({ pr: pr({ mergeStateStatus: 'UNSTABLE' }), ownRunId: '555', checkRuns: [cr('sweep', 'completed', 'cancelled', 444)] }).stage === 'mergeable'],
    ['a cancelled job not named sweep waits, even from this workflow', D({ pr: pr({ mergeStateStatus: 'UNSTABLE' }), ownRunId: '555', sameWorkflowRunIds: new Set(['444']), checkRuns: [cr('record-approval', 'completed', 'cancelled', 444)] }).stage === 'mergeable'],
    ['a FAILED sweep waits, even from this workflow', D({ pr: pr({ mergeStateStatus: 'UNSTABLE' }), ownRunId: '555', sameWorkflowRunIds: new Set(['444']), checkRuns: [cr('sweep', 'completed', 'failure', 444)] }).stage === 'mergeable'],
    ['a cancelled sweep beside another failed check waits', D({ pr: pr({ mergeStateStatus: 'UNSTABLE' }), ownRunId: '555', sameWorkflowRunIds: new Set(['444']), checkRuns: [cr('sweep', 'completed', 'cancelled', 444), cr('lint', 'completed', 'failure', 9)] }).stage === 'mergeable'],
    ['BLOCKED is never excused by own-run checks', D({ pr: pr({ mergeStateStatus: 'BLOCKED' }), ownRunId: '555', checkRuns: [cr('sweep', 'in_progress', null, 555)] }).stage === 'mergeable'],
    ['a draft never merges', D({ pr: pr({ isDraft: true }) }).stage === 'pr'],
    ['a closed PR never merges', D({ pr: pr({ state: 'MERGED' }) }).stage === 'pr'],
    ['latest status wins: a later pending over an old success waits', D({ statuses: [status(SHA, 'success', undefined, T0), status(SHA, 'pending', undefined, T1)] }).stage === 'record'],
    ['run id parses from a run url', runIdOf('https://github.com/o/r/actions/runs/4567?check_suite_focus=true') === '4567'],
    ['a repo without the workflow is skipped, not failed', classifyDispatchError('HTTP 404: workflow ci.yml not found on the default branch (https://api.github.com/...)') === 'absent'],
    ['any other 404 (repo or ref) FAILS the sweep', classifyDispatchError('gh: Not Found (HTTP 404)') === 'failed'],
    ['a workflow with no workflow_dispatch trigger FAILS the sweep', classifyDispatchError("HTTP 422: Workflow does not have 'workflow_dispatch' trigger") === 'failed'],
    ['a permission error FAILS the sweep', classifyDispatchError('HTTP 403: Resource not accessible by integration') === 'failed'],
    ['dispatch list splits and trims', dispatchList(' ci.yml, e2e.yml ,').join('|') === 'ci.yml|e2e.yml'],
    ['no dispatch list dispatches nothing', dispatchList(undefined).length === 0 && dispatchList(true).length === 0],
    ['a tip with a run is never rebuilt', needsBuild({ runs: 1, mergedNow: true, mergedBy: TOKEN_MERGER }) === false],
    ['a tip pushed or merged by a person is left to its push run', needsBuild({ runs: 0, mergedNow: false, mergedBy: F }) === false],
    ['record refuses when the PR head moved after the tap', headStillMatches(OLD, SHA).ok === false],
    ['record refuses when the live head cannot be read', headStillMatches(null, SHA).ok === false],
    ['record proceeds when the live head is the tapped commit', headStillMatches(SHA, SHA).ok === true],
    ...buildCases(F),
    ...repairCases(),
  ];
  let fail = 0;
  for (const [name, ok] of cases) { if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); }
  console.log(`${cases.length - fail}/${cases.length} passed`);
  return fail ? 1 : 0;
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--self-test')) return selfTest();
  const args = parseArgs(argv);
  const cmd = args._[0];
  const table = { 'verify-label': cmdVerifyLabel, record: cmdRecord, unapprove: cmdUnapprove, decide: cmdDecide, merge: cmdMerge, sweep: cmdSweep, repair: cmdRepair };
  if (!table[cmd]) {
    process.stderr.write(`usage: cwos-founder-approval.js <${Object.keys(table).join('|')}> ... | --self-test\n`);
    return 2;
  }
  try { return table[cmd](args); }
  catch (e) {
    process.stderr.write(`cwos-founder-approval: ${cmd} failed: ${String(e.stderr || e.message).trim()}\n`);
    return 1;
  }
}

if (require.main === module) process.exitCode = main();
module.exports = { unstableIsOnlySelf, isReplacedSweep, headStillMatches, verifyLabelEvents, verifyRecord, decideFromData, jobNameFor, runIdOf, classifyDispatchError, dispatchList, needsBuild, ensureBuilt, runRepairs, repairEligible, decideUpdate, decideCheckRepair, ledgerFrom, ledgerRunOk, touchesWorkflowCode, actionsDownFrom, stuckJobsFrom, LABEL, CONTEXT };
