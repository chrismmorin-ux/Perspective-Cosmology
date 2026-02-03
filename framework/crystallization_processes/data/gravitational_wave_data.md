# Gravitational Wave Data Reference

**Status**: DATA REFERENCE [A-IMPORT]
**Source**: LIGO/Virgo/KAGRA GWTC-3, PTA results
**Created**: 2026-02-03 (Session 221)
**Layer**: 2 (correspondence)

All values are [A-IMPORT]. Framework predictions noted where they exist.

---

## Key Events (GWTC-3)

| Event | Type | M_1 (M_sun) | M_2 (M_sun) | M_final (M_sun) | d_L (Mpc) | SNR |
|-------|------|-------------|-------------|-----------------|-----------|-----|
| GW150914 | BBH | 35.6(+4.7/-3.1) | 30.6(+3.0/-4.4) | 63.1(+3.4/-3.0) | 440(+150/-170) | 25.1 |
| GW170817 | BNS | 1.46(+0.12/-0.10) | 1.27(+0.09/-0.09) | ~2.7 | 40(+7/-15) | 32.4 |
| GW190521 | BBH | 85(+21/-14) | 66(+17/-18) | 142(+28/-16) | 5300(+2400/-2600) | 14.7 |
| GW190814 | NSBH? | 23.2(+1.1/-1.0) | 2.59(+0.08/-0.09) | — | 241(+41/-45) | 25.0 |

## Merger Rates

| Type | Rate (Gpc^-3 yr^-1) | Framework |
|------|---------------------|-----------|
| BBH | 17.9-44 | Not derived |
| BNS | 10-1700 | Not derived |
| NSBH | 7.8-140 | Not derived |

## Gravitational Wave Echoes

| Search | Result | Framework Prediction |
|--------|--------|---------------------|
| Post-merger echoes (LIGO O1-O3) | No significant detection | No echoes predicted: R ~ exp(-10^37) = 0 [DERIVATION] |
| Boltzmann echo search | No evidence | Consistent with framework |
| Planck-scale structure | No evidence | epsilon too massive for astrophysical deviations |

**Framework note**: The framework predicts zero GW echoes because the tilt field mass m_tilt ~ 2.1 x 10^16 GeV makes the reflectivity R ~ exp(-m_tilt r_BH) = exp(-10^37) ~ 0. This is a robust [DERIVATION].

## Waveform Parameters

| Parameter | GW150914 | Framework |
|-----------|----------|-----------|
| f_peak (Hz) | ~150 | [A-IMPORT: standard GR] |
| Chirp mass (M_sun) | 28.3(+1.8/-1.5) | [A-IMPORT] |
| Effective spin | -0.01(+0.12/-0.13) | Not derived |
| Final spin | 0.69(+0.05/-0.04) | Not derived |
| E_radiated (M_sun c^2) | 3.0(+0.5/-0.5) | [A-IMPORT: GR] |

## Pulsar Timing Arrays (NANOGrav 15yr, 2023)

| Result | Value | Framework |
|--------|-------|-----------|
| Stochastic GW background | A_GWB = 2.4(+0.7/-0.6) x 10^-15 at f=1/yr | Not derived |
| Spectral index | gamma = 13/3 (SMBHB consistent) | [A-IMPORT] |
| Detection significance | ~3.5-4 sigma | — |

## Tests of GR

| Test | Result | Framework |
|------|--------|-----------|
| Propagation speed (GW170817) | |c_GW/c - 1| < 10^-15 | c_GW = c [STANDARD-RELABELED] |
| Graviton mass | m_g < 1.76 x 10^-23 eV | m_g = 0 [STANDARD-RELABELED] |
| Post-Newtonian consistency | Consistent with GR | [A-IMPORT: GR] |
| Ringdown QNMs | Consistent with Kerr | [A-IMPORT: GR] |
| Polarization | Tensor (GR), no vector/scalar detected | [STANDARD-RELABELED] |

---

*Sources: GWTC-3 (arXiv:2111.03606), GW170817 (arXiv:1710.05832), NANOGrav 15yr (arXiv:2306.16213). All uncertainties at 90% CL unless noted.*
*Created: 2026-02-03 (S221)*
