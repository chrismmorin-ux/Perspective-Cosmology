# Registry Directory

Single source of truth for tracking framework state — claims, proofs, dependencies, and falsification criteria.

## Key Files

| File | Purpose |
|------|---------|
| `ACTIVE_SESSIONS.md` | Parallel session tracking |
| `CLAIM_DEPENDENCIES.md` | What breaks if X changes |
| `FALSIFICATION_REGISTRY.md` | What would disprove claims |
| `FORMALIZATION_QUEUE.md` | Deferred items awaiting formalization |
| `INVESTIGATION_PRIORITIES.md` | Scored investigation queue (from `/quality-engine`) |
| `HALLUCINATION_LOG.md` | Caught LLM errors |
| `PARAMETER_FREEZE.md` | Locked parameters |
| `HYPOTHESIS_TESTING_PROTOCOL.md` | Blind prediction procedures |
| `FORMULA_SEARCH_LOG.md` | Denominator documentation |
| `DEAD_ENDS.md` | Failed approaches |
| `derivations/INDEX.md` | Derived constants (split by domain) |
| `physics_checklist/INDEX.md` | Physics coverage audit (split by phase) |

## Red Team Findings (Session 120)

A three-agent adversarial review identified these surviving criticisms:

| Risk | Status | Mitigation |
|------|--------|------------|
| Post-hoc interpretation | ACKNOWLEDGED | `INTERPRETATION_AUDIT.md` |
| Cannot distinguish derivation from discovery | CORE ISSUE | LLM Derivation Challenge |
| Formula structure unpredictable | ACKNOWLEDGED | Need structure taxonomy |
| Phi_6 cyclotomic not derived | HIGH PRIORITY | Research task |
| n_c = 11 derivation weak | PARTIALLY RESOLVED | S193-194 (CD Closure + triality) |
| Reproducibility not demonstrated | IN PROGRESS | LLM challenge + expert outreach |

**Probability estimates** (from critics): 15-30% genuine physics. Would improve with: blind prediction verified, complete dynamics calculation, LLM Challenge success.

## Frozen Files (Do NOT Read at Startup)

| File | Status |
|------|--------|
| `STATUS_DASHBOARD.md` | Frozen at S142 |
| `RECOMMENDATION_ENGINE.md` | Frozen at S131 — replaced by `INVESTIGATION_PRIORITIES.md` |
| `MASTER_CLAIMS.md` | Deprecated S176 (archived) |

## Cross-Reference Integrity

When updating one, check if others need updating:
`derivations/` ↔ `CLAIM_DEPENDENCIES.md` ↔ `FALSIFICATION_REGISTRY.md`
