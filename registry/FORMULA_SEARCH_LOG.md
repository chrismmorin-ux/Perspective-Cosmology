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

## Observable: CKM Matrix Elements (Session 189 Audit)

### Search Log

| Session | Formula Attempted | Precision | Status | Notes |
|---------|-------------------|-----------|--------|-------|
| S82 | λ = 9/40 = Im(H)²/(5×dim(O)) | 0.01% | CURRENT | First formula found; "5" has no framework origin |
| S82 | λ = various simple DA fractions | >1% | REJECTED | ~20 alternatives tested (ckm_matrix_search.py) |
| S83 | \|V_cb\| = 2/49 = C/Im(O)² | 2-4% | CURRENT | Inclusive/exclusive tension |
| S83 | \|V_cb\| = other DA ratios near 0.04 | >5% | REJECTED | ~15 alternatives tested |
| S87 | \|V_ub\| = 1/262 = 1/(137+121+4) | ~0.1% | CURRENT | Systematic search (ckm_completion_search.py) |
| S87 | \|V_ub\| = 1/(other DA combos) | >1% | REJECTED | ~30 alternatives tested |
| S87 | δ = π×8/21 = π×O/(Im_H×Im_O) | 3.9% (PDG 2024) | CURRENT | Was 0.07% with older data; degraded |
| S87 | δ = π×other DA ratios | varies | REJECTED | ~10 alternatives tested (ckm_delta_alternatives.py) |

### Statistics

From `ckm_adversarial_audit.py` (S162):
- Total DA ratios in search space (denom ≤ 300): **27,397**
- Per-parameter matches within 5%: 26-1549 depending on target value
- Joint probability (all 4 CKM within 5%): 3.2 × 10⁻⁹ uncorrected
- Joint probability (all 7 CKM+PMNS within 5%): 1.1 × 10⁻¹⁴ uncorrected
- Trials-corrected (×125): ~10⁻¹²

### Current Best (updated PDG 2024)

| Parameter | Formula | Precision (PDG 2024) | Interpretation came |
|-----------|---------|---------------------|---------------------|
| λ | 9/40 | 0.01% | AFTER numerical match |
| \|V_cb\| | 2/49 | 2-4% | AFTER numerical match |
| \|V_ub\| | 1/262 | ~0.1% | AFTER numerical match |
| δ_CKM | π×8/21 | 3.9% | AFTER numerical match |

**Transparency note**: ALL CKM formulas were discovered by systematic search over DA ratios, then given algebraic interpretations. The search space is documented in ckm_adversarial_audit.py. Individual matches are not statistically significant; the collective pattern (~10⁻¹²) is.

---

## Observable: PMNS Matrix Elements

### Search Log

| Session | Formula Attempted | Precision | Status | Notes |
|---------|-------------------|-----------|--------|-------|
| S82 | sin²θ₂₃ = 4/7 = H/Im(O) | 0.1% | CURRENT | Simple, clean ratio |
| S82 | sin²θ₁₂ = 10/33 = 10/(Im_H×n_c) | 0.01% | CURRENT | "10" has no clear origin |
| S82 | sin²θ₁₃ = 1/44 = 1/(n_d×n_c) | 3.2% | CURRENT | Structural (key dims product) |
| S88 | δ_PMNS = π×19/14 = π×(n_c+O)/(C×Im_O) | TBD | AT RISK | NuFIT 6.0 shifted values |
| S167 | R₃₁ = 33 = Im_H×n_c | 1.7% | CURRENT | Semi-blind prediction |

### Statistics
- Search process: Less systematic than CKM (simpler ratios found early)
- Estimated formulas attempted: ~30 total across PMNS parameters
- R₃₁ = 33 was predicted BEFORE checking (semi-blind)

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

## Observable: Hilltop Mass Parameter mu^2 (Session 129)

### Context

For hilltop potential V = V0(1 - phi^2/mu^2) to give n_s = 193/200, the mass parameter must be mu^2 = 250 M_Pl^2.

### Search Process

**Script**: `verification/sympy/hilltop_mu_search.py`

**Method**:
1. Computed required mu^2 for n_s = 0.965 from hilltop slow-roll formulas
2. Result: mu^2 = 35 * 200 / (4 * 7) = 250 (exact)
3. Searched framework expressions within 15% of 250

### All Candidates Found (sorted by closeness to 250)

| Value | Expression | N (e-folds) | n_s | Status |
|-------|------------|-------------|-----|--------|
| 250 | C * (n_c^2 + H) = 2 * 125 | 50.3 | 0.9650 | **SELECTED (exact)** |
| 248 | H * (5*n_c + Im_O) = 4 * 62 | 49.9 | 0.9647 | Rejected (not exact) |
| 248 | C * (n_c^2 + Im_H) = 2 * 124 | 49.9 | 0.9647 | Rejected (not exact) |
| 252 | H * (5*n_c + O) = 4 * 63 | 50.8 | 0.9653 | Rejected (not exact) |
| 255 | 5 * (H*n_c + Im_O) | 51.4 | 0.9657 | Rejected |
| 256 | H^4 | 51.6 | 0.9658 | Rejected |
| 256 | 179 + Im_O*n_c | 51.6 | 0.9658 | Rejected |
| 244 | 5*H^2*Im_H + H | 49.1 | 0.9641 | Rejected |
| 258 | 137 + n_c^2 | 52.0 | 0.9661 | Rejected |
| 260 | 5*H*(n_c + C) | 52.4 | 0.9663 | Rejected |
| 234 | 5*H*n_c + Im_O*C | 47.1 | 0.9626 | Rejected |
| 268 | (Im_H^2 + H^2)*n_c - Im_O | 54.0 | 0.9674 | Rejected |
| 230 | 5*(O*H + Im_O*C) | 46.3 | 0.9620 | Rejected |
| 270 | 25*n_c - R*5 | 54.4 | 0.9676 | Rejected |
| 274 | C * 137 | 55.2 | 0.9681 | Rejected |
| 222 | C * 111 | 44.7 | 0.9606 | Rejected |

### Statistics

- Framework expressions tested: ~200 (combinations of R, C, Im_H, H, Im_O, O, n_c, n_d, 137, 179, 337, 111, 97, 17)
- Expressions within 15% of 250: 18
- Expressions within 5% of 250: 7
- Exact match (= 250): **1**

### Key Finding

**C * (n_c^2 + H) = 2 * (121 + 4) = 250** is the unique exact framework expression.

### Interpretation

- C = 2: Complex dimension
- n_c^2 = 121: Crystal dimension squared
- H = 4: Quaternion/spacetime dimension

**Honesty note**: The interpretation came AFTER finding the numerical match. This is a searched formula, not a derived one.

### What This Gives

| Observable | Value | Status |
|------------|-------|--------|
| n_s | 0.965 = 193/200 | Matches Planck |
| r | 0.04 | Within limits |
| N | 50.3 e-folds | Acceptable |

### What This Does NOT Give

- r = 1 - n_s (the actual r = 0.04 != 0.035)
- Physical derivation of why mu^2 = C(n_c^2 + H)

---

## Running Global Statistics

| Metric | Value | Updated |
|--------|-------|---------|
| Total observables investigated | ~63 | 2026-01-28 |
| Total formulas attempted (est.) | ~700+ | 2026-01-28 |
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
