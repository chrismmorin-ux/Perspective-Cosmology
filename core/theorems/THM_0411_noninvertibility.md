# THM_0411 Theorem: Non-Invertibility of Access

**Tag**: 0411
**Type**: THEOREM
**Status**: CANONICAL (promoted from SKETCH — rigorous proof below)
**Source**: core/03_propagation.md

---

## Requires

- [AXM_0100: Finiteness] — |P| < ∞, dim(V) < ∞
- [AXM_0104: Partiality] — U_π ⊊ U
- [DEF_0222: Receptive subspace] — V_p ⊆ V, Π_p: V → V_p
- [DEF_0224: Access map construction] — A_π = Π_p ∘ eval_p ∘ lim (P_D)^n

## Provides

- A_π is not injective (hence not invertible)

---

## Statement

**Theorem Pr.1 (Non-Invertibility)**

```
For any perspective π = (p, D, A) where A_π is well-defined:

    A_π: V^P → V_p  is not injective.

Equivalently: ker(A_π) ≠ {0} — distinct content assignments can produce
identical accessible content.
```

---

## Proof

### Given

- V^P is the space of content assignments, with dim(V^P) = |P| · dim(V) [AXM_0100: both finite]
- V_p ⊆ V is the receptive subspace at p, with dim(V_p) ≤ dim(V) [DEF_0222]
- A_π: V^P → V_p is a composition of linear maps [DEF_0224], hence linear [I-MATH]

### Step 1: Linearity of A_π

A_π = Π_p ∘ eval_p ∘ lim_{n→∞} (P_D)^n, where:
- (P_D)^n is linear (composition of the linear operator P_D) [DEF_0221]
- lim_{n→∞} (P_D)^n is linear, when the limit exists (pointwise limit of linear maps on a finite-dimensional space) [I-MATH]
- eval_p: V^P → V defined by eval_p(f) = f(p) is the evaluation functional, which is linear [I-MATH]
- Π_p: V → V_p is the orthogonal projection, which is linear [DEF_0222, I-MATH]

Therefore A_π is a composition of linear maps, hence linear. [I-MATH]

### Step 2: Dimension comparison

We show dim(V^P) > dim(V_p) by case analysis.

**Case A: |P| ≥ 2.**

```
dim(V^P) = |P| · dim(V) ≥ 2 · dim(V) > dim(V) ≥ dim(V_p)
```

The first inequality uses |P| ≥ 2. The strict inequality uses dim(V) ≥ 1 (the value space is nontrivial). The final inequality is dim(V_p) ≤ dim(V) since V_p ⊆ V. [DEF_0222]

**Case B: |P| = 1.**

With a single point, V^P ≅ V, so dim(V^P) = dim(V). Suppose for contradiction that dim(V_p) = dim(V). Then V_p = V, so Π_p = id_V. The access map becomes A_π = id ∘ eval_p ∘ lim(P_D)^n. With |P| = 1, eval_p is an isomorphism V^P ≅ V, so A_π: V → V would be surjective onto V = V_p. This gives U_π = U (all content is accessible), contradicting AXM_0104 (Partiality).

Therefore dim(V_p) < dim(V) = dim(V^P). [AXM_0104]

### Step 3: Non-injectivity

In both cases, A_π: V^P → V_p is a linear map with dim(domain) > dim(codomain).

By the rank-nullity theorem [I-MATH]:

```
dim(ker(A_π)) = dim(V^P) - dim(Im(A_π)) ≥ dim(V^P) - dim(V_p) > 0
```

Therefore ker(A_π) ≠ {0}, and A_π is not injective. □

---

## Verification

**Script**: `verification/sympy/noninvertibility_attenuation_proof.py`
**Status**: PASS (concrete examples confirming kernel dimension)

---

## Corollary: Quantitative information loss

The kernel dimension satisfies:

```
dim(ker(A_π)) ≥ |P| · dim(V) - dim(V_p) ≥ (|P| - 1) · dim(V)
```

For the framework values |P| = n_c = 11, dim(V) = n_c = 11, dim(V_p) ≤ 11:

```
dim(ker(A_π)) ≥ 11 · 11 - 11 = 110
```

At least 110 dimensions of content are necessarily invisible to any single perspective.

---

## Notes

This theorem confirms that access necessarily loses information. The proof identifies two independent mechanisms:

1. **Dimensional collapse**: eval_p collapses |P| vectors to one (losing (|P|-1)·dim(V) dimensions)
2. **Subspace projection**: Π_p projects onto V_p ⊆ V (losing dim(V) - dim(V_p) additional dimensions)

Either mechanism alone suffices for non-invertibility when the relevant dimension gap exists.

**Relationship to AXM_0106**: AXM_0106 postulates non-invertibility as an axiom. THM_0411 derives the same property from the access map construction (DEF_0224), showing AXM_0106 is not independent — it follows from AXM_0100 + AXM_0104 + the access map construction. Consider reclassifying AXM_0106 as redundant (see Session 140 audit, Issue 1.3).

**Well-definedness assumption**: The proof assumes A_π is well-defined, i.e., lim_{n→∞} (P_D)^n exists. Sufficient conditions for this are given in THM_0412 (Attenuation).

---

## History

- Original: Sketch-level proof (3 bullet points)
- Session 189: Downgraded CANONICAL → SKETCH (proof not rigorous)
- Session 196: Rigorous proof via rank-nullity theorem. Promoted SKETCH → CANONICAL.
