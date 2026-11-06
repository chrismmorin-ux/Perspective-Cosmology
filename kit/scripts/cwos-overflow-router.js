#!/usr/bin/env node
/**
 * cwos-overflow-router — when the machines are holding work, send token-only queue
 * items to cloud sessions, on whichever account still has weekly headroom (WS-1171).
 *
 *   cwos-overflow-router plan [--repo <name>] [--max 2] [--threshold 80]
 *                                 DRY RUN (the default): what would launch, and why or why not
 *   cwos-overflow-router plan --launch [--max N]
 *                                 actually start `claude --cloud` sessions, at most N, each logged
 *   cwos-overflow-router land --batch <id> [--execute]
 *                                 merge a batch's pushed branches into ONE branch and ONE PR
 *
 * WHY. Founder, 2026-10-15: surplus weekly tokens while both machines were clogged.
 * Measured that day: ~60% of poker's open work is token-only, cloud sessions had not run
 * since 09-29, and the second (Gmail Max) account was not a lane. A cloud session runs on
 * an Anthropic VM on the same plan's usage — no local CPU or memory
 * (code.claude.com/docs/en/claude-code-on-the-web.md). The decision rules live in
 * lib/overflow-router.js; this file reads the world and, only with --launch, acts on it.
 *
 * READS
 *   queue          <repo>/.claude/workstream/queue/WS-*.yaml (model_lane on file, else the WS-1170 ladder)
 *   held?          ~/fleet/arbiter/admission.json (this machine) + ssh <node1> the same file
 *   accounts       ai-personal nodes/claude-lanes.json (or --lanes): each lane's config dir, its
 *                  signed-in email, and <config dir>/cwos-rate-limits.json (cwos-statusline-capture)
 *   model          fleet/anchors/routing-ledger.yaml via lib/model-lane (no default model here)
 *   in flight      HomeBase event log: cloud-session-launched / cloud-batch-landed
 * WRITES (only with --launch / --execute)
 *   a launch checkout at ~/fleet/overflow/<repo>, reset to origin's default branch — a cloud
 *   session clones the CURRENT BRANCH of the directory it starts in, so it never starts in a
 *   working checkout; one cloud-session-launched event per launch in HomeBase's event log.
 *
 * NOT VERIFIED HERE, stated rather than assumed: whether `--model` is honoured by a session
 * created with `--cloud` (the docs do not say), and that a lane's claude.ai account has GitHub
 * connected for cloud sessions to push. The first real launch is the test of both.
 *
 * Exit: 0 ok (including "nothing to launch"), 1 a launch or land failed, 2 usage.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { cliGate } = require('./lib/cli');
const { readYAMLFile } = require('./lib/cwos-utils');
const { resolveHomeBaseRoot } = require('./lib/kit-paths');
const ovf = require('./lib/overflow-router');

const CLI = {
  name: 'cwos-overflow-router',
  summary: 'route token-only queue items to cloud sessions while local compute is held',
  usage: 'cwos-overflow-router <plan|land> [options]',
  subcommands: {
    plan: 'what would launch now (dry run); --launch to start the sessions',
    land: 'land --batch <id>: merge the batch branches into one branch and one PR (dry run; --execute to do it)',
  },
  flags: {
    repo: { type: 'string', describe: 'fleet repo whose queue to route (default claude-poker-tracker)' },
    max: { type: 'string', describe: `most sessions to launch in one run (default ${ovf.DEFAULT_MAX})` },
    threshold: { type: 'string', describe: `weekly-use percent above which an account is not surplus (default ${ovf.DEFAULT_THRESHOLD})` },
    launch: { type: 'boolean', describe: 'plan: actually start the cloud sessions' },
    'assume-held': { type: 'boolean', describe: 'plan: route even when no arbiter reading says work is held (manual use)' },
    batch: { type: 'string', describe: 'land: the batch id (ovf-YYYYMMDD-HHMM)' },
    execute: { type: 'boolean', describe: 'land: merge, push and open the PR' },
    lanes: { type: 'string', describe: 'claude-lanes.json to read (default ai-personal nodes/claude-lanes.json)' },
    'queue-dir': { type: 'string', describe: 'queue directory override (tests)' },
    'local-only': { type: 'boolean', describe: 'do not ssh to the compute node' },
    'node1-host': { type: 'string', describe: 'ssh alias of the compute node (default cm-node1)' },
    homebase: { type: 'string', describe: 'HomeBase root (routing ledger + event log)' },
    json: { type: 'boolean', describe: 'machine-readable output' },
  },
};

const HOME = process.env.USERPROFILE || os.homedir();
const LAUNCH_TIMEOUT_MS = 300000;

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')); } catch { return null; }
}
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024, ...opts });
const git = (cwd, args, opts) => run('git', ['-C', cwd, ...args], opts);
const out = (s) => process.stdout.write(s + '\n');

// ─── reads ──────────────────────────────────────────────────────────────────

function resolveRepo(name) {
  const r = run(process.execPath, [path.join(__dirname, 'cwos-fleet-context.js'), 'resolve', name, '--json'], { timeout: 20000 });
  const text = String(r.stdout || '');
  const i = text.indexOf('{');
  let j = null;
  if (i !== -1) { try { j = JSON.parse(text.slice(i)); } catch { j = null; } }
  if (!j || !j.ok || !j.path) return { ok: false, why: `${name} is not in the fleet registry` };
  if (!j.local || !fs.existsSync(j.path)) return { ok: false, why: `${name} is not on this machine` };
  return { ok: true, path: j.path };
}

/**
 * The HomeBase whose event log and routing ledger count: --homebase, else the one the
 * target repo is stamped with (.cwos-version homebase_path), else the nearest to this
 * script. Not simply the nearest: a copy of the kit (the fleet/runtime install, a scratch
 * clone) has no event log, and a launch logged there is one the resource board never sees.
 */
function homebaseRoot(values, repoPath) {
  if (values.homebase) return resolveHomeBaseRoot({ homebase: values.homebase });
  const hasLog = (r) => r && fs.existsSync(path.join(r, '.claude', 'workstream', 'events'));
  const stamped = repoPath ? resolveHomeBaseRoot({ from: repoPath }) : null;
  if (hasLog(stamped)) return stamped;
  const near = resolveHomeBaseRoot({ from: __dirname });
  return hasLog(near) ? near : (stamped || near);
}

function readQueue(queueDir) {
  const items = [];
  for (const f of fs.readdirSync(queueDir).filter((x) => /^WS-\d+\.yaml$/.test(x))) {
    const r = readYAMLFile(path.join(queueDir, f));
    if (r.ok && r.data && r.data.id) items.push(r.data);
  }
  return items;
}

function programLanes(repoRoot) {
  const r = readYAMLFile(path.join(repoRoot, '.cwos-config.yaml'));
  const m = r.ok && r.data && r.data.model_lanes && r.data.model_lanes.programs;
  return m && typeof m === 'object' ? m : {};
}

function expandDir(configDir) {
  const s = String(configDir || '');
  if (!s) return path.join(HOME, '.claude');
  return path.resolve(s.replace(/%USERPROFILE%/gi, HOME).replace(/^~(?=$|[\\/])/, HOME));
}

/** Every declared lane, with where it stands. Never throws. */
function readAccounts(lanesFile) {
  const { limitPosition } = require('./cwos-resource-board');
  const j = lanesFile ? readJson(lanesFile) : null;
  if (!j || !Array.isArray(j.lanes)) return { file: lanesFile, lanes: [], why: lanesFile ? `unreadable: ${lanesFile}` : 'no lanes file found' };
  const lanes = j.lanes.filter((l) => l && l.name).map((l) => {
    const dir = expandDir(l.configDir);
    const isDefault = l.name === j.defaultLane;
    const profile = readJson(l.configDir ? path.join(dir, '.claude.json') : path.join(HOME, '.claude.json'));
    const email = profile && profile.oauthAccount && profile.oauthAccount.emailAddress ? String(profile.oauthAccount.emailAddress) : null;
    let provisioned = true;
    let why = null;
    if (!fs.existsSync(dir)) { provisioned = false; why = `not provisioned on this machine (no ${dir})`; }
    else if (!email) { provisioned = false; why = `not signed in (no account in ${dir})`; }
    else if (l.expectedEmail && email.toLowerCase() !== String(l.expectedEmail).toLowerCase()) { provisioned = false; why = `signed in as ${email}, expected ${l.expectedEmail}`; }
    return {
      name: String(l.name), isDefault, dir, configDir: l.configDir || '', expectedEmail: l.expectedEmail || null, email,
      provisioned, why, limit: limitPosition(readJson(path.join(dir, 'cwos-rate-limits.json'))),
    };
  });
  return { file: lanesFile, lanes, defaultLane: j.defaultLane || null };
}

function lanesFileFrom(values) {
  if (values.lanes) return path.resolve(values.lanes);
  const ai = resolveRepo('ai-personal');
  if (ai.ok) {
    const f = path.join(ai.path, 'nodes', 'claude-lanes.json');
    if (fs.existsSync(f)) return f;
  }
  const runtime = path.join(HOME, 'fleet', 'claude-auth-guard-config.json');
  return fs.existsSync(runtime) ? runtime : null;
}

function readHold(values) {
  const readings = [];
  const local = readJson(path.join(HOME, 'fleet', 'arbiter', 'admission.json'));
  const localNode = (local && local.node) || os.hostname();
  readings.push(local ? { node: `${localNode} (this machine)`, admission: local } : { node: `${os.hostname()} (this machine)`, admission: null, why: 'no ~/fleet/arbiter/admission.json' });
  const host = values['node1-host'] || 'cm-node1';
  if (os.hostname().toLowerCase() === host.toLowerCase()) return readings;
  if (values['local-only']) { readings.push({ node: host, admission: null, why: '--local-only: ssh not attempted' }); return readings; }
  const r = run('ssh', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=8', host, 'Get-Content $env:USERPROFILE\\fleet\\arbiter\\admission.json -Raw'], { timeout: 20000 });
  const text = String(r.stdout || '');
  const i = text.indexOf('{');
  let j = null;
  if (i !== -1) { try { j = JSON.parse(text.slice(i)); } catch { j = null; } }
  readings.push(j ? { node: host, admission: j } : { node: host, admission: null, why: r.error ? `ssh: ${r.error.code || r.error.message}` : `ssh returned no admission (exit ${r.status})` });
  return readings;
}

function resolveModels(hb) {
  const ml = require('./lib/model-lane');
  const L = ml.readLedger(ml.ledgerPath(hb));
  if (!L.ok) return { ok: false, refused: L.error };
  const byLane = {};
  for (const lane of ovf.ROUTABLE_LANES) {
    const r = ml.resolveLane(lane, L.data, hb);
    if (!r.ok) return { ok: false, refused: r.refused };
    byLane[lane] = r.model; // the CLI takes a model; a lane effort stays the session default
  }
  return { ok: true, byLane };
}

function hbEventsDir(hb) { return hb ? path.join(hb, '.claude', 'workstream', 'events') : null; }

function readOverflowEvents(hb) {
  const dir = hbEventsDir(hb);
  if (!dir || !fs.existsSync(dir)) return { ok: false, why: hb ? `no event log at ${dir}` : 'HomeBase not found', events: [] };
  const { readFilteredEvents } = require('./core/events');
  return { ok: true, events: readFilteredEvents(dir, { typeFilter: ['cloud-session-launched', 'cloud-batch-landed'] }) };
}

function appendOverflowEvent(hb, tag, payload) {
  try {
    const { appendEvent } = require('./core/events');
    const r = appendEvent({ source_track: 'T6:workstream', source_tier: 'reducer-output', track_tag: tag, payload: { type: tag, ...payload } },
      { workstreamDir: path.join(hb, '.claude', 'workstream') });
    return r && r.ok ? { ok: true } : { ok: false, why: (r && r.errors || []).join('; ') || 'append refused' };
  } catch (err) { return { ok: false, why: err.message }; }
}

// ─── launch checkout ────────────────────────────────────────────────────────

function launchDir(repoName) { return path.join(HOME, 'fleet', 'overflow', repoName); }

function defaultBranch(cwd) {
  const r = git(cwd, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']);
  const s = String(r.stdout || '').trim();
  return s.startsWith('origin/') ? s.slice('origin/'.length) : 'main';
}

/** Dry-run view of the launch checkout. */
function describeLaunchDir(repoPath, repoName) {
  const dir = launchDir(repoName);
  const url = String(git(repoPath, ['remote', 'get-url', 'origin']).stdout || '').trim() || null;
  return { dir, exists: fs.existsSync(path.join(dir, '.git')), origin: url };
}

/** Clone or refresh ~/fleet/overflow/<repo> to origin's default branch; refuse anything dirty. */
function prepareLaunchDir(repoPath, repoName) {
  const d = describeLaunchDir(repoPath, repoName);
  if (!d.origin) return { ok: false, why: `${repoName} has no origin remote` };
  if (!d.exists) {
    fs.mkdirSync(path.dirname(d.dir), { recursive: true });
    const c = run('git', ['clone', '--quiet', d.origin, d.dir], { timeout: 600000 });
    if (c.status !== 0) return { ok: false, why: `git clone failed: ${String(c.stderr || '').trim().slice(0, 300)}` };
  }
  const dirty = String(git(d.dir, ['status', '--porcelain']).stdout || '').trim();
  if (dirty) return { ok: false, why: `launch checkout ${d.dir} has local changes; it is the router's own clone and must stay clean` };
  const f = git(d.dir, ['fetch', '--quiet', '--prune', 'origin'], { timeout: 300000 });
  if (f.status !== 0) return { ok: false, why: `git fetch failed: ${String(f.stderr || '').trim().slice(0, 300)}` };
  const base = defaultBranch(d.dir);
  const co = git(d.dir, ['checkout', '--quiet', '-B', base, `origin/${base}`]);
  if (co.status !== 0) return { ok: false, why: `checkout ${base} failed: ${String(co.stderr || '').trim().slice(0, 300)}` };
  return { ok: true, dir: d.dir, base };
}

function claudeExe() {
  const cfg = readJson(path.join(HOME, 'fleet', 'claude-auth-guard-config.json'));
  return cfg && cfg.claudePath && fs.existsSync(cfg.claudePath) ? cfg.claudePath : 'claude';
}

// ─── plan ───────────────────────────────────────────────────────────────────

function collectPlan(values) {
  const repoName = values.repo || 'claude-poker-tracker';
  const repo = values['queue-dir'] ? { ok: true, path: path.resolve(values['queue-dir'], '..', '..', '..') } : resolveRepo(repoName);
  if (!repo.ok) return { error: repo.why };
  const hb = homebaseRoot(values, repo.path);
  const queueDir = values['queue-dir'] ? path.resolve(values['queue-dir']) : path.join(repo.path, '.claude', 'workstream', 'queue');
  if (!fs.existsSync(queueDir)) return { error: `no queue at ${queueDir}` };

  const ev = readOverflowEvents(hb);
  const inFlight = ovf.inFlightFrom(ev.events, repoName);
  const items = readQueue(queueDir);
  const sel = ovf.selectEligible(items, { programLanes: programLanes(repo.path), inFlight });
  const hold = ovf.holdState(readHold(values));
  const threshold = values.threshold ? Number(values.threshold) : ovf.DEFAULT_THRESHOLD;
  if (!(threshold > 0 && threshold <= 100)) { process.stderr.write('cwos-overflow-router: --threshold must be 1-100\n'); process.exit(2); }
  const accounts = readAccounts(lanesFileFrom(values));
  const account = ovf.pickAccount(accounts.lanes, threshold);
  // The ledger is read beside the lib that interprets it: the hub this script ships in,
  // when it carries one, so a lagging checkout's older ledger never meets a newer reader.
  const ownHub = resolveHomeBaseRoot({ from: __dirname });
  const ml = require('./lib/model-lane');
  const ledgerRoot = values.homebase ? hb : (ownHub && fs.existsSync(ml.ledgerPath(ownHub)) ? ownHub : hb);
  const model = resolveModels(ledgerRoot);
  const max = values.max ? Number(values.max) : ovf.DEFAULT_MAX;
  if (!(max >= 0)) { process.stderr.write('cwos-overflow-router: --max must be a number >= 0\n'); process.exit(2); }
  const plan = ovf.planLaunches({ eligible: sel.eligible, hold, account, model, repo: repoName, max, assumeHeld: values['assume-held'] });
  const open = items.filter((i) => ovf.OPEN_STATUSES.has(String(i.status || '').toLowerCase())).length;
  return {
    repo: repoName, repoPath: repo.path, hb, queueDir, open, sel, hold, accounts, account, model, threshold, max, plan,
    events: ev, launchDir: describeLaunchDir(repo.path, repoName),
  };
}

function renderPlan(p, mode) {
  const L = [];
  L.push(`Overflow router - ${p.repo} - ${mode}`);
  L.push('');
  L.push('IS LOCAL WORK HELD?');
  for (const h of p.hold.holders) L.push(`  HOLDING  ${h.node}: ${h.reason} (${h.age_min} min ago)`);
  for (const a of p.hold.admitting) L.push(`  admitting ${a.node}: ${a.reason} (${a.age_min} min ago)`);
  for (const u of p.hold.unknown) L.push(`  unknown  ${u.node}: ${u.why}`);
  L.push('');
  L.push(`ACCOUNTS (weekly limit; threshold ${p.threshold}%) - from ${p.accounts.file || 'no lanes file'}`);
  if (!p.accounts.lanes.length) L.push(`  unknown (${p.accounts.why})`);
  for (const a of p.accounts.lanes) {
    const lim = a.limit && a.limit.known ? `${Math.round(a.limit.seven_day_pct)}% of the week used (reading ${a.limit.age})` : `weekly use unknown (${a.limit ? a.limit.why : 'no reading'})`;
    L.push(`  ${a.name}${a.isDefault ? ' (default)' : ''} ${a.expectedEmail || ''}: ${a.provisioned ? lim : a.why}`);
  }
  L.push(`  -> ${p.account.lane ? `use ${p.account.lane}` : 'no account'}: ${p.account.reason}`);
  L.push('');
  const ex = Object.entries(p.sel.excluded).sort((a, b) => b[1].length - a[1].length);
  L.push(`ELIGIBLE: ${p.sel.eligible.length} of ${p.open} open items can run as a cloud session`);
  for (const [why, ids] of ex) L.push(`  not eligible, ${why}: ${ids.length}`);
  const byLane = {};
  for (const e of p.sel.eligible) byLane[e.lane] = (byLane[e.lane] || 0) + 1;
  if (p.sel.eligible.length) L.push(`  eligible by lane: ${Object.entries(byLane).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  const unwritten = p.sel.eligible.filter((e) => /not yet written/.test(e.lane_source)).length;
  if (unwritten) L.push(`  ${unwritten} eligible item(s) carry no model_lane yet; lanes classified now by the WS-1170 ladder (cwos-model-lane backfill writes them)`);
  if (!p.events.ok) L.push(`  in-flight check: unknown (${p.events.why}) - an item already launched could be offered again`);
  L.push('');
  if (p.plan.refused) {
    L.push(`LAUNCH: nothing - ${p.plan.refused}`);
    if (p.plan.launch.length) L.push(`  (had it been allowed, the top ${p.plan.launch.length}: ${p.plan.launch.map((l) => l.item.id).join(', ')})`);
  } else {
    L.push(`LAUNCH (${p.plan.launch.length}, cap ${p.max}) as batch ${p.plan.batch} on account ${p.account.lane}:`);
  }
  for (const l of p.plan.launch) {
    L.push(`  ${l.item.id} [${l.item.lane} -> ${l.model || '?'}] p${l.item.priority} ${l.item.title.slice(0, 90)}`);
    L.push(`      branch ${l.branch}`);
  }
  if (p.plan.launch.length) {
    const acct = p.accounts.lanes.find((a) => a.name === p.account.lane);
    const env = acct && acct.configDir ? `CLAUDE_CONFIG_DIR=${acct.dir} ` : '';
    L.push(`  command, per item, from ${p.launchDir.dir}${p.launchDir.exists ? '' : ' (cloned on first --launch)'}:`);
    L.push(`      ${env}claude --cloud "<brief>" --model ${p.plan.launch[0].model || '?'}`);
    L.push('  brief for the first item:');
    for (const line of p.plan.launch[0].brief.split('\n')) L.push(`      | ${line}`);
    L.push(`  landing: ONE branch ${ovf.batchBranch(p.plan.batch)} and ONE PR - cwos-overflow-router land --batch ${p.plan.batch}`);
  }
  return L.join('\n');
}

function doLaunch(p) {
  const results = [];
  if (!p.hb) return { ok: false, why: 'HomeBase not found: launches could not be logged, so none were started', results };
  const prep = prepareLaunchDir(p.repoPath, p.repo);
  if (!prep.ok) return { ok: false, why: prep.why, results };
  const acct = p.accounts.lanes.find((a) => a.name === p.account.lane);
  const env = { ...process.env, CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS: '0' };
  if (acct && acct.configDir) env.CLAUDE_CONFIG_DIR = acct.dir; else delete env.CLAUDE_CONFIG_DIR;
  const exe = claudeExe();
  for (const l of p.plan.launch) {
    const r = run(exe, ovf.launchArgv(l), { cwd: prep.dir, env, timeout: LAUNCH_TIMEOUT_MS, stdio: ['ignore', 'pipe', 'pipe'] });
    const text = `${r.stdout || ''}\n${r.stderr || ''}`;
    const parsed = ovf.parseLaunchOutput(text);
    const ok = r.status === 0 && !r.error;
    const payload = {
      batch: p.plan.batch, repo: p.repo, item: l.item.id, lane: l.item.lane, model: l.model, account_lane: l.account,
      branch: l.branch, ok, session_id: parsed.session_id, url: parsed.url,
      error: ok ? null : (r.error ? (r.error.code || r.error.message) : `exit ${r.status}: ${text.trim().slice(-300)}`),
    };
    const logged = appendOverflowEvent(p.hb, 'cloud-session-launched', payload);
    results.push({ ...payload, logged: logged.ok, log_error: logged.ok ? null : logged.why });
  }
  return { ok: results.every((x) => x.ok), results };
}

function runPlan(values) {
  const p = collectPlan(values);
  if (p.error) { process.stderr.write(`cwos-overflow-router: ${p.error}\n`); process.exit(1); }
  let launched = null;
  if (values.launch && !p.plan.refused && p.plan.launch.length) launched = doLaunch(p);
  if (values.json) {
    out(JSON.stringify({
      repo: p.repo, mode: values.launch ? 'launch' : 'dry-run', open: p.open, eligible: p.sel.eligible,
      excluded: Object.fromEntries(Object.entries(p.sel.excluded).map(([k, v]) => [k, v.length])),
      hold: p.hold, accounts: p.accounts.lanes.map(({ limit, ...a }) => ({ ...a, limit })), account: p.account,
      threshold: p.threshold, batch: p.plan.batch, refused: p.plan.refused,
      launch: p.plan.launch.map((l) => ({ id: l.item.id, lane: l.item.lane, model: l.model, account: l.account, branch: l.branch })),
      launched,
    }, null, 1));
  } else {
    out(renderPlan(p, values.launch ? 'LAUNCH' : 'DRY RUN (nothing launched; --launch to start them)'));
    if (launched) {
      out('');
      if (!launched.results.length) out(`LAUNCH FAILED before any session: ${launched.why}`);
      for (const x of launched.results) {
        out(`  ${x.ok ? 'started' : 'FAILED '} ${x.item}${x.url ? ` ${x.url}` : ''}${x.error ? ` - ${x.error}` : ''}${x.logged ? '' : ` - NOT logged: ${x.log_error}`}`);
      }
    }
  }
  if (launched && !launched.ok) process.exit(1);
}

// ─── land ───────────────────────────────────────────────────────────────────

function runLand(values) {
  const batch = values.batch;
  if (!batch || !/^ovf-\d{8}-\d{4}$/.test(batch)) { process.stderr.write('usage: cwos-overflow-router land --batch ovf-YYYYMMDD-HHMM [--execute]\n'); process.exit(2); }
  const repoName = values.repo || 'claude-poker-tracker';
  const repo = resolveRepo(repoName);
  if (!repo.ok) { process.stderr.write(`cwos-overflow-router: ${repo.why}\n`); process.exit(1); }
  const d = describeLaunchDir(repo.path, repoName);
  const from = d.exists ? d.dir : repo.path;
  const ls = git(from, ['ls-remote', '--heads', 'origin', `${ovf.batchBranch(batch)}/*`], { timeout: 60000 });
  if (ls.status !== 0) { process.stderr.write(`git ls-remote failed: ${String(ls.stderr || '').trim()}\n`); process.exit(1); }
  const branches = String(ls.stdout || '').split(/\r?\n/).map((l) => l.split('\t')[1]).filter(Boolean).map((r) => r.replace(/^refs\/heads\//, ''));
  const lp = ovf.landPlan(batch, branches);
  out(`Batch ${batch} in ${repoName}: ${lp.items.length} pushed branch(es)${lp.items.length ? ` - ${lp.items.join(', ')}` : ''}`);
  if (!lp.items.length) { out('Nothing to land.'); return; }
  out(`Would merge each into ${lp.branch} (from origin's default branch) and open ONE PR: "${lp.title}"`);
  if (!values.execute) { out('DRY RUN - pass --execute to merge, push and open the PR.'); return; }

  const prep = prepareLaunchDir(repo.path, repoName);
  if (!prep.ok) { process.stderr.write(`${prep.why}\n`); process.exit(1); }
  const fail = (msg) => { process.stderr.write(`${msg}\n`); git(prep.dir, ['merge', '--abort']); git(prep.dir, ['checkout', '--quiet', prep.base]); process.exit(1); };
  if (git(prep.dir, ['checkout', '--quiet', '-B', lp.branch, `origin/${prep.base}`]).status !== 0) fail(`could not create ${lp.branch}`);
  for (const b of lp.merges) {
    const m = git(prep.dir, ['merge', '--no-ff', '--no-edit', `origin/${b}`]);
    if (m.status !== 0) fail(`merge of ${b} conflicts - resolve by hand in ${prep.dir}; nothing was pushed`);
  }
  const push = git(prep.dir, ['push', '--quiet', '-u', 'origin', lp.branch], { timeout: 300000 });
  if (push.status !== 0) fail(`push failed: ${String(push.stderr || '').trim().slice(0, 300)}`);
  const body = [
    `One PR for overflow batch ${batch} (WS-1171): ${lp.items.length} item(s) done in cloud sessions while local compute was held.`,
    'One PR per batch, not per item: each PR here costs the compute node a 70-minute CI job.',
    '',
    ...lp.merges.map((b) => `- ${b}`),
    '',
    '🤖 Generated with [Claude Code](https://claude.com/claude-code)',
  ].join('\n');
  const pr = run('gh', ['pr', 'create', '--base', prep.base, '--head', lp.branch, '--title', lp.title, '--body', body], { cwd: prep.dir, timeout: 120000 });
  git(prep.dir, ['checkout', '--quiet', prep.base]);
  if (pr.status !== 0) { process.stderr.write(`gh pr create failed: ${String(pr.stderr || '').trim()}\n`); process.exit(1); }
  const url = String(pr.stdout || '').trim();
  out(`PR: ${url}`);
  const hb = homebaseRoot(values, repo.path);
  const logged = hb ? appendOverflowEvent(hb, 'cloud-batch-landed', { batch, repo: repoName, items: lp.items, branch: lp.branch, pr: url }) : { ok: false, why: 'HomeBase not found' };
  if (!logged.ok) out(`NOT logged: ${logged.why} - these items will be offered again until a cloud-batch-landed event exists`);
}

function main() {
  const { values, sub } = cliGate(process.argv.slice(2), CLI);
  if (sub === 'land') return runLand(values);
  return runPlan(values);
}

if (require.main === module) main();

module.exports = { readAccounts, expandDir, renderPlan, homebaseRoot, readOverflowEvents };
