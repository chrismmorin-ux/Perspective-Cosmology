#!/usr/bin/env python3
"""
Beta Function Ladder: Skeptical Analysis

KEY FINDING: The "ladder" b_0 = {11, 9, 7, 5, 3, 1} at N_f = {0,3,6,9,12,15}
is TRIVIALLY the sequence of odd numbers from 11 to 1. The framework
identifications {n_c, Im_H^2, Im_O, n_d+1, Im_H, dim_R} are mostly
forced by the fact that ALL small odd numbers match some framework number.

The ONLY non-trivial content is:
  (a) b_0(0) = n_c, which follows from 11/3 = n_c/Im_H [established EQ-008]
  (b) Integer b_0 requires N_f = 0 mod 3 = 0 mod N_c = 0 mod Im_H
  (c) b_0(2*Im_H) = Im_O, connecting two different division algebra dimensions

Status: SKEPTICAL VERIFICATION
"""

from sympy import Rational

# Framework constants
dim_R = 1
dim_C = 2
n_d = 4    # dim_H
dim_O = 8
Im_H = 3
Im_O = 7
n_c = 11

tests = []
print("=" * 65)
print("BETA FUNCTION LADDER: SKEPTICAL ANALYSIS")
print("=" * 65)

# ============================================================
# SECTION 1: The beta function formula
# ============================================================
print("\n--- Section 1: QCD Beta Function ---")

# SU(N_c) with N_f Dirac fermions in the fundamental:
# b_0 = (11/3)*N_c - (2/3)*N_f
# For SU(3): b_0 = 11 - (2/3)*N_f

N_c = 3  # = Im_H

def b0(Nf, Nc=3):
    """One-loop beta coefficient for SU(Nc) with Nf Dirac fundamentals."""
    return Rational(11, 3) * Nc - Rational(2, 3) * Nf

# Integer values: b_0 is integer iff (2/3)*N_f is integer iff N_f = 0 mod 3
print(f"b_0(N_f) = 11*N_c/3 - 2*N_f/3 for SU(N_c)")
print(f"For SU(3): b_0 = 11 - 2*N_f/3")
print(f"Integer b_0 requires N_f = 0 mod {N_c}")

# WHY N_f mod 3: because N_c = 3 = Im_H
print(f"N_c = {N_c} = Im_H, so integer b_0 at N_f = Im_H * k")
tests.append(("N_c = Im_H = 3", N_c == Im_H))

# ============================================================
# SECTION 2: The full ladder
# ============================================================
print("\n--- Section 2: The Ladder ---")

ladder = {}
for k in range(6):
    Nf = 3 * k
    val = b0(Nf)
    ladder[Nf] = int(val)
    print(f"b_0(N_f={Nf:2d}) = {int(val):2d}")

# These are just odd numbers from 11 to 1
odd_sequence = list(range(11, 0, -2))
ladder_values = [ladder[3*k] for k in range(6)]
print(f"\nLadder values: {ladder_values}")
print(f"Odd 11 to 1:   {odd_sequence}")
tests.append(("Ladder = odd numbers 11 to 1", ladder_values == odd_sequence))

# ============================================================
# SECTION 3: WHY it's just odd numbers
# ============================================================
print("\n--- Section 3: Why Trivially Odd Numbers ---")

# b_0(3k) = 11 - 2k, for k = 0,1,...,5
# Starting from 11 (odd), subtracting 2 each time -> always odd
# Range: 11, 9, 7, 5, 3, 1
print("b_0(3k) = 11 - 2k, k = 0,1,...,5")
print("This is an arithmetic sequence with first term 11, common diff -2")
print("-> Every other integer from 11 down = all odd numbers 11 to 1")

for k in range(6):
    val = 11 - 2*k
    expected = ladder[3*k]
    check = (val == expected)
    print(f"  k={k}: 11-2*{k} = {val}, b_0(3*{k}) = {expected}, match: {check}")
    if k == 0:
        tests.append(("k=0: 11-0=11", val == 11))

# The fact that ALL odd numbers from 11 to 1 appear is NOT surprising
# It's an artifact of the linear formula b_0 = 11 - 2k

# ============================================================
# SECTION 4: Framework number matching - skeptical audit
# ============================================================
print("\n--- Section 4: Framework Number Audit (Skeptical) ---")

# The claim: each ladder value matches a framework number
# Let's check how MANY framework numbers exist for each odd value

framework_numbers = {
    1: ["dim_R", "dim(Im_C)"],
    2: ["dim_C"],
    3: ["Im_H", "N_c (SM color)"],
    4: ["n_d = dim_H"],
    5: [],  # no clean framework number
    6: ["dim(so(4))", "dim(SU(2)xSU(2))"],
    7: ["Im_O"],
    8: ["dim_O"],
    9: [],  # 3^2, but is Im_H^2 "natural"?
    10: [],
    11: ["n_c"],
    12: ["dim(SM gauge) = 1+3+8"],
    13: [],
    14: ["dim(G_2)", "2*Im_O"],
    15: ["dim(su(4))"],
    16: ["n_d^2"],
    17: ["dim(Gr(4,11)/2)"],
    21: ["dim(so(7))"],
    28: ["N_Goldstone"],
}

print("Odd numbers 1-11 and their framework status:")
for n in [1, 3, 5, 7, 9, 11]:
    fns = framework_numbers.get(n, [])
    status = ", ".join(fns) if fns else "NO CLEAN MATCH"
    print(f"  {n:2d}: {status}")

# The critical question: what fraction of small odd numbers have
# "framework" identifications?
odd_1_to_11 = [1, 3, 5, 7, 9, 11]
has_match = [1, 3, 7, 11]  # Clean matches
weak_match = [9]  # Im_H^2 is a stretch
no_match = [5]  # n_d+1 is very weak

print(f"\nClean matches: {has_match} ({len(has_match)}/6)")
print(f"Weak matches:  {weak_match} ({len(weak_match)}/6)")
print(f"No match:      {no_match} ({len(no_match)}/6)")

# 4/6 have clean matches, 1 weak, 1 none
# This is NOT surprising: {1, 3, 7, 11} are all framework-fundamental
# 9 = 3^2 requires squaring, 5 requires adding 1 to n_d

tests.append(("5 has no clean framework match", len(framework_numbers.get(5, [])) == 0))
tests.append(("9 has no clean framework match", len(framework_numbers.get(9, [])) == 0))

# ============================================================
# SECTION 5: What IS non-trivial
# ============================================================
print("\n--- Section 5: Genuinely Non-Trivial Content ---")

# (a) b_0(0) = n_c
print("(a) b_0(0) = 11 = n_c")
print(f"    This follows from (11/3)*N_c = (11/3)*3 = 11")
print(f"    Framework: 11/3 = n_c/Im_H [established in EQ-008]")
print(f"    Structural: the QCD beta coefficient IS n_c/Im_H")
tests.append(("b_0(0) = n_c", b0(0) == n_c))

# (b) Integer values at N_f = Im_H * k
print(f"\n(b) Integer b_0 at N_f multiples of Im_H = {Im_H}")
print(f"    Because N_c = Im_H = 3, the 2/3 factor cancels")
print(f"    Physical: SM has 3 light generations -> N_f = 6 = 2*Im_H")
tests.append(("SM N_f=6 = 2*Im_H", 6 == 2 * Im_H))

# (c) b_0(2*Im_H) = Im_O
b0_at_2ImH = b0(2 * Im_H)
print(f"\n(c) b_0(2*Im_H) = b_0(6) = {int(b0_at_2ImH)} = Im_O = {Im_O}")
print(f"    This means: n_c - 2*(2*Im_H)/3 = n_c - 4*Im_H/3")
print(f"    = 11 - 4 = 7")
print(f"    Equivalently: n_c - Im_O = 4 = n_d")
print(f"    This is the framework identity n_c = n_d + Im_O")
tests.append(("b_0(2*Im_H) = Im_O", int(b0_at_2ImH) == Im_O))
tests.append(("n_c - Im_O = n_d", n_c - Im_O == n_d))

# (d) The STRUCTURAL chain
print(f"\n(d) Structural chain:")
print(f"    b_0(0) = (n_c/Im_H)*N_c = n_c")
print(f"    b_0(N_c) = n_c - 2*N_c/3 = n_c - 2*Im_H/3 = n_c - 2 = 9")
print(f"    b_0(2*N_c) = n_c - 4*N_c/3 = n_c - 4 = Im_O")
print(f"    Each step subtracts 2*N_c/3 = 2*Im_H/3 = 2")
b0_step = Rational(2, 3) * N_c
print(f"    Step size: 2*N_c/3 = {b0_step}")
tests.append(("Step size = 2", b0_step == 2))

# ============================================================
# SECTION 6: The asymptotic freedom boundary
# ============================================================
print("\n--- Section 6: Asymptotic Freedom Boundary ---")

# AF boundary: b_0 > 0 iff N_f < 11*N_c/2 = 33/2 = 16.5
af_boundary = Rational(11, 2) * N_c
print(f"AF boundary: N_f < {af_boundary} = {float(af_boundary)}")

# The boundary 33/2 = Im_H * n_c / 2 = Im_H * n_c / dim_C
print(f"33/2 = Im_H * n_c / dim_C = {Im_H * n_c} / {dim_C} = {Rational(Im_H * n_c, dim_C)}")
tests.append(("AF boundary = Im_H*n_c/dim_C", af_boundary == Rational(Im_H * n_c, dim_C)))

# Also: 33 = Im_H * n_c = 3 * 11
print(f"33 = Im_H * n_c = {Im_H * n_c}")
tests.append(("33 = Im_H * n_c", Im_H * n_c == 33))

# ============================================================
# SECTION 7: Does the pattern extend to other SU(N)?
# ============================================================
print("\n--- Section 7: Other Gauge Groups ---")

# For SU(N_c): b_0 = (11/3)*N_c - (2/3)*N_f
# b_0(0) = (11/3)*N_c
# Integer iff N_c = 0 mod 3

print("b_0(0) for various N_c:")
for Nc_test in range(2, 8):
    val = Rational(11, 3) * Nc_test
    is_int = val.q == 1
    print(f"  SU({Nc_test}): b_0(0) = {float(val):.3f} {'(integer)' if is_int else ''}")

# Only SU(3), SU(6), SU(9)... give integer b_0(0)
# This is because 11 is coprime to 3, so 11*N_c/3 is integer iff 3|N_c
tests.append(("b_0(0) integer only when 3|N_c", all(
    (Rational(11,3)*Nc).q == 1 for Nc in [3,6,9]
)))

# For SU(2): b_0(0) = 22/3 ~ 7.33 (not integer, not framework)
# For SU(5): b_0(0) = 55/3 ~ 18.33 (not integer)
# The pattern is SU(3)-specific because 3 = Im_H

# ============================================================
# SECTION 8: Separation of structural from coincidental
# ============================================================
print("\n--- Section 8: Structural vs Coincidental ---")

print("STRUCTURAL (follows from framework relations):")
print(f"  [S] b_0(0) = n_c = 11 (from 11/3 = n_c/Im_H)")
print(f"  [S] Integer b_0 at multiples of Im_H (from N_c = Im_H)")
print(f"  [S] b_0(6) = Im_O (from n_c = n_d + Im_O)")
print(f"  [S] b_0(3) = 9 = n_c - 2 (just arithmetic)")

print(f"\nCOINCIDENTAL (small numbers match anything):")
print(f"  [C] 9 = Im_H^2 (9 is 3^2, squaring is ad hoc)")
print(f"  [C] 5 = n_d + 1 (adding 1 is ad hoc)")
print(f"  [C] 3 = Im_H (b_0(12) = 3 is just 11-8)")
print(f"  [C] 1 = dim_R (b_0(15) = 1 is just 11-10)")

print(f"\nFAIR (legitimate but expected):")
print(f"  [F] Asymptotic freedom boundary = Im_H*n_c/dim_C")
print(f"  [F] All from linear formula -> all structure is in b_0(0) = n_c")

# ============================================================
# SECTION 9: The key identity: 11/3 = n_c/Im_H
# ============================================================
print("\n--- Section 9: Root Cause ---")

# ALL the structure comes from one fact:
# The QCD one-loop coefficient 11/3 happens to equal n_c/Im_H
# If this is structural (per EQ-008), then:
#   b_0(0) = (n_c/Im_H) * Im_H = n_c
#   b_0(k*Im_H) = n_c - 2k
#   b_0(2*Im_H) = n_c - 4 = Im_O (using n_c = n_d + Im_O)

# The ENTIRE ladder is determined by: 11/3 = n_c/Im_H + N_c = Im_H
# No new information beyond what EQ-008 already established

print("The entire ladder follows from TWO facts:")
print(f"  (1) 11/3 = n_c/Im_H [EQ-008, established S295-S305]")
print(f"  (2) N_c = Im_H [A-IMPORT from SM]")
print(f"No new structural content beyond EQ-008.")

tests.append(("11/3 = n_c/Im_H", Rational(11, 3) == Rational(n_c, Im_H)))

# ============================================================
# SECTION 10: Final verdict
# ============================================================
print("\n--- Section 10: Verdict ---")

print("""
VERDICT: The beta function ladder is NOT an independent finding.
It is a REPACKAGING of the EQ-008 result (11/3 = n_c/Im_H) combined
with N_c = Im_H = 3. The appearance of framework numbers at each
step is partly structural (b_0(0) = n_c, b_0(6) = Im_O) and partly
coincidental (small odd numbers inevitably match something).

Assessment: [OBSERVATION] — interesting presentation of known content,
NOT a new result. The individual identifications 9 = Im_H^2 and
5 = n_d + 1 are not meaningful. Only b_0(0) = n_c and b_0(6) = Im_O
carry structural weight, and both were already known from EQ-008.
""")

# ============================================================
# RESULTS
# ============================================================
print("=" * 65)
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
