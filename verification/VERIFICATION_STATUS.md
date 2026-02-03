# Verification Script Status

> **⚠️ RETIRED (Session 144, 2026-01-30)**
>
> This file tracked 189 scripts as of Session 135 but fell 154 scripts behind
> `registry/STATUS_DASHBOARD.md` (which reports 343 scripts at ~90% pass rate).
> Reconciling the gap is not cost-effective.
>
> **Single source of truth**: `registry/STATUS_DASHBOARD.md`
>
> This file is preserved for its **qualitative analysis** (gaps, honest assessment,
> verified-vs-assumed distinctions in the "Detailed Analysis" section below), which
> STATUS_DASHBOARD does not replicate. New script results should be logged in
> STATUS_DASHBOARD only.

**Created**: 2026-01-26 (Stage 1.2)
**Updated**: 2026-01-30 (Session 135 — LCDM deviations, z_* recombination, Born rule)
**Retired**: 2026-01-30 (Session 144 — superseded by STATUS_DASHBOARD)
**Purpose**: ~~Document results from running all verification scripts~~ Historical reference only

---

## Executive Summary (STALE — see STATUS_DASHBOARD)

| Metric | Value | Note |
|--------|-------|------|
| **Total Scripts** | **189** | STATUS_DASHBOARD reports 343 |
| **Pass Rate** | ~85% | STATUS_DASHBOARD reports ~90% |

---

## Script Categories (182 total)

| Category | Count | Key Results |
|----------|-------|-------------|
| **Prime/Attractor** | 25 | Framework prime catalog, sum-of-squares |
| **Koide** | 20 | Lepton + quark Koide (8 new S91-93) |
| **Crystallization** | 18 | Order parameter, Lagrangian, Goldstone |
| **Alpha (α)** | 10 | Enhanced formula, correction terms |
| **Gravity/GR** | 10 | Einstein, graviton, torsion, BH, QG (S102) |
| **Weinberg** | 7 | Tree, prime, running, on-shell |
| **Dark Sector** | 10 | Cosmology, DM mass, 49/9 ratio, signatures |
| **CMB** | 6 | δT/T, n_s, ℓ₁, ℓ₂ |
| **Gauge** | 7 | Division algebra → gauge groups |
| **CKM** | 4 | All 4 parameters |
| **Hubble** | 3 | H₀, tension (13/12), analysis |
| **PMNS** | 4 | Neutrino angles, CP phase |
| **BBN** | 4 | Abundances, Li7, baryon asymmetry |
| **Mass Ratios** | 8 | Quark, proton-electron |
| **Other** | ~56 | Misc verification, experimental |

---

## Recent Scripts (S138c — Coleman-Weinberg)

| Script | Session | Tests | Status |
|--------|---------|-------|--------|
| `coleman_weinberg_so11.py` | S138c | 12/12 | PASS |

**Key findings**:
- Mass spectrum at (4,7) background verified by full 65×65 numerical matrix diagonalization (error < 10⁻¹⁴).
- CW effective potential does NOT pin λ (equivalent to one-loop RG improvement).
- Quartic-only potential selects (5,6), NOT (4,7) — I₄(5,6) = 31/330 < I₄(4,7) = 37/308.
- Cubic invariant Tr(φ³) with w < 0 required for (4,7) selection; selects at η ≈ 3.
- Mass ratio intra-SO(4)/intra-SO(7) = 10 at extremum (exact).
- Goldstone theorem verified: 29 massless modes at u + vI₄ = 0.

## Recent Scripts (S138)

| Script | Session | Tests | Status |
|--------|---------|-------|--------|
| `so11_beta_functions.py` | S138 | 13/13 | PASS |
| `so11_discriminant_proof.py` | S138 | 11/11 | PASS |
| `so11_beta_exact_arithmetic.py` | S138 | 10/10 | PASS |
| `so11_beta_analytic_derivation.py` | S138 | 13/13 | PASS |

**Key findings**:
- All 6 one-loop beta function coefficients for SO(N) symmetric traceless model are analytic functions of N.
- **THEOREM**: Discriminant < 0 for ALL N ≥ 4 (algebraic proof, not just numerical). Polynomial p(N) = -4N⁴-4N³+19N²-72N+432; largest real root ≈ 2.91.
- A₁₃ = (N²+6)/(6N²) and A₂₃ = (2N²+9N-36)/(6N) **ANALYTICALLY DERIVED** from symmetric traceless projector via symbolic trace algebra engine. Also verified by exact rational arithmetic for N=4,5,6,7. Upgraded from [CONJECTURE] to **[THEOREM]**.

## Recent Scripts (S135)

| Script | Session | Tests | Status |
|--------|---------|-------|--------|
| `lcdm_deviations_from_hilltop.py` | S135 | 16/17 | PASS (1 boundary) |
| `z_star_recombination_test.py` | S135 | 4/8 | PARTIAL (HS systematic) |

## Recent Scripts (S134)

| Script | Session | Tests | Status |
|--------|---------|-------|--------|
| `born_rule_from_crystallization.py` | S134 | 12/12 | PASS |
| `peak_height_physics.py` | S134 | 15/15 | PASS |
| `silk_damping_physics.py` | S134 | 13/13 | PASS |
| `mirror_complement_axiom_check.py` | S134 | 8/8 | PASS |

## Recent Scripts (S132)

| Script | Session | Tests | Status |
|--------|---------|-------|--------|
| `crystallization_ordering_SO11.py` | S132 | 15/15 | PASS |
| `stage3_prime_selection_rule.py` | S132 | 9/9 | PASS |
| `quartic_energy_curvature.py` | S132b | 12/12 | PASS |
| `denominator_polynomial_unification.py` | S132b | 21/21 | PASS |
| `intra_stage_ordering.py` | S132b | 12/12 | PASS |
| `c3_sign_from_stability.py` | S132b | 12/12 | PASS |
| `goldstone_denominator_identity.py` | S132b | 16/16 | PASS |
| `denominator_spacing_and_barriers.py` | S132b | 15/15 | PASS |
| `ssb_critical_ratio.py` | S132b | 11/11 | PASS |

---

## Recent Scripts (S98-S104)

| Script | Session | Tests | Status |
|--------|---------|-------|--------|
| `cmb_observables_crystallization.py` | S98 | 7/7 | PASS |
| `bbn_crystallization_precision.py` | S99 | 9/9 | PASS |
| `lithium7_crystallization.py` | S100 | 8/8 | PASS |
| `crystallization_order_parameter.py` | S100 | 6/6 | PASS |
| `spacetime_emergence_from_goldstone.py` | S101 | 8/8 | PASS |
| `crystallization_lagrangian.py` | S101 | 8/8 | PASS |
| `hubble_constant_derivation.py` | S101b | 8/8 | PASS |
| `baryon_asymmetry_best_formula.py` | S101c | 7/7 | PASS |
| `hubble_tension_analysis.py` | S101d | 6/6 | PASS |
| `coset_sigma_model_lorentz.py` | S102 | 8/8 | PASS |
| `einstein_from_crystallization.py` | S102 | 8/8 | PASS |
| `graviton_from_goldstone.py` | S102 | 8/8 | PASS |
| `scalar_graviton_mode.py` | S102 | 8/8 | PASS |
| `higher_curvature_corrections.py` | S102 | 8/8 | PASS |
| `torsion_from_crystallization.py` | S102 | 8/8 | PASS |
| `black_hole_information.py` | S102 | 8/8 | PASS |
| `quantum_gravity_unitarity.py` | S102 | 8/8 | PASS |
| `experimental_signatures.py` | S103 | 8/8 | PASS |
| `omega_b_refinement.py` | S104 | 8/8 | PASS |
| `cosmic_denominator_29.py` | S104 | 10/10 | PASS |
| `dark_matter_phenomenology.py` | S105d | 12/12 | PASS |
| `running_couplings_beta_identities.py` | S105a | 8/8 | PASS |

---

## Priority Script Results (User-Specified)

| Script | Claims to Verify | Result | Critical Notes |
|--------|------------------|--------|----------------|
| `weinberg_angle_running.py` | sin²θ_W = 1/4 at ~188 TeV | **PASS** | Correctly calculates SM running. Does NOT verify the g² ∝ Im assumption. |
| `associativity_requirement.py` | n_d = 4 from associativity | **PARTIAL** | Path independence → associativity is STRONG. Gap: division algebra structure not proven from axioms. |
| `gauge_dimension_rank_analysis.py` | dim(G_SM) = 12, rank = 4 | **PASS** | All 5 key formulas verified: dim = n_d(n_d-1) = 12, rank = n_d = 4. |
| `hypercharge_derivation.py` | All 5 Y values from Im(H) = 3 | **PASS** | All 5 hypercharges match SM. Anomalies cancel. Uniqueness verified (1 solution). |
| `chirality_quaternion_analysis.py` | Left-handed from T1 | **PASS** | Clean derivation chain presentation. Correctly identifies gaps. |
| `octonion_su3_decomposition.py` | O + F=C → SU(3) | **PASS** | G₂/SU(3) = S⁶ correctly computed. Resolves 7 vs 8 mismatch (12-11=1 explained). |
| `rank4_gauge_enumeration.py` | SM is minimal rank-4 group | **PASS** | SM among minimum-dimension (12) rank-4 groups. Division algebras select SM over SU(2)⁴. |
| `chirality_spacetime_gauge_unification.py` | Weak SU(2) = spacetime su(2)_L | **PASS** | Self-identifies key gap: explicit T1 → chirality mechanism missing. Derivation chain correct. |

---

## Detailed Analysis

### Scripts That PROVE Their Claims

| Script | What's Actually Proven |
|--------|----------------------|
| `gauge_dimension_rank_analysis.py` | Mathematical identity: dim(G_SM) = 12 = 4 × 3, rank = 4 |
| `octonion_su3_decomposition.py` | G₂/SU(3) = S⁶, dim(SU(3)) = 8 |

### Scripts That CALCULATE But Don't Prove

| Script | What's Calculated | What Would Constitute Proof |
|--------|------------------|---------------------------|
| `weinberg_angle_running.py` | SM running hits 0.25 at 188 TeV | Need derivation of g² ∝ Im |
| `alpha_137_verification_clean.py` | 4² + 11² = 137 | Need derivation of n_d = 4, n_c = 11 from axioms |
| `hypercharge_derivation.py` | Y values from B = 1/3 | Need derivation of B = 1/3 |

### Scripts That Acknowledge Their Gaps

| Script | Self-Identified Gap |
|--------|-------------------|
| `associativity_requirement.py` | "Division algebra structure is the GAP in the argument" |
| `chirality_quaternion_analysis.py` | "The key gap: showing explicitly how T1 selects chirality" |
| `chirality_spacetime_gauge_unification.py` | "Weak SU(2) = spacetime su(2)_L" marked [CONJECTURE] |

---

## Verification vs Derivation

**Key distinction the scripts correctly make:**

| Status | Meaning | Example |
|--------|---------|---------|
| VERIFIED | Numerical calculation confirmed | 16 + 121 = 137 |
| DERIVED | Follows from stated assumptions | SU(3) from O + F=C |
| ASSUMED | Required input not derived | n_d = 4, B = 1/3 |
| GAP | Missing logical step acknowledged | Division algebra structure |

---

## Honest State Summary

### What's Solid
- **Mathematical identities**: Dimensional formulas, Grassmannian structure, Hurwitz theorem
- **Group theory**: G₂/SU(3) = S⁶, unit quaternions ≅ SU(2), etc.
- **Running calculation**: SM RG equations correctly applied

### What's Assumed (Inputs)
- n_d = 4 (derived only IF division algebra structure accepted)
- n_c = 11 (follows from n_d = 4)
- g² ∝ Im(algebra) scaling for Weinberg angle
- B = 1/3 from color counting for hypercharge

### What Needs Work
- ~~**Division algebra gap**: Why must transitions form division algebras?~~ **PARTIALLY RESOLVED (S54)**: No-zero-divisors derived from perspective definition. Remaining gap: invertibility.
- **Coupling scaling**: Why g² ∝ Im dimensions?
- **Chirality mechanism**: Explicit T1 → left-handed selection

### Session 54 Update

The "no zero divisors" property (critical for division algebra structure) is now **DERIVED** from the perspective definition:
- A perspective necessarily has dim(V_π) ≥ 1 ("you can't see a subset of zero")
- Transitions preserve perspective-hood
- Therefore T₁ ∘ T₂ ≠ 0

See: `framework/investigations/perspective_foundations_and_zero_divisors.md`

---

## Cross-Reference to Audit

The verification scripts CONFIRM the audit findings:

| Audit Step | Script Confirmation |
|------------|-------------------|
| Step 4 (division algebra) = ASSUMED | `associativity_requirement.py` explicitly calls this a GAP |
| Step 9 (coupling scaling) = ASSUMED | `weinberg_angle_running.py` calculates but doesn't derive |
| Step 10 (B = 1/3) = ASSUMED | `hypercharge_derivation.py` uses B = 1/3 as input |
| Step 11 (chirality) = ARGUED | `chirality_*.py` mark mechanism as CONJECTURE |

---

## Recommendation for External Presentation

**Do present:**
- The mathematical structure (division algebras, gauge groups)
- The numerical matches (α = 137, sin²θ_W = 0.25 at 188 TeV)
- The honest gap acknowledgment

**Don't claim:**
- "Derived from T1 alone" — requires division algebra assumption
- "Predicted hypercharges" — requires B = 1/3 input
- "Explains chirality" — mechanism is conjectural

---

---

## Complete Script Inventory (All 43 Scripts)

### Category: Gauge Groups & Division Algebras

| Script | Purpose | Result | Notes |
|--------|---------|--------|-------|
| `gauge_groups_derivation.py` | Verify division algebra → gauge group mapping | **PASS** | Hurwitz theorem verified. C→U(1), H→SU(2), O→SU(3) dimensions correct. |
| `gauge_dimension_rank_analysis.py` | Verify dim(G_SM) = 12, rank = 4 | **PASS** | All 5 formulas verified. |
| `rank4_gauge_enumeration.py` | Enumerate all rank-4 gauge groups | **PASS** | SM among minimal-dimension rank-4 groups. |
| `octonion_su3_decomposition.py` | Explain Im(O) = 7 but dim(SU(3)) = 8 | **PASS** | F=C on O gives O = C + C³, stabilizer = SU(3). |
| `division_algebra_connection.py` | Explore 15 = 4 + 11 = 1+2+4+8 | **PASS** | Multiple decompositions documented. |
| `dimension_constraints.py` | Why n₁=4 and n₂=11 are special | **PASS** | 137 = 4² + 11² is unique (Fermat). |
| `associativity_requirement.py` | n_d = 4 from associativity | **PARTIAL** | Gap: division algebra axiom not proven. |
| `grassmannian_55_connection.py` | Verify Gr(k,n) + SO(k) + SO(n-k) = C(n,2) | **PASS** | Identity verified for all (k,n) pairs. |

### Category: Alpha (α = 1/137) Calculations

| Script | Purpose | Result | Notes |
|--------|---------|--------|-------|
| `alpha_137_comprehensive_verification.py` | Full verification of α = 1/(4² + 11²) | **PASS** | 0.026% error. Grassmannian identity verified. |
| `alpha_137_verification_clean.py` | Clean version of α verification | **PASS** | Same results, cleaner format. |
| `alpha_running_test.py` | Test if α = 1/(n² + 121) explains running | **PARTIAL** | **FAILS at GUT scale**. Would need n² < 0. |
| `alpha_crystal_interface.py` | Verify α from crystal-defect interface | **PASS** | 0.026% error at IR. |
| `tilt_alpha_connection.py` | Connect tilt matrices to α | **PASS** | Hermitian: n_d² + n_c² = 137. Real symmetric gives 76. |
| `example_sin2theta.py` | Test sin²θ_W = 2/(2+3)² | **FAIL** | Formula gives 0.08, measured = 0.231. **65% error - WRONG!** |

### Category: Chirality & Spacetime

| Script | Purpose | Result | Notes |
|--------|---------|--------|-------|
| `chirality_quaternion_analysis.py` | Analyze H → chirality connection | **PASS** | Conceptual framework correct. |
| `chirality_spacetime_gauge_unification.py` | Test spacetime-gauge unification | **PASS** | Derivation chain correct. Gap acknowledged. |
| `fermion_visibility_analysis.py` | Explain why fermions mostly visible | **PASS** | Spin-statistics argument presented. |

### Category: Hypercharge & SM Structure

| Script | Purpose | Result | Notes |
|--------|---------|--------|-------|
| `hypercharge_derivation.py` | Derive all 5 hypercharges | **PASS** | All match SM. Anomalies cancel. Unique solution. |
| `weinberg_angle_running.py` | Test sin²θ_W = 1/4 & running | **PASS** | Framework predicts 1/4 at ~188 TeV. |
| `gauge_group_from_tilts.py` | Derive 12 gauge bosons | **PARTIAL** | Multiple formulas give 12. No single derivation compelling. |

### Category: Field Content & Channels

| Script | Purpose | Result | Notes |
|--------|---------|--------|-------|
| `field_type_counting.py` | Count field types from B-structure | **PASS** | Pair counting: 6 + 21 + 28 = 55 verified. |
| `bsm_field_bounds_test.py` | Test BSM models against bounds | **PARTIAL** | **MSSM and E6 GUT VIOLATE bounds!** |
| `comparison_channel_running.py` | Analyze channel running | **PASS** | Three-type decomposition verified. |
| `equal_weighting_derivation.py` | Derive equal weighting from Killing form | **PASS** | Lie algebra invariance argument. |
| `independent_sectors_derivation.py` | Explain n₁² + n₂² not (n₁+n₂)² | **PASS** | Independent structures → no cross terms. |
| `interface_state_counting.py` | Explain 137 interface states | **PASS** | u(4) + u(11) = 137 generators. |
| `orthogonality_field_emergence.py` | Connect overlap γ to field types | **PASS** | Conceptual framework presented. |
| `weight_vs_dimension_running.py` | Compare mechanisms for α running | **PARTIAL** | Weight variation fits anything - no predictive power. |

### Category: Cosmology & Dark Sector

| Script | Purpose | Result | Notes |
|--------|---------|--------|-------|
| `dark_sections_pi_formula.py` | Verify \|Π\| = 137⁵⁵ | **PASS** | log₁₀(\|Π\|) = 117.52 vs ~118 (0.4% error). |
| `pi_from_alpha_and_crystal.py` | Derive \|Π\| from α and n_c | **PASS** | 137⁵⁵ ~ 10^117.5 vs 10^118. |
| `pi_derivation_mathematics.py` | Mathematical structures for \|Π\| | **PASS** | K₁₁ has 55 edges. GL(n,q) parallel. |
| `cosmological_constant_connection.py` | Connect Λ to framework | **PARTIAL** | 10^117.5 vs 10^122 needed. **Gap of ~10⁴**. |
| `dark_sector_mapping.py` | Map 79 hidden channels | **PASS** | Hidden vectors: 49 = SU(7)×U(1). Speculative. |
| `observable_fraction_analysis.py` | Analyze 79/137 ≈ 1/√3 | **PASS** | 79/137 vs 1/√3: only **0.12% difference!** |

### Category: Mathematical Explorations

| Script | Purpose | Result | Notes |
|--------|---------|--------|-------|
| `squarefree_point_correspondence.py` | Test squarefree ↔ binary signature | **PASS** | φ is homomorphism. Density ~6/π². |
| `perspective_prime_emergence.py` | Investigate prime emergence | **PASS** | Without multiplication, irreducible = basis vector. |
| `half_dimension_investigation.py` | Investigate "half dimension" | **PASS** | Re(s)=1/2 from deeper spectral analysis. |
| `multiplication_from_perspective.py` | Perspective combination = multiplication? | **PASS** | Works for squarefree. Powers need iteration. |
| `continuous_visibility_model.py` | Test α depends only on sum(v) | **PASS** | α depends ONLY on sum, not distribution. |
| `perspective_mutation_analysis.py` | Analyze mutation conservation | **PASS** | dim(Lost) = dim(Gained) verified. |
| `tetrahedral_connection.py` | Analyze 79/137 ≈ sin(θ_tet) | **PASS** | θ = 35.21° vs 35.26° (0.05° difference). |
| `rg_flow_selection.py` | Does RG flow explain selection? | **FAIL** | No mechanism for 58/137 derived. |

---

## Critical Findings

### Verified Claims (High Confidence)

1. ✓ **dim(G_SM) = 12 = n_d(n_d - 1)**
2. ✓ **rank(G_SM) = 4 = n_d**
3. ✓ **1/α = 137 = 4² + 11² (at IR)** — 0.026% error
4. ✓ **All 5 hypercharges from Im(H) = 3**
5. ✓ **SU(3) from O with F=C, stabilizer in G₂**
6. ✓ **\|Π\| = 137⁵⁵ ≈ 10^118** — 0.4% error in log scale
7. ✓ **Gr(4,11) + SO(4) + SO(7) = 55 = C(11,2)**
8. ✓ **79/137 ≈ 1/√3** — 0.12% error

### Falsified/Failed Claims

1. ✗ **sin²θ_W = 2/25 formula** — 65% error, clearly WRONG
2. ✗ **58/137 selection mechanism** — no derivation found
3. ✗ **α running at GUT scale** — formula breaks down

### Problematic for BSM

- **MSSM violates scalar bound** (49 > 15)
- **E6 GUT violates all bounds** (S, V, F all exceed)

---

**Verification completed by**: Claude (Stage 1.2)
**All scripts run**: 2026-01-27
