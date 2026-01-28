# Verification Directory Guidelines

## Purpose

This directory contains computational verification of ALL numerical claims. No calculation in the framework is trusted without a passing script here.

## Directory Structure

```
verification/
├── sympy/              # Python verification scripts
├── VERIFICATION_STATUS.md  # Summary of all script results
└── DERIVATION_CHAIN_AUDIT.md  # [A]/[I]/[D] chain tracking
```

## Script Requirements

### Naming Convention
```
[constant]_[type].py

Types:
- _prediction.py     # Derives a value
- _verification.py   # Confirms a known relationship
- _search.py         # Explores parameter space
- _test.py           # Tests a specific formula
```

### Mandatory Script Structure

Every script MUST have:

1. **Docstring header** with:
   - Title and KEY FINDING
   - Formula, Measured value, Error
   - Status: VERIFICATION | DERIVATION | COMPARISON
   - Dependencies (axioms/imports used)

2. **Explicit assumptions section**
   - Every input labeled with derivation chain tag
   - Imports clearly marked with source

3. **Verification tests**
   - At least 2-3 tests
   - Print [PASS] or [FAIL] for each
   - Return boolean for automation

4. **Error calculation**
   - Compare to measured value
   - Report in ppm or percentage
   - Use `sympy.Rational` for exact arithmetic

### Template

```python
#!/usr/bin/env python3
"""
[Title]

KEY FINDING: [result]
Formula: [math]
Measured: [value]
Error: [ppm or %]
Status: [type]

Depends on:
- [axiom/import 1]
- [axiom/import 2]
"""

from sympy import *

# ASSUMPTIONS
n_d = 4   # [D] from Frobenius

# IMPORTS
MEASURED = Rational(...)  # Source: [ref]

# CALCULATION
def compute():
    ...
    return result

# VERIFICATION
def main():
    predicted = compute()
    error = abs(float(predicted - MEASURED) / float(MEASURED))

    tests = [
        ("Computes correctly", ...),
        ("Within precision", error < ...),
    ]

    for name, passed in tests:
        print(f"[{'PASS' if passed else 'FAIL'}] {name}")

if __name__ == "__main__":
    main()
```

## Status Tracking

After running a script:

1. Update `VERIFICATION_STATUS.md` with result
2. Link script in relevant investigation file
3. If FAIL: document why and either fix or QUARANTINE the claim

## Common Imports

```python
from sympy import *
from sympy import Rational as R
from sympy import pi, sqrt, cos, sin, exp
from sympy import symbols, simplify, expand
```

## Precision Standards

| Error Level | Description |
|------------|-------------|
| Sub-ppm (<1 ppm) | Exceptional — verify assumptions carefully |
| Sub-percent (<1%) | Good — standard for framework predictions |
| Few percent (1-5%) | Acceptable — note any concerns |
| >5% | Investigate — may be wrong or incomplete |

## When Scripts Fail

1. Document the failure in script comments
2. Add to `archive/deprecated/` if abandoning
3. Note lessons learned
4. Update any claims that referenced it
