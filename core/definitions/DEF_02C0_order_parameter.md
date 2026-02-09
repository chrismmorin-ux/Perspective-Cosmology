# DEF_02C0 Definition: Order Parameter

**Tag**: 02C0
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: framework/investigations/crystallization/crystallization_dynamics.md
**Added**: Session 144 (formalization from S100-101)

---

## Requires

- [DEF_02A3: Tilt matrix]

## Provides

- Order parameter ε for crystallization dynamics
- Ground state value ε*

---

## Statement

The **order parameter** ε is the Frobenius norm of the tilt matrix:

```
ε = ‖ε_ij‖_F = √(Σ_ij |ε_ij|²)
```

where ε_ij = ⟨π(b_i), π(b_j)⟩ - δ_ij is the tilt matrix [DEF_02A3].

### Range

- ε = 0: Perfect crystal (all perspectives preserve orthogonality)
- ε > 0: Tilted state (perspectives deviate from crystal structure)
- ε = ε*: Ground state of crystallization dynamics

### Ground State

The order parameter has two physically distinct equilibrium values:

**Portal (cosmological) equilibrium:** [CONJECTURE]
```
ε*_portal = α² ≈ 5.33 × 10⁻⁵
```
[A-IMPORT: α = fine structure constant from measurement, or D: from DEF_02B3/THM_04A2 if identification proven]

**Argument**: Portal coupling between visible and hidden sectors requires two gauge vertices, giving amplitude √α × √α = α and probability |α|² = α². This sets the cosmological tilt magnitude and the CMB temperature fluctuation: δT/T = ε*_portal/3 ≈ 1.78 × 10⁻⁵ (matches measured to 0.2%). **Note**: The "two gauge vertices" argument is [CONJECTURE] — the vertex-crystallization correspondence is unproven (THM_04A2 Gap G4).

**Mexican hat (local dynamics) equilibrium:** [CONJECTURE]
```
ε*_MH = α ≈ 7.30 × 10⁻³
```
[A-IMPORT: α = fine structure constant; A-IMPORT: M_Pl = Planck mass]

**Argument**: The Mexican hat potential W(ε) = -a ε² + b ε⁴ with b = α M_Pl⁴ gives ε*_MH = √(a/(2b)) = α. This sets the tilt mass at the GUT scale: m_tilt ≈ 2 × 10¹⁶ GeV. **Note**: The relation b = α M_Pl⁴ is asserted, not derived from axioms.

**Relationship**: ε*_portal = (ε*_MH)² -- probability equals amplitude squared. The cosmological parameter is the transition probability associated with the local dynamics amplitude.

**Convention note**: When "ε*" appears without qualification, context determines which is meant: cosmological/CMB contexts use ε*_portal = α²; dynamics/particle physics contexts use ε*_MH = α. See `verification/sympy/eps_star_convention_resolution.py` (S171, 18/18 PASS).

---

## Dependencies

- [DEF_02A3]: Tilt matrix (defines ε_ij)
- [AXM_0114]: Tilt possibility (ε > 0 is possible)
- [AXM_0117]: Crystallization tendency (dynamics drives toward ε*)

## Used By

- Crystallization Lagrangian
- Hilltop inflation potential [DEF_02C4]
- SO(11) symmetry breaking chain
- All cosmological observable derivations

---

## Verification

- `verification/sympy/crystallization_order_parameter.py` — 6/6 PASS
- `verification/sympy/crystallization_lagrangian.py` — 8/8 PASS
- `verification/sympy/eps_star_convention_resolution.py` — 18/18 PASS (S171: resolves α² vs α)

---

## Notes

The order parameter ε plays the role of the inflaton field in the cosmological context. The hilltop potential V(ε) = V₀(1 - ε²/μ²) governs inflationary dynamics with ε starting near 0 (symmetric phase) and rolling toward ε* (broken phase).

**Symbol disambiguation (Session 189, CR-079)**: The scalar order parameter ε (this definition) is the Frobenius norm ‖ε_ij‖_F of the tilt matrix ε_ij (DEF_02A3). These are different mathematical objects — a scalar vs. a tensor. The slow-roll parameter ε_SR (DEF_02C4) is yet a third quantity. See DEF_0200 for the full disambiguation table.
