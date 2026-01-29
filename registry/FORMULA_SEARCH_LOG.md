# Formula Search Log

**Created**: 2026-01-28 (Session 120 - Red Team Review)
**Purpose**: Document the DENOMINATOR — every formula tried, not just successes
**Rule**: Log failures as thoroughly as successes

---

## Why This Exists

The Red Team critique identified a critical gap: we document successes but not the search process. Without knowing how many formulas were tried, we cannot assess whether matches are statistically significant.

**This file provides the denominator.**

---

## Logging Protocol

For every observable being investigated:

1. **Log EVERY formula tried** (success or failure)
2. **Timestamp entries**
3. **Record rejection reason** for failures
4. **Calculate running statistics**

---

## Observable: Fine Structure Constant (α)

### Historical Search Summary

| Session | Formula Attempted | Result | Status | Notes |
|---------|-------------------|--------|--------|-------|
| ~S40 | 1/(n_d² + n_c²) = 1/137 | 0.026% error | PARTIAL | Missing correction |
| ~S45 | Various π-based corrections | >0.1% | REJECTED | No structural motivation |
| S56 | 137 + 4/111 | 0.27 ppm | CURRENT | Phi_6 structure identified |

**Statistics**:
- Formulas attempted: ~15 (estimated from early sessions)
- Sub-1% matches: 2
- Sub-10 ppm: 1

**Note**: Early search process not fully documented. Going forward, all attempts logged.

---

## Observable: Proton-Electron Mass Ratio (m_p/m_e)

### Search Log

| Session | Formula Attempted | Precision | Status | Notes |
|---------|-------------------|-----------|--------|-------|
| S77 | 12 × 153 = 1836 | 0.002% | PARTIAL | Integer part only |
| S77 | 1836 + 11/72 | 0.57 ppm | CURRENT | Full formula |
| S77 | Systematic scan of n/d for d=2-200 | varies | SEARCH | 11,820 combinations tested |

**Statistics from `proton_electron_prime_search.py`**:
- Total formulas in scan: 11,820
- Sub-100 ppm matches: ~50
- Sub-10 ppm matches: 3
- Sub-1 ppm: 1 (the current formula)

**Transparency note**: This was a computational search. The structural interpretation (1836 = (H+O) × sum_of_squares) came AFTER finding the best numerical match.

---

## Observable: Weinberg Angle (θ_W)

### Search Log

| Session | Formula Attempted | Precision | Status | Notes |
|---------|-------------------|-----------|--------|-------|
| Early | sin²(θ_W) = 2/25 | 65% error | FALSIFIED | Moved to FALSIFIED.md |
| S89 | cos(θ_W) = 171/194 | 3.75 ppm | CURRENT | Structurally different |

**Statistics**:
- Formulas attempted for sin²: ~10
- Formulas attempted for cos: ~5
- Success: 1

---

## Template for New Observables

```markdown
## Observable: [Name]

### Search Log

| Session | Formula Attempted | Precision | Status | Notes |
|---------|-------------------|-----------|--------|-------|
| | | | | |

### Statistics
- Total formulas attempted:
- Sub-1% matches:
- Sub-100 ppm:
- Sub-10 ppm:

### Current Best
- Formula:
- Precision:
- Interpretation:
- Interpretation came: BEFORE / AFTER numerical match
```

---

## Observable: Phi_6 Cyclotomic Selection (Session 122)

### The Question

Why does Φ_6 (6th cyclotomic polynomial) appear in the alpha formula?

### Analysis Performed

**Script**: `verification/sympy/cyclotomic_selection_analysis.py`

Tested ALL cyclotomic polynomials Φ_k for k=1 to 20, evaluated at n_c=11.

### Cyclotomic Comparison for Alpha

| k | Φ_k(11) | 1/α predicted | Error (ppm) | Status |
|---|---------|---------------|-------------|--------|
| 6 | 111 | 137.036036 | **0.27** | CURRENT |
| 4 | 122 | 137.032787 | 23.44 | REJECTED (87× worse) |
| 3 | 133 | 137.030075 | 43.23 | REJECTED |
| 10 | 13421 | 137.000298 | 260.52 | REJECTED |
| 2 | 12 | 137.333333 | 2169.75 | REJECTED |

### Key Finding

**Φ_6 is NOT arbitrary** — it emerges from Lie algebra structure:

```
u(n_c) generators = n_c² = 121
├── Cartan (diagonal): n_c - 1 = 10
├── Off-diagonal (roots): n_c(n_c-1) = 110
└── U(1) (identity): 1

EM channels = 110 + 1 = 111 = n_c² - n_c + 1 = Φ_6(n_c)
```

The formula n² - n + 1 = Φ_6(n) is a mathematical identity for ALL n.

### Division Algebra Connection

- 6 = C × Im_H = 2 × 3
- deg(Φ_6) = 2 = dim(C)
- Roots at ±60° → hexagonal symmetry

### Status

| Claim | Status |
|-------|--------|
| Φ_6(11) = 111 | VERIFIED (mathematical fact) |
| 111 = EM channels in u(11) | DERIVED (Lie algebra) |
| k=6 best for alpha | VERIFIED (87× better than k=4) |
| 6 = C × Im_H connection | OBSERVED (not proven necessary) |

### Remaining Weakness

We derive Φ_6(n_c) from Lie algebra decomposition, but haven't proven axiomatically that:
1. The coupling MUST use (off-diagonal + U(1)) specifically
2. The hexagonal structure (6 = 2×3) is required by division algebra axioms

**Confidence**: The derivation is structurally motivated but has gaps.

---

## Running Global Statistics

| Metric | Value | Updated |
|--------|-------|---------|
| Total observables investigated | ~62 | 2026-01-28 |
| Total formulas attempted (est.) | ~500+ | 2026-01-28 |
| Sub-1% matches | ~53 | 2026-01-28 |
| Sub-10 ppm matches | 12 | 2026-01-28 |
| Sub-ppm matches | 3 | 2026-01-28 |

**Estimated hit rate at sub-ppm**: 3/500+ = <0.6%

(Compare to flexibility test: 0% random match at sub-ppm)

---

## Session-by-Session Log (Going Forward)

### Session 121+ Template

```markdown
### Session [N]: [Observable]

**Formulas tried this session**:
1. [formula] → [result] → [status]
2. [formula] → [result] → [status]
...

**Session statistics**:
- Attempted: N
- Rejected: M
- Kept for further investigation: K
```

---

*This log exists to provide honest accounting of the search process. Document failures as carefully as successes.*
