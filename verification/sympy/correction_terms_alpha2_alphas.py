#!/usr/bin/env python3
"""
Correction Terms for α₂ and α_s: Systematic Search

KEY FINDING: Testing whether framework expressions analogous to the 4/111
correction for α_EM exist for the weak and strong couplings.

Context:
- 1/α_EM = N_I + n_d/Φ₆(n_c) = 137 + 4/111 (27 ppm)
- Leading-order 1/α₂ ≈ 30, 1/α_s ≈ 8 at M_Z
- Task: find corrections that reduce these 1-6% residuals

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
Phi_6 = n_c**2 - n_c + 1  # 111 = Φ₆(n_c)

S_2 = 29   # From S157: SU(2) charge-weighted sum
S_3 = 8    # = O: SU(3) charge-weighted sum
S_Y = S_EM - S_2  # 97: U(1)_Y sum

print("=" * 72)
print("CORRECTION TERMS FOR α₂ AND α_s")
print("=" * 72)
print()
print(f"Framework: n_d={n_d}, n_c={n_c}, N_I={N_I}, S_EM={S_EM}, Φ₆={Phi_6}")
print(f"S_2={S_2}, S_3={S_3}, S_Y={S_Y}")
print()

# ==============================================================================
# SECTION 1: MEASURED VALUES (PDG 2024)
# ==============================================================================

print("=" * 72)
print("SECTION 1: MEASURED VALUES")
print("=" * 72)
print()

# Low-energy EM coupling (CODATA 2022)
alpha_inv_low = R(137035999177, 10**9)  # 137.035999177

# At M_Z (MS-bar scheme, PDG 2024)
alpha_inv_MZ = R(127952, 1000)          # 127.952 ± 0.009
sin2_W_MZ = R(23121, 100000)            # 0.23121 ± 0.00004
alpha_s_MZ = R(1180, 10000)             # 0.1180 ± 0.0009
alpha_s_inv_MZ = 1 / alpha_s_MZ         # 8.4746

# Derived: 1/α₂(M_Z) = sin²θ_W × 1/α_EM(M_Z)
alpha_2_inv_MZ = sin2_W_MZ * alpha_inv_MZ

print(f"α_EM⁻¹(q²→0) = {float(alpha_inv_low):.9f}")
print(f"α_EM⁻¹(M_Z)  = {float(alpha_inv_MZ):.3f}")
print(f"sin²θ_W(M_Z) = {float(sin2_W_MZ):.5f}")
print(f"α₂⁻¹(M_Z)    = sin²θ_W × α_EM⁻¹ = {float(alpha_2_inv_MZ):.4f}")
print(f"α_s⁻¹(M_Z)   = {float(alpha_s_inv_MZ):.4f}")
print()

# Uncertainties (for context)
delta_alpha_2_inv = R(4, 100000) * alpha_inv_MZ  # from δ(sin²θ) = 0.00004
delta_alpha_s_inv = R(9, 10000) / alpha_s_MZ**2  # from δ(α_s) = 0.0009
print(f"Uncertainties: δ(1/α₂) ≈ {float(delta_alpha_2_inv):.3f}, δ(1/α_s) ≈ {float(delta_alpha_s_inv):.3f}")
print()

# ==============================================================================
# SECTION 2: LEADING-ORDER FORMULAS AND RESIDUALS
# ==============================================================================

print("=" * 72)
print("SECTION 2: LEADING-ORDER FORMULAS AND RESIDUALS")
print("=" * 72)
print()

# For α_EM (reference — the known correction)
lead_EM = N_I  # 137
corr_EM = R(n_d, Phi_6)  # 4/111
pred_EM = lead_EM + corr_EM
err_EM_ppm = abs(float(pred_EM - alpha_inv_low) / float(alpha_inv_low)) * 1e6
print(f"α_EM: lead={lead_EM}, correction=+{corr_EM}={float(corr_EM):.6f}")
print(f"  Predicted: {float(pred_EM):.9f}")
print(f"  Measured:  {float(alpha_inv_low):.9f}")
print(f"  Error:     {err_EM_ppm:.1f} ppm")
print()

# Leading-order candidates for 1/α₂
leads_alpha2 = {
    "Im_H(Im_H+Im_O) = 30": Im_H * (Im_H + Im_O),
    "S_2 × N_I/S_EM = 31.53": R(S_2 * N_I, S_EM),
    "S_2 = 29": S_2,
    "Im_H × n_c = 33": Im_H * n_c,
}

print("1/α₂ leading-order candidates:")
for name, val in leads_alpha2.items():
    resid = float(alpha_2_inv_MZ) - float(val)
    err = resid / float(alpha_2_inv_MZ) * 100
    print(f"  {name:35s} resid={resid:+.4f} ({err:+.2f}%)")
print()

# Leading-order candidates for 1/α_s
leads_alphas = {
    "O = 8": O_dim,
    "S_3 × N_I/S_EM = 8.698": R(S_3 * N_I, S_EM),
    "Im_O = 7": Im_O,
    "Im_H² = 9": Im_H**2,
}

print("1/α_s leading-order candidates:")
for name, val in leads_alphas.items():
    resid = float(alpha_s_inv_MZ) - float(val)
    err = resid / float(alpha_s_inv_MZ) * 100
    print(f"  {name:35s} resid={resid:+.4f} ({err:+.2f}%)")
print()

# ==============================================================================
# SECTION 3: Φ₆ CORRECTION PATTERN — B_i / 111
# ==============================================================================

print("=" * 72)
print("SECTION 3: Φ₆ CORRECTION PATTERN — B_i / 111")
print("=" * 72)
print()

# For α_EM: B_EM = n_d = 4, giving 137 + 4/111
# Question: does 1/α_i = A_i + B_i/111 work for other couplings?

print("Testing: 1/α_i = A_i + B_i/Φ₆(n_c) for integer B_i")
print()

# For each leading-order A_i, find optimal B_i
for coupling, A_i, measured in [
    ("α₂", 30, alpha_2_inv_MZ),
    ("α₂", 29, alpha_2_inv_MZ),
    ("α_s", 8, alpha_s_inv_MZ),
    ("α_s", 9, alpha_s_inv_MZ),
]:
    resid = float(measured) - A_i
    B_ideal = resid * Phi_6
    B_int = round(B_ideal)
    pred = A_i + R(B_int, Phi_6)
    err_pct = abs(float(pred - measured) / float(measured)) * 100
    err_ppm = err_pct * 1e4

    print(f"  1/{coupling} = {A_i} + B/{Phi_6}:")
    print(f"    B_ideal = {B_ideal:.2f} → B = {B_int}")
    print(f"    Predicted: {float(pred):.6f}")
    print(f"    Measured:  {float(measured):.6f}")
    print(f"    Error: {err_ppm:.0f} ppm ({err_pct:.3f}%)")

    # Check if B_int has framework expression
    b = abs(B_int)
    sign = "+" if B_int > 0 else "-"
    expressions = []
    # Try simple framework expressions for |B|
    fw = {
        "n_d": n_d, "n_c": n_c, "Im_C": Im_C, "Im_H": Im_H, "Im_O": Im_O,
        "C": C_dim, "H": H_dim, "O": O_dim, "N_I": N_I, "S_EM": S_EM,
        "S_2": S_2, "S_3": S_3, "S_Y": S_Y,
    }
    # Single values
    for name, val in fw.items():
        if val == b:
            expressions.append(name)
    # Products of two
    fw_items = list(fw.items())
    for i, (n1, v1) in enumerate(fw_items):
        for n2, v2 in fw_items[i:]:
            if v1 * v2 == b:
                expressions.append(f"{n1}×{n2}")
    # Sums/differences of two
    for i, (n1, v1) in enumerate(fw_items):
        for n2, v2 in fw_items:
            if n1 != n2:
                if v1 + v2 == b:
                    expressions.append(f"{n1}+{n2}")
                if v1 - v2 == b and v1 > v2:
                    expressions.append(f"{n1}-{n2}")
    # Squares
    for n1, v1 in fw_items:
        if v1**2 == b:
            expressions.append(f"{n1}²")
    # Square + single
    for n1, v1 in fw_items:
        for n2, v2 in fw_items:
            if v1**2 + v2 == b:
                expressions.append(f"{n1}²+{n2}")
            if v1**2 - v2 == b:
                expressions.append(f"{n1}²-{n2}")

    if expressions:
        print(f"    |B| = {b} = {', '.join(expressions[:5])}")
    else:
        print(f"    |B| = {b} — no simple framework expression found")
    print()

# ==============================================================================
# SECTION 4: SYSTEMATIC FRAMEWORK RATIONAL SEARCH
# ==============================================================================

print("=" * 72)
print("SECTION 4: SYSTEMATIC CORRECTION SEARCH")
print("=" * 72)
print()

# Generate all "simple" framework rationals p/q where p, q are
# products/sums of framework quantities with complexity ≤ 2

# Framework building blocks
atoms = {
    "1": 1, "C": C_dim, "Im_H": Im_H, "n_d": n_d,
    "Im_O": Im_O, "O": O_dim, "n_c": n_c, "N_I": N_I,
}

# Build numerator/denominator candidates up to complexity 2
candidates_num = dict(atoms)
candidates_den = dict(atoms)

# Add products of two atoms
for n1, v1 in atoms.items():
    for n2, v2 in atoms.items():
        if v1 <= v2:
            key = f"{n1}·{n2}" if n1 != n2 else f"{n1}²"
            candidates_num[key] = v1 * v2
            candidates_den[key] = v1 * v2

# Add a few key composite denominators
candidates_den["Φ₆"] = Phi_6
candidates_den["S_EM"] = S_EM
candidates_den["n_c²"] = n_c**2
candidates_den["N_I²"] = N_I**2

# For each coupling, search for correction = ±p/q matching the residual
for coupling, lead, measured, label in [
    ("1/α₂", 30, alpha_2_inv_MZ, "A₂=30"),
    ("1/α₂", 29, alpha_2_inv_MZ, "A₂=29"),
    ("1/α_s", 8, alpha_s_inv_MZ, "A₃=8"),
]:
    target_resid = float(measured) - lead

    print(f"--- {coupling} with {label}, residual = {target_resid:+.4f} ---")
    print()

    results = []
    for n_name, n_val in candidates_num.items():
        for d_name, d_val in candidates_den.items():
            if d_val == 0:
                continue
            for sign in [+1, -1]:
                correction = sign * R(n_val, d_val)
                pred = lead + correction
                err = abs(float(pred) - float(measured)) / float(measured)
                sign_str = "+" if sign > 0 else "-"
                expr = f"{sign_str}{n_name}/{d_name}"
                # Complexity score: count distinct atoms used
                complexity = len(set(n_name.split("·")) | set(d_name.split("·"))) if "·" in n_name or "·" in d_name else 2
                results.append((err, expr, float(pred), float(correction), complexity))

    # Sort by error and show top 10
    results.sort()
    seen = set()
    count = 0
    for err, expr, pred_val, corr_val, complexity in results:
        if count >= 12:
            break
        # Skip duplicates (same numerical value)
        key = f"{pred_val:.8f}"
        if key in seen:
            continue
        seen.add(key)
        count += 1
        err_ppm = err * 1e6
        err_pct = err * 100
        marker = "***" if err_pct < 0.01 else "**" if err_pct < 0.1 else "*" if err_pct < 0.5 else ""
        print(f"  {expr:25s} → {lead}{corr_val:+.6f} = {pred_val:.6f}  "
              f"err={err_ppm:8.0f} ppm ({err_pct:.3f}%) {marker}")
    print()

# ==============================================================================
# SECTION 5: THE Φ₆ PATTERN IN DETAIL
# ==============================================================================

print("=" * 72)
print("SECTION 5: TESTING THE UNIVERSAL Φ₆ CORRECTION HYPOTHESIS")
print("=" * 72)
print()

# Hypothesis: 1/α_i = A_i + B_i/Φ₆(n_c) for all gauge couplings
# Known: B_EM = n_d = 4 for α_EM (leading A_EM = N_I = 137)
# Testing: what B_2, B_3 values work?

# Best candidates from Section 3:
# α₂ with A=30: B₂ ≈ -47 (need -47 = ?)
# α_s with A=8: B₃ ≈ +53 (53 is framework prime!)

# For α₂, A=30, B=-47:
B2_candidate = -47
pred_a2_phi6 = 30 + R(B2_candidate, Phi_6)
err_a2_phi6 = abs(float(pred_a2_phi6 - alpha_2_inv_MZ)) / float(alpha_2_inv_MZ)

# Framework expressions for 47:
print(f"B₂ = -47:")
print(f"  47 is prime")
print(f"  47 mod 4 = {47 % 4} (≡ 3 mod 4 → NOT sum of two squares → NOT framework prime)")
print(f"  47 = n_d × n_c + Im_H = {n_d*n_c}+{Im_H} = {n_d*n_c+Im_H}")
print(f"  47 = n_c² - n_c × Im_O + Im_H = 121-77+3 = {n_c**2 - n_c*Im_O + Im_H}")
print(f"  47 = O × Im_O - O - Im_C = 56-8-1 = {O_dim*Im_O - O_dim - Im_C}")
assert n_d * n_c + Im_H == 47
print(f"  Best: 47 = n_d·n_c + Im_H")
print(f"  1/α₂ = 30 - (n_d·n_c + Im_H)/Φ₆ = 30 - 47/111")
print(f"  = {float(pred_a2_phi6):.6f} vs measured {float(alpha_2_inv_MZ):.6f}")
print(f"  Error: {err_a2_phi6*1e6:.0f} ppm ({err_a2_phi6*100:.3f}%)")
print()

# For α_s, A=8, B=+53:
B3_candidate = 53
pred_as_phi6 = 8 + R(B3_candidate, Phi_6)
err_as_phi6 = abs(float(pred_as_phi6 - alpha_s_inv_MZ)) / float(alpha_s_inv_MZ)

print(f"B₃ = +53:")
print(f"  53 IS a framework prime (53 = 4 + 49 = n_d + Im_O²)")
print(f"  53 = Im_O² + n_d = {Im_O**2}+{n_d} = {Im_O**2+n_d}")
assert Im_O**2 + n_d == 53
print(f"  1/α_s = O + (Im_O² + n_d)/Φ₆ = 8 + 53/111")
print(f"  = {float(pred_as_phi6):.6f} vs measured {float(alpha_s_inv_MZ):.6f}")
print(f"  Error: {err_as_phi6*1e6:.0f} ppm ({err_as_phi6*100:.3f}%)")
print()

# Summary of Φ₆ pattern
print("--- Φ₆ Correction Pattern Summary ---")
print()
print(f"  α_EM: 1/α = {N_I} + {n_d}/{Phi_6}   B_EM = n_d = {n_d}")
print(f"                                            err = {err_EM_ppm:.1f} ppm")
print(f"  α₂:   1/α = 30 - 47/{Phi_6}           B₂ = -(n_d·n_c + Im_H) = -47")
print(f"                                            err = {err_a2_phi6*1e6:.0f} ppm")
print(f"  α_s:  1/α = 8 + 53/{Phi_6}             B₃ = Im_O² + n_d = 53")
print(f"                                            err = {err_as_phi6*1e6:.0f} ppm")
print()

# ==============================================================================
# SECTION 6: IS B_i/Φ₆ A COINCIDENCE? NUMEROLOGY CHECK
# ==============================================================================

print("=" * 72)
print("SECTION 6: NUMEROLOGY RISK ASSESSMENT")
print("=" * 72)
print()

# The Φ₆ correction for α_EM is special because:
# 1. The leading term N_I = 137 is EXACT (from Born rule / mode count)
# 2. The residual is tiny (0.026%)
# 3. n_d/Φ₆ is the simplest possible framework rational correction
# 4. The precision is sub-ppm (27 ppm)

# For α₂ and α_s, the situation is different:
# 1. The leading terms (30, 8) are NOT exact — they're 1-6% approximations
# 2. The "corrections" B/111 are LARGE compared to the leading term
# 3. B₂ = -47 has no single-quantity framework expression
# 4. The precision is ~300-400 ppm — comparable to measurement uncertainty

print("COMPARISON OF CORRECTION QUALITY:")
print()
print(f"{'Coupling':10s} {'|B/A|':10s} {'B framework?':25s} {'Precision':12s} {'Quality':8s}")
print("-" * 70)

# α_EM
ratio_EM = abs(float(R(4, 111))) / 137
print(f"{'α_EM':10s} {ratio_EM:.5f}    {'n_d (clean)':25s} {'27 ppm':12s} {'HIGH':8s}")

# α₂
ratio_a2 = abs(float(R(47, 111))) / 30
print(f"{'α₂':10s} {ratio_a2:.5f}    {'n_d·n_c + Im_H (3 terms)':25s} {f'{err_a2_phi6*1e6:.0f} ppm':12s} {'LOW':8s}")

# α_s
ratio_as = abs(float(R(53, 111))) / 8
print(f"{'α_s':10s} {ratio_as:.5f}    {'Im_O² + n_d (2 terms)':25s} {f'{err_as_phi6*1e6:.0f} ppm':12s} {'MEDIUM':8s}")

print()
print("ISSUES:")
print("  1. B₂ = 47 is NOT a framework prime (47 ≡ 3 mod 4)")
print("  2. B₂/A₂ = 1.4% — this is a LARGE correction, not a refinement")
print("  3. B₃/A₃ = 6.0% — even larger correction")
print("  4. With Φ₆ = 111 as denominator, ANY residual ∈ [0, 0.5] can be")
print("     matched to ±0.5/111 ≈ 0.005 — about 50-500 ppm for these couplings")
print("  5. Framework has ~15 basic quantities → ~100+ expressions for B")
print("     The probability of matching by chance is NOT negligible")
print()

# Estimate: for A=30, any B in {-55,...,55} gives pred within 0.5 of measured.
# That's ~110 integers. How many have "framework expressions"?
# With ~15 atoms and products/sums of two: ~150 distinct values under 60.
# So we'd ALWAYS find a match. This is NOT constraining.
print("CONCLUSION: B_i/Φ₆ corrections for α₂ and α_s are NOT analogous to")
print("the α_EM correction. The α_EM correction is special because:")
print("  - Leading term is exact (137 from mode counting)")
print("  - Correction is tiny (0.026%)")
print("  - B_EM = n_d is the simplest possible numerator")
print("  - Result is sub-ppm")
print()
print("For α₂ and α_s, the 'corrections' are really just fitting to the")
print("leading-order error. The framework does NOT predict these corrections")
print("with the same confidence as 4/111.")
print()

# ==============================================================================
# SECTION 7: ALTERNATIVE — INDUCED RATIO APPROACH
# ==============================================================================

print("=" * 72)
print("SECTION 7: INDUCED RATIO APPROACH")
print("=" * 72)
print()

# In the induced picture, at ANY common scale μ:
#   sin²θ_W = S_2/S_EM = 29/126 (scale-independent if same tilt modes)
#   1/α_s / 1/α_EM = S_3/S_EM = 8/126 = 4/63
#
# These are RATIO predictions, not absolute coupling predictions.
# They should hold at the scale where the tilt modes dominate.
#
# At M_Z, the measured ratios are:
sin2_measured = sin2_W_MZ  # = α_EM/α₂
ratio_s_measured = alpha_s_inv_MZ / alpha_inv_MZ  # = (1/α_s)/(1/α_EM) at M_Z

sin2_induced = R(S_2, S_EM)   # 29/126
ratio_s_induced = R(S_3, S_EM)  # 8/126

err_sin2 = abs(float(sin2_induced - sin2_measured)) / float(sin2_measured)
err_ratio_s = abs(float(ratio_s_induced - ratio_s_measured)) / float(ratio_s_measured)

print(f"sin²θ_W = S_2/S_EM = {S_2}/{S_EM} = {float(sin2_induced):.6f}")
print(f"  Measured at M_Z: {float(sin2_measured):.6f}")
print(f"  Error: {err_sin2*100:.3f}%")
print()

print(f"(1/α_s)/(1/α_EM) = S_3/S_EM = {S_3}/{S_EM} = {float(ratio_s_induced):.6f}")
print(f"  Measured at M_Z: {float(ratio_s_measured):.6f}")
print(f"  Error: {err_ratio_s*100:.2f}%")
print()

# The induced ratios have residuals. Can we correct THOSE?
# Residual for sin²θ_W:
resid_sin2 = float(sin2_measured - sin2_induced)
print(f"sin²θ_W residual: {resid_sin2:+.6f}")

# For this to have a framework correction: 29/126 + δ = 0.23121
# δ = 0.00105
# δ = C/S_EM ? → 2/126 = 0.01587 (too large)
# δ = 1/N_I ? → 1/137 = 0.00730 (too large)
# δ = 1/(n_c × S_EM) ? → 1/1386 = 0.000721 (close-ish)
# δ = Im_C/(n_c × n_c² - 1) ? → tricky

print("Searching for framework expressions matching sin²θ_W residual...")
print()

best_sin2 = []
for n_name, n_val in candidates_num.items():
    for d_name, d_val in candidates_den.items():
        if d_val == 0:
            continue
        for sign in [+1, -1]:
            delta = sign * R(n_val, d_val)
            pred_sin2 = sin2_induced + delta
            err = abs(float(pred_sin2) - float(sin2_measured)) / float(sin2_measured)
            if err < 0.001:  # Within 0.1%
                s = "+" if sign > 0 else "-"
                best_sin2.append((err, f"29/126 {s} {n_name}/{d_name}", float(pred_sin2), float(delta)))

best_sin2.sort()
seen_vals = set()
print(f"{'Expression':40s} {'Value':12s} {'Error':12s}")
for err, expr, val, delta in best_sin2[:10]:
    key = f"{val:.8f}"
    if key in seen_vals:
        continue
    seen_vals.add(key)
    print(f"  {expr:38s} {val:.7f}  {err*1e6:8.0f} ppm")
print()

# ==============================================================================
# SECTION 8: THE HONEST COMPARISON — S151 vs INDUCED
# ==============================================================================

print("=" * 72)
print("SECTION 8: HONEST COMPARISON TABLE")
print("=" * 72)
print()

# S151 approach: direct framework numbers compared to M_Z
# Induced approach: S_i/S_EM ratios

sin2_S151 = R(n_d * Im_O, n_c**2)  # 28/121

# All at M_Z:
print(f"{'Quantity':20s} {'S151':15s} {'Induced':15s} {'Measured(M_Z)':15s} {'S151 err':10s} {'Ind err':10s}")
print("-" * 85)

# sin²θ_W
e1 = abs(float(sin2_S151 - sin2_W_MZ)) / float(sin2_W_MZ) * 100
e2 = abs(float(sin2_induced - sin2_W_MZ)) / float(sin2_W_MZ) * 100
print(f"{'sin²θ_W':20s} {'28/121':15s} {'29/126':15s} {float(sin2_W_MZ):15.5f} {e1:9.3f}% {e2:9.3f}%")

# 1/α₂ (derived from sin²θ_W × 1/α_EM at M_Z)
a2_S151 = sin2_S151 * alpha_inv_MZ
a2_ind = sin2_induced * alpha_inv_MZ
e1 = abs(float(a2_S151 - alpha_2_inv_MZ)) / float(alpha_2_inv_MZ) * 100
e2 = abs(float(a2_ind - alpha_2_inv_MZ)) / float(alpha_2_inv_MZ) * 100
print(f"{'1/α₂':20s} {float(a2_S151):15.4f} {float(a2_ind):15.4f} {float(alpha_2_inv_MZ):15.4f} {e1:9.3f}% {e2:9.3f}%")

# 1/α_s
as_S151 = O_dim  # Direct: O = 8
as_ind = R(S_3 * N_I, S_EM)  # 8 × 137/126
e1 = abs(float(as_S151) - float(alpha_s_inv_MZ)) / float(alpha_s_inv_MZ) * 100
e2 = abs(float(as_ind) - float(alpha_s_inv_MZ)) / float(alpha_s_inv_MZ) * 100
print(f"{'1/α_s':20s} {float(as_S151):15.4f} {float(as_ind):15.4f} {float(alpha_s_inv_MZ):15.4f} {e1:9.3f}% {e2:9.3f}%")

# With Φ₆ corrections
e_phi6_a2 = err_a2_phi6 * 100
e_phi6_as = err_as_phi6 * 100
print()
print(f"{'With Φ₆ corrections':20s}")
print(f"{'1/α₂ = 30-47/111':20s} {float(pred_a2_phi6):15.4f} {'—':15s} {float(alpha_2_inv_MZ):15.4f} {e_phi6_a2:9.3f}% {'—':>10s}")
print(f"{'1/α_s = 8+53/111':20s} {float(pred_as_phi6):15.4f} {'—':15s} {float(alpha_s_inv_MZ):15.4f} {e_phi6_as:9.3f}% {'—':>10s}")
print()

# ==============================================================================
# SECTION 9: WHAT IF THE CORRECTIONS COME FROM SM RUNNING?
# ==============================================================================

print("=" * 72)
print("SECTION 9: SM RUNNING AS THE SOURCE OF RESIDUALS")
print("=" * 72)
print()

# Key insight: the framework predictions might apply at a specific scale
# (e.g., Λ ~ 405 TeV), and SM running from Λ to M_Z creates the residuals.
#
# In the induced picture, the coupling at ANY scale μ is:
#   1/α_i(μ) = S_i/(6π) × log(Λ/μ)
# where ALL contributions come from the tilt modes.
#
# The RATIO S_i/S_j is scale-independent in this picture.
# But SM running BELOW Λ gives different beta functions for different groups.
#
# The correction to sin²θ_W from SM running:
# At one loop: sin²θ_W(μ) = sin²θ_W(Λ) + [b₁-b₂]/(2π) × sin²θ_W cos²θ_W × log(Λ/μ)
# (approximate formula for the shift)

# SM one-loop beta coefficients (standard normalization)
b1 = R(41, 10)    # U(1)_Y (GUT normalized: 5/3 × standard)
b2 = R(-19, 6)    # SU(2)_L
b3 = -7           # SU(3)_C

# Running from Λ = 405 TeV to M_Z = 91.2 GeV
from sympy import log as sym_log
Lambda_comp = 405000  # GeV (framework composite scale)
M_Z_val = R(91188, 1000)  # GeV
log_ratio = float(sym_log(R(Lambda_comp * 1000, int(M_Z_val * 1000))))

print(f"Composite scale: Λ = {Lambda_comp/1000:.0f} TeV")
print(f"log(Λ/M_Z) = log({Lambda_comp}/{float(M_Z_val):.1f}) = {log_ratio:.4f}")
print()

# If at Λ: sin²θ_W = 29/126 = 0.23016
# SM one-loop shift in sin²θ_W from Λ to M_Z:
# Δ(sin²θ) ≈ (b₁-b₂)/(2π) × sin²θ × cos²θ × log(M_Z/Λ)  [running DOWN]
# Note: running from Λ DOWN to M_Z means log(M_Z/Λ) < 0
# b₁ - b₂ = 41/10 + 19/6 = 123/30 + 95/30 = 218/30 = 109/15

b1_minus_b2 = b1 - b2
sin2_at_Lambda = float(sin2_induced)
cos2_at_Lambda = 1 - sin2_at_Lambda
log_down = -log_ratio  # log(M_Z/Λ) < 0

# This is a simplified one-loop formula
delta_sin2 = float(b1_minus_b2) / (2 * 3.14159) * sin2_at_Lambda * cos2_at_Lambda * log_down

print(f"b₁ - b₂ = {float(b1_minus_b2):.4f}")
print(f"One-loop shift: Δ(sin²θ_W) ≈ {delta_sin2:.5f}")
print(f"sin²θ_W(M_Z) ≈ sin²θ_W(Λ) + Δ = {sin2_at_Lambda + delta_sin2:.5f}")
print(f"Measured: {float(sin2_W_MZ):.5f}")
print()

# For α_s: SM running from Λ to M_Z
# 1/α_s(M_Z) = 1/α_s(Λ) + b₃/(2π) × log(Λ/M_Z)
# If 1/α_s(Λ) = S_3 × C at the composite scale...
# At Λ, the induced coupling just starts forming, so 1/α_s is small.
# Actually in the induced picture, 1/α_s(Λ) → 0 (no bare term).
# So: 1/α_s(M_Z) = S_3/(6π) × log(Λ/M_Z) + SM gauge contributions

# The SM gauge boson (gluon) contribution to α_s running:
# Δ(1/α_s)_gauge = 11/(2π) × log(Λ/M_Z) (asymptotic freedom piece)
# Δ(1/α_s)_matter = -n_f × 2/(3 × 2π) × log(Λ/M_Z)
# For 6 flavors: Δ_matter = -4/(2π) × log(Λ/M_Z)
# Total SM: b₃/(2π) × log(Λ/M_Z) = -7/(2π) × 8.4 ≈ -9.4

delta_alpha_s_inv_SM = float(b3) / (2 * 3.14159) * log_ratio
print(f"SM running correction to 1/α_s:")
print(f"  b₃/(2π) × log(Λ/M_Z) = {float(b3):.0f}/(2π) × {log_ratio:.2f} = {delta_alpha_s_inv_SM:.2f}")
print(f"  This is huge compared to 1/α_s = 8.5")
print(f"  The SM running and the induced mechanism cannot simply be added")
print()

print("CONCLUSION: SM running corrections are of order 1, not 0.01.")
print("The framework leading-order predictions (30, 8) are at their")
print("natural accuracy level (~1-6%). These are NOT amenable to")
print("small 'correction terms' like 4/111 for α_EM.")
print()

# ==============================================================================
# SECTION 10: WHAT CORRECTIONS COULD WORK — STRUCTURAL APPROACH
# ==============================================================================

print("=" * 72)
print("SECTION 10: STRUCTURAL CORRECTIONS")
print("=" * 72)
print()

# Instead of small additive corrections, the right approach might be:
# 1. Express the coupling as a ratio of framework quantities
# 2. The ratio automatically includes "corrections"
#
# For sin²θ_W, compare:
# - 28/121 = 0.23140 (0.08%) — Goldstone fraction [D]
# - 29/126 = 0.23016 (0.45%) — induced mechanism [D]
# - Measured: 0.23121
#
# The 28/121 formula gives better precision WITHOUT any correction.
# This suggests that for SU(2), the Goldstone fraction n_d·Im_O/n_c²
# is the more fundamental formula.

# For 1/α_s, the best simple expressions:
print("Best simple framework expressions for 1/α_s(M_Z) ≈ 8.475:")
print()

alpha_s_candidates = [
    ("O = 8", R(8)),
    ("17/C = 8.5", R(17, C_dim)),
    ("(n_c + O)/C + Im_C/n_c = ...", R(n_c + O_dim, C_dim) + R(Im_C, n_c)),
    ("n_d² + Im_H²/O = 16+9/8", R(n_d**2 * O_dim + Im_H**2, O_dim)),
    ("S_3×N_I/S_EM = 8.698", R(S_3 * N_I, S_EM)),
    ("O + n_d/O = 8.5", R(O_dim**2 + n_d, O_dim)),
    ("(Im_H² + Im_O²)/(Im_O - Im_C) = 130/6", R(Im_H**2 + Im_O**2, Im_O - Im_C)),
    ("N_I/n_d² = 137/16 = 8.5625", R(N_I, n_d**2)),
    ("(n_d×Im_O+Im_C)/Im_H² = 29/9", R(n_d * Im_O + Im_C, Im_H**2)),
]

for name, val in sorted(alpha_s_candidates, key=lambda x: abs(float(x[1]) - float(alpha_s_inv_MZ))):
    err = abs(float(val) - float(alpha_s_inv_MZ)) / float(alpha_s_inv_MZ) * 100
    mark = "***" if err < 0.1 else "**" if err < 0.5 else "*" if err < 2 else ""
    print(f"  {name:42s} = {float(val):.5f}  err={err:.2f}% {mark}")

print()

# The 17/2 = 8.5 expression stands out: simple and 0.3% from measured
pred_17_2 = R(17, C_dim)
err_17_2 = abs(float(pred_17_2 - alpha_s_inv_MZ)) / float(alpha_s_inv_MZ) * 100
print(f"Notable: 17/C = {float(pred_17_2):.4f} (err={err_17_2:.2f}%)")
print(f"  17 = n_d² + Im_C = 16 + 1 (framework)")
print(f"  17 = n_c + Im_O - Im_C = 11+7-1 = 17 (framework)")
print(f"  C = 2 = complex dimension")
print(f"  BUT: 17 = (n_c + O - C) = 11+8-2 = 17")
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

    ("Φ₆(n_c) = 111",
     Phi_6 == 111),

    ("S_2 = 29, S_3 = 8, S_Y = 97",
     S_2 == 29 and S_3 == 8 and S_Y == 97),

    ("S_2 + S_Y = S_EM",
     S_2 + S_Y == S_EM),

    # α_EM correction reference
    ("1/α_EM = 137 + 4/111 within 30 ppm of measured",
     abs(float(R(137 * 111 + 4, 111) - alpha_inv_low)) / float(alpha_inv_low) < 3e-5),

    # sin²θ_W formulas
    ("sin²θ_W = 28/121 within 0.1% of 0.23121",
     abs(float(R(28, 121)) - 0.23121) / 0.23121 < 0.001),

    ("sin²θ_W = 29/126 within 0.5% of 0.23121",
     abs(float(R(29, 126)) - 0.23121) / 0.23121 < 0.005),

    # Φ₆ correction candidates
    ("B₂ = 47 = n_d·n_c + Im_H",
     n_d * n_c + Im_H == 47),

    ("B₃ = 53 = Im_O² + n_d",
     Im_O**2 + n_d == 53),

    ("1/α₂ = 30 - 47/111 within 500 ppm of measured",
     abs(float(R(30 * 111 - 47, 111) - alpha_2_inv_MZ)) / float(alpha_2_inv_MZ) < 5e-4),

    ("1/α_s = 8 + 53/111 within 500 ppm of measured",
     abs(float(R(8 * 111 + 53, 111) - alpha_s_inv_MZ)) / float(alpha_s_inv_MZ) < 5e-4),

    # Numerology check: corrections are LARGE compared to leading term
    ("B₂/A₂ > 1% (correction is NOT small for α₂)",
     abs(47.0 / (30 * 111)) * 111 / 30 > 0.01),

    ("B₃/A₃ > 5% (correction is NOT small for α_s)",
     abs(53.0 / (8 * 111)) * 111 / 8 > 0.05),

    # 28/121 vs 29/126 are genuinely different
    ("28/121 ≠ 29/126 (different mechanisms)",
     R(28, 121) != R(29, 126)),

    # Measurement uncertainty context
    # B=-47 exceeds uncertainty; B=-46 (the optimal integer) is within it
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
print("SUMMARY: TASK D RESULTS")
print("=" * 72)
print()
print("Q1: Does α_s have a correction of the form 1/α_s = O + correction?")
print(f"  YES numerically: 1/α_s = 8 + 53/111 = {float(pred_as_phi6):.4f}")
print(f"  53 = Im_O² + n_d (framework prime, clean expression)")
print(f"  BUT: the correction is 6% of the leading term, NOT a refinement")
print()
print("Q2: Does α₂ have a correction of the form 1/α₂ = 30 + correction?")
print(f"  YES numerically: 1/α₂ = 30 - 47/111 = {float(pred_a2_phi6):.4f}")
print(f"  47 = n_d·n_c + Im_H (three-term expression, not a framework prime)")
print(f"  BUT: the correction is 1.4% of the leading term, and the precision")
print(f"  ({err_a2_phi6*1e6:.0f} ppm) is comparable to measurement uncertainty")
print()
print("Q3: Are the corrections related to Φ₆(n_c) = 111?")
print("  FORMALLY yes (B_i/111 pattern), but the analogy is WEAK:")
print(f"  - α_EM correction = {float(R(4, 111)):.5f} ({float(R(4, 111))/137*100:.3f}% of leading)")
print(f"  - α₂  correction = {float(R(-47, 111)):.5f} ({float(R(47, 111))/30*100:.1f}% of leading)")
print(f"  - α_s  correction = {float(R(53, 111)):.5f} ({float(R(53, 111))/8*100:.1f}% of leading)")
print("  The α_EM correction is uniquely small and clean")
print()
print("Q4: Are induced ratios cleaner?")
print("  sin²θ_W = 29/126 = 0.2302 is 0.45% off (vs 28/121 at 0.08%)")
print("  The RATIO approach is worse for the Weinberg angle")
print("  For α_s: S_3/S_EM gives 1/α_s = 8.70, 2.6% off (vs O=8, 5.6% off)")
print("  The ratio approach helps for α_s but not for α₂")
print()
print("OVERALL ASSESSMENT:")
print("  The 4/111 correction for α_EM is UNIQUE among the three couplings.")
print("  For α₂ and α_s, the framework predicts leading-order values")
print("  (30 and 8) at 1-6% accuracy. Corrections of the Φ₆ type exist")
print("  numerically but lack the compelling simplicity of n_d/Φ₆(n_c).")
print()
print("  The framework's real predictions for weak and strong couplings are:")
print("  - sin²θ_W = 28/121 = 0.2314 [DERIVATION, 0.08%]")
print("  - 1/α_s ≈ O = 8 [CONJECTURE, 5.6%] or 17/2 [CONJECTURE, 0.3%]")
print("  - Corrections to sub-percent precision require physical mechanism")
print("    beyond simple framework number matching")
print()
print("  HRS = 5 (high) — the Φ₆ correction pattern is likely numerology")
print("  for α₂ and α_s, unlike the genuine sub-ppm result for α_EM")
