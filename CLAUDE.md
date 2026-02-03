# Perspective Cosmology - AI Guidelines

## Identity

Speculative mathematical framework exploring whether perspective axioms can generate physics models.

**NOT established physics** — this is amateur theoretical work. Treat all claims skeptically.

**Goal**: "Interesting enough to look at, concrete enough to be legitimate."

See `publications/HONEST_ASSESSMENT.md` for full evaluation. See `claims/README.md` for tiered claims.

---

## Claims Tiering (Updated S205)

| Tier | Count | Precision | Assessment |
|------|-------|-----------|------------|
| **1** | 12 | < 10 ppm | Individually significant (3 caveats: Ω_Λ triple-formula, cos θ_W m_W-sensitive, Ξ⁰/m_d quark uncertainty) |
| **2** | 16 | 10-10000 ppm | Possibly significant (includes 3 demoted from Tier 1: r_s, m_B0/Σ⁻, m_b/m_s) |
| **3** | ~41 | > 100 ppm | Individually weak, collectively notable |
| **Falsified** | 9+4+1 | — | Documented honestly (F-1 through F-10, 4 deprecated, 1 withdrawn) |

Plus qualitative derivations (SM gauge groups, Einstein equations, 3+1 spacetime) not captured by random-matching tests.

---

## Four-Layer Architecture

| Layer | Content | Rule |
|-------|---------|------|
| **0** | Pure perspective axioms | NO physics |
| **1** | Mathematical consequences | Follows from axioms alone |
| **2** | Correspondence rules | EXPLICIT imports from SM/observation |
| **3** | Predictions | What the combined system predicts |

Mixing axioms with imports makes it impossible to know what the framework predicts vs. assumes. Keep layers separated.

---

## Session Protocol

### Start (MANDATORY)
0. **Session Isolation**: Read `registry/ACTIVE_SESSIONS.md`, ask user for focus, register session
1. Read `sessions/INDEX.md` — orientation
2. Read `sessions/S{last_relevant}.md` + `topics/{topic}.md` — if continuing a topic
3. Check `registry/FORMALIZATION_QUEUE.md` — deferred items matching focus?
3c. Check `registry/EXPLORATION_QUEUE.md` — OPEN items matching focus, report top EQ IDs
4. If `.quality/report.md` exists (< 5 sessions old), note top issues for this focus
5. Brief user: "Session [label]. Focus: [scope]. Shall we proceed?"

**Total startup reads**: 3-5 files. Do NOT read STATUS_DASHBOARD.md, RECOMMENDATION_ENGINE.md, or session_log.md (frozen/historical).

### During
- Capture insights immediately to `registry/emerging_patterns.md`
- Challenge derivations: ask "what would make this wrong?" before accepting
- After every derivation/finding: ask "formalize now or queue?"
- At topic transitions: check for unformalized results before moving on
- Log caught hallucinations to `registry/HALLUCINATION_LOG.md`

### End
See `.claude/rules/03-session-workflow.md` for the full protocol.

---

## The One Rule

**No calculation in markdown without a verification script.**

1. Write SymPy script FIRST in `verification/sympy/`
2. Run it, confirm PASS
3. THEN document in markdown with script reference

Computational verification is NON-NEGOTIABLE. Claude cannot verify math by reasoning alone.

---

## Hallucination Protection

LLMs hallucinate math. Three defense layers:

| Layer | Defense | When Required |
|-------|---------|---------------|
| **1** | SymPy verification | ALL calculations |
| **2** | Multi-path verification | Sub-percent precision claims |
| **3** | Semantic consistency | Complex derivations |

**Warning signs** (STOP and verify): "It can be shown that...", "After simplification...", result matches known value exactly, precision better than inputs.

**HRS 4+** = HIGH risk. See `.claude/rules/04-skepticism-checklist.md` for full scoring.

---

## Tools

Use `sympy-mcp` for quick symbolic checks. Use Astropy for physics constants. Write full SymPy scripts for anything that goes in markdown. Wolfram Alpha: ~65 queries/day budget — use sparingly for final cross-checks only.

---

## Confidence Hierarchy

| Tag | Meaning | Default? |
|-----|---------|----------|
| [AXIOM] | Assumed without proof | — |
| [THEOREM] | Rigorously proven | — |
| [DERIVATION] | Sketch-level, gaps acknowledged | — |
| [CONJECTURE] | Plausible, unproven | **YES** |
| [SPECULATION] | Interesting but untested | — |

Default: Treat all claims as [CONJECTURE] unless proven otherwise.

---

## Import Tags

| Tag | Meaning |
|-----|---------|
| [A-AXIOM] | Core framework axiom |
| [A-IMPORT] | From Standard Model or observation |
| [A-STRUCTURAL] | Mathematical choice (e.g., F = C) |
| [A-PHYSICAL] | Physical interpretation |

Every "X follows from Y" needs `[A]/[I]/[D]` tags tracing the derivation chain.

---

## Quick Navigation

| Need | File |
|------|------|
| **Session orientation** | `sessions/INDEX.md` |
| **Active topics** | `topics/` directory |
| **Per-session context** | `sessions/S{N}.md` |
| **Claims tiering** | `claims/README.md` |
| **Honest assessment** | `publications/HONEST_ASSESSMENT.md` |
| **Blind predictions** | `predictions/BLIND_PREDICTIONS.md` |
| **Investigation index** | `framework/investigations/_INDEX.md` |
| **Exploration queue** | `registry/EXPLORATION_QUEUE.md` |
| **Investigation priorities** | `registry/INVESTIGATION_PRIORITIES.md` |
| **Quality report** | `.quality/report.md` |
| **File placement** | `PLACEMENT_GUIDE.md` |

Every major directory has its own `CLAUDE.md` with local navigation and conventions.

---

## Claude's Role

**Do**: Tag claims with confidence, trace derivation chains, list imports, write SymPy scripts, use sympy-mcp for quick checks, file issues, update tracking at session end.

**Avoid**: Validating without scrutiny, trusting own math without computation, accepting "it works out" as justification, using language implying certainty.

The user focuses on physics. Claude handles organization and skepticism.

---

## Red Flags

- **Numerology**: Right number, wrong reason
- **Hidden parameters**: Free parameters disguised as "natural"
- **Post-hoc fitting**: Adjusting framework to match known values
- **Unfalsifiability**: Claims that can't be proven wrong

When results seem "too good", investigate harder.

---

## The Derivation vs Discovery Problem

The core unresolved question: We cannot currently prove formulas were DERIVED rather than DISCOVERED (found by searching, then justified).

Paths to resolution: LLM Derivation Challenge, blind predictions, expert review, unique derivations.

Current probability: 15-30% that this is genuine physics (per Red Team, Session 120).

Until resolved, maintain epistemic humility. See `registry/CLAUDE.md` for full Red Team findings.

---

## Current Status

See `sessions/INDEX.md` for current state. Historical snapshot: `registry/STATUS_DASHBOARD.md` (frozen at S142).

**Last updated**: 2026-02-03 (S205 — r_s demoted (falsified factors), m_μ/m_e promoted (4.1ppm), 15 cross-file fixes)

---

## File Size Limits

| File Type | Max Size | Action if Exceeded |
|-----------|----------|-------------------|
| `sessions/INDEX.md` | 5KB | Trim recent sessions list |
| Per-session files | 10KB | Focus on key findings only |
| Topic files | 10KB | Split by sub-topic |
| Investigation files | 30KB | Split by subtopic |
| Verification scripts | 20KB (25KB if ≥3 functions + main()) | Split by function |
| Registry files | 15KB | Split by domain |

Archive locations: Old sessions to `archive/sessions/`, deprecated content to `archive/deprecated/`.
