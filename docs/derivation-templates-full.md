# Derivation & Documentation Templates (Full Reference)

This is the full unabridged version of the derivation templates. The trimmed version is in `.claude/rules/05-derivation-templates.md`.

---

## Plain Language Requirement

Every major derivation SHOULD include a `## Plain Language` section:
- 2-5 paragraphs, no equations
- Use analogies accessible to non-specialists
- Explain WHY the result matters, not just what it is

---

## Standard Claim Documentation

Use this template whenever documenting a new claim in any markdown file.

````markdown
### [Claim Title]

**Confidence**: [CONJECTURE] / [DERIVATION] / [THEOREM]
**Layer**: 0 (axiom) / 1 (mathematical) / 2 (correspondence) / 3 (prediction)
**Verification**: `verification/sympy/script_name.py`

**Statement**: [precise mathematical statement]

**Derivation Chain**:
1. [Starting point] [A: from AXM_XXXX]
2. [Intermediate step] [D: derived from step 1]
3. [Import step] [I: measured value from CODATA/PDG]
4. [Result] [D: derived from steps 2-3]

**Assumptions**:
1. [A-AXIOM] [description]
2. [A-STRUCTURAL] [description]
3. [A-IMPORT] [description with source]

**Gaps**: [what needs further rigor or remains unproven]

**Falsifies if**: [specific criterion that would disprove this claim]

**Plain Language**:
[2-5 paragraphs explaining the result without equations]
````

---

## Investigation File Template

Use this for files in `framework/investigations/`.

````markdown
# [Investigation Title]

**Status**: ACTIVE | QUARANTINE | CANONICAL | ARCHIVED
**Created**: Session [N], YYYY-MM-DD
**Updated**: Session [M], YYYY-MM-DD
**Layer**: [0/1/2/3]
**Topic**: [topic file link]

## Question

[What specific question does this investigation address?]

## Approach

[How are we investigating this? What methods/tools?]

## Findings

### Finding 1: [Title]
**Confidence**: [CONJECTURE]
**Verification**: `verification/sympy/script.py`

[Description of finding with derivation chain]

### Finding 2: [Title]
**Confidence**: [DERIVATION]
**Verification**: `verification/sympy/script.py`

[Description]

## Open Questions

1. [Question 1] (EQ-NNN)
2. [Question 2] (EQ-NNN)

## Dependencies

- Depends on: [list of other investigations, theorems, or axioms]
- Required by: [list of investigations that depend on this one]
- Related: [list of related but independent investigations]

## Session History

| Session | Date | Key Result |
|---------|------|------------|
| S[N] | YYYY-MM-DD | [summary] |
| S[M] | YYYY-MM-DD | [summary] |
````

---

## Axiom Template

Use this when documenting a framework axiom.

````markdown
# AXM_XXXX: [Axiom Name]

**Status**: CANONICAL
**Layer**: 0
**Created**: Session [N], YYYY-MM-DD

## Statement

[Precise mathematical statement of the axiom]

## Motivation

[Why this axiom? What does it capture about perspective?]

## Consequences

1. [What follows mathematically from this axiom alone]
2. [What follows when combined with other axioms]

## Independence

[Is this axiom independent of the others? Can it be derived?]

## Falsification

[What observation would make this axiom untenable?]

## Plain Language

[2-5 paragraphs explaining the axiom without equations]
````

---

## Theorem Template

Use this when a result has been rigorously proven.

````markdown
# THM_XXXX: [Theorem Name]

**Status**: CANONICAL
**Layer**: [0/1]
**Confidence**: [THEOREM]
**Created**: Session [N], YYYY-MM-DD
**Verification**: `verification/sympy/script.py`

## Statement

[Precise mathematical statement]

## Proof

[Complete proof with all steps]

### Step 1: [Description]
[A: from AXM_XXXX] or [D: derived] or [I: imported]

### Step 2: [Description]
...

### Step N: [Conclusion]
QED

## Dependencies

- Uses: AXM_XXXX, THM_YYYY, [I-MATH: theorem name]
- Used by: THM_ZZZZ, [investigation name]

## Implications

1. [What this theorem enables]
2. [What it constrains]

## Plain Language

[2-5 paragraphs explaining the theorem without equations]
````

---

## Verification Script Template

Use this for all scripts in `verification/sympy/`.

````python
#!/usr/bin/env python3
"""
[Clear title describing what is verified]

KEY FINDING: [Main result in one sentence]

Formula: [Mathematical expression]
Measured: [Experimental value with source and uncertainty]
Error: [Percentage or ppm deviation]
Status: VERIFICATION | DERIVATION | COMPARISON

Framework constants:
  n_d = 4   [D: from Frobenius theorem, division algebra dimensions]
  n_c = 11  [D: from n_d, total imaginary dimensions R+C+H+O]

Assumptions:
  1. [A-AXIOM] [description]
  2. [A-STRUCTURAL] [description]
  3. [A-IMPORT] [description with source]

Session: S[N]
"""

from sympy import Rational, sqrt, pi, S, nsimplify, Abs

# ============================================================
# 1. FRAMEWORK CONSTANTS (state assumptions explicitly)
# ============================================================
n_d = 4    # [D] division algebra dimensions: R=1, C=2, H=4, O=8
n_c = 11   # [D] total imaginary dims: Im(R)+Im(C)+Im(H)+Im(O) = 0+1+3+7

# ============================================================
# 2. MEASURED VALUES (imports with sources)
# ============================================================
# Source: CODATA 2022
measured_value = Rational(137035999206, 10**12)  # 1/alpha_em

# ============================================================
# 3. DERIVATION (compute prediction from framework)
# ============================================================
prediction = n_d**2 + n_c**2  # = 16 + 121 = 137

# ============================================================
# 4. COMPARISON
# ============================================================
error_ppm = float(Abs(prediction - measured_value) / measured_value * 10**6)

# ============================================================
# 5. VERIFICATION TESTS
# ============================================================
tests = [
    ("Formula evaluates correctly", prediction == 137),
    ("Uses only framework quantities", n_d == 4 and n_c == 11),
    ("Within target precision", error_ppm < 300),
    ("No free parameters", True),  # explicit check
]

print("=" * 60)
print("VERIFICATION: [Title]")
print("=" * 60)
print(f"Prediction:  {prediction}")
print(f"Measured:    {float(measured_value):.12f}")
print(f"Error:       {error_ppm:.2f} ppm")
print()

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    print(f"  [{status}] {name}")

print()
overall = "ALL PASS" if all_pass else "SOME FAILURES"
print(f"Overall: {overall}")
test_count = sum(1 for _, p in tests if p)
print(f"Tests: {test_count}/{len(tests)} passed")
````

---

## Session Log Entry Template

Use this for per-session files in `sessions/`.

````markdown
# Session S[N]

**Date**: YYYY-MM-DD
**Focus**: [declared scope]
**Topic**: [topics/topic-name.md]
**Status**: COMPLETE | IN PROGRESS
**Previous**: S[N-1] | **Next**: S[N+1] (if known)

## Outcome

[2-3 sentence summary of what was accomplished]

## Key Findings

1. **[Finding title]** [CONFIDENCE]: [1-2 sentence description]
   - Verification: `verification/sympy/script.py`
   - Derivation chain: [brief chain]

2. **[Finding title]** [CONFIDENCE]: [1-2 sentence description]
   - Verification: `verification/sympy/script.py`

## Scripts

| Script | Tests | Status |
|--------|-------|--------|
| `script_name.py` | N/N | PASS |
| `script_name.py` | N/N | PASS |

## Files Created/Modified

- Created: `path/to/new/file.md`
- Modified: `path/to/existing/file.md`

## Open Questions

1. **[Question]** (EQ-NNN): [description]
2. **[Question]** (EQ-NNN): [description]

## Key Context

[Paragraph describing what the next session continuing this topic needs to know.
Include: what worked, what failed, what the critical next step is, any warnings
about dead ends or gotchas encountered.]
````

---

## Catalog Entry Template

Use this for entries in the predictions catalog.

````markdown
### #[N]: [Name]

**Band**: A (one-loop) | B (two-loop) | C (sub-ppm)
**CNH**: NORM | NON-NORM | BRIDGE | NONE
**Confidence**: [CONJECTURE] / [DERIVATION] / [THEOREM]
**Verification**: `verification/sympy/script.py`

| Quantity | Value |
|----------|-------|
| Tree formula | [expression in n_d, n_c] |
| Tree value | [numerical] |
| Dressing | [correction formula] |
| Dressed value | [numerical] |
| Measured | [value +/- uncertainty] |
| Error (ppm) | [value] |
| Sigma | [value] |

**Derivation**: [1-2 sentence summary with chain]
**Assumptions**: [list with tags]
**Falsifies if**: [criterion]
````

---

## Quick Reference: Which Template When

| Situation | Template |
|-----------|----------|
| New numerical prediction | Standard Claim + SymPy Script |
| New investigation started | Investigation File |
| Result rigorously proven | Theorem |
| New framework postulate | Axiom |
| End of session | Session Log Entry |
| New catalog prediction | Catalog Entry |
| Quick calculation check | SymPy Script (minimal) |
