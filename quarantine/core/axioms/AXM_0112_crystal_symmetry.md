# AXM_0112 Axiom: Crystal Symmetry (C4)

**Tag**: 0112
**Type**: AXIOM
**Status**: CANONICAL
**Source**: framework/layer_0_pure_axioms.md (v2.4)
**Added**: Session 72 (formalization)

---

## Requires

- [AXM_0109: Crystal Existence (C1)]
- [AXM_0110: Perfect Orthogonality (C2)]

## Provides

- No basis vector is distinguished
- Any two basis vectors are equivalent under automorphism

---

## Statement

**C4 (Symmetry)**

```
No basis vector is distinguished:
∀ i, j ∈ I, ∃ automorphism T : V_Crystal → V_Crystal
such that T(b_i) = b_j
```

---

## Notes

This axiom says the Crystal has maximal symmetry. Without perspective:
- All directions are equivalent
- No point is special
- No structure exists to distinguish anything

**Key Insight**: Perspective BREAKS this symmetry. This is the only source of structure in the framework.

---

## Theorems Derived

- **Theorem C.1 (No Structure)**: V_Crystal has no non-trivial substructure
- **Theorem C.2 (No Preferred Direction)**: V_Crystal has no preferred direction

---

## Cross-References

- [AXM_0104: Partiality (P1)] — Perspective breaks C4 symmetry
- [DEF_0241: Automorphisms]
