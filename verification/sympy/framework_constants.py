#!/usr/bin/env python3
"""
Framework Constants: Shared CODATA and Division Algebra Constants
=================================================================

Centralizes all physical constants and framework parameters to ensure
consistency across verification scripts.

CODATA source: NIST 2022 recommended values
  https://physics.nist.gov/cuu/Constants/index.html

Usage:
  from framework_constants import *
  # or selectively:
  from framework_constants import ALPHA_INV_MEASURED, N_C, N_D
"""

from sympy import Rational, Float, sqrt, pi

# ============================================================
# CODATA 2022 Recommended Values
# Source: https://physics.nist.gov/cuu/Constants/index.html
# ============================================================

# Fine structure constant (inverse)
# alpha^{-1} = 137.035 999 177(21)
ALPHA_INV_MEASURED = Float('137.035999177', 12)
ALPHA_INV_MEASURED_RATIONAL = Rational(137035999177, 10**9)
ALPHA_INV_UNCERTAINTY = Float('0.000000021', 12)
ALPHA_MEASURED = 1 / ALPHA_INV_MEASURED

# Weinberg angle (MS-bar at M_Z)
# sin^2(theta_W) = 0.23122(4)  [PDG 2024]
SIN2_THETA_W_MSBAR = Float('0.23122', 6)
SIN2_THETA_W_MSBAR_UNC = Float('0.00004', 6)

# Weinberg angle (on-shell)
# cos(theta_W) = m_W/m_Z
# Using PDG 2024: m_W = 80.3692(13) GeV, m_Z = 91.1876(21) GeV
COS_THETA_W_ONSHELL = Float('0.88145', 6)  # m_W/m_Z
M_W = Float('80.3692', 6)   # GeV, PDG 2024 (excl. CDF 2022)
M_Z = Float('91.1876', 6)   # GeV, PDG 2024

# Proton-electron mass ratio
# m_p/m_e = 1836.152 673 43(11) [CODATA 2022]
MP_ME_MEASURED = Float('1836.15267343', 12)
MP_ME_UNCERTAINTY = Float('0.00000011', 12)

# Muon-electron mass ratio
# m_mu/m_e = 206.768 2830(46) [CODATA 2022]
MMU_ME_MEASURED = Float('206.7682830', 10)

# Strong coupling constant
# alpha_s(M_Z) = 0.1180(9) [PDG 2024]
ALPHA_S_MZ = Float('0.1180', 4)

# Hubble constant
# H_0 = 67.4 +/- 0.5 km/s/Mpc [Planck 2018]
H0_PLANCK = Float('67.4', 4)
H0_UNCERTAINTY = Float('0.5', 2)

# Cosmological parameters (Planck 2018)
OMEGA_LAMBDA = Float('0.685', 4)
OMEGA_LAMBDA_UNC = Float('0.007', 4)
OMEGA_M = Float('0.315', 4)
OMEGA_M_UNC = Float('0.007', 4)

# Planck mass (GeV)
M_PLANCK_GEV = Float('1.220890e19', 7)

# Higgs VEV (GeV)
HIGGS_VEV = Float('246.22', 5)  # GeV

# ============================================================
# Framework Structural Constants (from division algebras)
# ============================================================

# Division algebra dimensions
DIM_R = 1    # Real numbers
DIM_C = 2    # Complex numbers
DIM_H = 4    # Quaternions
DIM_O = 8    # Octonions

# Imaginary dimensions
IM_C = 1     # Im(C)
IM_H = 3     # Im(H)
IM_O = 7     # Im(O)

# Framework dimensions
N_C = 11     # Crystal dimension = Im_C + Im_H + Im_O = 1 + 3 + 7
N_D = 4      # Defect dimension = dim(H)

# Key framework composites
ALPHA_INV_TREE = Rational(15211, 111)  # 137 + 4/111 = n_d^2 + n_c^2 + n_d/(n_c^2 - n_c + 1)
SIN2_TREE = Rational(28, 121)          # n_d * Im_O / n_c^2

# ============================================================
# Derived framework quantities
# ============================================================

# Cyclotomic polynomials evaluated at framework dimensions
PHI_6_NC = N_C**2 - N_C + 1    # = 111
PHI_6_IMO = IM_O**2 - IM_O + 1  # = 43

# Lie algebra dimensions
DIM_U11 = N_C**2               # = 121
DIM_SU3 = 8
DIM_U3 = 9

# ============================================================
# Version info
# ============================================================
CODATA_VERSION = "2022"
CONSTANTS_VERSION = "1.0"  # Created S289
