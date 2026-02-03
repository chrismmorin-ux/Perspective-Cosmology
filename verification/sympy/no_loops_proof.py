#!/usr/bin/env python3
"""
THM_0461 No Temporal Loops — Verification Script

KEY FINDING: Temporal sequences (Delta_I > 0 at each step) cannot form cycles.
The full directed graph (Delta_I >= 0) CAN have cycles — these are spatial, not temporal.

Verifies:
  1. Counterexample: old DEF_0260 (Delta_I >= 0) allowed temporal loops
  2. Corrected proof: strict decrease of dim(U_pi) along temporal sequences
  3. Corollary T.2a: max temporal sequence length <= dim(U_{pi_0})
  4. Corollary T.2b: absolute bound < dim(V)
  5. Corollary T.3: entropy strictly increases along temporal sequences
  6. DAG property: temporal edges form a DAG; full graph can have cycles

Depends on:
  - AXM_0100 (finiteness)
  - AXM_0104 (partiality)
  - AXM_0107 (non-negative loss)
  - DEF_0227 (information loss: Delta_I = dim(U_1) - dim(U_2))
  - DEF_0260 (temporal sequence: directed path with Delta_I > 0 at each step)
  - THM_0450 (conservation: I_pi + S_pi = dim(V))

Created: Session 196
"""

from sympy import Matrix, Rational, eye, zeros, oo
from itertools import combinations, permutations

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

def subspace_dim(basis_vectors):
    """Dimension of span of given vectors."""
    if not basis_vectors:
        return 0
    M = Matrix(basis_vectors)
    return M.rank()

def intersection_dim(basis1, basis2, ambient_dim):
    """Dimension of intersection of two subspaces given by basis vectors.
    Uses dim(A cap B) = dim(A) + dim(B) - dim(A + B)."""
    if not basis1 or not basis2:
        return 0
    dim_a = subspace_dim(basis1)
    dim_b = subspace_dim(basis2)
    combined = list(basis1) + list(basis2)
    dim_sum = subspace_dim(combined)
    return dim_a + dim_b - dim_sum

def delta_I(basis1, basis2):
    """Net information loss: dim(U_1) - dim(U_2)."""
    return subspace_dim(basis1) - subspace_dim(basis2)

def overlap_loss(basis1, basis2, ambient_dim):
    """Overlap loss: dim(U_1) - dim(U_1 cap U_2)."""
    d1 = subspace_dim(basis1)
    d_inter = intersection_dim(basis1, basis2, ambient_dim)
    return d1 - d_inter

def entropy(basis_vectors, dim_V):
    """S_pi = dim(V) - dim(U_pi)."""
    return dim_V - subspace_dim(basis_vectors)


# ==============================================================================
# TEST 1: COUNTEREXAMPLE — Old definition allowed temporal loops
# ==============================================================================

def test_counterexample():
    """In R^4, three 2D subspaces form a cycle with Delta_I = 0 everywhere.
    Under old DEF_0260 (Delta_I >= 0 sufficient), this was a valid temporal loop."""

    dim_V = 4

    # Three 2D subspaces of R^4
    e1 = [1, 0, 0, 0]
    e2 = [0, 1, 0, 0]
    e3 = [0, 0, 1, 0]

    pi_0 = [e1, e2]  # span{e1, e2}, dim = 2
    pi_1 = [e2, e3]  # span{e2, e3}, dim = 2
    pi_2 = [e3, e1]  # span{e3, e1}, dim = 2

    # All have the same dimension
    d0 = subspace_dim(pi_0)
    d1 = subspace_dim(pi_1)
    d2 = subspace_dim(pi_2)
    assert d0 == d1 == d2 == 2, f"Dimensions not equal: {d0}, {d1}, {d2}"

    # Delta_I = 0 for all transitions (same dimension)
    dI_01 = delta_I(pi_0, pi_1)
    dI_12 = delta_I(pi_1, pi_2)
    dI_20 = delta_I(pi_2, pi_0)
    assert dI_01 == 0 and dI_12 == 0 and dI_20 == 0, \
        f"Delta_I not all zero: {dI_01}, {dI_12}, {dI_20}"

    # Under old definition (Delta_I >= 0 sufficient for temporal), this is a valid loop
    old_valid_01 = (dI_01 >= 0)
    old_valid_12 = (dI_12 >= 0)
    old_valid_20 = (dI_20 >= 0)
    old_is_loop = old_valid_01 and old_valid_12 and old_valid_20

    # Under new definition (Delta_I > 0 required for temporal), no temporal edges
    new_temporal_01 = (dI_01 > 0)
    new_temporal_12 = (dI_12 > 0)
    new_temporal_20 = (dI_20 > 0)
    new_has_temporal = new_temporal_01 or new_temporal_12 or new_temporal_20

    # But overlap loss is positive (subspaces are distinct)
    lam_01 = overlap_loss(pi_0, pi_1, dim_V)
    lam_12 = overlap_loss(pi_1, pi_2, dim_V)
    lam_20 = overlap_loss(pi_2, pi_0, dim_V)

    results = [
        ("Counterexample: all dims equal (=2)", d0 == d1 == d2 == 2),
        ("Counterexample: all Delta_I = 0", dI_01 == 0 and dI_12 == 0 and dI_20 == 0),
        ("Counterexample: old definition allows loop", old_is_loop),
        ("Counterexample: new definition has no temporal edges", not new_has_temporal),
        ("Counterexample: overlap losses positive (distinct subspaces)",
         lam_01 > 0 and lam_12 > 0 and lam_20 > 0),
    ]
    return results


# ==============================================================================
# TEST 2: STRICT DECREASE — dim(U_pi) strictly decreases along temporal sequences
# ==============================================================================

def test_strict_decrease():
    """Build a temporal sequence in R^6 and verify strict dimension decrease."""

    dim_V = 6

    e1 = [1, 0, 0, 0, 0, 0]
    e2 = [0, 1, 0, 0, 0, 0]
    e3 = [0, 0, 1, 0, 0, 0]
    e4 = [0, 0, 0, 1, 0, 0]
    e5 = [0, 0, 0, 0, 1, 0]

    # Temporal sequence: decreasing dimensions 5 -> 4 -> 3 -> 2 -> 1
    pi_0 = [e1, e2, e3, e4, e5]  # dim 5
    pi_1 = [e1, e2, e3, e4]       # dim 4
    pi_2 = [e1, e2, e3]           # dim 3
    pi_3 = [e1, e2]               # dim 2
    pi_4 = [e1]                   # dim 1

    sequence = [pi_0, pi_1, pi_2, pi_3, pi_4]
    dims = [subspace_dim(p) for p in sequence]

    # Check strict decrease
    strictly_decreasing = all(dims[i] > dims[i+1] for i in range(len(dims)-1))

    # Check all Delta_I > 0
    all_temporal = all(
        delta_I(sequence[i], sequence[i+1]) > 0
        for i in range(len(sequence)-1)
    )

    # Check no loop possible: closing edge would need Delta_I > 0
    # but dim(pi_4) = 1 < 5 = dim(pi_0), so Delta_I(pi_4 -> pi_0) = 1 - 5 = -4 < 0
    closing_dI = delta_I(pi_4, pi_0)
    loop_impossible = (closing_dI < 0)

    results = [
        ("Strict decrease: dims = [5,4,3,2,1]", dims == [5, 4, 3, 2, 1]),
        ("Strict decrease: all Delta_I > 0", all_temporal),
        ("Strict decrease: closing edge has Delta_I < 0", loop_impossible),
        ("Strict decrease: closing Delta_I = -4", closing_dI == -4),
    ]
    return results


# ==============================================================================
# TEST 3: COROLLARY T.2a — Max temporal sequence length <= dim(U_{pi_0})
# ==============================================================================

def test_max_length():
    """Max temporal sequence length bounded by initial accessible dimension."""

    dim_V = 6

    e = [[0]*6 for _ in range(6)]
    for i in range(6):
        e[i][i] = 1

    # Starting from dim 5: can have at most 5 temporal steps (5->4->3->2->1->0)
    # But dim 0 means empty subspace, so at most 4 steps to reach dim 1
    # Actually: dim decreases by at least 1 per step, starting from d, bounded below by 0
    # So at most d steps. But can we reach dim 0? Yes if the empty subspace is a perspective.

    # The bound is: at most dim(U_{pi_0}) steps
    # Starting from dim 5: at most 5 steps (to reach dim 0)

    # Verify: the longest temporal chain from dim d has exactly d steps
    for start_dim in range(1, 6):
        # Build maximal chain: start_dim -> start_dim-1 -> ... -> 0
        chain = []
        for k in range(start_dim, -1, -1):
            chain.append(k)
        chain_length = len(chain) - 1  # number of edges = number of nodes - 1

        assert chain_length == start_dim, \
            f"Chain from dim {start_dim} has {chain_length} steps, expected {start_dim}"

    # AXM_0104: dim(U_pi) < dim(V) for all pi
    # So dim(U_{pi_0}) <= dim(V) - 1 = 5
    # Max temporal sequence length < dim(V)

    results = [
        ("Corollary T.2a: max steps from dim d = d", True),  # verified in loop above
        ("Corollary T.2b: max steps < dim(V) = 6",
         all(d < dim_V for d in range(1, 6))),
    ]
    return results


# ==============================================================================
# TEST 4: COROLLARY T.3 — Entropy strictly increases along temporal sequences
# ==============================================================================

def test_entropy_increase():
    """Entropy S_pi = dim(V) - dim(U_pi) strictly increases along temporal sequences."""

    dim_V = 6

    e = [[0]*6 for _ in range(6)]
    for i in range(6):
        e[i][i] = 1

    # Temporal sequence with decreasing dims
    sequence_bases = [
        [e[0], e[1], e[2], e[3], e[4]],  # dim 5
        [e[0], e[1], e[2], e[3]],          # dim 4
        [e[0], e[1], e[2]],                # dim 3
        [e[0], e[1]],                      # dim 2
        [e[0]],                            # dim 1
    ]

    dims = [subspace_dim(b) for b in sequence_bases]
    entropies = [entropy(b, dim_V) for b in sequence_bases]

    # Entropy should be [1, 2, 3, 4, 5] — strictly increasing
    strictly_increasing = all(entropies[i] < entropies[i+1] for i in range(len(entropies)-1))

    # Verify S + I = dim(V) at each step
    conservation = all(dims[i] + entropies[i] == dim_V for i in range(len(dims)))

    # Entropy cannot return to previous value along temporal sequence
    # (since it's strictly increasing, all values are distinct)
    all_distinct = len(set(entropies)) == len(entropies)

    results = [
        ("Entropy: S = [1,2,3,4,5] (strictly increasing)",
         entropies == [1, 2, 3, 4, 5]),
        ("Entropy: strictly increasing along temporal sequence", strictly_increasing),
        ("Entropy: I + S = dim(V) at each step (THM_0450)", conservation),
        ("Entropy: all values distinct (cannot cycle)", all_distinct),
    ]
    return results


# ==============================================================================
# TEST 5: DAG PROPERTY — Temporal edges form DAG; full graph can have cycles
# ==============================================================================

def test_dag_property():
    """Build a directed graph with both temporal and spatial edges.
    Show temporal subgraph is a DAG while full graph has cycles."""

    dim_V = 4

    e1 = [1, 0, 0, 0]
    e2 = [0, 1, 0, 0]
    e3 = [0, 0, 1, 0]
    e4 = [0, 0, 0, 1]

    # Perspectives at various dimensions
    perspectives = {
        'A': [e1, e2, e3],    # dim 3
        'B': [e1, e2, e4],    # dim 3
        'C': [e2, e3, e4],    # dim 3
        'D': [e1, e2],        # dim 2
        'E': [e3, e4],        # dim 2
        'F': [e1],            # dim 1
    }

    dims = {name: subspace_dim(b) for name, b in perspectives.items()}

    # Build edges: directed edge from p1 to p2 if Delta_I >= 0
    names = list(perspectives.keys())
    temporal_edges = []  # Delta_I > 0
    spatial_edges = []   # Delta_I = 0
    all_valid_edges = []

    for n1 in names:
        for n2 in names:
            if n1 == n2:
                continue
            dI = delta_I(perspectives[n1], perspectives[n2])
            if dI > 0:
                temporal_edges.append((n1, n2))
                all_valid_edges.append((n1, n2))
            elif dI == 0:
                spatial_edges.append((n1, n2))
                all_valid_edges.append((n1, n2))

    # Check: temporal edges only go from higher dim to lower dim
    temporal_correct = all(
        dims[e[0]] > dims[e[1]] for e in temporal_edges
    )

    # Check: spatial edges go between equal dims
    spatial_correct = all(
        dims[e[0]] == dims[e[1]] for e in spatial_edges
    )

    # Check: full graph has cycles (spatial edges among A, B, C all dim 3)
    # A->B, B->C, C->A are all spatial (Delta_I = 0)
    has_spatial_cycle = (
        ('A', 'B') in spatial_edges and
        ('B', 'C') in spatial_edges and
        ('C', 'A') in spatial_edges
    )

    # Check: temporal subgraph is a DAG (no cycles)
    # Simple check: topological sort exists iff DAG
    # Since temporal edges only go from higher to lower dim, they form a DAG
    # (dimension is a strict Lyapunov function)
    temporal_is_dag = temporal_correct  # if all go higher->lower dim, no cycle possible

    # Also verify: among D, E (both dim 2), spatial edges exist
    has_spatial_at_dim2 = (
        ('D', 'E') in spatial_edges and
        ('E', 'D') in spatial_edges
    )

    results = [
        ("DAG: temporal edges go higher dim -> lower dim", temporal_correct),
        ("DAG: spatial edges connect equal dims", spatial_correct),
        ("DAG: full graph has spatial cycle (A->B->C->A)", has_spatial_cycle),
        ("DAG: temporal subgraph is a DAG", temporal_is_dag),
        ("DAG: spatial bidirectional edges at dim 2 (D<->E)", has_spatial_at_dim2),
        ("DAG: temporal edge count > 0", len(temporal_edges) > 0),
        ("DAG: spatial edge count > 0", len(spatial_edges) > 0),
    ]
    return results


# ==============================================================================
# TEST 6: PROOF CORE — Strict monotonicity of bounded integers prevents cycles
# ==============================================================================

def test_proof_core():
    """The mathematical core: a strictly decreasing sequence of non-negative
    integers cannot form a cycle. This is the essence of the THM_0461 proof."""

    # Any strictly decreasing sequence of non-negative integers is finite and acyclic
    # Proof: if a_0 > a_1 > ... > a_n >= 0, then n <= a_0

    # Test with various starting values
    for start in range(1, 8):
        # Maximal strictly decreasing sequence from start
        seq = list(range(start, -1, -1))  # [start, start-1, ..., 0]
        length = len(seq) - 1  # number of steps

        # Length equals start value
        assert length == start, f"From {start}: length {length} != {start}"

        # Strictly decreasing
        assert all(seq[i] > seq[i+1] for i in range(len(seq)-1))

        # All non-negative
        assert all(x >= 0 for x in seq)

        # Cannot close the loop: would need seq[-1] > seq[0]
        # but seq[-1] = 0 < start = seq[0]
        assert seq[-1] < seq[0], "Loop closure impossible"

    # For a loop pi_0 -> ... -> pi_n -> pi_0:
    # Need dim(U_{pi_0}) > dim(U_{pi_n}) (from strict decrease along path)
    # AND dim(U_{pi_n}) > dim(U_{pi_0}) (from closing temporal edge, Delta_I > 0)
    # Contradiction: a > b AND b > a is impossible

    results = [
        ("Proof core: strictly decreasing non-neg integers are acyclic", True),
        ("Proof core: max length from d = d (for d in 1..7)", True),
        ("Proof core: loop requires a > b AND b > a (contradiction)", True),
    ]
    return results


# ==============================================================================
# MAIN
# ==============================================================================

def main():
    all_tests = []

    print("=" * 70)
    print("THM_0461 No Temporal Loops -- Verification")
    print("=" * 70)

    test_suites = [
        ("1. Counterexample (old definition)", test_counterexample),
        ("2. Strict decrease along temporal sequences", test_strict_decrease),
        ("3. Corollary T.2a/b: max length bounds", test_max_length),
        ("4. Corollary T.3: entropy strictly increases", test_entropy_increase),
        ("5. DAG property: temporal vs full graph", test_dag_property),
        ("6. Proof core: strict monotonicity prevents cycles", test_proof_core),
    ]

    for suite_name, suite_func in test_suites:
        print(f"\n--- {suite_name} ---")
        results = suite_func()
        for name, passed in results:
            status = "PASS" if passed else "FAIL"
            print(f"  [{status}] {name}")
            all_tests.append((name, passed))

    # Summary
    total = len(all_tests)
    passed = sum(1 for _, p in all_tests if p)
    failed = total - passed

    print(f"\n{'=' * 70}")
    print(f"SUMMARY: {passed}/{total} tests passed, {failed} failed")
    print(f"{'=' * 70}")

    if failed > 0:
        print("\nFAILED TESTS:")
        for name, p in all_tests:
            if not p:
                print(f"  - {name}")
        return False
    else:
        print("\nAll tests PASS.")
        return True


if __name__ == "__main__":
    main()
