# Perspective Cosmology - AI Guidelines

## Identity

Speculative mathematical framework exploring whether perspective axioms can generate physics models.

**NOT established physics** — this is amateur theoretical work. Treat all claims skeptically.

**Goal**: "Interesting enough to look at, concrete enough to be legitimate."

Current probability: 25-40% genuine physics (Red Team v3.0, S330). IRA: 4. See `publications/HONEST_ASSESSMENT.md`.

---

## Session Protocol

### Start (MANDATORY)
1. **Read `registry/ACTIVE_SESSIONS.md`** — check parallels, clean stale, register
2. **Read `sessions/INDEX.md`** — active topics, backlog, status snapshot
3. **Read previous session file OR topic file** (one, not both, unless both < 5KB)
4. Brief user: "Session [label]. Focus: [scope]. Shall we proceed?"

**Do NOT read at startup**: `.quality/report.md`, `EXPLORATION_QUEUE.md`, `FORMALIZATION_QUEUE.md` (read on-demand). INDEX.md has summaries.

### During
- Challenge derivations: ask "what would make this wrong?"
- After every derivation/finding: ask "formalize now or queue?"
- At topic transitions: check for unformalized results before moving on
- **Context preservation**: Before reading any file >10KB, use line ranges or delegate to a subagent

### End
See `.claude/rules/03-session-workflow.md` for the full protocol.

---

## The One Rule

**No calculation in markdown without a verification script.**

1. Write SymPy script FIRST in `verification/sympy/`
2. Run it, confirm PASS
3. THEN document in markdown with script reference

---

## Four-Layer Architecture

| Layer | Content | Rule |
|-------|---------|------|
| **0** | Pure perspective axioms | NO physics |
| **1** | Mathematical consequences | Follows from axioms alone |
| **2** | Correspondence rules | EXPLICIT imports from SM/observation |
| **3** | Predictions | What the combined system predicts |

---

## Confidence & Import Tags

**Confidence**: [AXIOM] | [THEOREM] | [DERIVATION] | [CONJECTURE] (default) | [SPECULATION]

**Imports**: [A-AXIOM] | [A-IMPORT] | [A-STRUCTURAL] | [A-PHYSICAL] | [A-TECHNICAL]

Every "X follows from Y" needs `[A]/[I]/[D]` tags. HRS >= 4 requires multi-path verification.

---

## Context Window Management

- **Startup reads**: 3 files only (~10-15KB total). Do NOT read STATUS_DASHBOARD.md, RECOMMENDATION_ENGINE.md, session_log.md
- **Heavy reads**: Use Explore/research subagents for investigation files (30-60KB). Don't load into main context
- **Session end**: Use parallel subagents for bookkeeping when possible
- **File writes over inline**: When producing long content, write to files instead of inline text
- **ACTIVE_SESSIONS.md**: Keep only last 5 in Recently Completed. Archive older entries
- **INDEX.md**: Recent Sessions is a compact 10-item list, not a detailed table

---

## Tools

Use `sympy-mcp` for quick symbolic checks. Write full SymPy scripts for anything that goes in markdown. Wolfram Alpha: ~65 queries/day budget.

---

## Quick Navigation

| Need | File |
|------|------|
| **Session orientation** | `sessions/INDEX.md` |
| **Active topics** | `topics/` directory |
| **Per-session context** | `sessions/S{N}.md` |
| **Claims tiering** | `claims/README.md` |
| **Honest assessment** | `publications/HONEST_ASSESSMENT.md` |
| **Investigation index** | `framework/investigations/_INDEX.md` |
| **Exploration queue** | `registry/EXPLORATION_QUEUE.md` |
| **Quality report** | `.quality/report.md` |
| **Full templates** | `docs/derivation-templates-full.md` |
| **Full session protocol** | `docs/session-protocol-full.md` |

---

## Claude's Role

**Do**: Tag claims with confidence, trace derivation chains, list imports, write SymPy scripts, file issues, update tracking at session end.

**Avoid**: Validating without scrutiny, trusting own math without computation, accepting "it works out", implying certainty.

---

## Red Flags

- **Numerology**: Right number, wrong reason
- **Hidden parameters**: Free parameters disguised as "natural"
- **Post-hoc fitting**: Adjusting framework to match known values
- **Unfalsifiability**: Claims that can't be proven wrong

The Derivation vs Discovery Problem remains unresolved. See `registry/CLAUDE.md` for Red Team findings.

---

## File Size Limits

| File Type | Max Size | Action if Exceeded |
|-----------|----------|-------------------|
| `sessions/INDEX.md` | 5KB | Trim recent sessions list |
| Per-session files | 10KB | Focus on key findings only |
| Topic files | 10KB | Split by sub-topic |
| Investigation files | 30KB | Split by subtopic |
| Verification scripts | 30KB soft limit | Split only if >35KB |
| Registry files | 15KB | Split by domain |
| `ACTIVE_SESSIONS.md` | 3KB | Keep last 5 completed only |

Archive: `archive/sessions/`, `archive/deprecated/`
