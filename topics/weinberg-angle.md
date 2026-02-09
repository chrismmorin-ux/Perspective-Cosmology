# Topic: Weinberg Angle

**Current state**: sin^2(theta_W) = 28/121, alpha_3/alpha_2 = 7/2 at 0.34%. **Derivation chain FULLY COMPLETE** (S292: spectral convergence resolved via C5 + IRA-10). Steps 1-5 [THEOREM/DERIVATION], Step 6 fully decomposed: full compositeness [D from axioms] + WSR theorem [I-QFT] + spectral convergence [DERIVED from finiteness, S292]. Quartic potential alone insufficient (dim-2 condensate in V-A OPE). IRA-02 eliminated, IRA count 9->8. WSR explain democratic vs Dynkin: non-perturbative reshuffling, factor n_d=4. RG tension real (15:1) but BSM deficit only 0.36%. kappa=1 subordinate. EQ-007/EQ-022/EQ-004/EQ-020 all RESOLVED.

**Detailed history**: See `topics/weinberg-angle-history.md` for full derivation history, intermediate results, and extended session notes.

---

## What Works (Key Results)

### Core Predictions
- **sin^2(theta_W) = 28/121 = 0.23140** -- matches MS-bar at M_Z to 843 ppm (S151, S154)
- **28 = N_Goldstone(SO(11)->SO(4)xSO(7))** -- structural origin proven (S154)
- **cos(theta_W) = 171/194** -- matches on-shell definition to ~93 ppm (Band A, CORRECTED S283)
- **alpha_3/alpha_2 = n_d*Im_O/dim(O) = 7/2 = 3.500** -- matches measured 3.488 to 0.34%, zero free parameters (S218)
- **One-loop dressed**: sin^2(dressed) = 28/121 - alpha/(4*pi^2) = 0.23122, 0.00 sigma from measured (S276)

### Derivation Chain
- **Democratic counting from Schur's lemma** [DERIVATION] -- Hom(R^4,R^7) irreducible under SO(4)xSO(7). Schur -> unique invariant metric -> all 28 directions metrically equal. Dynkin excluded. (S224)
- **T_SU2 = T_SU3 = 22** -- identical Dynkin indices in End(V). Proves one-loop gives wrong answer. (S218)
- **T_fund = 1 from division algebra minimality** [DERIVATION] -- dim(H)=4 and dim(Im_O)=7 host exactly one conjugate pair. Frobenius guarantees no intermediate sizes. (S222)
- **WSR conditional derivation** [DERIVATION + I-QFT] -- Full compositeness + Weinberg sum rules + Schur -> 1/g^2 = democratic metric. Spectral convergence RESOLVED (S292). (S238/S292)
- **Step 6 [A-PHYSICAL] is irreducible** [FINDING] -- Three mechanisms give 28/7/21 (democratic/Dynkin/curvature). Only democratic matches. Cannot be derived from AXM_0109/0110/0117. (S228)
- **kappa=1 subordinate** [ANALYSIS] -- Follows from Step 6 + canonical normalization. Not independent. (S228)

### Band Structure and Dressing
- **Coefficient n_d = dim(H)** [CONJECTURE] -- In alpha/(16*pi^2) basis, coefficient = n_d = 4. From Hom(R^4,R^7) mixing scanning R^4. (S279)
- **sin^2+cos^2 mismatch = scheme conversion** [DERIVATION] -- Different schemes, so sin^2+cos^2 != 1 expected. Framework Delta = 0.00835 vs experimental 0.00802 (4.1%). (S307)
- **Band A dressed predictions** [SPECULATION] -- m_tau/m_mu: 1.9 ppm. alpha_s: 3 ppm. (S307)

### Number-Theoretic Structure (S308-S313)
- **Phi_6 cascade = Sylvester's sequence** [DERIVATION] -- {2,3,7,43,1807,...}. Physics terminates one step beyond Hurwitz. (S309)
- **Egyptian fraction of unity** [THEOREM] -- 1/2+1/3+1/7+...=1. Numerators = Lie algebra dims: 21=so(7), 14=G_2, 6=so(4). (S309/S310)
- **Graded decomposition 42=21+14+6+1** [DERIVATION] -- Ratios {7,3,2} = reverse Cayley-Dickson. Coset dims = division algebra dims. (S311)
- **G_2/SO(4) Wolf space** [THEOREM] -- dim=dim_O, chi=Im_H, quat_dim=dim_C. All invariants are division algebra dimensions. (S312)
- **Fork Gap Theorem** [DERIVATION] -- dim(so(11))-dim(F_4)=Im_H=3. Via n_d^2=2^n_d (unique at n_d=4). (S313)

---

## What Failed / Dead Ends

- **Running reconciliation**: sin^2 INCREASES with energy. Both 28/121 and 29/126 are EW-scale predictions, not related by running. (S155 -- FALSIFIED)
- **Correction term search**: No clean framework correction to 28/121 found. -n_d/(n_c^2*Phi_6) gives 445 ppm (worse). (S154)
- **29/126 from induced mechanism**: Alternative formula, slightly worse precision (0.45% vs 843 ppm). (S153)
- **Standard one-loop derivation**: Dynkin indices give T_L=T_R=15 -> sin^2=1/2 or 3/8. **Upgraded S218**: T_SU2=T_SU3=22 -> one-loop predicts alpha_2=alpha_3 (wrong by 3.5x). Perturbative approach provably wrong.
- **Democratic counting for SU(3)**: N_charged=94 gives alpha_3/alpha_2=28/94=0.298, WRONG DIRECTION. Only N=8=dim(SU(3)) works. (S218)
- **HS metric argument**: Universal rescaling cannot change coupling RATIOS. (S215 -- DEAD END)
- **Coset geometry alone**: 28/55 != sin^2. Denominator must be End(V)=121, not SO(11)=55. (S215 -- PARTIAL)

---

## Open Paths

All previously open paths are RESOLVED:
1. Task B (S_2=29) -- DONE S159
2. Task D (corrections) -- DONE S159
3. Task E (GUT trace) -- DONE S158
4. Democratic counting -- RESOLVED S224/S228
5. Two-regime mechanism -- RESOLVED S222
6. SU(3) mode counting -- DONE S218
7. T_fund=1 deeper meaning -- DONE S222
8. Emergent gauge coupling -- RESOLVED as irreducible S228
9. RG matching tension -- QUANTIFIED S228 (15:1 ratio, 0.36% BSM deficit)
10. kappa=1 normalization -- RESOLVED as subordinate S228

---

## Sessions

| Session | Key Result |
|---------|------------|
| S151 | sin^2 = 28/121 first derived |
| S153-S154 | 28=N_Goldstone, uniqueness, scheme consistency |
| S155 | Running reconciliation FALSIFIED |
| S158-S160 | GUT trace CLOSED, scheme ID, 7% RESOLVED |
| S215 | Three paths: HS DEAD END, coset PARTIAL, democratic PROMISING |
| S217 | xi=4/121 and sin^2=28/121 unified via End(V) democratic counting |
| S218 | T_SU2=T_SU3=22, alpha_3/alpha_2=7/2 at 0.34% |
| S222 | T_fund=1 from div alg minimality, singlet criterion |
| S224 | Schur's lemma -> democratic metric |
| S228 | Step 6 irreducible, RG tension quantified, kappa=1 subordinate |
| S233 | I-STRUCT-5 adopted, deeper derivation search |
| S238 | WSR conditional theorem |
| S276 | sin^2(dressed) = 28/121 - alpha/(4*pi^2), 0.00 sigma |
| S279 | Coefficient = n_d = dim(H) |
| S282 | m_p/m_e C=43/7, 16-ratio band classification |
| S283 | Double-trace, cos(theta_W) corrected to Band A |
| S292 | CONJ-A1 spectral convergence RESOLVED |
| S307 | Scheme conversion derivation, Band A dressed predictions |
| S308 | Band membership predicted a priori, 3 EM scales |
| S309 | Phi_6 = Sylvester's sequence, Egyptian fraction |
| S310 | Egyptian numerators = Lie dims, Sylvester-CD branching |
| S311 | Graded decomposition 42=21+14+6+1 |
| S312 | G_2/SO(4) Wolf space, structural identities |
| S313 | Fork Gap Theorem, F_4 incompatibility |

---

## Key Files

See `topics/weinberg-angle-history.md` for the complete file reference table. Core scripts:

| File | Content |
|------|---------|
| `framework/investigations/alpha/multi_coupling_tilt_angles.md` | 24 findings (S151-S160) |
| `verification/sympy/weinberg_angle_investigation.py` | 14/14 PASS (S154) |
| `verification/sympy/democratic_schur_lemma.py` | 21/21 PASS (S224) |
| `verification/sympy/weinberg_sum_rules_crystallization.py` | 21/21 PASS (S238) |
| `verification/sympy/weinberg_coefficient_origin.py` | 18/21 PASS (S279) |
| `verification/sympy/band_A_dressed_predictions.py` | 20/20 PASS (S307) |
| `verification/sympy/phi6_cascade_formalization.py` | 32/32 PASS (S309) |
| `verification/sympy/graded_decomposition_42.py` | 32/32 PASS (S311) |
| `verification/sympy/wolf_space_verification.py` | 25/25 PASS (S312) |
| `verification/sympy/f4_wolf_space_chain.py` | 30/30 PASS (S313) |
