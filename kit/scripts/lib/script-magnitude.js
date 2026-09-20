'use strict';
/**
 * script-magnitude — the refusal rule for repo-AUTHORED content at a kit/scripts/
 * path (WS-796, Guard E).
 *
 * WS-557 established that `category: scripts` is machinery and is always
 * replaced: holding one module back while installing the rest strands its
 * callers, which is how ai-personal's 3.8.2 upgrade produced
 * `TypeError: escapeYamlString is not a function` and auto-rolled back. That
 * policy is correct and this rule does not touch it. Nothing here ever routes a
 * script to `customized`, and nothing here ever writes a `.kit-update` sidecar
 * for machinery.
 *
 * What WS-557 did not distinguish is MAGNITUDE. Its own measurement is the
 * regime it was written for: cwos-utils.js differed from the kit-v3.8.1 blob it
 * claimed to be by EIGHT lines, and those lines were a fix 3.8.1 shipped. That
 * is upgrade residue, not authorship, and replacing it is right.
 *
 * ai-personal's cwos-index.js was a different animal wearing the same category.
 * A 1,243-line context indexer (context_retrieval_spec.md stages 1-5, commits
 * 19b76dc..83517ef) sat at kit/scripts/cwos-index.js against a THIRTY-line kit
 * shim. The 3.8.x -> 3.20.0 upgrade (94ba15c) replaced it: 24 added, 1237
 * deleted, exit 0, silent. INDEX.yaml froze and every context pack in the repo
 * came off a stale index for ten days. Note what the same commit did with the
 * files that were merely edited — four .kit-update sidecars were written
 * (system/failures.md, system/invariants.md, .cwos-onboarding.yaml,
 * engines/registry.yaml). Preservation was working that day. cwos-index.js was
 * routed around it by `category: scripts`, on the DIVERGED branch — it was
 * present in the baseline (kit-v3.8.1: 388 B, kit-v3.8.5: 1527 B), so a rule
 * scoped to missing baselines would not have caught it.
 *
 * Forty times the size of the thing it claims to be is not drift. It is
 * different content occupying the same path, and the mechanism cannot tell the
 * difference from content alone — but it can tell from SIZE, and size is enough
 * to stop and ask. So: past these bounds the upgrade refuses and names the
 * file, rather than replacing it and reporting the replacement afterwards.
 *
 * The refusal is bypassable (`--force-replace-scripts`), unlike Guards A and D.
 * Those close cases where proceeding is never right. This one closes a case
 * where proceeding is sometimes right — a genuinely huge kit script that a repo
 * genuinely does want replaced — and the operator supplying that answer is the
 * documented path, on the `--force-stale` precedent. When forced, the file is
 * copied OUT of the repo's kit tree first (see rescueRepoAuthoredScripts in
 * cwos-migrate.js): recovery must not depend on the operator knowing that
 * .cwos-snapshots/ exists.
 *
 * Calibration (measured 2026-09-02, the fleet's real numbers):
 *   - Honest script drift on this fleet is single-digit lines. WS-557's own
 *     example is 8. The delta bound sits at 200 — twenty-five times the
 *     observed regime, and a sixth of the ai-personal incident's 1,213.
 *   - The ratio bound sits at 5x. cwos-index.js scored 41x. A file five times
 *     the size of its baseline has not been edited; it has been rewritten.
 *   - The ratio arm needs a floor or it fires on noise: a 3-line baseline
 *     growing to 16 lines is 5.3x and means nothing. Below 50 lines the ratio
 *     is not evidence, and only the delta bound applies (which such a file
 *     cannot reach). 50 is comfortably above the 8-line drift regime.
 * Raise either bound only with a measurement, per Guard B's discipline.
 *
 * A same-length rewrite scores zero here and will be replaced. That is
 * deliberate: it is indistinguishable from drift by size, and WS-557's default
 * for the ambiguous case is to replace and report. This rule catches the case
 * that is NOT ambiguous.
 *
 * Shared lib rather than a cwos-migrate export, on the lib/sidecar-flood.js
 * precedent: it ships with the kit because the refusal has to fire inside
 * adopted repos, where upgrades actually run.
 */

const MAGNITUDE_RATIO_REFUSE_AT = 5;      // current >= 5x reference size
const MAGNITUDE_RATIO_MIN_LINES = 50;     // below this, the ratio is noise
const MAGNITUDE_DELTA_REFUSE_ABOVE = 200; // |current - reference| lines

function countLines(s) {
  if (!s) return 0;
  const norm = String(s).replace(/\r\n/g, '\n');
  if (norm === '') return 0;
  return norm.endsWith('\n') ? norm.split('\n').length - 1 : norm.split('\n').length;
}

/**
 * scriptMagnitudeVerdict({ currentContent, referenceContent, referenceKind }) →
 *   { repoAuthored, reason, currentLines, referenceLines, currentBytes,
 *     referenceBytes, ratio, lineDelta, referenceKind }
 *
 * `referenceKind` says what the current file is being measured against, and the
 * two callers pass different things for a reason:
 *
 *   'baseline' — the diverged branch. The outgoing tag's blob is the file's own
 *     history, so growth against it is growth of THIS file.
 *   'incoming' — the no-baseline branch. There is no history to measure against,
 *     so the reference is the kit file about to be copied in. This matters: a
 *     script that reached a repo out of band (WS-674 measured cwos-git.js
 *     present in siteproof, whose stamp predates it) has no baseline and is
 *     byte-comparable to the incoming kit file — it must NOT refuse. Only a
 *     no-baseline file that dwarfs what the kit is about to install is
 *     repo-authored.
 *
 * A missing or empty reference yields no verdict — there is nothing to divide
 * by, and Guard B already owns the "the baseline itself is wrong" case.
 */
function scriptMagnitudeVerdict({ currentContent, referenceContent, referenceKind = 'baseline' }) {
  const currentLines = countLines(currentContent);
  const referenceLines = countLines(referenceContent);
  const currentBytes = currentContent ? Buffer.byteLength(currentContent, 'utf8') : 0;
  const referenceBytes = referenceContent ? Buffer.byteLength(referenceContent, 'utf8') : 0;
  const ratio = referenceLines > 0 ? currentLines / referenceLines : null;
  const lineDelta = currentLines - referenceLines;

  const base = {
    currentLines, referenceLines, currentBytes, referenceBytes,
    ratio, lineDelta, referenceKind,
  };

  if (referenceLines === 0) {
    return { ...base, repoAuthored: false, reason: null };
  }
  if (lineDelta > MAGNITUDE_DELTA_REFUSE_ABOVE) {
    return {
      ...base, repoAuthored: true,
      reason: `${currentLines} lines against a ${referenceLines}-line ${referenceKind} `
        + `(+${lineDelta}, past the ${MAGNITUDE_DELTA_REFUSE_ABOVE}-line bound) — `
        + `this is repo-authored content at a kit path, not drift`,
    };
  }
  if (currentLines >= MAGNITUDE_RATIO_MIN_LINES && ratio >= MAGNITUDE_RATIO_REFUSE_AT) {
    return {
      ...base, repoAuthored: true,
      reason: `${currentLines} lines against a ${referenceLines}-line ${referenceKind} `
        + `(${ratio.toFixed(1)}x, past the ${MAGNITUDE_RATIO_REFUSE_AT}x bound) — `
        + `this is repo-authored content at a kit path, not drift`,
    };
  }
  return { ...base, repoAuthored: false, reason: null };
}

module.exports = {
  scriptMagnitudeVerdict,
  countLines,
  MAGNITUDE_RATIO_REFUSE_AT,
  MAGNITUDE_RATIO_MIN_LINES,
  MAGNITUDE_DELTA_REFUSE_ABOVE,
};
