# Session Workflow Protocol (Full Reference)

This is the unabridged version of the session protocol. The trimmed version is in `.claude/rules/03-session-workflow.md`.

## Session Start Details

### Step 0: Session Isolation
1. Read registry/ACTIVE_SESSIONS.md
2. Note active sessions and their scopes  
3. Clean up stale entries (>24h without update)
4. Ask user for THIS session's focus (do NOT auto-pick from backlog)
5. Register: Add row to "Currently Active"
6. If focus overlaps active session, WARN user

### Steps 1-4: See trimmed rules file
The trimmed file has the essential startup protocol. Additional details:
- If FORMALIZATION_QUEUE has PENDING items in-scope, mention in briefing
- If quality report exists and < 5 sessions old, note top 3 issues
- EXPLORATION_QUEUE: Filter by topic, present top OPEN items

## During Session Details

### On Every New Claim
1. Assign confidence tag (default: [CONJECTURE])
2. List any [A-IMPORT] values used
3. Write [A]/[I]/[D] derivation chain
4. Identify gaps: what's assumed but not proven?
5. Suggest falsification criterion
6. Add to registry/CLAIM_DEPENDENCIES.md if significant

### On Every Investigation
1. Create with ACTIVE status
2. Note in per-session file at end
3. Classify: Breakthrough -> CANONICAL, Near-miss -> QUARANTINE, Dead-end -> ARCHIVE, Anomaly -> Flag

### Formalization Prompts
After completing a derivation/finding, proactively ask:
"This [result] looks like it needs formalization -- capture now or queue it?"
- If "now": Write immediately
- If "queue": Add to FORMALIZATION_QUEUE.md with 2-5 sentence reasoning sketch
- Never silently skip

### Topic Transition Checkpoints
When session changes subtopic, pause and check:
1. Did previous subtopic produce unformalized results?
2. If yes: "Before we move to [new topic] -- the [result] isn't documented yet."
3. Formalize or queue before proceeding

## Session End Details

### Step 4b: Exploration Queue Triage
1. New open questions -> add EQ entry
2. Questions resolved -> move to Recently Resolved
3. BLOCKED items with resolved blockers -> move to OPEN
4. Trim: Recently Resolved to 30, Archive to 20
5. Update header counts

### Step 4c: Propagation Manifest
Quick check: scan key findings for "RESOLVED", "RETRACTED", "PROVEN", "upgraded", "count ->", "CANONICAL"
If found: update registry/PROPAGATION_MANIFEST.md, list affected files, update high-priority cross-refs if feasible

### Step 5: File Placement Check
For every NEW file: correct header? correct directory per PLACEMENT_GUIDE.md? Added to _INDEX.md?

### Step 6: Quality Integration
- Resolved quality issues? Note for next engine run
- New investigations? Add to FORMALIZATION_QUEUE.md
- > 5 sessions since last /quality-engine? Mention it

## Issue Filing Format
### I-XXX: [Title] (SEVERITY)
Filed: YYYY-MM-DD | Status: OPEN | Severity: CRITICAL/HIGH/MEDIUM/LOW
Affects: [files] | Description: [problem] | Resolution Options: [1, 2]
