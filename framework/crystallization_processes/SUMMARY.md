# Crystallization Catalog Summary

**Generated**: S241 (2026-02-03), **updated S250** | **Entries**: 99 | **Files**: 25 | **Subdirs**: 6

## Tag Distribution

| Tag | Count | % |
|-----|-------|---|
| FRAMEWORK-DERIVED | 3 | 3.0% |
| FRAMEWORK-CONSTRAINED | 55 | 55.6% |
| STANDARD-RELABELED | 41 | 41.4% |

## Most-Used Framework Quantities

| Quantity | Formula | Entries Using |
|----------|---------|---------------|
| N_c = Im_H | 3 | ~25 |
| sin^2 theta_W | 28/121 | ~12 |
| alpha | 1/(n_d^2+n_c^2) = 1/137 | ~10 |
| N_nu = Im_H | 3 | ~6 |
| n_d (defect dim) | 4 | ~5 |
| n_c (crystal dim) | 11 | ~5 |
| xi (misalignment) | 4/121 | ~3 |
| b_0 (QCD beta) | Im_O = 7 | ~3 |

## Master Entry Table

| # | Process | Subdir | File | Tag | Key Quantities | Script |
|---|---------|--------|------|-----|----------------|--------|
| **DECAYS** (15 entries: 0D, 6C, 9R) |
| 1 | Neutron beta decay | decays | weak_decays | R | Im_H=3 mode count | weak_decay_mode_counting.py |
| 2 | Muon decay | decays | weak_decays | R | H-channel, m_mu/m_e=Phi_6(43) | weak_decay_mode_counting.py |
| 3 | Charged pion decay | decays | weak_decays | R | m_mu/m_e helicity suppression | weak_decay_mode_counting.py |
| 4 | Kaon decays | decays | weak_decays | R | H-channel generation transition | NONE |
| 5 | Tau decay | decays | weak_decays | **C** | N_c=Im_H=3, R_tau=N_c | weak_decay_mode_counting.py |
| 6 | Z -> ff-bar | decays | ew_boson_decays | **C** | sin^2=28/121, N_nu=3, g_V/g_A=9/121 | z_branching_crystallization.py |
| 7 | W -> ff' | decays | ew_boson_decays | **C** | Im_H=3 lep + N_c=3 had = 9 ch | w_branching_crystallization.py |
| 8 | H -> XX | decays | ew_boson_decays | **C** | kappa_V=sqrt(117/121) from xi=4/121 | ewsb_predictions.py |
| 9 | t -> bW | decays | ew_boson_decays | R | y_t=120/121 | pdg_data_master.py |
| 10 | pi0 -> gamma gamma | decays | em_decays | **C** | N_c=Im_H=3 in ABJ anomaly | r_ratio_crystallization.py |
| 11 | Radiative baryon decays | decays | em_decays | R | C8 channel ID only | NONE |
| 12 | Positronium annihilation | decays | em_decays | **C** | alpha^5 (p-Ps), alpha^6 (o-Ps) rates | near_miss_batch_upgrades.py |
| 13 | Alpha decay | decays | nuclear_decays | R | Chain classification only | NONE |
| 14 | Nuclear beta decay | decays | nuclear_decays | R | H-channel weak transition | weak_decay_mode_counting.py |
| 15 | Nuclear gamma decay | decays | nuclear_decays | R | C8 chain classification | NONE |
| **SCATTERING** (17 entries: 0D, 14C, 3R) |
| 16 | Compton scattering | scattering | em_scattering | **C** | sigma_T ~ alpha^2 with framework alpha | near_miss_batch_upgrades.py |
| 17 | Bhabha scattering | scattering | em_scattering | R/C | alpha^2 (QED), sin^2=28/121 (Z-pole) | NONE |
| 18 | Moller scattering | scattering | em_scattering | R/C | sin^2=28/121 parity violation | NONE |
| 19 | e+e- -> mu+mu- | scattering | em_scattering | **C** | sin^2=28/121, g_V/g_A=9/121 | z_branching_crystallization.py |
| 20 | Thomson/Rayleigh | scattering | em_scattering | **C** | alpha^2, alpha^4 vertex counting | near_miss_batch_upgrades.py |
| 21 | e+e- -> hadrons (R-ratio) | scattering | strong_scattering | **C** | N_c=Im_H=3, b_0=Im_O=7 | r_ratio_crystallization.py |
| 22 | Deep inelastic scattering | scattering | strong_scattering | **C** | N_c=3 sum rules, b_0=7 DGLAP | r_ratio_crystallization.py |
| 23 | Drell-Yan | scattering | strong_scattering | **C** | 1/N_c=1/3, sin^2=28/121 Z-pole | r_ratio_crystallization.py |
| 24 | Jet production | scattering | strong_scattering | **C** | C_A=3, C_F=4/3, C_A/C_F=9/4 | r_ratio_crystallization.py |
| 25 | nu CC scattering | scattering | weak_scattering | R | Im_H=3 generations | weak_decay_mode_counting.py |
| 26 | nu NC scattering | scattering | weak_scattering | **C** | sin^2=28/121 in Z couplings | z_boson_couplings_crystallization.py |
| 27 | Inverse beta decay | scattering | weak_scattering | R | H-channel only | weak_decay_mode_counting.py |
| 28 | CEvNS | scattering | weak_scattering | **C** | sin^2=28/121, Q_W^p=9/121 | z_boson_couplings_crystallization.py |
| 29 | Gravitational lensing | scattering | grav_scattering | **C** | n_d=4 → EFE → Schwarzschild → deflection | grav_scattering_crystallization.py |
| 30 | Perihelion precession | scattering | grav_scattering | **C** | n_d=4 → EFE → Schwarzschild → precession | grav_scattering_crystallization.py |
| 31 | Shapiro time delay | scattering | grav_scattering | **C** | n_d=4 → EFE → Schwarzschild → γ=1 | grav_scattering_crystallization.py |
| 32 | Frame dragging | scattering | grav_scattering | **C** | n_d=4 → EFE → Kerr → Lense-Thirring | grav_scattering_crystallization.py |
| **BOUND STATES** (18 entries: 0D, 10C, 8R) |
| 33 | Pion formation | bound_states | hadron_formation | **C** | N_c=Im_H=3 (ABJ anomaly) | hadron_mass_crystallization.py |
| 34 | Kaon formation | bound_states | hadron_formation | R | N_c=3 color singlet | hadron_mass_crystallization.py |
| 35 | Proton and neutron | bound_states | hadron_formation | **C** | N_c=3, m_p/m_e=1836+11/72 | hadron_mass_crystallization.py |
| 36 | Delta baryons | bound_states | hadron_formation | R | N_c=3 | hadron_mass_crystallization.py |
| 37 | J/psi | bound_states | hadron_formation | **C** | C_F=4/3, sigma | hadron_mass_crystallization.py |
| 38 | Upsilon | bound_states | hadron_formation | **C** | C_F=4/3, sigma | hadron_mass_crystallization.py |
| 39 | Deuteron | bound_states | nuclear_binding | R | Channel ID only | hadron_mass_crystallization.py |
| 40 | Helium-4 | bound_states | nuclear_binding | R | N=Z=2=dim(C) [SPECULATION] | hadron_mass_crystallization.py |
| 41 | Iron-56 | bound_states | nuclear_binding | R | SEMF channel labels | hadron_mass_crystallization.py |
| 42 | Magic numbers | bound_states | nuclear_binding | R | 2,8,28 = div alg dims [SPEC] | hadron_mass_crystallization.py |
| 43 | Charmonium spectrum | bound_states | quarkonia | **C** | C_F=4/3, sigma | hadron_mass_crystallization.py |
| 44 | Bottomonium spectrum | bound_states | quarkonia | **C** | C_F=4/3, sigma | hadron_mass_crystallization.py |
| 45 | Glueball spectrum | bound_states | quarkonia | R | N_c^2-1=8 gluon DOF | hadron_mass_crystallization.py |
| 46 | Exotic quarkonia | bound_states | quarkonia | **C** | N_c=3 determines color singlets | near_miss_batch_upgrades.py |
| 47 | Hydrogen atom | bound_states | atomic_structure | **C** | alpha=1/137 | alpha_enhanced_prediction.py |
| 48 | Helium atom | bound_states | atomic_structure | **C** | alpha via Z*alpha = 2/137 | near_miss_batch_upgrades.py |
| 49 | Positronium | bound_states | atomic_structure | **C** | alpha=1/137 (purest test) | alpha_enhanced_prediction.py |
| 50 | Lamb shift | bound_states | atomic_structure | R | alpha at O(alpha^5) | alpha_enhanced_prediction.py |
| **PHASE TRANSITIONS** (19 entries: 1D, 12C, 6R) |
| 51 | Confinement crossover | phase_trans | qcd_phase | **C** | N_c=3 Z(3) center symmetry, crossover order | qcd_phase_crystallization.py |
| 52 | Quark-gluon plasma | phase_trans | qcd_phase | **C** | N_c=3, g_qgp=47.5 Stefan-Boltzmann | qcd_phase_crystallization.py |
| 53 | Chiral symmetry restoration | phase_trans | qcd_phase | R | Channel language only | NONE |
| 54 | Color superconductivity | phase_trans | qcd_phase | **C** | N_c=3 antisym=anti-fund uniqueness | qcd_phase_crystallization.py |
| 55 | EWSB (SO(11)->SO(4)xSO(7)) | phase_trans | ewsb_detailed | **D** | n_d=4, n_c=11, Gr(4,11), xi=4/121 | ewsb_higgs_from_goldstones.py |
| 56 | Higgs mechanism (pNGB) | phase_trans | ewsb_detailed | **C** | xi=4/121, kappa_V/f/lambda | ewsb_coupling_deviations.py |
| 57 | W/Z mass generation | phase_trans | ewsb_detailed | **C** | sin^2=28/121, M_W/M_Z | weinberg_angle_investigation.py |
| 58 | Fermion mass generation | phase_trans | ewsb_detailed | **C** | kappa_f, spinorial 15=1+2+4+8 | fermion_embedding_spinorial.py |
| 59 | Neutron freeze-out | phase_trans | bbn | **C** | N_nu=Im_H=3, g_*=10.75 | phase_transition_crystallization.py |
| 60 | Deuterium bottleneck | phase_trans | bbn | R | Channel labels only | NONE |
| 61 | Helium-4 synthesis | phase_trans | bbn | **C** | N_nu=3 -> Y_p~0.247 | phase_transition_crystallization.py |
| 62 | Lithium-7 problem | phase_trans | bbn | **C** | CCF=1/3 from CNH (S100/S244) | lithium7_crystallization.py |
| 63 | Hydrogen recombination | phase_trans | recombination | **C** | alpha=1/137, N_nu=3 | phase_transition_crystallization.py |
| 64 | Cosmic dawn/reionization | phase_trans | recombination | R | None | NONE |
| 65 | Saha equation | phase_trans | recombination | **C** | B_H=alpha^2*m_e/2 | phase_transition_crystallization.py |
| 66 | Sakharov conditions | phase_trans | baryogenesis | R | Channel mapping only | NONE |
| 67 | EW baryogenesis | phase_trans | baryogenesis | **C** | xi=4/121, v_c/T_c=0.14 (negative prediction) | ew_baryogenesis_crystallization.py |
| 68 | Leptogenesis | phase_trans | baryogenesis | R | nu_R from SO(11) spinor | NONE |
| 69 | Baryon asymmetry eta | phase_trans | baryogenesis | R | None (fundamental gap) | NONE |
| **ASTROPHYSICAL** (17 entries: 0D, 6C, 11R) |
| 70 | Solar pp chain | astrophysical | stellar | R | N_c=3 in nucleons | astrophysical_crystallization.py |
| 71 | CNO cycle | astrophysical | stellar | R | Chain classification | NONE |
| 72 | Helium flash | astrophysical | stellar | R | Chain classification | NONE |
| 73 | Type Ia supernova | astrophysical | stellar | **C** | M_Ch via m_p/m_e + alpha | near_miss_batch_upgrades.py |
| 74 | Core-collapse supernova | astrophysical | stellar | **C** | N_nu=Im_H=3 energy partition | astrophysical_crystallization.py |
| 75 | Neutron star (TOV) | astrophysical | compact_objects | R | epsilon stabilization | astrophysical_crystallization.py |
| 76 | Black hole formation | astrophysical | compact_objects | **C** | n_d=4 (S_BH), no-echo R~0 | bh_information_paradox_resolution.py |
| 77 | NS mergers | astrophysical | compact_objects | R | c_GW=c consistency | astrophysical_crystallization.py |
| 78 | Magnetar flares | astrophysical | compact_objects | R | Chain classification | NONE |
| 79 | Binary inspiral | astrophysical | grav_waves | **C** | n_d=4 → EFE → quadrupole radiation | grav_scattering_crystallization.py |
| 80 | Merger/ringdown | astrophysical | grav_waves | **C** | No-echo R~0 from n_c=11 | near_miss_batch_upgrades.py |
| 81 | Continuous GWs | astrophysical | grav_waves | R | Chain classification | NONE |
| 82 | Stochastic GW background | astrophysical | grav_waves | **C** | r=7/128 [CONJ, IN TENSION] | astrophysical_crystallization.py |
| 83 | AGN jets | astrophysical | high_energy_astro | R | BH shadow consistency | astrophysical_crystallization.py |
| 84 | UHE cosmic rays (GZK) | astrophysical | high_energy_astro | R | N_c=3 in Delta resonance | NONE |
| 85 | Gamma-ray bursts | astrophysical | high_energy_astro | R | Chain classification | astrophysical_crystallization.py |
| 86 | Blazars | astrophysical | high_energy_astro | R | Chain classification | NONE |
| **COSMOLOGICAL** (13 entries: 2D, 7C, 4R) |
| 87 | Slow-roll inflation | cosmological | inflation | **D** | mu^2=1536/7, n_s=193/200, r | cosmological_crystallization.py |
| 88 | Reheating | cosmological | inflation | **C** | g_*=106.75 from N_c=3, N_nu=3 | near_miss_batch_upgrades.py |
| 89 | Primordial perturbations | cosmological | inflation | **D** | n_s=193/200, dn_s=-7/40000 | cosmological_crystallization.py |
| 90 | Jeans collapse | cosmological | structure | **C** | n_s=193/200 [DERIVED] initial P(k) | near_miss_batch_upgrades.py |
| 91 | BAO | cosmological | structure | **C** | Omega_m=63/200, N_eff=3 | cosmological_crystallization.py |
| 92 | DM halo formation | cosmological | structure | **C** | m_DM=m_e*n_c^2/n_d [DISCREP] | cosmological_crystallization.py |
| 93 | Galaxy formation | cosmological | structure | R | N_nu=3 only | NONE |
| 94 | DM interactions | cosmological | dark_sector | **C** | m_DM formula [DISCREPANCY] | cosmological_crystallization.py |
| 95 | Dark energy / CC | cosmological | dark_sector | **C** | Omega_Lambda=137/200 [RED FLAG] | cosmological_crystallization.py |
| 96 | Void structure | cosmological | dark_sector | R | None | NONE |
| 97 | Primary CMB | cosmological | cmb_detailed | **C** | n_s, l_2=537, N_eff=3, Omega_m/L | cosmological_crystallization.py |
| 98 | Secondary CMB | cosmological | cmb_detailed | R | Lambda>0 for ISW | NONE |
| 99 | CMB spectral distortions | cosmological | cmb_detailed | R | None | NONE |

**Legend**: D = FRAMEWORK-DERIVED, C = FRAMEWORK-CONSTRAINED, R = STANDARD-RELABELED, R/C = dual-tagged, R* = contains prediction but tagged R, [DISCREP] = known discrepancy, [SPEC] = speculation

## Framework Density by File (% non-RELABELED)

| File | D+C / Total | Density |
|------|-------------|---------|
| ewsb_detailed.md | 4/4 | **100%** |
| strong_scattering.md | 4/4 | **100%** |
| dark_sector.md | 2/3 | 67% |
| inflation_detailed.md | 3/3 | **100%** |
| hadron_formation.md | 4/6 | 67% |
| quarkonia.md | 3/4 | 75% |
| atomic_structure.md | 3/4 | 75% |
| weak_scattering.md | 2/4 | 50% |
| ew_boson_decays.md | 3/4 | 75% |
| structure_formation.md | 3/4 | 75% |
| bbn.md | 2/4 | 50% |
| recombination.md | 2/3 | 67% |
| em_scattering.md | 4/5 | 80% |
| cmb_detailed.md | 1/3 | 33% |
| stellar.md | 2/5 | 40% |
| weak_decays.md | 1/5 | 20% |
| compact_objects.md | 1/4 | 25% |
| nuclear_decays.md | 0/3 | **0%** |
| nuclear_binding.md | 0/4 | **0%** |
| qcd_phase.md | 3/4 | **75%** |
| grav_scattering.md | 4/4 | **100%** |
| grav_waves.md | 3/4 | 75% |
| high_energy_astro.md | 0/4 | **0%** |
| baryogenesis.md | 1/4 | 25% |
