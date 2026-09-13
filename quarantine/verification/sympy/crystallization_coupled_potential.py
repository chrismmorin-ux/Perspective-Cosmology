#!/usr/bin/env python3
"""
Crystallization Coupled Potential: Analysis of W(eps, phi)

KEY FINDING: The tilt potential transitions from Mexican hat (eps* != 0)
to parabolic (eps = 0 stable) as crystallization proceeds.

This script analyzes:
1. The coupled potential W(eps, phi) = -a(phi)|eps|^2 + b|eps|^4
2. How the equilibrium |eps|* depends on phi
3. The crystallization pressure Pi_cryst = -dW/d|eps|
4. The stability of attractors

Created: Session 128
Status: EXPLORATION
"""

from sympy import *

# ==============================================================================
# SYMBOLS
# ==============================================================================

# Fields
eps = Symbol('epsilon', positive=True, real=True)  # |eps| = tilt magnitude
phi = Symbol('phi', positive=True, real=True)       # crystallization field
mu = Symbol('mu', positive=True, real=True)         # hilltop scale

# Potential parameters
a0 = Symbol('a_0', positive=True, real=True)  # base coefficient
b = Symbol('b', positive=True, real=True)      # quartic coefficient
c = Symbol('c', positive=True, real=True)      # coupling strength

# ==============================================================================
# COUPLED POTENTIAL
# ==============================================================================

print("="*70)
print("CRYSTALLIZATION COUPLED POTENTIAL ANALYSIS")
print("="*70)

# The key insight: a(phi) changes sign during crystallization
# a(phi) = a0 * (1 - phi^2/mu^2) = a0 * (mu^2 - phi^2)/mu^2

# This makes:
# - a(0) = a0 > 0 (Mexican hat regime)
# - a(mu) = 0 (critical point)
# - a(phi > mu) < 0 (parabolic regime)

a_phi = a0 * (1 - phi**2 / mu**2)

print("\n1. THE EFFECTIVE COEFFICIENT a(phi)")
print("-" * 40)
print(f"a(phi) = a_0 * (1 - phi^2/mu^2) = {a_phi}")
print(f"a(0) = a_0 > 0  ->  Mexican hat")
print(f"a(mu) = 0       ->  Critical point")
print(f"a(phi>mu) < 0   ->  Parabolic")

# The full tilt potential
W = -a_phi * eps**2 + b * eps**4

print("\n2. THE TILT POTENTIAL W(eps, phi)")
print("-" * 40)
print(f"W(eps, phi) = -a(phi)|eps|^2 + b|eps|^4")
print(f"            = {W}")

# ==============================================================================
# EQUILIBRIUM ANALYSIS
# ==============================================================================

print("\n3. EQUILIBRIUM |eps|* AS FUNCTION OF phi")
print("-" * 40)

# Find equilibrium: dW/deps = 0
dW_deps = diff(W, eps)
print(f"dW/deps = {dW_deps}")

# Solve for equilibrium
eq_solutions = solve(dW_deps, eps)
print(f"\nEquilibrium solutions: {eq_solutions}")

# The non-zero equilibrium (Mexican hat minimum)
eps_star_general = sqrt(a_phi / (2*b))
eps_star_simplified = simplify(eps_star_general)
print(f"\n|eps|* = sqrt(a(phi)/(2b)) = {eps_star_simplified}")

# At phi = 0 (initial state)
eps_star_0 = eps_star_simplified.subs(phi, 0)
print(f"|eps|*(phi=0) = sqrt(a_0/(2b)) = {eps_star_0}")

# At phi = mu/2 (half crystallized)
eps_star_half = simplify(eps_star_simplified.subs(phi, mu/2))
print(f"|eps|*(phi=mu/2) = {eps_star_half}")

# At phi = mu (fully crystallized)
eps_star_mu = eps_star_simplified.subs(phi, mu)
print(f"|eps|*(phi=mu) = {eps_star_mu} = 0 (only eps=0 is stable)")

# ==============================================================================
# CRYSTALLIZATION PRESSURE
# ==============================================================================

print("\n4. CRYSTALLIZATION PRESSURE Pi_cryst")
print("-" * 40)

# Crystallization pressure = -dW/d|eps|
Pi_cryst = -dW_deps
print(f"Pi_cryst = -dW/deps = {Pi_cryst}")

# Factor it
Pi_cryst_factored = factor(Pi_cryst)
print(f"         = {Pi_cryst_factored}")

# At equilibrium, Pi_cryst = 0
print(f"\nAt equilibrium |eps| = |eps|*: Pi_cryst = 0 (by definition)")

# Away from equilibrium:
print("\nBehavior:")
print("  |eps| > |eps|*: Pi_cryst < 0 -> pressure to decrease |eps|")
print("  |eps| < |eps|*: Pi_cryst > 0 -> pressure to increase |eps|")
print("  As phi -> mu: |eps|* -> 0, so Pi_cryst < 0 for any |eps| > 0")

# ==============================================================================
# STABILITY ANALYSIS
# ==============================================================================

print("\n5. STABILITY (SECOND DERIVATIVE)")
print("-" * 40)

d2W_deps2 = diff(W, eps, 2)
print(f"d^2W/deps^2 = {d2W_deps2}")

# At eps = 0
stability_at_0 = d2W_deps2.subs(eps, 0)
print(f"\nAt eps = 0: d^2W/deps^2 = {simplify(stability_at_0)}")
print(f"  Stable if a(phi) < 0, i.e., phi > mu")

# At eps = eps*
stability_at_star = simplify(d2W_deps2.subs(eps, sqrt(a_phi/(2*b))))
print(f"\nAt eps = eps*: d^2W/deps^2 = {stability_at_star}")

# ==============================================================================
# FRAMEWORK CONNECTION
# ==============================================================================

print("\n6. FRAMEWORK VALUES")
print("-" * 40)

# From crystallization_dynamics.md: mu^2 = (C+H)*H^4/Im_O = 1536/7
C, H, Im_O = 2, 4, 7
mu2_framework = Rational((C+H) * H**4, Im_O)
print(f"mu^2 = (C+H)*H^4/Im_O = {(C+H)}*{H**4}/{Im_O} = {mu2_framework}")
print(f"mu = sqrt({mu2_framework}) = {float(sqrt(mu2_framework)):.4f} M_Pl")

# The tilt equilibrium at CMB scales
# phi_CMB = mu/sqrt(6)
phi_CMB_ratio = Rational(1, 6)  # (phi_CMB/mu)^2
a_at_CMB = 1 - phi_CMB_ratio
print(f"\nAt CMB formation (phi = mu/sqrt(6)):")
print(f"  (phi/mu)^2 = 1/6")
print(f"  a(phi_CMB)/a_0 = 1 - 1/6 = {a_at_CMB}")
print(f"  |eps|*/|eps|*_0 = sqrt(5/6) = {float(sqrt(a_at_CMB)):.4f}")

# ==============================================================================
# THE TRANSITION FROM MEXICAN HAT TO PARABOLIC
# ==============================================================================

print("\n7. REGIME TRANSITION")
print("-" * 40)

print("""
The potential W(eps, phi) transitions through three regimes:

  phi << mu:  W ~ -a_0|eps|^2 + b|eps|^4
              Mexican hat with minimum at |eps|* = sqrt(a_0/2b)
              MATTER EXISTS (particles are topological defects)

  phi = mu:   W = b|eps|^4
              Quartic only, minimum at eps = 0
              CRITICAL POINT (crystallization complete)

  phi > mu:   W = |a(phi)||eps|^2 + b|eps|^4
              Parabolic, minimum at eps = 0 (strongly)
              CRYSTAL GROUND STATE (all structure gone)

The universe is currently at phi ~ mu/sqrt(6), deep in the Mexican hat regime.
""")

# ==============================================================================
# NUMERICAL EXPLORATION
# ==============================================================================

print("\n8. NUMERICAL PROFILES")
print("-" * 40)

import numpy as np

# Use dimensionless units: a_0 = b = 1
def W_numerical(eps_val, phi_val, mu_val=1.0, a0_val=1.0, b_val=1.0):
    a = a0_val * (1 - phi_val**2 / mu_val**2)
    return -a * eps_val**2 + b_val * eps_val**4

# Sample at different phi values
phi_values = [0, 0.3, 0.5, 0.7, 0.9, 1.0]
eps_range = np.linspace(0, 1.5, 100)

print("Potential W(eps, phi) at different crystallization stages:")
print(f"{'phi/mu':<10} {'|eps|* (min)':<15} {'W(eps*)':<15} {'Regime'}")
print("-" * 55)

for phi_val in phi_values:
    a = 1.0 * (1 - phi_val**2)
    if a > 0:
        eps_min = np.sqrt(a / 2.0)
        W_min = -a * eps_min**2 + eps_min**4
        regime = "Mexican hat"
    else:
        eps_min = 0.0
        W_min = 0.0
        regime = "Parabolic"
    print(f"{phi_val:<10.2f} {eps_min:<15.4f} {W_min:<15.4f} {regime}")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("\n" + "="*70)
print("VERIFICATION TESTS")
print("="*70)

tests = []

# Test 1: Equilibrium at phi=0 is eps* = sqrt(a_0/2b)
eps_star_check = sqrt(a0/(2*b))
dW_at_star = dW_deps.subs(eps, eps_star_check).subs(phi, 0)
test1 = simplify(dW_at_star) == 0
tests.append(("Equilibrium at phi=0 is eps*=sqrt(a_0/2b)", test1))

# Test 2: At phi=mu, only eps=0 is equilibrium
a_at_mu = a_phi.subs(phi, mu)
test2 = simplify(a_at_mu) == 0
tests.append(("At phi=mu, a(phi)=0 (transition point)", test2))

# Test 3: eps=0 stable when a(phi) < 0
# At phi = 2*mu, a(phi) = a0*(1-4) = -3a0 < 0
a_at_2mu = a_phi.subs(phi, 2*mu)
test3 = simplify(a_at_2mu) == -3*a0
tests.append(("At phi=2mu, a(phi)=-3a_0<0 (parabolic regime)", test3))

# Test 4: Stability at eps=0 given by sign of a(phi)
# d^2W/deps^2 at eps=0 = -2a(phi)
# Stable if d^2W/deps^2 > 0, i.e., a(phi) < 0
d2W_at_0 = d2W_deps2.subs(eps, 0)
test4 = simplify(d2W_at_0) == -2*a_phi
tests.append(("Stability at eps=0 given by -2a(phi)", test4))

# Test 5: Mexican hat depth at phi=0
# W(eps*) = -a_0*eps*^2 + b*eps*^4 = -a_0*(a_0/2b) + b*(a_0/2b)^2 = -a_0^2/2b + a_0^2/4b = -a_0^2/4b
W_at_star = W.subs(eps, sqrt(a0/(2*b))).subs(phi, 0)
W_at_star_simplified = simplify(W_at_star)
test5 = simplify(W_at_star_simplified + a0**2/(4*b)) == 0
tests.append(("Mexican hat depth W(eps*)=-a_0^2/(4b)", test5))

# Test 6: Framework mu^2 = 1536/7
test6 = mu2_framework == Rational(1536, 7)
tests.append(("Framework mu^2 = 1536/7", test6))

print()
all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print()
if all_pass:
    print("ALL TESTS PASS")
else:
    print("SOME TESTS FAILED")

# ==============================================================================
# SUMMARY
# ==============================================================================

print("\n" + "="*70)
print("SUMMARY")
print("="*70)

print("""
The coupled potential W(eps, phi) provides a mathematical foundation for
crystallization dynamics:

1. BEFORE CRYSTALLIZATION (phi ~ 0):
   - Mexican hat potential with minimum at |eps|* != 0
   - Topological defects (particles) are stable
   - Matter exists in the defect

2. DURING CRYSTALLIZATION (0 < phi < mu):
   - The equilibrium |eps|* decreases as phi increases
   - Crystallization pressure drives eps -> 0
   - Metastable structures persist

3. AFTER CRYSTALLIZATION (phi >= mu):
   - Only eps = 0 is stable
   - All structure decays
   - Return to Crystal ground state (U)

The framework value mu^2 = 1536/7 sets the scale where this transition
occurs in Planck units.

STATUS: [CONJECTURE] - Mathematical framework proposed, requires:
- Derivation of a_0, b from framework quantities
- Connection to quantum collapse mechanism
- Verification that attractor structure matches primes
""")
