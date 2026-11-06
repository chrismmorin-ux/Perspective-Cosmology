/**
 * lib/sidecar-decisions.js — the record of kit updates a repo reviewed and
 * declined, with the reason (WS-943).
 *
 * WHY. When /kit-upgrade meets a kit file the repo has customised, it leaves
 * the new version beside it as `<file>.kit-update` for a deliberate merge. Until
 * now the only ways to resolve one were to merge it or delete it, and neither
 * left a trace: a repo that had read the update and said "no, ours stays" was
 * indistinguishable, from HomeBase and from its own next session, from a repo
 * that had never looked. 392 of them had piled up across 13 repos.
 *
 * THE RECORD is `.cwos-sidecar-decisions.jsonl` at the repo root: one JSON line
 * per decision, append-only. It is deliberately NOT a field in `.cwos-version`:
 *
 *   - `.cwos-version` is the kit's stamp. cwos-migrate rebuilds it from scratch
 *     on every upgrade and drops any field not hard-coded into the rebuild
 *     (WS-881 lost corpus_version exactly that way). A decision stored there
 *     survives until the next upgrade — the moment it is needed.
 *   - A decline-with-reason is the repo's own book. It belongs in a repo-owned
 *     file that upgrades never touch, and a root `.cwos-*` file is already
 *     carried to git by cwos-state-autocommit.
 *
 * THREE DECISIONS
 *   declined  the repo keeps its own version. Reason required. The update file
 *             is removed.
 *   deferred  the repo will merge it later. Reason required. The update file
 *             stays.
 *   taken     the repo adopted the kit's version. The update file is removed.
 *
 * A decision is keyed on the HASH of the update file it answered, so it
 * answers that bulletin and no other: when a later kit release changes the same
 * file, the new update has a new hash and reads as unreviewed again. The same
 * update re-created by a later upgrade keeps its answer.
 *
 * A REPO DECIDES FOR ITSELF. Everything here acts on the repo it is run in.
 * HomeBase reads the record (sidecarStatus); it never writes one into another
 * repo (DEC-054).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SIDECAR_SUFFIX = '.kit-update';
const RECORD_FILE = '.cwos-sidecar-decisions.jsonl';
const DECISIONS = ['declined', 'deferred', 'taken'];
const MIN_REASON = 10;

// .cwos-snapshots holds rollback material, not open questions. .claude/worktrees
// holds whole extra checkouts of the repo: counting their copies reported
// deckside as 414 outstanding updates when 23 were real.
const PRUNE_NAMES = new Set(['.git', 'node_modules', '.cwos-snapshots']);

function walkSidecars(root) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (PRUNE_NAMES.has(e.name)) continue;
        if (e.name === 'worktrees' && path.basename(dir) === '.claude') continue;
        stack.push(path.join(dir, e.name));
      } else if (e.isFile() && e.name.endsWith(SIDECAR_SUFFIX)) {
        out.push(path.join(dir, e.name));
      }
    }
  }
  return out.sort();
}

function hashFile(abs) {
  return 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
}

const toRel = (repoRoot, abs) => path.relative(repoRoot, abs).split(path.sep).join('/');

/** Every recorded decision, oldest first. A torn line is skipped, never fatal. */
function readDecisions(repoRoot) {
  const p = path.join(repoRoot, RECORD_FILE);
  if (!fs.existsSync(p)) return [];
  const out = [];
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try {
      const o = JSON.parse(t);
      if (o && typeof o.file === 'string' && DECISIONS.includes(o.decision)) out.push(o);
    } catch { /* torn line */ }
  }
  return out;
}

/** The newest decision per file. */
function latestByFile(decisions) {
  const m = new Map();
  for (const d of decisions) m.set(d.file, d);
  return m;
}

/**
 * Where a repo stands: every update file on disk with its state, and the counts
 * HomeBase reads.
 *
 *   unreviewed  on disk, and no decision answers THIS version of it
 *   deferred    on disk, deliberately, with a reason
 *   declined    files whose newest decision is a decline (the update file is
 *               normally gone; if an upgrade re-created the same one, it is
 *               still answered and is listed as declined, not unreviewed)
 *   taken       files whose newest decision is a take
 */
function sidecarStatus(repoRoot) {
  const latest = latestByFile(readDecisions(repoRoot));
  const sidecars = [];
  for (const abs of walkSidecars(repoRoot)) {
    const file = toRel(repoRoot, abs.slice(0, -SIDECAR_SUFFIX.length));
    let hash = null;
    try { hash = hashFile(abs); } catch { /* unreadable: stays unreviewed */ }
    const d = latest.get(file);
    const answered = d && hash && d.sidecar_hash === hash;
    sidecars.push({
      file,
      sidecar: toRel(repoRoot, abs),
      sidecar_hash: hash,
      state: answered ? d.decision : 'unreviewed',
      reason: answered ? d.reason || null : null,
      decided_at: answered ? d.at || null : null,
      // A decision exists but for an older version of this update.
      superseded_decision: d && !answered ? d.decision : null,
    });
  }
  const onDisk = (s) => sidecars.filter((x) => x.state === s).length;
  // A file whose old answer has been superseded by a newer update is an open
  // question again. Counting it under its old answer as well would report one
  // file as both declined and unreviewed, and make the totals add up to more
  // files than exist.
  const reopened = new Set(sidecars.filter((x) => x.state === 'unreviewed').map((x) => x.file));
  const ledger = (s) => [...latest.values()].filter((d) => d.decision === s && !reopened.has(d.file)).length;
  return {
    sidecars,
    counts: {
      unreviewed: onDisk('unreviewed'),
      deferred: onDisk('deferred'),
      declined: ledger('declined'),
      taken: ledger('taken'),
    },
  };
}

function appendDecision(repoRoot, rec) {
  fs.appendFileSync(path.join(repoRoot, RECORD_FILE), JSON.stringify(rec) + '\n', 'utf8');
}

/**
 * Resolve what the caller named to its live file and update file. Accepts the
 * live path or the update path, relative to the repo root or absolute. Throws
 * with a sentence a founder can read.
 */
function resolveTarget(repoRoot, given) {
  if (!given) throw new Error('name the file: the customised file, or its .kit-update beside it');
  const root = path.resolve(repoRoot);
  let abs = path.resolve(root, given);
  if (abs.endsWith(SIDECAR_SUFFIX)) abs = abs.slice(0, -SIDECAR_SUFFIX.length);
  const rel = path.relative(root, abs);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`${given} is outside this repo — a repo records decisions only about its own files`);
  }
  const sidecarAbs = abs + SIDECAR_SUFFIX;
  if (!fs.existsSync(sidecarAbs)) {
    throw new Error(`no update is waiting for ${toRel(root, abs)} (looked for ${toRel(root, sidecarAbs)})`);
  }
  return { liveAbs: abs, sidecarAbs, file: toRel(root, abs) };
}

/**
 * Record one decision and carry it out.
 *
 * Order matters, and differs by decision:
 *
 *   declined / deferred  the record is appended BEFORE the update file is
 *     removed, so a crash can never lose the reason. If the process dies
 *     between the two, the update is still on disk and already reads as
 *     answered.
 *   taken  the repo's file is replaced FIRST, then the record is appended, then
 *     the update is removed. A crash after the copy leaves the update on disk
 *     and unrecorded, so it reads as unreviewed and `take` can simply be run
 *     again. Recording first would be worse: a crash would leave a record
 *     saying "taken" beside a file that was never replaced.
 *
 * `take` replaces the repo's own file, so it refuses when `liveUncommitted`
 * says that file holds changes git does not have, unless `discardMine` is set.
 * Detecting that is the caller's job (it needs git); this function only honours
 * the answer, which keeps it testable without a repository.
 */
function decide(repoRoot, given, decision, opts = {}) {
  if (!DECISIONS.includes(decision)) throw new Error(`decision must be one of: ${DECISIONS.join(', ')}`);
  const t = resolveTarget(repoRoot, given);
  const reason = String(opts.reason || '').trim();
  if (decision !== 'taken' && reason.length < MIN_REASON) {
    throw new Error(`a ${decision === 'declined' ? 'decline' : 'deferral'} needs --reason (at least ${MIN_REASON} characters). `
      + 'The reason is the whole record: without it this is indistinguishable from a file nobody looked at.');
  }
  const liveExists = fs.existsSync(t.liveAbs);
  if (decision === 'taken' && liveExists && opts.liveUncommitted && !opts.discardMine) {
    throw new Error(`${t.file} has changes that are not committed, and taking the update would overwrite them. `
      + 'Commit the file first, or pass --discard-mine to overwrite it anyway.');
  }
  const rec = {
    file: t.file,
    decision,
    reason: reason || null,
    kit_version: opts.kitVersion || null,
    sidecar_hash: hashFile(t.sidecarAbs),
    live_hash_before: liveExists ? hashFile(t.liveAbs) : null,
    at: new Date(typeof opts.now === 'number' ? opts.now : Date.now()).toISOString(),
    session: opts.session || null,
  };
  if (decision === 'taken') fs.copyFileSync(t.sidecarAbs, t.liveAbs);
  appendDecision(repoRoot, rec);
  if (decision !== 'deferred') fs.unlinkSync(t.sidecarAbs);
  return rec;
}

module.exports = {
  SIDECAR_SUFFIX, RECORD_FILE, DECISIONS, MIN_REASON,
  walkSidecars, hashFile, readDecisions, latestByFile, sidecarStatus, resolveTarget, decide,
};
