# Quality Engine Report
**Run date**: 2026-02-03
**Run number**: 2
**Previous issues**: 104 (Run 1, 2026-02-02)
**Current issues**: 332
**Trend**: EXPANDED SCAN (deeper coverage, not degradation — see notes)

> **Trend note**: Run 2 scanned more thoroughly than Run 1 (29 missing scripts found, 42 stale files vs 6, 21 orphaned scripts vs 0). The increase from 104 to 332 reflects scan depth, not repo degradation. Key improvements since Run 1: THM_0497 mismatch resolved, 2 orphaned investigation files added to INDEX, core files remain 100% compliant.

## Summary
- Phase 1 (Structural): 254 issues (0 auto-fixed; 34 broken refs, 100 missing headers, 22 orphans, 98 size violations)
- Phase 2 (Content): 64 issues (7 untagged claims, 3 unverified calculations, 4 incomplete chains, 50 stale files)
- Phase 3 (Consistency): 14 issues (5 status mismatches, 2 dependency gaps, 3 layer purity, 4 terminology)
- Phase 4: 15 investigations scored, 5 honorable mentions

## Critical Issues (Must Fix)

### 1. 29 missing verification scripts referenced from markdown
**Severity**: CRITICAL | **Phase**: 1.1
Scripts mentioned in .md files but not on disk. Most are in older investigation files: `crystallization_dynamics.md` (5 scripts), `forces_as_localized_recrystallization.md` (3), `white_holes_as_nucleation.md` (2), `collider_data_validation.md` (3), `prime_attractor_physical_mapping.md` (3). These represent documented calculations that cannot be verified.
**Fix**: Create scripts for active claims, or remove references for archived/deprecated claims.

### 2. 90 investigation files (62%) lack "Last Updated" header
**Severity**: CRITICAL | **Phase**: 1.2
No modification tracking on most investigations. Impossible to assess staleness without manual git log checks.
**Fix**: Batch-add Last Updated fields. Can be scripted from git log.

### 3. registry/derivations_summary.md = 121 KB (708% over 15KB limit)
**Severity**: CRITICAL | **Phase**: 1.4
Largest .md file in repo. Already split partially into `registry/derivations/` subdirectory but the main file was not reduced.
**Fix**: Complete the split — move remaining content to domain files, replace main file with an index.

### 4. 42 ACTIVE investigation files not touched in 20+ sessions
**Severity**: HIGH | **Phase**: 2.4
Most stale: `forces_as_localized_recrystallization.md` (Session 2, 203 sessions ago), `comparison_channels_and_running.md` (Session 25, 180 sessions ago). These ACTIVE labels are misleading.
**Fix**: Batch-reclassify to ARCHIVE or SUPERSEDED. Top 10 most stale listed in Phase 2 details.

### 5. n_c decomposition inconsistency across 5+ files
**Severity**: HIGH | **Phase**: 3.4
CR-010 established canonical form `n_c = Im(C) + Im(H) + Im(O) = 1+3+7 = 11`. Non-canonical `dim(R)+dim(C)+dim(O) = 1+2+8` still appears in `claims/TIER_1_SIGNIFICANT.md` (with erroneous `- dim(H)` artifact), `registry/CLAIM_DEPENDENCIES.md`, `core/theorems/THM_0484`, and 2 registry files.
**Fix**: Standardize all to canonical Im-form. Fix the erroneous `- dim(H)` in TIER_1.

## Investigation Priorities (Top 10)

| Rank | Investigation | Score | D | G | F | E | Next Action |
|------|--------------|-------|---|---|---|---|-------------|
| 1 | Herm(2) = spacetime (spectral geometry) | 14.4 | 9 | 4 | 2 | 2 | Apply Connes spectral triple to M_2(C) |
| 2 | CMB: Om_m = 63/200 mechanism | 13.3 | 8 | 4 | 3 | 3 | Derive from crystallization or SO(11) Goldstone thermalization |
| 3 | Alpha: Step 5 mechanism (democratic counting) | 10.7 | 8 | 4 | 2 | 3 | Derive gauge kinetic term normalization |
| 4 | CC wrong sign (F-10) | 9.3 | 7 | 4 | 2 | 3 | Find correct-sign potential or archive |
| 5 | CMB: V0 inflationary amplitude | 8.0 | 6 | 4 | 3 | 4 | Search for energy scale from SO(11) breaking |
| 6 | Cyclotomic 43 pattern (v/m_p + m_mu/m_e) | 8.0 | 4 | 4 | 2 | 1 | Investigate structural origin of Phi_6(7)=43 |
| 7 | Dark matter: 5 GeV mass mechanism | 7.5 | 5 | 4 | 3 | 4 | Derive production cross-section |
| 8 | Coset volume fraction (Weinberg angle) | 7.3 | 6 | 4 | 2 | 3 | Derive sin^2=28/121 from dynamics |
| 9 | QCD string tension: lattice 17/24 | 7.5 | 3 | 3 | 3 | 2 | Literature check of lattice data |
| 10 | Mass scale f derivation | 7.0 | 5 | 4 | 2 | 3 | Derive from gravity/crystallization |

See `registry/INVESTIGATION_PRIORITIES.md` for full rankings with justifications.

## Full Findings

### Phase 1: Structural

#### 1.1 Broken References

**Broken markdown hyperlinks (5)**: All in `framework/investigations/meta/axiom_unification.md` — wrong relative paths using `../../` which resolve to `framework/` subtree instead of repo root.

**Missing referenced verification scripts (29)**:
Top offenders by file:
- `crystallization_dynamics.md`: 5 missing (`crystallization_potential.py`, `slow_roll_parameters.py`, `spectral_index_derivation.py`, `sound_horizon_integral.py`, `peak_height_ratios.py`)
- `forces_as_localized_recrystallization.md`: 3 missing (`electroweak_geometry.py`, `mass_from_localization.py`, `subspace_embeddings.py`)
- `collider_data_validation.md`: 3 missing (`qgp_tilt_barrier.py`, `r_ratio_tilt_counting.py`, `running_coupling_crystallization.py`)
- `prime_attractor_physical_mapping.md`: 3 missing (`composite_structure_test.py`, `prime_attractor_abundance.py`, `representation_prime_mapping.py`)
- `white_holes_as_nucleation.md`: 2 missing (`bh_wh_time_reversal.py`, `cosmological_nucleation.py`)
- Remaining 13 scattered across 10+ files

**Missing core entity references (28 IDs)**: Nearly all in archived/deprecated documents. Only `AXM_0120` (in THM_04AA as hypothetical future axiom) is in an active file. LOW severity.

#### 1.2 Missing Headers

| Category | Total | Missing | Compliance |
|----------|-------|---------|------------|
| Core axioms (Status) | 20 | 0 | 100% |
| Core definitions (Status) | 64 | 0 | 100% |
| Core theorems (Status) | 54 | 0 | 100% |
| Investigations (Status) | 145 | 1 | 99.3% |
| Investigations (Created) | 145 | 7 | 95.2% |
| Investigations (Last Updated) | 145 | 90 | 37.9% |
| Sessions (Date/Focus) | 56 | 2 | 96.4% |

Missing Status: 1 file (`meta/SESSION_2026-01-26_SUMMARY.md`).
Missing Created: 7 files (mostly READMEs and early content files).
Missing Last Updated: 90 files — systemic gap, 62% of investigations.
Missing Date/Focus: 2 supplementary files (`S160_continuation.md`, `S196_continuation_prompt.md`).

#### 1.3 Orphaned Files

- **0 orphaned investigation files** (improved from 2 in Run 1 — both were added to INDEX)
- **1 phantom INDEX entry**: `CRYSTALLIZATION_CATALOG.md` listed in `_INDEX.md` but lives at `framework/CRYSTALLIZATION_CATALOG.md`, not under `investigations/`
- **21 orphaned verification scripts** (3.9% of 540) — scripts not referenced from any .md file. Includes exploration scripts (`high_prime_*.py` family), one-off tests, and superseded analyses.
- **sessions/INDEX.md at 9.1 KB** — 78% over the 5 KB limit from CLAUDE.md

#### 1.4 Size Violations

| Category | Violations | Count | Worst Offender |
|----------|-----------|-------|----------------|
| Investigations > 30KB | 12 | 12/145 (8%) | crystallization_dynamics.md (59 KB) |
| Sessions > 10KB | 0 | 0/56 | — |
| Scripts > 20KB | 73 | 73/540 (14%) | per_sector_induced_couplings.py (43 KB) |
| Registry > 15KB | 12 | 12/~25 (48%) | derivations_summary.md (121 KB) |
| **Total** | **97** | | |

Top 5 oversized investigations: crystallization_dynamics.md (59KB), forces_as_localized_recrystallization.md (55KB), imperfect_dimensions_and_recrystallization.md (49KB), primes_and_recrystallization_unified.md (45KB), multi_coupling_tilt_angles.md (38KB).

Top 5 oversized registry: derivations_summary.md (121KB), ACHIEVEMENTS_LOG.md (72KB), derivations/cosmology_derivations.md (44KB), PHYSICS_CHECKLIST.md (43KB), STATUS_DASHBOARD.md (29KB, frozen).

### Phase 2: Content

#### 2.1 Untagged Claims (7 findings)

| File | Claim | Severity | Suggested Tag |
|------|-------|----------|---------------|
| THM_04A1 crystal_decomposition:22 | "interface has dim = 137 DOF" | HIGH | [CONJECTURE] |
| THM_04A1:56-59 | Dark matter mass, SU(7), visible fraction | HIGH | [CONJECTURE] each |
| THM_04A0 associativity_filter:25 | "forces n_d=4 and n_c=11" | MEDIUM | [DERIVATION] inline |
| acoustic_oscillations.md:68-79 | Framework decomposition of numerators | MEDIUM | [CONJECTURE] |
| higgs_vev_derivation.md:51 | "alpha^8 from octonion dimension" | MEDIUM | [DERIVATION] |
| peak_heights.md:53 | R_* = 0.619 computed value | LOW | [D+I] |
| THM_0486 mirror_spacetime:71 | "alpha from framework prime 137" | MEDIUM | [A-PHYSICAL] |

#### 2.2 Unverified Calculations (3 issues, 4 PASS)

| File | Calculation | Status |
|------|-----------|--------|
| dark_sector_from_partiality.md | Multiple numerical claims | **UNVERIFIED** — no scripts referenced (HIGH) |
| crystallization_dynamics.md:360-366 | n_s=0.965, r=7/200=0.035 | **UNVERIFIED** — 5 planned scripts never created (MEDIUM) |
| crystallization_stress_cosmology.md:268 | Lambda ~ 2.82e-122 | QUARANTINE — no standalone script (LOW, already quarantined) |
| ALPHA_DERIVATION_MASTER.md | 4 scripts | PASS |
| acoustic_oscillations.md | 3 scripts | PASS |
| peak_heights.md | peak_height_physics.py | PASS |
| mixing_angles_division_algebra.md | ckm_completion_search.py | PASS |

#### 2.3 Incomplete Derivation Chains (4 issues, 1 PASS)

| File | Issue | Severity |
|------|-------|----------|
| THM_0498 quartic_discriminant:27-34 | 8 steps with NO [A]/[I]/[D] tags | HIGH |
| THM_0486 mirror_spacetime:71 | Layer 1 arithmetic + Layer 2 identification conflated under single [D] | MEDIUM |
| THM_04A1 crystal_decomposition:56-59 | Implications stated with [A-PHYSICAL] but no derivation steps | MEDIUM |
| acoustic_oscillations.md:102 | r_s tagged [D] but has been FALSIFIED | MEDIUM |
| THM_04A6 spin_statistics | Well-tagged cascade | PASS |

#### 2.4 Stale Content (50 items)

**42 ACTIVE investigation files** not referenced in last 20 sessions:
- 10 extremely stale (100+ sessions): forces_as_localized_recrystallization (S2), comparison_channels (S25), crystal_dimension_reduction (S30), alpha_137_session_34_notes (S34), pi_derivation_attempt (S34), dark_sector_from_partiality (S36), perspective_mutations (S38), mass_hierarchy (S50), fermion_multiplets (S50), imperfect_dimensions (S56)
- 32 moderately stale (20-100 sessions)

**8 stale registry files**:
- HALLUCINATION_LOG.md (S90, 115 sessions)
- PARAMETER_FREEZE.md (S120, 85 sessions)
- HYPOTHESIS_TESTING_PROTOCOL.md (S124, 81 sessions)
- emerging_patterns.md (S151, 54 sessions)
- DEAD_ENDS.md (S148, 57 sessions)
- CMB_PHYSICS_PLAN.md (S170, 35 sessions)
- divergence_registry.md (S177, 28 sessions)
- FALSIFICATION_REGISTRY.md (S176, 29 sessions)

### Phase 3: Consistency

#### 3.1 Status Mismatches (5 found, 1 resolved)

| ID | Issue | Severity | Fix |
|----|-------|----------|-----|
| 3.1.1 | THM_04A4: DERIVATION in CLAIM_DEPENDENCIES, SKETCH in core | MEDIUM | Update deps to SKETCH |
| 3.1.2 | THM_0487: SKETCH in CLAIM_DEPENDENCIES, DERIVATION in core | MEDIUM | Update deps to DERIVATION |
| 3.1.3 | THM_04A3: 18/18 in CLAIM_DEPENDENCIES, 17/18 in core | LOW | Update deps to 17/18 |
| 3.1.4 | THM_0491 listed as SKETCH in THM_04A2 (actually CANONICAL) | MEDIUM | Update 3 lines in THM_04A2 |
| 3.1.5 | THM_0494 listed as SKETCH in THM_04A2 (actually DERIVATION) | LOW | Update THM_04A2 gap table |
| 3.1.6 | THM_0497 — now consistent | RESOLVED | No action (fixed since Run 1) |

#### 3.2 Dependency Violations (2 found)

- THM_04A2 gap table outdated re: THM_0491 promotion to CANONICAL (MEDIUM)
- AXM_0112 missing from CLAIM_DEPENDENCIES axiom listing (LOW)
- No circular dependencies detected
- No confidence inversions detected

#### 3.3 Layer Purity (3 violations)

| ID | Issue | Severity |
|----|-------|----------|
| 3.3.1 | AXM_0117 "Provides" section says "gravity"; notes say "Big Bang" | MEDIUM |
| 3.3.2 | AXM_0117 has alpha, M_Pl coefficient conjectures (physics imports in axiom file) | LOW |
| 3.3.3 | AXM_0109 notes mention "quantum mechanics" and "observables" | LOW |

6 other axiom files checked — all clean. THM_04A3, THM_04A4 correctly tagged as Layer 2.

#### 3.4 Terminology (4 issues)

| ID | Issue | Severity |
|----|-------|----------|
| 3.4.1 | n_c decomposition: canonical Im-form vs dim-form in 5+ files | HIGH |
| 3.4.2 | Im_O vs Im(O) notation mixed within files | LOW |
| 3.4.3 | eps vs epsilon vs |eps| vs ||eps|| mixed in AXM_0117 | LOW |
| 3.4.4 | tilt matrix / tilt field / tilt parameter sometimes ambiguous | LOW |

## Improvements Since Run 1

| Item | Run 1 | Run 2 | Status |
|------|-------|-------|--------|
| THM_0497 status mismatch | OPEN | RESOLVED | Fixed between runs |
| Orphaned investigation files | 2 | 0 | Fixed (added to INDEX) |
| Core file header compliance | 100% | 100% | Maintained |
| Broken hyperlinks | 0 | 5 | New file (axiom_unification.md) introduced links |
| Investigation Status compliance | 92% | 99.3% | Improved |

## Proposed Next Actions

1. **Batch-reclassify 42 stale ACTIVE investigations** — change to ARCHIVE/SUPERSEDED. Highest structural leverage (eliminates 42 Phase 2 issues, clarifies what's actually active).
2. **Fix 5 status mismatches** in CLAIM_DEPENDENCIES and THM_04A2 — 5 quick edits.
3. **Standardize n_c decomposition** to canonical Im-form in 5+ files — resolves HIGH terminology issue.
4. **Remove/update 29 missing script references** — either create scripts or remove stale references from older investigation files.
5. **Split registry/derivations_summary.md** — complete the migration to domain files, reduce main file to index.
6. **Fix 5 broken hyperlinks** in axiom_unification.md — correct relative paths.
7. **Backfill Last Updated headers** on 90 investigation files — scriptable batch operation.
8. **Clean AXM_0117 layer purity** — remove physics terms from axiom content area.
