# Layer 2: Correspondence Rules

**Status**: IMPORT (from physics, cosmology, observation)
**Purpose**: Catalog EVERY identification between mathematical framework and physical reality
**Principle**: Complete honesty about what is assumed vs. derived

---

## 1. What This Document Is

Layer 2 bridges the gap between:
- **Layer 0**: Pure mathematical axioms (no physics)
- **Layer 1**: Mathematical consequences (what follows from axioms)
- **Layer 3**: Physical predictions (what the combined system implies)

**CRITICAL INSIGHT FROM LAYERS 0-1**: The axioms constrain almost nothing numerically.
- dim(V) is FREE (any finite dimension)
- |Π| is FREE (any finite count)
- Subspace decomposition is FREE (any partition)
- Field choice (ℝ vs ℂ) is FREE

**Therefore**: Every specific numerical identification is an IMPORT, not a derivation.

---

## 2. Master Import Table

### 2.1 Dimensional Imports

| Import | Mathematical | Physical | Source | Classification |
|--------|--------------|----------|--------|----------------|
| **I-DIM-1** | 𝔽 = ℂ | Complex amplitudes | QM | ESSENTIAL |
| **I-DIM-2** | n_space = 3 | Spatial dimensions | Observation | ESSENTIAL |
| **I-DIM-3** | n_color = 3 | QCD color charge | SM | ESSENTIAL |
| **I-DIM-4** | n_weak = 2 | Weak isospin | SM | ESSENTIAL |
| **I-DIM-5** | n_EM = 1 | Electromagnetic U(1) | SM | ESSENTIAL |
| **I-DIM-6** | n_Higgs = 1 | Higgs field | SM | CONVENIENT |
| **I-DIM-7** | dim(B) = 10 | "SO(10)-like" unification | GUT | CONVENIENT |

### 2.2 Scale Imports

| Import | Mathematical | Physical | Source | Classification |
|--------|--------------|----------|--------|----------------|
| **I-SCALE-1** | \|Π\| ≈ 10^118 | Horizon perspectives | Cosmology | ESSENTIAL |
| **I-SCALE-2** | τ₀ = t_P | Base time unit | Planck units | CONVENIENT |
| **I-SCALE-3** | l₀ = l_P | Base length unit | Planck units | CONVENIENT |
| **I-SCALE-4** | E₀ = E_P | Base energy unit | Planck units | CONVENIENT |

### 2.3 Structural Imports

| Import | Mathematical | Physical | Source | Classification |
|--------|--------------|----------|--------|----------------|
| **I-STRUCT-1** | Aut(B_i) → Gauge group | SU(3)×SU(2)×U(1) | SM | ESSENTIAL |
| **I-STRUCT-2** | sin²θ_W(GUT) = 3/8 | Weinberg angle at unification | GUT | TESTABLE |
| **I-STRUCT-3** | β-function running | Coupling evolution | RG theory | BORROWED |
| **I-STRUCT-4** | Lorentz signature | (-,+,+,+) metric | SR | ESSENTIAL |

### 2.4 Identification Imports

| Import | Mathematical | Physical | Source | Classification |
|--------|--------------|----------|--------|----------------|
| **I-ID-1** | γ → 1 limit | Quantum mechanics | Interpretation | CONJECTURE |
| **I-ID-2** | γ → 0 limit | General relativity | Interpretation | SPECULATION |
| **I-ID-3** | Adjacency | Time evolution | Interpretation | ESSENTIAL |
| **I-ID-4** | C(p) | Quantum state/field | Interpretation | ESSENTIAL |
| **I-ID-5** | Γ-structure | Spacetime geometry | Interpretation | CONJECTURE |

---

## 3. Detailed Import Analysis

### 3.1 I-DIM-1: Complex Field (𝔽 = ℂ)

**What we import**: V is a complex vector space, not real.

**Why this identification**:
- QM requires complex amplitudes for interference
- U(1) phase rotations need ℂ
- Real numbers insufficient for QM dynamics

**Could we derive it?**
- Layer 0 allows 𝔽 = ℝ or ℂ
- Nothing in axioms forces ℂ
- Possible approach: Show ℝ leads to inconsistency?
- Status: **NOT DERIVED**

**What if wrong?**
- Real-valued framework would give different physics
- Would need alternative explanation for interference
- Framework survives but QM interpretation fails

**Classification**: **ESSENTIAL** — framework cannot reproduce QM without it.

---

### 3.2 I-DIM-2: Three Spatial Dimensions (n_space = 3)

**What we import**: Exactly 3 spatial dimensions are macroscopically accessible.

**Why this identification**:
- Direct observation
- Anthropic arguments (Ehrenfest: orbits unstable for d > 3)
- Maxwell's equations work only in 3D

**Could we derive it?**
- Layer 0 allows any dimension
- Possible approaches:
  - Stability analysis of B-structure?
  - Entropy maximization?
  - Topological constraints?
- Status: **NOT DERIVED** (no mechanism in Layer 0)

**What if wrong?**
- Extra dimensions could exist (string theory: 10 or 11 total)
- Framework would need modification but could accommodate
- Observation constrains this strongly

**Classification**: **ESSENTIAL** — physical interpretation requires it.

---

### 3.3 I-DIM-3: Three Colors (n_color = 3)

**What we import**: QCD has SU(3) color symmetry.

**Why this identification**:
- Deep inelastic scattering shows 3 colors
- Asymptotic freedom requires SU(n) with n ≥ 3
- Smallest confining non-abelian group

**Could we derive it?**
- Layer 0 allows arbitrary subspace dimensions
- Possible approaches:
  - Match n_color = n_space? (numerology risk)
  - Stability/confinement argument?
  - Anomaly cancellation?
- Status: **NOT DERIVED** (heuristic arguments only)

**What if wrong?**
- Framework survives with different n_color
- Physical predictions would change
- Strong force phenomenology would be wrong

**Classification**: **ESSENTIAL** — SM gauge structure requires it.

---

### 3.4 I-DIM-4: Two Weak Isospin (n_weak = 2)

**What we import**: Weak force has SU(2) symmetry.

**Why this identification**:
- Minimal non-abelian gauge group
- Chirality structure
- Anomaly cancellation with n_color = 3

**Could we derive it?**
- Layer 0 allows arbitrary subspace dimensions
- Possible approaches:
  - Minimality argument (smallest non-abelian)?
  - Anomaly cancellation forces n_weak = 2 given n_color = 3?
- Status: **NOT DERIVED** (but closer to derivable than others)

**What if wrong?**
- Framework survives with different n_weak
- Electroweak physics would be different
- sin²θ_W predictions would change

**Classification**: **ESSENTIAL** — electroweak structure requires it.

---

### 3.5 I-SCALE-1: Perspective Count (|Π| ≈ 10^118)

**What we import**: The number of perspectives equals the cosmological horizon volume in Planck units.

**Why this identification**:
- Horizon radius R_H ≈ 10^26 m
- Planck length l_P ≈ 10^-35 m
- |Π| ~ (R_H/l_P)^3 ~ 10^183 or (R_H/l_P)^2 ~ 10^122
- Factor depends on counting method

**Calculation**:
```
Bekenstein bound: S_max = kA/(4l_P²) ~ (R_H/l_P)² ~ 10^122
If |Π| = exp(S_max/k): much larger
If |Π| = S_max directly: ~ 10^122
If |Π| = (R_H/l_P)³ (volume): ~ 10^183
```

The choice |Π| ≈ 10^118 is intermediate — needs justification.

**Could we derive it?**
- Layer 0 places NO constraint on |Π|
- Would need cosmological axiom connecting |P| to horizon
- Status: **NOT DERIVED** — pure import from cosmology

**What if wrong?**
- All |Π|-dependent predictions change
- G derivation would give different value
- Framework survives but with different predictions

**Classification**: **ESSENTIAL** — hierarchy solutions depend on it.

---

### 3.6 I-STRUCT-1: Gauge Groups from Aut(B)

**What we import**: Aut(B_i) generates Standard Model gauge groups.

**The claim**:
```
Aut(B_color) → SU(3)_C
Aut(B_weak) → SU(2)_L
Aut(B_EM) → U(1)_Y
```

**Why this identification**:
- Orthonormal basis rotations preserve structure
- For n-dimensional subspace: Aut ⊆ U(n) (complex) or O(n) (real)
- SU(n) = U(n) with det = 1 constraint

**Problems**:
1. Why SU(n) and not U(n) or O(n)?
2. Why these specific dimensions?
3. How does chirality emerge?

**Could we derive it?**
- Layer 0 says Aut(B) = Aut(B_1) × ... × Aut(B_k) (Theorem B.1)
- But doesn't specify which group or why certain dimensions
- Status: **PARTIALLY IMPORTED** — structure matches but values assumed

**What if wrong?**
- Framework survives with different gauge groups
- Particle phenomenology would be completely different
- This is essentially importing the SM

**Classification**: **ESSENTIAL** — this IS the SM import.

---

### 3.7 I-STRUCT-2: Weinberg Angle at GUT Scale

**What we import**: sin²θ_W = 3/8 at unification scale.

**Why this identification**:
- GUT theories (SU(5), SO(10)) predict this
- Dimension counting: sin²θ_W = n_weak/(n_weak + n_color) = 2/(2+3) = 2/5? NO
- Actually: sin²θ_W = 3/8 from SU(5) hypercharge normalization

**The GUT calculation**:
```
In SU(5): Y = sqrt(3/5) × Y_SM
This gives: sin²θ_W = g'²/(g² + g'²) = 3/8 at M_GUT
Running down: 0.375 → 0.231 at M_Z
```

**Could we derive it?**
- The value 3/8 comes from specific GUT embedding
- Layer 0 has no mechanism for this
- A perspective framework might give: n_weak²/(n_weak² + n_color²) = 4/13 ≈ 0.31? (different)
- Status: **BORROWED FROM GUT** — not derived

**What if wrong?**
- If we can't reproduce sin²θ_W ≈ 0.23, framework fails basic test
- This is a genuine prediction (if we can derive 3/8)
- Currently: we import GUT's answer

**Classification**: **TESTABLE** — could potentially derive independently.

---

### 3.8 I-ID-1: High-γ as Quantum Mechanics

**What we import**: The γ → 1 limit reproduces quantum mechanics.

**The claim**:
```
As γ → 1 (high overlap):
- Multiple perspectives see nearly identical content
- Superposition = content accessible from multiple perspectives
- Wave function = shared accessible content
- Measurement = perspective transition that reduces overlap
```

**Why this identification**:
- QM features (superposition, interference) match high-overlap properties
- Schrödinger equation claimed to emerge from P_D dynamics
- Uncertainty from perspective grain

**Problems**:
1. Schrödinger equation derivation has gaps
2. Born rule not derived
3. Measurement problem not fully resolved

**Could we derive it?**
- Layer 0 defines γ and overlap
- Connection to QM is INTERPRETATION
- Status: **CONJECTURE** — plausible but not proven

**What if wrong?**
- Framework's main selling point fails
- Would need different interpretation of γ
- QM-GR unification claim collapses

**Classification**: **CONJECTURE** — core claim, not established.

---

### 3.9 I-ID-2: Low-γ as General Relativity

**What we import**: The γ → 0 limit reproduces general relativity.

**The claim**:
```
As γ → 0 (low overlap):
- Perspectives barely overlap
- Content "freezes" into classical configurations
- Γ-structure becomes metric geometry
- Einstein equations emerge from perspective dynamics
```

**Why this identification**:
- GR describes regime where QM effects negligible
- Spacetime geometry = limit of perspective structure
- Gravity = emergent from information flow

**Problems**:
1. **g_μν NOT CONSTRUCTED** — no formula linking Γ to metric
2. Einstein equations NOT derived
3. Lorentzian signature NOT explained
4. This is a hope, not a derivation

**Status**: **SPECULATION** — demoted from conjecture (see derivations_summary.md)

**What if wrong?**
- Framework's GR limit claim is empty
- Would need actual construction or admit failure
- Currently: promissory note, not achievement

**Classification**: **SPECULATION** — stated goal, no derivation.

---

## 4. Classification Summary

### 4.1 ESSENTIAL Imports (Framework fails without these)

| Code | Import | Why Essential |
|------|--------|---------------|
| I-DIM-1 | 𝔽 = ℂ | No QM without complex numbers |
| I-DIM-2 | n_space = 3 | Physical interpretation requires it |
| I-DIM-3 | n_color = 3 | SM gauge structure |
| I-DIM-4 | n_weak = 2 | SM gauge structure |
| I-DIM-5 | n_EM = 1 | Electromagnetism |
| I-SCALE-1 | \|Π\| ≈ 10^118 | Hierarchy solutions |
| I-STRUCT-1 | Aut(B) → SM | Gauge physics |
| I-STRUCT-4 | Lorentz signature | Causality |
| I-ID-3 | Adjacency = time | Dynamics |
| I-ID-4 | C(p) = state | Physical content |

**Count**: 10 essential imports

### 4.2 CONVENIENT Imports (Simplify but not strictly necessary)

| Code | Import | Why Convenient |
|------|--------|----------------|
| I-DIM-6 | n_Higgs = 1 | Simplest symmetry breaking |
| I-DIM-7 | dim(B) = 10 | SO(10)-like unification |
| I-SCALE-2 | τ₀ = t_P | Natural time unit |
| I-SCALE-3 | l₀ = l_P | Natural length unit |
| I-SCALE-4 | E₀ = E_P | Natural energy unit |

**Count**: 5 convenient imports

### 4.3 TESTABLE Imports (Could potentially derive)

| Code | Import | Derivation Path |
|------|--------|-----------------|
| I-STRUCT-2 | sin²θ_W = 3/8 | Dimension counting? |

**Count**: 1 testable import

### 4.4 CONJECTURE/SPECULATION (Interpretive claims)

| Code | Import | Status |
|------|--------|--------|
| I-ID-1 | High-γ = QM | CONJECTURE |
| I-ID-2 | Low-γ = GR | SPECULATION |
| I-ID-5 | Γ = geometry | CONJECTURE |
| I-STRUCT-3 | β-function running | BORROWED |

**Count**: 4 interpretive claims

---

## 5. Dependency Graph

```
Layer 0 (Axioms)
    │
    ├── Layer 1 (Math) ─── [constrains almost nothing]
    │
    └── Layer 2 (Imports)
            │
            ├── Dimensional [I-DIM-*]
            │       │
            │       └── Fixes gauge structure
            │
            ├── Scale [I-SCALE-*]
            │       │
            │       └── Fixes physical constants
            │
            ├── Structural [I-STRUCT-*]
            │       │
            │       └── Fixes dynamics
            │
            └── Identification [I-ID-*]
                    │
                    └── Fixes interpretation
                            │
                            v
                    Layer 3 (Predictions)
```

---

## 6. What Would Reduce Import Count?

### 6.1 Possible Derivations (If We Find Mechanisms)

| Import | Potential Derivation | Difficulty |
|--------|---------------------|------------|
| n_space = 3 | Stability analysis | HIGH |
| n_color = 3 | Match to n_space? | MEDIUM (but numerology risk) |
| n_weak = 2 | Anomaly cancellation given n_color | MEDIUM |
| \|Π\| | Self-consistency of horizon | HIGH |
| sin²θ_W = 3/8 | Pure dimension counting | MEDIUM |
| 𝔽 = ℂ | Interference requires it | LOW (maybe derivable) |

### 6.2 What Cannot Be Derived

| Import | Why Not Derivable |
|--------|-------------------|
| Lorentz signature | Requires spacetime axiom |
| Specific gauge groups | Layer 0 allows arbitrary |
| Physical constants | No numerics in axioms |

---

## 7. Comparison: Imports vs. Standard Model Parameters

**Standard Model**: ~19 free parameters (excluding neutrinos)
- 3 gauge couplings (g₁, g₂, g₃)
- 6 quark masses
- 3 lepton masses
- 4 CKM parameters
- 2 Higgs parameters
- 1 θ_QCD

**Perspective Framework**: ~10 essential imports
- But many are structural (dimensions) not numerical
- Numerical predictions (if any) should emerge from imports

**Honest assessment**: We don't have fewer parameters — we have different parameters. The imports are just as arbitrary as SM parameters until we derive them.

---

## 8. The Central Problem

### The Gap

Layer 0 + Layer 1 = Almost nothing constrained

Layer 2 = Everything we need for physics

**This is the problem**: The "derivations" mostly happen in the imports, not the axioms.

### What Would Change This?

1. **Derive n_space = 3** from stability → Huge win
2. **Derive |Π|** from self-consistency → Huge win
3. **Derive sin²θ_W** from dimension counting → Meaningful
4. **Derive 𝔽 = ℂ** from interference requirement → Nice

Until these are achieved, the framework is a **repackaging** of known physics, not a derivation from first principles.

---

## 9. Summary

### What This Document Establishes

1. **10 essential imports** are required for physics
2. **5 convenient imports** simplify the framework
3. **1 import is potentially testable** (sin²θ_W)
4. **4 interpretive claims** connect math to physics
5. **Layer 0 axioms derive none of these** — they are assumptions

### The Honest Conclusion

The Perspective Framework does not currently derive physics from perspective.

It **organizes** physics using perspective language, with every physical value imported from observation, SM, or GUT.

The framework would become interesting if:
- Any import could be derived from Layer 0
- Predictions differed from SM and were confirmed
- The organizational structure revealed new connections

Currently: **Reorganization, not derivation.**

---

*This is Layer 2: Explicit catalog of all physics imports.*
*For predictions, see Layer 3.*
*For the mathematical foundation, see Layer 0 and Layer 1.*

---

**Document version**: 1.0
**Created**: 2026-01-26
**Depends on**: framework/layer_0_pure_axioms.md, framework/layer_1_mathematics.md
**References**: references/standard_model_reference.md
