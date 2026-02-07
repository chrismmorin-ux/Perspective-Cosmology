# LLM Derivation Challenge — Results Summary

**Created**: Session 128
**Last Updated**: Session 257 (V2 Test 1 added 2026-02-07)

---

## Summary Statistics

| Test | Model | Variant | n_d | n_c | 137 | Outcome |
|------|-------|---------|-----|-----|-----|---------|
| 1 | Claude (internal) | V1 | 4 | 11 | 137 | FULL SUCCESS |
| 2 | ChatGPT GPT-4o | V1 | 3 | 4 | 25 | INTERESTING FAILURE |
| 3 | Google Gemini | V1 | 4 | 11 | 137 | FULL SUCCESS |
| 4 | ChatGPT GPT-4o | V1-tight | 4 | 11 | 137 | FULL SUCCESS |

### V2 Challenge (S257, expanded scope with CCP)

| Test | Model | Variant | Structural (Q1-5) | Algebraic (Q6-8) | Numerical (Q9) | Reps (Q10) | Outcome |
|------|-------|---------|--------------------|-------------------|-----------------|------------|---------|
| V2-1 | Claude (fresh) | V2-CCP | 5/5 PASS | 2 PASS + 1 PARTIAL | 3/3 PASS (guided) | 3/3 PASS | PARTIAL SUCCESS (15/18) |

**V2 notes**: 10 questions (vs 3 in V1). CCP axiom included. Q8 partial: got U(1)xSO(3)xG_2 instead of full SM reduction. Q9 was guided (formula structures given). See `v2_test1_external.md` for details.

**Per-test details**: See individual files in this directory.

---

## Interpretation Analysis

**Created**: Session 134
**Investigation**: `framework/investigations/division_algebra_ambiguity_analysis.md`
**Verification**: `verification/sympy/division_algebra_ambiguity_analysis.py` -- PASS

### The Two Ambiguities

The LLM Challenge revealed two points where the axiom document permits different defensible readings:

| Ambiguity | Framework Reading | GPT-4o Reading | Classification |
|-----------|-------------------|----------------|----------------|
| **1: n_d definition** | dim(H) = 4 (full algebra dimension) | dim(Im(H)) = 3 (imaginary part only) | INTERPRETIVE, strongly favoring 4 |
| **2: n_c scope** | Im(C)+Im(H)+Im(O) = 1+3+7 = 11 (all Hurwitz algebras) | Im(R)+Im(C)+Im(H) = 0+1+3 = 4 (Frobenius only) | INTERPRETIVE, strongly favoring 11 |

### Consistency Scorecard

Five independent consistency tests were applied to each interpretation:

| Test | (4, 11) | (3, 4) | (4, 4) |
|------|---------|--------|--------|
| Partition Identity (n_d + n_c = 15) | PASS | FAIL | FAIL |
| Primality (n_d^2 + n_c^2 prime) | PASS | FAIL | FAIL |
| Denominator Polynomials | PASS (3/3) | FAIL (0/3) | FAIL (0/3) |
| SO(n_c) -> SU(3) Breaking | PASS | FAIL | FAIL |
| Framework Prime Generation | PASS (7/7) | FAIL (3/7) | FAIL (3/7) |
| **TOTAL** | **5/5** | **0/5** | **0/5** |

### Key Insight

The Hurwitz-Frobenius distinction is the crux of Ambiguity 2:
- **Hurwitz** classifies what **exists** as normed division algebras (R, C, H, O)
- **Frobenius** classifies what's **associative** and can serve as the transition algebra (R, C, H)
- O exists and has 7 imaginary dimensions -- those dimensions are structurally present even though O can't carry time evolution
- GPT-4o's exclusion of O is logically coherent but produces a cascade of downstream failures

### Honest Assessment

Neither ambiguity is a flaw in the mathematical framework. Both are ambiguities in the challenge document's *language*. The alternatives aren't just slightly worse -- they fail every consistency test completely.

However, calling these choices "forced" would be overstating the case. They are *strongly constrained* by downstream consistency, not *uniquely determined* by the axioms alone.

### Recommendation

Re-run the LLM Challenge with the tightened axiom document (edited Session 134) to verify that the ambiguities are now closed. The edits:
1. Added "Key Distinction" box distinguishing Hurwitz from Frobenius roles
2. Tightened n_d definition: explicit that n_d = dim(D), full dimension including real axis
3. Tightened n_c definition: explicit that n_c sums over ALL normed division algebras (Hurwitz)

---

## Implications

### If All Tests Succeed

Would indicate:
- Mathematical necessity (not numerology)
- Reproducible derivation chain
- Framework captures real structure

Probability update: 15-30% -> 30-40%

### If Tests Diverge

Would indicate:
- Hidden flexibility in axioms
- Multiple valid interpretations
- Need tighter constraints

---

## Variant 2: Ambiguity Analysis Challenge

**Created**: Session 134
**Runbook**: `registry/llm_challenge/prompts/variant_2_ambiguity.md`

Instead of asking models to derive specific values, Variant 2 asks them to identify where the axioms permit different interpretations, argue both sides, and evaluate which reading is more self-consistent. This is more useful than rerunning Variant 1 with tightened axioms because it tests whether independent reasoners can *find* the weak points rather than just follow clearer instructions.

**Known ambiguities to detect**: (1) n_d = dim(D) vs dim(Im(D)), (2) n_c scope = Hurwitz vs Frobenius
**Bonus ambiguities**: (3) associativity not strictly axiomatic, (4) why maximum algebra, (5) why sum imaginary dims

Results will be recorded as individual test files when tests are run.

---

*This document will be updated as more tests are run.*
