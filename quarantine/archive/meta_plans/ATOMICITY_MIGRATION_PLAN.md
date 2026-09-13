# Atomicity Migration Plan

**Created**: 2026-01-26
**Goal**: Migrate all Perspective Cosmology content to atomic, tagged structure
**Estimated Scope**: ~150-200 atomic files from ~30 current files

---

## Phase 0: Infrastructure Setup

### 0.1 Create Directory Structure
```
core/
├── axioms/
├── definitions/
├── theorems/
├── lemmas/
physics/
├── imports/
├── conjectures/
├── derivations/
├── investigations/
archive/
├── legacy/          # Original files preserved
├── sessions/        # Old session logs
registry/
├── tag_registry.md  # Master tag list
├── dependency_graph.md
└── migration_status.md
```

### 0.2 Create Tag Registry Template
```markdown
# Tag Registry

| Tag | Type | Name | File | Status | Migrated |
|-----|------|------|------|--------|----------|
```

### 0.3 Create Atomic File Template
```markdown
# [TAG] [Type]: [Name]

**Tag**: XXXX
**Type**: AXIOM | DEFINITION | THEOREM | LEMMA | CONJECTURE | DERIVATION | IMPORT
**Status**: CANONICAL | ACTIVE | QUARANTINE
**Source**: [original file this was extracted from]

---

## Requires
- [none] or [TAG: description]

## Provides
- [symbol or result]

---

## Statement

[content]

---

## Notes
[optional context]
```

---

## Phase 1: Inventory & Tag Assignment

### 1.1 Inventory All Atomic Units

Extract from each file:

| Source File | Estimated Units |
|-------------|-----------------|
| core/01_universe.md | 4 axioms, 3 lemmas, 6 definitions = ~13 |
| core/02_perspective.md | 3 axioms, 1 theorem, 5 definitions = ~9 |
| core/03_propagation.md | 3 theorems, 4 definitions = ~7 |
| core/04_adjacency.md | 1 axiom, 2 theorems, 3 definitions = ~6 |
| core/05_overlap.md | 3 theorems, 3 definitions = ~6 |
| core/06_basis_geometry.md | 3 theorems, 4 definitions = ~7 |
| core/07_information.md | 3 theorems, 4 definitions = ~7 |
| core/08_time.md | 3 theorems, 3 definitions = ~6 |
| core/09_trajectory.md | 4 definitions = ~4 |
| core/10_entropy.md | 1 theorem, 2 definitions = ~3 |
| core/11_perspective_space.md | 5 definitions = ~5 |
| core/12_topology.md | 4 definitions, 1 conjecture = ~5 |
| core/13_crystallinity.md | 1 theorem, 3 definitions = ~4 |
| core/14_dimensional_stability.md | 4 definitions = ~4 |
| core/15_nucleation.md | 3 definitions, 1 conjecture = ~4 |
| core/16_eddies.md | 1 theorem, 4 definitions = ~5 |
| core/17_theorems.md | Reference doc, keep as index = ~1 |
| core/18_dynamics.md | 3 theorems, 4 definitions, 1 axiom = ~8 |
| **Core subtotal** | **~104 units** |
| physics/alpha_crystal_interface.md | 1 conjecture, 3 sub-claims = ~4 |
| physics/gauge_structure.md | 1 speculation, 4 claims = ~5 |
| physics/quantum_limit.md | 1 conjecture, claims = ~4 |
| physics/gravity_limit.md | 1 speculation = ~2 |
| physics/h_gamma_investigation.md | 1 derivation = ~2 |
| physics/other files (~15) | ~30 units |
| **Physics subtotal** | **~47 units** |
| layer_2_correspondence.md | ~20 imports = ~20 |
| assumptions_registry.md | ~15 assumptions = ~15 |
| **Imports/Assumptions** | **~35 units** |
| **TOTAL ESTIMATED** | **~186 atomic units** |

### 1.2 Tag Allocation Scheme

```
0000-00FF: Reserved/Meta
0100-01FF: Core Axioms (AXM)
0200-03FF: Core Definitions (DEF)
0400-05FF: Core Theorems/Lemmas (THM/LEM)
0600-07FF: Physics Imports (IMP)
0800-09FF: Physics Conjectures (CNJ)
0A00-0BFF: Physics Derivations (DRV)
0C00-0FFF: Reserved for expansion
```

### 1.3 Create Initial Tag Registry

Go through each source file, identify atomic units, assign tags.

---

## Phase 2: Core Module Migration

### 2.1 Migration Order (Dependency-Respecting)

Must migrate in order so that `Requires` references exist:

```
Round 1 (no dependencies):
  - 00_notation.md → DEF_0200_notation.md (conventions)

Round 2 (depends on notation only):
  - 01_universe.md axioms → AXM_0100 through AXM_0107
  - 01_universe.md definitions → DEF_0201 through DEF_0206

Round 3 (depends on universe):
  - 02_perspective.md → AXM_0108-010A, DEF_0210-0215
  - 06_basis_geometry.md → DEF_0240-0245, THM_0400-0402
  - 12_topology.md → DEF_0280-0284

Round 4 (depends on perspective):
  - 03_propagation.md → DEF_0220-0224, THM_0410-0412
  - 04_adjacency.md → AXM_010B, DEF_0225-0228, THM_0420-0421
  - 11_perspective_space.md → DEF_0270-0275

Round 5 (depends on adjacency):
  - 05_overlap.md → DEF_0230-0233, THM_0430-0432
  - 07_information.md → DEF_0250-0254, THM_0440-0442
  - 08_time.md → DEF_0260-0263, THM_0450-0452

Round 6 (depends on overlap/time):
  - 09_trajectory.md → DEF_0264-0268
  - 10_entropy.md → DEF_0268-026A, THM_0460
  - 18_dynamics.md → AXM_010C, DEF_02A0-02A4, THM_0470-0472

Round 7 (depends on entropy/perspective_space):
  - 13_crystallinity.md → DEF_0285-0288, THM_0480
  - 14_dimensional_stability.md → DEF_0290-0294

Round 8 (depends on crystallinity):
  - 15_nucleation.md → DEF_0295-0298, CNJ_0800
  - 16_eddies.md → DEF_029A-029E, THM_0490

Round 9 (summary):
  - 17_theorems.md → Keep as THM_INDEX.md (reference document)
```

### 2.2 Per-File Migration Process

For each source file:

1. **Read** the file completely
2. **Identify** each atomic unit (axiom, definition, theorem, lemma)
3. **Assign** tag from pre-allocated range
4. **Create** new atomic file with template
5. **Fill in** Requires (referencing already-migrated tags)
6. **Update** tag_registry.md
7. **Verify** the atomic file is self-contained

### 2.3 Validation After Each Round

- All `Requires` references resolve to existing tags
- No circular dependencies within round
- Each atomic file < 150 lines
- Tag registry is current

---

## Phase 3: Physics Module Migration

### 3.1 Imports First

Extract from layer_2_correspondence.md:

```
IMP_0600: n_space = 3
IMP_0601: n_color = 3
IMP_0602: n_weak = 2
IMP_0603: n_EM = 1
IMP_0604: Field = Complex
IMP_0605: |Pi| ~ 10^118
IMP_0606: tau_0 = t_Planck
IMP_0607: sin2_theta_W_GUT = 3/8
IMP_0608: n_total = 11 (M-theory)
...
```

### 3.2 Conjectures

```
CNJ_0800: High-gamma = QM
CNJ_0801: Low-gamma = GR
CNJ_0802: Alpha from crystal interface
CNJ_0803: sin2_theta_W from dimensions
CNJ_0804: |Pi| from alpha and n_crystal
...
```

### 3.3 Derivations

```
DRV_0A00: h(gamma) = 2*gamma*(1-gamma)
DRV_0A01: Gamma_dec = (1-2*gamma)/tau_0
DRV_0A02: Asymmetry A(gamma) = 2*gamma - 1
...
```

---

## Phase 4: Session Log & Investigation Migration

### 4.1 Archive Session Log

```
session_log.md → archive/sessions/session_log_2026-01-26.md
```

Create new minimal session log:

```markdown
# Session Log

See archive/sessions/ for historical sessions.

## Active Session

[current session only]
```

### 4.2 Archive Investigations

```
framework/investigations/* → archive/investigations/
explorations/* → archive/explorations/
```

Keep only active investigations in main tree.

---

## Phase 5: Create Index & Navigation Files

### 5.1 Master Index

```markdown
# Perspective Cosmology - Atomic Index

## Core Axioms (AXM_01xx)
- [AXM_0100](core/axioms/AXM_0100_universe_exists.md): Universe exists
- [AXM_0101](core/axioms/AXM_0101_universe_finite.md): Universe finite
...

## Core Definitions (DEF_02xx)
...

## Core Theorems (THM_04xx)
...

## Physics Imports (IMP_06xx)
...

## Physics Conjectures (CNJ_08xx)
...

## Physics Derivations (DRV_0Axx)
...
```

### 5.2 Dependency Graph

Auto-generated from Requires fields:

```
AXM_0100 (Universe exists)
├── DEF_0201 (Points P) requires AXM_0100
├── DEF_0202 (Simplicial complex) requires AXM_0100
│   └── DEF_0225 (Adjacency) requires DEF_0202
│       └── THM_0420 (Irreversibility) requires DEF_0225
...
```

### 5.3 Update CLAUDE.md

Point to new structure, update workflows.

---

## Phase 6: Validation & Cleanup

### 6.1 Validation Checks

- [ ] All tags in registry have corresponding files
- [ ] All files have valid tags in registry
- [ ] All Requires references resolve
- [ ] No circular dependencies
- [ ] All files < 150 lines
- [ ] No orphaned content (everything migrated)

### 6.2 Legacy File Handling

```
mathematical_framework.md → archive/legacy/mathematical_framework.md
[other large files] → archive/legacy/
```

Add note to each: "ARCHIVED: Content migrated to atomic structure. See registry/tag_registry.md"

### 6.3 Git Commit Strategy

One commit per phase:
1. "Create atomic directory structure and templates"
2. "Migrate core axioms and definitions (Round 1-3)"
3. "Migrate core theorems and remaining definitions (Round 4-6)"
4. "Migrate core advanced modules (Round 7-9)"
5. "Migrate physics imports"
6. "Migrate physics conjectures and derivations"
7. "Archive legacy files and create indexes"
8. "Final validation and CLAUDE.md update"

---

## Estimated Effort

| Phase | Tasks | Estimated Files |
|-------|-------|-----------------|
| 0 | Infrastructure | 5-10 |
| 1 | Inventory & Tags | 1 (registry) |
| 2 | Core Migration | ~104 |
| 3 | Physics Migration | ~47 |
| 4 | Archive | ~20 moves |
| 5 | Index & Navigation | ~5 |
| 6 | Validation | 0 (checks only) |
| **Total** | | **~186 new files** |

---

## Success Criteria

1. **No file > 150 lines** (except index files)
2. **Every atomic unit has a permanent tag**
3. **All dependencies explicit and resolvable**
4. **Legacy content archived, not deleted**
5. **CLAUDE.md updated for new workflow**
6. **Tag registry complete and accurate**

---

## Rollback Plan

If migration fails partway:
1. Legacy files preserved in archive/legacy/
2. Git history allows reverting commits
3. Can operate in hybrid mode temporarily

---

*This plan enables systematic migration while preserving all existing work.*
