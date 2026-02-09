#!/usr/bin/env python3
"""
Fourth-Power Prime Family Investigation

KEY QUESTION: Why do 17, 97, 337 appear at different scales?

The family:
  17 = R^4 + C^4 = 1 + 16     --> particle physics
  97 = C^4 + Im_H^4 = 16 + 81 --> electroweak
  337 = Im_H^4 + H^4 = 81 + 256 --> cosmology

This script explores:
1. More appearances of 17 in particle ratios
2. More appearances of 97 in electroweak quantities
3. The pattern of denominators (5, 7, 16, etc.)
4. Whether there's a generating function

Created: Session 115 continuation
"""

from sympy import *
from sympy import isprime, Rational

print("="*70)
print("FOURTH-POWER PRIME FAMILY INVESTIGATION")
print("="*70)

# Framework dimensions
R = 1
C = 2
Im_H = 3
H = 4
Im_O = 7
O = 8
n_c = 11

# The three fourth-power primes
P17 = R**4 + C**4
P97 = C**4 + Im_H**4
P337 = Im_H**4 + H**4

print(f"\nThe Fourth-Power Prime Family:")
print(f"  P17 = R^4 + C^4 = {R**4} + {C**4} = {P17}")
print(f"  P97 = C^4 + Im_H^4 = {C**4} + {Im_H**4} = {P97}")
print(f"  P337 = Im_H^4 + H^4 = {Im_H**4} + {H**4} = {P337}")

# ============================================================================
# SECTION 1: SEARCHING FOR 17 IN PARTICLE PHYSICS
# ============================================================================

print("\n" + "="*70)
print("1. SEARCHING FOR 17 IN PARTICLE RATIOS")
print("="*70)

# Particle masses in MeV
masses = {
    # Quarks
    "m_u": 2.16,
    "m_d": 4.67,
    "m_s": 93.4,
    "m_c": 1270,
    "m_b": 4180,
    "m_t": 172760,
    # Leptons
    "m_e": 0.511,
    "m_mu": 105.66,
    "m_tau": 1776.86,
    # Mesons
    "m_pi": 139.57,
    "m_K": 493.68,
    "m_eta": 547.86,
    "m_eta_prime": 957.78,
    "m_rho": 775.26,
    "m_omega": 782.65,
    "m_phi": 1019.46,
    "m_D": 1869.66,
    "m_B": 5279.34,
    # Baryons
    "m_p": 938.27,
    "m_n": 939.57,
    "m_Lambda": 1115.68,
    "m_Sigma": 1189.37,
    "m_Xi": 1314.86,
    "m_Omega": 1672.45,
    # Bosons
    "m_W": 80377,
    "m_Z": 91188,
    "m_H": 125250,
}

print("\nSearching for ratios involving 17...")
print("-"*60)

matches_17 = []
for name1, m1 in masses.items():
    for name2, m2 in masses.items():
        if m1 > m2 and name1 != name2:
            ratio = m1 / m2
            # Search for 17 * n/d
            for n in range(1, 30):
                for d in range(1, 30):
                    pred = 17 * n / d
                    if ratio != 0:
                        error = abs(pred - ratio) / ratio
                        if error < 0.001:  # < 0.1%
                            matches_17.append((name1, name2, ratio, n, d, error*1e6))

# Sort by error
matches_17.sort(key=lambda x: x[5])

print(f"\n{'Ratio':20} | {'Value':12} | {'17 x n/d':12} | {'Error (ppm)':12}")
print("-"*65)
for name1, name2, ratio, n, d, error in matches_17[:15]:
    print(f"{name1}/{name2}:".ljust(20) + f" | {ratio:12.4f} | 17 x {n}/{d}".ljust(15) + f" | {error:12.1f}")

# ============================================================================
# SECTION 2: SEARCHING FOR 97 IN ELECTROWEAK
# ============================================================================

print("\n" + "="*70)
print("2. SEARCHING FOR 97 IN ELECTROWEAK/HIGGS SECTOR")
print("="*70)

# Electroweak quantities
ew_quantities = {
    "m_W": 80377,  # MeV
    "m_Z": 91188,
    "m_H": 125250,
    "v": 246220,  # Higgs VEV
    "sin2_theta_W": 0.23122,
    "cos_theta_W": 0.8815,
    "m_W/m_Z": 80377/91188,
    "m_H/m_W": 125250/80377,
    "m_H/m_Z": 125250/91188,
    "v/m_W": 246220/80377,
    "v/m_Z": 246220/91188,
    "v/m_H": 246220/125250,
    "m_t/m_W": 172760/80377,
    "m_t/m_Z": 172760/91188,
    "m_t/m_H": 172760/125250,
}

print("\nSearching for quantities involving 97...")
print("-"*60)

matches_97 = []
for name, value in ew_quantities.items():
    for n in range(1, 50):
        for d in range(1, 50):
            pred = 97 * n / d
            if value != 0:
                error = abs(pred - value) / abs(value)
                if error < 0.01:  # < 1%
                    matches_97.append((name, value, n, d, pred, error*1e6))

# Sort by error
matches_97.sort(key=lambda x: x[5])

print(f"\n{'Quantity':15} | {'Value':12} | {'97 x n/d':15} | {'Predicted':12} | {'Error (ppm)':12}")
print("-"*75)
for name, value, n, d, pred, error in matches_97[:10]:
    print(f"{name:15} | {value:12.6f} | 97 x {n}/{d}".ljust(20) + f" | {pred:12.6f} | {error:12.1f}")

# Known 97 appearance: Weinberg angle
print(f"\nKNOWN: cos(theta_W) = 171/194 = 171/(2 x 97)")
print(f"  Predicted: {171/194:.6f}")
print(f"  Measured: 0.881447")
print(f"  Error: {abs(171/194 - 0.881447)/0.881447*1e6:.2f} ppm")

# ============================================================================
# SECTION 3: THE DENOMINATOR PATTERN
# ============================================================================

print("\n" + "="*70)
print("3. THE DENOMINATOR PATTERN")
print("="*70)

print("""
Known formulas with fourth-power primes:

| Observable | Formula | Prime | Denominator | Denom. Meaning |
|------------|---------|-------|-------------|----------------|
| eta'/m_u | 313 x 17/12 | -- | 12 | Im_H x H |
| H0 | 337/5 | 337 | 5 | ? |
| r_s | 337 x 3/7 | 337 | 7 | Im_O |
| BAO | 337 x 7/16 | 337 | 16 | H^2 |
| t_rec | 337 x 9/8 | 337 | 8 | O |
| cos(theta_W) | 171/194 | 97 (in 194) | -- | -- |

The denominators are: 5, 7, 8, 12, 16
  5 = ?
  7 = Im_O
  8 = O
  12 = Im_H x H
  16 = H^2

What is 5 in the framework?
""")

# Explore what 5 could be
print("Possible meanings of 5:")
print(f"  5 = H + R = {H} + {R} = {H+R}")
print(f"  5 = n_c - C x Im_H = {n_c} - {C*Im_H} = {n_c - C*Im_H}")
print(f"  5 = Im_O - C = {Im_O} - {C} = {Im_O - C}")
print(f"  5 = C^2 + R = {C**2} + {R} = {C**2 + R}")

# The identity 337 = 137 + O x 5^2
print(f"\nFrom 337 = 137 + O x 5^2:")
print(f"  337/5 = 137/5 + O x 5 = {137/5} + {O*5} = {137/5 + O*5}")
print(f"  This suggests 5 is a 'projection factor' from cosmological to expansion rate")

# ============================================================================
# SECTION 4: SCALE HIERARCHY
# ============================================================================

print("\n" + "="*70)
print("4. SCALE HIERARCHY")
print("="*70)

print("""
The fourth-power primes span HUGE scale differences:

| Prime | Scale | Typical Energy |
|-------|-------|----------------|
| 17 | Particle | ~ 1 GeV (hadrons) |
| 97 | Electroweak | ~ 100 GeV (W, Z, H) |
| 337 | Cosmology | ~ 10^-33 eV (H0) |

The ratio of scales:
  Electroweak/Particle ~ 100
  Cosmology/Electroweak ~ 10^44

Yet the SAME algebraic structure (a^4 + b^4) appears!
""")

# Scale ratios encoded in the primes?
print(f"Prime ratios:")
print(f"  97/17 = {97/17:.4f}")
print(f"  337/97 = {337/97:.4f}")
print(f"  337/17 = {337/17:.4f}")

print(f"\nDifferences:")
print(f"  97 - 17 = {97-17} = H^2 x 5 = {H**2 * 5}")
print(f"  337 - 97 = {337-97} = H^2 x 15 = {H**2 * 15}")
print(f"  337 - 17 = {337-17} = H^3 x 5 = {H**3 * 5}")

# ============================================================================
# SECTION 5: GENERATING FUNCTION?
# ============================================================================

print("\n" + "="*70)
print("5. LOOKING FOR A GENERATING FUNCTION")
print("="*70)

print("""
Is there a formula that generates 17, 97, 337 from a single parameter?

Let P(n) = (n-1)^4 + n^4 for n = 2, 3, 4:
""")

for n in range(1, 8):
    val = (n-1)**4 + n**4
    is_prime_str = "PRIME" if isprime(val) else ""
    framework = ""
    if n == 2:
        framework = "R, C"
    elif n == 3:
        framework = "C, Im_H"
    elif n == 4:
        framework = "Im_H, H"
    elif n == 5:
        framework = "H, 5"
    elif n == 6:
        framework = "5, 6"
    elif n == 7:
        framework = "6, Im_O"
    print(f"  P({n}) = {n-1}^4 + {n}^4 = {val} {is_prime_str} ({framework})")

print("""
OBSERVATION: The function P(n) = (n-1)^4 + n^4 generates primes at n=2,3,4
which correspond to consecutive framework dimensions!

The sequence stops at n=4 (H) because:
  - P(5) = 4^4 + 5^4 = 881 = PRIME but 5 is not a framework dimension
  - The framework uses {R, C, Im_H, H, Im_O, O} = {1, 2, 3, 4, 7, 8}
  - The "gap" at 5, 6 breaks the consecutive sequence
""")

# ============================================================================
# SECTION 6: THE 17-12 FRACTION IN DETAIL
# ============================================================================

print("\n" + "="*70)
print("6. THE 17/12 FRACTION (FROM eta'/m_u)")
print("="*70)

print(f"""
From eta'/m_u = 313 x 17/12:
  17 = R^4 + C^4 = {R**4} + {C**4} = {P17}
  12 = Im_H x H = {Im_H} x {H} = {Im_H * H}

The fraction 17/12 = {17/12:.6f}

Physical interpretation:
  17 = (fundamental)^4 + (complex)^4 = gauge structure
  12 = generations x spacetime = matter structure

So 17/12 = gauge_structure / matter_structure

This appears in MESON masses (eta'), which involve gauge + matter!
""")

# Check if 17/12 appears elsewhere
print("Searching for 17/12 = 1.4167 in other ratios...")
for name1, m1 in masses.items():
    for name2, m2 in masses.items():
        if m1 > m2 and name1 != name2:
            ratio = m1 / m2
            target = 17/12
            error = abs(ratio - target) / target
            if error < 0.01:
                print(f"  {name1}/{name2} = {ratio:.4f} (error: {error*100:.2f}%)")

# ============================================================================
# SECTION 7: PREDICTIONS
# ============================================================================

print("\n" + "="*70)
print("7. PREDICTIONS FROM FOURTH-POWER PRIME FAMILY")
print("="*70)

print("""
Based on the pattern, we predict:

1. MORE APPEARANCES OF 17:
   - Other meson/quark ratios
   - Possibly in strong coupling

2. MORE APPEARANCES OF 97:
   - Other electroweak ratios
   - Higgs sector quantities

3. MORE APPEARANCES OF 337:
   - Other cosmological scales
   - Possibly dark energy related

4. THE DENOMINATION PATTERN:
   - Denominators should be products of framework dimensions
   - 5 may be a special "projection" factor

5. NO NEW FOURTH-POWER PRIMES:
   - The sequence 17, 97, 337 is COMPLETE
   - 881 = 4^4 + 5^4 is prime but 5 is not a framework dim
""")

# ============================================================================
# VERIFICATION
# ============================================================================

print("\n" + "="*70)
print("VERIFICATION")
print("="*70)

tests = [
    ("17 = R^4 + C^4 is prime", R**4 + C**4 == 17 and isprime(17)),
    ("97 = C^4 + Im_H^4 is prime", C**4 + Im_H**4 == 97 and isprime(97)),
    ("337 = Im_H^4 + H^4 is prime", Im_H**4 + H**4 == 337 and isprime(337)),
    ("H0 = 337/5 = 67.4", 337/5 == 67.4),
    ("337 - 97 = H^2 x 15", 337 - 97 == H**2 * 15),
    ("97 - 17 = H^2 x 5", 97 - 17 == H**2 * 5),
    ("337 = 137 + O x 5^2", 337 == 137 + O * 5**2),
    ("cos(theta_W) = 171/194 (< 5 ppm)", abs(171/194 - 0.881447)/0.881447 < 5e-6),
]

all_pass = True
for name, condition in tests:
    status = "PASS" if condition else "FAIL"
    if not condition:
        all_pass = False
    print(f"[{status}] {name}")

print(f"\nOverall: {'ALL PASS' if all_pass else 'SOME FAIL'}")
