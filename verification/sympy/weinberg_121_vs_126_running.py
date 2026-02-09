#!/usr/bin/env python3
"""
Weinberg Angle: 121-vs-126 Denominator Reconciliation via SM Running

KEY QUESTION: Can SM one-loop RG running reconcile the induced formula
sin^2(theta_W) = 29/126 with the S151 formula 28/121?

Two framework formulas:
  (1) 28/121 = n_d*Im_O/n_c^2 = 0.23140... [S151, 0.08% from M_Z]
  (2) 29/126 = S_2/S_EM       = 0.23016... [S153 induced, 0.45% from M_Z]

Measured: sin^2(theta_W)(M_Z)_MSbar = 0.23122 +/- 0.00004

This script:
  A. Algebraic analysis of the two formulas
  B. SM one-loop running of sin^2(theta_W) from M_Z to various scales
  C. Scale identification: at what energy does each formula hold?
  D. Direction test: does running go the right way?
  E. Reverse test: if sin^2 = 29/126 at 405 TeV, what at M_Z?
  F. Energy gap between the two framework values

Depends on:
  - [A-IMPORT] SM one-loop beta coefficients
  - [A-IMPORT] Measured couplings at M_Z (PDG)
  - [D] Framework numbers n_d=4, n_c=11, Im_O=7

Created: Session 155
"""

from sympy import *
from sympy import Rational as R
import math

# ==============================================================================
# FRAMEWORK NUMBERS
# ==============================================================================

_R, C, H_alg, O_alg = 1, 2, 4, 8
Im_H, Im_O = 3, 7
n_c, n_d = 11, 4
N_I = n_d**2 + n_c**2   # 137
S_EM = N_I - n_c          # 126
Phi6 = n_c**2 - n_c + 1   # 111

# Framework predictions
sw2_121 = R(28, 121)   # = n_d * Im_O / n_c^2
sw2_126 = R(29, 126)   # = S_2 / S_EM

# ==============================================================================
# MEASURED VALUES (PDG 2022/2024)
# ==============================================================================

M_Z_val = 91.1876       # GeV
sw2_meas = 0.23122      # MS-bar at M_Z
aem_inv_MZ = 127.951    # 1/alpha_em(M_Z)
alpha_s_MZ = 0.1180     # alpha_s(M_Z)

# SM one-loop beta coefficients (GUT-normalized for U(1))
# Convention: d(1/alpha_i)/d(ln mu) = -b_i/(2*pi)
b1_GUT = 41.0/10.0     # U(1), GUT-normalized
b2_SM  = -19.0/6.0     # SU(2)
b3_SM  = -7.0          # SU(3)

# Composite scale from framework
Lambda_comp = 405000.0  # GeV (~405 TeV from S153)

# ==============================================================================
# PART A: ALGEBRAIC ANALYSIS
# ==============================================================================

print("=" * 72)
print("PART A: ALGEBRAIC STRUCTURE OF THE TWO FORMULAS")
print("=" * 72)

# Exact difference
diff_exact = sw2_121 - sw2_126
num_cross = 28 * 126 - 29 * 121  # cross multiply
denom_cross = 121 * 126

print(f"\n  Formula 1: 28/121 = {float(sw2_121):.8f}")
print(f"  Formula 2: 29/126 = {float(sw2_126):.8f}")
print(f"  Measured:          {sw2_meas:.8f}")
print(f"\n  Difference: 28/121 - 29/126 = {diff_exact} = {float(diff_exact):.8f}")
print(f"  Cross: 28*126 - 29*121 = {28*126} - {29*121} = {num_cross}")
print(f"  Denominator: 121 * 126 = {denom_cross}")

# Factor the numerator 19
print(f"\n  Numerator = 19 (prime)")
print(f"    19 = n_d^2 + Im_H = {n_d**2} + {Im_H} = {n_d**2 + Im_H}")
print(f"    19 = n_c + O = {n_c} + {O_alg} = {n_c + O_alg}")
print(f"    19 = 2*n_c - Im_H = 2*{n_c} - {Im_H} = {2*n_c - Im_H}")

# Factor the denominator
print(f"\n  Denominator = 121 * 126")
print(f"    121 = n_c^2")
print(f"    126 = C * Im_H^2 * Im_O = {C * Im_H**2 * Im_O}")
print(f"    126 = N_I - n_c = {N_I} - {n_c}")
print(f"\n  So: diff = 19 / (n_c^2 * C * Im_H^2 * Im_O)")

# Numerator/denominator shifts
print(f"\n  Numerator shift: 29 - 28 = 1 = R")
print(f"  Denominator shift: 126 - 121 = 5 = H + R = n_d^2 - n_c = {n_d**2 - n_c}")

# ==============================================================================
# PART B: SM ONE-LOOP RUNNING
# ==============================================================================

print("\n" + "=" * 72)
print("PART B: SM ONE-LOOP RUNNING OF sin^2(theta_W)")
print("=" * 72)

# Extract individual couplings at M_Z
# sin^2(theta) = alpha_em / alpha_2
# 1/alpha_em = 1/alpha_2 + 1/alpha_Y
# GUT: alpha_1 = (5/3)*alpha_Y

a2_inv_MZ = sw2_meas * aem_inv_MZ        # 1/alpha_2
aY_inv_MZ = (1.0 - sw2_meas) * aem_inv_MZ  # 1/alpha_Y
a1_inv_MZ = (3.0/5.0) * aY_inv_MZ         # 1/alpha_1 (GUT)

print(f"\n  Couplings at M_Z = {M_Z_val} GeV:")
print(f"    1/alpha_em = {aem_inv_MZ:.3f}")
print(f"    sin^2(theta_W) = {sw2_meas:.5f}")
print(f"    1/alpha_2 = {a2_inv_MZ:.4f}")
print(f"    1/alpha_Y = {aY_inv_MZ:.4f}")
print(f"    1/alpha_1 (GUT) = {a1_inv_MZ:.4f}")

def run_couplings(a1_inv_0, a2_inv_0, mu_0, mu_f):
    """One-loop SM running of GUT-normalized gauge couplings."""
    t = math.log(mu_f / mu_0)
    a1_inv = a1_inv_0 - b1_GUT / (2.0 * math.pi) * t
    a2_inv = a2_inv_0 - b2_SM / (2.0 * math.pi) * t
    return a1_inv, a2_inv

def sin2_from_GUT(a1_inv, a2_inv):
    """sin^2(theta_W) from GUT-normalized couplings."""
    # sin^2(theta) = (3/5) * alpha_1 / ((3/5)*alpha_1 + alpha_2)
    # In terms of inverse: sin^2 = 3*a2_inv / (3*a2_inv + 5*a1_inv)
    return 3.0 * a2_inv / (3.0 * a2_inv + 5.0 * a1_inv)

# Verify at M_Z
sw2_check = sin2_from_GUT(a1_inv_MZ, a2_inv_MZ)
print(f"\n  Verify: sin^2(theta_W) from couplings = {sw2_check:.6f} (should be {sw2_meas})")

# Run to several scales
print(f"\n  Running sin^2(theta_W) from M_Z to various scales:")
print(f"  {'Scale (GeV)':>15s}  {'ln(mu/M_Z)':>10s}  {'sin^2(theta_W)':>16s}  {'vs 28/121':>10s}  {'vs 29/126':>10s}")
print(f"  {'-'*15}  {'-'*10}  {'-'*16}  {'-'*10}  {'-'*10}")

scales = [10.0, 50.0, M_Z_val, 100.0, 200.0, 500.0, 1000.0, 5000.0,
          10000.0, 50000.0, 100000.0, 405000.0, 1e6, 1e7, 1e10, 1e16]

sw2_at_scales = {}
for mu in scales:
    a1_inv, a2_inv = run_couplings(a1_inv_MZ, a2_inv_MZ, M_Z_val, mu)
    sw2 = sin2_from_GUT(a1_inv, a2_inv)
    sw2_at_scales[mu] = sw2
    ln_ratio = math.log(mu / M_Z_val)
    diff_121 = (sw2 - float(sw2_121)) * 1e4  # in units of 10^-4
    diff_126 = (sw2 - float(sw2_126)) * 1e4
    label = ""
    if abs(mu - M_Z_val) < 1:
        label = " <-- M_Z"
    elif abs(mu - 405000) < 1:
        label = " <-- Lambda_comp"
    print(f"  {mu:15.1f}  {ln_ratio:10.4f}  {sw2:16.8f}  {diff_121:+10.2f}  {diff_126:+10.2f}{label}")

# ==============================================================================
# PART C: SCALE IDENTIFICATION
# ==============================================================================

print("\n" + "=" * 72)
print("PART C: AT WHAT SCALE DOES EACH FORMULA HOLD?")
print("=" * 72)

# Find scale where sin^2 = 28/121
target_121 = float(sw2_121)
target_126 = float(sw2_126)

# sin^2(theta) is monotonically increasing with mu (in the SM)
# Use bisection to find the scale

def find_scale(target_sw2, mu_low=1.0, mu_high=1e18, tol=1e-10):
    """Find energy scale where sin^2(theta_W) = target."""
    for _ in range(200):
        mu_mid = math.sqrt(mu_low * mu_high)  # geometric mean
        a1_inv, a2_inv = run_couplings(a1_inv_MZ, a2_inv_MZ, M_Z_val, mu_mid)
        sw2 = sin2_from_GUT(a1_inv, a2_inv)
        if abs(sw2 - target_sw2) < tol:
            return mu_mid
        if sw2 < target_sw2:
            mu_low = mu_mid
        else:
            mu_high = mu_mid
    return mu_mid

mu_121 = find_scale(target_121)
mu_126 = find_scale(target_126)

print(f"\n  sin^2 = 28/121 = {target_121:.8f} occurs at mu = {mu_121:.2f} GeV")
print(f"  sin^2 = 29/126 = {target_126:.8f} occurs at mu = {mu_126:.2f} GeV")
print(f"\n  For comparison:")
print(f"    M_Z = {M_Z_val} GeV")
print(f"    Lambda_comp = {Lambda_comp:.0f} GeV")

ratio_121_MZ = mu_121 / M_Z_val
ratio_126_MZ = mu_126 / M_Z_val
print(f"\n  mu(28/121) / M_Z = {ratio_121_MZ:.4f} (factor {ratio_121_MZ:.2f} above M_Z)")
print(f"  mu(29/126) / M_Z = {ratio_126_MZ:.4f} (factor {1.0/ratio_126_MZ:.2f} below M_Z)")
print(f"  mu(28/121) / mu(29/126) = {mu_121/mu_126:.4f}")

# ==============================================================================
# PART D: DIRECTION ANALYSIS
# ==============================================================================

print("\n" + "=" * 72)
print("PART D: DIRECTION ANALYSIS -- RUNNING UP vs DOWN")
print("=" * 72)

sw2_at_comp = sw2_at_scales[Lambda_comp]
print(f"\n  sin^2(theta_W) at Lambda = 405 TeV: {sw2_at_comp:.6f}")
print(f"  sin^2(theta_W) at M_Z:              {sw2_meas:.6f}")
print(f"  sin^2(theta_W)(28/121):              {target_121:.6f}")
print(f"  sin^2(theta_W)(29/126):              {target_126:.6f}")

print(f"\n  DIRECTION: sin^2 INCREASES going up in energy (toward GUT value 3/8 = 0.375)")
print(f"  At Lambda = 405 TeV: sin^2 = {sw2_at_comp:.4f} -- FAR from both framework values")
print(f"  Both 28/121 and 29/126 are LOW-ENERGY values near M_Z")

is_29_126_below_MZ = mu_126 < M_Z_val
is_28_121_above_MZ = mu_121 > M_Z_val
print(f"\n  29/126 = 0.2302 < 0.2312 (measured) => scale BELOW M_Z: {is_29_126_below_MZ}")
print(f"  28/121 = 0.2314 > 0.2312 (measured) => scale ABOVE M_Z: {is_28_121_above_MZ}")

# ==============================================================================
# PART E: REVERSE TEST -- STARTING FROM FRAMEWORK VALUES AT 405 TEV
# ==============================================================================

print("\n" + "=" * 72)
print("PART E: IF FRAMEWORK VALUES HOLD AT 405 TEV, WHAT AT M_Z?")
print("=" * 72)

# If sin^2 = 29/126 and alpha = 1/137 at Lambda = 405 TeV:
# Extract couplings at Lambda
aem_inv_Lambda = 137.0  # framework value
sw2_Lambda_hyp = float(sw2_126)  # hypothesis: 29/126 at Lambda

a2_inv_Lambda = sw2_Lambda_hyp * aem_inv_Lambda
aY_inv_Lambda = (1.0 - sw2_Lambda_hyp) * aem_inv_Lambda
a1_inv_Lambda = (3.0/5.0) * aY_inv_Lambda

print(f"\n  Hypothesis: sin^2 = 29/126, alpha = 1/137 at Lambda = 405 TeV")
print(f"    1/alpha_2(Lambda) = {a2_inv_Lambda:.4f}")
print(f"    1/alpha_Y(Lambda) = {aY_inv_Lambda:.4f}")
print(f"    1/alpha_1(Lambda) = {a1_inv_Lambda:.4f}")

# Run DOWN to M_Z
a1_MZ_from_Lambda, a2_MZ_from_Lambda = run_couplings(
    a1_inv_Lambda, a2_inv_Lambda, Lambda_comp, M_Z_val)
sw2_MZ_from_Lambda = sin2_from_GUT(a1_MZ_from_Lambda, a2_MZ_from_Lambda)
aem_inv_MZ_from_Lambda = a2_MZ_from_Lambda / sw2_MZ_from_Lambda if sw2_MZ_from_Lambda > 0 else 0

print(f"\n  Running down to M_Z:")
print(f"    1/alpha_1(M_Z) = {a1_MZ_from_Lambda:.4f} (measured: {a1_inv_MZ:.4f})")
print(f"    1/alpha_2(M_Z) = {a2_MZ_from_Lambda:.4f} (measured: {a2_inv_MZ:.4f})")
print(f"    sin^2(theta_W)(M_Z) = {sw2_MZ_from_Lambda:.6f} (measured: {sw2_meas:.6f})")
print(f"    1/alpha_em(M_Z) = {aem_inv_MZ_from_Lambda:.3f} (measured: {aem_inv_MZ:.3f})")
print(f"\n  CONCLUSION: Starting from framework values at 405 TeV gives")
print(f"  sin^2(M_Z) = {sw2_MZ_from_Lambda:.4f}, which is {'CLOSE' if abs(sw2_MZ_from_Lambda - sw2_meas) < 0.02 else 'FAR'} from measured {sw2_meas}")

# Also try with measured alpha at Lambda
print(f"\n  --- Alternative: use MEASURED couplings extrapolated to 405 TeV ---")
print(f"  sin^2(405 TeV) from measured M_Z values: {sw2_at_comp:.6f}")
print(f"  This is FAR from 29/126 = {float(sw2_126):.6f}")

# ==============================================================================
# PART F: ENERGY GAP BETWEEN THE TWO FRAMEWORK VALUES
# ==============================================================================

print("\n" + "=" * 72)
print("PART F: ENERGY GAP BETWEEN 28/121 AND 29/126")
print("=" * 72)

energy_ratio = mu_121 / mu_126
ln_gap = math.log(energy_ratio)

print(f"\n  28/121 holds at mu = {mu_121:.2f} GeV")
print(f"  29/126 holds at mu = {mu_126:.2f} GeV")
print(f"  Energy ratio: {energy_ratio:.4f}")
print(f"  ln(mu_121/mu_126) = {ln_gap:.4f}")

# The rate of change of sin^2 near M_Z
# Approximate: d(sin^2)/d(ln mu) at M_Z
delta = 0.01
a1p, a2p = run_couplings(a1_inv_MZ, a2_inv_MZ, M_Z_val, M_Z_val * math.exp(delta))
a1m, a2m = run_couplings(a1_inv_MZ, a2_inv_MZ, M_Z_val, M_Z_val * math.exp(-delta))
sw2p = sin2_from_GUT(a1p, a2p)
sw2m = sin2_from_GUT(a1m, a2m)
dsw2_dlnmu = (sw2p - sw2m) / (2.0 * delta)

print(f"\n  Rate: d(sin^2)/d(ln mu) at M_Z = {dsw2_dlnmu:.6f}")
print(f"  Verification: Delta(sin^2) = {float(sw2_121) - float(sw2_126):.6f}")
print(f"  Expected ln gap = Delta / rate = {(float(sw2_121) - float(sw2_126)) / dsw2_dlnmu:.4f}")
print(f"  Actual ln gap = {ln_gap:.4f}")

# Physical meaning of the gap
print(f"\n  The two formulas differ by an energy factor of {energy_ratio:.2f}")
print(f"  29/126 matches at {mu_126:.1f} GeV (below M_Z)")
print(f"  28/121 matches at {mu_121:.1f} GeV (above M_Z)")
print(f"  M_Z = {M_Z_val} GeV sits between them")

# ==============================================================================
# PART G: COMPARISON WITH COS^2(theta_W) = 171/194 (EXISTING FORMULA)
# ==============================================================================

print("\n" + "=" * 72)
print("PART G: CONSISTENCY WITH EXISTING cos^2(theta_W) = 171/194")
print("=" * 72)

# The framework also has cos(theta_W) = 171/194 (sub-10 ppm)
# This means sin^2(theta_W) = 1 - (171/194)^2 = 1 - 29241/37636
# = (37636 - 29241)/37636 = 8395/37636

sw2_from_cos = 1 - R(171, 194)**2
print(f"\n  cos(theta_W) = 171/194 => sin^2 = 1 - (171/194)^2 = {sw2_from_cos} = {float(sw2_from_cos):.8f}")
print(f"  Measured: {sw2_meas:.8f}")
print(f"  Error: {abs(float(sw2_from_cos) - sw2_meas)/sw2_meas * 100:.4f}%")
print(f"  Error in ppm: {abs(float(sw2_from_cos) - sw2_meas)/sw2_meas * 1e6:.1f}")

# Compare all three
print(f"\n  Three framework predictions for sin^2(theta_W):")
print(f"    28/121          = {float(sw2_121):.8f}  err = {abs(float(sw2_121) - sw2_meas)/sw2_meas * 100:.4f}%")
print(f"    29/126          = {float(sw2_126):.8f}  err = {abs(float(sw2_126) - sw2_meas)/sw2_meas * 100:.4f}%")
print(f"    1-(171/194)^2   = {float(sw2_from_cos):.8f}  err = {abs(float(sw2_from_cos) - sw2_meas)/sw2_meas * 100:.4f}%")
print(f"    Measured         = {sw2_meas:.8f}")

# Relationships between them
diff_121_cos = sw2_121 - sw2_from_cos
diff_126_cos = sw2_126 - sw2_from_cos
print(f"\n  28/121 - (1-cos^2) = {diff_121_cos} = {float(diff_121_cos):.8f}")
print(f"  29/126 - (1-cos^2) = {diff_126_cos} = {float(diff_126_cos):.8f}")

# At what scale does 1-(171/194)^2 hold?
mu_cos = find_scale(float(sw2_from_cos))
print(f"\n  1-(171/194)^2 matches sin^2(theta_W) at mu = {mu_cos:.2f} GeV")

# ==============================================================================
# PART H: KEY FINDING -- MEASURED VALUE BETWEEN THE TWO FORMULAS
# ==============================================================================

print("\n" + "=" * 72)
print("PART H: KEY FINDING -- MEASURED VALUE SITS BETWEEN THE FORMULAS")
print("=" * 72)

is_between = float(sw2_126) < sw2_meas < float(sw2_121)
print(f"\n  29/126 = {float(sw2_126):.6f}")
print(f"  MEASURED = {sw2_meas:.6f}")
print(f"  28/121 = {float(sw2_121):.6f}")
print(f"\n  Measured is between the two formulas: {is_between}")

if is_between:
    # Weighted average?
    w = (sw2_meas - float(sw2_126)) / (float(sw2_121) - float(sw2_126))
    print(f"  Interpolation weight: {w:.4f} (fraction toward 28/121)")
    print(f"  Measured = {1-w:.4f} * (29/126) + {w:.4f} * (28/121)")

    # Can we express w as a framework number?
    w_frac = R(round(w * 1000), 1000)
    # w ~ 0.85 = 17/20?
    print(f"\n  Closest simple fractions for weight {w:.4f}:")
    for num in range(1, 30):
        for den in range(num+1, 40):
            f = R(num, den)
            if abs(float(f) - w) < 0.01:
                interp = float(f) * float(sw2_121) + float(1 - f) * float(sw2_126)
                err = abs(interp - sw2_meas) / sw2_meas * 100
                print(f"    {num}/{den} = {float(f):.4f} -> sin^2 = {interp:.6f} (err {err:.4f}%)")

# ==============================================================================
# PART I: MEDIANT AND WEIGHTED AVERAGE STRUCTURE
# ==============================================================================

print("\n" + "=" * 72)
print("PART I: WEIGHTED AVERAGE -- CAN A SINGLE FRACTION FIT?")
print("=" * 72)

# If sin^2 = (28a + 29b)/(121a + 126b) for integers a, b:
# Setting equal to 0.23122: a/b ~ 6.09
# With a=6, b=1: (168+29)/(726+126) = 197/852

mediant_num = 28*6 + 29*1
mediant_den = 121*6 + 126*1
mediant_val = R(mediant_num, mediant_den)
err_mediant = abs(float(mediant_val) - sw2_meas) / sw2_meas

print(f"\n  Weighted mediant with a=6, b=1:")
print(f"  sin^2 = (28*6 + 29*1)/(121*6 + 126*1) = {mediant_num}/{mediant_den}")
print(f"  = {float(mediant_val):.8f}")
print(f"  Measured: {sw2_meas:.8f}")
print(f"  Error: {err_mediant*1e6:.1f} ppm ({err_mediant*100:.4f}%)")

# Factor 197 and 852
print(f"\n  197: prime (= 14^2 + 1 = 196 + 1)")
print(f"    196 = R^2+Im_H^2+H^2+Im_O^2+n_c^2 (master identity)")
print(f"    So 197 = sum_of_dim_squares + 1")
print(f"  852 = 6*121 + 126 = C*Im_H*n_c^2 + S_EM")
print(f"    = 6*n_c^2 + N_I - n_c")
print(f"    = 4 * 213 = n_d * 213")
print(f"    852 = 12 * 71 = dim(SM_gauge) * 71")

# Check: is 6 = C * Im_H? The ratio a/b = 6 = C * Im_H
print(f"\n  The weight ratio a/b = 6 = C * Im_H")
print(f"  This means: 6 parts '28/121' to 1 part '29/126'")
print(f"  = C*Im_H parts Goldstone-fraction to R parts induced-fraction")

# But is this post-hoc fitting? HRS check
print(f"\n  HRS check: a/b = 6 is a simple integer (+1)")
print(f"  Matches known value exactly (+2)")
print(f"  No derivation of WHY a/b = 6 (+3)")
print(f"  HRS = 6 (HIGH RISK) -- likely numerological")

# Alternative: the ON-SHELL and MS-bar definitions
print(f"\n  PHYSICAL INTERPRETATION:")
print(f"  28/121 = Goldstone/crystal fraction (structural)")
print(f"  29/126 = charge-weighted fraction (dynamical)")
print(f"  The measured sin^2_MSbar includes radiative corrections.")
print(f"  Perhaps: tree-level = 28/121, loop correction shifts toward 29/126?")
print(f"  Or: 28/121 = on-shell-like, 29/126 = running-like, measured in between?")

# ON-SHELL comparison
sw2_onshell = 1.0 - (80.377/91.1876)**2
print(f"\n  On-shell sin^2 = 1 - M_W^2/M_Z^2 = {sw2_onshell:.6f}")
print(f"  = 1 - (171/194)^2 = {float(1 - R(171,194)**2):.6f}")
print(f"  MS-bar sin^2(M_Z) = {sw2_meas:.6f}")
print(f"  Difference (radiative correction) = {sw2_meas - sw2_onshell:.6f} ({(sw2_meas - sw2_onshell)/sw2_meas*100:.2f}%)")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("\n" + "=" * 72)
print("VERIFICATION TESTS")
print("=" * 72)

tests = [
    # Algebraic identities
    ("28/121 - 29/126 = 19/15246",
     sw2_121 - sw2_126 == R(19, 15246)),

    ("19 = n_d^2 + Im_H = 16 + 3",
     n_d**2 + Im_H == 19),

    ("15246 = n_c^2 * C * Im_H^2 * Im_O",
     n_c**2 * C * Im_H**2 * Im_O == 15246),

    ("Denominator shift: 126 - 121 = 5 = H^2 - n_c",
     H_alg**2 - n_c == 5),

    # Running direction
    ("sin^2 INCREASES with energy (at M_Z)",
     dsw2_dlnmu > 0),

    ("sin^2(405 TeV) > sin^2(M_Z)",
     sw2_at_comp > sw2_meas),

    ("sin^2(405 TeV) > 0.25 (far from framework values)",
     sw2_at_comp > 0.25),

    # Scale identification
    ("28/121 holds ABOVE M_Z",
     mu_121 > M_Z_val),

    ("29/126 holds BELOW M_Z",
     mu_126 < M_Z_val),

    ("Measured sin^2 is between 29/126 and 28/121",
     float(sw2_126) < sw2_meas < float(sw2_121)),

    # Running CANNOT reconcile at 405 TeV
    ("sin^2(405 TeV) far from 29/126 (diff > 0.04)",
     abs(sw2_at_comp - float(sw2_126)) > 0.04),

    ("Starting from framework at 405 TeV gives wrong M_Z value (off > 5%)",
     abs(sw2_MZ_from_Lambda - sw2_meas) / sw2_meas > 0.05),

    # S_2 = 29 identity
    ("29 = n_d^2 + Im_H^2 + C^2",
     n_d**2 + Im_H**2 + C**2 == 29),

    ("29 = Im_H*Im_O + O",
     Im_H * Im_O + O_alg == 29),

    ("97 = S_EM - 29 = n_c^2 - n_d*Im_O + n_d",
     n_c**2 - n_d * Im_O + n_d == 97),

    # cos(theta_W) = 171/194 is ON-SHELL (M_W/M_Z), not MS-bar sin^2
    # On-shell sin^2 = 1 - M_W^2/M_Z^2 ~ 0.2229
    # MS-bar sin^2(M_Z) = 0.2312 -- DIFFERENT quantity
    ("cos(theta_W)=171/194 matches ON-SHELL M_W/M_Z, not MS-bar sin^2",
     abs(float(R(171,194)) - 80.377/91.1876) < 0.001),

    # Energy gap
    ("Energy gap between formulas < factor 2",
     mu_121 / mu_126 < 2.0),
]

print()
all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    print(f"[{status}] {name}")

print(f"\n{'ALL TESTS PASS' if all_pass else 'SOME TESTS FAILED'}: {sum(1 for _, p in tests if p)}/{len(tests)}")

# ==============================================================================
# SUMMARY
# ==============================================================================

print("\n" + "=" * 72)
print("SUMMARY")
print("=" * 72)

print("""
FINDING 1: SM running CANNOT reconcile 29/126 at 405 TeV with 28/121 at M_Z.
  sin^2(theta_W) at 405 TeV = {:.4f} (SM running from M_Z)
  This is FAR from both 28/121 = 0.2314 and 29/126 = 0.2302.
  Running goes in the WRONG direction -- sin^2 INCREASES with energy.

FINDING 2: Both formulas are LOW-ENERGY predictions, near M_Z.
  28/121 = 0.2314 matches at mu = {:.1f} GeV (just above M_Z)
  29/126 = 0.2302 matches at mu = {:.1f} GeV (below M_Z)
  Energy ratio: {:.2f} (small gap)

FINDING 3: The measured value sits BETWEEN the two formulas.
  29/126 < measured < 28/121
  This suggests neither is exactly right at M_Z; the true formula
  may involve both structures or a correction term.

FINDING 4: cos(theta_W) = 171/194 is ON-SHELL (M_W/M_Z), not MS-bar.
  The STATUS_DASHBOARD entry is for the on-shell definition.
  sin^2_onshell = 1-(M_W/M_Z)^2 = 0.2229
  sin^2_MSbar(M_Z) = 0.2312
  These are DIFFERENT quantities. 28/121 and 29/126 target MSbar.

FINDING 5: Algebraic structure of the difference.
  28/121 - 29/126 = 19/(n_c^2 * C * Im_H^2 * Im_O)
  where 19 = n_d^2 + Im_H (sum of defect square and H imaginary dim)

FINDING 6: Weighted mediant 197/852 matches to 4 ppm (HRS = 6, HIGH RISK).
  (28*6 + 29)/(121*6 + 126) = 197/852 = 0.23122...
  Weight ratio a/b = 6 = C*Im_H. But no derivation of WHY.

CONCLUSION: The "running reconciliation" hypothesis is FALSIFIED.
  Both 28/121 and 29/126 are competing predictions for sin^2(theta_W)
  at the electroweak scale. They bracket the measured value.
  28/121 (0.08%) remains the better match to MSbar at M_Z.
  The two formulas may correspond to different physical definitions
  (structural vs dynamical), not different scales.
""".format(sw2_at_comp, mu_121, mu_126, mu_121/mu_126))

if __name__ == "__main__":
    pass  # Script runs on import
