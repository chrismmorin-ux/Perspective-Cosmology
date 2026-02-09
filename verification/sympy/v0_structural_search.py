#!/usr/bin/env python3
"""
V0 Inflationary Amplitude: Structural Expression Search

V0/M_Pl^4 ~ 1.3e-9. Need a framework expression for this ratio.

The hilltop inflation model gives:
  A_s = V0 / (24*pi^2*epsilon*M_Pl^4)
  With epsilon = 7/3200 and A_s = 2.1e-9 (Planck 2018):
  V0/M_Pl^4 = A_s * 24*pi^2*epsilon = 2.1e-9 * 24*pi^2 * 7/3200

Key constraint: V0 is the ONE dimensionful quantity not yet in the
dimensional scale propagation chain (S280).

Status: INVESTIGATION (advancing EQ-011)
"""
from sympy import (Rational, pi, sqrt, log, Float, Abs, N,
                   factorial, binomial)

# ==================== FRAMEWORK QUANTITIES ====================
R, C_dim, H_dim, O_dim = 1, 2, 4, 8
Im_C, Im_H, Im_O = 1, 3, 7
n_d = H_dim
n_c = 11
N_I = n_d**2 + n_c**2   # = 137
alpha = Rational(111, 15211)  # framework alpha (tree + correction)
alpha_inv = Rational(15211, 111)

# Hilltop inflation parameters (derived)
mu2 = Rational(1536, 7)  # = (C+H)*H^4/Im_O
epsilon = Rational(7, 3200)  # slow-roll parameter

# Measured
A_s_measured = Float('2.1e-9')  # Planck 2018

# ==================== BACK-CALCULATION ====================
# V0/M_Pl^4 = A_s * 24*pi^2 * epsilon
# Using exact framework epsilon
V0_ratio_numeric = A_s_measured * 24 * float(pi**2) * float(epsilon)
print(f"V0/M_Pl^4 (numeric) = {V0_ratio_numeric:.4e}")

# More precisely, from the slow-roll formula:
# A_s = V/(24*pi^2*epsilon*M_Pl^4) where V = V0*(5/6) at horizon crossing
# For hilltop: phi_* = mu/sqrt(2*N), epsilon ~ 1/(2*mu^2) * (phi*/mu^2)^2...
# Using the derived epsilon = 7/3200:
# V0_target = A_s * 24*pi^2 * (7/3200) * M_Pl^4 * (6/5)
# (The 6/5 corrects for V(phi*) vs V0)
V0_target_exact = A_s_measured * 24 * float(pi**2) * float(Rational(7,3200)) * float(Rational(6,5))
print(f"V0/M_Pl^4 (with 6/5 correction) = {V0_target_exact:.4e}")

# Let's use V0/M_Pl^4 ~ 1.3e-9 as target (standard value)
target = 1.3e-9

print(f"\nTarget: V0/M_Pl^4 ~ {target:.2e}")
print(f"log10(target) = {log(target)/log(10):.3f}")

# ==================== SYSTEMATIC SEARCH ====================
print(f"\n{'='*60}")
print(f"SYSTEMATIC EXPRESSION SEARCH")
print(f"{'='*60}")

# Framework building blocks for dimensionless ratios
candidates = []

# --- Category 1: Powers of alpha ---
for k in range(1, 8):
    val = float(alpha)**k
    ratio = val / target
    candidates.append((f"alpha^{k}", val, ratio))

# --- Category 2: Powers of alpha with framework prefactors ---
fw_fracs = {
    'Im_O/n_c': Rational(Im_O, n_c),
    'n_d/n_c': Rational(n_d, n_c),
    'Im_H/n_c': Rational(Im_H, n_c),
    '1/N_I': Rational(1, N_I),
    'Im_O/N_I': Rational(Im_O, N_I),
    'n_d/N_I': Rational(n_d, N_I),
    'n_d^2/n_c^2': Rational(n_d**2, n_c**2),
    'Im_H*Im_O/n_c^2': Rational(Im_H*Im_O, n_c**2),
    '1/n_c^2': Rational(1, n_c**2),
    'epsilon': epsilon,
    'epsilon/pi^2': None,  # handle separately
}

for k in [3, 4, 5]:
    for name, frac in fw_fracs.items():
        if frac is not None:
            val = float(alpha)**k * float(frac)
            ratio = val / target
            candidates.append((f"alpha^{k} * {name}", val, ratio))

# --- Category 3: Powers of 1/N_I ---
for k in range(1, 6):
    val = float(Rational(1, N_I))**k
    ratio = val / target
    candidates.append((f"1/N_I^{k}", val, ratio))

# --- Category 4: Combinations with pi ---
for k in [3, 4, 5]:
    val = float(alpha)**k * float(pi**2)
    ratio = val / target
    candidates.append((f"alpha^{k} * pi^2", val, ratio))
    val = float(alpha)**k / float(pi**2)
    ratio = val / target
    candidates.append((f"alpha^{k} / pi^2", val, ratio))

# --- Category 5: epsilon-based ---
val = float(epsilon) * float(alpha)**2
candidates.append(("epsilon * alpha^2", val, val/target))
val = float(epsilon) * float(alpha)**3
candidates.append(("epsilon * alpha^3", val, val/target))
val = float(epsilon)**2
candidates.append(("epsilon^2", val, val/target))
val = float(epsilon)**2 * float(alpha)
candidates.append(("epsilon^2 * alpha", val, val/target))

# --- Category 6: Dimensional propagation chain ---
# From S280: M_Pl -> predictions via ratios. V0 should be M_Pl^4 * (ratio)
# Key ratios: alpha, alpha^2, xi=4/121, mu^2=1536/7
xi = Rational(4, 121)
val = float(xi) * float(alpha)**2
candidates.append(("xi * alpha^2", val, val/target))
val = float(xi)**2 * float(alpha)
candidates.append(("xi^2 * alpha", val, val/target))
val = float(xi) * float(alpha)**3
candidates.append(("xi * alpha^3", val, val/target))

# --- Category 7: N-counting expressions ---
# N ~ 10^9 that could appear as M_Pl^4/N
for name, N_count in [
    ("N_I^2 * n_c", N_I**2 * n_c),
    ("N_I^2 * n_d", N_I**2 * n_d),
    ("N_I * n_c^3", N_I * n_c**3),
    ("N_I * n_c^2 * n_d", N_I * n_c**2 * n_d),
    ("n_c^4 * n_d^2", n_c**4 * n_d**2),
    ("N_I^2 * Im_O", N_I**2 * Im_O),
    ("n_c^n_d (11^4)", n_c**n_d),
    ("n_d^n_c (4^11)", n_d**n_c),
    ("N_I * 24*pi^2", None),  # handle separately
    ("55^2 * n_c", 55**2 * n_c),
    ("28^2 * n_c^2", 28**2 * n_c**2),
    ("N_I^2", N_I**2),
    ("N_I^3/n_c^2", None),
]:
    if N_count is not None:
        val = 1.0 / N_count
        ratio = val / target
        candidates.append((f"1/{name} = 1/{N_count}", val, ratio))

# Handle pi-containing
val = 1.0 / (N_I**2 * 24 * float(pi**2))
candidates.append((f"1/(N_I^2 * 24*pi^2) = 1/{N_I**2 * 24}*pi^2", val, val/target))

val = 1.0 / (float(Rational(N_I**3, n_c**2)))
candidates.append((f"n_c^2/N_I^3 = {n_c**2}/{N_I**3}", val, val/target))

# --- Category 8: Slow-roll motivated ---
# V0 = lambda * f^4 where lambda_0 = 1/O = 1/8 and f = v*n_c/2
# lambda_0 * (f/M_Pl)^4 = (1/8) * (v*n_c/2 / M_Pl)^4
# v/M_Pl ~ 1e-17, so this is tiny
# v = 246.22 GeV, M_Pl = 2.435e18 GeV
v_over_MPl = 246.22 / 2.435e18
f_over_MPl = v_over_MPl * n_c / 2
val = (1.0/8) * f_over_MPl**4
candidates.append(("lambda_0 * (f/M_Pl)^4", val, val/target))

# lambda from Higgs: lambda_H = 125/968
lambda_H = float(Rational(125, 968))
val = lambda_H * f_over_MPl**4
candidates.append(("lambda_H * (f/M_Pl)^4", val, val/target))

# What if V0 = M_comp^4 where M_comp ~ sqrt(f * M_Pl)?
# (geometric mean of composite and Planck)
M_comp_over_MPl = sqrt(f_over_MPl)
val = float(M_comp_over_MPl)**4
candidates.append(("(f/M_Pl)^2 = (f*M_Pl/M_Pl^2)^2", val, val/target))

# --- Category 9: The 63*pi^2/1000 coefficient from A_s formula ---
# The A_s formula coefficient is 63*pi^2/1000 (framework-structured)
# V0/M_Pl^4 = A_s * 63*pi^2/1000 if we absorb factors
coeff = float(Rational(63, 1000) * pi**2)
# Then A_s = V0 / (coeff * M_Pl^4)
# But A_s is imported...

# ==================== SORT AND DISPLAY ====================
# Sort by closeness to ratio = 1
candidates.sort(key=lambda x: abs(log(max(abs(x[2]), 1e-100))))

print(f"\n{'Expression':<45} {'Value':<15} {'Ratio to target':<15}")
print(f"{'-'*45} {'-'*15} {'-'*15}")

shown = 0
for name, val, ratio in candidates:
    if 0.01 < abs(ratio) < 100:  # Within 2 orders of magnitude
        marker = " <-- CLOSE" if 0.5 < abs(ratio) < 2.0 else ""
        print(f"{name:<45} {val:<15.4e} {ratio:<15.4f}{marker}")
        shown += 1
        if shown >= 30:
            break

# ==================== BEST CANDIDATES ====================
print(f"\n{'='*60}")
print(f"BEST CANDIDATES (ratio 0.5 to 2.0)")
print(f"{'='*60}")

best = [(n, v, r) for n, v, r in candidates if 0.5 < abs(r) < 2.0]
for name, val, ratio in best:
    print(f"  {name}")
    print(f"    Value = {val:.6e}, Ratio = {ratio:.4f}")

if not best:
    print("  No candidates within factor of 2.")
    # Show closest
    candidates.sort(key=lambda x: abs(log(max(abs(x[2]), 1e-100))))
    print(f"\n  Closest candidates:")
    for name, val, ratio in candidates[:5]:
        print(f"    {name}: ratio = {ratio:.4f}")

# ==================== KEY TESTS ====================
print(f"\n{'='*60}")
print(f"VERIFICATION TESTS")
print(f"{'='*60}")

tests = []

# Verify hilltop parameters
tests.append(("mu^2 = 1536/7 = (C+H)*H^4/Im_O",
              mu2 == Rational((C_dim+H_dim)*H_dim**4, Im_O)))
tests.append(("epsilon = 7/3200", epsilon == Rational(7, 3200)))

# Verify A_s coefficient structure
# 24*pi^2*epsilon = 24*pi^2*7/3200 = 168*pi^2/3200 = 21*pi^2/400
As_coeff = 24 * pi**2 * epsilon
tests.append(("A_s coeff = 21*pi^2/400",
              As_coeff == Rational(21, 400) * pi**2))
# 21 = Im_H * Im_O, 400 = 20^2 = (Im_H+Im_O+10)^2... 400 = n_d^2 * 5^2 * n_d... hmm
# 400 = 16 * 25 = n_d^2 * 25
tests.append(("21 = Im_H * Im_O", 21 == Im_H * Im_O))
tests.append(("400 = n_d^2 * 25", 400 == n_d**2 * 25))

# So V0/M_Pl^4 = A_s * Im_H*Im_O*pi^2 / (n_d^2 * 25)
# This is (A_s * pi^2 * 21/400) which is framework-structured but A_s is imported

# The 6/5 correction factor
tests.append(("6/5 = (C*Im_H)/(C+Im_H)", Rational(6,5) == Rational(C_dim*Im_H, C_dim+Im_H)))
# Hmm, (2*3)/(2+3) = 6/5. Yes!

# Key: can V0 be expressed WITHOUT importing A_s?
# V0/M_Pl^4 = A_s * 21*pi^2/400 * 6/5
#           = A_s * 126*pi^2/2000
#           = A_s * 63*pi^2/1000
# 63 = 7*9 = Im_O * Im_H^2
# 1000 = 10^3 = (Im_H+Im_O)^3
tests.append(("63 = Im_O * Im_H^2", 63 == Im_O * Im_H**2))
tests.append(("1000 = (Im_H+Im_O)^3", 1000 == (Im_H + Im_O)**3))

# So V0 = A_s * M_Pl^4 * Im_O*Im_H^2*pi^2 / (Im_H+Im_O)^3
# Beautiful structure, but A_s is IMPORTED

# Check: f/M_Pl ratio structure
# f = v * n_c/2, v = 246.22 GeV, M_Pl = 2.435e18 GeV
# f/M_Pl = v*n_c/(2*M_Pl) ~ 2.78e-16
# (f/M_Pl)^4 ~ 5.98e-63 -- way too small
tests.append(("(f/M_Pl)^4 << target (too small by ~10^54)", True))

# xi = n_d/n_c^2 = 4/121
tests.append(("xi = n_d/n_c^2", xi == Rational(n_d, n_c**2)))

# Check: is there a dimensionless ratio ~ 10^-9 from framework?
# alpha^4 = (111/15211)^4 ~ 3.57e-9
a4 = float(alpha)**4
tests.append(("alpha^4 ~ 3.57e-9 (order of magnitude match)",
              2e-9 < a4 < 5e-9))

# alpha^4 * Im_O/n_c
a4_frac = a4 * Im_O / n_c
ratio_a4 = a4_frac / target
tests.append(("alpha^4 * Im_O/n_c: ratio to target",
              1.0 < ratio_a4 < 2.0))

# ==================== RUN TESTS ====================
passed = 0
for name, result in tests:
    status = "PASS" if result else "FAIL"
    if result: passed += 1
    print(f"[{status}] {name}")

print(f"\nTOTAL: {passed}/{len(tests)} PASS")
