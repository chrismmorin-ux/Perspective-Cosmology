# Layer Violations in Extended Theorems (04A0-04A1)

**Audit Date**: 2026-01-30
**Scope**: THM_04A0, THM_04A1, and related files THM_0487-0489
**Status**: PRELIMINARY FINDINGS - REQUIRES FULL AUDIT
**Priority**: CRITICAL (before promoting extended theorems to CANONICAL)

---

## Overview

Session 138 audit identified a **layer boundary violation in THM_04A1**. Initial investigation suggests this is not isolated — the extended theorem range (THM_04A0 onwards, especially THM_0487-0489) likely has similar issues.

---

## Confirmed Violation

### THM_04A1: Crystal Orthogonal Decomposition

**Layer Mixing**: Layer 2/3 physics in Layer 1 theorem Implications
- ✗ Line 37: "137 interface DoF" conflates with "α^{-1}"
- ✗ Line 48: "58/137 channels (SM)" [A-IMPORT]
- ✗ Line 49: "SU(7) × U(1)_dark" [A-IMPORT]
- ✗ Line 50: "m_DM = (49/9) m_p" [DERIVED from physics]

**Full Report**: `AUDIT_THM_04A1_LAYER_VIOLATION.md`

---

## Suspected Violations (Require Audit)

### THM_0487: SO(11) Breaking Chain

**Location**: `core/theorems/THM_0487_so11_breaking_chain.md`
**Suspicion Level**: HIGH

**Why Suspicious**:
- Title mentions "breaking chain" — symmetry breaking is physics (Layer 2+)
- SO(11) is a group structure (Layer 1) but "breaking" is physics interpretation
- Likely mixes pure group decomposition with Standard Model gauge group identification

**Check For**:
- Does it identify SO(11) ⊃ SU(5) or SO(11) ⊃ [SM group]?
- Does it reference physical gauge groups?
- Implications section — does it discuss physics?

**Risk**: HIGH - This is formalization Session 144. If it has layer mixing, it may have propagated to other files.

---

### THM_0488: Denominator Polynomial Unification

**Location**: `core/theorems/THM_0488_denominator_unification.md`
**Suspicion Level**: HIGH

**Why Suspicious**:
- "Denominator" refers to fine structure constant, Weinberg angle, etc. — physics concepts (Layer 2)
- "Unification" suggests combining physics observables
- Title structure suggests physics-layer derivation, not Layer 1

**Check For**:
- Does it discuss fine structure constant, Weinberg angle, or other SM observables?
- Does it unify multiple physics constants?
- Are derivations in terms of abstract algebra, or in terms of measured values?

**Risk**: CRITICAL - If this is Layer 2 physics in Layer 1 dress, it misrepresents what's been proven.

---

### THM_0489: Goldstone-Denominator Identity

**Location**: `core/theorems/THM_0489_goldstone_denominator.md`
**Suspicion Level**: MEDIUM-HIGH

**Why Suspicious**:
- "Goldstone" = Goldstone bosons (quantum field theory, Layer 2+)
- "Denominator" = fine structure constant (Layer 2+)
- Title conflates pure math (identity) with physics (Goldstone)

**Check For**:
- Does "Goldstone" refer to abstract group theory or physical bosons?
- Does "identity" derive a pure mathematical fact or a physics result?
- What are the axioms and what are the imports?

**Risk**: MEDIUM - May be pure math with misleading physics-suggestive title.

---

## Systemic Risk Assessment

### Pattern Recognition

All three suspected violations (THM_0487, 0488, 0489) share characteristics:

| Feature | THM_04A1 (Confirmed) | THM_0487 | THM_0488 | THM_0489 |
|---------|---------------------|----------|----------|----------|
| Title mentions physics concept | "Dark Sector" | "Breaking" | "Denominator" | "Goldstone" |
| Axioms are Layer 0 | ✓ | ? | ? | ? |
| Implications mention physics | ✓ | ? | ? | ? |
| Mixed physics+math proof | ✓ | ? | ? | ? |
| Status is SKETCH | ✓ | ✓ | ✓ | ✓ |

**Hypothesis**: All Session 144 formalization theorems (THM_0486-04A1) may need layer audit before promotion to CANONICAL.

---

## Audit Roadmap

### Tier 1: Immediate (High Confidence)

| File | Check | Expected Result |
|------|-------|-----------------|
| THM_0487 | Search for "SU", "gauge", "breaking" | Should NOT find in Layer 1 pure proof |
| THM_0488 | Search for "α", "fine structure", "Weinberg" | Should NOT find in Layer 1 pure proof |
| THM_0489 | Search for "boson", "field", "Goldstone" | Should NOT find in Layer 1 pure proof |

### Tier 2: Analysis

For each file:
1. **Separate pure content** from physics interpretation
2. **Check Implications section** for [A-IMPORT] markers
3. **Trace axiom references** — all should be Layer 0/1
4. **Identify correspondence rules** that should be in Layer 2

### Tier 3: Categorize

After audit, classify each theorem:

| Category | Action |
|----------|--------|
| **Pure Layer 1** | Keep in `core/theorems/`, promote toward CANONICAL |
| **Mixed Layer 1/2** | Split file, move physics to `framework/` |
| **Primarily Layer 2** | Move to `framework/investigations/`, relabel |
| **Triviality issues** | Rename as Lemma, reframe as axiom application |

---

## Quick Audit Checklist

For each suspected file, run:

```bash
# Search for physics keywords
grep -i "gauge\|field\|boson\|fermion\|charge\|mass\|spin\|coupling" \
  core/theorems/THM_048X.md

# Check for [A-IMPORT] tags
grep -i "\[a-import\]" core/theorems/THM_048X.md

# Check Implications section content
grep -A 10 "## Implications" core/theorems/THM_048X.md
```

**Expected**: Clean Layer 1 theorems should have minimal physics language and NO [A-IMPORT] in core proof.

---

## Why This Matters

### Severity

1. **Epistemology**: Can't distinguish what's proven from what's assumed if layers are mixed
2. **Credibility**: Presenting physics imports as pure mathematics undermines trust
3. **Propagation**: If these files are used in derivations, layer violations propagate upstream
4. **Promotion Risk**: If extended theorems contain layer violations, promoting to CANONICAL makes them "canonical physics violations"

### Timeline Sensitivity

- Session 144 formalized 8+ theorems in extended range (04A0-04A1)
- THM_04A1 was already flagged for layer violation
- Other Session 144 theorems likely have same pattern
- **Before promoting any to CANONICAL, audit must complete**

---

## Preliminary Findings Summary

| File | Confirmed? | Risk | Action |
|------|-----------|------|--------|
| THM_04A1 | YES | CRITICAL | AUDIT_04A1 report complete; refactor templates provided |
| THM_0487 | SUSPECTED | HIGH | Full audit needed |
| THM_0488 | SUSPECTED | CRITICAL | Full audit needed — this seems very physics-focused |
| THM_0489 | SUSPECTED | MEDIUM | Full audit needed |

---

## Recommendation to Project Lead

**Before next session**, decide:

1. **Pause extended theorem promotion?**
   - Do not mark THM_0487, 0488, 0489 as CANONICAL until audited
   - Keep at SKETCH status

2. **Allocate session for layer audit?**
   - Plan a dedicated session (1-2 hours) to audit full extended range
   - Use this roadmap as guide

3. **Create layer audit script?**
   - Automated check for [A-IMPORT] in Layer 1 files
   - Automated check for physics keywords in core/theorems/
   - Generate report for all layer violations

---

## Files to Audit (Prioritized)

### Must Audit Before Canonical Promotion

1. **THM_0488** — Most suspicious (denominator = physics)
2. **THM_0487** — High likelihood (breaking chains)
3. **THM_0489** — Medium likelihood (Goldstone)

### Should Audit (Lower Priority)

- THM_0486 (Mirror spacetime) — check if mirror interpretation is Layer 2
- THM_0491 (Hilbert space) — check if quantum mechanics reference [A-IMPORT]
- THM_0493 (Unitary evolution) — check if quantum mechanics [A-IMPORT]
- THM_0494 (Born rule) — almost certainly Layer 2 physics in Layer 1
- THM_0495-0499 — Check all Session 144 formalizations

---

## Template for Refactoring (If Violations Found)

Once a layer violation is found in an extended theorem:

```markdown
# Before (WRONG - Layer Mixing)

[core/theorems/THM_048X.md]
## Proof
Step 1: [pure math]
Step 2: [physics interpretation]
Step 3: [pure consequence of interpreted step 2]

## Implications
- Identifies X with physics observable Y
- Therefore physics consequence Z


# After (CORRECT - Separated Layers)

[core/theorems/THM_048X.md]
## Proof
Step 1: [pure math]
Step 2: [pure consequence]

## Verification
[Script reference]

---

[framework/investigations/[topic]/[new_file].md]
## Layer 2 Correspondence

[A-IMPORT] Physical interpretation:
- X ↦ observable Y

## Layer 3 Prediction
- Derived consequence Z
```

---

## Cross-Reference to Main Audit

- See: `AUDIT_THM_04A1_LAYER_VIOLATION.md` (confirmed case)
- See: `AUDIT_PROGRESS.md` (Phase 1C theorem status table)
- See: `.claude/rules/` (layer definitions and tagging requirements)

---

**Audit Status**: PRELIMINARY
**Severity**: CRITICAL (systemic risk to multiple theorems)
**Next Action**: Full audit of THM_0487, 0488, 0489 (≈2-3 hours)
**Blocking**: Promotion of extended theorems to CANONICAL
