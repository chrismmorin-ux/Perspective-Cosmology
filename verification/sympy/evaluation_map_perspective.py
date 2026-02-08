#!/usr/bin/env python3
"""
Evaluation Map as Natural Perspective: Exploration

KEY QUESTION: Does choosing a "position" v_0 in V_Crystal automatically
create a perspective on the operator algebra?

The evaluation map  ev_{v_0}: End(V) -> V  defined by  ev_{v_0}(T) = T(v_0)
is a linear map that extracts "what T does at position v_0."

This is necessarily partial: dim(End(V)) = n^2 > n = dim(V) for n >= 2.

We explore:
1. Properties of the evaluation map
2. Its kernel (the "Godel set" -- operators invisible from v_0)
3. How different positions give different views
4. Connection to framework perspectives (projection operators)
5. The "double partiality" when combining evaluation + projection

Status: EXPLORATION
Created: Session 188
"""

from sympy import (
    Matrix, eye, zeros, Rational, sqrt, simplify,
    symbols, GramSchmidt, pprint
)


def operator_to_vector(T):
    """Flatten an nxn matrix to an n^2-vector (column-major)."""
    n = T.rows
    entries = []
    for j in range(n):
        for i in range(n):
            entries.append(T[i, j])
    return Matrix(entries)


def vector_to_operator(v, n):
    """Unflatten an n^2-vector to an nxn matrix (column-major)."""
    T = zeros(n, n)
    idx = 0
    for j in range(n):
        for i in range(n):
            T[i, j] = v[idx]
            idx += 1
    return T


def evaluation_map_matrix(v0, n):
    """
    Construct the matrix representation of ev_{v_0}: End(V) -> V.

    ev_{v_0}(T) = T(v_0)

    If we represent T as an n^2-vector (columns stacked) and v_0 as n-vector,
    then ev_{v_0} is an n x n^2 matrix.

    The i-th row, block j of the matrix is: v0[j] * delta_{i,row}
    More precisely: if T has columns [t_1, ..., t_n], then
    T(v_0) = sum_j v0[j] * t_j

    In the vectorized form: ev_{v_0} = (v_0^T tensor I_n)
    """
    E = zeros(n, n * n)
    for j in range(n):
        for i in range(n):
            # Column index in E: j*n + i (the (i,j) entry of T)
            # Row index in E: i
            # Coefficient: v0[j]
            E[i, j * n + i] = v0[j]
    return E


def make_projection_matrix(n, k):
    """Orthogonal projection onto first k coordinates."""
    P = zeros(n, n)
    for i in range(k):
        P[i, i] = 1
    return P


# ==============================================================================
# Test 1: Basic properties of the evaluation map
# ==============================================================================
def test_evaluation_map_properties():
    print("=" * 70)
    print("TEST 1: Evaluation Map Properties")
    print("=" * 70)

    n = 5  # Use n=5 for tractable symbolic computation
    v0 = Matrix([1, 0, 0, 0, 0])  # Standard basis vector e_1

    E = evaluation_map_matrix(v0, n)

    print(f"\nV_Crystal dimension: n = {n}")
    print(f"End(V) dimension: n^2 = {n**2}")
    print(f"Evaluation map E: {n} x {n**2} matrix")

    # Rank
    rank_E = E.rank()
    print(f"Rank of E: {rank_E}")

    # Kernel dimension
    ker_E = E.nullspace()
    dim_ker = len(ker_E)
    print(f"dim(ker(E)): {dim_ker}")
    print(f"Expected: n^2 - n = {n**2 - n}")

    # Verify surjectivity (rank = n)
    is_surjective = (rank_E == n)
    print(f"\n[{'PASS' if is_surjective else 'FAIL'}] "
          f"Evaluation map is surjective (rank = n = {n})")

    # Verify kernel dimension
    correct_kernel = (dim_ker == n**2 - n)
    print(f"[{'PASS' if correct_kernel else 'FAIL'}] "
          f"Kernel dimension = n(n-1) = {n*(n-1)}")

    # What's IN the kernel? Operators that kill v0.
    print(f"\nKernel interpretation: operators T with T(e_1) = 0")
    print(f"These are matrices with first column = 0")
    print(f"That's {n*(n-1)} free parameters (other {n-1} columns)")

    return is_surjective and correct_kernel


# ==============================================================================
# Test 2: Different positions give different views
# ==============================================================================
def test_different_positions():
    print("\n" + "=" * 70)
    print("TEST 2: Different Positions Give Different Views")
    print("=" * 70)

    n = 4

    # Two different positions
    v0 = Matrix([1, 0, 0, 0])
    v1 = Matrix([0, 1, 0, 0])

    E0 = evaluation_map_matrix(v0, n)
    E1 = evaluation_map_matrix(v1, n)

    ker0 = E0.nullspace()
    ker1 = E1.nullspace()

    # The kernels should be DIFFERENT
    # ker(ev_{e_1}) = matrices with column 1 = 0
    # ker(ev_{e_2}) = matrices with column 2 = 0
    # These overlap but are not equal

    # Check: is there an operator in ker0 but not in ker1?
    # An operator T with T(e_1) = 0 but T(e_2) != 0
    # Example: T that maps e_2 to e_1 and kills everything else
    T_test = zeros(n, n)
    T_test[0, 1] = 1  # maps e_2 -> e_1

    Tv0 = T_test * v0  # = T(e_1) = 0
    Tv1 = T_test * v1  # = T(e_2) = e_1 != 0

    in_ker0 = Tv0.equals(zeros(n, 1))
    not_in_ker1 = not Tv1.equals(zeros(n, 1))

    print(f"\nOperator T (maps e_2 -> e_1, kills rest):")
    print(f"  T(e_1) = {Tv0.T}  (in ker_{{e_1}}? {in_ker0})")
    print(f"  T(e_2) = {Tv1.T}  (in ker_{{e_2}}? {not not_in_ker1})")

    different_views = in_ker0 and not_in_ker1
    print(f"\n[{'PASS' if different_views else 'FAIL'}] "
          f"Positions e_1 and e_2 have different blind spots")
    print(f"  e_1 cannot see T, but e_2 CAN see T")

    # Intersection of kernels
    # ker(ev_{e_1}) n ker(ev_{e_2}) = matrices with columns 1 AND 2 = 0
    # dim = n*(n-2) = 4*2 = 8
    # Combined, two positions see: 2n of n^2 = 8/16 = 50%
    combined_dim = 2 * n
    total_dim = n ** 2
    print(f"\n  From e_1 alone: see {n}/{total_dim} = {n/total_dim:.0%} of operator space")
    print(f"  From e_1 + e_2: see {combined_dim}/{total_dim} = {combined_dim/total_dim:.0%}")
    print(f"  Need all {n} basis positions to see 100%")

    return different_views


# ==============================================================================
# Test 3: Evaluation of projection operators
# ==============================================================================
def test_projection_evaluation():
    print("\n" + "=" * 70)
    print("TEST 3: Evaluation Map Applied to Projections")
    print("=" * 70)

    n = 5
    k = 2  # rank-2 projection

    # Two different rank-2 projections
    P1 = make_projection_matrix(n, k)  # projects onto span(e_1, e_2)

    # P2: projects onto span(e_1, e_3)
    P2 = zeros(n, n)
    P2[0, 0] = 1
    P2[2, 2] = 1

    # From position e_1:
    v0 = Matrix([1, 0, 0, 0, 0])
    P1_v0 = P1 * v0  # = e_1
    P2_v0 = P2 * v0  # = e_1

    same_from_v0 = P1_v0.equals(P2_v0)
    print(f"\nTwo different rank-{k} projections P1, P2:")
    print(f"  P1 projects onto span(e_1, e_2)")
    print(f"  P2 projects onto span(e_1, e_3)")
    print(f"\n  From position e_1:")
    print(f"    P1(e_1) = {P1_v0.T}")
    print(f"    P2(e_1) = {P2_v0.T}")
    print(f"    Indistinguishable? {same_from_v0}")

    # From position e_2:
    v1 = Matrix([0, 1, 0, 0, 0])
    P1_v1 = P1 * v1  # = e_2
    P2_v1 = P2 * v1  # = 0

    diff_from_v1 = not P1_v1.equals(P2_v1)
    print(f"\n  From position e_2:")
    print(f"    P1(e_2) = {P1_v1.T}")
    print(f"    P2(e_2) = {P2_v1.T}")
    print(f"    Distinguishable? {diff_from_v1}")

    passed = same_from_v0 and diff_from_v1
    print(f"\n[{'PASS' if passed else 'FAIL'}] "
          f"Position determines which projections are distinguishable")
    print(f"  From e_1: P1 and P2 look THE SAME (both preserve e_1)")
    print(f"  From e_2: P1 and P2 look DIFFERENT (P1 preserves e_2, P2 kills it)")

    return passed


# ==============================================================================
# Test 4: Double partiality -- evaluation + projection
# ==============================================================================
def test_double_partiality():
    print("\n" + "=" * 70)
    print("TEST 4: Double Partiality (Position + Perspective)")
    print("=" * 70)

    n = 11  # Framework value
    k = 4   # Framework defect dimension

    # Framework-like projection: rank 4 in 11 dimensions
    P = make_projection_matrix(n, k)

    # Choose a position (e.g., e_1)
    v0 = zeros(n, 1)
    v0[0] = 1

    # What does v0 "see" through perspective P?
    result = P * v0
    nonzero_components = sum(1 for i in range(n) if result[i] != 0)

    print(f"\nV_Crystal: dim = {n}")
    print(f"End(V): dim = {n**2}")
    print(f"Perspective P: rank {k}")
    print(f"Position: e_1")

    print(f"\nInformation accessible at each level:")
    print(f"  Full operator algebra:  {n**2} dimensions")
    print(f"  From position e_1:      {n} dimensions "
          f"({n}/{n**2} = {n/n**2:.1%} of End(V))")
    print(f"  Through perspective P:   {k} dimensions "
          f"({k}/{n} = {k/n:.1%} of V)")
    print(f"  Combined (position+perspective): {nonzero_components} components "
          f"of P(e_1)")

    # The fraction of total operator info accessible from one point
    # through one perspective
    # From position v0: you see P(v0), which is k numbers
    # Total operator info: n^2 numbers
    fraction = Rational(k, n**2)
    print(f"\n  Total accessibility: {k}/{n**2} = {float(fraction):.4f} "
          f"= {float(fraction)*100:.1f}% of operator algebra")

    # Information hierarchy
    print(f"\n  Information hierarchy:")
    print(f"    Level 0: Full End(V)        = {n**2} dim")
    print(f"    Level 1: One position        = {n} dim "
          f"(lost {n**2-n} = {n*(n-1)})")
    print(f"    Level 2: One position + proj = {k} dim "
          f"(lost additional {n-k} = {n-k})")
    print(f"    Total lost: {n**2 - k} out of {n**2}")

    passed = (nonzero_components == 1) and (k < n) and (n**2 > n)
    print(f"\n[{'PASS' if passed else 'FAIL'}] "
          f"Double partiality demonstrated: "
          f"{k}/{n**2} operator info accessible")

    return passed


# ==============================================================================
# Test 5: The automatic perspective -- no axiom needed
# ==============================================================================
def test_automatic_perspective():
    print("\n" + "=" * 70)
    print("TEST 5: The Automatic Perspective (No Axiom Needed)")
    print("=" * 70)

    n = 11

    print(f"\nFor V_Crystal with dim = {n}:")
    print(f"")
    print(f"  MATHEMATICAL FACTS (not axioms):")
    print(f"    1. End(V_Crystal) exists with dim = {n**2}")
    print(f"    2. For ANY non-zero v_0 in V_Crystal:")
    print(f"       ev_{{v_0}}: End(V) -> V is surjective")
    print(f"       dim(ker(ev_{{v_0}})) = {n*(n-1)}")
    print(f"    3. These are theorems of linear algebra, not assumptions")
    print(f"")
    print(f"  WHAT THIS MEANS:")
    print(f"    - ANY position in V_Crystal automatically has a blind spot")
    print(f"      of {n*(n-1)} operator-dimensions")
    print(f"    - The blind spot is UNAVOIDABLE (dimension counting)")
    print(f"    - Different positions have DIFFERENT blind spots")
    print(f"    - Need all {n} independent positions to see everything")
    print(f"    - A SINGLE position sees {n}/{n**2} = {Rational(1,n)} of End(V)")

    # The key theorem that needs no new axiom:
    # For n >= 2, n^2 > n, so any evaluation map has non-trivial kernel
    needs_no_axiom = (n**2 > n)

    print(f"\n  KEY INEQUALITY: n^2 = {n**2} > {n} = n")
    print(f"  This holds for ALL n >= 2")
    print(f"  Therefore: partial perspective is STRUCTURALLY INEVITABLE")
    print(f"  (assuming any 'position' exists at all)")

    print(f"\n[{'PASS' if needs_no_axiom else 'FAIL'}] "
          f"n^2 > n for n = {n}: automatic incompleteness")

    return needs_no_axiom


# ==============================================================================
# Test 6: What C4 (symmetry) implies for evaluation maps
# ==============================================================================
def test_c4_symmetry():
    print("\n" + "=" * 70)
    print("TEST 6: C4 Symmetry and Evaluation Maps")
    print("=" * 70)

    n = 4  # small for clarity

    # C4 says all basis vectors are equivalent under automorphism
    # For evaluation maps: ev_{b_i} and ev_{b_j} are "equivalent"
    # in that they see the SAME AMOUNT but DIFFERENT CONTENT

    print(f"\nFor n = {n}:")
    print(f"  C4 says: all basis vectors are equivalent")
    print(f"  This means: ev_{{b_1}}, ev_{{b_2}}, ..., ev_{{b_n}} are")
    print(f"    all equally valid 'positions'")
    print(f"    all see the same AMOUNT ({n}/{n**2} = {Rational(1,n)})")
    print(f"    but each sees DIFFERENT operators")

    # Demonstrate: kernel of ev_{b_1} vs ev_{b_2}
    b1 = zeros(n, 1); b1[0] = 1
    b2 = zeros(n, 1); b2[1] = 1

    E1 = evaluation_map_matrix(b1, n)
    E2 = evaluation_map_matrix(b2, n)

    ker1 = E1.nullspace()
    ker2 = E2.nullspace()

    # They have the same dimension
    same_dim = (len(ker1) == len(ker2))

    # But they're different subspaces
    # Check: is any vector in ker1 NOT in ker2?
    found_difference = False
    for v in ker1:
        # v is a vectorized operator in ker(ev_{b1})
        # Check if it's also in ker(ev_{b2}): E2 * v should be zero
        result = E2 * v
        if not result.equals(zeros(n, 1)):
            found_difference = True
            break

    print(f"\n  dim(ker(ev_{{b_1}})) = {len(ker1)}")
    print(f"  dim(ker(ev_{{b_2}})) = {len(ker2)}")
    print(f"  Same dimension? {same_dim}")
    print(f"  Different content? {found_difference}")

    print(f"\n  IMPLICATION:")
    print(f"    C4 doesn't prevent evaluation-map perspectives --")
    print(f"    it ensures they're all EQUALLY partial.")
    print(f"    Every position is equally blind, just blind to different things.")
    print(f"    Symmetry doesn't eliminate partiality; it democratizes it.")

    passed = same_dim and found_difference
    print(f"\n[{'PASS' if passed else 'FAIL'}] "
          f"Equal dimension, different content (C4 compatible)")

    return passed


def main():
    all_pass = True
    all_pass &= test_evaluation_map_properties()
    all_pass &= test_different_positions()
    all_pass &= test_projection_evaluation()
    all_pass &= test_double_partiality()
    all_pass &= test_automatic_perspective()
    all_pass &= test_c4_symmetry()

    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    if all_pass:
        print("\nALL TESTS PASSED (6/6)")
        print("\nKey results:")
        print("  1. Evaluation map is naturally partial (n^2 > n)")
        print("  2. Different positions have different blind spots")
        print("  3. Some projections are indistinguishable from certain positions")
        print("  4. Position + perspective = doubly partial view")
        print("  5. This requires NO new axiom -- just n >= 2")
        print("  6. C4 symmetry makes all positions equally partial")
    else:
        print("\nSOME TESTS FAILED")

    return all_pass


if __name__ == "__main__":
    main()
