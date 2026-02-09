# THM_0432 Theorem: Transitivity Bound

**Tag**: 0432
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/05_overlap.md

---

## Requires

- [DEF_0230: Overlap parameter γ]
- [DEF_0225: Adjacency relation ~]

## Provides

- Triangle inequality for overlap

---

## Statement

**Theorem Ov.3 (Transitivity Bound)**

```
If π₁ ~ π₂ and π₂ ~ π₃, then:
γ(π₁, π₃) ≥ γ(π₁, π₂) + γ(π₂, π₃) - 1
```

Triangle inequality in Jaccard form.

---

## Proof

Standard metric space argument for Jaccard distance.
The Jaccard distance d_J = 1 - γ satisfies the triangle inequality.
Rearranging gives the stated bound.

QED

---

## Notes

This bounds how "different" distant perspectives can be.
