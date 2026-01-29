# LLM Derivation Challenge — Implementation Plan

**Created**: Session 122 (continued)
**Status**: READY TO EXECUTE
**Priority**: 1 (Highest Impact)
**Goal**: Test if other LLMs derive framework numbers from axioms alone

---

## Why This Matters

The Red Team's central critique: "We cannot prove formulas were DERIVED rather than DISCOVERED."

If another LLM, given ONLY the axioms (no physics targets), arrives at the same numbers:
- n_d = 4 (spacetime dimension)
- n_c = 11 (crystal dimension)
- alpha^-1 = 137 (fine structure constant)

...this would be strong evidence of mathematical necessity, not numerological fitting.

**Current probability estimate**: 15-30%
**If challenge succeeds**: 30-40%

---

## The Challenge Design

### What We're Testing

1. **Reproducibility**: Do the axioms uniquely determine these numbers?
2. **Independence**: Can an LLM derive them without knowing the targets?
3. **Mathematical necessity**: Is there only ONE consistent solution?

### What We're NOT Testing

- Whether the framework is correct physics (separate question)
- Whether the LLM is "smart enough" (if it fails, could be LLM limitation)
- Exact numerical precision (focus on integer structure first)

---

## Phase 1: Create Clean Axiom Document

**Deliverable**: `framework/axioms_for_llm_challenge.md`

### Content Requirements

The document MUST include:

1. **The Two Primitives**
   - V_Crystal: Perfect inner product space
   - Perspective: Partial projection operator

2. **All 13 Axioms** (from layer_0_pure_axioms.md)
   - Crystal axioms C1-C5
   - Perspective axioms P1-P4, Pi1-Pi2
   - Transition axioms T0-T1

3. **The Key Constraint** (the crux of the derivation)
   - "Transitions must compose without information loss"
   - This requires the transition algebra to have no zero-divisors
   - Link to Frobenius theorem (but don't state the result)

4. **The Crystal Dimension Question**
   - "The crystal has some total dimension n_total"
   - "Perspective accesses n_d < n_total dimensions"
   - "The hidden dimensions have count n_c = n_total - n_d"
   - Ask: "What values of n_d and n_c are consistent with the axioms?"

5. **The Coupling Constant Question**
   - "If the tilt magnitude epsilon encodes interaction strength..."
   - "And epsilon is related to n_d and n_c..."
   - Ask: "What dimensionless number characterizes this?"

### Content FORBIDDEN

The document MUST NOT include:

- The value 4 anywhere (even "4D spacetime")
- The value 11 anywhere
- The value 137 anywhere
- Any mention of "fine structure constant"
- Any mention of physics measurements
- Any comparison to Standard Model
- Any hint that we're looking for specific numbers

### Structure

```markdown
# Mathematical Framework — Derivation Exercise

## Instructions
You are given a set of mathematical axioms. Your task is to determine
what specific numbers (if any) are uniquely determined by these axioms.

Do not look up physics values. Work purely from the mathematics.

## Part 1: The Axioms
[Copy axioms C1-C5, P1-P4, Pi1-Pi2, T0-T1]

## Part 2: The Key Constraint
[State the zero-divisor requirement without giving the answer]

## Part 3: Questions
1. What is the maximum dimension n_d of the accessible subspace?
2. Given n_d, what is n_c (the hidden dimension count)?
3. What dimensionless ratio emerges from n_d and n_c?

## Part 4: Show Your Work
Derive the answers step by step. State all theorems you use.
```

---

## Phase 2: Prepare the Prompt

**Deliverable**: `registry/llm_challenge_prompt.md`

### System Prompt (for the target LLM)

```
You are a mathematician working on an abstract framework.
You have been given a set of axioms about vector spaces and projections.
Your task is to determine what specific numbers emerge from these axioms.

IMPORTANT:
- Work purely from the mathematics
- Do not look up any physics values
- Do not assume any specific numbers
- Show your derivation step by step
- If multiple values are possible, explain what constrains them
```

### User Prompt

```
[Insert contents of axioms_for_llm_challenge.md]

Please derive:
1. The maximum dimension of the accessible subspace (n_d)
2. The dimension of the hidden subspace (n_c)
3. Any dimensionless ratios that emerge from these

Show your mathematical reasoning. What theorems do you use?
```

---

## Phase 3: Run the Challenge

### Option A: Use GPT-4 (Recommended)

1. Open a fresh ChatGPT session (no prior context)
2. Paste the system prompt
3. Paste the user prompt
4. Record the full response verbatim
5. Do NOT give hints or corrections

### Option B: Use Claude (New Session)

1. Open a fresh Claude session
2. Use the same prompts
3. Record response
4. Note: This tests reproducibility within Claude models

### Option C: Use Both

Run both Option A and Option B, compare results.

### What to Record

- Date and time
- LLM model used (exact version)
- Full prompt (verbatim)
- Full response (verbatim)
- Any follow-up exchanges

---

## Phase 4: Analyze Results

### Success Criteria

| Outcome | Meaning |
|---------|---------|
| **FULL SUCCESS** | LLM derives n_d=4, n_c=11, 137 | Strong evidence for necessity |
| **PARTIAL SUCCESS** | LLM derives some but not all | Partial evidence, investigate gaps |
| **INTERESTING FAILURE** | LLM derives different numbers with valid reasoning | Framework may have hidden flexibility |
| **UNINFORMATIVE FAILURE** | LLM can't engage with the problem | Inconclusive (LLM limitation) |

### Analysis Questions

1. Did the LLM invoke Frobenius theorem correctly?
2. Did it identify the zero-divisor constraint?
3. Did it connect to division algebras (R, C, H, O)?
4. Were there alternative paths it considered?
5. What assumptions did it make that we didn't state?

---

## Phase 5: Document Results

**Deliverable**: `registry/llm_challenge_results.md`

### Template

```markdown
# LLM Derivation Challenge Results

**Date**: YYYY-MM-DD
**LLM Tested**: [Model name and version]
**Tester**: [Human / AI name]

## Prompt Used
[Full prompt]

## Response Received
[Full response, verbatim]

## Analysis

### Numbers Derived
| Target | LLM Result | Match? |
|--------|------------|--------|
| n_d = 4 | | |
| n_c = 11 | | |
| 137 | | |

### Reasoning Quality
[Did the LLM use correct mathematical reasoning?]

### Key Steps
[What theorems did it invoke?]

### Gaps or Errors
[Where did it go wrong, if anywhere?]

## Conclusion

**Outcome**: [FULL SUCCESS / PARTIAL SUCCESS / INTERESTING FAILURE / UNINFORMATIVE]

**Implication for Framework**:
[What does this tell us about derivation vs discovery?]
```

---

## Timeline

| Phase | Task | Time Estimate |
|-------|------|---------------|
| 1 | Create clean axiom document | 30 min |
| 2 | Prepare prompt | 15 min |
| 3 | Run challenge (per LLM) | 20 min |
| 4 | Analyze results | 30 min |
| 5 | Document results | 20 min |

**Total**: ~2 hours for one LLM test

---

## Risks and Mitigations

### Risk 1: LLM Has Memorized Physics

**Problem**: GPT-4/Claude may have seen physics texts and "know" that alpha = 1/137.

**Mitigation**:
- Use abstract notation (don't call it "fine structure constant")
- Ask for derivation steps (not just the answer)
- Check if reasoning is mathematically valid

### Risk 2: Prompt Leaks Information

**Problem**: Our prompt might inadvertently hint at the answer.

**Mitigation**:
- Have someone else review the prompt
- Remove ALL numbers from the axiom document
- Use variable names like n_d, n_c (not "4 dimensions")

### Risk 3: LLM Gets Confused

**Problem**: Abstract axioms might be hard for LLM to parse.

**Mitigation**:
- Include clear definitions
- Give explicit questions
- Accept partial success

### Risk 4: Success Due to Pattern Matching

**Problem**: LLM might guess "4 dimensions" from common physics knowledge.

**Mitigation**:
- Require full derivation chain
- Check if intermediate steps are valid
- Look for novel insights in the response

---

## Success Would Mean

If an independent LLM derives n_d=4, n_c=11, 137 from axioms alone:

1. **Mathematical Necessity**: The numbers aren't arbitrary — they're forced by the structure
2. **Reproducibility**: Different systems arrive at same conclusions
3. **Not Fitting**: The derivation works without knowing the target

This would be the strongest evidence yet that the framework captures something real.

---

## Failure Would Mean

If the LLM fails:

1. **Maybe LLM Limitation**: Not all LLMs can do abstract math
2. **Maybe Missing Steps**: Our axioms need more explicit constraints
3. **Maybe Hidden Flexibility**: The axioms allow multiple solutions

Failure is still informative — it tells us what's unclear in our derivation.

---

## Files to Create

| File | Purpose |
|------|---------|
| `framework/axioms_for_llm_challenge.md` | Clean axiom document |
| `registry/llm_challenge_prompt.md` | Exact prompt to use |
| `registry/llm_challenge_results.md` | Results documentation |

---

## Next Steps After This Plan

1. **Create the clean axiom document** (Phase 1)
2. **Have user review** (ensure no information leakage)
3. **Run the challenge** (Phase 3)
4. **Document everything** (Phase 5)
5. **Update RECOMMENDATION_ENGINE.md** with outcome

---

*This plan provides a rigorous, documented approach to testing the framework's derivation claims.*
