# Framework Architecture

## Directory Structure

```
/
├── ## Session Management (READ FIRST)
├── session_log.md               # Work history, decisions, next steps
├── issues_log.md                # Active issues tracking
├── CLAUDE.md                    # AI guidelines and workflow
├── QUICKSTART.md                # Quick reference
│
├── ## Core Mathematics
├── core/                        # Pure mathematics (no physics)
│   ├── 00_notation.md           # Symbols and conventions
│   ├── 01_universe.md           # U = (P, Σ, Γ, C, V, B)
│   ├── 02_perspective.md        # π = (p, D, A)
│   ├── 03_propagation.md        # P_D operator
│   ├── 04_adjacency.md          # π₁ ~ π₂ relation
│   ├── 05_overlap.md            # γ parameter
│   ├── 06_basis_geometry.md     # B-structure, Aut(B)
│   ├── 07_information.md        # Information theory
│   ├── 08_time.md               # Time as path, no-loop theorem
│   ├── 09_trajectory.md         # Trajectories and coherence
│   ├── 10_entropy.md            # Entropy and second law
│   ├── 11_perspective_space.md  # Π structure, metric, measure
│   ├── 12_topology.md           # Shape of U, boundary ∂U
│   ├── 13_crystallinity.md      # Var=0 limit, defects
│   ├── 14_dimensional_stability.md
│   ├── 15_nucleation.md         # Embedding, scenarios
│   ├── 16_eddies.md             # Local order, life
│   ├── 17_theorems.md           # Collected theorems
│   ├── 18_dynamics.md           # Time scale, decoherence rate (NEW 2026-01-26)
│   └── TEMPLATE.md
│
├── ## Physical Interpretations
├── physics/
│   ├── quantum_limit.md         # High-γ → QM
│   ├── gravity_limit.md         # Low-γ → GR
│   ├── intermediate_gamma.md    # γ ≈ 0.5 → quantum gravity
│   ├── intermediate_gamma_analysis.md  # Critical analysis (2026-01-25)
│   ├── limits_analysis.md       # Gap analysis of QM/GR limits
│   ├── predictions_analysis.md  # Are predictions genuine?
│   ├── novelty_assessment.md    # What framework actually contributes (2026-01-26)
│   ├── black_holes.md
│   ├── heat_death.md
│   ├── gauge_structure.md
│   ├── testable_predictions.md  # Predictions from coupling pattern (NEW 2026-01-26)
│   ├── constants/
│   │   ├── coupling_hierarchy_pattern.md  # Main |Π| pattern
│   │   ├── sin2_theta_investigation.md    # Weinberg angle
│   │   ├── gravity_coefficient_investigation.md
│   │   ├── coefficient_investigation.md
│   │   ├── weinberg.md
│   │   ├── newton_G.md
│   │   └── generations.md
│   └── TEMPLATE.md
│
├── ## Reference Documents
├── assumptions_registry.md      # All assumptions (14 tracked)
├── derivations_summary.md       # All derivations with confidence
├── falsification_criteria.md    # What would prove us wrong
├── peer_review_prep.md          # Anticipated objections
├── outstanding_questions.md     # Open problems
├── changelog.md
│
├── ## References
├── references/
│   ├── failed_alpha_derivations.md
│   ├── methodology_research.md
│   └── literature_notes/
│
├── ## Legacy
├── mathematical_framework.md    # [LEGACY - extracted to core/]
│
└── archive/
    └── deprecated/
```

---

## Module Counts

| Category | Count |
|----------|-------|
| Core modules | 18 |
| Physics modules | 11 |
| **Total** | **29** |

---

## Migration Status: COMPLETE

All major sections extracted from legacy file:

- [x] Universe structure (§1)
- [x] Perspective (§1.2)
- [x] Propagation (§1.2.1-2)
- [x] Adjacency/overlap (§2)
- [x] Time (§2.4-5)
- [x] Trajectories (§3)
- [x] Crystallinity (§4)
- [x] Dimensions (§5)
- [x] Entropy (§6)
- [x] No-loop (§7)
- [x] Topology (§8-9)
- [x] Nucleation (§10)
- [x] Theorems (§14)
- [x] Eddies (§15)
- [x] QM limit (§12.1)
- [x] GR limit (§12.2)
- [x] Black holes (§12.3)
- [x] Intermediate-γ (§12.4)
- [x] Heat death (§12.5)
- [x] Constants (§16.4-6)
- [x] Gauge structure (§16.7)

The legacy `mathematical_framework.md` can now be archived.

---

## Confidence Summary

### Core (Pure Math)

| Status | Count | Examples |
|--------|-------|----------|
| AXIOM | 2 | 01_universe, 18_dynamics (D1) |
| DEFINITION | 14 | Most modules |
| THEOREM | 2 | 08_time, 10_entropy |
| PARTIALLY DERIVED | 1 | 18_dynamics (Γ_dec form) |

### Physics (Interpretations)

| Status | Count | Examples |
|--------|-------|----------|
| CONJECTURE | 9 | All limits, constants |
| SPECULATION | 1 | gauge_structure |

---

## Key Gaps Remaining

See `issues_log.md` for detailed tracking. Summary:

| Issue | Area | Gap | Severity |
|-------|------|-----|----------|
| I-001 | Intermediate-γ | Recoherence paradox — **RESOLVED** (claim retracted) | ~~CRITICAL~~ |
| I-007 | GR limit | g_μν not constructed from Γ | HIGH |
| I-004 | Intermediate-γ | Γ_dec formula not derived | HIGH |
| I-005 | Intermediate-γ | h(γ) function not derived | HIGH |
| I-006 | α derivation | n_EW = 5 is numerology | HIGH (accepted) |
| - | QM limit | ℏ, Born rule incomplete | HIGH |
| - | Gauge | Why n=3,2? | MEDIUM |
| - | G derivation | \|Π\| not derived | MEDIUM |

**RESOLVED (2026-01-26)**: I-001 (recoherence paradox) resolved by retracting the claim. Formula valid for γ ≤ 0.5 only. Next blocker: I-004 (derive Γ_dec from axioms).

---

## Design Principles

1. **Atomicity**: One concept per file
2. **Purity**: Math separate from physics
3. **Explicitness**: All dependencies declared
4. **Honesty**: Gaps acknowledged
5. **Falsifiability**: Each physics claim has failure conditions
6. **Minimal elements**: 50-150 lines per module

---

*Last updated: 2026-01-26*
*Status: EXTRACTION COMPLETE, dynamics module added (18_dynamics.md)*
