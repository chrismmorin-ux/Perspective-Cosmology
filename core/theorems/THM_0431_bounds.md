# THM_0431 Theorem: Overlap Bounds

**Tag**: 0431
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/05_overlap.md

---

## Requires

- [DEF_0230: Overlap parameter γ]

## Provides

- 0 ≤ γ ≤ 1

---

## Statement

**Theorem Ov.2 (Bounds)**

```
0 ≤ γ ≤ 1
```

---

## Proof

Standard Jaccard index property:
- |A ∩ B| ≥ 0
- |A ∩ B| ≤ |A ∪ B|

Therefore the ratio lies in [0, 1].

QED
