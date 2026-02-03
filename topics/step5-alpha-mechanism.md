# Topic: Step 5 Alpha Mechanism

**Current state**: Six approaches analyzed (5A-5F). THM_04A2 (single-photon tilt, 5F) is clearest physical picture. All require one undetermined scale. Grade: D+ (5D/5F at C-). Gap G2 (uniformity) CLOSED via HS derivation (S165). Born rule uniqueness + robustness proven (S173, 37/37 PASS). THM_0491 promoted to CANONICAL, THM_0493 promoted to DERIVATION (CR-037 resolved via automatic continuity, 18/18 PASS). Remaining gap: gauge kinetic term normalization.

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

## Open Paths

1. **Derive scale ratio**: exp(137pi/21) ~ 8e8. Notable: v_EW*12*N_I ~ m_e*exp(137pi/21) to 0.5%. (S149)
2. **Why no bare kinetic term**: Show EM gauge field is purely induced (Sakharov mechanism). (S149)
3. **Correction terms**: 4/111 for EM is established. Find analogues for alpha_2, alpha_s. (S155)
4. **S_2=29 derivation**: From SO(11) representation theory. (S155 Task B)
5. ~~**Derive counting metric**~~: RESOLVED (S165) — Path C: counting metric = HS inner product from AXM_0110.

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

## Key Files

| File | Content |
|------|---------|
| `framework/investigations/alpha/alpha_mechanism_derivation.md` | Master mechanism file |
| `framework/investigations/alpha/alpha_forced_vs_fitted.md` | Adversarial scorecard |
| `framework/investigations/alpha/composite_gauge_field_analysis.md` | S147 composite analysis |
| `framework/investigations/quantum/photon_emission_crystallization.md` | S148 branching ratio |
| `framework/investigations/alpha/step5_unified_5C_5D.md` | S153 unified mechanism |
| `framework/investigations/alpha/alpha_dimensionless_geometry.md` | S146 geometric picture |
