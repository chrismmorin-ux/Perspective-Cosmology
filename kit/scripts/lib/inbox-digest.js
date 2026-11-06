'use strict';

/**
 * inbox-digest — read HomeBase's outbox for THIS repo into the one line /next
 * renders (WS-880).
 *
 * THE MIRROR OF THE OTHER FOUR. friction, request, maintenance and divergence
 * are hub-side and return null in an adopted repo. This one is the opposite:
 * it returns null in HomeBase and speaks only inside an adopted repo, because
 * the thing it reports is work addressed TO here.
 *
 * WHY IT EXISTS. `cwos-inbox-drain` shipped with the pull model (WS-612) and
 * has never once run: measured 2026-09-21, six envelopes across three repos,
 * oldest 29 days, and `cwos-fleet-outbox receipts` reporting "no receipts —
 * nothing has been picked up yet". The lane had a sender, a transport and a
 * receiver that nothing invoked — no command, no hook, no preamble, no
 * protocol, only a human who would have had to know to type it. WS-697 read
 * that as ServeYourNote's kit being too old to carry the script; two repos that
 * DO carry it had delivered nothing either, which is what showed the version
 * was never the whole story.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO. It does not drain. Founder decision
 * 2026-09-21: `cwos-inbox-drain`'s own header names "can be not-run" as part of
 * why the DEC-054 boundary is structural rather than a matter of HomeBase
 * behaving well, and draining from the gate would quietly delete that property.
 * A session still chooses. This module only makes the choice visible, which is
 * the same thing that made the friction lane work.
 *
 * FOUR STATES, and a caller must be able to say which — the sweep-freshness
 * lesson applied to a lane that has no sweep:
 *
 *   null                     -> not an adopted repo (HomeBase itself). Render nothing.
 *   reason: hub-unreachable  -> LOUD. homebase_path is declared and not on disk.
 *   reason: not-in-registry  -> LOUD. The hub does not know this path, so an
 *                               empty result would mean "nothing addressed to
 *                               you" AND "I looked in the wrong place" at once.
 *   waiting: 0               -> quiet. The hub knows us and has sent nothing.
 *
 * The loud states matter more here than in the hub-side digests, because a
 * repo cloned on a node where HomeBase is absent reads exactly like a repo with
 * an empty inbox unless something insists on the difference.
 *
 * Age is measured from the OLDEST undelivered envelope, not from a sweep stamp
 * — there is no sweep. `oldest_days` is the number the caller says out loud,
 * for the same reason the request digest leads with it: the failure this lane
 * exists to end is something waiting a very long time while nothing rendered
 * the fact that it was waiting.
 */

const fs = require('fs');
const path = require('path');

const { readYAMLFile, globFiles, findRepoRoot, findWorkstreamDir } = require('./cwos-utils');

// Resolution is the drain's, imported rather than re-derived. Two definitions
// of "which outbox is mine" is exactly the drift that would make the digest
// report on an outbox the drain then declines to read.
const { resolveHomeBase, resolveRepoName, readLedger } = require('../cwos-inbox-drain');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Minimal scalar reader — an envelope is flat at the top level. */
function envelopeSummary(file) {
  const r = readYAMLFile(file);
  if (!r.ok || !r.data) return null;
  const d = r.data;
  const item = d.item || {};
  return {
    envelope_id: d.envelope_id || path.basename(file, '.yaml'),
    title: item.title || '(untitled)',
    created_at: d.created_at || null,
    severity: item.severity || null,
    ref: d.ref || null,
    delivered: d.delivered === true,
  };
}

/**
 * Returns null off-repo (i.e. in HomeBase), else:
 *   { repo, homebase, reachable, reason, waiting, oldest_at, oldest_days, envelopes }
 *
 * `envelopes` is oldest first and capped at 5 — the oldest is the one that
 * carries the argument, and a list nobody can scan is a list nobody reads.
 */
function computeInboxDigest(opts = {}) {
  let repoRoot;
  try { repoRoot = opts.from || findRepoRoot(process.cwd()); } catch { return null; }
  if (!repoRoot) return null;

  // No .cwos-version means this is not an adopted repo. In HomeBase that is
  // the normal state (it is the kit SOURCE), so render nothing rather than
  // inventing a condition — the same carve-out cwos-stamp-audit makes.
  const homebase = resolveHomeBase(repoRoot, opts.homebase || null);
  if (!homebase) return null;

  const base = {
    repo: null, homebase, reachable: true, reason: null,
    waiting: 0, oldest_at: null, oldest_days: null, envelopes: [],
  };

  if (!fs.existsSync(path.join(homebase, 'fleet', 'registry.yaml'))) {
    return { ...base, reachable: false, reason: 'hub-unreachable' };
  }

  const repo = resolveRepoName(homebase, repoRoot, opts.asRepo || null);
  if (!repo) return { ...base, reason: 'not-in-registry' };

  const dir = path.join(homebase, 'fleet', 'outbox', repo);
  if (!fs.existsSync(dir)) return { ...base, repo };

  let drained = {};
  try {
    const wsDir = opts.workstreamDir || findWorkstreamDir(repoRoot);
    drained = (readLedger(wsDir) || {}).drained || {};
  } catch { /* no ledger yet — nothing has been drained, which is the point */ }

  const waiting = [];
  for (const f of globFiles(dir, 'OBX-*.yaml')) {
    const e = envelopeSummary(f);
    if (!e || e.delivered) continue;
    if (drained[e.envelope_id]) continue;
    waiting.push(e);
  }

  const now = typeof opts.now === 'number' ? opts.now : Date.now();
  const ageDays = (iso) => {
    const t = Date.parse(iso || '');
    return Number.isFinite(t) ? Math.floor((now - t) / MS_PER_DAY) : null;
  };

  // Oldest first. An envelope with an unparseable date sorts last rather than
  // being dropped: it is still waiting, and losing it would be the quiet
  // failure this module exists to end.
  waiting.sort((a, b) => {
    const ta = Date.parse(a.created_at || '');
    const tb = Date.parse(b.created_at || '');
    if (!Number.isFinite(ta)) return 1;
    if (!Number.isFinite(tb)) return -1;
    return ta - tb;
  });

  const oldest = waiting.find((e) => Number.isFinite(Date.parse(e.created_at || '')));

  return {
    ...base,
    repo,
    waiting: waiting.length,
    oldest_at: oldest ? oldest.created_at : null,
    oldest_days: oldest ? ageDays(oldest.created_at) : null,
    envelopes: waiting.slice(0, 5).map((e) => ({
      envelope_id: e.envelope_id,
      title: e.title,
      created_at: e.created_at,
      days: ageDays(e.created_at),
      severity: e.severity,
      ref: e.ref,
    })),
  };
}

module.exports = { computeInboxDigest };
