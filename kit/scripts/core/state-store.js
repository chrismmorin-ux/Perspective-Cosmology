/**
 * state-store.js — canonical-state runtime (ADR-020 step 2, WS-189).
 *
 * Loads materialized state from `.claude/workstream/state/*.json`,
 * exposes a typed-API read surface with O(1) / O(n) deterministic
 * lookups on indexed keys, and drives reducer dispatch when
 * events.appendEvent appends a new event.
 *
 * Design (per ADR-020 + WS-189 plan):
 *   - One JSON file per domain (envelope, queue, findings, sprints,
 *     programs, config, sessions)
 *   - Indexes built on load (by_id, by_status, by_program) — no
 *     persisted index files; zero drift risk
 *   - Reducers are pure functions: (event, domainState, ctx) → newDomainState
 *   - Dispatch is synchronous in events.appendEvent (state always in
 *     sync with event log); lazy-required there with guarded try/catch
 *     so a state-store failure is non-fatal to the append
 *   - Atomic writes via writeFileAtomic (hardlink-safe, size-gated)
 *
 * Zero external dependencies.
 */

'use strict';

require('../lib/preflight');

const fs = require('fs');
const path = require('path');

const { findWorkstreamDir, writeFileAtomic } = require('../lib/cwos-utils');

const ENV_VAR_DISABLE = 'CWOS_STATE_STORE_DISABLED';
const ENV_VAR_LAG_THRESHOLD = 'CWOS_STATE_LAG_THRESHOLD';
const SCHEMA_VERSION = 2;
const LAG_THRESHOLD_DEFAULT = 100;

// Every domain ships with these keys even before any reducer populates it.
const DEFAULT_DOMAINS = ['envelope', 'queue', 'findings', 'sprints', 'programs', 'config', 'sessions', 'engines'];

// Each domain can declare which fields become indexes. The typed-API
// accessors below use these to expose byX() lookups.
const DOMAIN_INDEXES = {
  envelope:  ['command_id'],
  queue:     ['id', 'status', 'program'],
  findings:  ['id', 'status', 'program', 'severity'],
  sprints:   ['id', 'status', 'program_focus'],
  programs:  ['id', 'tier'],
  sessions:  ['id', 'status'],
  engines:   [], // keyed by program_id directly; byId() walks _byKey
  config:    [], // scalar key-value; no item indexes
};

// ─── Reducer registry ─────────────────────────────────────────────────────

// Map: track-name → [reducer-fn, ...]. Reducers self-register at
// require time from kit/scripts/core/reducers/*.js modules.
const REDUCER_REGISTRY = new Map();

function registerReducer(track, fn) {
  if (typeof track !== 'string' || track.length === 0) {
    throw new Error('registerReducer: track must be a non-empty string');
  }
  if (typeof fn !== 'function') {
    throw new Error('registerReducer: fn must be a function');
  }
  if (!REDUCER_REGISTRY.has(track)) REDUCER_REGISTRY.set(track, []);
  REDUCER_REGISTRY.get(track).push(fn);
}

function clearReducers() { REDUCER_REGISTRY.clear(); } // test-only

// ─── State-store instance ─────────────────────────────────────────────────

function stateDir(workstreamDir) {
  const ws = workstreamDir || findWorkstreamDir();
  return path.join(ws, 'state');
}

function emptyDomainFile(name) {
  return {
    schema_version: SCHEMA_VERSION,
    domain: name,
    updated_at: null,
    updated_by_event: null,
    last_event_log_head: null,
    items: name === 'config' ? {} : {},
  };
}

function loadState(workstreamDir) {
  // WS-274: self-heal — migrate any legacy v1 state files to current
  // schema in place before loading. Idempotent; no-op on already-current.
  try { migrateStateSchema(workstreamDir, SCHEMA_VERSION); } catch { /* non-fatal */ }

  const dir = stateDir(workstreamDir);
  const domains = {};
  for (const name of DEFAULT_DOMAINS) {
    const file = path.join(dir, `${name}.json`);
    if (fs.existsSync(file)) {
      try { domains[name] = JSON.parse(fs.readFileSync(file, 'utf8')); }
      catch { domains[name] = emptyDomainFile(name); }
    } else {
      domains[name] = emptyDomainFile(name);
    }
  }
  return instance(workstreamDir, domains);
}

/**
 * WS-274: migrate state/*.json files from older schema versions in place.
 * Idempotent — files already at toVersion are skipped. Per-version steps:
 *
 *   1 → 2: add `last_event_log_head` (initialize to existing `updated_by_event`
 *          when present, else null). Bump schema_version.
 *
 * Future bumps add another step here. This function is called automatically
 * from loadState(); the cwos-migrate.js CLI exposes it as `--state-schema`.
 */
function migrateStateSchema(workstreamDir, toVersion) {
  const dir = stateDir(workstreamDir);
  if (!fs.existsSync(dir)) return { migrated: [], skipped: [] };
  const target = typeof toVersion === 'number' ? toVersion : SCHEMA_VERSION;
  const migrated = [];
  const skipped = [];

  for (const name of DEFAULT_DOMAINS) {
    const file = path.join(dir, `${name}.json`);
    if (!fs.existsSync(file)) continue;
    let data;
    try { data = JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { skipped.push({ domain: name, reason: 'parse-failed' }); continue; }
    const fromVersion = typeof data.schema_version === 'number' ? data.schema_version : 1;
    if (fromVersion >= target) { skipped.push({ domain: name, reason: 'already-current', version: fromVersion }); continue; }

    // Apply step 1 → 2.
    if (fromVersion < 2 && target >= 2) {
      if (!('last_event_log_head' in data)) {
        data.last_event_log_head = data.updated_by_event || null;
      }
    }
    // Future: if (fromVersion < 3 && target >= 3) { ... }

    data.schema_version = target;
    writeFileAtomic(file, JSON.stringify(data, null, 2) + '\n');
    migrated.push({ domain: name, from: fromVersion, to: target });
  }
  return { migrated, skipped };
}

/**
 * WS-274: compat() — schema-version handshake + lag visibility.
 *
 * Returns a structured envelope describing each domain's compatibility with
 * the current kit's expected schema version, plus a lag count vs the event
 * log head. Soft posture: never throws, never modifies state. Callers that
 * want hard rejection drive it from this output.
 */
function compat(workstreamDir, opts) {
  const ws = workstreamDir || findWorkstreamDir();
  const lagThreshold = (opts && typeof opts.lagThreshold === 'number')
    ? opts.lagThreshold
    : (Number(process.env[ENV_VAR_LAG_THRESHOLD]) || LAG_THRESHOLD_DEFAULT);

  // Lazy require to avoid circular dep: events.js loads state-store lazily.
  let allEvents = [];
  try {
    const eventsMod = require('./events');
    const r = eventsMod.readAllChunks(ws);
    allEvents = r.events || [];
  } catch { /* events module absent or unreadable; treat log as empty */ }

  const eventIdToIndex = new Map();
  for (let i = 0; i < allEvents.length; i++) {
    if (allEvents[i] && allEvents[i].id) eventIdToIndex.set(allEvents[i].id, i);
  }
  const currentLogHeadId = allEvents.length > 0 ? allEvents[allEvents.length - 1].id : null;

  const dir = stateDir(ws);
  const domains = {};
  const warnings = [];
  let allOk = true;

  for (const name of DEFAULT_DOMAINS) {
    const file = path.join(dir, `${name}.json`);
    if (!fs.existsSync(file)) {
      domains[name] = {
        schema_version: null,
        schema_match: true,        // missing file is not a mismatch — treated as fresh-init
        last_event_log_head: null,
        lag: 0,
        lag_threshold: lagThreshold,
        lag_exceeded: false,
        present: false,
      };
      continue;
    }
    let data;
    try { data = JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (err) {
      domains[name] = {
        schema_version: null,
        schema_match: false,
        last_event_log_head: null,
        lag: 0,
        lag_threshold: lagThreshold,
        lag_exceeded: false,
        present: true,
        parse_error: err.message,
      };
      warnings.push(`${name}: parse failed (${err.message})`);
      allOk = false;
      continue;
    }

    const sv = typeof data.schema_version === 'number' ? data.schema_version : 1;
    const schemaMatch = sv === SCHEMA_VERSION;
    if (!schemaMatch) {
      warnings.push(`${name}: schema_version ${sv} does not match expected ${SCHEMA_VERSION}`);
      allOk = false;
    }

    const head = data.last_event_log_head || data.updated_by_event || null;
    const everMaterialized = head !== null || data.updated_at !== null;
    let lag = 0;
    let lagExceeded = false;
    if (allEvents.length === 0) {
      lag = 0;
    } else if (!everMaterialized) {
      // Domain skeleton was created but no reducer ever wrote to it
      // (e.g., config/sessions today). "Lag" is undefined here, not the
      // total event count — treat as 0 to avoid false-positive warnings.
      lag = 0;
    } else if (!head) {
      lag = allEvents.length;
    } else if (eventIdToIndex.has(head)) {
      lag = (allEvents.length - 1) - eventIdToIndex.get(head);
    } else {
      // head references an event not in the log — treat as max lag.
      lag = Number.POSITIVE_INFINITY;
    }
    if (lag > lagThreshold) {
      lagExceeded = true;
      warnings.push(`${name}: lag ${lag === Infinity ? 'Infinity' : lag} exceeds threshold ${lagThreshold}`);
      allOk = false;
    }

    domains[name] = {
      schema_version: sv,
      schema_match: schemaMatch,
      last_event_log_head: head,
      lag: lag === Infinity ? 'Infinity' : lag,
      lag_threshold: lagThreshold,
      lag_exceeded: lagExceeded,
      present: true,
    };
  }

  return {
    ok: allOk,
    expected_schema_version: SCHEMA_VERSION,
    current_log_head_id: currentLogHeadId,
    domains,
    warnings,
  };
}

function buildIndexes(domainName, items) {
  const keys = DOMAIN_INDEXES[domainName] || [];
  const idx = {};
  for (const key of keys) idx[key] = new Map();
  for (const [itemKey, item] of Object.entries(items || {})) {
    for (const key of keys) {
      const val = item && item[key];
      if (val === undefined || val === null) continue;
      if (!idx[key].has(val)) idx[key].set(val, []);
      idx[key].get(val).push(item);
    }
    // Always make byItemKey available via 'items_by_key'
    if (!idx._byKey) idx._byKey = new Map();
    idx._byKey.set(itemKey, item);
  }
  if (!idx._byKey) idx._byKey = new Map();
  return idx;
}

// ─── WS-590: blocker resolution ─────────────────────────────────────────────
//
// A `blocked_by` entry is a POINTER, and until WS-590 nothing in the kit could
// follow it anywhere except into the live queue domain. Two consequences,
// measured 2026-08-20:
//
//   - An item that is `done` and has since been moved to `queue/archive/` is
//     absent from `store.queue.all()`. Every dependent of it was gated forever.
//     Measured 2026-08-26 on this repo: 13 live dependency edges point at
//     archived items (WS-007, WS-012, WS-043, WS-057, WS-067, WS-087, WS-145).
//   - A blocker that was `dismissed` with `superseded_by: X`, where X shipped,
//     never cleared either — the work its dependents waited on was DONE, under
//     a different id. WS-389 → WS-432 stalled five items that way.
//
// And the failure was silent in both directions: the dependent simply never
// appeared in a sprint, and its absence read as low priority rather than as a
// defect. That is the exact shape `.claude/rules/provenance-or-refuse.md`
// names — a guard advertising a protection it is not running. So resolution
// here returns a PROVENANCE RECORD, never a bare boolean: callers can tell
// "I resolved this against the archive" from "I could not resolve this at all",
// and the second case is required to be loud.

const BLOCKER_ID_SHAPE = /^WS-[A-Za-z0-9-]+$/;
const MAX_SUPERSEDE_HOPS = 16;

// Reasons a gate could not be resolved AT ALL. These are defects in the data,
// and every one of them must surface by name. `gate-open` is deliberately NOT
// in this set: a blocker that resolved to a real, not-yet-done item is the
// system working.
const UNRESOLVABLE_REASONS = new Set([
  'malformed-id',
  'not-found',
  'supersede-dangling',
  'supersede-malformed',
  'supersede-cycle',
  'supersede-depth-exceeded',
]);

function isUnresolvableBlocker(res) {
  return !!(res && res.reason && UNRESOLVABLE_REASONS.has(res.reason));
}

/**
 * Follow a `blocked_by` pointer to a verdict, with provenance.
 *
 * @param depId  the raw `blocked_by` entry, exactly as written
 * @param lookup (id) => item-like { id, status, superseded_by, _source } | null
 * @returns {{
 *   requested: string, id: string|null, cleared: boolean, resolved: boolean,
 *   status: string|null, source: string|null, chain: string[],
 *   reason: string|null, detail: string
 * }}
 */
function resolveBlocker(depId, lookup) {
  const raw = String(depId === undefined || depId === null ? '' : depId).trim();
  const base = {
    requested: raw, id: null, cleared: false, resolved: false,
    status: null, source: null, chain: [], reason: null, detail: '',
  };
  const shorten = (s) => (s.length > 90 ? s.slice(0, 90) + '…' : s);

  if (!raw) {
    return Object.assign({}, base, {
      reason: 'malformed-id',
      detail: 'blocked_by entry is empty — it names nothing and can never clear',
    });
  }
  if (!BLOCKER_ID_SHAPE.test(raw)) {
    return Object.assign({}, base, {
      reason: 'malformed-id',
      detail: `blocked_by entry ${JSON.stringify(shorten(raw))} is not an item id ` +
              `(expected WS-NNN). No resolver can match it, so the gate is permanently closed.`,
    });
  }

  const seen = new Set();
  const chain = [];
  let cur = raw;

  for (let hop = 0; hop <= MAX_SUPERSEDE_HOPS; hop++) {
    if (seen.has(cur)) {
      return Object.assign({}, base, {
        id: raw, chain: chain.slice(), reason: 'supersede-cycle',
        detail: `supersede chain loops back to ${cur} (${chain.concat(cur).join(' → ')})`,
      });
    }
    seen.add(cur);
    chain.push(cur);

    const found = lookup(cur) || null;
    if (!found) {
      const viaSupersede = chain.length > 1;
      return Object.assign({}, base, {
        id: raw, chain: chain.slice(),
        reason: viaSupersede ? 'supersede-dangling' : 'not-found',
        detail: viaSupersede
          ? `supersede chain ${chain.join(' → ')} ends at ${cur}, which exists in neither ` +
            `the live queue nor queue/archive/`
          : `${cur} exists in neither the live queue nor queue/archive/`,
      });
    }

    const status = found.status || null;
    const source = found._source || 'live';
    if (status === 'done') {
      return Object.assign({}, base, {
        id: raw, cleared: true, resolved: true, status, source,
        chain: chain.slice(), reason: null,
        detail: chain.length > 1
          ? `cleared by ${cur} (${source}, done) via supersede chain ${chain.join(' → ')}`
          : `cleared by ${cur} (${source}, done)`,
      });
    }

    const next = found.superseded_by === undefined || found.superseded_by === null
      ? '' : String(found.superseded_by).trim();
    if (next) {
      if (!BLOCKER_ID_SHAPE.test(next)) {
        return Object.assign({}, base, {
          id: raw, chain: chain.slice(), status, source, reason: 'supersede-malformed',
          detail: `${cur} declares superseded_by ${JSON.stringify(shorten(next))}, ` +
                  `which is not an item id — the chain cannot be followed`,
        });
      }
      cur = next;
      continue;
    }

    // Resolved to a real item that simply is not done yet. Not a defect.
    return Object.assign({}, base, {
      id: raw, resolved: true, cleared: false, status, source,
      chain: chain.slice(), reason: 'gate-open',
      detail: chain.length > 1
        ? `${cur} is ${status} (via supersede chain ${chain.join(' → ')})`
        : `${cur} is ${status}`,
    });
  }

  return Object.assign({}, base, {
    id: raw, chain: chain.slice(), reason: 'supersede-depth-exceeded',
    detail: `supersede chain exceeded ${MAX_SUPERSEDE_HOPS} hops (${chain.join(' → ')})`,
  });
}

// ─── Archived-queue index (WS-590) ──────────────────────────────────────────
//
// `queue/archive/` has no materialized state file and no index — /gc moves the
// YAML there and the live domain simply forgets it. Rather than add a seventh
// state domain (and a reducer, and a migration), the archive is read on demand
// with a scalar scan of the three fields a blocker resolution needs, and cached
// against the directory mtime. Measured cost on this repo: 187 files, ~10ms.
//
// This is the ONE raw-YAML read in the state-store, and it is deliberate: the
// alternative is every caller walking queue/archive/ itself, which is exactly
// the "no raw YAML walks of state" rule cwos-next declares in its header.

const _archiveCache = new Map(); // archiveDir → { mtimeMs, items: Map }

function scalarField(text, field) {
  const re = new RegExp(`^${field}:[ \\t]*(.*)$`, 'm');
  const m = text.match(re);
  if (!m) return null;
  let v = m[1].trim();
  if (!v || v === '|' || v === '>' || v === '[]' || v === 'null' || v === '~') return null;
  const c = v.indexOf(' #');
  if (c !== -1) v = v.slice(0, c).trim();
  v = v.replace(/^["']|["']$/g, '').trim();
  return v || null;
}

/**
 * Read a list field in either shape the queue actually uses (measured 2026-09-02 on this
 * repo: 43 inline, 66 block). Deliberately NOT a regex and NOT a YAML parser — scalarField
 * above set the precedent, and the two shapes below are the whole contract:
 *
 *   blocked_by: ["WS-527"]        inline
 *   blocked_by:                   block
 *     - "WS-007"
 *
 * Anything else returns empty rather than a half-parse. A partial dependency list is worse
 * than none: it would clear a gate nobody checked.
 */
function listField(text, field) {
  const head = field + ':';
  const lines = String(text || '').split('\n');
  const strip = (s) => (s.endsWith('\r') ? s.slice(0, -1) : s);
  const unquote = (s) => {
    const t = s.trim();
    if (t.length > 1 && (t[0] === '"' || t[0] === "'") && t[t.length - 1] === t[0]) return t.slice(1, -1).trim();
    return t;
  };
  for (let i = 0; i < lines.length; i++) {
    const line = strip(lines[i]);
    if (!line.startsWith(head)) continue;
    const after = line.slice(head.length).trim();
    if (after.startsWith('[')) {
      const close = after.lastIndexOf(']');
      if (close === -1) return [];
      return after.slice(1, close).split(',').map(unquote).filter(Boolean);
    }
    if (after !== '') return [];          // a scalar, or a folded block — not a list
    const out = [];
    for (let j = i + 1; j < lines.length; j++) {
      const item = strip(lines[j]).trim();
      if (!item.startsWith('-')) break;   // the first non-item line ends the list
      const v = unquote(item.slice(1));
      if (v) out.push(v);
    }
    return out;
  }
  return [];
}
/**
 * Load { id → { id, status, superseded_by, blocked_by, _source } } for every WS-*.yaml in
 * one directory. Cached on directory mtime.
 *
 * WS-744: the live half exists because `state/*.json` is GITIGNORED. In a fresh clone —
 * CI, a new node, a worktree — the materialized queue is EMPTY until reconcile runs, so a
 * blocker lookup built on it sees no live items at all and silently resolves nothing. That
 * is not a test artifact: it is the bootstrap state of every checkout, and a resolver that
 * reads only materialized state is blind in it. The YAMLs are the committed source of truth
 * and are always present, so they are the fallback.
 */
function loadQueueItemsFrom(dir, source) {
  let mtimeMs = 0;
  try { mtimeMs = fs.statSync(dir).mtimeMs; }
  catch { _archiveCache.set(dir, { mtimeMs: 0, items: new Map() }); return new Map(); }

  const cached = _archiveCache.get(dir);
  if (cached && cached.mtimeMs === mtimeMs) return cached.items;

  const items = new Map();
  let names = [];
  try { names = fs.readdirSync(dir); } catch { names = []; }
  for (const name of names) {
    if (!/^WS-.*\.ya?ml$/.test(name)) continue;
    let text = '';
    try { text = fs.readFileSync(path.join(dir, name), 'utf8'); } catch { continue; }
    const id = scalarField(text, 'id') || name.replace(/\.ya?ml$/, '');
    items.set(id, {
      id,
      // An archived item is done by convention; a live one must state its status.
      status: scalarField(text, 'status') || (source === 'archive' ? 'done' : 'unknown'),
      superseded_by: scalarField(text, 'superseded_by'),
      // Carried so a caller enumerating from this tier sees the gates themselves, not only
      // the answer to "is WS-x done". Without it the fallback could resolve one blocker by
      // id and still not know which items were waiting on it.
      blocked_by: listField(text, 'blocked_by'),
      _source: source,
    });
  }
  _archiveCache.set(dir, { mtimeMs, items });
  return items;
}

/** Every item under <workstreamDir>/queue/archive/. */
function loadArchivedQueueItems(workstreamDir) {
  const ws = workstreamDir || findWorkstreamDir();
  return loadQueueItemsFrom(path.join(ws, 'queue', 'archive'), 'archive');
}

/**
 * Every item under <workstreamDir>/queue/ (the LIVE directory, archive excluded).
 *
 * The bootstrap fallback for a checkout whose `state/queue.json` has not been materialized.
 * Carries the same three fields blocker resolution needs and nothing else — a caller that
 * wants the full record still goes through the state store.
 */
function loadLiveQueueItems(workstreamDir) {
  const ws = workstreamDir || findWorkstreamDir();
  return loadQueueItemsFrom(path.join(ws, 'queue'), 'live-yaml');
}

// ─── superseded_by index (WS-590) ───────────────────────────────────────────
//
// `superseded_by` is written by `cwos-item dismiss --superseded-by`, lives on
// the WS-*.yaml, and is projected NOWHERE: not into queue-index.yaml, not into
// state/queue.json (the reducer's ITEM_FIELDS list does not carry it). So a
// resolver reading only materialized state cannot see that WS-389 points at
// WS-432, which is precisely why five dependents stalled while their work had
// shipped.
//
// Read from source, scalar-only, and only when the live record actually needs
// it — the statuses below are the ones a supersede pointer can appear on, and
// they are rare (7 of 487 items on this repo). Everything else short-circuits
// before the index is ever built.
const SUPERSEDE_CANDIDATE_STATUSES = new Set([
  'dismissed', 'superseded', 'duplicate', 'deferred', 'cancelled', 'obsolete',
]);

const _supersedeCache = new Map(); // workstreamDir → { key, items: Map }

function loadSupersedeIndex(workstreamDir) {
  const ws = workstreamDir || findWorkstreamDir();
  const dirs = [path.join(ws, 'queue'), path.join(ws, 'queue', 'archive')];
  const key = dirs.map((d) => { try { return String(fs.statSync(d).mtimeMs); } catch { return '0'; } }).join('|');
  const cached = _supersedeCache.get(ws);
  if (cached && cached.key === key) return cached.items;

  const items = new Map();
  for (const dir of dirs) {
    let names = [];
    try { names = fs.readdirSync(dir); } catch { continue; }
    for (const name of names) {
      if (!/^WS-.*\.ya?ml$/.test(name)) continue;
      let text = '';
      try { text = fs.readFileSync(path.join(dir, name), 'utf8'); } catch { continue; }
      const sup = scalarField(text, 'superseded_by');
      if (!sup) continue;
      const id = scalarField(text, 'id') || name.replace(/\.ya?ml$/, '');
      if (!items.has(id)) items.set(id, sup);
    }
  }
  _supersedeCache.set(ws, { key, items });
  return items;
}

function clearArchiveCache() { _archiveCache.clear(); _supersedeCache.clear(); } // test-only

/**
 * Queue accessor: the base domain accessor plus the archive-aware blocker
 * resolution the dependency gate needs.
 */
function queueAccessor(rawGetter, workstreamDir) {
  const base = accessorFor('queue', rawGetter);
  const archived = () => loadArchivedQueueItems(workstreamDir);
  // accessorFor().byId rebuilds the whole domain index per call, which the old
  // done-set (built once, then O(1) hits) never paid. Memoize the live map on
  // the identity of the domain object so a full-queue gate sweep stays O(n).
  let _liveMemo = null;
  const liveById = (id) => {
    const raw = rawGetter();
    if (!_liveMemo || _liveMemo.raw !== raw) {
      _liveMemo = { raw, map: new Map(Object.entries(raw.items || {}).map(([, v]) => [v && v.id, v])) };
    }
    return _liveMemo.map.get(id) || base.byId(id);
  };
  // WS-744: the THIRD tier, and the reason it has to exist.
  //
  // `state/*.json` is GITIGNORED. In a fresh checkout — CI, a new node, a worktree — the
  // materialized queue is EMPTY until reconcile runs, so `liveById` misses every live item
  // and this lookup fell straight through to the archive and returned null. Every gate then
  // read as unresolvable-or-open and NOTHING was selectable, silently, in exactly the state
  // a new machine starts in. That is the WS-590 defect one layer down: a resolver blind to a
  // source that is sitting on disk.
  //
  // Deliberately scoped to LOOKUP, never to enumeration. `all()` and `byStatus()` keep
  // reading materialized state only, because a blocker resolution needs three scalars while a
  // caller iterating the domain expects the full record — serving a 3-field stub there would
  // be a partial wearing a whole record's clothes. The `_source` stamp says which tier
  // answered, so a caller can always tell.
  // Fires ONLY when the materialized domain is empty — an unmaterialized checkout, which is
  // a distinguishable condition — and never as a per-id patch over a populated one. A
  // populated domain that simply lacks an id means the item is archived or unknown, and
  // answering that from YAML would convert a legitimate not-found into a hit and mask exactly
  // the drift reconcile exists to surface. It also keeps the normal path at zero cost: with
  // state present nothing here reads the 519 live YAMLs.
  const liveYaml = (id) => {
    const raw = rawGetter();
    if (raw && raw.items && Object.keys(raw.items).length > 0) return null;
    return loadLiveQueueItems(workstreamDir).get(id) || null;
  };
  const lookup = (id) => {
    const live = liveById(id) || liveYaml(id);
    if (live) {
      const rec = Object.assign({ _source: live._source || 'live' }, live);
      // The reducer does not project `superseded_by`; fill it from source when
      // — and only when — the status says a pointer could be there.
      if (!rec.superseded_by && SUPERSEDE_CANDIDATE_STATUSES.has(rec.status)) {
        const sup = loadSupersedeIndex(workstreamDir).get(id);
        if (sup) rec.superseded_by = sup;
      }
      return rec;
    }
    return archived().get(id) || null;
  };
  return Object.assign({}, base, {
    archived: () => Array.from(archived().values()),
    /** Live first, then queue/archive/. Stamps `_source` on the hit. */
    lookupIncludingArchive: lookup,
    /** Follow one blocked_by pointer to a verdict + provenance. */
    resolveBlocker: (depId) => resolveBlocker(depId, lookup),
    /**
     * Resolve every gate on an item. Returns the verdict plus the two lists a
     * caller must act on differently: `open` (real, not-yet-done gates) and
     * `unresolvable` (data defects that must be reported by name, never
     * silently treated as "still blocked").
     */
    resolveGates: (item) => {
      const deps = Array.isArray(item && item.blocked_by) ? item.blocked_by : [];
      const resolutions = deps.map((d) => resolveBlocker(d, lookup));
      const open = resolutions.filter((r) => r.reason === 'gate-open');
      const unresolvable = resolutions.filter(isUnresolvableBlocker);
      return {
        clear: resolutions.every((r) => r.cleared),
        resolutions, open, unresolvable,
      };
    },
  });
}

function accessorFor(domainName, rawGetter) {
  const idxGetter = () => buildIndexes(domainName, rawGetter().items);
  return {
    all: () => Object.values(rawGetter().items || {}),
    byId: (id) => {
      const i = idxGetter();
      if (i.id && i.id.has(id)) return i.id.get(id)[0] || null;
      return i._byKey && i._byKey.has(id) ? i._byKey.get(id) : null;
    },
    byStatus: (status) => {
      const i = idxGetter();
      return (i.status && i.status.get(status)) || [];
    },
    byProgram: (program) => {
      const i = idxGetter();
      return (i.program && i.program.get(program)) || [];
    },
    bySeverity: (severity) => {
      const i = idxGetter();
      return (i.severity && i.severity.get(severity)) || [];
    },
    byTier: (tier) => {
      const i = idxGetter();
      return (i.tier && i.tier.get(tier)) || [];
    },
    byProgramFocus: (program) => {
      const i = idxGetter();
      return (i.program_focus && i.program_focus.get(program)) || [];
    },
    byCommandId: (cid) => {
      const i = idxGetter();
      return (i.command_id && i.command_id.get(cid) && i.command_id.get(cid)[0]) || null;
    },
  };
}

function envelopeAccessor(rawGetter) {
  const base = accessorFor('envelope', rawGetter);
  return Object.assign({}, base, {
    active: () => base.all().filter((e) => e && e.exit_status === undefined),
    recent: (n) => {
      const completed = base.all()
        .filter((e) => e && e.completed_at)
        .sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''));
      return completed.slice(0, n || 20);
    },
  });
}

function sprintsAccessor(rawGetter) {
  const base = accessorFor('sprints', rawGetter);
  return Object.assign({}, base, {
    active: () => base.all().filter((s) => s && s.status === 'approved'),
  });
}

function programsAccessor(rawGetter) {
  const base = accessorFor('programs', rawGetter);
  return Object.assign({}, base, {
    active: () => base.all().filter((p) => p && p.tier && p.tier !== 'dormant'),
  });
}

function sessionsAccessor(rawGetter) {
  const base = accessorFor('sessions', rawGetter);
  return Object.assign({}, base, {
    active: () => base.all().filter((s) => s && s.status === 'active'),
    recent: (n) => base.all()
      .filter((s) => s && s.ended_at)
      .sort((a, b) => (b.ended_at || '').localeCompare(a.ended_at || ''))
      .slice(0, n || 10),
  });
}

function configAccessor(rawGetter) {
  return {
    all: () => rawGetter().items || {},
    get: (key) => (rawGetter().items || {})[key],
  };
}

function enginesAccessor(rawGetter) {
  const base = accessorFor('engines', rawGetter);
  return Object.assign({}, base, {
    historyCount: (programId) => {
      const entry = base.byId(programId);
      return (entry && Array.isArray(entry.runs)) ? entry.runs.length : 0;
    },
  });
}

// ─── Stamp + atomic write + dispatch ──────────────────────────────────────

/**
 * WS-274: stamp current schema_version + last_event_log_head onto a
 * reducer-produced domain patch. Both _dispatch (live appends) and
 * replayToMemory (cwos-replay reconstruction) call this so the on-disk
 * shape is identical regardless of code path. Synchronous dispatch ⇒
 * the event being processed IS the log head at materialization time.
 */
function stampDomainPatch(domainState, eventId) {
  return Object.assign({}, domainState, {
    schema_version: SCHEMA_VERSION,
    last_event_log_head: eventId || domainState.last_event_log_head || null,
  });
}

function persistDomain(workstreamDir, domainName, domainFile) {
  const dir = stateDir(workstreamDir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${domainName}.json`);
  const content = JSON.stringify(domainFile, null, 2) + '\n';
  writeFileAtomic(file, content);
}

// Build a full stateStore instance bound to a workstreamDir + initial snapshot
function instance(workstreamDir, initialDomains) {
  let _domains = initialDomains;
  const api = {
    workstreamDir,
    get domains() { return _domains; },
    load() {
      _domains = {};
      for (const name of DEFAULT_DOMAINS) {
        const file = path.join(stateDir(workstreamDir), `${name}.json`);
        if (fs.existsSync(file)) {
          try { _domains[name] = JSON.parse(fs.readFileSync(file, 'utf8')); }
          catch { _domains[name] = emptyDomainFile(name); }
        } else {
          _domains[name] = emptyDomainFile(name);
        }
      }
      return api;
    },
    _rawState: () => _domains,
    dispatch(event, ctx) {
      return _dispatch(api, workstreamDir, _domains, event, ctx);
    },
    _replaceDomains(nextDomains) { _domains = nextDomains; },  // used by dispatch
  };
  // Install typed accessors on the instance
  api.envelope = envelopeAccessor(() => _domains.envelope || emptyDomainFile('envelope'));
  // WS-590: the queue accessor is archive-aware. `blocked_by` pointers resolve
  // against queue/archive/ and chase `superseded_by`; see resolveBlocker.
  api.queue    = queueAccessor(() => _domains.queue || emptyDomainFile('queue'), workstreamDir);
  api.findings = accessorFor('findings', () => _domains.findings || emptyDomainFile('findings'));
  api.sprints  = sprintsAccessor(() => _domains.sprints || emptyDomainFile('sprints'));
  api.programs = programsAccessor(() => _domains.programs || emptyDomainFile('programs'));
  api.sessions = sessionsAccessor(() => _domains.sessions || emptyDomainFile('sessions'));
  api.engines  = enginesAccessor(() => _domains.engines || emptyDomainFile('engines'));
  api.config   = configAccessor(() => _domains.config || emptyDomainFile('config'));
  return api;
}

function _dispatch(storeApi, workstreamDir, domains, event, ctx) {
  if (process.env[ENV_VAR_DISABLE] === '1') {
    return { ok: true, disabled: true, domainsChanged: [], errors: [] };
  }
  if (!event || typeof event !== 'object') {
    return { ok: false, errors: ['dispatch: event must be an object'] };
  }
  const track = event.source_track;
  const reducers = REDUCER_REGISTRY.get(track) || [];
  if (reducers.length === 0) {
    return { ok: true, domainsChanged: [], errors: [] };
  }

  const effectiveCtx = Object.assign({
    timestamp: event.timestamp,
    eventId: event.id,
    workstreamDir,
  }, ctx || {});

  const changed = new Set();
  const errors = [];
  const next = Object.assign({}, domains);

  for (const reducer of reducers) {
    let result;
    try {
      // Reducer signature: (event, allDomainsState, ctx) → patch
      // patch is { <domainName>: <newDomainFile>, ... } OR undefined
      result = reducer(event, next, effectiveCtx);
    } catch (err) {
      errors.push(`reducer threw: ${err.message}`);
      continue;
    }
    if (!result || typeof result !== 'object') continue;
    for (const [domainName, newDomainState] of Object.entries(result)) {
      if (!DEFAULT_DOMAINS.includes(domainName)) {
        errors.push(`reducer produced unknown domain: ${domainName}`);
        continue;
      }
      if (next[domainName] === newDomainState) continue; // no-op
      next[domainName] = stampDomainPatch(newDomainState, event.id);
      changed.add(domainName);
    }
  }

  // Persist each changed domain atomically
  for (const name of changed) {
    try { persistDomain(workstreamDir, name, next[name]); }
    catch (err) { errors.push(`persist ${name} failed: ${err.message}`); }
  }

  storeApi._replaceDomains(next);

  return { ok: errors.length === 0, domainsChanged: Array.from(changed), errors };
}

// ─── Singleton + lazy load ───────────────────────────────────────────────

let _singleton = null;
let _reducersAutoLoaded = false;

// Auto-load every reducer module under kit/scripts/core/reducers/*.js
// on first singleton access. This is how cwos-event.js (and any other
// in-process caller) picks up the registered reducers without needing
// to call cwos-replay's loadAllReducers explicitly. Test code that
// wants full control should call clearReducers() + resetSingleton()
// and register reducers manually.
function autoLoadReducers() {
  if (_reducersAutoLoaded) return;
  _reducersAutoLoaded = true;
  const reducerDir = path.join(__dirname, 'reducers');
  if (!fs.existsSync(reducerDir)) return;
  for (const f of fs.readdirSync(reducerDir)) {
    if (!f.endsWith('.js') || f.startsWith('_')) continue;
    try {
      const mod = require(path.join(reducerDir, f));
      if (mod && typeof mod.register === 'function') mod.register(registerReducer);
    } catch { /* skip broken reducer module */ }
  }
}

function getSingleton(workstreamDir) {
  autoLoadReducers();
  if (_singleton && (!workstreamDir || _singleton.workstreamDir === workstreamDir)) {
    return _singleton;
  }
  _singleton = loadState(workstreamDir);
  return _singleton;
}

function resetSingleton() { _singleton = null; _reducersAutoLoaded = false; } // test-only

module.exports = {
  SCHEMA_VERSION,
  ENV_VAR_DISABLE,
  ENV_VAR_LAG_THRESHOLD,
  LAG_THRESHOLD_DEFAULT,
  DEFAULT_DOMAINS,
  DOMAIN_INDEXES,
  REDUCER_REGISTRY,
  registerReducer,
  clearReducers,
  stateDir,
  emptyDomainFile,
  loadState,
  persistDomain,
  migrateStateSchema,
  compat,
  stampDomainPatch,
  resetSingleton,
  // WS-590: archive-aware blocker resolution. Exported as pure functions so
  // reconcile (which reads YAML directly, not the state cache) resolves gates
  // by the SAME algorithm /next does — two resolvers would drift, and a gate
  // that clears in one and not the other is the defect wearing a new coat.
  loadLiveQueueItems,
  BLOCKER_ID_SHAPE,
  MAX_SUPERSEDE_HOPS,
  UNRESOLVABLE_REASONS,
  isUnresolvableBlocker,
  resolveBlocker,
  loadArchivedQueueItems,
  loadSupersedeIndex,
  SUPERSEDE_CANDIDATE_STATUSES,
  clearArchiveCache,
  get stateStore() { return getSingleton(); },
  // Convenience: call stateStore.<method>() — the singleton auto-loads
  // lazily on first access.
};
