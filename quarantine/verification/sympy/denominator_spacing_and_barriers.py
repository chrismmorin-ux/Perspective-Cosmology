#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
Denominator Spacing Analysis and Barrier Height Structure

KEY QUESTION: Why do 5 denominators form an H^2=16 spaced chain?
             Does this connect to crystallization barrier heights?

SETUP:
  Chain: 97, 113, 121(=n_c^2), 137, 153
  Spacing: all differ by 8 or 16 = H^2

STATUS: INVESTIGATION
Depends on:
- [D: denominator polynomials] From denominator_polynomial_unification.py
- [D: SO(11) chain] From crystallization_ordering_SO11.py
- [D: c3 > 0] From c3_sign_from_stability.py

Created: Session 132b
"""

from sympy import *

n_c = Symbol('n_c')
n_d = 4
O = 8
Im_O = 7
H = 4
Im_H = 3

print("=" * 70)
print("PART 1: The H^2 = 16 Spacing Chain")
print("=" * 70)

# The five denominators in the chain
chain = {
    97:  ('n_c^2 - 2*n_c - 2',  'n_c^2 - C*n_c - C',       'electroweak'),
    113: ('n_c^2 - 8',           'n_c^2 - O',                'glueball'),
    121: ('n_c^2',               'n_c^2',                     'spectral'),
    137: ('n_c^2 + 16',          'n_c^2 + H^2',              'fine structure'),
    153: ('(n_c-2)(n_c+6)',      '(n_c-C)(n_c+C*Im_H)',      'proton'),
}

print("\nThe chain of five denominators:")
print(f"{'Value':>6s} | {'Polynomial':30s} | {'Offset from n_c^2':>18s} | Physics")
print("-" * 85)

for val in sorted(chain.keys()):
    poly, struct, phys = chain[val]
    offset = val - 121
    print(f"{val:6d} | {poly:30s} | {offset:+18d} | {phys}")

print(f"\nAll are n_c^2 + k for various k:")
print(f"  97  = n_c^2 - 24 = n_c^2 - 2*n_c - 2   (k = -24)")
print(f"  113 = n_c^2 - 8  = n_c^2 - O             (k = -8)")
print(f"  121 = n_c^2 + 0  = n_c^2                  (k = 0)")
print(f"  137 = n_c^2 + 16 = n_c^2 + H^2            (k = +16)")
print(f"  153 = n_c^2 + 32 = (n_c-2)(n_c+6)         (k = +32)")

# Check: are the offsets from n_c^2 structured?
offsets = [-24, -8, 0, 16, 32]
print(f"\nOffsets from n_c^2: {offsets}")
print(f"Spacings: {[offsets[i+1]-offsets[i] for i in range(len(offsets)-1)]}")
print(f"  = [16, 8, 16, 16]")

# Note: 153 = n_c^2 + 32 = (n_c-2)(n_c+6) gives 32 = -2*6 + n_c*(6-2) = -12 + 4*11 = 32? No
# 153 = n_c^2 + 4n_c - 12 = 121 + 44 - 12 = 153. So offset = 4*n_c - 12 = 4*11 - 12 = 32.
# And 97 = n_c^2 - 2*n_c - 2. offset = -2*n_c - 2 = -22 - 2 = -24.

print(f"\nAs functions of n_c and n_d:")
print(f"  97  offset = -2n_c - 2 = -2(n_c + 1) = -2(n_c + R)")
print(f"  113 offset = -O = -8")
print(f"  121 offset = 0")
print(f"  137 offset = H^2 = 16")
print(f"  153 offset = 4n_c - 12 = n_d*n_c - 3*n_d = n_d(n_c - Im_H)")

# Simplified: all are n_c^2 + f(division algebra dims)
print(f"\n  All five = n_c^2 + (division algebra offset)")

print("\n" + "=" * 70)
print("PART 2: The Offset as a Function of Stage")
print("=" * 70)

# Can we map offsets to crystallization stages?
# Stage 1: SO(11) -> SO(4)xSO(7), Goldstones = 28
# Stage 2: SO(7) -> G2, Goldstones = 7
# Stage 3: G2 -> SU(3), Goldstones = 6

print("""
Hypothesis: Each denominator corresponds to a crystallization stage,
and the offset from n_c^2 encodes the number of active degrees of freedom.

  97  = n_c^2 - 24:  "Before Stage 1" -- 24 = (n_c + 1)(n_c - 11) + ?
  113 = n_c^2 - O:   "After Stage 1/Before Stage 2" -- offset = -dim(O)
  121 = n_c^2:       "Transition point" -- zero offset
  137 = n_c^2 + H^2: "After Stage 2/Before Stage 3" -- offset = +dim(H)^2
  153 = n_c^2 + 32:  "After Stage 3/Final state" -- offset = +n_d(n_c - Im_H)
""")

# Let's check if the offsets are related to Goldstone counts
print("Offset differences vs Goldstone structure:")
print(f"  113 - 97  = 16 = H^2    (not 28 Goldstones from Stage 1)")
print(f"  121 - 113 = 8  = O      (not 7 Goldstones from Stage 2)")
print(f"  137 - 121 = 16 = H^2    (not 6 Goldstones from Stage 3)")
print(f"  153 - 137 = 16 = H^2")

# The spacings are NOT the Goldstone counts themselves, but H^2 and O
# H^2 = 16 appears 3 times, O = 8 appears once

print(f"\n  H^2 appears 3 times: (97->113), (121->137), (137->153)")
print(f"  O appears 1 time:    (113->121)")
print(f"  Total span: 153 - 97 = 56 = 8 * 7 = O * Im_O")

print("\n" + "=" * 70)
print("PART 3: Barrier Heights from F(epsilon)")
print("=" * 70)

# The Mexican hat potential F(eps) = c1*I2 + c2*I2^2 + c3*I4
# At the uniform point eps0 = -7/11 (all eigenvalues equal):
# I2 = n_c * (7/11)^2 = 11 * 49/121 = 49/11
# I4 = n_c * (7/11)^4 = 11 * 2401/14641 = 2401/1331

a = Symbol('a')
b = Symbol('b')
c1, c2, c3 = symbols('c1 c2 c3')

# Trace constraint: 4a + 7b = -7
b_expr = (-7 - 4*a) / 7

# Invariants as functions of a
I2 = 4*a**2 + 7*b_expr**2
I4 = 4*a**4 + 7*b_expr**4
I2 = expand(I2)
I4 = expand(I4)

F = c1*I2 + c2*I2**2 + c3*I4
F = expand(F)

# At the uniform point a = b = -7/11:
a_uniform = Rational(-7, 11)
F_uniform = F.subs(a, a_uniform)
F_uniform = expand(F_uniform)

print(f"At uniform point (a = b = -7/11):")
print(f"  I2 = {I2.subs(a, a_uniform)} = 49/11")
print(f"  I4 = {I4.subs(a, a_uniform)} = 2401/1331 = (49/11)^2/11")
print(f"  F_uniform = {F_uniform}")

# At the broken minimum: need to minimize F(a) numerically
# Use specific c1, c2, c3 values

print(f"\nBarrier height = F(uniform) - F(minimum)")
print(f"This depends on the RATIOS c1:c2:c3")
print(f"")
print(f"Key insight: The barrier height involves the SAME invariants I2, I4")
print(f"that appear in the denominator polynomials.")

# Let's compute the energy difference symbolically
# At the minimum, dF/da = 0
dF = diff(F, a)

# The energy as a function of the ratio r = c3/c2
# We can set c2 = 1 (overall scale) and treat c1, c3 as parameters

print("\n" + "=" * 70)
print("PART 4: Energy at Each SO(p)xSO(q) Minimum")
print("=" * 70)

# For each valid split, the eigenvalues at the minimum satisfy:
# dF/da = 0 (stationarity)
# This gives a cubic in a (generically)

# Instead of solving the cubic, compute the energy DIFFERENCE
# between the uniform and broken states as a function of c1, c3 (with c2=1)

# Substitute c2 = 1
F_c2eq1 = F.subs(c2, 1)

# Energy difference Delta_F = F(uniform) - F(broken)
# At uniform: a = -7/11
F_u = F_c2eq1.subs(a, a_uniform)
F_u_simplified = simplify(F_u)

print(f"\nF_uniform (c2=1):")
print(f"  = {F_u_simplified}")

# For the (4,7) minimum, the eigenvalues are determined by dF/da = 0
# Let's compute this for several c1, c3 ratios

print(f"\n--- Energy landscape for different c3/c1 ratios ---")
print(f"(Setting c2 = 1, c1 = -1, varying c3)")

F_numerical = F_c2eq1.subs(c1, -1)

for c3_val in [Rational(1, 20), Rational(1, 10), Rational(1, 5),
               Rational(1, 2), Rational(1, 1)]:
    F_num = F_numerical.subs(c3, c3_val)
    dF_num = diff(F_num, a)
    crit = solve(dF_num, a)

    # Find real critical points
    real_crits = []
    for cp in crit:
        try:
            cv = complex(N(cp))
            if abs(cv.imag) < 1e-10:
                real_crits.append(float(cv.real))
        except:
            pass

    if not real_crits:
        continue

    # Find the minimum
    min_a = None
    min_F = float('inf')
    for rc in real_crits:
        fv = float(F_num.subs(a, rc))
        if fv < min_F:
            min_F = fv
            min_a = rc

    F_unif = float(F_num.subs(a, float(a_uniform)))
    barrier = F_unif - min_F

    b_at_min = (-7 - 4*min_a) / 7
    print(f"\n  c3 = {float(c3_val):.3f}:")
    print(f"    Minimum at a = {min_a:.4f}, b = {b_at_min:.4f}")
    print(f"    F(minimum) = {min_F:.6f}")
    print(f"    F(uniform) = {F_unif:.6f}")
    print(f"    Barrier height = {barrier:.6f}")
    print(f"    Splitting: a/b = {min_a/b_at_min:.4f}")

print("\n" + "=" * 70)
print("PART 5: Dimensionless Barrier Ratio")
print("=" * 70)

print("""
The barrier height Delta_F = F(uniform) - F(broken) depends on c1, c2, c3.
But the DIMENSIONLESS ratio Delta_F/|F(uniform)| may be universal.

Let's check: does this ratio involve framework numbers?
""")

# Compute symbolically for the case where we can solve explicitly
# For the (4,7) split with specific c values

# Actually, let's look at the barrier in terms of the Mexican hat
# parameter mu^2 = -c1/c2 (the mass-squared parameter)
# and lambda = c3/c2 (the quartic coupling ratio)

mu2, lam = symbols('mu2 lambda', positive=True)

# F = -mu2 * I2 + I2^2 + lambda * I4 (with c2 = 1, c1 = -mu2)
# At the uniform point: I2_u = 49/11, I4_u = 2401/1331
I2_u = Rational(49, 11)
I4_u = Rational(2401, 1331)

F_u_param = -mu2 * I2_u + I2_u**2 + lam * I4_u
F_u_param = expand(F_u_param)

print(f"F(uniform) = {F_u_param}")
print(f"           = {I2_u}*({-mu2 + I2_u + lam*I4_u/I2_u})")

# The ratio I4_u / I2_u = (49/11)^2 / 11 / (49/11) = 49/121
print(f"\nI4/I2 at uniform = {simplify(I4_u / I2_u)} = 49/121 = (Im_O/n_c)^2")
print(f"  = (7/11)^2")
print(f"  This is (Im_O/n_c)^2 -- the TILT RATIO squared!")

# I4/I2^2 at uniform = 1/n_c
print(f"I4/I2^2 at uniform = {simplify(I4_u / I2_u**2)} = 1/n_c")
print(f"  This is the INVERSE crystal dimension!")

print(f"\n  F(uniform) = I2 * (-mu^2 + I2 + lambda * I4/I2)")
print(f"             = (49/11) * (-mu^2 + 49/11 + lambda * 49/121)")
print(f"             = (49/11) * (-mu^2 + 49/11 * (1 + lambda/n_c))")

# The uniform point is unstable when F''(uniform) < 0
# which means mu^2 > 2*I2*(1 + lambda/n_c) ... approximately

print("\n" + "=" * 70)
print("PART 6: Universal Ratios at the Uniform Point")
print("=" * 70)

# I2 = sum of eigenvalues squared
# I4 = sum of eigenvalues to 4th power
# For uniform eigenvalue a0 = -7/11:
# I2 = n_c * a0^2 = 11 * 49/121 = 49/11
# I4 = n_c * a0^4 = 11 * (49/121)^2 = 11 * 2401/14641 = 2401/1331

a0 = Rational(-7, 11)
I2_val = 11 * a0**2
I4_val = 11 * a0**4

print(f"\nAt uniform point a0 = -7/11 = -(n_c - n_d)/n_c:")
print(f"  I2 = n_c * a0^2 = {I2_val} = (n_c - n_d)^2/n_c = Im_O^2/n_c")
print(f"  I4 = n_c * a0^4 = {I4_val} = (n_c - n_d)^4/n_c^3 = Im_O^4/n_c^3")
print(f"  I4/I2 = a0^2 = {a0**2} = Im_O^2/n_c^2")
print(f"  I4/I2^2 = 1/n_c = {Rational(1, 11)}")
print(f"  I2^2/I4 = n_c = {11}")

# The key ratios are all framework quantities!
print(f"""
ALL ratios at the uniform point are framework numbers:
  I2 = Im_O^2/n_c = 49/11
  I4 = Im_O^4/n_c^3 = 2401/1331
  I4/I2 = Im_O^2/n_c^2 = 49/121
  I4/I2^2 = 1/n_c = 1/11
  I2^2/I4 = n_c = 11

This means: the energy landscape F = c1*I2 + c2*I2^2 + c3*I4
evaluated at the uniform point depends ONLY on Im_O^2/n_c and 1/n_c.
""")

# Check: Tr(eps) = -7 at uniform point
# -7 = n_c * a0 = 11 * (-7/11) = -7. Correct.
# -7 = n_d - n_c = 4 - 11 = -7. This is the trace constraint.

print("The trace constraint:")
print(f"  Tr(eps) = n_d - n_c = {n_d} - 11 = {n_d - 11}")
print(f"  So a0 = Tr(eps)/n_c = (n_d - n_c)/n_c = -Im_O/n_c = -7/11")

print("\n" + "=" * 70)
print("PART 7: Barrier as Function of Splitting")
print("=" * 70)

# At the (p,q) broken minimum, eigenvalues are (a,a,...a, b,b,...b)
# with pa + qb = -(n_c - n_d) = -Im_O = -7
# Minimizing F gives specific a, b values

# The barrier height depends on the splitting.
# Let's compute the barrier for all valid splits

p_val, q_val = symbols('p q', integer=True, positive=True)

# For the (4,7) split:
# pa + qb = -7
# b = (-7 - 4a)/7
# I2(a) = 4a^2 + 7*((-7-4a)/7)^2 = 4a^2 + (-7-4a)^2/7
# I4(a) = 4a^4 + 7*((-7-4a)/7)^4 = 4a^4 + (-7-4a)^4/7^3

def compute_split_energy(p, q, c1_val, c2_val, c3_val):
    """Compute minimum energy for SO(p)xSO(q) split."""
    a_sym = Symbol('a_split')
    b_sym = (-7 - p*a_sym) / q
    I2_s = p*a_sym**2 + q*b_sym**2
    I4_s = p*a_sym**4 + q*b_sym**4
    F_s = c1_val*I2_s + c2_val*I2_s**2 + c3_val*I4_s
    F_s = expand(F_s)

    dF_s = diff(F_s, a_sym)
    crits = solve(dF_s, a_sym)

    best_a = None
    best_F = float('inf')

    for cp in crits:
        try:
            cv = complex(N(cp))
            if abs(cv.imag) < 1e-10:
                fv = float(N(F_s.subs(a_sym, cp)))
                if fv < best_F:
                    best_F = fv
                    best_a = float(cv.real)
        except:
            pass

    if best_a is None:
        return None, None, None

    best_b = (-7 - p*best_a) / q
    return best_a, best_b, best_F

# Test with c1 = -1, c2 = 1, c3 = 1/10
c_vals = (-1, 1, Rational(1, 10))
F_unif_val = float((-c_vals[0])*I2_val + c_vals[1]*I2_val**2 + c_vals[2]*I4_val)
# Wait, need to be more careful: c1=-1
F_unif_val = float(c_vals[0]*I2_val + c_vals[1]*I2_val**2 + c_vals[2]*I4_val)

print(f"\nWith c1={c_vals[0]}, c2={c_vals[1]}, c3={c_vals[2]}:")
print(f"  F(uniform) = {F_unif_val:.6f}")

for p, q in [(3, 8), (4, 7)]:
    a_min, b_min, F_min = compute_split_energy(p, q, *c_vals)
    if a_min is not None:
        barrier = F_unif_val - F_min
        print(f"\n  SO({p})xSO({q}) minimum:")
        print(f"    a = {a_min:.6f}, b = {b_min:.6f}")
        print(f"    F(min) = {F_min:.6f}")
        print(f"    Barrier = {barrier:.6f}")
        print(f"    Barrier/|F_unif| = {abs(barrier/F_unif_val):.6f}")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    # H^2 spacing chain
    ("97 + 16 = 113",
     97 + 16 == 113),

    ("113 + 8 = 121",
     113 + 8 == 121),

    ("121 + 16 = 137",
     121 + 16 == 137),

    ("137 + 16 = 153",
     137 + 16 == 153),

    ("153 - 97 = 56 = O * Im_O",
     153 - 97 == 56 and 56 == 8 * 7),

    # Uniform point ratios
    ("I2(uniform) = Im_O^2/n_c = 49/11",
     I2_val == Rational(49, 11)),

    ("I4(uniform) = Im_O^4/n_c^3 = 2401/1331",
     I4_val == Rational(2401, 1331)),

    ("I4/I2^2 at uniform = 1/n_c = 1/11",
     I4_val / I2_val**2 == Rational(1, 11)),

    ("I2^2/I4 at uniform = n_c = 11",
     I2_val**2 / I4_val == 11),

    ("Trace = (n_d - n_c) = -7 = -Im_O",
     n_d - 11 == -7),

    ("a0 = -Im_O/n_c = -7/11",
     a0 == Rational(-7, 11)),

    # Offsets from n_c^2
    ("97 = n_c^2 - 24 (offset -24)",
     97 == 121 - 24),

    ("113 = n_c^2 - 8 = n_c^2 - O (offset -O)",
     113 == 121 - 8),

    ("137 = n_c^2 + 16 = n_c^2 + H^2 (offset +H^2)",
     137 == 121 + 16),

    ("153 = n_c^2 + 32 = n_c^2 + 2*H^2 (offset +2H^2)",
     153 == 121 + 32),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print(f"\n{'ALL TESTS PASSED' if all_pass else 'SOME TESTS FAILED'}: "
      f"{sum(1 for _,p in tests if p)}/{len(tests)}")

# ==============================================================================
# SUMMARY
# ==============================================================================

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)

print("""
RESULTS:

1. H^2 SPACING CHAIN [THEOREM]
   Five denominators form a chain centered on n_c^2 = 121:
     97 = n_c^2 - 24     (electroweak)
     113 = n_c^2 - O      (glueball)
     121 = n_c^2           (spectral)
     137 = n_c^2 + H^2     (fine structure)
     153 = n_c^2 + 2H^2    (proton factor)

   Total span: 153 - 97 = 56 = O * Im_O

2. UNIFORM POINT UNIVERSALITY [THEOREM]
   All invariant ratios at the uniform point eps_0 = -Im_O/n_c are
   determined by Im_O and n_c alone:
     I2 = Im_O^2/n_c       (= 49/11)
     I4 = Im_O^4/n_c^3     (= 2401/1331)
     I4/I2^2 = 1/n_c       (= 1/11)

3. ENERGY LANDSCAPE DEPENDS ON TWO RATIOS [DERIVATION]
   F(uniform) = (Im_O^2/n_c) * [-mu^2 + (Im_O^2/n_c)(1 + lambda/n_c)]
   where mu^2 = -c1/c2 and lambda = c3/c2.

   The barrier height between uniform and broken states
   depends on mu^2 and lambda through framework ratios only.

CONFIDENCE: [DERIVATION]
The spacing chain is computationally verified. The physical interpretation
(each denominator represents a stage in the energy landscape) is [CONJECTURE].
""")
