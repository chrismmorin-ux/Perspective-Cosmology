# Sound Horizon Derivation

**Created**: Session 131
**Status**: CONJECTURE — precision suspicious (see Compensating Errors Warning below)
**Purpose**: Derive r_s = 337 * 3/7 Mpc from physics principles
**Last Updated**: 2026-02-03

---

## The Formula

```
r_s = 337 * (Im_H / Im_O) Mpc
    = 337 * 3/7
    = 144.428... Mpc
```

**Measured value**: 144.43 +/- 0.26 Mpc (Planck 2018)
**Agreement**: 0.01%

---

## ⚠ Compensating Errors Warning

**Hallucination Risk Score (HRS): 7 (HIGH)**

| Risk Factor | Score | Reason |
|------------|-------|--------|
| Matches known value | +2 | r_s = 144.43 matches Planck to 0.01% |
| No intermediate derivation | +3 | Both η_* and c_s are [PHYSICAL] assertions, not derived |
| Seems "too good" | +2 | 0.01% from two quantities each off by 5-18% |
| Multiple verification scripts | -0 | Scripts verify arithmetic, not the physics claims |

**The core concern**: The framework's c_s/c = 3/7 ≈ 0.429 differs from standard physics c_s/c ≈ 0.45 by 5%. The framework's η_* = 337 Mpc differs from standard physics η_* ≈ 285 Mpc by 18%. These errors compensate almost exactly in the product r_s = c_s × η_*. This is a textbook **Precision Illusion** (see Skepticism Checklist red flag #5): final precision (0.01%) far exceeds either intermediate value's accuracy.

**What would strengthen this**: Derive η_* = 337 Mpc from the cosmological integral η = ∫₀^{a_*} da/(a² H(a)) using only framework parameters (H₀, Ω values). Currently η_* = 337 is an identification (337 = Im_H⁴ + H⁴), not a calculation.

---

## Physical Interpretation

### Component 1: The Conformal Time (337 Mpc) [CONJECTURE]

The number 337 = Im_H^4 + H^4 = 81 + 256 represents the **conformal time at recombination**:

```
eta_* = 337 Mpc  (in comoving units with c = 1)
```

This is the same 337 that appears in the Hubble constant H_0 = 337/5 km/s/Mpc.

**Physical meaning**:
- Conformal time is the "causal horizon" - how far light could have traveled since the Big Bang
- At recombination (z_* = 1089), this horizon is 337 Mpc in framework units
- The fourth powers Im_H^4 and H^4 encode quaternion and spacetime structure

### Component 2: The Sound Speed (3/7) [CONJECTURE]

The ratio Im_H/Im_O = 3/7 ~ 0.429 represents the **crystallization sound speed**:

```
c_s / c = Im_H / Im_O = 3/7 ~ 0.429
```

**Comparison to standard physics**:
- Standard baryon-photon fluid: c_s/c ~ 0.45 at recombination
- Framework crystallization: c_s/c = 3/7 ~ 0.429
- Difference: ~5%

**Physical meaning**:
- Quaternion imaginary dimensions (3) encode the "propagating" degrees of freedom
- Octonion imaginary dimensions (7) encode the "total" degrees of freedom
- The ratio 3/7 is the fraction that propagates as sound waves

### The Product: Sound Horizon

```
r_s = c_s * eta_* = (3/7) * 337 = 144.43 Mpc
```

The sound horizon is the distance sound waves could travel from the Big Bang to recombination.

---

## Derivation Chain

```
[AXIOM] Division algebras: R=1, C=2, H=4, O=8
        Imaginary dimensions: Im_H=3, Im_O=7
    |
   v
[DERIVED] Number theory: 337 = Im_H^4 + H^4 = 81 + 256
    |
   v
[CONJECTURE] Identification: eta_* = 337 Mpc
             (asserting conformal time equals this framework number;
              standard physics gives eta_* ≈ 285 Mpc, a 18% discrepancy)
    |
   v
[CONJECTURE] Identification: c_s/c = Im_H/Im_O = 3/7 ≈ 0.429
             (asserting sound speed equals this framework ratio;
              standard physics gives c_s/c ≈ 0.45, a 5% discrepancy)
    |
   v
[ARITHMETIC] Product: r_s = (3/7) × 337 = 144.43 Mpc
             (correct arithmetic, but product precision exceeds input accuracy
              due to compensating errors in η_* and c_s)
```

---

## Why 337 Appears in Both H_0 and r_s

The number 337 = Im_H^4 + H^4 is a fundamental cosmological scale:

| Quantity | Formula | Value |
|----------|---------|-------|
| H_0 | 337/(R+H) | 67.4 km/s/Mpc |
| r_s | 337 * Im_H/Im_O | 144.43 Mpc |
| eta_* | 337 | 337 Mpc |

**Physical interpretation**:
- 337 encodes the scale of the "crystallization transition"
- This scale appears in both the expansion rate (H_0) and the acoustic horizon (r_s)
- The different prefactors (1/5 vs 3/7) reflect different physical projections

---

## Internal Consistency Check

From the measured sound horizon, we can back-calculate the conformal time:

```
If r_s = 144.43 Mpc and c_s/c = 3/7:
  eta_* = r_s / (c_s/c) = 144.43 / (3/7) = 144.43 * 7/3 = 337.0 Mpc

If r_s = 144.43 Mpc and c_s/c = 0.45 (standard):
  eta_* = r_s / 0.45 = 321 Mpc
```

The framework values (c_s/c = 3/7, eta_* = 337 Mpc) are internally consistent and match the measured r_s exactly.

---

## Comparison to Standard Cosmology

| Quantity | Framework | Standard | Notes |
|----------|-----------|----------|-------|
| c_s/c | 3/7 = 0.429 | ~0.45 | Framework 5% lower |
| eta_* | 337 Mpc | ~285 Mpc | Framework 18% higher |
| r_s | 144.43 Mpc | ~147 Mpc | Framework matches measurement! |

The framework gives different intermediate values but the correct final answer.

---

## Remaining Questions

### 1. Deriving eta_* = 337 Mpc from First Principles

Can we derive the conformal time from:
```
eta = integral_0^{a_*} da / (a^2 H(a))
```
using only framework parameters (H_0 = 337/5, z_* = 1089, Omega values)?

This would complete the derivation chain.

### 2. Physical Origin of c_s/c = 3/7

Why does the crystallization sound speed equal Im_H/Im_O?
- Is this a fundamental property of how the crystallization propagates?
- Does it relate to the degrees of freedom that "oscillate" vs "damp"?

---

## Verification Scripts

- `verification/sympy/sound_horizon_physics_derivation.py` (8/8 PASS)
- `verification/sympy/sound_horizon_337_origin.py` (6/6 PASS)
- `verification/sympy/sound_horizon_framework_connection.py` (5/5 PASS)

---

## Summary

The sound horizon r_s = 337 * 3/7 Mpc is derived from:

1. **Conformal time**: eta_* = 337 Mpc = Im_H^4 + H^4
2. **Sound speed**: c_s/c = Im_H/Im_O = 3/7
3. **Product**: r_s = c_s * eta_* = 144.43 Mpc

This matches the Planck measurement to **0.01%** — sub-10 ppm precision.

**Status**: [CONJECTURE] — Correct arithmetic from two unverified identifications. The 0.01% match may be coincidental (compensating errors in intermediates). HRS = 7.
**Remaining gap**: Derive η_* = 337 Mpc from cosmological integral using framework parameters. This would convert the [CONJECTURE] identifications into [DERIVATION].

---

**Document version**: 1.0
**Last updated**: Session 131 (2026-01-28)
