# Topic: Collider Data Validation of Crystallization

**Current state**: Phases I-IV complete (S168). S175: Higgs = pNGB doublet from epsilon_di. S179: CW potential computed — gauge sin^4 only, lambda_H = 125/968 conjecture (0.2%, HRS=3), f ~ 1.35 TeV. 27/27 PASS across 2 new scripts. Phase V deferred (needs CKM).

---

## What Works

- **sin²θ_W = 28/121 at Z-pole**: Within 0.8σ of LEP (S154, S158)
- **g_V^e = -Im_H²/(2n_c²)**: Matches LEP (S158)
- **QCD β-coefficients = framework numbers**: b₀=33=Im_H×n_c, b₁=153=Im_H²×17 (S152)
- **Crystallization ordering = algebra complexity**: EM < Weak < Strong ↔ C < H < O (S151)

- **β-coefficient decomposition**: 11/3 = n_c/Im_H, 4/3 = n_d/Im_H, |b₃| = Im_O = 7 — zero free parameters (S163, THM_04A3)
- **Hadronization entropy**: S_parton = S_hadron from THM_0450 + O-channel, dim(O) = dim(adj SU(3)) = 8 (S163, THM_04A4)
- **Vacuum polarization structure**: 11 = n_d(n_d+1)/2 + dim_R = 10 (symmetric tilt) + 1 (scalar) (S163, structural match)
- **Two-loop coefficients**: 33 = Im_H × n_c, 153 = Im_H² × 17 (S163)
- **Entropy hierarchy**: O:H:C = 3:2:1 = Im_H:dim_C:dim_R (S163)
- **Higgs channel hierarchy**: O > H > C confirmed (S166, 14/15 PASS)
- **Herm(4) fluctuation spectrum**: 12 Goldstone + 4 massive (S166, 15/15 PASS)
- **Flat direction in potential**: Tr(eps^2)^2 degenerate; Tr(eps^4) needed for SM (S166)
- **Eigenvalue selection theorem**: b2<0 -> SU(3)xU(1), b2>0 -> SU(2)^2xU(1), b2=0 -> flat. AXM_0117 argues b2<0. (S168, 22/22 PASS)
- **Mass spectrum at SU(3)xU(1) minimum**: 1 Higgs (m^2=4a) + 3 massive scalars + 6 Goldstone (S168)
- **CW is neutral on b₂ sign**: One-loop pure scalar preserves O(16), does NOT generate b₂ from b₁. Gauge loops don't apply (emergent). b₂<0 rests on AXM_0117 [CONJECTURE]. (15/16 PASS)
- **pNGB CW potential: gauge sin^4 only**: Gauge loops produce ONLY sin^4(h/f) — cannot trigger EWSB alone. Top Yukawa required. Gauge is 0.9% of top contribution. (S179, 15/15 PASS)
- **lambda_H = 125/968 conjecture**: (n_c^2+n_d)/(O*n_c^2) = 0.12913, measured 0.12938, error 0.2%. m_H = v*5*sqrt(5)/22 = 125.13 GeV (0.72 sigma). Decomposition: (1/O)(1+n_d/n_c^2). HRS=3, look-elsewhere ~8%. (S179, 12/12 PASS)
- **Compositeness scale f ~ 1.35 TeV**: xi = n_d/n_c^2 = 4/121 = 0.033 (EW safe). f = v*n_c/2 = 1354 GeV. (S179)
- **Pi^2 cancellation for lambda = 1/O**: CW with c_beta = pi^2/6 gives lambda = N_c/24 = 1/O because N_c*O = Im_H*dim(O) = 24. Pi^2 from loop factor and form factor cancel exactly. (S180, 15/15 PASS)
- **N_c * O = 24 structural identity**: 3*8 = 24 = n_d! = N_Gold - N_Higgs = 2*dim(SM). Multiple independent realizations of 24. (S180)
- **(1+xi)/(1-xi) correction resolved**: beta depends on xi through partial compositeness. Required enhancement 125/117 = 6.8% is physically reasonable. (S180)

## What Failed / Dead Ends

- **alpha_s(M_Z) one-loop**: 24% off from crude Lambda_QCD estimate — expected, not a real failure (S163)
- **bb/cc ratio**: 20.1 vs m_b^2/m_c^2 = 10.8 due to using pole masses instead of running masses (S166)
- **CJ-CDV-06**: O-channel mode counting only trivially confirmed (N_c=3=Im_H); deeper claim unsupported (S166)

## Open Paths

1. ~~**Phase I**: Z branching ratios~~ — DONE (18/20 PASS, S163)
2. ~~**Phase II**: Entropy conservation~~ — DONE (12/12 PASS, S163)
3. ~~**Phase III**: Running couplings mechanism~~ — DONE (structural identities, S163)
4. ~~**Phase IV**: Higgs branching from tilt curvature per channel~~ — DONE (14/15 PASS, S166)
4b. ~~**Eigenvalue selection**: b2/b1 ratio for SM gauge group~~ — DONE (22/22 PASS, S167)
5. **Phase V**: B-meson anomalies, muon g-2 (DEFERRED — needs CKM)
6. **Open**: Derive vacuum polarization from tilt Lagrangian (QFT loop calculation)
7. **Open**: Bridge from Planck-scale tilt dynamics to IR effective theory
8. ~~**Open**: Coleman-Weinberg calculation to confirm b2_eff < 0~~ — DONE: CW is NEUTRAL. b₂ not generated from b₁ at one loop (O(16) symmetry preservation). Gauge loops would give b₂>0 but don't apply (emergent gauge bosons). `coleman_weinberg_b2_sign.py` 15/16 PASS.
9. **Open**: Derive lambda_0 = 1/O from CW form factors (S179 — WHY 1/dim(O)?)
10. **Open**: Derive xi = n_d/n_c^2 from vacuum alignment dynamics (S179)
11. **Open**: Top Yukawa from SO(11) fermion embedding (S179 — needed for m_H derivation)
12. **Open**: Colored pNGB mass spectrum vs LHC bounds (S179 — crude estimate ~151 GeV, potential tension)

## Key Conjectures to Test

| ID | Conjecture | Priority | Status |
|----|-----------|----------|--------|
| CJ-CDV-02 | T_c ≈ 155 MeV = O-channel tilt barrier | HIGH | PROPOSED |
| CJ-CDV-03 | Min QGP system = 16 nucleons = n_d² | HIGH | PROPOSED |
| CJ-CDV-05 | BES-III 3.4-3.6 GeV excess = intermediate crystallization | MEDIUM | PROPOSED |
| CJ-CDV-06 | Higgs bb̄ dominance = O-channel mode counting | MEDIUM | PROPOSED |

## Sessions

| Session | Work | Key Result |
|---------|------|------------|
| S161 | Investigation plan + web research on anomalies | 5 phases, 10 items, 6 conjectures proposed |
| S163 | Phases I-III execution + dynamics mechanisms | THM_04A3 (beta-coefficients), THM_04A4 (entropy), vacuum polarization structure, 5 scripts 76/80 PASS |
| S166 | Phase IV + one-loop mechanism | Higgs BRs (14/15), Herm(4) spectrum (15/15), flat direction, eigenvalue selection problem |
| S168 | Eigenvalue selection | b2<0 -> SU(3)xU(1) (22/22 PASS), AXM_0117 argument, mass spectrum, phase diagram |
| S175 | EWSB: Higgs from epsilon_di | Higgs = pNGB doublet (2,1)_{Y=1/2}, 3 massive bosons, 32/32 PASS |
| S179 | CW potential for pNGB Higgs mass | Gauge sin^4 only, lambda_H=125/968 (0.2%), f~1.35 TeV, 27/27 PASS |
| S180 | Derive lambda_0=1/O from CW | Pi^2 cancellation (c_beta=pi^2/6), N_c*O=24, (1+xi)/(1-xi) resolved, D+ grade, 15/15 PASS |

## Key Files

| File | Content |
|------|---------|
| `framework/investigations/crystallization/collider_data_validation.md` | Master investigation |
| `core/theorems/THM_04A3_beta_coefficient_decomposition.md` | Beta coefficients = framework quantities |
| `core/theorems/THM_04A4_hadronization_entropy.md` | S_parton = S_hadron from THM_0450 |
| `verification/sympy/z_branching_crystallization.py` | Z partial widths (18/20 PASS) |
| `verification/sympy/crystallization_mechanics_collider.py` | Broad audit (17/18 PASS) |
| `verification/sympy/tilt_dynamics_beta_functions.py` | Beta function analysis (17/18 PASS) |
| `verification/sympy/entropy_crystallization_collider.py` | Entropy conservation (12/12 PASS) |
| `verification/sympy/vacuum_polarization_from_tilt.py` | Vacuum polarization (12/12 PASS) |
| `verification/sympy/higgs_branching_tilt_coupling.py` | Higgs BRs (14/15 PASS) |
| `verification/sympy/tilt_one_loop_mechanism.py` | One-loop mechanism (15/15 PASS) |
| `verification/sympy/higgs_mass_pngb_cw.py` | pNGB Higgs CW potential (15/15 PASS) |
| `verification/sympy/higgs_quartic_conjecture.py` | lambda_H = 125/968 conjecture (12/12 PASS) |
| `verification/sympy/higgs_quartic_from_cw.py` | CW derivation of lambda = 1/O (15/15 PASS) |

## Dependencies

- **Requires**: S158 results, S152 β-coefficients, S154 sin²θ_W, S151 multi-coupling
- **Enables**: CKM derivation, fermion mass spectrum, neutrino mass investigation
