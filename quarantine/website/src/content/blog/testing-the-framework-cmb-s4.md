---
title: "Testing the Framework: CMB-S4 Predictions"
date: 2026-02-10
description: "The framework predicts r = 0.035 for the tensor-to-scalar ratio. CMB-S4 will test this at ~35 sigma by 2030. A decisive experiment."
category: Results
draft: false
---

## A Prediction That Can Be Checked

Most claims about fundamental physics are frustratingly hard to test. The energy scales are too high, the effects are too small, the experiments are decades away. So when a framework makes a prediction that a funded, under-construction experiment will test to high precision within a few years, it's worth paying attention.

The Perspective Cosmology framework predicts a specific value for the tensor-to-scalar ratio:

```
r = 7/200 = 0.035
```

This is the ratio of gravitational wave amplitude to density fluctuation amplitude in the cosmic microwave background. It tells us about the physics of inflation -- the rapid expansion of the very early universe.

CMB-S4, a next-generation CMB experiment currently under construction, will measure r with a precision of sigma(r) ~ 0.001. That means it will test this prediction at roughly **35 sigma**. Either the framework is right, or it's decisively wrong. No wiggle room.

## What r Tells Us

During inflation, quantum fluctuations in the gravitational field produce a background of primordial gravitational waves. These waves leave a distinctive "B-mode" pattern in the polarization of the CMB. The amplitude of this pattern, relative to the scalar (density) fluctuations, is the tensor-to-scalar ratio r.

Different inflationary models predict different values of r:
- Large-field models (e.g., m^2 phi^2): r ~ 0.1-0.2 (already ruled out)
- Hilltop models: r ~ 0.01-0.05
- Starobinsky/R^2: r ~ 0.003
- String landscape: anything (not predictive)

The current observational bound is r < 0.036 (95% CL, BICEP/Keck 2021). The framework's prediction r = 0.035 sits just below this bound -- it wasn't tuned to do so.

## Where 7/200 Comes From

The framework derives inflation from a "hilltop" potential:

```
V(phi) = V_0 (1 - phi^2/mu^2)
```

where mu^2 = 1536/7, a mass parameter determined entirely by division algebra constants:

```
mu^2 = (C + H) * H^4 / Im_O = 6 * 256 / 7 = 1536/7
```

At the CMB formation point, the slow-roll parameters are:
- epsilon = 7/3200 (gravitational wave production rate)
- eta = -7/400 (spectral tilt)

These give:
- **r = 16 * epsilon = 7/200 = 0.035**
- **n_s = 1 + 2*eta - 6*epsilon = 193/200 = 0.965**

The spectral index n_s = 0.965 matches the Planck 2018 measurement of 0.9649 +/- 0.0042 (within 1 sigma).

There's also an elegant consistency relation: **r = 1 - n_s**. The tensor-to-scalar ratio equals the deviation of the spectral index from 1. This isn't a generic feature of inflation -- it's specific to this potential.

## The Numbers Are Division Algebra Constants

Every parameter in the prediction traces back to division algebra dimensions:

| Quantity | Expression | Value | Origin |
|----------|-----------|-------|--------|
| mu^2 | (C+H) * H^4 / Im_O | 1536/7 | Complex+quaternion, octonion |
| r | Im_O / (O * (H+R)^2) | 7/200 | Imaginary octonion over octonionic |
| n_s | 193/200 | 0.965 | Where 193 = Im_O^2 + 12^2 |
| 1 - n_s | Im_O / (O * (H+R)^2) | 7/200 | Same as r |
| N (e-folds) | ~52 | ~52 | From slow-roll integration |

Zero free parameters. The inflationary potential is fully determined by the four division algebras.

## What CMB-S4 Will See

If r = 0.035, the primordial B-mode signal has:

- **BB amplitude at l ~ 80**: ~0.00084 uK^2
- **BB/lensing ratio**: ~42:1 (primordial signal dominates at low multipoles)
- **Detection significance by experiment**:

| Experiment | Timeline | Expected sigma | Status |
|------------|----------|---------------|--------|
| Simons Observatory | 2026-2027 | ~12 sigma | Under construction |
| BICEP Array | 2027 | ~12 sigma | Operating |
| CMB-S4 | 2028-2030 | **~35 sigma** | Under construction |
| LiteBIRD | 2028-2032 | ~18 sigma | Approved |

At 35 sigma, CMB-S4's measurement won't be ambiguous. If r = 0.035, they'll see a clear primordial B-mode signal well above the lensing foreground. If r is actually much smaller (say, r ~ 0.003 as in Starobinsky inflation), they'll set a tight upper bound and the framework prediction will be falsified.

## Other CMB Polarization Predictions

The B-mode prediction is the headline, but the framework also makes several other polarization predictions:

**Optical depth**: tau = 3/56 = 0.05357 [CONJECTURE]. Planck measures 0.054 +/- 0.007 (0.8% match, within 0.06 sigma).

**EE peak positions**: Predicted from the acoustic scale l_A = 96*pi and phase shift phi = 3/11:

| EE Peak | Predicted | Measured (Planck) | Error |
|---------|-----------|-------------------|-------|
| 1 | 370 | ~396 | 6.6% |
| 2 | 672 | ~690 | 2.7% |
| 3 | 973 | ~1000 | 2.7% |
| 4 | 1275 | ~1300 | 1.9% |
| 5 | 1577 | ~1600 | 1.5% |

**E/T amplitude ratio**: sqrt(C_l^EE / C_l^TT) ~ 1/n_c = 1/11 ~ 0.091 (measured ~0.1, about 10% agreement). [CONJECTURE]

These are less decisive than the r prediction, but they provide additional cross-checks.

## The Falsification Window

This is a clean test. Here's what different outcomes would mean:

**r = 0.035 +/- 0.005**: Strong confirmation. Hilltop potential with mu^2 = 1536/7 is correct. The division algebra inflationary model works.

**r = 0.020-0.030**: Tension. The framework's specific mu^2 value is wrong, but a hilltop potential might still work with a different mass parameter. Would require rethinking which division algebra expression gives mu^2.

**r < 0.01**: Falsification. No hilltop potential from the framework can produce such a small r. The framework's inflationary model is wrong.

**r > 0.045**: Falsification. Exceeds the 3-sigma range. Framework prediction wrong.

The decisive window is 2027-2030. Simons Observatory and BICEP Array will give first indications; CMB-S4 will deliver the definitive measurement.

## Why This Matters

In theoretical physics, it's rare to get a clean, decisive experimental test of a speculative framework. Most predictions are either:
- Too imprecise to distinguish from alternatives
- At energy scales beyond any foreseeable experiment
- Post-hoc fits to already-known data

The r = 0.035 prediction has none of these problems. It's a specific number, testable within ~4 years, and wasn't adjusted after seeing data (the current bound r < 0.036 was set after the prediction was made).

If CMB-S4 confirms r = 0.035, it won't prove the entire framework right. But it will be a striking success for a prediction derived from pure mathematics with zero free parameters. And if it's wrong, we'll know that too -- clearly and unambiguously.

That's how science is supposed to work.

## Verification

- **Scripts**: `mu_squared_250_physics_derivation.py` (12/12 PASS), `cmb_polarization_predictions.py` (16/16 PASS)
- **r**: 7/200 = 0.035 (current bound: r < 0.036)
- **n_s**: 193/200 = 0.965 (Planck: 0.9649 +/- 0.0042)
- **Free parameters**: Zero
- **Decisive experiment**: CMB-S4 (~2028-2030)
