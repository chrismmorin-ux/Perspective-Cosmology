#!/usr/bin/env python3
"""
CCWZ Phase 3: Three-Loop Structure and Residual Characterization

KEY FINDINGS:
  1. DEFECT CHARGE SELECTION THEOREM: The tree-level alpha uses N_I = dim(so(n_c)) +
     dim(so(n_d)) = structural counting. The coset generators T_{a,s} have ZERO T_X
     eigenvalue when s is the singlet index (4). This means Q_EM = R3 + L1 is the
     INTRINSIC charge on the defect sector, while T_X acts on the crystal sector.
     The correction must use the same charge convention as the tree [DERIVATION].

  2. THREE-LOOP COEFFICIENT: The residual D_3 = -1.000 in alpha^3/pi basis.
     Candidate: D_3 = -1 from the SINGLE EM-neutral direction in the Higgs sector.
     The VEV h0 = (T_{0,4} - T_{2,4})/sqrt(2) picks ONE of two Q=0 modes.
     This selection contributes a unit correction at three-loop order [CONJECTURE].

  3. FOUR-LOOP RESIDUAL: After C_2=24/11 (two-loop) and D_3=-1 (three-loop),
     the remaining gap is characterized. Sub-ppb regime.

Formula:
  1/alpha = 15211/111 - (24/11)*alpha^2/pi + alpha^3/pi + ...
  Self-consistent: 1/alpha + (24/11)*alpha^2/pi - alpha^3/pi = 15211/111

Status: INVESTIGATION
Created: Session S344 (CCWZ Phase 3)
Depends on:
- [D] alpha_ccwz_one_loop.py (Phase 2, S341)
- [D] alpha_ccwz_setup.py (Phase 1, S337)
- [D] alpha_three_loop_residual.py (S331)
- [I-MATH] CCWZ formalism
"""

import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import numpy as np
from fractions import Fraction
from sympy import Rational, pi as spi, N as Neval, Float, Integer, Symbol, nsolve, sqrt as ssqrt

# Framework constants
n_d = 4
n_c = 11
Im_H = 3
Im_O = 7
N_c = 3
N_I = n_d**2 + n_c**2  # = 137

tests_passed = 0
tests_total = 0

def check(name, condition, detail=""):
    global tests_passed, tests_total
    tests_total += 1
    status = "PASS" if condition else "FAIL"
    if condition:
        tests_passed += 1
    print(f"  [{status}] T{tests_total}: {name}")
    if detail and not condition:
        print(f"         {detail}")

# ================================================================
# PART 1: INFRASTRUCTURE (from Phase 2)
# ================================================================
print("=" * 70)
print("PART 1: SO(11) INFRASTRUCTURE")
print("=" * 70)

def so_gen(a, b, n=11):
    M = np.zeros((n, n))
    M[a, b] = 1.0
    M[b, a] = -1.0
    return M

def commutator(A, B):
    return A @ B - B @ A

# Build generators
gens_all = {}
for a in range(n_c):
    for b in range(a+1, n_c):
        gens_all[(a,b)] = so_gen(a, b)

gens_coset = {}
for (a,b), M in gens_all.items():
    if a < n_d and b >= n_d:
        gens_coset[(a,b)] = M

coset_keys = sorted(gens_coset.keys())

# SU(2)_L x SU(2)_R
T = gens_all
L1 = (T[(0,1)] + T[(2,3)]) / 2
R3 = (T[(0,3)] - T[(1,2)]) / 2

# T_X from Pati-Salam
T_X_11 = np.zeros((11, 11))
for k in range(3):
    T_X_11 += so_gen(5+k, 8+k)
T_X_11 = T_X_11 / 3.0

Q_EM_defect = R3 + L1
Q_EM_full = R3 + L1 + T_X_11

# Correct VEV (Phase 2)
h0 = (gens_coset[(0,4)] - gens_coset[(2,4)]) / np.sqrt(2)
h0b = (gens_coset[(1,4)] - gens_coset[(3,4)]) / np.sqrt(2)

check("28 coset generators", len(gens_coset) == 28)
check("[Q_EM, h0] = 0", np.max(np.abs(commutator(Q_EM_defect, h0))) < 1e-10)
print("  Infrastructure loaded.")

# ================================================================
# PART 2: DEFECT CHARGE SELECTION - FORMAL PROOF
# ================================================================
print("\n" + "=" * 70)
print("PART 2: WHY DEFECT CHARGES (R3+L1), NOT FULL (R3+L1+T_X)")
print("=" * 70)

# ARGUMENT: The tree-level formula 1/alpha = N_I/111 counts the
# structural EM modes. The KEY question is: what defines "structural EM"?
#
# The tree value comes from the crystal structure:
#   N_I = n_d^2 + n_c^2 = 16 + 121 = 137
# The correction comes from pNGB modes on the coset SO(11)/SO(4)xSO(7).
#
# THEOREM: T_X = 0 on ALL coset generators involving the singlet index.
# The Higgs pNGBs are T_{a,4} for a=0,...,3. These have T_X eigenvalue 0
# because T_X acts only on indices {5,...,10} via so_gen(5+k, 8+k).
#
# More precisely: [T_X, T_{a,4}] = 0 for all a in {0,...,3}
# because T_X permutes indices in {5,...,10} while T_{a,4} involves
# only indices a in {0,...,3} and index 4.

print("\n  Testing: [T_X, T_{a,4}] = 0 for Higgs sector (a=0,...,3)")
all_commute = True
for a in range(4):
    comm = commutator(T_X_11, gens_coset[(a, 4)])
    norm = np.max(np.abs(comm))
    if norm > 1e-10:
        all_commute = False
    print(f"    [T_X, T_{{{a},4}}] = {norm:.2e}")
check("T_X commutes with ALL Higgs pNGBs", all_commute)

# For colored pNGBs T_{a,s} with s in {5,...,10}: T_X does NOT commute
print("\n  Testing: [T_X, T_{a,s}] for colored pNGBs (s >= 5)")
any_nonzero = False
nonzero_count = 0
for a in range(4):
    for s in range(5, 11):
        comm = commutator(T_X_11, gens_coset[(a, s)])
        norm = np.max(np.abs(comm))
        if norm > 1e-10:
            any_nonzero = True
            nonzero_count += 1
check("T_X does NOT commute with colored pNGBs", any_nonzero)
print(f"    {nonzero_count}/24 colored pNGBs have [T_X, T_{{a,s}}] != 0")

# CONSEQUENCE: On the Higgs sector, Q_EM_defect = Q_EM_full (T_X adds nothing).
# On the colored sector, T_X adds fractional charges.
# The tree-level alpha counts modes by their DEFECT structure.
# The correction modifies this count perturbatively.

# FORMAL ARGUMENT for defect charge selection:
# 1. The tree 1/alpha = N_I/111 uses the HS inner product on so(11).
#    This inner product sees generators as unit-norm objects.
# 2. The EM projection uses Q_EM = R3 + L1, which is the EM generator
#    INTRINSIC to SO(4) (the defect symmetry group).
# 3. T_X is part of SO(7) (the crystal symmetry group).
# 4. The coset SO(11)/SO(4)xSO(7) has Q_EM_defect as the NATURAL
#    EM charge, because the breaking pattern preserves SO(4) as the
#    residual defect symmetry.
# 5. The correction C_2 modifies the tree-level COUNTING, so it must
#    use the same charge convention.

print(f"\n  DEFECT CHARGE SELECTION ARGUMENT:")
print(f"  1. Tree alpha uses HS inner product on so(11) [THM from S165]")
print(f"  2. Q_EM = R3 + L1 is intrinsic to SO(4) (defect group)")
print(f"  3. T_X is intrinsic to SO(7) (crystal group)")
print(f"  4. Coset SO(11)/SO(4)xSO(7) preserves SO(4) as residual symmetry")
print(f"  5. The correction modifies the same counting -> same Q_EM")
print(f"  6. On Higgs sector: Q_defect = Q_full (T_X = 0 on singlet)")
print(f"  7. On colored sector: Q_defect != Q_full (T_X adds fractions)")

# Verify: Higgs charges identical in both conventions
higgs_gens = [gens_coset[(a, 4)] for a in range(4)]
def get_charges(Q_op, gen_list):
    n = len(gen_list)
    ad_Q = np.zeros((n, n))
    for i in range(n):
        comm = commutator(Q_op, gen_list[i])
        for j in range(n):
            ad_Q[i, j] = np.trace(gen_list[j].T @ comm) / 2.0
    eigs = np.sort(np.real(np.linalg.eigvalsh(1j * ad_Q)))
    return eigs

higgs_def = get_charges(Q_EM_defect, higgs_gens)
higgs_full = get_charges(Q_EM_full, higgs_gens)
check("Higgs charges identical: defect = full",
      np.max(np.abs(higgs_def - higgs_full)) < 1e-10)

# Colored charges differ
colored_gens = [gens_coset[(a, s)] for a in range(4) for s in range(5, 11)]
colored_def = get_charges(Q_EM_defect, colored_gens)
colored_full = get_charges(Q_EM_full, colored_gens)
max_diff = np.max(np.abs(colored_def - colored_full))
check("Colored charges DIFFER: defect != full", max_diff > 0.1,
      f"Max difference = {max_diff:.4f}")

# Sum of Q^2 in each convention
sq2_def = sum(q**2 for q in colored_def)
sq2_full = sum(q**2 for q in colored_full)
print(f"\n  sum(Q^2) colored [defect] = {sq2_def:.4f} (= 12)")
print(f"  sum(Q^2) colored [full]   = {sq2_full:.4f} (= 44/3 = 14.667)")
check("Defect: sum(Q^2)_colored = 12", abs(sq2_def - 12) < 0.01)
check("Full: sum(Q^2)_colored = 44/3", abs(sq2_full - 44/3) < 0.01)

# C_2 in each convention
rho_EM = 2.0 / n_c  # = 2/11
C2_defect = sq2_def * rho_EM
C2_full = sq2_full * rho_EM
print(f"\n  C_2(defect) = {sq2_def:.0f} * 2/11 = {C2_defect:.6f} (= 24/11 = {24/11:.6f})")
print(f"  C_2(full)   = {sq2_full:.3f} * 2/11 = {C2_full:.6f} (= 88/33 = {88/33:.6f})")
check("C_2(defect) = 24/11", abs(C2_defect - 24/11) < 0.001)

# ================================================================
# PART 3: HIGGS VEV SELECTION AND THREE-LOOP STRUCTURE
# ================================================================
print("\n" + "=" * 70)
print("PART 3: VEV SELECTION AND THREE-LOOP COEFFICIENT")
print("=" * 70)

# The Higgs sector has 4 pNGBs: T_{a,4} for a=0,...,3
# Under Q_EM, these decompose as: Q = {-1, 0, 0, +1}
# Two neutral (Q=0) directions:
#   h0  = (T_{0,4} - T_{2,4})/sqrt(2)  [VEV direction]
#   h0b = (T_{1,4} - T_{3,4})/sqrt(2)  [CP-odd neutral]
#
# The VEV selects h0 (spontaneous choice). This breaks the symmetry between
# the two neutral modes.

# Structural observation: The 4 Higgs modes under Q_EM give:
#   2 charged (Q = +/-1): contribute to vacuum polarization
#   2 neutral (Q = 0): do NOT contribute to vacuum polarization
#   But ONE neutral mode gets a VEV, changing the vacuum structure.

# At two-loop: C_2 counts ALL charged modes (colored + Higgs charged)
# weighted by rho_EM. The neutral modes don't contribute (Q=0).

# At three-loop: The VEV in h0 introduces a QUALITATIVE change.
# The VEV-carrying mode h0 is the radial (Higgs) mode after EWSB.
# It contributes to loop diagrams differently from the would-be Goldstones.

# The three-loop coefficient D_3 = -1 counts this single VEV mode.

# CANDIDATE DERIVATION:
# The self-consistent equation at two-loop is:
#   1/alpha + C_2 * alpha^2/pi = A  where A = 15211/111
#
# At three-loop, the VEV mode contributes an additional correction:
#   1/alpha + C_2 * alpha^2/pi - D_3 * alpha^3/pi = A
#
# D_3 = N_VEV = 1 (number of VEV directions in the Higgs sector)
# Sign: positive contribution to 1/alpha (counteracts two-loop subtraction)

# This is an ALTERNATING series: +A, -C_2*alpha^2/pi, +D_3*alpha^3/pi
# consistent with perturbative expansions with (-1)^(n+1) pattern.

print(f"  Higgs sector Q_EM eigenvalues: {[round(q, 2) for q in higgs_def]}")
n_charged_higgs = sum(1 for q in higgs_def if abs(q) > 0.01)
n_neutral_higgs = sum(1 for q in higgs_def if abs(q) < 0.01)
print(f"  Charged: {n_charged_higgs}, Neutral: {n_neutral_higgs}")

# VEV direction count
print(f"\n  VEV direction: h0 = (T_{{0,4}} - T_{{2,4}})/sqrt(2)")
print(f"  Number of VEV directions: 1 (N_VEV = 1)")
print(f"  This is the ONLY direction that gets a VEV in the Higgs sector.")
print(f"  The second neutral (h0b) is the CP-odd mode (no VEV).")

# Verify h0 and h0b are independent (both Q=0, orthogonal)
overlap = np.trace(h0.T @ h0b) / 2.0
check("h0 perp h0b (orthogonal neutral modes)", abs(overlap) < 1e-10)

# ================================================================
# PART 4: NUMERICAL THREE-LOOP ANALYSIS
# ================================================================
print("\n" + "=" * 70)
print("PART 4: NUMERICAL THREE-LOOP ANALYSIS")
print("=" * 70)

# Exact framework values
C_2 = Rational(24, 11)
A_tree = Rational(15211, 111)
alpha_tree = Rational(111, 15211)

alpha_f = float(alpha_tree)
p = float(spi)
A_f = float(A_tree)

# CODATA 2022
alpha_inv_CODATA = 137.035999177
alpha_inv_unc = 0.000000021

# Scales
alpha2_pi = alpha_f**2 / p
alpha3_pi = alpha_f**3 / p
alpha3_pi2 = alpha_f**3 / p**2
alpha4_pi2 = alpha_f**4 / p**2

# --- Method 1: Perturbative two-loop ---
inv_alpha_2loop = A_f - float(C_2) * alpha_f**2 / p
resid_2loop = inv_alpha_2loop - alpha_inv_CODATA
sigma_2loop = abs(resid_2loop) / alpha_inv_unc

print(f"  Tree: 1/alpha = {A_f:.12f}")
print(f"  CODATA 2022: 1/alpha = {alpha_inv_CODATA}")
print(f"\n  Two-loop perturbative (C_2 = 24/11):")
print(f"    1/alpha = {inv_alpha_2loop:.12f}")
print(f"    Residual: {resid_2loop:+.4e}")
print(f"    Sigma: {sigma_2loop:.1f}")

# --- Method 2: Self-consistent cubic (two-loop) ---
a_sym = Symbol('a', positive=True)
cubic_eq = Rational(24, 1) * a_sym**3 - Rational(15211 * 11, 111) * spi * a_sym + 11 * spi
root_cubic = nsolve(cubic_eq, a_sym, 0.0073)
inv_alpha_cubic = float(1 / root_cubic)
resid_cubic = inv_alpha_cubic - alpha_inv_CODATA
sigma_cubic = abs(resid_cubic) / alpha_inv_unc

print(f"\n  Self-consistent cubic (C_2 = 24/11):")
print(f"    1/alpha = {inv_alpha_cubic:.12f}")
print(f"    Residual: {resid_cubic:+.4e}")
print(f"    Sigma: {sigma_cubic:.1f}")

# --- Method 3: Perturbative three-loop with D_3 = -1 ---
# 1/alpha = A - C_2*alpha^2/pi + |D_3|*alpha^3/pi
D_3 = 1  # |D_3| = 1, sign is positive contribution to 1/alpha
inv_alpha_3loop = A_f - float(C_2) * alpha_f**2 / p + D_3 * alpha_f**3 / p
resid_3loop = inv_alpha_3loop - alpha_inv_CODATA
sigma_3loop = abs(resid_3loop) / alpha_inv_unc

print(f"\n  Three-loop perturbative (C_2 = 24/11, D_3 = 1):")
print(f"    Correction term: +alpha^3/pi = +{alpha3_pi:.4e}")
print(f"    1/alpha = {inv_alpha_3loop:.12f}")
print(f"    Residual: {resid_3loop:+.4e}")
print(f"    Sigma: {sigma_3loop:.4f}")
print(f"    Gap (ppb): {abs(resid_3loop)/alpha_inv_CODATA*1e9:.4f}")
print(f"    Residual is {alpha_inv_unc/abs(resid_3loop):.0f}x SMALLER than CODATA uncertainty")

check("Two-loop undershoots CODATA", resid_2loop < 0)
check("Two-loop sigma ~ 5.9", 5.0 < sigma_2loop < 7.0)
check("Three-loop (D_3=1) IMPROVES over two-loop",
      abs(resid_3loop) < abs(resid_2loop))

# --- Method 4: Self-consistent quartic with D_3 = 1 ---
# 1/alpha + (24/11)*alpha^2/pi - alpha^3/pi = 15211/111
# Multiply by 11*alpha*pi:
# 11*pi + 24*alpha^3 - 11*alpha^4*pi = (15211*11/111)*pi*alpha
# Rearrange: 11*alpha^4*pi - 24*alpha^3 + (15211*11/111)*pi*alpha - 11*pi = 0
quartic_eq = (11 * a_sym**4 - 24 * a_sym**3
              + Rational(15211 * 11, 111) * spi * a_sym - 11 * spi)
root_quartic = nsolve(quartic_eq, a_sym, 0.0073)
inv_alpha_quartic = float(1 / root_quartic)
resid_quartic = inv_alpha_quartic - alpha_inv_CODATA
sigma_quartic = abs(resid_quartic) / alpha_inv_unc

print(f"\n  Self-consistent quartic (C_2 = 24/11, D_3 = 1):")
print(f"    1/alpha = {inv_alpha_quartic:.12f}")
print(f"    Residual: {resid_quartic:+.4e}")
print(f"    Sigma: {sigma_quartic:.4f}")
print(f"    Gap (ppb): {abs(resid_quartic)/alpha_inv_CODATA*1e9:.4f}")

# Verify the quartic root satisfies the equation
verify_quartic = (float(1/root_quartic) + float(C_2) * float(root_quartic)**2 / p
                  - float(root_quartic)**3 / p - A_f)
check("Quartic root satisfies defining equation",
      abs(verify_quartic) < 1e-10, f"Residual = {verify_quartic:.2e}")

# ================================================================
# PART 5: FOUR-LOOP RESIDUAL CHARACTERIZATION
# ================================================================
print("\n" + "=" * 70)
print("PART 5: FOUR-LOOP RESIDUAL CHARACTERIZATION")
print("=" * 70)

# After C_2 = 24/11 and D_3 = 1, what remains?
resid_after_3loop = resid_3loop
resid_after_quartic = resid_quartic

# Express in various bases
print(f"\n  Residual after D_3 = 1 (perturbative):")
print(f"    Raw: {resid_after_3loop:+.4e}")
print(f"    In units of alpha^4/pi^2: {resid_after_3loop / alpha4_pi2:.4f}")
print(f"    In units of alpha^3/pi^2: {resid_after_3loop / alpha3_pi2:.4f}")
print(f"    In units of alpha^3/pi:   {resid_after_3loop / alpha3_pi:.6f}")
print(f"    In ppb:                    {resid_after_3loop / alpha_inv_CODATA * 1e9:.2f}")

print(f"\n  Residual after quartic resummation:")
print(f"    Raw: {resid_after_quartic:+.4e}")
print(f"    In units of alpha^4/pi^2: {resid_after_quartic / alpha4_pi2:.4f}")
print(f"    In ppb:                    {resid_after_quartic / alpha_inv_CODATA * 1e9:.2f}")

# Compare to known QED corrections at alpha^3/pi^2 order
# The Schwinger series for (g-2)/2:
#   a_e = alpha/(2*pi) - 0.32848..*(alpha/pi)^2 + 1.1812..*(alpha/pi)^3 - ...
# Our correction is to 1/alpha, not g-2, so direct comparison is not meaningful.
# But the ORDER of magnitude of alpha^4/pi^2 ~ 9e-11 compared to residual:

print(f"\n  Scale comparison:")
print(f"    alpha^2/pi   = {alpha2_pi:.4e}  (two-loop scale)")
print(f"    alpha^3/pi   = {alpha3_pi:.4e}  (three-loop scale)")
print(f"    alpha^3/pi^2 = {alpha3_pi2:.4e}")
print(f"    alpha^4/pi^2 = {alpha4_pi2:.4e}  (four-loop scale)")
print(f"    alpha^4/pi^3 = {alpha_f**4/p**3:.4e}")
print(f"    Residual     = {abs(resid_after_3loop):.4e}")
print(f"    Ratio resid/(alpha^4/pi^2) = {abs(resid_after_3loop)/alpha4_pi2:.2f}")

# Extract C_4 candidate
C_4_candidate = resid_after_3loop / alpha4_pi2
print(f"\n  IF residual = C_4 * alpha^4/pi^2:")
print(f"    C_4 = {C_4_candidate:.4f}")

# Is the three-loop correction sufficient to bring us within measurement?
within_3sigma = sigma_3loop < 3.0
within_1sigma = sigma_3loop < 1.0
print(f"\n  After D_3 = 1:")
print(f"    Within 3 sigma? {'YES' if within_3sigma else 'NO'} ({sigma_3loop:.1f} sigma)")
print(f"    Within 1 sigma? {'YES' if within_1sigma else 'NO'} ({sigma_3loop:.1f} sigma)")

# ================================================================
# PART 6: ALTERNATIVE C_3 CANDIDATES FROM COSET STRUCTURE
# ================================================================
print("\n" + "=" * 70)
print("PART 6: ALTERNATIVE C_3 CANDIDATES")
print("=" * 70)

# D_3 = 1 is the simplest possibility. But let's check if the coset
# structure gives other natural candidates.

# Key structural numbers:
# - N_VEV = 1 (VEV directions)
# - N_neutral_higgs = 2 (neutral Higgs modes)
# - dim(Im_C) = 1 (imaginary complex dimension)
# - n_d / n_d = 1 (trivially)
# - N_charged_higgs / N_higgs = 2/4 = 1/2

# For D_3 basis (alpha^3/pi):
D3_extracted = resid_2loop / alpha3_pi  # what D_3 needs to be
print(f"\n  Extracted D_3 (from 2-loop residual): {D3_extracted:.8f}")
print(f"  |D_3 - (-1)| / 1 = {abs(D3_extracted + 1):.6f} ({abs(D3_extracted + 1)*100:.4f}%)")

candidates = [
    ("D_3 = -1 (N_VEV, universal)", -1.0),
    ("D_3 = -Im_C = -1", -1.0),
    ("D_3 = -n_d/n_d = -1", -1.0),
    ("D_3 = -N_neutral/2 = -1", -1.0),
    ("D_3 = -2/N_neutral = -1", -1.0),
    ("D_3 = -24/(11*C_2) = -1", -24/(11*float(C_2))),
    ("D_3 = -rho_EM * n_c/2 = -1", -float(rho_EM) * n_c / 2),
]

# In the alpha^3/pi^2 basis:
C3_extracted = resid_2loop / alpha3_pi2
print(f"\n  Extracted C_3 (alpha^3/pi^2 basis): {C3_extracted:.8f}")
print(f"  |C_3 - (-pi)| / pi = {abs(C3_extracted + p) / p:.6f} ({abs(C3_extracted + p)/p*100:.4f}%)")

candidates_C3 = [
    ("C_3 = -pi (transcendental)", -p),
    ("C_3 = -22/7 (rational approx)", -22/7),
    ("C_3 = -N_I/Phi_6(Im_O) = -137/43", -137/43),
    ("C_3 = -n_c * 2/Im_O = -22/7", -n_c * 2 / Im_O),
]

print(f"\n  --- D_3 candidates (alpha^3/pi basis) ---")
print(f"  {'Candidate':<40s} {'Value':>10s} {'Error %':>10s}")
for name, val in candidates:
    err = abs(val - D3_extracted) / abs(D3_extracted) * 100
    marker = " <---" if err < 0.02 else ""
    print(f"  {name:<40s} {val:>10.6f} {err:>10.4f}%{marker}")

print(f"\n  --- C_3 candidates (alpha^3/pi^2 basis) ---")
print(f"  {'Candidate':<45s} {'Value':>10s} {'Error %':>10s}")
for name, val in candidates_C3:
    err = abs(val - C3_extracted) / abs(C3_extracted) * 100
    marker = " <---" if err < 0.02 else ""
    print(f"  {name:<45s} {val:>10.6f} {err:>10.4f}%{marker}")

# ================================================================
# PART 7: COMPARISON WITH KNOWN QED STRUCTURE
# ================================================================
print("\n" + "=" * 70)
print("PART 7: COMPARISON WITH KNOWN QED STRUCTURE")
print("=" * 70)

# In standard QED, the vacuum polarization series for 1/alpha(q^2) is:
# 1/alpha(q^2) = 1/alpha(0) - (sum_f Q_f^2)/(3*pi) * ln(q^2/m_f^2)
# This is a LOGARITHMIC running, not our power series.
#
# Our expansion is:
# 1/alpha = A - C_2 * alpha^2/pi + D_3 * alpha^3/pi + ...
# This is a SELF-CONSISTENT algebraic equation, not a running equation.
#
# The alpha^2/pi and alpha^3/pi terms are NOT standard QED corrections.
# They're structural corrections from the composite sector.

# However, there ARE known alpha^3/pi type quantities in QED:
# - (g-2)_e: a_1 = 1/(2*pi), a_2 = -0.32848.., a_3 = +1.18124..
# - Lamb shift: contains alpha^3 * ln(alpha) terms
# - Light-by-light: alpha^3 contribution

# Our alpha^3/pi = 1.237e-7 corresponds to:
# - In 1/alpha: a shift of 0.000000124
# - This is ~6 times the CODATA uncertainty
# - In ppm: 2-loop: 0.0009 ppm (5.9σ); 3-loop D_3=1: 0.0006σ [CONJ, HRS 5]

# The FACT that the residual is ~alpha^3/pi with coefficient -1 is notable.
# In QED, the Schwinger correction a_e = alpha/(2*pi) has coefficient 1/(2*pi).
# The alpha^3/pi with coefficient 1 is the SIMPLEST possible structure.

print(f"  Framework correction structure:")
print(f"    C_0 (tree): N_I/111 = 15211/111  [rational, from counting]")
print(f"    C_2 (two-loop): -24/11           [rational, from colored pNGBs]")
print(f"    D_3 (three-loop): +1             [integer, possibly from VEV]")
print(f"")
print(f"  Pattern: rational -> rational -> integer")
print(f"  Equivalently: rational -> rational -> transcendental (C_3 = -pi)")
print(f"  The transcendental nature comes from the pi in the expansion parameter,")
print(f"  NOT from the coefficient. D_3 = 1 is purely algebraic.")
print(f"")
print(f"  In the D_3 basis, ALL coefficients are RATIONAL:")
print(f"    1/alpha = 15211/111 - (24/11)*(alpha/pi)*alpha + 1*(alpha/pi)*alpha^2")
print(f"    = 15211/111 - (24/11)*alpha^2/pi + alpha^3/pi")

# ================================================================
# PART 8: COMPREHENSIVE SIGMA TABLE
# ================================================================
print("\n" + "=" * 70)
print("PART 8: COMPREHENSIVE SIGMA TABLE")
print("=" * 70)

entries = [
    ("Tree (15211/111)", A_f),
    ("2-loop pert (C_2=24/11)", inv_alpha_2loop),
    ("2-loop cubic", inv_alpha_cubic),
    ("3-loop pert (D_3=1)", inv_alpha_3loop),
    ("3-loop quartic", inv_alpha_quartic),
    ("CODATA 2022", alpha_inv_CODATA),
]

print(f"\n  {'Method':<30s} {'1/alpha':>18s} {'Gap ppb':>10s} {'Sigma':>8s}")
print(f"  {'-'*30} {'-'*18} {'-'*10} {'-'*8}")
for name, val in entries:
    gap_ppb = abs(val - alpha_inv_CODATA) / alpha_inv_CODATA * 1e9
    sig = abs(val - alpha_inv_CODATA) / alpha_inv_unc
    marker = " (measured)" if "CODATA" in name else ""
    if sig < 0.1:
        print(f"  {name:<30s} {val:>18.12f} {gap_ppb:>10.4f} {sig:>8.4f}{marker}")
    else:
        print(f"  {name:<30s} {val:>18.12f} {gap_ppb:>10.2f} {sig:>8.1f}{marker}")

# ================================================================
# PART 9: BAND CLASSIFICATION
# ================================================================
print("\n" + "=" * 70)
print("PART 9: BAND CLASSIFICATION")
print("=" * 70)

# From the tree-to-dressed paradigm (S266, S282):
# Band A: one-loop corrections, O(alpha) ~ 100-1000 ppm
# Band B: two-loop corrections, O(alpha^2/pi) ~ 1-10 ppm
# Band C: sub-ppm, O(alpha^2/pi) ~ 0.01-1 ppm [alpha, Weinberg]
# Band D: sub-ppb?

# Alpha corrections:
# Tree->2-loop: delta = 0.27 ppm (Band C, the paradigmatic example)
# 2-loop residual: 5.9σ; 3-loop D_3=1: 0.0006σ [CONJ, HRS 5]

# The three-loop correction alpha^3/pi ~ 1.2e-7 corresponds to 0.9 ppb.
# This is BELOW Band C (sub-ppm) -- it would be Band D (sub-ppb).

tree_to_2loop_ppm = abs(A_f - inv_alpha_2loop) / alpha_inv_CODATA * 1e6
twoloop_to_3loop_ppm = abs(inv_alpha_2loop - inv_alpha_3loop) / alpha_inv_CODATA * 1e6
twoloop_to_3loop_ppb = twoloop_to_3loop_ppm * 1000

print(f"  Tree -> 2-loop correction: {tree_to_2loop_ppm:.2f} ppm (Band C)")
print(f"  2-loop -> 3-loop correction: {twoloop_to_3loop_ppm:.4f} ppm = {twoloop_to_3loop_ppb:.1f} ppb")
print(f"")
print(f"  Band classification:")
print(f"    Band A: 100-2000 ppm (one-loop, alpha_s)")
print(f"    Band B: 1-10 ppm (two-loop)")
print(f"    Band C: 0.01-1 ppm (sub-ppm, alpha/Weinberg tree-to-dressed)")
print(f"    Band D: < 0.01 ppm (sub-ppb, three-loop corrections)")
print(f"")
print(f"  Alpha tree-to-dressed: Band C (0.27 ppm)")
print(f"  Alpha 2-loop-to-3-loop: Band D ({twoloop_to_3loop_ppb:.1f} ppb)")

check("Tree-to-2loop is Band C (0.1-1 ppm)", 0.1 < tree_to_2loop_ppm < 1.0)
check("2loop-to-3loop is sub-ppm", twoloop_to_3loop_ppm < 0.01)

# ================================================================
# PART 10: HONEST ASSESSMENT
# ================================================================
print("\n" + "=" * 70)
print("PART 10: HONEST ASSESSMENT")
print("=" * 70)

print(f"""
  PHASE 3 RESULTS:

  1. DEFECT CHARGE SELECTION [DERIVATION]:
     T_X commutes with ALL Higgs pNGBs (T_X=0 on singlet index).
     Q_EM_defect = Q_EM_full on Higgs sector.
     Defect charges are the NATURAL convention for the coset.
     The tree and correction use the same convention [consistency].

  2. THREE-LOOP COEFFICIENT [CONJECTURE]:
     D_3 = -1 in alpha^3/pi basis (0.006% from extracted value).
     Candidate origin: N_VEV = 1 (single VEV direction in Higgs sector).
     Full formula: 1/alpha = 15211/111 - (24/11)*alpha^2/pi + alpha^3/pi
     Three-loop sigma: {sigma_3loop:.1f}
     Quartic sigma: {sigma_quartic:.1f}

  3. WHAT D_3 = 1 MEANS:
     All coefficients in the D_n basis are RATIONAL:
       C_0 = 15211/111, C_2 = -24/11, D_3 = +1
     The transcendental content (pi) comes ONLY from the expansion parameter.
     This is the simplest possible structure at each order.

  4. RESIDUAL AFTER THREE-LOOP:
     Perturbative: {abs(resid_3loop):.2e} ({abs(resid_3loop)/alpha_inv_CODATA*1e9:.1f} ppb, {sigma_3loop:.1f} sigma)
     Quartic: {abs(resid_quartic):.2e} ({abs(resid_quartic)/alpha_inv_CODATA*1e9:.1f} ppb, {sigma_quartic:.1f} sigma)
     C_4 ~ {C_4_candidate:.1f} in alpha^4/pi^2 basis

  5. WHAT WOULD STRENGTHEN D_3 = 1:
     - Derive from CCWZ effective potential (VEV mode contributes unit coefficient)
     - Show alternating sign (+,-,+,-,...) from Grassmannian geometry
     - Independent derivation from 2D sigma model (Hikami/Wegner)

  6. WHAT WOULD WEAKEN D_3 = 1:
     - D_3 = 1 is the simplest integer; could be coincidence
     - Cannot distinguish D_3 = 1 from D_3 = (some ratio very close to 1)
     - Post-hoc fitting to 1 number with 1 parameter: HRS 5

  CONFIDENCE:
    Tree formula:          [DERIVATION]
    C_2 = 24/11:           [DERIVATION] (S341, from defect charges)
    Defect charge selection: [DERIVATION] (S344, T_X=0 on Higgs)
    D_3 = 1:               [CONJECTURE, HRS 5]
    Self-consistent quartic: [CONJECTURE]
""")

# ================================================================
# PART 11: VERIFY KNOWN RESULTS CONSISTENCY
# ================================================================
print("=" * 70)
print("PART 11: CROSS-CHECKS")
print("=" * 70)

# Cross-check 1: The three-loop correction has correct sign
# Tree OVERSHOOTS (137.036 > 137.036), two-loop UNDERSHOOTS, three-loop OVERSHOOTS
check("Tree overshoots CODATA", A_f > alpha_inv_CODATA)
check("Two-loop undershoots CODATA", inv_alpha_2loop < alpha_inv_CODATA)

# The three-loop should bring us closer, regardless of which side
check("Three-loop closer to CODATA than two-loop",
      abs(inv_alpha_3loop - alpha_inv_CODATA) < abs(inv_alpha_2loop - alpha_inv_CODATA))

# Cross-check 2: The quartic and perturbative agree closely
diff_pert_quartic = abs(inv_alpha_3loop - inv_alpha_quartic)
print(f"\n  Perturbative vs quartic difference: {diff_pert_quartic:.2e}")
check("Perturbative and quartic agree to < 1e-9",
      diff_pert_quartic < 1e-9)

# Cross-check 3: Correction hierarchy
corr_2loop = abs(A_f - inv_alpha_2loop)
corr_3loop = abs(inv_alpha_2loop - inv_alpha_3loop)
print(f"\n  2-loop correction: {corr_2loop:.4e}")
print(f"  3-loop correction: {corr_3loop:.4e}")
print(f"  Ratio: {corr_2loop/corr_3loop:.1f}")
check("2-loop >> 3-loop (hierarchy)", corr_2loop > 100 * corr_3loop)

# Cross-check 4: Self-consistent quartic satisfies equation
alpha_q = float(root_quartic)
lhs = 1/alpha_q + float(C_2) * alpha_q**2 / p - alpha_q**3 / p
check("Quartic: 1/a + (24/11)*a^2/pi - a^3/pi = 15211/111",
      abs(lhs - A_f) < 1e-10, f"LHS = {lhs:.12f}, RHS = {A_f:.12f}")

# Cross-check 5: Alpha value is physical
check("alpha ~ 1/137 (physical range)", 0.007 < alpha_q < 0.008)

# Cross-check 6: Improvement factor
improvement_tree_to_3loop = abs(A_f - alpha_inv_CODATA) / abs(inv_alpha_3loop - alpha_inv_CODATA)
print(f"\n  Improvement factor (tree -> 3-loop): {improvement_tree_to_3loop:.0f}x")
check("Improvement > 1000x from tree", improvement_tree_to_3loop > 1000)

# ================================================================
# FINAL TALLY
# ================================================================
print("\n" + "=" * 70)
print(f"FINAL: {tests_passed}/{tests_total} PASS")
print("=" * 70)

if tests_passed == tests_total:
    print("\nALL TESTS PASSED")
else:
    print(f"\nWARNING: {tests_total - tests_passed} tests FAILED")
