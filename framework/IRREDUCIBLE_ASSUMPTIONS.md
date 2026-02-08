# Irreducible Assumptions: Canonical Inventory

**Status**: REFERENCE (cross-layer)
**Created**: Session S259
**Purpose**: Single authoritative list of every non-trivial assumption between axioms and predictions
**Last Updated**: 2026-02-07

---

## Counting Rules

An assumption is **irreducible** if:
1. It cannot be derived from axioms (C1-C4, P1-P4, T1, CCP) + proven theorems
2. It is NEEDED by at least one active derivation chain
3. It is not a consequence of another assumption on this list

This list supersedes the approximate "13 assumptions" count from S256, which was never explicitly enumerated. Post-S302 count: **5 irreducible assumptions** (2 [A-STRUCTURAL], 0 [CONJECTURE], 2 [A-PHYSICAL], 1 [A-IMPORT], 0 [A-INTERPRETATION]). IRA-08 and IRA-09 RESOLVED (S299): both DERIVED from IRA-06. IRA-10 RESOLVED (S302): all 7 QM defining properties derived without IRA-10; Weinberg criterion forces identification. IRA-06 and IRA-07 survive as independent but are Weinberg-forced.

---

## Resolved Assumptions (no longer on the list)

These were once irreducible but are now derived:

| Former Assumption | Resolved By | Session | Mechanism |
|-------------------|------------|---------|-----------|
| F = C (field choice) | CCP-4 + THM_0485 | S251/S252 | Maximal algebraically complete field; directed time |
| n_d = 4 (defect dimension) | CCP + Frobenius | S251/S252 | Maximal associative division algebra |
| n_c = 11 (crystal dimension) | CCP: Im_C+Im_H+Im_O | S251/S252 | All imaginary dimensions, direct sum |
| Total = 15 (all algebras) | CCP completeness | S251 | No-zero-divisors + all imaginaries |
| A3: Independent sectors | CCP + Radon-Hurwitz | S258 | Complement dim 7 odd -> no [4,7,7]-composition |
| (4,7) not (5,6) selection | CCP: D_framework | S258/S132 | 5, 6 not in {1,2,3,4,7,8,11} |
| SM gauge group | Pipeline 121->12 | S251 | Adjoint filtering on End(V) |
| CC sign (F-10) | Sign convention | S230 | V<0 gives Lambda>0 via standard GR |
| B3: Lower energy preferred | Normal closure + Lyapunov | S258/S259 | Ergodic sampling + gradient flow convergence |
| B1: Quartic potential (IRA-03) | FFT + necessity + Thom | S259/S285 | FFT on Hom(R^4,R^7): all invariants even (no cubic); degree>=4 necessity; Thom stability |
| A1: Spectral convergence (IRA-02) | C5 + IRA-10 + I-QFT | S292 | Finite Hilbert space -> finite spectral sum -> WSR converge. Quartic potential alone insufficient (dim-2 condensate). Democratic coupling follows from Schur (S224) + WSR |
| IRA-08: Tilt = physical field | IRA-06 + order parameter uniqueness | S299 | eps is the ONLY continuous DOF on Gr(4,11). Given IRA-06 (crystallization = SSB), the order parameter IS the physical field by definition. No alternative candidate exists. |
| IRA-09: Generation structure | IRA-06 + Weinberg criterion | S299 | G_2 -> SU(3) branching 7 -> 3+3bar+1 [I-MATH]. The 3 copies have all defining properties of generations (identical gauge quantum numbers, distinguished by non-gauge QN, exactly 3). No plausible alternative interpretation identified. |
| IRA-10: Perspectives = QM | IRA-06 + IRA-07 + THM_0491/0494/0493/0485 + Weinberg criterion | S302 | All 7 QM defining properties (Hilbert space, Born rule, unitarity, complex amplitudes, non-commutativity, uncertainty, quantization) derived from Layer 0/1 axioms WITHOUT IRA-10. Finite dimensionality from AXM_0113 + C5 [THM_0491 CANONICAL]. No plausible alternative to QM interpretation. Same mechanism as IRA-08/09 (S299). |

---

## Active Inventory

### Tier 1: Alpha / Gauge Chain (highest impact)

#### IRA-01: Interface = 1/alpha [A-STRUCTURAL within I-STRUCT-5]

**Type**: [A-STRUCTURAL] (Step 15 in alpha chain) — upgraded from [CONJECTURE] S297
**Impact**: CRITICAL — the entire framework's primary numerical prediction depends on this
**Statement**: The generator count N_I = n_d^2 + n_c^2 = 137 equals the inverse fine-structure constant at the compositeness scale. Equivalently: kappa = 1 (standard Tr convention for HS metric).
**What's proven**:
- The number 137 is derived from axioms [DERIVED from CCP]
- WSR + Schur's lemma gives 1/g_i^2 = kappa * N_i for all gauge factors [DERIVED S292]
- kappa = 1 corresponds to standard (unnormalized) Hilbert-Schmidt inner product <A,B> = Tr(A^dag B) [STANDARD MATH]
- DE-009 does NOT block the WSR/HS approach (only blocks Sub-problem B: photon ID) [S297]
- Sigma model one-loop: sum(Q^2)_coset = 14, S_EM = 126 = 6*Im_H*Im_O [S297]
- EQ-002/EQ-003 duality: kappa = 1 gives BOTH alpha = 1/137 AND Omega_m = 63/200 [S297]
- Only kappa = 1 gives 1/alpha ~ 137; alternatives (1/n_c, 1/4pi, 1/n_d, 2/pi) off by >10% [S297]
**What remains**: kappa = 1 = standard Tr convention is a natural mathematical default but cannot be derived from axioms alone. It is a Layer 2 identification: "the HS metric with Tr convention maps to physical coupling."
**Status**: [A-STRUCTURAL] — absorbed into I-STRUCT-5's absolute extension. The convention "use standard Tr" is the irreducible content. No longer a [CONJECTURE] because the EQ-002/EQ-003 duality provides strong structural support (two independent predictions from one parameter).
**Depends on**: I-STRUCT-5 (democratic bilinear principle, DERIVED S292 for ratios)
**Used by**: Alpha prediction (1/alpha = 137 + 4/111), Omega_m = 63/200, all precision claims
**Verification**: `conj_a2_de009_scope.py` (12/12), `conj_a2_sigma_model_coefficient.py` (12/12), `conj_a2_normalization_principle.py` (10/10)

#### ~~IRA-02: Democratic gauge coupling = HS metric~~ [RESOLVED S292]

**Type**: ~~[A-PHYSICAL]~~ -> **[DERIVED from C5 + THM_0491 + CCP + I-QFT]** (resolved S292 via CONJ-A1; IRA-10 dependency eliminated S302)
**Former statement**: The physical gauge coupling inherits the Hilbert-Schmidt metric on the vacuum manifold Gr(4,11). Specifically: 1/g^2 = democratic count of modes.
**Resolution**: CONJ-A1 RESOLVED (S292):
- **Negative result**: Quartic potential alone INSUFFICIENT. The dim-2 condensate <eps^T eps> ~ v^2 appears as SO(4)xSO(7) singlet in V-A OPE, giving Pi_{LR} ~ v^2/Q^2 and rho_{V-A} ~ 1/s. WSR1 logarithmically divergent. Corrects S238 assessment.
- **Positive result**: C5 (|I| finite) + AXM_0113 (finite access) -> dim(V) < inf [THM_0491 CANONICAL] + CCP -> dim(H_phys) < inf -> spectral function = finite sum of delta functions -> all spectral integrals converge trivially. (Originally stated as C5 + IRA-10; IRA-10 dependency eliminated S302 since THM_0491 derives finite Hilbert space without it.)
- WSR convergence + full compositeness [D from axioms] + Schur's lemma [D, S224] -> 1/g^2 = democratic count
**Derivation chain**:
```
C5 (finiteness) [AXIOM] + AXM_0113 (finite access) [AXIOM]
  -> dim(V) < inf [THM_0491, CANONICAL]
  + CCP (framework = complete theory) [AXIOM]
  -> dim(H_phys) < inf [D]
  -> Spectral function = finite sum [D: spectral theorem]
  -> WSR1 + WSR2 converge [D]
  + Full compositeness [D from AXM_0109-0117]
  + Schur's lemma [D, S224]
  -> 1/g^2 = democratic count [D + I-QFT]
```
(Updated S302: IRA-10 dependency removed. THM_0491 derives finite Hilbert space from AXM_0113 without IRA-10.)
**Verification**: `spectral_convergence_conj_a1.py` (24/24 PASS)
**Moved to**: Resolved Assumptions table

---

### Tier 2: Crystallization Dynamics (EWSB, potential, breaking)

#### ~~IRA-03: Quartic potential truncation~~ [RESOLVED S285]

**Type**: ~~[DERIVATION with imports]~~ -> **[THEOREM with I-MATH: FFT]** (resolved S285 via CONJ-B1 full resolution)
**Former statement**: The crystallization energy is F(epsilon) = a_2*Tr(epsilon^2) + b_4*(Tr(epsilon^2))^2 + c_4*Tr(epsilon^4), with no higher-order or cubic terms.
**Resolution**: CONJ-B1 FULLY RESOLVED (S259 + S285):
- **Z₂ symmetry [THEOREM, S285]**: Tilt epsilon lives in Hom(R^4, R^7), not Sym_0(R^11). By the First Fundamental Theorem (FFT) for orthogonal groups [I-MATH: Weyl, Procesi], SO(4)xSO(7) invariants on M(4,7) are generated by entries of epsilon^T*epsilon. Since epsilon^T*epsilon = (-epsilon)^T*(-epsilon), ALL invariant polynomials are even. No cubic term exists.
- Degree 4 is the MINIMUM for bounded SSB [I-MATH, THEOREM, S259]
- (4,7) uniquely selected at quartic order [DERIVED, S132/S259]
- Quartic critical points structurally stable (Thom's theorem) [I-MATH, S259]
- QFT route: CCP -> n_d=4 -> 4D -> quartic marginal [DERIVATION + A-IMPORT: QFT, S259]
**Derivation chain**:
```
CCP [AXIOM] -> crystallization on Gr(4,11) [DERIVED]
  -> tilt eps in Hom(R^4, R^7) [DERIVED from Grassmannian geometry]
  -> SO(4)xSO(7) invariance [DERIVED]
  -> FFT: invariants = f(eps^T eps) [I-MATH: Weyl, Procesi]
  -> eps^T eps = (-eps)^T (-eps) [ARITHMETIC]
  -> V(eps) even -> no cubic [THEOREM]
  -> quartic is lowest non-trivial order [S259: THEOREM]
```
**Verification**: `conj_b1_z2_rectangular_matrix.py` (10/10 PASS), `conj_b1_invariant_ring.py` (6/6 PASS), `conj_b1_quartic_truncation.py` (20/20 PASS)
**Moved to**: Resolved Assumptions table

#### IRA-04: Quartic coupling ratio [A-STRUCTURAL] — PARTIALLY RESOLVED S298

**Type**: [A-STRUCTURAL] (B2 in MPT)
**Impact**: LOW (downgraded from MEDIUM) — affects only mass spectrum of shape modes
**Statement (original)**: The coupling between tilt components has the commutator-trace form Tr((eps*eps^T)^2).
**Statement (residual)**: The ratio rho = c_4/b_4 > 0 in V = b_4*(Tr G)^2 + c_4*Tr(G^2) is undetermined.
**What's proven** (S298):
- Exactly 2 quartic invariants (Tr G)^2 and Tr(G^2) exist on Hom(R^4,R^7) [THEOREM, FFT, S285]
- c_4 > 0 forced by boundedness of Sym_0(R^11) potential [THEOREM, S298]
  - Exact decomposition: b_4 = 4u (from [Tr phi^2]^2), c_4 = 2v (from Tr(phi^4))
  - Bounded potential requires v > 0, hence c_4 = 2v > 0 [NECESSITY]
- c_4 > 0 <=> rank-4 (democratic) minimum <=> (4,7) breaking [THEOREM, S298]
- c_4 > 0 <=> all shape modes massive (non-degenerate) [THEOREM, S298]
- "Commutator-trace form" IS Tr(G^2) = Tr((eps*eps^T)^2) with positive coefficient [DERIVED, S298]
- Four independent arguments for c_4 > 0: (A) from n_d=4, (B) non-degeneracy, (C) democratic principle, (D) boundedness [strongest, pure math]
**What remains**: The ratio rho = c_4/b_4 = v/(2u) > 0 is a positive real number determining:
- Shape mode mass: m^2_shape/m^2_radial = rho/(4+rho) — ranges from 0 (rho->0) to 1 (rho->inf)
- Does NOT affect: breaking pattern, gauge group, alpha, Weinberg angle, Omega_m
**Resolving conjecture**: None — ratio appears genuinely irreducible
**Difficulty**: LOW — affects only mass spectrum, not currently observed quantities
**Depends on**: IRA-03 (resolved S285)
**Used by**: Casimir eigenvalue ratios, Born-rule sector budget (quantitative details only)
**Verification**: `ira_04_quartic_coupling_form.py` (12/12 PASS)

#### ~~IRA-05: Lower energy preferred~~ [RESOLVED S259]

**Type**: ~~[CONJECTURE]~~ -> **[DERIVED]** (resolved S258+S259 via CONJ-B3)
**Former statement**: Iterated quaternionic perspective changes preferentially visit lower-energy configurations on Gr(4,11).
**Resolution**: CONJ-B3 FULLY RESOLVED:
- Gradient flow convergence [THEOREM, Lyapunov, S258]
- Ergodic sampling via normal closure theorem [THEOREM, S259]: so(11) simple (B_5), center trivial (11 odd), normal closure of SU(2) = SO(11), therefore quaternionic transitions generate full SO(11) action on Gr(4,11)
- Combined: stochastic gradient descent + ergodicity + CCP constraint = energy minimization
**Verification**: `conj_b3_algebraic_dynamics.py` (12/12 PASS), `conj_b3_ergodicity_proof.py` (10/10 PASS)
**Moved to**: Resolved Assumptions table

---

### Tier 3: Layer 2 Bridge (physical interpretation)

These are the correspondence rules that identify mathematical objects with physical quantities. They are the "meaning" assignments that connect pure math to testable physics.

#### IRA-06: Crystallization = symmetry breaking [A-PHYSICAL, Weinberg-forced]

**Type**: [A-PHYSICAL]
**Impact**: HIGH — entire physical interpretation of framework
**Statement**: The mathematical process described by AXM_0117 (tilt evolution via gradient flow on V) IS the physical process of spontaneous symmetry breaking.
**What's proven**: The mathematical structure instantiates ALL 8 defining properties of SSB:
1. Symmetry group G = SO(11) [DERIVED]
2. G-invariant potential V(eps) [THEOREM: FFT, S285]
3. Minimum breaks SO(11) -> SO(4)xSO(7) [THEOREM: c_4 > 0, S298]
4. Vacuum manifold Gr(4,11) [DERIVED]
5. 28 Goldstone modes = dim(G/H) [I-MATH]
6. Mexican hat topology: eps=0 unstable [DERIVED from AXM_0117]
7. Shape modes massive [THEOREM: c_4 > 0, S298]
8. Order parameter eps in correct representation [DERIVED]
No properties inconsistent with SSB identified. SSB is a MATHEMATICAL PATTERN; the framework instantiates it exactly.
**What remains**: The identification is Weinberg-forced (all properties present, no alternatives, no inconsistencies) but formally still [A-PHYSICAL] because "math = physics" is a meta-assumption of mathematical physics, not a theorem.
**Weinberg criterion** (S299): No plausible alternative physical interpretation exists. SSB is DEFINED as this mathematical pattern (G-invariant potential with H-invariant minimum + Goldstones). Calling it SSB is recognition, not assumption.
**Resolving conjecture**: None — irreducible at the level of "this math IS physics" (the foundational meta-assumption of all mathematical physics)
**Depends on**: Nothing on this list
**Used by**: All physical predictions; IRA-08 and IRA-09 (both now resolved as consequences of IRA-06, S299)
**Verification**: `ira_physical_independence.py` (38/38 PASS)

#### IRA-07: Adjacency = time evolution [A-PHYSICAL, Weinberg-forced]

**Type**: [A-PHYSICAL]
**Impact**: HIGH — connects perspective sequences to dynamics
**Statement**: Axiom T1 (time = perspective sequences) IS physical time evolution.
**What's proven**: T1 forces directed structure. THM_0485 derives complex field from directed time. THM_04AE derives Lorentz signature (1,3) from observable algebra. THM_04AE Part (e) derives the 1+3 split from Z(H) = R. Associativity of transitions = consistent temporal ordering [DERIVED].
The directed sequences have ALL defining properties of physical time:
1. Directed ordering (past -> future) [T1]
2. Parametrize change (perspective transitions) [by construction]
3. Composition law (associativity of transitions) [DERIVED]
4. Give rise to complex amplitudes [THEOREM: THM_0485]
5. Give rise to Lorentz signature [DERIVATION: THM_04AE]
6. Give rise to 1+3 split [DERIVATION: THM_04AE Part e]
No properties inconsistent with physical time identified.
**What remains**: The identification is Weinberg-forced but formally [A-PHYSICAL]. The irreducible content is T1's physical reading.
**Weinberg criterion** (S299): No plausible alternative interpretation exists. The directed sequences cannot be spatial (that's V_Crystal's role) or logical (directed sequences parametrizing change IS time by definition).
**Resolving conjecture**: None — irreducible at the meta-level
**Depends on**: Nothing on this list (independent of IRA-06: different domain — parameter vs process)
**Used by**: All dynamical predictions, Lorentzian signature
**Verification**: `ira_physical_independence.py` (38/38 PASS)

#### ~~IRA-08: Tilt = physical field~~ [RESOLVED S299]

**Type**: ~~[A-PHYSICAL]~~ -> **[DERIVED from IRA-06]** (resolved S299)
**Former statement**: The tilt matrix epsilon_ij (measuring deviation from orthogonality) IS the physical order parameter field (composite Higgs in the EWSB sector).
**Resolution**: Given IRA-06 (crystallization = SSB), epsilon is the order parameter by DEFINITION:
1. epsilon is the ONLY continuous degree of freedom on Gr(4,11) [DERIVED from Grassmannian geometry]
2. V(eps) is the ONLY potential (FFT proves exactly 2 quartic invariants, both functions of eps) [THEOREM, S285]
3. In SSB, the order parameter IS the physical field — there is no additional identification step
4. The Goldstone modes of eps include exactly 4 DOFs with Higgs quantum numbers (1,2,+/-1/2) — the ONLY such object in the framework
**Key argument**: "Why this mathematical object and not another?" has a definitive answer: there IS no other. Epsilon is unique.
**Verification**: `ira_physical_independence.py` (38/38 PASS)
**Moved to**: Resolved Assumptions table

#### ~~IRA-09: Generation structure~~ [RESOLVED S299]

**Type**: ~~[A-PHYSICAL]~~ -> **[DERIVED from IRA-06 + Weinberg criterion]** (resolved S299)
**Former statement**: The G_2 -> SU(3) branching 7 -> 3 + 3-bar + 1 gives 3 physical generations of fermions.
**Resolution**: Given IRA-06 (crystallization = SSB gives the physical spectrum):
1. Fermions = spinorial reps of SO(11) [DERIVED from CCP + representation theory]
2. SO(7) contains G_2 = Aut(O) which contains SU(3) [I-MATH]
3. Under G_2 -> SU(3): 7 -> 3 + 3-bar + 1 [I-MATH: branching rule]
4. The 3 copies have ALL defining properties of generations: identical gauge quantum numbers, distinguished by non-gauge quantum number, exactly 3 copies
5. **No plausible alternative interpretation exists**: not color (different SU(3)), not spatial dimensions (already Im_H), no other physical concept matches "3 identical copies of fermion content"
6. Weinberg criterion: all properties present + no alternatives = identification forced
**Verification**: `ira_physical_independence.py` (38/38 PASS)
**Moved to**: Resolved Assumptions table

#### ~~IRA-10: Perspectives = quantum states~~ [RESOLVED S302]

**Type**: ~~[A-INTERPRETATION]~~ -> **[DERIVED from IRA-06 + IRA-07 + THM_0491/0494/0493/0485 + Weinberg criterion]** (resolved S302)
**Former statement**: Individual perspectives correspond to quantum states; the overlap weight gamma(pi_1, pi_2) relates to transition amplitudes.
**Resolution**: All 7 defining properties of quantum mechanics are derived from Layer 0/1 axioms WITHOUT invoking IRA-10:
1. Complex Hilbert space [THM_0491, CANONICAL] — from AXM_0109/0110/0113 + THM_0485
2. Born rule P(k) = |c_k|^2 [THM_0494, DERIVATION] — from THM_0491/0493 + AXM_0117/0112/0110
3. Unitary evolution [THM_0493, DERIVATION] — from THM_0491 + THM_0450
4. Complex amplitudes [THM_0485, CANONICAL] — from AXM_0107 + THM_0484
5. Non-commutative observables [DERIVATION, S108] — from projection algebra
6. Uncertainty relations [DERIVATION, S108] — from commutator structure
7. Quantized spectra [DERIVATION, S109] — from compactness of S^10, SO(3)
No QM-inconsistent properties identified. No plausible alternative interpretation (not classical, not statistical, not non-quantum informational).
By the Weinberg criterion (same as IRA-08/09 in S299): structural isomorphism forces identification.
**Finite dimensionality** (CONJ-A1 crux): THM_0491 derives dim(V_π) < ∞ from AXM_0113. C5 gives dim(V) < ∞. CCP gives H_phys ⊂ V. Chain holds without IRA-10 and is STRONGER (rests on CANONICAL theorem).
**Key argument**: "These 7 properties define QM. V_π has all 7. No alternative interpretation exists. Therefore V_π IS a quantum state space." Same pattern as IRA-08 (eps = field) and IRA-09 (3 copies = generations).
**Verification**: `ira_10_redundancy_analysis.py` (39/39 PASS)
**Moved to**: Resolved Assumptions table

---

### Tier 4: Scale

#### IRA-11: Perspective count |Pi| ~ 10^118 [A-IMPORT]

**Type**: [A-IMPORT] (from cosmological observation)
**Impact**: LOW-MEDIUM — determines cosmological constant magnitude
**Statement**: The total number of perspectives is approximately 10^118, related to the cosmological horizon.
**What's proven**: Axiom C5 requires |I| finite or countable. P3 requires finite access. The specific value ~10^118 is imported from observation (horizon area / Planck area).
**What remains**: No derivation of |Pi| from axioms. This may be environmental/anthropic.
**Resolving conjecture**: None known
**Depends on**: Nothing on this list
**Used by**: Cosmological constant, possibly dark energy

---

## Dependency Map

```
IRA-01 (alpha = 1/N_I) [A-STRUCTURAL within I-STRUCT-5]
  |-- formerly needed IRA-02 (now resolved via C5 + THM_0491 + CCP, S292/S302)
  |-- CONJ-A2 PARTIALLY RESOLVED S297: upgraded from CONJECTURE to A-STRUCTURAL
  |-- kappa = 1 = standard Tr convention (absorbed into I-STRUCT-5)

IRA-02 RESOLVED (S292) -- A1 resolved (C5 + THM_0491 + CCP -> finite spectrum -> WSR)

IRA-03 RESOLVED (S285) -- B1 fully eliminated (FFT on rectangular matrices)

IRA-04 (quartic ratio) [A-STRUCTURAL, PARTIALLY RESOLVED S298]
  |-- formerly depended on IRA-03 (now resolved)
  |-- FORM derived: c_4 = 2v > 0 [THEOREM from boundedness]
  |-- RESIDUAL: ratio rho = c_4/b_4 = v/(2u) [A-STRUCTURAL, LOW impact]

IRA-05 RESOLVED (S259) -- B3 fully eliminated

IRA-06 (crystallization = SSB) [A-PHYSICAL, Weinberg-forced]
  |-- IRA-08 RESOLVED (S299): derived from IRA-06 (order parameter uniqueness)
  |-- IRA-09 RESOLVED (S299): derived from IRA-06 + Weinberg criterion
  |-- IRA-10 RESOLVED (S302): derived from IRA-06 + IRA-07 + theorems + Weinberg criterion
  |-- Weinberg-forced: all 8 SSB properties present, 0 alternatives, 0 inconsistencies
  |-- Independent of IRA-07 (different domain: process vs parameter)

IRA-07 (adjacency = time) [A-PHYSICAL, Weinberg-forced]
  |-- IRA-10 RESOLVED (S302): derived from IRA-06 + IRA-07 + theorems + Weinberg criterion
  |-- Weinberg-forced: all 6 time properties present, 0 alternatives
  |-- Independent of IRA-06 (different domain: parameter vs process)

IRA-08 RESOLVED (S299) -- derived from IRA-06 (eps is ONLY DOF, order parameter by definition)

IRA-09 RESOLVED (S299) -- derived from IRA-06 + Weinberg criterion (no alternative interpretation)

IRA-10 RESOLVED (S302) -- derived from IRA-06 + IRA-07 + THM_0491/0494/0493/0485 + Weinberg criterion (all 7 QM properties derived, no alternative)

IRA-11 (|Pi| scale) [A-IMPORT]
  |-- standalone (cosmological input)
```

---

## Summary by Type

| Type | Count | IDs | Notes |
|------|-------|-----|-------|
| [CONJECTURE] | 0 | — | (None remaining) |
| [A-STRUCTURAL] | 2 | IRA-01, IRA-04 | Alpha = 1/N_I (kappa=1, S297), Quartic ratio (S298) |
| [A-PHYSICAL] | 2 | IRA-06, IRA-07 | Both Weinberg-forced (S299). IRA-08/09/10 resolved as derived. |
| [A-INTERPRETATION] | 0 | — | IRA-10 RESOLVED S302: all 7 QM properties derived without it. Tier ELIMINATED. |
| [A-IMPORT] | 1 | IRA-11 | Cosmological observation |
| **Total** | **5** | | IRA-10 RESOLVED S302 (Weinberg criterion). Count 6 -> 5. [A-INTERPRETATION] tier eliminated. |

---

## Resolution Roadmap

| Priority | Target | Would Resolve | Method | Effort | Status |
|----------|--------|--------------|--------|--------|--------|
| ~~1~~ | ~~CONJ-B1~~ | ~~IRA-03~~ | ~~Catastrophe theory~~ | — | **PARTIALLY RESOLVED S259** |
| ~~2~~ | ~~CONJ-B3~~ | ~~IRA-05~~ | ~~SU(2) ergodicity~~ | — | **FULLY RESOLVED S259** |
| ~~1~~ | ~~CONJ-B1 residual~~ | ~~IRA-03~~ | ~~CCP -> continuous transition~~ | — | **FULLY RESOLVED S285** (FFT on Hom(R^4,R^7)) |
| ~~2~~ | ~~CONJ-A1~~ | ~~IRA-02~~ | ~~Non-perturbative QFT~~ | — | **RESOLVED S292** (C5 + IRA-10 -> finite spectrum -> WSR converge) |
| 3 | ~~CONJ-A2~~ | ~~IRA-01 -> [DERIVED]~~ | — | — | **PARTIALLY RESOLVED S297**: upgraded from [CONJECTURE] to [A-STRUCTURAL within I-STRUCT-5]. kappa=1 = standard Tr convention. EQ-002/EQ-003 duality: two predictions from one parameter. |
| 4 | IRA-04 | **PARTIALLY RESOLVED** (S298) | Boundedness theorem | LOW | Form derived (c_4>0 [THEOREM]); ratio rho=c_4/b_4 irreducible but LOW impact |
| 5 | ~~IRA-08~~ | **RESOLVED** (S299) | IRA-06 + uniqueness | — | eps is ONLY DOF; order parameter by definition given SSB |
| 6 | ~~IRA-09~~ | **RESOLVED** (S299) | IRA-06 + Weinberg | — | No alternative interpretation of 3+3bar+1; generation ID forced |
| 7 | ~~IRA-10~~ | **RESOLVED** (S302) | Weinberg criterion | — | All 7 QM properties derived without IRA-10. Same mechanism as IRA-08/09. |
| — | IRA-06/07 | Weinberg-forced but irreducible | Structural isomorphism leaves no alternative | — | Meta-assumption of mathematical physics |
| — | IRA-11 | Import | Would require cosmological derivation | Out of scope |  |

---

## Cross-References

- `framework/MATHEMATICAL_PERIODIC_TABLE.md` — Object classification (companion document)
- `framework/investigations/alpha/ALPHA_DERIVATION_MASTER.md` — Alpha chain details
- `framework/layer_2_correspondence.md` — Historical Layer 2 imports (partially superseded)
- `registry/EXPLORATION_QUEUE.md` — EQ items tracking resolution
- `.quality/report.md` — Quality scan findings

---

*Version 3.0 (S302). IRA-10 RESOLVED: all 7 QM defining properties (Hilbert space, Born rule, unitarity, complex amplitudes, non-commutativity, uncertainty, quantization) derived from Layer 0/1 axioms without IRA-10. Finite dimensionality from AXM_0113 + C5 via THM_0491 [CANONICAL]. Weinberg criterion forces identification (same mechanism as IRA-08/09 in S299). CONJ-A1 chain strengthened: now rests on CANONICAL theorem instead of [A-INTERPRETATION]. [A-INTERPRETATION] tier ELIMINATED. IRA count 6 -> 5. Supersedes v2.0 (S299).*
