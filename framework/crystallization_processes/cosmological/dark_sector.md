# Dark Sector Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 234)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C1: Cosmic Crystallization, C7: Cosmological Phase Transitions, C17: Structure Formation)
**Layer**: Mixed (Layer 2 correspondence + Layer 3 predictions)

---

## Disclaimer

This sub-catalog contains the framework's **most ambitious and most problematic** cosmological claims. The dark energy (Lambda) sign was resolved in S230 (F-10 was a convention error — V<0 gives Lambda>0), but the magnitude gap of ~10^111 remains and is essentially the standard cosmological constant problem. The DM mass formula has a numerical discrepancy (formula gives 15.5 MeV, not the claimed 5.11 GeV). Omega_Lambda = 137/200 is [CONJECTURE] with a triple-formula RED FLAG. Void structure is [STANDARD-RELABELED]. This is the domain where the framework's gaps are most visible.

---

## Processes

### Dark Matter Interactions (Competing Mass Predictions)

**Chain**: C7(freeze-out at T ~ m_DM/20) -> C17(R-channel scaffolding for structure)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Thermal DM in equilibrium -> freeze-out at T ~ m_DM/20 -> relic DM abundance Omega_c h^2 ~ 0.12 -> gravitational scaffolding for structure formation
- Tilt: DM is R-channel-only matter. It decouples from C/H/O channels at freeze-out, retaining only gravitational (R-channel) interaction. The framework conjectures a specific DM mass from division algebra quantities.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Possible freeze-out channel (weak-scale DM) | Production: annihilation to SM |
| C (EM) | Absent post-freeze-out | — |
| O (Strong) | Absent for WIMP-like DM | — |
| R (Gravity) | Only interaction post-freeze-out | Universal coupling |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| DM mass (Formula A) | m_p * 49/9 = 5.108 GeV [CONJECTURE] | Unknown | — | dark_matter_mass_derivation.md |
| DM mass (Formula C) | m_e * (n_c-1)^4 = 5.110 GeV [CONJECTURE] | Unknown | — | generation_structure.md |
| DM mass (Formula B) | m_e * n_c^2/n_d = 15.5 MeV [CONJECTURE] | Unknown | — | Alternative; 330x smaller than A/C |
| Omega_c h^2 | Not derived [GAP] | 0.1200 +/- 0.0012 | — | Planck 2018 |
| sigma_SI (DM-nucleon) | Not derived [GAP] | < 10^-47 cm^2 (10 GeV) | — | LZ 2022 |

**What framework adds**: The framework has **three competing DM mass formulas** (see `dm_mass_discrepancy.py`, 10/10 PASS):
- **Formula A**: m_DM = m_p * 49/9 = 5.108 GeV (from hidden_vectors/(n_c - C) ratio, `dark_matter_mass_derivation.md`)
- **Formula C**: m_DM = m_e * (n_c-1)^4 = 5.110 GeV (from generation mixing suppression, `generation_structure.md`)
- **Formula B**: m_DM = m_e * n_c^2/n_d = 15.5 MeV (crystallization stress formula; this sub-catalog's original formula)

Formulas A and C agree to 0.03% but use different input masses (m_p vs m_e). Their near-agreement is likely coincidental (relies on m_p/m_e ~ 1836). Formula B gives a factor ~330 smaller result and is incompatible with A/C. The original "5.11 GeV" claim in investigation files comes from A and C. **None of these are experimentally confirmed.** The 5.1 GeV prediction (A/C) is testable at SuperCDMS/LZ. The 15.5 MeV prediction (B) falls in the light DM regime, below current WIMP direct detection thresholds. Beyond the mass conjecture, the framework classifies DM as R-channel-only crystallization (no EM, weak, or strong channels post-freeze-out).
**Discrepancy status**: UNRESOLVED. Three competing formulas, no principled selection criterion.

**Open Questions**:
- Which DM mass formula (if any) is correct? Formula A/C (5.1 GeV) vs Formula B (15.5 MeV)
- Can the relic abundance Omega_c h^2 be derived from the mass and interaction?
- What is the production mechanism? (WIMP freeze-out, asymmetric, freeze-in?)
- Direct detection cross-section prediction? (EQ-013)

**What is imported**: Freeze-out calculation [A-IMPORT], relic abundance [A-IMPORT], direct detection bounds [A-IMPORT]
**Verification**: `cosmological_crystallization.py` (test 8: DM mass Formula B), `dm_mass_discrepancy.py` (10/10 PASS: all three formulas)
**Confidence**: [FRAMEWORK-CONSTRAINED] for R-channel classification; [CONJECTURE] for DM mass (three competing formulas, unresolved)

---

### Dark Energy (Cosmological Constant from Crystallization)

**Chain**: C1(vacuum energy from crystallization potential) -> C3(ongoing: Lambda drives late-time acceleration)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Post-recombination universe -> matter domination -> dark energy domination (z ~ 0.3) -> accelerating expansion
- Tilt: The residual crystallization potential V(epsilon*) at the current ground state epsilon* contributes to the effective cosmological constant. V(epsilon*) < 0 in the hilltop potential, and Lambda = -8*pi*G*V gives Lambda > 0 (S230 resolution). The magnitude of Lambda, however, requires knowing V_0 absolutely, which is NOT derived.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Inactive at cosmological scales | — |
| C (EM) | Inactive | — |
| O (Strong) | Inactive | — |
| R (Gravity) | Lambda enters Einstein equations as effective R-channel source | Drives acceleration: a(t) ~ exp(Ht) |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Omega_Lambda | 137/200 = 0.685 [CONJECTURE] | 0.6847 +/- 0.0073 | 0.04 sigma | Planck 2018 |
| Lambda sign | V<0 -> Lambda>0 [D: S230] | Lambda > 0 | Correct | S230 resolution |
| Lambda magnitude | ~10^111 too large [GAP] | rho_Lambda ~ 10^-47 GeV^4 | ~10^111 | **Standard CC problem** |
| w (equation of state) | -1 (assumed) | -1.03 +/- 0.03 | ~1 sigma | Planck 2018 |
| w_0 (DESI) | -1 (assumed) | -0.55 (+0.39/-0.21) | 1-2 sigma | DESI 2024 |

**What framework adds**:
1. **Lambda sign (RESOLVED S230)**: F-10 was a convention error. The correct GR sign relation is Lambda = -8*pi*G*V. With V(epsilon*) < 0 from the crystallization potential, Lambda > 0. This resolves the "wrong sign" falsification.
2. **Omega_Lambda = 137/200** [CONJECTURE]: The dark energy fraction matches Planck to 0.04 sigma. However, this is a triple-formula RED FLAG — 137 = alpha_inv appears in the numerator, which raises numerology concerns. No mechanism derives this value from the potential.
3. **Magnitude gap (~10^111)**: The natural scale of V(epsilon*) from the crystallization potential is ~ M_Pl^4, which exceeds the observed rho_Lambda by ~10^111. This is the standard cosmological constant problem. The framework does NOT solve it. This is the primary cosmological gap.

**Falsification History**:
- ~~F-10: CC wrong sign~~ -> **RESOLVED S230**: Convention error. V<0 gives Lambda>0 via standard GR sign convention (Lambda = -8piGV). This was not a physics failure but an analysis error in how the sign was evaluated.
- Magnitude gap (~10^111) REMAINS as an open problem (standard CC problem, not unique to this framework)

**What is imported**: Einstein equations [A-IMPORT], CC problem [A-IMPORT], w = -1 assumed [A-IMPORT], V_0 magnitude [GAP]
**Verification**: `cosmological_crystallization.py` (tests 5, 7, 9: Omega_Lambda, Lambda sign, Omega_m)
**Confidence**: [FRAMEWORK-CONSTRAINED] for Lambda sign; [CONJECTURE] for Omega_Lambda = 137/200 (RED FLAG); [GAP] for Lambda magnitude

**Note on DESI 2024**: DESI hints at w != -1 (dynamical DE with w_0 = -0.55, w_a = -1.32). The framework assumes w = -1 and has no mechanism for time-varying dark energy. If confirmed at >3 sigma, this would be a tension point.

---

### Void Structure (Cosmic Web)

**Chain**: C17(R-channel: underdense regions expand) -> C1-like(local de-crystallization in voids)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Slightly underdense primordial regions -> expand faster than background -> evacuated voids (R ~ 10-50 Mpc) filling ~60% of universe volume -> cosmic web of filaments, walls, nodes, voids
- Tilt: Voids are regions of weakened R-channel crystallization. Matter flows out of voids into filaments and nodes where R-channel tilt is stronger. The void interior approaches a more uniform (less crystallized) state — a local partial reversal of C1.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Inactive at void scales | — |
| C (EM) | Minimal: few galaxies in voids | — |
| O (Strong) | Inactive | — |
| R (Gravity) | Dominant: differential expansion creates voids | Anti-clustering |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Void size distribution | Not derived [A-IMPORT] | R ~ 10-50 Mpc (typical) | — | Galaxy surveys |
| Void fraction | Not derived [A-IMPORT] | ~60% by volume | — | SDSS/BOSS |
| ISW from voids | Not derived [A-IMPORT] | Detected (low significance) | — | Planck + surveys |

**What framework adds**: Classification only. Voids are interpreted as regions where R-channel crystallization is partially reversed — matter evacuates, leaving a more uniform (less structured) region. This is the opposite of C17 clustering and conceptually related to the C5 (de-crystallization) limit. However, the framework makes no quantitative void predictions.
**What is imported**: All void dynamics [A-IMPORT], linear perturbation theory for underdensities [A-IMPORT], ISW effect [A-IMPORT]
**Verification**: No dedicated tests (standard cosmology)
**Confidence**: [STANDARD-RELABELED] — interpretive classification only

---

*Created: 2026-02-03 (S234 — Phase 6: cosmological processes)*
*Verification: `verification/sympy/cosmological_crystallization.py` (16/16 PASS)*
