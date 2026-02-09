# PDG Coupling Constants & Mixing Parameters

**Status**: DATA REFERENCE [A-IMPORT]
**Source**: Particle Data Group 2024, NuFIT 5.3
**Created**: 2026-02-03 (Session 221)
**Layer**: 2 (correspondence)

All measured values are [A-IMPORT]. Framework predictions noted where they exist.

---

## Gauge Couplings

| Coupling | Value | Scale | Framework Prediction | Error | Status |
|----------|-------|-------|---------------------|-------|--------|
| alpha(0) = 1/alpha_em | 1/137.035999177(21) | Q=0 | 111/15211 = 1/137.036036... | 0.3 ppm | [CONJECTURE] Tier 1 |
| alpha(M_Z) | 1/127.944(14) | M_Z | Running from 1/137 | — | [A-IMPORT] |
| alpha_s(M_Z) | 0.1180(9) | M_Z | Not yet derived | — | Gap |
| G_F | 1.1663788(6) x 10^-5 GeV^-2 | — | [A-IMPORT] | — | Not derived |

## Electroweak Parameters

| Parameter | Value | Framework | Error | Status |
|-----------|-------|-----------|-------|--------|
| sin^2(theta_W)(MSbar) | 0.23122(4) | 28/121 = 0.23140 | 0.1% | [DERIVATION] |
| sin^2(theta_W)(eff, lep) | 0.23153(16) | 28/121 = 0.23140 | -0.78 sigma | [DERIVATION] |
| sin^2(theta_W)(on-shell) | 0.22290(30) | (scheme-dependent) | — | [A-IMPORT] |
| m_W (GeV) | 80.3692(133) | From sin^2(theta_W) | — | [A-IMPORT] |
| m_Z (GeV) | 91.1876(21) | [A-IMPORT] | — | [A-IMPORT] |
| v (Higgs VEV) (GeV) | 246.21965(6) | [A-IMPORT] | — | Not derived |
| rho parameter | 1.00038(20) | ~1 (tree level) | — | [A-IMPORT] |

**Framework note**: sin^2(theta_W) = 28/121 comes from mode counting in C-channel vs total internal modes (28 = n_d x Im_O, 121 = n_c^2). This is the framework's strongest electroweak prediction.

## CKM Matrix

| Element | Magnitude | Framework | Status |
|---------|-----------|-----------|--------|
| V_ud | 0.97435(16) | Not derived | [CONJECTURE] |
| V_us | 0.22500(67) | Not derived | [CONJECTURE] |
| V_ub | 0.00369(11) | Not derived | [CONJECTURE] |
| V_cd | 0.22486(67) | Not derived | [CONJECTURE] |
| V_cs | 0.97349(16) | Not derived | [CONJECTURE] |
| V_cb | 0.04182(+85/-74) | Not derived | [CONJECTURE] |
| V_td | 0.00857(+20/-18) | Not derived | [CONJECTURE] |
| V_ts | 0.04110(+83/-72) | Not derived | [CONJECTURE] |
| V_tb | 0.999118(+30/-36) | Not derived | [CONJECTURE] |
| J (Jarlskog) | 3.08(+13/-12) x 10^-5 | Not derived | Gap |
| delta_CKM | 65.5(+2.6/-2.5) deg | Not derived | Gap |

**Framework note**: CKM structure should emerge from Im_H = 3 generation mixing through H-channel. Currently all elements are [CONJECTURE] — this is a major gap.

## PMNS Matrix (Neutrino Mixing)

| Parameter | Value (NuFIT 5.3, NO) | Framework | Status |
|-----------|----------------------|-----------|--------|
| theta_12 | 33.41(+0.75/-0.72) deg | Not derived | Gap |
| theta_23 | 49.1(+1.0/-1.3) deg | Not derived | Gap |
| theta_13 | 8.54(+0.11/-0.12) deg | Not derived | Gap |
| delta_CP | 197(+42/-25) deg | Not derived | Gap |
| Delta m^2_21 | 7.41(+0.21/-0.20) x 10^-5 eV^2 | Not derived | Gap |
| Delta m^2_32 (NO) | 2.507(+0.026/-0.027) x 10^-3 eV^2 | Not derived | Gap |

**Framework note**: Neutrino oscillation mapped to C14 (H-channel flavor precession). Mass splittings and mixing angles not yet derived.

## Strong Sector

| Parameter | Value | Framework | Status |
|-----------|-------|-----------|--------|
| alpha_s(M_Z) | 0.1180(9) | Not derived from 1st principles | Gap |
| Lambda_QCD (MSbar, N_f=5) | 210(14) MeV | Not derived | Gap |
| b_0(SU(3), N_f=6) | 7 | Im_O = 7 | [DERIVATION] |
| b_1(SU(3)) | 153 | Im_H^2 x 17 | [DERIVATION] |
| sqrt(sigma) | ~440 MeV | 8 m_p/17 = 441.5 MeV | [CONJECTURE, HRS=6] |
| T_c (deconf.) | 156.5(1.5) MeV | Not derived | Gap |
| theta_QCD | < 10^-10 | Strong CP problem | Gap |

**Framework note**: b_0 = Im_O and b_1 = Im_H^2 x 17 are exact matches with zero free parameters, the framework's strongest QCD results.

---

*Source: PDG 2024, NuFIT 5.3 (2024). All uncertainties from original sources.*
*Created: 2026-02-03 (S221)*
