# Framework Architecture

## CURRENT DIRECTION (2026-01-26)

**Major reorganization in progress.** See `PLAN_ORDERED.md` for full plan.

**Goal**: Make framework evaluable by a theoretical physicist.

**Approach**: Four-layer separation:
- Layer 0: Pure axioms (no physics)
- Layer 1: Mathematical consequences
- Layer 2: Correspondence rules (explicit SM imports)
- Layer 3: Predictions

**Current Phase**: Phase 6 — Fresh Derivations (Phases 1-5 COMPLETE)

---

## Directory Structure

```
/
├── ## Planning (CURRENT PRIORITY)
├── PLAN_ORDERED.md              # Eight-phase reorganization plan
├── REORGANIZATION_PLAN.md       # Detailed rationale
├── divergence_registry.md       # Differences from standard physics (PRESERVE)
│
├── ## Session Management
├── session_log.md               # Work history, decisions, next steps
├── issues_log.md                # Active issues tracking
├── CLAUDE.md                    # AI guidelines and workflow
├── QUICKSTART.md                # Quick reference
│
├── ## Framework Layers (COMPLETE)
├── framework/                   # Clean four-layer structure
│   ├── layer_0_pure_axioms.md   # ✓ CREATED (Phase 1)
│   ├── layer_1_mathematics.md   # ✓ CREATED (Phase 2)
│   ├── layer_2_correspondence.md # ✓ CREATED (Phase 3)
│   ├── layer_3_predictions.md   # ✓ CREATED (Phase 4)
│   └── divergence_analysis.md   # ✓ CREATED (Phase 5)
│
├── ## Core Mathematics (source for Layer 0)
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
│   ├── standard_model_reference.md  # NEW: Comprehensive SM reference
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

| Issue | Area | Gap | Status |
|-------|------|-----|--------|
| I-001 | Intermediate-γ | Recoherence paradox | ✓ RESOLVED (retracted) |
| I-004 | Intermediate-γ | Γ_dec formula | ✓ RESOLVED (form DERIVED) |
| I-005 | Intermediate-γ | h(γ) function | ✓ RESOLVED (DERIVED) |
| I-006 | α derivation | n_EW = 5 numerology | ✓ RESOLVED (replaced by 4²+11²) |
| I-007 | GR limit | g_μν not constructed | ✓ RESOLVED (demoted) |
| I-010 | Layer 0 | Discrete vs continuous V | **OPEN** (MEDIUM) |
| - | QM limit | ℏ, Born rule incomplete | HIGH |
| - | Gauge | Why n=3,2? | MEDIUM |
| - | G derivation | \|Π\| not derived | MEDIUM |

**Major progress (Sessions 9-21)**:
- Γ_dec form derived from asymmetry
- h(γ) derived from interaction capacity
- α = 1/(4² + 11²) with running via spectral dimension reduction
- γ > 0.5 resolved via tendency vs. rate distinction

---

## Design Principles

1. **Atomicity**: One concept per file
2. **Purity**: Math separate from physics
3. **Explicitness**: All dependencies declared
4. **Honesty**: Gaps acknowledged
5. **Falsifiability**: Each physics claim has failure conditions
6. **Minimal elements**: 50-150 lines per module

---

## Reorganization Progress

| Phase | Task | Status |
|-------|------|--------|
| 0 | Reference library | ✓ DONE |
| 1 | Layer 0 (pure axioms) | ✓ DONE |
| 2 | Layer 1 (math consequences) | ✓ DONE |
| 3 | Layer 2 (correspondence) | ✓ DONE |
| 4 | Layer 3 (predictions) | ✓ DONE |
| 5 | Divergence analysis | ✓ DONE |
| 6 | Fresh derivations | ✓ **DONE** (Sessions 18-21) |
| 7 | Physicist summary | **NEXT** |
| 8 | External evaluation | Final |

### Phase 6 Key Results

**Major breakthroughs (Sessions 18-21)**:
- **α = 1/(4² + 11²) = 1/137** — Crystal-defect interface geometry (0.026% accuracy)
- **Running resolved** — Via spectral dimension reduction (mainstream physics)
- **sin²θ_W = 2/9** — Matches on-shell value to 0.3%
- **h(γ) DERIVED** — From interaction capacity / ordered pair counting
- **Γ_dec form DERIVED** — From content asymmetry A(γ) = 2γ - 1

See `physics/alpha_crystal_interface.md` and `framework/phase_6_derivation_attempts.md`

---

*Last updated: 2026-01-26*
*Status: Phases 1-6 COMPLETE, Phase 7 (Physicist Summary) NEXT*
