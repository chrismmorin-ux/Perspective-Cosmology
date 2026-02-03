# THM_0488: Denominator Polynomial Unification

**Status**: SKETCH
**Source**: framework/investigations/crystallization/crystallization_ordering_from_SO11.md (CANONICAL)
**Added**: Session 144 (formalization from S132b)

---

## Statement

Every framework denominator is a polynomial in n_c = 11 with coefficients from D_framework = {1, 2, 3, 4, 7, 8, 11} [DEF_02C1].

Explicitly, all 14 denominators:

| Denominator | Polynomial in n_c | Factored form | Interpretation [LAYER 2/3] |
|-------------|-------------------|---------------|---------|
| 111 | n_c² - n_c + 1 | Φ₆(n_c) | Alpha correction |
| 99 | n_c(n_c - 2) | n_c · (n_c - C) | Koide phase |
| 200 | 2(n_c - 1)² | C · (n_c - R)² | Cosmological |
| 72 | (n_c - 3)(n_c - 2) | (n_c - Im_H)(n_c - C) | Proton correction |
| 153 | (n_c - 2)(n_c + 6) | (n_c - C)(n_c + C·Im_H) | Proton factor |
| 97 | n_c² - 2n_c - 2 | n_c² - C·n_c - C | Electroweak |
| 137 | n_c² + 16 | n_c² + H² | Fine structure |
| 113 | n_c² - 8 | n_c² - O | Glueball |
| 91 | (n_c - 4)(n_c + 2) | (n_c - H)(n_c + C) | Neutrino mixing |
| 121 | n_c² | n_c² | Spectral |
| 44 | 4·n_c | H · n_c | Cosmological |
| 12 | n_c + 1 | n_c + R | Gauge dimension |
| 19 | n_c + 8 | n_c + O | Gauge total |
| 1836 | (n_c+1)(n_c-2)(n_c+6) | (n_c+R) · 153 | Proton mass ratio |

## Proof

Each entry is verified by direct substitution of n_c = 11 into the polynomial. The polynomial coefficients are checked to belong to D_framework ∪ {0} ∪ (-D_framework).

**Computational verification**: `denominator_polynomial_unification.py` — 21/21 PASS

## Inter-Denominator Relationships

Key algebraic relationships between denominators:

```
111 - 99  = 12  = n_c + 1 = dim(SM gauge group)
99 + 72   = 171 = cos(θ_W) numerator
194 - 153 = 41  = total Goldstone modes in SO(11) chain [THM_0487]
153 - 137 = 16  = H² = spacetime dimension squared
113 - 97  = 16  = H²
```

The linking quadratic for the Goldstone identity: n² - 15n + 44 = (n - 4)(n - 11) = 0, with roots n_d = 4 and n_c = 11. Discriminant = 49 = Im_O².

## Dependencies

- n_c = 11 (crystal dimension)
- [DEF_02C1]: D_framework (coefficient set)
- [THM_0487]: SO(11) chain (structural origin for some relationships)

## Verification

- `verification/sympy/denominator_polynomial_unification.py` — 21/21 PASS
- `verification/sympy/goldstone_denominator_identity.py` — 16/16 PASS
- `verification/sympy/denominator_spacing_and_barriers.py` — 15/15 PASS

## Implications

> **[LAYER 2/3 CORRESPONDENCE]**: Physical interpretation requires Layer 2 correspondence rules. The polynomial structure is Layer 1 mathematics; identification of denominators with physical constants (fine structure, proton mass, etc.) is Layer 2/3.

- [LAYER 1] A single number (n_c = 11) determines ALL framework denominators
- [LAYER 1] Explains why denominators look "random" individually but are algebraically unified
- [LAYER 1] Inter-denominator relationships are structural, not coincidental
- [LAYER 1] H² = 16 spacing chain: 97, 113, 121, 137, 153 (span = 56 = O × Im_O)

## Pattern vs Derivation (Session 189 Audit)

**This is a pattern observation, not a derivation.** The distinction is critical:

- **What is shown**: 14 denominators can all be expressed as low-degree polynomials in n_c = 11 with coefficients from a small set.
- **What is NOT shown**: Why denominators MUST be polynomial in n_c. No mechanism derives the polynomial form from axioms.
- **Post-hoc fitting risk**: The denominators were known BEFORE the polynomial expressions were found. The polynomials were fit to known values, not predicted.

**Hallucination Risk Score**: 8 (matches known values +2, post-hoc +2, seems "too good" +2, multiple verifications -2, open gaps acknowledged -1, no falsification +2, no uniqueness argument +3 → net 8).

## Uniqueness

The space of fitting polynomials has NOT been characterized. Key questions:

1. **How many degree-2 polynomials in 11 give integers in [10, 2000]?** All of them — the space is dense. The constraint is weak.
2. **Is the coefficient set D_framework = {1,2,3,4,7,8,11} special?** These are the division algebra dimensions. But any set of 7 small integers would allow similar fits.
3. **Could a different n_c value work?** No systematic search of other base values has been published. If n_c = 13 also unifies denominators, the observation loses significance.

**Assessment**: Without a uniqueness argument, the polynomial observation is [CONJECTURE], not [DERIVATION].

## Falsification Criterion

This pattern would be falsified if:
1. A new framework denominator cannot be expressed as a low-degree polynomial in n_c with D_framework coefficients
2. Another small integer (n_c = 7, 13, 17, etc.) produces equally good polynomial fits
3. Random integer sets of similar size produce comparable unification rates

## Open Gaps

- **Why polynomials?** The observation that denominators are polynomials in n_c is verified but lacks a structural derivation explaining WHY this must be so.
- **Coefficient selection**: Why specific D_framework coefficients appear in each polynomial is not derived from axioms.
- **Selection bias**: The 14 denominators were chosen from framework formulas. Were denominators that DON'T fit excluded? The denominator set itself may be curated.
