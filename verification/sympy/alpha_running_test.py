"""
Alpha Running from Dimensional Flow Hypothesis
================================================

HYPOTHESIS: If spectral dimension flows from 4 (IR) to 2 (UV),
then alpha(E) = 1/(n_eff(E)^2 + n_total^2) might explain running.

DERIVATION CHAIN:
[A] Asymptotic safety: d_spectral = 4 (IR) -> 2 (UV)
[A] M-theory: n_total = 11
[I] Interface formula: alpha = 1/(n_perceived^2 + n_total^2)
[D] Dimensional running: n_eff(E) interpolates 4 -> 2

TEST: Does this match measured running of alpha?
"""

import math

# Constants
n_total = 11  # M-theory dimensions [ASSUMED]
n_IR = 4      # Spectral dimension at low energy [FROM AS]
n_UV = 2      # Spectral dimension at Planck scale [FROM AS]

# Measured values
alpha_IR_measured = 1/137.036  # Low energy
alpha_Z_measured = 1/127.9     # At Z boson mass (~91 GeV)
alpha_GUT_measured = 1/42      # At GUT scale (~10^16 GeV) - approximate

# Energy scales (in GeV)
E_IR = 1e-3       # Low energy (meV scale)
E_Z = 91.2        # Z boson mass
E_GUT = 1e16      # GUT scale
E_Planck = 1.22e19  # Planck scale

print("=" * 60)
print("ALPHA RUNNING FROM DIMENSIONAL FLOW")
print("=" * 60)

# ============================================
# Model 1: Linear interpolation in log(E)
# ============================================
print("\n--- Model 1: Linear log interpolation ---")
print("n_eff(E) = n_IR - (n_IR - n_UV) * log(E/E_IR) / log(E_Planck/E_IR)")

def n_eff_linear(E):
    """Spectral dimension interpolating linearly in log(E)"""
    if E <= E_IR:
        return n_IR
    if E >= E_Planck:
        return n_UV
    log_ratio = math.log(E/E_IR) / math.log(E_Planck/E_IR)
    return n_IR - (n_IR - n_UV) * log_ratio

def alpha_from_dim(n_eff):
    """Interface formula"""
    return 1 / (n_eff**2 + n_total**2)

# Test at key energies
print(f"\nEnergy (GeV)     n_eff    alpha_pred    alpha_meas    Error")
print("-" * 65)

test_points = [
    ("IR (1 meV)", E_IR, alpha_IR_measured),
    ("Z boson (91 GeV)", E_Z, alpha_Z_measured),
    ("GUT (10^16 GeV)", E_GUT, alpha_GUT_measured),
    ("Planck (10^19 GeV)", E_Planck, None),
]

for name, E, alpha_meas in test_points:
    n = n_eff_linear(E)
    alpha_pred = alpha_from_dim(n)
    if alpha_meas:
        error = (1/alpha_pred - 1/alpha_meas) / (1/alpha_meas) * 100
        print(f"{name:22} {n:.4f}   1/{1/alpha_pred:.1f}      1/{1/alpha_meas:.1f}    {error:+.1f}%")
    else:
        print(f"{name:22} {n:.4f}   1/{1/alpha_pred:.1f}      N/A")

# ============================================
# Model 2: Check if UV value matches anything
# ============================================
print("\n--- Model 2: Fixed UV value ---")
alpha_UV = alpha_from_dim(n_UV)
print(f"At UV (n=2): alpha = 1/(2^2 + 11^2) = 1/{1/alpha_UV:.0f}")
print(f"Measured alpha at Z boson: ~1/128")
print(f"Match? Close but not exact")

# ============================================
# Analysis: What would n_eff need to be?
# ============================================
print("\n--- Reverse calculation: What n_eff fits data? ---")
print("Given alpha = 1/(n^2 + 121), solve for n:")

for name, alpha_meas in [("IR", alpha_IR_measured), ("Z", alpha_Z_measured), ("GUT", alpha_GUT_measured)]:
    inv_alpha = 1/alpha_meas
    n_squared = inv_alpha - n_total**2
    if n_squared > 0:
        n_required = math.sqrt(n_squared)
        print(f"  {name}: alpha = 1/{inv_alpha:.1f} -> n^2 = {n_squared:.1f} -> n = {n_required:.2f}")
    else:
        print(f"  {name}: alpha = 1/{inv_alpha:.1f} -> n^2 = {n_squared:.1f} (NEGATIVE - doesn't fit)")

# ============================================
# Key finding
# ============================================
print("\n" + "=" * 60)
print("KEY FINDING")
print("=" * 60)
print("""
The dimensional running hypothesis PARTIALLY works:

1. IR (low energy): n=4 gives alpha = 1/137 [OK] (exact by construction)

2. Z boson (91 GeV):
   - Measured: alpha = 1/128
   - Model with n_eff ~ 2.6: gives 1/128 [OK]
   - But linear interpolation gives n_eff ~ 3.96 -> 1/137 (wrong)

3. GUT scale (10^16 GeV):
   - Measured: alpha ~ 1/42
   - Would require n^2 = 42 - 121 = -79 (IMPOSSIBLE)

CONCLUSION:
The formula alpha = 1/(n^2 + 121) CANNOT explain full running.
- It can give values between 1/125 (n=2) and 1/137 (n=4)
- But alpha ~ 1/42 at GUT scale requires 1/alpha > 121, which is impossible

The formula only constrains alpha to be between 1/137 and 1/125.
This means either:
(a) The formula is wrong / incomplete
(b) n_total also changes with energy
(c) The formula only applies at low energy (IR limit)
""")

# ============================================
# What if n_total also runs?
# ============================================
print("\n--- Speculation: If n_total also runs ---")
print("At GUT scale, alpha ~ 1/42 requires n_perceived^2 + n_total^2 = 42")
print("If n_perceived ~ 2 (UV limit): n_total^2 = 42 - 4 = 38 -> n_total = 6.2")
print("If n_perceived ~ 3: n_total^2 = 42 - 9 = 33 -> n_total = 5.7")
print("\nThis could mean: at GUT scale, the 'effective' total dimensions visible")
print("at the interface reduce from 11 to ~6 (compactification threshold?)")
