# Inflation Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 234)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C1: Cosmic Crystallization, C7: Cosmological Phase Transitions)
**Layer**: Mixed (Layer 1 mathematics + Layer 2 correspondence + Layer 3 predictions)

---

## Disclaimer

This sub-catalog has **more framework content than most domains**. The hilltop potential and its slow-roll predictions (n_s, r, N_e) are [FRAMEWORK-DERIVED] from the crystallization potential. However, reheating is [STANDARD-RELABELED] (no framework mechanism), and the perturbation amplitude A_s requires V_0 which is NOT derived (gap). The tensor-to-scalar ratio r has two competing framework formulas: r = 7/200 = 0.035 (from C1, barely within BICEP/Keck limit) and r = 7/128 = 0.0547 (from Im_O/(8*n_d^2), IN TENSION with BICEP/Keck r < 0.036).

---

## Processes

### Slow-Roll Inflation (Hilltop Potential)

**Chain**: C1(all channels: epsilon rolls from 0 toward epsilon*)
**Tag**: [FRAMEWORK-DERIVED]

**Before -> After**:
- Physical: Symmetric vacuum (epsilon = 0) -> inflating spacetime with slowly decreasing Hubble rate -> graceful exit at N_e ~ 52 e-folds
- Tilt: Hilltop instability. Tilt matrix begins at maximum of V(epsilon) = V_0(1 - epsilon^2/mu^2). Quantum fluctuation nucleates first distinction. Slow roll down potential gives inflation. Field traverses super-Planckian distance in field space (hilltop regime).

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Inactive during inflation | — |
| C (EM) | Inactive during inflation | — |
| O (Strong) | Inactive during inflation | — |
| R (Gravity) | Dominant: drives exponential expansion via H^2 = V/(3 M_Pl^2) | de Sitter-like |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| mu^2 | (C+H)*H^4/Im_O = 1536/7 [D] | — (not directly measurable) | — | [D: from div alg] |
| n_s | 193/200 = 0.9650 [D] | 0.9649 +/- 0.0042 | 0.024 sigma | Planck 2018 |
| r (C1 formula) | 7/200 = 0.035 [D] | < 0.036 (95% CL) | Within limit | BICEP/Keck 2021 |
| r (alt formula) | 7/128 = 0.0547 [CONJECTURE] | < 0.036 (95% CL) | **IN TENSION** | BICEP/Keck 2021 |
| N_e (e-folds) | ~52 [D] | 45-70 (acceptable range) | Within range | CMB + reheating |
| dn_s/d(ln k) | -7/40000 = -0.000175 [D] | -0.0045 +/- 0.0067 | 0.65 sigma | Planck 2018 |

**What framework adds**: The hilltop potential V(epsilon) = V_0(1 - epsilon^2/mu^2) is derived from the crystallization tendency (AXM_0117). The curvature mu^2 = (C+H)*H^4/Im_O = 1536/7 is fixed by division algebra dimensions with NO free parameters. This gives n_s = 193/200 (0.024 sigma from Planck) and the spectral running dn_s/d(ln k) = -7/40000. The potential form is genuinely derived, not imported.

**What is imported**: V_0 (inflationary amplitude, not derived — gap EQ-011), slow-roll formalism [A-IMPORT], Planck mass [A-IMPORT], standard perturbation theory [A-IMPORT]

**Key Gap**: The tensor-to-scalar ratio has two competing formulas within the framework. The C1 entry gives r = 7/200 = 0.035 (consistent with BICEP/Keck). The alternative formula r = Im_O/(8*n_d^2) = 7/128 = 0.0547 violates BICEP/Keck r < 0.036 at 95% CL. CMB-S4 (~2028) will be definitive. This is a live falsification pressure point.

**Verification**: `cosmological_crystallization.py` (tests 1-3, 5: mu^2, n_s, r, dn_s)
**Confidence**: [FRAMEWORK-DERIVED] for potential and n_s; [CONJECTURE] for nucleation trigger; r formula ambiguity unresolved

---

### Reheating and Preheating

**Chain**: C1(end of slow roll) -> C2(symmetry breaking begins) -> C7(thermalization)
**Tag**: [FRAMEWORK-CONSTRAINED] (upgraded S243: g_* from framework particle content)

**Before -> After**:
- Physical: Inflaton oscillations at bottom of potential -> particle production via parametric resonance (preheating) and perturbative decay (reheating) -> thermal plasma at T_rh
- Tilt: Post-inflation tilt oscillations. Epsilon oscillates near epsilon* and radiates energy into all channels (H, C, O, R). Preheating corresponds to explosive tilt energy transfer via parametric resonance. Thermalization completes when all channels reach equilibrium.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Activated: receives energy from inflaton decay | Weak bosons |
| C (EM) | Activated: photon production | Photon + charged leptons |
| O (Strong) | Activated: quark-gluon plasma forms | Quarks + gluons |
| R (Gravity) | Subdominant after inflation ends | Graviton production negligible |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| T_rh (reheat temp) | Not derived | Unknown (> 1 MeV for BBN) | — | Gap |
| Preheating timescale | Not derived | Model-dependent | — | Gap |
| g_*(T_rh) | 106.75 [FRAMEWORK-CONSTRAINED] | 106.75 | — | N_c=3, N_nu=3 in DOF count |

**What framework adds**: The effective number of relativistic degrees of freedom g_* = 106.75 is framework-constrained. The calculation: bosonic DOF = 28 (including N_c^2-1 = 8 gluons × 2 = 16 from [D: Im_H=3]) + 7/8 × fermionic DOF = 90 (including 6 × N_c × 4 = 72 quark DOF from [D: N_c=Im_H=3] and N_nu × 2 = 6 neutrino DOF from [D: N_nu=Im_H=3]). g_* = 28 + 78.75 = 106.75. For N_c=4, g_* would be 141.75 — the SM value is N_c-dependent. Reheating dynamics itself is not derived.
**What is imported**: All reheating dynamics [A-IMPORT], parametric resonance theory [A-IMPORT], thermalization physics [A-IMPORT], DOF counting formula [A-IMPORT]
**Verification**: `near_miss_batch_upgrades.py` (tests 1-5: g_* DOF breakdown, N_c sensitivity)
**Confidence**: [FRAMEWORK-CONSTRAINED] for g_* via N_c and N_nu; [STANDARD-RELABELED] for reheating dynamics

---

### Primordial Perturbation Spectrum

**Chain**: C1(quantum fluctuations during slow roll) -> C4(collapse at horizon exit) -> C17(seeds structure)
**Tag**: [FRAMEWORK-DERIVED] for n_s; [CONJECTURE] for A_s (requires V_0)

**Before -> After**:
- Physical: Quantum vacuum fluctuations -> classical density perturbations with nearly scale-invariant spectrum P(k) = A_s (k/k_*)^(n_s - 1)
- Tilt: Quantum tilt fluctuations during C1 inflation. At horizon crossing, fluctuations undergo C4 (collapse/decoherence) and become classical. The spectrum tilt n_s - 1 < 0 reflects the slow decrease in Hubble rate as epsilon rolls. Framework-derived: n_s = 193/200 from hilltop potential shape.

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Inactive | — |
| C (EM) | Inactive | — |
| O (Strong) | Inactive | — |
| R (Gravity) | Dominant: both scalar (curvature) and tensor (GW) perturbations | Scalar P_s(k) + Tensor P_t(k) |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| n_s (scalar index) | 193/200 = 0.965 [D] | 0.9649 +/- 0.0042 | 0.024 sigma | Planck 2018 |
| A_s (amplitude) | Requires V_0 [GAP] | (2.10 +/- 0.03) x 10^-9 | — | Planck 2018 |
| r (tensor/scalar) | 7/200 or 7/128 [AMBIGUOUS] | < 0.036 | See C1 | BICEP/Keck 2021 |
| dn_s/d(ln k) (running) | -7/40000 [D] | -0.0045 +/- 0.0067 | 0.65 sigma | Planck 2018 |
| n_t (tensor index) | -r/8 ~ -0.004 [I: consistency relation] | Not measured | — | Future |

**What framework adds**: The spectral index n_s = 193/200 is a genuine framework prediction from the hilltop potential with mu^2 = 1536/7. The running dn_s/d(ln k) = -7/40000 is also predicted. However, the amplitude A_s requires V_0 which is NOT derived (gap EQ-011, blocked by EQ-020). Without A_s, the normalization of the power spectrum is imported.

**What is imported**: V_0 (inflationary energy scale) [A-IMPORT/GAP], standard perturbation theory [A-IMPORT], consistency relation n_t = -r/8 [A-IMPORT from slow-roll]
**Verification**: `cosmological_crystallization.py` (tests 2, 11: n_s and spectral running)
**Confidence**: [FRAMEWORK-DERIVED] for n_s and dn_s; [GAP] for A_s; [AMBIGUOUS] for r (two formulas, one in tension)

---

*Created: 2026-02-03 (S234 — Phase 6: cosmological processes)*
*Verification: `verification/sympy/cosmological_crystallization.py` (16/16 PASS)*
