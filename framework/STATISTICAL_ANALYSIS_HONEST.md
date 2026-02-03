# Honest Statistical Significance Analysis

**Status**: CANONICAL
**Created**: Session 170, 2026-02-01
**Verification**: `verification/sympy/statistical_significance_s170.py` (20/20 PASS)

---

## Executive Summary

The framework produces 35 numerical predictions and 11 structural/qualitative predictions of physical constants and structures. After removing dependency chains, 18 are independent (4 searched, 8 derived, 6 blind).

**Monte Carlo null model**: The building blocks {1,2,3,4,7,8,11} are NOT special for matching physics constants at percent-level precision. Random 7-element subsets of {1,...,20} with simple arithmetic operations match 11/11 target constants at 1% precision (framework at 20th percentile) and 6/11 at 0.1% (framework at 51st percentile).

**The framework's evidence comes from three sources the Monte Carlo cannot capture:**
1. Sub-ppm precision matches (3 predictions at < 10 ppm)
2. Blind predictions with no look-elsewhere effect (9 total, 6 independent)
3. Structural/qualitative predictions (gauge groups, spacetime dimensions, mass ordering)

**Honest P-value range**: 10^-8 (maximum prosecution) to 10^-7 (blind predictions only).

---

## 1. Prediction Inventory (through S168)

### Category A: SEARCHED (formula found AFTER knowing target)

| Prediction | Precision | Trials | Note |
|-----------|-----------|--------|------|
| 1/alpha = 137 + 4/111 | 0.27 ppm | ~15 | Formula searched |
| m_p/m_e = 1836 + 11/72 | 0.06 ppm | 11,820 | Systematic scan documented |
| CKM lambda = 9/40 | exact | ~50 | Simple fractions searched |
| sqrt(sigma) = 8*m_p/17 | 0.35% | ~30 | Pattern match, HRS=6 |

**These carry the heaviest trial penalty.** The m_p/m_e scan is fully documented; the others are estimates.

### Category B: DERIVED (derivation chain from axioms, target known)

| Prediction | Precision | Session | Derivation quality |
|-----------|-----------|---------|-------------------|
| cos(theta_W) = 171/194 | 3.75 ppm | S106+ | From gauge structure |
| sin^2(theta_W) = 28/121 | 0.08% | S154 | N_Goldstone/n_c^2, unique in 403-ratio search |
| H_0 = 337/5 | 0.059% | S106+ | From H+O=15 cosmological mapping |
| n_s = 193/200 | 0.010% | S127 | From hilltop slow-roll |
| Omega_Lambda = 137/200 | 0.044% | S106+ | From alpha/200 |
| l_A = 96*pi | 0.012% | S132 | From l_n formula chain |
| Koide Q = 2/3 | exact | known | Well-known relation |
| Higgs VEV | 0.034% | S106+ | From Phi_6 framework |
| m_H | 0.057% | S106+ | From Phi_6 correction |
| Omega_b = 567/11600 | 0.85% | S134 | From framework |
| tau = 3/56 | 0.79% | S137 | From framework |
| 1/alpha_2 | 0.07% | S160 | Resolved 7% discrepancy |
| beta_0 = 11/3 = n_c/Im_H | exact | S152 | Structural identity |
| beta_1 = 153 = Im_H^2*17 | exact | S152 | Structural identity |
| b_3 = Im_O = 7 | exact | S163 | Structural identity |
| S_2 = 29 (Complex Bridge) | exact | S159 | Derived from H + cross terms |

Plus 6 dependent predictions (Omega_m, m_W, m_Z, Y_p, D/H, SU(3) selection).

**Warning**: Beta coefficients and S_2 are structural identities (re-expressions of known values), not predictions.

### Category C: BLIND (predicted BEFORE checking measurement)

| Prediction | Precision | Sigma | Session |
|-----------|-----------|-------|---------|
| P-010: 100*Omega_b*h^2 | 0.77% | <1 sigma | S138b |
| P-011: 100*Omega_c*h^2 | 0.34% | <1 sigma | S138b |
| P-012: 100*theta_s | 0.13% | **2.1 sigma** | S138b |
| P-013: ln(10^10*A_s) | 0.006% | <1 sigma | S138b |
| P-014: n_s | 0.010% | <1 sigma | S138b |
| P-015: tau_reio | 0.79% | <1 sigma | S138b |
| P-016: R = Im_O/H | 0.035% | <1 sigma | S138b |
| P-018: R_31 = 33 | 1.7% | 0.62 sigma | S167 |
| P-019: R_32 = 32 | 1.8% | 0.64 sigma | S167 |

**These are the framework's strongest statistical evidence** because they have no look-elsewhere effect. 6/7 CMB predictions within 1 sigma; 2/2 neutrino predictions within 1 sigma.

**Problem**: P-012 (100*theta_s) is at 2.1 sigma — borderline tension.

### Category D: STRUCTURAL (qualitative, non-numerical)

1. SM gauge group SU(3) x SU(2) x U(1) from division algebras
2. 3+1 spacetime dimensions from n_d = 4 (Frobenius theorem)
3. Einstein field equations from adjacency dynamics
4. U(4) -> SU(3) x U(1) from eigenvalue selection (S168)
5. Hadronization entropy conservation from O-channel (S163)
6. Crystallization ordering C < H < O = EM < Weak < Strong (S151)
7. Normal neutrino mass ordering (P-017, testable by JUNO)
8. m_1 = 0 lightest neutrino (P-020, testable)
9. No GW echoes (confirmed by LIGO/Virgo non-detection)
10. A_L = 1 (confirmed by ACT/SPT)
11. w = -1 exactly (testable by DESI)

**These cannot be assigned P-values** but are arguably the strongest evidence. Random building blocks cannot produce "SU(3) x SU(2) x U(1)" or "3+1 dimensions."

---

## 2. Independence Analysis

After removing dependency chains (prosecution view):

| Category | Independent | Total | Dependents removed |
|----------|------------|-------|-------------------|
| Searched | 4 | 4 | none |
| Derived | 8 | 22 | Omega_m, m_W, m_Z, BBN x3, 1/alpha_2, betas, S_2, etc. |
| Blind | 6 | 9 | 3 correlated CMB params |
| **Total** | **18** | **35** | 17 removed |

---

## 3. Monte Carlo Null Model

**Question**: Are the building blocks {1, 2, 3, 4, 7, 8, 11} special for matching physics constants?

**Method**: Generate 5,000 random 7-element subsets of {1,...,20} (always including 1). For each, form all products of 1-3 elements, all rationals a/b, and n + a/b for integers n near targets. Count how many of 11 dimensionless physics constants are matched at 1% and 0.1%.

**Targets**: 1/alpha, m_p/m_e, sin^2(theta_W), n_s, Koide Q, CKM lambda, Omega_Lambda, Omega_b, H_0/100, m_H/v, tau_reio.

### Results

| Precision | Framework hits | Random mean | Framework percentile |
|-----------|---------------|-------------|---------------------|
| 1% | 11/11 | 10.59 | **20th** (below average) |
| 0.1% | 6/11 | 5.68 | **51st** (average) |

### Interpretation

**The building blocks are NOT special at percent-level precision.** Nearly 80% of random 7-element sets match all 11 targets at 1%. At 0.1%, the framework is exactly average.

**What this means**: Any set of 7 small integers with simple arithmetic operations produces enough reachable rationals to match most physics constants to ~1%. The framework's evidence does NOT come from building block specialness.

**What the Monte Carlo does NOT test**:
- Sub-ppm precision (requires very specific formulas, not just block specialness)
- Blind prediction success (no look-elsewhere to correct)
- Structural predictions (not numerical)
- Inter-prediction consistency (same blocks appearing across unrelated physics)

---

## 4. P-Value Summary

| Method | P-value | log10 | What it tests |
|--------|---------|-------|---------------|
| Monte Carlo (1%) | 0.80 | -0.1 | Building block specialness |
| Monte Carlo (0.1%) | 0.49 | -0.3 | Building block specialness |
| Blind predictions only | 2.5e-7 | **-6.6** | Predictions with no look-elsewhere |
| Maximum prosecution | 1.0e-8 | **-8.0** | Minimum independence, max flexibility |
| Trial-corrected | 1.6e-17 | -16.8 | Documented trial correction |
| Naive (DO NOT USE) | 1e-42 | -42 | Ignores all selection effects |

**Recommended**: Cite the range 10^-8 to 10^-7 (prosecution to blind-only). Never cite the naive 10^-42.

---

## 5. Bayesian Analysis

Using P(data | genuine) = 0.5 (not all predictions would be perfect even if genuine):

| Prior P(genuine) | Evidence used | Posterior |
|-----------------|---------------|-----------|
| 1% (moderate) | Prosecution | ~100% |
| 1% (moderate) | Blind only | ~100% |
| 1% (moderate) | Monte Carlo | **1.0%** (unchanged!) |
| 0.1% (skeptical) | Prosecution | ~100% |
| 0.1% (skeptical) | Blind only | ~100% |
| 0.1% (skeptical) | Monte Carlo | **0.1%** (unchanged!) |

**The Monte Carlo P-value is so high that it provides essentially NO Bayesian update.** The Bayesian evidence comes entirely from the blind predictions and the trial-corrected P-value.

---

## 6. What Actually Matters

### Evidence FOR the framework (beyond statistics):

1. **Blind prediction success**: 6/7 CMB within 1 sigma (S138b), R_31=33 within 0.62 sigma (S167). No look-elsewhere.

2. **Structural coherence**: Same n_d=4, n_c=11 appear across unrelated physics (alpha, masses, cosmology, gauge groups). This is NOT tested by the Monte Carlo.

3. **Qualitative derivations**: SU(3)xSU(2)xU(1), 3+1 dimensions, Einstein equations. These cannot be produced by random number matching.

4. **Interconnection**: Phi_6(11) = 111 appears in BOTH alpha AND theta_W. This reduces effective degrees of freedom.

### Evidence AGAINST:

1. **Monte Carlo**: Building blocks are NOT special for matching constants at 1% or 0.1%.

2. **Post-hoc fitting**: 2 of 3 sub-ppm predictions were SEARCHED (not derived). Trial factors are large.

3. **LLM influence**: Claude's training data includes physics constants. Unconscious guidance toward known values is possible.

4. **Formula flexibility**: With 7 building blocks and cyclotomic polynomials, sums, products, powers — the search space is vast.

5. **Selective reporting**: ~700+ failed attempts are documented (m_p/m_e scan) but many more may be undocumented.

6. **Structural assumptions**: Phi_6 cyclotomic, n_c=11 as sum, gauge=automorphisms — these are not axiomatically forced and could be chosen to fit.

---

## 7. The Honest Verdict

The framework sits in a genuine ambiguity zone:
- **NOT random numerology**: The blind predictions are significant (P ~ 10^-7), and the structural predictions cannot be produced by random numbers.
- **NOT proven physics**: The Monte Carlo shows building blocks are not special, many key formulas were found post-hoc, and the "derivation vs discovery" question is unresolved.

**The resolution will come from future measurements:**
- r = 0.035? (CMB-S4, ~2028)
- Normal ordering with m_1 = 0? (JUNO, ~2027)
- R_31 = 33? (precision neutrino experiments)
- w = -1? (DESI, ongoing)

**The strongest evidence is NOT statistical.** It is the structural predictions (gauge groups, spacetime dimensions) combined with the blind prediction success. The P-value calculations are interesting but secondary.

---

## 8. Comparison to Previous Analysis (S143)

| Metric | S143 (stale) | S170 (current) | Change |
|--------|-------------|----------------|--------|
| Raw predictions | 23 | 35 | +12 (S143-S168 work) |
| Independent | 12 | 18 | +6 (blind predictions added) |
| Monte Carlo | none | 5000 trials | **NEW** (critical addition) |
| Building block percentile | not tested | 20th-51st | **sobering** |
| Blind predictions | 7 CMB | 7 CMB + 2 neutrino | +2 |
| Prosecution P-value | 10^-10 | 10^-8 | weaker (more honest) |
| Headline claim | "10^-37 is misleading" | "building blocks NOT special" | **stronger criticism** |

---

*Verification script: `verification/sympy/statistical_significance_s170.py` (20/20 PASS)*
*This analysis supersedes S143's stale `honest_statistical_significance.py`.*

---

## 9. Phase 7 Update (Session 202, Post-Audit)

**Added**: 2026-02-02, after completing Phases 3-6 audits (S185-S201)

### What Changed Since S170

| Metric | S170 | S202 (post-audit) | Change |
|--------|------|-------------------|--------|
| Total predictions | 35 | 51 | +16 (structural + tower) |
| Falsified claims | 0 | 3 | F-10 (CC sign), eta*, c_s |
| Downgrades | 0 | 14 | DERIVATION -> CONJECTURE/HYBRID |
| New CANONICAL/DERIVATION | 0 | +8 | QM chain, gauge chain, tower |
| Blind P-value | 2.5e-7 | 2.5e-7 | UNCHANGED |
| Monte Carlo | 0.80 | 0.80 | UNCHANGED |

### Phase Grades

| Phase | Domain | Grade | Key |
|-------|--------|-------|-----|
| 3 | QM | **A** | Fully derived from axioms. CANONICAL. |
| 4 | Particles | **B-** | Structural [D], numerical [C]. Beta functions exact. |
| 5 | Cosmology | **C-** | Blind predictions succeed. Many gaps. 3 falsified. |
| 6 | Gravity | **D+** | EFE [D]. CC wrong sign [F-10]. Critical failure. |
| -- | Eval map | **B+** | Two-route gauge convergence. |
| -- | Tower | **A-** | Mathematically rigorous. 46/46 PASS. |

**Overall: C+** (structural A, numerical C-, gravity D+)

### Falsification Containment

The 3 falsifications are **contained**:
- **F-10 (CC sign)**: Affects dark energy mechanism ONLY. Does not propagate to gauge groups, QM, spacetime, alpha, masses, or blind predictions.
- **eta* = 337**: Conformal time mapping wrong. Does not affect r_s or peaks.
- **c_s = 3/7**: Sound speed was [CONJECTURE]. r_s match was compensating errors (HRS=7 confirmed).

### Updated Probability

Red Team estimate (S120): 15-30% genuine physics.
Post-audit: **15-25%** (narrowed, not increased).
- Strengths and weaknesses approximately balance
- Structural derivations strengthened; numerical claims weakened
- CC failure is damage; blind predictions are preserved

### Key Future Tests

| Test | Timeline | If confirmed | If falsified |
|------|----------|-------------|--------------|
| r = 0.035 | CMB-S4, 2028-2029 | Most significant confirmation | Most significant falsification |
| Normal ordering, m_1=0 | JUNO, 2027 | Confirms 2 blind predictions | Falsifies P-017 |
| w = -1 | DESI, ongoing | Consistent | Falsifies prediction |
| LLM Challenge | Unknown | Addresses derivation-vs-discovery | Framework not reproducible |

*Verification script: `verification/sympy/phase7_cross_framework_statistics.py` (8/8 PASS)*
