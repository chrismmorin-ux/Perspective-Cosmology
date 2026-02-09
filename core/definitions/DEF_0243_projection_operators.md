# DEF_0243 Definition: Projection Operators

**Tag**: 0243
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/06_basis_geometry.md

---

## Requires

- [DEF_0242: Subspace decomposition]

## Provides

- Π_i: Projection onto subspace V_i

---

## Statement

For each subspace V_i:

```
Π_i: V → V_i
Π_i(v) = Σ_{b ∈ B_i} ⟨v, b⟩ b
```

**Properties:**
- Π_i² = Π_i (idempotent)
- Π_i† = Π_i (self-adjoint)
- Σ_i Π_i = I (complete)
- Π_i Π_j = 0 for i ≠ j (orthogonal)

---

## Notes

These projections are the standard orthogonal projections from linear algebra.
