# Quarkonia and Glueballs Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 239)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C12: Hadronization & Confinement)
**Layer**: Mixed (Layer 1 mode counting + Layer 2 correspondence + Layer 3 limited predictions)

---

## Disclaimer

This sub-catalog is **majority [STANDARD-RELABELED]**. The framework's contribution to quarkonium and glueball physics is through the derived color factor N_c = Im_H = 3, which enters the Cornell potential via C_F = (N_c^2-1)/(2 N_c) = 4/3 [DERIVATION] and the conjectured string tension sqrt(sigma) = 8 m_p / 17 = 441.5 MeV [CONJECTURE, HRS=6]. Individual quarkonium masses, level splittings, and glueball masses are standard QCD results (often from lattice calculations) described in crystallization language. The framework does NOT derive the quarkonium or glueball spectrum from first principles.

**Relation to hadron_formation.md**: The parent sub-catalog `hadron_formation.md` has individual entries for J/psi and Upsilon (as formation processes). This file focuses on the broader spectral properties: level splittings, excited states, radiative transitions, and the glueball sector.

---

## Processes

### Charmonium Spectrum (cc-bar States)

**Chain**: C12(cc-bar confinement) -> C3(Cornell potential bound states) -> C8/C10(radiative/weak transitions between levels)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Charm-anticharm pair forms non-relativistic bound state system with rich spectrum (1S, 2S, 1P, 1D states etc.)
- Tilt: O-channel confinement creates bound-state ladder via Cornell potential V(r) = -C_F alpha_s/r + sigma r. Transitions between levels involve C-channel (E1, M1 radiative transitions) and O-channel (hadronic transitions with pion emission).

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| O (Strong) | Confinement (Cornell potential); hadronic transitions | C_F = 4/3, sigma |
| C (EM) | Radiative transitions (E1: chi_c -> J/psi + gamma); leptonic decays | alpha |
| H (Weak) | Negligible for spectrum | -- |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| m(eta_c, 1S) | Not derived | 2983.9(4) MeV | -- | PDG 2024 |
| m(J/psi, 1S) | Not derived | 3096.900(6) MeV | -- | PDG 2024 |
| m(chi_c0, 1P) | Not derived | 3414.71(30) MeV | -- | PDG 2024 |
| m(chi_c1, 1P) | Not derived | 3510.67(5) MeV | -- | PDG 2024 |
| m(psi(2S)) | Not derived | 3686.10(6) MeV | -- | PDG 2024 |
| Hyperfine splitting (J/psi - eta_c) | Not derived | 113.0(4) MeV | -- | PDG 2024 |
| 1P fine structure (chi_c2 - chi_c0) | Not derived | 141.4 MeV | -- | PDG 2024 |
| C_F in Cornell potential | (N_c^2-1)/(2 N_c) = 4/3 [D] | 4/3 (standard QCD) | exact | N_c = Im_H = 3 |

**Spectral structure and the Cornell potential**:
```
V(r) = -C_F * alpha_s(r) / r  +  sigma * r
     = -(4/3) * alpha_s / r  +  sigma * r    [with N_c = Im_H = 3]
```
The Coulomb term (short-range) governs the fine structure and hyperfine splittings. The linear term (long-range) governs the overall level spacing. The charmonium system is intermediate — neither purely Coulombic (like positronium) nor purely linear (like very heavy quarkonia). Relativistic corrections (v^2/c^2 ~ 0.2-0.3 for charmonium) are significant.

**What framework adds**: C_F = 4/3 from N_c = Im_H = 3 enters the Coulomb part of the Cornell potential. The string tension sigma is conjectured: sqrt(sigma) = 8 m_p/17 = 441.5 MeV [CONJECTURE, HRS=6]. Neither the charmonium mass spectrum nor the level splittings are derived — they require solving the Schrodinger equation with the Cornell potential plus relativistic and spin-dependent corrections, all of which are [A-IMPORT].
**What is imported**: m_c = 1.27(2) GeV [A-IMPORT], alpha_s(m_c) ~ 0.35 [A-IMPORT], spin-dependent potentials [A-IMPORT], relativistic corrections [A-IMPORT]
**Verification**: `hadron_mass_crystallization.py` (C_F = 4/3 test, color factor tests)
**Confidence**: [FRAMEWORK-CONSTRAINED] for C_F; [STANDARD-RELABELED] for spectrum

---

### Bottomonium Spectrum (bb-bar States)

**Chain**: C12(bb-bar confinement) -> C3(Cornell potential, more non-relativistic than charmonium) -> C8(radiative transitions)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Bottom-antibottom pair forms deeply non-relativistic bound state system. Richest quarkonium spectrum: 6 S-wave, 6 P-wave states below open-bottom threshold
- Tilt: Same Cornell potential as charmonium but m_b >> m_c makes the system more non-relativistic (v^2/c^2 ~ 0.08), so potential model works better

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| O (Strong) | Confinement (Cornell potential); hadronic transitions (di-pion) | C_F = 4/3, sigma |
| C (EM) | Radiative transitions (E1, M1); leptonic decays Upsilon -> e+e- | alpha |
| H (Weak) | Negligible for spectrum | -- |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| m(eta_b, 1S) | Not derived | 9399.0(23) MeV | -- | PDG 2024 |
| m(Upsilon, 1S) | Not derived | 9460.30(26) MeV | -- | PDG 2024 |
| m(Upsilon, 2S) | Not derived | 10023.26(31) MeV | -- | PDG 2024 |
| m(Upsilon, 3S) | Not derived | 10355.2(5) MeV | -- | PDG 2024 |
| m(chi_b0, 1P) | Not derived | 9859.44(52) MeV | -- | PDG 2024 |
| m(Upsilon, 4S) | Not derived | 10579.4(12) MeV | -- | PDG 2024 (above BB threshold) |
| Hyperfine splitting (Upsilon - eta_b) | Not derived | 61.3(23) MeV | -- | PDG 2024 |
| 2S-1S splitting | Not derived | 563.0 MeV | -- | PDG 2024 |
| C_F in Cornell potential | 4/3 [D: N_c = 3] | 4/3 | exact | Standard QCD |

**Bottomonium as a precision test of QCD**:
The small v/c ~ 0.3 makes NRQCD (non-relativistic QCD) highly effective. Lattice QCD predictions for the bb-bar spectrum are among the most precise in hadron physics. The HPQCD collaboration's calculation of the Upsilon spectrum was a landmark result confirming lattice methods. The framework provides no competing calculation — it only identifies C_F = 4/3 and sigma as derived/conjectured quantities within the potential.

**What framework adds**: Same as charmonium — C_F = 4/3 from N_c = Im_H = 3, plus conjectured sigma. The bottomonium system is a cleaner test because relativistic corrections are smaller.
**What is imported**: m_b = 4.18(3) GeV [A-IMPORT], alpha_s(m_b) ~ 0.22 [A-IMPORT], NRQCD formalism [A-IMPORT], lattice QCD results [A-IMPORT]
**Verification**: `hadron_mass_crystallization.py` (C_F test, color factor tests)
**Confidence**: [FRAMEWORK-CONSTRAINED] for C_F; [STANDARD-RELABELED] for spectrum

---

### Glueball Spectrum

**Chain**: C12(gg...g confinement) -> C3(pure-glue bound state) -> C10/C11(glueball decay to mesons)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Gluons self-interact (non-abelian gauge theory) and can form bound states with no quark content — glueballs. Lattice QCD predicts the lightest glueball is 0++ at ~1.7 GeV.
- Tilt: O-channel self-confinement. Unlike mesons (q-qbar) and baryons (qqq), glueballs are pure O-channel crystallization — the confining field forming a bound state with itself. The existence of glueballs is a direct consequence of N_c = Im_H = 3 (non-abelian SU(3) allows 3-gluon and 4-gluon vertices).

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| O (Strong) | Self-confinement: gluon fields form color-singlet bound state | N_c^2 - 1 = 8 gluon DOF |
| C (EM) | Glueball has no direct EM coupling (color singlet, no electric charge) | Decay via mixing with qq-bar mesons |
| H (Weak) | Negligible | -- |
| R (Gravity) | Negligible | -- |

**Key Data (Lattice Predictions)**:

| Observable | Framework | Lattice QCD | Error | Source |
|-----------|-----------|-------------|-------|--------|
| m(0++) lightest | Not derived | 1710(50)(80) MeV | ~5% | Morningstar & Peardon 1999; Chen et al. 2006 |
| m(2++) | Not derived | 2390(30)(120) MeV | ~5% | Morningstar & Peardon 1999 |
| m(0-+) | Not derived | 2560(35)(120) MeV | ~5% | Morningstar & Peardon 1999 |
| m(0++*) (excited) | Not derived | 2670(180) MeV | ~7% | Chen et al. 2006 |
| Glueball existence | Requires non-abelian gauge (N_c >= 2) [D] | Lattice confirms | -- | Multiple groups |

**The experimental challenge**: Glueballs mix with nearby qq-bar mesons of the same quantum numbers, making identification difficult. The f_0(1710) is the leading candidate for the lightest 0++ glueball, but glueball-meson mixing complicates the assignment. The f_0(1500) and f_0(1370) are also discussed as partial glueball states in a mixing scenario.

**Large-N_c scaling**: In the large-N_c limit, glueball masses scale as O(1) (independent of N_c) while their widths scale as 1/N_c^2. For N_c = 3, glueballs are expected to be moderately narrow. The framework derives N_c = 3 but does not predict the glueball mass scale (which comes from Lambda_QCD [A-IMPORT]).

**What framework adds**: The existence of glueballs requires non-abelian gauge theory (3-gluon vertex), which requires N_c >= 2. The framework derives N_c = Im_H = 3, confirming glueballs are expected. The 8 gluon DOF (N_c^2 - 1 = 8) determine the color structure of glueball states. However, the mass spectrum, decay properties, and mixing parameters are standard lattice QCD results with no framework predictions.
**What is imported**: Lattice QCD mass predictions [A-IMPORT], Lambda_QCD [A-IMPORT], glueball-meson mixing parameters [A-IMPORT], experimental candidates [A-IMPORT]
**Verification**: `hadron_mass_crystallization.py` (N_c^2 - 1 = 8 gluon DOF test)
**Confidence**: [STANDARD-RELABELED] — existence follows from N_c = 3 but spectrum is entirely [A-IMPORT]

---

### Exotic Quarkonia (X, Y, Z States)

**Chain**: C12(multiquark or hybrid confinement) -> C3(exotic bound state beyond qq-bar model)
**Tag**: [FRAMEWORK-CONSTRAINED] (upgraded S243: N_c=3 determines which multiquark color singlets exist)

**Before -> After**:
- Physical: States that do not fit into the conventional qq-bar meson or qqq baryon classification. Include tetraquarks (qq-qbar-qbar), pentaquarks (qqqq-qbar), and hybrids (qq-bar-g). Discovered since 2003 (X(3872) at Belle).
- Tilt: Multi-body O-channel confinement. The color singlet condition for a tetraquark requires combining 4 quark colors: 3 x 3 x 3-bar x 3-bar contains singlet. For pentaquarks: 3^4 x 3-bar contains singlet. These color algebra results depend on N_c = Im_H = 3.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| O (Strong) | Multi-body confinement; molecular binding at hadronic level | Color singlet from 4 or 5 quarks |
| C (EM) | Radiative transitions; isospin-violating decays | X(3872) -> J/psi + pi+ pi- |
| H (Weak) | Production in B-meson decays (some states) | B -> K + X(3872) |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| m(X(3872)) | Not derived | 3871.65(6) MeV | -- | PDG 2024 |
| m(Z_c(3900)) | Not derived | 3887.1(26) MeV | -- | PDG 2024 |
| m(P_c(4312)) | Not derived | 4311.9(7) MeV | -- | PDG 2024 (pentaquark) |
| m(P_c(4440)) | Not derived | 4440.3(13) MeV | -- | PDG 2024 (pentaquark) |
| m(P_c(4457)) | Not derived | 4457.3(6) MeV | -- | PDG 2024 (pentaquark) |
| Exotic existence | Consistent with N_c = 3 [D] | Confirmed since 2003 | -- | Belle, LHCb, BES III |

**Nature of exotics**: The internal structure (compact tetraquark vs. hadronic molecule vs. kinematic threshold effect) is debated. The X(3872) sits almost exactly at the D^0 D*0-bar threshold (binding energy < 0.2 MeV), suggesting a molecular interpretation. The pentaquark states P_c may be D-Sigma_c molecules. These are questions of QCD dynamics, not addressed by the framework.

**What framework adds**: The color algebra of multiquark states depends explicitly on N_c = Im_H = 3 [DERIVED]. For SU(3): qqq (3x3x3 = 1+8+8+10, singlet exists -> baryons); tetraquarks (3x3x3-bar x3-bar contains 2 singlets); pentaquarks (3^4 x 3-bar contains singlet). For N_c=2, "baryons" would be qq (2 quarks); for N_c=4, baryons qqqq — the exotic spectrum is qualitatively different. The SPECIFIC set of allowed exotics (X(3872), Z_c(3900), P_c(4312/4440/4457)) is N_c-dependent. Dimension checks: 3+6=9=3^2, 1+8+8+10=27=3^3.
**What is imported**: QCD dynamics [A-IMPORT], quark masses [A-IMPORT], experimental masses and quantum numbers [A-IMPORT]
**Verification**: `hadron_mass_crystallization.py` (color singlet tests), `near_miss_batch_upgrades.py` (tests 26-31: color algebra, dim checks)
**Confidence**: [FRAMEWORK-CONSTRAINED] — which color singlets exist depends on N_c = 3 from framework

---

## Summary

| Process | Tag | Framework Content | Key Tests | Scripts |
|---------|-----|-------------------|-----------|---------|
| Charmonium spectrum | [FRAMEWORK-CONSTRAINED] | C_F = 4/3 in Cornell potential | Color factor | `hadron_mass_crystallization.py` |
| Bottomonium spectrum | [FRAMEWORK-CONSTRAINED] | C_F = 4/3 in Cornell potential | Color factor | `hadron_mass_crystallization.py` |
| Glueball spectrum | [STANDARD-RELABELED] | N_c^2-1 = 8 gluon DOF | Existence | `hadron_mass_crystallization.py` |
| Exotic quarkonia | [FRAMEWORK-CONSTRAINED] | N_c = 3 determines allowed color singlets | Existence + color algebra | `hadron_mass_crystallization.py`, `near_miss_batch_upgrades.py` |

**Honest count**: 3/4 entries [FRAMEWORK-CONSTRAINED] (charmonium, bottomonium, exotic quarkonia), 1/4 [STANDARD-RELABELED] (glueball). All framework content traces to N_c = Im_H = 3, entering through C_F = 4/3 in the Cornell potential and the gluon DOF count. No quarkonium or glueball masses are derived. The conjectured string tension sqrt(sigma) = 441.5 MeV enters the long-range part of the potential but is [CONJECTURE, HRS=6].

**Total verification**: Tests in `hadron_mass_crystallization.py` covering color factors, color singlet structure, and N_c-dependent quantities.

---

## Cross-References

- Hadron formation (single-state entries): `bound_states/hadron_formation.md` (J/psi, Upsilon)
- R-ratio (quarkonium thresholds): `scattering/strong_scattering.md`
- String tension: `verification/sympy/qcd_string_tension_from_framework.py`
- Main catalog: C12 (hadronization), C6 (confinement), C2 (symmetry breaking)
- PDG data: `data/pdg_particles.md`
- Lattice QCD data: `data/lattice_qcd.md`

---

*Created: 2026-02-03 (S239)*
