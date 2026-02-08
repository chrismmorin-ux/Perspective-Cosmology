# CMB Physics — Multi-Session Topic File

**Created**: Session 191, 2026-02-02
**Last Updated**: Session 237, 2026-02-03

---

## What Works

### Derived (high confidence)
- **n_s = 193/200 = 0.965** — from hilltop inflation with μ² = 1536/7 [DERIVED]
- **r = 7/200 = 0.035** — from r = 1 - n_s, within BICEP/Keck bound [DERIVED]
- **N ~ 52 e-folds** — from μ² value [DERIVED]
- **μ² = 1536/7** — from (C+H)·H⁴/Im_O [DERIVED]
- **SO(11) breaking chain** — 4-stage crystallization maps to cosmological epochs [DERIVATION]
- **43 Goldstone modes** — exact group theory: 28 + 7 + 6 + 2 [DERIVED]
- **Higgs as pNGB** — 4 DOF from 28 Stage-1 Goldstones, singlet fraction 1/7 [DERIVATION]
- **Peak positions** — 7 peaks within 4.2% from simple model [PARTIAL]
- **Blind predictions P-010 to P-016** — 6/7 within 1σ (S138b)
- **r_s = 144.48 Mpc** — from standard GR integral with framework params (0.03% from Planck) [DERIVED, S198]
- **r_d = 147.06 Mpc** — drag epoch integral (0.02% from Planck) [DERIVED, S198]
- **l_A = 301.47** — confirmed by cosmological integrals (0.04% from 96*pi) [DERIVED, S198]
- **theta_s = 0.01042** — angular sound horizon (0.095% from Planck) [DERIVED, S198]

### Conjectured (pattern matches, unproven)
- H₀ = 337/5 = 67.4 km/s/Mpc — [CONJECTURE, HRS~5]
- Ω_b/Ω_m = 9/58 — [CONJECTURE, from Im_H²/(Im_O²+Im_H²)]
- **Ω_m = 63/200 = 0.315** — DERIVED from dual-channel HS equipartition [DERIVATION conditioned on I-STRUCT-5, S293]. 63 generators (su(4)+su(7)) are a SUBSET of the 137 interface generators, contributing to BOTH channels. 74×1 + 63×2 = 200 total contributions. Schur's lemma: equal weight per contribution. 0.04 sigma from Planck. No new assumption beyond I-STRUCT-5. EQ-002/EQ-003 duality: both follow from "physical quantities = HS-metric-weighted mode counts." n_c=11 unique.

### Falsified (S198)
- ~~η_* = 337 Mpc~~ — actual integral gives 280.40 Mpc (16.8% off) [F-8]
- ~~c_s = 3/7~~ — effective average is 0.515, standard c_s(z*) = 0.454 (20% off) [F-9]
- ~~r_s = 337 × 3/7~~ — decomposition was compensating errors; correct r_s comes from standard integral [F-8+F-9]

## What Failed

- **S191**: All 4 paths to derive c_s = 3/7 failed (DOF ratio, tilt decomp, standard formula, channel weight)
- **S191**: All 4 paths to derive V₀ failed (democratic, tilt potential, expression search, mode counting)
- **S133**: V_eff with b = M_Pl⁴ falsified — replaced by b = α·M_Pl⁴
- **S198**: η* = 337 FALSIFIED by cosmological integral (actual 280 Mpc)
- **S198**: c_s = 3/7 FALSIFIED by integral ratio (effective 0.515)
- **S198**: d_C/r_s = 96 is generic LCDM (Planck best-fit also gives 96.09)

## Open Paths

### Critical Gaps
1. **G-CMB-V0**: V_0 (inflationary amplitude) — **S295 candidate**: V_0 = alpha^4/C * M_Pl^4 [CONJECTURE, HRS 5]. A_s 0.41% off (0.29 sigma). Same C=24/11 as alpha correction. Needs derivation mechanism.
2. **G-CMB-RS-DERIVE**: r_s works via standard integrals — but WHY do Om_m=63/200 and Om_b=567/11600 give this?

### Resolved Gaps
- ~~G-CMB-CS~~: c_s = 3/7 FALSIFIED (S198). Standard c_s applies. No framework modification needed.
- ~~G-CMB-ETA~~: η* = 337 FALSIFIED (S198). Actual η* = 280 Mpc from integral.

### Secondary Gaps
3. Stage 2-3 energy scales
4. N_eff from Goldstone thermalization
5. Colored scalar masses
6. Optical depth τ
7. σ₈

### Resolved Questions (S199)
- **l_2 peak error (3.1%) resolved**: Standard baryon loading (separate phi_odd/phi_even) reduces to 0.74%. Not a framework gap — it's standard physics. phi_odd = 3/11 = Im_H/n_c confirmed to 0.4%.
- **Om_m/Om_b algebraic structure**: Extensive documentation (S94-126). 63 = O²-1 = Im_O x Im_H², 200 = O x (R+H)², Om_b/Om_m = 9/58. Status: [CONJECTURE] — mechanism unknown.

### Remaining Key Questions
- ~~Can Om_m = 63/200 be derived from a physical mechanism?~~ **S293: YES** — dual-channel HS equipartition [DERIVATION]. Remaining: "why now" problem (standard cosmological coincidence) and [A-PHYSICAL] identification of internal generators with matter.
- Is there a framework expression for V₀/M_Pl⁴ ~ 1.3 × 10⁻⁹?
- **Triple formula** (S288): 63/200 favored over 6/19. 63/200 has End(V) structural support; 6/19 is pattern-matching only. Both within Planck 1σ (differ by 0.08%).
- **"Why now" problem** (S288): Formula gives static ratio; Ω_m varies with z. Same as standard cosmic coincidence problem.

## Session List

| Session | Focus | Outcome |
|---------|-------|---------|
| 131-134 | CMB Phases 1-3 | Initial parameter derivation, peak heights, Silk damping |
| 135 | ΛCDM deviations | 10 deviations cataloged, r = 0.035 key test |
| 137-139 | CMB Phases 4.1-4.4 | Blind predictions (6/7 within 1σ), polarization, secondary anisotropies |
| 142 | Phase 5.1: Full power spectrum | Semi-analytic model, 24/24 PASS |
| 170 | Phase 5.2: Statistics | Monte Carlo: blocks NOT special, P_blind ~ 2.5e-7 |
| 191 | "What IS the CMB?" synthesis | 4 scripts (110/110 PASS), 8 gaps documented, synthesis written |
| 198 | CMB integrals + d_C/r_s investigation | eta*=337 & c_s=3/7 FALSIFIED. r_s CONFIRMED (0.03%). d_C/r_s=96 generic LCDM. Dashboard updated. |
| 237 | EQ-002: Omega_m mechanism | 63=su(4)+su(7)=su(8) [CONJECTURE]. Crystallization gaps too large for mechanism. Triple formula quantified (0.12%). 12/12 PASS. |
| 288 | EQ-002 + EQ-003 duality | Unified origin 200=137+63 from End(R^{n_c}). EQ-002/EQ-003 duality. 63=27(gauge)+36(symmetric). Band D. 16/16 PASS. |
| 293 | EQ-002: Equipartition mechanism | **Omega_m = 63/200 DERIVED** from dual-channel HS equipartition [DERIVATION]. 63 dual-role generators, 74 interface-only. Killing fails. 15/15 PASS. |
| 295 | EQ-011: V_0 amplitude search | V_0 = alpha^4/C candidate [CONJECTURE, HRS 5]. A_s 0.41% off. Same C=24/11 as alpha correction. 23/24 PASS (2 scripts). |

## Key Files

| File | Purpose |
|------|---------|
| `framework/investigations/cosmology/cmb_framework_interpretation.md` | **Master synthesis** |
| `framework/investigations/cosmology/hilltop_inflation_canonical.md` | Inflation derivation |
| `framework/investigations/cosmology/so11_cosmological_epochs.md` | Epoch mapping |
| `framework/investigations/cosmology/sound_speed_crystallization.md` | c_s investigation |
| `framework/investigations/cosmology/inflationary_amplitude_v0.md` | V₀ investigation |
| `framework/investigations/cosmology/sound_horizon_derivation.md` | r_s claim |
| `framework/investigations/cosmology/dC_rs_ratio_investigation.md` | d_C/r_s = 96 investigation |
| `framework/investigations/cosmology/full_power_spectrum.md` | Peak analysis |

## Scorecard

| Category | Count |
|----------|-------|
| Derived parameters | 11 |
| Imported parameters | 6 |
| Conjectured values | 2 |
| Falsified | 3 |
| Open gaps | 7 |
| Total verification tests | 148 |
