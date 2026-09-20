#!/usr/bin/env node
/**
 * cwos-baseline-coverage — every released kit-v* tag has a usable hash baseline.
 *
 * THE QUESTION NOTHING ASKED. CLAUDE.md's release procedure is four steps: bump
 * `kit/VERSION`, run `cwos-hash-manifest.js --version <v>` (writes
 * `kit/hashes-<v>.yaml`), create the `kit-v<v>` tag, update the CHANGELOG.
 * Steps 2 and 3 produce two artifacts that must agree, and until now nothing
 * compared them. Four gates already refuse to WRITE a baseline (INV-064,
 * INV-068, INV-073, INV-074) and one asks whether the CURRENT baseline is stale
 * (INV-071) — but a release that simply skipped step 2 and went straight to the
 * tag passed every one of them, because each of those gates only runs when
 * someone remembered to run the generator.
 *
 * WHY A MISSING BASELINE IS NOT COSMETIC. `loadHashBaseline`
 * (cwos-kit-upgrade.js) resolves in order: the adopter's own
 * `kit/hashes-<installed>.yaml`, HomeBase's copy of the same,
 * `.cwos-version#installed_files`, then git-tag reconstruction inside
 * `classifyFiles`. So a repo installed at an unbaselined version still upgrades
 * — on a fallback rather than the authoritative record. That fallback is the
 * mechanism deciding whether a founder's hand-edit is preserved as a
 * `.kit-update` sidecar or silently overwritten, and WS-544 measured it failing
 * in the wrong direction once already: /kit-upgrade reported "No local kit
 * modifications" for a repo whose cwos-utils.js genuinely differed, because the
 * file had fallen out of the known-baseline path entirely. Worse, run-027
 * established that the Claude Code plugin cache is not a git repository, so the
 * last fallback — reconstruct from `git show kit-vX:<path>` — has nothing to
 * resolve against once kit content ships as a plugin. The baseline file is the
 * only durable record.
 *
 * WHY THE RECURRENCE IS THE ITEM. WS-548 backfilled 14 missing baselines. It
 * fixed the instances and changed nothing about how they arose, so the same
 * class was re-opened as WS-610 within two months. An unenforced four-step
 * procedure holds exactly as long as whoever cuts the release remembers all
 * four steps, and the failure is silent in both directions: the release looks
 * successful, and every downstream upgrade also looks successful.
 *
 * ── WHAT THIS FAILS ON, AND WHAT IT DELIBERATELY DOES NOT ──────────────────
 *
 *   tag-without-baseline    FAIL  `kit-v<v>` exists, `kit/hashes-<v>.yaml` does
 *                                 not. The defect this gate exists for.
 *   baseline-unusable       FAIL  the file exists but cannot serve as a
 *                                 baseline: unparseable, `file_count: 0`, or no
 *                                 `files:` entries. A half-written baseline
 *                                 reads as present to every existence check in
 *                                 the kit — including the fallback chain above,
 *                                 which stops at the first file it finds — so
 *                                 presence alone is the wrong question.
 *   baseline-version-mismatch FAIL `hashes-3.9.0.yaml` whose body says
 *                                 `version: "3.8.5"`. Names the wrong release
 *                                 to every consumer that trusts the field.
 *
 *   baseline-without-tag    INFO  a baseline with no matching tag. This is the
 *                                 CORRECT transient state between step 2 and
 *                                 step 3 and must never fail — a gate that
 *                                 fights the documented procedure is a gate
 *                                 that gets bypassed. Reported on every run so
 *                                 a baseline left permanently untagged (a
 *                                 release abandoned midway) stays visible.
 *
 * NOT APPLICABLE, rather than passing silently (exit 2), when this is not the
 * kit SOURCE repo, when git is unavailable, or when no `kit-v*` tag is present.
 * An adopted repo legitimately holds one copied baseline and no tags at all;
 * failing there would be reporting HomeBase's release hygiene as the adopter's
 * violation. A fresh shallow clone with no tags fetched is the same shape. The
 * same degradation reasoning as INV-064/INV-068.
 *
 * NO WAIVER REGISTRY AND NO BYPASS FLAG. Every violation this can raise is
 * repaired by one command — `node kit/scripts/cwos-hash-manifest.js
 * --backfill-all` — which reconstructs from git objects and records
 * `hash_basis: git-blob` provenance. A waiver would only ever buy time against
 * a repair that already exists, and a waiver registry holding zero waivers is
 * itself a mechanism nothing reads, which is the exact condition INV-068 fails
 * on.
 *
 * Usage:
 *   node kit/scripts/cwos-baseline-coverage.js            # JSON to stdout
 *   node kit/scripts/cwos-baseline-coverage.js --human
 *   node kit/scripts/cwos-baseline-coverage.js --root <p>
 *
 * Exit codes: 0 = clean | 1 = violation(s) | 2 = not applicable / unreadable.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { cliGate } = require('./lib/cli');
const { runGitInRepo } = require('./lib/shell-safe');

const CLI = {
  name: 'cwos-baseline-coverage',
  summary: 'verify every released kit-v* tag has a usable kit/hashes-<version>.yaml baseline',
  flags: {
    human: { type: 'boolean', describe: 'render a readable report instead of JSON' },
    root: { type: 'string', placeholder: 'path', describe: 'HomeBase root (default: walk up from this script)' },
  },
  notes: [
    'Runs at publish time from cwos-hash-manifest.js, so a release cannot be',
    'baselined while an EARLIER release has no baseline, and as an invariant in',
    'cwos-verify.js.',
    '',
    'A baseline with no tag is the correct state between release step 2 and step',
    '3 — reported, never failed. A tag with no baseline is the defect.',
    '',
    'Repair: node kit/scripts/cwos-hash-manifest.js --backfill-all',
    '',
    'There is no waiver mechanism and no bypass flag.',
  ].join('\n'),
};

// ─── inputs ─────────────────────────────────────────────────────────────────

/** "kit-v3.7.1" → "3.7.1". Null for anything not shaped like a kit release tag. */
function versionFromTag(tag) {
  const m = /^kit-v(.+)$/.exec(String(tag).trim());
  return m ? m[1] : null;
}

/** "hashes-3.7.1.yaml" → "3.7.1". Null otherwise. */
function versionFromBaseline(basename) {
  const m = /^hashes-(.+)\.yaml$/.exec(String(basename).trim());
  return m ? m[1] : null;
}

/**
 * Every kit-v* tag in this repo.
 *
 * Deliberately NOT reusing cwos-hash-manifest.js's listKitTags(): that module
 * pulls in kit/MANIFEST.yaml parsing and the four publish gates at require
 * time, and an invariant that cannot run without the thing it audits is the
 * shape INV-070 was written about. This is six lines and one git call.
 */
function listKitTags(root) {
  const r = runGitInRepo(root, ['tag', '-l', 'kit-v*'], { maxBuffer: 4 * 1024 * 1024 });
  if (!r.ok) return null;
  return r.stdout.split('\n').map((s) => s.trim()).filter(Boolean);
}

/** Every kit/hashes-*.yaml on disk, as { version: absolutePath }. */
function listBaselines(root) {
  const dir = path.join(root, 'kit');
  if (!fs.existsSync(dir)) return {};
  const out = {};
  for (const name of fs.readdirSync(dir)) {
    const v = versionFromBaseline(name);
    if (v) out[v] = path.join(dir, name);
  }
  return out;
}

/**
 * Is this file actually usable as a baseline?
 *
 * Read as text rather than through the YAML parser on purpose: the file is
 * machine-generated with a fixed shape, the fields we need are three regexes,
 * and a baseline is ~400 lines × up to 47 files. The parser would be the
 * dominant cost of the whole check for no additional truth.
 */
function inspectBaseline(absPath) {
  let text;
  try { text = fs.readFileSync(absPath, 'utf8'); }
  catch (e) { return { readable: false, reason: `unreadable — ${e.message}` }; }

  const declared = /^version:\s*"?([^"\r\n]+?)"?\s*$/m.exec(text);
  const count = /^file_count:\s*(\d+)\s*$/m.exec(text);
  // One `  "path": "sha256:..."` row is enough to prove the body is not a stub.
  const hasRows = /^\s+"[^"]+":\s*"sha256:[0-9a-f]{64}"\s*$/m.test(text);

  return {
    readable: true,
    declared_version: declared ? declared[1].trim() : null,
    file_count: count ? Number(count[1]) : null,
    has_rows: hasRows,
  };
}

// ─── the check ──────────────────────────────────────────────────────────────

function notApplicable(reason) {
  return {
    ok: true,
    exit_code: 2,
    applicable: false,
    reason,
    tags_checked: 0,
    baselines_present: 0,
    violations: [],
    info: [],
  };
}

/**
 * @param {string} root                 HomeBase root to audit.
 * @param {object} [deps]               Injection seam, tests only.
 * @param {function} [deps.listTags]    Override tag enumeration.
 *
 * WHY THE SEAM EXISTS. Every violation this gate raises is a relationship
 * between a git TAG and a file, and a fixture directory made with mkdtemp is
 * not a git repository — so without injection the only reachable state in a
 * unit test is "not applicable", and the failure paths would ship unproven. The
 * alternative, `git init` plus real tags per fixture, makes the test suite
 * create release-shaped refs to check a release gate, which is a worse trade.
 *
 * The seam is not a substitute for reality, and the sibling gates' doctrine
 * applies unchanged: a gate validated only against synthetic fixtures proves
 * the fixtures match the code. The test file therefore also runs this function
 * with NO injection against the real HomeBase root, which is the assertion that
 * the code matches reality.
 */
function checkBaselineCoverage(root, deps = {}) {
  // The kit SOURCE repo is the only place this question has an answer. An
  // adopted repo holds one copied baseline and no kit-v* tags; that is correct,
  // not a violation.
  if (!fs.existsSync(path.join(root, 'kit', 'MANIFEST.yaml')) ||
      !fs.existsSync(path.join(root, 'kit', 'VERSION'))) {
    return notApplicable('not the kit source repo (no kit/MANIFEST.yaml + kit/VERSION) — baselines are copied in, tags live in HomeBase');
  }

  const tags = (deps.listTags || listKitTags)(root);
  if (tags === null) return notApplicable('git unavailable or not a git repository — tags cannot be enumerated');
  if (!tags.length) return notApplicable('no kit-v* tags in this clone (shallow clone, or nothing released yet)');

  const baselines = listBaselines(root);
  const violations = [];
  const info = [];

  for (const tag of tags.sort()) {
    const version = versionFromTag(tag);
    if (!version) continue;
    const rel = `kit/hashes-${version}.yaml`;
    const abs = baselines[version];

    if (!abs) {
      violations.push({
        kind: 'tag-without-baseline',
        tag,
        version,
        expected: rel,
        detail: `${tag} is released but ${rel} does not exist — every repo installed at ${version} upgrades on the degraded detection path (repair: node kit/scripts/cwos-hash-manifest.js --backfill-all)`,
      });
      continue;
    }

    const b = inspectBaseline(abs);
    if (!b.readable) {
      violations.push({ kind: 'baseline-unusable', tag, version, expected: rel, detail: `${rel} exists but is ${b.reason}` });
      continue;
    }
    if (!b.has_rows || b.file_count === 0 || b.file_count === null) {
      violations.push({
        kind: 'baseline-unusable',
        tag,
        version,
        expected: rel,
        detail: `${rel} exists but carries no file hashes (file_count: ${b.file_count === null ? 'absent' : b.file_count}) — present to every existence check, useless to every consumer`,
      });
      continue;
    }
    if (b.declared_version && b.declared_version !== version) {
      violations.push({
        kind: 'baseline-version-mismatch',
        tag,
        version,
        expected: rel,
        detail: `${rel} declares version "${b.declared_version}" — it names the wrong release to every consumer that trusts the field`,
      });
      continue;
    }
  }

  // A baseline ahead of its tag is release step 2 done and step 3 pending —
  // exactly the order CLAUDE.md prescribes. Never a violation; always printed.
  const tagged = new Set(tags.map(versionFromTag).filter(Boolean));
  for (const version of Object.keys(baselines).sort()) {
    if (!tagged.has(version)) {
      info.push({
        kind: 'baseline-without-tag',
        version,
        detail: `kit/hashes-${version}.yaml has no kit-v${version} tag — correct between release step 2 and step 3; stale if it persists`,
      });
    }
  }

  return {
    ok: violations.length === 0,
    exit_code: violations.length ? 1 : 0,
    applicable: true,
    tags_checked: tags.length,
    baselines_present: Object.keys(baselines).length,
    violations,
    info,
  };
}

// ─── rendering ──────────────────────────────────────────────────────────────

function renderHuman(result) {
  const out = [];
  if (result.error) return `baseline-coverage: ERROR — ${result.error}\n`;
  if (!result.applicable) return `baseline-coverage: not applicable — ${result.reason}\n`;

  out.push(`baseline-coverage: ${result.tags_checked} kit-v* tag(s), ${result.baselines_present} baseline file(s) on disk.`);

  if (!result.violations.length) {
    out.push('  OK — every released tag has a usable kit/hashes-<version>.yaml.');
  } else {
    out.push(`  ${result.violations.length} violation(s):`);
    for (const v of result.violations) out.push(`    [${v.kind}] ${v.detail}`);
    out.push('');
    out.push('  Fix: node kit/scripts/cwos-hash-manifest.js --backfill-all');
  }

  // Printed pass or fail, for the same reason INV-073 always prints its fleet/
  // line: a check that only speaks when it fails leaves "did it look at the
  // untagged side at all?" unanswerable.
  const pending = result.info.filter((i) => i.kind === 'baseline-without-tag');
  out.push(`  ${pending.length} baseline(s) with no tag — release step 2 done, step 3 pending; reported, never failed.`);
  for (const p of pending.slice(0, 8)) out.push(`    ${p.version}`);
  if (pending.length > 8) out.push(`    … and ${pending.length - 8} more`);

  return out.join('\n') + '\n';
}

// ─── entry point ────────────────────────────────────────────────────────────

function findRoot(override) {
  if (override) return path.resolve(override);
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, 'kit', 'MANIFEST.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return require('./lib/kit-paths').resolveDistRoot();
}

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);
  const root = findRoot(values.root);
  const result = checkBaselineCoverage(root);

  if (values.human) process.stdout.write(renderHuman(result));
  else process.stdout.write(JSON.stringify(result, null, 2) + '\n');

  process.exit(result.exit_code);
}

module.exports = {
  checkBaselineCoverage, renderHuman,
  versionFromTag, versionFromBaseline, inspectBaseline, listBaselines,
};

if (require.main === module) main();
