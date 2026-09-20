#!/usr/bin/env node
/**
 * cwos-verify — Executable invariant checks.
 *
 * Implements the 11 scriptable invariants from system/invariants.md as
 * deterministic checks. Replaces "verified by manual inspection" with
 * "verified by code." Wired into vital signs via cwos-state.js.
 *
 * Usage:
 *   node cwos-verify.js                    # all checks, summary
 *   node cwos-verify.js --only INV-014     # single check
 *   node cwos-verify.js --quiet            # silent unless failure
 *   node cwos-verify.js --strict           # exit 1 on any failure
 *   node cwos-verify.js --fix              # update Last Verified dates for passing checks
 *
 * Incremental / fast selection (WS-429 / FIND-296 — cap session-start latency):
 *   node cwos-verify.js --fast-mode               # curated high-signal subset only
 *   node cwos-verify.js --since-git-commit [ref]  # only invariants guarding changed files
 *   node cwos-verify.js --fast-mode --since-git-commit   # union (session-start default)
 *
 *   - --since-git-commit selects invariants whose watched_paths (INVARIANT_META)
 *     overlap the changed-file set since `ref` (default: working tree + staged +
 *     untracked). An invariant with NO watched_paths is ALWAYS-RUN — incremental
 *     mode never silently skips an unclassified check. Git-absent => full set.
 *   - --fast-mode runs only invariants tagged `fast: true` (cheap, always-relevant).
 *   - Full mode (no flags) runs every check, unchanged. Wire --fast-mode into
 *     session-start; full-mode into /verify and /audit.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { globFiles, readYAMLFile, findWorkstreamDir, todayISO, findRepoRoot, makeEventEmitter, writeFileAtomic, withFileLock } = require('./lib/cwos-utils');
const { cliGate } = require('./lib/cli');
const { parseSemver, resolveRepoVersion, baselineTag } = require('./lib/kit-version');
const { checkAgentsMd } = require('./lib/agents-md');

const emitEvent = makeEventEmitter();

// ─── Per-run YAML read cache (WS-429) ────────────────────────────────────────
//
// Several invariants read the same index files (fleet/registry.yaml, etc.). A
// module-level memo keyed by absolute path collapses those re-reads within a
// single verify invocation. Cleared at the top of every main() run so the cache
// NEVER persists across process invocations — replay/determinism is unaffected.
const _yamlCache = new Map();
function clearVerifyCache() { _yamlCache.clear(); }
function cachedReadYAMLFile(p) {
  if (_yamlCache.has(p)) return _yamlCache.get(p);
  const r = readYAMLFile(p);
  _yamlCache.set(p, r);
  return r;
}

// ─── Repo Root Discovery ────────────────────────────────────────────────────

function resolveRepoRoot() {
  const dir = findRepoRoot(process.cwd(), { markers: ['CLAUDE.md', 'kit'], requireAll: true, maxDepth: 8 });
  if (!fs.existsSync(path.join(dir, 'CLAUDE.md')) || !fs.existsSync(path.join(dir, 'kit'))) {
    throw new Error('Could not find repo root (CLAUDE.md + kit/ not found in any ancestor)');
  }
  return dir;
}

// ─── Recursive grep ─────────────────────────────────────────────────────────

function grepRecursive(rootDir, dirs, pattern, fileFilter) {
  const matches = [];
  const regex = new RegExp(pattern);
  for (const d of dirs) {
    const fullDir = path.join(rootDir, d);
    if (!fs.existsSync(fullDir)) continue;
    walkDir(fullDir, (filePath) => {
      if (fileFilter && !fileFilter(filePath)) return;
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (regex.test(line)) {
            matches.push({ file: path.relative(rootDir, filePath), line: i + 1, text: line.trim() });
          }
        });
      } catch { /* skip unreadable */ }
    });
  }
  return matches;
}

function walkDir(dir, callback) {
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkDir(full, callback);
      else if (entry.isFile()) callback(full);
    }
  } catch { /* skip */ }
}

// A kit SOURCE repo (HomeBase) authors and releases kit/ content; an adopted
// repo receives a vendored copy of the same files via /kit-upgrade, so checks
// that police the authoring/distribution surface (engine INDEX, MANIFEST
// integrity, registry templates, declarations, the invariant register itself)
// are meaningless there — the adopter cannot fix what only a release can
// change. Presence-of-file guards do NOT discriminate, because the kit ships
// many of the very files being policed (melody-hill WS-046: 11 invariants red
// in an adopted repo, every one a kit-source concern). The reliable markers:
// only the source carries fleet/registry.yaml, and only an adopted repo
// carries the .cwos-version stamp written at install.
function isKitSourceRepo(rootDir) {
  return fs.existsSync(path.join(rootDir, 'fleet', 'registry.yaml'))
    && !fs.existsSync(path.join(rootDir, '.cwos-version'));
}

const NOT_KIT_SOURCE_NA = 'not a kit source repo — N/A (this invariant polices the kit authoring/distribution surface; adopted repos receive it via /kit-upgrade)';

// ─── Invariant Checks ───────────────────────────────────────────────────────

const INVARIANT_CHECKS = [
  { id: 'INV-001', name: 'Personas Live in personas/ Only', check: checkNoKitAgentsDir },
  { id: 'INV-002', name: 'Engine INDEX Covers All Engines', check: checkEngineIndex },
  { id: 'INV-004', name: 'No Persona Simulation', check: checkNoPersonaSimulation },
  { id: 'INV-006', name: 'Queue Index Matches Queue Files', check: checkQueueIndexParity },
  { id: 'INV-008', name: 'Fleet Registry Paths Are Valid', check: checkFleetPaths },
  { id: 'INV-009', name: 'ADR Index Matches ADR Files', check: checkAdrIndex },
  { id: 'INV-010', name: 'User Guide Covers All Commands', check: checkUserGuideCoverage },
  { id: 'INV-011', name: 'System State Updated After Each Phase', check: checkStateFreshness },
  { id: 'INV-013', name: 'Convergence Engine in HomeBase-Only Set', check: checkConvergenceEngine },
  { id: 'INV-014', name: 'No Phantom Engines in Registry', check: checkRegistrySkillPaths },
  { id: 'INV-016', name: 'Optimization Backlog Reviewed After Fleet Feedback', check: checkOptimizationBacklog },
  { id: 'INV-018', name: 'Command Hardlinks Match Across kit/fleet/sim → .claude/commands', check: checkHardlinkPreservation },
  { id: 'INV-019', name: 'No orphan active sessions — no active session past the heartbeat timeout (WS-642)', check: checkSessionLiveness },
  { id: 'INV-020', name: 'Current session heartbeat is fresh — the Stop hook is actually advancing it (WS-642)', check: checkCurrentSessionHeartbeat },
  { id: 'INV-024', name: 'Distribution Referential Integrity (MANIFEST ↔ INDEX ↔ registry ↔ commands)', check: checkDistributionRefs },
  { id: 'INV-025', name: 'schema_version Type Consistency', check: checkSchemaVersionConsistency },
  { id: 'INV-026', name: 'Hook Liveness (Stop / SessionStart stamps recent)', check: checkHookLiveness },
  { id: 'INV-027', name: 'Command File Size Budget', check: checkCommandFileSizeBudget },
  { id: 'INV-028', name: 'Shadow-event instrumentation coverage (ADR-018 step 1)', check: checkShadowInstrumentationCoverage },
  { id: 'INV-029', name: 'Rollback runbook inventory matches tracked files', check: checkRunbookDrift },
  { id: 'INV-030', name: 'Snapshot-diff: events cover every mutation (WS-186)', check: checkSnapshotDiffSmoke },
  { id: 'INV-031', name: 'Replay-purity: state/*.json equals cwos-replay from events (ADR-020)', check: checkReplayPurity },
  { id: 'INV-032', name: 'Typed-API coverage: commands read state via stateStore (WS-199)', check: checkTypedApiCoverage },
  { id: 'INV-033', name: 'First-session commands are free of schema-jargon placeholders (WS-150)', check: checkFounderSurfacePlaceholders },
  { id: 'INV-034', name: 'Program contracts are customized (no [CUSTOMIZE: placeholders) (WS-152)', check: checkUncustomizedContracts },
  { id: 'INV-035', name: 'Library engine MANIFEST extends: values resolve (FIND-070 / WS-141)', check: checkManifestExtendsResolves },
  { id: 'INV-039', name: 'Fleet kit_version drift bound (FAIL-012 / WS-225)', check: checkFleetVersionDrift },
  { id: 'INV-040', name: 'Critical-tier program templates instantiated in HomeBase registry (FAIL-015 / WS-226)', check: checkTemplateProgramInstantiation },
  { id: 'INV-038', name: 'Approved sprints record anti_goal_check for constitutional accountability (FAIL-010 / WS-227)', check: checkAntiGoalCrossCheck },
  { id: 'INV-037', name: 'Sprint anchor distribution bound — internal-infra ≤ 70% in 90-day window (FAIL-009 / WS-230)', check: checkAnchorDistribution },
  { id: 'INV-036', name: 'Hook-race protection holds — concurrent stampHookLiveness preserves both fields (FAIL-007 / WS-228)', check: checkHookRaceProtection },
  { id: 'INV-readpath-determinism', name: 'AI not invoked for pure read-path work — parse-and-compare phases ship as scripts (ADVISORY) (WS-391)', check: checkReadPathDeterminism },
  { id: 'INV-041', name: 'Every product program ships a capability_brief (FAIL-016 / WS-166)', check: checkCapabilityBriefSchema },
  { id: 'INV-042', name: 'Output Shape coverage — common-traffic commands declare response shape (FIND-082 / WS-158)', check: checkOutputShapeCoverage },
  { id: 'INV-043', name: 'CLI-bypass-via-command — audited commands actually invoked (FIND-119 / WS-276)', check: checkCliBypassViaCommand },
  { id: 'INV-044', name: 'Replay-pure fields: every cached field is deterministic across replays (WS-261 / AS-037-11)', check: checkReplayPureFields },
  { id: 'INV-cli-envelope-consumed-completely', name: 'AI obeys Prohibited Reads — Read tool count per /next ≤ 5 (WS-271 / AS-037-1)', check: checkReadRestraint },
  { id: 'INV-045', name: 'Shell-safe pattern — no execSync template-literal interpolation in kit/scripts/ (ADR-043 / WS-306)', check: checkShellSafePattern },
  { id: 'INV-disambiguation-catalog-single-source', name: 'Disambiguation predicates live only in core/cwos-catch-state-catalog.js (ADR-040 D5 / WS-642)', check: checkDisambiguationCatalogSingleSource },
  { id: 'INV-cli-subcommand-cap', name: 'ADR-037 extracted CLIs dispatch exactly their allowlisted subcommands — cap 5 + conscious additions (AS-037-4 / WS-642)', check: checkCliSubcommandCap },
  { id: 'INV-046', name: 'Persona-dispatch runtime audit — most-recent manifest per tracked engine has no FAIL (WS-316 / ADR-044)', check: checkPersonaDispatch },
  { id: 'INV-047', name: 'Program YAML schema — no duplicate top-level keys in prog-*.yaml (FIND-128 / WS-295)', check: checkProgramYamlSchema },
  { id: 'INV-048', name: 'Engine Intent Contract block matches frontmatter (name + default_mode) (WS-327)', check: checkEngineContractConsistency },
  { id: 'INV-049', name: 'HomeBase-only engines flagged in MANIFEST — every engines/homebase-only/* entry has homebase_only: true (WS-315 / ADR-049)', check: checkHomebaseOnlyManifestFlag },
  { id: 'INV-053', name: 'Adopter-value relation declared on kit-quality findings (WS-436 / FIND-312)', check: checkAdopterValueRelation },
  { id: 'INV-055', name: 'Adopter-controlled config values pass through boundedPath helpers (WS-430 / FIND-300 + FIND-261)', check: checkBoundedPathContainment },
  { id: 'INV-056', name: 'Every kit/commands/*.md has a MANIFEST entry (reverse INV-024) (WS-420 / FIND-279)', check: checkCommandManifestCoverage },
  { id: 'INV-057', name: 'cwos-adopt-install.js uses writeFileAtomic exclusively (WS-426 / FIND-291 + FIND-292)', check: checkAdoptInstallAtomicWrites },
  { id: 'INV-059', name: 'No shipped kit file hardcodes docs/evolution/ — calibration paths must resolve per repo scope (WS-421 / FIND-281)', check: checkNoHardcodedEvolutionPaths },
  { id: 'INV-program-fields-have-runtime-effect', name: 'prog-template accountability fields have runtime readers (WS-366 / FIND-248)', check: checkProgramFieldsHaveRuntimeEffect },
  { id: 'INV-preflight-gate-not-bypassed', name: 'Single-question pre-flight gate not bypassed — ack markers have matching ack events (ADVISORY) (WS-433 / FIND-305)', check: checkPreflightGateNotBypassed },
  { id: 'INV-060', name: 'Engine model tiers declared + floor-respecting — agent-dispatch engines declare model_tiers; no dead model: scalar; floors honored (WS-390)', check: checkEngineModelTiers },
  { id: 'INV-061', name: 'State-domain rebuild contract — every domain classified, none git-tracked, refresh hook wired (ADR-058 / WS-504)', check: checkStateDomainRebuildContract },
  { id: 'INV-062', name: 'Security posture matches declaration — this node runs the permission mode + guards it declares (ADR-059 / WS-521)', check: checkSecurityPostureMatchesDeclaration },
  { id: 'INV-063', name: 'Every fleet repo declares a phone_surface — kind: none is an answer, omission is not (WS-516)', check: checkPhoneSurfaceDeclared },
  { id: 'INV-064', name: 'Every kit distribution list is complete — kit/MANIFEST.yaml ships every module its registered scripts require and every data file they read, and the /genesis M0 seed list is require-closed (WS-544 / WS-607 / WS-611)', check: checkManifestDepsComplete },
  { id: 'INV-065', name: 'Every fleet .cwos-version resolves to a version with a real kit baseline (WS-547 / ADR-064 P1)', check: checkVersionStampsResolvable },
  { id: 'INV-066', name: 'No script resolves a root by counting parent dirs up from __dirname (WS-549 / ADR-064 P3)', check: checkPathRootResolution },
  { id: 'INV-067', name: 'No closure field is written behind a key-presence guard — value-aware upsert only (WS-561)', check: checkClosureGuardShape },
  { id: 'INV-068', name: 'Every mechanism kit/declarations.yaml declares has a live consumer — no declaration fails open (WS-562)', check: checkDeclarationsHaveConsumers },
  { id: 'INV-069', name: 'files_locked has a live writer AND a live reader — the session-schema field that shipped with neither (WS-564)', check: checkFilesLockedIsLive },
  { id: 'INV-070', name: 'Verify itself completes: fast-mode stays inside its budget and replay-purity is actually confirmed (WS-566)', check: checkVerifyLiveness },
  { id: 'INV-071', name: 'kit/ matches the baseline of the version it claims — unreleased changes cannot propagate (WS-578)', check: checkReleaseDrift },
  { id: 'INV-072', name: 'No fleet repo carries stranded .kit-update sidecars — an unreviewed sidecar is a lost kit update (WS-592)', check: checkStrandedSidecars },
  { id: 'INV-073', name: 'kit/MANIFEST.yaml ships every script its registered commands invoke — command references live in markdown, outside INV-064\'s require() graph (WS-639)', check: checkCommandDepsShipped },
  { id: 'INV-074', name: 'The invariant register and the enforcement are the same list — every declared invariant names a real enforcer, every registered check is declared (WS-641)', check: checkInvariantRegisterConsistent },
  { id: 'INV-075', name: 'Always-loaded prose stays within budget (WS-672)', check: checkProseBudget },
  { id: 'INV-076', name: "A promoted lesson's prose is deleted (WS-672)", check: checkPromotedProseRetired },
  { id: 'INV-077', name: 'One event-log reader — no script outside core/ enumerates the events directory itself (WS-482)', check: checkEventsReaderUnification },
  { id: 'INV-078', name: 'State is written atomically — no raw fs.writeFileSync to durable state under kit/scripts/ (WS-643)', check: checkAtomicStateWrites },
  { id: 'INV-079', name: 'No TRACKED file is matched by an ignore rule — a blanket rule that swallows new files of a class the repo already tracks (Claude-Poker-Tracker WS-671)', check: checkTrackedButIgnored },
  { id: 'INV-090', name: 'One contract per open engine run — no second engine_intent_recorded lands over an open one without an --amend marker (ADVISORY) (WS-472 / FIND-122 sub-5)', check: checkOneContractPerOpenRun },
  { id: 'INV-080', name: 'Every directory under .claude/worktrees/ is a REGISTERED worktree — an unregistered one is invisible to both git status and worktree list (Claude-Poker-Tracker WS-672)', check: checkOrphanedWorktreeDirs },
  { id: 'INV-081', name: "cwos-next refuses a flag it does not recognise, and its flag map matches the flags the code actually reads (ADR-063 / WS-732)", check: checkNextCliContract },
  { id: 'INV-082', name: 'No settings JSON declares the same key twice — JSON.parse keeps the last and silently deletes what the earlier one configured (WS-606)', check: checkSettingsNoDuplicateKeys },
  { id: 'INV-083', name: 'cwos-event refuses a malformed command line instead of writing an invented record into the append-only ledger (ADR-063 / WS-594)', check: checkEventCliContract },
  { id: 'INV-084', name: 'Every released kit-v* tag has a usable hash baseline - release step 2 and step 3 cannot come apart (WS-610)', check: checkBaselineCoverage },
  { id: 'INV-085', name: "The courier's return leg is watermarked, lane-separated, and answers back — a repo request cannot re-promote forever, leak into the friction lane, or be declined without the asking repo hearing why (WS-699)", check: checkRequestChannel },
  { id: 'INV-086', name: 'A KEV finding clears only on evidence — every Windows node probed and carrying a remediating KB; unreachable nodes and dead feeds fail closed (WS-660)', check: checkKevPatchOracle },
  { id: 'INV-087', name: 'The YAML reader undoes exactly what the writers do — write/read is a fixed point, and Windows paths keep their \\r and \\n (WS-735)', check: checkYamlEscapeRoundtrip },
  { id: 'INV-088', name: 'An absence claim carries the search that established it — a grep that misses is indistinguishable from a grep that finds nothing (WS-701 / RC2-absence)', check: checkAbsenceClaimsCarryEvidence },
  { id: 'INV-089', name: 'The kit test suites actually run, and none is red — a suite nobody runs is a wish (WS-808)', check: checkTestSweepGreen },
  { id: 'INV-091', name: 'No script hardcodes the system dir — paths.system_dir governs, or a repo that renamed it reads as empty (WS-703)', check: checkSystemDirNotHardcoded },
  { id: 'INV-092', name: "AGENTS.md does not contradict the repo's own Vital Signs — a portability hedge that lies is worse than none (WS-527 / ADR-069)", check: checkAgentsMdMatchesVitalSigns },
  { id: 'INV-093', name: 'No WS id minted here names different work on the remote — a cross-node id collision is loud and repairable, not a pull that quietly stops working (issue #26)', check: checkWsIdCollisionWithRemote },
];

// ─── Incremental-selection + fast-mode metadata (WS-429 / FIND-296) ──────────
//
// watched_paths: repo-relative path PREFIXES (forward-slash). A dir prefix ends
//   with '/'; a bare path matches that file exactly or as a directory. In
//   --since-git-commit mode an invariant runs iff one of its watched_paths
//   prefixes a changed file. An invariant absent from this map (or with empty
//   watched_paths) is ALWAYS-RUN — incremental mode never silently skips an
//   unclassified check (the conservative default that keeps coverage honest).
//
// fast: the curated high-signal subset run by --fast-mode — cheap, always-
//   relevant checks that catch the most common silent breakage, chosen so the
//   set is comfortable to run on every session start.
const INVARIANT_META = {
  'INV-001': { watched_paths: ['kit/agents/'] },
  'INV-002': { watched_paths: ['engines/'], fast: true },
  'INV-006': { watched_paths: ['.claude/workstream/queue/', '.claude/workstream/queue-index.yaml', '.claude/workstream/state/queue.json'], fast: true },
  'INV-008': { watched_paths: ['fleet/'] },
  'INV-009': { watched_paths: ['docs/'], fast: true },
  'INV-010': { watched_paths: ['kit/commands/', 'docs/'] },
  'INV-013': { watched_paths: ['engines/', 'kit/MANIFEST.yaml'] },
  'INV-014': { watched_paths: ['engines/', 'kit/templates/workstream/engines/registry.yaml', '.claude/workstream/engines/registry.yaml'], fast: true },
  'INV-018': { watched_paths: ['kit/commands/', 'fleet/commands/', 'sim/commands/', '.claude/commands/'], fast: true },
  'INV-024': { watched_paths: ['kit/MANIFEST.yaml', 'engines/INDEX.md', '.claude/commands/', 'kit/commands/', 'engines/'] },
  'INV-027': { watched_paths: ['kit/commands/', 'fleet/commands/', 'sim/commands/', '.claude/commands/'] },
  // Both are cheap file reads over a handful of paths, so both are fast-set:
  // prose grows by edit, and catching it at session-start is the point.
  'INV-075': { watched_paths: ['kit/prose-budget.yaml', 'kit/claude-preamble.md', 'CLAUDE.md'], fast: true },
  'INV-076': { watched_paths: ['kit/scripts/cwos-guard.js'], fast: true },
  // Cheap read over a bounded directory, same reasoning as INV-076: a false
  // absence claim is cheapest to catch before it reaches an envelope.
  'INV-088': { watched_paths: ['.claude/workstream/findings/', 'kit/scripts/cwos-finding-validate.js'], fast: true },
  // NOT fast, despite costing almost nothing: the fast set is already 33 checks
  // and 11.4s against the SessionStart hook's 8s timeout, so it is being killed
  // mid-loop every session (which is what INV-070 has been reporting). Adding to
  // an over-budget set because one's own check is cheap is how the set got here.
  // The signal is not lost — the daily sweep stamps it and /next renders it.
  'INV-089': { watched_paths: ['kit/scripts/'] },
  // Same reasoning as INV-089: cheap, but the fast set is already over the
  // SessionStart budget. A new hardcoded join arrives by edit and the daily
  // sweep catches it well before it can reach a release.
  'INV-091': { watched_paths: ['kit/scripts/'] },
  // NOT fast, for the reason INV-089 and INV-091 give: the fast set is already
  // 33 checks and 11.4s against an 8s SessionStart timeout, so it is killed
  // mid-loop every session. "My check is cheap" is exactly how it got there,
  // and a 34th entry in a set that never finishes is not enforcement. Both
  // inputs change by edit, which --since-git-commit catches on the next verify.
  //
  // Known limit: the watched path is the kit default. A repo that renamed
  // system_dir gets this as an always-run check instead (an absent prefix never
  // matches), which is the conservative direction.
  'INV-092': { watched_paths: ['AGENTS.md', 'system/state.md'] },
  // No watched_paths: the OTHER side of this comparison is the remote, which
  // changes with no local file changing at all. Cheap enough for the fast set —
  // three git reads and one throttled fetch with a short timeout.
  'INV-093': { fast: true },
  'INV-028': { watched_paths: ['kit/scripts/', 'docs/'] },
  'INV-029': { watched_paths: ['docs/', 'kit/scripts/'] },
  'INV-030': { watched_paths: ['kit/scripts/core/'] },
  // NOT fast (WS-566), and heavy (WS-609). Measured at 281s on a 10k-event
  // log, and the cost grows with the log forever — it replays every event from
  // origin. It sat in the fast set against an 8-second SessionStart timeout,
  // so it was launched and killed every session and ADR-020's replay-purity
  // guarantee was verified never. WS-566 demoted it from fast, but
  // --since-git-commit still unioned it in on every SessionStart because
  // .claude/workstream/ is always dirty — heavy closes that door: it now runs
  // only in the no-flag full set or via --only. INV-070 fails if its last
  // confirmed pass goes stale, so excluding it does not mean forgetting it.
  'INV-031': { watched_paths: ['.claude/workstream/'], heavy: true },
  'INV-032': { watched_paths: ['kit/scripts/'] },
  'INV-033': { watched_paths: ['kit/commands/'] },
  'INV-034': { watched_paths: ['.claude/workstream/programs/', 'kit/templates/workstream/programs/'] },
  'INV-035': { watched_paths: ['kit/MANIFEST.yaml', 'engines/'] },
  'INV-039': { watched_paths: ['fleet/', 'kit/VERSION'] },
  'INV-040': { watched_paths: ['.claude/workstream/programs/', 'kit/templates/workstream/programs/'] },
  'INV-038': { watched_paths: ['.claude/workstream/sprints/'] },
  'INV-037': { watched_paths: ['.claude/workstream/sprints/', '.claude/workstream/queue/'] },
  'INV-036': { watched_paths: ['kit/scripts/'] },
  'INV-readpath-determinism': { watched_paths: ['kit/scripts/'] },
  'INV-041': { watched_paths: ['.claude/workstream/programs/', 'kit/templates/workstream/programs/'] },
  'INV-042': { watched_paths: ['kit/commands/'] },
  'INV-043': { watched_paths: ['kit/commands/'] },
  // heavy (WS-609): measured at 649s on an 11.4k-event log against the 8s
  // SessionStart hook timeout. Two full replays per run (determinism check),
  // cost grows with the log. Same enforcement story as INV-031: INV-070's
  // last_field_purity_ok_at staleness check keeps it honest on a 14-day
  // cadence, and `--only INV-044` runs it deliberately.
  'INV-044': { watched_paths: ['.claude/workstream/'], heavy: true },
  'INV-045': { watched_paths: ['kit/scripts/'] },
  'INV-disambiguation-catalog-single-source': { watched_paths: ['kit/scripts/', 'engines/'] },
  'INV-cli-subcommand-cap': { watched_paths: ['kit/scripts/cwos-next.js', 'kit/scripts/cwos-pulse.js', 'kit/scripts/cwos-audit.js', 'kit/scripts/cwos-decide.js', 'kit/scripts/cwos-verify.js'], fast: true },
  'INV-046': { watched_paths: ['.claude/workstream/runs/', 'engines/'] },
  'INV-047': { watched_paths: ['.claude/workstream/programs/'], fast: true },
  'INV-048': { watched_paths: ['engines/'] },
  'INV-049': { watched_paths: ['kit/MANIFEST.yaml', 'engines/homebase-only/'] },
  'INV-053': { watched_paths: ['.claude/workstream/findings/'] },
  'INV-055': { watched_paths: ['kit/scripts/'] },
  'INV-056': { watched_paths: ['kit/commands/', 'kit/MANIFEST.yaml'] },
  'INV-057': { watched_paths: ['kit/scripts/cwos-adopt-install.js'] },
  'INV-059': { watched_paths: ['kit/'] },
  'INV-060': { watched_paths: ['engines/'] },
  'INV-061': { watched_paths: ['kit/scripts/core/state-store.js', '.gitignore', '.claude/settings.json', '.claude/settings.local.json'], fast: true },
  // fast: true — posture drift should surface at session start, not only on a
  // full pass. The whole point of ADR-059 is that the posture stopped being an
  // unexamined inheritance; a check that runs rarely would recreate that.
  'INV-062': { watched_paths: ['fleet/registry.yaml', 'kit/scripts/cwos-security-posture-check.js'], fast: true },
  // Not fast — this only changes when the registry does, and the offline half
  // is cheap but not free. The registry is in watched_paths, so adding a repo
  // triggers it.
  'INV-063': { watched_paths: ['fleet/registry.yaml', 'kit/scripts/cwos-phone-surface-check.js'] },
  // Any script edit can introduce a require, so kit/scripts/ is watched whole.
  // fast: a full run is a few hundred file reads and it catches the breakage
  // class that ships silently to every repo.
  // kit/data/ is watched because WS-607 made this check cover data coverage:
  // adding a file there with no MANIFEST row is the violation, and without this
  // path --since-git-commit would skip the very commit that introduces it.
  // WS-811: these four were 8,349ms of the fast set's 11,669ms — 72% of the cost
  // in 4 of 32 checks, against an 8s SessionStart hook timeout the pass was
  // therefore never finishing inside. None loses coverage by leaving fast: the
  // two CLI-contract checks spawn fixtures under kit/scripts/__tests__/ that
  // cwos-test-sweep now runs every day, and the two distribution checks are
  // release-blocking gates inside cwos-hash-manifest.js with no bypass flag.
  // They still run in the full set. Dropping them takes fast to ~3.3s.
  'INV-064': { watched_paths: ['kit/MANIFEST.yaml', 'kit/scripts/', 'kit/data/'] },
  // fast: a handful of stamp reads plus one `git rev-parse` per repo. Cheap, and
  // it gates whether any upgrade in the fleet can be computed at all.
  'INV-065': { watched_paths: ['fleet/registry.yaml', 'kit/scripts/lib/kit-version.js', 'kit/scripts/cwos-migrate.js'], fast: true },
  // fast: a regex over ~170 files. Any script edit can reintroduce the pattern,
  // so kit/scripts/ is watched whole — the same reasoning as INV-064.
  'INV-066': { watched_paths: ['kit/scripts/'], fast: true },
  'INV-067': { watched_paths: ['kit/scripts/'], fast: true },
  // A consumer can stop reading a declared value in any script edit, and a
  // declaring file can gain a value in any manifest edit, so both are watched
  // whole. fast: it scans one registry plus its listed consumers, not the tree.
  'INV-068': { watched_paths: ['kit/declarations.yaml', 'kit/MANIFEST.yaml', 'kit/scripts/'] },
  'INV-069': { watched_paths: ['kit/scripts/'], fast: true },
  // Deliberately fast AND cheap: it reads one small stamp file. A budget check
  // that could itself blow the budget would be its own first violation.
  'INV-070': { watched_paths: ['kit/scripts/cwos-verify.js', '.claude/workstream/'], fast: true },
  // Watches kit/ WHOLE, deliberately. INV-039 watches only ['fleet/',
  // 'kit/VERSION'] and so never re-runs when kit/scripts/ changes — which is
  // exactly how 33 commits of kit changes reached no repo without any
  // invariant noticing. Measured at 97ms over 405 files, so it is cheap
  // enough for the fast set that runs every session (cf. INV-031, demoted
  // for costing 281s).
  'INV-071': { watched_paths: ['kit/'], fast: true },
  // Neither fast nor heavy (WS-592). Measured 2026-08-13 at ~1.9s wall
  // (12 hosted repos, node_modules/.git/.cwos-snapshots pruned) — cheap
  // enough for the full set, too slow for the 8s SessionStart hook next to
  // 17 other fast checks. Revisit with a fresh measurement if the fleet
  // grows (the WS-609 discipline: promotion needs a number, not a hunch).
  'INV-072': { watched_paths: ['fleet/registry.yaml', 'kit/scripts/cwos-sidecar-audit.js', 'kit/scripts/cwos-migrate.js', 'kit/scripts/cwos-adopt-install.js'] },
  'INV-074': { watched_paths: ['system/invariants.md', 'kit/scripts/cwos-verify.js', 'kit/scripts/cwos-invariant-register-validate.js'] },
  'INV-program-fields-have-runtime-effect': { watched_paths: ['kit/templates/workstream/programs/', 'kit/scripts/'] },
  'INV-preflight-gate-not-bypassed': { watched_paths: ['.claude/workstream/events/'], fast: true },
  'INV-090': { watched_paths: ['.claude/workstream/events/'], fast: true },
  // ALWAYS-RUN (no watched_paths, intentionally): INV-004 (broad persona scan),
  // INV-011 (state freshness, time-based), INV-016 (backlog review cadence),
  // INV-025 (schema_version, repo-wide), INV-026 (hook liveness, time-based —
  // but FAST so session-start always sees it), INV-cli-envelope-consumed-
  // completely (telemetry-based).
  // Any script edit can hand-roll a new events-dir scan, so kit/scripts/ is
  // watched whole — same reasoning as INV-064/INV-066. fast: measured at 230ms
  // (a regex pass over ~170 files plus a small tmpdir fixture), and the class it
  // guards ships silently: a second filename predicate makes the log disagree
  // with itself with nothing failing.
  'INV-077': { watched_paths: ['kit/scripts/'], fast: true },
  // NOT fast, deliberately (WS-609 discipline: promotion needs a number).
  // Measured 2026-08-19 at 10.3s wall — Parts A–C are live concurrency probes
  // (5,582 reads against a concurrent writer, a 400-write win32 rename
  // contention probe). The whole fast set has a 15s budget (INV-070), so this
  // one check would consume two thirds of it. Full set only; kit/scripts/ is
  // watched whole so --since-git-commit still catches the commit that
  // reintroduces a raw write.
  'INV-078': { watched_paths: ['kit/scripts/'] },
  // Both watch the file that DECLARES the rule, not the tree it governs — the
  // tree changes constantly and the rule almost never does, so watching the
  // rule is what makes these cheap enough to be fast-set members.
  'INV-079': { watched_paths: ['.gitignore', '.git/info/exclude'], fast: true },
  'INV-080': { watched_paths: ['.claude/worktrees/'], fast: true },
  // Watches the script that DECLARES the contract, not the tree. Cheap enough
  // for the fast set: a handful of sub-second rejection-path spawns plus one
  // regex pass over a single file. Every command it runs exits before
  // cwos-next touches state, so the check itself never mutates the workstream.
  'INV-081': { watched_paths: ['kit/scripts/cwos-next.js'] },
  'INV-082': { watched_paths: ['.claude/settings.json', '.claude/settings.local.json', 'kit/templates/'], fast: true },
  'INV-083': { watched_paths: ['kit/scripts/cwos-event.js'] },
  'INV-084': { watched_paths: ['kit/VERSION', 'kit/hashes-'], fast: true },
  'INV-026': { fast: true },
  // INV-019/020 are time-based like INV-026 (staleness accrues with no file
  // change to watch) and read only the sessions dir — cheap enough for fast.
  'INV-019': { fast: true },
  'INV-020': { fast: true },
};

// Does a changed file (repo-relative, forward-slash) fall under a watched prefix?
function fileMatchesPrefix(file, prefix) {
  if (prefix.endsWith('/')) return file === prefix.slice(0, -1) || file.startsWith(prefix);
  return file === prefix || file.startsWith(prefix + '/');
}

// Changed-file set since `ref` (optional). Union of committed-since-ref +
// unstaged + staged + untracked, repo-relative, forward-slashed. Returns null
// when git is unavailable or the ref is bad — callers fail safe (run full set).
function getChangedFiles(rootDir, ref) {
  const { spawnSync } = require('child_process');
  const run = (gitArgs) => {
    const r = spawnSync('git', gitArgs, { cwd: rootDir, encoding: 'utf8', timeout: 5000 });
    if (!r || r.status !== 0 || typeof r.stdout !== 'string') return null;
    return r.stdout.split('\n').map((s) => s.trim()).filter(Boolean);
  };
  if (run(['rev-parse', '--show-toplevel']) === null) return null; // not a git repo
  const sets = [];
  if (ref) {
    const committed = run(['diff', '--name-only', ref, 'HEAD']);
    if (committed === null) return null; // bad ref → fail safe to full set
    sets.push(committed);
  }
  for (const args of [['diff', '--name-only'], ['diff', '--name-only', '--cached'], ['ls-files', '--others', '--exclude-standard']]) {
    const out = run(args);
    if (out) sets.push(out);
  }
  const all = new Set();
  for (const s of sets) for (const f of s) all.add(f.replace(/\\/g, '/'));
  return Array.from(all);
}

// ─── The SessionStart hook's real shape (WS-811) ────────────────────────────
//
// "8 seconds" existed in THREE independent places: the hook's own `timeout` in
// settings, `HOOK_TIMEOUT_MS` in verify-perf.test.js, and INV-070's
// FAST_BUDGET_MS (which said 15000 — nearly 2x the others, so a run could pass
// the invariant and still be killed by the hook). Nothing derived one from
// another, and nothing noticed they disagreed.
//
// Worse, the test and the hook did not run the same COMMAND. verify-perf spawned
// `--fast-mode` and asserted it against a 5s budget; it passed, for weeks, while
// the hook ran `--fast-mode --since-git-commit` and measured 7.5s warm / 26.7s
// cold against its 8s timeout (cm-node1, 2026-09-11). A green test about a
// command nobody ships is not weaker evidence than no test — it is worse, because
// it answers the question that would otherwise get asked.
//
// So both consumers read the hook itself from here. Change the timeout in
// settings and the budget follows; change the command and the test follows.
//
// Returns { argv, timeoutMs, source } — source names which settings file it came
// from, or 'default' when no hook is configured. An adopted repo has no
// SessionStart hook and must not fail on its absence.
const DEFAULT_HOOK_TIMEOUT_MS = 8000;

function sessionStartVerifyHook(rootDir) {
  for (const file of ['settings.local.json', 'settings.json']) {
    const p = path.join(rootDir, '.claude', file);
    let parsed;
    try {
      if (!fs.existsSync(p)) continue;
      parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch { continue; } // a malformed settings file is INV-082's business, not ours
    const groups = (parsed && parsed.hooks && parsed.hooks.SessionStart) || [];
    for (const g of Array.isArray(groups) ? groups : []) {
      for (const h of (g && Array.isArray(g.hooks)) ? g.hooks : []) {
        const cmd = h && typeof h.command === 'string' ? h.command : '';
        if (!/cwos-verify\.js/.test(cmd)) continue;
        // Take the flags between the script and the first shell operator: the
        // entry is a shell line (`… --quiet 2>/dev/null || true`), not an argv.
        // The fd has to be part of the redirect pattern — splitting on bare `>`
        // left the `2` of `2>/dev/null` behind as a phantom argument.
        const after = cmd.split(/cwos-verify\.js/)[1] || '';
        const argv = after.split(/\s+(?:\d*[<>]|\|\||&&|[|&;])/)[0].trim().split(/\s+/).filter(Boolean);
        const t = Number(h.timeout);
        return {
          argv,
          timeoutMs: Number.isFinite(t) && t > 0 ? t * 1000 : DEFAULT_HOOK_TIMEOUT_MS,
          source: file,
        };
      }
    }
  }
  return { argv: null, timeoutMs: DEFAULT_HOOK_TIMEOUT_MS, source: 'default' };
}

// Narrow the check list per --fast-mode / --since-git-commit. Both absent →
// full set. fast-mode → only fast:true. since → changed-overlap + always-run.
// Both → union. Original declaration order is preserved.
// heavy:true checks (WS-609) are excluded from BOTH narrowed paths — including
// the git-failure full-set fail-safe — because these paths run implicitly
// under the SessionStart hook's 8s timeout, and a full-log replay there
// guarantees the run is killed mid-loop. Heavy checks run in the no-flag full
// set or explicitly via --only <id>.
function selectChecks(allChecks, { fastMode, sinceMode, sinceRef, rootDir }) {
  if (!fastMode && !sinceMode) return { checks: allChecks, note: null };
  const selected = new Set();
  const notes = [];

  if (fastMode) {
    for (const c of allChecks) {
      const m = INVARIANT_META[c.id];
      if (m && m.fast) selected.add(c.id);
    }
    notes.push(`fast-mode: ${selected.size} essential`);
  }

  if (sinceMode) {
    const changed = getChangedFiles(rootDir, sinceRef);
    if (changed === null) {
      for (const c of allChecks) selected.add(c.id); // git absent / bad ref → full set
      notes.push('since-git-commit: git unavailable or ref unresolved → ran full set (fail-safe)');
    } else {
      let matched = 0;
      let alwaysRun = 0;
      for (const c of allChecks) {
        const m = INVARIANT_META[c.id];
        const watched = m && m.watched_paths;
        if (!watched || watched.length === 0) {
          selected.add(c.id);
          alwaysRun++;
        } else if (watched.some((p) => changed.some((f) => fileMatchesPrefix(f, p)))) {
          selected.add(c.id);
          matched++;
        }
      }
      notes.push(`since-git-commit (${sinceRef || 'working-tree'}): ${changed.length} changed file(s) → ${matched} matched + ${alwaysRun} always-run`);
    }
  }

  const skippedHeavy = [];
  for (const c of allChecks) {
    const m = INVARIANT_META[c.id];
    if (m && m.heavy && selected.has(c.id)) {
      selected.delete(c.id);
      skippedHeavy.push(c.id);
    }
  }
  if (skippedHeavy.length) {
    notes.push(`heavy skipped: ${skippedHeavy.join(', ')} — run with --only <id> or the full set`);
  }

  return { checks: allChecks.filter((c) => selected.has(c.id)), note: notes.join('; ') };
}

function checkNoKitAgentsDir(rootDir) {
  const exists = fs.existsSync(path.join(rootDir, 'kit', 'agents'));
  return {
    passed: !exists,
    detail: exists ? 'kit/agents/ directory exists — must not exist (personas live in personas/)' : 'kit/agents/ does not exist',
  };
}

// ─── Engine Intent Contract Consistency (INV-048 / WS-327) ─────────────────
//
// Each engine MD has frontmatter declaring `name:` and `default_mode:`, and an
// `## Intent Contract (ADR-038)` block that re-states both values for human
// readability. The two must agree — when they drift, cwos-frame.js loads one
// mode while the engine's documented contract claims another.
//
// Reference template: kit/templates/engines/contract-honoring.snippet.

function _parseEngineFrontmatter(content) {
  if (!content.startsWith('---')) return null;
  const end = content.indexOf('\n---', 3);
  if (end < 0) return null;
  const fm = content.slice(3, end).split('\n');
  const out = {};
  for (const line of fm) {
    const m = line.match(/^([a-z_-]+):\s*(.*?)\s*$/i);
    if (!m) continue;
    let v = m[2].replace(/^["']|["']$/g, '');
    out[m[1]] = v;
  }
  return out;
}

function _parseContractBlock(content) {
  const idx = content.indexOf('## Intent Contract');
  if (idx < 0) return null;
  // Block runs until the next `---` separator or the next `## ` heading.
  const tail = content.slice(idx);
  const stop = tail.search(/\n(---|##\s)/);
  const block = stop < 0 ? tail : tail.slice(0, stop);
  // Engine name in the match-on line: `engine: <name>` (backticked).
  const nameMatch = block.match(/engine:\s*([a-z][a-z0-9_-]*)/i);
  // Default mode in the mode bullet: `default_mode: <mode>` (backticked).
  const modeMatch = block.match(/default_mode:\s*([a-z][a-z0-9_-]*)/i);
  return {
    engineName: nameMatch ? nameMatch[1] : null,
    defaultMode: modeMatch ? modeMatch[1] : null,
  };
}

function checkEngineContractConsistency(rootDir) {
  const files = [];
  const stdDir = path.join(rootDir, 'engines/standard');
  if (fs.existsSync(stdDir)) {
    for (const f of globFiles(stdDir, '*.md')) files.push(f);
  }
  const libDir = path.join(rootDir, 'engines/library');
  if (fs.existsSync(libDir)) {
    for (const e of fs.readdirSync(libDir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const skill = path.join(libDir, e.name, 'SKILL.md');
      if (fs.existsSync(skill)) files.push(skill);
    }
  }

  const mismatches = [];
  let checked = 0;
  for (const f of files) {
    let content;
    try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const fm = _parseEngineFrontmatter(content);
    const block = _parseContractBlock(content);
    if (!fm || !block) continue; // engine without contract block is skipped (warned by INV-002 / WS-313)
    checked++;
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    if (fm.name && block.engineName && fm.name !== block.engineName) {
      mismatches.push(`${rel}: name fm=${fm.name} block=${block.engineName}`);
    }
    if (fm.default_mode && block.defaultMode && fm.default_mode !== block.defaultMode) {
      mismatches.push(`${rel}: default_mode fm=${fm.default_mode} block=${block.defaultMode}`);
    }
  }

  return {
    passed: mismatches.length === 0,
    detail: mismatches.length === 0
      ? `${checked} engines: frontmatter ↔ Intent Contract block consistent (name + default_mode)`
      : `${mismatches.length} mismatches across ${checked} engines:\n  ` + mismatches.join('\n  '),
  };
}

// ─── INV-060: Engine model_tiers declared + floor-respecting (WS-390) ───────
//
// Model tier is the WEAKEST quality lever (BENCH series 1: structure > diversity
// > model). agent-dispatch engines therefore drop scan phases to cheaper models
// while keeping cross-critique + synthesis on Opus (the high-leverage phases).
// This check enforces that the tiering convention is DECLARED and FLOOR-SAFE so
// it cannot silently rot into dead config — the exact failure mode of the old
// `model:` scalar, which was parsed but never consumed by anything (WS-390).
//
// Scope: declaration-level only. Whether the orchestrator actually dispatched at
// the declared tier at runtime is the runtime-dispatch audit's job (INV-046).
//
// Floors (from engines/procedures/agent-dispatch.md MODEL TIER DEFAULTS):
//   expert ≥ haiku · cross_critic ≥ sonnet · synthesis ≥ sonnet (never haiku).
//
// Rank order: haiku < sonnet < opus < fable. `fable` (Mythos-class, above Opus)
// is a valid declared opt-up for any role; tier DEFAULTS are unchanged pending
// the WS-475 re-benchmark on Claude 5 models (lever-impact-map.yaml is N=1 on 4.x).

const _MODEL_RANK = { haiku: 1, sonnet: 2, opus: 3, fable: 4 };
const _TIER_FLOORS = { expert: 'haiku', cross_critic: 'sonnet', synthesis: 'sonnet' };
const _VALID_TIER_KEYS = new Set(['expert', 'cross_critic', 'synthesis', 'remediation']);

// Parse a `model_tiers:` declaration from frontmatter. Supports both the block
// form (model_tiers:\n  expert: sonnet) and the inline form
// (model_tiers: { expert: sonnet, synthesis: opus }). Returns a role→tier map
// (possibly empty); null only when there is no frontmatter at all.
function _parseModelTiers(content) {
  if (!content.startsWith('---')) return null;
  const end = content.indexOf('\n---', 3);
  if (end < 0) return null;
  const fmLines = content.slice(3, end).split('\n');
  const tiers = {};
  let inBlock = false;
  // Strip a trailing YAML inline comment (whitespace + '#' …) and surrounding quotes.
  const clean = (v) => v.replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
  for (const raw of fmLines) {
    const line = raw.replace(/\s+$/, '');
    const inlineMatch = line.match(/^model_tiers:\s*\{(.+)\}\s*$/);
    if (inlineMatch) {
      for (const pair of inlineMatch[1].split(',')) {
        const ci = pair.indexOf(':');
        if (ci < 0) continue;
        const k = pair.slice(0, ci).trim();
        if (k) tiers[k] = clean(pair.slice(ci + 1));
      }
      return tiers;
    }
    if (/^model_tiers:\s*$/.test(line)) { inBlock = true; continue; }
    if (inBlock) {
      const m = line.match(/^\s+([a-z_]+):\s*(.+?)\s*$/i);
      if (m) { tiers[m[1]] = clean(m[2]); continue; }
      if (/^\S/.test(line)) inBlock = false; // a non-indented line ends the block
    }
  }
  return tiers;
}

function checkEngineModelTiers(rootDir) {
  const stdDir = path.join(rootDir, 'engines/standard');
  if (!fs.existsSync(stdDir)) {
    return { passed: true, detail: 'engines/standard not present — skipped' };
  }
  const violations = [];
  let declared = 0, exempt = 0;
  for (const f of globFiles(stdDir, '*.md')) {
    let content;
    try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const fm = _parseEngineFrontmatter(content);
    if (!fm) continue;
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    const tiers = _parseModelTiers(content) || {};
    const hasTiers = Object.keys(tiers).length > 0;
    const isAgentDispatch = fm.procedure === 'agent-dispatch';

    // The dead `model:` scalar is no longer a valid declaration (WS-390): it was
    // never consumed, so it silently misled. Require `model_tiers:` instead.
    if (fm.model && !hasTiers) {
      violations.push(`${rel}: dead scalar 'model:' — declare 'model_tiers:' instead (the scalar field is never consumed)`);
    }

    if (isAgentDispatch && !hasTiers) {
      violations.push(`${rel}: agent-dispatch engine must declare 'model_tiers:' (expert/cross_critic/synthesis)`);
      continue;
    }
    if (!hasTiers) { exempt++; continue; } // inline engine, no subagent dispatch — inherits session model

    declared++;
    for (const [role, tier] of Object.entries(tiers)) {
      if (!_VALID_TIER_KEYS.has(role)) {
        violations.push(`${rel}: unknown model_tiers role '${role}' (valid: ${[..._VALID_TIER_KEYS].join(', ')})`);
        continue;
      }
      if (!_MODEL_RANK[tier]) {
        violations.push(`${rel}: invalid tier '${tier}' for '${role}' (valid: ${Object.keys(_MODEL_RANK).join(', ')})`);
        continue;
      }
      const floor = _TIER_FLOORS[role];
      if (floor && _MODEL_RANK[tier] < _MODEL_RANK[floor]) {
        violations.push(`${rel}: '${role}' tier '${tier}' is below floor '${floor}'`);
      }
    }
  }
  return {
    passed: violations.length === 0,
    detail: violations.length === 0
      ? `${declared} engine(s) declare valid model_tiers; ${exempt} inline engine(s) exempt (inherit session model)`
      : `${violations.length} model-tier violation(s):\n  ` + violations.join('\n  '),
  };
}

// ─── HomeBase-only Manifest Flag (INV-049 / WS-315 / ADR-049) ──────────────
//
// Engines under `engines/homebase-only/` are HomeBase-internal — they audit
// the kit, evolve the product, or analyze the fleet. They MUST never ship to
// adopted repos via /fleet-update. The propagation guard is a single
// `homebase_only: true` flag on the MANIFEST entry, which fleet-update.md
// step 3 filters on. This check verifies the flag is actually present on
// every homebase-only entry, and absent from standard/library entries.
// Without this invariant, adding a new homebase-only engine and forgetting
// the flag silently propagates HomeBase-internal apparatus to every adopted
// repo on the next /fleet-update.

function checkHomebaseOnlyManifestFlag(rootDir) {
  if (!isKitSourceRepo(rootDir)) return { passed: true, detail: NOT_KIT_SOURCE_NA };
  const manifestPath = path.join(rootDir, 'kit', 'MANIFEST.yaml');
  if (!fs.existsSync(manifestPath)) {
    return { passed: false, detail: 'kit/MANIFEST.yaml not found' };
  }
  const { ok, data } = readYAMLFile(manifestPath);
  if (!ok || !data || !Array.isArray(data.files)) {
    return { passed: false, detail: 'kit/MANIFEST.yaml unparseable or missing files: array' };
  }

  const violations = [];
  let homebaseOnlyCount = 0;
  let distributableCount = 0;
  for (const entry of data.files) {
    const src = entry && entry.source ? String(entry.source) : '';
    if (!src.startsWith('engines/')) continue;
    const flag = entry.homebase_only === true;
    if (src.startsWith('engines/homebase-only/')) {
      homebaseOnlyCount++;
      if (!flag) violations.push(`${src}: missing homebase_only: true`);
    } else if (src.startsWith('engines/standard/') || src.startsWith('engines/library/')) {
      distributableCount++;
      if (flag) violations.push(`${src}: has homebase_only: true but lives outside engines/homebase-only/`);
    }
  }

  // Cross-check: every *.md file under engines/homebase-only/ that COULD be
  // a propagation source (i.e. matches the patterns MANIFEST registers) must
  // have a MANIFEST entry. A dangling file is not directly a propagation
  // leak, but it signals MANIFEST drift — and a future fleet-update path
  // that walks the filesystem instead of the MANIFEST would leak it.
  const homebaseDir = path.join(rootDir, 'engines', 'homebase-only');
  const registeredSources = new Set();
  for (const entry of data.files) {
    if (entry && entry.source) registeredSources.add(String(entry.source));
  }
  if (fs.existsSync(homebaseDir)) {
    const walk = (dir) => {
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) { walk(full); continue; }
        if (!ent.isFile() || !ent.name.endsWith('.md')) continue;
        const rel = path.relative(rootDir, full).replace(/\\/g, '/');
        // Only top-level *.md files and pack SKILL.md files are MANIFEST-registered;
        // other files inside packs (helpers, READMEs) are not propagation sources.
        const inPackButNotSkill = /engines\/homebase-only\/[^/]+\/.+/.test(rel) && !/\/SKILL\.md$/.test(rel);
        if (inPackButNotSkill) continue;
        if (!registeredSources.has(rel)) {
          violations.push(`${rel}: file exists under engines/homebase-only/ but no MANIFEST entry`);
        }
      }
    };
    walk(homebaseDir);
  }

  // WS-383: runtime bundle check. Beyond the static MANIFEST referential
  // integrity above, if a resolved archetype bundle artifact is present in this
  // repo (the archetype_bundle_resolved block in .cwos-onboarding.yaml, written
  // by /adopt), validate it against the schema + INV-049 using the same shared
  // validator the installer uses. On HomeBase (no onboarding file) this is a
  // no-op. In an adopted repo it catches a bundle that somehow installed a
  // homebase-only engine reference.
  const onboardingPath = path.join(rootDir, '.cwos-onboarding.yaml');
  if (fs.existsSync(onboardingPath)) {
    const ob = readYAMLFile(onboardingPath);
    const resolved = ob.ok && ob.data ? ob.data.archetype_bundle_resolved : null;
    if (resolved && typeof resolved === 'object') {
      const { validateArchetypeBundle, loadHomebaseOnlyEngines } = require('./lib/cwos-bundle-validate');
      const homebaseOnlyEngines = loadHomebaseOnlyEngines(rootDir);
      const { ok: bok, errors } = validateArchetypeBundle(resolved, { homebaseOnlyEngines });
      if (!bok) {
        for (const e of errors) violations.push(`.cwos-onboarding.yaml archetype_bundle_resolved: ${e}`);
      }
    }
  }

  return {
    passed: violations.length === 0,
    detail: violations.length === 0
      ? `${homebaseOnlyCount} homebase-only entries flagged correctly; ${distributableCount} distributable engine entries free of homebase_only flag`
      : `${violations.length} violation(s):\n  ` + violations.join('\n  '),
  };
}

// ─── No Hardcoded docs/evolution/ in Shipped Kit (INV-059 / WS-421 / FIND-281) ─
//
// docs/evolution/ is the HomeBase-only Product Evolution apparatus — it never
// propagates to adopted repos. Any shipped file (standard/library engines, core
// personas, or commands) that hardcodes a docs/evolution/ write target silently
// no-ops in an adopted repo, so calibration loops (findings-feedback.yaml,
// change-impacts.yaml, AC-11) produce zero data downstream. Shipped writers must
// instead resolve the calibration dir per repo scope (resolveEvolutionDir in
// cwos-utils.js). This scanner asserts no docs/evolution/ literal survives in the
// distributable surface.
//
// Allowlist (explicit, tracked — not silent suppression):
//  - kit/commands/evolve.md — /evolve IS the Product Evolution command, flagged
//    homebase_only: true in MANIFEST (never ships). It legitimately operates on
//    the evolution dir (constitutions, change-impacts), like a homebase-only engine.
const EVOLUTION_PATH_ALLOWLIST = new Set([
  'kit/commands/evolve.md',
]);

function checkNoHardcodedEvolutionPaths(rootDir) {
  const scopeDirs = [
    'engines/standard',
    'engines/library',
    'personas/core',
    'kit/commands',
  ];
  const violations = [];
  let scanned = 0;

  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) { walk(full); continue; }
      if (!ent.isFile() || !ent.name.endsWith('.md')) continue;
      const rel = path.relative(rootDir, full).replace(/\\/g, '/');
      if (EVOLUTION_PATH_ALLOWLIST.has(rel)) continue;
      scanned++;
      const text = fs.readFileSync(full, 'utf8');
      const lines = text.split(/\r?\n/);
      lines.forEach((line, i) => {
        if (line.includes('docs/evolution/')) {
          violations.push(`${rel}:${i + 1}`);
        }
      });
    }
  };

  for (const d of scopeDirs) walk(path.join(rootDir, d));

  return {
    passed: violations.length === 0,
    detail: violations.length === 0
      ? `${scanned} shipped file(s) scanned across ${scopeDirs.length} dirs; no docs/evolution/ literals (allowlist: ${[...EVOLUTION_PATH_ALLOWLIST].join(', ') || 'none'})`
      : `${violations.length} hardcoded docs/evolution/ reference(s) in shipped kit — resolve per repo scope via resolveEvolutionDir:\n  ` + violations.join('\n  '),
  };
}

// ─── Adopter-Value Relation on Kit-Quality Findings (INV-053 / WS-436) ─────
//
// Forward-enforcing gate: every kit-quality finding detected on or after
// the WS-436 ship date must declare adopter_value_relation, and findings
// tagged `no` must be in status: blocked unless they carry an override
// rationale. Synthesis-time partner to the failed_states_seed compose-time
// injection (WS-296). FIND-312 / REC-002 source.

const ADOPTER_VALUE_ENUM = new Set(['yes', 'enables-yes', 'no-but-mitigates-data-loss', 'no']);
const ADOPTER_VALUE_CUTOVER = '2026-05-14';

function checkAdopterValueRelation(rootDir) {
  let wsDir;
  try { wsDir = findWorkstreamDir(rootDir); }
  catch { return { passed: false, detail: '.claude/workstream/ not found' }; }

  const findingsDir = path.join(wsDir, 'findings');
  if (!fs.existsSync(findingsDir)) {
    return { passed: true, detail: 'no findings directory — nothing to check' };
  }

  const files = globFiles(findingsDir, 'FIND-*.yaml');
  const violations = [];
  let checked = 0;
  let exempted = 0;

  for (const f of files) {
    const r = readYAMLFile(f);
    if (!r.ok || !r.data) continue;
    const d = r.data;

    // Forward-only enforcement: program == kit-quality AND detected_at >= cutover
    if (d.program !== 'kit-quality') continue;
    const detectedAt = (d.detected_at || d.created_at || '').toString();
    if (!detectedAt || detectedAt < ADOPTER_VALUE_CUTOVER) { exempted++; continue; }

    checked++;
    const rel = d.adopter_value_relation;
    if (rel === undefined || rel === null || rel === '') {
      violations.push(`${path.basename(f)}: missing adopter_value_relation (detected_at=${detectedAt})`);
      continue;
    }
    if (!ADOPTER_VALUE_ENUM.has(rel)) {
      violations.push(`${path.basename(f)}: invalid adopter_value_relation: ${JSON.stringify(rel)} (must be one of ${Array.from(ADOPTER_VALUE_ENUM).join('|')})`);
      continue;
    }
    if (rel === 'no') {
      const status = (d.status || '').toString();
      const hasOverride = d.adopter_value_override_rationale && String(d.adopter_value_override_rationale).trim().length > 0;
      if (status !== 'blocked' && !hasOverride) {
        violations.push(`${path.basename(f)}: adopter_value_relation=no but status=${status || '(missing)'} and no override rationale — must be blocked or carry adopter_value_override_rationale`);
      }
    }
  }

  return {
    passed: violations.length === 0,
    detail: violations.length === 0
      ? `${checked} post-cutover kit-quality finding(s) compliant; ${exempted} pre-cutover exempt`
      : `${violations.length} violation(s):\n  ` + violations.slice(0, 10).join('\n  ') + (violations.length > 10 ? `\n  ... and ${violations.length - 10} more` : ''),
  };
}

// INV-055 — Adopter-controlled config values must flow through boundedPath helpers.
// Scans cwos-adopt-install.js + cwos-scope-check.js for the dangerous patterns we
// know we eliminated in WS-430, and confirms resolveSystemDir is wrapped. Deterministic
// pattern match — no AI judgment.
function checkBoundedPathContainment(rootDir) {
  const targets = [
    'kit/scripts/cwos-adopt-install.js',
    'kit/scripts/cwos-scope-check.js',
  ];

  const violations = [];

  for (const rel of targets) {
    const absPath = path.join(rootDir, rel);
    if (!fs.existsSync(absPath)) {
      violations.push(`${rel}: file missing`);
      continue;
    }
    const text = fs.readFileSync(absPath, 'utf8');
    const lines = text.split('\n');

    // Forbidden patterns — these flowed adopter-controlled values into
    // path.join unchecked before WS-430.
    const forbidden = [
      { re: /path\.join\(\s*config\.target\s*,\s*destRel\b/, why: 'path.join(config.target, destRel) — use boundedPathInRepo' },
      { re: /path\.join\(\s*config\.target\s*,\s*entry\.destination/, why: 'path.join(config.target, entry.destination...) — use boundedPathInRepo' },
      { re: /path\.join\(\s*config\.target\s*,\s*evidenceDir/, why: 'path.join(config.target, evidenceDir...) — use boundedPathInRepo' },
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comments and lines that are inside strings (heuristic: leading whitespace + comment marker)
      if (/^\s*(?:\/\/|\*)/.test(line)) continue;
      for (const { re, why } of forbidden) {
        if (re.test(line)) {
          violations.push(`${rel}:${i + 1}: ${why}`);
        }
      }
    }

    // resolveSystemDir presence + boundedSystemDir wrap — scoped to the
    // function body (next ~15 lines after the declaration).
    const resolveIdx = lines.findIndex(l => /^function\s+resolveSystemDir\s*\(/.test(l));
    if (resolveIdx === -1) {
      violations.push(`${rel}: resolveSystemDir not found`);
    } else {
      const bodyEnd = Math.min(resolveIdx + 25, lines.length);
      const bodySlice = lines.slice(resolveIdx, bodyEnd).join('\n');
      if (!/boundedSystemDir\s*\(/.test(bodySlice)) {
        violations.push(`${rel}:${resolveIdx + 1}: resolveSystemDir does not call boundedSystemDir`);
      }
    }
  }

  return {
    passed: violations.length === 0,
    detail: violations.length === 0
      ? 'cwos-adopt-install.js + cwos-scope-check.js: resolveSystemDir wrapped; no forbidden path.join sites'
      : `${violations.length} violation(s):\n  ` + violations.join('\n  '),
  };
}

// INV-056 — Reverse-direction kit/commands ↔ MANIFEST coverage. INV-024 enforces
// MANIFEST → file existence; this asserts the inverse: every kit/commands/*.md
// has a MANIFEST entry. The phantom-reference class is otherwise invisible.
function checkCommandManifestCoverage(rootDir) {
  if (!isKitSourceRepo(rootDir)) return { passed: true, detail: NOT_KIT_SOURCE_NA };
  const commandsDir = path.join(rootDir, 'kit', 'commands');
  const manifestPath = path.join(rootDir, 'kit', 'MANIFEST.yaml');

  if (!fs.existsSync(commandsDir)) {
    return { passed: false, detail: `kit/commands/ not found at ${commandsDir}` };
  }
  if (!fs.existsSync(manifestPath)) {
    return { passed: false, detail: `kit/MANIFEST.yaml not found at ${manifestPath}` };
  }

  const commandFiles = globFiles(commandsDir, '*.md').map(f => path.basename(f));

  // Build the set of sources the MANIFEST claims to install. Tolerate parse
  // warnings (CWOS YAML subset); only the source field matters here.
  const { ok, data, error } = readYAMLFile(manifestPath);
  if (!ok) {
    return { passed: false, detail: `MANIFEST parse failed: ${error}` };
  }

  const entries = Array.isArray(data.files) ? data.files : [];
  const manifestCommandSources = new Set();
  for (const e of entries) {
    if (e && typeof e.source === 'string' && e.source.startsWith('kit/commands/') && e.source.endsWith('.md')) {
      manifestCommandSources.add(path.basename(e.source));
    }
  }

  const orphans = commandFiles.filter(f => !manifestCommandSources.has(f));

  return {
    passed: orphans.length === 0,
    detail: orphans.length === 0
      ? `${commandFiles.length} command file(s); all present in MANIFEST`
      : `${orphans.length} command file(s) missing from MANIFEST: ${orphans.join(', ')}`,
  };
}

// INV-057 — cwos-adopt-install.js must use writeFileAtomic, never raw fs.writeFileSync.
// Raw writes are non-atomic under OneDrive sync (HC-002) and can leave state files
// truncated mid-write. Deterministic line-scan; comments are skipped.
function checkAdoptInstallAtomicWrites(rootDir) {
  const targetPath = path.join(rootDir, 'kit', 'scripts', 'cwos-adopt-install.js');
  if (!fs.existsSync(targetPath)) {
    return { passed: false, detail: `kit/scripts/cwos-adopt-install.js not found at ${targetPath}` };
  }
  const lines = fs.readFileSync(targetPath, 'utf8').split('\n');
  const violations = [];
  const pattern = /\bfs\.writeFileSync\s*\(/;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
    if (pattern.test(line)) {
      violations.push(`${i + 1}: ${trimmed.slice(0, 80)}`);
    }
  }
  return {
    passed: violations.length === 0,
    detail: violations.length === 0
      ? 'cwos-adopt-install.js: no raw fs.writeFileSync calls; all writes go through writeFileAtomic'
      : `${violations.length} raw fs.writeFileSync site(s) in cwos-adopt-install.js (must use writeFileAtomic):\n  ` + violations.join('\n  '),
  };
}

// WS-366 / FIND-248 — delegates to cwos-program-fields-have-runtime-effect.js
// which owns the field→reader mapping table. Keeping the table in its own
// script makes the publish-time gate runnable as a standalone CLI too.
function checkProgramFieldsHaveRuntimeEffect(rootDir) {
  let mod;
  try { mod = require('./cwos-program-fields-have-runtime-effect'); }
  catch (e) { return { passed: false, detail: `validator script not loadable: ${e.message}` }; }
  const result = mod.checkAccountabilityFieldReaders(rootDir);
  if (result.error) {
    return { passed: false, detail: `validator error: ${result.error}` };
  }
  if (result.failures.length === 0) {
    return { passed: true, detail: `${result.fields_checked} accountability fields have runtime readers` };
  }
  const lines = result.failures.map((f) => `${f.field} (${f.reason})`).join('; ');
  return { passed: false, detail: `${result.failures.length} decoration-only field(s): ${lines}` };
}

function checkEngineIndex(rootDir) {
  if (!isKitSourceRepo(rootDir)) return { passed: true, detail: NOT_KIT_SOURCE_NA };
  const standard = globFiles(path.join(rootDir, 'engines/standard'), '*.md').map(f => path.basename(f, '.md'));
  const libraryDirs = fs.existsSync(path.join(rootDir, 'engines/library'))
    ? fs.readdirSync(path.join(rootDir, 'engines/library'), { withFileTypes: true })
        .filter(e => e.isDirectory())
        .filter(e => fs.existsSync(path.join(rootDir, 'engines/library', e.name, 'SKILL.md')))
        .map(e => e.name)
    : [];

  const indexPath = path.join(rootDir, 'engines/INDEX.md');
  if (!fs.existsSync(indexPath)) return { passed: false, detail: 'engines/INDEX.md not found' };
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  const missing = [];
  for (const name of standard) {
    if (!indexContent.includes(name)) missing.push(`standard/${name}`);
  }
  for (const name of libraryDirs) {
    if (!indexContent.includes(name)) missing.push(`library/${name}`);
  }

  return {
    passed: missing.length === 0,
    detail: missing.length === 0
      ? `${standard.length} standard + ${libraryDirs.length} library engines all listed in INDEX.md`
      : `${missing.length} engines missing from INDEX.md: ${missing.join(', ')}`,
  };
}

function checkNoPersonaSimulation(rootDir) {
  const matches = grepRecursive(
    rootDir,
    ['kit', 'engines'],
    'adopt that viewpoint|as the orchestrator.*critique|for each.*perspective.*produce',
    (f) => f.endsWith('.md')
  );
  return {
    passed: matches.length === 0,
    detail: matches.length === 0
      ? 'No persona-simulation patterns found in kit/ or engines/'
      : `${matches.length} matches found: ${matches.slice(0, 3).map(m => `${m.file}:${m.line}`).join(', ')}`,
  };
}

function checkQueueIndexParity(rootDir) {
  let wsDir;
  try { wsDir = findWorkstreamDir(rootDir); }
  catch { return { passed: false, detail: '.claude/workstream/ not found' }; }

  const queueFiles = globFiles(path.join(wsDir, 'queue'), 'WS-*.yaml');
  const fileCount = queueFiles.length;

  // WS-147: strict-parse every queue file so orphan-block-sequence drops
  // surface here instead of silently truncating items at every consumer.
  // Queue YAMLs are CWOS-authored, so a strict failure is a real bug.
  const malformed = [];
  for (const f of queueFiles) {
    const r = readYAMLFile(f, { strict: true });
    if (!r.ok && Array.isArray(r.warnings) && r.warnings.length > 0) {
      malformed.push(`${path.basename(f)}: ${r.error}`);
    }
  }

  // WS-205 (SPR-064): prefer typed-API read via state-store (ADR-020).
  // Falls back to queue-index.yaml if state-store is unavailable (pre-step-2
  // repos or when state/queue.json hasn't been materialized yet).
  let indexCount = null;
  let indexSource = null;
  try {
    const ss = require('./core/state-store');
    const store = ss.loadState(wsDir);
    const items = store.queue.all();
    if (Array.isArray(items)) { indexCount = items.length; indexSource = 'state-store'; }
  } catch { /* fall through */ }

  if (indexCount === null) {
    const indexPath = path.join(wsDir, 'queue-index.yaml');
    if (!fs.existsSync(indexPath)) return { passed: false, detail: 'queue-index.yaml not found (and state-store unavailable)' };
    const { ok, data } = readYAMLFile(indexPath);
    if (!ok) return { passed: false, detail: 'queue-index.yaml could not be parsed' };
    indexCount = Array.isArray(data.items) ? data.items.length : 0;
    indexSource = 'queue-index.yaml';
  }

  if (malformed.length > 0) {
    return {
      passed: false,
      detail: `${malformed.length} queue file(s) have parse warnings (orphan items dropped silently): ${malformed.slice(0, 3).join(' | ')}`,
    };
  }

  return {
    passed: indexCount === fileCount,
    detail: indexCount === fileCount
      ? `Index and files match (${fileCount} items, source=${indexSource})`
      : `Index has ${indexCount} entries (source=${indexSource}); queue/ has ${fileCount} WS-*.yaml files`,
  };
}

function checkFleetPaths(rootDir) {
  if (!isKitSourceRepo(rootDir)) return { passed: true, detail: NOT_KIT_SOURCE_NA };
  const registryPath = path.join(rootDir, 'fleet/registry.yaml');
  if (!fs.existsSync(registryPath)) return { passed: false, detail: 'fleet/registry.yaml not found' };
  const { ok, data } = cachedReadYAMLFile(registryPath);
  if (!ok) return { passed: false, detail: 'fleet/registry.yaml could not be parsed' };

  const repos = Array.isArray(data.repos) ? data.repos : [];
  const missing = [];
  let realCount = 0;
  let simCount = 0;
  let notHostedCount = 0;

  // Node awareness (ADR-057): only require paths for repos the registry
  // says are hosted on the machine running the check.
  const { resolveNodeContext, isRepoHostedHere } = require('./lib/fleet-nodes');
  const nodeCtx = resolveNodeContext(data);

  for (const repo of repos) {
    // Simulated repos are ephemeral — their path field points to sim/.sandbox/
    // which only exists during sim runs. Check the `source` path instead
    // (the template repo that gets copied into the sandbox).
    if (repo.type === 'simulated') {
      simCount++;
      if (repo.source) {
        const sourcePath = path.isAbsolute(repo.source) ? repo.source : path.join(rootDir, repo.source);
        if (!fs.existsSync(sourcePath)) {
          missing.push(`${repo.name || '?'} (simulated) → source ${repo.source}`);
        }
      }
      continue;
    }
    realCount++;
    // `skip_path_check: true` is for registry entries whose filesystem
    // folder hasn't been created yet (reserved names, planned repos).
    // The name is still tracked so future /discover / /adopt runs can
    // wire it up, but INV-008 should not flag the missing path as drift.
    if (repo.skip_path_check === true) continue;
    if (!isRepoHostedHere(repo, nodeCtx)) { notHostedCount++; continue; }
    if (repo.path && !fs.existsSync(repo.path)) {
      missing.push(`${repo.name || repo.id || '?'} → ${repo.path}`);
    }
  }

  const hostedNote = notHostedCount > 0 ? ` (${notHostedCount} on other nodes, skipped)` : '';
  return {
    passed: missing.length === 0,
    detail: missing.length === 0
      ? `${realCount} real + ${simCount} simulated repos, all paths/sources exist${hostedNote}`
      : `${missing.length} missing: ${missing.slice(0, 3).join(', ')}${hostedNote}`,
  };
}

function checkAdrIndex(rootDir) {
  const canonicalDir = path.join(rootDir, 'docs/adrs');
  const docsDir = path.join(rootDir, 'docs');
  const indexPath = path.join(canonicalDir, 'INDEX.md');
  if (!fs.existsSync(indexPath)) return { passed: false, detail: 'docs/adrs/INDEX.md not found' };

  // Scan ADR-named directories only (docs/adr*/), not all of docs/.
  // Avoids false positives from commentary files like docs/design-reviews/ADR-018-pressure-test.md
  // that name-reference an ADR but aren't ADRs themselves. The WS-286 failure mode this guards
  // against is specifically docs/adr/ vs docs/adrs/ divergence.
  const adrNumberRe = /^ADR-(\d{3})(?:[-.]|$)/;
  const byNumber = new Map();   // number → [{rel, base}]
  const stray = [];             // ADR files outside canonical dir
  let adrDirs = [];
  try {
    adrDirs = fs.readdirSync(docsDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && /^adrs?$/i.test(d.name))
      .map(d => path.join(docsDir, d.name));
  } catch { /* docs/ may not exist */ }

  for (const dir of adrDirs) {
    walkDir(dir, (filePath) => {
      const base = path.basename(filePath);
      if (base === 'INDEX.md') return;
      const m = base.match(adrNumberRe);
      if (!m) return;
      const num = m[1];
      const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');
      const inCanonical = path.dirname(filePath) === canonicalDir;
      if (!inCanonical) stray.push(rel);
      if (!byNumber.has(num)) byNumber.set(num, []);
      byNumber.get(num).push({ rel, base });
    });
  }

  const duplicates = [];
  for (const [num, hits] of byNumber.entries()) {
    if (hits.length > 1) duplicates.push(`#${num}: ${hits.map(h => h.rel).join(' + ')}`);
  }

  // Coverage check: every canonical ADR file must appear in INDEX.md.
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const canonicalAdrs = globFiles(canonicalDir, 'ADR-*.md').map(f => path.basename(f, '.md'));
  const missing = canonicalAdrs.filter(name => !indexContent.includes(name));

  const failures = [];
  if (stray.length) failures.push(`${stray.length} ADR(s) outside docs/adrs/: ${stray.join(', ')}`);
  if (duplicates.length) failures.push(`${duplicates.length} duplicate number(s): ${duplicates.join('; ')}`);
  if (missing.length) failures.push(`${missing.length} missing from INDEX.md: ${missing.join(', ')}`);

  return {
    passed: failures.length === 0,
    detail: failures.length === 0
      ? `${canonicalAdrs.length} ADRs in docs/adrs/, 0 duplicates, 0 strays, all in INDEX.md`
      : failures.join(' | '),
  };
}

function checkUserGuideCoverage(rootDir) {
  const commandFiles = globFiles(path.join(rootDir, 'kit/commands'), '*.md').map(f => path.basename(f, '.md'));
  const guidePath = path.join(rootDir, 'docs/guides/user-guide.md');
  if (!fs.existsSync(guidePath)) return { passed: false, detail: 'docs/guides/user-guide.md not found' };
  const guideContent = fs.readFileSync(guidePath, 'utf8');

  const missing = commandFiles.filter(name => !guideContent.includes(`/${name}`));
  return {
    passed: missing.length === 0,
    detail: missing.length === 0
      ? `${commandFiles.length} commands all referenced in user-guide.md`
      : `${missing.length} commands missing from user-guide.md: ${missing.join(', ')}`,
  };
}

function checkStateFreshness(rootDir) {
  const statePath = path.join(rootDir, 'system/state.md');
  if (!fs.existsSync(statePath)) return { passed: false, detail: 'system/state.md not found' };
  const content = fs.readFileSync(statePath, 'utf8');
  const match = content.match(/Last updated:\s*(\d{4}-\d{2}-\d{2})/);
  if (!match) return { passed: false, detail: 'Could not find "Last updated:" date in state.md' };

  const stateDate = new Date(match[1]);
  const today = new Date(todayISO());
  const daysOld = Math.floor((today - stateDate) / (1000 * 60 * 60 * 24));

  return {
    passed: daysOld <= 14,
    detail: daysOld <= 14
      ? `state.md updated ${daysOld} days ago (within 14-day window)`
      : `state.md is ${daysOld} days old — should be refreshed (run cwos-state.js)`,
  };
}

// WS-560: this used to ALSO require that kit/commands/audit.md mention
// "convergence". That condition was written before ADR-049 split engines into
// standard / library / homebase-only, and it has been backwards ever since.
//
// audit.md ships (MANIFEST L4, no homebase_only flag). convergence.md does not
// (engines/homebase-only/, homebase_only: true, enforced by INV-049). So the
// condition demanded that a file installed into every adopted repo point at an
// engine those repos are guaranteed never to receive — a dangling reference,
// shipped deliberately, to satisfy an invariant. Commit f768d03 removed the
// reference during a skeleton refactor and INV-013 has been red ever since,
// telling us to reintroduce the defect.
//
// What remains is the part that still earns its keep: the engine exists and is
// discoverable from the engine index. The propagation boundary itself is
// enforced from the MANIFEST side by INV-049, which is the load-bearing guard.
function checkConvergenceEngine(rootDir) {
  if (!isKitSourceRepo(rootDir)) return { passed: true, detail: NOT_KIT_SOURCE_NA };
  const enginePath = path.join(rootDir, 'engines/homebase-only/convergence.md');
  const indexPath = path.join(rootDir, 'engines/INDEX.md');

  const engineExists = fs.existsSync(enginePath);
  const inIndex = fs.existsSync(indexPath) && fs.readFileSync(indexPath, 'utf8').includes('convergence');

  const issues = [];
  if (!engineExists) issues.push('engines/homebase-only/convergence.md missing');
  if (!inIndex) issues.push('not referenced in engines/INDEX.md');

  return {
    passed: issues.length === 0,
    detail: issues.length === 0
      ? 'convergence engine present and indexed (homebase-only; propagation boundary enforced by INV-049)'
      : issues.join('; '),
  };
}

function checkRegistrySkillPaths(rootDir) {
  if (!isKitSourceRepo(rootDir)) return { passed: true, detail: NOT_KIT_SOURCE_NA };
  const registryPath = path.join(rootDir, 'kit/templates/workstream/engines/registry.yaml');
  if (!fs.existsSync(registryPath)) return { passed: false, detail: 'registry template not found' };

  // Parse line-by-line to find active (uncommented) skill_path entries, and
  // check them against kit/MANIFEST.yaml destinations — NOT against HomeBase's
  // own filesystem.
  //
  // WS-558 rewrote this check because its previous premise was false. It read:
  // "skill_path is expected to point at an actual file that exists in both
  // HomeBase and in adopted repos post-install." No such path exists. HomeBase
  // keeps engines at engines/standard/<id>.md and its .claude/commands/ holds
  // only the 34 command hardlinks; an adopted repo gets the engine AT
  // .claude/commands/<id>.md, which is what the MANIFEST declares, and gets no
  // engines/standard/ tree at all (one row excepted).
  //
  // So the two halves were never satisfiable together, and this check enforced
  // HomeBase's half. That is exactly backwards: the file it validates is a
  // TEMPLATE, shipped to adopted repos, and it made the template correct for
  // the one repo that never uses it. The invariant was guarding the bug —
  // ai-content-ecosystem's 3.8.2 upgrade installed that template, produced 8
  // dead paths, failed the path-resolution gate, and rolled back to 3.3.
  //
  // The question that actually matters is whether the path will exist in the
  // repo the template lands in. A MANIFEST destination is the only honest
  // answer, so that is what is checked. The source is checked too, so a
  // destination whose file does not ship is still caught — the original
  // phantom-entry concern from FIND-068, kept.
  const manifest = cachedReadYAMLFile(path.join(rootDir, 'kit', 'MANIFEST.yaml'));
  if (!manifest.ok || !Array.isArray(manifest.data && manifest.data.files)) {
    return { passed: false, detail: 'kit/MANIFEST.yaml unreadable — cannot validate registry skill_paths' };
  }
  const sourceForDest = new Map();
  for (const f of manifest.data.files) {
    const dest = String(f.destination || '').replace(/\\/g, '/');
    if (dest) sourceForDest.set(dest, String(f.source || ''));
  }

  const content = fs.readFileSync(registryPath, 'utf8');
  const lines = content.split('\n');
  const phantoms = [];

  for (const line of lines) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*skill_path:\s*(.+?)\s*$/);
    if (!m) continue;
    const skillPath = m[1].replace(/^["']|["']$/g, '').replace(/\\/g, '/');
    if (!sourceForDest.has(skillPath)) {
      phantoms.push(`${skillPath} (no MANIFEST row installs to this path — dead in every adopted repo)`);
      continue;
    }
    const src = sourceForDest.get(skillPath);
    if (src && !fs.existsSync(path.join(rootDir, src))) {
      phantoms.push(`${skillPath} (MANIFEST source ${src} missing in HomeBase)`);
    }
  }

  // Converse direction, absorbed from INV-003 (WS-642): every shipping engine
  // must appear in the registry template — active or commented, either counts
  // as declared; total absence is the failure. When this was unenforced, 7
  // shipping engines (2 standard, 5 library packs) accumulated with no
  // registry entry at all, so adopted repos received engines their registry
  // never mentioned. engines/homebase-only/ is exempt: it never ships (INV-049).
  const missing = [];
  const declaresEngine = (id) => {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('^\\s*(#\\s*)?' + esc + ':', 'm').test(content);
  };
  const stdDir = path.join(rootDir, 'engines', 'standard');
  if (fs.existsSync(stdDir)) {
    for (const f of fs.readdirSync(stdDir)) {
      if (f.endsWith('.md') && !declaresEngine(f.replace(/\.md$/, ''))) missing.push(`standard/${f.replace(/\.md$/, '')}`);
    }
  }
  const libDir = path.join(rootDir, 'engines', 'library');
  if (fs.existsSync(libDir)) {
    for (const d of fs.readdirSync(libDir, { withFileTypes: true })) {
      if (d.isDirectory() && !declaresEngine(d.name)) missing.push(`library/${d.name}`);
    }
  }

  const problems = [
    ...(phantoms.length ? [`${phantoms.length} phantom entries: ${phantoms.join(', ')}`] : []),
    ...(missing.length ? [`${missing.length} shipping engine(s) absent from registry: ${missing.join(', ')}`] : []),
  ];
  return {
    passed: problems.length === 0,
    detail: problems.length === 0
      ? 'All active registry skill_paths are MANIFEST destinations whose sources ship; every shipping engine is declared'
      : problems.join(' | '),
  };
}

function checkOptimizationBacklog(rootDir) {
  const backlogPath = path.join(rootDir, 'docs/OPTIMIZATION-BACKLOG.md');
  if (!fs.existsSync(backlogPath)) return { passed: true, detail: 'No backlog file (informational check)' };

  // Find most recent fleet-feedback run
  let wsDir;
  try { wsDir = findWorkstreamDir(rootDir); }
  catch { return { passed: true, detail: 'No workstream — informational check skipped' }; }

  const runsDir = path.join(wsDir, 'runs');
  if (!fs.existsSync(runsDir)) return { passed: true, detail: 'No runs/ — no fleet-feedback runs to compare' };

  let latestFleetFeedback = null;
  for (const entry of fs.readdirSync(runsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(runsDir, entry.name, 'manifest.yaml');
    if (!fs.existsSync(manifestPath)) continue;
    const { ok, data } = readYAMLFile(manifestPath);
    if (!ok) continue;
    if (data.engine === 'fleet-feedback') {
      const ts = data.completed_at || data.started_at;
      if (ts && (!latestFleetFeedback || ts > latestFleetFeedback)) latestFleetFeedback = ts;
    }
  }

  if (!latestFleetFeedback) return { passed: true, detail: 'No fleet-feedback runs yet — nothing to compare' };

  const backlogMtime = fs.statSync(backlogPath).mtime.toISOString();
  const passed = backlogMtime >= latestFleetFeedback;

  return {
    passed,
    detail: passed
      ? `Backlog modified ${backlogMtime.slice(0, 10)} after last fleet-feedback ${latestFleetFeedback.slice(0, 10)}`
      : `Backlog last touched ${backlogMtime.slice(0, 10)} but fleet-feedback ran ${latestFleetFeedback.slice(0, 10)} — review backlog`,
  };
}

function checkHardlinkPreservation(rootDir) {
  // WS-142 / FIND-074: real content-hash hardlink scanner.
  //
  // The prior implementation (pre-2026-04-20) created a synthetic pair in
  // .cwos-verify-tmp/ and validated inode equality after a single
  // writeFileAtomic — it never touched a single real command file. sim.md
  // was silently content-diverged in production for days and this check had
  // no way to see it.
  //
  // New contract: walk every source-side command file in kit/, fleet/, sim/,
  // compute the expected .claude/commands/<basename> target, and require:
  //   (a) target exists,
  //   (b) same inode (NTFS hardlink preserved — otherwise Edit tool or
  //       rename-based writes have broken the link), and
  //   (c) byte-for-byte content match (SHA-256).
  //
  // Known pre-existing drift: sim/commands/sim.md diverged from
  // .claude/commands/sim.md during development (Edit-tool inode break,
  // documented in system/failures.md). The scanner will report this as
  // CONTENT-DIVERGED until /verify --fix-hardlinks --force is run or the
  // underlying divergence is manually resolved.
  const crypto = require('crypto');

  const sources = [
    { dir: path.join(rootDir, 'kit/commands'),   label: 'kit' },
    { dir: path.join(rootDir, 'fleet/commands'), label: 'fleet' },
    { dir: path.join(rootDir, 'sim/commands'),   label: 'sim' },
  ];
  const targetDir = path.join(rootDir, '.claude/commands');

  if (!fs.existsSync(targetDir)) {
    return { passed: false, detail: `target directory missing: .claude/commands/` };
  }

  const issues = [];
  let total = 0;

  for (const src of sources) {
    if (!fs.existsSync(src.dir)) continue;
    const files = globFiles(src.dir, '*.md');
    for (const f of files) {
      total++;
      const basename = path.basename(f);
      const tgt = path.join(targetDir, basename);

      if (!fs.existsSync(tgt)) {
        issues.push(`${src.label}/${basename}: TARGET-MISSING`);
        continue;
      }

      let srcStat, tgtStat;
      try {
        srcStat = fs.statSync(f);
        tgtStat = fs.statSync(tgt);
      } catch (e) {
        issues.push(`${src.label}/${basename}: STAT-ERROR (${e.code})`);
        continue;
      }

      if (srcStat.ino !== tgtStat.ino || tgtStat.nlink < 2) {
        issues.push(`${src.label}/${basename}: INODE-BROKEN (src=${srcStat.ino}, tgt=${tgtStat.ino}, nlink=${tgtStat.nlink})`);
        continue;
      }

      // Inode match implies content match on NTFS, but verify defensively
      // against filesystem bugs or mount-point divergence.
      const srcHash = crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
      const tgtHash = crypto.createHash('sha256').update(fs.readFileSync(tgt)).digest('hex');
      if (srcHash !== tgtHash) {
        issues.push(`${src.label}/${basename}: CONTENT-DIVERGED`);
      }
    }
  }

  return {
    passed: issues.length === 0,
    detail: issues.length === 0
      ? `${total} hardlink pairs OK (content + inode match)`
      : `${issues.length}/${total} pairs broken: ${issues.slice(0, 3).join('; ')}${issues.length > 3 ? '; ...' : ''}`,
  };
}

// Optional helper — re-establish broken hardlinks by overwriting the
// .claude/commands/ target with the kit/fleet/sim source via NTFS hardlink.
// Invoked by `cwos-verify.js --fix-hardlinks` (or --fix-hardlinks --force to
// overwrite divergent content). Keep outside the main check so dry runs are
// always non-destructive.
function fixBrokenHardlinks(rootDir, opts = {}) {
  const crypto = require('crypto');
  const force = opts.force === true;

  const sources = [
    { dir: path.join(rootDir, 'kit/commands'),   label: 'kit' },
    { dir: path.join(rootDir, 'fleet/commands'), label: 'fleet' },
    { dir: path.join(rootDir, 'sim/commands'),   label: 'sim' },
  ];
  const targetDir = path.join(rootDir, '.claude/commands');
  const actions = { fixed: [], skipped: [], errors: [] };

  for (const src of sources) {
    if (!fs.existsSync(src.dir)) continue;
    for (const f of globFiles(src.dir, '*.md')) {
      const basename = path.basename(f);
      const tgt = path.join(targetDir, basename);

      let broken = false;
      let divergent = false;
      try {
        if (!fs.existsSync(tgt)) {
          broken = true;
        } else {
          const srcStat = fs.statSync(f);
          const tgtStat = fs.statSync(tgt);
          if (srcStat.ino !== tgtStat.ino || tgtStat.nlink < 2) {
            broken = true;
            const sHash = crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
            const tHash = crypto.createHash('sha256').update(fs.readFileSync(tgt)).digest('hex');
            if (sHash !== tHash) divergent = true;
          }
        }
      } catch (e) {
        actions.errors.push(`${src.label}/${basename}: ${e.message}`);
        continue;
      }

      if (!broken) continue;

      if (divergent && !force) {
        actions.skipped.push(`${src.label}/${basename}: content diverged — use --force to overwrite target`);
        continue;
      }

      try {
        if (fs.existsSync(tgt)) fs.rmSync(tgt, { force: true });
        // ADR-043 / WS-306: NTFS hardlinks are supported natively by
        // fs.linkSync on Windows. Earlier code shelled out to PowerShell
        // when linkSync threw — that path interpolated unsanitized paths
        // into a -Command string. Drop the fallback; surface failures
        // through the existing actions.errors channel instead.
        fs.linkSync(f, tgt);
        actions.fixed.push(`${src.label}/${basename}`);
      } catch (e) {
        actions.errors.push(`${src.label}/${basename}: relink failed — ${e.message}`);
      }
    }
  }

  return actions;
}

// ─── INV-024: Distribution Referential Integrity (WS-143 / FIND-073) ──────
//
// Anchored on kit/MANIFEST.yaml as the single source of truth for "what the
// kit distributes." INDEX, registry, and command-prose references are
// treated as derivatives and validated against MANIFEST. The check catches
// five distinct classes of drift that previously required separate ad-
// hoc checks (or worse, no check at all):
//
//   (1) REGISTRY_SKILL_NOT_IN_MANIFEST — an active skill_path in the
//       template registry points at a file that MANIFEST doesn't distribute,
//       meaning /fleet-update ships a registry entry referencing something
//       adopted repos won't have post-install.
//   (2) INDEX_ENGINE_NOT_IN_MANIFEST — engines/INDEX.md lists an engine
//       that isn't in MANIFEST. Founders who browse INDEX assume it
//       reflects reality; this keeps it honest.
//   (3) COMMAND_DOC_REF_MISSING — a command file (kit/commands/*.md)
//       references a docs/*.md that doesn't exist on disk. This catches
//       the docs/bow-contract.md dangling-reference class documented in
//       FIND-069 before it ships to the fleet.
//   (4) COMMAND_DOC_REF_UNDISTRIBUTED — a distributed command references
//       a docs/*.md that exists in HomeBase but isn't in MANIFEST, so
//       adopted repos receive the command but not the doc it cites.
//   (5) TEMPLATE_PROGRAM_ENGINE_REF_UNDISTRIBUTED — a MANIFEST-distributed
//       program template (kit/templates/workstream/programs/prog-*.yaml)
//       declares a protocols.<name>.engine that does NOT resolve to a
//       distribution-cleared engine (engines/standard/ or engines/library/).
//       This is the FIND-235 / WS-353 leak class: the canonical instance was
//       prog-launch.yaml referencing the homebase-only `convergence` engine,
//       which never propagates — so every adopted repo fired "engine not in
//       registry" warnings. Scope note: only MANIFEST-listed templates are
//       checked; HomeBase-internal program templates that live in the dir but
//       never ship (e.g. prog-detectability, prog-optimization) are out of
//       scope by construction. Schema-shape checks on the same surface are
//       owned by INV-025; this class covers only engine-ref resolvability.
//
// Commented-out registry entries are intentional (planned/deferred work)
// and are not violations.
function checkDistributionRefs(rootDir) {
  if (!isKitSourceRepo(rootDir)) return { passed: true, detail: NOT_KIT_SOURCE_NA };
  // ── Parse MANIFEST: extract every `source:` path ─────────────────────
  const manifestPath = path.join(rootDir, 'kit/MANIFEST.yaml');
  if (!fs.existsSync(manifestPath)) return { passed: false, detail: 'kit/MANIFEST.yaml not found' };
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const manifestSources = new Set();
  const manifestDestinations = new Set();
  for (const line of manifestContent.split('\n')) {
    const m = line.match(/^\s*-\s*source:\s*(.+?)\s*$/);
    if (m) manifestSources.add(m[1].replace(/^["']|["']$/g, '').replace(/\\/g, '/'));
    const d = line.match(/^\s*destination:\s*(.+?)\s*$/);
    if (d) manifestDestinations.add(d[1].replace(/^["']|["']$/g, '').replace(/\\/g, '/'));
  }

  const violations = [];

  // ── (1) Template registry skill_paths must be in MANIFEST ────────────
  //
  // skill_path is destination-shaped by design (WS-558: the adopted repo
  // reads the registry to find its INSTALLED skill, so INV-014 checks these
  // against MANIFEST destinations). This clause predates that decision and
  // required a SOURCE match, failing every destination-shaped entry that
  // INV-014 simultaneously required. Accept either side of the install map:
  // the invariant is "the registry points at a MANIFEST-tracked artifact".
  const registryPath = path.join(rootDir, 'kit/templates/workstream/engines/registry.yaml');
  if (fs.existsSync(registryPath)) {
    for (const line of fs.readFileSync(registryPath, 'utf8').split('\n')) {
      if (line.trim().startsWith('#')) continue;
      const m = line.match(/^\s*skill_path:\s*(.+?)\s*$/);
      if (!m) continue;
      const sp = m[1].replace(/^["']|["']$/g, '').replace(/\\/g, '/');
      if (!manifestSources.has(sp) && !manifestDestinations.has(sp)) {
        violations.push(`REGISTRY_SKILL_NOT_IN_MANIFEST: ${sp}`);
      }
    }
  }

  // ── (2) engines/INDEX.md named engines must be in MANIFEST ───────────
  //
  // INDEX is a markdown doc; engines are listed in tables with the shape:
  //   | **engine-name** | `engines/standard/name.md` | description | ... |
  //   | **library-name** | `engines/library/name/` | ... |         (dir)
  //   | **Base** | `engines/base/` | ...                 (infra — skip)
  //   | **Procedure** | `engines/procedures/` | ...      (infra — skip)
  // We extract (name, path) pairs, skip the two dispatch-infrastructure
  // rows, and require the path (normalized to a file) to match a MANIFEST
  // source. Directory-shaped paths resolve to `<dir>SKILL.md`.
  //
  // WS-444 / FIND-315: INDEX also opens with a taxonomy legend table whose
  // rows point at the bare scope directories (`engines/standard/`,
  // `engines/library/`, `engines/homebase-only/`) — these describe the three
  // engine SCOPES, not individual engines, and previously produced three
  // false INDEX_ENGINE_NOT_IN_MANIFEST violations (they resolved to a
  // nonexistent `<scope>/SKILL.md`). A bare top-level scope dir is never an
  // engine, so skip it.
  const indexPath = path.join(rootDir, 'engines/INDEX.md');
  if (fs.existsSync(indexPath)) {
    const indexText = fs.readFileSync(indexPath, 'utf8');
    const ROW_RE = /\|\s*\*\*([A-Za-z][A-Za-z0-9-]+)\*\*\s*\|\s*`(engines\/[^`]+)`/g;
    const INFRA_PREFIX = /^engines\/(base|procedures|styles)\//;
    const SCOPE_DIR_RE = /^engines\/(standard|library|homebase-only)\/$/;
    for (const m of indexText.matchAll(ROW_RE)) {
      const engPath = m[2].replace(/\\/g, '/');
      if (INFRA_PREFIX.test(engPath)) continue;
      if (SCOPE_DIR_RE.test(engPath)) continue; // taxonomy legend row, not an engine
      // Normalize directory refs (engines/library/foo/) to the SKILL.md file.
      const resolved = engPath.endsWith('/') ? `${engPath}SKILL.md` : engPath;
      if (!manifestSources.has(resolved)) {
        violations.push(`INDEX_ENGINE_NOT_IN_MANIFEST: ${m[1]} -> ${resolved}`);
      }
    }
  }

  // ── (3) kit/commands/ references to docs/*.md must exist on disk ─────
  //
  // Case-insensitive (`docs/INVARIANTS.md` and `docs/bow-contract.md` both
  // warrant checking). Some commands deliberately describe legacy/migration
  // paths that do NOT exist; those are exempted explicitly.
  //
  // SKIPLIST:
  //   - `audit.md`: scans for legacy misplaced files by path; its docs/*
  //     references are data to check, not real links.
  //   - `discover.md` (WS-444 / FIND-315): probes a TARGET repo and lists the
  //     files it looks for there (e.g. `docs/CONSTRAINTS.md`, `docs/INVARIANTS.md`).
  //     Those are descriptions of the adopted repo's layout, not HomeBase doc
  //     links — they must not be required to exist on disk here.
  const cmdDir = path.join(rootDir, 'kit/commands');
  const SKIPLIST = new Set(['audit.md', 'discover.md']);
  if (fs.existsSync(cmdDir)) {
    const DOC_REF_RE = /docs\/([A-Za-z][A-Za-z0-9/-]+\.md)/g;
    for (const f of globFiles(cmdDir, '*.md')) {
      const cmdName = path.basename(f);
      if (SKIPLIST.has(cmdName)) continue;
      const text = fs.readFileSync(f, 'utf8');
      const seen = new Set();
      for (const m of text.matchAll(DOC_REF_RE)) {
        const ref = 'docs/' + m[1];
        if (seen.has(ref)) continue;
        seen.add(ref);
        // Skip template placeholders — paths containing `NNN` are a
        // documented CWOS convention for dynamic-number substitution
        // (e.g. ADR-NNN.md, WS-NNN.yaml). Commands that show these in
        // their prose/examples are not referencing real files.
        if (/NNN/.test(ref)) continue;
        const onDisk = fs.existsSync(path.join(rootDir, ref));
        if (!onDisk) {
          violations.push(`COMMAND_DOC_REF_MISSING: ${cmdName} -> ${ref}`);
        }
        // (4) intentionally left as an advisory — many commands reference
        // HomeBase-internal docs (PRODUCT.md, ADRs) that aren't distributed,
        // which is fine. A future refinement could require distributed docs
        // to be MANIFEST-declared; for now we only flag missing-on-disk.
      }
    }
  }

  // ── (5) Distributed template programs' protocol engine refs must resolve
  //        to a distribution-cleared engine (WS-353 / FIND-235) ───────────
  //
  // The distributable engine set is derived from MANIFEST itself: an engine
  // is shippable iff MANIFEST distributes engines/standard/<id>.md or
  // engines/library/<id>/... . homebase-only engines live under
  // engines/homebase-only/ and so are naturally absent from this set. We
  // iterate ONLY MANIFEST-listed template programs — a program template that
  // lives in the dir but isn't distributed never reaches an adopted repo, so
  // a homebase-only ref there is harmless and out of scope.
  const distributableEngines = new Set();
  for (const src of manifestSources) {
    let m = src.match(/^engines\/standard\/([a-z0-9][a-z0-9-]*)\.md$/);
    if (m) { distributableEngines.add(m[1]); continue; }
    m = src.match(/^engines\/library\/([a-z0-9][a-z0-9-]*)\//);
    if (m) distributableEngines.add(m[1]);
  }
  // Only meaningful to check engine-ref resolvability if we actually resolved
  // a distributable set from MANIFEST (defends against a malformed/empty parse
  // turning every ref into a false violation).
  if (distributableEngines.size > 0) {
    let homebaseOnly = new Set();
    try {
      const { loadHomebaseOnlyEngines } = require('./lib/cwos-bundle-validate');
      homebaseOnly = loadHomebaseOnlyEngines(rootDir);
    } catch { /* messaging-only; absence just means we can't label "homebase-only" vs "unknown" */ }

    for (const src of manifestSources) {
      if (!/^kit\/templates\/workstream\/programs\/prog-.*\.yaml$/.test(src)) continue;
      const progPath = path.join(rootDir, src);
      if (!fs.existsSync(progPath)) continue; // INV-024 class (1)-style missing-source is a separate concern
      const r = readYAMLFile(progPath);
      if (!r.ok || !r.data || !r.data.protocols || typeof r.data.protocols !== 'object') continue;
      const protocols = r.data.protocols;
      for (const protoName of Object.keys(protocols)) {
        const proto = protocols[protoName];
        if (!proto || typeof proto !== 'object') continue;
        const engine = proto.engine;
        if (!engine || typeof engine !== 'string') continue;
        if (distributableEngines.has(engine)) continue;
        const kind = homebaseOnly.has(engine) ? 'homebase-only — will not propagate' : 'unknown engine';
        violations.push(`TEMPLATE_PROGRAM_ENGINE_REF_UNDISTRIBUTED: ${src} protocols.${protoName}.engine="${engine}" (${kind})`);
      }
    }
  }

  return {
    passed: violations.length === 0,
    detail: violations.length === 0
      ? `referential integrity OK (MANIFEST anchors INDEX, registry, command doc-refs, template program engine-refs)`
      : `${violations.length} violations: ${violations.slice(0, 4).join('; ')}${violations.length > 4 ? '; ...' : ''}`,
    violations, // full list (additive; INVARIANT_CHECKS only reads passed/detail) — enables class-specific assertions in tests
  };
}

// ─── INV-025: schema_version Type Consistency (WS-144 / FIND-081) ──────────
//
// YAML 1.1 coerces bare scalars in sneaky ways (NO/YES → booleans, 3.0 →
// float). FIND-060's resolution quoted every `schema_version:` field in kit
// templates to defend against that. But live `.claude/workstream/` files use
// integer form, creating a silent type mismatch: any downstream `=== 3`
// check passes on live files and fails on templates. The program that
// declares "Schema Version Consistency" as a problem class was violating its
// own rule.
//
// Canonical form: integer. `3` is not subject to YAML Norway (NO/YES only);
// `3.0` would be (as float) but we never use float versions. The live-file
// form is already integer, so the fix is to un-quote templates.
//
// This check scans every YAML file under kit/templates/ and
// .claude/workstream/ for `schema_version:` lines and requires the value to
// be an unquoted integer matching the family-expected version (programs→3,
// config→1, registry→3).
function checkSchemaVersionConsistency(rootDir) {
  const SCHEMA_VERSION_RE = /^\s*schema_version:\s*(.+?)\s*$/;
  // WS-560: the program family moved to 4 with ADR-053's registered
  // migrateSchemaV3ToV4, but this pin stayed at 3 and had been reporting 13
  // false violations against files that were correctly migrated. Keep the pin —
  // a single expected value per family is what makes drift visible — but keep
  // it CURRENT. When a family's schema moves, this table moves with it, in the
  // same commit as the migration.
  const EXPECTED_BY_FAMILY = [
    { re: /programs[\\/]prog-[^\\/]+\.ya?ml$/,       expected: 4 },
    { re: /programs[\\/]registry\.ya?ml$/,            expected: 3 },
    { re: /programs[\\/]skeleton[\\/]prog\.ya?ml$/,   expected: 3 },
    { re: /workstream[\\/]config\.ya?ml$/,            expected: 1 },
  ];

  const scanDirs = [
    path.join(rootDir, 'kit/templates'),
    path.join(rootDir, '.claude/workstream'),
  ].filter(d => fs.existsSync(d));

  const violations = [];

  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (!/\.ya?ml$/.test(e.name)) continue;

      let content;
      try { content = fs.readFileSync(full, 'utf8'); } catch { continue; }

      const m = content.split('\n').map(l => l.match(SCHEMA_VERSION_RE)).find(Boolean);
      if (!m) continue;

      const raw = m[1];
      const rel = path.relative(rootDir, full).replace(/\\/g, '/');

      // Determine expected version for this file's family.
      let expected = null;
      for (const fam of EXPECTED_BY_FAMILY) {
        if (fam.re.test(full)) { expected = fam.expected; break; }
      }
      if (expected === null) continue; // unknown family — skip

      // Type check: reject quoted strings.
      if (/^["'].*["']$/.test(raw)) {
        violations.push(`${rel}: quoted string value ${raw} (expected integer ${expected})`);
        continue;
      }

      // Value check: must match expected integer.
      if (String(parseInt(raw, 10)) !== raw || parseInt(raw, 10) !== expected) {
        violations.push(`${rel}: value ${raw} (expected integer ${expected})`);
      }
    }
  }

  for (const d of scanDirs) walk(d);

  return {
    passed: violations.length === 0,
    detail: violations.length === 0
      ? `All schema_version values are consistent integer form per family`
      : `${violations.length} violations: ${violations.slice(0, 3).join('; ')}${violations.length > 3 ? '; ...' : ''}`,
  };
}

// ─── INV-026: Hook Liveness (WS-138 / FIND-067, rebuilt WS-564) ───────────
//
// Stop + SessionStart hooks run with `2>/dev/null || true`, suppressing every
// error. If cwos-heartbeat.js or cwos-session-recovery.js crashes (bad
// require chain, permission error, YAML parse fail), the failure is invisible
// and session state rots silently. This check reads the liveness stamp file
// those scripts write and flags staleness.
//
// WHY IT NO LONGER STARTS FROM `.current-session` (WS-564). The pointer holds
// exactly ONE id — cwos-claims calls it "legacy… not the identity of record"
// precisely because it cannot represent N concurrent sessions. Resolving
// through it made this check vacuous in the two states that matter most:
//
//   * pointer DELETED by a concurrent session (observed 2026-08-02) → the
//     check returned PASS/"no active session" while three sessions were live
//     and the heartbeat hook had been dead for two days;
//   * pointer naming a session that had since ended → PASS/"N/A", again while
//     other sessions were active.
//
// A vacuous pass is the fail-open shape this whole item exists to remove. So
// the population is now every `status: active` record, and a missing pointer
// with active records present is a FAILURE (the pointer's own consumers are
// broken), not an excuse to skip.
//
// Decision logic:
//   (1) No active session records at all → PASS, N/A. Genuinely nothing to
//       verify: no session means no hook should be firing.
//   (2) Active records exist, stamp file missing → FAIL.
//   (3) Active records exist, no `last_heartbeat_hook_at` → FAIL. Note the
//       stamp now proves a session was actually ADVANCED, not merely that the
//       script started (that is `last_heartbeat_hook_fired_at`). A hook that
//       fires and advances nobody used to certify itself as healthy.
//   (4) Stamp older than 2 hours → FAIL.
//   (5) Every active record's own last_heartbeat older than 2h → FAIL, even
//       when the stamp is fresh: the hook is running for SOME session while
//       these rot, which is the concurrency case the pointer hid.
//   (6) Otherwise → PASS.
//
// The 2-hour threshold is conservative: the Stop hook fires on every Claude
// response, so during an active session the stamp updates in minutes. Two
// hours absorbs long tool-waits (remote agents, browser automation) without
// false-positive-ing.
function checkHookLiveness(rootDir) {
  const STALE_H = 2;
  const wsDir = path.join(rootDir, '.claude/workstream');
  if (!fs.existsSync(wsDir)) {
    return { passed: true, detail: 'no workstream dir (INV-026 N/A)' };
  }

  const sessDir = path.join(wsDir, 'sessions');
  let sessionFiles = [];
  try { sessionFiles = fs.readdirSync(sessDir).filter((f) => f.endsWith('.yaml')); } catch { /* none */ }

  // Every record that SAYS it is active — the whole population, not one pointer.
  const active = [];
  for (const f of sessionFiles) {
    let raw;
    try { raw = fs.readFileSync(path.join(sessDir, f), 'utf8'); } catch { continue; }
    // Quote-tolerant, like the id and last_heartbeat reads three lines down.
    // This one was not, which made it fail OPEN: a record written
    // `status: "active"` is skipped, and if every active record were quoted the
    // population would be empty and INV-026 would return "no sessions marked
    // active (N/A)" — a PASS over total blindness. Same shape WS-564 fixed for
    // the liveness stamp itself.
    if (!/^status:\s*["']?active["']?\s*$/m.test(raw)) continue;
    const id = (raw.match(/^id:\s*"?([^"\n]+?)"?\s*$/m) || [])[1] || f.replace(/\.yaml$/, '');
    const hb = (raw.match(/^last_heartbeat:\s*"?([^"\n]+?)"?\s*$/m) || [])[1];
    const t = hb ? Date.parse(hb.trim()) : NaN;
    active.push({ id: id.trim(), beatMs: Number.isFinite(t) ? t : null });
  }

  if (active.length === 0) {
    return { passed: true, detail: 'no session records marked active (hook-liveness N/A)' };
  }

  const ptrPath = path.join(wsDir, '.current-session');
  const ptrNote = fs.existsSync(ptrPath) ? '' : ' (and .current-session is absent — its consumers are blind)';

  const livenessPath = path.join(wsDir, '.hooks-liveness.yaml');
  if (!fs.existsSync(livenessPath)) {
    return {
      passed: false,
      detail: `${active.length} active session(s) but .hooks-liveness.yaml missing${ptrNote} — hooks may never have fired. Check .claude/settings.local.json and kit/scripts/cwos-heartbeat.js.`,
    };
  }

  const livenessContent = fs.readFileSync(livenessPath, 'utf8');
  const stampMatch = livenessContent.match(/^last_heartbeat_hook_at:\s*"?([^"\n]+)"?\s*$/m);
  const firedMatch = livenessContent.match(/^last_heartbeat_hook_fired_at:\s*"?([^"\n]+)"?\s*$/m);
  if (!stampMatch) {
    const firedNote = firedMatch
      ? ` The script DID start (last_heartbeat_hook_fired_at ${firedMatch[1].trim()}) but advanced no session — it is resolving nobody.`
      : '';
    return {
      passed: false,
      detail: `${active.length} active session(s) but liveness stamp has no last_heartbeat_hook_at${ptrNote}.${firedNote}`,
    };
  }

  const stampTime = Date.parse(stampMatch[1].trim());
  if (isNaN(stampTime)) {
    return {
      passed: false,
      detail: `last_heartbeat_hook_at is not a parseable ISO timestamp: ${stampMatch[1]}`,
    };
  }

  const ageHours = (Date.now() - stampTime) / (60 * 60 * 1000);
  if (ageHours > STALE_H) {
    return {
      passed: false,
      detail: `${active.length} active session(s) but last heartbeat hook advanced one ${ageHours.toFixed(1)}h ago — hook likely broken (check Node install and kit/scripts/cwos-heartbeat.js).`,
    };
  }

  // (5) The stamp says SOMEBODY is beating. Say who is not.
  const rotting = active.filter((a) => a.beatMs == null || (Date.now() - a.beatMs) / 3600000 > STALE_H);
  if (rotting.length === active.length) {
    return {
      passed: false,
      detail: `heartbeat hook is current (${ageHours.toFixed(2)}h) but all ${active.length} active record(s) are stale: `
            + `${rotting.slice(0, 5).map((r) => r.id).join(', ')}${rotting.length > 5 ? ', …' : ''}. `
            + 'The hook is advancing nobody these records know about — run cwos-session-recovery.js --auto.',
    };
  }

  const rot = rotting.length ? `; ${rotting.length}/${active.length} active record(s) stale (run cwos-session-recovery.js --auto)` : '';
  return {
    passed: true,
    detail: `${active.length} active session(s); last heartbeat hook ${ageHours.toFixed(2)}h ago (threshold ${STALE_H}h)${rot}`,
  };
}

// ─── INV-027: Command File Size Budget (WS-149 / FIND-080) ────────────────
//
// Command files have grown unbounded (engine.md at 853 lines, top 4 at ~26k
// tokens per session). This check surfaces growth before it balloons session
// cost further. Soft limit 500 lines = warning embedded in detail (still
// passes). Hard limit 1000 lines = invariant fails.
//
// Scope is kit/commands/*.md only. fleet/ and sim/ are infrastructure;
// engines/standard/*.md and engines/library/**/*.md are engine-dispatch
// payload with different budget profiles. claude-preamble.md is a separate
// concern (always-loaded) and may get its own invariant later.
function checkCommandFileSizeBudget(rootDir) {
  const SOFT_LIMIT = 500;
  const HARD_LIMIT = 1000;
  const cmdDir = path.join(rootDir, 'kit/commands');
  if (!fs.existsSync(cmdDir)) {
    return { passed: true, detail: 'no kit/commands/ dir' };
  }

  const files = globFiles(cmdDir, '*.md');
  const warns = [];
  const fails = [];
  for (const f of files) {
    const lines = fs.readFileSync(f, 'utf8').split('\n').length;
    const entry = { name: path.basename(f), lines };
    if (lines >= HARD_LIMIT) fails.push(entry);
    else if (lines >= SOFT_LIMIT) warns.push(entry);
  }

  if (fails.length > 0) {
    fails.sort((a, b) => b.lines - a.lines);
    return {
      passed: false,
      detail: `${fails.length} commands over hard limit (${HARD_LIMIT} lines): ${fails.map(e => `${e.name} (${e.lines})`).join(', ')}. Restructure or split.`,
    };
  }

  if (warns.length > 0) {
    warns.sort((a, b) => b.lines - a.lines);
    return {
      passed: true,
      detail: `All under hard limit (${HARD_LIMIT}). ${warns.length}/${files.length} over soft limit (${SOFT_LIMIT}, warn-only): ${warns.map(e => `${e.name} (${e.lines})`).join(', ')}.`,
    };
  }

  return {
    passed: true,
    detail: `All ${files.length} command files within soft limit (${SOFT_LIMIT} lines).`,
  };
}

// ─── INV-075: Always-loaded prose stays within budget (WS-672 step 4) ───────
//
// Prose is the only enforcement tier with a running cost — a hook costs nothing
// until it fires, a gate nothing until this suite runs, but an always-loaded
// paragraph is paid every session whether or not it is relevant. Measured
// 2026-08-18: the 16 repo CLAUDE.md files on this fleet totalled 81,233 tokens.
//
// The fleet skill was given a ~1,000-token design budget in WS-608. Nothing
// checked it, so it doubled. That is the whole argument for this check: a budget
// nothing checks is a wish.
//
// Ceilings live in kit/prose-budget.yaml — version controlled, reviewable in a
// diff, and the single source shared with `cwos-guard budget`. Deliberately
// scoped to always-loaded surfaces: engine SKILL.md files are dispatch payload
// (domain-audit is 10k tokens and costs nothing until it runs) and command files
// are INV-027's job.
//
// HomeBase-only in v1: the budget file is not in kit/MANIFEST.yaml, so adopted
// repos have no ceilings and this reports "not configured" rather than passing
// silently. Read inline rather than by requiring cwos-guard.js, which is also
// deliberately unshipped — a require would drag it into MANIFEST via INV-064.
function checkProseBudget(rootDir) {
  const budgetPath = path.join(rootDir, 'kit', 'prose-budget.yaml');
  if (!fs.existsSync(budgetPath)) {
    return { passed: true, detail: 'no kit/prose-budget.yaml — prose budgets are HomeBase-only in v1 (WS-672), not configured here.' };
  }

  const read = readYAMLFile(budgetPath);
  if (!read.ok) {
    return { passed: false, detail: `kit/prose-budget.yaml could not be read: ${read.error}` };
  }
  const surfaces = Array.isArray((read.data || {}).surfaces) ? read.data.surfaces : [];
  if (!surfaces.length) {
    return { passed: false, detail: 'kit/prose-budget.yaml declares no surfaces — an empty budget is the wish this check replaced.' };
  }

  const over = [];
  const measured = [];
  let debt = 0;
  for (const s of surfaces) {
    if (!s || !s.path) continue;
    const abs = String(s.path).charAt(0) === '~'
      ? path.join(require('os').homedir(), String(s.path).slice(1).replace(/^[\\/]/, ''))
      : (path.isAbsolute(s.path) ? s.path : path.join(rootDir, s.path));
    if (!fs.existsSync(abs)) continue;                     // absent on this node — skipped, not failed
    const tokens = Math.round(fs.readFileSync(abs, 'utf8').length / 4);
    const ceiling = Number(s.ceiling_tokens) || 0;
    const target = Number(s.target_tokens) || 0;
    const mult = Number(s.multiplier) || 1;
    measured.push({ path: s.path, tokens, ceiling });
    if (target > 0 && tokens > target) debt += (tokens - target) * mult;
    if (ceiling > 0 && tokens > ceiling) over.push({ path: s.path, tokens, ceiling, mult });
  }

  if (over.length) {
    over.sort((a, b) => (b.tokens - b.ceiling) * b.mult - (a.tokens - a.ceiling) * a.mult);
    return {
      passed: false,
      detail: `${over.length} always-loaded surface(s) over ceiling: ` +
        over.map((o) => `${o.path} ${o.tokens}/${o.ceiling}${o.mult > 1 ? ` (x${o.mult} repos)` : ''}`).join(', ') +
        '. Cut it, or raise the ceiling deliberately — but a ceiling raised to match the file is the wish this replaced.',
    };
  }

  return {
    passed: true,
    detail: `${measured.length} always-loaded surface(s) within ceiling` +
      (debt ? `; ${debt} tok of declared debt remains (distance from target, weighted by install count)` : '') + '.',
  };
}

// ─── INV-076: A promoted lesson's prose is deleted (WS-672 step 5) ──────────
//
// The step most likely to be skipped, and the only one that reclaims anything.
// A lesson promoted to a hook while its paragraph stays on disk has made things
// WORSE: the token cost is unchanged and there is now one more place to look.
// WS-672 named that as its own most likely failure mode, so it is gated rather
// than trusted.
//
// A cwos-guard rule may declare `retires: {file, anchor}`. If the anchor text is
// still findable in that file, the promotion is incomplete. Rules with no
// `retires:` are untracked, not silently counted as retired.
function checkPromotedProseRetired() {
  const guardsPath = path.join(require('os').homedir(), '.claude', 'guards.yaml');
  if (!fs.existsSync(guardsPath)) {
    return { passed: true, detail: 'no ~/.claude/guards.yaml — the enforcement harness is not configured on this node.' };
  }

  const read = readYAMLFile(guardsPath);
  if (!read.ok) {
    return { passed: false, detail: `~/.claude/guards.yaml could not be read: ${read.error} — every rule in it is silently off.` };
  }
  const guards = Array.isArray((read.data || {}).guards) ? read.data.guards : [];

  // A table that exists but yields no rules is NOT a clean bill of health — it is
  // the same silent-off state as an unreadable one, and reporting it as "all
  // prose deleted" is exactly the dishonest-clean this check exists to prevent.
  if (!guards.length) {
    return { passed: false, detail: '~/.claude/guards.yaml exists but parsed to zero rules — every enforcement on this node is silently off.' };
  }

  const unretired = [];
  let tracked = 0;
  for (const g of guards) {
    if (!g || !g.retires || !g.retires.file || !g.retires.anchor) continue;
    tracked++;
    const f = String(g.retires.file).replace(/^~/, require('os').homedir());
    if (!fs.existsSync(f)) continue;                        // file gone: nothing left to retire
    let text;
    try { text = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
    if (text.includes(g.retires.anchor)) {
      unretired.push({ id: g.id, file: g.retires.file, anchor: g.retires.anchor });
    }
  }

  if (unretired.length) {
    return {
      passed: false,
      detail: `${unretired.length} promoted lesson(s) still carry their prose: ` +
        unretired.map((u) => `${u.id} -> ${u.file} ("${u.anchor}")`).join('; ') +
        '. Delete the paragraph — a promotion that leaves it behind adds a place to look and reclaims nothing.',
    };
  }

  return {
    passed: true,
    detail: `${guards.length} guard rule(s), ${tracked} declaring a retirement, all prose deleted.`,
  };
}

// ─── INV-042: Output Shape coverage (FIND-082 / WS-158) ─────────────────────
//
// Common-traffic kit commands must declare the response shape the founder
// will see, using the BoW envelope from docs/bow-contract.md. The 12 commands
// in scope were identified by the design-audit engine (run-001 / FIND-082)
// as having procedural preambles but no output-shape guidance — the gap that
// kept HomeBase's AI-conversation surface at L2.
//
// Check: each in-scope file must contain a literal `## Output Shape` heading
// at the start of a line. The 6 reference commands (/status, /pulse,
// /session-start, /welcome, /session-end, /onboard-check) are out of scope
// per founder direction in SPR-083.

const OUTPUT_SHAPE_COMMANDS = [
  'next.md', 'plan.md', 'audit.md', 'decide.md', 'build-engine.md',
  'engine.md', 'evolve.md', 'feedback.md', 'verify.md', 'autopilot.md',
  'checkpoint.md', 'workstream.md',
];

function checkOutputShapeCoverage(rootDir) {
  const cmdDir = path.join(rootDir, 'kit/commands');
  if (!fs.existsSync(cmdDir)) {
    return { passed: true, detail: 'no kit/commands/ dir' };
  }

  const missing = [];
  for (const name of OUTPUT_SHAPE_COMMANDS) {
    const file = path.join(cmdDir, name);
    if (!fs.existsSync(file)) {
      missing.push(`${name} (file not found)`);
      continue;
    }
    const content = fs.readFileSync(file, 'utf8');
    if (!/^## Output Shape\s*$/m.test(content)) {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    return {
      passed: false,
      detail: `${missing.length}/${OUTPUT_SHAPE_COMMANDS.length} command(s) missing '## Output Shape' heading: ${missing.join(', ')}. Add the section per docs/bow-contract.md envelope.`,
    };
  }

  return {
    passed: true,
    detail: `All ${OUTPUT_SHAPE_COMMANDS.length} in-scope commands declare '## Output Shape'.`,
  };
}

// ─── INV-028: Shadow-event instrumentation coverage ─────────────────────────
//
// ADR-018 step 1 escape-valve contract: script-layer instrumentation must
// cover ≥95% of state-mutating call sites. Coverage below 95% opens the
// step-1.5 wrapper-instrumentation amendment (§Alternatives #8).
//
// "State-mutating call site" = a write/append/unlink/rename/copyFile call
// targeting a path under `.claude/workstream/`, `system/`, or the kit
// index/counter files. A script is "covered" if it imports `appendEvent`
// from `core/events` directly OR routes through the canonical
// `makeEventEmitter()` / `loadEventDeps()` factories from lib/cwos-utils.
// A command (`kit/commands/*.md`) is covered if it contains a
// `cwos-event append` invocation line.
//
// This check is warn-only for commands + script-layer: it returns
// { passed: <coverage_ok>, detail: <summary> } and surfaces the uncovered
// site list in `detail`. Fails only when coverage < 95%.

// WS-560: scripts whose ONLY writes fall outside the scope this check declares
// above — `.claude/workstream/`, `system/`, and the kit index/counter files.
// The detector greps for write-function NAMES anywhere in a file and never looks
// at the target, so these scripts counted against coverage for writing a log to
// the home directory or regenerating a doc. Explicit and tracked, in the same
// spirit as INV-059's EVOLUTION_PATH_ALLOWLIST — not silent suppression. Each
// entry names the path it actually writes; if one of these ever starts writing
// CWOS state, delete its line rather than widening the comment.
const INSTRUMENTATION_SCOPE_EXCLUSIONS = new Map([
  ['cwos-agent-tools.js', '~/.local/bin/rg.exe — machine-local agent tool bridge, outside any repo'],
  ['cwos-admin-escalation-audit.js', '~/.claude/admin-escalation.log — machine-local, outside any repo'],
  ['cwos-adr038-pass.js', 'a generated pass report under docs/'],
  ['cwos-fleet-recognition.js', "ai-personal's nodes/*.md + *.trust.json — another repo's files"],
  ['cwos-node-bootstrap.js', '.claude/commands/ hardlinks + ~/.local/bin/rg.exe — machine-local, regenerated on demand'],
  ['cwos-phone-publish.js', 'build/phone-outbox/ — build output'],
  ['generate-commands-doc.js', 'docs/COMMANDS.md — a generated doc'],
]);

function checkShadowInstrumentationCoverage(rootDir) {
  const THRESHOLD = 0.95;

  // Script-layer coverage
  const scriptDir = path.join(rootDir, 'kit', 'scripts');
  const excluded = ['lib', 'core', '__tests__', 'git-hooks'];
  const scripts = fs.existsSync(scriptDir)
    ? fs.readdirSync(scriptDir).filter((f) => f.endsWith('.js') && !excluded.includes(path.basename(f, '.js')) && !f.endsWith('.test.js'))
    : [];
  const mutatingScripts = [];
  const instrumentedScripts = [];
  for (const f of scripts) {
    const full = path.join(scriptDir, f);
    const text = fs.readFileSync(full, 'utf8');
    const mutates = /writeFileAtomic|writeFileSync|appendFileSync|renameSync|unlinkSync|copyFileSync/.test(text);
    if (!mutates) continue;
    if (INSTRUMENTATION_SCOPE_EXCLUSIONS.has(f)) continue;
    mutatingScripts.push(f);
    if (/require\(['"]\.\/core\/events['"]\)|require\(['"]\.\.\/core\/events['"]\)|makeEventEmitter\(\)|loadEventDeps\(\)/.test(text)) {
      instrumentedScripts.push(f);
    }
  }

  // Command-layer coverage
  const cmdDir = path.join(rootDir, 'kit', 'commands');
  const cmds = fs.existsSync(cmdDir)
    ? fs.readdirSync(cmdDir).filter((f) => f.endsWith('.md'))
    : [];
  const commandsInstrumented = [];
  const commandsUncovered = [];
  for (const f of cmds) {
    const text = fs.readFileSync(path.join(cmdDir, f), 'utf8');
    if (/cwos-event(\.js)?\s+append\s+command_completed/.test(text)) commandsInstrumented.push(f);
    else commandsUncovered.push(f);
  }

  const scriptCov = mutatingScripts.length === 0 ? 1 : instrumentedScripts.length / mutatingScripts.length;
  const cmdCov = cmds.length === 0 ? 1 : commandsInstrumented.length / cmds.length;
  const overallCov = (scriptCov + cmdCov) / 2;
  const passed = overallCov >= THRESHOLD;

  const scriptUncovered = mutatingScripts.filter((f) => !instrumentedScripts.includes(f));
  const detail = passed
    ? `Coverage ${(overallCov * 100).toFixed(0)}% — scripts ${instrumentedScripts.length}/${mutatingScripts.length}, commands ${commandsInstrumented.length}/${cmds.length}.`
    // WS-560: this used to advise "escape valve at §Alternatives #8 if <95%
    // after 1 month". ADR-018 §Alternatives #8 says the opposite — the wrapper
    // alternative is "retired as a sleeping option, NOT a calendar-scheduled
    // escape valve", because WS-187 closed this to 100% with the script layer.
    // A red invariant pointing at a retired remedy invites the wrong fix.
    : `Coverage ${(overallCov * 100).toFixed(0)}% < ${(THRESHOLD * 100).toFixed(0)}% — scripts ${instrumentedScripts.length}/${mutatingScripts.length} (${scriptUncovered.slice(0, 5).join(', ')}${scriptUncovered.length > 5 ? `, +${scriptUncovered.length - 5} more` : ''}), commands ${commandsInstrumented.length}/${cmds.length} (${commandsUncovered.slice(0, 5).join(', ')}${commandsUncovered.length > 5 ? `, +${commandsUncovered.length - 5} more` : ''}). Fix by instrumenting the listed sites (makeEventEmitter + a real emit at the mutation point), or — if a script's writes fall outside .claude/workstream/, system/ and the kit index files — add it to INSTRUMENTATION_SCOPE_EXCLUSIONS with its actual write target named.`;

  return { passed, detail };
}

// ─── INV-029: Rollback runbook drift ────────────────────────────────────────
//
// OPT-006 signal from WS-176 capstone: the step-1 rollback runbook drifted
// as SPR-058 added new files that the runbook's inventory did not list.
// This check catches that class of drift by extracting claimed file paths
// from every `docs/runbooks/*-rollback.md` and diffing against `git ls-files`
// under the directories the runbook claims to cover.
//
// Algorithm:
//   1. Find every docs/runbooks/*-rollback.md.
//   2. Parse ALL file-path mentions from:
//        - `git rm ... <path>` lines (with -r, -f variants)
//        - `git checkout <sha> -- <paths>` lines
//        - Markdown bullets of the form "- `<path>`" or similar
//   3. Identify the directory prefixes the runbook "covers" (any path
//      ending with `/` plus the unique parent dirs of listed files).
//   4. For each covered directory, list all tracked files via
//      `git ls-files <dir>` and check they appear in the runbook's
//      path set.
//   5. Report files tracked-but-unlisted (drift inward) and
//      listed-but-untracked (drift outward — stale references).
//
// Warn-only: passes at ≥90% coverage match. <90% fails with a specific
// drift report.

function checkRunbookDrift(rootDir) {
  const { runGit } = require('./lib/shell-safe');
  const THRESHOLD = 0.90;

  const runbookDir = path.join(rootDir, 'docs', 'runbooks');
  if (!fs.existsSync(runbookDir)) {
    return { passed: true, detail: 'no docs/runbooks/ dir — nothing to check' };
  }

  const runbooks = fs.readdirSync(runbookDir)
    .filter((f) => f.endsWith('-rollback.md'))
    .map((f) => path.join(runbookDir, f));
  if (runbooks.length === 0) {
    return { passed: true, detail: 'no *-rollback.md files — nothing to check' };
  }

  const reports = [];
  let worst = 1.0;

  for (const rb of runbooks) {
    const text = fs.readFileSync(rb, 'utf8');
    const claimed = extractRunbookPaths(text);
    const coveredDirs = extractCoveredDirs(text);

    // Tracked files under each covered dir, from git ls-files
    const tracked = new Set();
    for (const d of coveredDirs) {
      try {
        const r = runGit(['ls-files', d], { cwd: rootDir });
        if (!r.ok) continue;
        for (const line of String(r.stdout).split('\n').filter(Boolean)) {
          // Normalize to forward-slash relative paths
          tracked.add(line.trim().replace(/\\/g, '/'));
        }
      } catch { /* dir may not exist; skip */ }
    }

    const claimedNorm = new Set(Array.from(claimed).map((p) => p.replace(/\\/g, '/')));
    const missingFromRunbook = [];
    for (const f of tracked) if (!claimedNorm.has(f)) missingFromRunbook.push(f);
    const staleInRunbook = [];
    for (const c of claimedNorm) {
      if (!tracked.has(c) && coveredDirs.some((d) => c.startsWith(d.replace(/\\/g, '/') + '/'))) {
        staleInRunbook.push(c);
      }
    }

    const totalTracked = tracked.size;
    const coverageRatio = totalTracked === 0 ? 1 : (totalTracked - missingFromRunbook.length) / totalTracked;
    if (coverageRatio < worst) worst = coverageRatio;

    reports.push({
      runbook: path.basename(rb),
      covered_dirs: coveredDirs,
      total_tracked: totalTracked,
      claimed: claimedNorm.size,
      missing_from_runbook: missingFromRunbook,
      stale_in_runbook: staleInRunbook,
      coverage: coverageRatio,
    });
  }

  const passed = worst >= THRESHOLD;
  const summary = reports.map((r) => {
    const miss = r.missing_from_runbook.length;
    const stale = r.stale_in_runbook.length;
    return `${r.runbook}: ${(r.coverage * 100).toFixed(0)}% covered (${r.total_tracked} tracked, ${miss} missing, ${stale} stale)`;
  }).join('; ');

  if (passed) return { passed: true, detail: summary };

  // Failure detail enumerates the worst offender(s)
  const offender = reports.reduce((a, b) => (a.coverage <= b.coverage ? a : b));
  const miss = offender.missing_from_runbook.slice(0, 5).join(', ');
  const stale = offender.stale_in_runbook.slice(0, 5).join(', ');
  return {
    passed: false,
    detail: `${summary}. Worst: ${offender.runbook} missing-from-runbook [${miss}${offender.missing_from_runbook.length > 5 ? `, +${offender.missing_from_runbook.length - 5} more` : ''}]; stale [${stale}${offender.stale_in_runbook.length > 5 ? `, +${offender.stale_in_runbook.length - 5} more` : ''}]`,
  };
}

function extractRunbookPaths(text) {
  const paths = new Set();
  const lines = text.split('\n');
  // Path-looking fragments: allow letters, digits, dashes, underscores,
  // dots, slashes. Must contain at least one slash so we don't pick up
  // bare identifiers or sentence tokens.
  const pathFrag = /(?:[a-zA-Z0-9_.-]+\/)+[a-zA-Z0-9_.-]+/g;
  for (const line of lines) {
    let m;
    while ((m = pathFrag.exec(line)) !== null) {
      const s = m[0];
      // Filter obvious non-path matches (URLs, section slugs).
      if (/^https?:/i.test(s)) continue;
      if (/^[0-9a-f]{40,}/.test(s)) continue; // git SHAs with slashes (unlikely but guard)
      paths.add(s);
    }
  }
  return paths;
}

// Only dirs EXPLICITLY scoped via `git rm -r <dir>`, `rm -rf <dir>`, or a
// trailing-slash mention count. Individual file mentions are not sufficient
// to declare a whole directory "covered" — that would treat every line of a
// narrative runbook as a wholesale scope claim.
function extractCoveredDirs(text) {
  const dirs = new Set();
  const dirFrag = /((?:[a-zA-Z0-9_.-]+\/)+)/g;
  // Pattern 1: `git rm -r <dir>` / `git rm -rf <dir>`
  const gitRmRe = /git\s+rm\s+-r\w*\s+((?:[a-zA-Z0-9_.-]+\/)+)/g;
  let m;
  while ((m = gitRmRe.exec(text)) !== null) dirs.add(m[1].replace(/\/$/, ''));
  // Pattern 2: `rm -rf <dir>`
  const rmRfRe = /\brm\s+-rf\s+((?:[a-zA-Z0-9_.-]+\/)+)/g;
  while ((m = rmRfRe.exec(text)) !== null) dirs.add(m[1].replace(/\/$/, ''));
  // Pattern 3: bullet list items naming a dir with trailing slash, e.g.
  // `- .claude/workstream/events/` or in a code-span `kit/scripts/core/`.
  const trailSlashRe = /(?:[`"'\s])((?:[a-zA-Z0-9_.-]+\/)+)(?=[`"'\s,)])/g;
  while ((m = trailSlashRe.exec(text)) !== null) dirs.add(m[1].replace(/\/$/, ''));

  // De-dupe by longest-prefix
  const sorted = Array.from(dirs).sort((a, b) => a.length - b.length);
  const minimal = [];
  for (const d of sorted) {
    if (!minimal.some((m) => d === m || d.startsWith(m + '/'))) minimal.push(d);
  }
  // Constrain to dirs managed by CWOS
  const allowed = ['kit/', 'sim/', 'docs/', '.claude/', 'system/', 'personas/', 'engines/', 'fleet/'];
  return minimal.filter((d) => allowed.some((a) => d.startsWith(a) || (d + '/').startsWith(a)));
}

// ─── INV-030: Snapshot-diff smoke test ──────────────────────────────────────
//
// Replaces the ADR-018 §Consequences 48-hour dogfooding protocol (WS-186).
// Rather than run HomeBase for 48 hours on parallel branches and diff
// mutations, we synthesize a controlled mutation, invoke the shadow-event
// path, and verify snapshot-diff reconciles it.
//
// The check runs in two stages:
//   1. Pure-function self-test: construct before/after snapshots + events
//      in memory, verify snapshot-diff correctly classifies them.
//   2. Presence check: confirm kit/scripts/core/snapshot-diff.js exists
//      and loads without error.
//
// This is deliberately lightweight — the full suite in
// kit/scripts/__tests__/snapshot-diff.test.js covers end-to-end behavior.
// INV-030 here is a "can the verifier run at all" smoke signal that fires
// during every verify invocation.

function checkSnapshotDiffSmoke(rootDir) {
  const snapshotDiffPath = path.join(rootDir, 'kit', 'scripts', 'core', 'snapshot-diff.js');
  if (!fs.existsSync(snapshotDiffPath)) {
    return { passed: false, detail: 'kit/scripts/core/snapshot-diff.js missing — WS-186 deliverable absent' };
  }
  let sd;
  try { sd = require(snapshotDiffPath); }
  catch (err) { return { passed: false, detail: `snapshot-diff.js failed to load: ${err.message}` }; }
  if (typeof sd.verify !== 'function' || typeof sd.snapshotState !== 'function') {
    return { passed: false, detail: 'snapshot-diff.js loaded but missing verify/snapshotState export' };
  }

  // In-memory smoke test: one instrumented mutation, one uninstrumented.
  const before = { 'tracked.yaml': '1'.repeat(64), 'hidden.yaml': 'a'.repeat(64) };
  const after = { 'tracked.yaml': '2'.repeat(64), 'hidden.yaml': 'b'.repeat(64) };
  const events = [{ payload: { path: 'tracked.yaml' } }];
  const r = sd.verify({ beforeSnap: before, afterSnap: after, events });
  if (r.ok) return { passed: false, detail: 'smoke expected missing=1 (hidden.yaml) but snapshot-diff reported ok' };
  if (!r.missing.includes('hidden.yaml')) {
    return { passed: false, detail: `smoke failed: expected missing=[hidden.yaml], got ${JSON.stringify(r.missing)}` };
  }
  if (!r.reconciled.includes('tracked.yaml')) {
    return { passed: false, detail: `smoke failed: expected reconciled=[tracked.yaml], got ${JSON.stringify(r.reconciled)}` };
  }

  return {
    passed: true,
    detail: 'snapshot-diff loads and classifies a synthetic 1-tracked / 1-hidden scenario correctly. Full replay-corpus integration lives in kit/scripts/__tests__/snapshot-diff.test.js.',
  };
}

// ─── INV-031: replay-purity hard invariant (ADR-020) ────────────────────────
//
// Runs `cwos-replay check` programmatically. Passes IFF
// state/*.json equals what a fresh replay from events produces.
// Hard fail, not warn-only — ADR-020 locked this.
//
// When state/*.json doesn't exist yet (pre-step-2 repos, or a fresh
// clone that hasn't run any commands), the "clean slate" is itself
// a valid state (no events have materialized anything). INV-031
// treats an absent state dir + empty event log as a trivial pass.

function checkReplayPurity(rootDir) {
  const replayPath = path.join(rootDir, 'kit', 'scripts', 'core', 'cwos-replay.js');
  if (!fs.existsSync(replayPath)) {
    return { passed: true, detail: 'cwos-replay.js not present — replay-purity N/A (pre-step-2)' };
  }
  let replay;
  try { replay = require(replayPath); }
  catch (err) { return { passed: false, detail: `cwos-replay failed to load: ${err.message}` }; }

  const wsDir = path.join(rootDir, '.claude', 'workstream');
  if (!fs.existsSync(wsDir)) {
    return { passed: true, detail: 'no workstream dir — replay-purity N/A' };
  }

  // ABSENCE IS NOT DRIFT (WS-1092). A fresh clone has no state/*.json at all — .gitignore
  // excludes it by design (ADR-058) — and replay.check reports that as "in expected but not
  // actual", which read as corruption for months. Name the condition and its one-line fix.
  // The empty-log trivial pass above this comment's era still holds: no events, nothing to
  // materialize, nothing absent.
  let stateCacheMissing = null;
  try { ({ stateCacheMissing } = require(path.join(rootDir, 'kit', 'scripts', 'cwos-reconcile.js'))); }
  catch { /* pre-ADR-058 kit — fall through to the replay check */ }
  if (typeof stateCacheMissing === 'function' && stateCacheMissing(wsDir)) {
    const eventsDir = path.join(wsDir, 'events');
    let hasEvents = false;
    try {
      hasEvents = fs.existsSync(eventsDir) && fs.readdirSync(eventsDir)
        .some((f) => f.endsWith('.jsonl') && fs.statSync(path.join(eventsDir, f)).size > 0);
    } catch { hasEvents = false; }
    if (hasEvents) {
      return {
        passed: false,
        detail: 'STATE CACHE ABSENT (not drift): one or more of state/{queue,findings,sprints,programs}.json is missing or empty on this checkout. Run `node kit/scripts/core/cwos-replay.js rebuild`, or start a session — the state-cache-refresh SessionStart hook does exactly that.',
      };
    }
  }

  let r;
  try { r = replay.check({ workstreamDir: wsDir }); }
  catch (err) { return { passed: false, detail: `cwos-replay check threw: ${err.message}` }; }

  if (r.ok) {
    return {
      passed: true,
      detail: `clean — ${r.event_count} events replayed; all domains match.`,
    };
  }
  return {
    passed: false,
    detail: `DRIFT: ${r.drift_summary || 'state differs from event-log replay'}. Run \`node kit/scripts/core/cwos-replay.js rebuild\` to restore.`,
  };
}

// ─── INV-061: State-domain rebuild contract (ADR-058 / WS-504) ────────────
//
// state/*.json is an untracked per-node cache (ADR-058). Three assertions:
//   1. Every domain the state store materializes has a declared rebuild
//      source below — a new domain added without one fails here instead of
//      silently reopening the multi-node conflict class FIND-331 described.
//   2. No state-store domain JSON is git-tracked (findings-feedback-manifest
//      is not a domain and stays tracked).
//   3. If a settings file wires a cwos-reconcile SessionStart hook, it must
//      carry --refresh-state — otherwise the rebuild path is inert on fresh
//      clones (the exact half-shipped outage run-026's failure analysis named).

const STATE_DOMAIN_REBUILD_SOURCES = {
  queue: 'yaml-rebuild',      // queue/WS-*.yaml via reconcile reducer refresh
  findings: 'yaml-rebuild',   // findings/FIND-*.yaml
  sprints: 'yaml-rebuild',    // sprints/SPR-*.yaml
  programs: 'yaml-rebuild',   // programs/prog-*.yaml + registry
  engines: 'artifact-backfill', // runs/run-NNN artifacts via Phase 2n sweep
  envelope: 'per-node',       // command telemetry — machine-local by design
  config: 'per-node',         // permanently empty (no reducer)
  sessions: 'per-node',       // permanently empty (no reducer)
};

function checkStateDomainRebuildContract(rootDir) {
  let domains;
  try {
    ({ DEFAULT_DOMAINS: domains } = require(path.join(rootDir, 'kit', 'scripts', 'core', 'state-store.js')));
  } catch {
    return { passed: true, detail: 'core/state-store.js not present — N/A (pre-step-2)' };
  }
  if (!Array.isArray(domains)) {
    return { passed: false, detail: 'state-store exports no DEFAULT_DOMAINS — cannot verify rebuild contract' };
  }
  const unclassified = domains.filter((d) => !STATE_DOMAIN_REBUILD_SOURCES[d]);
  if (unclassified.length > 0) {
    return {
      passed: false,
      detail: `domain(s) without a declared rebuild source (ADR-058): ${unclassified.join(', ')} — classify as yaml-rebuild / artifact-backfill / per-node in STATE_DOMAIN_REBUILD_SOURCES (cwos-verify.js) and implement the rebuild path`,
    };
  }
  const { spawnSync } = require('child_process');
  try {
    const r = spawnSync('git', ['ls-files', '.claude/workstream/state'], { cwd: rootDir, encoding: 'utf8', timeout: 5000 });
    if (r.status === 0) {
      const tracked = r.stdout.split('\n').map((s) => s.trim()).filter(Boolean)
        .filter((f) => f.endsWith('.json') && !f.endsWith('findings-feedback-manifest.json'));
      if (tracked.length > 0) {
        return { passed: false, detail: `git-tracked state domain JSON (ADR-058 forbids): ${tracked.join(', ')} — git rm --cached + gitignore` };
      }
    }
  } catch { /* git unavailable — skip tracked-file assertion */ }
  const wiring = sessionStartRefreshWiring(rootDir);
  if (wiring.problems.length > 0) {
    return { passed: false, detail: `${wiring.problems[0]} — fresh clones never rebuild the state cache (ADR-058)` };
  }
  if (wiring.settingsSeen === 0) {
    return { passed: true, detail: `${domains.length} domains classified; no tracked domain JSON; no settings file — nothing wires SessionStart here (adopt-install should ship the state-cache-refresh hook).` };
  }
  if (wiring.found.length === 0) {
    return {
      passed: false,
      detail: 'no SessionStart hook rebuilds the state cache (ADR-058): fresh clones never get state/*.json and INV-031 reads absence as drift. Wire `node .claude/hooks/state-cache-refresh.cjs` (cwos-replay rebuild) under hooks.SessionStart in .claude/settings.json',
    };
  }
  return { passed: true, detail: `${domains.length} domains classified; no tracked domain JSON; SessionStart cache rebuild wired by: ${wiring.found[0]}` };
}

// INV-061 assertion 3, parsed rather than grepped (WS-1092). The old check was a substring
// test over the whole settings file — `includes('cwos-reconcile.js') && includes('SessionStart')
// && includes('--check-drift') && !includes('--refresh-state')` — which is satisfied by a file
// that wires NO reconcile hook at all. That is how poker-tracker passed INV-061 for months
// while every fresh clone started without a cache. A hook satisfies the contract if its
// command rebuilds the cache — `cwos-reconcile.js --refresh-state` (ADR-058) or
// `core/cwos-replay.js rebuild` (ADR-020; measured 2026-09-18 as the one that is both fast
// and replay-pure) — either inline, or as `node <script>` whose source carries one of them
// (the repo-local hook shape, which survives /kit-upgrade).
function sessionStartRefreshWiring(rootDir) {
  const found = [];
  const problems = [];
  let settingsSeen = 0;
  for (const settingsRel of ['.claude/settings.json', '.claude/settings.local.json']) {
    const p = path.join(rootDir, settingsRel);
    if (!fs.existsSync(p)) continue;
    settingsSeen += 1;
    let json;
    try { json = JSON.parse(fs.readFileSync(p, 'utf8')); }
    catch (err) { problems.push(`${settingsRel} is not valid JSON (${err.message})`); continue; }
    const groups = (json && json.hooks && Array.isArray(json.hooks.SessionStart)) ? json.hooks.SessionStart : [];
    for (const g of groups) {
      for (const h of (g && Array.isArray(g.hooks)) ? g.hooks : []) {
        const cmd = String((h && h.command) || '').trim();
        if (!cmd) continue;
        if (cmd.includes('cwos-reconcile.js') && cmd.includes('--check-drift') && !cmd.includes('--refresh-state')) {
          problems.push(`${settingsRel} wires \`${cmd}\` without --refresh-state`);
          continue;
        }
        if (rebuildsCache(cmd)) { found.push(cmd); continue; }
        const m = cmd.match(/^node\s+"?([^\s"]+)"?/);
        if (!m) continue;
        try {
          if (rebuildsCache(fs.readFileSync(path.join(rootDir, m[1]), 'utf8'))) found.push(cmd);
        } catch { /* script missing — not a wiring */ }
      }
    }
  }
  return { found, problems, settingsSeen };
}
function rebuildsCache(text) {
  // Inline command or script source: the ADR-058 flag, or the replay module plus its
  // `rebuild` verb. Token-level on purpose — the hook keeps the module path in a constant
  // and the verb in the argv array, so a phrase-level regex only matched its own comment.
  return text.includes('--refresh-state') || (text.includes('cwos-replay') && /\brebuild\b/.test(text));
}

// ─── INV-044: Per-field replay-purity (WS-261 / AS-037-11) ───────────────
//
// Complements INV-031 (whole-state replay-purity) with per-field
// granularity. Catches non-replay-pure derivations that happen to match
// disk state today but use Date.now() / random / unstable iteration
// order — INV-031 misses these because the disk state was written by
// the same impure reducer, so disk + replay both have the same wrong
// value at any given moment.
//
// Step-2 absent (no core/replay-test.js) = trivial pass; pre-step-2
// repos have no cached fields to check.

function checkReplayPureFields(rootDir) {
  const harnessPath = path.join(rootDir, 'kit', 'scripts', 'core', 'replay-test.js');
  if (!fs.existsSync(harnessPath)) {
    return { passed: true, detail: 'replay-test.js not present — per-field check N/A (pre-WS-261)' };
  }
  let harness;
  try { harness = require(harnessPath); }
  catch (err) { return { passed: false, detail: `replay-test failed to load: ${err.message}` }; }

  const wsDir = path.join(rootDir, '.claude', 'workstream');
  if (!fs.existsSync(wsDir)) {
    return { passed: true, detail: 'no workstream dir — per-field check N/A' };
  }

  let r;
  try { r = harness.replayPurityCheck(wsDir); }
  catch (err) { return { passed: false, detail: `replayPurityCheck threw: ${err.message}` }; }

  if (r.ok) {
    return {
      passed: true,
      detail: `clean — ${r.event_count} events replayed; ${r.fields_checked} fields checked; 0 violations.`,
    };
  }
  const sample = r.violations.slice(0, 3).map((v) =>
    `${v.domain}.${v.item_id}.${v.field} (${v.kind})`
  ).join(', ');
  return {
    passed: false,
    detail: `${r.violations.length} replay-purity violation(s). Sample: ${sample}. Run \`node kit/scripts/cwos-replay-test.js check\` for full list.`,
  };
}

// ─── INV-032: Typed-API coverage (ADR-020 WS-199) ────────────────────────
//
// Scans kit/scripts/cwos-*.js for raw-index reads that now have a
// typed-API equivalent. Reports per-script + overall coverage. Warn-
// only at SPR-062 ship — tightens as commands migrate (each typed-API
// migration WS updates the expected coverage floor).
//
// Raw-index patterns = string matches of the file paths the reducers
// have superseded. Typed-API patterns = evidence the script imports
// state-store. A script that does BOTH is "partial" (migrating). A
// script that only does raw-index is "legacy". Only state-store = "migrated".
// A script that does NEITHER is "read-free" (excluded from denominator).

function checkTypedApiCoverage(rootDir) {
  const scriptDir = path.join(rootDir, 'kit', 'scripts');
  if (!fs.existsSync(scriptDir)) {
    return { passed: true, detail: 'no kit/scripts/ — N/A' };
  }
  const excluded = ['lib', 'core', '__tests__', 'git-hooks'];
  const scripts = fs.readdirSync(scriptDir)
    .filter((f) => f.endsWith('.js') && !excluded.includes(path.basename(f, '.js')) && !f.endsWith('.test.js'));

  // WS-209 (SPR-065): raw-READ patterns specifically. A script that
  // only WRITES to these index files (e.g., cwos-migrate's
  // writeFileAtomic backward-compat path, cwos-reconcile's rebuild)
  // isn't a "legacy reader" — it's maintaining the fallback for
  // pre-step-2 consumers. Only readYAMLFile / fs.readFileSync /
  // fs.readFile references count as raw reads.
  const RAW_INDEX_NAMES = /(queue-index\.yaml|findings-index\.yaml|sprint-index\.yaml|programs\/registry\.yaml)/;
  const READ_VERBS = /(readYAMLFile|fs\.readFile|fs\.readFileSync|require)/;

  function hasRawRead(text) {
    // Walk each line: raw read if the line has both a READ verb AND
    // an index-file reference.
    const lines = text.split('\n');
    for (const line of lines) {
      if (READ_VERBS.test(line) && RAW_INDEX_NAMES.test(line)) return true;
    }
    return false;
  }

  const TYPED_API_PATTERN = /require\(['"][./]*\/?core\/state-store['"]\)/;

  const stats = { legacy: [], partial: [], migrated: [], read_free: [] };
  for (const f of scripts) {
    const text = fs.readFileSync(path.join(scriptDir, f), 'utf8');
    const hasRaw = hasRawRead(text);
    const hasTyped = TYPED_API_PATTERN.test(text);
    if (!hasRaw && !hasTyped) stats.read_free.push(f);
    else if (hasRaw && hasTyped) stats.partial.push(f);
    else if (hasTyped) stats.migrated.push(f);
    else stats.legacy.push(f);
  }

  const reading = stats.legacy.length + stats.partial.length + stats.migrated.length;
  const migrated = stats.migrated.length + (stats.partial.length * 0.5);  // partial counts half
  const coverage = reading === 0 ? 1 : migrated / reading;

  // Warn-only phase: always pass, report coverage as detail. Later
  // sprints will flip this to enforcing a floor (e.g., ≥50% by SPR-064).
  return {
    passed: true,
    detail: `coverage ${(coverage * 100).toFixed(0)}% — migrated ${stats.migrated.length}, partial ${stats.partial.length}, legacy ${stats.legacy.length}, read-free ${stats.read_free.length}. Legacy (next migration targets): ${stats.legacy.slice(0, 5).join(', ')}${stats.legacy.length > 5 ? `, +${stats.legacy.length - 5} more` : ''}.`,
  };
}

// ─── INV-033: Founder-surface schema-jargon lint (WS-150) ──────────────────

// Scans the 4 commands that dominate the first-session founder surface
// (/welcome, /status, /session-start, /onboard-check) for schema-jargon
// placeholders inside output fences. FIND-077 specifically flagged tokens
// like <M-state>, <one-clause ...>, <bullet list ...>, <adoption arc ...>,
// <envelope ...> that were meant to be substituted but sometimes leak
// verbatim into founder output — reading like a YAML schema instead of
// plain English.
//
// This lint flags ONLY those specific jargon patterns (not generic
// substitution placeholders like <N>, <title>, <WS-NNN> that BoW output
// shapes legitimately use). Inline backticked examples are excluded.
function checkFounderSurfacePlaceholders(rootDir) {
  const FOUNDER_SURFACE_FILES = [
    'kit/commands/welcome.md',
    'kit/commands/status.md',
    'kit/commands/session-start.md',
    'kit/commands/onboard-check.md',
  ];
  const JARGON_PATTERNS = [
    /<M-state[^>]*>/i,
    /<one-clause[^>]*>/i,
    /<bullet list[^>]*>/i,
    /<component summary[^>]*>/i,
    /<list names[^>]*>/i,
    /<adoption arc[^>]*>/i,
    /<envelope[^>]*>/i,
    /<schema[- ][^>]*>/i,
  ];

  const violations = [];
  for (const rel of FOUNDER_SURFACE_FILES) {
    const abs = path.join(rootDir, rel);
    if (!fs.existsSync(abs)) continue;
    const text = fs.readFileSync(abs, 'utf8');
    const lines = text.split('\n');
    let inFence = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
      if (!inFence) continue;
      const stripped = line.replace(/`[^`]*`/g, '');
      for (const re of JARGON_PATTERNS) {
        const m = stripped.match(re);
        if (m) violations.push(`${rel}:${i + 1}: ${m[0]}`);
      }
    }
  }

  if (violations.length === 0) {
    return { passed: true, detail: `All 4 founder-surface commands are clean of schema-jargon placeholders inside output fences.` };
  }
  return {
    passed: false,
    detail: `${violations.length} schema-jargon placeholder(s) in founder output: ${violations.slice(0, 4).join(' | ')}${violations.length > 4 ? ` (+${violations.length - 4} more)` : ''}`,
  };
}

// ─── INV-034: Uncustomized program contracts (WS-152) ──────────────────────

// A program's `contract:` field is the plain-language promise it makes to
// the founder. When an adopted repo ships with a template program, the
// field contains [CUSTOMIZE: ...] placeholder text — reading it as if it
// were a trusted contract is the "placeholder-as-contract" failure mode
// WS-152 closes.
//
// Severity ladder (per founder decision on WS-152):
//   - WARN by default (check passes but surfaces the list) so fresh
//     adopted repos aren't blocked on day one.
//   - FAIL once the founder has declined customization 3+ times via the
//     /pulse re-prompt (tracked as `customization_declined_count` in
//     .cwos-onboarding.yaml). Declining three times is an explicit signal
//     that the founder has seen the nag and is ignoring it; that's when
//     cwos-verify starts breaking.
//
// Scope: product programs only. System programs (`monitor_only: true`)
// are excluded because their contracts speak to the operator, not the
// founder, and ship customized by design.
function checkUncustomizedContracts(rootDir) {
  const workstreamDir = findWorkstreamDir(rootDir);
  const programsDir = path.join(workstreamDir, 'programs');
  if (!fs.existsSync(programsDir)) {
    return { passed: true, detail: 'No programs directory — nothing to check.' };
  }

  const programFiles = globFiles(programsDir, 'prog-*.yaml')
    .filter(f => !path.basename(f).includes('template'));

  const uncustomized = [];
  for (const file of programFiles) {
    const parsed = readYAMLFile(file);
    if (!parsed) continue;
    if (parsed.monitor_only === true) continue;
    const contract = parsed.contract;
    if (typeof contract !== 'string') continue;
    if (contract.includes('[CUSTOMIZE:')) {
      uncustomized.push(parsed.id || path.basename(file, '.yaml'));
    }
  }

  if (uncustomized.length === 0) {
    return { passed: true, detail: `All ${programFiles.length} product program contracts are customized.` };
  }

  // Read decline count from onboarding.yaml (best-effort — absent == 0)
  const onboardingPath = path.join(rootDir, '.cwos-onboarding.yaml');
  let declineCount = 0;
  if (fs.existsSync(onboardingPath)) {
    const onboarding = readYAMLFile(onboardingPath);
    if (onboarding && typeof onboarding.customization_declined_count === 'number') {
      declineCount = onboarding.customization_declined_count;
    }
  }

  const listLabel = uncustomized.slice(0, 5).join(', ') + (uncustomized.length > 5 ? ` (+${uncustomized.length - 5} more)` : '');

  // FAIL once declined 3+ times, else WARN-as-pass.
  if (declineCount >= 3) {
    return {
      passed: false,
      detail: `${uncustomized.length} program(s) still have placeholder contracts after ${declineCount} decline(s): ${listLabel}. Customize via /pulse or /onboard-check.`,
    };
  }

  // WARN-as-pass: surface the list in the detail line without failing.
  return {
    passed: true,
    detail: `WARN: ${uncustomized.length} program(s) with placeholder contracts (${listLabel}). Decline count ${declineCount}/3 — escalates to FAIL at 3.`,
  };
}

// INV-039: No adopted fleet repo may have kit_version drift > 1 minor version
// behind HEAD's kit/VERSION without an open migration WS item. Every additional
// minor version of drift compounds: stacked schema bumps, command renames, and
// preamble changes all turn into customization-unknown rows in /fleet-update,
// past the founder's reviewable budget. The escape hatch — `cwos-migrate.js` —
// must be invoked before /fleet-update to keep state migration in its own
// reversible step. This invariant catches drift before /fleet-update is run,
// so the founder sees the migration backlog item instead of discovering the
// stale state during a 247-file diff review.
//
// Escape: a backlog or in_progress WS item with `category: fleet` and
// `migrating_repo: <name>` clears the violation for that repo (the migration
// is acknowledged, just not yet shipped).
//
// Source: FAIL-012 / premortem-2026-04-25 / WS-225.
function checkFleetVersionDrift(rootDir) {
  const registryPath = path.join(rootDir, 'fleet/registry.yaml');
  const versionPath = path.join(rootDir, 'kit/VERSION');
  if (!fs.existsSync(registryPath)) return { passed: true, detail: 'fleet/registry.yaml not found — no fleet to check' };
  if (!fs.existsSync(versionPath)) return { passed: false, detail: 'kit/VERSION not found' };

  const { ok, data } = cachedReadYAMLFile(registryPath);
  if (!ok) return { passed: false, detail: 'fleet/registry.yaml could not be parsed' };

  const headVersionRaw = fs.readFileSync(versionPath, 'utf8').trim();
  // WS-547: parsing goes through lib/kit-version.js so every version comparison
  // in kit/scripts/ shares one definition of what a version is.
  const headParsed = parseSemver(headVersionRaw);
  if (!headParsed) {
    return { passed: false, detail: `kit/VERSION (${headVersionRaw}) does not parse as semver` };
  }
  const headMajor = headParsed.major;
  const headMinor = headParsed.minor;

  // Allowed drift: 1 minor by default. Future: read from a config file.
  const MAX_DRIFT_MINOR = 1;

  // Collect open migration WS items as escape-hatch evidence. A WS item with
  // `category: fleet` whose body or front-matter mentions the repo name (in a
  // `migrating_repo:` field or in description text referencing "migrate" + the
  // repo) clears the violation for that repo. Keep the match permissive — the
  // goal is "founder has acknowledged the drift," not strict schema.
  const queueDir = path.join(rootDir, '.claude/workstream/queue');
  const openMigrationsByRepo = new Set();
  if (fs.existsSync(queueDir)) {
    const wsFiles = fs.readdirSync(queueDir).filter(f => /^WS-.*\.yaml$/.test(f));
    for (const f of wsFiles) {
      const raw = fs.readFileSync(path.join(queueDir, f), 'utf8');
      // Status filter — only open items count
      const statusMatch = raw.match(/^\s*status:\s*["']?(\w+)["']?/m);
      const status = statusMatch ? statusMatch[1] : null;
      if (status !== 'backlog' && status !== 'in_progress') continue;
      // Category filter
      if (!/^\s*category:\s*["']?fleet["']?/m.test(raw)) continue;
      // migrating_repo: explicit field
      const explicit = raw.match(/^\s*migrating_repo:\s*["']?([^"'\s]+)["']?/m);
      if (explicit) openMigrationsByRepo.add(explicit[1]);
      // Soft match in description: "migrate <repo>" mentioned
      const descMatches = raw.match(/migrat\w+\s+([A-Z][\w-]+)/g);
      if (descMatches) for (const m of descMatches) {
        const name = m.match(/migrat\w+\s+([A-Z][\w-]+)/)[1];
        openMigrationsByRepo.add(name);
      }
    }
  }

  const repos = Array.isArray(data.repos) ? data.repos : [];
  const violations = [];
  const warnings = [];
  let checkedCount = 0;

  for (const repo of repos) {
    if (repo.type === 'simulated') continue;       // sim repos don't track kit_version
    if (repo.skip_path_check === true) continue;   // reserved/un-cloned
    if (!repo.adopted_at) continue;                // unadopted — no drift to measure
    checkedCount++;

    // WS-560: read the repo's REAL stamp, not the registry's `kit_version`
    // cache. That cache is deprecated — INV-065 exists precisely because it
    // lies (see checkVersionStampsResolvable's header: physical-therapy-by-ai
    // "resolved three releases ahead of reality"). On 2026-08-02 it was still
    // lying in the other direction: it reported Claude-Poker-Tracker at 3.5.0
    // and Physical-Therapy-by-AI at 3.3 when both had been on 3.8.5 for days.
    // Three of this invariant's four "violations" were cache staleness, which
    // is worse than a wrong number — it points a fleet-wide upgrade at repos
    // that do not need one, and hides the one that does.
    //
    // resolveRepoVersion is the shared resolver INV-065 uses. Deliberately not
    // a second precedence of my own: a fifth reader with its own rules is the
    // exact class WS-547 closed.
    let repoVersionRaw = null;
    let versionSource = 'stamp';
    const resolvedStamp = repo.path && fs.existsSync(path.join(repo.path, '.cwos-version'))
      ? resolveRepoVersion(repo.path)
      : null;
    if (resolvedStamp && resolvedStamp.version) {
      repoVersionRaw = String(resolvedStamp.version);
    } else if (repo.path && !fs.existsSync(repo.path)) {
      // Hosted on another node (ADR-057) — the stamp is unreadable from here,
      // so the cache is the only evidence available. Say which one we used.
      repoVersionRaw = typeof repo.kit_version === 'string' ? repo.kit_version : null;
      versionSource = 'registry-cache (repo not on this node)';
    }
    if (typeof repoVersionRaw !== 'string' || !repoVersionRaw.length) {
      warnings.push(`${repo.name || '?'}: no resolvable kit version (.cwos-version unreadable and no registry cache)`);
      continue;
    }
    const repoParsed = parseSemver(repoVersionRaw);
    if (!repoParsed) {
      warnings.push(`${repo.name || '?'}: kit_version (${repoVersionRaw}) does not parse as semver`);
      continue;
    }
    const repoMajor = repoParsed.major;
    const repoMinor = repoParsed.minor;

    // Major mismatch = unconditional violation (drift is conceptually infinite).
    if (repoMajor !== headMajor) {
      if (openMigrationsByRepo.has(repo.name)) continue;
      violations.push(`${repo.name}: ${repoVersionRaw} [${versionSource}] → HEAD ${headVersionRaw} (major mismatch — migration required)`);
      continue;
    }

    const drift = headMinor - repoMinor;
    if (drift > MAX_DRIFT_MINOR) {
      if (openMigrationsByRepo.has(repo.name)) continue;
      violations.push(`${repo.name}: ${repoVersionRaw} [${versionSource}] → HEAD ${headVersionRaw} (drift = ${drift} minor)`);
    }
  }

  if (violations.length > 0) {
    return {
      passed: false,
      detail: `${violations.length}/${checkedCount} adopted repo(s) over drift bound (max ${MAX_DRIFT_MINOR} minor): ${violations.slice(0, 3).join('; ')}${violations.length > 3 ? ` (+${violations.length - 3} more)` : ''}. Open a fleet WS item with migrating_repo:<name>, or run cwos-migrate.js + /fleet-update.`,
    };
  }
  if (warnings.length > 0) {
    return {
      passed: true,
      detail: `WARN: ${warnings.length}/${checkedCount} repo(s) with version-parse warnings: ${warnings.slice(0, 3).join('; ')}. ${checkedCount - warnings.length} repo(s) within bound.`,
    };
  }
  return { passed: true, detail: `${checkedCount} adopted repo(s) within ${MAX_DRIFT_MINOR}-minor drift bound of HEAD ${headVersionRaw}` };
}

// INV-065: every fleet repo's .cwos-version must resolve to a version, and that
// version must have a baseline the upgrade path can actually diff against.
//
// Distinct from INV-039 above, which measures how far each repo has DRIFTED and
// reads the deprecated `kit_version` cache in fleet/registry.yaml. This one
// reads each repo's real stamp and asks a prior question: can we tell what it
// has at all? Two live repos failed that on 2026-07-30 — physical-therapy-by-ai
// resolved three releases ahead of reality, and siteproof resolved to the string
// 'unknown' and asked git for the tag `kit-vunknown`. Both failures were silent,
// and both ended in an upgrade that stamped a new version and applied nothing.
//
// This is the standing guard against a fifth stamp shape, or a fifth reader with
// its own precedence, reintroducing the class. Repo-local reads only, so it
// survives the ADR-064 move of kit content into a plugin.
//
// Source: WS-547 / FIND-migrate-version-precedence-inverted / ADR-064 P1.
function checkVersionStampsResolvable(rootDir) {
  const registryPath = path.join(rootDir, 'fleet/registry.yaml');
  if (!fs.existsSync(registryPath)) return { passed: true, detail: 'fleet/registry.yaml not found — no fleet to check' };
  const { ok, data } = cachedReadYAMLFile(registryPath);
  if (!ok || !Array.isArray(data.repos)) return { passed: false, detail: 'fleet/registry.yaml could not be parsed' };

  const { runGitInRepo } = require('./lib/shell-safe');
  const unresolvable = [];   // stamp exists but yields no version
  const unbaselined = [];    // version resolves but has no baseline to diff against
  let checkedCount = 0;

  for (const repo of data.repos) {
    if (repo.type === 'simulated') continue;
    if (repo.skip_path_check === true) continue;
    if (!repo.path) continue;
    // Not-hosted repos live on another node (ADR-057) — absence is normal here.
    if (!fs.existsSync(path.join(repo.path, '.cwos-version'))) continue;
    checkedCount++;

    const resolved = resolveRepoVersion(repo.path);
    if (!resolved) { unresolvable.push(repo.name || repo.path); continue; }

    // A version with no release tag cannot be diffed. Guard A in cwos-migrate
    // refuses at run time; this surfaces it before someone tries.
    const tag = baselineTag(resolved.version);
    const r = runGitInRepo(rootDir, ['rev-parse', '--verify', `refs/tags/${tag}`], { timeout: 5000 });
    if (!r || !r.ok) unbaselined.push(`${repo.name || repo.path} (${resolved.version} → ${tag} missing)`);
  }

  if (unresolvable.length > 0) {
    return {
      passed: false,
      detail: `${unresolvable.length}/${checkedCount} repo(s) have a .cwos-version that resolves to no version: ${unresolvable.join(', ')}. ` +
        `An upgrade of these would misclassify every file and stamp a no-op. Fix the stamp, or pass --from <version> to cwos-migrate.js.`,
    };
  }
  if (unbaselined.length > 0) {
    return {
      passed: false,
      detail: `${unbaselined.length}/${checkedCount} repo(s) resolve to a version with no kit baseline: ${unbaselined.join('; ')}. ` +
        `cwos-migrate.js will refuse these (exit 3) until the release is tagged or --from names one that is.`,
    };
  }
  return { passed: true, detail: `${checkedCount} repo stamp(s) resolve to a version with a real kit baseline` };
}

// INV-072 (WS-592): a repo can carry hundreds of unmerged .kit-update
// sidecars and report clean on every version check — PTAI sat on 323 while
// scanning as "kit 3.8.5, zero drift". Delegates to cwos-sidecar-audit
// (hub-side); degrades to PASS where the script is absent (adopted repos
// don't ship it). Fails on ANY count: divergent residue is a pending founder
// decision, and pending decisions should be loud, not ambient.
function checkStrandedSidecars(rootDir) {
  const script = path.join(rootDir, 'kit', 'scripts', 'cwos-sidecar-audit.js');
  if (!fs.existsSync(script)) {
    return { passed: true, detail: 'cwos-sidecar-audit.js not present — N/A' };
  }
  let scanSidecars;
  try { ({ scanSidecars } = require(script)); }
  catch (e) { return { passed: true, detail: `cwos-sidecar-audit.js unloadable (${e.message}) — N/A` }; }

  const registryPath = path.join(rootDir, 'fleet/registry.yaml');
  if (!fs.existsSync(registryPath)) return { passed: true, detail: 'fleet/registry.yaml not found — no fleet to check' };
  const { ok, data } = cachedReadYAMLFile(registryPath);
  if (!ok || !Array.isArray(data.repos)) return { passed: false, detail: 'fleet/registry.yaml could not be parsed' };

  const carriers = [];
  let checkedCount = 0;
  for (const repo of data.repos) {
    if (repo.type === 'simulated') continue;
    if (repo.skip_path_check === true) continue;
    if (!repo.path) continue;
    // Not-hosted repos live on another node (ADR-057) — absence is normal here.
    if (!fs.existsSync(repo.path)) continue;
    checkedCount++;
    try {
      const scan = scanSidecars(repo.path);
      if (scan.ok && scan.total > 0) {
        carriers.push(`${repo.name || repo.path} (${scan.total})`);
      }
    } catch { /* one repo failing to scan must not mask the others */ }
  }

  if (carriers.length > 0) {
    return {
      passed: false,
      detail: `${carriers.length}/${checkedCount} repo(s) carry stranded .kit-update sidecars: ${carriers.join(', ')}. ` +
        `Each is a kit update nobody merged. Collapse: node kit/scripts/cwos-sidecar-audit.js --repo <path> --collapse (divergent ones are surfaced for the founder, never auto-resolved).`,
    };
  }
  return { passed: true, detail: `${checkedCount} hosted repo(s) carry no stranded .kit-update sidecars` };
}

// INV-038: Sprints approved on or after 2026-04-25 (WS-227 ship date) must
// record an `anti_goal_check:` field, and if their goal/items match an
// anti-goal or failed-state corpus phrase, the field must show status:
// passed | exempted | accepted_implicit. Sample-based: scans last 30
// approved sprint files. Grandfathers pre-2026-04-25 sprints (no field
// expected). Source: FAIL-010 / WS-227 / premortem-2026-04-25 §P2.
//
// Escape: founder explicitly chose option 4 (EXEMPTION) at /next Step 4a;
// the sprint YAML records reason + matches. Or option 1 with implicit
// accept (discouraged but legal — surfaces as accepted_implicit).
function checkAntiGoalCrossCheck(rootDir) {
  const sprintsDir = path.join(rootDir, '.claude/workstream/sprints');
  if (!fs.existsSync(sprintsDir)) return { passed: true, detail: 'sprints/ not found — nothing to check' };

  // Cutoff: WS-227 ship date. Sprints approved before this don't need the field.
  const CUTOFF_DATE = '2026-04-25';

  const sprintFiles = fs.readdirSync(sprintsDir)
    .filter(f => /^SPR-\d+\.yaml$/.test(f))
    .map(f => ({ name: f, path: path.join(sprintsDir, f) }))
    .sort((a, b) => b.name.localeCompare(a.name)) // most-recent (highest SPR number) first
    .slice(0, 30);

  if (sprintFiles.length === 0) return { passed: true, detail: 'No sprint files found' };

  // Load corpus once for goal/title scanning. Use the same anti_goals + failed_states
  // sections the /next Step 4a check relies on, with the same phrase-coverage logic.
  let corpus = null;
  try {
    const utils = require('./lib/cwos-utils');
    corpus = utils.loadCorpus(path.join(rootDir, 'kit/data/constitutional-detector-corpus.yaml'));
  } catch {
    return { passed: false, detail: 'Could not load constitutional-detector-corpus.yaml — INV-038 cannot run' };
  }
  const stop = corpus.stopwords;
  const COVERAGE_THRESHOLD = 0.70;

  function detectInGoal(text) {
    const inputTokens = new Set(String(text).toLowerCase().split(/\W+/).filter(t => t && !stop.includes(t)));
    for (const scope of ['anti_goals', 'failed_states']) {
      const block = corpus[scope];
      if (!block || !Array.isArray(block.canonical_phrases)) continue;
      const jaccardThreshold = block.similarity_threshold;
      for (const phrase of block.canonical_phrases) {
        const phraseTokens = new Set(phrase.toLowerCase().split(/\W+/).filter(t => t && !stop.includes(t)));
        if (phraseTokens.size === 0) continue;
        // Jaccard
        let inter = 0;
        for (const t of inputTokens) if (phraseTokens.has(t)) inter++;
        const union = inputTokens.size + phraseTokens.size - inter;
        const jaccard = union === 0 ? 0 : inter / union;
        // Phrase coverage
        const coverage = inter / phraseTokens.size;
        if (jaccard >= jaccardThreshold || coverage >= COVERAGE_THRESHOLD) {
          return { scope, phrase, jaccard, coverage };
        }
      }
    }
    return null;
  }

  const violations = [];
  let postCutoffCount = 0;
  let withFieldCount = 0;

  for (const f of sprintFiles) {
    const raw = fs.readFileSync(f.path, 'utf8');
    // Extract approved_at
    const apprMatch = raw.match(/^approved_at:\s*["']?(\d{4}-\d{2}-\d{2})/m);
    if (!apprMatch) continue;
    const approved = apprMatch[1];
    if (approved < CUTOFF_DATE) continue; // grandfathered
    postCutoffCount++;

    // Check for anti_goal_check field
    const hasField = /^anti_goal_check:/m.test(raw);
    if (hasField) withFieldCount++;

    // Determine if the sprint goal/items would have triggered a match
    const goalMatch = raw.match(/^goal:\s*>?\s*\n?([^]*?)(?=\n\w+:|$)/m);
    const goalText = goalMatch ? goalMatch[1].trim() : '';
    // Item titles
    const titleMatches = [...raw.matchAll(/^\s+- id:\s*["']?\w+[\s\S]*?title:\s*["']?(.+?)["']?\s*$/gm)];
    const titles = titleMatches.map(m => m[1]);
    const combined = [goalText, ...titles].join(' ');
    const detection = detectInGoal(combined);

    // Only flag if: corpus matched AND no field was recorded.
    // (If corpus matched AND field exists, the founder addressed it. Pass.)
    // (If corpus didn't match, no requirement — pass.)
    if (detection && !hasField) {
      violations.push(`${f.name}: matched ${detection.scope}/"${detection.phrase}" but has no anti_goal_check field`);
    }
  }

  if (violations.length > 0) {
    return {
      passed: false,
      detail: `${violations.length}/${postCutoffCount} post-${CUTOFF_DATE} sprint(s) matched anti-goal/failed-state corpus but record no anti_goal_check field: ${violations.slice(0, 3).join('; ')}`,
    };
  }
  return {
    passed: true,
    detail: `${postCutoffCount} post-${CUTOFF_DATE} sprint(s) checked; ${withFieldCount} record anti_goal_check field; 0 unaddressed corpus matches`,
  };
}

// INV-040: Every critical-tier program template under
// kit/templates/workstream/programs/prog-*.yaml must be instantiated in
// HomeBase's own .claude/workstream/programs/ AND listed in registry.yaml.
// This catches the "shipped a guardrail and forgot to apply it to ourselves"
// failure mode (FAIL-015) — prog-self-compliance shipped 2026-04-23 as a
// kit template but was never instantiated in HomeBase's registry, so /pulse
// never triggered sweep cadence on the constitution-watching program. The
// "system that polices the constitution is policed by no one" is now caught
// deterministically: if a critical-tier monitor program ships in the kit,
// HomeBase must instantiate it. Escape hatch: optional
// `skip_homebase_instantiation: true` field on the template, for templates
// that ship to adopted repos but don't apply to HomeBase itself.
//
// Source: FAIL-015 / WS-226 / premortem-2026-04-25 §C1.
function checkTemplateProgramInstantiation(rootDir) {
  const templateDir = path.join(rootDir, 'kit/templates/workstream/programs');
  if (!fs.existsSync(templateDir)) return { passed: true, detail: 'kit/templates/workstream/programs/ not found — nothing to check' };

  const homebaseProgramsDir = path.join(rootDir, '.claude/workstream/programs');
  const registryPath = path.join(homebaseProgramsDir, 'registry.yaml');
  if (!fs.existsSync(registryPath)) return { passed: false, detail: '.claude/workstream/programs/registry.yaml not found' };

  const { ok, data } = readYAMLFile(registryPath);
  if (!ok) return { passed: false, detail: '.claude/workstream/programs/registry.yaml could not be parsed' };

  const registeredIds = new Set(
    Array.isArray(data.programs) ? data.programs.filter(p => p && p.id).map(p => p.id) : []
  );

  const templateFiles = fs.readdirSync(templateDir)
    .filter(f => /^prog-[\w-]+\.yaml$/.test(f) && f !== 'prog-template.yaml');

  const violations = [];
  let checkedCount = 0;

  for (const templateFile of templateFiles) {
    const templatePath = path.join(templateDir, templateFile);
    const raw = fs.readFileSync(templatePath, 'utf8');
    // Tier-critical filter (narrow scope per WS-226 plan)
    if (!/^\s*tier:\s*["']?critical["']?/m.test(raw)) continue;
    // Escape hatch
    if (/^\s*skip_homebase_instantiation:\s*true/m.test(raw)) continue;

    // Extract program id from filename (prog-<id>.yaml)
    const idMatch = templateFile.match(/^prog-([\w-]+)\.yaml$/);
    if (!idMatch) continue;
    const programId = idMatch[1];
    checkedCount++;

    // Check 1: HomeBase has a corresponding instantiated program file
    const instantiatedPath = path.join(homebaseProgramsDir, templateFile);
    if (!fs.existsSync(instantiatedPath)) {
      violations.push(`${programId}: template ${templateFile} exists but .claude/workstream/programs/${templateFile} does not`);
      continue;
    }

    // Check 2: registry.yaml has an entry for this program with tier: critical
    if (!registeredIds.has(programId)) {
      violations.push(`${programId}: instantiated program file exists but registry.yaml has no entry`);
    }
  }

  if (violations.length > 0) {
    return {
      passed: false,
      detail: `${violations.length}/${checkedCount} critical-tier template(s) not instantiated in HomeBase: ${violations.slice(0, 3).join('; ')}${violations.length > 3 ? ` (+${violations.length - 3} more)` : ''}. Copy the template to .claude/workstream/programs/ + add entry to registry.yaml + run /pulse run <id> baseline.`,
    };
  }
  return {
    passed: true,
    detail: `${checkedCount} critical-tier template(s) all instantiated in HomeBase registry`,
  };
}

// INV-035: Every library engine MANIFEST's `extends:` value must resolve to a
// file in engines/base/. The bug caught here (FIND-070 / WS-141): three
// MANIFESTs used `extends: base/context-gather` where every other MANIFEST
// used `extends: context-gather`. The resolver reads base/ itself as a prefix
// and fails to find `engines/base/base/context-gather.md`, breaking /engine
// assembly for those engines. Easy to miss because failure mode was a silent
// assembly error at run time, not a validation error.
function checkManifestExtendsResolves(rootDir) {
  if (!isKitSourceRepo(rootDir)) return { passed: true, detail: NOT_KIT_SOURCE_NA };
  const libDir = path.join(rootDir, 'engines/library');
  if (!fs.existsSync(libDir)) {
    return { passed: true, detail: 'engines/library/ not present — nothing to check.' };
  }

  const engineDirs = fs.readdirSync(libDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => path.join(libDir, e.name));

  const violations = [];
  let checked = 0;

  for (const d of engineDirs) {
    const manifestPath = path.join(d, 'MANIFEST.yaml');
    if (!fs.existsSync(manifestPath)) continue;
    checked++;
    const raw = fs.readFileSync(manifestPath, 'utf8');
    // Parse line-by-line — YAML parser is overkill for a single field.
    for (const line of raw.split('\n')) {
      if (line.trim().startsWith('#')) continue;
      const m = line.match(/^\s*extends:\s*([^\s#][^\s#]*)/);
      if (!m) continue;
      const val = m[1].replace(/^["']|["']$/g, '').trim();
      if (val === 'null' || val === '~' || val === '') continue;
      // Resolver contract: `extends: <name>` → engines/base/<name>.md
      const resolved = path.join(rootDir, 'engines/base', `${val}.md`);
      if (!fs.existsSync(resolved)) {
        violations.push(`${path.basename(d)}: extends: ${val} → ${path.relative(rootDir, resolved)} (missing)`);
      }
    }
  }

  return {
    passed: violations.length === 0,
    detail: violations.length === 0
      ? `${checked} library engine MANIFEST(s): all extends: values resolve.`
      : `${violations.length} MANIFEST(s) with unresolvable extends: ${violations.slice(0, 5).join('; ')}${violations.length > 5 ? ` (+${violations.length - 5} more)` : ''}`,
  };
}

// ─── INV-036: hook-race protection (FAIL-007 / WS-228) ─────────────────────
//
// Runs the hook-race fixture (kit/scripts/__tests__/hook-race.test.js) which
// spawns two child processes concurrently writing different fields into the
// same .hooks-liveness.yaml. With WS-228's withFileLock wrapping in place,
// both fields must survive every trial. Without it, the read-modify-write
// race clobbers one field on the first-write window.
//
// Multi-trial loop because the race window is narrow (only the first-write
// pair); a single trial catches the regression ~40% of the time, five trials
// >90%. INV-036 is the protection-side assertion: with the lock, all trials
// must preserve both fields. The falsification side (running --no-lock and
// observing the regression) is documented in invariants.md but not run by
// cwos-verify — that would intentionally produce non-deterministic failures.
//
// Spec divergence from WS-231 original: the fixture asserts field-preservation
// in .hooks-liveness.yaml, NOT events.jsonl drift. stampHookLiveness writes
// are intentionally not emitted to events (cwos-session-recovery.js:48-50),
// so the original "diff events.jsonl + cwos-replay" approach was based on a
// wrong premise. Field-clobber is the actual failure mode.

function checkHookRaceProtection(rootDir) {
  const fixturePath = path.join(rootDir, 'kit', 'scripts', '__tests__', 'hook-race.test.js');
  if (!fs.existsSync(fixturePath)) {
    return { passed: true, detail: 'hook-race fixture not present — INV-036 N/A (pre-WS-231)' };
  }

  let fixture;
  try { fixture = require(fixturePath); }
  catch (err) { return { passed: false, detail: `hook-race fixture failed to load: ${err.message}` }; }

  const TRIALS = 5;
  const WRITES_PER_ACTOR = 50;
  const startedAt = Date.now();
  const trialDurations = [];

  for (let i = 1; i <= TRIALS; i++) {
    let result;
    try {
      result = fixture.runRace({ withLock: true, writesPerActor: WRITES_PER_ACTOR });
    } catch (err) {
      return {
        passed: false,
        detail: `INV-036 trial ${i}/${TRIALS} threw: ${err.message}. Hook-race protection regression — investigate withFileLock wrapping in cwos-heartbeat.js + cwos-session-recovery.js (stampHookLiveness call sites).`,
      };
    }
    trialDurations.push(result.durationMs);
    if (!result.hasHeartbeat || !result.hasRecovery) {
      const missing = [];
      if (!result.hasHeartbeat) missing.push('last_heartbeat_hook_at');
      if (!result.hasRecovery) missing.push('last_session_recovery_hook_at');
      return {
        passed: false,
        detail: `INV-036 trial ${i}/${TRIALS} field-clobber detected: missing=[${missing.join(', ')}] after ${result.totalWrites} concurrent writes (sandbox=${result.sandbox}). WS-228 withFileLock wrapping is broken — concurrent stampHookLiveness is not serializing.`,
      };
    }
  }

  const totalMs = Date.now() - startedAt;
  const avgMs = Math.round(trialDurations.reduce((a, b) => a + b, 0) / TRIALS);
  return {
    passed: true,
    detail: `${TRIALS} trials × ${WRITES_PER_ACTOR * 2} concurrent writes — both fields preserved (avg ${avgMs}ms/trial, ${totalMs}ms total). withFileLock wrapping serializes stampHookLiveness as designed.`,
  };
}

// ─── INV-077 / INV-078: structural gates that live as test fixtures ─────────
//
// Both follow INV-036's shape above — locate the fixture under
// kit/scripts/__tests__/, treat its absence as N/A rather than a failure, run
// it, and translate its result into a check detail. They differ from INV-036 in
// one mechanical respect: hook-race.test.js EXPORTS runRace() and is safe to
// require(), while these two execute their assertions at load and call
// process.exit(). So they are spawned as child processes — the same
// spawnSync(process.execPath, [script]) delegation INV-062/INV-063 use for
// their shipped checkers. One definition of each gate, two entry points.
//
// Why they are wired here at all: each was written as a standalone file that
// only fires when a human runs it by hand, which is precisely the "warning that
// accumulates unread" failure this repo treats as a defect (DEC: hard-failing
// gates over warnings). A gate nothing runs is a wish.

// Pulls `N passed, M failed` plus the named failures out of a fixture's stdout.
// Both fixtures print the same shape: `  FAIL <name>` followed by an indented
// message line.
function summarizeFixtureRun(res) {
  const out = `${res.stdout || ''}\n${res.stderr || ''}`;
  const lines = out.split('\n');
  const summary = (out.match(/\d+ passed, \d+ failed/) || [])[0] || '';
  const failures = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*FAIL\s/.test(lines[i])) continue;
    const name = lines[i].replace(/^\s*FAIL\s+/, '').trim();
    // The assertion message is multi-line and continuation-indented (the
    // offending file:line rows live there, so dropping them loses the whole
    // point of the message).
    const msg = [];
    for (let j = i + 1; j < lines.length && /^ {5,}\S/.test(lines[j]); j++) msg.push(lines[j].trim());
    failures.push(msg.length ? `${name} — ${msg.join('; ')}` : name);
  }
  if (failures.length === 0) {
    const tail = lines.map((l) => l.trim()).filter(Boolean).slice(-4).join(' / ');
    if (tail) failures.push(tail);
  }
  return { summary, failures };
}

// ─── INV-077: one event-log reader (WS-482) ────────────────────────────────
//
// Part B of the fixture is the gate: no file under kit/scripts/ outside core/
// may enumerate an events directory itself, except the sites named in
// KNOWN_UNMIGRATED — and a stale entry fails too, so the list can only shrink.
// Six hand-rolled scans each grew their own filename predicate; five swept in
// current.jsonl (a mirror of today's chunk, so every event counted twice) and
// all six ignored events/archive/ (37% of the log by 2026-08-19).
function checkEventsReaderUnification(rootDir) {
  const fixturePath = path.join(rootDir, 'kit', 'scripts', '__tests__', 'events-reader-unification.test.js');
  if (!fs.existsSync(fixturePath)) {
    return { passed: true, detail: 'events-reader-unification fixture not present — INV-077 N/A (pre-WS-482)' };
  }

  const { spawnSync } = require('child_process');
  const startedAt = Date.now();
  const res = spawnSync(process.execPath, [fixturePath], { cwd: rootDir, encoding: 'utf8', timeout: 120000 });
  const ms = Date.now() - startedAt;

  if (res.error || res.status === null) {
    return {
      passed: false,
      detail: `INV-077 fixture could not run — ${res.error ? res.error.message : 'no exit status (timed out)'}. Run \`node kit/scripts/__tests__/events-reader-unification.test.js\` directly.`,
    };
  }

  const { summary, failures } = summarizeFixtureRun(res);
  if (res.status === 0) {
    return {
      passed: true,
      detail: `${summary || 'all assertions passed'} (${ms}ms) — core/events.js is the only event-log filename predicate; no unlisted script enumerates events/, and KNOWN_UNMIGRATED holds no stale entry.`,
    };
  }

  return {
    passed: false,
    detail: `INV-077 FAILED (${summary || `exit ${res.status}`}): ${failures.slice(0, 3).join(' | ')}. A second filename filter is how the event log starts disagreeing with itself — route the site through readFilteredEvents() in kit/scripts/core/events.js. Full output: \`node kit/scripts/__tests__/events-reader-unification.test.js\`.`,
  };
}

// ─── INV-078: atomic state writes (WS-643) ─────────────────────────────────
//
// Part D of the fixture is the gate: no file under kit/scripts/ may call raw
// fs.writeFileSync except the sites in RAW_WRITE_ALLOWLIST, each carrying a
// reason, and a stale entry fails too. Parts A–C prove the helper against the
// failure it exists to prevent (261 torn reads in 5,582 without it; a missing
// fsync that NTFS will not cover; a rename that contends with an open reader on
// win32), which is why the fixture costs ~10s and is deliberately NOT in the
// fast set.
// ─── INV-082: no duplicate key in any settings JSON (WS-606) ────────────────
//
// JSON.parse takes the LAST occurrence of a repeated key and discards the rest,
// silently. On 2026-08-02 `.claude/settings.local.json` gained a second
// `hooks.PostToolUse` key — a legal edit — and the ExitPlanMode matcher above it
// (cwos-plan-surface-hook.js, WS-479) stopped existing as far as the runtime was
// concerned. The file on disk described a hook nothing would ever run. Nothing
// could have caught it: JSON parsers do not warn, Claude Code does not warn, and
// .hooks-liveness.yaml has no plan-surface stamp.
//
// A parsed object cannot show a duplicate — by the time you hold it, the loser is
// gone. So this scans the RAW TEXT. It is not hooks-specific: a repeat anywhere
// in a settings file means an edit deleted something, and the general case costs
// nothing over the special one.
//
// HomeBase is the reference copy other repos will clone when hooks ship as a
// plugin (ADR-064 Stage 1), so it also scans any shipped settings template it
// finds — today there are none, which is FIND-hooks-never-propagate restated.

/**
 * Duplicate object keys in a JSON document, found by scanning raw text.
 *
 * Walks the source tracking string/escape state and a stack of container frames.
 * A string that is followed by `:` while the innermost frame is an object is a
 * key; keys are collected per frame, and a repeat is reported with the dotted
 * path of the object that holds it.
 *
 * Returns [{ key, path, lines: [n, ...] }]. Never throws — malformed input
 * yields whatever was seen before the damage, and callers treat [] as clean.
 */
function findDuplicateJsonKeys(raw) {
  const frames = [{ type: 'root', keys: new Map(), name: '' }];
  const dupes = [];
  let inString = false;
  let escaped = false;
  let strStart = -1;
  let pendingKey = null; // { text, line } — a closed string awaiting a ':' or not

  let line = 1;
  const flushPending = () => { pendingKey = null; };

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === '\n') line++;

    if (inString) {
      if (escaped) { escaped = false; continue; }
      if (c === '\\') { escaped = true; continue; }
      if (c === '"') {
        inString = false;
        pendingKey = { text: raw.slice(strStart + 1, i), line };
      }
      continue;
    }

    if (c === '"') { inString = true; strStart = i; continue; }

    if (c === ':') {
      const frame = frames[frames.length - 1];
      if (pendingKey && frame.type === 'object') {
        const seen = frame.keys.get(pendingKey.text);
        if (seen) {
          seen.push(pendingKey.line);
          let rec = dupes.find((d) => d.key === pendingKey.text && d.path === frame.name);
          if (!rec) { rec = { key: pendingKey.text, path: frame.name, lines: seen }; dupes.push(rec); }
        } else {
          frame.keys.set(pendingKey.text, [pendingKey.line]);
        }
        frame.lastKey = pendingKey.text;
      }
      flushPending();
      continue;
    }

    if (c === '{' || c === '[') {
      const parent = frames[frames.length - 1];
      const label = parent.lastKey
        ? (parent.name ? `${parent.name}.${parent.lastKey}` : parent.lastKey)
        : parent.name;
      frames.push({ type: c === '{' ? 'object' : 'array', keys: new Map(), name: label });
      flushPending();
      continue;
    }

    if (c === '}' || c === ']') {
      if (frames.length > 1) frames.pop();
      flushPending();
      continue;
    }

    if (c === ',') { flushPending(); continue; }
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') continue;

    // any other token (number, true/false/null) cannot be a key
    flushPending();
  }

  return dupes;
}

function checkSettingsNoDuplicateKeys(rootDir) {
  const candidates = [
    '.claude/settings.json',
    '.claude/settings.local.json',
    // Shipped templates, so the defect cannot propagate when hooks ship as a
    // plugin. Absent today (FIND-hooks-never-propagate) — listed so they are
    // covered the moment they exist rather than needing a second edit here.
    'kit/templates/settings.json',
    'kit/templates/.claude/settings.json',
    'kit/templates/claude/settings.json',
  ];

  const scanned = [];
  const problems = [];

  for (const rel of candidates) {
    const abs = path.join(rootDir, rel);
    if (!fs.existsSync(abs)) continue;
    let raw;
    try { raw = fs.readFileSync(abs, 'utf8'); } catch { continue; }
    scanned.push(rel);

    // A file that does not parse is a different defect, but reporting it here
    // beats scanning garbage and calling it clean.
    try { JSON.parse(raw); } catch (e) {
      problems.push(`${rel} is not valid JSON (${e.message})`);
      continue;
    }

    for (const d of findDuplicateJsonKeys(raw)) {
      const where = d.path ? `${d.path}.${d.key}` : d.key;
      problems.push(`${rel}: "${where}" declared ${d.lines.length} times (lines ${d.lines.join(', ')})`);
    }
  }

  if (scanned.length === 0) {
    return { passed: true, detail: 'no settings JSON present — INV-082 N/A' };
  }

  if (problems.length > 0) {
    return {
      passed: false,
      detail: `duplicate key in settings JSON: ${problems.join(' | ')}. JSON.parse keeps the LAST occurrence and drops the others, so whatever the earlier one configured is not running (WS-606: a second hooks.PostToolUse deleted the ExitPlanMode plan-surface hook for two days). Merge the repeated key's contents into a single key.`,
    };
  }

  return {
    passed: true,
    detail: `${scanned.length} settings file(s) scanned (${scanned.join(', ')}) — no duplicate keys at any depth.`,
  };
}

// ─── INV-081: cwos-next's flag contract holds, and its map matches the code ──
//
// ADR-063 in the command the fleet runs most. `cwos-next` accepted any flag it
// did not recognise and ran anyway, exit 0 — so `candidates --limit 30 --json`
// reported success while --json did nothing, and `--limit=30` silently applied
// the DEFAULT because readFlag() only understands the space form. A caller
// cannot tell either from a flag that worked.
//
// The fixture's Part B is what this is really buying: it reads the readFlag /
// hasFlag calls out of the source and holds SUBCOMMAND_FLAGS against them, so
// the map cannot drift into rejecting a flag that works or accepting one that
// does nothing. Adding a flag without declaring it FAILS here.
function checkNextCliContract(rootDir) {
  const fixturePath = path.join(rootDir, 'kit', 'scripts', '__tests__', 'next-cli-contract.test.js');
  if (!fs.existsSync(fixturePath)) {
    return { passed: true, detail: 'next-cli-contract fixture not present — INV-081 N/A (pre-WS-732)' };
  }

  const { spawnSync } = require('child_process');
  const startedAt = Date.now();
  const res = spawnSync(process.execPath, [fixturePath], { cwd: rootDir, encoding: 'utf8', timeout: 120000 });
  const ms = Date.now() - startedAt;

  if (res.error || res.status === null) {
    return {
      passed: false,
      detail: `INV-081 fixture could not run — ${res.error ? res.error.message : 'no exit status (timed out)'}. Run \`node kit/scripts/__tests__/next-cli-contract.test.js\` directly.`,
    };
  }

  const { summary, failures } = summarizeFixtureRun(res);
  if (res.status === 0) {
    return {
      passed: true,
      detail: `${summary || 'all assertions passed'} (${ms}ms) — every cwos-next subcommand refuses an unknown flag with exit 2, and SUBCOMMAND_FLAGS describes exactly the flags the code reads.`,
    };
  }

  return {
    passed: false,
    detail: `INV-081 FAILED (${summary || `exit ${res.status}`}): ${failures.slice(0, 3).join(' | ')}. A flag accepted and ignored is indistinguishable from a flag that worked — declare it in SUBCOMMAND_FLAGS in kit/scripts/cwos-next.js, or stop reading it. Full output: \`node kit/scripts/__tests__/next-cli-contract.test.js\`.`,
  };
}

// --- INV-083: cwos-event refuses a bare append instead of writing junk (WS-594)
//
// `cwos-event.js append` with no type invented a `command_completed` record,
// hash-chained it into the append-only ledger and exited 0. Three agents tripped
// it in one day, each expecting the usage string. The damage is time-limited in a
// way the person who caused it cannot see: a junk event is removable only while
// it is still the LAST line, because every later record's prior_hash depends on
// it. After that the choice is a false record or a rewrite of every hash below.
//
// The fixture asserts the refusal AND that argument validation happens before
// the ledger is reachable at all, so the guarantee is structural rather than a
// branch someone can reorder past.
// --- INV-084: every released kit-v* tag has a usable hash baseline (WS-610) --
//
// Release step 2 writes kit/hashes-<version>.yaml -- the record /kit-upgrade
// reads to tell a stock kit file from one the founder hand-edited. Step 3 tags.
// Four gates already refuse to WRITE a baseline (INV-064/068/073/074) and
// INV-071 asks whether the current one is stale, but every one of them only
// runs when someone remembers to run the generator. A release that skipped
// step 2 and went straight to the tag passed all five.
//
// Degraded detection is not harmless: it is the mechanism deciding whether a
// hand-edit is preserved as a .kit-update sidecar or silently overwritten.
//
// Honest bound, stated rather than implied: this catches a skipped step 2 at
// the NEXT release, not at the tagging moment -- git has no pre-tag hook worth
// having. Closing that last gap needs the two steps folded into one command.
function checkBaselineCoverage(rootDir) {
  const script = path.join(rootDir, 'kit', 'scripts', 'cwos-baseline-coverage.js');
  if (!fs.existsSync(script)) {
    return { passed: true, detail: 'cwos-baseline-coverage.js not present -- INV-084 N/A (pre-WS-610)' };
  }

  let checkFn;
  try { ({ checkBaselineCoverage: checkFn } = require(script)); }
  catch (e) { return { passed: true, detail: `validator not loadable -- ${e.message}` }; }

  let result;
  try { result = checkFn(rootDir); }
  catch (e) { return { passed: true, detail: `validator threw -- ${e.message} (N/A)` }; }

  if (!result || result.exit_code === 2 || result.applicable === false) {
    return { passed: true, detail: 'no kit-v* tags / not a kit source repo -- N/A' };
  }

  const info = Array.isArray(result.info) ? result.info.length : 0;
  if (result.ok) {
    return {
      passed: true,
      detail: `${result.tags_checked} kit-v* tag(s), ${result.baselines_present} baseline(s) -- every released tag has a usable kit/hashes-<version>.yaml`
        + (info ? `; ${info} baseline(s) awaiting a tag (release step 2 done, step 3 pending -- reported, never failed)` : ''),
    };
  }

  const v = (result.violations || []).map((x) => (typeof x === 'string' ? x : (x.message || x.detail || JSON.stringify(x))));
  return {
    passed: false,
    detail: `INV-084 FAILED: ${v.slice(0, 3).join(' | ')}. A tag with no baseline means every repo installed at that version upgrades on the degraded detection path, which is what decides whether a hand-edit survives. Fix: \`node kit/scripts/cwos-hash-manifest.js --backfill-all\`. Full report: \`node kit/scripts/cwos-baseline-coverage.js --human\`.`,
  };
}

function checkEventCliContract(rootDir) {
  const fixturePath = path.join(rootDir, 'kit', 'scripts', '__tests__', 'cwos-event-cli-contract.test.js');
  if (!fs.existsSync(fixturePath)) {
    return { passed: true, detail: 'cwos-event-cli-contract fixture not present -- INV-083 N/A (pre-WS-594)' };
  }

  const { spawnSync } = require('child_process');
  const startedAt = Date.now();
  const res = spawnSync(process.execPath, [fixturePath], { cwd: rootDir, encoding: 'utf8', timeout: 120000 });
  const ms = Date.now() - startedAt;

  if (res.error || res.status === null) {
    return {
      passed: false,
      detail: `INV-083 fixture could not run -- ${res.error ? res.error.message : 'no exit status (timed out)'}. Run \`node kit/scripts/__tests__/cwos-event-cli-contract.test.js\` directly.`,
    };
  }

  const { summary, failures } = summarizeFixtureRun(res);
  if (res.status === 0) {
    return {
      passed: true,
      detail: `${summary || 'all assertions passed'} (${ms}ms) -- a malformed cwos-event command line is refused with exit 2 before the event log is opened.`,
    };
  }

  return {
    passed: false,
    detail: `INV-083 FAILED (${summary || `exit ${res.status}`}): ${failures.slice(0, 3).join(' | ')}. A probe for "how do I call this" must not become a write to an append-only ledger. Full output: \`node kit/scripts/__tests__/cwos-event-cli-contract.test.js\`.`,
  };
}

// INV-085 (WS-699): the courier's return leg. The properties this guards are
// all silent when broken — a request with no watermark re-appends every 15
// minutes, a request that leaks into the friction inbox inflates the
// recurrence math that decides which components count as proven defects, and a
// declined request that is not ledgered comes back forever, which makes a "no"
// indistinguishable from being ignored. The outbound half shipped with no
// tests at all; this is the return half not repeating that.
function checkRequestChannel(rootDir) {
  const fixturePath = path.join(rootDir, 'kit', 'scripts', '__tests__', 'request-channel.test.js');
  if (!fs.existsSync(fixturePath)) {
    return { passed: true, detail: 'request-channel fixture not present — INV-085 N/A (pre-WS-699)' };
  }

  const { spawnSync } = require('child_process');
  const startedAt = Date.now();
  const res = spawnSync(process.execPath, [fixturePath], { cwd: rootDir, encoding: 'utf8', timeout: 120000 });
  const ms = Date.now() - startedAt;

  if (res.error || res.status === null) {
    return {
      passed: false,
      detail: `INV-085 fixture could not run — ${res.error ? res.error.message : 'no exit status (timed out)'}. Run \`node kit/scripts/__tests__/request-channel.test.js\` directly.`,
    };
  }

  const { summary, failures } = summarizeFixtureRun(res);
  if (res.status === 0) {
    return {
      passed: true,
      detail: `${summary || 'all assertions passed'} (${ms}ms) — repo requests are watermarked, never cross into the friction lane, and a decline reaches the repo that asked and stops re-promoting.`,
    };
  }

  return {
    passed: false,
    detail: `INV-085 FAILED (${summary || `exit ${res.status}`}): ${failures.slice(0, 3).join(' | ')}. A peer repo that asks and hears nothing stops asking — that silence is the defect, and it is invisible from here. Full output: \`node kit/scripts/__tests__/request-channel.test.js\`.`,
  };
}

// INV-086 (WS-660): the KEV patch oracle's fail-closed contract. 'patched' is
// the only verdict that clears a finding, and it must require that every
// Windows node was successfully probed and carries a remediating KB. A false
// 'unknown' costs one line in the digest; a false 'patched' is silence about a
// live, exploited vulnerability — so the asymmetry is gated, not documented.
function checkKevPatchOracle(rootDir) {
  const fixturePath = path.join(rootDir, 'kit', 'scripts', '__tests__', 'kev-patch-oracle.test.js');
  if (!fs.existsSync(fixturePath)) {
    return { passed: true, detail: 'kev-patch-oracle fixture not present — INV-086 N/A (pre-WS-660)' };
  }

  const { spawnSync } = require('child_process');
  const startedAt = Date.now();
  const res = spawnSync(process.execPath, [fixturePath], { cwd: rootDir, encoding: 'utf8', timeout: 120000 });
  const ms = Date.now() - startedAt;

  if (res.error || res.status === null) {
    return {
      passed: false,
      detail: `INV-086 fixture could not run — ${res.error ? res.error.message : 'no exit status (timed out)'}. Run \`node kit/scripts/__tests__/kev-patch-oracle.test.js\` directly.`,
    };
  }

  const { summary, failures } = summarizeFixtureRun(res);
  if (res.status === 0) {
    return {
      passed: true,
      detail: `${summary || 'all assertions passed'} (${ms}ms) — a KEV clears only when every Windows node was probed and carries a remediating KB; unreachable nodes, dead feeds and uncatalogued CVEs all fail closed.`,
    };
  }

  return {
    passed: false,
    detail: `INV-086 FAILED (${summary || `exit ${res.status}`}): ${failures.slice(0, 3).join(' | ')}. A KEV wrongly marked patched is silence about a vulnerability CISA lists as actively exploited. Full output: \`node kit/scripts/__tests__/kev-patch-oracle.test.js\`.`,
  };
}

// INV-087 (WS-735): the YAML reader must undo exactly what the writers do.
// When it did not, two bugs with opposite symptoms shared one cause — escaped
// values doubled on every write (one findings.yaml title reached 1,048,701
// characters) while correctly-escaped values reached consumers wrong (all five
// stage-detection regexes matched nothing). Both were silent.
function checkYamlEscapeRoundtrip(rootDir) {
  const fixturePath = path.join(rootDir, 'kit', 'scripts', '__tests__', 'yaml-escape-roundtrip.test.js');
  if (!fs.existsSync(fixturePath)) {
    return { passed: true, detail: 'yaml-escape-roundtrip fixture not present — INV-087 N/A (pre-WS-735)' };
  }

  const { spawnSync } = require('child_process');
  const startedAt = Date.now();
  const res = spawnSync(process.execPath, [fixturePath], { cwd: rootDir, encoding: 'utf8', timeout: 120000 });
  const ms = Date.now() - startedAt;

  if (res.error || res.status === null) {
    return {
      passed: false,
      detail: `INV-087 fixture could not run — ${res.error ? res.error.message : 'no exit status (timed out)'}. Run \`node kit/scripts/__tests__/yaml-escape-roundtrip.test.js\` directly.`,
    };
  }

  const { summary, failures } = summarizeFixtureRun(res);
  if (res.status === 0) {
    return {
      passed: true,
      detail: `${summary || 'all assertions passed'} (${ms}ms) — write/read is a fixed point, Windows paths keep their \\r and \\n, and findings.yaml carries no compounding escape runs.`,
    };
  }

  return {
    passed: false,
    detail: `INV-087 FAILED (${summary || `exit ${res.status}`}): ${failures.slice(0, 3).join(' | ')}. An asymmetric escape grows state without bound in one direction and corrupts stored regexes in the other, and both are silent. Full output: \`node kit/scripts/__tests__/yaml-escape-roundtrip.test.js\`.`,
  };
}

function checkAtomicStateWrites(rootDir) {
  const fixturePath = path.join(rootDir, 'kit', 'scripts', '__tests__', 'atomic-state-writes.test.js');
  if (!fs.existsSync(fixturePath)) {
    return { passed: true, detail: 'atomic-state-writes fixture not present — INV-078 N/A (pre-WS-643)' };
  }

  const { spawnSync } = require('child_process');
  const startedAt = Date.now();
  const res = spawnSync(process.execPath, [fixturePath], { cwd: rootDir, encoding: 'utf8', timeout: 180000 });
  const ms = Date.now() - startedAt;

  if (res.error || res.status === null) {
    return {
      passed: false,
      detail: `INV-078 fixture could not run — ${res.error ? res.error.message : 'no exit status (timed out)'}. Run \`node kit/scripts/__tests__/atomic-state-writes.test.js\` directly.`,
    };
  }

  const { summary, failures } = summarizeFixtureRun(res);
  if (res.status === 0) {
    return {
      passed: true,
      detail: `${summary || 'all assertions passed'} (${ms}ms) — writeFileAtomic publishes no intermediate state, fsyncs before rename, retries win32 rename contention; no unlisted raw fs.writeFileSync under kit/scripts/ and RAW_WRITE_ALLOWLIST holds no stale entry.`,
    };
  }

  return {
    passed: false,
    detail: `INV-078 FAILED (${summary || `exit ${res.status}`}): ${failures.slice(0, 3).join(' | ')}. Convert the site to writeFileAtomic from kit/scripts/lib/cwos-utils.js — a raw write to durable state is a torn file on the next battery death. Full output: \`node kit/scripts/__tests__/atomic-state-writes.test.js\`.`,
  };
}

// ─── INV-079 / INV-080: ported from Claude-Poker-Tracker (2026-08-23) ────────
//
// Both checks were written in Claude-Poker-Tracker against defects measured
// there, and both had their falsifier exercised rather than assumed. They
// arrived numbered INV-072 and INV-073, which upstream had already spent on
// different checks — so a kit upgrade deleted them and reused their numbers.
// They are renumbered once, here, because the only place an ID stops colliding
// is the place that hands IDs out. A local check that a kit upgrade deletes is
// not a check; upstreaming is the repair, and renumbering in place would only
// have delayed the next collision.
//
// The comment blocks below are the original authors' and are kept verbatim —
// each one records the measurement that justified the check, and that is the
// part that does not survive a rewrite.
// ─── INV-079: no tracked file is matched by an ignore rule (CPT WS-671) ─────
//
// THE SHAPE, measured twice on 2026-08-23 in the same hour:
//
//   `.claude/workstream/events/` was ignored wholesale while 22 files inside it
//   were tracked. Nothing added a chunk after the rule landed, so 19 chunks —
//   2,005 events, 1.3 MB — existed on ONE machine and nowhere else.
//
//   `*.png` was ignored unanchored while 106 PNGs were tracked through it with
//   `-f`. It was silently swallowing the Chrome extension's three
//   manifest-declared icons (a fresh clone could not load it with icons), two
//   WS-574 evidence captures, and the only screenshot of the WS-515 warning
//   strip. Four `!` negations written to prevent exactly that had been sorted
//   ABOVE the rule they override, and gitignore is last-match-wins, so all four
//   were dead while looking protective.
//
// Both are one disease: a rule and the thing it governs disagreeing SILENTLY.
// The tracked files keep working, so nothing complains — and every NEW file of
// that same class is dropped on the floor without a message. The cost is only
// ever discovered later, by someone looking for something that was never there.
//
// THE FLAG THAT MAKES THIS CHECK REAL IS `--no-index`. Without it `git
// check-ignore` skips tracked paths by definition, so the check returns clean
// against a repo with 108 violations. That false all-clear was measured and
// reported to the founder before the flag was found. A check that cannot fail
// is worse than no check, so the anti-vacuity guard below is not optional.
function checkTrackedButIgnored(rootDir) {
  const { spawnSync } = require('child_process');

  let tracked;
  try {
    const r = spawnSync('git', ['ls-files', '-z'], {
      cwd: rootDir, encoding: 'utf8', timeout: 20000, maxBuffer: 64 * 1024 * 1024,
    });
    if (r.error || r.status !== 0) {
      return { passed: true, detail: `git ls-files unavailable — N/A (${(r.error && r.error.message) || `exit ${r.status}`})` };
    }
    tracked = r.stdout;
  } catch (e) {
    return { passed: true, detail: `git ls-files threw — N/A (${e.message})` };
  }

  const trackedCount = tracked.split('\0').filter(Boolean).length;
  // ANTI-VACUITY: a repo with no tracked files cannot be this repo. Passing here
  // would mean the check reports green precisely when it has measured nothing.
  if (trackedCount === 0) {
    return { passed: false, detail: 'git ls-files returned 0 tracked files — the check measured nothing, so its result is not a pass' };
  }

  let out;
  try {
    const r = spawnSync('git', ['check-ignore', '--stdin', '-z', '--no-index', '-v'], {
      cwd: rootDir, input: tracked, encoding: 'utf8', timeout: 30000, maxBuffer: 64 * 1024 * 1024,
    });
    // exit 0 = at least one path ignored, 1 = none ignored, >1 = real error.
    if (r.status !== 0 && r.status !== 1) {
      return { passed: true, detail: `git check-ignore unavailable — N/A (exit ${r.status})` };
    }
    out = r.stdout || '';
  } catch (e) {
    return { passed: true, detail: `git check-ignore threw — N/A (${e.message})` };
  }

  // -v emits NUL-separated 4-tuples: source, linenum, pattern, pathname.
  const parts = out.split('\0').filter(Boolean);
  const offenders = [];
  for (let i = 0; i + 3 < parts.length; i += 4) {
    const pattern = parts[i + 2];
    const pathname = parts[i + 3];
    // A `!` pattern is a NEGATION: it un-ignores. -v reports it as the last
    // matching rule, which means the file is NOT ignored. Counting these was
    // the second way to get this check wrong.
    if (pattern.startsWith('!')) continue;
    offenders.push({ pattern, pathname, where: `${parts[i]}:${parts[i + 1]}` });
  }

  if (offenders.length === 0) {
    return { passed: true, detail: `${trackedCount} tracked files, none matched by an ignore rule` };
  }

  const byPattern = new Map();
  for (const o of offenders) {
    if (!byPattern.has(o.pattern)) byPattern.set(o.pattern, { n: 0, where: o.where, sample: o.pathname });
    byPattern.get(o.pattern).n += 1;
  }
  const summary = [...byPattern.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, 5)
    .map(([pat, v]) => `${v.where} \`${pat}\` hides ${v.n} tracked file(s), e.g. ${v.sample}`)
    .join(' | ');

  return {
    passed: false,
    detail: `${offenders.length} tracked file(s) are matched by an ignore rule — ${summary}. `
      + `Each such rule is silently dropping NEW files of a class this repo already tracks. `
      + `Prefer ANCHORING the rule (\`/*.png\`) over adding a \`!\` negation: gitignore is `
      + `last-match-wins, so a negation dies the moment the file is sorted.`,
  };
}

// ─── INV-080: no orphaned worktree directories (CPT WS-672) ─────────────────
//
// Measured 2026-08-23: `.claude/worktrees/sidebar-table-identity/` held 32 MB
// and 2,187 files while BOTH of the usual checks reported clean.
//
//   `git worktree list`  — showed one worktree. The directory had lost its
//                          `.git` pointer, so git no longer considered it one.
//   `git status`         — showed nothing. `**/.claude/worktrees/` is in
//                          `.git/info/exclude`, which is LOCAL and therefore
//                          not visible in `.gitignore` either.
//
// Two independent reasons to be invisible, and a session reported "no orphaned
// work" on the strength of the first one. 2,186 of those files turned out to be
// content-reachable from a ref; exactly one was not, and it was the only
// screenshot of a shipped warning state.
//
// This check answers the question the other two cannot: is there a directory
// here that nothing owns? It deliberately does NOT try to judge whether the
// contents matter — that is a containment proof, and the failure text names the
// command that performs it.
function checkOrphanedWorktreeDirs(rootDir) {
  const { spawnSync } = require('child_process');
  const wtRoot = path.join(rootDir, '.claude', 'worktrees');

  if (!fs.existsSync(wtRoot)) {
    return { passed: true, detail: 'no .claude/worktrees/ — N/A' };
  }

  let onDisk;
  try {
    onDisk = fs.readdirSync(wtRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch (e) {
    return { passed: true, detail: `.claude/worktrees/ unreadable — N/A (${e.message})` };
  }
  if (onDisk.length === 0) {
    return { passed: true, detail: '.claude/worktrees/ is empty' };
  }

  const registered = new Set();
  try {
    const r = spawnSync('git', ['worktree', 'list', '--porcelain'], {
      cwd: rootDir, encoding: 'utf8', timeout: 10000,
    });
    if (r.error || r.status !== 0) {
      return { passed: true, detail: `git worktree list unavailable — N/A (${(r.error && r.error.message) || `exit ${r.status}`})` };
    }
    for (const line of (r.stdout || '').split(/\r?\n/)) {
      if (!line.startsWith('worktree ')) continue;
      registered.add(path.resolve(line.slice('worktree '.length).trim()));
    }
  } catch (e) {
    return { passed: true, detail: `git worktree list threw — N/A (${e.message})` };
  }

  const orphans = onDisk.filter((name) => !registered.has(path.resolve(path.join(wtRoot, name))));
  if (orphans.length === 0) {
    return { passed: true, detail: `${onDisk.length} worktree dir(s), all registered` };
  }

  const named = orphans.map((name) => {
    let files = 0;
    const walk = (dir, depth) => {
      if (depth > 6 || files > 20000) return;
      let ents;
      try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of ents) {
        if (e.name === 'node_modules' || e.name === '.git') continue;
        if (e.isDirectory()) walk(path.join(dir, e.name), depth + 1);
        else files += 1;
      }
    };
    walk(path.join(wtRoot, name), 0);
    return `${name} (~${files} files excluding node_modules)`;
  }).join(', ');

  return {
    passed: false,
    detail: `${orphans.length} unregistered director(y/ies) under .claude/worktrees/: ${named}. `
      + `These are invisible to BOTH \`git worktree list\` and \`git status\`, so they do not `
      + `appear in any routine cleanup. Prove containment before removing — hash each file and `
      + `test it against the set reachable from refs (\`git rev-list --objects --all\`), not `
      + `merely against the object database, which still holds unreachable blobs. `
      + `Check for a junctioned node_modules first: \`git worktree remove --force\` follows a `
      + `Windows junction and empties the real one.`,
  };
}

// ─── Main ───────────────────────────────────────────────────────────────────

// ADR-063 / WS-542: uniform CLI contract. A full run is ~10 minutes / 160+ CPU
// seconds, so a mistyped flag that is silently ignored is expensive — a session
// asked for `--quick` (not a flag) and got the entire suite, timing out, while
// the `--fast-mode` tier it wanted already existed but was undiscoverable.
const CLI = {
  name: 'cwos-verify',
  summary: 'run invariant checks over the repo',
  flags: {
    quiet: { type: 'boolean', describe: 'silent unless something fails' },
    strict: { type: 'boolean', describe: 'exit 1 on any FAIL (default exits 0 — see notes)' },
    'fast-mode': { type: 'boolean', describe: 'cheap subset only — use this for session-start checks' },
    'since-git-commit': {
      type: 'string', optionalValue: true, placeholder: 'ref',
      describe: 'only invariants touching files changed since <ref> (default: HEAD)',
    },
    only: { type: 'string', placeholder: 'INV-ID', describe: 'run a single invariant by id' },
    fix: { type: 'boolean', describe: 'apply safe auto-fixes when nothing failed' },
    'fix-hardlinks': { type: 'boolean', describe: 'repair broken command hardlinks, then exit' },
    force: { type: 'boolean', describe: 'with --fix-hardlinks, overwrite content-divergent targets' },
  },
  notes: [
    'A full run takes ~10 minutes. Prefer --fast-mode, --since-git-commit, or --only.',
    '',
    'NOTE: without --strict a FAIL still exits 0. Do not gate on the exit code',
    'unless you pass --strict.',
  ].join('\n'),
};

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);
  const quiet = values.quiet;
  const strict = values.strict;
  const fix = values.fix;
  const fixHardlinks = values['fix-hardlinks'];
  const force = values.force;
  const onlyId = values.only || null;
  const fastMode = values['fast-mode'];
  const since = values['since-git-commit'];
  const sinceMode = since !== undefined;
  // `true` means the flag was given with no ref; a string is an explicit ref.
  const sinceRef = typeof since === 'string' ? since : null;

  const rootDir = resolveRepoRoot();

  // Per-run YAML cache (WS-429) — fresh every invocation.
  clearVerifyCache();

  // --fix-hardlinks runs the scanner in repair mode and returns early. Never
  // invoke implicitly — requires explicit flag. --force adds permission to
  // overwrite content-divergent targets.
  if (fixHardlinks) {
    const actions = fixBrokenHardlinks(rootDir, { force });
    console.log(`cwos-verify --fix-hardlinks:`);
    console.log(`  fixed:   ${actions.fixed.length} (${actions.fixed.join(', ') || 'none'})`);
    console.log(`  skipped: ${actions.skipped.length} ${actions.skipped.length ? '(need --force): ' + actions.skipped.join('; ') : ''}`);
    console.log(`  errors:  ${actions.errors.length} ${actions.errors.length ? actions.errors.join('; ') : ''}`);
    process.exit(actions.errors.length > 0 ? 1 : 0);
  }

  let checks;
  let selectionNote = null;
  if (onlyId) {
    checks = INVARIANT_CHECKS.filter(c => c.id === onlyId);
  } else {
    const sel = selectChecks(INVARIANT_CHECKS, { fastMode, sinceMode, sinceRef, rootDir });
    checks = sel.checks;
    selectionNote = sel.note;
  }
  if (checks.length === 0 && onlyId) {
    console.error(`No invariant matches "${onlyId}". Available: ${INVARIANT_CHECKS.map(c => c.id).join(', ')}`);
    process.exit(1);
  }

  // WS-609: leave evidence the run STARTED before any check runs. If the
  // SessionStart hook's timeout kills this process mid-loop, started-newer-
  // than-completed in .verify-liveness.yaml is the surviving proof, and
  // INV-070 turns it into a failure instead of silence.
  try {
    stampVerifyStart(rootDir, { fastMode, sinceMode, onlyId });
  } catch (e) {
    if (!quiet) console.error(`verify-start stamp failed: ${e.message}`);
  }

  // WS-566: time every check. Without durations, "fast" is an assertion nobody
  // measures — INV-031 sat in the fast set for months at 281 seconds against an
  // 8-second SessionStart timeout, so it was launched and killed every session
  // and no signal said so.
  const results = [];
  for (const inv of checks) {
    let result;
    const t0 = Date.now();
    try { result = inv.check(rootDir); }
    catch (e) { result = { passed: false, detail: `Check threw: ${e.message}` }; }
    results.push({ ...inv, ...result, duration_ms: Date.now() - t0 });
  }

  const failed = results.filter(r => !r.passed);

  if (!quiet || failed.length > 0) {
    const scope = (fastMode || sinceMode) ? ` (${results.length}/${INVARIANT_CHECKS.length} selected)` : '';
    console.log(`cwos-verify: ${results.length - failed.length}/${results.length} invariants passed${scope}`);
    if (selectionNote) console.log(`  selection: ${selectionNote}`);
    for (const r of results) {
      const icon = r.passed ? 'PASS' : 'FAIL';
      console.log(`  [${icon}] ${r.id} — ${r.name}`);
      if (!r.passed || !quiet) console.log(`         ${r.detail}`);
    }
  }

  if (fix && failed.length === 0) {
    updateLastVerifiedDates(rootDir, results);
    if (!quiet) console.log(`Updated "Last Verified" date in invariants.md for ${results.length} passing checks`);
  }

  // WS-566: a run that COMPLETED says so, with what it cost. A killed run
  // writes nothing, which is what makes "killed" distinguishable from "clean"
  // — the distinction the SessionStart wiring (`--quiet 2>/dev/null || true`,
  // timeout 8) otherwise destroys.
  try {
    stampVerifyLiveness(rootDir, results, { fastMode, sinceMode, onlyId });
  } catch (e) {
    if (!quiet) console.error(`verify-liveness stamp failed: ${e.message}`);
  }

  // WS-376: update per-INV consecutive-failure log. Only updates checks that
  // actually ran (--only narrows the set; we only mutate what we observed).
  try {
    updateInvariantFiringLog(rootDir, results);
  } catch (e) {
    // Non-fatal — firing log is observability, not gate-bearing
    if (!quiet) console.error(`firing-log update failed: ${e.message}`);
  }

  if (strict && failed.length > 0) process.exit(1);
}

// ─── WS-566: proof that a verify run finished, and what it cost ─────────────
//
// The SessionStart hook runs `cwos-verify.js --fast-mode --since-git-commit
// --quiet 2>/dev/null || true` with an 8-second timeout. Every part of that
// line discards evidence: the timeout kills it, `2>/dev/null` eats the stderr,
// and `|| true` eats the exit code. A run that never finished is therefore
// indistinguishable from a clean one — which is how INV-031 spent months being
// launched and killed while ADR-020's replay-purity guarantee went unverified.
//
// The fix is the same shape as .hooks-liveness.yaml: only a run that REACHES
// THE END writes the stamp, so absence is the signal. Durations are recorded
// per invariant, which turns `fast: true` from an assertion into a measurement
// INV-070 can check.
const VERIFY_LIVENESS_FILE = '.verify-liveness.yaml';

function readVerifyLivenessRaw(p) {
  const prior = {};
  try {
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^([a-z_]+):\s*"?([^"\n]*)"?\s*$/);
      if (m) prior[m[1]] = m[2].trim();
    }
  } catch { /* first write / absent */ }
  return prior;
}

function writeVerifyLiveness(p, out) {
  const order = [
    'last_run_started_at', 'last_run_started_mode', 'last_run_started_pid',
    'last_truncated_run_at', 'last_truncated_run_mode',
    'last_run_completed_at', 'last_run_mode', 'last_run_ms',
    'last_fast_completed_at', 'last_fast_ms', 'slowest_fast_id', 'slowest_fast_ms',
    'last_full_completed_at', 'last_replay_purity_ok_at', 'last_replay_purity_ms',
    'last_field_purity_ok_at', 'last_field_purity_ms',
  ];
  const body = [
    '# Written by cwos-verify.js (WS-566 / WS-609). last_run_started_* is',
    '# stamped BEFORE the check loop; last_run_completed_at only on a run that',
    '# reached the end. started newer than completed = the run was truncated',
    '# or killed — the SessionStart hook runs verify with a timeout,',
    '# 2>/dev/null and || true, so this file is the only surviving evidence.',
    '# Read by INV-070.',
    ...order.filter((k) => out[k] !== undefined && out[k] !== '').map((k) => `${k}: "${out[k]}"`),
  ].join('\n') + '\n';
  writeFileAtomic(p, body, { skipSizeGate: true });
}

function verifyModeLabel({ fastMode, sinceMode, onlyId }) {
  return onlyId ? `only:${onlyId}` : (fastMode ? 'fast' : (sinceMode ? 'since-git-commit' : 'full'));
}

// WS-609: stamped BEFORE the check loop, so a run the SessionStart hook's
// timeout kills still leaves evidence it started.
//
// The started slot is single-occupancy and this run is about to claim it, so
// the promotion below is load-bearing: INV-070 only ever runs INSIDE a verify
// run, i.e. after this function has already overwritten the started fields
// with our own. Without promotion, a killed run's evidence would be destroyed
// by the very run that could report it. If the prior stamp shows a start that
// never completed and its pid is dead, promote it to last_truncated_run_* —
// INV-070 fails on that until a run of the same mode completes again.
// (A LIVE prior pid is a concurrent verify run; we still claim the slot —
// two interleaved runs racing one stamp file is an accepted residual race.)
function stampVerifyStart(rootDir, { fastMode, sinceMode, onlyId }) {
  const wsDir = path.join(rootDir, '.claude', 'workstream');
  if (!fs.existsSync(wsDir)) return;
  const p = path.join(wsDir, VERIFY_LIVENESS_FILE);
  withFileLock(p + '.lock', () => {
    const out = readVerifyLivenessRaw(p);

    const priorStarted = Date.parse(out.last_run_started_at || '');
    const priorCompleted = Date.parse(out.last_run_completed_at || '');
    if (Number.isFinite(priorStarted) && (!Number.isFinite(priorCompleted) || priorStarted > priorCompleted)) {
      const priorPid = Number(out.last_run_started_pid);
      let priorAlive = false;
      if (Number.isFinite(priorPid) && priorPid > 0 && priorPid !== process.pid) {
        try { process.kill(priorPid, 0); priorAlive = true; }
        catch (e) { priorAlive = e.code === 'EPERM'; }
      }
      if (!priorAlive && priorPid !== process.pid) {
        out.last_truncated_run_at = out.last_run_started_at;
        out.last_truncated_run_mode = out.last_run_started_mode || 'unknown';
      }
    }

    out.last_run_started_at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    out.last_run_started_mode = verifyModeLabel({ fastMode, sinceMode, onlyId });
    out.last_run_started_pid = String(process.pid);
    writeVerifyLiveness(p, out);
  }, { ownerLabel: 'cwos-verify-start' });
}

function stampVerifyLiveness(rootDir, results, { fastMode, sinceMode, onlyId }) {
  const wsDir = path.join(rootDir, '.claude', 'workstream');
  if (!fs.existsSync(wsDir)) return;
  const p = path.join(wsDir, VERIFY_LIVENESS_FILE);

  withFileLock(p + '.lock', () => {
    // Preserve what this run did not observe: a --fast-mode run must not erase
    // the record of the last FULL run, or the staleness check it feeds becomes a
    // measure of how recently someone ran the cheap subset.
    const prior = readVerifyLivenessRaw(p);

    const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const mode = verifyModeLabel({ fastMode, sinceMode, onlyId });
    const total = results.reduce((n, r) => n + (r.duration_ms || 0), 0);

    const out = { ...prior };
    out.last_run_completed_at = now;
    out.last_run_mode = mode;
    out.last_run_ms = String(total);
    if (fastMode) {
      out.last_fast_completed_at = now;
      out.last_fast_ms = String(total);
      // Slowest fast-mode check, so a budget regression is visible without
      // re-running anything.
      const slowest = results.slice().sort((a, b) => (b.duration_ms || 0) - (a.duration_ms || 0))[0];
      if (slowest) {
        out.slowest_fast_id = slowest.id;
        out.slowest_fast_ms = String(slowest.duration_ms || 0);
      }
    }
    if (!fastMode && !sinceMode && !onlyId) out.last_full_completed_at = now;

    // Replay-purity is the guarantee this item exists to keep honest, so its last
    // CONFIRMED pass is recorded by name wherever it runs from.
    const replay = results.find((r) => r.id === 'INV-031');
    if (replay && replay.passed) {
      out.last_replay_purity_ok_at = now;
      out.last_replay_purity_ms = String(replay.duration_ms || 0);
    }
    // WS-609: INV-044 (per-field replay-purity) gets the same treatment —
    // heavy checks are out of the implicit paths, so INV-070's staleness
    // assertion on this stamp is what keeps the guarantee enforced.
    const fieldPurity = results.find((r) => r.id === 'INV-044');
    if (fieldPurity && fieldPurity.passed) {
      out.last_field_purity_ok_at = now;
      out.last_field_purity_ms = String(fieldPurity.duration_ms || 0);
    }

    writeVerifyLiveness(p, out);
  }, { ownerLabel: 'cwos-verify-complete' });
}

// WS-376 / FIND-251: persistent firing log so consecutive-failure thresholds
// can drive cwos-migrate-watch.js escalations. Schema and atomicity follow the
// state-store pattern (read → mutate → writeFileAtomic).
function updateInvariantFiringLog(rootDir, results) {
  const wsDir = path.join(rootDir, '.claude', 'workstream');
  if (!fs.existsSync(wsDir)) return; // not a workstream-bearing repo
  const metaDir = path.join(wsDir, 'meta');
  if (!fs.existsSync(metaDir)) fs.mkdirSync(metaDir, { recursive: true });
  const logPath = path.join(metaDir, 'invariant-firing-log.yaml');

  let data = { schema_version: 1, invariants: {} };
  if (fs.existsSync(logPath)) {
    const r = readYAMLFile(logPath);
    if (r.ok && r.data && r.data.invariants) data = r.data;
    if (!data.invariants) data.invariants = {};
  }

  const today = todayISO();
  for (const r of results) {
    const id = r.id;
    if (!id) continue;
    const prior = data.invariants[id] || {
      consecutive_failures: 0,
      first_failed_at: null,
      last_failed_at: null,
      last_status: null,
      threshold: 5,
      migration_ws_id: null,
    };
    if (r.passed) {
      // Reset counter on PASS. Preserve migration_ws_id if already escalated.
      data.invariants[id] = {
        ...prior,
        consecutive_failures: 0,
        last_status: 'PASS',
        last_failed_at: prior.last_failed_at,
      };
    } else {
      const newCount = (prior.consecutive_failures || 0) + 1;
      data.invariants[id] = {
        ...prior,
        consecutive_failures: newCount,
        first_failed_at: prior.first_failed_at || today,
        last_failed_at: today,
        last_status: 'FAIL',
      };
    }
  }

  const yaml = serializeFiringLog(data);
  // WS-678: durable state, rewritten on essentially every /verify run, and read
  // by tooling (cwos-migrate-watch.js) while verify writes it. writeFileAtomic
  // publishes via tmp+rename with an fsync first, retries the Win32 EPERM a
  // concurrent reader causes, and degrades to the in-place durable rewrite if a
  // pinned handle blocks the rename outright — so this cannot be less available
  // than the raw write it replaces.
  writeFileAtomic(logPath, yaml);
}

function serializeFiringLog(data) {
  const out = [`schema_version: ${data.schema_version || 1}`, 'invariants:'];
  const ids = Object.keys(data.invariants || {}).sort();
  for (const id of ids) {
    const e = data.invariants[id];
    out.push(`  ${id}:`);
    out.push(`    consecutive_failures: ${e.consecutive_failures || 0}`);
    out.push(`    first_failed_at: ${e.first_failed_at ? `"${e.first_failed_at}"` : 'null'}`);
    out.push(`    last_failed_at: ${e.last_failed_at ? `"${e.last_failed_at}"` : 'null'}`);
    out.push(`    last_status: ${e.last_status ? `"${e.last_status}"` : 'null'}`);
    out.push(`    threshold: ${e.threshold || 5}`);
    out.push(`    migration_ws_id: ${e.migration_ws_id ? `"${e.migration_ws_id}"` : 'null'}`);
  }
  return out.join('\n') + '\n';
}

function updateLastVerifiedDates(rootDir, results) {
  const invPath = path.join(rootDir, 'system/invariants.md');
  if (!fs.existsSync(invPath)) return;
  let content = fs.readFileSync(invPath, 'utf8');
  const today = todayISO();
  for (const r of results) {
    if (!r.passed) continue;
    // Find the section for this invariant and update its Last Verified date
    const sectionRegex = new RegExp(
      `(### ${r.id}:[\\s\\S]*?\\*\\*Last Verified:\\*\\*\\s*)\\d{4}-\\d{2}-\\d{2}`,
      'g'
    );
    content = content.replace(sectionRegex, `$1${today}`);
  }
  // WS-678: system/invariants.md is durable state and one of the most
  // frequently rewritten files in the repo. Same reasoning as the firing log
  // above — atomic publish, fsync before rename, Win32 contention handled.
  writeFileAtomic(invPath, content);
  emitEvent('T11:vital-signs', 'invariants-stamped', {
    path: path.relative(process.cwd(), invPath).replace(/\\/g, '/'),
    stamped_count: results.filter((r) => r.passed).length,
  });
}

// INV-037: Sprint anchor distribution bound. Counts anchors of completed
// sprints in the last 90 days by program category. Fails if internal-infra
// programs anchor more than 70% — the threshold above which CWOS is
// optimizing CWOS instead of serving the fleet (FAIL-009 / Failed State #10).
//
// Scope rules (must stay in sync with /next Step 3a-rotation):
//   - fleet/repo-goal: anchor's program is fleet-health, OR files_involved
//     touches fleet/, kit/MANIFEST.yaml, engines/INDEX.md, or
//     kit/templates/workstream/engines/registry.yaml.
//   - internal-infra: every other program.
//
// Override path: a sprint can carry override_class: "internal-investment-phase"
// in its YAML to be excluded from the rolling window (with rationale recorded
// in override_reason). The override is the founder's escape valve for
// legitimate periods of pure kit work.
//
// Source: FAIL-009 + FAIL-011 / WS-230 / premortem-2026-04-25 (Compound A).
function checkAnchorDistribution(rootDir) {
  const sprintsDir = path.join(rootDir, '.claude/workstream/sprints');
  if (!fs.existsSync(sprintsDir)) return { passed: true, detail: 'sprints/ not found — nothing to check' };

  const queueDir = path.join(rootDir, '.claude/workstream/queue');
  const archiveDir = path.join(queueDir, 'archive');

  // Window: 90 days, ending today.
  const today = new Date(todayISO() + 'T00:00:00Z');
  const windowStart = new Date(today);
  windowStart.setUTCDate(windowStart.getUTCDate() - 90);

  // Collect sprint files (active + archive)
  const sprintFiles = [
    ...globFiles(sprintsDir, 'SPR-*.yaml'),
    ...(fs.existsSync(path.join(sprintsDir, 'archive'))
      ? globFiles(path.join(sprintsDir, 'archive'), 'SPR-*.yaml')
      : []),
  ];

  const FLEET_PROGRAMS = new Set(['fleet-health']);
  const FLEET_FILE_PATTERNS = [
    /^fleet\//,
    /^kit\/MANIFEST\.yaml$/,
    /^engines\/INDEX\.md$/,
    /^kit\/templates\/workstream\/engines\/registry\.yaml$/,
  ];

  function classifyAnchor(anchorItemFile) {
    if (!fs.existsSync(anchorItemFile)) return null;
    const r = readYAMLFile(anchorItemFile);
    if (!r.ok) return null;
    const program = r.data.program;
    if (program && FLEET_PROGRAMS.has(program)) return 'fleet';
    const files = Array.isArray(r.data.files_involved) ? r.data.files_involved : [];
    for (const f of files) {
      const norm = String(f).replace(/\\/g, '/').replace(/\s.*$/, '').trim();
      for (const pat of FLEET_FILE_PATTERNS) {
        if (pat.test(norm)) return 'fleet';
      }
    }
    return 'internal';
  }

  let fleet = 0;
  let internal = 0;
  let overrides = 0;
  let inWindow = 0;
  const sampleAnchors = []; // for detail output

  for (const sf of sprintFiles) {
    const r = readYAMLFile(sf);
    if (!r.ok) continue;
    const data = r.data;
    if (data.status !== 'completed') continue;

    // Window cutoff: prefer completed_at, fall back to approved_at, then created_at.
    const dateStr = data.completed_at || data.approved_at || data.created_at;
    if (!dateStr) continue;
    const dateOnly = String(dateStr).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) continue;
    const sprintDate = new Date(dateOnly + 'T00:00:00Z');
    if (sprintDate < windowStart || sprintDate > today) continue;
    inWindow++;

    // Override path: legitimate-internal-investment phase
    if (data.override_class === 'internal-investment-phase') {
      overrides++;
      continue;
    }

    if (!Array.isArray(data.items) || data.items.length === 0) continue;
    const anchorId = data.items[0].id;
    if (!anchorId) continue;

    const queueFile = fs.existsSync(path.join(queueDir, `${anchorId}.yaml`))
      ? path.join(queueDir, `${anchorId}.yaml`)
      : path.join(archiveDir, `${anchorId}.yaml`);

    const cls = classifyAnchor(queueFile);
    if (cls === 'fleet') fleet++;
    else if (cls === 'internal') internal++;
    else continue; // unclassifiable — don't count
    sampleAnchors.push({ sprint: data.id, anchor: anchorId, cls });
  }

  const counted = fleet + internal;
  if (counted === 0) {
    return {
      passed: true,
      detail: `No completed sprints with classifiable anchors in last 90 days (${inWindow} in window, ${overrides} overrides) — nothing to check`,
    };
  }

  const internalPct = internal / counted;
  const THRESHOLD = 0.70;
  if (internalPct > THRESHOLD) {
    return {
      passed: false,
      detail: `Internal-infra anchored ${internal}/${counted} (${(internalPct * 100).toFixed(0)}%) of last 90d sprints — exceeds ${(THRESHOLD * 100).toFixed(0)}% bound. CWOS is optimizing itself faster than it's serving the fleet. Run /next will surface fleet-rotation suggestions; or set override_class: internal-investment-phase on sprints if intentional.`,
    };
  }
  return {
    passed: true,
    detail: `Internal-infra anchored ${internal}/${counted} (${(internalPct * 100).toFixed(0)}%); fleet anchored ${fleet}/${counted} (${(fleet / counted * 100).toFixed(0)}%) — within ${(THRESHOLD * 100).toFixed(0)}% bound (${overrides} sprint(s) excluded via override_class)`,
  };
}

// ─── INV-041: capability_brief schema (FAIL-016 / WS-166) ──────────────────
// Every product program (not monitor_only) ships a capability_brief block
// conforming to the schema in prog-template.yaml. This closes the "no silent
// install" loop (feedback_no_silent_install_no_user_invention; ADR-028) at
// the schema layer — programs cannot be added without a founder-facing brief.
function checkCapabilityBriefSchema(rootDir) {
  const validatorPath = path.join(rootDir, 'kit', 'scripts', 'cwos-program-schema-validate.js');
  if (!fs.existsSync(validatorPath)) {
    return { passed: true, detail: 'cwos-program-schema-validate.js not present — INV-041 N/A (pre-WS-166)' };
  }
  const { execFileSync } = require('child_process');

  // WS-560: the validator exits 1 when it FINDS violations — correct CLI
  // behaviour, and exactly what ADR-063 asks of these scripts. execFileSync
  // throws on any non-zero exit, so the previous `catch` swallowed every real
  // violation and reported "validator threw ... INV-041 cannot run" instead.
  // The invariant was reporting itself broken while the validator was working
  // perfectly and naming a genuine problem (prog-security shipping 6
  // problems_prevented against a 3-5 schema).
  //
  // A non-zero exit whose stdout is still parseable JSON is a RESULT. Only an
  // unparseable one is a crash.
  let result = null;
  let crash = null;
  try {
    result = JSON.parse(execFileSync('node', [validatorPath, '--quiet'], { cwd: rootDir, encoding: 'utf8' }));
  } catch (err) {
    try {
      result = JSON.parse(err.stdout || '');
    } catch {
      crash = err;
    }
  }
  if (crash) {
    return { passed: false, detail: `capability_brief validator crashed (no parseable output): ${crash.message}. INV-041 cannot run.` };
  }

  if (result.ok) {
    return { passed: true, detail: `${result.programs_checked} product program(s) all ship valid capability_brief (${result.programs_skipped} skipped: monitor_only or template)` };
  }
  const sample = result.failures.slice(0, 3).map(f => `${f.program}: ${f.errors[0]}`).join('; ');
  return {
    passed: false,
    detail: `${result.failures.length} program(s) failed capability_brief schema: ${sample}${result.failures.length > 3 ? ` (+${result.failures.length - 3} more)` : ''}. Run \`node kit/scripts/cwos-program-schema-validate.js\` for full output.`,
  };
}

// ─── INV-043: CLI-bypass-via-command (FIND-119 / WS-276) ───────────────────
//
// FIND-119 (filed 2026-05-01 during WS-259 audit) measured AI bypassing the
// command envelope: across 10 days of event log, all 10 audited procedural
// commands had 0 invocations while /next had 26. The AI was reading
// prog-*.yaml directly instead of invoking /pulse, etc., defeating ADR-037's
// projected token savings.
//
// This INV reads envelope state — populated by command_started/command_completed
// events — and surfaces sustained bypass: ≥3 of the audited commands at zero
// invocations across a 30-day window AND total envelope traffic ≥ 20 events
// (so we don't flag a quiet repo). The mechanism is observability — no hard
// binding here. Mechanism 3 (env-var on script entry points) is documented
// as the escalation path in ADR-037 if this signal stays red.
//
// Replay-pure: derives entirely from envelope state, which is reducer-built
// from the event log per ADR-018/ADR-020.
function checkCliBypassViaCommand(rootDir) {
  const wsDir = path.join(rootDir, '.claude', 'workstream');
  if (!fs.existsSync(wsDir)) {
    return { passed: true, detail: 'no .claude/workstream — INV-043 N/A' };
  }

  let store;
  try {
    const ss = require('./core/state-store');
    store = ss.loadState(wsDir);
  } catch (err) {
    return { passed: true, detail: `state-store unavailable (pre-step-2 repo): ${err.message}. INV-043 N/A` };
  }

  const items = store.envelope.all();
  if (!Array.isArray(items)) {
    return { passed: true, detail: 'envelope items not iterable — INV-043 N/A' };
  }

  // Window: last 30 days from "today". Use the most recent completed_at as
  // the clock anchor so the check is replay-stable (Date.now() would not be).
  const completedAts = items
    .map((it) => it && it.completed_at)
    .filter((s) => typeof s === 'string' && s.length > 0)
    .sort();
  if (completedAts.length === 0) {
    return { passed: true, detail: 'no completed envelope events — INV-043 deferred (no traffic to audit)' };
  }
  const latest = new Date(completedAts[completedAts.length - 1]);
  const windowStart = new Date(latest.getTime() - 30 * 24 * 60 * 60 * 1000);

  const inWindow = items.filter((it) => {
    if (!it || !it.completed_at) return false;
    const t = new Date(it.completed_at);
    return !isNaN(t.getTime()) && t >= windowStart;
  });

  // Sparse-data guard: don't flag if traffic is too low to be meaningful.
  if (inWindow.length < 20) {
    return {
      passed: true,
      detail: `only ${inWindow.length} envelope events in 30-day window (threshold: 20) — INV-043 deferred until more traffic accumulates`,
    };
  }

  // Audited watchlist: commands whose existence was the basis of FIND-119.
  // The 5 "load-bearing-must-fire" set is what triggers the finding.
  const REQUIRED = ['/pulse', '/audit', '/verify', '/workstream', '/decide'];
  const counts = Object.create(null);
  for (const tag of REQUIRED) counts[tag] = 0;
  for (const it of inWindow) {
    if (it && typeof it.tag === 'string' && counts[it.tag] !== undefined) counts[it.tag]++;
  }
  const zeros = REQUIRED.filter((tag) => counts[tag] === 0);

  // Trigger: ≥3 of the 5 required commands at zero invocations.
  if (zeros.length >= 3) {
    const summary = REQUIRED.map((t) => `${t}=${counts[t]}`).join(', ');
    return {
      passed: false,
      detail: `command-envelope bypass: ${zeros.length}/5 required commands at zero invocations across 30-day window (${inWindow.length} total events). Counts: ${summary}. Route a finding to prog-self-compliance — Mechanism 3 (hard env-var binding) escalation criterion: this remaining red after 30 more days.`,
    };
  }

  return {
    passed: true,
    detail: `command envelope holding: ${zeros.length}/5 required commands at zero invocations (threshold: 3). Window: ${inWindow.length} events.`,
  };
}

// ─── INV-cli-envelope-consumed-completely (WS-271) ────────────────────────

/**
 * Reads tool_rounds_by_type.Read from recent /next envelope items and
 * flags any invocation exceeding the per-invocation Read threshold
 * (default 5; tunable via .cwos-config.yaml read_restraint.per_invocation_max).
 *
 * Founder-acknowledged invocations (via /next gate --override-read-restraint
 * "<rationale>") are skipped. The acknowledgment event carries the next
 * /next's command_id_anticipated, OR a generic "next-N-invocations" scope.
 * For simplicity v1: acknowledgment skips ALL violations within a 1-hour
 * window after the ack event.
 *
 * Per AS-037-1, fleet-rollout success = median /next Read count ≤ 3 over
 * 5 invocations. This INV catches per-invocation excess (> 5) on the
 * spot — the median test runs separately as a follow-up after enough
 * data accumulates.
 *
 * Source: ADR-037 Top Risk #1 + Decision #4 + AS-037-1 / WS-271 / SPR-108.
 */

/**
 * INV-045 — Shell-safe pattern (ADR-043 / WS-306).
 *
 * Scans every .js file under kit/scripts/ (excluding __tests__/ and
 * lib/shell-safe.js itself) for unsafe `execSync` call-sites:
 *   1. execSync called with a template literal whose body contains ${...}
 *      interpolation (string interpolation reaches the shell).
 *   2. child_process.exec called in callback form (also unsafe; runs
 *      through a shell).
 *
 * Any hit is a violation. Migrate the call to kit/scripts/lib/shell-safe.js.
 */
function checkShellSafePattern(rootDir) {
  const scriptsDir = path.join(rootDir, 'kit', 'scripts');
  if (!fs.existsSync(scriptsDir)) {
    return { passed: true, detail: 'no kit/scripts/ — INV-045 N/A' };
  }
  const violations = [];
  const skipPaths = [
    path.join('kit', 'scripts', '__tests__'),
    path.join('kit', 'scripts', 'lib', 'shell-safe.js'),
  ];
  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      const rel = path.relative(rootDir, full);
      if (skipPaths.some(s => rel.startsWith(s))) continue;
      if (ent.isDirectory()) walk(full);
      else if (ent.isFile() && ent.name.endsWith('.js')) {
        const text = fs.readFileSync(full, 'utf8');
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // Lines may opt out via an inline `shell-safe-skip` comment when
          // the line is the validator's own regex or a documented exception.
          if (/shell-safe-skip/.test(line)) continue;
          // Match unsafe template-literal interpolation in execSync call-sites. // shell-safe-skip
          if (/execSync\s*\(\s*`[^`]*\$\{/.test(line)) { // shell-safe-skip
            violations.push(`${rel}:${i + 1}: execSync with template-literal interpolation`);
          }
          // Match exec(...) callback form (not execSync) — common alias. // shell-safe-skip
          if (/[^a-zA-Z]exec\s*\(\s*`[^`]*\$\{/.test(line)) { // shell-safe-skip
            violations.push(`${rel}:${i + 1}: child_process.exec with template-literal interpolation`);
          }
        }
      }
    }
  }
  walk(scriptsDir);
  if (violations.length === 0) {
    return { passed: true, detail: 'No unsafe execSync interpolation under kit/scripts/' };
  }
  return {
    passed: false,
    detail: `${violations.length} unsafe shell-out site(s) — migrate to kit/scripts/lib/shell-safe.js (ADR-043):\n  ${violations.slice(0, 10).join('\n  ')}${violations.length > 10 ? `\n  ... +${violations.length - 10} more` : ''}`,
  };
}

function checkReadRestraint(rootDir) {
  const wsDir = path.join(rootDir, '.claude', 'workstream');
  if (!fs.existsSync(wsDir)) {
    return { passed: true, detail: 'no .claude/workstream — INV-cli-envelope-consumed-completely N/A' };
  }

  // Threshold tuning
  const configPath = path.join(rootDir, '.cwos-config.yaml');
  let max = 5;
  try {
    if (fs.existsSync(configPath)) {
      const { readYAMLFile } = require('./lib/cwos-utils');
      const r = readYAMLFile(configPath);
      if (r.ok && r.data && r.data.read_restraint && typeof r.data.read_restraint.per_invocation_max === 'number') {
        max = r.data.read_restraint.per_invocation_max;
      }
    }
  } catch { /* fall through to default */ }

  let store;
  try {
    const ss = require('./core/state-store');
    store = ss.loadState(wsDir);
  } catch (err) {
    return { passed: true, detail: `state-store unavailable (pre-step-2 repo): ${err.message}. INV N/A` };
  }

  const items = store.envelope.all();
  if (!Array.isArray(items)) {
    return { passed: true, detail: 'envelope items not iterable — INV N/A' };
  }

  // Filter for /next invocations with tool_rounds_by_type populated.
  // WS-271 telemetry extension is brand-new — pre-existing invocations
  // have no tool_rounds_by_type field. Skip them silently.
  const nextRuns = items.filter((it) =>
    it && it.tag === '/next' &&
    it.tool_rounds_by_type && typeof it.tool_rounds_by_type === 'object' &&
    it.completed_at
  );

  if (nextRuns.length === 0) {
    return { passed: true, detail: `no /next invocations with tool_rounds_by_type telemetry yet — INV deferred until WS-271 telemetry coverage accumulates` };
  }

  // Acknowledgments: load all read_restraint_acknowledged events and treat
  // any /next invocation that completed within 1 hour AFTER an ack as
  // exempt. v1 keeps the matching loose; tightening per-command_id is a
  // follow-up.
  const ACK_WINDOW_MS = 60 * 60 * 1000;
  let allEvents = [];
  try {
    const eventsMod = require('./core/events');
    const r = eventsMod.readAllChunks(wsDir);
    allEvents = r.events || [];
  } catch { /* event log unreadable — proceed with empty acks */ }
  const ackTimestamps = allEvents
    .filter((ev) => ev && ev.payload && ev.payload.type === 'read_restraint_acknowledged')
    .map((ev) => ev.timestamp)
    .filter((t) => typeof t === 'string')
    .map((t) => new Date(t).getTime())
    .filter((t) => !isNaN(t));

  function isAcknowledged(item) {
    const t = new Date(item.completed_at).getTime();
    if (isNaN(t)) return false;
    return ackTimestamps.some((ackT) => t >= ackT && t - ackT <= ACK_WINDOW_MS);
  }

  // WS-560 — sensor cutover. Until 2026-08-02, scanFromBoundary in
  // cwos-stop-telemetry.js counted tool calls from the session's LAST slash
  // command to the end of the transcript, so everything the session did after
  // a /next was billed to that /next. Every one of this invariant's four
  // standing violations was that artifact — one reported Read=25 for a session
  // that ran /next and then worked for hours. The scan is now bounded at the
  // next genuine user turn (+7 tests), but the bad measurements are already in
  // a hash-chained append-only log and cannot be rewritten.
  //
  // Enforcing a threshold against readings from a sensor known to be broken
  // does not measure compliance, it just keeps the light red. Same treatment
  // INV-053 gives its pre-cutover findings: exempt, counted, and named.
  const SENSOR_CUTOVER = '2026-08-02';
  const preCutover = nextRuns.filter(i => String(i.completed_at || '') < SENSOR_CUTOVER);
  const measurable = nextRuns.filter(i => String(i.completed_at || '') >= SENSOR_CUTOVER);

  const violations = [];
  for (const inv of measurable) {
    if (isAcknowledged(inv)) continue;
    const reads = (inv.tool_rounds_by_type && typeof inv.tool_rounds_by_type.Read === 'number') ? inv.tool_rounds_by_type.Read : 0;
    if (reads > max) {
      violations.push({ command_id: inv.command_id, reads, completed_at: inv.completed_at });
    }
  }

  const exemptNote = preCutover.length
    ? ` (${preCutover.length} pre-${SENSOR_CUTOVER} invocation(s) exempt — measured by the unbounded sensor WS-560 fixed)`
    : '';

  if (violations.length === 0) {
    return {
      passed: true,
      detail: measurable.length === 0
        ? `no post-${SENSOR_CUTOVER} /next telemetry yet — awaiting readings from the corrected sensor${exemptNote}`
        : `clean — ${measurable.length} /next invocation(s) all ≤ ${max} Reads${exemptNote}`,
    };
  }

  const summary = violations.slice(0, 3).map((v) => `${v.command_id}=${v.reads}`).join(', ');
  return {
    passed: false,
    detail: `${violations.length} /next invocation(s) exceeded ${max} Read tool calls (per-invocation threshold). Examples: ${summary}. Findings should be routed to prog-kit-quality with dedup_key read-restraint-<command_id>. Founder may acknowledge legitimate re-reads via /next gate --override-read-restraint "<rationale ≥20 chars>".`,
  };
}

// ─── INV-046: Persona-dispatch runtime audit (WS-316 / ADR-044) ─────────────
//
// Lagging-indicator that catches dispatch regressions by reading production
// manifests. Pass when no engine reports FAIL — WARN (no production runs yet)
// and STALE (pre-anchor evidence) do not block. The remedy for STALE is to
// re-run the affected engine; the remedy for WARN is to run the engine for
// the first time. /verify only fails on real FAILs.

let _runtimeDispatchAudit = null;
try { _runtimeDispatchAudit = require('./cwos-runtime-dispatch-audit'); } catch { /* optional */ }

function checkPersonaDispatch(rootDir) {
  if (!_runtimeDispatchAudit) {
    return { passed: true, detail: 'cwos-runtime-dispatch-audit.js not present (WS-316 not adopted) — skipping' };
  }
  let wsDir;
  try { wsDir = findWorkstreamDir(rootDir); }
  catch { return { passed: true, detail: '.claude/workstream/ not found — skipping' }; }

  const result = _runtimeDispatchAudit.audit({
    wsDir,
    engines: _runtimeDispatchAudit.DEFAULT_TRACKED_ENGINES,
    minBytes: _runtimeDispatchAudit.DEFAULT_MIN_BYTES,
    anchor: _runtimeDispatchAudit.ADR_044_ANCHOR,
  });

  const summary = `${result.pass} PASS, ${result.warn} WARN, ${result.stale || 0} STALE, ${result.fail} FAIL across ${result.tracked_engines.length} tracked engine(s)`;

  if (result.fail === 0) {
    const stalePart = (result.stale || 0) > 0
      ? ` (${result.stale} stale — re-run the engine to verify post-ADR-044 dispatch)`
      : '';
    return { passed: true, detail: `${summary}${stalePart}` };
  }

  const failingEngines = result.results
    .filter(r => r.status === 'FAIL')
    .map(r => `${r.engine} (${r.most_recent_run}): ${r.failures.slice(0, 2).join('; ')}`)
    .slice(0, 3)
    .join(' | ');
  return {
    passed: false,
    detail: `${summary}. Failing engines: ${failingEngines}. Re-run via /engine <engine> on a tiny target to refresh dispatch evidence; or inspect: node kit/scripts/cwos-runtime-dispatch-audit.js`,
  };
}

// INV-readpath-determinism (WS-391): AI must not be invoked for pure read-path
// work; a parse-and-compare phase ships as a script. Detector is heuristic, so
// this is ADVISORY (always passes) — it surfaces the conversion backlog as a
// visible count rather than hard-failing. Route to prog-token-economy. The
// remedy is to convert the flagged section to a cwos-* script or annotate it
// `<!-- readpath-ok: <reason> -->`.
let _readpathLint = null;
try { _readpathLint = require('./cwos-readpath-lint'); } catch { /* optional */ }

function checkReadPathDeterminism(rootDir) {
  if (!_readpathLint) {
    return { passed: true, detail: 'cwos-readpath-lint.js not present (WS-391 not adopted) — skipping' };
  }
  let result;
  try { result = _readpathLint.lint({ root: rootDir }); }
  catch (e) { return { passed: true, detail: `readpath-lint not runnable: ${e.message} — advisory skipped` }; }

  if (result.count === 0) {
    return { passed: true, detail: 'no un-scripted mechanical read-path engine sections' };
  }
  const top = result.candidates.slice(0, 3)
    .map(c => `${c.engine}:${c.line} [${c.triggers.join('/')}]`)
    .join(' | ');
  return {
    passed: true, // ADVISORY — never blocks
    detail: `ADVISORY: ${result.count} engine section(s) still do mechanical read-work without a script (convert to cwos-* or annotate readpath-ok). e.g. ${top}`,
  };
}

// ─── INV-047: Program YAML schema (FIND-128 / WS-295) ─────────────────────
//
// Detects duplicate top-level keys in `.claude/workstream/programs/prog-*.yaml`
// and `kit/templates/workstream/programs/prog-*.yaml`. The CWOS YAML parser
// (and most YAML parsers) silently picks the last value when duplicate keys
// appear at the same level, hiding the corruption. FIND-128 surfaced 22 days
// after a prog-engine-reliability.yaml hand-edit produced three duplicated
// `health_breakdown` blocks with conflicting values — the file parsed fine,
// /pulse rendered the last block, the conflict was invisible.
//
// Scope: top-level (column-0) keys only. Nested-block duplicate detection
// requires AST-level YAML parsing that the CWOS parser doesn't expose; the
// FIND-128 failure mode was top-level, and that's what this check guards.
function checkProgramYamlSchema(rootDir) {
  const scanDirs = [
    path.join(rootDir, '.claude/workstream/programs'),
    path.join(rootDir, 'kit/templates/workstream/programs'),
  ].filter(d => fs.existsSync(d));

  const violations = [];

  function scanFile(filePath) {
    const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');

    // Layer 1 — top-level scan via regex. Catches the FIND-128 sibling case
    // where a hand-edit appends a second `health_breakdown:` block at column 0.
    let content;
    try { content = fs.readFileSync(filePath, 'utf8'); } catch { return; }
    const lines = content.split('\n');
    const seen = new Map(); // key -> array of line numbers (1-indexed)
    const KEY_RE = /^([A-Za-z_][A-Za-z0-9_]*):\s*(?:#.*)?$|^([A-Za-z_][A-Za-z0-9_]*):\s+\S/;
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (/^\s*(?:#|$)/.test(line)) continue;
      if (/^[ \t]/.test(line)) continue;
      const m = line.match(KEY_RE);
      if (!m) continue;
      const key = m[1] || m[2];
      if (!key) continue;
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key).push(i + 1);
    }
    for (const [key, lineNums] of seen) {
      if (lineNums.length > 1) {
        violations.push(`${rel}: duplicate top-level key '${key}' at lines ${lineNums.join(', ')}`);
      }
    }

    // Layer 2 — nested-block scan via parser warnings. The actual FIND-128
    // failure was three duplicated sub-blocks INSIDE `health_breakdown:`. Each
    // duplicated nested key (e.g. `finding_health` appearing twice under
    // `health_breakdown`) shows up as a `duplicate_key:<name>` warning emitted
    // by parseMapping (WS-295 parser change). Layer 1 misses these because
    // they are indented; Layer 2 catches them.
    const parsed = readYAMLFile(filePath);
    if (parsed.warnings && parsed.warnings.length > 0) {
      for (const w of parsed.warnings) {
        if (typeof w.reason === 'string' && w.reason.startsWith('duplicate_key:')) {
          violations.push(`${rel}: ${w.reason} at line ${w.line}`);
        }
      }
    }
  }

  for (const dir of scanDirs) {
    let entries;
    try { entries = fs.readdirSync(dir); } catch { continue; }
    for (const e of entries) {
      if (!/^prog-.+\.ya?ml$/.test(e)) continue;
      scanFile(path.join(dir, e));
    }
  }

  return {
    passed: violations.length === 0,
    detail: violations.length === 0
      ? `All program YAMLs have unique top-level keys`
      : `${violations.length} violation(s): ${violations.slice(0, 3).join('; ')}${violations.length > 3 ? '; ...' : ''}`,
  };
}

// ─── INV-preflight-gate-not-bypassed (WS-433 / FIND-305) ─────────────────────
//
// ADVISORY. The single-question pre-flight gate lives in cwos-frame.js confirm;
// it refuses an engine_intent_recorded whose prompted fields weren't each
// individually acked. This invariant is the defensive backstop: it scans recent
// engine_intent_recorded events and flags any whose `preflight_acked_fields`
// marker lists fields with NO matching engine_field_acked event in the same
// pre-flight cycle — i.e. a marker written without the acks behind it (the gate
// leaked). Founder-forced confirms (preflight_forced) are accounted, not flagged.
// Never hard-fails (a false signal must not block session start); surfaces at
// session start via WS-429 fast-mode.

function readVerifyEventTail(eventsDir, maxEvents) {
  if (!fs.existsSync(eventsDir)) return [];
  const files = fs.readdirSync(eventsDir).filter((f) => f.endsWith('.jsonl')).sort();
  const events = [];
  for (let i = files.length - 1; i >= 0 && events.length < maxEvents; i--) {
    const text = fs.readFileSync(path.join(eventsDir, files[i]), 'utf8');
    const lines = text.split('\n').filter(Boolean);
    for (let j = lines.length - 1; j >= 0 && events.length < maxEvents; j--) {
      try { events.unshift(JSON.parse(lines[j])); } catch (_) { /* skip */ }
    }
  }
  return events;
}

function checkPreflightGateNotBypassed(rootDir) {
  const eventsDir = path.join(rootDir, '.claude', 'workstream', 'events');
  if (!fs.existsSync(eventsDir)) return { passed: true, detail: 'no event log — N/A' };
  const events = readVerifyEventTail(eventsDir, 500);
  const recordedCount = events.filter((e) => e && e.payload && e.payload.type === 'engine_intent_recorded').length;
  if (recordedCount === 0) return { passed: true, detail: 'no engine_intent_recorded events — nothing to audit' };

  let acked = 0, forced = 0, bare = 0;
  const anomalies = [];
  for (let idx = 0; idx < events.length; idx++) {
    const e = events[idx];
    if (!(e && e.payload && e.payload.type === 'engine_intent_recorded')) continue;
    const p = e.payload;
    if (p.preflight_forced) { forced++; continue; }
    if (Array.isArray(p.preflight_acked_fields) && p.preflight_acked_fields.length > 0) {
      acked++;
      // Gather acks for this engine in the cycle: after the prior recorded
      // intent for the same engine, before this one.
      let priorIdx = -1;
      for (let k = idx - 1; k >= 0; k--) {
        const pe = events[k];
        if (pe && pe.payload && pe.payload.type === 'engine_intent_recorded' && pe.payload.engine === p.engine) { priorIdx = k; break; }
      }
      const cycleAcks = new Set();
      for (let k = priorIdx + 1; k < idx; k++) {
        const ae = events[k];
        if (ae && ae.payload && ae.payload.type === 'engine_field_acked' && ae.payload.engine === p.engine && ae.payload.field) cycleAcks.add(ae.payload.field);
      }
      const missing = p.preflight_acked_fields.filter((f) => !cycleAcks.has(f));
      if (missing.length > 0) anomalies.push(`${p.contract_id || e.id}: claims acked [${p.preflight_acked_fields.join(',')}] but no ack event for [${missing.join(',')}]`);
    } else {
      bare++; // full-confidence (no field prompts) or pre-WS-433
    }
  }

  if (anomalies.length > 0) {
    return {
      passed: true, // ADVISORY — never blocks
      detail: `ADVISORY: ${anomalies.length} engine_intent_recorded event(s) carry a pre-flight ack marker with no matching ack event — the gate may have leaked. e.g. ${anomalies.slice(0, 2).join(' | ')}`,
    };
  }
  return {
    passed: true,
    detail: `clean — ${recordedCount} recorded intent(s): ${acked} ack-gated, ${forced} founder-forced, ${bare} full-confidence/pre-WS-433.`,
  };
}

// ─── INV-093: no WS id minted here names different work on the remote ───────
//
// Issue #26, measured 2026-09-17. HomeBase runs on two nodes (ADR-057) and both
// run the unattended sweeps. Each minted WS-844..851 from its own directory
// listing, for eight different work items. Nothing failed: the G16's HomeBase
// simply could not pull any more ("untracked working tree files would be
// overwritten"), nothing reported that, and a cross-reference to "WS-846" meant
// a different thing on each machine. A later sweep minted two more on top.
//
// lib/remote-ids.js now keeps a node that is merely BEHIND from minting over
// published ids. Two nodes minting while neither has pushed is not visible from
// either machine until one of them fetches — which is here. The check is the
// detector; the failure text names the command that repairs.
//
// Classification (collision vs duplicate) lives in lib/id-collision.js and is
// the same code `cwos-id-collision.js --repair` acts on, so the gate and the
// fix cannot disagree about what is wrong.
function checkWsIdCollisionWithRemote(rootDir) {
  let wsDir;
  try { wsDir = findWorkstreamDir(rootDir); }
  catch { return { passed: true, detail: 'no workstream dir — N/A' }; }

  let d;
  try {
    const { detectCollisions } = require('./lib/id-collision');
    // Short timeout: this runs at SessionStart, and an offline node must cost
    // seconds, not the fast-mode budget (INV-070).
    d = detectCollisions(wsDir, { timeoutMs: 6000 });
  } catch (e) {
    return { passed: true, detail: `collision detection unavailable — N/A (${e.message})` };
  }
  if (!d.applicable) return { passed: true, detail: `${d.reason} — N/A` };

  const staleDays = typeof d.fetch_age_ms === 'number' ? d.fetch_age_ms / 86400000 : null;
  const staleNote = d.fetch && d.fetch.error
    ? ` (fetch failed${staleDays !== null ? `; remote view is ${staleDays.toFixed(1)}d old` : ''}: ${String(d.fetch.error).split('\n')[0].slice(0, 120)})`
    : '';

  const n = d.collisions.length + d.duplicates.length;
  if (n === 0) {
    return { passed: true, detail: `no local WS id clashes with ${d.ref} (remote high-water WS-${d.remote_max})${staleNote}` };
  }
  const parts = [
    ...d.collisions.map((c) => `${c.id} COLLISION (here: "${String(c.local_title || '').slice(0, 50)}" / remote: "${String(c.remote_title || '').slice(0, 50)}")`),
    ...d.duplicates.map((x) => `${x.id} DUPLICATE of remote ${x.survivor}`),
  ];
  return {
    passed: false,
    detail: `${d.collisions.length} collision(s), ${d.duplicates.length} duplicate(s) against ${d.ref}${staleNote} — this repo cannot pull until they move: ${parts.slice(0, 4).join('; ')}${parts.length > 4 ? `; +${parts.length - 4} more` : ''}. Fix: node kit/scripts/cwos-id-collision.js --repair`,
  };
}

// ─── INV-090: one contract per open run (WS-472 / FIND-122 sub-5) ─────────
//
// ADVISORY, and for the same reason as its sibling above: the enforcement is
// the `cwos-frame.js confirm` gate, which refuses a second contract while one
// for the same (engine, target) is open and inside the TTL. This is the
// backstop that catches a LEAK — an engine_intent_recorded that landed on top
// of an open one without the `amends_contract_id` marker a --amend confirm
// stamps. Founder-forced amendments are accounted, not flagged.
//
// The TTL is read from .cwos-config.yaml frame.open_contract_ttl_hours so the
// audit and the gate cannot disagree about what "open" means. A pair further
// apart than the TTL is not a leak: the gate deliberately lets an abandoned
// contract age out (11 of 26 live runs never emit a completion event).
//
// AS-472-1 (recorded, not hidden): engine_run_completed carries engine_id but
// no target, so closure is engine-scoped. Two concurrent runs of one engine on
// different targets can over-close. Never hard-fails.

function inv090TtlMs(rootDir) {
  const DEFAULT_HOURS = 6;
  try {
    const cfg = path.join(rootDir, '.cwos-config.yaml');
    if (!fs.existsSync(cfg)) return DEFAULT_HOURS * 3600 * 1000;
    const m = fs.readFileSync(cfg, 'utf8').match(/^\s*open_contract_ttl_hours:\s*([0-9.]+)/m);
    if (!m) return DEFAULT_HOURS * 3600 * 1000;
    return parseFloat(m[1]) * 3600 * 1000;
  } catch { return DEFAULT_HOURS * 3600 * 1000; }
}

function checkOneContractPerOpenRun(rootDir) {
  const eventsDir = path.join(rootDir, '.claude', 'workstream', 'events');
  if (!fs.existsSync(eventsDir)) return { passed: true, detail: 'no event log — N/A' };
  // NOT readVerifyEventTail: that local reader sorts the directory and walks it
  // backwards, so it reads current.jsonl (the mirror of today's chunk) AND the
  // dated file, returning today's events twice and out of order. This check is
  // order-sensitive across duplicates in a way its sibling above is not, so it
  // reported every amended contract as a leak. readFilteredEvents is the one
  // reader INV-077 exists to keep everyone on — it dedupes the mirror.
  const events = require('./core/events').readFilteredEvents(eventsDir, { limit: 500 });
  const ttlMs = inv090TtlMs(rootDir);

  // Per engine: the most recent still-open intent, or null once a completion
  // for that engine closes it. Walking forward keeps this O(n).
  const open = new Map(); // engine -> { contract_id, ts, target }
  let intents = 0, amended = 0, closedByCompletion = 0, agedOut = 0;
  const leaks = [];

  for (const e of events) {
    if (!(e && e.payload)) continue;
    const p = e.payload;
    if (p.type === 'engine_run_completed' && p.engine_id) {
      if (open.delete(p.engine_id)) closedByCompletion++;
      continue;
    }
    if (p.type !== 'engine_intent_recorded' || !p.engine) continue;
    intents++;
    const ts = Date.parse(p.created_at || e.timestamp || '') || 0;
    const prior = open.get(p.engine);
    if (prior && ts) {
      const ageMs = ts - prior.ts;
      if (ttlMs > 0 && ageMs >= ttlMs) {
        agedOut++; // the gate deliberately allows this — abandoned, not open
      } else if (p.amends_contract_id) {
        amended++; // founder-forced via --amend, accounted
      } else if (p.target && prior.target && p.target !== prior.target) {
        // identity is (engine, target); a different target was never gated
      } else {
        leaks.push(`${p.contract_id || e.id}: confirmed ${Math.round(ageMs / 60000)}m after open contract ${prior.contract_id} for ${p.engine}, no amends_contract_id`);
      }
    }
    open.set(p.engine, { contract_id: p.contract_id || e.id, ts, target: p.target || '' });
  }

  if (intents === 0) return { passed: true, detail: 'no engine_intent_recorded events — nothing to audit' };
  if (leaks.length > 0) {
    return {
      passed: true, // ADVISORY — never blocks
      detail: `ADVISORY: ${leaks.length} contract(s) confirmed over a still-open contract without an --amend marker — the confirm gate may have leaked. e.g. ${leaks.slice(0, 2).join(' | ')}`,
    };
  }
  return {
    passed: true,
    detail: `clean — ${intents} recorded intent(s): ${closedByCompletion} closed by completion, ${amended} founder-amended, ${agedOut} aged past the ${Math.round(ttlMs / 3600000)}h TTL.`,
  };
}

// ─── INV-062: Security posture matches declaration (ADR-059 / WS-521) ──────
// Delegates to cwos-security-posture-check.js rather than reimplementing the
// comparison: that script is the shipped mechanism and the thing run directly
// on other nodes over ssh. One definition of the check, two entry points.
function checkSecurityPostureMatchesDeclaration(rootDir) {
  const os = require('os');
  const script = path.join(rootDir, 'kit', 'scripts', 'cwos-security-posture-check.js');
  if (!fs.existsSync(script)) {
    return { passed: true, detail: 'cwos-security-posture-check.js not present — N/A' };
  }

  const { spawnSync } = require('child_process');
  const res = spawnSync(process.execPath, [script], { encoding: 'utf8' });

  // Exit 2 = this node declares no posture, or the registry/settings are
  // unreadable. Not a violation: an adopted repo that never opted in must not
  // fail verification over a control it never adopted.
  if (res.status === 2) {
    return { passed: true, detail: `no security_posture declared for this node — N/A (${(res.stderr || '').trim().split('\n')[0]})` };
  }
  if (res.status === null || res.error) {
    return { passed: true, detail: `posture check could not run — ${res.error ? res.error.message : 'no exit status'}` };
  }

  let parsed = null;
  try { parsed = JSON.parse(res.stdout || '{}'); } catch { /* fall through to raw */ }

  if (res.status === 0) {
    return { passed: true, detail: `posture matches declaration on ${(parsed && parsed.node) || os.hostname()}` };
  }

  const findings = (parsed && parsed.findings) || [];
  const summary = findings.length
    ? findings.map((f) => `${f.control}: expected ${f.expected}, actual ${f.actual}`).join(' | ')
    : (res.stdout || res.stderr || '').trim();
  return {
    passed: false,
    detail: `security posture DRIFT on ${(parsed && parsed.node) || os.hostname()} — ${summary}. Fix the settings, or update the declaration in fleet/registry.yaml and record it as a superseding decision (ADR-059).`,
  };
}

// ─── INV-063: Every fleet repo declares a phone_surface (WS-516) ───────────
// Delegates to cwos-phone-surface-check.js — one definition, two entry points.
// Runs the OFFLINE half only: no --probe, so verification never depends on the
// network. Liveness is advisory and belongs to WS-519's generation step.
function checkPhoneSurfaceDeclared(rootDir) {
  const script = path.join(rootDir, 'kit', 'scripts', 'cwos-phone-surface-check.js');
  if (!fs.existsSync(script)) {
    return { passed: true, detail: 'cwos-phone-surface-check.js not present — N/A' };
  }

  const { spawnSync } = require('child_process');
  const res = spawnSync(process.execPath, [script], { encoding: 'utf8' });

  // Exit 2 = no fleet/registry.yaml (an adopted repo, not the hub). Not a
  // violation: only HomeBase carries the fleet registry.
  if (res.status === 2) return { passed: true, detail: 'no fleet/registry.yaml — N/A (not the fleet hub)' };
  if (res.status === null || res.error) {
    return { passed: true, detail: `phone-surface check could not run — ${res.error ? res.error.message : 'no exit status'}` };
  }

  let parsed = null;
  try { parsed = JSON.parse(res.stdout || '{}'); } catch { /* fall through */ }

  if (res.status === 0) {
    return { passed: true, detail: `${(parsed && parsed.classified_count) || 0} fleet repo(s) classified; schema clean` };
  }

  const problems = (parsed && parsed.problems) || [];
  const summary = problems.length
    ? problems.slice(0, 4).map((p) => `${p.repo}: ${p.problem}`).join(' | ') + (problems.length > 4 ? ` (+${problems.length - 4} more)` : '')
    : (res.stdout || res.stderr || '').trim();
  return { passed: false, detail: `phone_surface problems — ${summary}` };
}

// ─── INV-064: the kit ships every module its scripts require (WS-544) ─────────
// Delegates to cwos-manifest-deps-validate.js — one definition, two entry
// points (here, and the publish gate inside cwos-hash-manifest.js).
//
// Absence degrades to PASS, deliberately. WS-544's own worst symptom was
// checkProgramFieldsHaveRuntimeEffect returning passed:false when its validator
// would not load: the invariant could never pass in a repo that never received
// the script, and it quietly accrued consecutive_failures toward escalation
// instead of crashing where someone would look. A missing validator is a
// not-installed signal, not a violation.
// INV-073 (WS-639). The command-side mirror of INV-064. Same degradation rules:
// a repo without the validator or without a manifest is N/A, not a failure —
// this runs in adopted repos too, and most of them are neither kit sources nor
// carrying every HomeBase script.
function checkCommandDepsShipped(rootDir) {
  const script = path.join(rootDir, 'kit', 'scripts', 'cwos-command-deps-validate.js');
  if (!fs.existsSync(script)) {
    return { passed: true, detail: 'cwos-command-deps-validate.js not present — N/A' };
  }
  if (!fs.existsSync(path.join(rootDir, 'kit', 'MANIFEST.yaml'))) {
    return { passed: true, detail: 'no kit/MANIFEST.yaml — N/A (not a kit source repo)' };
  }

  let checkCommandDeps;
  try { ({ checkCommandDeps } = require(script)); }
  catch (e) { return { passed: true, detail: `validator not loadable — ${e.message}` }; }

  const result = checkCommandDeps(rootDir);
  if (result.exit_code === 2) {
    return { passed: true, detail: `manifest unreadable — ${result.error} (N/A)` };
  }

  const gaps = (result.info || []).filter((i) => i.kind === 'tier-gap').length;
  if (result.ok) {
    return {
      passed: true,
      detail: `${result.shipping_commands} shipped command(s), ${result.edges_checked} invocation(s) — every invoked script ships`
        + (gaps ? `; ${gaps} tier gap(s) observed, not failed (WS-644)` : ''),
    };
  }

  const v = result.violations;
  const summary = v.slice(0, 4).map((x) => `[${x.kind}] ${x.command}:${x.line} -> ${x.target}`).join(' | ')
    + (v.length > 4 ? ` (+${v.length - 4} more)` : '');
  return { passed: false, detail: `${v.length} command dependency violation(s) — ${summary}` };
}

// INV-074 (WS-641). The register-side mirror of INV-073: instead of asking
// whether the manifest ships what commands invoke, it asks whether
// system/invariants.md and the enforcement describe the same set. Same
// degradation rules: a repo without the validator, or without a register, is
// N/A — adopted repos run this too, and a young repo may not have written
// invariants yet.
function checkInvariantRegisterConsistent(rootDir) {
  if (!isKitSourceRepo(rootDir)) return { passed: true, detail: NOT_KIT_SOURCE_NA };
  const script = path.join(rootDir, 'kit', 'scripts', 'cwos-invariant-register-validate.js');
  if (!fs.existsSync(script)) {
    return { passed: true, detail: 'cwos-invariant-register-validate.js not present — N/A' };
  }

  let checkInvariantRegister;
  try { ({ checkInvariantRegister } = require(script)); }
  catch (e) { return { passed: true, detail: `validator not loadable — ${e.message}` }; }

  // Pass the registered ids from THIS module's scope. Letting the validator
  // require() cwos-verify back mid-run hands it a half-built module.exports
  // (circular dependency) — observed live at first registration, 2026-08-15.
  const result = checkInvariantRegister(rootDir, {
    registered: INVARIANT_CHECKS.map((c) => c.id),
  });
  if (result.exit_code === 2) {
    return { passed: true, detail: `register unreadable — ${result.error} (N/A)` };
  }

  const outside = (result.info || []).filter((i) => i.kind === 'enforced-outside-verify').length;
  if (result.ok) {
    return {
      passed: true,
      detail: `${result.declared} declared, ${result.registered} registered — reconciled`
        + (result.waived.length ? `; ${result.waived.length} waived (tracked, dated)` : '')
        + (outside ? `; ${outside} enforced outside /verify` : ''),
    };
  }

  const v = result.violations;
  const summary = v.slice(0, 4).map((x) => `[${x.kind}] ${x.target}`).join(' | ')
    + (v.length > 4 ? ` (+${v.length - 4} more)` : '');
  return { passed: false, detail: `${v.length} register/enforcement violation(s) — ${summary}` };
}

// ─── INV-019 / INV-020: session liveness re-homed into /verify (WS-642) ──────
//
// Delegates to cwos-session-recovery.js's exported pure reads — one definition
// of "stale", two entry points (the SessionStart hook's --auto recovery, and
// this detector). The hook stays the primary defense; these checks are the
// tripwire for the hook being disabled or dead — the 2026-08-14 state, where
// an active session sat 3h past heartbeat before anything noticed.
function checkSessionLiveness(rootDir) {
  const script = path.join(rootDir, 'kit', 'scripts', 'cwos-session-recovery.js');
  if (!fs.existsSync(script)) {
    return { passed: true, detail: 'cwos-session-recovery.js not present — N/A' };
  }
  let isSessionHealthy;
  try { ({ isSessionHealthy } = require(script)); }
  catch (e) { return { passed: true, detail: `session-recovery not loadable — ${e.message}` }; }

  let wsDir;
  try { wsDir = findWorkstreamDir(rootDir); }
  catch { return { passed: true, detail: 'no .claude/workstream/ — N/A' }; }

  const result = isSessionHealthy(wsDir);
  if (result.healthy) {
    return { passed: true, detail: 'no active session past the heartbeat timeout' };
  }
  return { passed: false, detail: result.reason };
}

function checkCurrentSessionHeartbeat(rootDir) {
  const script = path.join(rootDir, 'kit', 'scripts', 'cwos-session-recovery.js');
  if (!fs.existsSync(script)) {
    return { passed: true, detail: 'cwos-session-recovery.js not present — N/A' };
  }
  let helpers;
  try { helpers = require(script); }
  catch (e) { return { passed: true, detail: `session-recovery not loadable — ${e.message}` }; }

  let wsDir;
  try { wsDir = findWorkstreamDir(rootDir); }
  catch { return { passed: true, detail: 'no .claude/workstream/ — N/A' }; }

  const pointer = path.join(wsDir, '.current-session');
  if (!fs.existsSync(pointer)) {
    return { passed: true, detail: 'no .current-session pointer — N/A' };
  }
  const id = fs.readFileSync(pointer, 'utf8').trim();
  if (!id) return { passed: true, detail: '.current-session is empty — N/A' };

  const current = helpers.scanActiveSessions(path.join(wsDir, 'sessions'))
    .find((s) => s.id === id);
  if (!current) {
    // Pointer at a non-active session is normal after recovery closes it;
    // orphan detection is INV-019's job. This check owns only the live
    // session's heartbeat.
    return { passed: true, detail: `.current-session ${id} is not active — N/A` };
  }

  const hb = helpers.parseHeartbeatMs(current);
  if (hb === null) {
    return { passed: false, detail: `current session ${id} is active with no parseable last_heartbeat` };
  }
  const timeoutHours = helpers.readTimeoutHours(wsDir);
  const ageHours = (Date.now() - hb) / 3600000;
  if (ageHours > timeoutHours) {
    return {
      passed: false,
      detail: `current session ${id} heartbeat is ${ageHours.toFixed(1)}h old (timeout ${timeoutHours}h) — the Stop hook is not advancing it`,
    };
  }
  return { passed: true, detail: `current session ${id} heartbeat ${ageHours.toFixed(1)}h old (timeout ${timeoutHours}h)` };
}

// ─── INV-disambiguation-catalog-single-source (ADR-040 D5 / WS-642) ──────────
//
// All catch-state disambiguation predicates live in
// core/cwos-catch-state-catalog.js. The failure mode is hand-tuned per-engine
// rules sprawling across the codebase, so this looks for DEFINITIONS of
// disambiguation logic (function declarations / assignments), not the word in
// prose or a call into the catalog — engine docs legitimately say
// "disambiguate" and callers legitimately invoke it.
function checkDisambiguationCatalogSingleSource(rootDir) {
  const roots = [path.join(rootDir, 'kit', 'scripts'), path.join(rootDir, 'engines')];
  const canonical = path.join('core', 'cwos-catch-state-catalog.js');
  const defPattern = /(?:function\s+disambiguate\w*\s*\(|\bdisambiguate\w*\s*[:=]\s*(?:async\s*)?(?:function\b|\())/;
  const offenders = [];

  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
        walk(full);
        continue;
      }
      if (!entry.name.endsWith('.js')) continue;
      if (full.endsWith(canonical)) continue;
      const text = fs.readFileSync(full, 'utf8');
      if (defPattern.test(text)) offenders.push(path.relative(rootDir, full).replace(/\\/g, '/'));
    }
  };
  for (const r of roots) walk(r);

  return {
    passed: offenders.length === 0,
    detail: offenders.length === 0
      ? 'disambiguation logic defined only in core/cwos-catch-state-catalog.js'
      : `${offenders.length} file(s) define disambiguation logic outside the catalog: ${offenders.join(', ')}`,
  };
}

// ─── INV-cli-subcommand-cap (ADR-037 D3 / AS-037-4 / WS-642) ─────────────────
//
// Allowlist + exact count per extracted CLI, mirroring the per-CLI parse tests
// (cwos-next.test.js #1 etc.) so the property also holds when only /verify
// runs. The cap is 5 keystone subcommands; deliberate utility additions are
// allowlisted HERE consciously (allocate-ws-id, WS-040), never absorbed
// silently — an unexpected case clause is direct AS-037-4 falsification
// evidence and fails this check.
const CLI_SUBCOMMAND_ALLOWLIST = {
  'cwos-next.js': ['gate', 'candidates', 'compose', 'approve', 'done', 'allocate-ws-id'],
  'cwos-pulse.js': ['overview', 'compute-health', 'run', 'escalate', 'refresh'],
  'cwos-audit.js': ['focus', 'compose', 'constitutional', 'render', 'verify-route'],
  'cwos-decide.js': null, // not yet filed — add its keystone five when it lands
};

function checkCliSubcommandCap(rootDir) {
  const problems = [];
  const checked = [];
  for (const [file, allowed] of Object.entries(CLI_SUBCOMMAND_ALLOWLIST)) {
    const full = path.join(rootDir, 'kit', 'scripts', file);
    if (!fs.existsSync(full)) {
      if (allowed !== null) problems.push(`${file}: allowlisted but missing on disk`);
      continue;
    }
    if (allowed === null) {
      problems.push(`${file}: exists but has no allowlist — declare its keystone subcommands here`);
      continue;
    }
    const src = fs.readFileSync(full, 'utf8');
    const mainStart = src.indexOf('function main()');
    if (mainStart === -1) {
      problems.push(`${file}: no top-level function main() dispatch found`);
      continue;
    }
    const mainEnd = src.indexOf('\nif (require.main === module)', mainStart);
    const block = src.slice(mainStart, mainEnd === -1 ? src.length : mainEnd);
    const cases = (block.match(/\bcase\s+'([^']+)'\s*:/g) || []).map((c) => c.match(/'([^']+)'/)[1]);
    const unexpected = cases.filter((c) => !allowed.includes(c));
    const missing = allowed.filter((c) => !cases.includes(c));
    if (unexpected.length) problems.push(`${file}: unexpected subcommand(s) ${unexpected.join(', ')} — AS-037-4 falsification, re-scope the extraction`);
    if (missing.length) problems.push(`${file}: allowlisted subcommand(s) gone: ${missing.join(', ')}`);
    checked.push(`${file} (${cases.length})`);
  }
  return {
    passed: problems.length === 0,
    detail: problems.length === 0
      ? `dispatch switches match their allowlists exactly: ${checked.join(', ')}`
      : problems.join(' | '),
  };
}

function checkManifestDepsComplete(rootDir) {
  const script = path.join(rootDir, 'kit', 'scripts', 'cwos-manifest-deps-validate.js');
  if (!fs.existsSync(script)) {
    return { passed: true, detail: 'cwos-manifest-deps-validate.js not present — N/A' };
  }
  if (!fs.existsSync(path.join(rootDir, 'kit', 'MANIFEST.yaml'))) {
    return { passed: true, detail: 'no kit/MANIFEST.yaml — N/A (not a kit source repo)' };
  }

  let checkManifestDeps;
  try { ({ checkManifestDeps } = require(script)); }
  catch (e) { return { passed: true, detail: `validator not loadable — ${e.message}` }; }

  const result = checkManifestDeps(rootDir);
  if (result.exit_code === 2) {
    return { passed: true, detail: `manifest unreadable — ${result.error} (N/A)` };
  }
  if (result.ok) {
    return {
      passed: true,
      detail: `${result.scripts_checked} registered .js — every hard require ships at or below its consumer's tier`
        + (result.data_coverage
          ? `; kit/data ${result.data_coverage.shipped.length} shipped + ${result.data_coverage.genesis_only.length} genesis-only, 0 unaccounted`
          : '')
        // WS-611: stated on a PASS, not only on a failure. The M0 seed list went
        // its whole life ungoverned and nothing said so either way.
        + (result.m0_closure
          ? (result.m0_closure.skipped
              ? `; M0 seed list not checked (${result.m0_closure.skipped})`
              : `; M0 seed list ${result.m0_closure.scripts_checked} file(s), require-closed`)
          : ''),
    };
  }

  const v = result.violations;
  const summary = v.slice(0, 4).map((x) => `[${x.kind}] ${x.source}${x.target ? ' -> ' + x.target : ''}`).join(' | ')
    + (v.length > 4 ? ` (+${v.length - 4} more)` : '');
  return { passed: false, detail: `${v.length} manifest dependency violation(s) — ${summary}` };
}

// ─── INV-071: unreleased kit changes cannot propagate (WS-578) ───────────────
//
// Delegates to cwos-hash-manifest.js — one definition of "stale", two entry
// points (here, and the CLI's --check), the shape INV-064 and INV-068 use.
//
// What it catches: kit/ has moved since the version in kit/VERSION was
// baselined. That state is invisible everywhere else and silently disables
// BOTH propagation paths, because each keys on the version number rather than
// on content — /fleet-update enters its loop only when kit_version_at_install
// < kit/VERSION, and /kit-upgrade returns early on exact equality. So every
// adopted repo reports itself current, truthfully, while running old code.
//
// Absence degrades to PASS on the same reasoning as INV-064/068: an adopted
// repo is not a kit source and has nothing to release.
function checkReleaseDrift(rootDir) {
  const script = path.join(rootDir, 'kit', 'scripts', 'cwos-hash-manifest.js');
  if (!fs.existsSync(script)) {
    return { passed: true, detail: 'cwos-hash-manifest.js not present — N/A' };
  }
  let checkFn;
  try { ({ checkReleaseDrift: checkFn } = require(script)); }
  catch (e) { return { passed: true, detail: `hash-manifest not loadable — ${e.message}` }; }
  if (typeof checkFn !== 'function') {
    return { passed: true, detail: 'hash-manifest predates the release-drift entry point — N/A' };
  }

  let res;
  try { res = checkFn(rootDir); }
  catch (e) { return { passed: true, detail: `release-drift check errored — ${e.message} (N/A)` }; }

  if (!res.applicable) return { passed: true, detail: `${res.reason} — N/A` };
  if (res.ok) {
    return { passed: true, detail: `kit/ matches the v${res.version} baseline (${res.file_count} files)` };
  }
  return {
    passed: false,
    detail: `kit/ has changed since v${res.version} was baselined — ${res.error}. `
      + `Until kit/VERSION is bumped and re-baselined, /fleet-update and /kit-upgrade are both no-ops `
      + `and every adopted repo will report itself current while running older code.`,
  };
}

// ─── INV-068: no declaration fails open (WS-562) ─────────────────────────────
// Delegates to cwos-declaration-liveness.js — one definition, two entry points
// (here, and the publish gate inside cwos-hash-manifest.js), the same shape
// INV-064 uses.
//
// Absence degrades to PASS on the same reasoning as INV-064: a repo that never
// received the registry is not in violation. Note the asymmetry this preserves
// — a MISSING registry passes, a registry declaring something nothing reads
// fails. The gate is about declarations that lie, not about having one.
//
// Waived violations do NOT fail the invariant. They are dated and tracked in
// kit/declarations.yaml, so they are already visible work items rather than
// silent drift; failing on them would make /verify permanently red and teach
// people to ignore it. An EXPIRED waiver does fail — that is the point of the
// expiry.
function checkDeclarationsHaveConsumers(rootDir) {
  if (!isKitSourceRepo(rootDir)) return { passed: true, detail: NOT_KIT_SOURCE_NA };
  const script = path.join(rootDir, 'kit', 'scripts', 'cwos-declaration-liveness.js');
  if (!fs.existsSync(script)) {
    return { passed: true, detail: 'cwos-declaration-liveness.js not present — N/A' };
  }
  if (!fs.existsSync(path.join(rootDir, 'kit', 'declarations.yaml'))) {
    return { passed: true, detail: 'no kit/declarations.yaml — N/A (not a kit source repo)' };
  }

  let checkDeclarationLiveness;
  try { ({ checkDeclarationLiveness } = require(script)); }
  catch (e) { return { passed: true, detail: `validator not loadable — ${e.message}` }; }

  const result = checkDeclarationLiveness(rootDir);
  if (result.exit_code === 2) {
    return { passed: true, detail: `registry unreadable — ${result.error} (N/A)` };
  }
  const waivedNote = result.waived.length ? `, ${result.waived.length} waived` : '';
  if (result.ok) {
    const values = result.report.reduce((n, r) => n + r.values_discovered, 0);
    return {
      passed: true,
      detail: `${result.declarations_checked} declaration(s), ${values} declared value(s) — every one has a live consumer${waivedNote}`,
    };
  }

  const v = result.violations;
  const summary = v.slice(0, 4).map((x) => `[${x.kind}] ${x.consumer || x.value || x.target || x.declaration}`).join(' | ')
    + (v.length > 4 ? ` (+${v.length - 4} more)` : '');
  return { passed: false, detail: `${v.length} declaration liveness violation(s) — ${summary}` };
}

// ─── INV-069: files_locked is written and read, not merely declared (WS-564) ─
//
// `files_locked` sat in the session schema from adoption with ZERO writers
// anywhere in the kit — scaffolded to `[]` by /session-start, by
// cwos-session-register, and by cwos-claims' mint, then never touched again.
// That is the identical shape WS-533 diagnosed for `claimed_by` ("nothing ever
// ACQUIRED one"), except that fix stopped at items and never reached files. The
// cost was concrete: claude-poker-tracker's git guard had to infer ownership
// from file mtimes, and documented its own gap — a session that started before
// ours and edits after we begin is invisible to that proof.
//
// WHY THIS IS ITS OWN INVARIANT AND NOT AN INSTANCE OF INV-068. That gate reads
// kit/declarations.yaml, which discovers the VALUES a key takes in a declaring
// YAML file — the right shape for an enum like merge_strategy. `files_locked`
// has no enum of values; it is a list field whose defect is the absence of a
// writer. The general class is WS-562's; this asserts the specific mechanism
// this item shipped, so that losing the writer again fails loudly rather than
// reverting to a scaffolded [] that looks exactly like working code.
//
// Both directions are checked. A writer with no reader is a field being
// diligently maintained for nobody — the same fail-open wearing a different hat.
function checkFilesLockedIsLive(rootDir) {
  const scriptsDir = path.join(rootDir, 'kit', 'scripts');
  if (!fs.existsSync(scriptsDir)) {
    return { passed: true, detail: 'no kit/scripts/ — N/A (not a kit source repo)' };
  }

  const claimsPath = path.join(scriptsDir, 'lib', 'cwos-claims.js');
  if (!fs.existsSync(claimsPath)) {
    return { passed: true, detail: 'no lib/cwos-claims.js — N/A' };
  }
  const claims = fs.readFileSync(claimsPath, 'utf8');
  if (!/function\s+lockFiles\s*\(/.test(claims) || !/files_locked/.test(claims)) {
    return {
      passed: false,
      detail: 'lib/cwos-claims.js no longer exports a files_locked acquire path (lockFiles). '
            + 'The field is back to being scaffolded and never written — WS-564 all over again.',
    };
  }

  // Callers, excluding the library that defines the function and the tests that
  // exercise it: a mechanism whose only caller is its own test is not live.
  const writers = [];
  const readers = [];
  const walk = (dir) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === '__tests__' || e.name === 'node_modules') continue;
        walk(p);
        continue;
      }
      if (!e.name.endsWith('.js')) continue;
      if (p === claimsPath) continue;
      let text;
      try { text = fs.readFileSync(p, 'utf8'); } catch { continue; }
      const rel = path.relative(rootDir, p).split('\\').join('/');
      if (/\blockFiles\s*\(/.test(text)) writers.push(rel);
      if (/\b(listFileLocks|findFileLockConflicts)\s*\(/.test(text)) readers.push(rel);
    }
  };
  walk(scriptsDir);

  if (!writers.length) {
    return {
      passed: false,
      detail: 'files_locked has an acquire function (lockFiles) that NOTHING calls. A field with a '
            + 'writer nobody invokes is indistinguishable from one that never had a writer — wire it '
            + 'from cwos-git.js record (PostToolUse) or stage, or delete the field.',
    };
  }
  if (!readers.length) {
    return {
      passed: false,
      detail: `files_locked is written by ${writers.join(', ')} but read by nothing — ownership is being `
            + 'recorded for no consumer. The reader is the point: cwos-git.js guard/stage uses it to '
            + 'decide what belongs to whom.',
    };
  }

  return {
    passed: true,
    detail: `files_locked: ${writers.length} writer(s) [${writers.slice(0, 3).join(', ')}], `
          + `${readers.length} reader(s) [${readers.slice(0, 3).join(', ')}]`,
  };
}

// ─── INV-070: verify itself completes, and `fast` means fast (WS-566) ───────
//
// Three assertions disagreed silently and nothing reconciled them: INV-031 was
// DECLARED `fast: true`, MEASURED at 281s, and RUN by a hook with an 8-second
// timeout, `2>/dev/null` and `|| true`. Launched and killed every session for
// months, reported as nothing at all.
//
// This closes the loop with facts that can be checked cheaply (WS-566 budget +
// WS-609 liveness):
//   1. did the fast set stay inside its budget the last time it ran,
//   2. did the last run actually FINISH (started-stamp newer than completed-
//      stamp with a dead pid = truncated/killed),
//   3. are fast passes completing recently when runs are being started, and
//   4. have replay-purity (INV-031) and per-field replay-purity (INV-044) been
//      CONFIRMED recently, now that both are heavy and out of the implicit
//      paths — staleness here is what keeps "excluded" from becoming "forgotten".
//
// It reads the stamp cwos-verify writes at the END of a run. It deliberately
// does not re-run anything: a budget check that costs seconds to answer "are we
// under budget" is its own first violation.
// WS-811: these were 15000 and 8000, written by hand and never reconciled with
// the hook's actual `timeout` in settings. The whole-set budget was nearly 2x
// the real limit, so a run could pass this invariant and still be killed by the
// hook — which is exactly what happened, for weeks, while this reported the
// truncation without ever reporting the budget breach that caused it.
//
// Now both are DERIVED from the one number that actually enforces anything.
// Change the hook's timeout and these follow. The 0.6 factor is headroom: a
// check that only fails once the hook is already being killed is a check
// reporting the fire from inside it.
const FAST_BUDGET_FRACTION = 0.6;
function fastBudgets(rootDir) {
  const hook = sessionStartVerifyHook(rootDir);
  return {
    // Whole fast set, per run.
    whole: Math.round(hook.timeoutMs * FAST_BUDGET_FRACTION),
    // Any single fast check. One check that eats the entire timeout cannot
    // finish inside it no matter how cheap its neighbours are.
    single: hook.timeoutMs,
    hook,
  };
}
const REPLAY_STALE_DAYS = 14;
// WS-609: the fast stamp should refresh every working session via the
// SessionStart hook. 7 days (vs 14 for replay) is a judgment call: long
// enough to survive a week away, short enough that a hook being killed
// every session cannot hide for long. Only enforced when runs are being
// STARTED but not completing — an idle machine stays green.
const FAST_STALE_DAYS = 7;
// A started-but-not-completed stamp with no live pid is only a truncation
// after this grace: a full verify run takes ~10 min, and a stamp whose pid
// field is missing (older kit) should not fail instantly.
const TRUNCATION_GRACE_MS = 60 * 60 * 1000;

function checkVerifyLiveness(rootDir) {
  const wsDir = path.join(rootDir, '.claude', 'workstream');
  if (!fs.existsSync(wsDir)) {
    return { passed: true, detail: 'no workstream dir (INV-070 N/A)' };
  }
  const p = path.join(wsDir, VERIFY_LIVENESS_FILE);
  if (!fs.existsSync(p)) {
    // First run after adopting this check writes the stamp on its way out, so
    // this is a one-time N/A rather than a failure.
    return { passed: true, detail: 'no .verify-liveness.yaml yet — this run creates it' };
  }

  const stamp = {};
  try {
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^([a-z_]+):\s*"?([^"\n]*)"?\s*$/);
      if (m) stamp[m[1]] = m[2].trim();
    }
  } catch (e) {
    return { passed: false, detail: `.verify-liveness.yaml unreadable — ${e.message}` };
  }

  const problems = [];
  const notes = [];

  const { whole: budgetMs, single: singleBudgetMs, hook } = fastBudgets(rootDir);
  // Say where the number came from, every time. A derived budget that presents
  // itself as a bare constant teaches the next reader nothing, and the failure
  // this replaced was precisely that nobody could see the two numbers disagree.
  const derivedFrom = hook.source === 'default'
    ? `no SessionStart verify hook found — assuming a ${hook.timeoutMs / 1000}s timeout`
    : `hook timeout ${hook.timeoutMs / 1000}s from ${hook.source}`;

  const fastMs = Number(stamp.last_fast_ms);
  if (Number.isFinite(fastMs)) {
    notes.push(`fast set ${(fastMs / 1000).toFixed(1)}s of ${(budgetMs / 1000).toFixed(1)}s (${derivedFrom})`);
    if (fastMs > budgetMs) {
      problems.push(`the fast set took ${(fastMs / 1000).toFixed(1)}s against a ${(budgetMs / 1000).toFixed(1)}s budget `
        + `(${derivedFrom}, × ${FAST_BUDGET_FRACTION} for headroom) — it is run at SessionStart under that timeout, `
        + 'so over-budget means silently truncated. Demote the expensive checks, or shorten what the hook runs.');
    }
    const slowMs = Number(stamp.slowest_fast_ms);
    if (Number.isFinite(slowMs) && slowMs > singleBudgetMs) {
      problems.push(`${stamp.slowest_fast_id || 'a fast check'} alone took ${(slowMs / 1000).toFixed(1)}s `
        + `(single-check budget ${(singleBudgetMs / 1000).toFixed(1)}s, ${derivedFrom}) — it cannot finish inside the hook's timeout`);
    }
  }

  // WS-609 (1/3): truncation detection. stampVerifyStart promotes a prior
  // started-but-never-completed stamp (dead pid) into last_truncated_run_*
  // before claiming the started slot — INV-070 runs inside a verify run, so
  // by the time it reads the file the started fields are its own; the
  // promoted fields are the surviving evidence. Self-healing: a completed
  // run of the same mode newer than the truncation clears it.
  const truncatedAt = Date.parse(stamp.last_truncated_run_at || '');
  if (Number.isFinite(truncatedAt)) {
    const tMode = stamp.last_truncated_run_mode || 'unknown';
    const clearedBy = tMode.startsWith('fast') ? stamp.last_fast_completed_at
      : tMode === 'full' ? stamp.last_full_completed_at
      : stamp.last_run_completed_at;
    const clearedAt = Date.parse(clearedBy || '');
    if (!Number.isFinite(clearedAt) || clearedAt < truncatedAt) {
      problems.push(`a verify run (mode ${tMode}, started ${stamp.last_truncated_run_at}) `
        + `was truncated or killed before completing, and no ${tMode} run has completed since — `
        + 'the SessionStart hook discards the kill evidence; this stamp is it');
    } else {
      notes.push(`prior ${tMode} truncation ${stamp.last_truncated_run_at} cleared by later completion`);
    }
  }

  // Belt-and-braces in-place variant: normally unreachable (stampVerifyStart
  // claims the slot first), but if the start stamp failed to write this run,
  // a foreign dead-pid start still fails rather than passing silently.
  const startedAt = Date.parse(stamp.last_run_started_at || '');
  const completedAt = Date.parse(stamp.last_run_completed_at || '');
  if (Number.isFinite(startedAt) && (!Number.isFinite(completedAt) || startedAt > completedAt)) {
    const pid = Number(stamp.last_run_started_pid);
    if (!(Number.isFinite(pid) && pid === process.pid)) {
      let pidAlive = false;
      if (Number.isFinite(pid) && pid > 0) {
        try { process.kill(pid, 0); pidAlive = true; }
        catch (e) { pidAlive = e.code === 'EPERM'; } // EPERM = alive, no permission
      }
      if (pidAlive) {
        notes.push(`verify run in progress (pid ${pid})`);
      } else if (Number.isFinite(pid) || (Date.now() - startedAt) > TRUNCATION_GRACE_MS) {
        problems.push(`last verify run (mode ${stamp.last_run_started_mode || 'unknown'}, `
          + `started ${stamp.last_run_started_at}, pid ${stamp.last_run_started_pid || 'unknown'}) `
          + 'was truncated or killed before completing — the SessionStart hook discards the kill evidence; this stamp is it');
      }
    }
  }

  // WS-609 (2/3): fast-stamp freshness. A budget-passing stamp from last week
  // says nothing about this week's runs. Only fails when a run STARTED after
  // the last fast completion — evidence runs are attempted but not finishing.
  // An idle machine (no starts either) stays green; "hook not firing at all"
  // is INV-026's job.
  const fastAt = Date.parse(stamp.last_fast_completed_at || '');
  if (Number.isFinite(fastAt) && Number.isFinite(startedAt) && startedAt > fastAt) {
    const fastDays = (Date.now() - fastAt) / 86400000;
    if (fastDays > FAST_STALE_DAYS) {
      problems.push(`the last completed fast pass is ${Math.floor(fastDays)}d old (max ${FAST_STALE_DAYS}d) `
        + `while runs have started since — fast passes are being attempted but not completing`);
    }
  }

  // Replay-purity left the fast set in WS-566. That is only safe while its
  // absence is loud — but only where there is something to verify.
  //
  // A freshly adopted repo has no event log, so demanding a replay confirmation
  // would put a brand-new invariant in the red on day one and point the founder
  // at a check that takes minutes to say "nothing to compare". That is the
  // documented route to a gate being switched off (see INV-068's notes), and
  // ADR-020's guarantee is vacuous until events exist anyway.
  const eventsDir = path.join(wsDir, 'events');
  let eventFiles = [];
  try { eventFiles = fs.readdirSync(eventsDir).filter((f) => f.endsWith('.jsonl')); } catch { /* none */ }
  if (eventFiles.length === 0) {
    notes.push('no event log yet — replay-purity N/A');
    return problems.length
      ? { passed: false, detail: problems.join(' | ') }
      : { passed: true, detail: notes.join('; ') };
  }

  const okAt = Date.parse(stamp.last_replay_purity_ok_at || '');
  if (!Number.isFinite(okAt)) {
    problems.push('replay-purity (INV-031) has never been confirmed on this repo — '
      + 'run `node kit/scripts/cwos-verify.js --only INV-031` (replays the whole event log; memoized since WS-609)');
  } else {
    const days = (Date.now() - okAt) / 86400000;
    notes.push(`replay-purity confirmed ${days.toFixed(1)}d ago`);
    if (days > REPLAY_STALE_DAYS) {
      problems.push(`replay-purity last confirmed ${Math.floor(days)}d ago (max ${REPLAY_STALE_DAYS}d) — `
        + 'ADR-020 says state/*.json is derivable from the event log; that is a claim, not an observation, until this runs');
    }
  }

  // WS-609 (3/3): INV-044 (per-field replay-purity) left the implicit paths
  // with the heavy flag; this staleness assertion is where its guarantee now
  // lives — same mechanism WS-566 built for INV-031.
  const fieldOkAt = Date.parse(stamp.last_field_purity_ok_at || '');
  if (!Number.isFinite(fieldOkAt)) {
    problems.push('per-field replay-purity (INV-044) has never been confirmed on this repo — '
      + 'run `node kit/scripts/cwos-verify.js --only INV-044` (seconds since WS-609 memoized the replay)');
  } else {
    const days = (Date.now() - fieldOkAt) / 86400000;
    notes.push(`field-purity confirmed ${days.toFixed(1)}d ago`);
    if (days > REPLAY_STALE_DAYS) {
      problems.push(`per-field replay-purity last confirmed ${Math.floor(days)}d ago (max ${REPLAY_STALE_DAYS}d) — `
        + 'run `node kit/scripts/cwos-verify.js --only INV-044`');
    }
  }

  if (problems.length) {
    return { passed: false, detail: problems.join(' | ') };
  }
  return {
    passed: true,
    detail: notes.length ? notes.join('; ') : `stamped ${stamp.last_run_completed_at || 'unknown'}`,
  };
}

// ─── INV-066: nothing finds a root by counting parent dirs (WS-549) ──────────
// Delegates to cwos-pathroot-lint.js. Same absence-degrades-to-PASS contract as
// INV-064 above: a repo that never received the linter is not in violation.
//
// No advisory tier and no suppression comment. The 19 sites this retired
// accumulated precisely because nothing failed on them — they were correct in
// HomeBase, which is the only place anyone looked.
function checkPathRootResolution(rootDir) {
  const script = path.join(rootDir, 'kit', 'scripts', 'cwos-pathroot-lint.js');
  if (!fs.existsSync(script)) {
    return { passed: true, detail: 'cwos-pathroot-lint.js not present — N/A' };
  }

  let scan;
  try { ({ scan } = require(script)); }
  catch (e) { return { passed: true, detail: `linter not loadable — ${e.message}` }; }

  const result = scan(rootDir);
  if (result.ok) {
    return {
      passed: true,
      detail: `${result.files_scanned} script(s) scanned — no __dirname root-walking`,
    };
  }

  const summary = result.violations.slice(0, 4).map(v => `${v.file}:${v.line}`).join(' | ')
    + (result.violations.length > 4 ? ` (+${result.violations.length - 4} more)` : '');
  return {
    passed: false,
    detail: `${result.violation_count} site(s) resolve a root by directory arithmetic — ${summary}. Use lib/kit-paths.js.`,
  };
}

// ─── INV-067: no key-presence guard on a closure field (WS-561) ──────────────
// Delegates to cwos-closure-guard-lint.js. Absence-degrades-to-PASS, matching
// INV-064/INV-066.
//
// This guards the GUARD, not the data. Null-scaffolded items are legal — they
// arrive via migration, and cwos-adopt-install.js:1630 already treats
// `completed_at: null` as the canonical pre-closure form — so a data check
// would fail on correct input forever. What must never recur is the
// presence-test, which asks whether a key exists when it means whether the key
// has a value, and silently drops the write when the answer differs.
//
// It exists because WS-561's fix is TOLERANCE, and tolerance suppresses the
// signal that would reveal a sixth site hand-rolling the old shape. Five sites
// carried it, two byte-for-byte identical, and nothing failed for months.
function checkClosureGuardShape(rootDir) {
  const script = path.join(rootDir, 'kit', 'scripts', 'cwos-closure-guard-lint.js');
  if (!fs.existsSync(script)) {
    return { passed: true, detail: 'cwos-closure-guard-lint.js not present — N/A' };
  }

  let scan;
  try { ({ scan } = require(script)); }
  catch (e) { return { passed: true, detail: `linter not loadable — ${e.message}` }; }

  const result = scan(rootDir);
  if (result.ok) {
    return {
      passed: true,
      detail: `${result.files_scanned} script(s) scanned — no key-presence guards on closure fields`,
    };
  }

  const summary = result.violations.slice(0, 4).map(v => `${v.file}:${v.line}`).join(' | ')
    + (result.violations.length > 4 ? ` (+${result.violations.length - 4} more)` : '');
  return {
    passed: false,
    detail: `${result.violation_count} closure field(s) written behind a key-presence guard — ${summary}. Use cwos-utils.upsertYAMLScalarField.`,
  };
}

// ─── INV-089: the kit test suites actually run, and none is red (WS-808) ────
//
// HomeBase carries 190 suites under kit/scripts/__tests__/. Before this, twelve
// were referenced by this file and the other 178 ran only when a human typed the
// filename. Measured 2026-09-08: nine were red, two of them broken for over a
// month by features that invalidated exact-count assertions (WS-558 registry
// pruning; WS-564 advisory sprint_blocks). The ungated set included
// migrate-scripts-machinery.test.js — the whole safety net for WS-796's Guard E.
//
// This check does NOT run the suites; cwos-test-sweep.js does, on a daily tier
// riding Fleet-SessionSweep. This reads its stamp. That split is deliberate: the
// sweep exits 0 even on a red suite so a 15-minute scheduled task does not go
// red over a known failure, and the gating decision lives here where a fix is a
// one-line waiver rather than a task edit.
//
// Three ways to fail, and the third is the one that matters most: a stale stamp.
// An all-green report from a runner that died three weeks ago is exactly the
// shape of the fleet sweep that read "clean, 0 findings" for six days in
// September while 19 findings waited. Green and absent must never look alike.
function checkTestSweepGreen(rootDir) {
  const stampPath = path.join(rootDir, '.claude', 'workstream', '.test-sweep.json');
  const sweeper = path.join(rootDir, 'kit', 'scripts', 'cwos-test-sweep.js');
  if (!fs.existsSync(sweeper)) {
    return { passed: true, detail: 'cwos-test-sweep.js not present — INV-089 N/A (pre-WS-808)' };
  }
  if (!fs.existsSync(stampPath)) {
    return { passed: false, detail: '.test-sweep.json absent — the sweeper ships but has never run. Prime it with `node kit/scripts/cwos-test-sweep.js --force`.' };
  }

  let stamp;
  try { stamp = JSON.parse(fs.readFileSync(stampPath, 'utf8')); }
  catch (e) { return { passed: false, detail: `.test-sweep.json unreadable — ${e.message}` }; }

  const problems = [];
  const now = Date.now();
  const completed = stamp.last_completed_at ? Date.parse(stamp.last_completed_at) : NaN;
  const started = stamp.last_started_at ? Date.parse(stamp.last_started_at) : NaN;
  const invoked = stamp.last_invoked_at ? Date.parse(stamp.last_invoked_at) : NaN;

  // (1) A run that started and never finished. The task's execution limit kills
  // mid-sweep, and this ordering is the only evidence that survives it.
  //
  // But a run IN PROGRESS has the same shape, and the sweep takes ~10 minutes,
  // so without the pid this check would fail once a day on schedule — and a
  // check that cries wolf predictably is one people learn to skip. If the
  // recorded pid is still alive, the sweep is running right now, not truncated.
  const openRun = Number.isFinite(started) && (!Number.isFinite(completed) || started > completed);
  let inProgress = false;
  if (openRun && stamp.last_started_pid) {
    try { process.kill(Number(stamp.last_started_pid), 0); inProgress = true; }
    catch { inProgress = false; }   // ESRCH — the process is gone, so it really was killed
  }
  if (openRun && !inProgress) {
    problems.push(`a sweep started ${stamp.last_started_at} never completed — truncated or killed mid-run`);
  }

  // (2) Staleness. The daily tier is 20h; allow 3 days before failing so a
  // laptop that was shut for a weekend does not cry wolf.
  const STALE_MS = 3 * 86400000;
  if (!Number.isFinite(completed)) {
    // Not a problem while the very first sweep is still running — that is the
    // system working, not a gap.
    if (!inProgress) problems.push('no completed sweep recorded yet');
  } else if (now - completed > STALE_MS) {
    const days = Math.floor((now - completed) / 86400000);
    const invokedNote = Number.isFinite(invoked) && (now - invoked) <= STALE_MS
      ? ' — the sweeper IS being invoked, so the daily tier is starting and not finishing'
      : ' — the sweeper is not being invoked at all; check the Fleet-SessionSweep task\'s fourth action';
    problems.push(`last completed sweep is ${days}d old (max 3d)${invokedNote}`);
  }

  // (3) The actual point: a red suite.
  const failing = Number(stamp.failing) || 0;
  const timing = Number(stamp.timing_out) || 0;
  if (failing + timing > 0) {
    const names = (stamp.failures || []).slice(0, 6).map((f) => `${f.suite} [${f.status}]`).join(', ');
    const more = (stamp.failures || []).length > 6 ? ` (+${stamp.failures.length - 6} more)` : '';
    problems.push(`${failing} suite(s) failing, ${timing} timing out: ${names}${more}`);
  }

  if (problems.length) return { passed: false, detail: problems.join(' | ') };
  const ageH = Math.round((now - completed) / 360000) / 10;
  return {
    passed: true,
    detail: `${stamp.total_suites} suite(s) all green, swept ${ageH}h ago in ${Math.round((stamp.total_ms || 0) / 1000)}s`,
  };
}

// ─── INV-088: An absence claim carries the evidence that establishes it ─────
//
// WS-701 / RC2-absence. A conclusion gets stated as fact when the procedure
// behind it could not have established it: a grep that misses is
// indistinguishable from a grep that finds nothing. Three instances in 48 hours
// (2026-08-20 → 08-22); the worst put a false absence claim into a
// customer-facing envelope, and MIS-006 called a file ABSENT on the strength of
// a depth-3 `find` when it sat at depth 4.
//
// The detector is heuristic by necessity — it reads the finding's own prose —
// so the opt-out is deliberately one line (`absence_claim: false`). Legacy and
// undated findings warn rather than error, so the retrofit never fails the
// corpus it was introduced against.
//
// This delegates to cwos-finding-validate rather than re-implementing the
// schema: one enforcer, so the register and the enforcement cannot drift.
function checkAbsenceClaimsCarryEvidence(rootDir) {
  const { execFileSync } = require('child_process');
  const root = rootDir || findRepoRoot(process.cwd(), { markers: ['CLAUDE.md', 'kit'], requireAll: true, maxDepth: 8 });
  const validator = path.join(root, 'kit', 'scripts', 'cwos-finding-validate.js');
  if (!fs.existsSync(validator)) {
    return { passed: true, detail: 'cwos-finding-validate.js not present — INV-088 N/A in this repo.' };
  }

  let out;
  try {
    out = execFileSync(process.execPath, [validator, '--all', '--quiet'], {
      cwd: root, encoding: 'utf8', timeout: 60000,
    });
  } catch (e) {
    // Non-zero exit is the violation path — the JSON is still on stdout.
    out = (e && e.stdout) || '';
    if (!out) {
      return { passed: false, detail: `cwos-finding-validate could not run: ${e && e.message}` };
    }
  }

  let summary;
  try { summary = JSON.parse(out); } catch (e) {
    return { passed: false, detail: 'cwos-finding-validate produced unparseable output — the schema gate is silently off.' };
  }

  const errors = Array.isArray(summary.errors) ? summary.errors : [];
  const absenceErrors = errors.filter((e) => String(e).includes('INV-088'));
  const absenceWarnings = (Array.isArray(summary.warnings) ? summary.warnings : [])
    .filter((w) => String(w).includes('INV-088'));

  if (absenceErrors.length) {
    const shown = absenceErrors.slice(0, 3).map((e) => String(e).split(':')[0]).join(', ');
    return {
      passed: false,
      detail: `${absenceErrors.length} finding(s) assert an absence with nothing establishing it — ${shown}` +
        (absenceErrors.length > 3 ? ` (+${absenceErrors.length - 3} more)` : '') +
        '. Add `absence_evidence` naming the search and its positive control, or `absence_claim: false` if it is not an existence claim.',
    };
  }

  const legacy = absenceWarnings.length
    ? `; ${absenceWarnings.length} legacy absence claim(s) tracked as warnings`
    : '';
  return {
    passed: true,
    detail: `${summary.total} finding(s) scanned — every post-cutoff absence claim carries its evidence${legacy}.`,
  };
}

if (require.main === module) {
  main();
}

module.exports = { checkStateDomainRebuildContract, checkReplayPurity, checkClosureGuardShape, checkCliBypassViaCommand, checkReadRestraint, checkPersonaDispatch, checkProgramYamlSchema, checkAdopterValueRelation, checkCommandManifestCoverage, checkAdoptInstallAtomicWrites, checkDistributionRefs, checkNoHardcodedEvolutionPaths, checkPreflightGateNotBypassed, checkOneContractPerOpenRun, checkWsIdCollisionWithRemote, checkEngineModelTiers, checkSecurityPostureMatchesDeclaration, checkPhoneSurfaceDeclared, checkManifestDepsComplete, checkPathRootResolution, INVARIANT_CHECKS, INVARIANT_META, selectChecks, getChangedFiles, fileMatchesPrefix, clearVerifyCache, cachedReadYAMLFile,
  // WS-811: verify-perf.test.js asserts the command the HOOK runs, not one
  // typed into the test. Exported so there is exactly one reader of the hook's
  // shape, and the test cannot drift green about a command nobody ships.
  sessionStartVerifyHook, DEFAULT_HOOK_TIMEOUT_MS,
  // Exported for INV-078's fixture (WS-678): the firing-log write is exercised
  // against a pinned reader handle there, because the Win32 rename contention
  // that migration risks cannot be asserted from the outside.
  updateInvariantFiringLog,
  // Exported for INV-082's fixture (WS-606): a duplicate key is invisible to a
  // parsed object, so the scanner has to be asserted against raw text directly.
  findDuplicateJsonKeys, checkSettingsNoDuplicateKeys };

// ─── INV-091: the system dir is declared, not hardcoded (WS-703) ────────────
//
// `.cwos-config.yaml` carries `paths.system_dir`, and CLAUDE.md states the
// contract outright: "Read system_dir from .cwos-config.yaml (default: system).
// Substitute in all system/ file references." On 2026-09-08, twenty-four
// production sites ignored it and three honoured it.
//
// Prose had already told those sites what to do, for months, and they did not
// do it. So this is the mechanical boundary rather than another sentence:
// a new `path.join(<root>, 'system', ...)` fails here.
//
// Two shapes are legitimate and are NOT violations:
//   - a relative default with no root (path.join('system', 'x')) — that IS the
//     kit default being expressed, not a repo's location being assumed;
//   - lib/kit-artifacts.js itself, which is where the default lives.
function checkSystemDirNotHardcoded(rootDir) {
  const scanDirs = ['kit/scripts', 'kit/scripts/lib', 'kit/scripts/core'];
  // The resolver is allowed to know the default. The two files INV-066 pins
  // carry their own boundedSystemDir-wrapped resolveSystemDir and must keep it.
  const exempt = new Set([
    'kit/scripts/lib/kit-artifacts.js',
    'kit/scripts/cwos-adopt-install.js',
    'kit/scripts/cwos-scope-check.js',
    'kit/scripts/cwos-invariant-register-validate.js',
  ]);
  // path.join(<identifier or call>, 'system', ...) — a ROOT plus a hardcoded
  // 'system'. The leading argument is what makes it a repo-location assumption.
  const RE = /path\.join\(\s*[A-Za-z_$][\w$]*(?:\(\))?\s*,\s*['"]system['"]\s*,/;

  const violations = [];
  for (const rel of scanDirs) {
    const dir = path.join(rootDir, rel);
    if (!fs.existsSync(dir)) continue;
    let names;
    try { names = fs.readdirSync(dir); } catch { continue; }
    for (const name of names) {
      if (!name.endsWith('.js')) continue;
      const fileRel = `${rel}/${name}`;
      if (exempt.has(fileRel)) continue;
      const abs = path.join(dir, name);
      let text;
      try {
        if (!fs.statSync(abs).isFile()) continue;
        text = fs.readFileSync(abs, 'utf8');
      } catch { continue; }
      const lines = text.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^\s*(?:\/\/|\*|\/\*)/.test(line)) continue;  // comments and doc blocks
        if (RE.test(line)) {
          violations.push(`${fileRel}:${i + 1}: hardcoded 'system' — use systemPath() from lib/kit-artifacts`);
        }
      }
    }
  }

  return {
    passed: violations.length === 0,
    detail: violations.length === 0
      ? 'No script hardcodes the system dir — every repo-rooted system/ path resolves through paths.system_dir.'
      : `${violations.length} hardcoded system-dir join(s):\n  ` + violations.join('\n  '),
  };
}

// ─── INV-092: AGENTS.md does not contradict the Vital Signs (WS-527/ADR-069) ─
//
// The one measurement that made this an invariant rather than a convention:
// HomeBase's first AGENTS.md was CLAUDE.md with Claude→Codex substituted. Eight
// days later it named twelve directories that do not exist (`.Codex/workstream`,
// `.Codex/rules`, …) and had already lost four paragraphs CLAUDE.md gained
// after the copy. Nothing reported either, because nothing was watching.
//
// So the generated half is watched and the prose half is not. `absent` and
// `unmanaged` pass: not every repo ships an AGENTS.md, and one CWOS did not
// author is not CWOS's to police.
function checkAgentsMdMatchesVitalSigns(rootDir) {
  const r = checkAgentsMd(rootDir);
  return {
    passed: r.status !== 'fail' && r.status !== 'torn' && r.status !== 'no-state',
    detail: r.detail,
  };
}
