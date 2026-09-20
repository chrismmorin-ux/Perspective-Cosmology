# Decision Log

Architectural and project decisions recorded for future reference. Use `/decide` to add new entries. Do not re-litigate settled decisions without new information.

---

## Decisions

<!-- Decisions are added via /decide and follow this format:

### DEC-NNN: [Title]
**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded | Deprecated
**Context:** [What prompted this decision]
**Options Considered:**
1. [Option A] — [pros/cons]
2. [Option B] — [pros/cons]
**Decision:** [What we decided]
**Reasoning:** [Why this option]
**Consequences:**
- [Trade-off or follow-up 1]
- [Trade-off or follow-up 2]

-->

### DEC-001: Adopt CWOS
**Date:** YYYY-MM-DD
**Status:** Accepted
**Context:** Project needs structured workstream management, self-verification, and autonomous improvement capabilities.
**Decision:** Adopt the Claude Workstream Operating System for standardized process management.
**Reasoning:** Provides consistent commands, engine-based analysis, self-verification loops, and cross-repo visibility.
**Consequences:**
- Added `.claude/workstream/` directory structure
- Added `system/` directory for state tracking
- Standard commands available via CWOS preamble in CLAUDE.md
