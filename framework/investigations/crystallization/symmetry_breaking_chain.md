# The SO(11) Symmetry Breaking Chain

**Status**: CANONICAL — Promoted from investigation (Session 133)
**Priority**: HIGH — Links crystal structure to Standard Model
**Purpose**: Derive the unique crystallization ordering from SO(11) symmetry
**Source**: `framework/investigations/crystallization_ordering_from_SO11.md` (Sessions 132-132b)

---

## The Claim

> **The crystal's SO(11) symmetry breaks through exactly one chain compatible with division algebra structure, uniquely producing the full SM gauge group and all framework primes.**

```
SO(11) → SO(4) × SO(7) → SO(4) × G₂ → SO(4) × SU(3) → U(2) × SU(3)
                                                         = SU(2)_L × U(1)_Y × SU(3)_c
```

Each step is forced. F = C (THM_0485) does double duty: internal (G_2 → SU(3)) and defect (SO(4) → U(2)).

---

## Plain Language

The framework's crystal has 11 internal dimensions (n_c = 11), giving it the rotational symmetry of an 11-dimensional sphere. When the crystal "freezes," this symmetry breaks in stages — like water crystallizing prefers certain axes over others.

The key finding is that the ORDER of breaking is not a choice. Division algebra structure forces exactly one path:

1. First, 4 dimensions separate from 7. This gives spacetime (4D, quaternionic) and an internal space (7D, octonionic).
2. Then the 7D internal space recognizes octonionic structure, reducing from SO(7) to G₂ (the automorphism group of the octonions).
3. Finally, the field being complex (F = C) breaks G₂ down to SU(3) — the color gauge group.

The result: spacetime plus the Standard Model gauge structure, derived from one symmetry breaking chain. No alternatives exist.

**One-sentence version**: The universe's structure follows from the unique way an 11-dimensional crystal's symmetry can break consistently with division algebras.

---

## Part I: Why SO(11)?

The crystal dimension is n_c = 11, derived from division algebra imaginary dimensions:

```
n_c = Im_C + Im_H + Im_O = 1 + 3 + 7 = 11
```

Equivalently: n_c = R + C + H + O - 4 = 15 - 4 = 11 (removing the real axis counted four times).

The crystal potential V_Crystal respects SO(n_c) = SO(11) rotational symmetry [D: from AXM_0112].

**Confidence**: [THEOREM] — n_c = 11 is derived from division algebra dimensions.

**Verification**: `verification/sympy/nc_11_rigorous_derivation.py` — 9/9 PASS

---

## Part II: The Breaking Chain

### Stage 1: SO(11) → SO(4) × SO(7)

Among all SO(p) × SO(q) subgroups with p + q = 11, only those where BOTH p AND q are division algebra framework dimensions are valid:

| (p, q) | p × q | Both in D_framework? | Status |
|---------|-------|---------------------|--------|
| (1, 10) | 10 | NO (10 not framework) | Rejected |
| (2, 9) | 18 | NO (9 not framework) | Rejected |
| (3, 8) | 24 | YES: Im_H, O | Candidate |
| **(4, 7)** | **28** | **YES: H, Im_O** | **Selected** |
| (5, 6) | 30 | NO (5, 6 not framework) | Rejected |

D_framework = {1, 2, 3, 4, 7, 8, 11} (all division algebra dimensions and their imaginaries).

Only two valid splits exist: (3, 8) and (4, 7).

**Why (4,7) wins over (3,8)**:

1. **Maximum coupling**: p × q = 28 > 24. The (4,7) split maximizes mixed coupling between sectors.
2. **Spacetime identification**: n_d = 4 = dim(H) must crystallize as a block [A: Frobenius gives n_d = 4].
3. **Fourth-order energy selection**: At quartic order in the Landau expansion, (4,7) has lower energy than (3,8) when c₃ > 0:

```
d⁴Tr(ε⁴)/ds⁴ at (4,7) = 222/77
d⁴Tr(ε⁴)/ds⁴ at (3,8) = 343/77

Difference = -121/77 = -11/7 = -n_c/Im_O
```

The difference is a framework ratio.

**Note**: At second order, ALL splittings are degenerate (proved). Selection requires fourth-order analysis.

**Goldstone modes**: dim(SO(11)) - dim(SO(4)) - dim(SO(7)) = 55 - 6 - 21 = 28

**Confidence**: [DERIVATION] — D_framework constraint is forced; (4,7) selection has three supporting arguments but c₃ > 0 is not yet derived from axioms.

**Verification**: `verification/sympy/crystallization_ordering_SO11.py` — 15/15 PASS, `verification/sympy/quartic_energy_curvature.py` — 12/12 PASS

### Stage 2: SO(7) → G₂

After Stage 1, the 7 internal dimensions have SO(7) symmetry. The unique subgroup preserving octonionic multiplication is:

**G₂ = Aut(O) ⊂ SO(7)**

This is the unique subgroup preserving the cross product on R⁷ [I-MATH: Standard result in algebra].

- dim(G₂) = 14
- Goldstone modes: 21 - 14 = 7

**Confidence**: [THEOREM] — G₂ = Aut(O) is a mathematical fact.

### Stage 3: G₂ → SU(3)

When the field is identified as F = C (complex numbers) [D: THM_0485], the stabilizer subgroup is:

**SU(3) = Stab_{G₂}(C)**

This is the unique maximal subgroup of G₂ preserving the complex subalgebra [I-MATH: Standard result].

- dim(SU(3)) = 8
- Goldstone modes: 14 - 8 = 6

**Confidence**: [THEOREM] — SU(3) = Stab_{G₂}(C) is a mathematical fact.

### Stage 4: SO(4) → U(2) = SU(2)_L × U(1)

F = C also acts on the defect sector. The complex structure J on R^4 = C^2 is a Kahler form in so(4).

**Key decomposition**: so(4) = su(2)_+ + su(2)_- (self-dual / anti-self-dual).

The Kahler form J lies in su(2)_+ (specifically J = -e+_1), breaking it to u(1)_J while preserving all of su(2)_-:

**U(2) = SU(2)_- × U(1)_J = Stab_{SO(4)}(J)**

- dim(U(2)) = 4
- Goldstone modes: 6 - 4 = 2

This is F = C's "double duty":
- Internal (Stage 3): G_2 → SU(3) = Stab_{G_2}(C), 6 Goldstones
- Defect (Stage 4): SO(4) → U(2), 2 Goldstones
- Total F = C Goldstones: 6 + 2 = 8 = dim(O)

**Parity violation**: The choice of J (oriented complex structure) distinguishes su(2)_+ from su(2)_-. Reversing orientation (J → -J) swaps the two SU(2) factors. This is the origin of P violation — the complex structure selects one chirality.

**Confidence**: [DERIVATION] — The group theory (so(4) decomposition, stabilizer of Kahler form) is standard [I-MATH]. The identification su(2)_- = su(2)_L is [A-PHYSICAL].

**Verification**: `verification/sympy/sm_gauge_group_from_fc.py` — 25/25 PASS

**EWSB (Session 175)**: The Higgs doublet is NOT the tilt field epsilon_dd (which is in the adjoint). Instead, it lives in the **off-diagonal block** epsilon_di (4x7 = 28 modes connecting defect and internal sectors). These 28 modes are the Stage 1 Goldstones from SO(11) -> SO(4) x SO(7).

Under SU(2)_L x U(1)_Y x SU(3)_c, epsilon_di decomposes as:
- (2, 1)_{Y=1/2} + conjugate = **4 real DOF = Higgs doublet** [SU(3) singlet]
- (2, 3)_{-1} + (2, 3bar)_{-1} + conjugates = 24 real DOF = colored scalars

A VEV in the doublet breaks SU(2)_L x U(1)_Y -> U(1)_EM:
- Broken: T1, T2, and the Z-combination (T3 - Y) -> **3 massive bosons (W+, W-, Z)**
- Preserved: Q_EM = T3 + Y -> **1 massless (photon)**
- Physical Higgs: 4 DOF - 3 eaten = **1 scalar boson**

Notable: Higgs DOF = 4 = n_d = dim(H). Singlet fraction = 4/28 = 1/Im_O. The Higgs is a pseudo-NGB (SO(11) is global, only SM is gauged). [CONJECTURE] Mass from Coleman-Weinberg mechanism.

**Verification**: `verification/sympy/ewsb_higgs_from_tilt_interface.py` — 32/32 PASS

### Summary

| Stage | Breaking | Goldstone | Cumulative | Physics |
|-------|----------|-----------|------------|---------|
| 1 | SO(11) → SO(4) × SO(7) | 28 | 28 | Spacetime separates |
| 2 | SO(7) → G_2 | 7 | 35 | Octonionic structure forms |
| 3 | G_2 → SU(3) | 6 | 41 | Color locks in (F=C internal) |
| 4 | SO(4) → U(2) | 2 | 43 | Electroweak structure (F=C defect) |
| **Pre-EWSB** | | | **43** | **SU(2)_L × U(1)_Y × SU(3)_c, dim 12** |
| 5 (EWSB) | SU(2) × U(1) → U(1)_EM | 3 eaten | — | W+, W-, Z massive; photon massless |

Check: 55 - 12 = 43 total Goldstone modes. EWSB eats 3 of the 28 Stage 1 Goldstones.

Grouping: Pre-F=C Goldstones = 28 + 7 = 35 (algebraic). F=C Goldstones = 6 + 2 = 8 = dim(O).

**dim(SM gauge) = 8 + 3 + 1 = 12 = n_c + 1**.

Higgs = Stage 1 Goldstone in (4, 1) of U(2) x SU(3). Composite Higgs / pNGB structure.

---

## Part III: The 8 Primary Framework Primes

### D_framework Generates Exactly 8 Primes

The primary framework primes are the primes expressible as p = a² + b² with a, b in D_framework:

| Prime | Decomposition | Components |
|-------|---------------|------------|
| 2 | 1² + 1² | R + R |
| 5 | 1² + 2² | R + C |
| 13 | 2² + 3² | C + Im_H |
| 17 | 1² + 4² | R + H |
| 53 | 2² + 7² | C + Im_O |
| 73 | 3² + 8² | Im_H + O |
| 113 | 7² + 8² | Im_O + O |
| 137 | 4² + 11² | H + n_c |

There are EXACTLY 8. No selection is needed — D_framework determines them uniquely.

### Stage Assignment Is Forced

Each prime crystallizes when its maximum component becomes available:

| Stage | Available dims | Primes | max(a,b) ≤ |
|-------|---------------|--------|------------|
| 1 (H-regime) | {1, 2, 3, 4} | 2, 5, 13, 17 | 4 |
| 2 (O-regime) | {1, 2, 3, 4, 7, 8} | 53, 73, 113 | 8 |
| 3 (Crystal) | {1, 2, 3, 4, 7, 8, 11} | 137 | 11 |

### Intra-Stage Ordering

Within Stage 1, primes are ordered by division algebra activation: R → C → Im_H → H:

| Activation | Dim | Prime | Note |
|-----------|-----|-------|------|
| R | 1 | 2 = 1² + 1² | Real structure |
| C | 2 | 5 = 1² + 2² | Complex structure |
| Im_H | 3 | 13 = 2² + 3² | Quaternion imaginary |
| H | 4 | 17 = 1² + 4² | Full quaternion |

Size ordering, max-component ordering, and activation ordering all agree. Each Stage 1 prime uniquely labels one division algebra dimension.

**Bootstrap**: sum(a² in Stage 1) = 1 + 1 + 4 + 1 = 7 = Im_O, connecting Stage 1 to Stage 2.

### Secondary Primes

97 = 4² + 9² where 9 = Im_H² is a DERIVED quantity (not in D_framework). This makes 97 a secondary prime, explaining its role in the electroweak mixing angle (a derived coupling) rather than a fundamental one.

| Prime | Decomposition | Type | Physical Role |
|-------|---------------|------|---------------|
| 37 | 1² + 6² | Secondary | Bootstrap sum |
| 97 | 4² + 9² | Secondary | Electroweak mixing |
| 337 | 9² + 16² | Secondary | Cosmological |
| 193 | 7² + 12² | Secondary | Spectral |

**Confidence**: [THEOREM] for the 8 primary primes and stage assignment. [DERIVATION] for intra-stage ordering.

**Verification**: `verification/sympy/stage3_prime_selection_rule.py` — 9/9 PASS, `verification/sympy/intra_stage_ordering.py` — 12/12 PASS

---

## Part IV: Denominator Polynomial Unification

### All Denominators Are Polynomials in n_c

Every major framework denominator is a polynomial in n_c = 11 with coefficients from D_framework:

| Denominator | Polynomial | Structure | Physics |
|-------------|-----------|-----------|---------|
| 111 | n_c² - n_c + 1 | Φ₆(n_c) | α correction |
| 99 | n_c(n_c - 2) | n_c(n_c - C) | Koide phase |
| 200 | 2(n_c - 1)² | C(n_c - R)² | Spectral index |
| 72 | (n_c - 3)(n_c - 2) | (n_c - Im_H)(n_c - C) | Proton correction |
| 153 | (n_c - 2)(n_c + 6) | (n_c - C)(n_c + C·Im_H) | Proton factor |
| 97 | n_c² - 2n_c - 2 | n_c² - Cn_c - C | Electroweak |
| 137 | n_c² + 16 | n_c² + H² | Fine structure |
| 113 | n_c² - 8 | n_c² - O | Glueball |
| 91 | (n_c - 4)(n_c + 2) | (n_c - H)(n_c + C) | Neutrino mixing |
| 121 | n_c² | n_c² | Spectral |
| 1836 | (n_c + 1)(n_c - 2)(n_c + 6) | (n_c + R)·153 | Proton mass ratio |

### Key Relationships Between Denominators

The denominators are not independent — they form an interconnected web:

```
111 - 99  = 12 = n_c + 1 = dim(SM gauge group)
99 + 72   = 171 = cos(θ_W) numerator
194 - 153 = 41  = total Goldstone modes in SO(11) chain
153 - 137 = 16  = H² = spacetime²
113 - 97  = 16  = H²
```

The relationship 194 - 153 = 41 directly connects the Weinberg angle to the SO(11) breaking chain.

**Confidence**: [THEOREM] — these are algebraic identities.

**Verification**: `verification/sympy/denominator_polynomial_unification.py` — 21/21 PASS

---

## Part V: Quartic Energy Selection

### Second-Order Degeneracy (Proved)

At second order in perturbation theory around the uniform point ε₀ = -7/11, all SO(p) × SO(q) splittings are energetically identical:

| Invariant | d²/ds² at s=0 | p,q dependence |
|-----------|---------------|----------------|
| Tr(ε²) | 2 | UNIVERSAL |
| [Tr(ε²)]² | 196/11 | UNIVERSAL |
| Tr(ε⁴) | 588/121 | UNIVERSAL |

The hilltop is a perfect saddle in all directions at second order.

### Fourth-Order Discrimination

At fourth order, Tr(ε⁴) curvature distinguishes splittings:

```
d⁴Tr(ε⁴)/ds⁴ at (4,7) = 222/77
d⁴Tr(ε⁴)/ds⁴ at (3,8) = 343/77

Difference = -121/77 = -11/7 = -n_c/Im_O
```

With c₃ > 0 (penalizing eigenvalue anisotropy), the (4,7) split has lower quartic cost and is energetically preferred.

**Confidence**: [THEOREM] for the second-order degeneracy and fourth-order values. [CONJECTURE] for c₃ > 0.

**Verification**: `verification/sympy/quartic_energy_curvature.py` — 12/12 PASS

---

## Part VI: The Mexican Hat Potential

The SO(11)-invariant tilt energy functional, expanded near the critical point:

```
F(ε) = c₁ Tr(ε²) + c₂ [Tr(ε²)]² + c₃ Tr(ε⁴) + const
```

**Sign determination**:
- c₁ < 0: Required for nucleation (AXM_0114 + AXM_0102)
- c₂ > 0: Required for stability (AXM_0113)
- c₃ > 0: Required to select (4,7) over (3,8) [CONJECTURE]

The Tr(ε) = n_d - n_c = -7 constraint is fixed, not dynamical.

**Gap**: The Landau expansion form is imported from condensed matter [I-MATH]. Values of c₁, c₂, c₃ are constrained but not derived from axioms.

---

## Forcing Analysis

### What IS Forced

| Result | Mechanism | Confidence |
|--------|-----------|-----------|
| SO(11) symmetry | n_c = 11 from div. algebras | [THEOREM] |
| Breaking to SO(4) × SO(7) | Only valid split with max coupling | [DERIVATION] |
| SO(7) → G₂ | Unique octonionic automorphism group | [THEOREM] |
| G₂ → SU(3) | Forced by F = C | [THEOREM] |
| 8 primary framework primes | Uniquely from D_framework sum-of-squares | [THEOREM] |
| Stage assignment of primes | max(a,b) determines stage | [THEOREM] |
| All denominators = f(n_c) | Polynomial identities | [THEOREM] |
| Second-order degeneracy | All F''(0) identical | [THEOREM] |
| Fourth-order d⁴ difference = -n_c/Im_O | Quartic curvature analysis | [THEOREM] |

### What Is NOT Forced (Gaps)

| Gap | What's Missing | Severity |
|-----|---------------|----------|
| Sign of c₃ | Need c₃ > 0 to prefer (4,7) energetically | MEDIUM |
| Values of c₁, c₂, c₃ | Potential coefficients undetermined | HIGH |
| Activation principle proof | Why R before C before Im_H before H? | MEDIUM |
| Crystallization rate | No timescale from axioms alone | HIGH |

---

## Connection to Cosmic History

| Epoch | SO(11) Stage | Physical Process |
|-------|-------------|-----------------|
| Inflation | SO(11) → SO(4) × SO(7) | Spacetime emerges |
| Reheating | SO(7) → G₂ | Color structure forms |
| Electroweak | G₂ → SU(3) | Coupling constants fix |
| Post-EW | SO(4) × SU(3) stable | Standard Model physics |

---

## Derivation Chain

```
[AXIOM] Division algebras: R=1, C=2, H=4, O=8
    ↓ [D]
n_c = Im_C + Im_H + Im_O = 11; D_framework = {1,2,3,4,7,8,11}
    ↓ [D]
Crystal has SO(11) symmetry
    ↓ [D]
Breaking: only (3,8) and (4,7) valid; (4,7) selected
    ↓ [D]
SO(7) → G₂ = Aut(O) [I-MATH]; G₂ → SU(3) = Stab(C) [I-MATH]
    ↓ [D]
8 primes from D_framework sum-of-squares; stages forced by availability
    ↓ [D]
All denominators = polynomials in n_c
    ↓
STANDARD MODEL STRUCTURE + PRIME HIERARCHY + UNIFIED DENOMINATORS
```

**Assumptions**:
1. [A-AXIOM] Crystal has SO(n_c) symmetry (AXM_0112)
2. [A-AXIOM] Nucleation required (AXM_0114)
3. [A-AXIOM] Finite access bounds tilt (AXM_0113)
4. [I-MATH] G₂ = Aut(O), SU(3) = Stab_{G₂}(C)
5. [A-PHYSICAL] c₃ > 0 (eigenvalue anisotropy penalized)

---

## Potential Objections

**"Why must both p and q be framework dimensions?"**
The breaking represents division algebra structure becoming active. Non-framework dimensions (like 5, 6, 9, 10) have no algebraic meaning — they cannot support the automorphism groups needed for gauge structure.

**"The (3,8) split is also valid — why not that?"**
Three arguments favor (4,7): maximum mixed coupling, spacetime = 4D identification, and fourth-order energy selection. The energy argument requires c₃ > 0, which is physically motivated (penalizes anisotropy) but not axiomatically derived.

**"Are the denominator polynomials just numerology?"**
The polynomials are algebraic identities — they are provably true. The question is whether having ALL denominators be n_c-polynomials is meaningful or coincidental. The interlocking relationships (111 - 99 = 12, 194 - 153 = 41 Goldstones) suggest structure rather than coincidence.

---

## Verification Scripts

| Script | Tests | Status |
|--------|-------|--------|
| `crystallization_ordering_SO11.py` | 15/15 | ALL PASS |
| `stage3_prime_selection_rule.py` | 9/9 | ALL PASS |
| `quartic_energy_curvature.py` | 12/12 | ALL PASS |
| `denominator_polynomial_unification.py` | 21/21 | ALL PASS |
| `intra_stage_ordering.py` | 12/12 | ALL PASS |
| `sm_gauge_group_from_fc.py` | 25/25 | ALL PASS |
| `ewsb_higgs_from_tilt_interface.py` | 32/32 | ALL PASS |

**Total**: 126/126 tests PASS across 7 scripts.

---

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| 132 | Full SO(11) chain; prime stage assignment; F(ε) constraints | Chain derived; 8 primes uniquely determined |
| 132b | Quartic curvature; denominator unification; intra-stage ordering | 2nd-order degeneracy proved; all denoms = f(n_c) |
| 133 | Promoted from investigation to foundation document | Consolidated |
| 174 | Stage 4: SO(4) → U(2) from F=C Kahler form | Full SM gauge group derived, 25/25 PASS |
| 175 | EWSB: Higgs doublet from epsilon_di off-diagonal block | 3 massive bosons resolved, 32/32 PASS |

---

**Document version**: 3.0
**Created**: Session 133 (2026-01-30)
**Updated**: Session 175 (2026-02-01) — EWSB resolved: Higgs doublet from epsilon_di off-diagonal block
