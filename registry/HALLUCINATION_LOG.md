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
| Claims reviewed | 6 |
| Hallucinations caught | 3 |
| Calculation errors | 2 |
| Code bugs | 1 |
| Invalid proofs | 0 |
| Hidden circularity | 0 |
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

*Updated 2026-02-02 (Audit Round 5b). Back-filled HP-002 through HP-004 from DEAD_ENDS and CHANGE_REQUESTS.*

*Update this file whenever a hallucination is caught. The patterns will inform better defenses.*
