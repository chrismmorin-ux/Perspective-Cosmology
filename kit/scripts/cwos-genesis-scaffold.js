#!/usr/bin/env node
/**
 * cwos-genesis-scaffold.js — Empty-repo scaffold for /genesis (WS-321).
 *
 * Sibling to cwos-adopt-install.js for brand-new repos. Installs the kit in
 * dormant mode (M0): kit files in place, capture buffer initialized, but no
 * programs activated, no queue, no nags. Founder later runs /intend to ignite.
 *
 * What it does:
 *   1. Validate target is empty (or doesn't exist — create it)
 *   2. git init (if .git/ doesn't exist)
 *   3. Create dirs: .claude/, .claude/commands/, .claude/workstream/,
 *      .claude/workstream/events/, system/
 *   4. Copy kit/templates/system/intention.md → <target>/system/intention.md
 *   5. Compute SHA-256 of intention.md non-comment content (for later
 *      placeholder→content detection in /session-start Step 0c)
 *   6. Hardlink the M0-relevant commands from kit/commands/ → .claude/commands/
 *   7. Write <target>/.cwos-onboarding.yaml from kit template, patched with
 *      adoption_phase: M0 + m0_dormant block populated
 *   8. Write <target>/.cwos-version with M0 + genesis: true markers
 *   9. Register in fleet/registry.yaml (in HomeBase) with status: dormant
 *
 * Failure mode: best-effort atomic rollback. If any step after directory
 * creation fails, the script attempts to remove .claude/, .cwos-version,
 * and system/intention.md if it created them.
 *
 * Usage:
 *   node kit/scripts/cwos-genesis-scaffold.js --target-dir <path> [--system-dir <name>]
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { writeFileAtomic, parseYAML, verifyHardlink, makeEventEmitter } = require('./lib/cwos-utils');

const emitEvent = makeEventEmitter();
const { hostedOnStamp } = require('./lib/fleet-nodes');
const { validateTargetDir } = require('./lib/shell-safe');
const { resolveDistRoot, resolveHomeBaseRoot } = require('./lib/kit-paths');

// WS-549: these were one KIT_ROOT, and they are two different things.
//
// Commands and templates are content the kit SHIPS — they travel with this
// script, so they come from the distribution.
const DIST_ROOT = resolveDistRoot();
const KIT_COMMANDS_DIR = path.join(DIST_ROOT, 'kit', 'commands');
const KIT_TEMPLATES_DIR = path.join(DIST_ROOT, 'kit', 'templates');

// The fleet registry exists on the hub and nowhere else. Resolved lazily so a
// scaffold run outside HomeBase fails at the registration step with a clear
// message, rather than silently writing a registry into the distribution.
function fleetRegistryPath() {
  const hub = resolveHomeBaseRoot();
  return hub ? path.join(hub, 'fleet', 'registry.yaml') : null;
}

// WS-611: the M0 distribution list used to live HERE, as three private
// constants. That placement was the defect: kit/MANIFEST.yaml is validated by
// INV-064 and INV-073, and a JavaScript array inside a script is invisible to
// both — so M0_SCRIPTS shipped lib/tier-mapper.js without the lib/kit-paths.js
// it hard-requires and every scaffolded repo died at the first archetype
// command. The lists now live in lib/m0-manifest.js, where INV-064 reads them
// and fails the release if the script list is not require-closed.
const {
  M0_SCRIPTS,
  M0_SCHEMA_DIRS,
  M0_COMMANDS,
  M0_PROGRAM_TEMPLATES_GLOB,
} = require('./lib/m0-manifest');

// Data files — archetype + stage + ignition-template definitions read by
// cwos-genesis-ignite.js propose, and by tier-mapper.js for every archetype/
// stage command the scaffolded repo will run.
//
// WS-607: this used to be a hardcoded list, and that was the defect rather than
// a convenience. It duplicated what kit/MANIFEST.yaml is for, so /genesis and
// /adopt shipped DIFFERENT sets of kit/data with nothing making them agree —
// which is why /genesis repos worked while every /adopt repo hard-failed ENOENT
// for months (WS-596). Two lists, one of them private, is the bug.
//
// Now derived: whatever MANIFEST ships, plus the genesis-only ignition
// templates MANIFEST deliberately withholds from adopted repos. Both halves
// come from lib/kit-data-manifest.js, so there is exactly one place that
// answers this and the two paths cannot drift apart again. INV-064 fails the
// release if a file under kit/data belongs to neither half.
function m0DataFiles() {
  const { manifestDataFiles, genesisOnlyDataFiles } = require('./lib/kit-data-manifest');
  return [...manifestDataFiles(DIST_ROOT), ...genesisOnlyDataFiles(DIST_ROOT)];
}

function readFlag(args, name) {
  const i = args.indexOf(`--${name}`);
  if (i < 0 || i === args.length - 1) return null;
  return args[i + 1];
}

function writeJson(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

function dieWith(code, msg) {
  process.stderr.write(`cwos-genesis-scaffold: ${msg}\n`);
  process.exit(code);
}

// WS-591: UTC ISO-8601 with a trailing Z, deliberately — this feeds both the
// repo's .cwos-version#adopted_at and the fleet registry's adopted_at /
// registered_at, and the fleet convention (see fleet/registry.yaml header) is
// that every registry timestamp is UTC. A local-time formatter here would
// reintroduce the offset-less values WS-591 had to reconcile by hand.
function nowISO() {
  return new Date().toISOString();
}

function sha256OfNonCommentContent(text) {
  // Strip HTML comments <!-- ... --> and full-line comments (lines starting
  // with `<!--` and ending with `-->`) so the hash represents the founder's
  // actual content, not the template's authoring notes.
  const stripped = text
    .replace(/<!--[\s\S]*?-->/g, '')   // remove HTML comment blocks
    .replace(/^\s*$/gm, '')             // collapse whitespace-only lines
    .trim();
  return crypto.createHash('sha256').update(stripped, 'utf8').digest('hex');
}

// Validate target is empty (or doesn't exist).
function validateTarget(targetDir) {
  if (!fs.existsSync(targetDir)) return { ok: true, willCreate: true };
  const stat = fs.statSync(targetDir);
  if (!stat.isDirectory()) {
    return { ok: false, reason: `target exists but is not a directory: ${targetDir}` };
  }
  const entries = fs.readdirSync(targetDir);
  // Allow .git as long as HEAD points to no commits (fresh `git init`).
  // Reject anything else.
  const blockers = entries.filter((e) => {
    if (e === '.git') {
      try {
        const headPath = path.join(targetDir, '.git', 'HEAD');
        if (!fs.existsSync(headPath)) return true; // weird state, refuse
        const head = fs.readFileSync(headPath, 'utf8').trim();
        // `ref: refs/heads/master\n` (no commits yet) is fine; an actual
        // 40-char SHA in HEAD means there's a commit.
        if (/^[0-9a-f]{40}$/.test(head)) return true;
        // Even if HEAD is a ref, check if the ref resolves to a commit.
        const refMatch = head.match(/^ref:\s*(.+)$/);
        if (refMatch) {
          const refFile = path.join(targetDir, '.git', refMatch[1]);
          if (fs.existsSync(refFile)) {
            const refContent = fs.readFileSync(refFile, 'utf8').trim();
            if (/^[0-9a-f]{40}$/.test(refContent)) return true;
          }
        }
        return false; // empty git repo, OK
      } catch {
        return true; // any error — be conservative, refuse
      }
    }
    return true;
  });
  if (blockers.length > 0) {
    return {
      ok: false,
      reason: `target is non-empty: ${blockers.join(', ')}`,
    };
  }
  return { ok: true, willCreate: false };
}

// Best-effort removal — used in rollback. Never throws.
function safeRemove(p) {
  try {
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  } catch { /* ignore */ }
}

function gitInitIfNeeded(targetDir) {
  const gitDir = path.join(targetDir, '.git');
  if (fs.existsSync(gitDir)) return false;
  try {
    execSync('git init', { cwd: targetDir, stdio: 'ignore' });
    return true;
  } catch (e) {
    // git not on PATH or init failed — non-fatal; founder can git init later.
    process.stderr.write(`cwos-genesis-scaffold: git init skipped — ${e.message}\n`);
    return false;
  }
}

function copyTemplate(srcRel, targetAbs) {
  const src = path.join(KIT_TEMPLATES_DIR, srcRel);
  if (!fs.existsSync(src)) {
    throw new Error(`template not found: ${src}`);
  }
  const content = fs.readFileSync(src, 'utf8');
  fs.mkdirSync(path.dirname(targetAbs), { recursive: true });
  writeFileAtomic(targetAbs, content);
  return content;
}

// Phase F: hardlink-or-copy a single file from KIT_ROOT/<srcRel> to
// targetAbs/<srcRel>. Returns {ok, mode} where mode is 'hardlink' or 'copy'.
// Cross-volume hardlink failures fall back to copy with a warning logged.
function installAsset(srcRel, targetAbs, errors) {
  const src = path.join(DIST_ROOT,srcRel);
  const dst = path.join(targetAbs, srcRel);
  if (!fs.existsSync(src)) {
    return { ok: false, skipped: true, reason: 'source missing' };
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  try {
    if (fs.existsSync(dst)) fs.rmSync(dst, { force: true });
    fs.linkSync(src, dst);
    // WS-382: linkSync not throwing is not proof of a hardlink. Confirm the
    // inode before claiming one, or the caller records a link that isn't there.
    if (!verifyHardlink(src, dst)) {
      errors.push(`${srcRel}: linkSync succeeded but inode check failed — treating as copy. Edits will NOT propagate; re-run cwos-node-bootstrap.js after install.`);
      return { ok: true, mode: 'copy', link_unverified: true };
    }
    return { ok: true, mode: 'hardlink' };
  } catch (e) {
    try {
      fs.copyFileSync(src, dst);
      errors.push(`${srcRel}: hardlink failed (${e.code || e.message}); fell back to copy`);
      return { ok: true, mode: 'copy' };
    } catch (e2) {
      errors.push(`${srcRel}: link AND copy both failed — ${e2.message}`);
      return { ok: false, error: e2.message };
    }
  }
}

// Phase F: recursively install everything under KIT_ROOT/<srcDirRel> into
// targetAbs/<srcDirRel>, mirroring directory structure. Used for the schemas
// tree where new payload types are added over time.
function installDirRecursive(srcDirRel, targetAbs, errors) {
  const src = path.join(DIST_ROOT,srcDirRel);
  if (!fs.existsSync(src)) return { copied: 0, skipped: true };
  const stat = fs.statSync(src);
  if (!stat.isDirectory()) return { copied: 0, skipped: true };

  let copied = 0;
  function walk(currentSrc) {
    for (const entry of fs.readdirSync(currentSrc, { withFileTypes: true })) {
      const childSrc = path.join(currentSrc, entry.name);
      if (entry.isDirectory()) { walk(childSrc); continue; }
      // Compute path relative to KIT_ROOT
      const rel = path.relative(DIST_ROOT, childSrc).replace(/\\/g, '/');
      const r = installAsset(rel, targetAbs, errors);
      if (r.ok) copied += 1;
    }
  }
  walk(src);
  return { copied };
}

// Phase F: glob-style install for files matching a pattern (used for
// program templates — kit/templates/workstream/programs/prog-*.yaml).
function installGlob(pattern, targetAbs, errors) {
  const dir = path.dirname(pattern);
  const fileGlob = path.basename(pattern); // e.g. "prog-*.yaml"
  const re = new RegExp('^' + fileGlob.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
  const srcDir = path.join(DIST_ROOT,dir);
  if (!fs.existsSync(srcDir)) return { copied: 0, skipped: true };
  let copied = 0;
  for (const f of fs.readdirSync(srcDir)) {
    if (!re.test(f)) continue;
    const rel = path.posix.join(dir, f);
    const r = installAsset(rel, targetAbs, errors);
    if (r.ok) copied += 1;
  }
  return { copied };
}

function hardlinkCommand(name, targetCommandsDir, errors) {
  const src = path.join(KIT_COMMANDS_DIR, `${name}.md`);
  const dst = path.join(targetCommandsDir, `${name}.md`);
  if (!fs.existsSync(src)) {
    // Skip silently for commands that don't exist yet (e.g., /intend in
    // Phase A before Phase C ships). Re-running /genesis after Phase C
    // will pick them up via /fleet-update.
    return { ok: false, skipped: true, reason: 'source missing' };
  }
  try {
    if (fs.existsSync(dst)) fs.rmSync(dst, { force: true });
    fs.linkSync(src, dst);
    // WS-382: verify the inode rather than trusting that linkSync returned.
    // A silent copy here is the SYN /next-disappeared root cause — the command
    // markdown stops tracking the kit and the founder sees stale behaviour with
    // no error anywhere.
    if (!verifyHardlink(src, dst)) {
      errors.push(`${name}: linkSync succeeded but inode check failed — treating as copy. Edits will NOT propagate; run /fleet-update to relink.`);
      return { ok: true, hardlink: false, link_unverified: true };
    }
    return { ok: true, hardlink: true };
  } catch (e) {
    // Cross-filesystem or permission failure — fall back to copy with a warning.
    try {
      fs.copyFileSync(src, dst);
      errors.push(`${name}: hardlink failed (${e.message}); fell back to copy — run /fleet-update later to relink`);
      return { ok: true, hardlink: false };
    } catch (e2) {
      errors.push(`${name}: link AND copy both failed — ${e2.message}`);
      return { ok: false, error: e2.message };
    }
  }
}

// Patch a top-level scalar field value. Drops any trailing inline comment —
// the CWOS YAML parser (kit/scripts/lib/cwos-utils.js) doesn't strip inline
// comments, so leaving them in would cause the comment text to become part of
// the parsed value (per feedback_yaml_parser_quirks.md / INV-022).
function patchTopLevelScalar(raw, field, newValue) {
  const re = new RegExp(`^(${escapeRegex(field)}:\\s*)(\\S+?)(\\s*(?:#.*)?)$`, 'm');
  return raw.replace(re, (m, prefix) => `${prefix}${newValue}`);
}

// Patch an indented scalar within a parent block (e.g., `m0_dormant.entered_at`).
// Same trailing-comment caveat as patchTopLevelScalar.
function patchIndentedScalar(raw, field, newValue, indent = '  ') {
  const re = new RegExp(`^(${escapeRegex(indent)}${escapeRegex(field)}:\\s*)(\\S+?)(\\s*(?:#.*)?)$`, 'm');
  return raw.replace(re, (m, prefix) => `${prefix}${newValue}`);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildOnboardingYaml(now, intentionHash, systemDir) {
  // Read the kit template and patch in the dormant + header values via
  // per-field surgical replacements. This preserves the template's copious
  // comments and trailing annotations — they are load-bearing for human
  // readers and for future evaluators.
  const templatePath = path.join(KIT_TEMPLATES_DIR, 'cwos-onboarding.yaml');
  let raw = fs.readFileSync(templatePath, 'utf8');

  // Top-level header values
  raw = patchTopLevelScalar(raw, 'started_at', `"${now}"`);
  raw = patchTopLevelScalar(raw, 'platform', `"${process.platform}"`);
  raw = patchTopLevelScalar(raw, 'adoption_phase', 'M0');

  // m0_dormant block — patch each field individually within its 2-space indent.
  // Note: even fields that stay at their `null` default need a patch pass to
  // strip inline comments — the CWOS YAML parser handles `true`/`false` but
  // not `null` w/ trailing comment (parses it as a string). Patching with the
  // same value drops the comment as a side effect.
  raw = patchIndentedScalar(raw, 'entered_at', `"${now}"`);
  raw = patchIndentedScalar(raw, 'exited_at', 'null');
  raw = patchIndentedScalar(raw, 'exit_trigger', 'null');
  raw = patchIndentedScalar(raw, 'intention_content_hash', `"${intentionHash}"`);
  raw = patchIndentedScalar(raw, 'kit_files_installed', 'true');
  raw = patchIndentedScalar(raw, 'capture_buffer_present', 'true');
  raw = patchIndentedScalar(raw, 'intention_template_present', 'true');

  return raw;
}

// WS-547: this used to write `kit_version:` and nothing else — a field that
// /adopt never writes and that three of the four version readers never looked
// for. siteproof, scaffolded this way, resolved to the literal string 'unknown'
// and asked git for the tag `kit-vunknown`; the lookup failed open and every
// upgrade of it was a stamped no-op. `version:` is the canonical field that
// lib/kit-version.js resolves first.
function buildVersionFile(now, kitVersion) {
  return [
    '# CWOS Version Stamp — written by /genesis',
    `version: "${kitVersion}"`,
    '# kit_version is retained for back-compat with stamps written before WS-547.',
    '# Do not add new readers — resolve via kit/scripts/lib/kit-version.js instead.',
    `kit_version: "${kitVersion}"`,
    `installed_at: "${now}"`,
    'install_path: /genesis',
    'adoption_phase: M0',
    'genesis: true',
    '',
  ].join('\n');
}

function readKitVersion() {
  const versionPath = path.join(DIST_ROOT,'kit', 'VERSION');
  if (!fs.existsSync(versionPath)) return 'unknown';
  return fs.readFileSync(versionPath, 'utf8').trim();
}

function appendToFleetRegistry(targetDir, repoName, kitVersion, now, errors) {
  const FLEET_REGISTRY = fleetRegistryPath();
  if (!FLEET_REGISTRY) {
    errors.push('not running inside HomeBase (no fleet/registry.yaml found) — skipped registration');
    return false;
  }
  if (!fs.existsSync(FLEET_REGISTRY)) {
    errors.push(`fleet registry not found at ${FLEET_REGISTRY} — skipped registration`);
    return false;
  }
  try {
    const raw = fs.readFileSync(FLEET_REGISTRY, 'utf8');
    // Convert backslashes to forward slashes for cross-platform readability
    const targetForward = targetDir.replace(/\\/g, '/');
    // kit_version is written here for backstop visibility, but per WS-406 it is
    // a DEPRECATED CACHE — `cwos-fleet-scan` reads `.cwos-version` from each
    // repo directly. New consumers should not treat this field as authoritative.
    // WS-496 / ADR-057: multi-node registries get hosted_on: [<current node id>]
    // resolved via lib/fleet-nodes.js. Unknown host → warn, stamp nothing (the
    // legacy default_host fallback applies). Single-node registries: no change.
    let registryData = {};
    try { registryData = parseYAML(raw) || {}; } catch (_) { /* text-append still works */ }
    const stamp = hostedOnStamp(registryData);
    if (stamp.warning) errors.push(stamp.warning);
    const entry = [
      '',
      `  - name: "${repoName}"`,
      `    path: "${targetForward}"`,
      '    type: unknown        # set at ignition by /intend (from archetype bundle)',
      '    capabilities_enabled: []',
      '    maturity: M0',
      // WS-591: registered_at is the UTC DATE of the same instant adopted_at
      // records in full; both come from nowISO() so they cannot disagree.
      `    registered_at: "${now.slice(0, 10)}"`,
      `    adopted_at: "${now}"`,
      `    kit_version: "${kitVersion}"`,
      '    status: dormant      # WS-321 — awaiting /intend to ignite',
      ...(stamp.id ? [`    hosted_on: [${stamp.id}]`] : []),
      '',
    ].join('\n');
    // Append at end. The registry is a list under top-level `repos:`.
    const out = raw.endsWith('\n') ? raw + entry : raw + '\n' + entry;
    writeFileAtomic(FLEET_REGISTRY, out);
    return true;
  } catch (e) {
    errors.push(`fleet registry append failed: ${e.message}`);
    return false;
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const targetDir = readFlag(args, 'target-dir');
  const systemDir = readFlag(args, 'system-dir') || 'system';

  if (!targetDir) {
    dieWith(2, 'usage: cwos-genesis-scaffold.js --target-dir <path> [--system-dir <name>]');
  }

  // WS-381 / INV-F1: reject path-traversal and system-location targets BEFORE
  // any destructive op. validateTargetDir throws SHELL_SAFE_REJECTED on:
  //   - .. traversal segments
  //   - null bytes / newlines
  //   - Windows: C:\Windows, C:\Program Files, C:\ProgramData, bare drive root
  //   - POSIX:   /etc, /usr, /var, /opt, /sys, /proc, /bin, /sbin, /boot, /root
  try {
    validateTargetDir(targetDir);
  } catch (e) {
    if (e && e.code === 'SHELL_SAFE_REJECTED') {
      dieWith(2, `${e.message}\n  /genesis refuses to scaffold into protected or traversed paths.\n  Pass a normal repo path under your dev directory.`);
    }
    throw e;
  }

  const targetAbs = path.resolve(targetDir);

  const validation = validateTarget(targetAbs);
  if (!validation.ok) {
    dieWith(3, `refused: ${validation.reason}\n  /genesis is for empty repos only.\n  For repos with existing code: run /adopt <path>\n  For CWOS-installed repos: run /onboard-check`);
  }

  const created = []; // tracked for rollback
  const errors = [];
  const now = nowISO();
  const kitVersion = readKitVersion();
  const repoName = path.basename(targetAbs);

  try {
    // 1. Create target dir if needed
    if (validation.willCreate) {
      fs.mkdirSync(targetAbs, { recursive: true });
      created.push(targetAbs);
    }

    // 2. git init
    const didGitInit = gitInitIfNeeded(targetAbs);

    // 3. Create directory structure
    const dirs = [
      path.join(targetAbs, '.claude'),
      path.join(targetAbs, '.claude', 'commands'),
      path.join(targetAbs, '.claude', 'workstream'),
      path.join(targetAbs, '.claude', 'workstream', 'events'),
      path.join(targetAbs, systemDir),
    ];
    for (const d of dirs) {
      fs.mkdirSync(d, { recursive: true });
      created.push(d);
    }

    // 4. Copy intention.md template
    const intentionTarget = path.join(targetAbs, systemDir, 'intention.md');
    const intentionContent = copyTemplate(
      path.join('system', 'intention.md'),
      intentionTarget
    );
    created.push(intentionTarget);

    // 5. Compute placeholder hash
    const intentionHash = sha256OfNonCommentContent(intentionContent);

    // 6. Hardlink M0 commands
    const targetCommandsDir = path.join(targetAbs, '.claude', 'commands');
    const linkResults = {};
    for (const cmd of M0_COMMANDS) {
      linkResults[cmd] = hardlinkCommand(cmd, targetCommandsDir, errors);
    }

    // 6b. (Phase F) Install scripts, schemas, data, program templates so the
    // founder can operate from inside the scaffolded dir. Without this step,
    // /intend and /session-end fail because their command markdown invokes
    // node kit/scripts/... paths that don't exist locally.
    const assetResults = {
      scripts: { ok: 0, skipped: 0, failed: 0 },
      schemas: 0,
      data: { ok: 0, skipped: 0, failed: 0 },
      program_templates: 0,
    };
    for (const srcRel of M0_SCRIPTS) {
      const r = installAsset(srcRel, targetAbs, errors);
      if (r.ok) assetResults.scripts.ok += 1;
      else if (r.skipped) assetResults.scripts.skipped += 1;
      else assetResults.scripts.failed += 1;
    }
    for (const dirRel of M0_SCHEMA_DIRS) {
      const r = installDirRecursive(dirRel, targetAbs, errors);
      assetResults.schemas += r.copied || 0;
    }
    // WS-607: data is NOT allowed to fail soft, unlike M0_SCRIPTS above.
    // installAsset returns skipped:true for a missing source, which is right
    // for optional scripts and wrong here — a scaffolded repo missing its
    // archetype/stage data is precisely the WS-596 failure arriving from the
    // /genesis direction, and it would be silent until the founder's first
    // archetype command died ENOENT. These paths are DERIVED from MANIFEST, so
    // a missing one means the kit is internally inconsistent: say so, loudly,
    // while the scaffold is still in front of someone.
    for (const srcRel of m0DataFiles()) {
      const r = installAsset(srcRel, targetAbs, errors);
      if (r.ok) assetResults.data.ok += 1;
      else if (r.skipped) {
        assetResults.data.skipped += 1;
        errors.push(`${srcRel}: declared by kit/MANIFEST.yaml (or as genesis-only) but absent from the distribution — the scaffolded repo will fail ENOENT in every archetype/stage command`);
      } else assetResults.data.failed += 1;
    }
    {
      const r = installGlob(M0_PROGRAM_TEMPLATES_GLOB, targetAbs, errors);
      assetResults.program_templates = r.copied || 0;
    }

    // 7. Write .cwos-onboarding.yaml
    const onboardingPath = path.join(targetAbs, '.cwos-onboarding.yaml');
    const onboardingContent = buildOnboardingYaml(now, intentionHash, systemDir);
    writeFileAtomic(onboardingPath, onboardingContent);
    created.push(onboardingPath);

    // 8. Write .cwos-version
    const versionPath = path.join(targetAbs, '.cwos-version');
    writeFileAtomic(versionPath, buildVersionFile(now, kitVersion));
    created.push(versionPath);
    // WS-560 (INV-028): .cwos-version is the marker that an install happened
    // at all, and the prerequisite for --repair. Writing it is the moment a
    // directory becomes a CWOS repo.
    emitEvent('T6:workstream', 'genesis-scaffolded', { repo: repoName, kit_version: kitVersion });

    // 9. Register in fleet
    const fleetRegistered = appendToFleetRegistry(targetAbs, repoName, kitVersion, now, errors);

    // Done. Emit summary.
    writeJson({
      ok: true,
      target: targetAbs,
      repo_name: repoName,
      adoption_phase: 'M0',
      kit_version: kitVersion,
      entered_at: now,
      git_initialized: didGitInit,
      created: {
        dirs: dirs.length,
        intention_md: true,
        onboarding_yaml: true,
        version_file: true,
      },
      commands: linkResults,
      assets: assetResults,
      fleet_registered: fleetRegistered,
      intention_content_hash: intentionHash,
      errors,
    });
  } catch (err) {
    // Rollback: best-effort cleanup of anything we created
    for (const p of created.reverse()) safeRemove(p);
    dieWith(4, `scaffold failed: ${err.message}\n  partial install rolled back`);
  }
}

// WS-544: guard the entry point so requiring this file for a dependency
// smoke check does not run it.
if (require.main === module) main();
