# CNJ_0802 Conjecture: Gauge Groups from Automorphisms

**Tag**: 0802
**Type**: CONJECTURE
**Status**: ACTIVE
**Source**: framework/layer_2_correspondence.md

---

## Requires

- [DEF_0241: Automorphisms of B]
- [DEF_0242: Subspace decomposition]
- [THM_0440: Automorphism decomposition]

## Provides

- Identification: Aut(B_i) → Standard Model gauge groups

---

## Statement

**I-STRUCT-1**: Automorphisms of basis subspaces generate gauge symmetries.

```
Aut(B_color) → SU(3)_C
Aut(B_weak) → SU(2)_L
Aut(B_EM) → U(1)_Y
```

---

## Supporting Arguments

- Orthonormal basis rotations preserve inner product structure
- For n-dimensional subspace: Aut ⊆ U(n) (complex) or O(n) (real)
- SU(n) = U(n) with det = 1 constraint

---

## Open Questions

1. Why SU(n) specifically, not U(n) or O(n)?
2. Why these specific dimensions (3, 2, 1)?
3. How does chirality emerge?

---

## Classification

**PARTIALLY IMPORTED** — structure matches but values assumed.

This is essentially importing the Standard Model gauge structure.

---

## Notes

Layer 0 says Aut(B) = Aut(B_1) × ... × Aut(B_k) (THM_0440).
But doesn't specify which groups or why certain dimensions.
