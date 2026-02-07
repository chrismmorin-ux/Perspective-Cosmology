# Topic: Weinberg Angle

**Current state**: sin²θ_W = 28/121, α₃/α₂ = 7/2 at 0.34%. **Derivation chain COMPLETE** modulo one [CONJECTURE: spectral convergence C3] (I-STRUCT-5, conditionally derived S238). Steps 1-5 [THEOREM/DERIVATION], Step 6 decomposed: full compositeness [D from axioms] + WSR theorem [I-QFT] + spectral convergence [CONJECTURE]. WSR explain democratic vs Dynkin: non-perturbative reshuffling, factor n_d=4. RG tension real (15:1) but BSM deficit only 0.36%. κ=1 subordinate. EQ-007/EQ-022/EQ-004/EQ-020 all RESOLVED.

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
- **T_fund = 1 from division algebra minimality** [DERIVATION] — dim(H)=4 = 2×dim_ℂ(fund SU(2)), dim(Im(O))=7 = 1+2×dim_ℂ(fund SU(3)). Each hosts exactly ONE conjugate pair of gauge fundamental with zero excess dimensions. Frobenius guarantees no intermediate sizes. Non-division-algebra dims give T≠1. (S222)
- **Singlet criterion for two regimes** [CONJECTURE] — R⁴ has 0 SU(2)_L singlets (interface → N=28 coset), R⁷ has 1 SU(3) singlet (internal → N=8 group dim). Singlet exists because G₂→SU(3) requires choosing i∈Im(O), creating invariant direction. SU(2) needs no choice (SO(4)=SU(2)² canonical). Root cause: H associative vs O non-associative. (S222)
- **Democratic counting from Schur's lemma** [DERIVATION] — Tangent space Hom(R⁴,R⁷) ≅ R⁴⊗R⁷ is IRREDUCIBLE under isotropy group SO(4)×SO(7). By Schur's lemma, the HS metric (AXM_0110) restricted to this space is the unique invariant bilinear form: (1/n_c)×I₂₈. All 28 directions metrically equal. Dynkin weighting excluded (single irreducible component → one scale factor). Same for SU(3): adjoint irreducible (simple Lie algebra) → Killing form democratic. 1/α_EM(tree) = n_c² = 121. RG correction factors ~5.7% for all three couplings (spread 0.34%). Gap narrowed to [A-PHYSICAL]: emergent gauge field inherits metric. (S224)
- **Step 6 [A-PHYSICAL] is irreducible** [FINDING] — Three geometric mechanisms on Gr(4,11) give three distinct gauge couplings: democratic N=28 (metric-level, Schur), Dynkin T=7 (one-loop perturbative), curvature C_L=21=Im_O×Im_H (curvature projection onto SU(2)_L). Democratic/Dynkin = n_d = 4 exactly. Measurement selects democratic (0.34%) over Dynkin (71.3%) and curvature (25%). Cannot be derived from AXM_0109/0110/0117. (S228)
- **RG tension quantified** [DERIVATION] — SM-only running: Λ₂=2115 GeV, Λ₃=141 GeV, ratio 15:1. Compositeness scale f=1354 GeV between them. Colored pNGBs (24 modes) make tension WORSE (ratio→22-34). Required BSM correction only 0.36%. Framework expression Im_H/(n_d·n_c+n_h)=1/17≈5.88% near ε_avg=5.81%. (S228)
- **κ=1 subordinate to Step 6** [ANALYSIS] — Canonical normalization of Goldstone fields gives κ=1 when Step 6 accepted. 1/n_c from HS metric cancels with n_c from trace normalization. Not a separate assumption. (S228)
- **WSR conditional derivation of I-STRUCT-5** [DERIVATION + I-QFT + C3] — Full compositeness from axioms (no elementary gauge fields in AXM_0109-0117) + Weinberg sum rules (standard QFT) + Schur's lemma → 1/g² = democratic metric. Gap narrows from [A-PHYSICAL] to [CONJECTURE: spectral convergence C3]. WSR explain perturbative/non-perturbative distinction: Dynkin T=7 → democratic N=28, reshuffling factor = n_d = 4. C3 satisfied by ALL known SSB examples. (S238)

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
4. ~~**Democratic counting mechanism**~~ **RESOLVED (S224/S228)**: Schur's lemma [DERIVATION] (S224) + Step 6 [A-PHYSICAL] irreducible (S228). Three mechanisms give 28/7/21 — only democratic matches. Gap = one physical assumption.
5. ~~**Two-regime mechanism**~~ **RESOLVED (S222)**: Singlet criterion — 0 singlets → interface, 1 singlet → internal. Combined with Schur's lemma (S224) gives full derivation chain (contingent on Step 6 [A-PHYSICAL]).
6. ~~**SU(3) mode counting test**~~ **DONE (S218)**: N_SU3_charged = 94 FAILS. Only dim(SU(3)) = 8 works. Structural theorem T_SU2 = T_SU3 = 22 discovered. Two-regime confirmed.
7. ~~**T_fund = 1 deeper meaning**~~ **DONE (S222)**: Division algebra minimality, NOT coincidence. dim(H) and dim(Im(O)) are exactly the right sizes to host one conjugate pair. Frobenius + branching rules force T=1.
8. ~~**Emergent gauge coupling formalization**~~ **RESOLVED as irreducible (S228)**: Step 6 cannot be derived from AXM_0109/0110/0117. Recommend adopting as falsifiable framework principle.
9. ~~**RG matching tension**~~ **QUANTIFIED (S228)**: 15:1 scale ratio. Colored pNGBs worsen it. Required BSM = 0.36%. Full composite sector calculation needed.
10. ~~**κ=1 normalization**~~ **RESOLVED as subordinate (S228)**: Follows from Step 6 + canonical normalization. Not independent.

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
| S222 | Two-regime structural theorem | **T_fund=1 from div alg minimality** [DERIVATION]. **Singlet criterion** [CONJECTURE]: 0 singlets→interface, 1 singlet→internal. Root cause: H associative vs O non-associative. 18/18 PASS. |
| S224 | Schur's lemma resolution | **Democratic metric from irreducibility** [DERIVATION]. Hom(R⁴,R⁷) irreducible under SO(4)×SO(7) → Schur's lemma → unique invariant metric → all 28 equal. Dynkin excluded. Gap → [A-PHYSICAL]: emergent gauge coupling. RG tension documented. 21/21 PASS. |
| S228 | Emergent coupling + RG matching | **Step 6 irreducible**: three mechanisms give 28/7/21 (democratic/Dynkin/curvature). Democratic/Dynkin = n_d = 4. C_L = 21 = Im_O×Im_H (new). RG tension: Λ₂/Λ₃ = 15:1, colored pNGBs worsen, BSM deficit 0.36%. κ=1 subordinate. 2 scripts, 32/32 PASS. |
| S233 | Step 6 adoption + deeper derivation | **I-STRUCT-5 adopted** [A-PHYSICAL]. EQ-007/004/020/022 resolved. RG: top partners/pNGBs worsen; deficit (~α_s/(4π)) natural. 4 derivation candidates: full compositeness (Weinberg SRs) best. 2 scripts, 27/27 PASS. |
| S238 | WSR from crystallization dynamics | **Conditional theorem**: full compositeness [D] + WSR [I-QFT] + Schur [D] → I-STRUCT-5. Gap narrows: [A-PHYSICAL] → [CONJECTURE: C3 spectral convergence]. WSR explain democratic/Dynkin reshuffling (factor n_d=4). 1 script, 21/21 PASS. |

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
| `verification/sympy/two_regime_structural_theorem.py` | 18/18 PASS (S222) |
| `verification/sympy/democratic_schur_lemma.py` | 21/21 PASS (S224) |
| `verification/sympy/emergent_gauge_coupling_analysis.py` | 17/17 PASS (S228) |
| `verification/sympy/rg_matching_tension_analysis.py` | 15/15 PASS (S228) |
| `verification/sympy/composite_sector_rg_threshold.py` | 15/15 PASS (S233) |
| `verification/sympy/step6_deeper_derivation_search.py` | 12/12 PASS (S233) |
| `verification/sympy/weinberg_sum_rules_crystallization.py` | 21/21 PASS (S238) |
