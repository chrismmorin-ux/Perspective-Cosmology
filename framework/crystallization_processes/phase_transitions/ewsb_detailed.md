# Electroweak Symmetry Breaking Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 229)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C2: Symmetry Breaking, C7: Cosmological Phases, C9: Mass Freezing)
**Layer**: Mixed (Layer 1 coset geometry + Layer 2 correspondence + Layer 3 predictions)

---

## Disclaimer

This sub-catalog contains the **strongest framework content** of any phase transition catalog. The EWSB mechanism in the Perspective framework is a composite Higgs model on the coset SO(11)/[SO(4) x SO(7)] = Gr(4,11), giving xi = n_d/n_c^2 = 4/121, sin^2(theta_W) = 28/121, and kappa_V = sqrt(117/121). Three of four entries are [FRAMEWORK-CONSTRAINED] or [FRAMEWORK-DERIVED]. The Higgs is a pseudo-Nambu-Goldstone boson (pNGB) of the Stage 1 breaking SO(11) -> SO(4) x SO(7).

---

## Processes

### Electroweak Symmetry Breaking (SO(11) -> SO(4) x SO(7) -> SM)

**Chain**: C2(Stage 1: SO(11) -> SO(4) x SO(7)) -> C7(EW epoch: T ~ 160 GeV) -> C2(EWSB: SU(2)_L x U(1)_Y -> U(1)_EM)
**Tag**: [FRAMEWORK-DERIVED]

**Before -> After**:
- Physical: Electroweak symmetric phase (W, Z massless; all fermions massless) -> Broken phase (W, Z massive; fermions acquire mass)
- Tilt: The defect-space (R^4 = C^2) component of Stage 1 Goldstone modes acquires a VEV through Coleman-Weinberg potential, breaking SU(2)_L x U(1)_Y -> U(1)_EM. In crystallization language: a secondary ordering within the n_d = 4 sector selects a preferred direction.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Primary: SU(2)_L gauge bosons become massive | 3 broken generators -> W+, W-, Z |
| C (EM) | Preserved: U(1)_EM unbroken | 1 preserved generator (photon) |
| O (Strong) | Spectator (at EW scale) | SU(3)_c unbroken |
| R (Gravity) | Absent at EW scale | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Coset space | Gr(4,11) = SO(11)/[SO(4) x SO(7)] | -- (structural) | -- | [D: from C2] |
| dim(coset) | n_d x Im_O = 28 | -- (structural) | -- | [D] |
| Higgs doublet DOF | n_d = 4 (color singlet of 28) | 4 | Exact | [D] |
| Colored pNGB DOF | 24 = 28 - 4 | -- (BSM prediction) | -- | [D] |
| xi = v^2/f^2 | n_d/n_c^2 = 4/121 = 0.03306 | < 0.1 (EW precision) | Consistent | [CONJECTURE] |
| f (compositeness scale) | v * n_c/2 = 1354 GeV | -- (prediction) | -- | [D from xi] |
| sin^2(theta_W) | n_d * Im_O / n_c^2 = 28/121 = 0.23140 | 0.23122(4) | 0.08% | PDG 2024 |
| Broken generators | 3 (em2, em3, em1+J) | 3 (W+, W-, Z) | Exact | [D from S175] |
| Preserved generator | 1 (Q = em1 - J = 2*L12) | 1 (photon) | Exact | [D from S175] |

**What framework adds**: The EWSB mechanism is a genuine composite Higgs on Gr(4,11). The coset space, its dimension (28), the Higgs doublet identification (color-singlet component of Stage 1 Goldstones), the misalignment parameter xi = 4/121, and the Weinberg angle sin^2(theta_W) = 28/121 are all derived or conjectured from framework quantities. The specific VEV direction analysis (S175) shows exactly 3 broken + 1 preserved generator, matching the SM. The 24 colored pNGBs are a BSM prediction with mass bounds from LHC.
**What is imported**: Coleman-Weinberg mechanism for pNGB potential [I-MATH], EW scale v = 246.22 GeV [A-IMPORT], QFT Goldstone theorem [I-MATH]
**Verification**: `ewsb_higgs_from_goldstones.py` (23/23 PASS), `ewsb_coupling_deviations.py` (20/20 PASS), `phase_transition_crystallization.py`
**Confidence**: [FRAMEWORK-DERIVED] for coset structure and Higgs identification; [CONJECTURE] for xi = 4/121; [DERIVATION] for sin^2(theta_W) = 28/121

---

### Higgs Mechanism (pNGB Vacuum Alignment)

**Chain**: C2(EWSB) -> C3(vacuum alignment: potential minimum at sin(theta) = v/f)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Higgs field at symmetric point (h = 0) -> Higgs field at VEV (h = v)
- Tilt: The vacuum alignment angle theta = arcsin(v/f) = arcsin(2/n_c * sqrt(xi)) determines the misalignment. The pNGB potential V(h) = -alpha f^2 sin^2(h/f) + beta f^2 sin^4(h/f) is minimized at sin^2(<h>/f) = xi = 4/121.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Top loop dominates Coleman-Weinberg potential | y_t^2 contribution |
| O (Strong) | QCD contribution to colored pNGB masses | g_s^2 contribution |
| C (EM) | Sub-leading loop correction | alpha_EM contribution |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| xi = sin^2(<h>/f) | 4/121 = 0.03306 | -- (prediction) | -- | [CONJECTURE] |
| m_H (Higgs mass) | 125 GeV [A-IMPORT, related to lambda_H] | 125.25(17) GeV | -- | PDG 2024 |
| lambda_H (quartic) | 125/968 [CONJECTURE] = 0.1291 | m_H^2/(2v^2) = 0.1293 | 0.15% | [from m_H] |
| kappa_V = g_hVV/g_SM | sqrt(1 - xi) = sqrt(117/121) = 0.9834 | 1.00(2) | Consistent | LHC Run 2 |
| kappa_f = g_hff/g_SM (MCHM4) | sqrt(1 - xi) = 0.9834 | 1.00(3) | Consistent | LHC Run 2 |
| kappa_lambda (triple Higgs) | (1 - 2*xi)/sqrt(1 - xi) = 0.9497 | -- (unmeasured) | -- | Future: FCC-hh |

**What framework adds**: The vacuum alignment angle is determined by xi = n_d/n_c^2 = 4/121 [CONJECTURE]. This predicts specific coupling deviations: kappa_V = sqrt(117/121) ~ 0.9834 (1.66% below SM). The spinorial fermion embedding (MCHM4, from S212) gives universal kappa_f = kappa_V. The triple Higgs coupling kappa_lambda = 0.9497 (5.03% below SM) is a prediction testable at FCC-hh. The Higgs quartic lambda_H = 125/968 at 0.15% [CONJECTURE] uses framework numerology.
**What is imported**: Coleman-Weinberg potential formalism [I-MATH], m_H = 125.25 GeV [A-IMPORT], v = 246.22 GeV [A-IMPORT], top Yukawa coupling [A-IMPORT]
**Verification**: `ewsb_coupling_deviations.py` (20/20 PASS), `ewsb_higgs_coupling_kappa_lambda.py` (20/20 PASS), `phase_transition_crystallization.py`
**Confidence**: [FRAMEWORK-CONSTRAINED] overall; [CONJECTURE] for xi = 4/121; [DERIVATION] for spinorial embedding (S212)

---

### W and Z Boson Mass Generation

**Chain**: C2(EWSB) -> C9(mass freezing: W, Z acquire mass) -> C3(vacuum supports massive propagation)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Massless W^1, W^2, W^3, B gauge bosons -> Massive W+, W-, Z + massless photon
- Tilt: Three of the four Higgs DOF are "eaten" by W+, W-, Z (Goldstone equivalence). Each massive vector boson gains a longitudinal polarization. Mass ratio M_W/M_Z = cos(theta_W) follows from the gauge structure.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | 3 W bosons eat 3 Goldstones | 3 x 2 -> 3 x 3 DOF |
| C (EM) | B mixes with W^3 | Weinberg rotation |
| O (Strong) | Spectator | Unaffected |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| sin^2(theta_W) (tree) | 28/121 = 0.23140 | 0.23122(4) at M_Z | 0.08% | PDG 2024 |
| M_W | v*g/2 * kappa_V^(1/2) (with xi correction) | 80.3692(133) GeV | -- | CDF/ATLAS/LHCb combined |
| M_Z | M_W / cos(theta_W) | 91.1876(21) GeV | -- | LEP |
| M_W/M_Z | cos(theta_W) = sqrt(93/121) | 0.8769 | 0.04% | PDG 2024 |
| rho parameter | 1 (custodial SO(4) exact at tree level) | 1.00038(20) | -- | PDG 2024 |
| DOF: pre-EWSB | 4 x 2 + 4 = 12 | -- | -- | [I-MATH] |
| DOF: post-EWSB | 3 x 3 + 1 x 2 + 1 = 12 | -- | -- | [I-MATH] |

**What framework adds**: sin^2(theta_W) = n_d * Im_O / n_c^2 = 28/121 is a framework prediction at 0.08% from the measured value. The tree-level rho = 1 follows from the custodial SO(4) symmetry preserved in the coset SO(11)/[SO(4) x SO(7)], where SO(4) ~ SU(2)_L x SU(2)_R. The kappa_V = sqrt(117/121) correction to W/Z couplings is a testable BSM prediction. Mass values themselves require v [A-IMPORT].
**What is imported**: v = 246.22 GeV [A-IMPORT], gauge coupling values [A-IMPORT], radiative corrections to sin^2(theta_W) [A-IMPORT]
**Verification**: `weinberg_angle_investigation.py`, `ewsb_coupling_deviations.py` (20/20 PASS), `phase_transition_crystallization.py`
**Confidence**: [FRAMEWORK-CONSTRAINED] overall; [DERIVATION] for sin^2(theta_W) = 28/121

---

### Fermion Mass Generation (Yukawa from Partial Compositeness)

**Chain**: C2(EWSB) -> C9(fermion mass freezing) -> C3(Yukawa coupling stabilizes mass)
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Massless chiral fermions -> Massive fermions with m_f = y_f * v / sqrt(2)
- Tilt: Fermion coupling to the Higgs (pNGB) breaks chiral symmetry. In the composite Higgs picture, fermion masses arise through partial compositeness: elementary fermions mix with composite resonances.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Higgs VEV provides fermion mass | y_f coupling |
| C (EM) | Electromagnetic mass corrections | delta_m ~ alpha/pi |
| O (Strong) | QCD corrections to quark masses | Running from m_pole to m(mu) |
| R (Gravity) | Negligible at particle scale | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Fermion embedding | Spinorial (MCHM4) [D: S212] | -- (prediction) | -- | [D: 15 = 1+2+4+8 from div alg] |
| kappa_f (universal) | sqrt(1 - xi) = sqrt(117/121) | 1.00(3) | Consistent | LHC Run 2 |
| m_t (top) | y_t * v/sqrt(2) [A-IMPORT: y_t ~ 1] | 172.57(29) GeV | -- | PDG 2024 |
| m_p/m_e | 12*153 + 11/72 = 1836.1528 | 1836.15267343(11) | 0.06 ppm | CODATA 2018 |
| N_generations | Not derived (gap) | 3 | -- | Observation |
| nu_R prediction | SO(11) spinor 32 = 16 + 16' | -- (BSM prediction) | -- | [D: S212] |

**What framework adds**: The spinorial embedding [DERIVATION, S212] determines that fermions sit in the SO(11) spinor representation (32-dim), with 15 = 1 + 2 + 4 + 8 matching division algebra dimensions. This gives universal coupling modification kappa_f = kappa_V = sqrt(117/121), distinguishing from MCHM5. The 16' component predicts right-handed neutrinos (nu_R) as a structural consequence. Individual Yukawa couplings are NOT derived — this is the framework's major fermion gap. The m_p/m_e ratio is a separate [CONJECTURE] from pattern matching, not an EWSB derivation.
**What is imported**: Yukawa coupling values y_f [A-IMPORT], fermion masses [A-IMPORT], partial compositeness mechanism [I-MATH], RG running of quark masses [A-IMPORT]
**Verification**: `fermion_embedding_spinorial.py` (23/23 PASS), `ewsb_coupling_deviations.py` (20/20 PASS), `phase_transition_crystallization.py`
**Confidence**: [FRAMEWORK-CONSTRAINED] for mass generation mechanism; [DERIVATION] for spinorial embedding and kappa_f = kappa_V; gap for individual Yukawa couplings

---

## Summary

| Process | Tag | Framework Content | Gap |
|---------|-----|-------------------|-----|
| EWSB (coset structure) | [FRAMEWORK-DERIVED] | Gr(4,11), dim=28, Higgs=4 DOF, 24 colored pNGBs | xi = 4/121 mechanism ("why democratic?") |
| Higgs vacuum alignment | [FRAMEWORK-CONSTRAINED] | xi=4/121, kappa_V, kappa_f, kappa_lambda | CW potential coefficients not computed |
| W/Z mass generation | [FRAMEWORK-CONSTRAINED] | sin^2(theta_W) = 28/121, custodial SO(4), rho=1 | v = 246 GeV not derived |
| Fermion mass generation | [FRAMEWORK-CONSTRAINED] | Spinorial embedding, kappa_f=kappa_V, nu_R prediction | Yukawa couplings not derived |

**Overall**: 1/4 [FRAMEWORK-DERIVED], 3/4 [FRAMEWORK-CONSTRAINED]. This is the framework's strongest phase transition domain. The Gr(4,11) coset structure genuinely constrains the physics: it determines the Weinberg angle, the misalignment parameter, the Higgs doublet identification, and the coupling deviations. Key gaps: the "why democratic?" question (EQ-007), top Yukawa derivation (EQ-006), and the compositeness scale f from first principles (EQ-020).

**Cross-References**:
- Investigation: `crystallization/symmetry_breaking_chain.md` (CANONICAL)
- Investigation: `constants/higgs_vev_derivation.md`
- Sessions: S175 (Goldstone analysis), S210 (predictions), S212 (spinorial), S214 (kappa_lambda), S217 (Democratic Bilinear)
- Exploration Queue: EQ-004, EQ-006, EQ-007, EQ-020

---

*Created: 2026-02-03 (S229)*
