# Basis Geometry

REQUIRES: 00_notation, 01_universe
DEFINES: B-structure, Aut(B), subspaces, projections
STATUS: DEFINITION

---

## B-Structure

**B** is the orthonormal basis of V.

```
B = {b_1, b_2, ..., b_n}
⟨b_i, b_j⟩ = δ_ij
dim(V) = n = |B|
```

---

## Automorphisms of B

**Aut(B)**: Transformations preserving B-structure

```
Aut(B) = { T ∈ GL(V) : T(B) = B as a set }
```

For orthonormal B: Aut(B) ⊆ O(n).

---

## Subspace Decomposition

B may decompose into subspaces:

```
B = B_1 ⊔ B_2 ⊔ ... ⊔ B_k  (disjoint union)

V = V_1 ⊕ V_2 ⊕ ... ⊕ V_k  (orthogonal sum)

where V_i = span(B_i)
```

---

## Projection Operators

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

## Dimension Counting

```
n_i = |B_i| = dim(V_i)
Σ_i n_i = n = dim(V)
```

---

## Theorems

**Theorem B.1 (Aut Decomposition)**
```
Aut(B) = Aut(B_1) × Aut(B_2) × ... × Aut(B_k)
```
when B_i are invariant under Aut(B).

**Theorem B.2 (Projection Fraction)**
```
For v ∈ V with ||v|| = 1:
||Π_i(v)||² ≤ 1
with equality iff v ∈ V_i
```

**Theorem B.3 (Trace)**
```
Tr(Π_i) = dim(V_i) = n_i
```
