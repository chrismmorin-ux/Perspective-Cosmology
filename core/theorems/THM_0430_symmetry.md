# THM_0430 Theorem: Overlap Symmetry

**Tag**: 0430
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/05_overlap.md

---

## Requires

- [DEF_0230: Overlap parameter γ]

## Provides

- γ is symmetric

---

## Statement

**Theorem Ov.1 (Symmetry)**

```
γ(π₁, π₂) = γ(π₂, π₁)
```

---

## Proof

The Jaccard index is symmetric by definition:
- |A ∩ B| = |B ∩ A|
- |A ∪ B| = |B ∪ A|

QED

---

## Notes

Symmetry of γ does not imply symmetry of transitions (see THM_0420).
