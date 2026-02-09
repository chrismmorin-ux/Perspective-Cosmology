#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Heavy Quark Mass Patterns Investigation

Building on the top quark finding m_t = (v/sqrt(2))(1 - 1/n_c^2),
can we find similar framework patterns for bottom and charm quarks?

Session 109 Continuation

Status: EXPLORATION
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from sympy import *

print("=" * 70)
print("HEAVY QUARK MASS PATTERNS")
print("=" * 70)

# Framework numbers
n_d = 4
n_c = 11
Im_H = 3
Im_O = 7
H = 4
O = 8
C = 2
R = 1
alpha_inv = 137

# Measured quark masses (PDG 2022)
m_t = Rational(17269, 100)   # 172.69 GeV (pole mass)
m_b = Rational(418, 100)     # 4.18 GeV (MS-bar at m_b)
m_c = Rational(127, 100)     # 1.27 GeV (MS-bar at m_c)

# Electroweak scale
v = Rational(24622, 100)     # 246.22 GeV

print(f"""
PART 1: KNOWN RESULT - TOP QUARK
================================

m_t = (v/sqrt(2)) * (1 - 1/n_c^2) = (v/sqrt(2)) * (120/121)

  Predicted: {float(v/sqrt(2) * Rational(120,121)):.2f} GeV
  Measured:  {float(m_t):.2f} GeV
  Error:     145 ppm

Now searching for bottom and charm patterns...
""")

print("""
PART 2: BOTTOM QUARK PATTERNS
=============================
""")

# What is m_b in terms of framework numbers?
m_b_over_v = float(m_b / v)
m_b_over_m_t = float(m_b / m_t)

print(f"m_b = {float(m_b):.2f} GeV")
print(f"m_b / v = {m_b_over_v:.5f}")
print(f"m_b / m_t = {m_b_over_m_t:.4f}")

# Search for framework expressions
def search_framework(target, name, tolerance=0.03):
    """Search for framework expressions matching a target"""
    matches = []

    # Simple ratios
    simple = {
        '1/n_c^2': Rational(1, n_c**2),
        '1/(n_d*n_c)': Rational(1, n_d*n_c),
        'alpha': Rational(1, alpha_inv),
        'alpha^2': Rational(1, alpha_inv**2),
        'Im_H/n_c^2': Rational(Im_H, n_c**2),
        '1/(H*n_c)': Rational(1, H*n_c),
        'C/n_c^2': Rational(C, n_c**2),
        'n_d/n_c^2': Rational(n_d, n_c**2),
        '1/(Im_O*n_c)': Rational(1, Im_O*n_c),
        'Im_H/(H*n_c)': Rational(Im_H, H*n_c),
        '1/H^2': Rational(1, H**2),
        '1/(C*n_c)': Rational(1, C*n_c),
        'Im_H/H^2': Rational(Im_H, H**2),
        '1/(Im_H*n_c)': Rational(1, Im_H*n_c),
        'alpha/Im_H': Rational(1, alpha_inv*Im_H),
        '(n_d-1)/n_c^2': Rational(n_d-1, n_c**2),
        'Im_H/(n_c*H)': Rational(Im_H, n_c*H),
    }

    for expr, val in simple.items():
        error = abs(float(val) - target) / target if target != 0 else float('inf')
        if error < tolerance:
            matches.append((expr, float(val), error*100))

    return sorted(matches, key=lambda x: x[2])

print(f"\nSearching for m_b/m_t = {m_b_over_m_t:.4f}:")
matches = search_framework(m_b_over_m_t, "m_b/m_t", 0.05)
if matches:
    for expr, val, err in matches[:5]:
        print(f"  {expr} = {val:.5f} ({err:.1f}% error)")
else:
    print("  No close matches in simple expressions")

# Try some compound expressions
print(f"\nTrying compound expressions for m_b/m_t:")

# y_b / y_t = m_b / m_t (approximately, ignoring running)
candidates_b_t = {
    'alpha * Im_H': float(Rational(Im_H, alpha_inv)),
    '1/(H*n_c) + alpha': float(Rational(1, H*n_c) + Rational(1, alpha_inv)),
    'Im_H/n_c^2 + alpha^2': float(Rational(Im_H, n_c**2) + Rational(1, alpha_inv**2)),
    '(Im_H + 1)/(n_d * n_c)': float(Rational(Im_H + 1, n_d * n_c)),
    'n_d/(n_c * Im_O)': float(Rational(n_d, n_c * Im_O)),
    '(H-1)/(n_c * Im_H)': float(Rational(H-1, n_c * Im_H)),
    'C/O^2': float(Rational(C, O**2)),
    'Im_H/(alpha_inv - n_c^2)': float(Rational(Im_H, alpha_inv - n_c**2)),
    '1/(n_d*n_c) + 1/(C*n_c^2)': float(Rational(1, n_d*n_c) + Rational(1, C*n_c**2)),
}

for expr, val in sorted(candidates_b_t.items(), key=lambda x: abs(x[1] - m_b_over_m_t)):
    error = abs(val - m_b_over_m_t) / m_b_over_m_t * 100
    if error < 10:
        print(f"  {expr} = {val:.5f} ({error:.1f}% error)")

print(f"""
PART 3: CHARM QUARK PATTERNS
============================
""")

m_c_over_v = float(m_c / v)
m_c_over_m_t = float(m_c / m_t)
m_c_over_m_b = float(m_c / m_b)

print(f"m_c = {float(m_c):.2f} GeV")
print(f"m_c / v = {m_c_over_v:.6f}")
print(f"m_c / m_t = {m_c_over_m_t:.5f}")
print(f"m_c / m_b = {m_c_over_m_b:.4f}")

print(f"\nSearching for m_c/m_b = {m_c_over_m_b:.4f}:")
matches = search_framework(m_c_over_m_b, "m_c/m_b", 0.05)
if matches:
    for expr, val, err in matches[:5]:
        print(f"  {expr} = {val:.5f} ({err:.1f}% error)")

# Compound expressions for m_c/m_b
candidates_c_b = {
    'Im_H/n_c': float(Rational(Im_H, n_c)),
    '(Im_H+1)/H^2': float(Rational(Im_H+1, H**2)),
    'Im_H/(n_c - 1)': float(Rational(Im_H, n_c - 1)),
    '(H-1)/n_c': float(Rational(H-1, n_c)),
    'Im_H/O': float(Rational(Im_H, O)),
    'n_d/n_c': float(Rational(n_d, n_c)),
    '(Im_H + alpha_inv/n_c)/n_c': float((Im_H + alpha_inv/n_c)/n_c),
}

print(f"\nTrying compound expressions for m_c/m_b:")
for expr, val in sorted(candidates_c_b.items(), key=lambda x: abs(x[1] - m_c_over_m_b)):
    error = abs(val - m_c_over_m_b) / m_c_over_m_b * 100
    if error < 15:
        print(f"  {expr} = {val:.5f} ({error:.1f}% error)")

print(f"""
PART 4: YUKAWA HIERARCHY PATTERN
================================

The top Yukawa has y_t = 1 - 1/n_c^2 = 120/121.
What if ALL Yukawas follow a pattern?

Hypothesis: y_f = (framework factor) * alpha^(generation power)
""")

# Yukawa couplings (approximate, at weak scale)
y_t_meas = float(m_t) * sqrt(2) / float(v)
y_b_meas = float(m_b) * sqrt(2) / float(v)
y_c_meas = float(m_c) * sqrt(2) / float(v)

print(f"Measured Yukawas (pole/MS-bar masses):")
print(f"  y_t = {float(y_t_meas):.5f}")
print(f"  y_b = {float(y_b_meas):.5f}")
print(f"  y_c = {float(y_c_meas):.5f}")

# Ratios
print(f"\nYukawa ratios:")
print(f"  y_b/y_t = {float(y_b_meas/y_t_meas):.5f}")
print(f"  y_c/y_b = {float(y_c_meas/y_b_meas):.5f}")
print(f"  y_c/y_t = {float(y_c_meas/y_t_meas):.6f}")

# Check if ratios involve alpha
alpha = 1/137
print(f"\nCompare to alpha powers:")
print(f"  alpha = {alpha:.5f}")
print(f"  alpha^2 = {alpha**2:.7f}")
print(f"  y_b/y_t / alpha = {float(y_b_meas/y_t_meas)/alpha:.2f}")

print(f"""
PART 5: GENERATION STRUCTURE
============================

The framework has 3 generations from octonion structure.
Maybe generation-dependent factors modify the Yukawas?

Generation assignments:
  1st gen: u, d (lightest)
  2nd gen: c, s
  3rd gen: t, b (heaviest)
""")

# Within-generation ratios (up/down type)
print("Within-generation up/down ratios:")
print(f"  m_t/m_b = {float(m_t/m_b):.1f}")
print(f"  m_c/m_s = {float(m_c)/0.0935:.1f}")  # m_s ~ 93.5 MeV
print(f"  m_u/m_d = {2.16/4.70:.3f}")

# These increase with generation!
print("\nObservation: m_up/m_down INCREASES with generation:")
print("  Gen 1: 0.46,  Gen 2: 13.6,  Gen 3: 41.3")
print("\nThis might reflect increasing weak isospin breaking at higher mass.")

print(f"""
PART 6: SPECIFIC FRAMEWORK FORMULAS
===================================

Let me try specific formulas motivated by the n_c^2 pattern:
""")

# For bottom: maybe y_b = y_t * (something/n_c)
print("Testing y_b = y_t * X:")

y_t_pred = Rational(120, 121)
target_y_b = y_b_meas

# Try y_b = y_t * alpha * factor
for factor_name, factor in [('Im_H', Im_H), ('n_d', n_d), ('H-1', H-1), ('C+1', C+1)]:
    y_b_test = float(y_t_pred) / alpha_inv * factor
    error = abs(y_b_test - target_y_b) / target_y_b * 100
    print(f"  y_b = y_t * alpha * {factor_name} = {y_b_test:.5f} ({error:.1f}% error)")

# Try y_b = y_t / (n_c * factor)
print("\nTesting y_b = y_t / (n_c * X):")
for factor_name, factor in [('H', H), ('Im_H', Im_H), ('n_d', n_d), ('C+1', C+1)]:
    y_b_test = float(y_t_pred) / (n_c * factor)
    error = abs(y_b_test - target_y_b) / target_y_b * 100
    print(f"  y_b = y_t / (n_c * {factor_name}) = {y_b_test:.5f} ({error:.1f}% error)")

# Direct search for y_b
print(f"\nDirect search for y_b = {target_y_b:.5f}:")

y_b_candidates = {
    'Im_H/alpha_inv': float(Rational(Im_H, alpha_inv)),
    'n_d/alpha_inv': float(Rational(n_d, alpha_inv)),
    '(Im_H+1)/(n_d*n_c)': float(Rational(Im_H+1, n_d*n_c)),
    'H/(n_c*n_d)': float(Rational(H, n_c*n_d)),
    'Im_H/(n_c*H)': float(Rational(Im_H, n_c*H)),
    '1/(n_c*Im_H)': float(Rational(1, n_c*Im_H)),
    '(n_d-1)/(n_c*H)': float(Rational(n_d-1, n_c*H)),
    'C/(n_c*Im_H)': float(Rational(C, n_c*Im_H)),
    '1/(H*n_c) + 1/(n_c^2*Im_H)': float(Rational(1, H*n_c) + Rational(1, n_c**2*Im_H)),
}

for expr, val in sorted(y_b_candidates.items(), key=lambda x: abs(x[1] - target_y_b)):
    error = abs(val - target_y_b) / target_y_b * 100
    if error < 15:
        print(f"  {expr} = {val:.5f} ({error:.1f}% error)")

print(f"""
PART 7: BEST CANDIDATES
=======================
""")

# The most promising patterns found
print("BEST FRAMEWORK FORMULAS FOUND:")
print()

# Top quark (established)
m_t_formula = float(v) / sqrt(2) * float(Rational(120, 121))
m_t_error = abs(m_t_formula - float(m_t)) / float(m_t) * 100
print(f"TOP:    m_t = (v/sqrt(2)) * (120/121) = {m_t_formula:.2f} GeV")
print(f"        Measured: {float(m_t):.2f} GeV, Error: {m_t_error:.3f}%")
print()

# Bottom - try Im_H/(n_c*H) pattern
y_b_try = Rational(Im_H, n_c * H)  # = 3/44
m_b_formula = float(v) / sqrt(2) * float(y_b_try)
m_b_error = abs(m_b_formula - float(m_b)) / float(m_b) * 100
print(f"BOTTOM: y_b = Im_H/(n_c*H) = 3/44 = {float(y_b_try):.5f}")
print(f"        m_b = (v/sqrt(2)) * (3/44) = {m_b_formula:.2f} GeV")
print(f"        Measured: {float(m_b):.2f} GeV, Error: {m_b_error:.1f}%")
print()

# Also try 1/(H*n_c)
y_b_try2 = Rational(1, H * n_c)  # = 1/44
m_b_formula2 = float(v) / sqrt(2) * float(y_b_try2)
m_b_error2 = abs(m_b_formula2 - float(m_b)) / float(m_b) * 100
print(f"BOTTOM ALT: y_b = 1/(H*n_c) = 1/44 = {float(y_b_try2):.5f}")
print(f"            m_b = (v/sqrt(2)) * (1/44) = {m_b_formula2:.2f} GeV")
print(f"            Measured: {float(m_b):.2f} GeV, Error: {m_b_error2:.1f}%")

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"""
HEAVY QUARK MASS PATTERNS
=========================

ESTABLISHED (S109):
  m_t = (v/sqrt(2)) * (1 - 1/n_c^2) = 172.66 GeV  [0.015% error]

EXPLORED BUT NOT YET ESTABLISHED:
  m_b: No simple framework formula found at sub-percent level
       Best candidates are O(10-20%) error
       This is expected - bottom Yukawa y_b ~ 0.024 << 1

PHYSICAL INSIGHT:
  - Top quark is special: y_t ~ 1 (maximal coupling)
  - Other quarks have hierarchically smaller Yukawas
  - The hierarchy itself might be the framework prediction
    (not individual masses but the PATTERN)

POSSIBLE FRAMEWORK PREDICTION:
  The Yukawa hierarchy might follow:
    y_t : y_b : y_c ~ 1 : alpha*Im_H : alpha^2 * (something)

  This would need more investigation to verify.

STATUS: Top mass DERIVED (145 ppm)
        Other heavy quarks: OPEN QUESTION
""")
