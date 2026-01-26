# DEF_0220 Definition: D-Compatible Edges

**Tag**: 0220
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/03_propagation.md

---

## Requires

- [DEF_0202: Points P]
- [DEF_0203: Simplicial complex Σ]
- [DEF_0212: Direction set D]

## Provides

- E_D(x): Set of D-compatible neighbors

---

## Statement

Given direction set D at point x:

```
E_D(x) = { y ∈ P : {x,y} ∈ Σ_1 and direction(x→y) ∈ D }
```

The neighbors of x reachable along directions in D.

---

## Notes

This filters the simplicial neighbors by direction compatibility.
Used in defining the propagation operator.
