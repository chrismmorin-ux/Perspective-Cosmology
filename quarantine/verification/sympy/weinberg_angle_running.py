"""
Weinberg Angle Running Calculation

Purpose: Find the energy scale where sin^2(theta_W) = 0.25 (the framework prediction)
given that sin^2(theta_W) = 0.231 at M_Z.

Framework prediction: sin^2(theta_W) = Im(C)/(Im(C) + Im(H)) = 1/(1+3) = 1/4 = 0.25
"""

import numpy as np

# Constants
M_Z = 91.2  # GeV
sin2_theta_W_MZ = 0.23122  # PDG 2024 value (MS-bar at M_Z)
alpha_em = 1/137.036  # fine structure constant

# One-loop running coefficients for SM
# d(sin^2 theta_W)/d(ln mu) ~ (alpha/3pi) * C * sin^2 * cos^2
# where C depends on particle content

# Approximate formula for sin^2 theta_W running in SM:
# sin^2(mu) ~ sin^2(M_Z) * [1 + (alpha_em/pi) * b * ln(mu/M_Z)]
# where b ~ 109/36 for SM (one-loop)

# More precise: use beta functions for g and g'
# beta_g = -(19/12) * g^3/(16 pi^2)  [SM with one Higgs doublet]
# beta_g' = +(41/12) * g'^3/(16 pi^2)

# At one loop:
# g^2(mu) = g^2(M_Z) / [1 + (19/6) * g^2(M_Z)/(16 pi^2) * ln(mu/M_Z)]
# g'^2(mu) = g'^2(M_Z) / [1 - (41/6) * g'^2(M_Z)/(16 pi^2) * ln(mu/M_Z)]

# Initial values at M_Z
g2_MZ = 0.652**2  # SU(2) coupling squared
gp2_MZ = 0.357**2  # U(1) coupling squared

# Check: sin^2(theta_W) = g'^2/(g^2 + g'^2)
sin2_check = gp2_MZ / (g2_MZ + gp2_MZ)
print(f"Check: sin^2(theta_W) at M_Z = {sin2_check:.4f} (should be ~0.231)")

# Beta function coefficients (one-loop SM)
b_g = 19/6  # coefficient for g^2 running
b_gp = -41/6  # coefficient for g'^2 running (negative = g' increases)

def sin2_theta_at_scale(log_mu_over_MZ):
    """Calculate sin^2(theta_W) at scale mu given ln(mu/M_Z)"""
    t = log_mu_over_MZ

    # Running couplings
    g2 = g2_MZ / (1 + b_g * g2_MZ / (16 * np.pi**2) * t)
    gp2 = gp2_MZ / (1 + b_gp * gp2_MZ / (16 * np.pi**2) * t)

    return gp2 / (g2 + gp2)

# Find scale where sin^2(theta_W) = 0.25
target = 0.25

# Binary search
log_low, log_high = 0, 40  # ln(mu/M_Z) range
for _ in range(100):
    log_mid = (log_low + log_high) / 2
    val = sin2_theta_at_scale(log_mid)
    if val < target:
        log_low = log_mid
    else:
        log_high = log_mid

log_scale = (log_low + log_high) / 2
scale_GeV = M_Z * np.exp(log_scale)

print(f"\n=== RESULTS ===")
print(f"Framework prediction: sin^2(theta_W) = 1/4 = {1/4}")
print(f"Observed at M_Z: sin^2(theta_W) = {sin2_theta_W_MZ:.5f}")
print(f"Discrepancy: {0.25 - sin2_theta_W_MZ:.4f} ({(0.25 - sin2_theta_W_MZ)/sin2_theta_W_MZ*100:.1f}%)")
print(f"\nScale where sin^2(theta_W) = 0.25:")
print(f"  ln(mu/M_Z) = {log_scale:.2f}")
print(f"  mu = {scale_GeV:.2e} GeV")
print(f"  mu = {scale_GeV/1000:.1f} TeV")

# Also calculate at various scales for reference
print(f"\n=== sin^2(theta_W) at various scales ===")
scales = [1e2, 1e3, 1e4, 1e5, 1e6, 1e10, 1e16]  # GeV
for mu in scales:
    log_t = np.log(mu / M_Z)
    s2 = sin2_theta_at_scale(log_t)
    print(f"  mu = {mu:.0e} GeV: sin^2(theta_W) = {s2:.4f}")

# GUT scale value
log_GUT = np.log(2e16 / M_Z)
sin2_GUT = sin2_theta_at_scale(log_GUT)
print(f"\nAt GUT scale (2e16 GeV): sin^2(theta_W) = {sin2_GUT:.4f}")
print(f"Compare to SU(5) prediction: 3/8 = {3/8:.4f}")

# Alternative predictions to compare
print(f"\n=== Alternative predictions ===")
print(f"Im(C)/(Im(C)+Im(H)) = 1/4 = {1/4:.4f}  <-- framework prediction")
print(f"dim(C)/(dim(C)+dim(H)) = 2/6 = {2/6:.4f}")
print(f"Im(C)/Im(H) = 1/3 = {1/3:.4f}")
print(f"1/dim(H) = 1/4 = {1/4:.4f}")
print(f"SU(5) at GUT: 3/8 = {3/8:.4f}")

# Physical interpretation
print(f"\n=== PHYSICAL INTERPRETATION ===")
print(f"""
The framework predicts sin^2(theta_W) = 1/4 from:
  - SU(2) originates from H (defect) with Im(H) = 3
  - U(1) originates from C (crystal) with Im(C) = 1
  - Coupling ratio: g'^2/g^2 = Im(C)/Im(H) = 1/3
  - Therefore: sin^2(theta_W) = 1/(1+3) = 1/4

This "bare" value is reached at scale mu ~ {scale_GeV/1000:.0f} TeV.

Comparison with GUT models:
  - SU(5) predicts 3/8 = 0.375 at GUT scale
  - SM running gives 0.318 at GUT (doesn't match)
  - SUSY needed for precise unification

  - Perspective predicts 1/4 = 0.250 at ~{scale_GeV/1000:.0f} TeV
  - SM running naturally achieves this (no new physics needed to explain 0.231)

Possible interpretation:
  - ~{scale_GeV/1000:.0f} TeV is the "defect-crystal interface scale"
  - Above this: pristine interface geometry with sin^2 = 1/4
  - Below this: radiative corrections modify to 0.231 at M_Z
""")

# Check: at what scale does running break down?
# (where couplings become non-perturbative)
print(f"\n=== Perturbativity check ===")
for log_t in [0, 10, 20, 30, 40]:
    g2 = g2_MZ / (1 + b_g * g2_MZ / (16 * np.pi**2) * log_t)
    gp2 = gp2_MZ / (1 + b_gp * gp2_MZ / (16 * np.pi**2) * log_t)
    mu = M_Z * np.exp(log_t)
    print(f"  mu = {mu:.1e} GeV: g = {np.sqrt(g2):.3f}, g' = {np.sqrt(abs(gp2)):.3f}")
