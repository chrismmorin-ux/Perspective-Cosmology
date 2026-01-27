# Formalization Gap Analysis

**Created**: 2026-01-27
**Updated**: 2026-01-27 (corrected AXM_0106 analysis)
**Purpose**: Track what needs to be formalized into atomic units

---

## Issue Status

**TWO AXIOM SYSTEMS EXIST — Need reconciliation (NOT contradiction)**

| System | Location | Status |
|--------|----------|--------|
| **Old** | `core/axioms/AXM_0100-0108` | Formalized, tagged, still valid |
| **New** | `framework/layer_0_pure_axioms.md` | Current thinking, NOT YET formalized |

**CORRECTION**: AXM_0106 (Non-Invertibility of ACCESS MAP) does NOT contradict T0 (Invertibility of TRANSITIONS). These are different concepts:
- AXM_0106: Access map A loses information (many global states → same appearance)
- T0: Transitions between perspectives are invertible (can go back)

Both are true simultaneously. No contradiction.

---

## Axiom Mapping (Old → New)

| Old (core/axioms/) | New (layer_0) | Status |
|-------------------|---------------|--------|
| AXM_0100: Finiteness | C5: Cardinality | COMPATIBLE |
| AXM_0101: Connectivity | (implicit in Π structure) | COMPATIBLE |
| AXM_0102: Non-Triviality | P2: Non-Triviality | MATCH |
| AXM_0103: Closure | (implicit in V_Crystal) | COMPATIBLE |
| AXM_0104: Partiality | P1: Partiality | MATCH |
| AXM_0105: Locality | (derived from P3) | COMPATIBLE |
| AXM_0106: Non-Invertibility | Still valid (ACCESS map) | **CLARIFIED (S72)** |
| AXM_0107: Non-Negative Loss | Physical constraint | REVIEW status |
| AXM_0108: Time Scale | Physical import | REVIEW status |
| AXM_0109 | C1: Existence | **DONE (S72)** |
| AXM_0110 | C2: Perfect Orthogonality | **DONE (S72)** |
| AXM_0111 | C3: Completeness | **DONE (S72)** |
| AXM_0112 | C4: Symmetry | **DONE (S72)** |
| AXM_0113 | P3: Finite Access | **DONE (S72)** |
| AXM_0114 | P4: Tilt Possibility | **DONE (S72)** |
| AXM_0115 | **T0: Algebraic Completeness** | **DONE (S72)** |
| AXM_0116 | **T1: Crystal is Timeless** | **DONE (S72)** |

**Note**: AXM_0106 clarified in S72 to explicitly state it's about ACCESS MAPS, not transitions.

---

## Theorems Status

### COMPLETED (Session 72)

| Theorem | Source | Tag | Status |
|---------|--------|-----|--------|
| No Zero Divisors | S54 | THM_0482 | **DONE** |
| Transition Invertibility | S62-63 | THM_0483 | **DONE** |
| Division Algebra Structure | S46-48 | THM_0484 | **DONE** |
| Complex Structure (F=C) | S44 | THM_0485 | **DONE** |

### Still Needed

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

### From S66: Chirality

**Source**: `verification/sympy/chirality_identification_derivation.py`
**Claim**: Left-handed coupling from phi_L embedding
**Confidence**: DERIVED
**Needs**: THM_0487_chirality.md

---

## Definitions Needing Formalization

| Concept | Source | Needs |
|---------|--------|-------|
| Transition algebra 𝒯 | layer_0 v2.4 | DEF_02A2_transition_algebra.md |
| Tilt matrix ε_ij | layer_0 §8 | DEF_02A3_tilt_matrix.md |
| Imperfect dimension | investigations/imperfect_dimensions | DEF_02A4_imperfect_dimension.md |
| Recrystallization | investigations/forces_as_recrystallization | DEF_02A5_recrystallization.md |

---

## Tag Registry Updates — COMPLETED (Session 72)

### Axioms Added
| Tag | Name | Status |
|-----|------|--------|
| 0109 | Crystal Existence (C1) | **DONE** |
| 0110 | Perfect Orthogonality (C2) | **DONE** |
| 0111 | Crystal Completeness (C3) | **DONE** |
| 0112 | Crystal Symmetry (C4) | **DONE** |
| 0113 | Finite Access (P3) | **DONE** |
| 0114 | Tilt Possibility (P4) | **DONE** |
| 0115 | Algebraic Completeness (T0) | **DONE** |
| 0116 | Crystal Timeless (T1) | **DONE** |

### Axioms Clarified (NOT deprecated)
| Tag | Name | Action |
|-----|------|--------|
| 0106 | Non-Invertibility | Clarified: ACCESS MAP (no contradiction with T0) |

### Theorems Added
| Tag | Name | Status |
|-----|------|--------|
| 0482 | No Zero Divisors | **DONE** |
| 0483 | Transition Invertibility | **DONE** |
| 0484 | Division Algebra Structure | **DONE** |
| 0485 | Complex Structure (F=C) | **DONE** |

### Still Needed

**Theorems**:
| Tag | Name | Source |
|-----|------|--------|
| 0486 | SM Gauge Groups | S46-48 |
| 0487 | Chirality | S66 |

**Derivations**:
| Tag | Name | Source |
|-----|------|--------|
| 0A00 | Baryon Number | S57 |
| 0A01 | Hypercharge Values | S49 |
| 0A02 | Weinberg Angle | S52 (requires [A-COUPLING]) |

---

## Priority Actions

### COMPLETED (Session 72)
1. ~~Delete or deprecate AXM_0106~~ — **NOT NEEDED** (different concept, clarified)
2. ~~Add T0 to axioms~~ — **DONE** (AXM_0115)
3. ~~Formalize no zero divisors~~ — **DONE** (THM_0482)
4. ~~Formalize invertibility~~ — **DONE** (THM_0483)
5. ~~Add new axioms C1-C5, P1-P4, T1~~ — **DONE** (AXM_0109-0116)
6. ~~Update tag_registry~~ — **DONE**

### Remaining
7. Formalize SM gauge groups theorem (THM_0486)
8. Formalize chirality theorem (THM_0487)
9. Add derivation files (DRV_xxxx)
10. Create atomic files for new definitions (tilt matrix, transition algebra)

---

## Verification of Reconciliation

**Session 72 verification**:
- [x] Core axioms from layer_0_pure_axioms.md now have AXM files (C1-C4, P3-P4, T0-T1)
- [x] Core theorems from S44-65 now have THM files (4 of ~7)
- [x] No contradictions between old and new systems (AXM_0106 clarified)
- [x] tag_registry updated with all changes

**Still to verify**:
- [ ] All theorems in DERIVATION_CHAIN_AUDIT have THM files (need THM_0486, 0487)
- [ ] All claims in CLAIM_DEPENDENCIES have formal files
- [ ] Derivation files created for physics derivations

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
