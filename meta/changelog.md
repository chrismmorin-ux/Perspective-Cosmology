# Changelog

Track all significant changes with reasoning.

**Purpose**: Document the evolution of ideas, including dead ends. This prevents repeating mistakes and shows intellectual honesty.

---

## Format

```markdown
## [Date] - [Brief Description]

**Type**: [ADDITION | REVISION | DELETION | DEMOTION | PROMOTION]

**What changed**: [Specific change]

**Why**: [Reasoning for the change]

**Impact**: [What else is affected]

**Confidence change**: [If applicable, old → new confidence level]
```

---

## 2026-01-25 - Literature Review: Failed α Derivations (O8)

**Type**: RESEARCH

**What changed**:
- Created references/failed_alpha_derivations.md
- Updated peer_review_prep.md O8 response

**Key findings**:

Historical attempts that failed:
- Eddington (1930s): Integer numerology, post-hoc adjustment
- Wyler (1969): Geometric volumes, not unique
- Gilson (1996): Circular (uses 137 to derive 1/137)
- Various information-theoretic: Hidden free parameters

**Our α derivation follows the Eddington pattern**:
- n_EW = 5 is an integer chosen to fit the answer
- Same failure mode as historical attempts

**Impact**: Confirms decision to demote α to SPECULATION

---

## 2026-01-25 - Predictions Analysis (O7)

**Type**: ANALYSIS

**What changed**:
- Created physics/predictions_analysis.md
- Updated peer_review_prep.md O7 response

**Findings**:

Most claimed "predictions" are NOT genuine predictions:

| Claim | Reality |
|-------|---------|
| No 4th generation | Known since LEP 1990s |
| Gravitational decoherence | Similar to Penrose-Diosi |
| Modified dispersion | Generic QG prediction |
| G variation | Too vague to test |
| BH remnants | Common speculation |

**Best hope**: Intermediate-γ critical behavior predictions
- Critical point at γ = 0.5 (L = λ_C)
- Recoherence for γ > 0.5
- Decoherence scaling anomaly

**Impact**:
- Framework is largely retrofitting known physics
- Need to focus on intermediate-γ to find genuinely novel predictions
- Most "predictions" should be relabeled as "explanations"

---

## 2026-01-25 - QM/GR Limits Gap Analysis (O4)

**Type**: ANALYSIS

**What changed**:
- Created physics/limits_analysis.md with detailed gap analysis
- Updated physics/quantum_limit.md with gap warnings
- Updated physics/gravity_limit.md with critical gap warnings
- Added A14 (complex V) to assumptions_registry.md
- Updated peer_review_prep.md O4 response

**Findings**:

| Limit | Status | Assessment |
|-------|--------|------------|
| QM (high-γ) | CONJECTURE | Reasonable structure, gaps documentable |
| GR (low-γ) | CONJECTURE (weak) | Critical gaps: g_μν and EFE not derived |

**Key gaps identified**:
- QM: Complex V assumed, ℏ not derived, Born rule heuristic, mass undefined
- GR: g_μν not constructed from Γ, Einstein equations not derived, signature not explained

**Impact**:
- GR derivation is significantly weaker than QM derivation
- Framework does NOT actually derive GR—only claims analogy
- Need explicit g_μν = f(Γ) construction to make progress

**Confidence change**: None (both remain CONJECTURE), but GR is flagged as weak

---

## 2026-01-25 - α Derivation Demoted to SPECULATION

**Type**: DEMOTION

**What changed**:
- Fine structure constant derivation demoted from CONJECTURE to SPECULATION
- Updated alpha.md with detailed numerology analysis
- Updated assumptions_registry.md (A10 flagged as FITTING)
- Updated derivations_summary.md (α removed from "derived with <1% error")
- Updated peer_review_prep.md (O5 objection accepted)

**Why**: Rigorous analysis revealed n_EW = 5 is almost certainly a hidden free parameter:
1. Reverse-engineering shows n = sin²θ_W/(2πα) = 5.04, so 5 is the only integer that works
2. SU(2)×U(1) has 4 generators, not 5 "dimensions"
3. Gell-Mann–Nishijima (Q = I₃ + Y/2) means the claimed 5 basis vectors are not independent
4. gauge_structure.md says n_weak = 2, n_EM = 1 (contradicts n_EW = 5)
5. Sensitivity: n_EW = 4 → 21% error, n_EW = 6 → 19% error

**Impact**:
- Framework no longer claims to derive α from first principles
- α derivation is now speculative/exploratory only
- Need to either derive n_EW = 5 from axioms or accept this as numerology

**Confidence change**: CONJECTURE → **SPECULATION**

**This is intellectual honesty in action**: The framework's most impressive-looking numerical result has been demoted because it doesn't survive scrutiny.

---

## 2026-01-25 - Documentation System Overhaul

**Type**: ADDITION

**What changed**: Created structured documentation system
- CLAUDE.md (AI assistant guidelines)
- assumptions_registry.md (master list of assumptions)
- falsification_criteria.md (what would prove us wrong)
- peer_review_prep.md (anticipated objections)
- changelog.md (this file)

**Why**: Need systematic approach to track confidence levels, assumptions, and maintain intellectual honesty. Framework has grown complex enough to require formal methodology.

**Impact**: All future work should follow guidelines in CLAUDE.md

---

## 2026-01-24 - Fine Structure Constant from B-geometry

**Type**: ADDITION

**What changed**: Added derivation α = sin²θ_W / (2π × n_EW) ≈ 1/136.1

**Why**: Attempt to derive α from framework rather than assuming it

**Impact**: If valid, first concrete numerical prediction

**Confidence**: CONJECTURE

**Concerns raised**:
- Is n_EW = 5 derived or chosen? (See O5 in peer_review_prep.md)
- Why this formula specifically?
- Needs sensitivity analysis

---

## Template for Future Entries

### [Date] - [Description]

**Type**: [TYPE]

**What changed**:

**Why**:

**Impact**:

**Confidence change**: [OLD] → [NEW]

**Concerns**:

---

## Deprecated Ideas

Ideas that were tried and abandoned. Kept for honesty and to prevent re-invention.

### D1: [Example - Direct Derivation of c]

**Date deprecated**: [Date]

**What it was**: Attempt to derive speed of light from perspective density

**Why abandoned**: Circular - implicitly assumed c in the setup

**Lesson learned**: Check for circularity before investing in derivation

---

## Confidence Demotions

Track when claims were downgraded.

| Date | Claim | From | To | Reason |
|------|-------|------|-----|--------|
| 2026-01-25 | α = sin²θ_W/(2πn_EW) | CONJECTURE | SPECULATION | n_EW = 5 is fitting, not derivation |

---

## Confidence Promotions

Track when claims were upgraded (requires rigorous justification).

| Date | Claim | From | To | Justification |
|------|-------|------|-----|---------------|
| | | | | |

---

*Last updated: 2026-01-25 (α demotion)*
