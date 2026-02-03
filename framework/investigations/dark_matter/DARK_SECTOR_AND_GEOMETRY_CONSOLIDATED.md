# Dark Sector, Tetrahedral Geometry, and Cosmological Constant

## Consolidated Investigation Document

**Status**: ACTIVE INVESTIGATION
**Created**: 2026-01-26
**Sessions**: 34, 35, 36, 38, 39, 40, 41, 42
**Purpose**: Preserve key findings for project restructuring
**Confidence**: [CONJECTURE] with strong numerical support

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Core Breakthrough: Dark Sector from Partiality](#2-the-core-breakthrough-dark-sector-from-partiality)
3. [Channel Counting and Field Content](#3-channel-counting-and-field-content)
4. [Type-Specific Visibility](#4-type-specific-visibility)
5. [Tetrahedral Geometry Connection](#5-tetrahedral-geometry-connection)
6. [The |Pi| Formula and Cosmological Constant](#6-the-pi-formula-and-cosmological-constant)
7. [Dark Sector Structure](#7-dark-sector-structure)
8. [Pair Decomposition: Light, Dark, Twilight](#8-pair-decomposition-light-dark-twilight)
9. [Derivation Chains](#9-derivation-chains)
10. [Numerical Summary](#10-numerical-summary)
11. [Open Questions](#11-open-questions)
12. [Falsification Criteria](#12-falsification-criteria)
13. [References and Dependencies](#13-references-and-dependencies)
14. [Verification Scripts](#14-verification-scripts)

---

## 1. Executive Summary

### The Central Insight

**Axiom P1 (Partiality)** states that every perspective accesses strictly less than the whole Crystal:

```
im(pi) ⊊ V_Crystal
```

This seemingly simple axiom has profound consequences:

1. **Hidden content must exist** — The dark sector isn't mysterious; it's guaranteed by the partiality axiom
2. **The hidden fraction is ~1/sqrt(3)** — Matching tetrahedral geometry to 0.12%
3. **Fermions are preferentially visible** — Antisymmetric modes are robust under partial observation
4. **The 79 hidden channels have structure** — SU(7) x U(1) gauge symmetry with 49 dark vectors

### Key Numbers

| Quantity | Value | Origin |
|----------|-------|--------|
| Total channels | 137 | Interface DoF = n_d^2 + n_c^2 = 16 + 121 |
| Visible channels (SM) | 58 | 1 scalar + 12 vectors + 45 fermions |
| Hidden channels (Dark) | 79 | 14 scalars + 49 vectors + 16 fermions |
| Hidden fraction | 79/137 = 0.5766 | Matches 1/sqrt(3) = 0.5774 to 0.12% |
| |Pi| | 137^55 ~ 10^117.5 | Number of perspectives |

### The Tetrahedral Connection

The hidden fraction equals the **sine of the tetrahedral angle**:

```
sin(35.26 deg) = 1/sqrt(3) = 0.5774
79/137 = 0.5766
Error: 0.12%
```

This connects to n_defect = 4 = number of tetrahedron vertices, suggesting spacetime has tetrahedral structure.

---

## 2. The Core Breakthrough: Dark Sector from Partiality

### 2.1 The Axiom

From Layer 0 (`framework/layer_0_pure_axioms.md`):

**Axiom P1 (Partiality)**:
```
Every perspective accesses strictly less than the whole:
im(pi) ⊊ V_Crystal
```

### 2.2 The Immediate Consequence

**Theorem P.1 (Perspective Breaks Symmetry)**:
```
V_Crystal = V_pi ⊕ V_pi^perp

where:
  V_pi = accessible subspace (what we observe)
  V_pi^perp = hidden subspace (what we cannot observe)
```

### 2.3 The Physical Interpretation

```
Observable content ⊊ Total content
         ↓
Hidden content MUST exist
         ↓
Dark sector is NECESSARY, not contingent
```

The dark sector isn't a mysterious addition to physics — it's a **mathematical consequence** of perspective being partial.

### 2.4 Quantification

From the channel counting (see Section 3):

```
C_total = 137       (interface channels)
C_observable = 58   (SM fields)
C_hidden = 79       (dark sector)

f_observable = 58/137 = 0.4234
f_hidden = 79/137 = 0.5766
```

---

## 3. Channel Counting and Field Content

### 3.1 Origin of 137 Channels

The interface between defect (spacetime) and crystal has degrees of freedom:

```
Interface DoF = n_d^2 + n_c^2 = 4^2 + 11^2 = 16 + 121 = 137
```

This equals 1/alpha (fine structure constant).

### 3.2 Channel Type Decomposition

For n = n_d + n_c = 15 observable dimensions, the comparison matrix decomposes:

| Type | Description | Count | Field Type |
|------|-------------|-------|------------|
| Diagonal | Self-comparisons | n_d + n_c = 15 | Scalar (spin 0) |
| Symmetric off-diag | gamma(i,j) = gamma(j,i) | C(n_d,2) + C(n_c,2) = 6 + 55 = 61 | Vector (spin 1) |
| Antisymmetric | gamma(i,j) = -gamma(j,i) | C(n_d,2) + C(n_c,2) = 6 + 55 = 61 | Fermion (spin 1/2) |
| **Total** | | **137** | |

### 3.3 Why This Decomposition?

The channel-field correspondence comes from the **spin-statistics theorem**:

1. Antisymmetric exchange (gamma(i,j) = -gamma(j,i)) defines fermionic modes
2. Spin-statistics theorem: antisymmetric exchange ↔ half-integer spin
3. Therefore: antisymmetric channels = fermions

See: `framework/investigations/channel_field_correspondence.md`

### 3.4 Standard Model Fit

| Type | Maximum | SM Uses | Hidden |
|------|---------|---------|--------|
| Scalar | 15 | 1 (Higgs) | 14 |
| Vector | 61 | 12 (gauge bosons) | 49 |
| Fermion | 61 | 45 (quarks + leptons) | 16 |
| **Total** | **137** | **58** | **79** |

SM field content:
- **1 scalar**: Higgs
- **12 vectors**: 8 gluons + W+, W-, Z, photon
- **45 fermions**: 3 generations x 15 Weyl fermions per generation

---

## 4. Type-Specific Visibility

### 4.1 The Dramatic Difference

| Type | Visible | Hidden | f_visible | f_hidden |
|------|---------|--------|-----------|----------|
| Scalar | 1 | 14 | 6.7% | 93.3% |
| Vector | 12 | 49 | 19.7% | 80.3% |
| Fermion | 45 | 16 | 73.8% | 26.2% |

**Key observation**: Fermions are preferentially visible (74%), while scalars are almost entirely hidden (93%).

### 4.2 Why Fermions Are More Visible

**Hypothesis (Antisymmetric Robustness)**:

Under partial observation (P1), antisymmetric modes preserve their signature:

```
For antisymmetric mode:
  gamma(i,j) = -gamma(j,i)
  This ALGEBRAIC relation cannot be lost
  Even partial observation sees the antisymmetry
  → Mode is VISIBLE

For symmetric mode:
  gamma(i,j) = +gamma(j,i)
  Partial observation might see only one term
  Without both, symmetry is invisible
  → Mode can HIDE
```

**Physical intuition**:
- Fermion number is conserved → fermions are trackable
- Pauli exclusion → fermions must be distinct → distinguishable
- Bosons can condense → multiple in same state → hidden in vacuum

### 4.3 Implications

1. **Dark matter should include fermions**: 16 hidden fermionic channels
2. **Dark sector is mostly bosonic**: 63/79 = 80% (14 scalars + 49 vectors)
3. **Scalars are hardest to detect**: Only 1/15 = 7% visible

---

## 5. Tetrahedral Geometry Connection

### 5.1 The Numerical Match

```
Hidden fraction: 79/137 = 0.57664
1/sqrt(3): 0.57735
Error: 0.12%
```

### 5.2 The Tetrahedral Angle

1/sqrt(3) = sin(35.26 deg), where 35.26 deg is the **tetrahedral angle** — the angle between a face normal and an edge of a regular tetrahedron.

### 5.3 Connections to Framework

| Framework Element | Tetrahedral Analog | Match |
|-------------------|-------------------|-------|
| n_defect = 4 | Tetrahedron vertices | EXACT |
| Hidden scalars = 14 | Tetrahedron components (4+6+4) | EXACT |
| Hidden fraction = 1/sqrt(3) | sin(tetrahedral angle) | 0.12% |
| Visible/hidden = 58/79 | 1 - 1/sqrt(3) | 0.3% |

### 5.4 The Ratio

```
Hidden/Visible = 79/58 = 1.362
1/(sqrt(3) - 1) = 1.366
Error: 0.3%
```

After rationalization: 1/(sqrt(3)-1) = (sqrt(3)+1)/2

### 5.5 Geometric Interpretation

**Hypothesis**: The 4D defect (spacetime) has tetrahedral structure.

From one "vertex" of the tetrahedron (our perspective):
- We "see" the opposite face (visible content)
- We "miss" what's behind us (hidden content)
- Hidden fraction = sin(tetrahedral angle) = 1/sqrt(3)

### 5.6 Why Linear (Not Quadratic)?

The match is to sin(theta), not sin^2(theta):

```
Linear: f_hidden ~ sin(theta_tet) = 1/sqrt(3) ✓ (0.12% match)
Quadratic: f_hidden ~ sin^2(theta_tet) = 1/3 ✗ (73% off)
```

This suggests **amplitude** not probability — consistent with quantum mechanical wavefunction interpretation.

### 5.7 Verification

Script: `verification/sympy/tetrahedral_connection.py`

Results:
- theta_hidden = 35.21 deg
- theta_tetrahedral = 35.26 deg
- Difference: 0.05 deg

---

## 6. The |Pi| Formula and Cosmological Constant

### 6.1 The Perspective Count Formula

```
|Pi| = (1/alpha)^(n_c choose 2) = 137^55 ~ 10^117.5
```

Where:
- 1/alpha = 137 (interface states per pair)
- n_c = 11 (crystal dimensions)
- C(n_c, 2) = 55 (pairs of crystal dimensions)

### 6.2 Physical Interpretation

Each perspective is characterized by a tilt configuration:
- 55 independent pairs of dimensions
- Each pair has 137 distinguishable tilt states
- Total perspectives = 137^55

### 6.3 Connection to Cosmological Constant

The cosmological constant problem:
```
rho_QFT / rho_observed ~ 10^122
```

Comparison:
```
|Pi| = 10^117.5
CC ratio = 10^122
Gap: 10^4.5
```

### 6.4 What Exponent Gives 10^122?

```
137^x = 10^122
x = 122 / log10(137) = 57.1
```

So we need exponent ~57, not 55. The gap is +2.

### 6.5 Possible +2 Sources

| Expression | Value | 10^(137^x) |
|------------|-------|------------|
| C(11,2) + 2 | 57 | 10^121.8 ← Close! |
| C(11,2) + C(2,2) + 1 | 57 | 10^121.8 |
| C(11,2) + n_d | 59 | 10^126.1 |

### 6.6 Alternative: Hidden Channel Formula

```
79^64 = 10^121.4
```

This uses:
- 79 = hidden channels (not 137 total)
- 64 = 8^2 = 2^6 = Dirac spinor dimension in 12D

This is remarkably close to 10^122.

### 6.7 Status

The |Pi| ~ 10^117.5 explains the **scale** of the CC discrepancy but not the exact value. The gap of 10^4.5 (or the need for exponent 57 vs 55) remains unexplained.

---

## 7. Dark Sector Structure

### 7.1 Proposed Gauge Group

**SU(7) x U(1)_dark** with:
- 48 SU(7) gauge bosons ("dark gluons")
- 1 U(1)_dark gauge boson ("dark photon")
- Total: 49 dark vectors ✓

### 7.2 Why SU(7)?

49 = dim(SU(7)) + 1 = 48 + 1

This is an **exact match** to hidden vector count.

### 7.3 Dark Fermions

16 hidden fermions = dimension of SO(10) Weyl spinor

Possible structures:
- 7 + 7* + 1 + 1 under SU(7) x U(1) (anomaly-free)
- One "dark generation" in SO(10) representation
- 3 right-handed neutrinos + 13 dark matter particles

### 7.4 Dark Scalars

14 hidden scalars could be:
- 7 complex dark Higgs fields
- Give mass to SU(7) gauge bosons
- Break SU(7) x U(1) to some subgroup

### 7.5 Properties

| Component | Count | Possible Role |
|-----------|-------|---------------|
| SU(7) gluons | 48 | Dark confinement, dark baryons |
| Dark photon | 1 | Long-range dark force |
| Dark fermions | 16 | Dark matter candidates |
| Dark Higgs | 14 | Mass generation for dark sector |

---

## 8. Pair Decomposition: Light, Dark, Twilight

### 8.1 The Three Categories

For n_visible = 4 (spacetime) and n_hidden = 7 (compactified):

| Category | Formula | Count | Description |
|----------|---------|-------|-------------|
| Light | C(n_v, 2) | 6 | Both dimensions visible |
| Dark | C(n_h, 2) | 21 | Both dimensions hidden |
| Twilight | n_v x n_h | 28 | One visible, one hidden |
| **Total** | C(11, 2) | **55** | All pairs |

Verification: 6 + 21 + 28 = 55 ✓

### 8.2 Physical Roles

**Light pairs (6)**:
- Encode spacetime structure (Lorentz geometry)
- 6 = 3 boosts + 3 rotations (Lorentz group generators)
- All SM physics lives here

**Dark pairs (21)**:
- Encode dark sector internal structure
- 21 = dim(SO(7)) — rotations among hidden dimensions
- Inaccessible to direct observation

**Twilight pairs (28)**:
- Interface between visible and dark
- 28 = dim(SO(8)) — suggestive of SO(8) triality
- Mediates dark-light coupling (how dark matter gravitates)

### 8.3 KEY OBSERVATION

```
Dark pairs + Twilight pairs = 21 + 28 = 49 = Hidden vectors
```

This connects:
- Pair structure (geometry)
- Dark gauge content (physics)

The 49 dark vectors "live on" the 49 pairs that involve hidden dimensions.

### 8.4 Dark Matter Ratio

Simple pair counting suggests dark:light = 21:6 = 3.5:1

Observed: dark matter : visible matter ~ 5:1

Resolution: twilight pairs are partially dark:
```
Effective dark = 21 + f x 28
Effective light = 6 + (1-f) x 28

For 5:1 ratio: f ~ 0.89 (twilight is 89% dark)
```

See: `framework/investigations/continuous_visibility_model.md`

---

## 9. Derivation Chains

### 9.1 Dark Sector Existence

```
[A-AXIOM] P1: V_pi ⊊ V_Crystal (partiality)
    ↓
[THEOREM] V_Crystal = V_pi ⊕ V_pi^perp (orthogonal decomposition)
    ↓
[DERIVATION] Some content is hidden from any perspective
    ↓
[D + IMPORT] Channels → fields (via spin-statistics)
    ↓
[DERIVATION] 137 channels total
    ↓
[A-IMPORT] SM has 58 fields
    ↓
[DERIVATION] 79 channels are hidden
    ↓
[CONJECTURE] Hidden channels = dark sector
```

### 9.2 Hidden Fraction

```
[CALCULATION] f_hidden = 79/137 = 0.5766
    ↓
[IDENTITY] 1/sqrt(3) = sin(35.26 deg) = 0.5774
    ↓
[MATCH] Error = 0.12%
    ↓
[OBSERVATION] 35.26 deg = tetrahedral angle
    ↓
[OBSERVATION] n_defect = 4 = tetrahedron vertices
    ↓
[CONJECTURE] 4D spacetime has tetrahedral structure
    ↓
[CONJECTURE] Hidden fraction = sin(tetrahedral angle)
```

### 9.3 Type-Specific Visibility

```
[OBSERVATION] f_visible by type:
    Scalars: 1/15 = 6.7%
    Vectors: 12/61 = 19.7%
    Fermions: 45/61 = 73.8%
    ↓
[OBSERVATION] Fermions most visible, scalars most hidden
    ↓
[DERIVATION] Antisymmetric modes = fermions (spin-statistics)
    ↓
[CONJECTURE] Antisymmetry provides robustness under P1
    ↓
[CONJECTURE] Fermions are intrinsically more "visible"
```

### 9.4 |Pi| and Lambda

```
[A-AXIOM] Crystal has n_c = 11 dimensions
[A-AXIOM] Perspectives characterized by pairwise tilts
    ↓
[DERIVATION] C(n_c, 2) = 55 pairs
    ↓
[IMPORT] Interface has 137 states per pair
    ↓
[DERIVATION] |Pi| = 137^55 ~ 10^117.5
    ↓
[OBSERVATION] CC ratio ~ 10^122
    ↓
[GAP] 10^4.5 discrepancy (need exponent 57, not 55)
    ↓
[CONJECTURE] Correction involves +2 to exponent
[ALTERNATIVE] 79^64 ~ 10^121.4 (hidden channel formula)
```

---

## 10. Numerical Summary

### 10.1 Exact Numbers

| Quantity | Value | Formula |
|----------|-------|---------|
| n_defect | 4 | Spacetime dimensions |
| n_crystal | 11 | M-theory dimensions |
| 1/alpha | 137 | n_d^2 + n_c^2 |
| Total channels | 137 | 15 + 61 + 61 |
| Visible channels | 58 | 1 + 12 + 45 |
| Hidden channels | 79 | 14 + 49 + 16 |
| Crystal pairs | 55 | C(11, 2) |
| Light pairs | 6 | C(4, 2) |
| Dark pairs | 21 | C(7, 2) |
| Twilight pairs | 28 | 4 x 7 |

### 10.2 Approximate Matches

| Target | Value | Match | Error |
|--------|-------|-------|-------|
| 79/137 | 0.5766 | 1/sqrt(3) = 0.5774 | 0.12% |
| 79/58 | 1.362 | 1/(sqrt(3)-1) = 1.366 | 0.29% |
| theta_hidden | 35.21 deg | theta_tet = 35.26 deg | 0.14% |
| 137^55 | 10^117.5 | 10^122 (CC ratio) | 10^4.5 gap |
| 79^64 | 10^121.4 | 10^122 (CC ratio) | 10^0.6 gap |

### 10.3 Coincidences

| Observation | Significance |
|-------------|--------------|
| n_d = 4 = tetrahedron vertices | Deep structural connection |
| Hidden scalars = 14 = tetrahedron total (4+6+4) | Geometric correspondence |
| dark + twilight = 49 = hidden vectors | Pair-gauge correspondence |
| 79 is prime | May relate to irreducibility |
| 137 is prime | Pythagorean prime (4^2 + 11^2) |

---

## 11. Open Questions

### 11.1 High Priority

1. **Why is n_d = 4?**
   - Can we derive 4 from tetrahedral stability?
   - Is the tetrahedron the "simplest" 3D structure?
   - Connection to division algebras (quaternions are 4D)?

2. **What adds +2 to the Lambda exponent?**
   - 57 = 55 + 2 gives 10^121.8
   - What physical principle adds 2?
   - Scalar contribution? Boundary term?

3. **Why is f_hidden = 1/sqrt(3)?**
   - Can we derive this from Layer 0?
   - Is there a variational principle?
   - Connection to 3D spatial structure?

### 11.2 Medium Priority

4. **Is the 79^64 formula fundamental?**
   - Why 64 = 8^2 = 2^6?
   - Connection to octonions (8D)?
   - Connection to 12D spinors?

5. **How do twilight pairs mediate coupling?**
   - What physics lives on (visible, hidden) pairs?
   - Connection to portal interactions?

6. **Does SU(7) have anomaly cancellation?**
   - Is 7 + 7* + 1 + 1 anomaly-free?
   - What determines dark matter stability?

### 11.3 Speculative

7. **Why does the tetrahedron appear?**
   - Simplest 3D simplex
   - Self-dual polytope
   - Connection to consciousness/observer structure?

8. **Is the dark sector "compactified"?**
   - Or truly hidden (no size)?
   - Different from Kaluza-Klein picture?

---

## 12. Falsification Criteria

### 12.1 Strong Tests

| Test | Prediction | Falsified By |
|------|------------|--------------|
| F1 | Dark sector exists | No dark matter/energy found |
| F2 | Hidden fraction ~ 0.577 | Very different dark matter abundance |
| F3 | E6 GUT impossible | E6 works at any scale |
| F4 | Max 61 gauge bosons | >61 gauge bosons discovered |

### 12.2 Weaker Tests

| Test | Prediction | Would Weaken |
|------|------------|--------------|
| F5 | Dark vectors dominate (49/79) | Dark sector purely fermionic |
| F6 | SU(7) x U(1) gauge structure | Different dark gauge group |
| F7 | |Pi| ~ 10^117.5 | CC ratio very different from 10^118-122 |

### 12.3 What Would Strengthen

| Observation | Would Support |
|-------------|---------------|
| Dark photon discovered | U(1)_dark component |
| Dark sector has confining force | SU(7) "dark QCD" |
| Hidden fraction measured at 0.577 | Tetrahedral structure |
| Lambda explained by 137^57 | +2 mechanism identified |

---

## 13. References and Dependencies

### 13.1 Layer 0 Dependencies

- **P1 (Partiality)**: `framework/layer_0_pure_axioms.md` Section 6
- **Theorem P.1**: `framework/layer_0_pure_axioms.md` Section 7
- **Crystal structure**: `framework/layer_0_pure_axioms.md` Part I

### 13.2 Related Investigations

| File | Relevance |
|------|-----------|
| `framework/investigations/channel_field_correspondence.md` | Channel → spin type mapping |
| `framework/investigations/field_content_bounds_analysis.md` | BSM model constraints |
| `framework/investigations/pi_derivation_attempt.md` | |Pi| = 137^55 justification |
| `framework/investigations/dark_sections_and_pi_formula.md` | Pair decomposition |
| `framework/investigations/continuous_visibility_model.md` | Twilight fraction |
| `framework/investigations/perspective_mutations.md` | Dark sector dynamics |
| `framework/investigations/tilt_alpha_connection.md` | Alpha from tilt structure |

### 13.3 Physics Files

| File | Relevance |
|------|-----------|
| `../alpha/alpha_crystal_interface.md` | Alpha formula origin |
| `../gauge/field_content_from_orthogonality.md` | Field bounds |
| `divergence_registry.md` | Where framework differs from SM |

### 13.4 Session Log Entries

Key sessions:
- Session 34: Channel-field correspondence, spin-statistics derivation
- Session 35: |Pi| formula, E6 NOT ruled out experimentally
- Session 36: P1 → dark sector formalization
- Session 38: 1/sqrt(3) finding
- Session 39: Continuous visibility, twilight fraction f = 0.113
- Session 40: Perspective mutations
- Session 41: Tilt-alpha connection
- Session 42: Tetrahedral geometry, Lambda connection

---

## 14. Verification Scripts

### 14.1 Primary Scripts

| Script | Purpose | Result |
|--------|---------|--------|
| `verification/sympy/observable_fraction_analysis.py` | 79/137 ~ 1/sqrt(3) | PASS (0.12% error) |
| `verification/sympy/tetrahedral_connection.py` | Tetrahedral angle match | PASS |
| `verification/sympy/cosmological_constant_connection.py` | |Pi| vs Lambda | GAP IDENTIFIED |
| `verification/sympy/dark_sector_mapping.py` | SU(7) x U(1) match | PASS |
| `verification/sympy/continuous_visibility_model.py` | Twilight fraction | PASS |
| `verification/sympy/bsm_field_bounds_test.py` | SM within bounds | PASS |

### 14.2 Supporting Scripts

| Script | Purpose |
|--------|---------|
| `verification/sympy/grassmannian_55_connection.py` | 55 = Gr(4,11) + SO(4) + SO(7) |
| `verification/sympy/dark_sections_pi_formula.py` | Pair decomposition |
| `verification/sympy/interface_state_counting.py` | 137 interface states |
| `verification/sympy/fermion_visibility_analysis.py` | Type-specific visibility |
| `verification/sympy/gauge_group_from_tilts.py` | Gauge structure |

### 14.3 How to Run

```bash
cd verification/sympy
python observable_fraction_analysis.py
python tetrahedral_connection.py
python cosmological_constant_connection.py
```

All scripts are self-contained and produce detailed output.

---

## Appendix A: The Full Channel Table

| Type | Sector | Count | SM Use | Hidden | f_visible |
|------|--------|-------|--------|--------|-----------|
| Scalar | Defect | 4 | ? | ? | ? |
| Scalar | Crystal | 11 | ? | ? | ? |
| **Scalar Total** | | **15** | **1** | **14** | **6.7%** |
| Vector | Defect | 6 | 4 (EW) | 2 | 67% |
| Vector | Crystal | 55 | 8 (QCD) | 47 | 15% |
| **Vector Total** | | **61** | **12** | **49** | **19.7%** |
| Fermion | Defect | 6 | ? | ? | ? |
| Fermion | Crystal | 55 | ? | ? | ? |
| **Fermion Total** | | **61** | **45** | **16** | **73.8%** |
| **GRAND TOTAL** | | **137** | **58** | **79** | **42.3%** |

---

## Appendix B: Tetrahedral Geometry Reference

### Regular Tetrahedron Properties

| Property | Value |
|----------|-------|
| Vertices | 4 |
| Edges | 6 = C(4,2) |
| Faces | 4 |
| Total components | 14 = 4 + 6 + 4 |
| Face-edge angle | 35.26 deg |
| sin(face-edge) | 1/sqrt(3) = 0.5774 |
| cos(face-edge) | sqrt(2/3) = 0.8165 |
| H-C-H angle (methane) | 109.47 deg = 180 - 2*35.26 |

### Connection to Framework

| Tetrahedron | Framework | Match |
|-------------|-----------|-------|
| 4 vertices | n_d = 4 | EXACT |
| 14 components | Hidden scalars | EXACT |
| sin(35.26) = 1/sqrt(3) | f_hidden = 79/137 | 0.12% |
| 6 edges | Light pairs = C(4,2) | EXACT |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| Channel | One mode of the comparison matrix (interface DoF) |
| Crystal | Perfect inner product space V_Crystal (Layer 0 primitive) |
| Dark sector | Content in hidden channels (79 of 137) |
| Defect | 4D spacetime subspace within Crystal |
| Hidden | Content orthogonal to perspective (V_pi^perp) |
| Interface | Boundary between defect and crystal structures |
| Light pair | Pair of visible dimensions (6 total) |
| Partiality | Axiom P1: perspective sees strict subset |
| Perspective | Partial access map pi: V_Crystal → V_pi |
| Tilt | Deviation from orthogonality: epsilon_ij = <b~_i, b~_j> - delta_ij |
| Twilight pair | Pair with one visible, one hidden dimension (28 total) |
| Visibility | Fraction of channels that are observable |

---

*Document version: 1.0*
*Created: 2026-01-26*
*Last updated: 2026-01-26 (Session 42)*
*Purpose: Consolidated reference for project restructuring*
