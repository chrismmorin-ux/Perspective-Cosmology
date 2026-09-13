"""
Investigation: The Half-Dimension and Perspective Partiality

The primes show spectral dimension ~0.5. Does this connect to
the perspective axiom P1 (partiality: no perspective sees everything)?

Key question: Is 0.5 dimension a signature of "partial perspective"?

Author: Claude (investigation)
Date: 2026-01-26
Status: SPECULATIVE - exploring potential connections
"""

import numpy as np
import sympy
from math import log, sqrt
from typing import List, Tuple

# =============================================================================
# Part 1: Measure Spectral Dimension of Primes
# =============================================================================

def prime_spectral_dimension(N: int = 10000) -> Tuple[float, float]:
    """
    Estimate the spectral/box-counting dimension of primes up to N.

    Method: For different box sizes epsilon, count how many boxes
    contain at least one prime. Dimension d satisfies:
    N(epsilon) ~ epsilon^{-d}

    So: log(N(eps)) ~ -d * log(eps)
    """
    primes = list(sympy.primerange(2, N + 1))
    prime_set = set(primes)

    # Try different box sizes (powers of 2)
    box_sizes = [2**k for k in range(1, int(log(N, 2)))]
    box_sizes = [b for b in box_sizes if b < N // 4]

    log_eps = []
    log_count = []

    for eps in box_sizes:
        # Count boxes that contain at least one prime
        n_boxes = N // eps + 1
        occupied = 0
        for i in range(n_boxes):
            box_start = i * eps
            box_end = (i + 1) * eps
            # Check if any prime in [box_start, box_end)
            if any(box_start <= p < box_end for p in primes if p < box_end):
                occupied += 1

        if occupied > 0 and eps > 0:
            log_eps.append(log(eps))
            log_count.append(log(occupied))

    # Linear regression to find dimension using numpy
    if len(log_eps) < 3:
        return 0.0, 0.0

    log_eps_arr = np.array(log_eps)
    log_count_arr = np.array(log_count)

    # Fit line: log_count = slope * log_eps + intercept
    coeffs = np.polyfit(log_eps_arr, log_count_arr, 1)
    slope = coeffs[0]

    # Calculate R^2
    fitted = np.polyval(coeffs, log_eps_arr)
    ss_res = np.sum((log_count_arr - fitted) ** 2)
    ss_tot = np.sum((log_count_arr - np.mean(log_count_arr)) ** 2)
    r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0

    # Dimension is -slope (N ~ eps^{-d})
    dimension = -slope

    return dimension, r2

def analyze_prime_dimension():
    """
    Analyze prime spectral dimension for various N values.
    """
    print("=" * 60)
    print("ANALYSIS: Spectral Dimension of Primes")
    print("=" * 60)

    print("\nEstimating spectral dimension using box-counting method:")
    print(f"{'N':>10} | {'Dimension':>12} | {'R^2':>8}")
    print("-" * 40)

    for N in [1000, 5000, 10000, 50000, 100000]:
        dim, r2 = prime_spectral_dimension(N)
        print(f"{N:>10} | {dim:>12.4f} | {r2:>8.4f}")

    print("""
NOTE: The spectral dimension is expected to be close to 1 for primes
embedded in the integers (which form a 1D set). The "half dimension"
observation comes from more sophisticated spectral analysis of:
- Riemann zeta zeros (which cluster at Re(s) = 1/2)
- Random matrix eigenvalue statistics
- Correlation functions of prime gaps

Our simple box-counting doesn't capture this structure.
""")

# =============================================================================
# Part 2: The 1/2 Line and Riemann Hypothesis
# =============================================================================

def explain_critical_line():
    """
    Explain why "half" appears in prime number theory.
    """
    print("\n" + "=" * 60)
    print("THE CRITICAL LINE: Why 1/2?")
    print("=" * 60)

    print("""
The Riemann Hypothesis (unproven) states:
  All non-trivial zeros of zeta(s) have Re(s) = 1/2

This is the deepest conjecture in mathematics about primes.
If true, it implies primes are distributed as "regularly as possible."

WHY 1/2?

1. SYMMETRY ARGUMENT:
   The functional equation zeta(s) = X(s) * zeta(1-s)
   maps s <-> 1-s. The fixed line is Re(s) = 1/2.

2. PROBABILITY ARGUMENT:
   If primes were "random" with density 1/ln(n), their
   statistics would look like random matrix eigenvalues.
   These have a specific repulsion structure.

3. BALANCE ARGUMENT:
   At Re(s) = 1/2, there's a balance between
   the contribution from small primes and large primes.

THE PERSPECTIVE CONNECTION (SPECULATIVE):

If we interpret 1/2 as "half access":
- Full access (1) = complete perspective (impossible by P1)
- No access (0) = null perspective (impossible by P2)
- Half access (1/2) = balanced partial perspective

The critical line might represent the "natural" level of
information accessible from a generic perspective.

THIS IS HIGHLY SPECULATIVE. The Riemann Hypothesis is not
about perspective, and this connection is metaphorical.
""")

# =============================================================================
# Part 3: Partial Perspective Measure
# =============================================================================

def model_partial_perspective():
    """
    Model what "half perspective" might mean mathematically.
    """
    print("\n" + "=" * 60)
    print("MODELING: What is 'Half Perspective'?")
    print("=" * 60)

    print("""
In the perspective framework:
- dim(V_Crystal) = N (total dimensions)
- dim(V_pi) = n (accessible dimensions)
- "Partiality" = n/N < 1

If N -> infinity and n remains finite:
  n/N -> 0 (infinitesimal perspective)

If N -> infinity and n ~ sqrt(N):
  n/N -> 0 but n/sqrt(N) -> constant
  This is a "half-dimensional" perspective

INTERPRETATION:
The ~1/2 dimension might indicate:
  "Accessible information scales as sqrt(total information)"

This is reminiscent of:
- sqrt(N) scaling in central limit theorem
- sqrt(N) scaling in quantum mechanics (sqrt(probability))
- Brownian motion (displacement ~ sqrt(time))

CALCULATION:
""")

    # Model: N dimensional Crystal, perspective sees n dimensions
    # Information = n
    # Total = N
    # Ratio when n ~ sqrt(N)

    N_values = [10, 100, 1000, 10000, 100000]

    print(f"{'N':>10} | {'n=sqrt(N)':>12} | {'n/N':>10} | {'log(n)/log(N)':>15}")
    print("-" * 55)

    for N in N_values:
        n = int(sqrt(N))
        ratio = n / N
        log_ratio = log(n) / log(N) if N > 1 else 0
        print(f"{N:>10} | {n:>12} | {ratio:>10.6f} | {log_ratio:>15.4f}")

    print("""
Note: log(n)/log(N) = log(sqrt(N))/log(N) = 1/2 exactly.

So "half-dimensional" perspective means:
  "Accessible dimensions scale as N^{1/2}"

This gives a POWER LAW relationship between accessible and total.
""")

# =============================================================================
# Part 4: Prime Gaps and Perspective Transitions
# =============================================================================

def analyze_prime_gaps():
    """
    Analyze prime gaps as potential "perspective transitions."
    """
    print("\n" + "=" * 60)
    print("ANALYSIS: Prime Gaps as Perspective Transitions")
    print("=" * 60)

    primes = list(sympy.primerange(2, 10001))
    gaps = [primes[i+1] - primes[i] for i in range(len(primes)-1)]

    # Statistics
    avg_gap = np.mean(gaps)
    std_gap = np.std(gaps)
    max_gap = max(gaps)

    # The average gap should be ~ ln(n) for primes near n
    # Check this at different points

    print(f"Prime gaps up to 10000:")
    print(f"  Average gap: {avg_gap:.2f}")
    print(f"  Std dev: {std_gap:.2f}")
    print(f"  Max gap: {max_gap}")
    print()

    # Check if gap ~ ln(n)
    checkpoints = [100, 500, 1000, 5000, 10000]
    print("Gap scaling check (should approach ln(n)):")
    print(f"{'n':>8} | {'avg gap near n':>15} | {'ln(n)':>8} | {'ratio':>8}")
    print("-" * 50)

    for cp in checkpoints:
        # Primes near cp
        nearby = [p for p in primes if abs(p - cp) < cp/5]
        if len(nearby) < 2:
            continue
        nearby_gaps = [nearby[i+1] - nearby[i] for i in range(len(nearby)-1)]
        if nearby_gaps:
            avg = np.mean(nearby_gaps)
            expected = log(cp)
            ratio = avg / expected
            print(f"{cp:>8} | {avg:>15.2f} | {expected:>8.2f} | {ratio:>8.2f}")

    print("""
INTERPRETATION:

In the perspective framework, time is a sequence of perspectives.
Moving from one prime to the next requires "perspective change."

If the "cost" of perspective change is proportional to ln(n),
this matches the prime gap behavior.

SPECULATIVE CONNECTION:
  - Larger primes require more refined perspectives to distinguish
  - The refinement cost grows logarithmically
  - This creates the ln(n) gap structure

This is NOT a derivation, but an observation of compatible structures.
""")

# =============================================================================
# Part 5: Summary
# =============================================================================

def print_summary():
    """
    Print summary of half-dimension investigation.
    """
    print("\n" + "=" * 60)
    print("SUMMARY: Half-Dimension and Perspective")
    print("=" * 60)

    print("""
WHAT WE FOUND:

1. SPECTRAL DIMENSION ~1/2
   - Riemann zeta zeros cluster at Re(s) = 1/2
   - This is a deep fact about prime distribution
   - Our simple box-counting doesn't capture this

2. PERSPECTIVE PARTIALITY
   - P1: Every perspective sees strictly less than the whole
   - P2: Every perspective sees something
   - Natural "half" position: balanced partial access

3. POTENTIAL CONNECTION
   - n ~ sqrt(N) gives "half-dimensional" scaling
   - This might relate to 1/2 in Riemann Hypothesis
   - But this is METAPHOR, not derivation

STATUS OF CONNECTION:

[SPECULATION] The appearance of "1/2" in both:
  - Prime spectral dimension (Riemann critical line)
  - Natural perspective scale (sqrt of total)

might indicate deep structural similarity, OR might be coincidence.

WHAT WOULD MAKE THIS MORE THAN SPECULATION:

1. A derivation of why perspective access scales as sqrt(total)
2. A proof that this scaling produces the critical line
3. Physical evidence that observation involves sqrt scaling

HONEST ASSESSMENT:

The "half-dimension" observation is INTERESTING but UNEXPLAINED.
We have noted a numerical coincidence without proving it's meaningful.

This belongs in [SPECULATION] category until:
  - Mathematical derivation exists
  - Or physical prediction is verified
""")

# =============================================================================
# Main
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("INVESTIGATION: The Half-Dimension and Perspective")
    print("=" * 60)
    print()

    analyze_prime_dimension()
    explain_critical_line()
    model_partial_perspective()
    analyze_prime_gaps()
    print_summary()

    print("\n" + "=" * 60)
    print("INVESTIGATION COMPLETE")
    print("=" * 60)
