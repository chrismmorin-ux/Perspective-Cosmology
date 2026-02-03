# Investigation: How Points Emerge from Dimensional Overlap

**Status**: ARCHIVE
**Created**: 2026-01-26
**Confidence**: [CONJECTURE]
**Purpose**: Formalize how P (the point set) emerges from B (the basis)

---

## 1. The Claim

**Claim**: Points are not fundamental. They emerge as locations where multiple dimensions "overlap" or "intersect."

---

## 2. Intuition

### 2.1 Old Picture (Points Fundamental)

```
P = {p₁, p₂, ...}     ← primitive
V with basis B        ← primitive
C: P → V              ← content at each point
```

Points exist first. We put content on them.

### 2.2 New Picture (Dimensions Fundamental)

```
B = {b₁, b₂, ..., bₙ}  ← primitive (dimensions)
Interactions between dimensions create structure
Points emerge where dimensions "meet"
```

Dimensions exist first. Points are derived.

---

## 3. What Does "Dimensions Overlap" Mean?

### 3.1 Naive Interpretation: Set Intersection

Doesn't work. Basis vectors are orthogonal: bᵢ ∩ bⱼ = ∅ as sets (if we think of them as sets).

### 3.2 Better Interpretation: Joint Content

A "point" is a specification of content along MULTIPLE dimensions simultaneously.

**Definition attempt**:
```
A point p corresponds to a content vector c ∈ V with:
c = Σᵢ cᵢ bᵢ   where   cᵢ ≠ 0 for at least 2 indices
```

A point is where content is non-trivial in multiple dimensions.

### 3.3 Even Better: Subspace Correspondence

**Definition**:
```
A point p corresponds to a subspace S_p ⊆ V where:
- S_p is the span of dimensions that are "active" at p
- dim(S_p) ≥ 2 for p to be "point-like"
```

The more dimensions active, the more "localized" the point.

---

## 4. Formalization Attempt

### 4.1 Content Field Approach

Let content be distributed over V, not over pre-existing points.

**Definition**: A content distribution is a measure μ on V.

**Definition**: A point is a "concentration" of μ — a location where μ is high in multiple B-directions.

**Formal**: p is a point if:
```
supp(μ) ∩ span{bᵢ, bⱼ} ≠ {0}   for multiple pairs (i,j)
```

### 4.2 The P-from-B Construction

Given B = {b₁, ..., bₙ}:

**Step 1**: Define "intersection patterns"
```
I = { S ⊆ B : |S| ≥ 2 }
```
Each S is a potential "point location" (where those dimensions intersect).

**Step 2**: Filter by content
```
P = { S ∈ I : content exists at the intersection of S }
```

Not all potential intersections are realized. Only where content exists.

**Step 3**: Identify points
```
p_S ↔ S   for each realized S
```

### 4.3 Problems with This Formalization

1. **Circular**: "Content exists at intersection" presupposes something like points
2. **Overcounting**: Many S could give the same "point"
3. **Missing structure**: Doesn't explain WHY content concentrates

---

## 5. Alternative: Points as Coincidence of Perspectives

### 5.1 Core Idea

A point is where multiple perspectives "agree" about content.

**Definition**:
```
p = coincidence point of {π₁, ..., πₖ} if:
∀i,j: U_{πᵢ} ∩ U_{πⱼ} contains common content at p
```

Points emerge from perspective OVERLAP, not just dimensional overlap.

### 5.2 Connection to γ

High γ(π₁, π₂) means much shared content.

The LOCUS of shared content = points visible to both perspectives.

**Implication**: Points depend on which perspectives exist, not just on dimensions.

### 5.3 Advantages

- Perspective-first (matches our ontological priority)
- Points are relational (they exist between perspectives)
- Naturally explains why different observers agree on "where" things are

---

## 6. The Dimensionality of Points

### 6.1 Question

If a point emerges from k dimensions intersecting, what's its "size"?

### 6.2 Intuition from Geometry

In ℝⁿ:
- A single hyperplane has codimension 1
- Two hyperplanes intersect in codimension 2
- k hyperplanes intersect in codimension k (generically)
- n hyperplanes intersect in a point (codimension n)

### 6.3 Application

If we have n dimensions in B:
- A "point" (zero-dimensional) requires content concentrated in all n
- A "line" requires concentration in n-1
- etc.

**Prediction**: dim(P_item) = n - |S| where S is the set of active dimensions.

**Consequence**: True "points" (dim 0) require all n dimensions to be active.

---

## 7. Why Points Are Discrete

### 7.1 Question

Why do we have discrete points p₁, p₂, ... rather than a continuum?

### 7.2 Possible Answers

**Answer A: Content is discrete**
- If content values are quantized, points of concentration are discrete
- Connected to "number of perspectives" being finite

**Answer B: Resonance/stability**
- Not all intersections are stable
- Only certain patterns persist
- Like standing waves — discrete modes

**Answer C: Information constraint**
- Finite total information in the system
- Can only support finite number of distinguishable points

### 7.3 Assessment

All answers connect to FINITENESS — of perspectives, of content, of information. The finiteness of |Π| may drive the finiteness of |P|.

---

## 8. Formal Correspondence: Old P ↔ New Construction

### 8.1 Goal

Show the old axioms for P can be DERIVED from dimensional structure.

### 8.2 Mapping

| Old Axiom | New Derivation |
|-----------|----------------|
| P is finite | |Π| finite → finite intersections |
| |P| ≥ 2 | Non-triviality requires multiple perspectives |
| Σ (connectivity) | Perspectives sharing dimensions are connected |
| C: P → V | Content vector at each intersection |

### 8.3 What Changes

- P is no longer primitive (derived from B and Π)
- The "location" of a point is defined by WHICH dimensions intersect
- Connectivity Σ comes from dimensional sharing, not independent axiom

---

## 9. Implications

### 9.1 For the Framework

If this works:
- Layer 0 becomes simpler (fewer primitives)
- P, Σ, potentially Γ all derive from B and perspective structure
- Cleaner ontology

### 9.2 For Physics

- "Where" something is = which dimensions it spans
- Locality = sharing dimensions with neighbors
- Non-locality = sharing dimensions with distant content (if dimensions can be "spread out")

### 9.3 Testable?

Not directly, but:
- Should be CONSISTENT with known physics
- Might predict specific relationships between dimension count and point structure

---

## 10. Open Questions

1. **Circular definition?** Can we define "intersection" without presupposing points?
2. **Why these intersections?** What determines which potential points are realized?
3. **Connection to |Π|?** Does perspective count determine point count?
4. **Metric?** How does distance between points emerge?

---

## 11. Next Steps

1. **Resolve circularity** — define intersection without points
2. **Connect to perspective_origin.md** — do points emerge from the representation gap?
3. **Derive |P|** — can we predict the number of points from |Π| and n?
4. **Recover Σ** — show connectivity emerges from dimensional sharing

---

## 12. Summary

| Claim | Status |
|-------|--------|
| Points emerge from dimension intersection | [CONJECTURE] |
| P can be derived from B and Π | [CONJECTURE] |
| Points are where perspectives agree | [SPECULATION] |
| Point count connects to |Π| | [SPECULATION] |
| Old P axioms are derivable | Not yet shown |

---

*Investigation status: ACTIVE*
*Depends on: dimension_emergence.md, perspective_origin.md*
*Next: Resolve circular definition problem*
