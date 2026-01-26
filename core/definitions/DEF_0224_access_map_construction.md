# DEF_0224 Definition: Access Map Construction

**Tag**: 0224
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/03_propagation.md

---

## Requires

- [DEF_0221: Propagation operator P_D]
- [DEF_0222: Receptive subspace Π_p]
- [DEF_0213: Access map A]

## Provides

- Construction of A_π from propagation

---

## Statement

```
A_π = Π_p ∘ eval_p ∘ lim_{n→∞} (P_D)^n
```

Components:
1. (P_D)^n propagates through D-compatible paths
2. eval_p extracts value at point p
3. Π_p projects onto receptive dimensions

---

## Notes

This shows how the abstract access map is constructed from
the propagation and projection operations.
