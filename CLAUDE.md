# Perspective Cosmology - AI Guidelines

## Identity

Speculative mathematical framework exploring whether perspective axioms can generate physics models.

**NOT established physics** — this is amateur theoretical work. Treat all claims skeptically.

**Goal**: "Interesting enough to look at, concrete enough to be legitimate."

**See `HONEST_ASSESSMENT.md`** for full evaluation. **See `claims/README.md`** for tiered claims.

---

## Claims Tiering (Session 106)

| Tier | Count | Precision | Assessment |
|------|-------|-----------|------------|
| **1** | 3 | < 10 ppm | Individually significant |
| **2** | ~5 | 10-100 ppm | Possibly significant |
| **3** | ~45 | > 100 ppm | Individually weak, collectively notable |

Plus qualitative derivations (SM gauge groups, Einstein equations, 3+1 spacetime) not captured by random-matching tests.

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
- **Challenge derivations**: Ask "what would make this wrong?" before accepting
- **Log caught hallucinations** → `registry/HALLUCINATION_LOG.md`

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

## Hallucination Protection

**LLMs hallucinate math.** Even correct-looking derivations may be wrong. See `HALLUCINATION_PROTECTION.md` for full protocol.

### Three Defense Layers

| Layer | Defense | When Required |
|-------|---------|---------------|
| **1** | SymPy verification | ALL calculations |
| **2** | Multi-path verification | Sub-percent precision claims |
| **3** | Semantic consistency | Complex derivations |

### Warning Signs (STOP and verify)

- "It can be shown that..." → DEMAND explicit steps
- "After simplification..." → SHOW the simplification
- Result matches known value exactly → CHECK for post-hoc fitting
- No failed attempts mentioned → ASK what was tried
- Precision better than inputs → PROPAGATE uncertainties

### Hallucination Risk Score (HRS)

| Risk Factor | Score |
|-------------|-------|
| Matches known value | +2 |
| "It can be shown" language | +2 |
| No intermediate steps | +3 |
| Seems "too good" | +2 |
| Multiple verifications | -2 |
| Clear derivation chain | -2 |
| Falsification stated | -1 |

**HRS 4+** = HIGH risk → require multi-path verification before accepting.

### Log Caught Hallucinations

When a hallucination is caught: document in `registry/HALLUCINATION_LOG.md`

---

## Available Tools

### MCP Servers (use directly)
| Server | Purpose | Usage |
|--------|---------|-------|
| **sympy-mcp** | Symbolic algebra, calculus, solving, simplification | **PRIMARY** — use for all symbolic verification |
| **wolfram-alpha** | Physics constants, cross-checks, complex queries | **CONSERVE** — 2,000 queries/month limit (~65/day) |
| **mermaid** | Diagram generation | As needed |
| **playwright** | Browser automation | Rarely needed |

### Python Packages (via verification scripts)
| Package | Purpose |
|---------|---------|
| **SymPy** | Symbolic math — equations, calculus, algebra |
| **SciPy/NumPy** | Numerical computing, linear algebra |
| **mpmath** | Arbitrary precision arithmetic |
| **EinsteinPy** | General relativity — metrics, geodesics, tensors |
| **galgebra** | Geometric/Clifford algebra |
| **Astropy** | Physical constants with units |
| **matplotlib** | Plotting and visualization |

### Tool Selection Rules

1. **For symbolic verification**: Use `sympy-mcp` or write SymPy script
2. **For physics constants**: Use Astropy first (free, local), Wolfram Alpha only if needed
3. **For GR calculations**: Use EinsteinPy via script
4. **For cross-checking results**: Wolfram Alpha (but count toward daily budget)

**WOLFRAM ALPHA BUDGET**: ~65 queries/day max. Prefer local tools. Use Wolfram for:
- Verifying final results (not intermediate steps)
- Looking up obscure constants not in Astropy
- Complex integrations that SymPy struggles with

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
| **Honest assessment** | **`HONEST_ASSESSMENT.md`** |
| **Claims tiering** | **`claims/README.md`** |
| Prime catalog | `framework/PRIME_PHYSICAL_CATALOG.md` |
| Theory structure | `THEORY_STRUCTURE.md` |
| Session history | `session_log.md` |
| Emerging insights | `registry/emerging_patterns.md` |
| Falsification criteria | `registry/FALSIFICATION_REGISTRY.md` |
| Hallucination protection | `HALLUCINATION_PROTECTION.md` |
| Caught hallucinations | `registry/HALLUCINATION_LOG.md` |

---

## Claude's Role

**Do automatically**:
- Tag all claims with confidence levels
- Trace derivations with [A]/[I]/[D] chains
- List imports for any physics values used
- Write SymPy scripts for calculations
- **Use sympy-mcp for quick symbolic checks** (don't need full script for simple verifications)
- **Use Wolfram Alpha sparingly** — only for final cross-checks or missing constants
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

**Session 106**: Documentation restructure — claims tiering, balanced framing

**Last updated**: 2026-01-27 (Session 106)
