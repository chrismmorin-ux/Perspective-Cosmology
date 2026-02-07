# Crystallization Catalog: Master Type Reference

**Status**: CORE FRAMEWORK
**Created**: 2026-01-30
**Confidence**: Mixed — ranges from [CANONICAL] to [SPECULATION] per type (see individual entries)
**Layer**: Mixed (Layer 1 mathematics + Layer 2 correspondence + Layer 3 predictions)

---

## Part 0: Orientation

### Executive Summary

Crystallization — the tendency of the tilt matrix toward orthogonality — is the single dynamical principle underlying all physics in the Perspective framework. This document catalogs seventeen types of crystallization (C1-C17), standardizes their descriptions, maps their relationships, and provides composability rules for chaining types in sequential analysis. It also documents three cross-cutting mechanisms (entanglement, EWSB, collider validation) that enrich existing types without requiring new ones. Process-level detail (specific decays, scattering, bound states, etc.) is in the sub-catalog system at `framework/crystallization_processes/`.

### Plain Language

Imagine the universe as a structure that "wants" to be perfectly organized — like a crystal trying to form from a liquid. This drive toward order is called crystallization, and it shows up in many different ways depending on the context.

At the largest scale, the entire universe is crystallizing — that is what the Big Bang was, the first crack in perfect uniformity. At the smallest scale, when you measure a quantum particle, the act of measurement is also crystallization — the particle's fuzzy state snaps into a definite one.

Between these extremes, crystallization appears as symmetry breaking (forces separating from each other), as black holes (regions where structure dissolves back toward uniformity), as the Casimir effect (vacuum pressure between metal plates), and as photon emission (atoms shedding excess energy).

All of these are the same underlying process — the tilt matrix evolving toward lower energy — just operating at different scales, in different channels, and with different boundary conditions. This catalog maps them all.

**One-sentence version**: Seventeen manifestations of one principle -- tilt reduction -- spanning from the Big Bang to quantum measurement to gravitational waves, backed by 58 verification scripts (723 tests), with three cross-cutting mechanisms (entanglement, EWSB, collider phenomenology) enriching the taxonomy.

### How to Use This Document

- **Looking up a specific type?** See Part II (the catalog) — types are numbered C1 through C9.
- **Need the mathematical foundations?** See Part I for core definitions and axioms.
- **Want to chain types for a multi-stage analysis?** See Part III (composability framework).
- **Looking for a specific observable?** See index 4.2 (by observable).
- **Checking verification status?** See index 4.4 (verification scripts).
- **Identifying gaps?** See index 4.5 (gap tracker).

### Quick-Reference Lookup

| Looking for... | Go to |
|----------------|-------|
| What crystallization IS | Part 0 (this section) |
| Core math (epsilon, V, W) | Part I: Foundations |
| Cosmic crystallization / Big Bang | C1 in Part II |
| SO(11) symmetry breaking chain | C2 in Part II |
| Tilt matrix dynamics / Mexican hat | C3 in Part II |
| Quantum collapse / Born rule | C4 in Part II |
| Black hole de-crystallization | C5 in Part II |
| Casimir effect / QCD confinement | C6 in Part II |
| Cosmological phase transitions | C7 in Part II |
| Photon emission mechanism | C8 in Part II |
| Particle mass freezing | C9 in Part II |
| Weak decay / flavor change | C10 in Part II |
| Pair creation & annihilation | C11 in Part II |
| Hadronization & jets | C12 in Part II |
| Nuclear binding | C13 in Part II |
| Neutrino oscillation | C14 in Part II |
| Gravitational waves | C15 in Part II |
| Baryogenesis | C16 in Part II |
| Structure formation | C17 in Part II |
| Specific process decompositions | `crystallization_processes/` sub-catalogs |
| How to chain types together | Part III: Composability |
| All scripts and their status | Index 4.4 in Part IV |
| What is NOT yet derived | Index 4.5 in Part IV |
| The g(phi) unification | Section 5.2 in Part V |
| Generalized pressure formula | Section 5.5 in Part V |
| Entanglement mechanism | Section 5.6 in Part V |
| EWSB mechanism | Section 5.7 in Part V |
| Collider validation summary | Section 5.8 in Part V |
| Resolved & falsified gaps | Gap Tracker in Part IV |

---

## Part I: Foundations

### 1.1 Core Definitions

| ID | Name | Formula | Status |
|----|------|---------|--------|
| DEF_0285 | Crystalline | Var(U) = 0 iff all perspectives isomorphic | CANONICAL |
| DEF_02A3 | Tilt Matrix | epsilon_ij = <pi(b_i), pi(b_j)> - delta_ij | CANONICAL |
| DEF_02C0 | Order Parameter | epsilon = norm(epsilon_ij)_F; ground state epsilon* = alpha^2 | CANONICAL |
| DEF_02C4 | Crystallization Potential | V(epsilon) = V_0 (1 - epsilon^2 / mu^2) | CANONICAL |

**The tilt matrix** epsilon_ij is the fundamental dynamical variable. It is a symmetric matrix measuring how much a perspective distorts the perfect crystal's orthogonality. When epsilon = 0, the crystal is perfect and no physics exists. When epsilon != 0, structure (and physics) emerges.

**The order parameter** epsilon = ||epsilon_ij||_F collapses the matrix to a single scalar measuring total deviation from orthogonality. Its ground state value epsilon* = alpha^2 ~ 5.3 x 10^-5 sets the scale of residual imperfection in the current universe.

**The crystallization potential** V(epsilon) governs the dynamics. In the hilltop form, epsilon = 0 is an unstable maximum (the symmetric phase) and the field rolls toward epsilon* (the broken phase). This potential simultaneously controls inflation, matter stability, and the CMB spectrum through the shared function g(phi) = 1 - phi^2/mu^2.

### 1.2 Core Axioms

| ID | Name | Statement | Status |
|----|------|-----------|--------|
| AXM_0109 | Crystal Existence | V_Crystal exists as inner product space; dim = n_c = 11 | CANONICAL |
| AXM_0117 | Crystallization Tendency | d||epsilon||/dtau <= 0 (tilt non-increasing along flow) | PROPOSED |
| AXM_0118 | Prime Attractor Selection | Crystallization selects primes p = a^2 + b^2 with a,b in D_framework | PROPOSED |

AXM_0117 is the "engine" — it says imperfection is unstable and the universe evolves toward orthogonality. AXM_0118 says WHERE crystallization converges: at prime-indexed configurations determined by the division algebra dimensions.

### 1.3 The Universal Order Parameter

The scalar epsilon threads through ALL seventeen types:

```
epsilon = 0      Pure crystal. No physics. (Pre-Big-Bang, BH singularity)
epsilon << epsilon*  Near-symmetric. Inflation. (C1, C7)
epsilon ~ epsilon*   Ground state. Normal physics. (C3, C6, C8, C9)
epsilon > epsilon*   Excited state. High-energy processes. (C4, C8)
epsilon -> 0     De-crystallization. (C5)
```

Every crystallization type is a trajectory of epsilon through this landscape. The types differ in WHICH components of epsilon_ij change, at WHAT scale, and through WHICH channel.

### 1.4 Master Taxonomy

Each type is classified along four dimensions:

| Axis | Values |
|------|--------|
| **Direction** | Forward (toward epsilon*), Reverse (toward epsilon=0), Oscillatory, Static |
| **Scale** | Planck, Particle, Astrophysical, Cosmological, Universe |
| **Channel** | All, R (gravity), C (EM), H (weak), O (strong), Mixed |
| **Mechanism** | Potential-driven, Symmetry-breaking, Noise-driven, Emission, Boundary-induced |

---

## Part II: Type Catalog

---

### C1: Cosmic Crystallization (Big Bang)

**Classification**: Forward | Universe | All channels | Potential-driven

**Before -> After**:
- Physical: Pure undifferentiated crystal -> expanding universe with spacetime and forces
- Mathematical: epsilon = 0 (unstable hilltop) -> epsilon rolling toward epsilon*

**Mechanism**:
- Driving force: Hilltop potential V(epsilon) = V_0(1 - epsilon^2/mu^2)
- epsilon = 0 is unstable maximum (V''(0) < 0)
- Spontaneous nucleation: first distinction emerges
- Rapid roll-down = inflation; settling = reheating + standard cosmology
- Timescale: N ~ 52 e-folds of inflation
- Key parameter: mu^2 = (C+H)*H^4/Im_O = 1536/7

**Key Equations**:
```
V(phi) = V_0 (1 - phi^2/mu^2)              [hilltop potential]
mu^2 = (C + H) * H^4 / Im_O = 1536/7      [curvature from division algebras]
n_s = 193/200 = 0.965                       [spectral index]
r = 7/200 = 0.035                           [tensor-to-scalar ratio]
```

**Physical Signatures**:

| Observable | Predicted | Measured | Error |
|------------|-----------|----------|-------|
| n_s | 0.965 | 0.9649 +/- 0.0042 | <1 sigma |
| r | 0.035 | < 0.036 (BICEP/Keck) | Within limit |
| N (e-folds) | 52 | 45-70 (acceptable range) | Within range |

**Verification**:

| Script | Tests | Status |
|--------|-------|--------|
| `crystallization_inflation_connection.py` | — | PASS |
| `hilltop_correct_conditions.py` | — | ALL PASS |
| `lcdm_deviations_from_hilltop.py` | 16/17 | PASS |

**Dependencies**:
- Requires: AXM_0109, AXM_0117, DEF_02C0, DEF_02C4
- Enables: C2 (symmetry breaking begins after nucleation), C7 (cosmological phases)
- Related: C5 (reverse process)

**Confidence & Gaps**:
- Status: [DERIVATION] for potential form and n_s, r; [CONJECTURE] for nucleation trigger
- Chain: [A: AXM_0117] -> [D: hilltop form from crystallization tendency] -> [D: slow-roll parameters] -> [D: n_s = 193/200, r = 7/200]
- Open: Why nucleation occurred (possibly meaningless question); V_0 not derived (sets A_s amplitude)
- Falsification: CMB-S4 measuring r != 0.035 +/- 0.005 would falsify

**Sub-Catalogs** (Phase 6, S234):
- `crystallization_processes/cosmological/inflation_detailed.md` — 3 processes: slow-roll inflation (hilltop), reheating/preheating, primordial perturbation spectrum. 2 [FRAMEWORK-DERIVED] + 1 [STANDARD-RELABELED].
- `crystallization_processes/cosmological/cmb_detailed.md` — primary anisotropies section documents n_s, l_2, N_eff as C1-derived inputs to CMB observables.

**Cross-References**:
- Core: `framework/layer_1_crystallization.md` (Parts I-III)
- Investigation: `spacetime/big_bang_nature.md`
- Investigation: `cosmology/hilltop_inflation_canonical.md`
- Sub-catalogs: `crystallization_processes/cosmological/` (4 files, 13 processes — Phase 6)

---

### C2: Symmetry Breaking Chain (SO(11) -> SM)

**Classification**: Forward | Universe-to-Particle | All -> R+C+H+O | Symmetry-breaking

**Before -> After**:
- Physical: Unified SO(11) symmetry -> separated spacetime SO(4) + color SU(3)
- Mathematical: Full SO(11) crystal symmetry -> SO(4) x G_2 -> SO(4) x SU(3)

**Mechanism**:
- Driving force: Landau potential F(epsilon) = c_1 Tr(epsilon^2) + c_2 [Tr(epsilon^2)]^2 + c_3 Tr(epsilon^4)
- Stage 1: SO(11) -> SO(4) x SO(7) — only valid split with both factors in D_framework; (4,7) selected over (3,8) by quartic energy
- Stage 2: SO(7) -> G_2 = Aut(O) — unique octonionic automorphism group
- Stage 3: G_2 -> SU(3) = Stab_{G_2}(C) — forced by F = C
- 41 total Goldstone modes (28 + 7 + 6)
- Eigenvalue Selection Theorem (S168): The sign of b₂ in the Tr(ε²)² + b₂ Tr(ε⁴) potential determines the gauge group. The (3,1) partition of n_d = 4 eigenvalues gives stabilizer U(3) x U(1) ⊃ SU(3). AXM_0117 selects b₂ < 0 via crystallization concentration [CONJECTURE]

**Key Equations**:
```
n_c = Im_C + Im_H + Im_O = 1 + 3 + 7 = 11   [crystal dimension]
D_framework = {1, 2, 3, 4, 7, 8, 11}          [division algebra dimensions]
d^4 Tr(epsilon^4)/ds^4: (4,7) = 222/77, (3,8) = 343/77   [quartic selection]
Difference = -121/77 = -n_c/Im_O              [framework ratio]
Tr(eps^2)^2 + b_2 Tr(eps^4): b_2 < 0 -> (3,1) -> U(3)xU(1) [eigenvalue selection]
```

**Physical Signatures**:

| Observable | Predicted | Measured | Error |
|------------|-----------|----------|-------|
| Spacetime dim | 4 | 4 | 0% |
| Color group | SU(3) | SU(3) | Exact |
| Goldstone count | 41 | (structural) | — |
| Framework primes | 8 total | (structural) | — |

**Verification**:

| Script | Tests | Status |
|--------|-------|--------|
| `crystallization_ordering_SO11.py` | 15/15 | ALL PASS |
| `quartic_energy_curvature.py` | 12/12 | ALL PASS |
| `denominator_polynomial_unification.py` | 21/21 | ALL PASS |
| `stage3_prime_selection_rule.py` | 9/9 | ALL PASS |
| `intra_stage_ordering.py` | 12/12 | ALL PASS |
| `eigenvalue_selection_sm_gauge.py` | 22/22 | ALL PASS |
| `coset_inconsistency_resolution.py` | 20/20 | ALL PASS |
| `colored_pngb_24_modes.py` | 28/28 | ALL PASS |

**Dependencies**:
- Requires: AXM_0109, AXM_0112 (crystal symmetry), I-MATH (Frobenius, G_2 = Aut(O))
- Enables: C7 (cosmological phases proceed within broken structure), C9 (mass spectrum)
- Related: C1 (occurs during/after cosmic crystallization)

**Confidence & Gaps**:
- Status: [THEOREM] for SO(11) symmetry and G_2/SU(3) stages; [DERIVATION] for (4,7) selection and eigenvalue partition
- Chain: [A: AXM_0109 + I-MATH: Frobenius] -> [D: n_c = 11, SO(11)] -> [D: D_framework filter] -> [D: (4,7) selection by quartic] -> [I-MATH: G_2, SU(3)] -> [D: (3,1) eigenvalue partition selects U(3)xU(1)]
- Resolved (S195): Coset space Gr(4,11) gives 28 Goldstones = 4 (Higgs doublet) + 24 (colored pNGBs as (2,3)+(2,3̄))
- Open: c_3 > 0 not derived from axioms; Landau expansion form imported [I-MATH]; b₂ < 0 from AXM_0117 is [CONJECTURE]
- Falsification: Discovery of a fifth force or additional color charges

**Cross-References**:
- Core: `core/theorems/THM_0487_so11_breaking_chain.md`
- Investigation: `crystallization/symmetry_breaking_chain.md`
- Sub-catalog: `crystallization_processes/phase_transitions/ewsb_detailed.md` (4 processes: EWSB, Higgs, W/Z mass, fermion mass)

---

### C3: Tilt Matrix Dynamics (Mexican Hat + g(phi))

**Classification**: Both (Forward + Oscillatory) | All scales | All channels | Potential-driven

**Before -> After**:
- Physical: Tilt fluctuations around Mexican hat vacuum -> equilibrium at epsilon*
- Mathematical: epsilon_ij evolving under W(epsilon, phi) = -a g(phi) |epsilon|^2 + b |epsilon|^4

**Mechanism**:
- Two coupled fields: phi (crystallization order parameter) and epsilon_ij (tilt matrix)
- Mexican hat potential W(epsilon) with minimum at epsilon* = sqrt(a/2b)
- The shared function g(phi) = 1 - phi^2/mu^2 controls both inflation (V) and tilt stability (W)
- Gradient flow drives off-diagonals to zero (decoherence)
- g(phi) interpolates: g = 1 (matter stable) -> g = 0 (crystal ground state, matter dissolves)
- Corrected parameters: b = alpha M_Pl^4, a = 2 alpha^3 M_Pl^4, epsilon* = alpha

**Key Equations**:
```
W(epsilon, phi) = -a g(phi) |epsilon|^2 + b |epsilon|^4      [tilt potential]
g(phi) = 1 - phi^2/mu^2                                       [shared function]
epsilon* = sqrt(a/(2b)) = alpha = 1/137                        [ground state]
m_tilt = 2 sqrt(2) alpha^(3/2) M_Pl ~ 2.1 x 10^16 GeV       [tilt mass]
2^n_d = n_d^2 = 16  (unique to n_d = 4)                       [attractor selection]
```

**Physical Signatures**:

| Observable | Predicted | Measured | Error |
|------------|-----------|----------|-------|
| n_d = 4 (from 2^n = n^2) | 4 | 4 | 0% |
| dim(Herm(n_d)) + dim(Herm(n_c)) | 137 = 1/alpha | 137 | Exact |
| Hilltop preserved | b < 0.23 M_Pl^4 | (self-consistent) | — |

**Verification**:

| Script | Tests | Status |
|--------|-------|--------|
| `crystallization_collapse_dynamics.py` | 10/10 | ALL PASS |
| `crystallization_ab_derivation.py` | 8/8 | ALL PASS |
| `crystallization_mass_spectrum.py` | 10/10 | ALL PASS |
| `veff_landscape_tension.py` | 12/12 | ALL PASS |
| `veff_resolution_b_constraint.py` | 10/10 | ALL PASS |
| `crystallization_lagrangian.py` | 8/8 | ALL PASS |
| `crystallization_order_parameter.py` | 6/6 | ALL PASS |

**Dependencies**:
- Requires: DEF_02A3, DEF_02C0, DEF_02C4, AXM_0117
- Enables: C4 (collapse is tilt diagonalization), C6 (channel-specific forces from tilt modes), C8 (emission from tilt transitions)
- Related: C1 (phi dynamics is inflation), C2 (symmetry breaking selects tilt structure)

**Confidence & Gaps**:
- Status: [DERIVATION] for coupled potential and g(phi) unification; [CONJECTURE] for specific a, b values
- Chain: [A: AXM_0117] -> [D: Mexican hat form] -> [D: g(phi) unification] -> [D: 2^n_d = n_d^2 selects n_d = 4]
- Open: a, b not derived from axioms (constrained but not determined); g(phi) form assumed quadratic
- Falsification: If n_d != 4 were compatible with framework axioms

**Cross-References**:
- Investigation: `crystallization/crystallization_dynamics.md`
- Core: `core/definitions/DEF_02C0_order_parameter.md`, `DEF_02C4_crystallization_potential.md`

---

### C4: Quantum Collapse (Born Rule)

**Classification**: Forward | Quantum | All channels | Noise-driven

**Before -> After**:
- Physical: Quantum superposition -> definite eigenstate (measurement outcome)
- Mathematical: Off-diagonal epsilon_ij -> 0 (decoherence); one p_k -> 1 (selection)

**Mechanism**:
- Stage 1 (Decoherence): Gradient flow of W drives off-diagonal tilt elements to zero. Timescale ~ 2 x 10^-38 s.
- Stage 2 (State selection): Noise-driven diffusion on pure-state manifold. W = constant on pure states (zero drift). Noise amplitude ~ unorthogonality sqrt(p(1-p)). Bounded martingale convergence -> P(k) = |c_k|^2.
- Three-step derivation: zero drift + noise from Riemannian geometry + optional stopping theorem
- Noise structure DERIVED from geometry (S169, CR-035 resolved): Hermitian norm-preserving perturbations with phase-symmetric noise produce exactly sigma^2 = p(1-p). This is the Fubini-Study inverse metric g^{pp} = 4p(1-p). No [A-PHYSICAL] assumption needed.

**Key Equations**:
```
dp_k = sigma sqrt(p_k(1-p_k)) dW            [stochastic evolution, zero drift]
P(collapse to |k>) = p_k(0) = |c_k|^2       [Born rule from optional stopping]
u''(p) = 0 => u(p) = p                       [exit problem solution]
tau_collapse ~ 1/(4 alpha^4) t_Pl ~ 10^-36 s [collapse timescale]
sigma^2 = p(1-p)                              [from Fubini-Study metric, DERIVED]
g^{pp} = 4p(1-p)                              [Riemannian inverse metric on CP^{n-1}]
```

**Physical Signatures**:

| Observable | Predicted | Measured | Error |
|------------|-----------|----------|-------|
| Born rule P = |c|^2 | Derived | Confirmed universally | 0% |
| Collapse appears instantaneous | tau ~ 10^-36 s | Not resolved | Consistent |
| Born rule violations | ~ alpha^2 ~ 10^-5 | Not yet tested | Prediction |

**Verification**:

| Script | Tests | Status |
|--------|-------|--------|
| `born_rule_from_crystallization.py` | 12/12 | ALL PASS |
| `wright_fisher_from_geometry.py` | 11/11 | ALL PASS |
| `measurement_problem_resolution.py` | 11/11 | ALL PASS |
| `entanglement_bell_correlations.py` | 18/18 | ALL PASS |

**Dependencies**:
- Requires: C3 (Mexican hat potential, tilt dynamics), THM_0494 (Born rule theorem)
- Enables: C8 (emission follows collapse to lower tilt state), entanglement correlations (via shared crystallization in V)
- Related: C3 (same potential W governs both equilibrium and collapse)

**Confidence & Gaps**:
- Status: [DERIVATION] — rigorous mathematical argument with noise structure derived from geometry (CR-035 resolved, S169)
- Chain: [A: epsilon Hermitian] -> [D: W = const on pure states] -> [D: Hermitian norm-preserving perturbations give sigma^2 = p(1-p) from Fubini-Study metric] -> [D: martingale] -> [D: P(k) = |c_k|^2]
- Resolved (S169): Noise structure derived from Riemannian geometry of CP^{n-1}; no [A-PHYSICAL] assumption needed
- Open: Basis selection mechanism (how measurement axis is chosen); predicted Born rule violations at alpha^2 level untested
- Falsification: Observation of systematic Born rule violations at level >> alpha^2

**Cross-References**:
- Investigation: `crystallization/crystallization_dynamics.md` (Parts 9-10, Born rule section)
- Core: `core/theorems/THM_0494_born_rule.md`

---

### C5: Black Hole De-Crystallization

**Classification**: Reverse | Astrophysical | All channels (R-dominant) | Potential-driven

**Before -> After**:
- Physical: Normal spacetime (epsilon = epsilon*) -> epsilon -> 0 at singularity (structure dissolves)
- Mathematical: epsilon(r) transitions from epsilon* (far) to 0 (center)

**Mechanism**:
- Gravity concentrates energy; tilt gradient steepens near mass
- Horizon: inside and outside become perfectly orthogonal (<inside|outside> = 0)
- Interior: epsilon decreases toward 0 (de-crystallization, reverse of Big Bang)
- Singularity: epsilon = 0, no distinctions — not infinite density but absence of structure
- epsilon field is too massive (m_tilt ~ 2.1 x 10^16 GeV) to deviate from epsilon* at astrophysical scales — deviations only at r ~ 70 L_Pl
- Critical mass: M_crit = M_Pl/(2 alpha) ~ 68 M_Pl, with r_crit = 137 L_Pl = L_Pl/alpha

**Key Equations**:
```
epsilon(r) = epsilon* [1 - O(exp(-m r))]        [stiff field profile]
M_crit / M_Pl = 1/(2 alpha) = 137/2             [critical mass]
r_crit = 2 M_crit = 1/alpha L_Pl = 137 L_Pl     [critical radius]
S_BH = A / (n_d L_Pl^2) = A / (4 L_Pl^2)       [entropy, n_d = 4]
T_H = 1/(C n_d pi G M)                           [Hawking temperature]
```

**Physical Signatures**:

| Observable | Predicted | Measured | Error |
|------------|-----------|----------|-------|
| S = A/4 (n_d = 4) | A/(4 L_Pl^2) | Standard result | 0% |
| T_H (C=2, n_d=4) | Standard Hawking | Standard result | 0% |
| No GW echoes | R ~ exp(-10^37) = 0 | Non-detection (LIGO) | Consistent |
| Critical radius | 137 L_Pl | (Planck-scale, untestable) | — |

**Verification**:

| Script | Tests | Status |
|--------|-------|--------|
| `bh_information_paradox_resolution.py` | 10/10 | ALL PASS |
| `bh_dimensional_crystallization.py` | 11/11 | ALL PASS |
| `bh_entropy_microscopic.py` | 9/9 | ALL PASS |
| `bekenstein_hawking_factor.py` | 7/7 | ALL PASS |
| `casimir_completeness_audit.py` (echo section) | 23/23 | ALL PASS |

**Dependencies**:
- Requires: C1 (crystallization provides the structure being reversed), C3 (epsilon dynamics)
- Enables: Evaporation endpoint (epsilon = 0 unstable -> re-nucleation, white-hole-like burst)
- Related: C1 (exact reverse — Big Bang is nucleation, BH is de-crystallization)

**Confidence & Gaps**:
- Status: [CONJECTURE] with [DERIVATION] elements for factor identifications (S, T_H)
- Chain: [D: epsilon -> 0 at center from AXM_0117] -> [D: horizon = orthogonality boundary] -> [I: Schwarzschild metric] -> [D: factor identifications C=2, n_d=4]
- Open: Exact epsilon(r) profile at Planck scales; microscopic entropy counting; merger dynamics
- Falsification: Detection of GW echoes with tilt-barrier characteristics; S_BH != A/4

**Cross-References**:
- Investigation: `spacetime/black_holes_crystallization.md`
- Sub-catalog: `crystallization_processes/astrophysical/compact_objects.md` (BH formation process entry)
- Sub-catalog: `crystallization_processes/astrophysical/stellar_processes.md` (core-collapse SN -> C5)
- Sub-catalog: `crystallization_processes/astrophysical/high_energy_astrophysics.md` (AGN jets, GRBs — C5 in accretion/collapse)

---

### C6: Channel-Specific Forces (Casimir / QCD Confinement)

**Classification**: Forward | Particle-to-Astrophysical | C or O (channel-specific) | Boundary-induced

**Before -> After**:
- Physical: Vacuum with unrestricted tilt fluctuations -> reduced modes between boundaries
- Mathematical: Boundary conditions restrict epsilon fluctuation spectrum in specific channels

**Mechanism**:
- Conducting plates enforce C-channel (EM) orthogonality at surface
- Between plates: fewer allowed tilt fluctuation modes -> lower vacuum energy -> attractive force
- Same mechanism in O-channel: color sources (quarks) restrict gluonic modes -> QCD string tension
- 16 total tilt DOF decompose as: 4 massive diagonal + 12 off-diagonal (gauge-like)
- At macroscopic distances, only C-channel (2 modes = dim(C)) contributes
- Full-to-EM Casimir ratio = n_d^2 / dim(C) = 16/2 = 8 = dim(O)
- Beta coefficient decomposition (S163): All 3 SM one-loop beta coefficients = framework numbers exactly: b₀(SU(3), N_f=6) = Im_O = 7, b₁(SU(3)) = 153 = Im_H² × 17, two-loop pure glue 33 = Im_H × n_c. Zero free parameters.

**Key Equations**:
```
F/A = -pi^2 / (240 a^4)                        [standard Casimir, 2 EM modes]
dim(O)/dim(C) = 8/2 = 4 = n_d                  [O-to-C mode ratio]
V_Luscher(r) = -pi C / (O Im_H r) = -pi/(24r)  [QCD Luscher term]
24 = O x Im_H = n_d!                            [unique to n_d = 4]
n_d^2 + n_c^2 = 16 + 121 = 137                 [total Hermitian dimension]
b_0(SU(3), N_f=6) = Im_O = 7                    [one-loop beta, exact]
b_1(SU(3)) = 153 = Im_H^2 * 17                  [two-loop beta, exact]
33 = Im_H * n_c                                  [pure glue contribution]
```

**Physical Signatures**:

| Observable | Predicted | Measured | Error |
|------------|-----------|----------|-------|
| Casimir force | Standard (no modification) | Confirmed | 0% |
| O/C mode ratio = 4 | 4 | 8 gluons / 2 photon pol. | Exact |
| Luscher 1/24 | pi/(O Im_H) | Standard QFT result | Exact |
| sqrt(sigma) = 8 m_p/17 | 441.5 MeV | ~440 MeV | 0.35% [CONJECTURE, HRS=6] |
| No GW echoes | R = 0 | LIGO non-detection | Consistent |
| b₀(SU(3), N_f=6) | 7 = Im_O | 7 (exact) | 0% |
| b₁(SU(3)) | 153 = Im_H² × 17 | 153 (exact) | 0% |
| sin²θ_W(eff) | 28/121 = 0.23140 | 0.23153 ± 0.00016 | -0.78σ |

**Verification**:

| Script | Tests | Status |
|--------|-------|--------|
| `casimir_tilt_mode_decomposition.py` | 12/12 | ALL PASS |
| `casimir_deeper_E1_E2_E3.py` | 14/14 | ALL PASS |
| `casimir_completeness_audit.py` | 23/23 | ALL PASS |
| `qcd_string_tension_from_framework.py` | 18/18 | ALL PASS |
| `qcd_string_tension_derivation.py` | 12/12 | ALL PASS |
| `tilt_dynamics_beta_functions.py` | 17/18 | PASS (1 diagnostic) |
| `z_branching_crystallization.py` | 18/20 | PASS (2 diagnostic) |
| `z_boson_couplings_crystallization.py` | — | PASS |

**Dependencies**:
- Requires: C3 (Mexican hat potential determines vacuum fluctuations), AXM_0117
- Enables: C8 (photon emission involves C-channel tilt modes)
- Related: C5 (BH horizon as crystallization boundary shares mechanism), C2 (gauge structure determines channels)

**Confidence & Gaps**:
- Status: [DERIVATION] for mode counting and Casimir interpretation; [DERIVATION] for beta coefficients (exact, zero free parameters, S163); [CONJECTURE] for QCD string tension formula
- Chain: [A: AXM_0117] -> [D: boundary restricts tilt modes] -> [D: fewer modes = lower energy] -> [I: zeta regularization] -> [D: standard Casimir]; independently: [D: tilt mode counting] -> [D: b₀ = Im_O, b₁ = Im_H² × 17]
- Resolved (S163): Beta coefficients = framework numbers exactly (one-loop A-, zero params)
- Open: Cross-channel Casimir effects; QCD string tension from first principles; n_c/Im_H gauge self-coupling mechanism (HIGH gap); 240 = 16 x 15 connection to zeta(-3) is likely numerological
- Falsification: Observation of non-standard Casimir behavior at macroscopic distances

**Cross-References**:
- Investigation: `quantum/casimir_crystallization_pressure.md`
- Investigation: `gauge/qcd_string_tension_o_channel.md`
- Investigation: `crystallization/collider_data_validation.md` (Phase I: Z-pole; Phase III: beta coefficients)

---

### C7: Cosmological Phase Transitions

**Classification**: Forward | Cosmological | All -> sequential activation | Potential-driven

**Before -> After**:
- Physical: Post-inflation universe with all symmetries -> sequential symmetry breaking epochs (EW, QCD, BBN, recombination)
- Mathematical: phi rolling through potential V(phi); g(phi) decreasing from ~1 toward 0

**Mechanism**:
- After C1 (inflation) ends, the universe proceeds through standard cosmological phases
- Each phase transition corresponds to a change in the active crystallization channels
- The hilltop potential determines the inflationary observables; standard physics governs subsequent epochs
- EWSB (T ~ 160 GeV): Composite Higgs on Gr(4,11) with xi = 4/121, sin^2(theta_W) = 28/121 — framework's strongest phase transition content
- QCD transition (T ~ 156.5 MeV): Crossover for N_c = Im_H = 3, N_f = 2+1; T_c not derived (gap)
- BBN (T ~ 0.07-0.8 MeV): Neutron freeze-out with N_nu = Im_H = 3 in g_* = 10.75; Y_p ~ 0.247
- CMB imprinted at phi_CMB = mu/sqrt(6), where g(phi_CMB) = 5/6
- Sound horizon, acoustic peaks, Silk damping follow from standard physics with framework initial conditions

**Key Equations**:
```
g(phi_CMB) = 5/6                                [crystallization state at CMB]
Omega_Lambda = 137/200 = 0.685                   [dark energy density, CONJECTURE]
n_s = 1 - 6 epsilon_sr + 2 eta = 193/200        [from C1 potential]
l_A = pi D_A / r_s                               [acoustic scale]
xi = n_d/n_c^2 = 4/121                          [EWSB misalignment, CONJECTURE]
sin^2(theta_W) = n_d*Im_O/n_c^2 = 28/121       [Weinberg angle, DERIVATION]
g_*(T_f) = 10.75                                 [BBN radiation DOF, with N_nu = Im_H = 3]
```

**Physical Signatures**:

| Observable | Predicted | Measured | Error |
|------------|-----------|----------|-------|
| Omega_Lambda | 0.685 | 0.685 +/- 0.007 | < 1 sigma |
| n_s | 0.965 | 0.9649 +/- 0.0042 | < 1 sigma |
| sin^2 theta_W (tree from Gr(4,11)) | 28/121 = 0.23140 | 0.23122 | 0.08% |
| kappa_V (Higgs coupling) | sqrt(117/121) = 0.9834 | 1.00(2) | Consistent |
| N_eff (neutrino families) | Im_H = 3 | 2.99(17) | < 1 sigma |
| Y_p (primordial He-4) | ~0.247 (via N_nu = 3) | 0.245(4) | ~1% |
| l₂ (2nd acoustic peak) | phi_odd = 3/11 = 0.2727 | ~0.273 | ~0.4% |
| Omega_Lambda (CC sign) | V(eps*) < 0 → Λ > 0 | Λ > 0 | **F-10: RESOLVED S230** (sign convention error; magnitude gap remains) |

**Verification**:

| Script | Tests | Status |
|--------|-------|--------|
| `phase_transition_crystallization.py` | 16/16 | ALL PASS |
| `acoustic_oscillation_physics.py` | — | PASS |
| `acoustic_peaks_from_l_A.py` | — | PASS |
| `full_power_spectrum.py` | — | PASS |
| `weinberg_angle_investigation.py` | — | PASS |
| `peak_height_physics.py` | — | PASS |
| `rs_derivation_from_framework.py` | — | PASS |
| `cosmological_constant_sign_analysis.py` | — | PASS |

**Dependencies**:
- Requires: C1 (sets initial conditions), C2 (determines which symmetries break)
- Enables: C9 (mass spectrum freezes out during phase transitions)
- Related: C3 (g(phi) tracks crystallization state through all epochs), C10 (weak decays during BBN)

**Sub-Catalogs** (Phase 4, S229):
- `crystallization_processes/phase_transitions/ewsb_detailed.md` — 4 processes: EWSB, Higgs mechanism, W/Z mass, fermion mass. 1 [FRAMEWORK-DERIVED] + 3 [FRAMEWORK-CONSTRAINED].
- `crystallization_processes/phase_transitions/qcd_phase_diagram.md` — 4 processes: confinement crossover, QGP, chiral restoration, color SC. 4/4 [STANDARD-RELABELED].
- `crystallization_processes/phase_transitions/bbn_nucleosynthesis.md` — 4 processes: n freeze-out, D bottleneck, He-4, Li-7. 2 [FRAMEWORK-CONSTRAINED] + 2 [STANDARD-RELABELED].

**Confidence & Gaps**:
- Status: [ACTIVE] — framework provides initial conditions and EWSB structure but standard physics governs evolution
- Chain: [D: C1 sets n_s, r] -> [I: standard cosmology evolution] -> [D: CMB predictions with framework ICs]
- Chain (EWSB): [D: C2 coset Gr(4,11)] -> [D/CONJ: xi = 4/121] -> [D: sin^2 = 28/121, kappa_V = sqrt(117/121)]
- Chain (BBN): [D: N_nu = Im_H = 3] -> [I: standard BBN] -> [D: g_* = 10.75, Y_p ~ 0.247]
- Resolved (S199): l₂ second acoustic peak explained via baryon loading with phi_odd = 3/11 (0.4% accuracy)
- ~~Falsified (S199): CC from V(ε*)~~ → **RESOLVED S230**: Sign convention error. V(ε*)<0 gives Λ>0 via standard GR (Λ=-8πGV). Magnitude gap (~10^111) remains.
- Falsified (S198): η* = 337 Mpc (actual 280 Mpc); c_s = 3/7 (actual 1/√3)
- Open: T_c(QCD) not derived; Peak heights not fully derived; Silk damping scale proposed but not verified; baryon-to-photon ratio not derived; Ω_m mechanism unknown; V₀ not derived; lithium problem unaddressed
- Falsification: n_s measured outside 0.965 +/- 0.01; r measured inconsistent with 0.035; kappa_V measured > 0.99 at >3 sigma kills xi = 4/121

**Sub-Catalogs** (Phase 6, S234):
- `crystallization_processes/cosmological/dark_sector.md` — 3 processes: DM interactions, dark energy (Lambda sign resolved S230, magnitude gap remains), void structure. Lambda sign resolution (F-10) documented.
- `crystallization_processes/cosmological/cmb_detailed.md` — 3 processes: primary anisotropies (n_s, l_2, N_eff), secondary anisotropies (ISW, lensing, SZ), spectral distortions.

**Sub-Catalogs** (Phase 7b2, S239):
- `crystallization_processes/phase_transitions/recombination_and_reionization.md` — 3 processes: hydrogen recombination (z_rec~1090), cosmic dawn/reionization, Saha equation. 2 [FRAMEWORK-CONSTRAINED] + 1 [STANDARD-RELABELED].
- `crystallization_processes/phase_transitions/baryogenesis.md` — 4 processes: Sakharov conditions, EW baryogenesis, leptogenesis, baryon asymmetry eta. 0 [FRAMEWORK-CONSTRAINED] + 4 [STANDARD-RELABELED].
- `crystallization_processes/cosmological/inflation_detailed.md` — C1 inflationary epoch expanded with reheating and perturbation spectrum.

**Cross-References**:
- Sub-catalogs: `crystallization_processes/phase_transitions/` (3 files, 12 processes)
- Sub-catalogs: `crystallization_processes/cosmological/` (4 files, 13 processes — Phase 6)
- Investigation: `cosmology/` directory (18+ files)
- Investigation: `cosmology/hilltop_inflation_canonical.md`
- Investigation: `cosmology/cmb_framework_interpretation.md`
- Investigation: `crystallization/symmetry_breaking_chain.md` (EWSB chain)
- Sessions: S175 (EWSB Goldstones), S210 (predictions), S212 (spinorial), S229 (Phase 4 catalog), S234 (Phase 6 cosmological)

---

### C8: Dynamic Emission (Photon as Crystallization Event)

**Classification**: Forward | Quantum/Particle | C-channel (EM) | Emission

**Before -> After**:
- Physical: Excited state (higher tilt) -> ground state (lower tilt) + photon
- Mathematical: System sheds excess tilt energy through C-localized interface channel

**Mechanism**:
- System in higher-tilt configuration crystallizes to lower-tilt state
- Excess tilt energy exits through one of 137 = n_d^2 + n_c^2 interface modes
- Probability of C-channel (EM) exit = 1/N_I = 1/137 = alpha (Born rule on interface modes)
- Each QED vertex = one crystallization step; vertex factor sqrt(alpha) = 1/sqrt(N_I)
- The VEV (ground state) breaks symmetry, but excitations above it can be democratic — this resolves DE-009 obstruction (S148)
- Five independent arguments for democracy: Born rule amplitude, maximum entropy, generic perturbation projection, excitation-vs-VEV distinction, U(n_d)×U(n_c) transitivity
- Naturally selects Gaussian QED conventions (algebraic mode counting, no geometric 4pi factor)

**Key Equations**:
```
alpha = 1/N_I = 1/(n_d^2 + n_c^2) = 1/137     [coupling as branching fraction]
P(C-channel) = 1/N_I                             [Born rule on interface modes]
alpha(Q=0) = 111/15211                            [with 4/111 correction, THM_0496]
vertex factor = sqrt(alpha) = 1/sqrt(N_I)        [QED correspondence]
```

**Physical Signatures**:

| Observable | Predicted | Measured | Error |
|------------|-----------|----------|-------|
| alpha^-1 (integer part) | 137 = N_I | 137 | Exact |
| alpha(Thomson) | 111/15211 | 1/137.036... | ~0.3 ppm |
| Schwinger a_e | alpha/(2pi) | Standard QED | Consistent |

**Verification**:

| Script | Tests | Status |
|--------|-------|--------|
| `crystallization_qed_correspondence.py` | 19/19 | ALL PASS |
| `crystallization_convention_analysis.py` | 14/14 | ALL PASS |
| `emission_vertex_correspondence.py` | — | PASS |

**Dependencies**:
- Requires: C4 (Born rule provides the selection mechanism), C3 (tilt dynamics), THM_0496 (equal distribution)
- Enables: Perturbative QED structure (alpha^n expansion from sequential crystallization steps)
- Related: C6 (same interface modes; Casimir is vacuum version, emission is excitation version)

**Confidence & Gaps**:
- Status: [DERIVATION] for 1/N_I mechanism with five independent democracy arguments; [CONJECTURE] for vertex-crystallization formal correspondence
- Chain: [D: THM_0494 Born rule] -> [D: democratic excitations above broken VEV (5 arguments)] -> [D: P(EM) = 1/N_I] -> [CONJECTURE: vertex = crystallization step]
- Resolved (S148/S187): DE-009 obstruction resolved via excitation-vs-VEV distinction; step 5 grade D+ → C- (five independent arguments, Gaussian convention)
- Open: Formal QED vertex ↔ crystallization step correspondence; strong coupling fit (alpha_s runs from 1/137 to ~1); real physical processes have specific excitation structure vs "generic" assumption
- Falsification: If specific transitions have strongly non-democratic channel preferences

**Cross-References**:
- Investigation: `quantum/photon_emission_crystallization.md`
- Investigation: `alpha/ALPHA_DERIVATION_MASTER.md`
- Investigation: `alpha/mode_sector_decomposition.md`

---

### C9: Particle Mass Freezing

**Classification**: Static | Particle | Mixed channels | Symmetry-breaking

**Before -> After**:
- Physical: Massless particles in symmetric phase -> massive particles after crystallization
- Mathematical: Specific eigenvalue pattern of epsilon_ij locks in, determining mass spectrum

**Mechanism**:
- During C2 (symmetry breaking), the tilt matrix settles into a definite eigenvalue configuration
- The (3,1) partition of eigenvalues gives stabilizer U(3) x U(1), containing SU(3) (color)
- Particle masses are "frozen" values of tilt components after crystallization completes
- Mass hierarchy from alpha-suppressed perturbation series: m_tilt ~ alpha^(3/2) M_Pl at GUT scale
- Three generations from three imaginary directions of H (quaternionic structure)
- 15 fermions per generation = 1 + 2 + 4 + 8 (division algebra dimensions)
- Phase 4 audit pattern (S188-190): structural relationships [DERIVATION], numerical values [CONJECTURE]
- Mass formula pattern: main terms discovered post-hoc [CONJECTURE], correction terms from Lie algebra channels [DERIVATION]

**Key Equations**:
```
15 = R + C + H + O = 1 + 2 + 4 + 8             [fermions per generation]
3 generations from Im(H) = {i, j, k}             [quaternionic structure]
m_tilt ~ 2 sqrt(2) alpha^(3/2) M_Pl ~ 2.1e16 GeV  [tilt field mass]
m_tilt(phi) = m_tilt(0) sqrt(g(phi))              [mass evolves with crystallization]
m_p/m_e = 12 * 153 + 11/72 = 1836 + 11/72        [main term [CONJECTURE] + correction [DERIVATION]]
y_t = 1 - 1/n_c^2 = 120/121                     [top Yukawa, 145 ppm]
Koide Q = 2/3                                     [algebraically forced, [DERIVATION]]
```

**Physical Signatures**:

| Observable | Predicted | Measured | Error |
|------------|-----------|----------|-------|
| Fermions/generation | 15 | 15 | 0% |
| Number of forces | 4 | 4 | 0% |
| Number of generations | 3 (from Im_H) | 3 | 0% |
| No 5th force | Frobenius theorem | Not observed | Consistent |
| m_p/m_e correction 11/72 | 1836.118 | 1836.153 | 19 ppm |
| y_t = 120/121 | 0.9917 | 0.9916 | 145 ppm |
| Koide Q | 2/3 | 2/3 (by construction) | Exact |
| m_H = v·121/238 | 125.22 GeV | 125.25 GeV | 0.057% |

**Verification**:

| Script | Tests | Status |
|--------|-------|--------|
| `crystallization_mass_spectrum.py` | 10/10 | ALL PASS |
| `higgs_mass_canonical_selection.py` | — | PASS |
| `proton_electron_ratio_audit.py` | — | PASS |
| `higgs_branching_tilt_coupling.py` | 14/15 | PASS (1 diag) |

**Dependencies**:
- Requires: C2 (symmetry breaking establishes gauge structure), C3 (tilt dynamics determine mass scale)
- Enables: All particle physics observables
- Related: C7 (masses freeze during cosmological phase transitions), C8 (emission from mass states)

**Confidence & Gaps**:
- Status: [CONJECTURE] for specific mass values (discovered post-hoc); [DERIVATION] for structural counting (15/gen, 3 gen, 4 forces) and correction terms (11/72 from Lie algebra channels)
- Chain: [D: C2 gives gauge structure] -> [D: 15 = sum of div alg dims] -> [CONJECTURE: 3 generations from Im(H)] -> [CONJECTURE: specific mass formulas from number search, then justified]
- Phase 4 audit (S188-190): m_p/m_e main term [CONJECTURE], Higgs canonical path B+, top Yukawa reasonable, Koide Q=2/3 [DERIVATION], CKM/PMNS all [CONJECTURE], theta_QCD downgraded (wrong mechanism)
- Open: Individual particle masses (main terms are post-hoc); mass hierarchy mechanism; CKM/PMNS mixing angles from crystallization; WHY y_t = 1 - 1/n_c²
- Falsification: Discovery of a 4th generation; fermion count != 15

**Cross-References**:
- Core: `framework/layer_1_crystallization.md` (Parts VI-VII)
- Investigation: `particles/` directory
- Investigation: `crystallization/collider_data_validation.md` (Phase IV)

---

### C10: Weak Decay (Flavor-Changing Crystallization)

**Classification**: Forward | Particle | H-channel | Emission

**Before -> After**:
- Physical: Parent particle -> daughter(s) via W/Z boson (flavor change or neutral current)
- Tilt: H-channel generation transition; tilt excess exits through weak + EM channels

**Mechanism**:
- The three Im(H) directions correspond to three generations [CONJECTURE]
- Flavor-changing processes (charged current) are transitions between Im(H) directions via W
- Neutral current processes (Z decay) couple to all flavors with sin²θ_W = 28/121 [DERIVATION]
- CKM matrix encodes the misalignment between mass and weak eigenstates [A-IMPORT]
- Each weak vertex involves H-channel tilt redistribution
- Distinct from C8 (EM emission): C10 changes particle identity (flavor) or involves weak coupling, C8 does not

**Key Equations**:
```
Im(H) = {i, j, k} -> 3 generation directions              [A: from H structure]
V_CKM: 3x3 unitary rotation (3 angles + 1 CP phase)       [A-IMPORT values]
sin^2(theta_W) = 28/121 = N_Goldstone / n_c^2              [DERIVATION]
g_V^f = T3^f - 2 Q^f sin^2(theta_W)                        [DERIVATION for sin^2]
G_F = g^2 / (4 sqrt(2) m_W^2)                              [A-IMPORT]
```

**Mode Counting**:
- W decay: Im_H + 2×N_c = 3 + 6 = 9 channels [FRAMEWORK-CONSTRAINED]
- Z decay: 11 fermion species × (g_V² + g_A²), testing sin²θ_W = 28/121
- Tau decay: R_τ = N_c × (1 + QCD corrections) ≈ 3.5 [FRAMEWORK-CONSTRAINED]

**Physical Signatures**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| 3 generations | Im(H) = 3 | 3 | 0% | [CONJECTURE] |
| CKM: 3x3 unitary | From Im(H) = 3 | Confirmed | < 0.1% | PDG |
| CKM elements | Not derived | See pdg_couplings.md | — | Gap |
| W channels | 9 = Im_H + 2N_c | 9 confirmed | 0% | [FRAMEWORK-CONSTRAINED] |
| BR(W→lν) avg | 10.82% | 10.86(9)% | 0.4% | [FRAMEWORK-CONSTRAINED] |
| Γ_W (GeV) | 2.099 | 2.085(42) | +0.3σ | [FRAMEWORK-CONSTRAINED] |
| Z: sin²θ_W(eff) | 28/121 = 0.23140 | 0.23153(16) | −0.8σ | [DERIVATION] |
| Z: χ²/dof | 1.73 (18 obs) | — | — | [FRAMEWORK-CONSTRAINED] |
| R_τ (Born) | N_c = 3 | 3.64 (corrected) | — | [DERIVATION] |
| BR(τ→eνν) | 18.1% | 17.82% | 1.3% | [FRAMEWORK-CONSTRAINED] |
| N_ν from Z | Im_H = 3 | 2.984(8) | +2.0σ | [CONJECTURE] |

**Verification**: `weak_decay_mode_counting.py` (16/16 PASS), `w_branching_crystallization.py` (16/16 PASS), `z_branching_crystallization.py` (20/20 PASS), `z_boson_couplings_crystallization.py` (12/12 PASS)

**Sub-catalogs**:
- `crystallization_processes/decays/weak_decays.md` — neutron beta, muon, pion, kaon, tau
- `crystallization_processes/decays/electroweak_boson_decays.md` — Z/W/Higgs/top decays
- `crystallization_processes/decays/electromagnetic_decays.md` — pi0->gg (anomaly), radiative baryon decays, positronium annihilation
- `crystallization_processes/decays/nuclear_decays.md` — alpha decay, nuclear beta decay, gamma decay

**Dependencies**:
- Requires: C2 (gauge structure), C9 (mass eigenstates)
- Enables: Nuclear beta decay (C10 + C13), meson decays, collider physics
- Related: C8 (emission mechanism), C14 (neutrino sector)

**Confidence & Gaps**:
- Status: [FRAMEWORK-CONSTRAINED] for mode counting and Z couplings; [CONJECTURE] for generation-Im(H) mapping; [A-IMPORT] for individual rates
- **Strongest result**: Z branching with sin²θ_W = 28/121 (18/20 observables, 64 total tests across 4 scripts)
- **Biggest gap**: CKM matrix elements not derived from framework — this is the critical open problem for C10 to have full predictive content
- Open: CKM derivation from Im(H); CP violation mechanism; PMNS matrix
- Falsification: Discovery of 4th generation weak decay; sin²θ_W ≠ 28/121 at high precision

---

### C11: Pair Creation / Annihilation

**Classification**: Both (Forward + Reverse) | Particle | C-channel (or mixed) | Emission

**Before -> After**:
- Forward (creation): Energy/photons -> particle-antiparticle pair
- Reverse (annihilation): particle-antiparticle -> photons/energy
- Tilt: Reversible crystallization -- tilt structure created or dissolved in matched pairs

**Mechanism**:
- Creation: Sufficient energy concentrates tilt into matched (particle, antiparticle) configurations
- Annihilation: Matched tilt configurations cancel, releasing energy through interface modes
- CPT symmetry: Every tilt configuration has a conjugate (antiparticle = reflected tilt)
- Pair creation threshold = 2 m_particle (energy conservation)
- Distinct from C8 (single emission) and C10 (flavor change): C11 creates/destroys matter

**Key Equations**:
```
E_threshold = 2 m c^2                                   [A-IMPORT: kinematics]
sigma(e+e- -> mu+mu-) = 4pi alpha^2 / (3s)             [A-IMPORT: QED]
P(pair) involves 1/N_I = 1/137 per vertex               [from C8]
R = sigma(e+e- -> hadrons) / sigma(e+e- -> mu+mu-)
  = N_c * sum(Q_f^2)                                    [D: N_c = Im_H = 3]
  = {2, 10/3, 11/3, 5} for {3,4,5,6} active flavors
```

**Key Observables** (11):
1. e+e- -> mu+mu- point cross-section (alpha^2 = 1/137^2)
2. R-ratio step structure at quark thresholds (N_c = Im_H = 3)
3. R(3 flav) = 2 (u,d,s)
4. R(4 flav) = 10/3 (u,d,s,c)
5. R(5 flav) = 11/3 (u,d,s,c,b)
6. R(6 flav) = 5 (all quarks)
7. QCD correction via b_0 = Im_O = 7 (N_f=6)
8. Drell-Yan 1/N_c color averaging
9. DIS Gross-Llewellyn Smith sum rule (integral = N_c)
10. C_A/C_F = 9/4 from 4-jet events (N_c = 3)
11. Z-pole pair processes: A_FB encodes sin^2 = 28/121

**Verification**: `r_ratio_crystallization.py` (15/15 PASS)

**Sub-catalog**: Process-level detail in:
- `crystallization_processes/scattering/electromagnetic_scattering.md` (5 processes: Compton, Bhabha, Moller, pair production, Thomson/Rayleigh)
- `crystallization_processes/scattering/strong_scattering.md` (4 processes: R-ratio, DIS, Drell-Yan, jets)
- `crystallization_processes/scattering/weak_scattering.md` (4 processes: neutrino CC/NC, inverse beta decay, CEvNS)
- `crystallization_processes/scattering/gravitational_scattering.md` (4 processes: lensing, perihelion precession, Shapiro delay, frame dragging)

**Dependencies**:
- Requires: C8 (coupling strength), C4 (Born rule for branching), C2 (N_c = 3 from SU(3))
- Enables: Baryogenesis (C16), collider processes, R-ratio measurement
- Related: C8 (shared vertex structure), C10 (can involve flavor), C12 (hadronization of qq pairs)

**Confidence & Gaps**:
- Status: [FRAMEWORK-CONSTRAINED] for R-ratio and color-factor processes (N_c = Im_H derived); [STANDARD-RELABELED] for individual EM scattering cross-sections
- Key result: R = N_c * sum(Q_f^2) matches all 4 energy regimes with NLO corrections
- Open: Quark charges Q_f remain [A-IMPORT]; total cross-sections are standard QED/QCD
- Falsification: R-ratio incompatible with N_c = 3; free quarks observed

---

### C12: Hadronization & Confinement

**Classification**: Forward | Particle | O-channel | Boundary-induced

**Before -> After**:
- Physical: Free quarks/gluons -> color-singlet hadrons (mesons, baryons)
- Tilt: O-channel tilt concentrates into confined bound states; color neutralization

**Mechanism**:
- O-channel confinement: color charges cannot exist in isolation (string tension ~ sigma)
- As quarks separate, O-channel tilt energy grows linearly (string formation)
- At sufficient energy, string breaks -> new q-qbar pair -> hadron formation
- Fragmentation: high-energy parton -> cascade of hadrons (jet)
- Distinct from C6 (static force): C12 is the dynamic process of hadron formation

**Key Equations**:
```
V_conf(r) = sigma * r                                   [A-IMPORT: linear potential]
sqrt(sigma) ~ 8 m_p / 17 = 441.5 MeV                   [CONJECTURE, HRS=6]
N_c = 3 from SU(3) [D: from C2 eigenvalue selection]
Hadron = color singlet (1 representation of SU(3))       [A-IMPORT]
Meson = q + qbar: 3 x 3bar = 1 + 8 (singlet extracted)
Baryon = q^3: epsilon_{abc} contracts N_c = 3 indices -> singlet
C_F = (N_c^2-1)/(2*N_c) = 4/3 [D: Cornell potential coefficient]
```

**Observables** (6 key quantities):

| Observable | Framework | Measured | Status |
|-----------|-----------|----------|--------|
| N_c (colors) | Im_H = 3 [DERIVATION] | 3 (LEP jets, anomaly) | Confirmed |
| sqrt(sigma) | 8*m_p/17 = 441.5 MeV [CONJECTURE] | 440(20) MeV | 0.4% |
| m_p/m_e | 12*153 + 11/72 = 1836.153 [CONJECTURE] | 1836.153 | 0.06 ppm |
| C_F (quark Casimir) | 4/3 [DERIVATION] | 1.35(7) | Confirmed |
| C_A/C_F | 9/4 = 2.25 [DERIVATION] | 2.23(10) | Confirmed |
| pi0->gg anomaly factor | N_c^2 = 9 [DERIVATION] | Confirmed | Confirmed |

**Verification**: `r_ratio_crystallization.py` (15/15 PASS), `hadron_mass_crystallization.py` (16/16 PASS)

**Sub-catalogs**:
- `crystallization_processes/bound_states/hadron_formation.md` (6 processes: pion, kaon, proton/neutron, Delta, J/psi, Upsilon)
- `crystallization_processes/bound_states/quarkonia_and_glueballs.md` (4 processes: charmonium spectrum, bottomonium spectrum, glueball spectrum, exotic quarkonia)

**Dependencies**:
- Requires: C2 (SU(3) gauge group), C6 (O-channel force law)
- Enables: All hadron physics, nuclear binding (C13)
- Related: C6 (same O-channel, static vs dynamic)

**Confidence & Gaps**:
- Status: [FRAMEWORK-CONSTRAINED] for N_c in color singlets and color factors; [STANDARD-RELABELED] for dynamics
- Open: Fragmentation functions from mode counting; hadron mass spectrum; string tension derivation (not just pattern match)
- Falsification: Free quarks observed; fractional charges in isolation; m_p/m_e prediction falsified

---

### C13: Nuclear Binding

**Classification**: Forward (Static) | Nuclear | Mixed (O + C + H) | Multi-channel

**Before -> After**:
- Physical: Free nucleons -> bound nucleus
- Tilt: Multi-channel short-range crystallization: O-channel (strong), C-channel (Coulomb), H-channel (beta stability)

**Mechanism**:
- Nuclear force: residual O-channel interaction between color-singlet nucleons
- Short-range: O-channel modes confined within ~ 1 fm
- Binding involves competition: O-channel attraction vs C-channel (Coulomb) repulsion
- H-channel (weak) determines beta stability (neutron-proton ratio)
- Distinct from C6/C12 (quark level): C13 operates at nucleon level with residual forces

**Key Equations**:
```
B(A,Z) = a_V A - a_S A^(2/3) - a_C Z^2/A^(1/3) - a_A (A-2Z)^2/A + delta
[A-IMPORT: Bethe-Weizsacker semi-empirical mass formula]
Channel decomposition: a_V (O), a_S (O boundary), a_C (C), a_A (H)
Magic numbers: 2=dim(C), 8=dim(O), 28=n_d*Im_O [SPECULATION]
```

**Observables** (4 key quantities):

| Observable | Framework | Measured | Status |
|-----------|-----------|----------|--------|
| SEMF channel labels | O/C/H mapping [RELABELED] | Standard | Labels only |
| B/A peak (Fe-56) | Not derived | 8.790 MeV | Gap |
| Magic numbers 2, 8, 28 | dim(C), dim(O), n_d*Im_O [SPECULATION] | Confirmed shell closures | 3/7 match |
| B(deuteron) | Not derived | 2.225 MeV | Gap |

**Verification**: `hadron_mass_crystallization.py` (16/16 PASS — SEMF channel check, binding energy comparisons, magic number coincidences)

**Sub-catalogs**:
- `crystallization_processes/bound_states/nuclear_binding.md` (4 processes: deuteron, helium-4, iron-56, magic numbers)
- `crystallization_processes/bound_states/atomic_structure.md` (4 processes: hydrogen, helium, positronium, Lamb shift — EM binding extension)
- `crystallization_processes/decays/nuclear_decays.md` (3 processes: alpha decay, nuclear beta decay, gamma decay)

**Dependencies**:
- Requires: C12 (nucleons as confined states), C6 (channel-specific forces)
- Enables: Nuclear decays, stellar processes, BBN (C7)
- Related: C10 (weak decay within nuclei), C8 (gamma emission)

**Confidence & Gaps**:
- Status: [STANDARD-RELABELED] — channel labeling of known nuclear physics
- Open: Magic numbers from division algebra dimensions (2, 8, 28 suggestive but [SPECULATION]); no binding energy predictions
- Falsification: Framework-specific nuclear prediction that fails

---

### C14: Neutrino Oscillation

**Classification**: Oscillatory | Particle | H-channel | Precession

**Before -> After**:
- Physical: Neutrino of flavor alpha -> detected as flavor beta (probability oscillates with distance)
- Tilt: H-channel flavor precession between Im(H) generation directions

**Mechanism**:
- Neutrino mass eigenstates differ from flavor eigenstates (PMNS matrix)
- Propagation: mass eigenstates evolve with different phases
- Detection: flavor projection gives oscillating probability
- Unique among types: inherently oscillatory (not forward or reverse)
- H-channel specific: only weak-interacting sector shows this effect
- Distinct from C10 (charged-current flavor change): C14 is neutral-current oscillation in vacuum

**Key Equations**:
```
P(nu_alpha -> nu_beta) = sum |U_ai|^2 |U_bi|^2 - 2 Re[...] cos(Delta m^2 L / 2E) + ...
[A-IMPORT: standard oscillation formula]
PMNS matrix U: rotation in Im(H) space                  [CONJECTURE]
3 mass eigenstates from 3 Im(H) directions              [CONJECTURE]
```

**Verification**: Needed (Phase 6: `neutrino_oscillation_h_channel.py`)

**Dependencies**:
- Requires: C9 (neutrino masses), C2 (generation structure from Im(H))
- Related: C10 (both involve H-channel generation physics)

**Confidence & Gaps**:
- Status: [STANDARD-RELABELED] for oscillation physics; [CONJECTURE] for Im(H) mapping
- Open: PMNS matrix from crystallization; mass hierarchy; Dirac vs Majorana nature
- Falsification: Sterile neutrino oscillation (4th direction beyond Im(H))

---

### C15: Gravitational Radiation

**Classification**: Forward | Astrophysical | R-channel | Emission

**Before -> After**:
- Physical: Accelerating mass -> gravitational wave emission; binary inspiral -> merger
- Tilt: R-channel tilt wave emission, analog of C8 (EM emission) in gravity sector

**Mechanism**:
- R-channel (spacetime/gravity) carries 16 = n_d^2 tilt DOF
- Accelerating mass distributions radiate R-channel tilt waves
- Quadrupole formula: lowest-order radiation (no monopole/dipole for gravity)
- Binary inspiral: continuous R-channel emission -> orbital decay -> merger
- Framework adds: R-channel mode counting (16 DOF, of which 2 physical polarizations for spin-2)
- Distinct from C8 (EM): C15 is R-channel, C8 is C-channel; different spin (2 vs 1)

**Key Equations**:
```
P_GW = (32/5) G^4 m_1^2 m_2^2 (m_1 + m_2) / (c^5 r^5)  [A-IMPORT: quadrupole]
R-channel DOF = n_d^2 = 16                                  [D: from Herm(n_d)]
Physical polarizations = 2 (spin-2 massless)                 [A-IMPORT: GR]
No GW echoes: R ~ exp(-m_tilt r_BH) ~ 0                    [DERIVATION]
```

**Verification**: `astrophysical_crystallization.py` (12/12 PASS — chirp mass, GW speed, r-value); echo prediction verified in `casimir_completeness_audit.py`

**Dependencies**:
- Requires: C3 (tilt dynamics in R-channel), C5 (BH as source)
- Related: C8 (EM emission = C-channel analog), C5 (BH mergers)

**Confidence & Gaps**:
- Status: [STANDARD-RELABELED] for GW physics; [DERIVATION] for echo non-detection
- Open: Ringdown QNMs from tilt dynamics; stochastic background from C1; r = 7/128 in tension with BICEP/Keck (r < 0.036)
- Falsification: Detection of GW echoes; graviton mass != 0; r confirmed < 0.04 (CMB-S4)

**Cross-References**:
- Sub-catalog: `crystallization_processes/astrophysical/gravitational_waves.md` (4 GW process entries)
- Sub-catalog: `crystallization_processes/astrophysical/compact_objects.md` (NS mergers, BH formation)
- Sub-catalog: `crystallization_processes/scattering/gravitational_scattering.md` (4 processes: lensing, precession, Shapiro delay, frame dragging)

---

### C16: Baryogenesis

**Classification**: Forward | Cosmological | Mixed (H + O + C) | Asymmetric

**Before -> After**:
- Physical: Symmetric matter-antimatter plasma -> baryon excess (eta ~ 6 x 10^-10)
- Tilt: Asymmetric crystallization producing net matter over antimatter

**Mechanism**:
- Sakharov conditions: (1) baryon number violation, (2) C and CP violation, (3) departure from equilibrium
- Framework mapping: (1) B-violation from tilt topology?, (2) CP from CKM phase in H-channel, (3) non-equilibrium from C7 phase transitions
- Distinct from all other types: irreversible asymmetry generation
- Currently the least developed type — mechanism is [SPECULATION]

**Key Equations**:
```
eta = n_B / n_gamma ~ 6.1 x 10^-10                      [A-IMPORT: observed]
Sakharov conditions: B-violation, C/CP-violation, non-eq  [A-IMPORT]
Framework: no specific prediction for eta                 Gap
```

**Verification**: Needed (Phase 5: future script)

**Sub-catalog**: `crystallization_processes/phase_transitions/baryogenesis.md` (4 processes: Sakharov conditions, EW baryogenesis, leptogenesis, baryon asymmetry eta. 4/4 [STANDARD-RELABELED])

**Dependencies**:
- Requires: C7 (non-equilibrium context), C10 (weak interactions), C11 (pair processes)
- Enables: All matter-dominated physics
- Related: C7 (occurs during cosmological phase transitions)

**Confidence & Gaps**:
- Status: [SPECULATION] — framework has no mechanism for eta
- Open: Everything (baryon number violation mechanism, CP violation magnitude, departure from equilibrium dynamics)
- Falsification: N/A (nothing predicted)

---

### C17: Structure Formation (Gravitational Clustering)

**Classification**: Forward | Cosmological | R-channel (dominant) + mixed | Potential-driven

**Before -> After**:
- Physical: Nearly uniform post-recombination matter -> galaxies, clusters, cosmic web
- Tilt: Large-scale forward crystallization in R-channel; gravitational potential wells deepen

**Mechanism**:
- Primordial density fluctuations (from C1 inflation) seed structure
- Gravitational instability (Jeans instability) amplifies R-channel tilt inhomogeneities
- Dark matter (if framework's 5.11 GeV prediction holds) provides scaffolding
- Baryon acoustic oscillations: frozen C7 sound waves in matter distribution
- Distinct from C1 (cosmic): C17 is post-recombination gravitational growth, not primordial nucleation

**Key Equations**:
```
delta_k(a) = delta_k(a_i) * D(a)                        [A-IMPORT: growth function]
P(k) = A_s k^(n_s) T^2(k)                              [A-IMPORT + D: n_s from C1]
sigma_8 = 0.8111(60)                                     [A-IMPORT: Planck]
BAO scale ~ r_s = 144.4 Mpc                             [D + I: from C7]
```

**Verification**: Needed (Phase 5: `structure_growth_framework.py`)

**Verification**:

| Script | Tests | Status |
|--------|-------|--------|
| `cosmological_crystallization.py` | 16/16 | ALL PASS |

**Dependencies**:
- Requires: C1 (initial perturbation spectrum), C7 (acoustic oscillations), dark matter
- Related: C15 (gravitational radiation from mergers)

**Sub-Catalogs** (Phase 6, S234):
- `crystallization_processes/cosmological/structure_formation.md` — 4 processes: gravitational instability, BAO (r_s), DM halo formation, galaxy formation. 2 [FRAMEWORK-CONSTRAINED] (BAO, DM halo) + 2 [STANDARD-RELABELED].
- `crystallization_processes/cosmological/dark_sector.md` — DM interactions, dark energy, void structure. DM mass formula discrepancy flagged (EQ-013).

**Confidence & Gaps**:
- Status: [FRAMEWORK-CONSTRAINED] for n_s input; [STANDARD-RELABELED] for growth dynamics
- Open: sigma_8 from framework; dark matter interaction cross-section (EQ-013); halo mass function; DM mass formula discrepancy (15.5 MeV vs claimed 5.11 GeV)
- Falsification: n_s measured far from 0.965; BAO scale inconsistent with r_s

**Cross-References**:
- Sub-catalogs: `crystallization_processes/cosmological/` (4 files, 13 processes — Phase 6)

---

## Part III: Composability Framework

### 3.1 Chain Notation

Crystallization types can be chained when one type's output state matches another's input conditions:

```
C_A ->[condition] C_B

means: Type A completes, producing a state satisfying [condition],
       which serves as the initial state for Type B.
```

### 3.2 Known Chains

| Chain | Sequence | Physical Process |
|-------|----------|-----------------|
| **Universe History** | C1 -> C2 -> C7 -> C3 (ongoing) | Big Bang -> symmetry breaking -> cosmological evolution -> current tilt dynamics |
| **Quantum Measurement** | C4 -> C8 | Collapse selects eigenstate -> excess tilt energy emitted as photon |
| **Entangled Measurement** | C4(shared) -> C4(local) -> C8 | Shared crystallization creates constraint -> local collapse reveals it -> emission |
| **Stellar Collapse** | C1 -> ... -> C5 | Forward crystallization -> local reversal at BH formation |
| **QCD Interaction** | C6(O) -> C8 -> C6(O) | O-channel confinement -> gluon emission/absorption -> re-confinement |
| **Particle Creation** | C7 -> C9 -> C8 | Phase transition -> mass freezing -> emission of excess |
| **EWSB** | C2(eigenvalue) -> C9 -> C8 | (3,1) partition selects gauge group -> masses freeze -> Higgs mechanism |
| **BH Evaporation** | C5 -> C1 (local) | De-crystallization -> epsilon = 0 unstable -> re-nucleation (white-hole burst) |
| **Collider Process** | C8(inject) -> C6(confine) -> C4(collapse) -> C8(emit) | Energy injection -> confinement dynamics -> state collapse -> particle emission |
| **Neutron Beta Decay** | C10(H) -> C4 -> C8(C) | Weak flavor change -> state collapse -> electron + photon emission |
| **Muon Decay** | C10(H) -> C4 -> C8(C) | Pure H-channel 3-body weak decay |
| **Pair Annihilation** | C11(reverse) -> C8(C) | Matter-antimatter cancel -> photon emission |
| **Pair Production** | C8(absorb) -> C11(forward) | Photon absorbed -> pair created above threshold |
| **Jet Formation** | C8(inject) -> C12(O) -> C9 | High-energy parton -> hadronization cascade -> stable hadrons |
| **Nuclear Fusion** | C13 + C10(H) + C8(C) | Nucleons bind (O-channel) + weak conversion + gamma emission |
| **Stellar Evolution** | C13 -> C8(C) -> C10(H) -> ... -> C5 or C13(NS) | Nuclear burning chain -> eventual collapse |
| **Solar pp Chain** | C10(H) -> C13 -> C8(C) -> C11 | Weak capture -> nuclear binding -> photon + pair emission |
| **Neutrino Propagation** | C10(H,source) -> C14(oscillation) -> C10(H,detect) | Weak production -> flavor precession -> weak detection |
| **Binary Inspiral** | C15(R) -> C5+C5 -> C5 + C15(ringdown) | GW emission -> merger -> final BH + ringdown radiation |
| **BBN** | C7 -> C10(H) -> C13 | Cosmological cooling -> weak freeze-out -> light element formation |
| **Recombination** | C7 -> C8(C,capture) -> C17 | Cosmological cooling -> electron capture -> structure formation begins |
| **Galaxy Formation** | C17(R) -> C13 -> C8(C) | Gravitational collapse -> star formation -> stellar emission |

### 3.3 Interface Conditions

For Type_A -> Type_B to be valid, the following must hold:

| Condition | Requirement | Example |
|-----------|-------------|---------|
| **Timescale separation** | tau_A << tau_B or tau_A >> tau_B | C4 (10^-36 s) << C7 (10^17 s) |
| **Channel compatibility** | B operates in channels available after A completes | C2 creates channels that C6 operates in |
| **Energy conservation** | delta-W tracked across transition | C8 emission carries exactly the tilt energy difference |
| **Goldstone accounting** | Broken generators from A are accounted for in B | C2 produces 41 Goldstones; C7 evolves within this structure |
| **epsilon continuity** | epsilon at end of A matches epsilon at start of B | C1 ends with epsilon ~ epsilon*; C3 continues from there |

### 3.4 Chain Documentation Template

When documenting a new chain:

```
Chain: C_X -> C_Y -> C_Z
Physical process: [description]
Interface X->Y:
  - epsilon state: [value/range]
  - Active channels: [list]
  - Energy budget: [delta-W]
  - Timescale: [tau]
Interface Y->Z:
  - [same fields]
Verification: [script reference or "needed"]
```

---

## Part IV: Master Indices

### 4.1 By Physical Scale

| Scale | Types | Key Observable |
|-------|-------|---------------|
| Planck (10^-35 m) | C4, C5 (near singularity) | Collapse timescale, BH critical radius |
| Particle (10^-18 m) | C6, C8, C9, C10, C11, C12, C14 | Casimir, alpha, particle masses, decays, oscillations |
| Nuclear (10^-15 m) | C6(O), C12, C13 | QCD string tension, confinement, nuclear binding |
| Astrophysical (>1 m) | C5, C13, C15 | BH entropy, Hawking temperature, GW emission |
| Cosmological (10^26 m) | C1, C2, C7, C16, C17 | n_s, r, Omega_Lambda, baryogenesis, structure |

### 4.2 By Observable

| Observable | Type(s) | Confidence |
|------------|---------|------------|
| n_s = 0.965 | C1, C7 | [DERIVATION] |
| r = 0.035 | C1 | [DERIVATION] |
| sin^2 theta_W = 1/4 (tree) | C2, C7 | [DERIVATION] |
| sin^2 theta_W(eff) = 28/121 | C6, C7 | [DERIVATION] |
| alpha = 1/137 | C8, C3 | [CONJECTURE] |
| Fermions = 15/gen | C9 | [DERIVATION] |
| S_BH = A/4 | C5 | [DERIVATION] |
| Born rule P = |c|^2 | C4 | [DERIVATION] (noise geometric) |
| Bell/CHSH = 2√2 | C4 | [THEOREM] |
| sqrt(sigma) ~ 441 MeV | C6(O) | [CONJECTURE, HRS=6] |
| Omega_Lambda = 0.685 | C7 | [CONJECTURE] |
| 4 forces | C2, C9 | [THEOREM] |
| Casimir F = -pi^2/(240 a^4) | C6(C) | [DERIVATION] |
| No GW echoes | C5, C6 | [DERIVATION] |
| b₀(SU(3)) = 7 = Im_O | C6 | [DERIVATION] |
| b₁(SU(3)) = 153 = Im_H²×17 | C6 | [DERIVATION] |
| l₂ (phi_odd = 3/11) | C7 | [DERIVATION] |
| CC sign from V(ε*) | C7 | **F-10: RESOLVED S230** (sign convention error) |

### 4.3 By Confidence Level

| Level | Types |
|-------|-------|
| **CANONICAL/THEOREM** | C2 (SO(11) chain, Frobenius results), C4 entanglement correlations (Bell/CHSH) |
| **DERIVATION** | C1 (n_s, r), C2 (eigenvalue selection), C3 (g(phi) unification), C4 (Born rule + geometric noise), C6 (mode counting + beta coefficients) |
| **CONJECTURE** | C5 (BH interpretation), C7 (Omega_Lambda), C8 (emission mechanism), C9 (mass freezing), C10 (generation mapping), C14 (PMNS from Im(H)) |
| **STANDARD-RELABELED** | C12 (hadronization dynamics), C13 (nuclear binding), C15 (GW physics), C17 (structure growth) |
| **FRAMEWORK-CONSTRAINED** (updated) | C11 (pair processes: R-ratio uses N_c = Im_H, b_0 = Im_O) |
| **SPECULATION** | C5 (evaporation endpoint), C6 (240 = 16 x 15 numerology), C16 (baryogenesis mechanism) |
| **FALSIFIED** | C7: η*=337, c_s=3/7 (F-10 CC sign RESOLVED S230) |

### 4.4 Verification Status

| Script | Type(s) | Tests | Status |
|--------|---------|-------|--------|
| `crystallization_ordering_SO11.py` | C2 | 15/15 | PASS |
| `quartic_energy_curvature.py` | C2 | 12/12 | PASS |
| `denominator_polynomial_unification.py` | C2 | 21/21 | PASS |
| `stage3_prime_selection_rule.py` | C2 | 9/9 | PASS |
| `intra_stage_ordering.py` | C2 | 12/12 | PASS |
| `born_rule_from_crystallization.py` | C4 | 12/12 | PASS |
| `crystallization_collapse_dynamics.py` | C3, C4 | 10/10 | PASS |
| `crystallization_ab_derivation.py` | C3 | 8/8 | PASS |
| `crystallization_mass_spectrum.py` | C3, C9 | 10/10 | PASS |
| `veff_landscape_tension.py` | C3 | 12/12 | PASS |
| `veff_resolution_b_constraint.py` | C3 | 10/10 | PASS |
| `crystallization_lagrangian.py` | C3 | 8/8 | PASS |
| `crystallization_order_parameter.py` | C3 | 6/6 | PASS |
| `casimir_tilt_mode_decomposition.py` | C6 | 12/12 | PASS |
| `casimir_deeper_E1_E2_E3.py` | C6 | 14/14 | PASS |
| `casimir_completeness_audit.py` | C5, C6 | 23/23 | PASS |
| `qcd_string_tension_from_framework.py` | C6 | 18/18 | PASS |
| `qcd_string_tension_derivation.py` | C6 | 12/12 | PASS |
| `bh_information_paradox_resolution.py` | C5 | 10/10 | PASS |
| `bh_dimensional_crystallization.py` | C5 | 11/11 | PASS |
| `bh_entropy_microscopic.py` | C5 | 9/9 | PASS |
| `bekenstein_hawking_factor.py` | C5 | 7/7 | PASS |
| `crystallization_qed_correspondence.py` | C8 | 19/19 | PASS |
| `crystallization_convention_analysis.py` | C8 | 14/14 | PASS |
| `lcdm_deviations_from_hilltop.py` | C1, C7 | 16/17 | PASS (1 fail) |
| `hilltop_correct_conditions.py` | C1 | 6/7 | PASS (1 fail) |
| `crystallization_inflation_connection.py` | C1 | 5/5 | PASS |

| `generalized_crystallization_pressure.py` | All (C1-C9) | 29/29 | PASS |
| `entanglement_bell_correlations.py` | C4 | 18/18 | PASS |
| `tensor_product_derivation.py` | C4 | 17/17 | PASS |
| `entanglement_deviation_predictions.py` | C4 | 10/10 | PASS |
| `singlet_from_crystallization.py` | C4, C6 | 12/12 | PASS |
| `multipartite_entanglement_crystal.py` | C4 | 11/11 | PASS |
| `entanglement_entropy_holography.py` | C4, C5 | 10/10 | PASS |
| `entanglement_philosophy_rigorous.py` | C4 | 13/13 | PASS |
| `wright_fisher_from_geometry.py` | C4 | 11/11 | PASS |
| `measurement_problem_resolution.py` | C4 | 11/11 | PASS |
| `eigenvalue_selection_sm_gauge.py` | C2 | 22/22 | PASS |
| `tilt_one_loop_mechanism.py` | C2, C3 | 15/15 | PASS |
| `colored_pngb_24_modes.py` | C2 | 28/28 | PASS |
| `coset_inconsistency_resolution.py` | C2 | 20/20 | PASS |
| `tilt_dynamics_beta_functions.py` | C6 | 17/18 | PASS (1 diag) |
| `z_branching_crystallization.py` | C6, C7 | 18/20 | PASS (2 diag) |
| `z_boson_couplings_crystallization.py` | C6, C7 | 12/12 | PASS |
| `weak_decay_mode_counting.py` | C10 | 16/16 | PASS |
| `w_branching_crystallization.py` | C10 | 16/16 | PASS |
| `r_ratio_crystallization.py` | C11, C12 | 15/15 | PASS |
| `higgs_branching_tilt_coupling.py` | C3, C9 | 14/15 | PASS (1 diag) |
| `peak_height_physics.py` | C7 | 15/15 | PASS |
| `rs_derivation_from_framework.py` | C7 | 13/14 | PASS (1 fail) |
| `cosmological_constant_sign_analysis.py` | C7 | 10/10 | PASS |
| `b2_nonzero_from_axioms.py` | C2 | 10/10 | PASS |
| `c3_positive_from_nd4.py` | C2 | 7/8 | PASS (1 fail: global min test, see note) |

| `hadron_mass_crystallization.py` | C12, C13 | 16/16 | PASS |
| `phase_transition_crystallization.py` | C2, C7 | 16/16 | PASS |
| `astrophysical_crystallization.py` | C5, C15 | 12/12 | PASS |
| `cosmological_crystallization.py` | C1, C7, C17 | 16/16 | PASS |

**Totals**: 58 scripts, 723 tests, 714 PASS (9 diagnostic/fail).

### 4.5 Gap Tracker

**CRITICAL** (blocks major predictions):

- [ ] Landau coefficients c_1, c_2 signs derived (c_1<0 from AXM_0114, c_2>0 from AXM_0113); c_3 sign now [DERIVATION] (see RESOLVED). Magnitudes still not derived from axioms (affects C2 energy selection)
- [ ] V_0 not derived (affects C1 amplitude A_s; currently imported)
- [ ] Individual particle masses not derived (C9)
- [ ] Peak heights in CMB not fully derived from framework (C7)

**HIGH** (significant derivation gaps):

- [ ] b₂ < 0 sign: b₂ ≠ 0 now [DERIVATION from AXM_0109] (S207, 10/10 PASS); sign b₂ < 0 remains [CONJECTURE with physical motivation] (C2 eigenvalue selection)
- [ ] n_c/Im_H as gauge self-coupling factor — mechanism unknown, investigated S207: pattern-matching only, would need first-principles vacuum polarization calc (C6, affects all beta coefficients)
- [ ] g(phi) quadratic form assumed, not derived (C3)
- [ ] Crystallization rate/timescale not derived from axioms (C3)
- [ ] QCD string tension formula sqrt(sigma) = 8 m_p/17 is pattern-matched, HRS=6 (C6)
- [ ] CKM/PMNS matrix elements not derived — biggest gap for C10 predictive content
- [ ] Ω_m mechanism unknown — no derivation from framework (C7)

**MEDIUM** (refinements needed):

- [ ] Basis selection mechanism in quantum measurement (C4)
- [ ] Cross-channel Casimir effects (C6)
- [ ] Exact epsilon(r) profile at Planck scale (C5)
- [ ] Baryon-to-photon ratio from framework (C7)
- [ ] Silk damping scale verification (C7)
- [ ] Holographic entanglement entropy connection to physical gravity (C4/C5)
- [ ] Confinement threshold T_c ~ 155 MeV from O-channel barrier (C6)

**RESOLVED** (since last update):

- [x] ~~c_3 > 0 not proven~~ — RESOLVED S207: c_3 ≠ 0 from AXM_0109 (degeneracy argument, 7/8 PASS); c_3 > 0 from n_d = 4 + dynamical curvature selection (quartic_energy_curvature.py 12/12 PASS). Scripts: `c3_positive_from_nd4.py`, `b2_nonzero_from_axioms.py`
- [x] ~~b₂ ≠ 0 not derived~~ — RESOLVED S207: b₂ = 0 gives degenerate minima on Herm(n_d), contradicting AXM_0109. Script: `b2_nonzero_from_axioms.py` (10/10 PASS)
- [x] ~~Noise structure in Born rule not derived from Layer 0~~ — RESOLVED S169: derived from Fubini-Study geometry (CR-035)
- [x] ~~l₂ second acoustic peak~~ — RESOLVED S199: baryon loading with phi_odd = 3/11 (0.4%)
- [x] ~~Coset space structure~~ — RESOLVED S195: Gr(4,11) gives 28 = 4(Higgs) + 24(pNGBs)

**FALSIFIED**:

- [x] ~~CC from V(ε*)~~ — ~~F-10: wrong sign (S199)~~ → **RESOLVED S230**: sign convention error
- [x] ~~η* = 337 Mpc~~ — actual 280 Mpc (S198)
- [x] ~~c_s = 3/7~~ — actual 1/√3 (S198)

---

## Part V: Relationships & Unifications

### 5.1 Type Relationship Map

```
C1 (Big Bang)
  |
  |--[inflation ends]--> C2 (Symmetry Breaking)
  |                        |
  |                        |--[gauge structure set]--> C7 (Cosmo Phases)
  |                        |                            |
  |                        |                            |--[masses freeze]--> C9 (Mass)
  |                        |                            |--[baryogenesis]---> C16 (Baryon Asymmetry)
  |                        |                            |--[recombination]--> C17 (Structure Formation)
  |                        |
  |                        |--[tilt structure set]----> C3 (Tilt Dynamics)
  |                                                      |
  |                                                      |--[fluctuation modes]--> C6 (Forces)
  |                                                      |      |
  |                                                      |      |--[O-channel dynamics]--> C12 (Hadronization)
  |                                                      |      |--[residual O-channel]--> C13 (Nuclear Binding)
  |                                                      |
  |                                                      |--[collapse mechanism]--> C4 (Collapse)
  |                                                      |                           |
  |                                                      |                           |--> C8 (EM Emission)
  |                                                      |                           |--> C10 (Weak Decay)
  |                                                      |                           |--> C11 (Pair Processes)
  |                                                      |
  |                                                      |--[H-channel precession]--> C14 (Neutrino Osc.)
  |
  |--[R-channel radiation]--> C15 (Gravitational Waves)
  |
  |--[REVERSE]---------> C5 (Black Holes)
                           |
                           |--[evaporation endpoint]--> C1 (local re-nucleation)
```

**Special relationships**:
- C1 and C5 are **reverses**: C1 is epsilon: 0 -> epsilon*, C5 is epsilon: epsilon* -> 0
- C3 is the **universal substrate**: its potential W governs C4, C6, C8, C9, C10-C15
- C4 and C8 are **sequential**: collapse (C4) produces the eigenstate from which emission (C8) occurs
- C6(C) and C6(O) are **parallel**: same mechanism in different channels (EM vs QCD)
- C2 and C9 are **coupled**: eigenvalue selection (C2) determines which masses freeze (C9)
- C4(shared) creates **entanglement**: non-factorizable constraints in V that persist across C4(local) collapses
- C6 and C8 share **interface modes**: Casimir (C6) is vacuum version, emission (C8) is excitation version of same 137-mode structure
- C8 and C10 are **channel siblings**: C8 is C-channel emission, C10 is H-channel flavor change
- C8 and C15 are **channel analogs**: C8 is C-channel (spin-1), C15 is R-channel (spin-2)
- C11 is **reversible**: forward = pair creation, reverse = pair annihilation
- C12 is **dynamic C6**: C6(O) is the static force, C12 is the process of forming bound states
- C13 is **residual C12**: nuclear binding from residual O-channel forces between color-singlets
- C14 is **oscillatory**: unique among types in not being forward/reverse/static
- C16 requires **C7 + C10**: baryogenesis needs non-equilibrium (C7) + CP violation (C10)
- C17 follows **C7**: structure formation begins after recombination, seeded by C1 fluctuations

### 5.2 g(phi) Unification

The function g(phi) = 1 - phi^2/mu^2 appears across four types simultaneously:

| Context | Type | Formula | Role |
|---------|------|---------|------|
| Inflation | C1 | V(phi) = V_0 g(phi) | Drives cosmic expansion |
| Tilt stability | C3 | W(epsilon,phi) = -a g(phi) epsilon^2 + b epsilon^4 | Controls Mexican hat |
| Spectral index | C7 | n_s from g''/g curvature | CMB temperature pattern |
| Decoherence rate | C4 | Gamma_dec = 4a g(phi) Gamma | Collapse timescale |

This is NOT four separate mechanisms using the same function by coincidence. It is ONE mathematical object that simultaneously controls whether the universe inflates, whether matter can exist, what CMB pattern we observe, and how fast quantum collapse occurs. Any correction to V(phi) automatically modifies all four.

**Key epochs of g**:
- g = 1: Pre-crystallization (all mechanisms at full strength)
- g = 5/6: CMB epoch (current cosmological imprint)
- g = 0: Crystallization complete (no Mexican hat, no matter, no collapse)
- g < 0: Post-crystallization (pure crystal, return to U)

### 5.3 Recurring Constants

| Constant | Value | Appearances |
|----------|-------|-------------|
| **24 = O x Im_H = n_d!** | 24 | Luscher term (C6), constituent mass ratio (C6), zeta regularization factor |
| **137 = n_d^2 + n_c^2** | 137 | Interface modes (C8), BH critical radius (C5), Hermitian dimension sum (C3) |
| **15 = R + C + H + O** | 15 | Fermions/generation (C9), total crystalline capacity (C2), Casimir 240=16x15 (C6) |
| **41 = total Goldstones** | 41 | SO(11) breaking (C2), denominator difference 194-153 (C2) |
| **28 = n_d x Im_O** | 28 | Stage 1 Goldstones (C2), SM boson DOF count (C6) |

### 5.4 N_I = 137 Mode Hierarchy

The 137 interface modes decompose by channel:

| Block | Count | Role |
|-------|-------|------|
| U(n_d) generators | n_d^2 = 16 | Spacetime/gravity (C5, C1) |
| U(n_c) generators | n_c^2 = 121 | Internal/gauge (C2, C6, C8) |
| **Total** | **137** | **All interface modes** |

Within U(n_c):
- n_c = 11 diagonal (Cartan) generators
- n_c(n_c - 1) = 110 off-diagonal generators
- After C2 breaking: 12 remain massless (SM gauge group), 125 become massive

### 5.5 Generalized Crystallization Pressure (Session 169)

**Confidence**: [CONJECTURE]

All nine crystallization types share a common pressure formula:

```
Pi_gen(channel, geometry) = f_ch * (-dW/deps) * Omega(geometry)
```

| Factor | Symbol | Meaning |
|--------|--------|---------|
| Channel weight | f_ch | Fraction of tilt DOF participating |
| Potential gradient | -dW/deps | Force from W(eps,phi) = -a g(phi)\|eps\|^2 + b\|eps\|^4 |
| Geometric factor | Omega | Boundary/scale factor (plates, horizon, volume, etc.) |

**Specialization table**:

| Type | f_ch | Omega | Counting |
|------|------|-------|----------|
| C1 | 1 (all) | Hubble volume | -- |
| C2 | stage-dep | 1 | -- |
| C3 | channel-dep | 1 (local) | 16-DOF |
| C4 | 1 (all) | 1 (local) | -- |
| C5 | 1/4 (R) | 1/r^2 | 16-DOF |
| C6 | dim(ch)/16 | 1/a^4 or 1/r | 16-DOF |
| C7 | epoch-dep | Hubble volume | -- |
| C8 | 1/137 | 1 (per vertex) | 137-mode |
| C9 | algebra-dep | 1 (per particle) | -- |

**Two counting schemes**: The 16-DOF scheme (Herm(n_d) tilt matrix) applies to structural dynamics (C3, C5, C6). The 137-mode scheme (N_I = n_d^2 + n_c^2 interface modes) applies to emission/coupling (C8). These are NOT interchangeable.

**Verification**: `verification/sympy/generalized_crystallization_pressure.py` -- 29/29 PASS

**Full analysis**: `framework/investigations/crystallization/generalized_crystallization_pressure.md`

**Gaps**: 9 identified (see investigation file). Most significant: a,b not derived from axioms (G2), eps* convention conflict (G7), strong coupling incomplete (G9).

### 5.6 Entanglement as Crystallization Mechanism (S169)

**Confidence**: [CANONICAL] (all 113 tests PASS across 9 scripts)

Entanglement is NOT a separate crystallization type but rather the mechanism by which C4 (quantum collapse) creates inter-perspective correlations. The key insight:

```
Entanglement = non-factorizable crystallization constraint in V

Two particles interact (shared crystallization in V)
  -> constraint imposed in full n_c-dimensional crystal space
  -> constraint persists after separation (unitarity)
  -> local observation = projection onto perspective subspace
  -> Born rule (THM_0494) determines outcome + forces remote correlation
```

**What this resolves**:

| Question | Standard QM | Framework Answer |
|----------|-------------|-----------------|
| Why entanglement exists | Axiom (tensor product) | Shared crystallization in V |
| What the entangled state IS | Abstract vector | Geometric constraint in crystal space |
| How non-local correlations arise | "Shut up and calculate" | Constraint is in V, not 3+1D spacetime |
| Why no-signaling | Derived from formalism | Perspectives project independently |

**Key results verified**:
- Bell correlations exactly reproduced: E(a,b) = -cos(a-b) [THEOREM]
- CHSH parameter: |S| = 2√2 (Tsirelson bound, maximal violation) [THEOREM]
- No-signaling: P_A(+|a) = 1/2 regardless of b [THEOREM]
- Tensor product structure derived from axioms (1 structural assumption) [DERIVATION]
- Higher-dimensional embedding (C^121) preserves correlations exactly [THEOREM]
- Entanglement is generic; product states have measure zero [THEOREM]

**Novel predictions** [CONJECTURE]:
- 7+ qubit dimensional cap through single crystal pair (n_c^2 = 121 < 2^7 = 128)
- Maximum Schmidt number = n_c = 11
- Born rule violations ~ alpha^2 ~ 10^-5 (untested)

**Verification scripts** (9 total, 113/113 PASS):

| Script | Tests | Status |
|--------|-------|--------|
| `entanglement_bell_correlations.py` | 18/18 | PASS |
| `tensor_product_derivation.py` | 17/17 | PASS |
| `entanglement_deviation_predictions.py` | 10/10 | PASS |
| `singlet_from_crystallization.py` | 12/12 | PASS |
| `multipartite_entanglement_crystal.py` | 11/11 | PASS |
| `entanglement_entropy_holography.py` | 10/10 | PASS |
| `entanglement_philosophy_rigorous.py` | 13/13 | PASS |
| `wright_fisher_from_geometry.py` | 11/11 | PASS |
| `measurement_problem_resolution.py` | 11/11 | PASS |

**Cross-references**: `quantum/entanglement_from_crystallization.md` (CANONICAL), `core/theorems/THM_0494_born_rule.md`

### 5.7 EWSB as Crystallization (S166-S190)

**Confidence**: [DERIVATION] for Higgs quantum numbers; [CONJECTURE] for pNGB mechanism

Electroweak symmetry breaking is a specialization of C2 + C3, not a separate type. The tilt matrix eigenvalue partition (3,1) of n_d = 4 directly determines the EWSB pattern:

```
Herm(4) eigenvalue partition: (lambda, lambda, lambda, mu)
  -> Stabilizer: U(3) x U(1) ⊃ SU(3) x SU(2) x U(1)
  -> Coset: SO(11)/[SO(4) x SO(7)] = Gr(4,11)
  -> 28 Goldstones = 4 (Higgs doublet) + 24 (colored pNGBs)
```

**Key findings (S168)**:
- F21: Tr(ε²)² + b₂ Tr(ε⁴) potential — sign of b₂ determines gauge group
- F22: Only n_d = 4 gives SU(3)×U(1) via eigenvalue partitioning
- F23: AXM_0117 selects b₂ < 0 via crystallization concentration [CONJECTURE]

**Verification**: `eigenvalue_selection_sm_gauge.py` (22/22 PASS), `tilt_one_loop_mechanism.py` (15/15 PASS), `colored_pngb_24_modes.py` (28/28 PASS)

**Cross-references**: `crystallization/collider_data_validation.md`, `crystallization/symmetry_breaking_chain.md`

### 5.8 Collider Validation Summary (S161-S190)

**Confidence**: Mixed (A- for beta coefficients, B+ for EWSB, [CONJECTURE] for specific predictions)

Systematic comparison of framework predictions against collider data, organized in 5 phases:

| Phase | Focus | Status | Grade | Key Result |
|-------|-------|--------|-------|------------|
| I | Z-pole branching ratios | DONE | B+ | sin²θ_W(eff) = 28/121, within 0.78σ of LEP |
| II | Entropy / R-ratio | PENDING | — | — |
| III | Running couplings / QGP | PARTIAL | A- | All 3 beta coefficients = framework numbers |
| IV | Higgs branching / mass | DONE | B+ | Higgs quantum numbers [DERIVATION] |
| V | Flavor anomalies | DEFERRED | — | Needs CKM first |

**Aggregate**: 18 Z-pole observables compared (18/20 PASS), 17/18 beta coefficient tests PASS. Pattern: structural properties [DERIVATION], numerical values [CONJECTURE].

**Cross-references**: `crystallization/collider_data_validation.md`

---

## Part VI: Usage Guide & Growth

### 6.1 Common Questions

| Question | Start With |
|----------|-----------|
| "How does the Big Bang work in this framework?" | C1, then C2, then C7 |
| "Where does the Born rule come from?" | C4, which depends on C3 |
| "Why is alpha = 1/137?" | C8, which uses C4 (Born rule) and C3 (interface modes) |
| "What is a black hole, really?" | C5, noting it reverses C1 |
| "Where do particle masses come from?" | C9, which depends on C2 and C3 |
| "What is the Casimir effect?" | C6(C), with C6(O) for QCD analog |
| "How do the forces arise?" | C2 (gauge groups) + C6 (force laws from channel properties) |
| "What determines cosmological parameters?" | C7, building on C1 initial conditions |
| "What is entanglement?" | Section 5.6, building on C4 mechanism |
| "How does the Higgs mechanism work?" | Section 5.7 (EWSB), linking C2 eigenvalue selection to C9 mass freezing |
| "What do collider experiments test?" | Section 5.8 (collider validation), connecting C6 + C8 + C9 |
| "Why are there exactly 3 generations?" | C9 (Im_H = 3 quaternionic directions), then C2 (division algebra structure) |
| "Where do beta functions come from?" | C6, section on beta coefficient decomposition |
| "How does a particle decay?" | C10 (weak) or C8 (EM), then check `crystallization_processes/decays/` |
| "What happens in pair annihilation?" | C11, then `crystallization_processes/scattering/electromagnetic_scattering.md` |
| "How do hadrons form?" | C12, then `crystallization_processes/bound_states/hadron_formation.md` |
| "Why are nuclei stable?" | C13, then `crystallization_processes/bound_states/nuclear_binding.md` |
| "How do neutrinos oscillate?" | C14, then `crystallization_processes/scattering/weak_scattering.md` |
| "What are gravitational waves?" | C15, then `crystallization_processes/astrophysical/gravitational_waves.md` |
| "Why is there more matter than antimatter?" | C16 (baryogenesis, currently [SPECULATION]) |
| "How did galaxies form?" | C17, then `crystallization_processes/cosmological/structure_formation.md` |
| "How does a specific process decompose?" | `crystallization_processes/` sub-catalogs |

### 6.2 Growth Protocol

**Adding a new crystallization type (C10+)**:

1. **Identify**: Confirm the phenomenon is a distinct manifestation of tilt dynamics, not a sub-case of an existing type
2. **Classify**: Assign direction, scale, channel, and mechanism from the taxonomy (section 1.4)
3. **Document**: Write a complete entry following the standardized template in Part II (classification, before/after, mechanism, equations, signatures, verification, dependencies, confidence, cross-references)
4. **Verify**: Write or reference a SymPy script with explicit tests
5. **Connect**: Add to the relationship map (5.1), composability chains (3.2), and all relevant indices (Part IV)
6. **Update**: Add entry to this catalog and to `framework/investigations/_INDEX.md`

No renumbering of existing types is needed — the C-prefix system allows indefinite extension.

**Adding a process entry to the sub-catalogs**:

1. Choose the appropriate sub-catalog file in `framework/crystallization_processes/`
2. Follow `PROCESS_TEMPLATE.md` format
3. Assign honesty tag: [FRAMEWORK-DERIVED], [FRAMEWORK-CONSTRAINED], or [STANDARD-RELABELED]
4. Explicitly separate "what framework adds" from "what is imported"
5. Reference data from `data/` reference files
6. Write or reference a verification script for any [FRAMEWORK-DERIVED] entry

### 6.3 Formalization Queue

Types needing promotion to `core/` formal status:

| Type | Current Status | Needed for Promotion |
|------|---------------|---------------------|
| C4 (Born rule) | THM_0494 exists (SKETCH); noise now derived (S169) | Upgrade THM_0494 to DERIVATION; formalize geometric noise proof |
| C2 (SSB chain) | THM_0487 exists (SKETCH); eigenvalue selection (S168); c_3 > 0 now [DERIVATION] (S207) | Formalize b₂ < 0 sign (b₂ ≠ 0 proven); derive Landau coefficient magnitudes |
| C3 (tilt dynamics) | DEF_02C0, DEF_02C4 exist | Derive a, b from axioms |
| C1 (cosmic) | Partial in layer_1_crystallization.md | Derive V_0 |
| C6 (beta coefficients) | Verified exact (S163), no formal theorem | Formalize n_c/Im_H mechanism; prove beta = framework numbers |

---

## Part VII: Session History

| Session | Types Developed | Key Outcome |
|---------|----------------|-------------|
| 72-77 | C1, C2 | Core crystallization axioms and division algebra foundations |
| 86 | C3 | Mexican hat revision of AXM_0117 |
| 121-122 | C1, C5 | Big Bang deep dive; BH epsilon profile; critical mass 137 L_Pl |
| 123, 127-129 | C1, C7 | Hilltop potential breakthrough; n_s = 193/200, r = 7/200 |
| 130-133 | C2, C3 | SO(11) breaking chain; g(phi) unification; a,b constraints |
| 134 | C4 | Born rule derived from crystallization dynamics |
| 148 | C8 | Photon emission as crystallization; alpha = 1/N_I mechanism |
| 150-157 | C6 | Casimir as crystallization pressure; QCD O-channel; completeness audit |
| 161-163 | C6, C7 | Collider validation Phase I (Z-pole, 18/20 PASS); beta coefficients = framework numbers (A-) |
| 166-168 | C2, C3 | Eigenvalue selection theorem; EWSB mechanism; b₂ sign determines SM gauge group |
| 169 | All + C4 | Generalized pressure Pi formula (29/29); entanglement CANONICAL (113/113); Born rule noise from geometry (CR-035) |
| 185-190 | C6, C9 | Collider Phases 4A-4D complete; structural [DERIVATION], numerical [CONJECTURE] |
| 191-195 | C7, C2 | Cosmo audit: CC wrong sign (F-10); coset resolved Gr(4,11); 24 colored pNGBs |
| 198-199 | C7 | η*=337 FALSIFIED; c_s=3/7 FALSIFIED; l₂ resolved (baryon loading, 0.4%); r_s confirmed (0.03%) |
| 206 | All | Catalog v2.0: expanded entries (C2/C4/C6/C7), 3 new Part V sections, gap tracker updated |
| 221 | C10-C17 | Catalog v3.0: 8 new types, sub-catalog system, 6 data reference files, 14 new chains |
| 223 | C10 | Phase 1: C10 fleshed out, weak_decays.md + electroweak_boson_decays.md created, 2 new scripts (32/32 PASS) |
| 225 | C11, C12 | Phase 2: C11 fleshed out, electromagnetic_scattering.md + strong_scattering.md created (9 processes), r_ratio_crystallization.py (15/15 PASS) |
| 231 | C5, C15 | Phase 5: Astrophysical sub-catalogs (stellar_processes.md, compact_objects.md, gravitational_waves.md — 13 processes), astrophysical_crystallization.py (12/12 PASS). C5/C15 cross-refs added. |
| 234 | C1, C7, C17 | Phase 6: Cosmological sub-catalogs (inflation_detailed.md, structure_formation.md, dark_sector.md, cmb_detailed.md — 13 processes), cosmological_crystallization.py (16/16 PASS). C1/C7/C17 cross-refs added. Lambda sign (F-10) resolution documented. DM mass formula discrepancy flagged. |
| 236 | C10, C11, C13, C15 | Phase 7 batch 1: 4 new sub-catalog files (electromagnetic_decays.md (3 processes), nuclear_decays.md (3 processes), weak_scattering.md (4 processes), gravitational_scattering.md (4 processes) — 14 processes total). C10/C11/C13/C15 cross-refs added. No new scripts (all entries use existing verification). |
| 239 | C5, C7, C12, C13, C16 | Phase 7 batch 2: 5 new sub-catalog files (quarkonia_and_glueballs.md (4), atomic_structure.md (4), recombination_and_reionization.md (3), baryogenesis.md (4), high_energy_astrophysics.md (4) — 19 processes total). C5/C7/C12/C13/C16 cross-refs added. No new scripts. |

---

*Document version: 3.8*
*Created: 2026-01-30*
*Updated: 2026-02-03 (S239 -- Phase 7 batch 2: 5 new sub-catalog files (19 processes), C5/C7/C12/C13/C16 cross-refs, 58 scripts / 723 tests)*
*This is a CATALOG -- it introduces no new derivations or claims. All content points to existing source files.*
*Process-level detail: see `framework/crystallization_processes/` sub-catalogs.*
