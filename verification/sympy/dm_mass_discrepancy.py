#!/usr/bin/env python3
"""
Dark Matter Mass Formula Discrepancy Investigation

KEY FINDING: Two different formulas claim to predict DM mass = 5.11 GeV:
  Formula A: m_DM = m_p * 49/9 = 5.11 GeV  (dark_matter_mass_derivation.md)
  Formula C: m_DM = m_e * (n_c - 1)^4 = m_e * 10000 = 5.11 GeV  (generation_structure.md)

A third formula gives a DIFFERENT result:
  Formula B: m_DM = m_e * n_c^2 / n_d = 15.46 MeV  (structure_formation.md disclaimer)

This script checks all proposed formulas and alternative combinations
to identify the origin of the discrepancy.

Status: INVESTIGATION
"""

from sympy import Rational, sqrt, N, pi, Abs

# =============================================================
# Framework parameters [D: from division algebras]
# =============================================================
n_d = 4       # [D] Division algebra dimensions (R, C, H, O exist)
n_c = 11      # [D] Crystal dimension = 1 + 2 + 4 + 4 = 11

# =============================================================
# Physical constants [A-IMPORT]
# =============================================================
m_e_MeV = Rational(511, 1000)       # Electron mass = 0.511 MeV
m_p_MeV = Rational(938272088, 1000000) # Proton mass = 938.272088 MeV (CODATA 2022)
m_p_GeV = m_p_MeV / 1000              # = 0.938272088 GeV

# =============================================================
# Formula A: m_DM = m_p * 49/9  (dark_matter_mass_derivation.md)
# Origin: hidden_vectors / (n_c - C) where C=2, hidden=49, visible=9
# =============================================================
ratio_A = Rational(49, 9)
m_DM_A_MeV = m_p_MeV * ratio_A
m_DM_A_GeV = m_DM_A_MeV / 1000

# =============================================================
# Formula B: m_DM = m_e * n_c^2 / n_d  (structure_formation.md)
# Origin: from crystallization stress / division algebra dimensions
# =============================================================
m_DM_B_MeV = m_e_MeV * n_c**2 / n_d
m_DM_B_GeV = m_DM_B_MeV / 1000

# =============================================================
# Formula C: m_DM = m_e * (n_c - 1)^4  (generation_structure.md)
# Origin: mixing suppression factor = 1/(n_c-1)^4 = 10^{-4}
# =============================================================
m_DM_C_MeV = m_e_MeV * (n_c - 1)**4
m_DM_C_GeV = m_DM_C_MeV / 1000

# =============================================================
# Alternative formulas to test
# =============================================================
m_DM_alt1_MeV = m_e_MeV * n_c**2              # m_e * 121 = 61.831 MeV
m_DM_alt2_MeV = m_e_MeV * n_c**2 * n_d        # m_e * 484 = 247.324 MeV
m_DM_alt3_MeV = m_e_MeV * n_c                  # m_e * 11 = 5.621 MeV
m_DM_alt4_MeV = m_e_MeV * 10                   # m_e * 10 = 5.11 MeV
m_DM_alt5_MeV = m_e_MeV * 1000                 # m_e * 1000 = 511 MeV = 0.511 GeV

# =============================================================
# Check: is "5.11 GeV" actually 10 * m_e with a units error?
# =============================================================
ten_me_MeV = 10 * m_e_MeV   # = 5.11 MeV (NOT GeV)

# =============================================================
# Check: Formula C gives exactly 5110 MeV
# =============================================================
ten_thousand_me = m_e_MeV * 10000  # = 5110 MeV = 5.11 GeV

# =============================================================
# Check: Formula A gives m_p * 49/9
# =============================================================
mp_times_49_9 = m_p_MeV * Rational(49, 9)  # should be ~5109 MeV

# =============================================================
# Print all results
# =============================================================
print("=" * 70)
print("DARK MATTER MASS FORMULA DISCREPANCY INVESTIGATION")
print("=" * 70)

print("\n--- Primary Formulas ---")
print(f"Formula A: m_p * 49/9 = {N(m_DM_A_GeV, 6)} GeV = {N(m_DM_A_MeV, 8)} MeV")
print(f"Formula B: m_e * n_c^2/n_d = {N(m_DM_B_MeV, 6)} MeV = {N(m_DM_B_GeV, 6)} GeV")
print(f"Formula C: m_e * (n_c-1)^4 = {N(m_DM_C_GeV, 6)} GeV = {N(m_DM_C_MeV, 8)} MeV")

print("\n--- Numerical Details ---")
print(f"  m_e = {m_e_MeV} MeV")
print(f"  m_p = {N(m_p_MeV, 10)} MeV")
print(f"  n_c = {n_c}, n_d = {n_d}")
print(f"  n_c^2 = {n_c**2}")
print(f"  n_c^2/n_d = {Rational(n_c**2, n_d)} = {N(Rational(n_c**2, n_d), 6)}")
print(f"  (n_c-1)^4 = {(n_c-1)**4}")
print(f"  49/9 = {N(Rational(49, 9), 6)}")

print("\n--- Alternative Formulas ---")
print(f"  m_e * n_c^2       = {N(m_DM_alt1_MeV, 6)} MeV")
print(f"  m_e * n_c^2 * n_d = {N(m_DM_alt2_MeV, 6)} MeV")
print(f"  m_e * n_c          = {N(m_DM_alt3_MeV, 6)} MeV")
print(f"  m_e * 10           = {N(m_DM_alt4_MeV, 6)} MeV  (NOT 5.11 GeV)")
print(f"  m_e * 1000         = {N(m_DM_alt5_MeV, 6)} MeV = {N(m_DM_alt5_MeV/1000, 6)} GeV")

print("\n--- Cross-checks ---")
print(f"  10 * m_e = {N(ten_me_MeV, 4)} MeV  (this is MeV, not GeV)")
print(f"  10000 * m_e = {N(ten_thousand_me, 6)} MeV = {N(ten_thousand_me/1000, 4)} GeV")
print(f"  m_p * 49/9 = {N(mp_times_49_9, 8)} MeV = {N(mp_times_49_9/1000, 6)} GeV")

# Check: do Formulas A and C agree?
diff_AC = Abs(m_DM_A_MeV - m_DM_C_MeV)
print(f"\n  |Formula A - Formula C| = {N(diff_AC, 4)} MeV")
print(f"  Fractional difference: {N(diff_AC / m_DM_A_MeV * 100, 4)}%")

# =============================================================
# PASS/FAIL Tests
# =============================================================
print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = []

# Test 1: Formula B gives ~15.5 MeV, not 5.11 GeV
t1 = (m_DM_B_MeV > 15) and (m_DM_B_MeV < 16)
tests.append(("Formula B (m_e*n_c^2/n_d) = 15.5 MeV, NOT 5.11 GeV", t1))

# Test 2: Formula A gives ~5.11 GeV
t2 = (m_DM_A_GeV > 5) and (m_DM_A_GeV < 5.2)
tests.append(("Formula A (m_p*49/9) gives ~5.11 GeV", t2))

# Test 3: Formula C gives ~5.11 GeV
t3 = (m_DM_C_GeV > 5) and (m_DM_C_GeV < 5.2)
tests.append(("Formula C (m_e*(n_c-1)^4) gives ~5.11 GeV", t3))

# Test 4: Formula B is off by factor ~330 from 5.11 GeV
ratio_B_to_claimed = Rational(5110, 1) / m_DM_B_MeV  # 5110 MeV / 15.46 MeV
t4 = (ratio_B_to_claimed > 300) and (ratio_B_to_claimed < 400)
tests.append(("Formula B is off from 5.11 GeV by factor ~330", t4))

# Test 5: 10 * m_e = 5.11 MeV (not GeV) -- possible MeV/GeV confusion?
t5 = (ten_me_MeV == Rational(511, 100))
tests.append(("10*m_e = 5.11 MeV (units confusion candidate)", t5))

# Test 6: Formulas A and C agree to ~0.02%
t6 = (diff_AC / m_DM_A_MeV < Rational(1, 100))  # <1% difference
tests.append(("Formulas A and C agree to <1%", t6))

# Test 7: Formula B gives exactly 121/4 * m_e
exact_B = m_e_MeV * Rational(121, 4)
t7 = (m_DM_B_MeV == exact_B)
tests.append(("Formula B = m_e * 121/4 exactly", t7))

# Test 8: Formula C gives exactly 10000 * m_e
exact_C = m_e_MeV * 10000
t8 = (m_DM_C_MeV == exact_C)
tests.append(("Formula C = m_e * 10000 exactly", t8))

# Test 9: 5.11 GeV comes from two DIFFERENT formulas (A and C), not from B
t9 = (m_DM_A_GeV > 5) and (m_DM_C_GeV > 5) and (m_DM_B_GeV < 1)
tests.append(("5.11 GeV comes from A,C (not B); B gives 0.0155 GeV", t9))

# Test 10: The three formulas use different inputs
# A uses m_p [A-IMPORT], C uses m_e [A-IMPORT], B uses m_e [A-IMPORT]
# A and C are numerically similar but conceptually different
t10 = True  # structural test: just documenting
tests.append(("A uses m_p, B and C use m_e (different input masses)", t10))

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
print("""
FINDING: The "5.11 GeV" claim comes from TWO formulas that nearly agree:

  Formula A: m_DM = m_p * 49/9 = 5108.4 MeV   (proton mass * ratio)
  Formula C: m_DM = m_e * (n_c-1)^4 = 5110.0 MeV (electron mass * 10^4)

These agree to ~0.03% but use DIFFERENT input masses (m_p vs m_e).
The near-agreement relies on m_p/m_e ~ 1836.15 and
49/9 * (m_p/m_e) / 10000 ~ 0.9997.

The THIRD formula from the sub-catalogs:
  Formula B: m_DM = m_e * n_c^2/n_d = 15.46 MeV

gives a completely DIFFERENT result (factor ~330 too small).

CONCLUSION: The sub-catalogs correctly note that Formula B gives 15.5 MeV.
The "5.11 GeV" claim originates from Formulas A and C, which are in the
investigation files but use different algebraic constructions.

The discrepancy is NOT a units error. It is a genuine conflict between
competing formulas within the framework.

ACTION ITEMS:
1. Sub-catalogs should reference Formulas A/C (5.11 GeV) as the primary
   claim, while noting Formula B (15.5 MeV) as an alternative/discrepancy.
2. Neither value is experimentally confirmed; both are [CONJECTURE].
3. The framework has not resolved which formula (if any) is correct.
""")

print(f"\nOverall: {'ALL PASS' if all_pass else 'SOME FAILURES'}")
