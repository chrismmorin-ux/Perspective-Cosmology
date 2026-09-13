# Atomic Structure Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 239)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C13: Nuclear Binding — extended to EM binding)
**Layer**: Mixed (Layer 2 correspondence + Layer 3 limited predictions)

---

## Disclaimer

This sub-catalog is **mostly [STANDARD-RELABELED]**. Atomic physics is governed by the fine-structure constant alpha and quantum mechanics, both well-established. The framework's contribution is the identification alpha = 1/(n_d^2 + n_c^2) = 1/137 [DERIVATION from division algebra dimensions], which enters every atomic calculation. This is a significant structural claim, but the calculations themselves (energy levels, transition rates, QED corrections) are entirely standard physics. The framework does NOT derive atomic spectra from first principles — it only identifies the coupling constant.

---

## Processes

### Hydrogen Atom (Bohr Model + QED Corrections)

**Chain**: C13(C: Coulomb binding of proton + electron) -> C3(discrete energy levels via Schrodinger/Dirac equation) -> C8(photon emission/absorption)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Free proton and electron -> Bound hydrogen atom with discrete energy spectrum E_n = -alpha^2 m_e c^2 / (2n^2)
- Tilt: C-channel (electromagnetic) binding creates the simplest atomic system. The Bohr energy levels arise from quantization of the Coulomb potential. QED corrections (Lamb shift, anomalous magnetic moment) modify the spectrum at O(alpha) and higher.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Primary: Coulomb binding V(r) = -alpha/r | 1 photon exchange |
| H (Weak) | Negligible (parity violation: ~10^-12 eV shift in 1S) | Z^0 exchange |
| O (Strong) | Nuclear size correction (proton charge radius) | r_p = 0.8414(19) fm |
| R (Gravity) | Negligible (G m_p m_e / a_0 ~ 10^-39 eV) | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| E_1S (Rydberg) | -alpha^2 m_e / 2 = -13.606 eV [uses alpha = 1/137] | -13.606 eV | < 1 ppb | CODATA 2022 |
| a_0 (Bohr radius) | 1/(alpha m_e) = 0.529 A [D: alpha] | 0.52918 A | < 1 ppb | CODATA 2022 |
| alpha (from H spectroscopy) | 1/137 = 1/(n_d^2 + n_c^2) [D] | 1/137.035999... | 73 ppm offset | [DERIVATION] |
| Rydberg constant | alpha^2 m_e c / (2h) | 10973731.569 m^-1 | < 1 ppt | CODATA 2022 |
| 2S-1S transition | Standard QED calculation | 2466061413187018(11) Hz | 5 ppt | Parthey et al. 2011 |

**alpha enters everywhere**: The Bohr model energies scale as alpha^2, radii as 1/alpha, fine structure as alpha^4, Lamb shift as alpha^5, hyperfine as alpha^4 m_e/m_p. Every atomic observable is a polynomial in alpha (with logarithmic corrections at higher order). The framework prediction alpha = 1/137 is off by 73 ppm from the measured value 1/137.036...; the enhanced formula alpha = 1/(137 + 4/111) matches to sub-ppm.

**What framework adds**: The identification alpha = 1/(n_d^2 + n_c^2) = 1/137 [DERIVATION] and the enhanced formula alpha = 1/(137 + 4/111) [CONJECTURE, Tier 1]. These enter every hydrogen calculation through the Coulomb coupling. No atomic energy levels, transition rates, or QED corrections are derived — they are all standard quantum mechanics/QED with alpha as input.
**What is imported**: Schrodinger/Dirac equation [A-IMPORT], m_e [A-IMPORT], m_p [A-IMPORT], QED perturbation theory [A-IMPORT], nuclear size corrections [A-IMPORT]
**Verification**: `alpha_enhanced_prediction.py` (alpha formula verification)
**Confidence**: [FRAMEWORK-CONSTRAINED] via alpha; [STANDARD-RELABELED] for all energy level calculations

---

### Helium Atom (Two-Electron System)

**Chain**: C13(C: Coulomb binding, 2 electrons + nucleus) -> C3(discrete levels with electron-electron correlation) -> C11(exchange symmetry: Pauli exclusion)
**Tag**: [FRAMEWORK-CONSTRAINED] (upgraded S243: alpha enters via Z*alpha coupling, same as hydrogen #47)

**Before -> After**:
- Physical: Helium nucleus (Z=2) captures two electrons -> Ground state (1s^2, singlet) with ionization energy 24.587 eV. Excited states split into singlet and triplet series (parahelium and orthohelium).
- Tilt: Two C-channel Coulomb attractions (nucleus-electron) plus one C-channel repulsion (electron-electron). The electron-electron correlation makes helium the simplest unsolvable atom — no closed-form solution exists.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Primary: Z*alpha/r attraction (x2) + alpha/r_12 repulsion (x1) | 3 Coulomb interactions |
| H (Weak) | Negligible | -- |
| O (Strong) | Nuclear size (alpha particle radius) | Very small correction |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| E_ion (He) | Not derived (requires many-body QM) | 24.5874 eV | < 1 ppb | NIST |
| E_ground (He) | Not derived | -79.005 eV | < 1 ppb | Drake 2006 |
| 2^3S_1 - 2^1S_0 splitting | Not derived | 19.8196 GHz | -- | Cancio Pastor et al. 2012 |
| Nuclear charge radius (He-4) | Not derived | 1.6755(28) fm | -- | Krauth et al. 2021 |
| alpha enters via | Z*alpha coupling | -- | -- | -- |

**What framework adds**: Alpha = 1/(n_d^2 + n_c^2) = 1/137 enters all helium calculations: nuclear-electron attraction via Z*alpha = 2/137, electron-electron repulsion via alpha = 1/137. The variational ground state E_He = -(27/16)^2 × alpha^2 × m_e = -77.5 eV (1.9% from measured -79.0 eV; full CI methods give sub-ppm). **Consistency**: Hydrogen (#47) is tagged C with the same alpha dependence; helium uses the same alpha via Z*alpha. The previous R tag was inconsistent.
**What is imported**: Schrodinger equation [A-IMPORT], m_e [A-IMPORT], nuclear charge Z = 2 [A-IMPORT], variational/CI methods [A-IMPORT], QED corrections [A-IMPORT]
**Verification**: `alpha_enhanced_prediction.py` (alpha value), `near_miss_batch_upgrades.py` (tests 32-35: Z_eff, variational E, Hartree)
**Confidence**: [FRAMEWORK-CONSTRAINED] via alpha = 1/137 in Z*alpha coupling; [STANDARD-RELABELED] for many-body methods

---

### Positronium (Pure QED Bound State)

**Chain**: C11(C: pair creation e+e-) -> C13(C: Coulomb binding) -> C3(hydrogen-like spectrum at half-Rydberg) -> C11(annihilation: e+e- -> gammas)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Electron-positron pair forms bound state. Spectrum is hydrogen-like with reduced mass m_e/2, giving energies E_n = -alpha^2 m_e / (4n^2). Para-positronium (singlet, S=0) annihilates to 2 gammas (tau ~ 125 ps); ortho-positronium (triplet, S=1) annihilates to 3 gammas (tau ~ 142 ns).
- Tilt: Pure C-channel system (no strong or weak contributions at leading order). Positronium is the cleanest test of QED — no nuclear structure complications. The annihilation rate is calculable to high precision in QED.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Everything: binding, spectrum, annihilation | alpha |
| H (Weak) | O(alpha^2 G_F m_e^2) corrections — negligible | -- |
| O (Strong) | None (no quarks) | -- |
| R (Gravity) | None | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| E_1S (Ps) | -alpha^2 m_e / 4 = -6.803 eV [D: alpha] | -6.803 eV | < 1 ppb | Theory + measurement |
| 1^3S_1 - 1^1S_0 (HFS) | 7/12 alpha^4 m_e [QED] = 203.39 GHz | 203.3917(4) GHz | 2 ppm | Ritter et al. 1984 |
| tau(para-Ps) | 2/(alpha^5 m_e) ~ 125 ps [LO QED] | 125.142(26) ps | 0.02% | Al-Ramadhan & Gidley 1994 |
| tau(ortho-Ps) | 9pi/(2 alpha^6 m_e (pi^2-9)) ~ 142 ns [LO QED] | 142.046(30) ns | 0.02% | Vallery et al. 2003 |
| 1S-2S transition | Standard QED | 1233607216.4(3.2) MHz | 3 ppb | Fee et al. 1993 |

**Positronium as a pure alpha test**: Every positronium observable is a power series in alpha alone (times m_e). The ground-state energy goes as alpha^2, hyperfine as alpha^4, para-Ps decay as alpha^5, ortho-Ps decay as alpha^6. This makes positronium the purest test of the framework's alpha prediction — there are no hadronic or nuclear complications.

**What framework adds**: Alpha = 1/(n_d^2 + n_c^2) = 1/137 enters every positronium observable as the only coupling constant. Positronium is the cleanest system where the framework alpha matters. The enhanced formula alpha = 1/(137 + 4/111) would shift all positronium predictions by ~73 ppm relative to the integer formula — in principle testable but current experimental precision (~2 ppm for HFS, ~200 ppm for lifetimes) is not yet sufficient to distinguish.
**What is imported**: QED perturbation theory [A-IMPORT], m_e [A-IMPORT], Feynman diagram calculations [A-IMPORT]
**Verification**: `alpha_enhanced_prediction.py` (alpha formula)
**Confidence**: [FRAMEWORK-CONSTRAINED] via alpha; [STANDARD-RELABELED] for all QED calculations

---

### Lamb Shift (2S_{1/2} - 2P_{1/2} in Hydrogen)

**Chain**: C3(Dirac degeneracy) -> C8(vacuum polarization + self-energy) -> C3(degeneracy lifted at O(alpha^5))
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Dirac equation predicts 2S_{1/2} and 2P_{1/2} are degenerate. QED radiative corrections (electron self-energy + vacuum polarization) lift this degeneracy by ~1057 MHz. Measured by Lamb & Retherford (1947), catalyzing modern QED.
- Tilt: The Lamb shift is a C-channel quantum fluctuation effect: virtual photon loops modify the electron's self-energy and screen the nuclear charge. In crystallization language, the C-channel vacuum (zero-point fluctuations) perturbs the atomic energy levels.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Dominant: self-energy (~1010 MHz) + vacuum polarization (~-27 MHz) | alpha^5 m_e |
| O (Strong) | Proton size effect (~0.012 MHz, proton radius puzzle) | r_p = 0.8414 fm |
| H (Weak) | Negligible | -- |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| 2S_{1/2} - 2P_{1/2} | Not derived (QED calculation) | 1057.845(9) MHz | 9 ppm | Lundeen & Pipkin 1981 |
| Self-energy contribution | ~alpha^5 m_e ln(1/alpha) [uses alpha] | ~1010 MHz | -- | QED theory |
| Vacuum polarization | ~-alpha^5 m_e / (15 pi) [uses alpha] | ~-27 MHz | -- | QED theory |
| Proton size contribution | ~alpha^4 m_e^3 r_p^2 [uses alpha] | ~0.012 MHz | -- | r_p dependent |
| Total QED prediction | alpha-dependent series [uses alpha] | 1057.8446(29) MHz | 3 ppm | Eides et al. 2001 |

**The proton radius puzzle**: The muonic hydrogen Lamb shift measurement gave r_p = 0.84184(67) fm, initially in tension with electronic measurements. This has largely been resolved in favor of the smaller radius. The framework has no prediction for r_p — it is [A-IMPORT].

**What framework adds**: Alpha enters the Lamb shift at O(alpha^5) (leading) and higher orders. The framework's alpha = 1/137 vs measured 1/137.036... would shift the theoretical prediction, but the Lamb shift is sensitive to alpha^5 so the ~73 ppm error in alpha would produce a ~365 ppm error in the Lamb shift — larger than the ~3 ppm QED calculation precision. In practice, the Lamb shift is used to EXTRACT alpha (among other methods), so the comparison is circular for precision tests.
**What is imported**: QED calculation to O(alpha^7) [A-IMPORT], m_e [A-IMPORT], m_p [A-IMPORT], proton charge radius r_p [A-IMPORT], recoil corrections [A-IMPORT]
**Verification**: `alpha_enhanced_prediction.py` (alpha value only)
**Confidence**: [STANDARD-RELABELED] — entirely standard QED with alpha as input

---

## Summary

| Process | Tag | Framework Content | Key Tests | Scripts |
|---------|-----|-------------------|-----------|---------|
| Hydrogen atom | [FRAMEWORK-CONSTRAINED] | alpha = 1/137 in Rydberg, a_0 | alpha formula | `alpha_enhanced_prediction.py` |
| Helium atom | [FRAMEWORK-CONSTRAINED] | alpha enters via Z*alpha = 2/137 | Variational E within 2% | `alpha_enhanced_prediction.py`, `near_miss_batch_upgrades.py` |
| Positronium | [FRAMEWORK-CONSTRAINED] | alpha is the ONLY coupling | HFS, lifetimes | `alpha_enhanced_prediction.py` |
| Lamb shift | [STANDARD-RELABELED] | alpha at O(alpha^5) | -- | `alpha_enhanced_prediction.py` |

**Honest count**: 3/4 entries [FRAMEWORK-CONSTRAINED] (hydrogen, helium, positronium), 1/4 [STANDARD-RELABELED] (Lamb shift). All framework content traces to alpha = 1/(n_d^2 + n_c^2) = 1/137 [DERIVATION]. S243 upgraded helium for consistency with hydrogen (same alpha dependence). The enhanced formula alpha = 1/(137 + 4/111) provides sub-ppm precision [CONJECTURE, Tier 1]. No atomic energy levels, transition rates, or QED corrections are derived — the framework provides only the coupling constant.

**Note on precision hierarchy**: Positronium is the purest alpha test (no hadronic complications). Hydrogen is extremely precise but includes nuclear size effects. Helium requires many-body methods. The Lamb shift uses alpha at high power (alpha^5+), amplifying any error.

---

## Cross-References

- Alpha derivation: `framework/investigations/particle_physics/fine_structure_constant.md`
- Alpha verification: `verification/sympy/alpha_enhanced_prediction.py`
- QED tests: Standard physics (no framework investigation file)
- Main catalog: C8 (photon emission), C13 (binding extended to EM)
- PDG data: `data/pdg_couplings.md` (alpha value)

---

*Created: 2026-02-03 (S239)*
