# DEF_02C1 Definition: Framework Dimensions

**Tag**: 02C1
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: framework/investigations/crystallization/symmetry_breaking_chain.md
**Added**: Session 144 (formalization from S132)

---

## Requires

- [THM_0484: Division algebra structure]
- [I-MATH: Hurwitz theorem — R, C, H, O are the only normed division algebras]

## Provides

- The set D_framework of distinguished dimensions

---

## Statement

The **framework dimension set** D_framework is:

```
D_framework = {1, 2, 3, 4, 7, 8, 11}
```

These are the seven dimensions arising from the four normed division algebras:

| Algebra | dim | dim(Im) | Source |
|---------|-----|---------|--------|
| R (reals) | 1 | 0 | — |
| C (complex) | 2 | 1 | Im(C) |
| H (quaternions) | 4 | 3 | Im(H) |
| O (octonions) | 8 | 7 | Im(O) |

Plus the crystal dimension:

```
n_c = dim(Im(C)) + dim(Im(H)) + dim(Im(O)) = 1 + 3 + 7 = 11
```

### Equivalent characterization

D_framework = {dim(A) : A ∈ {R,C,H,O}} ∪ {dim(Im(A)) : A ∈ {C,H,O}} ∪ {n_c}

Note: dim(Im(R)) = 0 is excluded (trivial). dim(R) = 1 = dim(Im(C)), so the set has exactly 7 elements.

---

## Dependencies

- [THM_0484]: Division algebra structure (establishes R, C, H, O)
- [I-MATH: Hurwitz]: Only four normed division algebras exist

## Used By

- [DEF_02C2]: Framework primes (sums of squares from D_framework)
- Denominator polynomial unification (all coefficients from D_framework)
- SO(11) crystallization chain (all stage dimensions from D_framework)
- All numerical predictions

---

## Notes

Every denominator in the framework's numerical predictions is a polynomial in n_c = 11 whose coefficients belong to D_framework. This is the content of the denominator polynomial unification theorem.
