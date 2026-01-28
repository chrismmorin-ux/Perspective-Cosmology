# Session Workflow Protocol

## Session Start (MANDATORY - Do Without Being Asked)

### Step 1: Read Status (2 files)
```
registry/STATUS_DASHBOARD.md    → Current state at a glance
registry/RESEARCH_NAVIGATOR.md  → Top 4 priorities
```

### Step 2: Check for Issues
```
session_log.md                  → Where we left off
registry/emerging_patterns.md   → Any stale patterns (>3 sessions)?
```

### Step 3: Brief the User
Format:
```
Session [N]. Last session: [summary].
Top priorities: 1) [X], 2) [Y], 3) [Z].
Blockers: [any CRITICAL issues or none].
Stale patterns: [count, if any].
Which direction?
```

## During Session

### On Every New Claim
1. Assign confidence tag (default: [CONJECTURE])
2. List any [A-IMPORT] values used
3. Write [A]/[I]/[D] derivation chain
4. Identify gaps: what's assumed but not proven?
5. Suggest falsification criterion
6. Add to `registry/CLAIM_DEPENDENCIES.md` if significant

### On Every Calculation
1. Write SymPy script FIRST
2. Run and confirm PASS
3. Only then document in markdown
4. Reference script in documentation

### On Every Investigation
1. Create with ACTIVE status
2. Note in session_log.md
3. When done, classify:
   - **Breakthrough** → Verify rigorously, promote toward CANONICAL
   - **Near-miss** → QUARANTINE, analyze gaps
   - **Dead-end** → ARCHIVE with lessons
   - **Anomaly** → Flag for axiom review

### Capture Insights Immediately
Don't wait until session end. When a pattern emerges:
```
registry/emerging_patterns.md → Add with timestamp and score
```

## Session End (MANDATORY)

### Step 1: Update Tracking Files
```
session_log.md           → Work done, decisions made, issues found
STATUS_DASHBOARD.md      → Refresh metrics if changed significantly
RESEARCH_NAVIGATOR.md    → If priorities changed
```

### Step 2: Pattern Maintenance
- Increment "Sessions since capture" for all patterns
- Promote patterns with score ≥ 4 to proper files
- Flag patterns >3 sessions old as stale

### Step 3: Summarize for User
Format:
```
Done: [main accomplishments]
Filed: [any new issues or investigations]
Updated: [tracking files modified]
Next session: [suggested direction]
```

## Periodic Triage (When Natural Pause)

Check these when the user is thinking or exploring:
1. Any investigation files without confidence tags?
2. Any derivations without [A]/[I]/[D] chains?
3. Any claims without verification scripts?
4. Any patterns ready for promotion/archival?

Don't announce this triage unless you find issues.

## Issue Filing Format

When problems found:
```markdown
### I-XXX: [Title] (SEVERITY)

**Filed**: YYYY-MM-DD
**Status**: OPEN
**Severity**: CRITICAL | HIGH | MEDIUM | LOW
**Affects**: [list of files]

**Description**: [What is the problem?]

**Resolution Options**:
1. [Option 1]
2. [Option 2]
```

Severity guidelines:
- **CRITICAL**: Contradicts observations or breaks framework logic
- **HIGH**: Significant gap in derivation
- **MEDIUM**: Calculation error or inconsistency
- **LOW**: Minor clarification
