#!/usr/bin/env python3
"""
Sound Speed from Crystallization: Testing 4 Derivation Paths

KEY FINDING: c_s = 3/7 = Im_H/Im_O is CONJECTURED (HRS=7).
None of the 4 paths provide a clean first-principles derivation.
Path C (standard formula with framework R*) yields c_s = 0.454, NOT 3/7.
The 3/7 value remains a pattern match, not a derivation.

NOTE ON CONVENTION: The framework claim is c_s = 3/7 (the speed ratio itself),
used as r_s = eta_* * c_s = 337 * 3/7 = 144.43 Mpc.
Standard physics: c_s^2 = 1/(3(1+R*)) giving c_s ~ 0.454.

Formula: c_s = Im_H / Im_O = 3/7 ~ 0.4286 [CONJECTURE]
Standard: c_s^2 = 1/(3(1+R*)) with R* = 3*rho_b/(4*rho_gamma)
Measured product: r_s = 144.43 +/- 0.26 Mpc (Planck 2018)
Framework product: r_s = 337 * 3/7 = 144.43 Mpc (0.01% match)
WARNING: Individual factors (c_s and eta_*) each deviate ~5-18%
Status: INVESTIGATION (testing 4 paths)

Depends on:
- [AXIOM] Division algebras: Im_H=3, Im_O=7
- [A-IMPORT] Omega_b, Omega_gamma, T_CMB from Planck
- [DERIVED] 337 = Im_H^4 + H^4

Created: Session 189
"""

from sympy import *
from sympy import Rational as R

# ==============================================================================
# FRAMEWORK CONSTANTS
# ==============================================================================

# Division algebra dimensions [AXIOM]
dims_R, dims_C, dims_H, dims_O = 1, 2, 4, 8
Im_R, Im_C, Im_H, Im_O = 0, 1, 3, 7

# Crystal and defect dimensions [DERIVED]
n_c = Im_C + Im_H + Im_O  # = 11
n_d = dims_H               # = 4

# The conjectured value: c_s = 3/7 (the speed itself, NOT c_s^2)
cs_conj = R(Im_H, Im_O)  # 3/7 ~ 0.4286
cs_squared_conj = cs_conj**2  # 9/49 ~ 0.1837

# ==============================================================================
# STANDARD PHYSICS VALUES [A-IMPORT]
# ==============================================================================

# Planck 2018 best-fit values
Omega_b_h2 = R(2237, 100000)   # 0.02237 (Planck 2018 TT,TE,EE+lowE)
Omega_c_h2 = R(1200, 10000)    # 0.1200
h = R(6736, 10000)             # 0.6736
T_CMB = R(27255, 10000)        # 2.7255 K

# Derived standard quantities
Omega_b = Omega_b_h2 / h**2
Omega_m = (Omega_b_h2 + Omega_c_h2) / h**2

# Standard baryon-to-photon ratio at decoupling
# R* = 3*rho_b/(4*rho_gamma) at z_* ~ 1089
# R* = 31500 * Omega_b_h2 * (T_CMB/2.7 K)^{-4} * (z_*/1100)^{-1}
# Approximate: R* ~ 0.619 (Planck 2018)
z_star = 1089
T_ratio = T_CMB / R(27, 10)
R_star_approx = 31500 * Omega_b_h2 * T_ratio**(-4) / (1 + z_star)

# Standard sound speed
cs_squared_std = 1 / (3 * (1 + R_star_approx))
cs_std = sqrt(cs_squared_std)

# Measured sound horizon
r_s_measured = R(14443, 100)  # 144.43 Mpc (Planck 2018)

# ==============================================================================
# PATH A: DOF RATIO
# ==============================================================================

print("=" * 70)
print("PATH A: DOF Ratio")
print("=" * 70)
print()
print("Hypothesis: c_s^2 = (propagating modes)/(total modes)")
print("  Baryons carry Im_O=7 internal modes (octonion sector)")
print("  Photons carry Im_H=3 oscillating modes (quaternion sector)")
print()

# Test 1: c_s^2 = Im_H / Im_O
cs2_A1 = R(Im_H, Im_O)
print(f"  Test A1: c_s^2 = Im_H/Im_O = {Im_H}/{Im_O} = {float(cs2_A1):.6f}")
print(f"    c_s = {float(sqrt(cs2_A1)):.6f}")

# Test 2: c_s^2 = Im_H / (Im_H + Im_O) — fractional
cs2_A2 = R(Im_H, Im_H + Im_O)
print(f"  Test A2: c_s^2 = Im_H/(Im_H+Im_O) = {Im_H}/{Im_H+Im_O} = {float(cs2_A2):.6f}")
print(f"    c_s = {float(sqrt(cs2_A2)):.6f}")

# Test 3: c_s^2 = n_d / n_c — spacetime/crystal
cs2_A3 = R(n_d, n_c)
print(f"  Test A3: c_s^2 = n_d/n_c = {n_d}/{n_c} = {float(cs2_A3):.6f}")
print(f"    c_s = {float(sqrt(cs2_A3)):.6f}")

# Test 4: c_s^2 = 1/3 — radiation dominated (standard limit R*=0)
cs2_A4 = R(1, 3)
print(f"  Test A4: c_s^2 = 1/3 (radiation limit) = {float(cs2_A4):.6f}")
print(f"    c_s = {float(sqrt(cs2_A4)):.6f}")

print()
print("Assessment: Path A is an IDENTIFICATION, not a derivation.")
print("  The assignment 'baryons = Im_O, photons = Im_H' is [A-PHYSICAL].")
print("  No dynamics connecting DOF counting to acoustic speed.")
print("  Grade: F (pattern match only)")

# ==============================================================================
# PATH B: PRESSURE/INERTIA FROM TILT DECOMPOSITION
# ==============================================================================

print()
print("=" * 70)
print("PATH B: Pressure/Inertia from Tilt Decomposition")
print("=" * 70)
print()

# 16 tilt DOF = 4 massive + 12 gauge (from S150)
tilt_total = n_d**2  # 16
tilt_massive = n_d    # 4
tilt_gauge = tilt_total - tilt_massive  # 12

print(f"Tilt DOF: {tilt_total} total = {tilt_massive} massive + {tilt_gauge} gauge")
print()

# Hypothesis: acoustic restoring force comes from Im_H=3 spatial dimensions
# Inertia comes from Im_O=7 internal dimensions
# c_s^2 = (restoring force DOF) / (inertia DOF) = 3/7
cs2_B = R(Im_H, Im_O)
print(f"  Hypothesis: c_s^2 = (spatial restoring DOF)/(internal inertia DOF)")
print(f"  = Im_H/Im_O = {Im_H}/{Im_O} = {float(cs2_B):.6f}")
print()

# Alternative: c_s^2 = massive/gauge tilt ratio?
cs2_B2 = R(tilt_massive, tilt_gauge)
print(f"  Alternative: c_s^2 = massive/gauge = {tilt_massive}/{tilt_gauge} = {float(cs2_B2):.6f}")
print(f"    c_s = {float(sqrt(cs2_B2)):.6f}")
print(f"    This gives 1/3, the radiation-dominated limit.")
print()

# Another: c_s^2 = (Im_H spatial) / (Im_O internal) from mass=energy in S186
# Mass = internal energy in Im(O)=7 dimensions
# Pressure = spatial oscillation in Im(H)=3 spatial dimensions
# c_s^2 = dp/drho = Im_H/Im_O if pressure is proportional to spatial DOF
print("Assessment: Path B restates Path A in tilt language.")
print("  The identification 'spatial = Im_H, internal = Im_O' is the same assumption.")
print("  Notable: massive/gauge = 4/12 = 1/3 naturally gives radiation limit.")
print("  Grade: F (same assumption as Path A, different language)")

# ==============================================================================
# PATH C: STANDARD FORMULA WITH FRAMEWORK R*
# ==============================================================================

print()
print("=" * 70)
print("PATH C: Standard Formula with Framework R*")
print("=" * 70)
print()

# Standard physics: c_s^2 = 1/(3(1+R*))
# R* = 3*rho_b/(4*rho_gamma)
# Framework modifies Omega_b through baryon density formula:
# Omega_b = Omega_m * Im_H^2 / (Im_O^2 + Im_H^2) = Omega_m * 9/58

framework_baryon_fraction = R(Im_H**2, Im_O**2 + Im_H**2)
print(f"Framework baryon fraction: Im_H^2/(Im_O^2+Im_H^2) = {Im_H**2}/{Im_O**2 + Im_H**2} = {float(framework_baryon_fraction):.6f}")
print(f"Standard Omega_b/Omega_m from Planck: {float(Omega_b / Omega_m):.6f}")
print(f"  ({float(framework_baryon_fraction):.6f} vs {float(Omega_b / Omega_m):.6f})")
print()

# Use the standard R* formula with Planck parameters
print(f"Standard R* at z_* = {z_star}:")
print(f"  R* = {float(R_star_approx):.6f}")
print(f"  c_s^2 = 1/(3(1+R*)) = {float(cs_squared_std):.6f}")
print(f"  c_s = {float(cs_std):.6f}")
print()

# What R* would give c_s^2 = 3/7?
# 3/7 = 1/(3(1+R*)) => 3(1+R*) = 7/3 => 1+R* = 7/9 => R* = -2/9
R_star_needed = R(7, 3) / 3 - 1  # = 7/9 - 1 = -2/9
print(f"R* needed for c_s^2 = 3/7: R* = {R_star_needed} = {float(R_star_needed):.4f}")
print(f"  This is NEGATIVE — physically impossible (baryons have positive density)")
print()

# What c_s^2 does the framework Omega_b give?
# Use framework Omega_b_h2 = 567/11600 * h^2 -- let's compute
# Actually: Omega_b = Omega_m * 9/58
# Standard Omega_m_h2 = Omega_b_h2 + Omega_c_h2 = 0.02237 + 0.1200 = 0.14237
# Framework Omega_b_h2 = 0.14237 * 9/58 = 0.02209 (close to 0.02237)
Omega_m_h2 = Omega_b_h2 + Omega_c_h2
framework_Omega_b_h2 = Omega_m_h2 * R(9, 58)
R_star_framework = 31500 * framework_Omega_b_h2 * T_ratio**(-4) / (1 + z_star)
cs2_C = 1 / (3 * (1 + R_star_framework))
cs_C = sqrt(cs2_C)

print(f"Framework Omega_b*h^2 = Omega_m*h^2 * 9/58 = {float(framework_Omega_b_h2):.5f}")
print(f"  (vs Planck: {float(Omega_b_h2):.5f})")
print(f"Framework R* = {float(R_star_framework):.6f}")
print(f"Framework c_s^2 = {float(cs2_C):.6f}")
print(f"Framework c_s = {float(cs_C):.6f}")
print()

# Compare all three
print(f"Comparison:")
print(f"  Standard c_s        = {float(cs_std):.6f}")
print(f"  Framework c_s       = {float(cs_C):.6f}")
print(f"  Conjectured c_s     = {float(cs_conj):.6f} (3/7)")
print(f"  Difference (std):   {abs(float(cs_std) - float(cs_conj))/float(cs_std)*100:.2f}%")
print(f"  Difference (frmwk): {abs(float(cs_C) - float(cs_conj))/float(cs_C)*100:.2f}%")
print()

print("Assessment: Path C REFUTES c_s = 3/7.")
print("  Standard formula gives c_s ~ 0.454, framework claims c_s = 3/7 ~ 0.429.")
print("  Framework's Omega_b modification changes c_s by <1%, nowhere near the 5.6% gap.")
print("  Grade: INFORMATIVE — shows c_s = 3/7 CONTRADICTS standard acoustic physics.")

# ==============================================================================
# PATH D: CHANNEL WEIGHT IN CRYSTALLIZATION PRESSURE
# ==============================================================================

print()
print("=" * 70)
print("PATH D: Channel Weight in Crystallization Pressure")
print("=" * 70)
print()

# Generalized crystallization pressure: Pi = f_ch * (-dW/deps) * Omega
# From S169: 9 types of crystallization pressure
# Acoustic oscillation = pressure variation in baryon-photon plasma
# The C-channel weight f_C in the baryon-photon plasma

# Framework channel weights from S169:
# C-channel: f_C = Im_C/(Im_C + Im_H + Im_O) = 1/11
# H-channel: f_H = Im_H/(Im_C + Im_H + Im_O) = 3/11
# O-channel: f_O = Im_O/(Im_C + Im_H + Im_O) = 7/11

f_C = R(Im_C, n_c)
f_H = R(Im_H, n_c)
f_O = R(Im_O, n_c)

print(f"Channel weights:")
print(f"  f_C = Im_C/n_c = {Im_C}/{n_c} = {float(f_C):.4f}")
print(f"  f_H = Im_H/n_c = {Im_H}/{n_c} = {float(f_H):.4f}")
print(f"  f_O = Im_O/n_c = {Im_O}/{n_c} = {float(f_O):.4f}")
print()

# Hypothesis D1: c_s^2 = f_H = 3/11
cs2_D1 = f_H
print(f"  D1: c_s^2 = f_H = {float(cs2_D1):.6f}, c_s = {float(sqrt(cs2_D1)):.6f}")

# Hypothesis D2: c_s^2 = f_H / f_O = 3/7 (ratio of H to O channels)
cs2_D2 = f_H / f_O
print(f"  D2: c_s^2 = f_H/f_O = {float(cs2_D2):.6f}, c_s = {float(sqrt(cs2_D2)):.6f}")

# Hypothesis D3: c_s^2 = f_H / (f_H + f_O) = 3/10
cs2_D3 = f_H / (f_H + f_O)
print(f"  D3: c_s^2 = f_H/(f_H+f_O) = {float(cs2_D3):.6f}, c_s = {float(sqrt(cs2_D3)):.6f}")

# Hypothesis D4: c_s^2 = (1 - f_O) / (1 + f_O) = 4/18 = 2/9
cs2_D4 = (1 - f_O) / (1 + f_O)
print(f"  D4: c_s^2 = (1-f_O)/(1+f_O) = {float(cs2_D4):.6f}, c_s = {float(sqrt(cs2_D4)):.6f}")
print()

print("Assessment: Path D2 gives c_s^2 = 3/7, but this is CIRCULAR.")
print("  f_H/f_O = Im_H/Im_O = 3/7 by construction.")
print("  The question is WHY the H-channel drives acoustic pressure and")
print("  the O-channel drives inertia. No dynamics connect channels to physics.")
print("  Grade: D (recovers value but circularly)")

# ==============================================================================
# COMPENSATING ERRORS ANALYSIS
# ==============================================================================

print()
print("=" * 70)
print("COMPENSATING ERRORS ANALYSIS")
print("=" * 70)
print()

# r_s = eta_* x c_s where:
# Framework: eta_* = 337 Mpc, c_s = 3/7 = 0.4286
# Standard: eta_* ~ 285 Mpc, c_s = 0.454

eta_framework = 337  # Mpc [CONJECTURE]
cs_framework = float(R(3, 7))  # c_s = 3/7 (the speed, not squared)
rs_framework = eta_framework * cs_framework

eta_standard = 285  # Mpc (approximate)
cs_standard = 0.454
rs_standard = eta_standard * cs_standard

print(f"Framework: eta_* = {eta_framework} Mpc, c_s = {cs_framework:.4f}")
print(f"  r_s = {eta_framework} x {cs_framework:.4f} = {rs_framework:.2f} Mpc")
print()
print(f"Standard:  eta_* ~ {eta_standard} Mpc, c_s = {cs_standard:.4f}")
print(f"  r_s = {eta_standard} x {cs_standard:.4f} = {rs_standard:.2f} Mpc")
print()
print(f"Measured:  r_s = {float(r_s_measured):.2f} Mpc")
print()

# Individual deviations
eta_dev = abs(eta_framework - eta_standard) / eta_standard * 100
cs_dev = abs(cs_framework - cs_standard) / cs_standard * 100
rs_dev = abs(rs_framework - float(r_s_measured)) / float(r_s_measured) * 100

print(f"Deviations:")
print(f"  eta_*: {eta_dev:.1f}% (framework vs standard)")
print(f"  c_s:   {cs_dev:.1f}% (framework vs standard)")
print(f"  r_s:   {rs_dev:.2f}% (framework vs measured)")
print()

print("CONCLUSION: The 0.01% r_s match likely involves compensating errors.")
print(f"  eta_* is {eta_dev:.0f}% too high, c_s is {cs_dev:.0f}% too low.")
print(f"  These approximately cancel in the product r_s = eta_* x c_s.")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print()
print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    # Framework values (c_s = 3/7 the speed, not c_s^2)
    ("c_s = 3/7 = Im_H/Im_O", cs_conj == R(3, 7) and R(3, 7) == R(Im_H, Im_O)),
    ("c_s ~ 0.4286", abs(float(cs_conj) - 0.4286) < 0.001),
    ("c_s^2 = 9/49", cs_squared_conj == R(9, 49)),

    # Standard physics
    ("R* ~ 0.619 (Planck 2018)", abs(float(R_star_approx) - 0.619) < 0.02),
    ("Standard c_s ~ 0.454", abs(float(cs_std) - 0.454) < 0.005),

    # Path A tests (these test c_s^2 candidate expressions)
    ("Path A1: Im_H/Im_O = 3/7", cs2_A1 == R(3, 7)),
    ("Path A2: Im_H/(Im_H+Im_O) = 3/10", cs2_A2 == R(3, 10)),
    ("Path A3: n_d/n_c = 4/11", cs2_A3 == R(4, 11)),

    # Path C tests
    ("Path C: Standard c_s (0.454) > framework c_s (0.429)",
     float(cs_std) > float(cs_conj)),
    ("Path C: Framework Omega_b close to Planck",
     abs(float(framework_Omega_b_h2) - float(Omega_b_h2)) / float(Omega_b_h2) < 0.02),

    # Path D tests
    ("Path D: f_H/f_O = Im_H/Im_O = 3/7 (circular)", cs2_D2 == R(3, 7)),
    ("Path D: Channel weights sum to 1", f_C + f_H + f_O == 1),

    # Product test: r_s = 337 * (3/7) = 144.43
    ("r_s = 337 * (3/7) ~ 144.43", abs(337 * float(cs_conj) - float(r_s_measured)) < 0.5),

    # Compensating errors: c_s is 5.6% below standard
    ("Framework c_s 5-6% below standard",
     4 < abs(float(cs_conj) - float(cs_std))/float(cs_std)*100 < 7),
    ("eta_* deviation > 15%", eta_dev > 15),
    ("r_s match < 0.1%", rs_dev < 0.15),

    # Critical test: standard formula does NOT give c_s = 3/7
    ("CRITICAL: Standard c_s^2 (0.205) >> framework c_s^2 (0.184)",
     float(cs_squared_std) > float(cs_squared_conj) * 1.05),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print()
print(f"SUMMARY: {sum(1 for _, p in tests if p)}/{len(tests)} tests passed")
if all_pass:
    print("ALL TESTS PASS")
else:
    print("SOME TESTS FAILED — investigate")
print()

print("=" * 70)
print("OVERALL CONCLUSION")
print("=" * 70)
print()
print("c_s = 3/7 = Im_H/Im_O remains [CONJECTURE] with HRS = 7 (HIGH).")
print()
print("Path A (DOF ratio):      IDENTIFICATION only, no dynamics    — Grade F")
print("Path B (tilt decomp):    Restates Path A in tilt language    — Grade F")
print("Path C (standard R*):    REFUTES c_s = 3/7                  — Grade: INFORMATIVE")
print("Path D (channel weight): Recovers value CIRCULARLY          — Grade D")
print()
print("NONE of the 4 paths derive c_s = 3/7 from first principles.")
print("The r_s = 337*(3/7) = 144.43 Mpc: each factor ~5-18% off standard,")
print("Status: Gap G-CMB-CS remains OPEN.")

if __name__ == "__main__":
    pass  # All output in module body for this investigation script
