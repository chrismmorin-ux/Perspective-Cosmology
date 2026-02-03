# Results Recording Templates

Use these templates when recording new test results. Create a new file in this directory named `v{variant}_test{N}_{model}.md`.

---

## Variant 1 (Derivation) Template

```markdown
# V1 Test [N]: [Model Name]

**Date**: YYYY-MM-DD
**Model**: [exact model name/version]
**Platform**: [ChatGPT / Gemini / Claude / other]
**Session**: Fresh (no prior context)

---

## Prompt Given

[Note which prompt version was used, any modifications]

---

## Response (Verbatim)

[Paste the complete LLM response here without editing]

---

## Analysis

**n_d derived**: [value or "not derived"]
**n_c derived**: [value or "not derived"]
**Ratio derived**: [value or "not derived"]

**Reasoning quality**: [Did it use Frobenius correctly? Was the logic chain valid?]
**Key theorems cited**: [List all theorems the model invoked]
**Errors or gaps**: [Any mistakes in reasoning]
**Self-corrections**: [Did the model change its mind during reasoning?]

---

## Outcome

[ ] FULL SUCCESS — All three values derived correctly
[ ] PARTIAL SUCCESS — Some values derived
[ ] INTERESTING FAILURE — Different values with valid reasoning
[ ] UNINFORMATIVE FAILURE — Could not engage with problem

---

## Notes

[Any observations about the derivation process, hesitations, or interesting reasoning]

---

*Recorded Session [N].*
```

---

## Variant 2 (Ambiguity Analysis) Template

```markdown
# V2 Test [N]: [Model Name]

**Date**: YYYY-MM-DD
**Model**: [exact model name/version]
**Platform**: [platform]
**Session**: Fresh (no prior context)

---

## Response (Verbatim)

[Paste the complete LLM response here without editing]

---

## Ambiguities Identified

| # | Ambiguity | Matches Known? | Novel? | Both Sides Argued? | Correct Assessment? |
|---|-----------|---------------|--------|-------------------|-------------------|
| 1 | [description] | [Y/N] | [Y/N] | [Y/N] | [Y/N/Partial] |
| 2 | ... | ... | ... | ... | ... |

---

## Values Derived

**n_d**: [value(s) considered]
**n_c**: [value(s) considered]
**Preferred interpretation**: [which and why]

---

## Quality Assessment

**Known ambiguity 1 (n_d = dim vs dim(Im))**: [Found? Argued correctly?]
**Known ambiguity 2 (O inclusion in n_c)**: [Found? Argued correctly?]
**Novel ambiguities found**: [List any we hadn't identified]
**Consistency evaluation quality**: [Did it correctly identify which reading is more consistent?]

---

## Outcome

[ ] HIGH VALUE — Found both known ambiguities + new ones
[ ] EXPECTED VALUE — Found both known ambiguities, argued correctly
[ ] PARTIAL VALUE — Found one, or misjudged consistency
[ ] LOW VALUE — Missed genuine ambiguities

---

## Notes

[Observations, especially about any novel ambiguities or arguments we hadn't considered]

---

*Recorded Session [N].*
```

---

*Templates extracted from Runbook Sections E and G, Session 135.*
