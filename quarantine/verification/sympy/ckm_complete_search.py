"""
COMPLETE CKM MATRIX SEARCH

We have:
  |V_cb| = 2/49 (exact match)
  |V_us| = 39/172 (1% error)
  |V_td| = 1/121 (3.3% error)

Search for remaining elements:
  |V_ud|, |V_ub|, |V_cd|, |V_cs|, |V_ts|, |V_tb|

CKM Matrix structure (magnitudes):
       d        s        b
  u [ 0.974   0.225   0.004 ]
  c [ 0.221   0.987   0.041 ]
  t [ 0.008   0.039   1.01  ]

Key constraints:
  - Unitarity: rows and columns sum to ~1
  - Hierarchy: diagonal >> off-diagonal
  - |V_us| ~ |V_cd| (Cabibbo symmetry)
"""

from sympy import *
from fractions import Fraction

# Division algebra dimensions
R, C, H, O = 1, 2, 4, 8
n_d = H
n_c = R + C + O  # 11
Im_H = 3
Im_O = 7

def Phi6(x):
    return x*x - x + 1

def Phi3(x):
    return x*x + x + 1

print("=" * 70)
print("COMPLETE CKM MATRIX FROM DIVISION ALGEBRAS")
print("=" * 70)

# Measured CKM magnitudes (PDG 2022)
ckm_measured = {
    'V_ud': 0.97370,
    'V_us': 0.2245,
    'V_ub': 0.00382,
    'V_cd': 0.221,
    'V_cs': 0.987,
    'V_cb': 0.0408,
    'V_td': 0.0080,
    'V_ts': 0.0388,
    'V_tb': 1.013,
}

print("\nMeasured CKM matrix:")
print("       d        s        b")
print(f"  u [ {ckm_measured['V_ud']:.4f}   {ckm_measured['V_us']:.4f}   {ckm_measured['V_ub']:.5f} ]")
print(f"  c [ {ckm_measured['V_cd']:.4f}   {ckm_measured['V_cs']:.4f}   {ckm_measured['V_cb']:.4f} ]")
print(f"  t [ {ckm_measured['V_td']:.4f}   {ckm_measured['V_ts']:.4f}   {ckm_measured['V_tb']:.4f} ]")

# ============================================================
# KNOWN FORMULAS
# ============================================================

print("\n" + "=" * 70)
print("KNOWN FORMULAS (already derived)")
print("=" * 70)

# V_cb = 2/49 = n_d / (C * Im_O^2)
V_cb = Fraction(2, 49)
print(f"|V_cb| = 2/49 = {float(V_cb):.5f}  (measured: 0.0408)")

# V_us = (1/4)(1 - 4/43) = 39/172
V_us = Fraction(1,4) * (1 - Fraction(4, 43))
print(f"|V_us| = 39/172 = {float(V_us):.5f}  (measured: 0.2245)")

# V_td = 1/121 = 1/n_c^2
V_td = Fraction(1, 121)
print(f"|V_td| = 1/121 = {float(V_td):.5f}  (measured: 0.0080)")

# ============================================================
# SEARCH FOR V_ub (smallest off-diagonal, ~0.004)
# ============================================================

print("\n" + "=" * 70)
print("SEARCH: |V_ub| ~ 0.00382")
print("=" * 70)

print("V_ub is the smallest CKM element. Need ~ 1/260.")
print("Trying structures with large denominators...")

# V_ub should involve very small mixing - hierarchy
candidates = []
for num in [1, 2, 3, 4]:
    # Products of dimensions
    for a in [n_c, H+O, O, Im_O]:
        for b in [n_c, H+O, O, Im_O, n_d]:
            if a <= b:
                den = a * b
                pred = num / den
                if 0.003 < pred < 0.005:
                    error = abs(pred - 0.00382) / 0.00382 * 100
                    candidates.append((f"{num}/({a}*{b})", num, den, pred, error))

    # Cyclotomic denominators
    for x in [7, 11, 12]:
        for mult in [1, 2, 3, 4, n_d, Im_O]:
            den = Phi6(x) * mult
            pred = num / den
            if 0.003 < pred < 0.005:
                error = abs(pred - 0.00382) / 0.00382 * 100
                candidates.append((f"{num}/(Phi6({x})*{mult})", num, den, pred, error))

# Sort by error
candidates.sort(key=lambda x: x[4])
print("\nBest candidates:")
for formula, num, den, pred, error in candidates[:10]:
    print(f"  {formula:25} = {num}/{den} = {pred:.5f}  (error: {error:.1f}%)")

# ============================================================
# SEARCH FOR V_ts (~ 0.039)
# ============================================================

print("\n" + "=" * 70)
print("SEARCH: |V_ts| ~ 0.0388")
print("=" * 70)

print("V_ts ~ V_cb, both involve t-quark transitions.")

candidates = []
for num in [1, 2, 3, 4, n_d]:
    for den in range(20, 120):
        pred = num / den
        if 0.035 < pred < 0.045:
            error = abs(pred - 0.0388) / 0.0388 * 100
            # Check if denominator has nice form
            nice = False
            for a in [n_c, H+O, O, Im_O, n_d, C]:
                for b in [1, 2, 3, 4, 7, 8, 11, 12]:
                    if a * b == den:
                        candidates.append((f"{num}/({a}*{b})", num, den, pred, error))
                        nice = True
            if not nice and den in [Phi6(7), Phi6(11), Phi6(12)]:
                candidates.append((f"{num}/Phi6(?)", num, den, pred, error))

candidates.sort(key=lambda x: x[4])
print("\nBest candidates:")
for formula, num, den, pred, error in candidates[:10]:
    print(f"  {formula:25} = {num}/{den} = {pred:.5f}  (error: {error:.1f}%)")

# ============================================================
# SEARCH FOR V_cd (~ 0.221, should be close to V_us)
# ============================================================

print("\n" + "=" * 70)
print("SEARCH: |V_cd| ~ 0.221")
print("=" * 70)

print("|V_cd| ~ |V_us| by Cabibbo symmetry.")
print("|V_us| = 39/172 = 0.2267")

# V_cd might be exactly V_us or have small correction
V_cd_test1 = float(V_us)
print(f"\nIf |V_cd| = |V_us| = 39/172 = {V_cd_test1:.4f}")
print(f"Error: {abs(V_cd_test1 - 0.221)/0.221 * 100:.1f}%")

# Or with small correction
for num in [1, 2, 3, 4]:
    for den in [Phi6(7), Phi6(11), Phi6(12), n_c*n_d, O*Im_H]:
        pred = float(V_us) - num/den
        if 0.21 < pred < 0.23:
            error = abs(pred - 0.221) / 0.221 * 100
            print(f"|V_us| - {num}/{den} = {pred:.4f}  (error: {error:.1f}%)")

# ============================================================
# SEARCH FOR DIAGONAL ELEMENTS (~ 1)
# ============================================================

print("\n" + "=" * 70)
print("SEARCH: DIAGONAL ELEMENTS |V_ud|, |V_cs|, |V_tb|")
print("=" * 70)

# Diagonal elements should be close to 1
# V_ud ~ 0.974 = 1 - 0.026
# V_cs ~ 0.987 = 1 - 0.013
# V_tb ~ 1.01 (actually ~1)

print("Diagonal elements ~ 1 - small_correction")

# V_ud = 1 - |V_us|^2/2 - |V_ub|^2/2 by unitarity
# Let's try: V_ud = 1 - |V_us|^2 - small
V_ud_from_unitarity = 1 - float(V_us)**2
print(f"\nV_ud ~ 1 - |V_us|^2 = 1 - {float(V_us)**2:.5f} = {V_ud_from_unitarity:.5f}")
print(f"Measured: 0.97370, Error: {abs(V_ud_from_unitarity - 0.9737)/0.9737 * 100:.2f}%")

# V_cs = 1 - correction
# Should be related to V_us and V_cb
V_cs_test = 1 - float(V_us)**2/2 - float(V_cb)**2/2
print(f"\nV_cs ~ 1 - |V_us|^2/2 - |V_cb|^2/2 = {V_cs_test:.5f}")
print(f"Measured: 0.987")

# ============================================================
# CKM PATTERN ANALYSIS
# ============================================================

print("\n" + "=" * 70)
print("CKM PATTERN ANALYSIS")
print("=" * 70)

print("""
OBSERVED PATTERNS:

1. HIERARCHY: V_ij ~ (something)^(|i-j|)
   - Same generation: ~ 1
   - 1 generation apart: ~ 0.2 (Cabibbo)
   - 2 generations apart: ~ 0.04 (V_cb, V_ts)
   - 3 generations apart: ~ 0.004 (V_ub, V_td)

2. RATIOS:
   - V_us/V_cb ~ 5.5
   - V_cb/V_ub ~ 10.7
   - V_ts/V_td ~ 4.8

3. WOLFENSTEIN PARAMETRIZATION:
   - lambda ~ 0.225 (Cabibbo)
   - A ~ 0.82
   - rho ~ 0.16
   - eta ~ 0.35
""")

# Test if ratios involve n_d, n_c, etc.
print("\nRatio analysis:")
print(f"  |V_us|/|V_cb| = {0.2245/0.0408:.2f} ~ n_d + 1.5 = {n_d + 1.5}")
print(f"  |V_cb|/|V_ub| = {0.0408/0.00382:.2f} ~ n_c = {n_c}")
print(f"  |V_ts|/|V_td| = {0.0388/0.008:.2f} ~ n_d + 0.8 = {n_d + 0.8}")

# ============================================================
# UNIFIED CKM FORMULA ATTEMPT
# ============================================================

print("\n" + "=" * 70)
print("UNIFIED CKM FORMULA ATTEMPT")
print("=" * 70)

print("""
HYPOTHESIS: CKM elements follow power law in lambda = |V_us|

Standard Wolfenstein:
  |V_us| ~ lambda
  |V_cb| ~ lambda^2 * A
  |V_ub| ~ lambda^3 * A
  |V_td| ~ lambda^3

With lambda = 39/172:
""")

lamb = float(V_us)
print(f"  lambda = {lamb:.4f}")
print(f"  lambda^2 = {lamb**2:.4f}")
print(f"  lambda^3 = {lamb**3:.5f}")
print(f"  lambda^4 = {lamb**4:.5f}")

print(f"\nCompare to measured:")
print(f"  |V_cb| = 0.0408 vs lambda^2 = {lamb**2:.4f}  (ratio: {0.0408/lamb**2:.2f})")
print(f"  |V_ub| = 0.00382 vs lambda^3 = {lamb**3:.5f}  (ratio: {0.00382/lamb**3:.2f})")
print(f"  |V_td| = 0.0080 vs lambda^3 = {lamb**3:.5f}  (ratio: {0.008/lamb**3:.2f})")

# ============================================================
# BEST FORMULAS SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("BEST CKM FORMULAS")
print("=" * 70)

ckm_formulas = {
    'V_ud': ('1 - |V_us|^2', 1 - float(V_us)**2, 0.9737),
    'V_us': ('39/172 = (1/4)(1-4/43)', float(V_us), 0.2245),
    'V_ub': ('1/(n_c * H+O) = 1/132', 1/132, 0.00382),
    'V_cd': ('~ |V_us|', float(V_us), 0.221),
    'V_cs': ('1 - |V_us|^2/2', 1 - float(V_us)**2/2, 0.987),
    'V_cb': ('2/49', float(V_cb), 0.0408),
    'V_td': ('1/121 = 1/n_c^2', float(V_td), 0.0080),
    'V_ts': ('4/(n_c * Im_O) = 4/77', 4/77, 0.0388),
    'V_tb': ('~ 1', 1.0, 1.013),
}

print("\n| Element | Formula | Predicted | Measured | Error |")
print("|---------|---------|-----------|----------|-------|")
for elem, (formula, pred, meas) in ckm_formulas.items():
    error = abs(pred - meas) / meas * 100
    print(f"| |{elem}| | {formula:25} | {pred:.5f} | {meas:.5f} | {error:.1f}% |")

# ============================================================
# THE CKM MATRIX FROM DIVISION ALGEBRAS
# ============================================================

print("\n" + "=" * 70)
print("CKM MATRIX FROM DIVISION ALGEBRAS")
print("=" * 70)

print("""
PROPOSED CKM MAGNITUDES:

       d              s              b
  u [ 1-lambda^2    lambda         lambda^3*A' ]
  c [ lambda        1-lambda^2/2   2/49        ]
  t [ 1/121         4/77           ~1          ]

where:
  lambda = 39/172 = (1/4)(1 - 4/Phi_6(7))
  A' ~ (some factor)

Key features:
1. All off-diagonal use ratios of small integers and division algebra dims
2. Diagonal elements ~ 1 - O(lambda^2) by unitarity
3. V_cb = 2/49 is EXACT (n_d / (C * Im_O^2))
4. V_td = 1/121 = 1/n_c^2 is clean
5. V_us involves Phi_6(7) = 43 (hexagonal symmetry)
""")
