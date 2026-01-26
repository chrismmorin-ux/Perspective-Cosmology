"""
Exploring Prime Numbers as Orthogonality Structure

This script investigates the connection between:
- Prime factorization as coordinates in infinite-dimensional space
- Orthogonality of coprime numbers
- The "half-dimension" spectral behavior of primes
"""

import numpy as np
from math import gcd, log, sqrt
from collections import defaultdict
from typing import List, Tuple, Dict
import sympy

# =============================================================================
# Part 1: Prime Signature Vectors
# =============================================================================

def prime_signature(n: int, primes: List[int]) -> np.ndarray:
    """
    Return the prime signature of n as a vector.
    The i-th component is the exponent of primes[i] in the factorization of n.
    """
    if n == 1:
        return np.zeros(len(primes))

    signature = []
    remaining = n
    for p in primes:
        exp = 0
        while remaining % p == 0:
            remaining //= p
            exp += 1
        signature.append(exp)

    return np.array(signature)


def inner_product(sig1: np.ndarray, sig2: np.ndarray) -> float:
    """Inner product of two prime signatures."""
    return np.dot(sig1, sig2)


def are_coprime(a: int, b: int) -> bool:
    """Check if two integers are coprime."""
    return gcd(a, b) == 1


def test_orthogonality_coprimality():
    """
    Verify: Two numbers are coprime iff their signature vectors are orthogonal.
    """
    primes = list(sympy.primerange(2, 100))
    test_range = range(2, 200)

    print("Testing orthogonality <-> coprimality correspondence...")

    failures = 0
    tests = 0

    for a in test_range:
        for b in test_range:
            if a < b:
                sig_a = prime_signature(a, primes)
                sig_b = prime_signature(b, primes)
                ip = inner_product(sig_a, sig_b)
                coprime = are_coprime(a, b)
                orthogonal = (ip == 0)

                if coprime != orthogonal:
                    print(f"FAILURE: {a}, {b}: coprime={coprime}, orthogonal={orthogonal}")
                    failures += 1
                tests += 1

    print(f"Tests: {tests}, Failures: {failures}")
    print("PASS" if failures == 0 else "FAIL")
    return failures == 0


# =============================================================================
# Part 2: Orthogonality Statistics
# =============================================================================

def orthogonality_statistics(N: int):
    """
    Analyze how orthogonality is distributed among numbers up to N.
    """
    primes = list(sympy.primerange(2, N + 1))

    # For each number, count how many smaller numbers it's orthogonal to
    orthogonal_counts = {}

    for n in range(2, N + 1):
        count = sum(1 for k in range(2, n) if are_coprime(n, k))
        orthogonal_counts[n] = count

    # Primes should be orthogonal to many numbers (all non-multiples)
    prime_set = set(primes)

    print(f"\nOrthogonality statistics for n = 2 to {N}:")
    print("-" * 50)

    # Compare primes vs composites
    prime_orthogonal = [orthogonal_counts[p] for p in primes if p <= N and p >= 2]
    composite_orthogonal = [orthogonal_counts[n] for n in range(2, N+1) if n not in prime_set]

    if prime_orthogonal:
        avg_prime = sum(prime_orthogonal) / len(prime_orthogonal)
        print(f"Average orthogonal neighbors for primes: {avg_prime:.2f}")

    if composite_orthogonal:
        avg_composite = sum(composite_orthogonal) / len(composite_orthogonal)
        print(f"Average orthogonal neighbors for composites: {avg_composite:.2f}")

    # Expected by Euler's totient: phi(n) - 1 for coprime counts below n
    print(f"\nTheoretical: phi(n) counts coprimes from 1 to n")
    for p in primes[:5]:
        if p <= N:
            phi = sympy.totient(p)
            actual = orthogonal_counts.get(p, 0)
            print(f"  Prime {p}: phi({p}) - 1 = {phi - 1}, actual orthogonal below = {actual}")


# =============================================================================
# Part 3: Distance in Prime-Space
# =============================================================================

def prime_space_distance(a: int, b: int, primes: List[int], norm='l2') -> float:
    """
    Compute distance between a and b in prime signature space.
    """
    sig_a = prime_signature(a, primes)
    sig_b = prime_signature(b, primes)
    diff = sig_a - sig_b

    if norm == 'l2':
        return np.sqrt(np.sum(diff**2))
    elif norm == 'l1':
        return np.sum(np.abs(diff))
    elif norm == 'linf':
        return np.max(np.abs(diff))
    else:
        raise ValueError(f"Unknown norm: {norm}")


def analyze_prime_distances(N: int):
    """
    Analyze distances between consecutive primes in prime-space.
    """
    primes = list(sympy.primerange(2, N + 1))

    if len(primes) < 2:
        print("Need more primes")
        return

    print(f"\nPrime-space distances for primes up to {N}:")
    print("-" * 50)

    # All primes have signature (0, 0, ..., 1, ..., 0) with 1 in their own position
    # So distance between any two distinct primes is sqrt(2)

    print("Key insight: In prime signature space, ALL primes are at distance sqrt(2) from each other!")
    print(f"This is because each prime has signature (0,...,0,1,0,...) with 1 in its own dimension.")
    print(f"Distance = sqrt(1^2 + 1^2) = sqrt(2) = {sqrt(2):.4f}")

    # Verify
    for i in range(min(5, len(primes) - 1)):
        d = prime_space_distance(primes[i], primes[i+1], primes)
        print(f"  d({primes[i]}, {primes[i+1]}) = {d:.4f}")


# =============================================================================
# Part 4: The "Number Trail" and Path Length
# =============================================================================

def number_trail_analysis(N: int):
    """
    Analyze the "number trail" - the path through prime-space visiting
    integers in order.

    Key finding from literature: L_inf(N) grows linearly in N.
    """
    primes = list(sympy.primerange(2, N + 1))

    print(f"\nNumber trail analysis up to {N}:")
    print("-" * 50)

    total_length_l2 = 0
    total_length_l1 = 0
    total_length_linf = 0

    prev_sig = prime_signature(1, primes)

    checkpoints = [10, 100, 500, 1000, N] if N >= 1000 else [10, 50, 100, N]

    for n in range(2, N + 1):
        curr_sig = prime_signature(n, primes)
        diff = curr_sig - prev_sig

        total_length_l2 += np.sqrt(np.sum(diff**2))
        total_length_l1 += np.sum(np.abs(diff))
        total_length_linf += np.max(np.abs(diff)) if np.any(diff != 0) else 0

        if n in checkpoints:
            print(f"  n={n}: L_2={total_length_l2:.2f}, L_1={total_length_l1:.2f}, L_inf={total_length_linf:.2f}")
            print(f"         L_inf/n = {total_length_linf/n:.4f}")

        prev_sig = curr_sig

    print(f"\nLinear growth check: L_inf({N})/N = {total_length_linf/N:.4f}")
    print("(Literature suggests this approaches a constant as N -> inf)")


# =============================================================================
# Part 5: Effective Dimension
# =============================================================================

def estimate_effective_dimension(N: int, sample_size: int = 1000):
    """
    Estimate the "effective dimension" of the prime distribution.

    Use the box-counting method: how does the number of occupied
    "boxes" scale with box size?
    """
    primes = list(sympy.primerange(2, N + 1))
    num_primes = len(primes)

    print(f"\nEffective dimension analysis:")
    print("-" * 50)

    # Simple approach: look at how prime count scales with N
    # pi(N) ~ N/ln(N) by prime number theorem
    # In d dimensions with uniform distribution, count ~ N^(1/d)
    # But primes have density ~ 1/ln(N), not constant

    # A different approach: look at correlation dimension
    # Count pairs within distance r, see how it scales

    # For now, just report the scaling
    checkpoints = [100, 500, 1000, 5000, 10000, N]
    checkpoints = [c for c in checkpoints if c <= N]

    print("Prime count scaling:")
    print("  N        pi(N)      N/ln(N)     ratio")

    for checkpoint in checkpoints:
        pi_n = len([p for p in primes if p <= checkpoint])
        expected = checkpoint / log(checkpoint) if checkpoint > 1 else 0
        ratio = pi_n / expected if expected > 0 else 0
        print(f"  {checkpoint:6d}   {pi_n:6d}    {expected:8.1f}    {ratio:.4f}")

    print("\nThe primes don't fill space uniformly - their density decreases.")
    print("This is related to the 'half-dimension' finding in spectral geometry.")


# =============================================================================
# Part 6: Orthogonality "Gaps"
# =============================================================================

def orthogonality_gaps(N: int):
    """
    Analyze gaps between consecutive numbers that are mutually orthogonal
    to some reference number.
    """
    primes = list(sympy.primerange(2, min(20, N)))

    print(f"\nOrthogonality gaps analysis:")
    print("-" * 50)

    for p in primes[:5]:
        # Find numbers orthogonal to p (i.e., not divisible by p)
        orthogonal_to_p = [n for n in range(2, N + 1) if n % p != 0]

        # Compute gaps
        gaps = [orthogonal_to_p[i+1] - orthogonal_to_p[i]
                for i in range(len(orthogonal_to_p) - 1)]

        if gaps:
            avg_gap = sum(gaps) / len(gaps)
            max_gap = max(gaps)
            print(f"Numbers orthogonal to {p}: avg gap = {avg_gap:.2f}, max gap = {max_gap}")


# =============================================================================
# Main
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("PRIMES AS ORTHOGONALITY STRUCTURE - COMPUTATIONAL EXPLORATION")
    print("=" * 60)

    # Test the fundamental correspondence
    print("\n" + "=" * 60)
    print("TEST 1: Orthogonality <-> Coprimality")
    print("=" * 60)
    test_orthogonality_coprimality()

    # Orthogonality statistics
    print("\n" + "=" * 60)
    print("TEST 2: Orthogonality Statistics")
    print("=" * 60)
    orthogonality_statistics(100)

    # Prime-space distances
    print("\n" + "=" * 60)
    print("TEST 3: Prime-Space Distances")
    print("=" * 60)
    analyze_prime_distances(50)

    # Number trail
    print("\n" + "=" * 60)
    print("TEST 4: Number Trail Path Length")
    print("=" * 60)
    number_trail_analysis(1000)

    # Effective dimension
    print("\n" + "=" * 60)
    print("TEST 5: Effective Dimension")
    print("=" * 60)
    estimate_effective_dimension(10000)

    # Orthogonality gaps
    print("\n" + "=" * 60)
    print("TEST 6: Orthogonality Gaps")
    print("=" * 60)
    orthogonality_gaps(100)

    print("\n" + "=" * 60)
    print("EXPLORATION COMPLETE")
    print("=" * 60)
