"""
LIGHT QUARK MASS RATIOS SEARCH

Measured values (PDG 2023):
- m_u/m_d = 0.46 +/- 0.09 (large uncertainty!)
- m_s/m_d = 20.2 +/- 1.5

These are poorly known due to non-perturbative QCD effects.
Need to find formulas using division algebra dimensions.

Already derived:
- m_c/m_s = H+O - 2/n_c = 12 - 2/11 ~ 11.82 (0.2% error)
- m_t/m_b = n_d * n_c - 3 = 44 - 3 = 41 (0.5% error)
"""

from sympy import *
from fractions import Fraction
import math

# Division algebra dimensions
R, C, H, O = 1, 2, 4, 8
n_d = H       # 4
n_c = R + C + O  # 11
Im_H = 3
Im_O = 7

def Phi6(x):
    return x*x - x + 1

print("=" * 70)
print("LIGHT QUARK MASS RATIOS SEARCH")
print("=" * 70)

# Measured values
mu_md_exp = 0.46  # m_u/m_d central value
ms_md_exp = 20.2  # m_s/m_d central value

print(f"\nMeasured values:")
print(f"  m_u/m_d = {mu_md_exp} +/- 0.09")
print(f"  m_s/m_d = {ms_md_exp} +/- 1.5")

# ============================================================
# SEARCH 1: m_s/m_d ~ 20
# ============================================================

print("\n" + "=" * 70)
print("SEARCH 1: m_s/m_d ~ 20.2")
print("=" * 70)

candidates = []

# Simple ratios
for num in range(1, 30):
    for den in range(1, 10):
        if math.gcd(num, den) == 1:
            val = num / den
            if 18 < val < 23:
                error = abs(val - ms_md_exp) / ms_md_exp * 100
                candidates.append((f"{num}/{den}", val, error))

# With dimensions
for a in [n_c, n_d, Im_H, Im_O, O, H, C, R]:
    for b in [n_c, n_d, Im_H, Im_O, O, H, C, R]:
        if a != b:
            # a + b
            val = a + b
            if 18 < val < 23:
                error = abs(val - ms_md_exp) / ms_md_exp * 100
                candidates.append((f"{a}+{b}", val, error))

            # a * b / c
            for c in [n_c, n_d, Im_H, Im_O, O, H, C]:
                val = a * b / c
                if 18 < val < 23:
                    error = abs(val - ms_md_exp) / ms_md_exp * 100
                    candidates.append((f"{a}*{b}/{c}", val, error))

# With Phi_6
for x in [7, 11, 12]:
    for d in [1, 2, 3, 4, 7, 8, 11]:
        val = Phi6(x) / d
        if 18 < val < 23:
            error = abs(val - ms_md_exp) / ms_md_exp * 100
            candidates.append((f"Phi_6({x})/{d}", val, error))

candidates.sort(key=lambda x: x[2])

print("\nBest candidates for m_s/m_d:")
for formula, val, error in candidates[:15]:
    print(f"  {formula:20} = {val:.3f}  (error: {error:.1f}%)")

# ============================================================
# SEARCH 2: m_u/m_d ~ 0.46
# ============================================================

print("\n" + "=" * 70)
print("SEARCH 2: m_u/m_d ~ 0.46")
print("=" * 70)

candidates = []

# Simple fractions
for num in range(1, 15):
    for den in range(1, 30):
        if math.gcd(num, den) == 1:
            val = num / den
            if 0.35 < val < 0.60:
                error = abs(val - mu_md_exp) / mu_md_exp * 100
                candidates.append((f"{num}/{den}", val, error))

# With dimensions
for a in [R, C, H, n_d, Im_H]:
    for b in [n_c, n_d, Im_H, Im_O, O, H, C+O, H+O]:
        val = a / b
        if 0.35 < val < 0.60:
            error = abs(val - mu_md_exp) / mu_md_exp * 100
            candidates.append((f"{a}/{b}", val, error))

# Special forms: 1/2 - small
for a in range(1, 10):
    for b in range(5, 50):
        val = 0.5 - a/b
        if 0.35 < val < 0.60:
            error = abs(val - mu_md_exp) / mu_md_exp * 100
            candidates.append((f"1/2-{a}/{b}", val, error))

# 1/2 - 1/n_c etc
for d in [n_c, H+O, Im_O*C, Phi6(7), Phi6(11)]:
    val = 0.5 - 1/d
    if 0.35 < val < 0.60:
        error = abs(val - mu_md_exp) / mu_md_exp * 100
        candidates.append((f"1/2-1/{d}", val, error))

candidates.sort(key=lambda x: x[2])

print("\nBest candidates for m_u/m_d:")
for formula, val, error in candidates[:15]:
    print(f"  {formula:20} = {val:.4f}  (error: {error:.1f}%)")

# ============================================================
# PATTERN ANALYSIS
# ============================================================

print("\n" + "=" * 70)
print("PATTERN ANALYSIS")
print("=" * 70)

print("""
QUARK MASS RATIO PATTERNS:

Already derived:
  m_c/m_s = H+O - 2/n_c ~ 11.82
  m_t/m_b = n_d*n_c - 3 = 41

For light quarks:
  m_s/m_d ~ 20 (need)
  m_u/m_d ~ 0.46 (need)

Note: m_s/m_u ~ 20/0.46 ~ 43.5 ~ Phi_6(7) = 43!

This suggests:
  m_s/m_u = Phi_6(Im_O) = Phi_6(7) = 43
""")

# Check m_s/m_u
ms_mu = ms_md_exp / mu_md_exp
print(f"\nm_s/m_u = m_s/m_d * m_d/m_u = {ms_md_exp}/{mu_md_exp} = {ms_mu:.1f}")
print(f"Phi_6(7) = 43")
print(f"Error: {abs(ms_mu - 43)/ms_mu * 100:.1f}%")

# If m_s/m_u = 43, then:
# m_u/m_d = m_s/m_d / (m_s/m_u) = 20.2/43 ~ 0.47
print(f"\nIf m_s/m_u = Phi_6(7) = 43:")
print(f"Then m_u/m_d = m_s/m_d / 43 = {ms_md_exp}/43 = {ms_md_exp/43:.4f}")
print(f"Measured m_u/m_d = {mu_md_exp}")

# ============================================================
# CONNECTED FORMULAS
# ============================================================

print("\n" + "=" * 70)
print("CONNECTED FORMULAS")
print("=" * 70)

# Try: m_s/m_d = n_c + O = 19 or n_c + n_d + ... = 20
val = n_c + O + R  # 11 + 8 + 1 = 20
print(f"m_s/m_d = n_c + O + R = 11 + 8 + 1 = {val}")
print(f"Error: {abs(val - ms_md_exp)/ms_md_exp * 100:.1f}%")

# m_u/m_d from m_s ratios
# If m_s/m_d = 20 and m_s/m_u = 43
# Then m_u/m_d = 20/43 ~ 0.465
print(f"\nIf m_s/m_d = n_c + O + R = 20:")
print(f"And m_s/m_u = Phi_6(7) = 43:")
print(f"Then m_u/m_d = (n_c + O + R)/Phi_6(7) = 20/43 = {20/43:.4f}")
print(f"Measured: {mu_md_exp}")
print(f"Error: {abs(20/43 - mu_md_exp)/mu_md_exp * 100:.1f}%")

# ============================================================
# FINAL FORMULAS
# ============================================================

print("\n" + "=" * 70)
print("PROPOSED FORMULAS")
print("=" * 70)

# Formula 1: m_s/m_u = Phi_6(Im_O) = 43
ms_mu_pred = Phi6(Im_O)
ms_mu_exp_val = ms_md_exp / mu_md_exp
error_1 = abs(ms_mu_pred - ms_mu_exp_val) / ms_mu_exp_val * 100

print(f"""
FORMULA 1: m_s/m_u = Phi_6(Im_O) = Phi_6(7) = 43

Predicted: 43
Measured:  {ms_mu_exp_val:.1f}
Error:     {error_1:.1f}%
""")

# Formula 2: m_s/m_d = n_c + O + R = 20
ms_md_pred = n_c + O + R
error_2 = abs(ms_md_pred - ms_md_exp) / ms_md_exp * 100

print(f"""
FORMULA 2: m_s/m_d = n_c + O + R = 11 + 8 + 1 = 20

Predicted: {ms_md_pred}
Measured:  {ms_md_exp}
Error:     {error_2:.1f}%
""")

# Formula 3: m_u/m_d (derived)
mu_md_pred = ms_md_pred / ms_mu_pred
error_3 = abs(mu_md_pred - mu_md_exp) / mu_md_exp * 100

print(f"""
FORMULA 3: m_u/m_d = (m_s/m_d)/(m_s/m_u) = 20/43

Predicted: {mu_md_pred:.4f}
Measured:  {mu_md_exp}
Error:     {error_3:.1f}%
""")

# ============================================================
# ALTERNATIVE: Direct formula for m_s/m_d
# ============================================================

print("\n" + "-" * 70)
print("ALTERNATIVE FORMULAS")
print("-" * 70)

# m_s/m_d = C * n_c - C = 2*11 - 2 = 20
alt1 = C * n_c - C
print(f"m_s/m_d = C*(n_c - 1) = 2*(11-1) = {alt1}")
print(f"Error: {abs(alt1 - ms_md_exp)/ms_md_exp * 100:.1f}%")

# m_s/m_d = H+O + O = 20
alt2 = H + O + O
print(f"m_s/m_d = H + 2*O = 4 + 16 = {alt2}")
print(f"Error: {abs(alt2 - ms_md_exp)/ms_md_exp * 100:.1f}%")

# m_s/m_d = n_c + n_d + n_d + R = 20
alt3 = n_c + n_d + n_d + R
print(f"m_s/m_d = n_c + 2*n_d + R = 11 + 8 + 1 = {alt3}")
print(f"Error: {abs(alt3 - ms_md_exp)/ms_md_exp * 100:.1f}%")
