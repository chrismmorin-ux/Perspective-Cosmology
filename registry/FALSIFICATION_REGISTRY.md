# Falsification Registry

**Created**: 2026-01-27
**Purpose**: Central collection of ALL falsification criteria — what would prove us wrong

---

## Why This Exists

A theory that can't be proven wrong isn't science. Every prediction must have:
1. A specific test that could falsify it
2. Clear success/failure criteria
3. Current experimental status

---

## Critical Falsification Criteria

### F-1: sin²θ_W at High Energy

**Prediction**: sin²θ_W → 1/4 (exactly 0.25) at ~200 TeV

**Current Measurement**: 0.2312 at M_Z (91 GeV)

**Test**: Precision electroweak measurements at higher energies

**Falsified if**: sin²θ_W running does NOT approach 1/4, or crosses 1/4 at wrong energy

**Status**: TESTABLE (requires future collider data)

**Source**: CLAIM-14, depends on [A-COUPLING]

---

### F-2: Fine Structure Constant

**Prediction**: 1/α = 137 exactly at some reference scale

**Current Measurement**: 1/α = 137.036 at low energy

**Test**: Compare framework prediction to precision measurements

**Falsified if**: No energy scale exists where 1/α = 137 within measurement precision

**Status**: PARTIAL MATCH (0.026% error at IR)

**Source**: CLAIM-13

---

### F-3: Number of Generations

**Prediction**: Exactly 3 fermion generations (not 2, not 4)

**Current Measurement**: 3 observed generations

**Test**: Search for 4th generation particles

**Falsified if**: 4th generation discovered, OR theoretical proof that 3 isn't forced

**Status**: CONSISTENT with observations

**Note**: Framework derives this from dim(Im(H)) = 3, but derivation is [CONJECTURE]

**Source**: CLAIM-15

---

### F-4: SM Gauge Group Uniqueness

**Prediction**: SU(3) × SU(2) × U(1) is the UNIQUE gauge group from division algebras

**Test**: Show alternative gauge groups could arise from same axioms

**Falsified if**: Different division algebra interpretation gives different groups

**Status**: CONSISTENT (verified in `rank4_gauge_enumeration.py`)

**Source**: CLAIM-8

---

### F-5: 15 Fermions per Generation

**Prediction**: Each generation has exactly 15 Weyl fermions

**Current Count**: 15 observed per generation

**Test**: Discover additional fermion in existing generations

**Falsified if**: 16th fermion per generation found

**Status**: CONSISTENT with SM

**Source**: CLAIM-10

---

### F-6: Hypercharge Values

**Prediction**: All 5 hypercharges {-1, -1/2, 1/6, 2/3, -1/3} from Im(H) = 3

**Test**: Check all hypercharges match SM

**Falsified if**: New particle with different hypercharge discovered

**Status**: CONSISTENT (verified in `hypercharge_derivation.py`)

**Source**: CLAIM-11

---

### F-7: Baryon Number = 1/3

**Prediction**: B = 1/3 for quarks, uniquely from anomaly cancellation

**Test**: Mathematical check of anomaly cancellation

**Falsified if**: Different B value also satisfies anomalies, OR anomalies don't cancel

**Status**: VERIFIED (unique solution proven)

**Source**: CLAIM-12

---

## Conjectural Falsification Criteria

These predictions are less certain but still testable:

### F-8: Dimension Dynamics (Imperfect Dimensions)

**Prediction**: α running explained by changing dimension count with energy

**Test**: Model α(E) with n_imperfect(E), compare to measurements

**Falsified if**: No reasonable n(E) function fits α running

**Status**: UNTESTED (needs formalization)

**Source**: Avenue 1 (Imperfect Dimensions)

---

### F-9: Gravity as Recrystallization

**Prediction**: Gravitational effects are dimension merging

**Test**: Derive Newton's law from recrystallization dynamics

**Falsified if**: Recrystallization gives wrong force law, or requires additional parameters

**Status**: UNTESTED (speculative)

**Source**: Avenue 1

---

### F-10: Koide Formula Connection

**Prediction**: Q = 2/3 emerges from dim(C)/Im(H)

**Test**: Derive Koide parameterization from C → H embedding

**Falsified if**: No natural derivation exists, or phase θ cannot be derived

**Status**: PARTIALLY TESTED (Q = 2/3 matches, θ unknown)

**Source**: Avenue 2 (Mass Hierarchy)

---

### F-11: Visible/Hidden Split = 58/79

**Prediction**: 58 visible channels, 79 hidden channels (dark matter/energy)

**Test**: Compare to cosmological measurements of dark fraction

**Falsified if**: Ratio doesn't match observed dark matter/energy fraction

**Status**: PARTIALLY CONSISTENT (79/137 ≈ 1/√3, matches some models)

**Source**: CLAIM-17

---

## Already Falsified

| Prediction | Test | Result | Lesson |
|------------|------|--------|--------|
| sin²θ_W = 2/25 | Compare to measured value | 65% error | Simple ratios fail |
| n_EW = 5 | Gell-Mann-Nishijima constraint | Mathematically impossible | Hidden numerology |
| α running via n_d² + n_c² | GUT scale | Can't reach ~1/42 | Need new mechanism |

---

## Falsification Urgency

| Priority | Criterion | Why |
|----------|-----------|-----|
| **HIGH** | F-1 (sin²θ_W → 1/4) | Only prediction from [A-COUPLING] |
| **HIGH** | F-3 (3 generations) | Core SM feature, derivation is weak |
| **MEDIUM** | F-8 (dimension dynamics) | Could unify cosmology |
| **MEDIUM** | F-10 (Koide) | Could predict masses |
| **LOW** | F-2, F-4, F-5, F-6, F-7 | Already consistent with SM |

---

## Experimental Tests Needed

### Near-term (current technology):
- Precision electroweak measurements at LHC Run 3/4
- Better α measurements at different energies
- 4th generation searches (ongoing, negative so far)

### Medium-term (planned experiments):
- Future Circular Collider: could test sin²θ_W at higher energies
- Precision neutrino measurements

### Long-term (speculative):
- 200+ TeV collider: direct test of sin²θ_W = 1/4
- Quantum gravity experiments: test recrystallization

---

## How to Use This Document

### When making a new prediction:
1. Add falsification criterion here
2. Specify the test and failure conditions
3. Link to source claim
4. Assess current status

### When a criterion is tested:
1. Update status
2. If falsified, move to "Already Falsified" section
3. Update CLAIM_DEPENDENCIES for affected claims
4. Document lessons learned

### Periodic review:
- Are all predictions covered?
- Are criteria specific enough?
- Any new experimental results to consider?

---

*Last updated: 2026-01-27*
