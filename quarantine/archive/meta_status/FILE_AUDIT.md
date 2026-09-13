# File Structure Audit

**Created**: 2026-01-26
**Purpose**: Identify organizational issues and propose atomic restructuring

---

## Critical Issues Found

### 1. DUPLICATE NUMBERED MODULES
```
core/16_dimension_dynamics.md  <- NEW (session 45)
core/16_eddies.md              <- OLD (conflicting number)

core/17_complex_structure.md   <- NEW (session 45)
core/17_theorems.md            <- OLD (conflicting number)
```
**Action**: Renumber old files or merge content

### 2. ROOT CLUTTER (17 planning/status files at root)
```
ALPHA_137_COMPLETE.md
ARCHITECTURE.md
ATOMICITY_MIGRATION_PLAN.md
ATOMICITY_PROPOSAL.md
CONSOLIDATION_STATUS.md
DOCUMENT_INVENTORY.md
EXTRACTION_SESSION_37-39.md
INDEX.md
MIGRATION_FRAMEWORK.md
PHYSICIST_SUMMARY.md
PLAN_ORDERED.md
QUICKSTART.md
REORGANIZATION_PLAN.md
REORGANIZATION_V2.md
RIGOR_PROTOCOL.md
```
**Action**: Move to `meta/` directory

### 3. TWO PARALLEL ORGANIZATIONAL SYSTEMS
```
System A: Numbered modules (core/01_universe.md, core/02_perspective.md...)
System B: Atomic tagged files (core/axioms/AXM_0100_finiteness.md...)
```
**Action**: Choose ONE system and migrate

### 4. OVERLAPPING DIRECTORIES
```
framework/investigations/  <- exploratory work
explorations/              <- also exploratory work
```
**Action**: Consolidate into one location

### 5. SCATTERED ALPHA INVESTIGATIONS
```
physics/constants/alpha_investigation_01.md
physics/constants/alpha_reconstruction_plan.md
framework/investigations/alpha_137_session_34_notes.md
framework/investigations/alpha_formula_derivations.md
framework/investigations/ALPHA_DERIVATION_MASTER.md
ALPHA_137_COMPLETE.md
```
**Action**: Consolidate or archive obsolete ones

---

## Current Directory Structure

```
ROOT (too many files - 30+)
├── core/                    # 18 numbered modules + atomic subdirs
│   ├── axioms/              # 9 atomic axiom files
│   ├── definitions/         # 40+ atomic definition files
│   ├── lemmas/              # 3 atomic lemma files
│   └── theorems/            # 18 atomic theorem files
├── framework/               # Layer documents + investigations
│   ├── investigations/      # 25+ investigation files
│   ├── layer_0_*.md         # 2 layer 0 versions
│   ├── layer_1_*.md
│   ├── layer_2_*.md
│   └── layer_3_*.md
├── physics/                 # Physical interpretations
│   ├── conjectures/         # 3 conjecture files
│   ├── constants/           # 10+ constant investigations
│   └── imports/             # 8 import declarations
├── explorations/            # Alternative investigations
├── registry/                # Tracking files
├── references/              # External references
├── verification/            # Python scripts
│   └── sympy/               # 20 verification scripts
├── archive/                 # Deprecated content
└── quarantine/              # Problematic content
```

---

## Proposed Restructure

### Option A: Numbered Module Primary (Current Direction)
```
core/
├── 00_notation.md
├── 01_universe.md
...
├── 17_complex_structure.md
├── 18_dynamics.md
└── DEPRECATED/              # Move 16_eddies, 17_theorems here

meta/                        # NEW - all planning/status
├── CLAUDE.md
├── ARCHITECTURE.md
├── plans/
└── status/

investigations/              # MERGE framework/investigations + explorations
├── active/
├── resolved/
└── archived/
```

### Option B: Atomic Primary (Full Migration)
```
axioms/
├── AXM_0100_finiteness.md
...

definitions/
├── DEF_0200_notation.md
...

theorems/
├── THM_0410_self_inaccessibility.md
...

derivations/                 # NEW - derived results
├── DRV_0500_alpha_137.md
├── DRV_0501_gauge_groups.md
...

conjectures/
├── CNJ_0800_high_gamma_qm.md
...
```

---

## Immediate Actions Needed

### Priority 1: Fix Numbering Conflicts
- [ ] Renumber `core/16_eddies.md` -> `core/19_eddies.md` or archive
- [ ] Renumber `core/17_theorems.md` -> `core/20_theorems.md` or archive

### Priority 2: Clean Root Directory
- [ ] Create `meta/` directory
- [ ] Move planning files to `meta/plans/`
- [ ] Move status files to `meta/status/`
- [ ] Keep only CLAUDE.md and README.md at root

### Priority 3: Consolidate Investigations
- [ ] Merge `explorations/` into `framework/investigations/`
- [ ] Archive completed/obsolete investigations
- [ ] Keep only active work in investigations/

### Priority 4: Choose Organizational System
- [ ] Decide: numbered modules OR atomic tagged files
- [ ] Migrate whichever is secondary into primary
- [ ] Document the chosen system

---

## File Counts by Directory

| Directory | Count | Status |
|-----------|-------|--------|
| ROOT | 30+ | TOO MANY |
| core/ | 18 + 70 atomic | DUPLICATE SYSTEMS |
| framework/ | 30+ | MESSY |
| physics/ | 40+ | OK but scattered |
| explorations/ | 10 | MERGE INTO framework/ |
| registry/ | 8 | OK |
| references/ | 10 | OK |
| verification/ | 20 | OK |

---

## Recommendation

**Use Option A (Numbered Modules)** because:
1. Already have 18 core modules written this way
2. Easier to read sequentially
3. Atomic files can be generated from modules if needed
4. Less migration work

**Archive the atomic subdirectories** (core/axioms/, core/definitions/, etc.) since:
1. They duplicate content in numbered modules
2. They're incomplete (not all content extracted)
3. They add cognitive load

---

*This audit should be reviewed and a decision made before further content creation.*
