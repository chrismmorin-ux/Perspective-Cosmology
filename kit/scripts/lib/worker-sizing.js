'use strict';
/**
 * worker-sizing — derive test parallelism from measured free RAM (WS-711).
 *
 * WS-708 gave the fleet a headroom GATE: a suite that cannot fit does not start.
 * The gate is binary, and binary is not enough. Test runners take a fixed worker
 * count chosen when nobody knew six sessions would be live, so on a loaded
 * machine `-n 4` is not four times the throughput — it is four processes paging.
 * That does not fail as "out of memory". It fails as a FAILING TEST, and a
 * failing test is believed:
 *
 *   claude-poker-tracker 2026-08-22 — the same suite on identical code reported
 *     5 failed, then 1, then 0, purely as a function of concurrent load.
 *   ServeYourNote 2026-08-23 — four xdist workers racing --create-db on a loaded
 *     machine tripped the 30s timeout: 2,341 then 3,868 spurious errors.
 *
 * Both were debugged as product bugs before anyone measured the machine. This
 * module is the graceful degrade between "run it at the number someone typed"
 * and "refuse to run at all".
 *
 * THE FLOOR IS 1, NEVER 0. "Run this serially" is a valid answer; "run nothing"
 * belongs to the gate (--require-gb), not here. Keeping the two verdicts separate
 * is the whole reason this is a second verdict rather than a tighter first one.
 *
 * ON THE PER-WORKER NUMBER: 1.5 GB is an ESTIMATE. The fleet has never measured
 * what one test worker actually costs, and this module says so in its own output
 * (`calibrated: false`) rather than presenting a guess as a measurement. A repo
 * that has measured its own suite passes the real figure and gets
 * `calibrated: true`. Calibrating it needs a repo with a genuinely parallel
 * runner — HomeBase's own sweep is serial, so the number cannot be earned here.
 */

const os = require('os');

/** Estimated cost of one test worker. Not measured — see the header. */
const DEFAULT_PER_WORKER_GB = 1.5;

/** Left unallocated for the OS and the session doing the asking. */
const DEFAULT_RESERVE_GB = 2.0;

const positive = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/**
 * @param {object} opts
 * @param {number} opts.freeGB           measured physical free memory
 * @param {number} [opts.perWorkerGB]    estimated cost per worker
 * @param {number} [opts.reserveGB]      memory to leave unallocated
 * @param {number} [opts.maxWorkers]     hard ceiling (default: core count)
 * @returns {{workers:number, freeGB:number, perWorkerGB:number, reserveGB:number,
 *            maxWorkers:number, usableGB:number, basis:string, calibrated:boolean}}
 */
function deriveWorkers(opts = {}) {
  const freeGB = Number.isFinite(Number(opts.freeGB)) ? Number(opts.freeGB) : 0;
  const perWorkerGB = positive(opts.perWorkerGB, DEFAULT_PER_WORKER_GB);

  // A reserve of 0 is a legitimate choice (a dedicated CI box), so it is allowed
  // through where a per-worker of 0 is not — that one would divide by zero. But
  // that also means `positive()` cannot guard it, and Number(null) is 0: an
  // omitted reserve would pass the >= 0 test and silently drop the OS's memory
  // to zero. Absence has to be checked before the value is coerced.
  const reserveGB = (opts.reserveGB === undefined || opts.reserveGB === null
    || !Number.isFinite(Number(opts.reserveGB)) || Number(opts.reserveGB) < 0)
    ? DEFAULT_RESERVE_GB
    : Number(opts.reserveGB);

  // Free RAM can suggest more workers than the machine has cores, and that is
  // never the right answer.
  const maxWorkers = Math.max(1, Math.floor(positive(opts.maxWorkers, os.cpus().length)));

  const usableGB = Math.max(0, freeGB - reserveGB);
  const fits = Math.floor(usableGB / perWorkerGB);
  const workers = Math.min(maxWorkers, Math.max(1, fits));

  return {
    workers,
    freeGB: +freeGB.toFixed(2),
    perWorkerGB,
    reserveGB,
    maxWorkers,
    usableGB: +usableGB.toFixed(2),
    basis: 'floor((free - reserve) / per-worker), clamped to [1, maxWorkers]',
    // Whether the per-worker figure was supplied by someone who measured it, or
    // is this module's estimate. Shipped in the output so a number can never be
    // mistaken for evidence it is not.
    calibrated: positive(opts.perWorkerGB, null) !== null,
  };
}

module.exports = { deriveWorkers, DEFAULT_PER_WORKER_GB, DEFAULT_RESERVE_GB };
