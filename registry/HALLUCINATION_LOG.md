# Hallucination Log

**Purpose**: Track instances where LLM hallucinations were caught, to learn patterns.

---

## What Counts as a Hallucination?

Not every error is a hallucination. This log tracks **LLM-generated errors** — cases where Claude produced plausible-looking but incorrect reasoning, calculations, or claims.

| Category | Logged Here? | Example | Logged Elsewhere |
|----------|-------------|---------|------------------|
| **Calculation error** (LLM gets math wrong) | YES | Wrong eta/eps ratio (DE-006) | Also in DEAD_ENDS |
| **Code bug** (LLM writes broken code) | YES | Variable shadowing (CR-064) | Also in CHANGE_REQUESTS |
| **Structural misjudgment** (LLM picks wrong approach) | NO | n_c=15 vs 11 (DE-004) | DEAD_ENDS only |
| **Dead end** (correct math, wrong physics) | NO | Λ ~ α⁴ (DE-002) | DEAD_ENDS only |
| **Framework falsification** (prediction vs measurement) | NO | sin²θ_W = 2/25 (F-1) | FALSIFIED only |

**Rule of thumb**: If the error could have been caught by careful LLM reasoning (but wasn't), it belongs here. If it required new physics insight, it belongs in DEAD_ENDS.

---

## Statistics

| Metric | Value |
|--------|-------|
| Claims reviewed | 15 |
| Hallucinations caught | 5 |
| Precision inflation | 4 |
| Post-hoc fitting | 2 |
| Hidden circularity | 1 |
| Calculation errors | 2 |
| Code bugs | 1 |
| Invalid proofs | 2 |
| No hallucination confirmed | 1 |

---

## Incidents

*Document each caught hallucination below.*

### Template

```markdown
### H-XXX: [Brief description]

**Date**: YYYY-MM-DD
**Session**: N
**Type**: [Calculation error | Invalid proof | Hidden circularity | Pattern matching]
**How caught**: [Which defense layer: Computational | Multi-path | Semantic | External]
**Severity**: [LOW | MEDIUM | HIGH | CRITICAL]

**Original claim**:
[What Claude/LLM claimed]

**Actual result**:
[What turned out to be correct]

**How it looked plausible**:
[Why this wasn't obviously wrong]

**Lesson learned**:
[What to watch for in future]
```

---

## Log Entries

### HP-001: Alpha Derivation Full Review (2026-01-27, Session 90c)

**Type**: Multi-path verification test
**Result**: **NO HALLUCINATION DETECTED**

**Claim tested**: 1/α = 137 + 4/111 = 15211/111 (0.27 ppm)

**Verification performed**:
- Layer 1 (Computational): SymPy verified all arithmetic
- Layer 2 (Multi-path): Lie algebra formula = Cyclotomic Φ₆ (algebraic identity)
- Layer 2 (External): CODATA 2022 confirms 0.269 ppm error
- Layer 3 (Semantic): Dimensional analysis, limit behavior, sensitivity all pass

**Sensitivity test**: Changing n_d or n_c by ±1 gives 5-17% error (formula is rigid)

**One concern noted**: "Equal distribution" argument is symmetry-based, not rigorously proven. Appropriate confidence level is [DERIVATION], not [THEOREM].

**Conclusion**: Core arithmetic and structure are correct. No evidence of LLM hallucination.

---

### HP-002: Wrong phi_CMB for eta/eps = -5 (Back-filled from DE-006)

**Date**: 2026-01-29
**Session**: 127-129
**Type**: Calculation error
**How caught**: Computational (SymPy verification scripts)
**Severity**: MEDIUM

**Original claim**:
Claude derived phi_CMB = mu/sqrt(5) for the hilltop inflation model, claiming this gives eta/eps = -5 and hence r = 1 - n_s.

**Actual result**:
phi_CMB = mu/sqrt(5) gives eta/eps = -4, not -5. The correct location is phi_CMB = mu/sqrt(6). This propagated through Sessions 127-129 before being caught.

**How it looked plausible**:
The arithmetic was close (sqrt(5) vs sqrt(6)), and the r = 1 - n_s relation itself is correct — only the specific mu²/phi_CMB combination was wrong. The error was subtle enough to survive multiple sessions.

**Lesson learned**:
Always verify slow-roll parameter ratios computationally at the point of derivation, not just the final predictions. Multi-session propagation of unchecked intermediate results is dangerous.

---

### HP-003: Variable Shadowing in weak_angle_97_formula.py (Back-filled from CR-064)

**Date**: 2026-02-02
**Session**: Audit Round 4b
**Type**: Code bug (LLM-generated)
**How caught**: Computational (test execution)
**Severity**: LOW

**Original claim**:
The Weinberg angle verification script was reported as "5/6 tests pass" with the final test "Error < 0.5%" failing. The apparent fix was to relax the threshold.

**Actual result**:
The `error` variable on line 91 (M_Z scale error = 0.77%) was being overwritten by a `for` loop at line 167 that iterated over energy scales. The last iteration ("Tree level": 0.25) gave error = 7.94%, which is what the test was actually checking. The test was checking the wrong value entirely.

**How it looked plausible**:
The variable name `error` was reused in a natural-looking loop pattern. The test "failure" appeared to be a threshold issue, not a variable scoping bug.

**Lesson learned**:
When LLM-generated scripts have failing tests, investigate the root cause — don't just adjust thresholds. Python variable scoping in loops is a common source of subtle bugs.

---

### HP-004: Wrong eta/eps Algebra (Back-filled from DE-006 derivation chain)

**Date**: 2026-01-29
**Session**: 127
**Type**: Calculation error
**How caught**: Computational (SymPy: `hilltop_correct_conditions.py`)
**Severity**: MEDIUM

**Original claim**:
For V(phi) = V_0(1 - (phi/mu)^4), at phi = mu/sqrt(5):
eta/eps = -5 (claimed).

**Actual result**:
At phi = mu/sqrt(5): eta = -12 phi²/mu⁴ × V_0, eps = 8 phi⁶/mu⁸ × V_0² (schematically). The ratio eta/eps depends on the potential shape, and the algebra gives -4 at that point, not -5. Claude carried an incorrect intermediate step.

**How it looked plausible**:
The final relation r = 1 - n_s (equivalent to eta = -5 eps at leading order) is correct for a specific phi_CMB. The error was in which phi_CMB satisfies it.

**Lesson learned**:
For slow-roll calculations, verify EACH intermediate step (eps(phi), eta(phi), ratio) separately before combining. Don't trust "it follows that" for potential derivatives.

---

## Common Patterns

### Calculation Errors
- **Multi-session propagation**: An unchecked intermediate result (phi_CMB = mu/sqrt(5)) survived 3 sessions before verification caught it. Lesson: verify at the point of derivation, not downstream.
- **Close-but-wrong values**: sqrt(5) vs sqrt(6) — errors near the correct answer are hardest to catch by inspection.

### Code Bugs
- **Variable shadowing**: Python loop variables overwriting earlier definitions. LLM-generated code doesn't always respect scoping hygiene.
- **Threshold masking**: When a test fails, the instinct is to relax the threshold rather than investigate why. This hides real bugs.

### Invalid Proofs
*No incidents logged yet.*

### Hidden Circularity
*No incidents logged yet.*

---

## Prevention Effectiveness

| Defense Layer | Incidents Caught | Examples |
|---------------|------------------|----------|
| Computational (SymPy) | 2 | HP-002 (wrong phi_CMB), HP-004 (wrong eta/eps) |
| Test execution | 1 | HP-003 (variable shadowing) |
| Multi-path verification | 1 | HP-001 (confirmed NO hallucination) |
| Semantic consistency | 0 | — |
| External (Wolfram) | 0 | — |
| User skepticism | 0 | — |

**Key finding**: Computational verification (Layer 1) is the primary defense. All 3 caught hallucinations were found by running code, not by reasoning.

---

---

### HP-005: Weinberg Dressed Formula "0.00 sigma" with Hidden Free Parameter

**Date**: 2026-02-07
**Session**: S287 (Hallucination Audit)
**Type**: Precision inflation / hidden parameter
**How caught**: Semantic (cross-check audit)
**Severity**: CRITICAL

**Original claim**:
S276 claims sin^2(theta_W, dressed) = 28/121 - alpha/(4*pi^2) achieves "0.00 sigma" deviation from the experimental value of sin^2(theta_W) = 0.23122.

**Actual result**:
The coefficient C_W = 1/(4*pi) was *extracted from data* — it's the value that makes the formula match the measurement. This is a 1-parameter fit to 1 data point, which is guaranteed to give 0.00 sigma. It is not a prediction; it has exactly one free parameter adjusted to match one observable.

**How it looked plausible**:
The formula sin^2 = 28/121 - C_W*alpha has a natural-looking structure, and 1/(4*pi) looks like a "geometric" coefficient. The investigation file (`alpha_radiative_gap.md`) does acknowledge this is [CONJECTURE], but session summaries present "0.00 sigma" without the caveat.

**Lesson learned**:
A fit with N parameters to N data points always gives 0.00 sigma. Any "0.00 sigma" claim must be checked for hidden free parameters. The test is: was the coefficient PREDICTED before comparison, or EXTRACTED from comparison?

---

### HP-006: SM Imports Labeled as [DERIVATION]

**Date**: 2026-02-07
**Session**: S287 (Hallucination Audit)
**Type**: Precision inflation / misclassification
**How caught**: Semantic (pattern scan)
**Severity**: HIGH

**Original claim**:
Several derivation chains mark results as [DERIVATION] or [THEOREM] when they depend on Standard Model particle content that was imported, not derived.

**Actual result**:
Examples: "b_0 = 11 = n_c [EXACT IDENTITY]" — but b_0 involves SM particle counting (4 quark doublets, 3 lepton doublets, etc.) which is [A-IMPORT], not derived from framework axioms. The identity b_0 = n_c is a remarkable coincidence/connection, but calling it [EXACT] or [DERIVED] masks the import dependency.

**How it looked plausible**:
When a framework number matches an SM number, it's natural to call it a "derivation." But the SM side of the equation is observed, not derived. The framework correctly labels this in investigation files but session summaries sometimes drop the [A-IMPORT] caveat.

**Lesson learned**:
"X = Y" where X is derived and Y is observed is a *prediction*, not a *derivation of Y*. The proper framing is: "framework predicts X; observation confirms X = Y."

---

### HP-007: "EXACT" Label Inflation Pattern

**Date**: 2026-02-07
**Session**: S287 (Hallucination Audit)
**Type**: Precision inflation (systemic)
**How caught**: Semantic (pattern scan)
**Severity**: HIGH

**Description**:
Systematic pattern of upgrading approximate matches or identifications to "EXACT" language. Examples: "EXACT IDENTITY" for numerical coincidences, "EXACT MATCH" for formula fits with free parameters. The word "EXACT" should be reserved for mathematically rigorous identities, not numerical agreements.

**Affected areas**: Session summaries, some investigation headers, INDEX.md topic descriptions.

**Lesson learned**:
Reserve "EXACT" for proven mathematical identities. Use "matches to N ppm" or "agrees within measurement uncertainty" for numerical comparisons.

---

### HP-008: C=24/11 Post-Hoc Discovery

**Date**: 2026-02-07
**Session**: S287 (Hallucination Audit)
**Type**: Post-hoc fitting with prediction language
**How caught**: Semantic (cross-check audit)
**Severity**: HIGH

**Description**:
C = 24/11 was found by searching what coefficient gives the best two-loop correction to 1/alpha = 137 + 4/111. It was then justified via N_colored = 24 from the SO(11)/SO(4)xSO(7) coset. The investigation files (S266, S269, S272) are transparent about this, but session summaries sometimes present the coefficient as if it were predicted a priori.

**Lesson learned**:
Post-hoc justification is legitimate science (find pattern, then explain it), but the discovery sequence must be documented. "We found C=24/11 gives 0.0002 ppm, then derived 24 from the coset" is honest. "The framework predicts C=24/11" is misleading.

---

### HP-009: F=C Axiom Circularity Risk

**Date**: 2026-02-07
**Session**: S287 (Hallucination Audit)
**Type**: Hidden circularity risk
**How caught**: Semantic (pattern scan)
**Severity**: HIGH

**Description**:
Some derivation chains use F=C (complex field axiom) to derive results, while other documents cite those results as evidence that F=C is the right choice. If F=C is [AXIOM], this is fine — axioms don't need justification. But if F=C is presented as derived/forced, the circularity becomes problematic. The CCP work (S251-S255) addresses this by showing F=C is forced by consistency, but older documents may still have the circular framing.

**Lesson learned**:
Mark clearly whether F=C is [AXIOM] (assumed) or [DERIVED] (forced by CCP). Don't cite downstream results as justification for an axiom.

---

### HP-010: Alpha Radiative Gap eps* Circularity

**Date**: 2026-02-07
**Session**: S287 (Hallucination Audit)
**Type**: Circular definition
**How caught**: Semantic (cross-check)
**Severity**: HIGH

**Description**:
The alpha radiative gap analysis defines eps* = (1/alpha_measured - 1/alpha_tree). Then shows eps* ~ alpha^2. But since alpha_tree is close to alpha_measured, eps* is necessarily O(alpha^2) by construction — it's the next-order correction term. This is consistent but not predictive: it says "the two-loop correction is two-loop-sized."

**Lesson learned**:
When defining a gap parameter from data, check whether the scaling with coupling is tautological (correction term scales as next loop order) vs genuinely constraining.

---

### HP-011: CODATA Version Inconsistency

**Date**: 2026-02-07
**Session**: S287 (Hallucination Audit)
**Type**: Data inconsistency
**How caught**: Computational (cross-check audit)
**Severity**: HIGH

**Description**:
Alpha scripts inconsistently use CODATA 2018 (1/alpha = 137.035999084) vs CODATA 2022 (137.035999206). The flagship "0.0002 ppm" claim for C=24/11 is computed against CODATA 2018. Against CODATA 2022, the gap would be ~0.001 ppm — still excellent but 5x worse. Since the framework doesn't predict which CODATA vintage to use, the honest precision claim should state the CODATA version used.

**Lesson learned**:
Pin all precision claims to a specific CODATA version and state it explicitly. When updating to newer CODATA, recompute all affected precision claims.

### HP-012: H²(Gr(4,11;R);Z) = Z Claimed for Real Grassmannian

**Date**: 2026-02-07
**Session**: S291 (correcting S263/S278)
**Type**: Invalid proof / mathematical error
**How caught**: Computational + algebraic topology (homotopy exact sequence)
**Severity**: HIGH

**Original claim** (S263, investigation Part VII):
"H²(Gr(4,11;R); Z) ≅ Z (since k=4 ≥ 2 and n-k=7 ≥ 2) → integral symplectic class exists."
Also: the 2-form ω_I ⊗ g_7 was claimed to be a global symplectic form, "14 conjugate pairs," and "level alpha = 2."

**Actual result**:
H₂(Gr⁺(4,11;R);Z) = Z/2 (torsion). H²(Gr⁺;Z) = 0. b₂ = 0. The claim H² = Z applies to the COMPLEX Grassmannian Gr(4,C¹¹), not the real one. For k ≥ 3, π₁(SO(k)) = Z/2 (not Z as for k=2), giving H₂ = Z/2 always. The 2-form ω_I is not SO(4)-invariant and cannot extend globally.

**How it looked plausible**:
The formula "H² = Z for k ≥ 2 and n-k ≥ 2" IS correct for complex Grassmannians, and the distinction between real and complex was not flagged. The tangent-space symplectic form IS well-defined and non-degenerate, making the global extension seem natural. The closedness argument for symmetric spaces was correct but only applies to K-invariant forms.

**Lesson learned**:
(1) Real and complex Grassmannians have fundamentally different topology. Always check which one is being used. (2) A form defined at a point extends globally on G/K ONLY IF it is K-invariant. (3) When b₂ = 0, no symplectic structure is possible on a compact manifold (exact 2-forms integrate to 0). (4) The obstruction theorem in Part VII ALREADY showed no K-invariant 2-form exists — the "resolution" should have raised a red flag.

---

## Common Patterns (Updated S291)

### Calculation Errors
- **Multi-session propagation**: An unchecked intermediate result (phi_CMB = mu/sqrt(5)) survived 3 sessions before verification caught it. Lesson: verify at the point of derivation, not downstream.
- **Close-but-wrong values**: sqrt(5) vs sqrt(6) -- errors near the correct answer are hardest to catch by inspection.

### Code Bugs
- **Variable shadowing**: Python loop variables overwriting earlier definitions. LLM-generated code doesn't always respect scoping hygiene.
- **Threshold masking**: When a test fails, the instinct is to relax the threshold rather than investigate why. This hides real bugs.

### Precision Inflation (NEW - S287)
- **"EXACT" label overuse**: Approximate matches called "EXACT IDENTITY" or "EXACT MATCH."
- **Free parameters disguised as structural**: Coefficients extracted from data presented as predictions (HP-005).
- **CODATA version shopping**: Different CODATA versions used across scripts without standardization (HP-011).
- **Ratio vs absolute conflation**: "0.5% from lattice" meaning ratio precision, not absolute (glueball 1-+).

### Post-Hoc Fitting
- **Discovery vs derivation**: C=24/11 found by search, justified after the fact. Investigation files are honest; summaries less so (HP-008).
- **SM import masking**: Framework number matching SM number called "derivation" when SM side is imported (HP-006).

### Hidden Circularity
- **Self-referential epsilon**: Gap parameter defined from data shown to scale as expected loop order — tautological (HP-010).
- **Axiom justification loops**: F=C axiom justified by results that assume F=C (HP-009). Resolved by CCP work but older docs may retain circular framing.

### Invalid Proofs (NEW - S320)
- **Wrong SU(3) identification**: SU(3) c G_2 identified as generation symmetry when it's color (HP-013). Weinberg criterion misapplied (didn't check for inconsistency with existing color identification). "Lepton test" now a standard discriminator.

---

## Prevention Effectiveness (Updated S287)

| Defense Layer | Incidents Caught | Examples |
|---------------|------------------|----------|
| Computational (SymPy) | 2 | HP-002 (wrong phi_CMB), HP-004 (wrong eta/eps) |
| Test execution | 1 | HP-003 (variable shadowing) |
| Multi-path verification | 1 | HP-001 (confirmed NO hallucination) |
| Semantic (audit) | 8 | HP-005 through HP-011 (precision inflation, circularity, CODATA), HP-013 (SU(3) misidentification) |
| External (Wolfram) | 0 | -- |
| User skepticism | 0 | -- |

**Key finding (S287 update)**: Computational verification (Layer 1) catches calculation errors. But precision inflation, post-hoc fitting, and hidden circularity require **semantic analysis** (Layer 3) -- these are language/framing errors, not arithmetic errors. The S287 audit caught 7 new issues, all via semantic review.

---

### HP-013: SU(3) c G_2 Misidentified as Generation Symmetry

**Date**: 2026-02-08
**Session**: S320 (correcting S299)
**Type**: Structural misjudgment / invalid proof
**How caught**: Semantic (lepton test discriminator)
**Severity**: CRITICAL

**Original claim** (S299, IRA-09 resolution):
"SU(3) c G_2 gives generation structure via 7 -> 3+3bar+1. The 3 copies have all defining properties of generations. Weinberg criterion forces identification."

**Actual result**:
SU(3) c G_2 c SO(7) is COLOR SU(3)_c, not a generation symmetry. The framework's SM pipeline (S251) derives u(1)xsu(2)xsu(3) from G_2 -- this SU(3) IS color. The "3 copies" in 7->3+3bar+1 are 3 COLORS, and the "1" is the lepton (color singlet). This is the standard Pati-Salam pattern.

**Decisive test**: SM leptons are SU(3) singlets but come in 3 generations. If SU(3) = generation, singlet states get only 1 copy -> only 1 lepton generation (contradicts observation). SU(3) = color gives correct lepton counting.

**Impact**: IRA-09 resolution RETRACTED. S319 "8 dark states" RETRACTED. S320 Phase 1 (B-D portal, triality) RETRACTED. DM particle identity reopened.

**How it looked plausible**:
The Weinberg criterion ("all defining properties present -> forced identification") was applied without checking that the SU(3) in question was ALREADY identified as color by the framework's own gauge group derivation. The 7->3+3bar+1 decomposition genuinely gives 3 identical representations, making the generation interpretation seem natural. S212 (original fermion embedding) used the CORRECT identification (SU(3) = color) but S299 introduced the wrong one.

**Lesson learned**:
(1) When identifying a mathematical object, check if it's ALREADY identified elsewhere in the framework. One SU(3) can't serve two roles. (2) The Weinberg criterion requires checking for INCONSISTENCIES, not just matching properties. The inconsistency here (SU(3) already = color) was the key missed check. (3) Always apply a "lepton test" for generation claims: leptons are gauge singlets, so any generation mechanism must work for singlets too.

---

*Updated 2026-02-08 (Session S320). Added HP-013 (SU(3) misidentification, CRITICAL). New lesson: "lepton test" discriminator for generation claims.*

*Update this file whenever a hallucination is caught. The patterns will inform better defenses.*
