'use strict';

/**
 * node-identity — who is this machine, really? (WS-893)
 *
 * WHY IT EXISTS. `os.hostname()` is used across the kit as "which machine", and
 * it stops being an identity the moment two machines share a name. Every Claude
 * Code cloud container reports the hostname `vm`. Every check that asks "was this
 * session record written HERE?" compared hostnames, so it passed vacuously between
 * two unrelated containers — and the question it gates is whether a pid may be
 * looked up in this process table. Observed 2026-09-26: one container classified
 * another container's LIVE session as `dead-pid` with `proof: true`, which is the
 * verdict recovery acts on with no timeout, releasing that session's claims while
 * it was still working. The WS-564 claim-theft class, between containers.
 *
 * `/proc/sys/kernel/random/boot_id` is a fresh random UUID per boot, so it
 * discriminates exactly what the hostname cannot: a different boot and — because
 * each container boots its own kernel view — a different container. It is NOT
 * `/etc/machine-id`, which is baked into the image and identical across
 * containers, the opposite of what is needed.
 *
 * Windows has no boot_id and this fleet's Windows hostnames are already unique, so
 * `bootId()` returns null there and every rule below reduces to the old hostname
 * compare by construction. This must be a no-op on the machines that were never
 * broken.
 *
 * Ported from Claude-Poker-Tracker's kit/scripts/lib/node-identity.mjs (their
 * WS-1187), which found and named the problem first.
 *
 * Never throws. A machine that cannot tell must refuse rather than guess.
 */

const fs = require('fs');
const os = require('os');

// Test seam. Production never sets it; tests use it to stand in for a Linux
// container on a Windows machine. `undefined` means "read the real value".
let override = { hostname: undefined, bootId: undefined };

function hostName() {
  if (override.hostname !== undefined) return override.hostname;
  try { return os.hostname(); } catch { return null; }
}

/** Short per-boot discriminator, or null where the platform has none. */
function bootId() {
  if (override.bootId !== undefined) return override.bootId;
  try {
    const raw = fs.readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();
    const hex = raw.replace(/-/g, '');
    return /^[0-9a-f]{32}$/i.test(hex) ? hex.slice(0, 8).toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * Hostname plus boot discriminator where one exists: `vm-180681cf`, or plain
 * `MorinComputer` on Windows. Stable for the life of a boot. Stamped on session
 * records as `node_id`, beside `host` (which stays the plain hostname every
 * display and the fleet registry match on).
 */
function nodeIdentity() {
  const host = hostName();
  if (!host) return null;
  const boot = bootId();
  return boot ? `${host}-${boot}` : host;
}

const norm = (s) => String(s).trim().toLowerCase();

/**
 * THE rule for "was this record written by the machine now reading it?"
 *
 *   no host                      -> opts.assumeLocal (a pre-WS-564 record; the
 *                                   caller may hold independent proof)
 *   host is another machine      -> false
 *   host matches, no boot_id     -> true   (Windows: today's behaviour, exactly)
 *   host matches, boot_id here   -> true only if the record's node_id is ours.
 *                                   A record with no node_id cannot be told
 *                                   apart from a sibling container's: false.
 *
 * Accepts the record itself, or a bare host string (callers that only ever had
 * the host; they get the conservative answer on a boot_id platform).
 */
function isLocalRecord(record, opts = {}) {
  const rec = (record && typeof record === 'object') ? record : { host: record };
  const recHost = rec.host == null ? '' : String(rec.host).trim();
  if (!recHost) return Boolean(opts.assumeLocal);
  const here = hostName();
  if (!here || norm(recHost) !== norm(here)) return false;
  if (!bootId()) return true;
  const recNode = rec.node_id == null ? '' : String(rec.node_id).trim();
  if (!recNode) return false;
  const mine = nodeIdentity();
  return Boolean(mine) && norm(recNode) === norm(mine);
}

/** Tests only. Pass `{}` to restore the real machine. */
function _setIdentityForTests(next = {}) {
  override = { hostname: next.hostname, bootId: next.bootId };
}

module.exports = { bootId, nodeIdentity, isLocalRecord, hostName, _setIdentityForTests };
