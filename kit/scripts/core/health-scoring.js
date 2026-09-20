/**
 * health-scoring.js — canonical health-scoring formula (WS-208, ADR-020).
 *
 * Extracted from kit/scripts/cwos-score.js so cwos-score (CLI),
 * kit/scripts/core/reducers/vital-signs.js (state-store reducer), and
 * any future caller share one source of truth. cwos-score.js still
 * works — it now imports from this module.
 *
 * The formula matches kit/templates/system/health-scoring.md exactly.
 *
 * Zero external dependencies.
 */

'use strict';

const path = require('path');

const { readYAMLFile, dateDiffDays } = require('../lib/cwos-utils');

// ─── Constants ──────────────────────────────────────────────────────────────

const TIER_ORDER = { dormant: 0, watch: 1, active: 2, critical: 3 };

const PROTOCOL_RIGOR = {
  delta: 2,
  baseline: 5,
  sweep: 5,
  challenge: 6,
  blind_spot: 8,
};

// Rigor level → ceiling cap
const RIGOR_CEILING = [0, 2, 4, 5, 6, 7, 8, 9, 9, 10];

const TIER_WEIGHT = { dormant: 0, watch: 1.5, active: 2.5, critical: 4.0 };
const PHASE_MULTIPLIER = { critical: 2.0, high: 1.5, medium: 1.0, low: 0.5 };
const TARGET_CEILING = { dormant: 0, watch: 4, active: 8, critical: 10 };

// ─── Protocol-entry iteration (WS-602) ─────────────────────────────────────

/**
 * Yield only the protocol entries that are actually *defined*.
 *
 * A program may legitimately write `challenge: null` (or `blind_spot: null`)
 * under `protocols:` to say "this slot is declared and deliberately unused" —
 * e.g. a `monitor_only` program that will never run an adversarial check on
 * the adversarial checker. The kit's YAML reader parses those to real `null`,
 * so every consumer that dereferenced `protoDef.<field>` threw
 * `TypeError: Cannot read properties of null`.
 *
 * This is the single place that decides what a usable protocol entry is.
 * All four consumers below iterate through here rather than carrying their
 * own null check, so the definition cannot drift between them.
 *
 * Coverage-denominator decision (WS-602): a null entry is EXCLUDED from every
 * denominator, not counted as an unchecked protocol. It is "declared and
 * deliberately unused" — counting it would permanently penalize a program for
 * documenting a decision it made on purpose, and would make deleting the key
 * outright score better than explaining it. The two denominators affected:
 *   - protocol_currency averages over `activeProtocols`, which now contains
 *     only defined entries at/above tier. A program with baseline defined and
 *     challenge null scores exactly as if challenge were absent.
 *   - problem_class_coverage divides by `prog.problem_classes.length`, which
 *     null protocol entries never contributed to in the first place; they now
 *     simply contribute nothing to the numerator instead of throwing.
 */
function* protocolEntries(protocols) {
  for (const [proto, protoDef] of Object.entries(protocols || {})) {
    // Retired / deliberately-unused slots are `<proto>: null`. Non-objects
    // (a stray string or number) are treated the same way: undefinable, so
    // not active — never dereferenced.
    if (!protoDef || typeof protoDef !== 'object') continue;
    yield [proto, protoDef];
  }
}

/**
 * Defined protocol entries whose `min_tier` is satisfied by the program's
 * current tier. Builds on protocolEntries, so the null guard lives in exactly
 * one place.
 */
function* activeProtocolEntries(protocols, tier) {
  const tierLevel = TIER_ORDER[tier] || 0;
  for (const [proto, protoDef] of protocolEntries(protocols)) {
    const minTier = protoDef.min_tier || 'dormant';
    if (tierLevel < (TIER_ORDER[minTier] || 0)) continue;
    yield [proto, protoDef];
  }
}

// ─── Findings helpers ──────────────────────────────────────────────────────

function loadFindingsIndex(wsDir) {
  const indexPath = path.join(wsDir, 'findings-index.yaml');
  const { ok, data } = readYAMLFile(indexPath);
  if (!ok || !data.findings) return [];
  return Array.isArray(data.findings) ? data.findings : [];
}

function countOpenFindings(programId, findingsIndex) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findingsIndex) {
    if (f.program === programId && f.status === 'open') {
      const sev = String(f.severity).toLowerCase();
      if (counts.hasOwnProperty(sev)) counts[sev]++;
    }
  }
  return counts;
}

// ─── Health-score formula (canonical) ──────────────────────────────────────

function computeHealthScore(prog, findingsIndex, today) {
  const tier = prog.tier || 'dormant';
  const protocols = prog.protocols || {};
  const lastRuns = prog.last_run_by_protocol || {};
  const problemClasses = prog.problem_classes || [];
  const maturityLevel = (prog.maturity && prog.maturity.level) || 0;

  // Step 1: Rigor ceiling (highest rigor level achieved)
  let maxRigor = 0;
  for (const [proto, runInfo] of Object.entries(lastRuns)) {
    if (runInfo && runInfo.date) {
      const rigor = PROTOCOL_RIGOR[proto] || 0;
      maxRigor = Math.max(maxRigor, rigor);
    }
  }
  const evidence = prog.evidence || {};
  const history = evidence.protocol_history || [];
  for (const entry of history) {
    if (entry.engine === 'quality-judge') maxRigor = Math.max(maxRigor, 7);
    if (entry.engine === 'meta-engine') maxRigor = Math.max(maxRigor, 9);
  }
  const rigorIdx = Math.min(maxRigor, RIGOR_CEILING.length - 1);
  const ceiling = RIGOR_CEILING[rigorIdx];

  // Step 2: finding_health
  const openFindings = countOpenFindings(prog.id, findingsIndex);
  const findingPenalty = (openFindings.critical * 0.4) + (openFindings.high * 0.2) + (openFindings.medium * 0.1);
  const findingHealth = Math.max(0.0, 1.0 - findingPenalty);

  // Step 3: protocol_currency
  const protocolCurrency = computeProtocolCurrency(protocols, lastRuns, tier, today);

  // Step 4: problem_class_coverage
  const totalClasses = problemClasses.length || 1;
  let checkedClasses = 0;
  // WS-602: iterate defined entries only — `challenge: null` used to throw here
  // the moment a matching run existed. Not tier-filtered: coverage credits any
  // protocol that has actually run, regardless of the program's current tier.
  for (const [proto, protoDef] of protocolEntries(protocols)) {
    const run = lastRuns[proto];
    if (run && run.date) {
      if (protoDef.problem_classes === 'all') { checkedClasses = totalClasses; break; }
      if (Array.isArray(protoDef.problem_classes)) {
        checkedClasses = Math.max(checkedClasses, protoDef.problem_classes.length);
      }
    }
  }
  const coverage = checkedClasses / totalClasses;

  // Step 5: maturity_progress
  const maturityProgress = maturityLevel / 4;

  // Step 6: earned_score
  const raw = (findingHealth * 0.35) + (protocolCurrency * 0.25)
            + (coverage * 0.25) + (maturityProgress * 0.15);
  const earnedScore = Math.round(raw * ceiling);

  // Step 7: apply ceiling
  let score = Math.min(earnedScore, ceiling);

  // Step 8: hard caps (penalties)
  const capsApplied = [];
  if (openFindings.critical > 0) {
    score = Math.min(score, 4);
    capsApplied.push('CRITICAL finding -> max 4');
  }
  if (openFindings.high >= 3) {
    score = Math.min(score, 6);
    capsApplied.push('3+ HIGH findings -> max 6');
  }
  const accountability = prog.accountability || {};
  const onStale = accountability.on_stale || {};
  if (onStale.block_sprint && isStale(protocols, lastRuns, tier, today, prog.created_at)) {
    score = Math.min(score, 2);
    capsApplied.push('block_sprint + stale -> max 2');
  }

  // Step 9: staleness decay
  const mostRecentRun = getMostRecentRunDate(lastRuns);
  if (mostRecentRun) {
    const effectiveCadence = getEffectiveCadence(protocols, tier);
    if (effectiveCadence > 0) {
      const daysSince = dateDiffDays(mostRecentRun, today);
      if (daysSince > 2 * effectiveCadence) {
        const extraPeriods = Math.floor((daysSince - 2 * effectiveCadence) / effectiveCadence);
        if (extraPeriods > 0) {
          score = Math.max(1, score - extraPeriods);
          capsApplied.push(`staleness decay -${extraPeriods}`);
        }
      }
    }
  }

  return {
    id: prog.id,
    score, ceiling, maxRigor,
    findingHealth: round2(findingHealth),
    protocolCurrency: round2(protocolCurrency),
    coverage: round2(coverage),
    maturityProgress: round2(maturityProgress),
    raw: round2(raw),
    earnedScore, capsApplied, openFindings,
  };
}

function computeProtocolCurrency(protocols, lastRuns, tier, today) {
  const activeProtocols = [];
  for (const [proto, protoDef] of activeProtocolEntries(protocols, tier)) {
    activeProtocols.push({ name: proto, cadence: protoDef.cadence_days || 30 });
  }
  if (activeProtocols.length === 0) return 0.0;

  let sum = 0;
  for (const ap of activeProtocols) {
    const run = lastRuns[ap.name];
    if (!run || !run.date) return 0.0;
    const daysSince = dateDiffDays(run.date, today);
    sum += Math.min(1.0, ap.cadence / Math.max(daysSince, 1));
  }
  return sum / activeProtocols.length;
}

function isStale(protocols, lastRuns, tier, today, programCreatedAt) {
  for (const [proto, protoDef] of activeProtocolEntries(protocols, tier)) {
    const cadence = protoDef.cadence_days || 30;
    const run = lastRuns[proto];
    // A never-run protocol on a young program isn't stale — it's pre-due.
    // Anchor the cadence × 2 window at program.created_at when no run exists.
    // Falls back to the legacy "always stale" behavior if created_at is unset.
    const anchor = (run && run.date) ? run.date : programCreatedAt;
    if (!anchor) return true;
    if (dateDiffDays(anchor, today) > cadence * 2) return true;
  }
  return false;
}

function getMostRecentRunDate(lastRuns) {
  let latest = null;
  for (const run of Object.values(lastRuns)) {
    if (run && run.date) {
      if (!latest || run.date > latest) latest = run.date;
    }
  }
  return latest;
}

function getEffectiveCadence(protocols, tier) {
  let minCadence = Infinity;
  for (const [, protoDef] of activeProtocolEntries(protocols, tier)) {
    const cadence = protoDef.cadence_days || 30;
    minCadence = Math.min(minCadence, cadence);
  }
  return minCadence === Infinity ? 30 : minCadence;
}

function round2(n) { return Math.round(n * 100) / 100; }

module.exports = {
  TIER_ORDER, PROTOCOL_RIGOR, RIGOR_CEILING, TIER_WEIGHT, PHASE_MULTIPLIER, TARGET_CEILING,
  computeHealthScore, computeProtocolCurrency, isStale,
  getMostRecentRunDate, getEffectiveCadence,
  protocolEntries, activeProtocolEntries,
  loadFindingsIndex, countOpenFindings,
  round2,
};
