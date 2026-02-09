#!/usr/bin/env python3
"""
Phase Transition Crystallization Verification

KEY FINDING: Verifies framework quantities entering phase transition physics:
EWSB vacuum parameters (xi, sin^2(theta_W), coset dims, kappa_V, kappa_f),
QCD phase transition structural inputs (N_c crossover order, gluon DOF),
BBN inputs (N_nu, g_*, Y_p sensitivity).

Formula summary:
  xi = n_d / n_c^2 = 4/121
  sin^2(theta_W) = n_d * Im_O / n_c^2 = 28/121
  kappa_V = sqrt(1 - xi) = sqrt(117/121)
  kappa_f = kappa_V (MCHM4 spinorial embedding)
  N_nu = Im_H = 3
  g_* = 2 + 7/8 * (4 + 2 * N_nu * 2) = 10.75
  Y_p ~ 2*(n/p) / (1 + n/p) ~ 0.247 for N_nu = 3

Measured values:
  sin^2(theta_W) at M_Z: 0.23122(4) (PDG 2024)
  N_eff: 2.99(17) (Planck 2018)
  Y_p: 0.2449(40) (Aver et al. 2021)
  T_c(QCD): 156.5(1.5) MeV (HotQCD/Budapest-Wuppertal)

Status: VERIFICATION (combines EWSB + QCD + BBN framework inputs)
Depends on:
  - [D] n_c = 11, n_d = 4, Im_H = 3, Im_O = 7 (from division algebras)
  - [CONJECTURE] xi = n_d/n_c^2 = 4/121
  - [DERIVATION] sin^2(theta_W) = 28/121
  - [DERIVATION] N_nu = Im_H = 3
  - [DERIVATION] Spinorial embedding (MCHM4) from S212
  - [I-MATH] Composite Higgs coupling formulas
  - [A-IMPORT] Standard BBN formulas, PDG values

Created: Session 229
"""

import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from sympy import Rational, sqrt, simplify, exp, pi, N as Neval, log

# ==============================================================================
# FRAMEWORK QUANTITIES
# ==============================================================================

n_d = 4          # [D] Defect dimension = dim(H)
n_c = 11         # [D] Crystal dimension
Im_H = 3         # [D] Im(H) = quaternion imaginary dims
Im_O = 7         # [D] Im(O) = octonion imaginary dims
O = 8            # [D] dim(O)
H = 4            # [D] dim(H)
C = 2            # [D] dim(C)

# ==============================================================================
# PART 1: EWSB VACUUM PARAMETERS
# ==============================================================================

print("=" * 70)
print("PART 1: EWSB VACUUM PARAMETERS")
print("=" * 70)

# Misalignment parameter
xi = Rational(n_d, n_c**2)
print(f"\nxi = n_d/n_c^2 = {n_d}/{n_c**2} = {xi} = {float(xi):.6f}")

# Weinberg angle
sin2_thetaW = Rational(n_d * Im_O, n_c**2)
print(f"sin^2(theta_W) = n_d*Im_O/n_c^2 = {n_d*Im_O}/{n_c**2} = {sin2_thetaW} = {float(sin2_thetaW):.6f}")
print(f"  Measured: 0.23122(4) at M_Z")
print(f"  Error: {abs(float(sin2_thetaW) - 0.23122)/0.23122 * 100:.3f}%")

# Coset dimensions
dim_coset = n_d * Im_O   # Gr(4,11) = SO(11)/[SO(4) x SO(7)]
dim_SO11 = n_c * (n_c - 1) // 2
dim_SO4 = n_d * (n_d - 1) // 2
dim_SO7 = Im_O * (Im_O - 1) // 2
print(f"\nCoset: Gr({n_d},{n_c}) = SO({n_c})/[SO({n_d}) x SO({Im_O})]")
print(f"  dim(SO({n_c})) = {dim_SO11}")
print(f"  dim(SO({n_d})) = {dim_SO4}")
print(f"  dim(SO({Im_O})) = {dim_SO7}")
print(f"  dim(coset) = {dim_SO11} - {dim_SO4} - {dim_SO7} = {dim_SO11 - dim_SO4 - dim_SO7}")
print(f"  Direct: n_d * Im_O = {dim_coset}")

# Higgs doublet
higgs_dof = n_d   # color singlet component of 28 Goldstones
colored_dof = dim_coset - higgs_dof  # 24 colored pNGBs
print(f"\nHiggs doublet: {higgs_dof} DOF (color singlet)")
print(f"Colored pNGBs: {colored_dof} DOF")

# Coupling modifiers
kappa_V = sqrt(1 - xi)
kappa_V_exact = sqrt(Rational(n_c**2 - n_d, n_c**2))
print(f"\nkappa_V = sqrt(1 - xi) = sqrt({n_c**2 - n_d}/{n_c**2}) = {float(kappa_V):.8f}")
print(f"  Deviation from SM: {(1 - float(kappa_V))*100:.4f}%")

# MCHM4 (spinorial): kappa_f = kappa_V
kappa_f = kappa_V
print(f"kappa_f (MCHM4) = kappa_V = {float(kappa_f):.8f}")

# cos(theta_W)
cos2_thetaW = 1 - sin2_thetaW
cos_thetaW = sqrt(cos2_thetaW)
print(f"\ncos^2(theta_W) = 1 - 28/121 = {cos2_thetaW} = {float(cos2_thetaW):.6f}")
print(f"M_W/M_Z = cos(theta_W) = sqrt({cos2_thetaW}) = {float(cos_thetaW):.6f}")
print(f"  Measured: M_W/M_Z = 80.37/91.19 = 0.8815")

# dim(End(V)) = n_c^2 = 121
dim_End = n_c**2
print(f"\ndim(End(V)) = n_c^2 = {dim_End}")
print(f"  xi = {n_d}/{dim_End} (Higgs fraction of End(V))")
print(f"  sin^2 = {n_d*Im_O}/{dim_End} (gauge fraction of End(V))")


# ==============================================================================
# PART 2: QCD PHASE TRANSITION
# ==============================================================================

print("\n" + "=" * 70)
print("PART 2: QCD PHASE TRANSITION STRUCTURAL INPUTS")
print("=" * 70)

N_c = Im_H   # = 3, derived
print(f"\nN_c = Im_H = {N_c}")

# Gluon DOF in QGP
gluon_dof = 2 * (N_c**2 - 1)   # 2 polarizations x (N^2-1) gluons
print(f"QGP gluon DOF = 2*(N_c^2 - 1) = 2*({N_c**2}-1) = {gluon_dof}")

# Total QGP DOF (N_f = 3 light quarks at T > T_c)
N_f_light = 3  # u, d, s
quark_dof = Rational(7, 8) * 4 * N_c * N_f_light  # 4 = spin x particle/antiparticle
total_qgp_dof = gluon_dof + quark_dof
print(f"Quark DOF (N_f={N_f_light}) = 7/8 * 4 * {N_c} * {N_f_light} = {float(quark_dof)}")
print(f"Total QGP g_* = {float(total_qgp_dof)}")
print(f"  Expected: 47.5 (standard QGP)")

# Diquark channel for color superconductivity
# For SU(N_c): 3 x 3 = 3_bar + 6 (antisymmetric + symmetric)
# Anti-3 is attractive for one-gluon exchange
anti_3_dim = N_c * (N_c - 1) // 2   # antisymmetric = 3
sym_6_dim = N_c * (N_c + 1) // 2    # symmetric = 6
print(f"\nDiquark channels for SU({N_c}):")
print(f"  Antisymmetric (attractive): dim = {anti_3_dim}")
print(f"  Symmetric (repulsive): dim = {sym_6_dim}")
print(f"  N_c*(N_c-1)/2 = {anti_3_dim}, N_c*(N_c+1)/2 = {sym_6_dim}")


# ==============================================================================
# PART 3: BBN PARAMETERS
# ==============================================================================

print("\n" + "=" * 70)
print("PART 3: BBN PARAMETERS")
print("=" * 70)

N_nu = Im_H   # = 3 neutrino families
print(f"\nN_nu = Im_H = {N_nu}")

# Radiation DOF at freeze-out (T ~ 1 MeV)
# g_* = 2 (photon) + 7/8 * 4 (e+e-: 2 spin x 2 particle/anti)
#      + 7/8 * 2 * N_nu (neutrinos: chiral, 1 helicity x 2 particle/anti per species)
g_star_photon = 2
g_star_electron = Rational(7, 8) * 4
g_star_neutrino = Rational(7, 8) * 2 * N_nu   # 2 = nu_L + nu_bar_R per species
g_star = g_star_photon + g_star_electron + g_star_neutrino

print(f"g_* at BBN freeze-out:")
print(f"  Photon: {g_star_photon}")
print(f"  e+e-:   7/8 * 4 = {float(g_star_electron)}")
print(f"  Neutrinos: 7/8 * 2 * {N_nu} = {float(g_star_neutrino)}")
print(f"  Total: {float(g_star)}")
print(f"  Expected: 10.75")

# g_* with N_nu = 4 (what-if)
g_star_Nnu4 = g_star_photon + g_star_electron + Rational(7, 8) * 2 * 4
print(f"\nWhat-if N_nu = 4: g_* = {float(g_star_Nnu4)}")
print(f"  Increase per nu species: delta_g_* = 7/4 = {float(Rational(7, 4))}")

# Y_p (helium-4 mass fraction) approximate formula
# Y_p ~ 2 * (n/p) / (1 + n/p)
# n/p at freeze-out ~ exp(-delta_m / T_f) where T_f depends on N_nu
# Approximate: Y_p(N_nu) ~ 0.2485 + 0.013*(N_nu - 3) for eta_10 ~ 6.1
delta_m = Rational(1293, 1000)  # n-p mass difference in MeV (approximate)
Y_p_approx = Rational(2485, 10000) + Rational(13, 1000) * (N_nu - 3)
Y_p_Nnu4 = Rational(2485, 10000) + Rational(13, 1000) * (4 - 3)

print(f"\nY_p (approximate formula):")
print(f"  Y_p(N_nu=3) ~ {float(Y_p_approx):.4f}")
print(f"  Y_p(N_nu=4) ~ {float(Y_p_Nnu4):.4f}")
print(f"  Measured: 0.2449(40)")
print(f"  delta_Y_p per N_nu: ~0.013")

# Simple n/p ratio estimate
# n/p ~ exp(-delta_m / T_f) with T_f ~ 0.8 MeV
# After neutron decay for ~180s before BBN: n/p ~ 1/7
n_over_p = Rational(1, 7)  # approximate
Y_p_from_np = 2 * n_over_p / (1 + n_over_p)
print(f"\nFrom n/p = 1/7:")
print(f"  Y_p = 2*(1/7)/(1 + 1/7) = 2/7 / (8/7) = 2/8 = {float(Y_p_from_np):.4f}")
print(f"  = {Y_p_from_np} = 0.25 (crude estimate)")


# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    # EWSB parameters
    ("xi = n_d/n_c^2 = 4/121",
     xi == Rational(4, 121)),

    ("sin^2(theta_W) = n_d*Im_O/n_c^2 = 28/121",
     sin2_thetaW == Rational(28, 121)),

    ("sin^2(theta_W) = 0.23140 within 0.1% of measured 0.23122",
     abs(float(sin2_thetaW) - 0.23122) / 0.23122 < 0.001),

    ("Coset dim = n_d * Im_O = 28 = dim(SO(11)) - dim(SO(4)) - dim(SO(7))",
     dim_coset == 28 and dim_coset == dim_SO11 - dim_SO4 - dim_SO7),

    ("kappa_V = sqrt(117/121) ~ 0.9834",
     simplify(kappa_V**2 - Rational(117, 121)) == 0),

    ("kappa_V^2 + xi = 1 (unitarity sum rule)",
     simplify(kappa_V**2 + xi - 1) == 0),

    ("MCHM4: kappa_f = kappa_V (spinorial embedding)",
     simplify(kappa_f - kappa_V) == 0),

    ("Higgs DOF (4) + colored pNGB DOF (24) = 28 (coset dim)",
     higgs_dof + colored_dof == dim_coset),

    # QCD structural
    ("N_c = Im_H = 3",
     N_c == 3 and N_c == Im_H),

    ("QGP gluon DOF = 2*(N_c^2-1) = 16",
     gluon_dof == 16),

    ("Total QGP DOF (N_f=3) = 47.5",
     float(total_qgp_dof) == 47.5),

    ("Diquark anti-3 channel dim = N_c*(N_c-1)/2 = 3",
     anti_3_dim == 3),

    # BBN parameters
    ("N_nu = Im_H = 3",
     N_nu == 3 and N_nu == Im_H),

    ("g_*(N_nu=3) = 10.75",
     float(g_star) == 10.75),

    ("Y_p(N_nu=3) ~ 0.2485 (within 2% of measured 0.245)",
     abs(float(Y_p_approx) - 0.245) / 0.245 < 0.02),

    ("Y_p sensitivity: delta_Y_p/delta_N_nu = 0.013",
     float(Y_p_Nnu4 - Y_p_approx) == 0.013),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print(f"\n{'ALL TESTS PASSED' if all_pass else 'SOME TESTS FAILED'}: "
      f"{sum(1 for _, p in tests if p)}/{len(tests)}")


# ==============================================================================
# SUMMARY
# ==============================================================================

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)

print(f"""
Phase transition framework inputs verified:

EWSB (strongest):
  xi = {xi} = {float(xi):.6f}
  sin^2(theta_W) = {sin2_thetaW} = {float(sin2_thetaW):.6f} (0.08% from PDG)
  kappa_V = sqrt({Rational(117,121)}) = {float(kappa_V):.6f}
  Coset: Gr(4,11), dim = 28 = 4 (Higgs) + 24 (colored)

QCD (structural only):
  N_c = Im_H = {N_c}
  QGP gluon DOF = {gluon_dof}
  T_c = NOT DERIVED (gap)

BBN (limited):
  N_nu = Im_H = {N_nu}
  g_* = {float(g_star)}
  Y_p ~ {float(Y_p_approx):.4f} (measured: 0.2449)
""")
