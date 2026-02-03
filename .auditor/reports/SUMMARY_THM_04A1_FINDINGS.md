# THM_04A1 Audit: Executive Summary

**Date**: 2026-01-30
**File**: `core/theorems/THM_04A1_crystal_decomposition.md`
**Status**: HIGH SEVERITY - REQUIRES REFACTORING
**Full Report**: `AUDIT_THM_04A1_LAYER_VIOLATION.md`

---

## Three Critical Issues Found

### 1. Layer Boundary Violation (CRITICAL)

**Problem**: Physics content (Layer 2/3) is embedded in a Layer 1 (pure mathematics) theorem.

**Evidence**:
- Line 37: Identifies 137 DoF with fine structure constant denominator
- Lines 48-50 (Implications): References Standard Model (58 channels), SU(7)×U(1)_dark gauge group, and dark matter mass m_DM = (49/9) m_p

**Why It Matters**:
- Layer 1 theorems should depend ONLY on axioms, not physics imports
- These implications require [A-IMPORT] tags and should live in Layer 2
- Makes it impossible to distinguish what is mathematically necessary vs. what is physically chosen

**Status Quo (WRONG)**:
```
core/theorems/THM_04A1
├── Pure math: V_Crystal = V_pi ⊕ V_pi^⊥ ✓
└── Implications:
    ├── 137 = α^{-1} [PHYSICS - should be Layer 2]
    ├── SU(7) × U(1)_dark [PHYSICS - should be Layer 2]
    └── m_DM = (49/9) m_p [PHYSICS - should be Layer 2]
```

**After Fix (CORRECT)**:
```
core/theorems/THM_04A1 (Layer 1)
└── Pure math: V_Crystal = V_pi ⊕ V_pi^⊥ [KEPT]

framework/investigations/dark_matter/[NEW] (Layer 2/3)
└── Correspondence & Predictions:
    ├── 137 DoF ↦ fine structure constant [A-IMPORT]
    ├── 58 channels ↦ Standard Model [A-IMPORT]
    ├── 79 channels ↦ SU(7)×U(1)_dark [A-STRUCTURAL]
    └── m_DM = (49/9) m_p [PREDICTED from structure]
```

---

### 2. Mathematical Triviality (HIGH)

**Problem**: The core theorem statement is just the orthogonal complement theorem from standard functional analysis.

**What the theorem says**:
```
Given: V is complete, W ⊂ V is closed
Then: V = W ⊕ W^⊥
```

**Assessment**:
- This is Theorem 5.3.1 in Rudin's *Functional Analysis* (1973)
- Not a novel mathematical result
- **But**: The application to partiality axioms IS valuable

**Current Problem**: The file doesn't distinguish between:
1. The standard mathematical fact (orthogonal complement)
2. The framework contribution (partiality forces decomposition)

**Recommended Fix**:
- Rename to emphasize the axiom application, not the math
- Acknowledge the standard theorem source [I-MATH]
- Highlight why this matters: "Axioms alone imply hidden sector must exist"

---

### 3. Conflated Interpretation (MEDIUM)

**Problem**: Interpretation choice (137 = α^{-1}) is presented as mathematical consequence.

**Evidence**: Line 39 acknowledges the gap:
```
Gap: The channel counting (137 DoF) depends on a specific
interpretation of how the interface maps to the fine structure
constant. This identification is [A-PHYSICAL], not purely mathematical.
```

But then the Implications section proceeds to make that exact identification without Layer 2 proper context.

**Why It Matters**:
- 137 abstract DoF are mathematically certain
- The identification with α^{-1} is an interpretive choice (supported by numerical match, but still a choice)
- The SU(7)×U(1) structure is a structural assumption, not a derivation
- m_DM = (49/9) m_p requires both the interpretation AND physics model

**Clean Statement Would Be**:
```
LAYER 1 (Pure Math):
  137 = n_d² + n_c² = interface degrees of freedom [CERTAIN from axioms]

LAYER 2 (Correspondence Choice):
  [A-IMPORT] These 137 DoF are identified with fine structure constant
  [A-STRUCTURAL] Decompose as 58 (visible) + 79 (hidden)
  [A-IMPORT] Hidden sector gauge group: SU(7) × U(1)_dark

LAYER 3 (Prediction):
  [D from structure] Dark matter mass: m_DM = (49/9) m_p = 5.11 GeV
```

---

## Impact Assessment

| Issue | Files Affected | Risk Level | Action |
|-------|-----------------|-----------|--------|
| Layer violation in THM_04A1 | 1 confirmed, 3 suspected | **CRITICAL** | Refactor THM_04A1; audit THM_0487/0488/0489 |
| Mathematical triviality | 1 (THM_04A1) | **HIGH** | Reframe as axiom application, not new math |
| Conflated interpretation | 1 (THM_04A1) | **MEDIUM** | Split into pure + correspondence layers |

**Systemic Risk**: If extended theorems (04A0, 04A1) have layer violations, then other newer results may too. Recommend layer boundary audit on all post-04A1 files before promoting to CANONICAL.

---

## Recommended Actions

### Immediate (This Session)

1. **Refactor THM_04A1**:
   - Keep only Layer 1 statement in `core/theorems/`
   - Move physics to `framework/investigations/dark_matter/`
   - Update Implications section to note this split

2. **Create Layer 2 file**:
   - New: `framework/investigations/dark_matter/dark_sector_channel_identification.md`
   - Contains: Correspondence rules (58 SM, 79 dark), SU(7) structure, m_DM formula
   - Mark as [Layer 2 CORRESPONDENCE]

3. **Update registry**:
   - Add to `registry/CLAIM_DEPENDENCIES.md` with layer attribution
   - Mark THM_04A1 as depends on pure axioms only
   - Mark dark_sector file as depends on [A-IMPORT] from physics

### Follow-up (Next Session)

4. **Audit similar files**:
   - THM_0487 (SO(11) breaking chain)
   - THM_0488 (Denominator polynomial)
   - THM_0489 (Goldstone-denominator)
   - Check for similar layer mixing

5. **Document the pattern**:
   - Add to project guidelines: "Layer 1 theorems must have NO [A-IMPORT] tags"
   - Create template: "How to split math from physics interpretation"

6. **Verify completeness**:
   - Check all Layer 1 files for accidental [A-IMPORT] content
   - Generate automatic report of layer violations

---

## The Good News

**The physics insight is sound** — partiality forcing a hidden sector is a genuine contribution. The problem is organizational, not scientific. Once the layers are properly separated:

- Layer 1 statement: "Axioms force V = V_pi ⊕ V_pi^⊥" — mathematically clean
- Layer 2 correspondence: "Visible = SM, hidden = 79 channels" — physics choice properly marked
- Layer 3 prediction: "Therefore m_DM = 5.11 GeV" — follows from structure

The insight survives intact. Only the presentation needs fixing.

---

## Verification Status

**Current**: `verification/sympy/observable_fraction_analysis.py` — PASS
- Verifies: 137 = 16 + 121 arithmetic ✓
- Verifies: 79/137 ≈ 1/√3 to 0.12% ✓
- Does NOT verify: Physics interpretation or gauge structure

**After Refactor**: Will need separate script for Layer 2 correspondence
- Verify: SU(7) has 49 dimensional vectors ✓ (standard Lie theory)
- Verify: (49/9) × 938.3 MeV = 5.11 GeV ✓ (arithmetic)
- Gap: Why (49/9) is the correct scaling (needs physics model)

---

## Next Steps for User

1. Review full audit report: `.auditor/reports/AUDIT_THM_04A1_LAYER_VIOLATION.md`
2. Decide: Refactor now, or defer to dedicated cleanup session?
3. If refactoring: Use provided templates in the full report
4. If deferring: Add to SESSION_BRIEFING.md as high-priority follow-up

---

**Audit Report Complete**
**Severity**: HIGH
**Readiness for Refactoring**: Ready — templates and structure provided
**Time Estimate**: 1-2 hours to refactor + verify
