# Research Navigator

**Updated**: 2026-01-26 (Major revision — multiple gaps closed)
**Purpose**: Surface the 4 best avenues to explore, integrate new discoveries

---

## Major Breakthrough This Session

**From "Time has direction" (T1), we derived:**
- F = C (Crystal must be complex)
- Fermions exist (imaginary part is antisymmetric)
- α = 1/137 (U(n) not O(n))
- n_d = 4 (quaternions, max associative)
- n_c = 11 (R + C + O = 1 + 2 + 8)

**See**: `core/17_complex_structure.md`

**Gaps closed:**
- ~~Division Algebra Gap~~ → DERIVED from associativity
- ~~Why F = C~~ → DERIVED from directed time
- ~~Why n_d = 4~~ → DERIVED (quaternions)
- ~~Why n_c = 11~~ → DERIVED (remaining division algebras)

---

## Current Top 4 Avenues

### 1. Standard Model Gauge Groups [MAJOR PROGRESS]
**Thread**: gauge_emergence | **Priority**: HIGH | **Status**: DERIVATION established

**The Question**: Can we derive SU(3) x SU(2) x U(1) from division algebra structure?

**Session 46 Resolution**:
- **7 vs 8 mismatch RESOLVED**: Im(O) = 7, but F = C forces O = C + C^3
- **SU(3) emerges as stabilizer**: Aut(C + C^3) = SU(3) subset G2, dim = 8
- **Division algebras select SM**: Over alternatives like SU(2)^4

**Derivation Chain**:
```
T1 (time) -> F = C -> O = C + C^3 -> Aut = SU(3)
H -> SU(2) (unit quaternions)
C -> U(1) (unit complex numbers)
=> SU(3) x SU(2) x U(1) with dim = 12
```

**Remaining Gaps**:
- Why rank = n_d = 4? (conjecture, not derived)
- Why dim = 3 x n_d? (factor of 3 unexplained)
- Why H -> defect, O -> crystal?

**Best Next Step**: Investigate factor of 3 or H/O assignment to defect/crystal

**Files**: `physics/gauge_groups.md`, `verification/sympy/gauge_groups_derivation.py`, `core/17_complex_structure.md`

---

### 2. Point Emergence from Continuous Space
**Thread**: foundation | **Priority**: HIGH | **Blocking**: Discrete structure

**The Question**: How do discrete point-like structures emerge from continuous V_π?

**Current State**:
- V_π is a continuous vector space
- Points are "dimensional configurations" S_p ⊆ B̃
- Mechanism for discreteness not specified
- Gap 1 in Layer 0

**Best Next Step**: Investigate whether tilt quantization (137 discrete states) provides discreteness

**If Solved**: Explains particle-like behavior, connects to |Π| = 137^55

**Files**: `layer_0_pure_axioms.md` §22, `core/16_dimension_dynamics.md`

---

### 3. Prime Distribution from Perspective
**Thread**: primes_orthogonality | **Priority**: MEDIUM | **Potential**: Major number theory result

**The Question**: Can ~1/ln(n) prime density be derived from perspective constraints?

**Current State**:
- Multiplication emerges from C2 + Π2 + T1 (VERIFIED)
- Primes forced as non-redundant basis (DERIVED)
- Distribution not yet addressed

**Best Next Step**: Investigate whether orthogonality probability product gives 1/ln(n)

**If Solved**: Perspective framework explains prime distribution

**Files**: `perspective_connection.md`, `BREAKTHROUGH_primes_as_perfect_separation.md`

---

### 4. Visibility Dynamics (Reframed)
**Thread**: dark_sector | **Priority**: MEDIUM | **Status**: Partially dissolved

**The Question**: What determines which dimensions a perspective chain accesses?

**Current State**:
- Earlier insight: n_d = 4 may be contingent (our chain's choice)
- But new finding: n_d ≤ 4 is FORCED (associativity)
- Different chains might access different 4-subsets of the quaternionic structure

**Best Next Step**: Investigate whether all perspective chains must access exactly 4 dims, or if this varies

**If Solved**: Clarifies what's universal vs contingent

**Files**: `continuous_visibility_model.md`, `core/17_complex_structure.md`

---

## Closed Gaps (Recent Sessions)

| Gap | Resolution | Document |
|-----|------------|----------|
| Why F = C? | Directed time requires antisymmetric structure | `core/17_complex_structure.md` |
| Why n_d = 4? | Associativity limits to quaternions (dim 4) | `core/17_complex_structure.md` |
| Why n_c = 11? | Remaining division algebras: R+C+O = 11 | `core/17_complex_structure.md` |
| Division algebra gap | Time requires associativity | `core/17_complex_structure.md` |
| Why α = 1/137 not 1/61? | U(n) not O(n), requires F = C | `core/17_complex_structure.md` |
| Why fermions exist? | Imaginary part of complex inner product | `core/17_complex_structure.md` |
| **7 vs 8 mismatch** | F=C forces O=C+C^3, Aut=SU(3) with dim=8 | `gauge_from_division_algebras.md` |
| **SM gauge group** | Div algebras -> U(1) x SU(2) x SU(3) | `gauge_from_division_algebras.md` |

---

## Remaining Score 5 Gaps

| Gap | Thread | Impact |
|-----|--------|--------|
| Point emergence | foundation | All discrete structures |
| SM gauge groups | gauge_emergence | Complete physics derivation |

---

## Integration Workflow

### When You Have a New Insight

1. **Quick capture** — Add to `registry/emerging_patterns.md`
2. **Tag it** — Which thread?
3. **Score it** (1-5)
4. **If major** — Create formal document in core/ or physics/

### Session Summary (2026-01-26-44 continued)

**Started with**: Consolidation prep, 4 avenues identified
**Explored**:
1. Prime distribution (started, pivoted)
2. Visibility dynamics → reframed as contingent
3. Antisymmetric → visibility → led to dimension dynamics
4. Complex structure → **MAJOR BREAKTHROUGH**

**Created**:
- `core/16_dimension_dynamics.md` — Antisymmetric creates dimensions
- `core/17_complex_structure.md` — F=C from directed time, full derivation chain

**Closed**: 6 major gaps in one session

---

## Quick Reference: All Threads

| Thread | Central Question | Status |
|--------|-----------------|--------|
| alpha_137 | Why α = 1/137? | **LARGELY RESOLVED** |
| dark_sector | What is dark matter/energy? | ACTIVE (58/79 split) |
| mutations_time | What is time? | **LARGELY RESOLVED** |
| primes_orthogonality | Do primes emerge? | ACTIVE |
| gauge_emergence | Why SM gauge groups? | **LARGELY RESOLVED** (Session 46) |
| foundation | Points, discreteness | ACTIVE |

---

*To update priorities: Edit the Top 4 section based on new discoveries.*
*To add emerging pattern: Append to `registry/emerging_patterns.md`.*
