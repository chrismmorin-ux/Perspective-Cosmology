#!/usr/bin/env node
/**
 * cwos-genesis-ignite.js — Ignition engine for /intend (WS-321 Phase C).
 *
 * Reads dormant-mode capture buffer + intention.md, proposes a full bundle
 * (archetype, stage, programs, invariants, constraints, seed work items),
 * gates on founder approval, and applies the bundle to flip adoption_phase
 * from M0 to M1. Generative, not interrogative — founder approves/edits
 * the whole bundle in one shot, not 17 questions.
 *
 * Subcommands:
 *   propose --target-dir <p> [--archetype-hint A?] [--out json|markdown]
 *           Pure-function generator. No side effects.
 *   apply   --target-dir <p> --proposal-file <p> --exit-trigger <trigger>
 *           [--homebase <p>] [--capabilities <list>] [--repo-archetype <tag>]
 *           [--no-fleet-register] [--skip-m1-install]
 *           Orchestrates the bundle install: proposal bundle → archetype_overrides,
 *           cwos-adopt-archetype.js apply, the standard M1 install
 *           (cwos-adopt-install.js + install-claude-hooks.mjs), prog-*.yaml copy
 *           at their resolved tiers, adoption_phase flip, system/*.md appends,
 *           queue seed, genesis_ignition_consumed envelope event. When the
 *           install cannot run, the result carries next_commands (WS-1112).
 *   validate --target-dir <p>
 *           Preconditions: adoption_phase==M0, intention.md non-placeholder
 *           OR buffer non-empty, no prior ignition.
 *
 * Design refs: ADR-046 (genesis + dormant), ADR-047 (intention trigger),
 * WS-321 spec, plan at .claude/plans/elegant-wobbling-breeze.md.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, spawnSync } = require('child_process');
const { readYAMLFile, writeFileAtomic, todayISO, makeEventEmitter, blockScalarLines } = require('./lib/cwos-utils');

const emitEvent = makeEventEmitter();
const { resolveBundle } = require('./cwos-adopt-archetype');
const { cliGate } = require('./lib/cli');

// WS-549: every path below is kit/data, kit/templates or kit/scripts — all
// content the kit ships, so it resolves from the distribution.
const KIT_ROOT = require('./lib/kit-paths').resolveDistRoot();
const { systemPath } = require('./lib/kit-artifacts');
const ARCHETYPES_PATH = path.join(KIT_ROOT, 'kit', 'data', 'archetypes.yaml');
const STAGES_PATH = path.join(KIT_ROOT, 'kit', 'data', 'stages.yaml');
const GENESIS_SPRINTS_DIR = path.join(KIT_ROOT, 'kit', 'data', 'genesis-sprints');
const PROGRAM_TEMPLATES_DIR = path.join(KIT_ROOT, 'kit', 'templates', 'workstream', 'programs');

// ─── CLI helpers ────────────────────────────────────────────────────────────

function readFlag(args, name) {
  const i = args.indexOf(`--${name}`);
  if (i < 0 || i === args.length - 1) return null;
  return args[i + 1];
}

function dieWith(code, msg) {
  process.stderr.write(`cwos-genesis-ignite: ${msg}\n`);
  process.exit(code);
}

function writeJson(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

function nowISO() { return new Date().toISOString(); }

function sha256OfNonCommentContent(text) {
  const stripped = text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^\s*$/gm, '')
    .trim();
  return crypto.createHash('sha256').update(stripped, 'utf8').digest('hex');
}

// ─── Inputs ─────────────────────────────────────────────────────────────────

function loadOnboarding(targetDir) {
  const p = path.join(targetDir, '.cwos-onboarding.yaml');
  if (!fs.existsSync(p)) dieWith(2, `${p} does not exist — is this a CWOS repo?`);
  const r = readYAMLFile(p);
  if (!r.ok) dieWith(2, `cannot parse ${p}: ${r.error}`);
  return { path: p, raw: fs.readFileSync(p, 'utf8'), data: r.data || {} };
}

function loadIntention(targetDir) {
  // systemPath honours paths.system_dir; the second entry is a fixed probe for
  // the pre-declaration .cwos/ layout, not a search. Verified 2026-09-08: zero
  // of the 5 repos on this node carry it, so it is legacy tolerance only.
  const candidates = [
    systemPath(targetDir, 'intention.md'),
    path.join(targetDir, '.cwos', 'system', 'intention.md'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return { path: p, content: fs.readFileSync(p, 'utf8') };
  }
  return null;
}

// Read all T20:capture-buffer events from the events log.
function loadCaptureBuffer(targetDir) {
  const eventsPath = path.join(targetDir, '.claude', 'workstream', 'events', 'current.jsonl');
  if (!fs.existsSync(eventsPath)) return [];
  const events = [];
  try {
    const content = fs.readFileSync(eventsPath, 'utf8');
    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      try {
        const ev = JSON.parse(line);
        if (ev.source_track === 'T20:capture-buffer') events.push(ev);
      } catch { /* skip bad line */ }
    }
  } catch { /* skip */ }
  return events;
}

// Has ignition already been consumed for this repo?
function hasIgnitionConsumed(targetDir) {
  const eventsPath = path.join(targetDir, '.claude', 'workstream', 'events', 'current.jsonl');
  if (!fs.existsSync(eventsPath)) return false;
  try {
    const content = fs.readFileSync(eventsPath, 'utf8');
    return content.includes('genesis_ignition_consumed');
  } catch { return false; }
}

// ─── Inference ──────────────────────────────────────────────────────────────

function loadArchetypesData() {
  const r = readYAMLFile(ARCHETYPES_PATH);
  if (!r.ok) dieWith(2, `cannot parse ${ARCHETYPES_PATH}: ${r.error}`);
  return r.data;
}

function loadStagesData() {
  const r = readYAMLFile(STAGES_PATH);
  if (!r.ok) dieWith(2, `cannot parse ${STAGES_PATH}: ${r.error}`);
  return r.data;
}

// Extract Principles section bullets from intention.md (or empty array if
// section is missing or only contains placeholder).
// Lines wrapped in single underscores (e.g., `_"Example principle"_`) are
// template example content, NOT real founder content. The intention.md
// template uses italic wrapping for guidance/examples; we treat those as
// placeholders alongside literal `_placeholder_` markers.
function isPlaceholderBullet(rawText) {
  const t = rawText.trim();
  if (!t) return true;
  if (/placeholder/i.test(t)) return true;
  // Italic-wrapped (single underscores at both ends) — template example.
  if (/^_[^_].*[^_]_$/.test(t) || t === '_placeholder_') return true;
  return false;
}

function extractPrinciples(intentionContent) {
  if (!intentionContent) return [];
  const sectionMatch = intentionContent.match(/##\s+Principles\s*\n([\s\S]*?)(?=\n##\s|\n---|$)/);
  if (!sectionMatch) return [];
  const body = sectionMatch[1];
  const bullets = [];
  for (const line of body.split('\n')) {
    const m = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!m) continue;
    if (isPlaceholderBullet(m[1])) continue;
    let text = m[1].replace(/^_+|_+$/g, '').trim();
    if (text.startsWith('"') && text.endsWith('"')) text = text.slice(1, -1);
    bullets.push(text);
  }
  return bullets;
}

function extractAntiGoals(intentionContent) {
  if (!intentionContent) return [];
  const sectionMatch = intentionContent.match(/##\s+Anti-goals\s*\n([\s\S]*?)(?=\n##\s|\n---|$)/);
  if (!sectionMatch) return [];
  const body = sectionMatch[1];
  const bullets = [];
  for (const line of body.split('\n')) {
    const m = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!m) continue;
    if (isPlaceholderBullet(m[1])) continue;
    let text = m[1].replace(/^_+|_+$/g, '').trim();
    bullets.push(text);
  }
  return bullets;
}

function extractImaginedOutcome(intentionContent) {
  if (!intentionContent) return null;
  const sectionMatch = intentionContent.match(/##\s+Imagined Outcome\s*\n([\s\S]*?)(?=\n##\s|\n---|$)/);
  if (!sectionMatch) return null;
  const body = sectionMatch[1].trim();
  const realLines = body.split('\n').filter(l => {
    const t = l.trim();
    if (!t) return false;
    if (t.startsWith('#')) return false;
    if (/placeholder/i.test(t)) return false;
    // Italic-wrapped paragraphs are template examples (the template uses
    // italics liberally for guidance text). Only paragraphs without italic
    // wrapping count as real founder content.
    if (t.startsWith('_') && t.endsWith('_')) return false;
    return true;
  });
  if (realLines.length === 0) return null;
  return truncateAtWord(realLines.join(' '), IMAGINED_OUTCOME_MAX);
}

// WS-1112 (f): the Imagined Outcome used to be cut at exactly 600 chars,
// mid-word. Cut at the last word boundary that fits, and mark the cut.
const IMAGINED_OUTCOME_MAX = 600;
function truncateAtWord(text, max) {
  const s = String(text || '');
  if (s.length <= max) return s;
  const head = s.slice(0, max);
  const lastSpace = head.search(/\s\S*$/);
  // A single word longer than max has no boundary: hard cut, still marked.
  const endsOnWord = /\s/.test(s[max]);
  const cut = endsOnWord || lastSpace <= 0 ? head : head.slice(0, lastSpace);
  return `${cut.trimEnd()}…`;
}

// Score each archetype by counting prompt-keyword matches against the
// intention.md Principles bullets and capture-buffer summaries. Tie-break to A3.
function inferArchetype(archetypesData, principles, captureSummaries) {
  const archetypes = archetypesData.archetypes || [];
  const haystack = [
    ...principles,
    ...captureSummaries,
  ].join(' ').toLowerCase();

  const scores = new Map();
  for (const a of archetypes) {
    const prompts = (a.label_extras && a.label_extras.prompts) || [];
    let hits = 0;
    for (const prompt of prompts) {
      const tokens = prompt.toLowerCase().split(/\s+/).filter(t => t.length >= 4);
      for (const tok of tokens) {
        if (haystack.includes(tok)) hits += 1;
      }
    }
    if (hits > 0) scores.set(a.id, hits);
  }

  if (scores.size === 0) {
    return { archetype: 'A3', rationale: 'No keyword hits across archetype prompts; defaulting to A3 (Real-time consumer app) per ADR-047 tie-break rule.' };
  }

  const sorted = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
  const topScore = sorted[0][1];
  const tied = sorted.filter(([, s]) => s === topScore).map(([id]) => id);
  if (tied.includes('A3')) {
    return { archetype: 'A3', rationale: `A3 selected (score ${topScore}) — tied entries: ${tied.join(', ')}; A3 wins tie-break.` };
  }
  return { archetype: tied[0], rationale: `${tied[0]} selected (score ${topScore}, no tie).` };
}

function inferStage(stagesData, archetype) {
  const entry = stagesData.archetype_entry_stages || {};
  const raw = entry[archetype] || entry.default_no_archetype || 'S1';
  // CWOS YAML parser doesn't strip inline comments; the source file uses
  // `A3: S1   # ...` syntax, so the value comes back with the comment
  // appended. Strip everything from the first `#` onward and trim.
  return String(raw).split('#')[0].trim();
}

// Load the per-archetype ignition template (kit/data/genesis-sprints/<arch>.yaml).
function loadIgnitionTemplate(archetype) {
  const p = path.join(GENESIS_SPRINTS_DIR, `${archetype}.yaml`);
  if (!fs.existsSync(p)) return null;
  const r = readYAMLFile(p);
  if (!r.ok) return null;
  return r.data;
}

// ─── Trigger inference (WS-322 Phase A) ────────────────────────────────────
//
// Maps an anti-goal text string to a structured re_eval_trigger. The trigger
// gates a deferred-scope WS item — when the trigger condition fires (archetype
// migration, milestone advance, program tier change, fleet event), the item
// becomes eligible and surfaces in /pulse for re-evaluation.
//
// The shape of re_eval_trigger:
//   {
//     type: "archetype_migration" | "milestone_reached" | "program_tier_change" | "fleet_event",
//     target: <type-specific value — e.g., "A3" for archetype_migration, "M3" for milestone_reached>,
//     rationale: <plain-language explanation of why this trigger>,
//     set_at: <ISO timestamp when the trigger was inferred / set>
//   }
//
// Heuristic confidence: this is a "best effort at ignition time" map. Founder
// can edit any inferred trigger by editing the proposal JSON before approving
// (option 2 in /intend approval gate). Bias toward sensible defaults that are
// easy to recognize as wrong, not toward hidden cleverness.
function inferTriggerFromAntiGoal(antiGoalText) {
  const t = String(antiGoalText || '').toLowerCase();
  const now = nowISO();

  // WS-1112 (b): a permanent prohibition ("never sell user data") is not
  // deferred scope. Explicit permanence wording wins over every scope signal
  // below, so it never comes back at M3 as a build / re-defer / abandon ask.
  if (PERMANENT_WORDING.test(t)) return neverTrigger(now);

  // Webapp / UX / interface / mobile — A3 (real-time consumer app) territory.
  // Word-prefix matches (no trailing \b) so "webapp" / "frontend" are caught.
  if (/\b(webapp|web app|ui surface|ux surface|user interface|mobile app|consumer app|frontend|front-end)\b/.test(t)) {
    return {
      type: 'archetype_migration',
      target: 'A3',
      rationale: 'Anti-goal mentions UX/webapp/consumer surface — A3 archetype migration is the natural trigger for re-evaluating this scope.',
      set_at: now,
    };
  }

  // Commercializ-, paying customer, monetiz-, billing — A1 (regulated commercial) territory.
  // Word-prefix matches: \w* allows "commercializing" / "monetization" etc.
  if (/\bcommercializ\w*|\bpaying customer|\bmonetiz\w*|\bbilling\b|\bpaywall\b|\bsubscription\b|\bpayment\b/.test(t)) {
    return {
      type: 'archetype_migration',
      target: 'A1',
      rationale: 'Anti-goal mentions commercialization / paying customers — A1 archetype migration is the trigger.',
      set_at: now,
    };
  }

  // Self-modifying tool / kit distribution — A5 territory.
  if (/\bself-modifying\b|\bkit distribution\b|\bfleet propagation\b|\bpublic api\b/.test(t)) {
    return {
      type: 'archetype_migration',
      target: 'A5',
      rationale: 'Anti-goal mentions self-modification or kit distribution — A5 archetype migration is the trigger.',
      set_at: now,
    };
  }

  // Falsifiable claims / research framework — A4 territory.
  if (/\bfalsifiab\w*|\bresearch framework\b|\bclaims-policy\b|\badversarial review\b|\bevidence tier\b/.test(t)) {
    return {
      type: 'archetype_migration',
      target: 'A4',
      rationale: 'Anti-goal mentions research-framework / falsifiability — A4 archetype migration is the trigger.',
      set_at: now,
    };
  }

  // Generic "in v1" / "for now" / "this version" — milestone-based fallback.
  if (/\b(v1|version 1|for now|this version|first pass|initial release|mvp)\b/.test(t)) {
    return {
      type: 'milestone_reached',
      target: 'M3',
      rationale: 'Anti-goal phrased as v1-deferral with no specific archetype signal — defaulting to M3 (workstream-active, sprint composer running) as the natural re-eval point.',
      set_at: now,
    };
  }

  // Default fallback: M3 milestone, low-confidence trigger.
  return {
    type: 'milestone_reached',
    target: 'M3',
    rationale: 'No specific trigger signal in anti-goal text; defaulting to M3 milestone as a generic re-eval point. Founder should edit if a more specific trigger applies.',
    set_at: now,
    confidence: 'low',
  };
}

// ─── WS-1112 (b), (c): what an anti-goal is, and when it is permanent ───────
//
// (c) ONE rule, used by the markdown renderer and by apply's tripwire step:
// a constraint is an anti-goal when it came from intention.md's Anti-goals
// section, or when the proposal gives it a trigger or an anti-goal class (an
// /intend option-2 edit can add either to any constraint). The renderer used
// to test "has a trigger" and apply "source text matches", so an edit that
// removed or added a trigger showed one list and wrote another.
//
// (b) An anti-goal is permanent when its class is "never" or its trigger type
// is "never". It still gets a deferred-scope item (the record of the ruling),
// but its trigger never fires (lib/cwos-tripwires.js) and the item asks no
// build / re-defer / abandon question.

const PERMANENT_WORDING = /\bnever\b|\bunder no circumstances\b|\bat no point\b|\bpermanent(ly)?\b/;

function neverTrigger(now) {
  return {
    type: 'never',
    target: 'none',
    rationale: 'Permanent anti-goal: no state change re-opens it. Lifting it is a founder decision, recorded in decisions.md.',
    set_at: now || nowISO(),
  };
}

function isPermanentAntiGoal(c) {
  return Boolean(c) && (c.class === 'never' || Boolean(c.trigger && c.trigger.type === 'never'));
}

function isAntiGoal(c) {
  if (!c || typeof c !== 'object') return false;
  return /intention\.md Anti-goals/.test(String(c.source || '')) || Boolean(c.trigger) || isPermanentAntiGoal(c);
}

/** The trigger an anti-goal is written with: never for a permanent one, else its own or the inferred one. */
function antiGoalTrigger(c) {
  const text = (c && (c.text || c.rule || c.rationale) || '').toString().trim();
  if (c && c.class === 'never') return neverTrigger(c.trigger && c.trigger.set_at);
  return (c && c.trigger) || inferTriggerFromAntiGoal(text);
}

function antiGoalsOf(constraints) {
  return (Array.isArray(constraints) ? constraints : []).filter(isAntiGoal);
}

// ─── Subcommand: validate ───────────────────────────────────────────────────

// WS-377: minimum hours between /genesis and /intend ignition. Catches the
// Nutrition-class "same-day ignition against placeholder intention" failure.
// Founder override: --force flag bypasses the gate.
const IGNITION_MIN_HOURS = 12;

function hoursSince(isoTimestamp) {
  if (!isoTimestamp) return null;
  const t = Date.parse(isoTimestamp);
  if (Number.isNaN(t)) return null;
  return (Date.now() - t) / 3600000;
}

function cmdValidate(args) {
  const targetDir = readFlag(args, 'target-dir');
  if (!targetDir) dieWith(2, 'validate: --target-dir required');
  const force = args.includes('--force');
  const target = path.resolve(targetDir);

  const onb = loadOnboarding(target);
  const phase = onb.data.adoption_phase;

  const result = { ok: true, errors: [], warnings: [] };

  if (phase !== 'M0') {
    result.errors.push(`adoption_phase is "${phase}" (expected M0). Already-ignited repos cannot re-ignite — use /checkpoint or /archetype re instead.`);
  }

  if (hasIgnitionConsumed(target)) {
    result.errors.push('genesis_ignition_consumed event already present in event log — ignition has run.');
  }

  const intention = loadIntention(target);
  const principles = intention ? extractPrinciples(intention.content) : [];
  const buffer = loadCaptureBuffer(target);
  const hasIntentionContent = principles.length > 0 || extractAntiGoals(intention ? intention.content : '').length > 0 || extractImaginedOutcome(intention ? intention.content : '');
  const hasBuffer = buffer.length > 0;
  if (!hasIntentionContent && !hasBuffer) {
    result.errors.push('write at least one paragraph in intention.md or drop one file in system/ — capture buffer is empty and intention.md is still placeholder.');
  }

  // WS-377 temporal/content gate: even if there's "some" content, refuse to
  // ignite if intention.md still has the placeholder hash AND less than
  // IGNITION_MIN_HOURS have elapsed since scaffold. This catches the
  // Nutrition class where /genesis and /intend ran the same day against a
  // placeholder. Override with --force (for sim and explicit founder intent).
  const m0 = onb.data && onb.data.m0_dormant ? onb.data.m0_dormant : {};
  const placeholderHash = m0.intention_content_hash || null;
  const enteredAt = m0.entered_at || null;
  const currentHash = intention ? sha256OfNonCommentContent(intention.content) : null;
  const hashUnchanged = placeholderHash && currentHash && placeholderHash === currentHash;
  const hours = hoursSince(enteredAt);
  const underMinHours = hours != null && hours < IGNITION_MIN_HOURS;

  if (hashUnchanged && underMinHours && !force) {
    const h = hours.toFixed(1);
    result.errors.push(
      `Genesis ran ${h}h ago and intention.md is still the placeholder template ` +
      `(content hash unchanged from scaffold). Edit system/intention.md with your ` +
      `declared goal, anti-goals, and constraints, then re-run /intend. ` +
      `(Use --force to override for testing.)`
    );
  } else if (hashUnchanged && !force) {
    // Hash unchanged but past min-hours window — warn rather than block.
    result.warnings.push(
      'intention.md content hash is unchanged from the /genesis placeholder. ' +
      'Ignition is proceeding because more than 12h have elapsed, but the founder ' +
      'has not edited intention.md — programs may be scoped to placeholders. ' +
      'Consider editing intention.md before continuing.'
    );
  }

  result.ok = result.errors.length === 0;
  result.checks = {
    adoption_phase: phase,
    intention_has_content: hasIntentionContent,
    buffer_event_count: buffer.length,
    ignition_already_consumed: hasIgnitionConsumed(target),
    intention_hash_unchanged: hashUnchanged,
    hours_since_genesis: hours,
    force_override: force,
  };
  writeJson(result);
  if (!result.ok) process.exit(1);
}

// ─── Subcommand: propose ────────────────────────────────────────────────────

function cmdPropose(args) {
  const targetDir = readFlag(args, 'target-dir');
  if (!targetDir) dieWith(2, 'propose: --target-dir required');
  const target = path.resolve(targetDir);
  const archetypeHint = readFlag(args, 'archetype-hint');
  const out = readFlag(args, 'out') || 'json';

  // Load inputs
  const onb = loadOnboarding(target);
  if (onb.data.adoption_phase !== 'M0') {
    dieWith(3, `adoption_phase is "${onb.data.adoption_phase}" — propose only runs in M0`);
  }
  const intention = loadIntention(target);
  const buffer = loadCaptureBuffer(target);
  const archetypesData = loadArchetypesData();
  const stagesData = loadStagesData();

  const principles = intention ? extractPrinciples(intention.content) : [];
  const antiGoals = intention ? extractAntiGoals(intention.content) : [];
  const imaginedOutcome = intention ? extractImaginedOutcome(intention.content) : null;
  const captureSummaries = buffer
    .filter(ev => ev.track_tag === 'conversation_summary')
    .map(ev => (ev.payload && ev.payload.summary_text) || '');
  const implicitDecisions = buffer
    .filter(ev => ev.track_tag === 'implicit_decision')
    .map(ev => (ev.payload && ev.payload.decision_text) || '')
    .filter(Boolean);

  // Inference
  const inferred = archetypeHint
    ? { archetype: archetypeHint, rationale: `Founder-supplied --archetype-hint=${archetypeHint}.` }
    : inferArchetype(archetypesData, principles, captureSummaries);
  const archetype = inferred.archetype;
  const stage = inferStage(stagesData, archetype);

  // Bundle resolution (reuses cwos-adopt-archetype.resolveBundle)
  const bundle = resolveBundle(archetype, stage, { programs: [], tiers: [] });

  // Ignition template
  const tmpl = loadIgnitionTemplate(archetype);

  // Compose proposal
  const invariants = [];
  for (const p of principles) {
    invariants.push({ source: 'intention.md Principles', text: p });
  }
  if (tmpl && Array.isArray(tmpl.initial_invariants_checklist)) {
    for (const iv of tmpl.initial_invariants_checklist) {
      invariants.push({
        source: `genesis-sprints/${archetype}.yaml`,
        id_hint: iv.id_hint,
        rule: iv.rule,
        rationale: iv.rationale,
        severity: iv.severity || 'medium',
      });
    }
  }

  const constraints = [];
  for (const ag of antiGoals) {
    // WS-322 Phase A: anti-goals get an inferred re_eval_trigger so apply can
    // emit them as deferred-scope tripwires. Founder edits the trigger in the
    // proposal JSON before approving if the inference is wrong.
    // WS-1112 (b): class "never" marks a permanent anti-goal; the founder can
    // set or clear it in the proposal JSON like the trigger.
    const trigger = inferTriggerFromAntiGoal(ag);
    constraints.push({
      source: 'intention.md Anti-goals',
      text: ag,
      ...(trigger.type === 'never' ? { class: 'never' } : {}),
      trigger,
    });
  }
  if (tmpl && Array.isArray(tmpl.initial_constraints_checklist)) {
    for (const c of tmpl.initial_constraints_checklist) {
      constraints.push({ source: `genesis-sprints/${archetype}.yaml`, text: c.text, rationale: c.rationale });
    }
  }

  const decisions = implicitDecisions.map(d => ({ source: 'capture-buffer.implicit_decision', text: d }));

  const seedItems = [];
  if (tmpl && Array.isArray(tmpl.seed_work_items)) {
    for (const item of tmpl.seed_work_items) {
      seedItems.push({
        title: item.title,
        effort: item.effort || 'M',
        type: item.type || 'feature',
        capability: item.capability || 'meta',
        program_hint: item.program_hint || null,
        description: item.description || '',
        accept_criteria: item.accept_criteria || [],
      });
    }
  }

  const proposal = {
    schema_version: 1,
    generated_at: nowISO(),
    inputs: {
      buffer_event_count: buffer.length,
      buffer_span: buffer.length > 0
        ? [buffer[0].timestamp, buffer[buffer.length - 1].timestamp]
        : [null, null],
      buffer_by_tag: buffer.reduce((acc, ev) => {
        acc[ev.track_tag] = (acc[ev.track_tag] || 0) + 1;
        return acc;
      }, {}),
      principles_count: principles.length,
      anti_goals_count: antiGoals.length,
      imagined_outcome_present: Boolean(imaginedOutcome),
      implicit_decision_count: implicitDecisions.length,
    },
    proposal: {
      archetype,
      archetype_rationale: inferred.rationale,
      stage,
      stage_rationale: `Default entry stage for ${archetype} per kit/data/stages.yaml#archetype_entry_stages.`,
      bundle: {
        programs: bundle.programs,
        engines: bundle.engines,
        personas: bundle.personas,
        tiers: bundle.tiers,
      },
      imagined_outcome: imaginedOutcome,
      invariants_proposed: invariants,
      constraints_proposed: constraints,
      decisions_proposed: decisions,
      seed_work_items: seedItems,
    },
    approval: {
      required: true,
      approval_path: '/intend reads this proposal, presents the markdown form, gates on founder approve/edit/cancel.',
    },
  };

  if (out === 'markdown') {
    process.stdout.write(renderProposalMarkdown(proposal));
  } else {
    writeJson(proposal);
  }
}

function renderProposalMarkdown(p) {
  const pr = p.proposal;
  const lines = [];
  lines.push('## Proposed bundle\n');
  lines.push(`### Archetype: ${pr.archetype}`);
  lines.push(`_Rationale: ${pr.archetype_rationale}_\n`);
  lines.push(`### Stage: ${pr.stage}`);
  lines.push(`_Rationale: ${pr.stage_rationale}_\n`);

  if (pr.imagined_outcome) {
    lines.push('### Imagined Outcome (from intention.md)');
    lines.push(`> ${pr.imagined_outcome}\n`);
  }

  lines.push('### Programs to spawn');
  for (const prog of pr.bundle.programs) {
    const tier = pr.bundle.tiers[prog] || '?';
    lines.push(`- ${prog} (${tier})`);
  }
  lines.push('');

  lines.push('### Engines + personas');
  lines.push(`Engines: ${pr.bundle.engines.join(', ') || '(none)'}`);
  lines.push(`Personas: ${pr.bundle.personas.join(', ') || '(none)'}\n`);

  if (pr.invariants_proposed.length > 0) {
    lines.push('### Invariants proposed');
    for (const iv of pr.invariants_proposed) {
      const text = iv.rule || iv.text;
      const src = iv.source ? ` _(from ${iv.source})_` : '';
      lines.push(`- [ ] ${text}${src}`);
    }
    lines.push('');
  }

  if (pr.constraints_proposed.length > 0) {
    // Split anti-goals (which become tripwires) from baseline constraints for
    // clearer founder review. Anti-goals show with their inferred triggers.
    // WS-1112 (c): the same rule apply uses to write tripwires.
    const antiGoals = antiGoalsOf(pr.constraints_proposed);
    const baseline = pr.constraints_proposed.filter(c => !isAntiGoal(c));

    if (antiGoals.length > 0) {
      lines.push('### Anti-goals (deferred scope — will become blocked WS items with re-eval triggers)');
      antiGoals.forEach((c) => {
        lines.push(`- [ ] ${c.text}`);
        const trig = antiGoalTrigger(c);
        if (trig.type === 'never') {
          // WS-1112 (b)
          lines.push('      _Permanent (class: never) — no trigger re-opens it; never re-asked_');
          return;
        }
        // WS-1112 (g): the label is for LOW confidence only, not any confidence.
        const low = trig.confidence === 'low' ? ' _(low confidence — verify)_' : '';
        lines.push(`      _Trigger: ${trig.type} → ${trig.target}_${low}`);
      });
      lines.push('');
      lines.push('_Edit the trigger in the JSON proposal (option 2) if the inference is wrong; set `"class": "never"` to make an anti-goal permanent._');
      lines.push('');
    }

    if (baseline.length > 0) {
      lines.push('### Baseline constraints (project rules — not deferred scope)');
      for (const c of baseline) {
        const src = c.source ? ` _(from ${c.source})_` : '';
        lines.push(`- [ ] ${c.text}${src}`);
      }
      lines.push('');
    }
  }

  if (pr.decisions_proposed.length > 0) {
    lines.push('### Implicit decisions detected');
    for (const d of pr.decisions_proposed) {
      lines.push(`- [ ] ${d.text} _(from ${d.source})_`);
    }
    lines.push('');
  }

  if (pr.seed_work_items.length > 0) {
    lines.push('### Seed work items');
    pr.seed_work_items.forEach((item, i) => {
      lines.push(`- WS-${String(i + 1).padStart(3, '0')}: ${item.title} (${item.effort})`);
    });
    lines.push('');
  }

  lines.push(`---\n[1] Approve as-is  [2] Edit JSON  [3] Cancel\n`);
  return lines.join('\n');
}

// ─── Subcommand: apply ──────────────────────────────────────────────────────

function cmdApply(args) {
  const targetDir = readFlag(args, 'target-dir');
  const proposalFile = readFlag(args, 'proposal-file');
  const exitTrigger = readFlag(args, 'exit-trigger') || 'intend_command';
  if (!targetDir) dieWith(2, 'apply: --target-dir required');
  if (!proposalFile) dieWith(2, 'apply: --proposal-file required');

  const target = path.resolve(targetDir);
  if (!fs.existsSync(proposalFile)) dieWith(2, `proposal-file not found: ${proposalFile}`);

  // Validate preconditions
  const onb = loadOnboarding(target);
  if (onb.data.adoption_phase !== 'M0') {
    dieWith(3, `apply refused: adoption_phase is "${onb.data.adoption_phase}", not M0`);
  }
  if (hasIgnitionConsumed(target)) {
    dieWith(3, 'apply refused: genesis_ignition_consumed event already present in event log');
  }

  let proposal;
  try {
    proposal = JSON.parse(fs.readFileSync(proposalFile, 'utf8'));
  } catch (e) {
    dieWith(2, `cannot parse proposal-file: ${e.message}`);
  }

  const pr = proposal.proposal;
  if (!pr || !pr.archetype) dieWith(2, 'proposal has no proposal.archetype field');
  if (!pr.bundle || !Array.isArray(pr.bundle.programs)) dieWith(2, 'proposal has no proposal.bundle.programs list');
  if (!pr.bundle.tiers || typeof pr.bundle.tiers !== 'object') pr.bundle.tiers = {};

  const result = {
    ok: true,
    target,
    archetype: pr.archetype,
    stage: pr.stage,
    exit_trigger: exitTrigger,
    applied_at: nowISO(),
    steps: {},
  };

  // Step 0 (WS-1112 a): the proposal's bundle is what the founder approved —
  // possibly edited (/intend option 2). Record the difference from the
  // archetype's default bundle as archetype_overrides, merged with any already
  // there, so the archetype patch below resolves EXACTLY the proposal's bundle.
  // Computed and checked before anything is written: an override the resolver
  // would reject (bad tier, unknown status) fails here, with nothing changed.
  let overridesPlan;
  try {
    overridesPlan = deriveArchetypeOverrides(pr.archetype, pr.stage, pr.bundle, onb.data.archetype_overrides);
  } catch (e) {
    dieWith(2, `apply refused: the proposal's bundle cannot be expressed as archetype_overrides (${e.message}). Nothing was written.`);
  }
  if (!overridesPlan.matches) {
    dieWith(2, `apply refused: the proposal's bundle cannot be reproduced by the resolver (${overridesPlan.mismatch}). Nothing was written.`);
  }
  if (overridesPlan.changed) {
    writeFileAtomic(onb.path, patchArchetypeOverridesBlock(onb.raw, overridesPlan.overrides));
  }
  result.steps.archetype_overrides = {
    written: overridesPlan.changed,
    programs: overridesPlan.overrides.programs.map(p => `${p.id}:${p.status}`),
    tiers: overridesPlan.overrides.tiers.map(t => `${t.program_id}:${t.override_tier}`),
  };

  // Step 1: Patch onboarding YAML with archetype/stage/bundle via cwos-adopt-archetype.
  // We invoke the existing apply subcommand as a subprocess to reuse its
  // patching logic. It reads archetype_overrides from the onboarding file,
  // which Step 0 has just made agree with the proposal.
  try {
    execFileSync('node', [
      path.join(KIT_ROOT, 'kit', 'scripts', 'cwos-adopt-archetype.js'),
      'apply',
      '--archetype', pr.archetype,
      '--stage', pr.stage,
      '--target-dir', target,
    ], { stdio: 'pipe' });
    result.steps.archetype_apply = 'ok';
  } catch (e) {
    result.steps.archetype_apply = `failed: ${e.message}`;
    result.ok = false;
    writeJson(result);
    process.exit(4);
  }

  // Step 1b (WS-1112 a): the onboarding file must now record the proposal's
  // bundle — the programs the files below are copied from. Fail loudly if not.
  const onbResolved = loadOnboarding(target);
  const abr = onbResolved.data.archetype_bundle_resolved || {};
  const consistency = compareBundles(pr.bundle, { programs: abr.programs, tiers: abr.tiers });
  if (!consistency.ok) {
    result.steps.bundle_consistent = `failed: ${consistency.reason}`;
    result.ok = false;
    writeJson(result);
    process.exit(4);
  }
  result.steps.bundle_consistent = 'ok';
  const resolvedTiers = (abr.tiers && typeof abr.tiers === 'object') ? abr.tiers : {};

  // Step 1c (WS-1112 n): make the repo a usable M1 — CLAUDE.md, workstream
  // registries, programs registry, /next /verify /pulse and the Claude Code
  // hooks — by running the standard installer for the repo's capabilities and
  // then the hook installer. Runs BEFORE the program copy so the installer's
  // own program files (scope patterns patched, fingerprinted in .cwos-version)
  // are the ones that land; with (o) it installs only the resolved bundle.
  const m1 = runM1Install(target, onbResolved.data, pr.archetype, {
    homebase: readFlag(args, 'homebase'),
    capabilities: readFlag(args, 'capabilities'),
    repoArchetype: readFlag(args, 'repo-archetype'),
    noFleetRegister: args.includes('--no-fleet-register'),
    skip: args.includes('--skip-m1-install'),
  });
  result.steps.m1_install = m1.install;
  result.steps.claude_hooks = m1.hooks;
  if (m1.repo_archetype) result.steps.repo_archetype = m1.repo_archetype;
  if (m1.capabilities) result.steps.capabilities = m1.capabilities;
  if (m1.failed) result.ok = false;
  if (m1.next_commands.length > 0) {
    result.next_commands = m1.next_commands;
    process.stderr.write(
      'cwos-genesis-ignite: the repo is not yet a usable M1. Run these next, from the repo root:\n' +
      m1.next_commands.map(c => `  ${c}\n`).join('')
    );
  }

  // Step 2: Copy program YAMLs from kit templates → target's
  // .claude/workstream/programs/. Filter by bundle.programs[]. A file the
  // installer already placed is kept (it carries the patched scope patterns).
  const targetProgramsDir = path.join(target, '.claude', 'workstream', 'programs');
  const copy = copyBundlePrograms(targetProgramsDir, pr.bundle.programs, PROGRAM_TEMPLATES_DIR);
  const programsCopied = copy.copied;
  result.steps.programs_copied = programsCopied;
  // WS-1112 (g): an approved program with no template used to be skipped while
  // ok stayed true, so the repo silently lacked a program the onboarding file
  // records. Name it and fail the result (same as a failed tier write).
  if (copy.missing.length > 0) {
    result.steps.programs_missing = copy.missing;
    for (const id of copy.missing) result.steps[`program_${id}`] = 'template_missing';
    result.ok = false;
  }

  // Step 2b (WS-1112 l): each program takes its resolved tier. The template
  // tier (mostly dormant) is not the approved one; leaving it is how /pulse
  // showed every approved program dormant. Same write path as /pulse escalate
  // and /stage apply (cwos-pulse mutateProgramTier + registry resync), so the
  // prog files and programs/registry.yaml agree (INV-052).
  result.steps.program_tiers = applyResolvedTiers(targetProgramsDir, programsCopied, resolvedTiers);
  if (result.steps.program_tiers.failed.length > 0) result.ok = false;

  // Step 3: Flip adoption_phase M0 → M1 + set m0_dormant exit fields.
  const onbAfterArchetype = loadOnboarding(target);
  let raw = onbAfterArchetype.raw;
  raw = patchTopLevelScalarPreserveComment(raw, 'adoption_phase', 'M1');
  raw = patchIndentedScalar(raw, 'exited_at', `"${result.applied_at}"`);
  raw = patchIndentedScalar(raw, 'exit_trigger', `"${exitTrigger}"`);
  // WS-1112 (n): record the tech-stack tag the install used, if none was set.
  if (m1.repo_archetype && !onbAfterArchetype.data.repo_archetype) {
    raw = raw.replace(/^(repo_archetype:[ \t]*)null\b/m, `$1${m1.repo_archetype}`);
  }
  writeFileAtomic(onbAfterArchetype.path, raw);
  result.steps.phase_flipped = 'M0 -> M1';

  // Step 4: Append accepted invariants to system/invariants.md.
  appendInvariants(target, pr.invariants_proposed || [], result.applied_at);
  result.steps.invariants_appended = (pr.invariants_proposed || []).length;

  // Step 5: Append accepted constraints to system/constraints.md.
  appendConstraints(target, pr.constraints_proposed || []);
  result.steps.constraints_appended = (pr.constraints_proposed || []).length;

  // Step 6: Append accepted decisions to system/decisions.md.
  appendDecisions(target, pr.decisions_proposed || [], result.applied_at);
  result.steps.decisions_appended = (pr.decisions_proposed || []).length;

  // Step 7: Write seed work items to .claude/workstream/queue/.
  // WS-1112 (m): items carry the program's own `id:` (change-mgmt), never the
  // file stem (change-management), and never a program the repo lacks.
  const programIds = programIdMap(targetProgramsDir, programsCopied);
  const hostProgram = pickTripwireProgram(programsCopied, resolvedTiers, programIds);
  result.steps.tripwire_program = hostProgram;
  const seedCount = writeSeedWorkItems(target, pr.seed_work_items || [], pr.archetype, 0, { programIds, fallbackProgram: hostProgram });
  result.steps.seed_work_items = seedCount;

  // Step 7b (WS-322 Phase A): Write deferred-scope tripwires — one blocked
  // WS item per intention.md Anti-goal with an inferred re_eval_trigger. When
  // the trigger fires (Phase B), the item surfaces in /pulse for founder
  // re-evaluation. Filter to anti-goals only (template constraints are
  // baseline rules, not deferred scope; they don't get tripwires).
  // WS-1112 (c): antiGoalsOf is the renderer's rule too.
  const antiGoalsForTripwires = antiGoalsOf(pr.constraints_proposed);
  const tripwireCount = writeDeferredScopeTripwires(
    target,
    antiGoalsForTripwires,
    pr.archetype,
    seedCount,
    hostProgram
  );
  result.steps.tripwires_written = tripwireCount;

  // Step 8: Set usage.yaml welcome_completed: true (suppress /welcome).
  try {
    setWelcomeCompleted(target);
    result.steps.welcome_suppressed = 'ok';
  } catch (e) {
    result.steps.welcome_suppressed = `warn: ${e.message}`;
  }

  // Step 9: Emit T0:envelope genesis_ignition_consumed event. This is the
  // archive-boundary read-receipt for the dormant capture buffer.
  const consumedResult = emitConsumedEvent(target, {
    archetype: pr.archetype,
    stage: pr.stage,
    exit_trigger: exitTrigger,
    event_count: proposal.inputs ? proposal.inputs.buffer_event_count : 0,
    span_start: proposal.inputs ? proposal.inputs.buffer_span[0] : null,
    span_end: proposal.inputs ? proposal.inputs.buffer_span[1] : null,
    summary: `Genesis ignition: ${pr.archetype}/${pr.stage}, ${programsCopied.length} programs, ${seedCount} seed items.`,
  });
  result.steps.consumed_event_emitted = consumedResult.ok ? 'ok' : `failed: ${consumedResult.error}`;
  if (!consumedResult.ok) result.ok = false;

  writeJson(result);
}

// ─── Apply helpers ──────────────────────────────────────────────────────────

function patchTopLevelScalarPreserveComment(raw, field, newValue) {
  const re = new RegExp(`^(${escapeRe(field)}:\\s*)(\\S+?)(\\s*(?:#.*)?)$`, 'm');
  return raw.replace(re, (m, prefix) => `${prefix}${newValue}`);
}

function patchIndentedScalar(raw, field, newValue, indent = '  ') {
  const re = new RegExp(`^(${escapeRe(indent)}${escapeRe(field)}:\\s*)(\\S+?)(\\s*(?:#.*)?)$`, 'm');
  return raw.replace(re, (m, prefix) => `${prefix}${newValue}`);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── WS-1112 (a): proposal bundle → archetype_overrides ─────────────────────

const OVERRIDE_REASON = 'genesis ignition: founder-approved proposal bundle';

function normalizeOverrides(existing) {
  const ao = (existing && typeof existing === 'object') ? existing : {};
  return {
    programs: Array.isArray(ao.programs) ? ao.programs.filter(p => p && typeof p === 'object' && p.id) : [],
    tiers: Array.isArray(ao.tiers) ? ao.tiers.filter(t => t && typeof t === 'object' && t.program_id) : [],
    axes: (ao.axes && typeof ao.axes === 'object' && !Array.isArray(ao.axes)) ? ao.axes : {},
  };
}

/**
 * compareBundles(want, got) → { ok, reason }
 * Same program SET, and the same tier for every program `want` names a tier for.
 */
function compareBundles(want, got) {
  const wantProgs = Array.isArray(want.programs) ? want.programs : [];
  const gotProgs = Array.isArray(got.programs) ? got.programs : [];
  const missing = wantProgs.filter(p => !gotProgs.includes(p));
  const extra = gotProgs.filter(p => !wantProgs.includes(p));
  if (missing.length || extra.length) {
    return { ok: false, reason: `programs differ (missing: ${missing.join(', ') || 'none'}; unexpected: ${extra.join(', ') || 'none'})` };
  }
  const wantTiers = want.tiers || {};
  const gotTiers = got.tiers || {};
  const tierDiffs = wantProgs
    .filter(p => wantTiers[p] && wantTiers[p] !== gotTiers[p])
    .map(p => `${p} ${wantTiers[p]} vs ${gotTiers[p] || 'none'}`);
  if (tierDiffs.length) return { ok: false, reason: `tiers differ (${tierDiffs.join('; ')})` };
  return { ok: true };
}

/**
 * deriveArchetypeOverrides(archetype, stage, bundle, existingOverrides)
 *   → { overrides, changed, matches, mismatch }
 *
 * The default bundle is what the resolver gives for (archetype, stage) with
 * the repo's axis overrides but no program/tier overrides. Against it:
 *   - a default program the proposal dropped     → { id, status: opted-out }
 *   - a proposal program the default lacks       → { id, status: opted-in }
 *   - a proposal tier the stage/archetype would not give → tiers[] entry
 * Merge with what is already there: entries for programs this bundle decides
 * (default ∪ proposal) are replaced; entries for any other program are kept.
 * `matches` re-runs the resolver with the merged overrides and checks it
 * yields the proposal's bundle exactly. Throws on overrides the resolver
 * rejects (invalid tier).
 */
function deriveArchetypeOverrides(archetype, stage, bundle, existingOverrides) {
  const existing = normalizeOverrides(existingOverrides);
  const wantProgs = (bundle.programs || []).filter(p => typeof p === 'string' && p);
  const wantTiers = bundle.tiers || {};

  const base = resolveBundle(archetype, stage, { programs: [], tiers: [], axes: existing.axes });
  const decided = new Set([...base.programs, ...wantProgs]);

  const programs = existing.programs.filter(p => !decided.has(p.id));
  for (const id of base.programs) {
    if (!wantProgs.includes(id)) programs.push(prevOrNew(existing.programs, id, 'opted-out'));
  }
  for (const id of wantProgs) {
    if (!base.programs.includes(id)) programs.push(prevOrNew(existing.programs, id, 'opted-in'));
  }

  // Natural tiers for the proposal's programs: no founder tier overrides.
  const natural = stage ? resolveBundle(archetype, stage, { programs, tiers: [], axes: existing.axes }).tiers : {};
  const tiers = existing.tiers.filter(t => !wantProgs.includes(t.program_id));
  for (const id of wantProgs) {
    const want = wantTiers[id];
    if (!want || want === natural[id]) continue;
    const prev = existing.tiers.find(t => t.program_id === id && t.override_tier === want);
    tiers.push(prev || { program_id: id, override_tier: want, reason: OVERRIDE_REASON });
  }

  const overrides = { programs, tiers, axes: existing.axes };
  const check = resolveBundle(archetype, stage, overrides); // throws on an invalid tier
  const cmp = compareBundles({ programs: wantProgs, tiers: wantTiers }, check);
  const changed = JSON.stringify(stripReasons(overrides.programs)) !== JSON.stringify(stripReasons(existing.programs))
    || JSON.stringify(stripReasons(overrides.tiers)) !== JSON.stringify(stripReasons(existing.tiers));
  return { overrides, changed, matches: cmp.ok, mismatch: cmp.reason || null };
}

function prevOrNew(list, id, status) {
  const prev = list.find(p => p.id === id && p.status === status);
  return prev || { id, status, reason: OVERRIDE_REASON };
}

function stripReasons(list) {
  return list.map(x => Object.keys(x).filter(k => k !== 'reason').sort().map(k => `${k}=${x[k]}`).join(','));
}

function yamlQuote(v) {
  return `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function renderOverrideList(key, list, keys) {
  if (list.length === 0) return [`  ${key}: []`];
  const out = [`  ${key}:`];
  for (const entry of list) {
    const ks = keys.filter(k => entry[k] != null).concat(Object.keys(entry).filter(k => !keys.includes(k) && entry[k] != null));
    ks.forEach((k, i) => out.push(`${i === 0 ? '    - ' : '      '}${k}: ${yamlQuote(entry[k])}`));
  }
  return out;
}

/**
 * Rewrite the programs: and tiers: entries of the top-level
 * archetype_overrides block, leaving its comments and axes: untouched. The
 * block is appended when the file has none.
 */
function patchArchetypeOverridesBlock(raw, overrides) {
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const progLines = renderOverrideList('programs', overrides.programs, ['id', 'status', 'reason']);
  const tierLines = renderOverrideList('tiers', overrides.tiers, ['program_id', 'override_tier', 'reason']);

  const start = lines.findIndex(l => /^archetype_overrides:\s*(#.*)?$/.test(l));
  if (start < 0) {
    const out = lines.slice();
    while (out.length && out[out.length - 1] === '') out.pop();
    out.push('', 'archetype_overrides:', ...progLines, ...tierLines, '  axes: {}', '');
    return out.join(eol);
  }
  let end = start + 1;
  // The block runs until the next line at column 0 (a key or a header comment).
  while (end < lines.length && (lines[end] === '' || /^\s/.test(lines[end]))) end++;
  // Trim trailing blank lines back into the outer file.
  while (end > start + 1 && lines[end - 1] === '') end--;

  const block = lines.slice(start + 1, end);
  const replaceKey = (blk, key, rendered) => {
    const i = blk.findIndex(l => new RegExp(`^  ${key}:`).test(l));
    if (i < 0) return blk.concat(rendered);
    let j = i + 1;
    while (j < blk.length && (/^ {3,}\S/.test(blk[j]) || /^  - /.test(blk[j]))) j++;
    return blk.slice(0, i).concat(rendered, blk.slice(j));
  };
  let newBlock = replaceKey(block, 'programs', progLines);
  newBlock = replaceKey(newBlock, 'tiers', tierLines);
  return lines.slice(0, start + 1).concat(newBlock, lines.slice(end)).join(eol);
}

// ─── WS-1112 (l): resolved tiers onto the program files ─────────────────────

function readTopLevelScalar(file, key) {
  try {
    const m = fs.readFileSync(file, 'utf8').match(new RegExp(`^${key}:\\s*['"]?([^'"#\\s]+)['"]?`, 'm'));
    return m ? m[1] : null;
  } catch { return null; }
}

/**
 * applyResolvedTiers(programsDir, bundleIds, tiers) → { set, unchanged, failed, registry }
 * bundleIds are file stems (prog-engineering). Writes go through cwos-pulse's
 * mutateProgramTier and resyncProgramRegistry — the /pulse escalate path.
 */
function applyResolvedTiers(programsDir, bundleIds, tiers) {
  const out = { set: [], unchanged: [], failed: [], registry: null };
  let pulse;
  try { pulse = require('./cwos-pulse'); } catch (e) {
    out.failed.push(`tier write path unavailable: ${e.message}`);
    return out;
  }
  for (const id of bundleIds) {
    const want = tiers[id];
    if (!want) { out.unchanged.push(id); continue; }
    const file = path.join(programsDir, `${id}.yaml`);
    if (readTopLevelScalar(file, 'tier') === want) { out.unchanged.push(id); continue; }
    const m = pulse.mutateProgramTier(id.replace(/^prog-/, ''), want, programsDir);
    if (m.ok) out.set.push(`${id}:${want}`);
    else out.failed.push(`${id}: ${m.reason}`);
  }
  // The registry is derived from the prog files; resync whenever one exists
  // or a tier changed, so the two never disagree (INV-052).
  if (out.set.length > 0 || fs.existsSync(path.join(programsDir, 'registry.yaml'))) {
    const r = pulse.resyncProgramRegistry(programsDir);
    out.registry = r && r.error ? `failed: ${r.error}` : 'synced';
    if (r && r.error && fs.existsSync(path.join(programsDir, 'registry.yaml'))) out.failed.push(`registry resync: ${r.error}`);
  }
  return out;
}

// ─── WS-1112 (g): bundle program files ──────────────────────────────────────

/**
 * Copy each bundle program's template into programsDir unless a file is
 * already there (the installer's copy carries patched scope patterns).
 * Returns { copied, missing }: missing names every bundle program that has
 * neither a placed file nor a template.
 */
function copyBundlePrograms(programsDir, bundleIds, templatesDir) {
  fs.mkdirSync(programsDir, { recursive: true });
  const out = { copied: [], missing: [] };
  for (const progId of bundleIds) {
    const dst = path.join(programsDir, `${progId}.yaml`);
    if (fs.existsSync(dst)) { out.copied.push(progId); continue; }
    const tmplPath = path.join(templatesDir, `${progId}.yaml`);
    if (!fs.existsSync(tmplPath)) { out.missing.push(progId); continue; }
    writeFileAtomic(dst, fs.readFileSync(tmplPath, 'utf8'));
    out.copied.push(progId);
  }
  return out;
}

// ─── WS-1112 (m): program ids and the tripwire host ─────────────────────────

/** { 'prog-change-management': 'change-mgmt', ... } for programs present in programsDir. */
function programIdMap(programsDir, bundleIds) {
  const map = {};
  for (const id of bundleIds) {
    const file = path.join(programsDir, `${id}.yaml`);
    const fileId = fs.existsSync(file) ? readTopLevelScalar(file, 'id') : null;
    map[id] = fileId || id.replace(/^prog-/, '');
  }
  return map;
}

const TIER_RANK = { critical: 0, active: 1, watch: 2, dormant: 3 };

/**
 * The program anti-goal tripwires attach to. They are re-evaluation prompts
 * for scope the founder ruled out, so they belong on the program that gets
 * the most attention: the highest-tier program in the resolved bundle (first
 * critical one), ties broken by bundle order. Always a program the repo has;
 * null only when the bundle is empty.
 */
function pickTripwireProgram(bundleIds, tiers, programIds) {
  let best = null;
  let bestRank = Infinity;
  for (const id of bundleIds) {
    const rank = TIER_RANK[tiers[id]] != null ? TIER_RANK[tiers[id]] : 4;
    if (rank < bestRank) { best = id; bestRank = rank; }
  }
  return best ? (programIds[best] || best.replace(/^prog-/, '')) : null;
}

// ─── WS-1112 (n): the standard install that makes the repo a usable M1 ──────

const ALL_CAPABILITIES = ['core', 'workstream', 'engines', 'governance', 'autonomous'];

// ADR-035 identity archetype → the installer's tech-stack tag (repo_archetype),
// which only picks default scope patterns and ceremony. Used when the
// onboarding file does not already name one and --repo-archetype is absent.
const REPO_ARCHETYPE_FOR = { A1: 'saas', A2: 'data-platform', A3: 'frontend', A4: 'research', A5: 'dev-tool' };
const INSTALLER_ARCHETYPES = new Set([
  'saas', 'frontend', 'data-platform', 'dev-tool', 'research', 'api-service',
  'research-clinical', 'research-mathematical', 'research-empirical',
]);

/**
 * Capabilities to install: the onboarding file's enabled/intended set when the
 * founder has stated any capability (closed downward, as the installer does);
 * otherwise — every genesis repo, where all five are still unconfigured — all
 * five, which is what installs /next (workstream), /pulse + programs registry
 * (governance) and /verify (autonomous).
 */
function capabilitiesFor(onboardingData) {
  const caps = onboardingData && onboardingData.capabilities;
  let stated = false;
  let highest = -1;
  if (caps && typeof caps === 'object') {
    ALL_CAPABILITIES.forEach((name, i) => {
      const e = caps[name];
      const state = e && typeof e === 'object' ? e.state : e;
      if (!state || state === 'unconfigured') return;
      stated = true;
      if ((state === 'enabled' || state === 'intended') && i > highest) highest = i;
    });
  }
  if (!stated) return ALL_CAPABILITIES.slice();
  return ALL_CAPABILITIES.slice(0, Math.max(highest, 0) + 1);
}

function repoArchetypeFor(onboardingData, archetype, flag) {
  if (flag) return flag;
  const declared = onboardingData && onboardingData.repo_archetype;
  if (declared && INSTALLER_ARCHETYPES.has(String(declared))) return String(declared);
  return REPO_ARCHETYPE_FOR[archetype] || 'dev-tool';
}

/** HomeBase: --homebase, else this distribution if it is one, else the stamped/upward hub. */
function resolveInstallHomebase(target, flag) {
  const isHub = (d) => d && fs.existsSync(path.join(d, 'kit', 'MANIFEST.yaml'))
    && fs.existsSync(path.join(d, 'kit', 'scripts', 'cwos-adopt-install.js'));
  if (flag) return isHub(path.resolve(flag)) ? path.resolve(flag) : null;
  if (isHub(KIT_ROOT)) return KIT_ROOT;
  try {
    const hb = require('./lib/kit-paths').resolveHomeBaseRoot({ from: target });
    if (isHub(hb)) return hb;
  } catch { /* fall through */ }
  return null;
}

function tail(text, n = 6) {
  return String(text || '').trim().split(/\r?\n/).slice(-n).join(' | ');
}

function runM1Install(target, onboardingData, archetype, opts) {
  const out = { install: null, hooks: null, failed: false, next_commands: [], capabilities: null, repo_archetype: null };
  const caps = opts.capabilities || capabilitiesFor(onboardingData).join(',');
  const tag = repoArchetypeFor(onboardingData, archetype, opts.repoArchetype);
  out.capabilities = caps;
  out.repo_archetype = tag;
  const homebase = resolveInstallHomebase(target, opts.homebase);
  const hbShown = homebase ? homebase.replace(/\\/g, '/') : '<path-to-HomeBase>';
  const tgtShown = target.replace(/\\/g, '/');
  const installCmd = `node "${hbShown}/kit/scripts/cwos-adopt-install.js" --target "${tgtShown}" --archetype ${tag} --homebase "${hbShown}" --capabilities ${caps}`;
  const hooksCmd = 'node kit/scripts/install-claude-hooks.mjs';

  if (opts.skip) {
    out.install = 'skipped: --skip-m1-install';
    out.hooks = 'skipped: --skip-m1-install';
    out.next_commands.push(installCmd, hooksCmd);
    return out;
  }
  if (!homebase) {
    out.install = 'skipped: HomeBase (kit/MANIFEST.yaml + cwos-adopt-install.js) not found — pass --homebase <path>';
    out.hooks = 'skipped: runs after the install';
    out.next_commands.push(installCmd, hooksCmd);
    return out;
  }

  const installArgs = [
    path.join(homebase, 'kit', 'scripts', 'cwos-adopt-install.js'),
    '--target', target,
    '--archetype', tag,
    '--homebase', homebase,
    '--capabilities', caps,
  ];
  if (opts.noFleetRegister) installArgs.push('--no-fleet-register');
  const r = spawnSync(process.execPath, installArgs, {
    cwd: target, encoding: 'utf8', timeout: 180000,
    env: { ...process.env, CWOS_SKIP_RENDER: '1' },
  });
  if (r.status !== 0) {
    out.install = `failed (exit ${r.status}): ${tail(r.stderr || r.stdout) || (r.error && r.error.message) || 'no output'}`;
    out.hooks = 'skipped: install failed';
    out.failed = true;
    out.next_commands.push(installCmd, hooksCmd);
    return out;
  }
  out.install = 'ok';

  // Hooks are wired into the repo git resolves from cwd, so only run where the
  // target IS a git repo root — never into a parent repo's settings.json.
  if (!fs.existsSync(path.join(target, '.git'))) {
    out.hooks = 'skipped: target has no .git (git init, then run the hook installer)';
    out.next_commands.push(hooksCmd);
    return out;
  }
  const hookScript = [
    path.join(target, 'kit', 'scripts', 'install-claude-hooks.mjs'),
    path.join(homebase, 'kit', 'scripts', 'install-claude-hooks.mjs'),
  ].find(p => fs.existsSync(p));
  if (!hookScript) {
    out.hooks = 'failed: install-claude-hooks.mjs not found';
    out.failed = true;
    out.next_commands.push(hooksCmd);
    return out;
  }
  const h = spawnSync(process.execPath, [hookScript], { cwd: target, encoding: 'utf8', timeout: 60000 });
  if (h.status !== 0) {
    out.hooks = `failed (exit ${h.status}): ${tail(h.stderr || h.stdout)}`;
    out.failed = true;
    out.next_commands.push(hooksCmd);
    return out;
  }
  out.hooks = 'ok';
  return out;
}

function appendInvariants(targetDir, invariants, appliedAt) {
  if (invariants.length === 0) return;
  const p = systemPath(targetDir, 'invariants.md');
  let content = '';
  if (fs.existsSync(p)) content = fs.readFileSync(p, 'utf8');
  if (!content.trim()) {
    content = '# Invariants\n\nThings that must always hold for this project. Updated by /intend at ignition; founder edits as the project evolves.\n\n';
  }
  const block = ['\n## Genesis ignition (' + appliedAt.slice(0, 10) + ')\n'];
  for (const iv of invariants) {
    const id = iv.id_hint ? `INV-${iv.id_hint.replace(/^INV-/, '')}` : `INV-genesis-${invariants.indexOf(iv) + 1}`;
    const rule = iv.rule || iv.text;
    const rationale = iv.rationale || '';
    const severity = iv.severity || 'medium';
    block.push(`### ${id}: ${rule}`);
    if (rationale) block.push(`**Rationale:** ${rationale}`);
    block.push(`**Severity:** ${severity}`);
    block.push(`**Last Verified:** ${appliedAt.slice(0, 10)}`);
    block.push(`**Status:** PROPOSED (founder to confirm post-ignition)\n`);
  }
  writeFileAtomic(p, content + block.join('\n'));
}

function appendConstraints(targetDir, constraints) {
  if (constraints.length === 0) return;
  const p = systemPath(targetDir, 'constraints.md');
  let content = '';
  if (fs.existsSync(p)) content = fs.readFileSync(p, 'utf8');
  if (!content.trim()) {
    content = '# Constraints\n\nProject constraints — what we are explicitly NOT trying to do. Updated by /intend at ignition.\n\n';
  }
  const lines = ['\n## Genesis ignition\n'];
  for (const c of constraints) {
    lines.push(`- ${c.text}` + (c.rationale ? ` _(${c.rationale})_` : ''));
  }
  writeFileAtomic(p, content + lines.join('\n') + '\n');
}

function appendDecisions(targetDir, decisions, appliedAt) {
  if (decisions.length === 0) return;
  const p = systemPath(targetDir, 'decisions.md');
  let content = '';
  if (fs.existsSync(p)) content = fs.readFileSync(p, 'utf8');
  if (!content.trim()) {
    content = '# Decisions\n\nDecisions captured during the project lifecycle. Genesis ignition seeds initial decisions from the dormant capture buffer.\n\n';
  }
  const lines = ['\n## Genesis ignition (' + appliedAt.slice(0, 10) + ')\n'];
  decisions.forEach((d, i) => {
    lines.push(`### DEC-genesis-${i + 1}: ${d.text}`);
    lines.push(`**Date:** ${appliedAt.slice(0, 10)} | **Status:** Proposed | **Source:** ${d.source}\n`);
  });
  writeFileAtomic(p, content + lines.join('\n'));
}

// WS-1112 (m): seed items name the program by the `id:` inside its prog file.
// opts.programIds maps a bundle id (prog-change-management) to that id
// (change-mgmt) for every program the repo has. A hint naming a program the
// repo does not have falls back to opts.fallbackProgram (the tripwire host),
// so an item never attaches to a missing program.
function seedProgramFor(item, opts) {
  const hint = String(item.program_hint || '').trim();
  if (hint) {
    const key = hint.startsWith('prog-') ? hint : `prog-${hint}`;
    if (opts.programIds[key]) return opts.programIds[key];
    // A hint already written as an id (change-mgmt) the repo has.
    if (Object.values(opts.programIds).includes(hint)) return hint;
  }
  return opts.fallbackProgram;
}

function writeSeedWorkItems(targetDir, items, archetype, startIndex = 0, opts = {}) {
  if (items.length === 0) return 0;
  const programOpts = { programIds: opts.programIds || {}, fallbackProgram: opts.fallbackProgram || null };
  const queueDir = path.join(targetDir, '.claude', 'workstream', 'queue');
  fs.mkdirSync(queueDir, { recursive: true });
  const today = todayISO();
  items.forEach((item, i) => {
    const id = `WS-${String(startIndex + i + 1).padStart(3, '0')}`;
    const yaml = [
      `id: "${id}"`,
      `title: "${(item.title || '').replace(/"/g, '\\"')}"`,
      'status: backlog',
      `type: ${item.type || 'feature'}`,
      `category: ${item.capability || 'meta'}`,
      `capability: ${item.capability || 'meta'}`,
      `program: ${seedProgramFor(item, programOpts) || 'null'}`,
      'priority_score: 10',
      `effort: ${item.effort || 'M'}`,
      'source:',
      `  surfaced_by: "Genesis ignition (archetype ${archetype})"`,
      ...blockScalarLines('description', item.description || '', { style: '>' }),
      'accept_criteria:',
      ...(item.accept_criteria || []).map(ac => `  - "${ac.replace(/"/g, '\\"')}"`),
      `created_at: "${today}"`,
      '',
    ].join('\n');
    writeFileAtomic(path.join(queueDir, `${id}.yaml`), yaml);
  });
  return items.length;
}

// WS-322 Phase A — write deferred-scope tripwire WS items for each anti-goal.
// Each item is status: blocked with a re_eval_trigger field naming the state
// transition that unblocks it. When the trigger fires (handled in Phase B),
// the item's status flips to backlog and surfaces in /pulse.
// WS-1112 (m): hostProgram is a program the repo HAS (pickTripwireProgram);
// these used to name program-integrity, which no new repo has.
function writeDeferredScopeTripwires(targetDir, antiGoals, archetype, startIndex = 0, hostProgram = null) {
  if (!antiGoals || antiGoals.length === 0) return 0;
  const queueDir = path.join(targetDir, '.claude', 'workstream', 'queue');
  fs.mkdirSync(queueDir, { recursive: true });
  const today = todayISO();
  antiGoals.forEach((ag, i) => {
    const id = `WS-${String(startIndex + i + 1).padStart(3, '0')}`;
    const text = (ag.text || ag.rule || ag.rationale || '').toString().trim();
    const trigger = antiGoalTrigger(ag);
    // WS-1112 (b): a permanent anti-goal keeps its item as the record of the
    // ruling, but no trigger fires it and it asks no build/re-defer/abandon.
    const permanent = trigger.type === 'never';
    const title = permanent ? buildPermanentTitle(text) : buildTripwireTitle(text);

    // Plain-language note for /pulse readability — does NOT replace the
    // structured re_eval_trigger field; both surface together.
    const blockedNote = renderTriggerNote(trigger);
    const flat = text.replace(/\n/g, ' ').slice(0, 200);
    const description = permanent
      ? [
        `Permanent anti-goal from genesis ignition. The founder ruled this`,
        `out for good: "${flat}". No archetype, milestone or tier change`,
        `re-opens it, and /pulse does not raise it for re-evaluation.`,
        `Lifting it is a founder decision, recorded in decisions.md.`,
      ].join('\n')
      : [
        `Deferred scope from genesis ignition. The founder declared this`,
        `out of scope at v1: "${flat}".`,
        `When the trigger fires (${trigger.type} -> ${trigger.target}), this`,
        `item becomes eligible and /pulse surfaces it for re-evaluation.`,
        `Founder either (a) commits to building it now, (b) re-defers with`,
        `a new trigger, or (c) marks it abandoned with rationale.`,
      ].join('\n');
    const acceptCriteria = permanent
      ? ['  - "Holds while the anti-goal stands; any change to it is a founder decision recorded in decisions.md"']
      : [
        '  - "Re-evaluation completed: founder explicitly chose build / re-defer / abandon"',
        '  - "If build: scope-equivalent execute item replaces this tripwire"',
        '  - "If re-defer: new re_eval_trigger replaces the old one with a clear rationale"',
        '  - "If abandon: item moved to status: dismissed with abandonment note in decisions.md"',
      ];

    const yaml = [
      `id: "${id}"`,
      `title: "${title.replace(/"/g, '\\"')}"`,
      'status: blocked',
      'type: deferred-scope',
      'category: scope-tripwire',
      ...(permanent ? ['anti_goal_class: never'] : []),
      'capability: meta',
      `program: ${hostProgram || 'null'}`,
      'priority_score: 5',
      'effort: TBD',
      'blocked_by: []',
      `blocked_by_note: "${blockedNote.replace(/"/g, '\\"')}"`,
      're_eval_trigger:',
      `  type: ${trigger.type}`,
      `  target: "${trigger.target}"`,
      `  rationale: "${(trigger.rationale || '').replace(/"/g, '\\"')}"`,
      `  set_at: "${trigger.set_at || nowISO()}"`,
      ...(trigger.confidence ? [`  confidence: ${trigger.confidence}`] : []),
      'source:',
      `  surfaced_by: "Genesis ignition anti-goal (archetype ${archetype})"`,
      `  anti_goal_text: "${text.replace(/"/g, '\\"')}"`,
      ...blockScalarLines('description', description, { style: '>' }),
      'accept_criteria:',
      ...acceptCriteria,
      `created_at: "${today}"`,
      '',
    ].join('\n');
    writeFileAtomic(path.join(queueDir, `${id}.yaml`), yaml);
  });
  return antiGoals.length;
}

// Generate a clean title for the tripwire WS item from the anti-goal text.
// Strips leading "Not " and prepends "Re-evaluate:" so titles read as
// re-evaluation actions (which is what they are).
function buildTripwireTitle(antiGoalText) {
  let stripped = String(antiGoalText || '').trim();
  // Strip leading "Not " / "not " (case-insensitive) — typical anti-goal phrasing.
  stripped = stripped.replace(/^not\s+/i, '');
  // Capitalize first letter for readability.
  if (stripped.length > 0) stripped = stripped[0].toUpperCase() + stripped.slice(1);
  return `Re-evaluate: ${stripped}`.slice(0, 200);
}

// WS-1112 (b): a permanent anti-goal is not re-evaluated, so its title says so.
function buildPermanentTitle(antiGoalText) {
  let s = String(antiGoalText || '').trim();
  if (s.length > 0) s = s[0].toUpperCase() + s.slice(1);
  return `Anti-goal (permanent): ${s}`.slice(0, 200);
}

function renderTriggerNote(trigger) {
  if (!trigger) return 'Deferred scope; trigger missing — manual re-evaluation required.';
  switch (trigger.type) {
    case 'archetype_migration':
      return `Re-evaluate when archetype migrates to ${trigger.target} (e.g., via /archetype re ${trigger.target}).`;
    case 'milestone_reached':
      return `Re-evaluate when repo reaches milestone ${trigger.target}.`;
    case 'program_tier_change':
      return `Re-evaluate when ${trigger.target} program tier changes.`;
    case 'fleet_event':
      return `Re-evaluate on fleet event: ${trigger.target}.`;
    case 'never':
      return 'Permanent anti-goal: no trigger re-opens it; lifting it is a founder decision.';
    default:
      return `Re-evaluate (custom trigger: ${trigger.type}).`;
  }
}

function setWelcomeCompleted(targetDir) {
  const usagePath = path.join(targetDir, '.claude', 'workstream', 'usage.yaml');
  let content = '';
  if (fs.existsSync(usagePath)) content = fs.readFileSync(usagePath, 'utf8');
  if (!content.trim()) {
    content = '# Usage telemetry — updated by /session-end and other commands.\n';
  }
  if (/^welcome_completed:/m.test(content)) {
    content = content.replace(/^welcome_completed:.*$/m, 'welcome_completed: true');
  } else {
    content = content.replace(/\n*$/, '\n') + 'welcome_completed: true\n';
  }
  writeFileAtomic(usagePath, content);
  // WS-560 (INV-028): ignition takes a repo M0 -> M1. Marking welcome complete
  // is the last write of that transition.
  emitEvent('T6:workstream', 'genesis-ignited', { usage: path.basename(usagePath) });
}

function emitConsumedEvent(targetDir, payload) {
  const eventCli = path.join(KIT_ROOT, 'kit', 'scripts', 'cwos-event.js');
  try {
    const r = execFileSync('node', [
      eventCli, 'append', 'genesis_ignition_consumed',
      '--track', 'T0:envelope',
      '--tag', 'genesis_ignition_consumed',
      '--payload', JSON.stringify({ type: 'genesis_ignition_consumed', ...payload }),
    ], { stdio: ['ignore', 'pipe', 'pipe'], cwd: targetDir, env: { ...process.env, CWOS_SKIP_RENDER: '1' } });
    return { ok: true, stdout: String(r) };
  } catch (e) {
    const stderr = (e.stderr && String(e.stderr)) || e.message;
    process.stderr.write(`cwos-genesis-ignite: emitConsumedEvent failed — ${stderr}\n`);
    return { ok: false, error: stderr };
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

// WS-1112 (h), ADR-063: argv goes through the shared CLI contract BEFORE any
// side effect. `--help` used to exit 2; an unknown flag (`--frce`) used to be
// ignored and the subcommand ran anyway. Flags are the union across the three
// subcommands; each subcommand still checks the ones it requires.
const CLI = {
  name: 'cwos-genesis-ignite',
  summary: 'ignite a dormant (M0) repo: propose a bundle, apply the approved one, validate preconditions',
  usage: [
    'cwos-genesis-ignite <propose|apply|validate> [options]',
    '  propose  --target-dir <p> [--archetype-hint A?] [--out json|markdown]',
    '  apply    --target-dir <p> --proposal-file <p> --exit-trigger intend_command|intention_md_edit_detected',
    '           [--homebase <p>] [--capabilities core,...] [--repo-archetype <tag>] [--no-fleet-register] [--skip-m1-install]',
    '  validate --target-dir <p> [--force]',
  ].join('\n'),
  subcommands: {
    propose: 'print the ignition proposal (JSON, or the markdown approval doc); writes nothing',
    apply: 'install the approved proposal bundle and flip adoption_phase M0 -> M1',
    validate: 'check ignition preconditions; writes nothing',
  },
  flags: {
    'target-dir': { type: 'string', placeholder: 'path', describe: 'the repo to ignite' },
    'archetype-hint': { type: 'string', placeholder: 'A?', describe: 'propose: skip inference, use this archetype' },
    out: { type: 'string', placeholder: 'json|markdown', describe: 'propose: output form (default json)' },
    'proposal-file': { type: 'string', placeholder: 'path', describe: 'apply: the (possibly edited) proposal JSON' },
    'exit-trigger': { type: 'string', placeholder: 'trigger', describe: 'apply: recorded as m0_dormant.exit_trigger' },
    homebase: { type: 'string', placeholder: 'path', describe: 'apply: HomeBase checkout for the M1 install' },
    capabilities: { type: 'string', placeholder: 'list', describe: 'apply: capabilities to install' },
    'repo-archetype': { type: 'string', placeholder: 'tag', describe: 'apply: installer tech-stack tag' },
    'no-fleet-register': { type: 'boolean', describe: 'apply: do not register the repo in the fleet' },
    'skip-m1-install': { type: 'boolean', describe: 'apply: skip the installer; print next_commands instead' },
    force: { type: 'boolean', describe: 'validate: bypass the 12h placeholder gate (testing)' },
  },
  notes: 'Exit 0 = ok; 1 = validate failed; 2 = bad command line or input; 3 = refused (not M0 / already ignited); 4 = apply step failed.',
};

function main() {
  const args = process.argv.slice(2);
  const gate = cliGate(args, CLI);
  if (gate.positionals && gate.positionals.length) {
    dieWith(2, `unexpected argument: ${gate.positionals[0]} (see --help)`);
  }
  // Drop the subcommand token itself — the first argument that is neither a
  // flag nor a string flag's value — and hand the rest to the subcommand.
  let subAt = -1;
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const f = CLI.flags[args[i].slice(2)];
      if (f && f.type === 'string' && !args[i].includes('=')) i++;
      continue;
    }
    subAt = i; break;
  }
  const rest = args.filter((_, i) => i !== subAt);
  switch (gate.sub) {
    case 'propose': return cmdPropose(rest);
    case 'apply': return cmdApply(rest);
    case 'validate': return cmdValidate(rest);
    default: return dieWith(2, `unknown subcommand: ${gate.sub}`);
  }
}

// WS-544: guard the entry point so requiring this file for a dependency
// smoke check does not run it.
if (require.main === module) main();

// WS-1112: apply's helpers, exported for kit/scripts/__tests__/genesis-ignite-apply.test.js.
module.exports = {
  // WS-1079: the seed-item writers, driven by the block-scalar round-trip test
  writeSeedWorkItems, writeDeferredScopeTripwires,
  deriveArchetypeOverrides,
  patchArchetypeOverridesBlock,
  compareBundles,
  pickTripwireProgram,
  programIdMap,
  capabilitiesFor,
  repoArchetypeFor,
  // WS-1112 (b) (c) (f) (g): genesis-ignite-proposal.test.js
  extractImaginedOutcome,
  renderProposalMarkdown,
  inferTriggerFromAntiGoal,
  antiGoalsOf,
  copyBundlePrograms,
};
