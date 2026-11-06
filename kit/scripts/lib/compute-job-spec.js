'use strict';
/**
 * compute-job-spec.js — the kit's reading of two queue-item fields: `compute_job` and `runs_on`.
 *
 * WHY THIS IS A KIT MODULE. Both fields are already kit vocabulary. `lib/model-lane.js`
 * routes any item carrying a `compute_job` block to the compute lane, and `lib/model-lane.js`
 * and `lib/overflow-router.js` both read `runs_on` in the capability vocabulary
 * (`compute` / `browser` / `light` / `any`, legacy machine tokens accepted on read). What the
 * kit lacked was (a) a definition of when a `compute_job` block is actually RUNNABLE, and
 * (b) one normaliser for `runs_on`, so a hand-edited `Node1` or `"compute"  # note` reads the
 * same everywhere it is compared.
 *
 * WHAT IS DELIBERATELY NOT HERE. Turning a block into a runner submission (job ids, artifact
 * return keys, step fingerprints for dedupe) belongs to whichever dispatcher an adopter runs.
 * Claude-Poker-Tracker's dispatcher (`cwos-fleet-compute.js`, its local
 * `lib/cwos-compute-job.js`) is the one that exists today and it re-exports these functions,
 * so the reducer's `compute_ready` stamp and its dispatcher can never disagree about "ready".
 * Upstreamed from Claude-Poker-Tracker WS-493 / WS-676 (HomeBase WS-1673 backport).
 *
 * SPEC SHAPE (authored in a WS-NNN.yaml):
 *   compute_job:
 *     maxJobHours: 8                   # optional
 *     steps:
 *       - name: study-ladder           # required
 *         cmd: node                    # required
 *         args: [scripts/...]          # optional list
 *         expectFiles: [out/x.json]    # required, non-empty — an exit code is not evidence
 *         env: { KEY: value }          # optional mapping
 *         estimateHours: 3             # optional; when EVERY step has one, the sum must fit
 *     artifacts: [out/x.json]          # optional list
 *
 * Zero external dependencies. Pure: nothing here reads the filesystem or the clock.
 */

/**
 * Validate an authored `compute_job` block.
 *
 * @param {any} job - the raw `compute_job` value from a WS-*.yaml
 * @returns {{ok: boolean, problems: string[]}}
 */
function validateComputeJob(job) {
  const problems = [];
  if (job === undefined || job === null) return { ok: false, problems: ['no compute_job block'] };
  if (typeof job !== 'object' || Array.isArray(job)) {
    return { ok: false, problems: ['compute_job must be a mapping'] };
  }
  if (!Array.isArray(job.steps) || job.steps.length === 0) {
    problems.push('compute_job.steps must be a non-empty list');
    return { ok: false, problems };
  }
  job.steps.forEach((s, i) => {
    const at = `steps[${i}]`;
    if (!s || typeof s !== 'object' || Array.isArray(s)) {
      problems.push(`${at} must be a mapping`);
      return;
    }
    if (!s.name) problems.push(`${at} needs a name`);
    if (!s.cmd) problems.push(`${at} needs a cmd`);
    if (!Array.isArray(s.expectFiles) || s.expectFiles.length === 0) {
      // The rule people most want to skip, and skipping it is what makes a green exit code
      // mean nothing.
      problems.push(`${at} ("${s.name || '?'}") declares no expectFiles — refusing (exit codes are not evidence)`);
    }
    if (s.args !== undefined && !Array.isArray(s.args)) problems.push(`${at}.args must be a list`);
    if (s.env !== undefined && (typeof s.env !== 'object' || Array.isArray(s.env))) {
      problems.push(`${at}.env must be a mapping`);
    }
  });
  if (job.artifacts !== undefined && !Array.isArray(job.artifacts)) {
    problems.push('compute_job.artifacts must be a list');
  }
  if (job.maxJobHours !== undefined && !(Number(job.maxJobHours) > 0)) {
    problems.push('compute_job.maxJobHours must be a positive number');
  }

  // A SPEC THAT CANNOT FINISH IS REFUSED AT AUTHORING TIME, NOT AT THE TIMEOUT. Only checked
  // when EVERY step carries an estimate: a partial sum compared against the cap means nothing,
  // and refusing on it would be refusing on noise. An absent estimate is an unchecked claim,
  // not an error. (Claude-Poker-Tracker measured the cost: one spec declared four steps under
  // a 16h cap while step 0 alone took ~15h, and it was discovered by burning the 16h three
  // separate times.)
  const steps = job.steps;
  const estimates = steps
    .map((s) => (s && s.estimateHours))
    .filter((h) => Number(h) > 0)
    .map(Number);
  if (estimates.length === steps.length && Number(job.maxJobHours) > 0) {
    const total = estimates.reduce((a, b) => a + b, 0);
    if (total > Number(job.maxJobHours)) {
      problems.push(
        `compute_job step estimates total ${total.toFixed(1)}h but maxJobHours is `
        + `${job.maxJobHours} — this job cannot finish as specified. `
        + 'Raise the cap or split the steps.',
      );
    }
  }
  steps.forEach((s, i) => {
    if (s && s.estimateHours !== undefined && !(Number(s.estimateHours) > 0)) {
      problems.push(`steps[${i}].estimateHours must be a positive number`);
    }
  });

  return { ok: problems.length === 0, problems };
}

/** The reducer's cached `compute_ready` stamp. A pure function of the block; never throws. */
function isComputeReady(item) {
  try {
    return validateComputeJob(item && item.compute_job).ok;
  } catch {
    return false;
  }
}

/**
 * Legacy machine tokens -> the capability they meant.
 *
 * `runs_on` used to name a MACHINE, and a label naming a machine dies with the machine. The
 * vocabulary now names what the work NEEDS. Closed items keep their original label (rewriting
 * them would falsify how the work was routed at the time), so both vocabularies must READ
 * correctly. These are the same legacy tokens `lib/model-lane.js` (COMPUTE_RUNS_ON, the
 * phone/g16 branches) and `lib/overflow-router.js` (LOCAL_RUNS_ON) already accept.
 */
const RUNS_ON_LEGACY = Object.freeze({
  node1: 'compute',
  g16: 'browser',
  phone: 'light',
});

/**
 * Normalise a `runs_on` label to a bare lowercase capability token, or null.
 *
 * Labels are meant to be hand-corrected, and a hand-edit is where a stray quote, capital,
 * trailing space or inline comment arrives. A comparison that silently misses `Compute`
 * presents as idle supply with no error anywhere.
 */
function normalizeRunsOn(v) {
  if (v === undefined || v === null) return null;
  let s = String(v).trim();
  const hash = s.indexOf('#');
  if (hash !== -1) s = s.slice(0, hash).trim();
  s = s.replace(/^['"]|['"]$/g, '').trim().toLowerCase();
  if (s.length === 0) return null;
  return RUNS_ON_LEGACY[s] || s;
}

module.exports = {
  validateComputeJob,
  isComputeReady,
  normalizeRunsOn,
  RUNS_ON_LEGACY,
};
