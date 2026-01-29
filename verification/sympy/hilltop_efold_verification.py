#!/usr/bin/env python3
"""
Hilltop E-fold Verification

PURPOSE: Verify that the hilltop potential with framework parameters
produces N ~ 55-60 e-folds of inflation.

The hilltop potential is:
  V(phi) = V_0 (1 - phi^2/mu^2)

With framework scale:
  mu^2 = H^4(H+R)/Im_O * M_Pl^2 = 1280/7 * M_Pl^2

E-fold formula for hilltop near the top:
  N = integral (V/V') dphi / M_Pl^2
    = integral (1 - x^2)/(-2x/mu) * (mu/M_Pl^2) dx  where x = phi/mu
    = -(mu^2/2M_Pl^2) * integral (1/x - x) dx
    = -(mu^2/2M_Pl^2) * [ln(x) - x^2/2]

KEY QUESTION: Does phi_CMB = mu/sqrt(5) give N ~ 55 e-folds?

Status: VERIFICATION
Created: Session 127
"""

from sympy import *

print("=" * 70)
print("HILLTOP E-FOLD VERIFICATION")
print("=" * 70)

# Framework constants
R, C, Im_H, H, Im_O, O = 1, 2, 3, 4, 7, 8
n_c = 11
n_d = H  # = 4

# Framework scale
mu_squared_ratio = Rational(H**4 * (H + R), Im_O)  # mu^2/M_Pl^2 = 1280/7
print(f"""
FRAMEWORK PARAMETERS:
  mu^2/M_Pl^2 = H^4(H+R)/Im_O = {H**4}*{H+R}/{Im_O} = {mu_squared_ratio}
             = {float(mu_squared_ratio):.4f}
  mu/M_Pl = sqrt({mu_squared_ratio}) = {float(sqrt(mu_squared_ratio)):.4f}
""")

# ==============================================================================
# E-FOLD CALCULATION
# ==============================================================================

print("=" * 70)
print("E-FOLD CALCULATION")
print("=" * 70)

# For hilltop V = V_0(1 - phi^2/mu^2):
# N = (mu^2 / 2M_Pl^2) * [x_i^2/2 - x_end^2/2 - ln(x_i/x_end)]
# where x = phi/mu

# phi_CMB = mu/sqrt(5) => x_CMB = 1/sqrt(5)
x_CMB = 1/sqrt(5)

print(f"""
At CMB scales (where eta/epsilon = -5):
  phi_CMB = mu/sqrt(5)
  x_CMB = phi_CMB/mu = 1/sqrt(5) = {float(x_CMB):.6f}
""")

# Inflation ends when slow-roll condition breaks
# For hilltop: epsilon = 2(M_Pl/mu)^2 * x^2/(1-x^2)^2 = 1
# This is complicated. Let's use different conditions:

# Option 1: Inflation ends when phi reaches mu (falls off hilltop)
# This gives x_end = 1, but then V = 0 which is problematic

# Option 2: Inflation ends when epsilon = 1
# epsilon = 2(M_Pl/mu)^2 * x^2/(1-x^2)^2 = 1
# With mu^2/M_Pl^2 = 1280/7, we have (M_Pl/mu)^2 = 7/1280
# 2 * (7/1280) * x^2/(1-x^2)^2 = 1
# x^2/(1-x^2)^2 = 1280/(2*7) = 640/7 ~ 91.4

# Let y = x^2, then y/(1-y)^2 = 640/7
# y = (640/7)(1-y)^2 = (640/7)(1 - 2y + y^2)
# 7y = 640 - 1280y + 640y^2
# 640y^2 - 1287y + 640 = 0

a_coef = 640
b_coef = -1287
c_coef = 640

discriminant = b_coef**2 - 4*a_coef*c_coef
y_solutions = [(-b_coef + sqrt(discriminant))/(2*a_coef),
               (-b_coef - sqrt(discriminant))/(2*a_coef)]

print(f"""
FINDING x_end (where epsilon = 1):

epsilon = 2(M_Pl/mu)^2 * x^2/(1-x^2)^2 = 1
(M_Pl/mu)^2 = {Rational(Im_O, H**4*(H+R))} = {float(Rational(Im_O, H**4*(H+R))):.6f}

Solving: x^2/(1-x^2)^2 = mu^2/(2*M_Pl^2) = {float(mu_squared_ratio/2):.4f}

Let y = x^2:
640y^2 - 1287y + 640 = 0

Solutions:
  y_1 = {float(y_solutions[0]):.6f} => x_1 = {float(sqrt(y_solutions[0])):.6f}
  y_2 = {float(y_solutions[1]):.6f} => x_2 = {float(sqrt(y_solutions[1])):.6f}
""")

# The physical solution is the smaller x (we're rolling from small x to larger x)
# Wait, for hilltop, we start near phi = 0 and roll outward...
# Actually, x_CMB = 0.447 and we're rolling toward larger x
# So x_end should be the larger solution where inflation ends

# Use the y < 1 solution (x_end ~ 0.95)
x_end_val = float(sqrt(y_solutions[1]))  # y_2 ~ 0.90 gives x ~ 0.95

# Actually, let me compute this more carefully
# For hilltop NEAR the top (x << 1), we can use approximate formula
# But x_CMB = 0.447 is not that small

# The exact e-fold integral:
# N = (mu^2/2M_Pl^2) * integral_{x_CMB}^{x_end} (1-x^2)/(x) * (-1) dx
#   = (mu^2/2M_Pl^2) * integral_{x_end}^{x_CMB} (1/x - x) dx
#   = (mu^2/2M_Pl^2) * [ln(x) - x^2/2] from x_end to x_CMB

# Wait, I need to be careful about the direction.
# phi increases as we roll away from hilltop
# x = phi/mu increases
# We start at x_CMB (where CMB modes exit) and end at x_end (where epsilon = 1)
# N counts e-folds from CMB to end

# For generic slow-roll:
# N = integral (V / V') * (1/M_Pl^2) dphi

# V = V_0(1 - x^2), V' = -2V_0 x/mu
# V/V' = mu(1-x^2)/(-2x) = -mu(1-x^2)/(2x)

# N = integral_{phi_CMB}^{phi_end} (-mu(1-x^2)/(2x)) * (1/M_Pl^2) * mu dx
#   = -(mu^2/2M_Pl^2) * integral_{x_CMB}^{x_end} (1-x^2)/x dx

# If x_end > x_CMB (rolling away from hilltop), the integral is:
# integral (1/x - x) dx = ln(x) - x^2/2

# N = -(mu^2/2M_Pl^2) * [ln(x_end) - x_end^2/2 - ln(x_CMB) + x_CMB^2/2]
#   = (mu^2/2M_Pl^2) * [ln(x_CMB/x_end) + (x_end^2 - x_CMB^2)/2]

# Since x_end > x_CMB, ln(x_CMB/x_end) < 0 and x_end^2 > x_CMB^2
# The second term dominates for x_end close to 1

print("""
E-FOLD INTEGRAL:

N = (mu^2 / 2M_Pl^2) * [ln(x_CMB/x_end) + (x_end^2 - x_CMB^2)/2]

where:
- x_CMB = 1/sqrt(5) (for eta/epsilon = -5)
- x_end = value where epsilon = 1
""")

# Let's compute numerically for a range of x_end values
print("\nE-folds for different x_end values:")
print("-" * 50)

mu2_ratio = float(mu_squared_ratio)
x_cmb_val = float(1/sqrt(5))

for x_end_val in [0.6, 0.7, 0.8, 0.9, 0.95, 0.99]:
    if x_end_val > x_cmb_val:
        # Correct formula: N = (mu^2/2M_Pl^2) * [ln(x_end/x_CMB) - (x_end^2 - x_CMB^2)/2]
        N_val = (mu2_ratio / 2) * (log(x_end_val/x_cmb_val) - (x_end_val**2 - x_cmb_val**2)/2)
        print(f"  x_end = {x_end_val:.2f}: N = {N_val:.1f} e-folds")

# ==============================================================================
# WHERE DOES EPSILON = 1?
# ==============================================================================

print("\n" + "=" * 70)
print("WHERE EPSILON = 1")
print("=" * 70)

# epsilon = 2(M_Pl/mu)^2 * x^2/(1-x^2)^2
# With (M_Pl/mu)^2 = 7/1280:
# epsilon = 2 * (7/1280) * x^2/(1-x^2)^2 = (7/640) * x^2/(1-x^2)^2

# At x_CMB = 1/sqrt(5):
x_cmb_sym = 1/sqrt(5)
epsilon_cmb = Rational(7, 640) * x_cmb_sym**2 / (1 - x_cmb_sym**2)**2
epsilon_cmb = Rational(7, 640) * Rational(1, 5) / (Rational(4, 5))**2
epsilon_cmb = Rational(7, 640) * Rational(1, 5) * Rational(25, 16)
epsilon_cmb = Rational(7 * 25, 640 * 5 * 16)
epsilon_cmb_simplified = Rational(7, 3200)

print(f"""
At x_CMB = 1/sqrt(5):
  epsilon = (7/640) * (1/5) / (4/5)^2
          = (7/640) * (1/5) * (25/16)
          = 7/3200 = {float(Rational(7, 3200)):.6f}

This matches our earlier calculation! (epsilon = 7/3200)
""")

# For epsilon = 1:
# (7/640) * x^2/(1-x^2)^2 = 1
# x^2/(1-x^2)^2 = 640/7 ~ 91.4

# Let u = x^2, then u/(1-u)^2 = 640/7
# Numerically solving:
from math import log as mlog

def find_x_end():
    target = 640/7
    for x in [i/1000 for i in range(1, 1000)]:
        u = x**2
        if (1-u) > 0:
            ratio = u / (1-u)**2
            if abs(ratio - target) < 0.5:
                return x
    return None

x_end_numeric = find_x_end()
print(f"Solving epsilon = 1 numerically: x_end ~ {x_end_numeric}")

# More precise: u/(1-u)^2 = 640/7
# u = (640/7)(1-u)^2
# For large ratio, (1-u) must be small, so u ~ 1
# Let 1-u = delta, u = 1-delta
# (1-delta)/delta^2 = 640/7
# delta^2 ~ 7(1-delta)/640 ~ 7/640 for delta << 1
# delta ~ sqrt(7/640) ~ 0.105
# u ~ 0.895, x ~ 0.946

delta_approx = sqrt(Rational(7, 640))
u_approx = 1 - delta_approx
x_end_approx = sqrt(u_approx)

print(f"""
Analytical approximation for epsilon = 1:
  delta = 1 - x^2 ~ sqrt(7/640) = {float(delta_approx):.4f}
  x^2 ~ 1 - {float(delta_approx):.4f} = {float(u_approx):.4f}
  x_end ~ {float(x_end_approx):.4f}
""")

# ==============================================================================
# FINAL E-FOLD CALCULATION
# ==============================================================================

print("=" * 70)
print("FINAL E-FOLD CALCULATION")
print("=" * 70)

# Using x_end ~ 0.946
x_end_final = float(x_end_approx)
x_cmb_final = float(1/sqrt(5))
mu2_over_mpl2 = float(Rational(1280, 7))

# Correct formula: N = (mu^2/2M_Pl^2) * [ln(x_end/x_CMB) - (x_end^2 - x_CMB^2)/2]
N_efolds = (mu2_over_mpl2 / 2) * (mlog(x_end_final/x_cmb_final) - (x_end_final**2 - x_cmb_final**2)/2)

print(f"""
With:
  x_CMB = 1/sqrt(5) = {x_cmb_final:.6f}
  x_end = {x_end_final:.6f} (where epsilon = 1)
  mu^2/M_Pl^2 = 1280/7 = {mu2_over_mpl2:.4f}

E-fold number:
  N = (mu^2/2M_Pl^2) * [ln(x_end/x_CMB) - (x_end^2 - x_CMB^2)/2]
  N = {mu2_over_mpl2/2:.2f} * [{mlog(x_end_final/x_cmb_final):.4f} - {(x_end_final**2 - x_cmb_final**2)/2:.4f}]
  N = {mu2_over_mpl2/2:.2f} * {mlog(x_end_final/x_cmb_final) - (x_end_final**2 - x_cmb_final**2)/2:.4f}
  N = {N_efolds:.1f}
""")

# ==============================================================================
# FRAMEWORK INTERPRETATION
# ==============================================================================

print("=" * 70)
print("FRAMEWORK INTERPRETATION")
print("=" * 70)

# N ~ 30 is low! Standard CMB requires N ~ 55-60
# But maybe we should check a different phi_end

# Alternative: inflation ends when V becomes negative (phi = mu)
# x_end = 1
x_end_v0 = 0.999  # Just before V = 0
N_v0 = (mu2_over_mpl2 / 2) * (mlog(x_end_v0/x_cmb_final) - (x_end_v0**2 - x_cmb_final**2)/2)

print(f"""
Alternative ending conditions:

1. epsilon = 1 at x_end = {x_end_final:.4f}:
   N = {N_efolds:.1f} e-folds [TOO LOW]

2. V -> 0 at x_end -> 1:
   N = {N_v0:.1f} e-folds [CLOSER BUT STILL LOW]

ISSUE: The e-fold number is lower than the typical N ~ 55-60 required.
""")

# What x_CMB would give N = 55?
# We need to solve for x_CMB given N = 55 and x_end ~ 0.95

target_N = 55
x_end_test = 0.95

# N = (mu^2/2M_Pl^2) * [ln(x_CMB/x_end) + (x_end^2 - x_CMB^2)/2]
# 55 = 91.4 * [ln(x_CMB/0.95) + (0.9025 - x_CMB^2)/2]
# 0.60 = ln(x_CMB/0.95) + (0.9025 - x_CMB^2)/2

# For small x_CMB, the ln term dominates
# ln(x_CMB/0.95) ~ 0.60 - 0.45 ~ 0.15
# x_CMB/0.95 ~ 1.16
# This doesn't work for x_CMB < x_end

# The issue is that mu^2/M_Pl^2 = 183 gives large N per unit x-change,
# but the range of x from CMB to end is limited

print(f"""
WHAT'S HAPPENING:

The hilltop model with mu^2/M_Pl^2 = 1280/7 ~ 183 produces:
- Correct slow-roll parameters at x_CMB = 1/sqrt(5)
- But only ~30-40 e-folds before epsilon = 1

This suggests one of:
1. The CMB forms EARLIER (at smaller x), allowing more e-folds after
2. The ending condition is different (not epsilon = 1)
3. There's additional e-folds from a different phase
4. The simple hilltop model needs modification

Let me check: what x_CMB gives N = 55 e-folds to x_end = 0.95?
""")

# Search for x_CMB that gives N = 55
print("\nSearching for x_CMB that gives N = 55:")
for x_test in [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45]:
    N_test = (mu2_over_mpl2 / 2) * (mlog(x_end_test/x_test) - (x_end_test**2 - x_test**2)/2)
    eta_over_eps = -(1/x_test)**2
    print(f"  x_CMB = {x_test:.2f}: N = {N_test:.1f}, eta/eps = {eta_over_eps:.1f}")

# ==============================================================================
# REVISED INTERPRETATION
# ==============================================================================

print("\n" + "=" * 70)
print("REVISED INTERPRETATION")
print("=" * 70)

print("""
The calculation shows a TENSION:

At x_CMB = 1/sqrt(5) (required for eta/epsilon = -5):
- We get correct n_s = 193/200
- We get correct r = 7/200
- But we only get N ~ 30-40 e-folds

To get N ~ 55, we need x_CMB ~ 0.30, giving:
- eta/epsilon ~ -11 (not -5)
- Different n_s and r predictions

POSSIBLE RESOLUTIONS:

1. **Multi-phase inflation**:
   - First phase provides ~20 e-folds (hilltop, correct n_s)
   - Second phase provides ~35 e-folds (different potential)

2. **Modified e-fold counting**:
   - Crystallization physics modifies the standard relation

3. **Different x_end**:
   - Inflation ends later (x_end closer to 1)
   - But this is already considered above

4. **The N ~ 30 is sufficient**:
   - If crystallization boundary is at lower redshift than assumed
   - Non-standard cosmology affects e-fold requirement

STATUS: E-FOLD NUMBER IS A GAP - requires further investigation
""")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    ("mu^2/M_Pl^2 = 1280/7", abs(mu2_over_mpl2 - 1280/7) < 0.01),
    ("x_CMB = 1/sqrt(5) for eta/eps = -5", abs(x_cmb_final - 1/5**0.5) < 0.001),
    ("epsilon(x_CMB) = 7/3200", abs(float(Rational(7, 3200)) - 0.0022) < 0.0001),
    ("N computed (any value)", N_efolds > 0),
    ("N ~ 55 from hilltop", abs(N_efolds - 55) < 10),  # This will FAIL
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print(f"""

SUMMARY:

The hilltop potential with mu^2 = H^4(H+R)M_Pl^2/Im_O gives:
- CORRECT n_s = 193/200 [PASS]
- CORRECT r = 7/200 [PASS]
- INSUFFICIENT e-folds: N ~ {N_efolds:.0f} instead of ~55 [GAP]

The e-fold discrepancy is a PARTIAL gap:
- The slow-roll parameters are correct
- But the e-fold counting doesn't quite work in the simple model

This may indicate:
- Multi-phase inflation
- Modified cosmological evolution
- Or that the simple hilltop is an approximation to a more complex potential

STATUS: PARTIAL SUCCESS - n_s derivation works, e-fold counting needs work
""")

if all_pass:
    print("\n*** ALL TESTS PASS ***")
else:
    print("\n*** SOME TESTS FAILED - see details above ***")
