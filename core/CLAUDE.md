# Core Directory

Pure mathematical foundations — axioms, definitions, and theorems from perspective alone, no physics imports.

## Structure

| Subdirectory | Prefix | Range | Contents |
|-------------|--------|-------|----------|
| `axioms/` | AXM | 0100-0199 | 20 foundational assumptions |
| `definitions/` | DEF | 0200-02FF | Precise definitions (hex: 02A0-02C6) |
| `theorems/` | THM | 0400-04FF | Major results (hex: 04A0-04B0) |
| `lemmas/` | LEM | 0300-0399 | Helper results (legacy: 0400-0402) |

Numbered modules (01-20) provide narrative explanations of axioms/theorems in context.

## Status Values

- **CANONICAL**: Proven, verified, stable
- **PROPOSED**: Under review
- **DEPRECATED**: Superseded, kept for history

For theorems: **PROVEN** | **SKETCH** | **CLAIMED** | **DERIVATION** | **CONJECTURE**

## Layer 0 Purity

**CRITICAL**: Core axiom files (Layer 0) must have NO physics concepts. No energy, mass, charge, spin, gauge groups, fermions, or SM terminology. Use only: universe, perspective, adjacency, overlap, sets, functions, pure math.

Physics enters at Layer 2 (correspondence rules in `framework/`).

## Proof Standards

1. Every step references source: `[AXM_XXXX]`, `[THM_XXXX]`, or `[I-MATH]`
2. Gaps explicitly noted: "By continuity (not yet formalized)"
3. Computational verification required for any numerical result

## Cross-References

- `core/theorems/` ↔ `registry/derivations/`
- All files ↔ `registry/CLAIM_DEPENDENCIES.md`
