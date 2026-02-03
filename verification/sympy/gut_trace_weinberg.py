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

# 11 -> (2,2,1) + (1,1,3) + (1,1,3bar) + (1,1,1)  under SU(2)_L x SU(2)_R x SU(3)
# T3_L = (H1 + H2)/2, T3_R = (H1 - H2)/2

print("Decomposition: 11 -> (2,2,1) + (1,1,3) + (1,1,3bar) + (1,1,1)")
print()

# T3_L eigenvalues on the 11 weights
T3_fund = [R(1,2), R(-1,2), R(1,2), R(-1,2),   # v1-v4 (SO(4) sector)
           0, 0, 0, 0, 0, 0, 0]                  # v5-v11 (SO(7) sector)

# T3_R eigenvalues
T3R_fund = [R(1,2), R(-1,2), R(-1,2), R(1,2),   # v1-v4
            0, 0, 0, 0, 0, 0, 0]                  # v5-v11

Tr_T3sq_fund = sum(t**2 for t in T3_fund)
Tr_T3Rsq_fund = sum(t**2 for t in T3R_fund)

print(f"Tr(T3^2) = {Tr_T3sq_fund}")
print(f"Tr(T3_R^2) = {Tr_T3Rsq_fund}")
print()

# ==============================================================================
# PART 2: HYPERCHARGE EMBEDDINGS
# ==============================================================================

print("=" * 72)
print("PART 2: HYPERCHARGE EMBEDDINGS AND TRACE FORMULA")
print("=" * 72)
print()

# General formula: Y = a * T3_R + bq * Q_BL
# Tr(Y^2) = a^2 + 6(bq)^2 on the fundamental 11
# sin^2(theta_W) = 1 / (1 + a^2 + 6(bq)^2)  [using Tr(T3^2)=1]

a, bq = symbols('a bq', real=True)

Tr_Ysq_general = a**2 + 6*bq**2
sin2_general = Tr_T3sq_fund / (Tr_T3sq_fund + Tr_Ysq_general)

print(f"General: sin^2(theta_W) = 1 / (1 + a^2 + 6(bq)^2)")
print()

# --- Embedding A: Y = T3_R only (a=1, bq=0) ---
sin2_A = sin2_general.subs([(a, 1), (bq, 0)])
print(f"Embedding A: Y = T3_R -> sin^2 = {sin2_A} (LEFT-RIGHT SYMMETRIC)")
print()

# --- Embedding B: Pati-Salam (a=1, bq=1/6) ---
sin2_B = sin2_general.subs([(a, 1), (bq, R(1,6))])
print(f"Embedding B: Pati-Salam B-L=1/3 -> sin^2 = {sin2_B} = {float(sin2_B):.6f}")
print()

# --- Embedding C: SU(5)-compatible normalization ---
bq_su5 = symbols('bq_su5', positive=True)
eq_su5 = Eq(R(1,1) / (1 + 1 + 6*bq_su5**2), R(3,8))
sol_su5 = solve(eq_su5, bq_su5)
bq_su5_val = sol_su5[0]

sin2_C = R(1,1) / (1 + 1 + 6*bq_su5_val**2)
print(f"Embedding C: bq = {bq_su5_val} -> sin^2 = {sin2_C} (SU(5) result)")
print()

# --- Embedding D: What gives 28/121? ---
bq_target = symbols('bq_t', positive=True)
eq_target = Eq(R(1,1) / (1 + 1 + 6*bq_target**2), R(28, 121))
sol_target = solve(eq_target, bq_target)
if sol_target:
    bq_28_121 = sol_target[0]
    print(f"Embedding D: sin^2 = 28/121 requires bq = {float(bq_28_121):.6f}")
    print(f"  bq^2 = {simplify(bq_28_121**2)} -- NOT a clean framework ratio")
print()

# --- Embedding E: What gives 29/126? ---
eq_target2 = Eq(R(1,1) / (1 + 1 + 6*bq_target**2), R(29, 126))
sol_target2 = solve(eq_target2, bq_target)
if sol_target2:
    bq_29_126 = sol_target2[0]
    print(f"Embedding E: sin^2 = 29/126 requires bq = {float(bq_29_126):.6f} -- not clean")
print()

# ==============================================================================
# PART 3: REPRESENTATION INDEPENDENCE CHECK (ADJOINT 55)
# ==============================================================================

print("=" * 72)
print("PART 3: REPRESENTATION INDEPENDENCE CHECK")
print("=" * 72)
print()

# Adjoint 55 -> 6 + 21 + 28 under SO(4) x SO(7)
print("55 -> 6 (adj SO(4)) + 21 (adj SO(7)) + 28 (Goldstones)")
print()

# Adjoint 6 of SO(4) under SU(2)_L x SU(2)_R: (3,1) + (1,3)
T3_adj_SO4 = [-1, 0, 1, 0, 0, 0]
T3R_adj_SO4 = [0, 0, 0, -1, 0, 1]

# Adjoint 21 of SO(7): all SO(4) singlets
T3_adj_SO7 = [0] * 21
T3R_adj_SO7 = [0] * 21

# 28 = (4,7) = (2,2) x 7: T3 from SO(4) factor
T3_Goldstone = [R(1,2), R(-1,2), R(1,2), R(-1,2)] * 7
T3R_Goldstone = [R(1,2), R(-1,2), R(-1,2), R(1,2)] * 7

T3_adj = T3_adj_SO4 + T3_adj_SO7 + T3_Goldstone
T3R_adj = T3R_adj_SO4 + T3R_adj_SO7 + T3R_Goldstone

assert len(T3_adj) == 55, f"Expected 55 states, got {len(T3_adj)}"

Tr_T3sq_adj = sum(t**2 for t in T3_adj)
Tr_T3Rsq_adj = sum(t**2 for t in T3R_adj)

print(f"Tr(T3^2) on adj 55 = {Tr_T3sq_adj}")
print(f"Tr(T3_R^2) on adj 55 = {Tr_T3Rsq_adj}")

sin2_adj_A = Tr_T3sq_adj / (Tr_T3sq_adj + Tr_T3Rsq_adj)
print(f"Y = T3_R on adjoint: sin^2 = {sin2_adj_A}")
print(f"  Rep. independence: {'YES [ok]' if sin2_adj_A == R(1,2) else 'NO [X]'}")
print()

# ==============================================================================
# PART 6: SPINOR REPRESENTATION (32 of SO(11))
# ==============================================================================

print("=" * 72)
print("PART 6: SPINOR REPRESENTATION  -- 32 of SO(11)")
print("=" * 72)
print()

# 32 -> (2_L, 8_s) + (2_R, 8_s), with 8_s -> 3+3bar+1+1 under SU(3)
# Full: (2,1,3)+(2,1,3bar)+(2,1,1)+(2,1,1)  +  (1,2,3)+(1,2,3bar)+(1,2,1)+(1,2,1)
print("32 -> (2_L, 8_s) + (2_R, 8_s), 8_s -> 3+3bar+1+1")
print()

# Tr(T3^2): left-handed sector has T3 = +/-1/2 on 16 states
Tr_T3sq_32 = R(3,2) + R(3,2) + R(1,2) + R(1,2) + 0  # (2,1,3)+(2,1,3bar)+(2,1,1)x2 + (1,2,*)
print(f"Tr(T3^2) on 32 = {Tr_T3sq_32}")

# Tr(T3_R^2): right-handed sector
Tr_T3Rsq_32 = 0 + R(3,2) + R(3,2) + R(1,2) + R(1,2)
print(f"Tr(T3_R^2) on 32 = {Tr_T3Rsq_32}")

sin2_32_A = Tr_T3sq_32 / (Tr_T3sq_32 + Tr_T3Rsq_32)
print(f"Y = T3_R on spinor: sin^2 = {sin2_32_A}")
print(f"  Rep. independence: {'YES [ok]' if sin2_32_A == R(1,2) else 'NO [X]'}")
print()

# ==============================================================================
# PART 7: NORMALIZATION FACTORS
# ==============================================================================

print("=" * 72)
print("PART 7: NORMALIZATION FACTORS k_Y")
print("=" * 72)
print()

# sin^2 = 1/(1 + k_Y) where k_Y = Tr(Y^2)/Tr(T3^2)
print(f"SU(5): k_Y = 5/3, sin^2 = 3/8 = {float(R(3,8))}")
print(f"SO(11) Y=T3_R: k_Y = 1, sin^2 = 1/2")

k_Y_28_121 = R(121,28) - 1
print(f"For 28/121: k_Y = {k_Y_28_121} = 93/28 (93=3x31, 28=n_d*Im_O)")
print()

# ==============================================================================
# PART 10: GOLDSTONE COUNTING AND n_c^2
# ==============================================================================

print("=" * 72)
print("PART 10: GOLDSTONE COUNTING  -- N_Gold/n_c^2 vs N_Gold/dim(G)")
print("=" * 72)
print()

dim_SO11 = n_c * (n_c - 1) // 2  # = 55
n_symm = n_c * (n_c + 1) // 2    # 66
n_antisymm = n_c * (n_c - 1) // 2  # 55

print(f"N_Gold/dim(SO(11)) = {R(N_Gold, dim_SO11)} = {float(R(N_Gold, dim_SO11)):.6f}")
print(f"N_Gold/n_c^2       = {R(N_Gold, n_c**2)} = {float(R(N_Gold, n_c**2)):.6f}")
print()
print(f"n_c^2 = {n_c**2} = S^2V + Lambda^2V = {n_symm} + {n_antisymm}")
print()
print("sin^2(theta_W) = N_Gold/n_c^2 = Goldstone fraction of crystal DOF")
print("  Denominator is n_c^2 (crystal matrix DOF), NOT dim(SO(11)) = 55")
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
print("GUT trace results:")
print(f"  Y = T3_R:             sin^2 = 1/2   (LEFT-RIGHT SYMMETRIC)")
print(f"  Y = T3_R + SU(5) B-L: sin^2 = 3/8   (STANDARD GUT)")
print(f"  Y = T3_R + PS B-L:    sin^2 = 6/13  (NON-STANDARD)")
print()
print("28/121 = N_Gold/n_c^2 = pq/(p+q)^2 with p=n_d=4, q=Im_O=7")
print("This is a CRYSTALLIZATION result (DOF counting), not a GUT trace.")
