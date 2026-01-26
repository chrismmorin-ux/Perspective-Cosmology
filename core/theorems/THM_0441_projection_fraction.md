# THM_0441 Theorem: Projection Fraction

**Tag**: 0441
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/06_basis_geometry.md

---

## Requires

- [DEF_0243: Projection operators]

## Provides

- Bound on projection norm

---

## Statement

**Theorem B.2 (Projection Fraction)**

```
For v ∈ V with ||v|| = 1:
||Π_i(v)||² ≤ 1
with equality iff v ∈ V_i
```

---

## Proof

By orthogonality of the decomposition:
||v||² = Σ_j ||Π_j(v)||²

Since ||v|| = 1:
1 = Σ_j ||Π_j(v)||²

Therefore ||Π_i(v)||² ≤ 1, with equality only when all other projections are zero.

QED
