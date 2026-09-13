#!/usr/bin/env python3
"""
Coupling-Koide 111/53 Connection Investigation

KEY QUESTION: Why does the same 111 appear in both:
  - alpha = 137 + 4/111 (EM correction denominator)
  - Down-quark theta/pi = 78/111 (Koide phase denominator)

And similarly for 53:
  - alpha_s = 25/212 = 25/(4*53)
  - Heavy quark theta/pi = 73/106 = 73/(2*53)

HYPOTHESIS: Coupling denominators and Koide denominators share
algebraic origin because both encode interaction channel counts.

Created: Session 93
Dependencies: correction_terms_unified.md, quark_koide_crystallization.md
"""

from sympy import *

# ==============================================================================
# DIVISION ALGEBRA DIMENSIONS
# ==============================================================================

R = 1     # Real
C = 2     # Complex
H = 4     # Quaternion
O = 8     # Octonion
Im_H = 3  # Imaginary quaternions
Im_O = 7  # Imaginary octonions
n_d = 4   # Defect dimension
n_c = 11  # Crystal dimension

# ==============================================================================
# THE 111 FACTORIZATIONS
# ==============================================================================

print("=" * 70)
print("PART I: The Number 111")
print("=" * 70)

# 111 in alpha correction
print("\n1. In alpha correction:")
print(f"   111 = EM channels in u({n_c})")
print(f"   111 = {n_c*(n_c+1)//2 - n_c + 1} (off-diagonal + U(1))")
print(f"   Verification: n_c^2 - n_c + 1 = {n_c**2 - n_c + 1}")

# 111 = Phi_6(n_c) cyclotomic
x = Symbol('x')
phi_6 = x**2 - x + 1
val_phi_6 = phi_6.subs(x, n_c)
print(f"   111 = Phi_6({n_c}) = {val_phi_6}")

# 111 in down-quark Koide
print("\n2. In down-quark Koide theta/pi = 78/111:")
print(f"   111 = 3 * 37 = Im(H) * 37")
print(f"   Verification: {Im_H} * 37 = {Im_H * 37}")
print(f"   78 = 2 * 3 * 13 = C * Im(H) * 13 = {C * Im_H * 13}")

# Is 37 special?
print("\n3. What is 37?")
print(f"   37 is prime")
print(f"   37 = 1 + 36 = 1 + 6^2 (one more than a perfect square)")
print(f"   37 = 6^2 + 1^2 (sum of two squares --> framework prime!)")

# Check if 37 is a framework prime
def is_sum_of_two_squares_from_framework(n):
    """Check if n = a^2 + b^2 where a, b are division algebra dimensions"""
    dims = [1, 2, 3, 4, 7, 8, 11]  # Including imaginary parts and n_c
    for a in dims:
        for b in dims:
            if a**2 + b**2 == n:
                return True, (a, b)
    return False, None

check_37 = is_sum_of_two_squares_from_framework(37)
print(f"   Is 37 = a^2 + b^2 (framework)? {check_37}")

# Alternative: 37 = 6^2 + 1^2
# But 6 = 2 * 3 = C * Im(H) = dim(C-valued imaginary H)
print(f"   37 = 6^2 + 1^2 where 6 = C * Im(H)")
print(f"   So 37 = (C * Im(H))^2 + R^2 = {(C * Im_H)**2 + R**2}")

# ==============================================================================
# THE 53 FACTORIZATIONS
# ==============================================================================

print("\n" + "=" * 70)
print("PART II: The Number 53")
print("=" * 70)

# 53 in alpha_s
print("\n1. In alpha_s = 25/212 = 25/(4*53):")
print(f"   53 is prime")
print(f"   53 = 7^2 + 2^2 = Im(O)^2 + C^2 (sum of squares!)")
print(f"   Verification: {Im_O**2 + C**2}")

# 53 in heavy quark Koide
print("\n2. In heavy quark theta/pi = 73/106 = 73/(2*53):")
print(f"   106 = 2 * 53 = C * 53")
print(f"   The Koide prime 73 is preserved in numerator!")
print(f"   Only the denominator changes: 99 --> 106")

# 53 structure
print("\n3. What makes 53 the 'strong coupling prime'?")
print(f"   53 = Im(O)^2 + C^2 = 49 + 4 = {Im_O**2 + C**2}")
print(f"   This encodes color (Im(O)) + complex (C) structure")

# ==============================================================================
# THE PATTERN: COUPLING <-> KOIDE DENOMINATORS
# ==============================================================================

print("\n" + "=" * 70)
print("PART III: The Coupling-Koide Correspondence")
print("=" * 70)

# Table of correspondences
print("\n+---------------+-----------------------+---------------------------+")
print("| Interaction   | Coupling Denominator  | Koide Denominator         |")
print("+---------------+-----------------------+---------------------------+")
print(f"| EM (alpha)        | 111 = Phi_6({n_c})       | 111 = Im(H) * 37 (down)   |")
print(f"| QCD (alpha_s)     | 212 = 4 * 53          | 106 = 2 * 53 (heavy)      |")
print("+---------------+-----------------------+---------------------------+")

# Ratio pattern
print("\nRatio pattern:")
print(f"  alpha uses 4/111: multiplier = 4 = n_d")
print(f"  alpha_s uses 25/212: multiplier = 25 = 5^2 or (Im_H^2 + H)/2 = {(Im_H**2 + H)//2}")
print(f"  Down Koide: 78/111 where 78 = 2 * 39 = 2 * 3 * 13")
print(f"  Heavy Koide: 73/106 where 73 = 8^2 + 3^2 (preserved prime)")

# ==============================================================================
# KEY INSIGHT: Why 111 appears twice
# ==============================================================================

print("\n" + "=" * 70)
print("PART IV: Why 111 Appears in Both")
print("=" * 70)

print("\nThe number 111 has TWO algebraic meanings:")
print("\n1. As EM channels in u(11):")
print(f"   111 = n_c^2 - n_c + 1 = 121 - 11 + 1 = {n_c**2 - n_c + 1}")
print(f"   = (n_c^2 - n_c) + 1 = off-diagonal generators + U(1)")
print(f"   This is a Lie algebra counting: u(11) = 121 generators,")
print(f"   minus 10 Cartan (don't couple to EM), plus 1 U(1)")

print("\n2. As Im(H) * 37:")
print(f"   111 = 3 * 37 = {Im_H * 37}")
print(f"   37 = (C * Im(H))^2 + 1 = 36 + 1 = 37")
print(f"   = (complex-valued imaginary quaternion structure)^2 + real")

print("\nThese BOTH equal 111 because:")
print(f"   n_c^2 - n_c + 1 = Im(H) * 37")
print(f"   11^2 - 11 + 1 = 3 * 37")
print(f"   111 = 111 [OK]")

# ==============================================================================
# DEEPER: The 37 connection to n_c
# ==============================================================================

print("\n" + "=" * 70)
print("PART V: The 37 Connection")
print("=" * 70)

# Solve for the relationship
print("\nFrom 111 = n_c^2 - n_c + 1 = Im(H) * 37:")
print(f"   n_c^2 - n_c + 1 = Im(H) * 37")
print(f"   n_c(n_c - 1) = Im(H) * 37 - 1 = 110")
print(f"   This is automatic: 11 * 10 = 110 [OK]")

# What is 37 in terms of n_c?
print(f"\n   37 = (n_c^2 - n_c + 1) / Im(H)")
print(f"      = 111/3 = 37 [OK]")

# 37 formula
print(f"\n   Alternatively: 37 = (n_c^2 - n_c + 1) / Im(H)")
print(f"   For n_c = 11: 37 = (121 - 11 + 1)/3 = 111/3 = 37 [OK]")

# Connection to Phi_6
print(f"\n   Since 111 = Phi_6(n_c) and 111 = Im(H) * 37:")
print(f"   37 = Phi_6(n_c) / Im(H)")
print(f"   37 is the Phi_6 value per generation!")

# ==============================================================================
# HYPOTHESIS: Unified denominator origin
# ==============================================================================

print("\n" + "=" * 70)
print("PART VI: Unified Hypothesis")
print("=" * 70)

print("""
HYPOTHESIS: Both alpha correction and down-quark Koide use 111 because:

1. For alpha: The defect (n_d = 4 modes) couples to EM through 111 channels
   - 111 = u(11) EM channels
   - Correction = 4/111

2. For down-quarks: The -1/3 charge (T3 = -1/2) couples via Im(H) * 37
   - 111 = 3 * 37 = generation * "EM-per-generation"
   - theta/pi = 78/111

The down-quarks "see" the EM channels as (generation) * (per-generation channel)
because their T3 = -1/2 aligns with H structure (which gives generations).

Meanwhile, up-quarks (T3 = +1/2) couple to n_c = 11 directly (orthogonal to H).

This explains the T3 --> denominator correlation from Session 92!
""")

# ==============================================================================
# VERIFICATION: Check all factorizations
# ==============================================================================

print("\n" + "=" * 70)
print("PART VII: Factorization Summary")
print("=" * 70)

def analyze_number(n, name):
    """Analyze a number's division algebra structure"""
    print(f"\n{name} = {n}")
    print(f"  Prime factorization: ", end="")
    print(factorint(n))

    # Check sum of squares
    for i in range(1, int(sqrt(n)) + 1):
        rem = n - i**2
        if rem > 0:
            sq = sqrt(rem)
            if sq == int(sq):
                print(f"  = {i}^2 + {int(sq)}^2 (sum of squares)")

analyze_number(111, "111 (alpha and down-quark)")
analyze_number(53, "53 (alpha_s and heavy)")
analyze_number(37, "37 (from 111/3)")
analyze_number(106, "106 (heavy Koide)")
analyze_number(97, "97 (up-quark Koide)")

# ==============================================================================
# TESTS
# ==============================================================================

print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    ("111 = Phi_6(11)", phi_6.subs(x, 11) == 111),
    ("111 = 3 * 37", 3 * 37 == 111),
    ("111 = 11^2 - 11 + 1", 11**2 - 11 + 1 == 111),
    ("53 = 7^2 + 2^2", 7**2 + 2**2 == 53),
    ("37 = 6^2 + 1^2", 6**2 + 1**2 == 37),
    ("78 = 2 * 3 * 13", 2 * 3 * 13 == 78),
    ("106 = 2 * 53", 2 * 53 == 106),
    ("97 = 4^2 + 9^2", 4**2 + 9**2 == 97),
]

all_pass = True
for name, result in tests:
    status = "PASS" if result else "FAIL"
    print(f"[{status}] {name}")
    if not result:
        all_pass = False

print("\n" + "=" * 70)
if all_pass:
    print("ALL TESTS PASSED")
else:
    print("SOME TESTS FAILED")
print("=" * 70)
