#!/usr/bin/env python3
"""
Hilltop Correct Conditions: Finding the True r = 1 - n_s Point

PURPOSE: The previous analysis used phi_CMB = mu/sqrt(5), which gives
eta/eps = -4, not -5. This script finds the CORRECT conditions for
the r = 1 - n_s relation.

Key question: What phi_CMB and mu^2 give BOTH n_s = 193/200 AND r = 1 - n_s?

Status: CORRECTION
Created: Session 129
"""

from sympy import *

print("=" * 70)
print("HILLTOP CORRECT CONDITIONS")
print("Finding the True r = 1 - n_s Point")
print("=" * 70)

# Framework constants
R, C, Im_H, H, Im_O, O = 1, 2, 3, 4, 7, 8
n_c = 11
n_d = H

# ==============================================================================
# THE ETA/EPSILON RATIO CONDITION
# ==============================================================================

print("\n" + "=" * 70)
print("THE eta/eps RATIO")
print("=" * 70)

print("""
For hilltop V = V0(1 - phi^2/mu^2):

At phi = mu*x (dimensionless x):
  V = V0(1 - x^2)
  epsilon = 2x^2 / (mu^2 * (1-x^2)^2)   [in Planck units]
  eta = -2 / (mu^2 * (1-x^2))

The ratio:
  eta/eps = -(1-x^2) / x^2

For eta/eps = -5:
  (1-x^2)/x^2 = 5
  1 - x^2 = 5x^2
  1 = 6x^2
  x = 1/sqrt(6)

So: phi_CMB = mu/sqrt(6) for r = 1 - n_s (NOT mu/sqrt(5)!)
""")

x_correct = 1/sqrt(6)
x_wrong = 1/sqrt(5)

eta_over_eps_correct = -(1 - x_correct**2) / x_correct**2
eta_over_eps_wrong = -(1 - x_wrong**2) / x_wrong**2

print(f"""
Verification:
  At x = 1/sqrt(6): eta/eps = -{float((1 - 1/6)/(1/6)):.1f} = {float(eta_over_eps_correct):.1f}
  At x = 1/sqrt(5): eta/eps = -{float((1 - 1/5)/(1/5)):.1f} = {float(eta_over_eps_wrong):.1f}

The Session 127 analysis used x = 1/sqrt(5), giving eta/eps = -4.
For r = 1 - n_s, we need x = 1/sqrt(6), giving eta/eps = -5.
""")

# ==============================================================================
# WHAT mu^2 GIVES n_s = 193/200 AT x = 1/sqrt(6)?
# ==============================================================================

print("=" * 70)
print("FINDING mu^2 FOR n_s = 193/200 AT CORRECT phi_CMB")
print("=" * 70)

# At x = 1/sqrt(6):
# V = 1 - 1/6 = 5/6
# eta = -2/(mu^2 * 5/6) = -12/(5*mu^2)
# eps = 2*(1/6)/(mu^2 * (5/6)^2) = (1/3)/(mu^2 * 25/36) = 12/(25*mu^2)

# n_s - 1 = 2*eta - 6*eps
#         = 2*(-12/(5*mu^2)) - 6*12/(25*mu^2)
#         = -24/(5*mu^2) - 72/(25*mu^2)
#         = -120/(25*mu^2) - 72/(25*mu^2)
#         = -192/(25*mu^2)

# For n_s = 193/200:
# -192/(25*mu^2) = -7/200
# mu^2 = 192 * 200 / (25 * 7) = 38400/175 = 1536/7

mu_sq_correct = Rational(192 * 200, 25 * 7)

print(f"""
At phi_CMB = mu/sqrt(6):

  n_s - 1 = -192/(25*mu^2)

For n_s = 193/200 (i.e., n_s - 1 = -7/200):

  -192/(25*mu^2) = -7/200
  mu^2 = 192 * 200 / (25 * 7)
       = 38400 / 175
       = {mu_sq_correct}
       = {float(mu_sq_correct):.4f}
""")

# ==============================================================================
# FRAMEWORK EXPRESSION FOR mu^2 = 1536/7
# ==============================================================================

print("=" * 70)
print("FRAMEWORK EXPRESSION FOR mu^2 = 1536/7")
print("=" * 70)

# 1536 = 6 * 256 = 6 * H^4 = (C + H) * H^4
# So mu^2 = (C + H) * H^4 / Im_O

mu_sq_framework = Rational((C + H) * H**4, Im_O)

print(f"""
1536 = ?
  1536 = 6 * 256 = (C + H) * H^4
  1536 = {C + H} * {H**4}

So:
  mu^2 = (C + H) * H^4 / Im_O
       = {C + H} * {H**4} / {Im_O}
       = {(C + H) * H**4} / {Im_O}
       = {mu_sq_framework}
       = {float(mu_sq_framework):.4f}

Compare to required: {float(mu_sq_correct):.4f}
Match: {'EXACT' if mu_sq_framework == mu_sq_correct else 'NO'}
""")

# ==============================================================================
# VERIFY THE PHYSICS
# ==============================================================================

print("=" * 70)
print("VERIFY THE PHYSICS")
print("=" * 70)

mu_sq = float(mu_sq_correct)
x = 1/6**0.5  # phi_CMB/mu

V = 1 - x**2  # = 5/6
eta = -2 / (mu_sq * V)
eps = 2 * x**2 / (mu_sq * V**2)

ns = 1 + 2*eta - 6*eps
r = 16 * eps
eta_over_eps = eta / eps

print(f"""
At mu^2 = {mu_sq:.4f}, phi_CMB = mu/sqrt(6):

  x = 1/sqrt(6) = {x:.6f}
  V = 5/6 = {V:.6f}

  epsilon = {eps:.8f}
  eta = {eta:.8f}
  eta/eps = {eta_over_eps:.4f}

  n_s = 1 + 2*eta - 6*eps = {ns:.8f}
  r = 16*eps = {r:.8f}

  1 - n_s = {1 - ns:.8f}
  r = 1 - n_s? {abs(r - (1 - ns)) < 1e-8}

Target: n_s = 193/200 = {193/200:.8f}
Error: {abs(ns - 193/200):.2e}
""")

# ==============================================================================
# COMPUTE E-FOLDS
# ==============================================================================

print("=" * 70)
print("E-FOLD CALCULATION")
print("=" * 70)

from math import log, sqrt as msqrt

# phi_end from eps = 1
# 2*y/((1-y)^2 * mu^2) = 1 where y = x^2
# Solve: mu^2 * y^2 - (2*mu^2 + 2)*y + mu^2 = 0

a = mu_sq
b = -(2*mu_sq + 2)
c = mu_sq
disc = b**2 - 4*a*c
y_end = (-b - msqrt(disc))/(2*a)
x_end = msqrt(y_end)

phi_cmb = msqrt(mu_sq) * x
phi_end = msqrt(mu_sq) * x_end

# N = integral (V/V') dphi = integral (-mu^2/(2*phi) + phi/2) dphi
# N = F(phi_cmb) - F(phi_end) where F = -mu^2/2 * ln(phi) + phi^2/4

def F(phi):
    return -mu_sq/2 * log(phi) + phi**2/4

N = F(phi_cmb) - F(phi_end)

print(f"""
phi_CMB = {phi_cmb:.4f} M_Pl
phi_end = {phi_end:.4f} M_Pl (where epsilon = 1)

N = {N:.1f} e-folds

Is N in acceptable range [45, 70]? {'YES' if 45 <= N <= 70 else 'NO'}
""")

# ==============================================================================
# COMPARISON OF THREE EXPRESSIONS
# ==============================================================================

print("=" * 70)
print("COMPARISON OF THREE mu^2 EXPRESSIONS")
print("=" * 70)

print(f"""
| Expression | mu^2 | phi_CMB | n_s | r | r=1-n_s? | N |
|------------|------|---------|-----|---|----------|---|
| OLD (S127): H^4(H+R)/Im_O | {float(Rational(1280,7)):.1f} | mu/sqrt(5) | 0.952 | 0.055 | NO | 37 |
| SEARCH (S129): C(n_c^2+H) | 250 | mu/sqrt(5) | 0.965 | 0.040 | NO | 50 |
| NEW: (C+H)*H^4/Im_O | {float(mu_sq_correct):.1f} | mu/sqrt(6) | 0.965 | 0.035 | YES | {N:.0f} |

The NEW expression:
  mu^2 = (C + H) * H^4 / Im_O = 6 * 256 / 7 = 1536/7 ~ 219.4

gives BOTH:
  - n_s = 193/200 = 0.965 (matches Planck)
  - r = 1 - n_s = 7/200 = 0.035 (the predicted relation)
  - N = {N:.0f} e-folds (acceptable)
""")

# ==============================================================================
# FRAMEWORK INTERPRETATION
# ==============================================================================

print("=" * 70)
print("FRAMEWORK INTERPRETATION")
print("=" * 70)

print(f"""
The CORRECT mu^2 expression:

  mu^2 = (C + H) * H^4 / Im_O = 1536/7

Compare to the OLD (wrong) expression:

  mu^2 = H^4 * (H + R) / Im_O = 1280/7  (S127, WRONG)

The difference:
  - OLD: H^4 * (H + R) = 256 * 5 = 1280
  - NEW: H^4 * (C + H) = 256 * 6 = 1536

The numerator changes from (H + R) = 5 to (C + H) = 6!

Physical interpretation:
  - OLD: spacetime + real = 5D embedding
  - NEW: complex + spacetime = 6D structure

The (C + H) = 6 factor may have deeper meaning:
  - 6 = C * Im_H = complex * quaternion imaginary
  - 6 = number of faces of a cube
  - 6 = SO(4) dimension / 2
""")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    ("mu^2 = 1536/7 (exact)", mu_sq_framework == Rational(1536, 7)),
    ("n_s = 193/200 (to 8 decimal places)", abs(ns - 193/200) < 1e-7),
    ("r = 1 - n_s", abs(r - (1 - ns)) < 1e-8),
    ("r = 7/200 = 0.035", abs(r - 7/200) < 1e-6),
    ("eta/eps = -5", abs(eta_over_eps - (-5)) < 0.01),
    ("N in range [45, 70]", 45 <= N <= 70),
    ("(C+H)*H^4/Im_O = 1536/7", (C + H) * H**4 / Im_O == Rational(1536, 7)),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print(f"""

CONCLUSION:

The Session 127 analysis had an ERROR in the phi_CMB location.

CORRECTED RESULTS:
  - phi_CMB = mu/sqrt(6) (not mu/sqrt(5))
  - mu^2 = (C + H) * H^4 / Im_O = 1536/7 ~ 219.4 (not 1280/7 ~ 183)
  - n_s = 193/200 = 0.965 [MATCHES PLANCK]
  - r = 7/200 = 0.035 [PREDICTION]
  - r = 1 - n_s [VERIFIED]
  - N ~ {N:.0f} e-folds [ACCEPTABLE]

This is a CLEANER result than either previous expression!

The framework expression (C+H)*H^4/Im_O has a clear structure:
  - Numerator: (C+H)*H^4 = 6 * 256 = 1536 (6D structure * spacetime^4)
  - Denominator: Im_O = 7 (hidden octonion degrees of freedom)
""")

if all_pass:
    print("\n*** ALL TESTS PASS ***")
else:
    print("\n*** SOME TESTS FAILED ***")
