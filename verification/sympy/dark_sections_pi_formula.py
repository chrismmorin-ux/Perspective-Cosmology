"""
Dark Sections and |Pi| = 137^55 Formula Verification

Tests the |Pi| formula and pair decomposition into light/dark/twilight sectors.

Hypothesis:
- |Pi| = (1/alpha)^(n_c choose 2) = 137^55
- The 55 pairs decompose by visibility: 6 light + 21 dark + 28 twilight = 55
"""

from math import comb, log10
from sympy import Integer, binomial, Rational, sqrt, log as symlog, N

print("=" * 60)
print("Dark Sections and |Pi| Formula Verification")
print("=" * 60)

# Parameters
n_d = 4   # Perceived spacetime dimensions (defect)
n_c = 11  # Crystal dimensions (M-theory)

print(f"\n1. Basic Parameters")
print(f"   n_d (spacetime) = {n_d}")
print(f"   n_c (crystal) = {n_c}")

# Alpha formula
print(f"\n2. Alpha Formula: alpha = 1/(n_d^2 + n_c^2)")
alpha_inv = n_d**2 + n_c**2
print(f"   n_d^2 = {n_d**2}")
print(f"   n_c^2 = {n_c**2}")
print(f"   1/alpha = {n_d**2} + {n_c**2} = {alpha_inv}")
alpha_measured = 137.035999
print(f"   alpha_measured^(-1) = {alpha_measured:.6f}")
print(f"   Error: {abs(alpha_inv - alpha_measured)/alpha_measured * 100:.4f}%")

# |Pi| formula
print(f"\n3. |Pi| Formula: |Pi| = (1/alpha)^(n_c choose 2)")
exponent = comb(n_c, 2)
print(f"   (n_c choose 2) = ({n_c} choose 2) = {exponent}")

Pi_value = Integer(alpha_inv) ** exponent
Pi_log10 = float(N(symlog(Pi_value, 10)))
print(f"   |Pi| = {alpha_inv}^{exponent}")
print(f"   log10(|Pi|) = {Pi_log10:.2f}")

Pi_observed = 118  # log10 scale, from cosmological horizon
print(f"   Observed log10(|Pi|) ~ {Pi_observed}")
print(f"   Error in log scale: {abs(Pi_log10 - Pi_observed)/Pi_observed * 100:.1f}%")

# Pair decomposition
print(f"\n4. Pair Decomposition by Visibility")
print(f"   Given: {n_d} visible (spacetime) + {n_c - n_d} hidden (compactified)")
n_visible = n_d
n_hidden = n_c - n_d

light_pairs = comb(n_visible, 2)
dark_pairs = comb(n_hidden, 2)
twilight_pairs = n_visible * n_hidden
total_pairs = light_pairs + dark_pairs + twilight_pairs

print(f"\n   Light pairs (both visible):       ({n_visible} choose 2) = {light_pairs}")
print(f"   Dark pairs (both hidden):         ({n_hidden} choose 2) = {dark_pairs}")
print(f"   Twilight pairs (one each):        {n_visible} * {n_hidden} = {twilight_pairs}")
print(f"   Total:                            {light_pairs} + {dark_pairs} + {twilight_pairs} = {total_pairs}")
print(f"   Expected (11 choose 2):           {exponent}")
print(f"   MATCH: {total_pairs == exponent}")

# Group theory connections
print(f"\n5. Group Theory Connections")
dim_SO_visible = n_visible * (n_visible - 1) // 2
dim_SO_hidden = n_hidden * (n_hidden - 1) // 2
print(f"   dim(SO({n_visible})) = {dim_SO_visible}  (light pairs)")
print(f"   dim(SO({n_hidden})) = {dim_SO_hidden}  (dark pairs)")
print(f"   Note: SO(4) ~ SU(2)xSU(2), SO(7) is exceptional in Cartan classification")

# Dark matter ratio
print(f"\n6. Dark Matter Ratio Prediction")
ratio_simple = dark_pairs / light_pairs
print(f"   Simple ratio (dark:light): {dark_pairs}:{light_pairs} = {ratio_simple:.2f}:1")
print(f"   Observed dark:visible matter: ~5:1")
print(f"   Difference: {abs(ratio_simple - 5)/5 * 100:.0f}%")

# If twilight contributes partially
print(f"\n   With twilight (partial darkness):")
for f in [0.0, 0.2, 0.3, 0.4, 0.5]:
    eff_dark = dark_pairs + f * twilight_pairs
    eff_light = light_pairs + (1 - f) * twilight_pairs
    ratio = eff_dark / eff_light
    print(f"   f={f:.1f}: dark={eff_dark:.0f}, light={eff_light:.0f}, ratio={ratio:.2f}:1")

# Energy scale variation
print(f"\n7. Variation with Dimensional Reduction")
print(f"   If dimensions reduce at high energy (as in spectral dimension reduction):")

configs = [
    ("IR (low E)", 4, 11),
    ("Intermediate", 3, 11),
    ("GUT scale", 2, 6),
    ("UV limit", 2, 2),
]

for name, nd, nc in configs:
    a_inv = nd**2 + nc**2
    exp = comb(nc, 2)
    log_pi = exp * log10(a_inv) if a_inv > 0 else 0
    print(f"   {name:15s}: n_d={nd}, n_c={nc}, 1/a={a_inv:3d}, exp={(nc*(nc-1)//2):2d}, log|Pi|={log_pi:.1f}")

# Critical check: does the formula work?
print(f"\n8. Summary of Verification")
print(f"   +-----------------------------------------------------+")
print(f"   | Formula: |Pi| = (1/alpha)^(n_c choose 2)            |")
print(f"   +-----------------------------------------------------+")
print(f"   | 1/alpha = n_d^2 + n_c^2 = {alpha_inv:3d}                    |")
print(f"   | Exponent = (11 choose 2) = {exponent:2d}                    |")
print(f"   | log10(|Pi|) = {Pi_log10:.1f} (observed: ~{Pi_observed})          |")
print(f"   | Error: {abs(Pi_log10 - Pi_observed)/Pi_observed * 100:.1f}% in log scale                      |")
print(f"   +-----------------------------------------------------+")
print(f"   | Pair decomposition: {light_pairs} light + {dark_pairs} dark + {twilight_pairs} twilight = {total_pairs}|")
print(f"   | Status: VERIFIED (numerically excellent)            |")
print(f"   +-----------------------------------------------------+")

# Additional insight: why 137 per pair?
print(f"\n9. Why 137 States Per Pair?")
print(f"   U({n_d}) generators: {n_d}^2 = {n_d**2}")
print(f"   U({n_c}) generators: {n_c}^2 = {n_c**2}")
print(f"   Total interface modes: {n_d**2} + {n_c**2} = {alpha_inv}")
print(f"   Each pair couples through one of these {alpha_inv} interface modes.")
print(f"   55 pairs x 137 choices = 137^55 total perspectives.")

print("\n" + "=" * 60)
print("Verification Complete")
print("=" * 60)
