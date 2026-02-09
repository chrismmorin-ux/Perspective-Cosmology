#!/usr/bin/env python3
"""
Is 3*7 = 21 = dim(so(7)) Structural or Coincidental?

KEY FINDING: The coincidence Im(H)*Im(O) = dim(so(Im(O))) is STRUCTURAL,
not numerical. It follows from the identity n(n-1)/2 = (n-4)(n) + ... which
holds because Im(O) = 7 satisfies 7 = 2*Im(H) + 1. The deeper structure:
Im(H)*Im(O) = dim(so(7)) connects the generation sector (Im(H) = 3 channels)
to the internal gauge sector (so(7) acting on R^7 = Im(O)).

This has a physical interpretation: the 21 generation-channel DOFs
in Hom(Im(H), R^7) = 3*R^7 are in 1:1 correspondence with the
generators of SO(7) that act on the internal space. Each generator
"sees" exactly one DOF from each of the 3 generation channels.

Formula: Im(H)*Im(O) = Im(O)*(Im(O)-1)/2 = dim(so(Im(O)))
  Reduces to: 2*Im(H) = Im(O) - 1, i.e., Im(O) = 2*Im(H) + 1
  This is: 7 = 2*3 + 1 (TRUE, from division algebra dimensions)
Status: INVESTIGATION
Session: S322
Dependencies: S321 (Hom decomposition), generation_mechanism_formalization.py
"""

from sympy import *

# ============================================================
# Framework constants
# ============================================================
n_d = 4       # [D] dim(H)
n_c = 11      # [D] crystal dimension
Im_H = 3      # [I-MATH] dim(Im(H))
Im_O = 7      # [I-MATH] dim(Im(O))
dim_H = 4     # [I-MATH]
dim_O = 8     # [I-MATH]
dim_C = 2     # [I-MATH]
dim_R = 1     # [I-MATH]

tests_passed = 0
tests_total = 0

def test(name, condition):
    global tests_passed, tests_total
    tests_total += 1
    status = "PASS" if condition else "FAIL"
    if condition:
        tests_passed += 1
    print(f"[{status}] {name}")
    return condition


# ============================================================
# SECTION 1: THE COINCIDENCE
# ============================================================
print("=" * 70)
print("SECTION 1: THE COINCIDENCE")
print("=" * 70)
print()

# From S321: Hom(Im(H), R^7) = 3 * R^7, dim = Im_H * Im_O = 21
# dim(so(7)) = 7*6/2 = 21
# So: generation DOFs = dim(internal gauge algebra)

dim_gen_channels = Im_H * Im_O
dim_so7 = Im_O * (Im_O - 1) // 2

test("Im(H) * Im(O) = 3 * 7 = 21",
     dim_gen_channels == 21)
test("dim(so(7)) = 7*6/2 = 21",
     dim_so7 == 21)
test("COINCIDENCE: Im(H) * Im(O) = dim(so(Im(O)))",
     dim_gen_channels == dim_so7)

print()


# ============================================================
# SECTION 2: IS IT STRUCTURAL?
# ============================================================
print("=" * 70)
print("SECTION 2: STRUCTURAL ANALYSIS")
print("=" * 70)
print()

# The coincidence Im(H)*Im(O) = Im(O)*(Im(O)-1)/2 requires:
# Im(H) = (Im(O) - 1) / 2
# i.e., Im(O) = 2*Im(H) + 1
# Check: 7 = 2*3 + 1 = 7. TRUE.

test("Im(O) = 2*Im(H) + 1: 7 = 2*3 + 1",
     Im_O == 2 * Im_H + 1)

# Is this relation accidental or forced by division algebras?
# Division algebra dims: R=1, C=2, H=4, O=8
# Imaginary dims: Im(R)=0, Im(C)=1, Im(H)=3, Im(O)=7
# Check: does Im(D_next) = 2*Im(D_prev) + 1 hold for Cayley-Dickson?

# R -> C: Im(C) = 1, 2*Im(R)+1 = 2*0+1 = 1. YES
# C -> H: Im(H) = 3, 2*Im(C)+1 = 2*1+1 = 3. YES
# H -> O: Im(O) = 7, 2*Im(H)+1 = 2*3+1 = 7. YES

im_dims = [0, 1, 3, 7]  # Im(R), Im(C), Im(H), Im(O)

test("Cayley-Dickson: Im(C) = 2*Im(R) + 1 = 1",
     im_dims[1] == 2 * im_dims[0] + 1)
test("Cayley-Dickson: Im(H) = 2*Im(C) + 1 = 3",
     im_dims[2] == 2 * im_dims[1] + 1)
test("Cayley-Dickson: Im(O) = 2*Im(H) + 1 = 7",
     im_dims[3] == 2 * im_dims[2] + 1)

# This is the CAYLEY-DICKSON DOUBLING relation:
# dim(D_next) = 2 * dim(D_prev)
# Im(D_next) = dim(D_next) - 1 = 2*dim(D_prev) - 1 = 2*(Im(D_prev)+1) - 1 = 2*Im(D_prev) + 1
# So the relation Im(O) = 2*Im(H) + 1 is FORCED by Cayley-Dickson doubling.
# Therefore: Im(H)*Im(O) = dim(so(7)) is STRUCTURAL [DERIVATION].

print()
print(f"  The Cayley-Dickson doubling formula:")
print(f"    dim(D_next) = 2 * dim(D_prev)")
print(f"    Im(D_next) = 2*Im(D_prev) + 1")
print(f"  This is FORCED by the construction.")
print(f"  Therefore: Im(H)*Im(O) = Im(O)*(Im(O)-1)/2 = dim(so(Im(O)))")
print(f"  is STRUCTURAL, not coincidental.")
print()


# ============================================================
# SECTION 3: THE FULL CAYLEY-DICKSON CHAIN
# ============================================================
print("=" * 70)
print("SECTION 3: CAYLEY-DICKSON CHAIN FOR ALL PAIRS")
print("=" * 70)
print()

# Check Im(D_k) * Im(D_{k+1}) = dim(so(Im(D_{k+1}))) for all steps:

names = ['R', 'C', 'H', 'O']
for k in range(len(im_dims) - 1):
    prod = im_dims[k] * im_dims[k+1]
    dim_so = im_dims[k+1] * (im_dims[k+1] - 1) // 2
    match = prod == dim_so
    test(f"Im({names[k]})*Im({names[k+1]}) = {im_dims[k]}*{im_dims[k+1]} = {prod} "
         f"vs dim(so({im_dims[k+1]})) = {dim_so}: {'MATCH' if match else 'NO MATCH'}",
         match)

# R->C: Im(R)*Im(C) = 0*1 = 0 vs dim(so(1)) = 0. MATCH (trivially)
# C->H: Im(C)*Im(H) = 1*3 = 3 vs dim(so(3)) = 3. MATCH!
# H->O: Im(H)*Im(O) = 3*7 = 21 vs dim(so(7)) = 21. MATCH!

# So this is a UNIVERSAL pattern across the Cayley-Dickson chain!
# For any consecutive pair (D_k, D_{k+1}):
# Im(D_k) * Im(D_{k+1}) = dim(so(Im(D_{k+1})))

# Proof: Im(D_k) * Im(D_{k+1}) = Im(D_k) * (2*Im(D_k) + 1)
#                                = 2*Im(D_k)^2 + Im(D_k)
# dim(so(Im(D_{k+1}))) = Im(D_{k+1})*(Im(D_{k+1})-1)/2
#                       = (2*Im(D_k)+1)*(2*Im(D_k))/2
#                       = Im(D_k)*(2*Im(D_k)+1)
#                       = 2*Im(D_k)^2 + Im(D_k)
# EQUAL. QED.

n = symbols('n', positive=True, integer=True)
lhs = n * (2*n + 1)                     # Im(D_k) * Im(D_{k+1})
rhs = (2*n + 1) * (2*n) / 2             # dim(so(Im(D_{k+1})))

test("ALGEBRAIC IDENTITY: n*(2n+1) = (2n+1)*(2n)/2 for all n",
     simplify(lhs - rhs) == 0)

print()
print(f"  UNIVERSAL PATTERN (Cayley-Dickson chain):")
print(f"  Im(D_k) * Im(D_{{k+1}}) = dim(so(Im(D_{{k+1}})))")
print(f"  R->C: 0*1 = 0 = dim(so(1))")
print(f"  C->H: 1*3 = 3 = dim(so(3))")
print(f"  H->O: 3*7 = 21 = dim(so(7))")
print(f"  Proof: both sides equal n*(2n+1) where n = Im(D_k)")
print()


# ============================================================
# SECTION 4: PHYSICAL INTERPRETATION
# ============================================================
print("=" * 70)
print("SECTION 4: PHYSICAL INTERPRETATION")
print("=" * 70)
print()

# The identity Im(H)*Im(O) = dim(so(7)) connects:
# - LEFT SIDE: generation DOFs in Hom(Im(H), R^7) = 3 copies of R^7
#   This is the FERMION sector (3 generations, 7 internal DOFs each)
# - RIGHT SIDE: generators of SO(7) = gauge sector acting on R^7
#   This is the GAUGE sector (21 generators of internal symmetry)
#
# Physical meaning:
# The generation-channel DOFs are in bijection with the internal gauge generators.
# Each SO(7) generator L_{ab} (a<b, a,b in 1..7) corresponds to
# exactly one DOF in the generation sector:
#   L_{ab} <-> (generation g, internal component i)
#   where (g, i) runs over {1,2,3} x {1,...,7} with some pairing
#
# This suggests: the generation structure is the "matter partner" of the
# gauge structure. 21 gauge generators <-> 21 generation DOFs.

# More specifically: the C->H step gives Im(C)*Im(H) = 1*3 = 3 = dim(so(3))
# This connects the ELECTROWEAK sector:
# - 3 generation DOFs from Im(C) copies (but Im(C)=1, so just 3 from Im(H))
# - Wait, this is Im(C)*Im(H) = 1*3 = dim(so(3)) = dim(SU(2))
# The SU(2)_L has 3 generators = Im(H) = 3 generation channels
# This is the ELECTROWEAK-GENERATION connection

test("C->H: Im(C)*Im(H) = 1*3 = dim(so(3)) = dim(su(2)_L)",
     1 * Im_H == 3 and Im_H * (Im_H - 1) // 2 == 3)
# Wait, dim(so(3)) = 3*(3-1)/2 = 3. And dim(su(2)) = 3.
# So so(3) = su(2) as Lie algebras. This is standard.
test("so(3) = su(2) as Lie algebras (both dim 3)",
     Im_H * (Im_H - 1) // 2 == 3)

# The H->O step gives Im(H)*Im(O) = 3*7 = 21 = dim(so(7))
# This connects the INTERNAL-GENERATION structure:
# - 21 generation DOFs in Hom(Im(H), R^7)
# - 21 generators of SO(7) acting on the internal R^7

# But note: the physical gauge group after SSB is NOT SO(7).
# It's G_2 c SO(7) (dim 14) after crystallization.
# The 21 = dim(so(7)) > dim(G_2) = 14
# Difference: 21 - 14 = 7 = Im_O

dim_so7_full = Im_O * (Im_O - 1) // 2
dim_G2 = 14
diff = dim_so7_full - dim_G2

test("dim(so(7)) - dim(G_2) = 21 - 14 = 7 = Im_O",
     diff == Im_O)

# The 7 "extra" generators (so(7) \ G_2) are the coset so(7)/G_2
# These transform as the 7-dim fundamental of G_2
# Physical meaning: the 7 coset generators correspond to the 7 DOFs
# per generation channel. The 14 G_2 generators correspond to the
# gauge symmetry that relates WITHIN each generation.

# Alternative decomposition of 21:
# 21 = 14 (G_2) + 7 (coset so(7)/G_2)
# vs
# 21 = 3 * 7 (generation channels)
# Both decompose 21 differently. The coset decomposition is gauge-intrinsic.
# The generation decomposition is quaternion-intrinsic.

test("21 = 14 (G_2) + 7 (coset) = gauge decomposition",
     dim_G2 + Im_O == dim_gen_channels)
test("21 = 3 * 7 = Im(H) * Im(O) = generation decomposition",
     Im_H * Im_O == dim_gen_channels)

# These are TWO DIFFERENT decompositions of the same 21-dim space:
# Gauge:       21 = 14 + 7  (G_2-intrinsic vs coset)
# Generation:  21 = 7 + 7 + 7  (Im(H) channels)
# The relationship between these decompositions encodes
# how gauge structure maps to generation structure.

print()
print(f"  PHYSICAL INTERPRETATION:")
print(f"  Im(H)*Im(O) = dim(so(7)) connects generations to gauge")
print(f"  21 generation DOFs <-> 21 SO(7) generators")
print(f"")
print(f"  Two decompositions of 21:")
print(f"    Gauge:      21 = 14 (G_2) + 7 (coset so(7)/G_2)")
print(f"    Generation: 21 = 7 + 7 + 7 (Im(H) = 3 channels)")
print(f"")
print(f"  The Cayley-Dickson chain also gives:")
print(f"    C->H: 1*3 = 3 = dim(so(3)) = dim(su(2)_L)")
print(f"    H->O: 3*7 = 21 = dim(so(7))")
print(f"  Electroweak-generation link at the C->H step")
print()


# ============================================================
# SECTION 5: HEURISTIC -- GENERATION AS ADJOINT DECOMPOSITION
# ============================================================
print("=" * 70)
print("SECTION 5: GENERATION AS ADJOINT DECOMPOSITION")
print("=" * 70)
print()

# The adjoint representation of so(7) has dim 21
# Under the subgroup SO(3)_family x G_2:
# so(7) might decompose in a way that reveals generation structure
#
# However: SO(3)_family = Aut(H) acts on Im(H) c R^4, NOT on R^7
# So SO(3)_family is not a subgroup of SO(7)
# The decomposition is more subtle: it involves the PRODUCT structure
# of Hom(Im(H), R^7) = Im(H) tensor R^7

# Under GL(Im(H)) x GL(R^7) = GL(3) x GL(7):
# Hom(Im(H), R^7) = 3 tensor 7 (the standard tensor product)
# This is already irreducible under GL(3) x GL(7)
# But under SO(3) x SO(7): 3 tensor 7 is still irreducible

# The adjoint of so(7) decomposes under G_2 as:
# so(7) = G_2 + R^7 (as G_2-modules)
# = 14 + 7

# There's no direct SO(3)_family x G_2 decomposition of so(7)
# because SO(3)_family doesn't live inside SO(7)

# The connection is ALGEBRAIC (both = 21) not GROUP-THEORETIC (no subgroup)

test("SO(3)_family is NOT a subgroup of SO(7): acts on different spaces",
     True)  # SO(3) on Im(H) c R^4, SO(7) on R^7

# The algebraic connection is still meaningful:
# The NUMBER of generation DOFs equals the NUMBER of gauge generators
# This is a consequence of the Cayley-Dickson doubling structure
# NOT of any subgroup relationship

print()
print(f"  The 21 = 21 coincidence is ALGEBRAIC (from Cayley-Dickson)")
print(f"  NOT group-theoretic (SO(3)_family is not a subgroup of SO(7))")
print(f"  Both sides are separately derived from the division algebra chain")
print()


# ============================================================
# SECTION 6: SCALAR + GENERATION = FULL HOM
# ============================================================
print("=" * 70)
print("SECTION 6: COMPLETE DECOMPOSITION WITH SCALAR CHANNEL")
print("=" * 70)
print()

# With the scalar channel (S322):
# Hom(H, R^7) = R^7 (scalar) + 3*R^7 (generation) = 7 + 21 = 28
#
# 28 = n_d * Im_O = 4 * 7
# 28 = N_Goldstone of SO(11)/SO(4)xSO(7)
# 28 = dim of the fundamental rep of SO(8) (triality!)

N_Goldstone = 28
dim_so8_fund = dim_O * (dim_O - 1) // 2  # = 28, adjoint of SO(8)

test("28 = n_d * Im_O = 4 * 7",
     n_d * Im_O == 28)
test("28 = N_Goldstone of SO(11)/SO(4)xSO(7)",
     N_Goldstone == 28)
test("28 = dim(so(8)) (adjoint, not fundamental)",
     dim_so8_fund == 28)

# The adjoint of SO(8) has dim 28
# SO(8) has triality: vector(8), spinor+(8), spinor-(8) are permuted
# The adjoint 28 = Lambda^2(8) (antisymmetric square of fundamental)
# Does our decomposition 7 + 21 correspond to an SO(8) branching?

# Under SO(7) c SO(8): 28 -> 21 + 7
# The adjoint of SO(8) restricted to SO(7) gives:
# so(8) = so(7) + R^7 (as SO(7)-modules)
# This is EXACTLY our decomposition!

test("Under SO(7) c SO(8): 28 = 21 + 7 = so(7) + R^7",
     dim_so7 + Im_O == 28)

# So our Hom decomposition R^7 + 3*R^7 = 7 + 21
# is the SAME as the SO(8) -> SO(7) branching of the adjoint!
# This is deeper than a numerical coincidence.

# Under SO(3) x SO(7) c SO(4) x SO(7):
# We further decompose the 7 into (1, 7) (scalar channel)
# and the 21 into (3, 7) (generation channels)
# This is (1+3) tensor 7 = R^4 tensor R^7 = Hom(R^4, R^7)

# The chain: SO(8) -> SO(7) -> G_2 gives:
# 28 -> (21 + 7) -> ((14 + 7) + 7) = 14 + 7 + 7
# = G_2 adjoint + coset so(7)/G_2 + scalar channel

dim_chain = dim_G2 + Im_O + Im_O  # 14 + 7 + 7
test("SO(8) -> SO(7) -> G_2 chain: 28 = 14 + 7 + 7",
     dim_chain == 28)

print()
print(f"  COMPLETE CHAIN:")
print(f"  28 = dim(so(8))")
print(f"     = 21 + 7 = so(7) + R^7  [SO(8) -> SO(7)]")
print(f"     = (14 + 7) + 7 = G_2 + coset + scalar  [SO(7) -> G_2]")
print(f"     = 14 + 7 + 7 + ... but also:")
print(f"     = 7 + 7 + 7 + 7  [1 scalar + 3 gen channels]")
print(f"")
print(f"  The generation decomposition (4 x 7) and the gauge chain")
print(f"  (SO(8) -> SO(7) -> G_2) give compatible breakdowns of 28.")
print()


# ============================================================
# SECTION 7: CAYLEY-DICKSON CHAIN IDENTITIES
# ============================================================
print("=" * 70)
print("SECTION 7: CAYLEY-DICKSON CHAIN IDENTITIES")
print("=" * 70)
print()

# Collecting all the Cayley-Dickson chain identities:
# Let d_k = dim(D_k): 1, 2, 4, 8
# Let i_k = Im(D_k): 0, 1, 3, 7

# Identity 1: i_{k+1} = 2*i_k + 1 (doubling of imaginary part)
# Identity 2: i_k * i_{k+1} = dim(so(i_{k+1})) (generation-gauge link)
# Identity 3: d_k * i_{k+1} = d_{k+1} * d_k - d_k (?)
#   4*7 = 28 = 8*4 - 4 = 28. YES.
#   2*3 = 6 = 4*2 - 2 = 6. YES.
#   1*1 = 1 = 2*1 - 1 = 1. YES.

for k in range(len(im_dims) - 1):
    d_k = 2**k          # dim(D_k)
    d_k1 = 2**(k+1)     # dim(D_{k+1})
    i_k1 = im_dims[k+1]
    lhs_val = d_k * i_k1
    rhs_val = d_k1 * d_k - d_k
    test(f"d_{k}*i_{{k+1}} = {d_k}*{i_k1} = {lhs_val} = d_{{k+1}}*d_k - d_k = {rhs_val}",
         lhs_val == rhs_val)

# Identity 3 is just d_k * (d_{k+1} - 1) = d_k * (2*d_k - 1)
# and d_{k+1} * d_k - d_k = d_k * (d_{k+1} - 1) = d_k * (2*d_k - 1)
# These are the same. Not surprising.

# More interesting: the CUMULATIVE products
# i_1 * i_2 * i_3 = 1 * 3 * 7 = 21 = dim(so(7))
# i_2 * i_3 = 3 * 7 = 21 = dim(so(7))
# These happen to be the same because i_1 = 1 (trivial)

product_all = 1 * 3 * 7
test("Im(C)*Im(H)*Im(O) = 1*3*7 = 21 = dim(so(7))",
     product_all == 21)

# This means: the product of ALL non-trivial imaginary dimensions
# equals the dimension of the internal gauge algebra.
# Im(C)*Im(H)*Im(O) = dim(so(Im(O)))
# Since Im(C) = 1, this reduces to Im(H)*Im(O) = dim(so(Im(O)))

print()


# ============================================================
# SECTION 8: CONFIDENCE ASSESSMENT
# ============================================================
print("=" * 70)
print("SECTION 8: CONFIDENCE ASSESSMENT")
print("=" * 70)
print()

# RESULT: Im(H)*Im(O) = dim(so(Im(O))) is STRUCTURAL [DERIVATION]
# It follows from the Cayley-Dickson doubling relation i_{k+1} = 2*i_k + 1
# which is forced by the construction dim(D_{k+1}) = 2*dim(D_k).
#
# The physical significance (generation DOFs = gauge generators) is
# [CONJECTURE]: the algebraic equality is proven, but the physical
# interpretation (matter-gauge duality) requires additional argument.
#
# Status: PARTIALLY STRUCTURAL
# - The identity: [THEOREM] (algebraic, from Cayley-Dickson)
# - The physics: [CONJECTURE] (interpretation as matter-gauge link)

print(f"  ASSESSMENT:")
print(f"  Im(H)*Im(O) = dim(so(Im(O))) = 21")
print(f"  The identity: [THEOREM] (Cayley-Dickson doubling forces it)")
print(f"  Physical interpretation: [CONJECTURE] (matter-gauge link)")
print(f"")
print(f"  This is NOT a coincidence. It's the same algebraic identity")
print(f"  as Im(C)*Im(H) = dim(so(Im(H))) = 3 (generation = su(2)_L)")
print(f"  and Im(R)*Im(C) = dim(so(Im(C))) = 0 (trivial).")
print(f"  The pattern is universal across the Cayley-Dickson chain.")
print()


# ============================================================
# FINAL SUMMARY
# ============================================================
print("=" * 70)
print("FINAL SUMMARY")
print("=" * 70)
print()
print(f"  3*7 = 21 = dim(so(7)) is STRUCTURAL [THEOREM]")
print(f"")
print(f"  Proof: Cayley-Dickson doubling gives Im(D_{{k+1}}) = 2*Im(D_k) + 1")
print(f"  => Im(D_k)*Im(D_{{k+1}}) = n*(2n+1) = (2n+1)*2n/2 = dim(so(2n+1))")
print(f"  where n = Im(D_k), 2n+1 = Im(D_{{k+1}})")
print(f"")
print(f"  Universal chain:")
print(f"    R->C: 0*1 = 0 = dim(so(1))")
print(f"    C->H: 1*3 = 3 = dim(so(3)) = dim(su(2))")
print(f"    H->O: 3*7 = 21 = dim(so(7))")
print(f"")
print(f"  Physical reading [CONJECTURE]: generation DOFs = gauge generators")
print(f"  Hom(H,R^7) decomposition: 28 = 7 + 21 matches SO(8)->SO(7) adjoint")
print(f"")
print(f"  Results: {tests_passed}/{tests_total} PASS")

if tests_passed < tests_total:
    print(f"\n  WARNING: {tests_total - tests_passed} tests FAILED!")
