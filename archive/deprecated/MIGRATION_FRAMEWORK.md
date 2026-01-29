# Migration Framework for Perspective Cosmology

**Created**: 2026-01-26
**Purpose**: Standardize documentation, establish quality gates, and migrate existing work into a physicist-ready format.

---

## 1. Project Philosophy

This framework develops a speculative physical model from first principles. We are:

1. **Exploring** — Testing whether perspective-based axioms generate useful physics
2. **Learning** — Breakthroughs, near-misses, and dead-ends are all data
3. **Honest** — Clear about what's derived vs. assumed vs. hoped
4. **Rigorous** — Computational verification for all numerical claims

### The Learning Signal Framework

| Signal Type | Meaning | Action |
|-------------|---------|--------|
| **Breakthrough** | Derivation works, matches observation | Document rigorously, verify computationally |
| **Near-miss** | Close but gaps remain | Quarantine, analyze what's missing |
| **Dead-end** | Approach fails fundamentally | Archive with explanation, learn from failure |
| **Anomaly** | Unexpected result | Investigate — may reveal axiom issues |

All signals refine the theory. None are "failures" — they're information.

---

## 2. Document Status Categories

Every document belongs to exactly one category:

### CANONICAL (Green)
**Location**: `framework/`, `core/` (numbered modules only)

**Requirements**:
- [ ] Follows standard template
- [ ] Confidence levels assigned to all claims
- [ ] Verification script exists for numerical claims
- [ ] [A]/[I]/[D] tags on derivation chains
- [ ] No untagged physics imports
- [ ] Reviewed for consistency with Layer 0-3

**Purpose**: The authoritative source of truth. What a physicist evaluator reads.

### ACTIVE-DEVELOPMENT (Yellow)
**Location**: `physics/`, `physics/constants/`

**Requirements**:
- [ ] Clear "Status" header (INVESTIGATING | BLOCKED | PROMISING)
- [ ] Lists open questions
- [ ] Links to relevant canonical documents
- [ ] Marks all imports explicitly

**Purpose**: Work in progress. May become Canonical or get Quarantined.

### QUARANTINE (Orange)
**Location**: `quarantine/`

**Requirements**:
- [ ] Reason for quarantine documented
- [ ] Migration criteria: what would promote it
- [ ] Links to related active work
- [ ] Date quarantined

**Purpose**: Incomplete, problematic, or speculative work that isn't ready for Canonical status but shouldn't be lost.

### ARCHIVE (Gray)
**Location**: `archive/deprecated/`

**Requirements**:
- [ ] Reason for deprecation documented
- [ ] What we learned from the failure
- [ ] Date archived
- [ ] Never deleted — historical honesty

**Purpose**: Dead-ends and superseded approaches. Preserved for intellectual honesty.

---

## 3. Unified Confidence Taxonomy

**CRITICAL**: All documents must use this single taxonomy.

### For Claims About Reality

| Level | Tag | Meaning | Verification Required |
|-------|-----|---------|----------------------|
| **1** | `[AXIOM]` | Assumed without proof; foundational | None (starting point) |
| **2** | `[THEOREM]` | Rigorously derived from axioms alone | Proof or SymPy verification |
| **3** | `[DERIVATION]` | Derived with acknowledged gaps | Derivation chain + gap list |
| **4** | `[CONJECTURE]` | Plausible, supported by evidence, unproven | Evidence documented |
| **5** | `[SPECULATION]` | Interesting but no supporting derivation | Marked clearly |

### For Predictions

| Tag | Meaning | Example |
|-----|---------|---------|
| `[DERIVED]` | Follows from axioms + correspondence rules | Γ_dec form |
| `[PATTERN]` | Numerical match without mechanism | sin²θ_W = 2/9 |
| `[HOPE]` | Stated goal, no derivation exists | GR from low-γ |
| `[RETRACTED]` | Previously claimed, now withdrawn | α from n_EW=5 |
| `[NULL]` | What framework explicitly doesn't predict | No new particles |

### For Assumptions

| Tag | Meaning | Example |
|-----|---------|---------|
| `[A-AXIOM]` | Core framework axiom | U is complete |
| `[A-STRUCTURAL]` | Mathematical structure choice | 𝔽 = ℂ |
| `[A-PHYSICAL]` | Physics interpretation | Adjacency = time |
| `[A-TECHNICAL]` | Calculation convenience | τ₀ = t_P |
| `[A-IMPORT]` | Borrowed from SM/observation | n_color = 3 |

### Derivation Chain Tags

Every "X follows from Y" statement must use:

| Tag | Meaning |
|-----|---------|
| `[A]` | Axiom (Layer 0) |
| `[I]` | Import (Layer 2) |
| `[D]` | Derived (from [A] and/or [I]) |

**Example**:
```
sin²θ_W = 2/9 [D]
  ← n_weak = 2 [I: SM electroweak structure]
  ← n_color = 3 [I: SM QCD structure]
  ← Dimension ratio conjecture [D: UNPROVEN]
```

---

## 4. Standard Document Templates

### Template: Core Mathematical Module

```markdown
# [XX] [Concept Name]

**Status**: CANONICAL | ACTIVE | QUARANTINE
**Confidence**: [AXIOM] | [THEOREM] | [DERIVATION] | [CONJECTURE]
**Dependencies**: [list modules this builds on]
**Verified**: YES (script: verification/sympy/xxx.py) | NO | N/A

---

## Definition

[Precise mathematical definition using notation from 00_notation.md]

## Properties

### Property 1: [Name]
**Type**: [THEOREM] | [CONJECTURE]
**Statement**: ...
**Proof/Argument**: ...

## Connections

- Forward: [what uses this]
- Backward: [what this uses]

## Open Questions

1. [Question]

## Verification

Script: `verification/sympy/[name].py`
Result: [PASS | FAIL | PENDING]
```

### Template: Physics Investigation

```markdown
# [Topic] Investigation

**Status**: INVESTIGATING | BLOCKED | PROMISING | QUARANTINED | ARCHIVED
**Confidence**: [CONJECTURE] | [SPECULATION]
**Started**: YYYY-MM-DD
**Last Updated**: YYYY-MM-DD

---

## Question

[What are we trying to determine?]

## Approach

[Method being used]

## Imports Required

| Import | Source | Type |
|--------|--------|------|
| [value] | [SM/observation/GUT] | [A-IMPORT] |

## Current Status

[Where we are]

## Results

| Claim | Confidence | Accuracy | Verified |
|-------|------------|----------|----------|
| ... | [TAG] | X% | YES/NO |

## Gaps & Issues

1. [What's missing]

## Next Steps

1. [What to try next]

## Migration Criteria

To promote to CANONICAL:
- [ ] [Specific requirement]
```

### Template: Quarantine Document

```markdown
# [QUARANTINED] [Original Title]

**Original Location**: [path]
**Quarantined**: YYYY-MM-DD
**Reason**: [why quarantined]

---

## Original Content

[preserved content]

---

## Analysis

**Why This Failed/Stalled**:
1. [reason]

**What We Learned**:
1. [lesson]

**Migration Path** (to restore to Active):
- [ ] [requirement 1]
- [ ] [requirement 2]

**Related Work**:
- [links to active investigations]
```

---

## 5. Verification Standards

### Tier 1: Required for CANONICAL (Numerical Claims)

| Claim Type | Verification |
|------------|--------------|
| Numerical prediction (α, sin²θ_W, etc.) | SymPy script computing exact value |
| Mathematical identity | SymPy symbolic verification |
| Inequality or bound | SymPy proof or counterexample search |

**Script location**: `verification/sympy/[claim_name].py`

**Script requirements**:
```python
"""
Verification: [Claim name]
Confidence: [TAG]
Dependencies: [what's assumed]
"""

# [computation]

# RESULT: [PASS/FAIL]
# Computed: [value]
# Expected: [value]
# Error: [value]
```

### Tier 2: Required for CANONICAL (Derivations)

| Claim Type | Verification |
|------------|--------------|
| "X follows from Y" | Derivation chain with [A]/[I]/[D] tags |
| Limiting behavior | Explicit limit calculation |
| Correspondence | Both directions shown (framework ↔ physics) |

### Tier 3: Aspirational (Formal Proofs)

| Tool | Purpose | Status |
|------|---------|--------|
| Lean 4 | Formal axiom verification | Future goal |
| Coq | Alternative prover | Not started |

---

## 6. Migration Workflow

### Promoting: ACTIVE → CANONICAL

```
1. CHECK: Does document meet all CANONICAL requirements?
   - [ ] Standard template
   - [ ] All claims tagged
   - [ ] Imports explicit
   - [ ] Verification scripts exist and pass
   - [ ] No unresolved gaps

2. REVIEW: Cross-check with Layer 0-3
   - Does it contradict any axiom?
   - Are all imports listed in Layer 2?
   - Is the prediction in Layer 3?

3. MOVE: Update location and status header

4. UPDATE:
   - derivations_summary.md
   - assumptions_registry.md (if new assumptions)
   - ARCHITECTURE.md
```

### Demoting: CANONICAL → QUARANTINE

```
1. DOCUMENT: Why is this being demoted?
   - New contradiction found?
   - Verification failed?
   - Gap discovered?

2. CREATE: Quarantine document with analysis

3. MOVE: To quarantine/

4. UPDATE:
   - issues_log.md (file issue)
   - derivations_summary.md (mark as quarantined)
   - Any documents that reference this
```

### Archiving: QUARANTINE → ARCHIVE

```
1. CONFIRM: Is this truly a dead-end, not just stalled?

2. DOCUMENT: What we learned from the failure

3. MOVE: To archive/deprecated/

4. UPDATE:
   - Add to archive/deprecated/README.md
   - Remove from active tracking
```

---

## 7. Quality Gates

### Gate 1: Entry to Active-Development
- [ ] Clear question being investigated
- [ ] At least one approach identified
- [ ] Imports listed
- [ ] Links to relevant canonical work

### Gate 2: Promotion to Canonical
- [ ] All template sections complete
- [ ] Confidence tags on all claims
- [ ] Verification scripts pass
- [ ] No open CRITICAL issues
- [ ] Consistent with Layer 0-3

### Gate 3: Physicist-Ready
- [ ] Can be understood in 30 minutes
- [ ] Falsification criteria stated
- [ ] Clear separation: derived vs. assumed
- [ ] Historical context provided
- [ ] Honest about limitations

---

## 8. File Organization (Post-Migration)

```
Perspective Universe/
│
├── ## Governance (read first)
├── CLAUDE.md                    # AI guidelines
├── MIGRATION_FRAMEWORK.md       # THIS FILE
├── RIGOR_PROTOCOL.md            # Verification standards
├── ARCHITECTURE.md              # Structure overview
│
├── ## Canonical Layer Documents
├── framework/
│   ├── layer_0_pure_axioms.md   # [CANONICAL] Pure math
│   ├── layer_1_mathematics.md   # [CANONICAL] What axioms imply
│   ├── layer_2_correspondence.md # [CANONICAL] All imports
│   ├── layer_3_predictions.md   # [CANONICAL] Honest predictions
│   └── divergence_analysis.md   # [CANONICAL] Where we differ from SM
│
├── ## Canonical Core Mathematics
├── core/
│   ├── 00_notation.md           # [CANONICAL]
│   ├── 01_universe.md           # [CANONICAL]
│   └── ...                      # [CANONICAL] numbered modules
│
├── ## Active Development
├── physics/
│   ├── [topic].md               # [ACTIVE] investigations
│   └── constants/               # [ACTIVE] constant derivations
│
├── ## Quarantine (incomplete/problematic)
├── quarantine/
│   ├── README.md                # Index of quarantined work
│   ├── gr_limit_empty.md        # [QUARANTINE] No g_μν construction
│   └── [others]                 # [QUARANTINE] tagged
│
├── ## Archive (dead-ends, superseded)
├── archive/
│   └── deprecated/
│       ├── README.md            # Index with lessons learned
│       └── [old_work].md        # Preserved for honesty
│
├── ## Verification (non-negotiable)
├── verification/
│   └── sympy/
│       └── [claim_name].py      # One script per claim
│
├── ## References
├── references/
│   ├── standard_model_reference.md
│   └── [other references]
│
├── ## Tracking
├── session_log.md               # Work history
├── issues_log.md                # Active issues
├── assumptions_registry.md      # All assumptions
├── derivations_summary.md       # All claims with confidence
└── outstanding_questions.md     # Open problems
```

---

## 9. Immediate Migration Tasks

### Phase A: Triage Existing Physics Work

| File | Current State | Recommended Action |
|------|---------------|-------------------|
| `physics/gravity_limit.md` | Empty (no g_μν) | → QUARANTINE |
| `physics/gr_limit_investigation.md` | Empty promise | → QUARANTINE |
| `physics/constants/alpha_investigation_01.md` | Superseded | → ARCHIVE |
| `physics/constants/[13 variants]` | Mixed quality | → TRIAGE each |
| `physics/alpha_crystal_interface.md` | Promising (0.026%) | → ACTIVE (verify) |
| `physics/h_gamma_investigation.md` | Derived | → Promote to CANONICAL |

### Phase B: Create Verification Scripts

Priority order:
1. `alpha_crystal_interface.py` — verify 1/(4² + 11²) = 1/137
2. `sin2_theta_weinberg.py` — verify 2/9 ≈ 0.2222 vs 0.2229
3. `h_gamma_derivation.py` — verify h(γ) = 2γ(1-γ) derivation
4. `decoherence_rate_form.py` — verify Γ_dec = (1-2γ)/τ₀ form

### Phase C: Standardize Confidence Tags

Update all documents to use unified taxonomy:
1. Core modules (19 files)
2. Physics modules (25+ files)
3. Framework layers (5 files)

### Phase D: Create Quarantine Zone

1. Create `quarantine/` directory
2. Create `quarantine/README.md` index
3. Move empty/problematic work with proper documentation

---

## 10. Success Metrics

### For Migration Completion
- [ ] All documents have status category
- [ ] All claims have confidence tags
- [ ] All numerical claims have verification scripts
- [ ] Quarantine zone created and populated
- [ ] No orphaned documents (everything categorized)

### For Physicist Readiness
- [ ] 30-minute evaluation path exists (PHYSICIST_SUMMARY.md)
- [ ] Clear separation: axioms | math | imports | predictions
- [ ] Falsification criteria explicit
- [ ] Honest about gaps (GR limit, etc.)
- [ ] Best results highlighted with full derivation

### For Ongoing Development
- [ ] New work follows templates
- [ ] Verification happens before documentation
- [ ] Issues filed immediately when found
- [ ] Regular triage of Active → Canonical/Quarantine

---

## 11. Research-Informed Best Practices

Based on established methodology:

### From Theoretical Physics Tradition
- **Bottom-up formalization**: Discovery is messy; publication is structured. We separate exploration (physics/) from canonical (framework/) [Source: [arXiv methodology](https://arxiv.org/html/2501.05382v1)]
- **Axiomatic approach**: State axioms precisely, derive consequences rigorously [Source: [Hardy's 5 axioms for QM](https://arxiv.org/abs/quant-ph/0101012)]
- **Falsifiability**: Every claim needs a way to be proven wrong [Source: [Popper's criterion](https://www.symmetrymagazine.org/article/falsifiability-and-physics)]

### From First-Principles Methodology
- **Decompose to fundamentals**: What are the irreducible assumptions? [Source: [First principles in physics](https://link.springer.com/article/10.1007/s11229-020-02801-1)]
- **Reason up carefully**: Each step must follow from previous [Source: [Farnam Street](https://fs.blog/first-principles/)]
- **Question "obvious" assumptions**: They may not be necessary

### From Large Physics Collaborations
- **Standardized formats**: Everyone uses same templates [Source: [HEP standards](https://link.springer.com/article/10.1140/epjc/s10052-025-14707-8)]
- **Version control**: Track all changes with reasoning
- **Peer validation**: Nothing is canonical without review

---

## Version History

| Date | Change |
|------|--------|
| 2026-01-26 | Initial migration framework created |
