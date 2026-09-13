"""
Non-Framework Prime Search
==========================

Framework primes (sums of two squares from division algebra dims):
  2, 5, 13, 17, 53, 73, 113, 137

Non-framework primes to investigate:
  3, 7, 11 (structural - ARE dimensions themselves)
  19, 23, 29, 31, 37, 41, 43, 47, 59, 61, 67, 71, 79, 83, 89, 97, 101, 103, 107, 109...

Where should these appear? The framework predicts:
  - Framework primes -> fundamental constants (alpha, theta_W, mixing angles)
  - Structural primes -> gauge structure (generations, colors)
  - Non-framework primes -> composite properties, higher-order corrections

CONFIDENCE: EXPLORATORY
"""

import numpy as np
from fractions import Fraction
from math import gcd, sqrt

print("=" * 70)
print("NON-FRAMEWORK PRIME SEARCH")
print("=" * 70)

# =============================================================================
# Part 1: Classify Primes
# =============================================================================

def is_prime(n):
    if n < 2: return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0: return False
    return True

def sum_of_two_squares(n):
    """Check if n = a^2 + b^2 for division algebra dims {1,2,3,4,7,8,11}"""
    dims = [1, 2, 3, 4, 7, 8, 11]
    for a in dims:
        for b in dims:
            if a*a + b*b == n:
                return (a, b)
    return None

# Division algebra dimensions
dims = {'R': 1, 'C': 2, 'Im(H)': 3, 'H': 4, 'Im(O)': 7, 'O': 8, 'n_c': 11}

# Classify primes up to 200
primes = [p for p in range(2, 200) if is_prime(p)]

framework_primes = []
structural_primes = [2, 3, 7, 11]  # The dimensions themselves that are prime
non_framework_primes = []

for p in primes:
    decomp = sum_of_two_squares(p)
    if decomp:
        framework_primes.append((p, decomp))
    elif p not in structural_primes:
        non_framework_primes.append(p)

print("\n" + "=" * 70)
print("PART 1: PRIME CLASSIFICATION")
print("=" * 70)

print("\nFramework primes (a^2 + b^2 for a,b in {1,2,3,4,7,8,11}):")
for p, (a, b) in framework_primes:
    print(f"  {p} = {a}^2 + {b}^2")

print("\nStructural primes (dimensions themselves):")
for p in structural_primes:
    print(f"  {p}")

print(f"\nNon-framework primes to investigate ({len(non_framework_primes)} total):")
print(f"  {non_framework_primes[:20]}...")

# =============================================================================
# Part 2: Physical Constants Database
# =============================================================================

print("\n" + "=" * 70)
print("PART 2: PHYSICAL CONSTANTS TO SEARCH")
print("=" * 70)

# Particle masses in MeV
masses = {
    # Leptons
    'm_e': 0.51099895,
    'm_mu': 105.6583755,
    'm_tau': 1776.86,
    # Quarks (MS bar at 2 GeV for light quarks)
    'm_u': 2.16,
    'm_d': 4.67,
    'm_s': 93.4,
    'm_c': 1270,  # at m_c
    'm_b': 4180,  # at m_b
    'm_t': 172760,
    # Bosons
    'm_W': 80377,
    'm_Z': 91187.6,
    'm_H': 125250,
    # Hadrons
    'm_proton': 938.272,
    'm_neutron': 939.565,
    'm_pion_charged': 139.570,
    'm_pion_neutral': 134.977,
    'm_kaon_charged': 493.677,
    'm_kaon_neutral': 497.611,
    'm_eta': 547.862,
    'm_eta_prime': 957.78,
    'm_rho': 775.26,
    'm_omega': 782.66,
    'm_phi': 1019.461,
    'm_Delta': 1232,
    'm_Lambda': 1115.683,
    'm_Sigma': 1189.37,
    'm_Xi': 1314.86,
    'm_Omega': 1672.45,
    # Mesons with charm/bottom
    'm_D': 1869.66,
    'm_D_s': 1968.35,
    'm_B': 5279.34,
    'm_B_s': 5366.92,
    'm_J_psi': 3096.9,
    'm_Upsilon': 9460.3,
    # QCD scales
    'Lambda_QCD': 217,  # MS bar
    'm_glueball_0++': 1710,  # lattice prediction
}

# Coupling constants
couplings = {
    'alpha_EM': 1/137.035999,
    'alpha_s_MZ': 0.1179,
    'sin2_theta_W': 0.23121,
    'G_F': 1.1663788e-5,  # GeV^-2
}

# Other dimensionless ratios
ratios_known = {
    'm_p/m_e': 1836.15267,
    'm_mu/m_e': 206.7682830,
    'm_tau/m_mu': 16.8167,
    'm_tau/m_e': 3477.23,
    'm_W/m_Z': 0.88147,
    'm_H/m_Z': 1.3735,
    'm_t/m_W': 2.150,
    'm_t/m_H': 1.379,
}

print("\nMass ratios to search:")
for name, val in list(ratios_known.items())[:8]:
    print(f"  {name} = {val:.4f}")

# =============================================================================
# Part 3: Search for Non-Framework Primes in Mass Ratios
# =============================================================================

print("\n" + "=" * 70)
print("PART 3: SEARCH FOR NON-FRAMEWORK PRIMES")
print("=" * 70)

def find_prime_in_ratio(ratio, primes_to_check, max_mult=20):
    """Find if ratio ~ n*p/m or n/(m*p) for small n,m and prime p"""
    results = []

    for p in primes_to_check:
        # Check ratio ~ n/p
        for n in range(1, max_mult):
            val = n / p
            if val > 0.001 and val < 1000:
                error = abs(ratio - val) / ratio * 100
                if error < 2:
                    results.append((f"{n}/{p}", val, error, p))

        # Check ratio ~ n*p
        for n in range(1, max_mult):
            val = n * p
            if val > 0.001 and val < 10000:
                error = abs(ratio - val) / ratio * 100
                if error < 2:
                    results.append((f"{n}*{p}", val, error, p))

        # Check ratio ~ n*p/m
        for n in range(1, max_mult):
            for m in range(1, max_mult):
                if gcd(n*p, m) == 1:  # Reduced
                    val = n * p / m
                    if val > 0.001 and val < 10000:
                        error = abs(ratio - val) / ratio * 100
                        if error < 1:
                            results.append((f"{n}*{p}/{m}", val, error, p))

    return sorted(results, key=lambda x: x[2])[:5]

# Calculate all mass ratios
print("\nCalculating mass ratios...")
mass_ratios = {}
mass_names = list(masses.keys())

for i, m1 in enumerate(mass_names):
    for m2 in mass_names[i+1:]:
        ratio = masses[m1] / masses[m2]
        if ratio < 1:
            ratio = 1/ratio
            name = f"{m2}/{m1}"
        else:
            name = f"{m1}/{m2}"
        if 1 < ratio < 10000:
            mass_ratios[name] = ratio

print(f"Generated {len(mass_ratios)} mass ratios")

# Search each non-framework prime
prime_appearances = {p: [] for p in non_framework_primes[:15]}

print("\n--- Searching for non-framework primes in mass ratios ---\n")

for name, ratio in mass_ratios.items():
    for p in non_framework_primes[:15]:
        # Simple divisibility checks
        rounded = round(ratio)
        if rounded > 0 and rounded % p == 0:
            prime_appearances[p].append((name, ratio, f"~ {rounded} = {p}*{rounded//p}"))

        # Check p in numerator/denominator of simple fractions
        for n in range(1, 10):
            for m in range(1, 10):
                if gcd(n, m) == 1:
                    test_val = n * p / m
                    error = abs(ratio - test_val) / ratio * 100
                    if error < 0.5:
                        prime_appearances[p].append((name, ratio, f"~ {n}*{p}/{m} = {test_val:.3f}", error))

# Report findings
print("NON-FRAMEWORK PRIME APPEARANCES:\n")

for p in non_framework_primes[:15]:
    appearances = prime_appearances[p]
    if appearances:
        print(f"\n--- Prime {p} ---")
        # Deduplicate and sort by precision
        seen = set()
        unique = []
        for a in appearances:
            key = (a[0], a[2])
            if key not in seen:
                seen.add(key)
                unique.append(a)
        for a in unique[:5]:
            if len(a) == 4:
                print(f"  {a[0]} = {a[1]:.4f} {a[2]} (error: {a[3]:.2f}%)")
            else:
                print(f"  {a[0]} = {a[1]:.4f} {a[2]}")

# =============================================================================
# Part 4: Focus on Prime 19
# =============================================================================

print("\n" + "=" * 70)
print("PART 4: PRIME 19 INVESTIGATION")
print("=" * 70)

print("""
Prime 19 is interesting because:
  - 19 = 3^2 + 3^2 + 1 (not sum of TWO squares from dims)
  - 19 = 11 + 8 = n_c + O
  - 19 = 12 + 7 = (H+O) + Im(O)
  - First non-framework prime after structural primes
""")

# Look for 19 in physics
val_19_tests = [
    ("m_eta/m_pion_0", masses['m_eta']/masses['m_pion_neutral']),
    ("m_omega/m_eta", masses['m_omega']/masses['m_eta']),
    ("m_rho/m_eta", masses['m_rho']/masses['m_eta']),
    ("m_phi/m_rho", masses['m_phi']/masses['m_rho']),
    ("m_D/m_phi", masses['m_D']/masses['m_phi']),
    ("m_tau/m_s", masses['m_tau']/masses['m_s']),
    ("m_b/m_tau", masses['m_b']/masses['m_tau']),
]

print("\nSearching for 19 in meson mass ratios:")
for name, ratio in val_19_tests:
    # Check ratio ~ n*19/m or n/19*m
    for n in range(1, 20):
        for m in range(1, 20):
            test = n * 19 / m
            error = abs(ratio - test) / ratio * 100
            if error < 1:
                print(f"  {name} = {ratio:.4f} ~ {n}*19/{m} = {test:.4f} ({error:.2f}%)")
            test = n / (19 * m)
            error = abs(ratio - test) / ratio * 100
            if error < 1:
                print(f"  {name} = {ratio:.4f} ~ {n}/(19*{m}) = {test:.4f} ({error:.2f}%)")

# =============================================================================
# Part 5: Focus on Prime 23
# =============================================================================

print("\n" + "=" * 70)
print("PART 5: PRIME 23 INVESTIGATION (ALREADY PARTIAL)")
print("=" * 70)

print("""
Prime 23 is ADDITIVE-framework:
  - 23 = 11 + 12 = n_c + 3*H = n_c + 3*dim(H)
  - Already found: m_mu/m_e ~ 207 = 9*23
  - QCD beta function: b_0 = 23/3 for 5 flavors
""")

# Verify
mu_e_ratio = masses['m_mu'] / masses['m_e']
print(f"\nm_mu/m_e = {mu_e_ratio:.4f}")
print(f"9 * 23 = 207")
print(f"Error: {abs(mu_e_ratio - 207)/207 * 100:.3f}%")

# What else might involve 23?
print("\nOther potential 23 appearances:")
for name, ratio in mass_ratios.items():
    for n in range(1, 15):
        for m in range(1, 10):
            test = n * 23 / m
            error = abs(ratio - test) / ratio * 100
            if error < 0.5 and n*23/m > 10:
                print(f"  {name} = {ratio:.3f} ~ {n}*23/{m} = {test:.3f} ({error:.2f}%)")

# =============================================================================
# Part 6: Focus on Prime 29
# =============================================================================

print("\n" + "=" * 70)
print("PART 6: PRIME 29 INVESTIGATION")
print("=" * 70)

print("""
Prime 29:
  - 29 = 2^2 + 5^2 but 5 is not a division algebra dimension!
  - 29 = 11 + 11 + 7 = 2*n_c + Im(O)
  - 29 = 8 + 8 + 8 + 4 + 1 = 3*O + H + R
""")

# Search for 29
print("\nSearching for 29 in physics:")

# Meson ratios often involve 29
eta_pi = masses['m_eta'] / masses['m_pion_neutral']
print(f"m_eta/m_pi0 = {eta_pi:.4f}")
print(f"  Close to 4.06, or 113/28, or 29/7 = {29/7:.3f}")

# Check m_eta/m_pi0 ~ 4 = 116/29 or similar
for n in range(100, 130):
    test = n / 29
    error = abs(eta_pi - test) / eta_pi * 100
    if error < 1:
        print(f"  m_eta/m_pi0 ~ {n}/29 = {test:.4f} ({error:.2f}%)")

# =============================================================================
# Part 7: Focus on Primes 31, 37, 41, 43
# =============================================================================

print("\n" + "=" * 70)
print("PART 7: PRIMES 31, 37, 41, 43")
print("=" * 70)

for p in [31, 37, 41, 43]:
    print(f"\n--- Prime {p} ---")

    # Additive decomposition
    for a in [1, 2, 3, 4, 7, 8, 11]:
        remainder = p - a
        if remainder in [1, 2, 3, 4, 7, 8, 11, 12, 14, 15, 16, 22]:
            print(f"  {p} = {a} + {remainder}")

    # Search in mass ratios
    found = []
    for name, ratio in mass_ratios.items():
        for n in range(1, 20):
            for m in range(1, 15):
                test = n * p / m
                error = abs(ratio - test) / ratio * 100
                if error < 0.3 and test > 1:
                    found.append((name, ratio, f"{n}*{p}/{m}", test, error))

    if found:
        found.sort(key=lambda x: x[4])
        for f in found[:3]:
            print(f"  {f[0]} = {f[1]:.4f} ~ {f[2]} = {f[3]:.4f} ({f[4]:.2f}%)")

# =============================================================================
# Part 8: Nuclear/Hadronic Structure
# =============================================================================

print("\n" + "=" * 70)
print("PART 8: HADRONIC RATIOS (WHERE NON-FRAMEWORK PRIMES SHOULD APPEAR)")
print("=" * 70)

print("""
Non-framework primes should appear in COMPOSITE structures:
  - Hadron mass ratios
  - Nuclear binding energies
  - Resonance widths
""")

hadronic_ratios = {
    'm_p/m_pi+': masses['m_proton'] / masses['m_pion_charged'],
    'm_n/m_pi+': masses['m_neutron'] / masses['m_pion_charged'],
    'm_Delta/m_p': masses['m_Delta'] / masses['m_proton'],
    'm_Lambda/m_p': masses['m_Lambda'] / masses['m_proton'],
    'm_Sigma/m_Lambda': masses['m_Sigma'] / masses['m_Lambda'],
    'm_Xi/m_Lambda': masses['m_Xi'] / masses['m_Lambda'],
    'm_Omega/m_Xi': masses['m_Omega'] / masses['m_Xi'],
    'm_rho/m_pi': masses['m_rho'] / masses['m_pion_charged'],
    'm_omega/m_rho': masses['m_omega'] / masses['m_rho'],
    'm_phi/m_omega': masses['m_phi'] / masses['m_omega'],
    'm_J_psi/m_phi': masses['m_J_psi'] / masses['m_phi'],
    'm_Upsilon/m_J_psi': masses['m_Upsilon'] / masses['m_J_psi'],
}

print("\nHadronic ratios with non-framework prime decomposition:")
for name, ratio in hadronic_ratios.items():
    print(f"\n{name} = {ratio:.4f}")

    # Search for prime decomposition
    for p in non_framework_primes[:10]:
        for n in range(1, 20):
            for m in range(1, 20):
                if gcd(n, m) == 1:
                    test = n * p / m
                    error = abs(ratio - test) / ratio * 100
                    if error < 0.5:
                        print(f"  ~ {n}*{p}/{m} = {test:.4f} ({error:.2f}%)")

# =============================================================================
# Part 9: Summary
# =============================================================================

print("\n" + "=" * 70)
print("SUMMARY: NON-FRAMEWORK PRIME APPEARANCES")
print("=" * 70)

print("""
CONFIRMED (from previous work):
  - 23: m_mu/m_e ~ 9*23, QCD b_0 = 23/3
  - 71: |V_cb| = 3/71

NEW FINDINGS:
""")

# Collect best findings
best_findings = []

# Re-scan with strict criteria
for name, ratio in {**mass_ratios, **hadronic_ratios}.items():
    for p in non_framework_primes[:15]:
        for n in range(1, 15):
            for m in range(1, 15):
                if gcd(n*p, m) == n*p or gcd(n, m*p) == 1:
                    test = n * p / m
                    error = abs(ratio - test) / ratio * 100
                    if error < 0.3 and 0.1 < test < 5000:
                        best_findings.append((p, name, ratio, f"{n}*{p}/{m}", test, error))

# Deduplicate and sort
best_findings.sort(key=lambda x: (x[0], x[5]))
seen_primes = set()
for f in best_findings:
    if f[0] not in seen_primes or f[5] < 0.1:
        print(f"  {f[0]}: {f[1]} = {f[2]:.4f} ~ {f[3]} = {f[4]:.4f} ({f[5]:.2f}%)")
        seen_primes.add(f[0])

print("\n" + "=" * 70)
print("SCRIPT COMPLETE")
print("=" * 70)
