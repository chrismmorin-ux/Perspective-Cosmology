'use strict';
/**
 * test-sweep-record — the per-commit test sweep record (WS-986, MIS-015).
 *
 * WHY THIS EXISTS. 2026-10-01: kit 3.43.0's release PR #40 opened with
 * "🟡 Needs your tap" and the session told the founder it was ready, while
 * atomic-state-writes.test.js was RED and the full kit sweep had never
 * completed against that code. The daily watermark (.test-sweep.json, WS-808)
 * could not have said otherwise: it describes whatever master's checkout held
 * when the scheduled task last ran, not the commit being released. "The suites
 * were green yesterday" is BLIND about today's commit, and nothing could tell
 * the two apart.
 *
 * So every full sweep also leaves a record keyed by the commit it tested:
 *
 *   <workstreamDir>/state/test-sweeps/<full-head-sha>.json
 *   { head_sha, repo_root, kit_scripts_tree, dirty_kit_scripts, started_at,
 *     finished_at, suites_total, suites_run, failed: [{suite, exit}],
 *     cut_short, health: OK|RED|BLIND }
 *
 * Three readers, one module so they cannot disagree about what "tested" means:
 * cwos-test-sweep.js writes it, cwos-pr.js turns it into a release PR's health,
 * and cwos-hash-manifest.js refuses to baseline a kit/scripts tree no green
 * record covers.
 *
 * kit_scripts_tree is the identity that matters. It is `git rev-parse
 * HEAD:kit/scripts` — the tree object of the code AND the suites — so two
 * commits that differ only in kit/VERSION or a changelog share it, and a
 * release commit does not need a second 10-minute sweep to prove code that a
 * sweep already proved. A dirty kit/scripts at sweep time makes that identity
 * a lie (the suites ran code no commit holds), so a dirty run is never OK.
 *
 * Node-local, never committed: lib/derived-state.js NODE_LOCAL_DIRS carries
 * `.claude/workstream/state/test-sweeps/`, mirrored in .gitignore and
 * kit/templates/gitignore-cwos.txt. `state/*.json` alone does not reach a
 * subdirectory, which is why the directory has its own rule. The directory is
 * resolved through findWorkstreamDir, so a release worktree's sweep lands
 * where the main tree's cwos-pr and cwos-hash-manifest look (WS-576).
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { writeFileAtomic, findWorkstreamDir } = require('./cwos-utils');

const RECORD_SUBDIR = path.join('state', 'test-sweeps');
const HEALTH = Object.freeze({ OK: 'OK', RED: 'RED', BLIND: 'BLIND' });

// ─── Timing suites on a paging machine (WS-1215) ────────────────────────────
//
// A wall-clock budget measured while the machine pages measures the machine,
// not the code. 2026-10-21 on the G16 (0.7 GB free, commit charge 2.9x
// physical): the session-start fast set took 3.1s to 6.8s across back-to-back
// runs of identical code against a 4.8s budget, so verify-budget went red and
// green at random and held the 3.47.0 release with it. /verify already refuses
// to run a suite into insufficient headroom for the same reason (Layer 0).
//
// So a timing suite that runs OVER budget asks cwos-headroom whether the
// machine is paging. If it is, the result is NOT MEASURED: the suite exits
// BLIND_EXIT and the sweep records it under not_measured, never under failed.
// The budget itself is untouched, and an over-budget run on a machine with
// headroom is RED exactly as before. If headroom cannot be read, the failure
// stands: an unknown machine is no excuse.

const BLIND_EXIT = 3;
// Exit 3 alone is an untyped sentinel (any crash can exit 3); a suite is NOT
// MEASURED only if it also printed this marker, which only NotMeasured carries.
const NOT_MEASURED_MARKER = 'NOT MEASURED — the machine is paging';
const isNotMeasuredOutput = (out) => String(out || '').includes(NOT_MEASURED_MARKER);
// cwos-headroom's own words: above 1.5x commit to physical it prints
// "oversubscribed, the machine is paging". Below its 2 GB OS reserve the
// machine has nothing left to give a timed child either.
const PAGING_OVERSUBSCRIPTION = 1.5;
const PAGING_FREE_GB = 2;

class NotMeasured extends Error {
  constructor(message) { super(message); this.name = 'NotMeasured'; }
}

/** { paging: true|false|null, reason } from `cwos-headroom --json`; null = could not tell. */
function machinePressure(opts = {}) {
  let v = opts.verdict;
  if (v === undefined) {
    const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'cwos-headroom.js'), '--json'], { encoding: 'utf8', timeout: 30000 });
    try { v = JSON.parse(r.stdout || ''); } catch { v = null; }
  }
  const b = v && v.before;
  if (!b || !Number.isFinite(b.oversubscription) || !Number.isFinite(b.physicalFreeGB)) {
    return { paging: null, reason: 'cwos-headroom gave no reading' };
  }
  const reading = `${b.physicalFreeGB} GB free of ${b.physicalTotalGB} GB, commit ${b.oversubscription}x physical`;
  const paging = b.oversubscription > PAGING_OVERSUBSCRIPTION || b.physicalFreeGB < PAGING_FREE_GB;
  return { paging, reason: reading };
}

/**
 * Judge one wall-clock comparison, which the caller makes exactly as before so
 * no budget moves by a millisecond. Within budget: returns. Over budget on a
 * paging machine: throws NotMeasured. Over budget otherwise: throws Error.
 */
function assertTimingBudget(withinBudget, message, opts = {}) {
  if (withinBudget) return;
  const p = machinePressure(opts);
  if (p.paging === true) throw new NotMeasured(`${NOT_MEASURED_MARKER} (${p.reason}): ${message}`);
  throw new Error(p.paging === null ? `${message} (headroom unreadable, so the failure stands)` : message);
}

function gitOut(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', timeout: 15000 });
  if (r.status !== 0) return null;
  return (r.stdout || '').trim();
}

/** The checkout's commit identity: { head_sha, kit_scripts_tree, dirty } — nulls outside git. */
function describeCheckout(root) {
  const head = gitOut(root, ['rev-parse', 'HEAD']);
  const tree = head ? gitOut(root, ['rev-parse', 'HEAD:kit/scripts']) : null;
  // Untracked counts: a new suite nobody committed is code no commit holds.
  const status = head ? gitOut(root, ['status', '--porcelain', '--untracked-files=all', '--', 'kit/scripts']) : null;
  return {
    head_sha: head && /^[0-9a-f]{40}$/.test(head) ? head : null,
    kit_scripts_tree: tree && /^[0-9a-f]{40}$/.test(tree) ? tree : null,
    dirty: status === null ? null : status.length > 0,
  };
}

/** Where records live for `root` — the canonical workstream dir, or null if there is none. */
function recordDir(root) {
  let ws = null;
  try { ws = findWorkstreamDir(root); } catch { ws = null; }
  return ws ? path.join(ws, RECORD_SUBDIR) : null;
}

/**
 * Pure. OK only when every suite ran to completion, none failed, the run was
 * not cut short, and kit/scripts was clean. A known failure is RED even when
 * the run was also cut short; everything else short of OK is BLIND, because
 * "nobody checked this commit" must never read as fine.
 */
function computeHealth(rec) {
  if (!rec || typeof rec !== 'object') return HEALTH.BLIND;
  const failed = Array.isArray(rec.failed) ? rec.failed : [];
  if (failed.length) return HEALTH.RED;
  const total = Number(rec.suites_total);
  const ran = Number(rec.suites_run);
  if (!Number.isFinite(total) || total <= 0 || ran !== total) return HEALTH.BLIND;
  if (rec.cut_short !== false || rec.dirty_kit_scripts !== false) return HEALTH.BLIND;
  // A sweep that measured nothing is not a green one.
  const notMeasured = Array.isArray(rec.not_measured) ? rec.not_measured.length : 0;
  if (notMeasured >= total) return HEALTH.BLIND;
  return HEALTH.OK;
}

function readRecordFile(file) {
  try {
    const rec = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!rec || typeof rec !== 'object') return null;
    // Health is recomputed, never trusted from disk: a hand-edited "OK" on a
    // record that lists failures is exactly the lie this module exists to stop.
    return { ...rec, health: computeHealth(rec) };
  } catch { return null; }
}

function readRecord(dir, sha) {
  if (!dir || !/^[0-9a-f]{40}$/.test(String(sha || ''))) return null;
  return readRecordFile(path.join(dir, `${sha}.json`));
}

function listRecords(dir) {
  if (!dir) return [];
  let names = [];
  try { names = fs.readdirSync(dir); } catch { return []; }
  return names.filter((n) => /^[0-9a-f]{40}\.json$/.test(n))
    .map((n) => readRecordFile(path.join(dir, n))).filter(Boolean);
}

const newestFirst = (a, b) => String(b.finished_at || b.started_at || '').localeCompare(String(a.finished_at || a.started_at || ''));
const newestFinishedFirst = (a, b) => String(b.finished_at || '').localeCompare(String(a.finished_at || ''));

/**
 * Conclusive = the run finished, was not cut short, and kit/scripts was clean.
 * A dirty run tested no commit; an unfinished or killed run proved nothing.
 * (A conclusive record may still be RED: that is a real verdict.)
 */
function isConclusive(r) {
  return Boolean(r) && Boolean(r.finished_at) && r.cut_short === false && r.dirty_kit_scripts === false
    && Number(r.suites_total) > 0 && Number(r.suites_run) === Number(r.suites_total);
}

/**
 * The record that speaks for a commit: its own record if it is conclusive,
 * else the newest conclusive record (by finished_at only) whose kit/scripts
 * tree is identical (same code, same suites — a version bump on top does not
 * need re-proving). If neither exists but an inconclusive own record does, it
 * is returned so callers can say why the commit is BLIND. Null = nothing.
 */
function recordForCommit(dir, sha, tree) {
  const pick = () => {
    const own = readRecord(dir, sha);
    if (isConclusive(own)) return { record: own, via: 'head' };
    if (tree) {
      const same = listRecords(dir).filter((r) => r.kit_scripts_tree === tree && isConclusive(r)).sort(newestFinishedFirst);
      if (same.length) return { record: same[0], via: 'tree' };
    }
    return own ? { record: own, via: 'head' } : null;
  };
  const found = pick();
  if (!found) return null;
  // Reported, never decisive: whether a RED on the identical tree holds a
  // release is a founder policy question. The verdict above is unchanged.
  const r = found.record;
  const reds = redsOnTree(dir, tree || r.kit_scripts_tree).filter((x) => !(x.head_sha === r.head_sha && x.finished_at === r.finished_at));
  const newer = reds.find((x) => r.finished_at ? x.finished_at > r.finished_at : true) || null;
  return { ...found, reds_on_tree: reds, newer_red: newer };
}

/** The newest OK record whose kit_scripts_tree equals `tree`, or null. */
function okRecordForTree(dir, tree) {
  if (!tree) return null;
  return listRecords(dir).filter((r) => r.kit_scripts_tree === tree && r.health === HEALTH.OK).sort(newestFirst)[0] || null;
}

/**
 * Write a record (health recomputed). A dirty run never replaces a clean
 * completed record for the same commit: the dirty run did not test that
 * commit, so it has nothing to say about it. Returns the path written, or null.
 */
function writeRecord(dir, rec) {
  if (!dir || !rec || !/^[0-9a-f]{40}$/.test(String(rec.head_sha || ''))) return null;
  const file = path.join(dir, `${rec.head_sha}.json`);
  if (rec.dirty_kit_scripts !== false) {
    const prior = readRecordFile(file);
    if (prior && prior.dirty_kit_scripts === false && prior.finished_at) return null;
  }
  fs.mkdirSync(dir, { recursive: true });
  const out = { ...rec, health: computeHealth(rec) };
  writeFileAtomic(file, `${JSON.stringify(out, null, 2)}\n`);
  // Append-only history: <sha>.json is only the LATEST attempt, so a RED rerun
  // green would otherwise vanish. Finished, clean attempts only — a dirty run
  // tested no commit and an unfinished one proved nothing. Never rewritten.
  if (out.finished_at && out.dirty_kit_scripts === false) {
    try { fs.appendFileSync(path.join(dir, `${rec.head_sha}.attempts.jsonl`), `${JSON.stringify(out)}\n`); } catch { /* history is best-effort */ }
  }
  return file;
}

/** Every recorded attempt for a commit, oldest first; health recomputed, bad lines skipped. */
function readAttempts(dir, sha) {
  if (!dir || !/^[0-9a-f]{40}$/.test(String(sha || ''))) return [];
  let text = '';
  try { text = fs.readFileSync(path.join(dir, `${sha}.attempts.jsonl`), 'utf8'); } catch { return []; }
  const out = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    try {
      const r = JSON.parse(line);
      if (r && typeof r === 'object') out.push({ ...r, health: computeHealth(r) });
    } catch { /* skip */ }
  }
  return out;
}

/**
 * Every finished, clean RED attempt on `tree` (a cut-short run that recorded failures is a real red), from all attempt histories plus the
 * current records, de-duplicated by (head_sha, finished_at), newest first.
 * Reported next to a verdict; it does not change one (policy pending).
 */
function redsOnTree(dir, tree) {
  if (!dir || !tree) return [];
  let names = [];
  try { names = fs.readdirSync(dir); } catch { return []; }
  const all = listRecords(dir);
  for (const n of names) {
    const m = /^([0-9a-f]{40})\.attempts\.jsonl$/.exec(n);
    if (m) all.push(...readAttempts(dir, m[1]));
  }
  const seen = new Set();
  return all.filter((r) => r.kit_scripts_tree === tree && r.finished_at && r.dirty_kit_scripts === false && r.health === HEALTH.RED)
    .filter((r) => { const k = `${r.head_sha}|${r.finished_at}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort(newestFinishedFirst);
}

// ─── The per-commit sweep lock ──────────────────────────────────────────────
//
// Two sweeps of one HEAD race on one record (a RED and a green rerun
// interleave, the later start overwrites the earlier). `<sha>.lock` is created
// with O_EXCL ('wx'), so exactly one process can hold it. It lives in the
// ignored state/test-sweeps/ directory, never committed.
//
// SWEEP_LOCK_STALE_MS = 2 hours. A real full sweep takes ~10-15 minutes; two
// hours is far past any honest run yet short enough that a lock left by a
// killed run on another machine (whose pid we cannot test) frees itself the
// same working day. On THIS host a dead pid frees the lock at once.
const SWEEP_LOCK_STALE_MS = 2 * 60 * 60 * 1000;

function readLockText(file) { try { return fs.readFileSync(file, 'utf8'); } catch { return null; } }
function parseLock(text) { try { const l = JSON.parse(text); return l && typeof l === 'object' ? l : null; } catch { return null; } }

/** { ok:true, token } or { ok:false, holder } (holder null when unreadable or unwritable). */
const UNPARSEABLE_LOCK_GRACE_MS = 60 * 1000;

function acquireSweepLock(dir, sha, opts = {}) {
  if (!dir || !/^[0-9a-f]{40}$/.test(String(sha || ''))) return { ok: false, holder: null };
  const now = typeof opts.now === 'number' ? opts.now : Date.now();
  const alive = opts.pidAlive || defaultPidAlive;
  const staleMs = Number.isFinite(opts.staleMs) ? opts.staleMs : SWEEP_LOCK_STALE_MS;
  const host = os.hostname();
  const file = path.join(dir, `${sha}.lock`);
  const token = crypto.randomBytes(8).toString('hex');
  const body = JSON.stringify({ pid: process.pid, host, started_at: new Date(now).toISOString(), token });
  try { fs.mkdirSync(dir, { recursive: true }); } catch (e) { return { ok: false, holder: null, error: `cannot create ${dir}: ${e.code || e.message}` }; }

  const create = () => {
    try { const fd = fs.openSync(file, 'wx'); try { fs.writeSync(fd, body); } finally { fs.closeSync(fd); } return 'made'; }
    catch (e) { if (e && e.code === 'EEXIST') return 'exists'; createError = e && (e.code || e.message); return 'error'; }
  };
  let createError = null;
  const first = create();
  if (first === 'made') return { ok: true, token };
  if (first === 'error') return { ok: false, holder: null, error: `cannot create ${file}: ${createError}` };

  const text = readLockText(file);
  if (text === null) { return create() === 'made' ? { ok: true, token } : { ok: false, holder: null }; }
  const held = parseLock(text);
  const startedMs = held ? Date.parse(held.started_at) : NaN;
  // An unparseable lock is usually one being written right now: 'wx' creates
  // the file empty and the body lands a moment later. Judging that stale would
  // let a second sweep take a lock its holder believes it has. So an
  // unparseable lock is stale only once its file is older than a minute.
  let unparseableStale = false;
  if (!held) {
    try { unparseableStale = (now - fs.statSync(file).mtimeMs) > UNPARSEABLE_LOCK_GRACE_MS; }
    catch { unparseableStale = false; }
    if (!unparseableStale) return { ok: false, holder: null };
  }
  // On this host the pid is the truth: a live holder keeps its lock however long
  // it runs (a paging machine with retries can take hours), a dead one frees it
  // at once. Age decides only for a lock from another host.
  const sameHost = Boolean(held) && held.host === host;
  const stale = unparseableStale || !Number.isFinite(startedMs)
    || (sameHost ? !alive(held.pid) : (now - startedMs) > staleMs);
  if (!stale) return { ok: false, holder: held };

  // Take a stale lock atomically: rename moves it away for exactly one taker
  // (the loser gets ENOENT). If what we moved is not the text we judged stale,
  // a fresh holder slipped in between; put it back (link fails if occupied)
  // and stand down. Then ONE 'wx' retry, so two takers cannot both win.
  const aside = `${file}.${process.pid}.${token}.stale`;
  try { fs.renameSync(file, aside); } catch { return { ok: false, holder: held }; }
  if (readLockText(aside) !== text) {
    // Put the fresh holder's lock back. Delete our aside copy only when the
    // link succeeded or the name is occupied; any other link failure (a
    // filesystem without hardlinks) must not destroy a live holder's lock, so
    // the copy is renamed back instead. Known residue: with THREE sweeps racing
    // over one stale lock, a third can 'wx' into the gap before the put-back,
    // and two then believe they hold it. Named in kit/CHANGELOG.md.
    let restored = false;
    try { fs.linkSync(aside, file); restored = true; } catch (e) {
      if (e && e.code === 'EEXIST') restored = true;
      else { try { fs.renameSync(aside, file); } catch { /* leave the aside copy; better than deleting it */ } }
    }
    if (restored) { try { fs.unlinkSync(aside); } catch { /* ignore */ } }
    return { ok: false, holder: parseLock(readLockText(file) || '') };
  }
  try { fs.unlinkSync(aside); } catch { /* ignore */ }
  return create() === 'made' ? { ok: true, token } : { ok: false, holder: parseLock(readLockText(file) || '') };
}

/** Delete the lock only if it is still ours (token match). Returns true if removed. */
function releaseSweepLock(dir, sha, token) {
  if (!dir || !token || !/^[0-9a-f]{40}$/.test(String(sha || ''))) return false;
  const file = path.join(dir, `${sha}.lock`);
  const held = parseLock(readLockText(file) || '');
  if (!held || held.token !== token) return false;
  try { fs.unlinkSync(file); return true; } catch { return false; }
}

// ─── The daily watermark (.test-sweep.json) — one judgement, two readers ────
//
// INV-089 judged the watermark inside cwos-verify.js and nothing else read it,
// so a dead or RED daily sweep was visible only to a session that happened to
// run /verify. It sat 10 days dead (WS-987) while collision-tax and git-hygiene
// went RED on master and a kit release was presented as ready over them
// (MIS-015). The judgement now lives here so INV-089 and the /next digest
// cannot disagree about it.

const WATERMARK_FILE = '.test-sweep.json';
const WATERMARK_CADENCE_MINUTES = 24 * 60;   // daily tier; x3 tolerance = INV-089's 3 days

function defaultPidAlive(pid) {
  try { process.kill(Number(pid), 0); return true; }
  catch (e) { return Boolean(e && e.code === 'EPERM'); }
}

/**
 * Pure judgement of a watermark object. `stamp` null means the file is absent.
 * `problems` is INV-089's list verbatim — empty means the check passes.
 */
function assessWatermark(stamp, opts = {}) {
  const now = typeof opts.now === 'number' ? opts.now : Date.now();
  const pidAlive = opts.pidAlive || defaultPidAlive;
  const { assess } = require('./sweep-freshness');
  const s = stamp || {};
  const fresh = assess({ swept_at: s.last_completed_at || null, now, cadence_minutes: WATERMARK_CADENCE_MINUTES });

  const completed = s.last_completed_at ? Date.parse(s.last_completed_at) : NaN;
  const started = s.last_started_at ? Date.parse(s.last_started_at) : NaN;
  const invoked = s.last_invoked_at ? Date.parse(s.last_invoked_at) : NaN;
  const staleMs = fresh.stale_after_hours * 3600000;

  // A run that started and never finished. The sweep takes ~14 minutes, so an
  // open run with a live pid is IN PROGRESS, not truncated — a check that cries
  // wolf on schedule once a day is one people learn to skip.
  const openRun = Number.isFinite(started) && (!Number.isFinite(completed) || started > completed);
  const inProgress = openRun && Boolean(s.last_started_pid) && pidAlive(s.last_started_pid);
  const truncated = openRun && !inProgress;

  const failing = Number(s.failing) || 0;
  const timing = Number(s.timing_out) || 0;
  const failures = Array.isArray(s.failures) ? s.failures : [];
  const notMeasured = Array.isArray(s.not_measured_suites) ? s.not_measured_suites : [];

  const totalSuites = Number(s.total_suites) || 0;
  const allUnmeasured = totalSuites > 0 && notMeasured.length >= totalSuites;

  const problems = [];
  if (!stamp) {
    problems.push('.test-sweep.json absent — the sweeper ships but has never run. Prime it with `node kit/scripts/cwos-test-sweep.js --force`.');
  } else {
    if (truncated) problems.push(`a sweep started ${s.last_started_at} never completed — truncated or killed mid-run`);
    if (!Number.isFinite(completed)) {
      if (!inProgress) problems.push('no completed sweep recorded yet');
    } else if (now - completed > staleMs) {
      const days = Math.floor((now - completed) / 86400000);
      const invokedNote = Number.isFinite(invoked) && (now - invoked) <= staleMs
        ? ' — the sweeper IS being invoked, so the daily tier is starting and not finishing'
        : ' — the sweeper is not being invoked at all; check the Fleet-SessionSweep task\'s fourth action';
      problems.push(`last completed sweep is ${days}d old (max ${Math.round(fresh.stale_after_hours / 24)}d)${invokedNote}`);
    }
    if (failing + timing > 0) {
      const names = failures.slice(0, 6).map((f) => `${f.suite} [${f.status}]`).join(', ');
      const more = failures.length > 6 ? ` (+${failures.length - 6} more)` : '';
      problems.push(`${failing} suite(s) failing, ${timing} timing out: ${names}${more}`);
    }
    if (allUnmeasured && Number.isFinite(completed)) {
      problems.push(`every suite (${totalSuites}) was NOT MEASURED — the sweep measured nothing`);
    }
  }

  return {
    ...fresh,
    present: Boolean(stamp),
    invoked_at: s.last_invoked_at || null,
    invoked_age_hours: Number.isFinite(invoked) ? Math.round((now - invoked) / 360000) / 10 : null,
    in_progress: inProgress,
    truncated,
    total_suites: Number(s.total_suites) || 0,
    failing,
    timing_out: timing,
    red: failing + timing > 0 || (allUnmeasured && Number.isFinite(completed)),
    failures: failures.map((f) => ({ suite: f.suite, status: f.status, first_failure: f.first_failure || '' })),
    not_measured: notMeasured.map((f) => ({ suite: f.suite, why: f.why || '' })),
    total_ms: Number(s.total_ms) || 0,
    problems,
  };
}

/**
 * The /next digest (WS-987). Null where the sweeper does not exist — adopted
 * repos do not carry HomeBase's kit suites, so they render nothing. Where it
 * does, an absent or unreadable watermark is NOT null: it comes back with
 * swept_at null, which every digest renders as the loud "age UNKNOWN" state.
 */
function computeWatermarkDigest(opts = {}) {
  const scriptsDir = opts.scriptsDir || path.join(__dirname, '..');
  if (!fs.existsSync(path.join(scriptsDir, 'cwos-test-sweep.js'))) return null;
  let wsDir = opts.wsDir;
  if (!wsDir) { try { wsDir = findWorkstreamDir(opts.from || process.cwd()); } catch { wsDir = null; } }
  if (!wsDir) return null;
  let stamp = null;
  try { stamp = JSON.parse(fs.readFileSync(path.join(wsDir, WATERMARK_FILE), 'utf8')); } catch { /* absent/unreadable: judged below */ }
  return assessWatermark(stamp, opts);
}

module.exports = {
  RECORD_SUBDIR, HEALTH, BLIND_EXIT, NOT_MEASURED_MARKER, isNotMeasuredOutput, NotMeasured, machinePressure, assertTimingBudget,
  describeCheckout, recordDir, computeHealth,
  readRecord, listRecords, readAttempts, redsOnTree, SWEEP_LOCK_STALE_MS, acquireSweepLock, releaseSweepLock, recordForCommit, okRecordForTree, writeRecord,
  WATERMARK_FILE, WATERMARK_CADENCE_MINUTES, assessWatermark, computeWatermarkDigest,
};
