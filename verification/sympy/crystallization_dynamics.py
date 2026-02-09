#!/usr/bin/env python3
"""
Crystallization Dynamics: Formalizing Almost-Prime Dimensions

This script formalizes the mathematical structure of:
1. Imperfection measure for dimensions (as composites)
2. Crystallization effort function
3. Decay dynamics under gravitational pressure
4. Energy release spectrum
5. Connection to Prime Number Theorem

Key definitions:
- Imperfection I(n) = Omega(n) - 1, where Omega(n) = total prime factors with multiplicity
- Prime has I = 0, semiprime has I = 1, etc.
- Crystallization effort C(n) = Omega(n)
- Energy release E(n) proportional to I(n)

Status: VERIFICATION for primes_and_recrystallization_unified.md
"""

from sympy import (
    factorint, primefactors, isprime, prime, primepi,
    log, sqrt, Sum, Symbol, oo, simplify, N, floor,
    factorial, binomial
)
from sympy.ntheory import primenu, primeomega
import numpy as np
from typing import Tuple, List, Dict
from collections import defaultdict

# =============================================================================
# PART 1: IMPERFECTION MEASURES
# =============================================================================

def omega_small(n: int) -> int:
    """omega(n) = number of distinct prime factors (little omega)"""
    if n < 2:
        return 0
    return int(primenu(n))

def omega_big(n: int) -> int:
    """Omega(n) = total number of prime factors with multiplicity (big omega)"""
    if n < 2:
        return 0
    return int(primeomega(n))

def imperfection(n: int) -> int:
    """
    Imperfection measure I(n) = Omega(n) - 1

    - I(prime) = 0 (already crystallized)
    - I(semiprime) = 1 (one factorization step needed)
    - I(p^k) = k - 1 (multiplicity imperfection)
    - I(p*q*r) = 2 (three primes, two steps to separate)
    """
    if n < 2:
        return 0
    return omega_big(n) - 1

def crystallization_effort(n: int) -> int:
    """
    Crystallization effort C(n) = Omega(n)

    How much work gravity must do to fully factor this composite.
    """
    if n < 2:
        return 0
    return omega_big(n)

def is_almost_prime(n: int, k: int) -> bool:
    """Check if n is a k-almost prime (exactly k prime factors with multiplicity)"""
    return omega_big(n) == k

def almost_prime_class(n: int) -> str:
    """Return the almost-prime classification of n"""
    if n < 2:
        return "trivial"
    k = omega_big(n)
    if k == 1:
        return "prime (P_1)"
    elif k == 2:
        return "semiprime (P_2)"
    elif k == 3:
        return "3-almost-prime (P_3)"
    else:
        return f"{k}-almost-prime (P_{k})"

print("=" * 70)
print("PART 1: IMPERFECTION MEASURES")
print("=" * 70)

# Test imperfection measure
test_cases = [
    (2, "prime"),
    (3, "prime"),
    (4, "2^2"),
    (6, "2*3"),
    (8, "2^3"),
    (12, "2^2*3"),
    (30, "2*3*5"),
    (60, "2^2*3*5"),
    (360, "2^3*3^2*5"),
    (2310, "2*3*5*7*11"),
]

print("\nImperfection measure I(n) = Omega(n) - 1:")
print("-" * 60)
print(f"{'n':>6} {'factorization':>15} {'w(n)':>6} {'W(n)':>6} {'I(n)':>6} {'class':>20}")
print("-" * 60)

for n, desc in test_cases:
    w_small = omega_small(n)
    w_big = omega_big(n)
    imp = imperfection(n)
    cls = almost_prime_class(n)
    print(f"{n:>6} {desc:>15} {w_small:>6} {w_big:>6} {imp:>6} {cls:>20}")

# =============================================================================
# PART 2: CRYSTALLIZATION DYNAMICS
# =============================================================================

def single_factorization_step(n: int) -> Tuple[int, int, int]:
    """
    Perform one factorization step: extract the smallest prime factor.

    Returns: (remaining_composite, extracted_prime, energy_released)

    Energy released is proportional to the "overlap" being resolved.
    """
    if n < 2 or isprime(n):
        return (n, 1, 0)  # Already prime, no step possible

    factors = factorint(n)
    smallest_prime = min(factors.keys())

    # Extract one instance of the smallest prime
    remaining = n // smallest_prime

    # Energy released: log of the prime (larger primes = more energy)
    # This is a model choice; could be refined
    energy = float(log(smallest_prime))

    return (remaining, smallest_prime, energy)

def full_crystallization(n: int) -> List[Dict]:
    """
    Fully crystallize a composite: extract all prime factors one by one.

    Returns list of steps, each with:
    - step number
    - remaining composite
    - extracted prime
    - energy released
    - cumulative energy
    """
    if n < 2:
        return []

    steps = []
    current = n
    cumulative_energy = 0.0
    step_num = 0

    while not isprime(current) and current > 1:
        remaining, extracted, energy = single_factorization_step(current)
        cumulative_energy += energy
        step_num += 1

        steps.append({
            'step': step_num,
            'before': current,
            'after': remaining,
            'extracted': extracted,
            'energy': energy,
            'cumulative': cumulative_energy,
            'I_before': imperfection(current),
            'I_after': imperfection(remaining)
        })

        current = remaining

    return steps

print("\n" + "=" * 70)
print("PART 2: CRYSTALLIZATION DYNAMICS")
print("=" * 70)

# Demonstrate full crystallization
demo_composites = [12, 60, 360, 2310]

for n in demo_composites:
    print(f"\nCrystallizing n = {n} (factorization: {factorint(n)})")
    print(f"Initial imperfection: I({n}) = {imperfection(n)}")
    print("-" * 50)

    steps = full_crystallization(n)
    for s in steps:
        print(f"  Step {s['step']}: {s['before']} -> {s['after']} "
              f"(extracted {s['extracted']}, E={s['energy']:.3f}, "
              f"I: {s['I_before']}->{s['I_after']})")

    if steps:
        print(f"  Final: {steps[-1]['after']} (prime), Total energy: {steps[-1]['cumulative']:.3f}")
    else:
        print(f"  Already prime!")

# =============================================================================
# PART 3: DECAY RATE AND PRIME NUMBER THEOREM CONNECTION
# =============================================================================

def count_almost_primes(limit: int, k: int) -> int:
    """Count k-almost primes up to limit"""
    count = 0
    for n in range(2, limit + 1):
        if omega_big(n) == k:
            count += 1
    return count

def imperfection_distribution(limit: int) -> Dict[int, int]:
    """Count how many numbers have each imperfection level"""
    dist = defaultdict(int)
    for n in range(2, limit + 1):
        imp = imperfection(n)
        dist[imp] += 1
    return dict(dist)

print("\n" + "=" * 70)
print("PART 3: IMPERFECTION DISTRIBUTION")
print("=" * 70)

# Analyze distribution of imperfection levels
limit = 10000
dist = imperfection_distribution(limit)

print(f"\nDistribution of imperfection levels up to {limit}:")
print("-" * 40)
print(f"{'I(n)':>6} {'Count':>10} {'Fraction':>12} {'Description':>20}")
print("-" * 40)

total = sum(dist.values())
for i in sorted(dist.keys()):
    count = dist[i]
    frac = count / total
    if i == 0:
        desc = "Primes (crystallized)"
    elif i == 1:
        desc = "Semiprimes"
    elif i == 2:
        desc = "3-almost-primes"
    else:
        desc = f"{i+1}-almost-primes"
    print(f"{i:>6} {count:>10} {frac:>12.4f} {desc:>20}")

# Compare to Prime Number Theorem prediction
prime_count = primepi(limit)
pnt_prediction = limit / float(log(limit))
print(f"\nPrime Number Theorem check:")
print(f"  Actual primes up to {limit}: {prime_count}")
print(f"  PNT prediction (n/ln(n)): {pnt_prediction:.1f}")
print(f"  Ratio: {prime_count / pnt_prediction:.4f}")

# =============================================================================
# PART 4: ENERGY RELEASE SPECTRUM
# =============================================================================

def total_crystallization_energy(n: int) -> float:
    """Total energy to fully crystallize n"""
    if n < 2 or isprime(n):
        return 0.0

    total = 0.0
    factors = factorint(n)
    for p, exp in factors.items():
        # Each prime extraction releases log(p) energy
        # Each prime appears 'exp' times
        total += exp * float(log(p))

    return total

print("\n" + "=" * 70)
print("PART 4: ENERGY RELEASE SPECTRUM")
print("=" * 70)

# Energy release by imperfection class
print("\nEnergy release by almost-prime class:")
print("-" * 60)

for k in range(1, 8):
    # Find examples of k-almost primes
    examples = []
    for n in range(2, 1000):
        if omega_big(n) == k:
            examples.append(n)
            if len(examples) >= 5:
                break

    if examples:
        energies = [total_crystallization_energy(n) for n in examples]
        avg_energy = sum(energies) / len(energies)
        print(f"P_{k} (I={k-1}): examples {examples[:3]}..., avg energy: {avg_energy:.3f}")

# =============================================================================
# PART 5: DECAY DYNAMICS SIMULATION
# =============================================================================

def simulate_crystallization_decay(initial_composites: List[int],
                                    gravity_strength: float = 0.1,
                                    time_steps: int = 100) -> List[float]:
    """
    Simulate the decay of imperfection over time.

    Each time step, composites have probability proportional to gravity_strength
    of undergoing one factorization step.

    Returns list of total imperfection at each time step.
    """
    import random
    random.seed(42)

    current = list(initial_composites)
    imperfection_history = []

    for t in range(time_steps):
        total_imp = sum(imperfection(n) for n in current)
        imperfection_history.append(total_imp)

        # Apply gravity: each composite has chance to crystallize one step
        new_current = []
        for n in current:
            if n < 2 or isprime(n):
                new_current.append(n)
            elif random.random() < gravity_strength:
                # One factorization step
                remaining, _, _ = single_factorization_step(n)
                new_current.append(remaining)
            else:
                new_current.append(n)
        current = new_current

    return imperfection_history

print("\n" + "=" * 70)
print("PART 5: DECAY DYNAMICS SIMULATION")
print("=" * 70)

# Simulate decay of highly composite numbers
highly_composite = [360, 720, 840, 1260, 2520]  # Numbers with many factors
print(f"\nSimulating crystallization of highly composite numbers: {highly_composite}")
print(f"Initial total imperfection: {sum(imperfection(n) for n in highly_composite)}")

decay = simulate_crystallization_decay(highly_composite, gravity_strength=0.2, time_steps=50)

print("\nImperfection decay over time:")
print("-" * 40)
for t in [0, 5, 10, 20, 30, 40, 49]:
    if t < len(decay):
        print(f"  t={t:>3}: Total imperfection = {decay[t]}")

print(f"\nFinal imperfection: {decay[-1]} (should approach 0)")

# =============================================================================
# PART 6: VERIFICATION SUMMARY
# =============================================================================

print("\n" + "=" * 70)
print("VERIFICATION SUMMARY")
print("=" * 70)

tests_passed = 0
tests_total = 0

# Test 1: Primes have I = 0
print("\n[TEST 1] Primes have imperfection I = 0")
primes_to_test = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
all_zero = all(imperfection(p) == 0 for p in primes_to_test)
tests_total += 1
if all_zero:
    tests_passed += 1
    print("  PASS: All primes have I = 0")
else:
    print("  FAIL: Some prime has I != 0")

# Test 2: Semiprimes have I = 1
print("\n[TEST 2] Semiprimes have imperfection I = 1")
semiprimes = [4, 6, 9, 10, 14, 15, 21, 22, 25, 26]
all_one = all(imperfection(n) == 1 for n in semiprimes)
tests_total += 1
if all_one:
    tests_passed += 1
    print("  PASS: All semiprimes have I = 1")
else:
    print("  FAIL: Some semiprime has I != 1")

# Test 3: Crystallization reduces imperfection
print("\n[TEST 3] Each crystallization step reduces imperfection by 1")
test_composites = [12, 30, 60, 120, 360]
all_reduce = True
for n in test_composites:
    steps = full_crystallization(n)
    for s in steps:
        if s['I_before'] - s['I_after'] != 1:
            all_reduce = False
            break
tests_total += 1
if all_reduce:
    tests_passed += 1
    print("  PASS: Each step reduces I by exactly 1")
else:
    print("  FAIL: Some step doesn't reduce I by 1")

# Test 4: Full crystallization reaches I = 0
print("\n[TEST 4] Full crystallization reaches imperfection 0")
test_composites = [100, 256, 1000, 2048, 10000]
all_reach_zero = True
for n in test_composites:
    steps = full_crystallization(n)
    if steps:
        final = steps[-1]['after']
        if imperfection(final) != 0:
            all_reach_zero = False
tests_total += 1
if all_reach_zero:
    tests_passed += 1
    print("  PASS: All crystallizations reach I = 0 (prime)")
else:
    print("  FAIL: Some crystallization doesn't reach prime")

# Test 5: Total energy equals sum of log(prime) contributions
print("\n[TEST 5] Total energy = Sum of a_p * log(p)")
test_n = 360  # 2^3 * 3^2 * 5
expected = 3 * float(log(2)) + 2 * float(log(3)) + 1 * float(log(5))
actual = total_crystallization_energy(test_n)
tests_total += 1
if abs(expected - actual) < 0.001:
    tests_passed += 1
    print(f"  PASS: E(360) = {actual:.4f} approx {expected:.4f}")
else:
    print(f"  FAIL: E(360) = {actual:.4f} != {expected:.4f}")

# Test 6: Imperfection distribution peaks at low values
print("\n[TEST 6] Most numbers have low imperfection (distribution check)")
dist = imperfection_distribution(1000)
low_imp = sum(dist.get(i, 0) for i in range(4))  # I = 0, 1, 2, 3
high_imp = sum(dist.get(i, 0) for i in range(4, 20))
tests_total += 1
if low_imp > high_imp:
    tests_passed += 1
    print(f"  PASS: Low imperfection ({low_imp}) > High imperfection ({high_imp})")
else:
    print(f"  FAIL: Low imperfection ({low_imp}) <= High imperfection ({high_imp})")

print("\n" + "=" * 70)
print(f"FINAL RESULT: {tests_passed}/{tests_total} tests passed")
print("=" * 70)

if tests_passed == tests_total:
    print("\n[OK] All crystallization dynamics tests PASSED")
    print("  The formalization is mathematically consistent.")
else:
    print(f"\n[!!] {tests_total - tests_passed} test(s) FAILED")
    print("  Review the failing tests above.")

# =============================================================================
# PART 7: KEY FORMULAS SUMMARY
# =============================================================================

print("\n" + "=" * 70)
print("KEY FORMULAS SUMMARY")
print("=" * 70)

print("""
IMPERFECTION MEASURE:
    I(n) = Omega(n) - 1
    where Omega(n) = total prime factors with multiplicity

ALMOST-PRIME CLASSIFICATION:
    P_k = {n : Omega(n) = k}
    Prime = P_1, Semiprime = P_2, etc.

CRYSTALLIZATION EFFORT:
    C(n) = Omega(n) = number of factorization steps to reach primes

CRYSTALLIZATION ENERGY:
    E(n) = Sum of a_p * log(p)  for n = Product of p^a_p
    (sum over prime factors with multiplicity)

DECAY DYNAMICS CONJECTURE:
    I(t) ~ I_0 / ln(t)
    (matches Prime Number Theorem form)

SCALE HIERARCHY:
    Heat death:  Single P_2 crystallizing -> minimal energy
    Black hole:  Massive composite -> enormous energy, large primes revealed
""")
