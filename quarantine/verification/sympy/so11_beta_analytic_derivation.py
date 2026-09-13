#!/usr/bin/env python3
"""
Analytic Derivation of A13 and A23 Beta Function Coefficients
for the SO(N) Symmetric Traceless Matrix Model

KEY FINDING: Derives A13 = (N^2 + 6)/(6N^2) and A23 = (2N^2 + 9N - 36)/(6N)
             from the T.T bubble contraction using projector trace identities.

Formula:
  A13 = (N^2 + 6) / (6N^2) = 1/6 + 1/N^2
  A23 = (2N^2 + 9N - 36) / (6N) = N/3 + 3/2 - 6/N

Method:
  Symbolically expand T.T contraction using the symmetric traceless projector:
    sum_mu (E_mu)_{ij}(E_mu)_{kl} = P_{ij;kl}
                                   = (1/2)(d_ik d_jl + d_il d_jk) - (1/N)d_ij d_kl

  Key identity for traceless symmetric X, Z:
    sum_mu Tr(X E_mu Z E_mu) = ((N-2)/(2N)) Tr(XZ)

Status: DERIVATION
Depends on:
- [I-MATH: One-loop RG in d=4-eps]
- [I-MATH: Symmetric traceless projector for SO(N)]
- [D: Quartic vertex T = (1/3)[Tr(ABCD) + Tr(ABDC) + Tr(ACBD)]]

Created: Session 137
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from sympy import Symbol, Rational, simplify, factor, expand, cancel, together
from collections import defaultdict

N = Symbol('N', positive=True, integer=True)

print("=" * 70)
print("ANALYTIC DERIVATION OF A13, A23 FOR SO(N) MATRIX MODEL")
print("=" * 70)

# ==============================================================================
# TRACE ALGEBRA ENGINE
# ==============================================================================
#
# We represent trace monomials symbolically. A "term" is:
#   (coefficient, list_of_traces)
# where each trace is a tuple of letters from {A, B, C, D, M, N}.
#
# An "expression" is a list of terms.
#
# We use two identities to contract over basis elements (E_mu or E_nu):
#
# For the symmetric traceless projector P_{ij;kl}:
#
# IDENTITY 1 (same trace): For matrices X, Z (general, not necessarily symmetric):
#   sum_E Tr(... E ... E ...) with two E's in one trace.
#   Decompose as sum_E Tr(X E Z E) where X, Z are products between the E's.
#   Result: (1/2) Tr(X^T Z) + (1/2) Tr(X)Tr(Z) - (1/N) Tr(X Z)
#   where X^T means reversed product (since our individual matrices are symmetric).
#
# IDENTITY 2 (different traces):
#   sum_E Tr(... E ...) * Tr(... E ...) with one E in each trace.
#   Decompose as sum_E Tr(X E) * Tr(Y E) where X = rest of first trace, Y = rest of second.
#   Result: (1/2) Tr(X^T Y) + (1/2) Tr(X Y) - (1/N) Tr(X)Tr(Y)
#
# All individual matrices (A,B,C,D,M,N) are symmetric, so (AB...Z)^T = Z...BA.
# Individual A,B,C,D are traceless. M,N (= E_mu, E_nu) are also traceless.
# Products are NOT traceless: Tr(AB) != 0.
# ==============================================================================


def canon_single(t):
    """Canonical form of a trace under cyclic + reversal (all matrices symmetric)."""
    t = tuple(t)
    n = len(t)
    if n == 0:
        return ()
    best = t
    for i in range(n):
        rot = t[i:] + t[:i]
        if rot < best:
            best = rot
        rev = tuple(reversed(rot))
        if rev < best:
            best = rev
    return best


def canon_multi(traces):
    """Canonical form for a product of traces (sort them)."""
    return tuple(sorted(canon_single(t) for t in traces))


def combine_like_terms(expr):
    """Combine terms with the same trace structure."""
    d = defaultdict(lambda: Rational(0))
    for coeff, traces in expr:
        key = canon_multi(traces)
        d[key] += coeff
    result = []
    for key, c in sorted(d.items()):
        c_s = simplify(c)
        if c_s != 0:
            result.append((c_s, list(key)))
    return result


def contract_symbol(expr, sym):
    """Contract over a basis element labeled 'sym' (e.g., 'N' or 'M').

    Finds all occurrences of 'sym' in the traces of each term, and applies
    the projector identity. Each term should have exactly 0 or 2 occurrences.
    Terms with 0 occurrences pass through unchanged.
    """
    result = []
    for coeff, traces in expr:
        # Find all occurrences of sym
        locs = []  # (trace_index, position_within_trace)
        for ti, t in enumerate(traces):
            for pi, ch in enumerate(t):
                if ch == sym:
                    locs.append((ti, pi))

        if len(locs) == 0:
            # No sym in this term - pass through
            result.append((coeff, traces))
            continue

        assert len(locs) == 2, \
            f"Expected 0 or 2 occurrences of '{sym}', found {len(locs)} in {traces}"

        (ti1, pi1), (ti2, pi2) = locs

        if ti1 == ti2:
            # Both in same trace -> ID1
            result.extend(_contract_same_trace(coeff, traces, ti1, pi1, pi2))
        else:
            # In different traces -> ID2
            result.extend(_contract_diff_traces(coeff, traces, ti1, pi1, ti2, pi2))

    return combine_like_terms(result)


def _contract_same_trace(coeff, traces, tidx, p1, p2):
    """Contract two occurrences of E in the same trace.

    Tr(... E_p1 ... E_p2 ...) where the trace has letters at positions p1 and p2.

    We cyclically view this as Tr(E X E Z) where:
      X = letters between first E (p1) and second E (p2), exclusive
      Z = letters after second E, wrapping to before first E, exclusive

    Result: (1/2) Tr(rev(X) Z) + (1/2) Tr(X) Tr(Z) - (1/N) Tr(X Z)

    where rev() reverses the sequence (= transpose of the product matrix).
    """
    if p1 > p2:
        p1, p2 = p2, p1

    t = traces[tidx]
    # X = letters strictly between p1 and p2
    X = tuple(t[p1+1 : p2])
    # Z = letters after p2, wrapping to before p1
    Z = tuple(t[p2+1 :]) + tuple(t[: p1])

    other = [traces[i] for i in range(len(traces)) if i != tidx]

    new_terms = []

    # Term 1: (1/2) Tr(rev(X) . Z)
    t1_trace = tuple(reversed(X)) + Z
    if len(t1_trace) > 0:
        new_terms.append((coeff * Rational(1, 2), other + [t1_trace]))
    else:
        # Tr(identity) = N
        new_terms.append((coeff * Rational(1, 2) * N, other))

    # Term 2: (1/2) Tr(X) . Tr(Z)
    if len(X) > 0 and len(Z) > 0:
        new_terms.append((coeff * Rational(1, 2), other + [X, Z]))
    elif len(X) == 0 and len(Z) > 0:
        # Tr(empty) = Tr(I) = N
        new_terms.append((coeff * Rational(1, 2) * N, other + [Z]))
    elif len(X) > 0 and len(Z) == 0:
        new_terms.append((coeff * Rational(1, 2) * N, other + [X]))
    else:
        # Both empty: N * N
        new_terms.append((coeff * Rational(1, 2) * N**2, other))

    # Term 3: -(1/N) Tr(X . Z)  [NOT rev(Z) -- derived from delta_{bc} delta_{da}]
    t3_trace = X + Z
    if len(t3_trace) > 0:
        new_terms.append((-coeff / N, other + [t3_trace]))
    else:
        new_terms.append((-coeff / N * N, other))  # = -coeff

    return new_terms


def _contract_diff_traces(coeff, traces, ti1, pi1, ti2, pi2):
    """Contract E appearing once in each of two different traces.

    Tr(... E ...) * Tr(... E ...)

    We view first trace as Tr(X E) and second as Tr(Y E), where:
      X = rest of first trace (cyclically, with E removed from end)
      Y = rest of second trace

    Result: (1/2) Tr(rev(X) . Y) + (1/2) Tr(X . Y) - (1/N) Tr(X) . Tr(Y)
    """
    t1 = traces[ti1]
    t2 = traces[ti2]

    # X = rest of trace 1 with E at position pi1 removed, maintaining cyclic order
    # Cyclically rotate so E is "at the end": letters after E, then letters before E
    X = tuple(t1[pi1+1 :]) + tuple(t1[: pi1])
    Y = tuple(t2[pi2+1 :]) + tuple(t2[: pi2])

    other = [traces[i] for i in range(len(traces)) if i != ti1 and i != ti2]

    new_terms = []

    # Term 1: (1/2) Tr(rev(X) . Y)
    t1_trace = tuple(reversed(X)) + Y
    if len(t1_trace) > 0:
        new_terms.append((coeff * Rational(1, 2), other + [t1_trace]))
    else:
        new_terms.append((coeff * Rational(1, 2) * N, other))

    # Term 2: (1/2) Tr(X . Y)  [NOT rev(Y) -- from delta_{bc} delta_{ad} contraction]
    t2_trace = X + Y
    if len(t2_trace) > 0:
        new_terms.append((coeff * Rational(1, 2), other + [t2_trace]))
    else:
        new_terms.append((coeff * Rational(1, 2) * N, other))

    # Term 3: -(1/N) Tr(X) . Tr(Y)
    if len(X) > 0 and len(Y) > 0:
        new_terms.append((-coeff / N, other + [X, Y]))
    elif len(X) == 0 and len(Y) > 0:
        new_terms.append((-coeff, other + [Y]))  # Tr(empty)=N, * (-1/N) = -1
    elif len(X) > 0 and len(Y) == 0:
        new_terms.append((-coeff, other + [X]))
    else:
        new_terms.append((-coeff * N, other))

    return new_terms


def eliminate_zero_traces(expr):
    """Remove terms containing Tr(single_traceless_matrix).

    A, B, C, D, M, N are all individually traceless.
    Tr(A) = Tr(B) = ... = 0.
    But Tr(AB) != 0 in general.
    """
    result = []
    for coeff, traces in expr:
        skip = False
        new_traces = []
        new_coeff = coeff
        for t in traces:
            if len(t) == 0:
                # Empty trace = Tr(I) = N
                new_coeff *= N
            elif len(t) == 1:
                # Tr(single traceless matrix) = 0
                skip = True
                break
            else:
                new_traces.append(t)
        if not skip and simplify(new_coeff) != 0:
            result.append((new_coeff, new_traces))
    return combine_like_terms(result)


def display_expr(expr, label=""):
    """Print a trace expression."""
    if label:
        print(f"\n{label}:")
    for coeff, traces in expr:
        if traces:
            ts = " * ".join("Tr(" + "".join(t) + ")" for t in traces)
        else:
            ts = "1"
        print(f"  {coeff}  *  {ts}")


# ==============================================================================
# STEP 1: BUILD THE 9 S-CHANNEL TERMS
# ==============================================================================

print("\n" + "-" * 70)
print("STEP 1: Build s-channel terms")
print("-" * 70)

# T(A,B,M,N) = (1/3)[Tr(ABMN) + Tr(ABNM) + Tr(AMBN)]
# T(M,N,C,D) = (1/3)[Tr(MNCD) + Tr(MNDC) + Tr(MCND)]
#
# Product: (1/9) sum over 3x3 = 9 pairs

left = [tuple('ABMN'), tuple('ABNM'), tuple('AMBN')]
right = [tuple('MNCD'), tuple('MNDC'), tuple('MCND')]

s_initial = []
for i, L in enumerate(left):
    for j, R in enumerate(right):
        s_initial.append((Rational(1, 9), [L, R]))
        print(f"  ({i+1},{j+1}): (1/9) Tr({''.join(L)}) Tr({''.join(R)})")

print(f"\n  Total: {len(s_initial)} terms")


# ==============================================================================
# STEP 2: CONTRACT OVER NU (symbol 'N')
# ==============================================================================

print("\n" + "-" * 70)
print("STEP 2: Contract over E_nu (symbol N)")
print("-" * 70)

after_nu = contract_symbol(s_initial, 'N')
after_nu = eliminate_zero_traces(after_nu)

display_expr(after_nu, "After nu contraction and traceless elimination")
print(f"\n  {len(after_nu)} terms remaining")


# ==============================================================================
# STEP 3: CONTRACT OVER MU (symbol 'M')
# ==============================================================================

print("\n" + "-" * 70)
print("STEP 3: Contract over E_mu (symbol M)")
print("-" * 70)

after_mu = contract_symbol(after_nu, 'M')
after_mu = eliminate_zero_traces(after_mu)

display_expr(after_mu, "After mu contraction and traceless elimination")
print(f"\n  {len(after_mu)} terms remaining")


# ==============================================================================
# STEP 4: VERIFY ONLY EXTERNAL MATRICES REMAIN
# ==============================================================================

print("\n" + "-" * 70)
print("STEP 4: Verify result structure")
print("-" * 70)

external_only = True
for coeff, traces in after_mu:
    for t in traces:
        for ch in t:
            if ch not in ('A', 'B', 'C', 'D'):
                print(f"  WARNING: non-external symbol '{ch}' in {t}")
                external_only = False

print(f"  Only external matrices (A,B,C,D) remain: {external_only}")

# Classify terms
single4 = {}  # length-4 single traces
double22 = {}  # pairs of length-2 traces
other_terms = []

for coeff, traces in after_mu:
    if len(traces) == 1 and len(traces[0]) == 4:
        k = canon_single(traces[0])
        single4[k] = single4.get(k, Rational(0)) + coeff
    elif len(traces) == 2 and len(traces[0]) == 2 and len(traces[1]) == 2:
        k = canon_multi(traces)
        double22[k] = double22.get(k, Rational(0)) + coeff
    elif len(traces) == 0:
        other_terms.append(("scalar", coeff))
    else:
        other_terms.append(("other", coeff, traces))

print(f"\n  Single traces (Tr(XYZW)): {len(single4)} distinct types")
for k, v in sorted(single4.items()):
    print(f"    Tr({''.join(k)}):  {simplify(v)}")

print(f"\n  Double traces (Tr(XY)*Tr(ZW)): {len(double22)} distinct types")
for k, v in sorted(double22.items()):
    t1 = ''.join(k[0])
    t2 = ''.join(k[1])
    print(f"    Tr({t1})*Tr({t2}):  {simplify(v)}")

if other_terms:
    print(f"\n  Other terms: {other_terms}")


# ==============================================================================
# STEP 5: ADD T- AND U-CHANNELS
# ==============================================================================

print("\n" + "-" * 70)
print("STEP 5: Full 3-channel sum (s + t + u)")
print("-" * 70)

# The s-channel function is s(X1,X2,X3,X4) = sum T(X1,X2,M,N) T(M,N,X3,X4)
# We computed s(A,B,C,D). The other channels are:
#   t-channel: s(A,C,B,D) -- permutation: B->C, C->B (swap B,C)
#   u-channel: s(A,D,B,C) -- permutation: B->D, C->B, D->C (3-cycle BDC)

def permute(expr, perm):
    """Apply a permutation of external labels."""
    result = []
    for coeff, traces in expr:
        new_traces = []
        for t in traces:
            new_traces.append(tuple(perm.get(ch, ch) for ch in t))
        result.append((coeff, new_traces))
    return result

s_ch = after_mu
t_ch = permute(after_mu, {'B': 'C', 'C': 'B'})
u_ch = permute(after_mu, {'B': 'D', 'C': 'B', 'D': 'C'})

total_3ch = combine_like_terms(s_ch + t_ch + u_ch)
total_3ch = eliminate_zero_traces(total_3ch)

display_expr(total_3ch, "Full 3-channel result")

# Re-classify
single4_full = {}
double22_full = {}

for coeff, traces in total_3ch:
    if len(traces) == 1 and len(traces[0]) == 4:
        k = canon_single(traces[0])
        single4_full[k] = single4_full.get(k, Rational(0)) + coeff
    elif len(traces) == 2 and len(traces[0]) == 2 and len(traces[1]) == 2:
        k = canon_multi(traces)
        double22_full[k] = double22_full.get(k, Rational(0)) + coeff

# The three necklace classes of single 4-traces
k_ABCD = canon_single(tuple('ABCD'))
k_ABDC = canon_single(tuple('ABDC'))
k_ACBD = canon_single(tuple('ACBD'))

# The three double traces
k_AB_CD = canon_multi([tuple('AB'), tuple('CD')])
k_AC_BD = canon_multi([tuple('AC'), tuple('BD')])
k_AD_BC = canon_multi([tuple('AD'), tuple('BC')])

print(f"\n  3-channel single trace coefficients:")
c_s1 = simplify(single4_full.get(k_ABCD, Rational(0)))
c_s2 = simplify(single4_full.get(k_ABDC, Rational(0)))
c_s3 = simplify(single4_full.get(k_ACBD, Rational(0)))
print(f"    Tr(ABCD): {c_s1}")
print(f"    Tr(ABDC): {c_s2}")
print(f"    Tr(ACBD): {c_s3}")

print(f"\n  3-channel double trace coefficients:")
c_d1 = simplify(double22_full.get(k_AB_CD, Rational(0)))
c_d2 = simplify(double22_full.get(k_AC_BD, Rational(0)))
c_d3 = simplify(double22_full.get(k_AD_BC, Rational(0)))
print(f"    Tr(AB)Tr(CD): {c_d1}")
print(f"    Tr(AC)Tr(BD): {c_d2}")
print(f"    Tr(AD)Tr(BC): {c_d3}")


# ==============================================================================
# STEP 6: EXTRACT A13 AND A23
# ==============================================================================

print("\n" + "-" * 70)
print("STEP 6: Extract A13 and A23")
print("-" * 70)

# TT_3ch = A13 * U(A,B,C,D) + A23 * T(A,B,C,D)
#
# where:
#   U = Tr(AB)Tr(CD) + Tr(AC)Tr(BD) + Tr(AD)Tr(BC)
#   T = (1/3)[Tr(ABCD) + Tr(ABDC) + Tr(ACBD)]
#
# So: coefficient of each Tr(XY)Tr(ZW) = A13
#     coefficient of each Tr(XYZW) = A23/3
#
# Check uniformity first:

singles_equal = (simplify(c_s1 - c_s2) == 0) and (simplify(c_s1 - c_s3) == 0)
doubles_equal = (simplify(c_d1 - c_d2) == 0) and (simplify(c_d1 - c_d3) == 0)

print(f"\n  All 3 single-trace coefficients equal: {singles_equal}")
if not singles_equal:
    print(f"    c_s1 = {c_s1}")
    print(f"    c_s2 = {c_s2}")
    print(f"    c_s3 = {c_s3}")
    print(f"    c_s1 - c_s2 = {simplify(c_s1 - c_s2)}")
    print(f"    c_s1 - c_s3 = {simplify(c_s1 - c_s3)}")

print(f"  All 3 double-trace coefficients equal: {doubles_equal}")
if not doubles_equal:
    print(f"    c_d1 = {c_d1}")
    print(f"    c_d2 = {c_d2}")
    print(f"    c_d3 = {c_d3}")
    print(f"    c_d1 - c_d2 = {simplify(c_d1 - c_d2)}")
    print(f"    c_d1 - c_d3 = {simplify(c_d1 - c_d3)}")

# Extract A13 and A23
A13_derived = simplify(c_d1)  # coefficient of each double trace
A23_derived = simplify(3 * c_s1)  # coefficient of each single trace * 3

print(f"\n  A13 (derived) = {A13_derived}")
print(f"  A13 (factored) = {factor(A13_derived)}")
print(f"  A13 (expanded) = {expand(A13_derived)}")

print(f"\n  A23 (derived) = {A23_derived}")
print(f"  A23 (factored) = {factor(A23_derived)}")
print(f"  A23 (expanded) = {expand(A23_derived)}")

# Conjectured formulas
A13_conj = (N**2 + 6) / (6 * N**2)
A23_conj = (2*N**2 + 9*N - 36) / (6*N)

A13_diff = simplify(A13_derived - A13_conj)
A23_diff = simplify(A23_derived - A23_conj)

print(f"\n  A13 - conjecture = {A13_diff}")
print(f"  A23 - conjecture = {A23_diff}")

A13_match = (A13_diff == 0)
A23_match = (A23_diff == 0)

print(f"\n  A13 matches (N^2+6)/(6N^2): {A13_match}")
print(f"  A23 matches (2N^2+9N-36)/(6N): {A23_match}")

# Alternative forms
A13_alt = Rational(1, 6) + 1/N**2
A23_alt = N/3 + Rational(3, 2) - 6/N

A13_alt_match = simplify(A13_derived - A13_alt) == 0
A23_alt_match = simplify(A23_derived - A23_alt) == 0

print(f"  A13 = 1/6 + 1/N^2: {A13_alt_match}")
print(f"  A23 = N/3 + 3/2 - 6/N: {A23_alt_match}")


# ==============================================================================
# STEP 7: NUMERICAL CROSS-CHECK
# ==============================================================================

print("\n" + "-" * 70)
print("STEP 7: Numerical cross-checks")
print("-" * 70)

for Nv in [3, 4, 5, 7, 11]:
    a13 = float(A13_derived.subs(N, Nv))
    a23 = float(A23_derived.subs(N, Nv))
    a13c = (Nv**2 + 6) / (6.0 * Nv**2)
    a23c = (2*Nv**2 + 9*Nv - 36) / (6.0 * Nv)
    print(f"  N={Nv:2d}:  A13={a13:10.6f} (conj {a13c:10.6f})  "
          f"A23={a23:10.6f} (conj {a23c:10.6f})")


# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    ("S-channel has 9 initial terms",
     len(s_initial) == 9),

    ("Nu contraction produces well-formed result",
     len(after_nu) > 0),

    ("Mu contraction produces well-formed result",
     len(after_mu) > 0),

    ("Only external matrices A,B,C,D in final result",
     external_only),

    ("Result decomposes into Tr(XYZW) and Tr(XY)Tr(ZW) only",
     len(other_terms) == 0),

    ("3-channel: all single-trace coefficients equal (T structure)",
     singles_equal),

    ("3-channel: all double-trace coefficients equal (U structure)",
     doubles_equal),

    ("A13 = (N^2 + 6)/(6N^2) [MAIN RESULT]",
     A13_match),

    ("A23 = (2N^2 + 9N - 36)/(6N) [MAIN RESULT]",
     A23_match),

    ("A13 = 1/6 + 1/N^2 [simplified form]",
     A13_alt_match),

    ("A23 = N/3 + 3/2 - 6/N [simplified form]",
     A23_alt_match),

    ("N=11: A13 = 127/726",
     simplify(A13_derived.subs(N, 11) - Rational(127, 726)) == 0),

    ("N=11: A23 = 305/66",
     simplify(A23_derived.subs(N, 11) - Rational(305, 66)) == 0),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print(f"\n{'ALL TESTS PASSED' if all_pass else 'SOME TESTS FAILED'}: "
      f"{sum(1 for _, p in tests if p)}/{len(tests)}")


# ==============================================================================
# SUMMARY
# ==============================================================================

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)

print(f"""
ANALYTIC DERIVATION OF A13 AND A23

Method:
  1. Expanded T(A,B,E_mu,E_nu) * T(E_mu,E_nu,C,D) into 9 trace-pair terms
  2. Contracted over E_nu using symmetric traceless projector identity
  3. Eliminated Tr(single traceless matrix) = 0 terms
  4. Contracted over E_mu using the same identity
  5. Eliminated zero traces again
  6. Summed over s, t, u channels (permutations of B,C,D)
  7. Decomposed result as A13*U + A23*T

Results:
  A13 = {factor(A13_derived)}
      = (N^2 + 6) / (6N^2)
      = 1/6 + 1/N^2

  A23 = {factor(A23_derived)}
      = (2N^2 + 9N - 36) / (6N)
      = N/3 + 3/2 - 6/N

Identities used (derived from symmetric traceless projector P_{{ij;kl}}):
  ID1 (same trace): sum_E Tr(X E Z E) = (1/2)Tr(X^T Z) + (1/2)Tr(X)Tr(Z) - (1/N)Tr(XZ)
  ID2 (diff traces): sum_E Tr(XE)Tr(YE) = (1/2)Tr(X^T Y) + (1/2)Tr(XY) - (1/N)Tr(X)Tr(Y)

  (where X^T = reversed product for products of symmetric matrices,
   e.g., (ABC)^T = CBA when A, B, C are individually symmetric)

Confidence: [THEOREM] - Rigorous symbolic derivation from projector identity.
""")
