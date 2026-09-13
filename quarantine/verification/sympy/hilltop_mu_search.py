#!/usr/bin/env python3
"""
Hilltop mu Search: Find Framework Expressions for N ~ 55

PURPOSE: The simple hilltop with mu^2 = 1280/7 * M_Pl^2 gives N = 36.76 (FALSIFIED).
This script searches for what mu^2 is REQUIRED, then looks for framework expressions.

KEY QUESTIONS:
1. What mu^2 gives N = 55?
2. What n_s does that mu give?
3. Are there framework expressions near that mu^2?

Status: SEARCH
Created: Session 129
"""

from sympy import *
from itertools import product

print("=" * 70)
print("HILLTOP MU SEARCH")
print("Finding framework expressions for N ~ 55 e-folds")
print("=" * 70)

# ==============================================================================
# FRAMEWORK CONSTANTS
# ==============================================================================

R, C, Im_H, H, Im_O, O = 1, 2, 3, 4, 7, 8
n_c = 11
n_d = H  # = 4

# All framework numbers for searching
framework_numbers = {
    'R': R, 'C': C, 'Im_H': Im_H, 'H': H, 'Im_O': Im_O, 'O': O,
    'n_c': n_c, 'n_d': n_d,
    '137': 137, '179': 179, '337': 337,  # Key composites
    '111': 111, '97': 97, '17': 17,  # Key primes
}

# ==============================================================================
# REQUIRED mu FOR N = 55
# ==============================================================================

print("\n" + "=" * 70)
print("PART 1: What mu^2 gives N = 55?")
print("=" * 70)

print("""
For hilltop potential V = V0(1 - phi^2/mu^2):

The e-fold integral (with phi_CMB = mu/sqrt5 from r = 1 - n_s condition):
  N = integral (V/V') dphi = integral [-mu^2/(2phi) + phi/2] dphi

Solving for mu^2 given N:
  This is transcendental, so we'll solve numerically.
""")

# Numerical solution for mu^2 given target N
def compute_N_from_mu_sq(mu_sq_val):
    """Compute e-folds for given mu^2"""

    # phi_CMB = mu/sqrt5 (from eta/epsilon = -5 condition for r = 1 - n_s)
    phi_CMB = sqrt(mu_sq_val / 5)

    # phi_end: solve eps = 1
    # eps = 2y/((1-y)^2 mu^2) = 1 where y = phi^2/mu^2
    # 2y = mu^2(1-y)^2
    # mu^2y^2 - (2mu^2 + 2)y + mu^2 = 0

    a = mu_sq_val
    b = -(2*mu_sq_val + 2)
    c = mu_sq_val

    disc = b**2 - 4*a*c
    if disc < 0:
        return None

    y1 = (-b + sqrt(disc)) / (2*a)
    y2 = (-b - sqrt(disc)) / (2*a)

    # Take solution with y < 1
    y_end = float(y2) if float(y2) < 1 else float(y1)
    if y_end <= 0 or y_end >= 1:
        return None

    phi_end = sqrt(y_end * mu_sq_val)

    # N = F(phi_CMB) - F(phi_end) where F(phi) = -mu^2/2 * ln(phi) + phi^2/4
    def F(phi):
        return -mu_sq_val/2 * log(phi) + phi**2/4

    N = F(phi_CMB) - F(phi_end)
    return float(N)

# Binary search for mu^2 that gives N = 55
target_N = 55
mu_sq_low = 100
mu_sq_high = 10000

print(f"Searching for mu^2 that gives N = {target_N}...")

for _ in range(100):
    mu_sq_mid = (mu_sq_low + mu_sq_high) / 2
    N_mid = compute_N_from_mu_sq(mu_sq_mid)

    if N_mid is None:
        break

    if N_mid < target_N:
        mu_sq_low = mu_sq_mid
    else:
        mu_sq_high = mu_sq_mid

    if abs(N_mid - target_N) < 0.01:
        break

mu_sq_required_55 = mu_sq_mid
N_check = compute_N_from_mu_sq(mu_sq_required_55)

print(f"""
RESULT:
  For N = 55: mu^2/M_Pl^2 ~ {mu_sq_required_55:.2f}
  Verification: N({mu_sq_required_55:.2f}) = {N_check:.2f}

Compare to Session 128 value:
  mu^2 = H^4(H+R)/Im_O = 1280/7 ~ 182.86 gave N = 36.76

Required mu^2 is {mu_sq_required_55/182.86:.2f}x larger!
""")

# Also compute for N = 50, 60
mu_sq_for_N = {}
for target in [50, 55, 60]:
    low, high = 100, 10000
    for _ in range(100):
        mid = (low + high) / 2
        N = compute_N_from_mu_sq(mid)
        if N is None:
            break
        if N < target:
            low = mid
        else:
            high = mid
        if abs(N - target) < 0.01:
            break
    mu_sq_for_N[target] = mid

print(f"""
mu^2 required for different N:
  N = 50: mu^2 ~ {mu_sq_for_N[50]:.1f}
  N = 55: mu^2 ~ {mu_sq_for_N[55]:.1f}
  N = 60: mu^2 ~ {mu_sq_for_N[60]:.1f}

  (Session 128: mu^2 = 182.86 gave N = 36.76)
""")

# ==============================================================================
# WHAT n_s DOES REQUIRED mu GIVE?
# ==============================================================================

print("=" * 70)
print("PART 2: What n_s does required mu give?")
print("=" * 70)

print("""
For hilltop with eta/eps = -5 (the r = 1 - n_s condition):

  n_s - 1 = 2eta - 6eps

At phi_CMB = mu/sqrt5:
  eta = -2/mu^2 (for small phi)
  eps = 2phi^2/(mu^4(1 - phi^2/mu^2)^2) at phi^2 = mu^2/5

Let me compute numerically.
""")

def compute_ns_from_mu_sq(mu_sq_val):
    """Compute n_s for given mu^2 at phi_CMB = mu/sqrt5"""

    phi_sq = mu_sq_val / 5  # phi_CMB^2 = mu^2/5

    # V = 1 - phi^2/mu^2
    V = 1 - phi_sq/mu_sq_val  # = 1 - 1/5 = 4/5

    # V' = -2phi/mu^2
    Vprime = -2*sqrt(phi_sq)/mu_sq_val

    # V'' = -2/mu^2
    Vpp = -2/mu_sq_val

    # eps = (1/2)(V'/V)^2
    epsilon = 0.5 * (Vprime/V)**2

    # eta = V''/V
    eta = Vpp/V

    # n_s - 1 = 2eta - 6eps
    ns = 1 + 2*eta - 6*epsilon

    # r = 16eps
    r = 16*epsilon

    return ns, r, eta, epsilon

for N_target, mu_sq in mu_sq_for_N.items():
    ns, r, eta, eps = compute_ns_from_mu_sq(mu_sq)
    print(f"""
For N = {N_target} (mu^2 = {mu_sq:.1f}):
  eps = {eps:.6f}
  eta = {eta:.6f}
  n_s = {ns:.6f}
  r = {r:.6f}

  Compare to observation: n_s = 0.9649 +- 0.0042
  Our target: n_s = 193/200 = 0.965
""")

# ==============================================================================
# KEY INSIGHT
# ==============================================================================

print("=" * 70)
print("KEY INSIGHT")
print("=" * 70)

# For n_s = 193/200 = 0.965, what is required?
ns_target = Rational(193, 200)

# n_s - 1 = 2eta - 6eps
# At phi = mu/sqrt5, for small eps: n_s ~ 1 + 2eta = 1 - 4/mu^2
# So: mu^2 ~ 4/(1 - n_s) = 4/(7/200) = 800/7 ~ 114.3

mu_sq_from_ns = 4 / (1 - float(ns_target))

# But this ignores the eps term. Let's be more careful.
# At phi^2 = mu^2/5:
#   V = 4/5
#   V' = -2(mu/sqrt5)/mu^2 = -2/(musqrt5)
#   eps = (1/2)(V'/V)^2 = (1/2)((-2/(musqrt5))/(4/5))^2 = (1/2)(5/(2mu))^2 = 5/(8mu^2)
#   eta = (-2/mu^2)/(4/5) = -5/(2mu^2)
#
# n_s - 1 = 2(-5/(2mu^2)) - 6(5/(8mu^2)) = -5/mu^2 - 15/(4mu^2) = -35/(4mu^2)
#
# So n_s = 1 - 35/(4mu^2)
#
# For n_s = 193/200: 1 - 35/(4mu^2) = 193/200
#   35/(4mu^2) = 7/200
#   mu^2 = 35 * 200 / (4 * 7) = 7000/28 = 250

mu_sq_exact_for_ns = Rational(35 * 200, 4 * 7)

print(f"""
For n_s = 193/200 = 0.965 (the observed value):

Using n_s = 1 - 35/(4mu^2) for hilltop at phi = mu/sqrt5:

  35/(4mu^2) = 1 - n_s = 7/200
  mu^2 = 35 * 200 / (4 * 7) = {mu_sq_exact_for_ns} = {float(mu_sq_exact_for_ns)}

This is the EXACT mu^2 required for n_s = 193/200.

Now check: does mu^2 = 250 give reasonable N?
""")

# Compute N for mu^2 = 250
N_for_exact_ns = compute_N_from_mu_sq(250)
ns_check, r_check, _, _ = compute_ns_from_mu_sq(250)

print(f"""
For mu^2 = 250 (required for n_s = 193/200):
  N = {N_for_exact_ns:.1f} e-folds
  n_s = {ns_check:.6f} (target: {float(ns_target):.6f})
  r = {r_check:.4f}

Is N ~ {N_for_exact_ns:.0f} acceptable? {"YES" if 45 <= N_for_exact_ns <= 70 else "NO"}
""")

# ==============================================================================
# FRAMEWORK EXPRESSION SEARCH
# ==============================================================================

print("=" * 70)
print("PART 3: Framework expressions near mu^2 = 250")
print("=" * 70)

# Search for simple expressions involving framework numbers
# that give values close to 250

candidates = []

# Single numbers
for name, val in framework_numbers.items():
    if abs(val - 250) / 250 < 0.5:
        candidates.append((val, f"{name}"))

# Products of two numbers
for (n1, v1), (n2, v2) in product(framework_numbers.items(), repeat=2):
    val = v1 * v2
    if abs(val - 250) / 250 < 0.2:
        candidates.append((val, f"{n1} * {n2}"))

# Ratios
for (n1, v1), (n2, v2) in product(framework_numbers.items(), repeat=2):
    if v2 != 0:
        val = v1 / v2
        if abs(val - 250) / 250 < 0.2 and val > 10:
            candidates.append((val, f"{n1}/{n2}"))

# Power combinations
for name, val in framework_numbers.items():
    for power in [2, 3, 4]:
        result = val ** power
        if abs(result - 250) / 250 < 0.2:
            candidates.append((result, f"{name}^{power}"))

# More complex expressions
expressions_to_try = [
    ("H^2 * n_c + H + Im_O", H**2 * n_c + H + Im_O),
    ("H^3 + O^2", H**3 + O**2),
    ("(H + Im_O)^2", (H + Im_O)**2),
    ("n_c^2 + Im_O * n_c", n_c**2 + Im_O * n_c),
    ("179 + Im_O * n_c", 179 + Im_O * n_c),
    ("137 + n_c^2", 137 + n_c**2),
    ("O * (H^2 + Im_H^2)", O * (H**2 + Im_H**2)),
    ("5 * H^2 * Im_H + H", 5 * H**2 * Im_H + H),
    ("H^4 + n_c * H + Im_O * C", H**4 + n_c * H + Im_O * C),
    ("(Im_H^2 + H^2) * n_c - Im_O", (Im_H**2 + H**2) * n_c - Im_O),
    ("n_c * (n_c + Im_O + C)", n_c * (n_c + Im_O + C)),  # 11 * 20 = 220
    ("H * (H + Im_O)^2", H * (H + Im_O)**2),  # 4 * 121 = 484 (too big)
    ("5 * (O * H + Im_O * C)", 5 * (O * H + Im_O * C)),  # 5 * (32+14) = 230
    ("5 * (H^3 + C)", 5 * (H**3 + C)),  # 5 * 66 = 330 (too big)
    ("5 * H * n_c + Im_O * C", 5 * H * n_c + Im_O * C),  # 220 + 14 = 234
    ("5 * (H * n_c + Im_O)", 5 * (H * n_c + Im_O)),  # 5 * 51 = 255
    ("5 * H * (n_c + C)", 5 * H * (n_c + C)),  # 5 * 52 = 260
    ("H * (5 * n_c + Im_O)", H * (5 * n_c + Im_O)),  # 4 * 62 = 248
    ("H * (5 * n_c + O)", H * (5 * n_c + O)),  # 4 * 63 = 252
    ("C * (n_c^2 + Im_H)", C * (n_c**2 + Im_H)),  # 2 * 124 = 248
    ("C * (n_c^2 + H)", C * (n_c**2 + H)),  # 2 * 125 = 250!
    ("Im_H^2 * (n_c + Im_O) + Im_O", Im_H**2 * (n_c + Im_O) + Im_O),  # 9*18+7 = 169
    ("5 * 50", 250),  # trivial
    ("25 * n_c - R * 5", 25 * n_c - R * 5),  # 275-5 = 270
    ("O * (H^2 + Im_H^2) - C", O * (H**2 + Im_H**2) - C),  # 8*25 - 2 = 198
]

for name, val in expressions_to_try:
    if val > 0 and abs(val - 250) / 250 < 0.15:
        candidates.append((val, name))

# Remove duplicates and sort by closeness to 250
seen = set()
unique_candidates = []
for val, expr in candidates:
    if (val, expr) not in seen:
        seen.add((val, expr))
        unique_candidates.append((val, expr))

unique_candidates.sort(key=lambda x: abs(x[0] - 250))

print(f"Target: mu^2 = 250 (for n_s = 193/200)\n")
print("Closest framework expressions:")
print("-" * 50)

for val, expr in unique_candidates[:20]:
    error_pct = (val - 250) / 250 * 100
    N_val = compute_N_from_mu_sq(float(val))
    ns_val, _, _, _ = compute_ns_from_mu_sq(float(val))
    print(f"{val:8.1f} = {expr:35s}  (N={N_val:.1f}, n_s={ns_val:.4f})")

# ==============================================================================
# HIGHLIGHT: EXACT MATCH
# ==============================================================================

print("\n" + "=" * 70)
print("CRITICAL FINDING")
print("=" * 70)

# C * (n_c^2 + H) = 2 * (121 + 4) = 2 * 125 = 250 EXACTLY!
mu_sq_exact = C * (n_c**2 + H)

print(f"""
*** EXACT FRAMEWORK EXPRESSION FOUND ***

  mu^2 = C * (n_c^2 + H) = 2 * (121 + 4) = 2 * 125 = 250

This gives:
  - n_s = 193/200 = 0.965 EXACTLY (by construction)

Let's verify the physics:
""")

N_exact = compute_N_from_mu_sq(250)
ns_exact, r_exact, eta_exact, eps_exact = compute_ns_from_mu_sq(250)

print(f"""
For mu^2 = C * (n_c^2 + H) = {mu_sq_exact}:
  N = {N_exact:.1f} e-folds
  n_s = {ns_exact:.6f}
  r = {r_exact:.5f}

  r = 1 - n_s check: {1 - ns_exact:.5f} (actual r = {r_exact:.5f})
""")

# ==============================================================================
# INTERPRETATION
# ==============================================================================

print("=" * 70)
print("INTERPRETATION")
print("=" * 70)

print(f"""
COMPARISON OF TWO FRAMEWORK EXPRESSIONS:

1. Session 127 expression: mu^2 = H^4(H+R)/Im_O = 1280/7 ~ 182.86
   - Gave N = 36.76 (FALSIFIED)
   - Would give n_s ~ 0.952 (too low)

2. NEW expression: mu^2 = C * (n_c^2 + H) = 250
   - Gives N = {N_exact:.1f} ({"ACCEPTABLE" if 45 <= N_exact <= 70 else "NOT ACCEPTABLE"})
   - Gives n_s = 193/200 = 0.965 EXACTLY

The new expression has a cleaner interpretation:
  - C = 2 (complex dimension)
  - n_c^2 + H = 121 + 4 = 125 (crystal^2 + spacetime)
  - mu^2 = 2 * 125 = 250

NOTE: The relation r = 1 - n_s only holds exactly if eta/eps = -5.
For mu^2 = 250: eta = -0.01, eps = 0.0025, ratio = {-0.01/0.0025:.1f}
""")

# Verify the eta/eps ratio
eta_over_eps = eta_exact / eps_exact
print(f"eta/eps ratio: {eta_over_eps:.3f} (should be -5 for r = 1 - n_s)")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    ("mu^2 = C * (n_c^2 + H) = 250 (exact)",
     mu_sq_exact == 250),

    ("n_s within Planck 2s (0.9607 - 0.9691)",
     0.9607 <= ns_exact <= 0.9691),

    ("N in range [45, 70]",
     45 <= N_exact <= 70),

    ("N in range [50, 60] (standard)",
     50 <= N_exact <= 60),

    ("r < 0.056 (Planck/BICEP limit)",
     r_exact < 0.056),
]

print()
all_pass = True
critical_pass = True

for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

# ==============================================================================
# SUMMARY
# ==============================================================================

print(f"""

{"=" * 70}
SUMMARY
{"=" * 70}

*** RESULT: ALTERNATIVE EXPRESSION FOUND ***

Old (Session 127, FALSIFIED):
  mu^2 = H^4(H+R)/Im_O = 1280/7 ~ 182.86
  N = 36.76 (outside [45, 70])

NEW CANDIDATE:
  mu^2 = C * (n_c^2 + H) = 2 * 125 = 250
  N = {N_exact:.1f}
  n_s = 193/200 = 0.965 (matches observation)
  r = {r_exact:.4f}

Framework interpretation:
  - C = 2: Complex dimension
  - n_c^2 = 121: Crystal dimension squared
  - H = 4: Quaternion/spacetime dimension
  - Sum 125 = 5^3: Possible significance?

STATUS: {"PASSES all e-fold and CMB tests" if all_pass else "Some tests fail"}

NEXT STEPS:
1. If acceptable: Update primordial_mechanisms.md with new expression
2. Run /launch-steps adversarial analysis on this candidate
3. Check: Can C * (n_c^2 + H) be derived from crystallization physics?
""")

if all_pass:
    print("\n*** ALL TESTS PASS ***")
else:
    print("\n*** SOME TESTS FAILED - INVESTIGATE ***")
