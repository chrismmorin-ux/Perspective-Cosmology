# Atomicity Proposal: Restructuring for Mathematical Modularity

**Created**: 2026-01-26
**Purpose**: Research-based proposal for making documents atomic and manageable

---

## Research Summary

### Sources Consulted

1. **[Lean 4 / Mathlib](https://leanprover-community.github.io/mathematics_in_lean/)** - 210,000+ theorems organized modularly
2. **[Coq Proof Assistant](https://coq.inria.fr/)** - Module system with Require/Import
3. **[OMDoc Format](https://www.omdoc.org/format/)** - Open Mathematical Documents specification
4. **[MMT System](https://link.springer.com/chapter/10.1007/978-3-319-96812-4_18)** - Theory morphisms and knowledge management
5. **[Stacks Project](https://stacks.math.columbia.edu/tags)** - Tag system for 7,500+ pages of algebraic geometry
6. **[Avigad on Modularity](https://www.andrew.cmu.edu/user/avigad/Papers/modularity.pdf)** - Philosophical foundations

---

## Key Patterns Discovered

### 1. The "Little Theories" Approach (MMT)

> "Each mathematical topic is developed in the 'little theory' that has the most convenient level of abstraction. Then definitions and theorems are transported via theory morphisms."

**Implication**: Each concept gets its own minimal file. Larger structures emerge from imports.

### 2. Permanent Tags (Stacks Project)

> "A tag is a four character string... If a lemma's label is changed or moved to a different file, the tag itself is never changed."

**Implication**: Every definition, theorem, conjecture needs a permanent identifier that survives reorganization.

### 3. Explicit Dependencies (Coq/Lean)

```lean
import Mathlib.Data.Real.Basic
import Mathlib.Algebra.Ring.Basic
```

**Implication**: Every file declares exactly what it needs. No implicit dependencies.

### 4. Naming Conventions (Mathlib)

> "A theorem named `A_of_B_of_C` establishes something of the form A from hypotheses B and C"

**Implication**: Names should encode structure: what is proven from what.

### 5. No Forward References (Stacks Project)

> "There are no forward references. Every time a previous result is used it is explicitly referenced."

**Implication**: Strict dependency ordering. Can't use results before they're established.

### 6. Hierarchical Namespaces (Lean)

> "When a definition `foo` is introduced in namespace `bar`, its full name is `bar.foo`"

**Implication**: Use directory structure as namespace. `core/universe/axiom_finiteness` = `core.universe.axiom_finiteness`

---

## Proposed Atomic Structure

### Atomic Unit Types

| Type | Prefix | Example | Max Lines |
|------|--------|---------|-----------|
| **Axiom** | `AXM_` | `AXM_universe_finite.md` | 30-50 |
| **Definition** | `DEF_` | `DEF_perspective.md` | 30-80 |
| **Theorem** | `THM_` | `THM_no_loop.md` | 50-100 |
| **Lemma** | `LEM_` | `LEM_hidden_accumulates.md` | 30-80 |
| **Conjecture** | `CNJ_` | `CNJ_alpha_crystal.md` | 50-150 |
| **Derivation** | `DRV_` | `DRV_h_gamma.md` | 50-150 |
| **Import** | `IMP_` | `IMP_n_color.md` | 20-40 |

### Permanent Tag System

Adopt Stacks Project style: 4-character alphanumeric tags.

```
Tag: 0001  →  AXM_universe_exists
Tag: 0002  →  AXM_universe_finite
Tag: 001A  →  DEF_perspective
Tag: 002B  →  THM_self_inaccessibility
```

Tags NEVER change, even if file moves or renames.

### File Template

```markdown
# [TAG] [Type]: [Name]

**Tag**: [permanent 4-char identifier]
**Type**: AXIOM | DEFINITION | THEOREM | LEMMA | CONJECTURE | DERIVATION | IMPORT
**Status**: CANONICAL | ACTIVE | QUARANTINE

---

## Requires

- [TAG1] [brief description]
- [TAG2] [brief description]

## Provides

- [Symbol or result name]

---

## Statement

[The actual content - one thing only]

---

## Proof/Justification (if applicable)

[Proof or argument]

---

## Used By

- [TAG3] [what uses this]
- [TAG4] [what uses this]
```

---

## Proposed Directory Structure

```
core/
├── axioms/
│   ├── AXM_0001_universe_exists.md
│   ├── AXM_0002_universe_finite.md
│   ├── AXM_0003_universe_connected.md
│   ├── AXM_0004_perspective_partial.md
│   └── ...
├── definitions/
│   ├── DEF_001A_perspective.md
│   ├── DEF_001B_accessible_content.md
│   ├── DEF_001C_hidden_content.md
│   ├── DEF_001D_adjacency.md
│   ├── DEF_001E_overlap_gamma.md
│   └── ...
├── theorems/
│   ├── THM_002A_self_inaccessibility.md
│   ├── THM_002B_non_invertibility.md
│   ├── THM_002C_no_loop.md
│   ├── THM_002D_second_law.md
│   └── ...
└── lemmas/
    ├── LEM_003A_hidden_accumulates.md
    └── ...

physics/
├── imports/
│   ├── IMP_004A_n_color.md
│   ├── IMP_004B_n_weak.md
│   ├── IMP_004C_planck_time.md
│   └── ...
├── conjectures/
│   ├── CNJ_005A_alpha_crystal.md
│   ├── CNJ_005B_high_gamma_qm.md
│   ├── CNJ_005C_low_gamma_gr.md
│   └── ...
└── derivations/
    ├── DRV_006A_h_gamma.md
    ├── DRV_006B_decoherence_rate.md
    └── ...
```

---

## Tag Registry

A single file tracks all tags:

```markdown
# Tag Registry

| Tag | Type | Name | File | Status |
|-----|------|------|------|--------|
| 0001 | AXM | Universe exists | core/axioms/AXM_0001_universe_exists.md | CANONICAL |
| 0002 | AXM | Universe finite | core/axioms/AXM_0002_universe_finite.md | CANONICAL |
| 001A | DEF | Perspective | core/definitions/DEF_001A_perspective.md | CANONICAL |
| 002A | THM | Self-inaccessibility | core/theorems/THM_002A_self_inaccessibility.md | CANONICAL |
| 005A | CNJ | Alpha crystal | physics/conjectures/CNJ_005A_alpha_crystal.md | ACTIVE |
```

---

## Dependency Graph Format

Each file's `Requires` section creates edges in a dependency graph:

```
0001 (Universe exists)
  └── 001A (Perspective) requires 0001
        ├── 001B (Accessible content) requires 001A
        ├── 001C (Hidden content) requires 001A
        └── 002A (Self-inaccessibility) requires 001A
              └── 002C (No-loop) requires 002A
```

This can be automatically extracted and visualized.

---

## Migration Strategy

### Phase 1: Tag Assignment
1. Identify every atomic unit in current files
2. Assign permanent tags
3. Create tag_registry.md

### Phase 2: Extraction
1. Extract each unit to its own file
2. Add Requires/Provides headers
3. Maintain backward compatibility via redirect files

### Phase 3: Cleanup
1. Archive large legacy files
2. Build dependency graph
3. Verify all references resolve

### Phase 4: Tools
1. Script to validate dependencies
2. Script to generate dependency graph
3. Script to find orphaned/circular references

---

## Example: Splitting 01_universe.md

Current file (89 lines) contains:
- 4 axioms (U1-U4)
- 3 lemmas (U.1-U.3)
- Multiple definitions

Split into:

| Tag | File | Content |
|-----|------|---------|
| 0001 | `AXM_0001_universe_tuple.md` | U = (P, Σ, Γ, C, V, B) definition |
| 0002 | `AXM_0002_finiteness.md` | U1: \|P\| < ∞ and dim(V) < ∞ |
| 0003 | `AXM_0003_connectivity.md` | U2: Graph (P, Σ₁) is connected |
| 0004 | `AXM_0004_nontriviality.md` | U3: ∃ p, q : C(p) ≠ C(q) |
| 0005 | `AXM_0005_closure.md` | U4: ∀ σ ∈ Σ, ∀ τ ⊂ σ : τ ∈ Σ |
| 0006 | `LEM_0006_two_elements.md` | U.1: P has at least 2 elements |
| 0007 | `LEM_0007_edges_nonempty.md` | U.2: Σ₁ is non-empty |
| 0008 | `LEM_0008_basis_decomposition.md` | U.3: C(p) decomposes in B |

Each file: 20-40 lines. Total: 8 files replacing 1.

---

## Benefits

1. **Context efficiency**: Each file fits in one read
2. **Precise references**: Tag 002A always means the same thing
3. **Easy navigation**: Find exactly what depends on what
4. **Parallel work**: Different files can be worked independently
5. **Verification**: Each unit can be verified in isolation
6. **Reuse**: Import specific results, not whole documents

---

## Costs

1. **More files**: ~100-200 files instead of ~30
2. **Initial effort**: Significant migration work
3. **Cross-reference maintenance**: Must update Used By sections
4. **Learning curve**: New organization to understand

---

## Recommendation

Start with a pilot: Convert `core/01_universe.md` to the atomic structure. Evaluate whether benefits outweigh costs before full migration.

---

## Questions for Discussion

1. Should tags be purely numeric (0001) or include type prefix (AXM01)?
2. How granular? Is each axiom separate, or group related axioms?
3. Tool support: Build validation scripts first or migrate first?
4. Session logs: Archive old sessions or keep in one growing file?

---

*This proposal synthesizes best practices from Lean/Mathlib, Coq, OMDoc, MMT, and the Stacks Project.*
