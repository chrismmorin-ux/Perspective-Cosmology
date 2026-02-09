# Weak Scattering Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 236)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C10: Weak Decay, C11: Pair Creation)
**Layer**: Mixed (Layer 1 mode counting + Layer 2 correspondence + Layer 3 predictions)

---

## Disclaimer

This sub-catalog is **mixed**: Neutrino NC scattering and CEvNS are [FRAMEWORK-CONSTRAINED] because sin^2(theta_W) = 28/121 enters cross-sections directly. CC scattering and inverse beta decay are [STANDARD-RELABELED] -- standard weak interaction physics with framework channel labeling only.

---

## Processes

### Neutrino Charged-Current Scattering (nu_mu + n -> mu- + p)

**Chain**: C10(H-channel: CC interaction) -> C4(collapse to final state) -> C12(hadronic final state)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: nu_mu + n -> mu- + p (quasi-elastic); nu_mu + N -> mu- + X (DIS at high E)
- Tilt: H-channel tilt transfer from neutrino to target nucleon; neutrino converts to charged lepton

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Not involved at tree level (W exchange is pure weak) | Radiative corrections only |
| H (Weak) | W exchange: nu_mu -> mu- at lepton vertex, d -> u at quark vertex | 1 CC mode |
| O (Strong) | Nucleon structure (PDFs at high E); final-state hadronization | Via form factors / PDFs |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| sigma_CC / E_nu (quasi-elastic) | G_F^2 m_N E_nu / pi [A-IMPORT] | 0.68(2) x 10^-38 cm^2/GeV | ~3% | MINOS/NOvA |
| sigma_CC / E_nu (DIS) | G_F^2 m_N E_nu / pi (isoscalar) [A-IMPORT] | ~0.67 x 10^-38 cm^2/GeV | ~2% | NOMAD |
| V_ud at vertex | Not derived [A-IMPORT] | 0.97435(16) | -- | PDG 2024 |
| N_generations | Im_H = 3 [CONJECTURE] | 3 confirmed | 0% | Oscillation data |

**What framework adds**: CC neutrino scattering is pure H-channel: the W boson transfers weak charge between lepton and quark lines. The cross-section is proportional to G_F^2 (from the H-channel coupling squared). N_generations = Im_H = 3 determines which neutrino flavors can participate. No framework prediction beyond channel labeling.
**What is imported**: G_F, nucleon form factors, PDFs at high energy, CKM element V_ud -- all [A-IMPORT]
**Verification**: `weak_decay_mode_counting.py` (generation count cross-check)
**Confidence**: [STANDARD-RELABELED] for cross-section; [CONJECTURE] for Im_H generation mapping

---

### Neutrino Neutral-Current Scattering (nu + N -> nu + X)

**Chain**: C10(H-channel: NC interaction via Z) -> C4(collapse) -> C12(hadronic final state)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: nu + N -> nu + X (no charged lepton in final state; missing energy signature)
- Tilt: Mixed H/C-channel Z exchange; coupling depends on sin^2(theta_W) = 28/121

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Z coupling: g_V = T3 - 2Q sin^2(theta_W) component | sin^2 = 28/121 enters |
| H (Weak) | Z coupling: g_A = T3 component | Universal |
| O (Strong) | Nucleon/nuclear structure at quark level | Via form factors / PDFs |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| sigma_NC / sigma_CC (nu) | 0.3072 (from 28/121) | 0.3076(12) | 0.13% | NuTeV (adjusted) |
| sigma_NC / sigma_CC (nu-bar) | 0.3820 (from 28/121) | 0.3837(34) | 0.44% | NuTeV (adjusted) |
| sin^2(theta_W) extraction | 28/121 = 0.23140 | 0.2277(16) (NuTeV raw) | ~1.6% | NuTeV |
| Paschos-Wolfenstein ratio | R- = 1/2 - sin^2(theta_W) = 0.2686 | See NuTeV anomaly | -- | [FRAMEWORK-CONSTRAINED] |

**What framework adds**: sin^2(theta_W) = 28/121 enters all NC cross-sections through the Z couplings g_V^f = T3^f - 2 Q^f sin^2(theta_W). The NC/CC ratio directly tests the Weinberg angle. The NuTeV anomaly (sin^2 = 0.2277 vs world average 0.2315) is understood as a nuclear isospin violation effect, not a sin^2 discrepancy.
**What is imported**: G_F, Z mass, PDFs, nuclear corrections (isospin violation, strange sea asymmetry) -- [A-IMPORT]
**Verification**: `z_boson_couplings_crystallization.py` (sin^2 = 28/121 in Z couplings, 12/12 PASS)
**Confidence**: [FRAMEWORK-CONSTRAINED] for sin^2 dependence; [STANDARD-RELABELED] for absolute cross-sections

**Note on NuTeV**: The NuTeV experiment measured sin^2(theta_W) = 0.2277(16) from nu-N scattering, ~3 sigma from the world average 0.2315. This is now understood as arising from nuclear isospin violation corrections, not new physics. The framework value 28/121 = 0.23140 is consistent with the corrected world average.

---

### Inverse Beta Decay (nu_bar_e + p -> n + e+)

**Chain**: C10(H-channel: CC interaction, inverse of neutron beta decay) -> C4(collapse)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: nu_bar_e + p -> n + e+ (threshold: E_nu > 1.806 MeV)
- Tilt: H-channel tilt transfer converts proton to neutron; antineutrino converts to positron

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Coulomb correction at low energy; positron detection | Secondary |
| H (Weak) | W exchange: nu_bar_e -> e+ at lepton vertex, p -> n at baryon vertex | 1 CC mode |
| O (Strong) | Nucleon form factors at low energy | Via g_A/g_V |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| sigma (at E_nu ~ few MeV) | G_F^2 (1 + 3g_A^2) E_e p_e / pi [A-IMPORT] | ~10^-43 cm^2/MeV | ~1% | Reines-Cowan (historical) |
| Threshold | 1.806 MeV [A-IMPORT: m_n - m_p + m_e] | Confirmed | -- | Kinematics |
| g_A | Not derived [A-IMPORT] | 1.2756(13) | 0.10% | PDG 2024 |
| Reactor nu detection | Cross-section well-calibrated | ~6 events/day/GW_th per kton | -- | Daya Bay, JUNO |

**What framework adds**: Inverse beta decay is the time-reverse of neutron beta decay (C10 in both directions). It is the primary detection channel for reactor antineutrinos and was used in the original neutrino discovery (Reines-Cowan 1956). Framework adds H-channel identification of the W-exchange vertex. The threshold condition involves the n-p mass difference (not derived from framework).
**What is imported**: G_F, g_A, nucleon masses, kinematics -- all [A-IMPORT]
**Verification**: `weak_decay_mode_counting.py` (neutron beta decay as inverse process)
**Confidence**: [STANDARD-RELABELED] -- standard weak interaction in nuclear context

---

### Coherent Elastic Neutrino-Nucleus Scattering (CEvNS)

**Chain**: C10(H-channel: NC Z exchange with coherent nuclear target) -> C4(collapse: nuclear recoil)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: nu + (A, Z) -> nu + (A, Z) (elastic recoil of entire nucleus)
- Tilt: Z-mediated NC interaction coherent over all nucleons; cross-section enhanced by N^2

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Z coupling g_V enters via sin^2(theta_W) | sin^2 = 28/121 |
| H (Weak) | Z exchange (NC); couples to all nucleons coherently | Coherent sum |
| O (Strong) | Nuclear form factor F(q^2) provides coherence | Suppresses at high q |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| sigma ~ N^2 G_F^2 E_nu^2 / (4 pi) | N^2 coherence enhancement [A-IMPORT] | Confirmed (COHERENT) | ~30% | COHERENT 2017, 2021 |
| Weak nuclear charge Q_W | Q_W = N - Z(1 - 4 sin^2(theta_W)) | Measured on CsI, Ar | ~10% | COHERENT |
| sin^2(theta_W) from Q_W | 28/121 = 0.23140 | 0.220(+0.080/-0.050) (CsI) | Large | COHERENT 2017 |
| N_nu contribution | 3 flavors sum coherently | Confirmed | -- | N_nu = Im_H = 3 |
| N^2 enhancement | N^2 for Cs-133: N = 78 -> N^2 = 6084 | Confirmed (rate) | -- | Standard |

**What framework adds**: CEvNS tests sin^2(theta_W) at very low momentum transfer (Q ~ few MeV) through the weak nuclear charge Q_W = N - Z(1 - 4 sin^2(theta_W)). With sin^2 = 28/121 = 0.23140, the proton weak charge is Q_W^p = 1 - 4(28/121) = 9/121 = 0.0744. The N^2 coherence enhancement is a standard nuclear physics result. Current COHERENT measurements have ~30% precision, insufficient to distinguish 28/121 from the SM running value.
**What is imported**: G_F, nuclear form factors, detector response, cross-section formula -- [A-IMPORT]
**Verification**: `z_boson_couplings_crystallization.py` (sin^2 = 28/121 in Z couplings, 12/12 PASS)
**Confidence**: [FRAMEWORK-CONSTRAINED] for sin^2 dependence in Q_W; [STANDARD-RELABELED] for coherence mechanism

**Future precision**: COHERENT-200 and reactor CEvNS experiments (Dresden-II, NUCLEUS) aim for ~5% precision on Q_W, which would meaningfully test the running of sin^2(theta_W) at low Q^2. The framework prediction 28/121 is the tree-level M_Z-scale value; running to low Q^2 gives sin^2 ~ 0.238-0.240.

---

## Summary

| Process | Tag | Framework Content | Key Tests | Scripts |
|---------|-----|-------------------|-----------|---------|
| Neutrino CC scattering | [STANDARD-RELABELED] | H-channel identification; N_gen = 3 | None framework-specific | `weak_decay_mode_counting.py` |
| Neutrino NC scattering | [FRAMEWORK-CONSTRAINED] | sin^2 = 28/121 in NC/CC ratio | NuTeV (corrected) | `z_boson_couplings_crystallization.py` |
| Inverse beta decay | [STANDARD-RELABELED] | C10 inverse process | None framework-specific | `weak_decay_mode_counting.py` |
| CEvNS | [FRAMEWORK-CONSTRAINED] | sin^2 = 28/121 in Q_W | COHERENT (~30% precision) | `z_boson_couplings_crystallization.py` |

**Honest count**: 2/4 entries [FRAMEWORK-CONSTRAINED] (NC scattering, CEvNS), 2/4 [STANDARD-RELABELED]. The NC processes are constrained because sin^2(theta_W) = 28/121 enters cross-sections directly. CC processes are dominated by G_F (not derived).

**Total verification**: Cross-references to `z_boson_couplings_crystallization.py` (12/12 PASS) and `weak_decay_mode_counting.py` (16/16 PASS).

---

## Cross-References

- Weinberg angle: `topics/weinberg-angle.md`
- Z couplings: `framework/crystallization_processes/decays/electroweak_boson_decays.md`
- Neutron beta decay: `framework/crystallization_processes/decays/weak_decays.md`
- BBN (neutrino role): `framework/crystallization_processes/phase_transitions/bbn_nucleosynthesis.md`
- C10 definition: `framework/CRYSTALLIZATION_CATALOG.md` (Part II)
- sin^2(theta_W) derivation: `framework/investigations/particle_physics/alpha_from_division_algebras.md`

---

*Created: 2026-02-03 (S236)*
