# Cosmological Parameters Reference

**Status**: DATA REFERENCE [A-IMPORT]
**Source**: Planck 2018/2020, DESI 2024, BICEP/Keck 2021
**Created**: 2026-02-03 (Session 221)
**Layer**: 2 (correspondence)

All measured values are [A-IMPORT]. Framework predictions noted where they exist.

---

## Primary CMB Parameters (Planck 2018, TT+TE+EE+lowE+lensing)

| Parameter | Value | Framework | Error | Status |
|-----------|-------|-----------|-------|--------|
| H_0 (km/s/Mpc) | 67.36(54) | Not derived | — | Gap |
| Omega_b h^2 | 0.02237(15) | Not derived | — | Gap |
| Omega_c h^2 | 0.1200(12) | Not derived | — | Gap |
| Omega_Lambda | 0.6847(73) | 137/200 = 0.685 | < 1 sigma | [CONJECTURE] |
| Omega_m | 0.3153(73) | 63/200 = 0.315 | < 1 sigma | [CONJECTURE] |
| n_s | 0.9649(42) | 193/200 = 0.965 | < 1 sigma | [DERIVATION] |
| r (tensor/scalar) | < 0.036 (95% CL, BK18) | 7/200 = 0.035 | Within limit | [DERIVATION] |
| sigma_8 | 0.8111(60) | Not derived | — | Gap |
| tau_reion | 0.054(7) | Not derived | — | Gap |
| ln(10^10 A_s) | 3.044(14) | Requires V_0 | — | Gap |
| N_eff | 2.99(17) | 3 (from Im_H) | < 1 sigma | [CONJECTURE] |
| z_rec | 1089.92(25) | Not derived | — | Gap |

## Derived Cosmological Parameters

| Parameter | Value | Framework | Status |
|-----------|-------|-----------|--------|
| t_0 (age, Gyr) | 13.797(23) | Not derived | Gap |
| r_s (sound horizon, Mpc) | 144.43(26) | ~144.4 (0.03%) | [CONJECTURE] (caveats: r_s used falsified factors in derivation) |
| d_A (angular dist to LSS, Mpc) | 12710(100) | Not derived | Gap |
| l_A (acoustic scale) | 301.47(9) | Not derived directly | [A-IMPORT] |
| z_eq (matter-radiation eq) | 3402(26) | Not derived | Gap |
| z_drag | 1059.94(30) | Not derived | Gap |

## CMB Acoustic Peaks

| Peak | Position (l) | Framework | Status |
|------|-------------|-----------|--------|
| 1st (l_1) | 220.0(5) | From l_A | [A-IMPORT] |
| 2nd (l_2) | 537.5(7) | phi_odd = 3/11 -> l_2/l_1 = 537/220 | [DERIVATION] (0.4%) |
| 3rd (l_3) | 810.8(1.0) | Not derived | Gap |
| 4th (l_4) | 1120(2) | Not derived | Gap |

**Framework note**: l_2 resolved (S199) via baryon loading with phi_odd = 3/n_c = 3/11. Peak heights not fully derived.

## DESI 2024 Updates

| Parameter | Planck-only | Planck+DESI | Framework |
|-----------|-------------|-------------|-----------|
| Omega_Lambda | 0.6847(73) | 0.694(6) | 137/200 = 0.685 |
| w_0 | -1 (fixed) | -0.55(+0.39/-0.21) | -1 assumed |
| w_a | 0 (fixed) | -1.32(+0.66/-0.74) | Not derived |
| H_0 (km/s/Mpc) | 67.36(54) | 67.97(38) | Not derived |

**Framework note**: DESI hints at w != -1 (dynamical DE). Framework has no mechanism for time-varying w. This could be a tension point if confirmed.

## Inflationary Parameters

| Parameter | Value | Framework | Status |
|-----------|-------|-----------|--------|
| n_s | 0.9649(42) | 193/200 = 0.965 | [DERIVATION] |
| r | < 0.036 | 7/200 = 0.035 | [DERIVATION] |
| dn_s/d(ln k) | -0.0045(67) | -7/40000 = -0.000175 | [DERIVATION] |
| N_e (e-folds) | 45-70 | 52 | [DERIVATION] |
| mu^2 | — | (C+H)*H^4/Im_O = 1536/7 | [DERIVATION] |

**Framework note**: n_s = 193/200 and r = 7/200 are among the framework's strongest predictions, derived from the hilltop potential V(phi) = V_0(1 - phi^2/mu^2) with mu^2 = 1536/7.

## Falsified Predictions

| Prediction | Framework Value | Measured | Status |
|-----------|----------------|----------|--------|
| ~~CC from V(epsilon*)~~ | V(eps*) < 0 | Lambda > 0 | ~~F-10~~ **RESOLVED S230**: Convention error. V<0 gives Lambda>0 via Lambda=-8piGV. Magnitude gap (~10^111) remains. |
| eta* (conformal dist) | 337 Mpc | 280 Mpc | **FALSIFIED** (S198) |
| c_s (sound speed) | 3/7 | 1/sqrt(3) | **FALSIFIED** (S198) |

---

*Sources: Planck 2018 (arXiv:1807.06209), Planck 2020 (arXiv:2007.04997), BICEP/Keck 2021 (arXiv:2110.00483), DESI 2024 (arXiv:2404.03002). All uncertainties at 68% CL unless noted.*
*Created: 2026-02-03 (S221)*
