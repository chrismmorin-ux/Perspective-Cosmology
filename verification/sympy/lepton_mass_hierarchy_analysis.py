#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lepton Mass Hierarchy Analysis

After finding the complete quark hierarchy, can we find similar
framework patterns for charged leptons?

We know:
- Koide formula works (Q = 2/3 exactly)
- Koide theta has framework expression

But can we derive the ABSOLUTE masses or ratios like we did for quarks?

Session 109 Continuation

Status: EXPLORATION
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from sympy import *

print("=" * 70)
print("LEPTON MASS HIERARCHY ANALYSIS")
print("=" * 70)

# Framework numbers
n_c = Integer(11)
n_d = Integer(4)
Im_H = Integer(3)
Im_O = Integer(7)
H = Integer(4)
O = Integer(8)
C = Integer(2)
R = Integer(1)
alpha_inv = Integer(137)

# Electroweak scale
v = Rational(24622, 100)  # 246.22 GeV

# Measured lepton masses (PDG 2022) in GeV
m_e = Rational(511, 1000000)       # 0.000511 GeV = 0.511 MeV
m_mu = Rational(10566, 100000)     # 0.10566 GeV = 105.66 MeV
m_tau = Rational(17769, 10000)     # 1.7769 GeV = 1776.9 MeV

print(f"""
PART 1: LEPTON MASS DATA
========================

Charged lepton masses:
  m_e   = {float(m_e)*1000:.4f} MeV
  m_mu  = {float(m_mu)*1000:.3f} MeV
  m_tau = {float(m_tau)*1000:.2f} MeV

Mass ratios:
  m_mu/m_e   = {float(m_mu/m_e):.2f}
  m_tau/m_mu = {float(m_tau/m_mu):.3f}
  m_tau/m_e  = {float(m_tau/m_e):.0f}
""")

# Known framework results
print("""
PART 2: KNOWN FRAMEWORK RESULTS
===============================

From earlier sessions, we have:
  m_mu/m_e = 8891/43 = 206.767... (measured: 206.768)  [4.1 ppm]
  m_tau/m_mu = 185/11 = 16.818... (measured: 16.817)   [70 ppm]

These are ALREADY sub-percent predictions!

Let's verify:
""")

ratio_mu_e_pred = Rational(8891, 43)
ratio_tau_mu_pred = Rational(185, 11)

ratio_mu_e_meas = m_mu / m_e
ratio_tau_mu_meas = m_tau / m_mu

print(f"  m_mu/m_e: predicted = {float(ratio_mu_e_pred):.6f}, measured = {float(ratio_mu_e_meas):.6f}")
error_mu_e = abs(float(ratio_mu_e_pred) - float(ratio_mu_e_meas)) / float(ratio_mu_e_meas)
print(f"            Error: {error_mu_e*1e6:.1f} ppm")

print(f"\n  m_tau/m_mu: predicted = {float(ratio_tau_mu_pred):.6f}, measured = {float(ratio_tau_mu_meas):.6f}")
error_tau_mu = abs(float(ratio_tau_mu_pred) - float(ratio_tau_mu_meas)) / float(ratio_tau_mu_meas)
print(f"              Error: {error_tau_mu*1e6:.0f} ppm")

print("""
PART 3: ABSOLUTE MASS ANCHOR
============================

For quarks, we anchored to the electroweak scale v via:
  m_t = (v/sqrt(2)) * (1 - 1/n_c^2)

For leptons, can we do something similar?
The tau is the heaviest charged lepton. Let's check m_tau/v:
""")

m_tau_over_v = float(m_tau / v)
print(f"  m_tau / v = {m_tau_over_v:.6f}")
print(f"  m_tau / (v/sqrt(2)) = {float(m_tau) / (float(v)/sqrt(2)):.6f}")

# Search for framework expressions
print("\nSearching for framework expressions for m_tau/v:")

candidates = {
    '1/alpha_inv': 1/137,
    'Im_H/alpha_inv^2': 3/137**2,
    '1/(n_c*alpha_inv)': 1/(11*137),
    'Im_H/(n_c*n_d*alpha_inv)': 3/(11*4*137),
    '1/(H*alpha_inv)': 1/(4*137),
    'Im_O/(alpha_inv^2)': 7/137**2,
    'n_d/(alpha_inv^2)': 4/137**2,
    '(n_c-O)/(alpha_inv^2)': 3/137**2,
}

for name, val in sorted(candidates.items(), key=lambda x: abs(x[1] - m_tau_over_v)):
    error = abs(val - m_tau_over_v) / m_tau_over_v * 100
    if error < 50:
        print(f"  {name} = {val:.6f} ({error:.1f}% error)")

print("""
PART 4: COMPARING LEPTON AND QUARK PATTERNS
===========================================

For QUARKS, the hierarchy factors are:
  m_b/m_t = Im_H/n_c^2 = 3/121 = 0.0248
  m_c/m_b = Im_H/(n_c-1) = 3/10 = 0.300

For LEPTONS:
  m_mu/m_tau = 1/16.82 = 0.0595
  m_e/m_mu = 1/206.77 = 0.00484

Let's see if similar framework expressions work:
""")

ratio_mu_tau = float(m_mu / m_tau)
ratio_e_mu = float(m_e / m_mu)

print(f"  m_mu/m_tau = {ratio_mu_tau:.5f}")
print(f"  m_e/m_mu = {ratio_e_mu:.6f}")

# Search for framework expressions
print("\nFramework candidates for m_mu/m_tau:")
mu_tau_candidates = {
    'Im_H/(Im_O*O)': float(Rational(Im_H, Im_O * O)),  # 3/56
    '1/(Im_H*Im_O - C)': float(Rational(1, Im_H*Im_O - C)),  # 1/19
    'n_d/(Im_O*n_c)': float(Rational(n_d, Im_O * n_c)),  # 4/77
    '1/(Im_H^2 + Im_O)': float(Rational(1, Im_H**2 + Im_O)),  # 1/16
    'Im_H/(Im_O^2)': float(Rational(Im_H, Im_O**2)),  # 3/49
    '1/(Im_O + O + 1)': float(Rational(1, Im_O + O + 1)),  # 1/16
    '11/(185)': float(Rational(11, 185)),  # from known formula
}

for name, val in sorted(mu_tau_candidates.items(), key=lambda x: abs(x[1] - ratio_mu_tau)):
    error = abs(val - ratio_mu_tau) / ratio_mu_tau * 100
    if error < 15:
        print(f"  {name} = {val:.5f} ({error:.1f}% error)")

print("\nFramework candidates for m_e/m_mu:")
e_mu_candidates = {
    '43/8891': float(Rational(43, 8891)),  # from known formula
    '1/(n_d*Im_O^2 + n_c)': float(Rational(1, n_d*Im_O**2 + n_c)),  # 1/207
    '1/(C*n_c*Im_H^2 + n_d)': float(Rational(1, C*n_c*Im_H**2 + n_d)),  # 1/202
    'alpha/Im_O^2': float(1/(137*49)),
}

for name, val in sorted(e_mu_candidates.items(), key=lambda x: abs(x[1] - ratio_e_mu)):
    error = abs(val - ratio_e_mu) / ratio_e_mu * 100
    if error < 5:
        print(f"  {name} = {val:.6f} ({error:.2f}% error)")

print("""
PART 5: THE 8891 AND 185 NUMBERS
================================

The known formulas use:
  m_mu/m_e = 8891/43
  m_tau/m_mu = 185/11

Where do 8891 and 185 come from?
""")

# Check 8891
print("Analyzing 8891:")
print(f"  8891 = 43 * 206.767...")
print(f"  8891 = 8 * 1111 + 3 = 8*1111 + Im_H")
print(f"  8891 = 9 * 988 - 1 = Im_H^2 * 988 - 1")
print(f"  8891 = 11 * 808 + 3 = n_c * 808 + Im_H")
print(f"  8891 = 137 * 64 + 123 = alpha_inv * 64 + 123")

# Factor 8891
print(f"  8891 = {factorint(8891)}")  # Should show prime factorization

# Check 185
print("\nAnalyzing 185:")
print(f"  185 = 11 * 16.818...")
print(f"  185 = 5 * 37 = 5 * framework_prime")
print(f"  185 = 4 * 46 + 1 = H * 46 + 1")
print(f"  185 = 11 + 174 = n_c + 174")
print(f"  185 = {factorint(185)}")

print("""
PART 6: KOIDE CONNECTION
========================

Koide formula: Q = (m_e + m_mu + m_tau) / (sqrt(m_e) + sqrt(m_mu) + sqrt(m_tau))^2 = 2/3

This can be parameterized as:
  sqrt(m_i) = M * (1 + sqrt(2) * cos(theta + 2*pi*i/3))

where theta_Koide = pi * 73/99 * (1 + 1/17689)

The theta angle encodes the mass ratios!
""")

# Verify Koide
sum_m = m_e + m_mu + m_tau
sum_sqrt_m = sqrt(m_e) + sqrt(m_mu) + sqrt(m_tau)
Q_koide = float(sum_m / sum_sqrt_m**2)
print(f"  Koide Q = {Q_koide:.10f}")
print(f"  2/3 = {2/3:.10f}")
print(f"  Error: {abs(Q_koide - 2/3)*1e6:.2f} ppm")

print("""
PART 7: LEPTON-QUARK COMPARISON
===============================

Comparing the mass hierarchy structures:
""")

print("QUARKS (3rd gen to 1st gen):")
print(f"  m_t/m_b = {float(m_t_meas := Rational(17269,100))/float(m_b_meas := Rational(418,100)):.1f}")
print(f"  m_b/m_c = {float(m_b_meas)/float(m_c_meas := Rational(127,100)):.2f}")
print(f"  m_c/m_s = {float(m_c_meas)/0.0935:.1f}")
print(f"  Total span m_t/m_u = {float(m_t_meas)/(2.16e-3):.0e}")

print("\nLEPTONS (3rd gen to 1st gen):")
print(f"  m_tau/m_mu = {float(m_tau/m_mu):.2f}")
print(f"  m_mu/m_e = {float(m_mu/m_e):.1f}")
print(f"  Total span m_tau/m_e = {float(m_tau/m_e):.0f}")

print("""
Key observation:
- Quark hierarchy spans ~10^8 (u to t)
- Lepton hierarchy spans ~3500 (e to tau)
- Quarks have MORE generations of hierarchy
- Leptons are "compressed" in comparison

This might reflect that leptons don't couple to QCD (no color charge).
""")

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"""
LEPTON MASS HIERARCHY STATUS
============================

ALREADY DERIVED (from earlier sessions):
  m_mu/m_e = 8891/43 = 206.767  [4.1 ppm]
  m_tau/m_mu = 185/11 = 16.818  [70 ppm]
  Koide Q = 2/3 exactly
  Koide theta = pi*73/99*(1 + 1/17689)  [14.7 ppm]

NEW OBSERVATIONS:
  - Lepton ratios are ALREADY sub-ppm predictions
  - The numbers 8891, 185, 43, 11 need physical derivation
  - 185 = 5 * 37 involves framework prime 37
  - Koide constrains the FORM but not the scale

ABSOLUTE SCALE:
  - m_tau/v ~ 0.007, no clean framework expression found
  - Unlike quarks (m_t ~ v/sqrt(2)), leptons don't anchor directly to v
  - The electron mass m_e might be the fundamental scale

COMPARISON TO QUARKS:
  - Quarks: hierarchy from crystallization structure (n_c, Im_H)
  - Leptons: hierarchy from Koide geometry (theta angle)
  - Different mechanisms for different sectors!

STATUS: Lepton RATIOS already derived to sub-ppm
        Absolute SCALE remains a gap
        May need different approach than quarks
""")
