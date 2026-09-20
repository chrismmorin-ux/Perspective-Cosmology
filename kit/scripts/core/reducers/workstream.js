/**
 * reducers/workstream.js — T6:workstream reducer (WS-196, ADR-020 Phase A).
 *
 * Pragmatic filesystem-read pattern (locked at SPR-062 approval): on any
 * T6:workstream event, re-reads `.claude/workstream/queue/*.yaml` files
 * and materializes `state/queue.json`. Preserves WS-*.yaml as the
 * editable surface (founder + AI still edit the files directly) while
 * giving commands a fast, deterministic typed-API read path.
 *
 * Replay-purity under "state = reducer(events + current filesystem)"
 * definition: replay reads the same files reducers read, produces the
 * same state. INV-031 catches drift if files edit without events.
 *
 * Zero external dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { readYAMLFile, globFiles } = require('../../lib/cwos-utils');
const { classifySource } = require('../../cwos-classify');

const TRACK = 'T6:workstream';
const DOMAIN = 'queue';
const SCHEMA_VERSION = 1;

// Fields we materialize per queue item. Matches the shape of
// queue-index.yaml today so commands can swap to the typed API without
// mapping transformations. Extra fields on WS-*.yaml (description,
// accept_criteria, completion_notes) are deliberately NOT mirrored —
// they belong to the human-editable file; state is a lookup index.
const ITEM_FIELDS = [
  'id', 'title', 'status', 'priority_score', 'category', 'effort',
  'program', 'capability', 'sprint_id', 'claimed_at', 'completed_at',
  'source', 'created', 'blocked_by_note',
];
// Array fields that come through as YAML block sequences
// WS-695: customer_impact is here, not in ITEM_FIELDS, because it is a list.
// This projection is what /next actually ranks from — queue-index.yaml is the
// human-readable sibling, not the ranker's input — so a scoring field absent
// here is a scoring field that does not exist, however correct the YAML looks.
const ARRAY_FIELDS = ['blocked_by', 'blocks', 'enables', 'depends_on', 'files_involved', 'customer_impact'];

// WS-262 cached fields — reducer-stamped, replay-pure derivations of
// canonical input. Listed separately so /reducer-cached-fields tests +
// docs can inspect them programmatically.
const CACHED_FIELDS = ['source_class'];

// Snapshot the queue dir into an items map. Pure function of the current
// filesystem — extracted (WS-609) so replay can memoize it per pass.
function computeItems(ctx) {
  const queueDir = path.join(ctx.workstreamDir, 'queue');
  if (!fs.existsSync(queueDir)) return undefined;

  const items = {};
  const warnings = [];
  const files = globFiles(queueDir, 'WS-*.yaml');
  for (const f of files) {
    const r = readYAMLFile(f);
    if (!r.ok || !r.data || !r.data.id) {
      warnings.push(`${path.basename(f)}: unreadable or missing id`);
      continue;
    }
    const d = r.data;
    const summary = {};
    for (const k of ITEM_FIELDS) if (d[k] !== undefined) summary[k] = d[k];
    for (const k of ARRAY_FIELDS) if (Array.isArray(d[k])) summary[k] = d[k];
    // WS-262: stamp source_class — pure function of d.source, replay-pure
    // (verified by INV-044). Used by /next Step 2d source-class damping
    // without re-classifying at composition time.
    summary.source_class = classifySource(d);
    items[d.id] = summary;
  }
  return items;
}

function reduce(event, allState, ctx) {
  if (!event || event.source_track !== TRACK) return undefined;
  if (!ctx || !ctx.workstreamDir) return undefined;   // defensive

  // WS-609: during a replay pass the filesystem is quiescent, so compute the
  // snapshot once per pass. Live dispatch has no replayMemo — files change
  // between live events, so it always reads fresh.
  let items;
  if (ctx.replayMemo) {
    if (!ctx.replayMemo.has(DOMAIN)) ctx.replayMemo.set(DOMAIN, computeItems(ctx));
    items = ctx.replayMemo.get(DOMAIN);
  } else {
    items = computeItems(ctx);
  }
  if (items === undefined) return undefined;   // queue dir absent

  const priorDomain = allState[DOMAIN] || emptyDomain();
  // Identity fast path: on a memo hit after the first materialization the
  // prior domain holds the exact same items reference (stampDomainPatch
  // preserves it), so the deep compare is unnecessary.
  if (priorDomain.items === items) return undefined;
  const nextDomain = {
    schema_version: SCHEMA_VERSION,
    domain: DOMAIN,
    updated_at: event.timestamp || (ctx && ctx.timestamp) || null,
    updated_by_event: event.id || null,
    items,
  };

  // Short-circuit if nothing meaningful changed. Compare the items map
  // specifically — updated_at / updated_by_event drift per event by
  // design and shouldn't trigger rewrites if items are identical.
  if (itemsEqual(priorDomain.items || {}, items)) return undefined;

  return { [DOMAIN]: nextDomain };
}

function emptyDomain() {
  return {
    schema_version: SCHEMA_VERSION,
    domain: DOMAIN,
    updated_at: null,
    updated_by_event: null,
    items: {},
  };
}

function itemsEqual(a, b) {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (!(k in b)) return false;
    if (!itemEqual(a[k], b[k])) return false;
  }
  return true;
}

function itemEqual(a, b) {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    const va = a[k], vb = b[k];
    if (Array.isArray(va) || Array.isArray(vb)) {
      if (!Array.isArray(va) || !Array.isArray(vb) || va.length !== vb.length) return false;
      for (let i = 0; i < va.length; i++) if (va[i] !== vb[i]) return false;
    } else if (va !== vb) {
      return false;
    }
  }
  return true;
}

function register(registerReducer) {
  registerReducer(TRACK, reduce);
}

module.exports = {
  TRACK,
  DOMAIN,
  SCHEMA_VERSION,
  ITEM_FIELDS,
  ARRAY_FIELDS,
  CACHED_FIELDS,
  reduce,
  register,
  emptyDomain,
  computeItems,
};
