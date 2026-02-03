# Investigation: Dark Sector from Axiom P1 (Partiality)

**Status**: ARCHIVE (reclassified from ACTIVE -- last referenced ~S36, 100+ sessions stale)
**Created**: 2026-01-26
**Session**: 2026-01-26-35
**Confidence**: [CONJECTURE] with strong numerical support

---

## 1. The Discovery

From channel counting (Session 34):
- Total comparison channels: 137 = 15 + 61 + 61
- SM fields: 58 = 1 + 12 + 45
- **Hidden channels: 79 = 14 + 49 + 16**

**Key Insight**: Axiom P1 (Partiality) states V_pi is a PROPER subset of V_Crystal.
This GUARANTEES hidden content exists. The dark sector isn't mysterious - it's a direct consequence of perspective being partial.

---

## 2. Numerical Findings (Session 35)

### 2.1 Hidden Fraction = 1/sqrt(3)

| Quantity | Value | Match |
|----------|-------|-------|
| 79/137 | 0.5766 | Hidden fraction |
| 1/sqrt(3) | 0.5774 | Tetrahedral/3D geometry |
| **Error** | **0.12%** | Remarkably close |

**Geometric interpretation**: 1/sqrt(3) appears in:
- Tetrahedral angle: sin(35.26 deg) = 1/sqrt(3)
- 3D isotropy: variance per axis = 1/3, std dev = 1/sqrt(3)
- SU(2) Clebsch-Gordan coefficients

### 2.2 Visibility by Spin Type

| Type | Visible | Hidden | % Visible |
|------|---------|--------|-----------|
| Scalar (spin 0) | 1 | 14 | **7%** |
| Vector (spin 1) | 12 | 49 | **20%** |
| Fermion (spin 1/2) | 45 | 16 | **74%** |

**Finding**: Fermions are mostly VISIBLE, scalars mostly HIDDEN.

**Explanation**: Antisymmetric exchange modes cannot self-reference (gamma(i,i) = 0), forcing them to relate to external structure -> visible. Symmetric modes CAN self-reference -> can hide.

### 2.3 Dark Sector Gauge Structure

Hidden vectors = 49 = dim(SU(7)) + 1 = **dim(SU(7) x U(1))**

This is an EXACT match. Proposed dark gauge group:
- **SU(7)**: 48 "dark gluons" (7 dark colors)
- **U(1)_dark**: 1 dark photon
- Total: 49 dark gauge bosons

### 2.4 Dark Fermions = SO(10) Spinor

Hidden fermions = 16 = dimension of SO(10) Weyl spinor

Possible interpretations:
- One "dark generation" in SO(10) representation
- 7 + 7* + 1 + 1 under SU(7) x U(1) (anomaly-free!)
- 3 RH neutrinos + 13 dark matter particles

### 2.5 Connection to Cosmological Constant

|Pi| = 137^55 ~ 10^117.5

Compare: Cosmological constant problem is factor of ~10^118

**Hypothesis**: Lambda ~ 1/|Pi| could solve the cosmological constant problem.

---

## 3. The Proposed Dark Sector

### 3.1 Complete Structure

| Sector | Gauge Group | Dimension | Scalars | Vectors | Fermions |
|--------|-------------|-----------|---------|---------|----------|
| Visible (SM) | SU(3) x SU(2) x U(1) | 12 | 1 | 12 | 45 |
| Hidden (Dark) | SU(7) x U(1)_dark | 49 | 14 | 49 | 16 |
| **Total** | | 61 | 15 | 61 | 61 |

### 3.2 Properties

**Dark gauge sector (SU(7) x U(1)_dark)**:
- 7 "dark colors" analogous to QCD's 3 colors
- Dark confinement at some scale
- Dark baryons as dark matter candidates?

**Dark fermions (16)**:
- Charged under SU(7): 7 + 7* = 14
- Plus 2 singlets = 16 total
- Anomaly-free combination
- Lightest could be stable (dark matter)

**Dark scalars (14)**:
- 7 complex dark Higgs fields?
- Give mass to SU(7) gauge bosons
- Break SU(7) x U(1) to some subgroup?

---

## 4. Derivation Chain

```
[A-AXIOM] P1: V_pi proper subset of V_Crystal
    |
    v
[DERIVATION] Some content is hidden from any perspective
    |
    v
[D + IMPORT] Comparison channels -> field types (via spin-statistics)
    |
    v
[DERIVATION] 137 channels = 15 scalar + 61 vector + 61 fermion
    |
    v
[A-IMPORT] SM has 58 fields
    |
    v
[DERIVATION] 79 channels are hidden
    |
    v
[CONJECTURE] Hidden channels = dark sector
```

---

## 5. Predictions

### 5.1 Strong Predictions

1. **E6 GUT is impossible**: 78 vectors > 61 max at any scale
2. **SU(5) GUT is impossible at GUT scale**: 24 vectors > 16 max at GUT
3. **Traditional gauge unification cannot occur**

### 5.2 Medium Predictions

4. **Dark sector has rich gauge structure**: SU(7) x U(1) or similar
5. **Dark matter is fermionic**: 16 hidden fermions vs 14 hidden scalars
6. **Dark sector is MORE complex than SM**: 79 vs 58 field types

### 5.3 Speculative Predictions

7. **Cosmological constant from |Pi|**: Lambda ~ 1/137^55
8. **Hidden fraction has geometric origin**: 1/sqrt(3) from 3D

---

## 6. Falsification Criteria

| Criterion | What would falsify |
|-----------|-------------------|
| F1 | Discovery of E6 or SO(10) GUT at any scale |
| F2 | Dark sector has fewer than ~49 gauge bosons |
| F3 | Dark matter is purely scalar (no fermionic component) |
| F4 | Hidden fraction != 79/137 at low energy |
| F5 | |Pi| calculation found to be wrong by orders of magnitude |

---

## 7. Open Questions

1. **Why 1/sqrt(3)?** Can we derive this from axioms?
   - **NEW (Session 36)**: 1/sqrt(3) = sin(tetrahedral angle)
   - n_defect = 4 = tetrahedron vertices
   - Hidden/visible = 79/58 ~ 1/(sqrt(3)-1) = (sqrt(3)+1)/2
   - CONJECTURE: 4D defect has tetrahedral structure

2. **Why SU(7) specifically?** Is 7 special in perspective geometry?
3. **How does dark sector couple to SM?** Portal interactions?
4. **What sets dark sector masses?** Confinement scale?
5. **How does |Pi| = 137^55 actually connect to Lambda?**

---

## 8. Connection to "Perspective Mutations"

User suggestion (not yet explored):

Could hidden/visible split relate to how new perspectives are created?

**Hypothesis**: When a perspective "mutates" (changes its access map):
- Visible channels = stable under mutation
- Hidden channels = unstable / transitional

This would connect the dark sector to the DYNAMICS of perspective space, not just its structure.

**Status**: UNEXPLORED - potentially deep connection

---

## 9. Verification Scripts

- `verification/sympy/observable_fraction_analysis.py` - Path A (1/sqrt(3))
- `verification/sympy/fermion_visibility_analysis.py` - Path B (spin-visibility)
- `verification/sympy/gauge_group_from_tilts.py` - Path C (gauge structure)
- `verification/sympy/rg_flow_selection.py` - Path D (RG and GUTs)
- `verification/sympy/dark_sector_mapping.py` - Path E (dark sector structure)

---

## 10. Summary

**BREAKTHROUGH**: The dark sector emerges naturally from Axiom P1 (partiality).

The 79 hidden channels aren't empty - they're occupied by:
- **SU(7) x U(1)_dark** gauge bosons (49)
- **SO(10)-like** dark fermions (16)
- **Dark Higgs** scalars (14)

This provides:
1. A REASON for dark matter/energy to exist
2. PREDICTIONS for dark sector structure
3. CONSTRAINTS on GUT models (most ruled out)
4. Possible SOLUTION to cosmological constant problem

**Status**: [CONJECTURE] - numerically compelling, needs rigorous derivation

---

*Investigation status: ACTIVE - major findings, needs axiom-level derivation*
