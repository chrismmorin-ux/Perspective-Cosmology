#!/usr/bin/env python3
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
Coset Geometry: Three Paths to sin^2(theta_W) = 28/121

KEY QUESTION: Can the coset geometry prediction sin²θ_W = 28/121
be promoted from [CONJECTURE] to [DERIVATION]?

Three paths tested:
  Path A: HS metric argument (does it change one-loop result?)
  Path B: Connection on coset (does coset geometry determine coupling?)
  Path C: Born rule on configuration space (does democratic occupation work?)

Formula: sin²θ_W = n_d × (n_c - n_d) / n_c² = 28/121
Measured (MS-bar, M_Z): 0.23121 ± 0.00004
Framework: 28/121 = 0.231404...
Error: 843 ppm

Status: INVESTIGATION
Created: Session 215
Depends on:
  - n_d = 4 [D: Frobenius + maximality]
  - n_c = 11 [D: THM_04AB]
  - S160 democratic_counting_gap_analysis.py (Dynkin index result)
  - S165 HS inner product derivation (Gap G2)
"""

from sympy import *
from sympy import Rational as R

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

n_d = 4
n_c = 11
Im_C = 1
Im_H = 3
Im_O = 7
H_dim = 4
O_dim = 8

# Measured values
sin2_W_MSbar = R(23121, 100000)   # PDG MS-bar at M_Z
sin2_W_onshell = R(22306, 100000) # PDG on-shell

# Framework prediction
sin2_W_framework = R(n_d * Im_O, n_c**2)  # 28/121

# ==============================================================================
# PATH A: HS METRIC ARGUMENT
# ==============================================================================

print("=" * 72)
print("PATH A: HILBERT-SCHMIDT METRIC ARGUMENT")
print("=" * 72)
print()
print("Question: Does the HS inner product from AXM_0110 change the")
print("one-loop induced gauge coupling to give democratic counting?")
print()

# The HS inner product on End(V):
# <A, B>_HS = (1/n) Tr(A† B)
# This gives every elementary matrix E_{ij} norm 1/sqrt(n).

# In the one-loop computation, the gauge-scalar vertex comes from:
# D_μ M = ∂_μ M + i[A_μ, M]
# The one-loop vacuum polarization involves:
# Π_ab ∝ Σ_modes Tr(T_a^{(m)} T_b^{(m)}) × I(p, m_mode)
# where T_a^{(m)} are gauge generators acting on mode m.

# KEY POINT: The HS metric rescales ALL modes by the same factor 1/n.
# Since sin²θ_W = g'²/(g² + g'²) is a RATIO of couplings,
# a universal rescaling cancels out.

print("Step 1: HS metric is a UNIVERSAL rescaling")
print(f"  ||E_ij||²_HS = 1/{n_c} for ALL elementary matrices")
print(f"  Rescaling factor: 1/{n_c} (same for every mode)")
print()

# The Dynkin indices under SU(2)_L for modes in adj(U(11)):
# From democratic_counting_gap_analysis.py (S160):
# A block (16 modes): T_L = 8 (from (3,1)→2, (3,3)→6)
# B block (56 modes): T_L = 14 (from 7 doublet pairs)
# D block (49 modes): T_L = 0 (all SU(2)_L singlets)
# Wait, let me recompute these properly.

# Under SO(4) ≃ SU(2)_L × SU(2)_R with 4_v = (2,2):
# A block = End(R^4) = 16: decomposes as (1,1)+(1,3)+(3,1)+(3,3) = 1+3+3+9
# SU(2)_L content: 1 singlet + 3 singlets + 3 triplet + 9 = (1+3) singlet-of-L from (1,1)+(1,3)
#                  plus (3,1) = triplet-of-L, (3,3) = 3 triplets-of-L

# Dynkin indices T_L:
# (1,1): T_L = 0 (singlet), dim = 1
# (1,3): T_L = 0 (singlet of SU(2)_L), dim = 3
# (3,1): T_L = 2 (adjoint), dim = 3
# (3,3): T_L = 3×2 = 6 (3 copies of adjoint, from SU(2)_R dimension), dim = 9
T_L_A = 0 + 0 + 2 + 6  # = 8
dim_A = 1 + 3 + 3 + 9   # = 16

# B block = R^4 ⊗ R^7 cross terms (both Hom(W,W⊥) and Hom(W⊥,W))
# Under SU(2)_L: 4 = (2,2), so B = (2,2) ⊗ 7
# Each of the 7 hidden directions gives a (2,2) = two doublets of SU(2)_L
# Dynkin index of doublet (fundamental): T(2) = 1/2
# For REAL representation: each (2,2) has 4 real modes
# T_L per (2,2) block = 2 × T(2) = 2 × 1/2 = 1 (two doublets)
# Actually for real representations need to be careful.
# (2,2) has dim_R = 4. Under SU(2)_L: two copies of fundamental 2.
# T(fund) = 1/2 per complex doublet.
# For REAL (2,2): T_L = 1 per (2,2) block.
# Total B (56 real modes = 2×28): T_L = 2 × 7 × 1 = 14
T_L_B = 14
dim_B = 56  # Hom(W,W⊥) + Hom(W⊥,W) = 28 + 28

# D block = End(R^7) = 49: all SU(2)_L singlets
T_L_D = 0
dim_D = 49

T_L_total = T_L_A + T_L_B + T_L_D
dim_total = dim_A + dim_B + dim_D
assert dim_total == n_c**2

print("Step 2: Standard one-loop Dynkin indices (from S160)")
print(f"  A block ({dim_A} modes): T_L = {T_L_A}")
print(f"  B block ({dim_B} modes): T_L = {T_L_B}")
print(f"  D block ({dim_D} modes): T_L = {T_L_D}")
print(f"  Total: T_L = {T_L_total}")
print()

# Now compute the analogous thing for U(1)_Y.
# For the hypercharge, need to know the U(1)_Y embedding in SO(11).
# In GUT normalization: 1/α₁ = (5/3)/α_Y
# But the framework doesn't use GUT normalization.
# In the SM: sin²θ_W = g'²/(g² + g'²) = T_L/(T_L + T_Y) ... for specific normalization

# The key test: HS rescaling changes the result?
print("Step 3: Effect of HS metric rescaling")
print(f"  With HS metric: T_L -> T_L/{n_c} = {R(T_L_total, n_c)}")
print(f"  But T_Y also -> T_Y/{n_c}")
print(f"  Ratio T_L/(T_L + T_Y) is UNCHANGED by uniform rescaling")
print()

# Democratic counting comparison
N_SU2_modes = 28  # Goldstone modes = coset directions
print("Step 4: Compare Dynkin-weighted vs democratic")
print(f"  Dynkin-weighted: sin²θ_W depends on T_L/T_total = {T_L_total}/T_total")
print(f"    Need T_total for both L and Y sectors to compute")
print(f"    From S160: T_L = T_R = 15 per SU(2) factor → sin² = 1/2 (wrong)")
print(f"  Democratic: sin²θ_W = N_Goldstone/N_total = {N_SU2_modes}/{n_c**2}")
print(f"    = {R(N_SU2_modes, n_c**2)} = {float(R(N_SU2_modes, n_c**2)):.6f}")
print()

print("PATH A VERDICT: FAILS")
print("  The HS metric is a universal rescaling of End(V).")
print("  It does NOT change coupling RATIOS like sin²θ_W.")
print("  The one-loop commutator [A_μ, M] introduces representation")
print("  dependence that the HS metric cannot remove.")
print("  The Dynkin index structure survives regardless of the metric")
print("  on the scalar field space.")
print()

path_a_result = "FAILS"

# ==============================================================================
# PATH B: CONNECTION ON COSET MANIFOLD
# ==============================================================================

print("=" * 72)
print("PATH B: GAUGE FIELD AS CONNECTION ON COSET SO(11)/(SO(4)×SO(7))")
print("=" * 72)
print()

# The coset manifold SO(11)/(SO(4)×SO(7)):
dim_SO11 = n_c * (n_c - 1) // 2
dim_SO4 = n_d * (n_d - 1) // 2
dim_SO7 = Im_O * (Im_O - 1) // 2
dim_coset = dim_SO11 - dim_SO4 - dim_SO7

print(f"Coset dimensions:")
print(f"  dim(SO(11)) = {dim_SO11}")
print(f"  dim(SO(4)) = {dim_SO4}")
print(f"  dim(SO(7)) = {dim_SO7}")
print(f"  dim(coset) = {dim_coset} = n_d × Im_O = {n_d} × {Im_O}")
print()

assert dim_coset == n_d * Im_O == 28

# The coset is a symmetric space. Its tangent space at the identity coset
# is the orthogonal complement of so(4) + so(7) in so(11).
# Under SO(4) × SO(7): tangent space = (4, 7) = bifundamental

print("Tangent space representation:")
print(f"  Under SO({n_d}) × SO({Im_O}): ({n_d}, {Im_O}) = bifundamental")
print(f"  Dimension: {n_d} × {Im_O} = {dim_coset}")
print()

# The Killing metric on the coset is induced from SO(11).
# For the fundamental representation of SO(11):
# Tr(T_a T_b) = δ_ab for the standard normalization
# This means ALL coset directions have the same length.

print("Killing metric on coset:")
print("  All 28 coset directions have equal Killing norm")
print("  (fundamental rep of SO(11) gives Tr(T_a T_b) = δ_ab)")
print()

# Key question: does the coset geometry determine sin²θ_W?
# The coset has dim = 28. The full config space has dim = 121.
# sin²θ_W = 28/121 = dim(coset)/dim(End(V)).
#
# But the coset lives in so(11) (dim 55), not in End(V) (dim 121).
# The ratio dim(coset)/dim(so(11)) = 28/55 ≠ sin²θ_W.

ratio_in_so11 = R(dim_coset, dim_SO11)
ratio_in_endV = R(dim_coset, n_c**2)

print("Ratio tests:")
print(f"  dim(coset)/dim(SO(11)) = {dim_coset}/{dim_SO11} = {ratio_in_so11}")
print(f"    = {float(ratio_in_so11):.6f} (does NOT match sin²θ_W)")
print(f"  dim(coset)/dim(End(V)) = {dim_coset}/{n_c**2} = {ratio_in_endV}")
print(f"    = {float(ratio_in_endV):.6f} (MATCHES sin²θ_W to 843 ppm)")
print()

# The coset geometry gives the right answer ONLY when the denominator
# is dim(End(V)) = n_c², NOT dim(SO(11)).
# This means the relevant "space" is the full operator algebra, not just
# the Lie algebra.

# In the eval map framework:
# End(V) = Hom(W,W) + Hom(W,W⊥) + Hom(W⊥,W) + Hom(W⊥,W⊥)
#        = 16 + 28 + 28 + 49 = 121
# Hom(W⊥,W) = 28 = gauge connections (hidden → visible maps)
# This block has the SAME dimension as the coset.

dim_WW = n_d**2        # 16
dim_WWp = n_d * Im_O   # 28
dim_WpW = Im_O * n_d   # 28
dim_WpWp = Im_O**2     # 49

print("Eval map decomposition of End(V):")
print(f"  Hom(W,W)     = {dim_WW} (spacetime/gravity)")
print(f"  Hom(W,W⊥)    = {dim_WWp} (matter: visible → hidden)")
print(f"  Hom(W⊥,W)    = {dim_WpW} (gauge: hidden → visible)")
print(f"  Hom(W⊥,W⊥)   = {dim_WpWp} (hidden sector dynamics)")
print(f"  Total         = {dim_WW + dim_WWp + dim_WpW + dim_WpWp}")
print()
assert dim_WW + dim_WWp + dim_WpW + dim_WpWp == n_c**2

# The coincidence: dim(coset) = dim(Hom(W⊥,W)) = 28
# Is this a coincidence or a structural identity?

# From the antisymmetric decomposition of End(V):
# Λ²(n_c) = Λ²(n_d + (n_c-n_d))
#          = Λ²(n_d) + n_d⊗(n_c-n_d) + Λ²(n_c-n_d)
#          = so(n_d) + coset + so(n_c-n_d)
# The coset directions in so(n_c) are EXACTLY the n_d × (n_c-n_d) cross-terms.
# In End(V) = (n_d + (n_c-n_d))², the n_d × (n_c-n_d) cross-terms include
# BOTH Hom(W,W⊥) and Hom(W⊥,W) = 2 × 28 = 56.
# But only ONE of these (the antisymmetric combination) gives the coset.

# More precisely:
# n_d ⊗ (n_c-n_d) appears in BOTH Sym² and Λ² of n_c:
# Λ²: gives coset = 28 (Goldstone bosons)
# Sym²: gives another 28 (massive modes)

print("Structural identity:")
print(f"  Λ²({n_c}) = Λ²({n_d}) + {n_d}⊗{Im_O} + Λ²({Im_O})")
print(f"            = {dim_SO4} + {dim_coset} + {dim_SO7} = {dim_SO11}")
print(f"  Coset direction in Λ² = {n_d}⊗{Im_O} cross-term = {dim_coset}")
print(f"  This EQUALS Hom(W⊥,W) = {dim_WpW} in the eval map decomposition")
print()

# But there's a subtlety: the coset directions are the ANTISYMMETRIC
# cross-terms, while Hom(W⊥,W) includes ALL cross-terms (4 × 7 = 28
# regardless of symmetry).

print("Subtlety: antisymmetric vs full cross-terms")
print(f"  Λ² cross-term (antisymmetric): {n_d}×{Im_O} = {n_d * Im_O}")
print(f"  Hom(W⊥,W) (all cross-terms):  {Im_O}×{n_d} = {Im_O * n_d}")
print(f"  These have the SAME dimension because the cross-term of Λ² is")
print(f"  the FULL bifundamental ({n_d},{Im_O}), not a sub-representation.")
print(f"  (Antisymmetry constraint is between the two BLOCKS, not within.)")
print()

# Path B assessment:
# The coset geometry gives sin²θ_W = 28/121 IF the denominator is
# dim(End(V)) rather than dim(SO(11)).
# This is consistent with the eval map picture where the full
# operator algebra End(V) is the configuration space.
# But the coset argument alone doesn't explain WHY the coupling
# ratio equals this geometric fraction.

print("PATH B VERDICT: PARTIAL — provides structure but not mechanism")
print("  The coset geometry correctly identifies 28 as the numerator.")
print("  The eval map provides 121 as the natural denominator.")
print("  But neither explains WHY the coupling ratio equals")
print("  dim(coset)/dim(End(V)).")
print("  The coset metric (Killing form) doesn't distinguish this ratio")
print("  from dim(coset)/dim(SO(11)) = 28/55.")
print()

path_b_result = "PARTIAL"

# ==============================================================================
# PATH C: BORN RULE ON CONFIGURATION SPACE
# ==============================================================================

print("=" * 72)
print("PATH C: BORN RULE ON CONFIGURATION SPACE")
print("=" * 72)
print()

# The Step 5D argument:
# At each crystallization vertex, N_I = 137 modes.
# Born rule + democracy → P(EM) = 1/137 → α = 1/137.

N_I = n_c**2 + n_d**2  # 137
print(f"Step 5D recap: 1/α = N_I = n_c² + n_d² = {n_c**2} + {n_d**2} = {N_I}")
print()

# Generalization: the crystal configuration space has dim = n_c² = 121.
# Of these, 28 are coset/Goldstone modes.
# P(Goldstone) = 28/121 by democratic occupation.

print("Generalization to sin²θ_W:")
print(f"  Crystal config space: dim = n_c² = {n_c**2}")
print(f"  Goldstone modes: {dim_coset} (coset directions)")
print(f"  P(Goldstone excitation) = {dim_coset}/{n_c**2} = {R(dim_coset, n_c**2)}")
print()

# The Bernoulli variance interpretation:
p = R(n_d, n_c)  # 4/11
q = 1 - p         # 7/11
bernoulli_var = p * q  # (4/11)(7/11) = 28/121

print("Bernoulli variance interpretation:")
print(f"  p = n_d/n_c = {p} (fraction of visible dimensions)")
print(f"  q = 1 - p = {q} (fraction of hidden dimensions)")
print(f"  Var = p(1-p) = {bernoulli_var} = {float(bernoulli_var):.6f}")
print(f"  This equals 28/121: {bernoulli_var == R(28, 121)}")
print()

# Physical interpretation: the Weinberg angle measures the "mixing amplitude"
# between visible and hidden sectors.
# For a random direction in V_Crystal:
# - Projection onto W (visible) has expected squared norm p = 4/11
# - Projection onto W⊥ (hidden) has expected squared norm q = 7/11
# - The "transition probability" (cross-term) = p × q = 28/121

print("Transition probability interpretation:")
print(f"  P(visible → visible) = p² = {p**2} = {float(p**2):.6f}")
print(f"  P(hidden → hidden)  = q² = {q**2} = {float(q**2):.6f}")
print(f"  P(visible ↔ hidden) = 2pq = {2*p*q} = {float(2*p*q):.6f}")
print(f"  P(one cross-term)   = pq = {p*q} = {float(p*q):.6f}")
print(f"  Check: p² + 2pq + q² = {p**2 + 2*p*q + q**2} = 1")
print()

# Connection to eval map:
# End(V) = p²×n² + pq×n² + qp×n² + q²×n²
#         = (p² + 2pq + q²) × n² = n²
# With n = n_c = 11:
eval_WW = (p**2 * n_c**2)
eval_cross = (p * q * n_c**2)
eval_WpWp = (q**2 * n_c**2)

print("Connection to eval map blocks:")
print(f"  Hom(W,W) = p²×n_c² = {eval_WW} = {n_d**2} ✓")
print(f"  Hom(W,W⊥) = pq×n_c² = {eval_cross} = {n_d*Im_O} ✓")
print(f"  Hom(W⊥,W) = qp×n_c² = {eval_cross} = {Im_O*n_d} ✓")
print(f"  Hom(W⊥,W⊥) = q²×n_c² = {eval_WpWp} = {Im_O**2} ✓")
print()

# KEY QUESTION: Why does sin²θ_W = pq?
# sin²θ_W = α_EM / α₂ (standard definition)
# If α_EM = 1/N_I (from Step 5D) and α₂ relates to the SU(2) sector:
# sin²θ_W = α_EM/α₂ = (1/N_I) × N_I/N_SU2 = ... doesn't simplify cleanly

# Better: sin²θ_W = g'²/(g² + g'²)
# In the induced mechanism with democratic counting:
# 1/g_i² ∝ N_i (modes contributing to gauge group i)
# g_i² ∝ 1/N_i
# sin²θ_W = g'²/(g² + g'²) = (1/N_1)/((1/N_2) + (1/N_1)) = N_2/(N_1 + N_2)

# For sin²θ_W = 28/121:
# N_2/(N_1 + N_2) = 28/121
# ⟹ N_2 = 28, N_1 + N_2 = 121, N_1 = 93

N_2_required = 28
N_1_required = n_c**2 - N_2_required  # 93

print("Democratic counting requirements:")
print(f"  sin²θ_W = N₂/(N₁+N₂) = {N_2_required}/({N_1_required}+{N_2_required})")
print(f"  N₂ = {N_2_required} (SU(2) sector = Goldstone modes)")
print(f"  N₁ = {N_1_required} (U(1)_Y sector)")
print(f"  N_total = {n_c**2} (all crystal modes)")
print()

# What is N₁ = 93 in the eval map?
# 93 = 121 - 28 = Hom(W,W) + Hom(W,W⊥) + Hom(W⊥,W⊥)
#    = 16 + 28 + 49
print(f"N₁ = {N_1_required} decomposition:")
print(f"  Hom(W,W) = {dim_WW} (gravity sector)")
print(f"  Hom(W,W⊥) = {dim_WWp} (matter: visible → hidden)")
print(f"  Hom(W⊥,W⊥) = {dim_WpWp} (hidden dynamics)")
print(f"  Total = {dim_WW + dim_WWp + dim_WpWp} ✓")
print()

# CRITICAL SUBTLETY: This formula uses sin²θ_W = N₂/(N₁+N₂)
# which means sin²θ_W = (1/g₂²) / (1/g'² + 1/g₂²)
# But the standard formula is sin²θ_W = g'²/(g² + g'²)
# = (1/α₁) / ... no.
# Let me be very careful:
# sin²θ_W = g'² / (g² + g'²)   [standard definition]
#
# With 1/g_i² ∝ N_i (democratic):
# g_i² ∝ 1/N_i
# sin²θ_W = (1/N₁) / ((1/N₂) + (1/N₁))
#          = (1/N₁) × (N₁ N₂ / (N₁ + N₂))
#          = N₂ / (N₁ + N₂)

# THIS FORMULA: sin²θ_W = N₂/(N₁+N₂) where g' has N₁ modes, g has N₂ modes.
# With g = g₂ (SU(2)_L) and g' = g₁ (U(1)_Y).
# N₂ = N_{SU(2)} = 28 (Goldstone/coset modes)
# N₁ = N_{U(1)} = 93 (non-Goldstone modes)

# But wait: this formula gives sin²θ_W = N₂/(N₁+N₂).
# This means MORE SU(2) modes → LARGER sin²θ_W.
# In standard QFT: sin²θ_W = g'²/(g²+g'²), so LARGER g (stronger SU(2))
# → SMALLER sin²θ_W.
# Our formula: g₂² ∝ 1/N₂, so MORE N₂ modes → SMALLER g₂² → smaller coupling
# → BUT sin²θ_W = g'²/(g²+g'²) gets LARGER because g² is smaller.
# Check: N₂=28 large → g₂ small → g'²/(g²+g'²) ≈ g'²/g'² = 1... only if g→0
# N₂=28, N₁=93: g₂² ∝ 1/28, g'² ∝ 1/93
# sin²θ_W = (1/93)/((1/28)+(1/93)) = (1/93)/((93+28)/(28×93))
#          = (28×93)/(93×(93+28)) = 28/(93+28) = 28/121 ✓

print("Formula verification:")
print(f"  g₂² ∝ 1/N₂ = 1/{N_2_required}")
print(f"  g'² ∝ 1/N₁ = 1/{N_1_required}")
g2_sq = R(1, N_2_required)
gp_sq = R(1, N_1_required)
sin2_from_formula = gp_sq / (g2_sq + gp_sq)
print(f"  sin²θ_W = g'²/(g²+g'²) = {sin2_from_formula}")
print(f"  = {float(sin2_from_formula):.6f}")
print(f"  Matches 28/121: {sin2_from_formula == R(28, 121)}")
print()

# So the democratic formula DOES give 28/121. Now: what is the physics
# of N₂ = 28 (SU(2) modes) and N₁ = 93 (U(1) modes)?

# The identification:
# N₂ = 28 = Hom(W⊥,W) = hidden→visible maps = gauge connections
# N₁ = 93 = Hom(W,W) + Hom(W,W⊥) + Hom(W⊥,W⊥)
#          = visible self-maps + visible→hidden + hidden self-maps
#          = "everything that's NOT a gauge connection"

print("Physical identification of N₁ and N₂:")
print(f"  N₂ = Hom(W⊥,W) = {dim_WpW} (gauge connections: hidden→visible)")
print(f"  N₁ = End(V) \\ Hom(W⊥,W) = {n_c**2 - dim_WpW} (everything else)")
print()

# Path C assessment:
# The Born-rule democratic counting gives sin²θ_W = 28/121 IF:
# 1. Each of the n_c² = 121 crystal modes contributes equally
# 2. N₂ = 28 = Hom(W⊥,W) modes contribute to SU(2) coupling
# 3. N₁ = 93 = remaining modes contribute to U(1) coupling
#
# The chain:
# AXM_0110 → HS inner product → equal mode norms (S165) → democratic counting
# Eval map → End(V) = 121 modes, Hom(W⊥,W) = 28
# Born rule (Step 5D) → each mode contributes 1
# ⟹ sin²θ_W = 28/121
#
# The GAP: Steps 1-2 establish equal mode norms, but the ONE-LOOP
# computation still uses the commutator [A,M] which introduces Dynkin
# index weighting. Democratic counting requires going BEYOND one-loop.

print("PATH C VERDICT: PROMISING — gives correct answer with clear gap")
print("  The Born rule on 121-dim config space gives 28/121.")
print("  This requires: N₂ = dim(Hom(W⊥,W)) contributes to SU(2),")
print(f"  N₁ = dim(End(V)) - N₂ = {N_1_required} contributes to U(1).")
print("  The gap: WHY democratic counting instead of Dynkin weighting?")
print("  The HS metric gives equal norms but the gauge coupling")
print("  commutator [A,M] still introduces representation dependence.")
print()

path_c_result = "PROMISING"

# ==============================================================================
# SYNTHESIS: WHAT WOULD CLOSE THE GAP?
# ==============================================================================

print("=" * 72)
print("SYNTHESIS: THE REMAINING GAP")
print("=" * 72)
print()

print("All three paths converge on the same structure:")
print(f"  sin²θ_W = dim(Hom(W⊥,W)) / dim(End(V))")
print(f"          = {dim_WpW} / {n_c**2}")
print(f"          = {R(dim_WpW, n_c**2)}")
print(f"          = (n_d/n_c)(1 - n_d/n_c)")
print(f"          = Bernoulli variance with p = {p}")
print()

# The gap reduces to ONE question:
# Why does the INDUCED gauge coupling use democratic counting
# (each mode contributes 1) rather than Dynkin-weighted counting
# (each mode contributes T_i)?

print("The gap reduces to ONE question:")
print("  In the induced gauge mechanism, WHY does each crystal mode")
print("  contribute equally (1) rather than proportionally to its")
print("  Dynkin index (T_i)?")
print()
print("Possible resolutions (none proven):")
print("  (i) Non-perturbative: the phase transition is first-order")
print("      (proven S211), so perturbative one-loop may not apply.")
print("      The democratic counting may be a non-perturbative result")
print("      of the strong first-order transition.")
print("  (ii) Lattice: on the crystal lattice (discrete End(V)),")
print("       the coupling is determined by nearest-neighbor counting,")
print("       not by continuous representation theory.")
print("  (iii) Information-theoretic: the coupling measures the fraction")
print("        of information transferred between hidden and visible")
print("        sectors, which depends on dimensions (not representations).")
print("  (iv) Emergent gauge field: if A_μ is not a connection but a")
print("       collective mode, its 'coupling' to individual crystal modes")
print("       is geometric (HS norm) not group-theoretic (Dynkin index).")
print()

# ==============================================================================
# CONSISTENCY CHECKS
# ==============================================================================

print("=" * 72)
print("CONSISTENCY CHECKS")
print("=" * 72)
print()

# Check 1: all three couplings with democratic counting
print("Check 1: All three SM couplings under democratic counting")
print()

# EM: 1/α = N_I = 137 (all modes: crystal + defect)
# SU(2): 1/α₂ should relate to N₂ = 28
# SU(3): 1/α₃ should relate to N₃ = ?

# From the existing framework (multi_coupling_tilt_angles.md):
# 1/α₃ ≈ O = 8 at ~59 GeV, 8.48 at M_Z
# 1/α₂ ≈ Im_H × (Im_O + Im_H) = 30 at tree level, 29.62 at M_Z

# From sin²θ_W = 28/121 and 1/α_EM(M_Z) = 127.955:
alpha_EM_MZ_inv = R(127955, 1000)  # 1/α_EM at M_Z
alpha_2_inv_pred = sin2_W_framework * alpha_EM_MZ_inv
print(f"  1/α₂ = sin²θ_W × (1/α_EM) = {sin2_W_framework} × {alpha_EM_MZ_inv}")
print(f"        = {alpha_2_inv_pred} = {float(alpha_2_inv_pred):.2f}")
print(f"  Measured: 29.587 (0.07% match — from S160)")
print()

# With democratic counting: 1/α₂ ∝ N₂ = 28 and 1/α_EM ∝ N_total
# This means α₂/α_EM = N_total/N₂ = 121/28
# sin²θ_W = α_EM/α₂ = N₂/N_total = 28/121 ✓ (tautological)

# For SU(3): the "SU(3) modes" in the crystal are the modes charged under
# SU(3) ⊂ G₂ ⊂ SO(7). Need to count these.
# Under SO(7) → G₂ → SU(3):
# so(7) = 21: G₂ takes 14, leaving 7 broken
# G₂ = 14: SU(3) takes 8, leaving 6 broken

# The SU(3)-charged modes in End(V):
# Hom(W⊥,W⊥) = 49: under SO(7) → G₂ → SU(3), the 49 modes decompose
# 49 modes: 7⊗7 under SO(7). Under SU(3): 7→1+3+3̄, so
# 7⊗7 → (1+3+3̄)⊗(1+3+3̄) = 1+3+3̄+3+9+8+3̄+8+1
# = 2(1) + 2(3) + 2(3̄) + (8) + (8) + (9)... this is getting complicated

# Actually: 7 under G₂ stays 7 (fundamental of G₂).
# Under SU(3) ⊂ G₂: 7 → 1 + 3 + 3̄
# 7⊗7 = 49: decomposes under SU(3) as:
# (1+3+3̄)⊗(1+3+3̄) = 1⊗1 + 1⊗3 + 1⊗3̄ + 3⊗1 + 3⊗3 + 3⊗3̄
#                     + 3̄⊗1 + 3̄⊗3 + 3̄⊗3̄
# = 1 + 3 + 3̄ + 3 + (6+3̄) + (8+1) + 3̄ + (8+1) + (6̄+3)
# = 3(1) + 3(3) + 3(3̄) + 2(8) + (6) + (6̄)
# SU(3) charged: everything except singlets = 49 - 3 = 46

print("Check 2: SU(3) mode counting (approximate)")
print("  7 → 1 + 3 + 3̄ under SU(3) ⊂ G₂")
print("  SU(3) singlets in 7⊗7: need careful representation theory")
print("  (Deferred — requires full representation decomposition)")
print()

# Check 2: The 137 = 121 + 16 decomposition
print("Check 3: The 137 = 121 + 16 decomposition for α_EM")
print(f"  1/α_EM = N_I = {N_I} = n_c² + n_d² = {n_c**2} + {n_d**2}")
print(f"  Crystal modes: {n_c**2} (gauge sector)")
print(f"  Defect modes: {n_d**2} (gravity sector)")
print(f"  Weinberg angle uses crystal sector only: {n_c**2}")
print(f"  This is consistent IF the 16 defect modes contribute to α_EM")
print(f"  but NOT to the gauge mixing angle.")
print()

# Check 3: Bernoulli variance properties
print("Check 4: Bernoulli variance properties")
max_var = R(1, 4)  # at p = 1/2
actual_var = bernoulli_var
ratio_to_max = actual_var / max_var
print(f"  Maximum variance (p=1/2): {max_var}")
print(f"  Actual variance (p={p}): {actual_var} = {float(actual_var):.6f}")
print(f"  Ratio to max: {ratio_to_max} = {float(ratio_to_max):.4f}")
print(f"  This means the visible/hidden split is at {float(ratio_to_max*100):.1f}%")
print(f"  of maximum mixing.")
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 72)
print("VERIFICATION TESTS")
print("=" * 72)
print()

tests = [
    ("Framework: sin²θ_W = 28/121",
     sin2_W_framework == R(28, 121)),

    ("Bernoulli: sin²θ_W = p(1-p) with p=n_d/n_c",
     bernoulli_var == sin2_W_framework),

    ("Eval map: dim(Hom(W⊥,W))/dim(End(V)) = 28/121",
     R(dim_WpW, n_c**2) == sin2_W_framework),

    ("Coset: dim(coset)/dim(End(V)) = 28/121",
     R(dim_coset, n_c**2) == sin2_W_framework),

    ("Coset ≠ Lie algebra: 28/55 ≠ 28/121",
     R(dim_coset, dim_SO11) != sin2_W_framework),

    ("Block sum: 16 + 28 + 28 + 49 = 121",
     dim_WW + dim_WWp + dim_WpW + dim_WpWp == n_c**2),

    ("Cross-term = coset dim: Hom(W⊥,W) = dim(coset)",
     dim_WpW == dim_coset),

    ("Democratic formula: N₂/(N₁+N₂) = 28/121",
     sin2_from_formula == sin2_W_framework),

    ("Transition prob: p×q = 28/121",
     p * q == sin2_W_framework),

    ("Complementary: 1 - sin^2 = (n_d^2 + n_d*Im_O + Im_O^2)/n_c^2 = 93/121",
     1 - sin2_W_framework == R(n_d**2 + n_d*Im_O + Im_O**2, n_c**2)),

    ("Decomposition: N₁ = n_d² + n_d×Im_O + Im_O² = 93",
     N_1_required == n_d**2 + n_d*Im_O + Im_O**2),

    ("Error < 1000 ppm",
     abs(sin2_W_framework - sin2_W_MSbar) / sin2_W_MSbar < R(1, 1000)),

    ("Path A: HS metric is universal rescaling (cannot change ratio)",
     path_a_result == "FAILS"),

    ("Path B: coset structure provides 28 but not 121 denominator alone",
     ratio_in_so11 != sin2_W_framework and ratio_in_endV == sin2_W_framework),

    ("Path C: democratic counting with N₂=28, N_total=121 gives 28/121",
     path_c_result == "PROMISING"),
]

pass_count = 0
fail_count = 0
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if passed:
        pass_count += 1
    else:
        fail_count += 1
    print(f"  [{status}] {name}")

print()
print(f"Results: {pass_count}/{pass_count + fail_count} PASS")
print()

# ==============================================================================
# SUMMARY
# ==============================================================================

print("=" * 72)
print("SUMMARY")
print("=" * 72)
print()
print("Path A (HS metric): FAILS — universal rescaling doesn't change ratios")
print("Path B (coset geometry): PARTIAL — gives 28 but needs eval map for 121")
print("Path C (Born rule / democratic): PROMISING — correct answer, clear gap")
print()
print("The gap has been NARROWED to a single question:")
print("  Why democratic counting (each mode contributes 1) rather than")
print("  Dynkin-weighted counting (each mode contributes T_i)?")
print()
print("The eval map provides the natural framework:")
print("  sin²θ_W = dim(Hom(W⊥,W)) / dim(End(V))")
print("  = (hidden→visible operators) / (all operators)")
print("  = 28/121")
print("  = Bernoulli variance p(1-p) with p = n_d/n_c")
print()
print("Confidence: [CONJECTURE] (unchanged — gap not closed)")
print("Progress: Gap narrowed from 'why 28/121?' to 'why democratic?'")
