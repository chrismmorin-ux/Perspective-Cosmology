#!/usr/bin/env node
/**
 * cwos-id-collision — did this machine mint a WS id the rest of the fleet gave
 * to something else? Report it, or (--repair) move the local items out of the
 * way so the repo can pull again.
 *
 * Issue #26. Two nodes minted WS-844..851 for different work items; the G16's
 * HomeBase could no longer pull and said nothing about it. The mechanics and
 * the reasoning live in lib/id-collision.js; INV-093 runs the same detection
 * on every verify. This file is only the command line.
 *
 * Report-only by default: a repair deletes and renames queue files, so it is
 * something a session chooses, never something a check does on its way past.
 *
 * Usage: run with --help.
 */

'use strict';

require('./lib/preflight');

const { findWorkstreamDir, findRepoRoot, makeEventEmitter } = require('./lib/cwos-utils');
const { cliGate } = require('./lib/cli');
const { detectCollisions, repairCollisions } = require('./lib/id-collision');

const emitEvent = makeEventEmitter();

const CLI = {
  name: 'cwos-id-collision',
  summary: 'find (and with --repair, fix) WS ids this checkout minted that the remote assigned to a different work item',
  flags: {
    repair: { type: 'boolean', describe: 'apply the fix: renumber colliding local items above every known id, remove local duplicates of items the remote already holds' },
    json: { type: 'boolean', describe: 'emit the result as JSON on stdout' },
    'no-fetch': { type: 'boolean', describe: 'compare against the remote-tracking ref as it stands; do not fetch first' },
  },
  notes: 'Identity is the item\'s dedup_key (title when it has none). COLLISION = same id, different work: the local item is renumbered. DUPLICATE = the remote already holds the same work, under this id or another: the remote copy survives and the local file is removed — refused if the local copy has been claimed or has left backlog. After --repair: pull, then run cwos-reconcile so queue-index.yaml is rebuilt. Exit 0 clean (or repaired), 1 collisions found (or a repair was partly refused), 2 bad command line.',
};

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);
  const wsDir = findWorkstreamDir(process.cwd());
  // State root and code root are separate questions (CLAUDE.md). The pointer
  // file repair rewrites — fleet/maintenance/findings.yaml — is written by the
  // sweeps into the checkout that owns the state, so it is resolved from there.
  const repoRoot = findRepoRoot(require('path').resolve(wsDir, '..', '..'));

  const detection = detectCollisions(wsDir, { fetch: !values['no-fetch'] });
  const found = detection.collisions.length + detection.duplicates.length;

  let repair = null;
  if (values.repair && detection.applicable && found > 0) {
    repair = repairCollisions(wsDir, { repoRoot, detection });
    for (const r of repair.renumbered) {
      emitEvent('workstream', 'ws_renumbered', { from: r.from, to: r.to, reason: 'id-collision-with-remote', ref: detection.ref });
    }
    for (const r of repair.removed) {
      emitEvent('workstream', 'ws_duplicate_removed', { id: r.id, survivor: r.survivor, reason: 'same-work-on-remote', ref: detection.ref });
    }
  }

  if (values.json) {
    process.stdout.write(JSON.stringify({ detection, repair }, null, 2) + '\n');
  } else {
    print(detection, repair);
  }

  if (!detection.applicable) return 0;
  if (repair) return repair.refused.length > 0 ? 1 : 0;
  return found > 0 ? 1 : 0;
}

function print(d, repair) {
  const say = (s) => process.stdout.write(s + '\n');
  if (!d.applicable) { say(`id-collision: not applicable — ${d.reason}`); return; }
  if (d.fetch && d.fetch.error) say(`WARNING: fetch failed (${d.fetch.error}) — comparing against a remote view that may be stale.`);
  const found = d.collisions.length + d.duplicates.length;
  if (found === 0) { say(`id-collision: clean against ${d.ref} (remote high-water WS-${d.remote_max}).`); return; }

  if (!repair) {
    say(`id-collision: ${d.collisions.length} collision(s), ${d.duplicates.length} duplicate(s) against ${d.ref}.`);
    for (const c of d.collisions) {
      say(`  COLLISION ${c.id}`);
      say(`     here:   ${c.local_title}`);
      say(`     remote: ${c.remote_title}`);
    }
    for (const x of d.duplicates) {
      say(`  DUPLICATE ${x.id} = remote ${x.survivor}${x.removable ? '' : `   [NOT auto-removable: ${x.why_not}]`}`);
      say(`     ${x.title}`);
    }
    say('');
    say('This repo cannot pull cleanly until these are moved. Fix: node kit/scripts/cwos-id-collision.js --repair');
    return;
  }

  for (const r of repair.renumbered) say(`  renumbered ${r.from} -> ${r.to}   ${r.title}`);
  for (const r of repair.removed) say(`  removed    ${r.id} (same work as remote ${r.survivor})   ${r.title}`);
  for (const r of repair.refused) say(`  REFUSED    ${r.id}: ${r.why_not}`);
  if (repair.pointers_rewritten) say(`  rewrote ${repair.pointers_rewritten} promoted_ws pointer(s) in fleet/maintenance/findings.yaml`);
  for (const m of repair.stray_mentions) say(`  NOTE: ${m.file} still mentions ${m.mentions} — after the pull that id names the REMOTE item; check which was meant`);
  say('');
  say('Next: commit, pull, then `node kit/scripts/cwos-reconcile.js` to rebuild queue-index.yaml.');
}

if (require.main === module) {
  try { process.exit(main()); }
  catch (err) { console.error(`cwos-id-collision: ${err.message}`); process.exit(2); }
}

module.exports = { CLI };
