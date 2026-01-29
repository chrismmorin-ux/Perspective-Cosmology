# Dead Ends Registry

**Created**: 2026-01-28 (Session 120 - Red Team Review)
**Purpose**: Document failed approaches and what we learned from them
**Rule**: Every significant failure deserves documentation

---

## Why This Exists

The Red Team identified survivorship bias: we see successes but not failures. This file corrects that by documenting approaches that DIDN'T work.

**Failures are data. Document them.**

---

## Major Dead Ends

### DE-001: Weinberg Angle as sin²(θ_W) = 2/25

| Field | Value |
|-------|-------|
| **Proposed** | Early sessions (~S30-40) |
| **Formula** | sin²(θ_W) = 2/25 = 0.08 |
| **Measured** | sin²(θ_W) ≈ 0.223 |
| **Error** | 65% (catastrophic) |
| **Lesson** | Simple ratios insufficient; need more sophisticated structure |
| **Replacement** | cos(θ_W) = 171/194 (different observable, different structure) |
| **Status** | FALSIFIED — moved to `claims/FALSIFIED.md` |

---

### DE-002: Direct Cosmological Constant from α

| Field | Value |
|-------|-------|
| **Proposed** | ~S70 |
| **Formula** | Λ ~ α⁴ × M_Pl⁴ |
| **Result** | Off by 10¹¹⁷ orders of magnitude |
| **Lesson** | Naive dimensional analysis fails for Λ; crystallization ground state ≠ cosmological constant |
| **Current approach** | Λ emerges from crystallization dynamics, not simple scaling |
| **Status** | ABANDONED |

---

### DE-003: CKM Angles as Simple π Fractions

| Field | Value |
|-------|-------|
| **Proposed** | ~S50 |
| **Hypothesis** | CKM angles should be simple fractions of π |
| **Result** | Only Cabibbo angle works (~π/14); others fail badly |
| **Lesson** | CKM structure more complex than simple geometric ratios |
| **Status** | PARTIAL — Cabibbo relation kept, others abandoned |

---

### DE-004: n_c = 15 (Full Division Algebra Sum)

| Field | Value |
|-------|-------|
| **Hypothesis** | n_c = R + C + H + O = 1 + 2 + 4 + 8 = 15 |
| **Problem** | Predictions worse with n_c = 15 vs n_c = 11 |
| **Resolution** | O decomposes as H + H from internal perspective → n_c = 11 |
| **Lesson** | The "obvious" algebraic choice isn't always correct |
| **Status** | RESOLVED — n_c = 11 adopted with justification |

---

### DE-005: Higgs Mass from Simple Ratio

| Field | Value |
|-------|-------|
| **Proposed** | ~S60 |
| **Formula** | m_H = v × (simple fraction) |
| **Problem** | Multiple fractions give ~1% accuracy; none stood out |
| **Resolution** | m_H = v × 121/238 emerges from electroweak sector completion |
| **Lesson** | Higgs mass requires full electroweak context |
| **Status** | RESOLVED — better derivation found in S111 |

---

## Pattern Analysis of Failures

### What Tends to Fail

1. **Simple ratios for precision values** — Nature is more subtle
2. **Naive dimensional analysis** — Right units ≠ right physics
3. **Ignoring substructure** — O ≠ O when viewed internally
4. **One-parameter fits** — Need structural depth

### What Tends to Work

1. **Multi-step derivations** — Structure builds on structure
2. **Cyclotomic polynomials** — Phi_6 appears repeatedly
3. **Same numbers across domains** — Coherence as evidence
4. **Corrections that have interpretations** — Not arbitrary adjustments

---

## Template for New Dead Ends

```markdown
### DE-XXX: [Descriptive Title]

| Field | Value |
|-------|-------|
| **Proposed** | Session [N] |
| **Formula/Hypothesis** | [what was tried] |
| **Result** | [what happened] |
| **Error** | [how wrong] |
| **Lesson** | [what we learned] |
| **Status** | ABANDONED / RESOLVED / PARTIAL |
```

---

## Statistics

| Metric | Value |
|--------|-------|
| Total documented dead ends | 5 |
| Estimated undocumented (early sessions) | ~20-30 |
| Dead ends leading to better approaches | 3/5 (60%) |

---

*Failures teach as much as successes. Document them.*
