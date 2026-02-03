# Topics Directory

Multi-session accumulated state for ongoing research topics. Each topic file tracks what works, what failed, and open paths across sessions.

## When to Create a Topic File

Create on the SECOND session working on a topic. One-session investigations don't need a topic file.

## Format

Each topic file should have:
- **What Works**: Proven results (with session references)
- **What Failed**: Dead ends (with lessons learned)
- **Open Paths**: Current research directions
- **Session List**: All sessions that touched this topic

## Conventions

- File names: `{topic_name}.md` (lowercase, underscores)
- Max size: **10KB** — split by sub-topic if exceeded
- Update at session end (see `.claude/rules/03-session-workflow.md`)

## Related

- `sessions/INDEX.md` — Points to active topics
- `sessions/S{N}.md` — Per-session detail
