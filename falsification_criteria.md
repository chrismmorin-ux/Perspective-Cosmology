# Falsification Criteria

What would prove Perspective Cosmology wrong?

**Purpose**: A theory that can't be wrong isn't science. This document forces us to identify what counts as failure.

---

## Core Principle

Every claim should have at least one conceivable observation or calculation that would falsify it.

If a claim cannot be falsified even in principle, it may be:
- Tautological (true by definition)
- Metaphysical (outside science)
- Insufficiently precise (needs refinement)

---

## Framework-Level Falsification

### F1: Mathematical Inconsistency
**What would falsify**: Internal contradiction in the axiom system

**Example**: If (A3) + (A6) implied both X and not-X

**Status**: Would kill the framework entirely

**How to check**: Formal proof of consistency (difficult)

---

### F2: Wrong Limiting Behavior
**What would falsify**: QM and GR don't emerge from high-γ and low-γ limits

**Example**: Deriving equations that contradict Schrödinger or Einstein

**Status**: Would require major revision

**How to check**: Rigorous limit calculations (partially done, gaps remain)

---

### F3: Wrong Constant Values
**What would falsify**: B-geometry gives clearly wrong values for constants

**Example**: If α derivation gave 1/50 instead of 1/137

**Status**: Would falsify A9 (constants from B)

**Current concern**: Are derivations precise enough to be falsified? "Order of magnitude" claims are hard to falsify.

---

## Specific Claim Falsification

### F4: Fine Structure Constant
**Claim**: α = sin²θ_W / (2π × n_EW) = 1/136.1

**Would falsify**:
1. If n_EW is not actually 5 (requires independent justification of n_EW)
2. If the formula doesn't follow from B-geometry (requires rigorous derivation)
3. If another n_EW works better (would suggest fitting, not derivation)

**Key question**: Can we predict n_EW, or did we choose it to get α?

**Falsifiability score**: MEDIUM - depends on whether n_EW is derived or fit

---

### F5: Newton's Constant
**Claim**: G = c³(δπ_min)²/ℏ with δπ_min = l_horizon/√|Π|

**Would falsify**:
1. If |Π| estimate is wrong by more than ~10 orders of magnitude
2. If δπ_min formula doesn't follow from perspective geometry
3. If G varies and formula doesn't predict the variation

**Key question**: Is √|Π| derived or chosen to get G?

**Falsifiability score**: LOW - too many unknowns in |Π|

---

### F6: Three Generations
**Claim**: n_gen = 3 from topological/dimensional/stability constraints

**Would falsify**:
1. Discovery of 4th generation (direct falsification)
2. If constraint analysis actually allows n_gen ≠ 3
3. If constraints are independent of framework (then not a derivation)

**Key question**: Does the framework REQUIRE n_gen = 3, or just ALLOW it?

**Falsifiability score**: HIGH - collider searches directly test this

---

### F7: Bekenstein-Hawking Entropy
**Claim**: S = A/(4l_P²) from hidden dimension counting

**Would falsify**:
1. If factor of 4 doesn't emerge from geometry (partial falsification)
2. If different horizons give different entropy formulas
3. If black hole entropy is observer-independent (contradicts framework)

**Falsifiability score**: MEDIUM - factor of 4 is testable

---

### F8: Intermediate-γ Predictions
**Claims**: Modified uncertainty, gravitational decoherence, etc.

**Would falsify**:
1. Experiments not finding predicted decoherence rates
2. Uncertainty relation modifications not observed
3. No critical behavior at Compton scale

**Falsifiability score**: HIGH - concrete experimental predictions

**Note**: These are the BEST falsification opportunities.

---

### F8b: Recoherence Prediction — RETRACTED (I-001 RESOLVED)

**Original claim**: For γ > 0.5, Γ_intrinsic = (1-2γ)/t_P < 0, implying spontaneous coherence growth.

**Problem**: The formula predicted Planck-rate coherence growth (~10⁴² s⁻¹) for systems with γ > 0.5 (e.g., electrons at L < λ_C). This contradicts observations.

**Resolution (2026-01-26)**: **Recoherence prediction RETRACTED.**

The formula Γ_dec = (1-2γ)/τ₀ is an ansatz, not derived from axioms. Since it gives unphysical results for γ > 0.5, its validity is now restricted to γ ≤ 0.5.

**Current status**:
- γ ≤ 0.5: Formula applies (critical slowing at γ = 0.5 remains testable)
- γ > 0.5: Regime is UNDEFINED — requires proper derivation from axioms (I-004)

**Falsification now**: The intermediate-γ predictions (F8) remain falsifiable for γ ≤ 0.5. The γ > 0.5 regime makes no claims until derivation is established.

---

## Meta-Falsification

### F9: Uniqueness Failure
**What would falsify**: Other frameworks derive same results from different primitives

**Example**: If "everything from information" or "everything from causality" gives same α

**Implication**: Perspective is not doing explanatory work

**How to check**: Survey alternative frameworks

---

### F10: Explanatory Circularity
**What would falsify**: Framework explains X using Y, but Y is just X restated

**Example**: "Time from adjacency" but adjacency defined using time

**Implication**: No real explanation, just relabeling

**How to check**: Trace all definitions to primitives; check for cycles

---

### F11: Hidden Parameters
**What would falsify**: "Derivations" have hidden degrees of freedom

**Example**: If α formula has 3 free choices that could give any value

**Implication**: Fitting, not derivation

**How to check**: Count free parameters honestly; see assumptions_registry.md

---

## Falsification Checklist for New Claims

Before accepting any new "derivation":

- [ ] What observation would falsify this?
- [ ] Is the falsification test actually feasible?
- [ ] Are there hidden parameters that could absorb failure?
- [ ] Could the claim be true for non-framework reasons?
- [ ] Has similar claim been falsified for other frameworks?

---

## Current Status

| Claim | Falsification Criterion | Score |
|-------|------------------------|-------|
| sin²θ_W = 2/9 | On-shell value ≠ 0.222 | **HIGH** (currently 0.3% match) |
| α_W/α = 4.5 | Ratio inconsistent at all scales | MEDIUM (currently 3% match) |
| α = 1/137 | ~~n_EW not 5 or formula wrong~~ **DEPRECATED** | ~~MEDIUM~~ |
| G derivation | |Π| estimate wrong | LOW |
| n_gen = 3 | 4th generation found | HIGH |
| S = A/4 | Factor ≠ 4 from geometry | MEDIUM |
| QM from high-γ | Wrong Schrödinger limit | MEDIUM |
| GR from low-γ | Wrong Einstein limit | MEDIUM |
| Decoherence | Wrong experimental rates | HIGH |
| Static |Π| | α variation detected > 10^-10/yr | HIGH (current limit 10^-17) |

**Best quantitative result**: sin²θ_W = 2/9 matches on-shell value to 0.3%

**Best bets for testing**: Weinberg angle precision, coupling ratio measurements

**Hardest to falsify**: G derivation (too many unknowns)

---

## The Honest Admission

Some core claims (A1-A3) may not be falsifiable in principle. They are philosophical commitments, not scientific predictions.

This is OK if:
1. We acknowledge it explicitly
2. The framework generates falsifiable predictions downstream
3. We don't claim scientific status for metaphysical claims

The framework's scientific value depends on F4-F8, not F1-F3.

---

*Last updated: 2026-01-26*
