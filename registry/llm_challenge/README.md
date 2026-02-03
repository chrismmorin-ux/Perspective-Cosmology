# LLM Derivation Challenge

**Created**: Session 132
**Restructured**: Session 135

---

## What This Tests

Whether an independent LLM can derive the same numbers (n_d, n_c, n_d^2 + n_c^2) from the framework axioms alone, without being told the target values.

**Why it matters**: If multiple independent models reproduce the same derivation, that's evidence of mathematical necessity rather than numerology. The Red Team estimated 15-30% probability this framework is genuine physics -- a successful external replication would push that toward 30-40%.

---

## Variants

| Variant | Purpose | Prompt |
|---------|---------|--------|
| **V1-original: Derivation** | Derive n_d, n_c, and dimensionless ratios from axioms (ambiguous version, used for Tests 1-3) | [prompts/variant_1_derivation.md](prompts/variant_1_derivation.md) |
| **V1-tightened: Derivation** | Same task, with Session 134 clarifications closing two known ambiguities | [prompts/variant_1_tightened.md](prompts/variant_1_tightened.md) |
| **V2: Ambiguity Analysis** | Identify where axioms permit different interpretations (uses original ambiguous axioms) | [prompts/variant_2_ambiguity.md](prompts/variant_2_ambiguity.md) |

---

## Results at a Glance

| Test | Model | Variant | n_d | n_c | 137 | Outcome |
|------|-------|---------|-----|-----|-----|---------|
| 1 | Claude (internal) | V1 | 4 | 11 | 137 | FULL SUCCESS |
| 2 | ChatGPT GPT-4o | V1 | 3 | 4 | 25 | INTERESTING FAILURE |
| 3 | Google Gemini | V1 | 4 | 11 | 137 | FULL SUCCESS |

**Full results**: [results/SUMMARY.md](results/SUMMARY.md)
**Per-test details**: [results/](results/)

---

## How to Run a New Test

### Step 1: Choose Variant and Model

- **V1-original** (Derivation, ambiguous): Use for fresh models to see if they derive (4,11) despite ambiguity
- **V1-tightened** (Derivation, clarified): Use to retest models that hit ambiguity points, or for models where you want the cleanest signal
- **V2** (Ambiguity Analysis): Use to probe axiom robustness — deliberately uses original ambiguous axioms

### Step 2: Set Up a Fresh Session

1. Open a **fresh** session on the target platform (no prior context)
2. Select the most capable model available
3. Copy the full prompt block from the appropriate file in [prompts/](prompts/)

### Step 3: Run the Test

1. Paste the prompt as a single message
2. Send and wait for the full response
3. **Do NOT give hints or corrections** -- record the raw response
4. If the model asks for clarification, paste the follow-up from [prompts/follow_ups.md](prompts/follow_ups.md)

### Step 4: Record Results

1. Copy the appropriate template from [results/TEMPLATE.md](results/TEMPLATE.md)
2. Create a new file in `results/` named `v{variant}_test{N}_{model}.md`
3. Paste verbatim response and fill in analysis
4. Grade using the rubric in [rubrics/](rubrics/)
5. Update the summary table in [results/SUMMARY.md](results/SUMMARY.md)

---

## Pass/Fail Criteria

### Variant 1 (Derivation)

| Outcome | Definition |
|---------|------------|
| FULL SUCCESS | All three values derived correctly with valid reasoning |
| PARTIAL SUCCESS | One or two values correct, or correct reasoning with minor errors |
| INTERESTING FAILURE | Different values with valid reasoning (indicates axiom flexibility) |
| UNINFORMATIVE | Model can't engage with the problem |

### Variant 2 (Ambiguity Analysis)

| Outcome | Definition |
|---------|------------|
| HIGH VALUE | Identifies both known ambiguities + finds new ones we missed |
| EXPECTED VALUE | Identifies both known ambiguities, argues both sides correctly |
| PARTIAL VALUE | Identifies one ambiguity, or identifies both but misjudges consistency |
| LOW VALUE | Identifies no genuine ambiguities, or only superficial ones |

---

## Model Notes

| Platform | Setup Notes |
|----------|-------------|
| ChatGPT (GPT-4o) | Fresh session, select GPT-4o. System prompt area not used -- everything goes in one message. |
| Google Gemini | Fresh session, most capable model. No separate system prompt -- everything in one block. Wrap system instructions in `[INSTRUCTIONS: ...]` bracket. |
| Claude | Can test via subagent (not truly independent -- same model). For independent test, use claude.ai with fresh conversation. |

---

## File Map

```
registry/llm_challenge/
  README.md                          <- You are here
  prompts/
    variant_1_derivation.md          <- V1-original copy-paste prompt (ambiguous)
    variant_1_tightened.md           <- V1-tightened copy-paste prompt (clarified)
    variant_2_ambiguity.md           <- V2 copy-paste prompt
    follow_ups.md                    <- Clarification responses
  results/
    SUMMARY.md                       <- Summary table + interpretation + implications
    v1_test1_claude.md               <- Per-test verbatim + analysis
    v1_test2_gpt4o.md
    v1_test3_gemini.md
    TEMPLATE.md                      <- Copy-paste template for new results
  rubrics/
    variant_1_grading.md             <- Expected answers + classification guide
    variant_2_grading.md             <- Ambiguity detection rubric
```

---

## Related Files

- **Axiom source document**: `framework/axioms_for_llm_challenge.md`
- **Challenge planning**: `registry/LLM_CHALLENGE_PLAN.md`
- **Ambiguity analysis investigation**: `framework/investigations/division_algebra_ambiguity_analysis.md`
- **Ambiguity verification script**: `verification/sympy/division_algebra_ambiguity_analysis.py`

---

*Runbook created Session 132. Variant 2 added Session 134. Restructured into subdirectory Session 135.*
