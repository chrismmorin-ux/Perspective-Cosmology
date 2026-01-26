# Ordered Plan: Making Perspective Cosmology Physicist-Ready

**Date**: 2026-01-26
**Goal**: Make framework "interesting enough to look at, concrete enough to be legitimate"

**Key insight**: Documentation ≠ rigor. Every claim needs computational verification.

---

## Pre-requisite: Read RIGOR_PROTOCOL.md

Before any phase, understand the verification requirements:
- SymPy scripts for all calculations
- Derivation chains with [A]/[I]/[D] tags
- Semi-formal axiom statements

---

## Phase 0: Reference Library (COMPLETED)

- [x] Comprehensive web search on Standard Model physics
- [x] Create `references/standard_model_reference.md` with:
  - SM structure and explicit assumptions
  - All coupling constants with sources
  - GUT predictions
  - QFT foundations (Wightman axioms)
  - Open problems
  - Key numbers for comparison

**Status**: DONE

---

## Phase 1: Strip Physics from Axioms

**Goal**: Create a clean Layer 0 that contains ONLY perspective axioms — no physics identification

### Tasks

1.1 **Create `framework/layer_0_pure_axioms.md`**
   - Extract from `core/01_universe.md` through `core/07_*.md`
   - Remove ALL references to:
     - Spacetime, particles, forces
     - Physical constants (ℏ, c, G, α)
     - QM or GR comparisons
   - Keep ONLY:
     - U = (P, Σ, Γ, C, V, B)
     - Axioms U1-U4
     - γ overlap parameter
     - |Π| perspective count

1.2 **Write semi-formal axiom statements**
   - Each axiom in predicate logic form (even if not machine-verified)
   - Identify required mathematical structures (set theory, topology, etc.)
   - Flag any axiom that can't be stated precisely

1.3 **Identify what axioms actually constrain**
   - Does the framework constrain dim(B)?
   - Does it constrain dim(V)?
   - Does it constrain |Π|?
   - What γ-functions are forced vs chosen?

1.4 **Document Layer 0 free parameters**
   - List everything that is NOT constrained by axioms
   - These are the framework's TRUE free parameters

**Deliverable**: Clean axiom document that a mathematician could evaluate without physics knowledge

**Verification**: Axioms must be precise enough that two mathematicians would agree on their meaning

---

## Phase 2: Mathematical Consequences

**Goal**: Determine what follows mathematically from Layer 0 alone

### Tasks

2.1 **Create `framework/layer_1_mathematics.md`**
   - What structures MUST exist given the axioms?
   - What structures CAN exist?
   - What is UNDERDETERMINED?

2.2 **Key mathematical questions to resolve**

   | Question | Status | Notes |
   |----------|--------|-------|
   | Does Σ have natural dimension? | ? | Simplicial complex dimension |
   | Does V decompose naturally? | ? | Any forced subspace structure? |
   | What functions of γ are natural? | ? | Why 2γ-1? Why 2γ(1-γ)? |
   | Is |Π| bounded? | ? | Finite but how large? |
   | Does B have forced structure? | ? | Or is dim(B) free? |

2.3 **Attempt derivations WITHOUT physics**
   - Can we get any dimensionless numbers from pure structure?
   - What ratios emerge naturally?
   - This is where α-as-geometry might work

2.4 **Write verification scripts**
   - Every mathematical claim gets a SymPy script in `verification/sympy/`
   - Document which claims are computationally verified vs. argued

**Deliverable**: Document of what Layer 0 actually implies mathematically

**Verification**: Each derivation has:
- Derivation chain with [A]/[I]/[D] tags
- SymPy script (if computational)
- Clear statement of what's proven vs. conjectured

---

## Phase 3: Explicit Correspondence Rules

**Goal**: List EVERY import from known physics

### Tasks

3.1 **Create `framework/layer_2_correspondence.md`**
   - Catalog every identification we make:

   | Mathematical Object | Physical Identification | Source | Justified? |
   |---------------------|-------------------------|--------|------------|
   | dim(B) = 10 | "Like SO(10)" | GUT | NO |
   | n_color = 3 | QCD colors | SM | NO |
   | n_weak = 2 | Weak isospin | SM | NO |
   | n_space = 3 | Spatial dimensions | Observation | NO |
   | |Π| ≈ 10^118 | Horizon perspectives | Cosmology | NO |
   | τ₀ = t_P | Planck time | QG | NO |
   | V is complex | For QM phases | QM | NO |

3.2 **For each import, document**:
   - Why this identification?
   - Could we derive it instead?
   - What if the identification is wrong?

3.3 **Classify imports**:
   - ESSENTIAL (framework fails without it)
   - CONVENIENT (simplifies but not necessary)
   - TESTABLE (could be verified independently)

**Deliverable**: Explicit list of every assumption borrowed from physics

---

## Phase 4: Separate Predictions from Imports

**Goal**: Determine what the framework actually predicts vs. what it assumes

### Tasks

4.1 **Create `framework/layer_3_predictions.md`**
   - Only include claims that follow from Layers 0-2
   - Mark each prediction's import dependencies

4.2 **For each "prediction", answer**:
   - What axioms does it use?
   - What imports does it use?
   - Is the derivation complete?
   - Could alternative assumptions give the same result?

4.3 **Classify predictions**:
   - DERIVED (follows from axioms + correspondence)
   - PATTERN (numerical match without derivation)
   - HOPE (stated but not derived)

**Deliverable**: Honest list of what the framework predicts

---

## Phase 5: Divergence Analysis

**Goal**: Identify and preserve areas where perspective differs from standard physics

### Tasks

5.1 **Update `divergence_registry.md`**
   - Cross-reference with `references/standard_model_reference.md`
   - For each divergence, note:
     - What SM says
     - What perspective says
     - Whether this is testable
     - Whether this matches any known alternatives

5.2 **Prioritize divergences**:

   | Divergence | Novelty | Testability | Priority |
   |------------|---------|-------------|----------|
   | Log vs power scaling | HIGH | LOW | 1 |
   | sin²θ_W = 2/9 | MEDIUM | HIGH | 2 |
   | γ-transition at λ_C | MEDIUM | MEDIUM | 3 |
   | α from geometry | UNKNOWN | UNKNOWN | 4 |

5.3 **Research each divergence**:
   - Has anyone proposed similar ideas?
   - What does mainstream physics say?
   - Is this known by another name?

**Deliverable**: Prioritized list of divergences for physicist evaluation

---

## Phase 6: Fresh Derivation Attempts

**Goal**: Try to derive key results cleanly from Layer 0

### Tasks

6.1 **α from pure geometry** (your intuition)
   - What geometric ratios arise from B-structure?
   - Can we get 1/137 without gauge theory?
   - Document attempt whether it works or not

6.2 **dim(B) from axioms**
   - Is there a natural dimension?
   - Does stability/consistency constrain it?

6.3 **|Π| from axioms**
   - Can we bound |Π| from structure?
   - Or must it be an input?

**Deliverable**: Honest record of derivation attempts (success or failure)

---

## Phase 7: Physicist-Ready Summary

**Goal**: Create a document a theoretical physicist could evaluate in 30 minutes

### Tasks

7.1 **Create `PHYSICIST_SUMMARY.md`**
   - One page: What is this framework?
   - One page: What are the axioms?
   - One page: What does it predict?
   - One page: What are the open questions?

7.2 **Include explicit questions for physicist**:
   - Is there a path from perspective to constants?
   - Are the divergences known/novel/impossible?
   - What would make this worth pursuing?

7.3 **Be ruthlessly honest**:
   - State clearly what works and what doesn't
   - Don't hide problems
   - Acknowledge what's speculation

**Deliverable**: Evaluation-ready summary document

---

## Phase 8: Seek Evaluation

**Goal**: Get external perspective (pun intended)

### Options

8.1 **Academic contact**
   - Identify physicists working on foundations
   - Send summary, ask for 15 minutes

8.2 **Online communities**
   - Physics Stack Exchange (carefully framed)
   - Physics Forums
   - Reddit r/physics or r/AskPhysics

8.3 **Preprint**
   - If Phases 1-7 produce something coherent
   - arXiv or viXra (with appropriate caveats)

---

## Execution Order

| Phase | Depends On | Estimated Scope | Priority |
|-------|------------|-----------------|----------|
| 0 | - | DONE | - |
| 1 | Phase 0 | Medium | CRITICAL |
| 2 | Phase 1 | Large | CRITICAL |
| 3 | Phase 0 | Medium | CRITICAL |
| 4 | Phases 1-3 | Medium | HIGH |
| 5 | Phase 4 | Medium | HIGH |
| 6 | Phase 2 | Large | MEDIUM |
| 7 | Phases 1-6 | Small | HIGH |
| 8 | Phase 7 | External | FINAL |

---

## Starting Point

**Begin with Phase 1**: Strip physics from axioms

This is foundational — everything else depends on having clean axioms.

**First action**: Read `core/01_universe.md` through `core/07_*.md` and extract ONLY the pure mathematical structure, removing all physics interpretation.

---

## Success Criteria

A theoretical physicist should be able to:

1. ✓ Understand the axioms in 10 minutes
2. ✓ See what's derived vs assumed
3. ✓ Identify which imports are necessary
4. ✓ Evaluate whether predictions are genuine
5. ✓ Tell us which divergences are interesting

**The goal is not to look good. The goal is to be evaluable.**

---

*Ready to begin Phase 1?*
