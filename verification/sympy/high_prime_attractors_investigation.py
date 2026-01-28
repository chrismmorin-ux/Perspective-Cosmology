#!/usr/bin/env python3
"""
High Prime Attractors Investigation

Exploring primes beyond 137 that could be framework primes - sums of squares
of division algebra dimensions {1, 2, 3, 4, 7, 8, 11}.

Questions:
1. What are ALL primes expressible as a^2 + b^2 using dimensions?
2. What about triple-sums a^2 + b^2 + c^2?
3. What about quadruple-sums?
4. What physical phenomena might they govern?

Created: Session 110
"""

from sympy import *
from itertools import combinations_with_replacement, product
from collections import defaultdict

# Division algebra dimensions
DIMS = [1, 2, 3, 4, 7, 8, 11]

# Physical names
DIM_NAMES = {
    1: "R (real)",
    2: "C (complex)/dim(C)",
    3: "Im(H) (quaternion imaginaries)",
    4: "H (quaternion)/n_d",
    7: "Im(O) (octonion imaginaries)",
    8: "O (octonion)",
    11: "n_c (crystal dimensions)"
}

print("="*70)
print("HIGH PRIME ATTRACTORS INVESTIGATION")
print("="*70)

# ============================================================================
# PART 1: All two-square framework primes (a^2 + b^2)
# ============================================================================

print("\n" + "="*70)
print("PART 1: TWO-SQUARE FRAMEWORK PRIMES (a^2 + b^2)")
print("="*70)

two_square_primes = {}
for a, b in combinations_with_replacement(DIMS, 2):
    val = a**2 + b**2
    if isprime(val):
        if val not in two_square_primes:
            two_square_primes[val] = []
        two_square_primes[val].append((a, b))

print(f"\nAll primes of form a^2 + b^2 where a,b in {DIMS}:")
print("-"*70)
for p in sorted(two_square_primes.keys()):
    forms = two_square_primes[p]
    forms_str = ", ".join([f"{a}^2 + {b}^2 = {a**2} + {b**2}" for a, b in forms])
    print(f"  {p:4d} = {forms_str}")

print(f"\nTotal two-square primes: {len(two_square_primes)}")
print(f"Highest: {max(two_square_primes.keys())}")

# ============================================================================
# PART 2: All three-square framework primes (a^2 + b^2 + c^2)
# ============================================================================

print("\n" + "="*70)
print("PART 2: THREE-SQUARE FRAMEWORK PRIMES (a^2 + b^2 + c^2)")
print("="*70)

three_square_primes = {}
for combo in combinations_with_replacement(DIMS, 3):
    val = sum(d**2 for d in combo)
    if isprime(val):
        if val not in three_square_primes:
            three_square_primes[val] = []
        three_square_primes[val].append(combo)

# Only show ones NOT already in two_square_primes
unique_three = {p: v for p, v in three_square_primes.items() if p not in two_square_primes}

print(f"\nPrimes ONLY expressible as three squares (not two):")
print("-"*70)
for p in sorted(unique_three.keys()):
    forms = unique_three[p][:3]  # Show at most 3 forms
    for form in forms:
        form_str = " + ".join([f"{d}^2" for d in form])
        vals_str = " + ".join([str(d**2) for d in form])
        print(f"  {p:4d} = {form_str} = {vals_str}")

print(f"\nTotal unique three-square primes: {len(unique_three)}")
if unique_three:
    print(f"Range: {min(unique_three.keys())} to {max(unique_three.keys())}")

# ============================================================================
# PART 3: All four-square framework primes (a^2 + b^2 + c^2 + d^2)
# ============================================================================

print("\n" + "="*70)
print("PART 3: FOUR-SQUARE FRAMEWORK PRIMES (a^2 + b^2 + c^2 + d^2)")
print("="*70)

four_square_primes = {}
for combo in combinations_with_replacement(DIMS, 4):
    val = sum(d**2 for d in combo)
    if isprime(val):
        if val not in four_square_primes:
            four_square_primes[val] = []
        four_square_primes[val].append(combo)

# Only show ones NOT already in two or three square primes
unique_four = {p: v for p, v in four_square_primes.items()
               if p not in two_square_primes and p not in three_square_primes}

print(f"\nPrimes ONLY expressible as four squares (not two or three):")
print("-"*70)
for p in sorted(unique_four.keys())[:30]:  # First 30
    forms = unique_four[p][:2]  # Show at most 2 forms
    for form in forms:
        form_str = " + ".join([f"{d}^2" for d in form])
        print(f"  {p:4d} = {form_str}")

print(f"\nTotal unique four-square primes: {len(unique_four)}")
if unique_four:
    print(f"Range: {min(unique_four.keys())} to {max(unique_four.keys())}")

# ============================================================================
# PART 4: COMPLETE PRIME SPECTRUM up to 500
# ============================================================================

print("\n" + "="*70)
print("PART 4: COMPLETE FRAMEWORK PRIME SPECTRUM (< 500)")
print("="*70)

# Combine all
all_framework_primes = set(two_square_primes.keys())
all_framework_primes.update(three_square_primes.keys())
all_framework_primes.update(four_square_primes.keys())

# What primes are NOT expressible?
all_primes_500 = [p for p in range(2, 500) if isprime(p)]
non_framework = [p for p in all_primes_500 if p not in all_framework_primes]

print(f"\nAll primes < 500: {len(all_primes_500)}")
print(f"Framework primes (up to 4 squares): {len([p for p in all_framework_primes if p < 500])}")
print(f"Non-framework primes: {len(non_framework)}")

print(f"\nNon-framework primes < 500:")
print(non_framework)

# ============================================================================
# PART 5: HIGH PRIMES (> 137) AND THEIR PHYSICAL SIGNIFICANCE
# ============================================================================

print("\n" + "="*70)
print("PART 5: HIGH FRAMEWORK PRIMES (> 137)")
print("="*70)

high_primes = [p for p in sorted(all_framework_primes) if p > 137]

print(f"\nFramework primes above 137:")
print("-"*70)
for p in high_primes[:25]:  # First 25
    tier = ""
    forms = []
    if p in two_square_primes:
        tier = "Tier 2 (two-square)"
        forms = two_square_primes[p]
    elif p in unique_three:
        tier = "Tier 3 (three-square)"
        forms = unique_three[p][:1]
    elif p in unique_four:
        tier = "Tier 4 (four-square)"
        forms = unique_four[p][:1]

    for form in forms[:1]:
        if len(form) == 2:
            a, b = form
            print(f"  {p:4d} = {a}^2 + {b}^2 = {a**2} + {b**2}  [{tier}]")
        else:
            form_str = " + ".join([f"{d}^2" for d in form])
            print(f"  {p:4d} = {form_str}  [{tier}]")

# ============================================================================
# PART 6: SEARCHING FOR PHYSICAL MANIFESTATIONS
# ============================================================================

print("\n" + "="*70)
print("PART 6: PHYSICAL MANIFESTATION CANDIDATES")
print("="*70)

# Key high primes to investigate
key_high_primes = [
    139, 149, 157, 163, 179, 193, 197, 211, 227, 233, 241, 251, 263, 269, 277
]

print(f"\nKey high primes to search for physical manifestations:")
print("-"*70)

# Physical scales and ratios to check
# Some relevant physical quantities (approximate values)
physical_ratios = {
    "m_Z/m_W": 91.1876/80.377,
    "m_H/m_W": 125.25/80.377,
    "m_H/m_Z": 125.25/91.1876,
    "m_t/m_Z": 172.69/91.1876,
    "m_t/m_W": 172.69/80.377,
    "m_t/m_H": 172.69/125.25,
    "v/m_t": 246.22/172.69,
    "m_p/m_pi": 938.27/139.57,
    "m_n/m_pi": 939.57/139.57,
    "m_Sigma/m_p": 1189/938.27,
    "m_Xi/m_p": 1315/938.27,
    "m_Omega/m_p": 1672/938.27,
    "N_gen x N_colors": 3*3,
    "Total SM fermions": 15*3,
}

print("\nChecking ratios near high framework primes...")

for p in key_high_primes[:10]:
    if p in all_framework_primes:
        print(f"\n{p}:")
        # Check if any physical ratio is close to p or p/n for small n
        for name, ratio in physical_ratios.items():
            for n in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]:
                target = p / n
                if abs(ratio - target) / target < 0.02:  # Within 2%
                    err = abs(ratio - target) / target * 100
                    print(f"    {name} ~ {p}/{n} = {target:.4f} (actual: {ratio:.4f}, err: {err:.2f}%)")

# ============================================================================
# PART 7: COSMOLOGICAL SCALE CANDIDATES
# ============================================================================

print("\n" + "="*70)
print("PART 7: COSMOLOGICAL SCALE CANDIDATES")
print("="*70)

# Cosmological quantities that might involve high primes
cosmo_quantities = {
    "z_eq (matter-radiation)": 3387,
    "z_rec (recombination)": 1090,
    "z_dec (decoupling)": 1100,
    "ln(T_Pl/T_CMB)": 71.5,  # ln(10^32) approximately
    "N_eff (effective neutrinos)": 3.046,
    "T_CMB / T_nu": 1.4,  # (11/4)^(1/3)
    "1/Omega_b": 20.4,  # ~1/0.049
    "Omega_DM/Omega_b": 5.32,
    "1/Omega_Lambda": 1.46,
    "Hubble_SH0ES/Hubble_Planck": 73.0/67.4,
    "ell_1": 220,
    "ell_2": 538,
    "ell_3": 811,  # approximately
}

print("\nCosmological quantities near high framework primes:")
print("-"*70)

for p in sorted(all_framework_primes):
    if 150 < p < 400:
        for name, val in cosmo_quantities.items():
            for n in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]:
                target = p / n
                if val != 0 and abs(val - target) / abs(val) < 0.01:  # Within 1%
                    err = abs(val - target) / abs(val) * 100
                    print(f"  {p} = {name} x {n}: target {target:.2f}, actual {val:.2f}, err {err:.2f}%")

# ============================================================================
# PART 8: SPECIFIC INVESTIGATION - WHERE 139, 179, 251 MIGHT APPEAR
# ============================================================================

print("\n" + "="*70)
print("PART 8: SPECIFIC HIGH PRIMES")
print("="*70)

print("\nDetailed analysis of key high primes:")
print("-"*70)

for p in [139, 179, 251, 263, 277, 311]:
    print(f"\n{p}:")

    # Find all forms
    if p in two_square_primes:
        for form in two_square_primes[p]:
            a, b = form
            print(f"  = {a}^2 + {b}^2 = {DIM_NAMES.get(a, str(a))}^2 + {DIM_NAMES.get(b, str(b))}^2")

    if p in three_square_primes:
        for form in three_square_primes[p][:2]:
            parts = [f"{d}^2 ({DIM_NAMES.get(d, str(d))})" for d in form]
            print(f"  = " + " + ".join(parts))

    if p in four_square_primes:
        for form in four_square_primes[p][:1]:
            parts = [f"{d}^2" for d in form]
            print(f"  = " + " + ".join(parts))

    if p not in all_framework_primes:
        print(f"  NOT EXPRESSIBLE using dimension squares!")

# ============================================================================
# PART 9: PREDICTIONS FOR WHERE HIGH PRIMES MIGHT APPEAR
# ============================================================================

print("\n" + "="*70)
print("PART 9: PREDICTIONS FOR HIGH PRIME MANIFESTATIONS")
print("="*70)

predictions = [
    (139, "3^2 + 3^2 + 11^2 = 2xIm_H^2 + n_c^2",
     "Should appear in phenomena mixing 2 generation factors with crystal",
     "Candidate: neutron lifetime? tau_n ~ 880s, could involve 139?"),

    (179, "3^2 + 7^2 + 11^2 = Im_H^2 + Im_O^2 + n_c^2",
     "Combines ALL structural dimensions!",
     "Candidate: Something involving generations, color, AND crystal together"),

    (251, "3^2 + 11^2 + 11^2 = Im_H^2 + 2xn_c^2",
     "Heavy crystal involvement (2xn_c^2)",
     "Candidate: Something cosmic (uses crystal dimensions twice)"),

    (263, "1^2 + 1^2 + 3^2 + 16^2 = too large dims",
     "Check: Need 4 squares from allowed dims",
     "May not be expressible - check!"),
]

print("\nPredictions for where each prime might manifest:")
print("-"*70)
for p, form, meaning, candidate in predictions:
    print(f"\n{p}: {form}")
    print(f"  Physical meaning: {meaning}")
    print(f"  Prediction: {candidate}")

# ============================================================================
# PART 10: EXTENDED SEARCH - PHYSICAL CONSTANTS
# ============================================================================

print("\n" + "="*70)
print("PART 10: EXTENDED PHYSICAL CONSTANT SEARCH")
print("="*70)

# More physical constants to check against high primes
extended_constants = {
    # Particle masses in MeV
    "m_pi0": 134.977,
    "m_pi_charged": 139.570,
    "m_eta": 547.862,
    "m_rho": 775.26,
    "m_omega": 782.65,
    "m_phi": 1019.461,
    "m_Jpsi": 3096.9,
    "m_Upsilon": 9460.3,
    "m_D0": 1864.84,
    "m_Ds": 1968.34,
    "m_B0": 5279.65,
    "m_Bs": 5366.88,
    "m_proton": 938.272,
    "m_neutron": 939.565,
    "m_Lambda": 1115.683,
    "m_Sigma0": 1192.642,
    "m_Xi0": 1314.86,
    "m_Omega": 1672.45,
    # Electroweak
    "m_W": 80377,  # MeV
    "m_Z": 91187.6,
    "m_H": 125250,
    "m_top": 172690,
    "v_EW": 246220,
}

print("\nSearching for high primes in mass ratios...")
print("-"*70)

found_matches = []

for p in sorted(all_framework_primes):
    if p > 137 and p < 350:
        for name1, m1 in extended_constants.items():
            for name2, m2 in extended_constants.items():
                if m1 > m2:
                    ratio = m1 / m2
                    for n in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]:
                        for d in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]:
                            target = p * n / d
                            if 0.5 < ratio < 200 and abs(ratio - target) / target < 0.005:  # Within 0.5%
                                err = abs(ratio - target) / target * 100
                                found_matches.append((p, f"{name1}/{name2}", ratio, n, d, err))

# Remove duplicates and sort by error
seen = set()
unique_matches = []
for match in found_matches:
    key = (match[0], match[1])
    if key not in seen:
        seen.add(key)
        unique_matches.append(match)

unique_matches.sort(key=lambda x: x[5])  # Sort by error

print("\nBest matches (< 0.5% error):")
for p, names, ratio, n, d, err in unique_matches[:20]:
    if p > 137:
        frac = f"{p}x{n}/{d}" if n > 1 or d > 1 else str(p)
        print(f"  {names} = {ratio:.4f} ~ {frac} = {p*n/d:.4f} (err: {err:.3f}%)")
        print(f"    Prime {p} form: ", end="")
        if p in two_square_primes:
            a, b = two_square_primes[p][0]
            print(f"{a}^2 + {b}^2")
        elif p in three_square_primes:
            form = three_square_primes[p][0]
            print(" + ".join([f"{d}^2" for d in form]))
        else:
            print("(higher form)")

# ============================================================================
# SUMMARY
# ============================================================================

print("\n" + "="*70)
print("SUMMARY")
print("="*70)

print(f"""
KEY FINDINGS:

1. TWO-SQUARE PRIMES (a^2 + b^2):
   {sorted(two_square_primes.keys())}
   Total: {len(two_square_primes)}
   Highest: {max(two_square_primes.keys())}

2. UNIQUE THREE-SQUARE PRIMES (not expressible as two squares):
   First few: {sorted(unique_three.keys())[:10]}
   Total: {len(unique_three)}

3. UNIQUE FOUR-SQUARE PRIMES (not expressible as fewer squares):
   First few: {sorted(unique_four.keys())[:10] if unique_four else "None"}
   Total: {len(unique_four)}

4. HIGH FRAMEWORK PRIMES (> 137):
   - 139 = 3^2 + 3^2 + 11^2 (double generation + crystal)
   - 179 = 3^2 + 7^2 + 11^2 (generation + color + crystal) - ALL THREE!
   - 251 = 3^2 + 11^2 + 11^2 (generation + double crystal)

5. PRIMES NOT EXPRESSIBLE (< 200):
   {[p for p in non_framework if p < 200]}
   These should appear in COMPOSITE particle ratios only.

6. SPECIAL PRIME 179:
   179 = 3^2 + 7^2 + 11^2 = Im_H^2 + Im_O^2 + n_c^2
   This is the ONLY prime combining ALL THREE structural dimensions!
   Should appear in something that involves generations, color, AND crystal.
""")

# Final tests
tests = [
    ("All two-square primes catalogued", len(two_square_primes) == 10),
    ("137 is highest two-square", max(two_square_primes.keys()) == 137),
    ("139 is three-square", 139 in three_square_primes),
    ("179 is three-square (all structural)", 179 in three_square_primes),
    ("251 is three-square", 251 in three_square_primes),
    ("High primes exist", len(high_primes) > 20),
]

print("\n=== VERIFICATION ===")
all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print(f"\nOverall: {'PASS' if all_pass else 'FAIL'}")
