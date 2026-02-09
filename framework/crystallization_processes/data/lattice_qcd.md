# Lattice QCD Data Reference

**Status**: DATA REFERENCE [A-IMPORT]
**Source**: FLAG 2024, MILC, RBC/UKQCD, HotQCD, Budapest-Wuppertal
**Created**: 2026-02-03 (Session 221)
**Layer**: 2 (correspondence)

All values are [A-IMPORT]. Framework predictions noted where they exist.

---

## Confinement & String Tension

| Quantity | Value | Framework | Error | Status |
|----------|-------|-----------|-------|--------|
| sqrt(sigma) | 440(2) MeV | 8 m_p/17 = 441.5 MeV | 0.35% | [CONJECTURE, HRS=6] |
| sigma | 0.194(2) GeV^2 | (8 m_p/17)^2 | 0.7% | [CONJECTURE] |
| r_0 (Sommer) | 0.472(5) fm | Not derived | — | Gap |
| r_0 sqrt(sigma) | 1.169(14) | Not derived | — | Gap |

**Framework note**: sqrt(sigma) = 8 m_p/17 uses proton mass as input [A-IMPORT]. The ratio 8/17 appears naturally in O-channel mode counting but the full derivation is pattern-matched, not first-principles.

## QCD Phase Transition

| Quantity | Value | Source | Framework | Status |
|----------|-------|--------|-----------|--------|
| T_c (crossover, N_f=2+1) | 156.5(1.5) MeV | HotQCD/Budapest-Wuppertal | Not derived | Gap |
| T_c (pure gauge) | 270(5) MeV | Lattice | Not derived | Gap |
| Order of transition (N_f=2+1) | Crossover | Lattice | [STANDARD-RELABELED] | — |
| mu_B^crit (CEP) | > 300 MeV (if exists) | Lattice + exp. | Not derived | Gap |

**Framework note**: T_c should in principle follow from O-channel barrier height. Currently a gap (marked MEDIUM in catalog).

## Glueball Spectrum

| State (J^PC) | Mass (MeV) | Ratio to 0++ | Framework | Status |
|-------------|-----------|-------------|-----------|--------|
| 0++ | 1710(50)(80) | 1.000 | Not derived | Gap |
| 2++ | 2390(30)(120) | 1.40(8) | Not derived | Gap |
| 0-+ | 2560(35)(120) | 1.50(8) | Not derived | Gap |
| 1+- | 2940(30)(140) | 1.72(9) | Not derived | Gap |
| 2-+ | 3040(40)(150) | 1.78(10) | Not derived | Gap |
| 3++ | 3550(40)(170) | 2.08(11) | Not derived | Gap |

**Framework note**: 113/62 result from O-channel counting is related to glueball physics but not a direct mass prediction. Glueball spectrum from first principles remains a gap.

**Lattice source**: Morningstar & Peardon (1999), Chen et al. (2006), Gregory et al. (2012).

## Quark Condensate

| Quantity | Value | Source | Framework |
|----------|-------|--------|-----------|
| <qq>(MSbar, 2 GeV) | -(272(5) MeV)^3 | FLAG 2024 | Not derived |
| f_pi | 130.2(8) MeV | FLAG 2024 | Not derived |
| f_K / f_pi | 1.1932(19) | FLAG 2024 | Not derived |

## Heavy Quark Potential

| Quantity | Value | Framework | Status |
|----------|-------|-----------|--------|
| Luscher term | -pi/(12r) (bosonic string) | -pi/(24r) from O x Im_H | [DERIVATION] |
| Cornell V(r) | -4 alpha_s/(3r) + sigma r | Channel-specific potential | [FRAMEWORK-CONSTRAINED] |
| 1/r coefficient | 4/3 (Casimir) | C_F = (N^2-1)/(2N) = 4/3 for SU(3) | [A-IMPORT] |

**Framework note**: Luscher term 1/24 = 1/(O x Im_H) = 1/n_d! is an exact match. The 24 factorization into O x Im_H is [DERIVATION]; whether this is deeper than numerical coincidence is [CONJECTURE].

---

*Sources: FLAG Review 2024, HotQCD Collaboration (2019), Budapest-Wuppertal (2020), Morningstar & Peardon (1999).*
*Created: 2026-02-03 (S221)*
