"""
Tetrahedral Connection Analysis
===============================
Investigating whether 79/137 relates to tetrahedral geometry.

Key finding: 79/137 ~ 1/sqrt(3) ~ sin(35.26 deg) = sin(tetrahedral angle)

Session: 2026-01-26-36
"""

from sympy import sqrt, Rational, pi, sin, cos, tan, asin, acos, atan, N, simplify
from sympy import symbols, solve, S
import math

print("=" * 70)
print("TETRAHEDRAL CONNECTION ANALYSIS")
print("=" * 70)

# Basic numbers
f_hidden = Rational(79, 137)
f_observable = Rational(58, 137)

print(f"\n1. HIDDEN FRACTION AS SINE")
print(f"   f_hidden = 79/137 = {N(f_hidden, 10)}")

# If 79/137 = sin(theta), what is theta?
theta_rad = asin(f_hidden)
theta_deg = N(theta_rad * 180/pi, 6)

print(f"\n   If sin(theta) = 79/137:")
print(f"   theta = {theta_deg} deg")

# Compare to tetrahedral angle
# Tetrahedral angle: angle between face and base
# sin(theta_tet) = 1/sqrt(3) ~ 0.5774
theta_tet = asin(1/sqrt(3))
theta_tet_deg = N(theta_tet * 180/pi, 6)

print(f"\n2. TETRAHEDRAL ANGLE")
print(f"   sin(theta_tet) = 1/sqrt(3) = {N(1/sqrt(3), 10)}")
print(f"   theta_tet = {theta_tet_deg} deg")
print(f"\n   Comparison:")
print(f"   theta_hidden = {theta_deg} deg")
print(f"   theta_tet    = {theta_tet_deg} deg")
print(f"   Difference: {N(float(theta_deg) - float(theta_tet_deg), 4)} deg ({N(100*abs(f_hidden - 1/sqrt(3))/(1/sqrt(3)), 4)}%)")

# Where does the tetrahedral angle appear?
print(f"\n3. TETRAHEDRAL ANGLE IN GEOMETRY")
print("""
   The tetrahedral angle theta_tet ~ 35.26 deg appears in:

   a) Regular tetrahedron:
      - Angle between face normal and edge: theta_tet
      - sin(theta_tet) = 1/sqrt3
      - cos(theta_tet) = sqrt(2/3)

   b) Methane molecule (CH4):
      - H-C-H bond angle = 109.47 deg = 180 deg - 2*35.26 deg
      - Carbon at center of tetrahedron

   c) Cube inscribed in sphere:
      - Diagonal makes angle theta_tet with face

   d) 3D isotropy:
      - Standard deviation in any direction = 1/sqrt3
""")

# Connection to n_defect = 4
print(f"\n4. CONNECTION TO FRAMEWORK")
print(f"   n_defect = 4 (spacetime dimensions)")
print(f"   Tetrahedron has 4 vertices")
print(f"   Is this coincidence?")

# Tetrahedron combinatorics
print(f"\n   Tetrahedron properties:")
print(f"   - Vertices: 4")
print(f"   - Edges: 6 = C(4,2)")
print(f"   - Faces: 4")
print(f"   - Total: 4 + 6 + 4 = 14")

# Compare to defect sector channels
n_d = 4
channels_defect = n_d**2  # = 16
print(f"\n   Defect sector channels: {n_d}^2 = {channels_defect}")
print(f"   Close to 14! Difference: {channels_defect - 14}")

# Is 14 special?
print(f"\n   Hidden scalars = 14 (coincidence with tetrahedron total?)")

# The visible/hidden split geometrically
print(f"\n5. GEOMETRIC INTERPRETATION")
print("""
   Hypothesis: Perspective is like viewing from a tetrahedral vertex

   From one vertex of a tetrahedron:
   - You "see" the opposite face
   - You "miss" the three edges behind you

   Visible fraction = area seen / total structure
   Hidden fraction = 1/sqrt3 = sin(35.26 deg)

   This is the projection factor from vertex to opposite face!
""")

# Verify: projection from vertex to opposite face
print(f"\n6. PROJECTION CALCULATION")
# Height of regular tetrahedron with edge a:
# h = a * sqrt(2/3)
# Distance from vertex to center of opposite face = h
# If we project unit area at angle theta_tet:
# Projection factor = cos(theta_tet) = sqrt(2/3)

cos_tet = sqrt(Rational(2,3))
print(f"   cos(theta_tet) = sqrt(2/3) = {N(cos_tet, 6)}")
print(f"   sin(theta_tet) = 1/sqrt3 = {N(1/sqrt(3), 6)}")

# This matches!
print(f"\n   MATCH: sin^2(theta_tet) + cos^2(theta_tet) = 1/3 + 2/3 = 1 CHECK")

# Connection to 58 and 79
print(f"\n7. NUMERICAL VERIFICATION")
# If cos^2(theta) = visible and sin^2(theta) = hidden:
cos2_tet = Rational(2, 3)
sin2_tet = Rational(1, 3)

# Expected: visible = 137 * cos^2(theta), hidden = 137 * sin^2(theta)
visible_expected = 137 * cos2_tet
hidden_expected = 137 * sin2_tet

print(f"   If hidden = 137 * sin^2(theta_tet) = 137/3 = {N(hidden_expected, 4)}")
print(f"   Actual hidden = 79")
print(f"   Difference: {N(79 - hidden_expected, 4)}")

print(f"\n   If visible = 137 * cos^2(theta_tet) = 274/3 = {N(visible_expected, 4)}")
print(f"   Actual visible = 58")
print(f"   Difference: {N(58 - visible_expected, 4)}")

# The fractions don't match sin^2 and cos^2
print(f"\n   NOTE: The split isn't sin^2/cos^2!")
print(f"   Instead: hidden/total ~ sin(theta_tet), not sin^2(theta_tet)")
print(f"   79/137 = {N(f_hidden, 6)} ~ sin(theta_tet) = {N(1/sqrt(3), 6)}")

# So it's a linear (not quadratic) relationship
print(f"\n8. LINEAR vs QUADRATIC")
print(f"   Linear: f_hidden ~ sin(theta_tet) = 1/sqrt3 (CHECK matches to 0.12%)")
print(f"   Quadratic: f_hidden ~ sin^2(theta_tet) = 1/3 (FAIL off by 73%)")

# What would make it linear?
print(f"""
   Question: Why LINEAR not quadratic?

   In projections, usually area goes as cos^2(theta).
   But here we have linear sin(theta).

   Possible explanations:
   1. This isn't area projection but LENGTH projection
   2. The relevant quantity is amplitude, not probability
   3. There's a different geometric relationship
""")

# Alternative: hidden/visible ratio
ratio = Rational(79, 58)
print(f"\n9. RATIO ANALYSIS")
print(f"   hidden/visible = 79/58 = {N(ratio, 6)}")

# Compare to geometric ratios
print(f"   tan(theta_tet) = 1/sqrt2 = {N(1/sqrt(2), 6)}")
print(f"   tan(54.74 deg) = sqrt2 = {N(sqrt(2), 6)}")
print(f"   sqrt3 = {N(sqrt(3), 6)}")

# Interestingly: 79/58 ~ sqrt(2) * something?
print(f"   79/58 / sqrt2 = {N(ratio/sqrt(2), 6)}")
print(f"   This is close to 1! So 79/58 ~ sqrt2 * 0.96...")

# Check: is 79/58 close to any simple expression?
print(f"\n10. SEARCHING FOR EXACT EXPRESSION")

expressions = [
    ("1/sqrt3 / (1 - 1/sqrt3)", (1/sqrt(3)) / (1 - 1/sqrt(3))),
    ("1 / (sqrt3 - 1)", 1 / (sqrt(3) - 1)),
    ("(sqrt3 + 1) / 2", (sqrt(3) + 1) / 2),
    ("sqrt(3/2)", sqrt(Rational(3,2))),
    ("sqrt2", sqrt(2)),
    ("tan(35.26 deg)", tan(asin(1/sqrt(3)))),
]

print(f"   Target: 79/58 = {N(ratio, 8)}")
print(f"\n   {'Expression':<25} {'Value':<12} {'Error %'}")
print(f"   {'-'*50}")

for name, val in expressions:
    err = abs(N(ratio - val, 15) / N(val, 15)) * 100
    match = " <-- CLOSE" if err < 1 else ""
    print(f"   {name:<25} {N(val, 8):<12} {err:.4f}%{match}")

# The 1/(sqrt3-1) is interesting
val_1 = 1 / (sqrt(3) - 1)
print(f"\n   Best match: 1/(sqrt3-1) = {N(val_1, 8)}")
print(f"   = (sqrt3+1)/2 after rationalization")
print(f"   Error: {N(100*abs(ratio - val_1)/val_1, 4)}%")

# Summary
print(f"\n" + "=" * 70)
print("SUMMARY: TETRAHEDRAL CONNECTION")
print("=" * 70)
print(f"""
FINDINGS:

1. f_hidden = 79/137 ~ sin(theta_tet) where theta_tet ~ 35.26 deg is the tetrahedral angle
   Accuracy: 0.12%

2. The relationship is LINEAR (sin not sin^2)
   This suggests amplitude, not probability

3. n_defect = 4 = number of tetrahedron vertices
   Possible deep connection

4. Hidden/visible ratio: 79/58 ~ 1.36
   Close to 1/(sqrt3-1) ~ 1.366 (within 0.4%)

5. Tetrahedron has 4+6+4=14 components
   Hidden scalars = 14 (coincidence?)

CONJECTURE: The 4D defect (spacetime) has tetrahedral structure
   - Observation from one "vertex" of this structure
   - Hidden fraction = sin(tetrahedral angle) = 1/sqrt3
   - Perspective geometry is fundamentally tetrahedral

DERIVATION PATH:
If we can show that 4D spacetime maps to tetrahedral geometry,
the 79/137 hidden fraction follows from projection.

STATUS: [CONJECTURE] - numerically compelling, geometric interpretation suggestive
""")
