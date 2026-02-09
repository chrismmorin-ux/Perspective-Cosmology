# Asymptotic Safety and the Crystal-Defect Interface

**Status**: ARCHIVE (INVESTIGATING)
**Confidence**: [SPECULATION]
**Created**: 2026-01-26
**Last Verified**: 2026-01-26
**Verified**: YES → verification/sympy/alpha_running_test.py
**Last Updated**: 2026-02-03

---

## Imports Required

| Import | Value | Source | Tag |
|--------|-------|--------|-----|
| Spectral dimension (IR) | 4 | QFT/GR | [A-IMPORT] |
| Spectral dimension (UV) | 2 | AS/CDT | [A-IMPORT] |
| α(M_Z) | 1/127.9 | LEP | [A-IMPORT] |
| α(GUT) | ~1/42 | SM extrapolation | [A-IMPORT] |

---

## Numerology Risk: MEDIUM

**Why this might be coincidence rather than derivation:**
1. Dimensional reduction is mainstream physics - we're borrowing it, not deriving it
2. The specific values (4→2, 11→6) are chosen to match measurements
3. No rigorous RG derivation connects interface picture to β-function
4. Structural parallels don't constitute proof

**What would strengthen it:**
- Derive β-function from interface geometry
- Show n_crystal reduction has independent physics basis

---

## Summary

This document explores whether the asymptotic safety program in quantum gravity can provide a theoretical foundation for our crystal-defect model and the formula α = 1/(4² + 11²).

**Key finding**: There ARE structural parallels, but NO direct derivation yet.

---

## 1. Asymptotic Safety Overview

### Core Concept

Asymptotic safety proposes that gravity is UV-complete via a **non-trivial fixed point** (the Reuter fixed point) where coupling constants approach finite values rather than diverging.

**Key papers**:
- Reuter (1996): Original functional RG formulation
- Eichhorn, Held, Wetterich (2018): ["Quantum-gravity predictions for the fine-structure constant"](https://arxiv.org/abs/1711.02949)

### The Fixed Point Mechanism

At high energies (UV), the dimensionless couplings flow toward fixed values:
```
g(k) → g*    (Newton coupling)
α(k) → α*    (gauge coupling)
```

The balance occurs because:
- **Gravity** contributes anti-screening (makes coupling grow)
- **Gauge bosons** contribute anti-screening
- **Matter fields** contribute screening (makes coupling shrink)
- At critical α*, these cancel exactly

### Prediction Claim

Eichhorn et al. claim that for grand unified models, **α can be predicted** from the fixed point condition. The predicted value depends on matter content.

---

## 2. Dimensional Reduction: The Key Parallel

### The Universal Result

Multiple independent approaches to quantum gravity find the same thing:

| Scale | Spectral Dimension |
|-------|-------------------|
| Large (IR) | dₛ ≈ 4 |
| Small (UV/Planck) | dₛ ≈ 2 |

This is found in:
- Asymptotic safety (functional RG)
- Causal dynamical triangulations
- Loop quantum gravity
- String theory
- Noncommutative geometry

**Source**: [Carlip, "Dimension and Dimensional Reduction in Quantum Gravity"](https://arxiv.org/abs/1705.05417)

### Why Dimensions Reduce

1. **Scale invariance requirement**: At the UV fixed point, physics must be scale-invariant
2. **Newton's constant dimensionality**: G is dimensionless only in d=2
3. **Anomalous dimensions**: At fixed point, ηN = 2 - d, making propagators behave as d=2

### CDT Results (Numerical)

From causal dynamical triangulations:
- Large scales: 4.02 ± 0.10 → **4.05 ± 0.17**
- Small scales: 1.80 ± 0.25 → **1.97 ± 0.27**

The transition occurs at ~10 Planck lengths.

---

## 3. Potential Connection to Our Model

### Our Picture

```
Crystal C (exterior):  11 dimensions, Var = 0, perfect orthogonality
Defect U (interior):   4 perceived dimensions, Var > 0
Interface:             Where α is determined
```

### Asymptotic Safety Picture

```
UV (Planck scale):     dₛ ≈ 2, fixed point, couplings determined
IR (macroscopic):      dₛ = 4, ordinary physics
Running:               Couplings evolve with scale
```

### Structural Parallels

| Our Model | Asymptotic Safety | Match? |
|-----------|------------------|--------|
| Crystal exterior | UV completion | ✓ Conceptual |
| Defect interior | IR physics | ✓ Conceptual |
| Interface boundary | Fixed point region | ✓ Conceptual |
| α from interface | α from fixed point | ✓ Structural |
| 4 dimensions (perceived) | 4 dimensions (IR) | ✓ Exact |
| 11 dimensions (total) | ? | See below |

### The 11-Dimension Question

Asymptotic safety in 4D doesn't naturally produce 11 dimensions. However:
- M-theory requires 11 dimensions for consistency
- String theory requires 10 dimensions
- The UV structure might be higher-dimensional

**Possible connection**: If the "crystal" represents the UV-complete structure (where gravity is unified with other forces), it might naturally be 11D from string/M-theory.

---

## 4. The Formula Question: Why n₁² + n₂²?

### Our Claim
```
α = 1/(n_perceived² + n_total²) = 1/(4² + 11²) = 1/137
```

### Asymptotic Safety Formulas

For Newton's constant at the fixed point:
```
g_N/(4π)² = 12/(−n_S + 2n_D + 4n_M)
```
Where:
- n_S = number of scalar fields
- n_D = number of Dirac fermions
- n_M = number of vector fields
- Coefficients 1, 2, 4 relate to degrees of freedom

### Comparison

| Aspect | Our Formula | AS Formula |
|--------|-------------|------------|
| Structure | Sum of squares | Weighted sum |
| Input | Dimensions | Field counts |
| Output | 1/α directly | Fixed point condition |
| Running | Not explained | Natural |

**Key difference**: We use dimension squares; AS uses field counts with coefficients.

### Could They Connect?

**Possibility 1**: Dimension → Field Correspondence
- In d dimensions, vector fields have d components
- In d dimensions, metric has ~d² components
- Maybe n² counts "interface degrees of freedom"?

**Possibility 2**: Interface as Fixed Point Surface
- The crystal/defect boundary IS the RG fixed point
- Interface "area" relates to critical surface dimension
- Sum of squares measures critical surface geometry

**Possibility 3**: No Connection
- Our formula might be numerology that happens to work
- The structural parallel is coincidence
- AS gives different mechanism entirely

---

## 5. What Asymptotic Safety Actually Predicts for α

### The Eichhorn et al. Result

The paper claims α can be predicted **if**:
1. We're in a grand unified model
2. The UV fixed point exists
3. The matter content is specified

The mechanism:
```
β_α = (screening from matter) + (anti-screening from gravity/gauge)
     = 0  at fixed point
     → unique α*
```

### Critical Assessment

**Good**:
- Provides a MECHANISM for α determination
- Connects to established physics (RG flow)
- Matter content enters naturally

**Problems**:
- "Running measured electroweak couplings from weak scale to Planck scale exceeds asymptotic safety predictions by factors of several"
- Computational uncertainties remain large
- Depends heavily on truncation choices

**Status**: Promising but not yet validated.

---

## 6. Running of α: Where AS Helps

### The Challenge for Our Model

Sean Carroll's critique: "α isn't really a number at all; it's a function."

| Scale | α value |
|-------|---------|
| Low energy | 1/137 |
| Z boson (~90 GeV) | 1/127 |
| GUT scale (~10¹⁶ GeV) | ~1/42 |

Our formula α = 1/(4² + 11²) gives only the IR value.

### How AS Addresses Running

In asymptotic safety:
```
α(k) runs from α* (UV) toward α(0) (IR)
β_α determines the running
The entire β-function is part of the theory
```

### Possible Integration

**Idea**: Our interface formula gives the **fixed point value** α*, and RG running gives the low-energy value.

**Problem**: The fixed point is in the UV (Planck scale), but 1/137 is the IR value. If anything, our formula should give α at high energy, not low energy.

**Alternative**: Maybe the interface measure changes with energy:
```
I(E) = n_perceived(E)² + n_total(E)²
```
If spectral dimension flows 4→2, maybe this gives running?

This requires investigation.

---

## 7. Key Research Questions

### For Establishing Connection

1. **Can interface measure reproduce β-function?**
   - Does dI/d(ln E) match β_α?

2. **Does dimensional reduction explain running?**
   - If n_perceived → 2 as E → Planck scale
   - Does 1/(2² + 11²) = 1/125 match α(M_Planck)?

3. **Is n² the right measure?**
   - Why sum of squares, not product or sum?
   - What geometric calculation gives this form?

### For Strengthening Our Model

4. **Derive 11 from axioms**
   - Currently imported from M-theory
   - Can perspective framework require 11D crystal?

5. **Connect to defect CFT**
   - Interface physics is studied in conformal field theory
   - Does defect CFT give n² measures?

6. **Predict other couplings**
   - Does α_W fit the pattern?
   - What about α_S?

---

## 8. Assessment

### What We Learned

| Finding | Implication |
|---------|-------------|
| Dimensional reduction 4→2 at UV | Crystal/defect boundary could BE the UV fixed point region |
| AS tries to predict α | We're not alone in thinking α is derivable |
| Matter content matters | Our dimension-only formula may be incomplete |
| Running requires RG | Our model must address β-function |

### Connection Strength

**WEAK to MEDIUM**

Parallels:
- Dimensional structure determines coupling (both models)
- UV fixed point / interface boundary (conceptual match)
- 4D as IR physics (exact match)

Gaps:
- No derivation of n² formula from RG
- 11D not natural in AS (comes from string theory)
- Running not explained by our model

### Verdict

The asymptotic safety program provides:
1. **Legitimacy**: α determination is an active research area
2. **Mechanism**: RG fixed point could be our "interface"
3. **Challenge**: We must explain running, not just IR value

We have NOT derived our formula from AS, but we've found a potential theoretical home for it.

---

## 9. Critical Test: Dimensional Running Hypothesis

### The Hypothesis

If spectral dimension flows from 4 (IR) to 2 (UV), then perhaps:
```
α(E) = 1/(n_eff(E)² + n_total²)
```
could explain the running of α with energy.

### Computational Test Results

**Script**: `verification/sympy/alpha_running_test.py`

| Energy Scale | n_eff (model) | α predicted | α measured | Error |
|-------------|---------------|-------------|------------|-------|
| IR (1 meV) | 4.00 | 1/137 | 1/137 | 0% |
| Z boson (91 GeV) | 3.55 | 1/134 | 1/128 | +4.5% |
| GUT (10^16 GeV) | 2.28 | 1/126 | 1/42 | **+200%** |
| Planck (10^19 GeV) | 2.00 | 1/125 | N/A | - |

### CRITICAL FINDING

**The formula α = 1/(n² + 121) CANNOT explain full running.**

The mathematical constraint:
```
1/α = n² + 121 ≥ 121  (since n² ≥ 0)
```

But at GUT scale: α ~ 1/42, so 1/α = 42 < 121.

**The formula is bounded to α ∈ [1/137, 1/121]** and cannot reach α ~ 1/42.

### Reverse Calculation: What n_eff Would Be Needed?

| Scale | α measured | Required n² | Possible? |
|-------|-----------|-------------|-----------|
| IR | 1/137 | 16.0 | YES (n=4) |
| Z boson | 1/128 | 6.9 | YES (n=2.6) |
| GUT | 1/42 | **-79** | **NO** |

### Possible Resolutions

1. **Formula only applies at IR**: The interface measure gives the low-energy value only
2. **n_total also runs**: At GUT scale, effective n_total ~ 6 instead of 11
3. **Formula is incomplete**: Missing terms that become important at high energy
4. **Different regimes**: The interface picture only applies below some threshold

### If n_total Also Runs

At GUT scale (α ~ 1/42):
```
n_perceived² + n_total² = 42
If n_perceived = 2: n_total = √38 ≈ 6.2
If n_perceived = 3: n_total = √33 ≈ 5.7
```

This could mean: at high energies, only ~6 of the 11 dimensions are "visible" at the interface (compactification scale?).

---

## 10. Next Steps

### Completed This Session

- [x] Research asymptotic safety literature
- [x] Test dimensional running hypothesis
- [x] Identify FATAL limitation of simple formula

### Future Work

1. **Investigate n_total running**: Does M-theory predict dimension visibility changes?
2. **Literature deep dive**: Defect CFT and interface measures
3. **Alternative formulas**: What structure gives full β-function?
4. **Focus on IR limit**: Accept that formula only gives low-energy α

---

## 11. Sources

- [Asymptotic safety in quantum gravity - Wikipedia](https://en.wikipedia.org/wiki/Asymptotic_safety_in_quantum_gravity)
- [Eichhorn, Held, Wetterich (2017) - arXiv:1711.02949](https://arxiv.org/abs/1711.02949)
- [Carlip, "Dimension and Dimensional Reduction" - arXiv:1705.05417](https://ar5iv.labs.arxiv.org/html/1705.05417)
- [CDT Evidence for AS - arXiv:1411.7712](https://arxiv.org/abs/1411.7712)
- [Frontiers: Asymptotically Safe Guide](https://www.frontiersin.org/journals/astronomy-and-space-sciences/articles/10.3389/fspas.2018.00047/full)
- [Dynamical dimensional reduction - Wikipedia](https://en.wikipedia.org/wiki/Dynamical_dimensional_reduction)

---

---

## Falsification Criteria

This investigation would be **falsified** if:
1. Asymptotic safety is disproven (no UV fixed point exists)
2. Spectral dimension reduction is wrong (stays 4D at all scales)
3. The interface picture cannot reproduce the QED β-function
4. Running of α at intermediate scales (e.g., 1 TeV) differs significantly from prediction

This investigation would be **supported** if:
1. Independent derivation of n_crystal reduction from M-theory
2. β-function derived from interface geometry
3. Prediction of α at new energy scale confirmed

---

*This document explores the connection between asymptotic safety and our crystal-defect model.*
*Status: [SPECULATION] - promising parallels, no derivation yet.*
