# Topic: Weinberg Angle

**Current state**: 7% discrepancy RESOLVED (scale confusion). 28/121 between MS-bar and LEP effective. Standard one-loop cannot derive democratic counting — coset volume fraction is best candidate. Two counting regimes identified (EW: Goldstone, Strong: group dim).

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

## What Failed / Dead Ends

- **Running reconciliation**: sin^2 INCREASES with energy. Both 28/121 and 29/126 are EW-scale predictions, not related by running. (S155 — FALSIFIED)
- **Correction term search**: No clean framework correction to 28/121 found. -n_d/(n_c^2*Phi_6) gives 445 ppm (worse). (S154)
- **29/126 from induced mechanism**: Alternative formula from charge-weighted sums. Slightly worse precision (0.45% vs 843 ppm). (S153)
- **Standard one-loop derivation of democratic counting**: Dynkin indices give T_L=T_R=15 → sin²=1/2 or 3/8, NOT democratic. Cannot derive 1/g_i² ~ N_i from perturbative QFT. (S160 — NEGATIVE RESULT)

## Open Paths

1. ~~**Task B — Derive S_2=29**~~ **DONE (S159)**: Complex Bridge principle gives S_2 = H_pure + CH_cross + CO_cross = 9 + 6 + 14 = 29.
2. ~~**Task D — Correction terms**~~ **DONE (S159)**: Corrections exist but NOT analogous to 4/111 (HRS=5).
3. ~~**Task E — GUT trace**~~ **DONE (S158)**: Gives 1/2 or 3/8, never 28/121.
4. **[HIGH] Coset volume fraction mechanism**: The ONLY surviving candidate for deriving sin² = 28/121 non-perturbatively. Standard one-loop gives Dynkin indices (sin²=1/2 or 3/8). Need: dynamics argument for why gauge couplings couple to geometric volume fractions (dim(coset)/dim(config)) rather than trace-weighted sums.
5. **[MEDIUM] Two-regime crossover physics**: Why does EW use Goldstone counting and strong use group dimension? The crossover at 1/α ~ 10 (~5 TeV) needs a physical mechanism.

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
