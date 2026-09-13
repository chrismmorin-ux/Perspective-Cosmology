# Investigation: Can n_EW = 5 Be Derived?

REQUIRES: core/06_basis_geometry, physics/gauge_structure
STATUS: INVESTIGATION (2026-01-25)

---

## The Question

The α derivation requires n_EW = 5. Is this value:
1. **Derivable** from axioms A1-A6?
2. **Constrained** by consistency requirements?
3. **Arbitrary** (a free parameter)?

---

## Current Claim

From alpha.md:
```
B_EW = span{b_Q, b_Y, b_I₁, b_I₂, b_I₃}
n_EW = 5
```

---

## Problem 1: The Axioms Don't Constrain dim(B)

Reviewing core axioms:

| Axiom | What It Says | Constrains dim(B)? |
|-------|--------------|-------------------|
| U1 (Finiteness) | dim(V) < ∞ | Upper bound only |
| U2 (Connectivity) | Graph connected | No |
| U3 (Non-Triviality) | ∃ distinct content | No |
| U4 (Closure) | Simplicial complex | No |
| A1-A3 | Perspective partiality | No |
| A6 | Information loss → adjacency | No |

**Conclusion**: Nothing in the axioms constrains the total dimension of V or the dimensions of its subspaces.

---

## Problem 2: Inconsistent Dimension Counting

Different documents give different values:

| Document | n_weak | n_EM | n_EW total |
|----------|--------|------|------------|
| alpha.md | 3 (isospin components) | 2 (Q, Y) | 5 |
| gauge_structure.md | 2 (SU(2) doublet) | 1 (U(1) phase) | 3 |
| Lie algebra | 3 (su(2) generators) | 1 (u(1) generator) | 4 |

**Which is correct?** None—they count different things.

---

## Problem 3: Gell-Mann–Nishijima Constraint

The electromagnetic charge satisfies:
```
Q = I₃ + Y/2
```

This means b_Q is **not independent** of {b_Y, b_I₃}.

If alpha.md claims B_EW = {b_Q, b_Y, b_I₁, b_I₂, b_I₃}, then:
- These 5 vectors span at most 4 dimensions
- Or b_Q is redundant and shouldn't be counted

---

## Problem 4: What Does "Electroweak Dimension" Mean?

The framework conflates three different concepts:

### Concept A: Representation Dimension
- SU(2) doublet: 2-dimensional
- U(1) phase: 1-dimensional
- Total: 3

### Concept B: Lie Algebra Dimension
- su(2): 3 generators (T₁, T₂, T₃)
- u(1): 1 generator
- Total: 4

### Concept C: "B-Space Dimensions" (alpha.md)
- Somehow arrives at 5
- Definition unclear

**Without defining what "dimension" means, n_EW is meaningless.**

---

## Attempt to Derive n_EW = 5

### Approach 1: From Gauge Boson Count

Electroweak gauge bosons: W⁺, W⁻, Z, γ = **4 bosons**

This gives n_EW = 4, not 5.

### Approach 2: From Representation Content

Standard Model Higgs doublet: (H⁺, H⁰) = 2 complex = **4 real degrees of freedom**

After symmetry breaking: 3 eaten (W⁺, W⁻, Z masses) + 1 Higgs

Still doesn't give 5.

### Approach 3: From Quantum Numbers

Fermion quantum numbers: {Q, I₃, Y} subject to Q = I₃ + Y/2

Independent numbers: **2** (e.g., I₃ and Y)

Plus isospin magnitude I: still only **3**.

### Approach 4: From Anomaly Cancellation

Anomaly cancellation requires:
```
Σ Y³ = 0  (U(1) anomaly)
Σ Y = 0   (mixed anomaly)
```

These constrain particle content, not dimension of B-space.

**No principled approach yields n_EW = 5.**

---

## Possible Salvage Attempts

### Attempt A: Redefine the Formula

Instead of α = sin²θ_W / (2π × n_EW), find alternative:

```
α = sin²θ_W / (2π × n_something_else)
```

where n_something_else is derivable.

**Problem**: What is "something_else"?

### Attempt B: Derive n_EW = 5 from Stability

Claim: Only n_EW = 5 is "stable" in some sense.

**Problem**: What stability criterion? Not in axioms.

### Attempt C: Anthropic Argument

Claim: Only n_EW = 5 permits observers.

**Problem**: This explains nothing—it's just restating that α ≈ 1/137.

### Attempt D: Counting with Higgs

```
B_EW = {b_Y, b_I₁, b_I₂, b_I₃, b_H}
     = 1 + 3 + 1 = 5
```

where b_H is the Higgs dimension.

**Problem**:
1. Why include Higgs but not other fields?
2. Isospin has 3 generators but acts on 2D space—which to count?
3. Still arbitrary

---

## Verdict

**n_EW = 5 cannot currently be derived from the axioms.**

| Question | Answer |
|----------|--------|
| Is n_EW constrained by axioms? | No |
| Is n_EW uniquely determined by gauge structure? | No (multiple counting schemes) |
| Is there a principled argument for n_EW = 5? | No |
| Is n_EW = 5 likely numerology? | Yes |

---

## What Would Change This Verdict?

To rehabilitate n_EW = 5, one would need to:

1. **Define precisely** what "electroweak dimension in B" means
2. **Derive that definition** from axioms A1-A6
3. **Show the definition uniquely gives n_EW = 5**
4. **Explain the Gell-Mann–Nishijima constraint** (why count dependent dimension?)
5. **Resolve inconsistency** with gauge_structure.md

Until then, **n_EW = 5 is a fitting parameter**, and α is not derived.

---

## Recommendation

1. **Do not claim** α is derived from the framework
2. **List n_EW = 5** as an explicit assumption (A10)
3. **Acknowledge** the α formula as SPECULATION
4. **Focus effort** on other aspects of the framework that might be more rigorous

---

*Created: 2026-01-25*
*This investigation supports the demotion of α derivation to SPECULATION*
