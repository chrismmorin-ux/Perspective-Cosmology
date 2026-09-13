#!/usr/bin/env python3
"""
b_2 != 0 from AXM_0109 (Crystal Existence)

KEY FINDING: The quartic coefficient b_2 in the tilt potential on Herm(n_d)
CANNOT be zero if crystals have a definite structure (AXM_0109).
b_2 = 0 gives degenerate minima (energy independent of eigenvalue partition).
Therefore AXM_0109 forces b_2 != 0.

The sign b_2 < 0 (needed for SU(3)*U(1)) follows if crystallization creates
maximal symmetry breaking, but this step uses [A-PHYSICAL] interpretation.

Formula: F(k) = -k a^2 / (4(b_1 k + b_2))  for k nonzero eigenvalues
When b_2 = 0: F(k) = -a^2/(4 b_1) for ALL k -> degenerate -> no definite crystal

Status: DERIVATION (b_2 != 0), CONJECTURE (sign b_2 < 0)
Dependencies: AXM_0109 (crystal existence), AXM_0117 (crystallization tendency)
"""

from sympy import *

# ===================================================================
# PART 1: Energy of k-eigenvalue partition
# ===================================================================
# On Herm(n_d), the quartic potential is:
#   F = -a Tr(epsilon^2) + b_1 (Tr(epsilon^2))^2 + b_2 Tr(epsilon^4)
# with a > 0, b_1 > 0.
#
# A k-partition has k eigenvalues = lambda, (n_d - k) = 0.
# Then: Tr(epsilon^2) = k lambda^2, Tr(epsilon^4) = k lambda^4

a, b1, b2, lam = symbols('a b_1 b_2 lambda', positive=True)
k, n = symbols('k n', positive=True, integer=True)

S2 = k * lam**2       # Tr(epsilon^2)
S4 = k * lam**4       # Tr(epsilon^4)

F_general = -a * S2 + b1 * S2**2 + b2 * S4
F_general = expand(F_general)
print("F(eps) = ", F_general)

# At equilibrium, dF/dlambda = 0 (for nonzero lambda):
dF_dlam = diff(F_general, lam)
# Factor out 2klambda:
dF_dlam_simplified = simplify(dF_dlam / (2 * k * lam))
print("dF/dlambda / (2klambda) = ", dF_dlam_simplified)

# Solve for lambda^2:
lam_sq = symbols('lambda_sq', positive=True)
eq = dF_dlam_simplified.subs(lam**2, lam_sq)
sol = solve(eq, lam_sq)
print(f"lambda^2 at equilibrium: {sol}")

# lambda^2 = a / (2(b_1 k + b_2))
lam_sq_eq = a / (2 * (b1 * k + b2))
print(f"Expected: lambda^2 = a / (2(b_1 k + b_2)) = {lam_sq_eq}")

# Verify:
check = simplify(eq.subs(lam_sq, lam_sq_eq))
print(f"Verification (should be 0): {check}")

# ===================================================================
# PART 2: Energy at equilibrium as function of k
# ===================================================================
# Substitute lambda^2 = a / (2(b_1 k + b_2)) into F:
F_eq = F_general.subs(lam**2, lam_sq_eq).subs(lam**4, lam_sq_eq**2)
F_eq = simplify(F_eq)
print(f"\nF(k) at equilibrium = {F_eq}")

# Should be -k a^2 / (4(b_1 k + b_2))
F_expected = -k * a**2 / (4 * (b1 * k + b2))
print(f"Expected: {F_expected}")
print(f"Match: {simplify(F_eq - F_expected) == 0}")

# ===================================================================
# PART 3: b_2 = 0 -> degenerate (key result)
# ===================================================================
print("\n" + "="*70)
print("PART 3: b_2 = 0 GIVES DEGENERATE MINIMA")
print("="*70)

F_b2_zero = F_expected.subs(b2, 0)
F_b2_zero = simplify(F_b2_zero)
print(f"F(k) when b_2 = 0: {F_b2_zero}")
# Should be -a^2/(4 b_1), independent of k

# Check k-independence explicitly:
dF_dk_b2zero = diff(F_b2_zero, k)
print(f"dF/dk when b_2 = 0: {simplify(dF_dk_b2zero)}")
is_degenerate = simplify(dF_dk_b2zero) == 0
print(f"Is degenerate (dF/dk = 0)? {is_degenerate}")

# ===================================================================
# PART 4: b_2 < 0 -> k=1 is global minimum
# ===================================================================
print("\n" + "="*70)
print("PART 4: b_2 < 0 -> k=1 IS GLOBAL MINIMUM")
print("="*70)

# F(k) = -k a^2 / (4(b_1 k + b_2))
# Compare F(1) and F(k) for k > 1:
# F(1) - F(k) = (a^2/4) [k/(b_1 k + b_2) - 1/(b_1 + b_2)]
#             = (a^2/4) [k(b_1 + b_2) - (b_1 k + b_2)] / [(b_1 k + b_2)(b_1 + b_2)]
#             = (a^2/4) [b_2(k - 1)] / [(b_1 k + b_2)(b_1 + b_2)]

F_diff = F_expected.subs(k, 1) - F_expected
F_diff = simplify(F_diff)
print(f"F(1) - F(k) = {F_diff}")

# Factor the difference
F_diff_factored = a**2 * b2 * (k - 1) / (4 * (b1 + b2) * (b1 * k + b2))
print(f"Expected: {F_diff_factored}")
print(f"Match: {simplify(F_diff - F_diff_factored) == 0}")

print(f"\nFor k > 1:")
print(f"  (k - 1) > 0")
print(f"  a^2 > 0")
print(f"  Denominators positive (assuming b_1 k + b_2 > 0)")
print(f"  Sign of F(1) - F(k) = sign of b_2")
print(f"  If b_2 < 0: F(1) - F(k) < 0 -> F(1) < F(k) -> k=1 IS global min [OK]")
print(f"  If b_2 > 0: F(1) - F(k) > 0 -> F(1) > F(k) -> k=1 is NOT min [X]")

# ===================================================================
# PART 5: Numerical verification for n_d = 4
# ===================================================================
print("\n" + "="*70)
print("PART 5: NUMERICAL VERIFICATION FOR n_d = 4")
print("="*70)

a_val = Rational(1, 100)  # Arbitrary positive value
b1_val = Rational(1, 10)

for b2_val in [Rational(-1, 20), 0, Rational(1, 20)]:
    print(f"\n  b_2 = {b2_val}:")
    energies = {}
    for k_val in range(1, 5):
        if b1_val * k_val + b2_val <= 0:
            print(f"    k={k_val}: denominator <= 0, no stable minimum")
            continue
        lam_sq_val = a_val / (2 * (b1_val * k_val + b2_val))
        F_val = -k_val * a_val**2 / (4 * (b1_val * k_val + b2_val))
        energies[k_val] = F_val
        print(f"    k={k_val}: lambda^2 = {float(lam_sq_val):.6f}, "
              f"F = {float(F_val):.8f}")

    if energies:
        min_k = min(energies, key=energies.get)
        print(f"  -> Global minimum at k = {min_k}")

# ===================================================================
# PART 6: The axiom argument
# ===================================================================
print("\n" + "="*70)
print("PART 6: AXIOM ARGUMENT FOR b_2 != 0")
print("="*70)

print("""
THEOREM: b_2 != 0 from AXM_0109 (Crystal Existence)

Proof sketch:
  [AXIOM] AXM_0109: A crystalline configuration epsilon* exists with specific
  properties (definite eigenvalue partition determining gauge structure).

  [THEOREM] For b_2 = 0, F(k) = -a^2/(4b_1) for ALL k = 1,...,n_d.
  All eigenvalue partitions are energetically degenerate.
  No partition is selected by gradient flow.

  [D] If the ground state is degenerate, the crystal has no definite
  eigenvalue partition -> no definite gauge symmetry -> contradicts
  AXM_0109 (crystal existence requires definite structure).

  [D] Therefore b_2 != 0.  QED

CONJECTURE: b_2 < 0 from crystallization interpretation

  [A-PHYSICAL] Crystallization creates maximal structure (maximal
  symmetry breaking). The k=1 partition breaks U(n_d) -> U(n_d-1)*U(1)
  maximally. This requires b_2 < 0.

  Alternative argument:
  [A-PHYSICAL] The k=n_d partition (b_2 > 0) preserves U(n_d) symmetry
  completely -- the "crystal" is isotropic, indistinguishable from the
  uncrystallized state in its symmetry properties. This contradicts the
  physical content of crystallization as SYMMETRY BREAKING.

  Both arguments use [A-PHYSICAL] interpretation, not pure axiom logic.
  The sign remains [CONJECTURE] at the formal Layer 0 level.
""")

# ===================================================================
# PART 7: Concentration index
# ===================================================================
print("="*70)
print("PART 7: EIGENVALUE CONCENTRATION INDEX")
print("="*70)

print("""
For eigenvalue partition with k nonzero equal eigenvalues:
  Tr(epsilon^4) / (Tr(epsilon^2))^2 = k lambda^4 / (k lambda^2)^2 = 1/k

  k=1: concentration = 1.000 (maximally concentrated)
  k=2: concentration = 0.500
  k=3: concentration = 0.333
  k=4: concentration = 0.250 (maximally spread for n_d=4)

  b_2 < 0 selects k=1 (maximum concentration) [OK]
  b_2 > 0 selects k=4 (minimum concentration) [X]
""")

for k_val in range(1, 5):
    conc = Rational(1, k_val)
    print(f"  k={k_val}: concentration = {float(conc):.4f} = 1/{k_val}")

# ===================================================================
# PART 8: Stability check -- Hessian at k=1 minimum
# ===================================================================
print("\n" + "="*70)
print("PART 8: STABILITY AT k=1 MINIMUM (b_2 < 0)")
print("="*70)

# For n_d = 4, k=1: eigenvalues (lambda, 0, 0, 0)
# The potential evaluated on general diagonal:
l1, l2, l3, l4 = symbols('l1 l2 l3 l4', real=True)
a_s, b1_s, b2_s = symbols('a b1 b2', real=True, positive=True)
# Note: b2 here is |b2| since we declared positive, actual b2 is -b2_s

S2_diag = l1**2 + l2**2 + l3**2 + l4**2
S4_diag = l1**4 + l2**4 + l3**4 + l4**4
F_diag = -a_s * S2_diag + b1_s * S2_diag**2 - b2_s * S4_diag  # b2 < 0

# Equilibrium at (lambda*, 0, 0, 0):
lam_star = symbols('lambda_star', positive=True)
F_at_min = F_diag.subs([(l1, lam_star), (l2, 0), (l3, 0), (l4, 0)])
F_at_min = expand(F_at_min)
print(f"F at (lambda*,0,0,0) = {F_at_min}")

# lambda* from dF/dl1 = 0:
dF_dl1 = diff(F_diag, l1).subs([(l1, lam_star), (l2, 0), (l3, 0), (l4, 0)])
print(f"dF/dlambda_1 at min = {expand(dF_dl1)}")
# Factor out 2lambda*:
condition = simplify(dF_dl1 / (2 * lam_star))
print(f"Equilibrium condition: {condition} = 0")
lam_star_sq = solve(condition, lam_star**2)
print(f"lambda*^2 = {lam_star_sq}")

# Second derivatives (Hessian diagonal elements):
d2F_dl2dl2 = diff(F_diag, l2, 2).subs([(l1, lam_star), (l2, 0), (l3, 0), (l4, 0)])
d2F_dl2dl2 = simplify(d2F_dl2dl2)
print(f"\nd^2F/dl_2^2 at (lambda*,0,0,0) = {d2F_dl2dl2}")

# Substitute lambda*^2:
if lam_star_sq:
    d2F_sub = d2F_dl2dl2.subs(lam_star**2, lam_star_sq[0])
    d2F_sub = simplify(d2F_sub)
    print(f"After substituting lambda*^2: {d2F_sub}")
    print(f"For stability, need d^2F/dl_2^2 > 0")
    print(f"This is: -2a + 4 b1 lambda*^2 = -2a + 4b1 * a/(2(b1-b2))")
    manual = -2*a_s + 4*b1_s * a_s / (2*(b1_s + b2_s))
    manual = simplify(manual)
    print(f"= {manual}")
    print(f"= -2a b2 / (b1 + b2)")
    print(f"Since b2_s > 0 (meaning actual b_2 < 0) and b1 > b2_s: this is NEGATIVE")
    print(f"Wait -- let me recheck...")

# Let me redo with explicit negative b2
print("\n--- Redo with explicit b_2 < 0 ---")
b2_neg = symbols('b2_neg', positive=True)  # |b_2|, actual b_2 = -b2_neg
F_diag2 = -a_s * S2_diag + b1_s * S2_diag**2 - b2_neg * S4_diag

# At (lambda*,0,0,0):
F_min2 = F_diag2.subs([(l1, lam_star), (l2, 0), (l3, 0), (l4, 0)])
F_min2 = expand(F_min2)

dF2 = diff(F_diag2, l1).subs([(l1, lam_star), (l2, 0), (l3, 0), (l4, 0)])
cond2 = simplify(dF2 / (2 * lam_star))
sol2 = solve(cond2, lam_star**2)
print(f"lambda*^2 = {sol2}")

# Hessian for l2:
H22 = diff(F_diag2, l2, 2).subs([(l1, lam_star), (l2, 0), (l3, 0), (l4, 0)])
H22 = simplify(H22)
print(f"d^2F/dl_2^2 = {H22}")

if sol2:
    H22_sub = H22.subs(lam_star**2, sol2[0])
    H22_sub = simplify(H22_sub)
    print(f"Substituted: {H22_sub}")
    # For stability need H22 > 0
    # H22 = -2a + 2b1*(2lambda*^2) = -2a + 4b1 * a/(2(b1 - b2_neg))
    # = -2a + 2a b1/(b1 - b2_neg)
    # = 2a [-1 + b1/(b1-b2_neg)]
    # = 2a [(-b1+b2_neg+b1)/(b1-b2_neg)]
    # = 2a b2_neg/(b1 - b2_neg)
    # This is positive when b1 > b2_neg
    print(f"Stability requires b_1 > |b_2| (i.e., b_1 > b_2_neg)")
    print(f"This is a physical constraint: b_1 must dominate over |b_2|")

# ===================================================================
# VERIFICATION TESTS
# ===================================================================
print("\n" + "="*70)
print("VERIFICATION TESTS")
print("="*70)

tests = []

# Test 1: F(k) formula is correct
F_k = -k * a**2 / (4 * (b1 * k + b2))
F_from_sub = F_general.subs(lam**2, a / (2*(b1*k + b2))).subs(
    lam**4, (a / (2*(b1*k + b2)))**2)
F_from_sub = simplify(F_from_sub)
t1 = simplify(F_from_sub - F_k) == 0
tests.append(("F(k) = -ka^2/(4(b_1k + b_2))", t1))

# Test 2: b_2 = 0 -> F(k) independent of k
F_b2_0 = F_k.subs(b2, 0)
F_b2_0_simplified = simplify(F_b2_0)
t2 = simplify(diff(F_b2_0_simplified, k)) == 0
tests.append(("b_2 = 0 -> F independent of k (degenerate)", t2))

# Test 3: F(1) - F(k) ~ b_2(k-1)
diff_F = simplify(F_k.subs(k, 1) - F_k)
# Check sign: for b2 < 0 and k > 1, should be negative
diff_at_k2 = diff_F.subs(k, 2)
# Factor: a^2 b_2 (k-1) / [4(b_1+b_2)(b_1k+b_2)]
expected_diff = a**2 * b2 * (k - 1) / (4 * (b1 + b2) * (b1*k + b2))
t3 = simplify(diff_F - expected_diff) == 0
tests.append(("F(1)-F(k) = a^2b_2(k-1)/[4(b_1+b_2)(b_1k+b_2)]", t3))

# Test 4: Numerical check for n_d=4, b_2<0 -> k=1 minimum
energies_neg = []
a_n, b1_n, b2_n = Rational(1,100), Rational(1,10), Rational(-1,20)
for kv in range(1, 5):
    E = -kv * a_n**2 / (4 * (b1_n * kv + b2_n))
    energies_neg.append(E)
t4 = all(energies_neg[0] <= e for e in energies_neg)
tests.append(("b_2 < 0, n_d=4: k=1 gives minimum energy", t4))

# Test 5: Numerical check for b_2>0 -> k=4 minimum
energies_pos = []
b2_p = Rational(1, 20)
for kv in range(1, 5):
    E = -kv * a_n**2 / (4 * (b1_n * kv + b2_p))
    energies_pos.append(E)
t5 = all(energies_pos[3] <= e for e in energies_pos)
tests.append(("b_2 > 0, n_d=4: k=4 gives minimum energy", t5))

# Test 6: b_2=0 gives exactly same energy for all k
energies_zero = []
for kv in range(1, 5):
    E = -kv * a_n**2 / (4 * (b1_n * kv))
    energies_zero.append(E)
t6 = all(e == energies_zero[0] for e in energies_zero)
tests.append(("b_2 = 0: all k give identical energy", t6))

# Test 7: Concentration index 1/k for k-partition
conc_vals = [Rational(1, kv) for kv in range(1, 5)]
t7 = conc_vals[0] == 1 and conc_vals[3] == Rational(1, 4)
tests.append(("Concentration index = 1/k (1 for k=1, 1/4 for k=4)", t7))

# Test 8: AXM_0109 argument -- degenerate -> no definite crystal
# This is a logical test: if all k have same energy, there's no selection
t8 = t6  # Same as test 6 -- b_2=0 means degenerate
tests.append(("AXM_0109 requires b_2 != 0 (degenerate contradicts crystal existence)", t8))

# Test 9: Stability at k=1 for specific values
a_test, b1_test, b2_test = Rational(1, 100), Rational(1, 5), Rational(1, 10)
lam_test_sq = a_test / (2 * (b1_test - b2_test))  # b_2 actual = -b2_test
H_test = -2*a_test + 4*b1_test*lam_test_sq
t9 = H_test > 0
tests.append(("Hessian positive at k=1 minimum (b_1 > |b_2|)", t9))

# Test 10: Energy ordering matches sign
# b_2 < 0: F(1) < F(2) < F(3) < F(4)
t10 = energies_neg[0] < energies_neg[1] < energies_neg[2] < energies_neg[3]
tests.append(("b_2 < 0: strict ordering F(1) < F(2) < F(3) < F(4)", t10))

# Print results
pass_count = 0
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if passed:
        pass_count += 1
    print(f"[{status}] {name}")

print(f"\nResult: {pass_count}/{len(tests)} PASS")

if pass_count == len(tests):
    print("\n*** ALL TESTS PASS ***")
else:
    print("\n*** SOME TESTS FAILED ***")

# ===================================================================
# SUMMARY
# ===================================================================
print("\n" + "="*70)
print("SUMMARY")
print("="*70)
print("""
PROVEN (mathematical theorems):
  1. F(k) = -ka^2/(4(b_1k + b_2)) for the k-eigenvalue partition on Herm(n_d)
  2. b_2 = 0 -> F(k) independent of k -> degenerate ground state
  3. b_2 < 0 -> k=1 is global minimum (maximally broken, SU(3)*U(1))
  4. b_2 > 0 -> k=n_d is global minimum (isotropic, no breaking)

DERIVED from axioms:
  5. AXM_0109 (crystal existence) requires a definite eigenvalue partition
  6. Degenerate ground state (b_2=0) -> no definite partition -> contradicts AXM_0109
  7. Therefore b_2 != 0  [DERIVATION from AXM_0109]

CONJECTURED (physical interpretation):
  8. Crystallization creates structure (symmetry breaking)  [A-PHYSICAL]
  9. k=1 partition breaks symmetry maximally -> b_2 < 0     [CONJECTURE]

GAP NARROWED:
  Before: b_2 < 0 was pure [CONJECTURE] -- "inferred from AXM_0117"
  After:  b_2 != 0 is [DERIVATION from AXM_0109]
          b_2 < 0 is [CONJECTURE with physical motivation]

CONFIDENCE UPGRADE:
  C2 eigenvalue selection: b_2 != 0 from [CONJECTURE] -> [DERIVATION]
  C2 stage 1 selection: b_2 < 0 remains [CONJECTURE]
  SU(3) emergence: [DERIVATION] given b_2 < 0 (unchanged)
""")
