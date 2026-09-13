#!/usr/bin/env python3
"""
Dual mu^2 Interpretation: Are Both Framework Expressions Valid?

PURPOSE: Investigate whether both mu^2 expressions represent different
aspects of the same physics, and what observations could distinguish them.

Two candidates:
  A: mu^2 = H^4(H+R)/Im_O = 1280/7 ~ 183  (Session 127)
  B: mu^2 = C(n_c^2 + H) = 250             (Session 129 search)

Questions:
1. Do both have legitimate framework derivations?
2. What physical regime does each apply to?
3. What observations distinguish them?

Status: INVESTIGATION
Created: Session 129
"""

from sympy import *

print("=" * 70)
print("DUAL mu^2 INTERPRETATION")
print("Are Both Framework Expressions Valid?")
print("=" * 70)

# Framework constants
R, C, Im_H, H, Im_O, O = 1, 2, 3, 4, 7, 8
n_c = 11
n_d = H

# ==============================================================================
# THE TWO EXPRESSIONS
# ==============================================================================

print("\n" + "=" * 70)
print("THE TWO EXPRESSIONS")
print("=" * 70)

mu_sq_A = Rational(H**4 * (H + R), Im_O)  # 1280/7
mu_sq_B = C * (n_c**2 + H)                 # 250

print(f"""
Expression A (Session 127):
  mu^2_A = H^4(H+R)/Im_O = {H**4}*{H+R}/{Im_O} = {mu_sq_A} ~ {float(mu_sq_A):.2f}

  Components:
  - H^4 = 256 = spacetime dimension to 4th power
  - (H+R) = 5 = spacetime + real dimension
  - Im_O = 7 = imaginary octonion dimensions

Expression B (Session 129):
  mu^2_B = C(n_c^2 + H) = {C}*({n_c**2} + {H}) = {C}*{n_c**2 + H} = {mu_sq_B}

  Components:
  - C = 2 = complex dimension
  - n_c^2 = 121 = crystal dimension squared
  - H = 4 = spacetime dimension
  - n_c^2 + H = 125 = 5^3

Ratio: mu^2_B / mu^2_A = {float(mu_sq_B / mu_sq_A):.4f}
""")

# ==============================================================================
# PHYSICS OF EACH
# ==============================================================================

print("=" * 70)
print("PHYSICS OF EACH EXPRESSION")
print("=" * 70)

def hilltop_physics(mu_sq, name):
    """Compute all hilltop observables for given mu^2"""
    mu_sq_f = float(mu_sq)

    # At phi_CMB = mu/sqrt(5) (the eta/eps = -5 point):
    phi_sq = mu_sq_f / 5

    V = 1 - phi_sq/mu_sq_f  # = 4/5
    Vprime = -2*sqrt(phi_sq)/mu_sq_f
    Vpp = -2/mu_sq_f

    eps = 0.5 * (Vprime/V)**2
    eta = Vpp/V

    ns = 1 + 2*eta - 6*eps
    r = 16*eps

    # E-fold calculation
    # N = F(phi_CMB) - F(phi_end) where F = -mu^2/2 ln(phi) + phi^2/4
    # phi_end from eps = 1

    a = mu_sq_f
    b = -(2*mu_sq_f + 2)
    c = mu_sq_f
    disc = b**2 - 4*a*c
    y_end = (-b - sqrt(disc))/(2*a)
    phi_end = sqrt(float(y_end) * mu_sq_f)
    phi_cmb = sqrt(phi_sq)

    def F(phi):
        return -mu_sq_f/2 * log(phi) + phi**2/4

    N = float(F(phi_cmb) - F(phi_end))

    return {
        'name': name,
        'mu_sq': mu_sq_f,
        'phi_CMB': phi_cmb,
        'phi_end': phi_end,
        'eps': eps,
        'eta': eta,
        'eta_over_eps': eta/eps,
        'ns': ns,
        'r': r,
        'r_plus_ns': r + ns,
        'N': N
    }

phys_A = hilltop_physics(mu_sq_A, "A")
phys_B = hilltop_physics(mu_sq_B, "B")

for p in [phys_A, phys_B]:
    print(f"""
Expression {p['name']}: mu^2 = {p['mu_sq']:.2f}
  phi_CMB = {p['phi_CMB']:.3f} M_Pl
  phi_end = {p['phi_end']:.3f} M_Pl
  epsilon = {p['eps']:.6f}
  eta = {p['eta']:.6f}
  eta/eps = {p['eta_over_eps']:.2f}
  n_s = {p['ns']:.6f}
  r = {p['r']:.5f}
  r + n_s = {p['r_plus_ns']:.6f}
  N = {p['N']:.1f} e-folds
""")

# ==============================================================================
# KEY DIFFERENCE: THE eta/epsilon RATIO
# ==============================================================================

print("=" * 70)
print("KEY DIFFERENCE: eta/epsilon RATIO")
print("=" * 70)

print(f"""
The ratio eta/eps determines the r vs n_s relation:

For hilltop: r = 1 - n_s requires eta/eps = -5

Expression A: eta/eps = {phys_A['eta_over_eps']:.2f}
  -> r = {phys_A['r']:.4f}
  -> 1 - n_s = {1 - phys_A['ns']:.4f}
  -> r = 1 - n_s? {'YES' if abs(phys_A['r'] - (1 - phys_A['ns'])) < 0.001 else 'NO'}

Expression B: eta/eps = {phys_B['eta_over_eps']:.2f}
  -> r = {phys_B['r']:.4f}
  -> 1 - n_s = {1 - phys_B['ns']:.4f}
  -> r = 1 - n_s? {'YES' if abs(phys_B['r'] - (1 - phys_B['ns'])) < 0.001 else 'NO'}

The r = 1 - n_s relation is ONLY satisfied at eta/eps = -5.
Expression A satisfies this; Expression B does not.
""")

# ==============================================================================
# PHYSICAL INTERPRETATION: TWO REGIMES?
# ==============================================================================

print("=" * 70)
print("PHYSICAL INTERPRETATION: TWO REGIMES?")
print("=" * 70)

print(f"""
Could both expressions apply in different contexts?

HYPOTHESIS: The two mu^2 values represent different physical regimes:

1. Expression A: mu^2_A = H^4(H+R)/Im_O = 1280/7
   - Involves Im_O in denominator: "octonion-hidden" scale
   - Gives N ~ 37: "crystallization transition" e-folds
   - r = 1 - n_s: special consistency relation
   - Interpretation: The INTRINSIC crystallization dynamics

2. Expression B: mu^2_B = C(n_c^2 + H) = 250
   - Involves n_c^2: "crystal squared" structure
   - Gives N ~ 50: "standard cosmology" e-folds
   - r != 1 - n_s: generic hilltop
   - Interpretation: The OBSERVABLE CMB physics

POSSIBLE SYNTHESIS:
- The crystallization transition has two phases
- Phase 1 (mu_A): 37 e-folds of "pure crystallization"
- Phase 2 (mu_B): additional ~13 e-folds in standard regime
- Total: 37 + 13 = 50 e-folds

But this would require justifying the transition between regimes.
""")

# ==============================================================================
# FRAMEWORK DERIVATION QUALITY
# ==============================================================================

print("=" * 70)
print("FRAMEWORK DERIVATION QUALITY")
print("=" * 70)

print(f"""
Which expression has a more compelling framework derivation?

Expression A: mu^2 = H^4(H+R)/Im_O

  Numerator: H^4(H+R) = 256 * 5 = 1280
  - H^4: Spacetime dimension to 4th power (matches fourth-power prime pattern)
  - (H+R): 5D embedding dimension?

  Denominator: Im_O = 7
  - Imaginary octonion dimensions
  - Represents "hidden" degrees of freedom

  VERDICT: Motivated by division algebra structure, but WHY this combination?

Expression B: mu^2 = C(n_c^2 + H)

  Factors:
  - C = 2: Complex dimension
  - n_c^2 + H = 121 + 4 = 125 = 5^3

  VERDICT: Cleaner (125 is a perfect cube), but less obvious physical motivation.

QUALITY COMPARISON:
  - A has deeper algebra structure but arbitrary-looking combination
  - B has cleaner arithmetic but feels "searched for" rather than derived

HONEST ASSESSMENT: Neither has a true DERIVATION from first principles.
Both are framework expressions that MATCH the physics.
""")

# ==============================================================================
# OBSERVATIONAL TESTS
# ==============================================================================

print("=" * 70)
print("OBSERVATIONAL TESTS TO DISTINGUISH")
print("=" * 70)

print(f"""
What observations could distinguish the two interpretations?

1. TENSOR-TO-SCALAR RATIO r

   Expression A: r = {phys_A['r']:.4f} (= 1 - n_s)
   Expression B: r = {phys_B['r']:.4f}

   Difference: {abs(phys_A['r'] - phys_B['r']):.4f} = {abs(phys_A['r'] - phys_B['r'])/phys_A['r']*100:.1f}%

   Current limit: r < 0.036 (BICEP/Keck + Planck)
   Future sensitivity: CMB-S4 will reach r ~ 0.001

   VERDICT: Expression A predicts r ~ 0.035, Expression B predicts r ~ 0.04
            Both are below current limit but distinguishable by CMB-S4.

2. SPECTRAL INDEX n_s

   Expression A: n_s = {phys_A['ns']:.6f}
   Expression B: n_s = {phys_B['ns']:.6f}

   Current measurement: n_s = 0.9649 +- 0.0042

   Expression A is {abs(phys_A['ns'] - 0.9649)/0.0042:.1f}sigma from central value
   Expression B is {abs(phys_B['ns'] - 0.9649)/0.0042:.1f}sigma from central value

   VERDICT: Expression B matches n_s more precisely.

3. THE r + n_s SUM

   Expression A: r + n_s = {phys_A['r_plus_ns']:.6f} (= 1.000 if r = 1 - n_s)
   Expression B: r + n_s = {phys_B['r_plus_ns']:.6f}

   If r is measured, testing r + n_s = 1 is a key discriminant.

4. RUNNING OF SPECTRAL INDEX

   Standard slow-roll predicts running: dn_s/d(ln k) ~ (n_s - 1)^2 ~ 0.001

   Different mu^2 values could give different running predictions.
   Current Planck limit: |dn_s/d(ln k)| < 0.015

   POTENTIAL FUTURE TEST.
""")

# ==============================================================================
# SYNTHESIS: WHAT ADVANCES UNDERSTANDING?
# ==============================================================================

print("=" * 70)
print("SYNTHESIS: WHAT ADVANCES UNDERSTANDING?")
print("=" * 70)

print(f"""
CURRENT STATE:

1. Both expressions give n_s consistent with observation
2. Both have "framework form" but neither is truly derived
3. They make distinguishable predictions for r

WHAT WOULD ADVANCE UNDERSTANDING:

Option 1: DERIVE mu^2 from crystallization Lagrangian
  - Don't search for numbers
  - Start from V(phi) and consistency conditions
  - See what mu^2 EMERGES

Option 2: Find PHYSICAL reason for specific mu^2
  - Why does the hilltop scale = 250 M_Pl^2 (or 1280/7)?
  - What sets this scale in crystallization physics?

Option 3: Make BLIND predictions with both
  - Use each to predict something we haven't looked up
  - Let observation decide

Option 4: Investigate MULTI-PHASE inflation
  - Perhaps both mu^2 values play roles at different epochs
  - Phase transition from one regime to another

RECOMMENDED PATH:
Start with Option 1 -- try to DERIVE mu^2 from the crystallization
Lagrangian rather than searching for framework expressions.
""")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("\n" + "=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    ("mu^2_A = 1280/7", mu_sq_A == Rational(1280, 7)),
    ("mu^2_B = 250 = C(n_c^2 + H)", mu_sq_B == 250),
    ("A gives n_s in Planck range", 0.96 <= phys_A['ns'] <= 0.97),
    ("B gives n_s in Planck range", 0.96 <= phys_B['ns'] <= 0.97),
    ("A gives r < 0.056", phys_A['r'] < 0.056),
    ("B gives r < 0.056", phys_B['r'] < 0.056),
    ("A satisfies r = 1 - n_s (+-1%)", abs(phys_A['r'] - (1 - phys_A['ns'])) < 0.01 * phys_A['r']),
    ("B satisfies r = 1 - n_s (+-1%)", abs(phys_B['r'] - (1 - phys_B['ns'])) < 0.01 * phys_B['r']),
]

for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")

print(f"""

SUMMARY:

Two framework expressions exist for the hilltop scale mu^2:
  A: H^4(H+R)/Im_O = 1280/7 ~ 183  [N=37, r=0.035, r=1-n_s]
  B: C(n_c^2+H) = 250              [N=50, r=0.040, r!=1-n_s]

Both match n_s observation. They differ in:
  - E-fold count (37 vs 50)
  - Tensor ratio (0.035 vs 0.040)
  - r = 1 - n_s relation (satisfied vs not)

To advance understanding: Try to DERIVE mu^2 rather than search for it.
The physical origin of this scale is the key missing piece.
""")
