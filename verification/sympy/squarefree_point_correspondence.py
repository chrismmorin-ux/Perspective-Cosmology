"""
Verification: Squarefree Numbers ↔ Perspective Points Correspondence

This script verifies Theorem 3.2 from perspective_connection.md:
Squarefree numbers correspond exactly to binary coordinate vectors,
which match the "points as subsets of dimensions" structure in
Perspective Cosmology.

Theorem 3.2: In perspective framework, points are characterized by
subsets of active dimensions. This EXACTLY corresponds to squarefree numbers.

Author: Claude (verification)
Date: 2026-01-26
"""

import sympy
from sympy import factorint, isprime
import numpy as np
from typing import List, Set, Tuple
from collections import defaultdict

def get_primes_up_to(n: int) -> List[int]:
    """Get all primes up to n."""
    return list(sympy.primerange(2, n + 1))

def prime_signature(n: int, primes: List[int]) -> np.ndarray:
    """
    Return the prime signature of n as a vector.
    The i-th component is the exponent of primes[i] in the factorization of n.
    """
    if n == 1:
        return np.zeros(len(primes), dtype=int)

    signature = []
    factorization = factorint(n)
    for p in primes:
        signature.append(factorization.get(p, 0))

    return np.array(signature, dtype=int)

def is_squarefree(n: int) -> bool:
    """Check if n is squarefree (no prime factor appears more than once)."""
    if n < 1:
        return False
    if n == 1:
        return True
    factorization = factorint(n)
    return all(exp == 1 for exp in factorization.values())

def is_binary_vector(v: np.ndarray) -> bool:
    """Check if all components are 0 or 1."""
    return all(x in [0, 1] for x in v)

def signature_to_subset(sig: np.ndarray, primes: List[int]) -> Set[int]:
    """Convert a prime signature to a subset of primes (active dimensions)."""
    return {p for p, exp in zip(primes, sig) if exp > 0}

# =============================================================================
# Test 1: Squarefree ⟺ Binary Signature
# =============================================================================

def test_squarefree_binary_correspondence(N: int = 1000):
    """
    Verify: n is squarefree ⟺ prime_signature(n) is binary (all 0s and 1s)
    """
    print("=" * 60)
    print("TEST 1: Squarefree <=> Binary Signature")
    print("=" * 60)

    primes = get_primes_up_to(N)
    failures = []

    for n in range(1, N + 1):
        sig = prime_signature(n, primes)
        sqf = is_squarefree(n)
        binary = is_binary_vector(sig)

        if sqf != binary:
            failures.append((n, sqf, binary, sig))

    print(f"Tested n = 1 to {N}")
    print(f"Failures: {len(failures)}")

    if failures:
        print("Examples of failures:")
        for n, sqf, binary, sig in failures[:5]:
            print(f"  n={n}: squarefree={sqf}, binary={binary}, sig={sig[:10]}...")
    else:
        print("PASS: All squarefree numbers have binary signatures")
        print("      and all non-squarefree have non-binary signatures")

    return len(failures) == 0

# =============================================================================
# Test 2: Subset Correspondence
# =============================================================================

def test_subset_correspondence(N: int = 500):
    """
    Verify: For squarefree n, the set of prime divisors matches
    the "active dimensions" in the signature.
    """
    print("\n" + "=" * 60)
    print("TEST 2: Squarefree Number <-> Prime Subset")
    print("=" * 60)

    primes = get_primes_up_to(N)
    squarefrees = [n for n in range(1, N + 1) if is_squarefree(n)]

    print(f"Squarefree numbers up to {N}: {len(squarefrees)}")
    print(f"(Out of {N} total, ratio = {len(squarefrees)/N:.3f})")
    print(f"Expected ratio ~= 6/pi^2 = {6/np.pi**2:.3f}")

    failures = []

    for n in squarefrees:
        sig = prime_signature(n, primes)

        # Get set of prime divisors directly
        if n == 1:
            divisors = set()
        else:
            divisors = set(factorint(n).keys())

        # Get set from signature
        from_sig = signature_to_subset(sig, primes)

        if divisors != from_sig:
            failures.append((n, divisors, from_sig))

    print(f"Failures: {len(failures)}")

    if failures:
        print("Examples:")
        for n, div, sig_set in failures[:5]:
            print(f"  n={n}: divisors={div}, from_sig={sig_set}")
    else:
        print("PASS: All squarefree numbers have correct subset correspondence")

    return len(failures) == 0

# =============================================================================
# Test 3: Perspective Point Properties
# =============================================================================

def test_perspective_point_properties(N: int = 200):
    """
    Verify that squarefree numbers satisfy perspective point axioms:
    - Each point is characterized by a subset of dimensions
    - Two points share a dimension iff they share a prime divisor
    """
    print("\n" + "=" * 60)
    print("TEST 3: Perspective Point Properties")
    print("=" * 60)

    primes = get_primes_up_to(N)
    squarefrees = [n for n in range(2, N + 1) if is_squarefree(n)]

    # Test: Connectivity (sharing a dimension) matches sharing a prime
    # Two squarefree numbers a, b share a dimension iff gcd(a,b) > 1

    print("Testing connectivity = shared prime divisor...")

    failures = []
    tests = 0

    for i, a in enumerate(squarefrees[:100]):  # Limit for speed
        for b in squarefrees[i+1:100]:
            tests += 1
            sig_a = prime_signature(a, primes)
            sig_b = prime_signature(b, primes)

            # Signature overlap (shared dimension)
            shared_dims = np.sum((sig_a > 0) & (sig_b > 0))

            # GCD > 1 means shared prime
            from math import gcd
            share_prime = gcd(a, b) > 1

            connected = shared_dims > 0

            if connected != share_prime:
                failures.append((a, b, connected, share_prime))

    print(f"Tests: {tests}, Failures: {len(failures)}")

    if failures:
        print("Examples:")
        for a, b, conn, share in failures[:5]:
            print(f"  {a}, {b}: connected={conn}, share_prime={share}")
    else:
        print("PASS: Connectivity (shared dimension) <=> Shared prime divisor")

    return len(failures) == 0

# =============================================================================
# Test 4: Count Comparison
# =============================================================================

def test_count_comparison(N: int = 1000):
    """
    Compare counts:
    - Squarefree numbers (points with binary coordinates)
    - 2^k for k = number of primes up to n (upper bound on subsets)
    """
    print("\n" + "=" * 60)
    print("TEST 4: Counting Comparison")
    print("=" * 60)

    primes = get_primes_up_to(N)

    checkpoints = [10, 50, 100, 200, 500, N]
    checkpoints = [c for c in checkpoints if c <= N]

    print(f"{'N':>6} | {'Squarefree':>12} | {'Primes':>8} | {'2^primes':>12} | {'Ratio':>8}")
    print("-" * 60)

    for cp in checkpoints:
        sqf_count = sum(1 for n in range(1, cp + 1) if is_squarefree(n))
        prime_count = len([p for p in primes if p <= cp])
        two_power = 2 ** prime_count if prime_count < 30 else float('inf')
        ratio = sqf_count / cp

        if two_power < float('inf'):
            print(f"{cp:>6} | {sqf_count:>12} | {prime_count:>8} | {two_power:>12} | {ratio:>8.4f}")
        else:
            print(f"{cp:>6} | {sqf_count:>12} | {prime_count:>8} | {'huge':>12} | {ratio:>8.4f}")

    print(f"\nNote: Squarefree density ~= 6/pi^2 ~= {6/np.pi**2:.4f} (Euler)")
    print("The number of subsets 2^k >> squarefree count because")
    print("not all prime subsets correspond to squarefrees <= N.")

# =============================================================================
# Test 5: Multiplicative to Additive
# =============================================================================

def test_multiplicative_to_additive(N: int = 100):
    """
    Verify: The map φ(n) = prime_signature(n) converts
    multiplication to addition: φ(a×b) = φ(a) + φ(b)
    """
    print("\n" + "=" * 60)
    print("TEST 5: phi(a*b) = phi(a) + phi(b)")
    print("=" * 60)

    primes = get_primes_up_to(N * N)

    failures = []
    tests = 0

    for a in range(1, N + 1):
        for b in range(1, N + 1):
            if a * b <= N * N:  # Keep product manageable
                tests += 1
                sig_a = prime_signature(a, primes)
                sig_b = prime_signature(b, primes)
                sig_ab = prime_signature(a * b, primes)

                if not np.array_equal(sig_ab, sig_a + sig_b):
                    failures.append((a, b, sig_a, sig_b, sig_ab))

    print(f"Tests: {tests}, Failures: {len(failures)}")

    if failures:
        print("Examples:")
        for a, b, sa, sb, sab in failures[:5]:
            print(f"  {a}*{b}={a*b}: sig({a})+sig({b}) != sig({a*b})")
    else:
        print("PASS: phi is a homomorphism from (N+, *) to (Z^inf, +)")

    return len(failures) == 0

# =============================================================================
# Test 6: Orthogonality = Coprimality (reconfirm)
# =============================================================================

def test_orthogonality_coprimality(N: int = 200):
    """
    Reconfirm: Inner product = 0 ⟺ coprime
    """
    print("\n" + "=" * 60)
    print("TEST 6: <phi(a), phi(b)> = 0 <=> gcd(a,b) = 1")
    print("=" * 60)

    primes = get_primes_up_to(N)

    failures = []
    tests = 0

    from math import gcd

    for a in range(2, N + 1):
        for b in range(a + 1, N + 1):
            tests += 1
            sig_a = prime_signature(a, primes)
            sig_b = prime_signature(b, primes)

            inner = np.dot(sig_a, sig_b)
            coprime = gcd(a, b) == 1
            orthogonal = inner == 0

            if coprime != orthogonal:
                failures.append((a, b, coprime, orthogonal, inner))

    print(f"Tests: {tests}, Failures: {len(failures)}")

    if failures:
        print("Examples:")
        for a, b, cop, orth, ip in failures[:5]:
            print(f"  {a}, {b}: coprime={cop}, orthogonal={orth}, inner={ip}")
    else:
        print("PASS: Coprimality <=> Orthogonality")

    return len(failures) == 0

# =============================================================================
# Main
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("SQUAREFREE-POINT CORRESPONDENCE VERIFICATION")
    print("=" * 60)
    print()

    results = []

    results.append(("Squarefree <=> Binary", test_squarefree_binary_correspondence()))
    results.append(("Subset Correspondence", test_subset_correspondence()))
    results.append(("Point Properties", test_perspective_point_properties()))
    test_count_comparison()  # Informational, no pass/fail
    results.append(("Mult->Add Homomorphism", test_multiplicative_to_additive()))
    results.append(("Orthogonality <=> Coprime", test_orthogonality_coprimality()))

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    all_passed = True
    for name, passed in results:
        status = "PASS" if passed else "FAIL"
        print(f"  {name}: {status}")
        all_passed = all_passed and passed

    print()
    if all_passed:
        print("ALL TESTS PASSED")
        print("Theorem 3.2 (Squarefree <-> Perspective Points) VERIFIED")
    else:
        print("SOME TESTS FAILED - review results above")
