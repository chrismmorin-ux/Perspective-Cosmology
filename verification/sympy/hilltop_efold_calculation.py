#!/usr/bin/env python3
"""
Hilltop E-fold Calculation: Critical Test for n_s = 193/200 Derivation

PURPOSE: Verify that the hilltop potential with framework parameters
gives N ≈ 55 e-folds as required for CMB observations.

This is the BLOCKING calculation identified by the Engine agent.
If N fails, the entire hilltop interpretation is falsified.

KEY QUESTION: Does N fall in [50, 60]?

Potential: V = V0(1 - phi^2/mu^2)
Framework parameter: mu^2 = H^4(H+R)/Im_O * M_Pl^2 = 1280/7 * M_Pl^2

Status: CRITICAL VERIFICATION
Created: Session 128
"""

from sympy import *

print("=" * 70)
print("HILLTOP E-FOLD CALCULATION")
print("Critical test for n_s = 193/200 derivation")
print("=" * 70)

# ==============================================================================
# FRAMEWORK CONSTANTS
# ==============================================================================

R, C, Im_H, H, Im_O, O = 1, 2, 3, 4, 7, 8
n_c = 11
n_d = H  # = 4

# mu^2/M_Pl^2 from framework (Session 127 result)
mu_squared_over_Mpl2 = Rational(H**4 * (H + R), Im_O)  # = 1280/7

print(f"""
FRAMEWORK PARAMETERS:
  mu^2/M_Pl^2 = H^4(H+R)/Im_O = {H**4}*{H+R}/{Im_O} = {mu_squared_over_Mpl2} = {float(mu_squared_over_Mpl2):.4f}
  mu/M_Pl = sqrt({mu_squared_over_Mpl2}) = {float(sqrt(mu_squared_over_Mpl2)):.4f}
""")

# ==============================================================================
# HILLTOP POTENTIAL ANALYSIS
# ==============================================================================

print("=" * 70)
print("HILLTOP POTENTIAL: V = V0(1 - phi^2/mu^2)")
print("=" * 70)

# Working in Planck units (M_Pl = 1)
phi = symbols('phi', positive=True, real=True)
mu_sq = mu_squared_over_Mpl2  # In Planck units

# Potential and derivatives
V = 1 - phi**2/mu_sq  # V/V0, normalized
Vprime = diff(V, phi)
Vdoubleprime = diff(Vprime, phi)

print(f"""
In Planck units (M_Pl = 1):
  V/V0 = 1 - phi^2/mu^2 = 1 - phi^2/({mu_sq})
  V'/V0 = {Vprime}
  V''/V0 = {Vdoubleprime}
""")

# ==============================================================================
# SLOW-ROLL PARAMETERS
# ==============================================================================

print("=" * 70)
print("SLOW-ROLL PARAMETERS")
print("=" * 70)

# epsilon = (1/2)(V'/V)^2  [in Planck units]
# For V = V0(1 - x^2) where x = phi/mu:
# V'/V = -2x/mu / (1-x^2) = -2phi/(mu^2(1-phi^2/mu^2))

# Let's work with x = phi^2/mu^2 for clarity
x = phi**2/mu_sq

epsilon_expr = Rational(1,2) * (Vprime/V)**2
epsilon_simplified = simplify(epsilon_expr)

eta_expr = Vdoubleprime/V
eta_simplified = simplify(eta_expr)

print(f"""
epsilon = (1/2)(V'/V)^2 = {epsilon_simplified}
eta = V''/V = {eta_simplified}

For small phi (phi << mu):
  epsilon ~ 2*phi^2/mu^4
  eta ~ -2/mu^2 = -2/{mu_sq} = {float(-2/mu_sq):.6f}
""")

# ==============================================================================
# FIELD VALUES
# ==============================================================================

print("=" * 70)
print("CRITICAL FIELD VALUES")
print("=" * 70)

# phi_CMB: where eta/epsilon = -5 (required for r = 1 - n_s)
# From Session 127: phi_CMB = mu/sqrt(5)
phi_CMB_sq = mu_sq / 5
phi_CMB = sqrt(phi_CMB_sq)

print(f"""
phi_CMB (where eta/epsilon = -5):
  phi_CMB^2/M_Pl^2 = mu^2/(5*M_Pl^2) = {mu_sq}/5 = {phi_CMB_sq} = {float(phi_CMB_sq):.4f}
  phi_CMB/M_Pl = {float(phi_CMB):.4f}
""")

# phi_end: where epsilon = 1 (inflation ends)
# epsilon = 2*phi^2/(mu^4 * (1 - phi^2/mu^2)^2) = 1
#
# Let y = phi^2/mu^2
# epsilon = 2y/((1-y)^2 * mu^2) = 1
# 2y = mu^2 * (1-y)^2
#
# This is a quadratic in y. Let's solve it.

y = symbols('y', positive=True, real=True)
epsilon_in_y = 2*y / (mu_sq * (1-y)**2)

# Solve epsilon = 1
eq = Eq(epsilon_in_y, 1)
# 2y = mu_sq * (1-y)^2
# 2y = mu_sq * (1 - 2y + y^2)
# 2y = mu_sq - 2*mu_sq*y + mu_sq*y^2
# mu_sq*y^2 - (2*mu_sq + 2)*y + mu_sq = 0

a_coef = mu_sq
b_coef = -(2*mu_sq + 2)
c_coef = mu_sq

discriminant = b_coef**2 - 4*a_coef*c_coef
y_solutions = [(-b_coef + sqrt(discriminant))/(2*a_coef),
               (-b_coef - sqrt(discriminant))/(2*a_coef)]

print(f"""
Finding phi_end where epsilon = 1:

Equation: 2y = mu^2(1-y)^2  where y = phi^2/mu^2
Quadratic: {mu_sq}*y^2 - {2*mu_sq + 2}*y + {mu_sq} = 0

Discriminant = {discriminant} = {float(discriminant):.4f}
""")

# We need y < 1 (phi < mu for hilltop to make sense)
y_end = None
for sol in y_solutions:
    val = float(sol)
    print(f"  Solution: y = {float(sol):.6f}")
    if 0 < val < 1:
        y_end = sol

if y_end is None:
    # Try numerical approach
    print("  Solving numerically...")
    from sympy import nsolve
    y_sym = symbols('y')
    eq_num = mu_sq*y_sym**2 - (2*mu_sq + 2)*y_sym + mu_sq
    y_end = nsolve(eq_num, y_sym, 0.5)

phi_end_sq = y_end * mu_sq
phi_end = sqrt(phi_end_sq)

print(f"""
phi_end (where epsilon = 1):
  y_end = phi_end^2/mu^2 = {float(y_end):.6f}
  phi_end^2/M_Pl^2 = {float(phi_end_sq):.4f}
  phi_end/M_Pl = {float(phi_end):.4f}
""")

# Verify epsilon = 1 at phi_end
epsilon_at_end = 2*y_end / (mu_sq * (1-y_end)**2)
print(f"  Verification: epsilon(phi_end) = {float(epsilon_at_end):.4f} (should be 1.0)")

# ==============================================================================
# E-FOLD CALCULATION
# ==============================================================================

print("=" * 70)
print("E-FOLD NUMBER CALCULATION")
print("=" * 70)

print("""
Number of e-folds:
  N = integral_{phi_end}^{phi_CMB} (V/V') dphi  [in Planck units]

For V = V0(1 - phi^2/mu^2):
  V/V' = (1 - phi^2/mu^2) / (-2*phi/mu^2)
       = -mu^2/(2*phi) * (1 - phi^2/mu^2)
       = -mu^2/(2*phi) + phi/2
""")

# Integrand for N
integrand = V / Vprime
integrand_simplified = simplify(integrand)
print(f"  Integrand: V/V' = {integrand_simplified}")

# Integrate
N_integral = integrate(integrand_simplified, phi)
print(f"  Antiderivative: {N_integral}")

# N = [antiderivative]_{phi_end}^{phi_CMB}
# Note: Since V' < 0, the integral from phi_end to phi_CMB with phi_CMB < phi_end
# Actually for hilltop, phi_CMB < phi_end (rolling down from top)

# Wait, let me reconsider. In hilltop:
# - phi starts near 0 (top of hill)
# - phi rolls toward larger values
# - inflation ends when phi gets large enough that epsilon = 1

# So phi_CMB < phi_end, and the field increases during inflation

# The standard formula is N = integral_{phi_CMB}^{phi_end} (1/sqrt(2*epsilon)) dphi
# Or equivalently N = integral (V/V') dphi with appropriate sign

# Let's use the standard form:
# N = integral_{phi_CMB}^{phi_end} V/(V' * M_Pl^2) dphi
# In Planck units (M_Pl = 1):
# N = integral_{phi_CMB}^{phi_end} (V/V') dphi
#
# Since V' < 0 and we integrate from smaller to larger phi,
# we need: N = -integral_{phi_CMB}^{phi_end} (V/V') dphi
#            = integral_{phi_end}^{phi_CMB} (V/V') dphi  [flip limits]

# Actually the standard formula is N = integral (V/V') dphi from phi_i to phi_f
# where the sign of V' handles the direction.

# Let me compute directly:
antideriv = -mu_sq/2 * log(phi) + phi**2/4

N_at_CMB = antideriv.subs(phi, phi_CMB)
N_at_end = antideriv.subs(phi, phi_end)

# N = antideriv(phi_CMB) - antideriv(phi_end) for field rolling from CMB to end
# But wait, the integrand V/V' is negative (V > 0, V' < 0)
# So we need N = |integral|

# More carefully: N = integral_{phi_CMB}^{phi_end} (1/sqrt(2*epsilon)) dphi
# where epsilon = (1/2)(V'/V)^2
# So sqrt(2*epsilon) = |V'/V|
# Thus N = integral |V/V'| dphi

# Since V/V' < 0, we have |V/V'| = -V/V'
# N = -integral_{phi_CMB}^{phi_end} (V/V') dphi
#   = -[antideriv(phi_end) - antideriv(phi_CMB)]
#   = antideriv(phi_CMB) - antideriv(phi_end)

N_value = N_at_CMB - N_at_end

print(f"""
Computing N:
  Antiderivative F(phi) = -mu^2/2 * ln(phi) + phi^2/4

  F(phi_CMB) = F({float(phi_CMB):.4f}) = {float(N_at_CMB):.4f}
  F(phi_end) = F({float(phi_end):.4f}) = {float(N_at_end):.4f}

  N = F(phi_CMB) - F(phi_end) = {float(N_value):.2f}
""")

# ==============================================================================
# ALTERNATIVE CALCULATION (as cross-check)
# ==============================================================================

print("=" * 70)
print("CROSS-CHECK: Direct numerical integration")
print("=" * 70)

from sympy import N as numerical_eval

# Numerical integration
phi_CMB_num = float(phi_CMB)
phi_end_num = float(phi_end)
mu_sq_num = float(mu_sq)

def integrand_func(p):
    V_val = 1 - p**2/mu_sq_num
    Vp_val = -2*p/mu_sq_num
    return abs(V_val/Vp_val)

# Simple trapezoidal integration
n_points = 10000
phi_values = [phi_CMB_num + i*(phi_end_num - phi_CMB_num)/n_points for i in range(n_points+1)]
integrand_values = [integrand_func(p) for p in phi_values]

N_numerical = 0
for i in range(n_points):
    dp = phi_values[i+1] - phi_values[i]
    N_numerical += 0.5 * (integrand_values[i] + integrand_values[i+1]) * dp

print(f"""
Numerical integration with {n_points} points:
  phi_CMB = {phi_CMB_num:.6f}
  phi_end = {phi_end_num:.6f}

  N (numerical) = {N_numerical:.2f}
  N (symbolic)  = {float(N_value):.2f}

  Agreement: {abs(N_numerical - float(N_value)) < 1}
""")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

N_final = float(N_value)

tests = [
    ("mu^2/M_Pl^2 = 1280/7 (framework value)",
     mu_sq == Rational(1280, 7)),

    ("phi_CMB = mu/sqrt(5) (eta/epsilon = -5 condition)",
     abs(float(phi_CMB**2 - mu_sq/5)) < 1e-10),

    ("epsilon(phi_end) = 1 (inflation end condition)",
     abs(float(epsilon_at_end) - 1) < 0.01),

    ("N in range [50, 60] (CMB requirement)",
     50 <= N_final <= 60),

    ("N in range [45, 70] (extended acceptable range)",
     45 <= N_final <= 70),

    ("Symbolic and numerical N agree",
     abs(N_numerical - N_final) < 1),
]

print()
all_pass = True
critical_pass = True

for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False
        if "N in range [50, 60]" in name:
            critical_pass = False

# ==============================================================================
# SUMMARY
# ==============================================================================

print(f"""

{"=" * 70}
SUMMARY
{"=" * 70}

E-FOLD RESULT: N = {N_final:.1f}

Target range: N in [50, 60] for typical CMB observations
Extended range: N in [45, 70] for model uncertainty

Framework parameters:
  mu^2 = H^4(H+R)/Im_O * M_Pl^2 = 1280/7 * M_Pl^2
  phi_CMB = mu/sqrt(5) (from r = 1 - n_s requirement)
  phi_end where epsilon = 1

CRITICAL TEST RESULT: {"PASS - N is in acceptable range!" if 45 <= N_final <= 70 else "FAIL - N outside acceptable range"}

""")

if 50 <= N_final <= 60:
    print("""
*** STRONG PASS ***
N falls in the standard range [50, 60].
The hilltop interpretation is VALIDATED.
The n_s = 193/200 derivation can proceed.
""")
elif 45 <= N_final <= 70:
    print("""
*** MARGINAL PASS ***
N falls in the extended range [45, 70] but not [50, 60].
The hilltop interpretation is PLAUSIBLE but needs refinement.
Consider:
- More precise phi_CMB determination
- Reheating temperature effects
- Alternative hilltop forms (p ≠ 2)
""")
else:
    print(f"""
*** FAIL ***
N = {N_final:.1f} is OUTSIDE acceptable range.
The hilltop interpretation with these parameters is FALSIFIED.

Options:
1. Different framework expression for mu^2
2. Different potential form (not simple hilltop)
3. Quarantine n_s = 193/200 claim
""")

if all_pass:
    print("\n*** ALL TESTS PASS ***")
else:
    print("\n*** SOME TESTS FAILED ***")
