# Investigation: Deriving Γ_dec from Axioms

**Date**: 2026-01-26
**Issue**: I-004 - Γ_dec Formula Not Derived
**Goal**: Either derive Γ_dec = (1-2γ)/t_P + Γ_env from axioms, or mark as assumption

---

## The Formula

```
Γ_dec = (1-2γ)/t_P + Γ_env

Where:
- Γ_dec = decoherence rate (s⁻¹)
- γ = overlap parameter (dimensionless, 0 ≤ γ ≤ 1)
- t_P = Planck time ≈ 5.4×10⁻⁴⁴ s
- Γ_env = environmental decoherence rate (s⁻¹)
```

**Claim**: This formula gives intrinsic decoherence rate as function of overlap.

---

## What the Axioms Provide

### From core/01_universe.md

```
U = (P, Σ, Γ, C, V, B)

Where:
- P = finite set of points
- Σ = simplicial complex
- Γ: Σ → [0,1] = connectivity weights
- C: P → V = content map
- V = value space
- B = orthonormal basis
```

Note: This is a **static** structure. No time evolution defined.

### From core/03_propagation.md

```
P_D: V^P → V^P

(P_D · f)(x) = Σ_{y ∈ E_D(x)} Γ({x,y}) · f(y)
```

Note: Propagation through graph, but no time parameter.

### From core/05_overlap.md

```
γ(π₁, π₂) = |U_{π₁} ∩ U_{π₂}| / |U_{π₁} ∪ U_{π₂}|
```

Note: Static overlap measure. No dynamics.

---

## The Gap: Time Is Not Defined

### Fundamental Problem

The formula Γ_dec = (1-2γ)/t_P requires:

1. **A definition of time** - Not in axioms
2. **Dynamics equations for γ** - Not in axioms
3. **Connection to Planck time** - Would require G, which is supposed to be derived

### What the Axioms Actually Define

| Concept | In Axioms? | Status |
|---------|------------|--------|
| γ (overlap) | YES | Static definition |
| Time | NO | Not defined |
| dγ/dt | NO | Not defined |
| Planck time t_P | NO | Would need G |
| Decoherence | NO | Not defined |

### The Circularity

To derive Γ_dec in terms of t_P, we would need:
1. t_P = √(ℏG/c⁵)
2. G from framework → but this is itself CONJECTURE
3. ℏ from framework → claimed from B-structure, also CONJECTURE
4. c from framework → interpretation of adjacency, CONJECTURE

We're trying to derive a formula in terms of quantities we haven't derived.

---

## Attempted Derivation: Where It Fails

### Approach 1: From Lindbladian

The mathematical_framework.md §12.4 asserts:
```
L_γ[ρ] = γ L_QM[ρ] + (1-γ) L_class[ρ] + γ(1-γ) L_mix[ρ]
```

**Problems**:
- This is also asserted, not derived
- Coefficients (γ, 1-γ, γ(1-γ)) are chosen, not derived
- Why these specific weights?

### Approach 2: Dimensional Analysis

```
[Γ_dec] = s⁻¹ = 1/time

Available quantities:
- γ: dimensionless
- Some time scale τ

⟹ Γ_dec = f(γ)/τ
```

If we assume:
- τ = t_P (Planck time)
- f(γ) vanishes at γ = 0.5 (critical point)
- f(γ) is simplest polynomial: f(γ) = a(1-2γ)

Then: Γ_dec = a(1-2γ)/t_P

With a = 1, we get the claimed formula.

**But this is not derivation—this is fitting a form to desired behavior.**

### Approach 3: From Propagation Operator

If P_D evolves content, maybe Γ_dec emerges from:
```
||P_D^n|| ∝ exp(-Γ_dec × n τ)
```

**Problems**:
- P_D has no explicit time parameter
- The step n is discrete, not continuous
- No obvious connection to γ

### Approach 4: From γ-Gradient

If decoherence = γ decreasing, maybe:
```
dγ/dt = -Γ_dec × (γ - γ_eq)

⟹ Γ_dec = -(1/γ)(dγ/dt)
```

**Problems**:
- What determines dγ/dt?
- This just moves the question

---

## What Would Be Needed

### For a Real Derivation

1. **Define time** in the framework
   - Either discrete (step count) or continuous
   - With connection to physical seconds

2. **Derive γ dynamics** from Γ-structure
   - How does overlap evolve?
   - What drives γ change?

3. **Derive Planck time** from framework
   - Currently conjectured, not derived
   - Circular to use it in derivation

4. **Show uniqueness**
   - Why (1-2γ)/t_P and not some other function?
   - What principle determines the coefficient?

### Current Status

| Requirement | Status |
|-------------|--------|
| Time defined | NO |
| γ dynamics derived | NO |
| t_P derived | CONJECTURED |
| Coefficient derived | NO |
| Lindbladian derived | NO |

**Verdict**: The formula CANNOT be derived from current axioms.

---

## Comparison to Physics Literature

### Penrose-Diosi Model

```
Γ_PD = ΔE_grav/ℏ = Gm²/(ℏR₀)
```

**Derivation status**: Argued from principles (gravitational self-energy), not axiomatically derived.

### Standard Decoherence

```
Γ_env = Λ(Δx)²

Where Λ = scattering rate × (de Broglie wavelength)²
```

**Derivation status**: Derived from master equation and system-environment coupling.

### This Framework

```
Γ_dec = (1-2γ)/t_P
```

**Derivation status**: Asserted. No derivation offered.

---

## Options

### Option 1: Attempt Full Derivation

Would require:
- Adding dynamics axioms to framework
- Deriving time from graph structure
- Deriving t_P from |Π|
- Showing why (1-2γ) specifically

**Feasibility**: Research program, not quick fix.

### Option 2: Mark as ASSUMPTION

Add to assumptions_registry.md:
```
A-XX: Decoherence Rate Formula
Formula: Γ_dec = (1-2γ)/t_P + Γ_env
Status: ASSUMED (not derived)
Justification: Dimensional analysis + critical point at γ = 0.5
```

**Implications**: Predictions using this formula become less credible.

### Option 3: Demote to SPECULATION

Mark intermediate-γ regime predictions as SPECULATION.

**Rationale**: Without derived formulas, claims are speculative.

---

## Honest Assessment

### What the Formula Has Going For It

1. **Plausible structure**: Peaks at γ = 0.5, vanishes at endpoints
2. **Correct dimensions**: 1/time
3. **Connects to Planck scale**: Natural cutoff

### What It Lacks

1. **Derivation**: None exists
2. **Uniqueness**: Many functions have same qualitative behavior
3. **Physical principle**: Why this form specifically?
4. **Consistency**: Uses t_P which itself isn't derived

### The Core Problem

The framework defines:
- Static structure (P, Σ, Γ, C, V, B)
- Static overlap (γ)

It does NOT define:
- Time
- Dynamics
- Evolution equations

**You cannot derive a rate equation from a static framework.**

---

## Recommendation

**Option 2 + 3**: Mark as ASSUMPTION AND demote claims to SPECULATION

1. Add to assumptions_registry.md as explicit assumption
2. Update intermediate-γ status to SPECULATION
3. Note that formula is dimensional analysis, not derivation
4. Keep direction as interesting but acknowledge it's unproven

The QM limit has at least a formula (Schrödinger) even if coefficients aren't derived.
The intermediate-γ regime has a formula but no derivation of that formula.

**Difference from QM limit**: Schrödinger equation is the CLAIM. Here, the decoherence formula is supposed to be DERIVED from deeper principles, but it isn't.

---

## What Would Restore Credibility?

1. **Dynamics axiom**: Add explicit time evolution rule to framework
2. **Derive t_P**: Show t_P = √(ℏG/c⁵) follows from framework parameters
3. **Derive coefficients**: Show why (1-2γ) and not (1-γ)² or something else
4. **Derive Lindbladian**: Show L_γ structure from Γ-structure evolution

Until then, the formula remains an ansatz.

---

*Investigation complete: 2026-01-26*
*Verdict: Cannot derive from current axioms. Recommend mark as assumption.*
