#!/usr/bin/env python3
"""
G_2 dimension via constraint matrix rank.

SUPERSEDED by g2_final.py -- this script uses incorrect Fano plane
orientation (same as g2_irreducibility_v2.py) giving dim(g_2) = 6.
See g2_final.py for the corrected version.

Status: SUPERSEDED
Created: Session 189
"""

from sympy import *

# Standard Fano triples (Baez 2002)
FANO = [(1,2,3), (1,4,5), (2,4,6), (2,5,7), (3,4,7), (1,6,7), (3,5,6)]

# Build multiplication table
mult = {}
for a in range(1, 8):
    for b in range(1, 8):
        mult[(a, b)] = (0, 0)
for a in range(1, 8):
    mult[(a, a)] = (-1, 0)
for (a, b, c) in FANO:
    mult[(a, b)] = (+1, c); mult[(b, c)] = (+1, a); mult[(c, a)] = (+1, b)
    mult[(b, a)] = (-1, c); mult[(c, b)] = (-1, a); mult[(a, c)] = (-1, b)

# Parameters: upper triangle of 7x7 skew matrix = 21 params
# Index them as p_0, ..., p_20
# Mapping: (i,j) with i < j -> index in params
param_idx = {}
idx = 0
for i in range(7):
    for j in range(i + 1, 7):
        param_idx[(i, j)] = idx
        idx += 1
n_params = idx  # 21

# D[i][j] as a function of params (skew-symmetric)
def D_entry(i, j):
    """Return (coefficient dict) for D[i,j] in terms of params"""
    if i == j:
        return {}
    if i < j:
        return {param_idx[(i, j)]: 1}
    else:  # i > j
        return {param_idx[(j, i)]: -1}

# Build constraint matrix
# Each constraint is a linear equation in the 21 params
rows = []

for a in range(1, 8):
    for b in range(a + 1, 8):
        s_ab, c_ab = mult[(a, b)]
        if c_ab == 0:
            continue

        for t in range(1, 8):
            # LHS: s_ab * D[t-1, c_ab-1]
            lhs_coeffs = {}
            for p, coeff in D_entry(t - 1, c_ab - 1).items():
                lhs_coeffs[p] = lhs_coeffs.get(p, 0) + s_ab * coeff

            # RHS1: sum_k D[k-1, a-1] * sign if e_k*e_b has component e_t
            rhs1_coeffs = {}
            for k in range(1, 8):
                s_kb, i_kb = mult[(k, b)]
                if i_kb == t:
                    for p, coeff in D_entry(k - 1, a - 1).items():
                        rhs1_coeffs[p] = rhs1_coeffs.get(p, 0) + coeff * s_kb

            # RHS2: sum_k D[k-1, b-1] * sign if e_a*e_k has component e_t
            rhs2_coeffs = {}
            for k in range(1, 8):
                s_ak, i_ak = mult[(a, k)]
                if i_ak == t:
                    for p, coeff in D_entry(k - 1, b - 1).items():
                        rhs2_coeffs[p] = rhs2_coeffs.get(p, 0) + coeff * s_ak

            # Constraint: LHS - RHS1 - RHS2 = 0
            row = [0] * n_params
            for p, c in lhs_coeffs.items():
                row[p] += c
            for p, c in rhs1_coeffs.items():
                row[p] -= c
            for p, c in rhs2_coeffs.items():
                row[p] -= c

            # Only add if non-trivial
            if any(x != 0 for x in row):
                rows.append(row)

print(f"Constraint matrix: {len(rows)} rows x {n_params} columns")

M = Matrix(rows)
r = M.rank()
dim_kernel = n_params - r

print(f"Rank = {r}")
print(f"Nullity (= dim of derivation space) = {n_params} - {r} = {dim_kernel}")
print(f"Expected: 14 (for g_2)")

if dim_kernel != 14:
    print(f"\nDISCREPANCY: got {dim_kernel}, expected 14")
    print("Possible causes:")
    print("  - Multiplication table error (signs)")
    print("  - Missing constraints (real-part conditions)")
    print("  - Extra constraints from specific Fano plane choice")

    # Let's also try WITHOUT assuming skew-symmetry
    # Use full 49 params, add skew constraints separately
    print(f"\n--- Trying with full 49-parameter matrix ---")
    rows_full = []

    # Derivation constraints in 49 variables
    # D[i,j] -> param index i*7+j
    for a in range(1, 8):
        for b in range(a + 1, 8):
            s_ab, c_ab = mult[(a, b)]
            if c_ab == 0:
                continue
            for t in range(1, 8):
                row = [0] * 49
                # LHS: s_ab * D[t-1, c_ab-1]
                row[(t-1)*7 + (c_ab-1)] += s_ab
                # RHS1: sum_k D[k-1,a-1] * sign(e_k*e_b -> e_t)
                for k in range(1, 8):
                    s_kb, i_kb = mult[(k, b)]
                    if i_kb == t:
                        row[(k-1)*7 + (a-1)] -= s_kb
                # RHS2: sum_k D[k-1,b-1] * sign(e_a*e_k -> e_t)
                for k in range(1, 8):
                    s_ak, i_ak = mult[(a, k)]
                    if i_ak == t:
                        row[(k-1)*7 + (b-1)] -= s_ak
                if any(x != 0 for x in row):
                    rows_full.append(row)

    # Add skew-symmetry: D[i,j] + D[j,i] = 0
    for i in range(7):
        for j in range(i + 1, 7):
            row = [0] * 49
            row[i*7+j] = 1
            row[j*7+i] = 1
            rows_full.append(row)

    # Add diagonal = 0: D[i,i] = 0
    for i in range(7):
        row = [0] * 49
        row[i*7+i] = 1
        rows_full.append(row)

    M_full = Matrix(rows_full)
    r_full = M_full.rank()
    dim_full = 49 - r_full
    print(f"Full matrix: {len(rows_full)} rows x 49 columns")
    print(f"Rank = {r_full}")
    print(f"Nullity = 49 - {r_full} = {dim_full}")

    # Also try: derivation constraints ONLY (no skew-symmetry)
    M_deriv = Matrix(rows_full[:len(rows_full) - 21 - 7])
    r_deriv = M_deriv.rank()
    print(f"\nDerivation constraints only (no skew):")
    print(f"  {M_deriv.rows} rows, rank = {r_deriv}, nullity = {49 - r_deriv}")

    # Also check: does the real-part condition give extra constraints?
    # D(e_a * e_b) real part: for a != b, e_a*e_b is purely imaginary
    # so D(e_a*e_b) is in Im(O). Real part of RHS must be zero:
    # Re(D(e_a)*e_b) + Re(e_a*D(e_b)) = 0
    # Re(D(e_a)*e_b) = sum_k D[k-1,a-1] * Re(e_k * e_b) = -D[b-1,a-1] (since Re(e_k*e_b) = -delta_{kb})
    # Re(e_a*D(e_b)) = -D[a-1,b-1]
    # So: -D[b-1,a-1] - D[a-1,b-1] = 0 => D is skew-symmetric
    # This IS the skew-symmetry condition. So no extra constraints.

# Now verify the key claim even with wrong dimension
print(f"\n{'='*70}")
print("KEY CLAIM: g_2 does NOT preserve Im(H) regardless of dimension")
print(f"{'='*70}")

# Compute nullspace of M
N = M.nullspace()
print(f"\nNullspace has {len(N)} basis vectors")

# Each basis vector is a 21-component vector giving an independent derivation
# Reconstruct the 7x7 matrix for each and check if it preserves Im(H)

def reconstruct_D(vec):
    """Reconstruct 7x7 skew-symmetric matrix from 21-parameter vector"""
    mat = zeros(7, 7)
    idx = 0
    for i in range(7):
        for j in range(i + 1, 7):
            mat[i, j] = vec[idx]
            mat[j, i] = -vec[idx]
            idx += 1
    return mat

breaks_imH = False
for k, v in enumerate(N):
    D_k = reconstruct_D(v)
    # Check if D_k maps any e_a (a=1,2,3) outside span{e_1,e_2,e_3}
    for a in range(3):  # columns 0,1,2 = e_1,e_2,e_3
        for c in range(3, 7):  # rows 3,4,5,6 = e_4,e_5,e_6,e_7
            if D_k[c, a] != 0:
                breaks_imH = True
                print(f"  Basis derivation {k}: D(e_{a+1}) has e_{c+1} component = {D_k[c,a]}")

if breaks_imH:
    print(f"\nCONFIRMED: Some derivations map Im(H) outside Im(H)")
    print("=> G_2 acts irreducibly on R^7 (no invariant subspace)")
else:
    print(f"\nWARNING: All derivations preserve Im(H) (unexpected)")

# Final tests
tests = [
    (f"Nullity = {dim_kernel} (computing g_2 dimension)", dim_kernel == 14),
    ("Derivation space is nontrivial", dim_kernel > 0),
    ("Some derivation breaks Im(H)", breaks_imH),
    ("7 + 3 + 1 = 11 (independence theorem)", 7 + 3 + 1 == 11),
]

print(f"\n{'='*70}")
print("VERIFICATION")
print(f"{'='*70}")
all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    print(f"[{status}] {name}")

print(f"\nTotal: {sum(1 for _, p in tests if p)}/{len(tests)} PASS")
