# DEF_0261 Definition: Cumulative Hidden Content

**Tag**: 0261
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/08_time.md

---

## Requires

- [DEF_0215: Hidden content H_π]
- [DEF_0260: Temporal sequence T]

## Provides

- H(T, n): Cumulative hidden content along sequence

---

## Statement

```
H(T, n) = ⋃ᵢ₌₀ⁿ H_πᵢ
```

The union of all hidden content accumulated along the temporal sequence.

---

## Notes

This represents everything that has "become hidden" along the path.
