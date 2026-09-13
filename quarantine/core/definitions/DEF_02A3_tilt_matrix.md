# DEF_02A3 Definition: Tilt Matrix

**Tag**: 02A3
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/axioms/AXM_0114_tilt_possibility.md
**Added**: Session 132 (created to resolve CR-001)

---

## Requires

- [DEF_0210: Perspective]
- [AXM_0109: Crystal Existence (C1)]
- [AXM_0110: Perfect Orthogonality (C2)]

## Provides

- Tilt matrix ε_ij measuring deviation from orthogonality
- Criterion for crystalline vs tilted perspectives

---

## Statement

**Tilt Matrix**

For a perspective π with orthonormal crystal basis {b_i}, the **tilt matrix** is:

```
ε_ij = ⟨π(b_i), π(b_j)⟩ - δ_ij
```

Where:
- π(b_i) is the perspective-transformed basis vector
- ⟨·,·⟩ is the inner product on V_Crystal
- δ_ij is the Kronecker delta (1 if i=j, 0 otherwise)

---

## Properties

### Symmetry

```
ε_ij = ε_ji
```

The tilt matrix is symmetric (follows from inner product symmetry).

### Zero Diagonal (Optional Convention)

If perspectives preserve vector norms:
```
ε_ii = 0 for all i
```

In this case, only off-diagonal elements encode tilt.

### Crystalline Criterion

```
ε = 0 (all entries) ⟺ perspective is crystalline (preserves orthogonality)
ε ≠ 0 ⟺ perspective is tilted (distorts orthogonality)
```

### Tilt Magnitude

The **tilt magnitude** is any appropriate matrix norm:

```
||ε|| = √(Σ_ij ε_ij²)   [Frobenius norm]
```

or

```
||ε|| = max_i Σ_j |ε_ij|  [operator norm]
```

---

## Physical Interpretation

The tilt matrix encodes how a perspective "distorts" the perfect crystal structure:

1. **ε = 0**: Perfect orthogonality preserved; no physics (pure crystal view)
2. **ε ≠ 0**: Dimensions appear non-orthogonal; structure emerges
3. **||ε|| small**: Weak tilt; perturbative regime
4. **||ε|| large**: Strong tilt; non-perturbative/black hole regime

---

## Notes

> **Layer 0 purity note (Session 140 audit)**: Physics correspondence table (gravity, gauge fields, black holes, Big Bang) moved to Layer 2. See `framework/layer_2_correspondence.md` and `framework/investigations/spacetime/`.

The tilt matrix is the fundamental "order parameter" for the framework:
- All physics emerges from ε ≠ 0
- Dynamics (AXM_0117) drives ||ε|| toward minima
- Prime attractors (AXM_0118) select specific tilt configurations

---

## Cross-References

- [AXM_0114: Tilt Possibility (P4)] — existential claim that ε ≠ 0 is possible
- [AXM_0117: Crystallization Tendency (R1)] — dynamics of ε
- [DEF_0285: Crystalline] — ε = 0 state
- [DEF_0286: Defect] — ε ≠ 0 regions
