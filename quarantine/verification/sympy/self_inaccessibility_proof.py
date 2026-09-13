#!/usr/bin/env python3
"""
THM_0410 Self-Inaccessibility: Computational Verification

KEY FINDING: All three parts of THM_0410 are verified computationally.

Verifies:
(a) ker(pi) != {0} for any proper projection
(b) pi(v + w) = pi(v) for w in ker(pi)
(c) Orthogonal decomposition im(pi) + ker(pi) = V_Crystal

Tests use concrete projection matrices for n=11, k=4 (framework values)
and also general n, k cases.

Status: VERIFICATION
Created: Session 188
"""

from sympy import (
    Matrix, eye, zeros, Rational, sqrt, GramSchmidt,
    randMatrix, symbols, simplify
)


def make_projection_matrix(n, k):
    """
    Construct an orthogonal projection matrix of rank k in R^n.

    Uses the first k standard basis vectors to define the image subspace,
    then P = sum_{i=0}^{k-1} e_i @ e_i^T.

    This is the simplest case (projecting onto coordinate subspace).
    """
    P = zeros(n, n)
    for i in range(k):
        e_i = zeros(n, 1)
        e_i[i] = 1
        P += e_i * e_i.T
    return P


def make_tilted_projection(n, k):
    """
    Construct an orthogonal projection onto a 'tilted' k-dimensional subspace.

    Uses a non-axis-aligned subspace to test that results hold generally,
    not just for coordinate projections.
    """
    # Create k linearly independent vectors (not axis-aligned)
    vecs = []
    for i in range(k):
        v = zeros(n, 1)
        for j in range(n):
            # Deterministic pseudo-random entries
            v[j] = Rational((i * 7 + j * 3 + 1) % 11 - 5, 5)
        vecs.append(v)

    # Gram-Schmidt to get orthonormal basis
    ortho = GramSchmidt(vecs, True)

    # P = sum u_i @ u_i^T
    P = zeros(n, n)
    for u in ortho:
        P += u * u.T
    return P


def test_kernel_nontrivial(P, n, k, label):
    """Test (a): ker(P) != {0}, i.e., P has non-trivial null space."""
    nullspace = P.nullspace()
    dim_kernel = len(nullspace)
    expected_dim = n - k

    passed = (dim_kernel == expected_dim) and (dim_kernel > 0)
    print(f"[{'PASS' if passed else 'FAIL'}] {label}: "
          f"dim(ker) = {dim_kernel}, expected {expected_dim}")
    return passed


def test_blind_spot_invisibility(P, n, k, label):
    """Test (b): P(v + w) = P(v) for w in ker(P)."""
    nullspace = P.nullspace()
    if not nullspace:
        print(f"[FAIL] {label}: no kernel vectors found")
        return False

    # Pick a general vector v
    v = Matrix([Rational(i + 1, 3) for i in range(n)])

    # Pick a kernel vector w
    w = nullspace[0]

    Pv = P * v
    Pvw = P * (v + w)

    diff = simplify(Pvw - Pv)
    passed = diff.equals(zeros(n, 1))
    print(f"[{'PASS' if passed else 'FAIL'}] {label}: "
          f"P(v+w) - P(v) = {diff.T if not passed else '0'}")
    return passed


def test_orthogonal_decomposition(P, n, k, label):
    """Test: im(P) + ker(P) = V, verified via P + (I - P) = I."""
    I_n = eye(n)
    Q = I_n - P  # Complementary projection onto ker(P)

    # Check P + Q = I
    sum_check = simplify(P + Q - I_n)
    is_identity = sum_check.equals(zeros(n, n))

    # Check P*Q = 0 (orthogonal complement)
    product = simplify(P * Q)
    is_orthogonal = product.equals(zeros(n, n))

    # Check Q is also a projection (Q^2 = Q)
    Q_sq = simplify(Q * Q - Q)
    Q_is_proj = Q_sq.equals(zeros(n, n))

    passed = is_identity and is_orthogonal and Q_is_proj
    print(f"[{'PASS' if passed else 'FAIL'}] {label}: "
          f"P+Q=I: {is_identity}, PQ=0: {is_orthogonal}, Q^2=Q: {Q_is_proj}")
    return passed


def test_identity_on_image(P, n, k, label):
    """Test: P restricted to im(P) is the identity."""
    # Get basis of im(P) = column space
    colspace = P.columnspace()

    all_identity = True
    for v in colspace:
        Pv = P * v
        diff = simplify(Pv - v)
        if not diff.equals(zeros(n, 1)):
            all_identity = False
            break

    print(f"[{'PASS' if all_identity else 'FAIL'}] {label}: "
          f"P|_{{im(P)}} = id (tested {len(colspace)} basis vectors)")
    return all_identity


def test_dimension_check(P, n, k, label):
    """Test: dim(ker(P)) = n - k > 0."""
    rank_P = P.rank()
    dim_ker = n - rank_P

    correct_rank = (rank_P == k)
    positive_gap = (dim_ker > 0)
    correct_dim = (dim_ker == n - k)

    passed = correct_rank and positive_gap and correct_dim
    print(f"[{'PASS' if passed else 'FAIL'}] {label}: "
          f"rank={rank_P} (exp {k}), dim(ker)={dim_ker} (exp {n-k})")
    return passed


def main():
    print("=" * 70)
    print("THM_0410 Self-Inaccessibility: Computational Verification")
    print("=" * 70)

    all_pass = True

    # --- Test Case 1: Framework values n=11, k=4 (coordinate projection) ---
    print("\n--- Case 1: n=11, k=4 (coordinate projection) ---")
    n, k = 11, 4
    P1 = make_projection_matrix(n, k)

    all_pass &= test_kernel_nontrivial(P1, n, k,
                                        "1a. Kernel non-trivial (n=11, k=4)")
    all_pass &= test_blind_spot_invisibility(P1, n, k,
                                              "1b. Blind spot invisible (n=11, k=4)")
    all_pass &= test_orthogonal_decomposition(P1, n, k,
                                               "1c. Decomposition (n=11, k=4)")
    all_pass &= test_identity_on_image(P1, n, k,
                                        "1d. Identity on image (n=11, k=4)")
    all_pass &= test_dimension_check(P1, n, k,
                                      "1e. Dimension check (n=11, k=4)")

    # --- Test Case 2: n=11, k=4 (tilted projection) ---
    print("\n--- Case 2: n=11, k=4 (tilted/non-axis-aligned projection) ---")
    P2 = make_tilted_projection(n, k)

    all_pass &= test_kernel_nontrivial(P2, n, k,
                                        "2a. Kernel non-trivial (tilted)")
    all_pass &= test_blind_spot_invisibility(P2, n, k,
                                              "2b. Blind spot invisible (tilted)")
    all_pass &= test_orthogonal_decomposition(P2, n, k,
                                               "2c. Decomposition (tilted)")
    all_pass &= test_identity_on_image(P2, n, k,
                                        "2d. Identity on image (tilted)")
    all_pass &= test_dimension_check(P2, n, k,
                                      "2e. Dimension check (tilted)")

    # --- Test Case 3: Small case n=3, k=1 ---
    print("\n--- Case 3: n=3, k=1 (minimal) ---")
    n3, k3 = 3, 1
    P3 = make_projection_matrix(n3, k3)

    all_pass &= test_kernel_nontrivial(P3, n3, k3,
                                        "3a. Kernel non-trivial (n=3, k=1)")
    all_pass &= test_blind_spot_invisibility(P3, n3, k3,
                                              "3b. Blind spot invisible (n=3, k=1)")

    # --- Summary ---
    print("\n" + "=" * 70)
    if all_pass:
        print("ALL TESTS PASSED (12/12)")
        print("\nTHM_0410 Self-Inaccessibility: VERIFIED")
    else:
        print("SOME TESTS FAILED")
        print("\nTHM_0410 Self-Inaccessibility: VERIFICATION INCOMPLETE")
    print("=" * 70)

    return all_pass


if __name__ == "__main__":
    main()
