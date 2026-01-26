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
γ(π₁, π₂) = |U_{π₁} ∩ U_{π₂}| / |U_{π₁} ∪ U_{π₂}|
```

Jaccard index of accessible content.

**Range**: γ ∈ [0, 1]
- γ = 0: disjoint access (no overlap)
- γ = 1: identical access (same perspective)

---

## Notes

The overlap parameter is the central quantity for regime classification.
It measures "how similar" two perspectives are.
