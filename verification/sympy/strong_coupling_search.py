"""
Strong Coupling alpha_s Search
==========================

Search for division algebra formulas for alpha_s(M_Z) ~ 0.1179

The pattern from other constants:
- alpha: 137 + 4/111 (uses n_d, n_c, Phi_6)
- m_p/m_e: 1836 + 11/72 (uses H+O, Im(H), n_c, O)
- sin^2theta_W: 123/532 (uses 1/4, C+O, Phi_6(H+O))

Can we find alpha_s from similar ingredients?
"""

from sympy import *

# Division algebra dimensions
R, C, H, O = 1, 2, 4, 8
Im_H, Im_O = 3, 7  # Imaginary dimensions

# Derived quantities
n_d = H  # 4
n_c = R + C + O  # 11
H_plus_O = H + O  # 12
C_plus_O = C + O  # 10

# Cyclotomic polynomial Phi_6(x) = x^2 - x + 1
def phi6(x):
    return x**2 - x + 1

# Known cyclotomic values
phi6_7 = phi6(7)    # 43
phi6_11 = phi6(11)  # 111
phi6_12 = phi6(12)  # 133

# Measured value
alpha_s_measured = 0.1179  # alpha_s(M_Z) from PDG
one_over_alpha_s = 1 / alpha_s_measured  # ~ 8.48

print("=" * 60)
print("STRONG COUPLING alpha_s(M_Z) SEARCH")
print("=" * 60)
print(f"\nMeasured: alpha_s = {alpha_s_measured}")
print(f"1/alpha_s = {one_over_alpha_s:.4f}")
print()

# Key observation: 1/alpha_s ~ 8.48 ~ dim(O)
print("Key observation: 1/alpha_s ~ 8.48 ~ dim(O) = 8")
print()

# Search for simple formulas
print("=" * 60)
print("SEARCHING SIMPLE FORMULAS")
print("=" * 60)

candidates = []

# Pattern 1: O + correction (like alpha = 137 + correction)
for num in [1, 2, 3, 4, 7, 8, 10, 11, 12]:
    for denom in [7, 11, 12, 43, 72, 111, 133]:
        val = O + num/denom
        error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
        if error_ppm < 5000:  # 0.5%
            candidates.append((f"O + {num}/{denom}", val, error_ppm))

# Pattern 2: O - correction
for num in [1, 2, 3, 4, 7, 8, 10, 11, 12]:
    for denom in [7, 11, 12, 43, 72, 111, 133]:
        val = O - num/denom
        error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
        if error_ppm < 5000:
            candidates.append((f"O - {num}/{denom}", val, error_ppm))

# Pattern 3: Simple ratios
for num in [43, 72, 111, 133, n_c * n_d, H_plus_O * n_c]:
    for denom in [5, 8, 9, 13, 15, 16]:
        val = num / denom
        error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
        if error_ppm < 5000:
            candidates.append((f"{num}/{denom}", val, error_ppm))

# Pattern 4: alpha-based (alpha_s could be related to alpha)
alpha = 1/137.036
for power in [1, 2, 3, 4, Rational(1,2), Rational(1,3)]:
    val = 1 / (O * alpha**float(power))
    # This gives large numbers, skip

# Pattern 5: QCD-specific: Im(O) + something
for num in [1, 2, 3, 4, 8, 11, 12]:
    for denom in [7, 11, 12, 43, 72, 111, 133]:
        val = Im_O + num/denom
        error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
        if error_ppm < 5000:
            candidates.append((f"Im(O) + {num}/{denom}", val, error_ppm))

# Pattern 6: (H+O)/sqrt(2) or similar
import math
val = H_plus_O / math.sqrt(2)
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
if error_ppm < 5000:
    candidates.append((f"(H+O)/sqrt2", val, error_ppm))

# Pattern 7: sqrt combinations
val = math.sqrt(72)
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
if error_ppm < 5000:
    candidates.append((f"sqrt72", val, error_ppm))

val = math.sqrt(O * Im_O + C)  # sqrt58
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
candidates.append((f"sqrt(O*Im(O)+C) = sqrt58", val, error_ppm))

# Pattern 8: Based on the formula structure
# sin^2theta_W = (1/4)(1 - 10/133), what if alpha_s = (1/O)(1 + something)?
for num in [1, 2, 3, 4, 7, 10, 11, 12]:
    for denom in [7, 11, 12, 43, 72, 111, 133]:
        val = (1/O) * (1 + num/denom)
        inv_val = 1/val if val > 0 else 0
        error_ppm = abs(inv_val - one_over_alpha_s) / one_over_alpha_s * 1e6
        if error_ppm < 5000:
            candidates.append((f"alpha_s = (1/O)(1 + {num}/{denom})", inv_val, error_ppm, f"alpha_s = {val:.6f}"))

# Sort by error
candidates.sort(key=lambda x: x[2])

print("\nBest candidates (< 0.5% error):")
print("-" * 60)
for c in candidates[:15]:
    if len(c) == 4:
        print(f"{c[0]}: 1/alpha_s = {c[1]:.6f}, error = {c[2]:.0f} ppm, {c[3]}")
    else:
        print(f"1/alpha_s = {c[0]}: {c[1]:.6f}, error = {c[2]:.0f} ppm")

# Now try more sophisticated formulas
print("\n" + "=" * 60)
print("SOPHISTICATED FORMULAS")
print("=" * 60)

# alpha_s might run differently, try different base structures
sophisticated = []

# The color group is SU(3), connected to Im(H) = 3
# 1/alpha_s ~ 8 + 0.48

# Try: O + n_d/O = 8 + 0.5 = 8.5
val = O + n_d/O
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("O + n_d/O = 8 + 4/8 = 8.5", val, error_ppm))

# Try: O + Im(H)/n_c = 8 + 3/11 = 8.273
val = O + Im_H/n_c
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("O + Im(H)/n_c = 8 + 3/11", val, error_ppm))

# Try: O + n_d/n_c = 8 + 4/11 = 8.364
val = O + n_d/n_c
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("O + n_d/n_c = 8 + 4/11", val, error_ppm))

# Try: O + C/n_d = 8 + 0.5 = 8.5
val = O + C/n_d
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("O + C/n_d = 8 + 2/4 = 8.5", val, error_ppm))

# Try: O + Im(H)/(Im(O) - 1) = 8 + 3/6 = 8.5
val = O + Im_H/(Im_O - 1)
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("O + Im(H)/(Im(O)-1) = 8 + 3/6", val, error_ppm))

# Try: O + Im(H)/Im(O) = 8 + 3/7 = 8.429
val = O + Im_H/Im_O
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("O + Im(H)/Im(O) = 8 + 3/7", val, error_ppm))

# Try: O + n_d/Phi_6(Im(O)) = 8 + 4/43 = 8.093
val = O + n_d/phi6_7
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("O + n_d/Phi_6(Im(O)) = 8 + 4/43", val, error_ppm))

# Try: O + (H+C)/Phi_6(Im(O)) = 8 + 6/43 = 8.140
val = O + (H+C)/phi6_7
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("O + (H+C)/Phi_6(7) = 8 + 6/43", val, error_ppm))

# Try: O + Im(O)/Phi_6(Im(O)) = 8 + 7/43 = 8.163
val = O + Im_O/phi6_7
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("O + Im(O)/Phi_6(7) = 8 + 7/43", val, error_ppm))

# Try: O + O/Phi_6(Im(O)) = 8 + 8/43 = 8.186
val = O + O/phi6_7
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("O + O/Phi_6(7) = 8 + 8/43", val, error_ppm))

# Try: O + (H+O)/Phi_6(Im(O)) = 8 + 12/43 = 8.279
val = O + H_plus_O/phi6_7
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("O + (H+O)/Phi_6(7) = 8 + 12/43", val, error_ppm))

# Target: 8.48
# Need correction of about 0.48

# Try: O + 7/15 = 8.467 (Im(O)/(R+C+H+O) = 7/15)
val = O + Im_O/(R+C+H+O)
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("O + Im(O)/(R+C+H+O) = 8 + 7/15", val, error_ppm))

# Try: O + H/n_c = 8 + 4/11 ~ 8.36
# Already tried

# Try: O + (H-1)/(Im(O)) = 8 + 3/7 = 8.429
# Already tried

# Try combinations with n_d^2 + n_c^2
# alpha = 137, what if alpha_s involves similar?

# Try: (n_d^2 + n_c^2) / (H_plus_O + n_d) = 137/16 = 8.5625
val = (n_d**2 + n_c**2) / (H_plus_O + n_d)
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("(n_d^2 + n_c^2)/(H+O+n_d) = 137/16", val, error_ppm))

# Try: 1/alpha_s = O + (n_c - O)/Phi_6(n_c - n_d) = 8 + 3/43 where n_c - n_d = 7
val = O + (n_c - O) / phi6(n_c - n_d)
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append((f"O + (n_c-O)/Phi_6(n_c-n_d) = 8 + 3/43", val, error_ppm))

# Better approximation needed: 8.48
# 8 + 48/100 = 8.48
# 8 + 12/25 = 8.48 exactly

# Can we get 12/25 from division algebras?
# 12 = H+O, 25 = ?
# 25 = 5^2 where 5 = R+C+H = 1+2+4-2 = wrong
# 25 = n_d^2 + Im(O) + C = 16+7+2 = 25!
val = O + H_plus_O / (n_d**2 + Im_O + C)
error_ppm = abs(val - one_over_alpha_s) / one_over_alpha_s * 1e6
sophisticated.append(("O + (H+O)/(n_d^2+Im(O)+C) = 8 + 12/25 = 8.48", val, error_ppm))

# Check: 1/0.1179 = 8.4817...
# So we need 8.4817, not 8.48

# Let's be more precise
target = 1/0.1179
print(f"\nPrecise target: 1/alpha_s = {target:.6f}")

# 8 + 0.4817 ~ 8 + 52/108 but that's not clean
# Let's search more carefully

# 8 + 11/23 = 8.478 (close!)
val = 8 + 11/23
error_ppm = abs(val - target) / target * 1e6
sophisticated.append(("8 + 11/23 = 8.478", val, error_ppm))

# What's 23 in division algebra terms?
# 23 = 16 + 7 = n_d^2 + Im(O)!
val = O + n_c / (n_d**2 + Im_O)
error_ppm = abs(val - target) / target * 1e6
sophisticated.append(("O + n_c/(n_d^2+Im(O)) = 8 + 11/23", val, error_ppm))

# This is analogous to alpha = n_d^2 + n_c^2 + n_d/Phi_6(n_c)
# alpha_s = 1/(O + n_c/(n_d^2 + Im(O))) = 1/(8 + 11/23) = 23/195

val = Rational(23, 195)
alpha_s_pred = 1 / (O + Rational(n_c, n_d**2 + Im_O))
sophisticated.append((f"alpha_s = 23/195 = {float(alpha_s_pred):.6f}", float(1/alpha_s_pred), abs(float(1/alpha_s_pred) - target)/target * 1e6))

# Sort sophisticated
sophisticated.sort(key=lambda x: x[2])

print("\nSophisticated formulas (sorted by error):")
print("-" * 60)
for s in sophisticated[:15]:
    print(f"{s[0]}: {s[1]:.6f}, error = {s[2]:.0f} ppm")

# Best candidate analysis
print("\n" + "=" * 60)
print("BEST CANDIDATE ANALYSIS")
print("=" * 60)

best_formula = "1/alpha_s = O + n_c/(n_d^2 + Im(O)) = 8 + 11/23"
best_value = 8 + 11/23
best_fraction = Rational(8*23 + 11, 23)  # = 195/23
print(f"\n{best_formula}")
print(f"= 8 + 11/23 = {best_fraction} = {float(best_fraction):.6f}")
print(f"\nalpha_s = 23/195 = {23/195:.6f}")
print(f"Measured: alpha_s(M_Z) = {alpha_s_measured}")
print(f"Error: {abs(23/195 - alpha_s_measured)/alpha_s_measured * 1e6:.0f} ppm")

# Structure parallel to alpha
print("\n" + "-" * 60)
print("STRUCTURAL PARALLEL TO alpha:")
print("-" * 60)
print(f"1/alpha   = n_d^2 + n_c^2 + n_d/Phi_6(n_c)     = 137 + 4/111")
print(f"1/alpha_s = O + n_c/(n_d^2 + Im(O))         = 8 + 11/23")
print()
print("Both have:")
print("  - Main term from key dimension (137 vs 8)")
print("  - Correction involving n_c = 11")
print("  - Denominator from dimension combinations")

# Check the connection between the formulas
print("\n" + "=" * 60)
print("RATIO CHECK: alpha_s/alpha")
print("=" * 60)
alpha_pred = 1/137.036036
alpha_s_pred = 23/195
ratio = alpha_s_pred / alpha_pred
print(f"alpha_s/alpha = (23/195) / (111/15211)")
print(f"     = (23 * 15211) / (195 * 111)")
print(f"     = 349853 / 21645")
print(f"     ~ {349853/21645:.4f}")
print(f"     ~ {ratio:.4f}")
# alpha_s/alpha ~ 16.2, what's special about this?
print(f"\nNote: This ratio ~ n_d^2 = 16")
