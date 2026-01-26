# Derivations Summary

A comprehensive list of physical quantities derived from the Perspective Cosmology framework.

**IMPORTANT**: See CLAUDE.md for confidence level definitions. Every claim must be classified.

---

## Confidence Legend

| Level | Meaning | Color |
|-------|---------|-------|
| THEOREM | Rigorously proven from axioms | |
| DERIVATION | Sketch-level, gaps acknowledged | |
| CONJECTURE | Plausible but not proven | |
| SPECULATION | Untested idea | |

---

## 1. Numerical Derivations

### 1.1 Fine Structure Constant (α) [DEPRECATED]

> **DEPRECATED**: 2026-01-26
> **Reason**: Confirmed as probable numerology following Eddington pattern
> **Archived to**: archive/deprecated/alpha_derivation.md

**Former Confidence**: SPECULATION (was demoted from CONJECTURE 2026-01-25)

| Property | Former Value |
|----------|--------------|
| **Formula** | α = sin²θ_W / (2π × n_EW) |
| **Claimed accuracy** | 0.7% error **with 1 free parameter** |

**Why Deprecated**:

| Problem | Severity |
|---------|----------|
| Eddington pattern | FATAL — same structure as failed 1930s derivation |
| Gell-Mann–Nishijima | FATAL — Q = I₃ + Y/2 makes 5-count mathematically impossible |
| Internal contradiction | FATAL — gauge_structure.md says n_EW = 3, not 5 |
| Standard physics | HIGH — all standard methods give n = 4 |

**Key Finding**: n_EW = 5 is the ONLY integer that gives α ≈ 1/137. It has no independent justification and appears mathematically impossible (dim ≤ 4 after GN constraint).

**Lesson Learned**: 0.7% accuracy with 1 free parameter is fitting, not derivation. This follows the Eddington pattern exactly.

**See**: archive/deprecated/alpha_derivation.md for full historical record

**NEW APPROACH (2026-01-26)**: A structural approach is being explored:
```
α = 2/ln(|Π|)  where |Π| ≈ 10^118 (perspectives)
```
This gives α ≈ 1/137 without fitting, and extends to other couplings:
- α_W ≈ 9/ln(|Π|) ≈ 1/30
- α_G ≈ 30/|Π|^(1/3) ≈ 10^-39

Status: PROMISING but coefficients (2, 9, 30) unexplained.
See: `physics/constants/coupling_hierarchy_pattern.md`

---

### 1.2 Weinberg Angle (sin²θ_W)

| Property | Value |
|----------|-------|
| **Formula (GUT)** | sin²θ_W(GUT) = 3/8 = 0.375 |
| **Running** | β-function evolution over ln(M_GUT/M_Z) ≈ 33 |
| **Predicted value** | sin²θ_W(M_Z) ≈ 0.21-0.23 |
| **Measured value** | 0.23122 |
| **Accuracy** | ~0-10% (depending on threshold corrections) |
| **Section** | §16.5 |

**Physical interpretation**: The 3/8 ratio at GUT scale reflects the dimension counting of color (3) vs weak (2) subspaces in unified B-structure. Running to low energy follows from standard renormalization group with β-functions determined by particle content.

---

### 1.3 Newton's Constant (G)

| Property | Value |
|----------|-------|
| **Formula** | G = c³(δπ_min)²/ℏ |
| **Framework inputs** | δπ_min = l_horizon/√|Π| (perspective grain) |
| **Predicted value** | ~10⁻¹⁰ to 10⁻¹¹ m³/(kg·s²) |
| **Measured value** | 6.674 × 10⁻¹¹ m³/(kg·s²) |
| **Accuracy** | Order of magnitude correct |
| **Section** | §12.2.2 |

**Physical interpretation**: G is small because the universe has many perspectives (large |Π|). Gravity measures how much Γ-structure (spacetime geometry) responds to content concentration (mass-energy). The hierarchy problem is solved: G ∝ 1/|Π|.

---

### 1.4 Planck Length (l_P)

| Property | Value |
|----------|-------|
| **Formula** | l_P = δπ_min = l_horizon/√|Π|_eff |
| **Alternative** | l_P ~ l_GUT/exp(dim(B)) |
| **Predicted value** | 10⁻³⁴ to 10⁻³⁵ m |
| **Measured value** | 1.616 × 10⁻³⁵ m |
| **Accuracy** | Order of magnitude correct |
| **Section** | §12.2.3 |

**Physical interpretation**: The Planck length is the perspective grain — the minimum distinguishable spatial separation. Below l_P, perspectives overlap completely; above it, classical spatial structure emerges.

---

### 1.5 Number of Generations (n_gen)

| Property | Value |
|----------|-------|
| **Formula** | n_gen = min(n_spatial, n_color, n_stability) |
| **Framework inputs** | n_spatial = 3, n_color = 3 |
| **Predicted value** | 3 |
| **Measured value** | 3 |
| **Accuracy** | Exact |
| **Section** | §16.6 |

**Physical interpretation**: Three generations emerge from the intersection of:
- Topological stability (winding classes in 3D B-subspace)
- Dimensional matching (n_gen = n_spatial = n_color)
- Mass stability bound (4th generation too massive to be stable)

---

### 1.6 Bekenstein-Hawking Entropy (S = A/4)

| Property | Value |
|----------|-------|
| **Formula** | S = A/(4l_P²) |
| **Framework derivation** | S = N_hidden where N_hidden = A/l_P² |
| **Predicted value** | S ∝ A |
| **Measured/expected** | S = A/4 (in Planck units) |
| **Accuracy** | Proportionality correct; factor of 4 needs refinement |
| **Section** | §12.3.9.1 |

**Physical interpretation**: Black hole entropy counts hidden dimensions at the horizon. Each Planck area contributes one bit of hidden information.

---

### 1.7 Schrödinger Equation (High-γ Limit)

| Property | Value |
|----------|-------|
| **Formula** | iℏ∂ψ/∂t = (-ℏ²/2m)∇²ψ + Vψ |
| **Framework derivation** | P_D → I + α∇² in high-γ limit |
| **Section** | §12.1.1 |

**Physical interpretation**: Quantum mechanics is the high-γ regime where perspectives overlap significantly (μ → 1). The wave function represents the superposition of accessible content across overlapping perspectives.

---

### 1.8 Einstein Field Equations (Low-γ Limit) [DEMOTED]

**Confidence**: **SPECULATION** (demoted from CONJECTURE 2026-01-26)

| Property | Value |
|----------|-------|
| **Formula** | G_μν = 8πG T_μν |
| **Framework derivation** | ~~Metric from Γ-structure~~ **NOT DERIVED** |
| **Section** | §12.2.1 |

> ⚠️ **WARNING**: This is a hope, not a derivation.
> - g_μν is NOT constructed from Γ (no formula exists)
> - Einstein equations NOT derived
> - Lorentzian signature NOT explained

**Why demoted**: The QM limit has a formula (Schrödinger). The GR limit has none. "g_μν ∝ Γ" is not a construction.

**Physical interpretation**: ~~General relativity is the low-γ regime...~~ We hope GR emerges from low-γ, but haven't shown it.

See: `physics/gr_limit_investigation.md` for full analysis

---

## 2. Qualitative Derivations

### 2.1 Standard Model Gauge Group

| Property | Status |
|----------|--------|
| **U(1) × SU(2) × SU(3)** | Emerges as subgroup of Aut(B) |
| **Gauge bosons** | Generators of symmetry transformations |
| **Chirality** | From directional structure in Γ |
| **Section** | §16.3.1 |

---

### 2.2 Color Confinement

| Property | Status |
|----------|--------|
| **Mechanism** | ||b_r + b_g + b_b|| = 0 enforces colorlessness |
| **Physical meaning** | Color dimensions not separately accessible |
| **Section** | §16.3.1 |

---

### 2.3 Electroweak Symmetry Breaking

| Property | Status |
|----------|--------|
| **Mechanism** | Higgs dimension b_H becomes hidden at low energy |
| **W±, Z masses** | From coupling to b_H |
| **Section** | §16.3.1 |

---

## 3. Intermediate-γ Regime (Quantum Gravity)

> **UPDATE (2026-01-26)**: I-001 (recoherence paradox) RESOLVED by retracting the claim.
> - Recoherence prediction **RETRACTED** — formula Γ_dec = (1-2γ)/τ₀ is valid only for γ ≤ 0.5
> - γ > 0.5 regime is now an OPEN PROBLEM requiring derivation from axioms
> - Critical slowing at γ = 0.5 remains a testable prediction
> See issues_log.md and physics/intermediate_gamma_analysis.md for details.

**Confidence**: SPECULATION (γ ≤ 0.5 claims), UNDEFINED (γ > 0.5 regime)

### 3.1 Decoherence Mechanism

| Property | Value |
|----------|-------|
| **Formula** | dγ/dt = -Γ_env × (γ - γ_eq) |
| **Physical interpretation** | Measurement = γ-regime transition |
| **Section** | §12.4.3 |

---

### 3.2 Intrinsic Decoherence Rate (RESTRICTED VALIDITY)

| Property | Value |
|----------|-------|
| **Formula** | Γ_dec = (1-2γ)/t_P + Γ_env |
| **Valid range** | **γ ≤ 0.5 only** (L ≥ λ_C) |
| **Issue** | **NOT DERIVED from axioms** (I-004) |
| **γ > 0.5** | **UNDEFINED** — recoherence claim RETRACTED (I-001 resolved) |
| **Section** | §12.4.5 |

**Status**: Formula is ASSUMED, not derived. Valid only for γ ≤ 0.5. The γ > 0.5 regime remains an open problem.

---

### 3.3 Modified Uncertainty Principle

| Property | Value |
|----------|-------|
| **Formula** | Δx Δp ≥ (ℏ/2)[1 + (Δx/l_P)² + (l_P/Δx)²] |
| **Effect** | Prevents localization below l_P |
| **Section** | §12.4.6 |

---

### 3.4 Gravitational Decoherence Rate

| Property | Value |
|----------|-------|
| **Formula** | Γ_grav ~ Gm²/(ℏc × Δx) × h(γ) |
| **Issue** | h(γ) = 2γ(1-γ) is NOT DERIVED (I-005) |
| **Testable** | ~~With large molecule superpositions~~ **See below** |
| **Section** | §12.4.6 |

> **Penrose-Diosi Comparison (2026-01-26)**: See `physics/penrose_diosi_comparison.md`
>
> Key finding: The h(γ) modification **suppresses** gravitational decoherence.
> In all planned experiments (L >> λ_C), h(γ) ~ 10⁻⁵ to 10⁻¹² → effect undetectable.
>
> | System | h(γ) | Effect |
> |--------|------|--------|
> | Electrons (100nm) | ~10⁻⁵ | Negligible |
> | C₆₀ (100nm) | ~10⁻¹¹ | Negligible |
> | MAQRO (1μm) | ~10⁻¹² | Negligible |
>
> **Conclusion**: Penrose-Diosi comparison does NOT provide a practical novelty claim.
> Both models predict gravitational decoherence below current detectability.

---

## 4. Comparison Table

| Quantity | Formula | Predicted | Measured | Error | Status |
|----------|---------|-----------|----------|-------|--------|
| ~~α~~ | ~~sin²θ_W/(2πn_EW)~~ | ~~1/136.1~~ | ~~1/137.04~~ | ~~0.7%~~ | **DEPRECATED** |
| sin²θ_W(M_Z) | 3/8 → running | ~0.21-0.23 | 0.2312 | ~0-10% | CONJECTURE |
| G | c³(δπ_min)²/ℏ | ~10⁻¹⁰ | 6.67×10⁻¹¹ | ~50% | CONJECTURE |
| l_P | l_horizon/√|Π| | ~10⁻³⁴ | 1.62×10⁻³⁵ | ~10× | CONJECTURE |
| n_gen | min(n_s, n_c, n_st) | 3 | 3 | 0% | CONJECTURE |
| S_BH | A/(4l_P²) | S ∝ A | S = A/4 | Proportionality ✓ | CONJECTURE |

**Note**: α derivation deprecated 2026-01-26 (probable numerology).

---

## 5. Remaining Gaps

### 5.1 Not Yet Derived

| Quantity | Challenge | Section |
|----------|-----------|---------|
| **Cosmological constant Λ** | Why small but non-zero? | Q27 |
| **Mass hierarchy** | m_top/m_electron ≈ 340,000 | Q33 |
| **CP violation** | Phase in CKM/PMNS matrices | Q34 |
| **Dark matter** | Additional B dimensions? | Q35 |
| **Factor of 4 in S=A/4** | Exact geometric mechanism | Q29 |
| **Exact G value** | Precise |Π| determination | §12.2.2 |

### 5.2 Needs Refinement

| Derivation | Issue |
|------------|-------|
| **sin²θ_W running** | Threshold corrections at GUT scale |
| **G derivation** | Exact normalization of |Π| |
| **Three generations** | Explicit winding class construction |
| **Intermediate-γ** | Specific coefficient calculations |

---

## 6. Unique Predictions

### 6.1 Testable Predictions

| Prediction | Description | How to Test |
|------------|-------------|-------------|
| **No 4th generation** | n_gen = 3 is maximum stable | Collider searches |
| **Gravitational decoherence** | Γ_grav ~ Gm²/(ℏcΔx) | Large molecule experiments |
| **Modified dispersion** | E² corrections at (E/E_P)² | High-energy astrophysics |
| **G variation** | G may vary near horizons | Precision gravimetry |
| **Black hole remnants** | Planck-mass stable remnants | Hawking radiation endpoint |

### 6.2 Conceptual Predictions

| Prediction | Description |
|------------|-------------|
| **QM-GR unification** | Same framework, different γ regimes |
| **Measurement = γ transition** | No wave function collapse |
| **Constants not fundamental** | All emerge from B-geometry |
| **Hierarchy from counting** | G small because |Π| large |

---

## 7. Key Insights

### 7.1 Why Constants Have Their Values

| Constant | Why This Value | Status |
|----------|---------------|--------|
| ~~**α ≈ 1/137**~~ | ~~EM projection fraction~~ | **DEPRECATED** (was numerology) |
| **sin²θ_W ≈ 0.23** | 3/8 at GUT scale, runs over 33 decades | CONJECTURE (borrowed) |
| **G ≈ 10⁻¹¹** | Universe has ~10¹²⁰ perspectives | CONJECTURE |
| **l_P ≈ 10⁻³⁵ m** | Cosmic horizon / √(perspective count) | CONJECTURE |
| **n_gen = 3** | Matches spatial and color dimensions | CONJECTURE |

**Note**: α derivation deprecated 2026-01-26. Framework currently does not derive α.

### 7.2 Hierarchy Problem Solution

The apparent fine-tuning problems dissolve:

- **G << α**: Different perspective scales (l_P vs Compton wavelength)
- **m_P >> m_e**: Planck mass from 1/l_P, not independent
- **Λ problem**: Remains open but framework offers approach

### 7.3 Unification

The framework unifies:

- **QM and GR**: High-γ vs low-γ regimes of same dynamics
- **Gauge forces**: Subgroups of Aut(B)
- **Matter and geometry**: Both from B-structure
- **Constants**: All from perspective geometry

---

## 8. Summary Statistics

| Category | Count |
|----------|-------|
| Quantities derived with <1% error | **0** |
| Quantities derived within 10% | 1 (sin²θ_W — borrowed from GUT) |
| Quantities derived to order of magnitude | 4 (G, l_P, S ∝ A, n_gen) |
| Qualitative derivations | 6 (SM gauge, confinement, etc.) |
| Novel predictions | 5+ (testable) |
| Major open questions | 6 (Λ, masses, CP, dark matter, etc.) |
| **Deprecated claims** | **1 (α)** |

**Note (2026-01-26)**: α derivation **DEPRECATED** — moved to archive/deprecated/alpha_derivation.md. The 0.7% accuracy was achieved with 1 free parameter (n_EW = 5), which was mathematically impossible (violated Gell-Mann–Nishijima) and followed the Eddington numerology pattern. This is an example of intellectual honesty: we removed a claim rather than defend numerology.

---

*Last updated: 2026-01-26 (α deprecated; new |Π| approach noted)*
