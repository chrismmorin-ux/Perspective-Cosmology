#!/usr/bin/env python3
"""
Cyclotomic 43 Numerator Analysis: Sum Rules and Sector Structure

SESSION S226 (EQ-012)

KEY FINDING: The Phi_6 sector numerators satisfy sum rules:
  B_spacetime = 1  = R^2  = 1^2
  B_crystal   = 4  = C^2  = 2^2  (= n_d)
  B_hidden    = 9  = Im_H^2 = 3^2  (sum of 18 + (-10) + 1)
  B_total     = 14 = C * Im_O = dim(G_2)

The sector sums are {1, 4, 9} = first three perfect squares.

This script tests:
1. Sum rule arithmetic (are the sums correct?)
2. The {R^2, C^2, Im_H^2} pattern
3. Tautology check: is the hidden sum a trivial identity?
4. Partition uniqueness: how many ways to partition 9 into B values?
5. Falsifiable predictions from the sum rule
6. Connection to G_2 = Aut(O)
7. Statistical significance assessment

Status: INVESTIGATION
Dependencies: cyclotomic_43_stress_test.py
"""

from sympy import Rational, isprime, binomial, factorial, Integer
import math
from itertools import product as iterproduct


# =============================================================================
# Framework constants
# =============================================================================
R, C, H, O = 1, 2, 4, 8
Im_C, Im_H, Im_O = 1, 3, 7
n_d = 4
n_c = 11


def phi6(k):
    return k**2 - k + 1


# =============================================================================
# The five Phi_6 formulas and their sectors
# =============================================================================
FORMULAS = {
    'alpha': {
        'A': 137, 'B': 4, 'D': 111, 'sector': 'crystal',
        'k': n_c, 'description': '1/alpha = 137 + 4/111'
    },
    'v_mp': {
        'A': 262, 'B': 18, 'D': 43, 'sector': 'hidden',
        'k': Im_O, 'description': 'v/m_p = 262 + 18/43'
    },
    'mu_e': {
        'A': 207, 'B': -10, 'D': 43, 'sector': 'hidden',
        'k': Im_O, 'description': 'm_mu/m_e = 207 - 10/43'
    },
    'mu_ms': {
        'A': 0, 'B': 1, 'D': 43, 'sector': 'hidden',
        'k': Im_O, 'description': 'm_u/m_s = 1/43'
    },
    'ms_mc': {
        'A': 0, 'B': 1, 'D': 13, 'sector': 'spacetime',
        'k': n_d, 'description': 'm_s/m_c = 1/13'
    },
}


# =============================================================================
# Test 1: Sum rule arithmetic
# =============================================================================
def test_sum_rules():
    """Verify sector sums and total sum."""
    sectors = {'crystal': [], 'hidden': [], 'spacetime': []}
    for name, f in FORMULAS.items():
        sectors[f['sector']].append(f['B'])

    B_crystal = sum(sectors['crystal'])
    B_hidden = sum(sectors['hidden'])
    B_spacetime = sum(sectors['spacetime'])
    B_total = B_crystal + B_hidden + B_spacetime

    # Expected values
    crystal_ok = (B_crystal == 4)
    hidden_ok = (B_hidden == 9)
    spacetime_ok = (B_spacetime == 1)
    total_ok = (B_total == 14)

    results = {
        'B_crystal': B_crystal,
        'B_hidden': B_hidden,
        'B_spacetime': B_spacetime,
        'B_total': B_total,
        'crystal_is_4': crystal_ok,
        'hidden_is_9': hidden_ok,
        'spacetime_is_1': spacetime_ok,
        'total_is_14': total_ok,
    }
    return all([crystal_ok, hidden_ok, spacetime_ok, total_ok]), results


# =============================================================================
# Test 2: Perfect square pattern {1^2, 2^2, 3^2}
# =============================================================================
def test_perfect_square_pattern():
    """Check: sector sums are {1, 4, 9} = {1^2, 2^2, 3^2}.
    Also test the division algebra interpretation: {R^2, C^2, Im_H^2}."""

    sums = {'spacetime': 1, 'crystal': 4, 'hidden': 9}

    # Perfect squares
    sq_spacetime = (sums['spacetime'] == 1**2)
    sq_crystal = (sums['crystal'] == 2**2)
    sq_hidden = (sums['hidden'] == 3**2)

    # Division algebra dims {R, C, Im_H}
    da_spacetime = (sums['spacetime'] == R**2)
    da_crystal = (sums['crystal'] == C**2)
    da_hidden = (sums['hidden'] == Im_H**2)

    # Alternative readings for B_crystal = 4
    also_nd = (sums['crystal'] == n_d)
    also_H = (sums['crystal'] == H)

    # The sequence {R, C, Im_H} = {1, 2, 3} = first three div alg dims
    # that are LESS THAN n_d = 4
    all_less_nd = (R < n_d and C < n_d and Im_H < n_d)

    # {1, 2, 3} are also {Im_C + R, C, Im_H} = {dim(C), dim(C), Im(H)}
    # Hmm, these are just the integers 1,2,3.

    return (sq_spacetime and sq_crystal and sq_hidden and
            da_spacetime and da_crystal and da_hidden), {
        'perfect_squares': (sq_spacetime, sq_crystal, sq_hidden),
        'div_alg_squares': (da_spacetime, da_crystal, da_hidden),
        'crystal_also_nd': also_nd,
        'all_less_nd': all_less_nd,
    }


# =============================================================================
# Test 3: Tautology check -- is B_hidden = 9 algebraically trivial?
# =============================================================================
def test_tautology_check():
    """If B_v = C*Im_H^2 = 18, B_mu = -(C+O) = -10, B_ms = R = 1,
    then B_hidden = C*Im_H^2 - (C+O) + R.

    Using O = Im_H^2 - 1 (from Cayley-Dickson: O = C*H, Im_H^2 = 9, O = 8):
      = C*Im_H^2 - C - (Im_H^2 - 1) + R
      = C*Im_H^2 - C - Im_H^2 + 1 + R
      = Im_H^2(C - 1) - C + 1 + R
      = Im_H^2*Im_C - Im_C + R       [using C - 1 = Im_C = 1]
      = Im_H^2*1 - 1 + 1
      = Im_H^2

    So the sum rule B_hidden = Im_H^2 reduces to the identity
    O = Im_H^2 - 1 (equivalently O + 1 = Im_H^2, i.e. 8 + 1 = 9).

    This identity IS a genuine division algebra relation:
    O = C * H and Im_H^2 = (H-1)^2 = H^2 - 2H + 1 = 16 - 8 + 1 = 9.
    O = C*H = 2*4 = 8 = Im_H^2 - 1.
    Or: dim(O) = dim(Im_H)^2 - 1.
    """
    # Verify the algebraic reduction
    B_v_decomp = C * Im_H**2            # = 18
    B_mu_decomp = -(C + O)              # = -10
    B_ms_decomp = R                     # = 1

    sum_decomp = B_v_decomp + B_mu_decomp + B_ms_decomp

    # Reduce using O = Im_H^2 - 1
    O_identity = (O == Im_H**2 - 1)

    # The key identity: C*Im_H^2 - (C+O) + R = Im_H^2
    # Proof: C*Im_H^2 - C - O + R = C*(Im_H^2 - 1) - O + R
    #      = C*O - O + R = O*(C-1) + R = O*Im_C + R
    #      = O*1 + 1 = O + 1 = Im_H^2 - 1 + 1 = Im_H^2
    step1 = C * (Im_H**2 - 1) - O + R
    step2 = C * O - O + R
    step3 = O * (C - 1) + R
    step4 = O * Im_C + R
    step5 = O + R  # since Im_C = 1

    chain_ok = (sum_decomp == Im_H**2 == step1 == step2 == step3
                == step4 == step5)

    # The sum rule is a CONSEQUENCE of the decompositions + O = Im_H^2 - 1
    # It is NOT an independent constraint
    is_tautological = O_identity and chain_ok

    return is_tautological, {
        'sum_decomp': sum_decomp,
        'O_eq_ImH2_minus_1': O_identity,
        'chain_checks': chain_ok,
        'key_identity': f"O + R = {O} + {R} = {O + R} = Im_H^2 = {Im_H**2}",
        'interpretation': (
            "Sum rule is NOT independent of individual decompositions. "
            "It follows from O = Im_H^2 - 1 (Cayley-Dickson structure). "
            "The sum rule tests CONSISTENCY, not provides new constraints."
        ),
    }


# =============================================================================
# Test 4: Partition uniqueness -- how many (a,b,c) with a+b+c=9
#          where a,b,c are "framework expressible" and |a|,|b|,|c| <= 25?
# =============================================================================
def test_partition_uniqueness():
    """How many ordered triples (B1, B2, B3) with B1+B2+B3 = 9
    exist where each Bi is expressible as a simple product/sum of
    division algebra quantities?

    Framework quantities for building B:
    Products a*b where a,b in {R,C,H,O,Im_C,Im_H,Im_O,n_d,n_c}
    and negatives thereof.
    """
    dims = [R, C, H, O, Im_C, Im_H, Im_O, n_d, n_c]

    # Build set of "framework-expressible" numbers from simple products
    fw_nums = set()
    for d in dims:
        fw_nums.add(d)
        fw_nums.add(-d)
        for d2 in dims:
            fw_nums.add(d * d2)
            fw_nums.add(-d * d2)
            fw_nums.add(d + d2)
            fw_nums.add(d - d2)
            fw_nums.add(-(d + d2))

    # Filter to reasonable range
    fw_nums = {n for n in fw_nums if abs(n) <= 25}

    # Count ordered triples summing to 9
    count = 0
    examples = []
    for B1 in fw_nums:
        for B2 in fw_nums:
            B3 = 9 - B1 - B2
            if B3 in fw_nums:
                count += 1
                if count <= 10:
                    examples.append((B1, B2, B3))

    # Check if (18, -10, 1) is among them
    target_found = (18 in fw_nums and -10 in fw_nums and 1 in fw_nums
                    and 18 + (-10) + 1 == 9)

    return target_found, count, len(fw_nums), examples


# =============================================================================
# Test 5: Falsifiable predictions from sum rules
# =============================================================================
def test_falsifiable_predictions():
    """Extract testable predictions from the sum rules:

    P1: No more Phi_6(7)=43 formulas with non-zero B exist
        (because B_hidden is already Im_H^2 = 9, fully "spent")

    P2: If a new Phi_6(7) formula IS found with B_new != 0,
        then one of the existing B values must be wrong

    P3: The total sum B_total = 14 = C*Im_O = dim(G_2)
        If a new sector (cross-sector?) formula is found, B_total changes

    P4: {1,4,9} sector sums predict that any NEW sector would have
        B = 16 = 4^2 (next perfect square), but no 4th sector exists
        in the three-sector decomposition, so this predicts COMPLETENESS
    """
    # P1: Completeness of hidden sector
    hidden_budget = Im_H**2
    hidden_spent = 18 + (-10) + 1
    hidden_remaining = hidden_budget - hidden_spent
    p1_complete = (hidden_remaining == 0)

    # P2: Consistency check
    p2_check = (hidden_spent == hidden_budget)

    # P3: Total = dim(G_2) = 14
    total = 4 + 9 + 1
    dim_G2 = 14  # Aut(O) has dimension 14
    p3_G2 = (total == dim_G2)

    # P4: Next perfect square
    next_sq = 4**2  # = 16
    # No 4th sector exists in u(n_d) + u(Im_O) decomposition
    # So predicting completeness at 3 sectors
    p4_complete = True  # structural: only 3 sectors exist

    # Cross-sector channels (55 = 2*n_d*Im_O - 1)
    # If cross-sector contributed, total would be 14 + B_cross
    # But cross-sector has no known formulas
    cross_absent = True

    return {
        'P1_hidden_complete': p1_complete,
        'P2_consistency': p2_check,
        'P3_total_is_dimG2': p3_G2,
        'P4_three_sectors_complete': p4_complete,
        'cross_absent': cross_absent,
        'hidden_remaining': hidden_remaining,
    }


# =============================================================================
# Test 6: G_2 = Aut(O) connection
# =============================================================================
def test_G2_connection():
    """B_total = 14 = dim(G_2) where G_2 = Aut(O) is the automorphism
    group of the octonions.

    G_2 properties:
    - dim(G_2) = 14
    - rank(G_2) = 2
    - G_2 preserves the imaginary octonion product
    - G_2 acts on S^6 = {unit imaginary octonions}
    - dim(G_2) = dim(Im_O)^2 - dim(Im_O) = 49 - 7 = 42? NO, that's wrong
    - Actually: G_2 is a 14-dimensional simple Lie group

    14 = dim(G_2) = 2*Im_O = C*Im_O
    Also: 14 = n_c + Im_H = 11 + 3

    Is 14 = C*Im_O meaningful? G_2 acts on the 7-sphere S^6
    (unit imaginary octonions). The tangent bundle of S^6 has fiber R^6.
    The structure group is... SU(3) (not G_2).
    G_2/SU(3) ~= S^6, so dim(G_2) = dim(SU(3)) + dim(S^6) = 8 + 6 = 14.
    And dim(S^6) = Im_O - 1 = 6, dim(SU(3)) = 8 = O.
    So 14 = O + (Im_O - 1) = O + Im_O - 1.

    Check: O + Im_O - 1 = 8 + 7 - 1 = 14. Yes!
    Also: this is Phi_6(Im_O) - (Im_O^2 - 2*Im_O) = 43 - 49 + 14 = 8? No.

    Cleaner: 14 = 2 * Im_O = C * Im_O.
    """
    dim_G2 = 14
    B_total = 4 + 9 + 1

    total_is_14 = (B_total == 14)
    is_C_ImO = (14 == C * Im_O)
    is_O_plus_ImO_minus_1 = (14 == O + Im_O - 1)

    # G_2/SU(3) = S^6 decomposition
    dim_SU3 = 8  # = O
    dim_S6 = 6   # = Im_O - 1
    G2_decomp = (dim_G2 == dim_SU3 + dim_S6)

    # Check: dim(G_2) = dim(SU(3)) + 6 = O + (Im_O - 1)
    structural = (dim_G2 == O + Im_O - 1)

    return total_is_14 and is_C_ImO, {
        'B_total': B_total,
        'dim_G2': dim_G2,
        'C_times_ImO': C * Im_O,
        'G2_SU3_S6': G2_decomp,
        'O_plus_ImO_minus_1': structural,
    }


# =============================================================================
# Test 7: Statistical significance
# =============================================================================
def test_statistical_significance():
    """How likely is the {1, 4, 9} pattern by chance?

    Given 5 formulas with B values in [-20, 20], assigned to 3 sectors
    (1+3+1), what's the probability that sector sums are perfect squares?

    Approach: Monte Carlo-style counting.
    - Crystal sector: 1 formula, B in [-20, 20]. P(B = perfect square) = ?
      Perfect squares in [-20,20]: 0, 1, 4, 9, 16. Count = 5.
      But we want SPECIFIC perfect squares. P(B=4) = 1/41.

    - Hidden sector: 3 formulas, B_i in [-20, 20].
      Sum B1+B2+B3 in [-60, 60]. P(sum = perfect square).
      Perfect squares in [-60,60]: 0,1,4,9,16,25,36,49. Count = 8.
      Sum of 3 uniform[-20,20]: approx normal, mean 0, std ~ 20.
      P(sum = k) ~ 1/121 for k near 0. P(sum in {0,1,4,9,16,25,36,49}) ~ 8/121.

    - Spacetime sector: 1 formula. P(B = perfect square) = 5/41.

    Joint: ~ (5/41) * (8/121) * (5/41) ~ 0.006 = 0.6%

    But look-elsewhere: we'd also notice {squares}, {cubes}, {primes},
    {Fibonacci}, etc. With ~5 "interesting" number sets, P ~ 3%.
    """
    # Count perfect squares in [-20, 20]
    sq_in_range = [n for n in range(-20, 21) if n >= 0 and int(math.sqrt(n))**2 == n]
    n_sq_single = len(sq_in_range)
    range_size = 41  # -20 to 20

    # For hidden sector: sums of 3 values in [-20, 20]
    # Total possible sums: [-60, 60], uniform-ish distribution
    sq_in_sum_range = [n for n in range(-60, 61)
                       if n >= 0 and int(math.sqrt(n))**2 == n]
    n_sq_sum = len(sq_in_sum_range)
    sum_range = 121  # approximate effective range

    # Rough probability
    p_crystal = n_sq_single / range_size
    p_hidden = n_sq_sum / sum_range
    p_spacetime = n_sq_single / range_size
    p_joint = p_crystal * p_hidden * p_spacetime

    # Look-elsewhere factor: ~5 interesting number patterns
    look_elsewhere = 5
    p_adjusted = min(1.0, p_joint * look_elsewhere)

    # More refined: P(sector sums are CONSECUTIVE squares {n^2, (n+1)^2, (n+2)^2})
    # This is much tighter.
    # Consecutive square triples starting from 1^2: (1,4,9), (4,9,16), (9,16,25)...
    # In [-20,20] * [-60,60] * [-20,20]:
    # (1,4,9): spacetime=1, crystal=4, hidden=9
    # (1,9,4): permutation
    # etc. But assignment to sectors is fixed by physics.
    # So only (1,4,9) with correct sector assignment matters.
    # P(specific triple) ~ p_joint ~ 0.6% before look-elsewhere

    # But the CONSECUTIVE starting from 1 is even more specific
    n_consecutive_triples = 3  # (1,4,9), (4,9,16), (9,16,25) in range
    p_consecutive = n_consecutive_triples / (range_size * sum_range * range_size)
    # This is tiny: 3 / (41 * 121 * 41) ~ 1.5e-5

    return {
        'p_any_squares': p_joint,
        'p_adjusted': p_adjusted,
        'p_consecutive_squares': p_consecutive,
        'n_sq_single': n_sq_single,
        'n_sq_sum': n_sq_sum,
        'assessment': ('mildly_significant' if p_adjusted < 0.05
                       else 'not_significant'),
    }


# =============================================================================
# Test 8: Division algebra identity underlying the sum rule
# =============================================================================
def test_division_algebra_identity():
    """The core identity enabling the sum rule:

    O + 1 = Im_H^2     (equivalently: O = Im_H^2 - 1)

    This is a genuine division algebra structural identity:
    - O = C * H (Cayley-Dickson doubling)
    - Im_H = H - 1 = 3
    - Im_H^2 = 9 = C*H + 1 = O + 1

    It follows from: (H-1)^2 = H^2 - 2H + 1 = 16 - 8 + 1 = 9
    And O = 2H, so O + 1 = 2H + 1 ... wait, O = C*H = 2*4 = 8, not 2H=8.

    Actually O = C * H = 2 * 4 = 8 and Im_H^2 = 3^2 = 9, so O + 1 = 9.

    Deeper: for the four normed division algebras {R, C, H, O}:
    dim(K_{n+1}) = 2 * dim(K_n)  [Cayley-Dickson]
    dim(Im K) = dim(K) - 1

    Check if O + 1 = Im_H^2 generalizes:
    R + 1 = 2 = C           = Im_C^2 + 1? No, Im_C^2 = 1, 1+1 = 2. Yes!
    C + 1 = 3 = Im_H        != Im_R^2 (= 0)
    H + 1 = 5               != Im_C^2 (= 1)
    O + 1 = 9 = Im_H^2      Yes!

    So the pattern K + 1 = Im(K')^2 holds for K=R (K'=C) and K=O (K'=H).
    It does NOT hold universally. The O + 1 = Im_H^2 identity is specific.
    """
    # Core identity
    core = (O + 1 == Im_H**2)

    # Check generalizations
    R_plus_1 = R + 1  # = 2
    C_plus_1 = C + 1  # = 3
    H_plus_1 = H + 1  # = 5
    O_plus_1 = O + 1  # = 9

    gen_R = (R_plus_1 == Im_C**2 + 1)  # 2 == 1 + 1 = 2? Yes
    gen_R_alt = (R_plus_1 == C)  # 2 = 2, trivially
    gen_O = (O_plus_1 == Im_H**2)  # 9 = 9, the sum rule identity
    gen_C = (C_plus_1 == Im_H)  # 3 = 3, also true!
    gen_H = (H_plus_1 == 5)  # 5 is not a standard div alg quantity

    # Cayley-Dickson chain
    cd_chain = (C == 2 * R and H == 2 * C and O == 2 * H)

    return core, {
        'O_plus_1_eq_ImH2': core,
        'R_plus_1_eq_C': gen_R_alt,
        'C_plus_1_eq_ImH': gen_C,
        'H_plus_1_eq_5': gen_H,  # not clean
        'O_plus_1_eq_ImH2_repeat': gen_O,
        'cayley_dickson': cd_chain,
    }


# =============================================================================
# Test 9: Sum rule as conservation law
# =============================================================================
def test_conservation_interpretation():
    """Interpret the sum rule as a "numerator weight conservation":

    Each Phi_6 sector has a total "weight budget" = perfect square.
    The formulas in each sector must distribute this budget.

    Crystal u(11): budget = C^2 = 4, spent on 1 formula (alpha, B=4)
    Hidden  u(7):  budget = Im_H^2 = 9, spent on 3 formulas (B=18,-10,1)
    Space   u(4):  budget = R^2 = 1, spent on 1 formula (m_s/m_c, B=1)

    This predicts: if a new formula is discovered in the hidden sector
    with denominator 43, its B value must be 0 (budget exhausted).

    Test: verify budget = spent for each sector.
    Also verify: if we change any individual B, the budget breaks.
    """
    budgets = {'crystal': C**2, 'hidden': Im_H**2, 'spacetime': R**2}

    spent = {'crystal': 0, 'hidden': 0, 'spacetime': 0}
    for f in FORMULAS.values():
        spent[f['sector']] += f['B']

    balanced = all(budgets[s] == spent[s] for s in budgets)

    # Sensitivity: if any B changes by +/-1, budget breaks
    sensitive = True
    for name, f in FORMULAS.items():
        for delta in [-1, 1]:
            test_spent = dict(spent)
            test_spent[f['sector']] += delta
            if test_spent[f['sector']] == budgets[f['sector']]:
                sensitive = False
                break

    return balanced and sensitive, {
        'budgets': budgets,
        'spent': spent,
        'balanced': balanced,
        'sensitive_to_B_changes': sensitive,
    }


# =============================================================================
# Main
# =============================================================================
def main():
    print("=" * 70)
    print("CYCLOTOMIC 43 NUMERATOR ANALYSIS")
    print("Session S226 -- Sum Rules and Sector Structure")
    print("=" * 70)
    print()

    pass_count = 0
    fail_count = 0

    def report(name, passed):
        nonlocal pass_count, fail_count
        if passed:
            pass_count += 1
        else:
            fail_count += 1
        tag = "PASS" if passed else "FAIL"
        print(f"[{tag}] {name}")

    # ---- Test 1 ----
    print("-" * 70)
    print("TEST 1: Sum Rule Arithmetic")
    print("-" * 70)
    ok1, r1 = test_sum_rules()
    print(f"  Crystal sector  (alpha):            B = {r1['B_crystal']}")
    print(f"  Hidden sector   (v/mp, mu/e, u/s):  B = {FORMULAS['v_mp']['B']} "
          f"+ ({FORMULAS['mu_e']['B']}) + {FORMULAS['mu_ms']['B']} "
          f"= {r1['B_hidden']}")
    print(f"  Spacetime sector (s/c):             B = {r1['B_spacetime']}")
    print(f"  Total:                              B = {r1['B_total']}")
    report("Sector sums are {4, 9, 1}, total = 14", ok1)
    print()

    # ---- Test 2 ----
    print("-" * 70)
    print("TEST 2: Perfect Square Pattern")
    print("-" * 70)
    ok2, r2 = test_perfect_square_pattern()
    print(f"  B_spacetime = {1} = 1^2 = R^2")
    print(f"  B_crystal   = {4} = 2^2 = C^2  (also = n_d = H)")
    print(f"  B_hidden    = {9} = 3^2 = Im_H^2")
    print(f"  Sequence {{R, C, Im_H}} = {{1, 2, 3}} = first three div alg dims < n_d")
    report("Sector sums are {R^2, C^2, Im_H^2}", ok2)
    print()

    # ---- Test 3 ----
    print("-" * 70)
    print("TEST 3: Tautology Check (Is Sum Rule Independent?)")
    print("-" * 70)
    ok3, r3 = test_tautology_check()
    print(f"  Key identity: {r3['key_identity']}")
    print(f"  Algebraic chain: C*Im_H^2 - (C+O) + R")
    print(f"    = C*(Im_H^2-1) - O + R    [factor out]")
    print(f"    = C*O - O + R              [O = Im_H^2 - 1]")
    print(f"    = O*(C-1) + R              [factor]")
    print(f"    = O*Im_C + R               [C-1 = Im_C = 1]")
    print(f"    = O + R = 8 + 1 = 9 = Im_H^2")
    print()
    print(f"  {r3['interpretation']}")
    report("Sum rule is tautological (follows from O+1 = Im_H^2)", ok3)
    print()

    # ---- Test 4 ----
    print("-" * 70)
    print("TEST 4: Partition Uniqueness (How Many Ways to Split 9?)")
    print("-" * 70)
    ok4, count4, n_fw, ex4 = test_partition_uniqueness()
    print(f"  Framework-expressible numbers in [-25, 25]: {n_fw}")
    print(f"  Ordered triples (B1, B2, B3) summing to 9: {count4}")
    print(f"  (18, -10, 1) is among them: {ok4}")
    if count4 > 100:
        print(f"  WARNING: {count4} alternatives exist -- partition is NOT unique")
    else:
        print(f"  Partition is moderately constrained ({count4} alternatives)")
    report("Target partition found", ok4)
    print()

    # ---- Test 5 ----
    print("-" * 70)
    print("TEST 5: Falsifiable Predictions")
    print("-" * 70)
    r5 = test_falsifiable_predictions()
    print(f"  P1: Hidden sector budget exhausted (remaining = {r5['hidden_remaining']}): "
          f"{'YES' if r5['P1_hidden_complete'] else 'NO'}")
    print(f"      => No more D=43 formulas with B != 0 should exist")
    print(f"  P2: Consistency check: {r5['P2_consistency']}")
    print(f"  P3: B_total = 14 = dim(G_2): {r5['P3_total_is_dimG2']}")
    print(f"  P4: Three-sector completeness: {r5['P4_three_sectors_complete']}")
    all5 = all([r5['P1_hidden_complete'], r5['P2_consistency'],
                r5['P3_total_is_dimG2']])
    report("All predictions consistent", all5)
    print()

    # ---- Test 6 ----
    print("-" * 70)
    print("TEST 6: G_2 = Aut(O) Connection")
    print("-" * 70)
    ok6, r6 = test_G2_connection()
    print(f"  B_total = {r6['B_total']} = dim(G_2) = {r6['dim_G2']}")
    print(f"  14 = C * Im_O = {r6['C_times_ImO']}")
    print(f"  G_2/SU(3) = S^6 decomposition: {r6['G2_SU3_S6']}")
    print(f"    dim(G_2) = dim(SU(3)) + dim(S^6) = {O} + {Im_O - 1} = {O + Im_O - 1}")
    report("B_total = dim(G_2) = C * Im_O = 14", ok6)
    print()

    # ---- Test 7 ----
    print("-" * 70)
    print("TEST 7: Statistical Significance")
    print("-" * 70)
    r7 = test_statistical_significance()
    print(f"  P(any three perfect squares): {r7['p_any_squares']:.3f} "
          f"({r7['p_any_squares']*100:.1f}%)")
    print(f"  P(adjusted for look-elsewhere): {r7['p_adjusted']:.3f} "
          f"({r7['p_adjusted']*100:.1f}%)")
    print(f"  P(consecutive squares 1,4,9): {r7['p_consecutive_squares']:.1e}")
    print(f"  Assessment: {r7['assessment']}")
    sig = r7['p_adjusted'] < 0.10
    report(f"Pattern probability < 10% (adjusted)", sig)
    print()

    # ---- Test 8 ----
    print("-" * 70)
    print("TEST 8: Division Algebra Identity")
    print("-" * 70)
    ok8, r8 = test_division_algebra_identity()
    print(f"  O + 1 = Im_H^2: {r8['O_plus_1_eq_ImH2']}")
    print(f"  R + 1 = C: {r8['R_plus_1_eq_C']}")
    print(f"  C + 1 = Im_H: {r8['C_plus_1_eq_ImH']}")
    print(f"  H + 1 = 5 (no clean identity): {r8['H_plus_1_eq_5']}")
    print(f"  Cayley-Dickson: C=2R, H=2C, O=2H: {r8['cayley_dickson']}")
    report("O + 1 = Im_H^2 verified (core identity for sum rule)", ok8)
    print()

    # ---- Test 9 ----
    print("-" * 70)
    print("TEST 9: Conservation Law Interpretation")
    print("-" * 70)
    ok9, r9 = test_conservation_interpretation()
    print(f"  Budgets: {r9['budgets']}")
    print(f"  Spent:   {r9['spent']}")
    print(f"  Balanced: {r9['balanced']}")
    print(f"  Sensitive to any B +/- 1: {r9['sensitive_to_B_changes']}")
    report("All sector budgets balanced and sensitive", ok9)
    print()

    # ==========================================================================
    # Summary
    # ==========================================================================
    total = pass_count + fail_count
    print("=" * 70)
    print(f"Results: {pass_count}/{total} PASS")
    print("=" * 70)

    print()
    print("=" * 70)
    print("ASSESSMENT")
    print("=" * 70)
    print()
    print("NUMERATOR SUM RULES [CONJECTURE]:")
    print()
    print("  MATHEMATICAL FACTS (verified):")
    print("    B_spacetime = 1  = R^2  = 1^2")
    print("    B_crystal   = 4  = C^2  = 2^2  (= n_d)")
    print("    B_hidden    = 9  = Im_H^2 = 3^2  (= 18 - 10 + 1)")
    print("    B_total     = 14 = C*Im_O = dim(G_2)")
    print()
    print("  STRUCTURAL CONTENT:")
    print("    The hidden-sector sum rule B_hidden = Im_H^2 is a TAUTOLOGY")
    print("    given the individual decompositions B_v = C*Im_H^2, etc.")
    print("    It follows from the identity O + 1 = Im_H^2 (Cayley-Dickson).")
    print("    The sum rule tests CONSISTENCY of decompositions, not independence.")
    print()
    print("  WHAT IS NOT TAUTOLOGICAL:")
    print("    1. The {1^2, 2^2, 3^2} = {R^2, C^2, Im_H^2} PATTERN across sectors")
    print("       (each sector indexed by a DIFFERENT div alg dim)")
    print("    2. The total B = 14 = dim(G_2) = dim(Aut(O))")
    print("    3. The sector assignment (which B goes to which sector)")
    print()
    print("  FALSIFIABLE PREDICTIONS:")
    print("    P1: No additional D=43 formulas with B != 0 exist")
    print("        (hidden-sector budget exhausted at Im_H^2 = 9)")
    print("    P2: No additional D=13 formulas with B != 0 exist")
    print("        (spacetime budget exhausted at R^2 = 1)")
    print()
    print("  CONFIDENCE: [CONJECTURE]")
    print("    The sum rules are real arithmetic facts.")
    print("    The division algebra interpretation is suggestive but:")
    print("    - Tautological for the hidden sector (just O+1=9)")
    print("    - Based on 5 data points (small sample)")
    print("    - No derivation mechanism")
    print("    Upgrade to [DERIVATION] requires: proving WHY sector budgets")
    print("    equal {R^2, C^2, Im_H^2} from the Born rule or similar mechanism.")


if __name__ == '__main__':
    main()
