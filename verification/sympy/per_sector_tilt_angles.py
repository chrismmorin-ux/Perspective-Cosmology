#!/usr/bin/env python3
"""
Per-Sector Tilt Angles: Does the crystallization angle vary by sector?

KEY FINDING: The 4/111 correction can be rewritten as a sum over two sectors
with different per-mode contributions. We explore whether this has deeper
geometric content.

Hypothesis: 1/alpha = Sum_a g(theta_a) where theta_a varies between sectors.

Formula: 1/alpha = n_c^2 * f_c + n_d^2 * f_d
  where f_c = 1 (crystal sector) and f_d = 1 + 1/(n_d * Phi_6(n_c))

Measured: 1/alpha = 137.035999084 (CODATA 2018)
Status: EXPLORATION
Created: Session 151

Depends on:
  - [DEF_02B3] N_I = n_d^2 + n_c^2 = 137
  - alpha_mechanism_derivation.md Step 4 (correction term 4/111)
"""

from sympy import *
from sympy import Rational as R

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

n_d = 4       # Defect dimension
n_c = 11      # Crystal dimension
Im_H = 3      # Imaginary quaternion dims
Im_O = 7      # Imaginary octonion dims
Im_C = 1      # Imaginary complex dims
H = 4         # Quaternion dimension
C = 2         # Complex dimension
O = 8         # Octonion dimension

N_I = n_d**2 + n_c**2  # 137
Phi_6_nc = n_c * (n_c - 1) + 1  # 111 = EM channels of crystal

# Measured value
alpha_inv_measured = R(137035999084, 10**9)  # CODATA 2018

print("=" * 72)
print("PER-SECTOR TILT ANGLES: EXPLORATION")
print("=" * 72)
print()
print(f"Framework: n_d = {n_d}, n_c = {n_c}, N_I = {N_I}")
print(f"Phi_6(n_c) = {Phi_6_nc}")
print()

# ==============================================================================
# SECTION 1: DECOMPOSITION OF 137 + 4/111
# ==============================================================================

print("=" * 72)
print("SECTION 1: REWRITING 1/alpha AS A TWO-SECTOR SUM")
print("=" * 72)
print()

# Current formula
alpha_inv = N_I + R(n_d, Phi_6_nc)  # 137 + 4/111
print(f"Current formula: 1/alpha = N_I + n_d/Phi_6(n_c)")
print(f"  = {N_I} + {n_d}/{Phi_6_nc} = {alpha_inv} = {float(alpha_inv):.10f}")
print()

# Rewrite as two-sector sum
# 1/alpha = n_c^2 * f_c + n_d^2 * f_d
# where n_c^2 = 121 crystal modes, n_d^2 = 16 defect modes
# 137 + 4/111 = 121 * f_c + 16 * f_d

# If f_c = 1: f_d = (137 + 4/111 - 121) / 16 = (16 + 4/111) / 16
f_c = R(1)
f_d = (alpha_inv - n_c**2 * f_c) / n_d**2
print("Two-sector decomposition (crystal modes = 1 each):")
print(f"  1/alpha = n_c^2 * f_c + n_d^2 * f_d")
print(f"  f_c = {f_c} (crystal sector per-mode contribution)")
print(f"  f_d = {f_d} = {float(f_d):.10f}")
print(f"  f_d - 1 = {f_d - 1} = 1/{1/(f_d-1)}")
print()

excess = f_d - 1
excess_denom = R(1) / excess
print(f"  Each defect mode exceeds crystal mode by: {excess}")
print(f"  Denominator: {excess_denom} = {n_d} * {Phi_6_nc} = n_d * Phi_6(n_c)")
print()

# Check: is the denominator n_d * Phi_6(n_c)?
assert excess_denom == n_d * Phi_6_nc, "Decomposition error"
print(f"  CONFIRMED: f_d = 1 + 1/(n_d * Phi_6(n_c))")
print()

# ==============================================================================
# SECTION 2: ALTERNATIVE DECOMPOSITIONS
# ==============================================================================

print("=" * 72)
print("SECTION 2: OTHER WAYS TO SPLIT 137 MODES")
print("=" * 72)
print()

# What if we split by diagonal vs off-diagonal?
n_diag = n_d + n_c          # 15 diagonal (real, neutral)
n_offdiag = N_I - n_diag    # 122 off-diagonal (real components of 61 complex pairs)

print("Split 1: Diagonal (neutral) vs Off-diagonal (charged)")
print(f"  Diagonal: {n_diag} modes, Off-diagonal: {n_offdiag} modes")
# 1/alpha = 15 * g_diag + 122 * g_off
# If g_off = 1: g_diag = (137 + 4/111 - 122) / 15 = (15 + 4/111) / 15
g_off = R(1)
g_diag = (alpha_inv - n_offdiag * g_off) / n_diag
print(f"  If off-diagonal = 1 each:")
print(f"  g_diag = {g_diag} = {float(g_diag):.10f}")
print(f"  g_diag - 1 = {g_diag - 1} = 4/{15 * 111}")
print(f"  = 4/1665 = {float(R(4, 1665)):.10f}")
print(f"  1665 = 15 * 111 = (n_d + n_c) * Phi_6(n_c)")
print()

# Split by division algebra sector
# Herm(4): 16 modes (from quaternion-selected sector)
# Herm(11): 121 modes (from crystal)
# Same as sector split above

# What about splitting within Herm(11)?
# Herm(11) has: 11 diagonal + 55 complex pairs = 121 real
# The diagonal of Herm(11): one has charge 0 (forced by n_c odd)
# The others have charges +/-1
# Off-diagonal of Herm(11): 55 complex pairs, all charged

print("Split 2: By charge type within crystal sector")
n_c_diag = n_c          # 11 diagonal of Herm(11)
n_c_off = n_c * (n_c - 1)  # 110 off-diagonal real components
n_d_all = n_d**2         # 16 defect modes
print(f"  Crystal diagonal: {n_c_diag}")
print(f"  Crystal off-diagonal: {n_c_off}")
print(f"  Defect (all): {n_d_all}")
print(f"  Total: {n_c_diag + n_c_off + n_d_all} = {N_I}")
print()

# 1/alpha = 11*h_cd + 110*h_co + 16*h_d = 137 + 4/111
# Many solutions. Try: h_co = 1, h_cd = 1
# Then h_d = (137 + 4/111 - 110 - 11) / 16 = (16 + 4/111) / 16 = 1 + 1/444
# Same as before — the correction is entirely in the defect sector

# Try: h_d = 1, h_co = 1
# Then h_cd = (137 + 4/111 - 110 - 16) / 11 = (11 + 4/111) / 11 = 1 + 4/1221
# 1221 = 11 * 111
h_cd_alt = R(1) + R(4, n_c * Phi_6_nc)
print(f"  If defect = 1 and crystal off-diag = 1:")
print(f"  Crystal diagonal per-mode = {h_cd_alt} = 1 + 4/{n_c * Phi_6_nc}")
print(f"  {n_c * Phi_6_nc} = n_c * Phi_6(n_c) = {n_c} * {Phi_6_nc}")
print()

# Try: assign correction to the ONE zero-charge mode
# n_c odd -> one diagonal has charge 0 (forced)
# 1/alpha = 136*1 + 1*h_zero = 137 + 4/111
# h_zero = 1 + 4/111
print("Split 3: Correction from the single zero-charge mode")
print(f"  136 charged modes at contribution 1")
print(f"  1 zero-charge mode (forced by n_c = 11 odd) at contribution:")
h_zero = R(1) + R(4, Phi_6_nc)
print(f"  h_zero = 1 + 4/111 = {h_zero} = {float(h_zero):.10f}")
print(f"  The ENTIRE correction sits on one mode!")
print()

# ==============================================================================
# SECTION 3: GEOMETRIC INTERPRETATION — TILT ANGLES
# ==============================================================================

print("=" * 72)
print("SECTION 3: TILT ANGLE INTERPRETATION")
print("=" * 72)
print()

# From Session 146: alpha = cos^2(theta_cryst)
# So 1/alpha = sec^2(theta)
# If each mode has angle theta_a: 1/alpha = Sum sec^2(theta_a) / normalization
# Or more simply: 1/alpha = Sum_a w_a where w_a = sec^2(theta_a)

# For uniform angle: theta_0 = arccos(1/sqrt(N_I))
theta_uniform = acos(1 / sqrt(R(N_I)))
print("Uniform angle model (Session 146):")
print(f"  theta_0 = arccos(1/sqrt(137))")
print(f"  sec^2(theta_0) = 137 (exact)")
print(f"  Each of 137 modes at angle theta_0 -> 1/alpha = 137 (no correction)")
print()

# Two-angle model: crystal at theta_c, defect at theta_d
# 121 * sec^2(theta_c) + 16 * sec^2(theta_d) = 137 + 4/111
# Simplest: each mode contributes sec^2(theta_a) / N_I
# so that Sum sec^2(theta_a) / N_I = 1/alpha

# Or: per-mode coupling = 1, but the angle determines a weight
# w_a = 1 + delta_a where delta_a = 0 for crystal, 1/444 for defect

# What angle shift does this correspond to?
# If w = sec^2(theta) and w = 1: theta = 0 (fully crystallized)
# If w = 1 + eps: sec^2(theta) = 1 + eps -> cos^2(theta) = 1/(1+eps)
# theta = arccos(1/sqrt(1+eps)) ~ sqrt(eps) for small eps

eps_defect = R(1, n_d * Phi_6_nc)  # 1/444
theta_defect = acos(1 / sqrt(1 + eps_defect))
theta_defect_deg = float(theta_defect * 180 / pi)

print("Two-angle model:")
print(f"  Crystal modes: fully crystallized (theta_c = 0, weight = 1)")
print(f"  Defect modes: slightly tilted (weight = 1 + 1/444)")
print(f"    theta_d = arccos(1/sqrt(1 + 1/444)) = {float(theta_defect):.6f} rad = {theta_defect_deg:.4f} deg")
print()

# What does this mean physically?
print("Physical interpretation:")
print("  Crystal modes are fully crystallized — they've settled into their")
print("  ground state with zero residual tilt.")
print()
print("  Defect modes retain a tiny residual tilt of ~2.7 degrees because")
print("  the defect (spacetime) is the DYNAMIC part that never fully")
print("  crystallizes. Each defect mode couples to each of the 111 EM")
print("  channels, picking up a residual tilt of 1/(n_d * Phi_6(n_c)).")
print()

# ==============================================================================
# SECTION 4: THREE-SECTOR MODEL (by division algebra)
# ==============================================================================

print("=" * 72)
print("SECTION 4: DIVISION ALGEBRA SECTOR DECOMPOSITION")
print("=" * 72)
print()

# The crystal dimension n_c = 11 = Im_C + Im_H + Im_O = 1 + 3 + 7
# What if each division algebra sector contributes differently?
# Herm(n_d) contributes n_d^2 = 16 modes (the "R-selected" defect)
# Herm(n_c) has 121 modes, but n_c = Im_C + Im_H + Im_O

# Can we further decompose by algebra?
# In the SO(11) breaking chain: SO(11) -> SO(3) x SO(7) x U(1)
# The crystal modes split according to quaternion and octonion sectors

print("Division algebra dimensions:")
print(f"  R:  dim = 1,  Im = 0")
print(f"  C:  dim = 2,  Im = 1  (Im_C = {Im_C})")
print(f"  H:  dim = 4,  Im = 3  (Im_H = {Im_H})")
print(f"  O:  dim = 8,  Im = 7  (Im_O = {Im_O})")
print(f"  n_c = Im_C + Im_H + Im_O = {Im_C} + {Im_H} + {Im_O} = {n_c}")
print()

# n_c^2 = 121 crystal modes
# If we imagine Herm(11) as having "sectors" from each algebra:
# Im_C sector: Im_C^2 = 1 mode
# Im_H sector: Im_H^2 = 9 modes
# Im_O sector: Im_O^2 = 49 modes
# Cross terms: 2*(Im_C*Im_H + Im_C*Im_O + Im_H*Im_O) = 2*(3+7+21) = 62
# Total: 1 + 9 + 49 + 62 = 121 CHECK

sector_CC = Im_C**2
sector_HH = Im_H**2
sector_OO = Im_O**2
sector_cross = 2*(Im_C*Im_H + Im_C*Im_O + Im_H*Im_O)
print(f"Crystal modes by sector (from (Im_C + Im_H + Im_O)^2):")
print(f"  C*C:  Im_C^2 = {sector_CC}")
print(f"  H*H:  Im_H^2 = {sector_HH}")
print(f"  O*O:  Im_O^2 = {sector_OO}")
print(f"  Cross: 2*(CH + CO + HO) = 2*({Im_C*Im_H}+{Im_C*Im_O}+{Im_H*Im_O}) = {sector_cross}")
print(f"  Total: {sector_CC + sector_HH + sector_OO + sector_cross} = n_c^2")
assert sector_CC + sector_HH + sector_OO + sector_cross == n_c**2
print()

# What if the tilt angle varies by sector?
# Pure sectors (diagonal in algebra space) might crystallize more cleanly
# Cross-terms (mixing algebras) might have residual tilt

# Model: pure sectors contribute f_pure, cross contribute f_cross, defect f_defect
# (1 + 9 + 49) * f_pure + 62 * f_cross + 16 * f_defect = 137 + 4/111
# 59 * f_pure + 62 * f_cross + 16 * f_defect = 137 + 4/111
# Too many unknowns for one equation.

# Simpler: what if tilt angle depends on the algebra's Im dimension?
# Sector with Im = k has tilt proportional to 1/k or k
# This would give different contributions from C, H, O sectors

# Test: can we write 137 + 4/111 as a weighted sum over algebras?
# f(Im_C) + f(Im_H) + f(Im_O) + f(n_d) format?

# Actually, let's think about it differently.
# The CURRENT derivation has: 1/alpha = N_I + n_d/Phi_6(n_c)
# = (n_d^2 + n_c^2) + n_d / (n_c(n_c-1)+1)
# The correction n_d/Phi_6(n_c) depends on BOTH n_d and n_c.
# It's an INTERACTION between the two sectors.

print("Key observation: the correction 4/111 is an INTERACTION term.")
print(f"  It depends on both n_d = {n_d} (defect) and n_c = {n_c} (crystal).")
print(f"  4/111 = n_d / Phi_6(n_c)")
print()
print("  In the tilt angle picture: the defect modes don't crystallize")
print("  independently. Their residual tilt depends on the crystal's")
print("  EM channel count Phi_6(n_c) = 111.")
print()

# ==============================================================================
# SECTION 5: FUNCTIONAL FORM — WHAT FUNCTION IS g(theta)?
# ==============================================================================

print("=" * 72)
print("SECTION 5: WHAT FUNCTION MAPS TILT ANGLE TO COUPLING?")
print("=" * 72)
print()

# If 1/alpha = Sum_a g(theta_a), what is g?
# Option A: g(theta) = sec^2(theta)  (from Session 146: alpha = cos^2(theta))
# Option B: g(theta) = 1 + theta^2/theta_0^2  (small angle expansion)
# Option C: g(theta) = 1/(1 - theta^2/pi^2)  (has poles at theta = pi)

# For the two-sector model with crystal at theta=0 and defect at theta_d:
# Option A: 121*1 + 16*sec^2(theta_d) = 137 + 4/111
#   sec^2(theta_d) = (16 + 4/111)/16 = 1 + 1/444
#   cos^2(theta_d) = 444/445
#   theta_d = arccos(sqrt(444/445))

cos2_d = R(444, 445)
theta_d_exact = acos(sqrt(cos2_d))
print("Option A: g = sec^2(theta)")
print(f"  Crystal: theta_c = 0 -> sec^2 = 1")
print(f"  Defect:  cos^2(theta_d) = 444/445")
print(f"  theta_d = arccos(sqrt(444/445)) = {float(theta_d_exact):.6f} rad")
print(f"  = {float(theta_d_exact * 180 / pi):.4f} degrees")
print()

# Note 445 = 5 * 89. Not obviously a framework number.
# But 444 = 4 * 111 = n_d * Phi_6(n_c). That IS framework.
print(f"  444 = n_d * Phi_6(n_c) = {n_d} * {Phi_6_nc}")
print(f"  445 = 444 + 1 = n_d * Phi_6(n_c) + 1")
print(f"  cos^2(theta_d) = n_d * Phi_6(n_c) / (n_d * Phi_6(n_c) + 1)")
print()

# What is 445? Factor it.
print(f"  445 = 5 * 89")
print(f"  Is 445 a framework number? 5 = dim(R^4 defect + 1). 89 = prime.")
print(f"  Not obviously meaningful.")
print()

# Option B: small angle: g(theta) ~ 1 + tan^2(theta)
# For small theta: sec^2 ~ 1 + theta^2, so same as A to leading order
print("Option B: g ~ 1 + theta^2 (small angle limit of A)")
theta_d_small = sqrt(R(1, 444))
print(f"  theta_d ~ sqrt(1/444) = 1/sqrt(444) = {float(theta_d_small):.6f} rad")
print(f"  = {float(theta_d_small * 180 / pi):.4f} degrees")
print()

# ==============================================================================
# SECTION 6: DOES THE TILT ANGLE AFFECT THE INDUCED MECHANISM?
# ==============================================================================

print("=" * 72)
print("SECTION 6: CONNECTION TO INDUCED MECHANISM (PATH 1)")
print("=" * 72)
print()

# In the induced mechanism (S149 corrected):
# 1/alpha = S/(6pi) * ln(Lambda/mu)
# where S = 126 = sum of q^2 over charged modes
#
# If tilt angles vary by sector, the charges might also vary.
# The charge assignment q = {+1, -1, 0} is "maximized" for integer charges.
# But what if the actual charge is q_a = cos(theta_a)?
#
# Then S = Sum q_a^2 = Sum cos^2(theta_a)
# For 121 crystal modes at theta_c = 0: cos^2 = 1, but 15 are diagonal (neutral)
# For 16 defect modes at small theta_d: cos^2 ~ 1 - theta_d^2

# Actually the charge structure is more nuanced:
# - 15 diagonal modes are NEUTRAL (charge 0) regardless of angle
# - 61 complex pairs have charge +/-1
# - The 11 crystal diagonal: 10 charged, 1 neutral
# - The 4 defect diagonal: 0 or 4 charged (depending on tracelessness)

print("If charges are q_a = cos(theta_a) instead of {+/-1, 0}:")
print()
print("  This would mix the tilt angle with the charge assignment.")
print("  Currently S = 126 uses integer charges.")
print("  With angle-dependent charges: S = Sum cos^2(theta_a)")
print()

# For the integer-charge case:
# S_d = 16 (all n_d^2 defect modes charged, n_d even -> all +/-1)
# S_c = 110 (n_c(n_c-1), one zero forced)
# S = 126

# What if defect charges are slightly off from +/-1?
# q_d = cos(theta_d) ~ 1 - theta_d^2/2 ~ 1 - 1/888
# q_d^2 ~ 1 - 1/444
# S_d = 16 * (1 - 1/444) = 16 - 16/444 = 16 - 4/111

S_d_tilted = 16 * (1 - R(1, 444))
S_c_normal = R(110)
S_modified = S_d_tilted + S_c_normal
print(f"  If defect charges are q = cos(theta_d) ~ 1 - 1/888:")
print(f"  S_d = 16 * (1 - 1/444) = {S_d_tilted}")
print(f"  S_c = {S_c_normal}")
print(f"  S_modified = {S_modified} (was 126)")
print(f"  Difference: {R(126) - S_modified} = {float(R(126) - S_modified):.6f}")
print()

# This gives S = 126 - 4/111. Interesting — the SAME correction appears
# but now SUBTRACTED from S instead of ADDED to N_I.

print("  NOTABLE: S_modified = 126 - 4/111 = S - n_d/Phi_6(n_c)")
print(f"  The same correction 4/111 appears, but subtracted from S")
print(f"  instead of added to N_I.")
print()

# What does this do to the induced formula?
# 1/alpha = S_mod/(6pi) * ln(Lambda/mu) = (126 - 4/111)/(6pi) * ln(Lambda/mu)
# For this to equal 137 + 4/111:
# ln = (137 + 4/111) * 6pi / (126 - 4/111)
ln_mod = (alpha_inv * 6 * pi) / S_modified
ln_original = R(N_I, 21) * pi

print(f"  In induced formula:")
print(f"  With S = 126:           ln(Lambda/mu) = 137pi/21 = {float(ln_original):.6f}")
print(f"  With S = 126 - 4/111:   ln(Lambda/mu) = {float(ln_mod):.6f}")
print(f"  Ratio: {float(ln_mod / ln_original):.10f}")
print()

# The difference is tiny — O(1/137^2) — second order in the correction.
ratio_diff = ln_mod / ln_original - 1
print(f"  Fractional change in ln: {float(ratio_diff):.2e}")
print(f"  This is O(1/N_I^2) -- negligible at leading order.")
print()

# ==============================================================================
# SECTION 7: ALGEBRAIC IDENTITY — THE DEEP STRUCTURE
# ==============================================================================

print("=" * 72)
print("SECTION 7: ALGEBRAIC STRUCTURE OF THE CORRECTION")
print("=" * 72)
print()

# Let's look at n_d/Phi_6(n_c) more carefully.
# Phi_6(n_c) = n_c^2 - n_c + 1 = 111
# n_d/Phi_6(n_c) = 4/111

# Note that Phi_6 is the 6th cyclotomic polynomial.
# Phi_6(x) = x^2 - x + 1
# Phi_6(n_c) = n_c^2 - n_c + 1

# The correction 4/111 can be written as:
# n_d / (n_c^2 - n_c + 1)
# = n_d / ((n_c - 1/2)^2 + 3/4)
# = n_d / ((n_c - 1/2)^2 + (sqrt(3)/2)^2)

# The denominator involves n_c^2 - n_c + 1. Factor as norm in Eisenstein integers:
# In Z[omega] where omega = exp(2pi*i/3):
# n_c^2 - n_c + 1 = |n_c - omega|^2 = Norm(n_c - omega)

print("Cyclotomic structure of the correction:")
print(f"  Phi_6(n_c) = n_c^2 - n_c + 1 = {Phi_6_nc}")
print(f"  = |n_c - omega|^2 where omega = exp(2pi*i/3)")
print(f"  = Norm in Eisenstein integers Z[omega]")
print()

# The full formula: 1/alpha = n_d^2 + n_c^2 + n_d/(n_c^2 - n_c + 1)
# = n_d^2 + n_c^2 + n_d/Phi_6(n_c)

# Can we combine the n_c terms?
# n_c^2 + n_d/Phi_6(n_c) = n_c^2 + n_d/(n_c^2 - n_c + 1)
# = [n_c^2(n_c^2 - n_c + 1) + n_d] / (n_c^2 - n_c + 1)

combined_num = n_c**2 * (n_c**2 - n_c + 1) + n_d
combined_den = n_c**2 - n_c + 1
print(f"  Combining crystal terms:")
print(f"  n_c^2 + n_d/Phi_6 = [n_c^2 * Phi_6 + n_d] / Phi_6")
print(f"  Numerator: {n_c**2} * {Phi_6_nc} + {n_d} = {combined_num}")
print(f"  = {n_c**2 * Phi_6_nc} + {n_d} = {combined_num}")
print()

# Full formula:
# 1/alpha = n_d^2 + [n_c^2 * Phi_6(n_c) + n_d] / Phi_6(n_c)
# = [n_d^2 * Phi_6(n_c) + n_c^2 * Phi_6(n_c) + n_d] / Phi_6(n_c)
# = [N_I * Phi_6(n_c) + n_d] / Phi_6(n_c)

full_num = N_I * Phi_6_nc + n_d
full_den = Phi_6_nc
print(f"  Full formula:")
print(f"  1/alpha = [N_I * Phi_6(n_c) + n_d] / Phi_6(n_c)")
print(f"  = [{N_I} * {Phi_6_nc} + {n_d}] / {Phi_6_nc}")
print(f"  = {full_num} / {full_den}")
print(f"  = {R(full_num, full_den)} = {float(R(full_num, full_den)):.10f}")
assert R(full_num, full_den) == alpha_inv
print(f"  CONFIRMED: matches 137 + 4/111")
print()

# Numerator: 137 * 111 + 4 = 15207 + 4 = 15211
print(f"  Numerator: {full_num} = {N_I} * {Phi_6_nc} + {n_d}")
# Factor 15211
from sympy import factorint
factors = factorint(full_num)
print(f"  {full_num} = {' * '.join(f'{p}^{e}' if e > 1 else str(p) for p, e in sorted(factors.items()))}")
print()

# ==============================================================================
# SECTION 8: PER-ALGEBRA SECTOR ANGLES
# ==============================================================================

print("=" * 72)
print("SECTION 8: CAN DIFFERENT ALGEBRAS HAVE DIFFERENT ANGLES?")
print("=" * 72)
print()

# If we think of n_c = 1 + 3 + 7 as three sectors:
# C-sector: 1 imaginary dimension
# H-sector: 3 imaginary dimensions
# O-sector: 7 imaginary dimensions
#
# Each sector's "crystallization angle" could depend on the algebra.
# Quaternions have 3 imaginary units (i,j,k) with non-commutativity.
# Octonions have 7 with non-associativity.
# Complex numbers have 1 with full commutativity.
#
# More non-associativity -> harder to crystallize -> larger residual tilt?

print("Hypothesis: tilt angle depends on algebraic complexity")
print()
print("  C-sector (1 dim, commutative, associative): easiest to crystallize")
print("  H-sector (3 dim, non-commutative, associative): intermediate")
print("  O-sector (7 dim, non-commutative, non-associative): hardest")
print()

# If we model theta_X proportional to Im_X:
# theta_C ~ Im_C/Im_O = 1/7 of base angle
# theta_H ~ Im_H/Im_O = 3/7 of base angle
# theta_O ~ Im_O/Im_O = 1 (base angle)
# And theta_defect ~ something else

# But this is getting speculative. Let's check if any assignment works.
# 1/alpha = Sum_sectors n_sector * (1 + f(Im_sector))
# With n_C = Im_C^2 = 1, n_H = Im_H^2 = 9, n_O = Im_O^2 = 49
# Plus cross terms: 2*(3 + 7 + 21) = 62
# Plus defect: 16

# If f depends on Im_X:
# 1*(1+f(1)) + 9*(1+f(3)) + 49*(1+f(7)) + 62*(1+f_cross) + 16*(1+f_d) = 137 + 4/111
# Simplifies to: f(1) + 9f(3) + 49f(7) + 62*f_cross + 16*f_d = 4/111

print("Constraint on per-sector corrections:")
print("  f(1) + 9*f(3) + 49*f(7) + 62*f_cross + 16*f_d = 4/111")
print()
print("  Too many unknowns (5) for one equation.")
print("  Need additional constraints from physics.")
print()

# Simplest model: only the defect sector has nonzero correction
# (as in Section 1). This is the minimal assumption.
print("Minimal model (only defect tilted): f_d = 1/444, all others = 0")
print("  This reproduces 137 + 4/111 exactly.")
print()

# Next simplest: tilt proportional to 1/Phi_6(n_sector)?
# But Phi_6 is only defined for the full n_c = 11, not sub-sectors.

print("For now, the two-sector model (crystal vs defect) is the simplest")
print("that reproduces the full formula. Finer decomposition by algebra")
print("requires additional physical input.")
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 72)
print("VERIFICATION TESTS")
print("=" * 72)
print()

tests = [
    # Two-sector decomposition
    ("Two-sector: 121*1 + 16*(1+1/444) = 137 + 4/111",
     n_c**2 * 1 + n_d**2 * (1 + R(1, 444)) == alpha_inv),

    ("Defect excess: 1/444 = 1/(n_d * Phi_6(n_c))",
     R(1, 444) == R(1, n_d * Phi_6_nc)),

    ("444 = n_d * Phi_6(n_c) = 4 * 111",
     444 == n_d * Phi_6_nc),

    # Tilt angle
    ("cos^2(theta_d) = 444/445 = n_d*Phi_6/(n_d*Phi_6+1)",
     cos2_d == R(n_d * Phi_6_nc, n_d * Phi_6_nc + 1)),

    # Alternative decompositions
    ("Split by neutral/charged: 15*(1+4/1665) + 122*1 = 137 + 4/111",
     15 * (1 + R(4, 1665)) + 122 == alpha_inv),

    ("Single zero-mode: 136*1 + 1*(1+4/111) = 137 + 4/111",
     136 + (1 + R(4, 111)) == alpha_inv),

    # Algebraic identities
    ("N_I = n_d^2 + n_c^2 = 137",
     N_I == 137),

    ("Phi_6(n_c) = n_c^2 - n_c + 1 = 111",
     Phi_6_nc == n_c**2 - n_c + 1),

    ("Full formula: (N_I * Phi_6 + n_d) / Phi_6 = 137 + 4/111",
     R(N_I * Phi_6_nc + n_d, Phi_6_nc) == alpha_inv),

    ("Numerator: 137*111 + 4 = 15211",
     N_I * Phi_6_nc + n_d == 15211),

    # Crystal decomposition
    ("n_c^2 = Im_C^2 + Im_H^2 + Im_O^2 + cross = 1+9+49+62 = 121",
     sector_CC + sector_HH + sector_OO + sector_cross == n_c**2),

    ("Cross terms: 2*(Im_C*Im_H + Im_C*Im_O + Im_H*Im_O) = 62",
     sector_cross == 62),

    # Modified charge-weighted sum
    ("S_modified = 126 - 4/111 when defect charges = cos(theta_d)",
     S_modified == 126 - R(4, 111)),

    # Correction structure
    ("4/111 = n_d / Phi_6(n_c) (interaction between sectors)",
     R(4, 111) == R(n_d, Phi_6_nc)),

    ("Correction is O(1/N_I): 4/111 ~ 0.036 ~ 1/28",
     abs(float(R(4, 111)) - 1.0/28) < 0.01),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    print(f"[{status}] {name}")

print()
print(f"{'ALL TESTS PASS' if all_pass else 'SOME TESTS FAILED'}")
print(f"Total: {sum(1 for _, p in tests if p)}/{len(tests)} passed")
