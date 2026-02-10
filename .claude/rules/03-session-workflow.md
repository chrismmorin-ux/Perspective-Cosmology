# Session Workflow Protocol

## Session Start (MANDATORY)

1. **Read `registry/ACTIVE_SESSIONS.md`** — check for active sessions, clean stale (>24h), register this session
2. **Read `sessions/INDEX.md`** — orientation: active topics, work backlog, status snapshot
3. **Read previous session file OR topic file** (one, not both, unless both < 5KB)
4. **Brief user**: "Session [label]. Focus: [scope]. Active parallels: [list/none]. Shall we proceed?"

**Do NOT read at startup**: `.quality/report.md`, `EXPLORATION_QUEUE.md`, `FORMALIZATION_QUEUE.md`. These are read on-demand when relevant. INDEX.md Status Snapshot has the key summaries.

**Total startup reads: 3 files (~10-15KB).** Use subagents for heavy reads during work.

## During Session

**On every claim**: Assign confidence tag (default [CONJECTURE]), list [A-IMPORT] values, write [A]/[I]/[D] chain, suggest falsification criterion.

**On every calculation**: Write SymPy script FIRST -> run -> confirm PASS -> then document.

**Hallucination protection**: Calculate HRS. If >= 4, require multi-path verification. Ask "What would make this wrong?" Log catches in `registry/HALLUCINATION_LOG.md`.

**Capture insights immediately** to `registry/emerging_patterns.md`.

**After every derivation**: Ask "formalize now or queue?" Never silently skip.

**At topic transitions**: Check for unformalized results before moving on.

**Context preservation**: Before reading any file >10KB, consider: need the full file, or just a section? Use line ranges or delegate to a subagent.

**Propagation awareness**: When a result is a propagation trigger (status change, retraction, count change, formula update), note for session end.

## Session End (MANDATORY)

### Step 0: Deregister
Move row from "Currently Active" to "Recently Completed" in `registry/ACTIVE_SESSIONS.md` (keep last 5 only, bump oldest).

### Step 1: Write session file
Create `sessions/S{N}.md`: date, focus, outcome summary, key findings with confidence tags, scripts table, open questions, key context paragraph.

### Step 2: Update INDEX.md
Add to "Recent Sessions" list (keep 10). Update relevant "Active Topics" row. Update "Work Backlog" if needed. 2-3 line edits only.

### Step 3: Update topic file
If topic file exists: append new results, rewrite "Open Paths", add session to list. Create topic file on SECOND session for a topic.

### Step 4: Triage queues
- **Formalization queue**: Triage PENDING items -- formalize now or DEFER with target session
- **Exploration queue**: Add new open questions, resolve answered ones, update BLOCKED items
- **Propagation manifest**: If session produced status changes, retractions, count changes, formula changes -- update `registry/PROPAGATION_MANIFEST.md`
- **Website impact**: Did this session modify `claims/`, `predictions/`, `publications/`, `verification/sympy/`, or registry status files? If yes, add a one-line note to the session file: `Website: [file] potentially stale ([reason])`. No scripts run -- just flag for next website update. Run `npm run check-sync` from `website/` to see full drift status.

### Step 5: Summarize
```
Done: [main accomplishments]
Filed: [new issues/investigations]
Updated: [files modified]
Next session: [suggested direction]
```

Full unabridged protocol: `docs/session-protocol-full.md`
