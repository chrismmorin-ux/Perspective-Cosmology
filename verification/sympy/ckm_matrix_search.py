"""
CKM Matrix Element Search
=========================

Search for division algebra formulas for CKM matrix elements.

The CKM matrix describes quark flavor mixing:
|V_ud  V_us  V_ub|
|V_cd  V_cs  V_cb|
|V_td  V_ts  V_tb|

Key measured values (magnitudes):
|V_ud| = 0.97373(31)
|V_us| = 0.2243(8)
|V_ub| = 0.00382(24)
|V_cd| = 0.221(4)
|V_cs| = 0.975(6)
|V_cb| = 0.0408(14)
|V_td| = 0.0086(2)
|V_ts| = 0.0415(9)
|V_tb| = 1.014(29)

Wolfenstein parameters (more fundamental):
lambda = 0.22650(48)   (Cabibbo angle parameter)
A = 0.790(17)
rho_bar = 0.141(17)
eta_bar = 0.357(11)
"""

from sympy import Rational, sqrt, cos, sin, pi
import math

# Division algebra dimensions
R, C, H, O = 1, 2, 4, 8
Im_H, Im_O = 3, 7

# Derived quantities
n_d = H  # 4
n_c = R + C + O  # 11
H_plus_O = H + O  # 12
C_plus_O = C + O  # 10

# Cyclotomic
def phi6(x):
    return x**2 - x + 1

print("=" * 60)
print("CKM MATRIX ELEMENT SEARCH")
print("=" * 60)

# Key: lambda = sin(theta_Cabibbo) = 0.22650
# This is similar to sin^2(theta_W) = 0.231!

lambda_ckm = 0.22650
sin2_theta_W = 0.23121

print(f"\nlambda (Cabibbo) = {lambda_ckm}")
print(f"sin^2(theta_W) = {sin2_theta_W}")
print(f"Ratio: {sin2_theta_W / lambda_ckm:.4f}")
print()

# Search for lambda = sin(theta_Cabibbo)
print("--- Searching lambda (Cabibbo parameter) ---\n")

candidates = []

# lambda is close to 0.226 ~ 1/4.4
# Or: lambda = sin(13 degrees) approximately

# Try simple ratios
for num in range(1, 30):
    for denom in [4, 7, 8, 11, 12, 23, 43, 72, 111, 133]:
        val = num / denom
        error_ppm = abs(val - lambda_ckm) / lambda_ckm * 1e6
        if error_ppm < 5000:  # 0.5%
            candidates.append((f"{num}/{denom}", val, error_ppm))

# Try (1/4) * (1 - small) like sin^2(theta_W)
for num in range(1, 20):
    for denom in [7, 11, 12, 23, 43, 72, 111, 133]:
        val = 0.25 * (1 - num/denom)
        error_ppm = abs(val - lambda_ckm) / lambda_ckm * 1e6
        if error_ppm < 5000:
            candidates.append((f"(1/4)(1 - {num}/{denom})", val, error_ppm))

# Structured approaches
# sin^2(theta_W) = 123/532 = (1/4)(1 - 10/133)
# What if lambda = sin^2(theta_W) * (1 + small) or similar?

# Try: lambda = (C+O)/(n_d^2 + n_c^2 - C_plus_O) = 10/127
val = C_plus_O / (n_d**2 + n_c**2 - C_plus_O)
error_ppm = abs(val - lambda_ckm) / lambda_ckm * 1e6
candidates.append((f"(C+O)/(n_d^2+n_c^2-C+O) = 10/127", val, error_ppm))

# Try: lambda = 5/22 = 0.2273
val = 5/22
error_ppm = abs(val - lambda_ckm) / lambda_ckm * 1e6
candidates.append((f"5/22 = 5/(2*n_c)", val, error_ppm))

# Try: lambda = n_d/n_c - 1/(n_d*n_c) = 4/11 - 1/44 = 15/44 = 0.341... too big
# Try: lambda = 1/n_d - 1/(n_c + n_d + 1) = 1/4 - 1/16 = 3/16 = 0.1875... too small

# Actually, 0.2265 is close to 2.5/11 = 0.227
val = Rational(5, 22)  # = 5/(2*11)
error_ppm = abs(float(val) - lambda_ckm) / lambda_ckm * 1e6
candidates.append((f"5/(2*n_c) = 5/22", float(val), error_ppm))

# Try: (C+H)/(H+O+n_c) = 6/23 = 0.2609... too big
# Try: (C+Im_H)/((C+Im_H)^2 - C) = 5/23 = 0.2174
val = 5/23
error_ppm = abs(val - lambda_ckm) / lambda_ckm * 1e6
candidates.append(("5/(n_d^2+Im(O)) = 5/23", val, error_ppm))

# lambda^2 is often used: lambda^2 = 0.0513
# This is close to 1/19.5

# Try: lambda = 10/(n_c + n_d^2 + n_c + n_d) = 10/44 = 5/22 = 0.227
val = C_plus_O / (n_c + n_d**2 + n_c + n_d)
error_ppm = abs(val - lambda_ckm) / lambda_ckm * 1e6
candidates.append((f"(C+O)/(2*n_c + n_d^2 + n_d) = 10/44", val, error_ppm))

# Try: Im(O)/(H+O+n_c+n_d+C) = 7/31 = 0.226!
val = Im_O / (H_plus_O + n_c + n_d + C)
error_ppm = abs(val - lambda_ckm) / lambda_ckm * 1e6
candidates.append((f"Im(O)/(H+O+n_c+n_d+C) = 7/31", val, error_ppm))

# What is 31?
# 31 = H+O + n_c + n_d + C = 12 + 11 + 4 + 2 = 29... no
# 31 = H+O + n_c + Im(O) - 1 = 12 + 11 + 7 - 1 = 29... no
# Let's check: H+O + n_c + n_d + C = 12 + 11 + 4 + 2 = 29
print(f"H+O + n_c + n_d + C = {H_plus_O + n_c + n_d + C}")

# 7/31 = 0.2258, lambda = 0.2265
val = 7/31
error_ppm = abs(val - lambda_ckm) / lambda_ckm * 1e6
candidates.append(("7/31", val, error_ppm))

# What gives 31?
# 31 = n_d^2 + n_c + n_d = 16 + 11 + 4 = 31!
val = Im_O / (n_d**2 + n_c + n_d)
error_ppm = abs(val - lambda_ckm) / lambda_ckm * 1e6
candidates.append((f"Im(O)/(n_d^2 + n_c + n_d) = 7/31", val, error_ppm))

# Sort candidates
candidates.sort(key=lambda x: x[2])

print("Best formulas for lambda (Cabibbo):")
print("-" * 50)
for c in candidates[:15]:
    print(f"  {c[0]}: {c[1]:.6f}, error = {c[2]:.0f} ppm")

# Best candidate: 7/31 = Im(O)/(n_d^2 + n_c + n_d)
print("\n" + "=" * 60)
print("BEST CANDIDATE FOR CABIBBO PARAMETER")
print("=" * 60)
print(f"\nlambda = Im(O)/(n_d^2 + n_c + n_d)")
print(f"       = 7/(16 + 11 + 4)")
print(f"       = 7/31")
print(f"       = {7/31:.6f}")
print(f"\nMeasured: {lambda_ckm}")
print(f"Error: {abs(7/31 - lambda_ckm)/lambda_ckm * 1e6:.0f} ppm")

# Now check other CKM elements
print("\n" + "=" * 60)
print("OTHER CKM ELEMENTS")
print("=" * 60)

# |V_us| = lambda = 0.2243 (a bit different from Wolfenstein lambda)
V_us = 0.2243
print(f"\n|V_us| = {V_us}")

# Try: 5/22 for V_us
val = 5/22
print(f"5/(2*n_c) = 5/22 = {val:.4f}, error = {abs(val-V_us)/V_us*1e6:.0f} ppm")

# |V_cb| = A*lambda^2 = 0.0408
V_cb = 0.0408
print(f"\n|V_cb| = {V_cb}")
# lambda^2 = 0.0513, A = 0.0408/0.0513 = 0.795

# Try: n_d/(n_c * O) = 4/88 = 1/22 = 0.0455
val = n_d / (n_c * O)
print(f"n_d/(n_c*O) = 4/88 = {val:.4f}, error = {abs(val-V_cb)/V_cb*100:.1f}%")

# Try: Im(H)/(O*n_c) = 3/88 = 0.0341
val = Im_H / (O * n_c)
print(f"Im(H)/(O*n_c) = 3/88 = {val:.4f}, error = {abs(val-V_cb)/V_cb*100:.1f}%")

# Try: n_d/97 where 97 = n_d^2 + n_c^2 - n_c*n_d = 16+121-44 = 93... no
# 4/98 = 0.0408 exactly!
print(f"\n4/98 = 2/49 = {4/98:.4f}, error = {abs(4/98-V_cb)/V_cb*1e6:.0f} ppm")

# What is 98 = 2 * 49 = 2 * 7^2 = C * Im(O)^2
val = n_d / (C * Im_O**2)
print(f"n_d/(C*Im(O)^2) = 4/98 = {val:.6f}")

# |V_ub| = A*lambda^3*sqrt(rho^2+eta^2) = 0.00382
V_ub = 0.00382
print(f"\n|V_ub| = {V_ub}")

# 0.00382 close to 1/262
# Try: 1/(n_d^2 + n_c^2 + n_c^2) = 1/(16+121+121) = 1/258 = 0.00388
val = 1/(n_d**2 + 2*n_c**2)
print(f"1/(n_d^2 + 2*n_c^2) = 1/258 = {val:.5f}, error = {abs(val-V_ub)/V_ub*100:.1f}%")

# Summary
print("\n" + "=" * 60)
print("CKM SUMMARY")
print("=" * 60)

print("\nProposed formulas:")
print(f"  lambda = Im(O)/(n_d^2 + n_c + n_d) = 7/31 = 0.2258 (vs 0.2265, 0.3%)")
print(f"  |V_us| = 5/(2*n_c) = 5/22 = 0.2273 (vs 0.2243, 1.3%)")
print(f"  |V_cb| = n_d/(C*Im(O)^2) = 4/98 = 0.0408 (exact match!)")
print(f"  |V_ub| = 1/(n_d^2 + 2*n_c^2) = 1/258 = 0.00388 (vs 0.00382, 1.6%)")
