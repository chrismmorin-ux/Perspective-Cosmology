'use strict';
/**
 * kit-baselines — the released `kit/hashes-*.yaml` corpus as a lookup (WS-631).
 *
 * Two hub-side tools ask the same question of it from opposite ends:
 * cwos-kit-fingerprint ("which version does this whole repo resemble?") and
 * cwos-sidecar-audit ("which versions does THIS file's content belong to?").
 * The loader lived inside the fingerprint script; the sidecar audit's v2
 * classifier needs it too, and a second copy of "read every baseline, order by
 * semver" is exactly how two tools end up disagreeing about what 3.10 shipped.
 *
 * Three facts shape it:
 *
 *   KEYED BY SOURCE. A baseline records `files: { "<MANIFEST source path>":
 *   "sha256:…" }` — kit/templates/…, not the repo path the file lands at. A
 *   repo file has to be mapped back through the MANIFEST (destToSource) before
 *   any baseline can be consulted.
 *
 *   LINE ENDINGS ARE NOT CONTENT. cwos-hash-manifest hashes raw working-tree
 *   bytes (CRLF on a Windows checkout) while --backfill-all baselines hash git
 *   blobs (LF). Matching goes through lib/kit-hash's variant set — the same
 *   rule cwos-kit-upgrade's detectLocalMods uses — or a CRLF live file reads as
 *   "matches no release" and every classification downstream is wrong.
 *
 *   A REPO ONLY HOLDS WHAT IT PASSED THROUGH. /kit-upgrade seeds the target
 *   version's baseline into the adopter, so an adopted repo carries only the
 *   versions it upgraded through. The corpus is HomeBase's full set UNION the
 *   repo's own — a repo-local baseline the hub lost (or never had) still counts.
 *
 * HUB-ONLY by use: both consumers are hub scripts. Not in MANIFEST.
 */

const fs = require('fs');
const path = require('path');
const { readYAMLFile } = require('./cwos-utils');
const { compareSemver } = require('./kit-version');
const { lineEndingVariantHashes } = require('./kit-hash');

const BASELINE_RE = /^hashes-(.+)\.yaml$/;

/**
 * Every released baseline under `<root>/kit/`, oldest first.
 * Returns { versions: [...], baselines: { <version>: { <source>: <hash> } } }.
 * A root with no kit/ dir yields the empty corpus rather than throwing — an
 * adopted repo that never upgraded legitimately has none.
 */
function loadBaselines(root) {
  const kitDir = path.join(root, 'kit');
  let names = [];
  try { names = fs.readdirSync(kitDir); } catch { return { versions: [], baselines: {} }; }
  const versions = names
    .filter((f) => BASELINE_RE.test(f))
    .map((f) => f.replace(BASELINE_RE, '$1'))
    .sort(compareSemver);
  const baselines = {};
  for (const v of versions) {
    const r = readYAMLFile(path.join(kitDir, `hashes-${v}.yaml`));
    if (r.ok && r.data && r.data.files) baselines[v] = r.data.files;
  }
  return { versions: versions.filter((v) => baselines[v]), baselines };
}

/**
 * HomeBase corpus ∪ the repo's own. Where both carry a version the entries are
 * merged key-by-key with HomeBase winning a conflict: the hub's copy is the one
 * regenerated at release, the repo's is a copy that may predate a backfill.
 */
function loadBaselineCorpus(homebase, repoPath) {
  const hub = homebase ? loadBaselines(homebase) : { versions: [], baselines: {} };
  const repo = repoPath && (!homebase || path.resolve(repoPath) !== path.resolve(homebase))
    ? loadBaselines(repoPath) : { versions: [], baselines: {} };
  const baselines = {};
  for (const [v, files] of Object.entries(repo.baselines)) baselines[v] = Object.assign({}, files);
  for (const [v, files] of Object.entries(hub.baselines)) baselines[v] = Object.assign(baselines[v] || {}, files);
  return { versions: Object.keys(baselines).sort(compareSemver), baselines };
}

/**
 * Repo-relative destination → [MANIFEST source paths].
 *
 * `{system_dir}` resolves through cwos-adopt-install's resolveDestination — the
 * one function /adopt and cwos-migrate already use, so a repo with
 * `paths.system_dir: .cwos` maps `.cwos/state.md` back correctly. A list, not a
 * scalar: archetype variants can ship different sources to one destination,
 * and a file matching ANY of them matches.
 */
function destToSource(manifest, systemDir) {
  const { resolveDestination } = require('../cwos-adopt-install');
  const files = Array.isArray(manifest) ? manifest : (manifest && manifest.files) || [];
  const map = new Map();
  for (const entry of files) {
    if (!entry || !entry.source || !entry.destination || entry.homebase_only) continue;
    const dest = resolveDestination(String(entry.destination), systemDir || 'system').replace(/\\/g, '/');
    if (!map.has(dest)) map.set(dest, []);
    const list = map.get(dest);
    if (!list.includes(entry.source)) list.push(entry.source);
  }
  return map;
}

/**
 * The set of released versions whose baseline records this content for any of
 * `sources` (a path or a list of paths), up to line endings. Empty when the
 * content belongs to no release — a founder edit, repo-owned state, or a
 * source the corpus never tracked.
 */
function versionsMatching(buf, sources, corpus) {
  const out = new Set();
  const list = Array.isArray(sources) ? sources : [sources];
  if (!list.length || !corpus || !corpus.baselines) return out;
  const variants = lineEndingVariantHashes(buf);
  for (const [v, files] of Object.entries(corpus.baselines)) {
    for (const src of list) {
      const h = files[src];
      if (h && variants.has(h)) { out.add(v); break; }
    }
  }
  return out;
}

/** Highest version in a set/array by semver, or null when empty. */
function maxVersion(versions) {
  let best = null;
  for (const v of versions) if (best === null || compareSemver(v, best) > 0) best = v;
  return best;
}

module.exports = { loadBaselines, loadBaselineCorpus, destToSource, versionsMatching, maxVersion };
