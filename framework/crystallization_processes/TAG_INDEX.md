# Crystallization Catalog — Tag Index

**Generated**: S241 (2026-02-03), **updated S250** | **99 entries** across 25 files

---

## FRAMEWORK-DERIVED (3 entries, 3.0%)

Processes where the framework generates the result from axioms/Layer 1 mathematics.

| # | Process | File | Key Derivation | Script |
|---|---------|------|----------------|--------|
| 55 | EWSB (SO(11)->SO(4)xSO(7)) | ewsb_detailed | Composite Higgs on Gr(4,11) from n_d=4, n_c=11 | ewsb_higgs_from_goldstones.py |
| 87 | Slow-roll inflation | inflation_detailed | Hilltop potential with mu^2=1536/7 from division algebras | cosmological_crystallization.py |
| 89 | Primordial perturbations | inflation_detailed | n_s=193/200, dn_s/d(ln k)=-7/40000 | cosmological_crystallization.py |

**Assessment**: All 3 are verified. EWSB is the strongest (complete coset derivation). Inflation has r-formula ambiguity (7/200 vs 7/128). Perturbation spectrum A_s amplitude NOT derived (gap EQ-011).

---

## FRAMEWORK-CONSTRAINED (55 entries, 55.6%)

Processes where framework-derived quantities (N_c, sin^2 theta_W, alpha, etc.) enter standard physics formulas, constraining outcomes.

### By dominant framework quantity:

**N_c = Im_H = 3** (primary constraint in 18 entries):

| # | Process | File | How N_c enters |
|---|---------|------|----------------|
| 5 | Tau decay | weak_decays | R_tau = N_c at Born level |
| 6 | Z -> ff-bar | ew_boson_decays | N_nu=3 active species |
| 7 | W -> ff' | ew_boson_decays | 3 leptonic + 6 hadronic = 9 channels |
| 10 | pi0 -> gamma gamma | em_decays | ABJ anomaly coefficient = N_c |
| 21 | R-ratio | strong_scattering | R = N_c * sum(Q_f^2) |
| 22 | DIS | strong_scattering | GLS sum rule = N_c |
| 23 | Drell-Yan | strong_scattering | 1/N_c color averaging |
| 24 | Jet production | strong_scattering | C_A=3, C_F=4/3 |
| 33 | Pion formation | hadron_formation | ABJ anomaly for pi0 |
| 35 | Proton/neutron | hadron_formation | Exactly 3 quarks per baryon |
| 37 | J/psi | hadron_formation | C_F=4/3 in Cornell potential |
| 38 | Upsilon | hadron_formation | C_F=4/3 in Cornell potential |
| 43 | Charmonium | quarkonia | C_F=4/3 |
| 44 | Bottomonium | quarkonia | C_F=4/3 |
| 59 | Neutron freeze-out | bbn | N_nu=3 in g_*=10.75 |
| 61 | He-4 synthesis | bbn | Y_p depends on N_nu via n/p ratio |
| 51 | Confinement crossover | qcd_phase | Z(3) center symmetry determines transition order (S245) |
| 52 | QGP formation | qcd_phase | g_qgp = 2(N_c²-1) + 7/8·4·N_c·N_f = 47.5 (S245) |
| 54 | Color superconductivity | qcd_phase | Antisym = anti-fund uniqueness: N_c(N_c-1)/2 = N_c iff N_c=3 (S245) |
| 62 | Lithium-7 problem | bbn | CCF = 1/3 from CNH: Li-7 (A=7 non-norm, Z=3 non-norm, N=4 norm) (S244/S250) |
| 74 | Core-collapse SN | stellar | N_nu=3 energy partition |
| 76 | Black hole formation | compact_objects | n_d=4 in S_BH=A/(4L_Pl^2) |

**sin^2 theta_W = 28/121** (primary constraint in 10 entries):

| # | Process | File | How sin^2 enters |
|---|---------|------|------------------|
| 6 | Z -> ff-bar | ew_boson_decays | All Z couplings g_V, g_A |
| 19 | e+e- -> mu+mu- | em_scattering | A_FB at Z-pole |
| 26 | nu NC scattering | weak_scattering | Z couplings in NC cross-sections |
| 28 | CEvNS | weak_scattering | Weak nuclear charge Q_W |
| 8 | Higgs decays | ew_boson_decays | κ_V = √(117/121) from ξ = 4/121 (re-tagged S242) |
| 56 | Higgs mechanism | ewsb_detailed | xi=4/121 -> kappa_V |
| 57 | W/Z mass generation | ewsb_detailed | M_W/M_Z = cos(theta_W) |
| 58 | Fermion mass gen | ewsb_detailed | kappa_f from spinorial embedding |
| 67 | EW baryogenesis | baryogenesis | xi=4/121 gives v_c/T_c ~ 0.14 << 1 (negative prediction, S245) |
| 91 | BAO | structure | Omega_m=63/200 [CONJECTURE] |
| 95 | Dark energy / CC | dark_sector | Omega_Lambda=137/200 [RED FLAG] |
| 97 | Primary CMB | cmb_detailed | n_s, l_2, N_eff, Omega_m/Lambda |

**alpha = 1/(n_d^2 + n_c^2)** (primary constraint in 9 entries):

| # | Process | File | How alpha enters |
|---|---------|------|------------------|
| 12 | Positronium annihilation | em_decays | tau(p-Ps) ~ alpha^{-5}, tau(o-Ps) ~ alpha^{-6} (S243) |
| 16 | Compton scattering | em_scattering | sigma_T = (8pi/3)(alpha/m_e)^2 (S243) |
| 20 | Thomson/Rayleigh | em_scattering | alpha^2 and alpha^4 vertex counting (S243) |
| 47 | Hydrogen atom | atomic_structure | Coulomb coupling |
| 48 | Helium atom | atomic_structure | Z*alpha = 2/137 coupling (S243) |
| 49 | Positronium | atomic_structure | Only coupling (purest test) |
| 63 | H recombination | recombination | Recombination coefficient, B_H |
| 65 | Saha equation | recombination | B_H = alpha^2*m_e/2 |
| 73 | Type Ia SN | stellar | M_Ch via m_p/m_e + alpha Coulomb correction (S243) |

**n_s = 193/200 [DERIVED]** (primary constraint in 1 entry, S243):

| # | Process | File | How n_s enters |
|---|---------|------|----------------|
| 90 | Jeans collapse | structure | Initial P(k) ~ k^{n_s-1} = k^{-7/200} (S243) |

**n_c = 11 (crystal dimension)** (primary constraint in 2 entries):

| # | Process | File | How n_c enters |
|---|---------|------|----------------|
| 80 | Merger/ringdown | grav_waves | No-echo: tilt mass ~ M_Pl/sqrt(n_c), R ~ 0 (S243) |
| 88 | Reheating | inflation | g_* = 106.75 from N_c=3, N_nu=3 DOF count (S243) |

**N_c = Im_H = 3 (additional entries, S243)**:

| # | Process | File | How N_c enters |
|---|---------|------|----------------|
| 46 | Exotic quarkonia | quarkonia | Which color singlets (tetraquark, pentaquark) exist (S243) |

**n_d = 4 → EFE → GR predictions** (primary constraint in 5 entries, S247):

| # | Process | File | How n_d enters |
|---|---------|------|----------------|
| 29 | Gravitational lensing | grav_scattering | n_d=4 → EFE via Lovelock → Schwarzschild → deflection 4GM/(c²b) |
| 30 | Perihelion precession | grav_scattering | n_d=4 → EFE → Schwarzschild → apsidal advance 6πGM/(ac²(1-e²)) |
| 31 | Shapiro time delay | grav_scattering | n_d=4 → EFE → Schwarzschild → γ_PPN = 1 |
| 32 | Frame dragging | grav_scattering | n_d=4 → EFE → Kerr → Lense-Thirring Ω_LT = 2GJ/(c²r³) |
| 79 | Binary inspiral | grav_waves | n_d=4 → EFE → linearized GR → quadrupole radiation |

**Other quantities** (4 entries):

| # | Process | File | Quantity |
|---|---------|------|----------|
| 82 | Stochastic GW background | grav_waves | r = 7/128 blind prediction [IN TENSION] (re-tagged S242) |
| 92 | DM halo formation | structure | m_DM=m_e*n_c^2/n_d [DISCREPANCY] |
| 94 | DM interactions | dark_sector | m_DM formula [DISCREPANCY] |

**Notes on CONSTRAINED entries**:
- 2 entries need verification scripts: Bhabha (#17) and Moller (#18) scattering (scripts planned S242)
- 2 entries have known discrepancies: DM mass (#92, #94) gives 15.5 MeV not 5.11 GeV (EQ-013, investigated S242)
- 1 entry has numerology red flag: Omega_Lambda=137/200 (#95)
- 1 entry in active tension: r=7/128 (#82) vs BICEP/Keck r<0.036

---

## STANDARD-RELABELED (41 entries, 41.4%)

Processes where the framework adds only organizational language (channel classification, chain identification) without predictive content.

### By subdirectory:

**Decays** (9 entries): #1-4, #9, #11, #13-15
- Neutron/muon/pion/kaon decays, top decays, radiative baryons, all nuclear decays
- #8 (Higgs) moved to CONSTRAINED (S242: kappa_V prediction)
- #12 (Positronium annihilation) moved to CONSTRAINED (S243: alpha^5, alpha^6 rates)
- CKM gap blocks upgrading kaon/nuclear entries

**Scattering** (3 entries): #17-18, #25, #27
- Bhabha/Moller (QED parts), nu CC/inverse beta
- #16 (Compton) moved to CONSTRAINED (S243: sigma_T ~ alpha^2)
- #20 (Thomson/Rayleigh) moved to CONSTRAINED (S243: alpha^2, alpha^4)
- #29-32 (all gravitational) moved to CONSTRAINED (S247: n_d=4 → EFE via Lovelock)

**Bound States** (8 entries): #34, #36, #39-42, #45, #50
- Kaon/Delta formation, all nuclear binding, glueball, Lamb shift
- #46 (Exotic quarkonia) moved to CONSTRAINED (S243: N_c=3 color algebra)
- #48 (Helium atom) moved to CONSTRAINED (S243: alpha via Z*alpha)
- Nuclear magic numbers (#42): division algebra dims coincide but [SPECULATION]

**Phase Transitions** (6 entries): #53, #60, #64, #66, #68-69
- Chiral restoration, deuterium BBN, reionization, Sakharov/leptogenesis/eta
- #62 Li-7 moved to CONSTRAINED (S244/S250: CCF=1/3 from CNH)
- #51, #52, #54 moved to CONSTRAINED (S245: QCD phase N_c=3 calculations)
- #67 moved to CONSTRAINED (S245: EW baryogenesis xi=4/121 negative prediction)

**Astrophysical** (11 entries): #70-72, #75, #77-78, #81, #83-86
- Most stellar (except core-collapse SN, Type Ia SN), NS/mergers/magnetars, continuous GWs, all high-energy
- #73 (Type Ia SN) moved to CONSTRAINED (S243: M_Ch via m_p/m_e)
- #79 (Binary inspiral) moved to CONSTRAINED (S247: n_d=4 → EFE → quadrupole)
- #80 (Merger/ringdown) moved to CONSTRAINED (S243: no-echo from n_c=11)
- #82 (Stochastic GW) moved to CONSTRAINED (S242: r=7/128 blind prediction)

**Cosmological** (4 entries): #93, #96, #98-99
- Galaxy formation, voids, secondary CMB, spectral distortions
- #88 (Reheating) moved to CONSTRAINED (S243: g_* from N_c=3, N_nu=3)
- #90 (Jeans collapse) moved to CONSTRAINED (S243: n_s=193/200 initial P(k))

---

## Dual-Tagged / Ambiguous Entries (0 remaining)

All previously ambiguous entries have been resolved.

**Resolved S245**:
- #67 EW baryogenesis → CONSTRAINED (xi=4/121 gives v_c/T_c ~ 0.14, honest negative prediction)

**Resolved S242**:
- #8 Higgs → CONSTRAINED (κ_V = √(117/121) is genuine prediction)
- #17 Bhabha → primary R, noted C at Z-pole (in sub-catalog)
- #18 Moller → primary R, noted C for parity violation (in sub-catalog)
- #24 Jet production → primary C in sub-catalog (was already C in SUMMARY)
- #82 Stochastic GW → CONSTRAINED (r=7/128 blind prediction)

---

## Cross-Reference: Entries by Verification Script

| Script | Entries | Tests |
|--------|---------|-------|
| r_ratio_crystallization.py | #10,16,21-24 | 15/15 |
| z_branching_crystallization.py | #6,19 | 18/20 |
| z_boson_couplings_crystallization.py | #26,28 | 12/12 |
| w_branching_crystallization.py | #7 | — |
| weak_decay_mode_counting.py | #1-3,5,14,25,27 | — |
| hadron_mass_crystallization.py | #33-46 | 16/16 |
| alpha_enhanced_prediction.py | #47-50 | — |
| phase_transition_crystallization.py | #59,61,63,65 | 16/16 |
| qcd_phase_crystallization.py | #51-52,54 | 19/19 |
| ew_baryogenesis_crystallization.py | #67 | 20/20 |
| ewsb_higgs_from_goldstones.py | #55 | — |
| ewsb_coupling_deviations.py | #56-58 | — |
| weinberg_angle_investigation.py | #57 | — |
| fermion_embedding_spinorial.py | #58 | 19/19 |
| cosmological_crystallization.py | #87,89-92,94-95,97 | 16/16 |
| grav_scattering_crystallization.py | #29-32,79 | 21/21 |
| astrophysical_crystallization.py | #70,73-77,82-83,85 | 12/12 |
| bh_information_paradox_resolution.py | #76 | 10/10 |
| casimir_completeness_audit.py | #80 | 23/23 |
| ewsb_predictions.py | #8 | — |
| pdg_data_master.py | #9 | — |
| lithium7_crystallization.py | #62 | 8/8 |
| **No script** | #4,11-13,15,17-18,53,60,64,66,68-69,71-72,78,81,84,86,93,96,98-99 | — |

**Entries without scripts**: 22 total. Of these, 20 are STANDARD-RELABELED (appropriate). **2 are CONSTRAINED without scripts**: Bhabha (#17) and Moller (#18).

---

## CNH Classification (Crystallization Norm Hypothesis) — S250

**[CONJECTURE]** Classification of D/C entries by whether their primary framework
quantities are Gaussian norms (crystallizable) vs non-norms (non-crystallizable).
See `cnh_catalog_reassessment.py` (20/20 PASS) for full analysis.

### NORM entries (11 — gravity, vacuum structure, inflation)

Entries whose primary framework quantities are Gaussian norms (n = a² + b²).

| # | Process | Primary Quantity | Norm Status |
|---|---------|------------------|-------------|
| 8 | H -> XX | xi = 4/121 | 4 (norm) / 121 (norm) |
| 29 | Gravitational lensing | n_d = 4 | 4 = 0² + 2² |
| 30 | Perihelion precession | n_d = 4 | 4 = 0² + 2² |
| 31 | Shapiro time delay | n_d = 4 | 4 = 0² + 2² |
| 32 | Frame dragging | n_d = 4 | 4 = 0² + 2² |
| 67 | EW baryogenesis | xi = 4/121 | norm/norm |
| 76 | Black hole formation | n_d = 4 | norm |
| 79 | Binary inspiral | n_d = 4 | norm |
| 89 | Primordial perturbations | n_s = 193/200 | 193 (norm) / 200 (norm) |
| 90 | Jeans collapse | n_s = 193/200 | norm/norm |
| 95 | Dark energy / CC | Omega_L = 137/200 | 137 (norm) / 200 (norm) |

**Pattern**: NORM entries cluster in gravity (n_d = 4 → EFE) and vacuum/cosmological
structure (xi, n_s, Omega_Lambda). Physically: gravitational/geometric sector = crystallizable.

### NON-NORM entries (16 — color physics, neutrino counting, matter content)

Entries whose primary framework quantities are inert primes in Z[i] (p ≡ 3 mod 4).

| # | Process | Primary Quantity | Non-Norm Prime |
|---|---------|------------------|----------------|
| 5 | Tau decay | N_c = 3 | 3 (inert) |
| 7 | W -> ff' | N_c = 3 | 3 (inert) |
| 10 | pi0 -> gamma gamma | N_c = 3 | 3 (inert) |
| 21 | R-ratio | N_c = 3, b_0 = 7 | 3, 7 (both inert) |
| 22 | DIS | N_c = 3, b_0 = 7 | 3, 7 (both inert) |
| 33 | Pion formation | N_c = 3 | 3 (inert) |
| 46 | Exotic quarkonia | N_c = 3 | 3 (inert) |
| 51 | Confinement crossover | N_c = 3 | 3 (inert) |
| 52 | QGP formation | N_c = 3 | 3 (inert) |
| 54 | Color superconductivity | N_c = 3 | 3 (inert) |
| 59 | Neutron freeze-out | N_nu = 3 | 3 (inert) |
| 61 | He-4 synthesis | N_nu = 3 | 3 (inert) |
| 74 | Core-collapse SN | N_nu = 3 | 3 (inert) |
| 80 | Merger/ringdown | n_c = 11 | 11 (inert) |
| 88 | Reheating | N_c = 3, N_nu = 3 | 3 (inert) |
| 91 | BAO | Omega_m = 63/200 | 63 has 7¹ (inert at odd power) |

**Pattern**: NON-NORM entries cluster in QCD (N_c = Im_H = 3) and cosmological matter
(Omega_m). Physically: color charge = non-crystallizable (confinement); matter = non-crystalline fraction.

### BRIDGE entries (29 — electroweak, EM coupling, interfacial physics)

Entries using quantities that mix norm and non-norm structure.

| Bridge Quantity | Type | Entries |
|-----------------|------|---------|
| alpha = 1/137 | Bridge prime (4² + 11²) | #12, #16, #20, #47-49, #63, #65, #73 |
| sin²θ_W = 28/121 | NON/NORM (28 = 4×7) | #6, #19, #23, #26, #28, #56-58 |
| C_F = 4/3 | NORM/NON | #24, #37, #38, #43, #44 |
| EWSB (n_d + n_c) | NORM + NON | #55 |
| m_p/m_e | Complex formula | #35, #73 |
| Various composites | Mixed | #82, #87, #92, #94, #97 |

**Pattern**: BRIDGE entries span EM, EW, and cosmological interfaces.
Physically: these describe processes at the boundary between crystallizable
and non-crystallizable sectors (electroweak mixing, EM coupling, dark matter).

### Key CNH Insight: Gravity/Color Duality

| Sector | Framework Quantity | Gaussian Norm? | CNH Status | Physical Character |
|--------|-------------------|----------------|------------|-------------------|
| Gravity | n_d = 4 = dim(H) | YES (norm) | Crystallizable | Geometric, long-range |
| Color | N_c = 3 = Im(H) | NO (inert) | Non-crystallizable | Confined, short-range |
| EM/EW | alpha, sin²θ_W | Mixed (bridge) | Interface | Mediates both sectors |

This is the strongest CNH correlation in the catalog: gravity and color map onto
norm and non-norm respectively, with no overlap. The two sectors of H (the quaternions)
— dim(H) = 4 and Im(H) = 3 — govern the two fundamental non-abelian interactions
with opposite crystallization properties.

### EWSB as Norm-Crystallization

Entry #55 (EWSB) uniquely illustrates CNH dynamics:
- Input: n_c = 11 (non-norm, inert prime)
- Output: xi = 4/121 = n_d/n_c² (norm/norm, since 121 = 11² is a norm)
- The SQUARING of n_c crystallizes it: non-norm 11 → norm 121.
- EWSB is the process by which the non-crystallizable crystal dimension
  becomes crystallizable through the Higgs mechanism.

### Assessment

**Organizational insight**: YES — the norm/non-norm classification captures
genuine physical structure (gravity=norm, color=non-norm, EW=bridge).

**Predictive power**: NO — the classification does not predict which entries
exist or their specific properties. It re-describes known physics in CNH language.

**Contradictions found**: 0 — but absence of contradiction in a post-hoc
classification scheme is weak evidence.

**Upgrade from CNH**: 1 entry (#62 Li-7 → C, per S244/S100 CCF derivation).
