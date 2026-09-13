#!/usr/bin/env python3
"""
Koide Theta Correction Search
==============================

Current: theta = pi x 73/99 with 0.006% error (60 ppm)
Goal: Find correction term for ppm accuracy

Following the pattern found in other constants:
  constant = main_term + small_correction

Where corrections are ratios of division algebra dimensions.

Status: INVESTIGATION
"""

from fractions import Fraction
from sympy import pi, isprime, sqrt, cos
from math import atan2

print("=" * 70)
print("KOIDE THETA CORRECTION SEARCH")
print("=" * 70)

# =============================================================================
# MEASURED VALUES
# =============================================================================

# Lepton masses in MeV (PDG 2022)
m_e = 0.51099895000  # MeV
m_mu = 105.6583755   # MeV
m_tau = 1776.86      # MeV

# Extract theta from masses using Koide formula
# m_i = M(1 + sqrt(2) cos(theta + 2*pi*k/3))^2
# where k = 0, 1, 2

# More precisely, from the Koide parametrization:
sqrt_m_e = m_e**0.5
sqrt_m_mu = m_mu**0.5
sqrt_m_tau = m_tau**0.5

# Koide Q value
Q_measured = (m_e + m_mu + m_tau) / (sqrt_m_e + sqrt_m_mu + sqrt_m_tau)**2

# Extract theta using the Koide formula relations
# For the three masses: sqrt(m_i) = sqrt(M) * (1 + sqrt(2) * cos(theta + 2*pi*k/3))
# This gives us a way to extract theta

# Using the relation for the mass ratios:
# sqrt(m_mu/m_e) and sqrt(m_tau/m_e) determine theta

# Alternative: use the parametric form directly
# The phase theta can be extracted from:
# tan(3*theta) = (3*sqrt(2)*(sqrt_m_e - sqrt_m_tau))/(2*(sqrt_m_e + sqrt_m_mu + sqrt_m_tau) - 3*(sqrt_m_mu))

# More directly, compute theta from the known value
# From literature: theta ~ 0.2222 or theta ~ 2/9 radians

# The observed theta (in units where full angle is 2*pi)
# From the script above: theta_observed = 2.3167 radians

import numpy as np

def compute_theta_from_masses(m1, m2, m3):
    """Extract Koide theta from three masses."""
    s1, s2, s3 = np.sqrt(m1), np.sqrt(m2), np.sqrt(m3)
    S = s1 + s2 + s3

    # Using the Koide parametrization
    # s_i = sqrt(M) * (1 + sqrt(2) * cos(theta + 2*pi*k/3))
    # Sum: S = 3*sqrt(M) (since cos terms sum to 0)
    # So: sqrt(M) = S/3

    sqrt_M = S / 3

    # From s_e = sqrt(M) * (1 + sqrt(2) * cos(theta))
    # cos(theta) = (s_e/sqrt_M - 1) / sqrt(2)

    cos_theta = (s1/sqrt_M - 1) / np.sqrt(2)

    # From s_mu = sqrt(M) * (1 + sqrt(2) * cos(theta + 2*pi/3))
    cos_theta_plus = (s2/sqrt_M - 1) / np.sqrt(2)

    # Use both to get theta
    # cos(theta + 2*pi/3) = cos(theta)*cos(2*pi/3) - sin(theta)*sin(2*pi/3)
    #                     = -cos(theta)/2 - sqrt(3)/2 * sin(theta)

    sin_theta = -(cos_theta_plus + cos_theta/2) / (np.sqrt(3)/2)

    theta = np.arctan2(sin_theta, cos_theta)

    return theta

theta_measured = compute_theta_from_masses(m_e, m_mu, m_tau)

print(f"""
MEASURED VALUES:
  m_e   = {m_e} MeV
  m_mu  = {m_mu} MeV
  m_tau = {m_tau} MeV

  Q (Koide) = {Q_measured:.10f} (should be 2/3 = {2/3:.10f})

  theta (from masses) = {theta_measured:.10f} radians
""")

# =============================================================================
# CURRENT PREDICTION
# =============================================================================

print("=" * 70)
print("CURRENT PREDICTION: theta = pi x 73/99")
print("=" * 70)

theta_base = float(pi) * 73 / 99
error_base = abs(theta_base - theta_measured) / theta_measured * 100
error_base_ppm = error_base * 10000

print(f"""
theta_predicted = pi x 73/99 = {theta_base:.10f}
theta_measured  = {theta_measured:.10f}

Difference = {theta_base - theta_measured:+.10f}
Error = {error_base:.6f}% = {error_base_ppm:.1f} ppm
""")

# =============================================================================
# DIVISION ALGEBRA DIMENSIONS
# =============================================================================

dim_R = 1
dim_C = 2
dim_H = 4
dim_O = 8

Im_H = 3
Im_O = 7

n_d = dim_H  # = 4
n_c = dim_R + dim_C + dim_O  # = 11

# Cyclotomic polynomial Phi_6(x) = x^2 - x + 1
def Phi_6(x):
    return x**2 - x + 1

print(f"""
DIVISION ALGEBRA DIMENSIONS:
  dim(R) = {dim_R}, dim(C) = {dim_C}, dim(H) = {dim_H}, dim(O) = {dim_O}
  Im(H) = {Im_H}, Im(O) = {Im_O}
  n_d = {n_d}, n_c = {n_c}

  Phi_6(n_c) = Phi_6(11) = {Phi_6(n_c)}
  Phi_6(Im(O)) = Phi_6(7) = {Phi_6(Im_O)}
  Phi_6(H+O) = Phi_6(12) = {Phi_6(dim_H + dim_O)}
""")

# =============================================================================
# SEARCH FOR CORRECTION TERM
# =============================================================================

print("=" * 70)
print("SEARCHING FOR CORRECTION TERM")
print("=" * 70)

# The measured - predicted difference
diff_radians = theta_measured - theta_base
diff_over_pi = diff_radians / float(pi)

print(f"""
The correction needed (in radians): {diff_radians:.10f}
The correction needed (as fraction of pi): {diff_over_pi:.10f}
""")

# Search for corrections of the form: pi x (a/b) where a, b are division algebra combinations
dims = [1, 2, 3, 4, 7, 8, 11]  # R, C, Im(H), H, Im(O), O, n_c
special_values = [
    9,   # Im(H)^2
    72,  # O x Im(H)^2
    49,  # Im(O)^2
    121, # n_c^2
    111, # Phi_6(n_c)
    43,  # Phi_6(Im(O))
    133, # Phi_6(H+O)
    28,  # n_d x Im(O)
    99,  # Im(H)^2 x n_c
    12,  # H + O
    10,  # C + O
]

all_nums = sorted(set(dims + special_values))

print("Searching for small corrections a/b...")
print()

candidates = []

# We need a small correction, so search small numerators
for a in range(-20, 21):
    if a == 0:
        continue
    for b in all_nums:
        if b == 0:
            continue
        correction = a / b
        # Check both signs
        for sign in [1]:
            corr = sign * correction
            # theta = pi x (73/99 + a/b) = pi x (73*b + 99*a) / (99*b)
            new_num = 73 * b + 99 * a
            new_den = 99 * b
            theta_corrected = float(pi) * new_num / new_den
            error = abs(theta_corrected - theta_measured) / theta_measured * 100
            error_ppm = error * 10000

            if error_ppm < error_base_ppm:  # Better than current
                candidates.append((error_ppm, a, b, new_num, new_den, theta_corrected))

candidates.sort()

print("Top 20 candidates (error < baseline {:.1f} ppm):".format(error_base_ppm))
print()
print("| Correction | Numerator | Denominator | Error (ppm) | Meaning |")
print("|------------|-----------|-------------|-------------|---------|")

for i, (err, a, b, num, den, theta) in enumerate(candidates[:20]):
    # Simplify the fraction
    from math import gcd
    g = gcd(abs(num), den)
    num_s, den_s = num // g, den // g

    # Try to identify the meaning of b
    meaning = ""
    if b == 1: meaning = "dim(R)"
    elif b == 2: meaning = "dim(C)"
    elif b == 3: meaning = "Im(H)"
    elif b == 4: meaning = "dim(H)"
    elif b == 7: meaning = "Im(O)"
    elif b == 8: meaning = "dim(O)"
    elif b == 11: meaning = "n_c"
    elif b == 9: meaning = "Im(H)^2"
    elif b == 72: meaning = "O x Im(H)^2"
    elif b == 111: meaning = "Phi_6(n_c)"
    elif b == 43: meaning = "Phi_6(Im(O))"
    elif b == 133: meaning = "Phi_6(H+O)"
    elif b == 99: meaning = "Im(H)^2 x n_c"

    print(f"| {a:+d}/{b:<3d}       | {num_s:<9d} | {den_s:<11d} | {err:<11.2f} | {meaning} |")

# =============================================================================
# ANALYZE BEST CANDIDATES
# =============================================================================

print()
print("=" * 70)
print("ANALYZING BEST CANDIDATES")
print("=" * 70)

if candidates:
    best = candidates[0]
    err, a, b, num, den, theta = best

    from math import gcd
    g = gcd(abs(num), den)
    num_s, den_s = num // g, den // g

    print(f"""
BEST FORMULA FOUND:

  theta = pi x ({num_s}/{den_s})

  Original: pi x 73/99
  Correction: {a:+d}/{b}

  = pi x (73/99 + {a}/{b})
  = pi x (73 x {b} + 99 x {a}) / (99 x {b})
  = pi x {num} / {den}
  = pi x {num_s} / {den_s}  (simplified)

  Predicted: {theta:.10f}
  Measured:  {theta_measured:.10f}

  Error: {err:.2f} ppm
  Improvement: {error_base_ppm/err:.1f}x better than pi x 73/99
""")

# =============================================================================
# SEARCH WITH Phi_6 STRUCTURE
# =============================================================================

print()
print("=" * 70)
print("SEARCHING WITH Phi_6 STRUCTURE (like other constants)")
print("=" * 70)

# All other constants use corrections involving Phi_6:
# 1/alpha: +4/111 = +n_d/Phi_6(n_c)
# sin^2 theta_W: -10/133 = -(C+O)/Phi_6(H+O)
# m_mu/m_e: -10/43 = -(C+O)/Phi_6(Im(O))

# Try corrections of form: +/- x / Phi_6(y)

phi6_denoms = [
    (Phi_6(n_c), "Phi_6(n_c)"),         # 111
    (Phi_6(Im_O), "Phi_6(Im(O))"),       # 43
    (Phi_6(dim_H + dim_O), "Phi_6(H+O)"), # 133
    (Phi_6(Im_H), "Phi_6(Im(H))"),       # 7
    (Phi_6(dim_O), "Phi_6(O)"),          # 57
]

phi6_candidates = []

for denom, denom_name in phi6_denoms:
    for num in range(-15, 16):
        if num == 0:
            continue
        # theta = pi x (73/99 + num/denom)
        # = pi x (73*denom + 99*num) / (99*denom)
        new_num = 73 * denom + 99 * num
        new_den = 99 * denom
        theta_corrected = float(pi) * new_num / new_den
        error = abs(theta_corrected - theta_measured) / theta_measured * 100
        error_ppm = error * 10000

        phi6_candidates.append((error_ppm, num, denom, denom_name, new_num, new_den, theta_corrected))

phi6_candidates.sort()

print("\nTop 10 Phi_6-based corrections:")
print()

for i, (err, num, denom, denom_name, n_new, d_new, theta) in enumerate(phi6_candidates[:10]):
    from math import gcd
    g = gcd(abs(n_new), d_new)
    n_s, d_s = n_new // g, d_new // g

    # Try to identify numerator meaning
    num_meaning = ""
    if abs(num) == n_d: num_meaning = "n_d"
    elif abs(num) == n_c: num_meaning = "n_c"
    elif abs(num) == dim_C + dim_O: num_meaning = "C+O"
    elif abs(num) == dim_H + dim_O: num_meaning = "H+O"
    elif abs(num) == Im_H: num_meaning = "Im(H)"
    elif abs(num) == Im_O: num_meaning = "Im(O)"

    sign = "+" if num > 0 else "-"
    print(f"  {sign}{abs(num)}/{denom_name}: theta = pi x {n_s}/{d_s}, error = {err:.2f} ppm")
    if num_meaning:
        print(f"      ({num_meaning}/{denom_name})")

# =============================================================================
# DIRECT FRACTION SEARCH
# =============================================================================

print()
print("=" * 70)
print("DIRECT FRACTION SEARCH FOR theta/pi")
print("=" * 70)

# What if we just look for the best fraction p/q directly?
target = theta_measured / float(pi)

print(f"theta/pi = {target:.10f}")
print()
print("Searching for fractions with division algebra structure...")
print()

direct_candidates = []

# Search for p/q where p, q can be built from framework dimensions
for p in range(60, 100):
    for q in range(80, 150):
        theta_pred = float(pi) * p / q
        error = abs(theta_pred - theta_measured) / theta_measured * 100
        error_ppm = error * 10000

        if error_ppm < 100:  # Within 100 ppm
            direct_candidates.append((error_ppm, p, q, theta_pred))

direct_candidates.sort()

print("Top 10 direct fractions (error < 100 ppm):")
print()

for err, p, q, theta in direct_candidates[:10]:
    from sympy import factorint
    p_factors = factorint(p)
    q_factors = factorint(q)
    print(f"  {p}/{q}: error = {err:.2f} ppm")
    print(f"      {p} = {dict(p_factors)}, {q} = {dict(q_factors)}")

# =============================================================================
# SUMMARY
# =============================================================================

print()
print("=" * 70)
print("SUMMARY")
print("=" * 70)

if candidates:
    best = candidates[0]
    err, a, b, num, den, theta = best
    from math import gcd
    g = gcd(abs(num), den)
    num_s, den_s = num // g, den // g

    print(f"""
CURRENT BEST: theta = pi x 73/99
  Error: {error_base_ppm:.1f} ppm ({error_base:.4f}%)

IMPROVED: theta = pi x {num_s}/{den_s}
  Error: {err:.2f} ppm
  Improvement: {error_base_ppm/err:.1f}x

The correction is: {a:+d}/{b}
""")

# Check if best direct fraction is different
if direct_candidates:
    best_direct = direct_candidates[0]
    print(f"Best direct fraction: {best_direct[1]}/{best_direct[2]} with {best_direct[0]:.2f} ppm")
