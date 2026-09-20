'use strict';
/**
 * sidecar-flood — the refusal rule for sidecar volume (WS-592, Guard D).
 *
 * INV-065 closed the case where the baseline is WRONG; this closes the case
 * where the baseline resolves and the sidecar count is still absurd. Both end
 * the same place — a repo holding hundreds of review-this-by-hand files no
 * founder can discharge (323 measured in physical-therapy-by-ai, 2026-08-04).
 * Producing that state is a failure even when every individual write is
 * correct, so past these bounds the mechanism refuses instead of writing.
 *
 * Calibration (measured 2026-08-13): honest customization on this fleet is a
 * handful of files per repo — single-digit percent of what ships. The WS-547
 * failure signature was the majority of a repo's kit files sidecar-ed in one
 * run (nutrition holds 187 stranded sidecars; PTAI's incident wrote 323).
 * The ratio bound sits at 25%: far above any honest repo, far below the
 * failure mode. The absolute bound covers callers with no denominator
 * (adopt-install repair) — 100 sidecars is already past what anyone reviews,
 * wherever the ratio sits. Raise either bound only with a measurement, per
 * Guard B's discipline.
 *
 * Shared lib (not a cwos-migrate export) because both cwos-migrate and
 * cwos-adopt-install consume it and migrate already requires adopt-install —
 * a lib avoids the require cycle. Ships with the kit: the refusal must fire
 * inside adopted repos, where upgrades actually run.
 */

const SIDECAR_RATIO_MIN_FILES = 20;   // below this many existing files, ratio is noise
const SIDECAR_RATIO_REFUSE_ABOVE = 0.25;
const SIDECAR_ABS_REFUSE = 100;

/**
 * verdict({ sidecarCount, existingCount }) →
 *   { refuse: bool, pct: number|null, reason: string|null }
 * existingCount may be null/undefined when the caller has no denominator;
 * only the absolute bound applies then.
 */
function sidecarFloodVerdict({ sidecarCount, existingCount }) {
  const n = Number(sidecarCount) || 0;
  const denom = Number.isFinite(Number(existingCount)) && Number(existingCount) > 0
    ? Number(existingCount) : null;
  const pct = denom ? n / denom : null;

  if (n >= SIDECAR_ABS_REFUSE) {
    return {
      refuse: true, pct,
      reason: `${n} sidecar(s) >= absolute bound ${SIDECAR_ABS_REFUSE} — no founder reviews that many files`,
    };
  }
  if (denom && denom >= SIDECAR_RATIO_MIN_FILES && pct > SIDECAR_RATIO_REFUSE_ABOVE) {
    return {
      refuse: true, pct,
      reason: `${n}/${denom} (${Math.round(pct * 100)}%) of existing kit files classified customized — above the ${Math.round(SIDECAR_RATIO_REFUSE_ABOVE * 100)}% bound, this is a wrong baseline, not local customization`,
    };
  }
  return { refuse: false, pct, reason: null };
}

module.exports = {
  sidecarFloodVerdict,
  SIDECAR_RATIO_MIN_FILES,
  SIDECAR_RATIO_REFUSE_ABOVE,
  SIDECAR_ABS_REFUSE,
};
