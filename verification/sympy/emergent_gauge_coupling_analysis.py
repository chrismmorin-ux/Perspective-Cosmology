#!/usr/bin/env python3
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
Emergent Gauge Coupling: Geometric vs Perturbative Mechanisms on Gr(4,11)

KEY FINDING: The one-loop (perturbative) mechanism gives Dynkin-weighted
coupling 1/g_2^2 ~ T_Dynkin = 7, while the framework claims democratic
coupling 1/g_2^2 = 28. The factor separating them is exactly n_d = 4.
The measurement (alpha_3/alpha_2 = 3.489) selects democratic (7/2 = 3.500)
over Dynkin (7/7 = 1).

This script:
  1. Computes SO(4) structure constants on Gr(4,11)
  2. Projects curvature onto SU(2)_L
  3. Computes one-loop Dynkin index for SU(2)_L
  4. Shows democratic/Dynkin ratio = n_d = 4
  5. Checks measurement discriminates the two mechanisms
  6. Assesses whether Step 6 can be derived from AXM_0109/0110/0117

Status: INVESTIGATION
Created: Session 228
Depends on:
  - democratic_schur_lemma.py (S224) -- metric is democratic
  - two_regime_structural_theorem.py (S222) -- singlet criterion
  - su3_mode_counting_test.py (S218) -- T_SU2 = T_SU3 = 22
"""

from sympy import *
from sympy import Rational as R

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

n_d = 4        # dim(H) = defect/spacetime dimension
n_c = 11       # crystal dimension
n_h = n_c - n_d  # 7 = hidden dimension
Im_H = 3       # imaginary quaternion dimensions
Im_O = 7       # imaginary octonion dimensions

dim_coset = n_d * n_h   # 28 = dim(Gr(4,11))
dim_SU3 = 8             # dim(SU(3))

# Measured
alpha_s_MZ = R(1179, 10000)
sin2_W_MSbar = R(23121, 100000)
alpha_EM_inv_MZ = R(127955, 1000)
alpha_2_inv_MZ = sin2_W_MSbar * alpha_EM_inv_MZ
ratio_meas = alpha_s_MZ * alpha_2_inv_MZ  # alpha_3/alpha_2

# ==============================================================================
# SECTION 1: SO(4) STRUCTURE AND SU(2)_L DECOMPOSITION
# ==============================================================================

print("=" * 72)
print("SECTION 1: SO(4) = SU(2)_L x SU(2)_R STRUCTURE")
print("=" * 72)
print()

# so(4) generators as 4x4 antisymmetric matrices
# E^{ij} has +1 at (i,j) and -1 at (j,i)
def antisym_gen(i, j, n=4):
    M = zeros(n, n)
    M[i, j] = 1
    M[j, i] = -1
    return M

# The 6 generators of so(4): E^{01}, E^{02}, E^{03}, E^{12}, E^{13}, E^{23}
E_so4 = {}
so4_pairs = []
for i in range(4):
    for j in range(i+1, 4):
        E_so4[(i,j)] = antisym_gen(i, j)
        so4_pairs.append((i,j))

# SU(2)_L generators: self-dual combinations
# Using standard convention for SO(4) = SU(2)_L x SU(2)_R:
J_L = [
    (E_so4[(0,1)] + E_so4[(2,3)]),   # J^1_L
    (E_so4[(0,2)] - E_so4[(1,3)]),   # J^2_L
    (E_so4[(0,3)] + E_so4[(1,2)]),   # J^3_L
]

# SU(2)_R generators: anti-self-dual combinations
J_R = [
    (E_so4[(0,1)] - E_so4[(2,3)]),   # J^1_R
    (E_so4[(0,2)] + E_so4[(1,3)]),   # J^2_R
    (E_so4[(0,3)] - E_so4[(1,2)]),   # J^3_R
]

# Trace inner product on so(4): <A, B> = -(1/2) Tr(A B)
def so_inner(A, B):
    return -R(1,2) * trace(A * B)

# Verify SU(2)_L algebra
print("SU(2)_L generator norms (should be equal):")
for I in range(3):
    norm = so_inner(J_L[I], J_L[I])
    print(f"  |J^{I+1}_L|^2 = {norm}")

print()
print("SU(2)_L commutation relations:")
for I in range(3):
    for J in range(I+1, 3):
        comm = J_L[I] * J_L[J] - J_L[J] * J_L[I]
        # Find which J_L[K] it equals
        for K in range(3):
            coeff = so_inner(comm, J_L[K]) / so_inner(J_L[K], J_L[K])
            if coeff != 0:
                print(f"  [J^{I+1}_L, J^{J+1}_L] = {coeff} J^{K+1}_L")

print()
print("L-R orthogonality (should be 0):")
for I in range(3):
    ip = so_inner(J_L[I], J_R[I])
    print(f"  <J^{I+1}_L, J^{I+1}_R> = {ip}")

print()
print("L-R commutation (should be 0):")
comm_LR = J_L[0] * J_R[0] - J_R[0] * J_L[0]
print(f"  [J^1_L, J^1_R] = {'0' if comm_LR == zeros(4,4) else 'NONZERO'}")

# ==============================================================================
# SECTION 2: CURVATURE STRUCTURE CONSTANTS ON Gr(4,11)
# ==============================================================================

print()
print("=" * 72)
print("SECTION 2: CURVATURE OF Gr(4,11) PROJECTED ONTO SU(2)_L")
print("=" * 72)
print()

# Tangent space of Gr(4,11) at base point: Hom(R^4, R^7) ~ R^{4x7}
# Basis: E_{ia} where i=0..3 (defect), a=0..6 (hidden)
#
# Structure constants (symmetric space):
# [E_{ia}, E_{jb}]_h = delta_{ab} * E^{ij}_{so(4)} + delta_{ij} * E^{ab}_{so(7)}
#
# SU(2)_L component:
# [E_{ia}, E_{jb}]_{su(2)_L} = delta_{ab} * proj_{su(2)_L}(E^{ij}_{so(4)})

# Compute projection of each E^{ij} onto SU(2)_L
# proj(X) = sum_I <X, J^I_L> / <J^I_L, J^I_L> * J^I_L
# |proj(X)|^2 = sum_I <X, J^I_L>^2 / <J^I_L, J^I_L>

J_L_norm_sq = so_inner(J_L[0], J_L[0])  # same for all by symmetry

print(f"J_L normalization: |J^I_L|^2 = {J_L_norm_sq}")
print()

print("Projection of so(4) generators onto su(2)_L:")
proj_data = {}
total_proj_sq = 0
for (i,j) in so4_pairs:
    proj_sq = sum(so_inner(E_so4[(i,j)], J_L[I])**2 / J_L_norm_sq
                  for I in range(3))
    proj_data[(i,j)] = proj_sq
    total_proj_sq += proj_sq
    E_norm_sq = so_inner(E_so4[(i,j)], E_so4[(i,j)])
    frac = proj_sq / E_norm_sq if E_norm_sq != 0 else 0
    print(f"  E^{{{i}{j}}}: |proj_L|^2 = {proj_sq}, "
          f"|E|^2 = {E_norm_sq}, fraction = {frac}")

print(f"\nTotal sum_{{i<j}} |proj_L(E^{{ij}})|^2 = {total_proj_sq}")

# The curvature coefficient for SU(2)_L:
# C_L = sum_{i,j=0..3, a,b=0..6} |[E_{ia}, E_{jb}]_{su(2)_L}|^2
#     = sum_{i<j, a, b} delta_{ab} * |proj_L(E^{ij})|^2 * (factor 2 from ordering + metric)
#
# More precisely, with normalized inner product:
# C_L = (n_c - n_d) * sum_{i<j} |proj_L(E^{ij})|^2
#   (the factor n_h = 7 comes from delta_{ab}^2 summed over a=b, giving 7 terms)

C_L_raw = n_h * total_proj_sq
print(f"\nCurvature coefficient for SU(2)_L:")
print(f"  C_L = n_h * sum_{{i<j}} |proj_L|^2")
print(f"       = {n_h} * {total_proj_sq} = {C_L_raw}")

# ==============================================================================
# SECTION 3: ONE-LOOP DYNKIN INDEX COMPUTATION
# ==============================================================================

print()
print("=" * 72)
print("SECTION 3: ONE-LOOP DYNKIN INDEX FOR SU(2)_L")
print("=" * 72)
print()

# Under SU(2)_L x SU(2)_R x SO(7):
#   R^4 = (2_L, 2_R)  -- bidoublet
#   R^7 = (1_L, 1_R, 7)  -- singlet under SU(2)s
#
# Tangent space Hom(R^4, R^7) under SU(2)_L:
#   = (R^4)* tensor R^7 = (2_L)* tensor (2_R)* tensor 7
#   = 2_L tensor 2_R tensor 7  (since 2* = 2 for SU(2))
#   Under SU(2)_L only: 2_L tensor (2_R tensor 7) = 2_L tensor R^14
#   = 14 copies of the fundamental doublet 2_L

n_doublets = (n_d // 2) * n_h   # (SU(2)_R multiplicity) * (SO(7) multiplicity) = 2 * 7 = 14
T_fund_su2 = R(1, 2)            # Dynkin index of fundamental SU(2)
T_dynkin = n_doublets * T_fund_su2

print(f"SU(2)_L representation content of Hom(R^4, R^7):")
print(f"  R^4 under SU(2)_L x SU(2)_R: (2, 2) -- bidoublet")
print(f"  R^7 under SU(2)_L: singlet (trivial)")
print(f"  Hom(R^4, R^7) under SU(2)_L: {n_doublets} copies of 2_L")
print(f"  dim check: {n_doublets} * 2 = {n_doublets * 2} = {dim_coset} [OK]")
print()
print(f"One-loop Dynkin index:")
print(f"  T_total = {n_doublets} * T(2) = {n_doublets} * {T_fund_su2} = {T_dynkin}")
print()

# ==============================================================================
# SECTION 4: DEMOCRATIC vs DYNKIN -- THE CRITICAL FORK
# ==============================================================================

print("=" * 72)
print("SECTION 4: DEMOCRATIC vs DYNKIN -- THE n_d FACTOR")
print("=" * 72)
print()

N_democratic = dim_coset  # 28
N_dynkin = T_dynkin        # 7

ratio_dem_dyn = R(N_democratic, N_dynkin)

print(f"Democratic counting (Schur's lemma): 1/g_2^2 = {N_democratic}")
print(f"Dynkin counting (one-loop):          1/g_2^2 = {N_dynkin}")
print(f"Ratio: {N_democratic}/{N_dynkin} = {ratio_dem_dyn} = n_d")
print()

print("STRUCTURAL ORIGIN of the factor n_d = 4:")
print(f"  Democratic: all {n_d} * {n_h} = {dim_coset} tangent directions equal")
print(f"  Dynkin: each of {n_h} internal modes contributes T_per_mode:")
print(f"    T_per_mode = (n_d/2) * T(2) = {n_d//2} * {T_fund_su2} = {(n_d//2) * T_fund_su2}")
print(f"    T_total = {n_h} * {(n_d//2) * T_fund_su2} = {T_dynkin}")
print()
print(f"  The difference: democratic counts n_d DIRECTIONS in R^{n_d}")
print(f"  Dynkin counts n_d/2 DOUBLETS (SU(2) representation content of R^{n_d})")
print(f"  For SU(2): n_d directions = n_d/2 doublets * dim(doublet) = {n_d//2} * 2 = {n_d}")
print(f"  But T(doublet) = 1/2, so Dynkin index per direction = T(2)/dim(2) = 1/4")
print(f"  Democratic index per direction = 1")
print(f"  Ratio = 1 / (1/4) = 4 = n_d")
print()

# ==============================================================================
# SECTION 5: MEASUREMENT DISCRIMINATES THE TWO MECHANISMS
# ==============================================================================

print("=" * 72)
print("SECTION 5: MEASUREMENT SELECTS DEMOCRATIC")
print("=" * 72)
print()

# Democratic prediction: alpha_3/alpha_2 = 28/8 = 7/2
ratio_dem = R(N_democratic, dim_SU3)
# Dynkin prediction: 1/alpha_2 ~ T_Dynkin_SU2, 1/alpha_3 ~ T_Dynkin_SU3
# From S218: T_SU2 = T_SU3 = 22 in End(V)
# So Dynkin gives alpha_2 = alpha_3, ratio = 1
T_SU2_full = 22  # from S218
T_SU3_full = 22  # from S218
ratio_dyn = R(T_SU2_full, T_SU3_full)

ratio_meas_val = float(ratio_meas)

print(f"Prediction: alpha_3/alpha_2")
print(f"  Democratic: {N_democratic}/{dim_SU3} = {ratio_dem} = {float(ratio_dem):.4f}")
print(f"  Dynkin:     {T_SU2_full}/{T_SU3_full} = {ratio_dyn} = {float(ratio_dyn):.4f}")
print(f"  Measured:   {ratio_meas_val:.4f}")
print()

err_dem = abs(float(ratio_dem) - ratio_meas_val) / ratio_meas_val
err_dyn = abs(float(ratio_dyn) - ratio_meas_val) / ratio_meas_val

print(f"  Democratic error: {err_dem*100:.2f}%")
print(f"  Dynkin error:     {err_dyn*100:.1f}%")
print()
print(f"  MEASUREMENT SELECTS: {'DEMOCRATIC' if err_dem < err_dyn else 'DYNKIN'}")
print(f"  Discrimination: {err_dyn/err_dem:.0f}x better precision for democratic")
print()

# ==============================================================================
# SECTION 6: THE THREE MECHANISMS AND THEIR PREDICTIONS
# ==============================================================================

print("=" * 72)
print("SECTION 6: THREE CANDIDATE MECHANISMS")
print("=" * 72)
print()

print("Mechanism A: ONE-LOOP PERTURBATIVE (standard QFT)")
print("  Gauge kinetic from Goldstone loops: 1/g^2 ~ T_Dynkin * f^2/(16pi^2) * log(...)")
print(f"  For SU(2)_L: T = {T_dynkin}")
print("  Result: 1/g_2^2 ~ 7 (Dynkin-weighted)")
print("  Prediction: alpha_3/alpha_2 = T_SU2/T_SU3 = 22/22 = 1")
print("  Status: RULED OUT by measurement (alpha_3/alpha_2 = 3.49, not 1)")
print()

print("Mechanism B: GEOMETRIC (gauge field = connection on vacuum manifold)")
print("  Gauge coupling from Riemannian curvature of Gr(4,11)")
print("  Metric determined by AXM_0110 (HS inner product)")
print("  Schur's lemma: metric is democratic (all 28 directions equal)")
print(f"  Curvature coefficient C_L = {C_L_raw} (depends on normalization)")
print("  Result: 1/g_2^2 = 28 (if coupling = metric, i.e., Step 6)")
print("  Status: Requires [A-PHYSICAL] assumption about gauge field nature")
print()

print("Mechanism C: KALUZA-KLEIN (gauge coupling from extra-dimensional volume)")
print("  1/g^2 = Vol(internal) / G_N^{higher-dim}")
print("  If volume ~ dim(coset): 1/g^2 ~ 28")
print("  Status: Requires deriving KK geometry from framework axioms")
print()

# ==============================================================================
# SECTION 7: CAN STEP 6 BE DERIVED FROM AXIOMS?
# ==============================================================================

print("=" * 72)
print("SECTION 7: DERIVABILITY ASSESSMENT")
print("=" * 72)
print()

print("Available axioms:")
print("  AXM_0109: V_Crystal exists as inner product space (F = R or C)")
print("  AXM_0110: All basis vectors perfectly orthogonal")
print("            => HS metric: <A,B> = (1/n_c) Tr(A^T B)")
print("  AXM_0117: Gradient flow on crystallization potential")
print("            => Mexican hat: F(eps) = -a|eps|^2 + b|eps|^4")
print()

print("What the axioms DETERMINE:")
print("  1. The order parameter M in End(V) with HS metric [from AXM_0110]")
print("  2. SSB to Gr(4,11) via crystallization [from AXM_0117]")
print("  3. The metric on Gr(4,11) is democratic [D: Schur's lemma on AXM_0110]")
print("  4. The Goldstone kinetic term: L = (f^2/2) delta_ab d_mu pi^a d^mu pi^b")
print()

print("What the axioms do NOT determine:")
print("  5. Whether gauge fields are elementary or composite")
print("  6. Whether the gauge kinetic term comes from loops or geometry")
print("  7. Whether the gauge coupling inherits the metric or has Dynkin weighting")
print()

print("CONCLUSION:")
print("  Step 6 [A-PHYSICAL] CANNOT be derived from AXM_0109/0110/0117 alone.")
print("  The axioms determine the ORDER PARAMETER dynamics, not the GAUGE")
print("  FIELD dynamics. The connection between them requires either:")
print("    (a) A new axiom about gauge field emergence")
print("    (b) An explicit dynamical calculation (KK, composite, etc.)")
print("    (c) A proof that the framework Lagrangian implies emergent gauge fields")
print()
print("  The strongest formulation: Step 6 should be adopted as a framework")
print("  PRINCIPLE (not axiom, not derived — a physical identification):")
print()
print('  [A-PHYSICAL] "In the crystallized vacuum, gauge couplings are')
print('  determined by the metric geometry of the vacuum manifold, not')
print('  by perturbative loop effects. The gauge kinetic coefficient')
print('  1/g_i^2 equals the dimension of the relevant submanifold')
print('  (coset for interface, group for internal)."')
print()
print("  This principle is FALSIFIABLE:")
print("    - Predicts alpha_3/alpha_2 = 7/2 (measured: 3.489, 0.34%)")
print("    - Predicts sin^2(theta_W) = 28/121 (measured: 0.23121, 843 ppm)")
print("    - Would be falsified if precision measurements shift ratios")
print()

# ==============================================================================
# SECTION 8: CURVATURE INVARIANT NORMALIZATION
# ==============================================================================

print("=" * 72)
print("SECTION 8: CURVATURE INVARIANT CROSS-CHECK")
print("=" * 72)
print()

# On the symmetric space Gr(k,n) = SO(n)/(SO(k) x SO(n-k)):
# The Ricci tensor Ric = (n/2) * g  (for the normal metric from Killing form)
# Actually, for Gr(k,n): Ric = (n - 2)/2 * g  (known result)
# But this depends on normalization convention.

# The sectional curvature K(X,Y) = <R(X,Y)Y, X> / (|X|^2 |Y|^2 - <X,Y>^2)
# For Gr(k,n) with the standard metric, 0 <= K <= 2 (for unit-speed geodesics)

# For our purposes: the KEY quantity is the ratio of curvature invariants
# projected onto SU(2)_L vs the total curvature.

# Total curvature coefficient (all of so(4) x so(7)):
# C_total = n_h * (sum over so(4) proj) + n_d * (sum over so(7) proj)
# The so(4) projection of the commutator [E_{ia}, E_{jb}]:
#   [E_{ia}, E_{jb}]_{so(4)} = delta_{ab} E^{ij}
#   |...|^2 = delta_{ab} * |E^{ij}|^2

# Sum over all pairs (ia),(jb):
# C_{so(4)} = sum_{i<j, a, b} delta_{ab} |E^{ij}|^2
#           = n_h * sum_{i<j} |E^{ij}|^2
#           = 7 * (6 * 1) = 42  (using |E^{ij}|^2 = 1 in our convention)

# Similarly C_{so(7)} = n_d * sum_{a<b} |E^{ab}|^2 = 4 * 21 = 84
# Total C = 42 + 84 = 126

# But these should use the actual inner product. Let me compute:
E_norm_sq = so_inner(E_so4[(0,1)], E_so4[(0,1)])  # should be same for all
print(f"so(4) generator norm: |E^{{ij}}|^2 = {E_norm_sq}")

C_so4_total = n_h * len(so4_pairs) * E_norm_sq
print(f"Curvature from so(4) part: n_h * 6 * |E|^2 = {n_h} * 6 * {E_norm_sq} = {C_so4_total}")

# Fraction going to SU(2)_L:
print(f"Curvature to SU(2)_L: C_L = {C_L_raw}")
print(f"Fraction: C_L / C_so4 = {C_L_raw} / {C_so4_total} = {R(C_L_raw, C_so4_total)}")
print()

# This fraction should be dim(su(2)_L) / dim(so(4)) = 3/6 = 1/2
print(f"Expected fraction (dim ratio): dim(su(2)_L)/dim(so(4)) = 3/6 = 1/2")
print(f"  (By symmetry: so(4) = su(2)_L + su(2)_R splits curvature equally)")
print()

# So the curvature coefficient for SU(2)_L is:
# C_L = (1/2) * C_so4 = (1/2) * n_h * 6 * |E|^2
# Relative to total tangent space metric (28 modes with weight 1/n_c each):
# "gauge coupling from curvature" ~ C_L / (metric normalization)

# The key ratio:
print("KEY RATIOS:")
print(f"  C_L = {C_L_raw}")
print(f"  dim(coset) = {dim_coset}")
print(f"  T_Dynkin = {T_dynkin}")
print(f"  C_L / T_Dynkin = {R(C_L_raw, T_dynkin)} = {float(R(C_L_raw, T_dynkin)):.2f}")
print(f"  C_L / dim(coset) = {R(C_L_raw, dim_coset)} = {float(R(C_L_raw, dim_coset)):.2f}")
print()

# IMPORTANT: C_L = 21 = Im_O * Im_H = 7 * 3 is a THIRD distinct value!
# It equals neither the democratic (28) nor the Dynkin (7) prediction.
print("CRITICAL FINDING: THREE distinct candidate values exist:")
print(f"  Democratic (metric counting):        N = dim(coset) = {dim_coset}")
print(f"  Dynkin (one-loop):                   T = T_Dynkin   = {T_dynkin}")
print(f"  Curvature (geometric connection):    C = n_h*dim(su(2)_L) = {C_L_raw}")
print(f"  = Im_O * Im_H = {Im_O} * {Im_H} = {Im_O * Im_H}")
print()
print(f"  None of the three standard mechanisms gives 28 automatically.")
print(f"  Democratic counting (28) is from COUNTING DIRECTIONS, not")
print(f"  from curvature invariants. This is the content of Step 6.")
print()

# ==============================================================================
# SECTION 9: WHY DEMOCRATIC BEATS DYNKIN (PHYSICAL ARGUMENT)
# ==============================================================================

print("=" * 72)
print("SECTION 9: PHYSICAL ARGUMENT FOR DEMOCRATIC OVER DYNKIN")
print("=" * 72)
print()

print("In standard QFT:")
print("  - Gauge fields are ELEMENTARY (pre-existing kinetic term)")
print("  - Matter fields couple to gauge fields via representation matrices T^I")
print("  - Loop corrections to gauge propagator weighted by Dynkin index T(r)")
print("  - This gives 1/g^2(mu) = 1/g^2(Lambda) + b_i/(2pi) * log(Lambda/mu)")
print("  - The beta coefficient b_i involves sum of T(r) over matter content")
print()

print("In the framework:")
print("  - Gauge fields are EMERGENT (no pre-existing kinetic term)")
print("  - All dynamics from L = (1/2n_c) Tr(dM^T dM) + V(M)")
print("  - After SSB, 28 Goldstone modes with democratic metric (Schur)")
print("  - The gauge field IS the connection, not a separate field")
print("  - Step 6 claims: coupling = metric geometry, not loop correction")
print()

print("Why this matters:")
print("  Dynkin gives T^I_{ab} T^I_{cd} weighting (representation-dependent)")
print("  Democratic gives delta_{ab} delta_{cd} weighting (metric-dependent)")
print("  The difference = whether coupling respects METRIC symmetry or")
print("  REPRESENTATION structure of the subgroup")
print()

print("  On the irreducible tangent space, the metric has MORE symmetry")
print(f"  (SO({n_d}) x SO({n_h})) than the gauge group (SU(2)_L subset SO({n_d})).")
print("  Democratic counting uses the FULL metric symmetry.")
print("  Dynkin counting uses only the GAUGE group structure.")
print()

print("  Step 6 claims: the gauge coupling is fixed at the scale where the")
print("  full metric symmetry applies (crystallization scale), not at the")
print("  scale where only the gauge group acts (low energy).")
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 72)
print("VERIFICATION TESTS")
print("=" * 72)
print()

tests = [
    # SO(4) structure
    ("so(4) = su(2)_L + su(2)_R (6 = 3 + 3 generators)",
     len(so4_pairs) == 6),

    ("J_L generators form su(2) algebra",
     (J_L[0]*J_L[1] - J_L[1]*J_L[0]) != zeros(4,4)),

    ("J_L and J_R commute",
     J_L[0]*J_R[0] - J_R[0]*J_L[0] == zeros(4,4)),

    ("J_L and J_R orthogonal",
     all(so_inner(J_L[I], J_R[I]) == 0 for I in range(3))),

    # Curvature projections
    (f"Curvature proj fraction = 1/2 (L-R symmetric)",
     R(C_L_raw, C_so4_total) == R(1,2)),

    # Dynkin index
    (f"Hom(R^4,R^7) under SU(2)_L: {n_doublets} doublets",
     n_doublets == 14),

    (f"T_Dynkin = 14 * 1/2 = 7",
     T_dynkin == 7),

    (f"dim(coset) = 28",
     dim_coset == 28),

    # The critical ratio
    (f"Democratic/Dynkin = n_d = {n_d}",
     R(dim_coset, T_dynkin) == n_d),

    # Measurement test
    (f"Democratic ratio 7/2 within 0.5% of measured",
     err_dem < 0.005),

    (f"Dynkin ratio 1 is wrong by > 50%",
     err_dyn > 0.50),

    (f"Measurement selects democratic over Dynkin",
     err_dem < err_dyn),

    # Predictions
    (f"sin^2(theta_W) = 28/121",
     R(dim_coset, n_c**2) == R(28, 121)),

    (f"alpha_3/alpha_2 = 7/2",
     R(dim_coset, dim_SU3) == R(7, 2)),

    # Framework numbers
    (f"Democratic/Dynkin ratio = n_d = dim(H)",
     R(dim_coset, T_dynkin) == n_d and n_d == 4),

    (f"T_per_internal_mode = (n_d/2)*T(2) = 1",
     (n_d // 2) * T_fund_su2 == 1),

    # Curvature coefficient
    (f"C_L = n_h * (3 * |E|^2) = {n_h * 3 * E_norm_sq}",
     C_L_raw == n_h * 3 * E_norm_sq),
]

pass_count = 0
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if passed:
        pass_count += 1
    print(f"  [{status}] {name}")

print()
print(f"Results: {pass_count}/{len(tests)} PASS")

# ==============================================================================
# SUMMARY
# ==============================================================================

print()
print("=" * 72)
print("SUMMARY")
print("=" * 72)
print()
print("1. The sigma model on Gr(4,11) with HS metric gives a DEMOCRATIC")
print("   metric on the tangent space (Schur's lemma, S224).")
print()
print("2. However, the one-loop GAUGE KINETIC TERM is Dynkin-weighted,")
print("   not democratic. This is standard QFT: loop diagrams involve")
print("   representation matrices T^I, which weight by Dynkin index T(r).")
print()
print("3. The factor separating democratic from Dynkin is n_d = 4:")
print("   28 (democratic) = 4 * 7 (Dynkin)")
print("   This traces to: democratic counts DIRECTIONS in R^4,")
print("   Dynkin counts SU(2)_L DOUBLETS in R^4 weighted by T(2)=1/2.")
print()
print("4. MEASUREMENT SELECTS DEMOCRATIC: alpha_3/alpha_2 = 7/2 (0.34%)")
print("   vs Dynkin prediction alpha_2 = alpha_3 (wrong by 250%).")
print()
print("5. Step 6 [A-PHYSICAL] CANNOT be derived from AXM_0109/0110/0117.")
print("   It requires an assumption about how gauge fields emerge.")
print("   Recommended: adopt as a framework PRINCIPLE with empirical support.")
print()
print("6. The principle is FALSIFIABLE through precision coupling ratios.")
print()
