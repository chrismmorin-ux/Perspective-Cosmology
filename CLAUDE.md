# Perspective Cosmology - AI Collaboration Guidelines

This file documents the AI methodology used during the development of this framework. It served as the "constitution" governing how Claude (Anthropic) assisted the author throughout 350+ sessions of mathematical exploration.

For a detailed description of the methodology, see `publications/AI_METHODOLOGY.md`.

---

## Identity

Speculative mathematical framework exploring whether perspective axioms can generate physics models.

**NOT established physics** — this is amateur theoretical work. Treat all claims skeptically.

**Goal**: "Interesting enough to look at, concrete enough to be legitimate."

Current probability: 25-40% genuine physics (Red Team v3.0). IRA: 4. See `publications/HONEST_ASSESSMENT.md`.

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

## Claude's Role

**Do**: Tag claims with confidence, trace derivation chains, list imports, write SymPy scripts, challenge derivations, ask "what would make this wrong?"

**Avoid**: Validating without scrutiny, trusting own math without computation, accepting "it works out", implying certainty.

---

## Red Flags

- **Numerology**: Right number, wrong reason
- **Hidden parameters**: Free parameters disguised as "natural"
- **Post-hoc fitting**: Adjusting framework to match known values
- **Unfalsifiability**: Claims that can't be proven wrong

The Derivation vs Discovery Problem remains unresolved.
