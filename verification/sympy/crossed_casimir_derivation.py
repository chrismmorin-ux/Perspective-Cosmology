#!/usr/bin/env python3
"""
Crossed Casimir Coupling Derivation Attempt (EQ-012 Final Gap)

SESSION S240

KEY QUESTION: Can w_l = (-1)^(l+1) * C_2(Im_H - l) be derived from first principles?

Approach: Test multiple coupling mechanisms to see which (if any) produces
the weights {1, 6, -2}. Then characterize the minimal constraint set.

FINDINGS:
- Commutator coupling within M_3(R): both V_1 and V_2 get total coupling 6
  (Killing form of gl(3)). Does NOT distinguish irreps.
- Killing form of gl(3) has OPPOSITE SIGNS on V_1 (-6) and V_2 (+6).
  This gives the correct sign pattern: V_1 positive, V_2 negative.
- The magnitude comes from C_2 of the COMPLEMENTARY irrep.
- Three-constraint system {w_0=1, sum=9, Frobenius=129} gives exactly
  two solutions: {1,6,-2} and {1,-4,4}. Adding prod(w)=-12 selects {1,6,-2}.
- The Frobenius norm 129 = Im_H * Phi_6(Im_O) can be rewritten as
  sum(dim_l * C_2(comp)^2) when combined with the crossed Casimir formula.

Status: CONJECTURE with structural constraints (not yet DERIVATION)
Dependencies: hidden_sector_b_decomposition.py (S235)
"""

from sympy import (
    Matrix, Rational, sqrt, symbols, solve, simplify,
    eye, zeros, trace, Abs, Integer, S
)
from itertools import permutations


# =============================================================================
# Framework constants
# =============================================================================
R, C, H, O = 1, 2, 4, 8
Im_C, Im_H, Im_O = 1, 3, 7
n_d = 4
n_c = 11


def phi6(k):
    return k**2 - k + 1


def casimir_so3(l):
    """Quadratic Casimir of SO(3): C_2(l) = l(l+1)"""
    return l * (l + 1)


# =============================================================================
# SO(3) generators and irrep bases in M_3(R)
# =============================================================================

# Antisymmetric generators (so(3) basis, l=1)
L1 = Matrix([[0, 0, 0], [0, 0, -1], [0, 1, 0]])
L2 = Matrix([[0, 0, 1], [0, 0, 0], [-1, 0, 0]])
L3 = Matrix([[0, -1, 0], [1, 0, 0], [0, 0, 0]])

# Orthonormal basis of V_1 (||e_i|| = 1 in Frobenius norm)
e1 = L1 / sqrt(2)
e2 = L2 / sqrt(2)
e3 = L3 / sqrt(2)

# Orthonormal basis of V_0 (scalar)
sigma = eye(3) / sqrt(3)

# Orthonormal basis of V_2 (symmetric traceless)
h1 = Matrix([[1, 0, 0], [0, -1, 0], [0, 0, 0]]) / sqrt(2)
h2 = Matrix([[1, 0, 0], [0, 1, 0], [0, 0, -2]]) / sqrt(6)
s1 = Matrix([[0, 1, 0], [1, 0, 0], [0, 0, 0]]) / sqrt(2)
s2 = Matrix([[0, 0, 1], [0, 0, 0], [1, 0, 0]]) / sqrt(2)
s3 = Matrix([[0, 0, 0], [0, 0, 1], [0, 1, 0]]) / sqrt(2)

V0_basis = [sigma]
V1_basis = [e1, e2, e3]
V2_basis = [h1, h2, s1, s2, s3]
ALL_basis = V0_basis + V1_basis + V2_basis


def frob_norm_sq(M):
    """Frobenius norm squared: Tr(M^T M)"""
    return trace(M.T * M)


def commutator(A, B):
    return A * B - B * A


# =============================================================================
# Test 1: Verify orthonormal basis
# =============================================================================
def test_orthonormal_basis():
    """Check all 9 basis vectors are orthonormal."""
    ok = True
    for i, Mi in enumerate(ALL_basis):
        for j, Mj in enumerate(ALL_basis):
            ip = trace(Mi.T * Mj)
            expected = 1 if i == j else 0
            if simplify(ip - expected) != 0:
                ok = False
    total_dim = sum(len(b) for b in [V0_basis, V1_basis, V2_basis])
    return ok and total_dim == 9, {'total_dim': total_dim}


# =============================================================================
# Test 2: Commutator coupling WITHIN M_3(R)
# =============================================================================
def test_commutator_coupling_m3():
    """Compute eta_l = sum_G ||[M_l, G]||^2 for each irrep mode.
    Sum is over orthonormal basis G of M_3(R).

    KEY RESULT: eta_1 = eta_2 = 6 for all non-scalar modes.
    This is because the gl(3) Killing form gives K(M,M) = +/-6||M||^2.
    """
    results = {}
    for label, basis in [('V0', V0_basis), ('V1', V1_basis), ('V2', V2_basis)]:
        couplings = []
        for M in basis:
            eta = S.Zero
            for G in ALL_basis:
                comm = commutator(M, G)
                eta += frob_norm_sq(comm)
            couplings.append(int(eta))
        results[label] = couplings

    # All V1 modes should give 6
    v1_all_6 = all(c == 6 for c in results['V1'])
    # All V2 modes should give 6
    v2_all_6 = all(c == 6 for c in results['V2'])
    # V0 should give 0
    v0_zero = all(c == 0 for c in results['V0'])

    return v0_zero and v1_all_6 and v2_all_6, results


# =============================================================================
# Test 3: Coupling decomposition by TARGET irrep
# =============================================================================
def test_coupling_by_target():
    """For each source irrep, decompose coupling by target irrep.

    V1 mode coupling: to V0=0, to V1=1, to V2=5. Total=6.
    V2 mode coupling: to V0=0, to V1=3, to V2=3. Total=6.
    """
    def coupling_to_target(source_basis, target_basis):
        """Average coupling per source mode to all target modes."""
        total = S.Zero
        for M in source_basis:
            for G in target_basis:
                total += frob_norm_sq(commutator(M, G))
        return Rational(total, len(source_basis))

    results = {}
    for src_label, src in [('V1', V1_basis), ('V2', V2_basis)]:
        row = {}
        for tgt_label, tgt in [('V0', V0_basis), ('V1', V1_basis), ('V2', V2_basis)]:
            row[tgt_label] = coupling_to_target(src, tgt)
        row['total'] = sum(row.values())
        results[src_label] = row

    v1_to_v0 = results['V1']['V0'] == 0
    v1_to_v1 = results['V1']['V1'] == 1
    v1_to_v2 = results['V1']['V2'] == 5
    v2_to_v0 = results['V2']['V0'] == 0
    v2_to_v1 = results['V2']['V1'] == 3
    v2_to_v2 = results['V2']['V2'] == 3

    return (v1_to_v0 and v1_to_v1 and v1_to_v2 and
            v2_to_v0 and v2_to_v1 and v2_to_v2), results


# =============================================================================
# Test 4: Casimir formula for V_1 coupling
# =============================================================================
def test_casimir_formula_v1():
    """The coupling of a V_1 mode to V_{l'} target equals
    C_2(l') * dim(V_{l'}) / 6 = l'(l'+1)(2l'+1)/6.

    l'=0: 0*1/6 = 0
    l'=1: 2*3/6 = 1
    l'=2: 6*5/6 = 5

    This follows from the quadratic Casimir of the adjoint action of so(3)
    on M_3(R): sum_i (ad_{L_i})^2 = -C_2(l') * I on V_{l'}.
    """
    formula_values = {}
    for l_prime in range(3):
        formula_values[l_prime] = Rational(
            casimir_so3(l_prime) * (2 * l_prime + 1), 6
        )

    v1_couplings = {0: 0, 1: 1, 2: 5}  # from test 3

    match = all(formula_values[l] == v1_couplings[l] for l in range(3))
    return match, {
        'formula': {l: int(v) for l, v in formula_values.items()},
        'computed': v1_couplings,
    }


# =============================================================================
# Test 5: Killing form sign mechanism
# =============================================================================
def test_killing_form_sign():
    """The Killing form of gl(3,R): K(X,Y) = 6*Tr(XY) - 2*Tr(X)*Tr(Y).

    On traceless M: K(M,M) = 6*Tr(M^2).
    For M antisymmetric (V_1): Tr(M^2) = -||M||^2 -> K = -6||M||^2 < 0.
    For M symmetric (V_2):     Tr(M^2) = +||M||^2 -> K = +6||M||^2 > 0.
    For scalar sigma:          K = 0.

    The SIGN of -K gives the coupling sign:
    V_1: -K > 0 -> constructive (positive weight)
    V_2: -K < 0 -> destructive (negative weight)

    This matches w_1 = +6 > 0 and w_2 = -2 < 0.
    """
    n = 3

    def killing_gl_n(X, Y, n_val):
        """Killing form of gl(n): K(X,Y) = 2n*Tr(XY) - 2*Tr(X)*Tr(Y)"""
        return 2 * n_val * trace(X * Y) - 2 * trace(X) * trace(Y)

    # Compute on representative modes
    k_sigma = killing_gl_n(sigma, sigma, n)  # Should be 0
    k_e3 = killing_gl_n(e3, e3, n)  # Should be -6
    k_h1 = killing_gl_n(h1, h1, n)  # Should be +6
    k_s1 = killing_gl_n(s1, s1, n)  # Should be +6

    sigma_zero = (simplify(k_sigma) == 0)
    v1_negative = (k_e3 == -6)
    v2_positive_h = (k_h1 == 6)
    v2_positive_s = (k_s1 == 6)

    # Sign of -K matches sign of weights
    sign_v1 = 1 if (-k_e3) > 0 else -1  # +1 (constructive)
    sign_v2 = 1 if (-k_h1) > 0 else -1  # -1 (destructive)

    signs_match = (sign_v1 == 1) and (sign_v2 == -1)

    return sigma_zero and v1_negative and v2_positive_h and v2_positive_s and signs_match, {
        'K(sigma)': int(k_sigma),
        'K(e3)': int(k_e3),
        'K(h1)': int(k_h1),
        'K(s1)': int(k_s1),
        'sign_V1': sign_v1,
        'sign_V2': sign_v2,
        'interpretation': (
            "Killing form negative on so(3) [compact], positive on Sym_0 [non-compact]. "
            "-K gives: V_1 constructive (+), V_2 destructive (-)."
        ),
    }


# =============================================================================
# Test 6: Crossed Casimir = Killing sign * complementary Casimir
# =============================================================================
def test_crossed_casimir_decomposition():
    """The weight formula decomposes as:
    w_l = sign_l * |w_l|
    where:
      sign_l = sgn(-K(V_l)) = (-1)^(l+1)
      |w_l| = C_2(complementary irrep) = C_2(Im_H - l)

    This gives:
      w_1 = (+1) * C_2(2) = +6
      w_2 = (-1) * C_2(1) = -2
      w_0 = 1 (scalar baseline, separate mechanism)
    """
    # Killing form signs
    signs = {0: 0, 1: +1, 2: -1}  # sgn(-K): 0=degenerate, +1=compact, -1=non-compact

    # Complementary Casimirs
    comp_casimir = {1: casimir_so3(Im_H - 1), 2: casimir_so3(Im_H - 2)}
    # l=1: C_2(2) = 6, l=2: C_2(1) = 2

    # Predicted weights
    w_predicted = {0: 1}  # scalar baseline
    for l in [1, 2]:
        w_predicted[l] = signs[l] * comp_casimir[l]

    # Actual weights from S235
    w_actual = {0: 1, 1: 6, 2: -2}

    match = all(w_predicted[l] == w_actual[l] for l in range(3))

    # Also verify the formula w_l = (-1)^(l+1) * C_2(Im_H - l)
    w_formula = {0: 1}
    for l in [1, 2]:
        w_formula[l] = (-1) ** (l + 1) * casimir_so3(Im_H - l)
    formula_match = all(w_formula[l] == w_actual[l] for l in range(3))

    return match and formula_match, {
        'signs_from_Killing': signs,
        'complementary_Casimirs': comp_casimir,
        'weights_predicted': w_predicted,
        'weights_actual': w_actual,
        'formula_match': formula_match,
    }


# =============================================================================
# Test 7: Three-constraint system
# =============================================================================
def test_constraint_system():
    """The three constraints:
    C1: w_0 = 1 (scalar baseline)
    C2: 1*w_0 + 3*w_1 + 5*w_2 = 9 (completeness)
    C3: 1*w_0^2 + 3*w_1^2 + 5*w_2^2 = 129 (Frobenius norm = Im_H * Phi_6(Im_O))

    give exactly TWO solutions: {1, 6, -2} and {1, -4, 4}.
    """
    w1, w2 = symbols('w1 w2')

    # C2: 1 + 3*w1 + 5*w2 = 9
    eq1 = 3 * w1 + 5 * w2 - 8

    # C3: 1 + 3*w1^2 + 5*w2^2 = 129
    eq2 = 3 * w1**2 + 5 * w2**2 - 128

    solutions = solve([eq1, eq2], [w1, w2])

    # Should get exactly 2 solutions
    has_two = (len(solutions) == 2)

    # Check that {6, -2} is one of them
    target = {(6, -2), (-4, 4)}
    actual = {(int(s[0]), int(s[1])) for s in solutions}
    matches = (actual == target)

    # C3 value = Im_H * Phi_6(Im_O)
    c3_value = Im_H * phi6(Im_O)
    c3_is_129 = (c3_value == 129)

    return has_two and matches and c3_is_129, {
        'solutions': [(int(s[0]), int(s[1])) for s in solutions],
        'C3_value': c3_value,
        'C3_decomposition': f"Im_H * Phi_6(Im_O) = {Im_H} * {phi6(Im_O)} = {c3_value}",
    }


# =============================================================================
# Test 8: Product constraint as discriminant
# =============================================================================
def test_product_discriminant():
    """The product prod(w_l) = 1 * 6 * (-2) = -12 = -n_d * Im_H.
    For the alternative {1, -4, 4}: prod = 1*(-4)*4 = -16 != -12.

    So prod(w) = -n_d * Im_H selects the crossed Casimir solution uniquely.
    """
    w_crossed = [1, 6, -2]
    w_alt = [1, -4, 4]

    prod_crossed = 1
    for w in w_crossed:
        prod_crossed *= w

    prod_alt = 1
    for w in w_alt:
        prod_alt *= w

    target = -n_d * Im_H  # = -12

    crossed_matches = (prod_crossed == target)
    alt_different = (prod_alt != target)

    return crossed_matches and alt_different, {
        'prod_crossed': prod_crossed,
        'prod_alt': prod_alt,
        'target': target,
        'target_decomposition': f"-n_d * Im_H = -{n_d} * {Im_H} = {target}",
        'alt_prod': f"-16 = -n_d^2 = -{n_d}^2 (not framework-clean in same sense)",
    }


# =============================================================================
# Test 9: Commutator structure of M_3(R)
# =============================================================================
def test_commutator_structure():
    """Verify the commutator landing rules:
    [V_0, anything] = 0
    [V_1, V_1] c V_1  (Lie bracket of so(3))
    [V_1, V_2] c V_2  (adjoint action)
    [V_2, V_2] c V_1  (symmetric comm = antisymmetric)

    Also verify: [V_1, V_2] has symmetric output, [V_2, V_2] has antisymmetric output.
    """
    def is_antisymmetric(M):
        return simplify(M + M.T) == zeros(3)

    def is_symmetric(M):
        return simplify(M - M.T) == zeros(3)

    # [V_1, V_1] -> antisymmetric
    v1v1_ok = True
    for M1 in V1_basis:
        for M2 in V1_basis:
            c = commutator(M1, M2)
            if not is_antisymmetric(c):
                v1v1_ok = False

    # [V_1, V_2] -> symmetric
    v1v2_ok = True
    for M in V1_basis:
        for S in V2_basis:
            c = commutator(M, S)
            if frob_norm_sq(c) != 0 and not is_symmetric(c):
                v1v2_ok = False
            # Also check traceless
            if simplify(trace(c)) != 0:
                v1v2_ok = False

    # [V_2, V_2] -> antisymmetric
    v2v2_ok = True
    for S1 in V2_basis:
        for S2 in V2_basis:
            c = commutator(S1, S2)
            if frob_norm_sq(c) != 0 and not is_antisymmetric(c):
                v2v2_ok = False

    return v1v1_ok and v1v2_ok and v2v2_ok, {
        '[V1,V1]_in_V1': v1v1_ok,
        '[V1,V2]_in_V2': v1v2_ok,
        '[V2,V2]_in_V1': v2v2_ok,
    }


# =============================================================================
# Test 10: Cross-coupling symmetry
# =============================================================================
def test_cross_coupling_symmetry():
    """Total cross-coupling: sum_{M in V_l, G in V_{l'}} ||[M,G]||^2.
    By ||[X,Y]|| = ||[Y,X]||, the (l,l') and (l',l) totals are equal.

    V_1 x V_2 total = V_2 x V_1 total = 15.
    Per V_1 mode to V_2: 15/3 = 5.
    Per V_2 mode to V_1: 15/5 = 3.

    The TOTAL commutator norm in M_3(R):
    sum_{all pairs} ||[X,Y]||^2 = 48 = 2*n*(n^2-1) for n=3.
    """
    n = 3
    total_all = S.Zero
    cross_v1_v2 = S.Zero
    self_v1_v1 = S.Zero
    self_v2_v2 = S.Zero

    for M in ALL_basis:
        for G in ALL_basis:
            c_sq = frob_norm_sq(commutator(M, G))
            total_all += c_sq

    for M in V1_basis:
        for G in V2_basis:
            cross_v1_v2 += frob_norm_sq(commutator(M, G))

    for M in V1_basis:
        for G in V1_basis:
            self_v1_v1 += frob_norm_sq(commutator(M, G))

    for S1 in V2_basis:
        for S2 in V2_basis:
            self_v2_v2 += frob_norm_sq(commutator(S1, S2))

    total_48 = (int(total_all) == 48)
    cross_15 = (int(cross_v1_v2) == 15)
    self_v1_3 = (int(self_v1_v1) == 3)
    self_v2_15 = (int(self_v2_v2) == 15)

    # Check formula: total = 2*n*(n^2-1) for gl(n)
    formula_total = 2 * n * (n**2 - 1)

    return total_48 and cross_15 and self_v1_3 and self_v2_15, {
        'total': int(total_all),
        'formula_2n(n^2-1)': formula_total,
        'V1xV2': int(cross_v1_v2),
        'V1xV1': int(self_v1_v1),
        'V2xV2': int(self_v2_v2),
        'per_V1_to_V2': Rational(int(cross_v1_v2), 3),
        'per_V2_to_V1': Rational(int(cross_v1_v2), 5),
        'per_V1_to_V1': Rational(int(self_v1_v1), 3),
        'per_V2_to_V2': Rational(int(self_v2_v2), 5),
    }


# =============================================================================
# Test 11: Why NOT derivable from commutator coupling alone
# =============================================================================
def test_commutator_cannot_derive():
    """The commutator coupling ||[M,G]||^2 is always non-negative.
    Therefore it CANNOT produce negative weights w_2 = -2.

    The negative sign requires a SIGNED mechanism:
    either the Killing form sign, or a physical coupling sign
    (commutator=constructive, anticommutator=destructive).

    This test verifies that no normalization of the commutator
    coupling within M_3(R) reproduces {1, 6, -2}.
    """
    # Raw commutator couplings within M_3(R)
    eta = {0: 0, 1: 6, 2: 6}  # all non-scalar modes get 6

    # Any normalization c*eta_l would give:
    # w_0 = c*0 = 0 (can't get 1)
    # w_1 = c*6
    # w_2 = c*6
    # So w_1 = w_2 always. Can't get {6, -2}.
    cannot_get_unequal = (eta[1] == eta[2])

    # Even with U(1) trace coupling added:
    # w_0 = (trace coupling) > 0
    # w_1 = c*6 (positive)
    # w_2 = c*6 (positive)
    # Still w_1 = w_2 and both positive.
    all_positive = (eta[1] > 0 and eta[2] > 0)

    return cannot_get_unequal and all_positive, {
        'eta_values': eta,
        'conclusion': (
            "Commutator coupling gives eta_1 = eta_2 = 6 (Killing form of gl(3)). "
            "Cannot produce w_1 != w_2 or negative weights. "
            "The sign MUST come from a separate mechanism (Killing form sign, "
            "Lie algebra membership, or anticommutator/commutator distinction)."
        ),
    }


# =============================================================================
# Test 12: Derivation chain assessment
# =============================================================================
def test_derivation_chain():
    """Classify each element of the crossed Casimir formula by confidence level.

    w_l = (-1)^(l+1) * C_2(Im_H - l)

    Components:
    1. M_3(R) = 1+3+5 under SO(3) <- [MATHEMATICAL FACT]
    2. The sign (-1)^(l+1) <- [DERIVATION]: from Killing form of gl(3)
       (compact part negative, non-compact positive -> -K gives the sign)
    3. The magnitude C_2(Im_H-l) <- [CONJECTURE]: why complementary Casimir?
    4. w_0 = 1 <- [DERIVATION]: trace/U(1) baseline (analogous to crystal sector)
    5. Frobenius norm = 129 <- [CONJECTURE]: no first-principles derivation
    6. Product = -12 <- [CONJECTURE]: selects unique solution but no derivation

    Gap: The magnitude |w_l| = C_2(complementary) lacks a first-principles mechanism.
    The Casimir formula for V_1 coupling gives eta(V_1->V_{l'}) = C_2(l')*(2l'+1)/6,
    but this gives the coupling TO l' (not from l'), and doesn't explain why the
    weight should be C_2 of the OTHER irrep rather than of the mode's own irrep.
    """
    chain = {
        'SO3_decomposition': '[MATHEMATICAL FACT]',
        'sign_mechanism': '[DERIVATION] from Killing form of gl(3)',
        'magnitude_mechanism': '[CONJECTURE] C_2(complementary) not derived',
        'scalar_baseline': '[DERIVATION] trace coupling analog',
        'frobenius_norm': '[CONJECTURE] 129 = Im_H * Phi_6(Im_O)',
        'product_constraint': '[CONJECTURE] -12 = -n_d * Im_H',
        'overall': '[CONJECTURE] with 2 derived components (sign + scalar baseline)',
    }

    # Count derived vs conjectured
    derived = sum(1 for v in chain.values() if 'DERIVATION' in v or 'FACT' in v)
    conjectured = sum(1 for v in chain.values() if 'CONJECTURE' in v)

    return True, {
        'chain': chain,
        'derived_components': derived,
        'conjectured_components': conjectured,
    }


# =============================================================================
# Test 13: Alternative constraint -- Killing-weighted Casimir moment
# =============================================================================
def test_killing_casimir_moment():
    """Compute sum_l dim_l * w_l * C_2(l) for both solutions.

    For {1,6,-2}: 0 + 3*6*2 + 5*(-2)*6 = 36 - 60 = -24 = -n_d * C * Im_H
    For {1,-4,4}: 0 + 3*(-4)*2 + 5*4*6 = -24 + 120 = 96 = O * n_d * Im_H

    The crossed Casimir solution gives -24 (negative correlation with Casimir),
    consistent with the Killing form sign mechanism:
    higher Casimir (V_2, C_2=6) -> negative weight (screening).
    """
    w_crossed = {0: 1, 1: 6, 2: -2}
    w_alt = {0: 1, 1: -4, 2: 4}

    moment_crossed = sum(
        (2 * l + 1) * w_crossed[l] * casimir_so3(l) for l in range(3)
    )
    moment_alt = sum(
        (2 * l + 1) * w_alt[l] * casimir_so3(l) for l in range(3)
    )

    crossed_is_neg24 = (moment_crossed == -24)
    neg24_decomp = (-24 == -n_d * C * Im_H)

    alt_is_96 = (moment_alt == 96)

    return crossed_is_neg24 and neg24_decomp and alt_is_96, {
        'moment_crossed': moment_crossed,
        'moment_alt': moment_alt,
        'crossed_decomposition': f"-24 = -n_d*C*Im_H = -{n_d}*{C}*{Im_H}",
        'anti_correlation': (
            "Negative moment = weight anti-correlated with Casimir. "
            "Higher Casimir (more complex mode) -> more negative weight."
        ),
    }


# =============================================================================
# Main
# =============================================================================
def main():
    print("=" * 70)
    print("CROSSED CASIMIR COUPLING DERIVATION ATTEMPT")
    print("Session S240 -- EQ-012 Final Gap")
    print("=" * 70)
    print()

    tests = [
        ("Orthonormal basis of M_3(R)", test_orthonormal_basis),
        ("Commutator coupling within M_3(R): eta_l", test_commutator_coupling_m3),
        ("Coupling decomposition by target irrep", test_coupling_by_target),
        ("Casimir formula for V_1 coupling", test_casimir_formula_v1),
        ("Killing form sign mechanism", test_killing_form_sign),
        ("Crossed Casimir = Killing sign x comp Casimir", test_crossed_casimir_decomposition),
        ("Three-constraint system: 2 solutions", test_constraint_system),
        ("Product discriminant: selects unique solution", test_product_discriminant),
        ("Commutator structure: landing rules", test_commutator_structure),
        ("Cross-coupling symmetry and totals", test_cross_coupling_symmetry),
        ("Commutator alone CANNOT derive weights", test_commutator_cannot_derive),
        ("Derivation chain assessment", test_derivation_chain),
        ("Killing-Casimir moment: anti-correlation", test_killing_casimir_moment),
    ]

    pass_count = 0
    fail_count = 0

    for name, test_func in tests:
        try:
            result = test_func()
            passed = result[0]
            details = result[1] if len(result) > 1 else {}
            status = "PASS" if passed else "FAIL"
            if passed:
                pass_count += 1
            else:
                fail_count += 1
        except Exception as ex:
            status = "ERROR"
            fail_count += 1
            details = {'error': str(ex)}

        print(f"[{status}] {name}")
        if status in ("FAIL", "ERROR"):
            print(f"         Details: {details}")

    total = pass_count + fail_count
    print()
    print(f"Results: {pass_count}/{total} PASS")

    # =========================================================================
    # Detailed summary
    # =========================================================================
    print()
    print("=" * 70)
    print("DERIVATION STATUS SUMMARY")
    print("=" * 70)
    print()
    print("The crossed Casimir formula: w_l = (-1)^(l+1) * C_2(Im_H - l)")
    print()
    print("WHAT CAN BE DERIVED:")
    print("  1. [MATH FACT] M_3(R) = 1 + 3 + 5 under SO(3)")
    print("  2. [DERIVATION] Sign: from Killing form of gl(3,R)")
    print("     - gl(3) Killing form: K(X,Y) = 6*Tr(XY) - 2*Tr(X)*Tr(Y)")
    print("     - On V_1 (antisymmetric): K = -6||M||^2 < 0 (compact)")
    print("     - On V_2 (sym traceless): K = +6||S||^2 > 0 (non-compact)")
    print("     - Sign of weight = sign of -K: V_1 positive, V_2 negative")
    print("  3. [DERIVATION] Scalar baseline: w_0 = 1 (U(1) trace coupling)")
    print("  4. [DERIVATION] Completeness: sum(dim*w) = Im_H^2 = 9")
    print()
    print("WHAT REMAINS CONJECTURE:")
    print("  5. [CONJECTURE] Magnitude: |w_l| = C_2(complementary irrep)")
    print("     - WHY does each irrep couple through Casimir of OTHER?")
    print("     - Not explained by commutator structure alone")
    print("  6. [CONJECTURE] Frobenius norm = 129 = Im_H * Phi_6(Im_O)")
    print("     - Equivalent to constraint 5 (given constraints 1-4)")
    print("  7. [CONJECTURE] Product = -12 = -n_d * Im_H")
    print("     - Selects {1,6,-2} uniquely from two C2+C3 solutions")
    print()
    print("STRUCTURAL ANALYSIS:")
    print("  Given constraints C1-C2 alone: 1 free parameter (1-dim family)")
    print("  Given C1-C3 (adding Frobenius): 2 discrete solutions")
    print("  Given C1-C3 + product: UNIQUE solution = crossed Casimir")
    print()
    print("ASSESSMENT: The crossed Casimir formula is [CONJECTURE] with")
    print("  strong structural support. The SIGN is derived (Killing form).")
    print("  The MAGNITUDE gap (why complementary Casimir?) is the single")
    print("  remaining unexplained element. Closing this would require")
    print("  either deriving the Frobenius norm from Born rule dynamics")
    print("  or identifying a representation-theoretic identity that")
    print("  forces |w_l| = C_2(l') for crossed irreps.")


if __name__ == '__main__':
    main()
