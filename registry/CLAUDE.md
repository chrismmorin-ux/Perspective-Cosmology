# Registry Directory

Single source of truth for tracking framework state — claims, proofs, dependencies, and falsification criteria.

## Key Files

| File | Purpose |
|------|---------|
| `ACTIVE_SESSIONS.md` | Parallel session tracking |
| `CLAIM_DEPENDENCIES.md` | What breaks if X changes |
| `FALSIFICATION_REGISTRY.md` | What would disprove claims |
| `EXPLORATION_QUEUE.md` | Central research question lifecycle tracking |
| `FORMALIZATION_QUEUE.md` | Deferred items awaiting formalization |
| `INVESTIGATION_PRIORITIES.md` | Scored investigation queue (from `/quality-engine`) |
| `HALLUCINATION_LOG.md` | Caught LLM errors |
| `PARAMETER_FREEZE.md` | Locked parameters |
| `HYPOTHESIS_TESTING_PROTOCOL.md` | Blind prediction procedures |
| `FORMULA_SEARCH_LOG.md` | Denominator documentation |
| `DEAD_ENDS.md` | Failed approaches |
| `derivations/INDEX.md` | Derived constants (split by domain) |
| `physics_checklist/INDEX.md` | Physics coverage audit (split by phase) |

## Red Team Findings

### v2.0 (Session 257, 2026-02-07) — `RED_TEAM_SUMMARY_V2.md`

Updated 3-critic adversarial review across 135 sessions of development. Top surviving criticisms:

| # | Risk | Severity | Status vs S120 |
|---|------|----------|----------------|
| 1 | Derivation vs. discovery (numerical predictions) | CRITICAL | PARTIALLY MITIGATED |
| 2 | No human expert validation | HIGH | PARTIALLY IMPROVED |
| 3 | Sub-ppm fits post-hoc; blind predictions percent-level | HIGH | NEW |
| 4 | Monte Carlo: building blocks not special | HIGH | NEW |
| 5 | CCP axiom may be retrofitted | MEDIUM-HIGH | NEW |
| 6 | Alpha Step 5 / emergent gauge coupling [A-PHYSICAL] | MEDIUM-HIGH | PARTIALLY RESOLVED |

3 of 8 original S120 criticisms RESOLVED (n_c=11, F=C, CC sign). 3 partially mitigated. 2 unchanged.

**Updated probability**: 20-35% genuine physics (up from 15-30%). LLM Challenge v1 (S128-135): 3/4 SUCCESS. V2 (S257): 15/18 PASS. Structural derivations confirmed reproducible; numerical formulas not independently discovered. Highest-ROI next action: v3 numerical discovery challenge + human expert review.

### v1.0 (Session 120, 2026-01-28) — `RED_TEAM_SUMMARY.md` (historical)

## Frozen Files (Do NOT Read at Startup)

| File | Status |
|------|--------|
| `STATUS_DASHBOARD.md` | Frozen at S142 |
| `RECOMMENDATION_ENGINE.md` | Frozen at S131 — replaced by `INVESTIGATION_PRIORITIES.md` |
| `MASTER_CLAIMS.md` | Deprecated S176 (archived) |

## Cross-Reference Integrity

When updating one, check if others need updating:
`derivations/` ↔ `CLAIM_DEPENDENCIES.md` ↔ `FALSIFICATION_REGISTRY.md`
