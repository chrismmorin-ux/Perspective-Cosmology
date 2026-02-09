# DEF_0280 Definition: Boundary

**Tag**: 0280
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/12_topology.md

---

## Requires

- [DEF_0202: Points P]
- [DEF_0204: Connectivity weights Γ]

## Provides

- ∂U: Boundary of U

---

## Statement

If U is finite and closed:

```
∂U = { p ∈ P | p has incomplete neighborhood in Γ }
```

The boundary is where U's internal structure meets its limit.

---

## Notes

Boundary points have constrained connectivity compared to interior points.
