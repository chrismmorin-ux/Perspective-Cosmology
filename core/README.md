# Mathematical Core

This directory contains the **pure mathematical** components of the framework.

## Design Principles

1. **Atomic modules** - Each file defines one concept
2. **Explicit dependencies** - Each file lists what it requires
3. **No physical interpretation** - Pure math only; physics lives in `/physics/`
4. **Scope declaration** - Each module states exactly what it defines and proves

## Module Structure

Each module follows this template:

```
REQUIRES: [list of modules this depends on]
DEFINES: [list of definitions introduced]
PROVES: [list of theorems proven]
STATUS: AXIOM | THEOREM | DEFINITION
```

## Directory Structure

```
/core/
├── 00_notation.md          # Symbols and conventions
├── 01_universe.md          # U = (P, Σ, Γ, C, V, B)
├── 02_perspective.md       # π = (p, D, A)
├── 03_adjacency.md         # Perspective adjacency relation
├── 04_propagation.md       # P_D operator
├── 05_overlap.md           # γ parameter
├── 06_information.md       # Information loss/gain
├── 07_basis_geometry.md    # B-structure and Aut(B)
└── ...
```

## Validation

A module is valid iff:
- All REQUIRES are satisfied
- All DEFINES are used in PROVES
- No circular dependencies
- No appeals to physics
