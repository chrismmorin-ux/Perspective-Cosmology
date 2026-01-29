# Perspective Cosmology - AI Guidelines

## Identity

Speculative mathematical framework exploring whether perspective axioms can generate physics models.

**NOT established physics** — this is amateur theoretical work. Treat all claims skeptically.

**Goal**: "Interesting enough to look at, concrete enough to be legitimate."

**See `publications/HONEST_ASSESSMENT.md`** for full evaluation. **See `claims/README.md`** for tiered claims.

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
2. Read `registry/RECOMMENDATION_ENGINE.md` — **PROJECT QUEUE** (what to work on)
3. Brief user: "Session [N]. Top priority: [X]. Queue has [Y] projects."

### During
- Capture insights → `registry/emerging_patterns.md`
- File issues → `session_log.md` (with severity: CRITICAL/HIGH/MEDIUM/LOW)
- **Challenge derivations**: Ask "what would make this wrong?" before accepting
- **Log caught hallucinations** → `registry/HALLUCINATION_LOG.md`
- **New project ideas** → Add to `RECOMMENDATION_ENGINE.md` Future Queue
- **For critical claims**: Use blind prediction protocol → `registry/HYPOTHESIS_TESTING_PROTOCOL.md`

### End
- Update `session_log.md` with work done
- Update `STATUS_DASHBOARD.md` metrics
- Update `RECOMMENDATION_ENGINE.md` — mark completed, add new projects
- Summarize: "Did [X]. Queue updated: [Y]."

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
| **PROJECT QUEUE** | **`registry/RECOMMENDATION_ENGINE.md`** |
| Research guide | `registry/RESEARCH_NAVIGATOR.md` |
| **Honest assessment** | **`publications/HONEST_ASSESSMENT.md`** |
| **Claims tiering** | **`claims/README.md`** |

### Red Team Infrastructure

| Need | File |
|------|------|
| **Blind predictions** | **`predictions/BLIND_PREDICTIONS.md`** |
| **Hypothesis testing** | **`registry/HYPOTHESIS_TESTING_PROTOCOL.md`** |
| Formula attempts | `registry/FORMULA_SEARCH_LOG.md` |
| Failed approaches | `registry/DEAD_ENDS.md` |
| Interpretations | `registry/INTERPRETATION_AUDIT.md` |
| Locked parameters | `registry/PARAMETER_FREEZE.md` |
| LLM collaboration | `registry/LLM_COLLABORATION_LOG.md` |
| Expert outreach | `registry/EXPERT_OUTREACH.md` |

### Standard Navigation

| Need | File |
|------|------|
| Prime catalog | `framework/PRIME_PHYSICAL_CATALOG.md` |
| Theory structure | `THEORY_STRUCTURE.md` |
| Session history | `session_log.md` |
| Emerging insights | `registry/emerging_patterns.md` |
| Falsification criteria | `registry/FALSIFICATION_REGISTRY.md` |
| Hallucination protection | `HALLUCINATION_PROTECTION.md` |
| Caught hallucinations | `registry/HALLUCINATION_LOG.md` |
| Session archive | `archive/sessions/` |
| Achievement history | `registry/ACHIEVEMENTS_LOG.md` |

### Specialized Agents

| Command | Purpose | Knowledge Base |
|---------|---------|----------------|
| `/prime-expert` | Advanced prime number theory perspective | `foundations/prime_theory/` |

### Knowledge Foundations

| Topic | Location |
|-------|----------|
| Prime theory | `foundations/prime_theory/` (8 files) |

---

## File Size Limits (LLM Compatibility)

LLMs have context limits. Keep operational files small enough to read in one pass.

| File Type | Max Size | Action if Exceeded |
|-----------|----------|-------------------|
| STATUS_DASHBOARD.md | 15KB | Move history → ACHIEVEMENTS_LOG.md |
| session_log.md | 200KB | Archive old sessions → archive/sessions/ |
| Investigation files | 30KB | Split by subtopic |
| Verification scripts | 20KB | Split by function |

### Session End Size Check

At session end, check sizes of key files:
```bash
wc -c session_log.md registry/STATUS_DASHBOARD.md
```

If approaching limits, archive older content before adding new.

### Archive Locations

| Content | Archive To |
|---------|-----------|
| Old sessions (90+) | `archive/sessions/sessions_*.md` |
| Dashboard history | `registry/ACHIEVEMENTS_LOG.md` |
| Deprecated investigations | `archive/deprecated/` |

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

**Session 120**: Red Team review complete, infrastructure overhauled

**Last updated**: 2026-01-28 (Session 120)

---

## Red Team Findings (Session 120)

A three-agent adversarial review identified these core issues:

### Surviving Criticisms (Must Address)

| Risk | Status | Mitigation |
|------|--------|------------|
| **Post-hoc interpretation** | ACKNOWLEDGED | `INTERPRETATION_AUDIT.md` |
| **Cannot distinguish derivation from discovery** | CORE ISSUE | LLM Derivation Challenge |
| **Formula structure unpredictable** | ACKNOWLEDGED | Need structure taxonomy |
| **Φ₆ cyclotomic not derived** | HIGH PRIORITY | Research task |
| **n_c = 11 derivation weak** | HIGH PRIORITY | Literature review |
| **Reproducibility not demonstrated** | IN PROGRESS | LLM challenge + expert outreach |

### Criticisms Resolved

| Criticism | Resolution |
|-----------|------------|
| "Zero parameters" false | `PARAMETER_FREEZE.md` — honest count is ~3 structural assumptions |
| No statistical denominator | `FORMULA_SEARCH_LOG.md` — flexibility test + search documentation |
| No genuine predictions | `BLIND_PREDICTIONS.md` — 5.11 GeV DM is genuine |
| Moving goalposts | `claims/FALSIFIED.md` — failed formulas documented |

### Probability Estimates (From Critics)

| Critic | Estimate | What Would Improve It |
|--------|----------|----------------------|
| Numerology | 15-30% | Blind prediction verified |
| Physics Rigor | "Promising" | One complete dynamics calculation |
| Methodology | 10-25% | LLM Derivation Challenge succeeds |

---

## New Infrastructure (Post-Red Team)

### Auditing & Transparency

| File | Purpose |
|------|---------|
| `predictions/BLIND_PREDICTIONS.md` | Predictions locked BEFORE measurement |
| `registry/FORMULA_SEARCH_LOG.md` | Document the denominator |
| `registry/DEAD_ENDS.md` | Failed approaches |
| `registry/INTERPRETATION_AUDIT.md` | All interpretations considered |
| `registry/PARAMETER_FREEZE.md` | Locked parameters |
| `registry/LLM_COLLABORATION_LOG.md` | Human-LLM attribution |

### Strategic Planning

| File | Purpose |
|------|---------|
| `registry/RECOMMENDATION_ENGINE.md` | Dynamic priority system |
| `registry/EXPERT_OUTREACH.md` | Expert contact templates |

---

## Session Protocol (Updated)

### Start (MANDATORY)
1. Read `registry/STATUS_DASHBOARD.md` — current state
2. Read `registry/RECOMMENDATION_ENGINE.md` — top priority
3. Brief user: "Session [N]. Top priority: [X]. Shall we work on this?"

### During
- **Log formula attempts** → `FORMULA_SEARCH_LOG.md`
- **Log interpretations** → `INTERPRETATION_AUDIT.md`
- **20% adversarial time** — challenge the framework
- Challenge derivations: Ask "what would make this wrong?"

### End
- Update `session_log.md` with work done
- Update `LLM_COLLABORATION_LOG.md` with attribution
- Summarize: "Did [X]. Priority status: [Y]. Next: [Z]."

---

## The Derivation vs Discovery Problem

**This is the core unresolved question.**

The Red Team's central finding: We cannot currently prove formulas were DERIVED rather than DISCOVERED (found by searching, then justified).

**Paths to resolution**:
1. **LLM Derivation Challenge** — Do other LLMs derive same numbers from axioms alone?
2. **Blind predictions** — Predict BEFORE knowing target values
3. **Expert review** — External validation of derivation logic
4. **Unique derivations** — Show only ONE interpretation works

**Current probability**: 15-30% that this is genuine physics (per Red Team)

Until this is resolved, maintain epistemic humility.
