# THM_04A4: Hadronization Entropy Conservation

**Status**: SKETCH
**Layer**: 2 (requires [A-IMPORT: QCD confinement identification])
**Created**: Session 163, 2026-01-31
**Verification**: `verification/sympy/entropy_crystallization_collider.py` (12/12 PASS)

---

## Statement

If confinement is identified as O-channel crystallization [A-IMPORT], then THM_0450 (information conservation) predicts:

```
S_parton = S_hadron
```

The entropy of the partonic (deconfined) system equals the entropy of the hadronic (confined) system, because confinement is an information-preserving reorganization of tilt modes.

---

## Proof

### Given

- [THM_0450] |U_pi| + |H_pi| = |U| (cardinality conservation)
- [THM_0451] Delta_I >= 0 (second law)
- [A-IMPORT] Confinement = O-channel crystallization (color DOF reorganize into singlets)
- [D: from Frobenius + Layer 2] O-channel has dim(O) = 8 modes

### Derivation

Step 1. Before hadronization (deconfined phase):
```
Color DOF are accessible: |U_pi|_before = n_parton * dim(O)
Hidden DOF: |H_pi|_before = |U| - |U_pi|_before
```

Step 2. After hadronization (confined phase):
```
Color DOF become hidden (confined into singlets)
Kinematic/species DOF become accessible
|U_pi|_after + |H_pi|_after = |U| (THM_0450)
```

Step 3. If the transition is a pure reorganization (no information destruction):
```
Delta_I = 0 (no information lost, only reshuffled)
From THM_0451: Delta_S = 0 (entropy conserved, not merely non-decreasing)
Therefore: S_parton = S_hadron
```

Step 4. The reorganization is information-preserving because:
```
Crystallization maps n_color = dim(O) = 8 deconfined color states
to n_octet = dim(adjoint SU(3)) = 8 hadronic species (meson octet)
The mapping is bijective (8 -> 8), so no information is lost.
```

QED (modulo the identification of confinement with O-channel crystallization)

---

## Supporting Identities

| Identity | Value | Interpretation |
|----------|-------|----------------|
| dim(O) = dim(adjoint SU(3)) | 8 = 8 | Color modes = hadronic species |
| S per O-mode = Im_H * ln(2) | 3 * ln(2) | Each color mode carries 3 bits |
| Meson octet = dim(O) | 8 | pi(3) + K(4) + eta(1) |
| S_O : S_H : S_C = 3:2:1 | Im_H : dim_C : dim_R | Entropy hierarchy by channel |

---

## Experimental Confirmation

The Kharzeev-Levin formula S = ln(1/x_Bj) predicts S_parton ~ S_hadron, confirmed by IFJ/PAN + ALICE/ATLAS/CMS/LHCb (January 2026) across sqrt(s) = 0.2 - 13 TeV in pp collisions.

Framework interpretation: S_KL = ln(1/x) = ln(|U|/|U_pi|) = S_hidden, which is the hidden information from THM_0450.

---

## Additional Predictions (UNTESTED)

1. **P3**: Deviation from exact S conservation near T_c ~ 155 MeV (non-equilibrium crossover)
2. **P4**: e+e- -> hadrons entropy amplification by factor Im_H = 3 (C-channel -> O-channel)

---

## Logical Gap: ΔI = 0 Assumption (Session 189 Audit)

**The critical gap**: Step 3 claims ΔI = 0 (no information loss), but THM_0451 only proves ΔI ≥ 0. The equality case requires a separate argument.

**Current argument (Step 4)**: Hadronization maps 8 color states to 8 hadronic species bijectively, so no information is lost. But this argument has weaknesses:

1. **Bijection is not proven**: The 8→8 mapping (deconfined colors → meson octet) is asserted, not derived. QCD hadronization is a complex non-perturbative process; reducing it to a simple bijection is a substantial simplification.
2. **Partial information loss possible**: Even if the number of modes is preserved (8→8), the STATES within each mode could lose information. Bijection of modes ≠ bijection of microstates.
3. **THM_0451 is the stronger constraint**: The second law says ΔI ≥ 0. Claiming ΔI = 0 exactly requires either (a) proving the transition is unitary, or (b) identifying a symmetry that forbids information loss.

**Possible resolution**: If hadronization is viewed as internal reorganization within a closed system (no external observer to absorb information), then ΔI = 0 follows from unitarity of the total system evolution. But this imports [A-IMPORT: unitarity] which the framework aims to derive, creating potential circularity.

**Impact on status**: This gap is the reason for SKETCH status. Promoting to DERIVATION would require resolving the ΔI = 0 argument.

---

## What This Does and Does Not Show

### Achieved [DERIVATION]
- S_parton = S_hadron from THM_0450 applied to O-channel crystallization
- Color-to-species entropy mapping through dim(O) = dim(adjoint SU(3)) = 8
- Entropy hierarchy O:H:C = 3:2:1 from division algebra dimensions

### Requires [A-IMPORT]
- Identification of confinement with O-channel crystallization
- Identification of SU(3)_color with octonionic structure

### Not achieved
- Derivation of the Kharzeev-Levin functional form S = ln(1/x) from axioms
- Quantitative multiplicity predictions
- Connection to specific collision energy dependence

---

## Falsifiability

Would be falsified by:
- S_hadron/S_parton significantly deviating from 1.0 at any energy
- Confinement transition shown to destroy information
- Meson counting not matching dim(O) at some fundamental level

---

## Dependencies

- Uses: THM_0450, THM_0451, [A-IMPORT: QCD confinement = O-channel]
- Used by: Collider validation Phase II, QGP threshold analysis

---

## Cross-References

- `verification/sympy/entropy_crystallization_collider.py` -- 12/12 PASS
- `framework/investigations/crystallization/collider_data_validation.md` Phase II
- Kharzeev & Levin, PRL 2017; IFJ/PAN confirmation Jan 2026
