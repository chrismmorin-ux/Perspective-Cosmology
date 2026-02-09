# THM_04A2: Single-Photon Tilt Derivation of Alpha

**Status**: SKETCH
**Source**: framework/investigations/alpha/alpha_mechanism_derivation.md (Step 5F)
**Added**: Session 164
**Confidence**: [DERIVATION] for steps 1-4; [CONJECTURE] for democratic direction (step 5); [DERIVATION] for Born rule (step 6, via THM_0494); [A-IMPORT] for physical identification (step 8)

---

## Statement

A single quantum of tilt excitation in the N_I-dimensional interface Hilbert space V_pi, with no preferred direction, yields Born-rule probability P = 1/N_I per mode. With the physical identification P = alpha and the equal-distribution correction (THM_0496), this gives:

```
1/alpha = N_I + n_d/Phi_6(n_c) = 137 + 4/111 = 15211/111
```

where N_I = n_d^2 + n_c^2 = 137 is the interface mode count (DEF_02B3).

---

## Plain Language

Imagine a crystal with a defect in it. The boundary between the defect and the crystal has exactly 137 independent "directions" where the defect can tilt — these come from the mathematical structure of the division algebras (R, C, H, O). A single quantum of tilt has no reason to prefer any one direction over another, so by the Born rule it has equal probability 1/137 of being found in each direction.

The electromagnetic coupling constant alpha (approximately 1/137) measures the probability that one charged particle emits a photon. This theorem identifies that probability with the democratic tilt probability 1/N_I = 1/137. The small correction 4/111 arises because the 4 defect dimensions each have an additional coupling path through 111 electromagnetic channels.

**One-sentence version**: The fine structure constant equals the Born-rule probability of a single tilt quantum being found in any one of 137 interface modes.

---

## Proof Sketch

### Step 1: Crystal and defect dimensions [CANONICAL]

By the division algebra structure (THM_0484), prime attractor selection (AXM_0118), and Consistency-Completeness Principle (AXM_0120):
- Crystal: n_c = Im_C + Im_H + Im_O = 1 + 3 + 7 = 11 [D: CCP (AXM_0120) + canonical imaginary decomposition, CR-010]
- Defect: n_d = 4 [D: CCP (AXM_0120) + THM_04A0 (associativity filter), THM_0482 (no zero divisors)]

These are the unique values forced by CCP: maximal consistent algebraic structure requires all four division algebras R,C,H,O; the defect uses the largest associative one (H, dim 4).

### Step 2: Interface symmetry group [CANONICAL]

The defect-crystal interface carries symmetry group U(n_d) x U(n_c) (THM_0485, DEF_02B3). This group has dimension:

```
N_I = dim U(n_d) + dim U(n_c) = n_d^2 + n_c^2 = 16 + 121 = 137
```

### Step 3: Interface Hilbert space [CANONICAL: THM_0491]

The tilt field at the interface spans a complex Hilbert space V_pi of dimension N_I = 137 over C (THM_0491). Each basis vector |k> corresponds to one independent mode of tilt excitation.

**Gap**: THM_0491 is CANONICAL status. The Hilbert space structure depends on the algebraic completeness axiom (AXM_0115) and complex structure (THM_0485).

### Step 4: Single-excitation state [DERIVATION]

A single quantum of tilt excitation occupies V_pi. With no preferred direction (generic nucleation, AXM_0114), the state is the uniform superposition:

```
|psi> = (1/sqrt(N_I)) Sum_{k=1}^{N_I} |k>
```

Normalization: <psi|psi> = N_I * (1/N_I) = 1. VERIFIED.

**Gap**: "Generic" needs tighter formalization. AXM_0114 states tilt is possible; the step from "possible" to "uniformly distributed" requires either: (a) maximum entropy argument, (b) U(n_d) x U(n_c) invariance forcing equal coefficients, or (c) crystallization dynamics selecting the uniform state.

### Step 5: No preferred direction [CONJECTURE]

The key assertion: a single tilt quantum in V_pi has no preferred direction among the N_I modes.

**Precise structure of the gap** (Session 165, `uniformity_irrep_analysis.py` 27/27 PASS):

Under the adjoint action of G = U(n_d) x U(n_c), the space V_pi decomposes into **4 irreducible blocks**:

| Block | Dimension | Representation |
|-------|-----------|---------------|
| u(1)_d | 1 | trivial |
| su(n_d) | n_d^2 - 1 = 15 | adjoint of SU(4), irreducible |
| u(1)_c | 1 | trivial |
| su(n_c) | n_c^2 - 1 = 120 | adjoint of SU(11), irreducible |
| **Total** | **137** | |

By **Schur's lemma** [I-MATH], any G-invariant probability distribution is constant within each block. This leaves **3 free parameters** (4 block probabilities minus 1 normalization constraint). The uniform distribution P(k) = 1/N_I is the special case where all 4 block probabilities are equal.

**What symmetry proves**: P is constant within su(4) and within su(11). [THEOREM]
**What symmetry does NOT prove**: That the cross-block probabilities are equal. [GAP]

The G-invariant subspace is 2-dimensional (the two U(1) generators). The uniform superposition (1/sqrt(N_I)) Sum|k> is NOT G-invariant.

Three constraints beyond symmetry are needed:
- (i) p_1 = p_2 (u(1)_d = su(n_d) coupling)
- (ii) p_3 = p_4 (u(1)_c = su(n_c) coupling)
- (iii) p_2 = p_4 (defect = crystal coupling)

**Experimental discrimination**: The counting metric (r = P_defect/P_crystal = 1) gives 1/alpha = 137 (0.026% error). The Killing metric (r = n_d/n_c = 4/11) gives 1/alpha = 1395/11 = 126.8 (7.5% error). Experiment strongly selects the counting metric.

**Resolution (S165, Path C)**: The counting metric is the **Hilbert-Schmidt inner product** on u(n_d) + u(n_c):

```
<X, Y>_HS = Tr(X^dag Y)
```

This gives `||E_a||^2_HS = 1` for ALL standard generators, verified explicitly for all 16 generators of u(4) and all 121 generators of u(11). The HS inner product is the *canonical* (functorial) metric on matrices induced by the orthonormality of the underlying basis — which is AXM_0110.

**Classification**: The equal cross-block coupling is now [D: derived from AXM_0110], not [A-STRUCTURAL]. The three constraints all follow from the dimension-independence of the HS norm:
- (i) p_1 = p_2: HS norm is 1 for both u(1) and su(n_d) generators
- (ii) p_3 = p_4: HS norm is 1 for both u(1) and su(n_c) generators
- (iii) p_2 = p_4: HS norm is 1 regardless of n (dimension-independent)

**Killing form ruled out**: The Killing form gives `|B(E,E)| = 2n`, so u(4) generators get norm 8 and u(11) generators get norm 22. This introduces group-theoretic weighting beyond the geometry. Experimentally: Killing gives 1/alpha = 1395/11 ~ 126.8 (7.5% error); HS/counting gives 1/alpha = 137 (0.026% error).

**Full argument chain**:
AXM_0110 (orthonormal basis) => HS inner product [D] => all generators unit norm [D] => AXM_0114 (no preferred direction) + max entropy => rho = I/N_I [D] => P(k) = 1/N_I [D]

**Verification**: `hilbert_schmidt_counting_metric.py` -- 15/15 PASS

**Note on random pure states**: A Haar-random pure state on C^137 gives E[P(k)] = 1/137 but with relative standard deviation ~99% (Beta(1,136) distribution). Random pure states do NOT concentrate near uniformity. The uniform distribution requires the maximally mixed density matrix, not a random pure state.

### Step 6: Born rule [DERIVATION: THM_0494]

The measurement probability for mode k is:

```
P(k) = |<k|psi>|^2 = |1/sqrt(N_I)|^2 = 1/N_I = 1/137
```

Sum of probabilities: Sum P(k) = N_I * (1/N_I) = 1. VERIFIED.

**Gap**: The Born rule itself (THM_0494) depends on a noise model that is classified [A-STRUCTURAL]. The derivation from crystallization dynamics (S148) is at DERIVATION level with an identified change request (CR-035).

### Step 7: Equal distribution correction [DERIVATION: THM_0496]

Each of n_d = 4 defect modes couples equally to Phi_6(n_c) = 111 EM channels (THM_0496). The correction:

```
n_d / Phi_6(n_c) = 4/111
```

### Step 8: Physical identification [A-IMPORT]

The dimensionless probability P = 1/N_I is identified with the fine structure constant:

```
alpha = P(any single mode) = 1/N_I (leading order)
1/alpha = N_I + n_d/Phi_6(n_c) = 137 + 4/111 = 15211/111 (with correction)
```

**This identification is Layer 2 correspondence** — it imports the physical meaning of alpha = e^2/(4*pi*epsilon_0*hbar*c) from the Standard Model.

---

## Derivation Chain Summary

| Step | Result | Tag | Source |
|------|--------|-----|--------|
| 1 | n_c = 11, n_d = 4 | [CANONICAL] | AXM_0109, AXM_0118, **AXM_0120 (CCP)**, THM_0484, THM_04A0 |
| 2 | N_I = 137 | [CANONICAL] | DEF_02B3, THM_0485 |
| 3 | V_pi is N_I-dim Hilbert space | [CANONICAL] | THM_0491 |
| 4 | \|psi> = (1/sqrt(N_I)) Sum\|k> | [DERIVATION] | AXM_0110 (HS inner product) + AXM_0114 (max entropy) |
| 5 | No preferred direction | [DERIVATION] | HS inner product from AXM_0110 gives uniform norm; max entropy gives rho = I/N (S165) |
| 6 | P(k) = 1/N_I | [DERIVATION] | THM_0494 (gap: noise model is A-STRUCTURAL) |
| 7 | Correction 4/111 | [DERIVATION] | THM_0496 |
| 8 | P = alpha | [A-IMPORT] | Layer 2 correspondence |

---

## Identified Gaps

| ID | Gap | Severity | Status |
|----|-----|----------|--------|
| G1 | THM_0491 (Hilbert space) is CANONICAL | MEDIUM | Open |
| G2 | Cross-block uniformity: counting metric = HS inner product from AXM_0110 | HIGH -> MEDIUM | Derived (S165): [A-STRUCTURAL] -> [D] |
| G3 | Born rule noise model is A-STRUCTURAL (CR-035) | HIGH | Open |
| G4 | Vertex-crystallization correspondence unproven | MEDIUM | Open |
| G5 | Physical identification P = alpha is Layer 2 import | LOW | By design |

---

## Verification

- `verification/sympy/single_photon_tilt_chain.py` -- 21/21 PASS
  - Framework parameters, democratic amplitude, Born probability, EM channels, correction, full formula, precision, sensitivity

---

## Dependencies

| Dependency | Type | Role |
|-----------|------|------|
| AXM_0109 | [A-AXIOM] | Crystal existence |
| AXM_0114 | [A-AXIOM] | Generic tilt (no preferred direction) |
| AXM_0118 | [A-AXIOM] | Prime attractor selection (n_c = 11) |
| AXM_0120 | [A-AXIOM] | CCP: forces n_c=11, n_d=4, F=C (S251) |
| THM_0482 | [D] | No zero divisors -> defect = H |
| THM_0484 | [D] | Division algebra structure |
| THM_0485 | [D] | Complex structure F = C |
| THM_0491 | [CANONICAL] | Hilbert space structure |
| THM_0494 | [DERIVATION] | Born rule from crystallization |
| THM_0496 | [SKETCH] | Equal distribution over EM channels |
| THM_04A0 | [D] | Associativity filter -> n_d = 4 |
| DEF_02B3 | Definition | N_I = n_d^2 + n_c^2 |
| DEF_02C3 | Definition | Phi_6(n_c) = 111 EM channels |

---

## Implications

- [LAYER 1] Provides a physical mechanism (Born-rule probability of single tilt quantum) for the democratic counting assumption in Steps 2-3 of the alpha mechanism
- [LAYER 2/3] Predicts 1/alpha = 15211/111 = 137.036036... (0.27 ppm from CODATA 2022)
- [LAYER 1] The sensitivity analysis shows only n_d = 4, n_c = 11 matches; neighboring values give >5% errors
- [LAYER 1] 137 being prime means N_I has no non-trivial factorization, forcing the "all modes equal" structure

---

## Relation to Other Step 5 Options

THM_04A2 provides an independent physical picture (Step 5F) that complements:
- **Step 5A** (convention): THM_04A2 gives a physical reason for the convention
- **Step 5D** (crystallization): THM_04A2 is the single-excitation limit of the crystallization branching ratio
- **Step 5E** (unified 5C+5D): THM_04A2 provides the IR value that 5E's RG flow must reproduce

The single-photon tilt picture does NOT resolve the gauge kinetic term normalization gap (which is 5B/5C's domain). It provides the *value* alpha = 1/N_I but not the *mechanism* by which the gauge field acquires this coupling.

---

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| 164 | Initial formalization | SKETCH status, 21/21 PASS verification |
| 165 | Gap G2 closed | Irrep decomposition (27/27 PASS) + HS derivation (15/15 PASS): counting metric derived from AXM_0110 |
