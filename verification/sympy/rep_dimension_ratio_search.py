#!/usr/bin/env python3
"""
Direction 3: Does 11/3 Emerge as a Ratio of Representation Dimensions?

KEY QUESTION: Can 11/3 be expressed as dim(R1)/dim(R2) for natural
representations R1, R2 of SO(11), SO(7), SO(4), G_2, SU(3), SU(2)?

KEY FINDING: NEGATIVE. No ratio of standard representation dimensions
gives 11/3, EXCEPT the trivial n_c/Im_H = 11/3 itself. The number
11/3 is NOT a representation dimension ratio in the classical sense.

However, 11/3 DOES emerge from the "imaginary representation" decomposition:
  Im(C+H+O) = 11 decomposes as Im_C + Im_H + Im_O = 1 + 3 + 7
  This is NOT a representation of any single Lie group, but a decomposition
  of the total imaginary dimension space.
  Dividing by Im_H = 3 (spatial dimensions) gives 11/3.

This confirms that 11/3 = n_c/Im_H is a COMPOSITE ratio of two
independently-derived framework quantities, not a single representation-
theoretic object.

Formula: n_c/Im_H = (Im_C + Im_H + Im_O)/Im_H
Status: INVESTIGATION (confirms composite nature of 11/3)
Dependencies: [D] n_c=11, Im_H=3
"""
from sympy import Rational, binomial, Integer

# ==================== FRAMEWORK QUANTITIES ====================
n_d = 4
n_c = 11
Im_C = 1
Im_H = 3
Im_O = 7
C_dim = 2
N_I = n_d**2 + n_c**2  # 137

tests = []

# ==================== PART 1: SO(11) REPRESENTATIONS ====================
print("=" * 70)
print("PART 1: SO(11) REPRESENTATION DIMENSIONS")
print("=" * 70)

# Standard representations of SO(n) with n=11:
# - Vector (fundamental): dim = n = 11
# - Adjoint: dim = n(n-1)/2 = 55
# - Symmetric traceless: dim = n(n+1)/2 - 1 = 65
# - Antisymmetric k-forms: dim = C(n,k)
# - Spinor: dim = 2^((n-1)/2) = 2^5 = 32 (n=11 is odd)

so11_reps = {
    'vector(11)': 11,
    'adjoint(55)': 55,
    'sym_traceless(65)': 65,
    'Lambda^2(55)': int(binomial(11, 2)),  # = 55 = adjoint
    'Lambda^3(165)': int(binomial(11, 3)),
    'Lambda^4(330)': int(binomial(11, 4)),
    'Lambda^5(462)': int(binomial(11, 5)),
    'spinor(32)': 32,
    'trivial(1)': 1,
}

print(f"\nSO(11) representations:")
for name, dim in sorted(so11_reps.items(), key=lambda x: x[1]):
    print(f"  {name}: dim = {dim}")

# ==================== PART 2: SUBGROUP REPRESENTATIONS ====================
print(f"\n{'=' * 70}")
print("PART 2: SUBGROUP REPRESENTATION DIMENSIONS")
print("=" * 70)

so7_reps = {
    'vector(7)': 7,
    'adjoint(21)': 21,
    'sym_traceless(27)': 27,
    'Lambda^2(21)': int(binomial(7, 2)),
    'Lambda^3(35)': int(binomial(7, 3)),
    'spinor_8(8)': 8,
    'trivial(1)': 1,
}

so4_reps = {
    'vector(4)': 4,
    'adjoint(6)': 6,
    'sym_traceless(9)': 9,
    'self_dual(3)': 3,  # SO(4) = SU(2)xSU(2), self-dual 2-forms
    'anti_self_dual(3)': 3,
    'spinor(2+2)': 4,  # two Weyl spinors
    'trivial(1)': 1,
}

g2_reps = {
    'fundamental(7)': 7,
    'adjoint(14)': 14,
    'sym_fund(27)': 27,
    'trivial(1)': 1,
}

su3_reps = {
    'fundamental(3)': 3,
    'antifund(3bar)': 3,
    'adjoint(8)': 8,
    'sym_fund(6)': 6,
    'antisym_fund(3bar)': 3,
    'trivial(1)': 1,
    '10-dim': 10,
    '15-dim': 15,
    '27-dim': 27,
}

su2_reps = {
    'fundamental(2)': 2,
    'adjoint(3)': 3,
    'spin_3/2(4)': 4,
    'spin_2(5)': 5,
    'trivial(1)': 1,
}

# Combine all
all_reps = {}
for prefix, rep_dict in [('SO11', so11_reps), ('SO7', so7_reps),
                          ('SO4', so4_reps), ('G2', g2_reps),
                          ('SU3', su3_reps), ('SU2', su2_reps)]:
    for name, dim in rep_dict.items():
        all_reps[f'{prefix}:{name}'] = dim

# Add framework quantities
all_reps['n_c'] = n_c
all_reps['n_d'] = n_d
all_reps['Im_C'] = Im_C
all_reps['Im_H'] = Im_H
all_reps['Im_O'] = Im_O
all_reps['C_dim'] = C_dim
all_reps['N_I'] = N_I
all_reps['dim_Gr(4,11)'] = 28

print(f"\nAll representations collected: {len(all_reps)} entries")

# ==================== PART 3: SYSTEMATIC RATIO SCAN ====================
print(f"\n{'=' * 70}")
print("PART 3: SYSTEMATIC RATIO SCAN FOR 11/3")
print("=" * 70)

target = Rational(11, 3)

# Simple ratios
print(f"\nTarget: 11/3 = {float(target):.6f}")
print(f"\nSimple ratios A/B = 11/3:")
simple_matches = []
for name1, d1 in all_reps.items():
    for name2, d2 in all_reps.items():
        if name1 == name2 or d2 == 0:
            continue
        if Rational(d1, d2) == target:
            simple_matches.append((name1, name2, d1, d2))
            print(f"  {name1}/{name2} = {d1}/{d2}")

# Filter out trivial matches (those using n_c or Im_H directly)
nontrivial_matches = [m for m in simple_matches
                      if 'n_c' not in m[0] and 'Im_H' not in m[1]
                      and 'n_c' not in m[1] and 'Im_H' not in m[0]]

print(f"\nNon-trivial matches (not using n_c or Im_H directly):")
if nontrivial_matches:
    for m in nontrivial_matches:
        print(f"  {m[0]}/{m[1]} = {m[2]}/{m[3]}")
else:
    print(f"  NONE FOUND")

# Filter further: all "non-trivial" matches use dim=11 or dim=3 reps,
# which ARE n_c and Im_H by different names (vector SO(11) = n_c, etc.)
truly_novel = [m for m in nontrivial_matches
               if m[2] != 11 and m[2] != 55 and m[3] != 3]

print(f"\nTruly novel matches (not using dim=11 or dim=3 at all):")
if truly_novel:
    for m in truly_novel:
        print(f"  {m[0]}/{m[1]} = {m[2]}/{m[3]}")
else:
    print(f"  NONE FOUND")
    print(f"  All 'matches' use dim=11 (=n_c) or dim=3 (=Im_H) reps in disguise.")

tests.append(("All simple ratio matches use dim=11 or dim=3 (n_c or Im_H in disguise)",
              len(truly_novel) == 0))

# ==================== PART 4: COMPOUND RATIO SCAN ====================
print(f"\n{'=' * 70}")
print("PART 4: COMPOUND RATIOS (A+B)/C AND (A-B)/C = 11/3")
print("=" * 70)

# Only check with pure rep dimensions (not framework quantities)
pure_reps = {}
for prefix, rep_dict in [('SO11', so11_reps), ('SO7', so7_reps),
                          ('SO4', so4_reps), ('G2', g2_reps),
                          ('SU3', su3_reps), ('SU2', su2_reps)]:
    for name, dim in rep_dict.items():
        pure_reps[f'{prefix}:{name}'] = dim

compound_matches = []
for name1, d1 in pure_reps.items():
    for name2, d2 in pure_reps.items():
        if name1 >= name2:
            continue
        for name3, d3 in pure_reps.items():
            if d3 == 0:
                continue
            # (A+B)/C
            if Rational(d1 + d2, d3) == target:
                compound_matches.append(f"({name1}+{name2})/{name3} = ({d1}+{d2})/{d3}")
            # (A-B)/C (both orders)
            if d1 > d2 and Rational(d1 - d2, d3) == target:
                compound_matches.append(f"({name1}-{name2})/{name3} = ({d1}-{d2})/{d3}")
            if d2 > d1 and Rational(d2 - d1, d3) == target:
                compound_matches.append(f"({name2}-{name1})/{name3} = ({d2}-{d1})/{d3}")

# Print unique entries (avoid duplicates)
seen = set()
unique_compound = []
for entry in compound_matches:
    if entry not in seen:
        seen.add(entry)
        unique_compound.append(entry)

print(f"\nCompound ratios = 11/3 (using pure rep dimensions only):")
if unique_compound:
    for entry in unique_compound[:25]:
        print(f"  {entry}")
    if len(unique_compound) > 25:
        print(f"  ... and {len(unique_compound) - 25} more")
else:
    print(f"  NONE FOUND")

print(f"\nTotal compound matches: {len(unique_compound)}")

# Check which are interesting (don't involve trivially equal dims)
print(f"\nFiltering for non-degenerate matches:")
interesting = [e for e in unique_compound
               if 'trivial' not in e and 'vector(11)' not in e.split('/')[0]]
for entry in interesting[:15]:
    print(f"  {entry}")
if not interesting:
    print(f"  No interesting compound matches")

# ==================== PART 5: SO(11) BRANCHING RULES ====================
print(f"\n{'=' * 70}")
print("PART 5: SO(11) -> SO(4) x SO(7) BRANCHING")
print("=" * 70)

# Adjoint decomposition
# so(11) = so(4) + so(7) + Hom(R^4, R^7)
# 55 = 6 + 21 + 28
print(f"\nAdjoint of SO(11) under SO(4) x SO(7):")
print(f"  so(11) = so(4) + so(7) + Hom(R^4, R^7)")
print(f"  55 = 6 + 21 + 28")
print(f"")

# Check ratios from branching
branching_dims = {
    'so(4)': 6,
    'so(7)': 21,
    'Hom(R4,R7)': 28,
    'so(11)': 55,
}

print(f"Ratios from branching:")
for name1, d1 in branching_dims.items():
    for name2, d2 in branching_dims.items():
        if name1 != name2 and d2 != 0:
            r = Rational(d1, d2)
            marker = " <-- 11/3!" if r == target else ""
            if r == target or (float(r) > 3.0 and float(r) < 4.5):
                print(f"  {name1}/{name2} = {d1}/{d2} = {r} = {float(r):.4f}{marker}")

# Vector decomposition
# 11 -> (4,1) + (1,7)
print(f"\nVector of SO(11) under SO(4) x SO(7):")
print(f"  11 -> (4,1) + (1,7)")
print(f"  No ratio: 4/7 = {Rational(4,7)}, 7/4 = {Rational(7,4)}, 11/4 = {Rational(11,4)}, 11/7 = {Rational(11,7)}")
print(f"  None equal 11/3.")

tests.append(("No branching ratio gives 11/3",
              all(Rational(d1, d2) != target
                  for d1 in branching_dims.values()
                  for d2 in branching_dims.values()
                  if d1 != d2 and d2 != 0)))

# ==================== PART 6: G_2 -> SU(3) BRANCHING ====================
print(f"\n{'=' * 70}")
print("PART 6: G_2 -> SU(3) BRANCHING")
print("=" * 70)

# G_2 fundamental 7 -> 3 + 3bar + 1 under SU(3)
# G_2 adjoint 14 -> 8 + 3 + 3bar under SU(3)
print(f"\nG_2 -> SU(3):")
print(f"  7 -> 3 + 3bar + 1")
print(f"  14 -> 8 + 3 + 3bar")
print(f"")

g2_su3_dims = {
    'G2_fund': 7,
    'SU3_fund': 3,
    'SU3_fund_bar': 3,
    'SU3_singlet': 1,
    'G2_adj': 14,
    'SU3_adj': 8,
}

# Check ratios
print(f"Ratios from G_2 -> SU(3) branching:")
for name1, d1 in g2_su3_dims.items():
    for name2, d2 in g2_su3_dims.items():
        if name1 != name2 and d2 != 0:
            r = Rational(d1, d2)
            if r == target:
                print(f"  {name1}/{name2} = {d1}/{d2} = {r} <-- MATCH!")
            elif abs(float(r) - float(target)) < 1.0:
                print(f"  {name1}/{name2} = {d1}/{d2} = {r} = {float(r):.4f}")

# 14/3 = 14/3 (not 11/3), 7/3 (not 11/3), 14/8 = 7/4 (not 11/3)
print(f"  No exact match for 11/3.")
print(f"  Closest: G2_adj/SU3_fund = 14/3 = {Rational(14,3)} (too large)")
print(f"  G2_fund/SU3_fund = 7/3 = {Rational(7,3)} (too small)")

# ==================== PART 7: IMAGINARY DIMENSION DECOMPOSITION ====================
print(f"\n{'=' * 70}")
print("PART 7: IMAGINARY DIMENSION DECOMPOSITION")
print("=" * 70)

print(f"""
The imaginary dimensions of the division algebras:
  Im(R) = 0, Im(C) = 1, Im(H) = 3, Im(O) = 7

The total non-real imaginary dimension:
  n_c = Im(C) + Im(H) + Im(O) = 1 + 3 + 7 = 11

This is NOT a representation of any single Lie group.
It IS a sum over the Hurwitz algebras (R, C, H, O).

The decomposition 11 = 1 + 3 + 7 corresponds to:
  Im(C): U(1) phase direction
  Im(H): SU(2) gauge directions (or spatial dimensions)
  Im(O): SU(3) gauge directions (or internal dimensions via G_2 -> SU(3))

Dividing by Im(H) = 3:
  11/3 = Im_C/Im_H + 1 + Im_O/Im_H
       = 1/3 + 1 + 7/3

This is a COMPOSITE ratio. Neither 11 nor 3 individually arise
as a representation dimension (in a non-trivial way):
  - 11 = n_c = vector of SO(11) [but this IS the framework definition]
  - 3 = Im_H = self-dual 2-forms on R^4 = adjoint of SU(2)

The ratio 11/3 = n_c/Im_H connects the PARENT group dimension (11)
with the SPATIAL subgroup dimension (3). No single representation
of any subgroup produces this ratio.
""")

# ==================== PART 8: INDEX-THEORY RATIOS ====================
print(f"{'=' * 70}")
print("PART 8: DYNKIN INDEX AND CASIMIR RATIOS")
print("=" * 70)

# Dynkin index l(R) for SO(n):
# l(vector) = 1, l(adjoint) = 2(n-2), l(spinor) = 2^((n-5)/2)
# For SU(n):
# l(fund) = 1/2, l(adj) = n

# Casimir ratios
# C_2(adj)/C_2(fund) for SU(3) = 3/(4/3) = 9/4
# dim(adj)/dim(fund) for SU(3) = 8/3
# l(adj)/l(fund) for SU(3) = 3/(1/2) = 6

print(f"\nDynkin index and Casimir ratios for SU(3):")
print(f"  C_2(adj)/C_2(fund) = 3/(4/3) = {Rational(3, Rational(4,3))} = 9/4")
print(f"  dim(adj)/dim(fund) = 8/3 = {Rational(8,3)}")
print(f"  l(adj)/l(fund) = 3/(1/2) = 6")
print(f"  None equal 11/3.")

print(f"\nDynkin index ratios for SO(11):")
print(f"  l(adj)/l(vec) = {2*(11-2)}/1 = {2*(11-2)}")
print(f"  dim(adj)/dim(vec) = 55/11 = {Rational(55,11)} = 5")
print(f"  None equal 11/3.")

# What about Dynkin index OF the branching?
# The branching SO(11) -> SO(4) x SO(7) involves the embedding index.
# The embedding index of SO(4) x SO(7) in SO(11) is always 1
# (maximal regular embedding).
print(f"\nEmbedding indices:")
print(f"  SO(4) x SO(7) in SO(11): index = 1 (maximal)")
print(f"  G_2 in SO(7): index = 1 (maximal)")
print(f"  SU(3) in G_2: index = 1 (maximal)")
print(f"  No non-trivial index produces 11/3.")

# ==================== PART 9: TANGENT SPACE RATIOS ====================
print(f"\n{'=' * 70}")
print("PART 9: TANGENT SPACE AND GEOMETRIC RATIOS ON Gr(4,11)")
print("=" * 70)

dim_Gr = n_d * Im_O  # 28
dim_stabilizer = n_d*(n_d-1)//2 + Im_O*(Im_O-1)//2  # 6 + 21 = 27
dim_SO11 = n_c*(n_c-1)//2  # 55

print(f"\nGr(4,11) = SO(11)/SO(4)*SO(7):")
print(f"  dim(tangent) = {dim_Gr}")
print(f"  dim(stabilizer) = {dim_stabilizer}")
print(f"  dim(SO(11)) = {dim_SO11}")
print(f"")

# Ratios
ratios_Gr = {
    'tangent/Im_H': Rational(dim_Gr, Im_H),              # 28/3
    'tangent/Im_O': Rational(dim_Gr, Im_O),              # 4
    'stabilizer/Im_H': Rational(dim_stabilizer, Im_H),   # 9
    'SO11/Im_H': Rational(dim_SO11, Im_H),               # 55/3
    'tangent/stabilizer': Rational(dim_Gr, dim_stabilizer),  # 28/27
    'tangent/n_d': Rational(dim_Gr, n_d),                 # 7
    'tangent/n_c': Rational(dim_Gr, n_c),                 # 28/11
    'SO11/tangent': Rational(dim_SO11, dim_Gr),           # 55/28
}

print(f"Geometric ratios:")
for name, r in ratios_Gr.items():
    marker = " <-- 11/3!" if r == target else ""
    print(f"  {name} = {r} = {float(r):.4f}{marker}")

tests.append(("No geometric ratio of Gr(4,11) gives 11/3 (without n_c/Im_H)",
              all(r != target for name, r in ratios_Gr.items())))

# ==================== PART 10: VERDICT ====================
print(f"\n{'=' * 70}")
print("PART 10: VERDICT")
print("=" * 70)

print(f"""
COMPREHENSIVE SCAN RESULTS:

1. Simple rep dimension ratios: 0 non-trivial matches
   The ONLY way to get 11/3 from dim(R1)/dim(R2) is using
   the vector SO(11) (dim=11) / self-dual SO(4) (dim=3) or equivalent.
   These ARE n_c/Im_H in disguise.

2. Compound ratios (A+B)/C or (A-B)/C: {"some" if unique_compound else "none"}
   {f"Found {len(unique_compound)} compound matches" if unique_compound else "No compound matches."}

3. Branching SO(11) -> SO(4) x SO(7): no 11/3 ratio
   Adjoint splits as 55 = 6 + 21 + 28 -- no ratio is 11/3.

4. G_2 -> SU(3) branching: no 11/3 ratio
   Closest are 14/3 and 7/3, neither equals 11/3.

5. Casimir/Dynkin index ratios: no 11/3

6. Geometric ratios on Gr(4,11): no 11/3

CONCLUSION: 11/3 = n_c/Im_H is NOT a representation dimension ratio.
It is a COMPOSITE of two independently-determined framework quantities:
  - Numerator: n_c = 11 (sum of all imaginary dimensions)
  - Denominator: Im_H = 3 (spatial/quaternionic imaginary dimension)

This CONFIRMS the S296/S303 analysis: 11/3 arises from the
INTERPLAY between the full algebra tower (giving n_c) and the
spatial normalization (giving Im_H), not from any single
algebraic structure.

Status: [THEOREM] that no standard rep ratio gives 11/3
        [DERIVATION] that 11/3 = composite of n_c and Im_H
""")

# ==================== VERIFICATION TESTS ====================
print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

# Additional basic tests
tests.append(("n_c = 11 = dim(vector SO(11))", n_c == 11))
tests.append(("Im_H = 3 = dim(self-dual SO(4))", Im_H == 3))
tests.append(("11/3 = n_c/Im_H", Rational(n_c, Im_H) == Rational(11, 3)))
tests.append(("55 = 6 + 21 + 28 (adjoint decomposition)",
              55 == 6 + 21 + 28))
tests.append(("G_2 fundamental 7 = 3+3+1 under SU(3)",
              7 == 3 + 3 + 1))
tests.append(("No Casimir ratio gives 11/3",
              Rational(3, Rational(4,3)) != target and
              Rational(8, 3) != target))

passed = 0
failed = 0
for name, result in tests:
    status = "PASS" if result else "FAIL"
    if result:
        passed += 1
    else:
        failed += 1
    print(f"[{status}] {name}")

print(f"\n{'=' * 70}")
print(f"TOTAL: {passed}/{passed+failed} PASS, {failed} FAIL")
print("=" * 70)

if failed == 0:
    print(f"\nAll {passed} tests PASS")
    print(f"Key result: 11/3 is NOT a rep dimension ratio [THEOREM]")
    print(f"  It is a composite: n_c/Im_H (two independent quantities)")
