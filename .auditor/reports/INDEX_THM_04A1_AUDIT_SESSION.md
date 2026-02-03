# THM_04A1 Audit Session - Complete Report Index

**Audit Conducted**: 2026-01-30
**Scope**: `core/theorems/THM_04A1_crystal_decomposition.md` + layer violation assessment
**Status**: COMPLETE
**Overall Severity**: CRITICAL (HIGH priority follow-up required)

---

## Report Files Generated

### 1. AUDIT_THM_04A1_LAYER_VIOLATION.md (12 KB)

**Primary Detailed Audit Report**

Contents:
- Full analysis of layer boundary violation
- Issue 1: Layer 2/3 physics content in Layer 1 theorem (CRITICAL)
- Issue 2: Mathematical triviality (standard orthogonal complement theorem)
- Issue 3: Conflated interpretation vs. derivation (MEDIUM)
- Complete refactoring template with before/after structure
- Action items (immediate and follow-up)
- Verification script assessment
- Sign-off and recommendations

**For**: Deep technical review, refactoring guidance

---

### 2. SUMMARY_THM_04A1_FINDINGS.md (7 KB)

**Executive Summary (Non-Technical)**

Contents:
- Three-issue summary in plain language
- Impact assessment table
- Recommended actions (immediate and follow-up)
- Verification status
- "The Good News" section (insight survives with refactoring)
- Next steps for project lead

**For**: Quick briefing, decision-making, project planning

---

### 3. LAYER_VIOLATIONS_EXTENDED_THEOREMS.md (8.7 KB)

**Systemic Risk Assessment**

Contents:
- Overview of suspected violations in related theorems
- Confirmed: THM_04A1
- Suspected (require audit): THM_0487, 0488, 0489
- Audit roadmap and checklist
- Preliminary findings summary
- Why this matters (epistemological risk)
- Files to audit prioritized by risk
- Refactoring template

**For**: Planning extended theorem audit, preventing proliferation of violations

---

## What Each File Addresses

| Question | Answer In |
|----------|-----------|
| What's wrong with THM_04A1? | SUMMARY or LAYER_VIOLATION (detailed) |
| How do I fix it? | LAYER_VIOLATION (Step 1-3 refactoring guide) |
| Are other files affected? | LAYER_VIOLATIONS_EXTENDED (yes, 3 more files suspected) |
| How urgent is this? | SUMMARY (CRITICAL) or LAYER_VIOLATION (HIGH severity) |
| What do I tell the user? | SUMMARY (for executive briefing) |
| What's the technical detail? | LAYER_VIOLATION (full audit report) |
| How do I prevent this elsewhere? | LAYER_VIOLATIONS_EXTENDED (prevention guidelines) |

---

## Key Findings at a Glance

### The Three Issues

1. **Layer Violation** (Lines 37, 48-50)
   - Status: CONFIRMED
   - Severity: CRITICAL
   - Fix: Split into Layer 1 (pure math) + Layer 2 (physics)

2. **Mathematical Triviality** (Core theorem statement)
   - Status: CONFIRMED
   - Severity: HIGH
   - Fix: Reframe as axiom application, not novel math

3. **Interpretation Conflation** (Axiom application vs. physics choice)
   - Status: CONFIRMED
   - Severity: MEDIUM
   - Fix: Mark correspondence rules with [A-IMPORT] in Layer 2

### Numbers

- **Lines with layer violations**: 4 lines (37, 48, 49, 50)
- **Physics concepts in Layer 1**: 5 (137=α^{-1}, SM, SU(7), U(1)_dark, m_DM)
- **Files needing refactoring**: 1 immediate (THM_04A1), 3 suspected (THM_0487/0488/0489)
- **Estimated fix time**: 1-2 hours for THM_04A1, 2-3 hours for extended audit

---

## Verification Status

**Current Script**: `verification/sympy/observable_fraction_analysis.py` — PASS

**What It Verifies**:
- ✓ 137 = 16 + 121 arithmetic
- ✓ 79/137 ≈ 1/√3 to 0.12%

**What It Does NOT Verify**:
- ✗ Physics interpretation (137 = α^{-1})
- ✗ Gauge structure (SU(7)×U(1)_dark correctness)
- ✗ Mass formula derivation (why (49/9) m_p)

**Action**: After refactoring, write separate Layer 2 verification script for gauge structure and mass formula.

---

## Recommended Action Sequence

### Session 138+ (Immediate)

1. **Review** SUMMARY_THM_04A1_FINDINGS.md
2. **Decide**: Refactor now or defer?
3. **If refactoring**:
   - Use template from AUDIT_THM_04A1_LAYER_VIOLATION.md (Step 1-3)
   - Follow "Recommended Fix (Complete)" section
   - Update registry/CLAIM_DEPENDENCIES.md
   - Create `framework/investigations/dark_matter/dark_sector_channel_identification.md`

### Session 138+ (Follow-up, If Time)

4. **Prevent spread**: Run audit checklist on THM_0487, 0488, 0489 (See LAYER_VIOLATIONS_EXTENDED)
5. **Document pattern**: Add layer-checking guidelines to project rules
6. **Create automation**: Script to detect [A-IMPORT] in core/theorems/

### Session 139 (Planned)

7. **Extended audit**: Full layer boundary audit on all THM_04XX files
8. **Resolution**: Categorize each (pure Layer 1, mixed Layer 1/2, primarily Layer 2)
9. **Refactor**: Apply templates to all layer violations found

---

## Files Modified This Audit

### Created

- `.auditor/reports/AUDIT_THM_04A1_LAYER_VIOLATION.md` (12 KB)
- `.auditor/reports/SUMMARY_THM_04A1_FINDINGS.md` (7 KB)
- `.auditor/reports/LAYER_VIOLATIONS_EXTENDED_THEOREMS.md` (8.7 KB)
- `.auditor/reports/INDEX_THM_04A1_AUDIT_SESSION.md` (this file)

### Updated

- `.auditor/AUDIT_PROGRESS.md` (added Phase 1C Addendum + layer violation findings table)

### Not Modified (Requires Deliberate Refactoring)

- `core/theorems/THM_04A1_crystal_decomposition.md` (flagged for refactoring, NOT auto-modified)

---

## Critical Decisions Needed

### Decision 1: Scope

**Options**:
- A. Fix THM_04A1 only (this session)
- B. Fix THM_04A1 + run audit on THM_0487/0488/0489 (1-2 extra hours)
- C. Defer to dedicated extended-theorem audit session

**Recommendation**: A (fix THM_04A1 now) + B (quick audit checklist on other three, 30 min).

### Decision 2: Promotion Status

**Current**: THM_04A1 marked as SKETCH (correct)

**After Refactoring Options**:
- Option 1: Promote to CANONICAL after fix (if clean separation achieved)
- Option 2: Keep as SKETCH pending extended-theorem audit (ensure no systemic issues)

**Recommendation**: Option 2 (preserve flexibility).

### Decision 3: Automation

**Create layer-violation detection script**?
- Cost: 1-2 hours
- Benefit: Prevents future violations, catches mistakes in new files
- Recommendation: YES (add to post-session 139 backlog)

---

## Related Files in Registry

### Dependency Files

- `registry/CLAIM_DEPENDENCIES.md` — Will need update to show Layer 2 separation
- `registry/STATUS_DASHBOARD.md` — May need update on theorem status
- `verification/sympy/observable_fraction_analysis.py` — Current verification script (keep)

### Guideline Files

- `.claude/rules/01-confidence-tagging.md` — Already specifies [A-IMPORT] tagging
- `.claude/rules/03-session-workflow.md` — Already specifies layer separation
- `core/CLAUDE.md` — Layer 0 purity rules already documented
- `framework/CLAUDE.md` — Layer 2 correspondence guidelines already present

**Assessment**: Project guidelines are clear; execution just needs to catch up.

---

## Lessons for Future Theorems

### Red Flags When Reviewing New Theorems

- [ ] Title contains physics concepts (gauge, field, breaking, etc.)
- [ ] Proof uses specific physical constants or measurement values [A-IMPORT]
- [ ] Implications section references Standard Model or observable values
- [ ] No explicit statement of what's axiom (Layer 0) vs. what's interpretation (Layer 2)
- [ ] Orthogonal complement or standard math result claimed without attribution

### Prevention Checklist Before Filing

For each new core/theorems/ file:
- [ ] Pure math proof only (no physics)
- [ ] All physics interpretation moved to framework/investigations/
- [ ] All [A-IMPORT] values explicitly marked
- [ ] Implications section references only Layer 1 consequences
- [ ] Acknowledgment of any standard mathematics being applied
- [ ] SymPy verification for any numerical claims

---

## Success Criteria for Refactoring

After THM_04A1 is fixed, it should satisfy:

1. **Layer 1 file** (`core/theorems/THM_04A1`):
   - ✓ Pure mathematical statement only
   - ✓ All [A-IMPORT] tags removed
   - ✓ Implications reference only Layer 1 consequences
   - ✓ Physics interpretation explicitly deferred to Layer 2

2. **Layer 2 file** (new or updated):
   - ✓ Contains all physics correspondence rules
   - ✓ All physics identifications marked [A-IMPORT]
   - ✓ Structural choices marked [A-STRUCTURAL]
   - ✓ Clear: what follows from pure math (Layer 1) vs. what requires physics choice (Layer 2)

3. **Registry** (`CLAIM_DEPENDENCIES.md`):
   - ✓ THM_04A1 shows pure axiom dependencies only
   - ✓ Physics file shows [A-IMPORT] dependencies
   - ✓ Clear chain: axioms → pure math → correspondence → prediction

---

## Audit Sign-Off

**Conducted by**: Claude Code (Physics Auditor)
**Date**: 2026-01-30
**Report Status**: COMPLETE - READY FOR BRIEFING
**Quality**: Full analysis, templates provided, ready for execution

**Recommendation**: Share SUMMARY_THM_04A1_FINDINGS.md with project lead for decision on next steps.

---

## Quick Links Within Reports

**To understand the issue**: Start with SUMMARY_THM_04A1_FINDINGS.md (5 min read)

**To fix it**: Go to AUDIT_THM_04A1_LAYER_VIOLATION.md, section "Recommended Fix (Complete)" (20 min to implement)

**To assess systemic risk**: See LAYER_VIOLATIONS_EXTENDED_THEOREMS.md (10 min read)

---

**End of Index**

---

**Files in This Audit Suite**:
1. SUMMARY_THM_04A1_FINDINGS.md ← Start here (executive summary)
2. AUDIT_THM_04A1_LAYER_VIOLATION.md ← Full technical report
3. LAYER_VIOLATIONS_EXTENDED_THEOREMS.md ← Systemic risk assessment
4. INDEX_THM_04A1_AUDIT_SESSION.md ← This file (navigation guide)
