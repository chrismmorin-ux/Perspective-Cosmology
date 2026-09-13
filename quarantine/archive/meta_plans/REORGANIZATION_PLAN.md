# Reorganization Plan

**Date**: 2026-01-26
**Purpose**: Make framework evaluable by a theoretical physicist while preserving areas of unique value

---

## The Problem

We've accumulated two intertwined threads:

1. **Pure Perspective Framework** — What follows from axioms about perspective
2. **Standard Model Imports** — n_weak=2, n_color=3, sin²θ_W, gauge structure, etc.

These are tangled together, making it impossible to answer:
- What does perspective ACTUALLY predict?
- Where are we fitting vs deriving?
- Which "inconsistencies" are real vs methodological?

Additionally, we may be **losing potentially valuable divergences** by trying to match known physics.

---

## The Reorganization: Four Clean Layers

### Layer 0: Pure Perspective Axioms
**What we assume about perspectives — NO physics interpretation**

Currently in: `core/01_universe.md` through `core/07_*.md`

Content:
- U = (P, Σ, Γ, C, V, B) — the structure
- Finiteness, connectivity, completeness
- Overlap γ ∈ [0,1]
- |Π| — total perspective count

**What should NOT be here**:
- Any reference to spacetime, particles, forces
- Any physical constants
- Any comparison to QM or GR

### Layer 1: Mathematical Consequences
**What follows mathematically from Layer 0 — NO physics identification**

Questions to answer purely mathematically:
- What is dim(B)? (Does the framework constrain it?)
- What structures emerge on B? (Does it have natural subspaces?)
- What is |Π|? (Can it be bounded from the axioms?)
- What functions of γ are natural? (2γ-1? 2γ(1-γ)? Why?)

**Key insight**: If dim(B), |Π|, and γ-functions are NOT constrained by axioms, they are FREE PARAMETERS, not predictions.

### Layer 2: Physical Correspondence Rules
**How we map mathematical objects to physics — EXPLICIT imports**

This is where we're currently importing without acknowledgment:

| Mathematical Object | Physical Identification | Source |
|---------------------|-------------------------|--------|
| dim(B) = 10 | "Like SO(10)" | IMPORT from GUT |
| n_color = 3 | "QCD colors" | IMPORT from SM |
| n_weak = 2 | "Weak isospin" | IMPORT from SM |
| n_space = 3 | "Spatial dimensions" | IMPORT from observation |
| |Π| ≈ 10^118 | "Horizon perspectives" | IMPORT from cosmology |
| τ₀ = t_P | "Planck time" | IMPORT from QG |

**Every import must be listed and justified separately from "derivation".**

### Layer 3: Predictions and Comparisons
**What the correspondence rules predict — can differ from known physics**

Only after Layer 2 is explicit can we honestly assess:
- Does the framework predict sin²θ_W = 2/9, or does it assume n_weak=2, n_color=3?
- Does the framework predict α, or does it import |Π|?
- Where does the framework DIVERGE from known physics? (These are the valuable parts!)

---

## Preserving Unique Value: The Divergence Registry

We need a separate document tracking **where perspective differs from standard approaches**, even if we're not sure whether these are:
- Predictions to be tested
- Errors to be fixed
- Missing elements that would resolve inconsistencies

### Divergence 1: Log vs Power Scaling

**What we claim**: α ∝ 1/ln|Π| but α_G ∝ 1/|Π|^(1/3)

**Standard physics says**: No such pattern; couplings are independent

**Status**: Could be:
- A genuine insight about hierarchy
- A coincidence
- An artifact of how we constructed the formulas

**Action**: Flag for physicist evaluation

### Divergence 2: sin²θ_W = 2/9

**What we find**: 2/9 = 0.222 matches on-shell value (0.229) to 0.3%

**Standard physics says**: sin²θ_W comes from GUT running or is fundamental

**Status**: Could be:
- A prediction (if we can derive n_weak=2, n_color=3)
- A coincidence
- A hint about dimensional structure

**Action**: Flag for physicist evaluation — is there a known reason this should be true?

### Divergence 3: γ-Transition Regime

**What we claim**: There's a qualitative change at γ = 0.5 (L = λ_C)

**Standard physics says**: No such transition is predicted by QM or QFT

**Status**: Could be:
- A novel prediction (decoherence anomaly at Compton scale)
- An artifact of our ansatz formulas
- Missing a mechanism that would explain it

**Action**: Flag for physicist evaluation — is there any hint of Compton-scale physics?

### Divergence 4: |Π| as Fundamental

**What we claim**: A single cosmological parameter determines all couplings

**Standard physics says**: Couplings are separate (or unified at GUT scale)

**Status**: Could be:
- A novel unification principle
- Wrong (couplings really are independent)
- Missing the connection to RG flow

**Action**: How does this relate to GUT unification?

### Divergence 5: α from Geometry (not yet working)

**What you suggested**: α ≈ 1/137 might be "surface area of crystalline structure against perspective universe on unit scale"

**Standard physics says**: α is a running coupling, not geometric

**Status**: This is unexplored. Could be:
- A fresh approach (pure geometry → coupling)
- Numerology (fitting to known value)
- A hint about B-structure we haven't developed

**Action**: Needs clean derivation attempt from Layer 1 only

---

## Concrete Reorganization Steps

### Step 1: Create Layer Documents

```
framework/
├── layer_0_axioms.md         # Pure perspective axioms, nothing else
├── layer_1_mathematics.md    # What follows mathematically
├── layer_2_correspondence.md # All imports listed explicitly
├── layer_3_predictions.md    # What the combined system predicts
└── divergence_registry.md    # Where we differ from standard physics
```

### Step 2: Audit Current Files

For each claim in the framework, trace:
1. Which axiom does it follow from?
2. What imports does it use?
3. Is the derivation chain complete?

### Step 3: Separate "Emerges" from "Assumes"

Current state: "α emerges from B-geometry"
Honest state: "IF n_EW = 5 AND sin²θ_W known, THEN α = sin²θ_W/(2πn_EW)"

The difference matters for physicist evaluation.

### Step 4: Flag Open Questions Cleanly

Not "we don't understand this" but:
- "Layer 0 underdetermines X — this is a free parameter"
- "Layer 1 might constrain X but we haven't proven it"
- "X is an import, not a prediction"

### Step 5: Identify What a Physicist Should Evaluate

1. **The axioms**: Are they well-defined? Consistent? Novel?
2. **The mathematical consequences**: What actually follows?
3. **The correspondence rules**: Are the imports justified?
4. **The divergences**: Are any of these testable predictions?

---

## What We Might Be Missing

Your intuition that "some key element of perspective is missing that would solve it" is important.

Candidates for missing elements:

### 1. Dynamics from Axioms
Currently: Static structure U
Missing: Why/how does anything change?
Could resolve: Rate formulas being ansätze

### 2. Why V is Complex
Currently: Assumed
Missing: Derivation from perspective
Could resolve: QM structure

### 3. Why dim(B) = 10 (or any specific value)
Currently: Imported from GUT intuition
Missing: Derivation from perspective
Could resolve: The entire constant derivation

### 4. The Geometry-Coupling Connection
Currently: Vague "B-structure gives constants"
Missing: Explicit formula
Could resolve: α as geometric (your crystalline surface idea)

---

## The Meta-Question for a Physicist

We should ask them:

> "Given axioms about perspective overlap, what SHOULD follow about physical constants? Is there a mathematical path from 'finite complete structure with constrained access' to 'dimensionless ratios like α'? Or is this category error?"

If it's a category error, no amount of reorganization helps.
If there's a path, we need to find it cleanly.

---

## Immediate Actions

1. **Create divergence_registry.md** — Don't lose the interesting differences
2. **Create layer_0_axioms.md** — Strip physics from axioms
3. **Create layer_2_correspondence.md** — List every import explicitly
4. **Identify what Layer 1 actually constrains** — This is the key mathematical question

---

## Success Criteria

A theoretical physicist should be able to:

1. Read Layer 0 and understand what we're assuming
2. Read Layer 1 and see what follows mathematically
3. Read Layer 2 and see what we're importing from known physics
4. Read Layer 3 and evaluate whether the predictions are genuine
5. Read the Divergence Registry and tell us which divergences are:
   - Interesting (worth pursuing)
   - Known (already explored elsewhere)
   - Impossible (contradicts established physics)

---

*This reorganization is about intellectual honesty and clarity, not about making the framework look better. A clean "we don't know" is more valuable than a murky "we derive."*
