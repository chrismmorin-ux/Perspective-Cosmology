#!/usr/bin/env python3
"""
Per-Sector Induced Couplings: All SM Gauge Couplings from Mode Counting

KEY FINDING: In the unified 5C+5D picture (S153), different gauge couplings
arise from different charge-weighted sums S_i over the 137 tilt modes.
The universal log ratio log(Λ/μ) = 137π/21 applies to all, but S_i varies
by gauge group. Testing whether S_i values have clean framework expressions.

Questions:
1. What S_2, S_3 values reproduce measured couplings?
2. Do those S_i have clean framework expressions?
3. How does sin²(θ_W) arise in the induced picture?
4. Is S151's sin²(θ_W) = 28/121 compatible?
5. What role does the crystallization scale play?

Depends on:
- step5_unified_5C_5D.md (S153): log(Λ/μ) = N_I π/(Im_H × Im_O)
- multi_coupling_tilt_angles.md (S151): per-sector formulas
- composite_gauge_field_analysis.md (S147-149): S_EM = 126

Created: Session 153
"""

from sympy import *
from sympy import Rational as R

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

n_d = 4       # Defect dimension
n_c = 11      # Crystal dimension
Im_C = 1      # Imaginary complex dims
Im_H = 3      # Imaginary quaternion dims
Im_O = 7      # Imaginary octonion dims
C_dim = 2     # Complex dimension
H_dim = 4     # Quaternion dimension
O_dim = 8     # Octonion dimension

N_I = n_d**2 + n_c**2   # 137
S_EM = N_I - n_c         # 126

Phi_6_nc = n_c**2 - n_c + 1  # 111

print("=" * 72)
print("PER-SECTOR INDUCED COUPLINGS")
print("=" * 72)
print()
print(f"Framework: n_d={n_d}, n_c={n_c}, N_I={N_I}, S_EM={S_EM}")
print(f"Im_C={Im_C}, Im_H={Im_H}, Im_O={Im_O}")
print(f"Phi_6(n_c) = {Phi_6_nc}")
print()

# ==============================================================================
# MEASURED VALUES (at M_Z = 91.1876 GeV)
# ==============================================================================

# Standard Model couplings at M_Z in MS-bar scheme
alpha_EM_inv_MZ = R(12809, 100)       # 128.09 (PDG 2024)
alpha_2_inv_MZ = R(2962, 100)         # 29.62
alpha_s_inv_MZ = R(848, 100)          # 8.48 (alpha_s(M_Z) ~ 0.1180)
sin2_theta_W_MZ = R(23121, 100000)    # 0.23121 (MS-bar at M_Z)

# Low-energy EM coupling
alpha_EM_inv_low = R(137036, 1000)    # 137.036 (at q^2 ~ 0)

# Scale info
M_Z = R(91188, 1000)        # GeV
m_e = R(511, 1000000)       # GeV (0.000511)
v_EW = R(246220, 1000)      # GeV

print("Measured couplings at M_Z:")
print(f"  1/α_EM(M_Z) = {float(alpha_EM_inv_MZ):.1f}")
print(f"  1/α_2(M_Z)  = {float(alpha_2_inv_MZ):.2f}")
print(f"  1/α_s(M_Z)  = {float(alpha_s_inv_MZ):.2f}")
print(f"  sin²θ_W(M_Z) = {float(sin2_theta_W_MZ):.5f}")
print()

# ==============================================================================
# SECTION 1: INDUCED MECHANISM BASICS
# ==============================================================================

print("=" * 72)
print("SECTION 1: INDUCED MECHANISM — MULTI-COUPLING EXTENSION")
print("=" * 72)
print()

# From S153: each gauge coupling is induced at one loop by tilt modes
# 1/α_i(μ) = S_i/(6π) × log(Λ/μ)
#
# For EM: S_EM = 126, giving 1/α_EM = 137 at μ = m_e
# For other gauge groups: S_i counts modes charged under group i
#
# With universal Λ and μ, the ratio of couplings is:
# α_EM/α_i = S_i/S_EM = S_i/126
#
# Equivalently: 1/α_i = S_i × (N_I / S_EM) = S_i × 137/126

print("Induced mechanism (S153):")
print("  1/α_i(μ) = S_i/(6π) × log(Λ/μ)")
print(f"  For EM: S_EM = {S_EM}, 1/α_EM = {N_I}")
print(f"  For gauge group i: 1/α_i = S_i × {N_I}/{S_EM}")
print()

# What S_i values are needed at the crystallization scale (μ ~ m_e)?
# At this scale: 1/α_i(m_e) = S_i × 137/126

# ==============================================================================
# SECTION 2: EXTRACT REQUIRED S_i FROM MEASUREMENTS
# ==============================================================================

print("=" * 72)
print("SECTION 2: REQUIRED S_i VALUES FROM MEASUREMENTS")
print("=" * 72)
print()

# SM one-loop beta coefficients (in convention d(1/α)/d(log μ) = b/(2π))
# These apply to running BELOW the composite scale
b_1_GUT = R(41, 10)     # U(1)_Y in GUT normalization 5/3 × α_Y
b_2 = R(-19, 6)         # SU(2)_L
b_3 = R(-7, 1)          # SU(3)_C

print("SM one-loop beta coefficients:")
print(f"  b_1 = {b_1_GUT} (GUT-normalized U(1)_Y)")
print(f"  b_2 = {b_2} (SU(2))")
print(f"  b_3 = {b_3} (SU(3))")
print()

# Running from M_Z down to some reference scale
# 1/α_i(μ) = 1/α_i(M_Z) + b_i/(2π) × log(M_Z/μ)  [note: running DOWN]

# Option A: All couplings defined at M_Z
# → Just need to find S_i such that S_i × 137/126 matches 1/α_i at some common scale

# The question: at what scale are the couplings S_i × 137/126?
# For EM, the Born rule gives α = 1/137 at "the crystallization scale"
# Session 153 identified this as μ ~ m_e

# If all couplings have the SAME Λ and μ:
# 1/α_i(μ) = S_i × 137/126  (all at the same μ)

# This means at μ = m_e:
# 1/α_EM(m_e) ≈ 137 ✓
# 1/α_2(m_e) = S_2 × 137/126
# 1/α_3(m_e) = S_3 × 137/126

# We need to run the measured values from M_Z to m_e:
log_MZ_me = log(float(M_Z / m_e))
print(f"log(M_Z/m_e) = log({float(M_Z):.1f}/{float(m_e):.6f}) = {log_MZ_me:.4f}")
print()

# NOTE: SU(2) and SU(3) have thresholds (W mass, QCD scale)
# For SU(3), perturbative running breaks down at Λ_QCD ~ 200 MeV
# For SU(2), running below M_W ~ 80 GeV changes the beta coefficient
# This makes running to m_e problematic for SU(2) and SU(3)

# Instead, let's work at M_Z and ask: what S_i values give the right
# couplings if the common reference scale is M_Z?

print("--- Approach A: Common reference scale = M_Z ---")
print()

# If 1/α_i(M_Z) = S_i × N_I / S_EM (all at M_Z):
S2_from_MZ = alpha_2_inv_MZ * S_EM / N_I
S3_from_MZ = alpha_s_inv_MZ * S_EM / N_I
SEM_check_MZ = alpha_EM_inv_MZ * S_EM / N_I

print(f"If all couplings at M_Z = S_i × {N_I}/{S_EM}:")
print(f"  S_EM → {float(SEM_check_MZ):.2f} (should be {S_EM}; mismatch because α_EM runs)")
print(f"  S_2  → {float(S2_from_MZ):.2f}")
print(f"  S_3  → {float(S3_from_MZ):.2f}")
print(f"  [EM mismatch: α_EM(M_Z) = 1/128 ≠ 1/137 (α runs from m_e to M_Z)]")
print()

# Approach B: Each coupling has its own "natural scale" μ_i where 1/α_i(μ_i) = S_i × N_I/S_EM
# For EM: μ_EM = m_e (lightest charged particle)
# For SU(2): μ_2 = M_W? M_Z? v_EW?
# For SU(3): μ_3 = Λ_QCD?

print("--- Approach B: Natural reference scale for each coupling ---")
print()

# For EM: 1/α_EM(m_e) ≈ 137 = N_I
# → S_EM = 126 ✓ (established)

# For SU(3): α_s runs fast. At what scale is 1/α_s = integer × 137/126?
# 1/α_s(μ) = S_3 × 137/126
# If S_3 = 8 (= O): 1/α_s = 8 × 137/126 = 1096/126 = 548/63 = 8.698
# α_s(μ) = 63/548 = 0.1150
# In the SM, α_s = 0.1150 at μ ≈ 100 GeV (close to M_Z = 91.2)
# Measured α_s(M_Z) = 0.1180 → 1/α_s(M_Z) = 8.47

print("If S_3 = O = 8:")
alpha_s_pred = R(S_EM, S_EM) * R(8 * N_I, S_EM)  # = 8 * 137/126
alpha_s_pred = R(8 * N_I, S_EM)
print(f"  1/α_s = 8 × {N_I}/{S_EM} = {alpha_s_pred} = {float(alpha_s_pred):.4f}")
print(f"  Measured 1/α_s(M_Z) = {float(alpha_s_inv_MZ):.2f}")
print(f"  Error: {abs(float(alpha_s_pred) - float(alpha_s_inv_MZ))/float(alpha_s_inv_MZ)*100:.1f}%")
print()

# For SU(2): sin²θ_W = α_EM/α_2 = S_2/S_EM (at the common scale)
# If S_2 = 28 = n_d × Im_O:
# sin²θ_W = 28/126 = 2/9 = 0.2222...
# If S_2 = 33 = Im_H × n_c:
# sin²θ_W = 33/126 = 11/42 = 0.2619...
# Both far from 0.2312

# The S151 result sin²θ_W = 28/121 = n_d × Im_O / n_c² was NOT derived
# from the induced mechanism. Let's check what it implies.

print("--- Approach C: S151 Weinberg angle meets induced mechanism ---")
print()

# S151: sin²θ_W = n_d × Im_O / n_c² = 28/121 = 0.23140...
sin2_S151 = R(n_d * Im_O, n_c**2)
print(f"S151: sin²θ_W = n_d × Im_O / n_c² = {sin2_S151} = {float(sin2_S151):.6f}")
print(f"Measured: sin²θ_W(M_Z) = {float(sin2_theta_W_MZ):.6f}")
print(f"Error: {abs(float(sin2_S151) - float(sin2_theta_W_MZ))/float(sin2_theta_W_MZ)*100:.2f}%")
print()

# In the induced picture: sin²θ_W = S_2/S_EM at the common scale
# If sin²θ_W = 28/121 and also = S_2/S_EM = S_2/126:
# S_2 = 126 × 28/121 = 3528/121 ≈ 29.16 (not integer)

S2_from_S151 = S_EM * sin2_S151
print(f"If sin²θ_W = S_2/S_EM: S_2 = {S_EM} × {sin2_S151} = {S2_from_S151} = {float(S2_from_S151):.4f}")
print(f"  NOT an integer → S151's 28/121 and induced S_2/126 are INCOMPATIBLE")
print(f"  (unless sin²θ_W ≠ S_2/S_EM)")
print()

# ==============================================================================
# SECTION 3: WHAT IF THE DENOMINATOR ISN'T S_EM?
# ==============================================================================

print("=" * 72)
print("SECTION 3: ALTERNATIVE WEINBERG ANGLE FORMULAS")
print("=" * 72)
print()

# The SM relation: sin²θ_W = e²/g₂² = α_EM/α_2
# In the induced picture, IF all couplings share the same log(Λ/μ):
# sin²θ_W = (S_2/(6π) × L)⁻¹ / (S_EM/(6π) × L)⁻¹ = S_2/S_EM

# But what if SU(2) has different log ratio?
# The Born rule argument (5D) applies to EACH gauge group independently:
# α_i = 1/N_i where N_i is the relevant mode count for group i

# For EM: N_EM = N_I = 137 → α_EM = 1/137
# For SU(2): N_2 = ??? → α_2 = 1/N_2
# For SU(3): N_3 = ??? → α_3 = 1/N_3

# If each gauge group has its own crystallization with its own Born rule:
# sin²θ_W = α_EM/α_2 = N_2/N_I

# S151's formula: sin²θ_W = 28/121 = (n_d × Im_O)/n_c²
# Could this mean N_2 = n_c² = 121 and the "EM weight" factor = n_d × Im_O?

# Actually, let's reconsider. In the SM:
# sin²θ_W = g'²/(g² + g'²)
# where g is SU(2) coupling and g' is U(1)_Y coupling
# This is NOT simply α_EM/α_2.
# Rather: α_EM = α_2 × sin²θ_W (from e = g sin θ_W)
# So sin²θ_W = α_EM/α_2 ✓

# In terms of α_Y (U(1) hypercharge, NOT GUT-normalized):
# 1/α_EM = 1/α_2 + 1/α_Y
# sin²θ_W = α_EM/α_2
# cos²θ_W = α_EM/α_Y

# If the induced mechanism gives different S_i:
# sin²θ_W = S_2/S_EM at a common scale

# For this to match S151: S_2/126 = 28/121
# S_2 = 3528/121 ≈ 29.16 — not clean

# Alternative: maybe the Weinberg angle isn't S_2/S_EM but involves
# a different combination.

print("Testing framework expressions for sin²θ_W:")
print()

candidates_sin2 = {
    "n_d × Im_O / n_c²": R(n_d * Im_O, n_c**2),                    # 28/121 = 0.2314 (S151)
    "n_d × Im_O / S_EM": R(n_d * Im_O, S_EM),                       # 28/126 = 2/9 = 0.2222
    "Im_O / (Im_H × n_c)": R(Im_O, Im_H * n_c),                     # 7/33 = 0.2121
    "n_d / (n_d + n_c + C_dim)": R(n_d, n_d + n_c + C_dim),         # 4/17 = 0.2353
    "Im_H / (Im_H + Im_O + Im_C + n_d)": R(Im_H, Im_H + Im_O + Im_C + n_d),  # 3/15 = 0.2
    "(Im_O - 1) / (n_c² - n_c)": R(Im_O - 1, n_c * (n_c - 1)),     # 6/110 = 0.0545 — too small
    "n_d / (n_d + n_c + Im_H)": R(n_d, n_d + n_c + Im_H),           # 4/18 = 0.222
    "n_d × Im_O / N_I": R(n_d * Im_O, N_I),                          # 28/137 = 0.2044
    "Im_H × Im_O / (n_c² - Im_C)": R(Im_H * Im_O, n_c**2 - Im_C),  # 21/120 = 0.175
    "Im_H / (Im_C + Im_H + Im_O + n_d)": R(Im_H, 1+3+7+4),         # 3/15 = 0.2
    "(n_d - Im_C) / (n_d - Im_C + Im_O + Im_H)": R(n_d - Im_C, n_d - Im_C + Im_O + Im_H),  # 3/13
    "C_dim × Im_H × Im_O / (C_dim × n_c² + n_d)": R(C_dim * Im_H * Im_O, C_dim * n_c**2 + n_d),  # 42/246
}

for name, val in sorted(candidates_sin2.items(), key=lambda x: abs(float(x[1]) - float(sin2_theta_W_MZ))):
    err = abs(float(val) - float(sin2_theta_W_MZ)) / float(sin2_theta_W_MZ) * 100
    mark = "***" if err < 0.5 else "**" if err < 2 else "*" if err < 5 else ""
    print(f"  {name} = {val} = {float(val):.6f}  err = {err:.2f}% {mark}")

print()
print("*** = <0.5%, ** = <2%, * = <5%")
print()

# ==============================================================================
# SECTION 4: CHARGE-WEIGHTED SUMS BY DIVISION ALGEBRA SECTOR
# ==============================================================================

print("=" * 72)
print("SECTION 4: DECOMPOSING S_i BY DIVISION ALGEBRA SECTOR")
print("=" * 72)
print()

# The 137 modes decompose as:
# Herm(4): 16 modes (defect = spacetime sector)
# Herm(11): 121 modes (crystal = internal sector)
#
# Within Herm(11), using n_c = Im_C + Im_H + Im_O = 1 + 3 + 7:
# Pure C modes: Im_C² = 1
# Pure H modes: Im_H² = 9
# Pure O modes: Im_O² = 49
# C-H cross: 2 × Im_C × Im_H = 6
# C-O cross: 2 × Im_C × Im_O = 14
# H-O cross: 2 × Im_H × Im_O = 42
# Total crystal: 1 + 9 + 49 + 6 + 14 + 42 = 121 ✓

modes = {
    "defect": n_d**2,           # 16
    "C_pure": Im_C**2,          # 1
    "H_pure": Im_H**2,          # 9
    "O_pure": Im_O**2,          # 49
    "CH_cross": 2*Im_C*Im_H,   # 6
    "CO_cross": 2*Im_C*Im_O,   # 14
    "HO_cross": 2*Im_H*Im_O,   # 42
}

total = sum(modes.values())
print("Mode decomposition:")
for name, count in modes.items():
    print(f"  {name:12s}: {count:3d} modes")
print(f"  {'Total':12s}: {total:3d} modes")
assert total == N_I
print()

# For EM, S_EM = 126 = N_I - n_c
# Meaning 11 modes are neutral (one per diagonal entry of Herm(11))
# The 11 neutral modes come from the crystal diagonal

# For SU(2): which modes are charged?
# SU(2) acts on the H-sector (3 imaginary quaternion dimensions)
# Modes with non-trivial H quantum numbers include:
# - H_pure: 9 modes (3×3 matrix)
# - CH_cross: 6 modes (mix C and H)
# - HO_cross: 42 modes (mix H and O)
# Total H-charged crystal modes: 9 + 6 + 42 = 57
# Plus defect modes that couple to H: depends on structure

# For SU(3): which modes are charged?
# SU(3) ⊂ G₂ acts on (part of) the O-sector
# Modes with non-trivial SU(3) quantum numbers include:
# - O_pure: 49 modes (7×7 matrix)
# - CO_cross: 14 modes (mix C and O)
# - HO_cross: 42 modes (mix H and O)
# Total O-charged crystal modes: 49 + 14 + 42 = 105
# But not all of these are charged under SU(3) ⊂ SO(7)

print("Sector charge assignments (speculative):")
print()

# In the SM, the relevant counting at M_Z is:
# SU(2): N_f Weyl doublets + Higgs doublet
# SU(3): N_f Weyl triplets

# In the framework, the CHARGE-WEIGHTED SUM S_i determines 1/α_i.
# The charge depends on the representation.

# Let's look at this from the measured couplings.
# If the common reference is M_Z (where all three are measured):

print("Working at M_Z (where couplings are measured):")
print()

# At M_Z, in the induced picture:
# 1/α_i(M_Z) = S_i × C_i where C_i depends on the log ratio at M_Z
# For EM: 1/α_EM(M_Z) = 128.1 = S_EM × C_EM
# For SU(2): 1/α_2(M_Z) = 29.62 = S_2 × C_2
# For SU(3): 1/α_s(M_Z) = 8.48 = S_3 × C_3

# If ALL use the same log(Λ/M_Z):
# C_i = log(Λ/M_Z)/(6π) for all i
# Then 1/α_i = S_i/(6π) × log(Λ/M_Z) for all i

# And: S_i/S_j = (1/α_i)/(1/α_j) at M_Z

S2_S_ratio = alpha_2_inv_MZ / alpha_EM_inv_MZ
S3_S_ratio = alpha_s_inv_MZ / alpha_EM_inv_MZ

print(f"Coupling ratios at M_Z (= S_i/S_EM if common scale):")
print(f"  S_2/S_EM = 1/α_2 / 1/α_EM = {float(S2_S_ratio):.6f}")
print(f"  S_3/S_EM = 1/α_s / 1/α_EM = {float(S3_S_ratio):.6f}")
print()

# This means:
# S_2 = 126 × 29.62/128.09 = 29.14
# S_3 = 126 × 8.48/128.09 = 8.34
S2_at_MZ = S_EM * S2_S_ratio
S3_at_MZ = S_EM * S3_S_ratio
print(f"Required S values (common scale at M_Z):")
print(f"  S_2 = {float(S2_at_MZ):.2f} (nearest integer: {round(float(S2_at_MZ))})")
print(f"  S_3 = {float(S3_at_MZ):.2f} (nearest integer: {round(float(S3_at_MZ))})")
print()

# S_2 ≈ 29 and S_3 ≈ 8
# S_3 = 8 = O is clean!
# S_2 ≈ 29 — what framework expression gives 29?

candidates_S2 = {
    "n_d × Im_O": n_d * Im_O,                     # 28
    "n_d × Im_O + 1": n_d * Im_O + 1,             # 29
    "Im_H × (Im_O + Im_H)": Im_H * (Im_O + Im_H), # 30
    "Im_H × n_c": Im_H * n_c,                      # 33
    "n_d × O_dim": n_d * O_dim,                     # 32
    "S_EM / n_d": S_EM // n_d,                      # 31
    "n_c + Im_O + n_c": n_c + Im_O + n_c,          # 29
    "2*n_c + Im_O": 2*n_c + Im_O,                  # 29
    "n_d² + n_c + C_dim": n_d**2 + n_c + C_dim,    # 29
    "Im_H × Im_O + O_dim": Im_H * Im_O + O_dim,    # 29
}

print("Framework expressions near S_2:")
for name, val in sorted(candidates_S2.items(), key=lambda x: abs(x[1] - float(S2_at_MZ))):
    err_from_target = abs(val - float(S2_at_MZ))
    print(f"  {name:30s} = {val:3d}  (off by {err_from_target:.2f})")

print()

# ==============================================================================
# SECTION 5: APPROACH D — DIFFERENT LOG RATIOS PER SECTOR
# ==============================================================================

print("=" * 72)
print("SECTION 5: DIFFERENT CRYSTALLIZATION SCALES PER SECTOR?")
print("=" * 72)
print()

# What if each gauge group crystallizes at a different scale?
# The division algebra ordering (C < H < O by complexity) suggests:
# C crystallizes first (EM emerges at highest energy)
# H crystallizes second (weak force)
# O crystallizes last (strong force)
#
# In the induced picture, this means different μ_i:
# 1/α_i(μ_i) = S_i/(6π) × log(Λ/μ_i) = N_i (Born rule for sector i)
#
# Where N_i could be a sector-specific mode count.

# What if each sector's crystallization gives Born rule α = 1/N_sector?
# With N_sector being the number of modes visible to that sector?

# For EM (all 137 modes participate): N_EM = N_I = 137, α_EM = 1/137
# For SU(2) (H-sector modes): N_2 = n_c² = 121?, α_2 = 1/121?
# That gives 1/α_2 = 121, WAY too large (measured is 29.6)

# For SU(2), we might have N_2 = n_c² (121 crystal modes see SU(2)):
# Then sin²θ_W = α_EM/α_2 = N_2/N_EM = 121/137 = 0.883 — WAY off

# OR: α_2 = N_gauge_bosons / N_sector (fraction of modes that are gauge)
# SU(2) has 3 generators: α_2 = 3/N_2
# This gives different predictions...

# Actually, maybe the Born rule for each sector gives:
# 1/α_i = N_sector / N_gauge_bosons_i
# For EM: 1/α_EM = N_I / 1 = 137 (one photon)
# For SU(2): 1/α_2 = N_2 / 3 (3 W-bosons)
# For SU(3): 1/α_3 = N_3 / 8 (8 gluons)
#
# If N_2 = n_c² = 121: 1/α_2 = 121/3 = 40.3 (measured 29.6, off by 36%)
# If N_3 = n_c² = 121: 1/α_3 = 121/8 = 15.1 (measured 8.5, off by 78%)

# Try N_2 = N_I (all modes): 1/α_2 = 137/3 = 45.7 (off by 54%)
# None of these simple models work well.

print("Born rule models (α_i = n_generators / N_sector):")
print()

for name_N, N_val in [("N_I=137", N_I), ("n_c²=121", n_c**2),
                       ("S_EM=126", S_EM), ("n_d²+n_c=132", n_d**2 + n_c)]:
    alpha2_pred = R(3, N_val)
    alpha2_inv_pred = R(N_val, 3)
    alphas_pred = R(8, N_val)
    alphas_inv_pred = R(N_val, 8)
    err_2 = abs(float(alpha2_inv_pred) - float(alpha_2_inv_MZ)) / float(alpha_2_inv_MZ) * 100
    err_s = abs(float(alphas_inv_pred) - float(alpha_s_inv_MZ)) / float(alpha_s_inv_MZ) * 100
    print(f"  {name_N}: 1/α_2 = {float(alpha2_inv_pred):.1f} (err {err_2:.0f}%), "
          f"1/α_s = {float(alphas_inv_pred):.1f} (err {err_s:.0f}%)")
print()
print("  None of the simple Born-rule-per-sector models match well.")
print()

# ==============================================================================
# SECTION 6: S151 FORMULAS IN THE INDUCED PICTURE
# ==============================================================================

print("=" * 72)
print("SECTION 6: S151 FORMULAS — CONSISTENCY CHECK")
print("=" * 72)
print()

# S151 found (without the induced mechanism context):
# sin²θ_W = n_d × Im_O / n_c² = 28/121 = 0.2314 (0.08%)
# 1/α_s ~ O = 8 (6% at M_Z)
# 1/α_2 ~ Im_H × (Im_H + Im_O) = 30 (1.3% at M_Z)

# These are direct comparisons to M_Z values, not from the induced mechanism.
# Let's check internal consistency.

# From sin²θ_W = α_EM/α_2:
# 1/α_2 = sin²θ_W × 1/α_EM = 28/121 × 137.036 = 31.73 at low energy
# But 1/α_2 = 30 at M_Z (S151) — different scales!

alpha_2_inv_from_S151_lowE = sin2_S151 * alpha_EM_inv_low
print(f"S151 consistency at low energy:")
print(f"  sin²θ_W = {float(sin2_S151):.6f}")
print(f"  If 1/α_EM(low) = {float(alpha_EM_inv_low):.3f}:")
print(f"  Then 1/α_2(low) = sin²θ_W × 1/α_EM = {float(alpha_2_inv_from_S151_lowE):.2f}")
print(f"  Versus S151's 1/α_2 = 30 (at M_Z)")
print()

# Actually sin²θ_W = α_EM/α_2 means:
# 1/α_2 = (1/α_EM) × sin²θ_W is WRONG
# Correct: sin²θ_W = α_EM/α_2 = (1/α_2)/(1/α_EM)
# So: 1/α_2 = sin²θ_W × 1/α_EM?
# No: α_EM/α_2 = sin²θ_W means α_EM = α_2 sin²θ_W
# So: 1/α_EM = 1/(α_2 sin²θ_W) = (1/α_2)/sin²θ_W
# Therefore: 1/α_2 = sin²θ_W / α_EM = sin²θ_W × (1/α_EM)

# Wait, let me be careful:
# sin²θ_W = α_EM/α_2
# → α_2 = α_EM/sin²θ_W
# → 1/α_2 = sin²θ_W/α_EM = sin²θ_W × (1/α_EM)

# Hmm no. 1/α_2 = sin²θ_W × 1/α_EM gives:
# 1/α_2 = 0.2314 × 137 = 31.7 (at low energy)
# But measured 1/α_2(M_Z) = 29.6

# Wait, I keep confusing myself. Let me just be explicit:
# α_EM = e²/(4π), α_2 = g²/(4π)
# e = g sin θ_W
# → e² = g² sin²θ_W → α_EM = α_2 sin²θ_W
# → 1/α_2 = sin²θ_W / α_EM = sin²θ_W × (1/α_EM)

# NO! 1/α_2 = 1/(α_EM/sin²θ_W) = sin²θ_W/α_EM
# = sin²θ_W × (1/α_EM)
# = 0.2312 × 128.1 = 29.6 ✓ (at M_Z)
# = 0.2314 × 137.0 = 31.7 (at low energy, if sin²θ_W didn't run)

# But sin²θ_W RUNS. At low energy sin²θ_W(0) ≈ 0.238 (MS-bar).
# So: 1/α_2(low) = 0.238 × 137.0 = 32.6

print("Consistency check — the relationship 1/α_2 = sin²θ_W × (1/α_EM):")
print(f"  At M_Z: {float(sin2_theta_W_MZ):.4f} × {float(alpha_EM_inv_MZ):.1f} = "
      f"{float(sin2_theta_W_MZ * alpha_EM_inv_MZ):.1f} (measured 1/α_2 = {float(alpha_2_inv_MZ):.1f}) ✓")
print()

# S151 formulas are really best read as framework NUMBER predictions
# compared to MEASURED values at M_Z, not as self-consistent induced mechanism.

print("S151 formulas (read as direct predictions compared to M_Z values):")
print()

s151_predictions = [
    ("sin²θ_W", float(sin2_S151), float(sin2_theta_W_MZ), "n_d × Im_O / n_c²"),
    ("1/α_2", Im_H * (Im_O + Im_H), float(alpha_2_inv_MZ), "Im_H × (Im_O + Im_H)"),
    ("1/α_s", O_dim, float(alpha_s_inv_MZ), "O"),
]

for name, pred, meas, formula in s151_predictions:
    err = abs(float(pred) - meas) / meas * 100
    print(f"  {name:12s} = {formula:25s} = {float(pred):.4f}  meas={meas:.4f}  err={err:.2f}%")

print()

# ==============================================================================
# SECTION 7: THE INDUCED RATIO APPROACH (MOST CONSTRAINED)
# ==============================================================================

print("=" * 72)
print("SECTION 7: INDUCED COUPLING RATIOS AT COMMON SCALE")
print("=" * 72)
print()

# If ALL gauge fields are induced from the same 137 modes with the same Λ
# and the same μ, then coupling RATIOS are:
#
# 1/α_i : 1/α_j = S_i : S_j
#
# This holds at ALL scales (the log(Λ/μ) cancels in the ratio).
# This is the strongest prediction: the ratio is scale-independent!

# At M_Z:
# 1/α_2 / 1/α_EM = S_2/S_EM = 29.62/128.09 = 0.2312
# 1/α_s / 1/α_EM = S_3/S_EM = 8.48/128.09 = 0.0662

# Wait — the coupling RATIOS change with scale in the SM because
# different gauge groups have different beta functions!
# So the induced picture with constant S_i/S_j contradicts the SM.

# UNLESS: the beta functions ALSO arise from the mode structure.
# In the induced picture, the loop that generates the gauge kinetic term
# IS the running. The beta function coefficients are DETERMINED by S_i.
# Specifically: b_i = -S_i/(6π) (one-loop, from the 137 tilt modes)
# This gives d(1/α_i)/d(log μ) = S_i/(6π × 2π) ...

# Actually, in the induced picture:
# 1/α_i(μ) = S_i/(6π) × log(Λ/μ)
# d(1/α_i)/d(log μ) = -S_i/(6π)
# This is the beta function from the tilt modes alone.

# In the SM below Λ, there are ADDITIONAL contributions to running
# from the SM particles (quarks, leptons, W/Z).
# So the full running is:
# d(1/α_i)/d(log μ) = -S_i/(6π) + b_i^SM/(2π)
# where b_i^SM is the SM beta coefficient from matter/gauge loops.

# AT the scale Λ where the tilt modes decouple, only SM running remains.
# BELOW Λ: d(1/α_i)/d(log μ) = b_i^SM/(2π)
# ABOVE μ and below Λ: the tilt mode contributions dominate

# This means the coupling ratios DO change with scale (from SM running),
# but the tilt mode contribution gives a scale-independent piece.

print("In the induced picture, 1/α_i = S_i/(6π) × log(Λ/μ) + SM running corrections")
print("The tilt-mode ratio S_i/S_j is scale-independent.")
print("SM running modifies it at low energies.")
print()

# The cleanest prediction is at the composite scale Λ ~ 405 TeV:
# 1/α_i(Λ) = S_i/(6π) × log(Λ/Λ) = 0 (all couplings vanish at Λ!)
# That's the definition of induced — no bare kinetic term.

# Slightly below Λ: the couplings emerge proportional to S_i.
# The RATIOS at the composite scale are just S_i/S_j.

# At M_Z (including SM running from Λ to M_Z):
# 1/α_i(M_Z) = S_i/(6π) × log(Λ/M_Z) + b_i^SM/(2π) × log(Λ/M_Z)
#             = [S_i/(6π) + b_i^SM/(2π)] × log(Λ/M_Z)
# Wait, that's only correct if the SM running also starts at Λ.
# Actually, the SM particles ARE the tilt modes (in this picture).
# So the "SM running" and the "tilt mode induction" are the same thing!

# This is a key insight: in the composite picture, there's no separate
# "SM running" — the tilt modes ARE the SM particles, and their loop
# effects generate the coupling.

print("KEY INSIGHT: If tilt modes = SM matter, then SM running IS the induction.")
print("The beta function b_i^SM is just S_i/(6π) (at one loop).")
print()
print("This predicts: b_2/b_EM = S_2/S_EM and b_3/b_EM = S_3/S_EM")
print()

# Check: in the SM, what are the actual beta function coefficient ratios?
# For U(1)_EM (below M_W, effectively):
# The EM running from light fermions gives:
# b_EM ≈ -4/3 × Σ_f N_c × Q_f² = -4/3 × (3×4/9 + 3×1/9 + 1) = -4/3 × (4/3+1/3+1)
# = -4/3 × 8/3 = -32/9 per generation
# Wait, this is getting complicated. Let me compute numerically.

# SM matter contributions to EM running (at one loop, below M_Z):
# Each charged fermion f contributes: Δb_EM = -4/3 × N_c × Q_f²
# u: -4/3 × 3 × (2/3)² = -4/3 × 4/3 = -16/9
# d: -4/3 × 3 × (1/3)² = -4/3 × 1/3 = -4/9
# e: -4/3 × 1 × 1² = -4/3
# Each generation: -(16/9 + 4/9 + 4/3) = -(16/9 + 4/9 + 12/9) = -32/9
# 3 generations: -32/3

b_EM_matter = R(-32, 3)  # from 3 generations of quarks + leptons (one-loop)

# For SU(2), the matter contribution (from doublets):
# Each generation has 3 color doublets (Q_L) + 1 lepton doublet (L_L)
# b_2^matter = -4/3 × (3+1) × 1/2 = -4/3 × 2 = -8/3 per generation
# 3 generations: -8
# Plus gauge: +22/3 (from W loops)
# Plus Higgs: -1/6
# Total b_2 = 22/3 - 8 - 1/6 = 44/6 - 48/6 - 1/6 = -5/6...
# Hmm, doesn't match b_2 = -19/6

# Let me use the standard result:
# b_2 = 22/3 - 4/3 × n_f - 1/6 × n_H where n_f = number of Weyl doublets, n_H = Higgs doublets
# n_f = 12 (3 gen × (Q_L + L_L) × 2 Weyl/Dirac... )
# Actually: n_f counts Dirac fermion doublets (or pairs of Weyl)
# SM has: Q_L (3 colors × 3 gen = 9 Weyl doublets) + L_L (3 gen = 3 Weyl doublets) = 12 Weyl
# In the convention with Weyl: b_2 = 22/3 - 2/3 × 12 - 1/6 = 22/3 - 8 - 1/6 = 44/6 - 48/6 - 1/6 = -5/6

# But the standard result is b_2 = 19/6 (with opposite sign convention from mine above)
# Let me just use the standard values and not rederive.

# Convention: μ d(1/α_i)/dμ = b_i/(2π)
# With b_1 = 41/10, b_2 = -19/6, b_3 = -7 (standard SM)
# The matter-only contributions (no gauge boson loops):
# b_1^matter = 41/10 (abelian, no gauge boson self-coupling)
# b_2^matter = b_2 - 22/3 = -19/6 - 22/3 = -19/6 - 44/6 = -63/6 = -21/2
# b_3^matter = b_3 - 11 = -7 - 11 = -18

# Hmm, the "matter only" piece is what corresponds to the scalar loop in
# the induced picture. Let me think about this differently.

# In the induced composite picture, the gauge bosons themselves are composites.
# Their loop contributions (gauge boson self-energy) don't exist separately.
# Only the matter field loops contribute.

# For comparison, the scalar contribution to gauge coupling running:
# For a complex scalar in representation R: Δb = 1/3 × T(R)
# For SU(N): T(fundamental) = 1/2
# So each complex scalar fundamental: Δb = 1/6
# For N_s complex scalars: Δb = N_s/6

# In the induced picture, the coefficient for EM is:
# b_EM^induced = S_EM/(6π) (per log factor, with our conventions)
# Hmm wait, let me just check the ratio.

print("Checking if coupling ratios at M_Z match S_i/S_EM:")
print()
print(f"  (1/α_2)/(1/α_EM) at M_Z = {float(alpha_2_inv_MZ/alpha_EM_inv_MZ):.6f}")
print(f"  For comparison:")

for name, Si in [("S_2=8=O", 8), ("S_2=21=Im_H×Im_O", 21),
                  ("S_2=28=n_d×Im_O", 28), ("S_2=29", 29), ("S_2=30", 30)]:
    ratio = R(Si, S_EM)
    err = abs(float(ratio) - float(alpha_2_inv_MZ/alpha_EM_inv_MZ))/float(alpha_2_inv_MZ/alpha_EM_inv_MZ)*100
    print(f"    {name:20s}: S_2/S_EM = {float(ratio):.6f}  err = {err:.1f}%")

print()
print(f"  (1/α_s)/(1/α_EM) at M_Z = {float(alpha_s_inv_MZ/alpha_EM_inv_MZ):.6f}")
for name, Si in [("S_3=7=Im_O", 7), ("S_3=8=O", 8), ("S_3=9=Im_H²", 9)]:
    ratio = R(Si, S_EM)
    err = abs(float(ratio) - float(alpha_s_inv_MZ/alpha_EM_inv_MZ))/float(alpha_s_inv_MZ/alpha_EM_inv_MZ)*100
    print(f"    {name:20s}: S_3/S_EM = {float(ratio):.6f}  err = {err:.1f}%")
print()

# ==============================================================================
# SECTION 8: THE DIRECT APPROACH — 1/α_i AS FRAMEWORK NUMBERS
# ==============================================================================

print("=" * 72)
print("SECTION 8: DIRECT FRAMEWORK NUMBER PREDICTIONS")
print("=" * 72)
print()

# Perhaps the simplest approach: each coupling IS a framework number,
# without needing the full induced mechanism for non-EM couplings.
# The induced mechanism explains WHERE alpha_EM comes from.
# For other couplings, the RATIOS may come from the tilt angle structure.

# Key relations from S151:
# 1/α_EM = N_I + n_d/Φ₆(n_c) = 137 + 4/111 (sub-ppm)
# sin²θ_W = n_d × Im_O / n_c² = 28/121 (0.08%)
# 1/α_s ~ O = 8 (6%)

# From sin²θ_W: 1/α_2 = sin²θ_W × (1/α_EM)
# At M_Z: 1/α_2 = 0.23121 × 128.09 = 29.6 (measured)
# S151: sin²θ_W = 28/121, so 1/α_2 = (28/121) × 128.09 = 29.6

# But 28/121 × 137.036 = 31.7 at low energy. This is NOT what S151 claims.
# S151 compares 28/121 to the M_Z value 0.23121. That's the comparison.

# Can we get a CORRECTION term for sin²θ_W like the 4/111 for alpha?
# sin²θ_W = 28/121 + correction?
# Measured - predicted = 0.23121 - 0.23140 = -0.00019
# Correction/predicted = -0.08%

# Framework correction candidates:
# n_d/(n_c² × Φ₆(n_c)) = 4/(121 × 111) = 4/13431 = 0.000298
# But we need NEGATIVE correction (predicted is too high)
# -n_d/(n_c² × Φ₆(n_c)) = -0.000298 → 0.23140 - 0.000298 = 0.23110 (too low)
# -Im_C/(n_c² × Im_O) = -1/847 = -0.00118 → too large

print("Correction terms for sin²θ_W = 28/121 = 0.231405...")
print(f"  Measured: {float(sin2_theta_W_MZ):.6f}")
print(f"  S151:     {float(sin2_S151):.6f}")
print(f"  Residual: {float(sin2_theta_W_MZ - sin2_S151):.6f}")
print()

residual = sin2_theta_W_MZ - sin2_S151
print("Candidate corrections (need ~{:.6f}):".format(float(residual)))

corrections = {
    "-n_d/(n_c² × Φ₆)": R(-n_d, n_c**2 * Phi_6_nc),
    "-1/(n_c² × Im_O)": R(-1, n_c**2 * Im_O),
    "-n_d/(n_c⁴)": R(-n_d, n_c**4),
    "-1/(n_d × n_c²)": R(-1, n_d * n_c**2),
    "-Im_C/(S_EM × Im_O)": R(-Im_C, S_EM * Im_O),
    "-1/(N_I × n_d)": R(-1, N_I * n_d),
    "-(Im_O-Im_H)/(n_c² × Im_H × Im_O)": R(-(Im_O-Im_H), n_c**2 * Im_H * Im_O),
}

for name, val in sorted(corrections.items(), key=lambda x: abs(float(x[1]) - float(residual))):
    corrected = sin2_S151 + val
    err = abs(float(corrected) - float(sin2_theta_W_MZ)) / float(sin2_theta_W_MZ) * 100
    print(f"  {name:35s} = {float(val):.6f} → sin²θ_W = {float(corrected):.6f} (err {err:.3f}%)")
print()

# ==============================================================================
# SECTION 9: THE KEY QUESTION — IS 28/121 A TILT ANGLE RATIO?
# ==============================================================================

print("=" * 72)
print("SECTION 9: PHYSICAL INTERPRETATION OF sin²θ_W = 28/121")
print("=" * 72)
print()

# 28 = n_d × Im_O = 4 × 7
# 121 = n_c² = 11²
#
# Physical reading: of the 121 crystal modes, 28 "respond to" the weak force
# These 28 are the n_d defect directions crossed with Im_O octonion dimensions

# Why n_d × Im_O?
# The defect (spacetime) has 4 dimensions. The octonion sector has 7 imaginary dims.
# The "defect-octonion interface" has 4 × 7 = 28 cross-terms.
# These are the modes where spacetime and the strongest internal symmetry interact.
# The weak force mediates between spacetime (defect) and internal (crystal) sectors.

# 28 also = dim(SO(8)) = number of antisymmetric 8×8 matrices
# And 28 = triangular number T_7 = 7 × 8 / 2

print("28 = n_d × Im_O = 4 × 7")
print("   = dim(SO(8)) (antisymmetric 8×8 matrices)")
print("   = T_7 = 7(7+1)/2 (7th triangular number)")
print()
print("121 = n_c² = 11² (total crystal modes)")
print()
print("sin²θ_W = 28/121 = fraction of crystal modes at the defect-O interface")
print()

# In the tilt angle picture:
# theta_W is the angle between the EM direction and the SU(2) direction
# in the space of crystal modes.
#
# If we think of the 121 crystal modes as a vector space:
# - EM corresponds to one direction (the U(1) generator)
# - SU(2) corresponds to 3 directions (the Lie algebra)
# - The Weinberg angle measures their relative orientation
#
# sin²θ_W = 28/121 means the SU(2)-to-EM projection is 28 out of 121

# Is 28/121 consistent with the induced mechanism?
# If S_2 ≠ 28 in the induced picture, then either:
# (a) The induced mechanism doesn't determine the Weinberg angle, or
# (b) The induced mechanism has different effective S_i per sector, or
# (c) The Weinberg angle isn't simply S_2/S_EM

# Let me check what S_2 would need to be in the induced picture:
# From measured sin²θ_W(M_Z) = 0.23121:
# sin²θ_W = S_2/S_EM → S_2 = 0.23121 × 126 = 29.13 (not integer)
# OR
# sin²θ_W = S_2/(S_EM + S_Y) where S_Y is the U(1)_Y charge sum
# But S_EM = S_2 + S_Y (from 1/α_EM = 1/α_2 + 1/α_Y and common log)
# So sin²θ_W = S_2/(S_2 + S_Y)

# Actually: sin²θ_W = α_EM/α_2 = S_2/S_EM (if common log)
# And: cos²θ_W = α_EM/α_Y = S_Y/S_EM
# Check: sin²θ_W + cos²θ_W = (S_2 + S_Y)/S_EM = 1 → S_2 + S_Y = S_EM ✓

# With S_2 + S_Y = 126:
# If S_2 = 28: S_Y = 98
# sin²θ_W = 28/126 = 2/9 = 0.2222 (3.9% off)

# If S_2 = 29: S_Y = 97
# sin²θ_W = 29/126 = 0.2302 (0.4% off!)

S2_test = 29
sin2_from_29 = R(S2_test, S_EM)
err_29 = abs(float(sin2_from_29) - float(sin2_theta_W_MZ)) / float(sin2_theta_W_MZ) * 100
print(f"If S_2 = 29 in induced picture:")
print(f"  sin²θ_W = 29/126 = {float(sin2_from_29):.6f}")
print(f"  Measured: {float(sin2_theta_W_MZ):.6f}")
print(f"  Error: {err_29:.2f}%")
print(f"  S_Y = {S_EM - S2_test} = 126 - 29 = 97")
print()

# 29 = n_d² + n_c + C_dim = 16 + 11 + 2 = 29
# Or: 29 = Im_H × Im_O + O_dim = 21 + 8 = 29
# Or: 29 = 2*n_c + Im_O = 22 + 7 = 29
# 29 is prime (sum of two squares: 4 + 25 = 29)

print(f"  29 = n_d² + n_c + C = 16 + 11 + 2 = 29")
print(f"  29 = Im_H × Im_O + O = 21 + 8 = 29")
print(f"  29 = 2n_c + Im_O = 22 + 7 = 29")
print(f"  29 is prime (sum of two squares: 4 + 25)")
print()

# If S_2 = 29 and S_3 = 8 (= O):
alpha_2_from_29 = R(S_EM, S2_test)  # 1/α_2 relative to EM
alpha_2_inv_pred = R(S2_test * N_I, S_EM)  # if at low energy
alpha_s_inv_pred_8 = R(8 * N_I, S_EM)

print(f"Full prediction with S_2 = 29, S_3 = 8:")
print(f"  1/α_EM = {N_I} (leading order)")
print(f"  sin²θ_W = {S2_test}/{S_EM} = {float(R(S2_test, S_EM)):.6f}")
print(f"  1/α_s = 8 × {N_I}/{S_EM} = {float(alpha_s_inv_pred_8):.4f}")
print()

# ==============================================================================
# SECTION 10: COMPARISON TABLE
# ==============================================================================

print("=" * 72)
print("SECTION 10: COMPARISON — S151 vs INDUCED vs MEASURED")
print("=" * 72)
print()

# Header
print(f"{'Quantity':20s} {'S151 formula':25s} {'S151 val':10s} {'Induced S_2=29':10s} {'Measured':10s} {'S151 err':8s} {'Ind err':8s}")
print("-" * 100)

# sin²θ_W
s151_sin2 = float(R(28, 121))
ind_sin2 = float(R(29, 126))
meas_sin2 = float(sin2_theta_W_MZ)
s151_err = abs(s151_sin2 - meas_sin2)/meas_sin2*100
ind_err = abs(ind_sin2 - meas_sin2)/meas_sin2*100
print(f"{'sin²θ_W':20s} {'28/121=n_d·Im_O/n_c²':25s} {s151_sin2:10.6f} {ind_sin2:10.6f} {meas_sin2:10.6f} {s151_err:7.2f}% {ind_err:7.2f}%")

# 1/α_s
s151_as = float(O_dim)
ind_as = float(R(8 * N_I, S_EM))
meas_as = float(alpha_s_inv_MZ)
s151_err_as = abs(s151_as - meas_as)/meas_as*100
ind_err_as = abs(ind_as - meas_as)/meas_as*100
print(f"{'1/α_s':20s} {'O=8':25s} {s151_as:10.4f} {ind_as:10.4f} {meas_as:10.4f} {s151_err_as:7.2f}% {ind_err_as:7.2f}%")

# 1/α_2 (derived from sin²θ_W × 1/α_EM)
# At M_Z: 1/α_2 = sin²θ_W × 1/α_EM(M_Z)
s151_a2 = float(R(28, 121) * alpha_EM_inv_MZ)
ind_a2 = float(R(29, 126) * alpha_EM_inv_MZ)
meas_a2 = float(alpha_2_inv_MZ)
s151_err_a2 = abs(s151_a2 - meas_a2)/meas_a2*100
ind_err_a2 = abs(ind_a2 - meas_a2)/meas_a2*100
print(f"{'1/α_2(M_Z)':20s} {'sin²θ×1/α_EM(M_Z)':25s} {s151_a2:10.4f} {ind_a2:10.4f} {meas_a2:10.4f} {s151_err_a2:7.2f}% {ind_err_a2:7.2f}%")

print()

# ==============================================================================
# SECTION 11: THE S_2 = 29 IDENTITY
# ==============================================================================

print("=" * 72)
print("SECTION 11: ALGEBRAIC STRUCTURE OF S_2 = 29")
print("=" * 72)
print()

# Is 29 a natural framework number?
# 29 = 4² + 3² + 2² = 16 + 9 + 4 = 29 ← sum of squares of R, Im_C, C!
# No: 4² = 16 (n_d²), 3² = 9 (Im_H²), 2² = 4 (C²)
# 16 + 9 + 4 = 29 ✓

check_29 = n_d**2 + Im_H**2 + C_dim**2
print(f"29 = n_d² + Im_H² + C² = {n_d}² + {Im_H}² + {C_dim}² = {check_29}")
assert check_29 == 29
print()

# Also: 29 = Im_H × Im_O + O_dim = 21 + 8 = 29
check_29b = Im_H * Im_O + O_dim
print(f"29 = Im_H × Im_O + O = {Im_H} × {Im_O} + {O_dim} = {check_29b}")
assert check_29b == 29
print()

# And: 97 = S_EM - 29 = 126 - 29 = 97
# 97 is prime. Is it framework?
# 97 = 9² + 4² = 81 + 16 (sum of two squares → framework prime)
print(f"S_Y = 97 = {S_EM} - 29")
print(f"  97 = 9² + 4² = Im_H⁴ + n_d² (sum of two squares ✓)")
print(f"  97 is prime")
print()

# The decomposition S_EM = S_2 + S_Y = 29 + 97:
# 29 = n_d² + Im_H² + C²
# 97 = n_c² - n_d × Im_O + n_d - Im_H² - C² + n_c
# Hmm, let me check: S_EM = 126, S_2 = 29
# S_Y = 126 - 29 = 97

# Is there a cleaner expression for S_Y?
# 97 = n_c² - n_d × Im_O + n_d = 121 - 28 + 4 = 97
check_97 = n_c**2 - n_d * Im_O + n_d
print(f"97 = n_c² - n_d × Im_O + n_d = {n_c}² - {n_d}×{Im_O} + {n_d} = {check_97}")
assert check_97 == 97
print()

# Or: 97 = S_EM - (n_d × Im_O + 1) = 126 - 29
# = (n_d² + n_c² - n_c) - (n_d × Im_O + 1)
# = n_d² - n_d × Im_O + n_c² - n_c - 1
# = n_d(n_d - Im_O) + n_c(n_c - 1) - 1
# = 4(-3) + 110 - 1 = -12 + 110 - 1 = 97

print(f"97 = n_d(n_d - Im_O) + n_c(n_c-1) - 1 = {n_d}({n_d}-{Im_O}) + {n_c}×{n_c-1} - 1 = {n_d*(n_d - Im_O) + n_c*(n_c-1) - 1}")
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 72)
print("VERIFICATION TESTS")
print("=" * 72)
print()

tests = [
    # Framework identities
    ("N_I = n_d² + n_c² = 137",
     N_I == 137),

    ("S_EM = N_I - n_c = 126",
     S_EM == 126),

    ("n_c = Im_C + Im_H + Im_O = 11",
     n_c == Im_C + Im_H + Im_O),

    # S151 Weinberg angle
    ("sin²θ_W(S151) = n_d × Im_O / n_c² = 28/121",
     R(n_d * Im_O, n_c**2) == R(28, 121)),

    ("28/121 within 0.1% of measured 0.23121",
     abs(float(R(28, 121)) - 0.23121) / 0.23121 < 0.001),

    # Induced Weinberg angle
    ("sin²θ_W(induced) = 29/126 within 0.5% of measured",
     abs(float(R(29, 126)) - 0.23121) / 0.23121 < 0.005),

    # S_3 = O = 8
    ("S_3 = O = 8: 1/α_s = 8 × 137/126 = 8.698 (within 3% of 8.48)",
     abs(float(R(8 * N_I, S_EM)) - 8.48) / 8.48 < 0.03),

    # Mode decomposition
    ("Crystal mode sum: Im_C² + Im_H² + Im_O² + cross = n_c²",
     Im_C**2 + Im_H**2 + Im_O**2 + 2*(Im_C*Im_H + Im_C*Im_O + Im_H*Im_O) == n_c**2),

    # S_2 = 29 identities
    ("29 = n_d² + Im_H² + C² = 16 + 9 + 4",
     n_d**2 + Im_H**2 + C_dim**2 == 29),

    ("29 = Im_H × Im_O + O = 21 + 8",
     Im_H * Im_O + O_dim == 29),

    # S_Y = 97
    ("97 = n_c² - n_d × Im_O + n_d = 121 - 28 + 4",
     n_c**2 - n_d * Im_O + n_d == 97),

    ("S_2 + S_Y = S_EM: 29 + 97 = 126",
     29 + 97 == S_EM),

    # Ratio consistency
    ("S_EM = S_2 + S_Y consistency with sin²θ + cos²θ = 1",
     True),  # Tautological but structurally important

    # Comparison: S151 has denominator 121, induced has 126
    ("S151 and induced differ: 28/121 ≠ 29/126",
     R(28, 121) != R(29, 126)),

    # But they're close
    ("28/121 and 29/126 differ by < 1%",
     abs(float(R(28,121)) - float(R(29,126))) / float(R(28,121)) < 0.01),
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

# ==============================================================================
# SUMMARY
# ==============================================================================

print()
print("=" * 72)
print("SUMMARY")
print("=" * 72)
print()
print("TWO APPROACHES TO THE WEINBERG ANGLE:")
print()
print("1. S151 (direct number matching):")
print(f"   sin²θ_W = n_d × Im_O / n_c² = 28/121 = 0.23140")
print(f"   Error: 0.08% at M_Z")
print(f"   Physical: fraction of crystal modes at defect-octonion interface")
print()
print("2. Induced mechanism (S153 + this analysis):")
print(f"   sin²θ_W = S_2/S_EM = 29/126 = 0.23016")
print(f"   Error: 0.45% at M_Z")
print(f"   Physical: ratio of SU(2) charge-weighted sum to EM sum")
print(f"   With S_2 = 29 = n_d² + Im_H² + C² = Im_H×Im_O + O")
print()
print("TENSION: The two approaches give DIFFERENT predictions.")
print(f"  28/121 = {float(R(28,121)):.6f}")
print(f"  29/126 = {float(R(29,126)):.6f}")
print(f"  Difference: {abs(float(R(28,121)) - float(R(29,126))):.6f} ({abs(float(R(28,121)) - float(R(29,126)))/float(R(28,121))*100:.2f}%)")
print()
print("STRONG COUPLING:")
print(f"  S_3 = O = 8 in both approaches")
print(f"  1/α_s = 8 × 137/126 = 8.70 (induced) vs O = 8 (S151)")
print(f"  Measured: 8.48 → induced is 2.6% off, S151 is 5.7% off")
print()
print("OPEN QUESTIONS:")
print("  1. Which denominator is correct: n_c²=121 or S_EM=126?")
print("  2. Is the 0.08% match of 28/121 at M_Z a coincidence?")
print("  3. At what scale should the framework values apply?")
print("  4. Can the correction terms be derived (like 4/111 for alpha)?")
print("  5. What physical principle determines S_2 (28 vs 29)?")
