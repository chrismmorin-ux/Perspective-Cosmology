# CMB Anisotropy Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 234)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C1: Cosmic Crystallization, C7: Cosmological Phase Transitions, C17: Structure Formation)
**Layer**: Mixed (Layer 2 correspondence + Layer 3 predictions)

---

## Disclaimer

This sub-catalog has **significant framework content** for primary anisotropies (n_s, l_2, N_eff, Omega_Lambda) but is [STANDARD-RELABELED] for secondary anisotropies and spectral distortions. The CMB is the domain where the framework's cosmological predictions are most testable. See `topics/cmb-physics.md` for the full multi-session topic file and scorecard: 11 derived, 2 conjectured, 3 falsified, 7 gaps.

---

## Processes

### Primary CMB Anisotropies (Sachs-Wolfe + Acoustic Peaks)

**Chain**: C1(quantum perturbations) -> C7(acoustic oscillations in baryon-photon fluid) -> C4(last scattering) -> C8(CMB photon emission)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Primordial density perturbations (from C1 inflation) -> acoustic oscillations in baryon-photon plasma -> photon last scattering at z ~ 1090 -> CMB temperature anisotropy map (delta T/T ~ 10^-5)
- Tilt: C-channel (photon) oscillation in R-channel (gravitational) potential wells. The Sachs-Wolfe effect (delta T/T = -Phi/3 for large-scale adiabatic perturbations) reflects the initial R-channel tilt from C1. Acoustic peaks arise from C-channel standing waves in R-channel potential wells. Peak positions and heights encode cosmological parameters.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | N_eff = 3 neutrino species contribute to radiation density, shift peak positions | Free-streaming neutrinos |
| C (EM) | Photon-baryon acoustic oscillations; Thomson scattering before z_rec | Acoustic modes (compression/rarefaction) |
| O (Strong) | Inactive at CMB scales | — |
| R (Gravity) | Provides potential wells; drives Sachs-Wolfe effect | Metric perturbations Phi, Psi |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| n_s (power spectrum tilt) | 193/200 = 0.965 [D] | 0.9649 +/- 0.0042 | 0.024 sigma | Planck 2018 |
| l_1 (1st peak position) | From l_A [A-IMPORT] | 220.0 +/- 0.5 | — | Planck |
| l_2 (2nd peak position) | phi_odd = 3/11 -> l_2 = 537 [D] | 537.5 +/- 0.7 | 0.71 sigma (0.09%) | Planck |
| l_2/l_1 ratio | 537/220 = 2.441 [D] | 537.5/220.0 = 2.443 | 0.09% | Planck |
| N_eff (neutrino species) | Im_H = 3 [D] | 2.99 +/- 0.17 | 0.06 sigma | Planck 2018 |
| Omega_Lambda | 137/200 = 0.685 [CONJECTURE] | 0.6847 +/- 0.0073 | 0.04 sigma | Planck 2018 |
| Omega_m | 63/200 = 0.315 [CONJECTURE] | 0.3153 +/- 0.0073 | 0.04 sigma | Planck 2018 |
| phi_odd (odd-peak baryon loading) | Im_H/n_c = 3/11 = 0.2727 [D] | ~0.273 (from l_2) | ~0.4% | S199 |
| Y_p (primordial He-4) | ~0.2471 (from N_nu = 3) [FRAMEWORK-CONSTRAINED] | 0.245 +/- 0.004 | 0.53 sigma | BBN + Aver+ 2021 |
| l_A (acoustic scale) | Not derived [A-IMPORT] | 301.47 +/- 0.09 | — | Planck |
| Peak heights (C_l) | Not fully derived [GAP] | — | — | Gap |

**What framework adds**:
1. **n_s = 193/200**: Genuine framework prediction from hilltop potential (0.024 sigma from Planck). Sets the tilt of the primordial power spectrum.
2. **l_2 via phi_odd = 3/11**: The second acoustic peak position is explained through baryon loading with the odd-peak suppression factor phi_odd = Im_H/n_c = 3/11. Resolved in S199 to 0.4% accuracy.
3. **N_eff = 3**: From Im(H) = 3. The number of light neutrino species affects the damping tail and peak positions. Consistent with Planck to 0.06 sigma.
4. **Omega_Lambda = 137/200, Omega_m = 63/200**: [CONJECTURE] — these affect the angular diameter distance to the LSS and hence peak positions. Both within 0.04 sigma of Planck, but no derivation mechanism (EQ-002).

**What is imported**: l_A (acoustic scale) [A-IMPORT], angular diameter distance [A-IMPORT], standard perturbation theory [A-IMPORT], Sachs-Wolfe formula [A-IMPORT], peak height physics [A-IMPORT/GAP]

**Falsified framework claims in CMB domain**:
- F-8: eta* = 337 Mpc (actual 280 Mpc, 16.8% off)
- F-9: c_s = 3/7 (actual 1/sqrt(3), 20% off)
- The original r_s = 337 * 3/7 decomposition was compensating errors

**Verification**: `cosmological_crystallization.py` (tests 2, 4-8, 10, 11: n_s, N_eff, Omega_Lambda/m, l_2, Y_p, spectral running)
**Confidence**: [FRAMEWORK-CONSTRAINED] for n_s, l_2, N_eff inputs; [CONJECTURE] for Omega_Lambda/Omega_m; [GAP] for peak heights, l_A, sigma_8

---

### Secondary CMB Anisotropies (ISW, Lensing, SZ)

**Chain**: C17(R-channel: late-time structure) -> C8(C-channel: photon deflection/energy change) -> observation
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Primary CMB photons traverse evolving large-scale structure -> acquire additional temperature/polarization signals from: (1) Integrated Sachs-Wolfe (ISW): time-varying potentials in Lambda-dominated era, (2) Gravitational lensing: deflection by intervening mass, (3) Sunyaev-Zel'dovich (SZ): inverse Compton scattering off hot cluster gas
- Tilt: C-channel photons interact with R-channel structure (ISW, lensing) and with C-channel hot gas (SZ). These are post-primary modifications to the CMB signal.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Inactive | — |
| C (EM) | CMB photons scattered by hot electrons (thermal SZ); inverse Compton (kinetic SZ) | Frequency-dependent (tSZ), frequency-independent (kSZ) |
| O (Strong) | Inactive at relevant energies | — |
| R (Gravity) | ISW: time-varying Phi generates delta T; Lensing: mass deflects photon paths | ISW: dPhi/dt; Lensing: kappa, phi maps |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| ISW amplitude | Not derived [A-IMPORT] | Detected (~3 sigma via cross-correlation) | — | Planck + surveys |
| Lensing power spectrum | Not derived [A-IMPORT] | A_L = 1.011 +/- 0.028 | — | Planck 2018 |
| tSZ power (l = 3000) | Not derived [A-IMPORT] | ~7 muK^2 | — | ACT/SPT |
| Sigma_8 * Omega_m^0.5 | Not derived [GAP] | 0.432 +/- 0.006 | — | Various |

**What framework adds**: Minimal. The ISW effect exists because Lambda > 0 (potentials decay during Lambda-dominated era). The framework's Lambda > 0 (S230 resolution) is consistent. Omega_Lambda = 137/200 [CONJECTURE] affects the ISW amplitude, but the prediction is not quantitative. Lensing and SZ are standard physics with no framework-specific content.

**Indirect framework connection**: The ISW effect is a consequence of Lambda > 0. The S230 sign resolution (F-10 was convention error) means the framework correctly predicts the existence of ISW through Lambda > 0. But the amplitude depends on sigma_8 and Omega_Lambda, neither of which is framework-derived.

**What is imported**: All secondary anisotropy physics [A-IMPORT], ISW calculation [A-IMPORT], lensing reconstruction [A-IMPORT], SZ physics [A-IMPORT]
**Verification**: No dedicated tests (standard physics)
**Confidence**: [STANDARD-RELABELED] for all secondary effects

---

### CMB Spectral Distortions

**Chain**: C8(C-channel: energy injection into CMB photon bath) -> thermalization
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: CMB blackbody spectrum T = 2.7255 K -> small deviations from perfect blackbody caused by energy injection at various epochs: mu-distortions (z > 2 x 10^6, partial thermalization), y-distortions (z < 5 x 10^4, no thermalization). Sources: Silk damping, dark matter annihilation, decaying particles.
- Tilt: C-channel energy injected into the photon bath. At high z, thermalization restores near-blackbody (mu-type distortion from incomplete thermalization). At low z, Compton scattering cannot restore equilibrium (y-type distortion). The CMB blackbody is the "crystallized" photon spectrum.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Possible energy injection from DM annihilation/decay | Model-dependent |
| C (EM) | Photon spectrum; Compton thermalization; Bremsstrahlung emission | Blackbody + distortions |
| O (Strong) | Inactive at CMB energies | — |
| R (Gravity) | Silk damping injects energy (gravitational acoustic dissipation) | On small scales |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| T_CMB | Not derived [A-IMPORT] | 2.7255 +/- 0.0006 K | — | COBE/FIRAS |
| mu-distortion | Not derived [A-IMPORT] | |mu| < 9 x 10^-5 (95% CL) | — | COBE/FIRAS |
| y-distortion | Not derived [A-IMPORT] | |y| < 1.5 x 10^-5 (95% CL) | — | COBE/FIRAS |
| Silk damping mu | Not derived [A-IMPORT] | ~2 x 10^-8 (predicted, SM) | — | Standard |

**What framework adds**: Nothing quantitative. The CMB blackbody temperature T = 2.7255 K is not derived. Spectral distortions from Silk damping depend on the power spectrum at small scales, which requires A_s (gap EQ-011). If the framework's DM candidate (5 GeV or 15.5 MeV) has specific annihilation/decay channels, spectral distortion constraints could test it — but no predictions exist yet.
**What is imported**: All spectral distortion physics [A-IMPORT], thermalization theory [A-IMPORT], FIRAS bounds [A-IMPORT]
**Verification**: No dedicated tests (standard physics)
**Confidence**: [STANDARD-RELABELED] — framework provides no spectral distortion predictions

---

## Summary Statistics

| Tag | Count | Processes |
|-----|-------|-----------|
| [FRAMEWORK-DERIVED] | 0 | — |
| [FRAMEWORK-CONSTRAINED] | 1 | Primary anisotropies (n_s, l_2, N_eff inputs) |
| [STANDARD-RELABELED] | 2 | Secondary anisotropies, spectral distortions |

**Note**: The primary anisotropies entry is [FRAMEWORK-CONSTRAINED] rather than [FRAMEWORK-DERIVED] because the CMB observable predictions (peak positions, heights, spectrum shape) use standard CMB physics with framework inputs (n_s, N_eff, Omega_Lambda). The framework does not derive the Sachs-Wolfe formula, acoustic oscillation equations, or peak height physics — it provides parameter inputs that these standard calculations use.

---

*Created: 2026-02-03 (S234 — Phase 6: cosmological processes)*
*Verification: `verification/sympy/cosmological_crystallization.py` (16/16 PASS)*
