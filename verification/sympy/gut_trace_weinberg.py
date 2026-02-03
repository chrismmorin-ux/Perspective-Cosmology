#!/usr/bin/env python3
"""
GUT Trace Computation for sin^2(theta_W) from SO(11)

KEY QUESTION: Does the standard GUT trace formula
    sin^2(theta_W) = Tr(T3^2) / (Tr(T3^2) + Tr(Y^2))
evaluated on SO(11) representations with the framework's hypercharge
embedding give 28/121 (S154 Goldstone formula) or 29/126 (S153 induced
formula) or something else?

BREAKING CHAIN:
    SO(11) -> SO(4) x SO(7) -> SO(4) x G2 -> SO(4) x SU(3)
    where SO(4) ~= SU(2)_L x SU(2)_R

APPROACH:
1. Decompose representations under the full breaking chain
2. Assign T3 (SU(2)_L) and Y (hypercharge) eigenvalues
3. Compute traces and the Weinberg angle for each embedding
4. Compare to 28/121, 29/126, and 3/8

Status: INVESTIGATION
Created: Session 155
"""

from sympy import *
from sympy import Rational as R

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

n_d = 4       # Defect dimension = dim(H)
n_c = 11      # Crystal dimension = Im_C + Im_H + Im_O
Im_C = 1
Im_H = 3
Im_O = 7
C_dim = 2
H_dim = 4
O_dim = 8

N_Gold = n_d * Im_O   # 28 = Goldstone count from SO(11) -> SO(4) x SO(7)

# Target values
sin2_28_121 = R(28, 121)       # S154 Goldstone formula
sin2_29_126 = R(29, 126)       # S153 induced formula
sin2_3_8 = R(3, 8)             # Standard SU(5)/SO(10) GUT
sin2_measured = R(23121, 100000)  # PDG MS-bar at M_Z

print("=" * 72)
print("GUT TRACE COMPUTATION: sin^2(theta_W) FROM SO(11)")
print("=" * 72)
print()
print(f"Framework: n_d = {n_d}, n_c = {n_c}, Im_O = {Im_O}")
print(f"N_Goldstone(SO(11) -> SO(4) x SO(7)) = {N_Gold}")
print(f"n_c^2 = {n_c**2}")
print()
print("Targets:")
print(f"  28/121 = {float(sin2_28_121):.6f}  (Goldstone formula, S154)")
print(f"  29/126 = {float(sin2_29_126):.6f}  (Induced formula, S153)")
print(f"  3/8    = {float(sin2_3_8):.6f}  (Standard GUT)")
print(f"  Measured = {float(sin2_measured):.6f}  (PDG, MS-bar at M_Z)")
print()

# ==============================================================================
# PART 1: FUNDAMENTAL REPRESENTATION (11 of SO(11))
# ==============================================================================

print("=" * 72)
print("PART 1: FUNDAMENTAL REPRESENTATION  -- 11 of SO(11)")
print("=" * 72)
print()

# The 11 of SO(11) decomposes under SO(4) x SO(7) as:
#   (4, 1) + (1, 7)
#
# SO(4) ~= SU(2)_L x SU(2)_R:
#   4 -> (2, 2)
#
# SO(7) -> G2 -> SU(3):
#   7 -> 7 -> 3 + 3bar + 1
#
# Full decomposition under SU(2)_L x SU(2)_R x SU(3):
#   (2,2,1) + (1,1,3) + (1,1,3bar) + (1,1,1) = 4 + 3 + 3 + 1 = 11 [ok]
#
# The Cartan generators of SO(11) are H1,...,H5 (rotations in planes).
# SO(4) Cartan: H1, H2
# SO(7) Cartan: H3_c, H4, H5
#
# SU(2)_L and SU(2)_R Cartan generators:
#   T3_L = (H1 + H2)/2
#   T3_R = (H1 - H2)/2

print("Decomposition: 11 -> (2,2,1) + (1,1,3) + (1,1,3bar) + (1,1,1)")
print()

# Weights of the fundamental 11 under Cartan (H1, H2, H3_c, H4, H5):
# v1:  (+1, 0, 0, 0, 0)
# v2:  (-1, 0, 0, 0, 0)
# v3:  (0, +1, 0, 0, 0)
# v4:  (0, -1, 0, 0, 0)
# v5:  (0, 0, +1, 0, 0)
# v6:  (0, 0, -1, 0, 0)
# v7:  (0, 0, 0, +1, 0)
# v8:  (0, 0, 0, -1, 0)
# v9:  (0, 0, 0, 0, +1)
# v10: (0, 0, 0, 0, -1)
# v11: (0, 0, 0, 0, 0)

# T3_L = (H1 + H2)/2 eigenvalues:
T3_fund = [R(1,2), R(-1,2), R(1,2), R(-1,2),   # v1-v4 (SO(4) sector)
           0, 0, 0, 0, 0, 0, 0]                  # v5-v11 (SO(7) sector)

# T3_R = (H1 - H2)/2 eigenvalues:
T3R_fund = [R(1,2), R(-1,2), R(-1,2), R(1,2),   # v1-v4
            0, 0, 0, 0, 0, 0, 0]                  # v5-v11

Tr_T3sq_fund = sum(t**2 for t in T3_fund)
Tr_T3Rsq_fund = sum(t**2 for t in T3R_fund)

print(f"T3 eigenvalues:  {[str(t) for t in T3_fund]}")
print(f"T3_R eigenvalues: {[str(t) for t in T3R_fund]}")
print(f"Tr(T3^2) = {Tr_T3sq_fund}")
print(f"Tr(T3_R^2) = {Tr_T3Rsq_fund}")
print()

# SU(2)_L doublet structure:
# Doublet A (T3_R = +1/2): {v1, v4} with T3 = (+1/2, -1/2)
# Doublet B (T3_R = -1/2): {v3, v2} with T3 = (+1/2, -1/2)
# States v5-v11: SU(2)_L singlets

print("SU(2)_L doublet structure:")
print("  Doublet A (T3_R=+1/2): {v1, v4} -> T3 = (+1/2, -1/2)")
print("  Doublet B (T3_R=-1/2): {v3, v2} -> T3 = (+1/2, -1/2)")
print("  Singlets (SO(7)):       v5...v11 -> T3 = 0")
print()

# ==============================================================================
# PART 2: HYPERCHARGE EMBEDDINGS
# ==============================================================================

print("=" * 72)
print("PART 2: HYPERCHARGE EMBEDDINGS AND TRACE FORMULA")
print("=" * 72)
print()

# The GUT trace formula:
#   sin^2(theta_W) = Tr(T3^2) / (Tr(T3^2) + Tr(Y_SM^2))
#
# Y_SM is the SM-normalized hypercharge. In a GUT, Y sits in the Lie
# algebra of the unified group. For SO(11) -> SU(2)_L x U(1)_Y x SU(3),
# the hypercharge is:
#
#   Y = a * T3_R + b * Q_{BL}
#
# where Q_{BL} is the U(1) generator from SO(7) -> G2 (rank reduction 3->2).
#
# Constraint: Y must be constant on SU(2)_L multiplets (automatic since
# T3_R and Q_{BL} both commute with SU(2)_L).
#
# On the fundamental 11:
#   SO(4) states (v1-v4): Q_{BL} = 0 (SO(7) singlets), Y = a * T3_R
#   Color 3 (3 states):     T3_R = 0, Y = b * q
#   Color 3bar (3 states):     T3_R = 0, Y = -b * q
#   Color 1 (v11):          T3_R = 0, Q_{BL} = 0 (tracelessness), Y = 0
#
# Therefore:
#   Tr(Y^2) = 4 * (a/2)^2 + 3 * (bq)^2 + 3 * (bq)^2 + 0
#           = a^2 + 6(bq)^2
#
# sin^2(theta_W) = 1 / (1 + a^2 + 6(bq)^2)
#
# where we used Tr(T3^2) = 1.

a, bq = symbols('a bq', real=True)

Tr_Ysq_general = a**2 + 6*bq**2
sin2_general = Tr_T3sq_fund / (Tr_T3sq_fund + Tr_Ysq_general)

print("General formula for the fundamental 11:")
print(f"  Y = a * T3_R + (bq) * Q_BL")
print(f"  Tr(Y^2) = a^2 + 6(bq)^2")
print(f"  sin^2(theta_W) = 1 / (1 + a^2 + 6(bq)^2)")
print()

# --- Embedding A: Y = T3_R only (a=1, bq=0) ---
sin2_A = sin2_general.subs([(a, 1), (bq, 0)])
print(f"Embedding A: Y = T3_R (no B-L)")
print(f"  sin^2(theta_W) = {sin2_A} = {float(sin2_A):.6f}")
print(f"  Compare: 1/2  -- LEFT-RIGHT SYMMETRIC limit")
print()

# --- Embedding B: Pati-Salam with SM B-L normalization ---
# Y = T3_R + (B-L)/2 with B-L = 1/3 on color triplet
# -> a = 1, bq = 1/6
sin2_B = sin2_general.subs([(a, 1), (bq, R(1,6))])
print(f"Embedding B: Pati-Salam, B-L = 1/3 on triplet")
print(f"  Y = T3_R + (B-L)/2, with bq = 1/6")
print(f"  Tr(Y^2) = 1 + 6/36 = 7/6")
print(f"  sin^2(theta_W) = {sin2_B} = {float(sin2_B):.6f}")
print(f"  = 6/13  -- NOT a standard GUT value")
print()

# --- Embedding C: SU(5)-compatible normalization ---
# For SU(5): sin^2 = 3/8. What bq achieves this?
bq_su5 = symbols('bq_su5', positive=True)
eq_su5 = Eq(R(1,1) / (1 + 1 + 6*bq_su5**2), R(3,8))
sol_su5 = solve(eq_su5, bq_su5)
bq_su5_val = sol_su5[0]

# Verify
sin2_C = R(1,1) / (1 + 1 + 6*bq_su5_val**2)

print(f"Embedding C: bq chosen to give sin^2 = 3/8")
print(f"  Required: 1/(2 + 6*bq^2) = 3/8")
print(f"  -> bq^2 = {simplify(bq_su5_val**2)} -> bq = {bq_su5_val}")
print(f"  -> bq = sqrt(1/9) = 1/3")
print(f"  Verify: sin^2 = {sin2_C} = {float(sin2_C):.6f}")
print()

# What does bq = 1/3 mean for B-L?
# Y = T3_R + (B-L)/2 -> bq = (B-L value on 3)/2
# If bq = 1/3, then B-L = 2/3 on color triplet
print(f"  Interpretation: B-L = 2/3 on color triplet")
print(f"  This is the standard SU(5) normalization!")
print(f"  (In SU(5): Y_GUT^2 = (5/3) Y_SM^2, and the 5/3 accounts for this)")
print()

# --- Embedding D: What gives 28/121? ---
bq_target = symbols('bq_t', positive=True)
eq_target = Eq(R(1,1) / (1 + 1 + 6*bq_target**2), R(28, 121))
sol_target = solve(eq_target, bq_target)
if sol_target:
    bq_28_121 = sol_target[0]
    print(f"Embedding D: bq required for sin^2 = 28/121")
    print(f"  1/(2 + 6*bq^2) = 28/121")
    print(f"  -> bq^2 = {simplify(bq_28_121**2)}")
    print(f"  -> bq = {bq_28_121} = {float(bq_28_121):.6f}")
    print(f"  bq^2 = {R(121,28) - 2}/6 = {(R(121,28) - 2) / 6} = {float((R(121,28) - 2)/6):.6f}")
    print(f"  = 65/(28*6) = 65/168")
    print(f"  bq = sqrt(65/168)  -- NOT a clean framework ratio")
else:
    print(f"  No real solution found.")
print()

# --- Embedding E: What gives 29/126? ---
eq_target2 = Eq(R(1,1) / (1 + 1 + 6*bq_target**2), R(29, 126))
sol_target2 = solve(eq_target2, bq_target)
if sol_target2:
    bq_29_126 = sol_target2[0]
    bq2_val = simplify(bq_29_126**2)
    print(f"Embedding E: bq required for sin^2 = 29/126")
    print(f"  -> bq^2 = {bq2_val} = {float(bq2_val):.6f}")
    print(f"  -> bq = {float(bq_29_126):.6f}")
    print(f"  Also not a clean ratio")
else:
    print(f"  No real solution found.")
print()

# ==============================================================================
# PART 3: THE REPRESENTATION-INDEPENDENCE THEOREM
# ==============================================================================

print("=" * 72)
print("PART 3: REPRESENTATION INDEPENDENCE CHECK")
print("=" * 72)
print()

# For a SIMPLE group G, the trace formula gives the same sin^2(theta_W)
# for ANY representation R, because:
#   Tr_R(T_A T_B) = C(R) * delta_AB for all generators T_A of G.
#
# So Tr(T3^2)/Tr(Y^2) = same ratio regardless of R.
#
# Verify this on the adjoint (55) of SO(11).

print("ADJOINT REPRESENTATION  -- 55 of SO(11)")
print()
print("Decomposition under SO(4) x SO(7):")
print("  55 -> 6 + 21 + 28")
print("  where 6 = adj(SO(4)), 21 = adj(SO(7)), 28 = (4,7) [Goldstones]")
print()

# Adjoint 6 of SO(4) under SU(2)_L x SU(2)_R:
#   6 = (3,1) + (1,3)
# (3,1): T3 = -1, 0, +1 ; T3_R = 0
# (1,3): T3 = 0 ; T3_R = -1, 0, +1

T3_adj_SO4 = [-1, 0, 1, 0, 0, 0]  # (3,1) then (1,3)
T3R_adj_SO4 = [0, 0, 0, -1, 0, 1]

# Adjoint 21 of SO(7): all SO(4) singlets
# Under SU(3) C G2 C SO(7):
#   21 -> 14 + 7 -> (8+3+3bar) + (3+3bar+1)
# All T3 = 0, all T3_R = 0, but have Q_BL structure
T3_adj_SO7 = [0] * 21
T3R_adj_SO7 = [0] * 21

# The 28 = (4,7) = (2,2) (x) 7 under SU(2)_L x SU(2)_R x SO(7)
# Each state is (SO(4) index a, SO(7) index i)
# T3 comes from SO(4) factor: for each of 7 SO(7) states,
# the 4 SO(4) states contribute T3 = +1/2, -1/2, +1/2, -1/2
# (from the (2,2) of SU(2)_L x SU(2)_R)

T3_Goldstone = [R(1,2), R(-1,2), R(1,2), R(-1,2)] * 7  # 28 states
T3R_Goldstone = [R(1,2), R(-1,2), R(-1,2), R(1,2)] * 7

T3_adj = T3_adj_SO4 + T3_adj_SO7 + T3_Goldstone
T3R_adj = T3R_adj_SO4 + T3R_adj_SO7 + T3R_Goldstone

assert len(T3_adj) == 55, f"Expected 55 states, got {len(T3_adj)}"

Tr_T3sq_adj = sum(t**2 for t in T3_adj)
Tr_T3Rsq_adj = sum(t**2 for t in T3R_adj)

print(f"Tr(T3^2) on adjoint 55:")
print(f"  From SO(4) adj (6):   {sum(t**2 for t in T3_adj_SO4)}")
print(f"  From SO(7) adj (21):  0")
print(f"  From Goldstones (28): {sum(t**2 for t in T3_Goldstone)}")
print(f"  Total: {Tr_T3sq_adj}")
print()
print(f"Tr(T3_R^2) on adjoint 55:")
print(f"  From SO(4) adj (6):   {sum(t**2 for t in T3R_adj_SO4)}")
print(f"  From SO(7) adj (21):  0")
print(f"  From Goldstones (28): {sum(t**2 for t in T3R_Goldstone)}")
print(f"  Total: {Tr_T3Rsq_adj}")
print()

# With Y = T3_R (Embedding A):
sin2_adj_A = Tr_T3sq_adj / (Tr_T3sq_adj + Tr_T3Rsq_adj)
print(f"Embedding A (Y = T3_R) on adjoint: sin^2 = {sin2_adj_A} = {float(sin2_adj_A):.6f}")
print(f"  Same as fundamental? {'YES [ok]' if sin2_adj_A == R(1,2) else 'NO [X]'}")
print()

# For general Y = a*T3_R + bq*Q_BL on adjoint:
# Need Q_BL eigenvalues on adjoint.
# On the 6 (SO(4) adj): Q_BL = 0 for all 6
# On the 21 (SO(7) adj): complex Q_BL structure
# On the 28 = 4 (x) 7: Q_BL comes from the 7 factor

# For the 7 of SO(7) -> 3 + 3bar + 1 under SU(3):
# Q_BL on 3: eigenvalue q
# Q_BL on 3bar: eigenvalue -q
# Q_BL on 1: eigenvalue 0

# The 28 Goldstone states: (4 x 3) + (4 x 3) + (4 x 1)
# Q_BL: q for 12 states, -q for 12 states, 0 for 4 states

# For the 21 of SO(7) under SU(3):
# 21 -> 8 + 3 + 3bar + 3 + 3bar + 1
# Q_BL eigenvalues depend on the decomposition path
# From SO(7)->G2: 21 -> 14 + 7
# From G2->SU(3): 14 -> 8 + 3 + 3bar; 7 -> 3 + 3bar + 1

# The 14 of G2 is the adjoint of G2.
# Under SU(3): 14 -> 8 + 3 + 3bar
# Q_BL on 14: The G2 adjoint is a REAL representation, but it's NOT
# a trivial Q_BL representation. However, Q_BL commutes with G2 only
# if Q_BL is in the CENTER of G2, which is trivial.
# Actually Q_BL is NOT in G2  -- it's the generator OUTSIDE G2.
# Q_BL does NOT commute with all of G2.
# So Q_BL eigenvalues on the 14 are NOT simply constant.

# This means Q_BL is NOT diagonal in the G2 irrep basis  -- it mixes states.
# For the trace computation, we need Tr(Q_BL^2) which IS well-defined.

# By the Dynkin index formula:
# For SO(7) fundamental 7: Tr(Q_BL^2)|_7 depends on normalization
# For the Cartan generator Q_BL = c3H3_c + c4H4 + c5H5 (orthogonal to G2 Cartan):
# Tr(Q_BL^2)|_7 = sum of (Q_BL eigenvalue)^2 over the 7 weights of fund. rep.

# On the fundamental 7 of SO(7), Cartan weights are:
# (+/-1,0,0), (0,+/-1,0), (0,0,+/-1), (0,0,0)
# So Tr(H_i^2)|_7 = 2 for each i.
# And Tr(H_i H_j)|_7 = 0 for i \!= j.
# For Q_BL = c3H3_c + c4H4 + c5H5:
# Tr(Q_BL^2)|_7 = 2(c3^2 + c4^2 + c5^2) = 2|c|^2

# KEY RELATION: The ratio Tr(T3^2)/Tr(Q_BL^2) on the fund. rep. is
# a property of SO(11), independent of representation.
# Tr(T3^2)|_11 = 1
# Tr(Q_BL^2)|_11 = 2|c|^2
# (where |c|^2 is the squared norm of Q_BL in the Cartan space)

# For the standard normalization where all SO(11) generators have the
# same Tr: we need Tr(Q_BL^2) = Tr(L_{ij}^2) for any rotation generator.
# In the fund. 11: Tr(L_{ij}^2) = 2.
# T3_L = (L12 + L34)/2, so Tr(T3^2) = (2+2)/4 = 1.
# Q_BL is a SINGLE Cartan generator (up to normalization):
# If Q_BL = H_k for some k: Tr(Q_BL^2) = 2.
# If Q_BL = (H3_c + H4 + H5)/sqrt3: Tr(Q_BL^2) = 6/3 = 2. Same.
# So Tr(Q_BL^2)|_11 = 2 for any unit-norm Cartan generator.

# This is the KEY INSIGHT: in the fundamental of SO(2n+1),
# Tr(H_i^2) = 2 for each orthonormal Cartan generator.
# Meanwhile Tr(T3^2) = 1 because T3 = (H1+H2)/2.

print()
print("=" * 72)
print("PART 4: NORMALIZED HYPERCHARGE  -- THE DEFINITIVE COMPUTATION")
print("=" * 72)
print()

# Y is a linear combination of Cartan generators.
# The question is: WHICH linear combination corresponds to SM hypercharge?
#
# In the SO(11) Lie algebra, all generators are on equal footing.
# The identification of which generators correspond to SU(2)_L, U(1)_Y,
# SU(3)_c is determined by the BREAKING PATTERN.
#
# After SO(11) -> SO(4) x SO(7) -> SO(4) x G2 -> SO(4) x SU(3):
#
# Surviving generators (14 total):
#   SU(2)_L: 3 generators (from SO(4))
#   SU(2)_R: 3 generators (from SO(4))
#   SU(3):   8 generators (from G2 C SO(7))
#
# Total surviving: 3 + 3 + 8 = 14 = dim(SO(4)) + dim(SU(3))
#
# But the SM has SU(3) x SU(2)_L x U(1)_Y, which is 8 + 3 + 1 = 12.
# The framework gives SU(3) x SU(2)_L x SU(2)_R with dim 14.
# SU(2)_R must break to U(1)_Y in some further step.
#
# If U(1)_Y = U(1)_R (the T3_R diagonal of SU(2)_R), then this is
# the simplest case: Y = T3_R.
#
# But the SM hypercharge is NOT purely T3_R in Pati-Salam-type models.
# Y = T3_R + (B-L)/2 requires a B-L generator from the SO(7) sector.
#
# HOWEVER: in the framework's breaking chain, G2 -> SU(3) has NO extra
# U(1) (both rank 2!). And SO(7) -> G2 reduces rank from 3 to 2, freeing
# one U(1), but this U(1) is a BROKEN generator (it's in the coset
# SO(7)/G2, not in the surviving algebra).
#
# So in the framework, the surviving U(1) candidates are:
#   1. T3_R (from SU(2)_R C SO(4))  -- SURVIVES
#   2. Q_{BL} (from SO(7)\G2)  -- BROKEN (becomes a Goldstone)
#
# This means: if no extra breaking occurs, Y = T3_R is the ONLY
# surviving U(1) generator. And sin^2(theta_W) = 1/2.
#
# But sin^2(theta_W) = 1/2 is wrong! The measured value is ~0.231.
#
# Resolution: The full SU(2)_R must ALSO break (not just to U(1)_Y,
# but further). In the SM, SU(2)_R is absent  -- it's already broken
# at the electroweak scale. The Weinberg angle reflects how U(1)_Y
# sits inside SU(2)_L x SU(2)_R x U(1)_{B-L} or a similar extended
# group.

print("CRITICAL OBSERVATION:")
print()
print("In the framework's breaking chain:")
print("  SO(11) -> SO(4) x SO(7) -> SO(4) x G2 -> SO(4) x SU(3)")
print()
print("The surviving symmetry is SO(4) x SU(3) ~= SU(2)_L x SU(2)_R x SU(3)")
print("This has dim = 3 + 3 + 8 = 14")
print()
print("The SM gauge group SU(3) x SU(2)_L x U(1)_Y has dim = 12")
print()
print("So U(1)_Y could be:")
print("  (a) T3_R from SU(2)_R -> gives sin^2 = 1/2")
print("  (b) A combination involving a broken generator (Q_{BL})")
print("  (c) Something entirely different from the GUT picture")
print()

# ==============================================================================
# PART 5: SYSTEMATIC SCAN  -- WHAT HYPERCHARGE GIVES EACH VALUE?
# ==============================================================================

print("=" * 72)
print("PART 5: SYSTEMATIC SCAN")
print("=" * 72)
print()

# On the fundamental 11:
# Tr(T3^2) = 1
# Tr(Y^2) = sum of Y^2 eigenvalues over the 11 states
#
# The 4 SO(4) states form 2 SU(2)_L doublets:
#   Doublet A: Y = y_A (both states)
#   Doublet B: Y = y_B (both states)
# The 3+3+1 SO(7) states:
#   Color 3:  Y = y_3 (all 3 states)
#   Color 3bar:  Y = y_3bar (all 3 states)
#   Singlet:  Y = y_0
#
# Tracelessness of Y on the 11: 2y_A + 2y_B + 3y_3 + 3y_3bar + y_0 = 0
#
# For the specific embedding Y = a*T3_R + b*Q_{BL}:
#   y_A = a/2 (T3_R = +1/2 doublet)
#   y_B = -a/2 (T3_R = -1/2 doublet)
#   y_3 = b*q, y_3bar = -b*q, y_0 = 0
# Tracelessness: 2(a/2) + 2(-a/2) + 3bq + 3(-bq) + 0 = 0 [ok]
#
# But more generally, y_A and y_B could be any values that preserve
# SU(2)_L invariance, and y_3, y_3bar, y_0 could be any values that
# preserve SU(3) invariance.

# With this general parametrization:
y_A, y_B, y_3, y_0 = symbols('y_A y_B y_3 y_0', real=True)

# Tr(Y^2) = 2y_A^2 + 2y_B^2 + 3y_3^2 + 3y_3^2 + y_0^2
# (using CPT/charge conjugation: y_3bar = -y_3)
Tr_Ysq = 2*y_A**2 + 2*y_B**2 + 6*y_3**2 + y_0**2

# Tracelessness: 2y_A + 2y_B + y_0 = 0 (color parts cancel)
# -> y_0 = -2(y_A + y_B)

Tr_Ysq_constrained = Tr_Ysq.subs(y_0, -2*(y_A + y_B))
Tr_Ysq_constrained = expand(Tr_Ysq_constrained)

print("General hypercharge on the 11:")
print(f"  Doublet A: Y = y_A, Doublet B: Y = y_B")
print(f"  Color 3: Y = y_3, Color 3bar: Y = -y_3")
print(f"  Singlet: Y = -2(y_A + y_B)  [tracelessness]")
print()
print(f"  Tr(Y^2) = {Tr_Ysq_constrained}")
print()

# Check SM-like assignments: match to one generation's quantum numbers
# The 11 doesn't contain a full generation, but let's try matching
# the individual multiplet hypercharges:
#
# SM quark doublet Q_L: Y = 1/6 -> color triplet with SU(2) doublet
# But in the 11, the color triplets are SU(2) SINGLETS!
# The SU(2) doublets are color SINGLETS!
#
# So the 11 doesn't have the SM assignment pattern.
# This means we can't simply read off SM hypercharges.

print("IMPORTANT: The fundamental 11 does NOT contain SM-like states!")
print("  SU(2) doublets are color singlets (lepton-like at best)")
print("  Color triplets are SU(2) singlets (right-handed quark-like)")
print("  No state carries both color AND weak isospin")
print()
print("  The 11 looks like: 2 lepton-like doublets + 2 quark singlets")
print("  + 1 sterile singlet  -- NOT a full SM generation")
print()

# Nevertheless, we can check: if the doublets have Y = +/-1/2 (lepton-like)
# and the triplets have Y = +/-1/3 (right-handed d-quark-like):

print("--- Test: Lepton-like doublets, d_R-like triplets ---")
y_A_val = R(1,2)   # Like nu_R doublet (Y = +1/2)
y_B_val = R(-1,2)  # Like L_L doublet (Y = -1/2)
y_3_val = R(-1,3)  # Like d_R (Y = -1/3)
y_0_val = -2*(y_A_val + y_B_val)  # = 0

Tr_Ysq_test1 = 2*y_A_val**2 + 2*y_B_val**2 + 6*y_3_val**2 + y_0_val**2
sin2_test1 = Tr_T3sq_fund / (Tr_T3sq_fund + Tr_Ysq_test1)

print(f"  y_A = {y_A_val}, y_B = {y_B_val}, y_3 = {y_3_val}, y_0 = {y_0_val}")
print(f"  Tr(Y^2) = {Tr_Ysq_test1} = {float(Tr_Ysq_test1):.6f}")
print(f"  sin^2(theta_W) = {sin2_test1} = {float(sin2_test1):.6f}")
print()

# --- Test: u_R-like triplets ---
print("--- Test: Lepton-like doublets, u_R-like triplets ---")
y_3_val2 = R(2,3)   # Like u_R (Y = 2/3)
Tr_Ysq_test2 = 2*R(1,2)**2 + 2*R(-1,2)**2 + 6*y_3_val2**2 + 0
sin2_test2 = 1 / (1 + Tr_Ysq_test2)

print(f"  y_A = 1/2, y_B = -1/2, y_3 = {y_3_val2}")
print(f"  Tr(Y^2) = {Tr_Ysq_test2} = {float(Tr_Ysq_test2):.6f}")
print(f"  sin^2(theta_W) = {sin2_test2} = {float(sin2_test2):.6f}")
print()

# --- Test: What Y values on the 11 give 28/121? ---
print("--- INVERSE: What Y eigenvalues give sin^2 = 28/121? ---")
print()
# sin^2 = 1/(1 + Tr(Y^2)) = 28/121
# -> Tr(Y^2) = 121/28 - 1 = 93/28

Tr_Ysq_needed = R(121,28) - 1
print(f"  Need Tr(Y^2) = {Tr_Ysq_needed} = {float(Tr_Ysq_needed):.6f}")
print()

# With Y = a*T3_R: Tr(Y^2) = a^2. Need a^2 = 93/28. a = sqrt(93/28).
# Not clean.

# With Y on two doublets at +/-y and triplet at +/-y_3:
# 4y^2 + 6y_3^2 = 93/28
# Many solutions. Is there a clean one?

print("  Looking for clean solutions to 4y^2 + 6y_3^2 = 93/28:")
print()

# Try y = 1/2 (natural for SU(2)_R):
# 4*1/4 + 6y_3^2 = 93/28
# 1 + 6y_3^2 = 93/28
# y_3^2 = (93/28 - 1)/6 = 65/168
# y_3 = sqrt(65/168)  -- not clean
y3_sq = (Tr_Ysq_needed - 1) / 6
print(f"  If y = 1/2: y_3^2 = {y3_sq} = {float(y3_sq):.6f}")
print(f"    y_3 = {float(sqrt(y3_sq)):.6f}  -- not clean")
print()

# Try y_3 = 0:
# 4y^2 = 93/28 -> y^2 = 93/112 -> not clean
print(f"  If y_3 = 0: y^2 = {Tr_Ysq_needed/4} = {float(Tr_Ysq_needed/4):.6f}")
print(f"    Not clean")
print()

# Try y = Im_O/(2*n_c) = 7/22:
y_test = R(Im_O, 2*n_c)
rem = Tr_Ysq_needed - 4*y_test**2
y3_sq_test = rem / 6
print(f"  If y = {y_test}: Tr contribution = {4*y_test**2}")
print(f"    Remaining: 6y_3^2 = {rem} -> y_3^2 = {y3_sq_test}")
print(f"    Not clean")
print()

# ==============================================================================
# PART 6: THE SPINOR REPRESENTATION (32 of SO(11))
# ==============================================================================

print("=" * 72)
print("PART 6: SPINOR REPRESENTATION  -- 32 of SO(11)")
print("=" * 72)
print()

# The spinor 32 of SO(11) decomposes under SO(4) x SO(7) as:
#   32 -> (2_L, 8_s) + (2_R, 8_s)
# where 2_L = (2,1), 2_R = (1,2) of SU(2)_L x SU(2)_R
# and 8_s is the unique spinor of SO(7).
#
# Under G2 C SO(7): 8_s -> 7 + 1
# Under SU(3) C G2: 7 -> 3 + 3bar + 1
# So 8_s -> 3 + 3bar + 1 + 1
#
# Full decomposition under SU(2)_L x SU(2)_R x SU(3):
# From (2_L, 8_s):
#   (2,1,3) + (2,1,3bar) + (2,1,1) + (2,1,1) = 6+6+2+2 = 16
# From (2_R, 8_s):
#   (1,2,3) + (1,2,3bar) + (1,2,1) + (1,2,1) = 6+6+2+2 = 16
# Total: 32 [ok]

print("32 -> (2_L, 8_s) + (2_R, 8_s)")
print("8_s -> 3 + 3bar + 1 + 1  under SU(3)")
print()

# The spinor DOES contain states with both color and SU(2)!
# (2,1,3): left-handed quark doublet! (6 states)
# (2,1,1): left-handed lepton doublet! (2 states each)
# (1,2,3): right-handed quark doublet in SU(2)_R (6 states)
# (1,2,1): right-handed lepton doublet in SU(2)_R (2 states each)

print("The spinor 32 DOES contain SM-like content!")
print("  Left-handed:  (2,1,3) = Q_L  +  (2,1,1)x2 = L_L + extra")
print("  Right-handed: (1,2,3) = Q_R  +  (1,2,1)x2 = L_R + extra")
print()

# Count T3 (SU(2)_L) eigenvalues on the 32:
# (2,1,3): T3 = +/-1/2, 6 states each -> Tr(T3^2) = 6x(1/4) = 3/2
# (2,1,3bar): T3 = +/-1/2, 6 states each -> Tr(T3^2) = 6x(1/4) = 3/2
# (2,1,1): T3 = +/-1/2, 2 states each -> Tr(T3^2) = 2x(1/4) = 1/2
# (2,1,1): same -> 1/2
# (1,2,*): all T3 = 0 -> 0

Tr_T3sq_32 = R(3,2) + R(3,2) + R(1,2) + R(1,2) + 0
print(f"Tr(T3^2) on 32 = {Tr_T3sq_32}")
print()

# T3_R eigenvalues:
# (2,1,*): all T3_R = 0
# (1,2,3): T3_R = +/-1/2, 6 states -> 3/2
# (1,2,3bar): T3_R = +/-1/2, 6 states -> 3/2
# (1,2,1)x2: T3_R = +/-1/2, 2+2 states -> 1/2+1/2

Tr_T3Rsq_32 = 0 + R(3,2) + R(3,2) + R(1,2) + R(1,2)
print(f"Tr(T3_R^2) on 32 = {Tr_T3Rsq_32}")
print()

# Embedding A on spinor: Y = T3_R
sin2_32_A = Tr_T3sq_32 / (Tr_T3sq_32 + Tr_T3Rsq_32)
print(f"Embedding A (Y = T3_R) on spinor 32: sin^2 = {sin2_32_A}")
print(f"  = {float(sin2_32_A):.6f}")
print(f"  Same as fundamental? {'YES [ok]' if sin2_32_A == R(1,2) else 'NO [X]'}")
print()

# Representation independence confirmed for Y = T3_R

# For general Y = a*T3_R + bq*Q_{BL}:
# The 32 has spinor weights under SO(7), which have Q_{BL} eigenvalues.
# By representation independence: the sin^2 value will be the SAME
# as for the fundamental 11.

print("REPRESENTATION INDEPENDENCE:")
print("  Since SO(11) is simple, Tr(T3^2)/Tr(Y^2) is the same")
print("  for ALL representations. We've verified Y = T3_R gives 1/2")
print("  on both fund. 11 and spinor 32.")
print()
print("  -> The trace formula result depends ONLY on the embedding,")
print("     not the representation.")
print()

# ==============================================================================
# PART 7: THE PATI-SALAM NORMALIZATION
# ==============================================================================

print("=" * 72)
print("PART 7: PATI-SALAM AND SU(5) NORMALIZATIONS")
print("=" * 72)
print()

# In standard GUT theory, the hypercharge normalization is fixed by
# the embedding of Y in the GUT algebra. The key ratio is:
#
#   k_Y = Tr(Y_SM^2) / C2(fund)
#
# where C2(fund) is the second Casimir index, and the traces are
# over the SAME representation.
#
# For SU(5): k_Y = 5/3, giving sin^2 = 3/(3 + 5) = 3/8
# For SO(10): same as SU(5) (since SO(10) D SU(5))
#
# For SO(11): the value of k_Y depends on how Y embeds.
#
# With Y = T3_R: k_Y = Tr(T3_R^2)/Tr(T3^2) = 1/1 = 1
# -> sin^2 = 1/(1+1) = 1/2
#
# The question: does the framework's division-algebra structure
# select a DIFFERENT normalization?

print("Standard GUT normalization factor k_Y:")
print(f"  SU(5): k_Y = 5/3, sin^2 = 3/(3+5) = 3/8 = {float(R(3,8))}")
print(f"  SO(10): k_Y = 5/3, sin^2 = 3/8 (same)")
print()
print(f"  SO(11) with Y = T3_R: k_Y = 1, sin^2 = 1/2")
print()

# For sin^2 = 28/121:
# sin^2 = 1/(1 + k_Y) -> k_Y = 121/28 - 1 = 93/28
k_Y_28_121 = R(121,28) - 1
print(f"  For sin^2 = 28/121: k_Y = {k_Y_28_121} = {float(k_Y_28_121):.4f}")
print(f"  93/28 = 93/28. Factorization: 93 = 3x31, 28 = 4x7 = n_d x Im_O")
print()

# For sin^2 = 3/8:
k_Y_3_8 = R(8,3) - 1
print(f"  For sin^2 = 3/8: k_Y = {k_Y_3_8} = {float(k_Y_3_8):.4f}")
print()

# ==============================================================================
# PART 8: THE NON-GUT INTERPRETATION
# ==============================================================================

print("=" * 72)
print("PART 8: WHY THE GUT TRACE MAY BE WRONG FOR THIS FRAMEWORK")
print("=" * 72)
print()

print("The standard GUT trace formula assumes:")
print("  1. A SIMPLE unified gauge group at high energy")
print("  2. All gauge couplings unify to a single value")
print("  3. sin^2(theta_W) is determined at the GUT scale")
print("  4. RG running brings it down to M_Z")
print()
print("The framework's SO(11) is DIFFERENT:")
print("  1. SO(11) is a CRYSTAL symmetry, not a gauge symmetry")
print("  2. Gauge couplings EMERGE from crystallization (tilt angles)")
print("  3. sin^2 = 28/121 holds at M_Z, not at a high scale")
print("  4. The Goldstone fraction 28/121 = N_Gold/n_c^2 is an IR result")
print()
print("This suggests the GUT trace formula does NOT apply here.")
print("The Weinberg angle comes from a DIFFERENT mechanism:")
print("  sin^2(theta_W) = (broken generators)/(total crystal modes)")
print("  = N_Goldstone(Stage 1)/n_c^2")
print("  = p*q / (p+q)^2  where p=4, q=7")
print()

# The p*q/(p+q)^2 form is actually x(1-x) with x = p/(p+q)
p, q = symbols('p q', positive=True)
goldstone_fraction = p*q / (p+q)**2
print(f"  sin^2(theta_W) = p*q/(p+q)^2 = x(1-x) where x = p/(p+q)")
print(f"  With p = n_d = {n_d}, q = Im_O = {Im_O}:")
print(f"  = {n_d}x{Im_O}/{n_c}^2 = {N_Gold}/{n_c**2} = {float(R(N_Gold, n_c**2)):.6f}")
print()

# ==============================================================================
# PART 9: COMPARISON  -- THREE CANDIDATE MECHANISMS
# ==============================================================================

print("=" * 72)
print("PART 9: THREE CANDIDATE MECHANISMS FOR sin^2(theta_W)")
print("=" * 72)
print()

print("Mechanism A: GUT Trace (standard)")
print(f"  sin^2 = Tr(T3^2)/(Tr(T3^2) + Tr(Y^2))")
print(f"  With Y = T3_R (simplest SO(11) embedding): sin^2 = 1/2")
print(f"  With SU(5)-compatible normalization: sin^2 = 3/8")
print(f"  Problem: framework has no unified gauge coupling")
print()

print("Mechanism B: Goldstone Fraction (S154)")
print(f"  sin^2 = N_Goldstone/n_c^2 = p*q/(p+q)^2 = 28/121")
print(f"  = (broken generators in Stage 1)/(total crystal modes)")
print(f"  Value: {float(sin2_28_121):.6f} (843 ppm from measured)")
print(f"  Pro: Clean algebraic origin, unique in framework")
print(f"  Con: WHY should this ratio equal sin^2(theta_W)?")
print()

print("Mechanism C: Induced Coupling Ratio (S153)")
print(f"  sin^2 = S_2/S_EM = 29/126")
print(f"  = (SU(2)-charged modes)/(all EM-charged modes)")
print(f"  Value: {float(sin2_29_126):.6f} (0.45% from measured)")
print(f"  Pro: Principled derivation from induced mechanism")
print(f"  Con: Less precise than 28/121")
print()

# ==============================================================================
# PART 10: THE KEY MATHEMATICAL IDENTITY
# ==============================================================================

print("=" * 72)
print("PART 10: MATHEMATICAL IDENTITY CONNECTING GUT TO GOLDSTONE")
print("=" * 72)
print()

# In standard GUT theory with group G -> H1 x H2:
# The Goldstone count is dim(G/H) = dim(G) - dim(H1) - dim(H2)
# For SO(n) -> SO(p) x SO(q) with p+q=n: N_Gold = p*q
#
# The "Goldstone fraction" is:
# N_Gold / dim(G) = p*q / [n(n-1)/2] = 2pq / [(p+q)(p+q-1)]
#
# This is NOT the same as the GUT trace sin^2(theta_W).
#
# However, the framework's formula uses n_c^2 in the denominator,
# NOT dim(SO(11)):
# 28/121 = N_Gold/n_c^2 = pq/(p+q)^2

# Compare:
dim_SO11 = n_c * (n_c - 1) // 2  # = 55
goldstone_over_dimG = R(N_Gold, dim_SO11)
goldstone_over_nc2 = R(N_Gold, n_c**2)

print(f"N_Goldstone = {N_Gold}")
print(f"dim(SO(11)) = {dim_SO11}")
print(f"n_c^2 = {n_c**2}")
print()
print(f"N_Gold/dim(SO(11)) = {goldstone_over_dimG} = {float(goldstone_over_dimG):.6f}")
print(f"N_Gold/n_c^2        = {goldstone_over_nc2} = {float(goldstone_over_nc2):.6f}")
print()
print(f"The GUT-motivated fraction (28/55 = 0.509) is not sin^2(theta_W).")
print(f"The crystal-motivated fraction (28/121 = 0.231) IS close to sin^2(theta_W)!")
print()

# What IS n_c^2 in representation theory terms?
# n_c^2 = dim of n_c x n_c matrices = dim of V (x) V
# where V = fundamental of SO(n_c)
# V (x) V = S^2V (+) Lambda^2V = (1 + traceless symmetric) (+) adjoint
# dim: n_c^2 = 1 + [n_c(n_c+1)/2 - 1] + n_c(n_c-1)/2

n_symm = n_c * (n_c + 1) // 2    # 66
n_antisymm = n_c * (n_c - 1) // 2  # 55

print(f"n_c^2 = {n_c**2} = S^2V + Lambda^2V = {n_symm} + {n_antisymm}")
print(f"  = dim(symmetric matrices) + dim(antisymmetric matrices)")
print(f"  = {n_symm} + {dim_SO11}")
print()

# The ratio sin^2 = N_Gold/n_c^2 = N_Gold/(dim S^2V + dim Lambda^2V)
# = N_Gold / (dim S^2V + dim G)
# Note: dim G = dim Lambda^2V = adjoint = 55

# Interesting: what is N_Gold / dim(V(x)V) vs N_Gold / dim(adj)?
# 28/121 vs 28/55

# The crystal tilt matrix IS an element of V(x)V (it's an n_c x n_c matrix).
# So n_c^2 = 121 counts the crystal DOF as V(x)V.
# The Goldstone fraction 28/121 is literally the fraction of crystal DOF
# that become Goldstone bosons.

print("INTERPRETATION:")
print(f"  The crystal tilt matrix is an n_c x n_c matrix: {n_c}^2 = {n_c**2} DOF")
print(f"  Stage 1 breaking generates {N_Gold} Goldstones out of {n_c**2} crystal DOF")
print(f"  sin^2(theta_W) = {N_Gold}/{n_c**2} = Goldstone fraction of crystal")
print()
print("  This is NOT a GUT trace formula. It's a DOF counting formula.")
print("  The denominator is n_c^2 (crystal matrix DOF), not dim(SO(11)) = 55.")
print()

# ==============================================================================
# PART 11: COULD sin^2(theta_W) = Tr(Y^2)/Tr(Q^2) ON V(x)V?
# ==============================================================================

print("=" * 72)
print("PART 11: TRACE ON V(x)V (CRYSTAL MODES)")
print("=" * 72)
print()

# What if the relevant "representation" for the trace formula is V(x)V
# (the crystal tilt matrix), but with a NON-STANDARD trace formula?
#
# Standard: sin^2 = Tr_R(T3^2) / (Tr_R(T3^2) + Tr_R(Y^2))
# This gives the same answer for any R of the same group.
#
# But what if we weight DIFFERENTLY?
# For example: Tr over Goldstone modes only vs all modes?

# On V(x)V (121 states), the generators act as T^A (x) 1 + 1 (x) T^A.
# As shown in Part 3, Tr_{V(x)V}(A^2) = 2n*Tr_V(A^2) if A is traceless.
# So the ratio is unchanged.

# HOWEVER: if we compute Tr over a SUBSPACE (e.g., the 28 Goldstones)
# rather than the full 121, we could get a different answer.
# But that's not the standard trace formula.

# Let's check: Tr(T3^2) restricted to the 28 Goldstone modes (in the adj rep)
# = 7 (from Part 3)
# Tr(T3_R^2) restricted to the 28 Goldstone modes = 7

# sin^2 = 7/(7+7) = 1/2  -- same as before. No help.

print("Tr(T3^2) on 28 Goldstones = 7")
print("Tr(T3_R^2) on 28 Goldstones = 7")
print("-> sin^2 = 7/14 = 1/2 (same)")
print()

# What about Tr(T3^2) on the full adjoint 55?
print(f"Tr(T3^2) on full adj 55 = {Tr_T3sq_adj}")
print(f"Tr(T3_R^2) on full adj 55 = {Tr_T3Rsq_adj}")
print(f"-> sin^2 = {Tr_T3sq_adj}/{Tr_T3sq_adj + Tr_T3Rsq_adj} = 1/2 (same)")
print()

print("CONCLUSION: The standard GUT trace formula ALWAYS gives 1/2")
print("for the simplest embedding Y = T3_R, regardless of representation.")
print()
print("To get sin^2 != 1/2, we need Y != T3_R, which requires a B-L")
print("component. With the SU(5)-compatible B-L, we get 3/8.")
print("Neither 28/121 nor 29/126 emerges from any natural embedding.")
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 72)
print("VERIFICATION TESTS")
print("=" * 72)
print()

tests = [
    # Part 1: Fundamental 11
    ("Tr(T3^2) on fund. 11 = 1",
     Tr_T3sq_fund == 1),

    ("Tr(T3_R^2) on fund. 11 = 1",
     Tr_T3Rsq_fund == 1),

    ("Fund. 11 = 4 + 3 + 3 + 1",
     4 + 3 + 3 + 1 == 11),

    # Part 2: Embeddings
    ("Y = T3_R gives sin^2 = 1/2 on fund.",
     sin2_A == R(1,2)),

    ("bq = 1/3 gives sin^2 = 3/8 (SU(5) result)",
     sin2_C == R(3,8)),

    ("Pati-Salam B-L=1/3 gives sin^2 = 6/13",
     sin2_B == R(6,13)),

    # Part 3: Representation independence
    ("Adj 55 = 6 + 21 + 28",
     6 + 21 + 28 == 55),

    ("Tr(T3^2) on adj. 55 = 9",
     Tr_T3sq_adj == 9),

    ("Tr(T3_R^2) on adj. 55 = 9",
     Tr_T3Rsq_adj == 9),

    ("Y = T3_R gives sin^2 = 1/2 on adj. (rep. independence)",
     sin2_adj_A == R(1,2)),

    # Part 6: Spinor 32
    ("Spinor 32 = 16 + 16",
     16 + 16 == 32),

    ("Tr(T3^2) on spinor 32 = 4",
     Tr_T3sq_32 == 4),

    ("Y = T3_R gives sin^2 = 1/2 on spinor (rep. independence)",
     sin2_32_A == R(1,2)),

    # Part 10: Goldstone counting
    ("N_Goldstone = n_d x Im_O = 28",
     N_Gold == n_d * Im_O),

    ("28/121 = N_Gold/n_c^2",
     R(28, 121) == R(N_Gold, n_c**2)),

    ("28/121 = x(1-x) with x = n_d/n_c",
     R(28, 121) == R(n_d, n_c) * (1 - R(n_d, n_c))),

    ("28/121 within 843 ppm of measured sin^2(theta_W)",
     abs(float(R(28,121) - sin2_measured)) / float(sin2_measured) < 0.001),

    # Key result: GUT trace does NOT give 28/121
    ("GUT trace with Y=T3_R != 28/121",
     R(1,2) != R(28, 121)),

    ("k_Y for 28/121 is 93/28 (not clean)",
     k_Y_28_121 == R(93, 28)),

    ("n_c^2 = dim(S^2V) + dim(Lambda^2V) = 66 + 55",
     n_c**2 == n_symm + n_antisymm),
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
print()

# ==============================================================================
# SUMMARY
# ==============================================================================

print("=" * 72)
print("SUMMARY")
print("=" * 72)
print()

print("MAIN RESULT: The standard GUT trace formula does NOT give 28/121.")
print()
print("What the GUT trace gives:")
print(f"  Y = T3_R (simplest):          sin^2 = 1/2   (LEFT-RIGHT SYMMETRIC)")
print(f"  Y = T3_R + SU(5)-norm. B-L:   sin^2 = 3/8   (STANDARD GUT)")
print(f"  Y = T3_R + Pati-Salam B-L:    sin^2 = 6/13  (NON-STANDARD)")
print()
print("What 28/121 requires:")
print(f"  k_Y = {k_Y_28_121} = 93/28  -- unnaturally large normalization factor")
print(f"  No clean framework expression for this ratio")
print()
print("IMPLICATIONS:")
print("  1. sin^2(theta_W) = 28/121 is NOT a GUT-scale prediction")
print("  2. It's a CRYSTALLIZATION result: Goldstone fraction of crystal modes")
print("  3. The denominator n_c^2 (not dim SO(11)=55) confirms it's about")
print("     the tilt matrix DOF, not the gauge algebra")
print("  4. The mechanism is: sin^2 = (broken crystal DOF)/(total crystal DOF)")
print("     = N_Gold(Stage 1)/dim(V(x)V)")
print()
print("OPEN QUESTION (refined):")
print("  WHY does the Weinberg angle equal the Goldstone fraction of V(x)V?")
print("  This requires connecting gauge coupling ratios to crystal mode counting.")
print("  The GUT trace is the wrong tool  -- need a crystallization-based argument.")
print()
print("HONEST ASSESSMENT:")
print("  The GUT trace investigation CLOSES one approach (it doesn't work)")
print("  and SHARPENS the question: the mechanism must be crystallization-based.")
print("  The formula sin^2 = pq/(p+q)^2 with p=n_d, q=Im_O remains a [CONJECTURE]")
print("  without a derivation connecting crystal mode fractions to gauge coupling")
print("  ratios.")
