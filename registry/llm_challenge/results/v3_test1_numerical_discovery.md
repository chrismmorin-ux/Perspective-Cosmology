# V3 Test 1: Numerical Formula Discovery (GPT-4o)

**Date**: 2026-02-07
**Model**: ChatGPT (GPT-4o, fresh session)
**Platform**: ChatGPT
**Session**: Fresh (no prior framework context)
**Challenge Version**: V3 (numerical discovery — forward/backward separation)

---

## Prompt Given

V3 prompt with established structural results (n_d=4, n_c=11, D_fw, Grassmannian structure, sector decomposition, all key dimensions). Three questions: (Q1) find correction to 137 in forward/backward/reverse phases, (Q2) find sin^2(theta_W), (Q3) open exploration. No formulas given. No cyclotomic hints.

---

## Critical LLM Errors

### 1. n_d/n_c Swap
Despite prompt clearly stating n_d = 4, n_c = 11, the LLM re-derived from 137 = n_d^2 + n_c^2 and assigned **(n_d, n_c) = (11, 4)** — backwards. This didn't affect available numbers but shows poor prompt compliance.

### 2. Numerical Hallucination (Axiom Attempt)
When user asked for "a single new axiom," LLM proposed correction:
- delta = n_c/(n_d(n_d^2 + n_c^2)) = 4/(11 x 137) = 4/1507
- Claimed: 137 x (1 + 4/1507) = 137.0360

**ACTUAL VALUE**: 137 x (1 + 4/1507) = 1511/11 = **137.3636...**

The LLM confused additive correction 0.036 with multiplicative correction 0.00265. A classic numerical hallucination caught by SymPy verification.

---

## Question 1: Alpha Correction

### Part A (Forward — No Target)

LLM explored 13 candidates systematically:

| # | Expression | Value | Motivation | Close? |
|---|-----------|-------|------------|--------|
| 1 | n_c/n_d (= 4/11) | 0.3636 | Anisotropy ratio | No (10x too large) |
| 2 | (n_c/n_d)^2 | 0.1322 | Squared anisotropy | No |
| 3 | n_c^2/(n_d^2+n_c^2) | 0.1168 | Projection | No |
| 4 | n_d*n_c/(n_d^2+n_c^2) | 0.3211 | Mixed ratio | No |
| 5 | 1/(n_d^2+n_c^2) = 1/137 | 0.00730 | Inverse invariant | Too small |
| 6 | 1/n_d = 1/11 | 0.0909 | Inverse dim | No |
| 7 | 1/n_c = 1/4 | 0.25 | Inverse dim | No |
| 8 | 1/n_d^2 = 1/121 | 0.00826 | Quadratic Casimir | Too small |
| 9 | 1/n_c^2 = 1/16 | 0.0625 | Quadratic Casimir | No |
| 10 | (n_d^2-n_c^2)/(n_d^2+n_c^2) | 0.7664 | Asymmetry | No |
| 11 | 1/(n_d*n_c) = 1/44 | 0.02273 | Mixed inverse | Closest but still off |
| 12 | 1/(2*n_d*n_c) = 1/88 | 0.01136 | Half-trace | Too small |
| 13 | n_c^2/n_d^3 = 16/1331 | 0.01202 | Higher-order | Too small |

**Result: FAIL.** No candidate near 0.036. Closest was 1/44 = 0.0227 (37% error).

### Part B (Comparison to Measurement)

Target: 0.035999206

All 13 candidates compared. None within a factor of 2 of target. Important negative result documented by the LLM itself.

### Part C (Reverse Search)

Starting from 0.036, the LLM tried:

| Expression | Value | Error from 0.036 |
|-----------|-------|-------------------|
| n_c/n_d^2 = 4/121 | 0.03306 | -8.2% |
| (n_d-n_c)/n_d^2 = 7/121 | 0.05785 | +61% |
| n_c/(n_d^2+n_c^2) = 4/137 | 0.02920 | -18.9% |

**Best reverse result**: 4/121 = 0.03306 (8.2% off)

**KEY NEGATIVE**: The LLM NEVER tried:
- n_c^2 - n_c + 1 = 111 as a denominator
- n_d/(n_c^2 - n_c + 1) = 4/111 = 0.036036 (the framework answer)
- Any cyclotomic polynomial evaluation
- Any polynomial of form n^2 - n + 1 or n^2 + n + 1

The number 111 does not appear anywhere in the LLM's search.

### Part A+B+C Combined Grade: **INTERESTING FAILURE**

---

## Question 2: Weinberg Angle

Target: sin^2(theta_W) = 0.23122

| Expression | Value | Error |
|-----------|-------|-------|
| n_c/n_d = 4/11 | 0.3636 | +57% |
| n_c^2/n_d^2 = 16/121 | 0.1322 | -43% |
| n_c/(n_d+n_c) = 4/15 | 0.2667 | +15% |
| n_c^2/(n_d^2+n_c^2) = 16/137 | 0.1168 | -49% |
| n_d/(n_d^2+n_c^2) = 11/137 | 0.0803 | -65% |
| (n_d-n_c)/n_d = 7/11 | 0.6364 | +175% |

**CRITICAL MISS**: The LLM never tried **28/121 = 0.2314** (0.08% from measurement), despite both numbers being EXPLICITLY listed in the prompt:
- dim(Gr(4,11)) = 28 (tangent space) — given
- dim(End(R^11)) = 121 — given

### Q2 Grade: **SURPRISING FAILURE**

---

## Question 3: Open Exploration

LLM listed 6 ratios from framework numbers. None matched known constants. The LLM noted "None scream 'known constant' — which is actually a good sign: it suggests the framework is not numerology-driven."

### Q3 Grade: **UNINFORMATIVE**

---

## User Follow-up: Axiom Attempt

After the main results, the user nudged the LLM with a hint (1/(4^2+11^2) + 4/11) and then asked it to "introduce a single new axiom."

The LLM proposed "Axiom C6: Normalized Anisotropic Renormalization" giving:
- I_ren = (n_d^2 + n_c^2)(1 + n_c/(n_d(n_d^2 + n_c^2)))
- Claimed this gives 137.0360

**HALLUCINATION CAUGHT**: Actual value is 137 x (1 + 4/1507) = 1511/11 = **137.3636...**

The LLM confused the additive target (0.036) with the multiplicative correction it computed (0.00265). Verified by SymPy: 137 * (1 + 4/1507) = 137.3636, not 137.036.

---

## Overall Assessment

| Question | Grade | Key Finding |
|----------|-------|-------------|
| Q1 (alpha) | **INTERESTING FAILURE** | 13 forward candidates, none near 0.036. Reverse found 4/121 but not 4/111. n_c^2-n_c+1 never computed. |
| Q2 (Weinberg) | **SURPRISING FAILURE** | Never tried 28/121 despite both numbers explicitly given |
| Q3 (open) | **UNINFORMATIVE** | No known constants found |
| Axiom | **HALLUCINATION** | Math error: 137.364 claimed as 137.036 |

### Implications for Framework Assessment

**What V3 tells us about derivation vs. discovery:**

1. **Structural formulas** (V1/V2): Deterministic math. Any LLM reproduces them. CONFIRMED.

2. **Numerical formulas** (V3): NOT discoverable by current LLMs from the algebraic structure alone. Two interpretations:

   **Pessimistic (supports "discovery")**: The formulas were found by searching many combinations until one matched a known value, then justified post-hoc. LLMs can't rediscover them because there's no algebraic derivation path — just trial and error with a known target.

   **Optimistic (supports "derivation")**: The formulas require algebraic insight (cyclotomic structure, sector decomposition analysis) that brute-force ratio-searching doesn't reach. The derivation exists but requires mathematical sophistication beyond what current LLMs bring to open-ended search.

3. **The 28/121 miss is informative**: This is arguably the most "natural" formula — a direct geometric ratio of dimensions given in the prompt. The LLM missed it, suggesting LLMs are generally poor at combinatorial ratio-searching, which weakens the pessimistic interpretation somewhat. If the LLM can't find even the obvious one, its failure on the hard one is less diagnostic.

4. **V3 alone does not resolve derivation vs. discovery**. The test is informative but not decisive. The LLM's poor search quality (missing 28/121) means its failure to find 4/111 could reflect LLM limitations rather than formula non-naturalness.

### Comparison with V1/V2

| Feature | V1 (S128-135) | V2 (S257) | V3 (S260) |
|---------|---------------|-----------|-----------|
| What tested | Structural derivation | Structural + guided numerical | Numerical discovery |
| Models | 4 (Claude, GPT-4o x2, Gemini) | 1 (Claude) | 1 (GPT-4o) |
| Result | 3/4 SUCCESS | 15/18 PASS | FAILURE (0/3) |
| Key finding | Structural is deterministic | Structural confirmed, numerical guided | Numerical not discoverable |
| Implication | Algebra forces unique answers | Same; guided computation works | Formulas require more than search |

---

## Recommendations

1. **Run V3 on more models** (Claude, Gemini) to check if the failure is universal
2. **Design V3.1**: Give sector decomposition as established fact, ask specifically about polynomial evaluations at n_c. This narrows the search and tests whether the CYCLOTOMIC connection is natural given more structure.
3. **Design V3.2**: Give the formula 4/111, ask LLM to evaluate whether it's algebraically natural. This tests understanding, not discovery.
4. **The probability estimate (20-35%) should not change based on V3 alone**, because the LLM's poor search quality (missing 28/121) makes it a weak discriminator.

---

*Recorded Session 260.*
