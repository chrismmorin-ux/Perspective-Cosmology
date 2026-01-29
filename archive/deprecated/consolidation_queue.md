# Consolidation Queue

**Updated**: 2026-01-26
**Purpose**: Track documents waiting for consolidation into atomic structure

---

## How This Works

1. **You** get a document to a stopping point
2. **Say** "Ready to consolidate [filename]"
3. **I** will:
   - Extract atomic units (AXM/DEF/THM/IMP/CNJ/DRV)
   - Build continuation prompt
   - Create work items in potential_work.md
   - Update tag registry
   - Commit

---

## Queue: Investigations (framework/investigations/)

| File | Lines | Status | Priority |
|------|-------|--------|----------|
| dark_sections_and_pi_formula.md | ~459 | WAITING | ? |
| dark_sector_from_partiality.md | ~221 | WAITING | ? |
| pi_derivation_attempt.md | ~429 | WAITING | ? |
| continuous_visibility_model.md | new | WAITING | ? |
| perspective_mutations.md | new | WAITING | ? |

---

## Queue: Modified Core Files

| File | Status | Priority |
|------|--------|----------|
| framework/layer_0_pure_axioms.md | MODIFIED | HIGH |
| physics/alpha_crystal_interface.md | MODIFIED | ? |
| explorations/primes_from_orthogonality/perspective_connection.md | MODIFIED | ? |

---

## Queue: Verification Scripts (verification/sympy/)

These don't need atomic extraction but should be committed:

| Script | Purpose |
|--------|---------|
| alpha_137_comprehensive_verification.py | ? |
| continuous_visibility_model.py | ? |
| dark_sections_pi_formula.py | ? |
| dark_sector_mapping.py | ? |
| fermion_visibility_analysis.py | ? |
| gauge_group_from_tilts.py | ? |
| grassmannian_55_connection.py | ? |
| interface_state_counting.py | ? |
| multiplication_from_perspective.py | ? |
| observable_fraction_analysis.py | ? |
| pi_derivation_mathematics.py | ? |
| rg_flow_selection.py | ? |

---

## Completed Consolidations

| File | Date | Atomic Tags Created |
|------|------|---------------------|
| (none yet) | | |

---

## Instructions for User

When you're ready, just say one of:
- "Ready to consolidate dark_sections_and_pi_formula.md"
- "Ready to consolidate layer_0_pure_axioms.md"
- "Consolidate all verification scripts"

I'll handle the extraction and tracking.
