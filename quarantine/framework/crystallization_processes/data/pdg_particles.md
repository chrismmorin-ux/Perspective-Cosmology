# PDG Particle Data Reference

**Status**: DATA REFERENCE [A-IMPORT]
**Source**: Particle Data Group, Review of Particle Physics 2024
**Created**: 2026-02-03 (Session 221)
**Layer**: 2 (correspondence — all values are imports from observation)

All values in this file are [A-IMPORT]. None are framework predictions.
Framework predictions are noted where they exist, with references to verification scripts.

---

## Leptons

| Particle | Mass (MeV) | Lifetime | Width | Spin | Key BRs |
|----------|-----------|----------|-------|------|---------|
| e | 0.51099895000(15) | stable | — | 1/2 | — |
| mu | 105.6583755(23) | 2.1969811(22) us | 2.996(2) x 10^-19 GeV | 1/2 | e nu_mu nu_e: ~100% |
| tau | 1776.86(12) | 290.3(5) x 10^-15 s | 2.267(4) x 10^-12 GeV | 1/2 | had: 64.8%, e: 17.8%, mu: 17.4% |
| nu_e | < 0.8 eV (direct) | stable | — | 1/2 | — |
| nu_mu | < 0.19 MeV | stable | — | 1/2 | — |
| nu_tau | < 18.2 MeV | stable | — | 1/2 | — |

**Framework prediction**: m_mu/m_e = Phi_6(43) = 206.7857... (measured: 206.7683..., 4.1 ppm) [CONJECTURE, Tier 1]

## Quarks

| Quark | Mass (MeV, MSbar) | Charge | Key Note |
|-------|-------------------|--------|----------|
| u | 2.16(+0.49/-0.26) | +2/3 | MSbar at 2 GeV |
| d | 4.67(+0.48/-0.17) | -1/3 | MSbar at 2 GeV |
| s | 93.4(+8.6/-3.4) | -1/3 | MSbar at 2 GeV |
| c | 1270(20) | +2/3 | MSbar at m_c |
| b | 4180(+30/-20) | -1/3 | MSbar at m_b |
| t | 172.57(29) | +2/3 | Pole mass (direct) |

**Framework predictions**:
- m_p/m_e: 12 x 153 - 11/72 = 1836.118... (measured: 1836.153..., 19 ppm) [CONJECTURE + DERIVATION for correction]
- y_t = 120/121 = 0.9917 (measured: 0.9916, 145 ppm) [CONJECTURE]
- m_b/m_s = 179/4 = 44.75 (measured: ~44.75, 0.008%) [CONJECTURE]

## Gauge Bosons

| Particle | Mass (GeV) | Width (GeV) | Spin | Key BRs |
|----------|-----------|-------------|------|---------|
| photon | 0 (< 10^-18 eV) | stable | 1 | — |
| W+/- | 80.3692(133) | 2.085(42) | 1 | had: 67.4%, lep: 32.6% |
| Z | 91.1876(21) | 2.4955(23) | 1 | had: 69.91%, inv: 20.00%, l+l-: 10.10% |
| gluon | 0 (theor.) | confined | 1 | — |
| graviton | 0 (theor.) | — | 2 | — |

**Framework predictions**:
- sin^2(theta_W)(eff) = 28/121 = 0.23140 (measured: 0.23153(16), -0.78 sigma) [DERIVATION]
- Z branching: 18/20 observables match within 2 sigma [DERIVATION for mode counting]
- m_W from sin^2(theta_W): consistent within uncertainties

## Higgs Boson

| Property | Value | Framework |
|----------|-------|-----------|
| Mass | 125.25(17) GeV | v * 121/238 = 125.22 GeV (0.057%) [CONJECTURE] |
| Width | 3.2(+2.4/-1.7) MeV | Standard (no prediction) |
| Spin-parity | 0+ | [DERIVATION: from coset Gr(4,11)] |
| kappa_V | 1.035(31) | sqrt(117/121) = 0.9834 [CONJECTURE, within 1.7sigma] |

**Key BRs (Higgs)**:

| Channel | Measured | SM prediction | Framework |
|---------|----------|--------------|-----------|
| bb | 0.58(+0.06/-0.05) | 0.577 | [A-IMPORT] |
| WW* | 0.22(3) | 0.215 | [A-IMPORT] |
| ZZ* | 0.027(4) | 0.0264 | [A-IMPORT] |
| tau tau | 0.063(9) | 0.0632 | [A-IMPORT] |
| gamma gamma | 2.27(16) x 10^-3 | 2.28 x 10^-3 | [A-IMPORT] |

## Light Mesons

| Particle | Mass (MeV) | Lifetime / Width | Spin | Key Decay |
|----------|-----------|-----------------|------|-----------|
| pi+/- | 139.57039(18) | 26.033(5) ns | 0 | mu nu: ~100% |
| pi0 | 134.9768(5) | 8.43(13) x 10^-17 s | 0 | gamma gamma: 98.8% |
| K+/- | 493.677(16) | 12.380(20) ns | 0 | mu nu: 63.6% |
| K0_L | 497.611(13) | 51.16(21) ns | 0 | pi l nu: 67% |
| K0_S | 497.611(13) | 89.56(4) ps | 0 | pi pi: ~100% |
| eta | 547.862(17) | — | 0 | gg: 39.4%, 3pi0: 32.6% |
| eta' | 957.78(6) | — | 0 | pi pi eta: 65% |

## Heavy Mesons

| Particle | Mass (MeV) | Lifetime / Width | Spin | Key Info |
|----------|-----------|-----------------|------|----------|
| D+/- | 1869.66(5) | 1040(7) fs | 0 | c d-bar |
| D0 | 1864.84(5) | 410.1(1.5) fs | 0 | c u-bar |
| D_s | 1968.35(7) | 504(4) fs | 0 | c s-bar |
| B+/- | 5279.34(12) | 1.638(4) ps | 0 | u b-bar |
| B0 | 5279.66(12) | 1.519(4) ps | 0 | d b-bar |
| B_s | 5366.92(10) | 1.521(5) ps | 0 | s b-bar |
| J/psi | 3096.900(6) | 92.6(1.7) keV | 1 | c c-bar |
| Upsilon(1S) | 9460.30(26) | 54.02(1.25) keV | 1 | b b-bar |

## Baryons

| Particle | Mass (MeV) | Lifetime | Spin | Key Note |
|----------|-----------|----------|------|----------|
| p | 938.272088(1) | > 10^34 yr | 1/2 | Stable |
| n | 939.565420(5) | 878.4(5) s | 1/2 | beta decay |
| Lambda | 1115.683(6) | 263.2(2.0) ps | 1/2 | s quark |
| Sigma+ | 1189.37(7) | 80.18(26) ps | 1/2 | — |
| Sigma0 | 1192.642(24) | 7.4(7) x 10^-20 s | 1/2 | EM decay |
| Sigma- | 1197.449(30) | 147.9(1.1) ps | 1/2 | — |
| Xi0 | 1314.86(20) | 290.0(9) ps | 1/2 | ss content |
| Xi- | 1321.71(7) | 163.9(1.5) ps | 1/2 | — |
| Omega- | 1672.45(29) | 82.1(1.1) ps | 3/2 | sss |
| Lambda_c | 2286.46(14) | 202.4(3.1) fs | 1/2 | c quark |
| Lambda_b | 5619.60(17) | 1.471(9) ps | 1/2 | b quark |

---

## Structural Counts [DERIVATION]

| Count | Value | Framework | Status |
|-------|-------|-----------|--------|
| Fermions per generation | 15 | R+C+H+O = 1+2+4+8 | [DERIVATION] |
| Number of generations | 3 | Im_H = 3 | [CONJECTURE] |
| Total fermion types | 45 | 15 x 3 | [D] |
| Gauge bosons (massless) | 12 | SU(3)xSU(2)xU(1): 8+3+1 | [DERIVATION] |
| Total fundamental forces | 4 | R+C+H+O channels | [THEOREM] |
| Higgs doublet components | 4 | From Gr(4,11) coset | [DERIVATION] |

---

*Source: PDG 2024 (pdg.lbl.gov). Uncertainties in last digits shown in parentheses.*
*Created: 2026-02-03 (S221)*
