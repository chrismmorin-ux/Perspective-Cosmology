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
**Status**: RESOLVED
**Severity**: HIGH
**Affects**: physics/intermediate_gamma.md, mathematical_framework.md §12.4
**Resolved**: 2026-01-26

**Description**:
The formula Γ_dec = (1-2γ)/t_P + Γ_env is asserted, not derived from axioms A1-A6. The t_P dependence appears to be dimensional analysis, not derivation.

**Resolution**: Option 2 selected — **Marked as ASSUMPTION (A15)**

**Investigation findings** (see gamma_dec_investigation.md):
- Axioms define static structure, not dynamics
- Time is not defined in the framework
- t_P would require deriving G, ℏ, c first (circular)
- The formula is dimensional analysis, not derivation
- **Cannot be derived from current axioms**

**Files updated**:
- assumptions_registry.md: Added A15 (Γ_dec formula as assumption)
- physics/gamma_dec_investigation.md: Created with full analysis
- physics/intermediate_gamma.md: Warning updated

**Note**: I-005 (h(γ) function) has similar issues and should be addressed.

---

### I-005: h(γ) Function Not Derived (HIGH)

**Filed**: 2026-01-25
**Status**: RESOLVED
**Severity**: HIGH
**Affects**: mathematical_framework.md §12.4
**Resolved**: 2026-01-26

**Description**:
The gravitational decoherence modification h(γ) = 2γ(1-γ) is asserted without derivation. Any function with a maximum at γ = 0.5 would fit the narrative.

**Resolution**: Option 2 — **Marked as ASSUMPTION (A16)**

**Investigation findings** (see h_gamma_investigation.md):
- Function is simplest symmetric polynomial with zeros at endpoints
- Many alternatives would have same qualitative behavior
- Coefficient (2) is arbitrary
- Cannot be derived from current axioms

**Files updated**:
- assumptions_registry.md: Added A16 (h(γ) formula as assumption)
- physics/h_gamma_investigation.md: Created with full analysis

---

### I-006: n_EW = 5 Is Numerology (HIGH)

**Filed**: 2026-01-25 (documented earlier)
**Status**: RESOLVED (accepted as limitation; comprehensive analysis 2026-01-26)
**Severity**: HIGH
**Affects**: physics/constants/alpha.md, derivations_summary.md, peer_review_prep.md, assumptions_registry.md

**Description**:
n_EW = 5 is chosen to match α ≈ 1/137. Reverse-engineering: n = sin²θ_W/(2πα) = 5.04.

**Comprehensive Re-Analysis (2026-01-26)**:

**Fatal Problems Identified**:
1. **Eddington pattern**: Follows exact structure of failed 1930s derivation
2. **Mathematical impossibility**: Gell-Mann–Nishijima (Q = I₃ + Y/2) makes claimed basis dependent (dim ≤ 4, not 5)
3. **Internal contradiction**: gauge_structure.md says n_EW = 3, not 5
4. **Standard physics disagreement**: All standard methods give n = 4

**Sensitivity Analysis**:
| n_EW | 1/α | Deviation | Justification |
|------|-----|-----------|---------------|
| 3 | 81.6 | −40% | gauge_structure.md |
| 4 | 108.9 | −21% | Standard physics |
| 5 | 136.1 | +0.7% | **NONE** |
| 6 | 163.3 | +19% | Including Higgs |

**Verdict**: This is probable numerology. Rehabilitation appears impossible due to Gell-Mann–Nishijima constraint.

**Resolution**:
- ✅ α derivation demoted to SPECULATION (2026-01-25)
- ✅ A10 marked as FITTING/NUMEROLOGY/PROBABLY UNSALVAGEABLE (2026-01-26)
- ✅ Comprehensive documentation in peer_review_prep.md (O5) (2026-01-26)
- ⚠️ Recommendation: Consider moving to archive/deprecated/

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

## Resolved Issues

### I-001: Recoherence Paradox (was CRITICAL)
**Resolution**: Recoherence prediction RETRACTED. Formula restricted to γ ≤ 0.5.
**Date resolved**: 2026-01-26

### I-004: Γ_dec Formula Not Derived (was HIGH)
**Resolution**: **Marked as ASSUMPTION (A15)**
**Date resolved**: 2026-01-26
**Rationale**: Formula cannot be derived from current axioms. Time is not defined in the framework. Dimensional analysis is not derivation.
**See**: physics/gamma_dec_investigation.md

### I-002: R Calculation Error (was MEDIUM)
**Resolution**: Corrected to R ≈ 10⁷ (was incorrectly 10¹³)
**Date resolved**: 2026-01-26

### I-003: R Interpretation Error (was MEDIUM)
**Resolution**: Fixed to "FASTER" (was incorrectly "SLOWER")
**Date resolved**: 2026-01-26

### I-005: h(γ) Function Not Derived (was HIGH)
**Resolution**: **Marked as ASSUMPTION (A16)**
**Date resolved**: 2026-01-26
**Rationale**: Function is simplest symmetric polynomial but not uniquely determined. Coefficient is arbitrary. Cannot be derived from axioms.
**See**: physics/h_gamma_investigation.md

### I-006: n_EW = 5 Is Numerology (was HIGH)
**Resolution**: α derivation **DEPRECATED** and moved to archive/deprecated/alpha_derivation.md
**Date resolved**: 2026-01-25 (demoted to SPECULATION)
**Date deprecated**: 2026-01-26 (moved to archive)
**Comprehensive re-analysis**: 2026-01-26 - confirmed as probable numerology following Eddington pattern.
**Verdict**: Claim removed from active framework rather than defended. Example of intellectual honesty.
**Note**: New structural approach (α = 2/ln|Π|) being explored separately.

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
| MEDIUM | 0 | 2 | 2 |
| LOW | 0 | 0 | 0 |
| **Total** | **0** | **7** | **7** |

**ALL ISSUES RESOLVED** as of 2026-01-26.

---

*Last updated: 2026-01-26 (I-002, I-003 resolved - R errors fixed)*
