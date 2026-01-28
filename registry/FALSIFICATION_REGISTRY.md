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

## Dark Matter Testable Predictions (Session 94)

These are LOW-SCALE predictions from the crystallization cosmology dark matter theory.

### F-DM-1: Dark Matter Mass from 49/9 Ratio

**Prediction**: m_DM = m_p × (49/9) ≈ **5.11 GeV** (primary), or m_p × (9/49) ≈ **170 MeV** (alternative)

**Rationale**: The same ratio 49/9 that gives Ω_DM/Ω_b should encode the mass relationship.
- 49 = hidden gauge sector dimension (SU(7) × U(1)_dark)
- 9 = non-EM crystal dimensions (n_c - C)
- If m_DM/m_p = 49/9, then n_DM/n_b = 1 (asymmetric dark matter)

**Test**: Direct detection experiments at these mass scales

**Falsified if**: DM detected at mass NOT related to 49/9 or 9/49 times proton mass (± 10%)

**Current Status**: **ACTIVELY TESTING** — SuperCDMS commissioning 2026-2027, optimal for 5.11 GeV

**S103 NOTE**: This is the MOST DECISIVE test of the framework. If DM is found at 5.11 GeV, it would be extraordinary confirmation. If found at different mass (outside 49/9 × m_p ± 10%), framework needs revision.

**Experiments & Timeline**:

| Experiment | Technology | Mass Range | Timeline | Location |
|------------|------------|------------|----------|----------|
| **SuperCDMS** | Cryogenic Ge/Si | **1-10 GeV** (optimal) | 2026-2027 | SNOLAB |
| **XENONnT** | Liquid xenon | 5-1000 GeV | Running | Gran Sasso |
| **LZ** | Liquid xenon | 5-1000 GeV | Running | Sanford |
| **PandaX-4T** | Liquid xenon | ~5 GeV+ | Running | Jinping |
| **DarkSide-20k** | Liquid argon | ~GeV+ | 2026+ | Gran Sasso |
| **NEWS-G** | Spherical counter | **50 MeV - 5 GeV** | Running | SNOLAB |

**Best experiment for 5.11 GeV**: SuperCDMS (optimized for 1-10 GeV range)

**Suggestiveness**: **VERY HIGH** — would be striking if confirmed

**Testable within**: 2-5 years with current experimental programs

---

### F-DM-2: Dark Photon Mass and Kinetic Mixing

**Prediction**:
- m_A' = v/49 ≈ **5 GeV** (dark photon mass)
- Kinetic mixing ε = α² ≈ **5×10⁻⁵** (loop-suppressed)

**Rationale**: U(1)_dark mixes with U(1)_Y. Mixing through loops gives α² suppression.

**Test**: Dark photon searches at colliders and beam dumps

**Falsified if**: Dark photon discovered with ε >> α² or ε << α³, OR at wrong mass

**Current Status**: Being actively searched at LHCb, Belle II, NA62

**Experiments**: LHCb, Belle II, NA62, FASER, beam dumps

**Suggestiveness**: **HIGH**

---

### F-DM-3: Dark Sector Gauge Structure = SU(7) × U(1)

**Prediction**: Hidden gauge sector has exactly 49 gauge bosons (48 SU(7) + 1 U(1)_dark)

**Rationale**: From channel counting — 49 hidden vectors required by partiality axiom

**Test**: If dark sector is ever probed, check gauge structure

**Falsified if**: Dark sector discovered with gauge group ≠ SU(7) × U(1)

**Current Status**: UNTESTABLE with current technology (indirect only)

**Suggestiveness**: **MEDIUM** (hard to test directly)

---

### F-DM-4: Fermionic Dark Matter (16 hidden fermions)

**Prediction**: Dark matter is fermionic, not scalar

**Rationale**: 16 hidden fermions vs 14 hidden scalars — fermions are the DM candidates

**Test**: Determine spin of DM particle

**Falsified if**: DM conclusively shown to be scalar (spin-0)

**Current Status**: Spin determination is challenging but possible through directional detection

**Suggestiveness**: **MEDIUM**

---

### F-DM-5: The "49/9 Test" — Master Criterion

**Prediction**: The ratio 49/9 = 5.44 should appear in multiple dark sector observables:
- Ω_DM/Ω_b = 49/9 (**CONFIRMED** to 2.3%)
- m_DM/m_p = 49/9 or 9/49

**Test**: Check any discovered DM particle mass against proton mass ratio

**Falsified if**: DM discovered with mass ratio to proton NOT related to 49/9 or its inverse

**Current Status**: Cosmological ratio matches; mass test awaits DM discovery

**Suggestiveness**: **VERY HIGH** — this is the smoking gun test

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

### F-SCP-1: Strong CP Problem — theta_QCD = 0

**Prediction**: theta_QCD = 0 EXACTLY (not just small)

**Rationale**: theta = 0 is DERIVED from:
1. SU(3)_color = stabilizer of F = C in G2 = Aut(O)
2. G2 has trivial center (no continuous phase freedom)
3. G2/SU(3) = S^6 has no distinguished point
4. No phase reference exists in color space

**Test**: Neutron electric dipole moment (nEDM) measurements

**Falsified if**:
- d_n detected above ~10^{-28} e*cm (would imply theta > 10^{-12})
- Axion discovered (would suggest different solution)
- Any theta-dependent physics observed

**Current Status**:
- d_n < 1.8 x 10^{-26} e*cm (consistent with theta = 0)
- No axion found
- Framework prediction: theta = 0 exactly

**Significance**: **HIGH** — This SOLVES a 50-year puzzle from first principles

**Source**: Session 105, `strong_cp_problem.md`, `strong_cp_crystallization.py`

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
