# Layer 0: Pure Axioms

**Status**: AXIOM (no physics, no interpretation)
**Purpose**: Define the mathematical structure from which all else derives
**Audience**: Mathematician (no physics knowledge required)

---

## 1. The Universe Structure

### 1.1 Definition

**U** is a 6-tuple:

```
U = (P, Σ, Γ, C, V, B)
```

### 1.2 Components

| Symbol | Name | Type | Description |
|--------|------|------|-------------|
| P | Points | Finite set | Base set of the structure |
| Σ | Simplicial Complex | Collection of subsets | Connectivity structure on P |
| Γ | Weights | Function Σ → [0,1] | Connection strength |
| V | Value Space | Inner product space | Where content lives |
| C | Content Map | Function P → V | What exists at each point |
| B | Basis | Orthonormal subset of V | Reference frame for V |

### 1.3 Formal Definitions

**P (Points)**
- Finite, non-empty set
- |P| < ∞, |P| ≥ 1

**Σ (Simplicial Complex)**
- Σ_0 = P (0-simplices are points)
- Σ_k = {σ ⊂ P : |σ| = k+1, all faces in Σ} (k-simplices for k ≥ 1)
- Σ = ∪_{k≥0} Σ_k

**Γ (Connectivity Weights)**
- Γ: Σ → [0,1]
- Γ(σ) = 0 means σ is not effectively present
- Γ(σ) = 1 means maximal connection

**V (Value Space)**
- Finite-dimensional inner product space over 𝔽 (where 𝔽 = ℝ or ℂ)
- dim(V) = n < ∞
- Inner product: ⟨·,·⟩: V × V → 𝔽

**C (Content Map)**
- C: P → V
- C(p) represents "what exists at point p"

**B (Orthonormal Basis)**
- B = {b_1, ..., b_n} ⊂ V
- ⟨b_i, b_j⟩ = δ_ij (Kronecker delta)
- span(B) = V

---

## 2. Universe Axioms

**Axiom U1 (Finiteness)**
```
|P| < ∞  and  dim(V) < ∞
```

**Axiom U2 (Connectivity)**
```
The graph (P, Σ_1) is connected.
```
(Every point can be reached from every other point via 1-simplices)

**Axiom U3 (Non-Triviality)**
```
∃ p, q ∈ P : C(p) ≠ C(q)
```
(Not all points have identical content)

**Axiom U4 (Closure)**
```
∀ σ ∈ Σ, ∀ τ ⊂ σ : τ ∈ Σ
```
(Σ is closed under taking faces)

---

## 3. Perspectives

### 3.1 Definition

A **perspective** is a triple:

```
π = (p, D, A)
```

| Symbol | Name | Type | Description |
|--------|------|------|-------------|
| p | Anchor | Element of P | Location of the perspective |
| D | Directions | Subset of edges from p | Which connections are followed |
| A | Access Map | Function U → U_π | What content is accessible |

### 3.2 Derived Quantities

**Accessible Content**
```
U_π = im(A)
```

**Hidden Content**
```
H_π = U \ U_π
```

### 3.3 Perspective Axioms

**Axiom A1 (Partiality)**
```
U_π ⊊ U
```
Every perspective has hidden content.

**Axiom A2 (Locality)**
```
A(x) depends only on relation of x to p via Γ-weighted paths in D.
```

**Axiom A3 (Non-Invertibility)**
```
A is not injective: ∃ x ≠ y with A(x) = A(y)
```

### 3.4 The Space of Perspectives

**Π (Perspective Space)**
```
Π = { π = (p, D, A) : p ∈ P, D valid direction set, A consistent with axioms }
```

|Π| is finite (by U1).

---

## 4. Propagation

### 4.1 D-Compatible Edges

Given direction set D at point x:
```
E_D(x) = { y ∈ P : {x,y} ∈ Σ_1 and direction(x→y) ∈ D }
```

### 4.2 Propagation Operator

**P_D: V^P → V^P**
```
(P_D · f)(x) = Σ_{y ∈ E_D(x)} Γ({x,y}) · f(y)
```

Propagates content from D-compatible neighbors, weighted by Γ.

### 4.3 Receptive Subspace

At each point p:

**V_p ⊆ V**
- Which dimensions p can distinguish
- dim(V_p) ≤ dim(V)

**Π_p: V → V_p**
- Orthogonal projection onto V_p

### 4.4 Access Map Construction

```
A_π = Π_p ∘ eval_p ∘ lim_{n→∞} (P_D)^n
```

Where:
1. (P_D)^n propagates through D-compatible paths n times
2. eval_p extracts value at point p
3. Π_p projects onto receptive dimensions

**Convergence condition**: If max_σ Γ(σ) < 1, the limit converges.

---

## 5. Adjacency

### 5.1 Adjacency Relation

Two perspectives π₁, π₂ are **adjacent** if:
```
π₁ ~ π₂  ⟺  U_{π₁} ∩ U_{π₂} ≠ ∅
```

### 5.2 Information Change

For transition π₁ → π₂:

**Information Loss**
```
ΔI(π₁ → π₂) = dim(U_{π₁}) - dim(U_{π₁} ∩ U_{π₂})
```

**Information Gain**
```
ΔI'(π₁ → π₂) = dim(U_{π₂}) - dim(U_{π₁} ∩ U_{π₂})
```

### 5.3 Adjacency Axiom

**Axiom Adj.1 (Non-Negative Loss)**
```
Valid adjacency π₁ ~ π₂ requires ΔI(π₁ → π₂) ≥ 0
```

This defines a direction on adjacency.

---

## 6. Overlap Parameter

### 6.1 Definition

For adjacent perspectives π₁ ~ π₂:

**γ (Overlap Parameter)**
```
γ(π₁, π₂) = |U_{π₁} ∩ U_{π₂}| / |U_{π₁} ∪ U_{π₂}|
```

This is the Jaccard index of accessible content.

**Range**: γ ∈ [0, 1]
- γ = 0: disjoint access (no overlap)
- γ = 1: identical access

### 6.2 Overlap Regimes

| Regime | Condition | Meaning |
|--------|-----------|---------|
| High-γ | γ → 1 | Perspectives nearly coincide |
| Low-γ | γ → 0 | Perspectives barely overlap |
| Intermediate | 0 < γ < 1 | Partial overlap |

### 6.3 Global Overlap

**γ_global**: Average over all adjacent perspective pairs
```
γ_global = (1/|adjacent pairs|) Σ_{π₁~π₂} γ(π₁, π₂)
```

---

## 7. Basis Geometry

### 7.1 Automorphisms

**Aut(B)**: Transformations preserving B-structure
```
Aut(B) = { T ∈ GL(V) : T(B) = B as a set }
```

For orthonormal B: Aut(B) ⊆ O(n).

### 7.2 Subspace Decomposition

B may decompose into disjoint subsets:
```
B = B_1 ⊔ B_2 ⊔ ... ⊔ B_k  (disjoint union)
V = V_1 ⊕ V_2 ⊕ ... ⊕ V_k  (orthogonal sum)
where V_i = span(B_i)
```

### 7.3 Projection Operators

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

## 8. Information Structure

### 8.1 Information Content

**I_π (Information in perspective π)**
```
I_π = log₂|U_π|
```

**S_π (Hidden content entropy)**
```
S_π = log₂|H_π| = log₂|U \ U_π|
```

### 8.2 Total Information

```
I_total = log₂|U|
```

Constant for the structure.

### 8.3 Mutual Information

For perspectives π₁, π₂:
```
I(π₁ : π₂) = I_{π₁} + I_{π₂} - I_{π₁ ∪ π₂}
```

---

## 9. Theorems (from axioms only)

These follow directly from the axioms above.

### From Universe Axioms

**Theorem U.1**: |P| ≥ 2
```
Proof: U3 requires distinct p, q ∈ P with C(p) ≠ C(q). ∎
```

**Theorem U.2**: Σ_1 ≠ ∅
```
Proof: U2 requires connected graph on |P| ≥ 2. ∎
```

**Theorem U.3**: Any C(p) decomposes uniquely in B
```
C(p) = Σᵢ cᵢ(p) bᵢ  where cᵢ(p) = ⟨C(p), bᵢ⟩. ∎
```

### From Perspective Axioms

**Theorem P.1 (Non-Invertibility)**
```
A_π is not invertible.
Proof:
- Π_p loses dimensions if V_p ⊊ V
- (P_D)^n ignores paths not in D
- Multiple C, C' can yield A_π(C) = A_π(C'). ∎
```

**Theorem P.2 (Attenuation)**
```
If max_σ Γ(σ) = γ_max < 1, then ||(P_D)^n|| ≤ γ_max^n → 0.
```
Distant content attenuates exponentially.

### From Adjacency Axioms

**Theorem Adj.1 (Irreversibility)**
```
If ΔI(π₁ → π₂) > 0, then no inverse transition exists.
Proof: Inverse would require ΔI(π₂ → π₁) < 0, violating Adj.1. ∎
```

**Theorem Adj.2 (Adjacency Graph)**
```
(Π, ~) forms a directed graph.
Direction: π₁ → π₂ if transition is valid (non-negative loss).
```

### From Overlap Definition

**Theorem Ov.1 (Symmetry)**
```
γ(π₁, π₂) = γ(π₂, π₁)
```

**Theorem Ov.2 (Bounds)**
```
0 ≤ γ ≤ 1
```

**Theorem Ov.3 (Transitivity Bound)**
```
If π₁ ~ π₂ and π₂ ~ π₃, then:
γ(π₁, π₃) ≥ γ(π₁, π₂) + γ(π₂, π₃) - 1
```

### From Information Definition

**Theorem I.1 (Conservation)**
```
I_π + S_π = I_total
```

**Theorem I.2 (Second Law)**
```
Valid transitions satisfy ΔI ≥ 0.
Equivalently: hidden content entropy S increases or stays constant.
```

### From Basis Geometry

**Theorem B.1 (Aut Decomposition)**
```
Aut(B) = Aut(B_1) × Aut(B_2) × ... × Aut(B_k)
when B_i are invariant under Aut(B).
```

**Theorem B.2 (Trace)**
```
Tr(Π_i) = dim(V_i) = |B_i|
```

---

## 10. What the Axioms Do NOT Constrain

**CRITICAL**: The following are FREE PARAMETERS, not determined by axioms.

### 10.1 Cardinalities

| Parameter | Constraint | What's Free |
|-----------|------------|-------------|
| \|P\| | Finite, ≥ 2 | No upper bound |
| \|Π\| | Finite | No specific value |
| dim(V) = n | Finite, ≥ 1 | No specific value |

### 10.2 Structural Choices

| Choice | What Axioms Allow | What's Free |
|--------|-------------------|-------------|
| Field 𝔽 | ℝ or ℂ | Not determined |
| Subspace decomposition of B | Any valid partition | Not determined |
| Number of subspaces k | Any 1 ≤ k ≤ n | Not determined |
| Dimensions of subspaces n_i | Any with Σn_i = n | Not determined |

### 10.3 Functions and Distributions

| Function | What Axioms Allow | What's Free |
|----------|-------------------|-------------|
| Γ values | Any in [0,1] | Specific distribution |
| γ values | Any in [0,1] | Specific distribution |
| C(p) values | Any in V | Specific content |

### 10.4 Specific Numerical Questions

The axioms do NOT determine:

1. **Is there a "natural" dimension for V?**
   - Axioms allow any finite dimension
   - Nothing forces dim(V) = 10 or any other value

2. **Is there a "natural" size for |Π|?**
   - Axioms allow any finite count
   - Nothing forces |Π| ≈ 10^118 or any other value

3. **Is there a preferred γ-function?**
   - Axioms define γ as Jaccard index
   - Functions like 2γ-1 or 2γ(1-γ) are choices, not derivations

4. **Does B have forced substructure?**
   - Axioms allow arbitrary decomposition
   - "Electroweak" vs "color" splits are choices, not derivations

---

## 11. Summary

### What This Document Contains

- A finite structure U = (P, Σ, Γ, C, V, B)
- Perspectives as partial access maps π = (p, D, A)
- An overlap parameter γ between perspectives
- Information-theoretic quantities I, S
- A collection of theorems following from the axioms

### What This Document Does NOT Contain

- Any reference to spacetime, particles, or forces
- Any physical constants (ℏ, c, G, α)
- Any comparison to quantum mechanics or general relativity
- Any claims about what dim(V), |Π|, or γ "should be"

### Open Mathematical Questions

1. Given the axioms, what structures MUST exist?
2. What additional axioms would constrain dim(V)?
3. What additional axioms would constrain |Π|?
4. Are there natural functions of γ privileged by the structure?
5. Does the adjacency graph (Π, ~) have forced properties?

---

*This is Layer 0: Pure mathematics with no physics interpretation.*
*For physical identification, see Layer 2 (correspondence rules).*
*For predictions, see Layer 3.*

---

**Document version**: 1.0
**Created**: 2026-01-26
**Based on**: core/01_universe.md through core/07_information.md
