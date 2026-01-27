"""
Lepton Depth Formula Test

Testing the formula: d_e/d_mu = 23/8 = 3 - 1/8 = (Im(H)*O - 1)/O

Where:
- Im(H) = 3 (quaternion imaginary dimensions)
- O = 8 (octonion total dimensions)

Session 57: Verification of the numerical coincidence.
"""

import numpy as np

# PDG 2024 values (MeV)
m_e = 0.51099895  # electron
m_mu = 105.6583755  # muon
m_tau = 1776.86  # tau

print("=" * 60)
print("LEPTON DEPTH FORMULA TEST")
print("=" * 60)

# Calculate depths (in arbitrary units, kappa = 1)
d_tau = 0  # tau at surface
d_mu = np.log(m_tau / m_mu)
d_e = np.log(m_tau / m_e)

print(f"\nObserved depths (kappa = 1 units):")
print(f"  d_tau = 0 (surface)")
print(f"  d_mu = ln(m_tau/m_mu) = {d_mu:.6f}")
print(f"  d_e = ln(m_tau/m_e) = {d_e:.6f}")

# The key ratio
ratio_observed = d_e / d_mu
print(f"\nKey ratio d_e/d_mu:")
print(f"  Observed = {ratio_observed:.6f}")

# The formula: 3 - 1/8 = 23/8
dim_ImH = 3  # quaternion imaginary dimensions
dim_O = 8    # octonion total dimensions
ratio_formula = (dim_ImH * dim_O - 1) / dim_O  # = (24-1)/8 = 23/8

print(f"\nFormula: (Im(H) * O - 1) / O = (3*8 - 1)/8 = 23/8")
print(f"  = {ratio_formula:.6f}")

error_ratio = abs(ratio_observed - ratio_formula) / ratio_observed * 100
print(f"\n  Error = {error_ratio:.4f}%")

# Alternative simple fractions near the observed value
print(f"\n" + "=" * 60)
print("ALTERNATIVE SIMPLE FRACTIONS")
print("=" * 60)

candidates = []
for num in range(1, 50):
    for denom in range(1, 20):
        frac = num / denom
        error = abs(frac - ratio_observed) / ratio_observed * 100
        if error < 1.0:
            candidates.append((num, denom, frac, error))

candidates.sort(key=lambda x: x[3])
print(f"\nFractions within 1% of observed {ratio_observed:.4f}:")
for num, denom, frac, error in candidates[:10]:
    note = ""
    if num == 23 and denom == 8:
        note = " <-- (3*8 - 1)/8 = 3 - 1/dim(O)"
    elif num == 26 and denom == 9:
        note = " <-- no obvious structure"
    print(f"  {num}/{denom} = {frac:.6f}, error = {error:.4f}%{note}")

# Mass prediction
print(f"\n" + "=" * 60)
print("MASS PREDICTIONS")
print("=" * 60)

print(f"\nIf d_e/d_mu = 23/8 exactly, predict m_e from m_tau and m_mu:")
d_e_predicted = d_mu * (23/8)
m_e_predicted = m_tau * np.exp(-d_e_predicted)
error_mass = abs(m_e_predicted - m_e) / m_e * 100

print(f"  m_e (predicted) = {m_e_predicted:.6f} MeV")
print(f"  m_e (observed)  = {m_e:.6f} MeV")
print(f"  Error = {error_mass:.2f}%")

# What if we use 26/9 instead?
print(f"\nIf d_e/d_mu = 26/9 (best simple fraction fit):")
d_e_predicted_alt = d_mu * (26/9)
m_e_predicted_alt = m_tau * np.exp(-d_e_predicted_alt)
error_mass_alt = abs(m_e_predicted_alt - m_e) / m_e * 100

print(f"  m_e (predicted) = {m_e_predicted_alt:.6f} MeV")
print(f"  m_e (observed)  = {m_e:.6f} MeV")
print(f"  Error = {error_mass_alt:.2f}%")

# Depth difference ratios
print(f"\n" + "=" * 60)
print("DEPTH DIFFERENCE ANALYSIS")
print("=" * 60)

delta_2 = d_mu - d_tau  # = d_mu (since d_tau = 0)
delta_1 = d_e - d_mu

print(f"\nDepth differences:")
print(f"  delta_2 (tau to mu) = {delta_2:.6f}")
print(f"  delta_1 (mu to e) = {delta_1:.6f}")
print(f"  Ratio delta_1/delta_2 = {delta_1/delta_2:.6f}")

# If depths are 0, 1, 23/8:
# delta_2 = 1 - 0 = 1
# delta_1 = 23/8 - 1 = 15/8
# ratio = 15/8 = 1.875

print(f"\nIf depths are 0, 1, 23/8:")
print(f"  delta_2 (predicted) = 1")
print(f"  delta_1 (predicted) = 15/8 = {15/8:.6f}")
print(f"  Ratio (predicted) = {15/8:.6f}")
print(f"  Ratio (observed) = {delta_1/delta_2:.6f}")
print(f"  Error = {abs(delta_1/delta_2 - 15/8)/(delta_1/delta_2)*100:.4f}%")

# Summary
print(f"\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)

print(f"""
The formula d_e/d_mu = 23/8 = 3 - 1/8 matches observed leptons to 0.5%.

Structural interpretation:
  23/8 = (Im(H) * dim(O) - 1) / dim(O)
       = (3 * 8 - 1) / 8
       = 3 - 1/8

This suggests:
- Base depth goes as Im(H) = 3
- Correction of -1/8 from octonion structure

What would make this a derivation (vs numerology):
1. Derive 3 - 1/8 from H -> O embedding geometry
2. Explain why quarks don't follow the same pattern
3. Predict another mass ratio correctly

STATUS: [INTERESTING COINCIDENCE] - not proven, not falsified
""")
