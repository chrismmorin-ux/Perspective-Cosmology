# Quarantine Zone

**Purpose**: Contains work that is incomplete, problematic, or speculative but worth preserving for potential future development.

**Different from Archive**: Quarantined work might be promotable to Active/Canonical with more work. Archived work is dead-ends.

---

## How Work Gets Quarantined

1. **Empty claims**: Asserts result without derivation
2. **Critical gaps**: Has identified problems blocking progress
3. **Superseded by better approach**: Old version kept for reference
4. **Verification failed**: Computation didn't match claim
5. **Circular reasoning**: Assumed what it tried to prove

---

## Current Quarantine Status

### GR Limit (Empty Construction)

**Files**:
- `physics/gravity_limit.md` — marked SPECULATION in-place
- `physics/gr_limit_investigation.md` — honest analysis, no construction

**Why Not Moved**: These files already have excellent self-documentation of their limitations. Moving them would lose the analysis value. They remain in physics/ with clear SPECULATION status.

**Migration Criteria**:
- [ ] Explicit formula: g_μν(x) = f(Γ, ...)
- [ ] Lorentzian signature derived
- [ ] Einstein equations at least sketched

### Deprecated α Derivation

**File**: `archive/deprecated/alpha_derivation.md`

**Why Archived (not Quarantined)**: This is a dead-end (Eddington-pattern numerology), not recoverable. Already properly archived.

---

## Quarantine Template

When quarantining a document:

```markdown
# [QUARANTINED] Original Title

**Quarantined**: YYYY-MM-DD
**Original Location**: path/to/file.md
**Reason**: [brief explanation]

---

## Original Content

[preserved]

---

## Why Quarantined

[detailed explanation]

## What We Learned

[lessons from the failure/gap]

## Migration Path

To restore to Active status:
- [ ] Requirement 1
- [ ] Requirement 2
```

---

## Quarantine vs. In-Place Warning

**When to Move to Quarantine**:
- Content has no analytical value
- Keeping it near canonical work causes confusion
- Multiple versions exist; old one should be isolated

**When to Mark In-Place** (like GR limit):
- Content includes valuable analysis of the gap
- Self-documenting limitations
- Clear status markers prevent confusion

Current policy: Prefer in-place warnings with status demotions. Only quarantine truly orphaned or confusing content.

---

## Index of Quarantined/Flagged Work

| Item | Location | Status | Issue |
|------|----------|--------|-------|
| GR limit | physics/gravity_limit.md | SPECULATION (in-place) | No g_μν construction |
| Old α derivation | archive/deprecated/ | ARCHIVED | Numerology |

---

*Last updated: 2026-01-26*
