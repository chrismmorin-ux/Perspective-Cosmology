# Physics Interpretations

This directory contains **physical interpretations** of the mathematical core.

## Separation Principle

```
/core/   = Pure mathematics (no physics)
/physics/ = Physical meanings (references core)
```

## Status Levels

| Level | Meaning |
|-------|---------|
| **IDENTIFICATION** | Direct mapping (e.g., "γ = overlap") |
| **LIMIT** | Behavior in limiting case |
| **CONJECTURE** | Proposed but unproven connection |
| **SPECULATION** | Exploratory idea |

## Module Structure

Each module:
1. References specific `/core/` modules
2. States the physical interpretation
3. Declares confidence level
4. Lists assumptions beyond the math
5. Notes what would falsify the interpretation

## Directory Structure

```
/physics/
├── spacetime.md          # Γ-structure → geometry
├── quantum_limit.md      # High-γ → QM
├── gravity_limit.md      # Low-γ → GR
├── gauge_structure.md    # Aut(B) → gauge groups
├── constants/
│   ├── alpha.md          # Fine structure constant
│   ├── weinberg.md       # Weinberg angle
│   └── newton_G.md       # Newton's constant
└── predictions.md        # Testable claims
```

## Critical Rule

**A derivation in `/physics/` is only as strong as:**
1. The `/core/` math it depends on
2. The physical identification it assumes
3. The assumptions not present in `/core/`

Any gap at any level breaks the derivation.
