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

### v3.0 (Session 330, 2026-02-09) — `RED_TEAM_SUMMARY_V3.md`

Updated 3-critic adversarial review covering S258-S327. Top surviving criticisms:

| # | Risk | Severity | Status vs v2.0 |
|---|------|----------|----------------|
| 1 | Derivation vs. discovery | CRITICAL | NARROWED (IRA 10->4, testable predictions) |
| 2 | No human expert validation | HIGH | UNCHANGED (200+ sessions) |
| 3 | Monte Carlo: building blocks not special | HIGH | UNCHANGED |
| 4 | Sub-ppm post-hoc; blind percent-level | MEDIUM-HIGH | PARTIALLY MITIGATED (tree-to-dressed) |
| 5 | CCP axiom may be retrofitted | MEDIUM | PARTIALLY MITIGATED (downstream consequences) |

5 v2.0 criticisms IMPROVED or RESOLVED (Alpha Step 5, triple-formula, catalog, post-hoc, heterogeneity). 3 new criticisms added (DM convenience, IRA semantic, corrections fragility, all MEDIUM or below).

**Updated probability**: 25-40% genuine physics (up from 20-35%). IRA 10->4, 5 conjectures resolved, Yang-Mills CANONICAL, DM mass formula (identity OPEN per S335), tree-to-dressed systematic. Highest-ROI next action: external review via launch + LLM v4.

### v2.0 (Session 257, 2026-02-07) — `RED_TEAM_SUMMARY_V2.md` (historical)
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
