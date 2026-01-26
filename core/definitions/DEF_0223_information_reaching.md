# DEF_0223 Definition: Information Reaching Point

**Tag**: 0223
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/03_propagation.md

---

## Requires

- [DEF_0206: Content map C]
- [DEF_0221: Propagation operator P_D]

## Provides

- I_p: Information reaching point p

---

## Statement

```
I_p = lim_{n→∞} (P_D)^n · C  evaluated at p
```

The accumulated information at p from propagating content through D.

**Convergence condition**: Γ(σ) < 1 for all σ guarantees convergence.

---

## Notes

This represents what a perspective at p "receives" from the universe.
The limit exists when weights are strictly less than 1.
