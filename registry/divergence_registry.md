# Divergence Registry

**Purpose**: Track where Perspective Cosmology differs from standard physics. These might be:
- Predictions worth testing
- Errors needing correction
- Hints about missing framework elements
- Genuinely novel insights

**DO NOT DISCARD** until evaluated by someone with physics expertise.

---

## Classification

| Type | Meaning |
|------|---------|
| **PREDICTION** | Framework says X, standard physics doesn't; testable |
| **PATTERN** | Framework finds pattern; standard physics has no explanation |
| **TENSION** | Framework implies X, but X seems inconsistent |
| **UNEXPLORED** | Framework might address this, but we haven't tried |

---

## D1: Log vs Power Scaling of Couplings

**Type**: PATTERN

**What we find**:
```
α   = 2/ln|Π|       ≈ 1/137    (logarithmic)
α_W = 9/ln|Π|       ≈ 1/30     (logarithmic)
α_G = 30/|Π|^(1/3)  ≈ 10^-39   (power law)
```

**Why this matters**:
- Explains 10^37 hierarchy between gravity and EM
- Single parameter |Π| for all couplings
- Different functional forms, not just different values

**Standard physics says**: Couplings are independent or unify at GUT scale through RG flow

**Questions for physicist**:
1. Is there any known reason log vs power should differ for gravity?
2. Does RG flow support or contradict this pattern?
3. Is |Π| ≈ 10^118 meaningful cosmologically?

**Status**: Most promising contribution if real

---

## D2: sin²θ_W from Goldstone Fraction (UPDATED S160)

**Type**: PATTERN → DERIVATION

**What we find** (Sessions 151-160):
```
sin²θ_W = n_d × Im_O / n_c² = 28/121 = 0.23140
MS-bar measured: 0.23122 ± 0.00003 (843 ppm)

Where:
  28 = N_Goldstone(SO(11) → SO(4)×SO(7)) = n_d × Im_O
  121 = n_c² = total modes in U(n_c)
```

**Why this matters**:
- 28 has structural origin: Goldstone bosons of the SO(11) breaking
- Not numerology — 28 = 4×7 from defect×internal dimensions
- GUT trace gives 1/2 or 3/8, NEVER 28/121 (S158: GUT trace CLOSED)
- Mechanism: democratic mode counting in U(11), not RG running

**Also found**:
- S_2 = 29 from Complex Bridge Principle (S159)
- Alternative: 29/126 = 0.2302 (460 ppm) — brackets measured value with 28/121
- cos(θ_W) on-shell = 171/194 (3.75 ppm, S111)
- 7% discrepancy in 1/α_2 RESOLVED as scale confusion: α(0) vs α(M_Z) (S160)

**Standard physics says**: sin²θ_W = 3/8 at GUT scale, runs to ~0.23 via RG

**Open questions**:
1. Physical mechanism for WHY sin² = Goldstone fraction
2. Which scheme does 28/121 correspond to exactly?
3. Derive counting from tilt Lagrangian one-loop calculation

**Status**: DERIVATION — structural origin established, mechanism partial

---

## D3: γ-Transition at Compton Wavelength

**Type**: PREDICTION (if formulas were derived)

**What we claim**:
```
γ(m, L) = λ_C / (λ_C + L)

At L = λ_C: γ = 0.5 (critical point)
- γ > 0.5: "quantum regime" (L < λ_C)
- γ < 0.5: "classical regime" (L > λ_C)
```

**Why this matters**:
- Compton wavelength as fundamental transition scale
- Not just "quantum vs classical" but specific transition point
- Would predict anomalies at L ~ λ_C

**Standard physics says**: No special transition at Compton wavelength

**Questions for physicist**:
1. Is there any hint of Compton-scale physics in decoherence?
2. Does the Compton wavelength appear in any transition phenomena?
3. Is this testable with current technology?

**Status**: Interesting but formula is ansatz

---

## D4: Gravity from "Different Content"

**Type**: UNEXPLORED

**What we suggest**:
```
Γ_grav ∝ h(γ) where h(γ) = 2γ(1-γ)

Physical meaning: Gravity requires BOTH shared and different content
- Shared content: common reference frame (proportion γ)
- Different content: what gravitationally decoheres (proportion 1-γ)
```

**Why this matters**:
- Gravity isn't just "mass attracts mass"
- Requires relationship between perspectives
- Would explain why gravity is relational

**Standard physics says**: Gravity couples to stress-energy tensor

**Questions for physicist**:
1. Is there a relational interpretation of gravity consistent with GR?
2. Does this relate to Mach's principle?
3. How would this connect to diffeomorphism invariance?

**Status**: Conceptually interesting, no derivation

---

## D5: α from Born Rule on Interface Modes (UPDATED S173)

**Type**: DERIVATION (multi-layer support)

**Current understanding** (Sessions 145-173):
```
1/α = N_I = n_d² + n_c² = 4² + 11² = 137  (integer part)
Correction: 4/111 = n_d/Φ₆(n_c)            (from Lie algebra of u(11))
Full: 1/α = 137 + 4/111 = 15211/111         (0.27 ppm accuracy)
```

**Multi-layer derivation chain**:
1. **Mode counting** (S164): 137 = 16 (defect Herm(4)) + 121 (crystal u(11)) interface modes
2. **Counting metric** (S165): Hilbert-Schmidt inner product → all modes unit norm
3. **Uniformity** (S165): Max entropy ρ = I/N_I → equal probability per mode
4. **Born rule** (S173): Wright-Fisher uniqueness → P = 1/N_I per crystallization event
5. **Correction** (S89): 111 = EM channels in u(11) → 4/111 from Lie algebra

**What's new since S142**:
- Counting metric derived from AXM_0110 (not assumed) — S165
- Born rule proven UNIQUE and ROBUST from axioms — S173
- Single-photon tilt formalized as THM_04A2 — S164
- 5-category constant taxonomy distinguishing mechanism types — S164

**Standard physics says**: α is a free parameter of the Standard Model, not derivable.

**Open questions**:
1. Gauge kinetic term normalization (Step 5 gap, grade D+)
2. Why EM specifically (photon identification)
3. Composite gauge field construction

**Status**: DERIVATION — strongest single result; 0.27 ppm with zero free parameters

**See**: `framework/investigations/alpha/` directory, THM_04A2

---

## D6: Static |Π| (Block Universe)

**Type**: PREDICTION (from constraint)

**What we find**:
```
If |Π| varied cosmologically:
- α would vary: Δα/α ~ 10^-2 over cosmic time
- Ruled out by observation (< 10^-5)

Therefore: |Π| must be cosmologically static
```

**Why this matters**:
- Framework predicts block universe interpretation
- |Π| is total (past + present + future)
- Not compatible with "expanding perspective count"

**Standard physics says**: Block universe is one interpretation, not a prediction

**Questions for physicist**:
1. Is this a genuine prediction or just consistency?
2. Does block universe have other testable consequences?
3. How does this relate to time in GR?

**Status**: Interesting but may be trivial

---

## D7: Three Generations from Dimension Matching

**Type**: PATTERN (weak)

**What we claim**:
```
n_gen = min(n_spatial, n_color, n_stability) = 3
```

**Why this matters**:
- Would explain why exactly 3 generations
- Connects to spatial dimension count

**Standard physics says**: Number of generations unexplained, but constrained by anomaly cancellation

**Questions for physicist**:
1. Is there a known relationship between n_gen and dimension?
2. Does anomaly cancellation relate to our argument?
3. What would 4th generation imply?

**Status**: Weak argument, not derivation

---

## D8: Product Relation α_G × α_W × |Π|^(1/3) ≈ 1

**Type**: PATTERN

**What we find**:
```
α_G × α_W × |Π|^(1/3) = (5.9×10^-39) × (1/30) × (10^40) ≈ 2
```

**Why this matters**:
- Connects gravity and weak force through |Π|
- Within factor of 2 of unity
- Would be exact if formulas are right

**Standard physics says**: No such relation

**Questions for physicist**:
1. Is this known or novel?
2. Is factor of 2 significant or within uncertainty?
3. Does GUT unification predict any such relation?

**Status**: Derived from coupling pattern; not independent

---

## D9: Decoherence Suppression at Small Scales

**Type**: PREDICTION (if h(γ) were derived)

**What we find**:
```
Γ_grav = Γ_standard × h(γ) where h(γ) → 0 as L << λ_C
```

**Why this matters**:
- Gravitational decoherence suppressed at quantum scales
- Differs from Penrose-Diosi (which has no such suppression)
- But suppression makes framework LESS testable

**Standard physics says**: Penrose-Diosi has no γ-dependent suppression

**Questions for physicist**:
1. Is suppression at small scales physically reasonable?
2. Does this relate to UV/IR mixing in QG?
3. Is there any way to test this suppression?

**Status**: Might be important, might be artifact

---

## D10: Intrinsic Time Scale τ₀ from |Π|

**Type**: UNEXPLORED

**What we find** (partial):
```
τ₀ ~ t_H / √|Π| ≈ 10^-42 s (within ~20× of t_P)
```

**Why this matters**:
- Would derive Planck time from cosmological |Π|
- Connects microscopic and cosmological scales
- Not quite right (factor of 20), but suggestive

**Questions for physicist**:
1. Is t_H/√|Π| meaningful?
2. Does this relate to holographic bounds?
3. What would fix the factor of 20?

**Status**: Suggestive but not exact

---

## D11: SM Gauge Group from Division Algebra Geometry (NEW S174)

**Type**: PREDICTION (structural derivation)

**What we find** (Sessions 168, 174):
```
F = C (complex structure selection) applied to SO(11) breaking:

Stage 3 (internal): G₂ → SU(3) = Stab_{G₂}(C)     [6 Goldstones]
Stage 4 (defect):   SO(4) → U(2) = SU(2)₋ × U(1)_J [2 Goldstones]

Result: SU(3)_c × SU(2)_L × U(1)_Y
dim = 8 + 3 + 1 = 12 = n_c + 1
```

**Why this matters**:
- SM gauge group DERIVED from axioms, not assumed
- Eigenvalue selection (b₂<0) gives SU(3), not other subgroups
- Parity violation from oriented complex structure (geometric origin)
- F=C Goldstones total 8 = dim(O) — structural consistency
- n_c + 1 = 12 appears as gauge dimension — unexplained but striking

**Standard physics says**: SM gauge group is empirical input, various GUT proposals exist

**Status**: DERIVATION — complete chain from Frobenius → n_d=4 → Herm(4) → SU(3)×SU(2)×U(1)

---

## D12: EWSB from Pseudo-Nambu-Goldstone Higgs (NEW S175)

**Type**: PREDICTION (mechanism differs from SM)

**What we find** (Session 175):
```
ε_di (defect-internal block): 4×7 = 28 modes = n_d × Im_O

Decomposition under SU(3) × SU(2) × U(1):
  (2,3)_{-1} + conj:  12 DOF [colored]
  (2,3̄)_{-1} + conj:  12 DOF [colored]
  (2,1)_{Y=1/2} + conj: 4 DOF [THE HIGGS]

VEV ⟨H⟩ = (0,v): breaks SU(2)×U(1) → U(1)_EM
  3 massive (W⁺, W⁻, Z) + 1 massless (γ) + 1 physical Higgs
```

**Why this matters**:
- Higgs is pNGB from SO(11) → SO(4)×SO(7) breaking, not fundamental scalar
- Mass from Coleman-Weinberg mechanism (SM gauge loops), not elementary potential
- Predicts 24 COLORED pseudo-Goldstones at accessible energies
- Hypercharge Y = 1/2 derived from U(1)_J normalization, not assumed

**Standard physics says**: Higgs is fundamental scalar; pNGB scenarios exist but aren't confirmed

**Testable difference**: Colored pNGBs should appear at LHC/FCC if mechanism is correct

**Status**: DERIVATION — quantum numbers match SM, mechanism differs

---

## D13: Born Rule from Axiomatic Uniqueness (NEW S173)

**Type**: PREDICTION (Born rule derived, not postulated)

**What we find** (Sessions 165, 173):
```
Axiom chain: AXM_0110 (orthonormal) + AXM_0112 (face invariance) + exchangeability

→ Hilbert-Schmidt counting metric (unique from AXM_0110)
→ Wright-Fisher diffusion (unique degree-2 face-invariant exchangeable noise)
→ Born rule P(outcome i) = p_i (robust to any noise amplitude)
```

**Why this matters**:
- Born rule is DERIVED, not postulated — reduces QM axiom count
- Wright-Fisher is UNIQUE (proven, not just consistent)
- Robustness: Born rule holds for ANY diffusion coefficient (backward Kolmogorov)
- Degree-3 corrections exist but don't affect measurement probabilities

**Standard physics says**: Born rule is a postulate of quantum mechanics

**Questions for physicist**:
1. Is this genuinely novel or does it recapitulate known results (Zurek, etc.)?
2. Does the face-invariance condition have a physical interpretation?
3. Are the degree-3 corrections experimentally accessible?

**Status**: DERIVATION — mathematically rigorous, physical interpretation needs validation

---

## D14: Hilltop Inflation from Crystallization Potential (NEW S133)

**Type**: PREDICTION (specific inflationary model)

**What we find** (Sessions 129, 133):
```
V(ε) = -a·ε² + b·ε⁴  (Mexican hat from crystallization)

With b = α M_Pl⁴ (S133, S172):
  r = 0.035 = 7/200  (tensor-to-scalar ratio)
  n_s = 193/200 = 0.965  (spectral index)

Hilltop inflation near ε = 0 (pre-crystallization maximum)
```

**Why this matters**:
- r = 0.035 is a SPECIFIC prediction (not a range)
- Just below current bound r < 0.036 (BICEP/Keck 2021)
- CMB-S4 and LiteBIRD will test to r ~ 0.001 sensitivity
- If confirmed: validates crystallization as physical transition
- If ruled out: FALSIFIES framework's inflationary sector

**Standard physics says**: Many inflationary models predict different r values; no consensus

**Status**: PREDICTION — KEY FALSIFICATION TEST (Tier A)

---

## D15: Neutrino Mass Ratios from Octonion Algebra (NEW S167)

**Type**: PREDICTION (specific numerical values)

**What we find** (Session 167):
```
R₃₁ = Δm²₃₁/Δm²₂₁ = Im_H × n_c = 33
  Measured: 33.58 ± 0.93 (1.7%, 0.6σ)

R₃₂ = Δm²₃₂/Δm²₂₁ = H × O = 32
  Measured: 32.58 (1.8%, 0.6σ)
```

**Key algebraic result**: Fano plane generation coupling C_ij = 4×I₃. Generation symmetry is exact in the algebra — mass ratios must come from crystallization dynamics, not algebraic structure alone.

**Why this matters**:
- Normal mass ordering PREDICTED (not assumed)
- Integer mass-squared ratios are unusual in any theory
- JUNO will measure R₃₁ to ~1% precision by ~2028
- 33 = Im_H × n_c is a natural framework composite

**Standard physics says**: Mass ratios are free parameters; no algebraic prediction exists

**Status**: CONJECTURE — awaiting JUNO precision measurement

---

## D16: Democratic Mode Counting vs RG Running (NEW S158-S164)

**Type**: PATTERN (alternative to standard unification narrative)

**What we find** (Sessions 158-164):
```
Standard GUT: Couplings unify at ~10¹⁶ GeV via RG running
Framework:     Couplings come from mode counting at crystallization scale

sin²θ_W = 28/121 = Goldstone_fraction  (NOT from RG running)
1/α_s ≈ O = 8 = dim(O)                 (NOT from asymptotic freedom)
β₀ = 33 = Im_H × n_c                   (QCD β function matches algebra)
```

**Why this matters**:
- GUT trace formula gives 1/2 or 3/8, never 28/121 (S158)
- Democratic counting is NOT standard one-loop running (S160)
- Two regimes: EW uses Goldstone fractions, Strong uses group dimensions
- If correct: standard grand unification narrative is wrong

**Standard physics says**: Couplings unify at GUT scale via RG flow

**Questions for physicist**:
1. Can crystallization-scale mode counting reproduce RG running appearance?
2. Is there a known mechanism for "democratic" coupling generation?
3. Could both be true (mode counting at UV, running to IR)?

**Status**: CONJECTURE — structurally consistent but mechanism not complete

---

## D17: Crystallization as Universal Phase Transition (NEW S169, S172)

**Type**: PATTERN (unified framework for SM physics)

**What we find** (Sessions 150, 169, 171-172):
```
9 crystallization types unified:
  Π_gen = f_ch × (-dW/dε) × Ω(geometry)

Key results:
  ε*_portal = α² (cosmological probability)
  ε*_MH = α (local dynamics amplitude)
  b = M_Pl⁴/N_I = α M_Pl⁴ (democratic quartic)

Portal probability = (local amplitude)² — mirrors Born rule!
```

**Why this matters**:
- Unifies Casimir effect, gauge coupling, vacuum energy, EWSB into one mechanism
- Democratic principle: same ratio 1/N_I for gauge coupling AND quartic coefficient
- ε² = P (probability = amplitude squared) appears naturally

**Standard physics says**: These are separate phenomena with distinct explanations

**Status**: CONJECTURE — unification suggestive, full derivation incomplete

---

## D18: QFT Coefficients as Division Algebra Numbers (NEW S152, S163)

**Type**: PATTERN (QCD coefficients match framework numbers)

**What we find** (Sessions 152, 163):
```
QCD beta function:
  b₀ (pure glue) = 33 = Im_H × n_c
  b₀ (N_f=6) = 7 = Im_O
  b₁ (pure glue) = 153 = Im_H² × 17

Gauge self-coupling: 11/3 = n_c/Im_H
Matter coupling:     4/3 = n_d/Im_H
b₃ (strong running): -7 = -(n_c - n_d) = -Im_O

Luscher term: π/(24r) where 24 = O × Im_H = n_d!
Hadronization: O-channel entropy conservation (dim(O)=8 species map)
```

**Why this matters**:
- Standard QFT coefficients decompose into division algebra dimensions
- These are KNOWN numbers rewritten — not predictions
- But the decomposition is non-trivial and consistent across multiple quantities
- If structural: suggests QCD "knows about" division algebras at a deep level

**Standard physics says**: These coefficients come from Feynman diagram counting

**Questions for physicist**:
1. Is this decomposition unique or can any set of small integers be written this way?
2. Is there a theoretical reason for N_c/N_f to relate to division algebra dimensions?
3. Does this connect to existing work on octonions and the Standard Model?

**Status**: PATTERN — suggestive but may be numerological

---

## Summary: What to Preserve

### Tier 1: Strongest Divergences (testable, structural)
- **D5**: α from Born rule on interface modes — 0.27 ppm, multi-layer derivation
- **D2**: sin²θ_W = 28/121 from Goldstone fraction — 843 ppm, structural origin
- **D11**: SM gauge group from F=C on SO(11) — complete derivation chain
- **D12**: EWSB from pNGB Higgs — testable via colored pNGBs
- **D14**: r = 0.035 hilltop inflation — KEY falsification test
- **D13**: Born rule from axiomatic uniqueness — reduces QM axiom count

### Tier 2: Strong Patterns (not yet testable)
- **D1**: Log vs power scaling — hierarchy explanation
- **D15**: Neutrino R₃₁ = 33 — awaiting JUNO precision
- **D16**: Democratic counting vs RG running — alternative to GUT narrative
- **D17**: Crystallization as universal phase transition — unifying mechanism
- **D18**: QFT coefficients as algebra numbers — suggestive but may be numerological

### Tier 3: Interesting but Weak
- **D3**: γ-transition — interesting if formulas justified
- **D4**: Relational gravity — conceptually novel
- **D8**: Product relation — follows from D1

### May be Trivial or Artifacts
- **D6**: Static |Π| — consistency rather than prediction
- **D7**: Three generations — weak argument
- **D9**: Decoherence suppression — depends on h(γ) ansatz
- **D10**: τ₀ from |Π| — approximate only

---

## The Key Question

Which of these divergences represent:
1. **Novel physics** worth pursuing — D5, D11, D12, D14 (strongest candidates)
2. **Known ideas** in different language — D13 may overlap Zurek/Deutsch
3. **Mathematical coincidences** — D18, D7, D10 (highest risk)
4. **Missing elements** that would complete the framework — D16 (mechanism gap)

A theoretical physicist could help categorize these. The framework has evolved substantially since S142: the SM gauge group and EWSB mechanism are now derived, not assumed.

---

*Last updated: 2026-02-01 (Session 177 — added D11-D18, updated D2 and D5 with S151-S175 results)*
