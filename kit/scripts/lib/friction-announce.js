'use strict';
/**
 * friction-announce — WS-580's transport, run in reverse (WS-581).
 *
 * Capture and transport make friction data exist; this is what makes anyone
 * keep producing it. Claude-Poker-Tracker reported the gate resume-check bug
 * twice, the fix shipped, and nobody told CPT — it carried workarounds for a
 * defect that no longer existed. Filing into a void kills the habit.
 *
 * announce() delivers a disposition — friction_resolved OR friction_declined
 * (a complaint must be closable without being fixed) — to each originating
 * repo's own event log, and records every hash in the hub-side ledger
 * fleet/friction/dispositions.jsonl. The ledger is what stops disposed
 * friction from counting toward WS-579's recurrence threshold: a deliberate
 * "no" must not keep re-surfacing as unaddressed, and a FIXED defect that
 * recurs produces NEW hashes — the old ones must stop holding the threshold
 * open.
 *
 * The inbox is the only hash → origin_repo reverse index; registry `name`
 * (never path basename — casing differs) maps origin to path. HomeBase has
 * no registry entry and is synthesized, exactly as the forward sweep does.
 * A repo hosted on another node gets `deferred`, not a cross-node write
 * (ADR-057: reads are node-scoped; so are our writes into a repo's log).
 *
 * Ships with the kit so cwos-next's `done` can call it anywhere, but it is
 * real only at the hub: without fleet/friction/ it returns a no-op result
 * rather than throwing — an adopted repo closing a friction-sourced item
 * simply has nothing to reverse-deliver from.
 */

const fs = require('fs');
const path = require('path');

const { readYAMLFile } = require('./cwos-utils');
const { readInboxLines, readDispositions } = require('./friction-digest');

function findHubUpward(startDir) {
  let dir = path.resolve(startDir || process.cwd());
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'fleet', 'registry.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * The lanes this transport serves. WS-699 added the second one: the courier's
 * return leg needs exactly this delivery mechanism, and copying it would have
 * given the fleet two reverse-delivery paths that drift apart.
 *
 * A lane is its inbox directory plus its disposition vocabulary. Friction is
 * resolved or declined; a request is accepted or declined. The ledgers stay
 * separate because the recurrence math must never see a request (a feature
 * ask is not a proven defect), and `dir` is the whole of that separation.
 */
const LANES = {
  friction: {
    dir: 'friction',
    key: 'components',
    dispositions: { friction_resolved: 'resolved', friction_declined: 'declined', friction_archived: 'archived', friction_merged: 'merged' },
  },
  requests: {
    dir: 'requests',
    key: 'categories',
    dispositions: { request_accepted: 'accepted', request_declined: 'declined' },
  },
};

/**
 * An archive (WS-1062, the founder's age amnesty) is ledgered as `archived` but
 * DELIVERED under the declined tag. Every installed cwos-friction-ack knows two
 * friction types and silently skips any other, so a new tag on the wire would be
 * an answer nobody hears — the exact silence this transport exists to end. The
 * payload's `disposition` carries the distinction for a kit that can read it.
 *
 * A merge ("still real, tracked under an open item") rides the same tag for the
 * same reason. It is not a no, so the caller's detail must say so in its first
 * words — an older kit renders that detail after the word "declined".
 */
const DELIVERED_AS = { friction_archived: 'friction_declined', friction_merged: 'friction_declined' };

/** Dispositions that mean "the hub said no" — disposed even when delivery is deferred. */
const SAID_NO = new Set(['declined', 'archived']);

/** The type alone names the lane — there is no ambiguous pairing to get wrong. */
function laneFor(type) {
  for (const lane of Object.values(LANES)) {
    if (Object.prototype.hasOwnProperty.call(lane.dispositions, type)) return lane;
  }
  return null;
}

/**
 * Deliver a disposition for a set of source hashes.
 *
 * @param {string[]} hashes  source_hashes (inbox content_hashes)
 * @param {object} d  { type: friction_resolved|friction_declined|friction_archived|friction_merged|request_accepted|request_declined, ws_id, detail }
 * @param {object} [opts]  { homebase, from }
 * @returns { ok, delivered: [{repo, event_id, hashes}], deferred: [], undeliverable: [], ledgered: n }
 */
function announce(hashes, d, opts = {}) {
  if (!Array.isArray(hashes) || hashes.length === 0) return { ok: true, delivered: [], deferred: [], undeliverable: [], ledgered: 0, reason: 'no hashes' };
  const lane = laneFor(d.type);
  if (!lane) {
    throw new Error(`friction-announce: unknown disposition type "${d.type}"`);
  }

  const homebase = opts.homebase || findHubUpward(opts.from);
  if (!homebase) return { ok: true, delivered: [], deferred: [], undeliverable: [], ledgered: 0, reason: 'no hub in sight' };
  const laneDir = path.join(homebase, 'fleet', lane.dir);
  if (!fs.existsSync(laneDir)) return { ok: true, delivered: [], deferred: [], undeliverable: [], ledgered: 0, reason: `no fleet/${lane.dir}` };

  // hash → origin repo, via the inbox (the only reverse index).
  const byHash = new Map();
  for (const l of readInboxLines(path.join(laneDir, 'inbox.jsonl'))) {
    if (l.source_hash) byHash.set(l.source_hash, l);
  }

  const reg = readYAMLFile(path.join(homebase, 'fleet', 'registry.yaml'));
  const registryRepos = (reg.ok && reg.data && Array.isArray(reg.data.repos)) ? reg.data.repos : [];
  let nodeCtx = null;
  let isHostedHere = () => true;
  try {
    const fleetNodes = require('./fleet-nodes');
    nodeCtx = fleetNodes.resolveNodeContext(reg.data || {});
    isHostedHere = (repo) => fleetNodes.isRepoHostedHere(repo, nodeCtx);
  } catch { /* single-node fallback: everything is here */ }

  function repoPathFor(originName) {
    if (originName === 'HomeBase') return { path: homebase, hosted: true };
    const entry = registryRepos.find(r => r && r.name === originName && r.type !== 'simulated');
    if (!entry || !entry.path) return null;
    return { path: entry.path, hosted: isHostedHere(entry) };
  }

  const byRepo = new Map();
  const undeliverable = [];
  for (const h of hashes) {
    const line = byHash.get(h);
    if (!line || !line.origin_repo) { undeliverable.push({ hash: h, reason: 'not in inbox' }); continue; }
    if (!byRepo.has(line.origin_repo)) byRepo.set(line.origin_repo, []);
    // Friction lines carry `component`, request lines carry `category`; the
    // payload key differs per lane so a consumer cannot confuse the two.
    byRepo.get(line.origin_repo).push({ hash: h, label: line.component || line.category || null });
  }

  const wireType = DELIVERED_AS[d.type] || d.type;
  const delivered = [];
  const deferred = [];
  let appendEvent = null;
  try { ({ appendEvent } = require('../core/events')); } catch { /* below */ }

  for (const [origin, entries] of byRepo) {
    const target = repoPathFor(origin);
    if (!target) { undeliverable.push({ repo: origin, reason: 'not in registry' }); continue; }
    if (!target.hosted) { deferred.push({ repo: origin, reason: 'hosted on another node (ADR-057) — deliver via its node' }); continue; }
    const wsDir = path.join(target.path, '.claude', 'workstream');
    if (!fs.existsSync(wsDir) || !appendEvent) { undeliverable.push({ repo: origin, reason: !appendEvent ? 'event module unavailable' : 'no .claude/workstream' }); continue; }
    try {
      const r = appendEvent({
        source_track: 'T20:capture-buffer',
        track_tag: wireType,
        payload: {
          type: wireType,
          disposition: lane.dispositions[d.type],
          source_hashes: entries.map(e => e.hash),
          [lane.key]: [...new Set(entries.map(e => e.label).filter(Boolean))],
          ws_id: d.ws_id || null,
          detail: d.detail || null,
          announced_at: new Date().toISOString(),
        },
      }, { workstreamDir: wsDir });
      delivered.push({ repo: origin, event_id: (r && r.event && r.event.id) || null, hashes: entries.map(e => e.hash) });
    } catch (err) {
      undeliverable.push({ repo: origin, reason: `append failed: ${err.message}` });
    }
  }

  // Hub ledger — written for every hash that reached a log OR was deliberately
  // disposed, so recurrence math stops counting it. Undeliverable hashes stay
  // un-ledgered: a disposition nobody received is not a disposition.
  const deliveredHashes = new Set(delivered.flatMap(x => x.hashes));
  // Declined-by-founder counts as disposed even when the origin is deferred —
  // the "no" was said; delivery to a foreign node is a transport concern.
  if (SAID_NO.has(lane.dispositions[d.type])) {
    for (const [origin, entries] of byRepo) {
      if (deferred.some(x => x.repo === origin)) for (const e of entries) deliveredHashes.add(e.hash);
    }
  }
  let ledgered = 0;
  if (deliveredHashes.size > 0) {
    const lines = [...deliveredHashes].map(h => JSON.stringify({
      source_hash: h,
      disposition: lane.dispositions[d.type],
      ws_id: d.ws_id || null,
      detail: d.detail || null,
      at: new Date().toISOString(),
    }));
    fs.appendFileSync(path.join(laneDir, 'dispositions.jsonl'), lines.join('\n') + '\n', 'utf8');
    ledgered = lines.length;
  }

  return { ok: true, delivered, deferred, undeliverable, ledgered };
}

module.exports = { announce };
