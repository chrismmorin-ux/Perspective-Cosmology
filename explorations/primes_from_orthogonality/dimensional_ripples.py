"""
Dimensional Ripples: How New Orthogonal Dimensions Create Prime Patterns

Hypothesis: When a new prime p emerges (new orthogonal dimension),
it doesn't just create one prime - it creates a RIPPLE that affects
the entire structure, opening "slots" for primes at specific distances.

The "imperfect crystal" determines which slots actually manifest primes.
"""

import numpy as np
from math import gcd, log, sqrt, prod
from typing import List, Set, Dict, Tuple
from collections import defaultdict
import sympy

# =============================================================================
# Part 1: The Ripple Effect - What Happens When a New Prime Appears
# =============================================================================

def analyze_ripple_effect():
    """
    When prime p_n is added to the known set, what new "orthogonal slots"
    open up? These are positions that COULD be prime.
    """
    print("The Ripple Effect: New Dimensions Create New Slots")
    print("=" * 70)

    primes = list(sympy.primerange(2, 100))

    for i in range(1, min(8, len(primes))):
        prev_primes = primes[:i]
        new_prime = primes[i]

        prev_primorial = prod(prev_primes)
        new_primorial = prev_primorial * new_prime

        # Slots before adding new prime: residues coprime to prev_primorial
        old_slots = set(r for r in range(1, prev_primorial + 1)
                       if gcd(r, prev_primorial) == 1)

        # Slots after: residues coprime to new_primorial
        # But we need to see how they map

        # The NEW slots that open up in the extended period
        # Actually, slots don't "open" - they get filtered
        # But the PATTERN changes

        # What's interesting: the residues coprime to new_primorial
        # form a different pattern that extends further

        new_slots = set(r for r in range(1, new_primorial + 1)
                       if gcd(r, new_primorial) == 1)

        print(f"\nAdding prime {new_prime}:")
        print(f"  Previous primes: {prev_primes}")
        print(f"  Old primorial: {prev_primorial}, slots: {len(old_slots)}")
        print(f"  New primorial: {new_primorial}, slots: {len(new_slots)}")
        print(f"  Slot density: {len(old_slots)/prev_primorial:.4f} -> {len(new_slots)/new_primorial:.4f}")

        # The "ripple": where are the NEW primes that appear
        # in the range [prev_primorial, new_primorial]?
        primes_in_range = [p for p in primes if prev_primorial < p <= new_primorial]
        print(f"  Primes in range ({prev_primorial}, {new_primorial}]: {primes_in_range[:10]}{'...' if len(primes_in_range) > 10 else ''}")
        print(f"  Count: {len(primes_in_range)}")


# =============================================================================
# Part 2: The Intersection Pattern - Where Stretching Creates Primes
# =============================================================================

def analyze_intersections():
    """
    The user's insight: "stretching causes them to intersect"

    When we have primes p, q, the "intersection" at p*q is composite.
    But the PATTERN of intersections creates "gaps" where primes must appear.

    The stretching: as numbers grow, the pattern of where dimensions
    "miss" each other creates the prime distribution.
    """
    print("\n\nIntersection Patterns: Where Dimensions Miss Each Other")
    print("=" * 70)

    primes = list(sympy.primerange(2, 50))

    # For small primes, visualize where their "planes" intersect
    # and where the gaps (potential primes) are

    print("\nVisualization: Multiples of first few primes")
    print("Position: 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20...")
    print("-" * 70)

    for p in primes[:6]:
        line = ""
        for n in range(2, 40):
            if n % p == 0:
                line += "X "
            else:
                line += ". "
        print(f"p={p:2d}:    {line}")

    # Show where ALL early primes miss (these are prime candidates)
    print("\nGaps (orthogonal to 2,3,5):")
    small_primes = [2, 3, 5]
    line = ""
    for n in range(2, 40):
        if all(n % p != 0 for p in small_primes):
            if sympy.isprime(n):
                line += "P "  # Prime
            else:
                line += "? "  # Candidate but not prime (composite of larger primes)
        else:
            line += ". "
    print(f"        {line}")
    print("P = prime, ? = candidate but composite, . = hit by 2, 3, or 5")


# =============================================================================
# Part 3: The Crystal Structure - Regularity and Imperfection
# =============================================================================

def crystal_structure():
    """
    The primes form an "imperfect crystal" - there's underlying regularity
    (the residue classes) but imperfection (which candidates are actually prime).

    The regularity: primes can only appear at positions coprime to primorial
    The imperfection: not all such positions ARE prime
    """
    print("\n\nThe Imperfect Crystal: Regularity + Imperfection")
    print("=" * 70)

    # The "crystal lattice" is defined by the primorial
    # Primes can only appear at specific "lattice sites" (coprime residues)

    primorial_6 = 2 * 3  # = 6
    slots_6 = [r for r in range(1, primorial_6 + 1) if gcd(r, primorial_6) == 1]

    primorial_30 = 2 * 3 * 5  # = 30
    slots_30 = [r for r in range(1, primorial_30 + 1) if gcd(r, primorial_30) == 1]

    print(f"\nMod 6 crystal: slots at {slots_6}")
    print("  All primes > 3 are at positions 6k+1 or 6k+5")

    print(f"\nMod 30 crystal: slots at {slots_30}")
    print("  All primes > 5 are at positions 30k + one of these residues")

    # Show the "imperfection" - which slots are occupied
    print("\nCrystal occupancy (mod 30) for numbers up to 120:")
    print("Slot | Positions | Which are prime?")
    print("-" * 50)

    for slot in slots_30:
        positions = [slot + 30*k for k in range(4) if slot + 30*k > 1]
        primes_at = [p for p in positions if sympy.isprime(p)]
        composites_at = [c for c in positions if not sympy.isprime(c) and c > 1]

        print(f" {slot:2d}  | {positions} | primes: {primes_at}, composites: {composites_at}")


# =============================================================================
# Part 4: Long-Range Correlations - Distant Primes from Same Dimension
# =============================================================================

def long_range_correlations():
    """
    The user's insight: a new orthogonal dimension creates primes
    "very far out" - not just the immediate next prime.

    Question: Are there correlations between distant primes that suggest
    they emerged from the same "dimensional event"?
    """
    print("\n\nLong-Range Correlations: Distant Primes from Same Structure")
    print("=" * 70)

    primes = list(sympy.primerange(2, 1000))

    # Look for patterns in prime differences
    # The "dimensional ripple" might create primes at specific intervals

    # Common differences between primes
    differences = defaultdict(list)
    for i in range(len(primes) - 1):
        diff = primes[i+1] - primes[i]
        differences[diff].append((primes[i], primes[i+1]))

    print("\nMost common prime gaps (differences):")
    sorted_diffs = sorted(differences.items(), key=lambda x: -len(x[1]))
    for diff, pairs in sorted_diffs[:10]:
        print(f"  Gap {diff}: occurs {len(pairs)} times")
        print(f"    Examples: {pairs[:3]}")

    # The gaps that appear are always even (for p > 2)
    # They cluster around 6k (due to mod 6 structure)

    print("\n\nGap structure (mod 6):")
    for gap in [2, 4, 6, 8, 10, 12]:
        count = len(differences.get(gap, []))
        print(f"  Gap {gap} (= {gap}): {count} occurrences")

    # Twin primes (gap 2), cousin primes (gap 4), sexy primes (gap 6)
    print("\n\nNamed prime pairs:")
    print(f"  Twin primes (gap 2): {len(differences[2])} pairs")
    print(f"  Cousin primes (gap 4): {len(differences[4])} pairs")
    print(f"  Sexy primes (gap 6): {len(differences[6])} pairs")


# =============================================================================
# Part 5: The Stretching Effect - How Far Does One Dimension Reach?
# =============================================================================

def stretching_effect():
    """
    When prime p creates a new dimension, its "influence" extends
    to all numbers of form p*k. But the ORTHOGONAL effect - where
    primes can appear - extends differently.

    The "stretch" might be related to how the new dimension interacts
    with existing ones.
    """
    print("\n\nThe Stretching Effect: Reach of a New Dimension")
    print("=" * 70)

    primes = list(sympy.primerange(2, 200))

    for i, p in enumerate(primes[:8]):
        # When p is added as a dimension:
        # - It eliminates all p*k as prime candidates
        # - But it creates a new "axis" that other primes can be orthogonal to

        # The "reach" of p: how far until the next prime that's
        # orthogonal to all primes up to and including p?

        prev_primes = primes[:i+1]
        primorial = prod(prev_primes)

        # Find primes that appear in the pattern defined by this primorial
        # These are primes in residue classes coprime to primorial

        # The next prime after p
        next_prime = primes[i+1] if i+1 < len(primes) else None

        # The "stretch" - ratio of primorial to p
        stretch = primorial / p if p > 0 else 0

        print(f"\nPrime {p} (dimension {i+1}):")
        print(f"  Primorial: {primorial}")
        print(f"  'Stretch factor' (primorial/p): {stretch:.1f}")
        print(f"  Next prime: {next_prime}")
        if next_prime:
            print(f"  Gap to next: {next_prime - p}")
            print(f"  Next prime's residue mod primorial: {next_prime % primorial}")


# =============================================================================
# Part 6: The Imperfect Crystal U - Connecting to Perspective
# =============================================================================

def imperfect_crystal_U():
    """
    The user's framework: U is an imperfect crystal.

    In this context:
    - Perfect crystal = all orthogonal slots filled with primes
    - Imperfection = some slots are composite (products of larger primes)

    The imperfection might encode WHERE primes actually appear
    vs where they theoretically could.
    """
    print("\n\nThe Imperfect Crystal U: Slots vs Reality")
    print("=" * 70)

    # Using primorial 30 as our "crystal structure"
    primorial = 30
    slots = [r for r in range(1, primorial + 1) if gcd(r, primorial) == 1]

    print(f"Crystal structure mod {primorial}: {len(slots)} slots per period")
    print(f"Slots: {slots}")

    # For each slot, track the "imperfection" - what fraction are prime?
    print("\nSlot occupancy analysis (first 10 periods):")

    slot_stats = {s: {'prime': 0, 'composite': 0} for s in slots}

    for period in range(10):
        for slot in slots:
            n = slot + primorial * period
            if n <= 1:
                continue
            if sympy.isprime(n):
                slot_stats[slot]['prime'] += 1
            else:
                slot_stats[slot]['composite'] += 1

    print("\nSlot | Primes | Composites | Prime fraction")
    print("-" * 50)
    for slot in slots:
        p = slot_stats[slot]['prime']
        c = slot_stats[slot]['composite']
        total = p + c
        frac = p / total if total > 0 else 0
        print(f" {slot:2d}  |   {p:2d}   |     {c:2d}     | {frac:.2f}")

    # The "imperfection" varies by slot!
    # Some slots are more likely to be prime than others

    print("\n\nKey insight: The crystal has VARYING imperfection by slot.")
    print("This variation might encode the 'stretching' that creates distant primes.")


# =============================================================================
# Part 7: Dimensional Cascade - One Prime Creates Many
# =============================================================================

def dimensional_cascade():
    """
    The user's key insight: one new dimension doesn't just create one prime,
    it creates primes "across every dimension of orthogonality very far out."

    Test: When a new prime p appears, what other primes are "unlocked"
    in the sense that they become distinguishable in the new structure?
    """
    print("\n\nDimensional Cascade: One Prime Unlocks Many")
    print("=" * 70)

    primes = list(sympy.primerange(2, 500))

    print("""
When prime p is discovered, it creates:
1. Its own dimension (axis p in prime-space)
2. New "slots" in the residue structure
3. Patterns that extend to infinity

The cascade: primes that are "related" to p through the structure.
""")

    # For each prime p, find primes of form p + k*primorial
    # These are "echoes" of p in subsequent periods

    for p in primes[:6]:
        # Find primes that share the same residue class mod previous primorial
        prev_primes = [q for q in primes if q < p]
        if not prev_primes:
            continue

        prev_primorial = prod(prev_primes)
        residue = p % prev_primorial

        # Find other primes with same residue
        same_residue_primes = [q for q in primes if q % prev_primorial == residue and q != p]

        print(f"\nPrime {p}:")
        print(f"  Residue mod {prev_primorial}: {residue}")
        print(f"  Other primes at same residue: {same_residue_primes[:8]}...")
        print(f"  These form a 'cascade' from the same structural slot")


# =============================================================================
# Main
# =============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("DIMENSIONAL RIPPLES: HOW NEW DIMENSIONS CREATE PRIME CASCADES")
    print("=" * 70)

    analyze_ripple_effect()
    analyze_intersections()
    crystal_structure()
    long_range_correlations()
    stretching_effect()
    imperfect_crystal_U()
    dimensional_cascade()

    print("\n" + "=" * 70)
    print("KEY INSIGHTS:")
    print("=" * 70)
    print("""
1. RIPPLE EFFECT: When prime p is added, it reconfigures the entire
   orthogonal structure, creating new patterns that extend to infinity.

2. CRYSTAL STRUCTURE: Primes can only appear at "lattice sites"
   (residues coprime to primorial). The structure is regular.

3. IMPERFECTION: Not all lattice sites contain primes. The "defects"
   in the crystal are composites of larger primes.

4. DIMENSIONAL CASCADE: Primes sharing the same residue class are
   "echoes" of each other - created by the same structural slot.

5. STRETCHING: As numbers grow, the crystal "stretches" - the same
   slots recur but the spacing increases. Primes at these slots
   are connected by the underlying structure.

The user's insight: The imperfection in the crystal U determines
which distant slots manifest as primes. The "stretching" creates
intersections where primes must appear.
""")
