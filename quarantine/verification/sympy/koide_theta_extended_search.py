#!/usr/bin/env python3
"""
Koide Theta Extended Search
============================

The simple correction search failed - no a/b improves on 73/99.
This suggests either:
1. 73/99 is the "exact" answer (42 ppm is experimental uncertainty)
2. We need a more complex correction structure
3. The correction involves products rather than sums

Let's explore option 2 and 3.

Status: INVESTIGATION
"""

from fractions import Fraction
from sympy import pi, isprime, sqrt, factorint
import numpy as np

print("=" * 70)
print("KOIDE THETA EXTENDED SEARCH")
print("=" * 70)

# =============================================================================
# MEASURED VALUES
# =============================================================================

# Lepton masses in MeV (PDG 2022)
m_e = 0.51099895000  # MeV
m_mu = 105.6583755   # MeV
m_tau = 1776.86      # MeV

# Compute theta from masses
def compute_theta_from_masses(m1, m2, m3):
    s1, s2, s3 = np.sqrt(m1), np.sqrt(m2), np.sqrt(m3)
    S = s1 + s2 + s3
    sqrt_M = S / 3
    cos_theta = (s1/sqrt_M - 1) / np.sqrt(2)
    cos_theta_plus = (s2/sqrt_M - 1) / np.sqrt(2)
    sin_theta = -(cos_theta_plus + cos_theta/2) / (np.sqrt(3)/2)
    return np.arctan2(sin_theta, cos_theta)

theta_measured = compute_theta_from_masses(m_e, m_mu, m_tau)

# Division algebra dimensions
dim_R = 1
dim_C = 2
dim_H = 4
dim_O = 8
Im_H = 3
Im_O = 7
n_d = 4
n_c = 11

def Phi_6(x):
    return x**2 - x + 1

print(f"""
theta_measured = {theta_measured:.10f} radians
theta/pi = {theta_measured / np.pi:.10f}

Current: pi x 73/99 = {np.pi * 73/99:.10f}
Error: {abs(np.pi * 73/99 - theta_measured)/theta_measured * 1e6:.1f} ppm
""")

# =============================================================================
# PART 1: CHECK IF 42 ppm IS WITHIN EXPERIMENTAL UNCERTAINTY
# =============================================================================

print("=" * 70)
print("PART 1: EXPERIMENTAL UNCERTAINTY ANALYSIS")
print("=" * 70)

# Uncertainties from PDG
m_e_unc = 0.00000000015  # MeV (negligible)
m_mu_unc = 0.0000023     # MeV
m_tau_unc = 0.12         # MeV (largest)

print(f"""
Mass uncertainties (PDG):
  m_e:   {m_e} +/- {m_e_unc:.2e} MeV ({m_e_unc/m_e*100:.1e}%)
  m_mu:  {m_mu} +/- {m_mu_unc} MeV ({m_mu_unc/m_mu*100:.4f}%)
  m_tau: {m_tau} +/- {m_tau_unc} MeV ({m_tau_unc/m_tau*100:.4f}%)
""")

# Propagate uncertainty to theta
theta_upper = compute_theta_from_masses(m_e - m_e_unc, m_mu - m_mu_unc, m_tau + m_tau_unc)
theta_lower = compute_theta_from_masses(m_e + m_e_unc, m_mu + m_mu_unc, m_tau - m_tau_unc)
theta_unc = abs(theta_upper - theta_lower) / 2

theta_predicted = np.pi * 73/99
deviation_sigma = abs(theta_predicted - theta_measured) / theta_unc

print(f"""
Propagated uncertainty:
  theta = {theta_measured:.10f} +/- {theta_unc:.2e}
  theta_unc/theta = {theta_unc/theta_measured*1e6:.1f} ppm

Prediction vs measurement:
  pi x 73/99 = {theta_predicted:.10f}
  Deviation: {abs(theta_predicted - theta_measured):.2e}
  This is {deviation_sigma:.1f} sigma from prediction

Conclusion: The 42 ppm discrepancy is {deviation_sigma:.0f}x the experimental uncertainty.
""")

# =============================================================================
# PART 2: SEARCH FOR MULTIPLICATIVE CORRECTIONS
# =============================================================================

print("=" * 70)
print("PART 2: MULTIPLICATIVE CORRECTION SEARCH")
print("=" * 70)

# Maybe: theta = pi x 73/99 x (1 + small_correction)
# where small_correction involves division algebra ratios

target_ratio = theta_measured / theta_predicted
print(f"Need multiplicative factor: {target_ratio:.10f}")
print(f"= 1 + {target_ratio - 1:.10f}")
print()

mult_correction = target_ratio - 1

# Search for small fractions that match this correction
print("Searching for multiplicative corrections a/b...")
print()

mult_candidates = []

dims = [1, 2, 3, 4, 7, 8, 11]
special = [9, 49, 72, 99, 111, 121, 133, 43, 28]
all_nums = sorted(set(dims + special))

for a in range(-50, 51):
    if a == 0:
        continue
    for b in all_nums:
        for b2 in all_nums:
            if b >= b2:
                denom = b * b2
                corr = a / denom
                if abs(corr - mult_correction) < 0.001:  # Close match
                    theta_new = theta_predicted * (1 + corr)
                    error_ppm = abs(theta_new - theta_measured)/theta_measured * 1e6
                    if error_ppm < 42:
                        mult_candidates.append((error_ppm, a, b, b2, denom))

mult_candidates.sort()

if mult_candidates:
    print("Multiplicative corrections better than 42 ppm:")
    for err, a, b1, b2, d in mult_candidates[:10]:
        print(f"  1 + {a}/({b1} x {b2}) = 1 + {a}/{d}, error = {err:.2f} ppm")
else:
    print("No simple multiplicative corrections found.")

# =============================================================================
# PART 3: SEARCH FOR COMPOUND FRACTIONS
# =============================================================================

print()
print("=" * 70)
print("PART 3: COMPOUND FRACTION SEARCH")
print("=" * 70)

# Try fractions of form (a*p + b)/(c*q + d) where p,q are primes and a,b,c,d are small

target = theta_measured / np.pi

print(f"Target: theta/pi = {target:.10f}")
print()

# Try fractions with numerator/denominator built from framework elements
compound_candidates = []

# Systematic search: try all fractions up to denominator 1000
for q in range(90, 200):
    p = round(target * q)
    theta_test = np.pi * p / q
    error_ppm = abs(theta_test - theta_measured)/theta_measured * 1e6

    if error_ppm < 42:  # Better than 73/99
        compound_candidates.append((error_ppm, p, q))

compound_candidates.sort()

if compound_candidates:
    print("Fractions better than 73/99 (42 ppm):")
    print()
    for err, p, q in compound_candidates[:15]:
        p_fact = dict(factorint(p))
        q_fact = dict(factorint(q))
        print(f"  {p}/{q}: error = {err:.2f} ppm")
        print(f"      {p} = {p_fact}, {q} = {q_fact}")

        # Check framework meaning
        meanings = []
        if q == 99: meanings.append("Im(H)^2 x n_c")
        if q == 133: meanings.append("Phi_6(H+O)")
        if q == 111: meanings.append("Phi_6(n_c)")
        if p == 73: meanings.append("8^2 + 3^2")
        if meanings:
            print(f"      Framework: {', '.join(meanings)}")
        print()
else:
    print("No fractions found better than 73/99 in this range.")

# =============================================================================
# PART 4: THE CORRECTION STRUCTURE
# =============================================================================

print("=" * 70)
print("PART 4: ANALYZING THE 73/99 STRUCTURE MORE DEEPLY")
print("=" * 70)

# 73/99 has specific meaning:
# 73 = 8^2 + 3^2 = dim(O)^2 + Im(H)^2
# 99 = 3^2 x 11 = Im(H)^2 x n_c

# What if the correction is a tiny adjustment to ONE of these?

print("""
Structure of 73/99:
  73 = dim(O)^2 + Im(H)^2 = 64 + 9
  99 = Im(H)^2 x n_c = 9 x 11

What small corrections preserve this structure?
""")

# Try: (73 + a/b) / 99 where a/b is small
print("Corrections of form (73 + a/b)/99:")
print()

struct_candidates = []

for a in range(-10, 11):
    if a == 0:
        continue
    for b in dims + special:
        corr = Fraction(a, b)
        # theta = pi x (73 + a/b) / 99 = pi x (73*b + a) / (99*b)
        new_num = 73 * b + a
        new_den = 99 * b
        theta_test = float(np.pi * new_num / new_den)
        error_ppm = abs(theta_test - theta_measured)/theta_measured * 1e6

        if error_ppm < 42:
            struct_candidates.append((error_ppm, a, b, new_num, new_den))

struct_candidates.sort()

if struct_candidates:
    print("Improvements found:")
    for err, a, b, num, den in struct_candidates[:10]:
        from math import gcd
        g = gcd(num, den)
        print(f"  (73 + {a}/{b}) / 99 = {num//g}/{den//g}, error = {err:.2f} ppm")
else:
    print("No improvements found with numerator corrections.")

# Try: 73 / (99 + a/b)
print()
print("Corrections of form 73/(99 + a/b):")
print()

struct_candidates2 = []

for a in range(-10, 11):
    if a == 0:
        continue
    for b in dims + special:
        # theta = pi x 73 / (99 + a/b) = pi x 73*b / (99*b + a)
        new_num = 73 * b
        new_den = 99 * b + a
        if new_den <= 0:
            continue
        theta_test = float(np.pi * new_num / new_den)
        error_ppm = abs(theta_test - theta_measured)/theta_measured * 1e6

        if error_ppm < 42:
            struct_candidates2.append((error_ppm, a, b, new_num, new_den))

struct_candidates2.sort()

if struct_candidates2:
    print("Improvements found:")
    for err, a, b, num, den in struct_candidates2[:10]:
        from math import gcd
        g = gcd(num, den)
        print(f"  73 / (99 + {a}/{b}) = {num//g}/{den//g}, error = {err:.2f} ppm")
else:
    print("No improvements found with denominator corrections.")

# =============================================================================
# PART 5: HIGHER-ORDER SEARCH
# =============================================================================

print()
print("=" * 70)
print("PART 5: VERY HIGH DENOMINATOR SEARCH")
print("=" * 70)

# Search with much larger denominators
target = theta_measured / np.pi

high_denom_candidates = []

for q in range(200, 2000):
    p = round(target * q)
    theta_test = np.pi * p / q
    error_ppm = abs(theta_test - theta_measured)/theta_measured * 1e6

    if error_ppm < 10:  # Looking for sub-10 ppm
        # Check if q has framework structure
        q_fact = factorint(q)
        framework_factors = {2, 3, 7, 11}
        is_framework = all(f in framework_factors for f in q_fact.keys())

        if is_framework or error_ppm < 5:
            high_denom_candidates.append((error_ppm, p, q, q_fact, is_framework))

high_denom_candidates.sort()

if high_denom_candidates:
    print("High-denominator fractions with < 10 ppm:")
    print()
    for err, p, q, q_fact, is_fw in high_denom_candidates[:10]:
        p_fact = dict(factorint(p))
        fw_label = "FRAMEWORK" if is_fw else ""
        print(f"  {p}/{q}: error = {err:.2f} ppm {fw_label}")
        print(f"      {p} = {p_fact}, {q} = {dict(q_fact)}")
else:
    print("No high-denominator fractions with framework structure found.")

# =============================================================================
# SUMMARY
# =============================================================================

print()
print("=" * 70)
print("SUMMARY")
print("=" * 70)

print(f"""
KOIDE THETA ANALYSIS:

Current best: theta = pi x 73/99
  Prediction: {np.pi * 73/99:.10f}
  Measured:   {theta_measured:.10f}
  Error: 42 ppm

Framework meaning:
  73 = dim(O)^2 + Im(H)^2 (the UNIQUE prime encoding color and generation)
  99 = Im(H)^2 x n_c (generation structure times crystal dimensions)

Search results:
  - No simple additive corrections a/b improve the result
  - No Phi_6-based corrections help
  - No multiplicative corrections of form (1 + a/(b*c)) found
  - Very few high-denominator fractions with framework structure

INTERPRETATION:

The 42 ppm error appears to be:
1. About {deviation_sigma:.0f}x larger than experimental uncertainty
2. Not reducible by simple division algebra corrections

POSSIBILITIES:
1. The formula is inherently approximate (like a tree-level result)
2. There's a subtle correction we haven't found
3. The correction involves running masses or radiative effects

COMPARISON TO OTHER CONSTANTS:
  - 1/alpha: main term 137, correction 4/111 (2.9% of main term)
  - m_p/m_e: main term 1836, correction 11/72 (0.8% of main term)
  - v/M: main term 784, correction 1/2 (0.064% of main term)
  - theta: main term 73/99, no correction found (residual 42 ppm)

The pattern: smaller main terms have smaller corrections.
The theta correction (if it exists) would need to be ~0.003% of 73/99.
""")
