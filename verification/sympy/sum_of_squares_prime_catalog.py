"""
Catalog of All Framework Primes: Sums of Squares of Division Algebra Dimensions

This script systematically catalogs all primes that can be expressed as
sums of squares of framework dimensions, mapping each to physical meaning.

Framework dimensions:
- dim(R) = 1 (real numbers)
- dim(C) = 2 (complex numbers)
- Im(H) = 3 (imaginary quaternions, generation structure)
- dim(H) = 4 (quaternions, defect structure)
- Im(O) = 7 (imaginary octonions)
- dim(O) = 8 (octonions, color structure)
- n_c = 11 (crystal dimensions)

Goal: Map ALL primes from framework dimension squares and identify
which are "used" by known physical constants.
"""

from sympy import *
from collections import defaultdict

# Framework dimensions with physical meanings
DIMENSIONS = {
    1: "dim(R)",
    2: "dim(C)",
    3: "Im(H)",
    4: "dim(H)",
    7: "Im(O)",
    8: "dim(O)",
    11: "n_c"
}

PHYSICAL_MEANINGS = {
    1: "real unit",
    2: "complex structure",
    3: "generation/flavor",
    4: "quaternion/defect",
    7: "imaginary octonion",
    8: "octonion/color",
    11: "crystal"
}

dim_list = sorted(DIMENSIONS.keys())

print("=" * 70)
print("COMPLETE CATALOG OF FRAMEWORK PRIMES")
print("=" * 70)

print(f"\nFramework dimensions: {dim_list}")
for d, name in sorted(DIMENSIONS.items()):
    print(f"  {d} = {name} ({PHYSICAL_MEANINGS[d]})")

print("\n" + "=" * 70)
print("PART I: ALL PRIMES OF FORM a^2 + b^2")
print("=" * 70)

# Find all primes
primes_found = {}  # prime -> list of (a, b) decompositions

for a in dim_list:
    for b in dim_list:
        if a <= b:  # avoid duplicates
            n = a**2 + b**2
            if isprime(n):
                if n not in primes_found:
                    primes_found[n] = []
                primes_found[n].append((a, b))

print(f"\nFound {len(primes_found)} distinct primes from framework dimension squares:\n")

# Sort and display
for p in sorted(primes_found.keys()):
    decomps = primes_found[p]
    for a, b in decomps:
        dim_a = DIMENSIONS[a]
        dim_b = DIMENSIONS[b]
        phys_a = PHYSICAL_MEANINGS[a]
        phys_b = PHYSICAL_MEANINGS[b]
        print(f"  {p:4d} = {a}^2 + {b}^2 = {dim_a}^2 + {dim_b}^2")
        print(f"         Physical: {phys_a} + {phys_b}")

print("\n" + "=" * 70)
print("PART II: CLASSIFICATION BY ALGEBRAIC STRUCTURE")
print("=" * 70)

# Classify by which algebras are involved
def classify_decomposition(a, b):
    """Classify what algebraic structures a decomposition involves"""
    structures = set()
    for d in [a, b]:
        if d == 1:
            structures.add("R")
        elif d in [2]:
            structures.add("C")
        elif d in [3, 4]:
            structures.add("H")
        elif d in [7, 8]:
            structures.add("O")
        elif d == 11:
            structures.add("Crystal")
    return structures

print("\nClassification by algebras involved:")
by_class = defaultdict(list)
for p in sorted(primes_found.keys()):
    for a, b in primes_found[p]:
        structures = classify_decomposition(a, b)
        class_str = "+".join(sorted(structures))
        by_class[class_str].append((p, a, b))

for class_str in sorted(by_class.keys()):
    primes_in_class = by_class[class_str]
    print(f"\n{class_str}:")
    for p, a, b in primes_in_class:
        print(f"  {p} = {a}^2 + {b}^2")

print("\n" + "=" * 70)
print("PART III: PHYSICAL CONSTANTS MAPPED TO PRIMES")
print("=" * 70)

# Known mappings
KNOWN_MAPPINGS = {
    73: {
        "constant": "Koide theta",
        "formula": "theta = pi * 73/99",
        "decomposition": (3, 8),
        "interpretation": "Im(H)^2 + dim(O)^2 encodes generation + color",
        "physics": "Lepton mass hierarchy",
        "precision": "0.006%"
    },
    137: {
        "constant": "Fine structure constant alpha",
        "formula": "1/alpha ~ 137.036",
        "decomposition": (4, 11),
        "interpretation": "dim(H)^2 + n_c^2 encodes defect + crystal",
        "physics": "Electromagnetic coupling",
        "precision": "0.026% from integer"
    }
}

print("\nMapped primes (physically identified):")
for p in sorted(KNOWN_MAPPINGS.keys()):
    info = KNOWN_MAPPINGS[p]
    a, b = info["decomposition"]
    print(f"\n  {p} = {a}^2 + {b}^2")
    print(f"    Constant: {info['constant']}")
    print(f"    Formula: {info['formula']}")
    print(f"    Interpretation: {info['interpretation']}")
    print(f"    Physics: {info['physics']}")
    print(f"    Precision: {info['precision']}")

print("\n" + "=" * 70)
print("PART IV: UNMAPPED PRIMES (PREDICTIONS?)")
print("=" * 70)

print("\nPrimes NOT yet mapped to physical constants:")
unmapped = [p for p in sorted(primes_found.keys()) if p not in KNOWN_MAPPINGS]

for p in unmapped:
    for a, b in primes_found[p]:
        structures = classify_decomposition(a, b)
        class_str = "+".join(sorted(structures))
        print(f"\n  {p} = {a}^2 + {b}^2 [{class_str}]")
        print(f"    Could encode: {PHYSICAL_MEANINGS[a]} + {PHYSICAL_MEANINGS[b]}")
        # Suggest what this might relate to
        if structures == {"R", "C"}:
            print(f"    Possible: basic complex structure quantity")
        elif structures == {"C", "H"}:
            print(f"    Possible: flavor/weak interaction quantity")
        elif structures == {"C", "O"}:
            print(f"    Possible: color-complex coupling")
        elif structures == {"H", "O"}:
            print(f"    Possible: flavor-color mixing (CKM?)")
        elif structures == {"O"}:
            print(f"    Possible: pure color quantity")
        elif structures == {"R", "H"}:
            print(f"    Possible: weak angle or mass ratio")
        elif structures == {"R", "O"}:
            print(f"    Possible: color singlet quantity")

print("\n" + "=" * 70)
print("PART V: SPECIAL PROPERTIES OF MAPPED PRIMES")
print("=" * 70)

print("""
The two mapped primes (73, 137) share special properties:

1. BOTH are prime (irreducible crystallization modes)
2. BOTH are 1 mod 4 (can be sum of two squares by Fermat)
3. BOTH have UNIQUE decompositions as sums of framework squares
4. BOTH encode TWO different algebraic structures
5. BOTH appear with high precision in physical constants

Checking these properties:
""")

for p in [73, 137]:
    info = KNOWN_MAPPINGS[p]
    a, b = info["decomposition"]
    print(f"\n{p}:")
    print(f"  Prime: {isprime(p)}")
    print(f"  {p} mod 4 = {p % 4}")

    # Count decompositions in framework dimensions
    decomp_count = len(primes_found.get(p, []))
    print(f"  Decompositions in framework dims: {decomp_count}")

    # Algebraic structures
    structures = classify_decomposition(a, b)
    print(f"  Structures encoded: {structures}")

print("\n" + "=" * 70)
print("PART VI: THE FERMAT CONNECTION")
print("=" * 70)

print("""
Fermat's Two-Square Theorem states:
A prime p can be expressed as sum of two squares iff:
  p = 2  OR  p = 1 (mod 4)

This constrains which primes can be framework attractors.

Checking all framework primes:
""")

for p in sorted(primes_found.keys()):
    mod4 = p % 4
    fermat_ok = (p == 2) or (mod4 == 1)
    status = "VALID" if fermat_ok else "INVALID"
    print(f"  {p}: {p} mod 4 = {mod4}, Fermat: {status}")

print("""
All framework primes satisfy Fermat's theorem (as they must).
The constraint p = 1 (mod 4) may have geometric significance
in the crystal orthogonality structure.
""")

print("\n" + "=" * 70)
print("PART VII: PRIME DENSITY ANALYSIS")
print("=" * 70)

print("""
How many primes arise from framework dimension squares?
This measures the "selectivity" of the mechanism.
""")

# Count all numbers expressible as a^2 + b^2 with framework dims
all_sums = set()
for a in dim_list:
    for b in dim_list:
        all_sums.add(a**2 + b**2)

prime_sums = [n for n in all_sums if isprime(n)]

print(f"\nTotal distinct values of a^2 + b^2: {len(all_sums)}")
print(f"Of these, primes: {len(prime_sums)}")
print(f"Prime density: {len(prime_sums)/len(all_sums)*100:.1f}%")

# Range analysis
max_sum = max(all_sums)
primes_up_to_max = [p for p in range(2, max_sum + 1) if isprime(p)]
fermat_primes = [p for p in primes_up_to_max if p == 2 or p % 4 == 1]

print(f"\nPrimes up to {max_sum}: {len(primes_up_to_max)}")
print(f"Of these, Fermat-valid (2 or 1 mod 4): {len(fermat_primes)}")
print(f"Framework primes: {len(prime_sums)}")
print(f"Selectivity: {len(prime_sums)/len(fermat_primes)*100:.1f}% of Fermat-valid primes")

print("\n" + "=" * 70)
print("PART VIII: EXTENDED CATALOG WITH PRODUCTS")
print("=" * 70)

print("""
Some constants might not be pure primes but products of primes.
Let's catalog products that arise naturally:
""")

# Known denominator: 99 = 9 x 11 = 3^2 x 11
print("\nKnown products in formulas:")
print(f"  99 = 3^2 x 11 = Im(H)^2 x n_c [Koide denominator]")
print(f"      Factors: {factorint(99)}")

# Other potentially meaningful products
print("\nOther framework products:")
products = set()
for a in dim_list:
    for b in dim_list:
        if a <= b:
            products.add(a * b)
            products.add(a**2 * b)
            products.add(a * b**2)

for prod in sorted(products):
    if prod <= 200:
        factors = factorint(prod)
        print(f"  {prod} = {factors}")

print("\n" + "=" * 70)
print("PART IX: PREDICTIONS FOR NEW CONSTANTS")
print("=" * 70)

print("""
Based on the pattern, we PREDICT that other fundamental constants
should be connected to framework primes. Candidates:

Weinberg angle:
  sin^2(theta_W) ~ 0.231
  If this = p/q for framework p, q, what are they?
""")

sin2_theta_W = Float('0.23122', 5)
print(f"  sin^2(theta_W) = {sin2_theta_W}")

# Try to match with framework ratios
print("\n  Testing framework ratios near sin^2(theta_W):")
for p in sorted(primes_found.keys()):
    for q in sorted(all_sums):
        if q > 0:
            ratio = float(p) / q
            if abs(ratio - sin2_theta_W) / sin2_theta_W < 0.05:
                error = abs(ratio - sin2_theta_W) / sin2_theta_W * 100
                print(f"    {p}/{q} = {ratio:.4f}, error = {error:.2f}%")

# Also try non-prime numerators
print("\n  Testing with dimension ratios:")
for a in dim_list:
    for b in dim_list:
        if b > a:
            ratio = a / b
            if abs(ratio - sin2_theta_W) / sin2_theta_W < 0.15:
                error = abs(ratio - sin2_theta_W) / sin2_theta_W * 100
                print(f"    {a}/{b} = {DIMENSIONS[a]}/{DIMENSIONS[b]} = {ratio:.4f}, error = {error:.2f}%")

# Known result: sin^2(theta_W) = 1/4 at tree level in some GUT models
print("\n  Note: dim(C)/dim(O) = 2/8 = 1/4 = 0.25")
print(f"  Error from observed: {abs(0.25 - sin2_theta_W) / sin2_theta_W * 100:.1f}%")

print("\n" + "=" * 70)
print("SUMMARY TABLE")
print("=" * 70)

print("""
+-------+---------------+------------------------+------------------------+
| Prime | Decomposition | Structures             | Physical Constant      |
+-------+---------------+------------------------+------------------------+""")

for p in sorted(primes_found.keys()):
    for a, b in primes_found[p]:
        structures = f"{PHYSICAL_MEANINGS[a]} + {PHYSICAL_MEANINGS[b]}"
        if p in KNOWN_MAPPINGS:
            constant = KNOWN_MAPPINGS[p]["constant"]
        else:
            constant = "UNMAPPED"
        print(f"| {p:5d} | {a}^2 + {b}^2       | {structures:22} | {constant:22} |")

print("""+-------+---------------+------------------------+------------------------+

CONCLUSION:
Framework primes arise naturally from division algebra dimensions.
Two major physical constants (Koide theta via 73, alpha via 137)
are already mapped. The remaining primes are PREDICTIONS for
quantities that should appear in the Standard Model or beyond.

Key insight: Primes select "irreducible" crystallization modes.
The sum-of-squares structure encodes which algebras combine.
""")
