# Contributing

Perspective Cosmology is currently one person's speculative framework, not a community project. That said, feedback and contributions are welcome.

## How to Help

### Report Errors

The most valuable contribution is finding mistakes. If you find an error in:
- A mathematical derivation
- A verification script
- A numerical value or measurement comparison
- A logical gap in the derivation chain

Please open a [GitHub Issue](../../issues) with:
1. Which file contains the error
2. What the error is
3. What the correct result should be (if known)

### Run Verification Scripts

All 737+ verification scripts are in `verification/sympy/`. They require Python 3.x and SymPy:

```bash
pip install sympy

# Run any script — each prints PASS/FAIL
python verification/sympy/alpha_enhanced_prediction.py
python verification/sympy/weinberg_best_formula.py
```

Every script follows the same structure:
1. State assumptions explicitly
2. Perform symbolic calculation
3. Compare to measured value (CODATA 2022 / PDG 2024)
4. Print PASS/FAIL with tolerance

If a script fails on your system, please report it.

### Suggest Improvements

For questions, suggestions, or discussion, open a GitHub Issue. Label suggestions:
- `error` — Mathematical or computational error found
- `question` — Question about the framework
- `suggestion` — Improvement idea
- `falsification` — Evidence against a prediction

### Code Contributions

If you want to contribute verification scripts:
- Follow the existing script format (see any script in `verification/sympy/`)
- Use `framework_constants.py` for centralized measured values
- Include PASS/FAIL output
- Submit via pull request

## What This Project Is Not (Yet)

This is a speculative framework with a 25-40% self-assessed probability of being genuine physics. It has not been peer-reviewed. Contributions should be understood in that context — you're helping evaluate a candidate theory, not contributing to established science.

## License

By contributing, you agree that your contributions will be licensed under the same terms as the rest of the repository (CC BY-SA 4.0 for content, MIT for code).
