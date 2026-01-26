# Axiomatic Approach: Primes from Orthogonality

**Status**: WORK IN PROGRESS
**Date**: 2026-01-26

---

## Goal

Derive the existence and properties of prime numbers from orthogonality axioms, rather than from the traditional definition (divisibility).

---

## The Standard Definition (What We Want to Derive)

**Traditional**: A prime p > 1 is a positive integer with no positive divisors other than 1 and p.

**Equivalent**: p is prime iff p = ab implies a = 1 or b = 1.

**What this misses**: WHY should such elements exist? What makes them necessary?

---

## Orthogonality-First Axioms

### Setup: A Multiplicative Structure with Independence

Let (S, ⊗, ⊥) be a structure where:
- S is a set of elements
- ⊗ is a composition operation (will become multiplication)
- ⊥ is an orthogonality relation (will capture "no shared factors")

### Axiom O1: Composition
S has an associative, commutative composition ⊗ with identity element e.
```
a ⊗ (b ⊗ c) = (a ⊗ b) ⊗ c
a ⊗ b = b ⊗ a
a ⊗ e = a
```

### Axiom O2: Orthogonality is Symmetric
```
a ⊥ b ⟺ b ⊥ a
```

### Axiom O3: Self-Orthogonality Only for Identity
```
a ⊥ a ⟺ a = e
```
(Only the identity is orthogonal to itself — all other elements have "self-overlap")

### Axiom O4: Orthogonality Distributes Over Composition
```
(a ⊥ b) ∧ (a ⊥ c) ⟺ a ⊥ (b ⊗ c)
```
(If a is orthogonal to b and c separately, it's orthogonal to their composition)

### Axiom O5: Composition Destroys Self-Orthogonality
```
a ≠ e ⟹ ¬(a ⊥ (a ⊗ b)) for any b
```
(Composing something with a always shares structure with a)

### Axiom O6: Non-Trivial Decomposition
For any a ≠ e, either:
- a is **irreducible**: a = b ⊗ c implies b = e or c = e
- a is **composite**: ∃ b, c ≠ e such that a = b ⊗ c

---

## Theorem: Irreducibles Are Mutually Orthogonal

**Claim**: If p, q are distinct irreducibles, then p ⊥ q.

**Proof sketch**:
- Suppose p and q are not orthogonal
- Then they share some structure
- This shared structure would be a common component
- But both are irreducible, so cannot have proper components
- Contradiction unless p = q

**Note**: This needs formalization of "shared structure" — currently informal.

---

## Toward Unique Factorization

**Goal**: Show that every element has a unique representation as a composition of irreducibles.

### Existence of Factorization
By O6, we can repeatedly decompose composites until reaching irreducibles.
(Needs: well-foundedness condition, i.e., chains of decomposition terminate)

### Uniqueness
The orthogonality structure should force uniqueness. Key insight:
- Different irreducibles are orthogonal (mutually independent)
- Independence means no "hidden" ways to rearrange factorizations

---

## The Half-Dimension Puzzle

If we think of irreducibles as basis vectors in an infinite-dimensional space:
- Each irreducible spans an independent dimension
- Each element is a point with coordinates = exponents

**But spectral analysis shows ~1/2 dimension. Why?**

Possible resolution: The irreducibles themselves are constrained by orthogonality in their distribution along the "number line" (the total ordering inherited from counting).

The half-dimension might reflect:
```
dim(structure) = 1 (linear ordering) × 1/2 (orthogonality constraint)
```

---

## Connection to Your "Layering" Intuition

### Topological Interpretation

Think of each irreducible as defining a **hyperplane** in the space of all elements:
```
H_p = {a ∈ S : a is not orthogonal to p}
```

These hyperplanes:
- Each contains all multiples of p
- Intersect at elements with multiple prime factors
- Are "maximally separated" (any two distinct H_p, H_q intersect at a lower-dimensional set)

### The Layering Effect

"Laying planes of orthogonal dimensions on top of each other":
- Start with the trivial structure (just identity)
- Add dimension p₁: creates plane H_{p₁}
- Add dimension p₂: creates plane H_{p₂}, orthogonal to H_{p₁}
- Intersection H_{p₁} ∩ H_{p₂} = elements divisible by both

As you stack orthogonal planes:
- The irreducibles sit at the "edges" where only one plane touches
- Composites sit at intersections
- The structure forces certain gaps between irreducibles

### Why Gaps?

Two irreducibles p, q can't be "too close" because:
- Closeness in ordering would mean their hyperplanes nearly coincide
- But they must be orthogonal (completely independent)
- This creates a "repulsion" effect in the ordering

This might explain the Montgomery-Dyson observation: irreducibles (primes) have eigenvalue-like statistics with level repulsion.

---

## Research Questions

1. **Formalize "shared structure"**: Need a rigorous definition that makes the theorem proofs work.

2. **Well-foundedness**: What condition ensures factorization terminates? (In ℤ⁺, it's that factors are smaller. What's the analogue here?)

3. **Derive the counting function**: Can the density of irreducibles (prime number theorem) be derived from orthogonality constraints?

4. **Generalize**: Do other UFDs (Gaussian integers, polynomial rings) satisfy these axioms? What varies?

5. **Physical realization**: Is there a physical system where this orthogonality structure is manifest?

---

## Comparison with Standard Approaches

| Aspect | Standard Approach | Orthogonality Approach |
|--------|-------------------|------------------------|
| Primary concept | Divisibility | Independence/orthogonality |
| Primes defined as | No non-trivial divisors | Irreducibles (can't decompose) |
| UFT status | Theorem requiring proof | Should follow from axioms |
| Why primes exist | Just how numbers work | Forced by independence structure |
| Prime gaps | Deep mystery | Potentially from repulsion |

---

## Status

This is a sketch of an approach, not a completed theory. Key gaps:

1. "Shared structure" needs rigorous definition
2. Connection to spectral dimension is speculative
3. Gap distribution derivation is only an intuition
4. Axioms may need refinement to exclude pathological cases

---

## Next Steps

1. Work out the algebra rigorously for the standard integers case
2. Check if axioms hold for other UFDs
3. Investigate the half-dimension claim computationally
4. Connect to existing work on spectral geometry of primes
