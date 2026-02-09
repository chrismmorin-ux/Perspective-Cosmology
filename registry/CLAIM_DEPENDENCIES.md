# Claim Dependencies

**Created**: 2026-01-27
**Rewritten**: 2026-01-30 (Session 144 — canonical naming, Issue 5.2)
**Updated**: 2026-02-07 (Session 301 — S189-S299 propagation: AXM_0120, CONJ resolutions, Yang-Mills, IRA inventory)
**Purpose**: Map every claim to its dependencies (axioms, prior claims, verification scripts)

---

## Why This Exists

When an assumption changes or is falsified, we need to know IMMEDIATELY which claims break. This document provides that dependency graph.

---

## Naming Convention

All references use the canonical `core/` numbering system:

| Prefix | Range | Example |
|--------|-------|---------|
| AXM | 0100-0118 | AXM_0100 (Finiteness) |
| DEF | 0200-02C4 | DEF_0210 (Inner product) |
| THM | 0410-04A1 | THM_0484 (Division algebra structure) |
| [I-MATH] | — | Standard mathematical fact (Frobenius, Hurwitz, etc.) |
| [A-IMPORT] | — | From Standard Model or observation |

---

## Core Axioms (Layer 0)

### AXM_0100: Finiteness
**Depends on**: Nothing (foundational)
**Used by**: All counting arguments, |Π| finite, THM_0450 (Conservation)

### AXM_0101: Connectivity
**Depends on**: Nothing (foundational)
**Used by**: Graph structure of U, THM_0421 (Adjacency graph)
**Note**: Session 132 noted this MAY be derivable from crystal axioms; under review.

### AXM_0102: Nontriviality
**Depends on**: Nothing (foundational)
**Used by**: THM_0482 (No zero divisors) — perspectives have dim(V_π) ≥ 1

### AXM_0103: Closure
**Depends on**: Nothing (foundational)
**Used by**: Adjacency structure, THM_0413 (Horizon)

### AXM_0104: Partiality
**Depends on**: Nothing (foundational)
**Used by**: Defect existence, hidden sector, dark matter structure

### AXM_0105: Locality
**Depends on**: Nothing (foundational)
**Used by**: Spatial structure emergence

### AXM_0106: Non-invertibility of access
**Depends on**: Nothing (foundational)
**Used by**: THM_0411 (Non-invertibility), THM_0420 (Irreversibility)
**Note**: THM_0411 may derive a related but distinct statement.

### AXM_0109: Crystal existence
**Depends on**: Nothing (foundational)
**Used by**: All crystal-dependent theorems, DEF_02A3 (Tilt matrix)

### AXM_0110: Perfect orthogonality
**Depends on**: AXM_0109
**Used by**: DEF_02A3 (Tilt matrix), crystallization dynamics

### AXM_0113: Finite access
**Depends on**: AXM_0102
**Used by**: dim(V_π) < ∞, Hilbert space structure

### AXM_0114: Tilt possibility
**Depends on**: AXM_0109, AXM_0110
**Used by**: Crystallization dynamics, gravity emergence

### AXM_0115: Algebraic completeness (T0)
**Depends on**: DEF_0226 (Transition map)
**Used by**: THM_0483 (Invertibility), THM_0484 (Division algebra structure)

### AXM_0116: Crystal timelessness (T1)
**Depends on**: AXM_0109
**Used by**: THM_0485 (F = C), chirality selection, directed time

### AXM_0117: Crystallization tendency
**Depends on**: AXM_0114
**Used by**: SO(11) breaking chain, inflationary dynamics, second law

### AXM_0118: Prime attractor selection
**Depends on**: AXM_0117
**Used by**: α = 137 selection, framework prime structure, all numerical predictions
**Note**: Session 140 audit flagged — n_c = 11 derivation should be extracted to a theorem.

### AXM_0120: Completeness Principle (CCP)
**Depends on**: AXM_0100, AXM_0109 (foundational)
**Statement**: Perfection = maximal consistency. The Crystal contains all possible structure consistent with its axioms.
**Used by**: n_c = 11, n_d = 4, F = C (all now DERIVED from CCP). SM gauge group pipeline. Generation count = 3.
**Verification**: `completeness_principle_verification.py` [PASS]
**Status**: CANONICAL (S251, S264)
**Note**: Most impactful axiom — forces nearly all structural choices. See `core/axioms/AXM_0120_completeness_principle.md`.

---

## Structural Theorems

### THM_0482: No Zero Divisors
**Statement**: T₁ ∘ T₂ ≠ 0 for non-zero transitions
**Depends on**: AXM_0102 (Nontriviality) — dim(V_π) ≥ 1
**Used by**: THM_0484 (Division algebra structure)
**Verification**: `perspective_foundations_and_zero_divisors.md`
**Status**: CANONICAL

### THM_0483: Transition Invertibility
**Statement**: Every transition T has inverse T⁻¹
**Depends on**: AXM_0115 (Algebraic completeness), adjacency symmetry
**Used by**: THM_0484 (Division algebra structure)
**Verification**: `invertibility_investigation.md`
**Status**: CANONICAL

### THM_0484: Division Algebra Structure
**Statement**: Transitions form a division algebra over F
**Depends on**: THM_0482 + THM_0483 + [I-MATH: Frobenius theorem]
**Used by**: n_d ≤ 4, n_c = 11, gauge groups, ALL numerical predictions
**Verification**: `division_algebra_gap_analysis.py` [PASS]
**Status**: CANONICAL

### THM_0485: Complex Structure (F = C)
**Statement**: The field must be C (complex numbers)
**Depends on**: AXM_0116 (Crystal timelessness / directed time)
**Used by**: U(n) groups, fermion antisymmetry, QM phase, chirality
**Status**: CANONICAL

### THM_0486: Mirror Spacetime
**Statement**: Complement universe has reversed time orientation
**Depends on**: AXM_0100, AXM_0101, AXM_0104, AXM_0109, AXM_0110, AXM_0116
**Status**: SKETCH

### THM_0487: SO(11) Crystallization Breaking Chain
**Statement**: SO(11) → SO(4)×SO(7) → SO(4)×G₂ → SO(4)×SU(3) is the unique chain compatible with division algebra structure. 41 total Goldstone modes (28+7+6).
**Depends on**: THM_0484 (Division algebra), [I-MATH: Frobenius]
**Used by**: THM_0488, THM_0489, THM_0498, Goldstone counting, inflationary dynamics
**Verification**: `crystallization_ordering_SO11.py` [15/15 PASS]
**Status**: DERIVATION

### THM_0488: Denominator Polynomial Unification
**Statement**: All 14 framework denominators are polynomials in n_c with coefficients from D_framework.
**Depends on**: DEF_02C1, THM_0487, [I-MATH: polynomial arithmetic]
**Used by**: THM_0489, alpha derivations
**Verification**: `denominator_polynomial_unification.py` [21/21 PASS]
**Status**: SKETCH

### THM_0489: Goldstone-Denominator Identity
**Statement**: 194 - 153 = 41 (electroweak denominator minus proton factor = total Goldstones)
**Depends on**: THM_0487, [I-MATH: Goldstone theorem], DEF_02C1
**Status**: SKETCH

### THM_0491: Hilbert Space Structure
**Statement**: V_π is automatically a finite-dimensional Hilbert space over C.
**Depends on**: AXM_0109, AXM_0110, AXM_0113, THM_0485 (F=C)
**Used by**: THM_0493, THM_0494, all quantum mechanics derivations
**Verification**: `hilbert_unitary_chain.py` [18/18 PASS]
**Status**: CANONICAL

### THM_0493: Linear Unitary Evolution
**Statement**: Content conservation + Stone's theorem → T(s) = exp(-isH), H Hermitian.
**Depends on**: THM_0491, AXM_0115 (Algebraic completeness), [I-MATH: Stone's theorem]
**Used by**: THM_0494, quantum mechanics foundations
**Verification**: `hilbert_unitary_chain.py` [18/18 PASS]
**Status**: DERIVATION (promoted from SKETCH, CR-037 resolved)

### THM_0494: Born Rule from Crystallization
**Statement**: P(k) = |c_k|² from three-layer derivation: WF existence (S169), uniqueness (S173), robustness (S173).
**Depends on**: THM_0491, THM_0493, AXM_0117, AXM_0112, AXM_0110, DEF_02C0, DEF_02C4
**Used by**: Measurement problem, entanglement, alpha mechanism
**Verification**: `wf_uniqueness_born_rule.py` [37/37 PASS], `wright_fisher_from_geometry.py` [11/11 PASS]
**Status**: DERIVATION (promoted from SKETCH, CR-035 resolved)

### THM_0495: Path Independence Implies Associativity
**Statement**: Directed time → transition composition must be associative.
**Depends on**: AXM_0116, AXM_0108, [I-MATH]
**Used by**: Motivates G-004 (does NOT close it)
**Status**: SKETCH

### THM_0496: Equal Distribution of EM Coupling
**Statement**: Tilt coupling distributes equally over Φ₆(n_c) = 111 EM channels.
**Depends on**: DEF_02C3, [I-MATH: U(n_c) transitivity, Schur's lemma]
**Used by**: Alpha correction 4/111
**Status**: SKETCH

### THM_0497: Strong CP Resolution (theta_QCD = 0)
**Statement**: [CONJECTURE] theta_QCD = 0 from G₂ → SU(3) structure.
**Depends on**: THM_0485, THM_0484, [I-MATH: G₂ = Aut(O)]
**Used by**: QCD physics, strong CP problem
**Status**: SKETCH — DOWNGRADED (CR-029: Step 4 π₃(G₂) error, proof incomplete)

### THM_0498: Quartic Discriminant (First-Order Transition)
**Statement**: No stable mixed fixed point for N ≥ 4; SO(11) → SO(4)×SO(7) is first-order.
**Depends on**: AXM_0117, [I-MATH: one-loop RG for O(N) quartic models]
**Status**: SKETCH

### THM_0499: Prime-Orthogonality Correspondence
**Statement**: Coprimality ↔ orthogonality structural correspondence.
**Depends on**: AXM_0101, AXM_0104, AXM_0116, [I-MATH: fundamental theorem of arithmetic]
**Status**: SKETCH

### THM_04A0: Associativity Filter
**Statement**: Associativity of transitions selects n_d ≤ 4.
**Depends on**: THM_0484, [I-MATH: Frobenius theorem]
**Used by**: n_d = 4 result
**Status**: SKETCH

### THM_04A1: Crystal Decomposition
**Statement**: Crystal decomposes as n_c = Im_C + Im_H + Im_O = 1+3+7 = 11.
**Depends on**: THM_0484, [I-MATH: Hurwitz theorem]
**Used by**: All n_c-dependent predictions
**Status**: SKETCH

### THM_04A2: Single-Photon Tilt (Alpha Mechanism)
**Statement**: Born-rule probability P = 1/N_I = 1/137 per mode at crystallization vertex.
**Depends on**: THM_0494 (Born rule), DEF_02B3 (Interface mode count), THM_0496 (Equal distribution)
**Used by**: Alpha prediction, correction 4/111
**Verification**: `single_photon_tilt_chain.py` [21/21 PASS]
**Status**: SKETCH (gap: generic→uniform superposition)

### THM_04A3: Beta Coefficient Decomposition
**Statement**: QCD beta coefficients = framework algebra dimensions (b₀=33=Im_H×n_c, etc.)
**Depends on**: n_c = 11, n_d = 4, division algebra dimensions
**Verification**: `tilt_dynamics_beta_functions.py` [17/18 PASS]
**Status**: DERIVATION

### THM_04A4: Hadronization Entropy Conservation
**Statement**: S_parton = S_hadron via O-channel crystallization; dim(O)=8 bijective mapping.
**Depends on**: THM_0484 (O structure), [A-IMPORT: QCD confinement]
**Verification**: `entropy_crystallization_collider.py` [12/12 PASS]
**Status**: SKETCH

---

## Definitions (DEF_02A3 and later)

### DEF_02A3: Tilt Matrix
**Statement**: ε_ij = ⟨π(b_i), π(b_j)⟩ - δ_ij (deviation from orthogonality)
**Depends on**: AXM_0109, AXM_0110, DEF_0210
**Used by**: DEF_02C0, DEF_02B3, THM_0494, all crystallization dynamics
**Status**: CANONICAL

### DEF_02B0-02B2: Universe-Crystal Correspondence
**Statement**: Explicit bridge between Universe U and Crystal V_Crystal.
**Depends on**: AXM_0109, DEF_0201-0203, DEF_0207
**Status**: CANONICAL

### DEF_02B3: Interface Mode Count
**Statement**: N_I = n_d² + n_c² interface modes; s_I = 1/N_I interface strength.
**Depends on**: DEF_02A3, THM_0485, DEF_0285, DEF_0286
**Used by**: Alpha derivations, mode sector decomposition, THM_04A2
**Status**: CANONICAL

### DEF_02C0: Order Parameter
**Statement**: ε = ||ε_ij||_F (Frobenius norm of tilt matrix)
**Depends on**: DEF_02A3
**Used by**: DEF_02C4, THM_0494, crystallization dynamics
**Status**: CANONICAL

### DEF_02C1: Framework Dimensions
**Statement**: D_framework = {1, 2, 3, 4, 7, 8, 11}
**Depends on**: THM_0484, [I-MATH: Hurwitz]
**Used by**: DEF_02C2, THM_0488
**Status**: CANONICAL

### DEF_02C2: Framework Primes
**Statement**: {2, 5, 13, 17, 53, 73, 113, 137} = primes p = a² + b² with a,b ∈ D_framework
**Depends on**: DEF_02C1, AXM_0118
**Used by**: Prime theory, crystallization ordering
**Status**: CANONICAL

### DEF_02C3: EM Channel Count
**Statement**: Φ₆(n_c) = n_c² - n_c + 1 = 111
**Depends on**: n_c = 11
**Used by**: THM_0496, alpha correction
**Status**: CANONICAL

### DEF_02C4: Crystallization Potential
**Statement**: V(ε) = V₀(1 - ε²/μ²) hilltop form
**Depends on**: DEF_02C0, AXM_0117
**Used by**: THM_0494, cosmology, inflation
**Status**: CANONICAL

---

## Derived Structural Results

### n_d = 4 (Defect dimension)
**Statement**: Maximum defect dimension is 4 (quaternionic)
**Depends on**: THM_0484 + [I-MATH: Frobenius — only R, C, H, O are associative division algebras]
**Used by**: α formula, spacetime dimension, all electroweak structure
**Verification**: `associativity_requirement.py` [PARTIAL]

### n_c = 11 (Crystal dimension)
**Statement**: n_c = dim(Im_C) + dim(Im_H) + dim(Im_O) = 1 + 3 + 7 = 11
**Depends on**: THM_0484, [I-MATH: Hurwitz theorem], [A-STRUCTURAL: imaginary decomposition]
**Used by**: ALL numerical predictions — α, masses, cosmology, CMB
**Verification**: `nc_11_rigorous_derivation.py` [PASS]

### SM Gauge Groups: SU(3) × SU(2) × U(1) (UPDATED S174)
**Statement**: F=C on SO(11): G₂→SU(3) (internal) + SO(4)→U(2)=SU(2)₋×U(1)_J (defect). dim=12=n_c+1.
**Depends on**: THM_0484, THM_0485 (F = C), THM_0487 (SO(11) chain), AXM_0117
**Used by**: All particle physics predictions, EWSB
**Verification**: `sm_gauge_group_from_fc.py` [25/25 PASS], `eigenvalue_selection_sm_gauge.py` [22/22 PASS]

### THM_04B6: Moment Map Codimension (S278)
**Statement**: codim(mu^{-1}(0)) = 11 = n_c in Gr(4,11;R). Decomposition 28 = 17 + 11. Symplectic reduction dim = 3 = Im_H.
**Depends on**: AXM_0120 (CCP), THM_04AD (rank selection), THM_0487 (G_2 from breaking chain), [I-MATH: G_2 moment map, exterior algebra rank, symplectic reduction]
**Used by**: Independent geometric confirmation of n_c = 11; geometric derivation of spatial dim = 3
**Verification**: `mu_zero_locus.py` [16/16 PASS], `h_schubert_state_counting.py` [8/8 PASS]
**Status**: CANONICAL

### EWSB: Higgs = pNGB from ε_di (S175)
**Statement**: (2,1)_{Y=1/2} doublet in ε_di off-diagonal block; VEV gives W⁺,W⁻,Z massive, γ massless.
**Depends on**: SM gauge group (above), THM_0487 (28 Goldstones), DEF_02A3
**Used by**: Electroweak mass predictions
**Verification**: `ewsb_higgs_from_tilt_interface.py` [32/32 PASS]

---

## Numerical Predictions

### 1/α = 137 + 4/111 (Fine structure constant)
**Statement**: 1/α = n_d² + n_c² + n_d/Φ₆(n_c) = 15211/111
**Depends on**: n_d = 4, n_c = 11, AXM_0118, Lie algebra u(n_c) structure
**Used by**: All precision predictions, Higgs VEV, cosmological constant
**Verification**: `alpha_enhanced_prediction.py` [PASS, 0.27 ppm]

### sin²θ_W = 1/4 (Tree level Weinberg angle)
**Statement**: sin²θ_W = dim(C)/dim(H) = 2/8 = 1/4 at tree level
**Depends on**: THM_0484, [A-COUPLING: g² ∝ Im(algebra)]
**Verification**: `weinberg_angle_running.py` [PASS]

### sin²θ_W on-shell: cos(θ_W) = 171/194 (3.75 ppm)
**Statement**: On-shell Weinberg angle from framework primes
**Depends on**: n_c = 11, framework prime 97
**Verification**: `mW_mZ_97_formula.py` [PASS]

### m_p/m_e = 1836 + 11/72 (Proton-electron mass ratio)
**Statement**: m_p/m_e = 132203/72
**Depends on**: n_c = 11, Lie algebra u(3) structure
**Verification**: `proton_electron_best_formula.py` [PASS, 0.06 ppm]

### Higgs VEV: v = M_Pl × α⁸ × √(44/7) (0.034%)
**Statement**: Electroweak scale derived from Planck mass
**Depends on**: α formula, n_d = 4, n_c = 11, [A-IMPORT: M_Pl]
**Verification**: `higgs_vev_from_portal.py` [PASS]

### Electroweak masses: m_Z, m_W, m_H (all sub-0.2%)
**Depends on**: Higgs VEV, n_c = 11, framework structure
**Verification**: `electroweak_sector_complete.py` [PASS]

### Koide parameters: Q = 2/3, θ = π×73/99, M = v/784
**Depends on**: THM_0484, n_c = 11
**Verification**: `koide_theta_prime_attractor.py` [PASS]

### CKM matrix: All 4 parameters (sub-0.1%)
**Depends on**: Division algebra structure, framework primes
**Verification**: `ckm_completion_search.py` [PASS]

---

## Cosmological Predictions

### Ω_Λ = 13/19 (Dark energy fraction, 0.07%)
**Depends on**: n_c = 11, division algebra dimensions
**Verification**: `dark_matter_cosmology.py` [PASS]

### m_DM = 5.11 GeV (Dark matter mass)
**Depends on**: SU(7) hidden sector, 49/9 ratio
**Verification**: `dark_matter_mass_scale.py` [PASS]

### SO(11) Crystallization Chain (Session 132)
**Statement**: SO(11) → SO(4)×SO(7) → SO(4)×G₂ → SO(4)×SU(3) is unique
**Depends on**: n_c = 11, THM_0484, AXM_0117, [A-STRUCTURAL: Landau expansion]
**Used by**: Goldstone counting, inflationary dynamics, denominator unification
**Verification**: `crystallization_ordering_SO11.py` [15/15 PASS]
**Proposed**: THM_0487

### Denominator Polynomial Unification (Session 132b)
**Statement**: All 14 framework denominators are polynomials in n_c
**Depends on**: n_c = 11, SO(11) chain
**Verification**: `denominator_polynomial_unification.py` [21/21 PASS]
**Proposed**: THM_0488

### Born Rule from Crystallization (Session 134)
**Statement**: P(k) = |c_k|² from martingale + optional stopping
**Depends on**: THM_0484 (Hermitian tilt), Mexican hat potential, [A-PHYSICAL: noise ∝ unorthogonality]
**Verification**: `born_rule_from_crystallization.py` [12/12 PASS]

### Hilltop Inflation: n_s = 193/200, r = 7/200 (Session 127)
**Statement**: Spectral index and tensor-to-scalar ratio from hilltop potential
**Depends on**: SO(11) chain, crystallization potential V(ε)
**Verification**: `lcdm_deviations_from_hilltop.py` [16/17 PASS]

### CMB Observables (Sessions 97-98, 131-142)
**Statement**: ℓ₁ = 220 (exact), ℓ₂ = 537.8, δT/T = α²/3
**Depends on**: n_c = 11, crystallization dynamics, α formula
**Verification**: `cmb_observables_crystallization.py` [PASS]

---

## Predictions Added S145-S175

### sin²θ_W = 28/121 (Weinberg angle from Goldstone fraction, S151-S160)
**Statement**: sin²θ_W = n_d × Im_O / n_c² = 28/121 = 0.23140 (843 ppm)
**Depends on**: THM_0487 (28 Goldstones), n_c = 11, [A-IMPORT: MS-bar definition]
**Also**: S_2 = 29 from Complex Bridge (S159), cos(θ_W) = 171/194 on-shell (3.75 ppm, S111)
**Verification**: `weinberg_angle_investigation.py` [14/14 PASS], `s2_29_derivation.py` [16/16 PASS]

### Neutrino mass ratio R₃₁ = 33 (S167)
**Statement**: Δm²₃₁/Δm²₂₁ = Im_H × n_c = 33 (measured 33.58 ± 0.93, 0.6σ)
**Depends on**: THM_0484 (octonion structure), Fano plane generation coupling
**Also**: R₃₂ = H × O = 32, normal ordering, m₁ = 0
**Verification**: `neutrino_mass_blind_predictions.py` [21/21 PASS]

### Counting metric = Hilbert-Schmidt (S165)
**Statement**: AXM_0110 → HS inner product → all generators unit norm → P = 1/N_I
**Depends on**: AXM_0110, [I-MATH: Schur's lemma]
**Used by**: THM_04A2 (alpha mechanism), THM_0494 (Born rule)
**Verification**: `hilbert_schmidt_counting_metric.py` [15/15 PASS]

### Democratic quartic: b = M_Pl⁴/N_I (S172)
**Statement**: Same 1/N_I ratio for quartic coefficient as gauge coupling
**Depends on**: AXM_0117, DEF_02C4, [A-STRUCTURAL: B_total = M_Pl⁴]
**Verification**: `democratic_quartic_derivation.py` [18/18 PASS]

### eps* convention: portal = α², MH = α (S171)
**Statement**: Two distinct order parameters; portal probability = (local amplitude)²
**Depends on**: DEF_02C0, DEF_02C4
**Verification**: `eps_star_convention_resolution.py` [18/18 PASS]

---

## Assumption Impact Matrix

### If AXM_0116 (Directed time / T1) is wrong:

| Claim | Impact |
|-------|--------|
| THM_0485 (F = C) | DIRECT — field selection fails |
| Chirality (left-handed) | DIRECT — no orientation |
| ALL downstream claims | INDIRECT — via F = C |

### If THM_0484 (Division algebra structure) is wrong:

| Claim | Impact |
|-------|--------|
| n_d = 4 | DIRECT |
| n_c = 11 | DIRECT |
| SM gauge groups | DIRECT |
| α = 1/137 | DIRECT |
| SO(11) chain | DIRECT |
| Denominator unification | DIRECT |
| ALL numerical predictions | INDIRECT |

### If AXM_0118 (Prime attractor selection) is wrong:

| Claim | Impact |
|-------|--------|
| α = 137 selection | DIRECT — why 137 is selected |
| Framework prime structure | DIRECT |
| All precision constants | INDIRECT — via α |

### If n_c = 11 is wrong:

| Claim | Impact |
|-------|--------|
| ALL 14 denominator polynomials | DIRECT |
| ALL numerical predictions | DIRECT |
| SO(11) chain | DIRECT |
| CMB observables | DIRECT |
| Cosmological fractions | DIRECT |

### If AXM_0110 (Perfect orthogonality) is wrong:

| Claim | Impact |
|-------|--------|
| DEF_02A3 (Tilt matrix) | DIRECT — definition requires orthogonal basis |
| Counting metric = HS (S165) | DIRECT — HS from AXM_0110 |
| THM_0494 (Born rule) | INDIRECT — via counting metric |
| THM_04A2 (Alpha mechanism) | INDIRECT — via Born rule |
| ALL numerical predictions | INDIRECT — via α |

### If AXM_0112 (Crystal symmetry) is wrong:

| Claim | Impact |
|-------|--------|
| THM_0494 (Born rule) | DIRECT — WF noise requires SO(n_c) symmetry |
| Born rule uniqueness (S173) | DIRECT — exchangeability from crystal symmetry |

### If AXM_0117 (Crystallization tendency) is wrong:

| Claim | Impact |
|-------|--------|
| THM_0494 (Born rule) | DIRECT — crystallization dynamics |
| SO(11) breaking chain (THM_0487) | DIRECT — driving force for breaking |
| Hilltop inflation (n_s, r) | DIRECT — potential shape |
| Democratic quartic (S172) | DIRECT — b coefficient |
| EWSB mechanism (S175) | INDIRECT — via SO(11) chain |
| SM gauge group (S174) | INDIRECT — via eigenvalue selection |

### If [A-COUPLING] (g² ∝ Im(algebra)) is wrong:

| Claim | Impact |
|-------|--------|
| sin²θ_W = 1/4 at tree level | DIRECT |
| ~200 TeV scale significance | DIRECT |

---

## Verification Script Mapping

| Claim | Primary Script | Status |
|-------|---------------|--------|
| THM_0482 | `perspective_foundations_and_zero_divisors.md` | Logical |
| THM_0484 | `division_algebra_gap_analysis.py` | PASS |
| THM_0485 | `chirality_quaternion_analysis.py` | PASS |
| THM_0487 | `crystallization_ordering_SO11.py` | PASS (15/15) |
| THM_0488 | `denominator_polynomial_unification.py` | PASS (21/21) |
| THM_0491 | `hilbert_unitary_chain.py` | PASS (18/18) |
| THM_0493 | `hilbert_unitary_chain.py` | PASS (18/18) |
| THM_0494 | `wf_uniqueness_born_rule.py` | PASS (37/37) |
| THM_0496 | `equal_distribution_derivation.py` | PASS |
| THM_0497 | `strong_cp_crystallization.py` | PASS (10/10) — proof incomplete |
| THM_04A2 | `single_photon_tilt_chain.py` | PASS (21/21) |
| THM_04A3 | `tilt_dynamics_beta_functions.py` | PASS (17/18) |
| THM_04A4 | `entropy_crystallization_collider.py` | PASS (12/12) |
| n_d = 4 | `associativity_requirement.py` | PARTIAL |
| n_c = 11 | `nc_11_rigorous_derivation.py` | PASS |
| SM gauge | `sm_gauge_group_from_fc.py` | PASS (25/25) |
| EWSB | `ewsb_higgs_from_tilt_interface.py` | PASS (32/32) |
| Eigenvalue sel. | `eigenvalue_selection_sm_gauge.py` | PASS (22/22) |
| α formula | `alpha_enhanced_prediction.py` | PASS |
| sin²θ_W 28/121 | `weinberg_angle_investigation.py` | PASS (14/14) |
| S_2 = 29 | `s2_29_derivation.py` | PASS (16/16) |
| m_p/m_e | `proton_electron_best_formula.py` | PASS |
| Higgs VEV | `higgs_vev_from_portal.py` | PASS |
| EW masses | `electroweak_sector_complete.py` | PASS |
| Koide | `koide_theta_prime_attractor.py` | PASS |
| CKM | `ckm_completion_search.py` | PASS |
| Ω_Λ | `dark_matter_cosmology.py` | PASS |
| SO(11) chain | `crystallization_ordering_SO11.py` | PASS (15/15) |
| Denominators | `denominator_polynomial_unification.py` | PASS (21/21) |
| Born rule | `born_rule_from_crystallization.py` | PASS |
| WF uniqueness | `wf_uniqueness_born_rule.py` | PASS (37/37) |
| HS counting | `hilbert_schmidt_counting_metric.py` | PASS (15/15) |
| n_s, r | `lcdm_deviations_from_hilltop.py` | PASS |
| Neutrino R₃₁ | `neutrino_mass_blind_predictions.py` | PASS (21/21) |
| eps* convention | `eps_star_convention_resolution.py` | PASS (18/18) |
| Democratic b | `democratic_quartic_derivation.py` | PASS (18/18) |
| Beta coeffs | `tilt_dynamics_beta_functions.py` | PASS (17/18) |
| Casimir | `casimir_completeness_audit.py` | PASS (23/23) |

---

## How to Use This Document

### When an assumption changes:
1. Find the assumption in the Impact Matrix above
2. List all claims that depend on it (direct + indirect)
3. Re-evaluate each dependent claim
4. Update STATUS_DASHBOARD if results change

### When adding a new claim:
1. Add entry with all dependencies
2. Add to impact matrix for relevant assumptions
3. Link verification script if exists
4. Assign confidence level

### When a claim is falsified:
1. Mark claim as FALSIFIED with date
2. Update all claims that depended on it
3. Document lesson in `registry/DEAD_ENDS.md`

---

## S181+ Additions (Not Yet Dependency-Tracked)

> **Note (S189 audit)**: The following items from S181+ lack full dependency tracking. Entries are provisional.

### AXM_0119 (Transition Linearity)
- **Depends on**: AXM_0100, AXM_0105
- **Used by**: THM_0495, THM_0496

### THM_04A5 (Uncertainty Principle)
- **Depends on**: AXM_0115, THM_0491
- **Status**: CANONICAL

### THM_04A6 (Spin-Statistics)
- **Depends on**: AXM_0115, THM_0491
- **Status**: CANONICAL

### THM_04A7 (Self-Model Incompleteness)
- **Depends on**: AXM_0100, AXM_0113
- **Status**: DERIVATION

### THM_04A8 (Perspective Space Cardinality)
- **Depends on**: AXM_0100, AXM_0101
- **Status**: DERIVATION

### THM_04A9 (Non-Paradoxical Gap)
- **Depends on**: THM_04A7
- **Status**: DERIVATION

### THM_04AA (Perspective from Self-Representation)
- **Depends on**: AXM_0100, THM_04A7
- **Status**: DERIVATION

### THM_04AB (Automorphism Independence)
- **Depends on**: AXM_0115, THM_0440
- **Status**: DERIVATION

### DEF_02C5 (Self-Model)
- **Used by**: THM_04A7, THM_04A9

### DEF_02C6 (Incompleteness Gap)
- **Used by**: THM_04A7, THM_04A9

### THM_04AD: Perspective Rank Selection
- **Depends on**: AXM_0120 (CCP), THM_0484
- **Status**: CANONICAL
- **Used by**: THM_04B6 (Moment map codimension)

### THM_04AE: Lorentz Signature
- **Depends on**: AXM_0116, THM_0484 (H structure)
- **Status**: DERIVATION

### THM_04AF: Gap Existence by Exclusion
- **Depends on**: AXM_0120 (CCP), THM_0484
- **Status**: DERIVATION

### THM_04B0: Recursive Gap Tower
- **Depends on**: THM_04A7, AXM_0117
- **Status**: DERIVATION
- **Used by**: Consciousness discussion (meta-level)

### THM_04B1: IMC Terminal Undecidability
- **Depends on**: THM_04B0, AXM_0100
- **Status**: DERIVATION

### THM_04B2: Perspective from Seed
- **Depends on**: AXM_0120, THM_0484
- **Status**: DERIVATION

### THM_04B5: Pi Power Sums
- **Statement**: Pi-power sums encode division algebra dimensions. Pi forced by CCP.
- **Depends on**: AXM_0120 (CCP), [I-MATH: analytic number theory]
- **Status**: THEOREM (S265)
- **Verification**: `pi_power_sum_deep.py`, `pi_from_foundations.py`

---

## S251-S299 Key Results (Session 301 update)

### CCP Propagation (S251-S255)

- **n_c = 11** [D: CCP] — now three independent paths: CCP, CD Closure, moment map
- **n_d = 4** [D: CCP + Frobenius] — maximal associative division algebra
- **F = C** [D: CCP + T1] — resolved as DERIVED (no longer [A-STRUCTURAL])
- **SM gauge group** [D: Pipeline 121->55->18->12] — independent of automorphism route
- **Generations = 3** [D: Im_H tensor decomposition 7->3+3bar+1]

### Conjecture Resolutions (S258-S299)

| Conjecture | Resolution | Session | Mechanism | Impact |
|------------|-----------|---------|-----------|--------|
| CONJ-A3 | [THEOREM] | S258 | Radon-Hurwitz: dim 7 odd -> rho(7)=1 < 4 -> no [4,7,7]-composition | n_d^2+n_c^2=137 DERIVED |
| CONJ-B3 | [THEOREM] | S258-259 | Gradient flow convergence via Lyapunov | Lower energy preferred |
| CONJ-B1 | [THEOREM] | S286 | FFT on Hom(R^4,R^7): all invariants even | Quartic potential forced |
| CONJ-A1 | [DERIVATION] | S292 | C5 + IRA-10 -> finite spectrum -> WSR converge | Democratic gauge coupling |
| CONJ-A2 | [A-STRUCTURAL] | S297 | kappa=1 = standard Tr convention for HS metric | Alpha Step 5 upgraded |

### Yang-Mills Mass Gap (S268-S285) [CANONICAL]
**Statement**: Glueball mass formula m/sqrt(sigma) = n_d + J(J+1)/n_d + dim_C*L + C_2(A)*(n_g-2)
**Depends on**: n_d = 4, THM_0484, THM_0487 (SO(11) chain), [A-IMPORT: lattice QCD data]
**Used by**: QCD sector predictions, SU(N) generalization
**Verification**: 13 scripts, 285/286 total PASS
**Key results**: Base mass n_d=4 universal [CONFIRMED]. Large-N intercept 10/3+2/N^2. 0++ at 3.7% from lattice, 1+- at 0.5%.

### Tree-to-Dressed Paradigm (S266-S283)
**Statement**: Framework predictions are tree-level; radiative corrections organize into 3 bands (A/B/C)
**Depends on**: All tree-level predictions, [A-STRUCTURAL: radiative correction identification]
**Used by**: Precision classification of all predictions
**Verification**: `tree_dressed_paradigm_test.py` (12/12), `tree_dressed_systematic.py` (23/24)

### Alpha C_2=24/11 two-loop + D_3=1 three-loop (S266-S344)
**Statement**: Two-loop: 1/alpha = 137.035999053 (0.0009 ppm, 5.9 sigma) [DERIVATION]. Three-loop: 1/alpha = 137.035999177 (**0.0006 sigma**) [CONJECTURE, HRS 5]. Full formula: 1/alpha = 15211/111 - (24/11)*alpha^2/pi + alpha^3/pi.
**Depends on**: Tree-level 15211/111, C_2 = 24/11 (defect charges on SO(11)/SO(4)xSO(7)), D_3 = 1 (N_VEV candidate)
**Verification**: `alpha_ccwz_three_loop.py` (24/24), `alpha_d3_derivation_attempt.py` (23/23), `alpha_em_index_density.py`, `alpha_three_loop_residual.py`

### Omega_m = 63/200 Derived (S293)
**Statement**: Dual-channel HS equipartition: 63 dual-role generators, 74 interface-only, total 200 contributions
**Depends on**: I-STRUCT-5, Schur's lemma, su(4)+su(7) structure
**Verification**: `omega_m_equipartition_derivation.py` (15/15 PASS)

### Top Yukawa y_t = 1 (S290)
**Statement**: Full compositeness -> sin(theta)=1; NDA: Y_* cancels; CG cancels (Clifford)
**Depends on**: AXM_0109, SO(11) spinor embedding (S212), [A-STRUCTURAL: NDA mass relation]
**Used by**: m_t(tree) = v/sqrt(2), m_H chain (lambda_H = 125/968)
**Verification**: `top_yukawa_compositeness.py` (12/12), `so11_spinor_yukawa_coupling.py` (12/12)

### IRA Inventory (S259-S304)
**Statement**: 4 irreducible assumptions (0 conjectures, 1 structural, 2 physical, 0 interpretation, 1 import)
**Canonical source**: `framework/IRREDUCIBLE_ASSUMPTIONS.md`
**Key resolutions**: IRA-02 eliminated (CONJ-A1, S292), IRA-03 eliminated (CONJ-B1, S286), IRA-05 eliminated (CONJ-B3, S259), IRA-08/09 derived from IRA-06 (S299), IRA-10 eliminated (THM_0491+CCP, S302), IRA-01 resolved (kappa=1 derived, S304)
**Verification**: `ira_physical_independence.py` (38/38 PASS)

---

## Assumption Impact Matrix Updates (S301)

### If IRA-06 (Crystallization = SSB) [A-PHYSICAL] is wrong:

| Claim | Impact |
|-------|--------|
| IRA-08 (tilt = physical field) | DIRECT — derived from IRA-06 |
| IRA-09 (generation structure) | DIRECT — derived from IRA-06 |
| All symmetry breaking results | DIRECT |
| Yang-Mills mass gap | DIRECT — glueball spectrum |

### If IRA-07 (Interface = measurement) [A-PHYSICAL] is wrong:

| Claim | Impact |
|-------|--------|
| Born rule connection to alpha | DIRECT |
| 1/N_I = 1/137 interpretation | DIRECT |

### If IRA-10 (Perspectives = QM) [A-INTERPRETATION] is wrong:

| Claim | Impact |
|-------|--------|
| CONJ-A1 resolution | DIRECT — spectral convergence uses finite Hilbert space |
| Weinberg chain | DIRECT — WSR convergence |
| All precision gauge predictions | INDIRECT |

---

## Verification Script Mapping Updates (S301)

| Claim | Primary Script | Status |
|-------|---------------|--------|
| CONJ-A3 | `conj_a3_algebraic_incompatibility.py` | PASS |
| CONJ-B1 | `conj_b1_z2_rectangular_matrix.py` | PASS (10/10) |
| CONJ-B3 | `conj_b3_ergodicity_proof.py` | PASS |
| CONJ-A1 | `spectral_convergence_conj_a1.py` | PASS (24/24) |
| CONJ-A2 | `conj_a2_normalization_principle.py` | PASS (10/10) |
| Yang-Mills | `glueball_structural_derivation.py` | PASS (39/39) |
| Tree-dressed | `tree_dressed_paradigm_test.py` | PASS (12/12) |
| Alpha C=24/11 | `alpha_coefficient_24_11_analysis.py` | PASS |
| Omega_m | `omega_m_equipartition_derivation.py` | PASS (15/15) |
| y_t = 1 | `top_yukawa_compositeness.py` | PASS (12/12) |
| IRA independence | `ira_physical_independence.py` | PASS (38/38) |
| Planck codim | `mu_zero_locus.py` | PASS (16/16) |
| H_2 correction | `h_topological_step.py` | PASS |
| Pi from CCP | `pi_from_foundations.py` | PASS |
| Non-observations | `non_observations_survey.py` | PASS (56/56) |
| Weinberg one-loop | `weinberg_one_loop_coefficient.py` | PASS |
| Weinberg coefficient | `weinberg_coefficient_origin.py` | PASS |
| m_p/m_e coefficient | `mpme_three_loop_residual.py` | PASS |
| Dimensional propagation | `dimensional_propagation_test.py` | PASS (42/42) |

---

*Last updated: 2026-02-07 (Session 301 — comprehensive S189-S299 propagation: AXM_0120, 5 CONJ resolutions, Yang-Mills CANONICAL, tree-to-dressed, IRA 10->6, ~30 new verification scripts)*
