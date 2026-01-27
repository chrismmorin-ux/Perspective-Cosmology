"""
PMNS CP PHASE (delta_PMNS) SEARCH

From Session 87, delta_CKM = pi * 8/21 = pi * O/(Im_H * Im_O) with 0.07% error.

The PMNS CP phase delta_PMNS is experimentally measured as:
- delta_PMNS ~ 3.5 rad (or about 200 deg)
- T2K best fit: delta = 1.36*pi ~ 4.27 rad (maximal CP violation near 3pi/2)
- NOvA best fit: delta ~ 0.82*pi ~ 2.58 rad
- Global fit (2023): delta = 1.36 +/- 0.20 pi (or about 244 +/- 36 deg)

Key: delta_PMNS should follow similar pattern as delta_CKM = pi * (dim product)/(dim product)

Division algebra dimensions:
- R = 1, C = 2, H = 4, O = 8
- n_d = 4, n_c = 11
- Im_H = 3, Im_O = 7
"""

from sympy import *
from fractions import Fraction
import math

# Division algebra dimensions
R, C, H, O = 1, 2, 4, 8
n_d = H
n_c = R + C + O  # 11
Im_H = 3
Im_O = 7

def Phi6(x):
    return x*x - x + 1

print("=" * 70)
print("PMNS CP PHASE (delta_PMNS) SEARCH")
print("=" * 70)

# Experimental values
delta_pmns_low = 2.5    # ~0.8pi
delta_pmns_central = 4.27  # ~1.36pi (T2K best fit)
delta_pmns_high = 4.9   # ~1.56pi

print(f"\nExperimental range:")
print(f"  Low:     delta ~ 0.82pi ~ {delta_pmns_low:.2f} rad")
print(f"  Central: delta ~ 1.36pi ~ {delta_pmns_central:.2f} rad (T2K)")
print(f"  High:    delta ~ 1.56pi ~ {delta_pmns_high:.2f} rad")

print(f"\nFor reference:")
print(f"  delta_CKM = pi * 8/21 ~ {math.pi * 8/21:.4f} rad (measured: 1.196 rad)")

# ============================================================
# SEARCH: delta_PMNS = pi * p/q
# ============================================================

print("\n" + "=" * 70)
print("SEARCH: delta_PMNS = pi * p/q")
print("=" * 70)

candidates = []

# Dimension products to try
dims = [R, C, H, O, n_d, n_c, Im_H, Im_O, H+O, C+O, n_d+n_c]
dim_names = {1: 'R', 2: 'C', 4: 'H', 8: 'O', 11: 'n_c', 3: 'Im_H', 7: 'Im_O',
             12: 'H+O', 10: 'C+O', 15: 'n_d+n_c'}

for num in range(1, 25):
    for den in range(1, 25):
        if math.gcd(num, den) == 1:  # coprime
            pred = math.pi * num / den

            # Check if in range
            if 2.0 < pred < 5.5:
                error_central = abs(pred - delta_pmns_central) / delta_pmns_central * 100

                # Check if num and den have nice dimension decomposition
                nice_num = num in dims or any(a*b == num for a in dims for b in dims if a <= b)
                nice_den = den in dims or any(a*b == den for a in dims for b in dims if a <= b)

                candidates.append((num, den, pred, error_central, nice_num and nice_den))

# Sort by error
candidates.sort(key=lambda x: x[3])

print("\nBest simple fractions pi * p/q:")
print("| Fraction | Predicted | Error (vs 1.36pi) | Nice dims? |")
print("|----------|-----------|------------------|------------|")
for num, den, pred, error, nice in candidates[:15]:
    nice_str = "Y" if nice else ""
    print(f"| pi*{num}/{den:2} | {pred:.4f} rad | {error:5.1f}% | {nice_str:^10} |")

# ============================================================
# SEARCH WITH DIMENSION PRODUCTS
# ============================================================

print("\n" + "=" * 70)
print("SEARCH: delta_PMNS = pi * (dim_product_1) / (dim_product_2)")
print("=" * 70)

candidates = []

# Single dimensions
single_dims = [(R, 'R'), (C, 'C'), (H, 'H'), (O, 'O'),
               (n_d, 'n_d'), (n_c, 'n_c'), (Im_H, 'Im_H'), (Im_O, 'Im_O')]

# Products of two dimensions
products = []
for v1, n1 in single_dims:
    products.append((v1, n1))
    for v2, n2 in single_dims:
        products.append((v1*v2, f"{n1}*{n2}"))
        products.append((v1+v2, f"{n1}+{n2}"))

# Deduplicate
products = list(set(products))

for v_num, n_num in products:
    for v_den, n_den in products:
        if v_num != v_den and v_den > 0:
            pred = math.pi * v_num / v_den

            if 2.0 < pred < 5.5:
                error_central = abs(pred - delta_pmns_central) / delta_pmns_central * 100
                candidates.append((n_num, n_den, v_num, v_den, pred, error_central))

# Sort by error
candidates.sort(key=lambda x: x[5])

print("\nBest dimension-based formulas:")
print("| Formula | p/q | Predicted | Error |")
print("|---------|-----|-----------|-------|")
for n_num, n_den, v_num, v_den, pred, error in candidates[:20]:
    frac = f"{v_num}/{v_den}"
    formula = f"pi*({n_num})/({n_den})"
    print(f"| {formula:35} | {frac:6} | {pred:.4f} rad | {error:5.1f}% |")

# ============================================================
# SPECIAL PATTERNS
# ============================================================

print("\n" + "=" * 70)
print("SPECIAL PATTERNS")
print("=" * 70)

# Pattern 1: Similar to delta_CKM but with different dimensions
print("\n1. CKM-like patterns (pi * D/(D*D)):")
for d1 in [R, C, H, O, n_c, Im_H, Im_O]:
    for d2 in [R, C, H, O, n_c, Im_H, Im_O]:
        for d3 in [R, C, H, O, n_c, Im_H, Im_O]:
            if d2 <= d3:
                pred = math.pi * d1 / (d2 * d3)
                if 2.0 < pred < 5.5:
                    error = abs(pred - delta_pmns_central) / delta_pmns_central * 100
                    if error < 10:
                        print(f"  pi*{d1}/({d2}*{d3}) = pi*{d1}/{d2*d3} = {pred:.4f} rad  (error: {error:.1f}%)")

# Pattern 2: pi * (sum)/(product) or pi * (product)/(sum)
print("\n2. Mixed sum/product patterns:")
for d1 in [(n_c, 'n_c'), (Im_O, 'Im_O'), (H+O, 'H+O'), (Im_H+Im_O, 'Im_H+Im_O')]:
    for d2 in [(Im_H*Im_O, 'Im_H*Im_O'), (n_d*n_c, 'n_d*n_c'), (C*Im_O, 'C*Im_O')]:
        pred = math.pi * d1[0] / d2[0]
        if 2.0 < pred < 5.5:
            error = abs(pred - delta_pmns_central) / delta_pmns_central * 100
            if error < 15:
                print(f"  pi*{d1[1]}/{d2[1]} = pi*{d1[0]}/{d2[0]} = {pred:.4f} rad  (error: {error:.1f}%)")

# Pattern 3: pi + or 2pi - something
print("\n3. pi ± small correction:")
for d1 in [R, C, H, O, n_c, Im_H, Im_O, H+O]:
    for d2 in [n_c, Im_H*Im_O, n_d*n_c, Phi6(11), Phi6(7)]:
        # pi + d1/d2
        pred = math.pi + d1/d2
        if 2.0 < pred < 5.5:
            error = abs(pred - delta_pmns_central) / delta_pmns_central * 100
            if error < 10:
                print(f"  pi + {d1}/{d2} = {pred:.4f} rad  (error: {error:.1f}%)")

        # 2pi - d1/d2
        pred = 2*math.pi - d1/d2
        if 2.0 < pred < 5.5:
            error = abs(pred - delta_pmns_central) / delta_pmns_central * 100
            if error < 10:
                print(f"  2pi - {d1}/{d2} = {pred:.4f} rad  (error: {error:.1f}%)")

# Pattern 4: Connection to delta_CKM
print("\n4. Relation to delta_CKM = pi*8/21:")
delta_ckm = math.pi * 8 / 21
print(f"  delta_CKM = {delta_ckm:.4f} rad")
print(f"  2*delta_CKM = {2*delta_ckm:.4f} rad  (error vs 1.36pi: {abs(2*delta_ckm - delta_pmns_central)/delta_pmns_central*100:.1f}%)")
print(f"  pi + delta_CKM = {math.pi + delta_ckm:.4f} rad  (error: {abs(math.pi + delta_ckm - delta_pmns_central)/delta_pmns_central*100:.1f}%)")
print(f"  2pi - delta_CKM = {2*math.pi - delta_ckm:.4f} rad  (error: {abs(2*math.pi - delta_ckm - delta_pmns_central)/delta_pmns_central*100:.1f}%)")

# ============================================================
# BEST CANDIDATES SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("BEST CANDIDATES SUMMARY")
print("=" * 70)

print("""
EXPERIMENTAL SITUATION:
- delta_PMNS is poorly constrained: 0.8pi to 1.56pi
- Central value (T2K): 1.36pi ~ 4.27 rad
- Maximal CP: 3pi/2 ~ 4.71 rad

TOP CANDIDATES (if delta ~ 1.36pi):
""")

# Best matches to 1.36pi
matches = [
    ("pi*11/8 = pi*n_c/O", math.pi * 11/8, "= 1.375pi"),
    ("pi*10/7 = pi*(C+O)/Im_O", math.pi * 10/7, "~ 1.43pi"),
    ("pi*4/3 = pi*H/Im_H", math.pi * 4/3, "~ 1.33pi"),
    ("pi*7/5", math.pi * 7/5, "= 1.4pi"),
]

for desc, pred, note in matches:
    error = abs(pred - delta_pmns_central) / delta_pmns_central * 100
    print(f"  {desc:35} = {pred:.4f} rad {note}  (error: {error:.1f}%)")

# If maximal CP (3pi/2)
print("\nIf delta = 3pi/2 (maximal CP violation):")
print(f"  pi*3/2 = {math.pi * 3/2:.4f} rad")

# ============================================================
# PROPOSED FORMULA
# ============================================================

print("\n" + "=" * 70)
print("PROPOSED FORMULA")
print("=" * 70)

# Best structural match
delta_pmns_pred = math.pi * 11 / 8
print(f"""
PROPOSAL: delta_PMNS = pi * n_c/O = pi * 11/8

Structure:
- n_c = 11 (crystal dimension)
- O = 8 (octonion dimension)
- Contrast with delta_CKM = pi * O/(Im_H * Im_O) = pi * 8/21

Interpretation:
- delta_CKM: CP violation from octonion in product of imaginary dimensions
- delta_PMNS: CP violation from crystal/octonion ratio

Predicted: delta_PMNS = {delta_pmns_pred:.4f} rad = 1.375pi = 247.5°
T2K value: delta_PMNS = 1.36pi ~ 244.8°

Error: {abs(delta_pmns_pred - delta_pmns_central)/delta_pmns_central * 100:.1f}%
""")

# Alternative
delta_alt = math.pi * 10 / 7
print(f"""
ALTERNATIVE: delta_PMNS = pi * (C+O)/Im_O = pi * 10/7

Structure:
- C+O = 10 (electroweak-strong dimension)
- Im_O = 7

Predicted: {delta_alt:.4f} rad = 1.429pi = 257.1°

Error: {abs(delta_alt - delta_pmns_central)/delta_pmns_central * 100:.1f}%
""")
