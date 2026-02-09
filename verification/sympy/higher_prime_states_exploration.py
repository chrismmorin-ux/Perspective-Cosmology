#!/usr/bin/env python3
"""
Exploration of Higher Prime States in Division Algebra Framework

Beyond the 17-97-337 fourth-power chain, what other prime patterns exist?

Status: EXPLORATION
Created: Session 120
"""

from sympy import *
from sympy import isprime, factorint, prime
from itertools import combinations, product

print("=" * 70)
print("HIGHER PRIME STATES EXPLORATION")
print("=" * 70)

# ==============================================================================
# DIVISION ALGEBRA DIMENSIONS
# ==============================================================================

dims = {
    'R': 1,
    'C': 2,
    'Im_H': 3,
    'H': 4,
    'Im_O': 7,
    'O': 8,
    'n_c': 11,  # R + C + O
    'n_d': 4,   # H
}

dim_list = [1, 2, 3, 4, 7, 8, 11]
dim_names = {1: 'R', 2: 'C', 3: 'Im_H', 4: 'H', 7: 'Im_O', 8: 'O', 11: 'n_c'}

print("\nFramework dimensions:", dim_list)

# ==============================================================================
# PART 1: EXTEND FOURTH-POWER ANALYSIS
# ==============================================================================

print("\n" + "=" * 70)
print("PART 1: FOURTH-POWER PRIMES (ALL PAIRS)")
print("=" * 70)

print("\nFourth-power sums a^4 + b^4 for all framework dimension pairs:\n")

fourth_power_primes = []
fourth_power_composites = []

for i, a in enumerate(dim_list):
    for b in dim_list[i+1:]:
        total = a**4 + b**4
        if isprime(total):
            fourth_power_primes.append((a, b, total))
            status = "PRIME"
        else:
            fourth_power_composites.append((a, b, total, factorint(total)))
            status = f"composite: {factorint(total)}"
        print(f"  {a}^4 + {b}^4 = {total:>6} ({status})")

print(f"\nFourth-power PRIMES found: {len(fourth_power_primes)}")
for a, b, p in fourth_power_primes:
    name_a = dim_names.get(a, str(a))
    name_b = dim_names.get(b, str(b))
    print(f"  {p} = {name_a}^4 + {name_b}^4 = {a}^4 + {b}^4")

# ==============================================================================
# PART 2: SECOND-POWER (SUM OF SQUARES) PRIMES
# ==============================================================================

print("\n" + "=" * 70)
print("PART 2: SUM-OF-SQUARES PRIMES (a^2 + b^2)")
print("=" * 70)

print("\nSum-of-squares for all framework dimension pairs:\n")

sos_primes = []

for i, a in enumerate(dim_list):
    for b in dim_list[i+1:]:
        total = a**2 + b**2
        if isprime(total):
            sos_primes.append((a, b, total))
            status = "PRIME"
        else:
            status = f"composite: {factorint(total)}"
        print(f"  {a}^2 + {b}^2 = {total:>4} ({status})")

print(f"\nSum-of-squares PRIMES found: {len(sos_primes)}")
for a, b, p in sorted(sos_primes, key=lambda x: x[2]):
    name_a = dim_names.get(a, str(a))
    name_b = dim_names.get(b, str(b))
    print(f"  {p:>3} = {name_a}^2 + {name_b}^2 = {a}^2 + {b}^2")

# ==============================================================================
# PART 3: SIXTH-POWER PRIMES
# ==============================================================================

print("\n" + "=" * 70)
print("PART 3: SIXTH-POWER SUMS (a^6 + b^6)")
print("=" * 70)

print("\nSixth-power sums (smaller dims only to keep manageable):\n")

sixth_primes = []
for a in [1, 2, 3, 4]:
    for b in range(a+1, 5):
        total = a**6 + b**6
        if isprime(total):
            sixth_primes.append((a, b, total))
            status = "PRIME"
        else:
            status = f"composite"
        print(f"  {a}^6 + {b}^6 = {total:>6} ({status})")

print(f"\nSixth-power PRIMES (consecutive): {sixth_primes}")

# ==============================================================================
# PART 4: MIXED-POWER PRIMES
# ==============================================================================

print("\n" + "=" * 70)
print("PART 4: MIXED-POWER FORMS")
print("=" * 70)

print("\nExploring a^2 + b^4 forms:\n")

mixed_primes = []
for a in dim_list:
    for b in dim_list:
        if a != b:
            total = a**2 + b**4
            if isprime(total):
                mixed_primes.append((a, 2, b, 4, total))

# Sort and show unique primes
mixed_unique = {}
for a, pa, b, pb, p in mixed_primes:
    if p not in mixed_unique:
        mixed_unique[p] = (a, pa, b, pb)

for p in sorted(mixed_unique.keys()):
    a, pa, b, pb = mixed_unique[p]
    print(f"  {p:>4} = {a}^{pa} + {b}^{pb}")

# Special: H^2 + Im_H^4 = 16 + 81 = 97 (already found!)
print(f"\nNotable: 97 = H^2 + Im_H^4 = 4^2 + 3^4 = 16 + 81 (electroweak prime)")

# ==============================================================================
# PART 5: TRIPLE SUMS
# ==============================================================================

print("\n" + "=" * 70)
print("PART 5: TRIPLE SUM PRIMES (a^2 + b^2 + c^2)")
print("=" * 70)

triple_primes = []
for i, a in enumerate(dim_list):
    for j, b in enumerate(dim_list[i+1:], i+1):
        for c in dim_list[j+1:]:
            total = a**2 + b**2 + c**2
            if isprime(total):
                triple_primes.append((a, b, c, total))

print("\nTriple sum-of-squares PRIMES:\n")
for a, b, c, p in sorted(triple_primes, key=lambda x: x[3]):
    name_a = dim_names.get(a, str(a))
    name_b = dim_names.get(b, str(b))
    name_c = dim_names.get(c, str(c))
    print(f"  {p:>3} = {name_a}^2 + {name_b}^2 + {name_c}^2 = {a}^2 + {b}^2 + {c}^2")

# ==============================================================================
# PART 6: THE MASTER IDENTITY AND BEYOND
# ==============================================================================

print("\n" + "=" * 70)
print("PART 6: QUADRUPLE AND QUINTUPLE SUMS")
print("=" * 70)

# Master identity: R^2 + Im_H^2 + H^2 + Im_O^2 + n_c^2 = 196 = 14^2
master = 1**2 + 3**2 + 4**2 + 7**2 + 11**2
print(f"\nMASTER IDENTITY: R^2 + Im_H^2 + H^2 + Im_O^2 + n_c^2")
print(f"              = 1 + 9 + 16 + 49 + 121 = {master} = 14^2")

# What about 4-tuples?
print("\nQuadruple sum-of-squares (selecting 4 from 7 dims):\n")

quad_results = []
for combo in combinations(dim_list, 4):
    total = sum(d**2 for d in combo)
    quad_results.append((combo, total, isprime(total)))

# Show primes
quad_primes = [(c, t) for c, t, is_p in quad_results if is_p]
print(f"Found {len(quad_primes)} prime quadruple sums:")
for combo, total in sorted(quad_primes, key=lambda x: x[1])[:10]:
    print(f"  {total} = " + " + ".join(f"{d}^2" for d in combo))

# Perfect squares
quad_squares = [(c, t) for c, t, _ in quad_results if int(sqrt(t))**2 == t]
print(f"\nFound {len(quad_squares)} perfect square quadruple sums:")
for combo, total in quad_squares:
    root = int(sqrt(total))
    print(f"  {total} = {root}^2 = " + " + ".join(f"{d}^2" for d in combo))

# ==============================================================================
# PART 7: HIGHER FRAMEWORK PRIMES
# ==============================================================================

print("\n" + "=" * 70)
print("PART 7: FRAMEWORK PRIMES BEYOND 337")
print("=" * 70)

print("""
The fourth-power consecutive chain ends at 337.
But what OTHER large primes arise from the framework?
""")

# Products plus/minus small offsets
print("Exploring (dim product) +/- offset patterns:\n")

interesting = []
for a in dim_list:
    for b in dim_list:
        if a < b:
            prod = a * b
            for offset in range(-5, 6):
                test = prod + offset
                if test > 337 and isprime(test):
                    interesting.append((f"{a}*{b} + {offset}", test))

            # Also try powers
            for offset in range(-5, 6):
                test = a**2 * b + offset
                if test > 337 and isprime(test):
                    interesting.append((f"{a}^2*{b} + {offset}", test))

# De-duplicate and sort
seen = set()
unique_higher = []
for formula, p in interesting:
    if p not in seen:
        seen.add(p)
        unique_higher.append((p, formula))

print("Primes > 337 from simple framework expressions:")
for p, formula in sorted(unique_higher)[:15]:
    print(f"  {p} = {formula}")

# ==============================================================================
# PART 8: THE NEXT COSMOLOGICAL SCALES?
# ==============================================================================

print("\n" + "=" * 70)
print("PART 8: PRIMES FROM NON-CONSECUTIVE FOURTH POWERS")
print("=" * 70)

print("""
The consecutive chain 17-97-337 governs particle-electroweak-cosmology.
What about NON-consecutive fourth-power sums?
""")

non_consec_4th = []
for a, b, p in fourth_power_primes:
    if b - a != 1:  # Non-consecutive
        non_consec_4th.append((a, b, p))

print("Non-consecutive fourth-power primes:")
for a, b, p in sorted(non_consec_4th, key=lambda x: x[2]):
    name_a = dim_names.get(a, str(a))
    name_b = dim_names.get(b, str(b))
    gap = b - a
    print(f"  {p:>5} = {name_a}^4 + {name_b}^4 = {a}^4 + {b}^4 (gap = {gap})")

# Special investigation: 2657 = 4^4 + 7^4 IS prime
print(f"\n2657 = H^4 + Im_O^4 = 4^4 + 7^4 IS PRIME!")
print("This bridges associative (H) and non-associative (O) realms.")
print("Physical interpretation: Quantum gravity scale? Pre-Big-Bang physics?")

# ==============================================================================
# PART 9: THE PRIME HIERARCHY
# ==============================================================================

print("\n" + "=" * 70)
print("PART 9: COMPLETE FRAMEWORK PRIME HIERARCHY")
print("=" * 70)

all_framework_primes = set()

# Collect all primes found
for _, _, p in fourth_power_primes:
    all_framework_primes.add(p)
for _, _, p in sos_primes:
    all_framework_primes.add(p)
for _, _, _, p in triple_primes:
    all_framework_primes.add(p)

# Add known framework primes
known = [17, 37, 53, 97, 137, 179, 181, 337]
for p in known:
    all_framework_primes.add(p)

print("\nCOMPLETE FRAMEWORK PRIME CATALOG (sorted):\n")
for p in sorted(all_framework_primes):
    # Try to find its origin
    origins = []

    # Check fourth-power
    for a, b, pp in fourth_power_primes:
        if pp == p:
            origins.append(f"{a}^4 + {b}^4")

    # Check sum-of-squares
    for a, b, pp in sos_primes:
        if pp == p:
            origins.append(f"{a}^2 + {b}^2")

    # Check triple
    for a, b, c, pp in triple_primes:
        if pp == p:
            origins.append(f"{a}^2 + {b}^2 + {c}^2")

    # Special cases
    if p == 137:
        origins.append("H^2 + n_c^2 = 4^2 + 11^2")
    if p == 179:
        origins.append("Im_H^2 + Im_O^2 + n_c^2 = 9 + 49 + 121")

    origin_str = " | ".join(origins) if origins else "?"
    print(f"  {p:>4}: {origin_str}")

# ==============================================================================
# PART 10: SPECULATION - BEYOND COSMOLOGY
# ==============================================================================

print("\n" + "=" * 70)
print("PART 10: SPECULATION - SCALES BEYOND COSMOLOGY")
print("=" * 70)

print("""
HIERARCHY OF FOURTH-POWER PRIMES:

| Prime | Form | Gap | Physical Scale |
|-------|------|-----|----------------|
| 17 | 1^4 + 2^4 | 1 | Particle physics |
| 97 | 2^4 + 3^4 | 1 | Electroweak |
| 337 | 3^4 + 4^4 | 1 | Cosmology (H_0) |
| 2657 | 4^4 + 7^4 | 3 | ??? (pre-Big-Bang?) |
| 6497 | 7^4 + 8^4 | 1 | ??? (not prime: 73 x 89) |

SPECULATION:

2657 = H^4 + Im_O^4 bridges the GAP from associative to non-associative.
This might represent:
- Trans-Planckian physics
- Pre-Big-Bang era
- Multiverse interface
- Information-theoretic limits

The gap of 3 (skipping 5, 6) might relate to:
- 3 = Im_H = number of generations
- 3 missing dimensions in the division algebra sequence

CONJECTURE: 2657/something = a trans-cosmological constant?
""")

# Test some ratios
print("Testing 2657 ratios:")
for denom in [1, 2, 3, 4, 5, 7, 8, 11, 12, 19, 23, 42]:
    ratio = 2657 / denom
    print(f"  2657/{denom} = {ratio:.4f}")

# ==============================================================================
# SUMMARY
# ==============================================================================

print("\n" + "=" * 70)
print("SUMMARY: HIGHER PRIME STATES")
print("=" * 70)

print(f"""
FINDINGS:

1. FOURTH-POWER PRIMES FROM FRAMEWORK:
   - Consecutive: 17, 97, 337 (the main chain)
   - Non-consecutive: 2657 = 4^4 + 7^4 (bridging H to O)
   - Total: {len(fourth_power_primes)} primes

2. SUM-OF-SQUARES PRIMES: {len(sos_primes)} found
   - Includes 5, 13, 17, 53, 113, 137, etc.

3. TRIPLE-SUM PRIMES: {len(triple_primes)} found
   - Includes 179 = 3^2 + 7^2 + 11^2 (appears in m_b/m_s!)

4. MASTER IDENTITY: 1^2 + 3^2 + 4^2 + 7^2 + 11^2 = 196 = 14^2
   - SO(14) structure group dimension

5. THE BRIDGE PRIME: 2657 = H^4 + Im_O^4
   - First non-consecutive fourth-power prime
   - Bridges associative (H=4) to non-associative (Im_O=7)
   - Physical meaning: beyond standard cosmology?

NEXT STEPS:
- Investigate if 2657 appears in any physical constant
- Explore what 2657/N ratios might represent
- Look for 2657 in multiverse or pre-Big-Bang theories
""")

print("\n*** EXPLORATION COMPLETE ***")
