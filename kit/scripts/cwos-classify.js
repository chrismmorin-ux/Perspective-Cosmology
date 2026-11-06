/**
 * cwos-classify — Shared classification module (WS-265, ADR-037 Decision #3,
 * cross-critic ALTERATION-1).
 *
 * Two pure functions called inline by cwos-next.js (and future cwos-pulse.js,
 * cwos-audit.js):
 *   - classifySource(item) → 'auto-rec' | 'engine-finding' | 'pre-mortem'
 *                            | 'spr-followup' | 'plan-internal' | 'conversation'
 *                            | 'untagged'
 *   - classifyMode(item)   → 'execute' | 'plan-first'
 *
 * CRITICAL (ALTERATION-1): mode_classification is NOT cached on WS items.
 * classifyMode is invoked at candidate-list time, not stamped at write time.
 * The 5 trigger fields (effort, category, type, files_involved, decision_flags)
 * are already loaded when the WS YAML is loaded — caching adds an
 * invalidation surface for negative ROI.
 *
 * Pure: no I/O, no Date.now(), no module state, no caching. 100% deterministic
 * given input fields.
 *
 * Zero external deps.
 */

'use strict';

// ─── Source classification ──────────────────────────────────────────────────

/**
 * Classify the source-class of a workstream item.
 *
 * Rules (priority order — first match wins, mirrors next.md Step 2d):
 *   1. source === "auto-recommendation" (string)        → 'auto-rec'
 *   2. dict has `engine`                                → 'engine-finding'
 *   3. dict has `pre_mortem_id`                         → 'pre-mortem'
 *   4. dict has `parent_ws`                             → 'spr-followup'
 *   5. dict has `plan`                                  → 'plan-internal'
 *   6. dict has `conversation`                          → 'conversation'
 *   7. otherwise (absent / null / unknown shape)        → 'untagged'
 *
 * The priority order matches the source-class damping rule (Step 2d):
 * `auto-rec` and `engine-finding` are the saturation-prone classes;
 * founder-driven classes (`pre-mortem`, `plan-internal`, `conversation`,
 * `spr-followup`) come after but are never damped.
 *
 * @param {object} item — workstream item with optional `source` field
 * @returns {string} one of seven source-class enum values
 */
function classifySource(item) {
  if (!item) return 'untagged';
  const src = item.source;
  if (src == null) return 'untagged';

  if (typeof src === 'string') {
    if (src === 'auto-recommendation') return 'auto-rec';
    return 'untagged';
  }

  if (typeof src !== 'object' || Array.isArray(src)) return 'untagged';

  if ('engine' in src)         return 'engine-finding';
  if ('pre_mortem_id' in src)  return 'pre-mortem';
  if ('parent_ws' in src)      return 'spr-followup';
  if ('plan' in src)           return 'plan-internal';
  if ('conversation' in src)   return 'conversation';

  return 'untagged';
}

// ─── Mode classification ────────────────────────────────────────────────────

const PLAN_FIRST_CATEGORIES = new Set(['architecture', 'ux']);
const EXECUTE_TYPES = new Set(['bug', 'finding']);
// Founder 2026-11-01: an S `task` or `defect` with written accept_criteria and no open founder
// decision is "Just do it" too (docs/designs/low-risk-self-lane.md §5). Held to more than a bug is,
// because a task is often a decision or a machine job in disguise (review H12, H13).
const SCOPED_EXECUTE_TYPES = new Set(['task', 'defect']);
// XS was excluded only by `effort !== 'S'`, never by a stated rule; it is smaller than S, so it is
// in. Anything else (lowercase, XL, absent) stays plan-first.
const EXECUTE_EFFORTS = new Set(['S', 'XS']);
const SCOPED_PLAN_FIRST_CATEGORIES = new Set(['security', 'fleet', 'fleet-health', 'infrastructure', 'legal', 'compliance', 'finance', 'money']);
const SCOPED_PLAN_FIRST_SEVERITY = new Set(['high', 'critical']);
// Capabilities a session cannot supply unattended (machine-affinity.md): his hands or a signed-in browser.
const UNATTENDED_REFUSED_RUNS_ON = new Set(['offline', 'browser']);

const nonEmpty = (v) => (Array.isArray(v) ? v.some((x) => nonEmpty(x)) : typeof v === 'string' ? v.trim().length > 0
  : v && typeof v === 'object' ? Object.keys(v).length > 0 : v != null && v !== false);
const textOf = (v) => (Array.isArray(v) ? v.map(textOf).join('\n') : v && typeof v === 'object' ? Object.values(v).map(textOf).join('\n') : String(v == null ? '' : v));

/**
 * Pure: does the item carry written acceptance criteria? Reads the reducer's cached boolean when
 * present (the projection does not mirror the criteria themselves), else the YAML field. Only the
 * canonical `accept_criteria` counts; the rare other spellings fall to plan-first (review M14).
 */
function hasAcceptCriteria(item) {
  if (!item) return false;
  if (typeof item.has_accept_criteria === 'boolean') return item.has_accept_criteria;
  return nonEmpty(item.accept_criteria);
}

const DECIDE_TITLE = /^\s*(decide|decision|ask|choose|pick)\b/i;
const FOUNDER_WORDS = /\b(founder|desk|ratif\w*|his (answer|tap|call|decision)|approv\w* by)\b/i;

/**
 * Pure (review H12): is a founder decision open in this item? There is no one field for it, so
 * every place one is written today counts, and any of them holds the item back: decision_flags in
 * any shape (a string too, which the projection's array filter drops, M15), needs_founder,
 * founder_decision, a "Decide:" title, accept_criteria or a blocker note that waits on the founder
 * or the desk. Reads the reducer's cached boolean when present.
 */
function founderDecisionOpen(item) {
  if (!item) return true;
  if (typeof item.founder_decision_open === 'boolean') return item.founder_decision_open;
  if (nonEmpty(item.decision_flags) || nonEmpty(item.needs_founder) || nonEmpty(item.founder_decision)) return true;
  if (DECIDE_TITLE.test(String(item.title || ''))) return true;
  if (FOUNDER_WORDS.test(textOf(item.accept_criteria)) || FOUNDER_WORDS.test(String(item.blocked_by_note || ''))) return true;
  return false;
}

/**
 * Classify the execution mode of a workstream item.
 *
 * plan-first if ANY of (next.md Step 3d):
 *   - effort is M or L
 *   - category is architecture or ux
 *   - type is improvement (NOT bug or finding)
 *   - files_involved spans 3+ distinct directories
 *   - decision_flags is populated (non-empty array)
 *
 * execute if ALL of:
 *   - effort is S or XS (XS added 2026-11-01: it was excluded only by `effort !== 'S'`)
 *   - type is bug or finding, OR (founder 2026-11-01) type is task or defect AND it has written
 *     accept_criteria AND no founder decision is open in it (founderDecisionOpen) AND its category
 *     is not security/fleet/infrastructure/legal/compliance/finance AND its severity is not
 *     high/critical AND it does not need `offline` or `browser`
 *   - no decision_flags (empty or missing)
 *   - files_involved in 1-2 directories
 *
 * The two predicates are mutually exclusive given the trigger set: an item
 * with type="improvement" never matches `execute` because the type test
 * fails; an item with M/L effort always matches `plan-first` regardless of
 * other fields. There is no third bucket — every item resolves to one of
 * these two modes.
 *
 * @param {object} item — workstream item
 * @returns {string} 'execute' or 'plan-first'
 */
function classifyMode(item) {
  if (!item) return 'plan-first';   // defensive default — favor planning over rushing

  const effort = item.effort;
  const category = item.category;
  const type = item.type;
  const decisionFlags = item.decision_flags;
  const filesInvolved = item.files_involved;

  // ── plan-first triggers (any one fires) ─────────────────────────────────
  if (effort === 'M' || effort === 'L') return 'plan-first';
  if (PLAN_FIRST_CATEGORIES.has(category)) return 'plan-first';
  if (type && !EXECUTE_TYPES.has(type) && type === 'improvement') return 'plan-first';
  if (Array.isArray(decisionFlags) && decisionFlags.length > 0) return 'plan-first';
  if (Array.isArray(filesInvolved) && countDistinctDirs(filesInvolved) >= 3) return 'plan-first';

  // ── execute requirements (all must hold) ────────────────────────────────
  if (!EXECUTE_EFFORTS.has(effort)) return 'plan-first';          // not S/XS → plan-first
  if (type && EXECUTE_TYPES.has(type)) return 'execute';          // bug/finding: unchanged rule
  // (decision_flags + dirs already checked above; reaching here means they're fine)

  // ── task / defect (founder 2026-11-01): written criteria, nothing waiting on him ───────────
  if (!type || !SCOPED_EXECUTE_TYPES.has(type)) return 'plan-first';
  if (!hasAcceptCriteria(item)) return 'plan-first';
  if (founderDecisionOpen(item)) return 'plan-first';
  if (SCOPED_PLAN_FIRST_CATEGORIES.has(String(category || '').toLowerCase())) return 'plan-first';
  if (SCOPED_PLAN_FIRST_SEVERITY.has(String(item.severity || '').toLowerCase())) return 'plan-first';
  if (UNATTENDED_REFUSED_RUNS_ON.has(String(item.runs_on || '').toLowerCase())) return 'plan-first';
  return 'execute';
}

/**
 * Count distinct top-level directories in a files_involved array.
 * Tolerant of annotated paths like "kit/scripts/foo.js (new)" or
 * "(parent only — ...)" — strips annotations and skips parenthetical-only
 * entries.
 *
 * Distinctness uses the dirname() of each path (POSIX-style separators).
 */
function countDistinctDirs(files) {
  const dirs = new Set();
  for (const raw of files) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('(')) continue;
    // Strip trailing annotation like " (new)" or " (hardlink target)"
    const annotIdx = trimmed.indexOf(' (');
    const pathPart = annotIdx === -1 ? trimmed : trimmed.slice(0, annotIdx);
    const norm = pathPart.replace(/\\/g, '/').trim();
    if (!norm) continue;
    const slashIdx = norm.lastIndexOf('/');
    const dir = slashIdx === -1 ? '.' : norm.slice(0, slashIdx);
    dirs.add(dir);
  }
  return dirs.size;
}

module.exports = {
  classifySource,
  classifyMode,
  countDistinctDirs,
  hasAcceptCriteria,
  founderDecisionOpen,
};
