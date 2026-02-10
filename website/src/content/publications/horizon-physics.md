---
title: 'Horizon Physics: Black Holes & de Sitter'
description: 'Black hole entropy, Hawking temperature, and de Sitter thermodynamics derived from division algebra structure. 128/128 tests PASS across 13 scripts.'
version: '1.0'
lastUpdated: '2026-02-10'
---

# Horizon Physics: Black Holes & de Sitter

**Last Updated**: 2026-02-10
**Version**: 1.0
**Status**: CANONICAL
**Verification**: 128/128 PASS across 13 scripts
**Reading Time**: ~25 minutes

---

## Plain Language Summary

Black holes have a temperature and an entropy. These were discovered by Hawking and Bekenstein in the 1970s, but the factors of 4 and 8 that appear in the formulas have never been explained from first principles. They are usually treated as consequences of the specific geometry of general relativity.

In the Perspective Cosmology framework, these factors have direct algebraic meaning. The 4 in Bekenstein-Hawking entropy (S = A/4) is n_d, the quaternion dimension -- the same number that gives spacetime four dimensions. The 8 in Hawking temperature (T = 1/8piM) is C x H = 2 x 4, the product of complex and quaternion dimensions -- which equals the octonion dimension O = 8.

Even more striking: the same prime number 13 = C^2 + Im(H)^2 = 4 + 9 appears in three independent horizon quantities -- the dark energy fraction, the Hubble tension ratio, and the de Sitter temperature. This suggests a deep connection between horizon physics and electroweak structure.

**One-sentence version**: The numerical factors in black hole thermodynamics are division algebra dimensions, and a single "electroweak prime" (13) unifies all horizon observables.

---

## Black Hole Entropy

**Confidence**: [DERIVATION]

### Bekenstein-Hawking Formula

The standard result is S_BH = A / (4 L_Pl^2). In the framework:

```
S_BH = A / (n_d * L_Pl^2)    where n_d = 4
```

The factor 4 = n_d arises because:
- The horizon is a codimension-2 surface in n_d-dimensional spacetime
- Degrees of freedom project from crystal dimension (n_c = 11) to spacetime dimension (n_d = 4)
- The quaternion algebra H determines the spacetime structure [A-AXIOM]

This is not a new prediction -- it reproduces the known result. What is new is the identification: the 4 is not arbitrary but is the dimension of the quaternion algebra that generates Lorentz structure.

Verified: 7/7 PASS (bekenstein_hawking_factor.py)

---

## Hawking Temperature

**Confidence**: [DERIVATION]

### The Factor 8 = C x H = O

The standard Hawking temperature is T_H = M_Pl^2 / (8 pi M). In the framework:

```
T_H = M_Pl^2 / (C * n_d * pi * M)    where C * n_d = 2 * 4 = 8
```

The factor decomposes as:
- **C = 2**: Thermal/statistical factor from complex structure
- **n_d = 4**: Spacetime projection from quaternion algebra

The product C x H = 2 x 4 = 8 = O is the **octonion dimension**. This means:
- Entropy probes H (quaternionic spacetime) with factor 4
- Temperature probes C x H = O (octonionic gauge) with factor 8

### Thermodynamic Consistency

The first law dM = T dS is verified:
- S = 4 pi M^2 / M_Pl^2, so dS/dM = 8 pi M / M_Pl^2
- T * dS/dM = [M_Pl^2 / (8 pi M)] * [8 pi M / M_Pl^2] = 1

Verified: 8/8 PASS (hawking_temperature_derivation.py)

---

## De Sitter Horizon

**Confidence**: [DERIVATION]

### Same Factor, Different Scale

The de Sitter (cosmological) horizon entropy uses the same formula:

```
S_dS = A / (n_d * L_Pl^2) = 231 pi * alpha^(-56)
```

The value ~10^122 matches the observed cosmological entropy. The same n_d = 4 factor appears because both black hole and cosmological horizons are **crystallization boundaries** -- surfaces where crystallization reaches completeness.

### De Sitter Temperature

```
T_dS = H / (2 pi) * sqrt(13/19)
```

The ratio T_dS / T_Hubble = sqrt(13/19) connects to the electroweak prime 13, discussed below.

Verified: 9/9 PASS (de_sitter_horizon_thermodynamics.py)

---

## The Prime 13 Unification

**Confidence**: [DERIVATION]

The most striking result: a single prime number unifies all horizon observables.

```
13 = C^2 + Im(H)^2 = 4 + 9
```

This is the sum of squared complex dimension and squared imaginary quaternion dimension -- the **electroweak structure constant** of the framework.

### Three Appearances

| Quantity | Formula | Value | Meaning |
|----------|---------|-------|---------|
| Dark energy fraction | Omega_Lambda = 13/19 | 0.684 | Fraction of universe in dark energy |
| Hubble tension ratio | H_local/H_CMB = 13/12 | 1.083 | Local vs. CMB expansion rates |
| dS temperature ratio | T_dS/T_Hubble = sqrt(13/19) | 0.828 | De Sitter vs. Hubble temperature |

The denominators also have algebraic meaning:
- **19 = n_c + O** (crystal + octonion = 11 + 8 = cosmic total)
- **12 = H + O** (quaternion + octonion = 4 + 8 = gauge total)

### New Thermodynamic Identity

```
sqrt(Omega_Lambda) = T_dS / T_Hubble
```

The square root of the dark energy fraction equals the de Sitter temperature ratio. This connects cosmological composition to horizon thermodynamics through the electroweak prime 13.

Verified: 9/9 PASS (horizon_prime_13_unification.py)

---

## Complete Factor Table

| Quantity | Numerical factor | Decomposition | Algebras |
|----------|-----------------|---------------|----------|
| BH entropy | 4 | n_d | H (quaternion) |
| BH temperature | 8 | C * n_d | C x H = O (octonion) |
| dS entropy | 4 | n_d | H (quaternion) |
| dS temperature ratio | sqrt(13/19) | sqrt(EW/cosmic) | C^2+Im(H)^2 / n_c+O |
| Hubble tension | 13/12 | EW/gauge | C^2+Im(H)^2 / H+O |
| Dark energy fraction | 13/19 | EW/cosmic | C^2+Im(H)^2 / n_c+O |
| Lambda exponent | 56 | O * Im_O | 8 x 7 |

Every factor traces back to the four division algebras R, C, H, O.

---

## Grey-Body Factors

**Confidence**: [DERIVATION]

Hawking radiation is not perfectly thermal -- grey-body factors modify the spectrum. The framework predicts:

**Spin suppression**: Gamma(s)/Gamma(0) ~ 1/n_d^s = 1/4^s
- Spin 1 suppressed by 1/4
- Spin 2 suppressed by 1/16

**High-frequency limit**: Gamma_high = Im(H)^3 / n_d^2 = 27/16 = 1.6875

**Stefan-Boltzmann exponent**: P ~ T^(n_d) = T^4. The exponent IS the spacetime dimension.

**Universal thermal factor**: C = 2 appears in all low-frequency power laws.

Verified: 9/9 PASS (grey_body_factors_crystallization.py)

---

## Unified Horizon Interpretation

Both black hole and de Sitter horizons are **crystallization boundaries**:

**Black hole horizon**: Region where crystallization reaches completeness (epsilon -> epsilon*). The interior is highly crystallized; the horizon marks the boundary. Entropy counts degrees of freedom on the 2D boundary.

**De Sitter horizon**: Boundary of observable crystallization. The interior is our crystallized universe; the horizon is the causal limit. Maximum entropy in the observable universe.

**Common features**:
- Same entropy formula S = A/(n_d * L_Pl^2)
- Same n_d = 4 factor from quaternion structure
- Information stored holographically on 2D surface
- Both emerge from crystallization dynamics, not postulated geometry

---

## Additional Identities

### Cosmological Constant Denominator

```
77 = n_c^2 - n_d * n_c = 121 - 44
```

The number 77 appearing in the cosmological constant structure derives from crystal squared minus spacetime-crystal product. Verified: 9/9 PASS (horizon_prime_13_unification.py)

---

## Verification Summary

| Script | Tests | Status |
|--------|-------|--------|
| bekenstein_hawking_factor.py | 7/7 | PASS |
| hawking_temperature_derivation.py | 8/8 | PASS |
| bh_entropy_microscopic.py | 8/8 | PASS |
| event_horizon_orthogonality.py | 8/8 | PASS |
| bh_surface_gravity_derivation.py | 9/9 | PASS |
| kerr_black_hole_crystallization.py | 12/12 | PASS |
| bh_information_paradox_resolution.py | 11/11 | PASS |
| bh_dimensional_crystallization.py | 15/15 | PASS |
| quantum_gravity_unitarity.py | 15/15 | PASS |
| de_sitter_horizon_thermodynamics.py | 9/9 | PASS |
| horizon_prime_13_unification.py | 9/9 | PASS |
| hawking_temperature_factor_8.py | 8/8 | PASS |
| grey_body_factors_crystallization.py | 9/9 | PASS |
| **Total** | **128/128** | **100%** |

All scripts available in the [verification portal](/verify).

---

## Confidence Summary

| Claim | Tag | Notes |
|-------|-----|-------|
| S = A/(4 L_Pl^2) with 4 = n_d | [DERIVATION] | Frobenius theorem; 7/7 PASS |
| T = 1/(8 pi M) with 8 = C x H | [DERIVATION] | First law verified; 8/8 PASS |
| C x H = O (2 x 4 = 8) | [THEOREM] | Algebraic identity |
| Prime 13 unification | [DERIVATION] | Three ratios verified; 9/9 PASS |
| sqrt(Omega_Lambda) = T_dS/T_Hubble | [DERIVATION] | New thermodynamic identity |
| Grey-body 1/4^s suppression | [DERIVATION] | Power laws verified; 9/9 PASS |
| 77 = n_c^2 - n_d * n_c | [THEOREM] | Algebraic identity |
