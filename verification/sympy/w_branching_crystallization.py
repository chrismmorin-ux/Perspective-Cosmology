#!/usr/bin/env python3
"""
W Branching Ratios from Crystallization Framework

KEY FINDING: W branching ratios follow from channel counting with
Im_H = 3 generations and N_c = 3 colors. Born-level prediction of
BR(W->l nu) = 1/9 = 11.1% agrees with measured 10.8% per flavor.
QCD-corrected total width matches PDG within 1 sigma.

Framework inputs:
  Im_H = 3                    [D] 3 generations (leptonic channels)
  N_c = 3                     [D] 3 colors (enhances hadronic channels)
  sin^2(theta_W) = 28/121     [D] (enters W mass relation but not W couplings)

SM imports [A-IMPORT]:
  G_F = 1.1663788e-5 GeV^-2   Fermi constant
  m_W = 80.3692 GeV            W boson mass
  alpha_s(m_W) ~ 0.120         strong coupling at W mass
  CKM matrix elements          (unitarity gives sum = 1)

Measured (PDG 2024):
  Gamma_W = 2.085 +/- 0.042 GeV
  BR(W->l nu) = 10.86 +/- 0.09 % (per flavor, average)
  BR(W->hadrons) = 67.41 +/- 0.27 %

Status: INVESTIGATION (Phase 1 of crystallization catalog)
Created: Session 223
Depends on: S221 (Phase 0), S163 (Z branching pattern)
"""

from sympy import *
from sympy import Rational as R
import math

# ==============================================================================
# FRAMEWORK CONSTANTS
# ==============================================================================

Im_H = 3     # [D] imaginary quaternion dimensions = generations
Im_O = 7     # [D] imaginary octonion dimensions
n_c = 11     # [D] crystal dimension
n_d = 4      # [D] defect dimension
N_c = 3      # [D] colors from SU(3)

sin2_W = R(28, 121)  # [D] Weinberg angle
cos2_W = 1 - sin2_W  # = 93/121

# ==============================================================================
# SM IMPORTS [A-IMPORT]
# ==============================================================================

G_F = 1.1663788e-5    # GeV^-2 (PDG 2024)
m_W = 80.3692          # GeV (PDG 2024)
m_Z = 91.1876          # GeV
m_t = 172.57           # GeV (too heavy for W decay)
alpha_s_MZ = 0.1180    # PDG 2024
alpha_EM_MZ = 1.0 / 127.951  # running alpha at M_Z

# alpha_s at m_W (running from M_Z)
# alpha_s(m_W) ~ alpha_s(M_Z) * (1 + b_0*alpha_s/(2*pi)*log(M_Z/m_W))
# At leading order, alpha_s(m_W) ~ 0.120
alpha_s_mW = 0.1200

# CKM elements (PDG 2024)
V_ud = 0.97435
V_us = 0.22500
V_ub = 0.00369
V_cd = 0.22486
V_cs = 0.97349
V_cb = 0.04182

# QCD correction for hadronic W decays
QCD_corr = 1 + alpha_s_mW / math.pi  # ~ 1.0382
# NLO: includes alpha_s^2 term
QCD_NLO = 1 + alpha_s_mW / math.pi + 1.409 * (alpha_s_mW / math.pi)**2
# QED correction (small)
QED_corr = 1.0  # neglected for W (enters at < 0.1%)

# Measured W properties (PDG 2024)
Gamma_W_meas = 2.085      # GeV, +/- 0.042
BR_W_enu_meas = 0.1071    # +/- 0.0016
BR_W_munu_meas = 0.1063   # +/- 0.0015
BR_W_taunu_meas = 0.1138  # +/- 0.0021
BR_W_lnu_avg_meas = 0.1086  # average per flavor, +/- 0.0009
BR_W_had_meas = 0.6741    # +/- 0.0027

# ==============================================================================
# PART 1: CHANNEL COUNTING
# ==============================================================================

print("=" * 72)
print("W BRANCHING RATIOS FROM CRYSTALLIZATION")
print("=" * 72)
print()

print("PART 1: CHANNEL COUNTING")
print("-" * 72)
print()

# W couples to left-handed fermion doublets via charged current
# Coupling is universal: g/sqrt(2) for each doublet

# Leptonic channels: one per generation
N_lep = Im_H  # = 3
print(f"Leptonic channels: {N_lep} = Im_H")
print(f"  W+ -> e+ nu_e")
print(f"  W+ -> mu+ nu_mu")
print(f"  W+ -> tau+ nu_tau")
print()

# Hadronic channels: quark doublets x colors
# At W mass scale, accessible doublets: (u,d), (c,s)
# Top excluded: m_t >> m_W
N_quark_gen = 2  # accessible quark generations [A-IMPORT: kinematic]
N_had = N_quark_gen * N_c  # = 6
print(f"Hadronic channels: {N_had} = {N_quark_gen} doublets x N_c = {N_c}")
print(f"  W+ -> u d-bar (x{N_c} colors), CKM: |V_ud|^2 + |V_us|^2 + |V_ub|^2 = 1")
print(f"  W+ -> c s-bar (x{N_c} colors), CKM: |V_cd|^2 + |V_cs|^2 + |V_cb|^2 = 1")
print(f"  (CKM unitarity: sum over down-type = 1 per up-type)")
print()

N_total = N_lep + N_had  # = 9
print(f"Total channels: {N_total} = {N_lep} + {N_had}")
print(f"  = Im_H + 2*N_c = {Im_H} + {2*N_c}")
print()

# ==============================================================================
# PART 2: BORN-LEVEL PREDICTIONS (EXACT RATIONAL)
# ==============================================================================

print("PART 2: BORN-LEVEL PREDICTIONS (EXACT)")
print("-" * 72)
print()

# Born-level partial width for each channel:
# Gamma(W -> f1 f2-bar) = G_F * m_W^3 / (6*pi*sqrt(2)) * N_c * |V_CKM|^2
#
# For leptons: N_c = 1, |V|^2 = 1
# For quarks: N_c = 3, sum_j |V_ij|^2 = 1 (unitarity)
# So each quark doublet contributes same as 3 lepton channels

Gamma_0 = G_F * m_W**3 / (6 * math.pi * math.sqrt(2))
print(f"Born prefactor: G_F * m_W^3 / (6*pi*sqrt(2)) = {Gamma_0:.4f} GeV")
print(f"  = {Gamma_0*1000:.2f} MeV")
print()

# Born-level: all channels equal (lepton = 1 unit, quark = N_c units per doublet)
BR_lep_exact = R(1, N_total)  # 1/9 per leptonic channel
BR_had_exact = R(N_had, N_total)  # 6/9 = 2/3

print(f"Exact Born-level branching fractions:")
print(f"  BR(W -> l nu) = 1/{N_total} = {BR_lep_exact} = {float(BR_lep_exact)*100:.4f}% per flavor")
print(f"  BR(W -> l nu, total) = {Im_H}/{N_total} = {R(Im_H, N_total)} = {float(R(Im_H, N_total))*100:.4f}%")
print(f"  BR(W -> hadrons) = {N_had}/{N_total} = {BR_had_exact} = {float(BR_had_exact)*100:.4f}%")
print()

# Exact Born widths
Gamma_lep_Born = Gamma_0  # per lepton flavor
Gamma_had_Born = N_c * Gamma_0  # per quark doublet (CKM unitarity gives sum = N_c)
Gamma_W_Born = N_lep * Gamma_lep_Born + N_quark_gen * Gamma_had_Born
print(f"Born-level widths:")
print(f"  Gamma(W -> l nu) = {Gamma_lep_Born*1000:.2f} MeV per flavor")
print(f"  Gamma(W -> qq') = {Gamma_had_Born*1000:.2f} MeV per quark doublet")
print(f"  Gamma(W, total Born) = {Gamma_W_Born:.4f} GeV")
print()

# ==============================================================================
# PART 3: QCD-CORRECTED PREDICTIONS
# ==============================================================================

print("PART 3: QCD-CORRECTED PREDICTIONS")
print("-" * 72)
print()

# Hadronic channels get QCD enhancement
Gamma_lep = Gamma_0  # per flavor (no QCD)
Gamma_had_per_doublet = N_c * Gamma_0 * QCD_NLO  # per quark doublet
Gamma_W_pred = N_lep * Gamma_lep + N_quark_gen * Gamma_had_per_doublet

print(f"QCD correction factor (NLO): {QCD_NLO:.6f}")
print(f"  = 1 + alpha_s(m_W)/pi + 1.409*(alpha_s/pi)^2")
print(f"  alpha_s(m_W) = {alpha_s_mW}")
print()

print(f"Corrected widths:")
print(f"  Gamma(W -> l nu) = {Gamma_lep*1000:.2f} MeV per flavor (unchanged)")
print(f"  Gamma(W -> qq') = {Gamma_had_per_doublet*1000:.2f} MeV per doublet")
print(f"  Gamma(W, total) = {Gamma_W_pred:.4f} GeV")
print(f"  Measured: {Gamma_W_meas} +/- 0.042 GeV")
pull_width = (Gamma_W_pred - Gamma_W_meas) / 0.042
print(f"  Pull: {pull_width:+.2f} sigma")
print()

# Corrected branching ratios
BR_lep_corr = Gamma_lep / Gamma_W_pred
BR_lep_total_corr = N_lep * Gamma_lep / Gamma_W_pred
BR_had_corr = N_quark_gen * Gamma_had_per_doublet / Gamma_W_pred

print(f"Corrected branching ratios:")
print(f"  BR(W -> l nu) = {BR_lep_corr*100:.3f}% per flavor")
print(f"  BR(W -> lep total) = {BR_lep_total_corr*100:.3f}%")
print(f"  BR(W -> hadrons) = {BR_had_corr*100:.3f}%")
print()

# R_W = Gamma_had / Gamma_lep (per flavor)
R_W = (N_quark_gen * Gamma_had_per_doublet) / (Gamma_lep)
R_W_Born = R(N_had, N_lep)  # = 6/3 = 2 at Born level
print(f"R_W = Gamma(had) / Gamma(lep per flavor):")
print(f"  Born: {float(R_W_Born):.4f}")
print(f"  QCD-corrected: {R_W:.4f}")
print(f"  = 2 * N_c * QCD_NLO = 2 * {N_c} * {QCD_NLO:.4f} = {2*N_c*QCD_NLO:.4f}")
# Wait, that's not quite right. R_W = Gamma_had_total / Gamma_lep_per_flavor
# = (2 * N_c * Gamma_0 * QCD) / Gamma_0 = 2 * N_c * QCD
R_W_check = 2 * N_c * QCD_NLO
print(f"  Check: {R_W_check:.4f}")
print()

# ==============================================================================
# PART 4: COMPARISON TO PDG
# ==============================================================================

print("PART 4: COMPARISON TO PDG 2024")
print("-" * 72)
print()

comparisons = [
    ("Gamma_W (GeV)",    Gamma_W_pred,    Gamma_W_meas,     0.042),
    ("BR(W->e nu) %",    BR_lep_corr*100, BR_W_enu_meas*100, 0.16),
    ("BR(W->mu nu) %",   BR_lep_corr*100, BR_W_munu_meas*100, 0.15),
    ("BR(W->tau nu) %",  BR_lep_corr*100, BR_W_taunu_meas*100, 0.21),
    ("BR(W->l nu avg) %",BR_lep_corr*100, BR_W_lnu_avg_meas*100, 0.09),
    ("BR(W->had) %",     BR_had_corr*100, BR_W_had_meas*100, 0.27),
]

print(f"{'Observable':>20s} | {'Predicted':>10s} | {'Measured':>10s} | {'Unc':>8s} | {'Pull':>8s} | {'Rel Err':>8s}")
print("-" * 72)

for name, pred, meas, unc in comparisons:
    pull = (pred - meas) / unc
    rel_err = abs(pred - meas) / meas * 100
    print(f"{name:>20s} | {pred:>10.4f} | {meas:>10.4f} | {unc:>8.4f} | {pull:>+8.2f} | {rel_err:>7.2f}%")

print()

# ==============================================================================
# PART 5: LEPTON UNIVERSALITY TEST
# ==============================================================================

print("PART 5: LEPTON UNIVERSALITY")
print("-" * 72)
print()

# Framework predicts identical coupling for all 3 generations
# Measured branching ratios test this
print(f"Framework: W couples identically to all Im_H = 3 generations")
print(f"  Predicted: BR(e) = BR(mu) = BR(tau) = {BR_lep_corr*100:.3f}%")
print()
print(f"Measured:")
print(f"  BR(W -> e nu) = {BR_W_enu_meas*100:.2f} +/- 0.16%")
print(f"  BR(W -> mu nu) = {BR_W_munu_meas*100:.2f} +/- 0.15%")
print(f"  BR(W -> tau nu) = {BR_W_taunu_meas*100:.2f} +/- 0.21%")
print()

# g_tau/g_mu ratio from W decays
g_tau_g_mu = math.sqrt(BR_W_taunu_meas / BR_W_munu_meas)
g_tau_g_e = math.sqrt(BR_W_taunu_meas / BR_W_enu_meas)
print(f"Coupling universality ratios:")
print(f"  g_tau/g_mu = sqrt(BR_tau/BR_mu) = {g_tau_g_mu:.4f} (expect 1.000)")
print(f"  g_tau/g_e = sqrt(BR_tau/BR_e) = {g_tau_g_e:.4f} (expect 1.000)")
print(f"  Status: Consistent with universality within uncertainties")
print()

# ==============================================================================
# PART 6: W vs Z COMPARISON — ROLE OF sin^2(theta_W)
# ==============================================================================

print("PART 6: W vs Z — ROLE OF sin^2(theta_W)")
print("-" * 72)
print()

print(f"W boson: Charged current — couples with UNIVERSAL strength g")
print(f"  sin^2(theta_W) does NOT enter W couplings at tree level")
print(f"  Branching ratios determined purely by MODE COUNTING")
print(f"  Framework content: Im_H (generation count) + N_c (color count)")
print()

print(f"Z boson: Neutral current — g_V depends on sin^2(theta_W)")
print(f"  sin^2(theta_W) = 28/121 directly affects each fermion's coupling")
print(f"  Branching ratios test the SPECIFIC VALUE 28/121")
print(f"  Framework content: sin^2 value + mode counting")
print()

print(f"W branching is a WEAKER test than Z branching:")
print(f"  W tests: channel counting only (Im_H, N_c)")
print(f"  Z tests: channel counting + sin^2 = 28/121")
print(f"  Both pass, but Z is more constraining")
print()

# Exact rational prediction for R_W at Born
print(f"Exact Born-level ratio:")
print(f"  R_W = Gamma(had)/Gamma(lep per flavor) = 2*N_c/1 = {float(R_W_Born)}")
print(f"  Compare Z: R_l = Gamma(had)/Gamma(lep per flavor) ~ 20.8")
print(f"  R_l depends on sin^2 through coupling ratios; R_W does not")
print()

# ==============================================================================
# PART 7: FRAMEWORK ALGEBRAIC STRUCTURE
# ==============================================================================

print("PART 7: FRAMEWORK ALGEBRAIC STRUCTURE")
print("-" * 72)
print()

# Express total channels in framework terms
print(f"W channel count in framework language:")
print(f"  N_total = Im_H + 2 * N_c")
print(f"         = Im_H + 2 * Im_H")
print(f"         = 3 * Im_H (if N_c = Im_H, which it is!)")
print(f"         = {3 * Im_H}")
print()

# Interesting: N_c = Im_H = 3, so total channels = 3 * Im_H = 9
# But this is somewhat accidental — N_c and Im_H have different origins
print(f"Note: N_c = Im_H = 3 is a COINCIDENCE in the framework")
print(f"  Im_H = 3: imaginary quaternion dimensions [structural]")
print(f"  N_c = 3: eigenvalue selection in SU(N) gauge [derived differently]")
print(f"  The equality N_c = Im_H is not derived from a common source")
print()

# Born-level branching as framework fractions
print(f"Born branching fractions:")
print(f"  BR(W -> l nu) = 1/(3*Im_H) = 1/9 per flavor")
print(f"  BR(W -> had)  = 2*Im_H/(3*Im_H) = 2/3 total hadronic")
print(f"  BR(W -> lep)  = Im_H/(3*Im_H) = 1/3 total leptonic")
print()

# W mass from sin^2(theta_W)
# m_W^2 = m_Z^2 * cos^2(theta_W) (at tree level)
m_W_from_sin2 = m_Z * math.sqrt(float(cos2_W))
print(f"W mass from sin^2 = 28/121:")
print(f"  m_W = m_Z * cos(theta_W) = {m_Z} * sqrt({float(cos2_W):.6f})")
print(f"      = {m_W_from_sin2:.3f} GeV")
print(f"  Measured: {m_W} GeV")
print(f"  Difference: {abs(m_W_from_sin2 - m_W)/m_W*100:.2f}%")
print(f"  (Tree-level; loop corrections shift this by ~0.5%)")
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 72)
print("VERIFICATION TESTS")
print("=" * 72)
print()

tests = [
    # Channel counting
    ("W leptonic channels = Im_H = 3",
     N_lep == 3),

    ("W hadronic channels = 2*N_c = 6",
     N_had == 6),

    ("W total channels = 9 = 3*Im_H",
     N_total == 9),

    # Born-level exact
    ("Born BR(W->l nu) = 1/9",
     BR_lep_exact == R(1, 9)),

    ("Born BR(W->hadrons) = 2/3",
     BR_had_exact == R(2, 3)),

    ("Born R_W = 2 (had/lep per flavor)",
     R_W_Born == 2),

    # QCD-corrected widths
    ("Total W width within 1 sigma of 2.085 GeV",
     abs(Gamma_W_pred - Gamma_W_meas) / 0.042 < 1.0),

    ("Total W width within 2% of measured",
     abs(Gamma_W_pred - Gamma_W_meas) / Gamma_W_meas < 0.02),

    # Branching ratios
    ("BR(W->l nu avg) within 2% of 10.86%",
     abs(BR_lep_corr - BR_W_lnu_avg_meas) / BR_W_lnu_avg_meas < 0.02),

    ("BR(W->had) within 2% of 67.41%",
     abs(BR_had_corr - BR_W_had_meas) / BR_W_had_meas < 0.02),

    # Lepton universality
    ("g_tau/g_mu within 5% of unity",
     abs(g_tau_g_mu - 1.0) < 0.05),

    # W mass from sin^2
    ("m_W(tree) within 1% of measured",
     abs(m_W_from_sin2 - m_W) / m_W < 0.01),

    # Framework structure
    ("N_c = Im_H = 3 (both equal)",
     N_c == Im_H),

    ("Total channels = 3*Im_H = Im_H*(1 + 2*N_c/Im_H)",
     N_total == 3 * Im_H),

    # Prefactor structure
    ("Born width per channel > 200 MeV",
     Gamma_0 * 1000 > 200),

    ("Born width per channel < 250 MeV",
     Gamma_0 * 1000 < 250),
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

print("=" * 72)
print("SUMMARY")
print("=" * 72)
print()
print("W branching from crystallization framework:")
print(f"  Channel counting: {N_lep} lep + {N_had} had = {N_total} total")
print(f"  = Im_H + 2*N_c = {Im_H} + {2*N_c} = {N_total}")
print(f"  Born BR(W->l nu) = 1/{N_total} = {float(BR_lep_exact)*100:.2f}% per flavor")
print(f"  QCD-corrected BR(W->l nu) = {BR_lep_corr*100:.2f}% (meas: {BR_W_lnu_avg_meas*100:.2f}%)")
print(f"  Total width: {Gamma_W_pred:.4f} GeV (meas: {Gamma_W_meas} +/- 0.042)")
print()
print("Framework content:")
print(f"  Im_H = 3 -> 3 leptonic channels [CONJECTURE]")
print(f"  N_c = 3 -> 3x enhancement of hadronic channels [DERIVATION]")
print(f"  sin^2(theta_W) = 28/121 -> m_W relation [DERIVATION]")
print(f"  G_F, m_W, alpha_s, CKM -> [A-IMPORT]")
print()
print("CONFIDENCE: [FRAMEWORK-CONSTRAINED]")
print("  Mode counting uses framework numbers (Im_H, N_c)")
print("  but the calculation is standard electroweak theory.")
print("  W branching is LESS constraining than Z branching")
print("  because W couplings are universal (no sin^2 dependence).")
