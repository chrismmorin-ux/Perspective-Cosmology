# DEF_0230 Definition: Overlap Parameter

**Tag**: 0230
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/05_overlap.md

---

## Requires

- [DEF_0214: Accessible content U_π]
- [DEF_0225: Adjacency relation ~]

## Provides

- γ: Overlap parameter (Jaccard index)

---

## Statement

For adjacent perspectives π₁ ~ π₂:

**γ (Overlap Parameter)**

```
γ(π₁, π₂) = dim(U_{π₁} ∩ U_{π₂}) / dim(U_{π₁} + U_{π₂})
```

Dimension-based Jaccard index of accessible content subspaces.

Here `U_{π₁} + U_{π₂}` denotes the subspace sum (span of the union), and `dim()` is the vector space dimension. This is consistent with DEF_0227/0228 which use `dim()` for the same objects.

**Range**: γ ∈ [0, 1]
- γ = 0: disjoint access (no overlap, U_{π₁} ∩ U_{π₂} = {0})
- γ = 1: identical access (same perspective, U_{π₁} = U_{π₂})

---

## Notes

The overlap parameter is the central quantity for regime classification.
It measures "how similar" two perspectives are.

**Notation (Session 189)**: Earlier versions used set cardinality |·| notation. Since U_π is a subspace of V (not a discrete set), `dim()` is the correct measure. See DEF_0200 conventions.
