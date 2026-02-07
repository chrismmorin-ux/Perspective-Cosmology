# Crystallization Process Sub-Catalogs

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 221)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md`

---

## Purpose

This directory maps **individual physical processes** as chains through the crystallization type system (C1-C17). The main catalog defines the types; these sub-catalogs show how specific phenomena decompose into type sequences.

## Honesty Protocol

Every process entry carries one of three tags:

| Tag | Meaning | Criteria |
|-----|---------|----------|
| **[FRAMEWORK-DERIVED]** | Framework predicts/constrains something non-trivial | Uses n_d, n_c, division algebra dims to get a number |
| **[FRAMEWORK-CONSTRAINED]** | Framework structures the calculation | Channel decomposition, mode counting apply but result is standard |
| **[STANDARD-RELABELED]** | Standard physics in crystallization language | Framework adds interpretation but no predictive content |

**If >50% of entries in a sub-catalog are [STANDARD-RELABELED], a disclaimer is included.**

This is a speculative framework. Most process mappings are [STANDARD-RELABELED] or [FRAMEWORK-CONSTRAINED]. Genuine [FRAMEWORK-DERIVED] entries are the minority. We document this honestly.

## Index Files

| File | Content |
|------|---------|
| `SUMMARY.md` | Master table: all 99 entries, one row each, with tag/quantities/script |
| `TAG_INDEX.md` | Entries grouped by tag (DERIVED/CONSTRAINED/RELABELED) with cross-refs |

## Directory Structure

```
crystallization_processes/
    README.md                    <- This file
    SUMMARY.md                   <- Master entry table (S241)
    TAG_INDEX.md                 <- Tag-grouped index (S241)
    PROCESS_TEMPLATE.md          <- Standardized entry format
    decays/
        weak_decays.md           <- Beta, muon, tau, pion, kaon decays
        electroweak_boson_decays.md <- W/Z/Higgs/top decays
        electromagnetic_decays.md   <- pi0->gg, radiative, positronium
        nuclear_decays.md        <- Alpha, beta, gamma nuclear
    scattering/
        electromagnetic_scattering.md <- Compton, Bhabha, Moller, pair
        strong_scattering.md     <- DIS, Drell-Yan, jets, e+e- hadrons
        weak_scattering.md       <- Neutrino CC/NC, inverse beta
        gravitational_scattering.md <- Lensing, precession, Shapiro
    bound_states/
        hadron_formation.md      <- Mesons, baryons, exotics
        quarkonia_and_glueballs.md <- J/psi, Upsilon, glueball spectrum
        atomic_structure.md      <- Hydrogen, helium, positronium
        nuclear_binding.md       <- Binding energies, magic numbers
    phase_transitions/
        qcd_phase_diagram.md     <- Confinement, QGP, T_c
        ewsb_detailed.md         <- Full EWSB process
        bbn_nucleosynthesis.md   <- Primordial element formation
        recombination_and_reionization.md <- z_rec, cosmic dawn
        baryogenesis.md          <- Matter-antimatter asymmetry
    astrophysical/
        stellar_processes.md     <- pp chain, CNO, He flash, collapse
        compact_objects.md       <- NS, BH mergers, magnetars
        gravitational_waves.md   <- Binary inspiral, ringdown
        high_energy_astrophysics.md <- AGN jets, cosmic rays, GRBs
    cosmological/
        inflation_detailed.md    <- Slow roll, reheating, preheating
        structure_formation.md   <- Power spectrum, BAO, halos
        dark_sector.md           <- DM interactions, DE, voids
        cmb_detailed.md          <- Full Cl spectrum, lensing, ISW
    data/
        pdg_particles.md         <- PDG 2024 masses, lifetimes, BRs
        pdg_couplings.md         <- Coupling constants, mixing params
        planck_cosmology.md      <- Planck 2018 + DESI 2024 params
        lattice_qcd.md           <- Lattice: T_c, sigma, glueball
        nuclear_data.md          <- Binding energies from NNDC
        gravitational_wave_data.md <- LIGO/Virgo/KAGRA catalog
```

## Entry Format

See `PROCESS_TEMPLATE.md` for the standardized format. Key elements:
- Chain notation (e.g., C10 -> C4 -> C8)
- Honesty tag ([FRAMEWORK-DERIVED] / [FRAMEWORK-CONSTRAINED] / [STANDARD-RELABELED])
- Channel decomposition table
- Key data comparison (framework vs measured with sources)
- Explicit "what framework adds" vs "what is imported"
- Verification script reference

## Relationship to Main Catalog

| Document | Content |
|----------|---------|
| `CRYSTALLIZATION_CATALOG.md` | Type definitions (C1-C17), foundations, indices |
| This directory | Process instances — specific physics mapped through types |

The main catalog answers: "What ARE the crystallization types?"
This directory answers: "How does process X decompose into crystallization steps?"

## Current Status

| Subdirectory | Files | Entries | Phase |
|-------------|-------|---------|-------|
| data/ | 6 | -- | Phase 0 (infrastructure) |
| decays/ | 4 | 15 | Phases 1 + 7 (weak, EW boson, EM, nuclear decays) |
| scattering/ | 4 | 17 | Phases 2 + 7 (EM, strong, weak, gravitational scattering) |
| bound_states/ | 4 | 18 | Phases 3 + 7 (hadron formation, nuclear binding, quarkonia/glueballs, atomic structure) |
| phase_transitions/ | 5 | 19 | Phases 4 + 7 (QCD, EWSB, BBN, recombination/reionization, baryogenesis) |
| astrophysical/ | 4 | 17 | Phases 5 + 7 (stellar, compact objects, GWs, high-energy astrophysics) |
| cosmological/ | 4 | 13 | Phase 6 (complete: inflation, structure, dark sector, CMB) |

---

**Tag distribution** (S241 meta-analysis): 3 FRAMEWORK-DERIVED (3.0%), 34 FRAMEWORK-CONSTRAINED (34.3%), 62 STANDARD-RELABELED (62.6%). See `SUMMARY.md` for full breakdown.

*Updated: 2026-02-03 (S241 — Phase 8 meta-analysis: SUMMARY.md + TAG_INDEX.md created. 99 entries audited, 12 inconsistencies flagged, investigation priorities compiled.)*
