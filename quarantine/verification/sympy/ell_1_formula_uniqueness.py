#!/usr/bin/env python3
"""
Testing Uniqueness of ell_1 = 220 Formula

KEY QUESTION: How many ways can we get 220 from division algebra dimensions?
Is the formula unique, or are we cherry-picking?

Status: SCRUTINY
Created: Session 98a
"""

from sympy import *
from itertools import product

# ==============================================================================
# FRAMEWORK DIMENSIONS
# ==============================================================================

dims = {
    'R': 1,
    'C': 2,
    'Im_H': 3,
    'H': 4,
    'Im_O': 7,
    'O': 8,
    'n_c': 11,
    'n_d': 4,
}

target = 220

print("=" * 70)
print("UNIQUENESS TEST: HOW MANY WAYS TO GET 220?")
print("=" * 70)
print()

# ==============================================================================
# TEST 1: PRODUCTS OF 2 DIMENSIONS
# ==============================================================================

print("Products of 2 dimensions giving 220:")
print("-" * 50)

count_2 = 0
for (n1, v1), (n2, v2) in product(dims.items(), dims.items()):
    if v1 * v2 == target:
        print(f"  {n1} * {n2} = {v1} * {v2} = {target}")
        count_2 += 1

if count_2 == 0:
    print("  None found")
print(f"Total: {count_2}")
print()

# ==============================================================================
# TEST 2: PRODUCTS OF 3 DIMENSIONS
# ==============================================================================

print("Products of 3 dimensions giving 220:")
print("-" * 50)

count_3 = 0
found_3 = set()
for (n1, v1), (n2, v2), (n3, v3) in product(dims.items(), dims.items(), dims.items()):
    if v1 * v2 * v3 == target:
        # Avoid duplicates by sorting names
        key = tuple(sorted([n1, n2, n3]))
        if key not in found_3:
            found_3.add(key)
            print(f"  {n1} * {n2} * {n3} = {v1} * {v2} * {v3} = {target}")
            count_3 += 1

if count_3 == 0:
    print("  None found")
print(f"Total unique: {count_3}")
print()

# ==============================================================================
# TEST 3: a * b * (c - 1) forms
# ==============================================================================

print("Products of form a * b * (c - 1) giving 220:")
print("-" * 50)

count_pattern = 0
found_pattern = []
for (n1, v1) in dims.items():
    for (n2, v2) in dims.items():
        for (n3, v3) in dims.items():
            if v1 * v2 * (v3 - 1) == target:
                print(f"  {n1} * {n2} * ({n3} - 1) = {v1} * {v2} * {v3 - 1} = {target}")
                found_pattern.append((n1, n2, n3))
                count_pattern += 1

if count_pattern == 0:
    print("  None found")
print(f"Total: {count_pattern}")
print()

# ==============================================================================
# TEST 4: 2 * a * (b - 1) forms (original CMB formula)
# ==============================================================================

print("Products of form 2 * a * (b - 1) giving 220:")
print("-" * 50)

count_cmb = 0
for (n1, v1) in dims.items():
    for (n2, v2) in dims.items():
        if 2 * v1 * (v2 - 1) == target:
            print(f"  2 * {n1} * ({n2} - 1) = 2 * {v1} * {v2 - 1} = {target}")
            count_cmb += 1

if count_cmb == 0:
    print("  None found")
print(f"Total: {count_cmb}")
print()

# ==============================================================================
# TEST 5: COMBINED SUMS AND PRODUCTS
# ==============================================================================

print("(a + b) * c * d giving 220:")
print("-" * 50)

count_sum_prod = 0
found_sum_prod = set()
for (n1, v1), (n2, v2), (n3, v3), (n4, v4) in product(dims.items(), repeat=4):
    if n1 != n2 and (v1 + v2) * v3 * v4 == target:
        key = tuple(sorted([n1, n2]) + sorted([n3, n4]))
        if key not in found_sum_prod:
            found_sum_prod.add(key)
            print(f"  ({n1} + {n2}) * {n3} * {n4} = ({v1} + {v2}) * {v3} * {v4} = {target}")
            count_sum_prod += 1

if count_sum_prod == 0:
    print("  None found")
print(f"Total unique: {count_sum_prod}")
print()

# ==============================================================================
# TEST 6: SPECIFIC CHECK ON OUR FORMULAS
# ==============================================================================

print("=" * 70)
print("COMPARING OUR TWO FORMULAS FOR ell_1 = 220")
print("=" * 70)
print()

# Formula 1: 2 * n_c * (n_c - 1) = 2 * 11 * 10
formula1 = 2 * dims['n_c'] * (dims['n_c'] - 1)
print(f"Formula 1: 2 * n_c * (n_c - 1) = 2 * {dims['n_c']} * {dims['n_c'] - 1} = {formula1}")

# Formula 2: n_d * (R + H) * n_c = 4 * 5 * 11
formula2 = dims['n_d'] * (dims['R'] + dims['H']) * dims['n_c']
print(f"Formula 2: n_d * (R + H) * n_c = {dims['n_d']} * {dims['R'] + dims['H']} * {dims['n_c']} = {formula2}")

print()
print(f"Both equal 220: {formula1 == 220 and formula2 == 220}")
print()

# Are these the SAME formula in disguise?
print("Equivalence check:")
print(f"  2 * n_c * (n_c - 1) = 2 * 11 * 10 = 220")
print(f"  n_d * (R + H) * n_c = 4 * 5 * 11 = 220")
print()
print("  For these to be equal:")
print(f"  2 * (n_c - 1) = n_d * (R + H)")
print(f"  2 * 10 = 4 * 5")
print(f"  20 = 20 [TRUE]")
print()
print("  So: n_c - 1 = n_d * (R + H) / 2 = 4 * 5 / 2 = 10")
print("  This is a CONSTRAINT that happens to be satisfied!")
print()

# ==============================================================================
# TEST 7: IS n_c - 1 = 10 SPECIAL?
# ==============================================================================

print("=" * 70)
print("IS n_c - 1 = 10 ALGEBRAICALLY SPECIAL?")
print("=" * 70)
print()

# n_c - 1 = R + C + O - 1 = 1 + 2 + 8 - 1 = 10
print("n_c - 1 decompositions:")
print(f"  n_c - 1 = 11 - 1 = 10")
print(f"  n_c - 1 = R + C + O - 1 = 1 + 2 + 8 - 1 = 10")
print(f"  n_c - 1 = C + O = 2 + 8 = 10")
print()

# So n_c - 1 = C + O!
nc_minus_1 = dims['C'] + dims['O']
print(f"KEY IDENTITY: n_c - 1 = C + O = {dims['C']} + {dims['O']} = {nc_minus_1}")
print()

# Now let's check: n_d * (R + H) / 2 = ?
nd_times_stuff = dims['n_d'] * (dims['R'] + dims['H']) / 2
print(f"n_d * (R + H) / 2 = {dims['n_d']} * {dims['R'] + dims['H']} / 2 = {nd_times_stuff}")
print(f"C + O = {dims['C'] + dims['O']}")
print(f"Equal: {nc_minus_1 == nd_times_stuff}")
print()

# So we have: C + O = n_d * (R + H) / 2
# This means: 2(C + O) = n_d * (R + H)
# 2(2 + 8) = 4 * (1 + 4)
# 20 = 20 TRUE
print("ALGEBRAIC IDENTITY:")
print(f"  2 * (C + O) = n_d * (R + H)")
print(f"  2 * ({dims['C']} + {dims['O']}) = {dims['n_d']} * ({dims['R']} + {dims['H']})")
print(f"  2 * {dims['C'] + dims['O']} = {dims['n_d'] * (dims['R'] + dims['H'])}")
print(f"  {2 * (dims['C'] + dims['O'])} = {dims['n_d'] * (dims['R'] + dims['H'])}")
print()

# ==============================================================================
# SUMMARY
# ==============================================================================

print("=" * 70)
print("SUMMARY")
print("=" * 70)
print()

print("1. There are MULTIPLE ways to construct 220 from framework dimensions.")
print(f"   - Products of 3 dims: {count_3}")
print(f"   - 2*a*(b-1) forms: {count_cmb}")
print(f"   - (a+b)*c*d forms: {count_sum_prod}")
print()

print("2. The two formulas for ell_1 are NOT independent:")
print("   2 * n_c * (n_c - 1) = n_d * (R + H) * n_c")
print("   because n_c - 1 = C + O = n_d * (R + H) / 2")
print()

print("3. This reveals a DEEPER IDENTITY:")
print("   2(C + O) = n_d * (R + H)")
print("   2(2 + 8) = 4 * (1 + 4)")
print("   20 = 20")
print()

print("4. Numerology risk: MEDIUM")
print("   Multiple formulas exist, but they're related by algebraic identity.")
print("   The identity 2(C + O) = n_d(R + H) is interesting but needs justification.")
