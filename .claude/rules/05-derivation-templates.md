---
paths:
  - "core/**"
  - "framework/investigations/**"
  - "verification/**"
  - "sessions/**"
---

# Derivation & Documentation Templates (Summary)

**Full templates**: `docs/derivation-templates-full.md`

## Plain Language Requirement

Every major derivation SHOULD include a `## Plain Language` section (2-5 paragraphs, no equations, use analogies).

## Claim Documentation (minimal)

```
**Confidence**: [CONJECTURE]  **Verification**: `verification/sympy/script.py`
**Derivation Chain**: Step 1 [A: axiom] -> Step 2 [D: derived] -> Step 3 [I: import] -> Result
**Assumptions**: 1. [tag] 2. [tag]  **Gaps**: [what needs rigor]  **Falsifies if**: [criterion]
```

## Investigation File Header

```
**Status**: ACTIVE | QUARANTINE | CANONICAL
**Created/Updated**: Session [N], YYYY-MM-DD
```
Must include: Question, Approach, Findings (with confidence + script refs), Open Questions, Dependencies.

## Verification Script Essentials

```python
# 1. STATE ASSUMPTIONS (n_d=4, n_c=11, etc.)
# 2. IMPORTS (measured values with CODATA source)
# 3. DERIVATION (compute prediction)
# 4. TESTS: [PASS/FAIL] for each assertion
```

## Key Templates Available

- **Standard Claim**: confidence + chain + assumptions + gaps + falsification
- **Investigation File**: status + question + findings + open questions + dependencies
- **Axiom/Theorem**: statement + proof/derivation + verification + implications
- **SymPy Script**: assumptions + imports + derivation + tests

See `docs/derivation-templates-full.md` for full copy-paste templates.
