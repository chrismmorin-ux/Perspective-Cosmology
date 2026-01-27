"""
Lepton Mass Ratio Search
========================

Search for division algebra formulas for:
- m_mu/m_e = 206.7682830(46)
- m_tau/m_e = 3477.23(23)
- m_tau/m_mu = 16.8170(15)

Using the same ingredients as other constants.
"""

from sympy import Rational, sqrt, pi
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

phi6_7 = phi6(7)    # 43
phi6_11 = phi6(11)  # 111
phi6_12 = phi6(12)  # 133

# Measured values
m_mu_over_m_e = 206.7682830  # PDG
m_tau_over_m_e = 3477.23
m_tau_over_m_mu = 16.8170

print("=" * 60)
print("LEPTON MASS RATIO SEARCH")
print("=" * 60)

print("\n--- m_mu/m_e = 206.768 ---")
target = m_mu_over_m_e

candidates = []

# Key observation: 206.768 is close to 207
# 207 = 9 * 23 = Im(H)^2 * (n_d^2 + Im(O))
# Also 207 = 3 * 69 = 3 * 3 * 23

# Pattern: X + small correction like other formulas
# 207 - 0.23 = 206.77

# Try main terms around 207
main_terms = [
    (Im_H**2 * (n_d**2 + Im_O), f"Im(H)^2 * (n_d^2 + Im(O)) = 9 * 23 = 207"),
    (n_d * (n_d**2 + Im_O + C_plus_O + Im_H + n_c), f"n_d * 41 = 164"),  # just an example
    (H_plus_O * (n_d**2 + n_c - H), f"12 * 23 = 276"),  # too high
]

# The Koide formula gives Q = 2/3 for charged leptons
# m_mu/m_e involves Koide angle theta

# Simple search
for main in range(200, 215):
    for num in range(0, 20):
        for denom in [7, 11, 12, 23, 43, 72, 111, 133]:
            val = main + num/denom
            error_ppm = abs(val - target) / target * 1e6
            if error_ppm < 1000:  # 0.1%
                candidates.append((f"{main} + {num}/{denom}", val, error_ppm))
            val = main - num/denom
            error_ppm = abs(val - target) / target * 1e6
            if error_ppm < 1000:
                candidates.append((f"{main} - {num}/{denom}", val, error_ppm))

# Sort and display
candidates.sort(key=lambda x: x[2])
print("\nBest simple formulas:")
for c in candidates[:10]:
    print(f"  {c[0]} = {c[1]:.6f}, error = {c[2]:.1f} ppm")

# Now try structured formulas
print("\n--- Structured formulas ---")
structured = []

# 207 = 9 * 23, can we write this in terms of division algebras?
# 9 = Im(H)^2 = 3^2
# 23 = n_d^2 + Im(O) = 16 + 7

val = Im_H**2 * (n_d**2 + Im_O)  # = 9 * 23 = 207
error_ppm = abs(val - target) / target * 1e6
structured.append(("Im(H)^2 * (n_d^2 + Im(O)) = 9 * 23 = 207", val, error_ppm))

# Need correction of -0.23
# -0.23 = -3/13 roughly, or -7/30...

# -n_c/(n_d * n_c + Im(H)) = -11/47 = -0.234
val = Im_H**2 * (n_d**2 + Im_O) - n_c / (n_d * n_c + Im_H)
error_ppm = abs(val - target) / target * 1e6
structured.append(("207 - n_c/(n_d*n_c + Im(H)) = 207 - 11/47", val, error_ppm))

# Try: 207 - 1/n_d = 206.75
val = 207 - 1/n_d
error_ppm = abs(val - target) / target * 1e6
structured.append(("207 - 1/n_d = 207 - 1/4 = 206.75", val, error_ppm))

# Try: 207 - 1/n_c = 206.909
val = 207 - 1/n_c
error_ppm = abs(val - target) / target * 1e6
structured.append(("207 - 1/n_c = 207 - 1/11", val, error_ppm))

# Try: 207 - C/O = 206.75
val = 207 - C/O
error_ppm = abs(val - target) / target * 1e6
structured.append(("207 - C/O = 207 - 2/8 = 206.75", val, error_ppm))

# Try: 207 - Im(H)/(Im(H)^2 + n_d) = 207 - 3/13 = 206.769!
val = 207 - Im_H/(Im_H**2 + n_d)
error_ppm = abs(val - target) / target * 1e6
structured.append(("207 - Im(H)/(Im(H)^2+n_d) = 207 - 3/13", val, error_ppm))

# Check 207 - 3/13 = 207 - 0.2308 = 206.769
print(f"\n207 - 3/13 = {207 - 3/13:.6f} vs target {target:.6f}")

# Try more variations
# 206 + 10/13 = 206.769!
val = 206 + C_plus_O / (Im_H**2 + n_d)
error_ppm = abs(val - target) / target * 1e6
structured.append(("206 + (C+O)/(Im(H)^2+n_d) = 206 + 10/13", val, error_ppm))

# What's 206 in division algebra terms?
# 206 = 2 * 103 (103 is prime)
# 206 = 6 * 34 + 2
# Let's check if there's a nicer form

# 2691/13 = 207 - 3/13 exact fraction
# Can we express 2691 nicely?
# 2691 = 207 * 13 - 3 = 2691

# Try: (Im(H)^2 * (n_d^2 + Im(O)) * (Im(H)^2 + n_d) - Im(H)) / (Im(H)^2 + n_d)
# = (9 * 23 * 13 - 3) / 13 = (2691 - 3) / 13 = 2688/13... wait that's wrong
# Should be (207 * 13 - 3) / 13 = 207 - 3/13

# Actually: 207 - 3/13 = (207*13 - 3)/13 = (2691 - 3)/13 = 2688/13 = 206.769...
val = Rational(2688, 13)
print(f"\n2688/13 = {float(val):.6f}")

# Can we write 2688 nicely?
# 2688 = 2^7 * 3 * 7 = 128 * 21
# 2688 = O^(Im(O)/Im(H)) * Im(H) * Im(O)? Hmm, 8^(7/3) isn't nice

# Let's think differently
# m_mu/m_e and m_p/m_e might be related

# m_p/m_e = 1836 + 11/72
# m_mu/m_e = 206.768
# m_p/m_mu = 1836.15 / 206.77 = 8.88...

# Try expressing in terms of 1836
# 206.768 = 1836 / x where x = 8.88
# Is 8.88 related to O = 8?

# 1836 / 206.768 = 8.8815
# Close to O + 7/8 = 8.875!
val = 1836 / (O + Im_O/O)
error_ppm = abs(val - target) / target * 1e6
structured.append(("1836/(O + Im(O)/O) = 1836/8.875", val, error_ppm))

# Even closer: 1836.15278 / 206.768 = 8.8815
# Try (1836 + 11/72) / m_mu_over_m_e
proton_electron = 1836 + Rational(11, 72)
ratio_to_proton = float(proton_electron) / m_mu_over_m_e
print(f"\n(m_p/m_e) / (m_mu/m_e) = {ratio_to_proton:.6f}")
# = 8.8815

# 8.8815 close to O + Im(O)/O = 8.875 (0.07% error)
# Or 8 + 71/80 = 8.8875
# Or O + Im_O/O + small = O + 0.8815...

# Try: m_mu/m_e = (m_p/m_e) * O / (O^2 + Im(O)) = 1836.15 * 8/71 = 206.75
val = float(proton_electron) * O / (O**2 + Im_O)
error_ppm = abs(val - target) / target * 1e6
structured.append(("(m_p/m_e) * O/(O^2+Im(O)) = 1836.15 * 8/71", val, error_ppm))

# Sort
structured.sort(key=lambda x: x[2])
print("\nStructured formulas (sorted by error):")
for s in structured[:10]:
    print(f"  {s[0]}: {s[1]:.6f}, error = {s[2]:.1f} ppm")

# Best candidate
print("\n" + "=" * 60)
print("BEST CANDIDATE FOR m_mu/m_e")
print("=" * 60)

# Formula: 207 - 3/13 = Im(H)^2 * (n_d^2 + Im(O)) - Im(H)/(Im(H)^2 + n_d)
formula = "m_mu/m_e = Im(H)^2(n_d^2 + Im(O)) - Im(H)/(Im(H)^2 + n_d)"
val = 9 * 23 - 3/13
print(f"\n{formula}")
print(f"         = 9 * 23 - 3/13")
print(f"         = 207 - 3/13")
print(f"         = 2688/13")
print(f"         = {val:.6f}")
print(f"\nMeasured: {target:.6f}")
print(f"Error: {abs(val - target)/target * 1e6:.1f} ppm")

# Alternative: 206 + 10/13
alt_val = 206 + 10/13
print(f"\nAlternative: 206 + 10/13 = {alt_val:.6f}")
print(f"Error: {abs(alt_val - target)/target * 1e6:.1f} ppm")

# ===== m_tau/m_e =====
print("\n" + "=" * 60)
print("SEARCHING m_tau/m_e = 3477.23")
print("=" * 60)

target_tau = m_tau_over_m_e

# 3477 is approximately 3 * 1159
# Or 9 * 386.36
# Or close to 3480 = 8 * 435

tau_candidates = []

# Main term search
for main in range(3470, 3485):
    for num in range(0, 30):
        for denom in [7, 11, 12, 23, 43, 72, 111, 133]:
            val = main + num/denom
            error_ppm = abs(val - target_tau) / target_tau * 1e6
            if error_ppm < 500:
                tau_candidates.append((f"{main} + {num}/{denom}", val, error_ppm))

tau_candidates.sort(key=lambda x: x[2])
print("\nBest simple formulas:")
for c in tau_candidates[:10]:
    print(f"  {c[0]} = {c[1]:.6f}, error = {c[2]:.1f} ppm")

# Structured attempts
tau_structured = []

# 3477 = 3 * 19 * 61 (factorization)
# Or: n_c * 316.09...

# Try: Koide-like connection
# m_tau/m_e = (m_mu/m_e)^x for some x
# 3477 / 206.77 = 16.817 (this is m_tau/m_mu!)
# 16.817 close to n_d^2 + 0.817 = 16 + something

# m_tau/m_mu = 16.817
# Close to 17 = n_d^2 + 1
# Or 16 + 7/9 = 16.778

val = n_d**2 + Im_O/Im_H**2
print(f"\nn_d^2 + Im(O)/Im(H)^2 = 16 + 7/9 = {val:.4f}")
print(f"m_tau/m_mu measured = {m_tau_over_m_mu:.4f}")
print(f"Error: {abs(val - m_tau_over_m_mu)/m_tau_over_m_mu * 100:.2f}%")

# m_tau/m_mu = 151/9 = 16.778 (error 0.23%)
val = Rational(151, 9)
print(f"\n151/9 = {float(val):.4f}, error = {abs(float(val) - m_tau_over_m_mu)/m_tau_over_m_mu * 100:.2f}%")

# Can we do better?
# 16.817 = 16 + 0.817
# 0.817 close to 9/11 = 0.818!
val = 16 + Rational(9, 11)
print(f"\n16 + 9/11 = {float(val):.4f}, error = {abs(float(val) - m_tau_over_m_mu)/m_tau_over_m_mu * 100:.3f}%")

# n_d^2 + Im(H)^2/n_c = 16 + 9/11 = 185/11
val = n_d**2 + Im_H**2/n_c
print(f"n_d^2 + Im(H)^2/n_c = 16 + 9/11 = {float(val):.4f}")

# So m_tau/m_mu = n_d^2 + Im(H)^2/n_c = 185/11 ≈ 16.818
# And m_tau/m_e = m_mu/m_e * m_tau/m_mu
# = (2688/13) * (185/11) = 497280/143 = 3477.48

val = Rational(2688, 13) * Rational(185, 11)
print(f"\nm_tau/m_e = (2688/13) * (185/11) = {float(val):.2f}")
print(f"Measured: {target_tau}")
print(f"Error: {abs(float(val) - target_tau)/target_tau * 100:.3f}%")

# Summary
print("\n" + "=" * 60)
print("SUMMARY: LEPTON MASS RATIOS")
print("=" * 60)

print("\nm_mu/m_e:")
print("  Formula: Im(H)^2(n_d^2 + Im(O)) - Im(H)/(Im(H)^2 + n_d)")
print("         = 9 * 23 - 3/13 = 2688/13")
print(f"  Predicted: {2688/13:.6f}")
print(f"  Measured:  {m_mu_over_m_e:.6f}")
print(f"  Error:     {abs(2688/13 - m_mu_over_m_e)/m_mu_over_m_e * 1e6:.0f} ppm")

print("\nm_tau/m_mu:")
print("  Formula: n_d^2 + Im(H)^2/n_c = 16 + 9/11 = 185/11")
print(f"  Predicted: {185/11:.6f}")
print(f"  Measured:  {m_tau_over_m_mu:.6f}")
print(f"  Error:     {abs(185/11 - m_tau_over_m_mu)/m_tau_over_m_mu * 1e6:.0f} ppm")

print("\nm_tau/m_e (derived):")
print("  Formula: (2688/13) * (185/11) = 497280/143")
print(f"  Predicted: {497280/143:.2f}")
print(f"  Measured:  {m_tau_over_m_e:.2f}")
print(f"  Error:     {abs(497280/143 - m_tau_over_m_e)/m_tau_over_m_e * 100:.2f}%")
