"""
Exploring: Can we derive prime positions from orthogonality constraints?

The question: Given primes p_1, ..., p_n, what GEOMETRIC property
determines where p_{n+1} must land?

Hypothesis: There's a "pressure" from the orthogonal structure that
forces the next prime to appear at a specific location.
"""

import numpy as np
from math import gcd, log, sqrt, prod
from typing import List, Set
import sympy

# =============================================================================
# Part 1: The "Orthogonal Gap" - Where CAN the next prime land?
# =============================================================================

def numbers_orthogonal_to_all(primes: List[int], up_to: int) -> List[int]:
    """
    Find all numbers up to `up_to` that are orthogonal to ALL given primes.
    These are the candidates for the next prime.
    """
    result = []
    for n in range(2, up_to + 1):
        if all(gcd(n, p) == 1 for p in primes):
            result.append(n)
    return result


def analyze_orthogonal_candidates():
    """
    For each prime p_n, analyze the "orthogonal candidates" - numbers
    that could theoretically be the next prime based on orthogonality alone.
    """
    primes = list(sympy.primerange(2, 100))

    print("Analyzing orthogonal candidate space for first 10 primes:")
    print("=" * 70)

    for i in range(1, min(10, len(primes))):
        current_primes = primes[:i]
        next_prime = primes[i]

        # Find candidates: numbers orthogonal to all current primes
        # These are numbers not divisible by any of the current primes
        primorial = prod(current_primes)

        # The candidates in range [2, next_prime] orthogonal to current primes
        candidates = numbers_orthogonal_to_all(current_primes, next_prime + 10)

        # The actual next prime should be the minimum candidate > current max
        min_candidate = min(c for c in candidates if c > max(current_primes))

        print(f"\nPrimes so far: {current_primes}")
        print(f"  Primorial (product): {primorial}")
        print(f"  Candidates orthogonal to all: {candidates[:15]}...")
        print(f"  Smallest new candidate: {min_candidate}")
        print(f"  Actual next prime: {next_prime}")
        print(f"  Match: {'YES' if min_candidate == next_prime else 'NO'}")


# =============================================================================
# Part 2: The Primorial Structure - Residue Classes
# =============================================================================

def analyze_residue_structure():
    """
    The numbers orthogonal to primes {p_1, ..., p_n} form residue classes
    mod the primorial P_n = p_1 * ... * p_n.

    By Chinese Remainder Theorem, there are exactly phi(P_n) such classes,
    where phi is Euler's totient.

    The next prime must land in one of these "orthogonal slots".
    """
    print("\n\nResidue Class Structure (Orthogonal Slots):")
    print("=" * 70)

    primes = list(sympy.primerange(2, 30))

    for i in range(1, min(6, len(primes))):
        current_primes = primes[:i]
        primorial = prod(current_primes)

        # Find residue classes coprime to primorial
        coprime_residues = [r for r in range(1, primorial + 1)
                          if gcd(r, primorial) == 1]

        phi = len(coprime_residues)
        expected_phi = sympy.totient(primorial)

        print(f"\nPrimes: {current_primes}")
        print(f"  Primorial P_{i} = {primorial}")
        print(f"  phi(P_{i}) = {phi} (verified: {phi == expected_phi})")
        print(f"  Orthogonal residue classes mod {primorial}: {coprime_residues}")
        print(f"  Density of orthogonal slots: {phi}/{primorial} = {phi/primorial:.4f}")

        # This density approaches 0 as we add more primes
        # Product formula: prod((p-1)/p) for p in primes
        theoretical_density = prod((p-1)/p for p in current_primes)
        print(f"  Theoretical density prod((p-1)/p): {theoretical_density:.4f}")


# =============================================================================
# Part 3: The "Dimensional Pressure" Hypothesis
# =============================================================================

def dimensional_pressure():
    """
    Hypothesis: The "pressure" to create a new orthogonal dimension
    increases as we move away from the last prime.

    Can we quantify this pressure and predict where it "breaks through"
    to create the next prime?
    """
    print("\n\nDimensional Pressure Analysis:")
    print("=" * 70)

    primes = list(sympy.primerange(2, 100))

    print("\nFor each prime gap, analyze the 'pressure':")
    print("Gap  |  p_n  | p_{n+1} | gap | composites in gap | 'pressure'")
    print("-" * 70)

    for i in range(min(15, len(primes) - 1)):
        p_n = primes[i]
        p_next = primes[i + 1]
        gap = p_next - p_n

        # Count composites in the gap
        composites = gap - 1

        # "Pressure" = how many orthogonal slots were "used up" by composites
        # before finding the next prime

        # A rough measure: gap / log(p_n) compared to expected
        # By PNT, average gap ~ log(p_n)
        expected_gap = log(p_n) if p_n > 1 else 1
        pressure = gap / expected_gap

        print(f" {i+1:2d}  |  {p_n:3d}  |   {p_next:3d}   |  {gap:2d} |        {composites:2d}        |   {pressure:.2f}")

    print("\n'Pressure' > 1 means gap larger than expected (dimension 'resisted')")
    print("'Pressure' < 1 means gap smaller than expected (dimension 'eager')")


# =============================================================================
# Part 4: The Orthogonal Constraint Equation
# =============================================================================

def orthogonal_constraint():
    """
    Attempt to formulate the constraint that determines prime positions.

    Given primes p_1, ..., p_n, the next prime p_{n+1} is:
    - The smallest m > p_n such that gcd(m, p_i) = 1 for all i
    - Equivalently: m is in a coprime residue class mod P_n AND is prime

    The second condition (being prime) is what makes this hard.
    If we only required orthogonality to KNOWN primes, we'd get:
    p_{n+1} = smallest m > p_n with m mod p_i != 0 for all i <= n

    But this includes numbers like 25 (orthogonal to 2, 3) which isn't prime.
    """
    print("\n\nThe Orthogonality-Only Generator (what we'd get without primality):")
    print("=" * 70)

    # Generate "orthogonality-only" sequence
    # These are numbers that are coprime to all smaller members
    ortho_sequence = [2]

    n = 3
    while len(ortho_sequence) < 20:
        # Check if n is orthogonal to all current members
        if all(gcd(n, m) == 1 for m in ortho_sequence):
            ortho_sequence.append(n)
        n += 1

    primes = list(sympy.primerange(2, 100))[:20]

    print(f"Orthogonality-only sequence: {ortho_sequence}")
    print(f"Actual primes:               {primes}")
    print(f"Match: {ortho_sequence == primes}")

    # Where do they diverge?
    for i, (o, p) in enumerate(zip(ortho_sequence, primes)):
        if o != p:
            print(f"\nFirst divergence at position {i+1}: ortho={o}, prime={p}")
            break
    else:
        print("\nNo divergence in first 20 terms!")


# =============================================================================
# Part 5: The Self-Referential Nature
# =============================================================================

def self_reference_analysis():
    """
    Key insight: The orthogonality-only generator DOES produce primes!

    Why? Because if n is orthogonal to all smaller primes, and n is composite,
    then n = a * b where a, b > 1. But then a (or its prime factors) would
    be in the sequence and n wouldn't be orthogonal to it.

    This is essentially a proof that orthogonality to all smaller primes
    IMPLIES primality!
    """
    print("\n\nSelf-Reference: Why Orthogonality Implies Primality")
    print("=" * 70)

    print("""
THEOREM: If n > 1 is orthogonal to all primes p < n, then n is prime.

PROOF:
  Suppose n is composite: n = a * b where 1 < a, b < n.
  Then a has a prime factor p <= a < n.
  So p < n and p | n.
  This means gcd(n, p) = p != 1.
  So n is NOT orthogonal to p.
  Contradiction.

  Therefore n must be prime. QED.

COROLLARY: The orthogonality-only generator IS a prime generator!
""")

    # Verify computationally
    print("Verification: Generate first 100 primes using only orthogonality...")

    ortho_primes = [2]
    n = 3
    while len(ortho_primes) < 100:
        if all(gcd(n, p) == 1 for p in ortho_primes):
            ortho_primes.append(n)
        n += 1

    actual_primes = list(sympy.primerange(2, 600))[:100]

    match = ortho_primes == actual_primes
    print(f"Generated: {ortho_primes[:15]}...")
    print(f"Actual:    {actual_primes[:15]}...")
    print(f"Perfect match for 100 primes: {match}")

    if match:
        print("\n*** ORTHOGONALITY ALONE GENERATES PRIMES ***")


# =============================================================================
# Part 6: The Dimensional Generator
# =============================================================================

def dimensional_generator(n: int) -> List[int]:
    """
    Generate first n primes using ONLY the orthogonality principle:

    "The next prime is the smallest number orthogonal to all previous primes."

    This is equivalent to the Sieve of Eratosthenes, but framed dimensionally.
    """
    if n < 1:
        return []

    primes = [2]
    candidate = 3

    while len(primes) < n:
        # Check orthogonality to all known primes
        is_orthogonal = all(candidate % p != 0 for p in primes)

        if is_orthogonal:
            primes.append(candidate)

        candidate += 1

    return primes


def demonstrate_dimensional_generator():
    """Show the dimensional generator in action."""
    print("\n\nThe Dimensional Prime Generator:")
    print("=" * 70)

    print("""
ALGORITHM: DimensionalPrimeGenerator(n)
  primes = [2]  # First orthogonal dimension
  candidate = 3
  while |primes| < n:
    if candidate is orthogonal to all primes:
      primes.append(candidate)  # New dimension found
    candidate += 1
  return primes

This is the Sieve of Eratosthenes, reframed:
- We're not "eliminating composites"
- We're "finding where the next orthogonal dimension must land"
""")

    primes = dimensional_generator(25)
    print(f"First 25 primes via dimensional generation: {primes}")


# =============================================================================
# Main
# =============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("DIMENSIONAL PRIME GENERATOR - EXPLORING ORTHOGONALITY AS CAUSE")
    print("=" * 70)

    analyze_orthogonal_candidates()
    analyze_residue_structure()
    dimensional_pressure()
    orthogonal_constraint()
    self_reference_analysis()
    demonstrate_dimensional_generator()

    print("\n" + "=" * 70)
    print("KEY FINDING:")
    print("=" * 70)
    print("""
Orthogonality to all previous primes IMPLIES primality.

This means the dimensional/orthogonality framing isn't just descriptive -
it's a GENERATOR. You don't need to "test for primality" separately.

The algorithm "find smallest number orthogonal to known primes"
IS a complete prime generator.

However, this is computationally equivalent to trial division / sieving.
The question remains: can the GEOMETRIC structure give us a shortcut?
""")
