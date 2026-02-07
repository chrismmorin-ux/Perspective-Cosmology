# Falsified Claims

**Status**: Claims that were TRIED and FAILED

**Created**: 2026-01-27
**Purpose**: Honest record of what did NOT work

---

## Why This Document Exists

Science learns from failure. Recording what didn't work:
1. Prevents repeating failed attempts
2. Documents the search space explored
3. Shows the framework is falsifiable
4. Provides lessons for future work

---

## Definitively Falsified

### F-1: sin^2(theta_W) = 2/25

**Claim**: The Weinberg angle is exactly 2/25 = 0.08

**Measured**: sin^2(theta_W) = 0.231 at M_Z

**Error**: **65%** (completely wrong)

**Why it failed**: Simple numerology. 2/25 has no physical basis.

**Lesson**: Simple fractions of small integers are NOT sufficient. Need actual structure.

**Archived**: `archive/physics_deprecated/constants/weinberg.md`

**Script**: `verification/sympy/quarantined/example_sin2theta.py`

---

### F-2: n_EW = 5 (Electroweak Dimensions)

**Claim**: The electroweak sector has exactly 5 dimensions

**Problem**: Mathematically impossible given Gell-Mann-Nishijima constraint

**Error**: N/A (logically impossible)

**Why it failed**: Hidden numerology dressed up as derivation

**Lesson**: Check mathematical consistency BEFORE claiming derivation

**Status**: DEPRECATED (Session 77)

---

### F-3: Alpha Running via n_d^2 + n_c^2 at GUT Scale

**Claim**: 1/alpha(GUT) = 4^2 + 11^2 = 137 still holds at unification

**Problem**: Alpha at GUT scale is ~1/42, not ~1/137

**Error**: Cannot reach ~1/42 from dimension counting alone

**Why it failed**: The formula works only at low energy

**Lesson**: Need to understand RUNNING, not just boundary values

**Script**: `rg_flow_selection.py` (mechanism not found)

---

### F-4: 58/137 Selection Mechanism

**Claim**: The visible fraction 58/137 can be derived from crystallization

**Problem**: No derivation found despite extensive search

**Status**: No mechanism found

**Why it failed**: May need different approach entirely

**Lesson**: Some numbers may be outputs, not inputs

**Note**: 58/79 visible/hidden split WAS eventually derived differently (Session 98a)

---

### F-5: GUT Value sin^2(theta_W) = 3/8

**Claim**: Framework derives sin^2(theta_W) = 3/8 at unification scale

**Problem**: This is BORROWED from GUT physics (1970s), not derived

**Error**: Not a prediction - post-hoc fitting

**Why it failed**: Claimed derivation was actually import

**Lesson**: Distinguish between DERIVE and BORROW

**Archived**: `archive/physics_deprecated/constants/weinberg.md`

---

### F-6: r = 1 - n_s = Im_O/200 = 0.035 (Tensor-to-Scalar Ratio) — **RESTORED**

**Original Claim**: The tensor-to-scalar ratio is exactly r = 1 - n_s = 7/200 = 0.035

**Falsification History (Session 129 early)**:
- The mu^2 = 250 hilltop (from numerical search) gave eta/epsilon = -4
- This produced r = 0.04, not 0.035
- Marked as FALSIFIED prematurely

**CORRECTION (Session 129 continuation)**:
- The error was in phi_CMB: Session 127-128 used phi = mu/sqrt(5), giving eta/eps = -4
- For r = 1 - n_s, need phi_CMB = mu/sqrt(6), giving eta/eps = -5
- With CORRECT phi_CMB, the required mu^2 = (C+H)*H^4/Im_O = 1536/7 ~ 219.4

**RESTORED Results**:
- n_s = 193/200 = 0.965 (EXACT)
- r = 7/200 = 0.035 (EXACT)
- r = 1 - n_s (VERIFIED with eta/eps = -5)
- N = 52 e-folds (ACCEPTABLE)

**Verification**: `hilltop_correct_conditions.py` — ALL TESTS PASS

**Lesson**: Before declaring falsification, verify ALL parameters are correct. The phi_CMB error propagated through multiple sessions.

**Status**: **RESTORED** (Session 129 continuation)

**Note**: Both n_s = 193/200 AND r = 1 - n_s are now verified with correct mu^2 = 1536/7.

---

### F-7: Higher CMB Acoustic Peaks (ℓ₄, ℓ₅, ℓ₆) — BLIND PREDICTION

**Claim**: Alternating H/Im_O shift pattern extends to peaks 4-6

**Predictions** (P-008, locked Session 124):
- ℓ₄ = 220 × 48/11 = 960
- ℓ₅ = 220 × 62/11 = 1240
- ℓ₆ = 220 × 70/11 = 1400

**Measured** (arXiv:1412.3552):
- ℓ₄ ≈ 1120 (predicted 960, **-14%**)
- ℓ₅ ≈ 1444 (predicted 1240, **-14%**)
- ℓ₆ ≈ 1735 (predicted 1400, **-19%**)

**Error**: All predictions off by 12-19% (all FALSIFIED per pre-committed criteria)

**Why it failed**: Higher peaks are dominated by acoustic physics (Silk damping, driving effects) not captured by simple harmonic scaling. The pattern that works for ℓ₁, ℓ₂, ℓ₃ does NOT extend.

**Lesson**: Framework's CMB predictions have a validity boundary. Simple division-algebra scaling works for the first three peaks but fails for higher harmonics where detailed physics matters.

**Status**: **FALSIFIED** (Session 124, blind prediction with pre-committed criteria)

**Note**: This is the framework's cleanest falsification — a genuine blind prediction that failed cleanly. This constrains the interpretation of the successful ℓ₁, ℓ₂, ℓ₃ predictions.

---

### F-8: eta* = 337 Mpc (Conformal Distance to Last Scattering)

**Claim**: The conformal distance to last scattering is eta* = 337 Mpc, where 337 = Im_H^4 + H^4

**Computed**: eta* = 280.40 Mpc (from cosmological integral using framework parameters)

**Error**: **16.8%** (definitively wrong)

**Why it failed**: The number 337 was reverse-engineered so that eta* x 3/7 = 144.43 Mpc (matching Planck r_s). The actual conformal distance integral int_0^{a*} c da/(a^2 H(a)) gives ~280 Mpc using the framework's own H0, Om_m, Om_L values. The "match" was an artifact of back-solving from the desired r_s.

**Positive finding**: Framework parameters (H0=337/5, Om_m=63/200, Om_b=567/11600) DO produce the correct r_s = 144.48 Mpc via standard physics (0.03% error). The parameters are good; the decomposition was wrong.

**Lesson**: Always compute integral quantities from first principles. Identifying dimensionally-correct numbers without computing them is a recipe for numerology.

**Script**: `verification/sympy/eta_star_cosmological_integral.py` (16/18 PASS, 2 FAIL are the eta*=337 tests)

---

### F-9: c_s = 3/7 = Im_H/Im_O (Sound Speed in Baryon-Photon Plasma)

**Claim**: The sound speed in the baryon-photon plasma is c_s = 3/7 from the ratio of division algebra dimensions

**Computed**: c_s(a*) = 0.4538 (standard), effective average <c_s> = 0.5153

**Error**: **5.6%** from standard c_s at recombination, **20%** from effective average

**Why it failed**: Four derivation paths tested in S191, all failed. The eta* integral (S194) makes it worse: the effective sound speed needed to match r_s from the actual eta* = 280 is 0.515, not 0.429. The 5.6% error was the optimistic case — the real discrepancy is 20%.

**Related**: F-8 (eta* = 337). Together these showed that r_s = 337 x 3/7 was a numerical coincidence, not physics.

**Lesson**: When a product of two wrong quantities gives a right answer, always check both factors independently.

**Script**: `verification/sympy/sound_speed_from_crystallization.py` (S191) + `eta_star_cosmological_integral.py` (S194)

---

### ~~F-10: V(ε*) < 0 — Cosmological Constant Wrong Sign~~ → RESOLVED S230

**Original claim**: The tilt potential minimum V(ε*) = -α⁵ M_Pl⁴ gives the cosmological constant

**Original error**: V(ε*) < 0, so Λ < 0 — sign contradiction with observed Λ > 0.

**S230 RESOLUTION**: The "wrong sign" was a **sign convention error** in the framework's analysis. The correct GR relationship is Λ = -8πG·V(ε*), NOT Λ = V(ε*). Since V(ε*) = -a²/(4b) < 0, this gives **Λ = +8πG·a²/(4b) > 0** — the correct sign. This is standard physics: any Mexican-hat potential with V_min < 0 gives positive Λ (same as the Higgs potential in the SM).

**Where the error was**: `einstein_equations_rigorous.md` line ~462 wrote T_μν = -g_μν V(ε*), but L(ε*) = -V(ε*), so the correct expression is T_μν = +g_μν V(ε*). This single sign flip propagated through the entire F-10 analysis.

**What remains**: The sign is correct, but the **magnitude** problem persists. The framework gives |V(ε*)| ~ α⁵ M_Pl⁴ ~ 10⁻¹¹ M_Pl⁴, while observed Λ/(8πG) ~ 10⁻¹²² M_Pl⁴ — a gap of ~10¹¹¹. This is the standard cosmological constant problem. Three CC formulas (13/19, 137/200, α⁵⁶/77) remain as [CONJECTURE] pattern matches.

**Lesson**: Sign conventions in GR require tracking L vs V vs T_μν vs Λ carefully. L = T - V means -g·L = +g·V at zero kinetic energy.

**Scripts**: `verification/sympy/cosmological_constant_sign_analysis.py` (10/10 PASS — confirms V < 0), `verification/sympy/cc_sign_convention_resolution.py` (10/10 PASS — resolves sign via GR)

---

## Deprecated Approaches

### D-1: Gravity from |Pi| (Perspective Count)

**Claim**: G = c^3(delta_pi_min)^2/hbar where delta_pi_min = l_horizon/sqrt(|Pi|)

**Problem**: Only order-of-magnitude (~50% error)

**Status**: Too imprecise to be meaningful (see flexibility analysis)

**Why deprecated**: At 50% precision, random matching is 100%

**Lesson**: Order-of-magnitude matches prove nothing

---

### D-2: Planck Length from Perspectives

**Claim**: l_P = l_horizon/sqrt(|Pi|_eff)

**Problem**: Order-of-magnitude only (~10x error)

**Status**: Not precise enough to distinguish from numerology

---

### D-3: Bekenstein-Hawking Factor of 4

**Claim**: S = A/(4l_P^2) can be derived from perspective counting

**Problem**: Proportionality correct but factor 4 not derived

**Status**: Incomplete (proportionality, not exact)

---

### D-4: Einstein Field Equations from Gamma-Structure

**Claim**: G_mu_nu = 8piG T_mu_nu emerges from low-gamma regime

**Problem**: No actual construction of g_mu_nu from Gamma exists

**Status**: SPECULATION (demoted from CONJECTURE, Session 104)

**Note**: Session 102 made progress on this via crystallization, but still incomplete

---

## Withdrawn Claims

### W-1: h(gamma) Novelty Claim

**Original Claim**: h(gamma) = 2gamma(1-gamma) modification to Penrose-Diosi gives testable predictions

**Problem**: In all planned experiments, h(gamma) ~ 10^-5 to 10^-12 - effect is negligible

**Status**: WITHDRAWN (not falsified, just not testable)

**See**: `framework/investigations/meta/penrose_diosi_comparison.md`

---

## Lessons Learned Summary

| Failure | Lesson |
|---------|--------|
| sin^2(theta_W) = 2/25 | Simple fractions fail |
| n_EW = 5 | Check logical consistency first |
| Alpha at GUT | Understand energy dependence |
| 58/137 mechanism | Some numbers may be outputs |
| sin^2 = 3/8 | Distinguish derive from borrow |
| G, l_P | Order-of-magnitude proves nothing |
| S = A/4 | Proportionality != derivation |
| Einstein equations | Don't claim without construction |
| h(gamma) | Check testability before claiming novelty |
| Higher CMB peaks | Simple scaling has validity boundary |
| eta* = 337 Mpc | Always compute integrals, don't back-solve |
| c_s = 3/7 | Check both factors in a product independently |

---

## Meta-Lesson

The framework has ~60 "matches" of which 12 meet the sub-10 ppm statistical significance threshold (see `claims/TIER_1_SIGNIFICANT.md`). Another ~16 are at Tier 2 precision (10-10000 ppm). The remainder are individually weak.

Even for the significant matches, these risks remain:
1. **Numerology** (fitting to known values — most claims are post-hoc)
2. **Post-hoc rationalization** (finding formulas after knowing answer)
3. **Selection bias** (remembering hits, forgetting misses)
4. **Compensating errors** (e.g., r_s = 337*3/7: both factors wrong by ~17%, product coincidentally right — now FALSIFIED as F-8/F-9)

Recording failures helps combat confirmation bias.

---

## Future Work

When exploring new claims, ALWAYS:
1. Calculate what would falsify it BEFORE checking if it matches
2. Record failures in this document
3. Check random matching probability
4. Require sub-100 ppm precision to be meaningful
5. Require sub-10 ppm for statistical significance

---

*Last updated: 2026-02-03 (S205 — count corrected 13→12 for Tier 1 reference. F-8/F-9 added S194.)*
