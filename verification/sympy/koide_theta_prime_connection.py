"""
Koide Phase theta: Connection to Prime Numbers?

The Koide phase theta = 2.317 rad (132.7 deg) determines the lepton mass hierarchy.
Does it connect to the prime/crystallization work?

Session 61: Exploring potential connections.
"""

import numpy as np

# Observed Koide phase
theta_observed = 2.316666  # radians (from koide_formula_investigation.py)
theta_over_pi = theta_observed / np.pi

print("=" * 70)
print("KOIDE PHASE theta: PRIME NUMBER CONNECTIONS?")
print("=" * 70)

print(f"\nObserved values:")
print(f"  theta = {theta_observed:.6f} rad = {np.degrees(theta_observed):.4f} deg")
print(f"  theta/pi = {theta_over_pi:.6f}")

# ============================================================
# Check 1: Is theta/pi related to 2/e?
# ============================================================

print("\n" + "=" * 70)
print("CHECK 1: Connection to e (natural logarithm base)")
print("=" * 70)

# 2/e appears in prime distribution via ln
two_over_e = 2 / np.e
theta_from_e = np.pi * two_over_e

print(f"\n2/e = {two_over_e:.6f}")
print(f"pi * (2/e) = {theta_from_e:.6f} rad")
print(f"Observed theta = {theta_observed:.6f} rad")
print(f"Error = {abs(theta_from_e - theta_observed)/theta_observed * 100:.4f}%")

# Why would 2/e appear?
print(f"""
If theta = 2pi/e, this would connect:
  - 2 = dim(C) (complex structure)
  - e = base of natural logarithm
  - ln appears in prime distribution: pi(n) ~ n/ln(n)

This suggests: The Koide phase encodes how the complex structure
(dim = 2) interacts with the prime-based crystal structure.
""")

# ============================================================
# Check 2: theta related to prime ratios?
# ============================================================

print("=" * 70)
print("CHECK 2: Prime number ratios")
print("=" * 70)

primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]

print(f"\nLooking for prime ratios p/q ~ theta/pi = {theta_over_pi:.4f}:")
for i, p in enumerate(primes):
    for q in primes[i+1:]:
        ratio = p / q
        if abs(ratio - theta_over_pi) < 0.01:
            print(f"  {p}/{q} = {ratio:.4f} (error {abs(ratio-theta_over_pi)/theta_over_pi*100:.2f}%)")

# Also check (p-1)/(q-1) type ratios
print(f"\nLooking for (p-1)/(q-1) ratios:")
for p in primes[1:]:
    for q in primes:
        if q > p:
            ratio = (p-1) / (q-1)
            if abs(ratio - theta_over_pi) < 0.01:
                print(f"  ({p}-1)/({q}-1) = {ratio:.4f}")

# ============================================================
# Check 3: theta from ln of small integers?
# ============================================================

print("\n" + "=" * 70)
print("CHECK 3: Logarithmic combinations")
print("=" * 70)

print(f"\nSimple logarithms:")
print(f"  ln(2) = {np.log(2):.4f}")
print(f"  ln(3) = {np.log(3):.4f}")
print(f"  ln(5) = {np.log(5):.4f}")
print(f"  ln(7) = {np.log(7):.4f}")
print(f"  ln(10) = {np.log(10):.4f}")

print(f"\nCombinations near theta = {theta_observed:.4f}:")
print(f"  2*ln(3) = {2*np.log(3):.4f} (error {abs(2*np.log(3)-theta_observed)/theta_observed*100:.2f}%)")
print(f"  ln(2)+ln(3)+ln(e) = ln(6e) = {np.log(6*np.e):.4f} (error {abs(np.log(6*np.e)-theta_observed)/theta_observed*100:.2f}%)")
print(f"  ln(10) = {np.log(10):.4f} (error {abs(np.log(10)-theta_observed)/theta_observed*100:.2f}%)")

# Check ln(10) + adjustment
print(f"  ln(10) + 0.01 = {np.log(10)+0.01:.4f}")

# ============================================================
# Check 4: Division algebra dimensions
# ============================================================

print("\n" + "=" * 70)
print("CHECK 4: Division algebra dimension combinations")
print("=" * 70)

# Division algebra dimensions
R, C, H, O = 1, 2, 4, 8
ImC, ImH, ImO = 1, 3, 7

print(f"\nDivision algebra dimensions: R={R}, C={C}, H={H}, O={O}")
print(f"Imaginary parts: Im(C)={ImC}, Im(H)={ImH}, Im(O)={ImO}")

# Check combinations
combos = [
    ("C/e", C/np.e),
    ("H/e", H/np.e),
    ("(C+H)/e", (C+H)/np.e),
    ("Im(H)/e", ImH/np.e),
    ("(Im(H)+Im(C))/e", (ImH+ImC)/np.e),
    ("C*ln(C)", C*np.log(C)),
    ("C*ln(H)", C*np.log(H)),
    ("ln(O)", np.log(O)),
    ("ln(C*H)", np.log(C*H)),
]

print(f"\nCombinations (looking for theta/pi ~ {theta_over_pi:.4f}):")
for name, val in combos:
    if abs(val - theta_over_pi) < 0.1:
        print(f"  {name} = {val:.4f} (error {abs(val-theta_over_pi)/theta_over_pi*100:.2f}%)")

print(f"\nCombinations (looking for theta ~ {theta_observed:.4f}):")
for name, val in combos:
    val_rad = val * np.pi  # if theta/pi = val
    if abs(val_rad - theta_observed) < 0.3:
        print(f"  pi*{name} = {val_rad:.4f} (error {abs(val_rad-theta_observed)/theta_observed*100:.2f}%)")

# ============================================================
# Check 5: The 73/99 fraction
# ============================================================

print("\n" + "=" * 70)
print("CHECK 5: The fraction 73/99")
print("=" * 70)

print(f"\ntheta/pi ~ 73/99 = {73/99:.6f} (from earlier analysis)")
print(f"73 is PRIME")
print(f"99 = 9 * 11 = 3^2 * 11")
print(f"  - 3 = Im(H) (generation count)")
print(f"  - 11 = n_c (crystal dimensions)")

print(f"\nSo 73/99 involves:")
print(f"  - A prime (73)")
print(f"  - Im(H)^2 * n_c = 3^2 * 11 = 99")
print(f"\nThis could mean: theta/pi = prime / (generations^2 * crystal_dims)")

# Check: is there a pattern with 73?
print(f"\n73 = 72 + 1 = 8*9 + 1 = O * 9 + 1")
print(f"73 = 64 + 9 = O^2 + 9 = 8^2 + 3^2")
print(f"  -> 73 = dim(O)^2 + dim(Im(H))^2 !!!")

# Verify
print(f"\nVERIFY: 8^2 + 3^2 = {8**2 + 3**2}")
print(f"This gives: theta/pi = (O^2 + Im(H)^2) / (Im(H)^2 * n_c)")
print(f"          = (64 + 9) / (9 * 11)")
print(f"          = 73 / 99")
print(f"          = {73/99:.6f}")
print(f"Observed  = {theta_over_pi:.6f}")
print(f"Error     = {abs(73/99 - theta_over_pi)/theta_over_pi * 100:.4f}%")

# ============================================================
# Check 6: Best match summary
# ============================================================

print("\n" + "=" * 70)
print("SUMMARY: Best Matches for theta")
print("=" * 70)

candidates = [
    ("2pi/e (dim(C) * pi / e)", 2*np.pi/np.e, theta_observed),
    ("pi * 73/99 = pi(O^2 + Im(H)^2)/(Im(H)^2 * n_c)", np.pi * 73/99, theta_observed),
    ("ln(10.1)", np.log(10.1), theta_observed),
]

print(f"\nCandidate formulas for theta = {theta_observed:.6f} rad:")
for name, predicted, observed in candidates:
    error = abs(predicted - observed) / observed * 100
    print(f"  {name}")
    print(f"    = {predicted:.6f} rad, error = {error:.4f}%")
    print()

print("""
MOST PROMISING: theta/pi = 73/99 where:
  - 73 = 8^2 + 3^2 = dim(O)^2 + dim(Im(H))^2
  - 99 = 3^2 * 11 = Im(H)^2 * n_c

This connects the Koide phase to:
  - Octonion dimension (8) -- color structure
  - Quaternion imaginary dimension (3) -- generations
  - Crystal dimensions (11) -- internal space

The formula combines BOTH the mass-giving structure (H, generations)
AND the color structure (O) that makes quarks different from leptons!
""")
