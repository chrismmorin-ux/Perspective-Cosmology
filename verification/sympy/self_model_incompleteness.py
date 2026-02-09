#!/usr/bin/env python3
"""
THM_04A7 Self-Model Incompleteness: Computational Verification

KEY FINDING: The self-model M_pi = id|_{V_pi} is strictly less informative
than pi. Two distinct vectors with the same projection are indistinguishable
from within V_pi.

Verifies:
(a) M_pi = identity on im(P)
(b) Two distinct vectors can have the same projection (information loss)
(c) dim(V_pi) < dim(V_Crystal) (quantified information loss)

Status: VERIFICATION
Created: Session 188
"""

from sympy import Matrix, eye, zeros, Rational, simplify, sqrt


def make_projection_matrix(n, k):
    """Orthogonal projection onto first k coordinate axes."""
    P = zeros(n, n)
    for i in range(k):
        e_i = zeros(n, 1)
        e_i[i] = 1
        P += e_i * e_i.T
    return P


def test_self_model_is_identity(P, n, k):
    """Test (a): P restricted to im(P) equals the identity on im(P)."""
    # Get basis of im(P)
    colspace = P.columnspace()

    all_ok = True
    for v in colspace:
        Pv = P * v
        diff = simplify(Pv - v)
        if not diff.equals(zeros(n, 1)):
            all_ok = False
            break

    print(f"[{'PASS' if all_ok else 'FAIL'}] "
          f"M_pi = id on V_pi (n={n}, k={k}, tested {len(colspace)} vectors)")
    return all_ok


def test_indistinguishable_vectors(P, n, k):
    """Test (b): Two distinct vectors with the same projection."""
    # v1 is a general vector
    v1 = Matrix([Rational(i + 1, 3) for i in range(n)])

    # w is a kernel vector (in the last n-k coordinates for coord projection)
    w = zeros(n, 1)
    w[k] = 1  # non-zero in a kernel direction

    # v2 = v1 + w (distinct from v1)
    v2 = v1 + w

    # Check v1 != v2
    vectors_differ = not (v1 - v2).equals(zeros(n, 1))

    # Check P*v1 = P*v2
    Pv1 = P * v1
    Pv2 = P * v2
    projections_equal = (Pv1 - Pv2).equals(zeros(n, 1))

    passed = vectors_differ and projections_equal
    print(f"[{'PASS' if passed else 'FAIL'}] "
          f"Distinct vectors indistinguishable under pi "
          f"(v1!=v2: {vectors_differ}, Pv1=Pv2: {projections_equal})")
    return passed


def test_information_loss_quantified(P, n, k):
    """Test (c): dim(V_pi) < dim(V_Crystal), quantified."""
    rank_P = P.rank()
    info_loss = n - rank_P

    correct_rank = (rank_P == k)
    strict_loss = (info_loss > 0)
    correct_loss = (info_loss == n - k)

    passed = correct_rank and strict_loss and correct_loss
    print(f"[{'PASS' if passed else 'FAIL'}] "
          f"Information loss: dim(V_pi)={rank_P}, dim(G_pi)={info_loss}, "
          f"dim(V_Crystal)={n} "
          f"(loss = {info_loss}/{n} = {float(info_loss)/n:.1%})")
    return passed


def test_kernel_orthogonal_to_image(P, n, k):
    """
    Test: Every kernel vector is orthogonal to every image vector.
    This verifies G_pi intersect V_pi = {0}.
    """
    colspace = P.columnspace()
    nullspace = P.nullspace()

    all_orthogonal = True
    count = 0
    for v_img in colspace:
        for v_ker in nullspace:
            dot = v_img.dot(v_ker)
            if simplify(dot) != 0:
                all_orthogonal = False
            count += 1

    passed = all_orthogonal
    print(f"[{'PASS' if passed else 'FAIL'}] "
          f"ker(pi) orthogonal to im(pi) "
          f"(tested {count} dot products)")
    return passed


def test_no_kernel_info_in_image(P, n, k):
    """
    Test: The projection of any kernel vector onto V_pi is zero.
    This means V_pi contains no information about G_pi.
    """
    nullspace = P.nullspace()

    all_zero = True
    for w in nullspace:
        Pw = P * w
        if not Pw.equals(zeros(n, 1)):
            all_zero = False
            break

    passed = all_zero
    print(f"[{'PASS' if passed else 'FAIL'}] "
          f"P(w) = 0 for all w in ker(P) "
          f"(tested {len(nullspace)} kernel vectors)")
    return passed


def main():
    print("=" * 70)
    print("THM_04A7 Self-Model Incompleteness: Computational Verification")
    print("=" * 70)

    all_pass = True

    # Framework values: n=11, k=4
    print("\n--- n=11, k=4 (framework values) ---")
    n, k = 11, 4
    P = make_projection_matrix(n, k)

    all_pass &= test_self_model_is_identity(P, n, k)
    all_pass &= test_indistinguishable_vectors(P, n, k)
    all_pass &= test_information_loss_quantified(P, n, k)
    all_pass &= test_kernel_orthogonal_to_image(P, n, k)
    all_pass &= test_no_kernel_info_in_image(P, n, k)

    # Small case: n=3, k=1
    print("\n--- n=3, k=1 (minimal case) ---")
    n2, k2 = 3, 1
    P2 = make_projection_matrix(n2, k2)

    all_pass &= test_self_model_is_identity(P2, n2, k2)
    all_pass &= test_indistinguishable_vectors(P2, n2, k2)
    all_pass &= test_information_loss_quantified(P2, n2, k2)

    # Summary
    print("\n" + "=" * 70)
    if all_pass:
        print("ALL TESTS PASSED (8/8)")
        print("\nTHM_04A7 Self-Model Incompleteness: VERIFIED")
    else:
        print("SOME TESTS FAILED")
    print("=" * 70)

    return all_pass


if __name__ == "__main__":
    main()
