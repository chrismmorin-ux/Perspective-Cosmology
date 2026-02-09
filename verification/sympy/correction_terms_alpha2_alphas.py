#!/usr/bin/env python3
"""
Correction Terms for alpha_2 and alpha_s: Systematic Search

KEY FINDING: Testing whether framework expressions analogous to the 4/111
correction for alpha_EM exist for the weak and strong couplings.

Context:
- 1/alpha_EM = N_I + n_d/Phi_6(n_c) = 137 + 4/111 (27 ppm)
- Leading-order 1/alpha_2 ~ 30, 1/alpha_s ~ 8 at M_Z
- Task: find corrections that reduce these 1-6% residuals

Result: The 4/111 correction for alpha_EM is UNIQUE among the three couplings.
For alpha_2 and alpha_s, Phi_6 corrections exist numerically but lack the
compelling simplicity of n_d/Phi_6(n_c). HRS = 5 (likely numerology).

Depends on:
- multi_coupling_tilt_angles.md (S151+S153+S157)
- per_sector_induced_couplings.py (S153): induced mechanism
- s2_29_derivation.py (S157): S_2 = 29 from Complex Bridge

Created: Session 157 (Task D)
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

from sympy import *
from sympy import Rational as R

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

n_d = 4       # Defect dimension (= H)
n_c = 11      # Crystal dimension
Im_C = 1      # Imaginary complex dims
Im_H = 3      # Imaginary quaternion dims
Im_O = 7      # Imaginary octonion dims
C_dim = 2     # Complex dimension
H_dim = 4     # Quaternion dimension
O_dim = 8     # Octonion dimension

N_I = n_d**2 + n_c**2   # 137
S_EM = N_I - n_c         # 126
Phi_6 = n_c**2 - n_c + 1  # 111 = Phi_6(n_c)

S_2 = 29   # From S157: SU(2) charge-weighted sum
S_3 = 8    # = O: SU(3) charge-weighted sum
S_Y = S_EM - S_2  # 97: U(1)_Y sum

print("=" * 72)
print("CORRECTION TERMS FOR alpha_2 AND alpha_s")
print("=" * 72)
print()
print(f"Framework: n_d={n_d}, n_c={n_c}, N_I={N_I}, S_EM={S_EM}, Phi_6={Phi_6}")
print(f"S_2={S_2}, S_3={S_3}, S_Y={S_Y}")
print()

# ==============================================================================
# MEASURED VALUES (PDG 2024)
# ==============================================================================

# Low-energy EM coupling (CODATA 2022)
alpha_inv_low = R(137035999177, 10**9)  # 137.035999177

# At M_Z (MS-bar scheme, PDG 2024)
alpha_inv_MZ = R(127952, 1000)          # 127.952 +/- 0.009
sin2_W_MZ = R(23121, 100000)            # 0.23121 +/- 0.00004
alpha_s_MZ = R(1180, 10000)             # 0.1180 +/- 0.0009
alpha_s_inv_MZ = 1 / alpha_s_MZ         # 8.4746

# Derived: 1/alpha_2(M_Z) = sin^2(theta_W) * 1/alpha_EM(M_Z)
alpha_2_inv_MZ = sin2_W_MZ * alpha_inv_MZ

print(f"alpha_EM^-1(q^2->0) = {float(alpha_inv_low):.9f}")
print(f"alpha_EM^-1(M_Z)    = {float(alpha_inv_MZ):.3f}")
print(f"sin^2(theta_W)(M_Z) = {float(sin2_W_MZ):.5f}")
print(f"alpha_2^-1(M_Z)     = {float(alpha_2_inv_MZ):.4f}")
print(f"alpha_s^-1(M_Z)     = {float(alpha_s_inv_MZ):.4f}")
print()

# Uncertainties
delta_alpha_2_inv = R(4, 100000) * alpha_inv_MZ  # from delta(sin^2) = 0.00004
delta_alpha_s_inv = R(9, 10000) / alpha_s_MZ**2  # from delta(alpha_s) = 0.0009

# ==============================================================================
# LEADING-ORDER FORMULAS AND RESIDUALS
# ==============================================================================

print("=" * 72)
print("LEADING-ORDER FORMULAS AND RESIDUALS")
print("=" * 72)
print()

# alpha_EM correction (reference)
lead_EM = N_I  # 137
corr_EM = R(n_d, Phi_6)  # 4/111
pred_EM = lead_EM + corr_EM
err_EM_ppm = abs(float(pred_EM - alpha_inv_low) / float(alpha_inv_low)) * 1e6
print(f"alpha_EM: 1/alpha = {lead_EM} + {n_d}/{Phi_6} = {float(pred_EM):.9f}")
print(f"  Measured: {float(alpha_inv_low):.9f}, Error: {err_EM_ppm:.1f} ppm")
print()

# Leading-order for alpha_2: Im_H(Im_H+Im_O) = 3*10 = 30
print(f"alpha_2: leading = Im_H*(Im_H+Im_O) = {Im_H*(Im_H+Im_O)}")
print(f"  Residual from measured: {float(alpha_2_inv_MZ) - 30:+.4f}")
print()

# Leading-order for alpha_s: O = 8
print(f"alpha_s: leading = O = {O_dim}")
print(f"  Residual from measured: {float(alpha_s_inv_MZ) - 8:+.4f}")
print()

# ==============================================================================
# PHI_6 CORRECTION PATTERN
# ==============================================================================

print("=" * 72)
print("PHI_6 CORRECTION PATTERN")
print("=" * 72)
print()

# alpha_2 with A=30, B=-47:
B2_candidate = -47
pred_a2_phi6 = 30 + R(B2_candidate, Phi_6)
err_a2_phi6 = abs(float(pred_a2_phi6 - alpha_2_inv_MZ)) / float(alpha_2_inv_MZ)

print(f"B_2 = -47 = -(n_d*n_c + Im_H) = -({n_d}*{n_c}+{Im_H})")
assert n_d * n_c + Im_H == 47
print(f"  1/alpha_2 = 30 - 47/111 = {float(pred_a2_phi6):.6f}")
print(f"  Measured: {float(alpha_2_inv_MZ):.6f}")
print(f"  Error: {err_a2_phi6*1e6:.0f} ppm ({err_a2_phi6*100:.3f}%)")
print()

# alpha_s with A=8, B=+53:
B3_candidate = 53
pred_as_phi6 = 8 + R(B3_candidate, Phi_6)
err_as_phi6 = abs(float(pred_as_phi6 - alpha_s_inv_MZ)) / float(alpha_s_inv_MZ)

print(f"B_3 = +53 = Im_O^2 + n_d = {Im_O**2}+{n_d}")
assert Im_O**2 + n_d == 53
print(f"  1/alpha_s = 8 + 53/111 = {float(pred_as_phi6):.6f}")
print(f"  Measured: {float(alpha_s_inv_MZ):.6f}")
print(f"  Error: {err_as_phi6*1e6:.0f} ppm ({err_as_phi6*100:.3f}%)")
print()

# Summary of Phi_6 pattern
print("--- Phi_6 Correction Pattern Summary ---")
print(f"  alpha_EM: 1/alpha = {N_I} + {n_d}/{Phi_6}  B_EM=n_d={n_d}  err={err_EM_ppm:.1f} ppm")
print(f"  alpha_2:  1/alpha = 30 - 47/{Phi_6}  B_2=-(n_d*n_c+Im_H)=-47  err={err_a2_phi6*1e6:.0f} ppm")
print(f"  alpha_s:  1/alpha = 8 + 53/{Phi_6}   B_3=Im_O^2+n_d=53  err={err_as_phi6*1e6:.0f} ppm")
print()

# ==============================================================================
# NUMEROLOGY RISK ASSESSMENT
# ==============================================================================

print("=" * 72)
print("NUMEROLOGY RISK ASSESSMENT")
print("=" * 72)
print()

ratio_EM = abs(float(R(4, 111))) / 137
ratio_a2 = abs(float(R(47, 111))) / 30
ratio_as = abs(float(R(53, 111))) / 8

print(f"{'Coupling':10s} {'|B/A|':10s} {'B framework?':25s} {'Precision':12s} {'Quality':8s}")
print("-" * 70)
print(f"{'alpha_EM':10s} {ratio_EM:.5f}    {'n_d (clean)':25s} {'27 ppm':12s} {'HIGH':8s}")
print(f"{'alpha_2':10s} {ratio_a2:.5f}    {'n_d*n_c + Im_H (3 terms)':25s} {f'{err_a2_phi6*1e6:.0f} ppm':12s} {'LOW':8s}")
print(f"{'alpha_s':10s} {ratio_as:.5f}    {'Im_O^2 + n_d (2 terms)':25s} {f'{err_as_phi6*1e6:.0f} ppm':12s} {'MEDIUM':8s}")
print()

print("CONCLUSION: B_i/Phi_6 corrections for alpha_2 and alpha_s are NOT")
print("analogous to the alpha_EM correction. The alpha_EM correction is special:")
print("  - Leading term exact (137), correction tiny (0.026%), B=n_d (simplest)")
print("  - For alpha_2/alpha_s, corrections are 1-6% of leading term")
print("  - With ~15 framework atoms, ~100+ B expressions => match by chance likely")
print()

# ==============================================================================
# INDUCED RATIO APPROACH
# ==============================================================================

print("=" * 72)
print("INDUCED RATIO APPROACH")
print("=" * 72)
print()

sin2_induced = R(S_2, S_EM)   # 29/126
ratio_s_induced = R(S_3, S_EM)  # 8/126

err_sin2 = abs(float(sin2_induced - sin2_W_MZ)) / float(sin2_W_MZ)
err_ratio_s = abs(float(ratio_s_induced) - float(alpha_s_inv_MZ / alpha_inv_MZ)) / float(alpha_s_inv_MZ / alpha_inv_MZ)

print(f"sin^2(theta_W) = S_2/S_EM = {S_2}/{S_EM} = {float(sin2_induced):.6f}")
print(f"  Measured at M_Z: {float(sin2_W_MZ):.6f}, Error: {err_sin2*100:.3f}%")
print()
print(f"alpha_s/alpha_EM = S_3/S_EM = {S_3}/{S_EM} = {float(ratio_s_induced):.6f}")
print(f"  Error: {err_ratio_s*100:.2f}%")
print()

# ==============================================================================
# HONEST COMPARISON TABLE
# ==============================================================================

print("=" * 72)
print("HONEST COMPARISON: S151 vs INDUCED vs MEASURED")
print("=" * 72)
print()

sin2_S151 = R(n_d * Im_O, n_c**2)  # 28/121

print(f"{'Quantity':20s} {'S151':15s} {'Induced':15s} {'Measured(M_Z)':15s} {'S151 err':10s} {'Ind err':10s}")
print("-" * 85)

# sin^2(theta_W)
e1 = abs(float(sin2_S151 - sin2_W_MZ)) / float(sin2_W_MZ) * 100
e2 = abs(float(sin2_induced - sin2_W_MZ)) / float(sin2_W_MZ) * 100
print(f"{'sin^2(theta_W)':20s} {'28/121':15s} {'29/126':15s} {float(sin2_W_MZ):15.5f} {e1:9.3f}% {e2:9.3f}%")

# 1/alpha_2
a2_S151 = sin2_S151 * alpha_inv_MZ
a2_ind = sin2_induced * alpha_inv_MZ
e1 = abs(float(a2_S151 - alpha_2_inv_MZ)) / float(alpha_2_inv_MZ) * 100
e2 = abs(float(a2_ind - alpha_2_inv_MZ)) / float(alpha_2_inv_MZ) * 100
print(f"{'1/alpha_2':20s} {float(a2_S151):15.4f} {float(a2_ind):15.4f} {float(alpha_2_inv_MZ):15.4f} {e1:9.3f}% {e2:9.3f}%")

# 1/alpha_s
as_S151 = O_dim
as_ind = R(S_3 * N_I, S_EM)
e1 = abs(float(as_S151) - float(alpha_s_inv_MZ)) / float(alpha_s_inv_MZ) * 100
e2 = abs(float(as_ind) - float(alpha_s_inv_MZ)) / float(alpha_s_inv_MZ) * 100
print(f"{'1/alpha_s':20s} {float(as_S151):15.4f} {float(as_ind):15.4f} {float(alpha_s_inv_MZ):15.4f} {e1:9.3f}% {e2:9.3f}%")

# With Phi_6 corrections
e_phi6_a2 = err_a2_phi6 * 100
e_phi6_as = err_as_phi6 * 100
print()
print(f"With Phi_6 corrections:")
print(f"{'1/alpha_2=30-47/111':20s} {float(pred_a2_phi6):15.4f} {'--':15s} {float(alpha_2_inv_MZ):15.4f} {e_phi6_a2:9.3f}%")
print(f"{'1/alpha_s=8+53/111':20s} {float(pred_as_phi6):15.4f} {'--':15s} {float(alpha_s_inv_MZ):15.4f} {e_phi6_as:9.3f}%")
print()

# ==============================================================================
# SM RUNNING CONTEXT
# ==============================================================================

print("=" * 72)
print("SM RUNNING CONTEXT")
print("=" * 72)
print()

# SM one-loop beta coefficients
b1 = R(41, 10)    # U(1)_Y
b2 = R(-19, 6)    # SU(2)_L
b3 = -7           # SU(3)_C

Lambda_comp = 405000  # GeV
M_Z_val = R(91188, 1000)  # GeV
log_ratio = float(log(R(Lambda_comp * 1000, int(M_Z_val * 1000))))

# One-loop shift in sin^2(theta_W) from Lambda to M_Z
b1_minus_b2 = b1 - b2
sin2_at_Lambda = float(sin2_induced)
cos2_at_Lambda = 1 - sin2_at_Lambda
delta_sin2 = float(b1_minus_b2) / (2 * 3.14159) * sin2_at_Lambda * cos2_at_Lambda * (-log_ratio)

print(f"Lambda = {Lambda_comp/1000:.0f} TeV, log(Lambda/M_Z) = {log_ratio:.4f}")
print(f"One-loop shift: delta(sin^2(theta_W)) ~ {delta_sin2:.5f}")
print(f"sin^2(M_Z) ~ {sin2_at_Lambda + delta_sin2:.5f} vs measured {float(sin2_W_MZ):.5f}")
print()

delta_as_inv_SM = float(b3) / (2 * 3.14159) * log_ratio
print(f"SM running for alpha_s: b_3/(2pi)*log(Lambda/M_Z) = {delta_as_inv_SM:.2f}")
print(f"  This is O(1) compared to 1/alpha_s ~ 8.5 => not a small correction")
print()

print("CONCLUSION: SM running corrections are O(1), not O(0.01).")
print("Leading-order predictions (30, 8) are at their natural accuracy.")
print("Small 'correction terms' like 4/111 are not the right approach here.")
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 72)
print("VERIFICATION TESTS")
print("=" * 72)
print()

tests = [
    # Framework identities
    ("N_I = 137",
     N_I == 137),

    ("S_EM = 126",
     S_EM == 126),

    ("Phi_6(n_c) = 111",
     Phi_6 == 111),

    ("S_2 = 29, S_3 = 8, S_Y = 97",
     S_2 == 29 and S_3 == 8 and S_Y == 97),

    ("S_2 + S_Y = S_EM",
     S_2 + S_Y == S_EM),

    # alpha_EM correction reference
    ("1/alpha_EM = 137 + 4/111 within 30 ppm of measured",
     abs(float(R(137 * 111 + 4, 111) - alpha_inv_low)) / float(alpha_inv_low) < 3e-5),

    # sin^2(theta_W) formulas
    ("sin^2(theta_W) = 28/121 within 0.1% of 0.23121",
     abs(float(R(28, 121)) - 0.23121) / 0.23121 < 0.001),

    ("sin^2(theta_W) = 29/126 within 0.5% of 0.23121",
     abs(float(R(29, 126)) - 0.23121) / 0.23121 < 0.005),

    # Phi_6 correction candidates
    ("B_2 = 47 = n_d*n_c + Im_H",
     n_d * n_c + Im_H == 47),

    ("B_3 = 53 = Im_O^2 + n_d",
     Im_O**2 + n_d == 53),

    ("1/alpha_2 = 30 - 47/111 within 500 ppm of measured",
     abs(float(R(30 * 111 - 47, 111) - alpha_2_inv_MZ)) / float(alpha_2_inv_MZ) < 5e-4),

    ("1/alpha_s = 8 + 53/111 within 500 ppm of measured",
     abs(float(R(8 * 111 + 53, 111) - alpha_s_inv_MZ)) / float(alpha_s_inv_MZ) < 5e-4),

    # Numerology check: corrections are LARGE compared to leading term
    ("B_2/A_2 > 1% (correction is NOT small for alpha_2)",
     abs(47.0 / (30 * 111)) * 111 / 30 > 0.01),

    ("B_3/A_3 > 5% (correction is NOT small for alpha_s)",
     abs(53.0 / (8 * 111)) * 111 / 8 > 0.05),

    # 28/121 vs 29/126 are genuinely different
    ("28/121 != 29/126 (different mechanisms)",
     R(28, 121) != R(29, 126)),

    # Measurement uncertainty context
    ("B=-46 (optimal) gives 30-46/111 within measurement uncertainty",
     abs(float(30 + R(-46, Phi_6) - alpha_2_inv_MZ)) < float(delta_alpha_2_inv)),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    print(f"[{status}] {name}")

print()
print(f"{'ALL TESTS PASS' if all_pass else 'SOME TESTS FAILED'}")
print(f"Total: {sum(1 for _, p in tests if p)}/{len(tests)} passed")

# ==============================================================================
# SUMMARY
# ==============================================================================

print()
print("=" * 72)
print("SUMMARY")
print("=" * 72)
print()
print("Q1: Does alpha_s have a Phi_6 correction?")
print(f"  Numerically yes: 1/alpha_s = 8 + 53/111 = {float(pred_as_phi6):.4f}")
print(f"  53 = Im_O^2 + n_d. BUT correction is 6% of leading term.")
print()
print("Q2: Does alpha_2 have a Phi_6 correction?")
print(f"  Numerically yes: 1/alpha_2 = 30 - 47/111 = {float(pred_a2_phi6):.4f}")
print(f"  47 = n_d*n_c + Im_H. BUT correction is 1.4% of leading term,")
print(f"  precision ({err_a2_phi6*1e6:.0f} ppm) ~ measurement uncertainty.")
print()
print("Q3: Correction quality comparison:")
print(f"  alpha_EM: B/A = {ratio_EM:.5f} (tiny), B=n_d (simplest), 27 ppm => HIGH")
print(f"  alpha_2:  B/A = {ratio_a2:.5f} (large), B=3-term expr, {err_a2_phi6*1e6:.0f} ppm => LOW")
print(f"  alpha_s:  B/A = {ratio_as:.5f} (large), B=2-term expr, {err_as_phi6*1e6:.0f} ppm => MEDIUM")
print()
print("Q4: Induced ratios vs Goldstone fractions:")
print("  sin^2(theta_W): 28/121 (0.08%) beats 29/126 (0.45%)")
print("  1/alpha_s: S_3*N_I/S_EM=8.70 (2.6%) vs O=8 (5.6%)")
print()
print("OVERALL: The 4/111 correction for alpha_EM is UNIQUE.")
print("HRS = 5 -- Phi_6 corrections for alpha_2/alpha_s are likely numerology.")
print("Framework real predictions: sin^2(theta_W)=28/121, 1/alpha_s ~ O=8.")
print("Sub-percent precision requires physical mechanism beyond number matching.")
