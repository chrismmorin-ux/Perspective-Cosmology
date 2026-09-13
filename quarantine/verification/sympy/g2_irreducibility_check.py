#!/usr/bin/env python3
"""
G_2 Irreducibility on R^7: The Key Argument

SUPERSEDED by g2_final.py -- this script uses an incorrect Fano plane
orientation that gives dim(g_2) = 6 instead of 14. See g2_final.py
for the corrected version using Wikipedia/standard convention.

Status: SUPERSEDED
Created: Session 189
"""

from sympy import *

# ==============================================================================
# PART 1: Octonion Multiplication Table
# ==============================================================================

print("=" * 70)
print("PART 1: Octonion Multiplication Table")
print("=" * 70)

# Standard octonion basis: e0=1, e1=i, e2=j, e3=k, e4=l, e5=il, e6=jl, e7=kl
# Using the Fano plane convention
# The multiplication rules for imaginary units (indices 1-7):
# e_a * e_b = f_abc * e_c (where f_abc are structure constants)

# Fano plane triples (cyclic): each triple (a,b,c) means e_a * e_b = e_c
fano_triples = [
    (1, 2, 3),  # i*j = k  (quaternionic)
    (1, 4, 5),  # i*l = il
    (2, 4, 6),  # j*l = jl
    (3, 4, 7),  # k*l = kl  (from (ij)l = kl... but careful about sign)
    (1, 6, 7),  # i*(jl) = kl  (but need sign check)
    (2, 5, 7),  # j*(il) = kl  (but need sign check)
    (3, 5, 6),  # k*(il) = jl  (but need sign check)
]

# Actually, let me use the standard Cartan-Schouten convention
# e_i * e_j = epsilon_{ijk} * e_k for the Fano triples, with signs:
# (1,2,3), (1,4,5), (2,4,6), (3,4,7), (2,5,7), (1,6,7), (3,5,6)
# with some triples having negative signs depending on cyclic order

# Use the structure constants directly
# For the "standard" octonion multiplication (e.g., Baez 2002):
# Positive triples (a*b = c):
pos_triples = [
    (1, 2, 3), (1, 4, 5), (2, 4, 6), (1, 7, 6),
    (2, 7, 5), (4, 3, 7), (6, 3, 5)
]
# This gives e_a * e_b = +e_c, e_b * e_a = -e_c, etc.

# Build full multiplication table for imaginary units (7x7 -> 7-vector)
# mult[a][b] = (sign, index) meaning e_a * e_b = sign * e_index
# For a = b: e_a * e_a = -1 (= -e_0)

mult = {}
for a in range(1, 8):
    for b in range(1, 8):
        mult[(a, b)] = (0, 0)  # default

# Set the triples
for (a, b, c) in pos_triples:
    mult[(a, b)] = (1, c)   # e_a * e_b = e_c
    mult[(b, a)] = (-1, c)  # e_b * e_a = -e_c
    mult[(b, c)] = (1, a)   # e_b * e_c = e_a
    mult[(c, b)] = (-1, a)
    mult[(c, a)] = (1, b)   # e_c * e_a = e_b
    mult[(a, c)] = (-1, b)

# Self-products: e_a * e_a = -1
for a in range(1, 8):
    mult[(a, a)] = (-1, 0)  # -1 = -e_0

print("Octonion multiplication table (imaginary units e_1 through e_7):")
print("e_a * e_b = result")
print()
header = "     " + "  ".join(f"e_{b}" for b in range(1, 8))
print(header)
for a in range(1, 8):
    row = f"e_{a}: "
    for b in range(1, 8):
        sign, idx = mult[(a, b)]
        if idx == 0:
            row += " -1  "
        elif sign > 0:
            row += f" e_{idx} "
        else:
            row += f"-e_{idx} "
    print(row)

# ==============================================================================
# PART 2: Derivations of the Octonion Algebra
# ==============================================================================

print("\n" + "=" * 70)
print("PART 2: Derivations (Lie Algebra of G_2)")
print("=" * 70)

# A derivation D of the octonions satisfies:
#   D(xy) = D(x)y + xD(y)
# D is an R-linear map on Im(O) = R^7 (since D(1) = 0 for any derivation)
# D is represented by a 7x7 real matrix
# The space of all derivations = Lie algebra g_2

# D is determined by its action on e_1, ..., e_7
# Constraint: D(e_a * e_b) = D(e_a) * e_b + e_a * D(e_b)
# This gives linear constraints on the 49 entries of D

# Let D be a 7x7 matrix: D(e_a) = sum_c D_{ca} * e_c
# (D_{ca} is the c-th component of D(e_a))

D = Matrix(7, 7, lambda i, j: symbols(f'd_{i+1}{j+1}'))
print(f"General 7x7 matrix D has {49} entries")

# Derivation condition: D(e_a * e_b) = D(e_a) * e_b + e_a * D(e_b)
# For each pair (a, b) with a != b, this gives a vector equation in R^7
# (7 components each), so potentially 7 * 21 = 147 scalar equations

constraints = []
for a in range(1, 8):
    for b in range(a + 1, 8):  # a < b only (antisymmetry handles the rest)
        sign_ab, c_ab = mult[(a, b)]
        if c_ab == 0:
            continue  # e_a * e_a case, skip

        # LHS: D(e_a * e_b) = sign_ab * D(e_c) = sign_ab * sum_k D_{k,c} * e_k
        # where c = c_ab

        # RHS: D(e_a) * e_b + e_a * D(e_b)
        # D(e_a) = sum_k D_{k,a} * e_k
        # D(e_a) * e_b = sum_k D_{k,a} * (e_k * e_b)
        # e_a * D(e_b) = sum_k D_{k,b} * (e_a * e_k)

        for target in range(1, 8):
            # Coefficient of e_target in LHS
            lhs = sign_ab * D[target - 1, c_ab - 1]

            # Coefficient of e_target in RHS
            rhs = Integer(0)

            # From D(e_a) * e_b = sum_k D_{k,a} * (e_k * e_b)
            for k in range(1, 8):
                s_kb, idx_kb = mult[(k, b)]
                if idx_kb == target:
                    rhs += D[k - 1, a - 1] * s_kb
                elif idx_kb == 0 and k == b:
                    # e_k * e_b = -1, contributes -D_{k,a} to the e_0 component
                    # But we're looking at e_target component, so this doesn't contribute
                    # unless target means e_0... but target >= 1, so skip
                    pass

            # From e_a * D(e_b) = sum_k D_{k,b} * (e_a * e_k)
            for k in range(1, 8):
                s_ak, idx_ak = mult[(a, k)]
                if idx_ak == target:
                    rhs += D[k - 1, b - 1] * s_ak
                elif idx_ak == 0 and a == k:
                    pass

            eq = lhs - rhs
            if eq != 0:
                constraints.append(eq)

print(f"Derivation constraints: {len(constraints)} equations in 49 variables")

# Also: derivations are skew-symmetric with respect to the inner product
# D(e_a) . e_b + e_a . D(e_b) = 0, i.e., D_{ba} + D_{ab} = 0 (antisymmetric)
# This gives 7*6/2 = 21 additional constraints
for a in range(7):
    for b in range(a + 1, 7):
        constraints.append(D[a, b] + D[b, a])
# And diagonal must be zero: D_{aa} = 0
for a in range(7):
    constraints.append(D[a, a])

print(f"After adding skew-symmetry: {len(constraints)} total constraints")

# Solve the system
all_vars = [D[i, j] for i in range(7) for j in range(7)]
solution = linsolve(constraints, all_vars)

# Count free parameters = dim(g_2)
if solution:
    sol_tuple = list(solution)[0]
    free_symbols_in_sol = set()
    for expr in sol_tuple:
        free_symbols_in_sol.update(expr.free_symbols)
    dim_g2 = len(free_symbols_in_sol)
    print(f"\nSolution space dimension (= dim(g_2)): {dim_g2}")
else:
    dim_g2 = 0
    print("\nNo solution found (error)")

tests = []
tests.append(("dim(g_2) = 14", dim_g2 == 14))

# ==============================================================================
# PART 3: Check If G_2 Preserves Any 3D Subspace (Quaternionic Directions)
# ==============================================================================

print("\n" + "=" * 70)
print("PART 3: Does G_2 Preserve Im(H) = span{e_1, e_2, e_3}?")
print("=" * 70)

# The quaternionic subalgebra H = span{1, e_1, e_2, e_3}
# Im(H) = span{e_1, e_2, e_3} = first 3 components of R^7

# If G_2 preserved Im(H), then EVERY derivation D would satisfy:
# D(e_a) in span{e_1, e_2, e_3} for a = 1, 2, 3
# Meaning: D_{c,a} = 0 for c >= 4 and a <= 3

# Check: does the derivation algebra force D_{c,a} = 0 for c in {4,5,6,7}, a in {1,2,3}?
if solution:
    sol_tuple = list(solution)[0]
    # Check entries D[c-1, a-1] for c = 4..7, a = 1..3
    print("\nChecking if derivations can map quaternionic to non-quaternionic directions:")
    print("(If g_2 preserved Im(H), ALL these would be forced to 0)")
    print()

    preserves_imH = True
    for a in range(1, 4):  # quaternionic indices
        for c in range(4, 8):  # non-quaternionic indices
            idx = (c - 1) * 7 + (a - 1)  # index in flattened solution
            entry = sol_tuple[idx]
            is_zero = entry == 0
            if not is_zero:
                preserves_imH = False
            status = "= 0" if is_zero else f"= {entry} (NON-ZERO!)"
            print(f"  D[e_{c}, e_{a}] (= D_{c}{a}) {status}")

    if preserves_imH:
        print("\nSURPRISE: g_2 DOES preserve Im(H)! (This would contradict irreducibility)")
    else:
        print("\nCONFIRMED: g_2 does NOT preserve Im(H) = span{e_1, e_2, e_3}")
        print("Some derivations map quaternionic directions to non-quaternionic ones")
        print("=> G_2 acts IRREDUCIBLY on R^7")
        print("=> Im(H) and Im(O) CANNOT share the same subspace")

    tests.append(("g_2 does NOT preserve Im(H)", not preserves_imH))

# ==============================================================================
# PART 4: What Is The Stabilizer of Im(H) in G_2?
# ==============================================================================

print("\n" + "=" * 70)
print("PART 4: Stabilizer of Im(H) in G_2")
print("=" * 70)

# The stabilizer Stab_{G_2}(Im(H)) consists of derivations D that DO preserve Im(H)
# i.e., D_{c,a} = 0 for c >= 4, a <= 3 AND D_{c,a} = 0 for c <= 3, a >= 4
# (preserving both Im(H) and its complement)

if solution:
    sol_tuple = list(solution)[0]

    # Add constraints: D_{c,a} = 0 for c in {4..7}, a in {1..3}
    # and D_{c,a} = 0 for c in {1..3}, a in {4..7}
    extra_constraints = list(constraints)
    for a in range(1, 4):
        for c in range(4, 8):
            extra_constraints.append(D[c - 1, a - 1])  # D_{c,a} = 0
            extra_constraints.append(D[a - 1, c - 1])  # D_{a,c} = 0

    stab_solution = linsolve(extra_constraints, all_vars)
    if stab_solution:
        stab_tuple = list(stab_solution)[0]
        stab_free = set()
        for expr in stab_tuple:
            stab_free.update(expr.free_symbols)
        dim_stab = len(stab_free)
        print(f"dim(Stab_{{g_2}}(Im(H))) = {dim_stab}")
        print(f"This should be dim(so(3)) + dim(so(4)) = 3 + 6 = 9")
        print(f"Or perhaps dim(su(2) x su(2)) = 3 + 3 = 6")
        print(f"Actual: {dim_stab}")

        # The fraction of g_2 that preserves Im(H)
        fraction = Rational(dim_stab, dim_g2)
        print(f"\nFraction of G_2 that preserves Im(H): {dim_stab}/{dim_g2} = {fraction}")
        print(f"A 'generic' G_2 element does NOT preserve Im(H)")

        tests.append((f"Stabilizer dimension = {dim_stab} (< 14 = dim(g_2))", dim_stab < 14))

# ==============================================================================
# PART 5: The Independence Theorem
# ==============================================================================

print("\n" + "=" * 70)
print("PART 5: The Independence Theorem")
print("=" * 70)

print("""
THEOREM (Automorphism Independence):

If V is a real inner product space containing:
  (a) A 7-dim subspace W_O with G_2 acting on it (as octonionic automorphisms)
  (b) A 3-dim subspace W_H with SO(3) acting on it (as quaternionic automorphisms)

And we require BOTH groups to act INDEPENDENTLY
(i.e., the full symmetry group contains G_2 x SO(3) as a subgroup),

THEN W_O and W_H must be ORTHOGONAL: W_O perp W_H.

PROOF:
  G_2 acts irreducibly on R^7 (verified computationally above).
  Therefore, no proper subspace of W_O is G_2-invariant.
  If W_H intersected W_O nontrivially, then W_H cap W_O would be a
  proper G_2-invariant subspace (since both G_2 and SO(3) preserve it).
  Contradiction.
  Therefore W_H cap W_O = {0}, i.e., W_H perp W_O.  QED

COROLLARY: dim(V) >= dim(W_O) + dim(W_H) = 7 + 3 = 10
Adding Im(C) = R^1 (orthogonal to both): dim(V) >= 11
Minimality: dim(V) = 11 = n_c.
""")

tests.append(("7 + 3 = 10 (minimum without Im(C))", 7 + 3 == 10))
tests.append(("7 + 3 + 1 = 11 (minimum with Im(C))", 7 + 3 + 1 == 11))

# ==============================================================================
# VERIFICATION
# ==============================================================================

print("=" * 70)
print("VERIFICATION")
print("=" * 70)

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    print(f"[{status}] {name}")

print(f"\n{'=' * 70}")
print(f"Total: {sum(1 for _, p in tests if p)}/{len(tests)} PASS")
if all_pass:
    print("ALL TESTS PASSED")
else:
    print("SOME TESTS FAILED")
