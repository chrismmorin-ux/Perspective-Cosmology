#!/usr/bin/env python3
"""
Pi-Power Sum Theorems: Deep Structural Analysis

KEY FINDING: The pi-powers encode a Cayley-Dickson descent operation.
floor(d/2) maps each imaginary dimension to the PREVIOUS imaginary
dimension in the Cayley-Dickson sequence. The sum theorems follow
from the binary structure of 2^k - 1.

Results:
  - floor(Im(D_k)/2) = Im(D_{k-1}): Cayley-Dickson recursion [THEOREM]
  - Sum over div alg dims = 2^{n_DA-1} - 1 = Im(last DA) [THEOREM]
  - Odd/even D_fw split: |odd| = n_d, |even| = Im(H) [THEOREM]
  - Pi-power of Gr(4,11) = sum of nontrivial DA dims [THEOREM]
  - Rank sum over odd D_fw = Im(H)^2 [THEOREM]

Status: INVESTIGATION (extends pi_from_foundations.py)
"""

from sympy import S, pi, Rational, floor as sym_floor, simplify, gamma
from math import floor

# Framework dimensions (all DERIVED from CCP + Hurwitz)
dims_div_alg = [1, 2, 4, 8]     # R, C, H, O = {2^k : k=0..3}
dims_imaginary = [0, 1, 3, 7]   # Im(R), Im(C), Im(H), Im(O) = {2^k-1 : k=0..3}
dims_imaginary_nontrivial = [1, 3, 7]  # Excluding Im(R) = 0
n_c = 11                         # Crystal dimension
n_d = 4                          # Transition/defect dimension
D_fw = [1, 2, 3, 4, 7, 8, 11]   # Complete framework set

passed = 0
failed = 0

def check(name, condition):
    global passed, failed
    if condition:
        print(f"  [PASS] {name}")
        passed += 1
    else:
        print(f"  [FAIL] {name}")
        failed += 1

def pi_power(d):
    """Effective power of pi in Vol(S^{d-1}) = floor(d/2).
    Also equals rank(SO(d))."""
    return d // 2


# =============================================================
# Part 1: Cayley-Dickson Recursion
# =============================================================
print("=== Part 1: Cayley-Dickson Recursion ===")
print("    floor(Im(D_k)/2) = Im(D_{k-1})")
print()

# Division algebras D_0=R, D_1=C, D_2=H, D_3=O
# dim(D_k) = 2^k, Im(D_k) = 2^k - 1
DA_names = ['R', 'C', 'H', 'O']

for k in range(1, 4):
    im_dk = 2**k - 1          # Im(D_k)
    im_dk_prev = 2**(k-1) - 1 # Im(D_{k-1})
    pp = floor(im_dk / 2)
    print(f"    floor(Im({DA_names[k]})/2) = floor({im_dk}/2) = {pp} = Im({DA_names[k-1]}) = {im_dk_prev}")
    check(f"floor(Im({DA_names[k]})/2) = Im({DA_names[k-1]})", pp == im_dk_prev)

# General proof: Im(D_k) = 2^k - 1 is odd for k >= 1
# floor((2^k - 1)/2) = (2^k - 1 - 1)/2 = (2^k - 2)/2 = 2^{k-1} - 1 = Im(D_{k-1})
print()
print("    PROOF: Im(D_k) = 2^k - 1 is odd for k >= 1")
print("    floor((2^k-1)/2) = (2^k-2)/2 = 2^{k-1}-1 = Im(D_{k-1})  QED")
check("All Im dims are odd (2^k - 1 for k >= 1)", all((2**k - 1) % 2 == 1 for k in range(1, 4)))

# Consequence: pi-power sum over imaginary dims telescopes
# sum_{k=1}^{3} floor(Im(D_k)/2) = sum_{k=1}^{3} Im(D_{k-1})
# = Im(D_0) + Im(D_1) + Im(D_2) = 0 + 1 + 3 = 4 = n_d
print()
print("    CONSEQUENCE: sum of pi-powers over Im dims telescopes:")
print("    sum floor(Im(D_k)/2) = sum Im(D_{k-1}) = Im(R)+Im(C)+Im(H) = 0+1+3 = 4 = n_d")
telescope_sum = sum(floor((2**k - 1) / 2) for k in range(1, 4))
check("Telescoped sum = n_d", telescope_sum == n_d)


# =============================================================
# Part 2: Division Algebra Sum as Geometric Series
# =============================================================
print("\n=== Part 2: Division Algebra Pi-Power Sum ===")

# floor(dim(D_k)/2) for k=0..3: floor(2^k/2) = 2^{k-1} for k >= 1, 0 for k=0
# Sum = 0 + 2^0 + 2^1 + 2^2 = 0 + 1 + 2 + 4 = 7 = 2^3 - 1 = Im(O)
powers = [pi_power(d) for d in dims_div_alg]
print(f"    Dims:      {dims_div_alg}")
print(f"    Pi-powers: {powers}")
print(f"    Sum = {sum(powers)}")

check("Pi-power sum over DA dims = 2^3 - 1 = 7 = Im(O)", sum(powers) == 7)

# This is a geometric series: sum_{k=1}^{n-1} 2^{k-1} = 2^{n-1} - 1
# For n=4 division algebras: sum = 2^3 - 1 = 7 = Im(D_3) = Im(O)
n_DA = 4  # number of division algebras
geom_sum = 2**(n_DA - 1) - 1
check(f"Geometric series: 2^({n_DA}-1) - 1 = {geom_sum} = Im(O)", geom_sum == 7)

# In general: sum of pi-powers over DA spheres = Im(last DA)
print()
print("    THEOREM: sum of floor(2^k/2) for k=0..n-1 = 2^{n-1} - 1 = Im(D_{n-1})")
print("    For n=4: sum = Im(O) = 7")


# =============================================================
# Part 3: Odd/Even Parity Decomposition of D_fw
# =============================================================
print("\n=== Part 3: Odd/Even Parity in D_fw ===")

odd_elements = [d for d in D_fw if d % 2 == 1]
even_elements = [d for d in D_fw if d % 2 == 0]

print(f"    D_fw = {D_fw}")
print(f"    Odd elements:  {odd_elements} (count = {len(odd_elements)})")
print(f"    Even elements: {even_elements} (count = {len(even_elements)})")

check(f"Number of odd elements in D_fw = {len(odd_elements)} = n_d",
      len(odd_elements) == n_d)
check(f"Number of even elements in D_fw = {len(even_elements)} = Im(H)",
      len(even_elements) == 3)  # Im(H) = 3

# The odd elements are {1, 3, 7, 11} = {Im(R U C), Im(H), Im(O), n_c}
check("Odd D_fw = {1, 3, 7, 11}", odd_elements == [1, 3, 7, 11])

# The even elements are {2, 4, 8} = nontrivial division algebra dims
check("Even D_fw = {2, 4, 8} = {dim(C), dim(H), dim(O)}",
      even_elements == [2, 4, 8])

# Total: |D_fw| = n_d + Im(H) = 4 + 3 = 7 = Im(O)
check("|D_fw| = n_d + Im(H) = 7 = Im(O)",
      len(D_fw) == n_d + 3 == 7)

# Rank sums by parity
even_rank_sum = sum(pi_power(d) for d in even_elements)
odd_rank_sum = sum(pi_power(d) for d in odd_elements)
print(f"\n    Even D_fw rank sum: {[pi_power(d) for d in even_elements]} = {even_rank_sum}")
print(f"    Odd D_fw rank sum:  {[pi_power(d) for d in odd_elements]} = {odd_rank_sum}")

check(f"Even rank sum = {even_rank_sum} = Im(O)", even_rank_sum == 7)
check(f"Odd rank sum = {odd_rank_sum} = Im(H)^2", odd_rank_sum == 9)

# 7 + 9 = 16 = 2^n_d
check("7 + 9 = 16 = 2^n_d", even_rank_sum + odd_rank_sum == 16)


# =============================================================
# Part 4: The General Pi-Power Sum Formula
# =============================================================
print("\n=== Part 4: General Formula ===")
print("    sum floor(d/2) = (sum(S) - |odd elements in S|) / 2")
print()

# For any set S: sum floor(d/2) = (sum(S) - |{odd d in S}|) / 2
# Because floor(d/2) = d/2 for even d, (d-1)/2 for odd d
# So sum = sum(d/2) - (number of odd)/2 = (sum - #odd) / 2

def formula_check(name, S):
    direct = sum(pi_power(d) for d in S)
    s = sum(S)
    n_odd = sum(1 for d in S if d % 2 == 1)
    formula = (s - n_odd) // 2
    ok = direct == formula
    check(f"{name}: sum={s}, #odd={n_odd}, formula=({s}-{n_odd})/2={formula}, direct={direct}", ok)
    return direct

r1 = formula_check("Div alg {1,2,4,8}", dims_div_alg)
r2 = formula_check("Imaginary {1,3,7}", dims_imaginary_nontrivial)
r3 = formula_check("D_fw minus {11}", [1,2,3,4,7,8])
r4 = formula_check("All D_fw", D_fw)

# The formula reveals: results depend on sum(S) and #odd(S)
print()
print("    Key insight: the pi-power sum depends only on two things:")
print("    (1) The total sum of dimensions in the set")
print("    (2) How many of those dimensions are odd")


# =============================================================
# Part 5: Why the Sums Are Framework Dimensions
# =============================================================
print("\n=== Part 5: Why the Sums = Framework Dimensions ===")

# Division algebras: sum = 1+2+4+8 = 15, #odd = 1
# Result: (15-1)/2 = 7 = Im(O)
# This works because sum(2^k, k=0..3) = 2^4 - 1 = 15, and #odd = 1 (only R)
print("    Div alg: sum(2^k, k=0..3) = 15, #odd = 1 (only R=1)")
print("    (15-1)/2 = 7 = Im(O) = 2^3 - 1")

# Imaginary: sum = 1+3+7 = 11 = n_c (by CCP!), #odd = 3 = Im(H)
# Result: (11-3)/2 = 4 = n_d
# This is n_d = (n_c - Im(H))/2
print("\n    Imaginary: sum = 1+3+7 = 11 = n_c (CCP definition!), #odd = 3 = Im(H)")
print("    (n_c - Im(H))/2 = (11-3)/2 = 4 = n_d")
check("n_d = (n_c - Im(H))/2", n_d == (n_c - 3) // 2)

# This gives an identity: n_c = 2*n_d + Im(H) = 2*4 + 3 = 11
print(f"    Identity: n_c = 2*n_d + Im(H) = 2*{n_d} + 3 = {2*n_d + 3}")
check("n_c = 2*n_d + Im(H)", n_c == 2*n_d + 3)

# Also: n_c = 3*n_d - 1
print(f"    Equivalent: n_c = 3*n_d - 1 = 3*{n_d} - 1 = {3*n_d - 1}")
check("n_c = 3*n_d - 1", n_c == 3*n_d - 1)

# D_fw minus {11}: sum = 25, #odd = 3
# Result: (25-3)/2 = 11 = n_c
# sum(D_fw) - 11 = 36 - 11 = 25, #odd(D_fw) - 1 = 4-1 = 3
print("\n    D_fw minus {11}: sum = 25, #odd = 3")
print("    (25-3)/2 = 11 = n_c")

# All D_fw: sum = 36, #odd = 4
# Result: (36-4)/2 = 16 = 2^n_d
# sum(D_fw) = 36 = 6^2
print(f"\n    All D_fw: sum = 36, #odd = 4 = n_d")
print(f"    (36-4)/2 = 16 = 2^n_d = 2^4")
check("sum(D_fw) = 36", sum(D_fw) == 36)
check("#odd in D_fw = n_d", sum(1 for d in D_fw if d % 2 == 1) == n_d)
check("(36 - n_d)/2 = 2^n_d", (36 - n_d) // 2 == 2**n_d)

# This gives: sum(D_fw) = 2^{n_d+1} + n_d = 2*16 + 4 = 36
print(f"    Identity: sum(D_fw) = 2^(n_d+1) + n_d = {2**(n_d+1)} + {n_d} = {2**(n_d+1) + n_d}")
check("sum(D_fw) = 2^(n_d+1) + n_d", sum(D_fw) == 2**(n_d+1) + n_d)


# =============================================================
# Part 6: Grassmannian Pi-Power = Sum of Nontrivial DA Dims
# =============================================================
print("\n=== Part 6: Grassmannian Pi-Power ===")

dim_gr = n_d * (n_c - n_d)  # 4 * 7 = 28
pp_gr = dim_gr // 2          # 14
sum_nontrivial_da = sum(dims_div_alg[1:])  # 2 + 4 + 8 = 14

print(f"    dim(Gr(4,11)) = {dim_gr} = n_d * (n_c - n_d)")
print(f"    Pi-power = {pp_gr} = dim(Gr)/2")
print(f"    Sum of nontrivial DA dims: {dims_div_alg[1:]} = {sum_nontrivial_da}")
check("Pi-power of Gr = sum(dim C, dim H, dim O) = 14", pp_gr == sum_nontrivial_da)

# Why? Because 2+4+8 = 2(1+2+4) = 2(2^3-1) = 2*Im(O) = 2*7 = 14
print(f"    = C * Im(O) = 2 * 7 = 14")
check("14 = C * Im(O)", pp_gr == 2 * 7)

# And dim(Gr)/2 = n_d * Im(O) / 2 = n_d * Im(O) / C
# = 4 * 7 / 2 = 14
print(f"    = n_d * Im(O) / C = 4 * 7 / 2 = 14")


# =============================================================
# Part 7: The Rank = floor(d/2) as SO(d) Rank
# =============================================================
print("\n=== Part 7: Rank Interpretation ===")

# floor(d/2) = rank of SO(d) = number of independent rotation planes
# = dimension of maximal torus T^{floor(d/2)} in SO(d)
# Each rotation plane contributes one factor of 2*pi to the volume

print("    floor(d/2) = rank(SO(d)) = # independent rotation planes")
print()

for d in D_fw:
    rank = d // 2
    print(f"    SO({d:2d}): rank = {rank}, maximal torus T^{rank}")

print()
print("    The pi-power counts how many independent circular")
print("    (U(1)) subgroups fit inside SO(d).")
print("    Each U(1) contributes one factor of pi to the volume.")

# rank(SO(d)) = floor(d/2) counts the number of orthogonal 2-planes
# in R^d where independent rotations can happen
# For d odd: one direction is left fixed (the "axis")
# For d even: all directions participate in rotations

check("rank(SO(11)) = 5 = floor(n_c/2)", 11 // 2 == 5)
check("rank(SO(4)) = 2 = n_d/2 = C/dim(C)... = n_d/C", 4 // 2 == 2)
check("rank(SO(8)) = 4 = n_d", 8 // 2 == n_d)
check("rank(SO(2)) = 1 = dim(Im(C))", 2 // 2 == 1)
check("rank(SO(4)) = 2 = dim(C)", 4 // 2 == 2)


# =============================================================
# Part 8: Product of Pi-Powers
# =============================================================
print("\n=== Part 8: Products of Pi-Powers ===")

# Product over nontrivial DA pi-powers
nontrivial_da_pp = [pi_power(d) for d in dims_div_alg if pi_power(d) > 0]
prod_da = 1
for p in nontrivial_da_pp:
    prod_da *= p
print(f"    Nontrivial DA pi-powers: {nontrivial_da_pp}")
print(f"    Product: {prod_da}")
check("Product of nontrivial DA pi-powers = 1*2*4 = 8 = dim(O)", prod_da == 8)

# Product over nontrivial imaginary pi-powers
nontrivial_im_pp = [pi_power(d) for d in dims_imaginary_nontrivial if pi_power(d) > 0]
prod_im = 1
for p in nontrivial_im_pp:
    prod_im *= p
print(f"    Nontrivial imag pi-powers: {nontrivial_im_pp}")
print(f"    Product: {prod_im}")
check("Product of nontrivial imag pi-powers = 1*3 = 3 = Im(H)", prod_im == 3)


# =============================================================
# Part 9: Self-Referential Structure
# =============================================================
print("\n=== Part 9: Self-Referential Structure ===")

# The pi-power map f(d) = floor(d/2) maps D_fw dimensions to new values:
print("    The map f(d) = floor(d/2) applied to D_fw:")
print()

mapped = {}
for d in D_fw:
    f_d = pi_power(d)
    mapped[d] = f_d
    in_dfw = "in D_fw" if f_d in D_fw else "NOT in D_fw"
    print(f"    f({d:2d}) = {f_d:2d}  ({in_dfw})")

# Image of D_fw under f
image = sorted(set(mapped.values()))
print(f"\n    Image of D_fw under f: {image}")
print(f"    D_fw = {D_fw}")

# How many map back into D_fw?
count_in = sum(1 for d in D_fw if mapped[d] in D_fw)
check(f"{count_in}/7 images land back in D_fw", count_in >= 4)

# f maps: 1->0, 2->1, 3->1, 4->2, 7->3, 8->4, 11->5
# Landing in D_fw: 2->1 yes, 3->1 yes, 4->2 yes, 7->3 yes, 8->4 yes
# Not in D_fw: 1->0, 11->5
print(f"\n    5 of 7 images land in D_fw (all except f(1)=0 and f(11)=5)")
print(f"    The map is 'almost closed' -- D_fw is almost a fixed set of f")


# =============================================================
# Part 10: The Fundamental Identity
# =============================================================
print("\n=== Part 10: The Fundamental Identity ===")

# The deepest result: n_c = 2*n_d + Im(H)
# This connects the crystal dimension, transition dimension,
# and the associativity-boundary structure.
#
# Proof from CCP:
# n_c = Im(C) + Im(H) + Im(O) = 1 + 3 + 7 = 11
# n_d = dim(H) = 4
# Im(H) = n_d - 1 = 3
# So: n_c = 1 + (n_d-1) + (2*n_d-1) = 3*n_d - 1
#     n_c = 2*n_d + Im(H)
#     n_c = 2*n_d + (n_d - 1) = 3*n_d - 1

print("    From CCP + Hurwitz:")
print(f"    n_c = Im(C) + Im(H) + Im(O)")
print(f"       = (2^1-1) + (2^2-1) + (2^3-1)")
print(f"       = 1 + 3 + 7 = {1+3+7}")
print(f"    n_d = dim(H) = 2^2 = {n_d}")
print(f"    Im(H) = n_d - 1 = {n_d - 1}")
print(f"    Im(O) = 2*n_d - 1 = {2*n_d - 1}")
print()
check("Im(H) = n_d - 1", 3 == n_d - 1)
check("Im(O) = 2*n_d - 1", 7 == 2*n_d - 1)

# Three equivalent forms of the identity:
forms = [
    ("n_c = 2*n_d + Im(H)", n_c == 2*n_d + 3),
    ("n_c = 3*n_d - 1", n_c == 3*n_d - 1),
    ("n_c + 1 = 3*n_d", n_c + 1 == 3*n_d),
    ("n_c - n_d = 2*n_d - 1 = Im(O)", n_c - n_d == 2*n_d - 1 == 7),
]
for name, cond in forms:
    check(name, cond)

# The pi-power sum over imaginary dims DERIVES n_d from n_c:
# sum floor(Im(D_k)/2) = (n_c - Im(H))/2 = (n_c - (n_d-1))/2 = n_d
# This is self-consistent: n_d = (n_c - n_d + 1)/2 => 2*n_d = n_c - n_d + 1
# => 3*n_d = n_c + 1, which is one of the identities above.
print()
print("    The pi-power sum DERIVES n_d from n_c:")
print(f"    sum floor(Im(D_k)/2) = (n_c - Im(H))/2 = ({n_c} - 3)/2 = {n_d}")
print(f"    This is self-consistent: 3*n_d = n_c + 1 = 12")


# =============================================================
# Part 11: Summary Table
# =============================================================
print(f"\n{'='*65}")
print("SUMMARY: Pi-Power Structure of D_fw")
print(f"{'='*65}")

print()
print("Cayley-Dickson Recursion:")
print("  floor(Im(C)/2) = 0 = Im(R)   [shift down one level]")
print("  floor(Im(H)/2) = 1 = Im(C)   [shift down one level]")
print("  floor(Im(O)/2) = 3 = Im(H)   [shift down one level]")

print()
print("Sum Theorems (with structural explanation):")
print("  Div alg {1,2,4,8}:  sum=7  = Im(O) = geometric series 2^3-1")
print("  Imaginary {1,3,7}:  sum=4  = n_d   = (n_c - Im(H))/2")
print("  D_fw minus {11}:    sum=11 = n_c   = (25-3)/2")
print(f"  All D_fw:           sum=16 = 2^n_d = (sum(D_fw) - n_d)/2 = ({sum(D_fw)}-{n_d})/2")

print()
print("Parity Decomposition:")
print(f"  Odd D_fw:  {odd_elements}  count = {len(odd_elements)} = n_d")
print(f"  Even D_fw: {even_elements}       count = {len(even_elements)} = Im(H)")
print(f"  |D_fw| = n_d + Im(H) = {n_d} + 3 = 7 = Im(O)")

print()
print("Fundamental Identity (3 equivalent forms):")
print(f"  n_c = 2*n_d + Im(H) = {2*n_d} + 3 = {2*n_d+3}")
print(f"  n_c = 3*n_d - 1 = {3*n_d-1}")
print(f"  n_c + 1 = 3*n_d = {3*n_d}")

print()
print("Grassmannian:")
print(f"  pi-power(Gr(4,11)) = 14 = dim(C)+dim(H)+dim(O) = C*Im(O)")

print()
total = passed + failed
print(f"Tests: {passed}/{total} PASS, {failed}/{total} FAIL")
if failed == 0:
    print("All tests PASS.")
else:
    print("Some tests FAILED.")
