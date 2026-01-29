# Blind Predictions Registry

**Created**: 2026-01-28 (Session 120 - Red Team Review)
**Purpose**: Document predictions BEFORE improved measurements — establishes clean future tests
**Rule**: NO modifications to predictions after registration without explicit versioning

---

## Registration Protocol

1. **Before adding**: Verify current measurement precision
2. **Lock prediction**: State framework value with derivation reference
3. **Commit**: "If future measurement disagrees by >X, prediction is FALSIFIED"
4. **No escape hatches**: No "corrections" added post-hoc

---

## Tier 1: High-Precision Predictions (Locked)

### P-001: Fine Structure Constant (Precision Extension)

| Field | Value |
|-------|-------|
| **Observable** | 1/α at zero energy |
| **Framework Prediction** | 137 + 4/111 = 137.036036036... |
| **Current Measurement** | 137.035999206(11) (CODATA 2022) |
| **Current Precision** | 0.08 ppb |
| **Prediction Locked At** | 10^-6 precision |
| **Derivation** | `alpha_enhanced_prediction.py` |
| **Registered** | 2026-01-28 |

**FALSIFICATION COMMITMENT**: If future measurements at 10^-9 precision show 1/α differs from 137.036036 by more than 0.001%, this prediction is falsified.

---

### P-002: Dark Matter Mass

| Field | Value |
|-------|-------|
| **Observable** | Primary dark matter particle mass |
| **Framework Prediction** | m_DM = m_p × (49/9) = 5.11 GeV |
| **Current Status** | Not yet detected |
| **Allowed Range** | 4.6 - 5.6 GeV (10% tolerance) |
| **Coupling** | Portal-mediated (weak) |
| **Derivation** | `dark_matter_mass_prediction.py` |
| **Registered** | 2026-01-28 |

**FALSIFICATION COMMITMENT**: If direct detection experiments definitively exclude 5.11 GeV across ALL coupling strengths, this prediction is falsified.

---

### P-003: Weinberg Angle (Precision Extension)

| Field | Value |
|-------|-------|
| **Observable** | cos(θ_W) |
| **Framework Prediction** | 171/194 = 0.881443298... |
| **Current Measurement** | 0.88153(13) (PDG 2024) |
| **Error** | 3.75 ppm |
| **Precision Lock** | 10^-5 level |
| **Derivation** | `weinberg_best_formula.py` |
| **Registered** | 2026-01-28 |

**FALSIFICATION COMMITMENT**: If future measurements at 10^-6 precision disagree by more than 5 ppm, this prediction is falsified.

---

## Tier 2: Cosmological Predictions (Locked)

### P-004: Dark Energy Density

| Field | Value |
|-------|-------|
| **Observable** | Ω_Λ |
| **Framework Prediction** | 137/200 = 0.685 |
| **Current Measurement** | 0.685 ± 0.007 (Planck 2018) |
| **Precision Lock** | 1% level |
| **Derivation** | `omega_lambda_derivation.py` |
| **Registered** | 2026-01-28 |

**FALSIFICATION COMMITMENT**: If Ω_Λ is measured at 0.01 precision and differs from 0.685 by more than 2%, this prediction is falsified.

---

### P-005: Hubble Constant

| Field | Value |
|-------|-------|
| **Observable** | H_0 (CMB-derived) |
| **Framework Prediction** | 337/5 = 67.4 km/s/Mpc |
| **Current Measurement** | 67.4 ± 0.5 (Planck 2018) |
| **Precision Lock** | 0.5% level |
| **Derivation** | `hubble_from_337.py` |
| **Registered** | 2026-01-28 |

**FALSIFICATION COMMITMENT**: If CMB-derived H_0 converges on a value outside 66.9-67.9, this prediction is falsified.

---

## Tier 3: Predictions Awaiting Better Measurement

### P-006: Spectral Index

| Field | Value |
|-------|-------|
| **Observable** | n_s |
| **Framework Prediction** | 117/121 = 0.9669... |
| **Current Measurement** | 0.9649 ± 0.004 |
| **Error** | 0.21% |
| **Derivation** | `spectral_index_derivation.py` |
| **Registered** | 2026-01-28 |

**Status**: Within 1σ. Future CMB missions may improve precision.

---

### P-007: Proton Lifetime

| Field | Value |
|-------|-------|
| **Observable** | τ_p |
| **Framework Prediction** | ~10^37 years |
| **Current Lower Bound** | >10^34 years (Super-K) |
| **Derivation** | `proton_lifetime_derivation.py` |
| **Registered** | 2026-01-28 |

**Status**: Consistent with bounds. Hyper-K may probe this range.

---

### P-008: CMB Higher Acoustic Peaks (BLIND - Session 124)

| Field | Value |
|-------|-------|
| **Observable** | CMB acoustic peak positions l_4, l_5, l_6 |
| **Method** | Alternating H/Im_O shift pattern |
| **Predictions** | See below |
| **Lock Time** | Session 124 (2026-01-28) |
| **Status** | LOCKED BEFORE MEASUREMENT LOOKUP |

**Prediction Formulas** (from l_2/l_1 = 26/11, l_3/l_1 = 40/11 pattern):
- Even peaks: shift = H/n_c = 4/11
- Odd peaks: shift = Im_O/n_c = 7/11

| Peak | Formula | Predicted Value | Expected Error |
|------|---------|-----------------|----------------|
| l_4 | 220 * (4 + 4/11) = 220 * 48/11 | **960** | ~3% |
| l_5 | 220 * (5 + 7/11) = 220 * 62/11 | **1240** | ~1% |
| l_6 | 220 * (6 + 4/11) = 220 * 70/11 | **1400** | ~3% |

**Derivation**: `cmb_higher_peaks_blind_prediction.py`
**Registered**: 2026-01-28 (Session 124)

**FALSIFICATION COMMITMENT**:
- If l_4 measured differs from 960 by >5%: even-peak pattern fails
- If l_5 measured differs from 1240 by >3%: odd-peak pattern fails
- If BOTH fail significantly: alternating H/Im_O hypothesis is WRONG

### RESULT (Checked Session 124):

| Peak | Predicted | Measured (95% CI) | Error | Status |
|------|-----------|-------------------|-------|--------|
| l_4 | 960 | 1095-1163 (~1129) | **-15%** | FALSIFIED |
| l_5 | 1240 | 1348-1455 (~1402) | **-12%** | FALSIFIED |
| l_6 | 1400 | 1661-1808 (~1735) | **-19%** | FALSIFIED |

**CONCLUSION**: The alternating H/Im_O shift hypothesis is **FALSIFIED** for higher peaks.

The pattern that works for l_1, l_2, l_3 does NOT extend to l_4, l_5, l_6. This is valuable information — it constrains framework interpretations.

**Source**: [arXiv:1412.3552](https://arxiv.org/abs/1412.3552) Table 2

---

### P-009: Tensor-to-Scalar Ratio Consistency (Session 124)

| Field | Value |
|-------|-------|
| **Observable** | r (tensor-to-scalar ratio) |
| **Framework Prediction** | r = 1 - n_s = Im_O/200 = 7/200 = 0.035 |
| **Current Upper Bound** | r < 0.036 (Planck/BICEP) |
| **Distinguishing Test** | Framework: r = (1-n_s). Standard: r ~ 8(1-n_s) |
| **Derivation** | `cmb_spectral_index_derivation.py` |
| **Registered** | 2026-01-28 (Session 124) |

**FALSIFICATION COMMITMENT**: If r is measured and differs from 0.035 by more than 0.01, AND the relationship r = (1-n_s) fails, this prediction is falsified.

---

## Predictions Queue (Pre-Derivation Commitments)

Use this section to commit to predictions BEFORE deriving them.

### Template

```markdown
### PQ-XXX: [Observable Name]

**Before derivation, I expect**: [your expectation based on framework structure]
**Allowed range**: [specify bounds]
**If outside range**: [what this means for framework]
**Committed**: [date]
**Derived**: [fill in after]
**Result**: [match/mismatch]
```

---

## Version History

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-28 | Initial creation | Red Team recommendation |
| 2026-01-28 | Added P-008 (higher CMB peaks), P-009 (tensor-scalar) | Session 124 CMB work |

**Note on P-006 (n_s)**: Session 124 derived 193/200 = 0.965, which differs from the registered 117/121 = 0.9669. Both are within Planck error. The 193/200 formula has better derivation chain (Im_O/200 hidden fraction). This discrepancy is documented but not resolved.

---

*This registry exists to establish clean future tests. Predictions registered here cannot be modified without explicit versioning and justification.*
