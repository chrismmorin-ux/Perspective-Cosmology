#!/usr/bin/env python3
"""
Beta Coefficients from Framework Particle Content

KEY FINDING: Universal fermion Dynkin index S_2^f = 6 = C * Im_H across all
three SM gauge groups. Gives universal fermion contribution f = n_d = 4.
Combined with 11/3 = n_c/Im_H [UNPROVEN], yields b_3 = -(n_c - n_d) = -Im_O.

Status: INVESTIGATION (advancing EQ-008)
"""
from sympy import Rational, Abs

# ==================== FRAMEWORK QUANTITIES ====================
R, C_dim, H_dim, O_dim = 1, 2, 4, 8
Im_C, Im_H, Im_O = 1, 3, 7
n_d = H_dim           # = 4
n_c = 11
N_c = Im_H            # = 3 colors [DERIVED]
n_gen = Im_H           # = 3 generations [DERIVED]

# ==================== PARTICLE CONTENT (framework-derived) ====================
# Quarks per gen per color: Q_L(2 Weyl) + u_R(1) + d_R(1) = 4 = n_d
n_quark_weyl = n_d
# SU(2) doublets per gen: N_c quarks + 1 lepton = N_c + 1 = n_d
n_doublets = N_c + 1   # = n_d by dim(H) = Im(H) + 1

# ==================== DYNKIN INDEX SUMS ====================
T_f = Rational(1, 2)
S2f_SU3 = n_gen * n_quark_weyl * T_f           # = 6
S2f_SU2 = n_gen * n_doublets * T_f             # = 6
# U(1) GUT norm: per-gen sum Y'^2 = 2
Y2_per_gen = (Rational(1,10) + Rational(4,5) + Rational(1,5)
              + Rational(3,10) + Rational(3,5))
S2f_U1 = n_gen * Y2_per_gen                    # = 6

# Scalar (Higgs) indices
S2s_SU3 = 0
S2s_SU2 = Rational(1, 2)                       # 1 doublet
S2s_U1 = 2 * Rational(3, 5) * Rational(1, 4)   # 2 comp, Y=1/2, GUT

# ==================== BETA COEFFICIENTS ====================
gc = Rational(11, 3)  # gauge loop coefficient
b3 = -gc * N_c + Rational(2,3) * S2f_SU3 + Rational(1,3) * S2s_SU3
b2 = -gc * 2  + Rational(2,3) * S2f_SU2 + Rational(1,3) * S2s_SU2
b1 =            Rational(2,3) * S2f_U1  + Rational(1,3) * S2s_U1

# Contributions
f3 = Rational(2,3) * S2f_SU3
f2 = Rational(2,3) * S2f_SU2
f1 = Rational(2,3) * S2f_U1
g3 = gc * N_c
g2 = gc * 2
h2 = Rational(1,3) * S2s_SU2
h1 = Rational(1,3) * S2s_U1

# Higgs-free
b3_nH = -g3 + f3
b2_nH = -g2 + f2
b1_nH = f1

# ==================== TESTS ====================
tests = []

# --- Correct values ---
tests.append(("b_3 = -7", b3 == -7))
tests.append(("b_2 = -19/6", b2 == Rational(-19, 6)))
tests.append(("b_1 = 41/10", b1 == Rational(41, 10)))

# --- Universal fermion Dynkin index ---
tests.append(("S2f(SU3) = 6", S2f_SU3 == 6))
tests.append(("S2f(SU2) = 6", S2f_SU2 == 6))
tests.append(("S2f(U1)  = 6", S2f_U1 == 6))
tests.append(("S2f = C * Im_H", S2f_SU3 == C_dim * Im_H))

# --- Universal fermion contribution = n_d ---
tests.append(("f(SU3) = n_d = 4", f3 == n_d))
tests.append(("f(SU2) = n_d = 4", f2 == n_d))
tests.append(("f(U1)  = n_d = 4", f1 == n_d))

# --- Framework identities ---
tests.append(("N_c = Im_H", N_c == Im_H))
tests.append(("N_c + 1 = n_d", N_c + 1 == n_d))
tests.append(("n_quark_weyl = n_d", n_quark_weyl == n_d))
tests.append(("n_doublets = n_d", n_doublets == n_d))

# --- The 11/3 = n_c/Im_H identity ---
tests.append(("11/3 = n_c/Im_H", gc == Rational(n_c, Im_H)))

# --- b_3 = -(n_c - n_d) = -Im_O ---
tests.append(("|b_3| = n_c - n_d", Abs(b3) == n_c - n_d))
tests.append(("|b_3| = Im_O", Abs(b3) == Im_O))
tests.append(("b_3 = n_d - n_c", b3 == n_d - n_c))

# --- Higgs-free beta coefficients ---
tests.append(("b3(no H) = -(n_c - n_d) = -Im_O", b3_nH == -(n_c - n_d)))
tests.append(("b2(no H) = -(Im_H+Im_O)/Im_H", b2_nH == -Rational(Im_H+Im_O, Im_H)))
tests.append(("b1(no H) = n_d", b1_nH == n_d))

# --- Higgs-free ratio ---
tests.append(("b3/b2(no H) = Im_H*Im_O/(Im_H+Im_O)",
              Rational(int(b3_nH), 1) / b2_nH == Rational(Im_H*Im_O, Im_H+Im_O)))
tests.append(("b3/b1(no H) = -Im_O/n_d",
              Rational(int(b3_nH), 1) / b1_nH == Rational(-Im_O, n_d)))

# --- Higgs contributions ---
tests.append(("h(SU2) = 1/(C*Im_H)", h2 == Rational(1, C_dim * Im_H)))
tests.append(("h(U1)  = 1/(Im_H+Im_O)", h1 == Rational(1, Im_H + Im_O)))

# --- S105 decompositions (pattern-matching quality check) ---
tests.append(("S105: b2 = (n_c+O)/(C*Im_H)", Abs(b2) == Rational(n_c+O_dim, C_dim*Im_H)))
# b_1 has MULTIPLE decompositions (weakens S105 claim)
alt1 = Rational(Im_H * n_c + O_dim, Im_H + Im_O)
alt2 = Rational(2 + 5 + 13 + 17 + H_dim, C_dim * 5)
tests.append(("b1 alt1: (Im_H*n_c+O)/(Im_H+Im_O)", alt1 == b1))
tests.append(("b1 alt2: (H_sum+H)/(C*5) [S105]", alt2 == b1))

# ==================== OUTPUT ====================
print("=" * 60)
print("BETA COEFFICIENTS FROM FRAMEWORK PARTICLE CONTENT")
print("=" * 60)

print(f"\n--- SM Beta Coefficients ---")
print(f"b_3 = {b3}  (SU(3), QCD)")
print(f"b_2 = {b2}  (SU(2), weak)")
print(f"b_1 = {b1}  (U(1), hypercharge, GUT norm)")

print(f"\n--- Decomposition: b_i = -gauge + fermion + Higgs ---")
print(f"SU(3): b_3 = -{g3} + {f3} + 0     = {b3}")
print(f"SU(2): b_2 = -{g2} + {f2} + {h2}  = {b2}")
print(f"U(1):  b_1 =   0   + {f1} + {h1}  = {b1}")

print(f"\n--- Universal Fermion Contribution ---")
print(f"S_2^f = {S2f_SU3} for ALL gauge groups (= C * Im_H = {C_dim}*{Im_H})")
print(f"Fermion contribution = (2/3)*6 = {f3} = n_d [STRUCTURAL]")
print(f"Universality from: N_c + 1 = {N_c}+1 = {n_d} = n_d")
print(f"  i.e., dim(H) = Im(H) + 1 [division algebra identity]")

print(f"\n--- The 11/3 = n_c/Im_H Identity ---")
print(f"Gauge loop coefficient = {gc} = {n_c}/{Im_H} = n_c/Im_H")
print(f"Status: ARITHMETIC IDENTITY [UNPROVEN as structural]")
print(f"IF structural: b_3 = n_d - n_c = {n_d}-{n_c} = {n_d-n_c} = -Im_O")

print(f"\n--- Higgs-Free Beta Coefficients ---")
print(f"|b_3| = {Abs(b3_nH)} = Im_O")
print(f"|b_2| = {Abs(b2_nH)} = (Im_H+Im_O)/Im_H = {Im_H+Im_O}/{Im_H}")
print(f"|b_1| = {Abs(b1_nH)} = n_d")

print(f"\n--- b_1 Multiple Decompositions (weakens S105) ---")
print(f"Alt 1: (Im_H*n_c + O)/(Im_H+Im_O) = ({Im_H*n_c}+{O_dim})/({Im_H+Im_O}) = {alt1}")
print(f"Alt 2: (H_sum + H)/(C*5) = (37+4)/(2*5) = {alt2}  [S105, uses ad hoc H_sum]")
print(f"Both equal b_1 = {b1} -> decomposition NOT unique")

print(f"\n--- Classification ---")
print(f"STRUCTURAL [DERIVATION]:")
print(f"  * S_2^f = 6 = C*Im_H universal across all gauge groups")
print(f"  * Fermion contribution = n_d = 4 universal")
print(f"  * Universality from dim(H) = Im(H) + 1")
print(f"CONDITIONAL [CONJECTURE]:")
print(f"  * b_3 = -(n_c - n_d) = -Im_O  (needs 11/3 = n_c/Im_H)")
print(f"PATTERN MATCHING:")
print(f"  * b_2 = (n_c+O)/(C*Im_H) -- one decomposition among few")
print(f"  * b_1 = multiple decompositions exist -- NOT unique")

# ==================== RUN TESTS ====================
print(f"\n{'='*60}")
print(f"VERIFICATION TESTS")
print(f"{'='*60}\n")

passed = 0
failed = 0
for name, result in tests:
    status = "PASS" if result else "FAIL"
    if result:
        passed += 1
    else:
        failed += 1
    print(f"[{status}] {name}")

print(f"\n{'='*60}")
print(f"TOTAL: {passed}/{passed+failed} PASS, {failed} FAIL")
print(f"{'='*60}")
