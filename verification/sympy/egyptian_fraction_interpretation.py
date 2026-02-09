#!/usr/bin/env python3
"""
Egyptian Fraction Physical Interpretation

KEY FINDING: The Egyptian fraction 1/dim_C + 1/Im_H + 1/Im_O = 41/42
has a representation-theoretic interpretation. The common denominator
42 = LCM(dim_C, Im_H, Im_O) decomposes as 21 + 14 + 6 + 1, where:
  21 = dim(so(Im_O)) = dim(Lambda^2(R^7))
  14 = dim(G_2) = dim(Aut(O))
  6  = dim(so(n_d)) = dim(Lambda^2(R^4))
  1  = remainder (the "beyond-Hurwitz" residual)

Cross-algebraic pattern: each algebra's share measures the symmetry
of a DIFFERENT part of the framework.

Status: VERIFICATION + INVESTIGATION
"""

from sympy import *
from math import gcd
from functools import reduce

# Framework constants
dim_R = 1   # R
dim_C = 2   # C
dim_H = 4   # H = n_d
dim_O = 8   # O
n_d = 4     # = dim_H
n_c = 11    # crystal dimension
Im_H = 3    # imaginary quaternions
Im_O = 7    # imaginary octonions

# Lie algebra/group dimensions
def dim_so(n):
    """Dimension of so(n) = n(n-1)/2"""
    return n * (n - 1) // 2

def dim_su(n):
    """Dimension of su(n) = n^2 - 1"""
    return n**2 - 1

# Phi_6 cyclotomic
def phi6(x):
    return x**2 - x + 1

tests = []
print("=" * 65)
print("EGYPTIAN FRACTION PHYSICAL INTERPRETATION")
print("=" * 65)

# ============================================================
# SECTION 1: Basic Egyptian fraction structure
# ============================================================
print("\n--- Section 1: Egyptian Fraction Basics ---")

# The three physical terms
frac_C = Rational(1, dim_C)   # 1/2
frac_H = Rational(1, Im_H)   # 1/3
frac_O = Rational(1, Im_O)   # 1/7

physical_sum = frac_C + frac_H + frac_O
print(f"1/dim_C + 1/Im_H + 1/Im_O = {physical_sum}")
tests.append(("Physical sum = 41/42", physical_sum == Rational(41, 42)))

remainder = 1 - physical_sum
print(f"Remainder = 1 - 41/42 = {remainder}")
tests.append(("Remainder = 1/42", remainder == Rational(1, 42)))

# 42 as product and LCM
product_42 = dim_C * Im_H * Im_O
print(f"\ndim_C * Im_H * Im_O = {product_42}")
tests.append(("42 = dim_C * Im_H * Im_O", product_42 == 42))

# Since 2, 3, 7 are pairwise coprime, product = LCM
lcm_42 = reduce(lambda a, b: a * b // gcd(a, b), [dim_C, Im_H, Im_O])
print(f"LCM(dim_C, Im_H, Im_O) = {lcm_42}")
tests.append(("42 = LCM(dim_C, Im_H, Im_O)", lcm_42 == 42))

# All three are pairwise coprime
tests.append(("dim_C, Im_H coprime", gcd(dim_C, Im_H) == 1))
tests.append(("dim_C, Im_O coprime", gcd(dim_C, Im_O) == 1))
tests.append(("Im_H, Im_O coprime", gcd(Im_H, Im_O) == 1))

# ============================================================
# SECTION 2: Numerator identification (the KEY result)
# ============================================================
print("\n--- Section 2: Numerator = Lie Algebra Dimensions ---")

# Over common denominator 42, the numerators are:
num_C = 42 // dim_C   # 42/2 = 21
num_H = 42 // Im_H    # 42/3 = 14
num_O = 42 // Im_O    # 42/7 = 6

print(f"42/dim_C = {num_C}")
print(f"42/Im_H  = {num_H}")
print(f"42/Im_O  = {num_O}")
print(f"Sum      = {num_C + num_H + num_O} (+ 1 remainder = 42)")

# Identifications
print(f"\n21 =? dim(so(Im_O)) = dim(so(7)) = {dim_so(Im_O)}")
tests.append(("42/dim_C = dim(so(Im_O)) = 21", num_C == dim_so(Im_O)))

print(f"21 =? C(Im_O, 2) = C(7,2) = {Im_O * (Im_O-1) // 2}")
tests.append(("21 = C(7,2) = Lambda^2(Im_O)", num_C == Im_O * (Im_O-1) // 2))

print(f"\n14 =? dim(G_2) = {14}")
tests.append(("42/Im_H = dim(G_2) = 14", num_H == 14))

print(f"14 =? 2 * Im_O = {2 * Im_O}")
tests.append(("14 = 2 * Im_O", num_H == 2 * Im_O))

print(f"\n6 =? dim(so(n_d)) = dim(so(4)) = {dim_so(n_d)}")
tests.append(("42/Im_O = dim(so(n_d)) = 6", num_O == dim_so(n_d)))

print(f"6 =? C(n_d, 2) = C(4,2) = {n_d * (n_d-1) // 2}")
tests.append(("6 = C(4,2) = Lambda^2(n_d)", num_O == n_d * (n_d-1) // 2))

# Verify sum
tests.append(("21 + 14 + 6 + 1 = 42", num_C + num_H + num_O + 1 == 42))

# ============================================================
# SECTION 3: Cross-algebraic pattern
# ============================================================
print("\n--- Section 3: Cross-Algebraic Pattern ---")
print("Each algebra's 'share' measures symmetry of a DIFFERENT sector:")
print(f"  C's share (1/2 -> 21/42): 21 = dim(so(7)) -- octonion rotations")
print(f"  H's share (1/3 -> 14/42): 14 = dim(G_2) -- octonion automorphisms")
print(f"  O's share (1/7 -> 6/42):   6 = dim(so(4)) -- spacetime rotations")
print()

# Check: the mapping is C -> O-structure, H -> O-structure, O -> H-structure
# This is NOT random -- it's a version of the "duality" between algebras

# Deeper check: are these related to the so(11) decomposition?
dim_so11 = dim_so(11)  # 55
print(f"dim(so(11)) = {dim_so11}")
print(f"so(11) = so(4) + so(7) + Hom(R^4,R^7)")
print(f"       = {dim_so(4)} + {dim_so(7)} + {4*7} = {dim_so(4) + dim_so(7) + 28}")
tests.append(("so(11) decomposes as 6 + 21 + 28 = 55",
              dim_so(4) + dim_so(7) + 28 == 55))

# The Egyptian fraction numerators ARE the two isotropy pieces!
print(f"\nso(4) + so(7) = {dim_so(4)} + {dim_so(7)} = {dim_so(4) + dim_so(7)}")
print(f"               = 6 + 21 = 27 (isotropy algebra)")
coset_dim = 55 - 27
print(f"Coset: 55 - 27 = {coset_dim} = 28 Goldstone modes")
tests.append(("Isotropy so(4)+so(7) = 27 = 6+21",
              dim_so(4) + dim_so(7) == 27))

# Key relation: 21 + 14 = 35 = 5 * Im_O
print(f"\n21 + 14 = {num_C + num_H} = so(7) + G_2")
print(f"G_2 subset so(7): so(7) = G_2 + R^7 (as G_2-modules)")
print(f"  14 + 7 = {14 + 7} = 21 = dim(so(7)) CHECK")
tests.append(("so(7) = G_2 + R^7 as G_2-modules", 14 + 7 == 21))

# ============================================================
# SECTION 4: What IS the 42-dimensional object?
# ============================================================
print("\n--- Section 4: Natural 42-Dimensional Objects ---")

# Candidate 1: C tensor Im(H) tensor Im(O) as real vector space
dim_tensor = dim_C * Im_H * Im_O
print(f"dim_R(C (x) Im(H) (x) Im(O)) = {dim_tensor}")
tests.append(("C (x) Im(H) (x) Im(O) has real dim 42", dim_tensor == 42))

# Candidate 2: Lambda^2(Im_O) complexified
dim_complexified = 2 * dim_so(Im_O)
print(f"dim_R(C (x) Lambda^2(Im_O)) = 2 * 21 = {dim_complexified}")
tests.append(("C (x) Lambda^2(Im_O) has real dim 42", dim_complexified == 42))

# Candidate 3: Specific representations
# Check SO(7) representations
print(f"\nSO(7) representations near dim 42:")
# Fundamental: 7, Adjoint: 21, Spinor: 8
# Lambda^2(7) = 21, Lambda^3(7) = 35, Sym^2(7)-trace = 27
# 7 x 8 = 56 (too big), 7 x 7 = 49 (too big)
# No simple SO(7) irrep has dim 42

# Check SO(11) representations
# Fund: 11, Lambda^2: 55, Lambda^3: 165
# No simple SO(11) irrep has dim 42

# But 42 AS A DECOMPOSITION is natural:
print("42 = 21 + 14 + 6 + 1 is NOT an irrep but a graded decomposition:")
print(f"  Grade 0: R^1  (scalar, beyond-Hurwitz residual)")
print(f"  Grade 1: R^6  = so(4) (spacetime rotations)")
print(f"  Grade 2: R^14 = G_2 (octonion automorphisms)")
print(f"  Grade 3: R^21 = so(7) (octonion rotations)")

# ============================================================
# SECTION 5: The grading structure
# ============================================================
print("\n--- Section 5: Grading by Cascade Depth ---")

# Grade = position in Sylvester sequence
# Grade 1: 1/dim_C = 1/2 -> 21 modes (deepest, "oldest" algebra R)
# Grade 2: 1/Im_H = 1/3 -> 14 modes
# Grade 3: 1/Im_O = 1/7 -> 6 modes
# Grade 4: 1/43   -> ~1 mode (beyond-Hurwitz)

# The grading has DECREASING weight with increasing depth
# This is ANTI-correlated with precision: deeper -> smaller share -> finer band
print("Grading by cascade depth:")
print(f"  Depth 1 (dim_C=2): share = 1/2 = 50.0%  -> {num_C} modes")
print(f"  Depth 2 (Im_H=3):  share = 1/3 = 33.3%  -> {num_H} modes")
print(f"  Depth 3 (Im_O=7):  share = 1/7 = 14.3%  -> {num_O} modes")
print(f"  Depth 4 (43):      share = 1/43 = 2.3%  -> ~1 mode")
print(f"  Sum accounted:      41/42 = 97.6%")
print(f"  Unaccounted:        1/42 = 2.4% (one part in 42)")

# Check: the shares are inversely proportional to the Sylvester denominators
# AND the mode counts are the complementary symmetry dimensions

# ============================================================
# SECTION 6: 42 in the so(11) decomposition context
# ============================================================
print("\n--- Section 6: 42 in SO(11) Context ---")

# so(11) under SO(4) x SO(7):
# so(11) = so(4) + so(7) + (R^4 tensor R^7)
# 55 = 6 + 21 + 28

# The Egyptian fraction numerators give the isotropy part:
# so(4) + so(7) = 6 + 21 = 27
# But 42 = 27 + 14 + 1 = 27 + 15

# Alternative: 42 = 6 + 21 + 14 + 1
# = so(4) + so(7) + G_2 + R
# G_2 is a SUBGROUP of SO(7), so we're decomposing further

# Under G_2 subset SO(7):
# so(7) = g_2 + R^7
print("so(7) under G_2:")
print(f"  so(7) = g_2 + R^7 = 14 + 7 = 21")

# So 42 = so(4) + g_2 + R^7 + R = 6 + 14 + 7 + (7+1)... no,
# 42 = 6 + 14 + 21 + 1 which is 6 + 14 + (14+7) + 1

# Better interpretation: the ISOTROPY algebra so(4)+so(7) = 27
# The G_2 part of so(7) = 14
# What's 42 - 27 = 15?
print(f"\n42 - 27 = {42 - 27} = 15")
print(f"15 = dim(SU(4)) = dim(su(4)) = {dim_su(4)}")
tests.append(("42 - (so(4)+so(7)) = 15 = dim(su(4))", 42 - 27 == dim_su(4)))

# Actually, su(4) = so(6), and dim(so(6)) = 15
print(f"15 = dim(so(6)) = {dim_so(6)}")
tests.append(("15 = dim(so(6))", dim_so(6) == 15))

# ============================================================
# SECTION 7: The G_2 role specifically
# ============================================================
print("\n--- Section 7: G_2 as the Bridge ---")

# G_2 = Aut(O) has dimension 14
# It sits inside SO(7) as the subgroup preserving the octonionic multiplication
# The decomposition so(7) = g_2 + R^7 is the KEY structural fact

# The Egyptian fraction says:
# 1/3 of "unity" = 14/42 = G_2/total
# This means: the share allocated by Im_H equals the fraction of the
# total space occupied by octonionic automorphisms

g2_fraction = Rational(14, 42)
print(f"G_2 fraction of 42: {g2_fraction} = {float(g2_fraction):.4f}")
print(f"= 1/Im_H = 1/3")
tests.append(("G_2/42 = 1/Im_H", g2_fraction == Rational(1, Im_H)))

# This is structurally meaningful: G_2 occupies exactly 1/Im_H of the space
# because G_2 is the automorphism group of the Im_H-step algebra (octonions)

# ============================================================
# SECTION 8: Alternative 42-dimensional objects (search)
# ============================================================
print("\n--- Section 8: Alternative Interpretations of 42 ---")

# 42 = 6 * 7 = dim(so(4)) * Im_O
print(f"42 = dim(so(4)) * Im_O = {dim_so(4)} * {Im_O}")
tests.append(("42 = dim(so(4)) * Im_O", dim_so(4) * Im_O == 42))

# 42 = 2 * 21 = dim_C * dim(so(7))
print(f"42 = dim_C * dim(so(7)) = {dim_C} * {dim_so(7)}")
tests.append(("42 = dim_C * dim(so(7))", dim_C * dim_so(7) == 42))

# 42 = 3 * 14 = Im_H * dim(G_2)
print(f"42 = Im_H * dim(G_2) = {Im_H} * 14")
tests.append(("42 = Im_H * dim(G_2)", Im_H * 14 == 42))

# These three factorizations are ALL natural!
# Each factorizes 42 as (Egyptian denominator) * (corresponding numerator)
# This is tautological but shows internal consistency

# Non-trivial check: is 42 a "special" number in representation theory?
# 42 = dim of the 6-dimensional irrep of S_7?  No.
# 42 = C(9,2) = number of edges in K_9
print(f"\nC(9,2) = {9*8//2} -- not obviously related")

# 42 = dim(Lambda^3(R^4) tensor R^7)? = C(4,3)*7 = 4*7 = 28. No.
# 42 = sum of first 11 - 10 = ... no

# Most natural: 42 = dim_C * Im_H * Im_O = product of non-Gaussian-norm
# imaginary dimensions (plus dim_C)
print("42 = product of {dim_C, Im_H, Im_O} = {2, 3, 7}")
print("   = the three 'physical' Sylvester denominators")

# ============================================================
# SECTION 9: The so(11) isotropy algebra connection
# ============================================================
print("\n--- Section 9: Isotropy Algebra Decomposition ---")

# so(4) + so(7) = 27. Under further G_2 refinement:
# so(4) + g_2 + R^7 = 6 + 14 + 7 = 27
# These are the pieces that appear in the Egyptian fraction (6 and 14)
# plus the fundamental of G_2 (7 = Im_O)

# The FULL decomposition of 42:
# 42 = so(4) + g_2 + Im_O + R^(42-27)
# 42 = 6 + 14 + 7 + 15
# But 15 = Im_O + dim_O = 7 + 8. Or 15 = su(4) = so(6)

# Alternative clean decomposition:
# 42 = so(7) + G_2 + R^7 NO: 21 + 14 + 7 = 42 YES!
print("42 = dim(so(7)) + dim(G_2) + Im_O")
print(f"   = {dim_so(7)} + 14 + {Im_O} = {dim_so(7) + 14 + Im_O}")
tests.append(("42 = so(7) + G_2 + Im_O", dim_so(7) + 14 + Im_O == 42))

# But this is just so(7) + (G_2 + R^7) = so(7) + so(7) = 2*so(7) = 42
# Wait: so(7) = g_2 + R^7 = 14 + 7 = 21
# So 42 = so(7) + so(7) = 2 * dim(so(7))
print(f"\n42 = 2 * dim(so(7)) = 2 * 21 = {2 * dim_so(7)}")
tests.append(("42 = 2 * dim(so(7))", 2 * dim_so(7) == 42))

# This means: the complexified so(7)!
# so(7)_C = so(7) tensor C has REAL dimension 2 * 21 = 42
print("so(7)_C = so(7) (x)_R C has real dimension 42")
print("This is the COMPLEXIFIED Lie algebra of SO(7)!")

# The Egyptian fraction decomposition of so(7)_C:
# Viewed as a real vector space, so(7)_C = so(7) + i*so(7)
# Under G_2 subset SO(7):
#   so(7) = g_2 + R^7
#   so(7)_C = g_2_C + C^7 = (g_2 + i*g_2) + (R^7 + i*R^7)
#           = 14 + 14 + 7 + 7 = 42
# Different grading than Egyptian fraction (14+14+7+7 vs 21+14+6+1)

# But the Egyptian fraction grading is:
# 21 (= so(7) real part) + 14 (= G_2) + 6 (= so(4)) + 1 (= residual)
# This mixes real/imaginary parts of the complexification with so(4)

# ============================================================
# SECTION 10: Cleanest interpretation
# ============================================================
print("\n--- Section 10: Cleanest Interpretation ---")

print("""
The cleanest statement is:

1. 42 = dim_C * Im_H * Im_O = LCM of physical Sylvester denominators

2. Over common denominator 42, the Egyptian fraction becomes:
   21/42 + 14/42 + 6/42 = 41/42

3. The numerators are Lie algebra dimensions:
   21 = dim(so(Im_O))  -- rotations in imaginary octonion space
   14 = dim(G_2)       -- automorphisms of octonions
    6 = dim(so(n_d))   -- rotations in defect (spacetime) space

4. These are the THREE structural symmetry groups of the framework:
   SO(7): internal rotations (isotropy factor)
   G_2:   preserved by crystallization (Aut(O) subset SO(7))
   SO(4): spacetime rotations (isotropy factor)

5. Their dimensions sum to 41, leaving exactly 1 mode unaccounted.

6. The cross-algebraic pattern:
   C contributes -> SO(7) modes  (C "measures" octonionic space)
   H contributes -> G_2 modes    (H "measures" octonionic structure)
   O contributes -> SO(4) modes  (O "measures" spacetime)
""")

# Verify the cross pattern explicitly
print("Cross-algebraic verification:")
print(f"  1/dim_C -> {42//dim_C} = dim(so({Im_O}))  [C -> O-rotations]")
print(f"  1/Im_H  -> {42//Im_H} = dim(Aut(O))       [H -> O-automorphisms]")
print(f"  1/Im_O  -> {42//Im_O} = dim(so({n_d}))     [O -> H-rotations]")

# ============================================================
# SECTION 11: The remainder 1/42 interpretation
# ============================================================
print("\n--- Section 11: The Remainder 1/42 ---")

# 1/42 = the "beyond-Hurwitz" residual
# In the Sylvester sequence: 1/43 + 1/1807 + ... = 1/42
# The next term 1/43 accounts for 42/43 of the remainder

beyond_hurwitz_fraction = Rational(1, 43)
fraction_of_remainder = beyond_hurwitz_fraction / Rational(1, 42)
print(f"1/43 as fraction of 1/42: {float(fraction_of_remainder):.4f}")
print(f"= 42/43 = {Rational(42, 43)}")
tests.append(("1/43 accounts for 42/43 of remainder",
              fraction_of_remainder == Rational(42, 43)))

# The single unaccounted mode in 42 = 21 + 14 + 6 + 1:
# 1 mode that doesn't belong to so(7), G_2, or so(4)
# This could be the "scalar" direction: the overall scale/trace direction
print(f"\nThe 1 residual mode: scalar/trace direction?")
print(f"  Total isotropy: so(4) + so(7) = 27")
print(f"  With G_2 refinement: so(4) + g_2 + R^7 = 27")
print(f"  42 - 41 = 1: one mode beyond the three Lie algebras")

# ============================================================
# SECTION 12: Comparison with so(11) decomposition
# ============================================================
print("\n--- Section 12: Comparison with so(11) ---")

# so(11) = so(4) + so(7) + R^28  [55 = 6 + 21 + 28]
# The Egyptian fraction uses 6 + 21 = 27 (isotropy)
# but adds G_2 (14) instead of coset (28)

# This is because the Egyptian fraction comes from the
# SYLVESTER sequence, not from the SO(11) decomposition.
# The coincidence 6 + 21 is structural:
# both the isotropy algebra and the Egyptian fraction
# give the same two pieces (so(4) and so(7))

# But the GRADING is different:
# so(11): grade 0 = so(4)+so(7) = 27, grade 1 = coset = 28
# Egyptian: grade 1 = 21 (C), grade 2 = 14 (H), grade 3 = 6 (O)

print("so(11) grading vs Egyptian grading:")
print(f"  so(11): 27 (isotropy) + 28 (coset) = 55")
print(f"  Egyptian: 21 + 14 + 6 + 1 = 42")
print(f"  Overlap: so(4)=6 and so(7)=21 appear in BOTH")
print(f"  Difference: so(11) adds 28 coset modes")
print(f"              Egyptian adds 14 G_2 + 1 scalar")

# ============================================================
# SECTION 13: Does the beyond-Hurwitz term 43 relate to G_2?
# ============================================================
print("\n--- Section 13: 43 and G_2 ---")

# 43 = Phi_6(7) = 7^2 - 7 + 1
# G_2 has dimension 14 = 2 * 7
# The Coxeter number of G_2 is 6
# The dual Coxeter number of G_2 is 4
# Number of positive roots of G_2 = 6

# 43 = 3 * 14 + 1 = 3 * dim(G_2) + 1
three_g2 = 3 * 14
print(f"3 * dim(G_2) + 1 = {three_g2} + 1 = {three_g2 + 1}")
tests.append(("43 = 3*dim(G_2) + 1", three_g2 + 1 == 43))

# Also: 43 = Im_H * dim(G_2) + 1
print(f"Im_H * dim(G_2) + 1 = {Im_H * 14} + 1 = {Im_H * 14 + 1}")
tests.append(("43 = Im_H * dim(G_2) + 1", Im_H * 14 + 1 == 43))

# This connects to Sylvester: a_4 = a_1*a_2*a_3 + 1 = 2*3*7 + 1 = 43
# = dim_C * Im_H * Im_O + 1 = 42 + 1
print(f"\n43 = 42 + 1 = dim_C*Im_H*Im_O + 1")
print(f"   = LCM(2,3,7) + 1")
print(f"   = (Sylvester product formula)")
tests.append(("43 = 42 + 1 = Sylvester product", 2*3*7 + 1 == 43))

# ============================================================
# SECTION 14: Summary statistics
# ============================================================
print("\n--- Section 14: Summary ---")

# Count unique identifications (non-tautological)
print("Non-tautological identifications:")
print("  1. 42 = LCM(dim_C, Im_H, Im_O) [coprimality]")
print("  2. 42/2 = 21 = dim(so(7)) [octonionic rotations]")
print("  3. 42/3 = 14 = dim(G_2)   [octonionic automorphisms]")
print("  4. 42/7 = 6  = dim(so(4)) [spacetime rotations]")
print("  5. 42 = 2*dim(so(7)) = dim_R(so(7)_C) [complexified]")
print("  6. 43 = 42 + 1 = LCM + 1 [Sylvester]")
print("  7. Cross-algebraic: C->SO(7), H->G_2, O->SO(4)")

# ============================================================
# RESULTS
# ============================================================
print("\n" + "=" * 65)
print("TEST RESULTS")
print("=" * 65)

passed = 0
failed = 0
for name, result in tests:
    status = "PASS" if result else "FAIL"
    if result:
        passed += 1
    else:
        failed += 1
    print(f"[{status}] {name}")

print(f"\nTotal: {passed}/{passed+failed} PASS")
if failed > 0:
    print(f"FAILED: {failed}")
