# DEF_0204 Definition: Connectivity Weights

**Tag**: 0204
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/01_universe.md

---

## Requires

- [DEF_0200: Notation conventions]
- [DEF_0203: Simplicial complex Σ]

## Provides

- Γ: Connectivity weight function

---

## Statement

**Γ** (Connectivity Weights)

```
Γ: Σ → [0,1]
```

Where:
- Γ(σ) = 0 implies σ is not effectively present
- Γ(σ) = 1 implies maximal connection
- Intermediate values represent partial connectivity

---

## Notes

The weight Γ determines how information propagates along simplices.
A zero-weighted simplex blocks propagation entirely.
