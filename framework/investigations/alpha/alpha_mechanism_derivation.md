# Alpha Mechanism: Formal Derivation

**Status**: CANONICAL (formalized from alpha_mechanism_exploration)
**Confidence**: [DERIVATION] for form; [CONJECTURE] for normalization options
**Created**: 2026-01-30
**Source**: alpha_mechanism_exploration.md (formalization with proper labeling)

---

## Requires

- [DEF_02B3: Interface Mode Count] — N_I = n_d² + n_c², s_I = 1/N_I
- [DEF_02A3: Tilt Matrix] — ε at defect–crystal interface
- [THM_0485: Complex Structure (F = C)] — U(n) symmetry at interface
- [THM_0484] / [AXM_0109], [AXM_0118] — n_d = 4, n_c = 11
- [A-IMPORT]: Identification of facet coupling with α = e²/(4πε₀ℏc) (Step 5 correspondence)

---

## Derivation Chain (Tagged)

### Step 1: Facet count [DERIVATION]

**[AXIOM]** Defect and crystal are orthogonal structures (contributions add; see alpha_crystal_interface, DEF_02B0).

**[DERIVATION]** Defect carries d_d = n_d² independent comparison directions (generators of U(n_d)); crystal carries d_c = n_c² (generators of U(n_c)). By orthogonality, total independent facets = d_d + d_c = **N_I** [DEF_02B3].

**Result**: Facet count = N_I = n_d² + n_c².

---

### Step 2: Dimensionless coupling per facet [CONJECTURE]

**[A-STRUCTURAL]** On each facet, dimensions from defect and crystal cancel (ratio or projection) to yield a dimensionless number.

**[CONJECTURE]** One unit of comparison per facet, equal weight over N_I facets (no preferred direction by U(n_d)×U(n_c) symmetry). Effective dimensionless coupling = (one unit) / N_I = **1/N_I**.

**Result**: α = 1/N_I at leading order (in interface-natural units).

---

### Step 3: Democratic average [DERIVATION]

**[DERIVATION]** The only U(n_d)×U(n_c)-invariant way to form a dimensionless number from N_I facets is equal weight. So effective coupling = democratic average = **1/N_I**.

**Result**: α = 1/N_I (invariant choice).

---

### Step 4: Correction term [DERIVATION]

**[DERIVATION]** Of the crystal’s n_c² = 121 generators, 111 are EM channels (off-diagonal + U(1)) = Φ₆(n_c) [alpha_correction_derivation]. Defect’s n_d = 4 modes couple to these 111. Refined form: 1/α = N_I + n_d/Φ₆(n_c) = **137 + 4/111**.

**Result**: 1/α = 137 + 4/111 (full formula).

---

### Step 5: Normalization (two options)

#### Option A: Normalization as convention [CONJECTURE]

**[CONJECTURE]** Adopt interface-natural charge units: ℏ = c = 1, 4πε₀ = 1. Define interface charge unit so that one unit of comparison per facet = one unit of charge. Then e² = 1/N_I ⇒ **α = e² = 1/N_I**. Framework predicts α = 1/N_I (and 1/α = 137 + 4/111 with correction).

#### Option B: Derivation from tilt kinetic term [DERIVATION]

**[DERIVATION]** Tilt gradient kinetic term S_kin = (κ/2) ∫ Tr[(∂_μ ε)(∂^μ ε)] [see tilt_gradient_kinetic_term]. In orthonormal generator basis: Tr[(∂ε)(∂ε)] = Σ_a (∂_μ ε_a)². U(n_d)×U(n_c) invariance ⇒ equal weight per a. Democratic combination ε_EM = (1/√N_I) Σ_a ε_a ⇒ kinetic term (N_I/2)(∂_μ ε_EM)². Gauging ⇒ photon kinetic term (N_I/4) F_μν F^μν ⇒ 1/g² = N_I ⇒ **g² = 1/N_I** ⇒ α = g² = 1/N_I in natural units.

**Result**: α = 1/N_I (either by convention or from kinetic term).

---

### Step 6: Identification with QED [A-IMPORT]

**[A-IMPORT]** The dimensionless coupling that lives on the cancellation facet is identified with the electromagnetic coupling: **α = e²/(4πε₀ℏc)**. Justification: the only universal, long-range, unbroken gauge coupling at the interface is electromagnetism; no other dimensionless coupling of order 1/N_I competes at low energy.

**Result**: Framework prediction α = 1/N_I (leading order), α = 1/(137 + 4/111) with correction; physical identification α = e²/(4πε₀ℏc).

---

## Summary Table

| Step | Claim | Tag | Source |
|------|-------|-----|--------|
| 1 | Facet count = N_I | [DERIVATION] | Orthogonality + DEF_02B3 |
| 2 | α = 1/N_I (per facet) | [CONJECTURE] | One unit per facet |
| 3 | Democratic average = 1/N_I | [DERIVATION] | U(n_d)×U(n_c) invariance |
| 4 | 1/α = 137 + 4/111 | [DERIVATION] | EM channels Φ₆(n_c), alpha_correction_derivation |
| 5A | Normalization by convention | [CONJECTURE] | Interface charge units e² = 1/N_I |
| 5B | Normalization from kinetic term | [DERIVATION] | tilt_gradient_kinetic_term → (N_I/4) F² |
| 6 | Facet coupling = α (QED) | [A-IMPORT] | Identification with e²/(4πε₀ℏc) |

---

## Verification

- **Formula**: `verification/sympy/alpha_enhanced_prediction.py` — 1/α = 137 + 4/111 (0.27 ppm).
- **Interface kinetic**: `verification/sympy/alpha_mechanism_interface_kinetic.py` — N_I = 137, coefficient N_I/2 for single field on all channels.

---

## Cross-References

- [DEF_02B3: Interface Mode Count] — N_I, s_I
- [framework/investigations/alpha/alpha_forced_vs_fitted.md] — Step 5 gap; this derivation closes it
- [framework/investigations/alpha/alpha_mechanism_exploration.md] — exploratory source
- [framework/investigations/gauge/tilt_gradient_kinetic_term.md] — formal tilt kinetic term
- [framework/investigations/alpha/alpha_correction_derivation.md] — EM channels = 111, Φ₆(n_c)
