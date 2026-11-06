#!/usr/bin/env node
/**
 * cwos-hash-manifest — generate the per-version kit file-hash baseline.
 *
 * Walks every `source` file declared in kit/MANIFEST.yaml, computes its
 * sha256, and writes kit/hashes-<version>.yaml. This baseline reaches adopted
 * repos via the explicit copy in cwos-kit-upgrade.js (step 3f) — NOT via a
 * MANIFEST entry; kit/hashes-*.yaml is deliberately absent from MANIFEST.yaml
 * so that HomeBase's historical baselines do not ship to every adopter. Once
 * there, /kit-upgrade uses it to detect locally hand-edited kit files: the
 * upgrade compares the adopter's current file hash against the baseline
 * recorded for their installed version and surfaces any divergence before
 * overwriting (the WS-040 hand-edit case).
 *
 * Run this at every kit release, right after bumping kit/VERSION and before
 * tagging kit-v<version> (see CLAUDE.md "Tag kit releases").
 *
 * ── Backfill (WS-548 / ADR-064 P2) ────────────────────────────────────────
 * The release path above can only hash the CURRENT working tree, so for most
 * of the kit's history no baseline was ever written — 2 of 16 shipped versions
 * had one. The gap matters because the other way to answer "was this file
 * hand-edited since install?" is `git show kit-vX:<path>` against a HomeBase
 * clone (cwos-migrate.js), and run-027 established that the Claude Code plugin
 * cache is not a git repository. Once kit content ships as a plugin that
 * lookup has nothing to resolve against.
 *
 * `--from-tag` reconstructs a baseline from git objects at an already-released
 * tag, so history can be captured into files while git is still the source of
 * truth. Hashes on that path are over git blobs (LF) rather than working-tree
 * bytes (CRLF on Windows); that difference is absorbed by
 * lineEndingVariantHashes() in cwos-kit-upgrade.js, which accepts a baseline
 * matching any of the local file's three renderings. `hash_basis` in the
 * output records which path produced it.
 *
 * Usage:
 *   node kit/scripts/cwos-hash-manifest.js [--version <v>] [--homebase <path>]
 *                                          [--out <file>] [--check] [--json]
 *   node kit/scripts/cwos-hash-manifest.js --from-tag <tag> [--out <file>] [--force]
 *   node kit/scripts/cwos-hash-manifest.js --backfill-all [--force]
 *
 *   --version      override version (default: read kit/VERSION)
 *   --homebase     HomeBase root (default: walk up from this script)
 *   --out          output path (default: kit/hashes-<version>.yaml)
 *   --check        do not write; compare against an existing manifest and exit 1
 *                  if any hash drifted (CI guard that the committed manifest is fresh),
 *                  naming each changed, added or removed file. Line endings do
 *                  not count: files hash as git stores them (WS-1083)
 *   --from-tag     reconstruct the baseline for an already-released kit-v* tag
 *                  from git objects instead of the working tree
 *   --backfill-all reconstruct every kit-v* tag that has no baseline yet
 *   --force        allow --from-tag / --backfill-all to overwrite an existing
 *                  baseline (they refuse by default)
 *   --json         emit a JSON summary to stdout
 *
 * The release path (not --check, not backfill) refuses unless a per-commit
 * test sweep record with health OK covers the exact kit/scripts tree being
 * baselined (WS-986): run `node kit/scripts/cwos-test-sweep.js --commit` first.
 */

'use strict';

require('./lib/preflight');

const path = require('path');
const fs = require('fs');
const { loadManifest, sha256 } = require('./cwos-adopt-install');
const { parseYAML, makeEventEmitter } = require('./lib/cwos-utils');

const emitEvent = makeEventEmitter();
const { runGitInRepo, validateGitRef } = require('./lib/shell-safe');
const { gitCanonicalBytes, lineEndingVariantHashes } = require('./lib/kit-hash');

function findHomeBase(override) {
  if (override) return path.resolve(override);
  // This script lives in <HomeBase>/kit/scripts/.
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, 'kit', 'VERSION')) &&
        fs.existsSync(path.join(dir, 'kit', 'MANIFEST.yaml'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // WS-549: kit/VERSION and kit/MANIFEST.yaml are distribution content, so the
  // fallback is the distribution root rather than a hop count.
  return require('./lib/kit-paths').resolveDistRoot();
}

// Collect the distributable `source` paths out of a parsed MANIFEST files array.
// Shared by the working-tree path and the --from-tag path so both agree on what
// counts as a hashable source.
function sourcesFromManifestFiles(files) {
  const sources = new Set();
  if (!Array.isArray(files)) return sources;
  for (const entry of files) {
    if (entry && typeof entry.source === 'string' && entry.source.trim()) {
      const s = entry.source.trim();
      // hash manifests are baselines, not validated kit content — never hash them
      if (/^kit\/hashes-.*\.yaml$/.test(s)) continue;
      sources.add(s);
    }
  }
  return sources;
}

/**
 * path → the `i/` column of `git ls-files --eol` (lf, crlf, mixed, none, -text),
 * or null when git cannot answer (not a repo, plugin cache, no git on PATH).
 */
function indexEolMap(homebase) {
  let r;
  try {
    r = runGitInRepo(homebase, ['ls-files', '--eol', '-z'], { maxBuffer: 64 * 1024 * 1024 });
  } catch { return null; }
  if (!r || !r.ok) return null;
  const map = new Map();
  for (const rec of String(r.stdout).split('\0')) {
    const tab = rec.indexOf('\t');
    if (tab < 0) continue;
    const m = /^i\/(\S*)/.exec(rec.slice(0, tab));
    if (m) map.set(rec.slice(tab + 1), m[1]);
  }
  return map;
}

// Build { source: 'sha256:...' } over every distributable MANIFEST source.
// Sorted keys → deterministic, reviewable diffs across releases.
//
// WS-1083: the hash is over the bytes git stores for the file (gitCanonicalBytes),
// which is what a plain LF checkout — CI, a cloud session — reads. Raw
// working-tree bytes made a core.autocrlf checkout of a Linux-cut tag read
// stale on every text file, so the check could not tell "nothing changed"
// from "four scripts changed". `variants` holds, per source, every hash the
// file may carry across line endings (lineEndingVariantHashes — the same rule
// /kit-upgrade uses), so a baseline cut on a CRLF checkout still reads current.
function computeHashes(homebase) {
  const sources = sourcesFromManifestFiles(loadManifest(homebase));
  const eol = indexEolMap(homebase);
  const hashes = {};
  const variants = {};
  const missing = [];
  for (const source of [...sources].sort()) {
    const abs = path.join(homebase, source);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      missing.push(source);
      continue;
    }
    const raw = fs.readFileSync(abs);
    hashes[source] = sha256(gitCanonicalBytes(raw, eol ? eol.get(source) : undefined));
    variants[source] = lineEndingVariantHashes(raw).add(hashes[source]);
  }
  return { hashes, missing, variants };
}

// ─── Backfill from git objects (WS-548) ────────────────────────────────────

/** Raw bytes of one path at one ref, or null if it does not exist there. */
function readBlobAtRef(homebase, ref, filePath) {
  const r = runGitInRepo(homebase, ['cat-file', 'blob', `${ref}:${filePath}`], {
    encoding: 'buffer',
    maxBuffer: 64 * 1024 * 1024,
  });
  return r.ok ? r.stdout : null;
}

/** Every tracked path at `ref` beneath any of `prefixes`. */
function listTreeAtRef(homebase, ref, prefixes) {
  const r = runGitInRepo(homebase, ['ls-tree', '-r', '--name-only', ref, '--', ...prefixes], {
    maxBuffer: 32 * 1024 * 1024,
  });
  if (!r.ok) return [];
  return r.stdout.split('\n').map(s => s.trim()).filter(Boolean);
}

/** The top-level directories the current MANIFEST ships from (kit, engines, …). */
function manifestPrefixes(homebase) {
  const prefixes = new Set();
  for (const s of sourcesFromManifestFiles(loadManifest(homebase))) {
    const top = s.split('/')[0];
    if (top) prefixes.add(top + '/');
  }
  return [...prefixes].sort();
}

/**
 * Decide what file list describes a released tag.
 *
 * Preferred: that tag's own kit/MANIFEST.yaml — the authoritative record of
 * what the version shipped. kit-v2.0 and kit-v3.0 predate MANIFEST.yaml
 * entirely, so they fall back to the tag's tree beneath the directories the
 * kit ships from. The fallback is a RECONSTRUCTION, not a record — it says
 * "these files existed at that tag", which is a superset of what was
 * installed. `source_list: tree-fallback` in the output keeps that visible so
 * the two can never be confused.
 */
function sourcesAtTag(homebase, tag) {
  const manifestText = readBlobAtRef(homebase, tag, 'kit/MANIFEST.yaml');
  if (manifestText) {
    const data = parseYAML(manifestText.toString('utf8'));
    const sources = sourcesFromManifestFiles(data && data.files);
    if (sources.size) return { sources: [...sources].sort(), sourceList: 'manifest' };
  }
  const tree = listTreeAtRef(homebase, tag, manifestPrefixes(homebase));
  return { sources: tree.sort(), sourceList: 'tree-fallback' };
}

/**
 * Build the baseline for an already-released tag from git objects.
 *
 * `missing` here means "declared by that tag's manifest but absent from that
 * tag's tree" — a real inconsistency in the release, worth reporting, not an
 * error in this reconstruction.
 */
function computeHashesFromTag(homebase, tag) {
  validateGitRef(tag);
  const { sources, sourceList } = sourcesAtTag(homebase, tag);
  const hashes = {};
  const missing = [];
  for (const source of sources) {
    const buf = readBlobAtRef(homebase, tag, source);
    if (buf === null) { missing.push(source); continue; }
    hashes[source] = sha256(buf);
  }
  return { hashes, missing, sourceList };
}

/** "kit-v3.7.1" → "3.7.1". Returns null for anything not shaped like a kit tag. */
function versionFromTag(tag) {
  const m = /^kit-v(.+)$/.exec(String(tag).trim());
  return m ? m[1] : null;
}

/** Every kit-v* tag in the repo, oldest release first. */
function listKitTags(homebase) {
  const r = runGitInRepo(homebase, ['tag', '-l', 'kit-v*'], { maxBuffer: 4 * 1024 * 1024 });
  if (!r.ok) return [];
  const { compareSemver } = require('./lib/kit-version');
  return r.stdout.split('\n').map(s => s.trim()).filter(Boolean)
    .sort((a, b) => compareSemver(versionFromTag(a), versionFromTag(b)));
}

// ─── Output ────────────────────────────────────────────────────────────────

function renderYAML(version, hashes, generatedAt, provenance) {
  const lines = [
    '# CWOS kit file-hash baseline — generated by cwos-hash-manifest.js.',
    '# Copied into adopted repos by /kit-upgrade, which reads the entry matching',
    '# the installed version to detect locally hand-edited kit files before overwrite.',
    '# Do not hand-edit — regenerate at each release.',
    `version: "${version}"`,
    `generated_at: "${generatedAt}"`,
  ];
  // Provenance is written only on the backfill path, so the release path's
  // output — and therefore --check's byte comparison against hashes-3.8.x — is
  // unchanged.
  if (provenance) {
    lines.push(
      `hash_basis: "${provenance.hashBasis}"`,
      `source_list: "${provenance.sourceList}"`,
      `reconstructed_from: "${provenance.ref}"`
    );
  }
  lines.push(
    `file_count: ${Object.keys(hashes).length}`,
    'files:'
  );
  for (const source of Object.keys(hashes)) {
    lines.push(`  "${source}": "${hashes[source]}"`);
  }
  return lines.join('\n') + '\n';
}

function parseArgs(argv) {
  const opts = {
    version: null, homebase: null, out: null, check: false, json: false,
    fromTag: null, backfillAll: false, force: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--version' && argv[i + 1]) opts.version = argv[++i];
    else if (a === '--homebase' && argv[i + 1]) opts.homebase = argv[++i];
    else if (a === '--out' && argv[i + 1]) opts.out = argv[++i];
    else if (a === '--check') opts.check = true;
    else if (a === '--json') opts.json = true;
    else if (a === '--from-tag' && argv[i + 1]) opts.fromTag = argv[++i];
    else if (a === '--backfill-all') opts.backfillAll = true;
    else if (a === '--force') opts.force = true;
    else if (a === '--help' || a === '-h') {
      process.stdout.write([
        'Usage: cwos-hash-manifest.js [--version <v>] [--homebase <path>] [--out <file>] [--check] [--json]',
        '       cwos-hash-manifest.js --from-tag <tag> [--out <file>] [--force] [--json]',
        '       cwos-hash-manifest.js --backfill-all [--force] [--json]',
        '',
        'Release path (default): hash the working tree and write kit/hashes-<version>.yaml.',
        'It refuses unless a green per-commit test sweep covers this exact kit/scripts tree',
        '(run `node kit/scripts/cwos-test-sweep.js --commit` in this checkout first; no bypass).',
        'Backfill path: reconstruct a baseline for an already-released kit-v* tag from git',
        'objects. Refuses to overwrite an existing baseline without --force.',
      ].join('\n') + '\n');
      process.exit(0);
    } else {
      // ADR-063 guarantee 2: never act on an instruction we did not parse. This
      // parser used to fall through silently, so a typo'd flag produced a
      // confident, wrong release artifact.
      process.stderr.write(`cwos-hash-manifest: unknown argument: ${a}\n`);
      process.exit(2);
    }
  }
  return opts;
}

// WS-544: the manifest must be COMPLETE before it can be baselined. Hashing a
// manifest that omits a required module produces a release whose own file list
// is a lie — which is how four scripts reached claude-poker-tracker without
// lib/cli.js. This runs on both paths (generate and --check) because both are
// the release path, and there is deliberately no bypass flag.
function assertManifestComplete(homebase, opts) {
  const { checkManifestDeps, renderHuman } = require('./cwos-manifest-deps-validate');
  const result = checkManifestDeps(homebase);
  if (result.ok) return;

  if (opts.json) {
    process.stdout.write(JSON.stringify({
      ok: false,
      error: 'manifest dependency gate failed',
      violations: result.violations,
    }) + '\n');
  } else {
    process.stderr.write('ERROR: manifest dependency gate failed — refusing to baseline an incomplete manifest.\n');
    process.stderr.write(renderHuman(result));
    process.stderr.write('\nFix the violations above, or run:\n  node kit/scripts/cwos-manifest-deps-validate.js --human\n');
  }
  process.exit(1);
}

// WS-799: the gate the other five could not be. Every one of them starts from
// kit/MANIFEST.yaml and reasons outward — the require() graph between registered
// scripts, the invocation edges from shipped commands, declaration readers — so
// a file that is simply ABSENT from the manifest lies outside all of their
// domains. It has no row to be incoherent with.
//
// Shipping kit 3.26.0 on 2026-09-06: kit/commands/git.md reached master, this
// script reported "444 files hashed", and `grep -c kit/commands/git.md
// kit/hashes-3.26.0.yaml` returned 0. INV-064 exit 0 and INV-068 exit 0, both
// before AND after the missing row was added. "444 files hashed" was a true
// statement about what this was asked to hash and said nothing about what it
// should have hashed — a control that cannot detect its own inapplicability is
// not a control.
//
// It must run BEFORE computeHashes: a baseline that cannot be complete must not
// be written at all, because an unbaselined file in an adopted repo is
// indistinguishable from one the founder hand-edited, and that distinction is
// exactly what /kit-upgrade relies on to decide whether it may overwrite.
//
// Exclusions are exact paths with reasons in kit/manifest-exclusions.yaml — no
// globs, no bypass flag.
function assertNoUnregisteredKitFiles(homebase, opts) {
  let checkManifestCompleteness, renderHuman;
  try { ({ checkManifestCompleteness, renderHuman } = require('./cwos-manifest-completeness')); }
  catch { return; }

  const result = checkManifestCompleteness(homebase);
  // exit_code 2 = git unavailable, so completeness is unverifiable rather than
  // clean. Releases happen in a git checkout; refusing here would block the
  // backfill path that reconstructs baselines from git objects in odd contexts.
  if (result.ok || result.exit_code === 2) return;

  if (opts.json) {
    process.stdout.write(JSON.stringify({
      ok: false,
      error: 'manifest completeness gate failed',
      violations: result.violations,
    }) + '\n');
  } else {
    process.stderr.write('ERROR: manifest completeness gate failed — refusing to baseline a kit that has files MANIFEST.yaml does not describe.\n');
    process.stderr.write(renderHuman(result));
    process.stderr.write('\nAdd a MANIFEST row for each file above, or an entry with a reason in kit/manifest-exclusions.yaml, or run:\n  node kit/scripts/cwos-manifest-completeness.js --human\n');
  }
  process.exit(1);
}

// WS-562: the mirror image of the gate above. INV-064 asks whether every
// consumer's dependency ships; this asks whether every shipped declaration has
// a consumer. Both failures are invisible from inside HomeBase and both surface
// only in an adopted repo, which is why both block the release rather than
// warning at it.
//
// Registry absence degrades to PASS here (exit_code 2), unlike a violation. A
// distribution root without kit/declarations.yaml is a repo that predates this
// gate, not a repo shipping a dead declaration.
function assertDeclarationsLive(homebase, opts) {
  let checkDeclarationLiveness, renderHuman;
  try { ({ checkDeclarationLiveness, renderHuman } = require('./cwos-declaration-liveness')); }
  catch { return; }

  const result = checkDeclarationLiveness(homebase);
  if (result.ok || result.exit_code === 2) return;

  if (opts.json) {
    process.stdout.write(JSON.stringify({
      ok: false,
      error: 'declaration liveness gate failed',
      violations: result.violations,
    }) + '\n');
  } else {
    process.stderr.write('ERROR: declaration liveness gate failed — refusing to baseline a kit that declares mechanisms nothing reads.\n');
    process.stderr.write(renderHuman(result));
    process.stderr.write('\nFix the violations above, waive them with a tracked_by + expires in kit/declarations.yaml, or run:\n  node kit/scripts/cwos-declaration-liveness.js --human\n');
  }
  process.exit(1);
}

// WS-639: the third member of the family. INV-064 walks the require() graph
// between SCRIPTS; this walks the invocation edges from COMMANDS, which are
// markdown and therefore invisible to it. A shipping command naming a script the
// manifest omits is the same failure with the same symptom — absent in every
// adopted repo, present in HomeBase, so invisible from here.
//
// It is not hypothetical: /status Step 0d renders its Kit Health section from
// cwos-kit-health.js, and that script was missing from the install in two of the
// three repos checked on 2026-08-14. The tool that reports whether the kit
// installed correctly was itself missing from the install.
//
// No bypass flag, and no waiver registry — every violation this can raise is
// fixed by one row in kit/MANIFEST.yaml.
function assertCommandDepsShipped(homebase, opts) {
  let checkCommandDeps, renderHuman;
  try { ({ checkCommandDeps, renderHuman } = require('./cwos-command-deps-validate')); }
  catch { return; }

  const result = checkCommandDeps(homebase);
  if (result.ok || result.exit_code === 2) return;

  if (opts.json) {
    process.stdout.write(JSON.stringify({
      ok: false,
      error: 'command dependency gate failed',
      violations: result.violations,
    }) + '\n');
  } else {
    process.stderr.write('ERROR: command dependency gate failed — refusing to baseline a kit whose commands invoke scripts it does not ship.\n');
    process.stderr.write(renderHuman(result));
    process.stderr.write('\nFix the violations above, or run:\n  node kit/scripts/cwos-command-deps-validate.js --human\n');
  }
  process.exit(1);
}

// WS-641: the fourth member of the family. The three gates above keep the
// SHIPPED artifact coherent (modules, declarations, command edges); this one
// keeps the GOVERNANCE coherent: system/invariants.md and the enforcement in
// cwos-verify.js must describe the same set. Ten checks ran on every /verify
// while declared nowhere; three register entries documented a --only target
// that does not exist. A register that drifts from its enforcement answers
// "what must always be true?" with fiction, and a release is the moment that
// fiction would propagate as documentation.
//
// Known drift is waived in the register's own `## Waivers (INV-074)` block
// (tracked_by + expires mandatory, obsolete waivers fail) — no bypass flag.
function assertInvariantRegisterConsistent(homebase, opts) {
  let checkInvariantRegister, renderHuman;
  try { ({ checkInvariantRegister, renderHuman } = require('./cwos-invariant-register-validate')); }
  catch { return; }

  const result = checkInvariantRegister(homebase);
  if (result.ok || result.exit_code === 2) return;

  if (opts.json) {
    process.stdout.write(JSON.stringify({
      ok: false,
      error: 'invariant register gate failed',
      violations: result.violations,
    }) + '\n');
  } else {
    process.stderr.write('ERROR: invariant register gate failed — refusing to baseline a kit whose invariant register and enforcement disagree.\n');
    process.stderr.write(renderHuman(result));
    process.stderr.write('\nFix the violations above, waive them (tracked_by + expires) in the `## Waivers (INV-074)` block of system/invariants.md, or run:\n  node kit/scripts/cwos-invariant-register-validate.js --human\n');
  }
  process.exit(1);
}

// WS-610: the fifth gate, and the only one that looks BACKWARD.
//
// The four above ask whether the artifact about to ship is coherent. This asks
// whether the releases already out there are still describable — whether every
// kit-v* tag has the `kit/hashes-<v>.yaml` an adopted repo needs to tell a
// stock kit file from one the founder hand-edited.
//
// It exists because the two halves of the release procedure could come apart
// silently. Step 2 (run this script) and step 3 (create the tag) are separate
// manual acts; skipping step 2 produced a tag with no baseline, and nothing
// anywhere compared the two lists. WS-548 backfilled 14 such baselines and
// changed nothing about how they arose, so WS-610 re-opened the same class two
// months later. Fixing instances is not a control.
//
// Placing it HERE rather than only in cwos-verify.js is what makes it bite: the
// next release physically cannot be baselined while an earlier one is missing,
// so a skipped step 2 surfaces at the following release instead of years later
// inside somebody's upgrade. The version currently being cut has no tag yet and
// is therefore never a violation — the gate reads tags, and step 2 correctly
// precedes step 3.
//
// No bypass flag. The repair is one command (`--backfill-all`), which is also
// why this gate is deliberately NOT run on the backfill path below: making the
// repair depend on the condition it repairs would deadlock the only way out.
function assertBaselineCoverage(homebase, opts) {
  let checkBaselineCoverage, renderHuman;
  try { ({ checkBaselineCoverage, renderHuman } = require('./cwos-baseline-coverage')); }
  catch { return; }

  const result = checkBaselineCoverage(homebase);
  if (result.ok || result.exit_code === 2) return;

  if (opts.json) {
    process.stdout.write(JSON.stringify({
      ok: false,
      error: 'baseline coverage gate failed',
      violations: result.violations,
    }) + '\n');
  } else {
    process.stderr.write('ERROR: baseline coverage gate failed — refusing to baseline a new release while an earlier one has no baseline.\n');
    process.stderr.write(renderHuman(result));
    process.stderr.write('\nRepair the gaps above, then retry:\n  node kit/scripts/cwos-hash-manifest.js --backfill-all\n');
  }
  process.exit(1);
}

// WS-986: the sixth gate, and the only one about BEHAVIOUR rather than shape.
//
// The five above prove the artifact is coherent; none asks whether the code in
// it works. MIS-015, 2026-10-01: kit 3.43.0 was baselined and its release PR
// presented as ready while atomic-state-writes.test.js was RED and the full kit
// sweep had never completed against that code. The daily watermark could not
// have caught it — it describes master's checkout at the last scheduled run,
// not the tree being baselined.
//
// So the release path now requires a per-commit sweep record
// (lib/test-sweep-record.js) with health OK whose kit_scripts_tree is the tree
// being baselined: the code that ships is the code that was tested. A dirty
// kit/scripts has no tree any sweep could have recorded, so it refuses too —
// commit first. The cure is one command, run in the checkout being released:
// `node kit/scripts/cwos-test-sweep.js --commit`.
//
// Release path only (generate, with or without --version). --check writes
// nothing and is how a release is confirmed before tagging; the backfill path
// records what already shipped and cannot be un-shipped (see backfillTag).
// No bypass flag, like INV-064 / INV-068.
function checkReleaseTested(homebase) {
  const rec = require('./lib/test-sweep-record');
  const id = rec.describeCheckout(homebase);
  const base = { head_sha: id.head_sha, kit_scripts_tree: id.kit_scripts_tree };
  if (!id.head_sha || !id.kit_scripts_tree) {
    return { ...base, ok: false, problem: 'no git checkout to identify the kit/scripts tree being baselined' };
  }
  if (id.dirty !== false) {
    return {
      ...base, ok: false,
      problem: 'kit/scripts has uncommitted or untracked changes — no sweep can have tested this exact tree',
      detail: 'Commit (or set aside) the kit/scripts changes, run the sweep on that commit, then retry.',
    };
  }
  const dir = rec.recordDir(homebase);
  const found = rec.recordForCommit(dir, id.head_sha, id.kit_scripts_tree);
  if (found && found.record.health === 'OK') return { ...base, ok: true, record: found.record, reds_on_tree: found.reds_on_tree || [] };
  const own = found && found.record;
  const head = id.head_sha.slice(0, 12);
  if (own && own.health === 'RED') {
    const at = found.via === 'tree' ? `${String(own.head_sha).slice(0, 12)} (same kit/scripts tree as HEAD ${head})` : head;
    return { ...base, ok: false, problem: `the sweep of ${at} is RED: ${(own.failed || []).map((f) => f.suite).join(', ')}` };
  }
  if (own) {
    const allNm = Array.isArray(own.not_measured) && own.suites_total > 0 && own.not_measured.length >= own.suites_total;
    const why = allNm ? 'every suite NOT MEASURED (machine paging) — nothing was measured; re-run off-peak'
      : !own.finished_at || own.cut_short ? `cut short at ${own.suites_run}/${own.suites_total}` : 'ran with kit/scripts dirty';
    return { ...base, ok: false, problem: `the sweep of ${head} is BLIND (${why})` };
  }
  return { ...base, ok: false, problem: `no green per-commit test sweep covers kit/scripts tree ${id.kit_scripts_tree.slice(0, 12)} (HEAD ${head})` };
}

function assertReleaseTested(homebase, opts) {
  const res = checkReleaseTested(homebase);
  if (res.ok) {
    // A timing suite that ran over budget while the machine paged is NOT
    // MEASURED, not failed (WS-1215). It does not hold the release; it is said.
    const nm = (res.record && Array.isArray(res.record.not_measured)) ? res.record.not_measured : [];
    if (nm.length && !opts.json) {
      process.stderr.write(`NOTE: release test gate — NOT MEASURED (machine paging during the sweep): ${nm.map((f) => f.suite).join(', ')}\n`);
    }
    const reds = Array.isArray(res.reds_on_tree) ? res.reds_on_tree : [];
    if (reds.length && !opts.json) {
      process.stderr.write(`NOTE: release test gate — ${reds.length} RED attempt(s) on this same kit/scripts tree (policy pending, verdict unchanged): ${reds.slice(0, 5).map((r) => `${String(r.head_sha).slice(0, 7)} at ${r.finished_at} [${(r.failed || []).map((f) => f.suite).join(', ')}]`).join('; ')}\n`);
    }
    return res.record;
  }
  if (opts.json) {
    process.stdout.write(JSON.stringify({ ok: false, error: 'release test gate failed', detail: res.problem, head_sha: res.head_sha, kit_scripts_tree: res.kit_scripts_tree }) + '\n');
  } else {
    process.stderr.write('ERROR: release test gate failed — refusing to baseline kit code no green test sweep has run (WS-986).\n');
    process.stderr.write(`  ${res.problem}\n`);
    if (res.detail) process.stderr.write(`  ${res.detail}\n`);
    process.stderr.write('\nRun the full sweep for this commit in this checkout, then retry:\n  node kit/scripts/cwos-test-sweep.js --commit\n');
  }
  process.exit(1);
}

/**
 * Write one backfilled baseline. Returns a per-tag result record.
 *
 * The WS-544 dependency gate deliberately does NOT run here. That gate guards
 * SHIPPING: it refuses to baseline a manifest that omits a module its own
 * scripts require, so an incomplete release cannot be tagged. A version that
 * already shipped cannot be un-shipped. Refusing to record what kit-v3.7.1
 * contained would not make 3.7.1 any more complete — it would only leave the
 * three repos installed on it with no baseline at all. The gate stays
 * mandatory on the release path, which is the only path that can still change
 * what goes out.
 */
function backfillTag(homebase, tag, opts) {
  const version = versionFromTag(tag);
  if (!version) return { tag, ok: false, skipped: false, error: `not a kit-v* tag: ${tag}` };

  const outPath = opts.out || path.join(homebase, 'kit', `hashes-${version}.yaml`);
  if (fs.existsSync(outPath) && !opts.force) {
    return { tag, version, ok: true, skipped: true, out: path.relative(homebase, outPath).replace(/\\/g, '/') };
  }

  const { hashes, missing, sourceList } = computeHashesFromTag(homebase, tag);
  if (!Object.keys(hashes).length) {
    return { tag, version, ok: false, skipped: false, error: `no files resolved at ${tag} — is the tag present in this clone?` };
  }

  emitEvent('T6:workstream', 'kit-baseline-backfilled', {
    version, tag, files: Object.keys(hashes).length, hash_basis: 'git-blob',
  });
  fs.writeFileSync(outPath, renderYAML(version, hashes, new Date().toISOString(), {
    hashBasis: 'git-blob',
    sourceList,
    ref: tag,
  }), 'utf8');

  return {
    tag,
    version,
    ok: true,
    skipped: false,
    out: path.relative(homebase, outPath).replace(/\\/g, '/'),
    file_count: Object.keys(hashes).length,
    tested_by: tested ? { head_sha: tested.head_sha, kit_scripts_tree: tested.kit_scripts_tree, suites: tested.suites_total } : null,
    source_list: sourceList,
    missing_count: missing.length,
    missing,
  };
}

function runBackfill(homebase, opts) {
  const tags = opts.fromTag ? [opts.fromTag] : listKitTags(homebase);
  if (!tags.length) {
    const msg = 'no kit-v* tags found — nothing to backfill';
    if (opts.json) process.stdout.write(JSON.stringify({ ok: false, error: msg }) + '\n');
    else process.stderr.write(`ERROR: ${msg}\n`);
    process.exit(1);
  }

  const results = tags.map(tag => backfillTag(homebase, tag, opts));
  const failed = results.filter(r => !r.ok);
  const written = results.filter(r => r.ok && !r.skipped);
  const skipped = results.filter(r => r.skipped);

  if (opts.json) {
    process.stdout.write(JSON.stringify({
      ok: failed.length === 0, written: written.length, skipped: skipped.length, results,
    }) + '\n');
  } else {
    for (const r of results) {
      if (!r.ok) { process.stderr.write(`  ✗ ${r.tag}: ${r.error}\n`); continue; }
      if (r.skipped) { process.stdout.write(`  · ${r.tag}: baseline exists (${r.out}) — use --force to regenerate\n`); continue; }
      const note = r.source_list === 'tree-fallback' ? ' [tree-fallback: no MANIFEST at this tag]' : '';
      process.stdout.write(`  ✓ ${r.tag}: ${r.file_count} files → ${r.out}${note}\n`);
      if (r.missing_count) {
        process.stdout.write(`      ${r.missing_count} manifest source(s) declared but absent from the tag's tree\n`);
      }
    }
    process.stdout.write(`\n${written.length} written, ${skipped.length} already present, ${failed.length} failed.\n`);
  }
  process.exit(failed.length ? 1 : 0);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const homebase = findHomeBase(opts.homebase);

  if (opts.fromTag && opts.backfillAll) {
    process.stderr.write('cwos-hash-manifest: --from-tag and --backfill-all are mutually exclusive\n');
    process.exit(2);
  }
  if ((opts.fromTag || opts.backfillAll) && opts.check) {
    process.stderr.write('cwos-hash-manifest: --check applies to the release path, not the backfill path\n');
    process.exit(2);
  }
  if (opts.backfillAll && opts.out) {
    process.stderr.write('cwos-hash-manifest: --out takes a single file and cannot be combined with --backfill-all\n');
    process.exit(2);
  }
  if (opts.fromTag || opts.backfillAll) return runBackfill(homebase, opts);

  let version = opts.version;
  if (!version) {
    try { version = fs.readFileSync(path.join(homebase, 'kit', 'VERSION'), 'utf8').trim(); }
    catch { process.stderr.write('ERROR: could not read kit/VERSION\n'); process.exit(1); }
  }

  assertManifestComplete(homebase, opts);
  assertNoUnregisteredKitFiles(homebase, opts);
  assertDeclarationsLive(homebase, opts);
  assertCommandDepsShipped(homebase, opts);
  assertInvariantRegisterConsistent(homebase, opts);
  assertBaselineCoverage(homebase, opts);
  // Release path only: --check confirms a baseline and writes nothing.
  const tested = opts.check ? null : assertReleaseTested(homebase, opts);

  const { hashes, missing, variants } = computeHashes(homebase);
  const outPath = opts.out || path.join(homebase, 'kit', `hashes-${version}.yaml`);

  if (opts.check) {
    const res = compareAgainstBaseline(homebase, version, hashes, outPath, variants);
    if (!res.ok) {
      if (opts.json) process.stdout.write(JSON.stringify({ ok: false, error: res.error, out: outPath, changed: res.changed, added: res.added, removed: res.removed }) + '\n');
      else process.stderr.write(`ERROR: ${res.detail}\n`);
      process.exit(1);
    }
    if (opts.json) process.stdout.write(JSON.stringify({ ok: true, version, file_count: res.file_count }) + '\n');
    else process.stdout.write(`Hash manifest current (${res.file_count} files, v${version}).\n`);
    process.exit(0);
  }

  const generatedAt = new Date().toISOString();
  fs.writeFileSync(outPath, renderYAML(version, hashes, generatedAt), 'utf8');

  const summary = {
    ok: true,
    version,
    out: path.relative(homebase, outPath).replace(/\\/g, '/'),
    file_count: Object.keys(hashes).length,
    missing_count: missing.length,
    missing,
  };
  if (opts.json) {
    process.stdout.write(JSON.stringify(summary) + '\n');
  } else {
    process.stdout.write(`Wrote ${summary.out} — ${summary.file_count} files hashed (v${version}).\n`);
    if (tested) process.stdout.write(`  tested: ${tested.suites_total} suites green at ${String(tested.head_sha).slice(0, 12)} (kit/scripts tree ${String(tested.kit_scripts_tree).slice(0, 12)})\n`);
    if (missing.length) {
      process.stdout.write(`  ${missing.length} manifest source(s) not found on disk (skipped):\n`);
      for (const m of missing.slice(0, 10)) process.stdout.write(`    ${m}\n`);
      if (missing.length > 10) process.stdout.write(`    … and ${missing.length - 10} more\n`);
    }
  }
}

/**
 * Is the committed baseline still a true description of the working tree?
 *
 * Split out of main() so the CLI and INV-071 share ONE definition of "stale"
 * — the same shape INV-064 and INV-068 use for their gates. main() exits on
 * the result; this returns it, because an invariant cannot call process.exit.
 */
function compareAgainstBaseline(homebase, version, hashes, outPath, variants) {
  if (!fs.existsSync(outPath)) {
    const rel = path.relative(homebase, outPath).replace(/\\/g, '/');
    return {
      ok: false,
      error: 'hash manifest missing',
      detail: `hash manifest missing: ${rel} (run without --check to generate)`,
      file_count: Object.keys(hashes).length,
    };
  }
  // Line endings are checkout, not content: with core.autocrlf a Windows
  // checkout (or a rebase that rewrites the file) holds CRLF — in the baseline
  // YAML itself and in every file it describes (WS-1083). The baseline is read
  // per file, so --check names what moved instead of only saying "stale".
  const baseline = readBaselineEntries(fs.readFileSync(outPath, 'utf8'));
  const changed = [], added = [], removed = [];
  for (const source of Object.keys(hashes)) {
    if (!Object.prototype.hasOwnProperty.call(baseline.files, source)) { added.push(source); continue; }
    const want = baseline.files[source];
    const ok = want === hashes[source] || Boolean(variants && variants[source] && variants[source].has(want));
    if (!ok) changed.push(source);
  }
  for (const source of Object.keys(baseline.files)) {
    if (!Object.prototype.hasOwnProperty.call(hashes, source)) removed.push(source);
  }
  const versionDiffers = baseline.version !== String(version);
  const file_count = Object.keys(hashes).length;
  if (versionDiffers || changed.length || added.length || removed.length) {
    const rel = path.relative(homebase, outPath).replace(/\\/g, '/');
    const lines = [`hash manifest is stale — ${changed.length + added.length + removed.length} file(s) differ from ${rel}:`];
    if (versionDiffers) lines.push(`  version: baseline says "${baseline.version}", expected "${version}"`);
    const LIMIT = 25;
    for (const [label, list] of [['changed', changed], ['added', added], ['removed', removed]]) {
      for (const f of list.slice(0, LIMIT)) lines.push(`  ${label}: ${f}`);
      if (list.length > LIMIT) lines.push(`  … and ${list.length - LIMIT} more ${label}`);
    }
    lines.push(`regenerate: node kit/scripts/cwos-hash-manifest.js --version ${version}`);
    return {
      ok: false,
      error: 'hash manifest stale',
      detail: lines.join('\n'),
      changed, added, removed,
      file_count,
    };
  }
  return { ok: true, file_count };
}

/** `version` and the `files:` map of a baseline renderYAML wrote, CRLF or LF. */
function readBaselineEntries(text) {
  const files = {};
  let version = null;
  let inFiles = false;
  for (const line of String(text).split(/\r?\n/)) {
    const v = /^version:\s*"([^"]*)"\s*$/.exec(line);
    if (v) { version = v[1]; continue; }
    if (/^files:\s*$/.test(line)) { inFiles = true; continue; }
    if (!inFiles) continue;
    const m = /^\s+"([^"]+)":\s*"([^"]*)"\s*$/.exec(line);
    if (m) files[m[1]] = m[2];
    else if (/^\S/.test(line)) inFiles = false;
  }
  return { version, files };
}

/**
 * INV-071's entry point: has kit/ moved since the version in kit/VERSION was
 * baselined?
 *
 * This is the question nothing asked. 3.9.0 was cut over 33 commits, 107 files
 * and 31 new scripts that had accumulated behind 3.8.5 with the version
 * unchanged — and because BOTH propagation paths key on that number
 * (/fleet-update enters its loop only when kit_version_at_install <
 * kit/VERSION; /kit-upgrade returns early on exact equality), every adopted
 * repo correctly reported itself current while running four-day-old code.
 * Third instance of the shape: 3.8.4 shipped a preamble fix that never
 * arrived, 3.8.5 fixed the cause, and then 3.8.5 itself never shipped.
 *
 * Deliberately NOT reused: INV-039. It bounds FLEET drift as repo-version vs
 * kit/VERSION, so when nothing is released every repo reads drift = 0 and it
 * passes. It cannot see this class from where it stands, and its watched paths
 * (fleet/, kit/VERSION) mean it does not even re-run when kit/scripts/ changes.
 */
function checkReleaseDrift(homebase) {
  const versionPath = path.join(homebase, 'kit', 'VERSION');
  if (!fs.existsSync(versionPath) || !fs.existsSync(path.join(homebase, 'kit', 'MANIFEST.yaml'))) {
    return { applicable: false, reason: 'not a kit source repo' };
  }
  let version;
  try { version = fs.readFileSync(versionPath, 'utf8').trim(); }
  catch (e) { return { applicable: false, reason: `kit/VERSION unreadable — ${e.message}` }; }
  if (!version) return { applicable: false, reason: 'kit/VERSION is empty' };

  const { hashes, variants } = computeHashes(homebase);
  const outPath = path.join(homebase, 'kit', `hashes-${version}.yaml`);
  const res = compareAgainstBaseline(homebase, version, hashes, outPath, variants);
  return { applicable: true, version, ...res };
}

module.exports = {
  computeHashes, renderYAML, findHomeBase,
  sourcesFromManifestFiles, computeHashesFromTag, sourcesAtTag,
  versionFromTag, listKitTags, backfillTag,
  compareAgainstBaseline, checkReleaseDrift, checkReleaseTested,
};

if (require.main === module) main();
