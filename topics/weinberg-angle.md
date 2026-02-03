# Topic: Weinberg Angle

**Current state**: 7% discrepancy RESOLVED (scale confusion). 28/121 between MS-bar and LEP effective. SU(3) mode test (S218): N_charged=94 FAILS, only dim(SU(3))=8 works. **Structural theorem**: T_SU2 = T_SU3 = 22 (one-loop gives α₂=α₃, WRONG). Coupling ratio α₃/α₂ = 7/2 at 0.34%. Gap refined to: "why two regimes (coset dim for EW, group dim for strong)?" Two counting regimes confirmed (EW: Goldstone, Strong: group dim).

---

## What Works

- **sin^2(theta_W) = 28/121 = 0.23140** — matches MS-bar at M_Z to 843 ppm (S151, S154)
- **28 = N_Goldstone(SO(11)->SO(4)xSO(7))** — structural origin proven (S154)
- **cos(theta_W) = 171/194** — matches on-shell definition to 3.75 ppm (established)
- **Two-scheme consistency**: MS-bar vs on-shell scheme difference agrees to 2.4% (S154)
- **Uniqueness**: 28/121 is unique among ALL framework ratios in search space (S154)
- **RG scale**: 28/121 matches SM running at mu = 94.6 GeV, near M_Z (S155)
- **x(1-x) form**: sin^2 = (n_d/n_c)(1-n_d/n_c) = Bernoulli variance with p=4/11 (S154)
- **7% discrepancy RESOLVED**: 1/α₂ = (28/121) × 127.955 = 29.61, 0.07% from measured (S160)
- **Scheme identification**: 28/121 between MS-bar (800 ppm) and LEP effective (540 ppm) (S160)
- **O = dim(SU(3)) structural**: via G2 = Aut(O) fixing complex direction (S160)
- **α₃/α₂ = n_d×Im_O/dim(O) = 7/2 = 3.500** — matches measured 3.488 to 0.34%, zero free parameters (S218)
- **T_SU2 = T_SU3 = 22** — structural theorem: both gauge groups have identical Dynkin indices in End(V). Follows from T(fund SO(4) under SU(2)) = T(fund G₂ under SU(3)) = 1. Proves one-loop gives wrong answer. (S218)

## What Failed / Dead Ends

- **Running reconciliation**: sin^2 INCREASES with energy. Both 28/121 and 29/126 are EW-scale predictions, not related by running. (S155 — FALSIFIED)
- **Correction term search**: No clean framework correction to 28/121 found. -n_d/(n_c^2*Phi_6) gives 445 ppm (worse). (S154)
- **29/126 from induced mechanism**: Alternative formula from charge-weighted sums. Slightly worse precision (0.45% vs 843 ppm). (S153)
- **Standard one-loop derivation of democratic counting**: Dynkin indices give T_L=T_R=15 → sin²=1/2 or 3/8, NOT democratic. Cannot derive 1/g_i² ~ N_i from perturbative QFT. (S160 — NEGATIVE RESULT). **Upgraded S218**: T_SU2 = T_SU3 = 22 exactly → one-loop predicts α₂ = α₃ (wrong by 3.5×). Perturbative approach is provably wrong.
- **Democratic counting for SU(3)**: N_SU3_charged = 94 modes in End(V) gives α₃/α₂ = 28/94 = 0.298, WRONG DIRECTION (predicts α₃ < α₂). Naive democratic extension falsified. Only N=8=dim(SU(3)) works. (S218 — NEGATIVE RESULT)
- **HS metric argument**: The HS inner product from AXM_0110 is a universal rescaling (all modes get factor 1/n_c). Cannot change coupling RATIOS like sin²θ_W. The one-loop commutator [A_μ,M] introduces Dynkin-index weighting regardless of scalar field metric. (S215 — DEAD END)
- **Coset geometry alone**: dim(coset)/dim(SO(11)) = 28/55 ≠ sin²θ_W. The denominator must be dim(End(V)) = 121, not dim(SO(11)) = 55. Coset provides numerator but needs eval map for denominator. (S215 — PARTIAL)

## Open Paths

1. ~~**Task B — Derive S_2=29**~~ **DONE (S159)**: Complex Bridge principle gives S_2 = H_pure + CH_cross + CO_cross = 9 + 6 + 14 = 29.
2. ~~**Task D — Correction terms**~~ **DONE (S159)**: Corrections exist but NOT analogous to 4/111 (HRS=5).
3. ~~**Task E — GUT trace**~~ **DONE (S158)**: Gives 1/2 or 3/8, never 28/121.
4. **[HIGH] Democratic counting mechanism**: Gap narrowed (S215/S217): WHY does each crystal mode contribute equally (1) rather than proportionally to its Dynkin index (T_i)? Eval map gives natural formula sin^2 = dim(Hom(W^perp,W))/dim(End(V)) = 28/121. **S217 unification**: same mechanism gives xi = n_d/n_c^2 = 4/121 (Higgs vacuum alignment). Both from Bernoulli p = 4/11. Four candidate resolutions: (i) non-perturbative from first-order transition, (ii) lattice discreteness, (iii) information-theoretic, (iv) emergent gauge field. None proven. See `framework/investigations/gauge/democratic_bilinear_principle.md`.
5. **[HIGH] Two-regime mechanism** (EQ-007 REFINED, S218): Why does SU(2) use coset dim (28) and SU(3) use group dim (8)? Partial answer: coset homogeneity + first-order transition for SU(2); octonion dim for SU(3). Not derived. The crossover at 1/α ~ 10 (~5 TeV) also needs a physical mechanism.
6. ~~**SU(3) mode counting test**~~ **DONE (S218)**: N_SU3_charged = 94 FAILS. Only dim(SU(3)) = 8 works. Structural theorem T_SU2 = T_SU3 = 22 discovered. Two-regime confirmed.
7. **[MEDIUM] T_fund = 1 deeper meaning**: Both T(fund SO(4) under SU(2)) and T(fund G₂ under SU(3)) equal 1. Coincidence of n_d=4 and Im_O=7, or division algebra structure? (S218)

## Sessions

| Session | Work | Key Result |
|---------|------|------------|
| S151 | Per-sector tilt angles | sin^2 = 28/121 (0.08%) first derived |
| S153 | Unify 5C+5D | Alternative: 29/126 (0.45%), denominator tension |
| S154 | Deep adversarial investigation | 28=N_Goldstone, unique, scheme consistency |
| S155 | Running reconciliation test | FALSIFIED — both are EW-scale, running goes wrong way |
| S158 | GUT trace + crystallization | GUT trace CLOSED, democratic mode counting proposed |
| S159 | S_2=29 + corrections | Complex Bridge principle, 4/111 unique |
| S160 | Scheme ID + gap analysis | 7% RESOLVED, 28/121 near LEP eff, two counting regimes |
| S215 | Coset geometry: three paths | Path A (HS metric) DEAD END, Path B (coset) PARTIAL, Path C (democratic) PROMISING. Gap narrowed to "why democratic?" 15/15 PASS. |
| S217 | Mass scale f: democratic bilinear | **Unification**: xi=4/121 and sin^2=28/121 both from End(V)=121 democratic counting. Bernoulli p=4/11. Connects EQ-004/EQ-007/EQ-020. 35/35 PASS. |
| S218 | SU(3) mode counting test | **N_charged=94 FAILS**, only dim(SU(3))=8 works. **Structural theorem T_SU2=T_SU3=22**. α₃/α₂=7/2 at 0.34%. Gap refined to "why two regimes?" 15/15 PASS. |

## Key Files

| File | Content |
|------|---------|
| `framework/investigations/alpha/multi_coupling_tilt_angles.md` | 24 findings (S151-S160) |
| `verification/sympy/weinberg_121_vs_126_running.py` | 17/17 PASS (S155) |
| `verification/sympy/weinberg_angle_investigation.py` | 14/14 PASS (S154) |
| `verification/sympy/per_sector_induced_couplings.py` | 15/15 PASS (S153) |
| `verification/sympy/per_sector_tilt_angles.py` | 15/15 PASS (S151) |
| `verification/sympy/democratic_counting_gap_analysis.py` | 17/17 PASS (S160) |
| `verification/sympy/weinberg_scheme_identification.py` | 12/12 PASS (S160) |
| `verification/sympy/strong_coupling_counting_analysis.py` | 15/15 PASS (S160) |
| `framework/investigations/crystallization/symmetry_breaking_chain.md` | SO(11) breaking chain |
| `verification/sympy/coset_geometry_three_paths.py` | 15/15 PASS (S215) |
| `verification/sympy/xi_democratic_bilinear.py` | 15/15 PASS (S217) |
| `framework/investigations/gauge/democratic_bilinear_principle.md` | Unified principle: xi + sin^2 from End(V) |
| `verification/sympy/su3_mode_counting_test.py` | 15/15 PASS (S218) |
