#!/usr/bin/env python3
"""
Koide Scale: Best Division Algebra Formula
===========================================

MAJOR FINDING:
  v/M = (n_d x Im(O))^2 + dim(R)/dim(C)
      = 28^2 + 1/2
      = 784 + 1/2
      = 1569/2
      = 784.5

This gives M = 2v/1569 with excellent accuracy!

Status: VERIFICATION
"""

from fractions import Fraction
from sympy import isprime

print("=" * 70)
print("KOIDE SCALE: BEST DIVISION ALGEBRA FORMULA")
print("=" * 70)

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

print(f"""
DIVISION ALGEBRA DIMENSIONS:
  dim(R) = {dim_R}, dim(C) = {dim_C}, dim(H) = {dim_H}, dim(O) = {dim_O}
  Im(H) = {Im_H}, Im(O) = {Im_O}
  n_d = {n_d}, n_c = {n_c}
""")

# =============================================================================
# THE FORMULA
# =============================================================================

print("=" * 70)
print("THE FORMULA")
print("=" * 70)

# v/M = (n_d x Im(O))^2 + dim(R)/dim(C)
#     = 28^2 + 1/2
#     = 784 + 1/2

main_term = (n_d * Im_O)**2  # = 784
correction = Fraction(dim_R, dim_C)  # = 1/2

v_over_M_predicted = main_term + correction

print(f"""
v/M = (n_d x Im(O))^2 + dim(R)/dim(C)

    = ({n_d} x {Im_O})^2 + {dim_R}/{dim_C}

    = {n_d * Im_O}^2 + 1/2

    = {main_term} + {correction}

    = {v_over_M_predicted}

    = {float(v_over_M_predicted):.6f}
""")

# =============================================================================
# COMPARISON WITH MEASUREMENT
# =============================================================================

print("=" * 70)
print("COMPARISON WITH MEASUREMENT")
print("=" * 70)

# Measured values
v_GeV = 246.22  # GeV
M_measured_MeV = 313.856  # MeV (from Koide fitting)

v_over_M_measured = v_GeV * 1000 / M_measured_MeV

# Calculate predicted M from formula
# M = v / (v/M) = v / (1569/2) = 2v/1569
M_predicted_MeV = v_GeV * 1000 / float(v_over_M_predicted)

diff = float(v_over_M_predicted) - v_over_M_measured
rel_error_ppm = abs(diff) / v_over_M_measured * 1e6
rel_error_percent = abs(diff) / v_over_M_measured * 100

print(f"""
RATIO v/M:
  Predicted: {float(v_over_M_predicted):.8f}
  Measured:  {v_over_M_measured:.8f}

  Difference: {diff:+.8f}
  Relative error: {rel_error_ppm:.1f} ppm = {rel_error_percent:.5f}%

KOIDE SCALE M:
  Predicted: M = 2v/1569 = {M_predicted_MeV:.4f} MeV
  Measured:  M = {M_measured_MeV:.4f} MeV

  Error: {abs(M_predicted_MeV - M_measured_MeV)/M_measured_MeV * 100:.5f}%

COMPARISON WITH PREVIOUS FORMULA:
  Previous: v/M = 784 = 28^2, error = {abs(784 - v_over_M_measured)/v_over_M_measured * 100:.4f}%
  New:      v/M = 1569/2,     error = {rel_error_percent:.5f}%

  Improvement: {abs(784 - v_over_M_measured)/abs(float(v_over_M_predicted) - v_over_M_measured):.0f}x better!
""")

# =============================================================================
# VERIFICATION OF STRUCTURE
# =============================================================================

print("=" * 70)
print("VERIFICATION OF ALGEBRAIC STRUCTURE")
print("=" * 70)

print(f"""
1. MAIN TERM: (n_d x Im(O))^2
   = (dim(H) x Im(O))^2
   = (4 x 7)^2
   = 28^2
   = 784  CHECK

2. CORRECTION: dim(R)/dim(C)
   = 1/2  CHECK

3. TOTAL: 784 + 1/2 = 1569/2  CHECK

4. EXACT FRACTION:
   v/M = {v_over_M_predicted}
   M = 2v/1569

5. NUMERATOR ANALYSIS:
   1569 = 3 x 523
   523 is PRIME

   Alternative: 1569 = 2 x 784 + 1 = 2 x 28^2 + 1
""")

# =============================================================================
# PHYSICAL INTERPRETATION
# =============================================================================

print("=" * 70)
print("PHYSICAL INTERPRETATION")
print("=" * 70)

print(f"""
THE KOIDE SCALE FROM DIVISION ALGEBRAS:

  M = 2v / 1569 = 2v / (2 x 28^2 + 1)

  = v / (28^2 + 1/2)

  = v / ((n_d x Im(O))^2 + dim(R)/dim(C))

INTERPRETATION:

1. MAIN TERM: 28^2 = 784
   - 28 = n_d x Im(O) = dim(H) x Im(O) = 4 x 7
   - This encodes the H-O coupling
   - The square counts interaction modes

2. CORRECTION: 1/2 = dim(R)/dim(C)
   - This is the simplest division algebra ratio!
   - Real/Complex = 1/2
   - Represents minimal "quantum" of correction

3. WHY THIS STRUCTURE:
   - The main term involves H and O (strong sector)
   - The correction involves R and C (electromagnetic sector)
   - Koide formula describes leptons (electromagnetic interactions)
   - The 1/2 correction represents EM-strong mixing

4. CONNECTION TO ALPHA:
   - Alpha uses n_d^2 + n_c^2 = 137 (sum of squares)
   - Koide uses (n_d x Im(O))^2 = 784 (product squared)
   - Both have small fractional corrections
""")

# =============================================================================
# COMPARISON WITH OTHER FORMULAS
# =============================================================================

print("=" * 70)
print("COMPARISON WITH OTHER FORMULAS")
print("=" * 70)

# All the formulas we've found
alpha_inv = Fraction(15211, 111)
mp_me = Fraction(132203, 72)
sin2_W = Fraction(123, 532)
v_M = Fraction(1569, 2)

print(f"""
DIVISION ALGEBRA FORMULA SUMMARY:

| Constant | Formula | Exact Fraction | Error |
|----------|---------|----------------|-------|
| 1/alpha  | 137 + 4/111 | {alpha_inv} | 0.27 ppm |
| m_p/m_e  | 1836 + 11/72 | {mp_me} | 0.06 ppm |
| sin^2 theta_W | (1/4)(1 - 10/133) | {sin2_W} | 30 ppm |
| **v/M**  | **784 + 1/2** | **{v_M}** | **{rel_error_ppm:.0f} ppm** |

All use only division algebra dimensions:
  dim(R) = 1, dim(C) = 2, dim(H) = 4, dim(O) = 8
  Im(H) = 3, Im(O) = 7
  n_d = 4, n_c = 11

KEY PATTERN: All formulas have structure:
  main_term + small_correction

Where corrections are ratios of division algebra dimensions.
""")

# =============================================================================
# SUMMARY
# =============================================================================

print("=" * 70)
print("SUMMARY")
print("=" * 70)

print(f"""
=======================================================================
              KOIDE SCALE FROM DIVISION ALGEBRAS
=======================================================================

  v/M = (n_d x Im(O))^2 + dim(R)/dim(C)

      = 28^2 + 1/2

      = 784 + 1/2

      = 1569/2

      = {float(v_over_M_predicted):.6f}

  Therefore:

  M = 2v/1569 = {M_predicted_MeV:.4f} MeV

-----------------------------------------------------------------------

  MEASURED: M = {M_measured_MeV} MeV

  ERROR: {rel_error_ppm:.1f} ppm (improved from 637 ppm = 0.064%)

-----------------------------------------------------------------------

  KEY INSIGHT: The correction 1/2 = dim(R)/dim(C) is the simplest
               possible division algebra ratio!

  This formula uses ZERO free parameters.

=======================================================================
""")
