# Registry Directory Guidelines

## Purpose

This directory is the **single source of truth** for tracking the framework's state — what's claimed, what's proven, what depends on what, and what would falsify claims.

## Key Files

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `STATUS_DASHBOARD.md` | One-page state summary | Every session |
| `RESEARCH_NAVIGATOR.md` | Top 4 priorities | When priorities change |
| `MASTER_CLAIMS.md` | All claims with dependencies | When claims added/modified |
| `CLAIM_DEPENDENCIES.md` | What breaks if X changes | When dependencies discovered |
| `FALSIFICATION_REGISTRY.md` | What would disprove claims | When predictions made |
| `derivations_summary.md` | All derived constants | When derivations complete |
| `emerging_patterns.md` | New insights (temp) | During sessions |
| `assumptions_registry.md` | All assumptions used | When assumptions identified |
| `tag_registry.md` | Axiom/theorem numbering | When axioms/theorems added |

## Session Start Protocol

**READ THESE TWO FILES FIRST:**

1. `STATUS_DASHBOARD.md` — Current metrics, recent breakthroughs, blockers
2. `RESEARCH_NAVIGATOR.md` — Top 4 avenues, what to work on

Then brief the user with the summary.

## Session End Protocol

**UPDATE THESE FILES:**

1. `session_log.md` (in root) — Work done, decisions, issues
2. `STATUS_DASHBOARD.md` — Refresh metrics if they changed
3. `RESEARCH_NAVIGATOR.md` — If priorities shifted

## Emerging Patterns

The file `emerging_patterns.md` is for capturing insights DURING a session before they're formalized.

### Pattern Fields

| Field | Purpose |
|-------|---------|
| Pattern | What was observed |
| Context | Where it came from |
| Score | 1-5 maturity rating |
| Sessions since | Age tracking |
| Action | What to do with it |

### Pattern Lifecycle

1. **Capture**: Add with score 1-2 when first noticed
2. **Mature**: Increment score as evidence accumulates
3. **Promote**: When score ≥ 4, move to proper file
4. **Archive**: If >3 sessions old without promotion, evaluate

### Stale Pattern Detection

Patterns with "Sessions since capture" > 3 are STALE:
- Either promote them (formalize into investigation)
- Or archive them (not worth pursuing)

## Claim Dependencies

The file `CLAIM_DEPENDENCIES.md` tracks what breaks if assumptions change.

### Entry Format

```markdown
### [Claim]

**Depends on**:
- [AXM_XXXX]: [what aspect]
- [THM_XXXX]: [what aspect]
- [A-IMPORT: value]: [how used]

**If wrong, affects**:
- [Claim 1]
- [Claim 2]

**Confidence**: [level]
```

### Why This Matters

When we discover an axiom is wrong or an import is inaccurate:
1. Look up that axiom/import in CLAIM_DEPENDENCIES
2. Immediately see all affected claims
3. Prioritize re-verification

## Falsification Registry

The file `FALSIFICATION_REGISTRY.md` tracks what would DISPROVE claims.

### Entry Format

```markdown
### [Prediction]

**Claim**: [what we predict]
**Falsified if**: [what measurement would disprove it]
**Current measurement**: [value ± uncertainty]
**Our prediction**: [value]
**Margin**: [how far off before falsified]
**Status**: SAFE | AT RISK | FALSIFIED
```

### Why This Matters

Science requires falsifiability. Every prediction MUST have a clear criterion for being wrong.

## Derivations Summary

The file `derivations_summary.md` is the master list of all derived constants.

### Required Fields

| Field | Content |
|-------|---------|
| Constant | What's derived |
| Formula | Exact expression |
| Value | Numerical prediction |
| Measured | Experimental value |
| Error | ppm or percentage |
| Verification | Script reference |
| Session | When derived |

### Keep in Sync

When a new constant is derived:
1. Add to `derivations_summary.md`
2. Add to `MASTER_CLAIMS.md`
3. Add to `FALSIFICATION_REGISTRY.md` if testable
4. Update `STATUS_DASHBOARD.md` metrics

## Cross-Reference Integrity

These files MUST stay consistent:

```
derivations_summary.md
       ↕
MASTER_CLAIMS.md
       ↕
CLAIM_DEPENDENCIES.md
       ↕
FALSIFICATION_REGISTRY.md
```

When updating one, check if others need updating too.

## Issue Tracking

Issues go in `session_log.md` (root directory), not here.

Format:
```markdown
### I-XXX: [Title] (SEVERITY)
...
```

But registry files may REFERENCE issues when they affect claims.
