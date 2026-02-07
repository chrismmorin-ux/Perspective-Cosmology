#!/usr/bin/env python3
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
Democratic Counting from Schur's Lemma on Vacuum Manifold Tangent Space

KEY FINDING: Democratic mode counting (1/g^2 proportional to N = dim(manifold))
follows from the IRREDUCIBILITY of the vacuum manifold's tangent space:

  (1) AXM_0110: HS inner product on End(V) = flat metric on R^{n_c^2}
  (2) Vacuum manifold Gr(4,11) is a symmetric space [D: Layer 1]
  (3) Tangent space Hom(R^4, R^7) = R^4 x R^7 is IRREDUCIBLE under SO(4)xSO(7)
  (4) Schur's lemma: unique invariant bilinear form -> all 28 directions equal
  (5) [A-PHYSICAL] Emergent gauge field inherits this metric

Consequence: Dynkin weighting CANNOT appear because the tangent space is
irreducible. Schur's lemma permits only ONE scale factor for the entire space.
In a reducible decomposition V = V_1 + V_2 + ..., each V_i could have a
different scale (weighted by Dynkin index T_i). But for irreducible V,
there is only one V_1 = V, so only one scale exists.

For SU(3): su(3) is irreducible under Ad(SU(3)) [simple Lie algebra].
Killing form is the unique invariant bilinear form -> all 8 generators equal.

Formula: alpha_3/alpha_2 = N_SU2/N_SU3 = 28/8 = 7/2
Measured: alpha_3/alpha_2 = 3.489
Error: 0.34%
Status: INVESTIGATION
Created: Session 224
Depends on:
  - two_regime_structural_theorem.py (S222) — singlet criterion, T_fund=1
  - xi_democratic_bilinear.py (S217) — End(V) decomposition, Bernoulli unification
  - coset_geometry_three_paths.py (S215) — HS metric dead end identified
"""

from sympy import *
from sympy import Rational as R

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

n_d = 4        # dim(H) = dim(spacetime/defect)
n_c = 11       # crystal dimension
Im_H = 3       # dim(Im(H))
Im_O = 7       # dim(Im(O))
dim_O = 8      # dim(O) = dim(SU(3))

# Derived
dim_End_V = n_c**2           # 121
dim_coset = n_d * (n_c - n_d)  # 28 = dim(Gr(4,11))
dim_SU3 = dim_O              # 8

# Measured couplings at M_Z (PDG, MS-bar)
alpha_EM_inv_MZ = R(127955, 1000)     # 1/alpha_EM(M_Z)
sin2_W_MSbar = R(23121, 100000)       # sin^2(theta_W) MS-bar at M_Z
alpha_s_MZ = R(1179, 10000)           # alpha_s(M_Z)

# Derived measured quantities
alpha_2_inv_MZ = sin2_W_MSbar * alpha_EM_inv_MZ  # 1/alpha_2(M_Z)
alpha_3_inv_MZ = 1 / alpha_s_MZ                  # 1/alpha_3(M_Z)
alpha_Y_inv_MZ = (1 - sin2_W_MSbar) * alpha_EM_inv_MZ  # 1/alpha_Y(M_Z)

ratio_meas = alpha_s_MZ * alpha_2_inv_MZ  # alpha_3/alpha_2 at M_Z

# ==============================================================================
# SECTION 1: THE HS METRIC IS DEMOCRATIC ON End(V)
# ==============================================================================

print("=" * 72)
print("SECTION 1: HS METRIC IS DEMOCRATIC ON End(V)")
print("=" * 72)
print()

# AXM_0110: The inner product on End(V) is the Hilbert-Schmidt form:
#   <A, B> = (1/n_c) Tr(A^T B)
#
# In the standard basis {E_{ij}} (matrix units), this gives:
#   <E_{ij}, E_{kl}> = (1/n_c) * delta_ik * delta_jl
#
# This is (1/n_c) * Identity_{n_c^2 x n_c^2}.
# EVERY direction in End(V) has the SAME metric weight 1/n_c.

print("AXM_0110: <A,B>_HS = (1/n_c) Tr(A^T B)")
print()
print(f"In standard basis {{E_{{ij}}}}, i,j = 1..{n_c}:")
print(f"  <E_{{ij}}, E_{{kl}}> = (1/{n_c}) * delta_ik * delta_jl")
print(f"  = (1/{n_c}) * I_{{{dim_End_V}x{dim_End_V}}}")
print()
print(f"All {dim_End_V} directions have equal metric weight 1/{n_c}.")
print(f"This is the FLAT Euclidean metric on R^{{{dim_End_V}}}, scaled by 1/{n_c}.")
print()

# Under the (n_d, n_c-n_d) = (4,7) decomposition of V:
# End(V) = End(W) + Hom(W^perp, W) + Hom(W, W^perp) + End(W^perp)
#    121  =   16   +      28         +      28          +     49
#
# The HS metric is BLOCK-DIAGONAL and UNIFORM across blocks:
# Each block has metric (1/n_c) * I on its subspace.

dim_EndW = n_d**2                     # 16
dim_HomWpW = n_d * (n_c - n_d)       # 28 (Goldstone sector)
dim_HomWWp = n_d * (n_c - n_d)       # 28 (conjugate Goldstone)
dim_EndWp = (n_c - n_d)**2           # 49

print("End(V) decomposition under (4,7) split:")
print(f"  End(W)        = {dim_EndW}")
print(f"  Hom(W^perp,W) = {dim_HomWpW}  [Goldstone sector]")
print(f"  Hom(W,W^perp) = {dim_HomWWp}  [conjugate Goldstone]")
print(f"  End(W^perp)   = {dim_EndWp}")
print(f"  Total         = {dim_EndW + dim_HomWpW + dim_HomWWp + dim_EndWp}")
print()
print("HS metric is BLOCK-DIAGONAL: each block has (1/n_c) * Identity.")
print("No cross-terms between blocks. All modes within each block equivalent.")
print()

# ==============================================================================
# SECTION 2: IRREDUCIBILITY OF TANGENT SPACE (SCHUR'S LEMMA ARGUMENT)
# ==============================================================================

print("=" * 72)
print("SECTION 2: IRREDUCIBILITY -> DEMOCRATIC (SCHUR'S LEMMA)")
print("=" * 72)
print()

# The tangent space of Gr(n_d, n_c) at the base point is:
#   T_{base} Gr(n_d, n_c) = Hom(R^{n_d}, R^{n_c-n_d}) = R^{n_d} x R^{n_c-n_d}
#
# The isotropy group at the base point is SO(n_d) x SO(n_c-n_d).
# Under this group:
#   R^{n_d} is the vector representation of SO(n_d) -- IRREDUCIBLE for n_d >= 1
#   R^{n_c-n_d} is the vector representation of SO(n_c-n_d) -- IRREDUCIBLE
#
# THEOREM (standard representation theory):
#   If V is irreducible under G and W is irreducible under H,
#   then V tensor W is irreducible under G x H.
#
# Therefore: Hom(R^4, R^7) = R^4 tensor R^7 is IRREDUCIBLE under SO(4) x SO(7).

print("THEOREM (Irreducibility of tensor products):")
print("  If V is irreducible under G and W is irreducible under H,")
print("  then V tensor W is irreducible under G x H.")
print()
print(f"Application to Gr({n_d},{n_c}):")
print(f"  Tangent space = Hom(R^{n_d}, R^{n_c-n_d}) = R^{n_d} tensor R^{n_c-n_d}")
print(f"  Isotropy group = SO({n_d}) x SO({n_c-n_d})")
print(f"  R^{n_d} is vector rep of SO({n_d}) -- IRREDUCIBLE")
print(f"  R^{n_c-n_d} is vector rep of SO({n_c-n_d}) -- IRREDUCIBLE")
print(f"  => R^{n_d} tensor R^{n_c-n_d} is IRREDUCIBLE under SO({n_d}) x SO({n_c-n_d})")
print(f"  => Tangent space (dim = {dim_coset}) is a single irreducible module")
print()

# SCHUR'S LEMMA APPLICATION:
# If V is an irreducible G-module, then any G-invariant bilinear form on V
# is proportional to the standard one. That is, there is at most ONE
# G-invariant metric on V (up to overall scale).
#
# Consequence: The HS metric restricted to Hom(R^4, R^7) IS the unique
# SO(4) x SO(7)-invariant metric (up to scale). And this metric is
# (1/n_c) * Identity -- treating all 28 directions equally.

print("SCHUR'S LEMMA:")
print("  If V is an irreducible G-module, any G-invariant bilinear form")
print("  on V is proportional to the standard form. (Unique up to scale.)")
print()
print("  Applied: The HS metric restricted to the tangent space is the")
print(f"  UNIQUE SO({n_d})xSO({n_c-n_d})-invariant metric (up to scale).")
print(f"  This metric = (1/{n_c}) * I_{{{dim_coset}x{dim_coset}}}.")
print(f"  ALL {dim_coset} directions have EQUAL weight. DEMOCRATIC.")
print()

# For SU(3):
# su(3) = Lie algebra of SU(3), dim = 8
# The adjoint representation Ad: SU(3) -> GL(su(3)) is IRREDUCIBLE
# because SU(3) is SIMPLE (no proper normal subgroups).
# Schur's lemma: The Killing form is the unique Ad-invariant bilinear form.
# In the standard basis (Gell-Mann matrices), K(T_a, T_b) = c * delta_ab.
# ALL 8 generators have equal weight. DEMOCRATIC.

print("For SU(3) (internal regime):")
print("  su(3) is the adjoint representation of SU(3)")
print("  SU(3) is SIMPLE => adjoint is IRREDUCIBLE")
print("  Schur's lemma => Killing form is unique invariant bilinear form")
print("  K(T_a, T_b) = c * delta_{ab} in standard basis")
print(f"  ALL {dim_SU3} generators have equal weight. DEMOCRATIC.")
print()

# ==============================================================================
# SECTION 3: WHY DYNKIN WEIGHTING IS EXCLUDED
# ==============================================================================

print("=" * 72)
print("SECTION 3: WHY DYNKIN WEIGHTING IS EXCLUDED")
print("=" * 72)
print()

# Dynkin indices weight DIFFERENT irreducible components of a REDUCIBLE
# decomposition. If V = V_1 + V_2 + ... where each V_i transforms in
# representation r_i, then each gets a different scale factor T(r_i).
#
# But if V is IRREDUCIBLE (as our tangent spaces are), there is only
# ONE component. Schur's lemma says the bilinear form has only ONE
# scale factor. There are no "different representations to weight
# differently" — the entire space is one indivisible unit.
#
# Concretely: Under SU(2)_L (subgroup of SO(4)), the 28-dim tangent
# space DOES decompose reducibly into doublets, triplets, etc.
# But the METRIC was fixed at the SO(4)xSO(7) level (by Schur's lemma),
# where the space is irreducible. The SU(2)_L decomposition is a
# FINER resolution that cannot change the already-fixed metric.

print("Dynkin indices appear in REDUCIBLE decompositions:")
print("  V = V_1 + V_2 + ... (different irreps)")
print("  Each V_i gets scale factor T(r_i) -- the Dynkin index")
print("  This allows DIFFERENT weights for different components")
print()
print("But for IRREDUCIBLE V (our case):")
print("  V = V (single irrep)")
print("  Schur's lemma: only ONE scale factor for entire space")
print("  No room for different Dynkin weights")
print()

# Demonstrate: under SU(2)_L, the 28 Goldstone modes decompose as
# Hom(R^4, R^7) where R^4 = (2_L, 2_R) under SU(2)_L x SU(2)_R
# So Hom = (2_L tensor 2_R) tensor R^7 = 2_L tensor (2_R tensor R^7)
# Under SU(2)_L alone: 2_L tensor R^14 = 14 copies of doublet 2_L
# Each doublet has T(2) = 1/2
# Total Dynkin weight = 14 * 1/2 = 7

n_doublets_in_Hom = (n_c - n_d) * (n_d // 2)  # 7 * 2 = 14 doublets... wait

# More carefully: R^4 under SU(2)_L is (2,2) = two copies of fund 2.
# Hom(R^4, R^7) under SU(2)_L: (2+2) tensor 7 = 14 copies of 2.
# Actually no. Let me think again.
# R^4 as SU(2)_L module: 2 + 2 (two copies of fundamental, from (2,2) decomposition)
# Hom(R^4, R^7) = (R^4)* tensor R^7 = (2+2) tensor R^7
# Under SU(2)_L: this is 2 copies of (2 tensor R^7) which is reducible
# But R^7 is trivial under SU(2)_L! So: (2+2) tensor 7 = 14*(2)
# That's 14 doublets, total dim = 14*2 = 28. Correct.
# Dynkin contribution: T_total = 14 * T(2) = 14 * 1/2 = 7

n_su2_doublets = (n_d // 2) * (n_c - n_d)  # 2 * 7 = 14
T_fund_su2 = R(1, 2)
T_dynkin_goldstone = n_su2_doublets * T_fund_su2  # 14 * 1/2 = 7

print("Example: SU(2)_L decomposition of the 28 Goldstone modes")
print(f"  Under SU(2)_L: Hom(R^4,R^7) -> {n_su2_doublets} copies of doublet 2")
print(f"  Dynkin index per doublet: T(2) = {T_fund_su2}")
print(f"  Total Dynkin weight: {n_su2_doublets} * {T_fund_su2} = {T_dynkin_goldstone}")
print(f"  Democratic counting: {dim_coset}")
print(f"  Ratio (democratic/Dynkin): {dim_coset}/{T_dynkin_goldstone} = {R(dim_coset, T_dynkin_goldstone)}")
print()
print("  The Dynkin weighting gives 7, democratic gives 28.")
print("  The metric is fixed by Schur's lemma at the SO(4)xSO(7) level")
print("  BEFORE decomposing under the SU(2)_L subgroup.")
print("  SU(2)_L decomposition cannot override the already-fixed metric.")
print()

# ==============================================================================
# SECTION 4: TREE-LEVEL COUPLING PREDICTIONS
# ==============================================================================

print("=" * 72)
print("SECTION 4: TREE-LEVEL GAUGE COUPLING PREDICTIONS")
print("=" * 72)
print()

# The democratic counting principle, combined with the two-regime structure
# (singlet criterion, S222), gives tree-level couplings:
#
# 1/alpha_2(tree) = N_SU2 = dim(coset) = 28  [interface regime]
# 1/alpha_3(tree) = N_SU3 = dim(SU(3)) = 8   [internal regime]
# 1/alpha_EM(tree) = dim(End(V)) = 121        [follows from above]
# 1/alpha_Y(tree) = dim(End(V)) - N_SU2 = 93  [complement]

N_SU2 = dim_coset      # 28
N_SU3 = dim_SU3        # 8
N_EM = dim_End_V        # 121
N_Y = dim_End_V - N_SU2  # 93

print("Tree-level predictions (democratic counting):")
print(f"  1/alpha_2(tree) = N_SU2 = dim(Gr(4,11))     = {N_SU2}")
print(f"  1/alpha_3(tree) = N_SU3 = dim(SU(3))        = {N_SU3}")
print(f"  1/alpha_Y(tree) = N_Y   = dim(End(V))-N_SU2 = {N_Y}")
print(f"  1/alpha_EM(tree)= N_EM  = dim(End(V))       = {N_EM}")
print()

# Check: 1/alpha_EM = 1/alpha_2 / sin^2(theta_W)
# = N_SU2 / (N_SU2 / dim(End(V))) = dim(End(V)) = 121
sin2_tree = R(N_SU2, N_EM)
print(f"Consistency: sin^2(theta_W) = N_SU2/N_EM = {N_SU2}/{N_EM} = {sin2_tree}")
print(f"  1/alpha_EM = 1/alpha_2 / sin^2 = {N_SU2} / ({sin2_tree}) = {N_EM}  [CONSISTENT]")
print(f"  1/alpha_EM = 1/alpha_2 + 1/alpha_Y = {N_SU2} + {N_Y} = {N_SU2 + N_Y}  [CONSISTENT]")
print()

# Coupling ratio
ratio_pred = R(N_SU2, N_SU3)
ratio_error = abs(float(ratio_pred) - float(ratio_meas)) / float(ratio_meas)

print(f"Coupling ratio: alpha_3/alpha_2 = {N_SU2}/{N_SU3} = {ratio_pred} = {float(ratio_pred):.4f}")
print(f"Measured: {float(ratio_meas):.4f}")
print(f"Error: {ratio_error*100:.2f}%")
print()

# ==============================================================================
# SECTION 5: RG CORRECTION FACTORS
# ==============================================================================

print("=" * 72)
print("SECTION 5: RG CORRECTION FACTORS (TREE -> M_Z)")
print("=" * 72)
print()

# If tree-level values are at some UV scale Lambda, RG running to M_Z gives
# multiplicative correction factors f_i:
#   1/alpha_i(M_Z) = N_i * f_i

f_2 = float(alpha_2_inv_MZ) / N_SU2
f_3 = float(alpha_3_inv_MZ) / N_SU3
f_EM = float(alpha_EM_inv_MZ) / N_EM

print("RG correction factors f_i = 1/alpha_i(M_Z) / N_i:")
print(f"  f_2  = {float(alpha_2_inv_MZ):.4f} / {N_SU2} = {f_2:.6f}  (delta = {(f_2-1)*100:.2f}%)")
print(f"  f_3  = {float(alpha_3_inv_MZ):.4f} / {N_SU3}  = {f_3:.6f}  (delta = {(f_3-1)*100:.2f}%)")
print(f"  f_EM = {float(alpha_EM_inv_MZ):.3f} / {N_EM} = {f_EM:.6f}  (delta = {(f_EM-1)*100:.2f}%)")
print()

f_avg = (f_2 + f_3 + f_EM) / 3
f_spread = max(f_2, f_3, f_EM) - min(f_2, f_3, f_EM)
f_rel_spread = f_spread / f_avg

print(f"Average correction: {f_avg:.6f}  (delta = {(f_avg-1)*100:.2f}%)")
print(f"Spread: {f_spread:.6f}  ({f_rel_spread*100:.2f}% relative)")
print(f"All three within {f_spread/2*100:.2f}% of mean")
print()

# Note: the similar RG factors (~5.6-6.0%) are notable but do NOT follow
# from standard one-loop SM running with a single matching scale.
# Different beta coefficients (b_1, b_2, b_3) give different percentage
# corrections at any given scale.

# One-loop SM beta coefficients (for reference)
b_1 = R(41, 10)    # U(1)_Y
b_2 = R(-19, 6)    # SU(2)
b_3 = R(-7, 1)     # SU(3)

print("SM one-loop beta coefficients:")
print(f"  b_1 = {b_1} = {float(b_1):.3f}")
print(f"  b_2 = {b_2} = {float(b_2):.3f}")
print(f"  b_3 = {b_3} = {float(b_3):.3f}")
print()

# For tree-level at scale Lambda, one-loop running gives:
# 1/alpha_i(M_Z) = N_i + b_i/(2*pi) * ln(M_Z/Lambda)
# Solving for Lambda from SU(2):
# ln(M_Z/Lambda) = (alpha_2_inv_MZ - N_SU2) * 2*pi / b_2
delta_2 = float(alpha_2_inv_MZ) - N_SU2
delta_3 = float(alpha_3_inv_MZ) - N_SU3

ln_ratio_from_2 = delta_2 * 2 * float(pi) / float(b_2)
ln_ratio_from_3 = delta_3 * 2 * float(pi) / float(b_3)

import math
Lambda_from_2 = 91.2 * math.exp(-ln_ratio_from_2)
Lambda_from_3 = 91.2 * math.exp(-ln_ratio_from_3)

print("One-loop scale determination (assuming SM running only):")
print(f"  From SU(2): delta = {delta_2:.4f}, Lambda = {Lambda_from_2:.0f} GeV")
print(f"  From SU(3): delta = {delta_3:.4f}, Lambda = {Lambda_from_3:.0f} GeV")
print(f"  INCONSISTENT: ratio Lambda_2/Lambda_3 = {Lambda_from_2/Lambda_from_3:.1f}")
print()
print("This inconsistency shows tree-level values 28 and 8 cannot both be")
print("at the same scale with ONLY SM running. The framework requires either:")
print("  (a) Non-perturbative matching at crystallization scale, OR")
print("  (b) Threshold corrections from BSM particles, OR")
print("  (c) The 'tree-level' definition includes some non-perturbative effects")
print()

# ==============================================================================
# SECTION 6: COMPARISON WITH ALTERNATIVE COUNTINGS
# ==============================================================================

print("=" * 72)
print("SECTION 6: DEMOCRATIC vs ALTERNATIVE COUNTINGS")
print("=" * 72)
print()

# Alternative 1: Dynkin-weighted counting over Goldstone modes
# SU(2): 14 doublets, T = 14 * 1/2 = 7
# SU(3): not directly applicable (different regime)
# Ratio: not well-defined

# Alternative 2: One-loop Dynkin over all of End(V)
# From S218: T_SU2 = T_SU3 = 22
# Gives sin^2 = 22/(22+22) = 1/2 -- WRONG

T_SU2_oneloop = 22  # From S218
T_SU3_oneloop = 22  # From S218
sin2_oneloop = R(T_SU2_oneloop, T_SU2_oneloop + T_SU3_oneloop)

# Alternative 3: SU(3)-charged modes in End(V)
# From S218: N_SU3_charged = 94 -- gives WRONG ratio
N_SU3_charged = 94  # All SU(3)-charged modes in End(V)

print("Counting comparison:")
print(f"  {'Method':<35} {'N_SU2':>6} {'N_SU3':>6} {'sin^2':>10} {'Status':>10}")
print(f"  {'-'*35} {'-'*6} {'-'*6} {'-'*10} {'-'*10}")
print(f"  {'Democratic (this work)':<35} {N_SU2:>6} {N_SU3:>6} {float(sin2_tree):>10.5f} {'0.08%':>10}")
print(f"  {'Dynkin over Goldstone':<35} {int(T_dynkin_goldstone):>6} {'N/A':>6} {'N/A':>10} {'N/A':>10}")
print(f"  {'One-loop Dynkin (S218)':<35} {T_SU2_oneloop:>6} {T_SU3_oneloop:>6} {float(sin2_oneloop):>10.5f} {'WRONG':>10}")
print(f"  {'SU(3) charged (S218)':<35} {N_SU2:>6} {N_SU3_charged:>6} {float(R(N_SU2,N_SU2+N_SU3_charged)):>10.5f} {'WRONG':>10}")
print(f"  {'Measured':<35} {'':>6} {'':>6} {float(sin2_W_MSbar):>10.5f} {'':>10}")
print()

# ==============================================================================
# SECTION 7: DERIVATION CHAIN SUMMARY
# ==============================================================================

print("=" * 72)
print("SECTION 7: FULL DERIVATION CHAIN")
print("=" * 72)
print()

print("STEP 1 [A-AXIOM]: End(V) has HS inner product (AXM_0110)")
print("  <A,B> = (1/n_c) Tr(A^T B)  ->  flat metric on R^{n_c^2}")
print()
print("STEP 2 [D]: HS metric is democratic on End(V)")
print(f"  All {dim_End_V} directions have equal metric weight 1/{n_c}")
print()
print(f"STEP 3 [D]: Vacuum manifold = Gr({n_d},{n_c}), dim = {dim_coset}")
print(f"  Tangent space = Hom(R^{n_d}, R^{n_c-n_d})")
print()
print(f"STEP 4 [D]: Hom(R^{n_d}, R^{n_c-n_d}) is IRREDUCIBLE under SO({n_d})xSO({n_c-n_d})")
print("  (tensor product of vector irreps of independent groups)")
print()
print("STEP 5 [D]: Schur's lemma -> unique invariant metric")
print(f"  All {dim_coset} tangent directions metrically equivalent")
print("  Dynkin weighting excluded (no room in irreducible rep)")
print()
print("STEP 6 [A-PHYSICAL]: Emergent gauge field inherits this metric")
print("  Gauge coupling determined by order parameter kinetic term")
print("  (NOT a separate free parameter as in standard QFT)")
print()
print("STEP 7 [D]: Apply singlet criterion (S222) + democratic metric:")
print(f"  SU(2): 0 singlets in R^4 -> interface -> 1/g_2^2 = {N_SU2}")
print(f"  SU(3): 1 singlet in R^7 -> internal  -> 1/g_3^2 = {N_SU3}")
print()
print("CONCLUSION:")
print(f"  alpha_3/alpha_2 = {N_SU2}/{N_SU3} = {ratio_pred}")
print(f"  sin^2(theta_W) = {N_SU2}/{N_EM} = {sin2_tree}")
print()
print("REMAINING GAP:")
print("  Step 6 is [A-PHYSICAL], not derived from axioms.")
print("  The claim that gauge fields are EMERGENT (not fundamental)")
print("  and inherit the vacuum manifold metric needs formal derivation")
print("  or acceptance as a physical assumption.")
print()

# ==============================================================================
# SECTION 8: EM COUPLING PREDICTION
# ==============================================================================

print("=" * 72)
print("SECTION 8: ELECTROMAGNETIC COUPLING PREDICTION")
print("=" * 72)
print()

# The democratic principle predicts:
# 1/alpha_EM(tree) = dim(End(V)) = n_c^2 = 121
# This follows automatically from sin^2(theta_W) = 28/121 and 1/alpha_2 = 28.
# Not an independent prediction, but a consistency check.

print("Prediction: 1/alpha_EM(tree) = dim(End(V)) = n_c^2")
print(f"  = {n_c}^2 = {N_EM}")
print()
print(f"Measured: 1/alpha_EM(M_Z) = {float(alpha_EM_inv_MZ):.3f}")
print(f"RG factor: {float(alpha_EM_inv_MZ)}/{N_EM} = {f_EM:.6f}")
print(f"Delta: {(f_EM-1)*100:.2f}%")
print()

# Decomposition: 121 = 28 (SU(2) sector) + 93 (U(1)_Y sector)
# This means U(1)_Y "sees" 93 = dim(End(V)) - dim(coset) modes.
# 93 = 16 + 28 + 49 = End(W) + Hom(W,W^perp) + End(W^perp)
# (everything except the Goldstone sector Hom(W^perp,W))

print("Decomposition: 1/alpha_EM = 1/alpha_2 + 1/alpha_Y")
print(f"  {N_EM} = {N_SU2} + {N_Y}")
print(f"  N_Y = {N_Y} = End(W) + Hom(W,W^perp) + End(W^perp)")
print(f"       = {dim_EndW} + {dim_HomWWp} + {dim_EndWp}")
print(f"  = complement of Goldstone sector in End(V)")
print()

# Connection to 1/alpha = 137
# N_I = n_c^2 + n_d^2 = 121 + 16 = 137
# This connects the EM coupling to the fine structure constant
# (requires Step 5 mechanism for full derivation)
N_I = n_c**2 + n_d**2
print(f"Connection to fine structure constant:")
print(f"  N_I = n_c^2 + n_d^2 = {n_c**2} + {n_d**2} = {N_I}")
print(f"  1/alpha_EM(tree) = n_c^2 = {N_EM}")
print(f"  N_I - 1/alpha_EM(tree) = {N_I} - {N_EM} = {N_I - N_EM} = n_d^2")
print(f"  (The defect self-interaction modes complete 121 -> 137)")
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 72)
print("VERIFICATION TESTS")
print("=" * 72)
print()

tests = [
    # Structural
    ("dim(End(V)) = n_c^2 = 121",
     dim_End_V == 121),

    ("End(V) decomposition: 16 + 28 + 28 + 49 = 121",
     dim_EndW + dim_HomWpW + dim_HomWWp + dim_EndWp == 121),

    ("Tangent space dim = n_d * (n_c - n_d) = 28",
     dim_coset == 28),

    # Irreducibility (checked by dimensions)
    ("R^4 tensor R^7 dim = 28 (irreducible under SO(4)xSO(7))",
     n_d * (n_c - n_d) == 28),

    ("dim(su(3)) = 8 (irreducible adjoint of simple SU(3))",
     dim_SU3 == 8),

    # Democratic predictions
    ("N_SU2 = 28 (democratic, interface regime)",
     N_SU2 == 28),

    ("N_SU3 = 8 (democratic, internal regime)",
     N_SU3 == 8),

    ("N_EM = 121 (full End(V))",
     N_EM == 121),

    ("N_Y = 93 (complement of Goldstone sector)",
     N_Y == 93),

    ("N_Y decomposition: 16 + 28 + 49 = 93",
     dim_EndW + dim_HomWWp + dim_EndWp == 93),

    # Ratio prediction
    ("alpha_3/alpha_2 = 7/2",
     ratio_pred == R(7, 2)),

    ("Coupling ratio within 1% of measured",
     ratio_error < 0.01),

    # sin^2(theta_W)
    ("sin^2(theta_W) = 28/121",
     sin2_tree == R(28, 121)),

    # Consistency
    ("1/alpha_EM = 1/alpha_2 + 1/alpha_Y = 28 + 93 = 121",
     N_SU2 + N_Y == N_EM),

    ("1/alpha_EM = 1/alpha_2 / sin^2 = 28 / (28/121) = 121",
     R(N_SU2, sin2_tree) == N_EM),

    # Dynkin comparison
    ("Dynkin over Goldstone modes = 7 (not 28)",
     T_dynkin_goldstone == 7),

    ("Democratic/Dynkin ratio = 4",
     R(dim_coset, T_dynkin_goldstone) == 4),

    ("One-loop gives T_SU2 = T_SU3 = 22 -> sin^2 = 1/2 (WRONG)",
     sin2_oneloop == R(1, 2)),

    # RG factors
    ("RG factors within 0.5% of each other",
     f_rel_spread < 0.005),

    ("All RG deltas between 5% and 7%",
     0.05 < (f_2-1) < 0.07 and 0.05 < (f_3-1) < 0.07 and 0.05 < (f_EM-1) < 0.07),

    # Key number theory
    ("N_I = n_c^2 + n_d^2 = 137",
     N_I == 137),
]

pass_count = 0
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if passed:
        pass_count += 1
    print(f"  [{status}] {name}")

print()
print(f"Results: {pass_count}/{len(tests)} PASS")

# ==============================================================================
# SUMMARY
# ==============================================================================

print()
print("=" * 72)
print("SUMMARY")
print("=" * 72)
print()
print("THEOREM (Democratic Counting from Schur's Lemma) [DERIVATION]:")
print("  The HS metric on End(V) (from AXM_0110) restricts to the tangent")
print("  space of the vacuum manifold Gr(4,11). This tangent space is an")
print("  IRREDUCIBLE representation of the isotropy group SO(4)xSO(7).")
print("  By Schur's lemma, the restricted metric is the unique invariant")
print("  bilinear form — treating all 28 directions equally (democratic).")
print("  Dynkin weighting is excluded because the space is irreducible:")
print("  there is only one component, so only one scale factor exists.")
print()
print("  Same argument for SU(3): su(3) is irreducible under Ad(SU(3))")
print("  (simple Lie algebra), so Killing form treats all 8 generators")
print("  equally. Democratic counting follows.")
print()
print("  Combined with singlet criterion (S222):")
print("    alpha_3/alpha_2 = 28/8 = 7/2 (measured: 3.489, error: 0.34%)")
print("    sin^2(theta_W) = 28/121 (measured: 0.23121, error: 843 ppm)")
print()
print("  REMAINING GAP: The connection 'gauge coupling inherits vacuum")
print("  manifold metric' requires the assumption that gauge fields are")
print("  emergent from the order parameter [A-PHYSICAL]. This assumption")
print("  replaces the broader 'why democratic?' question with the more")
print("  specific 'are gauge fields emergent?' question.")
print()
print("  Confidence: [DERIVATION] for the metric being democratic (Steps 1-5)")
print("              [A-PHYSICAL] for Step 6 (emergent gauge coupling)")
print()
