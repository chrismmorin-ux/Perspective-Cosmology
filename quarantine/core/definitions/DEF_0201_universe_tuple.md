# DEF_0201 Definition: Universe Tuple

**Tag**: 0201
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/01_universe.md

---

## Requires

- [DEF_0200: Notation conventions]

## Provides

- U: The universe as a 6-tuple

---

## Statement

**U** is a 6-tuple:

```
U = (P, Σ, Γ, C, V, B)
```

Where:
- P: Set of points (see DEF_0202)
- Σ: Simplicial complex (see DEF_0203)
- Γ: Connectivity weights (see DEF_0204)
- C: Content map (see DEF_0206)
- V: Value space (see DEF_0205)
- B: Orthonormal basis (see DEF_0207)

---

## Notes

This is the foundational definition of the universe structure.
All other definitions and axioms reference this tuple.
