# Recombination and Reionization Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 239)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C7: Cosmological Phase Transitions)
**Layer**: Mixed (Layer 2 correspondence + Layer 3 limited predictions)

---

## Disclaimer

This sub-catalog is **majority [STANDARD-RELABELED]**. Recombination and reionization are standard cosmological processes governed by atomic physics (alpha), radiation thermodynamics, and astrophysical source populations. The framework's contributions are: alpha = 1/137 enters the recombination rate coefficient and Saha equation, and N_nu = Im_H = 3 enters the radiation energy density that controls the expansion rate. These are consistency checks with standard values, not novel predictions. Reionization is entirely [A-IMPORT] — the framework has no predictions for UV source populations or the ionization history.

---

## Processes

### Hydrogen Recombination (z_rec ~ 1090)

**Chain**: C7(cosmic cooling to T ~ 0.3 eV) -> C13(C: electron-proton Coulomb capture) -> C8(Lyman-alpha photon emission) -> C9(neutral H frozen in)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Ionized hydrogen plasma (T >> 0.3 eV, free electrons and protons) -> Neutral hydrogen atoms (T < 0.3 eV). Last scattering surface at z_rec ~ 1089.80(21) defines the CMB.
- Tilt: C-channel recombination — electrons are captured into hydrogen atoms via the Coulomb potential (-alpha/r). Recombination does NOT proceed through direct-to-ground-state capture (each Lyman-continuum photon immediately re-ionizes another atom). Instead, it proceeds through excited states (Case B recombination), with Lyman-alpha photons redshifting out of resonance. The process is governed by the Peebles three-level atom model or modern multi-level codes (RECFAST, HyRec, CosmoRec).

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Primary: Coulomb capture + Lyman-alpha escape | alpha in recombination coefficient |
| H (Weak) | Negligible (neutron-proton ratio already frozen) | -- |
| O (Strong) | Negligible (free protons, not nuclei) | -- |
| R (Gravity) | Hubble expansion redshifts Lyman-alpha photons | H(z) sets recombination timing |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| z_rec (last scattering) | ~1090 [standard, alpha-dependent] | 1089.80(21) | 0.02% | Planck 2018 |
| T_rec | ~0.26 eV [alpha^2 * m_e / (2 * 25)] | ~0.26 eV | -- | Standard |
| x_e(z_rec) (ionization fraction) | ~0.1 [standard] | ~0.1 | -- | RECFAST |
| Delta z (thickness of LSS) | ~80 [standard] | ~80 | -- | Planck 2018 |
| Optical depth to LSS | ~1 by definition | ~1 | -- | Definition |
| alpha_B (Case B coeff, T=3000K) | ~2.6 x 10^-13 cm^3/s [alpha-dependent] | ~2.6 x 10^-13 | ~5% | Standard atomic physics |

**Alpha-dependence of recombination**:
```
Recombination rate: alpha_B ~ alpha^3 * T^{-1/2} / m_e
Binding energy: E_1 = alpha^2 * m_e / 2 = 13.6 eV
Saha temperature: T_rec ~ E_1 / ln(n_b/n_gamma) ~ alpha^2 * m_e / 50
Redshift: z_rec ~ T_rec / T_0 ~ alpha^2 * m_e / (50 * T_0)
```
The recombination redshift scales as alpha^2. A 1% change in alpha shifts z_rec by ~2%. The framework's alpha = 1/137 vs measured 1/137.036 would shift z_rec by ~0.05%, smaller than the measurement error.

**What framework adds**: Alpha = 1/(n_d^2 + n_c^2) = 1/137 enters the recombination coefficient, the hydrogen binding energy, and the Saha equation. N_nu = Im_H = 3 enters the Hubble rate H(z) through the radiation density, which controls the competition between recombination rate and expansion rate. Both are consistency checks with SM values.
**What is imported**: Peebles/RECFAST recombination theory [A-IMPORT], m_e [A-IMPORT], baryon density [A-IMPORT from CMB], T_CMB = 2.7255 K [A-IMPORT]
**Verification**: `phase_transition_crystallization.py` (N_nu = 3 in radiation density)
**Confidence**: [FRAMEWORK-CONSTRAINED] via alpha and N_nu; [STANDARD-RELABELED] for recombination dynamics

---

### Cosmic Dawn and Reionization (z ~ 6-20)

**Chain**: C17(structure formation: first stars/galaxies) -> C8(C: UV photon emission) -> C7(reionization: H II regions grow and overlap)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Dark ages (neutral H, T << T_CMB at z ~ 1000-20) -> First luminous objects form (z ~ 20-30) -> UV radiation reionizes intergalactic hydrogen -> Universe fully ionized by z ~ 6.
- Tilt: Reionization is driven by C-channel (UV) photons from the first stars and galaxies. As structure formation (C17) creates luminous sources, their UV radiation creates expanding H II regions that eventually overlap, completing reionization. The 21-cm signal from neutral hydrogen probes the reionization epoch.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | UV photon production + photoionization | Lyman continuum (E > 13.6 eV) |
| H (Weak) | Nuclear reactions in first stars (pp chain, CNO) | Powers UV sources |
| O (Strong) | Nuclear fusion in first stars | Powers UV sources |
| R (Gravity) | Structure formation; Jeans mass determines first objects | DM halo collapse |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| z_reion (midpoint) | Not derived | 7.7(7) | ~10% | Planck 2018 (tau_reion) |
| tau_reion (optical depth) | Not derived | 0.054(7) | ~13% | Planck 2018 |
| Duration (Delta_z) | Not derived | > 2.8 (95% CL) | -- | Planck 2018 |
| End of reionization | Not derived | z ~ 5.5-6 (Gunn-Peterson trough) | -- | Fan et al. 2006 |
| 21-cm signal | Not derived | Upper limits from HERA/MWA | -- | HERA Collaboration |

**The 21-cm cosmology frontier**: The hyperfine 21-cm transition of neutral hydrogen (1420 MHz rest frame) will probe the dark ages (z ~ 30-200), cosmic dawn (z ~ 15-30), and reionization (z ~ 6-15) through absorption/emission against the CMB. Experiments: HERA, SKA, EDGES, SARAS. The framework has no predictions for the 21-cm signal — it depends on the UV source population, X-ray heating, and Wouthuysen-Field coupling, all [A-IMPORT].

**What framework adds**: Nothing quantitative. Chain classification (C17 -> C8 -> C7) organizes the multi-channel sequence but provides no predictions for reionization timing, UV escape fractions, or 21-cm signals. The first star properties depend on molecular hydrogen cooling, halo masses, and metallicity — all [A-IMPORT].
**What is imported**: Structure formation theory [A-IMPORT], stellar physics [A-IMPORT], UV photon production rates [A-IMPORT], photoionization cross-sections [A-IMPORT], all observations [A-IMPORT]
**Verification**: None (no framework predictions)
**Confidence**: [STANDARD-RELABELED] throughout

---

### Saha Equation (Ionization Equilibrium)

**Chain**: C3(thermal equilibrium) -> C13(C: Coulomb binding vs thermal ionization) -> C9(equilibrium ionization fraction)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Thermal equilibrium between ionization (H -> p + e) and recombination (p + e -> H + gamma). The Saha equation determines the equilibrium ionization fraction x_e as a function of temperature, density, and the hydrogen binding energy.
- Tilt: Balance between C-channel ionization (photon energy exceeds 13.6 eV) and C-channel recombination (Coulomb capture). The Saha equation is the statistical mechanics of this balance.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Ionization + recombination (alpha-dependent) | B_H = alpha^2 m_e / 2 |
| H (Weak) | Not relevant | -- |
| O (Strong) | Not relevant | -- |
| R (Gravity) | Sets expansion rate (dilution) | H(z) |

**The Saha equation**:
```
x_e^2 / (1 - x_e) = (1/n_b) * (m_e T / (2 pi))^{3/2} * exp(-B_H / T)
```
where B_H = alpha^2 m_e / 2 = 13.6 eV is the hydrogen binding energy. The equilibrium ionization fraction depends exponentially on B_H/T ~ alpha^2 m_e / T. Alpha enters through the binding energy.

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| B_H (binding energy) | alpha^2 m_e / 2 = 13.606 eV [D: alpha] | 13.606 eV | exact | Atomic physics |
| T_{x_e=0.5} | ~B_H / 40 ~ 0.34 eV [standard Saha] | ~0.34 eV (z ~ 1450) | -- | Standard |
| T_{x_e=0.01} | ~B_H / 52 ~ 0.26 eV [standard Saha] | ~0.26 eV (z ~ 1100) | -- | Standard |
| Saha departure (z < 1000) | Freeze-out from equilibrium | RECFAST | -- | Standard |

**Limitations of Saha**: The Saha equation assumes thermal equilibrium, which breaks down during recombination (z < 1200) because the recombination rate drops below the expansion rate. Non-equilibrium corrections (Peebles three-level model) are essential for accurate predictions. The Saha equation overestimates x_e at late times (predicts recombination too slowly).

**What framework adds**: B_H = alpha^2 m_e / 2 uses alpha = 1/(n_d^2 + n_c^2) = 1/137 [DERIVATION]. The exponential sensitivity to B_H/T means the Saha equation is indirectly sensitive to alpha^2. A change in alpha would shift the recombination epoch. No other framework quantities enter the Saha equation.
**What is imported**: Statistical mechanics [I-MATH], m_e [A-IMPORT], baryon density n_b [A-IMPORT], T_CMB [A-IMPORT]
**Verification**: `phase_transition_crystallization.py` (alpha in binding energy test)
**Confidence**: [FRAMEWORK-CONSTRAINED] via alpha in B_H; [STANDARD-RELABELED] for Saha dynamics

---

## Summary

| Process | Tag | Framework Content | Gap |
|---------|-----|-------------------|-----|
| Hydrogen recombination | [FRAMEWORK-CONSTRAINED] | alpha in recombination rate + B_H; N_nu in H(z) | Recombination dynamics imported |
| Cosmic dawn / reionization | [STANDARD-RELABELED] | Chain classification only | No UV source predictions |
| Saha equation | [FRAMEWORK-CONSTRAINED] | alpha^2 m_e / 2 in binding energy | Statistical mechanics imported |

**Overall**: 2/3 [FRAMEWORK-CONSTRAINED], 1/3 [STANDARD-RELABELED]. The framework's recombination content is limited to two structural inputs: alpha (in the hydrogen binding energy and recombination coefficient) and N_nu = 3 (in the radiation density governing expansion). Both are consistency checks with SM values. Reionization is entirely astrophysics-dependent with no framework predictions.

---

## Cross-References

- CMB physics: `topics/cmb-physics.md`
- CMB detailed: `cosmological/cmb_detailed.md`
- Alpha derivation: `verification/sympy/alpha_enhanced_prediction.py`
- BBN (earlier thermal history): `phase_transitions/bbn_nucleosynthesis.md`
- Structure formation: `cosmological/structure_formation.md`
- Main catalog: C7 (cosmological phases), C8 (photon emission), C17 (structure formation)
- Data: `data/planck_cosmology.md`

---

*Created: 2026-02-03 (S239)*
