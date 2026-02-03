# Phase 3: Particle Spectrum, Masses, Mixing Angles & CP Violation

**Split from**: `registry/PHYSICS_CHECKLIST.md`
**Sections**: C (Particle Spectrum & Masses) + D (Mixing Angles & CP Violation)
**Items**: C1-C21, D1-D11

---

## C. PARTICLE SPECTRUM & MASSES

| # | Phenomenon | Framework Status | Reference | Notes |
|---|-----------|-----------------|-----------|-------|
| C1 | Three generations | **DERIVED** | pauli_exclusion_generations.py (12/12) + partial_to_derived_audit.py (17/17) | 3 = Im(H) = {i,j,k} [THEOREM: Frobenius + uniqueness]. Only H has Im_dim=3 among all division algebras. H acts on defect (THM_0484) -> 3 independent fermion copies. [A-PHYSICAL]: Im(H)=generation index (structurally forced, not free parameter). |
| C2-C10 | Fermion masses | PARTIAL | complete_fermion_mass_hierarchy.py + partial_strengthening_pass7.py (18/18) | 9 formulas, ALL from division algebra dims. QUARKS: m_t=v/√2×120/121 [145 ppm], m_b=m_t×3/121 [2.4%], m_c=m_b×3/10 [1.1%], m_s=m_c/13 [5.7%], m_d=m_s/20 [5.1%], m_u=m_s/43 [6.4%]. LEPTONS: m_τ=v×11/1525 [0.05%], m_μ=m_τ×11/185 [542 ppm], m_e=m_μ×43/8891 [543 ppm]. Key ratios: 120/121=1-1/n_c^2, 3/121=Im_H/n_c^2, 3/10=Im_H/(n_c-1), 1/13=1/(dim_C^2+Im_H^2). ONE anchor: v. [CONJECTURE]: formulas match, mechanism not derived. |
| C11-C13 | Boson masses | PARTIAL | higgs_mass_pngb_cw.py (14/14) + partial_strengthening_pass5.py + pass6.py | m_W=g_2*v/2=80.2 GeV [0.18%], m_Z=m_W/cos(theta_W)=91.5 GeV [0.35%]. m_H: with E4 improved lambda=125/968, m_H=125.13 GeV [0.10%, 0.7sigma] (was 123.1 GeV [1.7%] with crude 1/8). Inputs: v from E5 [PARTIAL 67%], sin^2 from E2 [PARTIAL 75%]. 50% derived. Gap: lambda mechanism (composite correction xi=n_d/n_c^2). |
| C14-C16 | Nucleon masses | **CASCADE** | hadron_mass_complete.py, proton_mass_consistency.py + partial_strengthening_pass3.py (20/20) | SU(3) DERIVED (B2) + b_3=-7 DERIVED (B4) + confinement CASCADE (B5) -> nucleon mass ~95% from QCD binding energy (chiral limit). sqrt(sigma)=8m_p/17=441.5 MeV [0.3%]. Lattice QCD = computational method (like numerical GR for A12). Same CASCADE standard as binary pulsar decay. Quark mass corrections (~1%) from C2-C10 (PARTIAL). |
| C17 | Fermion mass hierarchy | PARTIAL | complete_fermion_mass_hierarchy.py + partial_strengthening_pass7.py (18/18) | Cascade ratios ALL decompose: 3/121=Im_H/n_c^2, 3/10=Im_H/(n_c-1), 1/13=1/(dim_C^2+Im_H^2), 1/20=1/(n_c+dim_O+1). 5/6 quark ratios have clear division algebra origins. Lepton: 11/1525 (n_c/25×61), 11/185 (n_c/5×37), 43/8891 (43/17×523, 17=n_d^2+1). Span ~10^6. 50% derived. Gap: WHY cascade structure (mechanism), 43 decomposition. |
| C18 | Top Yukawa ~ 1 | PARTIAL | top_mass_framework_derivation.py + partial_strengthening_pass4.py (18/18) | y_t = (n_c^2-1)/n_c^2 = 120/121 = 0.9917 [0.16%]. n_c=11 [D], formula [CONJECTURE]. Top = maximal coupling minus 1/n_c^2. EWSB trigger role [D from B6]. Post-hoc risk: MEDIUM (2 alternatives within 0.1%: 1-1/132 and 1-1/132). 50% derived. Gap: derivation from SO(11) embedding. |
| C19 | Koide formula | PARTIAL | koide_theta_prime_attractor.py (PASS) + 15 scripts + partial_strengthening_pass6.py (17/17) | Q=2/3=dim_C/Im_H DERIVED (algebraic necessity). A=√2 forced by Q [D]. θ=π×73/99 [0.006%]: 73=dim_O^2+Im_H^2 (PRIME encoding color+generation), 99=Im_H^2*n_c. M=v/(n_d*Im_O)^2=v/784 [0.069%]. 40% derived. Gap: prime attractor selection mechanism. |
| C20 | Neutrino masses | PARTIAL | S167 + partial_strengthening_pass6.py (17/17) | R_31=Im_H*n_c=33 [1.7%, 0.6sigma]. R_32=32=dim_H*dim_O. 5 LOCKED predictions (P-017 to P-021): normal ordering, R_31=33, R_32=32, m_1=0, Σ~58.5 meV. Fano plane: 7 points=Im_O, generation symmetry EXACT at algebraic level. 40% derived. Key test: JUNO (ordering). |
| C21 | Higgs hierarchy problem | PARTIAL | higgs_mass_pngb_cw.py (14/14) + partial_strengthening_pass7.py (18/18) | Higgs as pNGB from SO(11)/[SO(4)×SO(7)]: 28 Goldstones [D], mass protected by global symmetry. xi=n_d/n_c^2=3.3% (moderate tuning) [D]. f=v*n_c/sqrt(n_d)=1.35 TeV [D]. 16-order hierarchy v/M_Pl~alpha^8 from portal coupling [D if E1]. CW EWSB. λ=125/968 [0.19%] (E4). 60% derived. Gap: radiative stability proof, xi derivation. |

---

## D. MIXING ANGLES & CP VIOLATION

| # | Phenomenon | Framework Status | Reference | Notes |
|---|-----------|-----------------|-----------|-------|
| D1-D4 | CKM angles | PARTIAL | mixing_angles_division_algebra.md + partial_strengthening_pass5.py (12/13) | lambda_CKM=Im_H^2/(5*dim_O)=9/40=0.225 [EXACT 5-digit match]. V_cb=2/Im_O^2=2/49 [0.04%]. delta_CKM=pi*8/21 [0.1%, see D10]. ALL from division algebra dims, zero free params. 3/4 CKM params sub-percent. V_ub estimate poor (different formula needed). [CONJECTURE]: no mechanism from SO(11). |
| D5-D8 | PMNS angles | PARTIAL | S167 + partial_strengthening_pass6.py (17/17) | sin^2(theta_12)=10/33=0.303 [1.3%]: 10=n_c-1, 33=Im_H*n_c. sin^2(theta_23)~1/2 (maximal) [9%]. sin^2(theta_13)=1/(dim_O*n_c)=1/88 [48%, poor]. theta_12 good, theta_13 needs better formula. 40% derived. |
| D9 | CKM small vs PMNS large | PARTIAL | mixing_angles_division_algebra.md | Structural hypothesis: quarks at H-O interface (non-associative octonions) vs leptons at H-C/H-R (associative). Non-associativity suppresses quark mixing. Joint 7-parameter probability ~10⁻¹². [CONJECTURE]: mechanism not quantitatively derived. |
| D10 | CP violation origin | PARTIAL | mixing_angles_division_algebra.md + partial_strengthening_pass2.py (18/19) | delta_CKM = pi*8/21 = 1.197 rad [**0.1%** of 1.196 measured]. 8=dim_O, 21=Im_H*Im_O — both [D]. delta_PMNS = pi*19/14 ~ -116 deg vs ~-92 deg [26%, large expt uncertainty]. [CONJECTURE]: formulas use division algebra ratios but mechanism not derived. |
| D11 | Dirac vs Majorana | PARTIAL | neutrino_mass_blind_predictions.py (S167) | Predicts m₁=0 (rank-2 mass matrix), normal ordering, Σ≈58.5 meV, m_ee ∈ [1.4, 3.7] meV. Does NOT determine Dirac vs Majorana — both admit rank-2 matrices. Testable by 0νββ experiments. |
