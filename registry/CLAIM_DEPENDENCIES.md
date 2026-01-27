# Claim Dependencies

**Created**: 2026-01-27
**Purpose**: Map every claim to its dependencies (assumptions, prior claims, verification scripts)

---

## Why This Exists

When an assumption changes or is falsified, we need to know IMMEDIATELY which claims break. This document provides that dependency graph.

---

## Dependency Legend

| Symbol | Meaning |
|--------|---------|
| [AXIOM] | Framework axiom (assumed, cannot be derived) |
| [A-XXX] | Named assumption |
| [DERIVED] | Follows from prior claims |
| [PROVEN] | Mathematical theorem |
| [SCRIPT] | Has verification script |

---

## Core Axioms (Layer 0)

### AX-1: Static Universe (U exists complete)
**Depends on**: Nothing (foundational)
**Used by**: All claims about U's structure

### AX-2: Finite Completeness
**Depends on**: Nothing (foundational)
**Used by**: Counting arguments, |Π| finite

### AX-3: Perspective as Primitive
**Depends on**: Nothing (foundational)
**Used by**: Definition of π, V_π

### T1: Directed Time
**Depends on**: Nothing (foundational)
**Used by**: F = C, associativity, chirality

### T0: Algebraic Completeness
**Depends on**: T1
**Used by**: Invertibility
**Added**: S62

---

## Structural Claims

### CLAIM-1: F = C (Complex Structure)
**Statement**: The field must be C (complex numbers)
**Depends on**: T1 (directed time requires antisymmetric structure)
**Used by**: U(n) groups, fermion antisymmetry, QM phase
**Verification**: `core/17_complex_structure.md`
**Confidence**: DERIVED

### CLAIM-2: Associativity Required
**Statement**: Transition composition must be associative (path independence)
**Depends on**: T1 (directed time)
**Used by**: Division algebra constraint, Frobenius theorem
**Verification**: `associativity_derivation.md`
**Confidence**: DERIVED

### CLAIM-3: No Zero Divisors
**Statement**: T₁ ∘ T₂ ≠ 0 for non-zero transitions
**Depends on**: Definition of perspective (dim V_π ≥ 1)
**Used by**: Division algebra structure
**Verification**: `perspective_foundations_and_zero_divisors.md`
**Confidence**: DERIVED (S54)

### CLAIM-4: Invertibility
**Statement**: Every transition T has inverse T⁻¹
**Depends on**: T0 (algebraic completeness), adjacency symmetry
**Used by**: Division algebra structure, Frobenius theorem
**Verification**: `invertibility_investigation.md`
**Confidence**: DERIVED (S62-63)

### CLAIM-5: Division Algebra Structure
**Statement**: Transitions form a division algebra
**Depends on**: CLAIM-2 + CLAIM-3 + CLAIM-4
**Used by**: n_d constraint, gauge groups
**Verification**: `division_algebra_gap_analysis.py`
**Confidence**: DERIVED

### CLAIM-6: n_d ≤ 4
**Statement**: Maximum 4 defect dimensions (associative)
**Depends on**: CLAIM-5 + Frobenius theorem [PROVEN]
**Used by**: n_d = 4, α = 1/137
**Verification**: `associativity_requirement.py`
**Confidence**: DERIVED

### CLAIM-7: n_c = 11
**Statement**: Crystal has 11 dimensions (1+2+8)
**Depends on**: CLAIM-6, Hurwitz theorem [PROVEN]
**Used by**: α = 1/137, gauge groups
**Confidence**: DERIVED

---

## Gauge Structure Claims

### CLAIM-8: SM Gauge Groups
**Statement**: SU(3) × SU(2) × U(1) emerges from division algebras
**Depends on**: CLAIM-5, CLAIM-1 (F = C)
**Used by**: All particle physics
**Verification**: `gauge_groups_derivation.py` [PASS]
**Confidence**: DERIVED

### CLAIM-9: dim(G_SM) = 12, rank = 4
**Statement**: Gauge group has 12 generators, rank 4
**Depends on**: CLAIM-8
**Verification**: `gauge_dimension_rank_analysis.py` [PASS]
**Confidence**: PROVEN (mathematical identity)

### CLAIM-10: 15 Fermions per Generation
**Statement**: Each generation has 15 Weyl fermions
**Depends on**: CLAIM-8 + F = C
**Verification**: `fermion_multiplets_from_division_algebras.md`
**Confidence**: DERIVED

### CLAIM-11: All 5 Hypercharges
**Statement**: Y values {-1, -1/2, 1/6, 2/3, -1/3} from Im(H) = 3
**Depends on**: CLAIM-12 (B = 1/3) + anomaly cancellation [SM import]
**Verification**: `hypercharge_derivation.py` [PASS]
**Confidence**: DERIVED

### CLAIM-12: B = 1/3
**Statement**: Baryon number = 1/3
**Depends on**: N_colors = 3 (from CLAIM-8) + anomaly cancellation [SM import]
**Verification**: `baryon_number_uniqueness.py` [PASS]
**Confidence**: DERIVED (S57)

---

## Numerical Claims

### CLAIM-13: 1/α = 137
**Statement**: Fine structure constant = 1/(4² + 11²) = 1/137
**Depends on**: CLAIM-6 (n_d = 4), CLAIM-7 (n_c = 11)
**Verification**: `alpha_137_verification_clean.py` [PASS, 0.026% error]
**Confidence**: DERIVED (given division algebra structure)

### CLAIM-14: sin²θ_W = 1/4
**Statement**: Weinberg angle = 1/4 at ~200 TeV
**Depends on**: **[A-COUPLING]** (g² ∝ Im(algebra))
**Verification**: `weinberg_angle_running.py` [PASS for calculation]
**Confidence**: REQUIRES [A-COUPLING]
**Falsification**: If sin²θ_W ≠ 0.25 at high energy scales

### CLAIM-15: 3 Generations
**Statement**: Exactly 3 fermion generations
**Depends on**: dim(Im(H)) = 3
**Verification**: Structural argument only
**Confidence**: CONJECTURE (plausible but not proven)

---

## Cosmological Claims

### CLAIM-16: |Π| ≈ 10^118
**Statement**: Number of perspectives ≈ 137^55
**Depends on**: CLAIM-13, structure of perspective space
**Verification**: `dark_sections_pi_formula.py` [PASS, 0.4% error]
**Confidence**: CONJECTURE

### CLAIM-17: Visible/Hidden = 58/79
**Statement**: 58 visible channels, 79 hidden
**Depends on**: Structure assumptions (incomplete)
**Verification**: `observable_fraction_analysis.py` [0.12% match to 1/√3]
**Confidence**: CONJECTURE (needs mechanism)

---

## Assumption Impact Matrix

**If [A-COUPLING] is wrong, these claims fail:**

| Claim | Direct/Indirect |
|-------|-----------------|
| CLAIM-14 (sin²θ_W = 1/4) | DIRECT |
| ~200 TeV scale significance | DIRECT |

**If T1 (directed time) is wrong, these claims fail:**

| Claim | Direct/Indirect |
|-------|-----------------|
| CLAIM-1 (F = C) | DIRECT |
| CLAIM-2 (associativity) | DIRECT |
| All downstream claims | INDIRECT |

**If CLAIM-5 (division algebra) is wrong, these claims fail:**

| Claim | Direct/Indirect |
|-------|-----------------|
| CLAIM-6 (n_d ≤ 4) | DIRECT |
| CLAIM-7 (n_c = 11) | DIRECT |
| CLAIM-8 (SM gauge groups) | DIRECT |
| CLAIM-13 (α = 1/137) | DIRECT |
| All gauge/particle claims | INDIRECT |

---

## Verification Script Mapping

| Claim | Primary Script | Status |
|-------|---------------|--------|
| CLAIM-5 | `division_algebra_gap_analysis.py` | PASS |
| CLAIM-6 | `associativity_requirement.py` | PARTIAL |
| CLAIM-8 | `gauge_groups_derivation.py` | PASS |
| CLAIM-9 | `gauge_dimension_rank_analysis.py` | PASS |
| CLAIM-11 | `hypercharge_derivation.py` | PASS |
| CLAIM-12 | `baryon_number_uniqueness.py` | PASS |
| CLAIM-13 | `alpha_137_verification_clean.py` | PASS |
| CLAIM-14 | `weinberg_angle_running.py` | PASS* |

*PASS for calculation, but doesn't verify [A-COUPLING]

---

## How to Use This Document

### When an assumption changes:
1. Find the assumption in the matrix above
2. List all claims that depend on it (direct + indirect)
3. Re-evaluate each dependent claim
4. Update VERIFICATION_STATUS if scripts need re-running

### When adding a new claim:
1. Add entry with all dependencies
2. Add to impact matrix for relevant assumptions
3. Link verification script if exists
4. Assign confidence level

### When a claim is falsified:
1. Mark claim as FALSIFIED with date
2. Move to "Failed Claims" section
3. Update all claims that depended on it
4. Document lesson learned

---

*Last updated: 2026-01-27*
