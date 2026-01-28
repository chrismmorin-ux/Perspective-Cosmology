#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
QCD Amplification Factor: m_p / (2m_u + m_d) = n_c * Im_H^2?

HYPOTHESIS: The ratio of proton mass to constituent quark masses
is determined by framework numbers.

m_p / (2m_u + m_d) = n_c * Im_H^2 = 11 * 9 = 99?

This would mean:
  m_p = (2m_u + m_d) * n_c * Im_H^2

Status: INVESTIGATION
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from sympy import *

print("=" * 70)
print("QCD AMPLIFICATION FACTOR INVESTIGATION")
print("=" * 70)

# Framework numbers
n_c = Integer(11)
n_d = Integer(4)
Im_H = Integer(3)
Im_O = Integer(7)
H = Integer(4)
O = Integer(8)
C = Integer(2)

# Electroweak scale
v = Rational(24622, 100)  # 246.22 GeV

# =============================================================================
# QUARK MASSES FROM HIERARCHY
# =============================================================================
print("\n" + "=" * 70)
print("QUARK MASSES FROM HIERARCHY")
print("=" * 70)

# From complete_fermion_mass_hierarchy.py
y_t = 1 - Rational(1, n_c**2)
m_t = v / sqrt(2) * y_t
m_b = m_t * Rational(Im_H, n_c**2)
m_c = m_b * Rational(Im_H, n_c - 1)
m_s = m_c / (C**2 + Im_H**2)
m_d = m_s / 20
m_u = m_s / 43

# Convert to MeV
m_u_MeV = float(m_u) * 1000
m_d_MeV = float(m_d) * 1000
m_s_MeV = float(m_s) * 1000

print(f"\nFrom hierarchy:")
print(f"  m_u = {m_u_MeV:.2f} MeV")
print(f"  m_d = {m_d_MeV:.2f} MeV")
print(f"  m_s = {m_s_MeV:.1f} MeV")

# Proton quark content: uud
quark_content = 2 * m_u + m_d
quark_MeV = float(quark_content) * 1000
print(f"\n  2m_u + m_d = {quark_MeV:.2f} MeV")

# Measured proton mass
m_p_meas = 938.27  # MeV

# =============================================================================
# AMPLIFICATION FACTOR
# =============================================================================
print("\n" + "=" * 70)
print("AMPLIFICATION FACTOR")
print("=" * 70)

ratio_observed = m_p_meas / quark_MeV
print(f"\nObserved ratio: m_p / (2m_u + m_d) = {m_p_meas:.2f} / {quark_MeV:.2f}")
print(f"              = {ratio_observed:.2f}")

# Framework candidates
print("\n" + "-" * 40)
print("FRAMEWORK CANDIDATES")
print("-" * 40)

candidates = [
    ("n_c * Im_H^2", n_c * Im_H**2),
    ("H * (C + Im_H)^2", H * (C + Im_H)**2),
    ("(H + O) * O", (H + O) * O),
    ("n_c^2 - n_c - 11", n_c**2 - n_c - 11),
    ("100", Integer(100)),
    ("H * Im_H * O", H * Im_H * O),
    ("n_c * 9", n_c * 9),
]

print(f"\nTarget ratio: {ratio_observed:.2f}\n")
print(f"{'Expression':<25} {'Value':<10} {'Error':>10}")
print("-" * 50)

best_match = None
best_error = float('inf')

for name, value in candidates:
    val = float(value)
    error = abs(val - ratio_observed) / ratio_observed * 100
    print(f"{name:<25} {val:<10.1f} {error:>9.2f}%")
    if error < best_error:
        best_error = error
        best_match = (name, value)

print(f"\nBest match: {best_match[0]} = {best_match[1]} (error: {best_error:.2f}%)")

# =============================================================================
# IF AMPLIFICATION = n_c * Im_H^2 = 99
# =============================================================================
print("\n" + "=" * 70)
print("TESTING: m_p = (2m_u + m_d) * 99")
print("=" * 70)

# Predicted proton mass
m_p_pred_99 = quark_MeV * 99
error_99 = abs(m_p_pred_99 - m_p_meas) / m_p_meas * 100

print(f"\nIf m_p = (2m_u + m_d) * n_c * Im_H^2:")
print(f"  m_p = {quark_MeV:.2f} * 99")
print(f"      = {m_p_pred_99:.2f} MeV")
print(f"  Measured: {m_p_meas:.2f} MeV")
print(f"  Error: {error_99:.2f}%")

# What quark content would give exact m_p?
quark_exact = m_p_meas / 99
print(f"\nFor exact match, need:")
print(f"  2m_u + m_d = {m_p_meas:.2f} / 99 = {quark_exact:.2f} MeV")
print(f"  We have: {quark_MeV:.2f} MeV")
print(f"  Discrepancy: {(quark_MeV - quark_exact)/quark_exact*100:.1f}%")

# =============================================================================
# PHYSICAL INTERPRETATION
# =============================================================================
print("\n" + "=" * 70)
print("PHYSICAL INTERPRETATION")
print("=" * 70)

print("""
The amplification factor n_c * Im_H^2 = 11 * 9 = 99 has meaning:

  n_c = 11 = crystal dimensions (number of internal modes)
  Im_H^2 = 9 = generations squared (or SU(2) structure)

The proton mass formula becomes:

  m_p = (2m_u + m_d) * n_c * Im_H^2

This says: QCD amplifies quark masses by a factor encoding:
  - The internal crystal structure (11 dimensions)
  - The squared generational structure (3^2 = 9)

INTERPRETATION:
  The proton is a bound state where QCD "spreads" quark mass
  across all crystal×generation channels.
""")

# =============================================================================
# ALTERNATIVE: EXPRESS m_p PURELY IN TERMS OF v
# =============================================================================
print("=" * 70)
print("m_p PURELY FROM v AND FRAMEWORK")
print("=" * 70)

# If m_p = 99 * (2m_u + m_d), and quark masses come from v...
# Let's trace through the hierarchy

print("\nChain from v to m_p:")
print("  m_t = (v/sqrt(2)) * (120/121)")
print("  m_b = m_t * (3/121)")
print("  m_c = m_b * (3/10)")
print("  m_s = m_c / 13")
print("  m_d = m_s / 20")
print("  m_u = m_s / 43")
print("  m_p = 99 * (2m_u + m_d)?")

# Let's compute the full factor
# m_s/v = (1/sqrt(2)) * (120/121) * (3/121) * (3/10) * (1/13)
m_s_over_v_simplified = m_s / v

# m_u = m_s/43, m_d = m_s/20
# 2m_u + m_d = 2(m_s/43) + (m_s/20) = m_s * (2/43 + 1/20) = m_s * (40 + 43)/(43*20) = m_s * 83/860

quark_over_ms = Rational(2, 43) + Rational(1, 20)
print(f"\n(2m_u + m_d)/m_s = 2/43 + 1/20 = {quark_over_ms} = {float(quark_over_ms):.4f}")

# So (2m_u + m_d) = m_s * 83/860
# And m_p = 99 * m_s * 83/860

proton_factor = 99 * quark_over_ms
print(f"m_p/m_s = 99 * (2m_u+m_d)/m_s = 99 * {float(quark_over_ms):.4f} = {float(proton_factor):.2f}")

# Check
m_p_from_ms = float(m_s) * 1000 * float(proton_factor)
print(f"\nm_p = m_s * {float(proton_factor):.2f} = {m_s_MeV:.1f} * {float(proton_factor):.2f} = {m_p_from_ms:.1f} MeV")
print(f"Measured: {m_p_meas:.2f} MeV")
print(f"Error: {abs(m_p_from_ms - m_p_meas)/m_p_meas*100:.1f}%")

# =============================================================================
# THE 1836 CONNECTION
# =============================================================================
print("\n" + "=" * 70)
print("CONNECTION TO 1836")
print("=" * 70)

# We have: m_p/m_e = 1836 + 11/72
# And: m_p = 99 * (2m_u + m_d)?

# What's m_e / (2m_u + m_d)?
m_e_MeV = 0.511
ratio_e_quarks = m_e_MeV / quark_MeV
print(f"\nm_e / (2m_u + m_d) = {m_e_MeV:.4f} / {quark_MeV:.2f} = {ratio_e_quarks:.4f}")

# If m_p/m_e = 1836 and m_p = 99 * quark_content
# Then 99 * quark_content / m_e = 1836
# So m_e / quark_content = 99 / 1836 = 99 / 1836

expected_ratio = 99 / 1836
print(f"If m_p/m_e = 1836 and m_p = 99*(2m_u+m_d):")
print(f"  m_e/(2m_u+m_d) = 99/1836 = {expected_ratio:.5f}")
print(f"  Observed: {ratio_e_quarks:.5f}")
print(f"  Error: {abs(ratio_e_quarks - expected_ratio)/expected_ratio*100:.1f}%")

# What's 1836/99?
ratio_1836_99 = 1836 / 99
print(f"\n1836 / 99 = {ratio_1836_99:.4f}")
print(f"Note: 1836 = 99 * 18.5454... = 99 * 37/2 ?")
print(f"      99 * 37/2 = {99 * 37 / 2}")
print(f"      Close! 1836 vs 1831.5")

# Maybe 1836 = 99 * 18.545... = 99 * (some framework)?
# 1836 / 99 = 18.545454... = 204/11 = (17*12)/11 ?
ratio_frac = Rational(1836, 99)
print(f"\n1836/99 = {ratio_frac} = {float(ratio_frac):.6f}")
print(f"Simplify: {ratio_frac} = 612/33 = 204/11 = {204/11:.6f}")

# Check: 99 * 204/11 = 99 * 204 / 11 = 9 * 204 = 1836!
check = 99 * 204 / 11
print(f"\nVerification: 99 * (204/11) = {check}")
print("So: 1836 = 99 * (204/11) = 9 * 204")

# What's 204?
print("\n204 = ?")
print(f"  204 = 4 * 51 = H * 51")
print(f"  204 = 12 * 17 = (H+O) * 17")
print(f"  204 = 3 * 68 = Im_H * 68")
print("  17 = H^2 + 1 (framework prime)")
print("  So 204 = (H+O) * (H^2 + 1)")

# =============================================================================
# FINAL FORMULA
# =============================================================================
print("\n" + "=" * 70)
print("POTENTIAL FORMULA")
print("=" * 70)

# If m_p/m_e = 1836 = 9 * 204 = 9 * 12 * 17 = Im_H^2 * (H+O) * (H^2+1)
# And m_p = 99 * (2m_u + m_d) = n_c * Im_H^2 * (2m_u + m_d)

print("""
FORMULA STRUCTURE:

  m_p/m_e = 1836 + 11/72
          = Im_H^2 * (H+O) * (H^2+1) + n_c/(O * Im_H^2)
          = 9 * 12 * 17 + 11/72

  m_p = 99 * (2m_u + m_d)
      = n_c * Im_H^2 * (quark content)

CONSISTENCY CHECK:
  m_e = (2m_u + m_d) * 99 / 1836
      = quark content * 99 / (9 * 204)
      = quark content * 11 / 204
      = quark content * n_c / ((H+O) * (H^2+1))
""")

# Check this
m_e_predicted = quark_MeV * 11 / 204
print(f"Predicted m_e = {quark_MeV:.2f} * 11/204 = {m_e_predicted:.4f} MeV")
print(f"Measured m_e = {m_e_MeV:.4f} MeV")
print(f"Error: {abs(m_e_predicted - m_e_MeV)/m_e_MeV*100:.2f}%")

# =============================================================================
# VERIFICATION TESTS
# =============================================================================
print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    ("Amplification 99 gives m_p within 1%", error_99 < 1),
    ("1836 = 9 * 204", 1836 == 9 * 204),
    ("204 = 12 * 17 = (H+O)*(H^2+1)", 204 == 12 * 17),
    ("99 = n_c * Im_H^2", 99 == 11 * 9),
    ("m_e prediction within 1%", abs(m_e_predicted - m_e_MeV)/m_e_MeV*100 < 1),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print(f"\nOverall: {'PASS' if all_pass else 'PARTIAL'}")
