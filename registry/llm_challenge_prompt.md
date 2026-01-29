# LLM Derivation Challenge — Exact Prompts

**Created**: Session 125
**Purpose**: Provide exact prompts for testing other LLMs
**Status**: READY TO USE

---

## System Prompt

Copy this exactly as the system/instructions message:

```
You are a mathematician working on an abstract algebraic framework.

You have been given a set of axioms about vector spaces and projections.
Your task is to determine what specific numbers emerge from these axioms.

IMPORTANT RULES:
- Work purely from the mathematics presented
- Do not look up any physics constants or values
- Do not assume any specific numbers in advance
- Show your derivation step by step
- State all theorems you use and why they apply
- If multiple values are possible, explain what constrains them
- If you get stuck, explain where and why

This is a pure mathematics exercise with no intended physical interpretation.
```

---

## User Prompt

Copy everything below (including the markdown document):

```
Please analyze the following mathematical framework and answer the questions at the end.

---

[PASTE FULL CONTENTS OF framework/axioms_for_llm_challenge.md HERE]

---

Please derive:

1. The maximum dimension of the accessible subspace (n_d), given that time evolution requires associativity in the transition algebra

2. The dimension of the hidden/crystal subspace (n_c), derived from the imaginary parts of the permitted division algebras

3. Any dimensionless integers or ratios that emerge from n_d and n_c (such as sums, products, or Pythagorean combinations)

Show your complete mathematical reasoning. What theorems do you invoke? What are the key steps?
```

---

## How to Run the Challenge

### Option A: GPT (Recommended for Independence)

1. Open a fresh ChatGPT session (no prior context)
2. If using GPT with system prompts: paste the System Prompt
3. If using standard ChatGPT: include the System Prompt at the start of your message
4. Paste the User Prompt (with the full axiom document included)
5. Send and wait for complete response
6. **Do NOT give hints or corrections** — record the raw response

### Option B: Claude (New Session)

1. Open a fresh Claude session (different from this project)
2. Paste the System Prompt as initial context
3. Paste the User Prompt
4. Record response
5. Note: Tests reproducibility within Claude models

### Option C: Other LLMs

- Gemini, Llama, Mistral, etc.
- Same protocol: fresh session, paste prompts, record response

---

## Recording Template

Save results to `registry/llm_challenge_results.md` using this format:

```markdown
# LLM Derivation Challenge — Results

## Test [N]

**Date**: YYYY-MM-DD
**Model**: [Exact model name and version]
**Session**: Fresh (no prior context)

### Response (Verbatim)

[Paste the complete LLM response here without editing]

### Analysis

**n_d derived**: [value or "not derived"]
**n_c derived**: [value or "not derived"]
**Ratio derived**: [value or "not derived"]

**Reasoning quality**: [Did it use Frobenius correctly?]
**Key theorems cited**: [List]
**Errors or gaps**: [List]

### Outcome

[ ] FULL SUCCESS — All three values derived correctly
[ ] PARTIAL SUCCESS — Some values derived
[ ] INTERESTING FAILURE — Different values with valid reasoning
[ ] UNINFORMATIVE FAILURE — Could not engage with problem

### Notes

[Any observations about the derivation process]
```

---

## Expected Answers (DO NOT SHARE WITH TEST LLM)

For evaluation only — the correct derivations are:

| Quantity | Expected Value | Key Step |
|----------|----------------|----------|
| n_d | (maximum associative division algebra dimension) | Frobenius: H is largest associative |
| n_c | (sum of imaginary dimensions) | Im_C + Im_H + Im_O = 1 + 3 + 7 |
| Pythagorean | n_d squared + n_c squared | Direct computation |

**Note**: We deliberately do not write the actual numbers here to avoid any possibility of them leaking into the test.

---

## What Constitutes Success

### Full Success
- LLM derives the correct n_d from associativity requirement
- LLM derives the correct n_c from imaginary dimensions
- LLM computes n_d^2 + n_c^2 correctly
- Reasoning chain is mathematically valid

### Partial Success
- Gets one or two values correct
- Shows understanding of Frobenius theorem
- Makes identifiable error in one step

### Interesting Failure
- Derives DIFFERENT numbers with valid reasoning
- Would indicate hidden flexibility in axioms
- Very important to document if this happens

### Uninformative Failure
- Can't parse the axioms
- Doesn't know Frobenius theorem
- Gives up without meaningful attempt

---

## After Running

1. Save verbatim results to `registry/llm_challenge_results.md`
2. Update `registry/LLM_COLLABORATION_LOG.md` with test record
3. Update `registry/STATUS_DASHBOARD.md` with outcome
4. If FULL SUCCESS: Update probability estimates
5. If INTERESTING FAILURE: Investigate why

---

## Troubleshooting

**If LLM asks for clarification**:
- Respond only with: "Work with what's given. The axioms should be sufficient."
- Do NOT provide additional hints

**If LLM gives partial answer**:
- Record what was given
- Note where it stopped
- Classify as PARTIAL SUCCESS

**If LLM refuses or can't engage**:
- Record the refusal/confusion
- Try a different LLM
- Classify as UNINFORMATIVE

---

*This prompt is designed to be self-contained and unbiased. The test LLM receives no information about expected values.*
