# Silk Damping from Framework Parameters

**Status**: DERIVATION (partial)
**Created**: Session 134
**Confidence**: [DERIVATION] for parameter inputs; [CONJECTURE] for l_D expressions
**Last Updated**: 2026-02-03

---

## Plain Language

Sound waves in the early universe didn't propagate perfectly. Photons, which carried the sound waves, could only travel a certain distance before scattering off electrons. This meant that on very small scales, photons leaked out of the hot and cold regions, smoothing them away. This effect is called "Silk damping" — named after Joseph Silk, who predicted it in 1968.

The damping scale tells us the smallest features that survived in the CMB. Below this scale (angular multipoles above l_D ~ 1400), the CMB power drops exponentially. By the 7th acoustic peak (l ~ 2081), 99% of the original signal is damped away.

The framework derives all the cosmological parameters that determine the damping scale: the baryon density (which sets how many electrons the photons scatter off), the matter density (which controls the expansion rate), and the recombination redshift (which sets how long the damping operates). The standard physics of photon diffusion then gives l_D ~ 1400.

Intriguingly, 1400 = C * Im_O * (n_c-1)^2 = 2 * 7 * 100 in framework notation, but this is an algebraic match with no physics derivation.

**One-sentence version**: The framework derives the cosmological parameters controlling Silk damping, and the measured damping scale l_D ~ 1400 happens to equal several clean framework expressions, though without a physics derivation.

---

## The Physics of Silk Damping

### Photon Diffusion

In the baryon-photon plasma, photons travel a mean free path lambda_mfp before Thomson scattering off electrons:

```
lambda_mfp = 1 / (sigma_T * n_e)
```

Over many scatterings, photons random-walk a distance:

```
r_D ~ sqrt(N_scatter * lambda_mfp^2) ~ sqrt(lambda_mfp * c * t_*)
```

This "diffusion length" r_D determines the smallest surviving perturbation scale.

### The Damping Scale

The angular damping scale is:

```
l_D = pi * D_M / r_D
```

where D_M ~ 13,800 Mpc is the comoving distance to recombination.

The comoving diffusion scale involves an integral:

```
r_D^2 = integral_0^{eta_*} d(eta) * (1/6) * lambda_mfp(eta) * f(R)
```

where f(R) = [R^2 + 16(1+R)/15] / (1+R)^2 accounts for baryon loading.

### Framework Parameters Entering

| Parameter | Expression | Value | Role |
|-----------|------------|-------|------|
| omega_b | 0.02221 | [D] | Sets electron density n_e |
| omega_m | 0.1431 | [D] | Sets expansion rate H(z) |
| z_* | 1089 | [D] | Sets total diffusion time |
| eta_* | 337 Mpc | [D] | Conformal time (enters integral) |
| R_* | 0.619 | [D+I] | Baryon correction factor |

### Imports (Not from Framework)

| Quantity | Value | Role |
|----------|-------|------|
| sigma_T | 6.65e-25 cm^2 | Thomson cross section |
| m_H | 1.67e-24 g | Hydrogen mass |
| Y_p | 0.245 | Helium fraction |

These are atomic/nuclear physics constants.

---

## Numerical Results

### Eisenstein-Hu Fitting Formula

```
k_silk = 1.6 * omega_b^{0.52} * omega_m^{0.73} * [1 + (10.4*omega_m)^{-0.95}]
       = 0.090 Mpc^{-1}

l_D ~ k_silk * D_M ~ 1243
```

This fitting formula gives l_D ~ 1243, about 11% below the measured ~1400. The discrepancy comes from the approximate nature of the fitting formula.

### Damping Envelope

```
D_l -> D_l * exp(-2(l/l_D)^2)
```

| Peak | l | Damping Factor | % Power Remaining |
|------|---|----------------|-------------------|
| 1 | 220 | 0.952 | 95% |
| 2 | 538 | 0.744 | 74% |
| 3 | 811 | 0.511 | 51% |
| 4 | 1121 | 0.277 | 28% |
| 5 | 1444 | 0.119 | 12% |
| 6 | 1776 | 0.040 | 4% |
| 7 | 2081 | 0.012 | 1% |

The damping tail is one of the most precisely measured features of the CMB.

---

## Framework Expression Candidates for l_D

| Expression | Decomposition | Value | Error |
|------------|---------------|-------|-------|
| C * Im_O * (n_c-1)^2 | 2 * 7 * 100 | **1400** | **0%** |
| (H+R)^2 * O * Im_O | 25 * 56 | **1400** | **0%** |
| H^2 * n_c * O | 16 * 11 * 8 | 1408 | 0.6% |
| n_c * (n_c+C) * (n_c-1) | 11 * 13 * 10 | 1430 | 2.1% |

### Prime Factorization

```
1400 = 2^3 * 5^2 * 7

Framework decompositions:
  = C * Im_O * (n_c-1)^2     [2 * 7 * 10^2]
  = (H+R)^2 * O * Im_O       [5^2 * 8 * 7]
  = 14 * 100                  [(C*Im_O) * (n_c-1)^2]
```

**Status**: These are algebraic matches [CONJECTURE]. The exact value of l_D depends on the definition of the damping scale and details of recombination physics.

---

## Derivation Chain

### Layer 0 (Axioms)
- Division algebras R, C, H, O with dims 1, 2, 4, 8 [AXIOM]
- n_c = 11, Im_H = 3, Im_O = 7 [D]

### Layer 2 (Correspondence)
- Omega_b = 567/11600 [A-PHYSICAL]
- Omega_m = 63/200 [A-PHYSICAL]
- H_0 = 337/5 km/s/Mpc [A-PHYSICAL]
- z_* = 1089 [A-PHYSICAL]
- sigma_T, m_H, Y_p [A-IMPORT: atomic physics]

### Layer 3 (Predictions)
- omega_b = 0.02221 -> n_e(z) [D+I]
- omega_m = 0.1431 -> H(z) [D+I]
- Diffusion integral -> r_D ~ 10 Mpc [STANDARD PHYSICS]
- l_D ~ 1240-1400 [STANDARD PHYSICS + framework params]
- l_D = C * Im_O * (n_c-1)^2 = 1400 [CONJECTURE]

---

## Honest Assessment

### What this achieves

1. **Framework parameters feed the computation**: omega_b, omega_m, z_*, eta_* all enter the Silk damping integral and are all derived from the framework
2. **Order-of-magnitude correct**: The Eisenstein-Hu fitting formula gives l_D ~ 1243 from framework parameters alone
3. **Clean algebraic expressions**: 1400 = C * Im_O * (n_c-1)^2 = (H+R)^2 * O * Im_O
4. **Damping envelope computed**: Shows the progressive suppression at each peak

### What it does NOT achieve

1. **No physics derivation** of l_D = 1400 from crystallization
2. **Exact value uncertain**: l_D depends on damping definition (~1350-1450 range)
3. **Full Boltzmann integration not done**: Would need CAMB/CLASS for precision
4. **Atomic physics imported**: sigma_T, m_H not derived from framework
5. **Multiple algebraic expressions**: No way to select the "correct" one

### The honest bottom line

The framework constrains the cosmological parameters entering Silk damping physics. The standard computation gives l_D in the right range. The exact value 1400 has clean framework expressions, but these are algebraic matches without physics justification.

---

## Verification Scripts

| Script | Tests | Status |
|--------|-------|--------|
| `silk_damping_physics.py` | 13/13 | PASS |

---

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| 134 | Silk damping computation from framework params | l_D ~ 1243 (EH), 1400 exact match found |

---

*Phase 3.3 of CMB Physics Plan: ADDRESSED*
*Framework constrains cosmological parameters; l_D = 1400 has clean algebraic expressions [CONJECTURE].*
