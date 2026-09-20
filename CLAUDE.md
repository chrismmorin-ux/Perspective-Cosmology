# CWOS Session Protocol

**You can ALWAYS just describe what you want in plain English.** Commands below are optional shortcuts — if you say "fix that bug" or "make the homepage faster", Claude does it.

## Adaptive Session Protocol

Claude matches ceremony to task weight automatically.

### Quick Fix Mode
**When:** Bug, error, small change. Trigger: "fix", "broken", "error", "customer says", single-file scope.
- Read ONLY: `CLAUDE.md` + `system/state.md` (vital signs)
- If fix touches a program's `scope_paths` — mention it. If `failures.md` has a related pattern — mention it.
- No session file. No verification unless financial/security code.
- After: one line in Recent Sessions (`quick-fix` tag). Append Heavy/Medium implicit decisions to `decisions.md`. Update `usage.yaml` counters silently.

### Standard Mode (default)
**When:** Feature work, "what's next", multi-file changes. **Default when intent unclear.**
- **Fast orient:** Read `system-summary.yaml` first (if exists). Escalate to full reads only if vitals failing, programs stale, or critical findings.
- **Sprint check:** Read `sprint-index.yaml` — lead with active sprint progress if one exists.
- **Fallback:** Read `system/state.md` + `context.md` + top 3 unclaimed from `queue-index.yaml` + stale programs.
- Skip `invariants.md`, `decisions.md`, `failures.md` at start (read on-demand).
- Note project phase from `state.md` — affects priority scoring.
- **Program alert:** If any program is RED or has stale findings, one-line alert.
- Track work items. Run `/verify` before done. Update `state.md` after. Append implicit decisions. Update `usage.yaml` silently.

### Strategic Mode
**When:** User runs `/plan`, `/engine`, `/audit`, says "full session", or invokes `/session-start full`. (Bare `/session-start` is adaptive — lean by default, full when state signals escalation.)
- Full ceremony: all system files, programs, recommendations, previous handoff. Session YAML. Full verification + state update + GC.

### Mode Rules
- **Default:** Standard. **Override:** "quick fix" or "full session" forces mode.
- **Escalation:** Quick Fix touching 3+ files or multiple programs → suggest Standard.
- **No de-escalation.** Strategic stays Strategic. **Maturity:** Orient less as project matures — targeted intelligence, not comprehensive surveys.

## Engine Selection (Proactive Suggestions)

Claude should **proactively suggest the right engine** for the situation rather than waiting for the user to guess. Before executing a non-trivial task, check whether an engine fits better than ad-hoc analysis.

### Situation → Engine Map

| User Signal | Suggest Engine | Config |
|-------------|---------------|--------|
| "Is this ready to ship?" / pre-launch anxiety | `eng-engine` | 6-persona, focus=full |
| "Review this module / PR / feature" | `eng-engine` | 6-persona, focus=<area> |
| "I want to refactor X" | `refactor-prep` | default |
| "I need to upgrade dep X" | `upgrade-prep` | default |
| "I'm planning a schema change" | `migration-prep` | default |
| "Should I do A or B?" | `decide` → `decision-enhance` | default |
| "Is my plan any good?" | `plan-enhance` | default |
| "Something is broken in prod" | `incident-response` | default |
| "Something feels off but I can't name it" | `eng-engine` | budget trio, focus=full |
| "Financial logic concerns" | `financial-audit` | default |
| "UX doesn't feel right" | `ux-audit` | default |
| "Legal/compliance question" | `legal-safety` | default |
| "Tests are weak" | `eng-engine` | focus="testing" |
| "Priorities are unclear" | `traction` | default |
| "What's the strategic play?" | `business-engine` | default |

### After-action Engine Chains

When one engine completes, proactively suggest the next step if findings warrant.
After `eng-engine`: `traction` on any HIGH/CRITICAL (re-score backlog),
`financial-audit` if findings touched money code, `ux-audit` if product-ux
flagged 3+ issues, `context-curator` if findings feel generic. After
`refactor-prep` or `upgrade-prep`: `eng-engine` on the area, then `/verify`
before merge. Any engine that surfaces an architectural question → `/decide`.

Frame suggestions as business outcomes, not engine names: "Your API has critical security issues. Want a deeper attack chain analysis?" — not "Run security-deep-dive."

**Do NOT suggest an engine** for narrow lookups, single-line fixes, or when the user already specified exact scope.

**Engine intent pre-flight.** `/engine <id>` resolves its contract before tokens burn. If the founder signals impatience ("just go", "skip the framing") or already locked mode + target + scope in the previous turn, surface the escape valve: "Use `/engine <id> --just-run` to skip pre-flight." Never default to `--just-run` — the contract earns its keep when framing is ambiguous.

## Sprint Protocol
Work is organized into **sprints** — small batches (3-8 items) with a clear goal, approved once.
1. **Compose:** `/next` selects items from queue, groups by program/dependencies, classifies as "Just do it" or "Design first"
2. **Approve:** User reviews goal + items + decisions needed, approves once
3. **Execute:** "Just do it" = autonomous, brief note, no pause. "Design first" = plan mode, user decisions, then execute.
4. **Complete:** Run `/next` for next sprint
- One active sprint at a time. `/next` resumes before proposing new. Mid-session end preserves sprint. User can skip items or cancel.

## Progressive Onboarding & Deferred Installation
If `.cwos-onboarding.yaml` exists and M5 not complete:
- Read silently. Suggest ONE natural improvement per session ("Want me to..." not "You need to..."). Never advance 2+ milestones per session. Never show milestone names or YAML to user.

If user invokes an uninstalled command:
- Check `deferred_commands` manifest. If the command's capability is enabled (or intended) in `.cwos-onboarding.yaml`: install the group silently + dependencies, then run. If the capability is not enabled: explain what's missing and suggest enabling it via `/discover`.

### First Session
If `.cwos-version` exists and `usage.yaml` shows `welcome_completed` false → run `/welcome` first.

## Graceful Degradation

Commands must work at any milestone. When encountering missing state:

| Severity | Action | Examples |
|----------|--------|----------|
| **BLOCKING** | Auto-scaffold silently, proceed | No `queue-index.yaml` → create structure. No `engines/registry.yaml` → install from HomeBase. |
| **DEGRADED** | Use defaults, mention once | No `invariants.md` → skip checks. No `context.md` → no boosts. |
| **OPTIONAL** | Skip silently | No custom personas → default analysis. No `usage.yaml` → skip telemetry. |

- Never show YAML paths or milestone names to user. Never say "you need to reach M3 first."
- When auto-scaffolding: prefer minimal creation. Capture the friction (below). Read HomeBase path from `.cwos-version.homebase_path`.

## Friction & Feedback

Record it **when it happens**, not at session end — that arrives about 12% of the
time, which is why the friction log stayed empty.

```bash
node kit/scripts/cwos-capture.js friction "<what fought back>" --severity high|medium|low --component <name>
node kit/scripts/cwos-capture.js feedback "<what the founder said>" --category objection|preference|concern|integration|feature_request
```

- A command failed or needed a workaround: fix it, keep working, capture it. `--component` is optional — every field demanded at capture time is a reason not to capture.
- Founder frustration or a preference about CWOS: capture as feedback, acknowledge briefly, don't argue.
- Capture **cannot block you** — it exits 0 on every path, including when the write fails. So if it prints `NOT captured`, that message is your only signal; surface it rather than assuming it landed.
- Do **not** hand-edit `.cwos-feedback.yaml` — it is a generated view of the event log and is overwritten on the next regeneration.
- Platform (from `.cwos-onboarding.yaml`): on Windows, prefer Python for datetime, avoid `set -euo pipefail` in hooks, avoid `$$` for PID.

## Standard Commands

| Command | Purpose |
|---------|---------|
| `/status` | Health dashboard — vital signs, queue, programs |
| `/next` | Compose or resume a sprint — batched, prioritized work |
| `/plan` | Multi-persona deliberation to plan next work bundle |
| `/engine <name>` | Run a named analysis engine |
| `/build-engine` | Create a new analysis engine |
| `/audit` | System self-audit — drift, staleness, invariant violations |
| `/verify` | Self-verification — build, test, visual, behavioral checks |
| `/session-start` | Begin session with full orientation |
| `/session-end` | End session cleanly with state update |
| `/decide` | Record an architectural decision |
| `/pulse` | Program dashboard — project areas needing attention |
| `/workstream` | Queue management (14 subcommands) |
| `/autopilot` | Schedule hours of autonomous work |

## Command Routing — Use the Envelope

When you need information that a CWOS command produces, **invoke the command**. Do not bypass to underlying scripts or YAML files when a command exists for the same operation.

| Need | Use this | Don't |
|------|----------|-------|
| Program health / status | `/pulse` or `/status` | grep `prog-*.yaml` |
| Sprint composition | `/next` | hand-rank `queue/WS-*.yaml` |
| Drift / staleness check | `/audit drift` | run `cwos-reconcile.js` directly |
| Verify before merge | `/verify` | run individual INV scripts |
| Record a decision | `/decide` | hand-edit `decisions.md` |
| Workstream changes | `/workstream done|defer|claim|...` | hand-edit queue YAMLs |

**Exceptions** — read freely:
- `cwos-state-store.js <domain> <op>` — the typed-API path commands themselves use.
- `cwos-event.js append ...` — event emission is mandatory at command boundaries.
- One-off file reads when no command exists for the operation. (If you find yourself doing this regularly, that's a gap — flag it rather than normalizing the bypass.)

INV-cli-bypass-via-command monitors compliance from envelope telemetry; sustained bypass routes a finding to `prog-self-compliance`.

## Catch-state suggestions (ADR-040 / WS-299)

Conditional — this hook is configured in HomeBase only until kit content ships as
a plugin (ADR-064 Stage 1). If the line below never appears in your context,
nothing is wrong and there is nothing to wait for.

> `Catch-state: consider /engine X on Y (R1,R3) conf=0.78. Founder may dismiss silently.`

When you see it, surface it to the founder in the routing form ("Consider
`/engine X on Y` — `<one-clause reason>`"). Do not insist; the founder may
dismiss silently or invoke a different engine.

## Path Resolution
Read `system_dir` from `.cwos-config.yaml` (default: `system`). Substitute in all `system/` file references. Example: `system_dir: .cwos` → `system/state.md` becomes `.cwos/state.md`.

## System State Files

| File | Location | Purpose |
|------|----------|---------|
| State | `system/state.md` | Vital signs, metrics, queue summary, sessions |
| Invariants | `system/invariants.md` | Rules that must always hold, with check commands |
| Constraints | `system/constraints.md` | Assumptions and boundaries, with verification dates |
| Decisions | `system/decisions.md` | ADR-style decision log |
| Failures | `system/failures.md` | Known failure modes — root cause, fix, prevention |
| Context | `system/context.md` | Active business context — issues, deadlines, opportunities |

The configured `system_dir` is the ONLY valid location. Legacy copies elsewhere are stale — flag via `/audit`.

## Communication Style
Non-technical founder. Lead with business impact, not technical details. Present 2 options max with clear recommendation. Label items "Business Priority" or "Technical Maintenance". Explain jargon on first use.

## Self-Verification
- After code changes: run vital sign checks (tests, lint, build)
- After UI changes: screenshots via Playwright
- Before commit: run preflight on diff
- Session end: full verification pass

## Decision Detection Protocol

During ALL work, watch for **implicit decisions** — choices made during implementation that shape product behavior but weren't explicitly recorded.

### Decision Signals
Flag a choice when it matches any pattern:

| Signal | Example |
|--------|---------|
| Behavioral choice | "Form auto-saves every 30s" |
| Business rule | "Free users get 3 projects" |
| Error/edge handling | "Retry button on timeout, not error page" |
| Data model choice | "Store allocations as percentages" |
| Integration pattern | "Webhook retries 3x with backoff" |
| Security/access | "Admins can delete but not purge" |
| UX pattern | "Tabs, not sidebar" |
| Omission | "No email confirmation for this flow" |
| Trade-off | "Speed over completeness for search" |

**Not decisions:** Routine code choices, following established patterns, implementing unambiguous specs, framework conventions.

### Detection Rules
- Flag inline: `**Decision noted:** [summary]` — don't stop working.
- **Then capture it, in the same breath.** One command, no ceremony:
  ```bash
  node kit/scripts/cwos-capture.js decision "<summary>" --weight heavy|medium|light --why "<reasoning>"
  ```
- If significant trade-offs: escalate with `**Decision with trade-offs:** [summary]. This means [consequence].` and capture with `--weight heavy`.
- If multiple valid approaches and user hasn't specified: state choice + reasoning before implementing.

Capture now, not at session end: an event survives a session that dies, an
intention to write one later does not. `--weight` decides destination (heavy /
medium → `system/decisions.md` when the buffer drains; light stays queryable in
the event log). Draining is automatic via `cwos-reconcile`; `cwos-capture
pending` shows what has not been formalized.

**A mistake** is the sibling of friction (below): not a tool fighting you, but a
call that was wrong.

```bash
node kit/scripts/cwos-mistake.js "<one line>" --enforcement hook|gate|contextual|prose [--class RC1-deferred|…] [--repeat]
```

`--enforcement` is required: it is the only field that decides whether the lesson
ever works. Reach for `hook` or `gate` first and ask what boundary could hold this
mechanically. **Prose is the tier of last resort** — paid every session, and the
tier that measurably fails. `cwos-mistake tiers` explains the ladder; `review`
names recurring prose lessons as promotion candidates.

## Proactive Automation
These rules run automatically, every session, without prompting.
- **After modifying code:** Run vital sign checks. If touching a program's `scope_paths`, mention it.
- **Before marking item done:** Run `/verify`.
- **Domain rules:** Always read `.claude/rules/` — they're mandatory and override general patterns.
- **Self-healing:** Stale program → auto-generate maintenance item. Failed vital sign → flag + suggest fix. Invariant check commands → run periodically. Kit version behind HomeBase → mention during `/status`.

## Autonomous Work Cycle
When working autonomously: active sprint → resume | no sprint → `/next` → approve | queue empty → `/audit` → compose | still empty → `/plan` | still empty → drift-detector questions.
**Always stop and ask user for:** sprint approval, design decisions, critical findings, invariant changes.

---
<!-- CWOS Preamble End — Project-specific content below -->

<!-- CWOS Preamble End -->
<!-- Override: project-specific sections below take precedence over preamble defaults -->


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
