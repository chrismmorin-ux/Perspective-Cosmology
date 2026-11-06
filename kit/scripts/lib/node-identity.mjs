/**
 * node-identity.mjs — who is this machine, really?
 *
 * WHY IT EXISTS. `os.hostname()` is used across this repo as "which machine",
 * and it stops being an identity the moment two machines share a name. Measured
 * 2026-09-20: every Claude Code cloud container reports the hostname `vm`, and
 * 23 session records in `.claude/workstream/sessions/` carry it. A gate written
 * as `record.machine !== hostname()` therefore passes vacuously between two
 * unrelated containers, and whatever it was protecting — a pid check, an uptime
 * comparison, a lock — is being decided against the wrong machine's facts.
 *
 * `/proc/sys/kernel/random/boot_id` is a fresh random UUID per boot, so it
 * discriminates exactly what the hostname cannot: a different boot, and (because
 * each container boots its own kernel view) a different container. It is NOT
 * `/etc/machine-id`, which is baked into the image and identical across
 * containers — the opposite of what is needed here.
 *
 * Windows has no boot_id and its hostnames are already fleet-unique, so
 * `bootId()` returns null there and every caller reduces to today's behaviour by
 * construction. That is deliberate: this must be a no-op on the two machines
 * that were never broken.
 *
 * Never throws. An unreadable boot_id yields null, and a caller that cannot tell
 * must refuse rather than guess — see `.claude/rules/provenance-or-refuse.md`.
 */

import { readFileSync } from 'node:fs';
import { hostname } from 'node:os';

/** Short per-boot discriminator, or null where the platform has none. */
export function bootId() {
  try {
    const raw = readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();
    const hex = raw.replace(/-/g, '');
    return /^[0-9a-f]{32}$/i.test(hex) ? hex.slice(0, 8) : null;
  } catch {
    return null;
  }
}

/**
 * Hostname plus boot discriminator where one exists: `vm-180681cf`, or plain
 * `MorinComputer` on Windows. Stable for the life of a boot.
 */
export function nodeIdentity() {
  const host = hostname();
  const boot = bootId();
  return boot ? `${host}-${boot}` : host;
}
