# DEF_0231 Definition: Normalized Overlap

**Tag**: 0231
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/05_overlap.md

---

## Requires

- [DEF_0230: Overlap parameter γ]

## Provides

- μ: Normalized overlap parameter

---

## Statement

**μ (Normalized Overlap)**

```
μ = (γ - γ_min) / (γ_max - γ_min)
```

Rescaled to [0, 1] within the framework's actual range.

---

## Notes

Useful when the framework has natural bounds on γ that differ from [0, 1].
