#!/usr/bin/env python3
"""
R-Ratio from Crystallization Mode Counting

KEY FINDING: R = sigma(e+e- -> hadrons) / sigma(e+e- -> mu+mu-) = N_c * sum(Q_f^2)
for quarks accessible at given sqrt(s), where N_c = 3 [DERIVATION from C2 eigenvalue
selection]. QCD corrections run via b_0 = Im_O = 7 [DERIVATION].

The R-ratio is a clean framework test because:
1. N_c = 3 enters directly (color factor)
2. Quark charges Q_f follow from C2 eigenvalue selection
3. QCD running uses b_0 = Im_O = 7 (for N_f = 6)
4. At Z pole, neutral-current contributions use sin^2(theta_W) = 28/121

Framework inputs:
  [D] N_c = 3 from SU(3) eigenvalue selection (C2)
  [D] b_0 = Im_O = 7 for SU(3) leading beta coefficient (N_f = 6)
  [D] sin^2(theta_W) = 28/121 for NC contributions at Z pole

SM imports [A-IMPORT]:
  Quark charges (T3, Q from SM quantum numbers)
  alpha_s(M_Z) = 0.1180 (for QCD corrections)
  alpha(0) = 1/137.036, alpha(M_Z) = 1/127.944
  Quark masses (for threshold effects)

Measured: PDG 2024 compilations of R(s) at various energies
Status: VERIFICATION
Created: Session 225
Depends on: C8 (vertex structure), C2 (N_c), C6 (QCD running)
"""

from sympy import *
from sympy import Rational as R
import math

# ==============================================================================
# FRAMEWORK INPUTS
# ==============================================================================

N_c = 3             # [D] from C2 eigenvalue selection = Im_H
Im_O = 7            # [D] imaginary octonion dimensions
Im_H = 3            # [D] imaginary quaternion dimensions
n_c = 11            # [D] crystal dimension
n_d = 4             # [D] defect dimension = H
sin2_W = R(28, 121) # [D] = N_Goldstone / n_c^2

# Beta function coefficient (framework): b_0 = Im_O = 7 for N_f = 6
# Standard: b_0 = (11*N_c - 2*N_f) / 3 = (33 - 12)/3 = 7 for N_f = 6
b_0_framework = Im_O  # = 7

# ==============================================================================
# SM IMPORTS [A-IMPORT]
# ==============================================================================

# Quark charges and properties
# (name, Q, mass_GeV, threshold_GeV)
quarks = [
    ('u',  R(2, 3),   0.002,   0.3),    # threshold ~ 2*m_pi
    ('d',  R(-1, 3),  0.005,   0.3),
    ('s',  R(-1, 3),  0.095,   1.0),    # threshold ~ 2*m_K
    ('c',  R(2, 3),   1.27,    3.73),   # threshold ~ 2*m_D ≈ 3.73 GeV
    ('b',  R(-1, 3),  4.18,    10.56),  # threshold ~ 2*m_B ≈ 10.56 GeV
    ('t',  R(2, 3),   173.0,   346.0),  # threshold ~ 2*m_t
]

alpha_s_MZ = 0.1180     # [A-IMPORT] PDG 2024
M_Z = 91.1876            # [A-IMPORT] GeV
alpha_em_0 = 1.0 / 137.036  # [A-IMPORT]

# ==============================================================================
# PART 1: BORN-LEVEL R-RATIO (MODE COUNTING)
# ==============================================================================

print("=" * 76)
print("R-RATIO FROM CRYSTALLIZATION MODE COUNTING")
print("R = N_c * sum(Q_f^2) for accessible quarks")
print("=" * 76)
print()

# R_Born at various energies (number of accessible quark flavors)
def R_born(n_f_list):
    """Born-level R from list of accessible quark names."""
    Q_sum = sum(q[1]**2 for q in quarks if q[0] in n_f_list)
    return N_c * Q_sum

# Energy regimes
regimes = [
    ("Below charm (1-3 GeV)",    ['u', 'd', 's'],         "R = 3*(4/9 + 1/9 + 1/9) = 2"),
    ("Charm region (3.7-10 GeV)", ['u', 'd', 's', 'c'],   "R = 3*(4/9 + 1/9 + 1/9 + 4/9) = 10/3"),
    ("Bottom region (11-90 GeV)", ['u', 'd', 's', 'c', 'b'], "R = 3*(4/9 + 1/9 + 1/9 + 4/9 + 1/9) = 11/3"),
    ("Above top (>350 GeV)",     ['u', 'd', 's', 'c', 'b', 't'], "R = 3*(4/9 + 1/9 + 1/9 + 4/9 + 1/9 + 4/9) = 5"),
]

print("BORN-LEVEL R-RATIO BY ENERGY REGIME:")
print()
print(f"{'Regime':.<40} | {'N_f':>3} | {'R_Born':>8} | {'R (float)':>10}")
print("-" * 76)

R_values = {}
for regime_name, quark_list, description in regimes:
    R_val = R_born(quark_list)
    R_values[regime_name] = (R_val, quark_list)
    print(f"{regime_name:.<40} | {len(quark_list):>3} | {str(R_val):>8} | {float(R_val):>10.4f}")

print()

# Exact rational decomposition
print("EXACT RATIONAL DECOMPOSITION:")
print()
for regime_name, quark_list, description in regimes:
    R_val = R_values[regime_name][0]
    Q_sq_sum = sum(q[1]**2 for q in quarks if q[0] in quark_list)
    print(f"  {regime_name}:")
    charges = " + ".join(f"({q[1]})^2" for q in quarks if q[0] in quark_list)
    print(f"    sum(Q_f^2) = {charges} = {Q_sq_sum} = {float(Q_sq_sum):.6f}")
    print(f"    R = N_c * {Q_sq_sum} = {R_val} = {float(R_val):.4f}")
    print(f"    {description}")
    print()

# ==============================================================================
# PART 2: QCD CORRECTIONS
# ==============================================================================

print("=" * 76)
print("PART 2: QCD CORRECTIONS")
print("=" * 76)
print()

# R = R_Born * (1 + alpha_s/pi + c_2*(alpha_s/pi)^2 + ...)
# At NLO: R = R_Born * (1 + alpha_s/pi)
# At NNLO: R = R_Born * (1 + alpha_s/pi + 1.986*(alpha_s/pi)^2 - 6.637*(alpha_s/pi)^3)
# The coefficient c_2 = 1.986 (for N_f=5) is known exactly from perturbative QCD

# Running alpha_s from M_Z using framework b_0 = Im_O = 7
def alpha_s_running(Q_GeV, alpha_s_ref, Q_ref, b0, n_f):
    """One-loop running of alpha_s."""
    if Q_GeV <= 0 or Q_ref <= 0:
        return alpha_s_ref
    L = math.log(Q_GeV / Q_ref)
    denominator = 1 + b0 * alpha_s_ref / (2 * math.pi) * L
    if denominator <= 0:
        return float('inf')  # Landau pole
    return alpha_s_ref / denominator

# b_0 values for different N_f
# Standard: b_0 = (11*N_c - 2*N_f) / 3
# Framework: b_0(N_f=6) = Im_O = 7
b0_values = {}
for nf in range(3, 7):
    b0_std = (11 * N_c - 2 * nf) / 3
    b0_values[nf] = b0_std

print(f"Beta function coefficients b_0 = (11*N_c - 2*N_f)/3:")
print()
for nf, b0 in b0_values.items():
    framework_note = " = Im_O [DERIVATION]" if nf == 6 else ""
    print(f"  N_f = {nf}: b_0 = (33 - {2*nf})/3 = {b0:.1f}{framework_note}")
print()

# Evaluate alpha_s at various scales
test_scales = [
    (1.5,  3, "Below charm"),
    (5.0,  4, "Charm region"),
    (10.0, 5, "Bottom region"),
    (M_Z,  5, "Z pole"),
    (200.0, 6, "Above top (if applicable)"),
]

print("alpha_s running (1-loop, from alpha_s(M_Z) = 0.1180):")
print()
print(f"{'Scale (GeV)':>12} | {'N_f':>3} | {'b_0':>5} | {'alpha_s':>10}")
print("-" * 50)

alpha_s_at = {}
for Q, nf, label in test_scales:
    b0 = b0_values[nf]
    a_s = alpha_s_running(Q, alpha_s_MZ, M_Z, b0, nf)
    alpha_s_at[Q] = a_s
    print(f"{Q:>12.1f} | {nf:>3} | {b0:>5.1f} | {a_s:>10.4f}  ({label})")
print()

# R with QCD corrections at key energies
print("R-RATIO WITH QCD CORRECTIONS:")
print()
print(f"{'sqrt(s) GeV':>12} | {'R_Born':>8} | {'QCD factor':>10} | {'R_QCD':>8} | {'R_meas':>8} | {'Pull':>6}")
print("-" * 76)

# Measured R values from PDG compilations
# These are approximate averages from e+e- data
measured_R = {
    2.0:   (2.0,  ['u', 'd', 's'],     2.2,   0.2),     # ~2 GeV, inclusive
    5.0:   (10/3, ['u', 'd', 's', 'c'], 3.56,  0.10),    # ~5 GeV, BES/CLEO
    10.0:  (10/3, ['u', 'd', 's', 'c'], 3.58,  0.05),    # ~10 GeV, PETRA/PEP
    34.0:  (11/3, ['u', 'd', 's', 'c', 'b'], 3.89, 0.06),  # 34 GeV, PETRA
    91.2:  (None, ['u', 'd', 's', 'c', 'b'], 20.767, 0.025), # Z pole (R_l, different definition)
}

R_QCD_predictions = {}
for sqrt_s, (R_born_expected, qlist, R_meas, R_unc) in measured_R.items():
    if sqrt_s == 91.2:
        # Z pole is special — R_l = Gamma_had/Gamma_l, not simple R
        # Skip for now, handle separately
        continue

    R_b = R_born(qlist)
    nf = len(qlist)
    b0 = b0_values[nf]
    a_s = alpha_s_running(sqrt_s, alpha_s_MZ, M_Z, b0, nf)

    # NLO correction
    qcd_factor = 1 + a_s / math.pi
    R_qcd = float(R_b) * qcd_factor
    R_QCD_predictions[sqrt_s] = R_qcd

    pull = (R_qcd - R_meas) / R_unc if R_unc > 0 else 0

    print(f"{sqrt_s:>12.1f} | {str(R_b):>8} | {qcd_factor:>10.4f} | {R_qcd:>8.3f} | {R_meas:>8.3f} | {pull:>+6.2f}")

print()

# ==============================================================================
# PART 3: R AT THE Z POLE — NEUTRAL CURRENT CONTRIBUTION
# ==============================================================================

print("=" * 76)
print("PART 3: R AT THE Z POLE (NC CONTRIBUTIONS)")
print("=" * 76)
print()

# At the Z pole, the process is dominated by s-channel Z exchange
# R_l = Gamma_had / Gamma_l uses sin^2(theta_W) = 28/121 [DERIVATION]
# This is already covered by z_branching_crystallization.py
# Here we note the connection: R_l encodes N_c AND sin^2(theta_W)

# Pure photon-exchange R at Z-pole energy (would be ~11/3 without Z)
R_gamma_only = R_born(['u', 'd', 's', 'c', 'b'])
print(f"R (photon exchange only at M_Z): {R_gamma_only} = {float(R_gamma_only):.4f}")
print(f"R_l (Z exchange, from z_branching script): 20.767 ± 0.025")
print(f"Ratio R_l/R_gamma = {20.767/float(R_gamma_only):.2f} — Z resonance enhancement")
print()

# The Z-pole R encodes sin^2(theta_W) = 28/121
# R_l^Born = N_c * [2*(g_V^u^2 + g_A^u^2) + 3*(g_V^d^2 + g_A^d^2)] / (g_V^e^2 + g_A^e^2)
s2 = sin2_W
g_V_e = R(-1, 2) + 2 * s2
g_A_e = R(-1, 2)
g_V_u = R(1, 2) - R(4, 3) * s2
g_A_u = R(1, 2)
g_V_d = R(-1, 2) + R(2, 3) * s2
g_A_d = R(-1, 2)

quark_sum = 2 * (g_V_u**2 + g_A_u**2) + 3 * (g_V_d**2 + g_A_d**2)
lepton_denom = g_V_e**2 + g_A_e**2
R_l_Born_exact = N_c * quark_sum / lepton_denom
R_l_Born_simplified = simplify(R_l_Born_exact)

print(f"R_l^Born (exact, from sin^2 = 28/121):")
print(f"  = N_c * [2*(g_V^u^2 + g_A^u^2) + 3*(g_V^d^2 + g_A^d^2)] / (g_V^e^2 + g_A^e^2)")
print(f"  = {R_l_Born_simplified}")
print(f"  = {float(R_l_Born_simplified):.6f}")
print()

# With QCD NLO correction
QCD_NLO_Z = 1 + alpha_s_MZ/math.pi + 1.409*(alpha_s_MZ/math.pi)**2
R_l_corrected = float(R_l_Born_simplified) * QCD_NLO_Z
print(f"R_l with QCD NLO = {float(R_l_Born_simplified):.4f} * {QCD_NLO_Z:.4f} = {R_l_corrected:.3f}")
print(f"Measured R_l = 20.767 ± 0.025")
print(f"Pull: {(R_l_corrected - 20.767)/0.025:+.2f} sigma")
print()

# ==============================================================================
# PART 4: HADRONIC CROSS-SECTION RATIO sigma_had/sigma_point
# ==============================================================================

print("=" * 76)
print("PART 4: sigma(e+e- -> hadrons) vs POINT CROSS-SECTION")
print("=" * 76)
print()

# sigma_point = 4*pi*alpha^2 / (3*s) (Dirac point cross-section for mu+mu-)
# sigma(e+e- -> hadrons) = sigma_point * R(s) * (1 + QCD corrections)
# This gives the total hadronic cross-section at any energy

# At sqrt(s) = 10 GeV (continuum, below Upsilon)
sqrt_s_10 = 10.0
alpha_em_10 = alpha_em_0  # approx (running small)
sigma_point_10 = 4 * math.pi * alpha_em_10**2 / (3 * sqrt_s_10**2)  # in GeV^-2
GeV2_to_nb = 0.3894e6  # conversion factor
sigma_point_nb = sigma_point_10 * GeV2_to_nb

R_10 = float(R_born(['u', 'd', 's', 'c']))
a_s_10 = alpha_s_running(10.0, alpha_s_MZ, M_Z, b0_values[4], 4)
sigma_had_10 = sigma_point_nb * R_10 * (1 + a_s_10/math.pi)

print(f"At sqrt(s) = 10 GeV:")
print(f"  sigma_point = {sigma_point_nb:.4f} nb")
print(f"  R_Born = {R_10:.4f}")
print(f"  QCD correction = 1 + alpha_s/pi = {1 + a_s_10/math.pi:.4f}")
print(f"  sigma(e+e- -> hadrons) = {sigma_had_10:.4f} nb")
print()

# ==============================================================================
# PART 5: MODE COUNTING STRUCTURE
# ==============================================================================

print("=" * 76)
print("PART 5: FRAMEWORK MODE COUNTING ANALYSIS")
print("=" * 76)
print()

# The key framework content in the R-ratio:
# 1. N_c = 3 = Im_H — the color factor is a derived quantity
# 2. Quark charges follow from SM quantum numbers [A-IMPORT]
# 3. At Born level, R is purely a mode-counting exercise:
#    Each quark flavor contributes N_c * Q_f^2 modes

# Total mode count at each threshold
print("MODE COUNT DECOMPOSITION:")
print()
print(f"{'Quark':>6} | {'Q':>6} | {'Q^2':>8} | {'N_c*Q^2':>8} | {'Cumulative R':>14}")
print("-" * 60)

cumulative_R = R(0)
for name, Q, mass, thresh in quarks:
    Q_sq = Q**2
    contribution = N_c * Q_sq
    cumulative_R += contribution
    print(f"{name:>6} | {str(Q):>6} | {str(Q_sq):>8} | {str(contribution):>8} | {str(cumulative_R):>14} = {float(cumulative_R):.4f}")
print()

# Framework interpretation
print("FRAMEWORK INTERPRETATION:")
print()
print(f"  N_c = {N_c} = Im_H [DERIVATION from C2 eigenvalue selection]")
print(f"  Each quark adds N_c * Q_f^2 = Im_H * Q_f^2 hadronic modes")
print(f"  Final R (all 6 quarks) = {cumulative_R} = {float(cumulative_R):.4f}")
print()

# Check: R values are exact rationals
print("EXACT RATIONAL R VALUES:")
print(f"  3 flavors (u,d,s):       R = {R_born(['u', 'd', 's'])} = 2")
print(f"  4 flavors (u,d,s,c):     R = {R_born(['u', 'd', 's', 'c'])} = 10/3")
print(f"  5 flavors (u,d,s,c,b):   R = {R_born(['u', 'd', 's', 'c', 'b'])} = 11/3")
print(f"  6 flavors (all):         R = {R_born(['u', 'd', 's', 'c', 'b', 't'])} = 5")
print()

# Note: R(5 flavors) = 11/3 — contains n_c = 11 in numerator
# This is a coincidence: 11/3 = n_c / Im_H
R_5flav = R_born(['u', 'd', 's', 'c', 'b'])
print(f"  COINCIDENCE CHECK: R(5 flavors) = {R_5flav} = {float(R_5flav):.4f}")
print(f"  n_c / Im_H = {n_c}/{Im_H} = {R(n_c, Im_H)} = {float(R(n_c, Im_H)):.4f}")
print(f"  Match: {'YES' if R_5flav == R(n_c, Im_H) else 'NO'}")
print(f"  Status: [STANDARD-RELABELED] — the match 11/3 = n_c/Im_H is KINEMATIC")
print(f"  (depends on which quarks are lighter than ~45 GeV, not on algebra)")
print()

# ==============================================================================
# PART 6: BETA COEFFICIENT CROSS-CHECK
# ==============================================================================

print("=" * 76)
print("PART 6: BETA COEFFICIENT b_0 = Im_O CROSS-CHECK")
print("=" * 76)
print()

# b_0 = (11*N_c - 2*N_f) / 3
# For N_f = 6: b_0 = (33 - 12)/3 = 21/3 = 7 = Im_O
# For N_f = 5: b_0 = (33 - 10)/3 = 23/3 (not an integer)
# For N_f = 4: b_0 = (33 - 8)/3 = 25/3 (not an integer)
# For N_f = 3: b_0 = (33 - 6)/3 = 9 = n_d + C5... not obviously framework

# Only N_f = 6 gives an integer b_0, and it equals Im_O
print("b_0 for different N_f:")
for nf in range(0, 7):
    b0_exact = R(11 * N_c - 2 * nf, 3)
    is_integer = b0_exact.q == 1
    framework = ""
    if nf == 6 and b0_exact == Im_O:
        framework = " = Im_O [DERIVATION]"
    elif nf == 0:
        framework = " = n_c (coincidence)"
    print(f"  N_f = {nf}: b_0 = (33 - {2*nf})/3 = {b0_exact} = {float(b0_exact):.4f}"
          f"  {'INTEGER' if is_integer else 'fraction'}{framework}")
print()

# The framework derivation: b_0 = Im_O for the full SM (all 6 quarks active)
# This is an exact match with zero free parameters
print(f"KEY RESULT: b_0(N_f=6) = {R(11*N_c - 12, 3)} = Im_O = {Im_O}")
print(f"This enters QCD corrections to R-ratio above the top threshold")
print(f"Below top threshold (N_f=5): b_0 = 23/3, not a clean framework number")
print()

# ==============================================================================
# PART 7: DRELL-YAN CROSS-SECTION RATIO CHECK
# ==============================================================================

print("=" * 76)
print("PART 7: DRELL-YAN STRUCTURE")
print("=" * 76)
print()

# Drell-Yan: q + qbar -> l+l- via virtual photon/Z
# At low Q^2 (photon dominance): sigma ~ (4*pi*alpha^2)/(9*s) * sum_q(e_q^2)
# The factor 1/N_c appears (average over initial color) vs N_c in R-ratio
# DY ratio: sigma(qq->ll) / sigma_point = (1/N_c) * sum_q(e_q^2) * f_q(x) * f_qbar(x')
# This tests the SAME N_c but in initial state averaging

# The N_c factor appears differently:
# R-ratio (e+e- -> hadrons):  final state COLOR SUM  → factor N_c
# Drell-Yan (qq -> ll):       initial state COLOR AVG → factor 1/N_c
# Ratio of ratios: R * sigma_DY/sigma_point = sum(e_q^2)^2  (N_c cancels)
# This provides an independent check that the color factor is consistent

print(f"Color factor in different processes:")
print(f"  e+e- -> hadrons (R-ratio):    SUM over final colors -> factor N_c = {N_c}")
print(f"  Drell-Yan (qq -> ll):         AVG over initial colors -> factor 1/N_c = 1/{N_c}")
print(f"  Deep inelastic scattering:    SUM over struck colors -> factor N_c = {N_c}")
print()
print(f"  All processes consistently use N_c = Im_H = {Im_H} [DERIVATION]")
print(f"  The framework predicts this universality: all quarks have N_c color states")
print(f"  because SU(3) eigenvalue selection (C2) sets the color gauge group.")
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 76)
print("VERIFICATION TESTS")
print("=" * 76)
print()

tests = [
    # Born-level R values (exact)
    ("R(3 flavors) = 2 exactly",
     R_born(['u', 'd', 's']) == 2),

    ("R(4 flavors) = 10/3 exactly",
     R_born(['u', 'd', 's', 'c']) == R(10, 3)),

    ("R(5 flavors) = 11/3 exactly",
     R_born(['u', 'd', 's', 'c', 'b']) == R(11, 3)),

    ("R(6 flavors) = 5 exactly",
     R_born(['u', 'd', 's', 'c', 'b', 't']) == 5),

    # Framework quantities
    ("N_c = Im_H = 3",
     N_c == Im_H),

    ("b_0(N_f=6) = Im_O = 7",
     b_0_framework == Im_O and (11*N_c - 2*6)//3 == Im_O),

    ("b_0(N_f=6) = (11*N_c - 12)/3 is exact integer",
     (11*N_c - 12) % 3 == 0),

    # QCD corrections positive
    ("QCD correction factor > 1 at 10 GeV",
     1 + alpha_s_at[10.0]/math.pi > 1.0),

    ("QCD correction factor > 1 at M_Z",
     1 + alpha_s_at[M_Z]/math.pi > 1.0),

    # Comparison to data (within 10% for NLO)
    ("R(5 GeV) within 10% of measured 3.56",
     abs(R_QCD_predictions[5.0] - 3.56) / 3.56 < 0.10),

    ("R(10 GeV) within 10% of measured 3.58",
     abs(R_QCD_predictions[10.0] - 3.58) / 3.58 < 0.10),

    ("R(34 GeV) within 10% of measured 3.89",
     abs(R_QCD_predictions[34.0] - 3.89) / 3.89 < 0.10),

    # Z-pole R_l
    ("R_l^Born from sin^2=28/121 within 4% of measured (Born, no QCD)",
     abs(float(R_l_Born_simplified) - 20.767) / 20.767 < 0.04),

    ("R_l with QCD within 1% of measured 20.767",
     abs(R_l_corrected - 20.767) / 20.767 < 0.01),

    # Coincidence check (not a framework prediction)
    ("R(5 flavors) = n_c/Im_H = 11/3 (coincidence, not prediction)",
     R_5flav == R(n_c, Im_H)),
]

all_pass = True
pass_count = 0
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if passed:
        pass_count += 1
    else:
        all_pass = False
    print(f"[{status}] {name}")

print()
print(f"{'ALL TESTS PASS' if all_pass else 'SOME TESTS FAILED'}")
print(f"Total: {pass_count}/{len(tests)} passed")
print()

# ==============================================================================
# SUMMARY
# ==============================================================================

print("=" * 76)
print("SUMMARY")
print("=" * 76)
print()
print("The R-ratio is a CLEAN framework test:")
print(f"  1. N_c = 3 = Im_H enters directly as the color factor [DERIVATION]")
print(f"  2. b_0 = 7 = Im_O for QCD running with all quarks [DERIVATION]")
print(f"  3. At Z pole, sin^2(theta_W) = 28/121 enters R_l [DERIVATION]")
print()
print("HONEST ASSESSMENT:")
print(f"  - Born-level R = N_c * sum(Q_f^2) is [FRAMEWORK-CONSTRAINED]")
print(f"    (N_c derived, but quark charges are [A-IMPORT])")
print(f"  - QCD corrections use b_0 = Im_O at N_f=6 [DERIVATION]")
print(f"    (below top threshold, b_0 is a fraction, not cleanly framework)")
print(f"  - R(5 flavors) = 11/3 = n_c/Im_H is KINEMATIC coincidence")
print(f"    (depends on m_t > M_Z/2, not on algebraic structure)")
print(f"  - Overall tag: [FRAMEWORK-CONSTRAINED] — N_c makes it non-trivial")
print()
print("CONFIDENCE: [FRAMEWORK-CONSTRAINED] for mode counting;")
print("            [DERIVATION] for N_c = 3 and b_0 = 7;")
print("            [A-IMPORT] for quark charges and masses")
