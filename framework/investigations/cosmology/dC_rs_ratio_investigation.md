# d_C/r_s Ratio Investigation: Is 96 = O x (n_c + R) Meaningful?

**Status**: ACTIVE
**Created**: Session 198, 2026-02-02
**Last Updated**: Session 198, 2026-02-02

---

## Plain Language

When we look at the cosmic microwave background, two key distances matter: the *sound horizon* r_s (how far sound traveled in the early universe before atoms formed) and the *comoving distance* d_C (how far away the surface of last scattering is from us today). The ratio d_C / r_s determines the angular size of the CMB's acoustic pattern on our sky.

The framework's cosmological parameters produce d_C / r_s = 95.96, tantalizingly close to 96 = 8 x 12 = O x (n_c + R) in the framework's algebraic language (octonion dimension times crystal-plus-real dimension). This would mean the acoustic scale l_A = pi x d_C/r_s = 96 pi, a clean algebraic expression.

However, investigation reveals that Planck's best-fit parameters *also* give d_C/r_s = 96.09. The ratio is independent of H0 (it cancels between numerator and denominator) and depends only on matter/baryon/radiation content. The observationally allowed range spans [93.5, 99.3] — wide enough that landing near 96 has about a 17% probability by chance. So 96 is a feature of LCDM cosmology near observed parameters, not a unique framework prediction.

The framework *names* this ratio cleanly, but the naming has no discriminating power.

**One-sentence version**: d_C/r_s = 96 is confirmed by cosmological integrals but is a generic LCDM feature, not a unique framework prediction.

---

## Question

Is d_C/r_s = 96 = O x (n_c + R) a genuine framework prediction, or a post-hoc naming of a number that any LCDM cosmology near observed parameters produces?

## Background

The framework claims:
- l_A = 96 pi (acoustic scale) [CONJECTURE]
- 96 = O x (n_c + R) = 8 x 12 [A-AXIOM: division algebra dimensions]
- This gives l_1 ~ l_A / 1.375 ~ 219 (first acoustic peak)

Session 194 computed the full cosmological integrals:
- r_s = (c/H0) x integral_0^{a*} c_s(a) da / (a^2 E(a)) = 144.48 Mpc
- d_C = (c/H0) x integral_{a*}^{1} da / (a^2 E(a)) = 13864.08 Mpc
- d_C / r_s = 95.96

This confirmed l_A = 96 pi to 0.04%. But the question remained: is this specific to the framework's parameter values?

## Findings

### Finding 1: Framework and Planck Both Give ~96

**Confidence**: [OBSERVATION]

| Parameter Set | d_C/r_s | Distance from 96 |
|---|---|---|
| Framework (H0=67.4, Om_m=0.315, Om_b=567/11600) | 95.96 | 0.041% |
| Planck 2018 best-fit (H0=67.36, Om_m=0.3153, Om_b=0.04930) | 96.09 | 0.094% |

Both are within 0.1% of 96. The framework does NOT uniquely predict this ratio — standard Planck values give essentially the same answer.

**Verification**: `verification/sympy/dC_rs_ratio_investigation.py` — 6/6 PASS

### Finding 2: H0 Independence (Analytic)

**Confidence**: [THEOREM]

The ratio d_C/r_s is exactly independent of H0:

```
d_C = (c/H0) x I_dc    where I_dc = int_{a*}^{1} da/(a^2 E(a))
r_s = (c/H0) x I_rs    where I_rs = int_{0}^{a*} c_s(a) da/(a^2 E(a))

d_C/r_s = I_dc / I_rs   (c/H0 cancels)
```

The Hubble constant cancels exactly. Verified numerically: H0 from 60 to 80 km/s/Mpc produces d_C/r_s variation < 0.01.

The ratio depends only on: Om_m, Om_b, Om_r (radiation density), Om_L (dark energy), and z* (recombination redshift).

**Chain**: [D] from definition of d_C and r_s as integrals sharing the same c/H0 prefactor.

### Finding 3: Sensitivity Hierarchy

**Confidence**: [OBSERVATION]

| Parameter | Sensitivity (d ln(ratio) / d ln(param)) | Direction |
|---|---|---|
| z* | 0.671 | Positive (higher z* -> higher ratio) |
| H0 | -0.305 | But cancels — this is through Om_m/Om_r dependence |
| Om_m | -0.152 | Negative (more matter -> lower ratio) |
| Om_b | 0.096 | Positive (more baryons -> higher ratio) |

z* is the most sensitive parameter, but it's tightly constrained (1089 +/- 0.4) by hydrogen recombination physics.

### Finding 4: Observationally Allowed Range

**Confidence**: [OBSERVATION]

Scanning Om_m in [0.28, 0.35], Om_b in [0.045, 0.055], z* in [1085, 1095]:

```
Min d_C/r_s = 93.5
Max d_C/r_s = 99.3
Range width: 5.7
Mean: 96.4
Fraction within 0.5 of 96: ~17%
```

96 falls within the allowed range. The probability of being within 0.5 of *any given integer* in this range is ~17% — not particularly special.

### Finding 5: Analytic Approximation

**Confidence**: [DERIVATION]

Crude analytic estimate:

```
d_C/r_s ~ 2 * sqrt(Om_r) / (a* x <c_s> x sqrt(Om_m))
```

This gives ~104, off by ~8% from the numerical result. The approximation captures the parametric dependence but misses the detailed integration through the matter-radiation transition era.

The ratio is set by the relative sizes of the post-recombination expansion integral (mostly matter+Lambda dominated) vs. the pre-recombination sound integral (radiation+matter dominated with baryon loading).

### Finding 6: Verdict on Framework Predictivity

**Confidence**: [ASSESSMENT]

| Criterion | Result |
|---|---|
| Framework gives ~96 | YES (95.96) |
| Planck gives ~96 | YES (96.09) |
| 96 requires framework-specific parameters | NO |
| H0 = 337/5 contributes | NO (H0 cancels) |
| Om_m = 63/200 contributes | YES (moderately) |
| Om_b = 567/11600 contributes | YES (weakly) |
| 96 is special within allowed range | MARGINAL (~17% chance) |

**Conclusion**: d_C/r_s = 96 is a consequence of LCDM cosmology near the observed cosmological parameters. The framework *names* this ratio as O x (n_c + R), but this naming does not constitute a prediction — Planck best-fit independently gives the same value.

The formula l_A = 96 pi is **confirmed by the integral** to 0.04%, but should be classified as [CONJECTURE] with assessment: "algebraically clean naming of a generic LCDM result."

## Positive Findings (What IS Confirmed)

Despite the ratio not being uniquely predictive, this investigation confirms:

1. **r_s = 144.48 Mpc** from standard integrals with framework parameters (0.03% from Planck) — GENUINE
2. **r_d = 147.06 Mpc** from drag epoch integral (0.02% from Planck) — GENUINE
3. **l_A = 301.47** confirmed by integration (not just algebraic assertion)
4. **l_1 = 219.3** from full computation (0.34% from measured 220.0)
5. **theta_s = 0.01042** from d_C and r_s (0.095% from Planck)

These are genuine results of the framework's cosmological parameters propagated through standard GR.

## What Would Falsify This

- If future measurements show d_C/r_s significantly deviates from 96 (currently at 96.09 +/- ~0.3 from Planck)
- If the framework's Om_m or Om_b are shown to be wrong by independent derivation

## Dependencies

- Uses: [A-IMPORT] H0=67.4, Om_m=0.315, Om_b=567/11600, z*=1089, [A-IMPORT] N_eff=3.046, [I-MATH] Friedmann equation, standard c_s formula
- Used by: Peak positions (l_1 through l_7), angular power spectrum, CMB interpretation

## Verification

**Script**: `verification/sympy/dC_rs_ratio_investigation.py` — 6/6 PASS

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| 194 | d_C/r_s = 95.96 discovered from full integral | Prompted investigation |
| 198 | Full investigation: Planck comparison, sensitivity, parameter scan, analytic estimate | 96 is generic LCDM feature, not framework-specific |
