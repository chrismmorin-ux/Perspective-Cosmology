# Physics Auditor: Systematic Review Plan

**Created**: 2026-01-28
**Scope**: 697 files across 12 tiers
**Command**: `/physics-auditor`

---

## Executive Summary

| Category | Files | Priority | Est. Sessions |
|----------|-------|----------|---------------|
| Core Axioms/Definitions/Theorems | 77 | CRITICAL | 8-10 |
| Foundation Documents | 19 | HIGH | 6-8 |
| Framework Layer Files | 12 | HIGH | 4-5 |
| Critical Investigations | 7 | HIGH | 4-5 |
| Verification Scripts (sampling) | 50 key | MEDIUM | 6-8 |
| Claims & Predictions | 10 | HIGH | 3-4 |
| Secondary Investigations | 100+ | LOW | As needed |

**Total Estimated Sessions**: 35-45 (can parallelize with batching)

---

## Phase 1: Foundation Validation (CRITICAL)

### 1A. Axiom Consistency Audit

**Files**: `core/axioms/AXM_01XX.md` (18 files)

| Axiom | File | Audit Focus |
|-------|------|-------------|
| AXM_0100 | finiteness.md | Is finiteness purely mathematical? |
| AXM_0101 | connectivity.md | Graph theory correctness |
| AXM_0102 | nontriviality.md | Logical necessity |
| AXM_0103 | closure.md | Closure well-defined? |
| AXM_0104 | partiality.md | Map partiality justified? |
| AXM_0105 | locality.md | Locality definition rigorous? |
| AXM_0106 | noninvertibility.md | Information loss axiom sound? |
| AXM_0107 | nonnegative_loss.md | Entropy arrow implicit? |
| AXM_0108 | time_scale.md | Time without physics? |
| AXM_0109 | crystal_existence.md | Existence vs constructive? |
| AXM_0110 | perfect_orthogonality.md | Orthonormality requirements |
| AXM_0111 | crystal_completeness.md | Completeness definition |
| AXM_0112 | crystal_symmetry.md | Symmetry constraints |
| AXM_0113 | finite_access.md | Finite access meaning |
| AXM_0114 | tilt_possibility.md | Tilt operation definition |
| AXM_0115 | algebraic_completeness.md | Field closure necessity |
| AXM_0116 | crystal_timeless.md | Timelessness consistent? |
| AXM_0117 | crystallization_tendency.md | Dynamics axiom |
| AXM_0118 | prime_attractor_selection.md | **CRITICAL** - Prime mechanism |

**Audit Checklist**:
- [ ] No circular dependencies between axioms
- [ ] Layer 0 purity: zero physics concepts
- [ ] Each axiom independently falsifiable
- [ ] Logical independence verified
- [ ] No hidden assumptions

### 1B. Definition Rigor Audit

**Files**: `core/definitions/DEF_02XX.md` (38 files)

**Focus**:
- Mathematical precision of each definition
- Consistency with axioms
- No overloaded terms
- Complete dependency chains

### 1C. Theorem Verification Audit

**Files**: `core/theorems/THM_04XX.md` (21 files)

**Focus**:
- Proof step validity
- SymPy script exists and PASSES
- No gaps in derivation chain
- Dependencies correctly cited

---

## Phase 2: Bridge to Physics (HIGH)

### 2A. Layer Transition Audit

| File | Audit Focus |
|------|-------------|
| `framework/layer_0_pure_axioms.md` | Verify ZERO physics |
| `framework/layer_0_foundations.md` | Pure mathematics only |
| `framework/layer_1_mathematics.md` | Math consequences only |
| `framework/layer_1_crystallization.md` | No physics imports |
| `framework/layer_2_correspondence.md` | ALL imports explicit? |
| `framework/layer_3_predictions.md` | Predictions vs retrofits |

**Critical Question**: Where exactly does physics enter?

### 2B. Foundation Document Audit

| File | Priority | Key Risk |
|------|----------|----------|
| `foundations/THE_CHAIN.md` | CRITICAL | End-to-end validity |
| `foundations/frobenius_necessity.md` | CRITICAL | n_d=4 derivation |
| `foundations/GENERATION_STRUCTURE.md` | CRITICAL | Generation count |
| `foundations/einstein_equations_rigorous.md` | CRITICAL | GR emergence gaps |
| `foundations/crystallization_dynamics.md` | HIGH | Dynamics validity |
| `foundations/gauge_from_automorphisms.md` | HIGH | Gauge emergence |
| `foundations/big_bang_nature.md` | HIGH | Cosmology claims |
| `foundations/black_holes_crystallization.md` | HIGH | BH entropy |

### 2C. Prime Theory Deep Audit

**Directory**: `foundations/prime_theory/` (8 files)

**Critical for**: n_c = 11 derivation, prime attractor mechanism

| File | Audit Need |
|------|------------|
| `01_fundamental_theorems.md` | Math correctness |
| `02_cyclotomic_fields.md` | Φ₆ derivation |
| `03_algebraic_integers.md` | Algebraic structure |
| `04_division_algebra_connections.md` | Division algebra link |
| `05_fourth_power_primes.md` | 17, 97 significance |
| `06_reciprocity_laws.md` | Reciprocity usage |
| `07_prime_distribution.md` | Distribution claims |
| `08_open_questions.md` | Acknowledged gaps |

---

## Phase 3: Precision Claims Audit (HIGH)

### 3A. Tier 1 Claims (Sub-ppm)

**File**: `claims/TIER_1_SIGNIFICANT.md`

| Claim | Precision | Audit Focus |
|-------|-----------|-------------|
| α = 1/137.035999... | 6 ppm | Derivation vs fitting |
| Dark matter 5.11 GeV | ppm-level | Blind prediction? |
| [Third claim TBD] | sub-ppm | Verification |

**Required**:
- [ ] Run ALL associated scripts
- [ ] Trace derivation chain completely
- [ ] Check for post-hoc fitting signals
- [ ] Verify measurement sources

### 3B. Tier 2 Claims (10-100 ppm)

**File**: `claims/TIER_2_POSSIBLE.md`

~5 claims requiring:
- Script verification
- Independence check (shared inputs?)
- Measurement source verification

### 3C. Key Investigation Audits

| Investigation | File | Risk |
|---------------|------|------|
| Alpha Master | `ALPHA_DERIVATION_MASTER.md` | Fitting risk |
| Prime-Physics | `BREAKTHROUGH_primes_physics.md` | Numerology risk |
| Dark Sector | `DARK_SECTOR_CONSOLIDATED.md` | Parameter count |
| QM Derivation | `quantum_mechanics_complete.md` | Completeness |
| Unified Emergence | `unified_emergence.md` | Chain validity |

---

## Phase 4: Script Verification Audit (MEDIUM)

### 4A. Critical Scripts (Must Verify)

| Category | Sample Scripts | Count |
|----------|---------------|-------|
| Alpha | `alpha_137_verification_clean.py` | 5 |
| Einstein | `einstein_equations_complete.py` | 3 |
| Primes | `prime_179_deep_exploration.py` | 5 |
| CMB | `cmb_canonical_formulas.py` | 5 |
| Black Holes | `black_hole_crystallization_complete.py` | 5 |
| Crystallization | `crystallization_dynamics.py` | 5 |

### 4B. Script Health Check

For sampled scripts:
- [ ] Script runs without error
- [ ] Output matches documented claims
- [ ] PASS/FAIL conditions correct
- [ ] Dependencies documented

---

## Phase 5: Methodology Audit (MEDIUM)

### 5A. Honesty Infrastructure

| File | Audit Focus |
|------|-------------|
| `registry/PARAMETER_FREEZE.md` | Count honest? Hidden DoF? |
| `registry/FORMULA_SEARCH_LOG.md` | Search denominator documented? |
| `registry/INTERPRETATION_AUDIT.md` | Alternatives considered? |
| `registry/DEAD_ENDS.md` | Failures documented? |
| `registry/HALLUCINATION_LOG.md` | Error patterns? |

### 5B. Prediction Protocol

| File | Audit Focus |
|------|-------------|
| `predictions/BLIND_PREDICTIONS.md` | Truly blind? Timestamps? |
| `registry/HYPOTHESIS_TESTING_PROTOCOL.md` | Protocol followed? |

---

## Phase 6: Secondary Audits (LOW - As Needed)

- Secondary investigations (~100 files)
- Additional verification scripts (~300)
- Reference materials
- Archive review

---

## Audit Execution Protocol

### Per-File Audit Process

```
1. READ file completely
2. IDENTIFY key claims and dependencies
3. TRACE derivation chain to axioms
4. CHECK for [A-IMPORT] tags (are imports explicit?)
5. RUN associated verification scripts
6. CLASSIFY findings by risk
7. PROPOSE cache additions
8. UPDATE tracking file
```

### Output Per File

```markdown
## [FILENAME]

**Type**: AXIOM | THEOREM | DERIVATION | INVESTIGATION | SCRIPT
**Status**: SOUND | NEEDS-RIGOR | GAPS | RED-FLAG
**Risk**: 1-10

### Findings
- [PASS]: ...
- [GAP]: ...
- [RISK]: ...

### Required Actions
1. ...

### Dependencies
- Uses: [files]
- Verification: [scripts]
```

### Batch Strategy

**Recommended batching**:
- Axioms: 6 per session (3 sessions)
- Definitions: 10 per session (4 sessions)
- Theorems: 7 per session (3 sessions)
- Foundations: 3-4 per session (5-6 sessions)
- Investigations: 2-3 per session (as needed)

---

## Tracking

Progress tracked in: `.auditor/AUDIT_PROGRESS.md`
Findings cached in: `.auditor/cache/`
Conflicts logged in: `.auditor/cache/conflicts/`

---

## Quick Start Commands

```
/physics-auditor core/axioms/AXM_0100_finiteness.md
/physics-auditor --batch axioms           # All axioms
/physics-auditor --batch definitions      # All definitions
/physics-auditor --batch tier1            # Tier 1 claims
/physics-auditor --status                 # Progress report
/physics-auditor --conflicts              # Open issues
```
