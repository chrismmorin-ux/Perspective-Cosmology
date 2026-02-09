# Decision Framework

## Priority Matrix

```
                    HIGH CONFIDENCE                LOW CONFIDENCE
                    (derived/verified)            (conjecture/spec)
              +---------------------+---------------------+
   HIGH       |                     |                     |
   IMPACT     |    CONSOLIDATE      |      EXPLORE        |
              |   (documentation,   |   (high risk/       |
              |    verification)    |    high reward)     |
              +---------------------+---------------------+
   LOW        |                     |                     |
   IMPACT     |     MAINTAIN        |      DEFER          |
              |   (keep current,    |   (backlog unless   |
              |    don't expand)    |    relevant)        |
              +---------------------+---------------------+
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
