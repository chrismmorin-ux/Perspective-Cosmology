---
title: 'Executive Summary'
description: 'Two-page overview for first contact with the framework'
version: '1.0'
lastUpdated: '2026-02-09'
---

# Perspective Cosmology: Executive Summary

**Last Updated**: 2026-02-09 (Session S357)
**Version**: 1.0
**Purpose**: Two-page overview for first contact with the framework.
**Audience**: Physicists evaluating whether to invest 30 minutes reading further.
**Status**: CURRENT
**Reading Time**: ~5 minutes

---

## 1. The Claim

A single axiom system -- the Consistent Completeness Principle (CCP) applied to division algebras -- forces the following chain of consequences:

The four normed division algebras (R, C, H, O with dimensions 1, 2, 4, 8) are the only such algebras by the Hurwitz theorem. CCP selects the complex field F=C and determines two integers: the crystal dimension n_c = 11 (sum of imaginary dimensions: 1+3+7) and the defect dimension n_d = 4 (largest associative algebra, H).

From n_c = 11 and n_d = 4 alone, the framework derives:

- **Gauge group**: SU(3) x SU(2) x U(1) via the pipeline dim(End(R^11)) = 121 -> 55 -> 18 -> 12
- **Fermion content**: 15 Weyl fermions per generation from division algebra representations
- **Three generations**: From Hom(H, R^7) and the Im(H) = 3 decomposition
- **3+1 spacetime dimensions**: n_d = 4 from the Frobenius theorem
- **Quantum mechanics**: Hilbert space, Born rule, and Schrodinger equation from perspective axioms
- **General relativity**: Einstein field equations from Goldstone dynamics on the coset SO(11)/[SO(4) x SO(7)]
- **63+ physical constants**: Including the fine structure constant, Weinberg angle, Hubble constant, and matter density -- all from integer arithmetic on {1, 2, 4, 8, 11}

Zero free parameters for the key ratios.

---

## 2. The Evidence

**Three headline results:**

| Quantity | Framework Formula | Tree | Dressed | Type |
|----------|------------------|------|---------|------|
| 1/alpha | 15211/111 + loop corrections | 0.27 ppm | **0.0006 sigma** | Post-hoc |
| sin^2(theta_W) | 28/121 - alpha/(4pi^2) | 0.08% | **0.00 sigma** | Derived |
| Omega_m | 63/200 | 0.04 sigma | -- | Derived |

Tree values are algebraic starting points; dressed values include framework-derived radiative corrections with rational coefficients. No parameters are adjusted to fit.

**Blind predictions**: 9 predictions were locked *before* checking measurements. 6 of 7 CMB predictions fall within 1 sigma of Planck 2018 values. Combined P-value for blind predictions: ~2.5 x 10^-7.

**Structural derivations**: The SM gauge group, quantum mechanics (grade A -- fully canonical), Einstein field equations, Yang-Mills mass gap and glueball spectrum (grade A-), 3 generations, CKM mixing mechanism, and 12 confirmed non-observations (proton stability, no magnetic monopoles, etc.).

---

## 3. Why You Should Be Skeptical

**Self-assessed probability**: 25-40% genuine physics (Red Team v3.0, three-critic adversarial review).

**The building blocks are not special.** A Monte Carlo test (5000 random 7-element subsets of {1,...,20}) showed the framework's building blocks are at the 51st percentile for matching physics constants at 0.1% precision. Any 7 small integers do roughly as well.

**Most predictions are post-hoc.** All 12 sub-10 ppm numerical matches were identified after knowing the target values. The framework's strongest statistical evidence comes entirely from the 9 blind predictions.

**14 documented failures.** Including 3 formal retractions (Grassmannian topology, SU(3) misidentification, dark states). These are published alongside the successes.

**4 irreducible assumptions remain.** One structural (quartic ratio), two physical (SSB occurs, time = adjacency), one import (|Pi| scale). Zero are conjectural -- all are explicit and tagged.

**The cosmological constant magnitude gap is unsolved.** The framework gives the CC sign correctly but cannot explain the ~10^111 magnitude discrepancy.

**This is amateur work.** The author is not a professional physicist. The project uses AI assistance (Claude, Anthropic) extensively. No human expert has reviewed the derivations. 736+ verification scripts (99.8% pass rate) provide computational checks but cannot substitute for peer review.

---

## 4. How to Check

**Three formulas to verify independently** (5 minutes with any CAS):

1. `1/alpha` tree: 15211/111 = 137.036036 (0.27 ppm). Dressed: 137.035999177 (**0.0006 sigma** from CODATA 2022).
2. `sin^2(theta_W)` tree: 28/121 = 0.23140 (0.08%). Dressed: 28/121 - alpha/(4pi^2) = 0.23122 (**0.00 sigma** from PDG).
3. `Omega_m = 63/200 = 0.315` vs Planck 2018: 0.315 +/- 0.007. Within measurement uncertainty.

**Full verification**: 736+ SymPy scripts at `verification/sympy/` with documented assumptions, exact arithmetic, and PASS/FAIL output.

**Technical reading order**:
1. *Perspective Cosmology: Mathematical Foundations* -- full axiomatic development (2139 lines, 46 verification scripts)
2. *Interpretive Companion* -- physical interpretation and predictions (2131 lines)
3. `publications/HONEST_ASSESSMENT.md` -- candid self-evaluation with phase grades
4. `publications/AI_METHODOLOGY.md` -- the AI-assisted methodology as a replicable protocol

**All materials, scripts, and session records at**: https://github.com/cmorin-perspective/perspective-universe

**Contact**: christopher.morin@perspectivecosmology.com

---

## Key References

| File | Role |
|------|------|
| `claims/TIER_1_SIGNIFICANT.md` | 12 sub-10 ppm predictions (9 robust) |
| `predictions/BLIND_PREDICTIONS.md` | 9 blind predictions (P ~ 2.5 x 10^-7) |
| `framework/STATISTICAL_ANALYSIS_HONEST.md` | Honest P-value range: 10^-8 to 10^-7 |
| `publications/HONEST_ASSESSMENT.md` | Self-assessment: 25-40% genuine physics |
| `claims/FALSIFIED.md` | 14 falsified predictions |

---

## Revision History

| Version | Date | Session | Changes |
|---------|------|---------|---------|
| 1.0 | 2026-02-09 | S357 | Initial version |

---

*Status: Speculative theoretical framework. Not peer-reviewed. Amateur work with AI assistance.*
*Affiliation: Amateur researcher with AI assistance*
