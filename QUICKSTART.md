# Quick Start Guide

Quick reference for continuing work on Perspective Cosmology.

---

## Current Status (2026-01-26)

| Area | Status | Blocking Issue |
|------|--------|----------------|
| Core math | OK | - |
| α derivation | SPECULATION | I-006 (accepted) |
| QM limit | CONJECTURE | Gaps documented |
| GR limit | WEAK | I-007 |
| Intermediate-γ (γ ≤ 0.5) | SPECULATION | I-004 (Γ_dec not derived) |
| Intermediate-γ (γ > 0.5) | **UNDEFINED** | Recoherence retracted (I-001 resolved) |

**Next Priority**: I-007 (GR limit derivation) or I-004 (derive Γ_dec from axioms)

---

## Session Continuation Prompt

Copy this to start a new session:

```
I'm working on Perspective Cosmology in this directory.

Read: session_log.md, issues_log.md, QUICKSTART.md

**Last session (2026-01-26-1)**:
- Resolved I-001 (CRITICAL recoherence paradox) by retracting the claim
- Formula Γ_dec = (1-2γ)/τ₀ now valid only for γ ≤ 0.5
- γ > 0.5 regime marked as OPEN PROBLEM requiring derivation

**Current priority**: Choose next issue to address:
1. I-007: GR limit derivation (construct g_μν from Γ)
2. I-004: Derive Γ_dec formula from axioms
3. I-002/I-003: Fix R calculation errors (minor cleanup)

Follow CLAUDE.md guidelines. Be skeptical.
```

---

## Files to Read Each Session

| Order | File | Purpose |
|-------|------|---------|
| 1 | `session_log.md` | What was done, decisions, next steps |
| 2 | `issues_log.md` | Active issues (check CRITICAL first) |
| 3 | `peer_review_prep.md` | Current objections status |
| 4 | `ARCHITECTURE.md` | Full structure reference |

---

## The Problem

Amateur theoretical physics usually fails because of:
1. **Numerology** - Getting right numbers for wrong reasons
2. **Confirmation bias** - Remembering successes, forgetting failures
3. **Hidden parameters** - Free choices disguised as derivations
4. **Sycophancy** - AI assistants validating instead of critiquing
5. **Overconfidence** - Treating conjectures as theorems

This system is designed to prevent these failures.

---

## File Map

```
## Session Management (READ FIRST)
session_log.md            ← Work history, decisions, next steps
issues_log.md             ← Active issues tracking
QUICKSTART.md             ← You are here

## Guidelines
CLAUDE.md                 ← AI behavior rules
ARCHITECTURE.md           ← Full directory structure

## Core Content
core/                     ← Pure mathematics (17 modules)
physics/                  ← Physical interpretations

## Analysis Files (recent)
physics/intermediate_gamma_analysis.md ← Critical γ analysis
physics/limits_analysis.md             ← QM/GR gap analysis
physics/predictions_analysis.md        ← Are predictions genuine?

## Reference Documents
assumptions_registry.md   ← Every assumption (A1-A14)
derivations_summary.md    ← Derivations with confidence
falsification_criteria.md ← What would prove us wrong
peer_review_prep.md       ← Anticipated objections

## Legacy
mathematical_framework.md ← Main content [LEGACY - extracted to core/]

## References
references/
  ├── failed_alpha_derivations.md
  └── literature_notes/
```

---

## Confidence Levels

**Always assign one of these to every claim:**

| Level | Symbol | Meaning |
|-------|--------|---------|
| **AXIOM** | A | Assumed without proof |
| **THEOREM** | T | Rigorously derived from axioms |
| **DERIVATION** | D | Sketch-level, acknowledged gaps |
| **CONJECTURE** | C | Plausible but unproven |
| **SPECULATION** | S | Interesting but untested |

**Default**: Unless proven otherwise, assume CONJECTURE or SPECULATION.

---

## Workflow

### When Adding a New Claim

1. **State the claim precisely**
2. **Assign confidence level** (be honest - default to CONJECTURE)
3. **List assumptions** → add to `assumptions_registry.md`
4. **Identify gaps** in the argument
5. **Find falsification criteria** → add to `falsification_criteria.md`
6. **Check for numerology** - could different assumptions give same result?
7. **Document** in `derivations_summary.md`

### When Working with Claude

**DO:**
- Ask Claude to steelman objections
- Request "what would falsify this?"
- Use Extended Thinking for complex derivations
- Ask Claude to argue the opposite position

**DON'T:**
- Accept "that looks correct" without verification
- Let Claude validate without critique
- Ignore "this seems too good" warnings
- Skip assumption tracking

### Anti-Sycophancy Prompts

Use these regularly:
```
"What's the strongest objection to this claim?"
"Argue that this is numerology, not derivation."
"What am I assuming that I haven't stated?"
"Why would a professional physicist reject this?"
"What would falsify this derivation?"
```

---

## Red Flags

Stop and reassess if you notice:

| Red Flag | What It Means |
|----------|---------------|
| Result matches known value exactly | Possible fitting, not derivation |
| Multiple "natural choices" made | Hidden free parameters |
| Can't state falsification criterion | May be unfalsifiable |
| Argument uses vague terms | Definitions need tightening |
| Prior work dismissed quickly | May be repeating known failures |

---

## The Honest Questions

Keep asking:

1. **Is perspective actually doing work?** Or could any structure give the same results?

2. **Are derivations unique?** Or are there many paths to α ≈ 1/137?

3. **What's actually predicted?** Not "explained after the fact"?

4. **What would make you abandon this?** Be specific.

---

## Document Size Warning

Your `mathematical_framework.md` is ~62,000 tokens. This causes problems:

- **Lost in the middle**: Claude may miss content in the middle of long files
- **Context limits**: May not fit in working memory with other files

**Recommendation**: Consider splitting into:
- `framework_core.md` - Axioms and definitions
- `framework_qm.md` - Quantum mechanics derivation
- `framework_gr.md` - General relativity derivation
- `framework_constants.md` - Physical constants
- `framework_predictions.md` - Novel predictions

---

## Daily Practice

Before each session:
1. Review `outstanding_questions.md` - what's open?
2. Check `changelog.md` - where did we leave off?
3. Remind Claude of skepticism requirements

After each session:
1. Update `changelog.md` with what changed
2. Add any new assumptions to registry
3. Update confidence levels if needed
4. Move failed ideas to `archive/deprecated/`

---

## Success Criteria

The framework succeeds if:

- [ ] At least one **novel, testable prediction** identified
- [ ] All derivations have **explicit steps** (no gaps)
- [ ] **Zero free parameters** in numerical predictions
- [ ] **Falsification criteria** for every major claim
- [ ] **Literature review** of prior failed attempts completed
- [ ] Can answer all objections in `peer_review_prep.md`

---

## Remember

> "The first principle is that you must not fool yourself — and you are the easiest person to fool."
> — Richard Feynman

This system exists to make self-deception harder. Use it honestly.

---

*Last updated: 2026-01-26*
