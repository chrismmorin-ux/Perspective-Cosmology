# Tier 2: Possibly Significant Claims

**Status**: UNCERTAIN - These are at 10-100 ppm precision where random match rate is ~30%

**Created**: 2026-01-27
**Purpose**: Claims that MAY be significant but cannot be definitively distinguished from numerology

---

## Statistical Basis

At 0.01% (100 ppm) tolerance, the flexibility test shows:
- Random matching probability: **~31%**

This means about 1 in 3 random numbers can be matched by framework formulas at this precision.

**These claims are NOT definitive evidence** but are worth noting as potentially meaningful.

---

## POSSIBLY SIGNIFICANT - NEEDS VERIFICATION

### Claim: Koide Theta (Lepton)

| Property | Value |
|----------|-------|
| **Formula** | theta = pi x 73/99 x (1 + 1/17689) |
| **Predicted** | 2.31654... rad |
| **Measured** | 2.31646 rad |
| **Precision** | **14.7 ppm** |
| **Random match probability** | ~30% |

**Framework Numbers**:
- 73 = 3^2 + 8^2 = Im_H^2 + O^2 (generation-color structure)
- 99 = Im_H^2 x n_c = 9 x 11
- 17689 = 133^2 = (Im_O x (n_c + O))^2

**Status**: POSSIBLY SIGNIFICANT - Same prime 73 appears in Weinberg angle

**Verification**: `koide_theta_best_formula.py`

---

### Claim: sin^2(theta_W) at M_Z (MS-bar)

| Property | Value |
|----------|-------|
| **Formula** | sin^2(theta_W) = 123/532 = 123/(4 x 7 x 19) |
| **Predicted** | 0.231203... |
| **Measured** | 0.23122 |
| **Precision** | **30 ppm** |
| **Random match probability** | ~30% |

**Framework Numbers**:
- 123 = 3 x 41
- 532 = 4 x 133 = 4 x 7 x 19
- 7 = Im_O, 19 = n_c + O

**Status**: POSSIBLY SIGNIFICANT - Uses MS-bar scheme with O-based products

**Verification**: `weinberg_best_formula.py`

---

### Claim: Muon-Electron Mass Ratio (m_mu/m_e)

| Property | Value |
|----------|-------|
| **Formula** | m_mu/m_e = 8891/43 = (207 x 43 - 10)/43 |
| **Predicted** | 206.768... |
| **Measured** | 206.7683 |
| **Precision** | **4.1 ppm** |
| **Random match probability** | ~30% |

**Framework Numbers**:
- 43 = Phi_6(7) = cyclotomic value at Im_O
- 8891 = 207 x 43 - 10 = lepton formula

**Status**: POSSIBLY SIGNIFICANT - Uses cyclotomic structure

**Verification**: `lepton_mass_ratio_search.py`

---

### Claim: Tau-Muon Mass Ratio (m_tau/m_mu)

| Property | Value |
|----------|-------|
| **Formula** | m_tau/m_mu = 185/11 = 16 + 9/11 |
| **Predicted** | 16.8182... |
| **Measured** | 16.817 |
| **Precision** | **70 ppm** |
| **Random match probability** | ~30% |

**Framework Numbers**:
- 185 = 5 x 37 or H^2 + Im_H^2 (16 + 9 = 25... not quite)
- 11 = n_c

**Status**: POSSIBLY SIGNIFICANT - Uses crystal dimension

**Verification**: `lepton_mass_ratio_search.py`

---

### Claim: v/m_p Ratio

| Property | Value |
|----------|-------|
| **Formula** | v/m_p = 11284/43 |
| **Predicted** | 262.42... |
| **Measured** | 262.36 |
| **Precision** | **21 ppm** |
| **Random match probability** | ~30% |

**Framework Numbers**:
- 11284 = 4 x 2821 or other factorization
- 43 = Phi_6(7) (same as muon ratio!)

**Status**: POSSIBLY SIGNIFICANT - Connection to muon suggests real structure

**Verification**: Needed

---

## Pattern: Cyclotomic 43

Multiple Tier 2 claims use 43 = Phi_6(7):
- m_mu/m_e = 8891/43
- v/m_p = 11284/43

This could indicate:
1. Real structure involving seventh cyclotomic
2. Overfitting to available numbers

---

## Why These Are NOT Tier 1

| Claim | Precision | Gap to Tier 1 |
|-------|-----------|---------------|
| Koide theta | 14.7 ppm | Need < 10 ppm |
| sin^2(theta_W) | 30 ppm | Need < 10 ppm |
| m_mu/m_e | 4.1 ppm | Formula less clean than Tier 1 |
| m_tau/m_mu | 70 ppm | Need < 10 ppm |
| v/m_p | 21 ppm | Need < 10 ppm |

---

## Honest Assessment

These 5 claims are in a gray zone:
- **Better than most** (sub-100 ppm)
- **Not definitive** (30% random match rate)
- **Suggestive patterns** (cyclotomic 43 reuse)

They would become more significant if:
1. Multiple independent derivation paths converge
2. Precision improves to sub-10 ppm
3. They connect to Tier 1 claims in clear ways

---

*Last updated: 2026-01-27 (Session 106)*
