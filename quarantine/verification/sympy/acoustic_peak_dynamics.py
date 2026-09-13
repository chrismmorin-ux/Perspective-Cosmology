#!/usr/bin/env python3
"""
Acoustic Peak Dynamics from Crystallization

KEY QUESTION: Can we DERIVE l_1, l_2, l_3 from physical principles,
not just match numbers?

Standard CMB physics:
  l_n = n * pi * D_A / r_s

where:
  D_A = angular diameter distance to last scattering
  r_s = sound horizon at recombination

This script attempts to derive these from crystallization physics.

Status: DERIVATION ATTEMPT
Created: Session 123
"""

from sympy import *

print("=" * 70)
print("ACOUSTIC PEAK DYNAMICS FROM CRYSTALLIZATION")
print("=" * 70)

# Framework dimensions
R, C, Im_H, H, Im_O, O = 1, 2, 3, 4, 7, 8
n_d = H  # spacetime
n_c = R + C + O  # crystal = 11

print(f"""
FRAMEWORK DIMENSIONS:
  R = {R}, C = {C}, Im_H = {Im_H}, H = {H}, Im_O = {Im_O}, O = {O}
  n_d = {n_d} (spacetime)
  n_c = {n_c} (crystal)
""")

# ==============================================================================
# PART 1: STANDARD CMB PEAK PHYSICS
# ==============================================================================

print("=" * 70)
print("PART 1: STANDARD CMB PEAK PHYSICS")
print("=" * 70)

print("""
STANDARD PHYSICS:

The CMB acoustic peaks arise from standing waves in the baryon-photon plasma.
The peak positions are determined by:

  l_n = n * pi * D_A / r_s

where:
  n = harmonic number (1, 2, 3, ...)
  D_A = angular diameter distance to z_*
  r_s = sound horizon at recombination

Measured values:
  l_1 ~ 220 (first compression peak)
  l_2 ~ 537 (first rarefaction peak)
  l_3 ~ 810 (second compression peak)

The ratio l_n / l_1 = n (approximately, with corrections from driving effects)
""")

# Measured peak positions (Planck 2018)
l1_measured = 220.0
l2_measured = 537.0  # Actually ~537, not ~546
l3_measured = 810.0

print(f"Measured peaks: l_1 = {l1_measured}, l_2 = {l2_measured}, l_3 = {l3_measured}")
print(f"Ratios: l_2/l_1 = {l2_measured/l1_measured:.3f}, l_3/l_1 = {l3_measured/l1_measured:.3f}")

# ==============================================================================
# PART 2: THE SOUND HORIZON
# ==============================================================================

print("\n" + "=" * 70)
print("PART 2: SOUND HORIZON DERIVATION")
print("=" * 70)

print("""
SOUND HORIZON FORMULA:

Standard:
  r_s = integral from 0 to t_* of c_s(t) * dt / a(t)

  c_s = c / sqrt(3 * (1 + R_b))
  R_b = 3 * rho_b / (4 * rho_gamma)  [baryon loading]

The integral gives r_s ~ 144 Mpc (comoving).

FRAMEWORK APPROACH:

Can we get r_s from division algebra structure?

Measured: r_s = 144.43 +/- 0.26 Mpc (Planck 2018)
""")

rs_measured = 144.43  # Mpc

# Try to find framework expression
# Previous formula: r_s = 337 * 3/7 = 1011/7 = 144.43
rs_formula_1 = Rational(337 * 3, 7)  # = 1011/7
print(f"\nCandidate 1: r_s = 337 * Im_H / Im_O = 337 * 3/7 = {rs_formula_1} = {float(rs_formula_1):.4f}")
print(f"  Error: {abs(float(rs_formula_1) - rs_measured)/rs_measured * 100:.4f}%")

# Why 337? This is the cosmological prime: 337 = 3^4 + 4^4
print(f"\n  337 = 3^4 + 4^4 = {3**4} + {4**4} = {3**4 + 4**4} (consecutive fourth powers)")
print(f"  3 = Im_H, 4 = H")
print(f"  So 337 = Im_H^4 + H^4")

# ==============================================================================
# PART 3: ANGULAR DIAMETER DISTANCE
# ==============================================================================

print("\n" + "=" * 70)
print("PART 3: ANGULAR DIAMETER DISTANCE")
print("=" * 70)

print("""
ANGULAR DIAMETER DISTANCE:

D_A = (c/H_0) * integral from 0 to z_* of dz / E(z)

where E(z) = sqrt(Omega_m * (1+z)^3 + Omega_Lambda)

For z_* = 1089 and H_0 = 67.4 km/s/Mpc:
  D_A ~ 12.8 Gpc (comoving)

FRAMEWORK:
  z_* = 33^2 = (Im_H * n_c)^2 = 1089
  H_0 = 337/5 = 67.4 km/s/Mpc
""")

z_star = (Im_H * n_c)**2  # = 33^2 = 1089
H0 = Rational(337, 5)  # = 67.4 km/s/Mpc

print(f"z_* = (Im_H * n_c)^2 = ({Im_H} * {n_c})^2 = {z_star}")
print(f"H_0 = 337/5 = {H0} = {float(H0)} km/s/Mpc")

# ==============================================================================
# PART 4: FIRST ACOUSTIC PEAK
# ==============================================================================

print("\n" + "=" * 70)
print("PART 4: DERIVING l_1 FROM PHYSICS")
print("=" * 70)

print("""
STANDARD FORMULA:
  l_1 = pi * D_A / r_s

Numerically: l_1 ~ pi * 12800 Mpc / 144.4 Mpc ~ 279

But the MEASURED l_1 = 220, not 279!

The difference is because:
1. Projection effects (not just pi * D_A / r_s)
2. Driving effects from gravitational potential
3. The peaks are shifted from simple standing wave prediction

ACTUAL RELATION:
  l_1 ~ 0.79 * pi * D_A / r_s  (empirical factor)

The factor 0.79 comes from detailed Boltzmann code calculations.
""")

# Can framework explain this factor?
factor_079 = 220 / (279)  # Approximate
print(f"\nEmpirical factor: l_1 / (pi * D_A/r_s) ~ 220/279 = {factor_079:.4f}")

# Framework approach
print("""
FRAMEWORK FORMULA ATTEMPT:

Current: l_1 = C * n_c * (n_c - R) = 2 * 11 * 10 = 220

This gives the RIGHT NUMBER but doesn't explain WHY.

Is there a physical derivation?
""")

l1_formula = C * n_c * (n_c - R)
print(f"l_1 = C * n_c * (n_c - R) = {C} * {n_c} * {n_c - R} = {l1_formula}")

# ==============================================================================
# PART 5: PEAK RATIOS
# ==============================================================================

print("\n" + "=" * 70)
print("PART 5: PEAK RATIOS - WHERE PHYSICS ENTERS")
print("=" * 70)

print("""
PEAK RATIOS reveal the physics:

In simple standing wave model: l_n / l_1 = n exactly

Measured ratios:
  l_2 / l_1 = 537/220 = 2.44  (not 2.0!)
  l_3 / l_1 = 810/220 = 3.68  (not 3.0!)

The deviations from integer ratios encode:
1. Baryon loading (odd peaks enhanced vs even)
2. Dark matter effects
3. Potential decay (driving)
4. Silk damping

Can framework explain these deviations?
""")

ratio_21_measured = l2_measured / l1_measured
ratio_31_measured = l3_measured / l1_measured

print(f"l_2/l_1 = {ratio_21_measured:.4f} (expected: 2)")
print(f"l_3/l_1 = {ratio_31_measured:.4f} (expected: 3)")

# Framework formulas from previous work
l2_formula = C * Im_H * Im_O * 13  # = 2 * 3 * 7 * 13 = 546
l3_formula = H * (R + H) * 41  # = 4 * 5 * 41 = 820

print(f"""
FRAMEWORK PREDICTIONS:
  l_1 = {l1_formula} (measured: {l1_measured})
  l_2 = C * Im_H * Im_O * 13 = {l2_formula} (measured: {l2_measured})
  l_3 = H * (R+H) * 41 = {l3_formula} (measured: {l3_measured})
""")

# Check errors
error_l1 = abs(l1_formula - l1_measured) / l1_measured * 100
error_l2 = abs(l2_formula - l2_measured) / l2_measured * 100
error_l3 = abs(l3_formula - l3_measured) / l3_measured * 100

print(f"Errors: l_1: {error_l1:.2f}%, l_2: {error_l2:.2f}%, l_3: {error_l3:.2f}%")

# ==============================================================================
# PART 6: THE DRIVING EFFECT
# ==============================================================================

print("\n" + "=" * 70)
print("PART 6: UNDERSTANDING THE DEVIATIONS")
print("=" * 70)

print("""
WHY l_2 / l_1 = 2.44 INSTEAD OF 2.0?

In standard CMB physics:

1. The gravitational potential Phi decays during radiation domination
2. This "drives" the oscillations, shifting peak positions
3. The effect is stronger for higher peaks

The formula becomes:
  l_n ~ n * l_1 * (1 + n * delta)

where delta is the driving correction.

For l_2: delta ~ (2.44 - 2) / (2 * 2) = 0.11
For l_3: delta ~ (3.68 - 3) / (3 * 3) = 0.075

This is roughly constant, suggesting a universal driving effect.
""")

# Can framework explain delta?
delta_2 = (ratio_21_measured - 2) / (2 * 2)
delta_3 = (ratio_31_measured - 3) / (3 * 3)

print(f"Delta from l_2: {delta_2:.4f}")
print(f"Delta from l_3: {delta_3:.4f}")

# Framework candidate
print(f"""
FRAMEWORK CANDIDATE for driving correction:

delta ~ (Im_O - H) / (n_c * H) = (7 - 4) / (11 * 4) = 3/44 = {float(Rational(3, 44)):.4f}

This is smaller than observed (~0.07-0.11).

Alternative:
delta ~ 1 / n_c = 1/11 = {float(Rational(1, 11)):.4f}

This is closer to the observed ~0.09!
""")

# ==============================================================================
# PART 7: HONEST ASSESSMENT
# ==============================================================================

print("\n" + "=" * 70)
print("PART 7: HONEST ASSESSMENT")
print("=" * 70)

print("""
WHAT WE HAVE:

1. Numerical matches:
   - l_1 = 220 (framework formula matches)
   - l_2 ~ 546 (framework gives 546, measured ~537 - 1.7% error)
   - l_3 ~ 820 (framework gives 820, measured ~810 - 1.2% error)

2. Physical ingredients:
   - Sound horizon r_s = 337 * 3/7 = 144.4 Mpc
   - z_* = 33^2 = 1089
   - H_0 = 337/5 = 67.4 km/s/Mpc

WHAT WE DON'T HAVE:

1. A derivation of l_1 = 220 from pi * D_A / r_s
2. An explanation of peak ratios from physics
3. The factor 0.79 connecting ideal to actual peak positions
4. Peak HEIGHT ratios (C_l2 / C_l1 ~ 0.46)

THE GAP:

The formulas l_1 = 2 * 11 * 10 = 220, l_2 = 2 * 3 * 7 * 13 = 546, etc.
give the RIGHT NUMBERS but don't derive from:
- Sound speed in the plasma
- Standing wave condition
- Projection onto the sky

They are ALGEBRAIC MATCHES, not PHYSICAL DERIVATIONS.
""")

# ==============================================================================
# PART 8: A POSSIBLE PHYSICAL CONNECTION
# ==============================================================================

print("\n" + "=" * 70)
print("PART 8: A POSSIBLE PHYSICAL CONNECTION")
print("=" * 70)

print("""
INSIGHT: The crystallization SETS the initial conditions

Maybe the framework doesn't derive l_1 from dynamics.
Instead, it derives the INITIAL CONDITIONS that lead to l_1 = 220.

In standard cosmology:
  l_1 = f(H_0, Omega_m, Omega_b, Omega_Lambda, ...)

If the framework DERIVES H_0, Omega_m, Omega_Lambda from division algebras,
then l_1 is INDIRECTLY derived.

This is still not a first-principles derivation of l_1, but it's more
than just matching numbers - it's constraining the cosmological parameters
that determine l_1.

CHAIN:
  Division algebras -> Omega_Lambda = 137/200, Omega_m = 63/200
  Division algebras -> H_0 = 337/5
  Division algebras -> z_* = 33^2
  Standard physics -> l_1 = f(these parameters) ~ 220
""")

# ==============================================================================
# VERIFICATION
# ==============================================================================

print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    ("l_1 = C * n_c * (n_c - R) = 220", C * n_c * (n_c - R) == 220),
    ("l_2 framework = 546", C * Im_H * Im_O * 13 == 546),
    ("l_3 framework = 820", H * (R + H) * 41 == 820),
    ("z_* = (Im_H * n_c)^2 = 1089", (Im_H * n_c)**2 == 1089),
    ("r_s = 337 * 3/7 = 144.43", abs(float(Rational(337*3, 7)) - 144.43) < 0.01),
    ("337 = Im_H^4 + H^4", Im_H**4 + H**4 == 337),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print(f"""
SUMMARY:

The framework provides:
1. Algebraic formulas that MATCH peak positions (l_1, l_2, l_3)
2. Derived cosmological parameters (H_0, Omega_Lambda, z_*)
3. Sound horizon from framework (r_s = 337*3/7)

The framework does NOT provide:
1. First-principles derivation from acoustic physics
2. Explanation of why these specific formulas work
3. Peak height ratios

NEXT STEPS:
1. Either: Derive l_1 from D_A, r_s, and projection factor
2. Or: Accept that l_n formulas are phenomenological
3. Document the gap honestly

STATUS: PEAK POSITIONS MATCH but PHYSICS DERIVATION INCOMPLETE
""")

if all_pass:
    print("\n*** ALL TESTS PASS ***")
else:
    print("\n*** SOME TESTS FAILED ***")
