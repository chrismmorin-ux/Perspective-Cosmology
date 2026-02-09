#!/usr/bin/env python3
"""
Stage 3 Prime Selection Rule Investigation

KEY QUESTION: Among all primes p = a^2 + b^2 at Stage 3 (dims up to n_c=11),
why are ONLY 97 and 137 physically realized? Is there a selection rule?

HYPOTHESIS: Only primes whose decomposition uses INDEPENDENT framework dimensions
(not derived subtractions like n_c - 1 = 10) are selected.

Status: INVESTIGATION
Created: Session 132
"""

from sympy import isprime, factorint

# ==============================================================================
# Framework dimensions
# ==============================================================================

# Independent (from division algebras directly):
INDEPENDENT = {1, 2, 3, 4, 7, 8}  # R, C, Im_H, H, Im_O, O

# Derived:
# n_c = 11 (sum of imaginary dims)
# These are legitimate framework numbers but DERIVED, not independent

# Extended set including n_c and powers of independent dims:
EXTENDED_INDEPENDENT = {1, 2, 3, 4, 7, 8, 11}  # add n_c
POWERS_OF_INDEPENDENT = set()
for d in INDEPENDENT:
    for p in range(2, 5):
        val = d**p
        if val <= 20:
            POWERS_OF_INDEPENDENT.add(val)

# Full "algebraically derived" set: independent dims + their powers
ALGEBRAIC = INDEPENDENT | POWERS_OF_INDEPENDENT | {11}
print(f"Independent dims: {sorted(INDEPENDENT)}")
print(f"Powers of independent: {sorted(POWERS_OF_INDEPENDENT)}")
print(f"Algebraic set: {sorted(ALGEBRAIC)}")

# Derived by subtraction (e.g., n_c - R = 10):
DERIVED_BY_SUBTRACTION = set()
for a in [11]:  # n_c
    for b in INDEPENDENT:
        if a - b > 0 and a - b not in ALGEBRAIC:
            DERIVED_BY_SUBTRACTION.add(a - b)
print(f"Derived by subtraction: {sorted(DERIVED_BY_SUBTRACTION)}")

# ==============================================================================
# ALL Stage 3 primes: a^2 + b^2 with a,b in dims up to 11
# ==============================================================================

print(f"\n{'='*70}")
print("ALL primes a^2 + b^2 with a,b from extended dims (up to 11):")
print(f"{'='*70}")

all_dims_to_11 = set(range(1, 12))
stage3_primes = set()

for a in sorted(all_dims_to_11):
    for b in sorted(all_dims_to_11):
        if a <= b:
            val = a**2 + b**2
            if isprime(val):
                stage3_primes.add((val, a, b))

# Check which ones use only algebraic dimensions
print(f"\n{'Prime':>6} | {'a':>3} {'b':>3} | {'a algebraic?':>14} {'b algebraic?':>14} | {'SELECTED?':>10}")
print("-" * 70)

selected = []
not_selected = []

for val, a, b in sorted(stage3_primes):
    if val < 50:  # Skip Stages 1 and 2
        continue
    a_alg = a in ALGEBRAIC
    b_alg = b in ALGEBRAIC
    both_alg = a_alg and b_alg

    marker = "YES" if both_alg else "no"

    if both_alg:
        selected.append((val, a, b))
    else:
        not_selected.append((val, a, b))

    print(f"{val:>6} | {a:>3} {b:>3} | {'YES' if a_alg else 'NO':>14} {'YES' if b_alg else 'NO':>14} | {marker:>10}")

print(f"\nSelected (both dims algebraic): {[v for v,_,_ in selected]}")
print(f"Rejected (non-algebraic dim):   {[v for v,_,_ in not_selected]}")

# ==============================================================================
# Verify: Do the selected primes match the framework primes?
# ==============================================================================

print(f"\n{'='*70}")
print("Verification: Selected primes vs. known framework primes")
print(f"{'='*70}")

framework_primes = {2, 5, 13, 17, 53, 73, 113, 137}
framework_extra = {97}  # Used but sometimes considered secondary

# Check Stage 3 specifically
stage3_selected_vals = {v for v,_,_ in selected if v > 50}
stage3_framework = {97, 137}

print(f"\nStage 3 selected by rule: {sorted(stage3_selected_vals)}")
print(f"Stage 3 used in framework: {sorted(stage3_framework)}")

# The issue: the algebraic rule selects MORE than just 97 and 137
# Let's see what it selects

# Actually check MORE carefully: What if we restrict to DIRECT independent dims?
# Not powers, just the 7 values {1, 2, 3, 4, 7, 8, 11}?

print(f"\n{'='*70}")
print("Stricter rule: a,b in {{1,2,3,4,7,8,11}} ONLY (no powers)")
print(f"{'='*70}")

strict_primes = []
for a in sorted(EXTENDED_INDEPENDENT):
    for b in sorted(EXTENDED_INDEPENDENT):
        if a <= b:
            val = a**2 + b**2
            if isprime(val) and val > 50:
                strict_primes.append((val, a, b))
                print(f"  {val} = {a}^2 + {b}^2")

print(f"\nStrict Stage 3 primes: {[v for v,_,_ in strict_primes]}")

# ==============================================================================
# The REAL selection: Framework dimensions as BOTH summands
# ==============================================================================

print(f"\n{'='*70}")
print("Framework sum-of-squares: a,b BOTH in D_framework = {{1,2,3,4,7,8,11}}")
print(f"{'='*70}")

D_framework = {1, 2, 3, 4, 7, 8, 11}
all_fw_primes = []

for a in sorted(D_framework):
    for b in sorted(D_framework):
        if a <= b:
            val = a**2 + b**2
            if isprime(val):
                all_fw_primes.append((val, a, b))
                print(f"  {val} = {a}^2 + {b}^2")

print(f"\nAll framework primes: {[v for v,_,_ in all_fw_primes]}")
print(f"Known framework set:  {sorted(framework_primes)}")
print(f"Match: {set(v for v,_,_ in all_fw_primes) == framework_primes}")

# ==============================================================================
# KEY INSIGHT: 97 comes from H^2 + 9^2 where 9 is NOT in D_framework
# ==============================================================================

print(f"\n{'='*70}")
print("CRITICAL: Where does 97 come from?")
print(f"{'='*70}")

print(f"""
97 = 4^2 + 9^2 = H^2 + 9^2

9 is NOT in D_framework = {{1,2,3,4,7,8,11}}.

But 9 = 3^2 = Im_H^2 (square of imaginary quaternion dimension)
Or  9 = 11 - 2 = n_c - C (crystal minus complex)

So 97 is NOT a "pure" framework prime in the sense of AXM_0118.
It's a COMPOSITE framework number involving derived quantities.

This means the EXISTING framework prime catalog (AXM_0118) is:
  {{2, 5, 13, 17, 53, 73, 113, 137}}

And 97 is a SECONDARY prime, derived from operations on framework dims.
This is consistent with its role: 97 appears in electroweak physics
(cos(theta_W) = 171/194 involves 97 via 194 = 2*97), not in the
"fundamental" coupling constant (alpha, which uses 137).
""")

# ==============================================================================
# The two types of framework primes
# ==============================================================================

print(f"{'='*70}")
print("TWO TYPES of Framework Primes")
print(f"{'='*70}")

print("""
TYPE 1 (Primary): p = a^2 + b^2 where a,b in D_framework = {1,2,3,4,7,8,11}
  These are: 2, 5, 13, 17, 53, 73, 113, 137
  EXACTLY the 8 framework primes from AXM_0118.

TYPE 2 (Secondary): p = a^2 + b^2 where a,b are DERIVED from D_framework
  via powers, products, differences
  Examples: 97 = 4^2 + 9^2 (9 = 3^2)
            193 = ? (check)
            337 = ? (check)

This classification explains WHY 97 and 137 have different roles:
  137: Primary (defines alpha, the fundamental coupling)
  97:  Secondary (appears in electroweak mixing, a derived coupling)
""")

# Check 193 and 337
print("Checking 193 and 337:")
for target in [193, 337]:
    print(f"\n  {target}:")
    for a in range(1, 20):
        for b in range(a, 20):
            if a**2 + b**2 == target:
                a_fw = a in D_framework
                b_fw = b in D_framework
                a_alg = a in ALGEBRAIC
                b_alg = b in ALGEBRAIC
                print(f"    {target} = {a}^2 + {b}^2"
                      f"  | a={'FW' if a_fw else 'ALG' if a_alg else 'EXT'},"
                      f" b={'FW' if b_fw else 'ALG' if b_alg else 'EXT'}")

# ==============================================================================
# Crystallization stage assignment
# ==============================================================================

print(f"\n{'='*70}")
print("Stage Assignment Rule")
print(f"{'='*70}")

print("""
A prime p = a^2 + b^2 crystallizes at the stage where max(a,b) first becomes
available through the symmetry breaking chain.

Availability:
  Stage 1: dims {1, 2, 3, 4} available (H-regime, SO(4) factor)
  Stage 2: dims {1, 2, 3, 4, 7, 8} available (O-regime, G_2)
  Stage 3: dims {1, 2, 3, 4, 7, 8, 11} available (Crystal, SU(3))

The MAXIMUM component determines the stage:
""")

all_primes_with_stages = []
for val, a, b in sorted(all_fw_primes):
    max_dim = max(a, b)
    if max_dim <= 4:
        stage = 1
    elif max_dim <= 8:
        stage = 2
    else:
        stage = 3

    all_primes_with_stages.append((val, a, b, stage))
    print(f"  {val:>4} = {a}^2 + {b}^2  max_dim={max_dim:>2}  -> Stage {stage}")

print(f"\nStage 1 primes: {[v for v,_,_,s in all_primes_with_stages if s==1]}")
print(f"Stage 2 primes: {[v for v,_,_,s in all_primes_with_stages if s==2]}")
print(f"Stage 3 primes: {[v for v,_,_,s in all_primes_with_stages if s==3]}")

# Verify bootstrap
s1_sum = sum(v for v,_,_,s in all_primes_with_stages if s==1)
print(f"\nStage 1 sum: {s1_sum} (is prime: {isprime(s1_sum)})")
print(f"37 = 1^2 + 6^2 = R^2 + (C*Im_H)^2")
print(f"37 is NOT a primary framework prime (6 not in D_framework)")
print(f"37 IS a derived framework prime (6 = C * Im_H)")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print(f"\n{'='*70}")
print("VERIFICATION TESTS")
print(f"{'='*70}")

tests = [
    ("8 primary framework primes exist",
     len(all_fw_primes) == 8),
    ("Primary primes = {2,5,13,17,53,73,113,137}",
     set(v for v,_,_ in all_fw_primes) == {2, 5, 13, 17, 53, 73, 113, 137}),
    ("97 is NOT a primary framework prime",
     97 not in set(v for v,_,_ in all_fw_primes)),
    ("Stage 1 primes: {2,5,13,17}",
     set(v for v,_,_,s in all_primes_with_stages if s==1) == {2, 5, 13, 17}),
    ("Stage 2 primes: {53,73,113}",
     set(v for v,_,_,s in all_primes_with_stages if s==2) == {53, 73, 113}),
    ("Stage 3 primes: {137}",
     set(v for v,_,_,s in all_primes_with_stages if s==3) == {137}),
    ("Bootstrap: Stage 1 sum = 37 (prime)",
     s1_sum == 37 and isprime(37)),
    ("137 = H^2 + n_c^2",
     4**2 + 11**2 == 137),
    ("97 = H^2 + Im_H^4 (secondary)",
     4**2 + 3**4 == 97),
]

all_pass = True
for name, result in tests:
    status = "PASS" if result else "FAIL"
    if not result:
        all_pass = False
    print(f"[{status}] {name}")

print(f"\n{'='*70}")
if all_pass:
    print("ALL TESTS PASS")
else:
    print("SOME TESTS FAILED")
print(f"{'='*70}")
