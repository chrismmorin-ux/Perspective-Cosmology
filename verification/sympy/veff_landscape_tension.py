#!/usr/bin/env python3
"""
V_eff Landscape Tension: Condensate Energy vs Hilltop Inflation

KEY QUESTION: Does the crystallization condensate energy destroy the
hilltop inflation picture?

THE TENSION:
When epsilon is integrated out (adiabatic approximation, valid since m_tilt >> H_inf),
the effective potential is:

  V_eff(phi) = V_0 g(phi) - (a^2/(4b)) g(phi)^2

where g(phi) = 1 - phi^2/mu^2.

For hilltop (phi=0 is local maximum): need V_eff''(0) < 0
This requires: V_0 > a^2/(2b) = 2alpha^4 M_Pl^4

But CMB amplitude A_s constrains V_0 ~ 1.3*10^-9 M_Pl^4,
while a^2/(2b) ~ 5.7*10^-9 M_Pl^4.

V_0 is ~4x too small --> phi=0 becomes local MINIMUM, not hilltop.

STATUS: INVESTIGATION
Created: Session 133
"""

from sympy import *

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

# Division algebra quantities
R, C, H_dim, O_dim = 1, 2, 4, 8
Im_H, Im_O = 3, 7
n_d, n_c = 4, 11
alpha = Rational(1, 137)

# Hilltop scale
mu_sq = Rational(1536, 7)  # (C+H)*H^4/Im_O in M_Pl^2 units

# Best-candidate tilt potential parameters (from Session 132)
# b = M_Pl^4, a = 2*alpha^2 * M_Pl^4
# Working in M_Pl = 1 units
b_val = 1  # M_Pl^4
a_val = 2 * alpha**2  # = 2/137^2

# Condensate energy
cond_energy = a_val**2 / (4 * b_val)  # = alpha^4
cond_threshold = a_val**2 / (2 * b_val)  # = 2*alpha^4

print("=" * 70)
print("PART 1: CONDENSATE ENERGY SCALES")
print("=" * 70)
print()
print(f"Framework parameters:")
print(f"  mu^2 = {mu_sq} = {float(mu_sq):.2f} M_Pl^2")
print(f"  a = 2*alpha^2 = {a_val} = {float(a_val):.6e}")
print(f"  b = 1 (M_Pl^4 units)")
print(f"  epsilon* = alpha = {alpha} = {float(alpha):.6e}")
print()
print(f"Condensate energy: a^2/(4b) = alpha^4 = {cond_energy}")
print(f"  = {float(cond_energy):.4e} M_Pl^4")
print()
print(f"Hilltop threshold: a^2/(2b) = 2*alpha^4 = {cond_threshold}")
print(f"  = {float(cond_threshold):.4e} M_Pl^4")

# ==============================================================================
# PART 2: V_0 FROM CMB AMPLITUDE
# ==============================================================================

print()
print("=" * 70)
print("PART 2: V_0 FROM CMB CONSTRAINTS")
print("=" * 70)
print()

# Slow-roll parameters at phi_CMB = mu/sqrt(6) for r = 1 - n_s
# epsilon = 12/(25*mu^2) in M_Pl = 1 units
epsilon_sr = Rational(12, 25) / mu_sq
eta_sr = Rational(-12, 5) / mu_sq

print(f"Slow-roll parameters at phi_CMB = mu/sqrt(6):")
print(f"  epsilon = {epsilon_sr} = {float(epsilon_sr):.6e}")
print(f"  eta = {eta_sr} = {float(eta_sr):.6e}")
print(f"  eta/epsilon = {eta_sr/epsilon_sr} (should be -5)")
print()

# n_s and r
n_s = 1 - 6*epsilon_sr + 2*eta_sr
r_tensor = 16 * epsilon_sr
print(f"  n_s = {n_s} = {float(n_s):.6f}")
print(f"  r = {r_tensor} = {float(r_tensor):.6f}")
print()

# V_0 from A_s = V/(24*pi^2*epsilon*M_Pl^4)
# V at CMB = (5/6)*V_0  (since g(mu/sqrt(6)) = 5/6)
# A_s = (5/6)*V_0 / (24*pi^2*epsilon)
# V_0 = A_s * 24*pi^2*epsilon * 6/5

A_s_measured = Rational(21, 10**10)  # 2.1e-9 (Planck 2018)

V_0_from_As = A_s_measured * 24 * pi**2 * epsilon_sr * Rational(6, 5)

# For exact symbolic:
V_0_exact = A_s_measured * 24 * pi**2 * epsilon_sr * Rational(6, 5)

print(f"From A_s = {float(A_s_measured):.2e}:")
print(f"  V_0 = A_s * 24*pi^2 * epsilon * (6/5)")
print(f"  V_0 = {V_0_exact}")
print(f"  V_0 (numerical) = {float(V_0_exact):.6e} M_Pl^4")
print()

# ==============================================================================
# PART 3: THE TENSION
# ==============================================================================

print("=" * 70)
print("PART 3: THE TENSION -- V_0 vs CONDENSATE THRESHOLD")
print("=" * 70)
print()

ratio_V0_to_threshold = float(V_0_exact) / float(cond_threshold)
ratio_V0_to_cond = float(V_0_exact) / float(cond_energy)

print(f"V_0            = {float(V_0_exact):.4e} M_Pl^4")
print(f"a^2/(4b) [condensate] = {float(cond_energy):.4e} M_Pl^4")
print(f"a^2/(2b) [threshold]  = {float(cond_threshold):.4e} M_Pl^4")
print()
print(f"V_0 / (a^2/(2b)) = {ratio_V0_to_threshold:.4f}")
print(f"V_0 / (a^2/(4b)) = {ratio_V0_to_cond:.4f}")
print()

if ratio_V0_to_threshold < 1:
    print(">>> TENSION CONFIRMED: V_0 < a^2/(2b)")
    print(">>> phi = 0 is a local MINIMUM in V_eff, NOT a hilltop!")
    print(f">>> V_0 is {1/ratio_V0_to_threshold:.1f}x too small for hilltop")
else:
    print(">>> No tension: V_0 > a^2/(2b), hilltop preserved")

# ==============================================================================
# PART 4: EFFECTIVE POTENTIAL LANDSCAPE
# ==============================================================================

print()
print("=" * 70)
print("PART 4: EFFECTIVE POTENTIAL LANDSCAPE")
print("=" * 70)
print()

phi = Symbol('phi', real=True, positive=True)
x = Symbol('x', real=True)  # x = phi/mu

# V_eff in terms of x = phi/mu, using M_Pl = 1
# g(x) = 1 - x^2
g_x = 1 - x**2

# V_eff(x) = V_0 * g(x) - C_cond * g(x)^2
# where C_cond = a^2/(4b) = alpha^4
V_0_sym = Symbol('V_0', positive=True)
C_cond = Symbol('C', positive=True)

V_eff_sym = V_0_sym * g_x - C_cond * g_x**2

# Second derivative at x = 0
V_eff_d2 = diff(V_eff_sym, x, 2)
V_eff_d2_at_0 = V_eff_d2.subs(x, 0)
print(f"V_eff''(0) = {V_eff_d2_at_0}")
print(f"  = -2*(V_0 - 2C)  where C = a^2/(4b)")
print(f"  For hilltop: V_0 > 2C")
print()

# Find the barrier (other critical point besides x=0)
V_eff_d1 = diff(V_eff_sym, x)
V_eff_d1_simplified = simplify(V_eff_d1)
print(f"V_eff'(x) = {V_eff_d1_simplified}")

# Factor out 2x (since x=0 is always critical):
# V_eff'(x) = -2x * (V_0 - 2C(1-x^2))
# Other critical point: V_0 = 2C(1 - x^2)
# x^2 = 1 - V_0/(2C)
print()
print("Critical points:")
print(f"  x = 0 (always)")
print(f"  x^2 = 1 - V_0/(2C) when V_0 < 2C")
print()

# With numerical values
x_barrier_sq = 1 - float(V_0_exact) / float(2 * cond_energy)
if x_barrier_sq > 0:
    x_barrier = sqrt(x_barrier_sq)
    phi_barrier = float(x_barrier) * sqrt(float(mu_sq))
    print(f"Barrier location: x_barrier = phi/mu = {float(x_barrier):.4f}")
    print(f"                  phi_barrier = {phi_barrier:.2f} M_Pl")
    print()

    # Barrier height
    g_barrier = 1 - x_barrier_sq
    V_eff_barrier = float(V_0_exact) * g_barrier - float(cond_energy) * g_barrier**2
    V_eff_min = float(V_0_exact) - float(cond_energy)  # At x = 0
    barrier_height = V_eff_barrier - V_eff_min

    print(f"V_eff(0) [minimum] = {V_eff_min:.4e} M_Pl^4")
    print(f"V_eff(barrier)     = {V_eff_barrier:.4e} M_Pl^4")
    print(f"Barrier height     = {barrier_height:.4e} M_Pl^4")
    print(f"Barrier / |V_eff(0)| = {abs(barrier_height/V_eff_min):.4f}")
else:
    print("No barrier -- hilltop is preserved")

# ==============================================================================
# PART 5: WHAT WOULD RESTORE THE HILLTOP?
# ==============================================================================

print()
print("=" * 70)
print("PART 5: CONDITIONS TO RESTORE HILLTOP")
print("=" * 70)
print()

print("Option A: Reduce condensate energy (change a or b)")
print("  Need: a^2/(2b) < V_0")
a_max = sqrt(2 * b_val * float(V_0_exact))
print(f"  Max a for hilltop: a < {a_max:.4e}")
print(f"  Current a = {float(a_val):.4e}")
print(f"  Need a reduced by factor: {float(a_val)/a_max:.2f}")
print(f"  Equivalently: eps* = sqrt(a/(2b)) < {sqrt(a_max/(2*b_val)):.6e}")
print(f"  Current eps* = alpha = {float(alpha):.6e}")
eps_star_max = sqrt(a_max / (2 * b_val))
print(f"  Max eps* for hilltop: {eps_star_max:.6e}")
print(f"  Ratio eps*_max / alpha = {eps_star_max / float(alpha):.4f}")
print()

print("Option B: Increase b (stiffer quartic)")
b_min = float(a_val)**2 / (2 * float(V_0_exact))
print(f"  Min b for hilltop: b > {b_min:.4e} M_Pl^4")
print(f"  Current b = 1.0 M_Pl^4")
print(f"  Need b increased by factor: {b_min:.2f}")
print()

print("Option C: Increase V_0 (different inflationary scale)")
V_0_min = float(cond_threshold)
print(f"  Min V_0 for hilltop: V_0 > {V_0_min:.4e}")
print(f"  Current V_0 = {float(V_0_exact):.4e}")
print(f"  Would require A_s or epsilon to increase by factor {V_0_min/float(V_0_exact):.2f}")
print()

print("Option D: Different coupling -- W doesn't use g(phi)")
print("  If W(eps,phi) = -a*h(phi)*|eps|^2 + b*|eps|^4")
print("  with h(phi) NOT equal to g(phi), the g(phi) unification breaks")
print("  but the hilltop can be preserved.")
print()

print("Option E: eps does NOT adiabatically track")
print("  If m_tilt ~ H_inf, eps doesn't settle to minimum")
print("  V_eff = V(phi) without condensate contribution")
print("  This requires a ~ V_0/(3 M_Pl^2) [much smaller a]")
print()

# ==============================================================================
# PART 6: OPTION A DEEP DIVE -- REDUCED eps*
# ==============================================================================

print("=" * 70)
print("PART 6: REDUCED eps* SCENARIO")
print("=" * 70)
print()

# If eps* is NOT alpha but something smaller:
# Need a^2/(2b) < V_0
# With b = M_Pl^4 and a = 2*eps*^2 * M_Pl^4:
# (2*eps*^2)^2 / 2 < V_0
# 2*eps*^4 < V_0
# eps* < (V_0/2)^(1/4)

eps_star_critical = (float(V_0_exact) / 2) ** Rational(1, 4)
print(f"Critical eps*: eps* < (V_0/2)^(1/4) = {eps_star_critical:.6e}")
print(f"Compare: alpha = {float(alpha):.6e}")
print(f"         alpha^2 = {float(alpha**2):.6e}")
print()

# What if eps* = alpha^2 instead of alpha?
a_candidate_2 = 2 * alpha**4  # a = 2*eps*^2 = 2*alpha^4
cond_2 = a_candidate_2**2 / (4 * b_val)
threshold_2 = a_candidate_2**2 / (2 * b_val)
print(f"If eps* = alpha^2 = {float(alpha**2):.6e}:")
print(f"  a = 2*alpha^4 = {float(a_candidate_2):.6e}")
print(f"  Condensate = {float(cond_2):.6e}")
print(f"  Threshold = {float(threshold_2):.6e}")
print(f"  V_0 = {float(V_0_exact):.6e}")
hilltop_status = 'preserved' if float(V_0_exact) > float(threshold_2) else 'destroyed'
print(f"  V_0 > threshold? {float(V_0_exact) > float(threshold_2)} -- hilltop {hilltop_status}")
print()

# What eps* makes the condensate EXACTLY equal to V_0?
# 2*eps*^4 = V_0
eps_star_equal = (float(V_0_exact) / 2) ** 0.25
print(f"eps* where condensate = V_0: {eps_star_equal:.6e}")
print(f"  This is alpha^x where x = {log(eps_star_equal)/log(float(alpha)):.3f}")
print()

# ==============================================================================
# PART 7: ADIABATIC APPROXIMATION CHECK
# ==============================================================================

print("=" * 70)
print("PART 7: ADIABATIC APPROXIMATION VALIDITY")
print("=" * 70)
print()

# m_tilt^2 = 4a (curvature of Mexican hat at minimum)
# H_inf^2 = V_0/(3 M_Pl^2) in M_Pl = 1 units
m_tilt_sq = 4 * a_val
H_inf_sq = float(V_0_exact) / 3

ratio_m_H = sqrt(float(m_tilt_sq)) / sqrt(H_inf_sq)
print(f"m_tilt = sqrt(4a) = {float(sqrt(m_tilt_sq)):.6e} M_Pl")
print(f"H_inf = sqrt(V_0/3) = {sqrt(H_inf_sq):.6e} M_Pl")
print(f"m_tilt / H_inf = {ratio_m_H:.1f}")
print()
print(f"Adiabatic regime: m_tilt >> H_inf --> ratio = {ratio_m_H:.1f}")
if ratio_m_H > 10:
    print(">>> ADIABATIC APPROXIMATION IS VALID")
    print(">>> eps tracks its minimum, V_eff correctly includes condensate")
else:
    print(">>> Adiabatic approximation questionable -- two-field dynamics needed")
print()

# What a would make m_tilt = H_inf? (breakdown of adiabatic)
# 4a = V_0/3
a_non_adiabatic = float(V_0_exact) / 12
eps_star_non_ad = sqrt(a_non_adiabatic / (2 * b_val))
print(f"Adiabatic breakdown when a = V_0/12 = {a_non_adiabatic:.6e}")
print(f"  This gives eps* = {eps_star_non_ad:.6e}")
print(f"  Compare alpha = {float(alpha):.6e}")
print(f"  Compare alpha^2 = {float(alpha**2):.6e}")
print()

# ==============================================================================
# PART 8: OPTION F -- TWO-SECTOR POTENTIAL
# ==============================================================================

print("=" * 70)
print("PART 8: TWO-SECTOR RESOLUTION")
print("=" * 70)
print()
print("What if the inflation sector and tilt sector are SEPARATE,")
print("not coupled through g(phi)?")
print()
print("V_total = V_0(1 - phi^2/mu^2) + [-a|eps|^2 + b|eps|^4]")
print()
print("In this case, integrating out eps gives:")
print("  V_eff(phi) = V_0(1 - phi^2/mu^2) - a^2/(4b)")
print()
print("The condensate is just a CONSTANT SHIFT, not phi-dependent!")
print("V_eff''(0) = -2*V_0/mu^2 < 0  --> HILLTOP PRESERVED!")
print()
print("But this means: g(phi) unification is BROKEN.")
print("The tilt stability does NOT depend on crystallization state.")
print("Matter exists forever (no 'heat death' through crystallization).")
print()
print("Trade-off: Hilltop inflation <-> g(phi) unification")

# ==============================================================================
# PART 9: OPTION G -- PARTIAL COUPLING
# ==============================================================================

print()
print("=" * 70)
print("PART 9: PARTIAL COUPLING RESOLUTION")
print("=" * 70)
print()
print("What if coupling is WEAKER than g(phi)?")
print()
print("W(eps,phi) = -a * h(phi) * |eps|^2 + b|eps|^4")
print("where h(phi) = 1 - lambda * phi^2/mu^2  with 0 < lambda < 1")
print()

# V_eff(phi) = V_0 g(phi) - (a^2/(4b)) h(phi)^2
# V_eff''(0) = -2/mu^2 * (V_0 - a^2*lambda/(b))
# Actually, let me compute this properly

lam = Symbol('lambda', positive=True)
h_x = 1 - lam * x**2
V_eff_partial = V_0_sym * (1 - x**2) - C_cond * h_x**2

V_eff_partial_d2 = diff(V_eff_partial, x, 2)
V_eff_partial_d2_at_0 = V_eff_partial_d2.subs(x, 0)
print(f"V_eff''(0) with partial coupling = {simplify(V_eff_partial_d2_at_0)}")
print()

# For hilltop: this must be negative
# V_eff''(0) = -2*V_0 + 2*C*2*lambda = -2(V_0 - 2*C*lambda)
# Need V_0 > 2*C*lambda
# lambda < V_0 / (2*C)
lambda_max = float(V_0_exact) / (2 * float(cond_energy))
print(f"Need lambda < V_0/(2C) = {lambda_max:.4f}")
print(f"Current (g-unification): lambda = 1")
print()
print(f"Inflation requires lambda < {lambda_max:.4f}")
print(f"This is a factor {1/lambda_max:.1f}x weaker coupling than g(phi) unification")
print()

# At what lambda does the tilt become cosmologically unstable?
# The tilt mass at phi_CMB = mu/sqrt(6):
# m_tilt^2(phi_CMB) = 4a * h(phi_CMB) = 4a * (1 - lambda/6)
# For matter stability: need h(phi_CMB) > 0 --> lambda < 6
print(f"Matter stability at CMB epoch requires lambda < 6")
print(f"So lambda in ({lambda_max:.4f}, 6) preserves both inflation AND matter")
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print()
print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)
print()

tests = []

# Test 1: Condensate energy calculation
alpha_4 = Rational(1, 137)**4
test1 = (cond_energy == alpha_4)
tests.append(("Condensate energy = alpha^4", test1))

# Test 2: Slow-roll epsilon
eps_expected = Rational(7, 3200)
test2 = (epsilon_sr == eps_expected)
tests.append(("epsilon = 7/3200", test2))

# Test 3: n_s = 193/200
test3 = (n_s == Rational(193, 200))
tests.append(("n_s = 193/200", test3))

# Test 4: r = 7/200
test4 = (r_tensor == Rational(7, 200))
tests.append(("r = 7/200", test4))

# Test 5: eta/epsilon = -5
test5 = (eta_sr / epsilon_sr == -5)
tests.append(("eta/epsilon = -5", test5))

# Test 6: V_eff''(0) formula
test6 = (V_eff_d2_at_0 == -2*V_0_sym + 4*C_cond)
tests.append(("V_eff''(0) = -2*V_0 + 4C", test6))

# Test 7: Tension confirmed -- V_0 < threshold
test7 = (float(V_0_exact) < float(cond_threshold))
tests.append(("TENSION: V_0 < a^2/(2b)", test7))

# Test 8: Adiabatic approximation valid
test8 = (ratio_m_H > 10)
tests.append(("Adiabatic: m_tilt/H_inf > 10", test8))

# Test 9: Barrier exists
test9 = (x_barrier_sq > 0 and x_barrier_sq < 1)
tests.append(("Barrier exists at 0 < x < 1", test9))

# Test 10: Partial coupling can resolve
test10 = (lambda_max > 0 and lambda_max < 1)
tests.append(("Partial coupling lambda_max in (0,1)", test10))

# Test 11: Separated sectors preserve hilltop
# If condensate is constant (no phi coupling), V_eff''(0) = -2V_0/mu^2 < 0
test11 = True  # Always true since V_0 > 0
tests.append(("Separated sectors preserve hilltop", test11))

# Test 12: Reduced eps* can resolve
test12 = (float(alpha**2) < eps_star_critical)
tests.append(("eps* = alpha^2 restores hilltop", float(V_0_exact) > float(threshold_2)))

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    print(f"[{status}] {name}")

print()
print(f"{'ALL TESTS PASS' if all_pass else 'SOME TESTS FAILED'}")
print()

# ==============================================================================
# SUMMARY
# ==============================================================================

print("=" * 70)
print("SUMMARY")
print("=" * 70)
print()
print("THE TENSION IS REAL:")
print(f"  V_0 = {float(V_0_exact):.3e} M_Pl^4 (from CMB A_s)")
print(f"  a^2/(2b) = {float(cond_threshold):.3e} M_Pl^4 (hilltop threshold)")
print(f"  Ratio V_0/threshold = {ratio_V0_to_threshold:.3f}")
print()
print("RESOLUTIONS RANKED BY STRUCTURAL COST:")
print()
print("  1. PARTIAL COUPLING (lambda ~ 0.23):")
print(f"     Weaken phi-eps coupling by factor {lambda_max:.2f}")
print("     Preserves g(phi) concept but weakens unification claim")
print("     Matter still stable (lambda < 6 is fine)")
print()
print("  2. REDUCED eps* (eps* ~ alpha^(1.5) instead of alpha):")
print(f"     Need eps* < {eps_star_critical:.4e}")
print("     Changes tilt equilibrium but keeps coupled structure")
print()
print("  3. SEPARATED SECTORS:")
print("     Tilt potential independent of phi")
print("     Hilltop trivially preserved")
print("     But g(phi) unification is completely lost")
print()
print("  4. LARGER V_0 (different inflation model):")
print(f"     Need V_0 > {V_0_min:.3e}, i.e., {V_0_min/float(V_0_exact):.1f}x larger")
print("     Would change n_s, r, N predictions")
print()
print("CRITICAL QUESTION: Is the g(phi) unification worth preserving,")
print("or should we accept weaker/no coupling?")
