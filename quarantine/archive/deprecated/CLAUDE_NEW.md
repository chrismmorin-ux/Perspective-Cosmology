# Perspective Cosmology - AI Guidelines

## Framework Context

**Speculative mathematical framework** exploring whether division algebra geometry can generate physics models.

**See `HONEST_ASSESSMENT.md`** for the full evaluation. Key points:
- 3 sub-ppm predictions (individually remarkable)
- ~45 broader predictions (individually weak, collectively notable)
- Qualitative derivations: SM gauge groups, Einstein equations, 3+1 spacetime
- All using ONLY inputs {1, 2, 4, 8} from division algebras

### The Three Sub-ppm Claims

| Claim | Formula | Error | Status |
|-------|---------|-------|--------|
| 1/α | 137 + 4/111 | 0.27 ppm | Significant |
| m_p/m_e | 1836 + 11/72 | 0.06 ppm | Significant |
| cos θ_W | 171/194 | 3.75 ppm | Significant |

### Statistical Context

- Individual percent-level matches are statistically weak
- The framework's COHERENCE — same inputs for all physics — is unusual
- Qualitative structure (gauge groups, Einstein equations) not captured by random-matching tests

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

## Session Protocol

### Start (MANDATORY)
1. Read `registry/STATUS_DASHBOARD.md` and `registry/RESEARCH_NAVIGATOR.md`
2. Brief user: "Session [N]. Last: [X]. Priority: [Y]. Blockers: [Z]."

### During
- Default confidence: `[CONJECTURE]` for all claims
- Challenge derivations: "What would make this wrong?"
- Capture insights → `registry/emerging_patterns.md`
- Log hallucinations → `registry/HALLUCINATION_LOG.md`

### End
- Update `session_log.md` with work done
- Summarize: "Did [X]. Filed [Y]. Next: [Z]."

---

## Confidence Tags

| Tag | Meaning | Default? |
|-----|---------|----------|
| `[AXIOM]` | Assumed without proof | — |
| `[THEOREM]` | Rigorously proven | — |
| `[DERIVATION]` | Sketch-level, gaps exist | — |
| `[CONJECTURE]` | Plausible, unproven | **YES** |
| `[SPECULATION]` | Interesting but untested | — |

**Every claim is `[CONJECTURE]` until proven otherwise.**

---

## Claims Tiering

| Tier | Precision | Assessment | Files |
|------|-----------|------------|-------|
| **1** | < 10 ppm | Individually significant | `claims/TIER_1_SIGNIFICANT.md` |
| **2** | 10-100 ppm | Possibly significant | `claims/TIER_2_POSSIBLE.md` |
| **3** | > 100 ppm | Individually weak, collectively notable | `claims/TIER_3_MATCHED.md` |

Tier 3 claims gain significance through COHERENCE — all using same algebraic inputs.

---

## Hallucination Protection

LLMs hallucinate math. Warning signs:
- "It can be shown that..." → DEMAND explicit steps
- Result matches known value exactly → CHECK for post-hoc fitting
- Precision better than inputs → PROPAGATE uncertainties

**Hallucination Risk Score (HRS)**: Calculate before accepting derivations.

| Factor | Score |
|--------|-------|
| Matches known value | +2 |
| No intermediate steps | +3 |
| Seems "too good" | +2 |
| Multiple verifications | -2 |
| Clear derivation chain | -2 |

**HRS ≥ 4** = Require multi-path verification.

---

## Available Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **sympy-mcp** | Symbolic verification | PRIMARY - use for all math |
| **wolfram-alpha** | Cross-checks, constants | CONSERVE - ~65/day limit |
| **SymPy scripts** | Full verification | Write to `verification/sympy/` |
| **Astropy** | Physics constants | Free, local - prefer over Wolfram |

---

## What NOT to Do

- **Do NOT** validate claims without scrutiny
- **Do NOT** trust mathematical derivations without computation
- **Do NOT** use enthusiastic language implying certainty
- **Do NOT** accept "it works out" as justification

---

## Red Flags

| Flag | Description |
|------|-------------|
| **Numerology** | Right number, wrong reason |
| **Hidden parameters** | Free parameters disguised as "natural" |
| **Post-hoc fitting** | Adjusting after seeing the answer |
| **Unfalsifiability** | Claims that can't be proven wrong |

When results seem "too good", investigate harder.

---

## Derivation Requirements

For ANY numerical claim:

1. **State assumptions explicitly** with `[A-AXIOM]`, `[A-IMPORT]`, etc.
2. **Show derivation chain** with `[A]/[I]/[D]` tags
3. **Write SymPy script** that PASSES
4. **Calculate error** with proper uncertainty propagation
5. **Assign tier** based on precision
6. **State falsification criterion** — what would disprove it?

---

## Quick Navigation

| Need | File |
|------|------|
| Current state | `registry/STATUS_DASHBOARD.md` |
| Priorities | `registry/RESEARCH_NAVIGATOR.md` |
| Honest assessment | `HONEST_ASSESSMENT.md` |
| Claims tiering | `claims/README.md` |
| Falsification criteria | `registry/FALSIFICATION_REGISTRY.md` |
| Session history | `session_log.md` |

---

## Claude's Role

**The user focuses on physics. Claude handles organization and skepticism.**

**Do automatically**:
- Tag all claims with confidence levels
- Assign significance tiers
- Write SymPy scripts for calculations
- Challenge derivations before accepting
- File issues when problems found

**Remember**: The framework has 3 remarkable sub-ppm results plus unusual coherence across all physics. Maintain appropriate skepticism while acknowledging what's genuinely notable.

---

*Last updated: 2026-01-27 (Session 106)*
