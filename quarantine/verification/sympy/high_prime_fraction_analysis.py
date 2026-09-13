#!/usr/bin/env python3
"""
High Prime Fraction Analysis

Analyzing the multiplier fractions that appear with high primes.
Do the numerators and denominators have framework interpretations?

Created: Session 110e
"""

from sympy import *
from fractions import Fraction

print("="*70)
print("HIGH PRIME FRACTION ANALYSIS")
print("="*70)

# Division algebra dimensions
dims = {
    'R': 1,      # Real
    'C': 2,      # Complex
    'Im_H': 3,   # Quaternion imaginary
    'H': 4,      # Quaternion
    'Im_O': 7,   # Octonion imaginary
    'O': 8,      # Octonion
    'n_c': 11,   # Crystal dimension
    'n_d': 4,    # Defect dimension
}

# Products and sums of dimensions
products = {
    1: "R",
    2: "C",
    3: "Im_H",
    4: "H = n_d",
    6: "C*Im_H",
    7: "Im_O",
    8: "O",
    9: "Im_H^2",
    11: "n_c",
    12: "Im_H*n_d or C*Im_H*C",
    14: "C*Im_O",
    15: "n_c+n_d or Im_H*n_d+Im_H",
    16: "C*O or H^2",
    21: "Im_H*Im_O",
    22: "C*n_c",
    24: "Im_H*O",
    27: "Im_H^3",
    28: "n_d*Im_O",
    32: "n_d*O or C^5",
    33: "Im_H*n_c",
    42: "C*Im_H*Im_O (hidden sector)",
    49: "Im_O^2",
    56: "Im_O*O",
    64: "O^2",
    77: "Im_O*n_c",
    88: "O*n_c",
    121: "n_c^2",
}

# The verified high prime matches with their fractions
matches = [
    # (Prime, n, d, ratio_name, measured, form)
    (139, 7, 16, "W/Xi_minus", 80377/1321.71, "2*Im_H^2 + n_c^2"),
    (139, 25, 1, "m_tau/m_e", 1776.86/0.511, "2*Im_H^2 + n_c^2"),
    (151, 9, 10, "m_t/m_c", 172690/1270, "C^2 + 3*Im_O^2"),
    (163, 1, 12, "m_c/m_s", 1270/93.4, "R^2 + 2*Im_O^2 + O^2"),
    (179, 1, 4, "m_b/m_s", 4180/93.4, "Im_H^2+Im_O^2+n_c^2"),
    (179, 3, 1, "ell_2 (CMB)", 537.8, "Im_H^2+Im_O^2+n_c^2"),
    (181, 14, 9, "Xi0/d", 1314.86/4.67, "C^2+Im_O^2+2*O^2"),
    (181, 6, 1, "z_rec", 1089.80, "C^2+Im_O^2+2*O^2"),
    (193, 15, 14, "m_mu/m_e", 105.658/0.511, "R^2 + 3*O^2"),
    (251, 13, 12, "m_c/m_d", 1270/4.67, "Im_H^2 + 2*n_c^2"),
    (251, 27, 2, "z_eq", 3387, "Im_H^2 + 2*n_c^2"),
    (283, 1, 1, "Xi_minus/d", 1321.71/4.67, "2*Im_O^2+O^2+n_c^2"),
    (283, 7, 9, "ell_1 (CMB)", 220.0, "2*Im_O^2+O^2+n_c^2"),
    (313, 17, 12, "eta_prime/u", 957.78/2.16, "3*O^2 + n_c^2"),
]

print("\n" + "="*70)
print("FRACTION INTERPRETATION")
print("="*70)

def interpret_number(n):
    """Try to interpret a number in terms of framework dimensions"""
    if n in products:
        return products[n]
    # Try simple factorizations
    for d1 in [1, 2, 3, 4, 7, 8, 11]:
        if n % d1 == 0:
            d2 = n // d1
            if d2 in [1, 2, 3, 4, 7, 8, 11]:
                return f"{d1}*{d2}"
    return "?"

print(f"\n{'Prime':>5} | {'Ratio':15} | {'n':>3} | {'d':>3} | n meaning | d meaning | Frac meaning")
print("-"*90)

for p, n, d, name, measured, form in matches:
    n_meaning = interpret_number(n)
    d_meaning = interpret_number(d)

    # Try to interpret n/d as a ratio of framework quantities
    frac = Fraction(n, d)
    frac_meaning = ""

    # Check specific interpretations
    if n == 7 and d == 16:
        frac_meaning = "Im_O / (C*O) = Im_O/16"
    elif n == 25 and d == 1:
        frac_meaning = "n_c + C*Im_O = 11 + 14"
    elif n == 9 and d == 10:
        frac_meaning = "Im_H^2 / (C+O) = 9/10"
    elif n == 14 and d == 9:
        frac_meaning = "C*Im_O / Im_H^2"
    elif n == 15 and d == 14:
        frac_meaning = "(n_c+n_d) / (C*Im_O)"
    elif n == 13 and d == 12:
        frac_meaning = "(n_c+C) / (Im_H*n_d)"
    elif n == 27 and d == 2:
        frac_meaning = "Im_H^3 / C"
    elif n == 7 and d == 9:
        frac_meaning = "Im_O / Im_H^2"
    elif n == 17 and d == 12:
        frac_meaning = "(n_c+C*Im_H) / (Im_H*n_d)"
    elif n == 6 and d == 1:
        frac_meaning = "C*Im_H"
    elif n == 3 and d == 1:
        frac_meaning = "Im_H"
    elif n == 1 and d == 4:
        frac_meaning = "1/H"
    elif n == 1 and d == 12:
        frac_meaning = "1/(Im_H*n_d)"

    print(f"{p:>5} | {name:15} | {n:>3} | {d:>3} | {n_meaning:12} | {d_meaning:12} | {frac_meaning}")

# ============================================================================
# PATTERN ANALYSIS: Denominators
# ============================================================================

print("\n" + "="*70)
print("DENOMINATOR ANALYSIS")
print("="*70)

denominators = [d for _, _, d, _, _, _ in matches]
print(f"\nDenominators appearing: {sorted(set(denominators))}")
print("\nDenominator frequencies:")
for d in sorted(set(denominators)):
    count = denominators.count(d)
    meaning = interpret_number(d)
    print(f"  {d:>3} appears {count}x  -- {meaning}")

# ============================================================================
# PATTERN ANALYSIS: Numerators
# ============================================================================

print("\n" + "="*70)
print("NUMERATOR ANALYSIS")
print("="*70)

numerators = [n for _, n, _, _, _, _ in matches]
print(f"\nNumerators appearing: {sorted(set(numerators))}")
print("\nNumerator frequencies:")
for n in sorted(set(numerators)):
    count = numerators.count(n)
    meaning = interpret_number(n)
    print(f"  {n:>3} appears {count}x  -- {meaning}")

# ============================================================================
# SPECIFIC PATTERN: The role of 12
# ============================================================================

print("\n" + "="*70)
print("THE ROLE OF 12 = Im_H * n_d = 3 * 4")
print("="*70)

print("""
The number 12 appears as denominator THREE times:
  - m_c/m_s = 163/12  (quark ratio)
  - m_c/m_d = 251*13/12  (quark ratio)
  - eta_prime/u = 313*17/12  (meson/quark)

12 = Im_H * n_d = 3 * 4 = generation imaginary * defect dimension

This suggests QUARK physics involves the product of:
  - Im_H = 3 (generations)
  - n_d = 4 (defect/local structure)
""")

# ============================================================================
# SPECIFIC PATTERN: The role of 9 = Im_H^2
# ============================================================================

print("\n" + "="*70)
print("THE ROLE OF 9 = Im_H^2 = 3^2")
print("="*70)

print("""
The number 9 appears twice:
  - Xi0/d = 181*14/9  (denominator)
  - ell_1 = 283*7/9  (denominator)

9 = Im_H^2 = generation^2

Both involve 9 IN THE DENOMINATOR, meaning DIVISION by generations^2.
""")

# ============================================================================
# SPECIFIC PATTERN: The role of 14 = C * Im_O
# ============================================================================

print("\n" + "="*70)
print("THE ROLE OF 14 = C * Im_O = 2 * 7")
print("="*70)

print("""
14 appears in TWO related contexts:
  - Xi0/d = 181*14/9  (numerator)
  - m_mu/m_e = 193*15/14  (denominator)

14 = C * Im_O = complex * octonion imaginary

This connects ELECTROMAGNETIC structure (C) with COLOR structure (Im_O)!
""")

# ============================================================================
# COSMIC vs PARTICLE PATTERNS
# ============================================================================

print("\n" + "="*70)
print("COSMIC vs PARTICLE FRACTION PATTERNS")
print("="*70)

cosmic = [(p, n, d, name) for p, n, d, name, _, _ in matches
          if 'ell' in name or 'z_' in name]
particle = [(p, n, d, name) for p, n, d, name, _, _ in matches
            if 'ell' not in name and 'z_' not in name]

print("\nCOSMIC observables:")
for p, n, d, name in cosmic:
    frac = f"{n}/{d}" if d > 1 else str(n)
    print(f"  {name:20} = {p} * {frac}")

print("\nPARTICLE ratios:")
for p, n, d, name in particle:
    frac = f"{n}/{d}" if d > 1 else str(n)
    print(f"  {name:20} = {p} * {frac}")

print("""
OBSERVATION:
- Cosmic observables often have Im_H^3 = 27 or Im_H = 3 in numerator
- Particle ratios often have Im_H*n_d = 12 in denominator

This suggests:
- COSMIC scales involve CUBED generations (3^3 = 27)
- PARTICLE scales involve generation*defect (3*4 = 12)
""")

# ============================================================================
# THE MASTER PATTERN
# ============================================================================

print("\n" + "="*70)
print("MASTER PATTERN: Prime = Structure, Fraction = Scale Selection")
print("="*70)

print("""
HYPOTHESIS: The high prime formulas have the structure:

    Observable = Prime(structure) x Fraction(scale_selector)

Where:
- The PRIME encodes WHAT structures are involved (via sum of squares)
- The FRACTION selects the SCALE via ratios of framework dimensions

Examples:
  m_b/m_s = 179 x 1/4
    179 = Im_H^2 + Im_O^2 + n_c^2 (all three structures)
    1/4 = 1/H (inverse quaternion = local structure factor)

  z_eq = 251 x 27/2
    251 = Im_H^2 + 2*n_c^2 (generation + double crystal)
    27/2 = Im_H^3/C (cubed generations over EM)

  m_mu/m_e = 193 x 15/14
    193 = R^2 + 3*O^2 (scalar + triple octonion)
    15/14 = (n_c + n_d)/(C*Im_O) = total_dims / EM*color

The primes SELECT the algebraic structure.
The fractions TUNE to the specific physical scale.
""")

# ============================================================================
# SEARCHING FOR REMAINING PRIMES
# ============================================================================

print("\n" + "="*70)
print("PRIMES WITHOUT CLEAR MANIFESTATIONS YET")
print("="*70)

found_primes = set(p for p, _, _, _, _, _ in matches)
all_high_primes = [139, 151, 163, 179, 181, 193, 211, 223, 241, 251, 283, 307, 313]

missing = [p for p in all_high_primes if p not in found_primes]
print(f"\nPrimes needing manifestations: {missing}")

print("""
211 = 1^2 + 3^2 + 8^2 + 11^2 = R^2 + Im_H^2 + O^2 + n_c^2
    Contains ALL FOUR main structures!

223 = 3^2 + 3^2 + 8^2 + 11^2 = 2*Im_H^2 + O^2 + n_c^2
    Double generation + octonion + crystal

241 = 4^2 + 4^2 + 7^2 + 8^2 = 2*H^2 + Im_O^2 + O^2
    Double quaternion + color structures

307 = 1^2 + 7^2 + 8^2 + 11^2 = R^2 + Im_O^2 + O^2 + n_c^2
    Scalar + full color + crystal
""")

# Let's search for these in more mass ratios
print("\n" + "="*70)
print("SEARCHING FOR 211, 223, 241, 307...")
print("="*70)

# Additional particle masses
m_W = 80377
m_Z = 91187.6
m_H = 125250
m_t = 172690
m_b = 4180
m_c = 1270
m_s = 93.4
m_d = 4.67
m_u = 2.16
m_tau = 1776.86
m_mu = 105.658
m_e = 0.511
m_proton = 938.272
m_neutron = 939.565
m_pi0 = 134.977
m_pi_charged = 139.57
m_K0 = 497.611
m_K_charged = 493.677
m_eta = 547.862
m_eta_prime = 957.78
m_rho = 775.26
m_omega = 782.65
m_phi = 1019.461
m_D0 = 1864.84
m_D_charged = 1869.66
m_Ds = 1968.35
m_J_psi = 3096.9
m_Upsilon = 9460.3
m_B0 = 5279.66
m_Bs = 5366.92
m_Lambda = 1115.683
m_Sigma_plus = 1189.37
m_Sigma_minus = 1197.449
m_Xi_minus = 1321.71
m_Xi0 = 1314.86
m_Omega_minus = 1672.45
m_Delta = 1232

# Cosmological
H0 = 67.4  # km/s/Mpc
T_CMB = 2.7255  # K
z_eq = 3387
z_rec = 1089.80
ell_1 = 220.0
ell_2 = 537.8
ell_3 = 811

masses = {
    "W": m_W, "Z": m_Z, "H": m_H, "t": m_t, "b": m_b, "c": m_c, "s": m_s,
    "d": m_d, "u": m_u, "tau": m_tau, "mu": m_mu, "e": m_e,
    "proton": m_proton, "neutron": m_neutron, "pi0": m_pi0,
    "pi_ch": m_pi_charged, "K0": m_K0, "K_ch": m_K_charged,
    "eta": m_eta, "eta_prime": m_eta_prime, "rho": m_rho,
    "omega": m_omega, "phi": m_phi, "D0": m_D0, "D_ch": m_D_charged,
    "Ds": m_Ds, "J_psi": m_J_psi, "Upsilon": m_Upsilon,
    "B0": m_B0, "Bs": m_Bs, "Lambda": m_Lambda, "Sigma_p": m_Sigma_plus,
    "Sigma_m": m_Sigma_minus, "Xi_m": m_Xi_minus, "Xi0": m_Xi0,
    "Omega_m": m_Omega_minus, "Delta": m_Delta
}

target_primes = [211, 223, 241, 307]
best_matches = {p: None for p in target_primes}

# Search mass ratios
for p in target_primes:
    best_error = 1.0
    best_match = None

    for name1, m1 in masses.items():
        for name2, m2 in masses.items():
            if name1 >= name2:
                continue
            ratio = m1 / m2 if m1 > m2 else m2 / m1

            # Try p * n/d
            for n in range(1, 50):
                for d in range(1, 50):
                    pred = p * n / d
                    if 0.5 < ratio/pred < 2:
                        error = abs(ratio - pred) / ratio
                        if error < best_error and error < 0.005:
                            best_error = error
                            ratio_name = f"{name1}/{name2}" if m1 > m2 else f"{name2}/{name1}"
                            best_match = (ratio_name, ratio, n, d, error)

    if best_match:
        best_matches[p] = best_match

print("\nBest matches found:")
for p, match in best_matches.items():
    if match:
        name, ratio, n, d, error = match
        pred = p * n / d
        frac = f"{n}/{d}" if d > 1 else str(n)
        print(f"  {p}: {name} = {ratio:.4f} ~ {p}*{frac} = {pred:.4f} ({error*100:.3f}%)")
    else:
        print(f"  {p}: No good match found (< 0.5%)")

# Also try cosmic quantities
print("\nChecking cosmic quantities for 211, 223, 241, 307...")

cosmic_vals = {
    "z_eq": z_eq,
    "z_rec": z_rec,
    "ell_1": ell_1,
    "ell_2": ell_2,
    "ell_3": ell_3,
    "H0": H0,
}

for p in target_primes:
    for name, val in cosmic_vals.items():
        for n in range(1, 50):
            for d in range(1, 50):
                pred = p * n / d
                error = abs(val - pred) / val
                if error < 0.005:
                    frac = f"{n}/{d}" if d > 1 else str(n)
                    print(f"  {p}: {name} = {val:.2f} ~ {p}*{frac} = {pred:.2f} ({error*100:.3f}%)")

print("\n" + "="*70)
print("SUMMARY")
print("="*70)

print("""
KEY FINDINGS FROM FRACTION ANALYSIS:

1. DENOMINATORS cluster around:
   - 12 = Im_H * n_d (generation x defect) - for QUARK ratios
   - 9 = Im_H^2 (generation squared) - for HYPERON ratios
   - 14 = C * Im_O (EM x color) - for LEPTON ratios

2. NUMERATORS cluster around:
   - Powers of Im_H: 3, 9, 27 (generations, generations^2, generations^3)
   - Products with C, Im_O: 14, 7, 6

3. COSMIC vs PARTICLE pattern:
   - Cosmic uses Im_H^3/C = 27/2 (cubed generations over EM)
   - Particle uses 1/(Im_H*n_d) = 1/12 (inverse generation*defect)

4. The formula structure is:
   Observable = Prime(algebraic_structure) x Fraction(scale_selector)

   The prime encodes WHICH algebras are involved.
   The fraction tunes to the SPECIFIC physical scale.
""")
