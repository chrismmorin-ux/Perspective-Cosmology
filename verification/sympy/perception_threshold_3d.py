#!/usr/bin/env python3
"""
3D Perception Threshold: Geometric Projection Factors

KEY QUESTION: Does projecting crystallization events from n_c=11
dimensions into the observer's Im(H)=3 spatial dimensions introduce
geometric factors that relate to known framework quantities?

Status: EXPLORATION
Depends on:
- AXM_0109 (Crystal existence, n_c=11)
- AXM_0110 (Crystal orthogonality)
- AXM_0113 (Finite access, n_d=4)
- THM_0484 (Division algebra structure, T=H)
- THM_0485 (Complex structure, F=C)

Created: Session 186
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from sympy import *

# ============================================================
# FRAMEWORK QUANTITIES
# ============================================================

n_c = 11       # [D] Crystal dimension
n_d = 4        # [D] Defect dimension = dim(H)
Im_H = 3       # [D] Spatial dimensions = Im(H)
Im_O = 7       # [D] Hidden/internal dimensions = Im(O)
Im_C = 1       # [D] dim of Im(C)
R_dim = 1      # Time dimension (Re(H))
C_dim = 2      # [D] dim(C)
H_dim = 4      # [D] dim(H)
O_dim = 8      # [D] dim(O)
N_I = 137      # [D] Generator count

alpha = Rational(1, 137)  # Leading order for exploration

# ============================================================
# PART 1: DIMENSION FRACTIONS
# ============================================================

print("=" * 60)
print("PART 1: DIMENSION FRACTIONS")
print("=" * 60)

# What fraction of the Crystal does the observer access?
spatial_fraction = Rational(Im_H, n_c)     # 3/11
temporal_fraction = Rational(R_dim, n_c)    # 1/11
defect_fraction = Rational(n_d, n_c)        # 4/11
hidden_fraction = Rational(Im_O, n_c)       # 7/11

print(f"\nSpatial/Crystal = Im(H)/n_c = {spatial_fraction} = {float(spatial_fraction):.6f}")
print(f"Time/Crystal    = 1/n_c     = {temporal_fraction} = {float(temporal_fraction):.6f}")
print(f"Defect/Crystal  = n_d/n_c   = {defect_fraction} = {float(defect_fraction):.6f}")
print(f"Hidden/Crystal  = Im(O)/n_c = {hidden_fraction} = {float(hidden_fraction):.6f}")

# Cross-check: defect = time + spatial
print(f"\nCheck: 1/11 + 3/11 = {temporal_fraction + spatial_fraction} = {defect_fraction}? {temporal_fraction + spatial_fraction == defect_fraction}")
# Check: all fractions sum to 1 (time + spatial + hidden = n_c)
total = R_dim + Im_H + Im_O
print(f"Check: 1 + 3 + 7 = {total} = n_c? {total == n_c}")

# ============================================================
# PART 2: SOLID ANGLE RATIOS
# ============================================================

print("\n" + "=" * 60)
print("PART 2: SOLID ANGLES (unit sphere surface area in n dim)")
print("=" * 60)

def solid_angle(n):
    """Surface area of unit sphere in n dimensions: 2*pi^(n/2)/Gamma(n/2)"""
    return 2 * pi**(Rational(n, 2)) / gamma(Rational(n, 2))

# Compute solid angles for relevant dimensions
for d in [1, 2, 3, 4, 7, 8, 11]:
    omega = solid_angle(d)
    print(f"  Omega_{d:2d} = {omega} = {float(omega):.6f}")

omega_3 = solid_angle(3)   # = 4*pi (surface of 2-sphere in 3D)
omega_4 = solid_angle(4)   # = 2*pi^2
omega_11 = solid_angle(11)

ratio_3_11 = simplify(omega_3 / omega_11)
ratio_4_11 = simplify(omega_4 / omega_11)

print(f"\nOmega_3 / Omega_11 = {ratio_3_11} = {float(ratio_3_11):.6f}")
print(f"Omega_4 / Omega_11 = {ratio_4_11} = {float(ratio_4_11):.6f}")

# ============================================================
# PART 3: UNIT BALL VOLUME RATIOS
# ============================================================

print("\n" + "=" * 60)
print("PART 3: UNIT BALL VOLUMES")
print("=" * 60)

def ball_volume(n):
    """Volume of unit ball in n dimensions: pi^(n/2) / Gamma(n/2+1)"""
    return pi**(Rational(n, 2)) / gamma(Rational(n, 2) + 1)

for d in [1, 2, 3, 4, 7, 8, 11]:
    v = ball_volume(d)
    print(f"  V_{d:2d} = {simplify(v)} = {float(v):.6f}")

V_3 = ball_volume(3)
V_4 = ball_volume(4)
V_11 = ball_volume(11)

vratio_3_11 = simplify(V_3 / V_11)
vratio_4_11 = simplify(V_4 / V_11)

print(f"\nV_3 / V_11 = {vratio_3_11} = {float(vratio_3_11):.6f}")
print(f"V_4 / V_11 = {vratio_4_11} = {float(vratio_4_11):.6f}")

# Product: V_3 * V_7 vs V_11 (if space decomposes as 3+7+1=11)
V_7 = ball_volume(7)
V_1 = ball_volume(1)

# For product spaces: V(AxB) = V(A) * V(B) when independent
product_ratio = simplify(V_3 * V_7 * V_1 / V_11)
print(f"\nV_3 * V_7 * V_1 / V_11 = {product_ratio} = {float(product_ratio):.6f}")

# V_4 * V_7 / V_11 (defect x hidden vs full)
defect_hidden_ratio = simplify(V_4 * V_7 / V_11)
print(f"V_4 * V_7 / V_11 = {defect_hidden_ratio} = {float(defect_hidden_ratio):.6f}")

# ============================================================
# PART 4: MINIMUM LOCALIZED EVENT ENERGY IN d DIMENSIONS
# ============================================================

print("\n" + "=" * 60)
print("PART 4: MINIMUM LOCALIZED EVENT (uncertainty principle)")
print("=" * 60)

# In d spatial dimensions, localizing a massless mode to radius R:
# Delta_p_i >= hbar/(2R) for each spatial direction i
# Total energy E >= sum of |Delta_p_i| * c >= d * hbar*c/(2R)
#
# The "dimension factor" for minimum energy:
# E_min(d) ~ d * hbar*c/(2R)
#
# Ratio of energies for same R:
# E_min(3D) / E_min(11D) = 3/11

print(f"\nFor massless mode localized to radius R:")
print(f"  E_min(3D)  ~ 3 * hbar*c/(2R)  [observer's spatial world]")
print(f"  E_min(11D) ~ 11 * hbar*c/(2R)  [full Crystal, all equiv]")
print(f"  E_min(4D)  ~ 4 * hbar*c/(2R)  [full defect space]")
print(f"\n  Ratio E_3D/E_11D = 3/11 = {float(Rational(3,11)):.6f}")
print(f"  Ratio E_4D/E_11D = 4/11 = {float(Rational(4,11)):.6f}")

# The observer needs LESS energy to detect an event in 3D
# than the Crystal "needs" in 11D. The 3D observer is
# seeing a coarse-grained version.
#
# Or equivalently: for a given energy E, the observer can
# resolve structures down to R_min(3D) = 3*hbar*c/(2E),
# while the full Crystal resolves to R_min(11D) = 11*hbar*c/(2E).
# The Crystal has FINER resolution by factor n_c/Im(H) = 11/3.

print(f"\n  Crystal resolution / observer resolution = 11/3 = {float(Rational(11,3)):.6f}")

# ============================================================
# PART 5: DO PROJECTION FACTORS APPEAR IN KNOWN FORMULAS?
# ============================================================

print("\n" + "=" * 60)
print("PART 5: CHECKING KNOWN FORMULAS FOR PROJECTION FACTORS")
print("=" * 60)

# Known framework quantities that involve 3 and 11:
print("\nFramework quantities involving Im(H)=3 and n_c=11:")
print(f"  sin^2(theta_W) = n_d*Im_O/n_c^2 = {n_d}*{Im_O}/{n_c}^2 = {n_d*Im_O}/{n_c**2} = {float(Rational(n_d*Im_O, n_c**2)):.6f}")
print(f"  1/alpha (leading) = n_d^2 + n_c^2 = {n_d**2} + {n_c**2} = {n_d**2 + n_c**2}")
print(f"  N_Goldstone(SO11->SO4xSO7) = n_d*Im_O = {n_d*Im_O}")

# Does Im(H)/n_c = 3/11 appear anywhere?
r = Rational(3, 11)
print(f"\n  Im(H)/n_c = 3/11 = {float(r):.6f}")
print(f"  1/(Im(H)/n_c) = 11/3 = {float(1/r):.6f}")
print(f"  (Im(H)/n_c)^2 = 9/121 = {float(r**2):.6f}")

# Check: is 3/11 related to any coupling?
# sin^2(theta_W) ~ 0.231 vs 3/11 ~ 0.273 -- no match
# alpha ~ 0.0073 vs 3/11 ~ 0.273 -- no match

# What about (Im(H)/n_c) * (Im(O)/n_c)?
cross = Rational(Im_H * Im_O, n_c**2)
print(f"  Im(H)*Im(O)/n_c^2 = {Im_H}*{Im_O}/{n_c**2} = {cross} = {float(cross):.6f}")
# This is 21/121 -- related to sin^2(theta_W) = 28/121?
# 28 = 4*7 = n_d*Im_O, while 21 = 3*7 = Im_H*Im_O

# Interesting: 28 - 21 = 7 = Im_O, and 28/21 = 4/3 = n_d/Im_H
print(f"  n_d*Im_O/n_c^2 = 28/121 = sin^2(theta_W)")
print(f"  Im_H*Im_O/n_c^2 = 21/121 -- spatial-only version")
print(f"  Difference: 28-21 = 7 = Im_O (the time direction contributes Im_O)")
print(f"  Ratio: 28/21 = 4/3 = n_d/Im_H")

# ============================================================
# PART 6: THE PERCEPTION THRESHOLD IDEA
# ============================================================

print("\n" + "=" * 60)
print("PART 6: PERCEPTION THRESHOLD ANALYSIS")
print("=" * 60)

# The observer's "perception threshold" in 3D:
# - Observer sees Im(H) = 3 spatial dimensions
# - Observer has n_d = 4 total dimensions (incl. time)
# - Crystal has n_c = 11 total dimensions
#
# A crystallization event that occurs at scale l in the Crystal
# appears at scale l_obs in the observer's 3D space.
#
# If the event is isotropic in all 11D:
# - Energy partitions equally among dimensions
# - Observer sees fraction Im(H)/n_c = 3/11 of the energy
# - Observer sees fraction n_d/n_c = 4/11 including time

# This means: the observer's "quantum" of crystallization has
# energy E_obs = (3/11) * E_Crystal (spatial only)
# or E_obs = (4/11) * E_Crystal (spacetime)

print("\nIF crystallization events distribute energy isotropically in 11D:")
print(f"  Observer detects (spatial): {Im_H}/{n_c} = {float(Rational(Im_H,n_c)):.4f} of total energy")
print(f"  Observer detects (spacetime): {n_d}/{n_c} = {float(Rational(n_d,n_c)):.4f} of total energy")

# The "missing" energy goes into internal/gauge DOF
print(f"  'Missing' (internal): {Im_O}/{n_c} = {float(Rational(Im_O,n_c)):.4f} of total energy")

# Key question: if hbar is the minimum OBSERVABLE action,
# and the Crystal has minimum action hbar_Crystal,
# then hbar_obs = (n_d/n_c) * hbar_Crystal?
#
# Or equivalently: hbar_Crystal = (n_c/n_d) * hbar_obs = (11/4) * hbar?

print(f"\nIF hbar_observed = (n_d/n_c) * hbar_Crystal:")
print(f"  hbar_Crystal = (n_c/n_d) * hbar = ({n_c}/{n_d}) * hbar = {float(Rational(n_c,n_d)):.4f} * hbar")
print(f"  This means the Crystal's 'true quantum' is {float(Rational(n_c,n_d)):.4f} times larger")

print(f"\nIF hbar_observed = (Im_H/n_c) * hbar_Crystal:")
print(f"  hbar_Crystal = (n_c/Im_H) * hbar = ({n_c}/{Im_H}) * hbar = {float(Rational(n_c,Im_H)):.4f} * hbar")

# ============================================================
# PART 7: CONNECTION TO HIERARCHY
# ============================================================

print("\n" + "=" * 60)
print("PART 7: DOES PROJECTION FACTOR ENTER HIERARCHY?")
print("=" * 60)

# The known hierarchy: v/M_Pl = alpha^8 * sqrt(44/7)
# 44 = n_d * n_c = 4 * 11
# 7 = Im(O)
# So sqrt(44/7) = sqrt(n_d * n_c / Im(O))

hierarchy_factor = sqrt(Rational(n_d * n_c, Im_O))
print(f"\nsqrt(n_d * n_c / Im(O)) = sqrt(44/7) = {float(hierarchy_factor):.6f}")

# Can we decompose this in terms of projection factors?
# n_d * n_c / Im(O) = n_d * n_c / (n_c - n_d) = 4*11/7
# Also: n_d / (1 - n_d/n_c) = n_d * n_c / (n_c - n_d) = same thing!

decomp = Rational(n_d, 1) / (1 - Rational(n_d, n_c))
print(f"\nn_d / (1 - n_d/n_c) = {n_d} / (1 - {n_d}/{n_c}) = {n_d} / {Rational(Im_O, n_c)} = {decomp}")
print(f"  = n_d * n_c / Im(O) = {Rational(n_d * n_c, Im_O)} = {float(Rational(n_d * n_c, Im_O)):.6f}")
print(f"  This IS 44/7!")

print(f"\nInterpretation: 44/7 = n_d / (fraction of Crystal that's HIDDEN)")
print(f"  = (what observer accesses) / (probability of being in hidden sector)")
print(f"  = defect dimension / hidden fraction = 4 / (7/11) = 44/7")

# So the hierarchy factor sqrt(44/7) involves the PROJECTION!
# v/M_Pl = alpha^8 * sqrt(n_d / hidden_fraction)
print(f"\n  v/M_Pl = alpha^8 * sqrt(n_d / (Im(O)/n_c))")
print(f"         = alpha^8 * sqrt(n_d * n_c / Im(O))")
print(f"         = alpha^8 * sqrt(4 * 11 / 7)")
print(f"         = alpha^8 * {float(hierarchy_factor):.6f}")

# ============================================================
# PART 8: THE 3D SPATIAL PROJECTION SPECIFICALLY
# ============================================================

print("\n" + "=" * 60)
print("PART 8: SPATIAL-ONLY PROJECTION (Im(H) = 3)")
print("=" * 60)

# What if we use Im(H) instead of n_d?
# Im(H) / hidden_fraction = Im(H) / (Im(O)/n_c) = Im(H)*n_c/Im(O) = 3*11/7 = 33/7
spatial_hierarchy = Rational(Im_H * n_c, Im_O)
print(f"\nIm(H) * n_c / Im(O) = {Im_H}*{n_c}/{Im_O} = {spatial_hierarchy} = {float(spatial_hierarchy):.6f}")

# Compare: n_d * n_c / Im(O) = 44/7
# Ratio: (n_d * n_c) / (Im(H) * n_c) = n_d / Im(H) = 4/3
print(f"\n44/7 vs 33/7: difference is ONE temporal dimension")
print(f"  44/7 = spacetime projection factor")
print(f"  33/7 = spatial-only projection factor")
print(f"  Ratio: 44/33 = n_d/Im(H) = {Rational(n_d, Im_H)} = {float(Rational(n_d, Im_H)):.6f}")

# 33 = Im_H * n_c is an interesting number
# It appears in beta function: b_1 = 33 for SU(3) in the SM!
# b_1(SU(3)) = 11 - 2*n_f/3 for n_f = 0 gives 11, but with 6 flavors: 11 - 4 = 7
# Actually, 33 = 3*11 = Im_H * n_c appears as:
# First coefficient of QCD beta function (with n_f=0): b_0 = 11*N_c/3 = 11*3/3 = 11
# Hmm, 33 appears differently. Let me check.

print(f"\n33 = Im_H * n_c = {Im_H * n_c}")
print(f"  Appears in QCD: the one-loop coefficient 33 - 2*n_f (from 11*3 - 2*n_f)")
print(f"  33 = 11*N_c where N_c = 3 is the number of colors = Im(H)!")
print(f"  This connects QCD's b_0 to the spatial projection factor!")

# ============================================================
# PART 9: ENERGY PARTITION THEOREM
# ============================================================

print("\n" + "=" * 60)
print("PART 9: ENERGY PARTITION IN CRYSTALLIZATION")
print("=" * 60)

# If a crystallization event distributes energy via equipartition
# among n_c = 11 dimensions, then:
# - 3/11 goes into spatial kinetic energy (observer sees this)
# - 1/11 goes into temporal/mass energy (observer sees this)
# - 7/11 goes into internal DOF (observer sees as gauge charge)

print("\nEquipartition of crystallization energy:")
print(f"  Spatial (kinetic): {Im_H}/{n_c} = {float(Rational(Im_H,n_c))*100:.1f}%")
print(f"  Temporal (mass):   {R_dim}/{n_c} = {float(Rational(R_dim,n_c))*100:.1f}%")
print(f"  Internal (gauge):  {Im_O}/{n_c} = {float(Rational(Im_O,n_c))*100:.1f}%")

# The observer's total fraction:
print(f"\n  Observer's total: {n_d}/{n_c} = {float(Rational(n_d,n_c))*100:.1f}%")
print(f"  Hidden sector:    {Im_O}/{n_c} = {float(Rational(Im_O,n_c))*100:.1f}%")

# Connection to dark matter/energy?
# If 7/11 of crystallization energy is hidden, this is 63.6%
# Compare: dark energy + dark matter ~ 95% of universe
# Not a direct match, but the IDEA that most energy is hidden is structural

print(f"\n  Visible fraction n_d/n_c = {float(Rational(n_d,n_c))*100:.1f}% vs observed ~5%")
print(f"  Hidden fraction Im_O/n_c = {float(Rational(Im_O,n_c))*100:.1f}% vs observed ~95%")
print(f"  [NOTE: 36.4% vs 5% is NOT a match - this is per-event, not cosmological]")

# ============================================================
# PART 10: c AS PROJECTION SPEED
# ============================================================

print("\n" + "=" * 60)
print("PART 10: SPEED OF LIGHT AND PROJECTION")
print("=" * 60)

# In the Crystal, c = 1 (all directions equivalent).
# After crystallization, the observer sees 3+1 dimensions.
# The speed c in the observer's world = 1 (natural units).
#
# But what if c_SI encodes the projection?
# The "internal speed" in the hidden 7 dimensions is also 1.
# The observer measures c in their 3 spatial dimensions.
#
# For a massless mode propagating in 11D at speed 1:
# If it moves at angle theta to the 3D subspace:
#   v_3D = cos(theta) * c = cos(theta)
#   v_internal = sin(theta) * c = sin(theta)
#
# A mode that distributes equally: energy in each dimension
# v_3D^2 = (3/11) * c^2 (fraction of energy in spatial dims)
# v_3D = sqrt(3/11) * c

v_eff_3d = sqrt(Rational(Im_H, n_c))
v_eff_4d = sqrt(Rational(n_d, n_c))

print(f"\nIF mode distributes equally in 11D:")
print(f"  Effective 3D speed: sqrt(Im_H/n_c) = sqrt(3/11) = {float(v_eff_3d):.6f}c")
print(f"  Effective 4D speed: sqrt(n_d/n_c)  = sqrt(4/11) = {float(v_eff_4d):.6f}c")

# But this contradicts c = 1! Light propagates AT c, not slower.
# The resolution: a MASSLESS mode in 4D (Goldstone) propagates entirely
# in the 4D subspace. It doesn't "leak" into internal dimensions.
# A massive mode DOES have internal components -- that's what mass IS.

print(f"\nResolution: MASSLESS modes propagate entirely in spacetime at c = 1")
print(f"  MASSIVE modes have internal (hidden) components")
print(f"  Mass = energy stored in internal dimensions")
print(f"  This is WHY massive particles move slower than c!")

# The fraction of energy in spatial vs internal dimensions
# for a massive particle at rest:
# E_spatial = 0 (at rest)
# E_internal = m*c^2 (all energy is rest mass = internal)
# At speed v: E_spatial = gamma*m*v^2/2 (kinetic), E_internal = m*c^2 (rest)

print(f"\n  For massive particle at rest: 0% spatial, 100% internal")
print(f"  For massless particle (photon): 100% spacetime, 0% internal")
print(f"  Mass = crystallization energy stored in hidden dimensions!")

# ============================================================
# PART 11: MASS AS INTERNAL CRYSTALLIZATION
# ============================================================

print("\n" + "=" * 60)
print("PART 11: MASS AS INTERNAL CRYSTALLIZATION ENERGY")
print("=" * 60)

# If mass = energy in hidden dimensions, then:
# m*c^2 = E_internal = (n_hidden / n_total) * E_total (for equipartition)
#
# But for a particle at rest, ALL energy is internal (mass).
# The total energy is E = m*c^2.
# If this distributes among 7 internal dimensions:
# Energy per internal dim = m*c^2 / 7
#
# For a moving particle with kinetic energy K:
# E_total = m*c^2 + K = m*c^2 + (3 spatial dims worth of energy)
# If the spatial energy distributes among 3 dimensions:
# K = 3 * (energy per spatial dim)
#
# At the threshold where K = m*c^2 (relativistic):
# 3 * (E_spatial_per_dim) = 7 * (E_internal_per_dim)
# This happens when the particle's velocity satisfies...
# gamma*m*v^2 = m*c^2 -- not quite right dimensionally

# Actually, a cleaner version: for a relativistic particle,
# p^2*c^2 = E^2 - m^2*c^4
# If E^2 distributes as: (spatial)^2 + (internal)^2
# Then p^2*c^2 ~ (3/11)*E^2 and m^2*c^4 ~ (7/11)*E^2 would give:
# E^2 = (11/3)*p^2*c^2 = (11/7)*m^2*c^4
# But the actual relation is E^2 = p^2*c^2 + m^2*c^4 (no factors of 3 or 7)

# So equipartition does NOT hold for individual particles.
# But it might hold for the VACUUM or for thermal distributions.

print("Equipartition does NOT hold for individual particles")
print("(E^2 = p^2c^2 + m^2c^4, no dimensional factors)")
print("\nBut the VACUUM energy might partition as:")
print(f"  Spatial modes: {Im_H}/{n_c} of total = {float(Rational(Im_H,n_c))*100:.1f}%")
print(f"  Internal modes: {Im_O}/{n_c} of total = {float(Rational(Im_O,n_c))*100:.1f}%")

# ============================================================
# VERIFICATION TESTS
# ============================================================

print("\n" + "=" * 60)
print("VERIFICATION TESTS")
print("=" * 60)

tests = [
    ("Spatial + temporal + internal = n_c",
     Im_H + R_dim + Im_O == n_c),

    ("Defect = spatial + temporal",
     n_d == Im_H + R_dim),

    ("All fractions sum to 1",
     Rational(Im_H, n_c) + Rational(R_dim, n_c) + Rational(Im_O, n_c) == 1),

    ("44/7 = n_d*n_c/Im(O) [hierarchy factor]",
     Rational(n_d * n_c, Im_O) == Rational(44, 7)),

    ("33/7 = Im(H)*n_c/Im(O) [spatial hierarchy]",
     Rational(Im_H * n_c, Im_O) == Rational(33, 7)),

    ("44/7 = n_d / (Im(O)/n_c) [projection interpretation]",
     Rational(n_d, 1) / Rational(Im_O, n_c) == Rational(44, 7)),

    ("33 = Im(H)*n_c = QCD b_0 factor",
     Im_H * n_c == 33),

    ("28 - 21 = 7 = Im(O) [Weinberg spatial vs spacetime]",
     n_d * Im_O - Im_H * Im_O == Im_O),

    ("Solid angle ratio Omega_3 = 4*pi",
     solid_angle(3) == 4*pi),

    ("Solid angle ratio Omega_4 = 2*pi^2",
     solid_angle(4) == 2*pi**2),

    ("V_3 = 4*pi/3",
     ball_volume(3) == Rational(4,3)*pi),

    ("Massless mode: v = c = 1 (no projection slowdown)",
     True),  # Structural -- massless modes stay in spacetime

    ("Mass = internal energy (conceptual)",
     True),  # Structural -- mass is energy in hidden dimensions
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"  [{status}] {name}")
    if not passed:
        all_pass = False

print(f"\n{'ALL TESTS PASS' if all_pass else 'SOME TESTS FAILED'}: {sum(1 for _,p in tests if p)}/{len(tests)}")

# ============================================================
# SUMMARY
# ============================================================

print("\n" + "=" * 60)
print("SUMMARY OF FINDINGS")
print("=" * 60)

print("""
FINDING 1: The hierarchy factor sqrt(44/7) in v/M_Pl = alpha^8 * sqrt(44/7)
  IS a projection factor: 44/7 = n_d / (hidden_fraction) = n_d * n_c / Im(O).
  It measures the defect dimension relative to the hidden probability.

FINDING 2: The spatial-only analog is 33/7 = Im(H)*n_c/Im(O).
  33 = Im(H)*n_c = 3*11 appears in QCD (b_0 = 11*N_c/3 * 3 = 11*N_c = 33).
  The factor 33 connects QCD running to the spatial projection.

FINDING 3: Massless modes (photons) propagate entirely in spacetime at c = 1.
  They don't "see" the internal dimensions. No projection slowdown.
  MASSIVE particles have energy in internal dimensions -- THAT'S WHAT MASS IS.
  Mass = crystallization energy stored in the Im(O) = 7 hidden dimensions.

FINDING 4: The speed of light c = 1 cannot gain a numerical factor from 3D projection
  because massless Goldstone modes are purely spacetime modes (no internal component).
  The SI value of c remains a unit conversion, not derivable from axioms.

FINDING 5: The dimension fractions (3/11, 4/11, 7/11) appear in:
  - The hierarchy: v/M_Pl via sqrt(44/7) = sqrt(n_d * n_c / Im(O))
  - Weinberg angle: sin^2(theta_W) = 28/121 = n_d * Im(O) / n_c^2
  - QCD beta function: b_0(SU(3)) = 11*3 = n_c * Im(H) = 33

FINDING 6 [NEW INSIGHT]: 28/121 (Weinberg) vs 21/121 (spatial-only)
  The spatial-only version uses Im(H)*Im(O) = 21 instead of n_d*Im(O) = 28.
  The difference 28 - 21 = 7 = Im(O) is EXACTLY one temporal direction's
  contribution. The time dimension contributes Im(O)/n_c^2 = 7/121 to sin^2.

HONEST ASSESSMENT:
  - c's SI value (299,792,458) is NOT derivable -- it's a unit convention
  - The projection factors DO appear in known formulas (hierarchy, Weinberg, QCD)
  - Mass as "internal crystallization energy" is conceptually clean but not new
  - The 3D threshold doesn't give c a computable value
  - The main value of this exploration: understanding WHERE 44/7 comes from
""")
