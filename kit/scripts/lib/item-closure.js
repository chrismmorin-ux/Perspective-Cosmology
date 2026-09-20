'use strict';
/**
 * item-closure — the side effects every item closure owes, wherever it happens.
 *
 * WHY THIS EXISTS (WS-665). Closing a work item is not one write. It is a
 * status flip PLUS two outbound obligations that live in other systems:
 *
 *   1. A closed item born from a finding tells the calibration ledger that the
 *      finding was useful (WS-310 Phase C). Skip it and the finding-quality
 *      score drifts toward "nothing we surfaced ever mattered".
 *   2. A closed item born from friction tells the repos that reported that
 *      friction it is fixed (WS-581). Skip it and those repos keep re-reporting
 *      a defect that is already gone, which is how a friction feed becomes
 *      noise nobody reads.
 *
 * Both lived inline in cwos-next.js runDone — the sprint closure path. When
 * cwos-item.js gained a non-sprint closure path (the second half of WS-665's
 * friction: a claimed item outside any sprint had no CLI closure at all), the
 * choice was to duplicate ~60 lines or to extract them. Duplication here is
 * specifically dangerous: two closure paths that agree today and drift
 * tomorrow produce items that are "done" in one sense and not the other,
 * silently, with no test that can see the difference. So: one implementation,
 * two callers.
 *
 * DEGRADATION CONTRACT. Every effect here is non-fatal and best-effort. The
 * item_closed event is already in the log by the time this runs — it is the
 * commit point. A thank-you note that throws must never prevent a close, and
 * reconcile catches any state these writes would have refreshed.
 */

const CLOSURE_WARN_PREFIX = 'closure';

/**
 * Extract a finding id from a queue item, accepting every shape one appears in.
 *
 * Four shapes, all live: top-level `finding_id` (hand-written items),
 * top-level `source_finding` (what the auto-promoter writes — missed until
 * 2026-05-19, so auto-promoted items never auto-resolved), and the nested
 * `source.finding` / `source.finding_id` legacy forms.
 */
function findingIdFor(queueData) {
  const d = queueData || {};
  const raw =
    d.finding_id ||
    d.source_finding ||
    (d.source && (d.source.finding || d.source.finding_id)) ||
    null;
  if (!raw) return null;
  // Broad on purpose: FIND-B003, FIND-CA-INV-F1 and FIND-289 are all real.
  return /^FIND-[A-Za-z0-9-]+$/.test(String(raw)) ? String(raw) : null;
}

/** Friction hashes travel under source.friction_hashes (cwos-friction-sweep). */
function frictionHashesFor(queueData) {
  const h = queueData && queueData.source && queueData.source.friction_hashes;
  return Array.isArray(h) && h.length > 0 ? h : null;
}

/**
 * Request hashes travel under source.request_hashes (WS-699's return leg).
 * Same shape as friction_hashes on purpose: closing a peer repo's request is
 * the moment that repo learns its ask was taken, and the alternative — that
 * it learns nothing — is the 101-day silence this channel exists to end.
 */
function requestHashesFor(queueData) {
  const h = queueData && queueData.source && queueData.source.request_hashes;
  return Array.isArray(h) && h.length > 0 ? h : null;
}

/**
 * Run the closure side effects for one item.
 *
 * @param {object}   opts
 * @param {string}   opts.repoRoot      repo root (code root) — auto-resolved writes land here
 * @param {object}   opts.queueData     the item's parsed YAML, pre-close
 * @param {string}   opts.wsId          WS-NNN
 * @param {string|null} opts.sprintId   owning sprint, or null for a standalone close
 * @param {string}   opts.completedAt   ISO timestamp
 * @param {string|null} [opts.completionCommit]
 * @param {Function} [opts.onWarn]      called with a one-line human warning
 * @returns {{auto_resolved: object|null, friction_announce: object|null}}
 */
function runClosureSideEffects(opts = {}) {
  const {
    repoRoot, queueData, wsId, sprintId = null, completedAt,
    completionCommit = null,
  } = opts;
  const warn = typeof opts.onWarn === 'function' ? opts.onWarn : () => {};

  const out = { auto_resolved: null, friction_announce: null, request_announce: null };

  const findingId = findingIdFor(queueData);
  if (findingId) {
    try {
      const { writeAutoResolvedEntries } = require('./auto-resolved');
      const wr = writeAutoResolvedEntries({
        rootDir: repoRoot,
        findingId,
        wsId,
        sprintId,
        completedAt,
      });
      out.auto_resolved = {
        ws_id: wsId,
        finding_id: findingId,
        feedback_appended: !!wr.feedback_appended,
        lifecycle_appended: !!wr.lifecycle_appended,
        hash_updated: !!wr.hash_updated,
        warnings: wr.warnings || [],
      };
      for (const w of (wr.warnings || [])) {
        warn(`${CLOSURE_WARN_PREFIX}: auto-resolved ${findingId}: ${w}`);
      }
    } catch (e) {
      warn(`${CLOSURE_WARN_PREFIX}: auto-resolved write for ${findingId} threw (non-fatal): ${e.message}`);
    }
  }

  const frictionHashes = frictionHashesFor(queueData);
  if (frictionHashes) {
    try {
      const { announce } = require('./friction-announce');
      const title = (queueData && queueData.title) || wsId;
      const ann = announce(frictionHashes, {
        type: 'friction_resolved',
        ws_id: wsId,
        detail: `${wsId} ${String(title).slice(0, 140)}${completionCommit ? ` (commit ${completionCommit})` : ''}`,
      });
      out.friction_announce = {
        ws_id: wsId,
        delivered: ann.delivered.map((x) => x.repo),
        deferred: ann.deferred.map((x) => x.repo),
        undeliverable: ann.undeliverable,
        ledgered: ann.ledgered,
      };
    } catch (e) {
      warn(`${CLOSURE_WARN_PREFIX}: friction announce for ${wsId} threw (non-fatal): ${e.message}`);
    }
  }

  const requestHashes = requestHashesFor(queueData);
  if (requestHashes) {
    try {
      const { announce } = require('./friction-announce');
      const title = (queueData && queueData.title) || wsId;
      const ann = announce(requestHashes, {
        type: 'request_accepted',
        ws_id: wsId,
        detail: `${wsId} ${String(title).slice(0, 140)}${completionCommit ? ` (commit ${completionCommit})` : ''}`,
      });
      out.request_announce = {
        ws_id: wsId,
        delivered: ann.delivered.map((x) => x.repo),
        deferred: ann.deferred.map((x) => x.repo),
        undeliverable: ann.undeliverable,
        ledgered: ann.ledgered,
      };
    } catch (e) {
      warn(`${CLOSURE_WARN_PREFIX}: request announce for ${wsId} threw (non-fatal): ${e.message}`);
    }
  }

  return out;
}

module.exports = { runClosureSideEffects, findingIdFor, frictionHashesFor, requestHashesFor };
