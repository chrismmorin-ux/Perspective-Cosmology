# Perspective Adjacency

REQUIRES: 00_notation, 02_perspective
DEFINES: adjacency relation ~, valid transitions
STATUS: DEFINITION

---

## Adjacency Relation

Two perspectives π₁, π₂ are **adjacent** if:

```
π₁ ~ π₂  ⟺  U_{π₁} ∩ U_{π₂} ≠ ∅
```

They share some accessible content.

---

## Transition Map

For adjacent π₁ ~ π₂:

**T_{12}: U_{π₁} → U_{π₂}**
```
T_{12}(x) = A_{π₂}(A_{π₁}^{-1}(x))
```

(Where A_{π₁}^{-1} selects a preimage.)

---

## Information Change

**Definition**: Information loss in transition π₁ → π₂:

```
ΔI(π₁ → π₂) = dim(U_{π₁}) - dim(U_{π₁} ∩ U_{π₂})
```

**Definition**: Information gain:

```
ΔI'(π₁ → π₂) = dim(U_{π₂}) - dim(U_{π₁} ∩ U_{π₂})
```

---

## Valid Adjacency Constraint

**Axiom Adj.1 (Non-Negative Loss)**
```
Valid adjacency π₁ ~ π₂ requires ΔI(π₁ → π₂) ≥ 0
```

This defines a direction on adjacency: "time" flows toward non-decreasing hidden content.

---

## Theorems

**Theorem Adj.1 (Irreversibility)**
```
If ΔI(π₁ → π₂) > 0, then no inverse transition exists.
```

Proof:
- Inverse would require ΔI(π₂ → π₁) < 0
- Violates Adj.1
QED

**Theorem Adj.2 (Adjacency Graph)**
```
(Π, ~) forms a directed graph.
```

Direction: π₁ → π₂ if transition is valid (non-negative loss).
