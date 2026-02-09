# High-Energy Astrophysics Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 239)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C5: BH De-Crystallization, C8: Photon Emission, C15: Gravitational Radiation)
**Layer**: Layer 2 correspondence only (framework adds classification, no predictions)

---

## Disclaimer

**This sub-catalog is entirely [STANDARD-RELABELED].** High-energy astrophysical phenomena (AGN jets, cosmic rays, GRBs, blazars) involve extreme environments where multiple crystallization channels operate simultaneously, but the framework provides no quantitative predictions beyond standard astrophysics. The processes involve complex MHD, relativistic plasma physics, and acceleration mechanisms that are entirely [A-IMPORT]. The framework's contribution is limited to channel classification and chain identification.

---

## Processes

### Active Galactic Nuclei (AGN) and Relativistic Jets

**Chain**: C5(BH accretion: R-dominant) -> C3(accretion disk tilt profile) -> C8(C: multi-wavelength emission) + C15(R: GW from binary SMBH, future)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Supermassive black hole (M ~ 10^6-10^10 M_sun) accretes gas from host galaxy -> Accretion disk forms -> Relativistic jets launched along BH spin axis (Gamma ~ 10-50) -> Multi-wavelength emission from radio to gamma-rays. AGN power the most luminous persistent objects in the universe (L ~ 10^42-10^48 erg/s).
- Tilt: R-channel gravitational potential energy of infalling matter is converted to C-channel radiation (accretion disk) and kinetic energy of jet material. The Blandford-Znajek mechanism (magnetic field threading spinning BH horizon) extracts rotational energy. In crystallization language, the jet is a directed outflow of tilt energy from the de-crystallization region (C5) into the surrounding medium.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Accretion disk thermal + non-thermal emission; jet synchrotron + IC | Radio to gamma-ray |
| H (Weak) | Negligible (though neutrino emission possible from jet-matter interaction) | IceCube candidate sources |
| O (Strong) | pp and p-gamma interactions in jets (produce pions -> neutrinos, gamma-rays) | Hadronic models |
| R (Gravity) | SMBH potential well; binary SMBH GW (future: LISA) | M_BH defines system |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| M_BH (Sgr A*) | Not derived | 4.15(13) x 10^6 M_sun | 3% | GRAVITY/Keck |
| M_BH (M87*) | Not derived | 6.5(7) x 10^9 M_sun | 11% | EHT 2019 |
| Jet power (typical) | Not derived | 10^43-10^47 erg/s | order of magnitude | Multiple methods |
| BH shadow (M87*) | Consistent with GR (C5 exterior) | 42(3) microarcsec | 7% | EHT 2019 |
| Eddington luminosity | L_Edd = 4 pi G M m_p c / sigma_T [standard] | ~1.3 x 10^38 (M/M_sun) erg/s | -- | Standard |

**EHT and the framework**: The Event Horizon Telescope images of M87* and Sgr A* confirm the shadow size predicted by GR (Schwarzschild radius ~ 2 G M / c^2) to ~10%. The framework's C5 (epsilon -> 0 at center, perspective orthogonality at horizon) makes the same predictions as GR for the exterior metric. No deviation is expected or observed at these scales (m_tilt ~ 10^16 GeV means deviations occur only at r ~ 70 L_Pl).

**What framework adds**: Chain classification (C5 -> C3 -> C8/C15). The BH shadow consistency with GR is a check on C5 exterior predictions, but this is not a novel test — the framework reproduces GR exactly for the exterior Schwarzschild/Kerr metric. Jet physics (MHD, particle acceleration, magnetic field geometry) is entirely [A-IMPORT].
**What is imported**: GR [A-IMPORT], MHD jet physics [A-IMPORT], accretion disk models [A-IMPORT], SMBH masses [A-IMPORT], Blandford-Znajek mechanism [A-IMPORT]
**Verification**: `astrophysical_crystallization.py` (BH shadow scaling test)
**Confidence**: [STANDARD-RELABELED]

---

### Ultra-High-Energy Cosmic Rays (GZK Cutoff)

**Chain**: C11(O/C: particle acceleration to E > 10^18 eV) -> C8(C: propagation through CMB) -> C11(GZK: p + gamma_CMB -> Delta+ -> p + pi0 or n + pi+)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Cosmic rays accelerated to extreme energies (E > 10^18 eV = 1 EeV) in astrophysical sources (AGN jets, starburst galaxies, GRBs?) -> Propagation through intergalactic space -> Above ~5 x 10^19 eV (50 EeV), protons interact with CMB photons via the Delta(1232) resonance (GZK process), limiting the propagation distance to ~100 Mpc. This is the Greisen-Zatsepin-Kuzmin (GZK) cutoff.
- Tilt: Multi-channel process. Acceleration involves C-channel (EM acceleration in shocks) or O-channel (relativistic shocks). The GZK process is a C11 pair-creation-like interaction: proton + CMB photon -> Delta(1232) baryon resonance -> pion + nucleon. The Delta resonance is an O-channel (C12) intermediate.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Acceleration (Fermi mechanism in shocks); synchrotron losses | E_max ~ Z e B R |
| H (Weak) | Pion decay: pi+ -> mu+ nu_mu (GZK neutrinos) | Cosmogenic neutrinos |
| O (Strong) | Delta resonance formation: p + gamma -> Delta+ | GZK process |
| R (Gravity) | Source environments (SMBH jets, NS magnetospheres) | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| GZK energy threshold | ~5 x 10^19 eV [standard: Delta resonance at CMB T] | Spectral suppression confirmed | -- | Auger + TA |
| Maximum observed energy | Not derived | ~3 x 10^20 eV (Fly's Eye, 1991; Auger/TA) | -- | Multiple experiments |
| Flux at 10^20 eV | Not derived | ~1 per km^2 per century | order of magnitude | Auger 2020 |
| Source identification | Not derived | Starburst galaxies? AGN? (anisotropy hints) | -- | Auger 2018 |
| GZK neutrino flux | Not derived | Upper limits (IceCube) | -- | IceCube 2021 |

**The Delta resonance in the GZK process**: The GZK threshold occurs when a CMB photon (E_gamma ~ 6 x 10^-4 eV, T_CMB = 2.725 K) has enough energy in the proton rest frame to excite the Delta(1232) resonance. This requires E_p * E_gamma ~ m_Delta^2 - m_p^2 ~ 0.3 GeV^2, giving E_p ~ 5 x 10^19 eV. The Delta mass and width are standard QCD [A-IMPORT]. The N_c = Im_H = 3 that enters baryon spectroscopy (C12) is relevant for the Delta, but this is already documented in `bound_states/hadron_formation.md`.

**What framework adds**: Nothing beyond chain classification. The GZK process involves standard particle physics (Delta resonance from QCD, photopion production cross-section) and standard cosmology (CMB temperature). The acceleration mechanisms are astrophysical MHD [A-IMPORT]. The framework identifies the channels but provides no predictions for cosmic ray spectra, composition, or source populations.
**What is imported**: Delta resonance physics [A-IMPORT], CMB temperature [A-IMPORT], photopion cross-section [A-IMPORT], Fermi acceleration [A-IMPORT], all observations [A-IMPORT]
**Verification**: None (no framework predictions specific to UHECRs)
**Confidence**: [STANDARD-RELABELED]

---

### Gamma-Ray Bursts (GRBs)

**Chain**: C5(BH formation: long GRBs from core collapse) or C5+C13(NS merger: short GRBs) -> C8(C: relativistic jet emission, Gamma ~ 100-1000) -> C8(afterglow: jet-ISM interaction)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Catastrophic astrophysical event (core-collapse supernova for long GRBs, t_90 > 2s; NS-NS or NS-BH merger for short GRBs, t_90 < 2s) -> Ultra-relativistic jet launched (Gamma ~ 100-1000) -> Prompt gamma-ray emission (internal shocks or magnetic reconnection, ~0.1-1 MeV) -> Afterglow (external shock: jet decelerates in ISM, broadband emission from X-ray to radio over days-months).
- Tilt: The most energetic electromagnetic events in the universe. The gravitational energy release (C5 or C5+C13 merger) is converted to jet kinetic energy and then to C-channel radiation. The prompt emission mechanism (internal shocks vs. magnetic reconnection vs. photospheric) remains debated — this is a major open question in astrophysics.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Prompt gamma-rays; afterglow (X-ray to radio); kilonova (short GRBs) | 10^48-10^54 erg (isotropic equivalent) |
| H (Weak) | Neutrino emission from core collapse; r-process in ejecta | MeV neutrinos (undetected beyond SN 1987A) |
| O (Strong) | Nuclear processes in progenitor and ejecta | r-process nucleosynthesis |
| R (Gravity) | BH/NS formation; GW signal (short GRBs: GW170817) | GW counterpart confirmed 2017 |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Rate (long GRBs) | Not derived | ~1 per Gpc^3 per year | factor ~3 | Swift/Fermi |
| Rate (short GRBs) | Not derived | ~3-10 per Gpc^3 per year | factor ~3 | Swift/Fermi |
| E_iso (isotropic equiv.) | Not derived | 10^48-10^54 erg | event-dependent | Multiple |
| E_jet (beaming-corrected) | Not derived | ~10^48-10^51 erg | factor ~3 | Afterglow modeling |
| Gamma (Lorentz factor) | Not derived | 100-1000 | order of magnitude | Opacity argument |
| GW170817 association | Consistent with C5+C13 -> C8 chain | Short GRB + kilonova + GW | -- | Multi-messenger 2017 |

**Multi-messenger astronomy**: GRB 170817A associated with GW170817 (NS merger) confirmed the NS merger origin of (at least some) short GRBs. This is the most striking multi-channel observation: R (GW) + C (gamma-ray + kilonova) + H (implied neutrinos from r-process) + O (r-process nucleosynthesis). The framework's chain classification (C5+C13 -> C8+C10+C15) captures this multi-channel nature but provides no quantitative predictions.

**What framework adds**: Chain classification only. GRBs involve all four channels and connect multiple crystallization types (C5, C8, C10, C13, C15). This is organizationally useful for tracking the multi-messenger sequence but provides no predictions for GRB rates, energetics, spectra, or the prompt emission mechanism.
**What is imported**: Relativistic jet physics [A-IMPORT], fireball model [A-IMPORT], afterglow theory [A-IMPORT], progenitor models [A-IMPORT], all observations [A-IMPORT]
**Verification**: `astrophysical_crystallization.py` (basic GRB energy scaling)
**Confidence**: [STANDARD-RELABELED]

---

### Blazars (AGN with Jets Pointed at Earth)

**Chain**: C5(SMBH accretion) -> C8(C: relativistic jet, beamed toward observer) -> C11(pair cascades in jet) -> C8(broadband SED)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: AGN with relativistic jet aligned within a few degrees of the line of sight. Doppler boosting amplifies the jet emission by factor D^3-D^4 (D ~ 10-50). Two subclasses: BL Lac objects (weak/absent emission lines, high polarization) and flat-spectrum radio quasars (FSRQs, strong emission lines). Dominate the extragalactic gamma-ray sky (Fermi-LAT: ~4000 blazars).
- Tilt: Same as AGN jets but with geometric selection effect (viewing angle). The blazar SED has a characteristic two-hump structure: low-energy (synchrotron, radio to UV/X-ray) and high-energy (inverse Compton or hadronic, X-ray to TeV gamma-ray). The spectral classification (HSP/ISP/LSP by synchrotron peak frequency) reflects the jet parameters.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Synchrotron (low hump); inverse Compton (high hump); polarization | Doppler-boosted by D^3-4 |
| H (Weak) | Possible neutrino production (hadronic models: p-gamma -> pi -> nu) | IceCube TXS 0506+056 |
| O (Strong) | Hadronic processes in jet (pp, p-gamma -> pions) | Hadronic vs leptonic models |
| R (Gravity) | SMBH potential well; jet launching | M_BH ~ 10^8-10^10 M_sun |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Number (Fermi 4LAC) | Not derived | ~3800 blazars | -- | Fermi-LAT 4LAC-DR3 |
| Doppler factor (typical) | Not derived | 10-50 | factor ~2 | VLBI, variability |
| nu_synch peak (HSP) | Not derived | > 10^15 Hz | -- | Fermi + X-ray |
| L_gamma (luminous FSRQs) | Not derived | up to ~10^49 erg/s | -- | Fermi-LAT |
| IceCube association (TXS 0506+056) | Not derived | 3.5 sigma (2017 flare) | -- | IceCube 2018 |

**Neutrino astronomy connection**: The IceCube association of a high-energy neutrino with blazar TXS 0506+056 (2017) suggests hadronic processes in blazar jets. This connects C (EM: gamma-ray flare) with H (weak: neutrino via pion decay). The detection significance is 3.5 sigma for the coincidence. If confirmed, blazars would be established multi-messenger sources involving three channels (C, H, O via hadronic interactions).

**What framework adds**: Chain classification (C5 -> C8 -> C11 -> C8). The multi-channel nature of blazars (synchrotron + IC or hadronic models) maps to C/O channel competition. The potential neutrino association adds H-channel. No quantitative framework predictions for blazar SEDs, variability, or neutrino fluxes.
**What is imported**: Relativistic jet physics [A-IMPORT], synchrotron/IC radiation [A-IMPORT], Doppler boosting [A-IMPORT], SMBH physics [A-IMPORT], all observations [A-IMPORT]
**Verification**: None (no framework predictions specific to blazars)
**Confidence**: [STANDARD-RELABELED]

---

## Summary

| Process | Tag | Framework Content | Gap |
|---------|-----|-------------------|-----|
| AGN jets | [STANDARD-RELABELED] | Chain classification; C5 exterior consistent with EHT | No jet physics predictions |
| UHE cosmic rays (GZK) | [STANDARD-RELABELED] | Chain classification; Delta resonance uses N_c = 3 (documented elsewhere) | No spectrum/source predictions |
| Gamma-ray bursts | [STANDARD-RELABELED] | Chain classification (all 4 channels) | No energetics/rate predictions |
| Blazars | [STANDARD-RELABELED] | Chain classification; multi-channel mapping | No SED/neutrino predictions |

**Overall**: 0/4 [FRAMEWORK-CONSTRAINED], 4/4 [STANDARD-RELABELED]. High-energy astrophysics is the weakest area in the sub-catalog system. These phenomena involve complex, multi-scale MHD and plasma physics that the framework does not address. The value of including them is completeness — showing that the crystallization type system can classify even the most extreme astrophysical processes — while being honest that no predictive content is added.

---

## Cross-References

- BH physics: `astrophysical/compact_objects.md` (BH formation entry)
- GW from mergers: `astrophysical/gravitational_waves.md`
- Delta resonance: `bound_states/hadron_formation.md` (Delta entry)
- NS mergers + kilonovae: `astrophysical/compact_objects.md` (merger entry)
- Main catalog: C5 (BH), C8 (photon emission), C11 (pair processes), C15 (GW)
- Data: `data/gravitational_wave_data.md`
- Verification: `astrophysical_crystallization.py`

---

*Created: 2026-02-03 (S239)*
