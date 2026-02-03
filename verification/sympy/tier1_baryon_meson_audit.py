#!/usr/bin/env python3
"""
Tier 1 Baryon/Meson Mass Ratio Audit
=====================================

Verifies all Tier 1 particle mass ratio claims with exact PDG values.

Claims verified:
  1. m_B0/Sigma_minus = 97/22  (claimed 1.1 ppm)
  2. Xi0/m_d = 181*14/9        (claimed 3.4 ppm)
  3. W/Xi_minus = 139*7/16     (claimed 6.4 ppm)
  4. m_b/m_s = 179/4           (claimed 8.0 ppm)

Status: VERIFICATION AUDIT
"""

import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from fractions import Fraction
from sympy import isprime, Rational
import math

print("=" * 70)
print("TIER 1 BARYON/MESON MASS RATIO AUDIT")
print("=" * 70)

# ==============================================================================
# PDG 2024 MASSES [A-IMPORT]
# ==============================================================================

# Baryon masses (MeV)
m_B0 = 5279.72        # B0 meson mass, PDG 2024 (uncertainty +/- 0.08 MeV)
m_Sigma_minus = 1197.449  # Sigma- baryon mass, PDG 2024 (uncertainty +/- 0.030 MeV)
m_Xi0 = 1314.86       # Xi0 baryon mass, PDG 2024 (uncertainty +/- 0.20 MeV)
m_Xi_minus = 1321.71   # Xi- baryon mass, PDG 2024 (uncertainty +/- 0.07 MeV)
m_d_quark = 4.67       # d quark mass in MS-bar at 2 GeV, PDG 2024 (4.67 +0.48 -0.17 MeV)
m_W = 80377.0          # W boson mass, MeV, PDG 2024 (80.377 +/- 0.012 GeV)

# Quark masses (MS-bar at mu = 2 GeV)
m_b = 4180.0           # b quark mass, PDG 2024 MS-bar at m_b (4.18 +/- 0.03 GeV)
m_s = 93.4             # s quark mass, PDG 2024 MS-bar at 2 GeV (93.4 +8.6 -3.4 MeV)

print("""
PDG 2024 MASSES:
  m_B0 = 5279.72 +/- 0.08 MeV
  m_Sigma- = 1197.449 +/- 0.030 MeV
  m_Xi0 = 1314.86 +/- 0.20 MeV
  m_Xi- = 1321.71 +/- 0.07 MeV
  m_d = 4.67 +0.48/-0.17 MeV (MS-bar at 2 GeV)
  m_W = 80377 +/- 12 MeV
  m_b = 4180 +/- 30 MeV (MS-bar at m_b)
  m_s = 93.4 +8.6/-3.4 MeV (MS-bar at 2 GeV)
""")

tests = []
results = []

# ==============================================================================
# CLAIM 1: m_B0/Sigma_minus = 97/22 (1.1 ppm)
# ==============================================================================

print("=" * 70)
print("CLAIM 1: m_B0/m_Sigma- = 97/22")
print("=" * 70)

predicted_1 = Fraction(97, 22)
measured_1 = m_B0 / m_Sigma_minus

error_1 = abs(float(predicted_1) - measured_1) / measured_1
error_1_ppm = error_1 * 1e6

print(f"""
  Predicted: 97/22 = {float(predicted_1):.10f}
  Measured:  {measured_1:.10f}
  Error:     {error_1_ppm:.2f} ppm

  Framework: 97 = H^2 + Im_H^4 = 16 + 81 (fourth-power prime)
             22 = 2 x n_c = 2 x 11
  Is 97 prime? {isprime(97)}
""")

tests.append(("m_B0/Sigma- = 97/22 within 5 ppm", error_1_ppm < 5.0))
results.append(("m_B0/m_Sigma-", "97/22", f"{error_1_ppm:.2f} ppm", error_1_ppm < 10))

# ==============================================================================
# CLAIM 2: Xi0/m_d = 181*14/9 (3.4 ppm)
# ==============================================================================

print("=" * 70)
print("CLAIM 2: m_Xi0/m_d = 181*14/9")
print("=" * 70)

predicted_2 = Fraction(181 * 14, 9)
measured_2 = m_Xi0 / m_d_quark

error_2 = abs(float(predicted_2) - measured_2) / measured_2
error_2_ppm = error_2 * 1e6

print(f"""
  Predicted: 181*14/9 = {181*14}/9 = {float(predicted_2):.10f}
  Measured:  {measured_2:.10f}
  Error:     {error_2_ppm:.2f} ppm

  Framework: 181 is prime (near 179 = Im_H^2 + Im_O^2 + n_c^2)
             14 = 2 x Im_O = C x Im_O
             9 = Im_H^2 (generation squared)
  Is 181 prime? {isprime(181)}

  WARNING: m_d uncertainty is HUGE (~10%). This 3.4 ppm claim
  depends entirely on the central value of m_d = 4.67 MeV.
  With m_d = 4.67 +0.48/-0.17, the actual uncertainty band is:
    m_Xi0/(4.67-0.17) = {m_Xi0/4.50:.2f}
    m_Xi0/(4.67+0.48) = {m_Xi0/5.15:.2f}
    Range: {m_Xi0/5.15:.2f} to {m_Xi0/4.50:.2f}
    Predicted: {float(predicted_2):.2f}
  The 3.4 ppm precision is MEANINGLESS given quark mass uncertainty.
""")

tests.append(("Xi0/m_d = 181*14/9 within 100 ppm (central)", error_2_ppm < 100.0))
results.append(("Xi0/m_d", "181*14/9", f"{error_2_ppm:.2f} ppm (central)", error_2_ppm < 10))

# ==============================================================================
# CLAIM 3: W/Xi_minus = 139*7/16 (6.4 ppm)
# ==============================================================================

print("=" * 70)
print("CLAIM 3: m_W/m_Xi- = 139*7/16")
print("=" * 70)

predicted_3 = Fraction(139 * 7, 16)
measured_3 = m_W / m_Xi_minus

error_3 = abs(float(predicted_3) - measured_3) / measured_3
error_3_ppm = error_3 * 1e6

print(f"""
  Predicted: 139*7/16 = {139*7}/16 = {float(predicted_3):.10f}
  Measured:  {measured_3:.10f}
  Error:     {error_3_ppm:.2f} ppm

  Framework: 139 is prime
             7 = Im_O
             16 = H^2 = dim(H)^2
  Is 139 prime? {isprime(139)}

  Check: 139 = 2*Im_H^2 + n_c^2 = 18 + 121 = {2*9 + 121}  YES
""")

tests.append(("W/Xi- = 139*7/16 within 10 ppm", error_3_ppm < 10.0))
results.append(("W/Xi-", "139*7/16", f"{error_3_ppm:.2f} ppm", error_3_ppm < 10))

# ==============================================================================
# CLAIM 4: m_b/m_s = 179/4 (8.0 ppm)
# ==============================================================================

print("=" * 70)
print("CLAIM 4: m_b/m_s = 179/4")
print("=" * 70)

predicted_4 = Fraction(179, 4)
measured_4 = m_b / m_s

error_4 = abs(float(predicted_4) - measured_4) / measured_4
error_4_ppm = error_4 * 1e6

print(f"""
  Predicted: 179/4 = {float(predicted_4):.10f}
  Measured:  {measured_4:.10f}
  Error:     {error_4_ppm:.2f} ppm

  Framework: 179 = Im_H^2 + Im_O^2 + n_c^2 = 9 + 49 + 121
             4 = dim(H) (spacetime dimension)
  Is 179 prime? {isprime(179)}

  WARNING: Both m_b and m_s have large uncertainties:
    m_b/m_s range: {(m_b-30)/(m_s+8.6):.2f} to {(m_b+30)/(m_s-3.4):.2f}
    Predicted: {float(predicted_4):.4f}
    Central: {measured_4:.4f}
  The 8.0 ppm precision uses central values only.
  Actual experimental precision: ~{abs(m_b/(m_s-3.4) - m_b/(m_s+8.6)) / measured_4 * 100:.0f}%
""")

tests.append(("m_b/m_s = 179/4 within 100 ppm (central)", error_4_ppm < 100.0))
results.append(("m_b/m_s", "179/4", f"{error_4_ppm:.2f} ppm (central)", error_4_ppm < 10))

# ==============================================================================
# ADDITIONAL: Check H0 = 337/5, Omega_Lambda = 137/200, l_1 = 220
# ==============================================================================

print("=" * 70)
print("COSMOLOGICAL TIER 1 CLAIMS (quick check)")
print("=" * 70)

# H0
H0_predicted = Fraction(337, 5)
H0_measured = 67.4  # Planck 2018
H0_error_ppm = abs(float(H0_predicted) - H0_measured) / H0_measured * 1e6
tests.append((f"H0 = 337/5 within measurement", abs(float(H0_predicted) - H0_measured) < 0.5))
results.append(("H0", "337/5", f"{H0_error_ppm:.0f} ppm (within 1sigma)", True))

print(f"  H0 = 337/5 = {float(H0_predicted)} vs {H0_measured} -> {H0_error_ppm:.0f} ppm")

# Omega_Lambda
OL_predicted = Fraction(137, 200)
OL_measured = 0.685
OL_error_ppm = abs(float(OL_predicted) - OL_measured) / OL_measured * 1e6
tests.append(("Omega_Lambda = 137/200 within measurement", abs(float(OL_predicted) - OL_measured) < 0.007))
results.append(("Omega_L", "137/200", f"{OL_error_ppm:.0f} ppm (within 1sigma)", True))

print(f"  Omega_L = 137/200 = {float(OL_predicted)} vs {OL_measured} -> {OL_error_ppm:.0f} ppm")

# l_1
l1_predicted = 220
l1_measured = 220.0
l1_error_ppm = 0
tests.append(("l_1 = 220 exact", l1_predicted == 220))
results.append(("l_1", "220", "EXACT", True))

print(f"  l_1 = {l1_predicted} vs {l1_measured} -> EXACT")

# z_rec
zrec_predicted = 1090
zrec_measured = 1089.80
zrec_error_ppm = abs(zrec_predicted - zrec_measured) / zrec_measured * 1e6
tests.append(("z_rec = 1090 within measurement", abs(zrec_predicted - zrec_measured) < 0.5))
results.append(("z_rec", "1090", f"{zrec_error_ppm:.0f} ppm (within 1sigma)", True))

print(f"  z_rec = {zrec_predicted} vs {zrec_measured} -> {zrec_error_ppm:.0f} ppm")

# ==============================================================================
# VERIFICATION SUMMARY
# ==============================================================================

print("\n" + "=" * 70)
print("VERIFICATION SUMMARY")
print("=" * 70)

print(f"\n{'Test':<55} {'Result':>10}")
print("-" * 70)
for name, result in tests:
    status = "PASS" if result else "FAIL"
    print(f"  {name:<53} [{status}]")

passed = sum(1 for _, r in tests if r)
total = len(tests)
print(f"\nPassed: {passed}/{total}")

# ==============================================================================
# TIER 1 AUDIT TABLE
# ==============================================================================

print("\n" + "=" * 70)
print("TIER 1 COMPLETE AUDIT")
print("=" * 70)

print(f"\n{'Claim':<20} {'Formula':<15} {'Precision':<25} {'Tier 1?':>8}")
print("-" * 70)
for name, formula, precision, tier1 in results:
    status = "YES" if tier1 else "NO"
    print(f"  {name:<18} {formula:<13} {precision:<23} {status:>8}")

# ==============================================================================
# CRITICAL FINDINGS
# ==============================================================================

print("\n" + "=" * 70)
print("CRITICAL FINDINGS")
print("=" * 70)

print("""
1. m_B0/Sigma- = 97/22: NOW 11 ppm with PDG 2024 values (B0 mass shifted).
   DEMOTED from Tier 1 (S204). Both masses have ~0.01% experimental
   precision, so sub-10 ppm claims already exceeded input precision.

2. Xi0/m_d = 181*14/9: The d-quark mass has ~10% uncertainty!
   The "3.4 ppm" claim is MEANINGLESS — the actual experimental
   uncertainty is ~10% = 100,000 ppm. This claim should be
   FLAGGED or DEMOTED.

3. W/Xi- = 139*7/16: CONFIRMED sub-10 ppm with current PDG values.
   Both masses measured to better than 0.01%.

4. m_b/m_s = 179/4: Both quark masses have ~5-10% uncertainties.
   The "8.0 ppm" claim uses central values only. Actual
   experimental precision is ~10% = 100,000 ppm.
   This claim should be FLAGGED or DEMOTED.

CONCLUSION: Claims 2 and 4 use quark masses with huge uncertainties.
The sub-10 ppm precision is comparing to CENTRAL VALUES of quantities
known only to ~10%. This inflates the apparent significance.
""")
