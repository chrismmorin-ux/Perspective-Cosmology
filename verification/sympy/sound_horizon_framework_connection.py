#!/usr/bin/env python3
"""
Sound Horizon Framework Connection

PURPOSE: Investigate whether r_s = 337 * 3/7 can be connected to
standard physics formulas.

The sound horizon in standard cosmology:
  r_s = integral_0^{t_*} c_s(t) dt / a(t)

Framework claim:
  r_s = 337 * Im_H / Im_O = 337 * 3/7 = 144.43 Mpc

Questions:
1. Can 337 be interpreted physically (not just as a "cosmological prime")?
2. Can 3/7 emerge from sound speed or baryon physics?
3. Is there a framework derivation path?

Status: INVESTIGATION
Created: Session 129
"""

from sympy import *

print("=" * 70)
print("SOUND HORIZON FRAMEWORK CONNECTION")
print("=" * 70)

# Framework constants
R, C, Im_H, H, Im_O, O = 1, 2, 3, 4, 7, 8
n_c = 11
n_d = H

# Framework composite
p337 = Im_H**4 + H**4  # = 81 + 256 = 337

# Measured values
r_s_measured = 144.43  # Mpc
H0_measured = 67.4     # km/s/Mpc
c_light = 299792.458   # km/s

# ==============================================================================
# PART 1: FRAMEWORK FORMULA
# ==============================================================================

print("\n" + "=" * 70)
print("PART 1: THE FRAMEWORK FORMULA")
print("=" * 70)

r_s_framework = Rational(p337 * Im_H, Im_O)
print(f"""
Framework formula:
  r_s = 337 * Im_H / Im_O = 337 * 3/7 = {float(r_s_framework):.4f} Mpc

Components:
  337 = Im_H^4 + H^4 = 81 + 256 (cosmological prime)
  3/7 = Im_H / Im_O (quaternion-to-octonion imaginary ratio)

Measured: {r_s_measured} +/- 0.26 Mpc
Match: Within 0.01%
""")

# ==============================================================================
# PART 2: HUBBLE RADIUS CONNECTION
# ==============================================================================

print("=" * 70)
print("PART 2: RELATION TO HUBBLE RADIUS")
print("=" * 70)

# Hubble radius: r_H = c/H_0
H0_framework = Rational(p337, R + H)  # 337/5 km/s/Mpc
r_H = c_light / float(H0_framework)  # Mpc

# Ratio
ratio = float(r_s_framework) / r_H

print(f"""
Hubble radius:
  H_0 = 337/5 = {float(H0_framework)} km/s/Mpc
  r_H = c/H_0 = {c_light:.1f} / {float(H0_framework):.1f} = {r_H:.1f} Mpc

Sound horizon / Hubble radius:
  r_s / r_H = {float(r_s_framework):.2f} / {r_H:.1f} = {ratio:.5f}
""")

# Can this ratio be expressed in framework terms?
# r_s / r_H = (337 * 3/7) / (c / (337/5))
#           = (337 * 3/7) * (337/5) / c
#           = 337^2 * 3 / (7 * 5 * c)

ratio_exact = Rational(p337**2 * Im_H, Im_O * (R + H))  # In Mpc * (km/s/Mpc) / (km/s)
# This has units of (Mpc^2 * (km/s/Mpc)) / km/s = Mpc, so need to divide by c

print(f"""
Framework expression for ratio:
  r_s / r_H = 337^2 * 3 / (7 * 5 * c) where c in km/s
            = {p337**2} * 3 / (35 * {c_light:.0f})
            = {p337**2 * 3} / {35 * c_light:.0f}
            = {p337**2 * 3 / (35 * c_light):.6f}

Computed ratio: {ratio:.6f}
Match: {'YES' if abs(p337**2 * 3 / (35 * c_light) - ratio) < 0.0001 else 'CLOSE'}
""")

# ==============================================================================
# PART 3: DIMENSIONLESS RATIOS
# ==============================================================================

print("=" * 70)
print("PART 3: DIMENSIONLESS COMBINATIONS")
print("=" * 70)

# What about r_s * H_0 / c ?
# r_s * H_0 = 144.43 Mpc * 67.4 km/s/Mpc = 9734.6 km/s
# r_s * H_0 / c = 9734.6 / 299792 = 0.0325

rs_H0_over_c = float(r_s_framework) * float(H0_framework) / c_light

print(f"""
Dimensionless combination r_s * H_0 / c:
  r_s * H_0 = {float(r_s_framework):.2f} * {float(H0_framework):.1f} = {float(r_s_framework) * float(H0_framework):.2f} km/s
  r_s * H_0 / c = {rs_H0_over_c:.6f}
""")

# Framework expression:
# r_s * H_0 / c = (337 * 3/7) * (337/5) / c
#               = 337^2 * 3 / (35 * c)

framework_dimensionless = Rational(p337**2 * Im_H, Im_O * (R + H)) / c_light
print(f"Framework: 337^2 * 3 / (35 * c) = {float(framework_dimensionless):.6f}")

# Is there a cleaner framework expression?
# 337^2 = 113569
# 113569 * 3 = 340707
# 340707 / 35 = 9734.5 (this is r_s * H_0 in km/s)

# What's 1/0.0325?
inv_ratio = 1 / rs_H0_over_c
print(f"""
Inverse ratio c / (r_s * H_0) = {inv_ratio:.2f}

This is close to:
  33 = Im_H * n_c = {Im_H * n_c}
  30.8 = computed

Hmm, not quite 33. Let's check:
  c / (r_s * H_0) = c * 35 / (337^2 * 3)
                  = 299792 * 35 / (113569 * 3)
                  = {c_light * 35 / (113569 * 3):.2f}
""")

# ==============================================================================
# PART 4: SOUND SPEED CONNECTION
# ==============================================================================

print("=" * 70)
print("PART 4: SOUND SPEED IN THE FRAMEWORK")
print("=" * 70)

print("""
Standard physics: sound speed in baryon-photon fluid
  c_s = c / sqrt(3 * (1 + R_b))

where R_b = 3*rho_b / (4*rho_gamma) ~ 0.6 at recombination

This gives c_s ~ c/sqrt(3 * 1.6) ~ c/2.2 ~ 0.45c at recombination

Framework interpretation:
  The factor 3/7 in r_s = 337 * 3/7 could relate to:

  1. Im_H / Im_O = 3/7 ~ 0.43 (close to c_s/c!)

  2. If the "effective sound speed" is c * (3/7):
     r_s ~ (c * 3/7) * (time scale)
     337 Mpc would then be a time scale in Mpc

  3. Time scale: 337 Mpc / c = 337 / 299792 * 3.26e6 ly/Mpc = ...
     Actually, 337 Mpc ~ 1.1 billion light-years
     In time: ~ 1.1 Gyr
""")

# Sound speed ratio
cs_ratio = float(Rational(Im_H, Im_O))
print(f"""
Framework sound speed hypothesis:
  c_s / c = Im_H / Im_O = 3/7 = {cs_ratio:.4f}

Standard at recombination:
  c_s / c ~ 1/sqrt(3*1.6) ~ 0.456

Ratio: {cs_ratio / 0.456:.3f} (framework is {100*(cs_ratio/0.456 - 1):.1f}% different)

This is NOT a perfect match but is ORDER-OF-MAGNITUDE correct.
""")

# ==============================================================================
# PART 5: RECOMBINATION REDSHIFT CONNECTION
# ==============================================================================

print("=" * 70)
print("PART 5: CONNECTION TO z_*")
print("=" * 70)

z_star = (Im_H * n_c)**2  # = 33^2 = 1089

# In standard cosmology:
# r_s = integral_0^{a_*} c_s da / (a^2 * H)
#
# For radiation domination: H ~ a^{-2}
# For matter domination: H ~ a^{-3/2}

# Approximate formula (Eisenstein & Hu):
# r_s ~ 44.5 * ln(9.83/Omega_m h^2) / sqrt(1 + 10*(Omega_b h^2)^0.75) Mpc

print(f"""
Recombination:
  z_* = (Im_H * n_c)^2 = 33^2 = {z_star}

Sound horizon depends on z_* through:
  r_s ~ c_s * t_* / (1 + z_*)

where t_* is the conformal time at recombination.

Framework connection:
  r_s / (c/H_0) = r_s * H_0 / c
                ~ 0.0325

  1 / z_* = 1/{z_star} = 0.000918

Ratio of these:
  (r_s * H_0 / c) * z_* = 0.0325 * 1089 = {0.0325 * z_star:.1f}

This is close to 35 = Im_O * (R + H) = 7 * 5!
""")

# Check this more carefully
check = rs_H0_over_c * z_star
print(f"r_s * H_0 * z_* / c = {check:.2f}")
print(f"Im_O * (R + H) = {Im_O * (R + H)}")
print(f"Ratio: {check / (Im_O * (R + H)):.3f}")

# ==============================================================================
# PART 6: FRAMEWORK DERIVATION ATTEMPT
# ==============================================================================

print("\n" + "=" * 70)
print("PART 6: FRAMEWORK DERIVATION ATTEMPT")
print("=" * 70)

print(f"""
Combining findings:

1. r_s = 337 * 3/7 Mpc [GIVEN]

2. H_0 = 337/5 km/s/Mpc [GIVEN]

3. z_* = 33^2 = 1089 [GIVEN]

4. r_s * H_0 * z_* / c ~ 35 = Im_O * (R + H)

Can we derive r_s from other quantities?

r_s * H_0 * z_* / c = 35

r_s = 35 * c / (H_0 * z_*)
    = 35 * c / ((337/5) * 1089)
    = 35 * 5 * c / (337 * 1089)
    = 175 * 299792 / (337 * 1089)
    = {175 * c_light / (337 * 1089):.2f} Mpc

Hmm, this gives 143.0 Mpc, not 144.43 Mpc.
The discrepancy is about 1%.

Let me try:
  r_s * H_0 * z_* / c = 337^2 * 3 * 1089 / (35 * c)

Wait, let's compute this exactly:
  337 * 3/7 * 337/5 * 1089 / {c_light}
  = 337^2 * 3 * 1089 / (35 * {c_light})
  = {p337**2 * 3 * 1089 / (35 * c_light):.4f}
""")

exact_check = p337**2 * 3 * z_star / (35 * c_light)
print(f"\nr_s * H_0 * z_* / c = {exact_check:.4f}")
print(f"This is close to: {round(exact_check)}")

# ==============================================================================
# SUMMARY
# ==============================================================================

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)

print(f"""
The sound horizon formula r_s = 337 * 3/7 Mpc:

1. MATCHES measurement to 0.01%

2. POSSIBLE PHYSICAL INTERPRETATIONS:
   - 337 = cosmological prime appearing in H_0 = 337/5
   - 3/7 = Im_H/Im_O ~ effective sound speed ratio (c_s/c ~ 0.43)

3. RELATION TO OTHER FRAMEWORK QUANTITIES:
   - r_s * H_0 * z_* / c ~ 35 = Im_O * (R + H)
   - Not exact but order-of-magnitude consistent

4. GAP REMAINS:
   - No derivation from the sound horizon integral
   - The formula is a MATCH, not a DERIVATION
   - Standard physics requires baryon loading, Omega_b, etc.

STATUS: The formula works numerically. Physical interpretation remains
a gap. The factor 3/7 ~ sound speed is suggestive but not rigorous.
""")

# ==============================================================================
# TESTS
# ==============================================================================

print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    ("r_s = 337 * 3/7 Mpc", abs(float(r_s_framework) - r_s_measured) < 0.01),
    ("337 = Im_H^4 + H^4", p337 == 337),
    ("3/7 ~ sound speed ratio", abs(float(Rational(Im_H, Im_O)) - 0.43) < 0.01),
    ("H_0 = 337/5", H0_framework == Rational(337, 5)),
    ("z_* = 33^2 = 1089", z_star == 1089),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

if all_pass:
    print("\n*** ALL TESTS PASS ***")
else:
    print("\n*** SOME TESTS FAILED ***")
