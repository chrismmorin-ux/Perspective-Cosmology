# Stellar Processes Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 231)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C8: Photon Emission, C10: Weak Decays, C13: Nuclear Binding, C5: BH De-Crystallization)
**Layer**: Mixed (Layer 2 correspondence + Layer 3 predictions)

---

## Disclaimer

This sub-catalog is **predominantly [STANDARD-RELABELED]**. The framework provides no quantitative predictions for stellar structure, energy generation rates, or nucleosynthesis cross-sections. Framework content is limited to: (1) N_c = Im_H = 3 entering the pp chain weak process through color-singlet counting, (2) N_nu = Im_H = 3 entering supernova neutrino cooling, and (3) chain classification through the C-type system. All quantitative values are [A-IMPORT] from nuclear physics and stellar astrophysics.

---

## Processes

### Solar pp Chain (Proton-Proton Fusion)

**Chain**: C10(H: p + p -> d + e+ + nu_e) -> C13(O: d + p -> 3He) -> C13(O: 3He + 3He -> 4He + 2p) -> C8(C: gamma emission at each step)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Four protons -> 4He + 2e+ + 2nu_e + 26.73 MeV. Dominant energy source in Sun and low-mass stars (T_core < 1.7 x 10^7 K).
- Tilt: Multi-step crystallization chain. Initial H-channel weak process (slowest step: ~10^10 yr per proton) converts proton to neutron. Subsequent O-channel nuclear binding steps proceed rapidly. C-channel photon emission carries energy to surface over ~10^5 yr diffusion time.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Rate-limiting step: p + p -> d + e+ + nu_e | S(0) = 4.01 x 10^-25 MeV b |
| C (EM) | Coulomb barrier penetration; photon emission | Gamow peak at ~6 keV |
| O (Strong) | Nuclear binding in d, 3He, 4He formation | Dominant once H-channel initiates |
| R (Gravity) | Provides confinement pressure (hydrostatic equilibrium) | T_core ~ 1.5 x 10^7 K |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Q-value (pp chain I) | 26.73 MeV [A-IMPORT] | 26.73 MeV | -- | Nuclear physics |
| pp S-factor | Not derived [A-IMPORT] | S(0) = 4.01(4) x 10^-25 MeV b | -- | Solar fusion compilations |
| Solar luminosity | Not derived | 3.828 x 10^26 W | -- | IAU 2015 |
| Solar neutrino flux | Not derived | 6.5 x 10^10 cm^-2 s^-1 (pp) | ~1% | Borexino |
| N_c (color singlet) | Im_H = 3 [D] | 3 | Exact | [D: from div alg] |

**What framework adds**: The pp chain is classified as a multi-type crystallization sequence (C10 -> C13 -> C8). The color-singlet requirement for nuclear binding (N_c = 3 = Im_H) enters through the O-channel confinement of quarks within nucleons. The weak interaction rate-limiting step is an H-channel process (C10). Beyond this classification, the framework adds no quantitative predictions for solar fusion rates.
**What is imported**: All nuclear cross-sections [A-IMPORT], Coulomb barrier physics [A-IMPORT], stellar structure equations [A-IMPORT], solar core temperature [A-IMPORT]
**Verification**: `astrophysical_crystallization.py` (pp chain energy test)
**Confidence**: [STANDARD-RELABELED] for process physics; N_c = 3 consistency check only

---

### CNO Cycle (Carbon-Nitrogen-Oxygen Catalytic Fusion)

**Chain**: C10(H: p-capture + beta+) -> C13(O: nuclear binding) -> C8(C: gamma) [repeated 6 times with 12C as catalyst]
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: 4p -> 4He + 2e+ + 2nu_e + 25.03 MeV (using 12C/13N/13C/14N/15O/15N as catalysts). Dominant energy source in stars with M > 1.3 M_sun (T_core > 1.7 x 10^7 K).
- Tilt: Catalytic crystallization cycle. Same net reaction as pp chain but using pre-existing heavy nuclei as scaffolding. H-channel weak processes (beta+ decays of 13N, 15O) set the cycle time. O-channel nuclear binding at each proton capture. The 14N(p,gamma)15O reaction is the bottleneck (~3 x 10^8 yr at solar T).

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Two beta+ decays per cycle (13N, 15O) | nu_e emission |
| C (EM) | Proton capture gamma emission; Coulomb barriers | 4 (p,gamma) reactions |
| O (Strong) | Nuclear binding at each capture step | Catalyst nuclei (C, N, O) |
| R (Gravity) | Stellar confinement; temperature sensitivity T^16-20 | Hydrostatic equilibrium |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Q-value (CNO-I) | 25.03 MeV [A-IMPORT] | 25.03 MeV | -- | Nuclear physics |
| Bottleneck S-factor | Not derived | S(0) = 1.66(12) keV b (14N(p,g)) | -- | LUNA |
| T dependence | Not derived | ~ T^16 (CNO-I) | -- | Stellar physics |
| Solar CNO fraction | Not derived | ~1.7% of L_sun | ~30% | Borexino 2020 |

**What framework adds**: Chain classification only. The CNO cycle is a catalytic variant of the same multi-type sequence (C10 -> C13 -> C8). The framework provides no insight into why the CNO cycle becomes dominant above ~1.3 M_sun (this depends on Coulomb barrier heights and temperature sensitivity, both [A-IMPORT]).
**What is imported**: All nuclear cross-sections [A-IMPORT], temperature scaling [A-IMPORT], stellar mass thresholds [A-IMPORT]
**Verification**: Standard physics; no dedicated framework test
**Confidence**: [STANDARD-RELABELED]

---

### Helium Flash (Degenerate Helium Ignition)

**Chain**: C13(O: 3-alpha -> 12C) -> C7(thermal: degenerate ignition) -> C8(C: photon + neutrino emission)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Electron-degenerate helium core (T ~ 10^8 K, rho ~ 10^6 g/cm^3) -> Thermonuclear runaway (3-alpha process) -> Core expansion, degeneracy lifted -> Stable helium burning (horizontal branch). Peak luminosity ~10^11 L_sun for ~seconds, unobservable externally.
- Tilt: The triple-alpha process is an O-channel nuclear binding (C13) chain: 4He + 4He -> 8Be (unstable, 10^-16 s) + 4He -> 12C* -> 12C + gamma. The Hoyle state (12C* at 7.654 MeV) is critical. In degenerate matter, the nuclear burning rate is decoupled from pressure response (P independent of T), creating a runaway.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Neutrino cooling (sub-dominant pre-flash) | Plasma, photo, pair neutrinos |
| C (EM) | Photon emission; electron degeneracy pressure | Degenerate EOS |
| O (Strong) | Triple-alpha nuclear reaction | 3-alpha -> 12C (Hoyle state) |
| R (Gravity) | Core confinement; M_core ~ 0.45 M_sun at flash | Hydrostatic failure during flash |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Core mass at flash | Not derived | ~0.45 M_sun | ~5% | Stellar models |
| T_ignition | Not derived | ~10^8 K | -- | Stellar models |
| Hoyle state energy | Not derived [A-IMPORT] | 7.654 MeV | -- | Nuclear physics |
| 3-alpha rate | Not derived [A-IMPORT] | Depends on Hoyle state | -- | NACRE II |
| Peak L | Not derived | ~10^11 L_sun | order of magnitude | Models |

**What framework adds**: Chain classification (C13 -> C7 -> C8). The triple-alpha process is an O-channel nuclear crystallization requiring the Hoyle state resonance, which the framework cannot predict. The degenerate ignition is a thermal phase transition (C7) where the normal pressure-temperature feedback fails. No quantitative framework predictions.
**What is imported**: All nuclear physics [A-IMPORT], degenerate EOS [A-IMPORT], stellar structure [A-IMPORT], Hoyle state existence and energy [A-IMPORT]
**Verification**: Standard physics; no dedicated framework test
**Confidence**: [STANDARD-RELABELED]

---

### Type Ia Supernova (White Dwarf Thermonuclear Detonation)

**Chain**: C13(O: C/O burning -> 56Ni) -> C7(thermal: thermonuclear runaway) -> C8(C: photon emission) -> C10(H: 56Ni -> 56Co -> 56Fe decay chain)
**Tag**: [FRAMEWORK-CONSTRAINED] (upgraded S243: m_p/m_e and alpha enter M_Ch)

**Before -> After**:
- Physical: Carbon-oxygen white dwarf near Chandrasekhar mass (~1.4 M_sun) -> Thermonuclear detonation -> Complete disruption (no remnant) -> ~0.6 M_sun of 56Ni produced -> Optical display powered by 56Ni -> 56Co -> 56Fe radioactive decay chain.
- Tilt: Catastrophic O-channel nuclear crystallization. Unlike the helium flash (which stabilizes), the WD detonation consumes the entire star. The deflagration-to-detonation transition (DDT) or direct detonation initiates thermonuclear burning of C/O to iron-peak elements. Post-explosion: H-channel weak decays of 56Ni (t_1/2 = 6.1 d) and 56Co (t_1/2 = 77.2 d) power the light curve.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | 56Ni/56Co radioactive decay powering light curve | Beta+ and EC decays |
| C (EM) | Photon emission (optical/IR light curve) | Peak M_B ~ -19.3 |
| O (Strong) | Thermonuclear C/O -> 56Ni burning | ~10^51 erg released |
| R (Gravity) | Chandrasekhar mass sets explosion threshold | M_Ch ~ 1.44 M_sun |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| M_Chandrasekhar | Framework-constrained: M_Ch ~ m_Pl^3/m_p^2, m_p/m_e = 132203/72 [CONJ] | 1.44 M_sun | -- | m_p/m_e at 0.06 ppm |
| E_kinetic | Not derived | ~10^51 erg | factor ~2 | Observations |
| M(56Ni) | Not derived | ~0.6 M_sun (typical) | ~30% scatter | Light curve fits |
| Peak M_B | Not derived | -19.3(3) | ~0.3 mag | Phillips relation |
| t_1/2(56Ni) | Not derived [A-IMPORT] | 6.075 d | -- | Nuclear data |
| t_1/2(56Co) | Not derived [A-IMPORT] | 77.236 d | -- | Nuclear data |

**What framework adds**: The Chandrasekhar mass M_Ch ~ (hbar*c/G)^{3/2} / m_p^2 depends on m_p, which is framework-constrained via m_p/m_e = 132203/72 = 1836.153 [CONJECTURE, Tier 1, 0.06 ppm]. Additionally, alpha = 1/137 enters the Coulomb lattice energy correction to the WD equation of state. The M_Ch formula itself is standard physics [A-IMPORT], but the inputs (m_p via m_p/m_e, and alpha) are framework-constrained. Sensitivity: delta(M_Ch)/M_Ch = -2 × delta(m_p)/m_p, so the 0.06 ppm m_p/m_e precision constrains M_Ch to ~0.12 ppm.
**What is imported**: Chandrasekhar mass formula [A-IMPORT], nuclear burning rates [A-IMPORT], 56Ni decay properties [A-IMPORT], WD structure [A-IMPORT], deflagration/detonation physics [A-IMPORT], G and m_e [A-IMPORT]
**Verification**: `astrophysical_crystallization.py` (M_Ch formula test), `near_miss_batch_upgrades.py` (tests 9-11: m_p/m_e precision)
**Confidence**: [FRAMEWORK-CONSTRAINED] for M_Ch via m_p/m_e and alpha; [STANDARD-RELABELED] for SN Ia dynamics

---

### Core-Collapse Supernova (Type II/Ib/Ic)

**Chain**: C13(O: silicon burning -> iron core) -> C5(reverse: core collapse -> proto-NS/BH) -> C10(H: neutrino burst, ~3 x 10^53 erg) -> C8(C: photon emission, ~10^49 erg) -> C15(R: GW emission, ~10^46 erg)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Massive star (M > 8 M_sun) with iron core at Chandrasekhar mass -> Core collapse (free-fall, ~ms) -> Bounce at nuclear density -> Neutrino-driven explosion -> Neutron star or black hole remnant + expanding ejecta + neutrino burst (~10^58 neutrinos, all flavors).
- Tilt: The iron core collapse is a partial de-crystallization (C5): the nuclear structure (O-channel crystallized matter) is crushed to nuclear density, reversing the nuclear binding hierarchy. The neutrino burst is an H-channel process (C10) carrying ~99% of the gravitational binding energy. The photon emission (C8) carries only ~0.01% of the energy. Framework-relevant: N_nu = Im_H = 3 active neutrino species determines the energy partition among flavors through neutrino oscillations in the supernova envelope.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Neutrino burst: 99% of E_binding (~3 x 10^53 erg) | N_nu = 3 active flavors |
| C (EM) | Photon emission: ~10^49 erg (optical display) | ~0.01% of total |
| O (Strong) | Iron core formation; nuclear EOS at bounce | Nuclear matter EOS |
| R (Gravity) | Core collapse dynamics; GW emission (~10^46 erg) | ~10^-6 of total |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| N_nu (active) | Im_H = 3 [D] | 3 (SN 1987A: ~24 events) | -- | Kamiokande-II/IMB |
| E_nu (total) | ~3 x 10^53 erg [A-IMPORT] | ~3 x 10^53 erg (SN 1987A) | factor ~2 | Kamiokande-II |
| E_nu per flavor | ~E_total / (3 active + possible sterile) | ~5 x 10^52 erg per flavor | rough | Models |
| Chandrasekhar mass | Not derived [A-IMPORT] | ~1.44 M_sun | -- | Theory |
| NS birth mass | Not derived | ~1.4 M_sun (typical) | -- | Observations |
| SN rate (MW) | Not derived | ~2 per century | factor ~2 | Historical + models |

**What framework adds**: N_nu = Im_H = 3 active neutrino species enters the neutrino energy partition. With 3 active flavors, equal partition gives ~10^53 erg per flavor in nu_e, nu_mu, nu_tau (and their antiparticles). This is a consistency check, not a prediction — N_nu = 3 is independently measured. The core collapse connects to C5 (de-crystallization): the iron core undergoes partial structural dissolution at nuclear density. The neutrino burst is the largest H-channel energy release in the observable universe. GW emission connects to C15 (R-channel).
**What is imported**: Core-collapse dynamics [A-IMPORT], nuclear EOS [A-IMPORT], neutrino transport [A-IMPORT], neutrino oscillation parameters [A-IMPORT], explosion mechanism (neutrino-driven or MHD) [A-IMPORT]
**Verification**: `astrophysical_crystallization.py` (N_nu in SN energy partition test)
**Confidence**: [FRAMEWORK-CONSTRAINED] for N_nu = 3 entering energy partition; [STANDARD-RELABELED] for all other aspects

---

## Summary

| Process | Tag | Framework Content | Gap |
|---------|-----|-------------------|-----|
| Solar pp chain | [STANDARD-RELABELED] | Chain classification (C10 -> C13 -> C8); N_c = 3 in nucleon structure | No fusion rate predictions |
| CNO cycle | [STANDARD-RELABELED] | Chain classification only | No cross-section predictions |
| Helium flash | [STANDARD-RELABELED] | Chain classification (C13 -> C7 -> C8) | No Hoyle state prediction |
| Type Ia SN | [FRAMEWORK-CONSTRAINED] | M_Ch via m_p/m_e (0.06 ppm) + alpha | M_Ch constrained to ~0.12 ppm |
| Core-collapse SN | [FRAMEWORK-CONSTRAINED] | N_nu = Im_H = 3 in neutrino energy partition; C5 connection | No explosion mechanism |

**Overall**: 2/5 [FRAMEWORK-CONSTRAINED], 3/5 [STANDARD-RELABELED]. The astrophysical domain is where the framework has the least to say. The single piece of framework-relevant content is N_nu = 3 (from division algebra dimensions) entering the core-collapse supernova neutrino energy partition — but this is a consistency check against independently measured physics, not a novel prediction. All stellar structure, nuclear reaction rates, and explosion mechanisms are pure [A-IMPORT].

**Cross-References**:
- Main catalog: C5 (BH de-crystallization), C8 (photon emission), C10 (weak decays), C13 (nuclear binding), C15 (GW radiation)
- Data: `data/nuclear_data.md`
- Verification: `astrophysical_crystallization.py`
- Sessions: S231

---

*Created: 2026-02-03 (S231)*
