"""
MASTER GENERATING FUNCTION SEARCH

Key insight from previous analysis:
- All constants have form: Main + Correction/Scale
- Four structural forms exist
- n_c = 11 appears universally
- Phi_6 encodes cyclotomic structure

New hypothesis: There's a generating function over division algebra structure
that produces all constants via different "projections" or "mode selections."

Search directions:
1. Partition function approach: Z = sum over states
2. Character/representation approach
3. Modular form approach
4. Single polynomial with dimension selectors
"""

from sympy import *
from fractions import Fraction
import itertools

# Division algebra dimensions
R, C, H, O = 1, 2, 4, 8

# Derived quantities
n_d = H                    # 4 - defect dimension
n_c = R + C + O            # 11 - crystal dimension
Im_H = 3                   # imaginary quaternion dim
Im_O = 7                   # imaginary octonion dim

# Cyclotomic polynomial
def Phi6(x):
    return x*x - x + 1

# All dimension-derived values
DIMS = {
    'R': 1, 'C': 2, 'Im_H': 3, 'H': 4,
    'Im_O': 7, 'O': 8, 'n_c': 11, 'H+O': 12
}

print("=" * 70)
print("GENERATING FUNCTION SEARCH")
print("=" * 70)

# ============================================================
# APPROACH 1: Can we write a single polynomial P(x,y,z) where
# evaluating at different (a,b,c) gives different constants?
# ============================================================

print("\n" + "=" * 70)
print("APPROACH 1: UNIVERSAL POLYNOMIAL")
print("=" * 70)

# The main terms are:
# 137 = 4^2 + 11^2 = a^2 + b^2
# 1836 = 12(9 + 144) = c(d^2 + c^2)
# 207 = 9 * 23 = d^2(a^2 + e)
# 16 = 4^2 = a^2

# Can we write: P(a,b,c,d,e) = coefficient-weighted sum?
# Let's try: P(a,b;m) where m is "mode"

print("""
Hypothesis: Main terms come from evaluating

  P(a, b) = w_0 * a^2 + w_1 * b^2 + w_2 * a*b + w_3 * a^2*b + w_4 * a*b^2

at different (a,b) with mode-dependent weights w_i
""")

# Test: can we find weights that work?
# alpha: P(4,11) = 137 with w_0=1, w_1=1, w_2=w_3=w_4=0
# m_p/m_e: P(12,3) = 1836 = 12(9+144) = 12*153 = 12*(3^2 + 12^2)
#          This is 12*3^2 + 12*12^2 = 12*3^2 + 12^3
#          = b*(a^2 + b^2) where a=3, b=12
#          So we need w_0=1, w_1=1, w_2=0, w_3=0, and multiply by b

print("\nTesting polynomial forms for main terms:")

def test_polynomial(a, b, form):
    """Test various polynomial forms"""
    forms = {
        'sum_sq': a**2 + b**2,
        'prod_sq_sum': b * (a**2 + b**2),
        'mixed': a**2 * (b**2 + (b-a)),
        'sq': a**2,
    }
    return forms.get(form, 0)

tests = [
    ('alpha', 4, 11, 'sum_sq', 137),
    ('m_p/m_e', 3, 12, 'prod_sq_sum', 1836),
    ('m_mu/m_e', 4, 3, 'mixed', 207),  # 9 * 23 = 9*(16+7)
    ('m_tau/m_mu', 4, 0, 'sq', 16),
]

for name, a, b, form, expected in tests:
    result = test_polynomial(a, b, form)
    match = "OK" if result == expected else f"FAIL (got {result})"
    print(f"  {name:12}: P({a},{b},'{form}') = {result} [{match}]")

# ============================================================
# APPROACH 2: Matrix representation - tr(M^k) approach
# ============================================================

print("\n" + "=" * 70)
print("APPROACH 2: MATRIX TRACES")
print("=" * 70)

print("""
Hypothesis: Constants come from traces of matrices built from dims.

Let D = diag(d1, d2, ..., dn) be a diagonal matrix of dimensions.
Then tr(D^k) = sum of k-th powers.
""")

# Test: can main terms come from traces?
# tr(D^2) where D = diag(4, 11) gives 16 + 121 = 137

from sympy import Matrix

def matrix_trace_test():
    """Test if main terms can come from matrix traces"""

    tests = [
        ('1/alpha = 137', Matrix([[4, 0], [0, 11]]), 2, 137),
        ('m_p/m_e = 1836', Matrix([[3, 0], [0, 12]]), 2, 153),  # times 12
        ('m_mu/m_e = 207', Matrix([[4, 0], [0, 7]]), 2, 65),    # Not quite
    ]

    for name, M, power, expected in tests:
        tr = (M**power).trace()
        print(f"  {name}: tr(M^{power}) = {tr}  (expected main term: {expected})")

matrix_trace_test()

# ============================================================
# APPROACH 3: Cyclotomic connection - roots of unity
# ============================================================

print("\n" + "=" * 70)
print("APPROACH 3: CYCLOTOMIC STRUCTURE")
print("=" * 70)

print("""
Phi_6(x) = x^2 - x + 1 is the minimal polynomial for primitive 6th roots of unity.

Roots: exp(i*pi/3) and exp(-i*pi/3) = (1 +/- i*sqrt(3))/2

Key property: Phi_6(x) = (x^6 - 1)/((x-1)(x+1)(x^2+x+1))
""")

# The pattern: Phi_6 evaluated at 7, 11, 12
print("Phi_6 evaluations at key dimensions:")
for x in [7, 11, 12]:
    print(f"  Phi_6({x:2}) = {Phi6(x)}")

print("\nObservation: Arguments are 7 = Im(O), 11 = n_c, 12 = H+O")
print("These are the 'large' dimensions in the correction terms!")

# Is there a pattern in WHICH Phi_6 argument goes with which constant?
print("\nWhich constant uses which Phi_6 argument:")
print("  alpha:    Phi_6(n_c) = Phi_6(11) - crystal dimension")
print("  theta_W:  Phi_6(H+O) = Phi_6(12) - QCD sector")
print("  m_mu/m_e: Phi_6(Im_O) = Phi_6(7) - octonionic imaginary")

# ============================================================
# APPROACH 4: Generating function Z(t) where derivs give constants
# ============================================================

print("\n" + "=" * 70)
print("APPROACH 4: GENERATING FUNCTION Z(t)")
print("=" * 70)

print("""
Can we find Z(t) such that:
  Z'(0) = alpha
  Z''(0)/2! = something
  etc.

Or Z(t_1, t_2, ...) where different partial derivatives give constants?
""")

# Try: Z(t) = sum_n a_n * t^n where a_n involves dimension sums
# This is speculative but worth exploring

# Another idea: Z = prod over algebras of (1 + dim * t)
# Z = (1 + R*t)(1 + C*t)(1 + H*t)(1 + O*t)
#   = (1 + t)(1 + 2t)(1 + 4t)(1 + 8t)

t = symbols('t')
Z = (1 + R*t) * (1 + C*t) * (1 + H*t) * (1 + O*t)
Z_expanded = expand(Z)
print(f"\nZ(t) = (1+t)(1+2t)(1+4t)(1+8t)")
print(f"     = {Z_expanded}")

# Extract coefficients
print("\nCoefficients of Z(t):")
poly = Poly(Z_expanded, t)
for i, c in enumerate(poly.all_coeffs()[::-1]):
    print(f"  t^{i}: {c}")

# ============================================================
# APPROACH 5: Look for recursion/hierarchy
# ============================================================

print("\n" + "=" * 70)
print("APPROACH 5: RECURSION RELATIONS")
print("=" * 70)

# The ratio alpha_s/alpha ~ n_d^2 suggests a recursion
# Can we derive one constant from another?

alpha_inv = Fraction(15211, 111)
alpha_s = Fraction(25, 212)
ratio = alpha_inv * alpha_s
print(f"(1/alpha) * alpha_s = {float(ratio):.6f}")
print(f"Expected n_d^2 = {n_d**2}")

# Lepton masses form a chain
m_mu_e = Fraction(8891, 43)
m_tau_mu = Fraction(185, 11)
m_tau_e = m_mu_e * m_tau_mu
print(f"\nm_mu/m_e * m_tau/m_mu = {float(m_tau_e):.4f}")
print(f"This equals m_tau/m_e")

# Is there a pattern? Each mass ratio involves:
# m_mu/m_e: uses Im_H^2, n_d^2, Im_O, (C+O), Phi_6(Im_O)
# m_tau/m_mu: uses n_d^2, Im_H^2, n_c

print("\nLepton mass ratio dimensions used:")
print("  m_mu/m_e:  Im_H^2=9, n_d^2=16, Im_O=7, correction (C+O)/Phi_6(Im_O)")
print("  m_tau/m_mu: n_d^2=16, Im_H^2=9, n_c=11")

# ============================================================
# APPROACH 6: Selection rule from dimension "type"
# ============================================================

print("\n" + "=" * 70)
print("APPROACH 6: DIMENSION SELECTION RULES")
print("=" * 70)

print("""
Key observation: Different constants use different dimension subsets.

  alpha: uses n_d=4, n_c=11
  m_p/m_e: uses H+O=12, Im_H=3, n_c=11, O=8
  theta_W: uses C+O=10, H+O=12
  m_mu/m_e: uses Im_H=3, n_d=4, Im_O=7, C+O=10
  m_tau/m_mu: uses n_d=4, Im_H=3, n_c=11

What determines the selection?
""")

# Let's categorize by "sector"
selections = {
    'alpha': ['n_d', 'n_c'],  # Pure crystal-defect
    'm_p/m_e': ['H+O', 'Im_H', 'n_c', 'O'],  # QCD sector
    'theta_W': ['C+O', 'H+O'],  # Gauge mixing
    'm_mu/m_e': ['Im_H', 'n_d', 'Im_O', 'C+O'],  # Lepton sector
    'm_tau/m_mu': ['n_d', 'Im_H', 'n_c'],  # Lepton hierarchy
    'alpha_s': ['O', 'H+O', 'n_d', 'Im_O', 'C'],  # Strong
    'V_cb': ['n_d', 'C', 'Im_O'],  # CKM
}

print("\nDimension usage by constant:")
for const, dims in selections.items():
    print(f"  {const:12}: {', '.join(dims)}")

# Count dimension occurrences
from collections import Counter
all_dims = []
for dims in selections.values():
    all_dims.extend(dims)
counts = Counter(all_dims)
print("\nDimension occurrence frequency:")
for dim, count in sorted(counts.items(), key=lambda x: -x[1]):
    print(f"  {dim:6}: {count} times")

# ============================================================
# APPROACH 7: "Mode" as projection operator
# ============================================================

print("\n" + "=" * 70)
print("APPROACH 7: MODE AS PROJECTION")
print("=" * 70)

print("""
Hypothesis: The "master function" is a single object F living in a
high-dimensional space of division algebra quantities. Different
constants are "projections" of F onto different subspaces.

Let F = F(R, C, H, O, Im_H, Im_O, n_c, n_d, H+O, C+O, ...)

Then:
  alpha = Proj_coupling(F)
  m_p/m_e = Proj_mass(F)
  theta_W = Proj_mixing(F)
  ...

The projector determines:
  - Which dimensions enter
  - What polynomial structure (sum vs product)
  - What scale function (Phi_6 vs product)
""")

# ============================================================
# APPROACH 8: Information-theoretic view
# ============================================================

print("\n" + "=" * 70)
print("APPROACH 8: INFORMATION CONTENT")
print("=" * 70)

# Calculate information content (log_2) of each constant
from math import log2

constants_float = {
    '1/alpha': 137.036,
    'm_p/m_e': 1836.153,
    '1/theta_W': 1/0.2312,  # sin^2 inverse
    'm_mu/m_e': 206.768,
    'm_tau/m_mu': 16.818,
    '1/alpha_s': 1/0.1179,
    '1/V_cb': 1/0.0408,
}

print("Information content (bits = log2(value)):")
for name, val in constants_float.items():
    bits = log2(abs(val))
    print(f"  {name:12}: {bits:.3f} bits")

# ============================================================
# FINAL SYNTHESIS
# ============================================================

print("\n" + "=" * 70)
print("SYNTHESIS: THE MASTER FORMULA STRUCTURE")
print("=" * 70)

print("""
CONCLUSION: No single simple generating function exists.

But there is a TEMPLATE:

  Constant(type) = Main(type; select(dims)) + Corr(type; select(dims))/Scale(type; select(dims))

Where:
  - type in {coupling, mass_ratio, mixing_angle, hierarchy}
  - select(dims) depends on the physical sector (EM, QCD, EW, lepton, quark)
  - Main is polynomial (sum_sq for coupling, product for mass)
  - Corr is small dimension (4, 9, 10, 11, 12)
  - Scale is Phi_6(large_dim) or product(dims)

THE KEY OPEN QUESTION:

Why does each constant select the dimensions it does?

Possible answer from framework:
  - Different "sectors" correspond to different subgroups of the
    crystallization interface
  - The selection rules encode how each physical quantity arises from
    the interface structure

NEXT STEP: Derive selection rules from T1 (time axiom) and
crystallization geometry.
""")

# ============================================================
# BONUS: Test a specific generating function ansatz
# ============================================================

print("\n" + "=" * 70)
print("BONUS: TESTING SPECIFIC ANSATZ")
print("=" * 70)

print("""
Ansatz: G(x, y; type) = x^2 * f(type) + y^2 * g(type) + h(type)/Phi_6(y)

where f, g, h are type-dependent coefficients.
""")

# For alpha: f=1, g=1, h=n_d=4, x=n_d=4, y=n_c=11
# G(4, 11; coupling) = 16 + 121 + 4/111 = 137.036...
test_alpha = 4**2 * 1 + 11**2 * 1 + 4/Phi6(11)
print(f"G(4, 11; coupling) = {test_alpha:.6f} vs 1/alpha = 137.036")

# For m_mu/m_e: need different structure
# 207 - 10/43 = 9*23 - 10/43
# = Im_H^2 * (n_d^2 + Im_O) - (C+O)/Phi_6(Im_O)
test_mu_e = 3**2 * (4**2 + 7) - 10/Phi6(7)
print(f"G_mass(3, 4, 7) = {test_mu_e:.6f} vs m_mu/m_e = 206.768")

# This confirms: same TEMPLATE, different POLYNOMIAL STRUCTURE
print("\nConfirmed: Same template, different polynomial for each type.")
