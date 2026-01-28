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

**See**: `physics/penrose_diosi_comparison.md`

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

---

## Meta-Lesson

The framework has ~45 "matches" but only 3 are statistically significant.

The rest (including some above) are likely:
1. **Numerology** (fitting to known values)
2. **Post-hoc rationalization** (finding formulas after knowing answer)
3. **Selection bias** (remembering hits, forgetting misses)

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

*Last updated: 2026-01-27 (Session 106)*
