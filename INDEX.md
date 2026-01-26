# Perspective Cosmology - Atomic Index

**Generated**: 2026-01-26
**Total Units**: 94

---

## Quick Navigation

- [Axioms](#axioms-9-units) - Foundation of the framework
- [Definitions](#definitions-51-units) - Core mathematical structures
- [Lemmas](#lemmas-3-units) - Simple consequences
- [Theorems](#theorems-20-units) - Major results
- [Imports](#imports-8-units) - Physics from observation/SM
- [Conjectures](#conjectures-3-units) - Unproven claims

---

## Axioms (9 units)

The foundational assumptions of the framework.

| Tag | Name | Key Content |
|-----|------|-------------|
| [AXM_0100](core/axioms/AXM_0100_finiteness.md) | Finiteness | \|P\| < ∞, dim(V) < ∞ |
| [AXM_0101](core/axioms/AXM_0101_connectivity.md) | Connectivity | (P, Σ₁) is connected |
| [AXM_0102](core/axioms/AXM_0102_nontriviality.md) | Non-Triviality | ∃ p,q: C(p) ≠ C(q) |
| [AXM_0103](core/axioms/AXM_0103_closure.md) | Closure | Simplicial closure |
| [AXM_0104](core/axioms/AXM_0104_partiality.md) | Partiality | U_π ⊊ U always |
| [AXM_0105](core/axioms/AXM_0105_locality.md) | Locality | Access via Γ-paths |
| [AXM_0106](core/axioms/AXM_0106_noninvertibility.md) | Non-Invertibility | A not injective |
| [AXM_0107](core/axioms/AXM_0107_nonnegative_loss.md) | Non-Negative Loss | ΔI ≥ 0 (arrow of time) |
| [AXM_0108](core/axioms/AXM_0108_time_scale.md) | Time Scale | ∃ τ₀ > 0 |

---

## Definitions (51 units)

### Universe Structure (DEF_020x)

| Tag | Name | Provides |
|-----|------|----------|
| [DEF_0200](core/definitions/DEF_0200_notation.md) | Notation | Symbolic conventions |
| [DEF_0201](core/definitions/DEF_0201_universe_tuple.md) | Universe Tuple | U = (P, Σ, Γ, C, V, B) |
| [DEF_0202](core/definitions/DEF_0202_points.md) | Points | P |
| [DEF_0203](core/definitions/DEF_0203_simplicial_complex.md) | Simplicial Complex | Σ, Σ_k |
| [DEF_0204](core/definitions/DEF_0204_connectivity_weights.md) | Connectivity Weights | Γ: Σ → [0,1] |
| [DEF_0205](core/definitions/DEF_0205_value_space.md) | Value Space | V |
| [DEF_0206](core/definitions/DEF_0206_content_map.md) | Content Map | C: P → V |
| [DEF_0207](core/definitions/DEF_0207_orthonormal_basis.md) | Orthonormal Basis | B |

### Perspective (DEF_021x)

| Tag | Name | Provides |
|-----|------|----------|
| [DEF_0210](core/definitions/DEF_0210_perspective.md) | Perspective | π = (p, D, A) |
| [DEF_0211](core/definitions/DEF_0211_anchor_point.md) | Anchor Point | p ∈ P |
| [DEF_0212](core/definitions/DEF_0212_direction_set.md) | Direction Set | D ⊂ T_p |
| [DEF_0213](core/definitions/DEF_0213_access_map.md) | Access Map | A: U → U_π |
| [DEF_0214](core/definitions/DEF_0214_accessible_content.md) | Accessible Content | U_π = im(A) |
| [DEF_0215](core/definitions/DEF_0215_hidden_content.md) | Hidden Content | H_π = U \ U_π |
| [DEF_0216](core/definitions/DEF_0216_perspective_space.md) | Perspective Space | Π |

### Propagation (DEF_022x)

| Tag | Name | Provides |
|-----|------|----------|
| [DEF_0220](core/definitions/DEF_0220_dcompatible_edges.md) | D-Compatible Edges | E_D(x) |
| [DEF_0221](core/definitions/DEF_0221_propagation_operator.md) | Propagation Operator | P_D |
| [DEF_0222](core/definitions/DEF_0222_receptive_subspace.md) | Receptive Subspace | V_p, Π_p |
| [DEF_0223](core/definitions/DEF_0223_information_reaching.md) | Information Reaching | I_p |
| [DEF_0224](core/definitions/DEF_0224_access_map_construction.md) | Access Map Construction | A_π formula |

### Adjacency (DEF_022x-028x)

| Tag | Name | Provides |
|-----|------|----------|
| [DEF_0225](core/definitions/DEF_0225_adjacency_relation.md) | Adjacency Relation | ~ |
| [DEF_0226](core/definitions/DEF_0226_transition_map.md) | Transition Map | T₁₂ |
| [DEF_0227](core/definitions/DEF_0227_information_loss.md) | Information Loss | ΔI |
| [DEF_0228](core/definitions/DEF_0228_information_gain.md) | Information Gain | ΔI' |

### Overlap (DEF_023x)

| Tag | Name | Provides |
|-----|------|----------|
| [DEF_0230](core/definitions/DEF_0230_overlap_parameter.md) | Overlap Parameter | γ (Jaccard) |
| [DEF_0231](core/definitions/DEF_0231_normalized_overlap.md) | Normalized Overlap | μ |
| [DEF_0232](core/definitions/DEF_0232_overlap_regimes.md) | Overlap Regimes | High/low γ |
| [DEF_0233](core/definitions/DEF_0233_global_overlap.md) | Global Overlap | γ_global |

### Basis Geometry (DEF_024x)

| Tag | Name | Provides |
|-----|------|----------|
| [DEF_0240](core/definitions/DEF_0240_bstructure.md) | B-Structure | Basis formalization |
| [DEF_0241](core/definitions/DEF_0241_automorphisms.md) | Automorphisms | Aut(B) |
| [DEF_0242](core/definitions/DEF_0242_subspace_decomposition.md) | Subspace Decomposition | B_i, V_i |
| [DEF_0243](core/definitions/DEF_0243_projection_operators.md) | Projection Operators | Π_i |
| [DEF_0244](core/definitions/DEF_0244_dimension_counting.md) | Dimension Counting | n_i |

### Information (DEF_025x)

| Tag | Name | Provides |
|-----|------|----------|
| [DEF_0250](core/definitions/DEF_0250_information_content.md) | Information Content | I_π |
| [DEF_0251](core/definitions/DEF_0251_entropy.md) | Entropy | S_π |
| [DEF_0252](core/definitions/DEF_0252_mutual_information.md) | Mutual Information | I(π₁:π₂) |

### Time (DEF_026x)

| Tag | Name | Provides |
|-----|------|----------|
| [DEF_0260](core/definitions/DEF_0260_temporal_sequence.md) | Temporal Sequence | T |
| [DEF_0261](core/definitions/DEF_0261_cumulative_hidden.md) | Cumulative Hidden | H(T,n) |
| [DEF_0262](core/definitions/DEF_0262_termination_conditions.md) | Termination Conditions | End states |
| [DEF_0263](core/definitions/DEF_0263_boundary_states.md) | Boundary States | Min/max entropy |

### Trajectories (DEF_026x-027x)

| Tag | Name | Provides |
|-----|------|----------|
| [DEF_0264](core/definitions/DEF_0264_trajectory.md) | Trajectory | γ ⊂ P |
| [DEF_0265](core/definitions/DEF_0265_coherence_measure.md) | Coherence Measure | Coh |
| [DEF_0266](core/definitions/DEF_0266_coherent_trajectory.md) | Coherent Trajectory | ξ threshold |
| [DEF_0267](core/definitions/DEF_0267_object.md) | Object | O |

### Perspective Space (DEF_027x)

| Tag | Name | Provides |
|-----|------|----------|
| [DEF_0270](core/definitions/DEF_0270_perspective_space_metric.md) | Metric | d_Π |
| [DEF_0271](core/definitions/DEF_0271_measure_on_pi.md) | Measure | ν |
| [DEF_0272](core/definitions/DEF_0272_perspectival_variance.md) | Variance | Var(U) |

### Topology & Crystallinity (DEF_028x)

| Tag | Name | Provides |
|-----|------|----------|
| [DEF_0280](core/definitions/DEF_0280_boundary.md) | Boundary | ∂U |
| [DEF_0285](core/definitions/DEF_0285_crystalline.md) | Crystalline | Var(U) = 0 |
| [DEF_0286](core/definitions/DEF_0286_defect.md) | Defect | Var(R) > 0 |

### Dynamics (DEF_02Ax)

| Tag | Name | Provides |
|-----|------|----------|
| [DEF_02A0](core/definitions/DEF_02A0_asymmetry_measure.md) | Asymmetry | A(γ) = 2γ-1 |
| [DEF_02A1](core/definitions/DEF_02A1_decoherence_rate.md) | Decoherence Rate | Γ_dec |

---

## Lemmas (3 units)

| Tag | Name | Key Result |
|-----|------|------------|
| [LEM_0400](core/lemmas/LEM_0400_two_elements.md) | Two Elements | \|P\| ≥ 2 |
| [LEM_0401](core/lemmas/LEM_0401_edges_nonempty.md) | Edges Non-Empty | Σ₁ ≠ ∅ |
| [LEM_0402](core/lemmas/LEM_0402_basis_decomposition.md) | Basis Decomposition | C(p) = Σ cᵢ bᵢ |

---

## Theorems (20 units)

### Perspective Theorems (THM_041x)

| Tag | Name | Key Result |
|-----|------|------------|
| [THM_0410](core/theorems/THM_0410_self_inaccessibility.md) | Self-Inaccessibility | p ∉ im(A) |
| [THM_0411](core/theorems/THM_0411_noninvertibility.md) | Non-Invertibility | A not invertible |
| [THM_0412](core/theorems/THM_0412_attenuation.md) | Attenuation | Exponential decay |
| [THM_0413](core/theorems/THM_0413_horizon.md) | Horizon | Truncation scale |

### Adjacency Theorems (THM_042x)

| Tag | Name | Key Result |
|-----|------|------------|
| [THM_0420](core/theorems/THM_0420_irreversibility.md) | Irreversibility | ΔI > 0 → no inverse |
| [THM_0421](core/theorems/THM_0421_adjacency_graph.md) | Adjacency Graph | (Π, ~) directed |

### Overlap Theorems (THM_043x)

| Tag | Name | Key Result |
|-----|------|------------|
| [THM_0430](core/theorems/THM_0430_symmetry.md) | Symmetry | γ symmetric |
| [THM_0431](core/theorems/THM_0431_bounds.md) | Bounds | 0 ≤ γ ≤ 1 |
| [THM_0432](core/theorems/THM_0432_transitivity_bound.md) | Transitivity | Triangle inequality |

### Basis Theorems (THM_044x)

| Tag | Name | Key Result |
|-----|------|------------|
| [THM_0440](core/theorems/THM_0440_aut_decomposition.md) | Aut Decomposition | Product structure |
| [THM_0441](core/theorems/THM_0441_projection_fraction.md) | Projection Fraction | \|\|Π_i(v)\|\|² ≤ 1 |
| [THM_0442](core/theorems/THM_0442_trace.md) | Trace | Tr(Π_i) = n_i |

### Information Theorems (THM_045x)

| Tag | Name | Key Result |
|-----|------|------------|
| [THM_0450](core/theorems/THM_0450_conservation.md) | Conservation | I + S = const |
| [THM_0451](core/theorems/THM_0451_second_law.md) | Second Law | S increases |
| [THM_0452](core/theorems/THM_0452_bounds.md) | Bounds | 0 ≤ I,S ≤ I_total |

### Time Theorems (THM_046x)

| Tag | Name | Key Result |
|-----|------|------------|
| [THM_0460](core/theorems/THM_0460_hidden_accumulation.md) | Hidden Accumulation | H(T,n) ⊆ H(T,n+1) |
| [THM_0461](core/theorems/THM_0461_no_loops.md) | No Loops | Time cannot cycle |

### Dynamics Theorems (THM_047x-048x)

| Tag | Name | Key Result |
|-----|------|------------|
| [THM_0470](core/theorems/THM_0470_critical_slowing.md) | Critical Slowing | Γ_dec = 0 at γ = 0.5 |
| [THM_0471](core/theorems/THM_0471_monotonicity.md) | Monotonicity | dΓ/dγ < 0 |
| [THM_0480](core/theorems/THM_0480_experiential_inertness.md) | Experiential Inertness | Var=0 → inert |

---

## Imports (8 units)

Physics values imported from observation/SM.

| Tag | Name | Value | Classification |
|-----|------|-------|----------------|
| [IMP_0600](physics/imports/IMP_0600_complex_field.md) | Complex Field | 𝔽 = ℂ | ESSENTIAL |
| [IMP_0601](physics/imports/IMP_0601_spatial_dimensions.md) | Spatial Dimensions | n = 3 | ESSENTIAL |
| [IMP_0602](physics/imports/IMP_0602_color_charge.md) | Color Charge | n = 3 | ESSENTIAL |
| [IMP_0603](physics/imports/IMP_0603_weak_isospin.md) | Weak Isospin | n = 2 | ESSENTIAL |
| [IMP_0604](physics/imports/IMP_0604_em_dimension.md) | EM Dimension | n = 1 | ESSENTIAL |
| [IMP_0605](physics/imports/IMP_0605_perspective_count.md) | Perspective Count | ~10^118 | ESSENTIAL |
| [IMP_0606](physics/imports/IMP_0606_planck_time.md) | Planck Time | τ₀ = t_P | CONVENIENT |
| [IMP_0607](physics/imports/IMP_0607_weinberg_angle.md) | Weinberg Angle | sin²θ_W = 3/8 | TESTABLE |

---

## Conjectures (3 units)

Unproven physics claims.

| Tag | Name | Status | Key Claim |
|-----|------|--------|-----------|
| [CNJ_0800](physics/conjectures/CNJ_0800_high_gamma_qm.md) | High-γ QM | ACTIVE | γ→1 gives QM |
| [CNJ_0801](physics/conjectures/CNJ_0801_low_gamma_gr.md) | Low-γ GR | SPECULATION | γ→0 gives GR |
| [CNJ_0802](physics/conjectures/CNJ_0802_gauge_from_aut.md) | Gauge from Aut | ACTIVE | Aut(B) → SM |

---

## Dependency Overview

```
Axioms (AXM_01xx)
    ↓
Definitions (DEF_02xx)
    ↓
Lemmas (LEM_04xx) + Theorems (THM_04xx)
    ↓
Physics Imports (IMP_06xx)
    ↓
Conjectures (CNJ_08xx) + Derivations (DRV_0Axx)
```

---

## Registry

Full tag registry: [registry/tag_registry.md](registry/tag_registry.md)
