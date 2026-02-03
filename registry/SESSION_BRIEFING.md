# Session Briefing Engine

**Created**: Session 131
**Purpose**: Single-page view of ALL workstreams, discoveries, and recommendations
**Protocol**: Claude generates this at EVERY session start

---

## How This Works

At session start, Claude:
1. Scans all tracking files
2. Checks for orphaned work (undocumented progress)
3. Identifies emerging discoveries worth investigating
4. Surfaces documentation gaps
5. Generates prioritized recommendations

This replaces the linear priority stack with a **multi-track view**.

---

## Workstream Categories

### A. ACTIVE INVESTIGATIONS
Things currently being worked on with momentum.

### B. DISCOVERIES NEEDING FOLLOW-UP
New findings from recent sessions that haven't been fully explored.

### C. DOCUMENTATION GAPS
Work that was done but not properly recorded.

### D. BACKGROUND AGENT WORK
Cleanup, auditing, or maintenance tasks running in parallel.

### E. BLOCKED ITEMS
Things waiting on dependencies or decisions.

### F. READY TO START
Next-priority items that have no blockers.

---

## Session Start Protocol (NEW)

Claude MUST generate this briefing at session start:

```
================================================================
SESSION [N] BRIEFING — [DATE]
================================================================

WORKSTREAM STATUS:
-----------------
[A] Active: [count] investigations in progress
[B] Discoveries: [count] needing follow-up
[C] Doc gaps: [count] undocumented items
[D] Background: [list any agent work]
[E] Blocked: [count] waiting on dependencies
[F] Ready: [count] items ready to start

TOP 3 RECOMMENDATIONS:
----------------------
1. [MOST URGENT] — [Why]
2. [HIGH VALUE] — [Why]
3. [QUICK WIN] — [Why]

DISCOVERIES TO SURFACE:
-----------------------
- [Finding] from Session [N] — Status: [Unexplored/Partial/Documented]

DOCUMENTATION ALERTS:
---------------------
- [X] was done but not in [File]
- [Y] claim needs verification script

QUESTION FOR USER:
------------------
[One clarifying question about direction if needed]

================================================================
```

---

## Tracking Integration

This engine pulls from:

| Source | What It Provides |
|--------|------------------|
| `STATUS_DASHBOARD.md` | Session count, metrics, recent sessions |
| `RECOMMENDATION_ENGINE.md` | Priority queue |
| `session_log.md` | Recent work done |
| `emerging_patterns.md` | New discoveries |
| `FORMULA_SEARCH_LOG.md` | Search attempts |
| `DEAD_ENDS.md` | What to avoid |
| `FALSIFIED.md` | What's been ruled out |
| Investigation files | Active research status |

---

## Discovery Detection

A "discovery" is flagged when:
1. A new pattern/identity is found in a session
2. A verification script passes unexpectedly
3. A search finds an exact match
4. Multiple independent paths converge

Discoveries get tracked until:
- Fully documented with derivation chain
- Verified with independent script
- Added to appropriate catalog
- Or ruled out as coincidence

---

## Documentation Gap Detection

A "gap" is flagged when:
1. Session log mentions work not reflected in tracking files
2. A script exists without corresponding markdown documentation
3. A claim is made without verification script
4. RECOMMENDATION_ENGINE shows outdated status

---

## Example Briefing

```
================================================================
SESSION 132 BRIEFING — 2026-01-28
================================================================

WORKSTREAM STATUS:
-----------------
[A] Active: 2 investigations (primordial mechanisms, sound horizon)
[B] Discoveries: 3 needing follow-up (O²-k family, 337 decomposition, mu²=250)
[C] Doc gaps: 2 items (LLM challenge status, Session 129-131 RECOMMENDATION update)
[D] Background: None
[E] Blocked: 0
[F] Ready: 4 items

TOP 3 RECOMMENDATIONS:
----------------------
1. [DOC GAP] Update RECOMMENDATION_ENGINE — LLM Challenge Test 1 done but not marked
2. [DISCOVERY] Investigate O²-k family physics — Session 130 found pattern, unexplored
3. [CMB PLAN] Phase 2.3 Baryon-photon oscillations — Next in sequence

DISCOVERIES TO SURFACE:
-----------------------
- O²-k family (63,62,61,60,57,56) from S130 — Status: Documented but physics unclear
- mu²=250 has THREE equivalent expressions — Status: Derived S131, implications unexplored
- Sound speed c_s = 3/7 = Im_H/Im_O — Status: Derived S131, deep connection?

DOCUMENTATION ALERTS:
---------------------
- LLM Challenge Test 1 SUCCESS not reflected in RECOMMENDATION_ENGINE
- Session 129 critical correction not in ACHIEVEMENTS_LOG

QUESTION FOR USER:
------------------
Priority: Fix documentation gaps first, or continue CMB physics development?

================================================================
```

---

## Maintenance

This file defines the PROTOCOL. The actual briefing is generated fresh each session.

Update this file when:
- New tracking files are added
- New workstream categories emerge
- Discovery detection rules change

---

*A session without a briefing is a session without direction.*
