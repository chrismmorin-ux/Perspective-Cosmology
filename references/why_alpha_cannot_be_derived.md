# Why α ≈ 1/137 Cannot Be Derived (From This Framework)

A deep analysis of the fundamental obstacles.

**Created**: 2026-01-26
**Purpose**: Understand the root causes of failure, not just symptoms

---

## The Question

Why can't we derive α = 1/137.035999... from the Perspective Cosmology axioms?

This is actually TWO questions:
1. Why did OUR specific attempt fail?
2. Why is deriving α fundamentally difficult?

---

## Part 1: Why Our Specific Attempt Failed

### The Attempt

We claimed:
```
α = sin²θ_W / (2π × n_EW)
```

With n_EW = 5, this gives α ≈ 1/136.1 (0.7% error).

### Failure Mode 1: The Formula Is Not Derived

**The formula itself appeared from nowhere.**

Question: Why should α equal sin²θ_W divided by (2π × n)?

The "derivation" in alpha.md says:
- α measures "EM projection fraction of electroweak space"
- ||b_EM||² / ||B_EW||² = sin²θ_W / n_EW
- Then divide by 2π for "angular normalization"

But this is hand-waving. There's no rigorous argument connecting:
- The axioms A1-A6 (perspective, finite completeness, etc.)
- The claimed formula

**The formula is ASSUMED, not derived from axioms.**

### Failure Mode 2: n_EW = 5 Is Mathematically Impossible

**The claimed basis is linearly dependent.**

Claim: B_EW = span{b_Q, b_Y, b_I₁, b_I₂, b_I₃} has dimension 5.

But the Gell-Mann–Nishijima formula states:
```
Q = I₃ + Y/2
```

This is a PHYSICAL LAW, not a convention. It means:
```
b_Q = b_I₃ + (1/2)b_Y
```

Therefore b_Q is NOT independent of {b_Y, b_I₃}.

**The actual dimension of span{b_Q, b_Y, b_I₁, b_I₂, b_I₃} is at most 4.**

This isn't a subtle issue—it's basic linear algebra. The n_EW = 5 count is mathematically wrong.

### Failure Mode 3: Internal Contradiction

**The framework contradicts itself about n_EW.**

gauge_structure.md states:
- n_weak = 2 (SU(2) weak isospin)
- n_EM = 1 (U(1) hypercharge)

This implies n_EW = 3.

alpha.md claims n_EW = 5.

These cannot both be true. The framework uses DIFFERENT counting rules for DIFFERENT purposes, selecting whichever gives the desired answer.

### Failure Mode 4: Only One Integer Works

**This is the smoking gun for numerology.**

Given:
- α ≈ 1/137.036
- sin²θ_W ≈ 0.231

Reverse-engineer:
```
n = sin²θ_W / (2π × α) = 0.231 / (2π × 0.00730) = 5.04
```

So n_EW = 5 is the ONLY integer that makes the formula work.

| n_EW | 1/α | Error |
|------|-----|-------|
| 4 | 108.9 | 21% wrong |
| 5 | 136.1 | 0.7% ✓ |
| 6 | 163.3 | 19% wrong |

If n_EW came from independent principles, there would be a REASON it's 5. Instead, 5 is SELECTED because it's the only value that works.

**This is the Eddington pattern exactly.**

### Failure Mode 5: sin²θ_W Is Borrowed, Not Derived

**We don't derive sin²θ_W from our axioms.**

The framework says sin²θ_W = 0.231 comes from "GUT running" (standard physics) or "measurement."

But if we're borrowing sin²θ_W from mainstream physics, we're not deriving α from OUR axioms—we're doing dimensional analysis with borrowed inputs.

A genuine derivation would compute sin²θ_W from A1-A6.

### Failure Mode 6: The 2π Factor Is Arbitrary

**Why 2π and not π or 4π?**

The "derivation" calls 2π an "angular normalization." But:
- If we used π, n_EW = 2.5 would work
- If we used 4π, n_EW = 10 would work

The choice of 2π has no independent justification. It's another hidden degree of freedom.

---

## Part 2: Why Deriving α Is Fundamentally Difficult

### The Deep Problem

α is a DIMENSIONLESS number. It's approximately 1/137.036.

Deriving a specific number requires:
1. A mathematical structure that UNIQUELY produces that number
2. A physical argument for WHY that structure governs electromagnetism

Both are extraordinarily difficult.

### Why Dimensionless Constants Are Special

**Dimensional constants (c, ℏ, G) are easier to "derive."**

You can argue:
- c comes from spacetime geometry
- ℏ comes from quantum structure
- G comes from perspective count (our framework)

These arguments work because the UNITS are determined by the physics, and the MAGNITUDE depends on your choice of units.

But α has NO units. Its value 1/137.036 is the same in ALL unit systems.

**To derive α, you must derive the NUMBER 137.036, not just explain what it measures.**

### The Landscape Problem

**Many mathematical structures give numbers near 1/137.**

Wyler's formula: α = (9/16π³) × (π/5!)^(1/4) ≈ 1/137.036
Eddington: 136 or 137 from matrix arguments
Gilson: Trigonometric formulas
Information-theoretic: Various approaches

All of these are "derivations" of 1/137. But they're DIFFERENT derivations with DIFFERENT assumptions.

**If many paths lead to 137, none of them explains WHY it's 137.**

A genuine derivation would show that 137 is INEVITABLE given certain physical principles—not just one of many possible paths.

### The Uniqueness Requirement

**A real derivation must be UNIQUE.**

Consider: Dirac predicted the positron. His equation REQUIRED a negative-energy solution. There was no way to avoid it. The prediction was UNIQUE to relativistic quantum mechanics.

Contrast: Our α formula. We could change it to:
- α = sin²θ_W / (π × n_EW) with n_EW = 2.5
- α = sin θ_W / (4π × n_EW) with different n_EW
- Many other formulas

There's no argument that sin²θ_W / (2π × n_EW) is the ONLY possible form.

### The Running Coupling Problem

**α is not even a constant—it "runs" with energy.**

At low energy: α ≈ 1/137
At Z mass: α ≈ 1/128
At GUT scale: α ≈ 1/40

So which α are we "deriving"? The low-energy value 1/137 is just the infrared limit. It depends on the entire particle content of the universe.

**To truly derive α, you must derive the ENTIRE renormalization group flow.**

This requires knowing:
- All particles that exist
- Their charges and masses
- The vacuum structure

No framework that just counts "electroweak dimensions" can do this.

### The Landscape of Consistent Theories

**There may be many self-consistent universes with different α values.**

String theory suggests a "landscape" of possible vacua, each with different constants. If this is true, α = 1/137 isn't DERIVED from any principle—it's SELECTED anthropically.

Our universe has α ≈ 1/137 because:
- Larger α would make atoms unstable
- Smaller α would prevent chemistry
- We exist, so α must be in the habitable range

This doesn't mean α CAN'T be derived. But it suggests our intuition that α MUST be derivable might be wrong.

---

## Part 3: What Would a Genuine Derivation Look Like?

### Requirements for Success

1. **Start from axioms that don't mention α or electromagnetism**
   - Our axioms (perspective, finiteness) might qualify

2. **Derive electromagnetism as a consequence**
   - Show U(1) gauge symmetry emerges necessarily
   - This is partially done via Aut(B), but hand-wavy

3. **Compute the coupling with ZERO free parameters**
   - No n_EW to choose
   - No 2π vs 4π ambiguity
   - sin²θ_W computed, not borrowed

4. **Get the right numerical value**
   - Not just "order of magnitude"
   - Full precision: 1/137.035999...

5. **Predict OTHER quantities**
   - If you derive α, you should also derive masses, mixing angles, etc.
   - Otherwise you've just fit one number

6. **Be falsifiable**
   - What would prove the derivation WRONG?
   - If nothing can falsify it, it's not science

### The GUT Example (Partial Success)

Grand Unified Theories (SU(5), SO(10)) achieve some of this:

1. ✓ Start from symmetry principles (not α)
2. ✓ Derive sin²θ_W = 3/8 at unification scale (no free parameters for this ratio)
3. ✗ But running to low energy requires knowing particle content
4. ✗ Don't derive the GUT coupling itself
5. ✓ Predict proton decay (testable)
6. ✓ Falsifiable (proton decay experiments)

GUTs are the most principled approach to α, but still incomplete.

### Why Our Framework Falls Short

| Requirement | GUT Status | Our Status |
|-------------|------------|------------|
| Axioms don't mention α | ✓ | ✓ |
| Derive EM as consequence | ✓ | Partial |
| Zero free parameters | ✗ (particle content) | ✗ (n_EW, 2π) |
| Right numerical value | ~10% | ~1% (with fitting) |
| Predict other quantities | Partial | No |
| Falsifiable | ✓ | Unclear |

**Our framework does WORSE than GUTs, not better.**

---

## Part 4: Honest Assessment

### What We Got Wrong

1. **We assumed a formula** rather than deriving it
2. **We chose n_EW = 5** to fit the answer
3. **We ignored the Gell-Mann–Nishijima constraint** that makes n_EW = 5 impossible
4. **We borrowed sin²θ_W** from mainstream physics
5. **We called 0.7% accuracy "impressive"** when it was fitting with 1 parameter

### What We Should Have Known

Any formula of the form α = f(θ_W) / n can be made to give α ≈ 1/137 by choosing n appropriately. This is not a derivation—it's numerology.

Eddington did the same thing 90 years ago. We repeated his mistake.

### The Lesson

**Deriving dimensionless constants requires more than dimensional counting.**

You need:
- A mathematical structure that UNIQUELY produces the number
- A physical argument connecting that structure to electromagnetism
- Zero free parameters at the crucial step
- Predictions beyond the constant itself

We had none of these.

---

## Part 5: Is Any Derivation Possible?

### Pessimistic View

Maybe α simply cannot be derived. It might be:
- A random number from the string landscape
- Anthropically selected
- Fundamental and irreducible

If so, the quest to "derive" α is misguided.

### Optimistic View

Maybe α CAN be derived, but we need:
- Deeper understanding of quantum field theory
- Better mathematical structures (category theory, higher algebra?)
- Unification of all forces including gravity
- Understanding of why THIS vacuum, not another

### What Our Framework Could Try

If we want to attempt α again, we'd need to:

1. **Derive the electroweak gauge group** from Aut(B) rigorously
2. **Derive sin²θ_W = 3/8** from B-geometry (not borrow from GUTs)
3. **Derive the running** from framework dynamics
4. **Derive the infrared value** without free parameters

This is a research program of enormous difficulty. It's not something we can just "fix" in the current derivation.

---

## Conclusion

**The α "derivation" failed because it was numerology, not derivation.**

Specific failures:
1. Formula assumed, not derived
2. n_EW = 5 is mathematically impossible (Gell-Mann–Nishijima)
3. n_EW = 5 chosen to fit answer (only integer that works)
4. sin²θ_W borrowed from mainstream physics
5. 2π factor arbitrary
6. Internal contradiction with gauge_structure.md

Deep failures:
1. Deriving dimensionless constants is fundamentally hard
2. Many formulas can give 1/137
3. α runs with energy—which value to "derive"?
4. May require complete theory of everything

**The honest conclusion: This framework does not derive α.**

It's better to acknowledge this than to claim false success.

---

*Created: 2026-01-26*
*This document explains why the α derivation was deprecated*
