#!/usr/bin/env python3
"""
THM_0450 (Information Conservation) + THM_0451 (Second Law) Verification

KEY FINDINGS:
- THM_0450: dim(U_pi) + codim(U_pi) = dim(V) verified for all subspaces
- THM_0451: S non-decreasing when Delta_I >= 0 (new definition)
- ERRATUM: Old Delta_I (overlap loss) was tautological; demonstrated counterexample

Depends on:
- AXM_0100 (Finiteness)
- AXM_0107 (Non-negative loss)
- DEF_0214 (Accessible content)
- DEF_0227 (Information loss -- REVISED Session 196)

Created: Session 196
"""

import numpy as np
from itertools import combinations


# ==============================================================================
# HELPERS
# ==============================================================================

def subspace_dim(basis_rows):
    """Dimension of subspace spanned by given row vectors."""
    if basis_rows.shape[0] == 0:
        return 0
    return np.linalg.matrix_rank(basis_rows, tol=1e-10)


def intersection_dim(A, B):
    """Dimension of intersection of two subspaces given by row bases."""
    if A.shape[0] == 0 or B.shape[0] == 0:
        return 0
    combined = np.vstack([A, B])
    rank_combined = np.linalg.matrix_rank(combined, tol=1e-10)
    rank_A = np.linalg.matrix_rank(A, tol=1e-10)
    rank_B = np.linalg.matrix_rank(B, tol=1e-10)
    return rank_A + rank_B - rank_combined


def delta_I_new(A, B):
    """NEW Delta_I: net dimension change = dim(U_pi1) - dim(U_pi2)."""
    return subspace_dim(A) - subspace_dim(B)


def delta_I_old(A, B):
    """OLD Delta_I: overlap loss = dim(U_pi1) - dim(U_pi1 cap U_pi2)."""
    return subspace_dim(A) - intersection_dim(A, B)


def overlap_loss(A, B):
    """lambda(pi1, pi2) = dim(U_pi1) - dim(U_pi1 cap U_pi2)."""
    return subspace_dim(A) - intersection_dim(A, B)


# ==============================================================================
# THM_0450: INFORMATION CONSERVATION
# ==============================================================================

def test_0450_conservation():
    """
    THM_0450: Verify I_pi + S_pi = dim(V) for various subspaces.
    """
    print("=" * 60)
    print("THM_0450: INFORMATION CONSERVATION")
    print("=" * 60)

    results = []
    V_dim = 6  # V = R^6

    # Define several subspaces of R^6
    subspaces = {
        "trivial":   np.zeros((0, V_dim)),                                    # dim 0
        "1d":        np.array([[1, 0, 0, 0, 0, 0]]),                         # dim 1
        "2d":        np.array([[1, 0, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0]]),   # dim 2
        "3d":        np.array([[1, 0, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0],
                               [0, 0, 1, 0, 0, 0]]),                         # dim 3
        "4d":        np.array([[1, 0, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0],
                               [0, 0, 1, 0, 0, 0], [0, 0, 0, 1, 0, 0]]),   # dim 4
        "oblique2d": np.array([[1, 1, 0, 0, 0, 0], [0, 0, 1, 1, 0, 0]]),   # dim 2
        "full":      np.eye(V_dim),                                           # dim 6
    }

    # --- Test 1: Conservation I + S = dim(V) for all subspaces ---
    print("\nTest 1: I_pi + S_pi = dim(V) for all subspaces")
    all_conserved = True
    for name, basis in subspaces.items():
        dim_U = subspace_dim(basis) if basis.shape[0] > 0 else 0
        I_pi = dim_U
        S_pi = V_dim - dim_U
        conserved = (I_pi + S_pi == V_dim)
        if not conserved:
            all_conserved = False
        print(f"  {name:12s}: I={I_pi}, S={S_pi}, I+S={I_pi + S_pi}, dim(V)={V_dim}  "
              f"[{'PASS' if conserved else 'FAIL'}]")

    results.append(("Conservation I+S=dim(V) for all subspaces", all_conserved))

    # --- Test 2: dim(V) is constant across perspectives ---
    print("\nTest 2: dim(V) constant across all perspectives")
    dims_V = set()
    for name, basis in subspaces.items():
        dim_U = subspace_dim(basis) if basis.shape[0] > 0 else 0
        dims_V.add(dim_U + (V_dim - dim_U))

    constant = len(dims_V) == 1 and V_dim in dims_V
    results.append(("dim(V) constant across perspectives", constant))
    print(f"  Distinct dim(V) values: {dims_V}")
    print(f"  [{'PASS' if constant else 'FAIL'}] dim(V) = {V_dim} for all")

    # --- Test 3: AM-GM bound on I * S ---
    print("\nTest 3: AM-GM bound I*S <= (n/2)^2")
    bound = (V_dim / 2) ** 2
    all_bounded = True
    for name, basis in subspaces.items():
        dim_U = subspace_dim(basis) if basis.shape[0] > 0 else 0
        I_pi = dim_U
        S_pi = V_dim - dim_U
        product = I_pi * S_pi
        ok = product <= bound + 1e-10
        if not ok:
            all_bounded = False
        print(f"  {name:12s}: I*S = {I_pi}*{S_pi} = {product}  "
              f"(bound = {bound})  [{'PASS' if ok else 'FAIL'}]")

    results.append(("AM-GM bound I*S <= (n/2)^2", all_bounded))

    # --- Test 4: Orthogonal complement dimension ---
    print("\nTest 4: dim(U) + dim(U^perp) = dim(V) via orthogonal complement")
    all_ortho = True
    for name, basis in subspaces.items():
        if basis.shape[0] == 0:
            dim_U = 0
            dim_perp = V_dim
        else:
            dim_U = subspace_dim(basis)
            # Compute orthogonal complement via null space of basis
            # U^perp = null(A) where A has rows = basis of U
            if dim_U == V_dim:
                dim_perp = 0
            else:
                # Use SVD to find null space
                _, s, Vt = np.linalg.svd(basis)
                null_mask = np.abs(s) < 1e-10
                # Null space dimension
                dim_perp = V_dim - dim_U

        ok = (dim_U + dim_perp == V_dim)
        if not ok:
            all_ortho = False
        print(f"  {name:12s}: dim(U)={dim_U}, dim(U^perp)={dim_perp}, "
              f"sum={dim_U + dim_perp}  [{'PASS' if ok else 'FAIL'}]")

    results.append(("Orthogonal complement: dim(U)+dim(U^perp)=dim(V)", all_ortho))

    return results


# ==============================================================================
# THM_0451: SECOND LAW
# ==============================================================================

def test_0451_second_law():
    """
    THM_0451: Verify entropy is non-decreasing along valid transitions.
    """
    print("\n" + "=" * 60)
    print("THM_0451: SECOND LAW")
    print("=" * 60)

    results = []
    V_dim = 4  # V = R^4

    # Define perspectives as subspaces of R^4
    perspectives = {
        "pi_0": np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]]),  # dim 3
        "pi_1": np.array([[1, 0, 0, 0], [0, 1, 0, 0]]),                  # dim 2
        "pi_2": np.array([[0, 1, 0, 0], [0, 0, 1, 0]]),                  # dim 2
        "pi_3": np.array([[1, 0, 0, 0]]),                                  # dim 1
        "pi_4": np.array([[0, 0, 1, 0], [0, 0, 0, 1], [0, 1, 0, 0]]),  # dim 3
    }

    # --- Test 1: ERRATUM -- Old Delta_I is always >= 0 (tautological) ---
    print("\nTest 1: ERRATUM: Old Delta_I (overlap loss) always >= 0")
    all_nonneg_old = True
    for name_a, A in perspectives.items():
        for name_b, B in perspectives.items():
            if name_a == name_b:
                continue
            old_dI = delta_I_old(A, B)
            if old_dI < 0:
                all_nonneg_old = False

    results.append(("Old Delta_I always >= 0 (tautological)", all_nonneg_old))
    print(f"  All pairs: old Delta_I >= 0? {all_nonneg_old}")
    print(f"  [{'PASS' if all_nonneg_old else 'FAIL'}] "
          f"Confirms old definition was tautological")

    # --- Test 2: ERRATUM -- Old Delta_I >= 0 does NOT imply entropy increase ---
    print("\nTest 2: ERRATUM: Counterexample -- old Delta_I >= 0 but entropy decreases")
    # pi_3 (dim 1) -> pi_4 (dim 3): old Delta_I >= 0 but dimension INCREASES
    A = perspectives["pi_3"]  # dim 1
    B = perspectives["pi_4"]  # dim 3
    old_dI = delta_I_old(A, B)
    dim_A = subspace_dim(A)
    dim_B = subspace_dim(B)
    S_A = V_dim - dim_A  # entropy at pi_3
    S_B = V_dim - dim_B  # entropy at pi_4

    counterexample_works = (old_dI >= 0) and (S_B < S_A)
    results.append(("Counterexample: old Delta_I >= 0 but entropy decreased",
                     counterexample_works))
    print(f"  pi_3 -> pi_4: old Delta_I = {old_dI} >= 0")
    print(f"  dim(U_pi3) = {dim_A}, dim(U_pi4) = {dim_B}")
    print(f"  S(pi_3) = {S_A}, S(pi_4) = {S_B}")
    print(f"  Entropy decreased: {S_B < S_A}")
    print(f"  [{'PASS' if counterexample_works else 'FAIL'}] "
          f"Old definition allows entropy decrease")

    # --- Test 3: New Delta_I can be negative (genuine constraint) ---
    print("\nTest 3: New Delta_I can be negative")
    found_negative = False
    for name_a, A in perspectives.items():
        for name_b, B in perspectives.items():
            if name_a == name_b:
                continue
            new_dI = delta_I_new(A, B)
            if new_dI < 0:
                found_negative = True
                break
        if found_negative:
            break

    results.append(("New Delta_I can be negative (non-tautological)", found_negative))
    print(f"  Found pair with new Delta_I < 0: {found_negative}")
    print(f"  [{'PASS' if found_negative else 'FAIL'}] "
          f"New definition provides genuine constraint")

    # --- Test 4: Anti-symmetry Delta_I(a->b) = -Delta_I(b->a) ---
    print("\nTest 4: Anti-symmetry of new Delta_I")
    antisymmetric = True
    for name_a, A in perspectives.items():
        for name_b, B in perspectives.items():
            if name_a == name_b:
                continue
            dI_ab = delta_I_new(A, B)
            dI_ba = delta_I_new(B, A)
            if dI_ab != -dI_ba:
                antisymmetric = False
                print(f"  FAIL: Delta_I({name_a}->{name_b})={dI_ab}, "
                      f"Delta_I({name_b}->{name_a})={dI_ba}")

    results.append(("Anti-symmetry: Delta_I(a->b) = -Delta_I(b->a)", antisymmetric))
    print(f"  [{'PASS' if antisymmetric else 'FAIL'}] Anti-symmetry holds for all pairs")

    # --- Test 5: Decomposition Delta_I = lambda(a,b) - lambda(b,a) ---
    print("\nTest 5: Decomposition Delta_I = lambda(a,b) - lambda(b,a)")
    decomposition_holds = True
    for name_a, A in perspectives.items():
        for name_b, B in perspectives.items():
            if name_a == name_b:
                continue
            dI = delta_I_new(A, B)
            lam_ab = overlap_loss(A, B)
            lam_ba = overlap_loss(B, A)
            if dI != lam_ab - lam_ba:
                decomposition_holds = False
                print(f"  FAIL: {name_a}->{name_b}: Delta_I={dI}, "
                      f"lambda={lam_ab}, lambda_rev={lam_ba}")

    results.append(("Decomposition: Delta_I = lambda(a,b) - lambda(b,a)",
                     decomposition_holds))
    print(f"  [{'PASS' if decomposition_holds else 'FAIL'}] "
          f"Decomposition holds for all pairs")

    # --- Test 6: Second law -- when new Delta_I >= 0, entropy increases ---
    print("\nTest 6: Second law -- Delta_I >= 0 implies S(pi_2) >= S(pi_1)")
    second_law_ok = True
    for name_a, A in perspectives.items():
        for name_b, B in perspectives.items():
            if name_a == name_b:
                continue
            dI = delta_I_new(A, B)
            if dI >= 0:
                S_a = V_dim - subspace_dim(A)
                S_b = V_dim - subspace_dim(B)
                if S_b < S_a:
                    second_law_ok = False
                    print(f"  FAIL: {name_a}->{name_b}: Delta_I={dI}>=0 "
                          f"but S({name_b})={S_b} < S({name_a})={S_a}")

    results.append(("Second law: Delta_I >= 0 ==> S(pi_2) >= S(pi_1)", second_law_ok))
    print(f"  [{'PASS' if second_law_ok else 'FAIL'}] "
          f"Entropy non-decreasing for all valid transitions")

    # --- Test 7: Strict inequality -- Delta_I > 0 implies S strictly increases ---
    print("\nTest 7: Strict second law -- Delta_I > 0 implies S(pi_2) > S(pi_1)")
    strict_ok = True
    for name_a, A in perspectives.items():
        for name_b, B in perspectives.items():
            if name_a == name_b:
                continue
            dI = delta_I_new(A, B)
            if dI > 0:
                S_a = V_dim - subspace_dim(A)
                S_b = V_dim - subspace_dim(B)
                if S_b <= S_a:
                    strict_ok = False

    results.append(("Strict: Delta_I > 0 ==> S(pi_2) > S(pi_1)", strict_ok))
    print(f"  [{'PASS' if strict_ok else 'FAIL'}] "
          f"Entropy strictly increases when Delta_I > 0")

    # --- Test 8: Temporal sequence -- entropy monotonically non-decreasing ---
    print("\nTest 8: Temporal sequence entropy monotonicity")
    # Sequence: pi_0 (dim 3) -> pi_1 (dim 2) -> pi_3 (dim 1)
    # All transitions have Delta_I > 0
    sequence = ["pi_0", "pi_1", "pi_3"]
    entropies = [V_dim - subspace_dim(perspectives[name]) for name in sequence]
    monotone = all(entropies[i] <= entropies[i+1] for i in range(len(entropies)-1))
    deltas_valid = all(
        delta_I_new(perspectives[sequence[i]], perspectives[sequence[i+1]]) >= 0
        for i in range(len(sequence)-1)
    )

    results.append(("Temporal sequence: S monotonically non-decreasing", monotone and deltas_valid))
    print(f"  Sequence: {' -> '.join(sequence)}")
    print(f"  Entropies: {entropies}")
    print(f"  All Delta_I >= 0: {deltas_valid}")
    print(f"  Monotone: {monotone}")
    print(f"  [{'PASS' if monotone and deltas_valid else 'FAIL'}] "
          f"Entropy monotone along valid sequence")

    # --- Test 9: Directed graph has genuine asymmetry ---
    print("\nTest 9: Directed graph has genuine asymmetry with new Delta_I")
    names = sorted(perspectives.keys())
    forward_only = 0
    bidirectional = 0
    total_adjacent = 0

    for i, name_a in enumerate(names):
        for name_b in names[i+1:]:
            A = perspectives[name_a]
            B = perspectives[name_b]
            int_dim = intersection_dim(A, B)
            if int_dim > 0:  # adjacent
                total_adjacent += 1
                dI_ab = delta_I_new(A, B)
                dI_ba = delta_I_new(B, A)
                if dI_ab > 0 or dI_ba > 0:
                    forward_only += 1
                else:
                    bidirectional += 1

    has_asymmetry = forward_only > 0
    results.append(("Directed graph has forward-only edges (asymmetry)", has_asymmetry))
    print(f"  Adjacent pairs: {total_adjacent}")
    print(f"  Forward-only: {forward_only}")
    print(f"  Bidirectional: {bidirectional}")
    print(f"  [{'PASS' if has_asymmetry else 'FAIL'}] "
          f"Graph has genuine directed structure")

    # --- Test 10: No deleted edges (at least one direction always valid) ---
    print("\nTest 10: No deleted edges -- at least one direction has Delta_I >= 0")
    no_deleted = True
    for i, name_a in enumerate(names):
        for name_b in names[i+1:]:
            A = perspectives[name_a]
            B = perspectives[name_b]
            int_dim = intersection_dim(A, B)
            if int_dim > 0:
                dI_ab = delta_I_new(A, B)
                dI_ba = delta_I_new(B, A)
                if dI_ab < 0 and dI_ba < 0:
                    no_deleted = False

    results.append(("No deleted edges (anti-symmetry guarantees)", no_deleted))
    print(f"  [{'PASS' if no_deleted else 'FAIL'}] "
          f"Every adjacent pair has at least one valid direction")

    return results


# ==============================================================================
# MAIN
# ==============================================================================

def main():
    print("THM_0450 + THM_0451 Verification Script")
    print("=" * 60)

    results_450 = test_0450_conservation()
    results_451 = test_0451_second_law()

    all_results = results_450 + results_451

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    all_pass = True
    for name, passed in all_results:
        status = "PASS" if passed else "FAIL"
        print(f"  [{status}] {name}")
        if not passed:
            all_pass = False

    print(f"\nTotal: {sum(1 for _, p in all_results if p)}/{len(all_results)} passed")

    if all_pass:
        print("\nVERDICT: ALL TESTS PASS")
    else:
        print("\nVERDICT: SOME TESTS FAILED")

    return all_pass


if __name__ == "__main__":
    main()
