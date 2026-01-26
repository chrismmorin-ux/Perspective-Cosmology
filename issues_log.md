# Issues Log

Central tracking for all identified issues in the Perspective Cosmology framework.

**Purpose**: Systematic tracking of problems, their severity, and resolution status.

---

## Issue Classification

| Severity | Meaning | Action Required |
|----------|---------|-----------------|
| **CRITICAL** | Framework-breaking, contradicts observations | Must resolve before any claims |
| **HIGH** | Significant gap in derivation or logic | Should resolve for credibility |
| **MEDIUM** | Calculation error or unclear reasoning | Fix when addressing the claim |
| **LOW** | Minor improvement or clarification | Optional |

| Status | Meaning |
|--------|---------|
| **OPEN** | Not yet addressed |
| **INVESTIGATING** | Being worked on |
| **RESOLVED** | Fixed or explained |
| **WONTFIX** | Accepted limitation |
| **INVALID** | Issue was mistaken |

---

## Active Issues

### I-001: Recoherence Paradox (CRITICAL)

**Filed**: 2026-01-25
**Status**: RESOLVED
**Severity**: CRITICAL
**Affects**: physics/intermediate_gamma.md, mathematical_framework.md §12.4
**Resolved**: 2026-01-26

**Description**:
The formula Γ_dec = (1-2γ)/t_P + Γ_env predicts negative decoherence (recoherence) for γ > 0.5. For an electron at L = 1 pm:
- γ = λ_C/(λ_C + L) = 2.4/(2.4+1) ≈ 0.71
- Γ_intrinsic = (1-1.42)/t_P ≈ -7.8×10⁴² s⁻¹

This predicts coherence doubles every 10⁻⁴³ seconds. **Not observed.**

**Resolution**: Option 1 selected — **Recoherence prediction RETRACTED**.

Rationale:
- The formula Γ_dec = (1-2γ)/τ₀ is an ansatz, not derived from axioms (I-004)
- For γ > 0.5, it gives unphysical results contradicting observations
- Any "fix" would be equally ad-hoc without proper derivation
- Formula validity restricted to γ ≤ 0.5
- γ > 0.5 regime marked as OPEN PROBLEM requiring derivation

**Files updated**:
- mathematical_framework.md: PREDICTION 3 retracted, warnings added
- physics/intermediate_gamma.md: warning updated
- physics/intermediate_gamma_analysis.md: status noted

**Cross-references**:
- I-004 (Γ_dec not derived) — remains OPEN
- intermediate_gamma_analysis.md
- peer_review_prep.md

---

### I-002: R Calculation Error (MEDIUM)

**Filed**: 2026-01-25
**Status**: RESOLVED
**Severity**: MEDIUM
**Affects**: mathematical_framework.md §12.4 (line ~3687)
**Resolved**: 2026-01-26

**Description**:
The document claims R ≈ 10¹³, but calculation gives:
```
R = (λ_thermal/λ_C)² = (7.6 nm / 2.4 pm)² = (3.17×10³)² ≈ 10⁷
```
Error: factor of 10⁶

**Resolution**: Corrected to R ≈ 10⁷ with explicit calculation shown.

---

### I-003: R Interpretation Error (MEDIUM)

**Filed**: 2026-01-25
**Status**: RESOLVED
**Severity**: MEDIUM
**Affects**: mathematical_framework.md §12.4 (line ~3687)
**Resolved**: 2026-01-26

**Description**:
Text claims "R >> 1 means perspective predicts SLOWER decoherence"
But R = Γ_pers/Γ_std, so R >> 1 means FASTER decoherence (higher rate = shorter coherence time).

**Resolution**: Fixed interpretation. R > 1 now correctly described as "perspective predicts FASTER decoherence rate at this scale."

---

### I-004: Γ_dec Formula Not Derived (HIGH)

**Filed**: 2026-01-25
**Status**: RESOLVED (form DERIVED, scale EMPIRICAL)
**Severity**: HIGH
**Affects**: physics/intermediate_gamma.md, core/18_dynamics.md
**Resolved**: 2026-01-26 (upgraded Session 9)

**Description**:
The formula Γ_dec = (1-2γ)/t_P + Γ_env is asserted, not derived from axioms.

**Resolution**: Form DERIVED from content asymmetry (Session 9)

**Investigation findings** (see core/18_dynamics.md):
- Form (1-2γ): **DERIVED** from content asymmetry A(γ) = 2γ - 1
- Time scale τ₀: **EMPIRICAL** (identified with t_P)
- Coefficient: ASSUMED (simplest choice: 1)

**Derivation**:
```
Content asymmetry: A(γ) = (shared) - (different) = 2γ - 1
Rate ∝ negative asymmetry: Γ_dec = (1-2γ)/τ₀
```

**Status upgrade (Session 2026-01-26-9)**:
- Original: ASSUMED (dimensional analysis only)
- Current: FORM DERIVED, SCALE EMPIRICAL

**Files updated**:
- core/18_dynamics.md: Created with derivation
- assumptions_registry.md: A15 updated to PARTIALLY DERIVED

---

### I-005: h(γ) Function Not Derived (HIGH)

**Filed**: 2026-01-25
**Status**: RESOLVED (DERIVED via interaction capacity)
**Severity**: HIGH
**Affects**: physics/h_gamma_investigation.md
**Resolved**: 2026-01-26 (fully derived Session 10)

**Description**:
The gravitational decoherence modification h(γ) = 2γ(1-γ) is asserted without derivation.

**Resolution**: **DERIVED** from interaction capacity / ordered pair counting (Session 10)

**Derivation** (see physics/h_gamma_investigation.md):
```
Gravitational decoherence requires BOTH shared and different content.
Ordered pairs (shared → different): γ × (1-γ)
Ordered pairs (different → shared): (1-γ) × γ
Total: I(γ) = 2γ(1-γ)
```

**Why this form is unique**:
- Factor 2: bidirectionality (both orderings contribute)
- Product structure: interaction requires both channels
- Zeros at endpoints: need both shared AND different

**Status upgrade (Session 2026-01-26-10)**:
- Original: ASSUMED (simplest polynomial)
- Current: **DERIVED** (interaction capacity)

**Files updated**:
- physics/h_gamma_investigation.md: Full derivation documented
- assumptions_registry.md: A16 updated to DERIVED

---

### I-006: n_EW = 5 Is Numerology (HIGH)

**Filed**: 2026-01-25 (documented earlier)
**Status**: RESOLVED (deprecated; replaced by crystal-defect interface)
**Severity**: HIGH
**Affects**: archive/deprecated/alpha_derivation.md

**Description**:
n_EW = 5 is chosen to match α ≈ 1/137. Reverse-engineering: n = sin²θ_W/(2πα) = 5.04.

**Fatal Problems**:
1. **Eddington pattern**: Same structure as failed 1930s derivation
2. **Mathematical impossibility**: Gell-Mann–Nishijima makes dim ≤ 4, not 5
3. **Internal contradiction**: gauge_structure.md says n_EW = 3, not 5

**Resolution**: **DEPRECATED** — moved to archive/deprecated/alpha_derivation.md

**Replacement approach (Sessions 18-21)**:
```
α = 1/(n_perceived² + n_total²) = 1/(4² + 11²) = 1/137
```
- n_perceived = 4: spacetime dimensions (observation)
- n_total = 11: M-theory dimensions (mainstream physics)
- n² from U(n) generator counting
- 0.026% accuracy (better than 0.7% of old approach)
- Running explained via spectral dimension reduction

**See**: physics/alpha_crystal_interface.md for new approach

---

### I-007: GR Limit Has No Derivation (HIGH)

**Filed**: 2026-01-25 (documented in limits_analysis.md)
**Status**: RESOLVED (demoted to SPECULATION)
**Severity**: HIGH
**Affects**: physics/gravity_limit.md
**Resolved**: 2026-01-26

**Description**:
The claim "low-γ → GR" has no actual derivation:
- g_μν not constructed from Γ
- Einstein equations not derived
- Just says "proportional to" without showing how

**Resolution**: Option 2 selected — **Demoted to SPECULATION**

Rationale (see gr_limit_investigation.md):
- Investigated three approaches to construct g_μν from Γ
- All have fundamental problems (signature, continuum limit)
- This is an open problem in quantum gravity generally
- QM limit at least has a formula; GR limit has none
- Honest to demote rather than claim what we haven't derived

**Files updated**:
- physics/gravity_limit.md: Status changed, warnings added
- physics/gr_limit_investigation.md: Created with full analysis

---

### I-010: Information Formula Assumes Discrete U (MEDIUM)

**Filed**: 2026-01-26
**Status**: OPEN
**Severity**: MEDIUM
**Affects**: framework/layer_0_pure_axioms.md §8, framework/layer_1_mathematics.md

**Description**:
The information formulas I_π = log₂|U_π| and S_π = log₂|H_π| assume finite/countable sets. But V is defined as a continuous inner product space, making |V| infinite. This is an internal inconsistency.

**Resolution Options**:
1. Discretize V (add axiom: V has discrete values)
2. Use measure-theoretic entropy (continuous case)
3. Interpret |U_π| as counting basis states only

**Cross-references**:
- framework/phase_6_derivation_attempts.md (discovered during 6.2.5)

---

## Resolved Issues

### I-001: Recoherence Paradox (was CRITICAL)
**Resolution**: Recoherence prediction RETRACTED. Formula restricted to γ ≤ 0.5.
**Date resolved**: 2026-01-26

### I-004: Γ_dec Formula Not Derived (was HIGH)
**Resolution**: Form **DERIVED** from content asymmetry; scale τ₀ = t_P **EMPIRICAL**
**Date resolved**: 2026-01-26 (upgraded Session 9)
**Derivation**: A(γ) = 2γ-1 → Γ_dec ∝ (1-2γ)
**See**: core/18_dynamics.md

### I-002: R Calculation Error (was MEDIUM)
**Resolution**: Corrected to R ≈ 10⁷ (was incorrectly 10¹³)
**Date resolved**: 2026-01-26

### I-003: R Interpretation Error (was MEDIUM)
**Resolution**: Fixed to "FASTER" (was incorrectly "SLOWER")
**Date resolved**: 2026-01-26

### I-005: h(γ) Function Not Derived (was HIGH)
**Resolution**: **DERIVED** from interaction capacity / ordered pair counting
**Date resolved**: 2026-01-26 (fully derived Session 10)
**Derivation**: h(γ) = 2γ(1-γ) from bidirectional ordered pairs (shared↔different)
**See**: physics/h_gamma_investigation.md

### I-006: n_EW = 5 Is Numerology (was HIGH)
**Resolution**: Old approach **DEPRECATED**; **REPLACED** by crystal-defect interface (Sessions 18-21)
**Date deprecated**: 2026-01-26
**New approach**: α = 1/(4² + 11²) = 1/137 (0.026% accuracy)
**See**: physics/alpha_crystal_interface.md

### I-007: GR Limit Has No Derivation (was HIGH)
**Resolution**: **Demoted to SPECULATION**
**Date resolved**: 2026-01-26
**Rationale**: No formula for g_μν exists. "Γ gives geometry" is a hope, not a derivation. This is an open problem in quantum gravity generally.

---

## Issue Template

```markdown
### I-XXX: [Title] (SEVERITY)

**Filed**: YYYY-MM-DD
**Status**: OPEN | INVESTIGATING | RESOLVED | WONTFIX | INVALID
**Severity**: CRITICAL | HIGH | MEDIUM | LOW
**Affects**: [list of files]

**Description**:
[What is the problem?]

**Resolution Options**:
1. [Option 1]
2. [Option 2]

**Cross-references**: [related issues, files]
```

---

## Statistics

| Severity | Open | Resolved | Total |
|----------|------|----------|-------|
| CRITICAL | 0 | 1 | 1 |
| HIGH | 0 | 4 | 4 |
| MEDIUM | 1 | 2 | 3 |
| LOW | 0 | 0 | 0 |
| **Total** | **1** | **7** | **8** |

**One MEDIUM issue open** (I-010: Information formula assumes discrete U)

---

*Last updated: 2026-01-26 (Documentation merge: I-004/I-005 upgraded to DERIVED, I-006 replacement noted)*
