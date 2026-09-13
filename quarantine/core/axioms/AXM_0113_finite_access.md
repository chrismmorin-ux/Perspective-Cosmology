# AXM_0113 Axiom: Finite Access (P3)

**Tag**: 0113
**Type**: AXIOM
**Status**: CANONICAL
**Source**: framework/layer_0_pure_axioms.md (v2.4)
**Added**: Session 72 (formalization)

---

## Requires

- [AXM_0109: Crystal Existence (C1)]
- [DEF_0210: Perspective]

## Provides

- Every perspective accesses finitely many dimensions

---

## Statement

**P3 (Finite Access)**

```
The accessible subspace has finite dimension:
dim(V_π) < ∞
```

Even if V_Crystal is infinite-dimensional, each perspective accesses finitely many dimensions.

---

## Notes

This axiom ensures that perspectives are "finite observers" even if the underlying Crystal is infinite. Combined with:
- P1 (Partiality): V_π ⊊ V_Crystal — can't see everything
- P2 (Non-Triviality): V_π ≠ {0} — must see something

We get: 0 < dim(V_π) < dim(V_Crystal)

This is related to:
- Finite information capacity of physical observers
- Holographic bounds on information
- The measurability requirement

---

---

## Unification Note (Session 132)

Under the unified framework [DEF_02B0]:
```
dim(V_Crystal) = n_c = 11 < ∞
```

Therefore V_Crystal itself is finite-dimensional. The finite access constraint becomes:
```
0 < dim(V_π) < 11
```

This resolves the apparent conflict with AXM_0100 (finiteness): both P and V_Crystal have the same finite dimension n_c = 11.

---

## Cross-References

- [AXM_0104: Partiality (P1)]
- [AXM_0102: Non-Triviality (P2)]
- [DEF_0244: Dimension Counting]
- [DEF_02B0: Universe-Crystal Correspondence]
- [AXM_0100: Finiteness]
