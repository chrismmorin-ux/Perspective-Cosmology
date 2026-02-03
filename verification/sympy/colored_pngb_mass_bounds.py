#!/usr/bin/env python3
"""
Colored pNGB Mass Bounds vs LHC Searches

KEY FINDING: Crude one-loop QCD estimate gives m_colored ~ 151 GeV,
which is ~10x BELOW current LHC leptoquark bounds (~1.5 TeV).
Enhanced estimates with log factors and multi-site models can raise
masses to ~500-1500 GeV range. Tension is REAL but resolvable.

The S parameter independently requires colored pNGBs to be heavy
(see ewsb_oblique_parameters.py).

Status: CONJECTURE (mass estimate is model-dependent)
Depends on:
- [DERIVATION] 24 colored pNGBs in (2,3)+(2,3bar) (S175, S195)
- [CONJECTURE] f = v*n_c/2 ~ 1354 GeV (S179)
- [I-MATH] One-loop Coleman-Weinberg mass formula
- [I] alpha_s(M_Z) = 0.1179 (PDG 2022)
- [I] LHC leptoquark bounds ~ 1.5 TeV (CMS/ATLAS Run 2)

Created: Session 210
"""

import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from sympy import (Rational, sqrt, simplify, pi, log, S, N as Neval,
                   Float, oo, symbols)
import numpy as np

# ==============================================================================
# FRAMEWORK QUANTITIES
# ==============================================================================

n_d = 4
n_c = 11
Im_O = 7
Im_H = 3
O_dim = 8
N_c = 3         # QCD colors

N_Gold_1 = n_d * Im_O           # = 28
N_Higgs = n_d                    # = 4
N_colored = N_Gold_1 - N_Higgs   # = 24

xi = Rational(n_d, n_c**2)       # = 4/121
v_EW = 246.22                     # GeV
f_val = v_EW * n_c / 2           # ~ 1354.21 GeV

# QCD parameters
alpha_s_MZ = 0.1179              # [I] PDG 2022
g_s = np.sqrt(4 * np.pi * alpha_s_MZ)  # strong coupling

# Casimir for fundamental of SU(3)
C2_fund = Rational(4, 3)         # C_2(3) = (N^2-1)/(2N) = 4/3
C2_fund_f = float(C2_fund)

# LHC bounds
m_LQ_bound = 1500               # [I] GeV, scalar leptoquark (CMS, 3rd gen)
m_LQ_bound_1st = 1800           # [I] GeV, 1st gen leptoquarks

print("=" * 70)
print("COLORED pNGB MASS BOUNDS vs LHC SEARCHES")
print("=" * 70)
print(f"\nFramework colored pNGBs: {N_colored} DOF in (2,3) + (2,3bar)")
print(f"f = v * n_c/2 = {f_val:.2f} GeV")
print(f"alpha_s(M_Z) = {alpha_s_MZ}")
print(f"g_s = {g_s:.4f}")
print(f"C_2(fund) = {C2_fund} = {C2_fund_f:.4f}")


# ==============================================================================
# PART 1: CRUDE ONE-LOOP ESTIMATE
# ==============================================================================

print("\n" + "=" * 70)
print("PART 1: Crude One-Loop QCD Mass Estimate")
print("=" * 70)

print("""
The simplest CW estimate for colored pNGB masses:

  m_col^2 ~ (alpha_s / (4*pi)) * C_2(R) * f^2

This is the MINIMAL estimate with no enhancement factors.
""")

m_crude = np.sqrt(alpha_s_MZ * C2_fund_f / (4 * np.pi)) * f_val
print(f"m_crude = sqrt(alpha_s * C_2 / (4*pi)) * f")
print(f"        = sqrt({alpha_s_MZ} * {C2_fund_f:.4f} / {4*np.pi:.4f}) * {f_val:.2f}")
print(f"        = {m_crude:.1f} GeV")
print(f"\n*** TENSION: m_crude = {m_crude:.0f} GeV << LHC bound ~ {m_LQ_bound} GeV ***")
print(f"*** Factor needed: {m_LQ_bound / m_crude:.1f}x enhancement ***")


# ==============================================================================
# PART 2: ENHANCED ESTIMATE WITH LOG FACTOR
# ==============================================================================

print("\n" + "=" * 70)
print("PART 2: Enhanced Estimate with Log Factor")
print("=" * 70)

print("""
In realistic composite Higgs models, the CW mass picks up a
logarithmic enhancement from the UV cutoff Lambda:

  m_col^2 ~ (3 * C_2 * alpha_s / (4*pi)) * f^2 * log(Lambda^2/f^2)

With Lambda ~ 4*pi*f (strong coupling scale):
  log(Lambda^2/f^2) = log(16*pi^2) ~ 5.07
""")

Lambda_strong = 4 * np.pi * f_val  # strong coupling scale
log_factor = np.log(Lambda_strong**2 / f_val**2)
print(f"Lambda = 4*pi*f = {Lambda_strong:.0f} GeV")
print(f"log(Lambda^2/f^2) = log(16*pi^2) = {log_factor:.4f}")

m_enhanced = np.sqrt(3 * C2_fund_f * alpha_s_MZ / (4 * np.pi) * log_factor) * f_val
print(f"\nm_enhanced = sqrt(3*C_2*alpha_s/(4*pi) * log(16*pi^2)) * f")
print(f"           = {m_enhanced:.1f} GeV")
print(f"\nStill below LHC bound by factor {m_LQ_bound / m_enhanced:.2f}")


# ==============================================================================
# PART 3: MULTI-SITE MODEL ENHANCEMENT
# ==============================================================================

print("\n" + "=" * 70)
print("PART 3: Multi-Site Model Enhancement (N_CW scan)")
print("=" * 70)

print("""
In multi-site (moose/deconstructed) models, the CW mass gets an
additional enhancement factor N_CW from the number of composite
resonance layers:

  m_col^2 ~ N_CW * (3 * C_2 * g_s^2 / (16*pi^2)) * f^2 * log(Lambda^2/f^2)

This is physically motivated: the colored pNGBs couple to multiple
layers of composite resonances, each contributing to the CW potential.

Typical models: N_CW = 2-6 (two-site, three-site, etc.)
""")

print(f"{'N_CW':>5s} | {'m_col (GeV)':>12s} | {'vs LHC bound':>12s} | {'Status':>10s}")
print("-" * 50)

N_CW_values = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20]
N_CW_min_needed = None

for N_CW in N_CW_values:
    m_col = np.sqrt(N_CW * 3 * C2_fund_f * g_s**2 / (16 * np.pi**2) * log_factor) * f_val
    ratio = m_col / m_LQ_bound
    status = "SAFE" if m_col > m_LQ_bound else "TENSION"
    if m_col > m_LQ_bound and N_CW_min_needed is None:
        N_CW_min_needed = N_CW
    print(f"{N_CW:>5d} | {m_col:>12.0f} | {ratio:>12.2f} | {status}")

if N_CW_min_needed:
    print(f"\nMinimum N_CW for LHC safety: {N_CW_min_needed}")
else:
    print(f"\nN_CW up to 20 insufficient; need N_CW > 20 or alternative mechanism")


# ==============================================================================
# PART 4: ALTERNATIVE — DIRECT GAUGE COUPLING ESTIMATE
# ==============================================================================

print("\n" + "=" * 70)
print("PART 4: Alternative Estimate (g_s * f)")
print("=" * 70)

print("""
A common parametric estimate in composite Higgs literature:

  m_col ~ g_s * f / (4*pi) * sqrt(some_factor)

Or more simply, masses of order g_s * f for strongly-coupled resonances:

  m_rho ~ g_rho * f  where g_rho ~ 1-4*pi
""")

# Direct parametric estimates
m_parametric_weak = g_s * f_val / (4 * np.pi)
m_parametric_mid = g_s * f_val / np.sqrt(4 * np.pi)
m_parametric_strong = g_s * f_val

print(f"Weak coupling estimate: g_s*f/(4*pi) = {m_parametric_weak:.0f} GeV")
print(f"Geometric mean:         g_s*f/sqrt(4*pi) = {m_parametric_mid:.0f} GeV")
print(f"Strong coupling:        g_s*f = {m_parametric_strong:.0f} GeV")

# For composite resonances: m_rho ~ 4*pi*f / sqrt(N) with N = N_c
m_rho = 4 * np.pi * f_val / np.sqrt(N_c)
print(f"\nComposite resonance scale: 4*pi*f/sqrt(N_c) = {m_rho:.0f} GeV")
print(f"  This is where the pNGB approximation breaks down")


# ==============================================================================
# PART 5: WHAT xi WOULD NEED TO BE
# ==============================================================================

print("\n" + "=" * 70)
print("PART 5: Required xi for m_col > LHC Bound (crude estimate)")
print("=" * 70)

print("""
If m_col ~ sqrt(alpha_s * C_2 / (4*pi)) * f, then requiring m_col > 1500 GeV:

  f > 1500 / sqrt(alpha_s * C_2 / (4*pi))
  xi = v^2/f^2 < v^2 * alpha_s * C_2 / (4*pi * 1500^2)
""")

f_needed_crude = m_LQ_bound / np.sqrt(alpha_s_MZ * C2_fund_f / (4 * np.pi))
xi_needed_crude = v_EW**2 / f_needed_crude**2
print(f"Crude: f > {f_needed_crude:.0f} GeV => xi < {xi_needed_crude:.6f}")
print(f"  This would require f ~ {f_needed_crude/1000:.1f} TeV")
print(f"  Framework f = {f_val/1000:.2f} TeV is {f_needed_crude/f_val:.1f}x too small (crude)")

# With log enhancement
f_needed_log = m_LQ_bound / np.sqrt(3 * C2_fund_f * alpha_s_MZ / (4 * np.pi) * log_factor)
xi_needed_log = v_EW**2 / f_needed_log**2
print(f"\nWith log: f > {f_needed_log:.0f} GeV => xi < {xi_needed_log:.6f}")
print(f"  Framework f = {f_val/1000:.2f} TeV: factor {f_needed_log/f_val:.2f} (better but still tight)")


# ==============================================================================
# PART 6: HONEST ASSESSMENT
# ==============================================================================

print("\n" + "=" * 70)
print("PART 6: Honest Assessment of Colored pNGB Tension")
print("=" * 70)

print(f"""
SITUATION:
  Framework predicts: 24 colored pNGBs (leptoquark-like) at scale f ~ 1.35 TeV
  LHC bounds: scalar leptoquarks > 1.5 TeV (3rd gen), > 1.8 TeV (1st gen)
  Crude mass estimate: ~{m_crude:.0f} GeV (10x below bounds)

RESOLUTION PATHS:
  1. Multi-site enhancement (N_CW ~ {N_CW_min_needed or '>20'}) — physically motivated
  2. Large anomalous dimensions from strong dynamics
  3. Additional mass contributions from top partial compositeness
  4. Colored pNGBs couple to light quarks differently than assumed
     (leptoquark bounds assume beta=1; if beta << 1, bounds weaken)
  5. These are NOT standard leptoquarks:
     - They are SU(2)_L doublets, not singlets
     - Their couplings may be suppressed by 1/f^2 mixing

WHAT IS CERTAIN:
  - Colored scalars lighter than ~150 GeV are RULED OUT by LHC
  - S parameter requires m_colored > ~1 TeV (see oblique parameters)
  - The pNGBs MUST get substantial mass beyond the crude estimate
  - This is GENERIC to ALL composite Higgs models with colored pNGBs

VERDICT: Tension is real but EXPECTED — it mirrors the "little hierarchy
problem" of composite Higgs models. The framework does not make this worse
or better than generic MCHM models.
""")


# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    # Counting
    ("Colored pNGBs = 24 = N_Gold - N_Higgs",
     N_colored == 24),

    ("N_Gold = n_d * Im_O = 28",
     N_Gold_1 == 28),

    ("Colored DOF decomposition: 24 = 2*2*3 + 2*2*3 (doublet-triplet pairs)",
     N_colored == 2*2*3 + 2*2*3),

    # Mass estimates
    ("Crude estimate m_crude > 100 GeV (positive, physical)",
     m_crude > 100),

    ("Crude estimate m_crude < 200 GeV (confirms tension)",
     m_crude < 200),

    ("Enhanced estimate m_enhanced > m_crude (log factor helps)",
     m_enhanced > m_crude),

    ("Enhanced estimate still below LHC bound",
     m_enhanced < m_LQ_bound),

    # Tension documentation
    ("Tension factor > 5 (crude vs LHC)",
     m_LQ_bound / m_crude > 5),

    # Framework consistency
    ("f = v * n_c/2 within 1 GeV of 1354",
     abs(f_val - 1354.21) < 1),

    ("xi = 4/121 = 0.033... (EW safe)",
     abs(float(xi) - 4/121) < 1e-10),

    # Physical bounds
    ("Composite resonance scale > f (m_rho > f)",
     m_rho > f_val),

    ("Composite resonance scale ~ 10 TeV (order of magnitude)",
     5000 < m_rho < 15000),

    # Casimir
    ("C_2(fund SU(3)) = 4/3",
     C2_fund == Rational(4, 3)),

    # Multi-site resolution exists
    ("N_CW solution exists with N_CW <= 20",
     N_CW_min_needed is not None and N_CW_min_needed <= 20),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print(f"\n{'ALL TESTS PASSED' if all_pass else 'SOME TESTS FAILED'}: "
      f"{sum(1 for _, p in tests if p)}/{len(tests)}")
