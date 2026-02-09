# Baryogenesis Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 239), **updated S245**
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C16: Baryogenesis, C7: Cosmological Phase Transitions)
**Layer**: Layer 2 correspondence (EW baryogenesis now constrained via xi=4/121 finite-T calculation)

---

## Disclaimer

**This sub-catalog is entirely [STANDARD-RELABELED].** The framework has no mechanism for generating the baryon asymmetry eta ~ 6 x 10^-10. Baryogenesis is one of the most significant open problems in physics, and this framework does not address it. The crystallization picture maps the Sakharov conditions onto channel language (B-violation from tilt topology, CP from H-channel CKM, non-equilibrium from C7 phase transitions), but this mapping adds no predictive content. The baryon-to-photon ratio eta is an [A-IMPORT] quantity with no framework derivation.

---

## Processes

### Sakharov Conditions (Requirements for Baryogenesis)

**Chain**: C16 requires: (1) baryon number violation + (2) C and CP violation + (3) departure from thermal equilibrium
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Matter-antimatter symmetric early universe -> Universe with net baryon excess. The three Sakharov conditions (1967) are necessary for any dynamical baryogenesis mechanism.
- Tilt: The crystallization picture interprets each condition in channel language, but this is purely relabeling.

**Sakharov conditions in crystallization language**:

| Condition | Standard Physics | Crystallization Language | Framework Content |
|-----------|-----------------|--------------------------|-------------------|
| B-violation | Sphaleron processes (EW); GUT interactions | Topological tilt transitions (C16) | [STANDARD-RELABELED] — no mechanism for B-violation beyond SM sphalerons |
| C and CP violation | CKM phase; possible BSM CP sources | H-channel phase structure (C10) | [STANDARD-RELABELED] — CKM phase is [A-IMPORT] |
| Non-equilibrium | Phase transitions; out-of-equilibrium decays | C7 departure from thermal tilt equilibrium | [STANDARD-RELABELED] — standard cosmological thermal history |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| eta (baryon/photon ratio) | Not derived (gap) | 6.14(19) x 10^-10 | 3% | Planck 2018 |
| n_B / s (baryon/entropy) | Not derived | 8.7(3) x 10^-11 | 3% | Planck 2018 |
| Omega_b h^2 | Not derived | 0.02237(15) | 0.7% | Planck 2018 |
| CKM CP phase (delta) | Not derived | 1.144(27) rad | 2.4% | PDG 2024 |
| Sphaleron rate (EW) | Not derived | ~alpha_W^5 T at T > T_EW | -- | Standard |

**What framework adds**: Nothing quantitative. The mapping of Sakharov conditions to crystallization channels is organizational. The framework does not predict the baryon asymmetry, does not propose a specific baryogenesis mechanism, and does not derive the CKM CP-violating phase from axioms (the CKM matrix is a major gap: C10).
**What is imported**: All three Sakharov conditions [A-IMPORT from Sakharov 1967], CKM matrix [A-IMPORT], sphaleron physics [A-IMPORT], eta from CMB [A-IMPORT]
**Verification**: None (no framework predictions)
**Confidence**: [STANDARD-RELABELED] throughout

---

### Electroweak Baryogenesis

**Chain**: C7(EW phase transition at T ~ 160 GeV) -> C16(B-violation via sphalerons in broken phase) -> C9(baryon excess frozen after transition)
**Tag**: [FRAMEWORK-CONSTRAINED] (upgraded S245 — honest negative result)

**Before -> After**:
- Physical: Universe at T > T_EW ~ 160 GeV (symmetric phase, rapid sphalerons) -> EW phase transition -> B+L violation via sphalerons becomes suppressed in broken phase -> Baryon asymmetry possibly generated during or after the transition.
- Tilt: C7 (EWSB phase transition) provides the non-equilibrium condition. Sphalerons (topological transitions in the SU(2) gauge field) violate B+L while conserving B-L. CP violation from CKM and/or BSM sources biases the asymmetry.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Sphaleron B+L violation; CKM CP violation | SU(2) gauge topology |
| C (EM) | After EWSB: photon emerges from EW mixing | -- |
| O (Strong) | QCD sphalerons (suppressed at high T) | -- |
| R (Gravity) | Expansion rate at T ~ 160 GeV | H ~ T^2 / M_Pl |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| T_EW (transition T) | T_0 = 156.3 GeV [D: from xi=4/121] | ~160 GeV | ~2% | Standard + lattice |
| EW phase transition order | Crossover (SM with m_H = 125 GeV) | Crossover | -- | Lattice: Kajantie et al. 1996 |
| v_c/T_c (SM baseline) | 0.148 [D: perturbative, E/λ] | ~0.1-0.2 (lattice) | -- | Kajantie et al. |
| v_c/T_c (composite Higgs) | 0.140 [D: from xi=4/121, λ_ratio=1.057] | -- | -- | **This work (S245)** |
| Sphaleron washout bound | v_c/T_c > 1 required | -- | -- | Standard |
| **PT sufficient for baryogenesis?** | **NO** (v_c/T_c ~ 0.14 << 1) | No (SM crossover) | -- | **Framework constraint** |
| SM CP violation (sufficient?) | Not analyzed | Insufficient by ~10 orders | -- | Gavela et al. 1994 |

**SM baryogenesis failure**: In the Standard Model with m_H = 125 GeV, the EW phase transition is a smooth crossover (not first-order), and the CKM CP violation is far too small to generate the observed eta. Successful EW baryogenesis requires BSM physics.

**Composite Higgs result (S245)**: The framework's composite Higgs with xi = 4/121 ~ 0.033 has been explicitly calculated:
- Finite-T effective potential: V(h,T) = -(α - c_th T²) sin²(h/f) + β sin⁴(h/f)
- With β = m_H² f²/(8ξ(1-ξ)), α = 2βξ, c_th = f²(3g² + g'² + 4y_t²)/32
- Critical temperature: T_0 = √(α/c_th) = 156.3 GeV (physically correct EW scale)
- Effective quartic ratio: λ_eff(CH)/λ(SM) = 1.057 (composite Higgs 5.7% stronger than SM)
- Phase transition strength: v_c/T_c ~ 0.140 (slightly weaker than SM's 0.148 due to stronger quartic)
- **Result: v_c/T_c ~ 0.14 << 1 — EW phase transition is too weak for baryogenesis**

This is an **honest negative result**: the framework's xi = 4/121 is too small to generate a strongly first-order EW phase transition. The threshold for significant PT strengthening is xi ~ 0.1; the framework gives xi ~ 0.033, about 3× below threshold. The composite Higgs actually makes the PT marginally *weaker* than SM (by ~5%) because the quartic coupling is slightly enhanced.

**Structural implication**: EW baryogenesis is disfavored within this framework. This points toward **leptogenesis** as the preferred baryogenesis mechanism, which is structurally supported by the SO(11) spinor embedding predicting ν_R (entry #68, EQ-025).

**What framework adds**: Quantitative constraint on EW phase transition strength through xi = 4/121 [DERIVATION]. The composite Higgs finite-T potential gives T_0 = 156.3 GeV and v_c/T_c ~ 0.14, ruling out EW baryogenesis. This is a genuine framework prediction (negative), not mere relabeling.
**What is imported**: Sphaleron physics [A-IMPORT], perturbative finite-T methods [A-IMPORT], sphaleron washout bound [A-IMPORT], SM gauge couplings at EW scale [A-IMPORT]
**Verification**: `ew_baryogenesis_crystallization.py` (20/20 PASS — composite Higgs potential, finite-T analysis, PT strength, SM comparison, honest constraints)
**Confidence**: [FRAMEWORK-CONSTRAINED] — xi = 4/121 gives honest negative prediction for EW baryogenesis viability

---

### Leptogenesis

**Chain**: C10(H: heavy right-handed neutrino decay, CP-violating) -> C16(B-L generated via lepton asymmetry) -> C7(sphaleron conversion of L to B)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Heavy right-handed neutrinos (M_N >> T_EW) produced in early universe -> CP-violating decays generate lepton asymmetry -> Sphalerons partially convert lepton asymmetry to baryon asymmetry before EWSB.
- Tilt: H-channel (weak) decay of heavy neutral fermions with CP-violating phases. The lepton asymmetry is generated in the H-channel, then converted to baryons via topological sphaleron processes. This is a "leptogenesis-first" scenario.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Primary: N_R decay with CP violation; Yukawa couplings | N_R -> l + H, l-bar + H* |
| C (EM) | Not directly involved | -- |
| O (Strong) | Not directly involved | -- |
| R (Gravity) | Expansion rate sets freeze-out of N_R | H > Gamma(N_R) for departure from equilibrium |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| M_N (RH neutrino mass) | Not derived | Unknown (> 10^9 GeV for vanilla leptogenesis) | -- | Davidson-Ibarra bound |
| Light neutrino masses | Not derived | Sum < 0.12 eV (Planck) | -- | Planck 2018 + KATRIN |
| CP asymmetry epsilon_N | Not derived | O(10^-6) needed | -- | Models |
| B-L conversion factor | 28/79 (SM) | Standard | -- | Sphaleron analysis |

**Framework connection to nu_R**: The framework's SO(11) spinor embedding (S212) includes a right-handed neutrino nu_R as a structural prediction [CONJECTURE]. If nu_R exists as a heavy Majorana fermion, leptogenesis becomes a natural baryogenesis mechanism. However, the framework does not predict M_N, the CP-violating phases, or the Yukawa couplings needed to calculate epsilon_N. The connection is structural, not quantitative.

**What framework adds**: The SO(11) spinor embedding structurally includes nu_R (EQ-025), which is the ingredient needed for leptogenesis. This is a consistency check, not a prediction — nu_R is present in most GUT-scale frameworks. No quantitative predictions for M_N, CP phases, or the resulting asymmetry.
**What is imported**: Seesaw mechanism [A-IMPORT], Majorana mass [A-IMPORT], CP violation in lepton sector [A-IMPORT], sphaleron B-L conversion [A-IMPORT], Davidson-Ibarra bound [A-IMPORT]
**Verification**: None (no framework predictions)
**Confidence**: [STANDARD-RELABELED] with structural nu_R consistency noted

---

### Baryon Asymmetry eta ~ 6 x 10^-10

**Chain**: C16(mechanism: unknown) -> C9(eta frozen after baryogenesis epoch) -> observable in BBN and CMB
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Whatever mechanism generates the asymmetry -> The baryon-to-photon ratio eta = n_B / n_gamma = 6.14(19) x 10^-10 is frozen in and measurable through BBN abundances and CMB acoustic peaks.
- Tilt: The asymmetry parameter eta represents a small net "handedness" in the baryon sector — a tiny preference for matter over antimatter crystallization. The measured value is consistent between BBN (from primordial deuterium) and CMB (from acoustic peak ratios), providing a powerful cross-check.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | B-violation mechanism (sphalerons, GUT, ...) | Depends on mechanism |
| C (EM) | Not primary | -- |
| O (Strong) | QCD sphalerons (subdominant) | -- |
| R (Gravity) | Expansion rate (non-equilibrium condition) | -- |

**Key Data**:

| Observable | Framework | Measured (BBN) | Measured (CMB) | Source |
|-----------|-----------|----------------|----------------|--------|
| eta | Not derived (gap) | 6.1(4) x 10^-10 (from D/H) | 6.14(19) x 10^-10 | Cooke et al. 2018; Planck 2018 |
| Omega_b h^2 | Not derived | 0.0224(4) (BBN) | 0.02237(15) (CMB) | Multiple |
| BBN-CMB consistency | Not derived | Consistent at 1 sigma | -- | Remarkable agreement |

**Why eta is a deep puzzle**: The value eta ~ 6 x 10^-10 is tiny but non-zero. If exactly zero, no baryonic structures (stars, planets, people) would exist. If much larger, the universe would be radiation-poor and structurally different. The specific value is not explained by any established theory, and it is one of the most fundamental unexplained numbers in cosmology.

**What framework adds**: Nothing. The baryon asymmetry is not derived, not constrained, and not illuminated by the framework. This is one of the most significant gaps — eta is a fundamental cosmological parameter with no framework explanation. The framework correctly classifies baryogenesis as C16 (asymmetric crystallization) but provides no mechanism.
**What is imported**: eta [A-IMPORT from CMB/BBN], all baryogenesis mechanisms [A-IMPORT], BBN nuclear physics [A-IMPORT], CMB acoustic physics [A-IMPORT]
**Verification**: None (no framework predictions)
**Confidence**: [STANDARD-RELABELED] — a fundamental gap

---

## Summary

| Process | Tag | Framework Content | Gap |
|---------|-----|-------------------|-----|
| Sakharov conditions | [STANDARD-RELABELED] | Channel mapping only | No B-violation mechanism |
| EW baryogenesis | **[FRAMEWORK-CONSTRAINED]** | xi=4/121 gives v_c/T_c ~ 0.14 << 1 (negative prediction) | Mechanism ruled out |
| Leptogenesis | [STANDARD-RELABELED] | nu_R structurally present (SO(11)) | No M_N or CP phase |
| Baryon asymmetry eta | [STANDARD-RELABELED] | Nothing | Fundamental gap |

**Overall**: 1/4 [FRAMEWORK-CONSTRAINED], 3/4 [STANDARD-RELABELED] (S245 upgrade). The EW baryogenesis entry was upgraded based on an explicit finite-temperature composite Higgs calculation showing v_c/T_c ~ 0.14 << 1, ruling out EW baryogenesis within the framework (honest negative prediction). This structural constraint favors leptogenesis as the preferred mechanism, which is consistent with the SO(11) spinor prediction of nu_R (#68). The baryon-to-photon ratio eta ~ 6 x 10^-10 remains entirely unexplained.

---

## Cross-References

- EWSB phase transition: `phase_transitions/ewsb_detailed.md`
- BBN (uses eta): `phase_transitions/bbn_nucleosynthesis.md`
- CMB (measures eta): `cosmological/cmb_detailed.md`
- nu_R prediction: EQ-025 in `registry/EXPLORATION_QUEUE.md`
- Composite Higgs: `topics/collider-crystallization.md`
- Main catalog: C16 (baryogenesis), C7 (phase transitions), C10 (weak decays)
- Data: `data/planck_cosmology.md`

---

*Created: 2026-02-03 (S239), updated S245*
