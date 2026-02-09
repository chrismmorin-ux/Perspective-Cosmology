# DEF_0212 Definition: Direction Set

**Tag**: 0212
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/02_perspective.md
**Updated**: Session 133 (CR-005: clarified T_p)

---

## Requires

- [DEF_0210: Perspective π]
- [DEF_0211: Anchor point p]
- [DEF_0203: Simplicial complex Σ]

## Provides

- D: Direction set constraining perspective

---

## Statement

**Definition (Available directions at p)**

```
T_p = { q ∈ P : {p, q} ∈ Σ₁ }
```

T_p is the set of points directly connected to p via 1-simplices (edges) in the simplicial complex Σ. This is the discrete analogue of a tangent space: the set of "directions" available from p.

**D ⊂ T_p** (Direction Set)

A subset of available directions from the anchor point p.
Constrains which paths are followed during propagation.

---

## Notes

The direction set determines which "directions" a perspective can look.

**Terminology**: T_p is called the "tangent space at p" by analogy with differential geometry, but in this discrete framework it is simply the 1-neighborhood (link) of p in the simplicial complex. No smooth manifold structure is assumed.
