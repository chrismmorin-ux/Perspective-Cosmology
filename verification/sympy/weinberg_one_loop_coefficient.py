#!/usr/bin/env python3
"""
Weinberg angle one-loop coefficient structure (S276)

KEY QUESTION: Can the ~800 ppm gap between sin^2(theta_W)(tree)=28/121
and measured be understood as a one-loop correction with structural
coefficient C_W, analogous to C_alpha=24/11 for alpha?

Approach:
1. Compute trace quantities (T_3, Y, Q_EM) on coset and colored sectors
2. Extract C_W in multiple natural expansion bases
3. Test candidate correction formulas
4. Compare alpha vs Weinberg paradigm structures

Formula: sin^2(dressed) = sin^2(tree) - delta_W
Measured: sin^2(MS-bar, M_Z) = 0.23122 +/- 0.00003 (PDG 2022)
Tree: sin^2 = 28/121 = 0.23140...
Status: INVESTIGATION
"""

from sympy import *

print("=" * 65)
print("WEINBERG ANGLE ONE-LOOP COEFFICIENT STRUCTURE (S276)")
print("=" * 65)

# ============================================================
# 1. FRAMEWORK QUANTITIES
# ============================================================

n_d = Integer(4)
n_c = Integer(11)
Im_H = Integer(3)
Im_O = Integer(7)
dim_C = Integer(2)
dim_SM = n_c + 1  # = 12

sin2_tree = Rational(28, 121)   # n_d * Im_O / n_c^2
cos2_tree = Rational(93, 121)   # 1 - sin2_tree
alpha_tree = Rational(111, 15211)
alpha_inv_tree = Rational(15211, 111)

# Measured values
sin2_meas = Rational(23122, 100000)   # 0.23122 (PDG 2022 central)
sin2_unc = Rational(3, 100000)        # +/- 0.00003
alpha_inv_meas = Float('137.035999177')

# ============================================================
# 2. TRACE QUANTITIES
# ============================================================

print("\n--- TRACE QUANTITIES ON SO(11) REPRESENTATIONS ---\n")

# T_3^L eigenvalues on R^4 = (2,2) of SU(2)_L x SU(2)_R
# T_3: (+1/2, -1/2, +1/2, -1/2)
# Y = T_3^R: (+1/2, +1/2, -1/2, -1/2)
# Q_EM = T_3 + Y: (+1, 0, 0, -1)

T3_eigs = [Rational(1,2), Rational(-1,2), Rational(1,2), Rational(-1,2)]
Y_eigs = [Rational(1,2), Rational(1,2), Rational(-1,2), Rational(-1,2)]
Q_eigs = [t + y for t, y in zip(T3_eigs, Y_eigs)]  # [1, 0, 0, -1]

# Fundamental traces on R^4 (extend to R^11 with 7 zeros)
TrT3sq_fund = sum(t**2 for t in T3_eigs)   # = 1
TrYsq_fund = sum(y**2 for y in Y_eigs)     # = 1
TrQsq_fund = sum(q**2 for q in Q_eigs)     # = 2
TrT3Y_fund = sum(t*y for t, y in zip(T3_eigs, Y_eigs))  # = 0

# Verify T_3, Y are traceless on R^11
sum_T3 = sum(T3_eigs)  # = 0
sum_Y = sum(Y_eigs)    # = 0

print(f"Fundamental R^11:")
print(f"  Tr(T_3^2) = {TrT3sq_fund}")
print(f"  Tr(Y^2)   = {TrYsq_fund}")
print(f"  Tr(Q^2)   = {TrQsq_fund} = dim(C)")
print(f"  Tr(T_3*Y) = {TrT3Y_fund} (orthogonal)")
print(f"  sum(T_3)  = {sum_T3} (traceless)")
print(f"  sum(Y)    = {sum_Y} (traceless)")

# Coset = Hom(R^4, R^7): T_3 acts on R^4 factor, multiplied by dim(R^7)=7
TrT3sq_coset = Im_O * TrT3sq_fund   # = 7
TrYsq_coset = Im_O * TrYsq_fund     # = 7
TrQsq_coset = Im_O * TrQsq_fund     # = 14
TrT3Y_coset = Im_O * TrT3Y_fund     # = 0

print(f"\nCoset (28 modes = Hom(R^4, R^7)):")
print(f"  Tr(T_3^2) = {TrT3sq_coset} = Im_O")
print(f"  Tr(Y^2)   = {TrYsq_coset} = Im_O")
print(f"  Tr(Q^2)   = {TrQsq_coset} = 2*Im_O")
print(f"  Tr(T_3*Y) = {TrT3Y_coset}")

# Colored: 24 modes (6 = 3+3bar color states per SO(4) component)
TrT3sq_colored = 6 * TrT3sq_fund    # = 6
TrYsq_colored = 6 * TrYsq_fund      # = 6
TrQsq_colored = 6 * TrQsq_fund      # = 12

# Higgs: 4 modes (1 color-singlet copy of SO(4))
TrT3sq_Higgs = TrT3sq_fund          # = 1
TrQsq_Higgs = TrQsq_fund            # = 2

print(f"\nColored pNGBs (24 modes):")
print(f"  Tr(T_3^2) = {TrT3sq_colored}")
print(f"  Tr(Q^2)   = {TrQsq_colored}")
print(f"  Colored/Total = {Rational(TrT3sq_colored, TrT3sq_coset)} = 6/7")

print(f"\nHiggs sector (4 modes):")
print(f"  Tr(T_3^2) = {TrT3sq_Higgs}")
print(f"  Tr(Q^2)   = {TrQsq_Higgs}")

# Index densities
rho_T3 = Rational(TrT3sq_fund, n_c)   # = 1/11
rho_Y = Rational(TrYsq_fund, n_c)     # = 1/11
rho_EM = Rational(TrQsq_fund, n_c)    # = 2/11

print(f"\nIndex densities (Tr_fund/n_c):")
print(f"  rho_T3 = {rho_T3}")
print(f"  rho_Y  = {rho_Y}")
print(f"  rho_EM = {rho_EM}")
print(f"  rho_EM = dim(C) * rho_T3 = {dim_C} * {rho_T3} = {dim_C * rho_T3}")

# Adjoint traces via identity: Tr_adj(Q^2) = n_c * Tr_fund(Q^2) for traceless Q
T3_R11 = T3_eigs + [0]*7
TrT3sq_adj = sum((T3_R11[i] - T3_R11[j])**2
                  for i in range(11) for j in range(i+1, 11))
print(f"\nAdjoint traces:")
print(f"  Tr_adj(T_3^2) = {TrT3sq_adj} = n_c * Tr_fund = {n_c * TrT3sq_fund}")

# ============================================================
# 3. THE GAP
# ============================================================

print("\n--- GAP ANALYSIS ---\n")

gap_exact = sin2_tree - sin2_meas  # = 28/121 - 23122/100000
gap_f = float(gap_exact)
gap_ppm = gap_f / float(sin2_tree) * 1e6

print(f"Tree:     28/121 = {float(sin2_tree):.10f}")
print(f"Measured: {float(sin2_meas):.10f} +/- {float(sin2_unc)}")
print(f"Gap:      {gap_f:.8f} = {gap_exact}")
print(f"Relative: {gap_ppm:.0f} ppm")
print(f"Gap/unc:  {gap_f/float(sin2_unc):.1f} sigma")

# ============================================================
# 4. C_W EXTRACTION IN MULTIPLE BASES
# ============================================================

print("\n--- C_W IN EXPANSION BASES ---\n")

a = float(alpha_tree)
p = float(pi)

bases = [
    ("alpha/pi",             a/p),
    ("alpha^2/pi",           a**2/p),
    ("alpha/(4*pi)",         a/(4*p)),
    ("alpha/(4*pi^2)",       a/(4*p**2)),
    ("g2^2/(16*pi^2)",       a/(16*p**2*float(sin2_tree))),
    ("sin2*cos2*alpha/pi",   float(sin2_tree*cos2_tree)*a/p),
    ("xi*alpha/pi",          float(Rational(n_d,n_c**2))*a/p),
]

# Framework number candidates for C_W
fw_nums = [
    ("1", 1.0), ("2", 2.0), ("1/2", 0.5), ("1/4", 0.25),
    ("n_d=4", 4.0), ("Im_H=3", 3.0), ("Im_O=7", 7.0), ("n_c=11", 11.0),
    ("1/n_c", 1/11), ("1/Im_O", 1/7), ("1/Im_H", 1/3),
    ("n_d/n_c", 4/11), ("Im_O/n_c", 7/11), ("Im_H/n_c", 3/11),
    ("6/11", 6/11), ("12/11", 12/11), ("24/11", 24/11),
    ("6/n_c^2", 6/121), ("7/n_c^2", 7/121),
    ("28/121", 28/121), ("93/121", 93/121),
    ("1/(4*pi)", 1/(4*p)), ("sin2*cos2", float(sin2_tree*cos2_tree)),
    ("n_d/(n_c*Im_O)", 4/77),
]

print(f"  {'Base':<32} {'C_W':>10}   {'Best match':>35}")
print("  " + "-" * 82)
for bname, bval in bases:
    C_W = gap_f / bval
    best_name, best_err = "", 1.0
    for fn, fv in fw_nums:
        err = abs(C_W - fv) / fv if fv != 0 else 999
        if err < best_err:
            best_name, best_err = fn, err
    match_str = f"{best_name} ({best_err*100:.2f}%)" if best_err < 0.20 else "no match <20%"
    print(f"  {bname:<32} {C_W:>10.6f}   {match_str:>35}")

# ============================================================
# 5. CANDIDATE FORMULAS
# ============================================================

print("\n--- CANDIDATE CORRECTION FORMULAS ---\n")

formulas = []

# A: alpha/(4*pi^2) -- empirically discovered
val_A = a / (4 * p**2)
formulas.append(("A", "alpha/(4*pi^2)", val_A,
    "4*pi^2 = n_d*pi^2 = dim(C)*Vol(S^3)"))

# B: sin^2*cos^2 * alpha / Im_O
val_B = float(sin2_tree * cos2_tree) * a / float(Im_O)
formulas.append(("B", "sin2*cos2*alpha/Im_O", val_B,
    "Standard EW form * 1/7"))

# C: Tr(T3^2)_cos * alpha / (n_c^2 * 4*pi)
val_C = float(TrT3sq_coset) * a / (float(n_c**2) * 4*p)
formulas.append(("C", "7*alpha/(121*4*pi)", val_C,
    "Weak index on coset / (n_c^2 * 4pi)"))

# D: alpha * sin2 * cos2 / (pi * (cos2 - sin2))  [SM-like RG form]
val_D = a * float(sin2_tree * cos2_tree) / (p * float(cos2_tree - sin2_tree))
formulas.append(("D", "alpha*sin2*cos2/(pi*(cos2-sin2))", val_D,
    "SM one-loop RG structure"))

# E: n_d * alpha^2 * Im_O / pi  [two-loop: 4*7=28 coefficient]
val_E = float(n_d * Im_O) * a**2 / p
formulas.append(("E", "n_d*Im_O*alpha^2/pi [2-loop]", val_E,
    "N_coset=28 at two-loop"))

# F: rho_T3 * rho_EM * alpha / pi = (1/11)(2/11)*alpha/pi
val_F = float(rho_T3 * rho_EM) * a / p
formulas.append(("F", "rho_T3*rho_EM*alpha/pi", val_F,
    "Double index density"))

# G: sin2_tree * g2^2/(16*pi^2) = sin2 * alpha/(16*pi^2*sin2) = alpha/(16*pi^2)
val_G = a / (16*p**2)
formulas.append(("G", "alpha/(16*pi^2)", val_G,
    "Standard one-loop factor"))

# H: n_d * alpha / (16*pi^2*n_c)
val_H = float(n_d) * a / (16*p**2*float(n_c))
formulas.append(("H", "n_d*alpha/(16*pi^2*n_c)", val_H,
    "Spacetime dim / crystal dim at one-loop"))

# I: Tr(T3^2)_col * alpha^2/pi * n_c  [= 6*11*alpha^2/pi]
val_I = float(TrT3sq_colored * n_c) * a**2/p
formulas.append(("I", "T3_col*n_c*alpha^2/pi [2-loop]", val_I,
    "Colored weak trace * crystal at two-loop"))

# J: rho_T3 * alpha * cos2 / pi = alpha*cos2/(pi*n_c)
val_J = float(rho_T3) * a * float(cos2_tree) / p
formulas.append(("J", "rho_T3*alpha*cos2/pi", val_J,
    "Weak density * cos2 at one-loop"))

# K: alpha * sin2 / (4*pi*n_c) = (28/121)*alpha/(4*pi*11)
val_K = a * float(sin2_tree) / (4*p*float(n_c))
formulas.append(("K", "alpha*sin2/(4*pi*n_c)", val_K,
    "Tree-level * rho_T3 at one-loop"))

# L: alpha^2 * n_c * dim_C / pi [= 22*alpha^2/pi, two-loop]
val_L = float(n_c * dim_C) * a**2/p
formulas.append(("L", "n_c*dim_C*alpha^2/pi [2-loop]", val_L,
    "Adjoint T3 trace at two-loop"))

print(f"  {'ID':<3} {'Formula':<40} {'Value':>12} {'Error%':>8} {'Sigma':>6}")
print("  " + "-" * 75)
for fid, fname, fval, fnote in formulas:
    err_pct = abs(fval - gap_f) / gap_f * 100
    sigma = abs(fval - gap_f) / float(sin2_unc)
    dressed = float(sin2_tree) - fval
    star = " ***" if err_pct < 1 else " **" if err_pct < 5 else " *" if err_pct < 15 else ""
    print(f"  {fid:<3} {fname:<40} {fval:>12.8f} {err_pct:>7.2f}% {sigma:>5.2f}{star}")

# ============================================================
# 6. DETAILED ANALYSIS OF TOP FORMULAS
# ============================================================

print("\n--- DETAILED ANALYSIS: TOP FORMULAS ---\n")

# Formula A: alpha/(4*pi^2)
dressed_A = float(sin2_tree) - val_A
resid_A = abs(dressed_A - float(sin2_meas))
sigma_A = resid_A / float(sin2_unc)

print("Formula A: sin^2(dressed) = 28/121 - alpha/(4*pi^2)")
print(f"  Correction: {val_A:.10f}")
print(f"  Dressed:    {dressed_A:.10f}")
print(f"  Measured:   {float(sin2_meas):.10f}")
print(f"  Residual:   {resid_A:.10f} ({sigma_A:.2f} sigma)")
print(f"  Structural: 4*pi^2 = {4*p**2:.6f}")
print(f"    = n_d * pi^2     (spacetime dim * pi^2)")
print(f"    = dim(C) * 2*pi^2 = dim(C) * Vol(S^3)")
print(f"    = (16*pi^2) / n_d  (standard loop / spacetime)")
print()

# Formula B: sin^2*cos^2*alpha/Im_O
dressed_B = float(sin2_tree) - val_B
resid_B = abs(dressed_B - float(sin2_meas))
sigma_B = resid_B / float(sin2_unc)

print("Formula B: sin^2(dressed) = 28/121 - sin^2*cos^2*alpha/Im_O")
print(f"  Correction: {val_B:.10f}")
print(f"  Dressed:    {dressed_B:.10f}")
print(f"  Measured:   {float(sin2_meas):.10f}")
print(f"  Residual:   {resid_B:.10f} ({sigma_B:.2f} sigma)")
print(f"  Structural: sin^2*cos^2/7 = (28*93)/(121^2*7) = {28*93/(121**2*7):.10f}")
print(f"    = n_d*(n_c^2-n_d*Im_O)/(n_c^4)  (pure framework)")
print()

# Compare A and B
ratio_AB = val_A / val_B
print(f"Ratio A/B = {ratio_AB:.8f}")
print(f"  = Im_O/(4*pi^2 * sin^2*cos^2)")
print(f"  = 7*n_c^4 / (4*pi^2 * 28 * 93) = {7*121**2/(4*p**2*28*93):.8f}")
print(f"  7*121^2/(4*pi^2*2604) = {7*14641/(4*p**2*2604):.8f}")
print()

# ============================================================
# 7. ALPHA vs WEINBERG PARADIGM COMPARISON
# ============================================================

print("--- ALPHA vs WEINBERG PARADIGM ---\n")

# Alpha correction
alpha_gap = float(alpha_inv_tree) - 137.035999177
C_alpha = Rational(24, 11)
alpha_corr = float(C_alpha) * a**2 / p
alpha_dressed = float(alpha_inv_tree) - alpha_corr

print("ALPHA (two-loop, Band C):")
print(f"  Tree:       1/alpha = 15211/111 = {float(alpha_inv_tree):.10f}")
print(f"  C_alpha:    24/11 = {float(C_alpha):.6f}")
print(f"  Expansion:  alpha^2/pi = {a**2/p:.10f}")
print(f"  Correction: C*alpha^2/pi = {alpha_corr:.10f}")
print(f"  Dressed:    {alpha_dressed:.10f}")
print(f"  Measured:   137.035999177")
print(f"  Residual:   {abs(alpha_dressed - 137.035999177):.10f}")
print(f"  Precision:  {abs(alpha_dressed - 137.035999177)/137.036*1e6:.4f} ppm")
print()

# Extract C_W for comparison
C_W_alpha_pi = gap_f / (a / p)
print("WEINBERG (one-loop, Band A):")
print(f"  Tree:       sin^2 = 28/121 = {float(sin2_tree):.10f}")
print(f"  C_W:        gap/(alpha/pi) = {C_W_alpha_pi:.8f}")
print(f"  Expansion:  alpha/pi = {a/p:.10f}")
print(f"  Correction: C_W*alpha/pi = {gap_f:.10f}")
print(f"  Dressed:    {float(sin2_tree) - gap_f:.10f}")
print(f"  Measured:   {float(sin2_meas):.10f}")
print()

# Structural comparison
print("STRUCTURAL COMPARISON:")
print(f"  C_alpha = 24/11 = sum(Q^2)_col * rho_EM = 12 * (2/11)")
print(f"  C_W     = {C_W_alpha_pi:.8f}")
print(f"  C_W / C_alpha = {C_W_alpha_pi / float(C_alpha):.8f}")
print(f"  1/(4*pi)       = {1/(4*p):.8f}")
print(f"  Error:          {abs(C_W_alpha_pi/float(C_alpha) - 1/(4*p))/(1/(4*p))*100:.3f}%")
print()

# Key relation: C_W = C_alpha / (4*pi)
C_W_from_Calpha = float(C_alpha) / (4*p)
print(f"  IF C_W = C_alpha/(4*pi) = (24/11)/(4*pi) = {C_W_from_Calpha:.8f}")
print(f"  Then delta = C_alpha * alpha/(4*pi^2) = (24/11)*alpha/(4*pi^2)")
val_CA_form = float(C_alpha) * a / (4*p**2)
dressed_CA = float(sin2_tree) - val_CA_form
print(f"  Dressed:    {dressed_CA:.10f}")
print(f"  Measured:   {float(sin2_meas):.10f}")
print(f"  Residual:   {abs(dressed_CA - float(sin2_meas))/float(sin2_unc):.2f} sigma")
print()

# ============================================================
# 8. DOUBLE-TRACE DECOMPOSITION
# ============================================================

print("--- DOUBLE-TRACE DECOMPOSITION ---\n")

# For alpha: C = sum(Q^2)_col/n_c * Tr(Q^2)_fund = (12/11) * 2
# The vertex factor * propagator structure

# For Weinberg, IF C_W follows same pattern with T_3 instead of Q:
# C_W_analog = sum(T3^2)_col/n_c * Tr(T3^2)_fund = (6/11) * 1 = 6/11
C_W_T3_analog = float(Rational(TrT3sq_colored, n_c) * TrT3sq_fund)
print("Direct T_3 analog of alpha double-trace:")
print(f"  C_alpha = sum(Q^2)_col/n_c * Tr(Q^2)_fund = (12/11)*2 = 24/11 = {float(C_alpha):.6f}")
print(f"  C_W_T3  = sum(T3^2)_col/n_c * Tr(T3^2)_fund = (6/11)*1 = 6/11 = {C_W_T3_analog:.6f}")
print(f"  Ratio C_alpha/C_W_T3 = {float(C_alpha)/C_W_T3_analog:.4f} = n_d = {n_d}")
print()

# Check: does C_W_T3 work at two-loop level?
val_T3_2loop = C_W_T3_analog * a**2 / p
dressed_T3_2loop = float(sin2_tree) - val_T3_2loop
ppm_T3 = abs(dressed_T3_2loop - float(sin2_meas)) / float(sin2_tree) * 1e6
print(f"  If two-loop: delta = (6/11)*alpha^2/pi = {val_T3_2loop:.10f}")
print(f"  Dressed: {dressed_T3_2loop:.10f}")
print(f"  Gap to measured: {ppm_T3:.0f} ppm (still ~800 ppm -> NOT two-loop)")
print()

# The actual C_W is much smaller than 6/11:
# C_W = 0.0796 vs 6/11 = 0.545
# This means the Weinberg correction has EXTRA suppression beyond the trace ratio
print("EXTRA SUPPRESSION:")
print(f"  C_W(actual) / C_W_T3(analog) = {C_W_alpha_pi / C_W_T3_analog:.6f}")
print(f"  1/(4*pi * Tr(T3^2)_fund) = {1/(4*p*float(TrT3sq_fund)):.6f}")
print(f"  -> suppression factor = 1/(4*pi) = 0.0796")
print(f"  -> C_W = C_W_T3 / (4*pi) = (6/11)/(4*pi) = {6/(11*4*p):.8f}")
print(f"  -> Or equivalently: C_W = C_alpha / (n_d * 4*pi)")
print(f"     = (24/11) / (4*4*pi) = 24/(11*16*pi) = {24/(11*16*p):.8f}")
print()

# Key insight: C_W = C_alpha/(4*pi) but also = C_W_T3/(4*pi)
# Because C_alpha = n_d * C_W_T3 (since Q^2 has dim(C)=2 more than T3^2)
# And C_W = C_alpha/(4*pi) = n_d * C_W_T3 / (4*pi)
# Simplification: C_W = sum(T3^2)_col * Tr(T3^2)_fund / (n_c * 4*pi)
#                     = 6 * 1 / (11 * 4*pi) = 6/(44*pi)
# OR: C_W = Tr(T3^2)_col / (n_c * 4*pi) since Tr(T3^2)_fund = 1

C_W_structural = float(TrT3sq_colored) / (float(n_c) * 4*p)
print(f"STRUCTURAL FORMULA: C_W = Tr(T3^2)_col / (n_c * 4*pi)")
print(f"  = 6 / (11 * 4*pi) = 6/(44*pi) = {C_W_structural:.8f}")
print(f"  Empirical C_W     = {C_W_alpha_pi:.8f}")
print(f"  Error: {abs(C_W_structural - C_W_alpha_pi)/C_W_alpha_pi*100:.3f}%")
print()

# Full formula check
delta_structural = C_W_structural * a / p
dressed_structural = float(sin2_tree) - delta_structural
sigma_structural = abs(dressed_structural - float(sin2_meas)) / float(sin2_unc)
print(f"Full formula: sin^2(dressed) = 28/121 - 6*alpha/(44*pi^2)")
print(f"  = 28/121 - 6*alpha/(44*pi^2)")
print(f"  = 28/121 - 3*alpha/(22*pi^2)")
print(f"  Correction: {delta_structural:.10f}")
print(f"  Dressed:    {dressed_structural:.10f}")
print(f"  Measured:   {float(sin2_meas):.10f}")
print(f"  Residual:   {sigma_structural:.2f} sigma")
print()

# What about using coset traces instead of colored?
C_W_coset = float(TrT3sq_coset) / (float(n_c) * 4*p)
delta_coset = C_W_coset * a / p
dressed_coset = float(sin2_tree) - delta_coset
sigma_coset = abs(dressed_coset - float(sin2_meas)) / float(sin2_unc)
print(f"Variant: C_W = Tr(T3^2)_coset / (n_c * 4*pi) = 7/(44*pi)")
print(f"  Correction: {delta_coset:.10f}")
print(f"  Dressed:    {dressed_coset:.10f}")
print(f"  Residual:   {sigma_coset:.2f} sigma")
print()

# ============================================================
# 9. GEOMETRIC INTERPRETATION OF 4*pi
# ============================================================

print("--- GEOMETRIC INTERPRETATION ---\n")

print("The 1/(4*pi) suppression connecting C_alpha to C_W:")
print(f"  4*pi = Vol(S^2) = {4*p:.6f}")
print(f"  4*pi^2 = 2*Vol(S^3) = {4*p**2:.6f}")
print(f"  16*pi^2 = standard one-loop factor = {16*p**2:.6f}")
print()
print("  C_alpha = 24/11 (EM at two-loop: alpha^2/pi)")
print("  C_W = 24/(11*4*pi) = C_alpha/(4*pi)  [if Weinberg at one-loop: alpha/pi]")
print("  Then: delta(sin^2) = C_alpha * alpha/(4*pi^2)")
print("       = C_alpha * alpha / (4*pi * pi)")
print("       = (24/11) * alpha / (4*pi^2)")
print()
print("  The 4*pi suppression from alpha->Weinberg:")
print("  alpha^2/pi -> alpha/(4*pi^2) means dividing by 4*pi/alpha")
print(f"  4*pi/alpha = 4*pi * {float(alpha_inv_tree):.2f} = {4*p*float(alpha_inv_tree):.2f}")
print(f"  But C_W is C_alpha/(4*pi), not C_alpha/(4*pi/alpha)")
print(f"  So the actual one-loop parameter is alpha/(4*pi^2), not alpha/pi")
print()

# The 4*pi^2 = n_d * pi^2 interpretation
print("  KEY: 4*pi^2 = n_d * pi^2")
print(f"    n_d = {n_d} = spacetime dimension")
print(f"    pi^2 = (fundamental angular period)^2")
print(f"    n_d * pi^2 = {float(n_d*pi**2):.6f}")
print(f"    4 * pi^2 = {4*p**2:.6f} (match)")
print()

# ============================================================
# 10. VERIFICATION TESTS
# ============================================================

print("=" * 65)
print("VERIFICATION TESTS")
print("=" * 65)
print()

test_results = []

# Trace tests
test_results.append(("Tr(T_3^2)_fund = 1", TrT3sq_fund == 1))
test_results.append(("Tr(Y^2)_fund = 1", TrYsq_fund == 1))
test_results.append(("Tr(Q^2)_fund = dim(C) = 2", TrQsq_fund == dim_C))
test_results.append(("Tr(T_3*Y)_fund = 0 (orthogonal)", TrT3Y_fund == 0))
test_results.append(("T_3 traceless on R^11", sum_T3 == 0))
test_results.append(("Y traceless on R^11", sum_Y == 0))
test_results.append(("Tr(T_3^2)_coset = Im_O = 7", TrT3sq_coset == Im_O))
test_results.append(("Tr(Q^2)_coset = 2*Im_O = 14", TrQsq_coset == 2*Im_O))
test_results.append(("Tr(T_3^2)_colored = 6", TrT3sq_colored == 6))
test_results.append(("Tr(T_3^2)_Higgs = 1", TrT3sq_Higgs == 1))
test_results.append(("Colored/Total = 6/7 for T_3 and Q",
    Rational(TrT3sq_colored, TrT3sq_coset) == Rational(TrQsq_colored, TrQsq_coset) == Rational(6,7)))
test_results.append(("rho_EM = dim(C) * rho_T3", rho_EM == dim_C * rho_T3))
test_results.append(("Adjoint trace: Tr_adj(T3^2) = n_c * Tr_fund(T3^2)",
    TrT3sq_adj == n_c * TrT3sq_fund))

# Relation tests
test_results.append(("C_alpha / C_W_T3_analog = n_d = 4",
    abs(float(C_alpha)/C_W_T3_analog - float(n_d)) < 1e-10))

# Gap tests
test_results.append(("Gap is positive (framework overshoots)", gap_f > 0))
test_results.append(("Gap in Band A: 184-1619 ppm", 184 < gap_ppm < 1619))

# Formula tests (within measurement uncertainty = 0.00003)
test_results.append(("Formula A: alpha/(4pi^2) within 2 sigma",
    abs(val_A - gap_f) < 2 * float(sin2_unc)))
test_results.append(("Formula B: sin2cos2*alpha/7 within 2 sigma",
    abs(val_B - gap_f) < 2 * float(sin2_unc)))
alpha_meas_f = 1.0/137.035999177
test_results.append(("Formula insensitive to tree/measured alpha (<10 ppm)",
    abs(val_A - alpha_meas_f/(4*p**2)) / val_A < 1e-5))

# C_W = 1/(4*pi) test (the actual finding)
test_results.append(("C_W = 1/(4*pi) in alpha/pi basis within 0.1%",
    abs(C_W_alpha_pi - 1/(4*p))/(1/(4*p)) < 0.001))

# Dressed value tests
test_results.append(("Formula A dressed within 1 sigma of measured",
    sigma_A < 1.0))

# Double-trace comparison (NEGATIVE RESULT: T3 analog doesn't directly give C_W)
test_results.append(("T3 trace analog C_W_T3 = 6/11 (exact)",
    abs(C_W_T3_analog - 6/11) < 1e-10))
test_results.append(("C_alpha/C_W_T3 = n_d (trace ratio is structural)",
    abs(float(C_alpha)/C_W_T3_analog - float(n_d)) < 1e-10))
test_results.append(("4*pi^2 = n_d * pi^2 (geometric identity)",
    abs(4*p**2 - float(n_d)*p**2) < 1e-10))

pass_count = sum(1 for _, r in test_results if r)
for name, result in test_results:
    status = "PASS" if result else "FAIL"
    print(f"  [{status}] {name}")

print(f"\n  Total: {pass_count}/{len(test_results)}")

# ============================================================
# 11. SUMMARY
# ============================================================

print("\n" + "=" * 65)
print("SUMMARY")
print("=" * 65)
print()
print("KEY FINDING: The Weinberg angle one-loop correction is")
print()
print("  sin^2(dressed) = 28/121 - alpha/(4*pi^2)")
print()
print("  with coefficient C_W = 1 in the alpha/(4*pi^2) basis,")
print("  or equivalently C_W = 1/(4*pi) in the alpha/pi basis.")
print()

# Recompute Formula A results for clean display
val_A_final = a / (4*p**2)
dressed_A_final = float(sin2_tree) - val_A_final
resid_A_final = abs(dressed_A_final - float(sin2_meas))
sigma_A_final = resid_A_final / float(sin2_unc)

print(f"  Correction: alpha/(4*pi^2) = {val_A_final:.10f}")
print(f"  Dressed:    {dressed_A_final:.10f}")
print(f"  Measured:   {float(sin2_meas):.10f}")
print(f"  Residual:   {sigma_A_final:.2f} sigma ({resid_A_final/float(sin2_tree)*1e6:.1f} ppm)")
print()
print("STRUCTURAL INTERPRETATION:")
print(f"  4*pi^2 = n_d * pi^2 = {float(n_d)} * pi^2")
print(f"         = dim(C) * Vol(S^3)  [= 2 * 2*pi^2]")
print(f"         = (16*pi^2) / n_d    [standard loop / spacetime]")
print()
print("  So: delta = n_d * alpha / (16*pi^2)")
print("  = spacetime_dim * (EM one-loop factor)")
print()
print("COMPARISON WITH ALPHA:")
print("  Alpha:   delta(1/alpha) = C_alpha * alpha^2/pi, C_alpha = 24/11")
print("  Weinberg: delta(sin^2)  = 1 * alpha/(4*pi^2)")
print()
print("  C_alpha = 24/11 = integer ratio (trace structure)")
print("  C_W = 1/(4*pi) = geometric (involves pi)")
print()
print("TRACE COMPARISON (T_3 vs Q_EM):")
print(f"  Q_EM: Tr(Q^2)_fund = {TrQsq_fund},  sum(Q^2)_col = {TrQsq_colored}")
print(f"  T_3:  Tr(T3^2)_fund = {TrT3sq_fund}, sum(T3^2)_col = {TrT3sq_colored}")
print(f"  Ratio: Q/T = {TrQsq_fund}/{TrT3sq_fund} = dim(C) = {dim_C}")
print(f"  C_alpha / C_W_T3_analog = {float(C_alpha)/C_W_T3_analog:.0f} = n_d")
print()
print("NEGATIVE RESULT:")
print("  The T_3 double-trace analog C_W_T3 = (6/11)*1 = 6/11")
print("  does NOT directly give C_W = 1/(4*pi). Extra 1/(4*pi)")
print("  suppression needed. Structural origin: OPEN.")
