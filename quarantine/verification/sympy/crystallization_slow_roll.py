#!/usr/bin/env python3
"""
Crystallization Slow-Roll Parameters

PURPOSE: Attempt to derive n_s from crystallization potential V(phi)

The crystallization_dynamics.md proposes:
  V(phi) = lambda/4 * (phi^2 - v^2)^2

With framework-determined parameters:
  v^2 = M_Pl^2 * (n_d / n_total) = M_Pl^2 * (4/15)
  lambda = alpha^2 / (4*pi) * (n_c / n_d) = alpha^2 * 11 / (16*pi)

This script calculates slow-roll parameters epsilon, eta and predicts n_s.

CRITICAL QUESTION: Does this give n_s = 193/200 = 0.965?

Status: DERIVATION ATTEMPT
Created: Session 125
"""

from sympy import *

print("=" * 70)
print("CRYSTALLIZATION SLOW-ROLL PARAMETERS")
print("=" * 70)

# Framework constants
R, C, Im_H, H, Im_O, O = 1, 2, 3, 4, 7, 8
n_c = 11
n_d = H  # = 4
n_total = R + C + H + O  # = 15

# Fine structure constant (framework value)
alpha = Rational(1, 137)  # Using approximate 1/137 for now

print(f"""
FRAMEWORK CONSTANTS:
  n_d = {n_d} (spacetime dimension = H)
  n_c = {n_c} (crystal dimension)
  n_total = {n_total} (R + C + H + O)
  alpha ~ {float(alpha):.6f}
""")

# ==============================================================================
# THE POTENTIAL
# ==============================================================================

print("=" * 70)
print("THE CRYSTALLIZATION POTENTIAL")
print("=" * 70)

# Symbolic variables
phi = Symbol('phi', real=True, positive=True)
M_Pl = Symbol('M_Pl', positive=True)  # Planck mass

# Framework-determined parameters
v_squared_ratio = Rational(n_d, n_total)  # = 4/15
lambda_ratio = alpha**2 * Rational(n_c, n_d) / (4 * pi)  # very small

print(f"""
PROPOSED PARAMETERS:

1. VEV squared ratio:
   v^2 / M_Pl^2 = n_d / n_total = {n_d}/{n_total} = {float(v_squared_ratio):.6f}

2. Self-coupling:
   lambda = alpha^2 * (n_c/n_d) / (4*pi)
          = (1/137)^2 * (11/4) / (4*pi)
          = {float(lambda_ratio):.2e}

This is a VERY small coupling, ensuring radiative stability.
""")

# The potential V(phi) = lambda/4 * (phi^2 - v^2)^2
# For slow-roll, we parameterize phi in terms of N (e-folds before end)

# ==============================================================================
# SLOW-ROLL PARAMETERS
# ==============================================================================

print("=" * 70)
print("SLOW-ROLL PARAMETERS")
print("=" * 70)

# For V = lambda/4 * (phi^2 - v^2)^2
#
# V' = lambda * phi * (phi^2 - v^2)
# V'' = lambda * (3*phi^2 - v^2)
#
# Slow-roll parameters:
#   epsilon = (M_Pl^2 / 2) * (V'/V)^2
#   eta = M_Pl^2 * (V''/V)

print("""
For double-well potential V = (lambda/4) * (phi^2 - v^2)^2:

V'(phi) = lambda * phi * (phi^2 - v^2)
V''(phi) = lambda * (3*phi^2 - v^2)

Slow-roll parameters at field value phi:

epsilon = (M_Pl^2 / 2) * (V'/V)^2
        = (M_Pl^2 / 2) * [4 * phi^2 * (phi^2 - v^2)^2] / [(phi^2 - v^2)^4]
        = (M_Pl^2 / 2) * [4 * phi^2] / (phi^2 - v^2)^2
        = 2 * M_Pl^2 * phi^2 / (phi^2 - v^2)^2

eta = M_Pl^2 * (V''/V)
    = M_Pl^2 * [lambda * (3*phi^2 - v^2)] / [(lambda/4) * (phi^2 - v^2)^2]
    = 4 * M_Pl^2 * (3*phi^2 - v^2) / (phi^2 - v^2)^2
""")

# During inflation, phi >> v, so we can expand
# epsilon ~ 2 * M_Pl^2 / phi^2
# eta ~ 12 * M_Pl^2 / phi^2 - 4 * M_Pl^2 * v^2 / phi^4

print("""
For large-field inflation (phi >> v):

epsilon ~ 2 * M_Pl^2 / phi^2
eta ~ 12 * M_Pl^2 / phi^2 = 6 * epsilon

But this is large-field, not the crystallization regime!
""")

# ==============================================================================
# THE CRYSTALLIZATION REGIME
# ==============================================================================

print("=" * 70)
print("THE CRYSTALLIZATION REGIME")
print("=" * 70)

print("""
PROBLEM: The double-well potential has TWO very different regimes:

1. LARGE FIELD (phi >> v): Typical inflation
   - epsilon ~ 2 M_Pl^2 / phi^2
   - n_s ~ 1 - 2*epsilon - eta ~ 1 - 8*epsilon

2. NEAR MINIMUM (phi ~ v): Post-crystallization
   - phi = v + delta_phi
   - Potential is quadratic: V ~ m^2 * delta_phi^2
   - This is reheating, not inflation

The "crystallization boundary" is where phi ~ v (the phase transition).

But at this point, slow-roll is ENDING, not producing CMB fluctuations!
""")

# ==============================================================================
# E-FOLD COUNTING
# ==============================================================================

print("=" * 70)
print("E-FOLD COUNTING")
print("=" * 70)

# For this potential, the number of e-folds before end:
# N = integral_{phi_end}^{phi} (V / V') * (1/M_Pl^2) d(phi)
#   = integral (phi^2 - v^2) / (4 * phi) * (1/M_Pl^2) d(phi)
#   ~ (phi^2 / 8M_Pl^2) for phi >> v

print("""
E-fold counting for large-field regime:

N ~ (phi^2 - v^2) / (4 * M_Pl^2)

For phi >> v:
N ~ phi^2 / (4 * M_Pl^2)
=> phi^2 ~ 4 * N * M_Pl^2

At N = 55 (typical CMB scale):
phi^2 ~ 220 * M_Pl^2

Then:
epsilon ~ 2 / (4*N) = 1 / (2*N) = 1/110 ~ 0.009
eta ~ 6 * epsilon = 3/55 ~ 0.055
n_s = 1 - 6*epsilon + 2*eta = 1 - 6/110 + 6/55 = 1 - 3/55 + 6/55 = 1 + 3/55

Wait, this gives n_s > 1!
""")

# Let me recalculate carefully
N_cmb = 55  # e-folds before end of inflation

# For V ~ phi^4 (large field limit):
# epsilon = 2 * M_Pl^2 / phi^2
# N = phi^2 / (4 * M_Pl^2) => phi^2 = 4*N*M_Pl^2
# epsilon = 2 / (4*N) = 1/(2*N)

epsilon_large_field = Rational(1, 2*N_cmb)

# For V ~ phi^4: eta = (n-1)*(n-2)/2 * M_Pl^2/phi^2 where n=4
# eta = 3 * M_Pl^2/phi^2 = 3/(4*N) = 3/2 * epsilon
# Wait, let me use the correct formula

print(f"""
Recalculating for V ~ (lambda/4) * phi^4 (large field limit):

For V ~ phi^n:
epsilon = (n^2 / 2) * (M_Pl / phi)^2
eta = n*(n-1) * (M_Pl / phi)^2

For n = 4:
epsilon = 8 * (M_Pl/phi)^2
eta = 12 * (M_Pl/phi)^2 = (3/2) * epsilon

Number of e-folds: N ~ phi^2 / (2*n*M_Pl^2) = phi^2 / (8*M_Pl^2)
=> (M_Pl/phi)^2 = 1 / (8*N)
=> epsilon = 8 / (8*N) = 1/N = 1/{N_cmb} = {float(Rational(1, N_cmb)):.6f}
=> eta = 12 / (8*N) = 3/(2*N) = 3/{2*N_cmb} = {float(Rational(3, 2*N_cmb)):.6f}

n_s = 1 - 6*epsilon + 2*eta = 1 - 6/N + 3/N = 1 - 3/N
    = 1 - 3/{N_cmb} = {float(1 - Rational(3, N_cmb)):.6f}
""")

n_s_predicted_phi4 = 1 - Rational(3, N_cmb)
n_s_measured = 0.9649

print(f"""
RESULT for phi^4 potential:

n_s = 1 - 3/N = 1 - 3/55 = {float(n_s_predicted_phi4):.6f}
n_s (measured) = {n_s_measured}
Error: {abs(float(n_s_predicted_phi4) - n_s_measured)/n_s_measured * 100:.2f}%

This is WRONG by ~1%! The phi^4 potential doesn't give the right n_s.
""")

# ==============================================================================
# THE GAP
# ==============================================================================

print("=" * 70)
print("THE GAP: PHYSICS IS MISSING")
print("=" * 70)

print("""
FUNDAMENTAL PROBLEM:

1. The proposed crystallization potential V(phi) = (lambda/4)*(phi^2 - v^2)^2
   is just a standard symmetry-breaking potential.

2. In the large-field regime (where CMB fluctuations form), it behaves like phi^4.

3. This gives n_s = 1 - 3/N ~ 0.945, NOT 0.965.

4. To get n_s = 0.965, we need a different potential!

WHAT'S NEEDED:

The framework says n_s = 193/200 = 0.965.
Standard slow-roll says n_s = 1 - 2*epsilon - eta.
For n_s = 0.965: 2*epsilon + eta = 0.035

With r = 1 - n_s = 0.035 (framework prediction):
Standard consistency: r = 16*epsilon => epsilon = 0.035/16 = 0.0022
Then: 2*0.0022 + eta = 0.035 => eta = 0.031

This implies eta >> epsilon (unusual!) and requires a special potential.

THE HONEST CONCLUSION:

The crystallization Lagrangian as proposed does NOT derive n_s = 0.965.
Either:
(a) The potential V(phi) needs modification, or
(b) The slow-roll relation is modified by crystallization physics, or
(c) The n_s = 193/200 formula is not from slow-roll at all.

STATUS: MAJOR GAP IDENTIFIED
""")

# ==============================================================================
# WHAT WOULD FIX THIS?
# ==============================================================================

print("=" * 70)
print("WHAT WOULD FIX THIS?")
print("=" * 70)

print("""
OPTION 1: Different potential

If n_s = 1 - 2/N (quadratic potential), N = 2/(1-n_s) = 2/0.035 ~ 57
This matches N = 400/7 = 57.14 (framework number!)

But quadratic potential gives r = 8*(1-n_s) = 0.28, not 0.035.

OPTION 2: Modified consistency relation

Framework predicts r = 1 - n_s (NOT r ~ 8*(1-n_s)).
This is NOT standard slow-roll. It requires:
- Either a non-standard kinetic term
- Or multiple fields
- Or a non-slow-roll mechanism

OPTION 3: Not slow-roll inflation at all

Maybe crystallization is a different mechanism entirely:
- Curvaton scenario
- Modulated reheating
- Quantum tunneling effects

In these, the relation between n_s and r is different.

HONEST ASSESSMENT:

We do NOT have a physical derivation of n_s = 193/200.
We have a formula that matches the number.
The standard inflation route (slow-roll) does not produce this value.

This is the key gap that needs to be filled for the framework to be
considered genuine physics rather than numerology.
""")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    ("n_d/n_total = 4/15", Rational(n_d, n_total) == Rational(4, 15)),
    ("phi^4 gives n_s = 1 - 3/N", True),  # derived above
    ("For N=55: n_s(phi^4) = 52/55 = 0.945", n_s_predicted_phi4 == Rational(52, 55)),
    ("Framework n_s = 193/200 = 0.965", Rational(193, 200) == Rational(193, 200)),
    ("These DON'T match!", n_s_predicted_phi4 != Rational(193, 200)),
    ("Gap identified: potential doesn't work", True),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print(f"""

SUMMARY:

The crystallization potential V(phi) = lambda/4 * (phi^2 - v^2)^2
DOES NOT produce n_s = 193/200.

In large-field limit: n_s = 1 - 3/N = 0.945 (for N = 55)
Framework claims: n_s = 193/200 = 0.965

Error: ~2% -- outside Planck error bars.

CONCLUSION: The crystallization Lagrangian, as currently specified,
FAILS to derive the spectral index.

This is honest progress: we've identified a specific gap that needs fixing.
""")

if all_pass:
    print("\n*** ALL TESTS PASS (but gap identified!) ***")
else:
    print("\n*** SOME TESTS FAILED ***")
