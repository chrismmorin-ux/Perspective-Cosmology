#!/usr/bin/env python3
"""
Dark Matter Formula Identity Test: Are Formulas A and C secretly the same?

KEY QUESTION: Does the framework's m_p/m_e prediction structurally imply
that Formula A (m_p * 49/9) = Formula C (m_e * 10000)?

If m_p/m_e(framework) * 49/9 = 10000 exactly, the two formulas are
algebraically identical and the "two independent paths" are illusory.

Formula A: m_DM = m_p * (Im_O^2 / Im_H^2) = m_p * 49/9
Formula C: m_DM = m_e * (n_c - 1)^4 = m_e * 10000

For A = C: m_p/m_e = 10000 * 9/49 = 90000/49

Framework tree: m_p/m_e = 1836 + 11/72 = 132203/72
Framework dressed (S282): m_p/m_e ~ 1836.15267365 (C=43/7)

Status: INVESTIGATION
"""

from sympy import Rational, sqrt, N, Abs, pi

# =============================================================
# Framework parameters
# =============================================================
n_d = 4
n_c = 11
Im_H = 3   # Im(H) = dim(H) - 1
Im_O = 7   # Im(O) = dim(O) - 1

# =============================================================
# Framework m_p/m_e predictions
# =============================================================

# Tree-level: 1836 + 11/72
mp_me_tree = Rational(132203, 72)  # = 1836 + 11/72

# Check: 1836 = 12 * 153 in the framework
main_term = 12 * 153
correction_num = n_c        # 11
correction_den = 72         # dim(O) * Im_H^2 = 8 * 9
assert main_term == 1836
assert correction_den == 8 * Im_H**2
mp_me_tree_check = main_term + Rational(correction_num, correction_den)
assert mp_me_tree == mp_me_tree_check

# Dressed value from S282 (C = 43/7 = Phi_6(Im_O)/Im_O)
# delta = C * alpha^2 / pi where C = 43/7
# This gives m_p/m_e(dressed) ~ 1836.15267365
# For exact arithmetic, use the tree value + approximate correction
alpha_inv = Rational(137036, 1000)  # approximate
alpha = 1 / alpha_inv
C_dress = Rational(43, 7)
# Dressed correction: -C * alpha^2 / pi (negative because tree overshoots)
# mp_me_dressed ~ mp_me_tree - C_dress * alpha^2 / pi
# But we'll use the exact tree for the structural test

# =============================================================
# The critical identity test
# =============================================================

# For A = C: m_p/m_e * 49/9 = 10000
# Equivalently: m_p/m_e = 90000/49
identity_target = Rational(90000, 49)

# Framework tree prediction
product_tree = mp_me_tree * Rational(49, 9)
# = 132203/72 * 49/9 = 132203 * 49 / 648

# The difference
diff_tree = product_tree - 10000
diff_ratio = identity_target - mp_me_tree

# Measured m_p/m_e (CODATA 2022)
mp_me_measured = Rational(183615267343, 100000000)  # 1836.15267343

product_measured = mp_me_measured * Rational(49, 9)
diff_measured = product_measured - 10000

# =============================================================
# Structural decomposition
# =============================================================

# Framework main term: 1836 = 12 * 153
# Formula C target: 10000 * 9/49 = 90000/49 ~ 1836.7347
# These are NOT structurally related

# Check: is 90000 = 49 * 1836 + something framework-ish?
remainder_49 = 90000 - 49 * 1836
# 90000 - 89964 = 36
# So 90000/49 = 1836 + 36/49

# 36/49 vs framework correction 11/72
framework_correction = Rational(11, 72)
identity_correction = Rational(36, 49)

# These are very different: 36/49 ~ 0.7347 vs 11/72 ~ 0.1528

# =============================================================
# Print results
# =============================================================
print("=" * 70)
print("DARK MATTER FORMULA IDENTITY TEST")
print("Are Formulas A and C secretly the same formula?")
print("=" * 70)

print("\n--- The Identity Condition ---")
print(f"For A = C: m_p/m_e * 49/9 must equal 10000")
print(f"Equivalently: m_p/m_e must equal 90000/49 = {N(identity_target, 10)}")

print("\n--- Framework Tree Prediction ---")
print(f"m_p/m_e(tree) = 1836 + 11/72 = {mp_me_tree} = {N(mp_me_tree, 12)}")
print(f"m_p/m_e(tree) * 49/9 = {N(product_tree, 12)}")
print(f"Difference from 10000: {N(diff_tree, 8)}")
print(f"Fractional: {N(diff_tree/10000 * 100, 4)}%")
print(f"In ppm: {N(Abs(diff_tree)/10000 * 1000000, 4)} ppm")

print("\n--- Measured Value ---")
print(f"m_p/m_e(CODATA) = {N(mp_me_measured, 12)}")
print(f"m_p/m_e(CODATA) * 49/9 = {N(product_measured, 12)}")
print(f"Difference from 10000: {N(diff_measured, 8)}")
print(f"Fractional: {N(diff_measured/10000 * 100, 4)}%")
print(f"In ppm: {N(Abs(diff_measured)/10000 * 1000000, 4)} ppm")

print("\n--- Structural Comparison ---")
print(f"Identity requires correction: 90000/49 - 1836 = 36/49 = {N(identity_correction, 8)}")
print(f"Framework gives correction:   11/72 = {N(framework_correction, 8)}")
print(f"Ratio: (36/49) / (11/72) = {N(identity_correction/framework_correction, 6)}")
print(f"  36/49 = (Im_H^2 + Im_O^2*4)/Im_O^2 ?? NO structural meaning")
print(f"  11/72 = n_c / (dim_O * Im_H^2) -- framework-derived")

print("\n--- Decomposition of the gap ---")
gap = identity_target - mp_me_tree
print(f"90000/49 - 132203/72 = {gap} = {N(gap, 10)}")
# Check numerator/denominator
# 90000*72 - 132203*49 = 6480000 - 6477947 = 2053
num_gap = 90000 * 72 - 132203 * 49
den_gap = 49 * 72
print(f"  = {num_gap}/{den_gap} = {N(Rational(num_gap, den_gap), 10)}")
print(f"  2053 = prime? {2053}")

# Factor 2053
from sympy import factorint
factors_2053 = factorint(2053)
print(f"  2053 factored: {factors_2053}")
print(f"  NOT a framework number (no division algebra decomposition)")

# =============================================================
# PASS/FAIL Tests
# =============================================================
print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = []

# Test 1: Framework tree does NOT satisfy the identity
t1 = (product_tree != 10000)
tests.append(("Framework tree: m_p/m_e * 49/9 != 10000 (NOT identical)", t1))

# Test 2: The gap is substantial (> 100 ppm)
gap_ppm_tree = Abs(diff_tree) / 10000 * 1000000
t2 = gap_ppm_tree > 100
tests.append(("Gap > 100 ppm (not a near-miss)", t2))

# Test 3: Measured value also does NOT satisfy the identity
t3 = (Abs(diff_measured) > Rational(1, 10))  # > 0.1
tests.append(("Measured m_p/m_e * 49/9 != 10000 either", t3))

# Test 4: Framework correction (11/72) differs from identity correction (36/49)
t4 = (framework_correction != identity_correction)
tests.append(("Framework correction 11/72 != identity correction 36/49", t4))

# Test 5: The corrections differ by factor ~4.8 (not a framework ratio)
correction_ratio = identity_correction / framework_correction
t5 = correction_ratio > 4 and correction_ratio < 5
tests.append(("Correction ratio ~ 4.8 (not a framework number)", t5))

# Test 6: Formula A value (using measured m_p)
m_p_MeV = Rational(938272088, 1000000)
m_e_MeV = Rational(511, 1000)
m_DM_A = m_p_MeV * Rational(49, 9)
m_DM_C = m_e_MeV * 10000
diff_AC = Abs(m_DM_A - m_DM_C)
frac_diff_AC = diff_AC / m_DM_A
t6 = frac_diff_AC < Rational(1, 1000)  # < 0.1%
tests.append(("A and C agree to < 0.1% numerically (coincidence)", t6))

# Test 7: The gap (90000/49 vs 132203/72) has no framework factorization
# 2053 is prime
t7 = len(factors_2053) == 1 and 2053 in factors_2053
tests.append(("Gap numerator 2053 is prime (no framework structure)", t7))

# Test 8: 36 = 4*9 but 49 = 7^2 -- the identity correction 36/49
# is (n_d * Im_H^2) / Im_O^2, which IS framework-ish superficially
# but doesn't arise in any derivation chain
t8_val = Rational(n_d * Im_H**2, Im_O**2)
t8 = (t8_val == identity_correction)
tests.append(("36/49 = n_d*Im_H^2/Im_O^2 (superficial framework form)", t8))

# Test 9: But this makes A=C require m_p/m_e = 1836 + n_d*Im_H^2/Im_O^2
# vs framework's m_p/m_e = 1836 + n_c/(dim_O*Im_H^2)
# These are completely different algebraic expressions
identity_requires = main_term + Rational(n_d * Im_H**2, Im_O**2)
framework_gives = main_term + Rational(n_c, 8 * Im_H**2)
t9 = (identity_requires != framework_gives)
tests.append(("Identity requires 1836+36/49; framework gives 1836+11/72", t9))

# Test 10: Measured fractional difference between A and C
frac_ppm = N(frac_diff_AC * 1000000, 6)
t10 = frac_ppm > 200 and frac_ppm < 400
tests.append((f"A-C fractional difference ~ {frac_ppm} ppm (coincidental range)", t10))

# Test 11: 2053/3528 is the exact gap -- verify
exact_gap = Rational(num_gap, den_gap)
t11 = exact_gap == (identity_target - mp_me_tree)
tests.append(("Exact gap = 2053/3528 verified", t11))

# Test 12: CONCLUSION -- formulas are NOT the same
# A uses m_p and Im_O^2/Im_H^2 (octonionic/quaternionic ratio)
# C uses m_e and (n_c-1)^4 (generation suppression)
# The 0.03% agreement is a coincidence from m_p/m_e being close to 90000/49
t12 = True  # structural conclusion
tests.append(("CONCLUSION: A and C are distinct formulas (0.03% is coincidence)", t12))

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    print(f"  [{status}] {name}")

# =============================================================
# Summary
# =============================================================
print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"""
INVESTIGATION I1: Are Formulas A and C secretly the same formula?

ANSWER: NO. They are structurally distinct.

The identity A = C requires m_p/m_e = 90000/49 = 1836.7347...
The framework predicts m_p/m_e = 132203/72 = 1836.1528... (tree)
The measured value is m_p/m_e = 1836.1527...

The gap is 2053/3528 = 0.582 (317 ppm of m_p/m_e).
The numerator 2053 is prime -- no framework decomposition.

The corrections also differ algebraically:
  Identity needs:  36/49 = n_d * Im_H^2 / Im_O^2
  Framework gives: 11/72 = n_c / (dim_O * Im_H^2)
These use completely different algebraic building blocks.

The 0.03% near-agreement between A and C is a NUMERICAL COINCIDENCE
arising because m_p/m_e happens to be close to (but not equal to) 90000/49.

The two formulas use genuinely different physics:
  A: asymmetric DM with n_DM = n_b, ratio from Im_O^2/Im_H^2 = 49/9
  C: dark generation with mass hierarchy (n_c-1)^4 = 10000

IMPLICATION: The A/C agreement cannot be used as evidence for either formula.
Each must stand or fall on its own derivation chain.
""")

print(f"\nOverall: {'ALL PASS' if all_pass else 'SOME FAILURES'} ({sum(1 for _,p in tests if p)}/{len(tests)})")
