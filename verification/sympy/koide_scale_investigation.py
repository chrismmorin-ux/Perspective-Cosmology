# -*- coding: utf-8 -*-
"""
Koide Scale M Investigation

The Koide mass formula has scale M ~ 314 MeV.
What determines this scale?

Candidates:
1. Electroweak scale v = 246 GeV
2. Some combination of v and division algebra dimensions
3. Lepton-specific coupling

Session 73: Investigating the scale.
"""

import numpy as np

print("=" * 70)
print("KOIDE SCALE M INVESTIGATION")
print("=" * 70)

# ============================================================
# PART 1: Known Scales
# ============================================================

print("\n" + "=" * 70)
print("PART 1: Known Scales")
print("=" * 70)

# Koide scale
M_koide = 313.84  # MeV (from Koide formula fit)

# Electroweak scale
v_higgs = 246220  # MeV (Higgs VEV)

# Other scales
m_W = 80379  # MeV (W boson mass)
m_Z = 91188  # MeV (Z boson mass)
m_H = 125250  # MeV (Higgs boson mass)

print(f"\nKoide scale: M = {M_koide:.2f} MeV")
print(f"Higgs VEV: v = {v_higgs:.2f} MeV = {v_higgs/1000:.2f} GeV")
print(f"W boson mass: m_W = {m_W:.2f} MeV")
print(f"Z boson mass: m_Z = {m_Z:.2f} MeV")
print(f"Higgs mass: m_H = {m_H:.2f} MeV")

# ============================================================
# PART 2: Simple Ratios
# ============================================================

print("\n" + "=" * 70)
print("PART 2: Simple Ratios M/v")
print("=" * 70)

ratio = M_koide / v_higgs
print(f"\nM/v = {ratio:.6f}")
print(f"v/M = {1/ratio:.2f}")

# Check simple fractions
print("\nSimple fraction approximations:")
for denom in range(1, 1000):
    for numer in range(1, 100):
        if abs(numer/denom - ratio) < 0.001:
            print(f"  {numer}/{denom} = {numer/denom:.6f} (error {abs(numer/denom - ratio)/ratio*100:.3f}%)")

# ============================================================
# PART 3: Division Algebra Combinations
# ============================================================

print("\n" + "=" * 70)
print("PART 3: Division Algebra Dimension Combinations")
print("=" * 70)

# Division algebra dimensions
R, C, H, O = 1, 2, 4, 8
ImC, ImH, ImO = 1, 3, 7
n_d, n_c = 4, 11

print(f"\nDivision algebra dimensions: R={R}, C={C}, H={H}, O={O}")
print(f"Imaginary: Im(C)={ImC}, Im(H)={ImH}, Im(O)={ImO}")
print(f"Framework: n_d={n_d}, n_c={n_c}")

# Candidate formulas for M
print("\nCandidate formulas for M (looking for M ~ 314 MeV):")

candidates = [
    ("v / (n_d * n_c^2)", v_higgs / (n_d * n_c**2)),
    ("v / (n_d^2 * n_c)", v_higgs / (n_d**2 * n_c)),
    ("v / (O * H * n_c)", v_higgs / (O * H * n_c)),
    ("v * C / (O * H * n_c)", v_higgs * C / (O * H * n_c)),
    ("v / 784", v_higgs / 784),
    ("v / (4 * 196)", v_higgs / (4 * 196)),
    ("v / (n_d * 14^2)", v_higgs / (n_d * 14**2)),
    ("v * sqrt(2/137) / pi", v_higgs * np.sqrt(2/137) / np.pi),
    ("v * alpha", v_higgs / 137),
    ("v * ImH / (O * n_c^2)", v_higgs * ImH / (O * n_c**2)),
]

for name, value in candidates:
    error = abs(value - M_koide) / M_koide * 100
    marker = " <-- CLOSE!" if error < 5 else ""
    print(f"  {name} = {value:.2f} MeV (error {error:.2f}%){marker}")

# ============================================================
# PART 4: More Systematic Search
# ============================================================

print("\n" + "=" * 70)
print("PART 4: Systematic Search for v/M")
print("=" * 70)

target = v_higgs / M_koide
print(f"\nTarget: v/M = {target:.4f}")

# Search for products of small integers and algebra dimensions
print("\nProducts of dimension values:")
dims = [1, 2, 3, 4, 7, 8, 11]
dim_names = ["1", "C", "Im(H)", "n_d or H", "Im(O)", "O", "n_c"]

found = []
for i, d1 in enumerate(dims):
    for j, d2 in enumerate(dims):
        for k, d3 in enumerate(dims):
            prod = d1 * d2 * d3
            if abs(prod - target) < 20:
                found.append((prod, f"{dim_names[i]}*{dim_names[j]}*{dim_names[k]}"))

found.sort(key=lambda x: abs(x[0] - target))
print(f"\nClosest products to {target:.2f}:")
for val, name in found[:10]:
    error = abs(val - target) / target * 100
    print(f"  {name} = {val} (error {error:.2f}%)")

# ============================================================
# PART 5: Connection to Tau Mass
# ============================================================

print("\n" + "=" * 70)
print("PART 5: Connection to Tau Mass")
print("=" * 70)

m_tau = 1776.86  # MeV

print(f"\nm_tau = {m_tau:.2f} MeV")
print(f"M_koide = {M_koide:.2f} MeV")
print(f"m_tau / M = {m_tau/M_koide:.4f}")
print(f"sqrt(m_tau / M) = {np.sqrt(m_tau/M_koide):.4f}")

# In Koide formula: sqrt(m_tau) = sqrt(M) * (1 + sqrt(2)*cos(theta_tau))
# where theta_tau is the phase for tau
# So sqrt(m_tau/M) = 1 + sqrt(2)*cos(theta_tau)

sqrt_ratio = np.sqrt(m_tau/M_koide)
cos_theta_tau = (sqrt_ratio - 1) / np.sqrt(2)
theta_tau = np.arccos(cos_theta_tau)

print(f"\nFrom Koide formula:")
print(f"  sqrt(m_tau/M) = {sqrt_ratio:.4f}")
print(f"  1 + sqrt(2)*cos(theta) = {sqrt_ratio:.4f}")
print(f"  cos(theta_tau) = {cos_theta_tau:.4f}")
print(f"  theta_tau = {theta_tau:.4f} rad = {np.degrees(theta_tau):.2f} deg")

# ============================================================
# PART 6: The 784 Factor
# ============================================================

print("\n" + "=" * 70)
print("PART 6: The 784 Factor")
print("=" * 70)

factor = v_higgs / M_koide
print(f"\nv/M = {factor:.4f}")
print(f"784 = {784}")
print(f"Error from 784: {abs(factor - 784)/784 * 100:.3f}%")

print(f"\nFactorizations of 784:")
print(f"  784 = 28^2 = (4*7)^2 = (n_d * Im(O))^2")
print(f"  784 = 16 * 49 = 4^2 * 7^2 = n_d^2 * Im(O)^2")
print(f"  784 = 8 * 98 = O * (2 * 49) = O * (C * Im(O)^2)")

print(f"\nIf M = v / 784 = v / (n_d * Im(O))^2:")
M_predicted = v_higgs / 784
print(f"  M_predicted = {M_predicted:.4f} MeV")
print(f"  M_observed = {M_koide:.4f} MeV")
print(f"  Error = {abs(M_predicted - M_koide)/M_koide * 100:.3f}%")

# ============================================================
# PART 7: Summary
# ============================================================

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)

print("""
FINDING: M = v / 784 with ~0.15% error

784 = (n_d * Im(O))^2 = (4 * 7)^2 = 28^2

This gives:
  M = v / (n_d * Im(O))^2

INTERPRETATION:
- v = Higgs VEV (electroweak scale)
- n_d = 4 = number of visible dimensions
- Im(O) = 7 = imaginary octonion dimensions

The scale M comes from:
  - Electroweak physics (v)
  - Suppressed by spacetime-octonion geometry ((n_d * Im(O))^2)

This connects the Koide scale to:
  1. Electroweak symmetry breaking (v)
  2. The octonion-spacetime interface (n_d * Im(O))

STATUS: [CONJECTURE] — formula matches but interpretation needs verification
""")
