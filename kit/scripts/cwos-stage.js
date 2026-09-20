#!/usr/bin/env node
/**
 * cwos-stage.js — stage CLI: resolve tiers, compute re-tier diff, apply stage.
 *
 * Mirrors cwos-adopt-archetype.js architecture (subcommand dispatcher, JSON
 * output, surgical YAML patching that preserves comments).
 *
 * Subcommands:
 *   resolve  — emit tier map for (archetype, stage)
 *   re-tier  — compute per-program tier-change list between two stages
 *   apply    — patch .cwos-onboarding.yaml stage + emit stage event
 *
 * Usage:
 *   node kit/scripts/cwos-stage.js resolve --archetype A1..A5|NONE \
 *                                          --stage S?|N? [--overrides-file <p>]
 *
 *   node kit/scripts/cwos-stage.js re-tier --archetype <A?> \
 *                                          --from-stage <S?> --to-stage <S?> \
 *                                          [--target-dir <p>]
 *
 *   node kit/scripts/cwos-stage.js apply   --stage <S?> --target-dir <p> \
 *                                          [--reason "..."]
 *
 * Designed to be invoked by /stage command (kit/commands/stage.md).
 */

const fs = require('fs');
const path = require('path');
const { readYAMLFile, writeFileAtomic, loadEventDeps } = require('./lib/cwos-utils.js');
const tm = require('./lib/tier-mapper.js');

const { appendEvent, ensureCommandId } = loadEventDeps();

function readFlag(args, name) {
  const i = args.indexOf(`--${name}`);
  if (i < 0 || i === args.length - 1) return null;
  return args[i + 1];
}
function writeJson(obj) { process.stdout.write(JSON.stringify(obj, null, 2) + '\n'); }
function dieWith(code, msg) { process.stderr.write(`cwos-stage: ${msg}\n`); process.exit(code); }

function loadOverridesFromFile(p) {
  if (!p) return { programs: [], tiers: [] };
  if (!fs.existsSync(p)) dieWith(2, `overrides-file not found: ${p}`);
  const r = readYAMLFile(p);
  if (!r.ok) dieWith(2, `overrides-file parse failed: ${r.error}`);
  const data = r.data || {};
  const ao = data.archetype_overrides || data;
  return {
    programs: Array.isArray(ao.programs) ? ao.programs : [],
    tiers: Array.isArray(ao.tiers) ? ao.tiers : [],
    axes: (ao.axes && typeof ao.axes === 'object') ? ao.axes : {},
  };
}

function loadOnboarding(targetDir) {
  const p = path.join(targetDir, '.cwos-onboarding.yaml');
  if (!fs.existsSync(p)) dieWith(2, `apply: ${p} does not exist`);
  const r = readYAMLFile(p);
  if (!r.ok) dieWith(2, `cannot parse ${p}: ${r.error}`);
  return { path: p, raw: fs.readFileSync(p, 'utf8'), data: r.data || {} };
}

// Pull installed program list from .cwos-onboarding.yaml#archetype_bundle_resolved.programs.
// Falls back to deriving from archetype data (less accurate, doesn't reflect overrides).
function resolveInstalledPrograms(onboardingData, archetypeId, overrides) {
  const bundle = onboardingData.archetype_bundle_resolved || {};
  if (Array.isArray(bundle.programs) && bundle.programs.length > 0) {
    return tm.applyProgramOptOuts(bundle.programs, overrides);
  }
  // Fallback: derive from archetype axes + label_extras. Coordinates go
  // through resolveAxisCoordinates so a founder archetype_overrides.axes
  // value (WS-599) is honoured here exactly as in cwos-adopt-archetype —
  // these two walks must never disagree.
  const archetype = tm.findArchetype(archetypeId);
  const axes = (tm._internal.loadArchetypes() || {}).axes || {};
  const coords = tm.resolveAxisCoordinates(archetype, overrides);
  const programs = [];
  for (const axisName of ['output', 'sensitivity', 'verification']) {
    const v = coords[axisName];
    if (!v) continue;
    const axisDef = (axes[axisName] || {})[v] || {};
    if (Array.isArray(axisDef.programs)) programs.push(...axisDef.programs);
  }
  const extras = archetype.label_extras || {};
  if (Array.isArray(extras.programs)) programs.push(...extras.programs);
  const deduped = Array.from(new Set(programs));
  return tm.applyProgramOptOuts(deduped, overrides);
}

// ─── resolve ──────────────────────────────────────────────────────────────

function cmdResolve(args) {
  const archetype = readFlag(args, 'archetype');
  const stage = readFlag(args, 'stage');
  const overridesFile = readFlag(args, 'overrides-file');
  if (!archetype) dieWith(2, 'resolve: --archetype <A1..A5|NONE> required');
  if (!stage) dieWith(2, 'resolve: --stage <S1..S5|N1..N3> required');
  const overrides = loadOverridesFromFile(overridesFile);

  let programs;
  try {
    programs = resolveInstalledPrograms({}, archetype, overrides); // empty onboarding → derive from archetype
  } catch (e) { dieWith(2, `resolve failed: ${e.message}`); }

  let tiers;
  try {
    tiers = tm.mapTiers(archetype, stage, overrides, programs);
  } catch (e) { dieWith(2, `resolve mapTiers failed: ${e.message}`); }

  writeJson({ archetype, stage, programs, tiers, resolved_at: new Date().toISOString() });
}

// ─── re-tier ─────────────────────────────────────────────────────────────

function cmdReTier(args) {
  const archetype = readFlag(args, 'archetype');
  const fromStage = readFlag(args, 'from-stage');
  const toStage = readFlag(args, 'to-stage');
  const targetDir = readFlag(args, 'target-dir');
  if (!archetype) dieWith(2, 're-tier: --archetype <A?> required');
  if (!fromStage) dieWith(2, 're-tier: --from-stage <S?> required');
  if (!toStage) dieWith(2, 're-tier: --to-stage <S?> required');

  let overrides = { programs: [], tiers: [], axes: {} };
  let onboarding = null;
  if (targetDir) {
    onboarding = loadOnboarding(targetDir);
    if (onboarding.data.archetype_overrides) {
      const ao = onboarding.data.archetype_overrides;
      overrides = {
        programs: Array.isArray(ao.programs) ? ao.programs : [],
        tiers: Array.isArray(ao.tiers) ? ao.tiers : [],
        axes: (ao.axes && typeof ao.axes === 'object') ? ao.axes : {},
      };
    }
  }

  let programs;
  try {
    programs = resolveInstalledPrograms(onboarding ? onboarding.data : {}, archetype, overrides);
  } catch (e) { dieWith(2, `re-tier failed to resolve programs: ${e.message}`); }

  let fromTiers, toTiers;
  try {
    fromTiers = tm.mapTiers(archetype, fromStage, overrides, programs);
    toTiers = tm.mapTiers(archetype, toStage, overrides, programs);
  } catch (e) { dieWith(2, `re-tier mapTiers failed: ${e.message}`); }

  const tierRank = { dormant: 0, watch: 1, active: 2, critical: 3 };
  const changes = [];
  for (const pid of programs) {
    const from = fromTiers[pid] || 'dormant';
    const to = toTiers[pid] || 'dormant';
    const direction = (tierRank[to] || 0) > (tierRank[from] || 0) ? 'escalating'
                    : (tierRank[to] || 0) < (tierRank[from] || 0) ? 'de-escalating'
                    : 'staying';
    changes.push({ program_id: pid, from_tier: from, to_tier: to, direction });
  }

  writeJson({ archetype, from_stage: fromStage, to_stage: toStage, changes, computed_at: new Date().toISOString() });
}

// ─── apply ───────────────────────────────────────────────────────────────

function cmdApply(args) {
  const stage = readFlag(args, 'stage');
  const targetDir = readFlag(args, 'target-dir');
  const reason = readFlag(args, 'reason') || null;
  if (!stage) dieWith(2, 'apply: --stage <S?> required');
  if (!targetDir) dieWith(2, 'apply: --target-dir <p> required');

  const onboarding = loadOnboarding(targetDir);
  const priorStage = onboarding.data.stage || null;
  const archetype = onboarding.data.archetype || onboarding.data.declared_archetype || 'NONE';

  // Build tier-change list if we have a prior stage; otherwise empty.
  //
  // WS-597: a throw here is FATAL, before any state is touched — matching how
  // resolve and re-tier treat the identical calls. The bare catch this
  // replaces let a failed computation (missing kit/data, unknown archetype)
  // patch the stage anyway, print ok:true with tier_changes: [], and write
  // that empty list into the stage_declared event — a falsified audit record
  // indistinguishable from a genuine no-op transition. tier_basis makes the
  // legitimate empty cases distinguishable by output alone.
  let tierChanges = [];
  let tierBasis = !priorStage ? 'no-prior-stage'
    : archetype === 'NONE' ? 'archetype-none'
    : 'computed';
  if (tierBasis === 'computed') {
    try {
      const overrides = onboarding.data.archetype_overrides || { programs: [], tiers: [] };
      const programs = resolveInstalledPrograms(onboarding.data, archetype, overrides);
      const fromTiers = tm.mapTiers(archetype, priorStage, overrides, programs);
      const toTiers = tm.mapTiers(archetype, stage, overrides, programs);
      const tierRank = { dormant: 0, watch: 1, active: 2, critical: 3 };
      for (const pid of programs) {
        const from = fromTiers[pid] || 'dormant';
        const to = toTiers[pid] || 'dormant';
        if (from === to) continue;
        tierChanges.push({
          program_id: pid, from_tier: from, to_tier: to,
          direction: (tierRank[to] || 0) > (tierRank[from] || 0) ? 'escalating' : 'de-escalating',
        });
      }
    } catch (e) {
      dieWith(2, `apply: tier computation failed — ${e.message}. Stage NOT applied; .cwos-onboarding.yaml is untouched.`);
    }
  }

  // WS-598: MATERIALIZE the tier changes — prog-*.yaml#tier is what /pulse,
  // /audit and /next actually read; until this, apply's tier_changes list was
  // a statement of what WOULD have to happen, discharged only by an operator
  // who happened to know to run /pulse escalate per program afterward.
  //
  // Pre-validation runs BEFORE the onboarding patch (fail-before-mutate,
  // the WS-597 discipline applied to the second write): every INSTALLED
  // program must be mutable or nothing is written — all or none. A program
  // with no prog-*.yaml is 'not-installed' (bundle listed, never scaffolded):
  // nothing to enforce, reported, not an error — it takes its tier when
  // scaffolded.
  const targetProgramsDir = path.join(targetDir, '.claude', 'workstream', 'programs');
  // tier_changes program_ids arrive WITH the prog- prefix (bundle ids);
  // mutateProgramTier and the filenames want the bare id.
  const bareId = (id) => String(id).replace(/^prog-/, '');
  for (const c of tierChanges) {
    const progPath = path.join(targetProgramsDir, `prog-${bareId(c.program_id)}.yaml`);
    if (!fs.existsSync(progPath)) { c.materialized = 'not-installed'; continue; }
    const text = fs.readFileSync(progPath, 'utf8');
    if (!/^tier:\s*['"]?[a-z]+['"]?\s*$/m.test(text)) {
      dieWith(1, `apply: prog-${bareId(c.program_id)}.yaml has no mutable top-level 'tier:' line. NOTHING was written — fix the file, then re-run (all-or-none, WS-598).`);
    }
    c.materialized = 'pending';
  }

  // Patch .cwos-onboarding.yaml: stage + declared_stage only.
  // last_recorded_stage is owned by /session-end (set to current stage at session
  // close). /session-start Step 3d compares last_recorded_stage vs current stage
  // to detect cross-session founder changes — leaving last_recorded_stage alone
  // here preserves that signal.
  let patched = onboarding.raw;
  patched = patchScalarField(patched, 'stage', `"${stage}"`);
  patched = patchScalarField(patched, 'declared_stage', `"${stage}"`);
  writeFileAtomic(onboarding.path, patched);

  // Write phase. Pre-validation makes a mid-write failure the rare path; if
  // it happens anyway, name exactly what was written and how to repair.
  const toWrite = tierChanges.filter(c => c.materialized === 'pending');
  if (toWrite.length > 0) {
    let tm2;
    try { tm2 = require('./cwos-pulse'); } catch (e) {
      dieWith(1, `apply: stage patched but tier write path unavailable (${e.message}). Run /pulse escalate for: ${toWrite.map(c => `${c.program_id} ${c.to_tier}`).join(', ')}`);
    }
    const written = [];
    for (const c of toWrite) {
      const m = tm2.mutateProgramTier(bareId(c.program_id), c.to_tier, targetProgramsDir);
      if (!m.ok) {
        dieWith(1, `apply: tier write failed for ${c.program_id} (${m.reason}). Already written: ${written.join(', ') || 'none'}. Repair with /pulse escalate for the remainder.`);
      }
      c.materialized = true;
      written.push(c.program_id);
    }
    // Registry is derived state /next reads — same contract as /pulse escalate.
    const resync = tm2.resyncProgramRegistry(targetProgramsDir);
    if (resync && resync.error) {
      dieWith(1, `apply: tiers written but registry resync failed (${resync.error}). Run: node kit/scripts/cwos-program-registry-sync.js`);
    }

    // Per-program audit trail, in the TARGET repo's log: identical payload
    // shape to /pulse escalate's program_escalated, plus `via: 'stage-apply'`
    // — the one deliberate, documented difference (WS-598 criterion 3). The
    // ai-autonomous downgrade gate deliberately does NOT apply here: a stage
    // transition is a founder-approved declaration, so its de-escalations
    // carry founder authorization by construction. Non-fatal per AS-23 —
    // state is already materialized.
    try {
      const { appendEvent: rawAppend } = require('./core/events');
      const wsDirTarget = path.join(targetDir, '.claude', 'workstream');
      if (rawAppend && fs.existsSync(wsDirTarget)) {
        for (const c of toWrite) {
          rawAppend({
            source_track: 'T11:vital-signs',
            source_tier: 'founder-prompt',
            track_tag: '/stage',
            payload: {
              type: 'program_escalated',
              program_id: c.program_id,
              prior_tier: c.from_tier,
              new_tier: c.to_tier,
              authorized_by: 'founder',
              composed_by: 'cli-deterministic',
              emitted_at: new Date().toISOString().slice(0, 10),
              materialized: true,
              via: 'stage-apply',
            },
          }, { workstreamDir: wsDirTarget });
        }
      }
    } catch (_e) { /* audit-trail gap, surfaced by INV-052 if it matters; state is correct */ }
  }

  // Emit stage_declared event (non-fatal if event infrastructure absent).
  let eventId = null;
  if (appendEvent && ensureCommandId) {
    try {
      const commandId = ensureCommandId('stage-apply');
      const r = appendEvent({
        source_track: 'T6:workstream-stage',
        source_tier: 'founder-prompt',
        track_tag: '/stage',
        command_id: commandId,
        payload: {
          type: 'stage_declared',
          target_dir: targetDir,
          archetype,
          prior_stage: priorStage,
          new_stage: stage,
          tier_changes: tierChanges,
          tier_basis: tierBasis,
          reason,
          declared_at: new Date().toISOString(),
        },
      });
      if (r && r.ok && r.event) eventId = r.event.id;
    } catch (_e) {
      // Silence is correct HERE (reviewed, WS-597): the stage mutation has
      // already legitimately happened, and per AS-23 a shadow-event write must
      // never fail its host command — failing now would report a transition
      // that DID apply as failed, the inverse lie of the one this item fixed.
    }
  }

  // WS-322 Phase B: evaluate deferred-scope tripwires after stage transition.
  // Tripwires gated on milestone_reached or program_tier_change may fire here
  // (stage transitions don't directly map to milestones, but tier_changes
  // produced above can satisfy program_tier_change triggers).
  let tripwireResult = { unblocked: [], still_blocked: [], errors: [] };
  try {
    const { evaluateDeferredTriggers } = require('./lib/cwos-tripwires');
    const wsDir = path.join(targetDir, '.claude', 'workstream');
    if (fs.existsSync(wsDir)) {
      tripwireResult = evaluateDeferredTriggers(wsDir, targetDir);
    }
  } catch (e) {
    // Advisory, so still non-fatal — but not silent (WS-597): the errors
    // field already travels in the JSON output, so route the failure there.
    tripwireResult.errors.push(`tripwire evaluation failed: ${e.message}`);
  }

  writeJson({
    ok: true,
    target: onboarding.path,
    prior_stage: priorStage,
    new_stage: stage,
    archetype,
    tier_changes: tierChanges,
    tier_basis: tierBasis,
    tripwires: {
      unblocked_count: tripwireResult.unblocked.length,
      unblocked: tripwireResult.unblocked.map(u => ({ ws_id: u.ws_id, fired_because: u.fired_because })),
      still_blocked_count: tripwireResult.still_blocked.length,
      errors: tripwireResult.errors,
    },
    event_id: eventId,
  });
}

// ─── shared YAML patcher (mirrors cwos-adopt-archetype.js) ────────────────

function patchScalarField(text, field, value) {
  const re = new RegExp(`^(${field.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}:[ \\t]*)([^\\n#]*?)([ \\t]*(?:#[^\\n]*)?)$`, 'm');
  if (re.test(text)) return text.replace(re, `$1${value}$3`);
  return text;
}

// ─── entry ────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const sub = args[0];
  switch (sub) {
    case 'resolve':  return cmdResolve(args.slice(1));
    case 're-tier':  return cmdReTier(args.slice(1));
    case 'apply':    return cmdApply(args.slice(1));
    case '--help': case '-h': case undefined:
      process.stderr.write(
        'usage: cwos-stage <resolve|re-tier|apply> [options]\n' +
        '  resolve --archetype <A?> --stage <S?> [--overrides-file <p>]\n' +
        '  re-tier --archetype <A?> --from-stage <S?> --to-stage <S?> [--target-dir <p>]\n' +
        '  apply   --stage <S?> --target-dir <p> [--reason "..."]\n'
      );
      process.exit(sub === undefined ? 2 : 0);
      return;
    default: dieWith(2, `unknown subcommand: ${sub}`);
  }
}

if (require.main === module) main();

module.exports = { cmdResolve, cmdReTier, cmdApply, patchScalarField };
