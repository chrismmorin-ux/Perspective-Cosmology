'use strict';

/**
 * kit-artifacts — the one place that answers "where does artifact X live in
 * repo R?" (WS-703).
 *
 * Sibling of lib/kit-paths.js, which answers "which ROOT do I mean?". That
 * module retired 19 sites that counted parent directories; this one retires 24
 * sites that hardcoded `system/` while `.cwos-config.yaml` carried a
 * `paths.system_dir` declaration meant to govern them — a contract stated
 * outright in CLAUDE.md ("Read system_dir from .cwos-config.yaml (default:
 * system). Substitute in all system/ file references") and honoured by three
 * scripts out of twenty-seven.
 *
 * Proposed by ServeYourNote in docs/fleet-contract.md §1: a repo DECLARES where
 * its things are, and tooling READS that rather than inferring. The ARTIFACTS
 * table below is that document, in code.
 *
 * Why it matters more across repos than inside one. Two of the 24 sites read
 * OTHER repos — cwos-fleet-scan (state.md) and capability-detect (decisions.md,
 * which gates the autonomous capability). A repo declaring `system_dir: .cwos`
 * would have both reported absent, and an absent file and a mis-resolved path
 * render identically. That is MIS-006's shape exactly: engines/registry.yaml
 * called ABSENT in ServeYourNote off a `find -maxdepth 3` when the file sits at
 * depth 4. A false finding reached a customer-facing envelope before their own
 * session falsified it.
 *
 * The rule this module enforces: **resolution, never search.** Every path here
 * is computed from a declaration or a fixed kit default. No readdir, no walk,
 * no depth limit — because a bounded search that misses is indistinguishable
 * from a file that is not there, and that ambiguity is the whole defect.
 *
 * Deliberately NOT declarable: workstream_dir and commands_dir. Nothing reads
 * such a declaration today, and INV-068 fails a kit that declares a mechanism
 * nothing honours. They appear here as fixed defaults so callers have one
 * lookup, not as promises the kit cannot keep.
 */

const fs = require('fs');
const path = require('path');

const { readYAMLFile, boundedSystemDir, SafeWriteError } = require('./cwos-utils');

// Each entry: where the artifact lives, and what (if anything) may relocate it.
//
//   base       'system' | 'workstream' | 'repo' — which root the rel is under
//   rel        path beneath that base, fixed by the kit
//   declarable the .cwos-config.yaml key that may move it, or null
//
// `system`-based entries move as a group via paths.system_dir. That is the only
// live declaration, and this pass is what makes it actually govern.
const ARTIFACTS = {
  state:            { base: 'system',     rel: 'state.md',                   declarable: 'paths.system_dir' },
  invariants:       { base: 'system',     rel: 'invariants.md',              declarable: 'paths.system_dir' },
  decisions:        { base: 'system',     rel: 'decisions.md',               declarable: 'paths.system_dir' },
  constraints:      { base: 'system',     rel: 'constraints.md',             declarable: 'paths.system_dir' },
  failures:         { base: 'system',     rel: 'failures.md',                declarable: 'paths.system_dir' },
  context:          { base: 'system',     rel: 'context.md',                 declarable: 'paths.system_dir' },
  intention:        { base: 'system',     rel: 'intention.md',               declarable: 'paths.system_dir' },
  events_log:       { base: 'system',     rel: 'events.log.md',              declarable: 'paths.system_dir' },
  engines_registry: { base: 'workstream', rel: 'engines/registry.yaml',      declarable: null },
  queue_index:      { base: 'workstream', rel: 'queue-index.yaml',           declarable: null },
  sprint_index:     { base: 'workstream', rel: 'sprint-index.yaml',          declarable: null },
  queue_dir:        { base: 'workstream', rel: 'queue',                      declarable: null },
  programs_dir:     { base: 'workstream', rel: 'programs',                   declarable: null },
  findings_dir:     { base: 'workstream', rel: 'findings',                   declarable: null },
  config:           { base: 'repo',       rel: '.cwos-config.yaml',          declarable: null },
  onboarding:       { base: 'repo',       rel: '.cwos-onboarding.yaml',      declarable: null },
  version:          { base: 'repo',       rel: '.cwos-version',              declarable: null },
};

const DEFAULT_SYSTEM_DIR = 'system';
const WORKSTREAM_REL = path.join('.claude', 'workstream');

/** Read paths.system_dir for `repoRoot`, or null when undeclared/invalid.
 *  An invalid declaration is reported, not honoured and not silently taken —
 *  containment is boundedSystemDir's job and it throws on traversal. */
function declaredSystemDir(repoRoot) {
  if (!repoRoot) return null;
  const configPath = path.join(repoRoot, '.cwos-config.yaml');
  if (!fs.existsSync(configPath)) return null;
  const { ok, data } = readYAMLFile(configPath);
  if (!ok || !data || !data.paths || !data.paths.system_dir) return null;
  try {
    return boundedSystemDir(data.paths.system_dir);
  } catch (err) {
    if (err instanceof SafeWriteError && err.code === 'SYSTEM_DIR_INVALID') {
      process.stderr.write(`kit-artifacts: ignoring invalid paths.system_dir in ${configPath} — ${err.message}\n`);
      return null;
    }
    throw err;
  }
}

/** The system directory NAME for a repo — declaration if there is one, else
 *  the kit default. Never a search, so a repo that renamed it is resolved and a
 *  repo that did not is unaffected. */
function resolveSystemDir(repoRoot) {
  return declaredSystemDir(repoRoot) || DEFAULT_SYSTEM_DIR;
}

/** Absolute path to something under the repo's system dir.
 *  This is the call that replaces `path.join(root, 'system', 'state.md')`. */
function systemPath(repoRoot, ...parts) {
  return path.join(repoRoot, resolveSystemDir(repoRoot), ...parts);
}

/** Absolute path to something under the repo's workstream dir. */
function workstreamPath(repoRoot, ...parts) {
  return path.join(repoRoot, WORKSTREAM_REL, ...parts);
}

function baseDirFor(repoRoot, base) {
  if (base === 'system') return path.join(repoRoot, resolveSystemDir(repoRoot));
  if (base === 'workstream') return path.join(repoRoot, WORKSTREAM_REL);
  return repoRoot;
}

/**
 * Resolve one named artifact.
 *
 * Returns { key, path, base, source, declared, exists }. `source` is
 * 'declared' when a config key moved it and 'default' otherwise — so a caller
 * that reports an absence can say WHICH path it checked and WHY that path,
 * which is the reporting MIS-006 could not do.
 *
 * Throws on an unknown key rather than returning null: a typo'd artifact name
 * must not read as a missing file.
 */
function resolveArtifact(repoRoot, key) {
  const spec = ARTIFACTS[key];
  if (!spec) {
    throw new Error(`kit-artifacts: unknown artifact "${key}" (known: ${Object.keys(ARTIFACTS).join(', ')})`);
  }
  const declared = spec.declarable ? declaredSystemDir(repoRoot) : null;
  const full = path.join(baseDirFor(repoRoot, spec.base), ...spec.rel.split('/'));
  return {
    key,
    path: full,
    base: spec.base,
    source: declared ? 'declared' : 'default',
    declared: declared || null,
    exists: fs.existsSync(full),
  };
}

/**
 * Check every declaration in `.cwos-config.yaml` against the filesystem.
 *
 * Returns a list of violations — a declared path resolving to nothing, or a
 * declaration the containment check rejected. Empty list means the config
 * describes a repo that exists.
 *
 * This is the "fails loudly rather than reading as absent" half of WS-703
 * (founder decision, 2026-09-08: a reconcile violation every run, not a red
 * invariant — a config typo in an adopted repo should be visible without
 * turning that repo's build red).
 *
 * A repo with no config and no declaration is not a violation. Undeclared is
 * the normal state; the kit default is a real answer, not a guess.
 */
function validateDeclarations(repoRoot) {
  const violations = [];
  if (!repoRoot) return violations;
  const configPath = path.join(repoRoot, '.cwos-config.yaml');
  if (!fs.existsSync(configPath)) return violations;

  const { ok, data } = readYAMLFile(configPath);
  if (!ok) {
    violations.push({ key: 'paths', declared: null, path: configPath, reason: 'config-unreadable' });
    return violations;
  }
  const raw = data && data.paths && data.paths.system_dir;
  if (!raw) return violations;

  let bounded;
  try {
    bounded = boundedSystemDir(raw);
  } catch (err) {
    violations.push({
      key: 'paths.system_dir', declared: String(raw), path: null,
      reason: 'invalid', detail: err.message,
    });
    return violations;
  }

  const dir = path.join(repoRoot, bounded);
  if (!fs.existsSync(dir)) {
    violations.push({
      key: 'paths.system_dir', declared: bounded, path: dir,
      reason: 'declared-path-missing',
      detail: `.cwos-config.yaml declares paths.system_dir: ${bounded}, but ${dir} does not exist — every system/ artifact will read as absent`,
    });
  }
  return violations;
}

module.exports = {
  ARTIFACTS,
  DEFAULT_SYSTEM_DIR,
  declaredSystemDir,
  resolveSystemDir,
  systemPath,
  workstreamPath,
  resolveArtifact,
  validateDeclarations,
};
