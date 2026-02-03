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
| 13 | 2² + 3² | C + Im(H) |
| 17 | 1² + 4² | R + H |
| 53 | 2² + 7² | C + Im(O) |
| 73 | 3² + 8² | Im(H) + O |
| 113 | 7² + 8² | Im(O) + O |
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
4. **Fourth-power primes (CR-061)**: PARTIALLY RESOLVED (Session 184). The norm form identity N_{Q(ζ₈)/Q}(a + bζ₈) = a⁴ + b⁴ [PROVEN] shows fourth-power primes are cyclotomic norm values from Z[ζ₈], just as sum-of-squares primes are Gaussian norm values from Z[i]. This gives 97 = 2⁴ + 3⁴ = N(2 + 3ζ₈) using DIRECT framework dimensions dim(C)=2, Im(H)=3. The unified catalog has 16 primes (8 Level 1 + 10 Level 2, with 2 overlap). See `foundations/prime_theory/05b_fourth_power_norm_forms.md`. **Remaining**: Should AXM_0118 be formally generalized, or should Level 2 primes be a separate definition?

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

## Cross-References

- [framework/investigations/prime_attractor_selection_mechanism.md] — Full mechanism
- [framework/investigations/prime_crystallization_attractors.md] — Attractor dynamics
- [core/definitions/DEF_02C1_framework_dimensions.md] — D_framework definition
- [core/definitions/DEF_02C2_framework_primes.md] — Framework prime catalog
- [core/theorems/THM_0487_so11_breaking_chain.md] — n_c = 11 derivation context
- [core/theorems/THM_0488_denominator_unification.md] — Denominator polynomials
- [verification/sympy/sum_of_squares_prime_catalog.py] — Complete catalog verification
