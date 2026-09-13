# AXM_0118 Axiom: Prime Attractor Selection (R2)

**Tag**: 0118
**Type**: AXIOM
**Status**: PROPOSED → under review (see Status Note below)
**Layer**: 1 (depends on crystallization axioms)
**Source**: framework/investigations/prime_attractor_selection_mechanism.md
**Added**: Session 77
**Refactored**: Session 144 (extracted physics to Layer 2, n_c derivation to THM_0487)

---

## Requires

- [AXM_0109: Crystal Existence (C1)]
- [AXM_0117: Crystallization Tendency (R1)]
- [AXM_0115: Algebraic Completeness (T0)]
- [I-MATH: Frobenius-Hurwitz] Division algebras over R have dims {1, 2, 4, 8}

## Derived Quantities Used

- **n_c = 11**: Crystal dimension. See THM_0487, THM_0488 for derivation and verification.
- **D_framework = {1, 2, 3, 4, 7, 8, 11}**: Framework dimensions. See DEF_02C1.
- **Framework primes**: See DEF_02C2 for catalog.

---

## Statement

**R2 (Prime Attractor Selection)**

When crystallization (AXM_0117) selects a direction in an algebraic space derived from division algebras, the selected direction corresponds to a prime number p expressible as:

```
p = a² + b²

where a, b ∈ D_framework
```

The selection principle is:

> Among all possible crystallization directions, the framework selects those corresponding to primes expressible as sums of squares of framework dimensions. The selection mechanism [CONJECTURE] minimizes some crystallization energy functional, but the explicit form of this functional is **not yet derived**.

## Formal Statement

For any symmetry breaking that selects a direction in an algebraic space:

```
The selected phase θ satisfies:
θ = π · p / q

where:
1. p is a framework prime (p = a² + b² with a, b ∈ D_framework)
2. q is expressible from framework dimensions
3. (p, q) minimizes crystallization energy among valid pairs
4. p uniquely encodes the relevant algebraic structures via a² + b²
```

---

## Status Note

This axiom remains PROPOSED because:
1. The **prime catalog** (which primes are expressible as a² + b² with a, b ∈ D_framework) is [DERIVATION] — pure number theory, verified by `sum_of_squares_prime_catalog.py`
2. The **physical selection claim** (that these primes determine physical constants) is [CONJECTURE] — motivated by observed pattern matches but no mechanism derived
3. The **selection functional** (what energy is minimized) is [OPEN] — not yet specified

Promotion to CANONICAL requires either: (a) deriving the selection mechanism from AXM_0117 crystallization dynamics, or (b) accumulating enough blind prediction successes to establish the pattern empirically. Sister axiom AXM_0117 was promoted in Session 178; this axiom has a higher bar because the mechanism is less understood.

---

## Notes

### Why Primes?

Primes are **irreducible** — they cannot be factored into smaller components. In the crystallization picture:

1. **Fundamental directions** that cannot be decomposed
2. **Stable attractors** of the crystallization flow
3. **Orthogonal modes** in the dimensional structure

A composite number represents a "mixed" mode that could decay into primes.

### Why Sums of Squares?

The sum-of-squares structure arises from:

1. **Fermat's theorem**: Only primes p = 2 or p ≡ 1 (mod 4) can be written as a² + b²
2. **Orthogonality**: Sums of squares encode perpendicular components
3. **Algebraic content**: The decomposition reveals which structures combine

### Framework Prime Catalog

All primes expressible as a² + b² with a, b ∈ D_framework:

| Prime | Decomposition | Algebraic Content |
|-------|---------------|-------------------|
| 2 | 1² + 1² | R + R |
| 5 | 1² + 2² | R + C |
| 13 | 2² + 3² | C + Im_H |
| 17 | 1² + 4² | R + H |
| 53 | 2² + 7² | C + Im_O |
| 73 | 3² + 8² | Im_H + O |
| 113 | 7² + 8² | Im_O + O |
| 137 | 4² + 11² | H + n_c |

---

## Consequences

1. **Crystallization selects specific numerical values** — not arbitrary, determined by prime structure
2. **Universal mechanism** — same selection principle across all algebraic spaces
3. **Predictive** — unmapped primes predict undiscovered constants

## Falsifiability

The mechanism would be **FALSIFIED** if:
1. A fundamental constant has no prime attractor structure
2. Predicted prime-constant mappings fail
3. Better measurements show constants deviate from prime ratios

## Assumption Classification (Session 181 Audit)

| Component | Classification | Status |
|-----------|---------------|--------|
| Prime catalog (8 primes from D_framework) | [DERIVATION] | Verified -- pure number theory |
| Sum-of-squares structure p = a^2 + b^2 | [A-STRUCTURAL] | Choice to use Euclidean norm; not derived |
| Physical selection claim | **[CONJECTURE]** | Pattern matching, no mechanism |
| Selection functional | **[OPEN]** | Not specified |
| Denominator selection rule | **[OPEN]** | Open Question 1 below |

**Honest assessment**: The prime catalog is solid mathematics. The claim that these primes determine physical constants is an observed pattern with statistical significance (see STATISTICAL_ANALYSIS_HONEST.md) but no derived mechanism. AXM_0118 should remain PROPOSED until either (a) a mechanism is derived from AXM_0117 dynamics, or (b) blind predictions succeed.

**Dependencies on AXM_0119 (new, S181)**: AXM_0119 (Transition Linearity) strengthens the division algebra foundation that produces D_framework. With G-004 resolved, the dimensions {1,2,3,4,7,8,11} are now fully derived from axioms.

---

## Open Questions

1. **What determines the denominator q?** What rule selects q for each context?
2. **Is this the only selection criterion?** Could additional constraints exist?
3. **Why only D_framework primes?** Among all Fermat-valid primes, why these 8?
4. **Fourth-power primes (CR-061)**: PARTIALLY RESOLVED (Session 184). The norm form identity N_{Q(ζ₈)/Q}(a + bζ₈) = a⁴ + b⁴ [PROVEN] shows fourth-power primes are cyclotomic norm values from Z[ζ₈], just as sum-of-squares primes are Gaussian norm values from Z[i]. This gives 97 = 2⁴ + 3⁴ = N(2 + 3ζ₈) using DIRECT framework dimensions dim(C)=2, Im_H=3. The unified catalog has 16 primes (8 Level 1 + 10 Level 2, with 2 overlap). See `foundations/prime_theory/05b_fourth_power_norm_forms.md`. **Remaining**: Should AXM_0118 be formally generalized, or should Level 2 primes be a separate definition?

---

## Relationship to Other Axioms

| Axiom | Relationship |
|-------|--------------|
| AXM_0117 (Crystallization Tendency) | R2 specifies WHERE crystallization converges |
| AXM_0115 (Algebraic Completeness) | Provides the division algebras that define D_framework |
| AXM_0110 (Perfect Orthogonality) | Primes encode orthogonal directions |

---

## Physics Applications (Layer 2)

> **Layer 0 purity**: This axiom is a mathematical selection principle.
> All physics applications (coupling constants, mixing angles, mass ratios) are
> documented in Layer 2 correspondence files:
>
> - Fine structure constant: `framework/investigations/alpha/ALPHA_DERIVATION_MASTER.md`
> - Koide formula: `framework/investigations/koide_formula_connection.md`
> - Weinberg angle: `framework/investigations/weinberg_prime_attractor.md`
> - CKM matrix: `framework/investigations/mixing_angles_division_algebra.md`
> - PMNS matrix: `framework/investigations/mixing_angles_division_algebra.md`
> - Full derivations summary: `registry/derivations_summary.md`

---

## Proposed Revision: Crystallization Norm Hypothesis (CNH)

**Proposed**: Session 244 (discovery), Session 246 (formalization)
**Status**: [CONJECTURE] with strong mathematical support — see `gaussian_norm_unification.py` (17/17 PASS), `cnh_deep_investigation.py` (22/22 PASS)
**Effect**: If adopted, REPLACES the current AXM_0118 statement with a deeper principle

### CNH Statement (Layer 0/1)

**R2' (Crystallization Norm Hypothesis)**

Crystallization dynamics (AXM_0117) operate through the norm form of C — the simplest non-trivial division algebra:

```
The Gaussian norm N: Z[i] → Z≥0 defined by N(a + bi) = a² + b²
is the canonical crystallization measure.

A configuration with integer multiplicity n is:
  CRYSTALLIZATION-COMPATIBLE   if n is a Gaussian norm (n = a² + b², a,b ∈ Z)
  CRYSTALLIZATION-INCOMPATIBLE if n is NOT a Gaussian norm

Crystallization dynamics (gradient flow on F[ε]) drive:
  incompatible → compatible  (FAVORED: releases crystallization energy)
  compatible → incompatible  (SUPPRESSED: costs crystallization energy)
```

### Why C is canonical [THEOREM]

C is the UNIQUE division algebra whose norm provides non-trivial discriminating power:

| Algebra | Norm form | Norms among Z>0 | Discrimination |
|---------|-----------|------------------|----------------|
| R | N(a) = a² | Perfect squares only | Too restrictive (almost nothing is a norm) |
| **C** | **N(a+bi) = a²+b²** | **Sums of two squares** | **Non-trivial partition of primes** |
| H | N(a+bi+cj+dk) = a²+b²+c²+d² | ALL positive integers (Lagrange) | No discrimination |
| O | Same as H (uses 4 of 8 components) | ALL positive integers | No discrimination |

### Consequences

**Consequence 1**: AXM_0118 (current statement) is DERIVED.

The framework primes (p = a²+b² with a,b ∈ D_framework) are Gaussian norm primes [THEOREM]. By Fermat: a prime p is a Gaussian norm iff p = 2 or p ≡ 1 (mod 4). All 10 framework primes satisfy this. The CNH explains WHY sums of squares appear — it's the C-norm.

**Consequence 2**: Framework dimension split is DERIVED.

```
Gaussian norms ∩ D_framework = {1, 2, 4, 8} = division algebra dimensions
Non-norms ∩ D_framework     = {3, 7, 11}   = imaginary dims + n_c
```

This is forced by number theory: dim(A) = 2^k is always a norm (N((1+i)^k) = 2^k). Im(A) = 2^k-1 ≡ 3 (mod 4) for k≥2, hence inert when prime.

**Consequence 3**: Li-7 suppression factor 1/3 is DERIVED [DERIVATION, S246].

Define Crystallization Compatibility Factor for nucleus (A, Z, N):
```
CCF(X) = #{x ∈ {A, Z, N} : x is a Gaussian norm} / 3
```

Li-7 (A=7, Z=3, N=4): only N=4 is a norm → CCF = 1/3
He-4 (A=4, Z=2, N=2): all three are norms → CCF = 1
Suppression = CCF(Li-7)/CCF(He-4) = 1/3 ✓

Alternative: via ideal counting a(n) = Σ_{d|n} χ₄(d):
CPC(Li-7)/CPC(He-4) = (0+0+1)/(1+1+1) = 1/3 ✓

**Consequence 4**: Bridge pattern in framework primes [DERIVATION, S246].

Framework primes split into:
- **Bridge primes** {13,53,73,113,137}: one norm + one non-norm component → encode cross-sector physics
- **Pure-norm primes** {2,5,17}: both norm components (associative dims only) → encode within-sector physics

### New predictions

| Nucleus | CCF | Prediction | Testable? |
|---------|-----|------------|-----------|
| Li-6 | 0 | Maximally suppressed (all non-norms) | Qualitatively consistent with ~10^-14 |
| B-11 | 1/3 | Same suppression as Li-7 | Would need BBN boron measurements |
| He-3 | 2/3 | Mild suppression (1 non-norm) | Large observational uncertainties |
| Be-9 | 1 | No suppression | Consistent (stable isotope) |

### Open questions for CNH

1. **CCF denominator**: Why 3? It's the number of nuclear quantum numbers {A,Z,N}. The coincidence 3 = Im_H may be structural or accidental.
2. **Quantitative meaning of CCF = 0**: Does CCF = 0 (Li-6, C-12) mean "forbidden" or "maximally suppressed"? Li-6 exists at ~10^-14, not zero.
3. **Scale of suppression**: CCF gives the FACTOR but not the absolute RATE. The mechanism for how CNH modifies BBN reaction rates is not specified.
4. **Norm vs non-norm in denominators**: The pattern (non-norm primes in denominators, norm primes in numerators) is observed in several formulas. Is this a consequence of the CNH, or a separate principle?

### Adoption status

**Status**: ACCEPTED as [CONJECTURE] (S249/S250)

The CNH is accepted as a [CONJECTURE] with strong mathematical support but without independent prediction confirmation:

| Criterion | Status | Notes |
|-----------|--------|-------|
| #1: Mathematical support | ✅ MET | 141/141 tests PASS (6 scripts, S244-S250) |
| #2: Subsumes AXM_0118 | ✅ MET | All framework primes are Gaussian norm primes |
| #3: Explains Li-7 | ✅ MET | Factor 1/3 derived via CCF |
| #4: Independent prediction | ❌ BLOCKED | He-3/B-11/Li-6 observationally inaccessible; no alternate paths (S249) |
| #5: CCF denominator | ✅ MET | Multiplicative vs additive independence forces 3 (S248) |

**Why accepted as [CONJECTURE] rather than waiting**:
- Criterion #4 has no viable path — all observational tests are blocked
- S249 exhaustively searched alternate predictions (nuclear stability r=-0.15, magic numbers fail, CNO no pattern, particle QNs trivial)
- Im_H = 3 connection is an IRREDUCIBLE GAP requiring [I-PHYSICS] input
- Mathematical exploration of extensions ongoing in parallel session (S250+)

**Organizational insight (S250)**: The CNH classifies framework sectors:
- Gravity (n_d=4): NORM sector
- Color (N_c=3): NON-NORM sector
- EW/EM (mixed): BRIDGE sector

This is genuine organizational insight but NOT predictive power.

---

## Cross-References

- [framework/investigations/prime_attractor_selection_mechanism.md] — Full mechanism
- [framework/investigations/prime_crystallization_attractors.md] — Attractor dynamics
- [core/definitions/DEF_02C1_framework_dimensions.md] — D_framework definition
- [core/definitions/DEF_02C2_framework_primes.md] — Framework prime catalog
- [core/theorems/THM_0487_so11_breaking_chain.md] — n_c = 11 derivation context
- [core/theorems/THM_0488_denominator_unification.md] — Denominator polynomials
- [verification/sympy/sum_of_squares_prime_catalog.py] — Complete catalog verification
- [verification/sympy/gaussian_norm_unification.py] — CNH proof (17/17 PASS, S244)
- [verification/sympy/cnh_deep_investigation.py] — CNH deep investigation (22/22 PASS, S246)
- [verification/sympy/cnh_phase2_denominator.py] — CCF denominator (26/26 PASS, S248)
- [verification/sympy/cnh_phase3_predictions.py] — Alternate prediction paths (28/28 PASS, S249)
- [verification/sympy/cnh_imh_derivation.py] — Im_H connection analysis (12/12 PASS, S249)
- [verification/sympy/cnh_particle_physics.py] — Particle physics extension (16/16 PASS, S249)
- [verification/sympy/cnh_catalog_reassessment.py] — Catalog norm classification (20/20 PASS, S250)
