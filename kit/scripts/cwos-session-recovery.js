#!/usr/bin/env node
/**
 * cwos-session-recovery — Detect and recover abandoned sessions.
 *
 * A session is abandoned when lib/session-liveness proves its process is gone
 * (a dead PID, or a heartbeat predating the last boot) — no timeout, because
 * nothing about a dead process becomes truer by waiting. Failing proof, a
 * heartbeat older than session_abandon_timeout_hours (config.yaml, default 4h)
 * is treated as suspicion and still honours that timeout.
 *
 * Until 2026-08-03 the timeout was the ONLY test, and `pid` was read off the
 * session record and thrown away. Cost: 14 dead records across four repos, one
 * of them fencing WS-567/569/574/575 with hours left on its clock.
 *
 * Recovery synthesizes handoff notes from observable state (git log, sprint
 * progress, queue changes) so no context is lost even when /session-end is
 * never run. Also releases claims and removes stale locks.
 *
 * WS-618: THE RELEASE LIST IS DERIVED FROM THE QUEUE, NOT FROM THE SESSION.
 * It used to be `session.claimed_items` — the dead session's own account of
 * what it held. A session that died is exactly the session whose self-report
 * cannot be trusted: it may have died between claiming an item and recording
 * the claim, and the SessionStart registrar (WS-533) creates the record with
 * `claimed_items: []` whether or not anything is ever claimed into it. The
 * authoritative fact lives on the other side of the relationship, in
 * `claimed_by` on the queue item.
 *
 * Measured cost of the old shape: WS-492 sat `claimed_by:
 * ses-20260815-0620-63500894` for six days while that session's record read
 * `status: abandoned, claimed_items: []`. Recovery printed "1 active
 * session(s), none abandoned" and exited 0 — a report of success from a path
 * that never looked at the queue. The item was invisible to /next the whole
 * time. Worse, an already-`abandoned` record is not in `scanActiveSessions`'s
 * output at all, so no future run would ever revisit it: the fence was
 * permanent, not merely delayed.
 *
 * The queue sweep therefore runs on EVERY invocation, including the two paths
 * that used to return early (no active sessions; active sessions but none
 * abandoned). `claimed_items` survives as a hint that is unioned in, never as
 * the authority.
 *
 * This script is the primary defense against the 2026-04-20 incident where
 * a single session ran for 12 days through 11 sprint completions and a
 * /checkpoint init run without ever being closed. See DEC-029.
 *
 * Usage: run with --help. The flag set is declared once in CLI below and
 * rendered from there, so this header cannot drift out of sync with reality
 * the way the old hand-maintained list did (it advertised a --report flag
 * that never existed).
 */

'use strict';

require('./lib/preflight');

const path = require('path');
const fs = require('fs');
const { runGit } = require('./lib/shell-safe');
const { cliGate } = require('./lib/cli');
const {
  findWorkstreamDir,
  globFiles,
  readYAMLFile,
  patchYAMLFile,
  writeFileAtomic,
  todayISO,
  withFileLock,
} = require('./lib/cwos-utils');
const { classifySession, STALE_HEARTBEAT, UNKNOWN, DEFAULT_TIMEOUT_HOURS } = require('./lib/session-liveness');

// Session-recovery is high-frequency (fires on every session-start hook);
// the liveness-stamp write at line 78 is intentionally NOT emitted —
// same rationale as cwos-heartbeat.js. Real state-change mutations
// (session mark-abandoned at line 229, lock cleanup at 234/242) DO emit.
const { makeEventEmitter } = require('./lib/cwos-utils');
const emitEvent = makeEventEmitter();

// ADR-067: the abandon timeout is session-liveness's constant — one timeout
// governs conflict-skip, steal-if-stale, and recovery alike. (Was a local 4.)

// WS-138 / FIND-067: same liveness stamp as cwos-heartbeat.js. Kept
// duplicated (rather than extracted to a shared helper) because each hook
// script needs to write this BEFORE any require-chain work that could fail —
// factoring into lib would defeat that purpose.
// Must stay in step with cwos-heartbeat.js: both scripts rewrite this file whole,
// so a field missing from EITHER list is dropped whenever the other one fires.
// WS-564 added last_heartbeat_hook_fired_at (entrypoint proof, distinct from the
// outcome stamp).
const LIVENESS_FIELDS = [
  'last_heartbeat_hook_at',
  'last_heartbeat_hook_fired_at',
  'last_session_recovery_hook_at',
];

function stampHookLiveness(wsDir, fieldName, verbose) {
  try {
    const livenessPath = path.join(wsDir, '.hooks-liveness.yaml');
    const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const values = {};
    try {
      const existing = fs.readFileSync(livenessPath, 'utf8');
      for (const f of LIVENESS_FIELDS) {
        const m = existing.match(new RegExp(`^${f}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'));
        if (m) values[f] = m[1].trim();
      }
    } catch { /* first write — no existing values */ }

    values[fieldName] = now;

    const body =
      '# Auto-maintained by cwos-heartbeat.js and cwos-session-recovery.js.\n' +
      '# Read by cwos-verify.js INV-026 to detect silently-failing hooks.\n' +
      '#\n' +
      '# *_fired_at  the script entrypoint ran. Written FIRST, so a crash between\n' +
      '#             require and the work is still visible.\n' +
      '# *_at        the work actually happened (a session heartbeat advanced).\n' +
      '#             Written last. WS-564: stamping this at entry meant a hook that\n' +
      '#             resolved nobody still certified liveness, and INV-026 read\n' +
      '#             GREEN over data that had been dead for two days.\n' +
      '#\n' +
      '# NOT stamped here: cwos-plan-surface-hook.js (PostToolUse/ExitPlanMode).\n' +
      '#             Deliberate, per WS-606. That hook emits only when some engine\n' +
      '#             accepts plan_doc; none does (corrective-plan is unregistered), so\n' +
      '#             it correctly outputs {} on every plan approval. A stamp would\n' +
      '#             certify liveness for a hook whose silence is CORRECT - the same\n' +
      '#             false-GREEN the note above records removing. What actually bit it\n' +
      '#             was a duplicate settings key deleting its registration for two\n' +
      '#             days; INV-082 guards that instead.\n' +
      LIVENESS_FIELDS
        .filter(f => values[f])
        .map(f => `${f}: "${values[f]}"`)
        .join('\n') + '\n';

    writeFileAtomic(livenessPath, body, { skipSizeGate: true });
  } catch (err) {
    if (verbose) process.stderr.write(`session-recovery: stamp write failed — ${err.message}\n`);
  }
}

// ADR-063 / WS-542: the uniform CLI contract. Declared explicitly rather than
// derived, because `--help` used to fall through to the default action — this
// script would RUN recovery when asked to explain itself.
const CLI = {
  name: 'cwos-session-recovery',
  summary: 'detect and recover abandoned sessions',
  flags: {
    auto: { type: 'boolean', describe: 'recover automatically (used by the SessionStart hook)' },
    quiet: { type: 'boolean', describe: 'silent unless recovery actually happened' },
    'dry-run': { type: 'boolean', describe: 'compute and report, but write nothing' },
    force: { type: 'boolean', describe: 'act on a stale heartbeat without waiting out the abandon timeout (never touches a session proven alive)' },
    'no-hook-stamp': { type: 'boolean', describe: 'do not stamp .hooks-liveness.yaml — for callers that are NOT the SessionStart hook (cwos-session-sweep)' },
    verbose: { type: 'boolean', describe: 'print stack traces on failure' },
    'workstream-dir': { type: 'string', placeholder: 'path', describe: 'override workstream dir discovery' },
  },
  notes: [
    'exit 0 — no recovery needed, or recovery succeeded',
    'exit 1 — in report mode (no --auto): abandoned sessions detected, OR queue items',
    '         fenced by a dead owner, OR the queue could not be read at all. The third',
    '         is not success: "found nothing" and "never looked" are different facts',
    '         and only one of them is a clean bill of health (WS-618).',
    'exit 2 — bad command line (nothing was done)',
  ].join('\n'),
};

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);
  const auto = values.auto;
  const quiet = values.quiet;
  const dryRun = values['dry-run'];
  const force = values.force;

  let wsDir;
  if (values['workstream-dir']) {
    wsDir = path.resolve(values['workstream-dir']);
  } else {
    try { wsDir = findWorkstreamDir(process.cwd()); }
    catch {
      if (!quiet) process.stderr.write('session-recovery: no workstream dir found\n');
      return 0;
    }
  }

  // WS-138 / FIND-067: stamp hook liveness at the top of main so INV-026 can
  // detect if this hook stops firing (hook-broken vs. no-sessions scenarios).
  // Best-effort — a stamp-write failure never crashes the recovery path.
  //
  // WS-228 / FAIL-007 S1: stamp acquisition is mutex-protected against
  // concurrent fires from cwos-heartbeat.js.
  //
  // --no-hook-stamp exists because the stamp means "the SessionStart hook fired
  // in THIS repo", and cwos-session-sweep is not that hook. A fleet sweep
  // spawning recovery in 17 repos every 15 minutes would stamp all 17 and hold
  // INV-026 green forever, including in repos whose hooks are dead — the exact
  // failure WS-564 fixed ("stamping this at entry meant a hook that resolved
  // nobody still certified liveness, and INV-026 read GREEN over data that had
  // been dead for two days"), reintroduced at fleet scale.
  if (!values['no-hook-stamp']) {
    const livenessLockPath = path.join(wsDir, '.hooks-liveness.yaml.lock');
    try {
      withFileLock(
        livenessLockPath,
        () => stampHookLiveness(wsDir, 'last_session_recovery_hook_at', !quiet),
        { maxWaitMs: 2000, ownerLabel: 'recovery' }
      );
    } catch (err) {
      if (!quiet) process.stderr.write(`session-recovery: stamp lock contention — ${err.message}\n`);
    }
  }

  // WS-228 / FAIL-007 S3: SessionStart hook + /session-start Step 0b can race.
  // Auto-recovery is mutex-protected so only one wins; the second exits cleanly.
  // maxWaitMs is intentionally TINY (100ms): we don't want to block; if another
  // recovery process holds the mutex, the work is already in progress — bail.
  if (auto) {
    const recoveryMutexPath = path.join(wsDir, '.session-recovery.mutex');
    try {
      return withFileLock(
        recoveryMutexPath,
        () => runRecovery(wsDir, { auto, quiet, dryRun, force }),
        { maxWaitMs: 100, ownerLabel: 'recovery-auto' }
      );
    } catch (err) {
      if (!quiet) process.stdout.write('session-recovery: another recovery instance is running — exiting cleanly.\n');
      return 0;
    }
  }
  return runRecovery(wsDir, { auto, quiet, dryRun, force });
}

// runRecovery: extracted from main() per WS-228 to allow withFileLock wrapping
// in --auto mode. Same logic that was inline in main() before; refactored only.
function runRecovery(wsDir, { auto, quiet, dryRun, force }) {

  const timeoutHours = readTimeoutHours(wsDir);
  const sessionsDir = path.join(wsDir, 'sessions');
  if (!fs.existsSync(sessionsDir)) {
    // Not "return 0" silently. With no session records, EVERY claim in the
    // queue would classify as an orphan, and acting on that reading would
    // strip the queue bare. Refuse by name instead.
    if (!quiet) process.stdout.write(`session-recovery: no sessions dir at ${sessionsDir} — nothing examined, claims NOT CHECKED.\n`);
    return 0;
  }

  // WS-618: the claim audit is computed FIRST and unconditionally, from the
  // queue. It must survive both of the early returns below, because those are
  // precisely the paths that reported success over a fenced item.
  const claimAudit = auditQueueClaims(wsDir, { timeoutHours, force });

  const active = scanActiveSessions(sessionsDir);
  if (active.length === 0) {
    return finishClaimSweep(wsDir, claimAudit, 'no active sessions', { auto, quiet, dryRun });
  }

  // No assumeLocal. "Recovery runs on the machine that holds the repo" is NOT
  // independent evidence a hostless record is local: sessions/ is a TRACKED
  // directory, so records arrive from other machines by git pull, and reading a
  // foreign pid against the local process table is how WS-564 stole claims from
  // a machine that was still working. A hostless record predates the `host`
  // field and is judged by wall-clock heartbeat alone, like any foreign record.
  // (FIND-108: the hardcoded assumeLocal here contradicted session-liveness's
  // own header and was reverted 2026-08-13.)
  const classifyOpts = { timeoutHours };

  const abandoned = [];
  for (const session of active) {
    const verdict = classifySession(session, classifyOpts);

    // Proof of death (dead pid, or a heartbeat predating boot) needs no
    // timeout and no --force: the process is gone. Waiting out a 4h timeout on
    // a corpse is what left WS-567/569/574/575 fenced on 2026-08-03.
    // Suspicion (a stale heartbeat with an unreadable pid) still honours the
    // timeout, or --force to skip it.
    // `unknown` — a foreign host, or hostless where we lack local evidence — is
    // never acted on, by --force or otherwise. The owning node's sweep does it.
    const act = verdict.proof
      || verdict.verdict === STALE_HEARTBEAT && (force || verdict.age_hours === null || verdict.age_hours > timeoutHours);

    if (act) {
      abandoned.push({ ...session, age_hours: verdict.age_hours, verdict });
    }
  }

  if (abandoned.length === 0) {
    // The WS-492 path. It used to print "none abandoned" and exit 0 without
    // ever reading the queue, while WS-492 sat fenced by a six-day-dead owner.
    return finishClaimSweep(wsDir, claimAudit, `${active.length} active session(s), none abandoned`, { auto, quiet, dryRun });
  }

  // In report-only mode, list and exit 1 so the caller can gate.
  if (!auto) {
    process.stdout.write(`session-recovery: ${abandoned.length} abandoned session(s) detected:\n`);
    for (const s of abandoned) {
      // Say WHICH evidence condemned it. The report is what the founder reads
      // before deciding to run --auto, and "0.2h stale" for a session whose
      // process is gone is the reading that made WS-351 survive.
      const evidence = s.verdict.proof
        ? `process ${s.pid != null ? s.pid : '?'} is gone`
        : (s.age_hours == null ? 'no heartbeat' : `${s.age_hours.toFixed(1)}h stale`);
      process.stdout.write(`  - ${s.id} (${evidence})\n`);
    }
    process.stdout.write(`session-recovery: ${formatClaimSummary(claimAudit)}\n`);
    writeOrphanLines(claimAudit);
    process.stdout.write('\nRun with --auto to recover, or manually close via /session-end.\n');
    return 1;
  }

  // --auto: recover each abandoned session. Each one is handed the claims the
  // QUEUE says it owns — its own claimed_items is unioned in as a hint, never
  // trusted as the list.
  const byOwner = groupOrphansByOwner(claimAudit);
  for (const session of abandoned) {
    recoverSession(wsDir, session, { dryRun, quiet, queueClaims: byOwner.get(session.id) || [] });
  }

  // Orphans whose owner was NOT in `abandoned` — the already-`abandoned`,
  // already-`completed`, and record-missing owners that no session sweep will
  // ever revisit. This is where WS-492 would have been freed.
  const remaining = claimAudit.orphans.filter(o => !abandoned.some(s => s.id === o.owner));
  const released = releaseOrphanClaims(wsDir, remaining, { dryRun });

  if (!quiet) {
    process.stdout.write(`session-recovery: recovered ${abandoned.length} abandoned session(s).\n`);
    for (const s of abandoned) {
      process.stdout.write(`  - ${s.id} → status: abandoned (${s.verdict.verdict}: ${s.verdict.reason})\n`);
    }
    process.stdout.write(`session-recovery: ${formatClaimSummary(claimAudit)}${dryRun ? ' [dry-run — nothing written]' : ''}\n`);
    for (const r of released) {
      process.stdout.write(`  - ${r.id} → claim released (owner ${r.owner}: ${r.reason})\n`);
    }
    writeUndecidableLines(claimAudit);
  }

  return 0;
}

// ─── Claim sweep plumbing (WS-618) ─────────────────────────────────────────

function groupOrphansByOwner(audit) {
  const m = new Map();
  for (const o of audit.orphans) {
    if (!m.has(o.owner)) m.set(o.owner, []);
    m.get(o.owner).push(o.id);
  }
  return m;
}

function writeOrphanLines(audit) {
  for (const o of audit.orphans) {
    process.stdout.write(`  - ${o.id} is fenced by ${o.owner} (${o.reason})\n`);
  }
  writeUndecidableLines(audit);
}

function writeUndecidableLines(audit) {
  for (const u of audit.undecidable) {
    process.stdout.write(`  - ${u.id} claimed by ${u.owner} — NOT released, undecidable from here (${u.reason})\n`);
  }
}

function releaseOrphanClaims(wsDir, orphans, { dryRun }) {
  const released = [];
  for (const o of orphans) {
    if (!fs.existsSync(o.path)) continue;
    if (!dryRun) patchYAMLFile(o.path, { claimed_by: null, claimed_at: null });
    released.push(o);
    emitEvent('T15:session-end', 'orphan-claim-released', {
      item_id: o.id,
      owner_session: o.owner,
      item_status: o.status || null,
      reason: o.reason,
      dry_run: Boolean(dryRun),
    });
  }
  return released;
}

/**
 * The exit for every path that finds no session to condemn.
 *
 * It exists because those paths used to `return 0` on a sentence about
 * sessions, having never opened the queue. The summary now always names what
 * was examined, and an orphan found here still gets released under --auto —
 * an orphan whose owner is already `abandoned` has no session sweep coming.
 */
function finishClaimSweep(wsDir, claimAudit, sessionPhrase, { auto, quiet, dryRun }) {
  const summary = `session-recovery: ${sessionPhrase}; ${formatClaimSummary(claimAudit)}`;

  if (claimAudit.orphans.length === 0) {
    if (!quiet) {
      process.stdout.write(summary + '.\n');
      writeUndecidableLines(claimAudit);
    }
    // A queue we could not read is not a clean bill of health.
    return claimAudit.queue_readable ? 0 : (auto ? 0 : 1);
  }

  if (!auto) {
    process.stdout.write(summary + ':\n');
    writeOrphanLines(claimAudit);
    process.stdout.write('\nRun with --auto to release these claims.\n');
    return 1;
  }

  const released = releaseOrphanClaims(wsDir, claimAudit.orphans, { dryRun });
  if (!quiet) {
    process.stdout.write(`${summary}${dryRun ? ' [dry-run — nothing written]' : ''}:\n`);
    for (const r of released) {
      process.stdout.write(`  - ${r.id} → claim released (owner ${r.owner}: ${r.reason})\n`);
    }
    writeUndecidableLines(claimAudit);
  }
  return 0;
}

// ─── Session Scanning ──────────────────────────────────────────────────────

function scanActiveSessions(sessionsDir) {
  const files = globFiles(sessionsDir, 'ses-*.yaml');
  const active = [];
  for (const f of files) {
    const { ok, data } = readYAMLFile(f);
    if (!ok || !data) continue;
    if (data.status === 'active') {
      active.push({
        id: data.id,
        path: f,
        started_at: data.started_at,
        last_heartbeat: data.last_heartbeat,
        // pid + host feed session-liveness. Both were previously dropped on the
        // floor here, which is why heartbeat age was the only available test.
        // pid_recorded_at is what lets it rule out post-reboot pid recycling
        // (WS-351) — without it a recycled number resurrects a dead session.
        pid: data.pid,
        pid_recorded_at: data.pid_recorded_at,
        host: data.host,
        claimed_items: Array.isArray(data.claimed_items) ? data.claimed_items : [],
        goals: Array.isArray(data.goals) ? data.goals : [],
        raw: data,
      });
    }
  }
  return active;
}

// ─── Queue-derived claims (WS-618) ─────────────────────────────────────────
//
// Everything below answers one question the old code never asked: WHICH QUEUE
// ITEMS ARE CLAIMED, AND IS THEIR OWNER STILL ALIVE? It reads the queue, not
// the session's account of itself.

/**
 * A claim on an item in one of these states is PROVENANCE, not a fence.
 *
 * Measured on this repo 2026-08-26: 137 of 187 archived items carry a
 * `claimed_by`, every one of them `status: done`. That field is the record of
 * who did the work. Clearing it would destroy history to fix nothing — a
 * terminal item is not offered by /next and cannot be contended.
 *
 * The fence is exactly the non-terminal case: reconcile's unclaimed filter is
 * `status === 'backlog' && !claimed_by`, so a live claim by a dead session
 * removes the item from every candidate list with no surface saying why.
 */
const TERMINAL_ITEM_STATUSES = new Set(['done', 'completed', 'dismissed', 'skipped', 'cancelled']);

/** Every session record on disk, keyed by id — not only the `active` ones. */
function scanAllSessionRecords(sessionsDir) {
  const byId = new Map();
  if (!fs.existsSync(sessionsDir)) return byId;
  for (const f of globFiles(sessionsDir, 'ses-*.yaml')) {
    const { ok, data } = readYAMLFile(f);
    if (!ok || !data) continue;
    const id = data.id || path.basename(f, '.yaml');
    byId.set(String(id), { id: String(id), path: f, status: String(data.status || '').toLowerCase(), record: data });
  }
  return byId;
}

/**
 * Every `claimed_by` currently written into the live queue.
 *
 * Returns `{ ok: false, reason }` when the queue cannot be read. That is a
 * REFUSAL, not an empty result: "no claims found" and "never looked" are
 * different facts and the caller prints them differently.
 *
 * Only `queue/` is scanned. `queue/archive/` holds closed work whose claims are
 * the provenance described above.
 */
function scanQueueClaims(wsDir) {
  const queueDir = path.join(wsDir, 'queue');
  if (!fs.existsSync(queueDir)) {
    return { ok: false, reason: `queue dir not found at ${queueDir}`, scanned: 0, claims: [] };
  }
  let files;
  try {
    files = globFiles(queueDir, '*.yaml');
  } catch (err) {
    return { ok: false, reason: `queue dir unreadable — ${err.message}`, scanned: 0, claims: [] };
  }

  const claims = [];
  for (const f of files) {
    // Deliberately a line regex, not a YAML parse. This is the same read
    // releaseClaimedItems performs before it writes, so detection and release
    // cannot disagree about what "claimed" means — and a single malformed item
    // must not blind the sweep to the other 486.
    let content;
    try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const owner = String((content.match(/^claimed_by:\s*(.*)$/m) || [])[1] || '')
      .trim().replace(/^["']|["']$/g, '');
    if (!owner || owner === 'null' || owner === '~') continue;
    const status = String((content.match(/^status:\s*(.*)$/m) || [])[1] || '')
      .trim().replace(/^["']|["']$/g, '').toLowerCase();
    claims.push({ id: path.basename(f, '.yaml'), path: f, owner, status });
  }
  return { ok: true, reason: null, scanned: files.length, claims };
}

/**
 * Is this claim's owner still holding it, and how do we know?
 *
 * Reuses the SAME predicate the session sweep uses, so the two cannot drift
 * into disagreeing about who is dead. Four dispositions, and the fourth is the
 * point:
 *
 *   held         owner is alive — leave it alone
 *   provenance   item is terminal — the claim is a record, not a fence
 *   orphan       owner is provably gone (or its own record says it ended)
 *   undecidable  owner is on another host with a fresh heartbeat, or the
 *                session record is unreadable. NEVER released, always named.
 *
 * `undecidable` is the shape this file already respects for sessions — UNKNOWN
 * is never acted on, by --force or otherwise, because releasing a live remote
 * session's claims is how WS-564 stole work from a machine that was still
 * running. A claim whose owner cannot be judged from here is reported, and the
 * owning node's own sweep resolves it.
 */
function classifyClaim(claim, sessionsById, opts) {
  const { timeoutHours, force, nowMs } = opts;

  if (TERMINAL_ITEM_STATUSES.has(claim.status)) {
    return { disposition: 'provenance', reason: `item status ${claim.status || '(unset)'} is terminal` };
  }

  const session = sessionsById.get(claim.owner);
  if (!session) {
    // No record at all. cwos-claims.isSessionLive calls this "dead by
    // definition" and it is the strongest orphan signal available: nothing can
    // heartbeat a record that does not exist.
    return { disposition: 'orphan', reason: `no session record for ${claim.owner}` };
  }

  if (session.status && session.status !== 'active') {
    // THE WS-492 CASE. The owner's own record says it ended. This never
    // reached the old code path, which only ever iterated `status: active`
    // records — so this class of orphan could not be recovered at any future
    // time, by any number of runs.
    return { disposition: 'orphan', reason: `owner session is ${session.status}` };
  }

  const verdict = classifySession(session.record, { timeoutHours, nowMs });
  if (verdict.verdict === UNKNOWN) {
    return { disposition: 'undecidable', reason: verdict.reason, verdict };
  }
  const act = verdict.proof
    || (verdict.verdict === STALE_HEARTBEAT
        && (force || verdict.age_hours === null || verdict.age_hours > timeoutHours));
  if (act) {
    return { disposition: 'orphan', reason: `${verdict.verdict}: ${verdict.reason}`, verdict };
  }
  return { disposition: 'held', reason: `${verdict.verdict}: ${verdict.reason}`, verdict };
}

/**
 * The whole claim picture, computed before anything is written.
 *
 * Every count it returns is a count of something actually examined, which is
 * what lets the summary line say "0 orphaned out of 487 scanned" instead of
 * the old "none abandoned" — a sentence that was true of the sessions and
 * silent about the queue.
 */
function auditQueueClaims(wsDir, opts) {
  const timeoutHours = opts && opts.timeoutHours != null ? opts.timeoutHours : DEFAULT_TIMEOUT_HOURS;
  const force = Boolean(opts && opts.force);
  const nowMs = opts && Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now();

  const scan = scanQueueClaims(wsDir);
  const sessionsById = scanAllSessionRecords(path.join(wsDir, 'sessions'));

  const out = {
    queue_readable: scan.ok,
    refusal_reason: scan.ok ? null : scan.reason,
    items_scanned: scan.scanned,
    claims_found: scan.claims.length,
    sessions_known: sessionsById.size,
    orphans: [],
    held: [],
    undecidable: [],
    provenance: [],
  };
  if (!scan.ok) return out;

  for (const claim of scan.claims) {
    const c = classifyClaim(claim, sessionsById, { timeoutHours, force, nowMs });
    out[c.disposition === 'orphan' ? 'orphans'
      : c.disposition === 'held' ? 'held'
      : c.disposition === 'undecidable' ? 'undecidable'
      : 'provenance'].push({ ...claim, reason: c.reason });
  }
  return out;
}

/** One line, and it never says "nothing" without saying what was looked at. */
function formatClaimSummary(audit) {
  if (!audit.queue_readable) {
    return `claims NOT CHECKED — ${audit.refusal_reason}`;
  }
  const parts = [`${audit.items_scanned} queue item(s) scanned`, `${audit.claims_found} claimed`];
  parts.push(`${audit.orphans.length} orphaned`);
  if (audit.undecidable.length) parts.push(`${audit.undecidable.length} undecidable (foreign host)`);
  return parts.join(', ');
}

function readTimeoutHours(wsDir) {
  const configPath = path.join(wsDir, 'config.yaml');
  if (!fs.existsSync(configPath)) return DEFAULT_TIMEOUT_HOURS;
  const { ok, data } = readYAMLFile(configPath);
  if (!ok) return DEFAULT_TIMEOUT_HOURS;
  const val = data.session_abandon_timeout_hours;
  const num = typeof val === 'number' ? val : parseFloat(val);
  return Number.isFinite(num) && num > 0 ? num : DEFAULT_TIMEOUT_HOURS;
}

function parseHeartbeatMs(session) {
  const hb = session.last_heartbeat || session.started_at;
  if (!hb) return null;
  const t = Date.parse(hb);
  return Number.isFinite(t) ? t : null;
}

// ─── Recovery ──────────────────────────────────────────────────────────────

function recoverSession(wsDir, session, opts) {
  const { dryRun, quiet } = opts;
  const repoRoot = path.resolve(wsDir, '..', '..');

  // WS-618: the union, and the queue side is the authoritative half. The
  // session's own claimed_items is kept only because it costs nothing and
  // could in principle name an item whose queue file was already rewritten.
  const queueClaims = Array.isArray(opts.queueClaims) ? opts.queueClaims : [];
  const releaseIds = Array.from(new Set([...(session.claimed_items || []), ...queueClaims]));

  // 1. Synthesize handoff notes from observable state.
  const handoff = synthesizeHandoff(wsDir, repoRoot, session, releaseIds);

  if (dryRun) {
    if (!quiet) {
      process.stdout.write(`session-recovery: [dry-run] would recover ${session.id}`
        + (releaseIds.length ? ` and release ${releaseIds.length} claim(s): ${releaseIds.join(', ')}` : '')
        + '\n');
      process.stdout.write(handoff.split('\n').map(l => '    ' + l).join('\n') + '\n');
    }
    return;
  }

  // 2. Release this session's claims back to backlog.
  const released = releaseClaimedItems(wsDir, session.id, releaseIds);
  if (!quiet && released.length) {
    for (const id of released) {
      process.stdout.write(`  - ${id} → claim released (owner ${session.id}: session recovered)\n`);
    }
  }

  // 3. Update session file: status=abandoned, ended_at=now, handoff_notes=synthesized.
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const sessionContent = fs.readFileSync(session.path, 'utf8');
  const updated = updateSessionYaml(sessionContent, {
    status: 'abandoned',
    ended_at: now,
    handoff_notes: handoff,
  });
  writeFileAtomic(session.path, updated);
  emitEvent('T15:session-end', 'session-abandoned', {
    session_id: session.id,
    path: path.relative(process.cwd(), session.path).replace(/\\/g, '/'),
    // Was 'timeout' unconditionally, back when a timeout was the only test.
    // The verdict distinguishes proof of death from mere suspicion, which is
    // exactly what someone auditing an unexpected recovery needs to see.
    // 'dead-process' vs 'timeout' is the WS-351 contract consumers grep for;
    // the module-level verdict constant (dead-pid / dead-boot) goes in detail.
    reason: session.verdict && session.verdict.proof ? 'dead-process' : 'timeout',
    detail: session.verdict ? `${session.verdict.verdict}: ${session.verdict.reason}` : null,
  });

  // 4. Remove lock file.
  const lockPath = path.join(wsDir, '.active-sessions', `${session.id}.lock`);
  if (fs.existsSync(lockPath)) {
    try { fs.unlinkSync(lockPath); } catch { /* best-effort */ }
  }

  // 5. Clear .current-session if it points at this session.
  const currentPath = path.join(wsDir, '.current-session');
  if (fs.existsSync(currentPath)) {
    const current = fs.readFileSync(currentPath, 'utf8').trim();
    if (current === session.id) {
      try { fs.unlinkSync(currentPath); } catch { /* best-effort */ }
    }
  }
}

/**
 * Hand this session's claims back so a crash cannot fence the queue forever.
 *
 * THE GUARD USED TO BE `status === 'claimed'`, WHICH NOTHING EVER WRITES (WS-564).
 * cwos-claims says so in its own header — "WHAT THIS DELIBERATELY DOES NOT DO. It
 * does not change `status`", because a new status value would flow into every
 * reducer and candidate filter. Claims live in `claimed_by` / `claimed_at`. So
 * this loop matched nothing, released nothing, and reported recovery as complete:
 * eight abandoned records in claude-poker-tracker still held WS-300, WS-276,
 * WS-307 and WS-310 after recovery had supposedly cleared them.
 *
 * Ownership is now tested where it is actually recorded, and `status` is left
 * alone — a `done` item cannot be contended, and nothing else about the item's
 * lifecycle is this function's business.
 *
 * WS-618: `claimedIds` is no longer `session.claimed_items`. The caller passes
 * the union of that hint and what the QUEUE says this session owns. This
 * function's guard was always correct; it was being handed an empty list.
 *
 * Returns the ids actually released, so the caller can report a released COUNT
 * it measured rather than the length of a list it was given.
 */
function releaseClaimedItems(wsDir, sessionId, claimedIds) {
  if (!claimedIds || claimedIds.length === 0) return [];
  const queueDir = path.join(wsDir, 'queue');
  const released = [];
  for (const id of claimedIds) {
    const itemPath = path.join(queueDir, `${id}.yaml`);
    if (!fs.existsSync(itemPath)) continue;
    // ADR-067: read-check-release under the same per-item lock the claim and
    // done paths take. Unlocked, the owner check here could read a stale
    // holder and then clear a claim a live session had just written between
    // the read and the patch.
    try {
      withFileLock(itemPath + '.lock', () => {
        const content = fs.readFileSync(itemPath, 'utf8');
        const claimedBy = (content.match(/^claimed_by:\s*(.*)$/m) || [])[1];
        const owner = String(claimedBy || '').trim().replace(/^["']|["']$/g, '');
        if (!owner || owner === 'null' || owner === '~') return;   // nothing held
        if (sessionId && owner !== sessionId) return;              // someone else's
        // `null`, not `''` — patchYAMLFile serializes '' as `claimed_by: ""`, the one
        // shape that used to read back as a REAL value, making a released item
        // permanently unclaimable. Matches cwos-claims.releaseItems, which is the
        // other release path and already wrote null. The read side no longer cares
        // (isUnsetYAMLScalar accepts both), but a release should not leave behind a
        // shape whose emptiness is only legible to one parser.
        patchYAMLFile(itemPath, { claimed_by: null, claimed_at: null });
        // WS-618: report what was actually freed. The claim sweep's whole point
        // is that 'released nothing' and 'nothing to release' must not print the
        // same line, so the release has to say which ids it took.
        released.push(id);
      }, { ownerLabel: 'recovery:release', maxWaitMs: 5000 });
    } catch { /* non-fatal: an unreleased claim self-heals via steal-if-stale */ }
  }
  return released;
}

function updateSessionYaml(content, patches) {
  // Patch simple scalars first.
  for (const [key, value] of Object.entries(patches)) {
    if (key === 'handoff_notes') continue; // block scalar — handled separately
    const regex = new RegExp(`^(${key}:\\s*).*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `$1${formatScalar(value)}`);
    } else {
      // Append if missing
      content = content.trimEnd() + `\n${key}: ${formatScalar(value)}\n`;
    }
  }

  // Replace or append handoff_notes block scalar.
  //
  // WS-476: this used to be a multiline regex whose quantifier contained an
  // EMPTY alternation — /(?:(?:[ \t]+.*|)\n?)+?/ — which is catastrophic
  // backtracking by construction, and whose terminator used \Z, which JS does
  // not support (it matches a literal 'Z'). On any session file that already
  // carried a handoff_notes block, .test() never returned: three independent
  // --auto instances hung at 100% CPU on the FIRST such file, so recovery
  // never recovered anything, while report mode and --dry-run (which skip this
  // function) looked healthy. Replaced with a linear line scan: a block scalar
  // ends at the first line that is neither blank nor indented.
  if ('handoff_notes' in patches) {
    const indented = patches.handoff_notes
      .split('\n')
      .map(l => l.length > 0 ? '  ' + l : l)
      .join('\n');
    const blockLiteral = `handoff_notes: |\n${indented}`;

    const lines = content.split('\n');
    const startIdx = lines.findIndex(l => /^handoff_notes:/.test(l));
    if (startIdx === -1) {
      content = content.trimEnd() + `\n${blockLiteral}\n`;
    } else {
      let end = startIdx + 1;
      if (/^handoff_notes:\s*[|>]/.test(lines[startIdx])) {
        // Block scalar: consume following indented-or-blank lines...
        while (end < lines.length && (lines[end] === '' || /^[ \t]/.test(lines[end]))) end++;
        // ...but trailing blank lines belong to the document, not the block.
        while (end > startIdx + 1 && lines[end - 1] === '') end--;
      }
      // (Single-line handoff_notes: end stays at startIdx + 1 — replace one line.)
      lines.splice(startIdx, end - startIdx, ...blockLiteral.split('\n'));
      content = lines.join('\n');
    }
  }

  return content;
}

function formatScalar(value) {
  if (value === null || value === undefined) return '""';
  if (typeof value === 'string') {
    if (value === '' || /^[\d\-+]/.test(value) || /[:#@,\[\]{}|>*&!%'"\\]/.test(value)) {
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return `"${value}"`;
  }
  return String(value);
}

// ─── Handoff Synthesis ─────────────────────────────────────────────────────

function synthesizeHandoff(wsDir, repoRoot, session, releaseIds) {
  const lines = [];
  lines.push(`Session auto-recovered by cwos-session-recovery on ${todayISO()}.`);
  lines.push(`Original start: ${session.started_at || 'unknown'}.`);
  lines.push(`Last heartbeat: ${session.last_heartbeat || 'never'}.`);
  lines.push('');

  if (session.goals && session.goals.length > 0) {
    lines.push('Original goals:');
    for (const g of session.goals) lines.push(`  - ${g}`);
    lines.push('');
  }

  // Sprints completed since session started.
  const sprints = summarizeSprintsSince(wsDir, session.started_at);
  if (sprints.length > 0) {
    lines.push(`Sprints completed during this session (${sprints.length}):`);
    for (const s of sprints) lines.push(`  - ${s.id}: ${s.title}`);
    lines.push('');
  }

  // Git commits since session started.
  const commits = gitCommitsSince(repoRoot, session.started_at);
  if (commits.length > 0) {
    lines.push(`Git commits during this session (${commits.length}):`);
    for (const c of commits.slice(0, 20)) lines.push(`  - ${c}`);
    if (commits.length > 20) lines.push(`  - ... and ${commits.length - 20} more`);
    lines.push('');
  }

  // WS-618: counted from the union the caller is about to release, not from
  // `session.claimed_items`. Reporting the self-report here would have written
  // "Released 0 claimed work item(s)" into the handoff of a session that was
  // in fact fencing one — a false statement in the permanent record.
  const toRelease = Array.isArray(releaseIds) ? releaseIds : (session.claimed_items || []);
  if (toRelease.length > 0) {
    lines.push(`Released ${toRelease.length} claimed work item(s) back to backlog: ${toRelease.join(', ')}.`);
    const hint = Array.isArray(session.claimed_items) ? session.claimed_items : [];
    const queueOnly = toRelease.filter(id => !hint.includes(id));
    if (queueOnly.length > 0) {
      lines.push(`  ${queueOnly.length} of these were found on the QUEUE, not in this session's own`);
      lines.push('  claimed_items — the record was incomplete (WS-618).');
    }
    lines.push('');
  }

  lines.push('RECOVERY NOTES:');
  lines.push('  - system/state.md may be stale — next /session-start should flag it.');
  lines.push('  - Any decisions made during this session should be verified against system/decisions.md.');
  lines.push('  - Any plan docs authored may have WS items not yet promoted to the queue.');
  lines.push('    Run node kit/scripts/cwos-plan-scan.js to check.');

  return lines.join('\n');
}

function summarizeSprintsSince(wsDir, startedAt) {
  if (!startedAt) return [];
  const sprintsDir = path.join(wsDir, 'sprints');
  if (!fs.existsSync(sprintsDir)) return [];

  const startedMs = Date.parse(startedAt);
  if (!Number.isFinite(startedMs)) return [];

  const results = [];
  const dirs = [sprintsDir, path.join(sprintsDir, 'archive')];
  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    const files = globFiles(d, 'SPR-*.yaml');
    for (const f of files) {
      const { ok, data } = readYAMLFile(f);
      if (!ok || !data) continue;
      if (data.status !== 'completed' && data.status !== 'abandoned') continue;
      const completedAt = data.completed_at || data.created_at;
      const completedMs = Date.parse(completedAt);
      if (Number.isFinite(completedMs) && completedMs >= startedMs) {
        results.push({ id: data.id, title: data.title || '(untitled)' });
      }
    }
  }
  return results.sort((a, b) => a.id.localeCompare(b.id));
}

function gitCommitsSince(repoRoot, startedAt) {
  if (!startedAt) return [];
  try {
    const since = startedAt.replace('T', ' ').replace('Z', '');
    const r = runGit(['log', '--since', since, '--pretty=format:%h %s', '-n', '100'], {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    if (!r.ok) return [];
    return String(r.stdout).split('\n').map(l => l.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

// WS-277: expose pure helpers for cwos-frame.js consumption without firing
// the CLI's main(). When require()'d as a module, main() is skipped and the
// exports below are usable. CLI behavior unchanged when invoked directly.
if (require.main === module && process.env.CWOS_SESSION_RECOVERY_NORUN !== '1') {
  try {
    process.exit(main());
  } catch (err) {
    process.stderr.write(`session-recovery: fatal — ${err.message}\n`);
    if (process.argv.includes('--verbose')) process.stderr.write(err.stack + '\n');
    process.exit(2);
  }
}

/**
 * isSessionHealthy(wsDir, [opts]) — pure check used by cwos-frame.js to
 * populate the contract's `readiness` field. Returns:
 *   { healthy: bool, stale_session_ids: [], reason: string|null }
 *
 * "Healthy" = no active session has a heartbeat older than the configured
 * timeout. If any active session is stale, returns healthy:false and lists
 * the stale ids so the caller can surface them to the founder.
 *
 * Pure read — no state mutations, no event emission, no recovery action.
 * For actual recovery, callers run `cwos-session-recovery --auto` directly.
 *
 * Replay-purity: pass `now` (ms-epoch) to override Date.now() for tests.
 */
function isSessionHealthy(wsDir, opts) {
  const now = (opts && typeof opts.now === 'number') ? opts.now : Date.now();
  const timeoutHours = readTimeoutHours(wsDir);
  const timeoutMs = timeoutHours * 60 * 60 * 1000;
  const sessionsDir = path.join(wsDir, 'sessions');
  if (!fs.existsSync(sessionsDir)) {
    return { healthy: true, stale_session_ids: [], reason: null };
  }
  const active = scanActiveSessions(sessionsDir);
  const stale = [];
  for (const s of active) {
    const hb = parseHeartbeatMs(s);
    if (hb === null) {
      // No parseable heartbeat — treat as stale (no signal == max stale)
      stale.push(s.id);
      continue;
    }
    if (now - hb > timeoutMs) stale.push(s.id);
  }
  if (stale.length === 0) {
    return { healthy: true, stale_session_ids: [], reason: null };
  }
  return {
    healthy: false,
    stale_session_ids: stale,
    reason: `${stale.length} active session(s) past ${timeoutHours}h heartbeat timeout: ${stale.join(', ')}. Run /session-end or cwos-session-recovery --auto to clear.`,
  };
}

module.exports = {
  isSessionHealthy,
  scanActiveSessions,
  scanAllSessionRecords,
  scanQueueClaims,
  classifyClaim,
  auditQueueClaims,
  formatClaimSummary,
  releaseClaimedItems,
  releaseOrphanClaims,
  readTimeoutHours,
  parseHeartbeatMs,
  TERMINAL_ITEM_STATUSES,
};
