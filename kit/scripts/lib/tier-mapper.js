/**
 * tier-mapper.js — shared library for archetype + stage + override tier resolution.
 *
 * Consumed by:
 *   - kit/scripts/cwos-adopt-archetype.js  (WS-250 — bundle resolver)
 *   - kit/scripts/cwos-stage.js            (WS-251, future — re-tier on stage transition)
 *   - kit/scripts/cwos-pulse.js            (future — health-recompute reads tier map)
 *   - kit/scripts/cwos-audit.js            (future — flag tier mismatches)
 *
 * Contracts (load-bearing):
 *   1. Pure functions. No filesystem writes. Reads only kit/data/{archetypes,stages}.yaml.
 *   2. Tier resolution order (later wins):
 *        stage default  →  archetype tier_overrides[stage]  →  founder archetype_overrides.tiers
 *      The founder override is final per ADR-035 Stage 4 condition #2.
 *      An opted-IN program takes the same three layers — there is no fourth
 *      mechanism; a founder who wants a specific tier pins it in `tiers`.
 *   3. Program override semantics (WS-599): status "opted-out" removes the
 *      program from the install set BEFORE tier mapping; status "opted-in"
 *      ADDS it. A valid opt-out's tier overrides are still silently
 *      discarded (founder may opt out then later opt back in).
 *   4. Malformed input throws — unknown archetype/stage IDs, an unknown
 *      `status:` value, an `override_tier` outside VALID_TIERS, and an
 *      unknown axis name/value in archetype_overrides.axes. This replaced
 *      silent-skip semantics (WS-599): `status: opted-in` was a no-op for
 *      months while the docs promised it worked, which is exactly the
 *      failure a loud error prevents. Caller decides whether to swallow.
 *   5. Axis coordinates resolve through resolveAxisCoordinates(): the
 *      archetype's grid cell overlaid with founder archetype_overrides.axes.
 *      The grid is a curated shortlist, not the only coordinate system —
 *      a repo can occupy a coordinate no archetype names (founder decision
 *      2026-08-07, WS-599: per-axis override chosen over minting A6).
 */

const fs = require('fs');
const path = require('path');
const { readYAMLFile } = require('./cwos-utils.js');

// WS-549: kit/data is distribution content and travels with this module.
const DATA_DIR = path.join(require('./kit-paths').resolveDistRoot(), 'kit', 'data');
const ARCHETYPES_PATH = path.join(DATA_DIR, 'archetypes.yaml');
const STAGES_PATH = path.join(DATA_DIR, 'stages.yaml');

const VALID_TIERS = new Set(['dormant', 'watch', 'active', 'critical']);

let _archetypesCache = null;
let _stagesCache = null;

function loadArchetypes() {
  if (_archetypesCache) return _archetypesCache;
  const r = readYAMLFile(ARCHETYPES_PATH);
  if (!r.ok) throw new Error(`tier-mapper: cannot read ${ARCHETYPES_PATH}: ${r.error}`);
  _archetypesCache = r.data || {};
  return _archetypesCache;
}

function loadStages() {
  if (_stagesCache) return _stagesCache;
  const r = readYAMLFile(STAGES_PATH);
  if (!r.ok) throw new Error(`tier-mapper: cannot read ${STAGES_PATH}: ${r.error}`);
  _stagesCache = r.data || {};
  return _stagesCache;
}

function clearCache() {
  _archetypesCache = null;
  _stagesCache = null;
}

function findArchetype(archetypeId) {
  const data = loadArchetypes();
  if (archetypeId === 'NONE' || archetypeId === 'default_no_archetype') {
    return data.default_no_archetype || { id: 'NONE', programs: [], engines: [], personas: [], tier_overrides: {} };
  }
  const list = Array.isArray(data.archetypes) ? data.archetypes : [];
  const found = list.find((a) => a && a.id === archetypeId);
  if (!found) throw new Error(`tier-mapper: unknown archetype "${archetypeId}"`);
  return found;
}

function findStage(stageId) {
  const data = loadStages();
  const commercial = Array.isArray(data.stages) ? data.stages : [];
  const nonCommercial = Array.isArray(data.non_commercial_stages) ? data.non_commercial_stages : [];

  const direct = commercial.find((s) => s && s.id === stageId);
  if (direct) return { stage: direct, source: 'commercial' };

  const nc = nonCommercial.find((s) => s && s.id === stageId);
  if (nc) {
    // Non-commercial stages map to commercial stage(s) for tier resolution.
    // Per stages.yaml#N2.rationale: when maps_to has multiple, take the LATER
    // stage to ensure full operating-tier protections.
    const mapsTo = Array.isArray(nc.maps_to) ? nc.maps_to : [];
    const targetId = mapsTo.length > 0 ? mapsTo[mapsTo.length - 1] : null;
    const target = targetId ? commercial.find((s) => s && s.id === targetId) : null;
    if (!target) throw new Error(`tier-mapper: non-commercial stage "${stageId}" maps_to "${targetId}" but commercial stage not found`);
    return { stage: target, source: 'non_commercial', original: nc };
  }

  throw new Error(`tier-mapper: unknown stage "${stageId}"`);
}

/**
 * stageDefaultTierFor(stage, programId) — pick the right per-stage default for a program.
 * Most programs use stage.archetype_default_tier. Stage-defined per-class overrides
 * (S3's archetype_compliance_tier, archetype_security_tier) apply to a fixed set.
 */
function stageDefaultTierFor(stage, programId) {
  const COMPLIANCE_PROGS = new Set(['prog-compliance', 'prog-vendor-risk']);
  const SECURITY_PROGS = new Set(['prog-security']);
  if (stage.archetype_compliance_tier && COMPLIANCE_PROGS.has(programId)) return stage.archetype_compliance_tier;
  if (stage.archetype_security_tier && SECURITY_PROGS.has(programId)) return stage.archetype_security_tier;
  return stage.archetype_default_tier || 'dormant';
}

/**
 * resolveAxisCoordinates(archetype, overrides) → { output?, sensitivity?, verification? }
 *
 * The archetype's grid cell overlaid with the founder's per-axis overrides
 * (`archetype_overrides.axes`). NONE has no axis_coordinates, so with axes
 * overrides it composes from the overrides alone — that IS the documented
 * no-archetype escape hatch ("founder declares per-axis values manually").
 *
 * Unknown axis names and unknown axis values throw: a typo'd "Regulated"
 * silently resolving to no consequences is the defect class this whole
 * item exists to remove.
 */
function resolveAxisCoordinates(archetype, overrides) {
  const data = loadArchetypes();
  const axes = (data.axes && typeof data.axes === 'object') ? data.axes : {};
  const coords = Object.assign({},
    (archetype && archetype.axis_coordinates && typeof archetype.axis_coordinates === 'object')
      ? archetype.axis_coordinates : {});

  const axisOverrides = (overrides && overrides.axes && typeof overrides.axes === 'object')
    ? overrides.axes : {};
  for (const [axisName, value] of Object.entries(axisOverrides)) {
    if (!axes[axisName]) {
      throw new Error(`tier-mapper: unknown axis "${axisName}" in archetype_overrides.axes (valid: ${Object.keys(axes).join(', ')})`);
    }
    if (!axes[axisName][value]) {
      throw new Error(`tier-mapper: unknown value "${value}" for axis "${axisName}" (valid: ${Object.keys(axes[axisName]).join(', ')})`);
    }
    coords[axisName] = value;
  }
  return coords;
}

/**
 * mapTiers(archetypeId, stageId, overrides, programIds) → { [programId]: tier }
 *
 * Resolution order (later wins):
 *   1. Stage default tier (per stage class: default / compliance / security)
 *   2. Archetype tier_overrides[stageId][programId]
 *   3. Founder archetype_overrides.tiers[].program_id match
 */
function mapTiers(archetypeId, stageId, overrides, programIds) {
  if (!Array.isArray(programIds)) throw new Error('tier-mapper: programIds must be an array');
  const archetype = findArchetype(archetypeId);
  const { stage } = findStage(stageId);

  const archetypeOverrides = (archetype.tier_overrides && typeof archetype.tier_overrides === 'object') ? archetype.tier_overrides : {};
  const founderTierOverrides = (overrides && Array.isArray(overrides.tiers)) ? overrides.tiers : [];
  const founderByProg = {};
  for (const t of founderTierOverrides) {
    if (!t || typeof t !== 'object' || !t.program_id) continue;
    if (!VALID_TIERS.has(t.override_tier)) {
      throw new Error(`tier-mapper: invalid override_tier "${t.override_tier}" for ${t.program_id} (valid: ${[...VALID_TIERS].join(', ')})`);
    }
    founderByProg[t.program_id] = t.override_tier;
  }

  const out = {};
  for (const progId of programIds) {
    let tier = stageDefaultTierFor(stage, progId);

    const archProgOverrides = archetypeOverrides[progId];
    if (archProgOverrides && typeof archProgOverrides === 'object' && archProgOverrides[stageId]) {
      tier = archProgOverrides[stageId];
    } else if (archProgOverrides && typeof archProgOverrides === 'object' && stage.id !== stageId) {
      // stageId may be N2 mapping to S4 — also check the original stageId key.
      if (archProgOverrides[stage.id]) tier = archProgOverrides[stage.id];
    }

    if (founderByProg[progId]) tier = founderByProg[progId];
    out[progId] = tier;
  }
  return out;
}

/**
 * applyProgramOptOuts(programIds, overrides) → filteredProgramIds
 *
 * status "opted-out" removes the program; status "opted-in" ADDS it (WS-599 —
 * docs/ARCHETYPES.md promised opt-in since WS-253 and a founder following
 * them got a silent no-op). Any other status value throws: unknown statuses
 * being silently ignored is exactly how that no-op stayed invisible.
 * An opted-out programId not in the input set remains silently ignored.
 */
function applyProgramOptOuts(programIds, overrides) {
  if (!Array.isArray(programIds)) return [];
  const optOuts = new Set();
  const optIns = [];
  if (overrides && Array.isArray(overrides.programs)) {
    for (const p of overrides.programs) {
      if (!p || typeof p !== 'object' || !p.id) continue;
      if (p.status === 'opted-out') optOuts.add(p.id);
      else if (p.status === 'opted-in') optIns.push(p.id);
      else {
        throw new Error(`tier-mapper: unknown status "${p.status}" for ${p.id} in archetype_overrides.programs (valid: opted-out, opted-in)`);
      }
    }
  }
  const kept = programIds.filter((id) => !optOuts.has(id));
  for (const id of optIns) {
    if (!kept.includes(id) && !optOuts.has(id)) kept.push(id);
  }
  return kept;
}

/**
 * applyTierOverrides(tierMap, overrides) → tierMap
 *
 * Pure overlay of founder overrides on an existing tier map. Provided as a
 * standalone helper for callers that already have a tier map and want to
 * apply overrides without re-resolving from archetype/stage data.
 */
function applyTierOverrides(tierMap, overrides) {
  const out = Object.assign({}, tierMap || {});
  if (!overrides || !Array.isArray(overrides.tiers)) return out;
  for (const t of overrides.tiers) {
    if (!t || typeof t !== 'object' || !t.program_id) continue;
    if (!VALID_TIERS.has(t.override_tier)) {
      throw new Error(`tier-mapper: invalid override_tier "${t.override_tier}" for ${t.program_id} (valid: ${[...VALID_TIERS].join(', ')})`);
    }
    if (out[t.program_id] !== undefined) out[t.program_id] = t.override_tier;
  }
  return out;
}

module.exports = {
  mapTiers,
  applyProgramOptOuts,
  applyTierOverrides,
  resolveAxisCoordinates,
  findArchetype,
  findStage,
  stageDefaultTierFor,
  clearCache,
  // Exposed for cwos-adopt-archetype.js and tests.
  _internal: { loadArchetypes, loadStages },
};
