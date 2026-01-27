# Layer 0: Pure Axioms

**Status**: AXIOM (no physics, no interpretation)
**Version**: 2.2 (Two-primitive foundation, with known gaps documented)
**Purpose**: Define the minimal mathematical structure from which all else derives
**Audience**: Mathematician (no physics knowledge required)
**Gaps**: See Section 22 for honest accounting of incomplete emergence

---

## Overview

This document contains the **complete axiomatic foundation** of the framework.

**There are exactly TWO primitives:**
1. **V_Crystal** — A perfect inner product space
2. **Perspective** — A partial access operation

Everything else — points, connectivity, weights, content, observable dimensions — **emerges** from these two.

---

## Part I: The Crystal

### 1. The Crystal Space

**Definition (V_Crystal)**

V_Crystal is an inner product space over field F (where F = R or C) satisfying:

```
(C1) V_Crystal is a vector space over F
(C2) There exists an inner product ⟨·,·⟩: V_Crystal × V_Crystal → F
(C3) There exists an orthonormal basis B_Crystal = {b_i : i ∈ I}
     where ⟨b_i, b_j⟩ = δ_ij (Kronecker delta)
```

### 2. Crystal Axioms

**Axiom C1 (Existence)**
```
V_Crystal exists.
```

**Axiom C2 (Perfect Orthogonality)**
```
All basis vectors are perfectly orthogonal:
∀ i ≠ j : ⟨b_i, b_j⟩ = 0
```

**Axiom C3 (Completeness)**
```
B_Crystal spans V_Crystal:
span(B_Crystal) = V_Crystal
```

**Axiom C4 (Symmetry)**
```
No basis vector is distinguished:
∀ i, j ∈ I, ∃ automorphism T : V_Crystal → V_Crystal
such that T(b_i) = b_j
```

### 3. Crystal Properties (Derived)

**Theorem C.1 (No Structure)**
```
V_Crystal has no non-trivial substructure.
Proof: By C4, any two vectors are equivalent under automorphism.
       No subset is privileged. ∎
```

**Theorem C.2 (No Preferred Direction)**
```
V_Crystal has no preferred direction.
Proof: Direct consequence of C4. ∎
```

**Remark**: The Crystal is "perfect" precisely because it has no structure. Perfect orthogonality means complete independence of all dimensions. There is nothing to distinguish, nothing to measure, nothing to observe.

### 4. Index Set Constraint

**Axiom C5 (Cardinality)**
```
|I| may be finite or countably infinite.
If finite: |I| = n for some n ∈ N
```

This is the only free parameter in the Crystal: how many dimensions it has.

---

## Part II: Perspective

### 5. Perspective Definition

**Definition (Perspective)**

A perspective π is an orthogonal projection operator on V_Crystal:

```
π: V_Crystal → V_Crystal
π² = π  (idempotent)
π† = π  (self-adjoint)
```

The **accessible subspace** is:
```
V_π = im(π) ⊊ V_Crystal
```

Intuitively: π "projects" the Crystal onto the subspace the perspective can access.

### 6. Perspective Axioms

**Axiom P1 (Partiality)**
```
Every perspective accesses strictly less than the whole:
V_π = im(π) ⊊ V_Crystal
```
No perspective sees everything.

**Axiom P2 (Non-Triviality)**
```
Every perspective accesses something:
im(π) ≠ {0}
```
No perspective sees nothing.

**Axiom P3 (Finite Access)**
```
The accessible subspace has finite dimension:
dim(V_π) < ∞
```
Even if V_Crystal is infinite-dimensional, each perspective accesses finitely many dimensions.

### 7. The Fundamental Theorem

**Theorem P.1 (Perspective Breaks Symmetry)**
```
If π is a perspective, then V_Crystal decomposes as:
V_Crystal = V_π ⊕ V_π^⊥

where V_π = im(π) is the accessible subspace
and V_π^⊥ is the hidden subspace.

This decomposition BREAKS the symmetry of Axiom C4.
```

**Proof**:
- By P1, V_π ⊊ V_Crystal
- V_π is a proper subspace
- Take orthogonal complement: V_π^⊥ = {v : ⟨v, w⟩ = 0 ∀w ∈ V_π}
- By completeness: V_Crystal = V_π ⊕ V_π^⊥
- Now V_π is distinguished from V_π^⊥, breaking C4. ∎

**Corollary**: Perspective is the ONLY source of structure. Without perspective, V_Crystal has no distinguishable features.

---

## Part III: Emergence

### 8. Tilted Dimensions (B̃)

When perspective π accesses a finite-dimensional subspace V_π ⊂ V_Crystal, the Crystal's basis vectors project onto V_π. These projections form the "tilted basis" — the Crystal's structure as seen through the perspective.

**Definition (Tilted Basis)**

Let B_Crystal = {b_i : i ∈ I} be the Crystal's orthonormal basis. The **tilted basis** accessible to perspective π is:

```
B̃ = {b̃_i = π(b_i) : i ∈ I, π(b_i) ≠ 0}
```

These are the projections of Crystal basis vectors onto V_π. Only those with non-zero projection are included.

**Definition (Tilt Matrix)**

The **tilt matrix** measures deviation from orthogonality:

```
ε_ij = ⟨b̃_i, b̃_j⟩ - δ_ij = ⟨π(b_i), π(b_j)⟩ - δ_ij
```

**Interpretation**:
- ε_ij = 0 for all i,j: V_π aligns perfectly with Crystal axes (π preserves orthogonality)
- ε_ij ≠ 0 for some i≠j: projection distorts the Crystal's orthogonal structure

**Axiom P4 (Tilt Possibility)**
```
Perspectives may introduce non-zero tilt:
∃ π ∈ Π, ∃ i ≠ j : ε_ij ≠ 0
```

At least some perspectives see tilted dimensions. (Whether "most" do requires a measure on Π, which is not defined here.)

### 9. Observable Space (V_Observable)

**Definition**
```
V_Observable = V_π = im(π) = span(B̃)
```

Note: span(B̃) = V_π because the tilted basis vectors {b̃_i = π(b_i)} span exactly the image of π.

**Theorem V.1 (Observable is Finite Subspace)**
```
V_Observable ⊊ V_Crystal
dim(V_Observable) = n < ∞  (by Axiom P3)
```
If V_Crystal is finite-dimensional, then n < dim(V_Crystal).
If V_Crystal is infinite-dimensional, n is still finite.

### 10. Points (P)

**STATUS: EMERGENCE INCOMPLETE** — See Known Gaps (Section 22)

Points are intended to emerge from dimensional structure, but the precise mechanism requires additional development.

**Working Definition (Point)**
```
A point p is characterized by a subset S_p ⊆ B̃ of "active" dimensions.
The set of points P indexes distinct dimensional configurations.
```

**Constraint (Finiteness)**
```
|P| ≤ 2^n where n = |B̃|
```
The number of distinct configurations is bounded by the power set of dimensions.

**Gap**: How continuous vector spaces yield discrete point-like structures is an open question. See Section 22.

### 11. Connectivity (Σ)

**Definition (Adjacency)**
```
Two points p, q are connected if they share a dimension:
p ~ q ⟺ S_p ∩ S_q ≠ ∅
```

**Definition (Simplicial Complex)**
```
Σ_0 = P
Σ_1 = {{p,q} : p ~ q}
Σ_k = {σ ⊆ P : |σ| = k+1, all pairs in σ are connected}
Σ = ∪_k Σ_k
```

**Theorem Σ.1 (Emergence)**
```
Σ is determined entirely by the dimension-sharing structure.
No additional axiom needed.
```

### 12. Weights (Γ)

**Definition (Connection Weight)**
```
Γ(p, q) = |S_p ∩ S_q| / |S_p ∪ S_q|
```

This is the Jaccard index of dimensional overlap.

**Theorem Γ.1 (Properties)**
```
(a) Γ(p,q) ∈ [0,1]
(b) Γ(p,q) = 0 ⟺ S_p ∩ S_q = ∅ ⟺ p ≁ q
(c) Γ(p,q) = 1 ⟺ S_p = S_q
(d) Γ(p,q) = Γ(q,p)
```

**Theorem Γ.2 (Unification)**
```
The overlap parameter γ between perspectives has the same form as Γ:
γ(π_1, π_2) = dim(V_{π_1} ∩ V_{π_2}) / dim(V_{π_1} + V_{π_2})
```

where V₁ + V₂ = span(V₁ ∪ V₂) is the sum of subspaces.

Weights (between points) and overlap (between perspectives) are the same concept at different levels — both are Jaccard-like indices of shared vs total structure.

### 13. Content (C)

**STATUS: REQUIRES CLARIFICATION** — See Known Gaps (Section 22)

**Global Tilt** (defined in Section 8):
```
ε_ij = ⟨b̃_i, b̃_j⟩ - δ_ij    (single value per dimension pair)
```

**Local Content** (if tilt varies by location):
```
C(p) = {ε_ij(p) : i,j ∈ S_p}   (tilt as function of point)
```

**Gap**: The relationship between global tilt (perspective's basis relative to Crystal) and local tilt (variation across points) needs development. See Section 22.

**Conjecture Content.1 (Matter = Geometry)**
```
Content is entirely determined by tilt structure.
There is no separate "stuff" — only deviation from perfect orthogonality.
```

**Interpretation**: The distinction between "empty space" and "matter" would be the distinction between ε_ij ≈ 0 and ε_ij significantly non-zero. This requires the local tilt picture to be developed.

---

## Part IV: The Perspective Space

### 14. Multiple Perspectives

**Definition (Perspective Space)**
```
Π = {π : π satisfies P1, P2, P3}
```

**Axiom Π1 (Multiple Perspectives)**
```
|Π| > 1
```
More than one perspective exists.

**Axiom Π2 (Perspective Overlap)**
```
∃ π_1, π_2 ∈ Π : V_{π_1} ∩ V_{π_2} ≠ {0}
```
Some perspectives share accessible content.

### 15. Adjacency of Perspectives

**Definition**
```
π_1 ~ π_2 ⟺ V_{π_1} ∩ V_{π_2} ≠ {0}
```

**Theorem Π.1 (Perspective Graph)**
```
(Π, ~) forms a graph.
```

### 16. Information Structure

**Definition (Perspective Information)**
```
I_π = dim(V_π)
```
Information content = number of accessible dimensions.

**Definition (Hidden Information)**
```
H_π = dim(V_Crystal) - dim(V_π)
```
Or H_π = ∞ if V_Crystal is infinite-dimensional.

**Theorem I.1 (Conservation)**
```
I_π + H_π = dim(V_Crystal) = constant
```

---

## Part V: Time

### 17. Time Emergence

**CRITICAL CONSTRAINT**: Time does not exist in or for V_Crystal.

**Axiom T1 (Crystal is Timeless)**
```
V_Crystal has no temporal structure.
There is no "before" or "after" within the Crystal.
```

**Definition (Perspective-Time)**
```
Time exists only as sequences of perspectives:
t ↔ (π_1, π_2, π_3, ...)
where each π_i ~ π_{i+1}
```

**Theorem T.1 (No External Time)**
```
All dynamical concepts (evolution, change, causation)
are defined WITHIN perspective-sequences, not externally.
```

**Corollary**: Asking "when did perspective nucleate?" is malformed. There was no time before perspective. "Nucleation" is logical/structural, not temporal.

---

## Part VI: Summary

### 18. Complete Axiom List

**Crystal Axioms (5)**
| ID | Name | Statement |
|----|------|-----------|
| C1 | Existence | V_Crystal exists |
| C2 | Perfect Orthogonality | ⟨b_i, b_j⟩ = δ_ij |
| C3 | Completeness | span(B_Crystal) = V_Crystal |
| C4 | Symmetry | All basis vectors equivalent under automorphism |
| C5 | Cardinality | \|I\| finite or countably infinite |

**Perspective Axioms (6)**
| ID | Name | Statement |
|----|------|-----------|
| P1 | Partiality | im(π) ⊊ V_Crystal |
| P2 | Non-Triviality | im(π) ≠ {0} |
| P3 | Finite Access | dim(V_π) < ∞ |
| P4 | Tilt Possibility | Some π has ε_ij ≠ 0 |
| Π1 | Multiple Perspectives | \|Π\| > 1 |
| Π2 | Perspective Overlap | Some perspectives share content |

**Time Axiom (1)**
| ID | Name | Statement |
|----|------|-----------|
| T1 | Crystal Timeless | No temporal structure in V_Crystal |

**Total: 12 axioms**

### 19. Emergence Summary

| Concept | Status | Emerges From | Complete? |
|---------|--------|--------------|-----------|
| V_Crystal | **PRIMITIVE** | — | ✓ |
| Perspective | **PRIMITIVE** | — | ✓ |
| B̃ (tilted basis) | Derived | P4 (perspective tilts Crystal dimensions) | ✓ |
| V_Observable | Derived | V_π = span(B̃) | ✓ |
| P (points) | Derived | Dimension intersection structure | **GAP** |
| Σ (connectivity) | Derived | Dimension sharing (given P) | ✓ |
| Γ (weights) | Derived | Jaccard index of sharing | ✓ |
| C (content) | Derived | Local tilt configuration ε_ij | **GAP** |
| Time | Derived | Perspective sequences | **GAP** |

See Section 22 for details on gaps.

### 20. What the Axioms Do NOT Determine

| Parameter | Status | Notes |
|-----------|--------|-------|
| dim(V_Crystal) | FREE | Could be any n ∈ N or ∞ |
| \|Π\| | FREE | Number of perspectives |
| Specific ε_ij values | FREE | Tilt magnitudes |
| n = dim(V_Observable) | FREE | How many dimensions accessible |

### 21. What the Axioms DO Determine

| Property | Determined By |
|----------|---------------|
| Structure requires perspective | C4 + P1 |
| Perspectives have finite access | P3 |
| Tilt is possible | P4 |
| Points, Σ, Γ are emergent | Definitions from dimensions |
| Content = tilt | Definition |
| Time is perspective-relative | T1 |

---

## 22. Known Gaps

This section documents where the emergence story is incomplete. These are **research questions**, not failures — the framework is honest about what remains to be derived.

### Gap 1: Point Emergence from Continuous Space

**Problem**: V_π is a vector space (continuous). How do discrete point-like structures emerge?

**Current state**: Points are defined as "dimensional configurations" S_p ⊆ B̃, but the mechanism by which continuous geometry yields discrete locations is not specified.

**Possible approaches**:
1. Points as maximal filters on a lattice of subspaces
2. Points as equivalence classes under some relation
3. Discreteness from tilt quantization (if tilts are constrained)
4. Points as emergent from perspective overlap structure

**Connection**: This relates to open issue I-010 (information formulas assume discrete sets).

### Gap 2: Global vs Local Tilt

**Problem**: Section 8 defines tilt globally (ε_ij is a single value for the perspective). Section 13 needs local tilt (ε_ij(p) varies by location) to define content.

**Current state**: Both are mentioned but their relationship is not derived.

**Possible approaches**:
1. Local tilt emerges from multiple overlapping perspectives
2. Global tilt is an average; local tilt is the full structure
3. Points ARE the places where tilt varies; homogeneous tilt = no points

### Gap 3: Time Direction (Arrow of Time)

**Problem**: Time is defined as perspective sequences (π₁, π₂, π₃, ...), but what determines the ordering? Why isn't the reverse sequence equally valid?

**Current state**: Axiom T1 says the Crystal is timeless, but doesn't explain why perspective-sequences have a preferred direction.

**Possible approaches**:
1. Information loss defines direction (entropy increase)
2. Tilt healing defines direction (toward Crystal = forward)
3. Direction is conventional (no fundamental arrow)
4. Causation from adjacency constraints (Adj.1 from old formulation)

### Gap 4: Why Does Perspective Exist?

**Problem**: We axiomatize that perspective exists (P1-P4) but don't explain why.

**Current state**: The investigation file `perspective_origin.md` suggests self-reference (Cantor/Gödel/Lawvere), but this isn't formalized in Layer 0.

**Status**: This may be the deepest question. It might not have an answer within the framework (perspective might be truly primitive).

### Gap 5: Measure on Perspective Space

**Problem**: Claims like "most perspectives introduce tilt" require a measure on Π, which is not defined.

**Current state**: P4 was weakened to "some perspectives may introduce tilt" to avoid this issue.

**Possible approaches**:
1. Define natural measure from Crystal structure
2. Leave as empirical (our universe has tilted perspectives)
3. Derive from maximum entropy principle

---

## Appendix: Comparison with Previous Formulation

### Old Formulation (v1.0)

Primitives: U = (P, Σ, Γ, C, V, B) — six fundamental elements

### New Formulation (v2.0)

Primitives: V_Crystal, Perspective — two fundamental elements

| Old Element | New Status |
|-------------|------------|
| P | DERIVED from dimension intersections |
| Σ | DERIVED from dimension sharing |
| Γ | DERIVED = Jaccard index = γ |
| C | DERIVED = local tilt ε_ij |
| V | SPLIT: V_Crystal (primitive), V_Observable (derived) |
| B | DERIVED: B̃ = tilted dimensions |

### Advantages of New Formulation

1. **Fewer primitives**: 2 instead of 6
2. **Unified**: Γ and γ are now the same thing
3. **Matter = geometry**: Content is not separate from structure
4. **Time clarified**: Explicitly perspective-relative
5. **More constrained**: Emergence is forced, not assumed

---

*This is Layer 0: Pure mathematics with no physics interpretation.*
*For physical identification, see Layer 2 (correspondence rules).*
*For predictions, see Layer 3.*

---

**Document version**: 2.2
**Created**: 2026-01-26 (rewritten from v1.0)
**Revised**: 2026-01-26
- v2.1: Added Known Gaps section, fixed notation errors
- v2.2: Clarified perspective as projection operator, fixed tilt definition
**Based on**: Foundational investigation (Session 2026-01-26-31)
