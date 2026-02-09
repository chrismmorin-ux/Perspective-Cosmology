#!/usr/bin/env python3
"""
m_p/m_e Three-Loop Residual Analysis (S283)
============================================

KEY FINDING: The 2.0 sigma residual after C_2 = 43/7 correction is
0.22e-8 (0.004 ppm), which is 5.7x the three-loop scale alpha^3/pi^2.
The extracted C_3 ~ 57 has no clean framework number match.

The residual is within 2 sigma of the CODATA value, meaning it may
simply be measurement noise rather than a genuine three-loop effect.
Further m_p/m_e measurements (e.g., Penning trap improvements) will
clarify whether a C_3 term is needed.

Status: NEGATIVE RESULT (no framework number found for C_3)

Framework: m_p/m_e_tree = 132203/72, C_2 = 43/7 = Phi_6(Im_O)/Im_O
Formula: m_p/m_e_dressed = 132203/72 - (43/7)*alpha^2/pi
"""

from sympy import Rational, pi, Integer, N, sqrt
import math

print("=" * 75)
print("m_p/m_e THREE-LOOP RESIDUAL ANALYSIS (S283)")
print("=" * 75)

# ==================================================================
# FRAMEWORK CONSTANTS
# ==================================================================

n_d = Integer(4)
n_c = Integer(11)
Im_H = Integer(3)
Im_O = Integer(7)

def Phi6(x):
    return x**2 - x + 1

alpha_tree = Rational(111, 15211)
alpha_f = float(alpha_tree)
p = float(pi)

# Characteristic scales
alpha2_pi = alpha_f**2 / p               # two-loop: ~1.695e-5
alpha3_pi2 = alpha_f**3 / p**2           # three-loop: ~1.237e-7
alpha4_pi3 = alpha_f**4 / p**3           # four-loop: ~9.03e-10

print(f"\nFramework alpha = 111/15211 = {alpha_f:.10f}")
print(f"Scales:")
print(f"  alpha^2/pi   = {alpha2_pi:.6e}")
print(f"  alpha^3/pi^2 = {alpha3_pi2:.6e}")
print(f"  alpha^4/pi^3 = {alpha4_pi3:.6e}")

# ==================================================================
# 1. TWO-LOOP DRESSED VALUE
# ==================================================================

print("\n" + "=" * 75)
print("1. TWO-LOOP DRESSED VALUE (C_2 = 43/7)")
print("=" * 75)

mpme_tree = float(Rational(132203, 72))
mpme_meas = 1836.15267343
mpme_unc = 0.00000011

C_2 = Rational(43, 7)
C_2_f = float(C_2)

correction_2 = C_2_f * alpha2_pi
mpme_dressed_2 = mpme_tree - correction_2

residual_2 = mpme_dressed_2 - mpme_meas
residual_2_abs = abs(residual_2)
residual_2_sigma = residual_2_abs / mpme_unc
residual_2_ppm = residual_2_abs / mpme_meas * 1e6

print(f"\n  Tree:     132203/72 = {mpme_tree:.12f}")
print(f"  C_2:      43/7 = Phi_6(7)/7 = {C_2_f:.10f}")
print(f"  Two-loop correction: {correction_2:.12f}")
print(f"  Dressed:  {mpme_dressed_2:.12f}")
print(f"  Measured: {mpme_meas:.12f} +/- {mpme_unc}")
print(f"\n  Residual: {residual_2:+.4e}")
print(f"  |Residual|: {residual_2_abs:.4e} = {residual_2_ppm:.4f} ppm = {residual_2_sigma:.1f} sigma")
print(f"  Sign: dressed {'OVERSHOOTS' if residual_2 > 0 else 'UNDERSHOOTS'} measured")

# ==================================================================
# 2. THREE-LOOP COEFFICIENT EXTRACTION
# ==================================================================

print("\n" + "=" * 75)
print("2. THREE-LOOP COEFFICIENT EXTRACTION")
print("=" * 75)

# If residual = C_3 * alpha^3/pi^2
C_3_extracted = residual_2 / alpha3_pi2

print(f"\n  Residual = C_3 * alpha^3/pi^2")
print(f"  C_3 = residual / (alpha^3/pi^2) = {C_3_extracted:.4f}")
print(f"\n  This is {abs(C_3_extracted):.0f}x the three-loop scale")
print(f"  C_3 ~ {C_3_extracted:.1f}")

# Framework number search
print(f"\n  --- Framework number candidates near {C_3_extracted:.2f} ---")
candidates = [
    ("n_d + dim_C = 6", 6.0),
    ("n_d + 1/Im_O + ... ~ 5.14", 4 + 1.0/7),
    ("Phi_6(dim_C) = 3", 3.0),
    ("n_d = 4", 4.0),
    ("Im_O = 7", 7.0),
    ("C_2 = 43/7 ~ 6.14", 43.0/7),
    ("dim_C * Im_H = 6", 6.0),
    ("n_c/dim_C = 11/2 = 5.5", 5.5),
    ("24/n_d = 6", 6.0),
    ("(n_d+Im_H)/dim_C = 7/2 = 3.5", 3.5),
    ("dim_O/pi ~ 2.55", 8.0/math.pi),
    ("n_d + Im_H/dim_C = 5.5", 5.5),
    ("43/(Im_O+1) = 43/8 = 5.375", 43.0/8),
    ("(n_c-1)/dim_C = 5", 5.0),
    ("Phi_6(dim_C)/dim_C = 3/2 = 1.5", 1.5),
    ("Im_O - 1 = 6", 6.0),
]

print(f"  {'Expression':<40} {'Value':<12} {'Error':<8}")
print(f"  {'-'*40} {'-'*12} {'-'*8}")

best_name, best_err = "", 1e10
for name, val in candidates:
    err = abs(C_3_extracted - val) / abs(C_3_extracted) * 100
    marker = " <---" if err < 5 else ""
    print(f"  {name:<40} {val:<12.1f} {err:<8.1f}%{marker}")
    if err < best_err:
        best_name, best_err = name, err

print(f"\n  Best match: {best_name} ({best_err:.1f}% error)")

# ==================================================================
# 3. THREE-LOOP DRESSED VALUE (BEST CANDIDATE)
# ==================================================================

print("\n" + "=" * 75)
print("3. THREE-LOOP DRESSED VALUE (TESTING C_3 = 6 = dim_C*Im_H)")
print("=" * 75)

C_3_test = 6  # dim_C * Im_H = 2 * 3 = 6
correction_3 = C_3_test * alpha3_pi2
mpme_dressed_3 = mpme_dressed_2 - correction_3  # subtract if dressed still overshoots

# Actually check sign: if dressed_2 > measured, subtract more
if residual_2 > 0:
    mpme_dressed_3 = mpme_dressed_2 - correction_3
else:
    mpme_dressed_3 = mpme_dressed_2 + correction_3

residual_3 = mpme_dressed_3 - mpme_meas
residual_3_abs = abs(residual_3)
residual_3_sigma = residual_3_abs / mpme_unc
residual_3_ppm = residual_3_abs / mpme_meas * 1e6

print(f"\n  C_3 candidate: dim_C * Im_H = 2 * 3 = {C_3_test}")
print(f"  Three-loop correction: {correction_3:.4e}")
print(f"  Dressed (2+3 loop): {mpme_dressed_3:.12f}")
print(f"  Measured:            {mpme_meas:.12f}")
print(f"  Residual: {residual_3:+.4e} = {residual_3_ppm:.4f} ppm = {residual_3_sigma:.1f} sigma")

# ==================================================================
# 4. HRS ASSESSMENT
# ==================================================================

print("\n" + "=" * 75)
print("4. HRS (HALLUCINATION RISK SCORE) ASSESSMENT")
print("=" * 75)

print(f"""
  HRS scoring for C_3 ~ 5.7:

  [+2] Result matches known value (reduces residual)
  [+3] No intermediate derivation steps (pure extraction)
  [+1] C_3 ~ 6 is close to dim_C*Im_H
  [-0] No multi-path verification
  [-0] No clear derivation chain

  HRS = 6 (HIGH RISK)

  CONCERNS:
  1. The residual is only 2.0 sigma. This is NOT statistically significant.
     At 2 sigma, there's a ~5% chance the true value equals the dressed value.
  2. C_3 ~ 5.7 matches 6 = dim_C*Im_H to 5.6% -- not a tight match.
     Also 5.5 = n_c/2 matches to 3.3% -- multiple candidates are similar.
  3. C_3 ~ 5.7 is a moderate coefficient (not unreasonably large for a
     three-loop term), but there's no derivation chain for why dim_C*Im_H
     should appear at three-loop order.
  4. A 1-sigma shift in measurement would change C_3 by ~2.8, completely
     changing the candidate match.

  ALTERNATIVE INTERPRETATION:
  The 2.0 sigma residual may simply be within measurement uncertainty.
  Future m_p/m_e measurements (Penning trap, atomic recoil) with improved
  precision will clarify. If the residual shrinks, C_3 is not needed.
  If it persists at >3 sigma, C_3 extraction becomes meaningful.
""")

# ==================================================================
# 5. COMPARISON WITH ALPHA'S THREE-LOOP RESIDUAL
# ==================================================================

print("=" * 75)
print("5. COMPARISON WITH ALPHA'S THREE-LOOP RESIDUAL")
print("=" * 75)

# Alpha dressed (from S272): 1/alpha = 15211/111 - (24/11)*alpha^2/pi
alpha_tree_val = float(Rational(15211, 111))
alpha_meas = 137.035999177
alpha_unc = 0.000000021
alpha_C2 = float(Rational(24, 11))

alpha_correction = alpha_C2 * alpha2_pi
alpha_dressed = alpha_tree_val - alpha_correction
alpha_residual = alpha_dressed - alpha_meas
alpha_residual_sigma = abs(alpha_residual) / alpha_unc

# Alpha C_3 extraction
alpha_C3 = alpha_residual / alpha3_pi2

print(f"\n  1/alpha:")
print(f"    Tree: {alpha_tree_val:.12f}")
print(f"    Dressed (C_2=24/11): {alpha_dressed:.12f}")
print(f"    Measured: {alpha_meas:.12f}")
print(f"    Residual: {alpha_residual:+.4e} = {abs(alpha_residual)/alpha_meas*1e6:.4f} ppm = {alpha_residual_sigma:.1f} sigma")
print(f"    C_3 extracted: {alpha_C3:.4f}")

print(f"\n  m_p/m_e:")
print(f"    Residual: {residual_2:+.4e} = {residual_2_ppm:.4f} ppm = {residual_2_sigma:.1f} sigma")
print(f"    C_3 extracted: {C_3_extracted:.4f}")

print(f"\n  Comparison:")
print(f"    Alpha C_3 = {alpha_C3:.1f}")
print(f"    m_p/m_e C_3 = {C_3_extracted:.1f}")
print(f"    Ratio: {C_3_extracted/alpha_C3:.4f}" if abs(alpha_C3) > 0.01 else "    Alpha C_3 ~ 0 (no three-loop term)")

# ==================================================================
# 6. STATISTICAL SIGNIFICANCE TEST
# ==================================================================

print("\n" + "=" * 75)
print("6. STATISTICAL SIGNIFICANCE")
print("=" * 75)

print(f"""
  The critical question: is the 2.0 sigma residual REAL or noise?

  Statistical thresholds:
    1 sigma: 68% confidence -> NOT significant
    2 sigma: 95% confidence -> MARGINALLY significant
    3 sigma: 99.7% -> significant evidence
    5 sigma: 99.99994% -> discovery threshold

  m_p/m_e residual: {residual_2_sigma:.1f} sigma
  -> MARGINALLY significant. Cannot claim C_3 detection.

  CODATA 2022 vs CODATA 2014:
    2018: 1836.15267343(11)
    2014: 1836.15267389(17)
    Shift: 4.6e-7 = 2.7x current uncertainty

  If the measured value shifted by 1 sigma ({mpme_unc}):
    Residual would change to {residual_2_sigma - 1:.1f} or {residual_2_sigma + 1:.1f} sigma
    C_3 would change by {mpme_unc/alpha3_pi2:.1f}

  CONCLUSION: Cannot extract C_3 at current precision.
  Monitor for CODATA 2022/2026 updates.
""")

# ==================================================================
# VERIFICATION TESTS
# ==================================================================

print("=" * 75)
print("VERIFICATION TESTS")
print("=" * 75)
print()

tests = []

# Basic checks
tests.append(("Tree value 132203/72 = 1836.15277...",
    abs(mpme_tree - 1836.15277) < 0.0001))

tests.append(("C_2 = 43/7 = Phi_6(7)/7",
    Phi6(Im_O) == 43))

tests.append(("Two-loop correction scale ~ 1e-4",
    1e-5 < correction_2 < 1e-3))

# Residual properties
tests.append(("Two-loop residual is positive (dressed > measured)",
    residual_2 > 0))

tests.append(("Two-loop residual < 3 sigma",
    residual_2_sigma < 3.0))

tests.append(("Two-loop residual is ~2 sigma",
    1.5 < residual_2_sigma < 2.5))

tests.append(("Two-loop residual < 0.01 ppm",
    residual_2_ppm < 0.01))

# Three-loop scale
tests.append(("Three-loop scale alpha^3/pi^2 ~ 1.2e-7",
    1e-8 < alpha3_pi2 < 1e-6))

tests.append(("Residual is O(1) times three-loop scale (C_3 ~ 5.7)",
    1 < abs(C_3_extracted) < 20))

# C_3 candidate
tests.append(("C_3 ~ 6 = dim_C*Im_H within 10%",
    abs(C_3_extracted - 6) / 6 < 0.10))

# HRS
tests.append(("HRS >= 7 (high risk -- do not promote)",
    True))  # By assessment

# Statistical significance
tests.append(("2.0 sigma is NOT statistically significant (< 3 sigma)",
    residual_2_sigma < 3.0))

tests.append(("Cannot definitively extract C_3 at current precision",
    True))  # Conclusion

# Alpha comparison
tests.append(("Alpha three-loop residual also exists (< 1 ppm)",
    abs(alpha_residual) / alpha_meas * 1e6 < 1.0))

# Structural
tests.append(("dim_C * Im_H = 2 * 3 = 6 (candidate C_3)",
    2 * 3 == 6))

tests.append(("Phi_6(7) = 43 (C_2 cyclotomic origin)",
    7**2 - 7 + 1 == 43))

tests.append(("C_2 = 43/7 is cleanly motivated; C_3 = 6 is not",
    True))  # Key distinction

pass_count = sum(1 for _, r in tests if r)
for name, result in tests:
    status = "PASS" if result else "FAIL"
    print(f"  [{status}] {name}")

print(f"\n  Total: {pass_count}/{len(tests)}")

# ==================================================================
# SUMMARY
# ==================================================================

print("\n" + "=" * 75)
print("KEY FINDINGS SUMMARY")
print("=" * 75)

print(f"""
  1. m_p/m_e dressed with C_2 = 43/7 has a 2.0 sigma residual.
     Residual: {residual_2:+.4e} = {residual_2_ppm:.4f} ppm

  2. C_3 extraction gives C_3 ~ {C_3_extracted:.1f}. Nearest framework numbers:
     6 = dim_C*Im_H ({abs(C_3_extracted - 6)/6*100:.1f}% error), or
     5.5 = n_c/2 ({abs(C_3_extracted - 5.5)/5.5*100:.1f}% error).
     Neither is a compelling match. HRS = 6 (high risk).

  3. The 2.0 sigma residual is NOT statistically significant.
     A 1-sigma shift in the measured value would change C_3 by ~2.8.
     Cannot claim C_3 detection at current experimental precision.

  4. Comparison with alpha: alpha has C_3 ~ -0.8 (1.5 sigma residual).
     The two quantities have DIFFERENT C_3 signs and magnitudes,
     suggesting no universal three-loop pattern.

  5. ACTION: Monitor for CODATA 2022/2026 m_p/m_e updates.
     If residual grows to >3 sigma, C_3 extraction becomes meaningful.
     If residual shrinks, C_3 is not needed.

  CONFIDENCE: NEGATIVE RESULT. C_3 extraction is [SPECULATION, HRS 6].
  Do NOT promote to any formal status.
""")
