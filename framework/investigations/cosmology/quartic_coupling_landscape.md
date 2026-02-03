# The Quartic Coupling Landscape

**Status**: CANONICAL — Research synthesis
**Created**: Session 136
**Purpose**: Determine whether the Landau quartic coupling ratio λ = c₃/c₂ is fixed or free
**Priority**: HIGH — F6 in RECOMMENDATION_ENGINE.md

---

## The Question

The SO(11)-invariant Landau free energy for the symmetric traceless order parameter ε is:

```
F(ε) = c₁ Tr(ε²) + c₂ [Tr(ε²)]² + c₃ Tr(ε⁴)
```

[Tr(ε²)]² and Tr(ε⁴) are the **two independent quartic SO(n) invariants** for n ≥ 4. The ratio λ = c₃/c₂ determines which subgroup is selected at the phase transition.

**Central question**: Is λ determined by mathematical structure, or is it a free phenomenological parameter?

---

## Plain Language

When a crystal freezes, the energy landscape has bumps and valleys. For an 11-dimensional crystal, there are exactly two independent ways to build quartic "bumps" that respect the full rotational symmetry. The ratio between these two quartic terms determines which way the crystal prefers to break its symmetry — into a 4+7 split (giving spacetime + internal space) versus a 3+8 split (which wouldn't work for physics).

We know the ratio must be positive (c₃ > 0, from block stability). The question is whether its exact value is determined by the mathematics, or whether it's a free parameter that nature simply "chose."

**One-sentence version**: The quartic coupling ratio λ controls which symmetry breaking pattern wins, and we investigated five avenues for whether it's mathematically determined.

---

## Five Avenues Investigated

### Avenue 1: Casimir Structure

**Question**: Does the quartic Casimir of SO(11) fix the ratio Tr(ε⁴)/[Tr(ε²)]²?

**Answer**: **NO.**

The quartic Casimir operator has a fixed eigenvalue on any irreducible representation (Schur's lemma). However, this constrains traces of *generator matrices*, not the polynomial potential on *field space*. The order parameter ε takes values in the 65-dimensional representation space — the Landau potential coefficients c₂, c₃ are phenomenological parameters encoding microscopic physics, not group-theoretic identities.

**Key distinction**: Casimir eigenvalues constrain the representation; Landau coefficients parameterize the potential on that representation space. These are different mathematical objects.

**Confidence**: [THEOREM] — The distinction is mathematically rigorous.

### Avenue 2: Representation Theory (Number of Invariants)

**Question**: Does the Clebsch-Gordan decomposition of the quartic tensor product fix λ?

**Answer**: **NO** — it fixes the *number* of invariants (exactly 2 for n ≥ 4), not their ratio.

The symmetric traceless 2-tensor of SO(11) has dimension n = 65. The integrity basis theorem guarantees exactly (n-1) independent traces {Tr(ε²), ..., Tr(εⁿ)} for an n×n symmetric traceless matrix. At quartic order:

| n | Independent quartic invariants | Reason |
|---|-------------------------------|--------|
| 2 | 1 | A² ∝ I for traceless 2×2 |
| 3 | 1 | Cayley-Hamilton: Tr(A⁴) = ½[Tr(A²)]² |
| **n ≥ 4** | **2** | Tr(A⁴) and [Tr(A²)]² are independent |

For n = 3 (the Landau-de Gennes nematic case), there is only ONE quartic invariant because Tr(A⁴) = ½[Tr(A²)]² for traceless 3×3 matrices. **This identity does NOT hold for n ≥ 4, including n = 11.**

The CG decomposition of Sym⁴(65) would count trivial representations (confirming: 2), but would not fix their relative coefficient. No published tables exist for SO(11) quartic tensor products.

**Confidence**: [THEOREM] — Number of invariants is rigorous. Non-fixing of ratio follows from standard Landau theory.

**References**: Minimal integrity bases (arXiv:1805.01701), Toledano & Toledano "Landau Theory of Phase Transitions"

### Avenue 3: Wilson-Fisher Fixed Point — THE PROMISING PATH

**Question**: At the RG fixed point, is λ* uniquely determined?

**Answer**: **YES in principle** — at each fixed point, the ratio is uniquely fixed. But for SO(11):
- **No real mixed fixed point exists** at one loop (discriminant < 0)
- Only trivial fixed points: Gaussian, isotropic (λ*=0), anisotropic (λ*=∞)
- All are unstable saddle points in the physical region
- This holds for ALL N ≥ 4 tested (N=4,5,6,7,8,11)

**Key literature**:

| Reference | Finding |
|-----------|---------|
| Rychkov & Stergiou (2019) | General theory of multiscalar RG flows with 2 quartic invariants; fixed points are isolated |
| Pelissetto & Vicari (2002) | Comprehensive review of O(N)×O(M) models; chiral fixed-point ratios computed to 5-6 loops |
| Osborn & Stergiou (2021) | For N = 5, 6, 7: large numbers of irrational fixed points exist |
| Reehorst et al. (2025) | Conformal bootstrap suggests N_c > 3.78 for stable chiral FP in d = 3 |

**Mechanism**: The beta-function equations for the two quartic couplings (u for [Tr(φ²)]², v for Tr(φ⁴)) are:

```
β_u = -ε u + A₁₁ u² + A₁₂ uv + A₁₃ v²
β_v = -ε v + A₂₁ u² + A₂₂ uv + A₂₃ v²
```

At a fixed point (β_u = β_v = 0), the ratio λ* = v*/u* satisfies a quadratic whose coefficients depend on N.

**COMPUTED RESULT** (Session 136): All 6 coefficients are now analytic:

| Coefficient | Formula | N=11 value |
|-------------|---------|------------|
| A₁₁ | n + 8 | 73 |
| A₁₂ | (N²+3N-6)/(3N) | 148/33 ≈ 4.485 |
| A₁₃ | (N²+6)/(6N²) = 1/6 + 1/N² | 127/726 ≈ 0.175 |
| A₂₁ | 0 | 0 |
| A₂₂ | 12 | 12 |
| A₂₃ | (2N²+9N-36)/(6N) = N/3 + 3/2 - 6/N | 305/66 ≈ 4.621 |

The mixed-FP quadratic A₁₃λ² + (A₁₂-A₂₃)λ + (A₁₁-12) = 0 has **discriminant = -42.66 < 0** for N=11. No real mixed fixed points exist. Transition is first-order.

**Verification**: `verification/sympy/so11_beta_functions.py` — **13/13 PASS**

**Confidence**: [DERIVATION] — All 6 analytic coefficients verified numerically for N = 4,5,6,7,8,11.

### Avenue 4: Topological Constraints

**Question**: Does the topology of SO(11)/SO(4)×SO(7) constrain λ?

**Answer**: **Constrains dynamics, not λ directly.**

The coset space SO(11)/SO(4)×SO(7) is the oriented Grassmannian of 4-planes in R¹¹. Its homotopy groups:

| Group | Value | Physical meaning |
|-------|-------|------------------|
| π₁ | 0 | No cosmic strings |
| π₂ | Z/2Z | Z₂ monopole defects exist |
| π₃ | Requires further computation | Textures |

**Derivation of π₂ = Z/2Z**: From the long exact sequence:
```
π₂(SO(11)) → π₂(M) → π₁(SO(4)×SO(7)) → π₁(SO(11))
    0       →  π₂  →   Z/2Z × Z/2Z    →   Z/2Z
```
The kernel of the map Z/2Z × Z/2Z → Z/2Z is Z/2Z (diagonal element), giving π₂(M) = Z/2Z.

**Implication**: The Z₂ monopoles are topologically stable point defects. Via the Halperin-Lubensky-Ma mechanism, these can drive the transition first-order, which affects the *nature* of the transition but doesn't algebraically fix λ.

**Confidence**: [THEOREM] for π₁ = 0, π₂ = Z/2Z. [CONJECTURE] for dynamical implications.

### Avenue 5: Literature Consensus

**Question**: What do established references say?

**Answer**: **λ is free in pure Landau theory; fixed at RG fixed points.**

| Source | Position |
|--------|----------|
| Toledano & Toledano (1987) | Quartic coupling ratio is phenomenological |
| Mukamel & Grinstein (1982) | Ratio determines ground state symmetry; treated as free |
| Pelissetto & Vicari (2002) | Fixed at RG fixed points; known perturbatively |
| Allender & Longa (2008) | Full phase diagram as function of quartic ratio |

**Confidence**: [THEOREM] — reflects mathematical consensus.

---

## Summary Table

| Avenue | Fixes λ? | Confidence | Detail |
|--------|----------|------------|--------|
| 1. Casimir structure | **No** | [THEOREM] | Casimir ≠ potential coefficients |
| 2. Representation theory | **No** | [THEOREM] | Fixes count (= 2), not ratio |
| 3. RG fixed point | **No** (no stable FP for N≥4) | [DERIVATION] | Discriminant < 0; transition is first-order |
| 4. Topology | **No** (constrains dynamics) | [THEOREM] | π₂ = Z/2Z gives monopoles, not λ |
| 5. Literature | **Confirms: free in Landau** | [THEOREM] | Fixed only at RG fixed points |

---

## What the Framework Already Established

| Result | Status | Script |
|--------|--------|--------|
| c₃ > 0 from block stability | [DERIVATION] | `c3_sign_from_stability.py` (12/12 PASS) |
| Ground state a*=0, b*=-1 | [THEOREM] | `landau_coefficient_derivation.py` (12/12 PASS) |
| Stationarity: μ² = 14 + 2λ | [THEOREM] | `landau_coefficient_derivation.py` |
| SSB threshold: μ²_crit = 98/11 | [THEOREM] | `ssb_critical_ratio.py` (11/11 PASS) |
| (4,7) unique for a*=0 with b*=-1 | [THEOREM] | `landau_coefficient_derivation.py` |
| All I₂ₖ = Im_O = 7 at ground state | [THEOREM] | `landau_coefficient_derivation.py` |

---

## The RG Fixed-Point Analysis — COMPLETED

### Method
The one-loop beta functions for the SO(N) symmetric traceless matrix model were computed via:

1. **Orthonormal basis** for N×N symmetric traceless matrices (dimension n = N(N+1)/2 - 1).
2. **Explicit bubble contractions** of the two quartic vertex tensors U (from [Tr(φ²)]²) and T (from Tr(φ⁴)), summing over all basis pairs in s+t+u channels.
3. **Least-squares decomposition** of T·T into U and T components (R² = 1.0 to machine precision for all N ≥ 4).

### All Six Coefficients — Analytic

| Coefficient | Formula | Simplified | N=11 |
|-------------|---------|------------|------|
| A₁₁ | n + 8 | — | 73 |
| A₁₂ | (N²+3N-6)/(3N) | — | 148/33 |
| **A₁₃** | **(N²+6)/(6N²)** | **1/6 + 1/N²** | **127/726** |
| A₂₁ | 0 | — | 0 |
| A₂₂ | 12 | — | 12 |
| **A₂₃** | **(2N²+9N-36)/(6N)** | **N/3 + 3/2 - 6/N** | **305/66** |

A₁₃ and A₂₃ **ANALYTICALLY DERIVED** from symmetric traceless projector identity via symbolic trace algebra. Verified numerically (R²=1.0) for N = 4–11 and by exact rational arithmetic for N = 4–7. Status: **[THEOREM]**.

### Fixed-Point Quadratic

For λ* = v*/u*, the quadratic A₁₃λ² + (A₁₂ - A₂₃)λ + (n - 4) = 0 has **negative discriminant for ALL N ≥ 4** (proven algebraically):

| N | n | Discriminant | Mixed FPs? |
|---|---|-------------|------------|
| 3 | 5 | +0.22 | 2 (both unstable) |
| 4 | 9 | -4.33 | None |
| 5 | 14 | -8.18 | None |
| 6 | 20 | -12.42 | None |
| 7 | 27 | -17.21 | None |
| 8 | 35 | -22.60 | None |
| **11** | **65** | **-42.66** | **None** |

The discriminant becomes increasingly negative with N (asymptotically ~ -N²/3). No stable Wilson-Fisher-type fixed point exists.

**Analytic proof**: The discriminant equals p(N)/(12N²) where p(N) = -4N⁴ - 4N³ + 19N² - 72N + 432. For N ≥ 4: drop the negative terms -4N³ and -72N to get p(N) < -4N⁴ + 19N² + 432 = N²(-4N²+19) + 432 ≤ 16(-45) + 432 = -288 < 0. QED.

The largest real root of p(N) is N ≈ 2.906, below 3. So p(N) < 0 for all integers N ≥ 3.

### Conclusion

The SO(11) symmetry breaking transition is **first order** at one loop. The quartic coupling ratio λ = c₃/c₂ is **not fixed by the one-loop RG**. This is consistent with general expectations for large-N matrix models (Coleman-Weinberg, Mukamel & Grinstein).

**Verification**:
- `verification/sympy/so11_beta_functions.py` — **13/13 PASS** (numerical coefficients)
- `verification/sympy/so11_discriminant_proof.py` — **11/11 PASS** (analytic proof disc < 0)
- `verification/sympy/so11_beta_exact_arithmetic.py` — exact rational verification of A₁₃, A₂₃
- `verification/sympy/so11_beta_analytic_derivation.py` — **13/13 PASS** (symbolic projector derivation of A₁₃, A₂₃)

---

## Derivation Chain

```
[AXIOM] Division algebras → n_c = 11, SO(11) symmetry
    ↓ [D]
[D] Landau expansion: F = c₁I₂ + c₂I₂² + c₃I₄ [I-MATH: Landau theory]
    ↓ [D]
[D] Exactly 2 quartic invariants for N ≥ 4 [I-MATH: integrity basis theorem]
    ↓ [D]
[D] c₃ > 0 from block stability [D: Session 132b]
    ↓ [D]
[D] λ = c₃/c₂ is free in Landau theory [I-MATH: standard result]
    ↓ [D]
[D] λ* fixed at RG fixed points [I-MATH: Rychkov & Stergiou 2019]
    ↓ [D]
[THEOREM] All 6 one-loop coefficients are analytic functions of N (A₁₃, A₂₃ derived from projector algebra)
    ↓ [D]
[THEOREM] Discriminant < 0 for ALL N ≥ 4 → no mixed FP → first-order transition
    ↓ [D]
[CONJECTURE] λ remains free; must be determined by non-perturbative effects
```

**Assumptions**:
1. [A-AXIOM] Crystal has SO(n_c) symmetry
2. [I-MATH] Landau theory applies to the symmetry breaking
3. [I-MATH] RG flow reaches a fixed point (not guaranteed for all N)
4. [A-TECHNICAL] One-loop approximation is adequate

---

## What Would Falsify This

- If N = 11 has NO stable fixed point → λ remains truly free (transition is first-order)
- If the fixed-point λ* gives (3,8) preference over (4,7) → contradicts framework
- If higher-loop corrections drastically change λ* → one-loop insufficient

---

## References

- Rychkov & Stergiou, SciPost Phys. 6, 008 (2019) — General multiscalar RG flows
- Pelissetto & Vicari, Phys. Rep. 368, 549 (2002) — Critical phenomena review
- Osborn & Stergiou, JHEP 04, 128 (2021) — Fixed points for O(N) models
- Toledano & Toledano, "Landau Theory of Phase Transitions" (World Scientific, 1987)
- Allender & Longa, Phys. Rev. E 78, 011704 (2008) — Biaxial nematics
- Reehorst et al., SciPost Phys. 18, 060 (2025) — Bootstrap for frustrated magnets
- arXiv:1805.01701 — Minimal integrity bases for second-order tensors

---

## Avenue 6: Coleman-Weinberg Effective Potential

**Question**: Does the one-loop CW effective potential determine λ non-perturbatively?

**Answer**: **NO** — CW is equivalent to one-loop RG improvement.

### Mass Spectrum at (4,7) Background

The mass matrix M²(ε₀) was computed from the exact Hessian d²V and verified by numerical diagonalization of the full 65×65 matrix (max error 8.88×10⁻¹⁵):

| Sector | Multiplicity | M²/σ² | SO(4)×SO(7) rep |
|--------|-------------|--------|-----------------|
| σ (radial) | 1 | 12(u + vI₄) | (1,1) |
| Goldstone | 28 | 4(u + vI₄) | (4,7) cross-block |
| Intra-SO(4) | 9 | 4u + 21v/11 | (10,1) sym traceless of SO(4) |
| Intra-SO(7) | 27 | 4u + 48v/77 | (1,28) sym traceless of SO(7) |

where I₄ = I₄(4,7) = 37/308 and σ² = Tr(ε₀²).

Key properties:
- **σ/Goldstone ratio = 3** (both proportional to u + vI₄)
- **At extremum** u + vI₄ = 0: 29 massless modes (1σ + 28 Goldstone). Goldstone theorem verified.
- **Intra-4/Intra-7 mass ratio = 10** at extremum (exact)

### CW Potential

The Gildener-Weinberg one-loop potential along the flat direction is:

```
V_CW(σ) = Bσ⁴[ln(σ²/⟨σ²⟩) - 1/2]
```

where B = (1/64π²) Σᵢ nᵢ Mᵢ⁴ depends on λ = v/u through:

```
A(λ) = Σᵢ nᵢ mᵢ⁴ = 1168 + (31904/77)λ + (43906/847)λ²
```

Since A(λ) is a polynomial in λ with no special zeros or extrema in the physical region, CW provides no mechanism to select a particular λ. The Gildener-Weinberg dimensional transmutation sets the scale ⟨σ⟩ but leaves λ free.

**Confidence**: [DERIVATION] — CW equivalence to one-loop RG is standard (Ford, Jones, Stephenson & Einhorn 1993).

### Ground State Selection: (5,6) vs (4,7)

For the quartic-only potential V = u I₂² + v I₄:
- **With v > 0**: the flat direction minimizes I₄(D) over all diagonal backgrounds D
- **I₄ values**: (5,6) gives I₄ = 31/330 while (4,7) gives I₄ = 37/308
- **Therefore (5,6) is preferred**, not (4,7)!

This means the quartic potential alone does NOT select (4,7). Additional physics is required.

### Cubic Invariant — The Missing Piece

The full Landau potential with cubic term:

```
V = r Tr(φ²) + w Tr(φ³) + u [Tr(φ²)]² + v Tr(φ⁴)
```

The cubic invariant I₃ = Tr(D³) vanishes for p = q (symmetric splits) but is nonzero for p ≠ q.

With w < 0 (negative cubic), the energy functional E(D) = -|w|I₃(D) + v·I₄(D) selects:

| η = σv/|w| | Selected split | Mechanism |
|-------------|----------------|-----------|
| 0-1 | (1,10) | Cubic dominates |
| ~1 | (2,9) | Transition |
| ~2 | (3,8) | Transition |
| **~3** | **(4,7)** | **Cubic-quartic balance** |
| ≥5 | (5,6) | Quartic dominates |

**(4,7) requires η ≈ 3** — a specific ratio of quartic to cubic couplings.

**Confidence**: [CONJECTURE] — Mechanism is plausible but the origin of the cubic coupling is not derived from axioms.

**Verification**: `verification/sympy/coleman_weinberg_so11.py` — **12/12 PASS**

---

## What Would Falsify This

- If a stable mixed fixed point is found at higher loops → λ could be fixed after all
- If non-perturbative methods (lattice, bootstrap) find a continuous transition for N=11 → our one-loop analysis is insufficient
- If higher-loop corrections make the discriminant positive → mixed FPs exist
- If the cubic coupling w has no framework-derivable origin → (4,7) selection is phenomenological

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| 132-132b | Landau expansion, c₃ sign, quartic energy selection | c₃ > 0 forced; (4,7) preferred |
| 134 | Ground state geometry, stationarity | a*=0, b*=-1, μ² = 14+2λ |
| 136 | Five-avenue investigation, beta function computation | All 6 coefficients analytic; disc < 0; first-order |
| 138 | Discriminant proof; exact arithmetic verification | disc < 0 PROVEN for all N≥4; A₁₃,A₂₃ exact |
| 138c | Coleman-Weinberg effective potential analysis | CW doesn't pin λ; quartic selects (5,6); cubic Tr(φ³) needed for (4,7) |

---

**Document version**: 5.0
**Created**: Session 136
**Updated**: Session 138c (Coleman-Weinberg analysis; mass spectrum; cubic-quartic ground state selection)
