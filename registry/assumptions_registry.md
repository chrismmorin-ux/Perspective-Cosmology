# Assumptions Registry

A complete list of every assumption in the Perspective Cosmology framework.

**Purpose**: Force honesty about what we're assuming vs. deriving.

---

## Classification

| Type | Meaning |
|------|---------|
| **FOUNDATIONAL** | Core axiom of the framework |
| **STRUCTURAL** | Mathematical structure choice |
| **PHYSICAL** | Connection to physical reality |
| **LIMITING** | Behavior in special cases |
| **TECHNICAL** | Convenience for calculation |

---

## Numbering Cross-Reference

| A-Number | AXM-Number | Name | Status |
|----------|------------|------|--------|
| A1 | AXM_0100 | Finiteness (Static Universe) | CANONICAL |
| A2 | AXM_0101 | Connectivity (Finite Completeness) | CANONICAL |
| A3 | AXM_0102 | Perspective as Primitive | CANONICAL |
| A4 | AXM_0103 | Weighted Simplicial Complex | CANONICAL |
| A5 | AXM_0104 | Orthonormal Basis | CANONICAL |
| A6 | AXM_0105-0107 | Adjacency / Information Loss | CANONICAL |
| A7 | — | High-γ = QM | CONJECTURE (no AXM equivalent) |
| A8 | — | Low-γ = GR | CONJECTURE (no AXM equivalent) |
| A9 | AXM_0115 | B-Geometry / Algebraic Completeness | CANONICAL |
| A10 | — | Electroweak n_EW=5 | DEPRECATED |
| A11 | — | sin²θ_W from GUT | [A-IMPORT] |
| A12 | AXM_0110 | Counting Measure | CANONICAL |
| A13 | — | δπ_min scaling | CONJECTURE |
| A14 | AXM_0108 | Complex Structure | CANONICAL |
| A15 | — | Decoherence Rate | PARTIALLY DERIVED |
| A16 | — | h(γ) function | DERIVED |
| — | AXM_0109 | Crystal Existence | CANONICAL |
| — | AXM_0113 | Finite Access | CANONICAL |
| — | AXM_0114 | Tilt Possibility | CANONICAL |
| — | AXM_0117 | Crystallization Tendency | CANONICAL |
| — | AXM_0118 | Prime Attractor Selection | CANONICAL |
| — | AXM_0119 | Transition Linearity | PROPOSED |

> **Note (S189 audit)**: The A-number system (A1-A16) predates the formal AXM system. Not all entries map 1:1. AXM_0109-0119 were added in sessions S132-S181 and have no A-number equivalents. The AXM system is authoritative; the A-numbers are retained for backward compatibility.

---

## Foundational Assumptions

### A1: Static Universe
**Statement**: U exists as a complete, static object. There is no global time evolution.

**Type**: FOUNDATIONAL

**Justification**: Philosophical argument + analogy to block universe

**Alternatives**:
- Standard physics (universe evolves in time)
- Multiverse (many U's)
- Process philosophy (becoming is fundamental)

**Falsifiable?**: Difficult - this is more interpretive than empirical

**Status**: AXIOM

---

### A2: Finite Completeness
**Statement**: U is finite but complete. It contains all that exists.

**Type**: FOUNDATIONAL

**Justification**: Avoids infinities; required for counting arguments

**Alternatives**:
- Infinite universe (standard cosmology)
- Open/incomplete universe
- Mathematical Platonism (infinite abstract structure)

**Falsifiable?**: Partially - some finiteness claims are testable

**Status**: AXIOM

---

### A3: Perspective as Primitive
**Statement**: Perspective (constrained access) is the fundamental entity, not particles, fields, or spacetime.

**Type**: FOUNDATIONAL

**Justification**: Philosophical argument about self-inaccessibility

**Alternatives**:
- Materialism (matter is primitive)
- Spacetime fundamentalism (geometry is primitive)
- Information fundamentalism (bits are primitive)

**Falsifiable?**: No - this is a choice of primitive, not empirical claim

**Status**: AXIOM

---

## Structural Assumptions

### A4: Weighted Simplicial Complex
**Statement**: U has the structure (P, Σ, Γ, C, V, B) - points, simplices, weights, content, value space, basis.

**Type**: STRUCTURAL

**Justification**: Minimal structure supporting the required operations

**Alternatives**:
- Manifold structure
- Causal set structure
- Category-theoretic structure
- Graph structure

**Falsifiable?**: No - structure choice is convenience, not prediction

**Status**: AXIOM (for now)

**Note**: This is the MOST SUSPICIOUS assumption. Why this structure?

---

### A5: Orthonormal Basis B
**Statement**: V has a finite orthonormal basis B representing "true dimensions"

**Type**: STRUCTURAL

**Justification**: Needed for dimensional counting arguments

**Alternatives**:
- Infinite-dimensional V
- Non-orthogonal basis
- No preferred basis

**Falsifiable?**: Maybe - implies finite degrees of freedom

**Status**: AXIOM

**Note**: The fine structure constant derivation depends critically on dim(B) choices.

---

### A6: Adjacency from Information Loss
**Statement**: Valid adjacency requires non-negative information loss. This defines time's direction.

**Type**: STRUCTURAL

**Justification**: Connects to thermodynamics; avoids time loops

**Alternatives**:
- Time loops allowed
- Information-neutral adjacency
- Bidirectional time

**Falsifiable?**: Partially - relates to second law of thermodynamics

**Status**: DERIVATION from A2 + A3 (weak)

---

## Physical Assumptions

### A7: High-γ = Quantum Mechanics
**Statement**: In the limit γ → 1 (high perspective overlap), dynamics reduce to quantum mechanics.

**Type**: PHYSICAL / LIMITING

**Justification**: Heuristic arguments about overlap and superposition

**Alternatives**:
- QM is fundamental, not emergent
- Different QM from different limit
- QM is approximation, not exact limit

**Falsifiable?**: Partially - predicts deviations from QM in intermediate regime

**Status**: CONJECTURE (not rigorously derived)

---

### A8: Low-γ = General Relativity
**Statement**: In the limit γ → 0 (low perspective overlap), dynamics reduce to general relativity.

**Type**: PHYSICAL / LIMITING

**Justification**: Heuristic arguments about geometry from connectivity

**Alternatives**:
- GR is fundamental, not emergent
- Different limit gives GR
- GR is approximation

**Falsifiable?**: Partially - predicts deviations from GR at Planck scale

**Status**: CONJECTURE (not rigorously derived)

---

### A9: B-Geometry Determines Constants
**Statement**: Physical constants (α, G, etc.) are determined by the structure of B.

**Type**: PHYSICAL

**Justification**: The "derivations" in §16

**Alternatives**:
- Constants are fundamental/random
- Constants from anthropic selection
- Constants from dynamics, not kinematics

**Falsifiable?**: Yes - if B-structure doesn't yield correct constants, framework fails

**Status**: CONJECTURE (the derivations have gaps)

**WARNING**: This is where numerology risk is highest.

---

### A10: Electroweak Dimension Count [DEPRECATED]

> **DEPRECATED**: 2026-01-26 along with α derivation
> **Archived to**: archive/deprecated/alpha_derivation.md

**Statement**: n_EW = 5 (electroweak dimensions in B)

**Type**: **FITTING** (hidden free parameter) → **DEPRECATED**

**Why Deprecated**:
1. **Eddington pattern**: Follows exact structure of failed 1930s derivation
2. **Mathematical impossibility**: Gell-Mann–Nishijima makes 5-count impossible (dim ≤ 4)
3. **Internal contradiction**: gauge_structure.md says n_EW = 3, not 5
4. **Standard physics**: All methods give n = 4

**Lesson Learned**: This assumption existed solely to make the α formula work. When the assumption was analyzed rigorously, it turned out to be mathematically impossible. The α derivation was deprecated rather than defended.

---

### A11: sin²θ_W from GUT Running
**Statement**: sin²θ_W = 3/8 at GUT scale, runs to ~0.23 at low energy

**Type**: PHYSICAL

**Justification**: Standard GUT prediction (SU(5), SO(10))

**Alternatives**:
- θ_W fundamental, not running
- Different GUT group
- No unification

**Falsifiable?**: Tested by precision electroweak measurements

**Status**: ESTABLISHED (this is mainstream physics, not our framework)

**Note**: This is borrowed from standard physics. It's honest, but means α derivation depends on GUT assumptions.

---

## Technical Assumptions

### A12: Counting Measure on Π
**Statement**: All perspectives are weighted equally: ν(S) = |S|

**Type**: TECHNICAL

**Justification**: Simplicity; no reason to prefer some perspectives

**Alternatives**:
- Physics-weighted measure
- Entropy-weighted measure
- Complexity-weighted measure

**Falsifiable?**: Affects predictions - different measure gives different physics

**Status**: CONVENIENCE (should be derived eventually)

---

### A13: δπ_min = l_horizon/√|Π|
**Statement**: Perspective grain equals cosmic scale divided by sqrt of perspective count

**Type**: TECHNICAL

**Justification**: Information-theoretic argument

**Alternatives**:
- Different scaling with |Π|
- Multiple perspective grains
- No minimum perspective

**Falsifiable?**: Relates to Planck scale - in principle testable

**Status**: CONJECTURE

**Note**: This is load-bearing for G derivation.

---

### A15: Decoherence Rate Formula (UPDATED 2026-01-26)

**Statement**: Γ_dec = (1-2γ)/τ₀ + Γ_env

**Type**: **PARTIALLY DERIVED** (form derived, scale empirical)

**Current status** (as of Session 2026-01-26-9):
- Form (1-2γ): DERIVED from content asymmetry measure A(γ) = 2γ-1
- Time scale τ₀: EMPIRICAL (identified with t_P)
- Coefficient 1: ASSUMED (simplest choice)

**Derivation of form** (see core/18_dynamics.md):
```
Asymmetry A(γ) = (shared content) - (different content) = 2γ - 1
Rate ∝ -(asymmetry) = (1 - 2γ)
```

**Remaining problems**:
1. **τ₀ = t_P not derived** (suggestive relationship τ₀ ~ t_H/√|Π| is factor ~20 off)
2. **Coefficient 1 arbitrary** (why not 2 or π?)
3. **γ > 0.5 undefined** (formula gives negative rate)

**Alternatives for form**:
- (1-2γ)² (quadratic) - would also have zero at 0.5
- sin(πγ) - trigonometric alternative
- But A(γ) = 2γ-1 has structural justification

**Status**: FORM DERIVED (from asymmetry), SCALE EMPIRICAL (τ₀ = t_P as input)

**Improvement from original**: Form now has structural justification, not just dimensional analysis.

**See**: core/18_dynamics.md for full derivation, physics/gamma_dec_investigation.md for history

---

### A16: Gravitational Decoherence Modification h(γ) (UPDATED 2026-01-26)

**Statement**: h(γ) = 2γ(1-γ) modifies gravitational decoherence

**Type**: **DERIVED** (from interaction capacity)

**Formula**: Γ_grav = Gm²/(ℏΔx) × h(γ)

**Derivation** (Session 2026-01-26):

Gravitational decoherence requires interaction between shared and different content:
- Shared content provides common reference frame (proportion γ)
- Different content provides superposition to decohere (proportion 1-γ)
- Interaction requires BOTH → product relationship

Counting ordered pairs (shared, different):
```
Pairs (shared → different): γ × (1-γ)
Pairs (different → shared): (1-γ) × γ
Total: I(γ) = 2γ(1-γ)
```

Therefore h(γ) = 2γ(1-γ) = interaction capacity.

**Why this form is unique**:
- Factor 2: bidirectionality (both orderings)
- Product structure: interaction requires both channels
- Zeros at endpoints: need both shared AND different

**Analogies**:
- Collision cross-section: rate ∝ n₁ × n₂
- Gravitational force: F ∝ m₁ × m₂
- Bernoulli variance: Var = p(1-p)

**Remaining questions**:
1. Why gravitational decoherence specifically uses ordered pairs
2. Connection to gravity itself not independently derived
3. No observational support yet

**Falsifiable?**: Yes - specific predictions differ from Penrose-Diosi at different scales

**Status**: DERIVED (interaction capacity / ordered pair counting)

**Confidence**: MEDIUM-HIGH

**See**: physics/h_gamma_investigation.md for full derivation

---

## Assumptions Introduced But Not Yet Documented

- [x] Complex structure of V - **NOW DOCUMENTED AS A14** (2026-01-25)
- [x] Decoherence rate formula - **NOW DOCUMENTED AS A15** (2026-01-26)
- [x] h(γ) function - **NOW DOCUMENTED AS A16** (2026-01-26)
- [ ] Three spatial dimensions
- [ ] Specific form of propagation operator P_D
- [ ] Stability constraint on generations

---

### A14: Complex Structure of V (NEW 2026-01-25)

**Statement**: V is a complex vector space (V ≅ ℂⁿ), not just real.

**Type**: STRUCTURAL

**Justification**: Required for quantum mechanical phase and unitarity.

**Alternatives**:
- V is real (no quantum interference)
- Complex structure emergent from paired real dimensions
- Quaternionic or other structure

**Falsifiable?**: Partially - wrong quantum mechanics if V not complex

**Status**: AXIOM (assumed, not derived)

**Why this matters**:
1. Without complex V, no quantum phase
2. No interference patterns
3. No unitary evolution
4. The entire QM derivation depends on this assumption

**CONCERN**: This is a significant assumption imported from known physics. The framework doesn't explain *why* V should be complex.

**Possible resolution**: Derive complex structure from paired real dimensions with a rotation symmetry. Not yet attempted.

---

## Statistics

| Type | Count |
|------|-------|
| FOUNDATIONAL | 3 |
| STRUCTURAL | 4 (includes A14) |
| PHYSICAL | 4 (A10 deprecated) |
| TECHNICAL | 2 |
| PARTIALLY DERIVED | 2 (A15, A16) |
| **TOTAL** | 15 |
| **DEPRECATED** | 1 (A10) |

**Free parameters disguised as assumptions**: 1-2 (δπ_min scaling)

**Assumptions imported from known physics**:
- A14 (complex V) - required for QM
- A11 (sin²θ_W from GUT) - borrowed from mainstream

**Derived formulas** (form derived, some aspects empirical):
- A15 (Γ_dec formula) - form from asymmetry, scale empirical
- A16 (h(γ) function) - derived from interaction capacity (2026-01-26)

**Deprecated assumptions**:
- A10 (n_EW = 5) - was numerology, deprecated 2026-01-26

---

## The Honest Question

How many of these assumptions are:
1. **Necessary** (framework fails without them)?
2. **Natural** (follow from deeper principles)?
3. **Convenient** (chosen to get right answers)?

If mostly (3), this is fitting, not derivation.

---

*Last updated: 2026-01-26 (A15 added - Γ_dec formula marked as assumption)*
*Reviewed: 2026-02-01 (Session 176 — audit confirmed content current for foundational/structural/physical assumptions. Sessions 143+ primarily extended Layer 2 derivations, not foundational assumptions.)*
