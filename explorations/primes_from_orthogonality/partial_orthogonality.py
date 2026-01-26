"""
Partial Orthogonality: Measuring "How Close to Prime"

Hypothesis: Instead of binary orthogonality (coprime or not),
we can measure a CONTINUOUS degree of orthogonality.

Numbers that are "more orthogonal" to the existing prime basis
should be closer to being prime themselves.
"""

import numpy as np
from math import gcd, log, sqrt, cos, acos
from typing import List, Tuple
import sympy

# =============================================================================
# Part 1: Continuous Orthogonality Measures
# =============================================================================

def prime_signature(n: int, primes: List[int]) -> np.ndarray:
    """Prime signature vector of n."""
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

    return np.array(signature, dtype=float)


def angle_to_basis(n: int, primes: List[int]) -> float:
    """
    Compute the angle between n's signature and the prime basis subspace.

    For a prime: angle = 90 degrees (orthogonal to all previous)
    For a composite: angle < 90 degrees (shares structure)
    """
    sig = prime_signature(n, primes)

    if np.sum(sig) == 0:
        return 90.0  # n=1 is orthogonal to everything

    # The "prime basis subspace" is spanned by the unit vectors e_1, ..., e_k
    # where k = number of known primes

    # For n, its signature projects onto some of these basis vectors
    # The angle to the subspace spanned by PREVIOUS primes tells us
    # how much n "sticks out" into a new dimension

    # Simple measure: what fraction of n's "mass" is in new dimensions?
    # If n is a known prime, all mass is in its own (new) dimension
    # If n is composite of known primes, all mass is in known dimensions

    norm = np.linalg.norm(sig)
    if norm == 0:
        return 90.0

    # Normalize
    unit_sig = sig / norm

    # For primes in our list: they have signature (0,...,0,1,0,...)
    # which is perfectly orthogonal to all previous basis vectors

    # For composites: signature has nonzero entries in existing dimensions

    # Measure: angle between sig and the subspace of previous dimensions
    # This is 90° - arccos(projection onto previous subspace / norm)

    return 90.0  # Placeholder - need better formulation


def orthogonality_score(n: int, known_primes: List[int]) -> float:
    """
    Compute how "orthogonal" n is to the known prime structure.

    Score in [0, 1]:
    - 1 = completely orthogonal (prime candidate)
    - 0 = completely non-orthogonal (highly composite)

    Method: For each known prime p, compute gcd(n, p^k) for increasing k.
    The more shared factors, the less orthogonal.
    """
    if n <= 1:
        return 0.0

    if len(known_primes) == 0:
        return 1.0

    # Count total "overlap" with known primes
    total_overlap = 0
    remaining = n

    for p in known_primes:
        overlap = 0
        while remaining % p == 0:
            remaining //= p
            overlap += 1
        total_overlap += overlap

    # If remaining > 1, n has a prime factor not in known_primes
    # This is the "new orthogonal component"

    if remaining > 1:
        # n has factors outside known primes - partially orthogonal
        # Score based on ratio of new vs old
        new_component = log(remaining) if remaining > 1 else 0
        old_component = log(n / remaining) if n > remaining else 0

        if new_component + old_component > 0:
            score = new_component / (new_component + old_component)
        else:
            score = 1.0
    else:
        # n is entirely composed of known primes - not orthogonal
        score = 0.0

    return score


def smoothness_score(n: int) -> float:
    """
    Smoothness = how "composite" a number is.
    Smooth numbers have only small prime factors.

    Returns a score where:
    - Primes have high score (not smooth)
    - Highly composite numbers have low score (very smooth)
    """
    if n <= 1:
        return 0.0

    factors = sympy.factorint(n)

    if len(factors) == 0:
        return 1.0

    # Largest prime factor
    largest_factor = max(factors.keys())

    # Score: largest_factor / n
    # For primes: largest_factor = n, so score = 1
    # For smooth numbers: largest_factor << n, so score is small

    return largest_factor / n


def omega_score(n: int) -> Tuple[int, int]:
    """
    Return (omega, Omega) where:
    - omega(n) = number of distinct prime factors
    - Omega(n) = total number of prime factors (with multiplicity)

    Primes have omega = Omega = 1.
    """
    if n <= 1:
        return (0, 0)

    factors = sympy.factorint(n)
    omega = len(factors)
    Omega = sum(factors.values())

    return (omega, Omega)


# =============================================================================
# Part 2: Analyzing the "Almost Orthogonal" Numbers
# =============================================================================

def analyze_near_primes():
    """
    For each prime gap, analyze the "orthogonality scores" of composites
    in the gap. Do numbers with higher scores cluster near primes?
    """
    primes = list(sympy.primerange(2, 100))

    print("Analyzing orthogonality in prime gaps:")
    print("=" * 70)

    for i in range(min(10, len(primes) - 1)):
        p = primes[i]
        p_next = primes[i + 1]
        gap = p_next - p

        if gap <= 1:
            continue

        print(f"\nGap: {p} -> {p_next} (size {gap})")

        # Analyze each composite in the gap
        known = primes[:i+1]

        for n in range(p + 1, p_next):
            score = orthogonality_score(n, known)
            smooth = smoothness_score(n)
            omega, Omega = omega_score(n)

            factors = sympy.factorint(n)
            factor_str = " * ".join(f"{p}^{e}" if e > 1 else str(p)
                                    for p, e in factors.items())

            print(f"  {n} = {factor_str}")
            print(f"      ortho_score={score:.3f}, smooth={smooth:.3f}, "
                  f"omega={omega}, Omega={Omega}")


# =============================================================================
# Part 3: The "Orthogonality Gradient" Near Primes
# =============================================================================

def orthogonality_gradient():
    """
    Hypothesis: There's an "orthogonality gradient" around primes.
    Numbers immediately before/after primes might show this.
    """
    primes = list(sympy.primerange(2, 200))
    prime_set = set(primes)

    print("\n\nOrthogonality Gradient Analysis:")
    print("=" * 70)

    # For each number, compute its orthogonality score relative to
    # all primes less than it

    scores = {}
    for n in range(2, 100):
        known = [p for p in primes if p < n]
        scores[n] = orthogonality_score(n, known)

    print("\nOrthogonality scores (higher = more prime-like):")
    print("n   | score | prime? | factors")
    print("-" * 50)

    for n in range(2, 50):
        score = scores[n]
        is_prime = n in prime_set
        factors = sympy.factorint(n)
        factor_str = " * ".join(f"{p}^{e}" if e > 1 else str(p)
                                for p, e in factors.items())

        marker = "***" if is_prime else "   "
        print(f"{n:3d} | {score:.3f} | {marker} | {factor_str}")


# =============================================================================
# Part 4: The "Angle" Interpretation
# =============================================================================

def angle_analysis():
    """
    Think of each number as a vector in prime-space.
    The "angle" to the existing subspace might predict primeness.
    """
    primes = list(sympy.primerange(2, 50))

    print("\n\nAngle Analysis in Prime-Space:")
    print("=" * 70)

    print("""
In prime-signature space:
- Each prime p_k is a unit vector e_k = (0,...,0,1,0,...)
- Each composite is a linear combination: 12 = 2^2 * 3 -> (2,1,0,...)

The "angle" of a number n to the subspace of known primes tells us
how much of n is "new" vs "already explained".

For a new prime: 100% new (90 degrees to existing subspace)
For a composite: 0% new (lies within existing subspace)
For a number with new prime factor: somewhere in between
""")

    # For numbers up to 50, show their signatures and "angles"
    for n in range(2, 30):
        sig = prime_signature(n, primes)

        # Which dimensions are nonzero?
        nonzero_dims = [primes[i] for i, v in enumerate(sig) if v > 0]

        # Is this a prime?
        is_prime = sympy.isprime(n)

        # For primes, the signature is all zeros except in their own dimension
        # For composites, signature is nonzero in multiple or previous dimensions

        sig_str = [f"{int(v)}" for v in sig[:10]]  # First 10 dims

        marker = "PRIME" if is_prime else ""
        print(f"{n:3d}: sig=({','.join(sig_str)},...) dims={nonzero_dims} {marker}")


# =============================================================================
# Part 5: Predictive Power of Partial Orthogonality
# =============================================================================

def test_predictive_power():
    """
    Can we use orthogonality scores to PREDICT which numbers are prime?

    Method: For each n, compute orthogonality score using primes < sqrt(n).
    See if high scores correlate with primeness.
    """
    print("\n\nPredictive Power Test:")
    print("=" * 70)

    primes = list(sympy.primerange(2, 200))
    prime_set = set(primes)

    # For each n, we'll predict "likely prime" if orthogonality score is high
    true_positives = 0
    false_positives = 0
    true_negatives = 0
    false_negatives = 0

    threshold = 0.5  # Score above this = predict prime

    results = []

    for n in range(2, 100):
        # Use only primes up to sqrt(n) for prediction
        known = [p for p in primes if p <= sqrt(n)]

        if len(known) == 0:
            score = 1.0
        else:
            score = orthogonality_score(n, known)

        is_prime = n in prime_set
        predicted_prime = (score >= threshold)

        results.append((n, score, is_prime, predicted_prime))

        if is_prime and predicted_prime:
            true_positives += 1
        elif is_prime and not predicted_prime:
            false_negatives += 1
        elif not is_prime and predicted_prime:
            false_positives += 1
        else:
            true_negatives += 1

    print(f"Threshold: {threshold}")
    print(f"True Positives (correctly predicted prime): {true_positives}")
    print(f"False Positives (predicted prime, was composite): {false_positives}")
    print(f"True Negatives (correctly predicted composite): {true_negatives}")
    print(f"False Negatives (predicted composite, was prime): {false_negatives}")

    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0

    print(f"\nPrecision: {precision:.3f}")
    print(f"Recall: {recall:.3f}")

    # Show some examples
    print("\nExamples of predictions:")
    print("n   | score | actual | predicted | correct?")
    print("-" * 50)
    for n, score, actual, predicted in results[:30]:
        actual_str = "PRIME" if actual else "comp"
        pred_str = "PRIME" if predicted else "comp"
        correct = "YES" if actual == predicted else "NO"
        print(f"{n:3d} | {score:.3f} | {actual_str:5s} | {pred_str:5s}   | {correct}")


# =============================================================================
# Part 6: The Perspective Connection
# =============================================================================

def perspective_connection():
    """
    The user's insight: "imperfectly orthogonal dimensions" from "perspective"

    In perspective cosmology:
    - Perfect observation = perfect orthogonality
    - Imperfect observation = partial overlap

    For primes:
    - A prime is a "perfectly new" direction (pure orthogonality)
    - A composite is a "blurred" combination of existing directions

    The question: Does the DEGREE of blur predict structure?
    """
    print("\n\nPerspective Connection:")
    print("=" * 70)

    print("""
CONJECTURE: Prime numbers emerge where "perspective" is maximally sharp.

In the perspective framework:
- Observation creates distinction
- Imperfect observation creates partial overlap
- Numbers are "views" of the multiplicative structure

Primes = perspectives that see something COMPLETELY NEW
Composites = perspectives that see combinations of known things

The "almost orthogonal" composites (like semiprimes p*q) are
perspectives that ALMOST see something new, but not quite.

This might explain:
- Why twin primes exist (adjacent "sharp" perspectives)
- Why prime gaps grow (harder to find new orthogonal directions)
- Why composites cluster in patterns (blur from known directions)
""")


# =============================================================================
# Main
# =============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("PARTIAL ORTHOGONALITY: MEASURING 'CLOSENESS TO PRIME'")
    print("=" * 70)

    analyze_near_primes()
    orthogonality_gradient()
    angle_analysis()
    test_predictive_power()
    perspective_connection()

    print("\n" + "=" * 70)
    print("KEY INSIGHT:")
    print("=" * 70)
    print("""
The degree of orthogonality IS a continuous measure.

- Primes: 100% orthogonal to previous structure
- Semiprimes (p*q with new p or q): partially orthogonal
- Smooth numbers: 0% orthogonal (entirely in known subspace)

This suggests a "spectral" view: instead of binary prime/composite,
there's a GRADIENT of "how much new information" each number contains.

The prediction challenge: Can we compute "degree of orthogonality"
WITHOUT knowing which primes exist? That would require understanding
the GEOMETRY of where orthogonality must break down.
""")
