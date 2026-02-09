# DEF_0221 Definition: Propagation Operator

**Tag**: 0221
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/03_propagation.md

---

## Requires

- [DEF_0204: Connectivity weights Γ]
- [DEF_0205: Value space V]
- [DEF_0220: D-compatible edges E_D]

## Provides

- P_D: Propagation operator

---

## Statement

**P_D: V^P → V^P**

```
(P_D · f)(x) = Σ_{y ∈ E_D(x)} Γ({x,y}) · f(y)
```

Propagates content from D-compatible neighbors, weighted by Γ.

---

## Notes

This operator defines how information flows through the universe structure.
The weights Γ control attenuation along each edge.
