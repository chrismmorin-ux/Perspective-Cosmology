# Formalization Gap Analysis

**Created**: 2026-01-27
**Purpose**: Track what needs to be formalized into atomic units

---

## Critical Issue

**TWO AXIOM SYSTEMS EXIST AND ARE OUT OF SYNC**

| System | Location | Status |
|--------|----------|--------|
| **Old** | `core/axioms/AXM_0100-0108` | Formalized, tagged, but OUTDATED |
| **New** | `framework/layer_0_pure_axioms.md` | Current thinking, but NOT formalized |

This must be reconciled. The recent work (S44-S65) uses the NEW system, but the formal tags point to the OLD system.

---

## Axiom Mapping (Old → New)

| Old (core/axioms/) | New (layer_0) | Status |
|-------------------|---------------|--------|
| AXM_0100: Finiteness | C5: Cardinality | RENAME/UPDATE |
| AXM_0101: Connectivity | (implicit in Π structure) | REVIEW |
| AXM_0102: Non-Triviality | P2: Non-Triviality | MATCH |
| AXM_0103: Closure | (implicit in V_Crystal) | REVIEW |
| AXM_0104: Partiality | P1: Partiality | MATCH |
| AXM_0105: Locality | (derived from P3?) | REVIEW |
| AXM_0106: Non-Invertibility | DEPRECATED (T0 gives invertibility!) | DELETE |
| AXM_0107: Non-Negative Loss | (physical constraint, not axiom) | DEMOTE |
| AXM_0108: Time Scale | (physical import) | MOVE TO IMP |
| — | C1: Existence | ADD |
| — | C2: Perfect Orthogonality | ADD |
| — | C3: Completeness | ADD |
| — | C4: Symmetry | ADD |
| — | P3: Finite Access | ADD |
| — | P4: Tilt Possibility | ADD |
| — | **T0: Algebraic Completeness** | **ADD (S62)** |
| — | **T1: Crystal is Timeless** | **ADD** |

**Critical**: AXM_0106 (Non-Invertibility) is now WRONG — invertibility was DERIVED in S62!

---

## Theorems Needing Formalization

### From S54: No Zero Divisors

**Source**: `framework/investigations/perspective_foundations_and_zero_divisors.md`
**Claim**: T₁ ∘ T₂ ≠ 0 for non-zero transitions
**Confidence**: DERIVED
**Needs**: THM_0482_no_zero_divisors.md

### From S62-63: Invertibility

**Source**: `framework/investigations/invertibility_investigation.md`
**Claim**: Every transition T has inverse T⁻¹
**Confidence**: DERIVED (from T0)
**Needs**: THM_0483_invertibility.md

### From S46-48: Division Algebra Structure

**Source**: `framework/investigations/gauge_from_division_algebras.md`
**Claim**: Transitions form a division algebra (R, C, H, or O)
**Confidence**: DERIVED (from no zero divisors + invertibility + Frobenius)
**Needs**: THM_0484_division_algebra_structure.md

### From S44: Complex Structure

**Source**: `core/17_complex_structure.md`
**Claim**: F = C (field must be complex)
**Confidence**: DERIVED (from T1)
**Needs**: THM_0485_complex_structure.md (or update existing)

### From S46-48: SM Gauge Groups

**Source**: `framework/investigations/gauge_from_division_algebras.md`
**Claim**: SU(3) × SU(2) × U(1) from division algebras
**Confidence**: DERIVED
**Needs**: THM_0486_sm_gauge_groups.md

### From S57: B = 1/3

**Source**: `framework/investigations/baryon_number_derivation.md`
**Claim**: Baryon number = 1/3, uniquely from anomaly cancellation
**Confidence**: DERIVED
**Needs**: DRV_0A00_baryon_number.md (first derivation!)

---

## Definitions Needing Formalization

| Concept | Source | Needs |
|---------|--------|-------|
| Transition algebra 𝒯 | layer_0 v2.4 | DEF_02A2_transition_algebra.md |
| Tilt matrix ε_ij | layer_0 §8 | DEF_02A3_tilt_matrix.md |
| Imperfect dimension | investigations/imperfect_dimensions | DEF_02A4_imperfect_dimension.md |
| Recrystallization | investigations/forces_as_recrystallization | DEF_02A5_recrystallization.md |

---

## Tag Registry Updates Needed

### Axioms to Add
| Tag | Name | Source |
|-----|------|--------|
| 0109 | Crystal Existence (C1) | layer_0 |
| 010A | Perfect Orthogonality (C2) | layer_0 |
| 010B | Crystal Completeness (C3) | layer_0 |
| 010C | Crystal Symmetry (C4) | layer_0 |
| 010D | Finite Access (P3) | layer_0 |
| 010E | Tilt Possibility (P4) | layer_0 |
| 010F | Algebraic Completeness (T0) | layer_0 v2.4 |
| 0110 | Crystal Timeless (T1) | layer_0 |

### Axioms to Deprecate
| Tag | Name | Reason |
|-----|------|--------|
| 0106 | Non-Invertibility | CONTRADICTED by T0 (S62) |

### Theorems to Add
| Tag | Name | Source |
|-----|------|--------|
| 0482 | No Zero Divisors | S54 |
| 0483 | Invertibility | S62 |
| 0484 | Division Algebra Structure | S46-48 |
| 0485 | Complex Structure (F=C) | S44 |
| 0486 | SM Gauge Groups | S46-48 |

### Derivations to Add
| Tag | Name | Source |
|-----|------|--------|
| 0A00 | Baryon Number | S57 |
| 0A01 | Hypercharge Values | S49 |
| 0A02 | Weinberg Angle | S52 (requires [A-COUPLING]) |

---

## Priority Actions

### Immediate (Must Fix)
1. **Delete or deprecate AXM_0106** — it contradicts derived invertibility
2. **Add T0 to axioms** — critical for derivation chain
3. **Formalize no zero divisors** — key theorem from S54
4. **Formalize invertibility** — key theorem from S62

### Soon (Structural)
5. Reconcile old/new axiom systems — either update old or replace
6. Add new axioms C1-C5, P1-P4, T1
7. Update tag_registry with all changes

### Later (Completeness)
8. Formalize all derived theorems
9. Add derivation files (DRV_xxxx)
10. Create atomic files for new definitions

---

## Verification of Reconciliation

When reconciling, check:
- [ ] Every axiom in layer_0_pure_axioms.md has corresponding AXM file
- [ ] Every theorem in DERIVATION_CHAIN_AUDIT has corresponding THM file
- [ ] Every claim in CLAIM_DEPENDENCIES has corresponding formal file
- [ ] No contradictions between old and new systems
- [ ] tag_registry is complete and accurate

---

## Root Cause

**Why did this happen?**

1. layer_0_pure_axioms.md evolved rapidly (v2.0 → v2.4 in sessions 44-65)
2. core/axioms/ files weren't updated in parallel
3. No process required updating formal files when axioms change
4. The "living document" diverged from the "formal structure"

**How to prevent?**

Add to RESEARCH_PROCESS.md:
- When axiom changes in layer_0: MUST update core/axioms/ within same session
- When theorem derived: MUST create THM file before marking DERIVED
- Periodic reconciliation check (every 10 sessions)

---

*This document should be deleted once all gaps are closed.*
