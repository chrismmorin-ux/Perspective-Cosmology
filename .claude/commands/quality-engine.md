# Quality Engine

You are the QUALITY ENGINE for Perspective Cosmology. Your job is to systematically
improve the rigor, consistency, and completeness of this repository.

## Execution Model

Run four phases sequentially. Each phase uses subagents for parallel scanning.
After each phase, write findings to the report file before proceeding.

**Report file**: `.quality/report.md` (overwrite each run)
**History file**: `.quality/history.md` (append summary after each run)

Before starting: Read `.quality/report.md` if it exists — note previous issue counts for trend tracking.

## Phase 1: STRUCTURAL SCAN (Auto-fixable)

Launch subagents to check in parallel:

### 1.1 Broken References
- Scan all .md files for `[text](path)` links — verify targets exist
- Scan for `DEF_XXXX`, `AXM_XXXX`, `THM_XXXX`, `LEM_XXXX` references — verify referenced files exist in `core/`
- Scan for `verification/sympy/*.py` references — verify scripts exist
- **Auto-fix**: Remove broken links, flag missing targets

### 1.2 Missing Headers
- All `core/axioms/`, `core/definitions/`, `core/theorems/` files must have Status field
- All `framework/investigations/` files must have Status, Created, Last Updated fields
- All `sessions/S*.md` files must have date and focus
- **Auto-fix**: Add missing header fields with UNKNOWN/TODO values

### 1.3 Orphaned Files
- Files in `framework/investigations/` not listed in `_INDEX.md`
- Verification scripts not referenced from any .md file
- Session files not listed in `sessions/INDEX.md`
- **Report**: List orphans for manual triage

### 1.4 Size Violations
- Any .md file > 30KB in `framework/investigations/`
- Any .md file > 10KB in `sessions/`
- Any .py file > 20KB in `verification/sympy/`
- Any registry file > 15KB
- **Report**: List violations with current sizes

After auto-fixes, re-scan once. Report remaining issues.

## Phase 2: CONTENT SCAN (Report + Suggest)

### 2.1 Untagged Claims
- Scan `core/theorems/` and `framework/investigations/` for claims without confidence tags
- Look for statements like "X = Y" or "this implies" without [THEOREM], [DERIVATION], [CONJECTURE], etc.
- **Report**: File, line range, suggested tag

### 2.2 Unverified Calculations
- Scan for numerical values (especially with approximate-equals, =, ppm, %) without script references
- Cross-check: does the referenced script exist?
- **Report**: Unverified calculations with suggested script names

### 2.3 Incomplete Derivation Chains
- Scan for derivations missing [A]/[I]/[D] tags
- Check that every [I] import is acknowledged explicitly
- **Report**: Incomplete chains with what's missing

### 2.4 Stale Content Detection
- Files in `framework/investigations/` with Status: ACTIVE but no session reference in last 20 sessions
- Registry files referencing sessions more than 30 sessions old without updates
- **Report**: Stale files with suggested status change

## Phase 3: CONSISTENCY SCAN (Judgment Required)

### 3.1 Status Mismatches
- Theorem says PROVEN but investigation says CONJECTURE
- Investigation says CANONICAL but no verification script passes
- Claim tier doesn't match derivation confidence

### 3.2 Dependency Violations
- A depends on B, but B's status is lower confidence than A
- Circular dependencies in derivation chains
- Claims referencing deprecated/archived axioms

### 3.3 Layer Purity
- Layer 0 files (core/axioms) referencing physics values
- Layer 1 files importing without [A-IMPORT] tags
- Cross-layer contamination

### 3.4 Terminology Consistency
- Same concept called different names in different files
- Inconsistent notation (n_c vs N_c vs nc)

## Phase 4: INVESTIGATION PRIORITIZATION

### Scoring Formula

For each open investigation or proposed new investigation:

```
Priority = (D x G x F) / E

D = Dependency count (how many other claims depend on resolving this)
    Count references to this investigation from other files. Scale: 1-10

G = Gap severity (how far from rigorous is the current state)
    SPECULATION=5, CONJECTURE=4, SKETCH=3, DERIVATION=2, THEOREM=1. Scale: 1-5

F = Falsifiability (does resolving this create testable predictions?)
    Creates blind prediction=3, constrains parameters=2, internal only=1. Scale: 1-3

E = Effort (estimated sessions to make progress)
    Scale: 1-5
```

### Sources for Investigations
1. Open questions from recent session files (S194-S198)
2. `registry/FORMALIZATION_QUEUE.md` pending items
3. Findings from Phases 1-3 of this scan
4. `topics/` files with stalled progress
5. Dead ends that might be unblocked by new results

### Output: registry/INVESTIGATION_PRIORITIES.md
Ranked list with scores. Overwrites previous version.

## Report Format

Write to `.quality/report.md`:

```markdown
# Quality Engine Report
**Run date**: [date]
**Run number**: [N] (increment from history)
**Previous issues**: [count from last run, or "first run"]
**Current issues**: [count this run]
**Trend**: IMPROVING / STABLE / DEGRADING / FIRST RUN

## Summary
- Phase 1 (Structural): [N] issues ([M] auto-fixed)
- Phase 2 (Content): [N] issues
- Phase 3 (Consistency): [N] issues
- Phase 4: [N] investigations scored

## Critical Issues (Must Fix)
[Top 5 most impactful issues]

## Investigation Priorities (Top 10)
| Rank | Investigation | Score | D | G | F | E | Next Action |
|------|--------------|-------|---|---|---|---|-------------|

## Full Findings
### Phase 1: Structural
[detailed findings]

### Phase 2: Content
[detailed findings]

### Phase 3: Consistency
[detailed findings]

## Proposed Next Actions
1. [Highest-leverage fix]
2. [Second-highest]
3. [Third]
```

After writing the report, append a summary line to `.quality/history.md`:

```markdown
## Run [N] — [date]
Issues: [total]. Structural: [n] ([m] fixed). Content: [n]. Consistency: [n]. Top priority: [name].
```

## Subagent Usage

Use Task tool with subagent_type for parallel scanning:
- Phase 1: Launch 2-3 Explore agents scanning different file sets simultaneously
- Phase 2: Launch 2 agents (content checks + script cross-references) simultaneously
- Phase 3: Launch 1-2 agents (consistency + dependency analysis)
- Phase 4: Launch 1 agent (scoring + ranking)

Keep main context clean — subagents do the heavy lifting. Collect their results and synthesize into the report.

## Iterative Design

The engine is designed for repeated runs:
- Each run produces a report comparing to previous runs
- Auto-fixes in Phase 1 may surface new Phase 2/3 issues
- Investigation priorities shift as issues are resolved
- History file tracks improvement over time
- Re-run after any major documentation session
