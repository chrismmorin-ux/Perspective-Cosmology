# Topic: Step 5 Alpha Mechanism

**Current state**: **D_3 derivation attempted** (S347). Three routes (VEV counting [PLAUSIBLE], alternating signs [CONSISTENT], 2D sigma model [CONTEXTUAL]) converge on D_3=1 but do NOT prove it. C_2 = k*(n-k-1)/n Grassmannian formula. Phase 3 propagated (PROP-027). 23/23 PASS (S347), 24/24 PASS (S344), 43/43 PASS (S341), 36/36 PASS (S337). Next: 2-loop CW potential on coset for genuine D_3 derivation.

---

## What Works

- **Step 5D (crystallization branching)**: Born rule + democratic excitation -> P(EM)=1/137. Grade C-. (S148)
- **Step 5C (induced mechanism)**: ln(Lambda/mu)=137pi/21 with 21=Im_H*Im_O. Corrected coefficient. (S147, S149)
- **Step 5F (single-photon tilt)**: THM_04A2. Clearest physical picture. Born rule on 137 modes. (S164)
- **5C+5D unification**: Per-sector induced couplings give S_EM=126, S_2=29, S_3=8. (S153)
- **S = N_I - n_c = 126**: Derivable from traceless charges + maximization (S147)
- **21 = Im_H*Im_O**: Correct scalar coefficient (1/6pi per complex scalar, not 1/3pi). (S149)
- **Five democracy arguments**: Born rule+symmetry, max entropy, generic tilt, excitation vs VEV, transitivity. (S148)
- **Gaussian convention**: Framework coupling is algebraic, no 4pi. (S148)
- **Irrep decomposition**: V_pi = 1+15+1+120, Schur gives intra-block uniformity. (S165)
- **Killing metric RULED OUT**: Gives 1/alpha=126.8, off by 7.5%. Counting metric matches. (S165)
- **Counting metric = HS inner product**: Derived from AXM_0110, not structural. All 137 generators have unit HS norm. (S165)
- **Gap G2 CLOSED**: Cross-block uniformity derived from AXM_0110 via Hilbert-Schmidt. (S165)
- **WF noise UNIQUE**: Wright-Fisher is the only degree-2 face-invariant exchangeable covariance on the simplex. (S173)
- **Born rule ROBUST**: Holds for any noise amplitude h(p), not just WF. u''=0 argument. (S173)
- **Degree-3 corrections exist**: Don't affect Born rule. Full characterization. (S173)
- **THM_0491 -> CANONICAL**: Proof complete (AXM_0109+0110+0113+THM_0485). `hilbert_unitary_chain.py` 18/18 PASS.
- **THM_0493 -> DERIVATION**: CR-037 resolved. Automatic continuity in U(n_d) (Weil 1940). Sign convention corrected. 18/18 PASS.
- **Born rule well-founded**: THM_0494 no longer conditional on SKETCH foundations.
- **DE-009 scope clarified** (S297): DE-009 blocks Sub-problem B (photon=democratic mode) but NOT Sub-problems A+C (WSR/HS approach). No hidden obstruction.
- **kappa=1 = standard Tr convention** (S297): WSR+Schur gives 1/g^2 = kappa*N_i. Standard (unnormalized) HS = Tr(A^dag B) gives kappa=1. Natural mathematical default.
- **EQ-002/EQ-003 duality** (S297): kappa=1 gives BOTH alpha=1/137 AND Omega_m=63/200. Two predictions from one parameter.
- **Sigma model constraint** (S297): sum(Q^2)_coset=14 (scalar charges), S_EM=126 (generator charges). Factor 9 gap. C=24/11 consistent.
- **Step 15 upgraded**: [CONJECTURE] -> [A-STRUCTURAL within I-STRUCT-5] (S297). Alpha chain: 0+1+0.
- **CCWZ Phase 1 COMPLETE** (S337): Full SO(11)/SO(4)xSO(7) setup. 36/36 PASS. Two Q_EM conventions: defect-only (sum Q^2=14, integer charges) vs full SM with T_X (sum Q^2=50/3, fractional charges). Higgs charges {+1,0,0,-1} identical in both. Gauge boson mass: W massive, photon/gluons/T_X massless.
- **CCWZ Phase 2 COMPLETE** (S341): VEV corrected to h0=(T_{0,4}-T_{2,4})/sqrt(2) [THEOREM]. T_{0,4} alone breaks U(1)_EM. CW potential (gauge loops -> Higgs potential) is DIFFERENT from alpha C_2 (structural EM counting). C_2=24/11 from defect charges [DERIVATION]. Beta functions (7/3 defect, 25/9 full) differ from C_2. 43/43 PASS.
- **CCWZ Phase 3 COMPLETE** (S344): Defect charge selection THEOREM: [T_X, T_{a,4}]=0 for all Higgs pNGBs. D_3=1 [CONJECTURE]: full formula 1/alpha=15211/111-(24/11)*alpha^2/pi+alpha^3/pi. Prediction: 137.035999177, 0.0006 sigma from CODATA. All coefficients RATIONAL in D_n basis. 24/24 PASS.

## What Failed / Dead Ends

- **DE-009**: Democratic superposition as photon ID (S145 — structural incompatibility with breaking)
- **DE-010**: Sigma model / HLS (S149 — VEV mismatch by factor 2e6)
- **DE-011**: UV democracy / RG running (S149 — running goes wrong direction)
- **Path 3 (UV democracy)**: 4/111 is structural, not from running (S149)
- **Weyl coefficient error**: S147 used 1/(3pi), correct is 1/(6pi). Changes 42->21. (S149)

## What Failed / Clarified

- **"Generic -> uniform" from symmetry alone**: DOES NOT WORK. Schur gives 3 free params, not 0. (S165)
- **Random pure state argument**: DOES NOT WORK. Beta(1,136) has 99% relative std. (S165)
- ~~**Counting metric is structural**~~: RESOLVED — derived from AXM_0110 via HS inner product. (S165)
- **Critical equipartition**: RULED OUT (S211) — SO(11) transition is first-order (no WF fixed point for N>=4, discriminant < 0). All modes NOT equally excited at transition.
- **HS metric for democratic counting**: RULED OUT (S215) — HS inner product is universal rescaling, cannot change coupling RATIOS. Commutator [A,M] still gives Dynkin indices at one loop.

## Open Paths

1. ~~**CCWZ Phase 3**~~: RESOLVED (S344) — D_3=1, 0.0006 sigma. Defect charges THEOREM.
2. ~~**D_3 derivation attempt**~~: INVESTIGATED (S347) — Three routes converge on D_3=1 but don't prove it. Multi-route plausibility, not derivation.
3. **Derive D_3 from 2-loop CW potential**: Need explicit CW calculation on SO(11)/SO(4)xSO(7) with VEV. Or: compute Gr(4,11) Casimir at 4th order for Wegner's 3-loop beta. (S347)
3. **Derive scale ratio**: exp(137pi/21) ~ 8e8. Notable: v_EW*12*N_I ~ m_e*exp(137pi/21) to 0.5%. (S149)
4. **Why no bare kinetic term**: Show EM gauge field is purely induced (Sakharov mechanism). (S149)
5. **Correction terms**: 4/111 for EM is established. Find analogues for alpha_2, alpha_s. (S155)
6. **S_2=29 derivation**: From SO(11) representation theory. (S155 Task B)
7. ~~**Derive counting metric**~~: RESOLVED (S165) — Path C: counting metric = HS inner product from AXM_0110.

## Sessions

| Session | Work | Key Result |
|---------|------|------------|
| S141 | Adversarial scorecard | 8 steps graded, Step 5 = D+ |
| S145 | Sub-problems A, B, C | B closed (DE-009), category mismatch identified |
| S146 | Dimensionless geometry | alpha=cos^2(theta_cryst)=1/137 |
| S147 | Composite gauge field | S=126 derivable, one scale undetermined |
| S148 | Photon emission = crystallization | Step 5D, Born rule mechanism, grade C- |
| S149 | Coefficient correction | Factor-2 fix, sigma model + UV democracy falsified |
| S153 | Unify 5C+5D | Per-sector couplings, denominator tension |
| S164 | THM_04A2 formalized | SKETCH, 5 mechanism categories, falsification criteria |
| S165 | Gap G2 CLOSED | Irrep decomposition + HS derivation: counting metric [D from AXM_0110], regime resolved |
| S173 | Born rule uniqueness + robustness | WF UNIQUE at degree 2, Born rule robust to noise amplitude, 37/37 PASS |
| S211 | Democratic counting mechanism triage | Critical equipartition RULED OUT (first-order transition). Coset geometry ONLY remaining path. Eval map convergence noted (28/121). |
| S215 | Coset geometry: three paths | HS metric DEAD END, coset PARTIAL, democratic counting PROMISING. Gap: why democratic not Dynkin? 15/15 PASS. |
| S288 | Step 5 irreducibility analysis | 3 mechanisms converge (Large-N, Killing, CCP). Likely irreducible [A-STRUCTURAL]. EQ-002/EQ-003 duality. 8/8 PASS. |
| S297 | CONJ-A2 attack (3 phases) | kappa=1 = standard Tr convention [A-STRUCTURAL]. DE-009 doesn't block WSR path. Sigma model sum(Q^2)=14. EQ-002/EQ-003 duality. 34/34 PASS (3 scripts). |
| S337 | CCWZ Phase 1 | Full CCWZ setup. Two Q_EM conventions (defect: 14 vs full: 50/3). Gauge boson mass matrix. 36/36 PASS (1 script). |
| S341 | CCWZ Phase 2 | VEV corrected. CW vs alpha distinction. C_2=24/11 from defect charges. 43/43 PASS (1 script). |
| S344 | CCWZ Phase 3 | Defect charge THEOREM. D_3=1: 0.0006 sigma. All coefficients rational. 24/24 PASS (1 script). |
| S347 | D_3 derivation attempt + propagation | Three routes (VEV, signs, sigma model). C_2=k(n-k-1)/n. Phase 3 propagated. 23/23 PASS (1 script). |

## Key Files

| File | Content |
|------|---------|
| `framework/investigations/alpha/alpha_mechanism_derivation.md` | Master mechanism file |
| `framework/investigations/alpha/alpha_forced_vs_fitted.md` | Adversarial scorecard |
| `framework/investigations/alpha/composite_gauge_field_analysis.md` | S147 composite analysis |
| `framework/investigations/quantum/photon_emission_crystallization.md` | S148 branching ratio |
| `framework/investigations/alpha/step5_unified_5C_5D.md` | S153 unified mechanism |
| `framework/investigations/alpha/alpha_dimensionless_geometry.md` | S146 geometric picture |
| `framework/investigations/alpha/alpha_accuracy_plan.md` | S332 master plan for closing 5.9-sigma gap |
| `verification/sympy/alpha_ccwz_setup.py` | S337 CCWZ Phase 1: generators, embedding, charges, mass matrix |
| `verification/sympy/alpha_ccwz_one_loop.py` | S341 CCWZ Phase 2: VEV correction, CW potential, C_2 derivation |
| `verification/sympy/alpha_ccwz_three_loop.py` | S344 CCWZ Phase 3: defect charges, D_3=1, 0.0006 sigma |
| `verification/sympy/alpha_d3_derivation_attempt.py` | S347 D_3 derivation: 3 routes (VEV, signs, sigma model), C_2 Grassmannian formula |
