# Session Management

## Structure

```
sessions/
    INDEX.md          # Lightweight global index (<5KB) -- THE file to read at start
    S152.md           # Per-session context files
    S153.md
    S154.md
    S155.md
    S156.md
    ...               # Future sessions get their own files
    archive/          # Old session files (>20 sessions back)

topics/               # Multi-session investigation trackers
    weinberg-angle.md
    step5-alpha-mechanism.md
    casimir-crystallization.md
    ...
```

## How It Works

### Per-Session Files (`sessions/S{N}.md`)

Each session gets its own file. Contains:
- Header: date, focus, topic link, status, previous/next session links
- Outcome: 2-3 sentence summary
- Key findings, scripts, files modified
- Open questions for continuation (the actual handover context)

**Never overwritten.** Each session gets its own file.

### Topic Files (`topics/{slug}.md`)

Created when a second session works on the same topic. Contains:
- Current state (2-3 sentences)
- What works (proven results, append-only)
- What failed / dead ends (append-only)
- Open paths (current research plan)
- Session list and key files

These are the critical multi-session memory. A new session on "Weinberg angle" reads one file instead of reconstructing 5+ sessions of history.

### Index (`sessions/INDEX.md`)

The single orientation file. Contains:
- Active topics table (5-7 rows)
- Work backlog (replaces RECOMMENDATION_ENGINE priority queue)
- Recent sessions (last 10)
- Framework quick reference

Update cost at session end: change 2-3 lines.

## Session Protocol

### Start (read 2-4 files, ~25KB total)
1. `registry/ACTIVE_SESSIONS.md` -- parallel session check, register
2. `sessions/INDEX.md` -- orientation
3. `sessions/S{last_relevant}.md` -- if continuing a topic
4. `topics/{topic}.md` -- if topic file exists

### End (write 2-3 files)
1. `sessions/S{N}.md` -- this IS the session record AND continuation prompt
2. `sessions/INDEX.md` -- move to recent, update topic row (2-3 line edits)
3. `topics/{topic}.md` -- append what worked/failed, rewrite current state
4. `registry/ACTIVE_SESSIONS.md` -- deregister

## Archive Policy

Session files older than 20 sessions are moved to `sessions/archive/`.

## Historical Files (Frozen)

These files are preserved as historical snapshots but are NOT read at session start:
- `registry/STATUS_DASHBOARD.md` -- frozen at S142
- `registry/RECOMMENDATION_ENGINE.md` -- frozen at S131
- `session_log.md` -- frozen, contains S131-156 transitional entries
- `CONTINUATION_PROMPT.md` -- deprecated, replaced by per-session files

## Size Limits

| File | Max Size | Action if Exceeded |
|------|----------|-------------------|
| `sessions/INDEX.md` | 5KB | Trim recent sessions list |
| Per-session files | 10KB | Focus on key findings only |
| Topic files | 10KB | Split by sub-topic |
