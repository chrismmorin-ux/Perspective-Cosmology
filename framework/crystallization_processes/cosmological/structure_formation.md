# Structure Formation Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 234)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C17: Structure Formation, C7: Cosmological Phase Transitions, C1: Cosmic Crystallization)
**Layer**: Mixed (Layer 2 correspondence + Layer 3 predictions)

---

## Disclaimer

This sub-catalog is **predominantly [STANDARD-RELABELED]**. Structure formation is governed by gravitational instability, which the framework describes in crystallization language but does not quantitatively predict beyond standard GR. Framework content enters through: (1) n_s = 193/200 as the initial power spectrum tilt from C1, (2) the conjectured DM mass of ~5 GeV (formula discrepancy: m_e * n_c^2/n_d gives 15.5 MeV, not 5.11 GeV), and (3) BAO scale r_s which uses standard cosmological integrals with Omega_m/Omega_b values that are [CONJECTURE].

---

## Processes

### Gravitational Instability (Jeans Collapse)

**Chain**: C17(R-channel: gravitational potential wells deepen) -> C5(eventual BH formation at extreme densities)
**Tag**: [FRAMEWORK-CONSTRAINED] (upgraded S243: n_s = 193/200 [DERIVED] enters as initial P(k))

**Before -> After**:
- Physical: Nearly uniform matter distribution with small density perturbations delta ~ 10^-5 -> non-linear structures (halos, filaments, voids) via gravitational amplification
- Tilt: R-channel forward crystallization. Gravity amplifies density fluctuations seeded by C1. In tilt language: regions with slightly deeper R-channel tilt attract more matter, deepening further. The Jeans mass M_J sets the minimum mass for gravitational collapse against pressure.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Inactive post-recombination | — |
| C (EM) | Radiation pressure opposes collapse (before decoupling) | Photon pressure |
| O (Strong) | Inactive at cosmological scales | — |
| R (Gravity) | Dominant: drives collapse via Jeans instability | delta(k) ~ D(a) * delta_i(k) |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| n_s (initial spectrum tilt) | 193/200 = 0.965 [D: from C1] | 0.9649 +/- 0.0042 | 0.024 sigma | Planck 2018 |
| sigma_8 | Not derived [GAP] | 0.8111 +/- 0.0060 | — | Planck 2018 |
| Linear growth D(a) | Not derived [A-IMPORT] | Standard GR | — | GR |
| Jeans mass M_J | Not derived [A-IMPORT] | Standard formula | — | Cosmology |

**What framework adds**: The initial perturbation spectrum tilt n_s = 193/200 from C1 enters as the initial condition for structure formation: P(k) ~ k^{n_s-1} = k^{-7/200}. Since n_s is [FRAMEWORK-DERIVED] (from the hilltop potential with mu^2 = 1536/7, zero free parameters), the initial power spectrum is framework-constrained. Beyond this, the framework provides R-channel classification but no quantitative predictions for sigma_8, growth rates, or the Jeans mass.
**What is imported**: Linear perturbation theory [A-IMPORT], Jeans instability analysis [A-IMPORT], all structure formation dynamics [A-IMPORT]
**Verification**: `cosmological_crystallization.py` (test 2: n_s), `near_miss_batch_upgrades.py` (tests 6-8: n_s as initial condition)
**Confidence**: [FRAMEWORK-CONSTRAINED] via n_s = 193/200 [DERIVED]; [STANDARD-RELABELED] for dynamics

---

### Baryon Acoustic Oscillations (BAO)

**Chain**: C7(acoustic oscillations in baryon-photon fluid) -> C17(frozen sound waves in matter distribution)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Pre-recombination acoustic oscillations in baryon-photon plasma -> frozen at decoupling (z ~ 1090) -> imprinted as BAO scale r_s ~ 144.4 Mpc in galaxy correlation function
- Tilt: C-channel (photon pressure) vs R-channel (gravity) oscillation in coupled baryon-photon system. At recombination, C-channel decouples (photon last scattering), freezing the sound wave pattern. The BAO scale r_s is set by the sound horizon at drag epoch.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Sets N_eff = 3 -> contributes to radiation density | Neutrino background |
| C (EM) | Photon pressure drives acoustic oscillations | Photon-baryon coupling |
| O (Strong) | Inactive at BAO scales | — |
| R (Gravity) | Opposes photon pressure; drives compression | Gravitational potential wells |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| r_s (sound horizon) | ~144.4 Mpc [FRAMEWORK-CONSTRAINED] | 144.43 +/- 0.26 Mpc | 0.1 sigma | Planck 2018 |
| Omega_m | 63/200 = 0.315 [CONJECTURE] | 0.3153 +/- 0.0073 | 0.04 sigma | Planck 2018 |
| Omega_b h^2 | Not derived [A-IMPORT] | 0.02237 +/- 0.00015 | — | Planck 2018 |
| N_eff | Im_H = 3 [D] | 2.99 +/- 0.17 | 0.06 sigma | Planck 2018 |

**What framework adds**: The BAO scale r_s is computed using standard cosmological integrals, but with framework-motivated parameter values Omega_m = 63/200 [CONJECTURE] and N_eff = 3 [D]. The r_s result (~144.4 Mpc, 0.03% from Planck) uses standard physics with these inputs. NOTE: Earlier r_s derivation using framework-specific factors was demoted (S205) after the factors were found to be falsified (F-8, F-9). The current r_s agreement comes from standard integrals.
**What is imported**: Sound speed formula [A-IMPORT], cosmological integral [A-IMPORT], Omega_b h^2 [A-IMPORT], H_0 [A-IMPORT]
**Verification**: `cosmological_crystallization.py` (test 12: r_s comparison)
**Confidence**: [FRAMEWORK-CONSTRAINED] for N_eff input; [CONJECTURE] for Omega_m; r_s agreement is via standard integral (caveated)

---

### Dark Matter Halo Formation

**Chain**: C17(R-channel: DM gravitational collapse) -> C13-like(DM self-interaction?) -> C17(baryon infall)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Linear DM density perturbations -> non-linear collapse -> virialized DM halos following NFW-like profiles -> baryonic matter falls into DM potential wells
- Tilt: DM provides R-channel scaffolding. Because DM decouples from C-channel (no EM interaction), it collapses earlier than baryons, creating gravitational templates for structure. In crystallization language: DM undergoes R-channel-only crystallization (no C/H/O channels).

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | DM production in early universe (freeze-out) | Possible weak-scale interaction |
| C (EM) | Absent: DM is dark | — |
| O (Strong) | Absent: DM is color-neutral | — |
| R (Gravity) | Dominant: DM interacts only gravitationally | R-channel only |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| DM mass (Formula A) | m_p * 49/9 = 5.108 GeV [CONJECTURE] | Unknown | — | dark_matter_mass_derivation.md |
| DM mass (Formula C) | m_e * (n_c-1)^4 = 5.110 GeV [CONJECTURE] | Unknown | — | generation_structure.md |
| DM mass (Formula B) | m_e * n_c^2/n_d = 15.5 MeV [CONJECTURE] | Unknown | — | Alternative formula; 330x smaller than A/C |
| Omega_c h^2 | Not derived [A-IMPORT] | 0.1200 +/- 0.0012 | — | Planck 2018 |
| DM-nucleon cross-section | Not derived [GAP] | < 10^-46 cm^2 (WIMP) | — | LZ/XENON |

**What framework adds**: The framework has **three competing DM mass formulas** (see `dm_mass_discrepancy.py`):
- **Formula A**: m_DM = m_p * 49/9 = 5.108 GeV (from hidden_vectors/(n_c - C) ratio, dark_matter_mass_derivation.md)
- **Formula C**: m_DM = m_e * (n_c-1)^4 = 5.110 GeV (from generation mixing suppression, generation_structure.md)
- **Formula B**: m_DM = m_e * n_c^2/n_d = 15.5 MeV (from crystallization stress, this sub-catalog's original formula)

Formulas A and C agree to 0.03% (likely coincidental: relies on m_p/m_e ~ 1836). Formula B gives a completely different result (factor ~330 smaller). The "5.11 GeV" claim in the investigation files comes from A and C; the earlier reference to Formula B in this entry was the source of the discrepancy. **None of these values are experimentally confirmed.** At 15.5 MeV (Formula B), the DM candidate falls in the light DM regime -- experimentally unconstrained by current direct detection (below WIMP sensitivity). At 5.1 GeV (Formulas A/C), the candidate is testable at SuperCDMS/LZ (EQ-013). Beyond the mass conjecture, the framework classifies DM as R-channel-only matter (no C/H/O interactions).
**Discrepancy status**: UNRESOLVED. The framework has not determined which formula (if any) is correct.
**What is imported**: NFW profile [A-IMPORT], halo mass function [A-IMPORT], DM relic abundance calculation [A-IMPORT], direct detection bounds [A-IMPORT]
**Verification**: `cosmological_crystallization.py` (test 8: DM mass Formula B), `dm_mass_discrepancy.py` (10/10 PASS: all three formulas)
**Confidence**: [FRAMEWORK-CONSTRAINED] for R-channel classification; [CONJECTURE] for DM mass (three competing formulas, unresolved); [GAP] for DM interactions (EQ-013)

---

### Galaxy Formation

**Chain**: C17(R: gravitational collapse) -> C13(O: star formation via nuclear binding) -> C8(C: stellar emission) -> C15(R: eventual merger GWs)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: DM halos + baryonic gas -> gas cooling -> disk formation -> star formation -> galaxy morphology (spirals, ellipticals, irregulars)
- Tilt: Multi-channel crystallization. R-channel collapse draws in baryonic gas. C-channel cooling (radiative emission) allows gas to condense further. O-channel binding (nuclear fusion in stars) converts gravitational energy to radiation. The galaxy is a sustained crystallization complex operating across all four channels.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | SN feedback (neutrino-driven winds); stellar nucleosynthesis | N_nu = 3 species in SN cooling |
| C (EM) | Gas cooling (radiative), stellar emission, AGN feedback | Broad spectrum radiation |
| O (Strong) | Nuclear fusion in stars; enrichment of ISM | pp chain, CNO (see stellar_processes.md) |
| R (Gravity) | Drives initial collapse; maintains virial equilibrium | Halo potential |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Galaxy stellar mass function | Not derived [A-IMPORT] | Observed | — | Surveys |
| Star formation rate density | Not derived [A-IMPORT] | Observed (peaks z ~ 2) | — | Madau & Dickinson 2014 |
| Tully-Fisher / Faber-Jackson | Not derived [A-IMPORT] | Observed | — | Galaxy dynamics |

**What framework adds**: Chain classification only. Galaxy formation involves all four crystallization channels operating simultaneously, making it one of the richest multi-type processes. However, the framework provides no quantitative predictions for any galaxy observable. All galaxy properties (mass function, morphology, scaling relations) are [A-IMPORT].
**What is imported**: Gas cooling physics [A-IMPORT], star formation prescriptions [A-IMPORT], AGN feedback models [A-IMPORT], galaxy dynamics [A-IMPORT]
**Verification**: No dedicated tests (standard astrophysics)
**Confidence**: [STANDARD-RELABELED] — framework provides classification but no galaxy predictions

---

*Created: 2026-02-03 (S234 — Phase 6: cosmological processes)*
*Verification: `verification/sympy/cosmological_crystallization.py` (16/16 PASS)*
