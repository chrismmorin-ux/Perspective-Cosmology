'use strict';

/**
 * m0-manifest.js — the single answer to "what does /genesis install at M0"
 * (WS-611).
 *
 * WHY THIS MODULE EXISTS. These three lists used to be private constants inside
 * cwos-genesis-scaffold.js, and that placement was the defect rather than a
 * detail. `kit/MANIFEST.yaml` is the distribution map every gate in the kit
 * validates — INV-064 walks the require() graph of everything it registers,
 * INV-073 walks the invocation edges of everything its commands name. A
 * JavaScript array inside a script is invisible to both, so the M0 distribution
 * had all of MANIFEST's responsibilities and none of its guarantees.
 *
 * It failed exactly the way an ungated list fails. `M0_SCRIPTS` shipped
 * `lib/tier-mapper.js` without the `lib/kit-paths.js` it hard-requires, so every
 * freshly scaffolded repo died at the founder's first archetype command:
 *
 *     $ node kit/scripts/cwos-stage.js resolve --archetype A4 --stage S2
 *     Error: Cannot find module './kit-paths'
 *
 * That was found by scaffolding a probe repo and RUNNING the command (WS-607),
 * not by reading the list — because reading the list is what missed it in the
 * first place. Two more modules were in the same state. Adding the three fixed
 * the instances and left the class exactly as it found it.
 *
 * WHY THE LISTS ARE STILL LISTS. Deriving M0_SCRIPTS as "seeds + full require
 * closure" was considered and rejected (WS-611). The closure over hard AND
 * guarded requires is 38 modules against the 23 seeded here; deriving would push
 * 15 more files into every scaffolded repo, 13 of them behind try/catch and
 * therefore optional by design. M0 is a deliberately small dormant install, and
 * silently tripling parts of it to satisfy a gate is a behaviour change to a
 * working path, not a fix. The list stays curated; what changes is that it is
 * now GATED — see checkM0Closure() in cwos-manifest-deps-validate.js, which
 * fails the release when anything here hard-requires a module absent from here.
 *
 * Consumers:
 *   cwos-genesis-scaffold.js        — installs exactly these at scaffold time
 *   cwos-manifest-deps-validate.js  — asserts the script list is require-closed
 *                                     over hard requires (INV-064)
 */

const fs = require('fs');
const path = require('path');

/**
 * Phase F (WS-321): assets installed at scaffold time so the founder can
 * operate from inside the scaffolded directory (cd in, run /intend, etc.).
 * Without these, the hardlinked command markdown references `node
 * kit/scripts/...` paths that don't resolve in the target. See ADR-046 +
 * docs/genesis-flow.md.
 *
 * Each entry is repo-relative (from the dist root, which is HomeBase at scaffold
 * time and the target repo at command-execution time — paths mirror).
 *
 * ADDING AN ENTRY IS FREE. REMOVING ONE IS NOT: the gate only proves the list is
 * closed, it cannot prove an entry is still needed.
 */
const M0_SCRIPTS = [
  // Entry-point scripts the M0 commands invoke
  'kit/scripts/cwos-event.js',
  'kit/scripts/cwos-genesis-ignite.js',
  'kit/scripts/cwos-adopt-archetype.js',
  // WS-611: /feedback, /session-end and /onboard-check all invoke this
  // UNGUARDED, and M0 is defined as the phase where the capture buffer is the
  // only durable state there is. It was absent — a founder recording friction in
  // a dormant repo hit "Cannot find module". Found by the M0 command-coverage
  // report added with this item's gate.
  'kit/scripts/cwos-capture.js',
  // Post-ignition entry-points so founders can operate from inside the
  // scaffolded target after /intend ignites (cd-from-target workflow).
  // Required for /archetype re + /stage transitions to work locally; also
  // load-bearing for WS-322 tripwire visibility (/pulse + /status).
  'kit/scripts/cwos-rearchetype.js',
  'kit/scripts/cwos-stage.js',
  'kit/scripts/cwos-pulse.js',
  'kit/scripts/cwos-status-pre.js',
  'kit/scripts/cwos-asn-report.js',
  // Lib modules required by the entry-point scripts
  'kit/scripts/lib/preflight.js',
  'kit/scripts/lib/cwos-utils.js',
  'kit/scripts/lib/cli.js',
  'kit/scripts/lib/tier-mapper.js',
  'kit/scripts/lib/cwos-tripwires.js',  // WS-322 evaluator (Phase B)
  // WS-607: hard requires of the entry-points above that this list omitted.
  // Kept named as a group because they are the evidence for the gate that now
  // guards them — see the header.
  'kit/scripts/lib/kit-paths.js',
  // WS-703: sibling of kit-paths — resolves artifact paths from the repo's
  // own declaration. Three M0 entry-points hard-require it.
  'kit/scripts/lib/kit-artifacts.js',
  'kit/scripts/lib/cwos-orchestrate.js',
  'kit/scripts/lib/worktree-guard.js',
  // Core modules required by cwos-event.js
  'kit/scripts/core/events.js',
  'kit/scripts/core/composition.js',
  'kit/scripts/core/canonical-json.js',
  'kit/scripts/core/health-scoring.js',  // required by cwos-pulse.js (fail-soft but cleaner with it)
  // Optional core modules — events.js / cwos-event.js use try/catch around these,
  // so missing files fail soft. Including them keeps the install complete.
  'kit/scripts/core/render-events.js',
  'kit/scripts/core/telemetry.js',
  'kit/scripts/core/state-store.js',
  'kit/scripts/core/chain-anchors.js',
];

/**
 * Schemas — strict T0:envelope validation requires every emitted event type to
 * have a matching schema file. T20:capture-buffer is tolerant (warn-only). We
 * mirror the whole schemas/ tree because the kit can grow new event types and
 * missing schemas would silently drop validation.
 *
 * A DIRECTORY, not a file list, and that is the completeness argument: "copy
 * everything under here" cannot omit a member. The only failure it can have is
 * naming a directory that does not exist, which checkM0Closure() fails on.
 */
const M0_SCHEMA_DIRS = [
  'kit/scripts/core/schemas',  // recursive copy
];

/**
 * Commands hardlinked at M0. Excludes anything that requires programs/queue
 * (next, workstream, engine, build-engine, plan, verify, decide, audit, pulse,
 * archetype, stage, evolve, etc.) — those install at ignition.
 *
 * NOT gated as hard as M0_SCRIPTS, deliberately. See the command-coverage note
 * in cwos-manifest-deps-validate.js: a command is prose a session degrades
 * around (CLAUDE.md, Graceful Degradation), a require() is not. The edges are
 * reported so the gaps are visible; only the require graph fails the build.
 */
const M0_COMMANDS = [
  'genesis',        // self-reference — for /genesis --help / re-running
  'intend',         // ignition trigger (Phase C; safe to skip if missing)
  'status',         // dormant view
  'session-start',  // lean briefing in M0
  'session-end',    // capture-buffer write paths
  'feedback',       // founder can record friction even in M0
  'onboard-check',  // re-evaluate progress (transitions to /intend prompt when ready)
];

/** Program templates — cwos-genesis-ignite.js apply copies these into the
 * target's .claude/workstream/programs/ filtered by bundle.programs[]. Need all
 * of them available because the founder picks archetype at /intend time. */
const M0_PROGRAM_TEMPLATES_GLOB = 'kit/templates/workstream/programs/prog-*.yaml';

function toPosix(p) {
  return String(p).split('\\').join('/');
}

/** M0 script entries that do not exist in the distribution at `root`. */
function absentM0Scripts(root) {
  return M0_SCRIPTS.filter((rel) => !fs.existsSync(path.join(root, toPosix(rel))));
}

/** M0 schema directories that do not exist in the distribution at `root`. */
function absentM0SchemaDirs(root) {
  return M0_SCHEMA_DIRS.filter((rel) => {
    const abs = path.join(root, toPosix(rel));
    return !fs.existsSync(abs) || !fs.statSync(abs).isDirectory();
  });
}

module.exports = {
  M0_SCRIPTS,
  M0_SCHEMA_DIRS,
  M0_COMMANDS,
  M0_PROGRAM_TEMPLATES_GLOB,
  absentM0Scripts,
  absentM0SchemaDirs,
};
