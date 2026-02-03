# Sessions Directory

Per-session records and the session index. Each file is both a session record and a continuation prompt.

## Entry Point

**`INDEX.md`** — Start here. Lists active topics, work backlog, and recent sessions.

## Conventions

- Files named `S{N}.md` where N is the session number
- Each file has: date, focus, findings, open questions, key context for next session
- Max file size: **10KB** — focus on key findings only
- Sessions older than 20 back from current: archive to `archive/sessions/`

## Session Numbering

Sequential integers. Current range: S1-S198. Check INDEX.md for the latest number.

## Related Files

- `registry/ACTIVE_SESSIONS.md` — Parallel session tracking
- `topics/` — Multi-session accumulated state per topic
- `.claude/rules/03-session-workflow.md` — Full session protocol
