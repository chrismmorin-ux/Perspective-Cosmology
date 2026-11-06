#!/usr/bin/env node
/**
 * cwos-sidecar.js — decide what happens to a kit update this repo has not merged,
 * and keep the reason (WS-943).
 *
 * /kit-upgrade leaves `<file>.kit-update` beside any kit file this repo has
 * customised. This is how the repo answers it. Every answer is recorded in
 * `.cwos-sidecar-decisions.jsonl`, so "we read it and said no" stops looking the
 * same as "nobody looked" — to this repo's next session and to HomeBase.
 *
 *   list                      what is waiting, and what has been answered
 *   decline <file> --reason   keep this repo's version; remove the update
 *   defer   <file> --reason   will merge later; the update stays
 *   take    <file>            adopt the kit's version; remove the update
 *
 * Acts only on the repo it is run in. See lib/sidecar-decisions.js for why the
 * record is its own file and how a decision is tied to one version of an update.
 *
 * Usage: run with --help.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { cliGate } = require('./lib/cli');
const { sidecarStatus, decide, RECORD_FILE } = require('./lib/sidecar-decisions');
const { resolveRepoVersion } = require('./lib/kit-version');
const { makeEventEmitter } = require('./lib/cwos-utils');

const emitEvent = makeEventEmitter();

const CLI = {
  name: 'cwos-sidecar',
  summary: 'answer a kit update this repo has not merged, and record why',
  subcommands: {
    list: 'every update file waiting here, with its state; exit 1 while any is unreviewed',
    decline: '<file> --reason "<why>" — keep this repo\'s version and remove the update',
    defer: '<file> --reason "<why>" — merge later; the update stays on disk',
    take: '<file> — replace this repo\'s file with the kit\'s version and remove the update',
  },
  flags: {
    reason: { type: 'string', placeholder: 'text', describe: 'why — required for decline and defer (at least 10 characters); kept in the record' },
    'discard-mine': { type: 'boolean', describe: 'with take: overwrite this repo\'s file even though it has uncommitted changes' },
    json: { type: 'boolean', describe: 'machine-readable output' },
  },
  notes: `<file> is the customised file or its .kit-update, relative to the repo root. Decisions are appended to ${RECORD_FILE}; each answers one version of an update, so a later kit release that changes the same file asks again. Runs only against the repo it is invoked in.`,
};

// exit 0 — done / nothing unreviewed; 1 — list found unreviewed updates, or the
// decision was refused; 2 — bad command line, or not inside an adopted repo

/** The nearest directory at or above cwd that holds a .cwos-version. */
function findAdoptedRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.cwos-version'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * True unless git can vouch for the file: it must be TRACKED and unchanged.
 *
 * Two questions, because `git status --porcelain` alone answers the wrong one
 * for an ignored file — it prints nothing, which reads as "clean", and `take`
 * then overwrote a gitignored customised file with no refusal. An ignored or
 * untracked file has no committed copy to fall back on, which is exactly the
 * case the refusal exists for. No git, or not a repository: we cannot tell,
 * and "cannot tell" must not read as "safe to overwrite".
 */
function hasUncommittedChanges(repoRoot, file) {
  const tracked = spawnSync('git', ['ls-files', '--error-unmatch', '--', file], { cwd: repoRoot, encoding: 'utf8' });
  if (tracked.status !== 0) return true;
  const r = spawnSync('git', ['status', '--porcelain', '--', file], { cwd: repoRoot, encoding: 'utf8' });
  if (r.status !== 0) return true;
  return r.stdout.trim().length > 0;
}

function main() {
  const { values, positionals, sub } = cliGate(process.argv.slice(2), CLI);
  const repoRoot = findAdoptedRoot(process.cwd());
  if (!repoRoot) {
    process.stderr.write('cwos-sidecar: no .cwos-version at or above this directory — run it inside the repo whose updates you are deciding.\n');
    return 2;
  }

  if (sub === 'list') {
    const s = sidecarStatus(repoRoot);
    if (values.json) {
      process.stdout.write(JSON.stringify(s, null, 2) + '\n');
    } else {
      const c = s.counts;
      const out = [`Kit updates: ${c.unreviewed} unreviewed, ${c.deferred} deferred, ${c.declined} declined, ${c.taken} taken.`];
      for (const x of s.sidecars) {
        const why = x.reason ? ` — ${x.reason}` : x.superseded_decision ? ` — a newer update than the one ${x.superseded_decision} before` : '';
        out.push(`  [${x.state}] ${x.file}${why}`);
      }
      if (c.unreviewed) out.push('', 'Answer each unreviewed one: cwos-sidecar decline|defer <file> --reason "<why>", or cwos-sidecar take <file>.');
      process.stdout.write(out.join('\n') + '\n');
    }
    return s.counts.unreviewed > 0 ? 1 : 0;
  }

  const decision = { decline: 'declined', defer: 'deferred', take: 'taken' }[sub];
  const file = positionals[0];
  try {
    let liveUncommitted = false;
    if (decision === 'taken' && file) {
      const rel = String(file).replace(/\.kit-update$/, '');
      liveUncommitted = fs.existsSync(path.resolve(repoRoot, rel)) && hasUncommittedChanges(repoRoot, rel);
    }
    const resolved = resolveRepoVersion(repoRoot);
    const rec = decide(repoRoot, file, decision, {
      reason: values.reason,
      discardMine: Boolean(values['discard-mine']),
      liveUncommitted,
      kitVersion: resolved ? resolved.version : null,
      session: process.env.CLAUDE_SESSION_ID || null,
    });
    // The record file is the record. The event is the second trace, in the log
    // every other state change in this repo goes through.
    emitEvent('T6:workstream', 'sidecar_decided', {
      type: 'sidecar_decided', file: rec.file, decision: rec.decision, reason: rec.reason,
      kit_version: rec.kit_version, sidecar_hash: rec.sidecar_hash,
    });
    if (values.json) process.stdout.write(JSON.stringify({ ok: true, ...rec }, null, 2) + '\n');
    else process.stdout.write(`${rec.decision}: ${rec.file}${rec.reason ? ` — ${rec.reason}` : ''}\n  recorded in ${RECORD_FILE}\n`);
    return 0;
  } catch (e) {
    if (values.json) process.stdout.write(JSON.stringify({ ok: false, error: e.message }, null, 2) + '\n');
    else process.stderr.write(`cwos-sidecar: ${e.message}\n`);
    return 1;
  }
}

if (require.main === module) process.exit(main());

module.exports = { findAdoptedRoot, hasUncommittedChanges };
