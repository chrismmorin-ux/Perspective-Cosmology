#!/usr/bin/env node
/**
 * with-heavy-lock — serialize heavy test/build/corpus jobs across every worktree
 * on ONE machine (WS-1122 / GOAL-001 C4-C6).
 *
 * The lock is a directory under git's COMMON dir, so every linked worktree on this
 * machine contends for the same one. `mkdir` is the atomic primitive.
 *
 * THIS IS A REWRITE OF THE VERSION IN PR #35, NOT AN ADOPTION OF IT. That one was
 * measured on 2026-09-18 to leak the lock on SIGHUP, SIGQUIT and SIGKILL, and it had
 * no staleness test, no override, and no recovery path — while the docs shipped with
 * it told the operator not to delete a lock they could not prove stale, without
 * defining "stale" and without ever naming the path. On Windows, where both of this
 * fleet's machines live, SIGTERM is never delivered at all, so console-close,
 * taskkill, a Task Scheduler stop and a reboot ALL leaked it. The consequence was
 * that one ungraceful death fails every `npm test` and `npm run build` on the
 * machine, forever, with an error that names neither the file nor the remedy.
 *
 * Four things make that impossible here:
 *
 *   1. HANDLERS FIRST. Every handler is registered BEFORE the metadata write. The
 *      original left a 23-line window in which a throw leaked a lock carrying no
 *      owner information at all.
 *   2. STALENESS IS COMPUTED, NOT ASSERTED. A lock whose owner names THIS host and
 *      a pid that is not running is dead, and is reclaimed automatically. Host-gated
 *      because a pid from another machine says nothing about this one's process table.
 *   3. THE CHILD DIES WITH THE WRAPPER. The original released the lock and exited
 *      while the job kept running, so a supervisor killing the wrapper by pid
 *      un-mutexed a machine that was still saturated.
 *   4. THE ERROR NAMES THE PATH. Always. A recovery procedure nobody can find is
 *      not a recovery procedure.
 *
 * NO `npm exec`. The original ran `npm exec -- vitest run`. With no node_modules —
 * the default state of every fresh worktree, and of a fresh clone — `npm exec`
 * SILENTLY downloads an unpinned version from the registry and reports a
 * normal-looking result. Measured: vitest@5 against a `^4.0.15` pin. Invoking the
 * binary directly means `npm run` puts node_modules/.bin on PATH and an absent
 * toolchain fails loudly instead.
 *
 * Usage:  with-heavy-lock.mjs [--wait <seconds>] -- <command> [args...]
 * Env:    HEAVY_LOCK_WAIT_SECONDS (default 0 — fail fast)
 *         HEAVY_LOCK_FORCE=1      (reclaim even an un-provable lock; last resort)
 * Exit:   the child's code · 73 the lock is held · 2 bad usage.
 */
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync, renameSync, existsSync } from 'node:fs';
import { resolve, join, normalize, delimiter } from 'node:path';
import { hostname } from 'node:os';
import { bootId } from '../lib/node-identity.mjs';

const argv = process.argv.slice(2);
const dash = argv.indexOf('--');
const flags = dash >= 0 ? argv.slice(0, dash) : [];
const command = dash >= 0 ? argv.slice(dash + 1) : argv;
if (command.length === 0) {
  console.error('with-heavy-lock: usage: with-heavy-lock.mjs [--wait <seconds>] -- <command> [args...]');
  process.exit(2);
}
const waitIdx = flags.indexOf('--wait');
const WAIT_S = waitIdx >= 0 ? Number(flags[waitIdx + 1]) || 0
  : Number(process.env.HEAVY_LOCK_WAIT_SECONDS || 0);

const root = resolve(execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim());
const commonDir = resolve(root, execFileSync('git', ['rev-parse', '--git-common-dir'], { encoding: 'utf8' }).trim());
const lockDir = join(commonDir, 'heavy-run.lock');
const metaPath = join(lockDir, 'owner.json');

const removeLock = () => rmSync(lockDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });

/** Is `pid` running on THIS machine? Signal 0 tests existence without delivering. */
const pidAlive = (raw) => {
  // Coerce before judging (WS-1143): owner.json is written by this script with a
  // numeric pid, but a string pid must not read as "not running" — that verdict
  // RECLAIMS the lock out from under a live owner, the direction that corrupts.
  const pid = Number(raw);
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; }
  catch (e) { return e.code === 'EPERM'; } // alive but owned by another user
};

/** Owner refreshes this often; a lock unrefreshed for STALE_MS is provably dead. */
const HEARTBEAT_MS = 30000;
const STALE_MS = 150000; // five missed beats

/**
 * Returns a reason string when the existing lock is provably dead, else null.
 * Host-gated: a pid recorded on another machine tells us nothing about this one.
 *
 * WS-1187. `hostname()` alone stopped being an identity when the fleet gained
 * cloud containers, which every one of them names `vm`. Worse, and measured in
 * this repo on 2026-09-20: a container's boot clock resets mid-session, pids
 * restart low, and pid 103 belonged BOTH to a dead 2026-09-18 session record and
 * to the live session that found it. A pid comparison across a boot boundary is
 * therefore answering about an unrelated process that happens to hold the same
 * number — in the direction that WEDGES the machine, since a recycled pid reads
 * as "owner alive" and the lock is never reclaimed.
 *
 * So the pid is trusted only within the boot that recorded it, and a lock from
 * another boot is judged by a heartbeat, which is the only evidence that travels
 * across one. Records written before this change carry no `boot` and keep the
 * old behaviour exactly — that is what the existing reclaim test pins.
 */
function staleReason() {
  if (process.env.HEAVY_LOCK_FORCE === '1') return 'HEAVY_LOCK_FORCE=1';
  let meta;
  try { meta = JSON.parse(readFileSync(metaPath, 'utf8')); }
  catch { return null; } // unreadable or mid-write: refuse rather than guess
  if (meta.machine !== hostname()) return null;

  const localBoot = bootId();
  const metaBoot = meta.boot ?? null;

  // Same boot, or no boot discriminator on either side (Windows, and every
  // pre-WS-1187 lock): the pid is in OUR process table and means what it says.
  if (metaBoot === null || localBoot === null || metaBoot === localBoot) {
    if (!pidAlive(meta.pid)) return `owner pid ${meta.pid} is not running on ${hostname()}`;
    return null;
  }

  // Same hostname, different boot. pidAlive() cannot speak to that process table.
  const beat = Date.parse(meta.heartbeatAt || meta.startedAt || '');
  if (!Number.isFinite(beat)) return null; // cannot tell: refuse rather than steal
  const ageS = Math.round((Date.now() - beat) / 1000);
  if (Date.now() - beat > STALE_MS) {
    return `owner last checked in ${ageS}s ago from a different boot (${metaBoot}); this boot is ${localBoot}`;
  }
  return null; // a live owner elsewhere — never steal a lock that is still beating
}

function acquire() {
  try { mkdirSync(lockDir); return true; }
  catch (e) { if (e.code !== 'EEXIST') throw e; }
  const reason = staleReason();
  if (reason) {
    console.error(`with-heavy-lock: reclaiming a dead lock (${reason})`);
    removeLock();
    try { mkdirSync(lockDir); return true; } catch { return false; }
  }
  return false;
}

const describeHolder = () => {
  try {
    const m = JSON.parse(readFileSync(metaPath, 'utf8'));
    return `held by pid ${m.pid} on ${m.machine} since ${m.startedAt}\n  running: ${(m.command || []).join(' ')}\n  worktree: ${m.worktree}`;
  } catch { return 'owner metadata is unreadable (the holder may be mid-write, or died before writing it)'; }
};

const deadline = Date.now() + WAIT_S * 1000;
let held = acquire();
while (!held && Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 2000));
  held = acquire();
}
if (!held) {
  console.error(`with-heavy-lock: another heavy job owns this repository's lock.\n  ${describeHolder()}`);
  console.error(`\n  Lock: ${lockDir}`);
  console.error('  It is reclaimed automatically once the owning pid exits on this machine.');
  // Through `npm test`/`npm run build` the flags after `--` belong to the CHILD, so
  // `npm test -- --wait 600` hands --wait to vitest ("Unknown option"). The env var
  // is the only form that reaches this script through npm.
  console.error('  Wait for it: HEAVY_LOCK_WAIT_SECONDS=600 npm test   (PowerShell: $env:HEAVY_LOCK_WAIT_SECONDS=600; npm test)');
  console.error('  Direct:      node kit/scripts/ops/with-heavy-lock.mjs --wait 600 -- <command>');
  console.error('  Or run a narrower target.');
  process.exit(73);
}

// ── HANDLERS FIRST. Before the metadata write, so a throw in between cannot leak. ──
let child = null;
let released = false;
const release = () => { if (!released) { released = true; try { removeLock(); } catch { /* best effort */ } } };
process.on('exit', release);

/**
 * THE LOCK IS RELEASED ONLY AFTER THE JOB IS ACTUALLY GONE.
 *
 * Measured 2026-09-18: killing the child and releasing in the same tick frees the
 * lock while the job is still alive — on this machine the child outlived the signal
 * by seconds. A waiting job then starts on top of a machine that is still saturated,
 * which is the contention the lock exists to prevent, now with two jobs instead of
 * two attempts. So a signal only ASKS the child to stop; `child.on('exit')` below is
 * the single place that releases and exits.
 *
 * A second signal is the operator insisting — honour it immediately. A child that
 * ignores the request is escalated to SIGKILL rather than holding the lock forever.
 */
let shuttingDown = false;
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT']) {
  process.on(sig, () => {
    const code = sig === 'SIGINT' ? 130 : 143;
    if (shuttingDown || !child || child.exitCode !== null) { release(); process.exit(code); }
    shuttingDown = true;
    try { child.kill(sig); } catch { /* already gone */ }
    const hard = setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* gone */ } }, 5000);
    if (typeof hard.unref === 'function') hard.unref();
  });
}
process.on('uncaughtException', (e) => { release(); console.error(`with-heavy-lock: ${e.message}`); process.exit(1); });

// Atomic metadata write: a reader never sees a half-written owner.json.
const startedAt = new Date().toISOString();
const writeMeta = () => {
  try {
    const tmp = `${metaPath}.tmp`;
    writeFileSync(tmp, JSON.stringify({
      schemaVersion: 3,
      pid: process.pid,
      machine: hostname(),
      boot: bootId(),          // null on Windows — see kit/scripts/lib/node-identity.mjs
      worktree: root,
      command,
      startedAt,
      heartbeatAt: new Date().toISOString(),
    }, null, 2));
    renameSync(tmp, metaPath);
  } catch { /* the lock still holds; metadata is a courtesy, not the mutex */ }
};
writeMeta();

// The heartbeat is what lets a lock from another boot be judged at all. Unref'd,
// so it never keeps this process alive, and it stops once release() has run so a
// shutting-down job cannot re-create the metadata it just removed.
const beat = setInterval(() => { if (!released) writeMeta(); }, HEARTBEAT_MS);
if (typeof beat.unref === 'function') beat.unref();

/**
 * ARGUMENTS ARE PASSED, NOT CONCATENATED.
 *
 * The first cut used `shell: process.platform === 'win32'`, which on Windows joins
 * the arguments with spaces and hands the result to cmd.exe unquoted. Measured
 * 2026-09-19 on the G16: `-t "some test name"` arrived as three arguments, and any
 * command whose path contains a space (`C:\Program Files\nodejs\node.exe`) did not
 * start at all — 4 of this script's own 8 tests failed there.
 *
 * So: resolve the command against PATH/PATHEXT ourselves. A real executable is
 * spawned directly with no shell. A batch file (every node_modules/.bin shim on
 * Windows is one) must go through cmd.exe, so its command line is built with
 * cmd-correct escaping — the same algorithm cross-spawn uses, inlined because a
 * transitive dependency is not a pinned one.
 */
const META = /([()\][%!^"`<>&|;, *?])/g;
function escapeCmdArg(arg, doubleEscape) {
  let a = String(arg)
    .replace(/(\\*)"/g, '$1$1\\"') // backslashes before a quote double, the quote escapes
    .replace(/(\\*)$/, '$1$1');    // trailing backslashes double before the closing quote
  a = `"${a}"`.replace(META, '^$1');
  return doubleEscape ? a.replace(META, '^$1') : a;
}

function resolveOnPath(cmd) {
  const exts = (process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD').split(';').filter(Boolean);
  const hasExt = /\.[^\\/.]+$/.test(cmd);
  const candidates = (dir) => (hasExt ? [join(dir, cmd)] : exts.map((e) => join(dir, cmd + e.toLowerCase())));
  if (/[\\/]/.test(cmd)) {
    return candidates('').map((c) => resolve(c)).find((c) => existsSync(c)) || null;
  }
  // Direct invocation (outside `npm run`) should find the repo's pinned toolchain,
  // exactly as `npm run` would — never a registry download.
  const dirs = [join(root, 'node_modules', '.bin'), ...(process.env.PATH || '').split(delimiter)];
  for (const dir of dirs.filter(Boolean)) {
    const hit = candidates(dir).find((c) => existsSync(c));
    if (hit) return hit;
  }
  return null;
}

function spawnPortable(cmd, args) {
  const opts = { stdio: 'inherit', env: process.env };
  if (process.platform !== 'win32') return spawn(cmd, args, opts);
  const resolved = resolveOnPath(cmd);
  if (resolved && /\.(exe|com)$/i.test(resolved)) return spawn(resolved, args, opts);
  // A batch file, or unresolved (let cmd.exe report "not recognized" loudly).
  const target = resolved ? normalize(resolved) : cmd;
  const doubleEscape = /node_modules[\\/]\.bin[\\/][^\\/]+\.cmd$/i.test(target);
  const line = [target.replace(META, '^$1'), ...args.map((a) => escapeCmdArg(a, doubleEscape))].join(' ');
  return spawn(process.env.comspec || 'cmd.exe', ['/d', '/s', '/c', `"${line}"`], {
    ...opts, windowsVerbatimArguments: true,
  });
}

child = spawnPortable(command[0], command.slice(1));
child.on('error', (e) => { console.error(`with-heavy-lock: failed to start: ${e.message}`); release(); process.exit(1); });
child.on('exit', (code, signal) => {
  release();
  if (signal) process.exit(signal === 'SIGINT' ? 130 : 143);
  process.exit(code ?? 1);
});
