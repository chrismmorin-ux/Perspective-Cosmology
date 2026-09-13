# Contributing

Thank you for your interest in Perspective Cosmology. This is currently a solo research project, but contributions are welcome.

## Running Verification Scripts

The primary way to engage with this work is to run the verification scripts:

```bash
# Requirements
pip install sympy

# Run a specific verification
python verification/sympy/alpha_enhanced_prediction.py

# All scripts follow the same pattern:
# 1. State assumptions explicitly
# 2. Perform calculation using SymPy exact arithmetic
# 3. Compare to measured value
# 4. Print PASS/FAIL for each test
```

## Reporting Errors

If you find:
- A **mathematical error** in a verification script
- A **logical gap** in a derivation
- An **incorrect measurement value** used for comparison
- A **broken cross-reference** between documents

Please open a [GitHub Issue](../../issues) with:
1. The specific file and line number
2. What you believe is incorrect
3. The correction or reference supporting your finding

## Suggesting Improvements

For suggestions about the framework itself (alternative derivations, new predictions, connections to other work), please open a GitHub Issue tagged as a suggestion.

## What This Project Is

This is speculative, amateur, AI-assisted theoretical work exploring whether division algebra geometry can derive physical constants. It is **not** peer-reviewed and carries a self-assessed 25-40% probability of constituting genuine physics. Please engage with appropriate skepticism.

## Code of Conduct

Be respectful, be specific, be honest. Mathematical criticism is welcome and encouraged -- that's how science works.
