# Layer 3: Predictions

**Status**: What the framework actually predicts
**Purpose**: Separate genuine predictions from pattern-matching and hopes
**Principle**: Every prediction must trace to Layers 0-2 with explicit dependencies

---

## 1. Classification System

### 1.1 Prediction Classes

| Class | Definition | Evidential Value |
|-------|------------|------------------|
| **DERIVED** | Follows logically from Layers 0-2 | Can test the framework |
| **PATTERN** | Numerical match without derivation | Suggestive, not conclusive |
| **HOPE** | Stated goal, no derivation | Cannot test framework |
| **RETRACTED** | Previously claimed, now withdrawn | Historical only |

### 1.2 Import Dependencies

Every prediction uses some subset of Layer 2 imports. We track:
- Which imports are required
- Whether removing an import breaks the prediction
- Whether the prediction could survive with different imports

---

## 2. Genuine Predictions (DERIVED)

### 2.1 Structural Predictions from Layer 0-1

These follow from pure mathematics, requiring no physical imports.

#### P-MATH-1: γ = 1/2 is a Critical Point

**Statement**: The overlap parameter γ = 1/2 is mathematically distinguished.

**Derivation chain**:
```
[A] Axiom: γ = |U_π₁ ∩ U_π₂| / |U_π₁ ∪ U_π₂| ∈ [0,1]    (Layer 0, §6)
[D] Asymmetry function: A(γ) = 2γ - 1                      (Layer 1, §4.3)
[D] A(γ) = 0 when γ = 1/2                                  (algebra)
[D] Interaction capacity: I(γ) = 2γ(1-γ)                   (Layer 1, §4.3)
[D] I(γ) maximized at γ = 1/2                              (calculus: dI/dγ = 0)
```

**Imports required**: NONE

**Physical interpretation** (requires imports):
- With I-ID-1 (high-γ = QM): γ = 1/2 is quantum-classical boundary
- With I-DIM-2 (n_space = 3): Corresponds to L = λ_C (Compton wavelength)

**Testability**: The math is certain; physical interpretation is conjecture.

**Confidence**: THEOREM (math), CONJECTURE (physics)

---

#### P-MATH-2: Irreversibility of Adjacency

**Statement**: Valid perspective transitions satisfy ΔI ≥ 0 (information loss non-negative).

**Derivation chain**:
```
[A] Axiom Adj.1: Valid adjacency requires ΔI(π₁ → π₂) ≥ 0  (Layer 0, §5.3)
[D] Theorem Adj.1: If ΔI > 0, no inverse exists            (Layer 0, §9)
[D] The adjacency graph (Π, ~) is directed                 (Layer 0, §9)
```

**Imports required**: NONE

**Physical interpretation** (requires I-ID-3: Adjacency = time):
- Time has a preferred direction
- Entropy increases along valid paths
- This is a "second law" for perspectives

**Testability**: The math is certain; identifies with thermodynamic arrow via import.

**Confidence**: THEOREM (math), CONJECTURE (physics)

---

### 2.2 Predictions Requiring Specific Imports

#### P-PHYS-1: Intrinsic Decoherence Rate Form (γ ≤ 0.5)

**Statement**: For γ ≤ 0.5, intrinsic decoherence rate has form Γ_dec ∝ (1 - 2γ).

**Derivation chain**:
```
[A] Axiom: Content divides into shared and different        (Layer 0, §5)
[D] Shared fraction = γ, different fraction = (1-γ)        (definition)
[D] Asymmetry A(γ) = shared - different = 2γ - 1           (Layer 1, §4.3)
[I] Import I-SCALE-2: Time scale τ₀ = t_P                  (Layer 2)
[D] Rate = -A(γ)/τ₀ = (1-2γ)/τ₀ when A < 0                (core/18_dynamics)
```

**Imports required**:
- I-SCALE-2 (τ₀ = t_P): Sets overall scale
- I-ID-3 (Adjacency = time): Makes rate meaningful

**What's derived vs imported**:
- DERIVED: Functional form (1 - 2γ)
- IMPORTED: Time scale τ₀ = t_P

**Testability**: Would predict decoherence enhancement at L ~ λ_C.

**Confidence**: DERIVATION (form), ASSUMPTION (scale)

---

#### P-PHYS-2: Interaction Capacity h(γ) = 2γ(1-γ)

**Statement**: Gravitational decoherence is proportional to h(γ) = 2γ(1-γ).

**Derivation chain**:
```
[A] Axiom: Content divides into shared (γ) and different (1-γ)
[D] Interaction requires BOTH channels (shared for reference, different for effect)
[D] Ordered pairs: (shared→different) + (different→shared) = 2 × γ(1-γ)
[D] h(γ) = 2γ(1-γ) is bidirectional interaction capacity   (physics/h_gamma_investigation)
```

**Imports required**:
- I-ID-5 (Γ = geometry): Connects to gravity

**What's derived vs imported**:
- DERIVED: Form 2γ(1-γ) from counting
- IMPORTED: Connection to gravitational decoherence

**Testability**: Suppresses gravitational decoherence at small scales.

**Note**: This suppression makes the framework HARDER to test (see P-NULL-1).

**Confidence**: DERIVATION

---

#### P-PHYS-3: γ > 0.5 Has Only Environmental Decoherence

**Statement**: For γ > 0.5, intrinsic decoherence tendency is frustrated; only environmental decoherence operates.

**Derivation chain**:
```
[D] Tendency T(γ) = (1-2γ)/τ₀                               (P-PHYS-1)
[D] For γ > 0.5: T(γ) < 0 (tendency toward coherence)
[D] Thermodynamic constraint: coherence cannot spontaneously increase
[D] Actual rate: Γ_intrinsic = max(0, T(γ)) = 0 for γ > 0.5
```

**Physical interpretation**:
- Quantum regime (γ > 0.5) is intrinsically stable
- Decoherence comes only from environment
- Critical slowing near γ = 0.5

**Testability**: Predicts transition in decoherence behavior at L = λ_C.

**Confidence**: DERIVATION (given P-PHYS-1)

---

## 3. Pattern Matches (PATTERN)

These are numerical agreements without complete derivations.

### 3.1 P-PAT-1: Weinberg Angle sin²θ_W = 2/9

**Statement**: sin²θ_W = n_weak/n_color² = 2/9 = 0.2222

**Numerical match**:
```
Framework:  2/9 = 0.2222...
On-shell:   0.2229 ± 0.0003
Discrepancy: 0.3%
```

**Derivation status**:
```
[I] Import I-DIM-3: n_color = 3                             (Layer 2)
[I] Import I-DIM-4: n_weak = 2                              (Layer 2)
[?] MISSING: Why sin²θ_W = n_weak/n_color²                  (no mechanism)
```

**Imports required**:
- I-DIM-3 (n_color = 3)
- I-DIM-4 (n_weak = 2)

**Why PATTERN not DERIVED**:
- No mechanism explains the n_weak/n_color² relationship
- Dimensions are imported, not derived
- Could be coincidence

**What would upgrade this**:
- Derive n_color = 3 or n_weak = 2 from Layer 0
- Find mechanism connecting sin²θ_W to dimension ratio
- Show why on-shell (tree-level) matches, not MS-bar

**Testability**: Already tested — matches on-shell value to 0.3%.

**Confidence**: PATTERN (0.3% match is striking but unexplained)

---

### 3.2 P-PAT-2: Coupling Ratio α_W/α = 4.5

**Statement**: The ratio of weak to electromagnetic coupling is 4.5.

**Numerical match**:
```
Framework:  α_W/α = 9/2 = 4.5
Measured:   ~4.6 (scale-dependent)
Discrepancy: ~3%
```

**Derivation status**:
```
[I] Import I-SCALE-1: |Π| ≈ 10^118                          (Layer 2)
[?] Conjecture: α = 2/ln|Π|, α_W = 9/ln|Π|                  (unproven)
[D] If conjecture true: α_W/α = 9/2 = 4.5                   (algebra)
```

**Why PATTERN not DERIVED**:
- The formulas α = 2/ln|Π| and α_W = 9/ln|Π| are conjectures
- Coefficients 2 and 9 have partial structural explanation
- Follows from P-PAT-1 if sin²θ_W = 2/9

**Connection to P-PAT-1**:
```
sin²θ_W = g'²/(g² + g'²) = α/α_W  (at some scale)
If sin²θ_W = 2/9, then α_W/α = 9/2 = 4.5
```

**Confidence**: PATTERN (follows from P-PAT-1)

---

### 3.3 P-PAT-3: Coupling Hierarchy from |Π|

**Statement**: All fundamental couplings derive from |Π| with different functional forms.

**The pattern**:
```
α   = 2/ln|Π|         ≈ 1/137     (electromagnetic)
α_W = 9/ln|Π|         ≈ 1/30      (weak)
α_G = 30/|Π|^(1/3)    ≈ 10^-39    (gravitational)
```

**Hierarchy explanation**:
```
α/α_G = (2/ln|Π|) / (30/|Π|^(1/3))
      = (2/274) × (10^40/30)
      ≈ 10^37 ✓
```

**Derivation status**:
```
[I] Import I-SCALE-1: |Π| ≈ 10^118                          (Layer 2)
[?] Conjecture: α ∝ 1/ln|Π| (log scaling)                   (unproven)
[?] Conjecture: α_G ∝ 1/|Π|^(1/3) (power scaling)           (unproven)
[?] Conjecture: Coefficient 30 = dim(B) × n_space           (partial)
[?] Conjecture: Power 1/3 = 1/n_space                       (plausible)
```

**Why this is better than numerology**:
1. |Π| has independent cosmological meaning
2. Works for MULTIPLE couplings simultaneously
3. Explains hierarchy through functional form, not separate parameters
4. Coefficients have structural interpretations

**Why still PATTERN**:
- Formulas are conjectures, not derivations
- |Π| is imported, not derived
- Coefficients partially fit

**Confidence**: PATTERN (compelling but unproven)

---

### 3.4 P-PAT-4: Product Relation α_G × α_W × |Π|^(1/3) ≈ 1

**Statement**: The product of gravitational and weak couplings with |Π|^(1/3) equals approximately 1.

**Numerical check**:
```
α_G = 5.9 × 10^-39
α_W = 1/30 ≈ 0.033
|Π|^(1/3) ≈ 10^40

Product: (5.9×10^-39) × (0.033) × (10^40) ≈ 2
```

**Derivation status**:
```
Follows from P-PAT-3 if:
α_G = 30/|Π|^(1/3) and α_W = 9/ln|Π|

Product = (30/|Π|^(1/3)) × (9/ln|Π|) × |Π|^(1/3)
        = 270/ln|Π|
        ≈ 270/274 ≈ 1
```

**Why PATTERN**:
- Derived from other patterns, not independently
- Factor of 2 discrepancy unexplained

**Confidence**: PATTERN (follows from P-PAT-3)

---

## 4. Hopes (HOPE)

These are stated goals without derivations.

### 4.1 P-HOPE-1: QM from High-γ Limit

**Statement**: Quantum mechanics emerges as the γ → 1 limit.

**What exists**:
- Conceptual picture: high overlap → superposition → interference
- Structural parallel: Schrödinger equation from P_D in continuum limit

**What's missing**:
- Complete derivation of Schrödinger equation
- Born rule derivation
- Explanation of ℏ
- Measurement theory

**Import dependencies**:
- I-DIM-1 (𝔽 = ℂ): Complex amplitudes
- I-ID-1 (High-γ = QM): The identification itself

**Why HOPE**:
- Core machinery not derived, just suggested
- Would require import of ℏ regardless

**Confidence**: HOPE (appealing picture, major gaps)

---

### 4.2 P-HOPE-2: GR from Low-γ Limit

**Statement**: General relativity emerges as the γ → 0 limit.

**What exists**:
- Conceptual picture: low overlap → classical → geometry

**What's missing**:
- **NO FORMULA** for g_μν from Γ-structure
- Einstein equations not even sketched
- Lorentzian signature unexplained
- Connection to diffeomorphism invariance absent

**Import dependencies**:
- I-STRUCT-4 (Lorentz signature): Required but unexplained
- I-ID-2 (Low-γ = GR): The identification itself
- I-ID-5 (Γ = geometry): Unspecified connection

**Why HOPE (demoted from CONJECTURE)**:
- No construction exists
- "Γ proportional to g_μν" is not a formula
- This is an open problem in quantum gravity generally

**Confidence**: SPECULATION (hope without substance)

---

### 4.3 P-HOPE-3: Gauge Groups from Aut(B)

**Statement**: Standard Model gauge group SU(3) × SU(2) × U(1) emerges from Aut(B).

**What exists**:
- Structural parallel: Aut(B_i) ⊆ U(n_i) or O(n_i)
- Decomposition: If B = B_color ⊔ B_weak ⊔ B_EM, then Aut(B) factors

**What's missing**:
- Why SU(n) instead of U(n) or O(n)?
- Why these specific dimensions?
- How does chirality emerge?
- Fermion representation content

**Import dependencies**:
- I-DIM-3, I-DIM-4, I-DIM-5 (dimensions): All imported
- I-STRUCT-1 (Aut(B) → SM): The identification itself

**Why HOPE**:
- The structure is IMPORTED, not derived
- We're matching to known physics, not predicting

**Confidence**: HOPE (reorganization, not derivation)

---

## 5. Retracted Predictions (RETRACTED)

### 5.1 P-RET-1: α from n_EW = 5 (DEPRECATED)

**Former statement**: α = sin²θ_W / (2π × n_EW) with n_EW = 5

**Why retracted**:
1. n_EW = 5 is chosen to fit α, not derived
2. Gell-Mann–Nishijima constraint makes claimed basis impossible (dim ≤ 4)
3. Follows Eddington pattern (1930s numerology)
4. Internal contradiction with gauge_structure.md

**Historical record**: archive/deprecated/alpha_derivation.md

**Lesson**: 0.7% accuracy with 1 free parameter is fitting, not derivation.

---

### 5.2 P-RET-2: Recoherence for γ > 0.5 (RETRACTED)

**Former statement**: For γ > 0.5, Γ_dec < 0 implies Planck-rate recoherence.

**Why retracted**:
1. Not observed in nature
2. Formula is ansatz, not derived
3. Resolved by thermodynamic constraint (tendency ≠ actual rate)

**Current status**: γ > 0.5 has Γ_intrinsic = 0 (see P-PHYS-3).

---

## 6. Null Predictions (What We DON'T Predict)

### 6.1 P-NULL-1: Gravitational Decoherence Indistinguishable from Penrose-Diosi

**Statement**: The h(γ) suppression makes framework predictions indistinguishable from Penrose-Diosi in all planned experiments.

**Analysis**:
```
In accessible regimes (L >> λ_C): h(γ) → 0
- Electrons at 100nm: h(γ) ~ 10^-5
- C₆₀ at 100nm: h(γ) ~ 10^-11
- MAQRO proposal: h(γ) ~ 10^-12

Both models predict negligible gravitational decoherence.
```

**Implication**: Gravitational decoherence is NOT a distinguishing prediction.

**Confidence**: HIGH (quantitative analysis completed)

---

### 6.2 P-NULL-2: No Time Variation of Couplings

**Statement**: Coupling constants do not vary with cosmic time.

**Derivation**:
```
If |Π| varied: Δα/α ~ 10^-2 over cosmic time
Measured limit: < 10^-5
Therefore: |Π| must be static
Therefore: No predicted variation
```

**Implication**: Framework predicts what's already measured (no variation), not a novel prediction.

**Confidence**: HIGH (consistency requirement, not prediction)

---

## 7. Summary Tables

### 7.1 Predictions by Class

| Class | Count | Examples |
|-------|-------|----------|
| DERIVED | 4 | γ=1/2 critical, irreversibility, decoherence form, h(γ) |
| PATTERN | 4 | sin²θ_W=2/9, α_W/α=4.5, hierarchy, product relation |
| HOPE | 3 | QM limit, GR limit, gauge groups |
| RETRACTED | 2 | α from n_EW, recoherence |
| NULL | 2 | Grav decoherence, α variation |

### 7.2 Predictions by Confidence

| Confidence | Count | Notes |
|------------|-------|-------|
| THEOREM (math) | 2 | γ=1/2 critical, irreversibility |
| DERIVATION | 2 | Decoherence form, h(γ) |
| PATTERN | 4 | Numerical matches without mechanism |
| HOPE | 3 | Stated goals without derivation |
| SPECULATION | 1 | GR limit |

### 7.3 Import Dependencies

| Prediction | Essential Imports | Could Derive Instead? |
|------------|-------------------|----------------------|
| sin²θ_W = 2/9 | I-DIM-3, I-DIM-4 | Need mechanism |
| α_W/α = 4.5 | I-SCALE-1 | Follows from sin²θ_W |
| Hierarchy | I-SCALE-1 | Need |Π| derivation |
| Decoherence form | I-SCALE-2 | Form derived, scale imported |
| QM limit | I-DIM-1, I-ID-1 | Major work needed |
| GR limit | I-STRUCT-4, I-ID-2 | Currently impossible |

---

## 8. What Would Make Predictions Stronger

### 8.1 Upgrade PATTERN to DERIVED

| Pattern | What's Needed |
|---------|---------------|
| sin²θ_W = 2/9 | Mechanism connecting to dimension ratio |
| Coupling hierarchy | Derive |Π| from axioms |
| Coefficients (2, 9, 30) | Complete structural explanation |

### 8.2 Upgrade HOPE to DERIVED

| Hope | What's Needed |
|------|---------------|
| QM limit | Full Schrödinger derivation, Born rule |
| GR limit | Any formula for g_μν from Γ |
| Gauge groups | Derive dimensions from axioms |

### 8.3 Reduce Import Count

| Import | Derivation Path |
|--------|-----------------|
| n_space = 3 | Stability analysis (hard) |
| n_color = 3 | Anomaly cancellation given n_weak? |
| n_weak = 2 | Minimality argument? |
| |Π| | Self-consistency of horizon (hard) |
| 𝔽 = ℂ | Interference requirement (maybe possible) |

---

## 9. The Honest Summary

### What the Framework Actually Predicts

1. **Mathematics** (DERIVED from Layer 0-1):
   - γ = 1/2 is critical
   - Adjacency is irreversible
   - Decoherence rate has form (1-2γ)
   - Interaction capacity is 2γ(1-γ)

2. **Patterns** (numerical matches, no mechanism):
   - sin²θ_W = 2/9 (0.3% match to on-shell)
   - α_W/α = 4.5 (~3% match)
   - Coupling hierarchy from |Π|
   - Gravity-weak product relation

3. **Null predictions**:
   - No distinguishable gravitational decoherence
   - No time variation of couplings

### What the Framework Does NOT Predict

1. **Any physical constants from pure axioms** — all require imports
2. **QM dynamics** — Schrödinger equation not derived
3. **GR** — no formula exists
4. **Gauge group structure** — imported from SM
5. **Particle content** — not addressed

### The Gap

**Claimed**: Physics from perspective
**Reality**: Perspective language for imported physics, plus some intriguing patterns

The patterns (especially sin²θ_W = 2/9) are more interesting than typical numerology but less than derivations. The framework would become significant if any import could be derived from Layer 0.

---

## 10. Recommendations for Physicist Evaluation

### Questions to Answer

1. **Is sin²θ_W = n_weak/n_color² known or novel?**
   - If known: framework rediscovers something
   - If novel: potential contribution

2. **Is log vs power scaling for couplings plausible?**
   - Does this relate to RG flow?
   - Is there a physical reason for the difference?

3. **Is the coupling pattern testable?**
   - What precision would distinguish pattern from coincidence?
   - Are there additional predictions that follow?

4. **Is there a path from perspective to constants?**
   - What additional axioms would help?
   - Is the approach fundamentally limited?

### What's Worth Pursuing

1. **sin²θ_W = 2/9 mechanism**: If a physical reason exists, this is significant
2. **Hierarchy explanation**: Even if approximate, conceptually valuable
3. **|Π| derivation**: Would make the whole pattern more compelling

### What's NOT Worth Pursuing

1. **GR limit without a formula**: Currently empty
2. **More patterns without mechanisms**: Numerology risk
3. **Intermediate-γ predictions**: Ansätze, not derivations

---

*This is Layer 3: What the framework actually predicts.*
*For the mathematical foundation, see Layers 0-1.*
*For explicit imports, see Layer 2.*

---

**Document version**: 1.0
**Created**: 2026-01-26
**Depends on**: Layers 0, 1, 2
