# Decision Framework

## Priority Matrix

```
                    HIGH CONFIDENCE                LOW CONFIDENCE
                    (derived/verified)            (conjecture/spec)
              ┌─────────────────────┬─────────────────────┐
   HIGH       │                     │                     │
   IMPACT     │    CONSOLIDATE      │      EXPLORE        │
              │   (documentation,   │   (high risk/       │
              │    verification)    │    high reward)     │
              ├─────────────────────┼─────────────────────┤
   LOW        │                     │                     │
   IMPACT     │     MAINTAIN        │      DEFER          │
              │   (keep current,    │   (backlog unless   │
              │    don't expand)    │    relevant)        │
              └─────────────────────┴─────────────────────┘
```

## Session Types

### Exploration Session (~1 hour)
1. Pick one EXPLORE item from RESEARCH_NAVIGATOR
2. Write 2-3 search scripts
3. Classify outcome: breakthrough / near-miss / dead-end
4. Update RESEARCH_NAVIGATOR

### Consolidation Session (~1 hour)
1. Pick one CONSOLIDATE chain
2. Verify all claims have SymPy scripts
3. Check [A]/[I]/[D] tagging complete
4. Update MASTER_CLAIMS.md

### Maintenance Session (~30 min)
1. Run verification suite
2. Check emerging patterns age
3. Archive stale patterns
4. Update STATUS_DASHBOARD

## Recommended Session Ratio

```
EXPLORE      : 40%  (2 sessions/week)
CONSOLIDATE  : 40%  (2 sessions/week)
MAINTENANCE  : 20%  (1 session/week)
```

## Decision Rules

### Start new exploration if:
- Current avenue is blocked
- Breakthrough in adjacent area suggests new path
- Pattern maturity score reaches 4+

### Stop exploration if:
- 3 sessions with no progress
- Contradiction with high-confidence claims found
- Better approach identified

### Promote to consolidation when:
- Numerical prediction matches to <1%
- SymPy script passes all tests
- Derivation chain is complete

## Lead Status Categories

| Category | Meaning | Action |
|----------|---------|--------|
| **OPEN** | Active investigation | Continue work |
| **BLOCKED** | Waiting on dependency | Work on dependency first |
| **NEAR-MISS** | Close but gaps remain | Document gaps, revisit later |
| **RESOLVED** | Successfully completed | Move to CANONICAL |
| **DEAD-END** | Confirmed unworkable | Archive with lessons |

## Quadrant Assignments (Update Per Session)

Track current items in each quadrant in `registry/RESEARCH_NAVIGATOR.md`:

**CONSOLIDATE**: High-confidence, high-impact items needing documentation
**EXPLORE**: Low-confidence, high-impact items worth investigating
**MAINTAIN**: High-confidence, low-impact items to keep current
**DEFER**: Low-confidence, low-impact items for later
