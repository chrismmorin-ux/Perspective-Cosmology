# Secondary CMB Anisotropies from Framework Parameters

**Status**: CANONICAL
**Created**: Session 139, 2026-01-30
**Last Updated**: Session 139, 2026-01-30

---

## Plain Language

After CMB photons leave the surface of last scattering (~380,000 years after the Big Bang), they travel through 13.8 billion years of evolving universe before reaching our telescopes. During this journey, several effects modify the photons beyond the primary acoustic oscillation patterns:

1. **Integrated Sachs-Wolfe (ISW)**: As dark energy accelerates the expansion, gravitational potential wells decay. Photons passing through these decaying potentials gain a net energy boost. This only matters at the largest angular scales.

2. **Gravitational lensing**: All the matter between us and the last scattering surface bends the photon paths slightly, blurring the sharp acoustic peaks and generating B-mode polarization from E-modes.

3. **Sunyaev-Zeldovich (SZ)**: Hot gas in galaxy clusters scatters CMB photons, shifting their energies (thermal SZ) or Doppler-shifting them from cluster bulk motions (kinetic SZ).

The framework's contribution to secondary anisotropies is the same as for primary anisotropies: it **derives the cosmological parameters** (Omega_m, Omega_Lambda, H_0, tau) that feed into standard physics. The secondary anisotropy mechanisms themselves are entirely standard.

One important framework-specific result: the crystallization field (epsilon) is far too heavy to have late-time dynamics, guaranteeing w = -1 exactly — a true cosmological constant with no quintessence.

**One-sentence version**: The framework predicts standard LCDM secondary anisotropies with no modifications, because the crystallization field is frozen and gravity is standard.

---

## 1. Integrated Sachs-Wolfe Effect

### Physics [A-IMPORT]

The ISW effect arises when gravitational potentials change with time. In a matter-dominated universe, potentials are constant (no ISW). When dark energy dominates, expansion accelerates, potentials decay, and photons traversing these potentials gain net energy.

**Key equations**:
```
Delta T_ISW / T = -2 * integral (dPhi/d_eta) d_eta

dPhi/d_eta = H * (f - 1) * Phi

f(z) = Omega_m(z)^gamma,  gamma = 6/11  [Linder 2005]
```

### Framework Connection [D]

The ISW effect is driven by Omega_Lambda = 137/200 [D: from division algebras].

**Dark energy transition redshift**: When Omega_m(z) equals Omega_Lambda(z):

```
(1 + z_Lambda)^3 = Omega_Lambda / Omega_m = 137/63
z_Lambda = (137/63)^{1/3} - 1 = 0.296
```

**Framework decomposition of 137/63**:
- 137 = H^2 + n_c^2 = 16 + 121 (alpha integer — particle physics)
- 63 = O^2 - R = Im_O * Im_H^2 = 7 * 9 (Omega_m numerator — cosmology)
- 137 + 63 = 200 = 2*(n_c - 1)^2 (the 200 family)

[CONJECTURE] This links the dark energy transition epoch to both the fine structure constant (particle physics) and the matter fraction (cosmology) through division algebra structure.

**Growth rate exponent** [CONJECTURE]:

```
f(z) = Omega_m(z)^{6/11}

6/11 = (C * Im_H) / n_c = (complex dim * quaternion imaginary) / crystal dim
```

This connects the growth of cosmic structure to the crystal dimension ratio.

**Growth factor at z=0**: g(0) = 0.787 (Carroll-Press-Turner 1992 fitting formula).

**ISW factor**: (1 - f) = 0.468, meaning ISW contributes about 10-20% of total power at l ~ 10.

### Framework Prediction

**Standard LCDM ISW**. No deviation. [DERIVATION]

**Why**: The crystallization field epsilon has mass m_tilt ~ 2.1 × 10^16 GeV (from Session 133: b = alpha * M_Pl^4). This is 10^49 times heavier than H_0 ~ 1.4 × 10^-33 eV. The field is completely frozen at epsilon* — no late-time dynamics, no quintessence, no thawing dark energy.

Therefore: w = -1 exactly at all redshifts. The ISW signal is exactly as predicted by LCDM with a cosmological constant.

**ISW-galaxy cross-correlation**: Standard detection expected and observed (Planck XV 2015). Framework predicts standard amplitude.

### Confidence: [DERIVATION]

Framework contributes Omega_Lambda = 137/200 [D]. Standard physics handles ISW mechanism [A-IMPORT].


## 2. Gravitational Lensing

### Physics [A-IMPORT]

Gravitational lensing by large-scale structure deflects CMB photon paths. Effects:
1. **Peak smoothing**: Blurs sharp acoustic peaks (reduces contrast by ~0.6%)
2. **B-mode generation**: Converts E-mode to B-mode polarization (peaks at l ~ 1000)
3. **Lensing potential**: C_l^{phi phi} measurable by CMB experiments

### Framework Connection [D]

Lensing amplitude depends on the matter power spectrum, which depends on:
- Omega_m = 63/200 [D]
- Omega_b = 567/11600 [D]
- H_0 = 337/5 km/s/Mpc [D]
- n_s = 193/200 [D]

All are framework-derived. The lensing physics is standard.

### Framework Prediction: A_L = 1 exactly [DERIVATION]

The lensing amplitude parameter A_L = 1 in standard LCDM. Framework predicts A_L = 1 because:
- w = -1 exactly (epsilon frozen, no dynamical dark energy)
- Gravity is standard (Einstein equations emerge from crystallization)
- No additional lensing sources beyond standard matter

**Comparison with data**:

| Experiment | A_L | Tension with A_L=1 |
|------------|-----|-------------------|
| Planck 2018 (TT,TE,EE+lowE) | 1.073 +/- 0.041 | 1.8 sigma |
| Planck 2018 (TT+lowE) | 1.180 +/- 0.065 | 2.8 sigma |
| ACT DR4 | 1.01 +/- 0.11 | 0.1 sigma |
| SPT-3G | consistent with 1 | ~0 sigma |

The A_L > 1 anomaly is Planck-specific and not confirmed by ACT or SPT. Framework prediction of A_L = 1 is consistent with the broader observational picture.

**Testable**: CMB-S4 will measure A_L to ~1% precision. If A_L > 1 persists at > 3 sigma, this would be a challenge for the framework.

### Lensing Smoothing

```
Acoustic angular scale: 35.8 arcmin (from l_A = 96*pi)
Deflection RMS: ~2.7 arcmin (standard LCDM)
Smoothing parameter: s = (theta_rms/theta_acoustic)^2 = 0.006
Peak-trough contrast reduced by ~0.6%
```

### Lensing B-mode

Already computed in Session 137 (polarization):
- Lensing B-mode peaks at l ~ 1000
- Primordial B-mode (r = 0.035) peaks at l ~ 80
- Crossover at l ~ 150
- At l ~ 80: primordial/lensing ratio ~ 42:1 (primordial dominates)

### Confidence: [DERIVATION]

Framework contributes parameters [D]. A_L = 1 follows from w = -1 and standard gravity [D]. Lensing physics is standard [A-IMPORT].


## 3. Sunyaev-Zeldovich Effect

### Physics [A-IMPORT]

**Thermal SZ (tSZ)**: Hot intracluster gas inverse-Compton scatters CMB photons, creating a frequency-dependent spectral distortion. Distinctive null at 217 GHz.

**Kinetic SZ (kSZ)**: Bulk motion of clusters Doppler-shifts CMB photons. Frequency-independent (unlike tSZ).

### Framework Connection [D]

SZ depends on:
- Cluster abundance (from sigma_8, Omega_m)
- Gas temperature (from cluster mass function)
- Reionization history (from tau, for kSZ)

**sigma_8**: Since framework parameters (Omega_m*h^2 = 0.1431, Omega_b*h^2 = 0.0222, n_s = 0.965) match Planck values, sigma_8 ~ 0.811 is expected. **GAP**: No closed-form framework expression for sigma_8. It requires numerical integration of the matter transfer function.

**tau = 3/56 = 0.054** [CONJECTURE: Session 137]: Determines patchy reionization kSZ contribution.

### S_8 Tension [A-IMPORT]

```
S_8 = sigma_8 * sqrt(Omega_m/0.3)

Framework (Planck-like): S_8 ~ 0.832
Planck CMB:              S_8 = 0.832 +/- 0.013
DES Y3 (weak lensing):  S_8 ~ 0.776 +/- 0.017
KiDS-1000:              S_8 ~ 0.759 +/- 0.021
```

There is a ~2-3 sigma tension between CMB-derived and weak lensing-derived S_8. The framework predicts the CMB-side value (Planck-like). If this tension resolves in favor of lower S_8, the framework may need modification — though this tension affects all of LCDM, not just the framework.

### Framework Prediction

**Standard LCDM SZ**. No deviation. The framework does not modify cluster physics or gas dynamics.

### Confidence: [CONJECTURE]

sigma_8 gap exists. Parameters match Planck [D], but sigma_8 not independently derived.


## 4. Non-Linear and Higher-Order Effects

### Rees-Sciama Effect
Non-linear ISW from evolving structures. Framework: standard (depends on non-linear growth). No modification.

### Ostriker-Vishniac Effect
Second-order coupling of density and velocity perturbations at l > 1000. Framework: standard.

### Moving Lens Effect
Transversely moving clusters create dipole lensing signature. Framework: standard.

### Confidence: [CONJECTURE]

All non-linear effects depend on standard physics with framework parameters.


## 5. Framework-Specific Connections

### [C1] Alpha-Matter Link in Dark Energy Transition

```
Omega_Lambda/Omega_m = 137/63

137 = H^2 + n_c^2    (alpha integer — fine structure constant)
63  = O^2 - R         (matter content numerator)
    = Im_O * Im_H^2   (imaginary octonion * imaginary quaternion squared)
```

The dark energy transition epoch links particle physics (alpha, the strength of electromagnetism) to cosmological matter content through framework algebra. [CONJECTURE]

### [C2] Growth Exponent = Division Algebra Ratio

```
f(z) = Omega_m(z)^{6/11}  [Linder 2005, exact for w = -1]

6/11 = C * Im_H / n_c = 2 * 3 / 11
```

Note: 6/11 is a result from Linder (2005) for the growth rate exponent in flat LCDM. The framework connection is that this ratio equals C*Im_H/n_c. This is [CONJECTURE] — the Linder formula is an approximation, and 6/11 is a simple fraction that might arise in many contexts.

### [C3] The 200 Family Completeness

All cosmological fractions with denominator 200 = 2*(n_c-1)^2:

| Quantity | Fraction | Numerator Decomposition |
|----------|----------|------------------------|
| Omega_m | 63/200 | O^2 - R = Im_O * Im_H^2 |
| Omega_Lambda | 137/200 | H^2 + n_c^2 |
| 1 - n_s | 7/200 | Im_O |
| r | 7/200 | Im_O |

Properties:
- 63 + 137 = 200 (flat universe)
- 137 - 63 = 74 = 2 * 37 (7th TT peak coefficient)
- 63 + 7 = 70 = C * (H+R) * Im_O

### [C4] Frozen Epsilon ⟹ w = -1

The crystallization field epsilon sits at the minimum of V_eff with mass:

```
m_tilt ~ 2.1 × 10^16 GeV  (from Session 133: b = alpha * M_Pl^4)
H_0 ~ 1.4 × 10^{-33} eV
m_tilt / H_0 ~ 10^49
```

The epsilon field is over-damped by a factor of 10^49 relative to Hubble. It cannot have late-time oscillations or quintessence-like behavior. This gives:

- **w = -1 exactly at all redshifts** [DERIVATION]
- Standard ISW (no modified potential evolution)
- Standard lensing (no anomalous growth)
- A_L = 1 (no extra lensing sources)

**Testable**: DESI Year 1 (2024) hinted at dynamical dark energy (w_0 ~ -0.7, w_a ~ -1.0). If confirmed by DESI Year 3/5 data, this would be a CHALLENGE for the framework.

### [C5] Optical Depth from Framework

```
tau = Im_H / (O * Im_O) = 3/56 = 0.054

Planck: 0.054 +/- 0.007
```

This determines the kSZ contribution from patchy reionization. [CONJECTURE: Session 137]


## 6. Honest Assessment

### What the Framework Does

The framework derives cosmological parameters (Omega_m, Omega_Lambda, H_0, n_s, tau) from division algebra structure. These parameters feed into standard secondary anisotropy physics.

### What the Framework Does NOT Do

- Does NOT modify ISW, lensing, or SZ physics mechanisms
- Does NOT predict any deviation from standard LCDM secondary anisotropies
- Does NOT provide a closed-form expression for sigma_8
- Does NOT explain the S_8 tension or A_L anomaly

### Gaps

| Gap | Severity | Notes |
|-----|----------|-------|
| No sigma_8 algebraic expression | MEDIUM | Requires numerical transfer function |
| No framework explanation of A_L anomaly | LOW | Anomaly likely statistical |
| No framework explanation of S_8 tension | MEDIUM | Affects all LCDM, not just framework |
| Cannot predict DESI w ≠ -1 if confirmed | HIGH | Would challenge framework fundamentally |

### Risk: DESI Dynamical Dark Energy

DESI Year 1 results (2024) showed hints of w_0 > -1 and w_a < 0. If this is confirmed:
- The framework predicts w = -1 exactly (from epsilon frozen)
- Dynamical w would require late-time epsilon dynamics
- But m_tilt >> H_0 makes this essentially impossible within current framework
- Resolution would require either: (a) a lighter tilt mode, (b) a second field, or (c) the DESI signal is statistical/systematic

This is THE most serious near-term challenge for the framework from secondary anisotropy physics.


## Dependencies

- **Uses**: Omega_m (DEF), Omega_Lambda (DEF), H_0 (DEF), n_s (DEF), tau (CONJ), r (DEF)
- **Uses**: b = alpha * M_Pl^4 (Session 133) for m_tilt
- **Uses**: Standard ISW, lensing, SZ physics [A-IMPORT]
- **Used by**: CMB predictions summary, experimental timeline

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| 139 | Full secondary anisotropy analysis | ISW, lensing, SZ addressed; 18/18 PASS |

## Verification

**Script**: `verification/sympy/secondary_anisotropies.py` — **18/18 PASS**
