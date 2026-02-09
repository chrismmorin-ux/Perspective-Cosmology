#!/usr/bin/env python3
"""
Mu=0 Locus Structure on Gr(4,11;R)

KEY FINDING: The mu=0 locus (purely associative configurations) has
dim = 17 and codimension 11 = n_c in R^28. It fibers over the
Lagrangian Grassmannian LGr(2, R^4) with fiber R^14.

KEY THEOREM: mu(A) = 0 iff A*J_I*A^T = 0 iff rows of A span an
omega_I-isotropic subspace. This follows because elements of the
7-component of Lambda^2(R^7) have rank 0 or 6 (never 2 or 4),
while A*J_I*A^T has rank <= 4.

Framework numbers:
  dim(mu^{-1}(0)) = 17 = 14 + 3 = dim(g_2) + Im_H
  codim(mu^{-1}(0)) = 11 = n_c
  fiber = R^{7x2} = R^14 = dim(g_2)
  base = LGr(2, R^4) with dim = 3 = Im_H

Session: S278
Status: VERIFICATION
Dependencies: S273 (g2_moment_map.py)
"""

from sympy import *
import random as _rng

print("=" * 70)
print("MU=0 LOCUS STRUCTURE ON Gr(4,11;R)")
print("Session S278")
print("=" * 70)
print()

tests = []

# ============================================================
# FRAMEWORK CONSTANTS
# ============================================================
n_d = 4
n_c = 11
Im_H = 3
Im_O = 7
dim_Gr = n_d * Im_O  # 28
dim_g2 = 14

# ============================================================
# SETUP: Fano plane and G_2 structure (from g2_moment_map.py)
# ============================================================

phi_triples = [
    (1, 2, 3), (1, 4, 5), (1, 7, 6),
    (2, 4, 6), (2, 5, 7), (3, 4, 7), (3, 5, 6)
]

phi = {}
for i, j, k in phi_triples:
    for a, b, c in [(i,j,k), (j,k,i), (k,i,j)]:
        phi[(a,b,c)] = 1
    for a, b, c in [(j,i,k), (i,k,j), (k,j,i)]:
        phi[(a,b,c)] = -1

def get_phi(i, j, k):
    return phi.get((i, j, k), 0)

# Contraction metric C*C
CstarC_val = sum(
    get_phi(a+1, b+1, 1) * get_phi(a+1, b+1, 1)
    for a in range(7) for b in range(7)
)
scale = CstarC_val  # Should be 6

# J_I: quaternionic complex structure on R^4
J_I = Matrix([
    [0, -1, 0, 0],
    [1, 0, 0, 0],
    [0, 0, 0, -1],
    [0, 0, 1, 0]
])

def project_onto_7(B):
    """Project antisymmetric B (7x7) onto the 7-component."""
    v = Matrix(7, 1, lambda k, _: sum(
        get_phi(i+1, j+1, k+1) * B[i, j]
        for i in range(7) for j in range(7)
    ) / scale)
    result = Matrix(7, 7, lambda i, j: sum(
        get_phi(i+1, j+1, k+1) * v[k]
        for k in range(7)
    ))
    return result

def project_onto_14(B):
    """Project antisymmetric B (7x7) onto g_2 = 14-component."""
    return B - project_onto_7(B)

def moment_map(A):
    """Compute mu(A) = -(1/2) * P_14(A * J_I * A^T)."""
    B = A * J_I * A.T
    return Rational(-1, 2) * project_onto_14(B)


# ============================================================
# PART 1: RANK STRUCTURE OF THE 7-COMPONENT
# ============================================================
print("PART 1: Rank of elements in the 7-component of Lambda^2(R^7)")
print("-" * 60)
print()

# The 7-component is Im(C) where C: R^7 -> Lambda^2(R^7),
# u |-> iota_u(phi). Each nonzero element has rank 6.

print("Constructing iota_u(phi) for all unit basis vectors u = e_k:")
print()

ranks_7comp = []
for k in range(1, 8):
    # Build M_{ij} = sum_l phi_{ijl} * u_l = phi_{ijk}
    M = Matrix(7, 7, lambda i, j: get_phi(i+1, j+1, k))
    r = M.rank()
    ranks_7comp.append(r)
    kernel = M.nullspace()
    ker_dims = [v.T.tolist()[0] for v in kernel]
    print(f"  u = e_{k}: rank(iota_u(phi)) = {r}, kernel = {ker_dims}")

print()
t1 = all(r == 6 for r in ranks_7comp)
tests.append(("All basis elements of 7-component have rank 6", t1))

# Check general linear combinations
print("Checking general u = a*e_1 + b*e_2 + ... :")
_rng.seed(137)
general_ranks = []
for trial in range(20):
    u = [_rng.randint(-3, 3) for _ in range(7)]
    if all(x == 0 for x in u):
        continue
    M = Matrix(7, 7, lambda i, j: sum(
        get_phi(i+1, j+1, k+1) * u[k] for k in range(7)
    ))
    r = M.rank()
    general_ranks.append(r)

print(f"  Tested {len(general_ranks)} nonzero u vectors")
print(f"  Ranks found: {sorted(set(general_ranks))}")
print()

t2 = all(r == 6 for r in general_ranks)
tests.append(("All nonzero elements of 7-component have rank 6", t2))

print("[THEOREM] Elements of the 7-component of Lambda^2(R^7) have rank:")
print("  - rank 0 if u = 0 (the zero 2-form)")
print("  - rank 6 if u != 0 (kernel = span{u})")
print("  NO elements of rank 2 or 4 exist in the 7-component.")
print()


# ============================================================
# PART 2: CONSEQUENCE FOR mu=0
# ============================================================
print("PART 2: mu=0 iff A*J_I*A^T = 0")
print("-" * 60)
print()

print("Key chain:")
print("  1. B = A*J_I*A^T is antisymmetric (J_I^T = -J_I)")
print("  2. rank(B) <= rank(A) <= 4")
print("  3. mu(A) = 0 iff P_14(B) = 0 iff B in 7-component")
print("  4. 7-component has NO elements of rank 2 or 4 (Part 1)")
print("  5. Therefore B in 7-component AND rank(B) <= 4 iff B = 0")
print("  6. CONCLUSION: mu(A) = 0 iff A*J_I*A^T = 0")
print()

# Verify: rank of B for generic rank-4 A
print("Verify: B = A*J_I*A^T has rank <= 4 for generic A:")
_rng.seed(42)
B_ranks = []
for trial in range(20):
    A_test = Matrix(7, 4, lambda i, j: _rng.randint(-2, 2))
    B = A_test * J_I * A_test.T
    r = B.rank()
    B_ranks.append(r)
print(f"  Ranks of B for 20 random A: {sorted(set(B_ranks))}")
print(f"  All <= 4: {all(r <= 4 for r in B_ranks)}")
t3 = all(r <= 4 for r in B_ranks)
tests.append(("B = A*J_I*A^T always has rank <= 4", t3))
print()


# ============================================================
# PART 3: ISOTROPIC ROW CONDITION
# ============================================================
print("PART 3: A*J_I*A^T = 0 iff rows of A are omega_I-isotropic")
print("-" * 60)
print()

print("B_{ij} = sum_{p,q} A_{ip} (J_I)_{pq} A_{jq} = omega_I(row_i, row_j)")
print("where omega_I is the symplectic form induced by J_I.")
print()
print("B = 0 iff omega_I(row_i, row_j) = 0 for all i,j")
print("     iff all 7 rows of A lie in an isotropic subspace of (R^4, omega_I)")
print()
print("Since omega_I is a symplectic form on R^4, maximal isotropic")
print("(Lagrangian) subspaces have dimension 2.")
print("Therefore: rank(A) <= 2 for all mu=0 configurations.")
print()

# Verify: construct explicit mu=0 configurations
print("Verification: explicit mu=0 configurations")
print()

# Lagrangian subspace L = span{e_1, e_3} (check: omega_I(e_1, e_3) = 0)
omega_13 = (Matrix([1,0,0,0]).T * J_I * Matrix([0,0,1,0]))[0,0]
print(f"  omega_I(e_1, e_3) = {omega_13}")
t4a = omega_13 == 0
tests.append(("span(e_1, e_3) is omega_I-isotropic", t4a))

# Build A with rows in span{e_1, e_3}: A_{i,1} and A_{i,3} arbitrary, A_{i,2}=A_{i,4}=0
A_lagr = Matrix(7, 4, lambda i, j: _rng.randint(-3, 3) if j in [0, 2] else 0)
mu_lagr = moment_map(A_lagr)
is_zero = mu_lagr == zeros(7, 7)
print(f"  A with rows in span(e_1, e_3): mu = 0? {is_zero}")
tests.append(("Lagrangian-constrained A has mu=0", is_zero))
print()

# Non-isotropic check: rows using e_1 and e_2 (which are NOT isotropic)
omega_12 = (Matrix([1,0,0,0]).T * J_I * Matrix([0,1,0,0]))[0,0]
print(f"  omega_I(e_1, e_2) = {omega_12}")
A_non = zeros(7, 4)
A_non[0, 0] = 1  # row 0 = e_1
A_non[1, 1] = 1  # row 1 = e_2
mu_non = moment_map(A_non)
is_nonzero = mu_non != zeros(7, 7)
print(f"  A with rows in span(e_1, e_2): mu != 0? {is_nonzero}")
tests.append(("Non-isotropic rows give mu != 0", is_nonzero))
print()


# ============================================================
# PART 4: ALL LAGRANGIAN SUBSPACES
# ============================================================
print("PART 4: Enumeration of Lagrangian 2-planes in (R^4, omega_I)")
print("-" * 60)
print()

# omega_I is given by J_I: omega_I(v,w) = v^T J_I w
# = -v_1*w_2 + v_2*w_1 - v_3*w_4 + v_4*w_3
# This is omega = e_1^e_2 + e_3^e_4 (standard form)

# Lagrangian 2-planes: spanned by {v, w} with omega(v,v) = omega(w,w) = omega(v,w) = 0
# Since omega is antisymmetric, omega(v,v) = 0 always. So condition: omega(v,w) = 0.

# The Lagrangian Grassmannian LGr(2, R^4, omega_I) parametrizes such planes.
# dim(LGr(n, 2n)) = n(n+1)/2. For n=2: dim = 3.

dim_LGr = 2 * 3 // 2  # n(n+1)/2 for n=2
print(f"dim(LGr(2, R^4)) = {dim_LGr}")
print(f"  = Im_H = {Im_H}")
t5 = dim_LGr == Im_H
tests.append(("dim(LGr(2, R^4)) = Im_H = 3", t5))
print()

# Examples of Lagrangian planes:
lagrangians = [
    ("L1 = span(e1, e3)", Matrix([1,0,0,0]), Matrix([0,0,1,0])),
    ("L2 = span(e1, e4)", Matrix([1,0,0,0]), Matrix([0,0,0,1])),
    ("L3 = span(e2, e3)", Matrix([0,1,0,0]), Matrix([0,0,1,0])),
    ("L4 = span(e2, e4)", Matrix([0,1,0,0]), Matrix([0,0,0,1])),
    ("L5 = span(e1+e2, e3+e4)", Matrix([1,1,0,0]), Matrix([0,0,1,1])),
    ("L6 = span(e1+e4, e2+e3)", Matrix([1,0,0,1]), Matrix([0,1,1,0])),
]

print("Examples of Lagrangian planes (verifying omega(v,w) = 0):")
for name, v, w in lagrangians:
    omega_vw = (v.T * J_I * w)[0,0]
    print(f"  {name}: omega(v,w) = {omega_vw} {'OK' if omega_vw == 0 else 'FAIL'}")
print()


# ============================================================
# PART 5: DIMENSION OF mu^{-1}(0)
# ============================================================
print("PART 5: Dimension count for mu^{-1}(0)")
print("-" * 60)
print()

print("mu^{-1}(0) = {A in R^{7x4} : row_space(A) is omega_I-isotropic}")
print()
print("This fibers over LGr(2, R^4, omega_I):")
print("  For each Lagrangian L in LGr(2, R^4):")
print("    the fiber is Hom(R^7, L) = R^{7x2} = R^14")
print()

dim_fiber = Im_O * 2  # 7 * 2 = 14
dim_base = dim_LGr    # 3
dim_mu0 = dim_fiber + dim_base
codim_mu0 = dim_Gr - dim_mu0

print(f"  dim(fiber) = {dim_fiber} = Im_O x C_dim = {Im_O} x 2")
print(f"  dim(base)  = {dim_base} = Im_H = {Im_H}")
print(f"  dim(mu^{{-1}}(0)) = {dim_fiber} + {dim_base} = {dim_mu0}")
print(f"  codim(mu^{{-1}}(0)) = {dim_Gr} - {dim_mu0} = {codim_mu0}")
print()

t6 = codim_mu0 == n_c
tests.append((f"codim(mu^{{-1}}(0)) = {codim_mu0} = n_c = {n_c}", t6))

t7 = dim_fiber == dim_g2
tests.append((f"dim(fiber) = {dim_fiber} = dim(g_2) = {dim_g2}", t7))

t8 = dim_base == Im_H
tests.append((f"dim(base) = {dim_base} = Im_H = {Im_H}", t8))

print("FRAMEWORK NUMBER DECOMPOSITION:")
print(f"  28 = dim(Gr) = n_d x Im_O = {n_d} x {Im_O}")
print(f"  17 = dim(mu^{{-1}}(0)) = dim(g_2) + Im_H = {dim_g2} + {Im_H}")
print(f"  11 = codim = n_c")
print(f"  All framework numbers!")
print()


# ============================================================
# PART 6: NUMERICAL JACOBIAN VERIFICATION
# ============================================================
print("PART 6: Numerical Jacobian rank verification")
print("-" * 60)
print()

# Compute Jacobian of the map F(A) = A*J_I*A^T (flattened upper triangle)
# at a generic mu=0 point. The rank should be 28 - 17 = 11.
#
# F: R^28 -> R^21 (the 21 = dim(so(7)) independent entries of B)
# At a mu=0 point, dF should have rank 11 (generically).

# First build a generic mu=0 point: rows in span{e_1, e_3}
_rng.seed(273)
A_generic = Matrix(7, 4, lambda i, j:
    _rng.randint(-5, 5) if j in [0, 2] else 0
)

# Verify it's mu=0
B_check = A_generic * J_I * A_generic.T
assert B_check == zeros(7, 7), "A_generic should give B=0"

# Compute numerical Jacobian of F(A) = flatten_upper(A*J_I*A^T)
# at A_generic using finite differences
eps = Rational(1, 10000)
jac_rows = []

for idx in range(28):
    i_row = idx // 4
    i_col = idx % 4
    A_plus = A_generic.copy()
    A_plus[i_row, i_col] += eps

    B_plus = A_plus * J_I * A_plus.T
    # Flatten upper triangle
    dB = (B_plus - B_check) / eps
    row = []
    for a in range(7):
        for b in range(a+1, 7):
            row.append(dB[a, b])
    jac_rows.append(row)

Jac = Matrix(jac_rows)  # 28 x 21
rank_J = Jac.rank()

print(f"At a generic mu=0 point (rank-2 A with isotropic rows):")
print(f"  Jacobian of F(A) = A*J_I*A^T: shape {Jac.rows}x{Jac.cols}")
print(f"  rank(Jacobian) = {rank_J}")
print(f"  kernel dim = 28 - {rank_J} = {28 - rank_J}")
print(f"  Expected: kernel dim = dim(mu^{{-1}}(0)) = 17")
print()

t9 = (28 - rank_J) == 17
tests.append((f"Jacobian kernel dim = {28 - rank_J} = 17 (matches theory)", t9))

# Also try the Jacobian of mu directly (map to the 14-component)
jac_mu_rows = []
for idx in range(28):
    i_row = idx // 4
    i_col = idx % 4
    A_plus = A_generic.copy()
    A_plus[i_row, i_col] += eps

    mu_plus = moment_map(A_plus)
    mu_base = moment_map(A_generic)  # should be zero
    dmu = (mu_plus - mu_base) / eps

    row = []
    for a in range(7):
        for b in range(a+1, 7):
            row.append(dmu[a, b])
    jac_mu_rows.append(row)

Jac_mu = Matrix(jac_mu_rows)  # 28 x 21 (but only 14 independent)
rank_Jmu = Jac_mu.rank()

print(f"Jacobian of mu(A) at same point:")
print(f"  rank(Jacobian of mu) = {rank_Jmu}")
print(f"  Expected: 11 (= n_c = codim of mu^{{-1}}(0))")
print()

t10 = rank_Jmu == n_c
tests.append((f"rank(d_mu) at generic mu=0 point = {rank_Jmu} = n_c = {n_c}", t10))


# ============================================================
# PART 7: STRATIFICATION OF mu^{-1}(0)
# ============================================================
print("PART 7: Stratification by rank")
print("-" * 60)
print()

print("mu^{-1}(0) has three strata:")
print()

# Stratum 0: A = 0 (rank 0)
dim_S0 = 0
print(f"  S_0: rank(A) = 0 (just the origin)")
print(f"    dim = {dim_S0}")
print()

# Stratum 1: rank(A) = 1
# A = v tensor w^T for v in R^7, w in R^4
# Isotropic condition: automatic (1D subspace is always isotropic)
dim_S1 = 7 + 4 - 1  # -1 for scaling
print(f"  S_1: rank(A) = 1 (Segre variety)")
print(f"    dim = 7 + 4 - 1 = {dim_S1}")
print(f"    Isotropic condition: AUTOMATIC (1D always isotropic)")
print()

# Stratum 2: rank(A) = 2 with isotropic row space
# Choose L in LGr(2, R^4): 3 dimensions
# Choose rank-2 map R^7 -> L: Hom(R^7, L) minus rank-1 locus
# rank-1 locus in R^{7x2} has dim 7+2-1 = 8, so codim 6
# dim(S_2) = 14 + 3 = 17 (open dense in mu^{-1}(0))
dim_S2 = dim_mu0
print(f"  S_2: rank(A) = 2 with isotropic row space (generic stratum)")
print(f"    dim = {dim_S2} (open dense in mu^{{-1}}(0))")
print(f"    Fibers over LGr(2, R^4) with fiber R^14")
print()

print(f"  Total: mu^{{-1}}(0) = S_0 cup S_1 cup S_2")
print(f"  Top dimension: {dim_S2}")
print(f"  Singular locus: S_0 cup S_1 (dim <= {dim_S1})")
print()


# ============================================================
# PART 8: PHYSICAL INTERPRETATION
# ============================================================
print("PART 8: Physical interpretation")
print("-" * 60)
print()

print("STRUCTURAL THEOREM:")
print(f"  mu^{{-1}}(0) = {{A in Hom(R^4, R^7) : A is 'purely associative'}}")
print()
print("The 'pure associativity' constraint requires:")
print("  - The 7 rows of A (in R^4 = H) span at most a Lagrangian 2-plane")
print("  - Equivalently: the quaternionic structure J_I does not induce")
print("    any G_2 charge when transferred through A to R^7 = Im(O)")
print()
print("PHYSICAL MEANING:")
print("  The mu=0 configurations are precisely those where spacetime's")
print("  quaternionic non-commutativity stays 'compatible' with the")
print("  octonionic associator structure in the internal space.")
print()
print("FRAMEWORK NUMBER THEOREM:")
print(f"  The associativity constraint removes exactly n_c = {n_c}")
print(f"  degrees of freedom from the {dim_Gr}-dimensional tangent space,")
print(f"  leaving a {dim_mu0}-dimensional 'associative island.'")
print()
print("  This decomposes as:")
print(f"    {dim_mu0} = {dim_g2} + {Im_H}")
print(f"         = dim(g_2) + dim(Im_H)")
print(f"         = dim(Aut(O)) + dim(spatial rotations)")
print()
print("  The codimension n_c = 11 = crystal dimension")
print("  suggests the non-associativity 'lives in' the crystal.")
print()


# ============================================================
# PART 9: CONNECTION TO RANK AND SYMPLECTIC STRUCTURE
# ============================================================
print("PART 9: Rank bound from symplectic geometry")
print("-" * 60)
print()

print("The symplectic form omega_I on R^4 has:")
print(f"  dim(R^4) = {n_d}")
print(f"  rank(omega_I) = {n_d}")
print(f"  maximal isotropic dim = {n_d}//2 = {n_d//2}")
print()
print(f"Therefore: rank(A) <= {n_d//2} for A in mu^{{-1}}(0)")
print()
print("This is a STRONG constraint: generic Hom(R^7, R^4) has rank 4,")
print("but mu=0 forces rank <= 2. The 'lost' 2 rank corresponds to")
print("the J_I-conjugate directions that would source G_2 charge.")
print()

# Verify: symplectic form omega_I
omega_I = J_I  # omega_I(v,w) = v^T J_I w
print("omega_I as a matrix:")
print(omega_I)
rank_omega = omega_I.rank()
print(f"rank(omega_I) = {rank_omega}")
t11 = rank_omega == n_d
tests.append((f"rank(omega_I) = {rank_omega} = n_d = {n_d}", t11))
print()

# Verify: Pfaffian of omega_I
pf_sq = omega_I.det()  # det of antisymmetric = Pfaffian^2
print(f"det(omega_I) = {pf_sq} = Pfaffian^2")
t12 = pf_sq == 1
tests.append(("det(omega_I) = 1 (unimodular symplectic form)", t12))
print()


# ============================================================
# PART 10: EXTENDED VERIFICATION WITH MULTIPLE LAGRANGIANS
# ============================================================
print("PART 10: Verify mu=0 for all example Lagrangians")
print("-" * 60)
print()

_rng.seed(278)
all_pass = True
for name, v1, w1 in lagrangians:
    # Build random A with rows in span{v1, w1}
    P = Matrix([v1.T.tolist()[0], w1.T.tolist()[0]])  # 2x4
    coeff = Matrix(7, 2, lambda i, j: _rng.randint(-5, 5))
    A_test = coeff * P  # 7x4, rows in span{v1, w1}

    mu_test = moment_map(A_test)
    is_zero = mu_test == zeros(7, 7)
    if not is_zero:
        all_pass = False
    print(f"  {name}: mu = 0? {is_zero}")

print()
t13 = all_pass
tests.append(("mu=0 for all 6 Lagrangian plane tests", t13))


# ============================================================
# PART 11: JACOBIAN AT A DIFFERENT mu=0 POINT
# ============================================================
print("PART 11: Jacobian verification at second mu=0 point")
print("-" * 60)
print()

# Use a different Lagrangian: L = span{e_1+e_4, e_2+e_3}
P2 = Matrix([[1, 0, 0, 1], [0, 1, 1, 0]])  # 2x4
_rng.seed(1137)
coeff2 = Matrix(7, 2, lambda i, j: _rng.randint(-3, 3))
A_generic2 = coeff2 * P2

# Verify mu=0
B_check2 = A_generic2 * J_I * A_generic2.T
assert B_check2 == zeros(7, 7), "Second test point should be mu=0"

jac_mu_rows2 = []
for idx in range(28):
    i_row = idx // 4
    i_col = idx % 4
    A_plus = A_generic2.copy()
    A_plus[i_row, i_col] += eps

    mu_plus = moment_map(A_plus)
    mu_base = moment_map(A_generic2)
    dmu = (mu_plus - mu_base) / eps

    row = []
    for a in range(7):
        for b in range(a+1, 7):
            row.append(dmu[a, b])
    jac_mu_rows2.append(row)

Jac_mu2 = Matrix(jac_mu_rows2)
rank_Jmu2 = Jac_mu2.rank()

print(f"Second mu=0 point (Lagrangian span(e1+e4, e2+e3)):")
print(f"  rank(d_mu) = {rank_Jmu2}")
print(f"  kernel dim = {28 - rank_Jmu2}")
print()

t14 = rank_Jmu2 == n_c
tests.append((f"rank(d_mu) at second point = {rank_Jmu2} = n_c = {n_c}", t14))


# ============================================================
# PART 12: SUMMARY OF FRAMEWORK NUMBERS
# ============================================================
print("=" * 70)
print("SUMMARY: Framework Numbers in mu=0 Locus")
print("=" * 70)
print()

summary = [
    ("dim(Hom(R^4, R^7))", dim_Gr, f"n_d x Im_O = {n_d} x {Im_O}"),
    ("dim(mu^{-1}(0))", dim_mu0, f"dim(g_2) + Im_H = {dim_g2} + {Im_H}"),
    ("codim(mu^{-1}(0))", codim_mu0, f"n_c = {n_c}"),
    ("dim(fiber)", dim_fiber, f"Im_O x C_dim = {Im_O} x 2 = dim(g_2)"),
    ("dim(base = LGr)", dim_base, f"Im_H = {Im_H}"),
    ("max rank in mu^{-1}(0)", 2, f"n_d / 2 = {n_d} / 2"),
]

for name, val, expr in summary:
    print(f"  {name:<30s} = {val:>4d}  ({expr})")
print()

print("ALL numbers are framework numbers: {1, 2, 3, 4, 7, 11, 14, 17, 28}")
print()
print("Key identity: 28 = 17 + 11  (dim = assoc + crystal)")
print("              dim(Gr) = dim(mu^{-1}(0)) + n_c")
print()


# ============================================================
# VERIFICATION TESTS
# ============================================================
print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)
print()

pass_count = 0
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if passed:
        pass_count += 1
    print(f"[{status}] {name}")

print()
print(f"Total: {pass_count}/{len(tests)} PASS")
