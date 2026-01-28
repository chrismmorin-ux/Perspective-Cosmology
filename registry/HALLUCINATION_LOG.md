# Hallucination Log

**Purpose**: Track instances where LLM hallucinations were caught, to learn patterns.

---

## Statistics

| Metric | Value |
|--------|-------|
| Total caught | 0 |
| Calculation errors | 0 |
| Invalid proofs | 0 |
| Hidden circularity | 0 |
| Pattern matching | 0 |

---

## Incidents

*Document each caught hallucination below.*

### Template

```markdown
### H-XXX: [Brief description]

**Date**: YYYY-MM-DD
**Session**: N
**Type**: [Calculation error | Invalid proof | Hidden circularity | Pattern matching]
**How caught**: [Which defense layer: Computational | Multi-path | Semantic | External]
**Severity**: [LOW | MEDIUM | HIGH | CRITICAL]

**Original claim**:
[What Claude/LLM claimed]

**Actual result**:
[What turned out to be correct]

**How it looked plausible**:
[Why this wasn't obviously wrong]

**Lesson learned**:
[What to watch for in future]
```

---

## Log Entries

*None yet. This is a good sign — or we haven't been looking hard enough.*

---

## Common Patterns (Update as incidents accumulate)

### Calculation Errors
*[Patterns will be documented here as incidents are logged]*

### Invalid Proofs
*[Patterns will be documented here as incidents are logged]*

### Hidden Circularity
*[Patterns will be documented here as incidents are logged]*

### Pattern Matching
*[Patterns will be documented here as incidents are logged]*

---

## Prevention Effectiveness

*Track which defense layers catch what:*

| Defense Layer | Incidents Caught |
|---------------|------------------|
| Computational (SymPy) | 0 |
| Multi-path verification | 0 |
| Semantic consistency | 0 |
| External (Wolfram) | 0 |
| User skepticism | 0 |

---

*Update this file whenever a hallucination is caught. The patterns will inform better defenses.*
