# Compact Objects Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 231)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C5: BH De-Crystallization, C13: Nuclear Binding, C15: Gravitational Radiation)
**Layer**: Mixed (Layer 1 mathematics + Layer 2 correspondence + Layer 3 predictions)

---

## Disclaimer

This sub-catalog is **mostly [STANDARD-RELABELED]** with one significant [FRAMEWORK-CONSTRAINED] entry. Black hole formation connects genuinely to C5 (de-crystallization), which is one of the framework's more developed astrophysical predictions: epsilon -> 0 at the center, no GW echoes (R ~ exp(-10^37) = 0), and S_BH = A/(n_d L_Pl^2) with n_d = 4. Neutron star structure and merger dynamics are standard GR/nuclear physics with no framework predictions. Magnetar flares are entirely [A-IMPORT].

---

## Processes

### Neutron Star Structure (TOV Equilibrium)

**Chain**: C5(partial reverse: core collapse) -> C13(O: nuclear matter EOS) -> C3(epsilon stabilized at nuclear density)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Proto-neutron star (hot, neutrino-opaque) -> Cooled neutron star in hydrostatic equilibrium. Mass 1.1-2.3 M_sun, radius 10-14 km, central density 2-8 rho_nuclear.
- Tilt: The neutron star is a stable equilibrium between R-channel gravitational compression and O-channel nuclear/degeneracy pressure. In crystallization language, the tilt field epsilon is stabilized at a high-density value intermediate between the vacuum (epsilon = epsilon*) and the black hole interior (epsilon -> 0). The TOV equation governs this equilibrium.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Beta equilibrium: n <-> p + e + nu_e | Determines proton fraction x_p |
| C (EM) | Electron degeneracy pressure (minor above n_drip) | Crust structure |
| O (Strong) | Dominant pressure source (nuclear EOS) | p-p, n-n, n-p interactions |
| R (Gravity) | TOV confinement | dp/dr = -(rho + p)(m + 4pi r^3 p) / r(r - 2m) |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| M_max (TOV limit) | Not derived | 2.01-2.35 M_sun | ~5% | PSR J0740+6620, GW170817 |
| R (typical, 1.4 M_sun) | Not derived | 11.0-13.7 km | ~10% | NICER + GW170817 |
| Central density | Not derived | 2-8 rho_nuclear | -- | EOS-dependent |
| M_min (stability) | Not derived | ~0.1 M_sun (theoretical) | -- | Models |
| Moment of inertia | Not derived | ~10^45 g cm^2 | -- | Models (future: double pulsar) |

**What framework adds**: Chain classification only. The TOV equation is pure GR [A-IMPORT]. The nuclear EOS is pure nuclear physics [A-IMPORT]. The framework identifies the neutron star as a state where epsilon is stabilized at high density (intermediate between vacuum and BH), but provides no quantitative predictions for M_max, R, or the EOS. The proton fraction in beta equilibrium connects to C10 (H-channel weak process) but the equilibrium value is not derived.
**What is imported**: TOV equation [A-IMPORT: GR], nuclear EOS [A-IMPORT], beta equilibrium [A-IMPORT], observed masses and radii [A-IMPORT]
**Verification**: `astrophysical_crystallization.py` (TOV scaling test)
**Confidence**: [STANDARD-RELABELED]

---

### Black Hole Formation (Gravitational Collapse -> C5)

**Chain**: C13(O: iron core at M_Ch) -> C5(reverse: epsilon -> 0 as matter crosses horizon) -> C3(exterior: Schwarzschild/Kerr epsilon profile)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Matter exceeding the TOV maximum mass -> Gravitational collapse through the event horizon -> Black hole with mass M, spin a, charge Q (no-hair). For stellar-mass BHs: M ~ 3-100 M_sun from core collapse or merger.
- Tilt: De-crystallization (C5). The tilt field epsilon, which characterizes the degree of crystallization, transitions from epsilon* (far from BH) to 0 at the center. The event horizon is the boundary where inside and outside perspectives become perfectly orthogonal (<in|out> = 0). The singularity is not infinite density but the absence of structure (epsilon = 0). The tilt field is too massive (m_tilt ~ 2.1 x 10^16 GeV) to deviate from epsilon* at astrophysical scales — deviations only matter at r ~ 70 L_Pl.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Irrelevant post-collapse | -- |
| C (EM) | No EM emission (classical BH); possible charge Q | Penrose process (spin extraction) |
| O (Strong) | Nuclear structure dissolved during collapse | -- |
| R (Gravity) | Dominant: curvature singularity; GW emission during formation | 16 = n_d^2 tilt DOF |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| S_BH = A/(n_d L_Pl^2) | n_d = 4 -> S = A/(4 L_Pl^2) [D] | Bekenstein-Hawking standard | 0% | [D: C5] |
| T_H = 1/(C n_d pi G M) | C = 2, n_d = 4 [D] | Standard Hawking T | 0% | [D: C5] |
| No GW echoes | R ~ exp(-m_tilt r_BH) ~ 0 [D] | Non-detection (LIGO O1-O3) | Consistent | [D: C5] |
| r_crit = 1/(alpha) L_Pl | 137 L_Pl [D] | Untestable (Planck scale) | -- | [D: C5] |
| M_crit = M_Pl/(2 alpha) | ~68 M_Pl [D] | Untestable | -- | [D: C5] |
| Interior epsilon | epsilon -> 0 [CONJECTURE] | Untestable (inside horizon) | -- | [C5] |

**What framework adds**: Black hole formation is the most framework-relevant astrophysical process. C5 identifies the BH interior with de-crystallization (epsilon -> 0), the event horizon with perspective orthogonality, and derives the Bekenstein-Hawking entropy factor n_d = 4 from the defect dimension. The no-echo prediction (R ~ exp(-10^37) = 0) is a robust [DERIVATION] distinguishing the framework from some quantum gravity proposals that predict echoes. The critical mass M_crit ~ 68 M_Pl and critical radius r_crit = 137 L_Pl are Planck-scale predictions. However, the framework does NOT predict BH masses, spins, or formation rates — these depend on astrophysical initial conditions [A-IMPORT].
**What is imported**: Schwarzschild/Kerr metric [A-IMPORT: GR], stellar evolution leading to collapse [A-IMPORT], observed BH masses [A-IMPORT]
**Verification**: `bh_information_paradox_resolution.py` (10/10), `bh_dimensional_crystallization.py` (11/11), `bh_entropy_microscopic.py` (9/9), `bekenstein_hawking_factor.py` (7/7), `astrophysical_crystallization.py`
**Confidence**: [FRAMEWORK-CONSTRAINED] for BH thermodynamics (S, T_H, no echoes); [CONJECTURE] for epsilon -> 0 interior; [STANDARD-RELABELED] for formation dynamics

---

### Neutron Star Mergers (GW170817-type Events)

**Chain**: C15(R: inspiral GW emission) -> C5+C13(merger: NS+NS -> hypermassive NS or BH + disk) -> C10(H: r-process nucleosynthesis weak decays) -> C8(C: kilonova optical/IR emission)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Binary neutron star system (orbital decay via GW emission over ~Gyr) -> Inspiral + merger -> Hypermassive/supramassive NS (ms lifetime) or prompt BH + accretion disk -> Short GRB (jet) + kilonova (r-process powered optical/IR) + GW signal.
- Tilt: Multi-channel crystallization sequence. R-channel GW emission (C15) drives the inspiral. At merger, the extreme density may trigger C5 (de-crystallization to BH) or stabilize as a massive NS (C13). The ejecta undergo r-process nucleosynthesis: rapid neutron capture (C13, O-channel) followed by beta decays (C10, H-channel), producing heavy elements (A > 56). Kilonova photon emission (C8, C-channel) is powered by radioactive decay of r-process products.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | r-process beta decays powering kilonova; neutrino emission | beta-decay rates set kilonova timescale |
| C (EM) | Kilonova emission (optical/IR); short GRB afterglow | AT 2017gfo: peaked ~1 day |
| O (Strong) | r-process neutron capture; tidal disruption dynamics | Produces elements up to A ~ 250 |
| R (Gravity) | GW inspiral signal (dominant pre-merger energy loss) | GW170817: ~3000 cycles in LIGO band |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Chirp mass (GW170817) | Not derived [A-IMPORT] | 1.186(1) M_sun | -- | LIGO/Virgo |
| GW speed | c [STANDARD-RELABELED: GR] | |c_GW/c - 1| < 10^-15 | -- | GW170817 + GRB 170817A |
| Ejecta mass | Not derived | ~0.05 M_sun (total) | factor ~2 | Kilonova modeling |
| r-process elements | Not derived | Lanthanides confirmed (GW170817) | -- | Spectroscopy |
| Rate (BNS mergers) | Not derived | 10-1700 Gpc^-3 yr^-1 | -- | GWTC-3 |

**What framework adds**: Chain classification (C15 -> C5/C13 -> C10 -> C8). This is one of the richest multi-channel processes: all four channels participate in the observable sequence. The GW speed test (c_GW = c to 10^-15) is consistent with the framework's identification of gravitational waves as R-channel tilt propagation, but this is not a novel prediction — it follows from GR [A-IMPORT]. The r-process involves the same H-channel (C10) and O-channel (C13) crystallization types as other nuclear processes. No quantitative framework predictions for merger dynamics, ejecta, or kilonova properties.
**What is imported**: GR for inspiral and merger dynamics [A-IMPORT], nuclear EOS [A-IMPORT], r-process network [A-IMPORT], kilonova models [A-IMPORT]
**Verification**: `astrophysical_crystallization.py` (chirp mass formula test)
**Confidence**: [STANDARD-RELABELED]

---

### Magnetar Giant Flares

**Chain**: C13(O: magnetic stress on NS crust) -> C7(thermal: crust fracture/starquake) -> C8(C: gamma-ray emission, ~10^44-10^47 erg)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Neutron star with ultra-strong magnetic field (B ~ 10^14-10^15 G) -> Magnetic stress exceeds crust yield strength -> Catastrophic crust fracture (starquake) -> Magnetic reconnection -> Giant flare (initial spike ~0.1 s, pulsating tail ~100 s). Three confirmed: SGR 0526-66 (1979), SGR 1900+14 (1998), SGR 1806-20 (2004).
- Tilt: The magnetic field stores energy in the C-channel (electromagnetic). When magnetic stress exceeds the O-channel elastic limit of the nuclear crust, a sudden structural rearrangement (C7, phase-transition-like) releases the stored energy as a gamma-ray burst (C8). The pulsating tail reflects the NS rotation. The mechanism is analogous to an earthquake: slow stress buildup -> sudden release.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Negligible in flare dynamics | -- |
| C (EM) | Both cause (magnetic stress) and effect (gamma-ray emission) | B ~ 10^14-15 G |
| O (Strong) | Crust lattice structure; yield strength | Nuclear pasta phases? |
| R (Gravity) | NS potential well confines system | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| B field | Not derived | 10^14-10^15 G (spin-down) | order of magnitude | X-ray timing |
| Peak luminosity (SGR 1806-20) | Not derived | ~2 x 10^47 erg/s | factor ~3 | Palmer et al. 2005 |
| Flare energy | Not derived | 10^44-10^47 erg | -- | Three events |
| Recurrence time | Not derived | Decades (3 events in ~25 yr) | -- | Observations |
| QPO frequencies | Not derived | 18-1840 Hz | -- | SGR 1806-20 |

**What framework adds**: Chain classification (C13 -> C7 -> C8). The magnetar flare illustrates the interplay between C-channel (magnetic) energy storage and O-channel (nuclear crust) structural integrity, with C7 (sudden transition) mediating the release. No quantitative framework predictions exist for magnetic field strengths, flare energies, or QPO frequencies. The crust nuclear structure connects to C13 (nuclear binding) but the yield strength is not derived.
**What is imported**: Magnetar magnetic field physics [A-IMPORT], NS crust structure [A-IMPORT], magnetic reconnection [A-IMPORT], observed flare properties [A-IMPORT]
**Verification**: Standard physics; no dedicated framework test
**Confidence**: [STANDARD-RELABELED]

---

## Summary

| Process | Tag | Framework Content | Gap |
|---------|-----|-------------------|-----|
| Neutron star structure | [STANDARD-RELABELED] | Chain classification; epsilon at intermediate density | No M_max, R, or EOS prediction |
| Black hole formation | [FRAMEWORK-CONSTRAINED] | C5: epsilon -> 0, S = A/4 (n_d=4), no echoes, r_crit = 137 L_Pl | epsilon(r) profile at Planck scale |
| NS mergers | [STANDARD-RELABELED] | Chain classification (all 4 channels); c_GW = c consistency | No merger dynamics predictions |
| Magnetar giant flares | [STANDARD-RELABELED] | Chain classification (C13 -> C7 -> C8) | No B field or energy predictions |

**Overall**: 1/4 [FRAMEWORK-CONSTRAINED], 3/4 [STANDARD-RELABELED]. Black hole formation is the only process with genuine framework content, connecting to the C5 de-crystallization type. The no-echo prediction (R ~ exp(-10^37) = 0) is the most observationally relevant framework statement in this sub-catalog — it makes a definite (negative) prediction testable by LIGO/Virgo/KAGRA. All other compact object physics is standard GR and nuclear physics.

**Cross-References**:
- Main catalog: C5 (BH de-crystallization), C13 (nuclear binding), C15 (GW radiation)
- Investigation: `spacetime/black_holes_crystallization.md`
- Data: `data/gravitational_wave_data.md`, `data/nuclear_data.md`
- Exploration Queue: EQ-017 (BH entropy derivation)
- Verification: `bh_*.py` scripts (37/37 PASS), `astrophysical_crystallization.py`
- Sessions: S121-122 (BH deep dive), S231

---

*Created: 2026-02-03 (S231)*
