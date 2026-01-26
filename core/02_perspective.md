# [02] Perspective

**Status**: CANONICAL
**Confidence**: [AXIOM] — defines core primitive of framework
**Dependencies**: 00_notation, 01_universe
**Verified**: N/A (definitions)

---

REQUIRES: 00_notation, 01_universe
DEFINES: π, p, D, A, U_π, H_π, Π
CONTENT-TYPE: DEFINITION + AXIOM

## Connections

**Forward** (modules that use this):
- 03_propagation, 04_adjacency, 05_overlap, 07_information, 08_time, 09_trajectory, 10_entropy, 11_perspective_space

**Backward** (modules this uses):
- 00_notation, 01_universe

---

## Definition

A **perspective** is a triple:

```
π = (p, D, A)
```

### Components

**p ∈ P** (Anchor Point)
- Location of the perspective in U

**D ⊂ T_p** (Direction Set)
- Subset of directions from p
- Constrains which paths are followed

**A: U → U_π** (Access Map)
- Maps global content to accessible content
- Derived from propagation (see 04_propagation)

---

## Derived Quantities

**U_π** (Accessible Content)
```
U_π = im(A)
```

**H_π** (Hidden Content)
```
H_π = U \ U_π
```

---

## Axioms for Access

**A1 (Partiality)**
```
U_π ⊊ U
```
Every perspective has hidden content.

**A2 (Locality)**
```
A(x) depends only on relation of x to p via Γ-weighted paths
```

**A3 (Non-Invertibility)**
```
A is not injective: ∃ x ≠ y with A(x) = A(y)
```

---

## The Space of Perspectives

**Π** (Perspective Space)
```
Π = { π = (p, D, A) : p ∈ P, D valid, A consistent }
```

**Counting**
```
|Π| ≤ |P| × 2^|directions| × |access_maps|
```

Finite by U1.

---

## Fundamental Constraint

**Theorem P.1 (Self-Inaccessibility)**
```
∀ π = (p, D, A) : p ∉ im(A)
```

A perspective cannot fully access itself.

```
Proof sketch:
- A propagates from neighbors via D
- p is not its own neighbor
- Self-information requires reflection, not direct access
QED (informal)
```

**Status**: This theorem needs formalization.
