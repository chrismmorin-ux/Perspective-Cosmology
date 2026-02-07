# Nuclear Binding Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 227)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C13: Nuclear Binding)
**Layer**: Mixed (Layer 2 correspondence + Layer 3 predictions)

---

## Disclaimer

This sub-catalog is **almost entirely [STANDARD-RELABELED]**. The framework provides channel labels for nuclear forces (O-channel residual strong, C-channel Coulomb, H-channel weak/beta stability) but does NOT derive any binding energies, magic numbers, or nuclear structure from first principles. The coincidence of magic numbers 2, 8, 28 with division algebra dimensions is noted as [SPECULATION] — suggestive but currently without derivation. Nuclear physics is where the framework has the LEAST predictive content.

---

## Processes

### Deuteron (Simplest Nucleus)

**Chain**: C13(nucleon binding) via residual O-channel attraction
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: p + n -> d + gamma (2.224 MeV)
- Tilt: Two color-singlet nucleons form weakly bound state via residual O-channel interaction (pion/meson exchange)

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| O (Strong) | Residual nuclear force: pion exchange (dominant), rho/omega exchange | Range ~ 1/m_pi ~ 1.4 fm |
| H (Weak) | Not relevant for binding (relevant for deuteron photodisintegration threshold) | -- |
| C (EM) | Coulomb absent (n is neutral); magnetic moment interaction | Small |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| B(d) | Not derived | 2.2246 MeV | -- | AME 2020 |
| B/A | Not derived | 1.112 MeV | -- | AME 2020 |
| Spin-parity | Not derived | 1+ | -- | PDG |
| r_d (matter radius) | Not derived | 1.97535(85) fm | -- | CODATA 2022 |
| a_s (scattering length) | Not derived | -23.714(13) fm | -- | -- |
| Quadrupole moment | Not derived | 0.2860(15) fm^2 | -- | -- |

**What framework adds**: Channel identification only. The residual O-channel force between color-singlet nucleons arises from incomplete cancellation of the O-channel (strong) field — analogous to van der Waals forces between neutral atoms (incomplete cancellation of C-channel EM field). The deuteron is the nuclear analogue of the hydrogen molecule.
**What is imported**: Nuclear potential (one-pion exchange + short-range) [A-IMPORT], nucleon masses [A-IMPORT], tensor force structure [A-IMPORT]
**Verification**: `hadron_mass_crystallization.py` (binding energy comparison only)
**Confidence**: [STANDARD-RELABELED] — standard nuclear physics in crystallization language

**Framework gap**: The binding energy 2.225 MeV is ~0.1% of the nucleon mass. To derive this would require computing the residual O-channel interaction at the nucleon level — equivalent to solving nuclear physics from QCD, which is an unsolved problem even in standard physics (though lattice QCD has made progress).

---

### Helium-4 (Most Tightly Bound Light Nucleus)

**Chain**: C13(4-nucleon binding) via multi-body O-channel forces
**Tag**: [STANDARD-RELABELED] (with [SPECULATION] magic number note)

**Before -> After**:
- Physical: 2p + 2n -> 4He (alpha particle), binding energy 28.30 MeV
- Tilt: Four nucleons in maximally symmetric O-channel configuration; doubly magic (N=Z=2)

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| O (Strong) | Nuclear binding: 6 NN pairs, each with nuclear force | Dominant |
| C (EM) | Coulomb repulsion between 2 protons | -0.77 MeV (destabilizing) |
| H (Weak) | Sets N/Z ratio (here N=Z=2, maximally symmetric) | Stability |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| B(4He) | Not derived | 28.296 MeV | -- | AME 2020 |
| B/A | Not derived | 7.074 MeV | -- | AME 2020 |
| Magic N = Z = 2 | dim(C) = 2 [SPECULATION] | Confirmed closed shell | -- | -- |
| r_alpha (charge radius) | Not derived | 1.6755(28) fm | -- | CODATA |

**What framework adds**: Helium-4 is doubly magic with N = Z = 2. The number 2 = dim(C) is a division algebra dimension. Whether this magic number connection is physical or coincidental is unknown. The alpha particle's special stability (B/A = 7.074 MeV, far above neighbors) is well explained by nuclear shell model without framework input.
**What is imported**: Nuclear force [A-IMPORT], shell model [A-IMPORT], Coulomb interaction [A-IMPORT]
**Verification**: `hadron_mass_crystallization.py` (binding energy comparison)
**Confidence**: [STANDARD-RELABELED] for binding; [SPECULATION] for magic number connection

---

### Iron-56 (Binding Energy Peak)

**Chain**: C13(56-nucleon binding) at equilibrium of O-channel attraction vs C-channel repulsion
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: 26p + 30n -> 56Fe, maximum binding energy per nucleon
- Tilt: O-channel (nuclear) volume attraction balanced by C-channel (Coulomb) repulsion and O-channel surface tension; maximum stability at A ~ 56

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| O (Strong) | Volume term: a_V*A (saturation); Surface: -a_S*A^(2/3) | Dominant binding |
| C (EM) | Coulomb repulsion: -a_C*Z^2/A^(1/3) | Grows with Z^2 |
| H (Weak) | Asymmetry: -a_A*(N-Z)^2/A (beta stability) | N/Z equilibrium |
| R (Gravity) | Negligible for nuclear physics | (Relevant for neutron stars) |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| B(56Fe) | Not derived | 492.254 MeV | -- | AME 2020 |
| B/A | Not derived | 8.790 MeV | -- | AME 2020 |
| Peak location (A ~ 56) | Not derived | 62Ni is true max (8.795) | -- | AME 2020 |

**Bethe-Weizsacker channel decomposition**:
```
B(A,Z) = a_V*A - a_S*A^(2/3) - a_C*Z^2/A^(1/3) - a_A*(A-2Z)^2/A + delta
```
- a_V (volume): O-channel bulk attraction
- a_S (surface): O-channel boundary correction
- a_C (Coulomb): C-channel repulsion
- a_A (asymmetry): H-channel beta stability preference
- delta (pairing): O-channel spin pairing

**What framework adds**: Channel LABELING of the semi-empirical mass formula terms. Each term maps to a crystallization channel: a_V, a_S (O-channel bulk/surface), a_C (C-channel), a_A (H-channel). This is a relabeling, not a prediction — the coefficients a_V ≈ 15.75, a_S ≈ 17.8, a_C ≈ 0.711, a_A ≈ 23.7 MeV are all [A-IMPORT].
**What is imported**: All SEMF coefficients [A-IMPORT], nuclear shell corrections [A-IMPORT]
**Verification**: `hadron_mass_crystallization.py` (SEMF channel check)
**Confidence**: [STANDARD-RELABELED] — standard nuclear physics with channel labels

---

### Magic Numbers (Nuclear Shell Closures)

**Chain**: C13(shell structure) from O-channel central + spin-orbit potential
**Tag**: [STANDARD-RELABELED] (with [SPECULATION] for 2, 8, 28 connections)

**Before -> After**:
- Physical: Nuclei with Z or N = 2, 8, 20, 28, 50, 82, 126 have enhanced stability
- Tilt: Closed O-channel shells minimize tilt fluctuations at specific nucleon numbers

**The Magic Numbers**:

| Magic # | Shell Closure | Division Algebra Connection | Assessment |
|---------|-------------|---------------------------|------------|
| 2 | 1s_1/2 (2 states) | dim(C) = 2 | [SPECULATION] |
| 8 | + 1p (6 states) | dim(O) = 8 | [SPECULATION] |
| 20 | + 1d5/2, 2s1/2, 1d3/2 (12 states) | -- (no obvious connection) | -- |
| 28 | + 1f7/2 (8 states) | n_d x Im_O = 4 x 7 = 28 | [SPECULATION] |
| 50 | + ... (spin-orbit split) | -- | -- |
| 82 | + ... | -- | -- |
| 126 | + ... | -- | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| B/A enhancement at magic | Not derived | 0.5-2 MeV above trend | -- | AME 2020 |
| First excited state energy at magic | Not derived | Enhanced (1-4 MeV) | -- | ENSDF |
| 2+ state systematics | Not derived | E(2+) peaks at magic N/Z | -- | ENSDF |
| S_2n / S_2p discontinuities | Not derived | Sharp drops at magic #s | -- | AME 2020 |

**What framework adds**: Three of seven magic numbers (2, 8, 28) coincide with division algebra dimensions or products thereof. However:
1. Only 3/7 match — the pattern is incomplete
2. The shell model derives ALL magic numbers from spin-orbit splitting
3. No derivation connects division algebra dimensions to shell closures
4. The pattern could easily be numerological coincidence (small integers appear everywhere)
**What is imported**: Nuclear shell model [A-IMPORT], spin-orbit interaction [A-IMPORT], residual interactions [A-IMPORT]
**Verification**: `hadron_mass_crystallization.py` (magic number checks)
**Confidence**: [SPECULATION] for division algebra connection; [STANDARD-RELABELED] for shell physics

**Honest assessment**: The magic number coincidences (2 = dim C, 8 = dim O, 28 = n_d x Im_O) are the most speculative content in this catalog. Unlike N_c = 3 (which has a clear derivation chain from division algebras to gauge group to color), there is NO mechanism connecting division algebra dimensions to nuclear shell closures. The numbers 2, 8, and 28 appear throughout mathematics for many unrelated reasons. Without a derivation, this remains [SPECULATION] at best and [NUMEROLOGY] at worst.

---

## Summary

| Process | Tag | Framework Content | Key Tests | Scripts |
|---------|-----|-------------------|-----------|---------|
| Deuteron | [STANDARD-RELABELED] | Channel labeling only | B(d) comparison | `hadron_mass_crystallization.py` |
| Helium-4 | [STANDARD-RELABELED] | Magic # 2 = dim(C) [SPECULATION] | B/A comparison | `hadron_mass_crystallization.py` |
| Iron-56 | [STANDARD-RELABELED] | SEMF channel decomposition | SEMF terms | `hadron_mass_crystallization.py` |
| Magic numbers | [STANDARD-RELABELED] [SPECULATION] | 2, 8, 28 = div alg dims — **no derivation, likely numerological** | Coincidence check | `hadron_mass_crystallization.py` |

**Honest count**: 4/4 entries [STANDARD-RELABELED]. Nuclear binding is the weakest area of the framework. All content is channel relabeling or numerological speculation. No quantitative predictions exist.

**Total verification**: Tests in `hadron_mass_crystallization.py` covering binding energy comparisons, SEMF channel identification, and magic number coincidence checks.

---

## Cross-References

- Nuclear data: `framework/crystallization_processes/data/nuclear_data.md`
- Hadron formation: `framework/crystallization_processes/bound_states/hadron_formation.md`
- Nuclear decay: `framework/crystallization_processes/decays/` (planned)
- C13 type definition: `framework/CRYSTALLIZATION_CATALOG.md` (C13)
- C12 (hadronization, prerequisite): `framework/CRYSTALLIZATION_CATALOG.md` (C12)

---

*Created: 2026-02-03 (S227)*
