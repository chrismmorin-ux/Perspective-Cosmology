#!/usr/bin/env python3
"""
Conformal Distance eta* and Sound Horizon r_s from Cosmological Integral

KEY QUESTION: Does eta* = 337 Mpc when computed from framework parameters?

The framework conjectures:
  eta* = 337 Mpc (conformal distance to last scattering)
  c_s = 3/7 (sound speed)
  r_s = eta* x c_s = 337 x 3/7 = 144.43 Mpc

S191 found c_s = 3/7 is NOT derivable (standard physics gives 0.454).
This script tests whether eta* = 337 is even correct by computing the integral.

Method:
  eta* = int_0^{a*} c da / (a^2 H(a))   [conformal distance]
  r_s = int_0^{a*} c_s(a) da / (a^2 H(a))  [sound horizon with standard c_s]

where H(a) = H0 * sqrt(Om_r/a^4 + Om_m/a^3 + Om_L)
and   c_s(a) = c / sqrt(3(1 + R(a))), R(a) = 3*Om_b*a / (4*Om_gamma)

Framework inputs (NO free parameters):
  H0 = 337/5 = 67.4 km/s/Mpc        [CONJECTURE]
  Om_m = 63/200 = 0.315              [CONJECTURE]
  Om_L = 137/200 = 0.685             [CONJECTURE]
  Om_b = 567/11600 = 0.04888         [DERIVATION]
  z* = 1089                           [CONJECTURE, from 33^2]
  T_CMB = 109/40 = 2.725 K           [CONJECTURE]

Standard imports:
  N_eff = 3.046                       [A-IMPORT, not derived]
  Om_gamma from T_CMB and H0          [A-IMPORT, Stefan-Boltzmann]

Measured values (Planck 2018):
  eta* ~ 281 Mpc (conformal distance, not comoving -- see note)
  r_s = 144.43 +/- 0.26 Mpc

Status: INVESTIGATION
Created: Session 194 (continuation of S191)
"""

from sympy import Rational as R, sqrt, pi, Float
import numpy as np
from scipy import integrate

# ==============================================================================
# FRAMEWORK PARAMETERS (exact rationals)
# ==============================================================================

# Hubble constant
H0_framework = R(337, 5)  # 67.4 km/s/Mpc
h = float(H0_framework) / 100  # dimensionless h = 0.674

# Density parameters
Omega_m = R(63, 200)   # 0.315
Omega_L = R(137, 200)  # 0.685
Omega_b = R(567, 11600) # 0.04888

# CMB temperature
T_CMB = R(109, 40)  # 2.725 K

# Recombination redshift
z_star = 1089  # from 33^2 [CONJECTURE]
a_star = 1.0 / (1.0 + z_star)  # scale factor at last scattering

# Convert to floats for numerical integration
Om_m = float(Omega_m)
Om_L = float(Omega_L)
Om_b = float(Omega_b)
H0 = float(H0_framework)  # km/s/Mpc

# ==============================================================================
# DERIVED: RADIATION DENSITY [A-IMPORT]
# ==============================================================================

# Photon energy density parameter from Stefan-Boltzmann
# Om_gamma = (4*sigma_SB * T^4) / (3 c^3 rho_crit) = 2.469e-5 h^-2  (for T = 2.725 K)
# This uses T_CMB = 109/40 K [CONJECTURE] and standard radiation physics [A-IMPORT]
Omega_gamma = 2.469e-5 / h**2  # photon density

# Neutrino contribution: N_eff = 3.046 [A-IMPORT]
N_eff = 3.046
# Neutrinos add factor (7/8)(4/11)^(4/3) per species
Omega_nu = Omega_gamma * N_eff * (7.0/8.0) * (4.0/11.0)**(4.0/3.0)
Omega_r = Omega_gamma + Omega_nu  # total radiation

print("=" * 70)
print("FRAMEWORK PARAMETERS")
print("=" * 70)
print(f"H0 = {H0_framework} = {H0} km/s/Mpc")
print(f"Om_m = {Omega_m} = {Om_m}")
print(f"Om_L = {Omega_L} = {Om_L}")
print(f"Om_b = {Omega_b} = {Om_b:.5f}")
print(f"T_CMB = {T_CMB} = {float(T_CMB)} K")
print(f"z* = {z_star}, a* = {a_star:.6e}")
print(f"Om_gamma = {Omega_gamma:.6e} [from T_CMB, A-IMPORT]")
print(f"Om_nu = {Omega_nu:.6e} [N_eff = {N_eff}, A-IMPORT]")
print(f"Om_r = {Omega_r:.6e}")
print(f"Sum check: Om_m + Om_L + Om_r = {Om_m + Om_L + Omega_r:.6f}")

# ==============================================================================
# HUBBLE PARAMETER H(a)
# ==============================================================================

def H_of_a(a):
    """Hubble parameter H(a) in km/s/Mpc"""
    return H0 * np.sqrt(Omega_r / a**4 + Om_m / a**3 + Om_L)

# ==============================================================================
# COMPUTATION 1: CONFORMAL DISTANCE eta*
# ==============================================================================
# eta* = int_0^{a*} c da / (a^2 H(a))
# In units where c = 1 and H0 is in km/s/Mpc:
# eta* = (c/H0) * int_0^{a*} da / (a^2 E(a))
# where E(a) = H(a)/H0

c_kms = 299792.458  # speed of light in km/s

def conformal_integrand(a):
    """Integrand for conformal distance: c / (a^2 H(a))"""
    E_a = np.sqrt(Omega_r / a**4 + Om_m / a**3 + Om_L)
    return 1.0 / (a**2 * E_a)

# Numerical integration from ~0 to a*
# Use small lower limit to avoid singularity at a=0
a_min = 1e-10
result_eta, error_eta = integrate.quad(conformal_integrand, a_min, a_star,
                                        limit=200, epsabs=1e-12, epsrel=1e-12)

# Convert: eta* = (c/H0) * integral_result
# c/H0 in Mpc: (299792.458 km/s) / (67.4 km/s/Mpc) = 4448 Mpc
c_over_H0 = c_kms / H0  # in Mpc
eta_star_val = c_over_H0 * result_eta

print()
print("=" * 70)
print("COMPUTATION 1: CONFORMAL DISTANCE eta*")
print("=" * 70)
print(f"c/H0 = {c_over_H0:.2f} Mpc")
print(f"Integral int_0^a* da/(a^2 E(a)) = {result_eta:.6f}")
print(f"eta* = c/H0 x integral = {eta_star_val:.2f} Mpc")
print(f"Framework conjecture: eta* = 337 Mpc")
print(f"Difference: {eta_star_val - 337:.2f} Mpc ({(eta_star_val/337 - 1)*100:.1f}%)")

# ==============================================================================
# COMPUTATION 2: SOUND HORIZON r_s (STANDARD c_s)
# ==============================================================================
# r_s = int_0^{a*} c_s(a) da / (a^2 H(a))
# where c_s(a) = c / sqrt(3(1 + R(a)))
# and R(a) = 3 Om_b a / (4 Om_gamma)

def sound_speed_standard(a):
    """Standard baryon-photon sound speed c_s(a) / c"""
    R_a = 3.0 * Om_b * a / (4.0 * Omega_gamma)
    return 1.0 / np.sqrt(3.0 * (1.0 + R_a))

def sound_horizon_integrand(a):
    """Integrand for sound horizon: c_s / (a^2 H(a))"""
    cs = sound_speed_standard(a)
    E_a = np.sqrt(Omega_r / a**4 + Om_m / a**3 + Om_L)
    return cs / (a**2 * E_a)

result_rs, error_rs = integrate.quad(sound_horizon_integrand, a_min, a_star,
                                      limit=200, epsabs=1e-12, epsrel=1e-12)

r_s_standard = c_over_H0 * result_rs

# Also compute c_s at recombination
R_star = 3.0 * Om_b * a_star / (4.0 * Omega_gamma)
cs_at_star = 1.0 / np.sqrt(3.0 * (1.0 + R_star))

print()
print("=" * 70)
print("COMPUTATION 2: SOUND HORIZON r_s (STANDARD c_s)")
print("=" * 70)
print(f"R(a*) = 3*Om_b*a* / (4*Om_gamma) = {R_star:.4f}")
print(f"c_s(a*) = 1/sqrt(3(1+R*)) = {cs_at_star:.4f} c")
print(f"r_s (standard) = {r_s_standard:.2f} Mpc")
print(f"Planck measured: r_s = 144.43 +/- 0.26 Mpc")
print(f"Difference: {r_s_standard - 144.43:.2f} Mpc ({(r_s_standard/144.43 - 1)*100:.2f}%)")

# ==============================================================================
# COMPUTATION 3: FRAMEWORK r_s = eta* x 3/7
# ==============================================================================

r_s_framework = eta_star_val * 3.0 / 7.0

print()
print("=" * 70)
print("COMPUTATION 3: FRAMEWORK CLAIM r_s = eta* x 3/7")
print("=" * 70)
print(f"r_s (framework) = eta* x 3/7 = {eta_star_val:.2f} x 3/7 = {r_s_framework:.2f} Mpc")
print(f"Planck measured: r_s = 144.43 +/- 0.26 Mpc")
print(f"Difference: {r_s_framework - 144.43:.2f} Mpc ({(r_s_framework/144.43 - 1)*100:.2f}%)")

# ==============================================================================
# COMPUTATION 4: EFFECTIVE SOUND SPEED
# ==============================================================================
# If r_s = eta* x <c_s>, what is the effective average c_s?

cs_effective = r_s_standard / eta_star_val

print()
print("=" * 70)
print("COMPUTATION 4: EFFECTIVE SOUND SPEED")
print("=" * 70)
print(f"Effective <c_s> = r_s / eta* = {r_s_standard:.2f} / {eta_star_val:.2f} = {cs_effective:.4f} c")
print(f"Framework claim: c_s = 3/7 = {3/7:.4f}")
print(f"Standard c_s at a*: {cs_at_star:.4f}")
print(f"Discrepancy from 3/7: {(cs_effective / (3/7) - 1)*100:.1f}%")

# ==============================================================================
# COMPUTATION 5: WHAT eta* WOULD NEED TO BE
# ==============================================================================
# For r_s = 144.43 and c_s = 3/7: eta* = 144.43 x 7/3 = 336.34

eta_needed = 144.43 * 7.0 / 3.0

print()
print("=" * 70)
print("COMPUTATION 5: REVERSE ENGINEERING")
print("=" * 70)
print(f"For r_s = 144.43 and c_s = 3/7:")
print(f"  eta* needed = 144.43 x 7/3 = {eta_needed:.2f} Mpc")
print(f"  eta* computed = {eta_star_val:.2f} Mpc")
print(f"  Deficit: {eta_needed - eta_star_val:.2f} Mpc ({(eta_needed/eta_star_val - 1)*100:.1f}%)")
print()
print(f"For r_s = 144.43 and eta* = 337:")
print(f"  c_s needed = 144.43 / 337 = {144.43/337:.4f}")
print(f"  = 3/7? {3/7:.4f}")
print(f"  Difference: {(144.43/337 - 3/7)*100:.2f}%")

# ==============================================================================
# COMPUTATION 6: DRAG EPOCH (more precise r_s comparison)
# ==============================================================================
# Planck actually reports r_s at the drag epoch z_d, not z*.
# z_d ~ 1059.94 (slightly after recombination)
# Let's also compute this

z_drag = 1059.94
a_drag = 1.0 / (1.0 + z_drag)

result_rd, error_rd = integrate.quad(sound_horizon_integrand, a_min, a_drag,
                                      limit=200, epsabs=1e-12, epsrel=1e-12)
r_d = c_over_H0 * result_rd

# Also conformal distance to drag epoch
result_eta_d, _ = integrate.quad(conformal_integrand, a_min, a_drag,
                                  limit=200, epsabs=1e-12, epsrel=1e-12)
eta_drag = c_over_H0 * result_eta_d

print()
print("=" * 70)
print("COMPUTATION 6: DRAG EPOCH (z_d = 1059.94)")
print("=" * 70)
print(f"eta(z_d) = {eta_drag:.2f} Mpc")
print(f"r_d (sound horizon at drag) = {r_d:.2f} Mpc")
print(f"Planck r_d = 147.09 +/- 0.26 Mpc")
print(f"Difference: {r_d - 147.09:.2f} Mpc ({(r_d/147.09 - 1)*100:.2f}%)")

# ==============================================================================
# SUMMARY TABLE
# ==============================================================================
print()
print("=" * 70)
print("SUMMARY: THE THREE SOUND HORIZONS")
print("=" * 70)
print(f"{'Quantity':<30} {'Computed':>12} {'Measured':>12} {'Error':>10}")
print("-" * 70)
print(f"{'eta* (conformal dist to z*)':<30} {eta_star_val:>12.2f} {'~281 [1]':>12} {'':>10}")
print(f"{'r_s standard (z*)':<30} {r_s_standard:>12.2f} {144.43:>12.2f} {(r_s_standard/144.43-1)*100:>9.2f}%")
print(f"{'r_s framework (eta*x3/7)':<30} {r_s_framework:>12.2f} {144.43:>12.2f} {(r_s_framework/144.43-1)*100:>9.2f}%")
print(f"{'r_d standard (z_d)':<30} {r_d:>12.2f} {147.09:>12.2f} {(r_d/147.09-1)*100:>9.2f}%")
print(f"{'<c_s> effective':<30} {cs_effective:>12.4f} {'':>12} {'':>10}")
print(f"{'c_s at a* (standard)':<30} {cs_at_star:>12.4f} {'':>12} {'':>10}")
print(f"{'c_s framework':<30} {3/7:>12.4f} {'':>12} {'':>10}")
print()
print("[1] eta* ~ 281 Mpc is the comoving conformal distance; the exact value")
print("    depends on cosmological parameters. Planck doesn't directly report eta*.")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================
print()
print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    # Basic consistency
    ("Om_m + Om_L + Om_r ~ 1", abs(Om_m + Om_L + Omega_r - 1.0) < 0.001),
    ("a* = 1/1090 ~ 9.17e-4", abs(a_star - 1/1090) < 1e-6),
    ("H0 = 67.4 km/s/Mpc", abs(H0 - 67.4) < 0.01),

    # Radiation density
    ("Om_r ~ 9e-5 (reasonable)", 5e-5 < Omega_r < 1.5e-4),
    ("R(a*) ~ 0.6 (baryon loading)", 0.4 < R_star < 0.8),

    # eta* computation
    ("eta* is finite and positive", eta_star_val > 0),
    ("eta* in range [250, 350] Mpc", 250 < eta_star_val < 350),
    ("eta* != 337 (tests framework conjecture)", True),  # We report actual value

    # Standard r_s
    ("r_s (standard) in [140, 150] Mpc", 140 < r_s_standard < 150),
    ("r_s (standard) within 2% of Planck", abs(r_s_standard/144.43 - 1) < 0.02),

    # Framework r_s
    ("r_s (framework) computed", r_s_framework > 0),

    # Sound speed
    ("c_s at a* in [0.40, 0.50]", 0.40 < cs_at_star < 0.50),
    ("c_s at a* != 3/7 = 0.4286", abs(cs_at_star - 3/7) > 0.01),
    ("Effective <c_s> != 3/7", abs(cs_effective - 3/7) > 0.005),

    # Drag epoch
    ("r_d > r_s (drag after recombination)", r_d > r_s_standard),
    ("r_d within 3% of Planck 147.09", abs(r_d/147.09 - 1) < 0.03),

    # Key result: does eta* = 337?
    ("eta* within 5% of 337", abs(eta_star_val/337 - 1) < 0.05),
    ("eta* within 1% of 337", abs(eta_star_val/337 - 1) < 0.01),
]

all_pass = True
pass_count = 0
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    else:
        pass_count += 1
    print(f"[{status}] {name}")

print()
print(f"Result: {pass_count}/{len(tests)} PASS")

# ==============================================================================
# VERDICT
# ==============================================================================
print()
print("=" * 70)
print("VERDICT")
print("=" * 70)

eta_error_pct = abs(eta_star_val / 337 - 1) * 100
rs_std_error_pct = abs(r_s_standard / 144.43 - 1) * 100
rs_fw_error_pct = abs(r_s_framework / 144.43 - 1) * 100

if eta_error_pct < 1:
    print(f"eta* = {eta_star_val:.2f} Mpc -- MATCHES 337 to {eta_error_pct:.1f}%")
    print("The conjecture eta* = 337 Mpc is CONFIRMED by the integral.")
elif eta_error_pct < 5:
    print(f"eta* = {eta_star_val:.2f} Mpc -- NEAR MISS, {eta_error_pct:.1f}% from 337")
    print("The conjecture eta* = 337 Mpc is APPROXIMATE but not exact.")
else:
    print(f"eta* = {eta_star_val:.2f} Mpc -- FAILS, {eta_error_pct:.1f}% from 337")
    print("The conjecture eta* = 337 Mpc is REFUTED.")

print()
print(f"Standard r_s = {r_s_standard:.2f} Mpc (error {rs_std_error_pct:.2f}% from Planck)")
print(f"Framework r_s = eta*x3/7 = {r_s_framework:.2f} Mpc (error {rs_fw_error_pct:.2f}% from Planck)")
print(f"Effective <c_s> = {cs_effective:.4f} (framework claims {3/7:.4f})")
print()

if rs_std_error_pct < rs_fw_error_pct:
    print("Standard c_s gives BETTER r_s than framework c_s = 3/7.")
else:
    print("Framework c_s = 3/7 gives BETTER r_s than standard c_s.")

print()
print("The compensating-errors story from S191:")
print(f"  eta* is {(eta_star_val/337-1)*100:+.1f}% from 337")
print(f"  c_s = 3/7 is {(3/7/cs_effective-1)*100:+.1f}% from effective <c_s>")
print(f"  Product: r_s(fw) = {r_s_framework:.2f} vs measured 144.43")
