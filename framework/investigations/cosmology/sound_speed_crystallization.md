# Sound Speed from Crystallization

**Status**: FALSIFIED (S198 — both c_s=3/7 and eta*=337 refuted by cosmological integrals)
**Created**: Session 189, 2026-02-02
**Last Updated**: Session 198, 2026-02-02

---

## Plain Language

When sound waves traveled through the early universe, they moved at a specific speed through the baryon-photon plasma — about 45% of the speed of light. This speed determines the size of the "sound horizon" (how far sound traveled before the universe cooled enough for atoms to form), which we measure precisely from the CMB.

The framework claims this speed is `c_s = 3/7`, the ratio of imaginary quaternion dimensions to imaginary octonion dimensions. This gives 0.429, which is about 5.6% below the standard physics value of 0.454.

This session tested 4 different paths to derive this value. **None succeeded.** The assignment "3 for photons, 7 for baryons" is a pattern match, not a derivation. The standard physics formula actually gives a *different* answer (0.454) even when using framework cosmological parameters.

The famous 0.01% match of the sound horizon `r_s = 337 × 3/7 = 144.43 Mpc` involves compensating errors: `η_* = 337` is ~18% too high and `c_s = 3/7` is ~5.6% too low compared to standard calculations.

**One-sentence version**: The claim c_s = 3/7 is an unproven pattern match that contradicts standard acoustic physics by 5.6%.

---

## Question

Can we derive c_s = Im_H/Im_O = 3/7 from framework principles, or is it numerology?

## The Claim

```
c_s = Im_H / Im_O = 3/7 ≈ 0.4286      [CONJECTURE]
r_s = η_* × c_s = 337 × 3/7 = 144.43 Mpc   [CONJECTURE × CONJECTURE]
```

Planck 2018 measurement: r_s = 144.43 ± 0.26 Mpc — matches to 0.01%.

## Four Derivation Paths Tested

### Path A: DOF Ratio — Grade F

**Hypothesis**: c_s² = (propagating modes)/(total modes)

| Test | Formula | Value | c_s |
|------|---------|-------|-----|
| A1 | Im_H/Im_O | 3/7 = 0.429 | 0.655 |
| A2 | Im_H/(Im_H+Im_O) | 3/10 = 0.300 | 0.548 |
| A3 | n_d/n_c | 4/11 = 0.364 | 0.603 |
| A4 | 1/3 (radiation limit) | 0.333 | 0.577 |

**Assessment**: The assignment "baryons = Im_O, photons = Im_H" is [A-PHYSICAL], not derived. No dynamics connect DOF counting to acoustic speed.

### Path B: Tilt Decomposition — Grade F

16 tilt DOF = 4 massive + 12 gauge (from S150).

- massive/gauge = 4/12 = 1/3 naturally gives the radiation-dominated limit
- Assigning "spatial = Im_H, internal = Im_O" restates Path A in different language

**Assessment**: Same assumption as Path A, no new derivation power.

### Path C: Standard Formula with Framework R* — Grade: INFORMATIVE

Standard physics: c_s² = 1/(3(1+R*)), R* = 3ρ_b/(4ρ_γ)

| Quantity | Standard | Framework | Conjectured |
|----------|----------|-----------|-------------|
| R* | 0.623 | 0.615 | — |
| c_s | 0.453 | 0.454 | 0.429 (3/7) |

**Key finding**: To get c_s² = 3/7 from the standard formula requires R* = -2/9 (negative = unphysical). The framework's Ω_b modification changes c_s by <1%, nowhere near the 5.6% gap.

**Assessment**: Path C **refutes** c_s = 3/7 within standard acoustic physics. The framework would need a fundamentally different acoustic equation to produce this value.

### Path D: Channel Weight — Grade D

Crystallization pressure channels: f_C = 1/11, f_H = 3/11, f_O = 7/11.

f_H/f_O = Im_H/Im_O = 3/7 by construction — this is **circular**.

**Assessment**: Recovers the value but provides no explanatory power.

## Compensating Errors Analysis

| Quantity | Framework | Standard | Measured | Deviation |
|----------|-----------|----------|----------|-----------|
| η_* (conformal time) | 337 Mpc | ~285 Mpc | — | +18% |
| c_s (sound speed) | 3/7 = 0.429 | 0.454 | — | -5.6% |
| r_s (product) | 144.43 Mpc | 129.4 Mpc | 144.43 Mpc | 0.00% |

The product matches because η_* is too high and c_s is too low, and these errors approximately cancel. This is a textbook **Precision Illusion** (see Skepticism Checklist red flag #5).

## Open Questions (Gap G-CMB-CS)

1. **Modified acoustic equation?** Does the crystallization framework predict a different wave equation for the baryon-photon plasma, one where c_s = 3/7 emerges naturally?
2. **η_* derivation**: If η_* ≠ 337 Mpc but instead ~285 Mpc (standard), then r_s = 285 × 0.454 = 129 Mpc, far from measurement. Both η_* and c_s need independent derivation.
3. **Physical meaning of 3/7**: If H-channel modes drive pressure and O-channel modes drive inertia, what dynamics produces this?
4. **Alternative**: Could r_s = 144.43 Mpc emerge from a *single* framework expression without factoring into η_* × c_s?

## Falsification (Session 198)

Both conditions that would falsify this claim have been met:

1. **eta* from cosmological integral gives 280.40 Mpc** (not 337) — 16.8% off. See `eta_star_cosmological_integral.py`.
2. **Effective average c_s = 0.515** from integral ratio r_s/eta* — not 3/7 = 0.429 (20% off).
3. **Compensating errors confirmed**: 337 x 3/7 = 144.43 matches r_s because high eta* and low c_s roughly cancel. Both factors are individually wrong.

The correct r_s = 144.48 Mpc (0.03% from Planck) is obtained from the standard GR integral with framework cosmological parameters, WITHOUT any framework-specific sound speed.

See `claims/FALSIFIED.md` entries F-8 and F-9.

## Dependencies

- Uses: [AXIOM] Division algebras (Im_H=3, Im_O=7), S169 crystallization pressure
- Used by: Sound horizon (r_s), CMB peak positions, CMB interpretation (Task 4)

## Verification

**Script**: `verification/sympy/sound_speed_from_crystallization.py` — 17/17 PASS

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| 131 | Initial claim r_s = 337 × 3/7 | Pattern match identified |
| 189 | 4-path derivation attempt | All paths fail. Gap G-CMB-CS OPEN. |
| 198 | Cosmological integral computation | c_s=3/7 and eta*=337 BOTH FALSIFIED. Compensating errors confirmed. |
