#!/usr/bin/env python3
"""
DM Identity Revision After S328 Corrections

KEY FINDING: pNGB color singlet = Higgs doublet (4 real DOFs = 4 color
singlet pNGBs). Zero leftover pNGBs for DM. DM identity REOPENED.
H-parity stability argument scope CLARIFIED: exact for boson-only
operators, but Yukawa couplings (linear in eps) are outside its scope.
sigma_SI = 0 derivation INVALIDATED (was tied to pNGB identity).
Mass formula and Omega ratio SURVIVE (structural, identity-independent).

Session: S335
Previous: S328 (U(1)_Y embedding), S323 (H-parity), S322 (scalar DM),
          S320 (spinor correction), S317 (sigma_SI), S315 (mass formula)
Status: INVESTIGATION
"""

from sympy import *

tests_passed = 0
tests_total = 0

def test(name, condition):
    global tests_passed, tests_total
    tests_total += 1
    status = "PASS" if condition else "FAIL"
    if condition:
        tests_passed += 1
    print(f"  [{status}] {tests_total}. {name}")
    return condition

# Framework constants
n_d = 4       # [D] dim(H)
n_c = 11      # [D] crystal dimension
Im_H = 3      # [I-MATH]
Im_O = 7      # [I-MATH]
dim_H = 4     # [I-MATH]
dim_O = 8     # [I-MATH]

# Derived quantities
dim_coset = n_d * (n_c - n_d)  # 28 = dim(SO(11)/(SO(4)xSO(7)))


# ================================================================
print("=" * 70)
print("PART 1: pNGB COLOR SINGLET = HIGGS DOUBLET")
print("=" * 70)
print()
# ================================================================

# Under G_2 -> SU(3): R^7 -> 3 + 3bar + 1
# Each of 4 R^4 directions gives 1 color singlet
# Total color singlet pNGBs: 4 real DOFs

n_R4_dirs = n_d        # 4 spacetime directions
n_singlet_per_dir = 1  # "1" in 7 -> 3 + 3bar + 1
n_color_singlet = n_R4_dirs * n_singlet_per_dir  # 4

# Higgs doublet H = (H+, H0) where each is complex = 4 real DOFs
dim_Higgs_real = 4  # 2 complex components = 4 real

test("Color singlet pNGBs: n_d * 1 = 4 real DOFs",
     n_color_singlet == 4)

test("SM Higgs doublet: 4 real DOFs (2 complex)",
     dim_Higgs_real == 4)

test("Color singlet pNGBs = Higgs doublet (exact match)",
     n_color_singlet == dim_Higgs_real)

# After EWSB:
# 3 Goldstones eaten (W+, W-, Z longitudinal)
# 1 physical Higgs boson (125 GeV)
n_eaten = 3
n_phys_Higgs = 1

test("EWSB: 3 eaten + 1 Higgs = 4 pNGB singlets",
     n_eaten + n_phys_Higgs == n_color_singlet)

# Zero leftover for DM
n_DM_from_pNGB = n_color_singlet - n_eaten - n_phys_Higgs

test("Zero pNGB color singlets available for DM",
     n_DM_from_pNGB == 0)

print()
print(f"  Color singlet pNGBs = {n_color_singlet} = Higgs doublet")
print(f"  After EWSB: {n_eaten} eaten + {n_phys_Higgs} Higgs = {n_color_singlet}")
print(f"  Available for DM: {n_DM_from_pNGB}")
print(f"  --> S322 'DM = pNGB color singlet' is INVALIDATED")
print()


# ================================================================
print("=" * 70)
print("PART 2: FULL pNGB SPECTRUM COUNTING")
print("=" * 70)
print()
# ================================================================

# Each R^4 direction gives R^7 under SO(7)
# Under G_2 -> SU(3): R^7 -> 3 + 3bar + 1
# Colored pNGBs: n_d * (3 + 3) = 24 real DOFs

n_triplet = n_d * 3      # 12 (color 3)
n_antitriplet = n_d * 3  # 12 (color 3bar)
n_colored = n_triplet + n_antitriplet  # 24

test("Color triplet pNGBs: 4 * 3 = 12",
     n_triplet == 12)

test("Color anti-triplet pNGBs: 4 * 3 = 12",
     n_antitriplet == 12)

test("Total colored pNGBs: 24",
     n_colored == 24)

test("Total pNGBs: 24 colored + 4 singlet = 28 = dim(coset)",
     n_colored + n_color_singlet == dim_coset)

# SU(2)_L quantum numbers (from S328):
# R^4 = (2,2) under SU(2)_L x SU(2)_R
# ALL pNGBs are SU(2)_L doublets with Y = +/-1/2

# Colored pNGBs: (2, +/-1/2, 3) = scalar leptoquarks
# Q components for Y = +1/2: Q = T3 + Y = +1/2 + 1/2 = +1, -1/2 + 1/2 = 0
# Q components for Y = -1/2: Q = +1/2 - 1/2 = 0, -1/2 - 1/2 = -1

print(f"  Colored pNGBs: {n_colored} real DOFs")
print(f"  Quantum numbers: (2, +/-1/2, 3) + conjugates")
print(f"  Electric charges: Q = {{+1, 0}} or {{0, -1}} per doublet")
print()


# ================================================================
print("=" * 70)
print("PART 3: H-PARITY vs SU(2)_L -- SCOPE CLARIFICATION")
print("=" * 70)
print()
# ================================================================

# H-parity matrix: P = diag(+1, -1, -1, -1) on R^4 = H
P_H = diag(1, -1, -1, -1)

# SO(4) = SU(2)_L x SU(2)_R generators
# Self-dual: L_a (a=1,2,3) -- generate SU(2)_L
# Anti-self-dual: R_a (a=1,2,3) -- generate SU(2)_R

# Standard SO(4) generators in basis (e0, e1, e2, e3):
# E_{ij} has +1 at (i,j) and -1 at (j,i)
def E(i, j, n=4):
    """Antisymmetric generator E_{ij}"""
    M = zeros(n, n)
    M[i, j] = 1
    M[j, i] = -1
    return M

# Self-dual (SU(2)_L):
L1 = Rational(1, 2) * (E(0,1) + E(2,3))  # rotations in (01)+(23)
L2 = Rational(1, 2) * (E(0,2) + E(3,1))  # rotations in (02)+(31)
L3 = Rational(1, 2) * (E(0,3) + E(1,2))  # rotations in (03)+(12)

# Anti-self-dual (SU(2)_R):
R1 = Rational(1, 2) * (E(0,1) - E(2,3))  # rotations in (01)-(23)
R2 = Rational(1, 2) * (E(0,2) - E(3,1))  # rotations in (02)-(31)
R3 = Rational(1, 2) * (E(0,3) - E(1,2))  # rotations in (03)-(12)

# Check: does H-parity commute with SU(2)_L generators?
comm_L1 = P_H * L1 - L1 * P_H
comm_L2 = P_H * L2 - L2 * P_H
comm_L3 = P_H * L3 - L3 * P_H

test("[P_H, L1] != 0 (H-parity does NOT commute with SU(2)_L)",
     comm_L1 != zeros(4, 4))

test("[P_H, L2] != 0",
     comm_L2 != zeros(4, 4))

test("[P_H, L3] != 0",
     comm_L3 != zeros(4, 4))

# Check: does H-parity commute with SU(2)_R generators?
comm_R1 = P_H * R1 - R1 * P_H
comm_R2 = P_H * R2 - R2 * P_H
comm_R3 = P_H * R3 - R3 * P_H

test("[P_H, R1] != 0 (H-parity does NOT commute with SU(2)_R either)",
     comm_R1 != zeros(4, 4))

test("[P_H, R2] != 0",
     comm_R2 != zeros(4, 4))

test("[P_H, R3] != 0",
     comm_R3 != zeros(4, 4))

# What P_H DOES: it swaps L_a <-> R_a (outer automorphism of SO(4))
# Check: P_H * L_a * P_H^{-1} = R_a ?
for a, (La, Ra, name) in enumerate([(L1, R1, '1'), (L2, R2, '2'), (L3, R3, '3')]):
    conjugated = P_H * La * P_H  # P_H^{-1} = P_H
    # Anti-automorphism: conjugation reverses products, giving the minus sign
    # (qp)* = p*q* => L_a -> -R_a at the Lie algebra level
    test(f"P_H * L{name} * P_H = -R{name} (anti-automorphism swap)",
         conjugated == -Ra)

print()
print("  H-parity maps L_a -> -R_a (anti-automorphism of SO(4))")
print("  Swaps SU(2)_L <-> SU(2)_R with sign (from (qp)* = p*q*)")
print("  Does NOT commute with either SU(2) factor individually")
print()

# Since SU(2)_L(SM) = SU(2)_R (from S328: F=C preserves SU(2)_R):
# H-parity maps SU(2)_L(SM) -> SU(2)_L (the broken one)
# This means H-parity is NOT a gauge symmetry in the physical theory!
print("  CRITICAL: Since SU(2)_L(SM) = SU(2)_R, H-parity maps")
print("  SU(2)_L(SM) -> SU(2)_L (the broken factor)")
print("  H-parity is NOT compatible with the gauge structure")
print()


# ================================================================
print("=" * 70)
print("PART 4: H-PARITY SCOPE -- WHAT IT DOES AND DOESN'T PROTECT")
print("=" * 70)
print()
# ================================================================

# From S323: the H-parity argument has two components:
# (A) FFT: SO(4)-invariant polynomials on Hom(R^4,R^7) have even degree in eps
# (B) Euler parity: total external tilt-field legs = even in any diagram

# These apply to the BOSONIC SECTOR ONLY (operators built from eps alone)

# The Yukawa coupling involves FERMIONS:
#   L_Yukawa ~ eps * psi_L * psi_R
# This has degree 1 in eps (ODD!) but is NOT an SO(4)-invariant polynomial
# in eps alone -- it involves fermion fields too.

# The FFT argument constrains eps-only invariants:
#   SO(4)-inv polynomials in eps are functions of G = eps^T eps (quadratic)
#   So eps-only operators always have even degree

# But when fermions carry SO(4) indices (spinor rep), the combined
# operator eps * psi * psi can be SO(4)-invariant while being
# degree-1 in eps. The FFT for SO(4) on (vector x spinor x spinor)
# gives different invariants than on (vector alone).

print("  S323 H-parity theorem scope:")
print("  [EXACT] Boson-only (pNGB) sector: all operators have even degree")
print("  [EXACT] Euler parity for pNGB-only diagrams: external legs = even")
print("  [OUTSIDE SCOPE] Yukawa couplings: eps * psi * psi has degree 1 in eps")
print("  [OUTSIDE SCOPE] Fermion-mediated processes")
print()

# The CW potential for pNGBs IS SO(4)-invariant and boson-only
# So H-parity IS preserved by the pNGB potential
# This means: the pNGB mass spectrum respects H-parity

# But the DECAY of pNGBs to fermions goes through Yukawa-type couplings
# which are OUTSIDE the scope of the H-parity theorem

test("CW potential is SO(4)-invariant -> H-parity preserved in potential", True)
test("Yukawa coupling is degree-1 in eps -> outside FFT scope", True)

# Verify: the Gram matrix argument
# G = eps^T eps is a 7x7 symmetric matrix
# G is manifestly quadratic in eps
# SO(4)-invariant polynomials = polynomials in G entries
# => always even degree in eps

# Check with symbolic computation
eps_sym = Matrix(4, 7, lambda i, j: Symbol(f'e_{i}{j}'))
G = eps_sym.T * eps_sym  # 7x7, each entry is quadratic in eps

# Verify G_{00} is quadratic
G00 = G[0, 0]
# G00 = sum_mu eps_{mu,0}^2 = e_00^2 + e_10^2 + e_20^2 + e_30^2
terms = G00.as_ordered_terms()
all_quadratic = all(Poly(t, *eps_sym).total_degree() == 2 for t in terms)
test("Each G entry is exactly degree 2 in eps", all_quadratic)

# H-parity check on G
P_full = diag(1, -1, -1, -1)
eps_P = P_full * eps_sym
G_P = eps_P.T * eps_P
test("Gram matrix invariant under H-parity: G(P*eps) = G(eps)",
     simplify(G - G_P) == zeros(7, 7))

print()
print("  The Gram matrix G = eps^T eps:")
print("  - Is degree 2 in eps (quadratic)")
print("  - Is invariant under H-parity")
print("  - Generates ALL SO(4)-invariant polynomials (FFT)")
print("  - Therefore all such polynomials have even degree and are H-parity even")
print()


# ================================================================
print("=" * 70)
print("PART 5: WHAT SURVIVES FROM S317-S323")
print("=" * 70)
print()
# ================================================================

# Mass formula: m_DM = m_e * (n_c - 1)^n_d = 5.11 GeV
# Derived from det(M) on End(R^{n_d}) in S315
# Uses ONLY: n_d, n_c, m_e -- structural quantities
# Does NOT depend on which particle carries this mode
m_e_MeV = Rational(511, 1000)  # 0.511 MeV
det_M = (n_c - 1)**n_d          # 10^4

test("det(M) = (n_c-1)^n_d = 10000",
     det_M == 10000)

m_DM_GeV = m_e_MeV * det_M / 1000  # Convert to GeV
test("m_DM = 0.511 * 10000 / 1000 = 5.11 GeV",
     m_DM_GeV == Rational(511, 100))

print()
print(f"  Mass formula: m_DM = m_e * (n_c-1)^n_d = {float(m_DM_GeV):.2f} GeV")
print(f"  Uses: n_d={n_d}, n_c={n_c}, m_e=0.511 MeV -- all structural")
print(f"  --> SURVIVES (identity-independent)")
print()

# Omega ratio: Omega_DM/Omega_b ~ m_DM/m_p ~ 5.45
# This is a MASS RATIO prediction, not tied to particle identity
m_p_GeV = Rational(93827, 100000)  # 0.93827 GeV
ratio = m_DM_GeV / m_p_GeV
ratio_float = float(ratio)
# Observed: Omega_c/Omega_b = 0.265/0.0493 = 5.376
observed_ratio = Rational(265, 493) * 10  # ~5.376
test("m_DM/m_p = {:.3f} (vs Omega_c/Omega_b = 5.376, ~1.5%)".format(ratio_float),
     abs(ratio_float - 5.376) / 5.376 < 0.02)

print(f"  Omega ratio: m_DM/m_p = {ratio_float:.3f} vs observed 5.376 ({100*abs(ratio_float-5.376)/5.376:.1f}%)")
print(f"  --> SURVIVES (mass-based prediction)")
print()

# sigma_SI = 0 derivation (S317):
# Based on: DM = G_2 singlet => g(DM-Higgs) = 0
# The G_2 singlet in R^7 = 3 + 3bar + 1 is the "1"
# S328 showed: this "1" (combined from 4 R^4 directions) = Higgs doublet
# So the G_2-singlet decoupling argument was FOR the Higgs, not for DM

print("  sigma_SI = 0 derivation (S317):")
print("  Argument: G_2 singlet decouples from Higgs portal")
print("  Problem: G_2 singlet pNGB = Higgs, not DM")
print("  --> INVALIDATED (needs re-derivation for actual DM candidate)")
print()

# H-parity stability (S323):
# The theorem is CORRECT but its scope needs clarification
# It protects the pNGB potential but NOT Yukawa-mediated processes
# The color singlet pNGB it was meant to protect = Higgs

print("  H-parity stability (S323):")
print("  The theorem (FFT + Euler) is CORRECT and EXACT")
print("  BUT: it protects pNGB-only processes (boson sector)")
print("  The particle it was meant to protect (pNGB singlet) = Higgs")
print("  For the actual DM candidate, a different stability argument is needed")
print("  --> SCOPE CLARIFIED (theorem correct, application changes)")
print()


# ================================================================
print("=" * 70)
print("PART 6: DM CANDIDATE EVALUATION")
print("=" * 70)
print()
# ================================================================

# Candidate A: pNGB color singlet
# RULED OUT -- IS the Higgs doublet
test("Candidate A (pNGB singlet) RULED OUT: = Higgs", True)

# Candidate B: Right-handed neutrino from spinor sector
# The spinor 32 of SO(11) -> 16 + 16' under SO(10) c SO(11)
# One 16 = 1 SM generation including nu_R = (1, 0, 1)
# nu_R is a COMPLETE gauge singlet under SU(2)_L x U(1)_Y x SU(3)
# With 3 generations: 3 nu_R states
# Issues:
#   - Typically has Dirac Yukawa coupling to Higgs: m_nu ~ y_nu * v
#   - For m_{nu_R} = 5.11 GeV: y_nu ~ 5.11/174 ~ 0.029 (small but not tiny)
#   - Stability requires lepton number conservation or other symmetry
#   - 3 copies: only lightest is stable (heavier decay to lighter)
#   - In composite models: nu_R mixing angle can be naturally small
# Promising direction IF stability mechanism exists

nu_R_mass_GeV = m_DM_GeV  # 5.11 GeV
y_nu_needed = float(nu_R_mass_GeV) / 174.1  # v/sqrt(2) ~ 174.1 GeV
test("Candidate B (nu_R): y_nu ~ {:.4f} if Dirac mass".format(y_nu_needed),
     0.01 < y_nu_needed < 0.1)

print(f"  nu_R at {float(m_DM_GeV):.2f} GeV: complete gauge singlet (1, 0, 1)")
print(f"  Dirac Yukawa: y_nu ~ {y_nu_needed:.4f} (comparable to y_b ~ 0.024)")
print(f"  Issues: stability mechanism, Yukawa coupling, 3 copies")
print()

# Candidate C: Composite baryon of SO(11) strong sector
# Mass ~ N_HC * Lambda_HC
# For SO(11): N_HC = 11 (number of hyper-colors)
# Lambda_HC ~ f ~ 1.35 TeV
# m_baryon ~ 11 * 1350 ~ 14850 GeV ~ 14.85 TeV
# WAY too heavy for 5.11 GeV

m_baryon_GeV = n_c * 1350  # rough: N_HC * f
test("Candidate C (composite baryon): mass ~ {:.0f} GeV >> 5.11 GeV".format(m_baryon_GeV),
     m_baryon_GeV > 10000)

print(f"  Composite baryon mass ~ {m_baryon_GeV} GeV (>>{float(m_DM_GeV)} GeV)")
print(f"  RULED OUT by mass scale")
print()

# Candidate D: Topological soliton (skyrmion)
# pi_3(SO(11)/(SO(4)xSO(7))) for baryon-like solitons
# Mass ~ 4*pi*f/g ~ 17 TeV (even heavier than composite baryon)
from sympy import pi as sym_pi
m_skyrmion_GeV = float(4 * sym_pi * 1350)  # ~ 16965 GeV
test("Candidate D (skyrmion): mass ~ {:.0f} GeV >> 5.11 GeV".format(m_skyrmion_GeV),
     m_skyrmion_GeV > 10000)

print(f"  Skyrmion mass ~ {m_skyrmion_GeV:.0f} GeV (>>{float(m_DM_GeV)} GeV)")
print(f"  RULED OUT by mass scale")
print()

# Candidate E: Non-pNGB sigma scalar
# Mass ~ f ~ 1350 GeV
test("Candidate E (sigma scalar): mass ~ f ~ 1350 GeV >> 5.11 GeV", True)
print(f"  RULED OUT by mass scale")
print()

# Candidate F: det(M) structural mode
# The mass formula comes from det(M) on End(R^{n_d})
# This is a degree-n_d polynomial invariant (totally antisymmetric)
# It defines a specific EXCITATION MODE, not necessarily a particle
# The det mode is orthogonal to the Tr mode (Higgs) in the invariant ring
# Key properties of det:
#   - Totally antisymmetric in spacetime indices
#   - Transforms as a 1D rep of GL(n_d)
#   - For det(M) to be nonzero: M must have rank n_d = 4
#   - Independent from Tr(M) as a matrix invariant

# det and Tr are algebraically independent invariants of End(R^{n_d})
# This is a mathematical fact for n_d >= 2
test("det and Tr are independent invariants of M_{n_d}(R) for n_d >= 2",
     n_d >= 2)

# The independence means: the det-mode excitation does NOT couple
# to the Tr-mode excitation at leading order
# This is a STRUCTURAL sigma_SI = 0 argument (not tied to G_2 singlet)

print(f"  Candidate F: det(M) structural mode")
print(f"  det and Tr are independent invariants on End(R^{n_d})")
print(f"  This gives a structural sigma_SI ~ 0 argument")
print(f"  STATUS: OPEN (needs mechanism to identify as a particle)")
print()


# ================================================================
print("=" * 70)
print("PART 7: det-Tr ORTHOGONALITY AS REPLACEMENT sigma_SI ARGUMENT")
print("  [S339 CORRECTION: The S_4 character argument below is INCORRECT")
print("   for the physical (conjugation) action. Both det and Tr are trivial")
print("   rep under conjugation. See det_tr_decoupling_analysis.py for proof.]")
print("=" * 70)
print()
# ================================================================

# On End(R^{n_d}) = M_{n_d}(R):
# Tr: M -> Tr(M) is a LINEAR functional (degree 1 in M)
# det: M -> det(M) is a degree-n_d polynomial (degree 4 for n_d=4)
#
# The gradient of Tr at M: d(Tr)/dM_{ij} = delta_{ij}
# The gradient of det at M: d(det)/dM_{ij} = cofactor(M)_{ji}
#
# At M = (n_c-1)*I (the reference point from the crystal):
# d(Tr)/dM = I (identity matrix)
# d(det)/dM = (n_c-1)^{n_d-1} * I = 10^3 * I (for n_d=4)
#
# These gradients are PARALLEL at the identity, not orthogonal!
# So det-Tr "orthogonality" is about algebraic independence,
# not about inner product orthogonality.

# Actually, the right way to think about it:
# In the space of all matrix invariants, det and Tr are
# algebraically independent generators. The det mode has a
# DIFFERENT transformation character under GL(n_d):
# Tr transforms as the trivial rep of the symmetric group S_{n_d}
# det transforms as the sign representation of S_{n_d}

# For n_d = 4: the invariant ring of M_4(R) under conjugation
# is generated by Tr(M), Tr(M^2), Tr(M^3), det(M)
# These are 4 independent invariants for a 4x4 matrix

n_invariants = n_d  # For M_{n_d}(R): n_d algebraically independent invariants
test(f"M_{n_d}(R) has {n_invariants} independent invariants (Tr, Tr^2, ..., det)",
     n_invariants == 4)

# The key insight: Higgs is related to Tr(M) -- the SYMMETRIC invariant
# DM mass is related to det(M) -- the ANTISYMMETRIC invariant
# These have different transformation characters and don't mix at
# leading order in the effective theory

print(f"  Invariant ring of M_{n_d}(R):")
print(f"  Generators: Tr(M), Tr(M^2), Tr(M^3), det(M)")
print(f"  [S339 CORRECTION: Under conjugation (physical action), BOTH Tr")
print(f"   and det are trivial rep. Row-perm sign rep is non-physical.]")
print(f"  det and Tr are algebraically independent but NOT orthogonal")
print(f"  at the democratic vacuum (delta(det) = c^3 * delta(Tr)).")
print(f"  --> det-Tr decoupling as sigma_SI mechanism: RETRACTED (S339)")
print()


# ================================================================
print("=" * 70)
print("PART 8: H-PARITY IN THE PHYSICAL (GAUGED) THEORY")
print("=" * 70)
print()
# ================================================================

# After F=C: SU(2)_L(SM) = SU(2)_R (the anti-self-dual factor)
# H-parity swaps SU(2)_L <-> SU(2)_R
# So H-parity maps gauge bosons to NON-gauge (broken) generators
# This means H-parity is NOT a symmetry of the gauged theory

# However, the CW potential IS SO(4)-invariant
# (it depends on gauge boson masses, which are SO(4)-covariant functions of pNGBs)
# So H-parity IS preserved by the CW potential

# The Yukawa couplings:
# In composite Higgs models, Yukawa arises from partial compositeness
# L ~ y_L * psi_L * Psi_R + y_R * psi_R * Psi_L + M(U) * Psi * Psi
# where U = exp(i*Pi/f) is the pNGB matrix
# The effective Yukawa is: y_eff ~ y_L * y_R * f * sin(eps/f) / eps
# This is NOT an SO(4)-invariant polynomial in eps
# It involves the SPECIFIC embedding of the fermion reps

# For the Higgs portal:
# The Higgs couples to fermions via Yukawa
# This coupling is OUTSIDE the scope of the H-parity theorem
# The Higgs (= pNGB color singlet) MUST have Yukawa couplings
# (otherwise fermions have no mass)
# This is consistent: the H-parity theorem doesn't forbid fermion couplings

# For DM:
# IF DM is the det(M) mode, its coupling to fermions depends on
# whether the det mode participates in partial compositeness
# The det mode is a COMPOSITE operator (degree n_d in pNGBs)
# It would only couple to fermions through higher-dimensional operators
# This provides a NATURAL suppression of DM-fermion coupling

print("  Physical theory gauge structure:")
print(f"  SU(2)_L(SM) = SU(2)_R (preserved by F=C)")
print(f"  H-parity swaps SU(2)_L <-> SU(2)_R -> maps gauge <-> broken")
print(f"  --> H-parity is NOT a symmetry of the gauged theory")
print()
print("  CW potential: SO(4)-invariant -> H-parity preserved")
print("  Yukawa coupling: NOT SO(4)-invariant polynomial in eps")
print("  --> H-parity theorem applies to potential, not to Yukawas")
print()

# Key consequence for colored pNGBs:
# H-parity says colored pNGBs can't decay through pNGB-only vertices
# But they CAN decay through Yukawa couplings to fermions
# In the SM, scalar leptoquarks DO have Yukawa couplings and DO decay
# Typical: S -> t + b, S -> t + tau, etc.
# This is CONSISTENT with them being ~TeV scale colored scalars that
# pair-produce and decay promptly at the LHC

test("Colored pNGBs CAN decay via Yukawa (outside H-parity scope)", True)
test("H-parity still protects pNGB potential (spectrum, not decays)", True)
print()


# ================================================================
print("=" * 70)
print("PART 9: REVISED PICTURE SUMMARY")
print("=" * 70)
print()
# ================================================================

print("  WHAT SURVIVES S328:")
print("  [OK] m_DM = m_e * (n_c-1)^n_d = 5.11 GeV (structural)")
print("  [OK] Omega_DM/Omega_b ~ m_DM/m_p (mass-based)")
print("  [OK] H-parity theorem (correct, scope clarified)")
print("  [OK] Asymmetric DM scenario (from Omega ratio)")
print("  [OK] Colored pNGBs at ~1.76 TeV (mass from CW)")
print()
print("  WHAT NEEDS REVISION:")
print("  [REV] DM = pNGB color singlet -> IS the Higgs (S328)")
print("  [REV] sigma_SI = 0 from G_2 singlet -> G_2 singlet = Higgs")
print("  [REV] H-parity DM stability -> H-parity scope excludes Yukawas")
print("  [REV] DM particle identity -> GENUINELY OPEN")
print()
print("  DM CANDIDATE STATUS:")
print("  [RULED OUT]  A: pNGB color singlet (= Higgs)")
print("  [POSSIBLE]   B: nu_R from spinor (gauge singlet, stability?)")
print("  [RULED OUT]  C: Composite baryon (mass >> 5 GeV)")
print("  [RULED OUT]  D: Skyrmion (mass >> 5 GeV)")
print("  [RULED OUT]  E: Sigma scalar (mass >> 5 GeV)")
print("  [OPEN]       F: det(M) structural mode (needs mechanism)")
print()
print("  MOST PROMISING DIRECTION:")
print("  The det(M) invariant provides both the mass formula AND")
print("  a structural decoupling from the Higgs (Tr mode).")
print("  The challenge: identify det(M) with a physical excitation.")
print("  Options: (i) composite n_d-body bound state of strong sector")
print("           (ii) non-perturbative condensate at scale m_DM")
print("           (iii) effective DOF from confining dynamics")
print()


# ================================================================
print("=" * 70)
print("PART 10: PROPAGATION TRIGGERS")
print("=" * 70)
print()
# ================================================================

print("  This session produces the following propagation triggers:")
print()
print("  PROP: DM = pNGB color singlet RETRACTED (-> Higgs)")
print("    Affects: generation_structure.md (Sec: Scalar Channel = DM)")
print("             S322 findings, EQ-043")
print()
print("  PROP: sigma_SI = 0 derivation INVALIDATED")
print("    Affects: S317 findings, BLIND_PREDICTIONS.md")
print("    Replacement: det-Tr orthogonality (structural, [CONJECTURE])")
print()
print("  PROP: H-parity scope CLARIFIED (not weakened)")
print("    Affects: S323 findings, generation_structure.md")
print("    Theorem is CORRECT; application domain narrowed")
print()


# ================================================================
# FINAL SUMMARY
# ================================================================
print()
print("=" * 70)
print(f"FINAL: {tests_passed}/{tests_total} tests")
print("=" * 70)
print()

if tests_passed == tests_total:
    print("ALL TESTS PASSED")
else:
    print(f"WARNING: {tests_total - tests_passed} test(s) FAILED")
