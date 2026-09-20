'use strict';
/**
 * sweep-freshness — the age -> stale judgement shared by all four fleet
 * digests (WS-809).
 *
 * The digests already treat `swept_at: null` as loud ("age UNKNOWN"). They
 * treated every non-null age as quiet, so a sweep that DIED read exactly like
 * one that had just run. On 2026-09-02 Fleet-SessionSweep shipped to Dell
 * inside the G16 and for six days the maintenance digest rendered
 *
 *     Maintenance: clean, last swept 144h ago.
 *
 * with nineteen findings, seven of them high, sitting unswept behind the word
 * "clean". This module is what makes that line refuse to look calm.
 *
 * THREE states, not two — a caller must be able to say which:
 *
 *   swept_at null           -> age_hours null, stale null   (UNKNOWN)
 *   age <= cadence x 3      -> stale false                  (healthy)
 *   age >  cadence x 3      -> stale true                   (SWEEP IS DOWN)
 *
 * UNKNOWN is deliberately not folded into stale:true. "Nobody ever stamped a
 * time" and "the stamp is six days old" have different causes and different
 * fixes, and a digest that collapsed them would lose the distinction the
 * existing null-handling was built to preserve.
 *
 * On cadence: the number is the sweep's DESIGN interval, declared by the sweep
 * script into its own last-sweep.json — not a probe of the scheduled task's
 * actual trigger. A deployment that fires slower than the design will read
 * stale, and that is correct: the disagreement between the two IS the finding.
 * Probing the real trigger is not available anyway — the reader is often on a
 * different node than the runner.
 */

/** Fleet-SessionSweep's design cadence. Stamps written before WS-809 carry no
 *  cadence_minutes; they get assessed against this rather than skipped, because
 *  an unassessed digest is the exact quiet state this module exists to end. */
const DEFAULT_CADENCE_MINUTES = 15;

/** Stale at 3x cadence — 45 min for a 15-min sweep. Tolerates a reboot plus one
 *  missed run without crying wolf, and still catches a real outage inside the
 *  hour instead of after six days. */
const TOLERANCE_FACTOR = 3;

/**
 * @param {object} opts
 * @param {string|null} opts.swept_at        ISO timestamp, or null if never stamped
 * @param {number} [opts.now]                ms epoch (tests); defaults to Date.now()
 * @param {number|null} [opts.cadence_minutes] declared cadence; falls back to the default
 * @returns {{swept_at: string|null, age_hours: number|null, cadence_minutes: number,
 *            stale_after_hours: number, stale: boolean|null}}
 */
function assess(opts = {}) {
  const now = typeof opts.now === 'number' ? opts.now : Date.now();

  const declared = Number(opts.cadence_minutes);
  const cadenceMinutes = Number.isFinite(declared) && declared > 0
    ? declared
    : DEFAULT_CADENCE_MINUTES;

  const staleAfterMs = cadenceMinutes * 60000 * TOLERANCE_FACTOR;
  const sweptAt = opts.swept_at || null;

  // An unparseable stamp is as uninformative as a missing one — both are UNKNOWN.
  const parsed = sweptAt && Number.isFinite(Date.parse(sweptAt)) ? Date.parse(sweptAt) : null;
  const ageMs = parsed === null ? null : now - parsed;

  return {
    swept_at: sweptAt,
    age_hours: ageMs === null ? null : Math.round(ageMs / 3600000 * 10) / 10,
    cadence_minutes: cadenceMinutes,
    stale_after_hours: Math.round(staleAfterMs / 3600000 * 100) / 100,
    stale: ageMs === null ? null : ageMs > staleAfterMs,
  };
}

module.exports = { assess, DEFAULT_CADENCE_MINUTES, TOLERANCE_FACTOR };
