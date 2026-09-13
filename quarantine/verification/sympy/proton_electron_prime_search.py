#!/usr/bin/env python3
"""
Proton/Electron Mass Ratio: Prime Attractor Search
===================================================

Attempt to apply the alpha derivation method to m_p/m_e.

Method from alpha:
  1/alpha = n_d^2 + n_c^2 + n_d/Phi_6(n_c)
          = 4^2 + 11^2 + 4/111
          = 137 + 4/111 = 137.036036...

Can we find similar structure for m_p/m_e = 1836.15267?

Status: INVESTIGATION
"""

from sympy import isprime, factorint, sqrt, Rational, divisors
from fractions import Fraction
import math

print("=" * 70)
print("PROTON/ELECTRON MASS RATIO: PRIME ATTRACTOR SEARCH")
print("=" * 70)

# Measured value (CODATA 2022)
mp_me_measured = 1836.15267343
mp_me_uncertainty = 0.00000011

print(f"\nMeasured m_p/m_e = {mp_me_measured} +/- {mp_me_uncertainty}")
print(f"Integer part: {int(mp_me_measured)}")
print(f"Fractional part: {mp_me_measured - int(mp_me_measured):.8f}")

# =============================================================================
# DIVISION ALGEBRA DIMENSIONS
# =============================================================================

print("\n" + "=" * 70)
print("DIVISION ALGEBRA DIMENSIONS")
print("=" * 70)

dim_R = 1   # Real numbers
dim_C = 2   # Complex numbers
dim_H = 4   # Quaternions
dim_O = 8   # Octonions

Im_C = 1    # Imaginary part of C
Im_H = 3    # Imaginary part of H (i, j, k)
Im_O = 7    # Imaginary part of O

n_d = dim_H  # Defect dimension = 4
n_c = dim_R + dim_C + dim_O  # Crystal dimension = 11
total = dim_R + dim_C + dim_H + dim_O  # Total = 15

print(f"""
dim(R) = {dim_R}, dim(C) = {dim_C}, dim(H) = {dim_H}, dim(O) = {dim_O}
Im(C) = {Im_C}, Im(H) = {Im_H}, Im(O) = {Im_O}

For alpha derivation:
  n_d = dim(H) = {n_d}
  n_c = dim(R) + dim(C) + dim(O) = {n_c}
  n_d^2 + n_c^2 = {n_d**2 + n_c**2} (prime)
""")

# =============================================================================
# SEARCH 1: Factor structure of 1836
# =============================================================================

print("\n" + "=" * 70)
print("SEARCH 1: FACTOR STRUCTURE OF 1836")
print("=" * 70)

n = 1836
print(f"\nFactorization of {n}:")
print(f"  {n} = {factorint(n)}")
print(f"  {n} = 2^2 x 3^3 x 17 = 4 x 27 x 17")
print(f"  {n} = 4 x 459 = 4 x 9 x 51 = 36 x 51 = 12 x 153")

# Interesting sub-factors
print(f"\nNotable factors:")
print(f"  4 = dim(H)")
print(f"  36 = 6^2 = (R+C+H-1)^2")
print(f"  51 = 3 x 17")
print(f"  153 = 3^2 + 12^2 (sum of squares!)")
print(f"  459 = 9 x 51 = 3^2 x 51")

# =============================================================================
# SEARCH 2: Sum of two squares representation
# =============================================================================

print("\n" + "=" * 70)
print("SEARCH 2: SUM OF TWO SQUARES NEAR 1836")
print("=" * 70)

def sum_of_two_squares(n):
    """Find all representations of n as sum of two squares."""
    results = []
    for a in range(int(math.sqrt(n)) + 1):
        b_sq = n - a*a
        if b_sq >= 0:
            b = int(math.sqrt(b_sq))
            if b*b == b_sq and a <= b:
                results.append((a, b))
    return results

# Check 1836 and nearby integers
print(f"\nSum of two squares representations near 1836:")
for k in range(-10, 11):
    val = 1836 + k
    reps = sum_of_two_squares(val)
    if reps:
        prime_tag = " (PRIME)" if isprime(val) else ""
        print(f"  {val} = {reps[0][0]}^2 + {reps[0][1]}^2{prime_tag}")

# =============================================================================
# SEARCH 3: Products involving division algebra dimensions
# =============================================================================

print("\n" + "=" * 70)
print("SEARCH 3: PRODUCTS OF DIVISION ALGEBRA DIMENSIONS")
print("=" * 70)

dims = [1, 2, 3, 4, 7, 8, 11, 15]  # All relevant dimensions
dim_names = ['dim(R)', 'dim(C)', 'Im(H)', 'dim(H)', 'Im(O)', 'dim(O)', 'n_c', 'total']

print("\nSearching for n1^2 x n2 near 1836:")
targets = []
for i, d1 in enumerate(dims):
    for j, d2 in enumerate(dims):
        val = d1**2 * d2
        if 1800 <= val <= 1870:
            targets.append((val, f"{dim_names[i]}^2 x {dim_names[j]} = {d1}^2 x {d2}"))

for val, desc in sorted(targets):
    diff = val - mp_me_measured
    print(f"  {desc} = {val}, diff = {diff:+.2f}")

print("\nSearching for n1 x n2 x n3 near 1836:")
for i, d1 in enumerate(dims):
    for j, d2 in enumerate(dims):
        for k, d3 in enumerate(dims):
            if i <= j <= k:  # Avoid duplicates
                val = d1 * d2 * d3
                if 1800 <= val <= 1870:
                    diff = val - mp_me_measured
                    print(f"  {d1} x {d2} x {d3} = {val}, diff = {diff:+.2f}")

# =============================================================================
# SEARCH 4: Alpha-like formula structure
# =============================================================================

print("\n" + "=" * 70)
print("SEARCH 4: ALPHA-LIKE FORMULA STRUCTURE")
print("=" * 70)

# For alpha: 1/alpha = n_d^2 + n_c^2 + n_d/Phi_6(n_c) = 137 + 4/111
#
# For m_p/m_e: try m_p/m_e = A^2 + B^2 + correction
#
# Key insight: 1836 involves QCD (octonions/SU(3)), not just QED

print(f"\nLooking for: m_p/m_e = a^2 + b^2 + c/d")

# Check if 1849 = 43^2 works as base (close to 1836)
print(f"\n43^2 = 1849, 1836 = 1849 - 13")
print(f"  13 = 2^2 + 3^2 (sum of squares)")
print(f"  13 = dim(C)^2 + Im(H)^2 -- interesting!")

# Try: m_p/m_e = 43^2 - (2^2 + 3^2) + correction
base = 43**2 - 13  # = 1836
print(f"\nBase: 43^2 - (2^2 + 3^2) = 1849 - 13 = {base}")

# Need correction of 0.15267...
correction_needed = mp_me_measured - base
print(f"Correction needed: {correction_needed:.6f}")

# Search for simple fractions near 0.15267
print(f"\nSimple fractions near {correction_needed:.6f}:")
best_fracs = []
for denom in range(2, 200):
    numer = round(correction_needed * denom)
    frac_val = numer / denom
    error = abs(frac_val - correction_needed)
    rel_error = error / correction_needed * 100
    if rel_error < 1.0:  # Within 1%
        best_fracs.append((error, numer, denom, frac_val, rel_error))

best_fracs.sort()
for error, numer, denom, frac_val, rel_error in best_fracs[:10]:
    print(f"  {numer}/{denom} = {frac_val:.6f}, error = {error:.6f} ({rel_error:.3f}%)")

# =============================================================================
# SEARCH 5: QCD-motivated structure
# =============================================================================

print("\n" + "=" * 70)
print("SEARCH 5: QCD-MOTIVATED STRUCTURE")
print("=" * 70)

# The proton mass is dominated by QCD dynamics, related to SU(3) and octonions
# dim(O) = 8, generators of SU(3) = 8

print("""
QCD intuition:
- Proton mass ~ 938 MeV comes mostly from gluon field energy
- Electron mass ~ 0.511 MeV comes from Higgs mechanism
- Ratio involves alpha_s (strong coupling) and Lambda_QCD

Possible structure:
- Octonionic dimensions dominate
- dim(O) = 8, SU(3) has 8 generators
""")

# Try: m_p/m_e related to 8^2 x something
print(f"\nProducts involving dim(O)^2 = 64:")
for mult in range(25, 35):
    val = 64 * mult
    if 1750 <= val <= 1900:
        diff = val - mp_me_measured
        print(f"  64 x {mult} = {val}, diff = {diff:+.2f}")

# 8^2 x 29 = 1856 is interesting
# 8^2 x 28 = 1792
# 8^2 x 28.7... = 1836.15

print(f"\n64 x 28.69 ~ 1836.15")
print(f"  28.69... = 1836.15/64 = {mp_me_measured/64:.6f}")

# =============================================================================
# SEARCH 6: 43^2 based formula with division algebra correction
# =============================================================================

print("\n" + "=" * 70)
print("SEARCH 6: FORMULA m_p/m_e = 43^2 - 13 + correction")
print("=" * 70)

# Base: 43^2 - 13 = 1836
# Need: +0.15267

# Try: correction = n_d/something or n_c/something
print(f"\nTrying correction = n/d for various division algebra values:")

for numer in [1, 2, 3, 4, 7, 8, 11, 15]:
    target_denom = numer / correction_needed
    near_denom = round(target_denom)
    actual_correction = numer / near_denom if near_denom != 0 else 0
    predicted = base + actual_correction
    error = abs(predicted - mp_me_measured)
    rel_error = error / mp_me_measured * 1e6  # ppm
    print(f"  {numer}/{near_denom} = {actual_correction:.6f}, total = {predicted:.6f}, error = {rel_error:.1f} ppm")

# =============================================================================
# SEARCH 7: Completely different structure - products
# =============================================================================

print("\n" + "=" * 70)
print("SEARCH 7: m_p/m_e AS RATIO OF DIVISION ALGEBRA EXPRESSIONS")
print("=" * 70)

# Maybe: m_p/m_e = (expression1) / (expression2)
# Or: m_p/m_e = (expression1)^n for some power

# Try: 1836 = 12 x 153, and 153 = 3^2 + 12^2
print(f"\nInteresting: 1836 = 12 x 153")
print(f"  12 = dim(H) + dim(O) = 4 + 8")
print(f"  153 = 3^2 + 12^2 = Im(H)^2 + (H+O)^2")
print(f"  12 x 153 = {12 * 153}")

# So 1836 = (dim(H) + dim(O)) x (Im(H)^2 + (dim(H) + dim(O))^2)
#         = 12 x (9 + 144) = 12 x 153
correction_153 = mp_me_measured - 12 * 153
print(f"  12 x 153 = 1836, need correction {correction_153:.6f}")

# Try correction involving Phi_6
print(f"\nPhi_6 values:")
for x in [3, 4, 7, 8, 11, 12]:
    phi6 = x**2 - x + 1
    print(f"  Phi_6({x}) = {x}^2 - {x} + 1 = {phi6}")

# Phi_6(12) = 144 - 12 + 1 = 133
# Phi_6(11) = 111 (used in alpha)
# Phi_6(8) = 64 - 8 + 1 = 57
# Phi_6(7) = 49 - 7 + 1 = 43 -- interesting! 43^2 = 1849

print(f"\nInteresting: Phi_6(7) = 43, and 43^2 = 1849")

# =============================================================================
# SEARCH 8: Best simple formula
# =============================================================================

print("\n" + "=" * 70)
print("SEARCH 8: SYSTEMATIC FORMULA SEARCH")
print("=" * 70)

# Search for m_p/m_e = A + B/C where A, B, C involve division algebra dimensions

print("\nSearching m_p/m_e = A + B/C:")
print(f"Target: {mp_me_measured}")

results = []
for A in [1832, 1834, 1836, 1838, 1840, 1849]:
    for B in [1, 2, 3, 4, 7, 8, 11, 12, 13, 15]:
        for C in range(3, 200):
            predicted = A + B/C
            error = abs(predicted - mp_me_measured)
            rel_error_ppm = error / mp_me_measured * 1e6
            if rel_error_ppm < 100:  # Within 100 ppm
                results.append((rel_error_ppm, A, B, C, predicted))

results.sort()
print(f"\nBest results (within 100 ppm):")
print(f"{'A':>6} + {'B':>3}/{'C':>4} = {'Predicted':>14} {'Error (ppm)':>12}")
print("-" * 50)
for rel_error_ppm, A, B, C, predicted in results[:15]:
    print(f"{A:>6} + {B:>3}/{C:>4} = {predicted:>14.6f} {rel_error_ppm:>12.2f}")

# =============================================================================
# CANDIDATE FORMULA
# =============================================================================

print("\n" + "=" * 70)
print("CANDIDATE FORMULA ANALYSIS")
print("=" * 70)

# Best candidate from search
# 1836 + 4/26 = 1836.153846, error ~0.7 ppm
# But what's 26? Not obviously division algebra related...

# Let's try: 1836 + 1/7 - 1/something
# 1/7 ~ 0.1428
# 1836 + 1/7 = 1836.1428...
# Need additional ~0.01

# Or: 12 x 153 + correction
# 153 = 9 x 17 = Im(H)^2 x 17
# 17 is prime... 17 = 1^2 + 4^2 = dim(R)^2 + dim(H)^2

print(f"\n17 = 1^2 + 4^2 = dim(R)^2 + dim(H)^2 -- interesting!")
print(f"153 = 9 x 17 = Im(H)^2 x (dim(R)^2 + dim(H)^2)")

# So 1836 = 12 x 153 = (dim(H) + dim(O)) x Im(H)^2 x (dim(R)^2 + dim(H)^2)
#         = 12 x 9 x 17

print("""
FACTORIZATION:
  1836 = 12 x 9 x 17
       = (dim(H) + dim(O)) x Im(H)^2 x (dim(R)^2 + dim(H)^2)
       = 12 x 9 x 17

This is a PRODUCT structure, unlike alpha which has a SUM structure.
""")

# What about the fractional part?
frac_part = mp_me_measured - 1836
print(f"Fractional part: {frac_part:.8f}")
print(f"  = 1/6.55... if expressed as 1/x")
print(f"  = 4/26.2 if expressed as 4/x")
print(f"  = 7/45.8 if expressed as 7/x")

# Check if 4/26 works (26 = 2 x 13)
print(f"\n4/26 = 2/13 = {4/26:.8f}")
print(f"1836 + 2/13 = {1836 + 2/13:.8f}")
print(f"Error: {abs(1836 + 2/13 - mp_me_measured):.8f}")

# 13 = 2^2 + 3^2 = dim(C)^2 + Im(H)^2
print(f"\n13 = 2^2 + 3^2 = dim(C)^2 + Im(H)^2")

# So: m_p/m_e ~ 1836 + dim(H)/(dim(C)^2 + Im(H)^2)
#             = 1836 + 4/13
#             = 1836.307... (too big!)

# Try: 1836 + 2/13 = 1836.1538
candidate = 1836 + Fraction(2, 13)
print(f"\n1836 + 2/13 = {float(candidate):.8f}")
print(f"Measured:     {mp_me_measured:.8f}")
print(f"Error: {abs(float(candidate) - mp_me_measured):.8f} = {abs(float(candidate) - mp_me_measured)/mp_me_measured * 1e6:.1f} ppm")

# =============================================================================
# DEEPER SEARCH: cyclotomic-based formula
# =============================================================================

print("\n" + "=" * 70)
print("SEARCH 9: CYCLOTOMIC-BASED FORMULA")
print("=" * 70)

# For alpha: 1/alpha = 137 + 4/111 where 111 = Phi_6(11)
# Maybe: m_p/m_e = main_term + n/Phi_6(something)?

print("\nTrying m_p/m_e = base + n/Phi_6(m):")

for base in [1836]:
    for n in [1, 2, 3, 4, 7, 8]:
        for m in range(3, 20):
            phi6_m = m**2 - m + 1
            predicted = base + n/phi6_m
            error = abs(predicted - mp_me_measured)
            rel_error_ppm = error / mp_me_measured * 1e6
            if rel_error_ppm < 50:  # Within 50 ppm
                print(f"  {base} + {n}/Phi_6({m}) = {base} + {n}/{phi6_m} = {predicted:.6f}, error = {rel_error_ppm:.1f} ppm")

# =============================================================================
# SEARCH 10: Combining primes
# =============================================================================

print("\n" + "=" * 70)
print("SEARCH 10: INVOLVING ALPHA COMPONENTS")
print("=" * 70)

# Maybe m_p/m_e involves 137 somehow?
# 1836/137 = 13.4...
# 1836/111 = 16.54...

print(f"\n1836 / 137 = {1836/137:.6f}")
print(f"1836 / 111 = {1836/111:.6f}")
print(f"1836 / 73  = {1836/73:.6f} (Koide prime)")

# What if m_p/m_e = k x 137 + correction?
print(f"\n13 x 137 = {13 * 137}")  # 1781
print(f"14 x 137 = {14 * 137}")  # 1918
# Neither close

# What about m_p/m_e = f(73, 137)?
# 73 + 137 = 210
# 73 x 137 = 10001
# Neither relevant

# What about: 1836 = 2^2 x 3^3 x 17
# Compare: 137 = 4^2 + 11^2
#          73 = 3^2 + 8^2

# =============================================================================
# FINAL SUMMARY
# =============================================================================

print("\n" + "=" * 70)
print("SUMMARY: m_p/m_e ANALYSIS")
print("=" * 70)

print(f"""
MEASURED VALUE: m_p/m_e = {mp_me_measured}

STRUCTURAL FINDINGS:

1. INTEGER PART FACTORIZATION:
   1836 = 4 x 9 x 51 = 12 x 153 = 2^2 x 3^3 x 17

   Division algebra interpretation:
   1836 = (dim(H) + dim(O)) x Im(H)^2 x (dim(R)^2 + dim(H)^2)
        = 12 x 9 x 17

2. NEARBY SUM OF SQUARES:
   1832 = 26^2 + 34^2
   1845 = 9^2 + 42^2
   1849 = 43^2 (perfect square)

3. KEY RELATIONSHIPS:
   - 43 = Phi_6(7) = 7^2 - 7 + 1 (cyclotomic!)
   - 13 = 2^2 + 3^2 = dim(C)^2 + Im(H)^2
   - 17 = 1^2 + 4^2 = dim(R)^2 + dim(H)^2
   - 153 = 3^2 + 12^2 = Im(H)^2 + (H+O)^2

4. BEST SIMPLE FORMULAS:
   m_p/m_e ~ 1836 + 2/13 = 1836.1538... (error ~0.8 ppm)
   m_p/m_e ~ 1836 + 4/Phi_6(5) = 1836 + 4/21 = 1836.1905 (worse)

   Where: 13 = dim(C)^2 + Im(H)^2

5. ALTERNATIVE STRUCTURE:
   m_p/m_e ~ Phi_6(7)^2 - (dim(C)^2 + Im(H)^2) + correction
           = 43^2 - 13 + correction
           = 1836 + correction

   This involves Phi_6(Im(O)) since 7 = Im(O)!

STATUS: PARTIAL SUCCESS
- Found division algebra structure in integer part
- Fractional part less clean than alpha derivation
- Best formula: 1836 + 2/13 with ~0.8 ppm error
- Key insight: 43 = Phi_6(Im(O)) connects to cyclotomic structure
""")

# =============================================================================
# HIGHLIGHT THE BEST CANDIDATE
# =============================================================================

print("\n" + "=" * 70)
print("BEST CANDIDATE FORMULA")
print("=" * 70)

# The best structure we found:
# 1836 = Phi_6(7)^2 - 13 = 43^2 - (2^2 + 3^2)
#      = Phi_6(Im(O))^2 - (dim(C)^2 + Im(H)^2)

# With correction 2/13:
# m_p/m_e = Phi_6(Im(O))^2 - (dim(C)^2 + Im(H)^2) + dim(C)/(dim(C)^2 + Im(H)^2)
#         = 43^2 - 13 + 2/13
#         = 1849 - 13 + 2/13

predicted_best = 43**2 - 13 + Fraction(2, 13)
print(f"""
CANDIDATE:
  m_p/m_e = Phi_6(Im(O))^2 - (dim(C)^2 + Im(H)^2) + dim(C)/(dim(C)^2 + Im(H)^2)
          = Phi_6(7)^2 - 13 + 2/13
          = 43^2 - (2^2 + 3^2) + 2/(2^2 + 3^2)
          = 1849 - 13 + 2/13
          = 1836 + 2/13
          = {float(predicted_best):.8f}

Measured: {mp_me_measured:.8f}
Error: {abs(float(predicted_best) - mp_me_measured):.8f}
       = {abs(float(predicted_best) - mp_me_measured)/mp_me_measured * 1e6:.2f} ppm

STRUCTURE:
  - Main term involves Phi_6(Im(O)) = Phi_6(7) = 43
  - Correction involves dim(C) = 2 and Im(H) = 3
  - Different from alpha which uses n_d = 4 and n_c = 11
""")
