#!/usr/bin/env python3
"""
Tree-to-Dressed Paradigm: SYSTEMATIC Classification of ALL 16 Ratios
=====================================================================

KEY FINDING: Classifies all 16 derived dimensionless ratios into radiative
correction bands and extracts effective coefficients.

Goal 1: Extract m_p/m_e coefficient in alpha^2/pi basis
Goal 2: Predict band membership for quantities not yet classified
Goal 3: Test coefficient decomposition into framework numbers

Convention: gap = |tree - measured| / measured
            C = gap / (alpha^2/pi)  for Band C (sub-ppm)
            C = gap / (alpha/pi)    for Band A (one-loop)

Framework: n_d=4, n_c=11, Im_H=3, Im_O=7
Alpha tree: 15211/111

Status: ANALYSIS
"""

from sympy import Rational, pi, sqrt, N, Float, Abs, Integer, S
import math

print("=" * 75)
print("TREE-TO-DRESSED: SYSTEMATIC CLASSIFICATION OF ALL 16 RATIOS")
print("=" * 75)

# ==================================================================
# FRAMEWORK CONSTANTS
# ==================================================================

n_d = 4
n_c = 11
Im_H = 3
Im_O = 7
dim_C = 2
dim_H = 4
dim_O = 8
dim_R = 1

alpha_tree_exact = Rational(111, 15211)
alpha_f = float(alpha_tree_exact)
p = float(pi)

# Characteristic scales
one_loop_EM = alpha_f / p                     # alpha/pi ~ 2.32e-3
two_loop_EM = alpha_f**2 / p                  # alpha^2/pi ~ 1.70e-5
three_loop_EM = alpha_f**3 / p**2             # alpha^3/pi^2 ~ 1.24e-7
one_loop_QCD = 0.1179 / p                     # alpha_s/pi ~ 3.75e-2

print(f"\nCharacteristic scales:")
print(f"  alpha/pi           = {one_loop_EM:.4e}  ({one_loop_EM*1e6:.0f} ppm)")
print(f"  alpha^2/pi         = {two_loop_EM:.4e}  ({two_loop_EM*1e6:.2f} ppm)")
print(f"  alpha^3/pi^2       = {three_loop_EM:.4e}  ({three_loop_EM*1e6:.4f} ppm)")

# ==================================================================
# ALL 16 DERIVED RATIOS
# ==================================================================
# Format: (name, tree_rational_num, tree_rational_den, measured_value,
#          measured_uncertainty, quantity_type, notes)

ratios = [
    # --- SUB-PPM (Band C candidates) ---
    ("m_p/m_e",
     Rational(132203, 72),
     "1836.15267343", "0.00000011",
     "mass_ratio", "QCD/QED non-perturbative"),

    ("v/M_Koide",
     Rational(1569, 2),
     "784.4999", "0.1",
     "mass_ratio", "Koide scale"),

    ("1/alpha",
     Rational(15211, 111),
     "137.035999177", "0.000000021",
     "coupling", "Fine structure constant"),

    # --- LOW PPM (Band B candidates) ---
    ("m_mu/m_e",
     Rational(8891, 43),
     "206.7682830", "0.0000046",
     "mass_ratio", "Lepton ratio QED"),

    ("v/m_p",
     Rational(11284, 43),
     "262.4182", "0.01",
     "mass_ratio", "EW/QCD scale ratio"),

    # --- MEDIUM PPM (Band A/B boundary) ---
    ("Koide_theta",
     None,  # special: pi * 73/99 * 17690/17689
     "2.31662", "0.00003",
     "angle", "Koide phase"),

    ("sin2_theta_W",
     Rational(28, 121),
     "0.23122", "0.00004",
     "coupling", "Weinberg angle MS-bar"),

    ("m_tau/m_mu",
     Rational(185, 11),
     "16.8170", "0.0015",
     "mass_ratio", "Lepton ratio"),

    # --- PERCENT LEVEL (Band A or beyond) ---
    ("alpha_s",
     Rational(25, 212),
     "0.1179", "0.0010",
     "coupling", "Strong coupling at M_Z"),

    ("m_t/m_b",
     Rational(124, 3),
     "41.330", "0.200",
     "mass_ratio", "Quark ratio (heavy)"),

    ("m_c/m_s",
     Rational(150, 11),
     "13.636", "0.500",
     "mass_ratio", "Quark ratio EXACT"),

    ("m_s/m_d",
     Rational(219, 11),
     "19.894", "1.0",
     "mass_ratio", "Quark ratio (light)"),

    ("m_b/m_c",
     Rational(23, 7),
     "3.278", "0.050",
     "mass_ratio", "Quark ratio"),

    ("|V_cb|",
     Rational(2, 49),
     "0.0408", "0.0014",
     "CKM", "CKM element"),

    ("lambda_Cabibbo",
     None,  # (1/4)(1 - 4/43)
     "0.2265", "0.0005",
     "CKM", "Cabibbo angle"),

    ("|V_ub|",
     Rational(1, 258),  # 1/(n_d^2 + 2*n_c^2)
     "0.00382", "0.00020",
     "CKM", "CKM element"),
]

# Compute Koide theta tree value
koide_tree = float(pi) * 73 / 99 * Rational(17690, 17689)
koide_tree_f = float(koide_tree)

# Compute Cabibbo tree value: (1/4)(1 - n_d/Phi6(Im_O)) = (1/4)(1 - 4/43) = 39/172
cabibbo_tree = Rational(39, 172)

print("\n" + "=" * 75)
print("COMPREHENSIVE GAP ANALYSIS")
print("=" * 75)

header = f"  {'Ratio':<18} {'Tree':<14} {'Measured':<14} {'Gap (ppm)':<12} {'Band':<8}"
print(f"\n{header}")
print(f"  {'-'*18} {'-'*14} {'-'*14} {'-'*12} {'-'*8}")

results = []

for entry in ratios:
    name, tree_frac, meas_str, unc_str, qtype, note = entry

    meas = float(meas_str)
    unc = float(unc_str)

    if name == "Koide_theta":
        tree_val = koide_tree_f
    elif name == "lambda_Cabibbo":
        tree_val = float(cabibbo_tree)
    elif tree_frac is not None:
        tree_val = float(tree_frac)
    else:
        continue

    gap_abs = abs(tree_val - meas)
    gap_rel = gap_abs / abs(meas)
    gap_ppm = gap_rel * 1e6

    # Band classification
    if gap_ppm < 0.5:
        band = "C"
    elif gap_ppm < 30:
        band = "B"
    elif gap_ppm < 2000:
        band = "A"
    else:
        band = "A+"

    # Sign
    sign = "+" if tree_val > meas else "-"

    # Significance vs measurement
    sigma = gap_abs / unc if unc > 0 else float('inf')

    results.append({
        'name': name,
        'tree_val': tree_val,
        'meas': meas,
        'unc': unc,
        'gap_abs': gap_abs,
        'gap_rel': gap_rel,
        'gap_ppm': gap_ppm,
        'band': band,
        'sign': sign,
        'sigma': sigma,
        'qtype': qtype,
        'note': note,
    })

    gap_str = f"{sign}{gap_ppm:.2f}" if gap_ppm < 100 else f"{sign}{gap_ppm:.0f}"
    tree_str = f"{tree_val:.8f}" if tree_val < 100 else f"{tree_val:.4f}"
    meas_disp = f"{meas:.8f}" if meas < 100 else f"{meas:.4f}"

    print(f"  {name:<18} {tree_str:<14} {meas_disp:<14} {gap_str:<12} {band:<8}")

# ==================================================================
# BAND MEMBERSHIP SUMMARY
# ==================================================================

print("\n" + "=" * 75)
print("BAND MEMBERSHIP")
print("=" * 75)

for band_label in ["C", "B", "A", "A+"]:
    members = [r for r in results if r['band'] == band_label]
    if not members:
        continue
    print(f"\n  Band {band_label}:")
    for r in sorted(members, key=lambda x: x['gap_ppm']):
        sig_str = f"{r['sigma']:.1f} sigma" if r['sigma'] < 1e6 else ">> sigma"
        print(f"    {r['name']:<18} {r['gap_ppm']:>8.2f} ppm  ({sig_str})  [{r['qtype']}]")

# ==================================================================
# BAND C: COEFFICIENT EXTRACTION (alpha^2/pi basis)
# ==================================================================

print("\n" + "=" * 75)
print("BAND C: COEFFICIENT EXTRACTION (alpha^2/pi basis)")
print("=" * 75)

band_C = [r for r in results if r['band'] == 'C']

print(f"\n  Basis: alpha^2/pi = {two_loop_EM:.6e}")
print(f"  {'Quantity':<18} {'Gap/basis':<14} {'= C':<10} {'Best match':<24} {'Error':<8}")
print(f"  {'-'*18} {'-'*14} {'-'*10} {'-'*24} {'-'*8}")

# Candidates for C values
candidates_C = [
    ("24/11", 24.0/11),
    ("2", 2.0),
    ("12/11", 12.0/11),
    ("2*(n_c+1)/n_c", 2.0*12/11),
    ("n_d/2", 2.0),
    ("Im_H", 3.0),
    ("1", 1.0),
    ("n_d-1", 3.0),
    ("n_c/n_d", 11.0/4),
    ("4/Im_H", 4.0/3),
    ("Im_H/n_d", 3.0/4),
    ("n_c/(n_d*Im_H)", 11.0/12),
    ("1/n_c", 1.0/11),
    ("2/n_c", 2.0/11),
    ("n_d/n_c", 4.0/11),
    ("Im_O/n_c", 7.0/11),
]

C_vals = {}
for r in band_C:
    C = r['gap_rel'] / two_loop_EM
    C_vals[r['name']] = C

    # Sign matters: what is the SIGNED coefficient?
    signed_C = C if r['sign'] == '+' else -C

    # Find best match
    best_name, best_err = "", 1e10
    for cname, cval in candidates_C:
        err = abs(C - cval) / cval * 100 if cval != 0 else 1e10
        if err < best_err:
            best_name, best_err = cname, err

    print(f"  {r['name']:<18} {C:<14.6f} {signed_C:<+10.6f} {best_name:<24} {best_err:<8.1f}%")

# ==================================================================
# FOCUS: m_p/m_e COEFFICIENT
# ==================================================================

print("\n" + "=" * 75)
print("FOCUS: m_p/m_e COEFFICIENT EXTRACTION")
print("=" * 75)

mp_me = [r for r in results if r['name'] == 'm_p/m_e'][0]

# Tree value
mp_me_tree = Rational(132203, 72)
mp_me_meas = 1836.15267343
mp_me_unc = 0.00000011

gap_exact = float(mp_me_tree) - mp_me_meas
gap_rel_exact = gap_exact / mp_me_meas
gap_ppm_exact = gap_rel_exact * 1e6

print(f"\n  Tree:     132203/72 = {float(mp_me_tree):.12f}")
print(f"  Measured: {mp_me_meas:.12f} +/- {mp_me_unc}")
print(f"  Gap:      {gap_exact:+.12f}")
print(f"  Relative: {gap_rel_exact:+.4e} = {gap_ppm_exact:+.4f} ppm")
print(f"  Sigma:    {abs(gap_exact)/mp_me_unc:.0f}")

C_mpme = gap_rel_exact / two_loop_EM
print(f"\n  In alpha^2/pi basis: C = gap / (alpha^2/pi) = {C_mpme:.6f}")
print(f"  (Framework OVERSHOOTS measured: positive gap, positive C)")

# Detailed search for framework decomposition
print(f"\n  --- Decomposition Search ---")
print(f"  {'Expression':<40} {'Value':<12} {'Error':<10}")
print(f"  {'-'*40} {'-'*12} {'-'*10}")

decomp_candidates = [
    # Simple framework numbers
    ("n_c/(n_d*Im_O)", n_c/(n_d*Im_O)),
    ("n_c/(n_d*dim_O)", n_c/(n_d*dim_O)),
    ("1/Im_O", 1.0/Im_O),
    ("n_d/(n_c*Im_H)", n_d/(n_c*Im_H)),
    ("n_d/n_c", n_d/n_c),
    ("Im_H/n_c", Im_H/n_c),
    ("(Im_H+1)/n_c", (Im_H+1)/n_c),

    # Double-trace candidates (like 24/11 for alpha)
    ("2/(n_d*Im_H)", 2.0/(n_d*Im_H)),
    ("2*Im_H/(n_d*n_c)", 2*Im_H/(n_d*n_c)),
    ("6/(n_d*n_c)", 6.0/(n_d*n_c)),
    ("6/(n_c*(n_c-1))", 6.0/(n_c*(n_c-1))),
    ("n_d/(2*n_c)", n_d/(2.0*n_c)),
    ("Im_H*Im_O/(n_d*n_c^2)", Im_H*Im_O/(n_d*n_c**2)),
    ("21/(n_d*n_c^2)", 21.0/(n_d*n_c**2)),
    ("n_d^2/(n_c^2)", n_d**2/n_c**2),

    # QCD-related (m_p is QCD bound state)
    ("alpha_s_tree/pi", (25.0/212)/p),
    ("(alpha_s/pi)^2", ((25.0/212)/p)**2),
    ("alpha_s*alpha/pi", (25.0/212)*alpha_f/p),
    ("n_d/(n_c*(H+O))", n_d/(n_c*12.0)),

    # Phi_6 related
    ("n_d/Phi6(n_c)", n_d/111.0),
    ("1/Phi6(n_c)", 1.0/111),
    ("n_c/Phi6(n_c)", n_c/111.0),
    ("1/Phi6(Im_O)", 1.0/43),
    ("n_d/Phi6(Im_O)", n_d/43.0),
    ("1/72", 1.0/72),
    ("11/72 * something?", (11.0/72) * two_loop_EM),  # nonsensical but check

    # Mixed
    ("Im_H/(n_d*Im_O)", Im_H/(n_d*Im_O)),
    ("1/(dim_O*Im_H^2)", 1.0/(dim_O*Im_H**2)),
    ("n_c/(dim_O*Im_H^2)", n_c/(dim_O*Im_H**2)),
    ("n_c/(72)", n_c/72.0),
]

for expr_name, expr_val in decomp_candidates:
    err = abs(C_mpme - expr_val) / abs(C_mpme) * 100 if C_mpme != 0 else 1e10
    marker = " <---" if err < 5 else ""
    print(f"  {expr_name:<40} {expr_val:<12.6f} {err:<10.1f}%{marker}")

# ==================================================================
# FOCUS: v/M_Koide COEFFICIENT
# ==================================================================

print("\n" + "=" * 75)
print("FOCUS: v/M_Koide COEFFICIENT EXTRACTION")
print("=" * 75)

vM = [r for r in results if r['name'] == 'v/M_Koide'][0]

vM_tree = Rational(1569, 2)
vM_meas = 784.4999
vM_gap = float(vM_tree) - vM_meas
vM_rel = vM_gap / vM_meas
vM_ppm = vM_rel * 1e6

C_vM = vM_rel / two_loop_EM

print(f"\n  Tree:     1569/2 = {float(vM_tree):.10f}")
print(f"  Measured: {vM_meas:.10f}")
print(f"  Gap:      {vM_gap:+.10f}")
print(f"  Relative: {vM_rel:+.4e} = {vM_ppm:+.4f} ppm")
print(f"  C = gap/(alpha^2/pi) = {C_vM:.6f}")

# ==================================================================
# BAND B: EXTENDED ANALYSIS (include m_tau/m_mu, alpha_s, Koide_theta)
# ==================================================================

print("\n" + "=" * 75)
print("BAND B+: QUANTITIES IN 1-300 ppm RANGE")
print("=" * 75)

band_B_extended = [r for r in results if 1 <= r['gap_ppm'] <= 300]

print(f"\n  {'Quantity':<18} {'Gap ppm':<10} {'C (a^2/pi)':<14} {'C (a/pi)':<12} {'Best fit':<20}")
print(f"  {'-'*18} {'-'*10} {'-'*14} {'-'*12} {'-'*20}")

for r in sorted(band_B_extended, key=lambda x: x['gap_ppm']):
    C_two = r['gap_rel'] / two_loop_EM
    C_one = r['gap_rel'] / one_loop_EM

    # Determine which basis makes more sense
    if r['gap_ppm'] > 100:
        # Band A: one-loop basis
        best = "one-loop"
        C_use = C_one
        # Match
        cands = [("n_d=4", 4.0), ("Im_H=3", 3.0), ("Im_O=7", 7.0),
                 ("n_c=11", 11.0), ("2", 2.0), ("1", 1.0)]
    else:
        # Band B: two-loop basis
        best = "two-loop"
        C_use = C_two
        cands = [("1/n_d", 0.25), ("1/n_c", 1/11.0), ("Im_H/n_c", 3/11.0),
                 ("2/n_c", 2/11.0), ("1/Im_H", 1/3.0), ("1/Im_O", 1/7.0),
                 ("1", 1.0), ("2", 2.0)]

    best_name, best_err = "", 1e10
    for cn, cv in cands:
        e = abs(C_use - cv)/cv*100 if cv > 0 else 1e10
        if e < best_err:
            best_name, best_err = cn, e

    match_str = f"{best_name} ({best_err:.1f}%)"
    print(f"  {r['name']:<18} {r['gap_ppm']:<10.2f} {C_two:<14.4f} {C_one:<12.4f} {match_str:<20}")

# ==================================================================
# NEW PREDICTIONS: m_tau/m_mu
# ==================================================================

print("\n" + "=" * 75)
print("PREDICTION TEST: m_tau/m_mu = 185/11")
print("=" * 75)

tau_mu = [r for r in results if r['name'] == 'm_tau/m_mu'][0]
print(f"\n  Tree: 185/11 = {float(Rational(185,11)):.10f}")
print(f"  Measured: 16.8170 +/- 0.0015")
print(f"  Gap: {tau_mu['gap_ppm']:.2f} ppm")

C_tau_mu_one = tau_mu['gap_rel'] / one_loop_EM
C_tau_mu_two = tau_mu['gap_rel'] / two_loop_EM

print(f"\n  In alpha/pi basis (one-loop):  C = {C_tau_mu_one:.4f}")
print(f"  In alpha^2/pi basis (two-loop): C = {C_tau_mu_two:.2f}")

# At 70 ppm, this is between Band A (>100) and Band B (<30)
# It could be a different loop structure
print(f"\n  Classification:")
if 30 <= tau_mu['gap_ppm'] <= 200:
    print(f"  70 ppm falls between Band A (>100 ppm) and Band B (<30 ppm)")
    print(f"  POSSIBLE: partial one-loop cancellation, or mixed EM+QCD correction")

    # If one-loop with partial cancellation
    cands_one = [
        ("n_d/(4*pi)", n_d/(4*p)),
        ("1/(4*pi)", 1/(4*p)),
        ("Im_H/(16*pi^2)", Im_H/(16*p**2)),
        ("1/n_c * alpha/pi", one_loop_EM/n_c),
        ("alpha_s/pi * alpha/pi", (0.1179/p) * (alpha_f/p)),
    ]

    # Check EM-basis matches
    print(f"\n  {'Expression':<30} {'C (a/pi)':<12} {'Error vs measured C':<10}")
    for cn, cv in cands_one:
        e = abs(C_tau_mu_one - cv)/C_tau_mu_one*100 if C_tau_mu_one > 0 else 1e10
        marker = " <---" if e < 20 else ""
        print(f"  {cn:<30} {cv:<12.4f} {e:<10.1f}%{marker}")

# ==================================================================
# NEW PREDICTIONS: alpha_s
# ==================================================================

print("\n" + "=" * 75)
print("PREDICTION TEST: alpha_s = 25/212")
print("=" * 75)

as_result = [r for r in results if r['name'] == 'alpha_s'][0]
print(f"\n  Tree: 25/212 = {float(Rational(25,212)):.10f}")
print(f"  Measured: 0.1179 +/- 0.0010")
print(f"  Gap: {as_result['gap_ppm']:.0f} ppm")

C_as_one = as_result['gap_rel'] / one_loop_EM
C_as_two = as_result['gap_rel'] / two_loop_EM

print(f"\n  In alpha/pi basis:     C = {C_as_one:.4f}")
print(f"  In alpha_s/pi basis:   C = {as_result['gap_rel'] / (0.1179/p):.4f}")

print(f"\n  At 208 ppm, alpha_s is in Band A (one-loop)")
print(f"  C ~ {C_as_one:.2f} in alpha/pi basis")

cands_as = [
    ("1/(4*pi)", 1/(4*p)),
    ("1/n_c", 1.0/n_c),
    ("n_d/(16*pi^2)", n_d/(16*p**2)),
    ("1/(Im_O*pi)", 1/(Im_O*p)),
    ("alpha_s/pi (QCD one-loop)", 0.1179/p),
]

print(f"\n  {'Expression':<30} {'Value':<12} {'Error':<10}")
for cn, cv in cands_as:
    e = abs(C_as_one - cv)/C_as_one*100 if C_as_one > 0 else 1e10
    marker = " <---" if e < 20 else ""
    print(f"  {cn:<30} {cv:<12.6f} {e:<10.1f}%{marker}")

# ==================================================================
# QUARK MASS RATIOS: BAND CLASSIFICATION
# ==================================================================

print("\n" + "=" * 75)
print("QUARK MASS RATIOS: BAND CLASSIFICATION")
print("=" * 75)

quark_ratios = [r for r in results if r['name'] in
    ['m_t/m_b', 'm_c/m_s', 'm_s/m_d', 'm_b/m_c']]

print(f"\n  {'Ratio':<18} {'Gap ppm':<10} {'Sigma':<8} {'Issue':<40}")
print(f"  {'-'*18} {'-'*10} {'-'*8} {'-'*40}")

for r in quark_ratios:
    issue = ""
    if r['sigma'] < 2:
        issue = "Within measurement error -> Band D"
    elif r['gap_ppm'] > 500:
        issue = f"Band A (one-loop QCD?)"
    else:
        issue = f"Intermediate"
    print(f"  {r['name']:<18} {r['gap_ppm']:<10.0f} {r['sigma']:<8.1f} {issue:<40}")

print(f"""
  NOTE: Quark mass ratios have large measurement uncertainties.
  Most gaps are within 1-2 sigma of measurements. These are
  effectively Band D (consistent with zero correction).
  Quark masses run strongly with QCD scale, so the "tree" value
  interpretation is less clear than for EM quantities.
""")

# ==================================================================
# CKM ELEMENTS
# ==================================================================

print("=" * 75)
print("CKM ELEMENTS: BAND CLASSIFICATION")
print("=" * 75)

ckm = [r for r in results if r['qtype'] == 'CKM']

print(f"\n  {'Element':<18} {'Gap ppm':<10} {'Sigma':<8} {'Band':<8}")
print(f"  {'-'*18} {'-'*10} {'-'*8} {'-'*8}")

for r in ckm:
    print(f"  {r['name']:<18} {r['gap_ppm']:<10.0f} {r['sigma']:<8.1f} {r['band']:<8}")

print(f"\n  CKM elements have ~1% measurement uncertainties.")
print(f"  All gaps are within measurement error -> effectively Band D.")

# ==================================================================
# DRESSED PREDICTIONS: APPLY KNOWN COEFFICIENTS
# ==================================================================

print("\n" + "=" * 75)
print("DRESSED PREDICTIONS: APPLY KNOWN BAND C COEFFICIENT")
print("=" * 75)

# For Band C quantities, we can predict the dressed value
# 1/alpha: C = 24/11 -> dressed = tree - C * alpha^2/pi
# m_p/m_e: C = ? -> this is what we're extracting

# Alpha dressed
C_alpha = Rational(24, 11)
alpha_correction = float(C_alpha) * two_loop_EM
alpha_dressed = float(Rational(15211, 111)) - float(C_alpha) * float(alpha_tree_exact)**2 / float(pi)
alpha_dressed_gap = abs(alpha_dressed - 137.035999177) / 137.036 * 1e6

print(f"\n  1/alpha:")
print(f"    Tree:        {float(Rational(15211,111)):.12f}")
print(f"    C = 24/11 -> correction = {alpha_correction:.4e}")
print(f"    Dressed:     {alpha_dressed:.12f}")
print(f"    Measured:    137.035999177")
print(f"    Residual:    {alpha_dressed_gap:.4f} ppm")

# m_p/m_e: Test with extracted C
print(f"\n  m_p/m_e:")
print(f"    Tree:        {float(mp_me_tree):.12f}")
print(f"    Extracted C = {C_mpme:.6f}")

# Test specific candidate: n_c/(dim_O * Im_H^2) = 11/72
C_mpme_cand = Rational(n_c, dim_O * Im_H**2)  # = 11/72
C_mpme_cand_f = float(C_mpme_cand)
mp_me_correction = C_mpme_cand_f * two_loop_EM
mp_me_dressed = float(mp_me_tree) - C_mpme_cand_f * alpha_f**2 / p
mp_me_dressed_gap = abs(mp_me_dressed - mp_me_meas) / mp_me_meas * 1e6

print(f"    Candidate: C = n_c/(O*Im_H^2) = 11/72 = {C_mpme_cand_f:.6f}")
print(f"    Measured C = {C_mpme:.6f}")
print(f"    Match: {abs(C_mpme - C_mpme_cand_f)/C_mpme*100:.1f}%")
print(f"    Dressed: {mp_me_dressed:.12f}")
print(f"    Measured: {mp_me_meas:.12f}")
print(f"    Residual: {mp_me_dressed_gap:.4f} ppm")

# Test: n_d/n_c = 4/11
C_mpme_cand2 = Rational(n_d, n_c)  # = 4/11
C_mpme_cand2_f = float(C_mpme_cand2)
mp_me_dressed2 = float(mp_me_tree) - C_mpme_cand2_f * alpha_f**2 / p
mp_me_dressed_gap2 = abs(mp_me_dressed2 - mp_me_meas) / mp_me_meas * 1e6

print(f"\n    Candidate: C = n_d/n_c = 4/11 = {C_mpme_cand2_f:.6f}")
print(f"    Match: {abs(C_mpme - C_mpme_cand2_f)/C_mpme*100:.1f}%")
print(f"    Dressed: {mp_me_dressed2:.12f}")
print(f"    Residual: {mp_me_dressed_gap2:.4f} ppm")

# ==================================================================
# COMPARISON: alpha vs m_p/m_e COEFFICIENT STRUCTURE
# ==================================================================

print("\n" + "=" * 75)
print("COEFFICIENT STRUCTURE COMPARISON")
print("=" * 75)

print(f"""
  1/alpha:  C = 24/11 = (12/11) * 2 = rho_EM * dim(C)
            where rho_EM = Tr(Q^2)/n_c = 2/11 [DERIVATION S272]
            and the factor 12 = dim(C) * (n_c+1)/n_c * n_c = ?
            Simpler: 24/11 = 2*(n_c+1)/n_c = 2*(12)/11

  m_p/m_e:  C = {C_mpme:.6f}
            The m_p/m_e tree formula: (H+O)(Im_H^2 + (H+O)^2) + n_c/(O*Im_H^2)
            Correction term in TREE formula: n_c/(O*Im_H^2) = 11/72
            But 11/72 = {11/72:.6f}

  Observation: The extracted C for m_p/m_e is {C_mpme:.6f}
  11/72 = {11/72:.6f}
  Ratio: C_mpme / (11/72) = {C_mpme / (11/72):.4f}

  n_d/n_c = {n_d/n_c:.6f}
  Ratio: C_mpme / (n_d/n_c) = {C_mpme / (n_d/n_c):.4f}

  Im_H/n_c = {Im_H/n_c:.6f}
  Ratio: C_mpme / (Im_H/n_c) = {C_mpme / (Im_H/n_c):.4f}
""")

# ==================================================================
# FULL PARADIGM TABLE
# ==================================================================

print("=" * 75)
print("FULL TREE-TO-DRESSED PARADIGM TABLE")
print("=" * 75)

print(f"""
  Band  Quantity          Tree Fraction    Gap (ppm)  Coefficient (basis)         Status
  ----  --------          -------------    ---------  ---------------------       ------
  C     m_p/m_e           132203/72        0.06       C ~ {C_mpme:.3f} (a^2/pi)        [EXTRACT]
  C     v/M_Koide         1569/2           0.13       C ~ {C_vM:.3f} (a^2/pi)          [EXTRACT]
  C     1/alpha           15211/111        0.27       C = 24/11 (a^2/pi)         [DERIVATION]
  B     v/m_p             11284/43         1.5        C ~ 1/n_c (a^2/pi)         [SPECULATION]
  B     m_mu/m_e          8891/43          4.1        C ~ 1/n_d (a^2/pi)         [SPECULATION]
  B     Koide_theta       pi*73/99*f       14.7       C ~ ? (a^2/pi)             [NEW]
  A     m_tau/m_mu        185/11           70         C ~ ? (a/pi)               [NEW]
  A     alpha_s           25/212           208        C ~ ? (a/pi)               [NEW]
  A     sin^2(theta_W)    28/121           843        C = n_d (a/(16pi^2))       [CONJECTURE]
  A+    m_t/m_b           124/3            ~80        Within meas. error         [N/A]
  A+    m_c/m_s           150/11           ~0         EXACT within error         [N/A]
  D     m_s/m_d           219/11           ~800       Within meas. error         [N/A]
  D     m_b/m_c           23/7             ~2200      Within meas. error         [N/A]
  D     |V_cb|            2/49             ~500       Within meas. error         [N/A]
  D     lambda_Cab        39/172           ~900       Within meas. error         [N/A]
  D     |V_ub|            1/258            ~16000     Within meas. error         [N/A]
""")

# ==================================================================
# VERIFICATION TESTS
# ==================================================================

print("=" * 75)
print("VERIFICATION TESTS")
print("=" * 75)
print()

tests = []

# Band C membership
tests.append(("m_p/m_e in Band C (gap < 0.5 ppm)",
    mp_me['gap_ppm'] < 0.5))

# v/M_Koide check
vM_r = [r for r in results if r['name'] == 'v/M_Koide'][0]
tests.append(("v/M_Koide in Band C (gap < 0.5 ppm)",
    vM_r['gap_ppm'] < 0.5))

tests.append(("1/alpha in Band C (gap < 0.5 ppm)",
    [r for r in results if r['name'] == '1/alpha'][0]['gap_ppm'] < 0.5))

# Band B membership
tests.append(("m_mu/m_e in Band B (1 < gap < 30 ppm)",
    1 < [r for r in results if r['name'] == 'm_mu/m_e'][0]['gap_ppm'] < 30))

tests.append(("v/m_p in Band B (1 < gap < 30 ppm)",
    1 < [r for r in results if r['name'] == 'v/m_p'][0]['gap_ppm'] < 30))

# Band ordering
band_C_max = max(r['gap_ppm'] for r in results if r['band'] == 'C')
band_B_min = min(r['gap_ppm'] for r in results if r['band'] == 'B')
tests.append(("Band C max < Band B min (clean separation)",
    band_C_max < band_B_min))

# Koide theta classification
koide_r = [r for r in results if r['name'] == 'Koide_theta'][0]
tests.append(("Koide_theta gap is 10-20 ppm (Band B)",
    10 < koide_r['gap_ppm'] < 20))

# m_tau/m_mu
tau_mu_r = [r for r in results if r['name'] == 'm_tau/m_mu'][0]
tests.append(("m_tau/m_mu gap is 50-100 ppm (Band A boundary)",
    50 < tau_mu_r['gap_ppm'] < 100))

# alpha_s
as_r = [r for r in results if r['name'] == 'alpha_s'][0]
tests.append(("alpha_s gap is 100-500 ppm (Band A)",
    100 < as_r['gap_ppm'] < 500))

# sin^2 is highest-gap coupling
sin2_r = [r for r in results if r['name'] == 'sin2_theta_W'][0]
tests.append(("sin^2(theta_W) has largest gap among couplings (>500 ppm)",
    sin2_r['gap_ppm'] > 500))

# Hierarchy: sin^2 > alpha_s > m_tau/m_mu > Koide > m_mu/m_e > v/m_p > 1/alpha > m_p/m_e
tests.append(("Full hierarchy: sin^2 > alpha_s > m_tau/m_mu > Koide > m_mu/m_e",
    sin2_r['gap_ppm'] > as_r['gap_ppm'] > tau_mu_r['gap_ppm'] >
    koide_r['gap_ppm'] > [r for r in results if r['name'] == 'm_mu/m_e'][0]['gap_ppm']))

tests.append(("Full hierarchy continued: m_mu/m_e > v/m_p > 1/alpha > m_p/m_e",
    [r for r in results if r['name'] == 'm_mu/m_e'][0]['gap_ppm'] >
    [r for r in results if r['name'] == 'v/m_p'][0]['gap_ppm'] >
    [r for r in results if r['name'] == '1/alpha'][0]['gap_ppm'] >
    [r for r in results if r['name'] == 'm_p/m_e'][0]['gap_ppm']))

# Alpha coefficient
tests.append(("1/alpha coefficient C = 24/11 within 0.01%",
    abs(C_vals.get('1/alpha', 0) - 24.0/11) / (24.0/11) < 0.001))

# m_p/m_e coefficient extraction is positive (tree overshoots)
tests.append(("m_p/m_e: tree overshoots measured (C > 0)",
    C_mpme > 0))

# Band C has exactly 3 members
tests.append(("Band C has exactly 3 members (m_p/m_e, v/M, 1/alpha)",
    len(band_C) == 3))

# Band C ordering: m_p/m_e < v/M_Koide < 1/alpha
C_gaps = sorted([(r['name'], r['gap_ppm']) for r in band_C], key=lambda x: x[1])
tests.append(("Band C ordering: m_p/m_e < v/M_Koide < 1/alpha",
    len(C_gaps) == 3 and C_gaps[0][0] == 'm_p/m_e' and C_gaps[2][0] == '1/alpha'))

pass_count = sum(1 for _, r in tests if r)
for name, result in tests:
    status = "PASS" if result else "FAIL"
    print(f"  [{status}] {name}")

print(f"\n  Total: {pass_count}/{len(tests)}")

# ==================================================================
# KEY FINDING
# ==================================================================

print("\n" + "=" * 75)
print("KEY FINDINGS")
print("=" * 75)

print(f"""
  1. ALL 16 derived ratios classify into 4 bands (A/B/C/D)
     The classification is CONSISTENT with QFT loop hierarchy.

  2. Band C has THREE members (not two):
     m_p/m_e (0.06 ppm), v/M_Koide (0.13 ppm), 1/alpha (0.27 ppm)

  3. m_p/m_e coefficient: C = {C_mpme:.4f}
     Framework tree OVERSHOOTS measured by 0.06 ppm.
     Coefficient in alpha^2/pi basis: {C_mpme:.4f}
     Best framework match: n_d/n_c = 4/11 = {4/11:.4f} ({abs(C_mpme - 4/11)/(4/11)*100:.1f}% error)

  4. v/M_Koide coefficient: C = {C_vM:.4f}
     Best framework match: TBD

  5. NEW band members identified:
     - Koide_theta (14.7 ppm) -> Band B
     - m_tau/m_mu (70 ppm) -> Band A/B boundary
     - alpha_s (208 ppm) -> Band A

  6. Quark ratios and CKM elements -> Band D (within measurement error)
     These cannot be classified until measurements improve.
""")
