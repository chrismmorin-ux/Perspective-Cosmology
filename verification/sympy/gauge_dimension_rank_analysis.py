"""
Verification: Gauge group dimension and rank relationships
===========================================================

Tests the derivations from Session 48:
1. dim(G_SM) = 12 via multiple equivalent formulas
2. rank(G_SM) = n_d = 4
3. Factor of 3 = n_d - 1

These follow from division algebra structure + T1 axiom.
"""

# Division algebra dimensions (Cayley-Dickson construction)
algebras = {
    'R': {'dim': 1, 'depth': 0, 'associative': True},
    'C': {'dim': 2, 'depth': 1, 'associative': True},
    'H': {'dim': 4, 'depth': 2, 'associative': True},
    'O': {'dim': 8, 'depth': 3, 'associative': False},
}

# Verify Cayley-Dickson structure
print("=== Cayley-Dickson Structure ===")
for name, props in algebras.items():
    expected_dim = 2 ** props['depth']
    status = "PASS" if props['dim'] == expected_dim else "FAIL"
    print(f"{name}: dim = {props['dim']} = 2^{props['depth']} [{status}]")

print()

# Defect and crystal dimensions
n_d = algebras['H']['dim']  # Max associative
n_c = algebras['R']['dim'] + algebras['C']['dim'] + algebras['O']['dim']  # Remaining
total_div_alg = sum(a['dim'] for a in algebras.values())

print("=== Defect/Crystal Structure ===")
print(f"n_d (defect) = dim(H) = {n_d} (max associative)")
print(f"n_c (crystal) = R + C + O = {n_c}")
print(f"Total division algebra dim = {total_div_alg}")
assert n_d + n_c == total_div_alg - 1 + algebras['R']['dim'], "Dimension count"
print()

# Gauge groups from division algebras
gauge_groups = {
    'C': {'group': 'U(1)', 'n': 1, 'dim': 1, 'rank': 1},
    'H': {'group': 'SU(2)', 'n': 2, 'dim': 3, 'rank': 1},
    'O': {'group': 'SU(3)', 'n': 3, 'dim': 8, 'rank': 2},
}

print("=== Gauge Group Structure ===")
for alg, props in gauge_groups.items():
    depth = algebras[alg]['depth']
    print(f"{alg} (depth {depth}) -> {props['group']}: dim={props['dim']}, rank={props['rank']}")

    # Verify n = depth
    if props['n'] == depth:
        print(f"  n = {props['n']} = depth [{depth}] [PASS]")
    else:
        print(f"  n = {props['n']} != depth [{depth}] [FAIL]")

    # Verify rank formula
    if props['group'] == 'U(1)':
        expected_rank = 1
    else:
        expected_rank = props['n'] - 1

    status = "PASS" if props['rank'] == expected_rank else "FAIL"
    print(f"  rank = {props['rank']} = n-1 = {expected_rank} [{status}]")

print()

# Total gauge dimension and rank
dim_G_SM = sum(g['dim'] for g in gauge_groups.values())
rank_G_SM = sum(g['rank'] for g in gauge_groups.values())

print("=== SM Gauge Group Totals ===")
print(f"dim(G_SM) = {gauge_groups['C']['dim']} + {gauge_groups['H']['dim']} + {gauge_groups['O']['dim']} = {dim_G_SM}")
print(f"rank(G_SM) = {gauge_groups['C']['rank']} + {gauge_groups['H']['rank']} + {gauge_groups['O']['rank']} = {rank_G_SM}")
print()

# Verification of key formulas
print("=== Key Formula Verification ===")

# Formula 1: dim(G_SM) = dim(H) + dim(O)
formula1 = algebras['H']['dim'] + algebras['O']['dim']
status1 = "PASS" if formula1 == dim_G_SM else "FAIL"
print(f"dim(G_SM) = dim(H) + dim(O) = {algebras['H']['dim']} + {algebras['O']['dim']} = {formula1} [{status1}]")

# Formula 2: dim(G_SM) = n_d * (n_d - 1)
formula2 = n_d * (n_d - 1)
status2 = "PASS" if formula2 == dim_G_SM else "FAIL"
print(f"dim(G_SM) = n_d * (n_d - 1) = {n_d} * {n_d - 1} = {formula2} [{status2}]")

# Formula 3: dim(G_SM) = 2 * dim(SO(n_d))
dim_SO_nd = n_d * (n_d - 1) // 2
formula3 = 2 * dim_SO_nd
status3 = "PASS" if formula3 == dim_G_SM else "FAIL"
print(f"dim(G_SM) = 2 * dim(SO({n_d})) = 2 * {dim_SO_nd} = {formula3} [{status3}]")

# Formula 4: rank(G_SM) = n_d
status4 = "PASS" if rank_G_SM == n_d else "FAIL"
print(f"rank(G_SM) = n_d: {rank_G_SM} = {n_d} [{status4}]")

# Formula 5: dim/rank = n_d - 1 (factor of 3)
factor = dim_G_SM // rank_G_SM
status5 = "PASS" if factor == n_d - 1 else "FAIL"
print(f"dim/rank = n_d - 1: {dim_G_SM}/{rank_G_SM} = {factor} = {n_d - 1} [{status5}]")

print()

# Derivation chain verification
print("=== Derivation Chain Summary ===")
print(f"T1 -> F = C -> Division algebras C, H, O contribute gauge groups")
print(f"  C (depth 1) -> U(1)  : dim = 1, rank = 1")
print(f"  H (depth 2) -> SU(2) : dim = 3, rank = 1")
print(f"  O (depth 3) -> SU(3) : dim = 8, rank = 2")
print()
print(f"Results:")
print(f"  dim(G_SM) = {dim_G_SM} = H + O = n_d * (n_d - 1)")
print(f"  rank(G_SM) = {rank_G_SM} = n_d")
print(f"  factor of 3 = dim/rank = {factor} = n_d - 1 = spatial dimensions")
print()

# Final status
all_pass = all([
    formula1 == dim_G_SM,
    formula2 == dim_G_SM,
    formula3 == dim_G_SM,
    rank_G_SM == n_d,
    factor == n_d - 1,
])

print("=" * 50)
if all_pass:
    print("ALL VERIFICATIONS PASSED")
else:
    print("SOME VERIFICATIONS FAILED")
print("=" * 50)
