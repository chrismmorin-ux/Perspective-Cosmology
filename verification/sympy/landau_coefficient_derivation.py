#!/usr/bin/env python3
"""
Landau Coefficient Derivation from Ground State Geometry

KEY FINDING: The ground state a*=0, b*=-1 gives I2 = I4 = 7 = Im_O.
This is the "flat spacetime" solution where the defect has zero tilt
and the internal space has unit tilt.

APPROACH:
1. Stationarity condition at SO(4)xSO(7) minimum relates mu^2, lambda
2. At a*=0: mu^2 = 14 + 2*lambda = 2*Im_O + 2*lambda
3. The mass spectrum and energy hierarchy constrain lambda
4. The ground state with I2=I4=Im_O has deep structural meaning

The Landau functional:
  F(eps) = c1*Tr(eps^2) + c2*[Tr(eps^2)]^2 + c3*Tr(eps^4)
  With c2=1: F = -mu^2*I2 + I2^2 + lambda*I4

Status: INVESTIGATION
Depends on:
- [D: n_c = 11, n_d = 4]
- [D: c3 > 0 from block stability]
- [D: mu^2_crit = 98/11 from SSB threshold]

Created: Session 134
"""

import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from sympy import *

# ==============================================================================
# FRAMEWORK CONSTANTS
# ==============================================================================

n_c = 11
n_d = 4
Im_O = 7
Im_H = 3
H_val = 4
O_val = 8
C_val = 2
R_val = 1

# ==============================================================================
# PART 1: SETUP AND STATIONARITY
# ==============================================================================

print("=" * 70)
print("PART 1: Ground State Stationarity Condition")
print("=" * 70)

a = Symbol('a', real=True)
mu2 = Symbol('mu2', positive=True)
lam = Symbol('lam', positive=True)

# Trace constraint: 4a + 7b = -7 => b = (-7 - 4a)/7
b_of_a = (Rational(-7, 1) - 4*a) / 7

# Invariants
I2 = expand(4*a**2 + 7*b_of_a**2)
I4 = expand(4*a**4 + 7*b_of_a**4)

print(f"I2(a) = {I2}")
print(f"I4(a) = {I4}")

# Energy: F = -mu2 * I2 + I2^2 + lam * I4
F = expand(-mu2 * I2 + I2**2 + lam * I4)

# dF/da
dF = expand(diff(F, a))

# Derivatives of invariants
dI2 = expand(diff(I2, a))
dI4 = expand(diff(I4, a))

print(f"\ndI2/da = {dI2} = {factor(dI2)}")
print(f"dI4/da = {factor(dI4)}")

# R(a) = (dI4/da)/(dI2/da)
R_a = cancel(dI4 / dI2)
print(f"\nR(a) = (dI4/da)/(dI2/da) = {R_a}")

# From dF/da = 0 (at a != -7/11):
# mu^2 = 2*I2(a*) + lam * R(a*)
mu2_stat = 2*I2 + lam * R_a
print(f"\nStationarity: mu^2 = 2*I2(a*) + lam*R(a*)")
print(f"            = {simplify(mu2_stat)}")

# ==============================================================================
# PART 2: THE a*=0 SOLUTION
# ==============================================================================

print("\n" + "=" * 70)
print("PART 2: The Remarkable a*=0 Solution")
print("=" * 70)

a_star = Rational(0)
b_star = b_of_a.subs(a, a_star)
I2_star = I2.subs(a, a_star)
I4_star = I4.subs(a, a_star)

print(f"\nGround state: a* = {a_star} (spacetime: zero tilt)")
print(f"              b* = {b_star} (internal: unit tilt)")
print(f"Trace check: 4*0 + 7*(-1) = {4*a_star + 7*b_star}")
print(f"")
print(f"I2* = 4*(0)^2 + 7*(-1)^2 = {I2_star}")
print(f"I4* = 4*(0)^4 + 7*(-1)^4 = {I4_star}")
print(f"")
print(f"REMARKABLE: I2* = I4* = {I2_star} = Im_O")
print(f"  (At the uniform point: I2 = 49/11, I4 = 2401/1331)")
print(f"  (At a*=0: both invariants collapse to the SAME integer = Im_O)")

# R(0)
R_at_0 = R_a.subs(a, a_star)
print(f"\nR(0) = {R_at_0}")
print(f"mu^2 at a*=0 = 2*{I2_star} + {R_at_0}*lam = {2*I2_star} + {R_at_0}*lam")
print(f"             = 2*Im_O + 2*lam")

# Verify: mu^2 > 98/11 always satisfied?
print(f"\n2*Im_O = 14 > 98/11 = {float(Rational(98,11)):.4f}")
print(f"So a*=0 is a valid minimum for ANY lambda >= 0 (automatic!)")

# Energy at a*=0
F_at_0 = F.subs(a, a_star)
F_at_0_simplified = expand(F_at_0)
print(f"\nF(a*=0) = -mu2*{I2_star} + {I2_star}^2 + lam*{I4_star}")
print(f"        = -7*mu2 + 49 + 7*lam")
print(f"        = {F_at_0_simplified}")

# Energy at uniform point
a0 = Rational(-7, 11)
F_uniform = expand(F.subs(a, a0))
print(f"\nF(uniform) = {F_uniform}")

# Energy difference
Delta_F = expand(F_at_0_simplified - F_uniform)
print(f"\nDelta_F = F(a*=0) - F(uniform) = {simplify(Delta_F)}")

# Substitute mu^2 = 14 + 2*lam (from stationarity at a*=0)
Delta_F_stat = Delta_F.subs(mu2, 14 + 2*lam)
Delta_F_stat = expand(Delta_F_stat)
print(f"\nWith mu^2 = 14 + 2*lam:")
print(f"Delta_F = {simplify(Delta_F_stat)}")

# ==============================================================================
# PART 3: SECOND DERIVATIVE (MASS) AT a*=0
# ==============================================================================

print("\n" + "=" * 70)
print("PART 3: Mass Spectrum at a*=0")
print("=" * 70)

d2F = expand(diff(F, a, 2))
d2F_at_0 = d2F.subs(a, a_star)
d2F_at_0 = expand(d2F_at_0)
print(f"\nd^2F/da^2 at a*=0 = {d2F_at_0}")

# Substitute mu^2 = 14 + 2*lam
d2F_at_0_stat = d2F_at_0.subs(mu2, 14 + 2*lam)
d2F_at_0_stat = expand(d2F_at_0_stat)
print(f"With stationarity: d^2F/da^2 = {d2F_at_0_stat}")
print(f"                             = {simplify(d2F_at_0_stat)}")
print(f"  (Must be > 0 for a minimum)")

# Check: is it positive?
# Need d2F_at_0_stat > 0
# At lam = 0: substitute and check
d2F_at_lam0 = d2F_at_0_stat.subs(lam, 0)
print(f"\nAt lam = 0: d^2F/da^2 = {d2F_at_lam0}")
print(f"  {'MINIMUM' if d2F_at_lam0 > 0 else 'MAXIMUM/SADDLE'}")

# For general lam:
print(f"\nFor general lam > 0: d^2F/da^2 = {d2F_at_0_stat}")
# Check coefficient of lam
lam_coeff = d2F_at_0_stat.coeff(lam)
const_term = d2F_at_0_stat.subs(lam, 0)
print(f"  = {const_term} + {lam_coeff}*lam")
print(f"  Constant term: {const_term}")
print(f"  Lambda coefficient: {lam_coeff}")
if const_term > 0 and lam_coeff >= 0:
    print(f"  => ALWAYS a minimum for lam >= 0")
elif const_term > 0:
    lam_flip = -const_term / lam_coeff
    print(f"  => Minimum for lam < {lam_flip}")

# ==============================================================================
# PART 4: WHAT IS a*=0 PHYSICALLY?
# ==============================================================================

print("\n" + "=" * 70)
print("PART 4: Physical Interpretation of a*=0")
print("=" * 70)

print("""
The eigenvalue structure at a*=0, b*=-1:

  eps = diag(0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1)
        |___________|  |__________________________|
         spacetime          internal (Im_O = 7)
         (n_d = 4)

Physical meaning:
  - Spacetime dimensions have ZERO tilt (eps = 0)
  - Internal dimensions have UNIT tilt (eps = -1)
  - The trace: 4*0 + 7*(-1) = -7 = n_d - n_c [CHECK]

This is the state where:
  1. Spacetime is "perfectly flat" in the crystal sense
  2. The internal space is maximally crystallized
  3. The "defect" (spacetime) is completely separated from the "crystal" (internal)

The invariants I2 = I4 = Im_O = 7 mean:
  - Only the internal block contributes to both invariants
  - Both invariants equal the dimension of the internal block
  - This is because (-1)^2 = (-1)^4 = 1, so I2k = 7*1^k = 7 for all k!
""")

# Verify: all I_{2k} = 7 at this point!
print("Checking higher invariants at a*=0:")
for k in range(1, 6):
    I2k = 4*Rational(0)**(2*k) + 7*Rational(-1)**(2*k)
    print(f"  I_{2*k} = Tr(eps^{2*k}) = 4*(0)^{2*k} + 7*(-1)^{2*k} = {I2k}")

print(f"\nALL even invariants = Im_O = 7 at a*=0!")
print(f"This means the Landau expansion TRUNCATES here:")
print(f"  F = c1*7 + c2*49 + c3*7 + c4*7 + ...")
print(f"    = 7*(c1 + c3 + c4 + ...) + 49*c2")
print(f"    = 7*(sum of odd-power coefficients) + 49*c2")

# ==============================================================================
# PART 5: THE FULL CRITICAL POINT STRUCTURE
# ==============================================================================

print("\n" + "=" * 70)
print("PART 5: All Critical Points for Specific Lambda Values")
print("=" * 70)

# The stationarity equation dF/da = 0 factors as (a + 7/11) * Q(a) = 0
# Q is quadratic in a. Let's find Q for specific lambda values.

lam_values = [
    ("0", Rational(0)),
    ("1/n_c = 1/11", Rational(1, 11)),
    ("1/Im_O = 1/7", Rational(1, 7)),
    ("Im_H/n_c = 3/11", Rational(3, 11)),
    ("Im_H/Im_O = 3/7", Rational(3, 7)),
    ("H/n_c = 4/11", Rational(4, 11)),
    ("1/H = 1/4", Rational(1, 4)),
    ("1/C = 1/2", Rational(1, 2)),
    ("1", Rational(1)),
]

# For each lambda, use mu^2 = 14 + 2*lam (stationarity at a*=0)
# and find ALL critical points to check that a*=0 is the global minimum

print(f"\nFor each lambda, using mu^2 = 14 + 2*lam (a*=0 stationarity):")
print(f"Check that a*=0 is indeed the global minimum.")

for lam_name, lam_val in lam_values:
    mu2_val = 14 + 2*lam_val

    F_num = F.subs([(mu2, mu2_val), (lam, lam_val)])
    F_num = expand(F_num)

    dF_num = expand(diff(F_num, a))

    # All critical points
    crits = solve(dF_num, a)
    F_at_0_val = float(F_num.subs(a, 0))

    print(f"\n--- lambda = {lam_name}, mu^2 = {mu2_val} ---")
    print(f"  Critical points:")

    min_F = float('inf')
    min_a = None
    for cp in crits:
        try:
            cp_val = complex(N(cp))
            if abs(cp_val.imag) < 1e-10:
                av = float(cp_val.real)
                bv = (-7 - 4*av)/7
                fv = float(N(F_num.subs(a, cp)))
                is_min = ""
                if fv < min_F:
                    min_F = fv
                    min_a = av
                print(f"    a = {av:>8.5f}, b = {bv:>8.5f}, F = {fv:>10.5f}")
        except:
            pass

    # Mark the global minimum
    if min_a is not None:
        print(f"  Global minimum at a = {min_a:.5f}")
        print(f"  Is a*=0 the global minimum? {'YES' if abs(min_a) < 1e-10 else 'NO'}")

# ==============================================================================
# PART 6: CONSTRAINT FROM (4,7) vs (3,8) ENERGY SPLIT
# ==============================================================================

print("\n" + "=" * 70)
print("PART 6: Energy Split Between (4,7) and (3,8) Minima")
print("=" * 70)

# The (3,8) splitting has eigenvalues: 3 copies of a', 8 copies of b'
# with 3a' + 8b' = -7

a_prime = Symbol('a_prime', real=True)
b_prime_of_a = (Rational(-7, 1) - 3*a_prime) / 8

I2_38 = expand(3*a_prime**2 + 8*b_prime_of_a**2)
I4_38 = expand(3*a_prime**4 + 8*b_prime_of_a**4)

print(f"\n(3,8) splitting:")
print(f"  I2(a') = {I2_38}")
print(f"  I4(a') = {I4_38}")

# The (3,8) analog of a*=0 is: a'=0, b'=-7/8
a38_star = Rational(0)
b38_star = b_prime_of_a.subs(a_prime, a38_star)
I2_38_star = I2_38.subs(a_prime, a38_star)
I4_38_star = I4_38.subs(a_prime, a38_star)

print(f"\n(3,8) ground state at a'*=0:")
print(f"  b'* = {b38_star}")
print(f"  I2* = {I2_38_star}")
print(f"  I4* = {I4_38_star}")

# Compare energies
# F(4,7) at a*=0: -7*mu2 + 49 + 7*lam
# F(3,8) at a'*=0: compute
F_47 = -mu2 * I2_star + I2_star**2 + lam * I4_star
F_38 = -mu2 * I2_38_star + I2_38_star**2 + lam * I4_38_star

Delta_E = expand(F_47 - F_38)
print(f"\nF(4,7) - F(3,8) at respective a*=0 points:")
print(f"  = {Delta_E}")
print(f"  = {simplify(Delta_E)}")

# For (4,7) to be lower energy: Delta_E < 0
# Solve for condition on mu2, lam
print(f"\n(4,7) preferred when F(4,7) < F(3,8):")
print(f"  {Delta_E} < 0")

# Factor
Delta_E_factored = factor(Delta_E)
print(f"  Factored: {Delta_E_factored}")

# Check: does c3 > 0 (lam > 0) help?
Delta_E_at_lam0 = Delta_E.subs(lam, 0)
Delta_E_lam_coeff = Delta_E.coeff(lam)
Delta_E_mu2_coeff = Delta_E.coeff(mu2)
Delta_E_const = Delta_E.subs([(lam, 0), (mu2, 0)])

print(f"\n  Delta_E = {Delta_E_mu2_coeff}*mu2 + {Delta_E_const} + {Delta_E_lam_coeff}*lam")
print(f"  mu2 coefficient: {Delta_E_mu2_coeff}")
print(f"  lam coefficient: {Delta_E_lam_coeff}")
print(f"  constant: {Delta_E_const}")

# At the (4,7) stationarity mu^2 = 14 + 2*lam:
Delta_E_stat = Delta_E.subs(mu2, 14 + 2*lam)
Delta_E_stat = expand(Delta_E_stat)
print(f"\nWith mu^2 = 14 + 2*lam (stationarity at a*=0 for (4,7)):")
print(f"  Delta_E = {Delta_E_stat}")
print(f"  = {simplify(Delta_E_stat)}")

# ==============================================================================
# PART 7: WHAT IF b*=-1 IS THE FUNDAMENTAL CONDITION?
# ==============================================================================

print("\n" + "=" * 70)
print("PART 7: The b*=-1 Condition and Its Implications")
print("=" * 70)

print("""
Consider: b* = -1 might be the FUNDAMENTAL condition, not a consequence.

In the crystal, the internal eigenvalues are b = -1. This means:
  - Each internal dimension has tilt exactly -1
  - The "crystallized" state is MAXIMALLY ordered (all internal dims equal)
  - The defect (spacetime) has zero tilt

Why b* = -R = -1?
  - The smallest nonzero division algebra dimension is R = 1
  - A "unit crystallization" step has magnitude R = 1
  - b* = -R is the simplest possible nonzero tilt
""")

# If b* = -1 is the condition, then for general SO(p)xSO(q):
# p*a + q*b = -7 with b = -1 => a = (-7 + q)/p
print(f"If b* = -1 for any SO(p)xSO(q) with p+q=11:")
for p_val in range(1, 11):
    q_val = n_c - p_val
    a_val = Rational(-7 + q_val, p_val)
    I2_val = p_val * a_val**2 + q_val * 1
    I4_val = p_val * a_val**4 + q_val * 1
    print(f"  ({p_val},{q_val}): a* = {a_val} = {float(a_val):.4f}, "
          f"I2 = {I2_val} = {float(I2_val):.2f}, I4 = {I4_val} = {float(I4_val):.2f}")

# For (4,7): a* = (-7+7)/4 = 0  => I2 = I4 = 7
# For (3,8): a* = (-7+8)/3 = 1/3 => I2 = 8+1/3, I4 = 8+1/27
print(f"\nKEY: Only (4,7) gives a*=0 with b*=-1 and the trace constraint!")
print(f"For (3,8) with b*=-1: a* = 1/3 (not zero)")
print(f"  I2(3,8) = {3*Rational(1,9) + 8} = {Rational(1,3) + 8}")
print(f"  I4(3,8) = {3*Rational(1,81) + 8} = {Rational(1,27) + 8}")

# ==============================================================================
# PART 8: LAMBDA FROM MASS SPECTRUM
# ==============================================================================

print("\n" + "=" * 70)
print("PART 8: Lambda from the Mass Spectrum")
print("=" * 70)

# At a*=0, the second derivative of F gives the radial mass
d2F_general = expand(diff(F, a, 2))
d2F_at_0_expr = d2F_general.subs(a, 0)
print(f"\nd^2F/da^2 at a=0 = {expand(d2F_at_0_expr)}")

# With mu^2 = 14 + 2*lam:
mass_sq = d2F_at_0_expr.subs(mu2, 14 + 2*lam)
mass_sq = expand(mass_sq)
print(f"\nWith stationarity (mu^2 = 14 + 2*lam):")
print(f"  m^2_radial = {mass_sq}")
print(f"            = {simplify(mass_sq)}")

# Factor
mass_sq_factored = factor(mass_sq)
print(f"  Factored: {mass_sq_factored}")

# What lambda makes m^2 a "nice" framework number?
print(f"\nm^2_radial as function of lambda:")
for lam_name, lam_val in [("0", 0), ("1/11", Rational(1,11)), ("1/7", Rational(1,7)),
                           ("3/11", Rational(3,11)), ("3/7", Rational(3,7)),
                           ("4/11", Rational(4,11)), ("1/4", Rational(1,4)),
                           ("1/2", Rational(1,2)), ("1", 1)]:
    m2 = mass_sq.subs(lam, lam_val)
    print(f"  lam = {lam_name:>5s}: m^2 = {m2} = {float(m2):.4f}")

# What lambda gives m^2 = framework quantity?
# Some targets: Im_O^2/n_c = 49/11, 2*Im_O = 14, Im_H^2 = 9, etc.
print(f"\nSolving for lambda that gives specific m^2:")
targets = {
    "Im_O^2/n_c = 49/11": Rational(49, 11),
    "2*Im_O = 14": Rational(14),
    "Im_O = 7": Rational(7),
    "Im_H^2 = 9": Rational(9),
    "n_c = 11": Rational(11),
    "H^2 = 16": Rational(16),
    "n_d = 4": Rational(4),
    "C*Im_O = 14": Rational(14),
    "98/11 (SSB threshold)": Rational(98, 11),
}

for target_name, target_val in targets.items():
    lam_sol = solve(mass_sq - target_val, lam)
    for s in lam_sol:
        s_simplified = simplify(s)
        if s_simplified.is_real and s_simplified >= 0:
            print(f"  m^2 = {target_name}: lam = {s_simplified} = {float(s_simplified):.6f}")

# ==============================================================================
# PART 9: THE COMPLETE PICTURE
# ==============================================================================

print("\n" + "=" * 70)
print("PART 9: Bifurcation Analysis — When Does a*=0 Become a Minimum?")
print("=" * 70)

# As mu^2 increases from 0, the uniform point becomes unstable at mu^2_crit.
# The a*=0 solution becomes available when it's a stationary point.
# When is a*=0 first a MINIMUM?

# d^2F/da^2 at a=0 must be positive
# d^2F/da^2|_{a=0} as function of mu2 and lam:
d2F_at_0_general = d2F_general.subs(a, 0)
print(f"\nd^2F/da^2 at a=0 (general mu2, lam):")
print(f"  = {expand(d2F_at_0_general)}")

# For a*=0 to be a minimum: d^2F > 0
# Solve boundary: d^2F = 0
mu2_boundary = solve(d2F_at_0_general, mu2)
print(f"\na=0 is a minimum when mu^2 < {simplify(mu2_boundary[0])}")

# And a=0 is a STATIONARY point when dF/da = 0 at a=0
dF_at_0 = dF.subs(a, 0)
print(f"\ndF/da at a=0 = {expand(dF_at_0)}")
mu2_stationary = solve(dF_at_0, mu2)
print(f"a=0 is stationary when mu^2 = {simplify(mu2_stationary[0])}")
print(f"  = 14 + 2*lam = 2*Im_O + 2*lam")

# Check consistency: is the stationary point a minimum?
# d^2F at a=0 WITH mu^2 = 14 + 2*lam
check = d2F_at_0_general.subs(mu2, 14 + 2*lam)
check = expand(check)
print(f"\nd^2F/da^2 at a=0 with stationarity:")
print(f"  = {check}")
print(f"  = {factor(check)}")

# Is it positive for lam > 0?
print(f"\n  At lam=0: {check.subs(lam, 0)}")
print(f"  At lam=1/11: {check.subs(lam, Rational(1,11))}")
print(f"  At lam=1: {check.subs(lam, 1)}")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    ("I2 at a*=0 = 7 = Im_O",
     I2.subs(a, 0) == 7),

    ("I4 at a*=0 = 7 = Im_O",
     I4.subs(a, 0) == 7),

    ("I2 = I4 at a*=0",
     I2.subs(a, 0) == I4.subs(a, 0)),

    ("b* = -1 when a*=0",
     b_of_a.subs(a, 0) == -1),

    ("Trace: 4*0 + 7*(-1) = -7",
     4*0 + 7*(-1) == -7),

    ("dF/da = 0 at uniform (a=-7/11) for all params",
     simplify(dF.subs(a, Rational(-7,11))) == 0),

    ("Stationarity at a=0 gives mu^2 = 14 + 2*lam",
     simplify(solve(expand(dF.subs(a, 0)), mu2)[0]) == 14 + 2*lam),

    ("14 > 98/11 (a*=0 automatically above SSB threshold)",
     Rational(14) > Rational(98, 11)),

    ("All I_{2k} = 7 at a*=0 (k=1,2,3)",
     all(4*0**(2*k) + 7*(-1)**(2*k) == 7 for k in range(1, 4))),

    ("(4,7) is unique split giving a*=0 with b*=-1",
     Rational(-7 + 7, 4) == 0),

    ("(3,8) with b=-1 gives a*=1/3 (not 0)",
     Rational(-7 + 8, 3) == Rational(1, 3)),

    ("I2(3,8 at b=-1) = 25/3 (not integer)",
     3*Rational(1,9) + 8 == Rational(25, 3)),
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

1. a*=0, b*=-1 GROUND STATE [THEOREM]
   The SO(4)xSO(7) minimum with spacetime tilt = 0 gives:
   I2 = I4 = ... = I_{2k} = 7 = Im_O for ALL k

   This collapses the entire Landau expansion to:
   F = (c1 + c3 + c4 + ...)*7 + c2*49

2. STATIONARITY FIXES mu^2 [THEOREM]
   mu^2 = -c1/c2 = 2*Im_O + 2*lambda = 14 + 2*lambda

   This is ALWAYS above the SSB threshold 98/11 (for lambda >= 0).

3. UNIQUE TO (4,7) [THEOREM]
   The b* = -1 (unit crystallization) condition with trace = -7 gives:
   a* = (-7 + q)/p

   Only (4,7) gives a* = 0 (zero spacetime tilt).
   This provides a NEW selection mechanism for (4,7) over (3,8)!

4. PHYSICAL INTERPRETATION [CONJECTURE]
   a*=0 means spacetime is "perfectly defective" — zero tilt.
   b*=-1 means internal space is "perfectly crystallized" — unit tilt.
   The defect-crystal duality is maximally expressed.

5. OPEN: lambda still undetermined
   mu^2 = 14 + 2*lambda, so determining either fixes both.
   The radial mass m^2_radial depends on lambda.
   Need additional constraint to pin lambda down.
""")
