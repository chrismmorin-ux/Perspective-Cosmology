# Verification Protocol

## The Cardinal Rule

**No calculation in markdown without a verification script.**

Claude's mathematical reasoning can hallucinate "proofs" that look correct but aren't. All numerical claims MUST be computationally verified.

## Workflow

```
1. CLAIM: "α = 137 + 4/111"
2. SCRIPT: Write verification/sympy/alpha_enhanced_prediction.py
3. RUN: Execute script, confirm output
4. DOCUMENT: Only THEN add to markdown with script reference
```

## SymPy Script Standards

Every script MUST include:

```python
#!/usr/bin/env python3
"""
[Clear title describing what's verified]

KEY FINDING: [Main result]

Formula: [Mathematical statement]
Measured: [Experimental value with source]
Error: [Percentage or ppm]
Status: VERIFICATION | DERIVATION | COMPARISON
"""

from sympy import *

# 1. STATE ASSUMPTIONS EXPLICITLY
n_d = 4   # [D] from Frobenius
n_c = 11  # [D] from n_d via R + C + H + O

# 2. PERFORM CALCULATION
result = formula(n_d, n_c)

# 3. COMPARE TO MEASUREMENT
measured = Rational(137035999206, 10**12)  # CODATA 2022
error = abs(result - measured) / measured

# 4. VERIFICATION TESTS
tests = [
    ("Formula evaluates correctly", condition1),
    ("Within target precision", condition2),
    ("Uses only framework quantities", condition3),
]

for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
```

## What Requires Scripts

| Action | Script Required? |
|--------|-----------------|
| Any numerical prediction | YES |
| Any "X ≈ Y" claim | YES |
| Any "within N% of measurement" | YES |
| Any sensitivity analysis | YES |
| Pure symbolic derivation | Recommended |
| Logical argument | No, but document gaps |

## Script Naming Convention

```
verification/sympy/[constant]_[type].py

Examples:
- alpha_enhanced_prediction.py
- weinberg_best_formula.py
- koide_theta_prime_attractor.py
- ckm_completion_search.py
```

## Verification Statuses

| Status | Meaning |
|--------|---------|
| **PASS** | Script runs, tests pass, values match |
| **PARTIAL** | Some tests fail, investigate |
| **FAIL** | Does not work — QUARANTINE the claim |

## After Verification

1. Add result to `verification/VERIFICATION_STATUS.md`
2. Update `registry/derivations_summary.md`
3. Link script in the relevant investigation file
4. If FAIL: document in `archive/deprecated/` with lessons
