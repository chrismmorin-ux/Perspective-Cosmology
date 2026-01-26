# DEF_02A0 Definition: Asymmetry Measure

**Tag**: 02A0
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/18_dynamics.md

---

## Requires

- [DEF_0230: Overlap parameter γ]

## Provides

- A(γ): Content asymmetry measure

---

## Statement

For adjacent perspectives with overlap γ:

```
A(γ) = (shared) - (different)
     = γ - (1-γ)
     = 2γ - 1
```

**Properties**:
| γ | A(γ) | Meaning |
|---|------|---------|
| 0 | -1 | All different, no shared |
| 0.5 | 0 | Balanced (critical point) |
| 1 | +1 | All shared, no different |

---

## Notes

Asymmetry determines the direction of intrinsic tendency:
- A < 0: Tendency toward decoherence
- A > 0: Tendency toward coherence (frustrated by thermodynamics)
