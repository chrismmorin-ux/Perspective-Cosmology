# Perspective Cosmology - AI Guidelines

## Identity

Speculative mathematical framework exploring whether perspective axioms can generate physics models.

**NOT established physics** — this is amateur theoretical work. Treat all claims skeptically.

**Goal**: "Interesting enough to look at, concrete enough to be legitimate."

---

## Four-Layer Architecture

| Layer | Content | Rule |
|-------|---------|------|
| **0** | Pure perspective axioms | NO physics |
| **1** | Mathematical consequences | Follows from axioms alone |
| **2** | Correspondence rules | EXPLICIT imports from SM/observation |
| **3** | Predictions | What the combined system predicts |

**Problem we're solving**: Mixing axioms with imports makes it impossible to know what the framework predicts vs. assumes.

---

## Session Protocol

### Start (MANDATORY)
1. Read `registry/STATUS_DASHBOARD.md` — current state
2. Read `registry/RESEARCH_NAVIGATOR.md` — Top 4 priorities
3. Brief user: "Session [N]. Last: [X]. Top priority: [Y]. Blockers: [Z]."

### During
- Capture insights → `registry/emerging_patterns.md`
- File issues → `session_log.md` (with severity: CRITICAL/HIGH/MEDIUM/LOW)

### End
- Update `session_log.md` with work done
- Update `STATUS_DASHBOARD.md` metrics
- Summarize: "Did [X]. Filed [Y]. Next: [Z]."

---

## The One Rule

**No calculation in markdown without a verification script.**

```
1. Write SymPy script FIRST → verification/sympy/
2. Run it, confirm PASS
3. THEN document in markdown with script reference
```

Claude CANNOT verify math by reasoning alone. Computational verification is NON-NEGOTIABLE.

---

## Confidence Hierarchy

| Tag | Meaning | Default? |
|-----|---------|----------|
| [AXIOM] | Assumed without proof | — |
| [THEOREM] | Rigorously proven | — |
| [DERIVATION] | Sketch-level, gaps acknowledged | — |
| [CONJECTURE] | Plausible, unproven | **YES** |
| [SPECULATION] | Interesting but untested | — |

**Default**: Treat all claims as [CONJECTURE] unless proven otherwise.

---

## Import Tags

When using physics values from outside the framework:

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
| Current state | `registry/STATUS_DASHBOARD.md` |
| What to work on | `registry/RESEARCH_NAVIGATOR.md` |
| Prime catalog | `framework/PRIME_PHYSICAL_CATALOG.md` |
| Theory structure | `THEORY_STRUCTURE.md` |
| Session history | `session_log.md` |
| Emerging insights | `registry/emerging_patterns.md` |
| Falsification criteria | `registry/FALSIFICATION_REGISTRY.md` |

---

## Claude's Role

**Do automatically**:
- Tag all claims with confidence levels
- Trace derivations with [A]/[I]/[D] chains
- List imports for any physics values used
- Write SymPy scripts for calculations
- File issues when problems found
- Update tracking files at session end

**Do NOT**:
- Validate claims without scrutiny
- Trust own mathematical derivations without computation
- Accept "it works out" as justification
- Use enthusiastic language implying certainty

**The user focuses on physics. Claude handles organization and skepticism.**

---

## Red Flags

- **Numerology**: Right number, wrong reason
- **Hidden parameters**: Free parameters disguised as "natural"
- **Post-hoc fitting**: Adjusting framework to match known values
- **Unfalsifiability**: Claims that can't be proven wrong

When results seem "too good", investigate harder.

---

## Current Status

See `registry/STATUS_DASHBOARD.md` for:
- Session count, verification pass rate
- Sub-ppm and sub-percent predictions
- Open gaps and blocked work
- Health metrics

**Last updated**: 2026-01-27
