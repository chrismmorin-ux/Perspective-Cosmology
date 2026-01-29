# Hypothesis Testing Protocol

**Created**: Session 124
**Purpose**: Formalize falsifiable hypothesis testing for critical claims
**Principle**: Predictions locked BEFORE checking measurements = scientific rigor

---

## When to Use This Protocol

Use blind hypothesis testing for:

| Situation | Example | Why It Matters |
|-----------|---------|----------------|
| **Extending patterns** | "Does l_1-l_3 pattern work for l_4-l_6?" | Tests if pattern is real vs coincidence |
| **New predictions** | "What is m_DM?" | Establishes genuine predictive power |
| **Critical claims** | "Is α = 137 + 4/111?" | Sub-percent claims need rigorous test |
| **Alternative hypotheses** | "Is the shift H/n_c or Im_O/n_c?" | Distinguishes competing interpretations |

Do NOT need this for:
- Exploratory calculations
- Order-of-magnitude estimates
- Derivation development (before claiming precision)

---

## The Protocol

### Step 1: State the Hypothesis

```markdown
**Hypothesis**: [Clear, falsifiable statement]
**Based on**: [What pattern/derivation suggests this]
**Prediction**: [Specific numerical value or range]
```

### Step 2: Define Falsification Criteria

```markdown
**Falsified if**: [Specific condition]
**Tolerance**: [Acceptable error range with justification]
**Measurement source**: [Where you'll check - specify BEFORE looking]
```

### Step 3: Lock the Prediction

1. Write to `predictions/BLIND_PREDICTIONS.md` or verification script
2. Commit to git (creates timestamp)
3. State: "Prediction locked at [timestamp], before measurement lookup"

### Step 4: Check Against Measurement

Only AFTER locking:
1. Look up the measured value
2. Calculate error
3. Assess against falsification criteria

### Step 5: Document Result

**If CONFIRMED** (within tolerance):
```markdown
**Result**: CONFIRMED
**Predicted**: [value]
**Measured**: [value]
**Error**: [X%]
**Confidence boost**: [What this means for the hypothesis]
```

**If FALSIFIED** (outside tolerance):
```markdown
**Result**: FALSIFIED
**Predicted**: [value]
**Measured**: [value]
**Error**: [X%]
**What this means**: [Implications for framework]
**Next steps**: [What to investigate]
```

---

## Falsification is Progress

**Key principle**: A cleanly falsified hypothesis is MORE valuable than an untested one.

| Outcome | Value |
|---------|-------|
| Hypothesis confirmed | Supports framework |
| Hypothesis falsified | Constrains framework — narrows valid interpretations |
| Hypothesis untestable | Worthless — not science |

When a hypothesis is falsified:
1. **Don't hide it** — document in BLIND_PREDICTIONS.md
2. **Analyze why** — what does the failure teach us?
3. **Constrain alternatives** — what hypotheses survive?
4. **Update confidence** — honestly adjust claims

---

## Example: Session 124 Higher Peaks Test

### Hypothesis
"The alternating H/Im_O shift pattern extends to l_4, l_5, l_6"

### Predictions (locked)
- l_4 = 960 (error tolerance: 5%)
- l_5 = 1240 (error tolerance: 3%)
- l_6 = 1400 (error tolerance: 5%)

### Falsification criteria
"If ANY peak differs by more than its tolerance, the hypothesis is falsified"

### Result
| Peak | Predicted | Measured | Error | Status |
|------|-----------|----------|-------|--------|
| l_4 | 960 | 1129 | -15% | FALSIFIED |
| l_5 | 1240 | 1402 | -12% | FALSIFIED |
| l_6 | 1400 | 1735 | -19% | FALSIFIED |

### What we learned
- The l_1-l_3 pattern does NOT extend
- Possible interpretations:
  1. l_1-l_3 formulas are coincidental
  2. Additional structure needed for higher peaks
  3. Framework captures only low-l physics
- This CONSTRAINS future hypotheses

---

## Integration with Existing Protocol

### In CLAUDE.md
Add to "During Session":
- For pattern extensions or critical claims, use blind prediction protocol

### In verification scripts
Include section:
```python
# ==============================================================================
# BLIND PREDICTION (if applicable)
# ==============================================================================
# Hypothesis: [state it]
# Prediction locked: [timestamp]
# Falsification criterion: [state it]
#
# [AFTER LOCKING - uncomment to check]
# measured = ???
# result = "CONFIRMED" if error < tolerance else "FALSIFIED"
```

### In BLIND_PREDICTIONS.md
All locked predictions with:
- Lock timestamp
- Falsification criteria
- Result (once checked)

---

## Quick Reference

```
1. HYPOTHESIS: State clearly what you're testing
2. PREDICT: Lock specific value(s) BEFORE looking up measurement
3. CRITERIA: Define what counts as falsification
4. CHECK: Look up measurement ONLY after locking
5. DOCUMENT: Record result honestly (confirm or falsify)
6. LEARN: What does the result teach us?
```

---

## Metrics

Track in STATUS_DASHBOARD.md:

| Metric | Current | Target |
|--------|---------|--------|
| Blind predictions made | 9 | 20+ |
| Confirmed | 6 | — |
| Falsified | 3 | — |
| Confirmation rate | 67% | >50% |

A ~50-70% confirmation rate is healthy — it means we're making non-trivial predictions.

---

*This protocol exists to make Perspective Cosmology testable. Untestable claims are not science.*
