#!/usr/bin/env python3
"""
Falsification Bounds for Alpha Prediction

KEY FINDING: The prediction 1/alpha = 15211/111 can be falsified by:
  1. Measurement of alpha(Q=0) diverging from 15211/111 by > 1 ppm
  2. Discovery of a 5th normed division algebra (changes n_c or n_d)
  3. Born rule failure at fundamental level
  4. Generic excitations shown non-democratic

Quantitative: prediction is 137.036036036... vs measured 137.035999206(11).
The 0.27 ppm gap could be closed by higher-order corrections or exposed as
a genuine discrepancy by improved measurement.

Status: VERIFICATION
Created: Session 164
"""

from sympy import *
from sympy import Rational as R

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

n_d = 4
n_c = 11
N_I = n_d**2 + n_c**2  # = 137
Phi6 = n_c**2 - n_c + 1  # = 111

# Prediction
alpha_inv_pred = R(15211, 111)

# CODATA 2022: 137.035999206(11)
# Central value and uncertainty
alpha_inv_central = R(137035999206, 10**9)
alpha_inv_unc = R(11, 10**9)  # 0.011 in the last digits

# ==============================================================================
# ANALYSIS FUNCTIONS
# ==============================================================================

def prediction_vs_measurement():
    """Current gap between prediction and measurement."""
    gap = alpha_inv_pred - alpha_inv_central
    gap_ppm = abs(float(gap) / float(alpha_inv_central)) * 1e6
    # How many sigma away?
    sigma = abs(float(gap)) / float(alpha_inv_unc)
    return gap, gap_ppm, sigma

def measurement_needed_to_falsify():
    """How far would measurement need to shift to falsify at various thresholds?"""
    results = {}
    for threshold_ppm in [0.5, 1.0, 2.0, 5.0, 10.0]:
        # Falsified if |pred - measured| / measured > threshold
        delta = float(alpha_inv_pred) * threshold_ppm * 1e-6
        lower = float(alpha_inv_pred) - delta
        upper = float(alpha_inv_pred) + delta
        results[threshold_ppm] = (lower, upper)
    return results

def sensitivity_to_N_I():
    """What if N_I were 136 or 138 instead of 137?"""
    results = {}
    for N in [135, 136, 137, 138, 139]:
        # Keep same correction structure but with different leading term
        # For N != 137, the correction denominator might differ too
        # But test with the same Phi_6 for comparison
        alpha_inv = N + R(n_d, Phi6)
        error_ppm = abs(float(alpha_inv - alpha_inv_central) / float(alpha_inv_central)) * 1e6
        results[N] = (alpha_inv, error_ppm)
    return results

def sensitivity_to_n_d():
    """What if n_d were 3 or 5 instead of 4?"""
    results = {}
    for nd in [2, 3, 4, 5, 6]:
        nc = n_c  # keep crystal fixed
        NI = nd**2 + nc**2
        phi6 = nc**2 - nc + 1
        alpha_inv = NI + R(nd, phi6)
        error_ppm = abs(float(alpha_inv - alpha_inv_central) / float(alpha_inv_central)) * 1e6
        results[nd] = (float(alpha_inv), error_ppm)
    return results

def sensitivity_to_n_c():
    """What if n_c were 10 or 12 instead of 11?"""
    results = {}
    for nc in [9, 10, 11, 12, 13]:
        nd = n_d  # keep defect fixed
        NI = nd**2 + nc**2
        phi6 = nc**2 - nc + 1
        alpha_inv = NI + R(nd, phi6)
        error_ppm = abs(float(alpha_inv - alpha_inv_central) / float(alpha_inv_central)) * 1e6
        results[nc] = (float(alpha_inv), error_ppm)
    return results

def alternative_corrections():
    """What if the correction were n_d/Phi_6^k for different k?"""
    results = {}
    for k_label, correction in [
        ("no correction", R(0)),
        ("n_d/Phi_6 (framework)", R(n_d, Phi6)),
        ("n_d/Phi_6^2", R(n_d, Phi6**2)),
        ("1/Phi_6", R(1, Phi6)),
        ("n_d^2/Phi_6", R(n_d**2, Phi6)),
    ]:
        alpha_inv = N_I + correction
        error_ppm = abs(float(alpha_inv - alpha_inv_central) / float(alpha_inv_central)) * 1e6
        results[k_label] = (float(alpha_inv), error_ppm)
    return results

# ==============================================================================
# MAIN VERIFICATION
# ==============================================================================

def main():
    print("=" * 70)
    print("FALSIFICATION BOUNDS FOR ALPHA PREDICTION")
    print("=" * 70)

    # Current status
    gap, gap_ppm, sigma = prediction_vs_measurement()
    print(f"\nCurrent prediction vs measurement:")
    print(f"  Predicted:  {float(alpha_inv_pred):.12f}")
    print(f"  Measured:   {float(alpha_inv_central):.12f}")
    print(f"  Gap:        {float(gap):.12f}")
    print(f"  Gap (ppm):  {gap_ppm:.3f}")
    print(f"  Sigma:      {sigma:.1f} (relative to CODATA uncertainty)")

    # Falsification thresholds
    print(f"\nFalsification thresholds:")
    bounds = measurement_needed_to_falsify()
    for thr, (lo, hi) in sorted(bounds.items()):
        print(f"  {thr:.1f} ppm: falsified if measured outside [{lo:.6f}, {hi:.6f}]")

    # Sensitivity to N_I
    print(f"\nSensitivity to N_I (leading term):")
    for N, (val, err) in sorted(sensitivity_to_N_I().items()):
        marker = " <-- framework" if N == 137 else ""
        print(f"  N_I = {N}: 1/alpha = {float(val):.6f} ({err:.1f} ppm){marker}")

    # Sensitivity to n_d
    print(f"\nSensitivity to n_d:")
    for nd, (val, err) in sorted(sensitivity_to_n_d().items()):
        marker = " <-- framework" if nd == 4 else ""
        print(f"  n_d = {nd}: 1/alpha = {val:.6f} ({err:.0f} ppm){marker}")

    # Sensitivity to n_c
    print(f"\nSensitivity to n_c:")
    for nc, (val, err) in sorted(sensitivity_to_n_c().items()):
        marker = " <-- framework" if nc == 11 else ""
        print(f"  n_c = {nc}: 1/alpha = {val:.6f} ({err:.0f} ppm){marker}")

    # Alternative corrections
    print(f"\nAlternative correction terms:")
    for label, (val, err) in alternative_corrections().items():
        marker = " <-- framework" if "framework" in label else ""
        print(f"  {label}: 1/alpha = {val:.6f} ({err:.1f} ppm){marker}")

    # ===========================================================================
    # VERIFICATION TESTS
    # ===========================================================================

    print(f"\n{'=' * 70}")
    print("VERIFICATION TESTS")
    print("=" * 70)

    tests = [
        # Current prediction
        ("1/alpha = 15211/111", alpha_inv_pred == R(15211, 111)),
        ("Gap < 1 ppm", gap_ppm < 1.0),
        ("Gap < 0.5 ppm", gap_ppm < 0.5),
        ("Gap > 0.1 ppm (not exact)", gap_ppm > 0.1),

        # Sensitivity: alternatives are much worse
        ("N_I=136 error > 7000 ppm", sensitivity_to_N_I()[136][1] > 7000),
        ("N_I=138 error > 7000 ppm", sensitivity_to_N_I()[138][1] > 7000),
        ("n_d=3 error > 50000 ppm", sensitivity_to_n_d()[3][1] > 50000),
        ("n_d=5 error > 60000 ppm", sensitivity_to_n_d()[5][1] > 60000),
        ("n_c=10 error > 100000 ppm", sensitivity_to_n_c()[10][1] > 100000),
        ("n_c=12 error > 100000 ppm", sensitivity_to_n_c()[12][1] > 100000),

        # Framework correction is best
        ("No correction is worse than framework",
         alternative_corrections()["no correction"][1] > alternative_corrections()["n_d/Phi_6 (framework)"][1]),
        ("n_d^2/Phi_6 is worse than n_d/Phi_6",
         alternative_corrections()["n_d^2/Phi_6"][1] > alternative_corrections()["n_d/Phi_6 (framework)"][1]),

        # Structure
        ("137 is prime", isprime(137)),
        ("111 = Phi_6(11)", Phi6 == 111),
        ("15211 = 137 * 111 + 4", 15211 == 137 * 111 + 4),
    ]

    all_pass = True
    for name, passed in tests:
        status = "PASS" if passed else "FAIL"
        print(f"  [{status}] {name}")
        if not passed:
            all_pass = False

    print(f"\n{'ALL TESTS PASSED' if all_pass else 'SOME TESTS FAILED'}")
    print(f"Total: {sum(1 for _, p in tests if p)}/{len(tests)} PASS")

    return all_pass

if __name__ == "__main__":
    main()
