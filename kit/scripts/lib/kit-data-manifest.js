'use strict';

/**
 * kit-data-manifest.js — the single answer to "what does kit/data ship, and to
 * whom" (WS-607).
 *
 * WHY THIS MODULE EXISTS. There used to be two answers, and they disagreed
 * silently for months.
 *
 * `kit/MANIFEST.yaml` is the distribution map for /adopt and /kit-upgrade. It
 * had no rows for kit/data at all, so every /adopt-installed repo got none of
 * it and `cwos-stage`, `cwos-adopt-archetype`, `cwos-rearchetype` and
 * `cwos-stage-detect` all died ENOENT (WS-596). Meanwhile
 * `cwos-genesis-scaffold.js` carried a PRIVATE hardcoded copy list — `M0_DATA`
 * — so every /genesis-scaffolded repo got the data and worked fine.
 *
 * That split is what made the bug invisible. Half the fleet worked, so from any
 * single repo the failure looked local. The two lists had to agree and nothing
 * made them agree. Collapsing them into this module is the fix; the coverage
 * check in cwos-manifest-deps-validate.js is what keeps them collapsed.
 *
 * THE ONE LEGITIMATE ASYMMETRY. `genesis-sprints/` is NOT in MANIFEST, on
 * purpose. Those are per-archetype ignition templates read by
 * cwos-genesis-ignite.js at M0 — a repo that has already been /adopt-ed has no
 * use for them, and shipping them was only ever fallout from M0_DATA. So the
 * set /genesis needs is genuinely larger than the set /adopt needs. That is a
 * real distinction, and it is declared HERE, once, by name, rather than being
 * re-derived by whoever touches either path next.
 *
 * Consumers:
 *   cwos-genesis-scaffold.js        — M0 copy list = shipped ∪ genesis-only
 *   cwos-manifest-deps-validate.js  — asserts every file on disk is in one set
 *                                     or the other (INV-064)
 */

const fs = require('fs');
const path = require('path');
const { readYAMLFile } = require('./cwos-utils');

const DATA_DIR_REL = 'kit/data';
const DATA_PREFIX = 'kit/data/';

/**
 * Paths under kit/data that /genesis ships but MANIFEST deliberately does not.
 * Prefix-matched, so adding an A6 archetype template needs no edit here.
 *
 * Adding to this list is a decision to withhold a file from every adopted repo.
 * That is exactly the decision that caused WS-596 when it was made implicitly,
 * so make it explicitly or not at all.
 */
const GENESIS_ONLY_PREFIXES = [`${DATA_PREFIX}genesis-sprints/`];

function toPosix(p) {
  return String(p).split('\\').join('/');
}

/** Recursively list files under `dir`, returned as root-relative posix paths. */
function walkRelative(root, dirRel) {
  const abs = path.join(root, dirRel);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    const childRel = `${dirRel}/${ent.name}`;
    if (ent.isDirectory()) out.push(...walkRelative(root, childRel));
    else out.push(toPosix(childRel));
  }
  return out.sort();
}

function isGenesisOnly(rel) {
  return GENESIS_ONLY_PREFIXES.some((p) => rel.startsWith(p));
}

/**
 * Every kit/data file kit/MANIFEST.yaml ships — what an /adopt-ed repo gets.
 * Returns root-relative posix paths, sorted.
 *
 * Throws on an unreadable/malformed manifest rather than returning []. An empty
 * list here is indistinguishable from "MANIFEST ships nothing", which is
 * precisely the WS-596 state — a caller must not be able to mistake a read
 * failure for a correct empty answer.
 */
function manifestDataFiles(root) {
  const manifestPath = path.join(root, 'kit', 'MANIFEST.yaml');
  const read = readYAMLFile(manifestPath);
  if (!read.ok) throw new Error(`kit-data-manifest: cannot read kit/MANIFEST.yaml: ${read.error}`);
  const entries = read.data && read.data.files;
  if (!Array.isArray(entries)) throw new Error('kit-data-manifest: kit/MANIFEST.yaml has no files array');

  return entries
    .filter((e) => e && e.source)
    .map((e) => toPosix(e.source))
    .filter((s) => s.startsWith(DATA_PREFIX))
    .sort();
}

/** kit/data files /genesis ships that MANIFEST deliberately does not. */
function genesisOnlyDataFiles(root) {
  return walkRelative(root, DATA_DIR_REL).filter(isGenesisOnly);
}

/** Every file physically present under kit/data. */
function allDataFilesOnDisk(root) {
  return walkRelative(root, DATA_DIR_REL);
}

/**
 * The coverage question INV-064 asks: is every file under kit/data accounted
 * for by one of the two distribution paths?
 *
 * `unaccounted` is the WS-596 state — a file exists, something reads it from
 * the dist root, and nothing ships it anywhere.
 */
function classifyDataFiles(root) {
  const shipped = new Set(manifestDataFiles(root));
  const onDisk = allDataFilesOnDisk(root);

  const genesisOnly = [];
  const unaccounted = [];
  for (const rel of onDisk) {
    if (shipped.has(rel)) continue;
    if (isGenesisOnly(rel)) genesisOnly.push(rel);
    else unaccounted.push(rel);
  }

  // A manifest row whose file is gone is caught by absent-source; not repeated.
  return {
    shipped: [...shipped].sort(),
    genesis_only: genesisOnly,
    unaccounted,
    on_disk_count: onDisk.length,
  };
}

module.exports = {
  DATA_DIR_REL,
  DATA_PREFIX,
  GENESIS_ONLY_PREFIXES,
  manifestDataFiles,
  genesisOnlyDataFiles,
  allDataFilesOnDisk,
  classifyDataFiles,
};
