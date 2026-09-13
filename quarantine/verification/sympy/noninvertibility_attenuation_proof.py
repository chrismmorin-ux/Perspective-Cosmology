#!/usr/bin/env python3
"""
THM_0411 (Non-Invertibility) + THM_0412 (Attenuation) Verification

KEY FINDINGS:
- THM_0411: A_pi has nontrivial kernel in all tested configurations (rank-nullity)
- THM_0412: ||P_D||_inf <= g_row, and ||(P_D)^n||_inf <= g_row^n (operator norm bound)
- THM_0412 erratum: g_max alone is INSUFFICIENT (counterexample provided)

Depends on:
- AXM_0100 (Finiteness)
- AXM_0104 (Partiality)
- DEF_0221 (Propagation operator)
- DEF_0222 (Receptive subspace)
- DEF_0224 (Access map construction)

Created: Session 196
"""

import numpy as np


# ==============================================================================
# THM_0411: NON-INVERTIBILITY OF ACCESS
# ==============================================================================

def build_propagation_matrix(P_size, edges, weights, D_compatible):
    """
    Build the propagation matrix M for P_D on scalar-valued V^P.

    M[x, y] = Gamma({x,y}) if y in E_D(x), else 0.

    Args:
        P_size: number of points
        edges: list of (x, y) undirected edges
        weights: dict mapping (x, y) -> Gamma value (symmetric)
        D_compatible: dict mapping x -> set of D-compatible neighbors
    """
    M = np.zeros((P_size, P_size))
    for x in range(P_size):
        for y in D_compatible.get(x, set()):
            edge = (min(x, y), max(x, y))
            if edge in weights:
                M[x, y] = weights[edge]
    return M


def build_access_map(M, p, proj_dims, V_dim, n_steps=100):
    """
    Build A_pi = Pi_p . eval_p . (P_D)^n for vector V.

    For V = R^d, the full operator acts on R^(|P|*d).
    We build A_pi as a matrix from R^(|P|*d) -> R^(proj_dims).

    Args:
        M: propagation matrix (|P| x |P|)
        p: anchor point index
        proj_dims: dim(V_p) -- how many dimensions the projection keeps
        V_dim: dim(V)
        n_steps: number of propagation steps (approximates limit)
    """
    P_size = M.shape[0]
    total_dim = P_size * V_dim

    # Build P_D on V^P = R^(|P|*V_dim) via Kronecker product
    # P_D acts as M (x) I_{V_dim}
    P_D_full = np.kron(M, np.eye(V_dim))

    # (P_D)^n
    P_D_n = np.linalg.matrix_power(P_D_full, n_steps)

    # eval_p: extracts block at index p (maps R^(|P|*V_dim) -> R^V_dim)
    eval_matrix = np.zeros((V_dim, total_dim))
    eval_matrix[:, p * V_dim:(p + 1) * V_dim] = np.eye(V_dim)

    # Pi_p: projects R^V_dim -> R^proj_dims (keeps first proj_dims components)
    proj_matrix = np.zeros((proj_dims, V_dim))
    proj_matrix[:, :proj_dims] = np.eye(proj_dims)

    # A_pi = Pi_p . eval_p . (P_D)^n
    A_pi = proj_matrix @ eval_matrix @ P_D_n
    return A_pi


def test_0411_dimension_argument():
    """
    THM_0411: Verify ker(A_pi) != {0} via rank-nullity.
    Test multiple configurations.
    """
    print("=" * 60)
    print("THM_0411: NON-INVERTIBILITY OF ACCESS")
    print("=" * 60)

    results = []

    # --- Test 1: Simple path graph, 3 points, V = R^2, V_p = R^1 ---
    P_size, V_dim, proj_dims = 3, 2, 1
    edges = [(0, 1), (1, 2)]
    weights = {(0, 1): 0.5, (1, 2): 0.5}
    D_compat = {0: {1}, 1: {2}, 2: set()}
    p = 0

    M = build_propagation_matrix(P_size, edges, weights, D_compat)
    A = build_access_map(M, p, proj_dims, V_dim, n_steps=50)

    domain_dim = P_size * V_dim
    codom_dim = proj_dims
    rank = np.linalg.matrix_rank(A, tol=1e-10)
    kernel_dim = domain_dim - rank

    passed = kernel_dim > 0
    results.append(("Path graph |P|=3, V=R^2, V_p=R^1", passed))
    print(f"\nTest 1: Path graph, |P|={P_size}, dim(V)={V_dim}, dim(V_p)={proj_dims}")
    print(f"  Domain dim:  {domain_dim}")
    print(f"  Codomain dim: {codom_dim}")
    print(f"  Rank(A_pi):  {rank}")
    print(f"  Kernel dim:  {kernel_dim}")
    print(f"  Lower bound: {domain_dim} - {codom_dim} = {domain_dim - codom_dim}")
    print(f"  [{'PASS' if passed else 'FAIL'}] ker(A_pi) != {{0}}")

    # --- Test 2: Complete graph, 5 points, V = R^3, V_p = R^3 (full V) ---
    # Even with V_p = V, non-invertibility follows from |P| >= 2
    P_size, V_dim, proj_dims = 5, 3, 3
    edges = [(i, j) for i in range(P_size) for j in range(i + 1, P_size)]
    weights = {e: 0.2 for e in edges}
    D_compat = {i: set(range(P_size)) - {i} for i in range(P_size)}
    p = 0

    M = build_propagation_matrix(P_size, edges, weights, D_compat)
    A = build_access_map(M, p, proj_dims, V_dim, n_steps=50)

    domain_dim = P_size * V_dim
    codom_dim = proj_dims
    rank = np.linalg.matrix_rank(A, tol=1e-10)
    kernel_dim = domain_dim - rank

    passed = kernel_dim > 0
    results.append(("Complete K_5, V=R^3, V_p=R^3 (full)", passed))
    print(f"\nTest 2: Complete graph K_5, |P|={P_size}, dim(V)={V_dim}, dim(V_p)={proj_dims}")
    print(f"  Domain dim:  {domain_dim}")
    print(f"  Codomain dim: {codom_dim}")
    print(f"  Rank(A_pi):  {rank}")
    print(f"  Kernel dim:  {kernel_dim}")
    print(f"  Lower bound: {domain_dim} - {codom_dim} = {domain_dim - codom_dim}")
    print(f"  [{'PASS' if passed else 'FAIL'}] ker(A_pi) != {{0}}")

    # --- Test 3: Framework values |P| = 11, dim(V) = 11 ---
    P_size, V_dim, proj_dims = 11, 11, 11
    # Ring graph (each point connects to next, wrapping)
    edges = [(i, (i + 1) % P_size) for i in range(P_size)]
    weights = {e: 0.3 for e in edges}
    # D picks clockwise direction
    D_compat = {i: {(i + 1) % P_size} for i in range(P_size)}
    p = 0

    M = build_propagation_matrix(P_size, edges, weights, D_compat)
    A = build_access_map(M, p, proj_dims, V_dim, n_steps=50)

    domain_dim = P_size * V_dim
    codom_dim = proj_dims
    rank = np.linalg.matrix_rank(A, tol=1e-10)
    kernel_dim = domain_dim - rank

    passed = kernel_dim > 0
    results.append(("Ring |P|=11, V=R^11, V_p=R^11", passed))
    print(f"\nTest 3: Ring graph, |P|={P_size}, dim(V)={V_dim}, dim(V_p)={proj_dims}")
    print(f"  Domain dim:  {domain_dim}")
    print(f"  Codomain dim: {codom_dim}")
    print(f"  Rank(A_pi):  {rank}")
    print(f"  Kernel dim:  {kernel_dim}")
    print(f"  Lower bound: {domain_dim} - {codom_dim} = {domain_dim - codom_dim}")
    print(f"  [{'PASS' if passed else 'FAIL'}] ker(A_pi) != {{0}}")

    # --- Test 4: Pure dimension argument (no computation needed) ---
    # For any |P| >= 2 and dim(V) >= 1: |P|*dim(V) > dim(V) >= dim(V_p)
    test_configs = [
        (2, 1, 1),
        (3, 2, 1),
        (5, 5, 5),
        (11, 11, 4),
        (11, 11, 11),
        (100, 3, 3),
    ]
    all_dim_pass = True
    print(f"\nTest 4: Pure dimension argument (|P| >= 2 implies non-injectivity)")
    for P, Vd, Vp in test_configs:
        dom = P * Vd
        cod = Vp
        ok = dom > cod
        if not ok:
            all_dim_pass = False
        print(f"  |P|={P:3d}, dim(V)={Vd:2d}, dim(V_p)={Vp:2d}: "
              f"dom={dom:5d} > cod={cod:2d}? {'YES' if ok else 'NO'}")

    results.append(("Dimension argument all configs", all_dim_pass))
    print(f"  [{'PASS' if all_dim_pass else 'FAIL'}] All configs have dim(dom) > dim(cod)")

    return results


# ==============================================================================
# THM_0412: ATTENUATION
# ==============================================================================

def operator_sup_norm(M, V_dim=1):
    """
    Compute ||M||_inf = max row sum of |M| (for scalar V).
    For vector V, this generalizes to the same formula via Kronecker structure.
    """
    return np.max(np.sum(np.abs(M), axis=1))


def test_0412_operator_norm_bound():
    """
    THM_0412: Verify ||P_D||_inf <= g_row and ||(P_D)^n||_inf <= g_row^n.
    """
    print("\n" + "=" * 60)
    print("THM_0412: ATTENUATION")
    print("=" * 60)

    results = []

    # --- Test 1: Simple path, g_row < 1 ---
    P_size = 4
    D_compat = {0: {1}, 1: {2}, 2: {3}, 3: set()}
    weights = {(0, 1): 0.7, (1, 2): 0.5, (2, 3): 0.3}
    M = build_propagation_matrix(P_size, [], weights, D_compat)

    gamma_row = max(sum(M[x, y] for y in range(P_size)) for x in range(P_size))
    norm_M = operator_sup_norm(M)

    passed = norm_M <= gamma_row + 1e-12
    results.append(("||P_D|| <= g_row (path graph)", passed))
    print(f"\nTest 1: Path graph, single neighbors")
    print(f"  g_row = {gamma_row:.4f}")
    print(f"  ||P_D||_inf = {norm_M:.4f}")
    print(f"  [{'PASS' if passed else 'FAIL'}] ||P_D||_inf <= g_row")

    # Check decay of (P_D)^n
    print(f"  Iterated norms:")
    all_bounded = True
    for n in [1, 2, 5, 10, 20]:
        Mn = np.linalg.matrix_power(M, n)
        norm_Mn = operator_sup_norm(Mn)
        bound = gamma_row ** n
        ok = norm_Mn <= bound + 1e-10
        if not ok:
            all_bounded = False
        print(f"    n={n:2d}: ||(P_D)^n|| = {norm_Mn:.2e}, "
              f"g_row^n = {bound:.2e}, bounded? {'YES' if ok else 'NO'}")

    results.append(("Decay bound all n (path graph)", all_bounded))
    print(f"  [{'PASS' if all_bounded else 'FAIL'}] ||(P_D)^n|| <= g_row^n for all tested n")

    # --- Test 2: Erratum counterexample -- g_max < 1 but g_row > 1 ---
    print(f"\nTest 2: ERRATUM counterexample (g_max < 1 but g_row > 1)")
    P_size = 4
    # Point 1 has 3 neighbors, each with Gamma = 0.9
    D_compat = {0: set(), 1: {0, 2, 3}, 2: set(), 3: set()}
    weights = {(0, 1): 0.9, (1, 2): 0.9, (1, 3): 0.9}
    M = build_propagation_matrix(P_size, [], weights, D_compat)

    gamma_max = 0.9
    gamma_row = max(sum(M[x, y] for y in range(P_size)) for x in range(P_size))
    norm_M = operator_sup_norm(M)

    print(f"  g_max (max individual weight) = {gamma_max}")
    print(f"  g_row (max row sum) = {gamma_row:.4f}")
    print(f"  ||P_D||_inf = {norm_M:.4f}")

    passed_erratum = gamma_max < 1 and gamma_row > 1
    results.append(("Erratum: g_max < 1 but g_row > 1", passed_erratum))
    print(f"  [{'PASS' if passed_erratum else 'FAIL'}] Counterexample: "
          f"g_max < 1 does NOT imply ||P_D|| < 1")

    # --- Test 3: Framework-scale ring graph ---
    print(f"\nTest 3: Ring graph |P|=11, single-neighbor (corollary)")
    P_size = 11
    gamma_val = 0.6
    D_compat = {i: {(i + 1) % P_size} for i in range(P_size)}
    weights = {(min(i, (i+1)%P_size), max(i, (i+1)%P_size)): gamma_val
               for i in range(P_size)}
    M = build_propagation_matrix(P_size, [], weights, D_compat)

    gamma_row = max(sum(M[x, y] for y in range(P_size)) for x in range(P_size))
    gamma_max = gamma_val

    print(f"  g_max = g_row = {gamma_row:.4f} (single neighbor per point)")

    passed_equal = abs(gamma_row - gamma_max) < 1e-12
    results.append(("Single-neighbor: g_row = g_max", passed_equal))
    print(f"  [{'PASS' if passed_equal else 'FAIL'}] g_row = g_max when |E_D(x)| <= 1")

    all_bounded = True
    print(f"  Iterated norms:")
    for n in [1, 5, 10, 20, 50]:
        Mn = np.linalg.matrix_power(M, n)
        norm_Mn = operator_sup_norm(Mn)
        bound = gamma_row ** n
        ok = norm_Mn <= bound + 1e-10
        if not ok:
            all_bounded = False
        print(f"    n={n:2d}: ||(P_D)^n|| = {norm_Mn:.2e}, "
              f"g_row^n = {bound:.2e}, bounded? {'YES' if ok else 'NO'}")

    results.append(("Decay bound all n (ring graph)", all_bounded))
    print(f"  [{'PASS' if all_bounded else 'FAIL'}] Exponential decay confirmed")

    # --- Test 4: Spectral radius check ---
    print(f"\nTest 4: Spectral radius rho(P_D) <= ||P_D||_inf <= g_row")
    eigenvalues = np.linalg.eigvals(M)
    spectral_radius = np.max(np.abs(eigenvalues))

    passed_spectral = spectral_radius <= gamma_row + 1e-10
    results.append(("rho(P_D) <= g_row (ring graph)", passed_spectral))
    print(f"  rho(P_D) = {spectral_radius:.6f}")
    print(f"  g_row    = {gamma_row:.6f}")
    print(f"  [{'PASS' if passed_spectral else 'FAIL'}] rho(P_D) <= g_row")

    return results


# ==============================================================================
# MAIN
# ==============================================================================

def main():
    print("THM_0411 + THM_0412 Verification Script")
    print("=" * 60)

    results_411 = test_0411_dimension_argument()
    results_412 = test_0412_operator_norm_bound()

    all_results = results_411 + results_412

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
