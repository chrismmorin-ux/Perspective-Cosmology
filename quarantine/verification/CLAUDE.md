# Verification Directory

Computational verification of ALL numerical claims. No calculation is trusted without a passing script here.

## Structure

```
verification/
├── sympy/                     # 525+ Python verification scripts
├── VERIFICATION_STATUS.md     # Summary of script results
└── DERIVATION_CHAIN_AUDIT.md  # [A]/[I]/[D] chain tracking
```

## Script Naming

`[constant]_[type].py` — Types: `_prediction.py`, `_verification.py`, `_search.py`, `_test.py`

## Mandatory Script Structure

1. Docstring: title, KEY FINDING, formula, measured value, error, status, dependencies
2. Explicit assumptions section (every input labeled with derivation chain tag)
3. Verification tests (2-3 minimum, print [PASS]/[FAIL])
4. Error calculation (ppm or percentage, use `sympy.Rational` for exact arithmetic)

## Precision Standards

| Error | Level |
|-------|-------|
| < 1 ppm | Exceptional — verify assumptions carefully |
| < 1% | Good — standard for framework predictions |
| 1-5% | Acceptable — note concerns |
| > 5% | Investigate — may be wrong or incomplete |

## After Running

1. Link script in relevant investigation file
2. If FAIL: document why, either fix or QUARANTINE the claim
