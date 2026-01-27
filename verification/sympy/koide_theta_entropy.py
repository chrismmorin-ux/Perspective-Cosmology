# -*- coding: utf-8 -*-
"""
Koide Phase theta: Entropy Maximization Approach

The previous analysis showed theta_max_entropy ~ 2.36, close to observed 2.317.
Let's refine this and see if entropy maximization + constraints gives the formula.

Session 74: Refined entropy analysis.
"""

import numpy as np

print("=" * 70)
print("KOIDE PHASE theta: ENTROPY ANALYSIS")
print("=" * 70)

# ============================================================
# PART 1: Precise Entropy Calculation
# ============================================================

print("\n" + "=" * 70)
print("PART 1: Precise Entropy vs theta")
print("=" * 70)

def get_masses(theta, M=313.84):
    """Get masses for given theta."""
    masses = []
    for i in range(3):
        sqrt_m = np.sqrt(M) * (1 + np.sqrt(2) * np.cos(theta + 2*np.pi*i/3))
        if sqrt_m > 0:
            masses.append(sqrt_m**2)
        else:
            return None
    return masses

def mass_entropy(theta, M=313.84):
    """Entropy of mass distribution."""
    masses = get_masses(theta, M)
    if masses is None:
        return -np.inf

    M_total = sum(masses)
    probs = [m/M_total for m in masses]
    entropy = -sum(p * np.log(p) for p in probs if p > 0)
    return entropy

# Fine grid search
thetas = np.linspace(0.01, np.pi - 0.01, 10000)
entropies = [mass_entropy(t) for t in thetas]

# Find maximum
max_idx = np.argmax(entropies)
theta_max_S = thetas[max_idx]
max_S = entropies[max_idx]

# Formula prediction
theta_formula = np.pi * 73 / 99
theta_observed = 2.316666

print(f"Maximum entropy theta: {theta_max_S:.6f} rad")
print(f"Maximum entropy value: {max_S:.6f}")
print(f"Observed theta: {theta_observed:.6f} rad")
print(f"Formula theta: {theta_formula:.6f} rad")
print(f"")
print(f"Difference (max_S - observed): {abs(theta_max_S - theta_observed):.6f} rad")
print(f"Difference (max_S - observed): {abs(theta_max_S - theta_observed)/theta_observed * 100:.2f}%")

# ============================================================
# PART 2: The Valid Range of theta
# ============================================================

print("\n" + "=" * 70)
print("PART 2: Valid theta Range (where all masses positive)")
print("=" * 70)

# Find the range where all masses are positive
valid_thetas = []
for t in np.linspace(0, 2*np.pi, 1000):
    masses = get_masses(t)
    if masses is not None and all(m > 0 for m in masses):
        valid_thetas.append(t)

if valid_thetas:
    print(f"Valid theta range: [{min(valid_thetas):.4f}, {max(valid_thetas):.4f}] rad")
    print(f"Observed theta {theta_observed:.4f} in valid range: {min(valid_thetas) <= theta_observed <= max(valid_thetas)}")

# ============================================================
# PART 3: Entropy with Constraints
# ============================================================

print("\n" + "=" * 70)
print("PART 3: Constrained Entropy Maximization")
print("=" * 70)

print("""
What if theta maximizes entropy SUBJECT TO constraints?

Possible constraints:
1. Mass ratios must be "natural" (not fine-tuned)
2. Hierarchy must be compatible with O-H structure
3. Total mass must satisfy some condition
""")

# Check: at observed theta, what are the mass ratios?
masses_obs = get_masses(theta_observed)
if masses_obs:
    masses_sorted = sorted(masses_obs)
    print(f"\nAt observed theta = {theta_observed:.4f}:")
    print(f"  Masses: {[f'{m:.4f}' for m in masses_sorted]} MeV")
    print(f"  Ratios: m2/m1 = {masses_sorted[1]/masses_sorted[0]:.2f}, m3/m2 = {masses_sorted[2]/masses_sorted[1]:.2f}")
    print(f"  Entropy: {mass_entropy(theta_observed):.6f}")

# At max entropy theta
masses_max = get_masses(theta_max_S)
if masses_max:
    masses_sorted = sorted(masses_max)
    print(f"\nAt max entropy theta = {theta_max_S:.4f}:")
    print(f"  Masses: {[f'{m:.4f}' for m in masses_sorted]} MeV")
    print(f"  Ratios: m2/m1 = {masses_sorted[1]/masses_sorted[0]:.2f}, m3/m2 = {masses_sorted[2]/masses_sorted[1]:.2f}")
    print(f"  Entropy: {mass_entropy(theta_max_S):.6f}")

# ============================================================
# PART 4: Does 73/99 Have Entropy Meaning?
# ============================================================

print("\n" + "=" * 70)
print("PART 4: Does 73/99 Encode Entropy Information?")
print("=" * 70)

# Maximum entropy for 3 equal masses
S_max = np.log(3)  # = 1.0986...
print(f"Maximum possible entropy (equal masses): S_max = ln(3) = {S_max:.6f}")

# Entropy at observed theta
S_obs = mass_entropy(theta_observed)
print(f"Entropy at observed theta: S_obs = {S_obs:.6f}")
print(f"Ratio: S_obs / S_max = {S_obs / S_max:.6f}")

# Does 73/99 relate to this ratio?
print(f"\n73/99 = {73/99:.6f}")
print(f"1 - 73/99 = {1 - 73/99:.6f}")

# Check if there's a relationship
ratio_73_99 = 73/99
print(f"\nS_obs / S_max vs various functions of 73/99:")
print(f"  S_obs/S_max = {S_obs/S_max:.6f}")
print(f"  1 - 73/99 = {1 - ratio_73_99:.6f}")
print(f"  (73/99)^2 = {ratio_73_99**2:.6f}")
print(f"  sqrt(1 - 73/99) = {np.sqrt(1 - ratio_73_99):.6f}")

# ============================================================
# PART 5: Alternative: Information-Theoretic Derivation
# ============================================================

print("\n" + "=" * 70)
print("PART 5: Information-Theoretic Interpretation")
print("=" * 70)

print("""
HYPOTHESIS: theta encodes the information content of the O-H system.

The Shannon information in a dimension count is I = log2(dim).

Information content:
  I(O) = log2(8) = 3 bits
  I(Im(H)) = log2(3) = 1.585 bits
  I(n_c) = log2(11) = 3.459 bits
""")

I_O = np.log2(8)
I_ImH = np.log2(3)
I_nc = np.log2(11)

print(f"I(O) = log2(8) = {I_O:.4f} bits")
print(f"I(Im(H)) = log2(3) = {I_ImH:.4f} bits")
print(f"I(n_c) = log2(11) = {I_nc:.4f} bits")

# Try combinations
combos = [
    ("(I(O) + I(Im(H))) / I(n_c)", (I_O + I_ImH) / I_nc),
    ("I(O) / (I(Im(H)) + I(n_c))", I_O / (I_ImH + I_nc)),
    ("(I(O)^2 + I(Im(H))^2) / (I(Im(H))^2 * I(n_c))", (I_O**2 + I_ImH**2) / (I_ImH**2 * I_nc)),
]

print(f"\nLooking for theta/pi = {theta_observed/np.pi:.6f}:")
for name, value in combos:
    error = abs(value - theta_observed/np.pi) / (theta_observed/np.pi) * 100
    print(f"  {name} = {value:.6f} (error {error:.2f}%)")

# ============================================================
# PART 6: The Phase as a Pythagorean Angle
# ============================================================

print("\n" + "=" * 70)
print("PART 6: Pythagorean Angle Interpretation")
print("=" * 70)

print("""
The formula theta/pi = (O^2 + Im(H)^2) / (Im(H)^2 * n_c) can be written as:

  theta/pi = |v|^2 / N

where v = (O, Im(H)) = (8, 3) is a vector in 2D space.

Now |v|^2 = 73 is a sum of two squares. By Fermat's theorem on sums of
two squares, 73 can be written as a^2 + b^2 because 73 = 1 (mod 4).

The angle that v makes with the x-axis:
  phi = arctan(Im(H)/O) = arctan(3/8)
""")

v = np.array([8, 3])
v_mag_sq = np.dot(v, v)
phi = np.arctan2(3, 8)

print(f"|v|^2 = 8^2 + 3^2 = {v_mag_sq}")
print(f"phi = arctan(3/8) = {phi:.6f} rad = {np.degrees(phi):.2f} deg")

# The formula says theta/pi = |v|^2 / N where N = Im(H)^2 * n_c
N = 9 * 11
print(f"\nN = Im(H)^2 * n_c = 9 * 11 = {N}")
print(f"theta/pi = |v|^2 / N = 73/99 = {v_mag_sq/N:.6f}")

# Connection between phi and theta?
print(f"\nConnection between phi and theta:")
print(f"  theta = {theta_observed:.4f} rad")
print(f"  phi = {phi:.4f} rad")
print(f"  theta/phi = {theta_observed/phi:.4f}")
print(f"  theta - 2*phi = {theta_observed - 2*phi:.4f}")
print(f"  pi - theta - phi = {np.pi - theta_observed - phi:.4f}")

# ============================================================
# PART 7: The Role of 73 Being Prime
# ============================================================

print("\n" + "=" * 70)
print("PART 7: The Significance of 73 Being Prime")
print("=" * 70)

print("""
73 = 8^2 + 3^2 is PRIME.

In the crystallization picture, primes are "irreducible" directions.
A prime cannot be factored, so it represents a fundamental direction.

Could theta/pi = 73/99 mean:
  "The Koide phase points in an IRREDUCIBLE direction (73)
   within the generation-crystal space (99)"?

This would explain why the specific value 73:
  - It's the smallest prime of the form O^2 + Im(H)^2
  - It can't be decomposed further
  - It represents a "fundamental" orientation
""")

# Check: is 73 the smallest prime of form a^2 + b^2 where a > b > 1?
print("\nPrimes of form a^2 + b^2 (a > b > 1):")
count = 0
for p in [5, 13, 17, 29, 37, 41, 53, 61, 73, 89, 97]:
    for a in range(2, 15):
        for b in range(2, a):
            if a*a + b*b == p:
                print(f"  {p} = {a}^2 + {b}^2")
                count += 1
                break
        else:
            continue
        break

# ============================================================
# SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("SUMMARY: theta Derivation Status")
print("=" * 70)

print(f"""
FORMULA: theta = pi * 73/99 (0.006% match)

INTERPRETATIONS EXPLORED:

1. ENTROPY MAXIMIZATION: Close but not exact
   - Max entropy theta = {theta_max_S:.4f}
   - Observed theta = {theta_observed:.4f}
   - Difference: {abs(theta_max_S - theta_observed)/theta_observed * 100:.2f}%

2. PYTHAGOREAN STRUCTURE:
   - theta/pi = |v|^2 / N where v = (O, Im(H))
   - This is a normalized squared-distance
   - Geometrically sensible but not derived

3. PRIME IRREDUCIBILITY:
   - 73 is prime = "irreducible direction"
   - May connect to crystallization picture
   - Conceptually appealing but not proven

4. INFORMATION CONTENT:
   - No simple formula found using log2 dimensions

STATUS: theta formula MATCHED but not DERIVED
- We have compelling interpretations
- We don't have a proof from first principles
- The entropy approach is closest (within 2%)

CONJECTURE: theta selects a "nearly maximum entropy" configuration
constrained by the requirement that 73 be prime (irreducible).
""")
