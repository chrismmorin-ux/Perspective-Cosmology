# Nuclear Decays Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 236)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C10: Weak Decay, C8: Photon Emission, C13: Nuclear Binding)
**Layer**: Mixed (Layer 2 correspondence + Layer 3 predictions)

---

## Disclaimer

This sub-catalog is **entirely [STANDARD-RELABELED]**. Nuclear decay processes are well-described by standard nuclear physics (shell model, liquid drop model, weak interaction theory). The framework adds crystallization chain classification and channel identification only. No framework-specific predictions exist for nuclear decay rates, Q-values, or selection rules. The honest added value is organizational: mapping nuclear processes into the C-type taxonomy.

---

## Processes

### Alpha Decay (Tunneling Through Coulomb Barrier)

**Chain**: C13(nuclear bound state) -> C4(quantum tunneling = collapse to transmitted state) -> C13(daughter nucleus) + C12(alpha particle)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: (A, Z) -> (A-4, Z-2) + He-4 (alpha particle)
- Tilt: O-channel bound state partially dissolves; alpha cluster tunnels through C-channel (Coulomb) barrier

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Coulomb barrier (repulsive, Z-dependent) | Determines tunneling probability |
| H (Weak) | Not directly involved (no flavor change at vertex) | -- |
| O (Strong) | Nuclear binding (attractive, short range) | Holds parent; forms alpha cluster |
| R (Gravity) | Negligible at nuclear scale | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Geiger-Nuttall law | log(lambda) ~ a*Z/sqrt(E_alpha) + b [A-IMPORT] | Confirmed across isotopes | -- | Nuclear data |
| Q_alpha(U-238) | Not predicted | 4.270 MeV | -- | NNDC |
| tau(U-238) | Not predicted | 4.468 Gyr | -- | NNDC |
| Alpha cluster preformation | Not derived [A-IMPORT] | Probability ~ 10^-2 to 10^-1 | -- | Shell model |
| Tunneling mechanism | C4 (quantum collapse to transmitted state) | Standard QM tunneling | -- | [STANDARD-RELABELED] |

**What framework adds**: Chain classification -- alpha decay is a C13 -> C4 -> C13 + C12 process. The tunneling step is C4 (measurement/collapse: the alpha particle either tunnels or doesn't, with probability determined by barrier shape). The Coulomb barrier is C-channel; the nuclear binding is O-channel. This is descriptive, not predictive.
**What is imported**: Gamow tunneling formula, nuclear potential (Woods-Saxon or similar), Coulomb barrier height, alpha preformation factor -- all [A-IMPORT]
**Verification**: None needed (no framework-specific predictions)
**Confidence**: [STANDARD-RELABELED] -- standard nuclear physics in crystallization language

---

### Nuclear Beta Decay (Fermi and Gamow-Teller Transitions)

**Chain**: C13(nuclear bound state) -> C10(H-channel: n -> p or p -> n within nucleus) -> C13(daughter nucleus) + lepton pair
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical (beta-): (A, Z) -> (A, Z+1) + e- + nu_bar_e (neutron -> proton in nucleus)
- Physical (beta+): (A, Z) -> (A, Z-1) + e+ + nu_e (proton -> neutron in nucleus)
- Physical (EC): (A, Z) + e- -> (A, Z-1) + nu_e (electron capture)
- Tilt: H-channel weak transition within O-channel bound state; excess tilt exits as lepton pair

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Coulomb correction (Fermi function F(Z,E)) | Modifies spectrum shape |
| H (Weak) | Mediates n <-> p transition via W | 1 vertex (G_F) |
| O (Strong) | Nuclear wave functions enter matrix element | Via nuclear structure |
| R (Gravity) | Negligible | -- |

**Transition Types**:
- **Fermi** (Delta J = 0, no parity change): Operator ~ tau+/- (isospin flip). Pure vector coupling. Superallowed 0+ -> 0+ transitions test |V_ud|^2.
- **Gamow-Teller** (Delta J = 0, +/- 1, no parity change): Operator ~ sigma * tau+/- (spin-isospin flip). Axial-vector coupling. Ratio g_A/g_V = 1.2756(13).

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| G_F | Not derived [A-IMPORT] | 1.1663788(6) x 10^-5 GeV^-2 | 0.5 ppb | PDG 2024 |
| V_ud (superallowed) | Not derived [A-IMPORT] | 0.97435(16) | 0.016% | Hardy-Towner |
| g_A/g_V | Not derived [A-IMPORT] | 1.2756(13) | 0.10% | PDG 2024 |
| ft values (superallowed) | Not predicted | 3072.27(72) s | 0.023% | Hardy-Towner |
| Fermi/GT classification | Standard (V-A structure) [A-IMPORT] | Confirmed | -- | Standard |

**What framework adds**: Nuclear beta decay is C10 (weak decay) embedded in C13 (nuclear binding). The n -> p transition is an H-channel generation-preserving process (no CKM suppression: V_ud ~ 1). The Fermi/GT classification maps to vector/axial-vector components of the H-channel coupling. This is descriptive.
**What is imported**: G_F, V_ud, g_A, nuclear matrix elements, Fermi function, phase space integrals -- all [A-IMPORT]
**Verification**: `weak_decay_mode_counting.py` (neutron beta decay mode count)
**Confidence**: [STANDARD-RELABELED] -- standard weak interaction theory in nuclear context

**Note**: Superallowed beta decays provide the most precise determination of V_ud = 0.97435(16). The framework does not derive CKM elements (major gap in C10), so this measurement is purely an input.

---

### Nuclear Gamma Decay (Electromagnetic Transitions)

**Chain**: C13(excited nuclear state) -> C8(C-channel photon emission) -> C13(ground/lower state)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: (A, Z)* -> (A, Z) + gamma (excited nucleus de-excites by photon emission)
- Tilt: Nuclear tilt rearrangement (spin/parity change) with excess energy exiting as C-channel mode

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Photon emission (E1, M1, E2, M2, ... multipoles) | 1 photon per transition |
| H (Weak) | Not involved (same Z, same A) | -- |
| O (Strong) | Nuclear structure determines matrix elements | Via wave functions |
| R (Gravity) | Negligible | -- |

**Multipole Classification**:
- **E1** (Electric dipole): Delta J = 1, parity change. Fastest (Weisskopf ~ 10^14 A^(2/3) E_gamma^3 s^-1)
- **M1** (Magnetic dipole): Delta J = 1, no parity change. Slower by ~ (v/c)^2
- **E2** (Electric quadrupole): Delta J = 2, no parity change. Slower by ~ (R/lambda)^2
- Higher multipoles: progressively suppressed by (R/lambda)^(2L)

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Weisskopf estimates | Not derived [A-IMPORT] | Confirmed (order-of-magnitude) | ~factor 2-10 | Nuclear data |
| E1/M1/E2 hierarchy | Standard multipole selection [A-IMPORT] | Confirmed | -- | Standard |
| Internal conversion | alpha_IC = P(e-)/P(gamma) [A-IMPORT] | Confirmed for all multipoles | -- | Nuclear data |
| Isomer lifetimes | Not predicted | 10^-15 s to 10^15 yr range | -- | NNDC |
| 0+ -> 0+ transitions | E0 only (no single photon) -> internal conversion/pair | Confirmed | -- | Selection rules |

**What framework adds**: Nuclear gamma decay is the nuclear-scale analog of atomic C8 (photon emission). The process is C13 -> C8 -> C13: a nuclear bound state emits a C-channel mode while remaining bound. The multipole hierarchy reflects the angular momentum structure of the C-channel emission. No framework-specific predictions.
**What is imported**: Nuclear shell model wave functions, Weisskopf estimates, selection rules, internal conversion coefficients -- all [A-IMPORT]
**Verification**: None needed (no framework-specific predictions)
**Confidence**: [STANDARD-RELABELED] -- standard nuclear EM transitions in crystallization language

---

## Summary

| Process | Tag | Framework Content | Key Tests | Scripts |
|---------|-----|-------------------|-----------|---------|
| Alpha decay | [STANDARD-RELABELED] | C13->C4->C13 chain (tunneling) | None framework-specific | None needed |
| Nuclear beta decay | [STANDARD-RELABELED] | C10 in C13 context; H-channel | Mode count (neutron) | `weak_decay_mode_counting.py` |
| Nuclear gamma decay | [STANDARD-RELABELED] | C8 in C13 context; multipole hierarchy | None framework-specific | None needed |

**Honest count**: 0/3 entries [FRAMEWORK-CONSTRAINED] or higher, 3/3 [STANDARD-RELABELED]. This is the weakest sub-catalog in terms of framework content. Nuclear physics is dominated by [A-IMPORT] quantities (nuclear potentials, matrix elements, coupling constants). The framework adds chain classification and channel labeling only.

**Why this is still useful**: Even though all entries are relabeled, the chain classification reveals the multi-channel nature of nuclear physics: alpha decay involves C+O channels (Coulomb + nuclear), beta decay involves H+O channels (weak + nuclear), and gamma decay involves C+O channels (EM + nuclear). This organizational structure is the framework's contribution.

---

## Cross-References

- Neutron beta decay: `framework/crystallization_processes/decays/weak_decays.md`
- Nuclear binding: `framework/crystallization_processes/bound_states/nuclear_binding.md`
- BBN (primordial nucleosynthesis): `framework/crystallization_processes/phase_transitions/bbn_nucleosynthesis.md`
- Stellar nucleosynthesis: `framework/crystallization_processes/astrophysical/stellar_processes.md`
- C8 definition: `framework/CRYSTALLIZATION_CATALOG.md` (Part II)
- C10 definition: `framework/CRYSTALLIZATION_CATALOG.md` (Part II)
- C13 definition: `framework/CRYSTALLIZATION_CATALOG.md` (Part II)

---

*Created: 2026-02-03 (S236)*
