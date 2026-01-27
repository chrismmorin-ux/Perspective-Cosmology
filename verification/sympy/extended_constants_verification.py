"""
Extended Constants Verification
===============================

Verify all discovered division algebra formulas for fundamental constants.
"""

from sympy import Rational, sqrt, pi, simplify
from decimal import Decimal, getcontext
getcontext().prec = 50

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

print("=" * 70)
print("EXTENDED DIVISION ALGEBRA CONSTANTS")
print("=" * 70)

# CODATA 2018 / PDG values
measured = {
    'alpha_inv': 137.035999084,
    'm_p/m_e': 1836.15267343,
    'sin2_theta_W': 0.23121,
    'alpha_s': 0.1179,
    'm_mu/m_e': 206.7682830,
    'm_tau/m_e': 3477.23,
    'm_tau/m_mu': 16.8170,
}

results = []

print("\n--- PREVIOUSLY ESTABLISHED ---\n")

# 1. Fine structure constant
formula = "n_d^2 + n_c^2 + n_d/Phi_6(n_c)"
pred = Rational(n_d**2 + n_c**2) + Rational(n_d, phi6(n_c))
pred_float = float(pred)
meas = measured['alpha_inv']
error_ppm = abs(pred_float - meas) / meas * 1e6
results.append(('1/alpha', formula, pred, pred_float, meas, error_ppm))
print(f"1/alpha = {formula}")
print(f"       = 16 + 121 + 4/111 = {pred} = {pred_float:.9f}")
print(f"       Measured: {meas}")
print(f"       Error: {error_ppm:.2f} ppm")

# 2. Proton/electron mass ratio
formula = "(H+O)(Im(H)^2 + (H+O)^2) + n_c/(O*Im(H)^2)"
main = H_plus_O * (Im_H**2 + H_plus_O**2)
corr = Rational(n_c, O * Im_H**2)
pred = main + corr
pred_float = float(pred)
meas = measured['m_p/m_e']
error_ppm = abs(pred_float - meas) / meas * 1e6
results.append(('m_p/m_e', formula, pred, pred_float, meas, error_ppm))
print(f"\nm_p/m_e = {formula}")
print(f"        = 12*153 + 11/72 = {pred} = {pred_float:.9f}")
print(f"        Measured: {meas}")
print(f"        Error: {error_ppm:.2f} ppm")

# 3. Weinberg angle
formula = "(1/4)(1 - (C+O)/Phi_6(H+O))"
pred = Rational(1, 4) * (1 - Rational(C_plus_O, phi6(H_plus_O)))
pred_float = float(pred)
meas = measured['sin2_theta_W']
error_ppm = abs(pred_float - meas) / meas * 1e6
results.append(('sin^2(theta_W)', formula, pred, pred_float, meas, error_ppm))
print(f"\nsin^2(theta_W) = {formula}")
print(f"               = (1/4)(1 - 10/133) = {pred} = {pred_float:.9f}")
print(f"               Measured: {meas}")
print(f"               Error: {error_ppm:.1f} ppm")

print("\n--- NEW DISCOVERIES (Session 83) ---\n")

# 4. Strong coupling
formula = "1/(O + n_c/(n_d^2 + Im(O)))"
inv_pred = O + Rational(n_c, n_d**2 + Im_O)
pred = 1 / inv_pred
pred_float = float(pred)
meas = measured['alpha_s']
error_ppm = abs(pred_float - meas) / meas * 1e6
results.append(('alpha_s', formula, pred, pred_float, meas, error_ppm))
print(f"alpha_s = {formula}")
print(f"        = 1/(8 + 11/23) = 23/195 = {pred_float:.9f}")
print(f"        Measured: {meas}")
print(f"        Error: {error_ppm:.0f} ppm")

# Better formula found in search: O + 12/25
formula_alt = "1/(O + (H+O)/(n_d^2 + Im(O) + C))"
inv_pred_alt = O + Rational(H_plus_O, n_d**2 + Im_O + C)
pred_alt = 1 / inv_pred_alt
print(f"\n        Alternative: {formula_alt}")
print(f"        = 1/(8 + 12/25) = 25/212 = {float(pred_alt):.9f}")
print(f"        Error: {abs(float(pred_alt) - meas)/meas * 1e6:.0f} ppm")

# 5. Muon/electron mass ratio
# From the search, found: 207 - 10/43 = 8891/43
formula = "Im(H)^2*(n_d^2 + Im(O)) - (C+O)/Phi_6(Im(O))"
main = Im_H**2 * (n_d**2 + Im_O)  # 9 * 23 = 207
corr = Rational(C_plus_O, phi6(Im_O))  # 10/43
pred = main - corr
pred_float = float(pred)
meas = measured['m_mu/m_e']
error_ppm = abs(pred_float - meas) / meas * 1e6
results.append(('m_mu/m_e', formula, pred, pred_float, meas, error_ppm))
print(f"\nm_mu/m_e = {formula}")
print(f"         = 9*23 - 10/43 = {pred} = {pred_float:.9f}")
print(f"         Measured: {meas}")
print(f"         Error: {error_ppm:.1f} ppm")

# Verify: 8891/43
print(f"         Check: 8891/43 = {8891/43:.9f}")

# 6. Tau/muon mass ratio
formula = "n_d^2 + Im(H)^2/n_c"
pred = n_d**2 + Rational(Im_H**2, n_c)
pred_float = float(pred)
meas = measured['m_tau/m_mu']
error_ppm = abs(pred_float - meas) / meas * 1e6
results.append(('m_tau/m_mu', formula, pred, pred_float, meas, error_ppm))
print(f"\nm_tau/m_mu = {formula}")
print(f"           = 16 + 9/11 = {pred} = {pred_float:.9f}")
print(f"           Measured: {meas}")
print(f"           Error: {error_ppm:.0f} ppm")

# 7. Tau/electron mass ratio
# From search: 3477 + 10/43
formula = "3477 + (C+O)/Phi_6(Im(O))"
# But can we derive 3477?
# 3477 = 3 * 19 * 61
# Or: m_mu/m_e * m_tau/m_mu = (8891/43) * (185/11) = 1644835/473
derived = Rational(8891, 43) * Rational(185, 11)
print(f"\nm_tau/m_e (derived from mu and tau/mu):")
print(f"         = (8891/43) * (185/11) = {derived} = {float(derived):.6f}")
print(f"         Measured: {measured['m_tau/m_e']}")
print(f"         Error: {abs(float(derived) - measured['m_tau/m_e'])/measured['m_tau/m_e'] * 100:.3f}%")

# Check the simple formula 3477 + 10/43
simple_tau = 3477 + Rational(10, 43)
print(f"\n         Alternative: 3477 + 10/43 = {simple_tau} = {float(simple_tau):.6f}")
print(f"         Error: {abs(float(simple_tau) - measured['m_tau/m_e'])/measured['m_tau/m_e'] * 1e6:.1f} ppm")

# What is 3477 in division algebra terms?
# 3477 = 3 * 1159 = 3 * 19 * 61
# Or: 149247/43 - 10/43 = 149237/43
# 149237 = 43 * 3470 + 27... not clean

# Try: 3477 = something more structured
# 3477/3 = 1159
# 3477/9 = 386.33
# 3477/11 = 316.09
# 3477/12 = 289.75 close to 290 = 2*145

# Let's check: m_tau/m_e = (m_mu/m_e) * (m_tau/m_mu)
# Predicted: (8891/43) * (185/11) = 1644835/473
pred_tau = Rational(8891, 43) * Rational(185, 11)
print(f"\n         Fully derived: {pred_tau} = {float(pred_tau):.6f}")

# Summary table
print("\n" + "=" * 70)
print("SUMMARY TABLE")
print("=" * 70)
print(f"\n{'Constant':<15} {'Formula':<45} {'Predicted':<15} {'Measured':<15} {'Error':>10}")
print("-" * 100)

for name, formula, frac, pred_f, meas_f, err in results:
    formula_short = formula[:42] + "..." if len(formula) > 45 else formula
    print(f"{name:<15} {formula_short:<45} {pred_f:<15.6f} {meas_f:<15.6f} {err:>8.1f} ppm")

print("\n" + "=" * 70)
print("STRUCTURAL PATTERNS")
print("=" * 70)

print("\n1. Main terms are products of squared dimensions:")
print("   - 1/alpha: n_d^2 + n_c^2 = 16 + 121 = 137")
print("   - m_p/m_e: (H+O)(Im(H)^2 + (H+O)^2) = 12*153 = 1836")
print("   - m_mu/m_e: Im(H)^2 * (n_d^2 + Im(O)) = 9*23 = 207")
print("   - 1/alpha_s: O = 8")

print("\n2. Corrections involve n_c = 11 and Phi_6:")
print("   - 1/alpha: +4/Phi_6(11) = +4/111")
print("   - m_p/m_e: +11/72 = +n_c/(O*Im(H)^2)")
print("   - sin^2(theta_W): -10/Phi_6(12) = -(C+O)/133")
print("   - m_mu/m_e: -10/Phi_6(7) = -(C+O)/43")
print("   - 1/alpha_s: +11/23 = +n_c/(n_d^2 + Im(O))")

print("\n3. Phi_6 evaluated at division algebra dimensions:")
print(f"   - Phi_6(Im(O)) = Phi_6(7) = {phi6(7)}")
print(f"   - Phi_6(n_c) = Phi_6(11) = {phi6(11)}")
print(f"   - Phi_6(H+O) = Phi_6(12) = {phi6(12)}")

print("\n4. n_c = 11 appears in FOUR formulas:")
print("   - 1/alpha correction: 4/Phi_6(n_c)")
print("   - m_p/m_e correction: n_c/72")
print("   - 1/alpha_s correction: n_c/23")
print("   - m_tau/m_mu: Im(H)^2/n_c")

# Check coupling relation
print("\n" + "=" * 70)
print("COUPLING RELATION: alpha_s/alpha")
print("=" * 70)

alpha_pred = Rational(111, 15211)  # 1/(137 + 4/111)
alpha_s_pred = Rational(23, 195)   # 1/(8 + 11/23)
ratio = alpha_s_pred / alpha_pred
print(f"\nalpha_s/alpha = (23/195) / (111/15211)")
print(f"             = (23 * 15211) / (195 * 111)")
print(f"             = 349853 / 21645")
print(f"             = {float(ratio):.6f}")
print(f"\nNote: This is close to n_d^2 = 16 (within 1%)")
print(f"      16 / {float(ratio):.4f} = {16/float(ratio):.4f}")
