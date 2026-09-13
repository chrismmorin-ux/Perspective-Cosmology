# [03] Propagation Operator

**Status**: CANONICAL
**Confidence**: [AXIOM] — defines how information propagates
**Dependencies**: 00_notation, 01_universe, 02_perspective
**Verified**: N/A (definitions)

---

REQUIRES: 00_notation, 01_universe, 02_perspective
DEFINES: E_D, P_D, V_p, Π_p, I_p, A_π
CONTENT-TYPE: DEFINITION

## Connections

**Forward** (modules that use this):
- 04_adjacency (implicit via A_π)

**Backward** (modules this uses):
- 00_notation, 01_universe, 02_perspective

---

## D-Compatible Edges

Given direction set D at point x:

```
E_D(x) = { y ∈ P : {x,y} ∈ Σ_1 and direction(x→y) ∈ D }
```

---

## Propagation Operator

**P_D: V^P → V^P**

```
(P_D · f)(x) = Σ_{y ∈ E_D(x)} Γ({x,y}) · f(y)
```

Propagates content from D-compatible neighbors, weighted by Γ.

---

## Receptive Subspace

At each point p:

**V_p ⊆ V**
- Which dimensions p can distinguish
- dim(V_p) ≤ dim(V)

**Π_p: V → V_p**
- Orthogonal projection onto V_p

---

## Information Reaching p

```
I_p = lim_{n→∞} (P_D)^n · C  evaluated at p
```

**Convergence condition**: Γ(σ) < 1 for all σ guarantees convergence.

---

## Access Map Construction

```
A_π = Π_p ∘ eval_p ∘ lim_{n→∞} (P_D)^n
```

Components:
1. (P_D)^n propagates through D-compatible paths
2. eval_p extracts value at point p
3. Π_p projects onto receptive dimensions

---

## Theorems

**Theorem Pr.1 (Non-Invertibility)**
```
A_π is not invertible.
```

Proof:
1. Π_p loses dimensions if V_p ⊊ V
2. (P_D)^n ignores paths not in D
3. Multiple C, C' can yield A_π(C) = A_π(C')
QED

**Theorem Pr.2 (Attenuation)**
```
If max_σ Γ(σ) = γ_max < 1, then:
||(P_D)^n|| ≤ γ_max^n → 0
```

Distant content attenuates exponentially.

**Theorem Pr.3 (Horizon)**
```
If Γ = 1 on some edges, information propagates indefinitely.
Define horizon H as truncation scale.
```
