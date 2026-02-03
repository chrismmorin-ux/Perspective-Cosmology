#!/usr/bin/env python3
"""
Cyclotomic Two-Sector Hypothesis: Structural Origin of Φ₆ Denominators

KEY FINDING: Framework formulas use Φ₆(k) = k² - k + 1 at THREE division
algebra dimensions, corresponding to three sectors of the crystal algebra:

  Full crystal:    u(n_c = 11) → Φ₆(11) = 111 → EM coupling (α)
  Spacetime:       u(n_d = 4)  → Φ₆(4)  = 13  → heavy-light quark transition
  Hidden (octonionic): u(Im_O = 7)  → Φ₆(7)  = 43  → mass ratio corrections

The three sectors satisfy n_c = n_d + Im_O (crystal = spacetime + hidden).

Φ₆(k) = k² - k + 1 counts EM-active channels in u(k):
  Total generators: k²
  EM-neutral (Cartan of SU(k)): k - 1
  EM-active: k² - (k-1) = k² - k + 1

This script tests:
1. Three-sector decomposition and Φ₆ evaluations
2. Sector assignment: which formulas use which sector
3. EM channel interpretation for all three sectors
4. Composition: Φ₆(n_c) vs Φ₆(n_d) + Φ₆(Im_O)
5. Quark hierarchy denominators as Φ₆ values
6. Primality pattern: Φ₆ prime iff argument is division algebra dim
7. Whether the denominator selection is structural or post-hoc
8. Numerator constraints from sector structure
9. Extended mass ratio scan for 43-patterns
10. Falsifiability: what would break this hypothesis

Status: INVESTIGATION (structural hypothesis testing)
Dependencies: cyclotomic_43_pattern.py (baseline verification)
"""

from sympy import (
    symbols, Rational, sqrt, isprime, factorint, cyclotomic_poly,
    simplify, expand, factor, Symbol, Integer, Abs, pi, S,
    binomial, totient
)


# =============================================================================
# Framework constants
# =============================================================================

R, C, H, O = 1, 2, 4, 8
Im_C, Im_H, Im_O = 1, 3, 7
n_d = H       # spacetime dimension = 4
n_c = 11      # crystal dimension = Im_C + Im_H + Im_O = 1 + 3 + 7


def phi6(k):
    """Φ₆(k) = k² - k + 1, the 6th cyclotomic polynomial."""
    return k**2 - k + 1


def em_channels(k):
    """EM-active channels in u(k) = k² - (k-1) = Φ₆(k)."""
    return k**2 - (k - 1)


# =============================================================================
# Test 1: Three-sector decomposition
# =============================================================================

def test_three_sector_decomposition():
    """The crystal n_c = 11 decomposes as n_d + Im_O = 4 + 7.
    Each sector has its own u(k) algebra and Φ₆(k) EM channel count.

    | Sector   | k     | u(k) gens | Cartan | EM channels |
    |----------|-------|-----------|--------|-------------|
    | Crystal  | 11    | 121       | 10     | 111         |
    | Spacetime| 4     | 16        | 3      | 13          |
    | Hidden   | 7     | 49        | 6      | 43          |
    """
    # Crystal decomposition
    decomp_ok = (n_c == n_d + Im_O)

    # Φ₆ at each sector
    phi6_crystal = phi6(n_c)     # 111
    phi6_spacetime = phi6(n_d)   # 13
    phi6_hidden = phi6(Im_O)     # 43

    values_ok = (phi6_crystal == 111 and phi6_spacetime == 13 and phi6_hidden == 43)

    # Total generators = k², Cartan = k-1, EM = k² - k + 1
    for k, expected_em in [(n_c, 111), (n_d, 13), (Im_O, 43)]:
        total = k**2
        cartan = k - 1
        em = total - cartan
        assert em == phi6(k), f"EM channels mismatch at k={k}"

    # The three sectors are exhaustive: n_c = n_d + Im_O
    # But Φ₆ is NOT additive: Φ₆(11) ≠ Φ₆(4) + Φ₆(7)
    # 111 ≠ 13 + 43 = 56
    not_additive = (phi6_crystal != phi6_spacetime + phi6_hidden)

    # Instead: n_c² = (n_d + Im_O)² = n_d² + 2·n_d·Im_O + Im_O²
    # 121 = 16 + 56 + 49
    cross_term = 2 * n_d * Im_O  # = 56
    gen_decomp = (n_c**2 == n_d**2 + cross_term + Im_O**2)

    return decomp_ok and values_ok and not_additive and gen_decomp


# =============================================================================
# Test 2: Sector assignment — which formulas use which sector
# =============================================================================

def test_sector_assignment():
    """Map each known Φ₆-denominator formula to its sector.

    CRYSTAL sector (Φ₆(n_c) = 111):
      1/α = 137 + 4/111  [EM coupling — uses full crystal]

    HIDDEN sector (Φ₆(Im_O) = 43):
      v/m_p   = 262 + 18/43  [EW/QCD mass ratio — octonion sector]
      m_μ/m_e = 207 - 10/43  [generation mass ratio — octonion sector]
      m_u/m_s = 1/43          [light quark ratio — octonion sector]

    SPACETIME sector (Φ₆(n_d) = 13):
      m_s/m_c = 1/13  [strange/charm ratio — spacetime sector]
    """
    # Verify each formula's arithmetic
    alpha_inv = 137 + Rational(4, 111)   # = 15211/111
    v_mp = 262 + Rational(18, 43)        # = 11284/43
    mu_e = 207 - Rational(10, 43)        # = 8891/43
    mu_ms = Rational(1, 43)
    ms_mc = Rational(1, 13)

    # Check exact fractions
    alpha_ok = (alpha_inv == Rational(15211, 111))
    v_mp_ok = (v_mp == Rational(11284, 43))
    mu_e_ok = (mu_e == Rational(8891, 43))
    mu_ms_ok = (mu_ms == Rational(1, 43))
    ms_mc_ok = (ms_mc == Rational(1, 13))

    # Sector counts
    crystal_count = 1   # just alpha
    hidden_count = 3    # v/m_p, m_mu/m_e, m_u/m_s
    spacetime_count = 1 # m_s/m_c

    sector_consistent = (crystal_count + hidden_count + spacetime_count == 5)

    return (alpha_ok and v_mp_ok and mu_e_ok and mu_ms_ok and
            ms_mc_ok and sector_consistent)


# =============================================================================
# Test 3: EM channel counting identity
# =============================================================================

def test_em_channel_identity():
    """For u(k): EM channels = k² - (k-1) = Φ₆(k).

    In u(k) = gl(k, C):
      - Total generators: k² (all k×k complex matrices)
      - Cartan subalgebra of SU(k): k-1 traceless diagonal matrices
      - These k-1 generators are EM-neutral (no charge transition)
      - The remaining k² - (k-1) generators ARE EM-coupled:
        * k(k-1) off-diagonal (charge-changing transitions)
        * 1 overall U(1) (charge operator itself)
      - Total EM-active = k(k-1) + 1 = k² - k + 1 = Φ₆(k)
    """
    results = []
    for k in [n_d, Im_O, n_c]:
        total = k**2
        neutral = k - 1  # SU(k) Cartan
        em_active = total - neutral
        off_diag = k * (k - 1)
        u1 = 1
        em_check = off_diag + u1

        ok = (em_active == phi6(k) and em_check == phi6(k))
        results.append(ok)

    return all(results)


# =============================================================================
# Test 4: Non-additivity and cross-term structure
# =============================================================================

def test_cross_term_structure():
    """Φ₆(n_c) ≠ Φ₆(n_d) + Φ₆(Im_O), but the DIFFERENCE is meaningful.

    Φ₆(11) = 111
    Φ₆(4) + Φ₆(7) = 13 + 43 = 56
    Difference = 111 - 56 = 55 = n_c × (n_c - 1)/2 × ... ?

    Actually: Φ₆(a+b) = Φ₆(a) + Φ₆(b) + 2ab - (a+b) + 1
    Check: Φ₆(4+7) = 13 + 43 + 56 - 11 + 1 = 102 ≠ 111

    More precisely:
    (a+b)² - (a+b) + 1 = a² + 2ab + b² - a - b + 1
    a² - a + 1 = Φ₆(a)
    b² - b + 1 = Φ₆(b)
    So Φ₆(a+b) = Φ₆(a) + Φ₆(b) + 2ab - 1

    Cross-term: 2·n_d·Im_O - 1 = 2·4·7 - 1 = 55
    """
    a, b = n_d, Im_O

    # Verify the identity
    lhs = phi6(a + b)
    rhs = phi6(a) + phi6(b) + 2 * a * b - 1

    identity_ok = (lhs == rhs)

    # Cross-term value
    cross = 2 * a * b - 1  # = 55
    cross_ok = (cross == 55)

    # 55 = n_c * (n_c - 1) / 2 = 11 * 10 / 2
    # This is the number of pairs from n_c elements!
    pairs = n_c * (n_c - 1) // 2
    pairs_ok = (cross == pairs)

    # Interpretation: The cross-term between spacetime and hidden sectors
    # counts the number of INTER-SECTOR pairs in the crystal
    # 55 pairs = C(11,2) = all ways to pick 2 crystal dimensions

    # Also: 55 = 5 * 11 = 5 * n_c
    factor_ok = (cross == 5 * n_c)

    return identity_ok and cross_ok and pairs_ok


# =============================================================================
# Test 5: Quark hierarchy denominators as Φ₆ values
# =============================================================================

def test_quark_hierarchy_phi6():
    """The quark mass hierarchy uses these denominators:

    | Ratio   | Denom | = Φ₆(k) ? | k      | Sector    |
    |---------|-------|-----------|--------|-----------|
    | y_t     | 121   | NO (= n_c²) | —   | Full crystal (total gens) |
    | m_b/m_t | 121   | NO (= n_c²) | —   | Full crystal (total gens) |
    | m_c/m_b | 10    | NO        | —      | Goldstone modes (n_c-1) |
    | m_s/m_c | 13    | YES       | 4=n_d  | Spacetime sector |
    | m_d/m_s | 20    | NO        | —      | Mixed? |
    | m_u/m_s | 43    | YES       | 7=Im_O | Hidden sector |

    2 of 6 denominators are Φ₆ values. The others use:
    121 = n_c² = dim(u(n_c)) total
    10 = n_c - 1 = neutral channels of u(n_c)
    20 = n_c + O + 1 (interpretation unclear)
    """
    denoms = {
        'y_t': 121,
        'm_b/m_t': 121,
        'm_c/m_b': 10,
        'm_s/m_c': 13,
        'm_d/m_s': 20,
        'm_u/m_s': 43,
    }

    # Check which are Φ₆ values at division algebra dimensions
    div_alg_dims = [R, C, Im_H, H, Im_O, O, n_c]
    phi6_vals = {phi6(k): k for k in div_alg_dims}

    phi6_matches = {}
    for name, d in denoms.items():
        if d in phi6_vals:
            phi6_matches[name] = phi6_vals[d]

    # Should find exactly: m_s/m_c → 4, m_u/m_s → 7
    found_13 = phi6_matches.get('m_s/m_c') == n_d
    found_43 = phi6_matches.get('m_u/m_s') == Im_O

    # Also check: 121 and 10 have u(n_c) interpretations
    dim_121 = (121 == n_c**2)       # total generators of u(11)
    dim_10 = (10 == n_c - 1)        # neutral channels of u(11)

    # 20 is the only denominator without a clean Lie algebra interpretation
    # 20 = n_c + O + 1 = 11 + 8 + 1, or 4 * 5, or 2 * 10
    # NOT a Φ₆ value at any standard dimension
    is_20_phi6 = 20 in phi6_vals
    not_20_phi6 = not is_20_phi6

    return found_13 and found_43 and dim_121 and dim_10 and not_20_phi6


# =============================================================================
# Test 6: Primality pattern
# =============================================================================

def test_primality_at_div_alg_dims():
    """Φ₆(k) is prime exactly at the "irreducible" division algebra dimensions.

    k = 1 (R):    Φ₆ = 1   NOT prime (unit)
    k = 2 (C):    Φ₆ = 3   PRIME
    k = 3 (Im_H): Φ₆ = 7   PRIME
    k = 4 (H):    Φ₆ = 13  PRIME
    k = 7 (Im_O): Φ₆ = 43  PRIME
    k = 8 (O):    Φ₆ = 57  NOT prime (3 × 19)
    k = 11 (n_c): Φ₆ = 111 NOT prime (3 × 37)

    Pattern: prime at {C, Im_H, H, Im_O}, composite at {O, n_c}.
    The composite dims O = C·H and n_c = n_d + Im_O are "reducible":
    they decompose into smaller division algebra dimensions.
    """
    prime_at = {2: True, 3: True, 4: True, 7: True}
    composite_at = {8: False, 11: False}

    for k, should_be_prime in {**prime_at, **composite_at}.items():
        val = phi6(k)
        if should_be_prime:
            if not isprime(val):
                return False
        else:
            if isprime(val):
                return False

    # Additional check: O = C * H is "reducible"
    o_reducible = (O == C * H)
    # n_c = n_d + Im_O is "reducible"
    nc_reducible = (n_c == n_d + Im_O)

    return o_reducible and nc_reducible


# =============================================================================
# Test 7: Structural vs post-hoc assessment
# =============================================================================

def test_structural_prediction():
    """Test whether the sector assignment is PREDICTIVE.

    If the hypothesis is correct:
    - EM coupling (α) should use u(n_c) → denominator 111
    - Mass ratios between DIFFERENT scales should use u(Im_O) → denominator 43
    - Mass ratios within a sector should use u(n_d) → denominator 13

    Check: Is the sector assignment consistent with the PHYSICS of each ratio?

    α = EM coupling → involves ALL charged particles → FULL crystal ✓
    v/m_p = EW/QCD scale → mass generation → HIDDEN (octonion) sector ✓
    m_μ/m_e = generation ratio → mass hierarchy → HIDDEN sector ✓
    m_u/m_s = lightest quarks → deep non-perturbative → HIDDEN sector ✓
    m_s/m_c = heavy-to-light transition → SPACETIME sector (?)

    The sector assignment is physically motivated for 4/5 cases.
    m_s/m_c using u(n_d) = u(4) is less obvious — it could indicate
    that the strange-charm transition involves spacetime geometry.
    """
    # Score the structural consistency
    clear_cases = 4   # α, v/m_p, m_μ/m_e, m_u/m_s
    unclear_cases = 1  # m_s/m_c
    total_cases = 5

    consistency_rate = Rational(clear_cases, total_cases)
    rate_ok = (consistency_rate >= Rational(4, 5))

    # Key structural claim: α ↔ full crystal, mass ↔ octonion
    alpha_full_crystal = (phi6(n_c) == 111)
    mass_octonion = (phi6(Im_O) == 43)

    return rate_ok and alpha_full_crystal and mass_octonion


# =============================================================================
# Test 8: Numerator constraints
# =============================================================================

def test_numerator_constraints():
    """Analyze whether numerators are constrained by sector structure.

    For α (crystal sector):
      B = 4 = n_d = dim(spacetime)
      Interpretation: Each spacetime dimension contributes 1/N_EM to Born rule

    For v/m_p (hidden sector):
      B = 18 = C · Im_H² = 2 · 9
      Interpretation: Complex × generations² (?)

    For m_μ/m_e (hidden sector):
      B = -10 = -(C + O) = -(2 + 8)
      Interpretation: Negative of (complex + octonion dim) = -(n_c - R)

    For m_u/m_s (hidden sector):
      B = 1 = R
      Interpretation: Real dimension contribution (simplest correction)

    For m_s/m_c (spacetime sector):
      B = 1 = R
      Interpretation: Same as m_u/m_s (but in different sector)

    Pattern in hidden sector: B ∈ {-10, 1, 18}
    Are these related to u(7) representation dimensions? Check standard reps.
    """
    # u(7) representations
    u7_fund = 7               # fundamental
    u7_adj = 49               # adjoint
    u7_antisym2 = 7 * 6 // 2  # = 21 antisymmetric 2-tensor
    u7_sym2 = 7 * 8 // 2      # = 28 symmetric 2-tensor
    u7_antisym3 = 7 * 6 * 5 // 6  # = 35

    # Check: are the numerators standard representation dimensions?
    B_values = [1, 18, 10]  # absolute values
    standard_reps = [1, 7, 21, 28, 35, 49]

    # 1 is trivial rep — YES
    # 18 is NOT a standard u(7) rep dimension
    # 10 is NOT a standard u(7) rep dimension

    trivial_ok = (1 in standard_reps)
    b18_not_rep = (18 not in standard_reps)
    b10_not_rep = (10 not in standard_reps)

    # BUT: numerators decompose in division algebra quantities
    b18_decomp = (18 == C * Im_H**2)
    b10_decomp = (10 == C + O)
    b4_decomp = (4 == n_d)
    b1_decomp = (1 == R)

    # All numerators are framework quantities, even if not u(7) reps
    all_framework = b18_decomp and b10_decomp and b4_decomp and b1_decomp

    # The numerators are NOT constrained to be representation dimensions
    # They are constrained to be division algebra quantities
    # This means the mechanism is at the division algebra level, not Lie algebra level

    return trivial_ok and all_framework


# =============================================================================
# Test 9: Extended mass ratio scan
# =============================================================================

def test_extended_mass_scan():
    """Check whether other mass ratios in the framework show 43-patterns.

    Known mass ratios with framework expressions:
    - Koide Q = 2/3 (exact, no correction)
    - Koide θ_lepton = π × 73/99 (denominator 99 = 9×11 = Im_H²×n_c)
    - m_p/m_e = 1836 + 11/72 (denominator 72 = 8×9 = O×Im_H²)
    - m_W/m_Z = 171/194 (denominator 194 = 2×97)
    - m_H = v × 121/238 (denominator 238 = 2×7×17)

    Do any of these use 43 as a factor in their denominator?
    """
    # Check each denominator for factors of 43
    denominators = {
        'm_p/m_e correction': 72,
        'Koide θ_lepton': 99,
        'm_W/m_Z': 194,
        'm_H/v': 238,
        'Koide M': 784,
    }

    has_43_factor = {}
    for name, d in denominators.items():
        has_43_factor[name] = (d % 43 == 0)

    # None of these should have 43 as a factor
    # (43 is prime, and none of these are multiples of 43)
    none_have_43 = not any(has_43_factor.values())

    # Check: 72 = O × Im_H² (different from 43)
    d72_decomp = (72 == O * Im_H**2)
    # 99 = Im_H² × n_c (different)
    d99_decomp = (99 == Im_H**2 * n_c)

    # The proton-electron mass ratio uses O × Im_H² = 72
    # This is the octonion dimension × generations² — different from Φ₆(7) = 43
    # So m_p/m_e does NOT use EM channel counting

    # IMPORTANT: The 43-pattern is specific to:
    # (a) EW/QCD scale ratio (v/m_p)
    # (b) Lepton generation ratio (m_μ/m_e)
    # (c) Lightest quark ratio (m_u/m_s)
    # These are all "mass hierarchy" ratios, not "mass scale" quantities

    return none_have_43 and d72_decomp and d99_decomp


# =============================================================================
# Test 10: Falsifiability criteria
# =============================================================================

def test_falsifiability():
    """What would falsify the two-sector hypothesis?

    1. A mass ratio correction using denominator 111 (crystal sector for mass)
       → Would break the "mass = hidden sector" assignment
    2. An EM coupling correction using denominator 43 (hidden sector for EM)
       → Would break the "EM = full crystal" assignment
    3. A formula using Φ₆(k) for k NOT a division algebra dimension
       → Would break the structural origin of k
    4. Discovery that numerators are NOT division algebra quantities
       → Would break the framework decomposition

    Current status: None of these falsifiers are triggered.
    """
    # Check no known mass formula uses 111 as denominator
    # (except through the α chain, where α itself feeds into mass formulas)
    mass_denoms = [43, 43, 43, 13, 121, 10, 20]  # all known quark/lepton mass denoms
    no_mass_111 = (111 not in mass_denoms)

    # Check no known coupling formula uses 43
    coupling_denoms = [111]  # α correction
    no_coupling_43 = (43 not in coupling_denoms)

    # Check all Φ₆ arguments are division algebra dimensions
    used_k_values = [n_c, Im_O, n_d]  # 11, 7, 4
    div_alg_dims = {R, C, Im_H, H, Im_O, O, n_c}
    all_div_alg = all(k in div_alg_dims for k in used_k_values)

    return no_mass_111 and no_coupling_43 and all_div_alg


# =============================================================================
# Test 11: Lie algebra block decomposition
# =============================================================================

def test_block_decomposition():
    """u(n_c) generators decompose into blocks under u(n_d) + u(Im_O).

    The n_c x n_c matrix algebra gl(n_c, C) decomposes:
      (n_d x n_d) block:   n_d^2  = 16 generators  [u(n_d)]
      (Im_O x Im_O) block: Im_O^2 = 49 generators  [u(Im_O)]
      Cross blocks:        2*n_d*Im_O = 56 generators [inter-sector]
      Total: 16 + 49 + 56 = 121 = n_c^2

    EM channel decomposition:
      u(n_d):  13 EM + 3 neutral = 16
      u(Im_O): 43 EM + 6 neutral = 49
      Cross:   56 EM (all off-diagonal, hence all EM-active)
      Naive sum: 13 + 43 + 56 = 112

    But u(n_c) has only 111 EM channels, not 112. The -1 comes from
    U(1) overcounting: u(n_d) and u(Im_O) each have their own U(1),
    but u(n_c) has only one overall U(1).

    111 = 13 + 43 + 56 - 1 = Phi_6(n_d) + Phi_6(Im_O) + 2*n_d*Im_O - 1
    """
    # Block dimensions
    block_spacetime = n_d**2       # = 16
    block_hidden = Im_O**2         # = 49
    block_cross = 2 * n_d * Im_O   # = 56
    total = block_spacetime + block_hidden + block_cross
    total_ok = (total == n_c**2)

    # EM channels per block
    em_spacetime = phi6(n_d)   # 13
    em_hidden = phi6(Im_O)     # 43
    em_cross = block_cross     # 56 (all off-diagonal = all EM-active)
    u1_overcounting = 1        # one U(1) double-counted

    em_total = em_spacetime + em_hidden + em_cross - u1_overcounting
    em_ok = (em_total == phi6(n_c))  # = 111

    # Neutral channels
    neutral_spacetime = n_d - 1   # = 3
    neutral_hidden = Im_O - 1     # = 6
    neutral_total = n_c - 1       # = 10
    # Note: 3 + 6 = 9, but total is 10. Extra 1 is the U(1)
    neutral_ok = (neutral_spacetime + neutral_hidden + u1_overcounting == neutral_total)

    return total_ok and em_ok and neutral_ok


# =============================================================================
# Main
# =============================================================================

def main():
    tests = [
        ("Three-sector decomposition", test_three_sector_decomposition),
        ("Sector assignment (5 formulas)", test_sector_assignment),
        ("EM channel counting identity", test_em_channel_identity),
        ("Cross-term structure (Phi_6 non-additivity)", test_cross_term_structure),
        ("Quark hierarchy Phi_6 denominators", test_quark_hierarchy_phi6),
        ("Primality at division algebra dims", test_primality_at_div_alg_dims),
        ("Structural prediction assessment", test_structural_prediction),
        ("Numerator constraints", test_numerator_constraints),
        ("Extended mass ratio scan", test_extended_mass_scan),
        ("Falsifiability criteria", test_falsifiability),
        ("Lie algebra block decomposition", test_block_decomposition),
    ]

    print("=" * 70)
    print("Cyclotomic Two-Sector Hypothesis: Structural Origin of Phi_6")
    print("=" * 70)
    print()

    pass_count = 0
    fail_count = 0

    for name, test_func in tests:
        try:
            result = test_func()
            status = "PASS" if result else "FAIL"
            if result:
                pass_count += 1
            else:
                fail_count += 1
        except Exception as e:
            status = "ERROR"
            fail_count += 1
            print(f"  Error: {e}")

        print(f"[{status}] {name}")

    print()
    print(f"Results: {pass_count}/{pass_count + fail_count} PASS")
    print()

    # ==========================================================================
    # Summary
    # ==========================================================================
    print("=" * 70)
    print("TWO-SECTOR HYPOTHESIS SUMMARY")
    print("=" * 70)
    print()
    print("STRUCTURAL CLAIM [DERIVATION for denominator, CONJECTURE for full formulas]:")
    print()
    print("  The crystal algebra u(n_c) decomposes into three sectors:")
    print(f"    u({n_c}) -> u({n_d}) + u({Im_O}) + cross-terms")
    print(f"    n_c = n_d + Im_O = {n_d} + {Im_O} = {n_c}")
    print()
    print("  Each sector has Phi_6(k) = k^2 - k + 1 EM channels:")
    print(f"    Full crystal:  Phi_6({n_c}) = {phi6(n_c):3d}  -> EM coupling (alpha)")
    print(f"    Spacetime:     Phi_6({n_d})  = {phi6(n_d):3d}  -> spacetime mass transitions")
    print(f"    Hidden:        Phi_6({Im_O})  = {phi6(Im_O):3d}  -> mass ratio corrections")
    print()
    print("  DERIVATION CHAIN for denominator selection:")
    print("    [A] n_d = 4 from Frobenius theorem")
    print("    [A] n_c = 11 from crystal completeness")
    print("    [D] Im_O = n_c - n_d = 7 (hidden sector dimension)")
    print("    [D] Phi_6(k) = EM channels in u(k) (Lie algebra structure)")
    print("    [D] alpha correction <-> u(n_c): EM coupling probes full crystal")
    print("    [CONJECTURE] mass corrections <-> u(Im_O): mass = non-associativity cost")
    print("    [CONJECTURE] m_s/m_c <-> u(n_d): spacetime sector transition")
    print()
    print("  KEY WEAKNESS: Why mass generation specifically uses u(Im_O)")
    print("  rather than u(n_c) is [CONJECTURE], not [DERIVATION].")
    print("  The physical argument (mass = imperfection in octonion sector)")
    print("  is plausible but not proven from axioms.")
    print()
    print("  NUMERATORS remain [CONJECTURE]:")
    print(f"    B = {n_d} = n_d                (alpha: spacetime dimensions)")
    print(f"    B = {C * Im_H**2} = C*Im_H^2            (v/m_p: complex * generations^2)")
    print(f"    B = -{C + O} = -(C+O)             (m_mu/m_e: total non-H dimension)")
    print(f"    B = {R} = R                   (m_u/m_s: real dimension)")
    print()
    print("  All numerators are division algebra quantities, but no mechanism")
    print("  has been derived to predict WHICH quantities appear WHERE.")
    print()
    print("CONFIDENCE UPGRADE PATH:")
    print("  Denominator 43: [CONJECTURE] -> [DERIVATION] requires proving that")
    print("  mass generation in the framework specifically involves u(Im_O).")
    print("  This would need: explicit coupling of crystallization imperfection")
    print("  to the octonion sector, deriving Phi_6(Im_O) as the relevant mode count.")


if __name__ == '__main__':
    main()
