# Perspective Cosmology - Major Reorganization Plan

**Created**: 2026-01-26
**Purpose**: Consolidate all existing work into a coherent structure for continued development
**Philosophy**: Track what we're building, not what we're proving to observers

---

## Design Principles

1. **Fundamentals First** — The core framework is the foundation; physics interpretations come later
2. **Track Attempts, Not Just Successes** — Failed approaches are as valuable as successes
3. **Connections Over Categories** — What relates to what matters more than where it lives
4. **Living Threads** — Active investigations evolve; status is always current
5. **Preserve Everything** — Nothing gets deleted, only reorganized or archived

---

## New Directory Structure

```
Perspective Universe/
│
├── # FOUNDATION (What we're building from)
├── core/
│   ├── axioms/           [9 files]    ← AXM_01xx (KEEP AS-IS)
│   ├── definitions/      [51 files]   ← DEF_02xx (KEEP AS-IS)
│   ├── theorems/         [20 files]   ← THM_04xx (KEEP AS-IS)
│   ├── lemmas/           [3 files]    ← LEM_04xx (KEEP AS-IS)
│   └── INDEX.md                       ← Quick reference to all units
│
├── # PHYSICS LAYER (Mapping to physical concepts)
├── physics/
│   ├── imports/          [8 files]    ← IMP_06xx (KEEP AS-IS)
│   ├── conjectures/      [3 files]    ← CNJ_08xx (KEEP AS-IS)
│   ├── limits/                        ← NEW: γ→0, γ→1, intermediate
│   └── correspondences/               ← NEW: How framework maps to SM
│
├── # ACTIVE RESEARCH (Living investigations)
├── threads/
│   ├── alpha_137/                     ← The fine structure constant
│   ├── dark_sector/                   ← Hidden content, dark matter/energy
│   ├── primes_orthogonality/          ← Prime emergence from dimensions
│   ├── mutations_time/                ← Perspective mutations as time
│   ├── gauge_emergence/               ← How SM gauge groups emerge
│   └── THREAD_TEMPLATE.md
│
├── # TRACKING (The nervous system)
├── registry/
│   ├── tag_registry.md               ← All permanent tags (KEEP)
│   ├── thread_status.md              ← NEW: Status of all threads
│   ├── connection_map.md             ← NEW: What relates to what
│   ├── open_questions.md             ← NEW: Prioritized questions
│   ├── attempt_log.md                ← NEW: All attempts (success/fail)
│   └── anomalies.md                  ← NEW: Findings that don't fit yet
│
├── # COMPUTATION (Verification and exploration)
├── verification/
│   └── sympy/            [40 files]   ← Python scripts (CONSOLIDATE)
│
├── # REFERENCE (Background material)
├── references/
│   ├── standard_model_reference.md
│   ├── related_theories.md
│   ├── failed_alpha_derivations.md
│   └── literature_notes/
│
├── # ARCHIVE (Preserved but not active)
├── archive/
│   ├── deprecated/                    ← Failed approaches (documented)
│   ├── legacy/                        ← OLD: mathematical_framework.md etc.
│   └── sessions/                      ← OLD: session logs if they get too big
│
├── # ROOT FILES
├── INDEX.md                           ← Master index (ENHANCE)
├── CLAUDE.md                          ← AI guidelines (KEEP)
├── QUICKSTART.md                      ← Quick reference (UPDATE)
└── session_log.md                     ← Work history (KEEP)
```

---

## Phase 1: Create Thread Structure

### 1.1 Create Thread Directories

```
threads/
├── alpha_137/
│   ├── THREAD.md              ← Status, questions, connections
│   ├── approaches/            ← Different approaches tried
│   │   ├── crystal_counting.md
│   │   ├── tilt_angles.md
│   │   └── visibility_fraction.md
│   ├── computations/          ← Relevant SymPy scripts (symlinks or refs)
│   └── findings.md            ← Key results from this thread
│
├── dark_sector/
│   ├── THREAD.md
│   ├── approaches/
│   │   ├── partiality_hidden.md
│   │   ├── mutation_substrate.md
│   │   └── visibility_model.md
│   ├── computations/
│   └── findings.md
│
├── primes_orthogonality/
│   ├── THREAD.md
│   ├── approaches/
│   │   ├── perfect_separation.md
│   │   ├── semi_orthogonal.md
│   │   └── dimensional_layers.md
│   ├── computations/
│   └── findings.md
│
├── mutations_time/
│   ├── THREAD.md
│   ├── approaches/
│   │   ├── mutation_definition.md
│   │   ├── conservation_theorem.md
│   │   └── self_reference.md
│   ├── computations/
│   └── findings.md
│
├── gauge_emergence/
│   ├── THREAD.md
│   ├── approaches/
│   │   ├── aut_decomposition.md
│   │   ├── su3_su2_u1.md
│   │   └── symmetry_breaking.md
│   ├── computations/
│   └── findings.md
```

### 1.2 Thread Template

```markdown
# Thread: [NAME]

**Status**: ACTIVE | PAUSED | BLOCKED | RESOLVED
**Started**: [date]
**Last Updated**: [date]
**Depends On**: [other threads or core units]

---

## Central Question

> What specific question is this thread trying to answer?

---

## Current Position

Where are we right now? What's the best current answer/approach?

---

## Key Findings

| Finding | Source | Confidence | Verified? |
|---------|--------|------------|-----------|
| [what we found] | [approach/file] | HIGH/MED/LOW/SPEC | YES/NO |

---

## Approaches Tried

| Approach | Status | Result | File |
|----------|--------|--------|------|
| [name] | ACTIVE/STALLED/FAILED/SUCCESS | [brief] | [link] |

---

## Open Questions

1. [ ] Question 1
2. [ ] Question 2
3. [ ] Question 3

---

## Blockers

What's preventing progress? What do we need that we don't have?

---

## Connections

### Supports
- [This thread provides input to...]

### Requires
- [This thread needs results from...]

### Tensions
- [This thread has unresolved tension with...]

---

## Next Actions

1. [ ] Specific next step
2. [ ] Specific next step

---

## Log

| Date | Action | Result |
|------|--------|--------|
| [date] | [what was done] | [outcome] |
```

---

## Phase 2: Migration Map

### 2.1 Files to Move to Threads

| Current Location | New Location | Thread |
|------------------|--------------|--------|
| framework/investigations/alpha_137_session_34_notes.md | threads/alpha_137/approaches/ | alpha_137 |
| framework/investigations/tilt_alpha_connection.md | threads/alpha_137/approaches/ | alpha_137 |
| physics/constants/alpha_*.md | threads/alpha_137/approaches/ | alpha_137 |
| physics/constants/sin2_theta_investigation.md | threads/alpha_137/approaches/ | alpha_137 |
| physics/alpha_crystal_interface.md | threads/alpha_137/approaches/ | alpha_137 |
| | | |
| framework/investigations/dark_sector_from_partiality.md | threads/dark_sector/approaches/ | dark_sector |
| framework/investigations/dark_sections_and_pi_formula.md | threads/dark_sector/approaches/ | dark_sector |
| framework/investigations/continuous_visibility_model.md | threads/dark_sector/approaches/ | dark_sector |
| | | |
| explorations/primes_from_orthogonality/* | threads/primes_orthogonality/approaches/ | primes |
| | | |
| framework/investigations/perspective_mutations.md | threads/mutations_time/approaches/ | mutations |
| | | |
| physics/gauge_structure.md | threads/gauge_emergence/approaches/ | gauge |
| physics/field_content_from_orthogonality.md | threads/gauge_emergence/approaches/ | gauge |

### 2.2 Files to Move to physics/limits/

| Current Location | New Location |
|------------------|--------------|
| physics/quantum_limit.md | physics/limits/high_gamma_qm.md |
| physics/gravity_limit.md | physics/limits/low_gamma_gr.md |
| physics/intermediate_gamma.md | physics/limits/intermediate.md |
| physics/intermediate_gamma_analysis.md | physics/limits/intermediate_analysis.md |
| physics/gr_limit_investigation.md | physics/limits/gr_investigation.md |
| physics/h_gamma_investigation.md | physics/limits/h_gamma.md |
| physics/gamma_dec_investigation.md | physics/limits/decoherence.md |

### 2.3 Files to Move to physics/correspondences/

| Current Location | New Location |
|------------------|--------------|
| framework/investigations/channel_field_correspondence.md | physics/correspondences/ |
| framework/investigations/comparison_channels_and_running.md | physics/correspondences/ |
| framework/investigations/field_content_bounds_analysis.md | physics/correspondences/ |

### 2.4 Files to Move to archive/legacy/

| Current Location | Reason |
|------------------|--------|
| mathematical_framework.md | Superseded by atomic structure |
| framework/layer_0_foundations.md | Merged into layer_0_pure_axioms.md |
| MIGRATION_FRAMEWORK.md | Superseded by this plan |
| ATOMICITY_MIGRATION_PLAN.md | Completed |
| ATOMICITY_PROPOSAL.md | Completed |
| REORGANIZATION_PLAN.md | Superseded by this plan |

### 2.5 Verification Scripts Mapping

| Script | Primary Thread |
|--------|---------------|
| alpha_137_*.py | alpha_137 |
| tilt_alpha_connection.py | alpha_137 |
| dark_sector_mapping.py | dark_sector |
| dark_sections_pi_formula.py | dark_sector |
| continuous_visibility_model.py | dark_sector |
| fermion_visibility_analysis.py | dark_sector |
| observable_fraction_analysis.py | dark_sector |
| perspective_mutation_analysis.py | mutations_time |
| gauge_group_from_tilts.py | gauge_emergence |
| grassmannian_55_connection.py | gauge_emergence |
| orthogonality_field_emergence.py | primes_orthogonality |
| perspective_prime_emergence.py | primes_orthogonality |

---

## Phase 3: Create Registry Files

### 3.1 thread_status.md

```markdown
# Thread Status Registry

**Updated**: [auto-update date]

| Thread | Status | Confidence | Last Active | Blockers |
|--------|--------|------------|-------------|----------|
| alpha_137 | ACTIVE | MODERATE | 2026-01-26 | Why 58? |
| dark_sector | ACTIVE | LOW | 2026-01-26 | Observable? |
| primes_orthogonality | ACTIVE | SPECULATIVE | 2026-01-26 | Derivation needed |
| mutations_time | ACTIVE | MODERATE | 2026-01-26 | Mutation algebra? |
| gauge_emergence | PAUSED | LOW | 2026-01-25 | Needs α first |

## Quick Links
- [alpha_137/THREAD.md](../threads/alpha_137/THREAD.md)
- [dark_sector/THREAD.md](../threads/dark_sector/THREAD.md)
- ...
```

### 3.2 connection_map.md

```markdown
# Connection Map

## Thread Relationships

```
                    ┌─────────────────┐
                    │  CORE AXIOMS    │
                    │  (AXM_0104      │
                    │   Partiality)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │ alpha_137│◄──│dark_sector│──►│mutations │
       │          │   │          │   │  _time   │
       └────┬─────┘   └────┬─────┘   └────┬─────┘
            │              │              │
            │         ┌────┴────┐         │
            │         │         │         │
            ▼         ▼         ▼         ▼
       ┌──────────┐  ┌─────────────┐  ┌──────────┐
       │  gauge_  │  │   primes_   │  │ cosmo    │
       │emergence │  │orthogonality│  │ constant │
       └──────────┘  └─────────────┘  └──────────┘
```

## Specific Connections

### alpha_137 ↔ dark_sector
- **Mutual support**: 58 visible + 79 hidden = 137 total
- **Shared assumption**: Crystal has 137 dimensions
- **Tension**: None currently

### dark_sector ↔ mutations_time
- **Mutual support**: Dark sector as mutation substrate
- **Shared concept**: Hidden content, visibility changes
- **Tension**: None currently

### primes_orthogonality ↔ core
- **Requires**: Orthogonality structure from DEF_0207
- **May provide**: Explanation for dimension counting
- **Tension**: Not yet integrated with partiality

...
```

### 3.3 open_questions.md

```markdown
# Open Questions Registry

**Updated**: 2026-01-26

## Priority 1 (Blocking Progress)

| ID | Question | Thread | Why Blocking |
|----|----------|--------|--------------|
| Q-001 | Why exactly 58 visible dimensions? | alpha_137 | Core to α derivation |
| Q-002 | What principle gives f = 19/168? | dark_sector | Needed for visibility model |
| Q-003 | Is there a mutation algebra? | mutations_time | Structure unclear |

## Priority 2 (Important but Not Blocking)

| ID | Question | Thread |
|----|----------|--------|
| Q-010 | Can we derive 1/√3 from mutations? | dark_sector |
| Q-011 | How do twilight pairs (28) work? | dark_sector |
| Q-012 | Does prime pattern extend to all n? | primes_orthogonality |

## Priority 3 (Interesting but Speculative)

| ID | Question | Thread |
|----|----------|--------|
| Q-020 | Is Λ = 1/|Π| exact? | dark_sector |
| Q-021 | Connection to Grassmannian(5,5)? | gauge_emergence |

## Answered Questions (Archive)

| ID | Question | Answer | Date |
|----|----------|--------|------|
| Q-A01 | Does mutation conserve dimension? | YES - Theorem M.1 | 2026-01-26 |
```

### 3.4 attempt_log.md

```markdown
# Attempt Log

**Purpose**: Track all approaches tried, successful or not.

---

## Format

```
### A-[NNN]: [Name]
**Thread**: [which thread]
**Date**: [when attempted]
**Status**: SUCCESS | PARTIAL | FAILED | ABANDONED
**Summary**: [one line]

**Approach**: [what was tried]

**Result**: [what happened]

**Lessons**: [what we learned, especially from failures]

**Files**: [relevant files created]
```

---

## Attempts

### A-001: α from Pure Basis Geometry
**Thread**: alpha_137
**Date**: 2026-01-15
**Status**: FAILED
**Summary**: Tried to get α without any physical imports

**Approach**: Use only Aut(B) structure to derive α

**Result**: Cannot determine what dimensions correspond to what physics without imports

**Lessons**: Need correspondence rules before deriving constants. Pure math gives structure, not numerical values.

**Files**: archive/deprecated/alpha_derivation.md

---

### A-002: α from 58/137 Counting
**Thread**: alpha_137
**Date**: 2026-01-26
**Status**: PARTIAL
**Summary**: α ≈ 58/137 from visible channel counting

**Approach**: Count SM degrees of freedom, identify with visible dimensions

**Result**: Gets right neighborhood (~0.42 vs 0.0073). Interpretation as f² closer.

**Lessons**: Counting gives structure, but relationship to α needs clarification.

**Files**: threads/alpha_137/approaches/crystal_counting.md

---

### A-003: Dark Sector from Partiality
**Thread**: dark_sector
**Date**: 2026-01-26
**Status**: PARTIAL
**Summary**: Hidden content = dark sector

**Approach**: Use AXM_0104 (partiality) to derive hidden content exists

**Result**: 79/137 ≈ 1/√3 matches pattern. Physical interpretation unclear.

**Lessons**: Mathematical structure present; correspondence to dark matter/energy TBD

**Files**: threads/dark_sector/approaches/partiality_hidden.md

---

### A-004: Mutation Conservation
**Thread**: mutations_time
**Date**: 2026-01-26
**Status**: SUCCESS
**Summary**: dim(Lost) = dim(Gained) in mutations

**Approach**: Define mutation, derive conservation from partiality

**Result**: Theorem M.1 proven and verified computationally

**Lessons**: Perspective mutations have exact conservation law

**Files**: threads/mutations_time/approaches/conservation_theorem.md

---

[Continue for all major attempts...]
```

### 3.5 anomalies.md

```markdown
# Anomalies Registry

**Purpose**: Track findings that don't fit current understanding but seem important.

---

## Active Anomalies

### AN-001: Lambda ≈ 1/|Π| Match
**Found**: 2026-01-26
**Thread**: dark_sector

**Observation**: Cosmological constant Λ ~ 10^(-118) matches 1/|Π| ~ 10^(-117.5)

**Why Anomalous**: Too precise to be coincidence? But no mechanism derived.

**Status**: UNEXPLAINED

**Hypotheses**:
1. Λ literally is 1/|Π| (perspective density)
2. Numerical coincidence
3. Related by unknown mechanism

---

### AN-002: Prime Emergence Pattern
**Found**: 2026-01-26
**Thread**: primes_orthogonality

**Observation**: Primes appear at "perfect separation" points in semi-orthogonal systems

**Why Anomalous**: No known connection between primes and perspective/orthogonality

**Status**: UNDER INVESTIGATION

**Hypotheses**:
1. Deep connection between number theory and geometry
2. Artifact of specific construction
3. Known result in different language

---

### AN-003: Fermion Visibility Correlation
**Found**: 2026-01-26
**Thread**: dark_sector

**Observation**: Antisymmetric modes (fermions) 74% visible, symmetric (scalars) 7%

**Why Anomalous**: Strong correlation with no derived mechanism

**Status**: PARTIALLY EXPLAINED (self-reference hypothesis)

---

## Resolved Anomalies

| ID | Description | Resolution | Date |
|----|-------------|------------|------|
| (none yet) | | | |
```

---

## Phase 4: Execution Checklist

### 4.1 Directory Creation
- [ ] Create `threads/` directory
- [ ] Create `threads/alpha_137/` with subdirs
- [ ] Create `threads/dark_sector/` with subdirs
- [ ] Create `threads/primes_orthogonality/` with subdirs
- [ ] Create `threads/mutations_time/` with subdirs
- [ ] Create `threads/gauge_emergence/` with subdirs
- [ ] Create `physics/limits/`
- [ ] Create `physics/correspondences/`
- [ ] Create `archive/legacy/`
- [ ] Create `archive/sessions/`

### 4.2 Registry Files
- [ ] Create `registry/thread_status.md`
- [ ] Create `registry/connection_map.md`
- [ ] Create `registry/open_questions.md`
- [ ] Create `registry/attempt_log.md`
- [ ] Create `registry/anomalies.md`
- [ ] Update `registry/tag_registry.md` with thread references

### 4.3 Thread THREAD.md Files
- [ ] Create `threads/alpha_137/THREAD.md`
- [ ] Create `threads/dark_sector/THREAD.md`
- [ ] Create `threads/primes_orthogonality/THREAD.md`
- [ ] Create `threads/mutations_time/THREAD.md`
- [ ] Create `threads/gauge_emergence/THREAD.md`
- [ ] Create `threads/THREAD_TEMPLATE.md`

### 4.4 File Migration
- [ ] Move alpha-related investigations to `threads/alpha_137/approaches/`
- [ ] Move dark sector investigations to `threads/dark_sector/approaches/`
- [ ] Move primes exploration to `threads/primes_orthogonality/approaches/`
- [ ] Move mutation investigation to `threads/mutations_time/approaches/`
- [ ] Move gauge investigations to `threads/gauge_emergence/approaches/`
- [ ] Move limit files to `physics/limits/`
- [ ] Move correspondence files to `physics/correspondences/`
- [ ] Move legacy files to `archive/legacy/`

### 4.5 Verification Script Organization
- [ ] Add thread references to each script header
- [ ] Create index of scripts by thread
- [ ] Commit all uncommitted scripts

### 4.6 Update Root Files
- [ ] Update `INDEX.md` with thread links
- [ ] Update `QUICKSTART.md` with new structure
- [ ] Update `CLAUDE.md` with thread workflow
- [ ] Archive old planning files

### 4.7 Final Verification
- [ ] All files accounted for
- [ ] No broken links
- [ ] Each thread has THREAD.md
- [ ] Registry files populated
- [ ] Git commit with migration summary

---

## Phase 5: Post-Migration Workflow

### Daily Work Pattern

1. **Check thread_status.md** — What's active? What's blocked?
2. **Pick a thread** — Work on one thing at a time
3. **Update THREAD.md** — Log what you did
4. **If new finding**: Add to appropriate place
5. **If anomaly**: Add to anomalies.md
6. **If failed approach**: Add to attempt_log.md
7. **End of session**: Update session_log.md

### When Starting New Investigation

1. Check if it fits existing thread → add to that thread
2. If new thread needed → create from template
3. Add to thread_status.md
4. Add connections to connection_map.md

### When Finding Something Unexpected

1. Document in anomalies.md immediately
2. Don't force it into existing structure
3. Let it sit until pattern becomes clear
4. May spawn new thread later

### Weekly Review (Optional but Recommended)

1. Review all thread statuses
2. Update connection_map if relationships changed
3. Review open_questions — any answered? new ones?
4. Review anomalies — any resolved?
5. Archive anything that's been stable for 2+ weeks

---

## Migration Metrics

After migration, we should have:

| Category | Expected Count |
|----------|---------------|
| Core axioms | 9 |
| Core definitions | 51 |
| Core theorems | 20 |
| Core lemmas | 3 |
| Physics imports | 8 |
| Physics conjectures | 3+ |
| Active threads | 5 |
| Verification scripts | ~40 |
| Archived files | ~10 |

---

## Success Criteria

Migration is complete when:

1. [ ] Every existing file has a home
2. [ ] Every thread has a populated THREAD.md
3. [ ] Connection map shows thread relationships
4. [ ] Open questions are catalogued with priorities
5. [ ] All attempts (success/fail) are logged
6. [ ] Anomalies are documented
7. [ ] Can answer "what's the status of X?" by reading one file
8. [ ] Can answer "what connects to X?" by reading connection_map
9. [ ] Can answer "what have we tried?" by reading attempt_log

---

**Ready to execute?**
