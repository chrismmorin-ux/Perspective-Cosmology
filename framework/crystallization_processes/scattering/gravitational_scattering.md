# Gravitational Scattering Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 236)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C15: Gravitational Radiation, C3: Tilt Dynamics)
**Layer**: Mixed (Layer 1 channel classification + Layer 2 correspondence)

---

## Disclaimer

This sub-catalog is **[FRAMEWORK-CONSTRAINED]** (upgraded S247 from STANDARD-RELABELED). All gravitational scattering processes are predictions of General Relativity, confirmed to high precision. The framework derives the Einstein field equations through the chain: n_d=4 [D: Frobenius] → n_d²=16 metric DOF [D] → Lorentz signature (1,3) [D: THM_04AE] → general covariance [D] → Lovelock uniqueness → EFE [D via I-MATH]. The specific predictions follow from EFE as standard consequences, but the EFE themselves are [DERIVATION] from crystallization. This is the same pattern as N_c=3 constraining QCD observables.

**Imports**: Lovelock theorem [I-MATH], Newton's G [A-IMPORT], Schwarzschild/Kerr solutions [A-IMPORT], all measured values [A-IMPORT].
**Gaps**: G not derived, 2-derivative truncation not justified, CC magnitude ~10^111 discrepancy, no predictions beyond GR.

---

## Processes

### Gravitational Lensing (Weak and Strong)

**Chain**: C3(R-channel tilt curvature) -> C8(photon trajectory follows null geodesic) -> deflection
**Tag**: [FRAMEWORK-CONSTRAINED] (upgraded S247: EFE derived from n_d=4 via Lovelock)

**Before -> After**:
- Physical (weak): Background galaxy image slightly distorted by foreground mass distribution
- Physical (strong): Multiple images, arcs, or Einstein rings from massive foreground lens
- Tilt: R-channel curvature (spacetime geometry) deflects C-channel modes (photons) along curved paths

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Photons travel along null geodesics of curved spacetime | Deflected, not absorbed |
| H (Weak) | Not involved | -- |
| O (Strong) | Not involved | -- |
| R (Gravity) | Curved spacetime (Schwarzschild/Kerr for point mass; NFW for halos) | Determines deflection |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Deflection angle (point mass) | 4GM/(c^2 b) [A-IMPORT: GR] | 1.75" (solar limb) | ~0.01" | Eddington 1919 + modern |
| Einstein radius | theta_E = sqrt(4GM D_LS / (c^2 D_L D_S)) [A-IMPORT] | Confirmed for many systems | ~1% | HST, JWST |
| Time delay (strong lensing) | Delta t = (1+z_L) D Delta phi / c [A-IMPORT] | H0 tension: 73 vs 67 km/s/Mpc | ~5% | H0LiCOW |
| Convergence kappa | Projected surface mass / Sigma_cr [A-IMPORT] | Mapped via cosmic shear | ~5% | DES, KiDS |

**What framework adds**: Gravitational lensing is R-channel curvature deflecting C-channel propagation. The framework derives EFE through: n_d=4 [D] → n_d²=16 metric DOF [D] → Lorentz signature (1,3) [D: THM_04AE] → general covariance [D] → Lovelock uniqueness [I-MATH] → EFE [D via I-MATH]. The deflection angle θ = 4GM/(c²b) = 1.7512" at solar limb follows from EFE → Schwarzschild → null geodesic. The framework quantity n_d=4 enters the derivation chain.
**What is imported**: Lovelock theorem [I-MATH], Schwarzschild metric, geodesic equation, G value, distances -- all [A-IMPORT]
**Verification**: `grav_scattering_crystallization.py` (21/21 PASS), `astrophysical_crystallization.py` (12/12 PASS)
**Confidence**: [FRAMEWORK-CONSTRAINED] via n_d=4 → EFE → lensing; [DERIVATION] for EFE (grade C-)

---

### Perihelion Precession (Mercury and Binary Pulsars)

**Chain**: C3(R-channel: Schwarzschild correction to Newtonian orbit) -> secular orbital precession
**Tag**: [FRAMEWORK-CONSTRAINED] (upgraded S247: EFE derived from n_d=4 via Lovelock)

**Before -> After**:
- Physical: Elliptical orbit precesses due to spacetime curvature near central mass
- Tilt: R-channel 1/r^3 correction to Newtonian 1/r^2 force causes apsidal advance

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Not directly involved (gravitational effect) | Observation via light |
| H (Weak) | Not involved | -- |
| O (Strong) | Not involved (gravity dominates at planetary/stellar scales) | -- |
| R (Gravity) | Schwarzschild correction: post-Newtonian 1/c^2 terms | Determines precession rate |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Mercury precession | 6 pi G M_sun / (a c^2 (1-e^2)) = 42.98"/cy [A-IMPORT: GR] | 42.98(4)"/cy | <0.1% | Radar ranging |
| PSR B1913+16 precession | 4.2264 deg/yr [A-IMPORT: GR] | 4.2266(3) deg/yr | 0.005% | Hulse-Taylor |
| PSR J0737-3039A | 16.90 deg/yr [A-IMPORT: GR] | 16.8995(7) deg/yr | 0.003% | Kramer et al. |
| Post-Newtonian parameter gamma | 1 (GR prediction) [A-IMPORT] | 0.99992(12) | 0.012% | Cassini |

**What framework adds**: Perihelion precession follows from EFE → Schwarzschild → post-Newtonian correction. Framework derives EFE from n_d=4 via Lovelock (see derivation chain above). Mercury: Δφ = 6πGM/(ac²(1-e²)) × N_orb = 42.98"/cy (verified to 0.002% vs measurement). The framework does not predict different precession from GR — it derives GR.
**What is imported**: Lovelock theorem [I-MATH], Schwarzschild metric, post-Newtonian expansion, G value, orbital elements -- all [A-IMPORT]
**Verification**: `grav_scattering_crystallization.py` (21/21 PASS), `astrophysical_crystallization.py` (12/12 PASS)
**Confidence**: [FRAMEWORK-CONSTRAINED] via n_d=4 → EFE → precession; confirmed to <0.01%

---

### Shapiro Time Delay

**Chain**: C3(R-channel curvature) -> C8(photon/radar signal travels through curved spacetime) -> time delay
**Tag**: [FRAMEWORK-CONSTRAINED] (upgraded S247: EFE derived from n_d=4 via Lovelock)

**Before -> After**:
- Physical: Radar/light signal passing near massive body arrives later than in flat spacetime
- Tilt: C-channel mode (photon) propagates through R-channel curvature; coordinate speed < c near mass

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Radar/light signal propagation | Delayed by curvature |
| H (Weak) | Not involved | -- |
| O (Strong) | Not involved | -- |
| R (Gravity) | Schwarzschild time dilation: dt_coord = (1 - 2GM/rc^2)^(-1/2) dt_proper | Determines delay |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Shapiro delay (Cassini) | ~240 microsec (Earth-Cassini past Sun) [A-IMPORT: GR] | gamma = 1 + (2.1 +/- 2.3) x 10^-5 | 0.002% | Bertotti et al. 2003 |
| PSR J0737-3039 Shapiro | Range r = 6.2 microsec, shape s = sin(i) = 0.9997 [A-IMPORT: GR] | s = 0.99974(39) | 0.003% | Kramer et al. |
| PSR J1614-2230 | Shapiro delay -> M = 1.97(4) M_sun [A-IMPORT] | Confirms massive NS | 2% | Demorest et al. |

**What framework adds**: Shapiro delay follows from EFE → Schwarzschild → null geodesic coordinate time. Framework derives EFE from n_d=4 via Lovelock, predicting γ_PPN = 1 (exact GR value). Cassini: γ = 1 + (2.1 ± 2.3) × 10⁻⁵ — 23 ppm precision test, consistent. Framework does not predict different Shapiro delay from GR.
**What is imported**: Lovelock theorem [I-MATH], Schwarzschild metric, PPN formalism, G value -- all [A-IMPORT]
**Verification**: `grav_scattering_crystallization.py` (21/21 PASS), `astrophysical_crystallization.py` (12/12 PASS)
**Confidence**: [FRAMEWORK-CONSTRAINED] via n_d=4 → EFE → Shapiro; confirmed to 0.002%

---

### Frame Dragging (Lense-Thirring Effect)

**Chain**: C3(R-channel: Kerr metric off-diagonal terms from rotating mass) -> precession of gyroscope/orbit
**Tag**: [FRAMEWORK-CONSTRAINED] (upgraded S247: EFE derived from n_d=4 via Lovelock)

**Before -> After**:
- Physical: Spinning mass drags spacetime, causing precession of nearby gyroscopes and orbital planes
- Tilt: Rotating R-channel source induces off-diagonal metric components (gravitomagnetic field)

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| C (EM) | Not directly involved (purely gravitational effect) | Observation tool |
| H (Weak) | Not involved | -- |
| O (Strong) | Not involved | -- |
| R (Gravity) | Kerr metric: frame dragging from angular momentum J | Off-diagonal g_{0phi} terms |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| GP-B geodetic precession | 6606.1 mas/yr [A-IMPORT: GR] | 6601.8(18.3) mas/yr | 0.28% | Gravity Probe B |
| GP-B frame dragging | 39.2 mas/yr [A-IMPORT: GR] | 37.2(7.2) mas/yr | 19% | Gravity Probe B |
| LAGEOS Lense-Thirring | 31 mas/yr [A-IMPORT: GR] | ~31 mas/yr | ~5-10% | Ciufolini & Pavlis |
| PSR J0737-3039 spin-orbit | Geodetic precession 4.77 deg/yr [A-IMPORT] | Consistent | ~15% | Breton et al. |
| LIGO ringdown | Kerr QNMs [A-IMPORT: GR] | Consistent with Kerr | ~10% | LIGO/Virgo |

**What framework adds**: Frame dragging follows from EFE → Kerr solution → off-diagonal g_{0φ} terms. The n_d²=16 metric DOF include the 12 off-diagonal components responsible for gravitomagnetic effects. Framework derives EFE from n_d=4 via Lovelock. GP-B: geodetic 6601.8 ± 18.3 mas/yr (GR: 6606.1), Lense-Thirring 37.2 ± 7.2 mas/yr (GR: 39.2) — both consistent.
**What is imported**: Lovelock theorem [I-MATH], Kerr metric, PPN formalism, G value -- all [A-IMPORT]
**Verification**: `grav_scattering_crystallization.py` (21/21 PASS), `astrophysical_crystallization.py` (12/12 PASS)
**Confidence**: [FRAMEWORK-CONSTRAINED] via n_d=4 → EFE → Kerr → frame dragging

**Note**: Frame dragging is the least precisely tested of the four GR effects listed here. GP-B confirmed it to ~19%, LAGEOS to ~5-10%. Future experiments (LARES-2) aim for ~1%. In all cases the framework prediction equals the GR prediction -- no deviation expected.

---

## Summary

| Process | Tag | Framework Content | Key Tests | Scripts |
|---------|-----|-------------------|-----------|---------|
| Gravitational lensing | **[FRAMEWORK-CONSTRAINED]** | n_d=4 → EFE → Schwarzschild → deflection | Solar (1.751"), VLBI | `grav_scattering_crystallization.py` |
| Perihelion precession | **[FRAMEWORK-CONSTRAINED]** | n_d=4 → EFE → Schwarzschild → apsidal advance | Mercury (42.98"/cy), pulsars | `grav_scattering_crystallization.py` |
| Shapiro time delay | **[FRAMEWORK-CONSTRAINED]** | n_d=4 → EFE → Schwarzschild → γ_PPN=1 | Cassini (23 ppm), pulsars | `grav_scattering_crystallization.py` |
| Frame dragging | **[FRAMEWORK-CONSTRAINED]** | n_d=4 → EFE → Kerr → Lense-Thirring | GP-B, LAGEOS, LIGO | `grav_scattering_crystallization.py` |

**Honest count**: 4/4 entries [FRAMEWORK-CONSTRAINED], 0/4 [STANDARD-RELABELED] (upgraded S247). All gravitational scattering predictions follow from GR. The framework derives the Einstein field equations through: n_d=4 [D: Frobenius] → n_d²=16 metric DOF [D] → Lorentz signature (1,3) [D: THM_04AE] → general covariance [D] → Lovelock uniqueness [I-MATH] → EFE [D via I-MATH]. The specific observables are standard EFE consequences, not independent predictions — the framework constrains outcomes through the derived equation.

**Key distinction**: These are CONSTRAINED, not DERIVED. The framework derives the equation (EFE) from which these predictions follow. Same pattern as N_c=3 constraining R-ratio, not deriving it independently. The Lovelock theorem is an [I-MATH] import.

**Gaps**: Newton's G imported (M_Pl not derived), 2-derivative truncation not justified, CC magnitude ~10^111 discrepancy, no predictions beyond GR.

**Total verification**: `grav_scattering_crystallization.py` (21/21 PASS), `astrophysical_crystallization.py` (12/12 PASS).

---

## Cross-References

- Einstein equations from crystallization: `framework/investigations/spacetime/einstein_from_crystallization.md`
- Einstein equations rigorous: `framework/investigations/spacetime/einstein_equations_rigorous.md`
- Gravitational waves: `framework/crystallization_processes/astrophysical/gravitational_waves.md`
- Black holes: `framework/crystallization_processes/astrophysical/compact_objects.md`
- C3 definition: `framework/CRYSTALLIZATION_CATALOG.md` (Part II)
- C15 definition: `framework/CRYSTALLIZATION_CATALOG.md` (Part II)

---

*Created: 2026-02-03 (S236)*
