/**
 * select-slate.js — THE ranking path. WS-857, EVQ Step 0.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 *  There is ONE selector. Every surface that shows the founder an ordered list of work
 *  renders its output. A second sort over `priority_score` anywhere in kit/scripts is a
 *  defect, and `kit/scripts/__tests__/select-slate-single-path.test.js` fails on one.
 *
 *  Upstreamed from Claude-Poker-Tracker (WS-857 / WS-1016 there) by HomeBase WS-1673. The
 *  measurements quoted below were taken in that repo; they are its evidence, kept as history.
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * WHAT WAS WRONG, MEASURED 2026-09-11 (Claude-Poker-Tracker)
 *
 * Four ranking paths existed and only one of them applied the dependency gate:
 *
 *   kit/scripts/cwos-next.js:1311   runCandidates()      GATED
 *   kit/scripts/cwos-next.js:1641   candidatesInline()   GATED — a ~110-line near-copy of
 *                                                        the above, carrying three separate
 *                                                        "mirror the other one" comments
 *                                                        (WS-350, WS-590, WS-695), each the
 *                                                        scar of a drift between them
 *   kit/scripts/lib/cwos-orchestrate.js:120  gatherQueueSummary()   NOT GATED  <- /status
 *   kit/scripts/cwos-reconcile.js:537        top_3_unclaimed        NOT GATED  <- /session-start
 *   kit/scripts/cwos-fleet-compute.js:1499   reviewDebt()           NOT GATED
 *
 * So the list the founder opened every session on was ungated. Measured the day this was
 * written: `system-summary.yaml` showed WS-718 / WS-725 / WS-724 while the gated selector
 * showed WS-719 / WS-746 / WS-635 — ZERO overlap, and all three shown items were blocked
 * (WS-718 on eleven separate unmet blockers).
 *
 * THE TIEBREAK, AND WHY IT IS A DECLARED CHAIN RATHER THAN ONE KEY
 *
 * `candidateRankCmp` used to end at `raw_score`, returning 0 for any pair equal on all
 * three keys. `Array.prototype.sort` is stable, so those pairs kept their input order —
 * and input order is `fs.readdirSync` order (core/state-store.js:519). Measured: **80.2%
 * of adjacent comparisons** in the 435-item candidate list were exact ties, so four
 * comparisons in five were decided by the order the filesystem happened to hand back.
 * The greenfield design names that as kill-list item 5.
 *
 * The design of record declares the replacement as a CHAIN, not a key
 * (`docs/design/audits/2026-09-05-greenfield-ev-terminal-queue.md` §2.1): "residual tie
 * broken by a declared, displayed, non-EV key — path completion, then `runs_on` supply,
 * then filed-date ascending." Its reason matters as much as its content: it satisfies
 * "a ranking is a comparative claim" by **not claiming a total order the substrate cannot
 * support, rather than by faking one.**
 *
 * What is implemented here, and what is refused:
 *
 *   L1  path completion       REFUSED — `unexamined`. Its true form needs each item's route
 *                             to an EV terminal, and 0 of 511 backlog items carry an
 *                             `ev.serves` route today (WS-860). The available proxy —
 *                             fraction of `blocked_by` already cleared — is degenerate twice
 *                             over: every gated candidate has ALL blockers cleared by
 *                             construction, and 451 of 512 backlog items have no blockers at
 *                             all (measured 2026-09-11). A proxy that resolves nothing,
 *                             wearing the name of a declared key, is a false provenance claim.
 *                             The slate says `unexamined` and names WS-860. The hole is the
 *                             work queue.
 *   L2  runs_on supply        Unconstrained (`any`, or unlabelled) before capability-pinned.
 *                             A pinned item is a CONDITIONAL start — it needs a supplier that
 *                             may not exist today (`.claude/rules/machine-affinity.md`).
 *                             Coverage measured: 377 of 512 labelled — any 246, compute 101,
 *                             browser 28, light 2.
 *   L3  created_at ascending  Filed-date, the key the design actually names. Measured
 *                             coverage: 512 of 512. Oldest first — deliberately opposite to
 *                             today's accidental recency bias.
 *   L4  id ascending          STATED last resort, and it says so on the slate's face.
 *
 * WHY NOT ID AS THE PRIMARY RESIDUAL — this was proposed, and the repo refuted it.
 * `.claude/workstream/id-collisions.yaml` records THREE separate renumbering events;
 * COL-002 rewrote `WS-753..767` to `WS-857..871` on 2026-09-08 because `next_item_id` is a
 * per-branch counter with nothing reconciling it. Under an id-primary tiebreak that merge
 * silently moved fifteen items from the front of every tie group to the back — a ranking
 * mutation with no EV content, invisible in the output. **A key a merge can rewrite is not a
 * declared order; it is filesystem read order wearing a suit.** `created_at` does not move.
 * Id survives at L4 because by then the pair is identical on everything else and something
 * must be total — and it is labelled `id-fallback` when it fires.
 *
 * And because a total order can LOOK like information it does not carry, the selector emits
 * `tie_groups` and `tiebreak_applied`, and the renderer prints both. A deterministic order
 * that silently reads as a ranking is the same class of error as the filesystem tiebreak,
 * just reproducible.
 *
 * PURITY IS THE POINT
 *
 * `selectSlate()` touches no filesystem and no clock. That is what makes falsifier B — shuffle
 * the input, get byte-identical output — testable at all. Everything impure (reading
 * system/context.md, scanning program YAMLs, walking sprints) lives in the adapter below the
 * fold and is passed IN. Do not reach for `fs` above that line.
 */

require('../lib/preflight');

const fs = require('fs');
const path = require('path');
const { findRepoRoot, findWorkstreamDir, readYAMLFile } = require('../lib/cwos-utils');
const { systemPath } = require('../lib/kit-artifacts');
// Required directly rather than injected: both are pure over the item, and injecting a pure
// function is how a second implementation of it gets to exist.
const { classifySource } = require('../cwos-classify');
const { normalizeRunsOn } = require('../lib/compute-job-spec');

// ─── pure core ─────────────────────────────────────────────────────────────────────

const SATURATED_CLASSES = new Set(['auto-rec', 'engine-finding']);
const NEVER_DAMPED = new Set(['pre-mortem', 'plan-internal', 'conversation', 'spr-followup', 'untagged']);

function round2(n) { return Math.round(n * 100) / 100; }

/**
 * Numeric order key for an item id.
 *
 * `WS-857` -> 857. Anything that does not parse sorts LAST rather than at 0: an id we
 * cannot read is not an id that was filed first, and putting it at the front would be the
 * same undeclared-becomes-zero coercion the priority guard refuses.
 */
function idOrderKey(id) {
  const m = /(\d+)\s*$/.exec(String(id || ''));
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

/**
 * The rank key, as data. Two candidates tie exactly when these three are equal — which is
 * what `tieGroups` reports and what the declared chain then orders.
 */
function rankKey(c) {
  return `${c.adjusted_score}|${c.soft_block_factor}|${c.raw_score}`;
}

/**
 * L1 of the declared chain — path completion — is REFUSED, not computed.
 *
 * Exported as a named constant rather than left out, so the refusal travels with the slate
 * instead of being a silent absence. `sparsity-refuse-or-shrink.md`: the slate is displayed,
 * so it is a comparative claim, so a key it cannot support refuses by name.
 */
const PATH_COMPLETION_UNEXAMINED = Object.freeze({
  level: 'path_completion',
  state: 'unexamined',
  reason: 'requires a per-item route to a value terminal (ev.serves); the queue schema carries none',
  enabled_by: null,
});

/**
 * L2 — capability supply class. Lower sorts first.
 *
 * Unconstrained work (`any`, or an item nobody has labelled) can start wherever the founder
 * is. A capability-pinned item is a CONDITIONAL start: it needs a supplier, and a supplier
 * can be offline — the G16 went to warranty service on 2026-09-03 and took 47 items with it,
 * which is the incident `.claude/rules/machine-affinity.md` was written from.
 */
function supplyClass(runsOn) {
  const v = String(runsOn || '').trim().toLowerCase();
  if (!v || v === 'any') return 0;      // unconstrained — starts anywhere
  if (v === 'light') return 1;          // phone-approvable, still unconstrained in practice
  return 2;                             // compute / browser — needs a named supplier
}

/** L3 — filed date, ascending. Absent sorts LAST, never first: unknown is not oldest. */
function createdKey(c) {
  const v = c && c.created_at ? String(c.created_at) : '';
  return v || '9999-99-99';
}

/**
 * Candidate sort comparator — a TOTAL order over the DECLARED chain.
 *
 * Primary keys (unchanged): adjusted_score, then soft_block_factor — prefer unblocked, so a
 * small unblocked item beats a high-raw-score item soft-blocked at its prerequisite (without
 * it, WS-091 at raw 64 x 0.25 beat WS-315 at raw 16 x 1.0 on the same adjusted 16, anchoring
 * on work that cannot run yet) — then raw_score.
 *
 * Residual chain (WS-857): supply class, then created_at ascending, then id as the stated
 * last resort. `tiebreakLevel` below reports which one actually decided, so the slate can
 * print it rather than implying the order means more than it does.
 */
function candidateRankCmp(a, b) {
  if (b.adjusted_score !== a.adjusted_score) return b.adjusted_score - a.adjusted_score;
  if (b.soft_block_factor !== a.soft_block_factor) return b.soft_block_factor - a.soft_block_factor;
  if (b.raw_score !== a.raw_score) return b.raw_score - a.raw_score;
  const sa = supplyClass(a.runs_on); const sb = supplyClass(b.runs_on);
  if (sa !== sb) return sa - sb;
  const ca = createdKey(a); const cb = createdKey(b);
  if (ca !== cb) return ca < cb ? -1 : 1;
  return idOrderKey(a.id) - idOrderKey(b.id);
}

/** Which level of the chain separated this candidate from the one above it. */
function tiebreakLevel(a, b) {
  if (!b) return null;
  if (b.adjusted_score !== a.adjusted_score) return 'adjusted_score';
  if (b.soft_block_factor !== a.soft_block_factor) return 'soft_block_factor';
  if (b.raw_score !== a.raw_score) return 'raw_score';
  if (supplyClass(a.runs_on) !== supplyClass(b.runs_on)) return 'runs_on-supply';
  if (createdKey(a) !== createdKey(b)) return 'created_at-ascending';
  return 'id-fallback';
}

/**
 * Combined context-boost multiplier for one queue item.
 *
 * Multiplies across every active override whose match clause the item satisfies. Returns
 * { factor, applied: [...] } — `applied` is what the composition notes print, so a boosted
 * anchor can always be traced back to the override block that boosted it rather than looking
 * like an unexplained score.
 */
function contextBoostFor(item, overrides) {
  let factor = 1.0;
  const applied = [];
  for (const ov of overrides || []) {
    const b = ov.boost;
    if (!b || b.invalid) continue;
    let hit = true;
    for (const [field, want] of Object.entries(b.match)) {
      const have = item[field];
      const ok = Array.isArray(have)
        ? have.map(String).includes(String(want))
        : String(have) === String(want);
      if (!ok) { hit = false; break; }
    }
    if (!hit) continue;
    factor *= b.factor;
    applied.push({ override_class: ov.class, factor: b.factor, match: b.match });
  }
  return { factor: round2(factor), applied };
}

/**
 * Consecutive runs of candidates sharing a rank key, in final order.
 *
 * Emitted so a surface can say what the order does NOT mean. Singletons are omitted —
 * a group of one carries no ambiguity to disclose.
 */
function tieGroups(candidates) {
  const groups = [];
  let run = [];
  for (const c of candidates) {
    if (run.length && rankKey(run[0]) === rankKey(c)) { run.push(c); continue; }
    if (run.length > 1) groups.push(run);
    run = [c];
  }
  if (run.length > 1) groups.push(run);
  return groups.map((g) => ({
    rank_key: rankKey(g[0]),
    adjusted_score: g[0].adjusted_score,
    ids: g.map((c) => c.id),
    note: 'order within this group carries NO value information — separated only by the declared residual chain (runs_on supply, then created_at ascending, then id)',
  }));
}

/**
 * THE selector.
 *
 * Pure. Every input is supplied; nothing is read. `resolveGates` is the injected dependency
 * that answers "is this item blocked?" — there is exactly one correct implementation of that
 * question (core/state-store.js `queue.resolveGates`, which is archive-aware and chases
 * `superseded_by`) and injecting it is what stops a caller quietly writing a fourth one.
 *
 * @param {object}   o
 * @param {object[]} o.items            backlog items to rank
 * @param {function} o.resolveGates     (item) => { clear, resolutions, open, unresolvable }
 * @param {object}   [o.programCaps]    { [programId]: { priority_floor, cap_breach_active } }
 * @param {object[]} [o.activeOverrides]
 * @param {Set}      [o.saturated]      source classes currently damped
 * @param {function} [o.classifySource] (item) => sourceClass, when item.source_class is absent
 * @param {function} [o.normalizeRunsOn]
 * @param {boolean}  [o.excludeClaimed] drop items another session holds a lease on. Default
 *                   false to preserve /next's behaviour; TRUE at any call site whose output
 *                   is named "unclaimed", or the key name becomes a false claim.
 * @param {number}   [o.limit]          candidates returned; refusals are NEVER truncated.
 *                   Defaults to Infinity ON PURPOSE: `candidatesInline` feeds the whole
 *                   ranked list to `selectCompanions`, which walks it filtering on the
 *                   anchor's program. A default of 30 here would cut the companion pool from
 *                   ~435 to 29 and silently shrink every sprint — the same class of defect as
 *                   the break-vs-continue bug in selectCompanions, and equally invisible.
 */
function selectSlate({
  items,
  resolveGates,
  programCaps = {},
  activeOverrides = [],
  saturated = new Set(),
  classifySource = null,
  normalizeRunsOn = null,
  excludeClaimed = false,
  limit = Infinity,
} = {}) {
  if (typeof resolveGates !== 'function') {
    throw new Error(
      'selectSlate: resolveGates is required. A slate produced without the dependency gate is '
      + 'the WS-857 defect itself — it shows the founder items that cannot be started.'
    );
  }

  const blockerRefusals = [];
  const priorityRefusals = [];
  const claimRefusals = [];
  const dependencyResolution = { archive_cleared: 0, supersede_cleared: 0, unresolvable_items: 0 };
  const ranked = [];

  for (const item of items || []) {
    // A lease is not a low priority. Where the caller asked for unclaimed work, a held item
    // is withheld AND named, the same discipline the gate and the priority guard use.
    if (excludeClaimed && String(item.claimed_by || '').trim()) {
      claimRefusals.push({ item: item.id, claimed_by: String(item.claimed_by).trim() });
      continue;
    }
    // ── the gate, INSIDE the selector. No caller can render an order without it. ──
    const gates = resolveGates(item);
    for (const r of gates.resolutions || []) {
      if (r.cleared && r.source === 'archive') dependencyResolution.archive_cleared++;
      if (r.cleared && r.chain && r.chain.length > 1) dependencyResolution.supersede_cleared++;
    }
    if (gates.unresolvable && gates.unresolvable.length) {
      dependencyResolution.unresolvable_items++;
      for (const r of gates.unresolvable) {
        blockerRefusals.push({
          item: item.id, blocked_by: r.requested, reason: r.reason, chain: r.chain, detail: r.detail,
        });
      }
    }
    if (!gates.clear) continue;

    const sourceClass = item.source_class || (classifySource ? classifySource(item) : 'untagged');

    // An UNDECLARED priority is not a priority of zero. Coercing it made "nobody scored this"
    // arithmetically identical to "this was scored at the bottom", and the comparator cannot
    // tell them apart -- the WS-291 collapse, in the selector. Refuse BY NAME instead, the
    // WS-590 pattern: the item is withheld and the withholding is audible.
    //
    // Latent, not live, when this was written: 0 of 543 items lacked the field (measured
    // 2026-09-07). It goes live at WS-859, which freezes priority_score out of ranking and puts
    // an EV-typed value in its place -- and an EV terminal that legitimately refuses is exactly
    // the input that would have arrived here as "not a number".
    // See docs/design/personas/operator/agent-queue-consumer.md.
    if (typeof item.priority_score !== 'number' || !Number.isFinite(item.priority_score)) {
      priorityRefusals.push({
        item: item.id,
        found: item.priority_score === undefined ? 'absent' : JSON.stringify(item.priority_score),
      });
      continue;
    }
    const rawDeclared = item.priority_score;

    // WS-350: priority_floor application. Raise rawDeclared to floor when the candidate's
    // program is in cap-breach AND the item's declared score is below floor. Pure additive —
    // items already above floor are unaffected.
    let raw = rawDeclared;
    let priorityFloorApplied = null;
    const progCap = item.program ? programCaps[item.program] : null;
    if (progCap && progCap.cap_breach_active && rawDeclared < progCap.priority_floor) {
      raw = progCap.priority_floor;
      priorityFloorApplied = {
        from: rawDeclared,
        to: progCap.priority_floor,
        reason: `program-${item.program} cap-breach: priority_floor=${progCap.priority_floor} applied`,
      };
    }

    const softBlockFactor = (item.blocked_by_note && String(item.blocked_by_note).length > 0) ? 0.25 : 1.0;
    const sourceDamping = saturated.has(sourceClass) && !NEVER_DAMPED.has(sourceClass) ? 0.7 : 1.0;
    const ctxBoost = contextBoostFor(item, activeOverrides);
    const entry = {
      id: item.id,
      title: item.title || null,
      raw_score: raw,
      adjusted_score: round2(raw * softBlockFactor * sourceDamping * ctxBoost.factor),
      effort: item.effort || null,
      program: item.program || null,
      source_class: sourceClass,
      blocked_by_note: (item.blocked_by_note && String(item.blocked_by_note).length > 0) ? item.blocked_by_note : null,
      soft_block_factor: softBlockFactor,
      source_damping: sourceDamping,
      context_boost: ctxBoost.factor,
      // WS-493: machine affinity + compute-runner readiness. Projected so `/next` and
      // cwos-fleet-compute can ask "the most important item that can actually run" against
      // the SAME ranking the founder sees, rather than a second private ordering.
      runs_on: normalizeRunsOn ? normalizeRunsOn(item.runs_on) : (item.runs_on || null),
      compute_ready: item.compute_ready === true,
      // Carried so a consumer that renders only its own slice can still say the category.
      category: item.category || null,
      status: item.status || null,
      // L3 of the declared residual chain. Carried on the entry so the comparator is a pure
      // function of the candidate — a comparator that reaches back to the source item is a
      // comparator that cannot be tested in isolation.
      created_at: item.created_at || null,
    };
    if (ctxBoost.applied.length) entry.context_boost_applied = ctxBoost.applied;
    if (priorityFloorApplied) entry.priority_floor_applied = priorityFloorApplied;
    ranked.push(entry);
  }

  ranked.sort(candidateRankCmp);
  // Stamp which level of the chain separated each candidate from the one above it. Done
  // after the sort, over the final order, so it reports what actually decided rather than
  // what the comparator would say about an arbitrary pair.
  for (let i = 0; i < ranked.length; i++) {
    ranked[i].tiebreak_applied = tiebreakLevel(ranked[i], i > 0 ? ranked[i - 1] : null);
  }
  const limited = Number.isFinite(limit) ? ranked.slice(0, limit) : ranked;

  return {
    candidates: limited,
    total_considered: (items || []).length,
    total_selectable: ranked.length,
    tie_groups: tieGroups(limited),
    tiebreak_chain: [
      PATH_COMPLETION_UNEXAMINED,
      { level: 'runs_on-supply', state: 'applied', reason: 'unconstrained before capability-pinned' },
      { level: 'created_at-ascending', state: 'applied', reason: 'filed-date, oldest first' },
      { level: 'id-fallback', state: 'applied', reason: 'stated last resort — ids are a per-branch counter that a merge can renumber (id-collisions.yaml)' },
    ],
    gated: true,
    dependency_resolution: dependencyResolution,
    blocker_refusals: blockerRefusals,
    priority_refusals: priorityRefusals,
    claim_refusals: claimRefusals,
    saturated_classes: Array.from(saturated),
  };
}

// ─── refusal emitters — one voice, so a withholding sounds the same everywhere ──────

/**
 * WS-590: an unresolvable gate REFUSES BY NAME.
 *
 * The item is still withheld — a pointer we cannot follow is not a pointer we may assume
 * clear. What changes is that the withholding is audible. The pre-WS-590 behaviour dropped
 * the item from `backlog` with no trace anywhere, so a permanently-closed gate read to the
 * founder as "low priority" rather than as a defect, and ten items sat that way for months
 * until a manual scan found them.
 */
function emitBlockerRefusals(refusals, tag = 'cwos-next') {
  for (const r of refusals || []) {
    process.stderr.write(
      `[${tag}] REFUSED: ${r.item} withheld — blocked_by ${JSON.stringify(r.requested || r.blocked_by)} `
      + `is unresolvable (${r.reason}): ${r.detail}\n`
    );
  }
  if (refusals && refusals.length) {
    const items = Array.from(new Set(refusals.map((r) => r.item)));
    process.stderr.write(
      `[${tag}] REFUSED: ${refusals.length} unresolvable gate(s) across ${items.length} item(s): `
      + `${items.join(', ')}. These items can NEVER be drawn into a sprint until the pointer is fixed.\n`
    );
  }
}

/**
 * A candidate with no numeric priority_score is WITHHELD, and said out loud.
 *
 * Silence would be the worse of the two failures: dropping the item without a trace is how
 * the pre-WS-590 blocker path lost items, and coercing it to 0 is how an undeclared value
 * becomes indistinguishable from a measured one.
 */
function emitPriorityRefusals(refusals, tag = 'cwos-next') {
  for (const r of refusals || []) {
    process.stderr.write(
      `[${tag}] REFUSED: ${r.item} withheld — priority_score is ${r.found}, not a number. `
      + `An undeclared priority is NOT a priority of zero and will not be ranked as one.\n`
    );
  }
  if (refusals && refusals.length) {
    process.stderr.write(
      `[${tag}] REFUSED: ${refusals.length} item(s) carry no usable priority_score: `
      + `${refusals.map((r) => r.item).join(', ')}. Declare one, or they cannot enter a sprint.\n`
    );
  }
}

// ─── impure adapters — everything below this line reads the world ──────────────────

/**
 * Pull `boost: { match: {...}, factor: N }` out of a fenced yaml block.
 *
 * Hand-rolled rather than routed through readYAMLFile because the input is a fragment inside
 * prose, not a file, and the shape is three known keys. Returns null for anything malformed —
 * a boost that cannot be parsed must not silently become 1.0-and-fine, so callers surface
 * `boost_spec_invalid` instead.
 */
function parseBoostSpec(sectionText) {
  const fence = sectionText.match(/```ya?ml\s*\n([\s\S]*?)```/);
  if (!fence) return null;
  const yml = fence[1];
  if (!/^\s*boost:/m.test(yml)) return null;

  const factorM = yml.match(/^\s*factor:\s*([0-9.]+)/m);
  const factor = factorM ? Number(factorM[1]) : NaN;
  if (!Number.isFinite(factor) || factor <= 0) return { invalid: 'factor missing or not a positive number' };

  const matchBlock = yml.match(/^\s*match:\s*\n([\s\S]*?)(?=^\s*factor:|\Z)/m);
  const match = {};
  if (matchBlock) {
    for (const line of matchBlock[1].split('\n')) {
      const kv = line.match(/^\s+([\w_]+):\s*(.+?)\s*$/);
      if (!kv) continue;
      match[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
    }
  }
  if (Object.keys(match).length === 0) return { invalid: 'match block missing or empty' };
  return { match, factor };
}

/** Active override blocks from system/context.md. Never throws. */
function readActiveOverrides(rootDir) {
  try {
    const p = systemPath(rootDir || findRepoRoot(process.cwd()), 'context.md');
    if (!fs.existsSync(p)) return [];
    const txt = fs.readFileSync(p, 'utf8');
    // WS-1016. Both boundaries are matched LINE-ANCHORED. They used to be `indexOf`, so any
    // MENTION of the archived heading — inside the active section's own explanatory prose,
    // inside a fenced block, inside a quoted example — truncated the segment there and every
    // override block below it vanished. Measured 2026-09-11: three well-formed blocks parsed
    // perfectly in isolation and contributed a boost factor of exactly 1.0, with no error, no
    // warning and no missing field, because from the reader's side there were simply no
    // overrides. A sentinel that a document can utter by accident is not a delimiter.
    const activeM = /^## Active overrides\s*$/m.exec(txt);
    if (!activeM) return [];
    const activeIdx = activeM.index;
    const archivedM = /^## Archived overrides\s*$/m.exec(txt.slice(activeIdx));
    const segEnd = archivedM ? activeIdx + archivedM.index : txt.length;
    const segment = txt.slice(activeIdx, segEnd);

    const out = [];
    const re = /^### override_class:\s*([\w-]+)/gm;
    let m;
    const heads = [];
    while ((m = re.exec(segment)) !== null) heads.push({ cls: m[1].trim(), at: m.index });
    for (let i = 0; i < heads.length; i++) {
      const body = segment.slice(heads[i].at, i + 1 < heads.length ? heads[i + 1].at : segment.length);
      out.push({ class: heads[i].cls, boost: parseBoostSpec(body) });
    }
    // An Active section that yields nothing is a CONFIGURED-AND-INERT state, which is the one
    // shape this whole mechanism exists to refuse. Carried as a pseudo-override so
    // overrideWarnings() reports it; it matches nothing and boosts nothing.
    if (out.length === 0) {
      return [{ class: 'section-present-zero-blocks', boost: { invalid: '`## Active overrides` is present but no `### override_class:` block parsed below it — check for a stray `## Archived overrides` line or a malformed heading' } }];
    }
    return out;
  } catch { return []; }
}

/**
 * Warnings for override blocks whose boost spec is present but unusable.
 *
 * A malformed spec must never degrade quietly to "no boost" — that is the exact shape of the
 * defect this whole change exists to remove (a mechanism that looks configured and does
 * nothing). Emitted to stderr AND carried in the payload so both a human and a machine reader
 * can see it.
 */
function overrideWarnings(overrides, tag = 'cwos-next') {
  const out = [];
  for (const ov of overrides || []) {
    if (ov.boost && ov.boost.invalid) {
      out.push(`override_class ${ov.class}: boost spec ignored — ${ov.boost.invalid}`);
    }
  }
  for (const w of out) process.stderr.write(`[${tag}] WARNING: ${w}\n`);
  return out;
}

/**
 * WS-350: {programId -> {priority_floor, cap_breach_active}} by scanning program YAMLs once.
 * Returns {} if the programs directory is absent (graceful for tests and bare repos).
 */
function loadProgramCapsByProgram(wsDirIn) {
  const wsDir = wsDirIn || findWorkstreamDir(process.cwd());
  const programsDir = path.join(wsDir, 'programs');
  if (!fs.existsSync(programsDir)) return {};
  const out = {};
  for (const f of fs.readdirSync(programsDir)) {
    if (!/^prog-.+\.yaml$/.test(f) || f === 'prog-template.yaml') continue;
    const r = readYAMLFile(path.join(programsDir, f));
    if (!r.ok || !r.data || !r.data.id) continue;
    const d = r.data;
    if (d.monitor_only === true) continue;
    const acc = d.accountability && d.accountability.on_finding;
    if (!acc || typeof acc.priority_floor !== 'number') continue;
    out[d.id] = {
      priority_floor: acc.priority_floor,
      cap_breach_active: !!(d.cap_breach && d.cap_breach.active === true),
      max_open_items: typeof acc.max_open_items === 'number' ? acc.max_open_items : null,
    };
  }
  return out;
}

/**
 * Source class of the anchor of each of the last n non-abandoned sprints. Feeds source-class
 * damping (Step 2d) and the fleet-rotation branch.
 */
function getRecentSprintAnchors(store, n) {
  const all = (store && store.sprints && store.sprints.all && store.sprints.all()) || [];
  const ranked = all
    .filter((s) => s && s.status !== 'abandoned')
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  return ranked.slice(0, n).map((s) => ({
    id: s.id,
    program_focus: s.program_focus || null,
    anchor_source_class: s.anchor_source_class || 'untagged',
  }));
}

/** Classes appearing >= 2 times in the last 3 anchors become saturated -> 0.7x damping. */
function saturatedFrom(recentAnchors) {
  const classCounts = {};
  for (const r of recentAnchors || []) {
    classCounts[r.anchor_source_class] = (classCounts[r.anchor_source_class] || 0) + 1;
  }
  const saturated = new Set();
  for (const [cls, n] of Object.entries(classCounts)) {
    if (SATURATED_CLASSES.has(cls) && n >= 2) saturated.add(cls);
  }
  return saturated;
}

/**
 * The store-backed slate. Gathers the impure inputs, then calls the pure selector.
 *
 * `store.queue.byStatus('backlog')` reads MATERIALIZED state (core/state-store.js:632) and
 * deliberately does not fall back to live YAML. A caller mid-reconcile therefore wants
 * `selectSlateFromItems` with the items it already holds, not this.
 */
function selectSlateFromStore(store, opts = {}) {
  const recent = getRecentSprintAnchors(store, 3);
  const activeOverrides = readActiveOverrides(opts.repoRoot);
  const programCaps = loadProgramCapsByProgram(opts.stateDir);
  const slate = selectSlate({
    items: (store.queue.byStatus('backlog') || []),
    resolveGates: (item) => store.queue.resolveGates(item),
    programCaps,
    activeOverrides,
    saturated: saturatedFrom(recent),
    classifySource,
    normalizeRunsOn,
    excludeClaimed: opts.excludeClaimed === true,
    limit: opts.limit,
  });
  slate.last_anchor_classes = recent.map((r) => r.anchor_source_class);
  slate.active_overrides = activeOverrides.map((o) => ({
    class: o.class, boosting: !!(o.boost && !o.boost.invalid),
  }));
  slate.override_warnings = overrideWarnings(activeOverrides, opts.tag);
  slate.breached_programs = Object.keys(programCaps).filter((p) => programCaps[p].cap_breach_active);
  return slate;
}

/**
 * The slate over a plain item array plus a blocker-status lookup.
 *
 * For callers that hold items but no store — `cwos-reconcile.js`, which rebuilds the queue
 * from YAML and must not consult the pre-reconcile materialized snapshot, and
 * `cwos-orchestrate.js`, which reads the flat `queue-index.yaml`. The gate they get is the
 * same gate, built from the same items.
 *
 * Deliberately CONSERVATIVE where state-store's resolver is archive-aware and this one cannot
 * be: an id absent from `items` is `unresolvable`, never cleared. `scripts/queue-stats.mjs`
 * had it the other way round — an absent blocker cleared — which is a third answer to a
 * question that must have one.
 */
function selectSlateFromItems(items, opts = {}) {
  const RESOLVED = new Set(['done', 'completed', 'dismissed', 'superseded']);
  const byId = new Map();
  for (const it of items || []) if (it && it.id) byId.set(String(it.id), it);

  const resolveGates = (item) => {
    const deps = Array.isArray(item && item.blocked_by) ? item.blocked_by : [];
    const resolutions = deps.map((raw) => {
      const id = String(raw || '').trim();
      const b = byId.get(id);
      if (!b) {
        return {
          requested: id, cleared: false, reason: 'blocker-not-found', chain: [id],
          detail: `${id} is not in the item set this slate was built from`,
        };
      }
      const st = String(b.status || '').trim();
      return {
        requested: id, cleared: RESOLVED.has(st), reason: RESOLVED.has(st) ? 'closed' : 'gate-open',
        chain: [id], detail: `${id} is ${st || 'status-less'}`, source: 'live',
      };
    });
    return {
      clear: resolutions.every((r) => r.cleared),
      resolutions,
      open: resolutions.filter((r) => r.reason === 'gate-open'),
      unresolvable: resolutions.filter((r) => r.reason === 'blocker-not-found'),
    };
  };

  // WS-857 closed "one selector" and left "one CONFIGURATION" open, which is the same
  // defect one layer down. Measured 2026-09-11: `/next` (store adapter) ranked WS-858 at
  // adj=117 while `/status` (cwos-orchestrate) and `/session-start` (cwos-reconcile) ranked
  // it 53rd at adj=90 — the SAME function, disagreeing because these two callers passed
  // neither the context overrides nor the program caps and the defaults were `[]` and `{}`.
  // An empty default is indistinguishable from "no overrides are configured", so a founder
  // ruling written into system/context.md moved /next and left both session-opening surfaces
  // untouched, silently.
  //
  // Gathered here rather than in the callers so a third caller cannot reintroduce it by
  // forgetting. An explicitly-passed value still wins, which is what keeps the selector
  // testable — `selectSlate()` itself remains pure and untouched.
  const activeOverrides = opts.activeOverrides || readActiveOverrides(opts.repoRoot);
  const programCaps = opts.programCaps || loadProgramCapsByProgram(opts.stateDir);

  const slate = selectSlate({
    items: (items || []).filter((it) => (opts.statusFilter ? opts.statusFilter(it) : String(it.status) === 'backlog')),
    resolveGates,
    programCaps,
    activeOverrides,
    saturated: opts.saturated || new Set(),
    classifySource,
    normalizeRunsOn,
    excludeClaimed: opts.excludeClaimed === true,
    limit: opts.limit,
  });
  // Carried so `/status` and `/session-start` can say WHY a score moved, exactly as the
  // store-backed slate does. A boost the founder cannot see the name of is a hand-edit.
  slate.active_overrides = activeOverrides.map((o) => ({
    class: o.class, boosting: !!(o.boost && !o.boost.invalid),
  }));
  slate.override_warnings = overrideWarnings(activeOverrides, opts.tag || 'select-slate');
  slate.breached_programs = Object.keys(programCaps).filter((p) => programCaps[p].cap_breach_active);
  return slate;
}

// ─── render ────────────────────────────────────────────────────────────────────────

/**
 * The founder-facing slate. ONE renderer, so every surface says the same thing the same way.
 *
 * The tie disclosure is not decoration. 80.2% of adjacent comparisons are exact ties; a list
 * that prints 1, 2, 3 without saying so is asserting an ordering it does not have.
 */
function renderSlate(slate, opts = {}) {
  const show = opts.limit || slate.candidates.length;
  const rows = slate.candidates.slice(0, show);
  const tieOf = new Map();
  for (const g of slate.tie_groups) for (const id of g.ids) tieOf.set(id, g);

  const lines = [];
  lines.push(`SLATE — ${slate.total_selectable} selectable of ${slate.total_considered} considered  ·  dependency-gated`);
  lines.push('tiebreak chain (declared, and it says what it cannot do):');
  for (const lv of slate.tiebreak_chain || []) {
    const mark = lv.state === 'unexamined' ? 'unexamined' : 'applied   ';
    const tail = lv.enabled_by ? ` → ${lv.enabled_by}` : '';
    lines.push(`  ${mark}  ${lv.level} — ${lv.reason}${tail}`);
  }
  lines.push('');
  let n = 0;
  const seenGroup = new Set();
  for (const c of rows) {
    n++;
    const eff = c.effort ? ` ${String(c.effort).padEnd(2)}` : '   ';
    const runs = c.runs_on ? String(c.runs_on).padEnd(7) : '—      ';
    lines.push(`  ${String(n).padStart(2)}  ${String(c.id).padEnd(7)} ${String(c.adjusted_score).padStart(5)}${eff}  ${runs} ${truncate(c.title, 54)}`);
    const g = tieOf.get(c.id);
    if (g && !seenGroup.has(g.rank_key)) {
      seenGroup.add(g.rank_key);
      const inView = g.ids.filter((id) => rows.some((r) => r.id === id));
      const levels = Array.from(new Set(
        g.ids.map((id) => (rows.find((r) => r.id === id) || {}).tiebreak_applied).filter(Boolean)
      )).filter((l) => l !== 'adjusted_score');
      lines.push(
        `      └ ${inView.length} items tied at ${g.adjusted_score} — their order carries NO value information; `
        + `separated by ${levels.join(', ') || 'nothing'}`
      );
    }
  }
  if (slate.claim_refusals && slate.claim_refusals.length) {
    lines.push('');
    lines.push(`  HELD — ${slate.claim_refusals.length} item(s) under another session's lease: ${slate.claim_refusals.map((r) => `${r.item}(${r.claimed_by})`).join(', ')}`);
  }
  if (slate.blocker_refusals.length) {
    const ids = Array.from(new Set(slate.blocker_refusals.map((r) => r.item)));
    lines.push('');
    lines.push(`  REFUSED — ${ids.length} item(s) held by an unresolvable gate: ${ids.join(', ')}`);
  }
  if (slate.priority_refusals.length) {
    lines.push(`  REFUSED — ${slate.priority_refusals.length} item(s) carry no usable priority_score: ${slate.priority_refusals.map((r) => r.item).join(', ')}`);
  }
  lines.push('');
  return lines.join('\n');
}

function truncate(s, n) {
  const t = String(s || '');
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`;
}

module.exports = {
  // pure
  selectSlate,
  candidateRankCmp,
  tiebreakLevel,
  supplyClass,
  contextBoostFor,
  tieGroups,
  rankKey,
  idOrderKey,
  round2,
  PATH_COMPLETION_UNEXAMINED,
  SATURATED_CLASSES,
  NEVER_DAMPED,
  // emitters
  emitBlockerRefusals,
  emitPriorityRefusals,
  // adapters
  selectSlateFromStore,
  selectSlateFromItems,
  readActiveOverrides,
  parseBoostSpec,
  overrideWarnings,
  loadProgramCapsByProgram,
  getRecentSprintAnchors,
  saturatedFrom,
  // render
  renderSlate,
};
