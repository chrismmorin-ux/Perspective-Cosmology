# Alpha Accuracy: Systematic Improvement Plan

**Status**: PLAN (ready for execution)
**Created**: 2026-02-09 (Session S332)
**Purpose**: Roadmap for closing the 5.9-sigma gap between C_2=24/11 dressed prediction and CODATA 2022
**Prerequisites**: Read this file, then `alpha_radiative_gap.md`, then `ALPHA_DERIVATION_MASTER.md`

---

## Current State

| Level | 1/alpha | Gap (ppm) | Sigma | Params | Status |
|-------|---------|-----------|-------|--------|--------|
| Tree | 15211/111 = 137.036036... | 0.27 | 1755 | 0 | [DERIVATION] |
| 2-loop (C_2=24/11) | 137.035999053 | 0.0009 | **5.9** | 1 | [DERIVATION] (S341-S344) |
| 3-loop (D_3=1) | 137.035999177 | 0.0001 ppb | **0.0006** | 2 | [CONJECTURE, HRS 5] (S344) |

The residual after C_2=24/11 is **-1.237e-7** (undershoots CODATA). Needed correction is **positive** (+1.237e-7 in 1/alpha). The self-consistent cubic resummation gives negligible improvement (0.02% of needed C_3). C_3 must come from an independent term.

**Central question**: What must be understood, derived, or resolved before the alpha residual can be closed honestly?

---

## Nine Avenues Evaluated (S332 Survey)

### ATTACK NOW (High ROI, unblocked)

#### Avenue 2: Sigma Model CCWZ Calculation [PRIORITY 1]

**Goal**: Derive C_2 = 24/11 from a one-loop Coleman-Weinberg calculation on SO(11)/SO(4)xSO(7), simultaneously predicting C_3.

**Why highest priority**: This is the ONLY avenue that can upgrade C_2 from [CONJECTURE] to [DERIVATION]. It is decisive: either C_2 = 24/11 emerges (validating the structural identification) or it doesn't (falsifying it). The same calculation constrains C_3.

**Literature status** (researched S332):
- 2D sigma model technology is **mature through 4 loops** (Hikami 1981, Wegner 1989). Grassmannian symmetric spaces have multiplicatively renormalizable beta functions to all orders (Pisarski 1979).
- 4D composite Higgs on SO(11)/SO(4)xSO(7) has **never been computed**. Standard literature uses small cosets (SO(5)/SO(4) with 4 Goldstones). Our coset has 28 Goldstones.
- The general CCWZ + Weinberg sum rule framework exists (Marzocca, Serone, Shu 2012; JHEP 08(2012)013). One-loop is achievable; two-loop would be a research project.
- Bykov (2021, arXiv:2106.15598) reformulated Grassmannian sigma models as Gross-Neveu models, providing an alternative computational tool.

**Execution plan** (3 phases):

Phase 1 — CCWZ Setup (1 session):
1. Write the CCWZ Lagrangian for SO(11)/SO(4)xSO(7)
   - 28 Goldstones decompose as (4,1) + (4,3) + (4,3-bar) under SO(4)xSO(7) -> SU(2)_L x SU(2)_R x SU(3)
   - Parametrize coset using exponential map: U = exp(i*Pi^a*T^a/f)
   - SM gauge fields couple via d_mu and e_mu symbols (CCWZ d and e connections)
2. Specify SM gauge embedding into SO(11)
   - Pipeline: 121 -> 55 -> 18 -> 12 = u(1) x su(2) x su(3) [already derived]
   - Identify which SO(11) generators correspond to SU(3)_c, SU(2)_L, U(1)_Y
   - Assign U(1)_EM charges to all 28 pNGBs (partially done: S269 Part VIII)
3. Write verification script `alpha_ccwz_setup.py` confirming:
   - Correct pNGB count and charge assignments
   - Gauge boson mass matrix as function of pNGB VEV
   - Recovery of known results: sum(Q^2)_colored = 12, sum(Q^2)_total = 14

Phase 2 — One-Loop Gauge Kinetic Correction (1-2 sessions):
4. Compute one-loop Coleman-Weinberg effective potential from gauge boson loops
   - Use Marzocca et al. general formula: V_gauge ~ integral [p^2 dp^2] Sum_a log(1 + Pi_1/p^2 * f_a(h/f))
   - Impose first and second Weinberg sum rules for convergence
   - Extract the gauge kinetic coefficient: 1/g^2(mu) = N_c/(16*pi^2) * (form factor integral)
5. Extract C_2 from the calculation
   - Key test: does the one-loop coefficient equal 24/11?
   - Check: does the double-trace structure (12/11) * 2 emerge naturally?
   - Cross-check with Weinberg angle: same calculation should give sin^2 correction
6. Write verification script `alpha_ccwz_one_loop.py`
7. If C_2 = 24/11 confirmed: upgrade to [DERIVATION]. If not: document discrepancy.

Phase 3 — Three-Loop Extension: **COMPLETE** (S344)
8. D_3 = 1 [CONJECTURE]: 1/alpha = 15211/111 - (24/11)*alpha^2/pi + alpha^3/pi
9. Prediction: 137.035999177, **0.0006 sigma** from CODATA 2022
10. Defect charge selection THEOREM: [T_X, T_{a,4}] = 0 for all Higgs pNGBs
11. All coefficients RATIONAL in D_n basis: 15211/111, -24/11, +1
12. Script: `alpha_ccwz_three_loop.py` (24/24 PASS)

Phase 3b — D_3 Derivation Attempt: **INVESTIGATED** (S347)
13. Three routes: VEV counting [PLAUSIBLE], alternating signs [CONSISTENT], 2D sigma model [CONTEXTUAL]
14. Multi-route convergence strengthens D_3=1 but does NOT upgrade to [DERIVATION]
15. C_2 = k*(n-k-1)/n in Grassmannian notation (k=4, n=11)
16. Script: `alpha_d3_derivation_attempt.py` (23/23 PASS)

**Key references**:
- Marzocca, Serone, Shu (2012) JHEP 08(2012)013 — general composite Higgs one-loop
- Bykov (2021) arXiv:2106.15598 — Gross-Neveu reformulation of Grassmannian sigma models
- Bykov, Krivorol (2023) arXiv:2306.04555 — further Grassmannian development
- Hikami (1981) Prog. Theor. Phys. 64(4) 1466 — 3-loop orthogonal sigma models
- Wegner (1989) Nucl. Phys. B316 663 — 4-loop Grassmannian sigma models
- Barnard, Gherghetta, White (2013) JHEP 10(2013)055 — 2-loop composite Higgs
- Panico, Wulzer (2016) "The Composite Nambu-Goldstone Higgs" textbook
- Contino TASI lectures arXiv:1005.4269

**Feasibility**: MEDIUM (one-loop achievable, two-loop hard)
**Impact**: VERY HIGH (decisive for C_2, constrains C_3)
**Dependencies**: SM embedding into SO(11) (already done)
**Blocked by**: Nothing

---

#### Avenue 4: Joint Weinberg-Alpha Derivation [PRIORITY 2, joint with Avenue 2]

**Goal**: Derive Weinberg angle and alpha corrections from a SINGLE coset calculation, mutually constraining both.

**Current state**:
- sin^2(tree) = 28/121, dressed = 28/121 - alpha/(4*pi^2). C_W = 1 in alpha/(4*pi^2) basis. 0.5 ppm (but 1-parameter fit).
- 1/alpha(tree) = 15211/111, dressed with C_2 = 24/11 [DERIVATION]. 5.9 sigma (2-loop). With D_3=1 [CONJECTURE]: 0.0006 sigma (3-loop).
- Known relation: C_alpha/C_W_T3 = (24/11)/(6/11) = n_d = 4 [THEOREM]
- Mixing-vs-coupling distinction (S279): Weinberg is geometric (n_d), alpha is algebraic (charge traces)

**Execution**: Folded into Avenue 2 Phase 2. The CCWZ calculation naturally produces both:
- Gauge kinetic corrections -> alpha coefficient C_2
- Gauge boson mass corrections -> Weinberg angle coefficient C_W
- Consistency: joint derivation leaves less freedom for C_3

**Key test**: Does a single calculation produce BOTH C_W = 1/(4*pi) AND C_2 = 24/11?

**Feasibility**: MEDIUM-HIGH (shares infrastructure with Avenue 2)
**Impact**: HIGH (mutual constraints)
**Dependencies**: Avenue 2 Phase 1

---

#### Avenue 3: Factor-of-9 Gap [PRIORITY 3]

**Goal**: Understand why generator-level EM content (S_EM = 126) differs from scalar-level EM content (sum(Q^2)_coset = 14) by exactly 9 = Im_H^2.

**Current state** (S297):
- S_EM = 126 = N_I - n_c = 6*Im_H*Im_O (EM charge over 137 Lie algebra generators)
- sum(Q^2)_coset = 14 = Im_O * Tr_W(Q^2) = 7*2 (EM charge over 28 pNGBs)
- Ratio = 9 = Im_H^2 = 3^2
- Three unresolved candidates: (A) non-standard counting, (B) composite enhancement (9 scalar pairs per generator), (C) democratic bypass
- The alpha correction uses C = 24/11 from the scalar domain (not generator domain)

**Execution**:
1. Investigate the quaternionic structure: each u(n) generator acting on H = R^4 involves Im_H^2 = 9 independent real components? Verify algebraically.
2. Check whether the CCWZ Lagrangian (Avenue 2) naturally produces a factor of 9 between the abstract and propagating sectors.
3. Write verification script `factor_nine_gap_analysis.py`

**Feasibility**: MEDIUM
**Impact**: MEDIUM (clarifies tree-to-loop transition, doesn't directly compute C_3)
**Dependencies**: Illuminated by Avenue 2 results
**Blocked by**: Nothing

---

### BLOCKED (need Avenue 2 first)

#### Avenue 9: D_3 = 1 Derivation [PRIORITY 4, PARTIALLY RESOLVED]

**Goal**: Derive (or falsify) D_3 = 1 from three-loop composite dynamics.

**Current state** (S344/S347):
- D_3 = 1 in alpha^3/pi basis: 0.0006 sigma from CODATA [CONJECTURE, HRS 5]
- Equivalently C_3 = -pi in alpha^3/pi^2 basis (D_3 notation preferred: coefficient is rational)
- All coefficients RATIONAL in D_n basis: 15211/111, -24/11, +1
- C_2 = k*(n-k-1)/n in Grassmannian notation (S347)
- D_3 = k-(k-1) = N_physical_Higgs = 1 in Grassmannian/EWSB counting

**No longer blocked**: Phases 1-3 of Avenue 2 COMPLETE. D_3 derivation attempt (S347) investigated three routes:
- Route 1 (VEV counting): D_3 = N_VEV = 1 [PLAUSIBLE]
- Route 2 (alternating signs): (+,-,+) pattern [CONSISTENT]
- Route 3 (2D sigma model): C_2 has Grassmannian expression [CONTEXTUAL]
- Multi-route convergence strengthens but does NOT prove D_3 = 1

**Remaining**: A DERIVATION requires one of:
- 2-loop CW potential on SO(11)/SO(4)xSO(7) with VEV
- 3-loop 2D sigma model beta on Gr(4,11;R) (Wegner framework)
- Topological/index theorem argument

**Feasibility**: MEDIUM (infrastructure now exists from Phases 1-3)
**Impact**: HIGH (would upgrade D_3 from [CONJECTURE] to [DERIVATION])

---

### LONG-TERM (speculative, low feasibility)

#### Avenue 5: Band C Triple-Trace Pattern

**Goal**: Check if the k-trace pattern C_k = (k-trace) * (propagator)^(k-1) predicts C_3.

**Problem**: C_2 = 24/11 is rational (from traces), C_3 = -pi is transcendental. The pattern breaks at three loops, suggesting qualitatively different physics. The jump from algebraic to geometric at three loops is interesting but cannot be attacked by pattern analysis alone.

**Execution**: Park until Avenue 2 provides the calculational framework. Then check whether the loop expansion naturally produces rational coefficients at one-loop and transcendental at two-loop.

**Feasibility**: LOW | **Impact**: LOW-MEDIUM

#### Avenue 6: Non-Perturbative Resummation

**Goal**: Determine if the perturbative alpha^n/pi^n expansion is the wrong organizing principle for a fundamentally non-perturbative framework.

**Obstacles**:
- Gr(4,11;R) has H_2 = Z/2 (S291), so no non-trivial instantons
- 1/n_c expansion (n_c=11) gives corrections at wrong scale
- Bykov's Gross-Neveu reformulation exists for 2D but extending to 4D gauge coupling corrections is a major theoretical step

**Feasibility**: LOW | **Impact**: HIGH if successful

---

### DEAD (eliminated by S332 survey)

#### Avenue 1: Scale Identification [DEAD — wrong sign]

Standard QED running from any high scale DOWN to q=0 **increases** 1/alpha (b_1 > 0, vacuum polarization screens charge). The framework already **overshoots** (137.036036 > 137.035999). Running makes the gap worse. This is [THEOREM] from the QED beta function sign.

The needed correction after C_2 is also positive (+1.237e-7), which is the same direction as the tree overshoot — opposite to what running provides. Threshold corrections can go either direction but the post-C_2 residual sign makes this avenue unproductive.

**Verdict**: Eliminated. The formula is algebraic, not scale-dependent.

#### Avenue 7: IRA-04 Resolution [DEAD — no coupling]

Explicitly documented in IRREDUCIBLE_ASSUMPTIONS.md: "Does NOT affect: breaking pattern, gauge group, alpha, Weinberg angle, Omega_m." The quartic ratio rho = c_4/b_4 only affects shape mode masses. Alpha derivation chain is entirely independent.

**Verdict**: Eliminated.

#### Avenue 8: Hadronic VP Feedback [DEAD — wrong magnitude]

No existing analysis in the codebase. The hadronic VP contribution to alpha(q=0) is ~0.0277 in 1/alpha — already absorbed in the CODATA measurement. A 0.82% shift in R(s) from framework QCD would change this by ~10^-4 — three orders of magnitude too large for the 10^-7 residual. Cannot explain the small gap.

**Verdict**: Eliminated.

---

## Execution Order and Dependencies

```
Phase 1: CCWZ Setup [Avenue 2, Phase 1]
  |
  v
Phase 2: One-Loop Calculation [Avenue 2, Phase 2 + Avenue 4]
  |       Simultaneously: Factor-of-9 Analysis [Avenue 3]
  |
  v
  Decision point: Does C_2 = 24/11 emerge?
  |
  YES --> Phase 3: Three-Loop Extension [Avenue 2, Phase 3 + Avenue 9]
  |                Also: Band C Pattern Check [Avenue 5]
  |
  NO  --> Reassess: What does the calculation give?
          Is the double-trace identification wrong?
          Does a different C_2 improve or worsen the fit?
```

**Estimated sessions**: 3-5 (Phase 1: 1, Phase 2: 1-2, Phase 3: 1-2)

---

## Success Criteria

| Outcome | What it means | Action |
|---------|---------------|--------|
| C_2 = 24/11 from CCWZ | Double-trace structure confirmed | Upgrade to [DERIVATION]; proceed to C_3 |
| C_2 != 24/11 from CCWZ | Structural identification wrong | Document discrepancy; reassess correction paradigm |
| C_3 = -pi from two-loop CCWZ | Three-loop closed | Upgrade to [DERIVATION]; alpha prediction complete |
| C_3 != -pi | Either pi is coincidence or calculation incomplete | Document; check if different C_3 improves fit |
| CCWZ intractable on SO(11) | Coset too large for explicit computation | Fall back to 2D sigma model (Hikami); or abstract consistency arguments |

---

## Falsification Criteria

1. If CCWZ gives C_2 that is inconsistent with 24/11 AND the alternative doesn't improve the fit -> correction paradigm fails
2. If new CODATA value moves alpha AWAY from 137.035999053 -> 2-loop prediction wrong direction
3. If the band structure (A/B/C/D) breaks down for other quantities -> tree-to-dressed not systematic
4. If the joint Weinberg-alpha calculation produces internal contradictions -> coset geometry doesn't govern both

---

## Key Files

| File | Content |
|------|---------|
| `framework/investigations/alpha/alpha_radiative_gap.md` | Full state of alpha corrections (Parts I-XVI) |
| `framework/investigations/alpha/ALPHA_DERIVATION_MASTER.md` | Complete 17-step derivation chain |
| `framework/IRREDUCIBLE_ASSUMPTIONS.md` | IRA inventory (4 remaining) |
| `topics/step5-alpha-mechanism.md` | Step 5 topic file |
| `verification/sympy/alpha_three_loop_residual.py` | Three-loop numerical analysis (21/21 PASS) |
| `verification/sympy/alpha_C_derivation_composite.py` | C=24/11 derivation chain (17/17 PASS) |
| `verification/sympy/alpha_C_channel_fraction.py` | Channel fraction analysis (10/10 PASS) |
| `verification/sympy/alpha_em_index_density.py` | EM index density (21/21 PASS) |
| `verification/sympy/conj_a2_sigma_model_coefficient.py` | Sigma model + factor-of-9 (12/12 PASS) |
| `sessions/S262.md` | QED running analysis |
| `sessions/S266.md` | Tree-to-dressed paradigm, C=24/11 |
| `sessions/S269.md` | Structural derivation of C=24/n_c |
| `sessions/S272.md` | EM index density |
| `sessions/S297.md` | CONJ-A2 partial resolution, factor-of-9 |
| `sessions/S331.md` | Three-loop residual analysis |

---

*Created S332 (2026-02-09). Survey of 9 avenues: 3 immediate, 1 blocked, 2 long-term, 3 dead. Priority 1: CCWZ one-loop on SO(11)/SO(4)xSO(7).*
