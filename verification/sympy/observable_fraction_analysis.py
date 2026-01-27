"""
Observable Fraction Analysis
============================
Investigating whether 58/137 (observable) or 79/137 (hidden) has mathematical significance.

Session: 2026-01-26-35
"""

from sympy import sqrt, Rational, pi, cos, sin, atan, simplify, N, E
from sympy import factorial, binomial, log, exp, S

print("=" * 60)
print("PATH A: Is 79/137 ~ 1/sqrt(3) significant?")
print("=" * 60)

# Basic ratios
observable = 58
hidden = 79
total = 137

f_obs = Rational(observable, total)
f_hid = Rational(hidden, total)

print(f"\nBasic ratios:")
print(f"  Observable: {observable}/{total} = {N(f_obs, 10)}")
print(f"  Hidden:     {hidden}/{total} = {N(f_hid, 10)}")

# Compare to 1/sqrt(3)
inv_sqrt3 = 1/sqrt(3)
print(f"\nComparison to 1/sqrt(3):")
print(f"  1/sqrt(3) = {N(inv_sqrt3, 10)}")
print(f"  79/137 = {N(f_hid, 10)}")
print(f"  Difference: {N(f_hid - inv_sqrt3, 10)}")
print(f"  Relative error: {N(100 * abs(f_hid - inv_sqrt3) / inv_sqrt3, 6)}%")

# What would exact 1/sqrt(3) predict?
print(f"\nIf hidden fraction = exactly 1/sqrt(3):")
print(f"  Hidden channels = 137/sqrt(3) = {N(137/sqrt(3), 6)}")
print(f"  Actual hidden = 79")
print(f"  Difference = {N(137/sqrt(3) - 79, 4)} channels")

# Compare to other mathematical constants
print("\n" + "=" * 60)
print("Comparison to mathematical constants:")
print("=" * 60)

constants = [
    ("1/sqrt(3)", 1/sqrt(3)),
    ("1/sqrt2", 1/sqrt(2)),
    ("1/e", 1/E),
    ("1/pi", 1/pi),
    ("(sqrt5-1)/2 (1/phi)", (sqrt(5)-1)/2),
    ("2/pi", 2/pi),
    ("sqrt2/pi", sqrt(2)/pi),
    ("1/sqrt(2pi)", 1/sqrt(2*pi)),
    ("sin(30 deg)", sin(pi/6)),
    ("cos(60 deg)", cos(pi/3)),
    ("sin(35.26 deg) [tetrahedral]", sin(atan(1/sqrt(2)))),
    ("1/sqrt(3) (tan 30 deg)", 1/sqrt(3)),
]

print(f"\nTarget: 79/137 = {N(f_hid, 8)}")
print(f"\n{'Constant':<30} {'Value':<12} {'Error %':<10}")
print("-" * 55)

results = []
for name, val in constants:
    error_pct = abs(N(f_hid - val, 15) / N(val, 15)) * 100
    results.append((name, N(val, 8), error_pct))

# Sort by error
results.sort(key=lambda x: x[2])
for name, val, err in results:
    marker = " <-- BEST" if err < 0.2 else ""
    print(f"{name:<30} {val:<12} {err:<10.4f}{marker}")

# Geometric interpretation of 1/sqrt(3)
print("\n" + "=" * 60)
print("Geometric interpretation of 1/sqrt(3):")
print("=" * 60)

print("""
1/sqrt(3) appears in several geometric contexts:

1. TETRAHEDRAL ANGLE
   - Angle between face and base of regular tetrahedron
   - sin(theta) = 1/sqrt(3) where theta ~ 35.26 deg
   - Tetrahedron: simplest 3D simplex

2. CUBE DIAGONAL
   - Body diagonal of unit cube has length sqrt3
   - Projection onto face: 1/sqrt(3) of diagonal

3. EQUILATERAL TRIANGLE
   - Height/side ratio: sqrt3/2
   - But 1/sqrt(3) = 2/(sqrt3 x 2) = inverse relationship

4. 3D ISOTROPY
   - In 3D, each axis gets 1/3 of variance
   - Standard deviation per axis: 1/sqrt(3) of total

5. SU(2) REPRESENTATION
   - Clebsch-Gordan coefficients involve 1/sqrt(3)
   - Related to spin addition
""")

# Check if 58 has special properties
print("\n" + "=" * 60)
print("Properties of 58 and 79:")
print("=" * 60)

print(f"\n58 = 2 x 29 (29 is prime)")
print(f"79 = prime")
print(f"137 = prime")
print(f"\nAll three: 58, 79, 137 involve primes heavily")

# Factor the type breakdown
print(f"\nType breakdown:")
print(f"  Hidden scalars:  14 = 2 x 7")
print(f"  Hidden vectors:  49 = 7^2")
print(f"  Hidden fermions: 16 = 2^4")
print(f"  Total hidden:    79 (prime)")

print(f"\n  Observable scalars:  1")
print(f"  Observable vectors:  12 = 2^2 x 3")
print(f"  Observable fermions: 45 = 3^2 x 5")
print(f"  Total observable:    58 = 2 x 29")

# Check ratios by type
print("\n" + "=" * 60)
print("Hidden fraction BY TYPE:")
print("=" * 60)

types = [
    ("Scalar", 14, 15),
    ("Vector", 49, 61),
    ("Fermion", 16, 61),
]

print(f"\n{'Type':<12} {'Hidden':<8} {'Total':<8} {'Fraction':<12} {'Compare to':<20}")
print("-" * 65)

for name, hid, tot in types:
    frac = Rational(hid, tot)
    # Find closest simple fraction
    print(f"{name:<12} {hid:<8} {tot:<8} {N(frac, 6):<12}", end="")

    if name == "Scalar":
        print(f"14/15 ~ 1 - 1/15 (almost all hidden)")
    elif name == "Vector":
        print(f"49/61 ~ 0.803 (80% hidden)")
    else:
        print(f"16/61 ~ 0.262 (only 26% hidden!)")

print(f"\nKey observation: Fermions are mostly VISIBLE (74%)")
print(f"                Scalars are mostly HIDDEN (93%)")
print(f"                Vectors intermediate (80% hidden)")

# Is there a pattern?
print("\n" + "=" * 60)
print("Pattern analysis:")
print("=" * 60)

print("""
Hypothesis: Visibility correlates with SPIN

  Spin 0 (scalar):    7% visible  -> hardest to observe
  Spin 1 (vector):   20% visible  -> intermediate
  Spin 1/2 (fermion): 74% visible -> easiest to observe

This is OPPOSITE to what you'd expect from:
  - Mass (fermions are light, but so is photon)
  - Interaction strength (all types interact)

But CONSISTENT with:
  - Fermion number conservation -> fermions harder to "hide"
  - Pauli exclusion -> fermions must be distinct -> visible
  - Scalars can "condense" into vacuum -> hidden
""")

# Check angle interpretation
print("\n" + "=" * 60)
print("Angle interpretation:")
print("=" * 60)

# If 79/137 = sin^2(theta) or cos^2(theta), what's theta?
from sympy import asin, acos, deg

theta_sin = asin(sqrt(f_hid))
theta_cos = acos(sqrt(f_hid))

print(f"\nIf 79/137 = sin^2(theta): theta = {N(theta_sin * 180/pi, 6)} deg")
print(f"If 79/137 = cos^2(theta): theta = {N(theta_cos * 180/pi, 6)} deg")

# Compare to Weinberg angle
theta_W = S("0.2312")  # sin^2(theta_W) ~ 0.231
print(f"\nWeinberg angle: sin^2(theta_W) ~ 0.231")
print(f"Our hidden fraction: 79/137 ~ 0.577")
print(f"Ratio: {N(f_hid / theta_W, 4)} (about 2.5x)")

# Final summary
print("\n" + "=" * 60)
print("PATH A SUMMARY:")
print("=" * 60)
print(f"""
FINDING: 79/137 ~ 1/sqrt(3) with 0.12% accuracy

This is suspiciously close. 1/sqrt(3) appears in:
  - Tetrahedral geometry (simplest 3D structure)
  - 3D isotropy (equal distribution across 3 axes)
  - SU(2) Clebsch-Gordan coefficients

IMPLICATION: Hidden fraction may relate to 3D structure
  - 3 spatial dimensions?
  - 3-way symmetry in perspective space?
  - Tetrahedral "hiding" geometry?

STATUS: [CONJECTURE] - numerically suggestive, needs derivation
""")
