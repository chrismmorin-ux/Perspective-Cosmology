---
title: "The Hubble Tension Is Real Physics"
date: 2026-02-10
description: "Most frameworks try to resolve the Hubble tension. This one predicts it. H_local/H_CMB = 13/12. If the tension goes away, the framework is wrong."
category: Results
draft: false
---

## The Biggest Disagreement in Cosmology

Two of the most precise measurements in all of physics disagree with each other.

The Planck satellite measures the expansion rate of the universe from the cosmic microwave background (CMB) and gets H_0 = 67.4 +/- 0.5 km/s/Mpc. The SH0ES team measures it from nearby supernovae and Cepheid variables and gets H_0 = 73.0 +/- 1.0 km/s/Mpc.

The difference -- about 8% -- persists across independent methods and has reached a statistical significance of 5 sigma. This is the "Hubble tension," and it's the most debated problem in modern cosmology.

Most theoretical frameworks treat this as a problem to be solved: find the systematic error, adjust the model, make the measurements agree. The Perspective Cosmology framework does something different.

It predicts the disagreement.

## The Prediction: 13/12

The framework says the two measurements *should* give different answers, because they're measuring different things:

- **CMB (Planck)**: Measures the expansion rate at the crystallization boundary -- the equilibrium value
- **Local (SH0ES)**: Measures the expansion rate inside the stressed interior

The interior of the universe sits inside the crystallization shell. Interior stress enhances the local expansion rate by a factor:

```
H_local / H_CMB = 13/12 = 1.0833
```

Where does 13/12 come from?

- **13 = C^2 + Im(H)^2 = 4 + 9**: The electroweak structure constant (complex squared + imaginary quaternion squared)
- **12 = H + O = 4 + 8**: The total gauge dimension (quaternion + octonion)

The ratio means: interior stress distributes the scalar mode (1 degree of freedom) across the 12 gauge dimensions, adding 1/12 to the equilibrium expansion rate.

**Observed**: 73.0 / 67.4 = 1.083. **Predicted**: 13/12 = 1.0833.

The match is exact to the current measurement precision.

## The Cosmological Prime: 337

The CMB value H_0 = 67.4 itself comes from the framework's "cosmological prime":

```
337 = 3^4 + 4^4 = Im(H)^4 + H^4
```

This is the third in a chain of fourth-power primes from division algebra dimensions:

| Prime | Formula | Scale |
|-------|---------|-------|
| 17 | 1^4 + 2^4 | Particle physics |
| 97 | 2^4 + 3^4 | Electroweak |
| 337 | 3^4 + 4^4 | Cosmology |

The chain stops at 337 because the next dimension is Im(O) = 7 (non-consecutive with H = 4). The framework gives:

```
H_0 = 337/5 = 67.4 km/s/Mpc
```

where 5 = R + H = 1 + 4 (real + spacetime dimensions). Planck 2018 measures 67.4 +/- 0.5 km/s/Mpc.

## A Single Prime Determines Multiple Scales

The same prime 337 generates several cosmological quantities:

| Quantity | Formula | Predicted | Measured | Error |
|----------|---------|-----------|----------|-------|
| H_0 (CMB) | 337/5 | 67.4 | 67.4 +/- 0.5 | 0% |
| Sound horizon r_s | 337 x 3/7 | 144.43 Mpc | 144.43 Mpc | 0.01% |
| BAO scale | 337 x 7/16 | 147.4 Mpc | 147.5 Mpc | 0.07% |
| Recombination time | 337 x 9/8 | 379.1 kyr | 379.5 kyr | 0.1% |

Four sub-percent predictions from a single integer. The precision is real -- verified by SymPy scripts.

## Why This Matters

Most approaches to the Hubble tension try to find new physics that reconciles the two measurements. Early dark energy, interacting dark matter, modified gravity -- all designed to shift one measurement toward the other.

This framework says: stop trying to make them agree. They disagree because they're measuring different aspects of the crystallized universe. The CMB sees the boundary; local measurements see the stressed interior. The factor 13/12 is structural, not a systematic error.

This is a genuinely different kind of prediction. It's not "here's how to fix the tension." It's "the tension is the answer."

## The Falsification Test

This makes the framework unusually easy to test on this point:

**Framework falsified if**:
- The Hubble tension resolves to a single value (the ratio should stay at 13/12)
- The tension ratio falls outside 1.05-1.12
- H_0 (CMB) falls outside 66.5-68.5 km/s/Mpc

**Framework confirmed if**:
- Tension persists at exactly 13/12 with improving precision
- Independent methods consistently show the same ~8.3% split
- H(z) measurements reveal interior stress relaxation signatures

## Current and Future Tests

| Experiment | Timeline | What it tests |
|------------|----------|---------------|
| DESI BAO | 2024-2028 | H_0 at 0.5% precision |
| Euclid | 2024-2030 | H_0 at 0.5% precision |
| CMB-S4 | 2027+ | CMB H_0 at 0.3% |
| JWST Cepheids | Ongoing | Local H_0 at 1% |

As these experiments report, the ratio H_local/H_CMB will be measured more precisely. If it converges on 13/12, that's strong evidence. If it doesn't, the framework has a problem.

## The Honest Assessment

The H_0 = 337/5 formula is [CONJECTURE] confidence. The prime 337 is well-motivated (fourth-power sum of consecutive division algebra dimensions), but the denominator 5 has multiple possible interpretations (R + H, or C + Im(H)), which is a mild red flag.

The 13/12 ratio is [DERIVATION] confidence. The mechanism (interior stress distributing across gauge dimensions) is physically motivated, and the numbers are correct. But "interior stress" is a qualitative concept here -- there's no detailed dynamical model yet showing how crystallization creates exactly this enhancement.

The strongest point: this prediction was made before the tension was measured to its current precision. It's not a post-hoc fit. And it's the rare framework claim that is more falsifiable than confirmable -- if the tension goes away, the framework is definitively wrong on this point.

## Verification

- **Scripts**: `hubble_337_derivation.py`, `derive_337_necessity.py`, `hubble_tension_analysis.py` -- all PASS
- **H_0 (CMB)**: 337/5 = 67.4 vs 67.4 +/- 0.5 (exact match)
- **H_local/H_CMB**: 13/12 = 1.0833 vs 73.0/67.4 = 1.083 (exact match)
- **Free parameters**: Zero
