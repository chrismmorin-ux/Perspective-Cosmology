# Phase 4: Dimensionless Constants, Quantum Mechanics & Thermodynamics

**Split from**: `registry/PHYSICS_CHECKLIST.md`
**Sections**: E (Dimensionless Constants & Couplings) + F (Quantum Mechanics) + G (Thermodynamics)
**Items**: E1-E10, F1-F13, G1-G7

---

## E. DIMENSIONLESS CONSTANTS & COUPLINGS

| # | Phenomenon | Framework Status | Reference | Notes |
|---|-----------|-----------------|-----------|-------|
| E1 | Fine structure constant α | PARTIAL | ALPHA_DERIVATION_MASTER.md + 19 scripts + partial_strengthening_pass3.py (20/20) | 1/alpha = n_d^2+n_c^2 + n_d/(n_c^2-n_c+1) = 137+4/111 = 0.27 ppm. ALL components from division algebras: 137=16+121 [D], 111=n_c^2-n_c+1 [D], 4=n_d [D]. 3 independent paths (alpha_step5 12/12). 400+ formula search: unique. 71% derived (5/7 steps D). Gap: WHY interface counting gives EM coupling (mechanism, not algebra). |
| E2 | Weinberg angle sin²θ_W | PARTIAL | weinberg_best_formula.py (8/8) + sm_gauge_group_from_fc.py (25/25) + tier1_promotion_analysis.py | Tree-level sin²θ_W=1/4 DERIVED from B3 (equal couplings at unification). 1-loop RG running with DERIVED betas (B4: b_1=41/10, b_2=-19/6) gives sin²~0.231 for M_GUT~10^15-16 GeV [I-MATH]. Precision formula: (1/4)(1-10/133)=30 ppm or cos(θ_W)=171/194=3.75 ppm [CONJECTURE: threshold corrections]. 75% derived (3/4 steps D, 1 conjecture: threshold correction formula). |
| E3 | Strong coupling α_s(M_Z) | PARTIAL | so11_beta_functions.py (12/12) + strong_coupling_counting_analysis.py + partial_strengthening_pass7.py (18/18) | b₃=-(n_c-n_d)=-7 EXACT (THM_04A3) [D]. Best match: 1/α_s=17/2=dim_O+1/2 [0.3%]. Also: dim_O=8 [5.6%]. Running structure fully derived (B4). b_3<0 guaranteed by n_c>n_d [D]. 50% derived (running [D], initial value identification [C]). Gap: WHY dim_O or 17/2, counting rule for unbroken vs broken phases. |
| E4 | Higgs quartic λ | PARTIAL | higgs_mass_pngb_cw.py (14/14) + partial_strengthening_pass6.py (17/17) | IMPROVED: lambda=(n_c^2+n_d)/(dim_O*n_c^2)=125/968=0.12913 [0.19%]. m_H=125.13 GeV [0.10%, 0.7sigma]. 18x better than crude 1/8. 125=n_c^2+n_d=137-12=N_I-dim(SM) [D]. 968=dim_O*n_c^2 [D]. Composite Higgs: lambda_0=1/dim_O, correction xi=n_d/n_c^2. ~20 formulas tested. 40% derived. Gap: WHY this specific composite correction. |
| E5 | Fermi constant G_F | PARTIAL | higgs_vev_from_portal.py (7/7) + partial_strengthening_pass4.py (18/18) | v = M_Pl*alpha^8*sqrt(44/7) = 246.14 GeV [0.034%]. alpha^8=(eps*)^n_d: portal coupling [D]. 44=n_d*n_c (defect-crystal cross-terms) [D], 7=Im_O [D]. G_F=1/(sqrt(2)v^2) [I-MATH]. 67% derived (4/6 D). Gap: sqrt(44/7) geometric factor mechanism. Note: coset dim=28, not 44; 44 is product n_d*n_c. |
| E6 | Proton-to-electron mass ratio | PARTIAL | proton_electron_best_formula.py + partial_strengthening_pass7.py (18/18) | **0.06 ppm**: m_p/m_e = (H+O)(Im_H^2+(H+O)^2) + n_c/(O*Im_H^2) = 12*153+11/72 = 132203/72. 12=dim_H+dim_O [D], 153=9+144=Im_H^2+12^2 [D], 11/72=n_c/(dim_O*Im_H^2) [D]. 153=T(17) triangular, 17=n_d^2+1 [D]. MORE PRECISE THAN ALPHA (0.06 vs 0.27 ppm). Zero free params. Same structural pattern as alpha (integer base + n_c correction). [CONJECTURE]: formula matches, mechanism not derived. |
| E7 | Why α ≈ 1/137 | PARTIAL | Same as E1 | Formula 1/α = n_d²+n_c² matches at 0.27 ppm. 3 paths converge. Falsification analysis: changing n_d or n_c breaks by >7000 ppm. WHY interface generators count remains open. |
| E8 | Running of couplings / RG flow | **CASCADE** | B4 (DERIVED) + [I-MATH] | All 3 beta coefficients DERIVED (B4): b₃=-7, b₂=-19/6, b₁=41/10. RG equations [I-MATH] → running. Coupling evolution fully determined by derived betas + initial conditions. |
| E9 | EW vacuum v = 246 GeV | PARTIAL | higgs_vev_from_portal.py (7/7) | v = M_Pl×α⁸×√(44/7) = 246.14 GeV [0.034%]. NOT a free parameter — derived from portal coupling (E5). Gap: √(44/7) factor [CONJECTURE]. |
| E10 | Why 19 free parameters | PARTIAL | partial_strengthening_pass5.py (12/13) | ALL 19 SM parameters have framework formulas (unprecedented). 6+ sub-ppm precision, most sub-percent. 0 fully DERIVED yet (all PARTIAL). Gauge couplings (E1-E3), 9 fermion masses (C2-C10), 4 CKM (D1-D4), v+lambda_H (E5+B6), theta_QCD (B12). Gap: mechanisms for formulas, not just algebraic matches. |

---

## F. QUANTUM MECHANICS

| # | Phenomenon | Framework Status | Reference | Notes |
|---|-----------|-----------------|-----------|-------|
| F1 | Hilbert space structure | **DERIVED** | **THM_0491** (CANONICAL) | From AXM_0109+0110+0113 + THM_0485. 18/18 PASS. |
| F2 | Born rule P=|ψ|² | **DERIVED** | **THM_0494** (DERIVATION) | 3-layer proof: existence+uniqueness+robustness. 37/37 PASS. |
| F3 | Unitary evolution | **DERIVED** | **THM_0493** (DERIVATION) | From Hilbert space + time continuity. 18/18 PASS. |
| F4 | Superposition principle | **DERIVED** | THM_0491 | Follows from Hilbert space linearity |
| F5 | Bell inequality violations | **DERIVED** | **entanglement_from_crystallization.md** (CANONICAL) | E(a,b)=-cos(a-b) exact, CHSH=2sqrt(2), no-signaling proven. 78/78 PASS. |
| F6 | Entanglement | **DERIVED** | **entanglement_from_crystallization.md** (CANONICAL) | Crystallization creates entanglement, 9 verification scripts. 78/78 PASS. |
| F7 | Spin-statistics theorem | **CASCADE** | **THM_04A6** (SKETCH) | 3+1D → Lorentz group → standard Pauli proof. Not novel derivation. |
| F8 | Uncertainty principle | **DERIVED** | **THM_04A5** (CANONICAL) | Cauchy-Schwarz on Hilbert space → Robertson relation. Pure math. |
| F9 | Quantum tunneling | **CASCADE** | THM_0493 | Schrodinger equation → tunneling through potential barriers. Standard QM. |
| F10 | Decoherence | **DERIVED** | measurement_problem_resolution.py (11/11 PASS) | Entanglement + partial trace → exponential decay. Crystallization explains irreversibility. |
| F11 | Measurement problem | **DERIVED** | measurement_problem_resolution.py (11/11 PASS) | All 3 aspects resolved: outcomes (Wright-Fisher), basis (interaction H), timing (2-stage). Born rule 3 independent proofs. |
| F12 | Why complex Hilbert space | **DERIVED** | **THM_0485** (CANONICAL) | F=C from time direction + Frobenius |
| F13 | Planck's constant ℏ | IMPORTED | — | Value not derived |

---

## G. THERMODYNAMICS

| # | Phenomenon | Framework Status | Reference | Notes |
|---|-----------|-----------------|-----------|-------|
| G1 | Second law of thermodynamics | **DERIVED** | **THM_0451** (CANONICAL) | From AXM_0107 (non-negative loss) |
| G2 | Arrow of time | **DERIVED** | **THM_0451 + THM_0420** | Irreversibility from information loss direction |
| G3 | Boltzmann distribution | **CASCADE** | boltzmann_third_law_cascade.py (8/8 PASS) | Max entropy (THM_0451) + Hilbert space (THM_0491) → p_i = exp(-βE_i)/Z. Form derived; k_B imported. |
| G4 | Planck spectrum | **CASCADE** | F1+F7+G3+B3 | Quantized EM modes (from DERIVED U(1) gauge theory B3) + Bose-Einstein statistics (from spin-statistics F7 CASCADE) + thermal equilibrium (G3 CASCADE) → Planck distribution. Standard QFT. |
| G5 | Third law | **CASCADE** | boltzmann_third_law_cascade.py (8/8 PASS) | Finite-dim Hilbert space (THM_0491) → unique ground state → S→0 as T→0. |
| G6 | Low initial entropy | PARTIAL | partial_strengthening_pass3.py (20/20) | Crystal = maximally ordered = low entropy [structural from AXM_0109]. Crystallization irreversible (THM_0420 CANONICAL). Entropy non-decreasing (THM_0451 CANONICAL). Penrose "Past Hypothesis" becomes CONSEQUENCE not input. Qualitative CASCADE from G1+G2. Gap: quantitative S_initial << S_max calculation, Boltzmann brain avoidance. |
| G7 | Boltzmann brain problem | PARTIAL | THM_0420 + THM_0451 + partial_strengthening_pass4.py (18/18) | Crystallization irreversible (THM_0420 CANONICAL). Universe = growing crystal, NOT thermal fluctuation -> BB scenario inapplicable. Structural argument: crystallization never reaches equilibrium. 67% derived. Gap: dark energy recurrence time analysis. |
