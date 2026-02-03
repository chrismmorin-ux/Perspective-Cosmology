---
paths:
  - "core/**"
  - "framework/investigations/**"
  - "verification/**"
  - "sessions/**"
---

# Derivation Templates

## Plain Language Requirement

**Every major derivation or concept document SHOULD include a plain-language section.**

Why:
- If you can't explain it simply, you might not fully understand it
- Makes the framework accessible to non-specialists
- Helps identify where we're hiding complexity behind jargon
- Creates a "sanity check" on technical claims

When to include:
- Any document explaining a physical concept (Big Bang, black holes, etc.)
- Major derivations (Einstein equations, fine structure constant, etc.)
- Foundational axioms and their consequences

Format: Add a `## Plain Language` section near the top of the document, after the header but before technical details.

---

## Standard Claim Documentation

Use this template when documenting ANY derivation:

```markdown
## [Claim Name]

**Confidence**: [AXIOM | THEOREM | DERIVATION | CONJECTURE | SPECULATION]

**Statement**: [Precise mathematical statement]

## Plain Language

[2-5 paragraphs explaining this in everyday terms. No equations. Use analogies. Answer "what does this actually mean?"]

**One-sentence version**: [Capture the essence in a single sentence]

**Derivation Chain**:
- Step 1 [A: axiom used] → Result
- Step 2 [D: derived from step 1] → Result
- Step 3 [I: import used] → Final result

**Assumptions** (exhaustive list):
1. [Assumption 1] — [A-AXIOM | A-IMPORT | A-STRUCTURAL | A-PHYSICAL]
2. [Assumption 2] — [tag]

**Logical Gaps**:
1. [Where does argument skip steps?]
2. [What needs more rigor?]

**Alternatives**:
- Could this follow from different assumptions?
- Is this the unique path?

**Numerical Coincidence Risk**: [LOW | MEDIUM | HIGH]
- [Why might this be numerology?]

**What Would Falsify This?**
- [Specific observation or calculation]

**Verification**: `verification/sympy/[script_name].py` — [PASS | PARTIAL | FAIL]
```

## Investigation File Template

For new investigation files in `framework/investigations/`:

```markdown
# [Investigation Title]

**Status**: ACTIVE | QUARANTINE | CANONICAL
**Created**: Session [N], YYYY-MM-DD
**Last Updated**: Session [M], YYYY-MM-DD

---

## Plain Language

[What is this about in everyday terms? 2-5 paragraphs, no equations, use analogies.]

**One-sentence version**: [The core idea in one sentence]

---

## Question

[What are we trying to answer?]

## Background

[Relevant context from previous work]

## Approach

[Method being used]

## Findings

### [Finding 1]

**Confidence**: [tag]

[Content with proper derivation chain]

**Verification**: [script reference]

### [Finding 2]

...

## Open Questions

1. [Question 1]
2. [Question 2]

## Dependencies

- Uses: [list of axioms/theorems/imports this depends on]
- Used by: [list of claims that depend on this]

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| [N] | [description] | [result] |
```

## Axiom Template

For new axioms in `core/axioms/`:

```markdown
# AXM_XXXX: [Axiom Name]

**Status**: CANONICAL | PROPOSED | DEPRECATED

## Statement

[Precise statement in semi-formal logic]

∀ p ∈ P: [predicate]

## Natural Language

[Plain English explanation]

## Motivation

[Why is this axiom needed?]

## Consequences

- [What theorems follow from this?]
- [What does this enable?]

## Constraints

- [What does this forbid?]
- [What structures are ruled out?]

## Layer

**Layer 0** (pure perspective) | **Layer 1** (mathematical consequence)

## Relations

- Depends on: [list of prior axioms]
- Enables: [list of theorems]
- Conflicts with: [any incompatible statements]
```

## Theorem Template

For new theorems in `core/theorems/`:

```markdown
# THM_XXXX: [Theorem Name]

**Status**: PROVEN | SKETCH | CLAIMED

## Statement

[Precise mathematical statement]

## Proof

### Given
- [AXM_XXXX]: [statement]
- [AXM_YYYY]: [statement]

### Derivation
1. [Step 1] — by [reference]
2. [Step 2] — by [reference]
...
n. [Conclusion] — QED

## Verification

**Script**: `verification/sympy/[name].py`
**Status**: PASS | PARTIAL | FAIL

## Implications

- [What does this enable?]
- [What does this constrain?]

## Notes

[Any additional context]
```

## Verification Script Template

For new scripts in `verification/sympy/`:

```python
#!/usr/bin/env python3
"""
[Title]: [What this script verifies]

KEY FINDING: [Main result in one line]

Formula: [Mathematical statement]
Measured: [Experimental value]
Error: [Percentage or ppm]
Status: VERIFICATION | DERIVATION | COMPARISON

Depends on:
- [List axioms/imports used]

Created: Session [N]
"""

from sympy import *
from sympy import Rational as R

# ==============================================================================
# ASSUMPTIONS (explicit)
# ==============================================================================

n_d = 4   # [D] Defect dimension from Frobenius
n_c = 11  # [D] Crystal dimension: Im(C) + Im(H) + Im(O) = 1 + 3 + 7

# ==============================================================================
# IMPORTS (from Standard Model / observation)
# ==============================================================================

MEASURED_VALUE = R(...)  # Source: [reference]

# ==============================================================================
# DERIVATION
# ==============================================================================

def compute_prediction():
    """[Description of calculation]"""
    # Step 1: [comment]
    step1 = ...

    # Step 2: [comment]
    result = ...

    return result

# ==============================================================================
# VERIFICATION
# ==============================================================================

def main():
    predicted = compute_prediction()

    error = abs(float(predicted - MEASURED_VALUE) / float(MEASURED_VALUE))
    error_ppm = error * 1e6

    print(f"Predicted: {predicted} = {float(predicted):.10f}")
    print(f"Measured:  {MEASURED_VALUE} = {float(MEASURED_VALUE):.10f}")
    print(f"Error: {error_ppm:.2f} ppm ({error*100:.6f}%)")

    # Tests
    tests = [
        ("Value computed correctly", predicted == expected),
        ("Within target precision", error < 1e-4),
        ("Uses only framework quantities", True),  # Manual check
    ]

    print("\n=== VERIFICATION ===")
    all_pass = True
    for name, passed in tests:
        status = "PASS" if passed else "FAIL"
        print(f"[{status}] {name}")
        if not passed:
            all_pass = False

    return all_pass

if __name__ == "__main__":
    main()
```

## Session Log Entry Template

For entries in `session_log.md`:

```markdown
## Session [N] — YYYY-MM-DD

**Focus**: [Main topic]

### Work Done
- [Item 1]
- [Item 2]

### Decisions Made
- [Decision 1] — [rationale]

### Issues Found
- I-XXX: [description] (SEVERITY)

### Files Modified
- [file1] — [what changed]
- [file2] — [what changed]

### Next Steps
1. [Priority 1]
2. [Priority 2]
```
