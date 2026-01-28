# Framework Directory Guidelines

## Purpose

This directory contains the physical interpretation of the mathematical framework — the bridge between pure axioms and testable predictions.

## Directory Structure

```
framework/
├── layer_0_pure_axioms.md      # Pure perspective axioms (NO physics)
├── layer_1_crystallization.md  # Mathematical consequences
├── layer_2_correspondence.md   # Explicit physics imports
├── layer_3_predictions.md      # Testable predictions
├── PRIME_PHYSICAL_CATALOG.md   # Master catalog of framework primes
├── investigations/             # Deep-dive analysis files (51+ files)
└── [topic_name].md             # Top-level framework documents
```

## Layer System

| Layer | Content | Rule |
|-------|---------|------|
| 0 | Perspective axioms | NO physics concepts |
| 1 | Mathematical consequences | Pure math from axioms |
| 2 | Correspondence rules | EXPLICIT imports |
| 3 | Predictions | Derived from layers 0-2 |

**Key principle**: Keep layers cleanly separated. A Layer 0 file should have NO [A-IMPORT] tags.

## Investigation Files

### Status Categories

| Status | Meaning | Action |
|--------|---------|--------|
| CANONICAL | Verified, complete | Reference freely |
| ACTIVE | Work in progress | Update as you work |
| QUARANTINE | Known gaps | Fix before using |
| ARCHIVE | Superseded/failed | Don't use, learn from |

### Required Sections

Every investigation file MUST have:

1. **Status header** — ACTIVE/CANONICAL/QUARANTINE/ARCHIVE
2. **Question** — What are we investigating?
3. **Findings** — With confidence tags on each claim
4. **Verification links** — Reference to SymPy scripts
5. **Dependencies** — What this uses and what uses it
6. **Session history** — Track of changes over time

### File Naming

```
investigations/
├── [topic]_[aspect].md

Examples:
├── alpha_prime_attractor_enhanced.md
├── mixing_angles_division_algebra.md
├── weinberg_prime_attractor.md
├── non_framework_primes.md
```

## Tagging Requirements

### Every Claim Must Have

1. **Confidence tag**: `[AXIOM]`, `[THEOREM]`, `[DERIVATION]`, `[CONJECTURE]`, `[SPECULATION]`
2. **Derivation chain**: `[A]/[I]/[D]` tags showing provenance
3. **Assumption list**: All `[A-IMPORT]` values used

### Example

```markdown
## Finding: sin²θ_W = 1/4 at tree level

**Confidence**: [DERIVATION]

**Chain**:
- g₁²/g₂² = 1 [D: from gauge coupling unification]
- sin²θ_W = g₁²/(g₁²+g₂²) = 1/2 [I: SM definition]
- Actually 1/4 due to [correction factor]

**Assumptions**:
- [A-STRUCTURAL]: SU(2)×U(1) gauge group
- [A-IMPORT]: Weak mixing angle definition

**Verification**: `weinberg_angle_derivation.py` — PASS
```

## Prime Physical Catalog

The file `PRIME_PHYSICAL_CATALOG.md` is the master reference for:
- All 8 framework primes (2, 3, 5, 7, 13, 53, 73, 113, 137)
- Non-framework primes (19, 31, 37, 71, 79, 89...)
- Physical manifestations of each

When discovering a new prime appearance:
1. Add to the catalog with formula
2. Write verification script
3. Link to investigation file

## Common Patterns

### When Deriving a Constant

1. Start with division algebra dimensions: n_d=4, n_c=11
2. Build formula from these ONLY
3. Write SymPy script
4. Compare to measurement
5. Document with full chain

### When Finding a New Prime

1. Check if it's sum of two squares (framework) or not
2. Determine physical context (elementary vs composite)
3. Add to appropriate catalog section
4. Cross-reference with other primes

## Cross-References

Keep these files in sync:
- `framework/PRIME_PHYSICAL_CATALOG.md` ↔ `registry/derivations_summary.md`
- Investigation findings ↔ `registry/MASTER_CLAIMS.md`
- Falsifiable predictions ↔ `registry/FALSIFICATION_REGISTRY.md`
