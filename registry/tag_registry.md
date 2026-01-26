# Tag Registry

**Created**: 2026-01-26
**Updated**: 2026-01-26
**Purpose**: Master registry of all permanent tags in the framework

---

## Tag Allocation Scheme

| Range | Type | Prefix | Description |
|-------|------|--------|-------------|
| 0100-01FF | Axioms | AXM | Core axioms (pure perspective) |
| 0200-03FF | Definitions | DEF | Core definitions |
| 0400-05FF | Theorems/Lemmas | THM/LEM | Core theorems and lemmas |
| 0600-07FF | Imports | IMP | Physics imports from SM/observation |
| 0800-09FF | Conjectures | CNJ | Physics conjectures |
| 0A00-0BFF | Derivations | DRV | Physics derivations |
| 0C00-0FFF | Reserved | - | Future expansion |

---

## Active Tags

### Axioms (AXM_01xx)

| Tag | Type | Name | File | Status |
|-----|------|------|------|--------|
| 0100 | AXM | Finiteness | core/axioms/AXM_0100_finiteness.md | CANONICAL |
| 0101 | AXM | Connectivity | core/axioms/AXM_0101_connectivity.md | CANONICAL |
| 0102 | AXM | Non-Triviality | core/axioms/AXM_0102_nontriviality.md | CANONICAL |
| 0103 | AXM | Closure | core/axioms/AXM_0103_closure.md | CANONICAL |
| 0104 | AXM | Partiality | core/axioms/AXM_0104_partiality.md | CANONICAL |
| 0105 | AXM | Locality | core/axioms/AXM_0105_locality.md | CANONICAL |
| 0106 | AXM | Non-Invertibility | core/axioms/AXM_0106_noninvertibility.md | CANONICAL |
| 0107 | AXM | Non-Negative Loss | core/axioms/AXM_0107_nonnegative_loss.md | CANONICAL |
| 0108 | AXM | Time Scale | core/axioms/AXM_0108_time_scale.md | CANONICAL |

### Definitions (DEF_02xx)

| Tag | Type | Name | File | Status |
|-----|------|------|------|--------|
| 0200 | DEF | Notation | core/definitions/DEF_0200_notation.md | CANONICAL |
| 0201 | DEF | Universe Tuple | core/definitions/DEF_0201_universe_tuple.md | CANONICAL |
| 0202 | DEF | Points | core/definitions/DEF_0202_points.md | CANONICAL |
| 0203 | DEF | Simplicial Complex | core/definitions/DEF_0203_simplicial_complex.md | CANONICAL |
| 0204 | DEF | Connectivity Weights | core/definitions/DEF_0204_connectivity_weights.md | CANONICAL |
| 0205 | DEF | Value Space | core/definitions/DEF_0205_value_space.md | CANONICAL |
| 0206 | DEF | Content Map | core/definitions/DEF_0206_content_map.md | CANONICAL |
| 0207 | DEF | Orthonormal Basis | core/definitions/DEF_0207_orthonormal_basis.md | CANONICAL |
| 0210 | DEF | Perspective | core/definitions/DEF_0210_perspective.md | CANONICAL |
| 0211 | DEF | Anchor Point | core/definitions/DEF_0211_anchor_point.md | CANONICAL |
| 0212 | DEF | Direction Set | core/definitions/DEF_0212_direction_set.md | CANONICAL |
| 0213 | DEF | Access Map | core/definitions/DEF_0213_access_map.md | CANONICAL |
| 0214 | DEF | Accessible Content | core/definitions/DEF_0214_accessible_content.md | CANONICAL |
| 0215 | DEF | Hidden Content | core/definitions/DEF_0215_hidden_content.md | CANONICAL |
| 0216 | DEF | Perspective Space | core/definitions/DEF_0216_perspective_space.md | CANONICAL |
| 0220 | DEF | D-Compatible Edges | core/definitions/DEF_0220_dcompatible_edges.md | CANONICAL |
| 0221 | DEF | Propagation Operator | core/definitions/DEF_0221_propagation_operator.md | CANONICAL |
| 0222 | DEF | Receptive Subspace | core/definitions/DEF_0222_receptive_subspace.md | CANONICAL |
| 0223 | DEF | Information Reaching | core/definitions/DEF_0223_information_reaching.md | CANONICAL |
| 0224 | DEF | Access Map Construction | core/definitions/DEF_0224_access_map_construction.md | CANONICAL |
| 0225 | DEF | Adjacency Relation | core/definitions/DEF_0225_adjacency_relation.md | CANONICAL |
| 0226 | DEF | Transition Map | core/definitions/DEF_0226_transition_map.md | CANONICAL |
| 0227 | DEF | Information Loss | core/definitions/DEF_0227_information_loss.md | CANONICAL |
| 0228 | DEF | Information Gain | core/definitions/DEF_0228_information_gain.md | CANONICAL |
| 0230 | DEF | Overlap Parameter | core/definitions/DEF_0230_overlap_parameter.md | CANONICAL |
| 0231 | DEF | Normalized Overlap | core/definitions/DEF_0231_normalized_overlap.md | CANONICAL |
| 0232 | DEF | Overlap Regimes | core/definitions/DEF_0232_overlap_regimes.md | CANONICAL |
| 0233 | DEF | Global Overlap | core/definitions/DEF_0233_global_overlap.md | CANONICAL |
| 0240 | DEF | B-Structure | core/definitions/DEF_0240_bstructure.md | CANONICAL |
| 0241 | DEF | Automorphisms | core/definitions/DEF_0241_automorphisms.md | CANONICAL |
| 0242 | DEF | Subspace Decomposition | core/definitions/DEF_0242_subspace_decomposition.md | CANONICAL |
| 0243 | DEF | Projection Operators | core/definitions/DEF_0243_projection_operators.md | CANONICAL |
| 0244 | DEF | Dimension Counting | core/definitions/DEF_0244_dimension_counting.md | CANONICAL |
| 0250 | DEF | Information Content | core/definitions/DEF_0250_information_content.md | CANONICAL |
| 0251 | DEF | Entropy | core/definitions/DEF_0251_entropy.md | CANONICAL |
| 0252 | DEF | Mutual Information | core/definitions/DEF_0252_mutual_information.md | CANONICAL |
| 0260 | DEF | Temporal Sequence | core/definitions/DEF_0260_temporal_sequence.md | CANONICAL |
| 0261 | DEF | Cumulative Hidden | core/definitions/DEF_0261_cumulative_hidden.md | CANONICAL |
| 0262 | DEF | Termination Conditions | core/definitions/DEF_0262_termination_conditions.md | CANONICAL |
| 0263 | DEF | Boundary States | core/definitions/DEF_0263_boundary_states.md | CANONICAL |
| 0264 | DEF | Trajectory | core/definitions/DEF_0264_trajectory.md | CANONICAL |
| 0265 | DEF | Coherence Measure | core/definitions/DEF_0265_coherence_measure.md | CANONICAL |
| 0266 | DEF | Coherent Trajectory | core/definitions/DEF_0266_coherent_trajectory.md | CANONICAL |
| 0267 | DEF | Object | core/definitions/DEF_0267_object.md | CANONICAL |
| 0270 | DEF | Perspective Space Metric | core/definitions/DEF_0270_perspective_space_metric.md | CANONICAL |
| 0271 | DEF | Measure on Π | core/definitions/DEF_0271_measure_on_pi.md | CANONICAL |
| 0272 | DEF | Perspectival Variance | core/definitions/DEF_0272_perspectival_variance.md | CANONICAL |
| 0280 | DEF | Boundary | core/definitions/DEF_0280_boundary.md | CANONICAL |
| 0285 | DEF | Crystalline | core/definitions/DEF_0285_crystalline.md | CANONICAL |
| 0286 | DEF | Defect | core/definitions/DEF_0286_defect.md | CANONICAL |
| 02A0 | DEF | Asymmetry Measure | core/definitions/DEF_02A0_asymmetry_measure.md | CANONICAL |
| 02A1 | DEF | Decoherence Rate | core/definitions/DEF_02A1_decoherence_rate.md | CANONICAL |

### Lemmas (LEM_04xx)

| Tag | Type | Name | File | Status |
|-----|------|------|------|--------|
| 0400 | LEM | Two Elements | core/lemmas/LEM_0400_two_elements.md | CANONICAL |
| 0401 | LEM | Edges Non-Empty | core/lemmas/LEM_0401_edges_nonempty.md | CANONICAL |
| 0402 | LEM | Basis Decomposition | core/lemmas/LEM_0402_basis_decomposition.md | CANONICAL |

### Theorems (THM_04xx)

| Tag | Type | Name | File | Status |
|-----|------|------|------|--------|
| 0410 | THM | Self-Inaccessibility | core/theorems/THM_0410_self_inaccessibility.md | ACTIVE |
| 0411 | THM | Non-Invertibility | core/theorems/THM_0411_noninvertibility.md | CANONICAL |
| 0412 | THM | Attenuation | core/theorems/THM_0412_attenuation.md | CANONICAL |
| 0413 | THM | Horizon | core/theorems/THM_0413_horizon.md | ACTIVE |
| 0420 | THM | Irreversibility | core/theorems/THM_0420_irreversibility.md | CANONICAL |
| 0421 | THM | Adjacency Graph | core/theorems/THM_0421_adjacency_graph.md | CANONICAL |
| 0430 | THM | Overlap Symmetry | core/theorems/THM_0430_symmetry.md | CANONICAL |
| 0431 | THM | Overlap Bounds | core/theorems/THM_0431_bounds.md | CANONICAL |
| 0432 | THM | Transitivity Bound | core/theorems/THM_0432_transitivity_bound.md | CANONICAL |
| 0440 | THM | Aut Decomposition | core/theorems/THM_0440_aut_decomposition.md | CANONICAL |
| 0441 | THM | Projection Fraction | core/theorems/THM_0441_projection_fraction.md | CANONICAL |
| 0442 | THM | Projection Trace | core/theorems/THM_0442_trace.md | CANONICAL |
| 0450 | THM | Conservation | core/theorems/THM_0450_conservation.md | CANONICAL |
| 0451 | THM | Second Law | core/theorems/THM_0451_second_law.md | CANONICAL |
| 0452 | THM | Information Bounds | core/theorems/THM_0452_bounds.md | CANONICAL |
| 0460 | THM | Hidden Accumulation | core/theorems/THM_0460_hidden_accumulation.md | CANONICAL |
| 0461 | THM | No Loops | core/theorems/THM_0461_no_loops.md | CANONICAL |
| 0470 | THM | Critical Slowing | core/theorems/THM_0470_critical_slowing.md | CANONICAL |
| 0471 | THM | Monotonicity | core/theorems/THM_0471_monotonicity.md | CANONICAL |
| 0480 | THM | Experiential Inertness | core/theorems/THM_0480_experiential_inertness.md | CANONICAL |

### Imports (IMP_06xx)

| Tag | Type | Name | File | Status |
|-----|------|------|------|--------|
| 0600 | IMP | Complex Field | physics/imports/IMP_0600_complex_field.md | CANONICAL |
| 0601 | IMP | Spatial Dimensions | physics/imports/IMP_0601_spatial_dimensions.md | CANONICAL |
| 0602 | IMP | Color Charge | physics/imports/IMP_0602_color_charge.md | CANONICAL |
| 0603 | IMP | Weak Isospin | physics/imports/IMP_0603_weak_isospin.md | CANONICAL |
| 0604 | IMP | EM Dimension | physics/imports/IMP_0604_em_dimension.md | CANONICAL |
| 0605 | IMP | Perspective Count | physics/imports/IMP_0605_perspective_count.md | CANONICAL |
| 0606 | IMP | Planck Time | physics/imports/IMP_0606_planck_time.md | CANONICAL |
| 0607 | IMP | Weinberg Angle | physics/imports/IMP_0607_weinberg_angle.md | ACTIVE |

### Conjectures (CNJ_08xx)

| Tag | Type | Name | File | Status |
|-----|------|------|------|--------|
| 0800 | CNJ | High-γ QM | physics/conjectures/CNJ_0800_high_gamma_qm.md | ACTIVE |
| 0801 | CNJ | Low-γ GR | physics/conjectures/CNJ_0801_low_gamma_gr.md | SPECULATION |
| 0802 | CNJ | Gauge from Aut | physics/conjectures/CNJ_0802_gauge_from_aut.md | ACTIVE |

---

## Statistics

| Category | Count |
|----------|-------|
| Axioms | 9 |
| Definitions | 51 |
| Lemmas | 3 |
| Theorems | 20 |
| Imports | 8 |
| Conjectures | 3 |
| **Total** | **94** |

---

## Next Available Tags

| Range | Next Available |
|-------|----------------|
| Axioms | 0109 |
| Definitions | 02A2 |
| Lemmas | 0403 |
| Theorems | 0481 |
| Imports | 0608 |
| Conjectures | 0803 |
| Derivations | 0A00 |
