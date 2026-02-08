# Session Workflow Protocol

## Session Start (MANDATORY - Do Without Being Asked)

### Step 0: Session Isolation (do FIRST)
1. Read `registry/ACTIVE_SESSIONS.md`
2. Note any active sessions and their scopes
3. Clean up stale entries (>24h without update)
4. Ask user for THIS session's focus (do NOT auto-pick from backlog)
5. Register: Add a row to "Currently Active" with session label, focus, date
6. If focus overlaps an active session, WARN the user

### Step 1: Read Index (1 file)
```
sessions/INDEX.md    → Orientation: active topics, work backlog, recent sessions
```

### Step 2: Load Context (1-2 files, only if continuing a topic)
```
sessions/S{last_relevant}.md  → Previous session's findings and open questions
topics/{topic}.md              → Multi-session accumulated state (if topic file exists)
```
Pick the relevant session and topic from INDEX.md based on the user's declared focus.

### Step 3: Check Formalization Queue
```
registry/FORMALIZATION_QUEUE.md  → Any deferred items matching this session's focus?
```
If the queue has PENDING/DEFERRED items in-scope, mention them in the briefing.

### Step 3b: Check Quality Report (if recent)
If `.quality/report.md` exists and is less than 5 sessions old:
- Note top 3 issues relevant to this session's declared focus
- Note the top-ranked investigation from `registry/INVESTIGATION_PRIORITIES.md` matching the focus
- Include in briefing (one line each, don't overload)

### Step 3c: Check Exploration Queue
```
registry/EXPLORATION_QUEUE.md  → OPEN/BLOCKED items matching this session's focus
```
Filter by topic column. Present top OPEN items in briefing:
```
Exploration queue: [N] OPEN items in scope, [M] HIGH priority. Top: EQ-001 (description), EQ-002 (description).
```
If any BLOCKED items have their blockers resolved, note them for status update.

### Step 4: Brief the User
Format:
```
Session [label]. Focus: [declared scope].
Active parallel sessions: [list or none].
Topic state: [summary from topic file, or "new topic"].
Open questions: [from previous session file].
Exploration queue: [N] OPEN items in scope, [M] HIGH priority. Top: EQ-NNN (...), EQ-NNN (...).
Quality issues in scope: [from .quality/report.md, or "none" / "no recent scan"].
Shall we proceed?
```

**Total startup reads**: 3-6 files (~35KB). Do NOT read STATUS_DASHBOARD.md, RECOMMENDATION_ENGINE.md, or session_log.md at startup (these are frozen/historical).

---

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

### Hallucination Protection (On Every Derivation)
1. **Calculate HRS** (Hallucination Risk Score):
   - Matches known value? +2
   - "It can be shown" language? +2
   - No intermediate steps? +3
   - Seems "too good"? +2
   - Multiple verifications? -2
   - Clear derivation chain? -2
2. **If HRS >= 4**: Require multi-path verification before accepting
3. **Challenge**: Ask "What would make this wrong?"
4. **If hallucination caught**: Log in `registry/HALLUCINATION_LOG.md`

### On Every Investigation
1. Create with ACTIVE status
2. Note in per-session file at end
3. When done, classify:
   - **Breakthrough** -> Verify rigorously, promote toward CANONICAL
   - **Near-miss** -> QUARANTINE, analyze gaps
   - **Dead-end** -> ARCHIVE with lessons
   - **Anomaly** -> Flag for axiom review

### Capture Insights Immediately
Don't wait until session end. When a pattern emerges:
```
registry/emerging_patterns.md -> Add with timestamp and score
```

### Propagation Awareness (After Major Results)
When a result constitutes a **propagation trigger** (status change, retraction, count change,
formula update), immediately note it for Step 4c:

> "This resolves [X] — propagation trigger. Will update manifest at session end."

For CRITICAL triggers (retractions, falsifications), consider updating key cross-references
immediately rather than deferring to session end, since stale critical information actively
misleads. For MEDIUM/LOW triggers, defer to Step 4c.

### Formalization Prompts (After Every Derivation or Finding)
After completing a derivation, finding, or significant result, proactively ask:

> "This [result] looks like it needs formalization -- capture now or queue it?"

- **If "now"**: Write the file/update immediately while reasoning is fresh.
- **If "queue"**: Add to `registry/FORMALIZATION_QUEUE.md` with a reasoning sketch
  (2-5 sentences: key assumptions, critical step, what's non-obvious).
  The sketch must be sufficient to reconstruct the argument WITHOUT this conversation.
- **Never silently skip**. Every non-trivial result either gets formalized or queued.

### Topic Transition Checkpoints
When the session is about to change subtopic (user redirects, natural transition, or
new question), pause and check:

1. Did the previous subtopic produce results that aren't formalized yet?
2. If yes: "Before we move to [new topic] -- the [result] from [old topic] isn't
   documented yet. Formalize now or queue it?"
3. Formalize or queue before proceeding to the new topic.

This is the moment where context is most likely to get lost. Don't skip it.

---

## Session End (MANDATORY)

### Step 0: Deregister Session (do FIRST)
1. Move this session's row from "Currently Active" to "Recently Completed" in `registry/ACTIVE_SESSIONS.md`
2. Add handoff notes (1-2 sentences: what was done, what's next for this topic)

### Step 1: Write Per-Session File
Create `sessions/S{N}.md` with:
- Header: date, focus, topic link, status, previous/next session links
- Outcome: 2-3 sentence summary
- Key findings (numbered, with confidence tags)
- Scripts table (name, test count, status)
- Files created/modified
- Open questions for continuation
- Key context paragraph (what the next session needs to know)

This file IS the session record AND the continuation prompt. One file, two purposes.

### Step 2: Update Index
Edit `sessions/INDEX.md`:
- Add this session to "Recent Sessions" (remove oldest if >10)
- Update the relevant "Active Topics" row (status, next step)
- Update "Work Backlog" if items were completed or new ones identified

This should be 2-3 line edits, not a page rewrite.

### Step 3: Update Topic File
If a topic file exists in `topics/`:
- Append new "What Works" entries (proven results)
- Append new "What Failed" entries (dead ends)
- Rewrite "Open Paths" to reflect current state
- Add session to session list

If this is the SECOND session on a topic and no topic file exists, create one.

### Step 4: Formalization Queue Triage
Review every entry in `registry/FORMALIZATION_QUEUE.md`:
- **PENDING items**: Formalize now or explicitly DEFER with a target session.
- **Never leave PENDING items from this session untriaged.**
- Move completed/discarded items to the "Completed / Discarded" section.

### Step 4b: Exploration Queue Triage
Update `registry/EXPLORATION_QUEUE.md`:
1. For each **new open question** from this session → add EQ entry (or update existing)
2. For each **question resolved** this session → move to Recently Resolved with resolution note
3. For **BLOCKED items** whose blockers resolved → move back to OPEN
4. Trim: Recently Resolved to 30 entries, Archive to 20 entries
5. Update header counts (Active, Resolved since last engine run)

Session file "Open Questions" sections reference EQ IDs:
```
1. **Top Yukawa** (EQ-006): Can y_t ~ 1 be derived...
```

### Step 4c: Propagation Manifest Update
Check if this session produced any **propagation triggers**:

1. **Status changes**: Did any CONJ become THEOREM/DERIVATION? Any investigation become CANONICAL?
2. **Retractions**: Was anything RETRACTED or FALSIFIED?
3. **Count changes**: Did IRA count, script count, or prediction count change?
4. **Formula changes**: Did any formula coefficient or value change?
5. **Assessment changes**: Did probability estimates or grades change?
6. **EQ resolutions**: Were any exploration queue items resolved?

If YES to any:
1. Read `registry/PROPAGATION_MANIFEST.md`
2. For each trigger: add a new PROP entry OR update an existing one
3. List known files that reference the old value (grep if unsure)
4. Update any high-priority cross-references in the same session if feasible
5. Mark remaining stale references for the next quality engine run

If NO triggers: skip this step.

**Quick check** (< 2 min): Scan your session's key findings for words like "RESOLVED",
"RETRACTED", "PROVEN", "upgraded", "count ... ->", "CANONICAL". If none, move on.

### Step 5: File Placement Check
For every NEW file created this session:
1. Does it have the standard header (Status/Layer/Topic)?
2. Is it in the correct directory per `PLACEMENT_GUIDE.md`?
3. Add it to `framework/investigations/_INDEX.md` if it's an investigation file.

### Step 6: Quality Integration
- If this session resolved any issues from `.quality/report.md`, note them (for next engine run)
- If this session created new investigations, add them to `registry/FORMALIZATION_QUEUE.md` for the engine to score
- If > 5 sessions since last `/quality-engine` run, mention it in the summary

### Step 7: Summarize for User
Format:
```
Done: [main accomplishments]
Filed: [any new issues or investigations]
Updated: [sessions/S{N}.md, sessions/INDEX.md, topics/{name}.md]
Next session: [suggested direction from open questions]
```

---

## Periodic Triage (When Natural Pause)

Check these when the user is thinking or exploring:
1. Any investigation files without confidence tags?
2. Any derivations without [A]/[I]/[D] chains?
3. Any claims without verification scripts?
4. Any patterns ready for promotion/archival?

Don't announce this triage unless you find issues.

---

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
