# DEF_0285 Definition: Crystalline

**Tag**: 0285
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/13_crystallinity.md
**Updated**: Session 133 (CR-006: equivalence with tilt matrix noted)

---

## Requires

- [DEF_0272: Perspectival variance]

## Provides

- Crystalline property

---

## Statement

U is **crystalline** iff:

```
Var(U) = 0

⟺ ∀ π₁, π₂ ∈ Π : U_{π₁} ≅ U_{π₂}
```

All perspectives reveal isomorphic content.

---

## Relationship to Tilt Matrix (DEF_02A3)

The tilt matrix ε_ij = ⟨π(b_i), π(b_j)⟩ - δ_ij measures deviation from perfect orthogonality.

**Claim** [CONJECTURE]: Var(U) = 0 ⟺ ε = 0 for all perspectives.

**Argument sketch**:
- (⟸) If ε = 0, then π preserves orthogonality perfectly, meaning every perspective produces isomorphic content → Var(U) = 0.
- (⟹) If Var(U) = 0, all perspectives are isomorphic. Isomorphic access maps should preserve inner product structure → ε = 0.

**Status**: The forward direction (ε = 0 → Var = 0) is clear. The reverse direction requires a precise definition of "isomorphic content" and its relationship to inner product preservation. A formal proof or explicit counterexample is needed.

---

## Notes

Crystalline structure has perfect symmetry between perspectives.
