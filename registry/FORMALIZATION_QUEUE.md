# Formalization Queue

**Purpose**: Track work products that need their own file or formal update but were deferred to maintain session flow.
**Rule**: Every entry must include a reasoning sketch — enough to reconstruct the argument without the original conversation.

---

## How to Use

**During a session**: When a derivation, finding, or insight is produced but formalizing it now would interrupt flow, add an entry here instead.

**At session end**: Triage every entry:
- **Formalize now** — Write the file/update before closing the session
- **Defer** — Leave in queue with a target session or priority note
- **Discard** — Remove if superseded or not worth formalizing

**At session start**: Check this file. If deferred items match the session's focus, formalize them first.

---

## Entry Format

```markdown
### [Short title]

**Added**: Session [N], YYYY-MM-DD
**Type**: derivation | finding | correction | new-file | update-existing
**Target**: [file to create or update]
**Priority**: HIGH | MEDIUM | LOW

**What**: [1 sentence — the result]

**Why/How** (reasoning sketch):
[2-5 sentences. Enough to reconstruct the argument. Include: key assumptions,
the critical step, and what makes this non-obvious. A future session with NO
access to this conversation should be able to formalize this from the sketch alone.]

**Status**: PENDING | DEFERRED (session [M]) | DONE | DISCARDED
```

---

## Active Queue

*Empty — no pending items.*

---

## Completed / Discarded

### F = C audit: restructure 17 so F = C is from time only — DONE (2026-01-30)
Restructured `core/17_complex_structure.md`: Part I is sole justification for F = C; §2.4 and Thm 17.3 now state "given F = C, generator count = 137" and point to alpha chain Step 5 for 1/α identification.

*Items move here after triage. Keep the last 10 for reference, then delete.*
