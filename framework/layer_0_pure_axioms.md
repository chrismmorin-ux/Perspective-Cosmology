# Layer 0: Pure Axioms

> **Deprecation notice (2026-01-30)**: The canonical axiom definitions are in
> `core/axioms/` (AXM-numbered files). This document is a narrative overview.
> For formal axiom statements, always reference `core/axioms/AXM_XXXX_*.md`.

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

**Definition (Perspective Dimension)**
```
d_π = dim(V_π)
```
The number of accessible dimensions in perspective π.

**Note on Notation**: The core definitions (DEF_0250) define information content as `I_π = log₂|U_π|` (information-theoretic measure). Here in Layer 0 we work with the dimensional quantity `d_π` which is the more natural Layer 0 concept. The relationship between dimension and information content depends on the structure of the accessible content set U_π. See DEF_0250 for the information-theoretic definition.

**Definition (Hidden Dimension)**
```
h_π = dim(V_Crystal) - d_π
```
Or h_π = ∞ if V_Crystal is infinite-dimensional.

**Theorem I.1 (Dimensional Conservation)**
```
d_π + h_π = dim(V_Crystal) = constant
```

**Note**: This is a dimensional conservation law. The corresponding cardinality conservation law (THM_0450, Session 133) states: `|U_π| + |H_π| = |U|`. The information-theoretic bound is: `I_π + S_π ≤ 2·log₂|U| - 2`.

---

## Part V: Transitions and Time

### 17. The Transition Algebra

**Definition (Transition)**

A transition T is a mapping between adjacent perspectives:
```
T: π₁ → π₂    where π₁ ~ π₂
```

Intuitively: T describes how access to V_Crystal changes from one perspective to another.

**Definition (Transition Algebra)**

The **transition algebra** 𝒯 is the space of all mathematically consistent transitions:
```
𝒯 = {T : T maps between adjacent perspectives}
```

**Axiom T0 (Algebraic Completeness)**
```
𝒯 is closed under:
(a) Composition: T₂ ∘ T₁ ∈ 𝒯 when composable
(b) Identity: I ∈ 𝒯 (trivial transition, π → π)
(c) Inverse: For every T: π₁ → π₂, there exists T⁻¹: π₂ → π₁ in 𝒯
```

**Theorem T.0 (Invertibility)**
```
Every non-zero transition has an inverse in 𝒯.
```

**Proof**:
By Axiom T0(c), this is definitional. The transition algebra contains all mathematically consistent transitions. For any T: π₁ → π₂, the mapping T⁻¹: π₂ → π₁ is mathematically consistent (both perspectives exist, and adjacency is symmetric by Theorem Γ.1(d)). Therefore T⁻¹ ∈ 𝒯. ∎

**Remark (Why Invertibility is Not Assumed)**:
This is not an assumption but a *definition*. The transition algebra 𝒯 is defined as the space of all possible transitions between perspectives. Since adjacency is symmetric (γ(π₁, π₂) = γ(π₂, π₁)), any transition π₁ → π₂ has a corresponding transition π₂ → π₁. The algebra contains both.

### 18. Time as Path

**CRITICAL INSIGHT**: Time does not constrain transitions. Time IS transitions.

**Axiom T1 (Crystal is Timeless)**
```
V_Crystal has no temporal structure.
There is no "before" or "after" within the Crystal.
```

**Definition (History)**
```
A history h is a specific path through 𝒯:
h = (T₁, T₂, T₃, ...) = (π₀ → π₁ → π₂ → π₃ → ...)
```

**Definition (Perspective-Time)**
```
Time IS the history:
t ↔ h = (T₁, T₂, T₃, ...)
```

Time is not a parameter along which transitions occur. Time is the transitions themselves.

**Theorem T.1 (Time is Path, Not Constraint)**
```
The transition algebra 𝒯 contains all possible transitions.
A history h selects which transitions occur, not which ones exist.

Analogy:
- 𝒯 is like phase space (all possible states)
- h is like a trajectory (one path through phase space)
- The existence of T⁻¹ in 𝒯 does not mean T⁻¹ is in h
```

**Theorem T.2 (No External Time)**
```
All dynamical concepts (evolution, change, causation)
are defined WITHIN histories, not externally.
```

**Corollary**: Asking "when did perspective nucleate?" is malformed. There was no time before perspective. "Nucleation" is logical/structural, not temporal.

### 19. Physical Transitions (Preview)

**Note**: This section previews a Layer 2 concept. In pure Layer 0, we only define the mathematical structure.

The transition algebra 𝒯 contains all possible transitions, including "time-reversed" ones. Physical processes may select a subset.

**Definition (Physical Subset)** [LAYER 2 CONCEPT]
```
𝒯_physical ⊆ 𝒯 (some subset satisfying physical constraints)
```

**Example**: If physical transitions satisfy ΔI ≥ 0 (information non-decrease), then:
- T: π₁ → π₂ with ΔI > 0 is in 𝒯_physical
- T⁻¹: π₂ → π₁ with ΔI < 0 is in 𝒯 but not 𝒯_physical

**Critical Point**: Frobenius theorem applies to **𝒯**, not 𝒯_physical. The mathematical structure is the full algebra; physics selects a subset.

**Analogy**:
- Lorentz group includes time reversal (mathematical completeness)
- Physics selects the future light cone (physical constraint)
- The group structure is complete; the physics adds constraints

---

## Part VI: Summary

### 20. Complete Axiom List

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

**Transition Axioms (2)**
| ID | Name | Statement |
|----|------|-----------|
| T0 | Algebraic Completeness | 𝒯 closed under composition, identity, inverse |
| T1 | Crystal Timeless | No temporal structure in V_Crystal |

**Total: 13 axioms + 1 meta-axiom**

**Meta-Axiom (Session S251)**
| ID | Name | Statement |
|----|------|-----------|
| CCP | Consistency-Completeness (AXM_0120) | V_Crystal contains all consistent algebraic structure; no more, no less |

CCP subsumes C5 (forces dim = 11), constrains C1 (forces F = C), and strengthens T0 (forces quaternionic transitions, n_d = 4). See `core/axioms/AXM_0120_completeness_principle.md`.

### 20b. Primitive Reduction (Session S253, THM_04B2)

THM_04B2 proves that the perspective axioms (P1-P4, Pi1-Pi2) and transition axioms (T0, T1) are all **derivable** from V_Crystal (C1-C4) + CCP. The framework's true independent axioms reduce to:

| Independent Axioms | Count |
|----|------|
| C1 (Existence) | 1 |
| C2 (Perfect Orthogonality) | 1 |
| C3 (Completeness) | 1 |
| C4 (Symmetry) | 1 |
| CCP (Consistency-Completeness) | 1 |
| **Total** | **5** |

**How**: CCP forces Im(C) to exist in V_Crystal (it's the imaginary part of C, the first non-trivial normed division algebra). Im(C) breaks C4 symmetry, creating the decomposition V = V_pi + G_pi, which IS perspective. The cascade Im(C) -> Im(H) -> Im(O) forces n_c = 11, n_d = 4. Perspective axioms P1-P3 follow from THM_04AC (dim >= 2). P4 follows from F = C. Pi1-Pi2 follow from SO(11) action. T0 follows from CCP forcing quaternionic transitions. T1 is definitional (V_Crystal has no temporal structure by construction).

**The logical chain**: CCP -> Im(C) -> symmetry breaking -> perspective -> transitions -> time -> physics.

**Im(C) as seed**: The irreducible element Im(C) is both the FIRST consequence of CCP (the minimal non-real algebraic element) and the LAST remainder of the gap tower (THM_04B0, terminal dim 1). The cascade that builds V_Crystal from Im(C) (bottom-up) is the same structure that self-examination discovers (top-down). See `core/theorems/THM_04B2_perspective_from_seed.md`.

**Note**: The perspective and transition axioms remain useful as working tools — they describe the derived structure clearly. But they are no longer logically independent.

### 21. Emergence Summary

| Concept | Status | Emerges From | Complete? |
|---------|--------|--------------|-----------|
| V_Crystal | **PRIMITIVE** | — | ✓ |
| CCP | **PRIMITIVE** | — | ✓ |
| Im(C) | Derived | CCP-2 forces Im(C) in V_Crystal | ✓ |
| Perspective | Derived (S253) | Im(C) breaks C4 symmetry (THM_04B2) | ✓ |
| B̃ (tilted basis) | Derived | F=C structure misaligns projections | ✓ |
| V_Observable | Derived | V_π = span(B̃) | ✓ |
| P (points) | Derived | Dimension intersection structure | **GAP** |
| Σ (connectivity) | Derived | Dimension sharing (given P) | ✓ |
| Γ (weights) | Derived | Jaccard index of sharing | ✓ |
| C (content) | Derived | Local tilt configuration ε_ij | **GAP** |
| 𝒯 (transitions) | Derived | T0 (algebraic completeness) | ✓ |
| Time | Derived | History = path through 𝒯 | ✓ |
| Invertibility | Derived | T0(c) + adjacency symmetry | ✓ |

See Section 24 for details on remaining gaps.

### 22. What the Axioms Do NOT Determine

| Parameter | Status | Notes |
|-----------|--------|-------|
| dim(V_Crystal) | **RESOLVED by AXM_0120** | CCP forces dim = 11 (S251) |
| F (scalar field) | **RESOLVED by AXM_0120** | CCP forces F = C (S251) |
| \|Π\| | FREE | Number of perspectives |
| Specific ε_ij values | FREE | Tilt magnitudes |
| n = dim(V_Observable) | **CONSTRAINED by AXM_0120** | n_d = 4 from CCP + T0 (S251) |

**Note (S251)**: The Consistency-Completeness Principle (AXM_0120) resolves three of the four free parameters above. See `core/axioms/AXM_0120_completeness_principle.md` for the full derivation. The principle states: V_Crystal must be maximally complex while remaining consistent, because perspectives can only restrict (never extend) the accessible structure. Combined with Hurwitz's theorem, this forces dim = 11, F = C, and transition dimension = 4.

### 23. What the Axioms DO Determine

| Property | Determined By |
|----------|---------------|
| Im(C) exists | CCP-2 (completeness) |
| Symmetry breaks / perspective exists | Im(C) + C4 (THM_04B2) |
| Perspectives have finite access | CCP.1 (n=11 is finite) |
| Tilt is possible | CCP.2 (F=C, complex structure) |
| Points, Σ, Γ are emergent | Definitions from dimensions |
| Content = tilt | Definition |
| Transitions form complete algebra | T0 |
| Invertibility exists | T0(c) + adjacency symmetry |
| Time is path through 𝒯 | Definition (Section 18) |

---

## 24. Known Gaps

This section documents where the emergence story is incomplete. These are **research questions**, not failures — the framework is honest about what remains to be derived.

### Gap 1: Point Emergence from Continuous Space — **RESOLVED (Session 120)**

**Problem**: V_π is a vector space (continuous). How do discrete point-like structures emerge?

**Resolution**: Points emerge as **topological defects** in the tilt field ε_ij(x). The Mexican hat energy functional fixes |ε| = ε*, but the direction can wind. Topological defects are classified by integer homotopy groups, giving discrete points from continuous fields.

**See**: `framework/investigations/spacetime/tilt_topology_point_emergence.md`

### Gap 2: Global vs Local Tilt — **RESOLVED (Session 120)**

**Problem**: Section 8 defines tilt globally (ε_ij is a single value for the perspective). Section 13 needs local tilt (ε_ij(p) varies by location) to define content.

**Resolution**: Global and local tilt are different aspects of the **same tilt field** ε_ij(x):
- Global tilt = spatial average ⟨ε⟩ (determines coupling constants)
- Local tilt = spatial variation δε(x) (determines matter distribution)
- Points are where local tilt has topological winding

**See**: `framework/investigations/spacetime/tilt_topology_point_emergence.md`

### Gap 3: Time Direction (Arrow of Time) — CLARIFIED

**Problem**: Why do physical histories have a preferred direction?

**Session 62 Clarification**: This is now understood as a **physical** question, not a **mathematical** one.

**The mathematical situation** (resolved):
- The transition algebra 𝒯 contains all transitions, including "reversed" ones
- Both T and T⁻¹ exist in 𝒯
- Time direction is not a constraint on the algebra — it's about which *path* is taken

**The physical question** (remains open):
- Why do physical histories select paths with ΔI ≥ 0 (entropy increase)?
- This is the same as asking: why does physics select 𝒯_physical ⊂ 𝒯?

**Possible approaches**:
1. ΔI ≥ 0 is a boundary condition (initial state was low-entropy)
2. ΔI ≥ 0 defines "forward" (tautological — direction is entropy increase)
3. Physical transitions minimize something (action principle)

**Status**: Moved from "mathematical gap" to "physical constraint to explain"

### Gap 4: Why Does Perspective Exist? — **SUBSTANTIALLY ADDRESSED (Session 188)**

**Problem**: We axiomatize that perspective exists (P1-P4) but don't explain why.

**Resolution via Evaluation Map (THM_04AC, CANONICAL)**:

THM_04AC proves that for dim(V_Crystal) = n >= 2, any set of k linearly independent vectors (1 <= k <= n-1) induces a rank-k orthogonal projection satisfying P1, P2, and P3.

**Proof by contradiction**: Suppose position v_0 has no blind spots. Then ev_{v_0}: End(V) -> V is injective, requiring n^2 <= n. For n >= 2: contradiction. Therefore blind spots (partiality) are STRUCTURALLY INEVITABLE.

**Axiom reduction**: P1 (Partiality), P2 (Non-Triviality), and P3 (Finite Access) are now theorems, not independent axioms. They follow from dim >= 2 plus the existence of evaluation points (which is trivially satisfied — every non-zero vector is one).

**What remains open**:
- Why a SPECIFIC rank k is selected (why k = 4 and not k = 3 or k = 7) — requires dynamics or additional structure
- Whether one perspective is "real" or all are potential — C4 equivariance says all same-rank perspectives are equivalent

**Previous approach (THM_04AA)**: The self-representation conditional fails for finite dimensions but is superseded by the evaluation map argument, which works directly for finite V_Crystal.

**See**: `framework/investigations/meta/godel_self_inaccessibility.md`, THM_04AC.

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

## Note: Imperfect Dimensions Extension (Session 55)

The tilt matrix ε_ij (Section 8) captures deviation from orthogonality. Session 55 proposed a *dynamic* interpretation:

- Dimensions with ε_ij ≠ 0 are "imperfect" (semi-orthogonal)
- Imperfect dimensions can be created (nucleation) and merged (recrystallization)
- This reframes gravity as dimension-merging without changing Layer 0 axioms

**Status**: CONJECTURE — compatible with but not derivable from these axioms

**See**:
- `framework/layer_0_foundations.md` Section 9
- `framework/investigations/imperfect_dimensions_and_recrystallization.md`

---

*This is Layer 0: Pure mathematics with no physics interpretation.*
*For physical identification, see Layer 2 (correspondence rules).*
*For predictions, see Layer 3.*

---

**Document version**: 2.4
**Created**: 2026-01-26 (rewritten from v1.0)
**Revised**: 2026-01-27
- v2.1: Added Known Gaps section, fixed notation errors
- v2.2: Clarified perspective as projection operator, fixed tilt definition
- v2.3: Added note about imperfect dimensions extension (Session 55)
- v2.4: **Added Transition Algebra (Session 62)** — Axiom T0 (Algebraic Completeness), derived invertibility from "time IS transitions" insight. Invertibility now follows from adjacency symmetry + T0. Gap 3 (time direction) reclassified from mathematical gap to physical constraint.
**Based on**: Foundational investigation (Session 2026-01-26-31)
