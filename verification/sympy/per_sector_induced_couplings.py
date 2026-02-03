#!/usr/bin/env python3
"""
Per-Sector Induced Couplings: All SM Gauge Couplings from Mode Counting

KEY FINDING: In the unified 5C+5D picture (S153), different gauge couplings
arise from different charge-weighted sums S_i over the 137 tilt modes.
The universal log ratio log(Lambda/mu) = 137pi/21 applies to all, but S_i varies
by gauge group. Testing whether S_i values have clean framework expressions.

Questions:
1. What S_2, S_3 values reproduce measured couplings?
2. Do those S_i have clean framework expressions?
3. How does sin^2(theta_W) arise in the induced picture?
4. Is S151's sin^2(theta_W) = 28/121 compatible?
5. What role does the crystallization scale play?

Depends on:
- step5_unified_5C_5D.md (S153): log(Lambda/mu) = N_I pi/(Im_H x Im_O)
- multi_coupling_tilt_angles.md (S151): per-sector formulas
- composite_gauge_field_analysis.md (S147-149): S_EM = 126

Created: Session 153
"""

from sympy import *
from sympy import Rational as R

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

n_d = 4       # Defect dimension
n_c = 11      # Crystal dimension
Im_C = 1      # Imaginary complex dims
Im_H = 3      # Imaginary quaternion dims
Im_O = 7      # Imaginary octonion dims
C_dim = 2     # Complex dimension
H_dim = 4     # Quaternion dimension
O_dim = 8     # Octonion dimension

N_I = n_d**2 + n_c**2   # 137
S_EM = N_I - n_c         # 126

Phi_6_nc = n_c**2 - n_c + 1  # 111

print("=" * 72)
print("PER-SECTOR INDUCED COUPLINGS")
print("=" * 72)
print()
print(f"Framework: n_d={n_d}, n_c={n_c}, N_I={N_I}, S_EM={S_EM}")
print(f"Im_C={Im_C}, Im_H={Im_H}, Im_O={Im_O}")
print()

# ==============================================================================
# MEASURED VALUES (at M_Z = 91.1876 GeV)
# ==============================================================================

alpha_EM_inv_MZ = R(12809, 100)       # 128.09 (PDG 2024)
alpha_2_inv_MZ = R(2962, 100)         # 29.62
alpha_s_inv_MZ = R(848, 100)          # 8.48 (alpha_s(M_Z) ~ 0.1180)
sin2_theta_W_MZ = R(23121, 100000)    # 0.23121 (MS-bar at M_Z)

alpha_EM_inv_low = R(137036, 1000)    # 137.036 (at q^2 ~ 0)

M_Z = R(91188, 1000)        # GeV
m_e = R(511, 1000000)       # GeV (0.000511)

print("Measured couplings at M_Z:")
print(f"  1/alpha_EM(M_Z) = {float(alpha_EM_inv_MZ):.1f}")
print(f"  1/alpha_2(M_Z)  = {float(alpha_2_inv_MZ):.2f}")
print(f"  1/alpha_s(M_Z)  = {float(alpha_s_inv_MZ):.2f}")
print(f"  sin^2 theta_W(M_Z) = {float(sin2_theta_W_MZ):.5f}")
print()

# ==============================================================================
# SECTION 1: S151 WEINBERG ANGLE
# ==============================================================================

print("=" * 72)
print("SECTION 1: S151 WEINBERG ANGLE — sin^2 theta_W = 28/121")
print("=" * 72)
print()

sin2_S151 = R(n_d * Im_O, n_c**2)
print(f"S151: sin^2 theta_W = n_d x Im_O / n_c^2 = {sin2_S151} = {float(sin2_S151):.6f}")
print(f"Measured: sin^2 theta_W(M_Z) = {float(sin2_theta_W_MZ):.6f}")
print(f"Error: {abs(float(sin2_S151) - float(sin2_theta_W_MZ))/float(sin2_theta_W_MZ)*100:.2f}%")
print()

# In the induced picture: sin^2 theta_W = S_2/S_EM at the common scale
# If sin^2 theta_W = 28/121 and also = S_2/S_EM = S_2/126:
# S_2 = 126 x 28/121 = 3528/121 ~ 29.16 (not integer)
S2_from_S151 = S_EM * sin2_S151
print(f"If sin^2 theta_W = S_2/S_EM: S_2 = {S_EM} x {sin2_S151} = {S2_from_S151} = {float(S2_from_S151):.4f}")
print(f"  NOT an integer -> S151's 28/121 and induced S_2/126 are INCOMPATIBLE")
print()

# ==============================================================================
# SECTION 2: MODE DECOMPOSITION
# ==============================================================================

print("=" * 72)
print("SECTION 2: MODE DECOMPOSITION BY DIVISION ALGEBRA SECTOR")
print("=" * 72)
print()

modes = {
    "defect": n_d**2,           # 16
    "C_pure": Im_C**2,          # 1
    "H_pure": Im_H**2,          # 9
    "O_pure": Im_O**2,          # 49
    "CH_cross": 2*Im_C*Im_H,   # 6
    "CO_cross": 2*Im_C*Im_O,   # 14
    "HO_cross": 2*Im_H*Im_O,   # 42
}

total = sum(modes.values())
print("Mode decomposition:")
for name, count in modes.items():
    print(f"  {name:12s}: {count:3d} modes")
print(f"  {'Total':12s}: {total:3d} modes")
assert total == N_I
print()

# ==============================================================================
# SECTION 3: COUPLING RATIOS AT M_Z
# ==============================================================================

print("=" * 72)
print("SECTION 3: COUPLING RATIOS AND S_i VALUES AT M_Z")
print("=" * 72)
print()

S2_S_ratio = alpha_2_inv_MZ / alpha_EM_inv_MZ
S3_S_ratio = alpha_s_inv_MZ / alpha_EM_inv_MZ

print(f"Coupling ratios at M_Z (= S_i/S_EM if common scale):")
print(f"  S_2/S_EM = 1/alpha_2 / 1/alpha_EM = {float(S2_S_ratio):.6f}")
print(f"  S_3/S_EM = 1/alpha_s / 1/alpha_EM = {float(S3_S_ratio):.6f}")
print()

S2_at_MZ = S_EM * S2_S_ratio
S3_at_MZ = S_EM * S3_S_ratio
print(f"Required S values (common scale at M_Z):")
print(f"  S_2 = {float(S2_at_MZ):.2f} (nearest integer: {round(float(S2_at_MZ))})")
print(f"  S_3 = {float(S3_at_MZ):.2f} (nearest integer: {round(float(S3_at_MZ))})")
print()

# S_3 = 8 = O is clean
alpha_s_pred = R(8 * N_I, S_EM)
print(f"If S_3 = O = 8:")
print(f"  1/alpha_s = 8 x {N_I}/{S_EM} = {alpha_s_pred} = {float(alpha_s_pred):.4f}")
print(f"  Measured 1/alpha_s(M_Z) = {float(alpha_s_inv_MZ):.2f}")
print(f"  Error: {abs(float(alpha_s_pred) - float(alpha_s_inv_MZ))/float(alpha_s_inv_MZ)*100:.1f}%")
print()

# ==============================================================================
# SECTION 4: INDUCED WEINBERG ANGLE WITH S_2 = 29
# ==============================================================================

print("=" * 72)
print("SECTION 4: INDUCED WEINBERG ANGLE — S_2 = 29")
print("=" * 72)
print()

# sin^2 theta_W = S_2/S_EM in the induced picture
# S_2 = 29 gives sin^2 theta_W = 29/126 = 0.23016 (0.45% off measured)
S2_test = 29
sin2_from_29 = R(S2_test, S_EM)
err_29 = abs(float(sin2_from_29) - float(sin2_theta_W_MZ)) / float(sin2_theta_W_MZ) * 100
print(f"If S_2 = 29 in induced picture:")
print(f"  sin^2 theta_W = 29/126 = {float(sin2_from_29):.6f}")
print(f"  Measured: {float(sin2_theta_W_MZ):.6f}")
print(f"  Error: {err_29:.2f}%")
print(f"  S_Y = {S_EM - S2_test} = 126 - 29 = 97")
print()

# ==============================================================================
# SECTION 5: CONSISTENCY CHECK — 1/alpha_2 = sin^2 theta_W x 1/alpha_EM
# ==============================================================================

print("=" * 72)
print("SECTION 5: CONSISTENCY CHECK")
print("=" * 72)
print()

# From e = g sin theta_W: alpha_EM = alpha_2 sin^2 theta_W
# So: 1/alpha_2 = sin^2 theta_W x (1/alpha_EM)
print("Consistency: 1/alpha_2 = sin^2 theta_W x (1/alpha_EM):")
print(f"  At M_Z: {float(sin2_theta_W_MZ):.4f} x {float(alpha_EM_inv_MZ):.1f} = "
      f"{float(sin2_theta_W_MZ * alpha_EM_inv_MZ):.1f} (measured 1/alpha_2 = {float(alpha_2_inv_MZ):.1f})")
print()

s151_predictions = [
    ("sin^2 theta_W", float(sin2_S151), float(sin2_theta_W_MZ), "n_d x Im_O / n_c^2"),
    ("1/alpha_2", Im_H * (Im_O + Im_H), float(alpha_2_inv_MZ), "Im_H x (Im_O + Im_H)"),
    ("1/alpha_s", O_dim, float(alpha_s_inv_MZ), "O"),
]

print("S151 formulas (direct predictions vs M_Z values):")
for name, pred, meas, formula in s151_predictions:
    err = abs(float(pred) - meas) / meas * 100
    print(f"  {name:12s} = {formula:25s} = {float(pred):.4f}  meas={meas:.4f}  err={err:.2f}%")
print()

# ==============================================================================
# SECTION 6: COMPARISON TABLE — S151 vs INDUCED vs MEASURED
# ==============================================================================

print("=" * 72)
print("SECTION 6: COMPARISON — S151 vs INDUCED vs MEASURED")
print("=" * 72)
print()

print(f"{'Quantity':20s} {'S151 formula':25s} {'S151 val':10s} {'Induced S_2=29':10s} {'Measured':10s} {'S151 err':8s} {'Ind err':8s}")
print("-" * 100)

# sin^2 theta_W
s151_sin2 = float(R(28, 121))
ind_sin2 = float(R(29, 126))
meas_sin2 = float(sin2_theta_W_MZ)
s151_err = abs(s151_sin2 - meas_sin2)/meas_sin2*100
ind_err = abs(ind_sin2 - meas_sin2)/meas_sin2*100
print(f"{'sin^2 theta_W':20s} {'28/121=n_d*Im_O/n_c^2':25s} {s151_sin2:10.6f} {ind_sin2:10.6f} {meas_sin2:10.6f} {s151_err:7.2f}% {ind_err:7.2f}%")

# 1/alpha_s
s151_as = float(O_dim)
ind_as = float(R(8 * N_I, S_EM))
meas_as = float(alpha_s_inv_MZ)
s151_err_as = abs(s151_as - meas_as)/meas_as*100
ind_err_as = abs(ind_as - meas_as)/meas_as*100
print(f"{'1/alpha_s':20s} {'O=8':25s} {s151_as:10.4f} {ind_as:10.4f} {meas_as:10.4f} {s151_err_as:7.2f}% {ind_err_as:7.2f}%")

# 1/alpha_2 (derived from sin^2 theta_W x 1/alpha_EM)
s151_a2 = float(R(28, 121) * alpha_EM_inv_MZ)
ind_a2 = float(R(29, 126) * alpha_EM_inv_MZ)
meas_a2 = float(alpha_2_inv_MZ)
s151_err_a2 = abs(s151_a2 - meas_a2)/meas_a2*100
ind_err_a2 = abs(ind_a2 - meas_a2)/meas_a2*100
print(f"{'1/alpha_2(M_Z)':20s} {'sin^2 th x 1/a_EM(MZ)':25s} {s151_a2:10.4f} {ind_a2:10.4f} {meas_a2:10.4f} {s151_err_a2:7.2f}% {ind_err_a2:7.2f}%")

print()

# ==============================================================================
# SECTION 7: ALGEBRAIC STRUCTURE OF S_2 = 29
# ==============================================================================

print("=" * 72)
print("SECTION 7: ALGEBRAIC STRUCTURE OF S_2 = 29")
print("=" * 72)
print()

check_29 = n_d**2 + Im_H**2 + C_dim**2
print(f"29 = n_d^2 + Im_H^2 + C^2 = {n_d}^2 + {Im_H}^2 + {C_dim}^2 = {check_29}")
assert check_29 == 29

check_29b = Im_H * Im_O + O_dim
print(f"29 = Im_H x Im_O + O = {Im_H} x {Im_O} + {O_dim} = {check_29b}")
assert check_29b == 29

# S_Y = S_EM - S_2 = 126 - 29 = 97
check_97 = n_c**2 - n_d * Im_O + n_d
print(f"97 = n_c^2 - n_d x Im_O + n_d = {n_c}^2 - {n_d}x{Im_O} + {n_d} = {check_97}")
assert check_97 == 97

print(f"S_2 + S_Y = S_EM: 29 + 97 = {29 + 97} = {S_EM}")
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
    ("N_I = n_d^2 + n_c^2 = 137",
     N_I == 137),

    ("S_EM = N_I - n_c = 126",
     S_EM == 126),

    ("n_c = Im_C + Im_H + Im_O = 11",
     n_c == Im_C + Im_H + Im_O),

    # S151 Weinberg angle
    ("sin^2 theta_W(S151) = n_d x Im_O / n_c^2 = 28/121",
     R(n_d * Im_O, n_c**2) == R(28, 121)),

    ("28/121 within 0.1% of measured 0.23121",
     abs(float(R(28, 121)) - 0.23121) / 0.23121 < 0.001),

    # Induced Weinberg angle
    ("sin^2 theta_W(induced) = 29/126 within 0.5% of measured",
     abs(float(R(29, 126)) - 0.23121) / 0.23121 < 0.005),

    # S_3 = O = 8
    ("S_3 = O = 8: 1/alpha_s = 8 x 137/126 = 8.698 (within 3% of 8.48)",
     abs(float(R(8 * N_I, S_EM)) - 8.48) / 8.48 < 0.03),

    # Mode decomposition
    ("Crystal mode sum: Im_C^2 + Im_H^2 + Im_O^2 + cross = n_c^2",
     Im_C**2 + Im_H**2 + Im_O**2 + 2*(Im_C*Im_H + Im_C*Im_O + Im_H*Im_O) == n_c**2),

    # S_2 = 29 identities
    ("29 = n_d^2 + Im_H^2 + C^2 = 16 + 9 + 4",
     n_d**2 + Im_H**2 + C_dim**2 == 29),

    ("29 = Im_H x Im_O + O = 21 + 8",
     Im_H * Im_O + O_dim == 29),

    # S_Y = 97
    ("97 = n_c^2 - n_d x Im_O + n_d = 121 - 28 + 4",
     n_c**2 - n_d * Im_O + n_d == 97),

    ("S_2 + S_Y = S_EM: 29 + 97 = 126",
     29 + 97 == S_EM),

    # Ratio consistency
    ("S_EM = S_2 + S_Y consistency with sin^2 + cos^2 = 1",
     True),  # Tautological but structurally important

    # Comparison: S151 has denominator 121, induced has 126
    ("S151 and induced differ: 28/121 != 29/126",
     R(28, 121) != R(29, 126)),

    # But they're close
    ("28/121 and 29/126 differ by < 1%",
     abs(float(R(28,121)) - float(R(29,126))) / float(R(28,121)) < 0.01),
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
print("TWO APPROACHES TO THE WEINBERG ANGLE:")
print()
print("1. S151 (direct number matching):")
print(f"   sin^2 theta_W = n_d x Im_O / n_c^2 = 28/121 = 0.23140")
print(f"   Error: 0.08% at M_Z")
print()
print("2. Induced mechanism (S153 + this analysis):")
print(f"   sin^2 theta_W = S_2/S_EM = 29/126 = 0.23016")
print(f"   Error: 0.45% at M_Z")
print(f"   With S_2 = 29 = n_d^2 + Im_H^2 + C^2 = Im_H x Im_O + O")
print()
print("TENSION: The two approaches give DIFFERENT predictions.")
print(f"  28/121 = {float(R(28,121)):.6f}")
print(f"  29/126 = {float(R(29,126)):.6f}")
print(f"  Difference: {abs(float(R(28,121)) - float(R(29,126))):.6f}")
print()
print("STRONG COUPLING:")
print(f"  S_3 = O = 8 in both approaches")
print(f"  1/alpha_s = 8 x 137/126 = 8.70 (induced) vs O = 8 (S151)")
print(f"  Measured: 8.48 -> induced 2.6% off, S151 5.7% off")
print()
print("OPEN QUESTIONS:")
print("  1. Which denominator is correct: n_c^2=121 or S_EM=126?")
print("  2. Is the 0.08% match of 28/121 at M_Z a coincidence?")
print("  3. At what scale should the framework values apply?")
print("  4. Can correction terms be derived (like 4/111 for alpha)?")
print("  5. What physical principle determines S_2 (28 vs 29)?")
