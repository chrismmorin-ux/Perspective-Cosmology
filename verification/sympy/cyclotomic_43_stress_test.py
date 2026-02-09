#!/usr/bin/env python3
"""
Cyclotomic 43 Stress Test: Numerator Mechanism and Uniqueness Analysis

SESSION S226 (EQ-012)

GOALS:
1. Denominator uniqueness: How special is D=43 among D in [2,200]?
2. Polynomial uniqueness: How many degree-2 polynomials fit all three formulas?
3. Cyclotomic comparison: Do other Phi_n polynomials work at div alg dims?
4. Numerator analysis: Are B = {4, 18, -10, 1} derivable or post-hoc?
5. Cross-sector channels: Do the 55 inter-sector channels appear anywhere?
6. Look-elsewhere: Quantitative probability of pattern by chance

KEY MEASURED VALUES:
  1/alpha = 137.035999177 (CODATA 2022)
  v = 246.21965 GeV, m_p = 0.93827208816 GeV => v/m_p = 262.41825...
  m_mu/m_e = 206.7682830 (CODATA 2022)

FRAMEWORK PREDICTIONS:
  1/alpha = 137 + 4/111      (0.27 ppm)
  v/m_p   = 262 + 18/43      (1.63 ppm)
  m_mu/m_e = 207 - 10/43     (4.1 ppm)

Status: INVESTIGATION (stress testing framework claims)
Dependencies: cyclotomic_43_two_sector.py, cyclotomic_43_pattern.py
"""

from sympy import (
    Rational, isprime, cyclotomic_poly, Symbol, Integer,
    factorint
)
import math


# =============================================================================
# Framework constants
# =============================================================================
R, C, H, O = 1, 2, 4, 8
Im_C, Im_H, Im_O = 1, 3, 7
n_d = 4
n_c = 11


def phi6(k):
    """Phi_6(k) = k^2 - k + 1."""
    return k**2 - k + 1


# Measured values (high precision)
ALPHA_INV_MEAS = 137.035999177
V_MP_MEAS = 246.21965 / 0.93827208816
MU_E_MEAS = 206.7682830


# =============================================================================
# Helper: best A + B/D fit
# =============================================================================
def best_fit(x, D):
    """Find best (A, B) such that x ~ A + B/D with |B| minimized."""
    A_floor = math.floor(x)
    frac = x - A_floor
    B_raw = frac * D
    B_round = round(B_raw)
    residual = abs(B_raw - B_round)

    # Center B to minimize |B|
    if B_round > D / 2:
        B_centered = B_round - D
        A_centered = A_floor + 1
    else:
        B_centered = B_round
        A_centered = A_floor
    return A_centered, B_centered, residual


# =============================================================================
# Test 1: Denominator Scan -- How unique is D=43?
# =============================================================================
def test_denominator_scan():
    """For D in [2, 200], find denominators that simultaneously give
    near-integer B values for BOTH v/m_p AND m_mu/m_e with |B| <= 20."""
    tolerance = 0.05
    B_max = 20
    phi6_vals = {phi6(k) for k in range(1, 20)}
    good = []

    for D in range(2, 201):
        _, B_v, res_v = best_fit(V_MP_MEAS, D)
        _, B_mu, res_mu = best_fit(MU_E_MEAS, D)

        if (res_v < tolerance and res_mu < tolerance
                and abs(B_v) <= B_max and abs(B_mu) <= B_max):
            good.append({
                'D': D,
                'B_v': B_v, 'res_v': res_v,
                'B_mu': B_mu, 'res_mu': res_mu,
                'prime': isprime(D),
                'phi6': D in phi6_vals
            })

    d43_found = any(d['D'] == 43 for d in good)
    return d43_found, good


# =============================================================================
# Test 2: Triple-fit polynomial search
# =============================================================================
def test_polynomial_triple_fit():
    """Among monic degree-2 polynomials p(x) = x^2 + bx + c with b,c in [-5,5],
    find those that produce good A+B/D fits at BOTH p(7) (mass ratios) AND
    p(11) (alpha) simultaneously."""
    tolerance = 0.05
    B_max = 20
    good = []

    for b in range(-5, 6):
        for c in range(-5, 6):
            D7 = 49 + 7 * b + c
            D11 = 121 + 11 * b + c
            if D7 < 2 or D11 < 2:
                continue

            _, B_v, res_v = best_fit(V_MP_MEAS, D7)
            _, B_mu, res_mu = best_fit(MU_E_MEAS, D7)
            _, B_alpha, res_alpha = best_fit(ALPHA_INV_MEAS, D11)

            if (res_v < tolerance and abs(B_v) <= B_max
                    and res_mu < tolerance and abs(B_mu) <= B_max
                    and res_alpha < tolerance and abs(B_alpha) <= B_max):
                good.append({
                    'b': b, 'c': c,
                    'D7': D7, 'D11': D11,
                    'B_v': B_v, 'B_mu': B_mu, 'B_alpha': B_alpha,
                    'res_v': res_v, 'res_mu': res_mu, 'res_alpha': res_alpha,
                    'is_phi6': (b == -1 and c == 1)
                })

    phi6_found = any(p['is_phi6'] for p in good)
    return phi6_found, good


# =============================================================================
# Test 3: Monic quadratic uniqueness theorem
# =============================================================================
def test_quadratic_uniqueness():
    """A monic quadratic p(x) = x^2+bx+c is uniquely determined by two
    evaluation constraints. If p(7) = 43 AND p(4) = 13, then b = -1, c = 1.

    This means Phi_6 is the UNIQUE monic quadratic mapping
    (7 -> 43, 4 -> 13). And it also gives 11 -> 111.
    """
    # p(7) = 49 + 7b + c = 43  =>  7b + c = -6
    # p(4) = 16 + 4b + c = 13  =>  4b + c = -3
    # Subtract: 3b = -3 => b = -1, c = -3 + 4 = 1
    b_solved = -1
    c_solved = 1

    # Verify
    p7 = 49 + 7 * b_solved + c_solved
    p4 = 16 + 4 * b_solved + c_solved
    p11 = 121 + 11 * b_solved + c_solved

    unique_ok = (p7 == 43 and p4 == 13 and p11 == 111)
    is_phi6 = (b_solved == -1 and c_solved == 1)

    return unique_ok and is_phi6


# =============================================================================
# Test 4: Cyclotomic polynomial comparison
# =============================================================================
def test_cyclotomic_comparison():
    """Evaluate Phi_n(7) for n = 1..30 and test which produce good fits
    for both v/m_p and m_mu/m_e."""
    x = Symbol('x')
    tolerance = 0.1
    B_max = 25
    results = []

    for n in range(1, 31):
        poly = cyclotomic_poly(n, x)
        D7 = int(poly.subs(x, 7))
        D11 = int(poly.subs(x, 11))
        if D7 < 2 or D7 > 5000:
            continue

        _, B_v, res_v = best_fit(V_MP_MEAS, D7)
        _, B_mu, res_mu = best_fit(MU_E_MEAS, D7)

        good = (res_v < tolerance and res_mu < tolerance
                and abs(B_v) <= B_max and abs(B_mu) <= B_max)

        results.append({
            'n': n, 'D7': D7, 'D11': D11,
            'B_v': B_v, 'res_v': res_v,
            'B_mu': B_mu, 'res_mu': res_mu,
            'good': good
        })

    good_count = sum(1 for r in results if r['good'])
    phi6_good = any(r['n'] == 6 and r['good'] for r in results)
    return phi6_good, good_count, results


# =============================================================================
# Test 5: Numerator decomposition uniqueness
# =============================================================================
def test_numerator_uniqueness():
    """Count how many ways each B value can be written as a*x + b*y
    with a,b in {-2,-1,0,1,2} and x,y in {1,2,3,4,7,8,11}.

    High counts = decomposition NOT unique = consistent with post-hoc fitting.
    Low counts = decomposition constrained = may be derivable.
    """
    dims = [1, 2, 3, 4, 7, 8, 11]
    coeffs = [-2, -1, 0, 1, 2]
    B_targets = {'alpha_B': 4, 'v_mp_B': 18, 'mu_e_B': -10, 'mu_ms_B': 1}

    counts = {}
    examples = {}
    for name, target in B_targets.items():
        ways = []
        for a in coeffs:
            for xi in dims:
                for b in coeffs:
                    for yi in dims:
                        if a * xi + b * yi == target:
                            ways.append((a, xi, b, yi))
        counts[name] = len(ways)
        examples[name] = ways[:3]  # first 3

    all_decompose = all(c > 0 for c in counts.values())
    all_many = all(c > 5 for c in counts.values())

    return all_decompose, all_many, counts, examples


# =============================================================================
# Test 6: Cross-sector channel search
# =============================================================================
def test_cross_sector_channels():
    """Check if 55 = 2*n_d*Im_O - 1 or 56 = 2*n_d*Im_O appear
    in known framework formula numbers."""
    cross_55 = 2 * n_d * Im_O - 1
    cross_56 = 2 * n_d * Im_O

    known_numbers = {
        111, 43, 13, 121, 10, 20, 72, 99, 194, 238, 784,
        137, 262, 207, 1836, 4, 18, 23, 11, 8
    }

    direct_55 = cross_55 in known_numbers
    direct_56 = cross_56 in known_numbers

    # Check factors
    factor_55 = [n for n in known_numbers if n > 55 and n % 55 == 0]
    factor_56 = [n for n in known_numbers if n > 56 and n % 56 == 0]

    # 784 = 56 * 14 = 4 * n_d * Im_O^2
    has_784_56 = (784 == cross_56 * 14)
    has_784_alt = (784 == 4 * n_d * Im_O ** 2)

    return {
        'cross_55': cross_55,
        'cross_56': cross_56,
        'direct_55': direct_55,
        'direct_56': direct_56,
        'factor_55': factor_55,
        'factor_56': factor_56,
        '784_has_56': has_784_56,
        '784_alt': has_784_alt,
        'decomp_55': (55 == 5 * n_c),
        'decomp_56': (56 == O * Im_O),
    }


# =============================================================================
# Test 7: Look-elsewhere probability
# =============================================================================
def test_look_elsewhere():
    """Quantify: fraction of D in [2,200] that produces good dual fits.
    Also estimate probability of the polynomial structure arising by chance."""
    tolerance = 0.05
    B_max = 20
    total = 199

    good_v = good_mu = good_both = 0

    for D in range(2, 201):
        _, B_v, res_v = best_fit(V_MP_MEAS, D)
        _, B_mu, res_mu = best_fit(MU_E_MEAS, D)
        v_ok = (res_v < tolerance and abs(B_v) <= B_max)
        mu_ok = (res_mu < tolerance and abs(B_mu) <= B_max)
        if v_ok:
            good_v += 1
        if mu_ok:
            good_mu += 1
        if v_ok and mu_ok:
            good_both += 1

    p_v = good_v / total
    p_mu = good_mu / total
    p_both = good_both / total
    p_ind = p_v * p_mu

    return {
        'total': total,
        'good_v': good_v, 'good_mu': good_mu, 'good_both': good_both,
        'p_v': p_v, 'p_mu': p_mu, 'p_both': p_both,
        'p_independent': p_ind,
        'enhancement': p_both / p_ind if p_ind > 0 else float('inf')
    }


# =============================================================================
# Test 8: Tighter scan -- sub-2-ppm dual fits
# =============================================================================
def test_tight_scan():
    """Repeat denominator scan with TIGHT tolerance (0.02) requiring
    sub-2-ppm precision for both ratios. How many denominators survive?"""
    tolerance = 0.02
    B_max = 20
    good = []

    for D in range(2, 201):
        _, B_v, res_v = best_fit(V_MP_MEAS, D)
        _, B_mu, res_mu = best_fit(MU_E_MEAS, D)
        if (res_v < tolerance and res_mu < tolerance
                and abs(B_v) <= B_max and abs(B_mu) <= B_max):
            good.append((D, B_v, res_v, B_mu, res_mu))

    return good


# =============================================================================
# Main
# =============================================================================
def main():
    print("=" * 70)
    print("CYCLOTOMIC 43 STRESS TEST")
    print("Session S226 -- Numerator Mechanism and Uniqueness")
    print("=" * 70)

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

    # Confirm measured values
    print(f"\nMeasured: 1/alpha = {ALPHA_INV_MEAS}")
    print(f"Measured: v/m_p   = {V_MP_MEAS:.8f}")
    print(f"Measured: m_mu/m_e = {MU_E_MEAS}")
    print(f"Framework: 137+4/111 = {float(137 + Rational(4, 111)):.10f}")
    print(f"Framework: 262+18/43 = {float(262 + Rational(18, 43)):.10f}")
    print(f"Framework: 207-10/43 = {float(207 - Rational(10, 43)):.10f}")

    # ---- Test 1 ----
    print("\n" + "-" * 70)
    print("TEST 1: Denominator Scan (D in [2, 200], tol=0.05, |B|<=20)")
    print("-" * 70)
    d43_ok, denoms = test_denominator_scan()
    print(f"Denominators good for BOTH v/m_p and m_mu/m_e: {len(denoms)}/199")
    print()
    for d in sorted(denoms, key=lambda x: x['D']):
        tags = []
        if d['prime']:
            tags.append("PRIME")
        if d['phi6']:
            tags.append("Phi6")
        tag_str = " ".join(tags)
        print(f"  D={d['D']:4d}: B_v={d['B_v']:+4d} (r={d['res_v']:.3f})  "
              f"B_mu={d['B_mu']:+4d} (r={d['res_mu']:.3f})  {tag_str}")
    report("D=43 in dual-fit list", d43_ok)

    # ---- Test 2 ----
    print("\n" + "-" * 70)
    print("TEST 2: Polynomial Triple Fit (x^2+bx+c, b,c in [-5,5])")
    print("  Requires good fit at p(7) for mass AND p(11) for alpha")
    print("-" * 70)
    poly_ok, polys = test_polynomial_triple_fit()
    print(f"Polynomials good for ALL THREE formulas: {len(polys)}")
    print()
    for p in polys:
        tag = " *** Phi_6 ***" if p['is_phi6'] else ""
        print(f"  x^2{p['b']:+d}x{p['c']:+d}: D7={p['D7']}, D11={p['D11']} "
              f"-> B_v={p['B_v']:+d}, B_mu={p['B_mu']:+d}, "
              f"B_alpha={p['B_alpha']:+d}  "
              f"(res: {p['res_v']:.3f}, {p['res_mu']:.3f}, {p['res_alpha']:.3f})"
              f"{tag}")
    report("Phi_6 in polynomial triple-fit list", poly_ok)
    report("Polynomial triple fit is selective (<= 5 solutions)",
           len(polys) <= 5)

    # ---- Test 3 ----
    print("\n" + "-" * 70)
    print("TEST 3: Monic Quadratic Uniqueness Theorem")
    print("-" * 70)
    unique_ok = test_quadratic_uniqueness()
    print("  Claim: if p(7)=43 AND p(4)=13, then p(x) = x^2-x+1 = Phi_6")
    print(f"  Solving: 7b+c=-6, 4b+c=-3 => b=-1, c=1")
    print(f"  Then p(11) = 121-11+1 = 111  (alpha denominator)")
    report("Phi_6 is unique monic quadratic with p(7)=43, p(4)=13", unique_ok)

    # ---- Test 4 ----
    print("\n" + "-" * 70)
    print("TEST 4: Cyclotomic Comparison (Phi_n at k=7, n=1..30)")
    print("-" * 70)
    cyc_ok, cyc_count, cyc_results = test_cyclotomic_comparison()
    print(f"Cyclotomic polynomials with good dual fits: {cyc_count}")
    print()
    for r in cyc_results:
        if r['good'] or r['n'] == 6:
            tag = " *** Phi_6 ***" if r['n'] == 6 else ""
            g = "GOOD" if r['good'] else "    "
            print(f"  {g} Phi_{r['n']:2d}(7)={r['D7']:5d}: "
                  f"B_v={r['B_v']:+4d} (r={r['res_v']:.3f})  "
                  f"B_mu={r['B_mu']:+4d} (r={r['res_mu']:.3f}){tag}")
    report("Phi_6 produces good dual fits", cyc_ok)

    # ---- Test 5 ----
    print("\n" + "-" * 70)
    print("TEST 5: Numerator Decomposition Uniqueness")
    print("-" * 70)
    decomp_ok, all_many, counts, examples = test_numerator_uniqueness()
    print("  Ways to write B = a*x + b*y with a,b in {-2..2}, x,y in div alg dims:")
    for name, count in counts.items():
        exs = examples[name][:2]
        ex_str = "; ".join(f"{a}*{xi}+{b}*{yi}" for a, xi, b, yi in exs)
        print(f"    {name:10s} = {count:3d} ways  (e.g. {ex_str})")
    print()
    if all_many:
        print("  FINDING: ALL numerators have many decompositions (>5 each)")
        print("  This is CONSISTENT WITH post-hoc pattern matching")
    report("All numerators decompose in div alg quantities", decomp_ok)
    report("Numerator decompositions are NOT unique (all > 5 ways)", all_many)

    # ---- Test 6 ----
    print("\n" + "-" * 70)
    print("TEST 6: Cross-Sector Channel Search (55 = 2*n_d*Im_O - 1)")
    print("-" * 70)
    cross = test_cross_sector_channels()
    print(f"  55 = {cross['cross_55']} (cross-sector EM channels)")
    print(f"  56 = {cross['cross_56']} (cross-sector generators)")
    print(f"  55 appears directly in formulas: {cross['direct_55']}")
    print(f"  56 appears directly in formulas: {cross['direct_56']}")
    print(f"  55 is factor of known numbers: {cross['factor_55'] or 'none'}")
    print(f"  56 is factor of known numbers: {cross['factor_56'] or 'none'}")
    print(f"  55 = 5*n_c: {cross['decomp_55']}")
    print(f"  56 = O*Im_O: {cross['decomp_56']}")
    print(f"  784 (Koide M) = 56*14 = 4*n_d*Im_O^2: {cross['784_alt']}")
    report("Cross-sector channels not yet in formulas (prediction)",
           not cross['direct_55'] and not cross['direct_56'])

    # ---- Test 7 ----
    print("\n" + "-" * 70)
    print("TEST 7: Look-Elsewhere Probability")
    print("-" * 70)
    prob = test_look_elsewhere()
    print(f"  D range: [2, 200] ({prob['total']} values)")
    print(f"  Good for v/m_p alone:    {prob['good_v']:3d} ({prob['p_v']:.1%})")
    print(f"  Good for m_mu/m_e alone: {prob['good_mu']:3d} ({prob['p_mu']:.1%})")
    print(f"  Good for BOTH:           {prob['good_both']:3d} ({prob['p_both']:.1%})")
    print(f"  Expected if independent: {prob['p_independent']:.1%}")
    print(f"  Enhancement factor:      {prob['enhancement']:.1f}x")
    notable = prob['p_both'] < 0.10
    report(f"Dual-fit probability < 10%", notable)

    # ---- Test 8 ----
    print("\n" + "-" * 70)
    print("TEST 8: Tight Scan (tol=0.02, both ratios)")
    print("-" * 70)
    tight = test_tight_scan()
    print(f"  Denominators surviving tight tolerance: {len(tight)}")
    for D, B_v, res_v, B_mu, res_mu in tight:
        tag = " *** D=43 ***" if D == 43 else ""
        print(f"    D={D:4d}: B_v={B_v:+4d} (r={res_v:.4f})  "
              f"B_mu={B_mu:+4d} (r={res_mu:.4f}){tag}")
    tight_43 = any(d[0] == 43 for d in tight)
    report("D=43 survives tight tolerance", tight_43)
    report("Tight scan is highly selective (<= 3 survivors)", len(tight) <= 3)

    # ==========================================================================
    # Summary
    # ==========================================================================
    total = pass_count + fail_count
    print("\n" + "=" * 70)
    print(f"Results: {pass_count}/{total} PASS")
    print("=" * 70)

    print("\n" + "=" * 70)
    print("OVERALL ASSESSMENT")
    print("=" * 70)
    print()
    print("DENOMINATOR SELECTION (Phi_6 -> {111, 43, 13}):")
    print("  Structural origin: [DERIVATION] (EM channels in u(k))")
    print("  Quadratic uniqueness: [THEOREM] (unique monic quad with p(7)=43, p(4)=13)")
    print(f"  Denominator scan: {len(denoms)} alternatives in [2,200] (tolerance 0.05)")
    print()
    print("NUMERATOR SELECTION (B = {4, 18, -10, 1}):")
    print("  All decompose in div alg quantities: YES")
    print("  Decompositions unique: NO (many alternatives)")
    print("  Any derivation mechanism: NO")
    print("  Assessment: [CONJECTURE] -- post-hoc pattern matching")
    print()
    print("CROSS-SECTOR CHANNELS (55):")
    print("  Appear in formulas: NOT YET")
    print("  Prediction: 55 should appear in some inter-sector mass ratio")
    print("  Status: UNTESTED structural prediction")
    print()
    print("IMPLICATION FOR TIER 1 CLAIMS:")
    print("  v/m_p (1.63 ppm): denominator [DERIVATION], numerator [CONJECTURE]")
    print("  m_mu/m_e (4.1 ppm): denominator [DERIVATION], numerator [CONJECTURE]")
    print("  CAVEAT: Full formulas remain post-hoc. Precision is real but")
    print("  explanation covers only the denominator, not the full expression.")


if __name__ == '__main__':
    main()
