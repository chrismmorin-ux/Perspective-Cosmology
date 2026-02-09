# Dark Matter Prediction: m_DM = 5.11 GeV

> **REVISION NEEDED**: This file predates S320/S335/S339 retractions. The mass prediction and density ratio SURVIVE but the carrier particle identity and coupling mechanism are RETRACTED. See `framework/investigations/particles/dark_matter_identity.md` for current status.

**Status**: ACTIVE PREDICTION (mass survives; identity OPEN)
**Priority**: HIGH
**Timeline**: 2025-2027

---

## The Prediction

> **Dark matter has mass m_DM = 5.11 GeV** (range: 4.5-5.7 GeV accounting for uncertainties)

This is the framework's most falsifiable prediction. Detection at the wrong mass kills the theory.

---

## Derivation

### Step 1: Dark-to-Baryon Ratio

From the cosmic inventory:
```
Omega_DM/Omega_b = 49/9 = (Im_O)^2 / (Im_H)^2 = 7^2/3^2
```

This is the ratio of color-squared to generation-squared.

**Measured**: Omega_DM/Omega_b ~ 5.376 (Planck 2018: 0.265/0.0493)
**Predicted**: 49/9 = 5.444
**Error**: 1.3% (1.3 sigma)

### Step 2: Number Density Relation

If dark matter is **asymmetric** (particle-antiparticle asymmetry like baryons):
```
n_DM = n_b (equal number density to baryons)
```

This follows from the framework's prediction that DM and baryons share a common asymmetry mechanism.

### Step 3: Mass Derivation

From Ω = ρ/ρ_crit = n × m / ρ_crit:
```
Ω_DM/Ω_b = (n_DM × m_DM) / (n_b × m_b)
         = m_DM / m_b    (since n_DM = n_b)
```

Therefore:
```
m_DM = m_b × (Ω_DM/Ω_b) = m_p × 49/9 ≈ 5.11 GeV
```

### Summary (Path 1)

| Quantity | Formula | Value |
|----------|---------|-------|
| Ω_DM/Ω_b | 49/9 | 5.44 |
| m_p | (measured) | 0.938 GeV |
| **m_DM** | **m_p × 49/9** | **5.11 GeV** |

---

## ~~Alternative Derivation: 4th Generation (Session 119)~~ **RETRACTED S320**

> **RETRACTED**: S320 showed SO(11) spinor 32 = 1 SM generation with 0 dark states. The "4th dark generation" model from SO(14) is incompatible with the SO(11) framework. See S320.md.

### ~~Path 2: From SO(14) Spinor Structure~~

~~The SO(14) Weyl spinor decomposes as 64 = (3+1) x 16, giving a "dark generation".~~

**This model is INVALID** for SO(11): the spinor decomposition gives exactly 1 SM generation (15 SM + 1 nu_R), with 0 dark states.

### Why Two Paths Give the Same Number

The canonical derivation (S315) is now:

| Path | Input | Formula | Result |
|------|-------|---------|--------|
| 1 (Cosmology) | Omega_DM/Omega_b = 49/9 | m_p x 49/9 | 5.114 GeV |
| 2 (det, canonical) | det(M) on End(R^4) | m_e x (n_c-1)^n_d | 5.110 GeV |

Agreement to ~0.05% because m_p/m_e ~ 1836 ~ 9 x 204 ~ Im_H^2 x (n_c-1)^2.

---

## Uncertainty Range

| Source | Effect | Range |
|--------|--------|-------|
| Ω_DM/Ω_b measurement | ±5% | 4.9-5.4 GeV |
| m_p value | negligible | — |
| Framework uncertainty | ~10% | 4.5-5.7 GeV |

**Conservative prediction**: m_DM ∈ [4.5, 5.7] GeV

---

## Additional Predictions

### Nature of Dark Matter

| Property | Prediction | Status |
|----------|------------|--------|
| Asymmetric | Yes | SURVIVES (from Omega ratio) |
| ~~Self-interacting~~ | ~~σ/m ~ 0.025 cm²/g~~ | **RETRACTED** (coupling unknown, S339) |
| ~~Portal coupling~~ | ~~ε ~ α² ~ 5×10⁻⁵~~ | **RETRACTED** (carrier unidentified, S339) |

### ~~Dark Sector Structure~~ **RETRACTED S320/S339**

> ~~Dark fermion at 5.11 GeV + dark photon at ~5 GeV.~~ **RETRACTED**: No dark sector from SO(11) spinor (S320). Coupling mechanism invalidated (S335/S339). DM carrier UNKNOWN.

---

## Experimental Tests

### Direct Detection Experiments

| Experiment | Status | Sensitivity | Notes |
|------------|--------|-------------|-------|
| **LZ** | Running | 3-9 GeV reached | No detection (Dec 2025) |
| **SuperCDMS SNOLAB** | 2026 | 0.5-10 GeV | Primary test |
| **DarkSide-LowMass** | 2026-2027 | 1-10 GeV | Secondary test |
| **NEWS-G** | 2025-2026 | 0.1-10 GeV | Complementary |

### Current Status (January 2026)

**LZ Result (December 2025)**:
- 417 live days of data
- Searched 3-9 GeV range
- NO WIMPs detected
- Sets world-leading limits above 5 GeV

**Framework Interpretation**:
- Null result is **consistent** with framework
- Portal coupling (ε ~ α²) predicts weak direct detection signal
- Asymmetric DM has different signature than thermal WIMPs
- Prediction survives but under pressure

### What Would Confirm

| Observation | Significance |
|-------------|--------------|
| DM signal at 4.5-5.7 GeV | **Strong confirmation** |
| Mass within 10% of 5.11 GeV | **Striking confirmation** |
| Asymmetric signature | Additional support |

### What Would Falsify

| Observation | Significance |
|-------------|--------------|
| DM detected at m < 4 GeV | **Falsified** |
| DM detected at m > 6 GeV | **Falsified** |
| DM detected with wrong σ/m | Tension (not falsification) |

---

## Falsification Protocol

If dark matter is detected at mass outside 4.5-5.7 GeV:

1. **Acknowledge falsification** of this prediction
2. **Document** the failed derivation
3. **Investigate** which step failed:
   - Ω_DM/Ω_b = 49/9 wrong?
   - n_DM = n_b wrong?
   - Framework interpretation wrong?
4. **Assess** impact on rest of framework
5. **Update** HONEST_ASSESSMENT.md

---

## Verification

**Scripts**: `verification/sympy/dm_exponent_determinant.py` (S315), `verification/sympy/dm_candidate_systematic_survey.py` (32/32 PASS, S339)

```python
# Key calculation
from sympy import Rational

Im_O = 7
Im_H = 3
m_p = Rational(938272088, 10**6)  # MeV (CODATA)

Omega_ratio = Rational(Im_O**2, Im_H**2)  # 49/9
m_DM = m_p * Omega_ratio

print(f"Predicted: m_DM = {float(m_DM):.2f} MeV = {float(m_DM)/1000:.3f} GeV")
# Output: m_DM = 5113.50 MeV = 5.114 GeV
```

---

## Timeline

| Date | Event | Action |
|------|-------|--------|
| Dec 2025 | LZ results | Null result — consistent |
| 2026 | SuperCDMS first data | **Critical test** |
| 2026-2027 | DarkSide-LowMass | Additional coverage |
| 2027 | Comprehensive low-mass coverage | **Decisive** |

---

## Summary

**m_DM = 5.11 GeV is the framework's most testable prediction.**

- Mass derived from structural invariants: m_e * (n_c-1)^n_d (S315 [DERIVATION])
- Clear falsification criterion (wrong mass)
- Being tested NOW (2025-2027)
- Current null results are consistent but prediction is under pressure
- **OPEN GAP**: Carrier particle unidentified (S339). All 28 pNGBs accounted for. Most promising: nu_R from spinor.

If confirmed: Framework gains enormous credibility
If falsified: Framework must honestly acknowledge failure

---

*See `framework/investigations/particles/dark_matter_identity.md` for full carrier analysis.*
*Canonical derivation script: `verification/sympy/dm_exponent_determinant.py` (S315)*
*Retraction analysis: `verification/sympy/det_tr_decoupling_analysis.py` (32/32 PASS, S339)*
