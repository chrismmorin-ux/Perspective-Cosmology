#!/usr/bin/env node
/**
 * cwos-lease-check — a session that resumes after a long wait re-checks its
 * claims before it builds (WS-1073).
 *
 * THE INCIDENT. 2026-10-09 18:00Z a session picked up SPR-241 and put its plan
 * up for approval. The plan waited ~23h in plan mode. Nothing beats while a
 * session waits — no turn ends — so after 4h its claims read as dead, a second
 * session adopted the sprint as orphaned and built WS-943, and the first
 * session was then approved and went straight to building the same plan. It
 * was caught only because `git log` happened to be its first command.
 *
 * Three holes, three mechanisms (founder direction: "a check-in", by hook, not
 * by instruction text):
 *
 *   1. A waiting session read as dead. `pre` on ExitPlanMode / AskUserQuestion
 *      stamps `waiting_on_founder` into the per-node liveness sidecar;
 *      session-liveness.activeWait() then holds the claims for 72h
 *      (WAITING_HOLD_HOURS, founder decision 2026-10-12) instead of 4h.
 *   2. Nothing re-checked the claim on resume. `post` on the same tools (it
 *      fires when the plan is approved or the question answered) and `pre` on
 *      the first write after a wait or after IDLE_MINUTES without a beat
 *      re-read every item this session holds. An item another session now
 *      holds, or that closed while this one waited, is a LOST LEASE.
 *   3. The adopter was not told. cwos-claims.waitingNote() puts "waiting on
 *      the founder (plan pending since …)" into every claim-conflict message.
 *
 * A LOST LEASE IS A HARD STOP (founder decision 2026-10-12). It is recorded in
 * the sidecar, and every Write / Edit / NotebookEdit — and every Bash command
 * outside a short read-only and workstream allowlist — is refused (exit 2) with
 * a plain line naming who holds the item, until the session runs `ack`. A
 * warning would rely on the session heeding prose, which is the tier that
 * failed.
 *
 * A claim that was merely RELEASED (recovery cleared it, nobody took it) is
 * not lost: nobody else is building it, so it is re-claimed silently.
 *
 * Every failure inside the hook fails OPEN (exit 0). A broken lease check must
 * never stop a session that holds its claims; the hold is the safety, the
 * block is the alarm.
 *
 * Hook wiring (install-claude-hooks.mjs):
 *   PreToolUse  ExitPlanMode|AskUserQuestion|Write|Edit|NotebookEdit|Bash → pre
 *   PostToolUse ExitPlanMode|AskUserQuestion                              → post
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { cliGate } = require('./lib/cli');
const { findWorkstreamDir, makeEventEmitter } = require('./lib/cwos-utils');
const claims = require('./lib/cwos-claims');
const { readLiveness, writeLiveness, loadSession } = require('./lib/session-record');

const emitEvent = makeEventEmitter();

const CLI = {
  name: 'cwos-lease-check',
  summary: 'Re-check this session\'s claims after a long wait; refuse writes on a lost lease (WS-1073)',
  usage: 'cwos-lease-check <pre|post|check|ack> [options]',
  subcommands: {
    pre: 'PreToolUse hook: stamp a founder wait, or re-check claims before a write',
    post: 'PostToolUse hook: re-check claims the moment a plan is approved / a question answered',
    check: 'run the re-check now and print the verdict as JSON',
    ack: 'acknowledge a lost lease: drop the lost items and lift the write stop',
  },
  flags: {
    'workstream-dir': { type: 'string', placeholder: 'path', describe: 'workstream dir (default: resolved from cwd)' },
    'session-id': { type: 'string', placeholder: 'id', describe: 'harness session id (default: env / hook stdin)' },
  },
  notes: 'Hook subcommands read the hook payload on stdin and fail open on any internal error.',
};

/** Tools during which the session waits on the founder. */
const WAIT_TOOLS = new Set(['ExitPlanMode', 'AskUserQuestion']);
/** Tools that change the tree and are refused on a lost lease. */
const WRITE_TOOLS = new Set(['Write', 'Edit', 'NotebookEdit', 'MultiEdit']);
/** A gap without a heartbeat this long is a resume, even with no wait stamped. */
const IDLE_MINUTES = 30;
const CLOSED = new Set(['done', 'dismissed', 'closed', 'cancelled', 'canceled', 'wontfix', 'superseded']);

// Bash a session with a lost lease may still run: reading, and the workstream
// tools it needs to hand the item back. Anchored at the start of the command.
const BASH_ALLOW = /^\s*(?:(?:cd\s+\S+\s*&&\s*)?(?:git\s+(?:status|log|diff|show|fetch|branch|rev-parse)\b|cat\b|ls\b|head\b|tail\b|grep\b|rg\b|wc\b|pwd\b|echo\b|node\s+\S*kit\/scripts\/(?:cwos-lease-check|cwos-next|cwos-workstream|cwos-item|cwos-status|cwos-pulse)\.js\b))/;

const ms = (iso) => { const t = Date.parse(String(iso || '').replace(/^"|"$/g, '')); return Number.isFinite(t) ? t : NaN; };

/**
 * The items this session should be holding: what the queue says it holds now,
 * the items it held when it started waiting, and the set the last good check
 * confirmed. Recovery can clear the queue claim; the other two survive that.
 * releaseItems() removes an item from the last two when this session lets go,
 * so a deliberate release is never later read as a theft. (Not the session
 * record's claimed_items: that mirror only ever grows.)
 */
function queueClaimsOf(wsDir, sessionId) {
  const out = [];
  for (const id of claims.listQueueIds(wsDir)) {
    const c = claims.readClaim(path.join(wsDir, 'queue', `${id}.yaml`));
    if (c && c.claimedBy === sessionId && !CLOSED.has(String(c.status || '').toLowerCase())) out.push(id);
  }
  return out;
}

function heldItems(wsDir, sessionId, side) {
  const set = new Set(queueClaimsOf(wsDir, sessionId));
  for (const src of [side.waiting_on_founder && side.waiting_on_founder.items, side.lease_items]) {
    if (Array.isArray(src)) for (const id of src) if (id) set.add(String(id));
  }
  return [...set];
}

/**
 * Re-read every held item. Pure apart from the silent re-claim of a released
 * item. @returns {{held:string[], lost:Array<{id,reason,holder}>, reclaimed:string[]}}
 */
function recheck(wsDir, sessionId, opts = {}) {
  const side = opts.side || readLiveness(wsDir, sessionId);
  const held = [];
  const lost = [];
  const released = [];
  for (const id of heldItems(wsDir, sessionId, side)) {
    const claim = claims.readClaim(path.join(wsDir, 'queue', `${id}.yaml`));
    if (!claim) continue; // item file gone — nothing to protect
    const closed = CLOSED.has(String(claim.status || '').toLowerCase());
    if (claim.claimedBy && claim.claimedBy !== sessionId) {
      lost.push({
        id, holder: claim.claimedBy,
        reason: closed
          ? `taken over and closed by ${claim.claimedBy}`
          : `taken over by ${claim.claimedBy}${claim.claimedAt ? ` at ${claim.claimedAt}` : ''}`,
      });
    } else if (closed && !claim.claimedBy) {
      // Closing releases the claim and records who let go (releaseItems).
      // Ours = finished work. Another session's = it adopted and closed it.
      // No record (an older closer) is not evidence of anything: fail open.
      if (claim.releasedBy && claim.releasedBy !== sessionId) {
        lost.push({ id, holder: claim.releasedBy, reason: `taken over and closed by ${claim.releasedBy}` });
      }
    } else if (closed) {
      continue; // closed under our own claim: finished, not lost
    } else if (!claim.claimedBy) {
      // Released by this session on purpose (skip, defer, cancel): let it go.
      // Released by recovery or another session's release: nobody is building
      // it, so take it back.
      if (claim.releasedBy !== sessionId) released.push(id);
    } else {
      held.push(id);
    }
  }
  let reclaimed = [];
  if (released.length && !opts.dryRun) {
    try { reclaimed = claims.claimItems(wsDir, sessionId, released, null, { now: opts.now }); } catch { reclaimed = []; }
  }
  return { held: [...held, ...reclaimed], lost, reclaimed };
}

function stopMessage(lostList, waitedFor) {
  const lines = lostList.map((l) => `  - ${l.id}: ${l.reason}`);
  return [
    `LEASE LOST — stop building.${waitedFor ? ` While this session waited (${waitedFor}),` : ''} work it claimed changed hands:`,
    ...lines,
    'Do not write to these items. Tell the founder in one line what happened, then run',
    '  node kit/scripts/cwos-lease-check.js ack',
    'to drop them and carry on with anything else (WS-1073).',
  ].join('\n');
}

function fmtAge(minutes) {
  if (!Number.isFinite(minutes)) return null;
  return minutes >= 90 ? `${(minutes / 60).toFixed(1)}h` : `${Math.round(minutes)} min`;
}

/**
 * Decide what the hook does. Separated from I/O so the 2026-10-10 sequence is
 * testable with an injected clock.
 *
 * @returns {{action:'allow'|'block', message?:string, lost?:Array}}
 */
function decide(wsDir, sessionId, event, toolName, toolInput = {}, opts = {}) {
  const now = opts.now || Date.now();
  const iso = new Date(now).toISOString();
  const side = readLiveness(wsDir, sessionId);

  // An unacknowledged lost lease keeps refusing writes.
  if (event === 'pre' && side.lease_lost && Array.isArray(side.lease_lost.items) && side.lease_lost.items.length) {
    if (WAIT_TOOLS.has(toolName)) return { action: 'allow' };
    if (toolName === 'Bash' && BASH_ALLOW.test(String(toolInput.command || ''))) return { action: 'allow' };
    if (toolName === 'Bash' || WRITE_TOOLS.has(toolName)) {
      return { action: 'block', message: stopMessage(side.lease_lost.items, null), lost: side.lease_lost.items };
    }
    return { action: 'allow' };
  }

  // Going into a wait: stamp it, with the items held right now.
  if (event === 'pre' && WAIT_TOOLS.has(toolName)) {
    const items = heldItems(wsDir, sessionId, side);
    writeLiveness(wsDir, sessionId, {
      waiting_on_founder: { since: iso, kind: toolName === 'AskUserQuestion' ? 'question' : 'plan', items },
      last_heartbeat: iso,
    }, { ownerLabel: 'lease-check:wait' });
    return { action: 'allow' };
  }

  // First write of a session that has never been checked: record what it
  // holds now, so a later idle-gap check has a baseline to compare against.
  if (event === 'pre' && !Array.isArray(side.lease_items) && (toolName === 'Bash' || WRITE_TOOLS.has(toolName))) {
    side.lease_items = queueClaimsOf(wsDir, sessionId);
    writeLiveness(wsDir, sessionId, { lease_items: side.lease_items }, { ownerLabel: 'lease-check:seed' });
  }

  // Is this a resume? Coming back from a stamped wait, or the first write
  // after IDLE_MINUTES with no beat and no check.
  const wait = side.waiting_on_founder && side.waiting_on_founder.since ? side.waiting_on_founder : null;
  let resume = false;
  let waitedFor = null;
  if (event === 'post' && WAIT_TOOLS.has(toolName)) {
    resume = true;
    if (wait) waitedFor = fmtAge((now - ms(wait.since)) / 60000);
  } else if (event === 'pre' && (toolName === 'Bash' || WRITE_TOOLS.has(toolName))) {
    if (wait) {
      resume = true;
      waitedFor = fmtAge((now - ms(wait.since)) / 60000);
    } else {
      const doc = loadSession(wsDir, sessionId) || {};
      const last = Math.max(...[doc.last_heartbeat, side.last_heartbeat, side.lease_checked_at].map(ms).filter(Number.isFinite), -Infinity);
      const idle = Number.isFinite(last) ? (now - last) / 60000 : Infinity;
      if (idle >= IDLE_MINUTES && Number.isFinite(idle)) { resume = true; waitedFor = fmtAge(idle); }
    }
  }
  if (!resume) return { action: 'allow' };

  const r = recheck(wsDir, sessionId, { side, now });
  const patch = {
    waiting_on_founder: null,
    lease_checked_at: iso,
    last_heartbeat: iso,
    lease_items: r.held,
  };
  if (r.lost.length) patch.lease_lost = { at: iso, items: r.lost };
  writeLiveness(wsDir, sessionId, patch, { ownerLabel: 'lease-check:resume' });
  if (r.lost.length && !opts.noEvents) {
    try {
      emitEvent('T6:workstream-rebalance', 'cwos-lease-check', {
        type: 'lease_lost', session: sessionId, items: r.lost, waited_for: waitedFor, trigger: `${event}:${toolName}`, at: iso,
      });
    } catch { /* the stop stands without its event */ }
  }
  if (!r.lost.length) return { action: 'allow', reclaimed: r.reclaimed };
  return { action: 'block', message: stopMessage(r.lost, waitedFor), lost: r.lost };
}

/** Drop the lost items from tracking and lift the stop. */
function ack(wsDir, sessionId, opts = {}) {
  const side = readLiveness(wsDir, sessionId);
  const lost = (side.lease_lost && side.lease_lost.items) || [];
  const lostIds = new Set(lost.map((l) => l.id));
  const keep = (Array.isArray(side.lease_items) ? side.lease_items : []).filter((id) => !lostIds.has(id));
  writeLiveness(wsDir, sessionId, {
    lease_lost: null,
    lease_items: keep,
    lease_acked: { at: new Date(opts.now || Date.now()).toISOString(), items: [...lostIds] },
  }, { ownerLabel: 'lease-check:ack' });
  return { acknowledged: [...lostIds], still_held: keep };
}

function readPayload() {
  if (process.stdin.isTTY) return {};
  try {
    const raw = fs.readFileSync(0, 'utf8');
    return raw && raw.trim() ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function main() {
  const { values, sub } = cliGate(process.argv.slice(2), CLI);
  if (!sub) { process.stderr.write('cwos-lease-check: choose pre, post, check or ack (see --help)\n'); process.exit(2); }

  const hook = sub === 'pre' || sub === 'post';
  try {
    const payload = hook ? readPayload() : {};
    const wsDir = values['workstream-dir'] ? path.resolve(values['workstream-dir']) : findWorkstreamDir();
    if (!wsDir || !fs.existsSync(path.join(wsDir, 'queue'))) process.exit(0);
    const agentId = values['session-id'] || payload.session_id || null;
    // NO RECORD, NO LEASE (WS-1140). Claims are only ever written under a
    // session record (claimItems resolves or mints one), so a session with no
    // record holds nothing that can be lost: allowing it is the correct
    // verdict, not a fail-open. But in an adopted repo where SessionStart's
    // cwos-session-register did not run (measured in ServeYourNote 2026-10-15:
    // its sessions never resolved a record), the commit guard then has no
    // identity and refuses every stash and tree-wide stage for the whole
    // session. So `pre` — the earliest hook, firing before the first write —
    // registers the session under the harness's own id, the same minimal
    // record cwos-item and cwos-next mint on first use. Its start time is now:
    // nothing already in the tree becomes this session's by being registered
    // late. Only `pre` mints, so the parallel Bash hooks cannot mint twice.
    const sessionId = claims.resolveSessionId(wsDir, { create: false, agentId })
      || (sub === 'pre' && payload.session_id
        ? claims.resolveSessionId(wsDir, { create: true, agentId, pointer: false })
        : null);
    if (!sessionId) {
      if (!hook) process.stdout.write(JSON.stringify({ session: null, note: 'no session record resolved' }) + '\n');
      process.exit(0);
    }

    if (sub === 'ack') {
      process.stdout.write(JSON.stringify({ session: sessionId, ...ack(wsDir, sessionId) }, null, 2) + '\n');
      process.exit(0);
    }
    if (sub === 'check') {
      const r = recheck(wsDir, sessionId, { dryRun: true });
      process.stdout.write(JSON.stringify({ session: sessionId, ...r }, null, 2) + '\n');
      process.exit(r.lost.length ? 1 : 0);
    }

    const verdict = decide(wsDir, sessionId, sub, payload.tool_name || '', payload.tool_input || {});
    if (verdict.action === 'block') {
      process.stderr.write(verdict.message + '\n');
      process.exit(2);
    }
    process.exit(0);
  } catch (e) {
    if (!hook) { process.stderr.write(`cwos-lease-check: ${e.message}\n`); process.exit(1); }
    process.exit(0); // fail open
  }
}

module.exports = { decide, recheck, ack, heldItems, IDLE_MINUTES, BASH_ALLOW };

if (require.main === module) main();
