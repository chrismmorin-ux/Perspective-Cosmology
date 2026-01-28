# Core Directory Guidelines

## Purpose

This directory contains the pure mathematical foundations — axioms, definitions, lemmas, and theorems that follow from perspective alone without physics imports.

## Directory Structure

```
core/
├── axioms/             # AXM_XXXX files — foundational assumptions
├── definitions/        # DEF_XXXX files — precise definitions
├── lemmas/            # LEM_XXXX files — helper results
├── theorems/          # THM_XXXX files — major results
└── [NN]_[topic].md    # Overview modules (01-20)
```

## Numbering Conventions

| Prefix | Range | Type |
|--------|-------|------|
| AXM | 0100-0199 | Axioms |
| DEF | 0200-0299 | Definitions |
| LEM | 0300-0399 | Lemmas |
| THM | 0400-0499 | Theorems |

## File Status

| Status | Meaning |
|--------|---------|
| CANONICAL | Proven, verified, stable |
| PROPOSED | Under review |
| DEPRECATED | Superseded, kept for history |

## Axiom Files

### Required Sections

```markdown
# AXM_XXXX: [Name]

**Status**: CANONICAL | PROPOSED | DEPRECATED

## Statement
[Semi-formal predicate logic]

## Natural Language
[Plain English]

## Motivation
[Why this axiom?]

## Consequences
[What follows from this?]

## Layer
Layer 0 (pure) | Layer 1 (derived)
```

### Current Axioms (Session 87)

| ID | Name | Layer |
|----|------|-------|
| AXM_0101 | Universe completeness | 0 |
| AXM_0102 | Perspective existence | 0 |
| AXM_0103 | Adjacency definition | 0 |
| AXM_0104 | Overlap definition | 0 |
| AXM_0105 | Defect space | 0 |
| AXM_0106 | Non-invertibility | 0 |
| AXM_0107 | Field structure | 1 |
| AXM_0108 | Consistency | 0 |
| AXM_0109 | Crystal existence | 0 |
| AXM_0110 | Perfect orthogonality | 0 |
| AXM_0111 | Crystal completeness | 0 |
| AXM_0112 | Crystal symmetry | 0 |
| AXM_0113 | Finite access | 0 |
| AXM_0114 | Tilt possibility | 0 |
| AXM_0115 | Algebraic completeness | 1 |
| AXM_0116 | Crystal timelessness | 0 |
| AXM_0117 | Crystallization tendency | 1 |
| AXM_0118 | Prime attractor selection | 1 |

## Theorem Files

### Required Sections

```markdown
# THM_XXXX: [Name]

**Status**: PROVEN | SKETCH | CLAIMED

## Statement
[Precise mathematical claim]

## Proof
[Complete derivation with references]

## Verification
Script: [reference]
Status: PASS | PARTIAL | FAIL

## Implications
[What this enables]
```

### Proof Standards

1. Every step must reference its source:
   - `[AXM_XXXX]` for axioms
   - `[THM_XXXX]` for theorems
   - `[I-MATH]` for standard mathematical facts

2. Gaps must be explicitly noted:
   - "By continuity (not yet formalized)"
   - "Assuming [X] (see gap list)"

3. Computational verification required for:
   - Any numerical result
   - Any claim about specific values

## Key Theorems (Session 87)

| ID | Name | Status |
|----|------|--------|
| THM_0482 | No zero divisors | PROVEN |
| THM_0483 | Transition invertibility | PROVEN |
| THM_0484 | Division algebra structure | PROVEN |
| THM_0485 | Complex structure (F=C) | PROVEN |

## Overview Modules

The numbered modules (01-20) provide narrative explanations:

| Module | Topic |
|--------|-------|
| 01 | Introduction |
| 02 | Basic structure |
| 03 | Time emergence |
| ... | ... |
| 17 | Complex structure |
| 18 | Division algebras |

These explain the axioms/theorems in context. Keep them in sync with the formal files.

## Layer 0 Purity

**CRITICAL**: Core axiom files (Layer 0) must have NO physics concepts.

Forbidden in Layer 0:
- Energy, mass, charge, spin
- Gauge groups, fermions, bosons
- Any Standard Model terminology
- Any [A-IMPORT] tags

Layer 0 uses ONLY:
- Universe, perspective, adjacency, overlap
- Sets, functions, relations
- Pure mathematical structures

Physics enters at Layer 2 (correspondence rules in `framework/`).

## Cross-References

Keep in sync:
- `core/axioms/` ↔ `registry/tag_registry.md`
- `core/theorems/` ↔ `registry/derivations_summary.md`
- All files ↔ `registry/CLAIM_DEPENDENCIES.md`
