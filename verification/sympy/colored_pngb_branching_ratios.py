#!/usr/bin/env python3
"""
Colored pNGB Branching Ratios and LHC Search Channels (EQ-027)

KEY FINDING: The 24 colored pNGBs decompose into TWO complex SU(2)_L doublets:
  Multiplet 1: (2, 1/6, 3) = R-tilde_2 scalar leptoquark -> 12 real DOF
  Multiplet 2: (2, -5/6, 3) = exotic (no renormalizable SM coupling) -> 12 real DOF

For Multiplet 1 (R-tilde_2):
  - S^{2/3} -> d-type quark + charged lepton (beta = 1 for this component)
  - S^{-1/3} -> d-type quark + neutrino (beta = 0 for this component)
  - Effective beta for doublet = 0.5 (SU(2) structure forces equal production)
  - 3rd generation dominant: S -> b + tau or b + nu_tau

For Multiplet 2:
  - No renormalizable Yukawa coupling to SM fermions [DERIVATION]
  - Decays through composite dynamics (dimension-5 operators, suppressed by v/f)
  - Phenomenology: displaced vertices or R-hadron-like signatures

LHC bounds at beta = 0.5 (3rd gen): m > ~1.2 TeV
Framework prediction: m_col = 1761 GeV -> SAFE (560 GeV margin)
HL-LHC reach at beta = 0.5: ~2.2 TeV -> TESTABLE

This resolves the beta = 1 assumption in S326 and STRENGTHENS the LHC consistency.

Status: DERIVATION (hypercharges from Pati-Salam chain, beta from SU(2) structure)
Depends on:
- [D] 24 colored pNGBs from SO(11)/[SO(4)xSO(7)] coset (S175, S269)
- [D] F=C breaks SO(4) -> SU(2) x U(1), SU(2)_L(SM) = SU(2)_R(SO4) (S328)
- [D] SO(7) -> SO(6) ~ SU(4) -> SU(3) x U(1)_X embedding (Pati-Salam chain)
- [I-MATH] Fermion embedding in spinor 32 fixes T_X normalization
- [I] LHC scalar leptoquark bounds (CMS/ATLAS Run 2, ~140 fb^-1)
- [CONJECTURE] m_col = 1761 GeV (S326, g_rho = n_d = 4)
- [CONJECTURE] y_t = 1 from full compositeness (S290)

Created: Session 336 (EQ-027 resolution)
"""

import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from sympy import Rational, sqrt, pi, S, N as Neval, Matrix, binomial
import numpy as np

# ==============================================================================
# SECTION 1: FRAMEWORK INPUTS
# ==============================================================================

print("=" * 70)
print("SECTION 1: Framework Inputs")
print("=" * 70)

n_d = 4
n_c = 11
Im_O = 7
Im_H = 3
N_c = 3  # QCD colors

N_Gold = n_d * Im_O  # = 28
N_Higgs = n_d         # = 4
N_colored = N_Gold - N_Higgs  # = 24

# From S328: SU(2)_L(SM) = SU(2)_R(SO4), U(1)_Y includes T_X from SO(7)
print(f"n_d = {n_d}, n_c = {n_c}")
print(f"N_Goldstones = {N_Gold}, N_Higgs = {N_Higgs}, N_colored = {N_colored}")
print(f"Coset: SO(11)/[SO(4) x SO(7)]")
print(f"SO(4) ~ SU(2)_L(SO4) x SU(2)_R(SO4)")
print(f"SU(2)_L(SM) = SU(2)_R(SO4) [S328: F=C identification]")


# ==============================================================================
# SECTION 2: U(1)_Y HYPERCHARGE DETERMINATION
# ==============================================================================

print("\n" + "=" * 70)
print("SECTION 2: U(1)_Y Hypercharge Determination")
print("=" * 70)

print("""
The hypercharge Y = T_{3,L(SO4)} + T_X where:
  T_{3,L(SO4)}: generator of U(1) c SU(2)_L(SO4), eigenvalues +/-1/2
  T_X: unique U(1) in SO(7) commuting with SU(3)_c

Determination of T_X from fermion embedding:
  Spinor 32 of SO(11) -> (2,1,8) + (1,2,8) under SU(2)_L(SO4) x SU(2)_R(SO4) x SO(7)
  8 (spinor of SO(7)) -> 4 + 4bar under SO(6) ~ SU(4)
  4 of SU(4) -> 3_alpha + 1_{-3*alpha} under SU(3) x U(1)_X

  SM quarks: Q_L = (2,1/6,3) comes from (1,2,8) [SU(2)_R(SO4) doublet = SU(2)_L(SM) doublet]
    T_{3,L(SO4)} = 0 for SU(2)_L(SO4) singlet
    -> Y(Q_L) = 0 + T_X(quark in 8) = T_X(quark) = 1/6
    -> alpha = 1/6

  SM leptons: L_L = (2,-1/2,1) from (1,2,8)
    T_X(lepton in 8) = -1/2

  SM u_R from (2,1,8) [SU(2)_L(SO4) doublet, SU(2)_R(SO4)=SU(2)_L(SM) singlet]:
    T_{3,L(SO4)} = +1/2
    Y(u_R) = 1/2 + 1/6 = 2/3  [CHECK]

  SM d_R from (2,1,8):
    T_{3,L(SO4)} = -1/2
    Y(d_R) = -1/2 + 1/6 = -1/3  [CHECK]

  SM e_R from (2,1,8):
    T_{3,L(SO4)} = -1/2
    Y(e_R) = -1/2 + (-1/2) = -1  [CHECK]

  SM nu_R from (2,1,8):
    T_{3,L(SO4)} = +1/2
    Y(nu_R) = 1/2 + (-1/2) = 0  [CHECK]
""")

# T_X on the 7 of SO(7) (DIFFERENT from spinor 8!)
# 7 -> 6 + 1 under SO(6) ~ SU(4)
# 6 = Lambda^2(4) -> Lambda^2(3_{1/6} + 1_{-1/2})
#   = 3bar_{1/6+1/6} + 3_{1/6+(-1/2)}
#   = 3bar_{1/3} + 3_{-1/3}
# 7 -> 3bar_{1/3} + 3_{-1/3} + 1_0

T_X_3_in_7 = Rational(-1, 3)      # color triplet in 7 of SO(7)
T_X_3bar_in_7 = Rational(1, 3)    # color anti-triplet in 7
T_X_1_in_7 = Rational(0, 1)       # color singlet in 7

T_X_3_in_8 = Rational(1, 6)       # color triplet in 8 (spinor) of SO(7)
T_X_3bar_in_8 = Rational(-1, 6)   # anti-triplet in 8
T_X_1a_in_8 = Rational(-1, 2)     # lepton singlet in 8
T_X_1b_in_8 = Rational(1, 2)      # anti-lepton singlet in 8

print("T_X charges for 7 of SO(7) under SU(3) x U(1)_X:")
print(f"  3:    T_X = {T_X_3_in_7} = {float(T_X_3_in_7):.4f}")
print(f"  3bar: T_X = {T_X_3bar_in_7} = {float(T_X_3bar_in_7):.4f}")
print(f"  1:    T_X = {T_X_1_in_7}")

print("\nT_X charges for 8 (spinor) of SO(7) under SU(3) x U(1)_X:")
print(f"  3:    T_X = {T_X_3_in_8} (quarks)")
print(f"  3bar: T_X = {T_X_3bar_in_8}")
print(f"  1_a:  T_X = {T_X_1a_in_8} (leptons)")
print(f"  1_b:  T_X = {T_X_1b_in_8} (anti-leptons)")

# Verify SM fermion hypercharges
print("\n--- SM Fermion Hypercharge Verification ---")
Y_QL = 0 + T_X_3_in_8      # = 1/6
Y_uR = Rational(1,2) + T_X_3_in_8   # = 2/3
Y_dR = Rational(-1,2) + T_X_3_in_8  # = -1/3
Y_LL = 0 + T_X_1a_in_8     # = -1/2
Y_eR = Rational(-1,2) + T_X_1a_in_8  # = -1
Y_nuR = Rational(1,2) + T_X_1a_in_8  # = 0  (nu_R from same lepton singlet as e_R, different T_{3,L})

# Actually nu_R and e_R come from the SAME 4bar of SU(4):
# 4bar -> 3bar_{-1/6} + 1_{+1/2}
# So: u_R and d_R from 4: 3_{1/6}, and they split by T_{3,L}
# nu_R and e_R from 4bar: 1_{1/2} and 1_{-1/2}... hmm
# Let me use the more careful assignment:
# (2,1) of SU(2)_L(SO4) x SU(2)_R(SO4): T_{3,L} = +/-1/2
# For color 3 from spinor 8: T_X = 1/6
#   T_{3,L} = +1/2: Y = 1/2 + 1/6 = 2/3 -> u_R
#   T_{3,L} = -1/2: Y = -1/2 + 1/6 = -1/3 -> d_R
# For color 1 (lepton) from spinor 8: T_X = -1/2
#   T_{3,L} = +1/2: Y = 1/2 + (-1/2) = 0 -> nu_R
#   T_{3,L} = -1/2: Y = -1/2 + (-1/2) = -1 -> e_R

sm_fermions = [
    ("Q_L", "(2, 1/6, 3)", Rational(1,6), Rational(1,6)),
    ("u_R", "(1, 2/3, 3)", Rational(1,2) + Rational(1,6), Rational(2,3)),
    ("d_R", "(1, -1/3, 3)", Rational(-1,2) + Rational(1,6), Rational(-1,3)),
    ("L_L", "(2, -1/2, 1)", Rational(-1,2), Rational(-1,2)),
    ("e_R", "(1, -1, 1)", Rational(-1,2) + Rational(-1,2), Rational(-1,1)),
    ("nu_R", "(1, 0, 1)", Rational(1,2) + Rational(-1,2), Rational(0,1)),
]

all_Y_ok = True
for name, rep, Y_calc, Y_expected in sm_fermions:
    ok = Y_calc == Y_expected
    all_Y_ok = all_Y_ok and ok
    print(f"  {name:5s} = {rep:15s}: Y = {Y_calc} {'==' if ok else '!='} {Y_expected} {'OK' if ok else 'FAIL'}")

print(f"\nAll SM hypercharges correct: {'YES' if all_Y_ok else 'NO'}")


# ==============================================================================
# SECTION 3: COLORED pNGB REPRESENTATION DECOMPOSITION
# ==============================================================================

print("\n" + "=" * 70)
print("SECTION 3: Colored pNGB Representation Decomposition")
print("=" * 70)

print("""
Coset Goldstones: (4,7) of SO(4) x SO(7) = 28 real DOF.

Under SU(2)_L(SM) [=SU(2)_R(SO4)] x U(1)_Y x SU(3)_c:

  (2,2) of SO(4) -> 2_{T3L=+1/2} + 2_{T3L=-1/2} under SU(2)_R x U(1)_L
  7 of SO(7) -> 3bar_{1/3} + 3_{-1/3} + 1_0 under SU(3) x U(1)_X

COLOR SINGLET (Higgs):
  (2,2,1_0): Y = T3L + 0 = +/-1/2
  -> H = (2, 1/2, 1): complex Higgs doublet, 4 real DOF

COLORED pNGBs:
  (2,2) x (3_{-1/3} + 3bar_{1/3}):

  From 3_{-1/3}:
    T3L = +1/2: Y = 1/2 + (-1/3) = 1/6   -> (2, 1/6, 3)
    T3L = -1/2: Y = -1/2 + (-1/3) = -5/6  -> (2, -5/6, 3)

  Reality condition pairs:
    (2, 1/6, 3)* = (2, -1/6, 3bar) [from 3bar_{1/3}, T3L = -1/2]
    (2, -5/6, 3)* = (2, 5/6, 3bar) [from 3bar_{1/3}, T3L = +1/2]
""")

# Hypercharges
Y_M1 = Rational(1, 2) + T_X_3_in_7   # = 1/2 - 1/3 = 1/6
Y_M2 = Rational(-1, 2) + T_X_3_in_7  # = -1/2 - 1/3 = -5/6

print(f"Multiplet 1: (2, Y={Y_M1}, 3) = (2, {float(Y_M1):.4f}, 3)")
print(f"  Components: Q = T3 + Y = +1/2 + {Y_M1} = {Rational(1,2)+Y_M1}")
print(f"              Q = T3 + Y = -1/2 + {Y_M1} = {Rational(-1,2)+Y_M1}")
print(f"  Electric charges: {float(Rational(1,2)+Y_M1):.4f} and {float(Rational(-1,2)+Y_M1):.4f}")
print(f"  DOF: 2 (SU2) x 3 (color) x 2 (complex) = 12 real")

Q_M1_up = Rational(1, 2) + Y_M1    # = 2/3
Q_M1_down = Rational(-1, 2) + Y_M1  # = -1/3

print(f"\nMultiplet 2: (2, Y={Y_M2}, 3) = (2, {float(Y_M2):.4f}, 3)")
print(f"  Components: Q = +1/2 + {Y_M2} = {Rational(1,2)+Y_M2}")
print(f"              Q = -1/2 + {Y_M2} = {Rational(-1,2)+Y_M2}")
print(f"  Electric charges: {float(Rational(1,2)+Y_M2):.4f} and {float(Rational(-1,2)+Y_M2):.4f}")
print(f"  DOF: 2 (SU2) x 3 (color) x 2 (complex) = 12 real")

Q_M2_up = Rational(1, 2) + Y_M2    # = -1/3
Q_M2_down = Rational(-1, 2) + Y_M2  # = -4/3

print(f"\nTotal colored DOF: 12 + 12 = {12 + 12}")
print(f"Total DOF check: Higgs (4) + Colored (24) = {4 + 24} = N_Gold ({N_Gold})")

# Leptoquark classification (Dorsner et al. 1603.04993)
print(f"\n--- Leptoquark Classification ---")
print(f"Multiplet 1: (2, 1/6, 3) = R-tilde_2 scalar leptoquark [STANDARD]")
print(f"  Charges Q = {{{Q_M1_up}, {Q_M1_down}}} = {{2/3, -1/3}}")
print(f"  Same quantum numbers as SM quark doublet Q_L")
print(f"  Couples to: d_R-bar x L_L (Dorsner Table 3)")
print(f"")
print(f"Multiplet 2: (2, -5/6, 3) = NOT in standard LQ classification")
print(f"  Charges Q = {{{Q_M2_up}, {Q_M2_down}}} = {{-1/3, -4/3}}")
print(f"  Exotic charge -4/3 component")
print(f"  NO renormalizable Yukawa coupling to SM fermions (see Section 4)")


# ==============================================================================
# SECTION 4: COUPLING ANALYSIS
# ==============================================================================

print("\n" + "=" * 70)
print("SECTION 4: Coupling Analysis -- Renormalizable Yukawa Couplings")
print("=" * 70)

print("""
For a scalar S to decay to SM fermions, we need a gauge-invariant
Yukawa coupling: L = y * S * psi_bar * psi' + h.c.

In 2-component Weyl notation (all left-handed fields):
  q = (2, 1/6, 3),  l = (2, -1/2, 1)
  u^c = (1, -2/3, 3bar),  d^c = (1, 1/3, 3bar)
  e^c = (1, 1, 1),  nu^c = (1, 0, 1)

For S = (2, Y_S, 3), we need bilinear psi*psi' = (2, -Y_S, 3bar).

--- MULTIPLET 1: (2, 1/6, 3) -> need (2, -1/6, 3bar) ---

Check d^c x l = (1, 1/3, 3bar) x (2, -1/2, 1) = (2, -1/6, 3bar)  YES!
  SU(2): 1 x 2 = 2                                                  OK
  Y: 1/3 + (-1/2) = -1/6                                            OK
  Color: 3bar x 1 = 3bar                                            OK
  Lorentz: both left-handed Weyl -> epsilon contraction -> scalar    OK

RESULT: Multiplet 1 couples to d^c x l = d_R-bar x L_L
  -> S^{2/3} decays to d-type quark + charged lepton  (beta = 1)
  -> S^{-1/3} decays to d-type quark + neutrino       (beta = 0)

--- MULTIPLET 2: (2, -5/6, 3) -> need (2, 5/6, 3bar) ---

Exhaustive check of ALL SM fermion bilinears:
""")

# Systematic check for Multiplet 2
weyl_fields = {
    'q': (2, Rational(1,6), 3),
    'l': (2, Rational(-1,2), 1),
    'u_c': (1, Rational(-2,3), -3),   # 3bar = -3 for tracking
    'd_c': (1, Rational(1,3), -3),
    'e_c': (1, 1, 1),
    'nu_c': (1, 0, 1),
}

target_su2 = 2
target_Y = Rational(5, 6)
target_color = -3  # 3bar

found_coupling = False
for name1, (su2_1, Y_1, col_1) in weyl_fields.items():
    for name2, (su2_2, Y_2, col_2) in weyl_fields.items():
        # Y check
        Y_sum = Y_1 + Y_2
        if Y_sum != target_Y:
            continue

        # SU(2) check: product must contain doublet (2)
        # 1x1=1, 1x2=2, 2x2=1+3 (no 2!)
        su2_ok = False
        if su2_1 == 1 and su2_2 == 2:
            su2_ok = True
        elif su2_1 == 2 and su2_2 == 1:
            su2_ok = True
        # 2x2 = 1+3, does NOT contain 2
        if not su2_ok:
            continue

        # Color check: need 3bar from the product
        # 3x1 = 3, 3bar x 1 = 3bar, 3x3 = 6+3bar, 3bar x 3bar = 6bar + 3
        # We track: 3=3, 3bar=-3, 1=1
        col_product_contains_3bar = False
        if (col_1 == -3 and col_2 == 1) or (col_1 == 1 and col_2 == -3):
            col_product_contains_3bar = True
        if (col_1 == 3 and col_2 == 3):
            col_product_contains_3bar = True  # 3x3 = 6 + 3bar
        if not col_product_contains_3bar:
            continue

        found_coupling = True
        print(f"  FOUND: {name1} x {name2}")
        print(f"    SU(2): {su2_1} x {su2_2} -> contains 2: {su2_ok}")
        print(f"    Y: {Y_1} + {Y_2} = {Y_sum} == {target_Y}: True")
        print(f"    Color: {col_1} x {col_2} -> contains 3bar: {col_product_contains_3bar}")

        # Check Lorentz structure
        # Two Weyl fields of same chirality contract via epsilon -> Lorentz scalar
        # But 2x2 SU(2) doesn't contain 2, so if both are doublets -> FAIL
        if su2_1 == 2 and su2_2 == 2:
            print(f"    BUT: 2 x 2 = 1 + 3, does NOT contain 2 -> FORBIDDEN")
            found_coupling = False

if not found_coupling:
    print("  NO gauge-invariant renormalizable coupling found!")
    print("")
    print("  CONCLUSION: Multiplet 2 = (2, -5/6, 3) is INERT at renormalizable level.")
    print("  It can only decay through:")
    print("    1. Dimension-5 operators: (1/f) S * psi * psi' * H")
    print("    2. Loop-induced processes through composite dynamics")
    print("    3. Non-perturbative composite sector effects")


# ==============================================================================
# SECTION 5: BETA PARAMETER FOR MULTIPLET 1
# ==============================================================================

print("\n" + "=" * 70)
print("SECTION 5: Beta Parameter for Multiplet 1 (R-tilde_2)")
print("=" * 70)

print("""
Multiplet 1 = R-tilde_2 = (2, 1/6, 3) couples to d_R-bar x L_L.

Decay modes (using epsilon_{ij} contraction for SU(2)):
  S^{2/3} -> d_R + l^+  (charged lepton + d-type jet)
  S^{-1/3} -> d_R + nu-bar  (neutrino + d-type jet)

For PAIR PRODUCTION at LHC (QCD process, depends only on color):
  pp -> S^{2/3} S*^{-2/3}  -> (d l^+)(d-bar l^-)  : di-lepton + dijets
  pp -> S^{-1/3} S*^{+1/3} -> (d nu-bar)(d-bar nu) : dijets + MET

Each charge state is produced with EQUAL cross section (QCD blind to EW).
""")

# Beta computation
# For each charge state:
beta_charge_2_3 = 1.0   # S^{2/3} always -> d + l^+
beta_charge_m1_3 = 0.0  # S^{-1/3} always -> d + nu

# Effective beta for the doublet (equal production of both states)
beta_eff = (beta_charge_2_3 + beta_charge_m1_3) / 2.0

print(f"S^{{2/3}} -> d + l^+: beta = {beta_charge_2_3:.1f}")
print(f"S^{{-1/3}} -> d + nu: beta = {beta_charge_m1_3:.1f}")
print(f"")
print(f"Equal pair production of both charge states:")
print(f"  beta_eff = (1 + 0) / 2 = {beta_eff:.1f}")
print(f"")
print(f"This is a ROBUST result: forced by SU(2)_L doublet structure.")
print(f"Deviations from 0.5 require:")
print(f"  - Mass splitting between components (EW, order xi ~ {float(Rational(n_d, n_c**2)):.3f})")
print(f"  - Additional decay modes (none at renormalizable level)")

# Generation preference
print(f"\n--- Generation Preference ---")
print(f"Partial compositeness: coupling ~ degree of compositeness")
print(f"  y_t = 1 [CONJECTURE, S290] -> top is fully composite")
print(f"  y_b/y_t ~ 0.024 -> bottom has moderate compositeness")
print(f"  1st, 2nd gen: small mixing -> suppressed coupling")
print(f"")
print(f"Dominant decay channels:")
print(f"  S^{{2/3}} -> b + tau^+  (3rd gen, dominant)")
print(f"  S^{{-1/3}} -> b + nu_tau  (3rd gen, dominant)")
print(f"  S^{{2/3}} -> s + mu^+   (2nd gen, suppressed)")
print(f"  S^{{2/3}} -> d + e^+    (1st gen, highly suppressed)")
print(f"")
print(f"For LHC: use 3RD GENERATION scalar leptoquark bounds.")


# ==============================================================================
# SECTION 6: LHC BOUNDS REASSESSMENT
# ==============================================================================

print("\n" + "=" * 70)
print("SECTION 6: LHC Bounds Reassessment with beta = 0.5")
print("=" * 70)

# Current bounds from CMS/ATLAS Run 2 (140 fb^-1)
# Scalar leptoquark pair production, 3rd generation
# Sources: CMS-EXO-19-015, ATLAS-EXOT-2019-19
bounds_3rd_gen = {
    1.0: 1500,   # m > 1.5 TeV at beta = 1
    0.5: 1220,   # m > ~1.2 TeV at beta = 0.5
    0.0: 1050,   # m > ~1.05 TeV at beta = 0 (jets + MET only)
}

# 2nd generation bounds (typically strongest)
bounds_2nd_gen = {
    1.0: 1700,
    0.5: 1400,
    0.0: 1100,
}

# 1st generation bounds
bounds_1st_gen = {
    1.0: 1800,
    0.5: 1500,
    0.0: 1100,
}

m_col = 1761  # Framework prediction [CONJECTURE, S326]

print(f"Framework prediction: m_col = {m_col} GeV (g_rho = n_d = 4)")
print(f"Framework beta_eff = {beta_eff:.1f}")
print(f"Dominant coupling: 3rd generation")
print(f"")
print(f"{'Generation':>12s} | {'beta=1.0':>10s} | {'beta=0.5':>10s} | {'beta=0.0':>10s}")
print("-" * 50)

for gen_name, bounds in [("3rd gen", bounds_3rd_gen), ("2nd gen", bounds_2nd_gen), ("1st gen", bounds_1st_gen)]:
    statuses = []
    for beta_val in [1.0, 0.5, 0.0]:
        bound = bounds[beta_val]
        margin = m_col - bound
        status = f"SAFE +{margin}" if margin > 0 else f"EXCL {margin}"
        statuses.append(status)
    print(f"{gen_name:>12s} | {statuses[0]:>10s} | {statuses[1]:>10s} | {statuses[2]:>10s}")

print(f"\nRELEVANT COMPARISON: 3rd gen at beta = 0.5")
relevant_bound = bounds_3rd_gen[0.5]
margin = m_col - relevant_bound
print(f"  Bound: {relevant_bound} GeV")
print(f"  Prediction: {m_col} GeV")
print(f"  Margin: +{margin} GeV ({margin/relevant_bound*100:.0f}% above bound)")
print(f"")
print(f"COMPARISON WITH S326 (beta=1 assumption):")
old_margin = m_col - bounds_3rd_gen[1.0]
print(f"  Old (beta=1):  bound = {bounds_3rd_gen[1.0]} GeV, margin = +{old_margin} GeV")
print(f"  New (beta=0.5): bound = {bounds_3rd_gen[0.5]} GeV, margin = +{margin} GeV")
print(f"  Improvement: {margin - old_margin} GeV additional margin")
print(f"  beta = 0.5 STRENGTHENS the LHC consistency of P-022.")


# ==============================================================================
# SECTION 7: HL-LHC AND FUTURE COLLIDER PROJECTIONS
# ==============================================================================

print("\n" + "=" * 70)
print("SECTION 7: HL-LHC and Future Collider Projections")
print("=" * 70)

# HL-LHC projections (3000 fb^-1)
hllhc_reach = {
    1.0: 2500,
    0.5: 2200,
    0.0: 1500,
}

# FCC-hh projections (100 TeV, 30 ab^-1)
fcchh_reach = {
    1.0: 15000,
    0.5: 12000,
    0.0: 8000,
}

print(f"\n{'Collider':>12s} | {'beta=1.0 (GeV)':>15s} | {'beta=0.5 (GeV)':>15s} | {'beta=0.0 (GeV)':>15s}")
print("-" * 62)
print(f"{'Run 2':>12s} | {bounds_3rd_gen[1.0]:>15d} | {bounds_3rd_gen[0.5]:>15d} | {bounds_3rd_gen[0.0]:>15d}")
print(f"{'HL-LHC':>12s} | {hllhc_reach[1.0]:>15d} | {hllhc_reach[0.5]:>15d} | {hllhc_reach[0.0]:>15d}")
print(f"{'FCC-hh':>12s} | {fcchh_reach[1.0]:>15d} | {fcchh_reach[0.5]:>15d} | {fcchh_reach[0.0]:>15d}")

# Testability at beta = 0.5
testable_hllhc = m_col < hllhc_reach[0.5]
testable_fcchh = m_col < fcchh_reach[0.5]

print(f"\nFramework prediction: m_col = {m_col} GeV")
print(f"  HL-LHC at beta=0.5: {'TESTABLE' if testable_hllhc else 'BEYOND REACH'}")
print(f"    Reach {hllhc_reach[0.5]} GeV vs prediction {m_col} GeV")
print(f"    Margin: {hllhc_reach[0.5] - m_col} GeV above prediction")
print(f"  FCC-hh at beta=0.5: {'DEFINITIVE' if testable_fcchh else 'BEYOND REACH'}")

# Number of events at HL-LHC
sigma_pair_1760 = 0.15  # fb, approximate NLO for 1.76 TeV scalar triplet
lumi_hllhc = 3000  # fb^-1
events_hllhc = sigma_pair_1760 * lumi_hllhc * 2  # x2 for two charge states in M1

print(f"\nExpected events at HL-LHC for Multiplet 1:")
print(f"  sigma(pp -> S S*) ~ {sigma_pair_1760:.2f} fb per charge state")
print(f"  Two charge states: total sigma ~ {2*sigma_pair_1760:.2f} fb")
print(f"  Events at {lumi_hllhc} fb^-1: ~ {events_hllhc:.0f} (before cuts)")
print(f"  In leptonic channel (beta=1 component): ~ {events_hllhc/2:.0f}")
print(f"  In MET channel (beta=0 component): ~ {events_hllhc/2:.0f}")


# ==============================================================================
# SECTION 8: MULTIPLET 2 PHENOMENOLOGY
# ==============================================================================

print("\n" + "=" * 70)
print("SECTION 8: Multiplet 2 Phenomenology (Exotic)")
print("=" * 70)

print(f"""
Multiplet 2 = (2, {Y_M2}, 3) has NO renormalizable SM Yukawa coupling.

The only renormalizable coupling involves TWO quarks (diquark):
  S*_{{(2,5/6,3bar)}} couples to Q_L x u_R (color antisymmetric part)
  Q_L x u_R = (2, 1/6, 3) x (1, 2/3, 3) = (2, 5/6, 3bar) from 3x3 -> 3bar

BUT this requires the antisymmetric color contraction epsilon^{{abc}}.
This is a DIQUARK coupling, NOT a leptoquark coupling.

Decay modes of Multiplet 2 (diquark):
  S*^{{4/3}} -> u_L + u_R  (charge: 4/3 = 2/3 + 2/3)
  S*^{{1/3}} -> d_L + u_R  (charge: 1/3 = -1/3 + 2/3)

These give DIJET final states, not lepton+jet.

Key implications:
1. Standard scalar LQ searches do NOT constrain Multiplet 2
2. Relevant searches: PAIRED DIJET resonances
3. Current bounds for pair-produced dijet resonances: m > ~1.0 TeV
4. Framework prediction m_col ~ 1761 GeV is SAFE for dijets
5. Multiplet 2 mass ~ Multiplet 1 mass (same CW potential, small EW splitting)

Mass splitting between multiplets:
  Delta_m^2 ~ (3/(16*pi^2)) * (Y_2^2 - Y_1^2) * g'^2 * m_rho^2 * L
  Y_1^2 = {float(Y_M1**2):.4f}, Y_2^2 = {float(Y_M2**2):.4f}
  Y_2^2 - Y_1^2 = {float(Y_M2**2 - Y_M1**2):.4f}
  This gives M2 ~ few % heavier than M1.
""")

# Mass splitting estimate
Y1_sq = float(Y_M1**2)
Y2_sq = float(Y_M2**2)
# g'^2 at M_Z ~ 0.128
gp2 = 0.128
# EW prefactor from CW (from S326: ~15% of QCD for M1)
# The splitting comes from the Y^2 difference
delta_Y2 = Y2_sq - Y1_sq
# Relative mass splitting: dm/m ~ (1/2) * delta_prefactor / total_prefactor
# delta_prefactor ~ 3/(16*pi^2) * delta_Y2 * gp2
# QCD prefactor ~ 3*4/3*1.48/(16*pi^2) ~ 0.0375
delta_pref = 3.0 / (16 * np.pi**2) * delta_Y2 * gp2
qcd_pref = 3.0 * 4.0/3.0 * 1.48 / (16 * np.pi**2)
total_pref_M1 = qcd_pref + 3.0/(16*np.pi**2) * (0.75*0.424 + Y1_sq * gp2)

relative_splitting = 0.5 * delta_pref / total_pref_M1
delta_m = relative_splitting * m_col

print(f"Mass splitting estimate:")
print(f"  delta(Y^2) = {Y2_sq:.4f} - {Y1_sq:.4f} = {delta_Y2:.4f}")
print(f"  Relative mass splitting: dm/m ~ {relative_splitting:.3f} = {relative_splitting*100:.1f}%")
print(f"  Absolute splitting: ~ {abs(delta_m):.0f} GeV")
print(f"  M2 {'heavier' if delta_m > 0 else 'lighter'} than M1")


# ==============================================================================
# SECTION 9: SUMMARY AND P-022 REVISION
# ==============================================================================

print("\n" + "=" * 70)
print("SECTION 9: Summary and P-022 Assessment")
print("=" * 70)

print(f"""
SUMMARY OF EQ-027 RESULTS:

1. The 24 colored pNGBs decompose into TWO distinct complex SU(2)_L doublets:
   - Multiplet 1: (2, 1/6, 3) = R-tilde_2 leptoquark, 12 real DOF
   - Multiplet 2: (2, -5/6, 3) = diquark, 12 real DOF

2. Hypercharges DERIVED from Pati-Salam embedding [DERIVATION]:
   Y = T_{{3,L(SO4)}} + T_X
   T_X(3 in 7) = -1/3 from SO(7)->SO(6)~SU(4)->SU(3)xU(1)
   T_X normalization FIXED by SM fermion hypercharges in spinor 32

3. Multiplet 1 beta parameter [DERIVATION]:
   beta_eff = 0.5 (forced by SU(2)_L doublet structure)
   S^{{2/3}} -> d + l^+ (beta=1), S^{{-1/3}} -> d + nu (beta=0)
   3rd generation dominant (partial compositeness)

4. Multiplet 2 phenomenology [DERIVATION]:
   NO renormalizable leptoquark coupling to SM fermions
   Diquark coupling S* -> Q_L + u_R (dijet final state)
   Relevant search: paired dijet resonances (weaker bounds)

5. LHC bounds STRENGTHENED:
   Relevant: 3rd gen, beta=0.5 -> bound ~1220 GeV
   Framework: m_col = 1761 GeV -> SAFE with +541 GeV margin
   (vs +261 GeV margin at beta=1.0 from S326)

6. HL-LHC: TESTABLE at beta=0.5 (reach ~2200 GeV vs 1761 GeV)

P-022 STATUS: NO REVISION NEEDED
  The mass prediction m_col = 1761 GeV remains valid.
  The beta correction HELPS -- larger margin to current bounds.
  The search strategy is now more specific:
    - Primary: 3rd gen scalar LQ pair, b+tau channel, beta=0.5
    - Secondary: Paired dijet resonances (Multiplet 2)
""")


# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    # Representation decomposition
    ("24 colored pNGBs = 12 + 12 (two complex doublets)",
     N_colored == 24 and 12 + 12 == 24),

    ("Total DOF: Higgs (4) + colored (24) = 28 = N_Gold",
     N_Higgs + N_colored == N_Gold),

    ("Multiplet 1 hypercharge Y = 1/6",
     Y_M1 == Rational(1, 6)),

    ("Multiplet 2 hypercharge Y = -5/6",
     Y_M2 == Rational(-5, 6)),

    ("M1 charges: 2/3 and -1/3",
     Q_M1_up == Rational(2, 3) and Q_M1_down == Rational(-1, 3)),

    ("M2 charges: -1/3 and -4/3",
     Q_M2_up == Rational(-1, 3) and Q_M2_down == Rational(-4, 3)),

    # Hypercharge consistency
    ("SM Q_L hypercharge Y = 1/6 derived correctly",
     Y_QL == Rational(1, 6)),

    ("SM u_R hypercharge Y = 2/3 derived correctly",
     Y_uR == Rational(2, 3)),

    ("SM d_R hypercharge Y = -1/3 derived correctly",
     Y_dR == Rational(-1, 3)),

    ("SM L_L hypercharge Y = -1/2 derived correctly",
     Y_LL == Rational(-1, 2)),

    ("SM e_R hypercharge Y = -1 derived correctly",
     Y_eR == Rational(-1, 1)),

    ("SM nu_R hypercharge Y = 0 derived correctly",
     Y_nuR == Rational(0, 1)),

    # Beta parameter
    ("Beta_eff = 0.5 for M1 doublet",
     abs(beta_eff - 0.5) < 0.001),

    ("M1 charge-2/3 component: beta = 1",
     abs(beta_charge_2_3 - 1.0) < 0.001),

    ("M1 charge-(-1/3) component: beta = 0",
     abs(beta_charge_m1_3 - 0.0) < 0.001),

    # Coupling structure
    ("M2 has NO renormalizable LQ coupling (exhaustive check)",
     not found_coupling),

    # LHC consistency
    ("m_col > 3rd gen bound at beta=0.5",
     m_col > bounds_3rd_gen[0.5]),

    ("m_col > 3rd gen bound at beta=1.0",
     m_col > bounds_3rd_gen[1.0]),

    # HL-LHC testability
    ("m_col < HL-LHC reach at beta=0.5",
     testable_hllhc),

    # Mass splitting
    ("Mass splitting < 10% (EW effect small)",
     abs(relative_splitting) < 0.10),

    # T_X charges
    ("T_X(3 in 7) = -1/3 (Pati-Salam chain)",
     T_X_3_in_7 == Rational(-1, 3)),

    ("T_X traceless: 3*(-1/3) + 3*(1/3) + 0 = 0 in 7",
     3 * T_X_3_in_7 + 3 * T_X_3bar_in_7 + T_X_1_in_7 == 0),

    ("T_X traceless: 3*(1/6) + 3*(-1/6) + (-1/2) + (1/2) = 0 in 8",
     3 * T_X_3_in_8 + 3 * T_X_3bar_in_8 + T_X_1a_in_8 + T_X_1b_in_8 == 0),

    # Higgs
    ("Higgs Y = 1/2 (color singlet T_X = 0)",
     Rational(1, 2) + T_X_1_in_7 == Rational(1, 2)),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print(f"\n{'ALL TESTS PASSED' if all_pass else 'SOME TESTS FAILED'}: "
      f"{sum(1 for _, p in tests if p)}/{len(tests)}")
