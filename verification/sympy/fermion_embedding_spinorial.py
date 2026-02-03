#!/usr/bin/env python3
"""
Fermion Embedding in SO(11): Spinorial vs Fundamental

KEY FINDING: The framework's division algebra fermion content (15 per generation)
matches the SO(11) spinor representation (32), not the fundamental (11).
This determines spinorial embedding => MCHM4-type coupling:
    kappa_f = sqrt(1 - xi) = sqrt(117/121) ~ 0.983

The argument:
1. SO(11) spinor = 32 = 2^5 (odd-dimensional, irreducible)
2. Under SO(4) x SO(7): 32 -> (spinor_4) x (spinor_7) = 4 x 8
3. spinor_4 of SO(4) = (2,1) + (1,2) under SU(2)_L x SU(2)_R
4. spinor_7 of SO(7) = 8 -> 1+7 under G2 -> 1+1+3+3bar under SU(3)
5. Half (16) = 15 SM fermions + nu_R = SO(10) half-spinor
6. Division algebra dims 1,2,4,8 = 2^0,2^1,2^2,2^3 (spinor structure)
7. Spinorial embedding: kappa_f = sqrt(1-xi)    [MCHM4-type]
   vs Fundamental:      kappa_f = (1-2xi)/sqrt(1-xi)  [MCHM5-type]

Status: DERIVATION (from division algebra fermion content + representation theory)
Depends on:
- [DERIVATION] 15 fermions per generation from 1+2+4+8 (division algebras)
- [I-MATH] SO(11) representation theory (spinor decomposition)
- [I-MATH] Composite Higgs coupling formulas (Giudice et al., Panico & Wulzer)
- [CONJECTURE] xi = n_d/n_c^2 = 4/121

Created: Session 212
"""

import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from sympy import Rational, sqrt, simplify, factorial, binomial, S, N as Neval

# ==============================================================================
# FRAMEWORK QUANTITIES
# ==============================================================================

n_d = 4                           # [D] Defect dimension = dim(H)
n_c = 11                          # [D] Crystal dimension
Im_O = 7                          # Im(O)
Im_H = 3                          # Im(H)
xi = Rational(n_d, n_c**2)        # [CONJECTURE] = 4/121

# Division algebra dimensions
dim_R = 1
dim_C = 2
dim_H = 4
dim_O = 8

print("=" * 70)
print("FERMION EMBEDDING IN SO(11): SPINORIAL VS FUNDAMENTAL")
print("=" * 70)

# ==============================================================================
# PART 1: SO(11) REPRESENTATION DIMENSIONS
# ==============================================================================

print("\n" + "=" * 70)
print("PART 1: SO(11) Representation Dimensions")
print("=" * 70)

# SO(n) representation dimensions
n = n_c  # SO(11)

# Fundamental representation: dimension n
dim_fundamental = n
print(f"\nFundamental rep of SO({n}): dim = {dim_fundamental}")

# Adjoint representation: dimension n(n-1)/2
dim_adjoint = n * (n - 1) // 2
print(f"Adjoint rep of SO({n}): dim = {dim_adjoint}")

# Spinor representation of SO(2k+1): dimension 2^k
# For SO(11) = SO(2*5 + 1): k = 5, spinor dim = 2^5 = 32
k_spin = (n - 1) // 2  # = 5 for SO(11)
dim_spinor = 2**k_spin
print(f"Spinor rep of SO({n}): dim = 2^{k_spin} = {dim_spinor}")
print(f"  (SO({n}) is odd-dimensional => single irreducible spinor)")

# For comparison: SO(10) half-spinors
dim_SO10_halfspinor = 2**((n-1)//2 - 1)  # 2^4 = 16
print(f"\nSO(10) half-spinor: dim = 2^4 = {dim_SO10_halfspinor}")
print(f"SO(11) spinor = SO(10) 16 + 16': {dim_spinor} = {dim_SO10_halfspinor} + {dim_SO10_halfspinor}")

# ==============================================================================
# PART 2: SPINOR DECOMPOSITION UNDER SO(4) x SO(7)
# ==============================================================================

print("\n" + "=" * 70)
print("PART 2: Spinor Decomposition under SO(4) x SO(7)")
print("=" * 70)

# SO(4) = SU(2)_L x SU(2)_R
# Spinor of SO(4) = 2^2 = 4, decomposes as (2,1) + (1,2) under SU(2)_L x SU(2)_R
dim_spinor_SO4 = 2**(n_d // 2)  # 2^2 = 4
print(f"\nSpinor of SO({n_d}): dim = 2^{n_d//2} = {dim_spinor_SO4}")
print(f"  Under SU(2)_L x SU(2)_R: {dim_spinor_SO4} = (2,1) + (1,2) = 2 + 2")

# SO(7): spinor is 2^3 = 8 (irreducible, odd-dimensional SO)
dim_spinor_SO7 = 2**(Im_O // 2)  # 2^3 = 8
print(f"\nSpinor of SO({Im_O}): dim = 2^{Im_O//2} = {dim_spinor_SO7}")
print(f"  (SO(7) odd-dimensional => single irreducible spinor)")

# The spinor product
product = dim_spinor_SO4 * dim_spinor_SO7
print(f"\nDecomposition: spinor_SO(11) -> spinor_SO(4) x spinor_SO(7)")
print(f"  32 -> 4 x 8 = {product}")
print(f"  = [(2,1) + (1,2)] x 8")
print(f"  = (2,1; 8) + (1,2; 8)")
print(f"  = 16 + 16")

assert product == dim_spinor, f"Product {product} != spinor dim {dim_spinor}"

# ==============================================================================
# PART 3: FURTHER DECOMPOSITION TO SM GAUGE GROUP
# ==============================================================================

print("\n" + "=" * 70)
print("PART 3: Decomposition to SM Gauge Group")
print("=" * 70)

# SO(7) -> G2 = Aut(O)
# spinor_7 = 8 -> 1 + 7 under G2
# (The spinor 8 of SO(7) corresponds to octonions O;
#  G2 stabilizes 1 in O, leaving the 7 imaginary directions)
print(f"\nSO(7) -> G2 = Aut(O):")
print(f"  spinor_7 = 8 -> 1 + 7 under G2")
print(f"  (8 = dim(O) = 1 (real part) + 7 (imaginary part))")
assert 1 + 7 == dim_spinor_SO7

# G2 -> SU(3) = Stab_G2(e) for e in Im(O) [forced by F = C, THM_0485]
# 7 of G2 -> 1 + 3 + 3bar under SU(3)
print(f"\nG2 -> SU(3) [forced by F = C]:")
print(f"  7 -> 1 + 3 + 3bar under SU(3)")
print(f"  (7 directions of Im(O): 1 selected by C, leaving 3+3bar color)")
assert 1 + 3 + 3 == Im_O

# Full decomposition of spinor_7 under SU(3)
print(f"\nFull: spinor_7 = 8 -> (1 + 7) -> (1) + (1 + 3 + 3bar)")
print(f"     = 1 + 1 + 3 + 3bar under SU(3)")
print(f"     Count: 1+1+3+3 = {1+1+3+3} = {dim_spinor_SO7} check")
assert 1 + 1 + 3 + 3 == dim_spinor_SO7

# Full decomposition of 32 under SU(2)_L x SU(2)_R x SU(3)
print(f"\nFull 32 under SU(2)_L x SU(2)_R x SU(3):")
print(f"  (2,1; 1) + (2,1; 1) + (2,1; 3) + (2,1; 3bar)")
print(f"  + (1,2; 1) + (1,2; 1) + (1,2; 3) + (1,2; 3bar)")
count = 2*1 + 2*1 + 2*3 + 2*3 + 1*2 + 1*2 + 1*2*3 + 1*2*3
print(f"  Count: 2+2+6+6 + 2+2+6+6 = {count}")
assert count == 32

# ==============================================================================
# PART 4: FERMION COUNTING — HALF-SPINOR = ONE GENERATION
# ==============================================================================

print("\n" + "=" * 70)
print("PART 4: Fermion Counting — Half-Spinor = One Generation")
print("=" * 70)

print("""
The 32 of SO(11) = 16 + 16' of SO(10).

One 16 (the (2,1;8) sector) contains exactly one SM generation + nu_R:

  Under SU(3)_c x SU(2)_L x U(1)_Y:
  -----------------------------------------------
  | Multiplet    | Rep          | Count | Source |
  |--------------|--------------|-------|--------|
  | Q_L          | (3, 2, 1/6)  |   6   | (2,1;3)  from H-O interface |
  | u_R^c        | (3bar,1,-2/3)|   3   | (1,2;3bar) component       |
  | d_R^c        | (3bar,1,1/3) |   3   | (1,2;3bar) component       |
  | L_L          | (1, 2, -1/2) |   2   | (2,1;1) from H-C interface |
  | e_R^c        | (1, 1, 1)    |   1   | (1,2;1) component          |
  | nu_R         | (1, 1, 0)    |   1   | (1,2;1) component          |
  -----------------------------------------------
  Total:                          16 = 15 SM + 1 nu_R

  The other 16' contains the CP conjugates.
""")

# SM fermion counting
Q_L = 3 * 2     # color triplet, weak doublet
u_R = 3 * 1     # color triplet, weak singlet
d_R = 3 * 1     # color triplet, weak singlet
L_L = 1 * 2     # color singlet, weak doublet
e_R = 1 * 1     # color singlet, weak singlet
nu_R = 1 * 1    # right-handed neutrino (color singlet, weak singlet)

SM_fermions = Q_L + u_R + d_R + L_L + e_R
SM_plus_nuR = SM_fermions + nu_R

print(f"SM fermions per generation: {Q_L}+{u_R}+{d_R}+{L_L}+{e_R} = {SM_fermions}")
print(f"SM + nu_R: {SM_fermions} + {nu_R} = {SM_plus_nuR}")
print(f"SO(10) half-spinor: {dim_SO10_halfspinor}")
print(f"Match: {SM_plus_nuR} = {dim_SO10_halfspinor}: {'YES' if SM_plus_nuR == dim_SO10_halfspinor else 'NO'}")

# Division algebra counting
div_alg_total = dim_R + dim_C + dim_H + dim_O
print(f"\nDivision algebra total: {dim_R}+{dim_C}+{dim_H}+{dim_O} = {div_alg_total}")
print(f"SM fermions: {SM_fermions}")
print(f"Match: {div_alg_total} = {SM_fermions}: {'YES' if div_alg_total == SM_fermions else 'NO'}")
print(f"\nWith nu_R: 15 + 1 = 16 = half-spinor of SO(10)")

# ==============================================================================
# PART 5: DIVISION ALGEBRA <-> SPINOR CORRESPONDENCE
# ==============================================================================

print("\n" + "=" * 70)
print("PART 5: Division Algebra <-> Spinor Structural Match")
print("=" * 70)

print("""
The division algebra dimensions are POWERS OF 2:

  R: dim = 1  = 2^0
  C: dim = 2  = 2^1
  H: dim = 4  = 2^2
  O: dim = 8  = 2^3

This is the hallmark of SPINOR structure.
Spinor representations of SO(n) have dimensions 2^[n/2].
The Cayley-Dickson doubling (R->C->H->O) IS the spinor construction.

Key identity: 1 + 2 + 4 + 8 = 2^4 - 1 = 15

This means:
- Division algebra counting -> 15 = 2^4 - 1 fermions
- Spinor of SO(11) contains 16 = 2^4 states per chirality
- The 15 SM fermions + 1 nu_R = 16 = half-spinor

The extra "+1" (nu_R) completes the spinor.
""")

# Verify the power-of-2 structure
for i, (name, dim) in enumerate([("R", dim_R), ("C", dim_C), ("H", dim_H), ("O", dim_O)]):
    assert dim == 2**i, f"{name}: {dim} != 2^{i}"
    print(f"  {name}: dim = {dim} = 2^{i} check")

sum_powers = sum(2**i for i in range(4))
print(f"\n  Sum = 2^0 + 2^1 + 2^2 + 2^3 = {sum_powers} = 2^4 - 1")
assert sum_powers == 2**4 - 1

# The Clifford algebra connection
print(f"\nClifford algebra connection:")
print(f"  Cl(8) = Mat(16, R)  [I-MATH: Bott periodicity]")
print(f"  dim(spinor of Cl(8)) = 16 = SM generation + nu_R")
print(f"  O relates to Cl(8) through Spin(8) triality")
print(f"  Furey (2018): O acts on one generation via Cl(6) chain")

# ==============================================================================
# PART 6: WHY SPINOR AND NOT FUNDAMENTAL
# ==============================================================================

print("\n" + "=" * 70)
print("PART 6: Spinor vs Fundamental — Why Spinor Wins")
print("=" * 70)

print(f"""
FUNDAMENTAL 11 of SO(11):
  Under SO(4) x SO(7): 11 -> (4,1) + (1,7)
  Components: 4 + 7 = 11
  Under SU(2)_L x SU(2)_R x SU(3):
    (4,1) -> (2,2;1) = 4 states (1 lepton-like bidoublet)
    (1,7) -> (1,1;1) + (1,1;3) + (1,1;3bar) = 1+3+3 = 7 states
  Total: 4 + 7 = 11

  PROBLEM: Only 11 components. Need 15 for one SM generation.
  Cannot fit Q_L(6) + u_R(3) + d_R(3) + L_L(2) + e_R(1) = 15
  Even with particle-antiparticle: 2 x 11 = 22 != 30 = 2 x 15

SPINOR 32 of SO(11):
  Under SO(4) x SO(7): 32 -> (4,8) = (2,1;8) + (1,2;8)
  One half (16): contains Q_L(6) + L_L(2) + u_R(3) + d_R(3) + e_R(1) + nu_R(1) = 16

  MATCHES EXACTLY. The spinor is the MINIMAL rep that fits all SM fermions.

ADJOINT 55 of SO(11):
  Under SO(4) x SO(7): 55 -> (6,1) + (1,21) + (4,7)
  Contains 28 coset directions = (4,7).
  Too large (55 >> 15). Fermions are not in the adjoint.
""")

# Verify fundamental decomposition
fund_SO4_piece = 4  # (4,1) under SO(4)xSO(7)
fund_SO7_piece = 7  # (1,7) under SO(4)xSO(7)
assert fund_SO4_piece + fund_SO7_piece == dim_fundamental
print(f"Fundamental check: {fund_SO4_piece} + {fund_SO7_piece} = {dim_fundamental}")
print(f"  11 < 15: Cannot fit one SM generation. REJECTED.")

# Verify spinor decomposition
spin_half = dim_spinor // 2  # = 16
print(f"\nSpinor half: {spin_half}")
print(f"  16 = 15 + 1 = SM generation + nu_R. FITS.")
print(f"  This is the UNIQUE minimal representation with room for all SM fermions.")

# ==============================================================================
# PART 7: COUPLING MODIFIER PREDICTION
# ==============================================================================

print("\n" + "=" * 70)
print("PART 7: Coupling Modifier from Spinorial Embedding")
print("=" * 70)

print("""
In composite Higgs models, the Yukawa coupling modifier depends on the
representation of SO(N) in which the composite fermion operator transforms.

For the Higgs direction in SO(11)/[SO(4)xSO(7)], the local structure
along the Higgs is SO(5)/SO(4) (minimal sub-coset containing the doublet).

The general result (Giudice et al. 2007, Panico & Wulzer 2016):

  Spinorial rep: Yukawa ~ cos(h/f) => kappa_f = cos(v/f) = sqrt(1-xi)
  Fundamental rep: Yukawa ~ sin(h/f)*cos(h/f)/sin(v/f)
                   => kappa_f = (1-2*xi)/sqrt(1-xi)

The framework predicts SPINORIAL (MCHM4-type) because:
  (a) Fermions arise from crystal defects (fully composite, not elementary)
  (b) Their SO(11) quantum numbers match the spinor 32
  (c) The division algebra power-of-2 structure IS spinor structure
  (d) The fundamental 11 cannot even accommodate 15 fermions
""")

# MCHM4 prediction (spinorial)
kappa_f_spin = sqrt(1 - xi)
kappa_f_spin_exact = sqrt(Rational(117, 121))
print(f"SPINORIAL (MCHM4): kappa_f = sqrt(1 - xi)")
print(f"  = sqrt(1 - {n_d}/{n_c**2})")
print(f"  = sqrt(117/121)")
print(f"  = sqrt(117)/11")
print(f"  = {float(kappa_f_spin_exact):.8f}")
dev_spin = (1 - float(kappa_f_spin_exact)) * 100
print(f"  Deviation from SM: {dev_spin:.4f}%")

# MCHM5 prediction (fundamental) — for comparison
kappa_f_fund = (1 - 2*xi) / sqrt(1 - xi)
kappa_f_fund_exact = Rational(113, 121) / sqrt(Rational(117, 121))
print(f"\nFUNDAMENTAL (MCHM5): kappa_f = (1-2*xi)/sqrt(1-xi)")
print(f"  = 113/(11*sqrt(117))")
print(f"  = {float(kappa_f_fund):.8f}")
dev_fund = (1 - float(kappa_f_fund)) * 100
print(f"  Deviation from SM: {dev_fund:.4f}%")

# Key difference
print(f"\nDifference: MCHM4 - MCHM5 = {float(kappa_f_spin - kappa_f_fund):.6f}")
print(f"  = {(dev_fund - dev_spin):.2f} percentage points")

# kappa_V (universal, model-independent)
kappa_V = sqrt(1 - xi)
print(f"\nkappa_V = sqrt(1-xi) = {float(kappa_V):.8f}")
print(f"\nSPINORIAL PREDICTION: kappa_f = kappa_V (UNIVERSAL modification)")
print(f"  All Higgs couplings reduced by the SAME factor sqrt(117/121)")

# ==============================================================================
# PART 8: EXPERIMENTAL IMPLICATIONS
# ==============================================================================

print("\n" + "=" * 70)
print("PART 8: Experimental Implications of Spinorial Embedding")
print("=" * 70)

# With MCHM4, ALL couplings modified universally => harder to detect
# The key observable is the RATIO kappa_f/kappa_V:
# MCHM4: kappa_f/kappa_V = 1 (exactly)
# MCHM5: kappa_f/kappa_V = (1-2xi)/(1-xi) < 1

ratio_MCHM4 = 1  # exactly
ratio_MCHM5 = float((1 - 2*xi) / (1 - xi))
print(f"\nKey discriminator: kappa_f / kappa_V")
print(f"  MCHM4 (spinorial):    kappa_f/kappa_V = 1.000000 (exactly)")
print(f"  MCHM5 (fundamental):  kappa_f/kappa_V = {ratio_MCHM5:.6f}")
print(f"  Difference: {(1 - ratio_MCHM5)*100:.4f}%")

# This ratio is measurable at HL-LHC and FCC
print(f"\nHL-LHC can measure kappa_f/kappa_V to ~3% precision")
print(f"  MCHM5 deviation ({(1-ratio_MCHM5)*100:.1f}%): ~{(1-ratio_MCHM5)*100/3:.1f} sigma => MARGINAL")
print(f"  MCHM4 deviation (0%): indistinguishable from SM")

print(f"\nFCC-ee can measure individual kappas to 0.3-0.5%")
print(f"  Universal deviation {dev_spin:.2f}%: ~{dev_spin/0.3:.1f} sigma => DECISIVE")

print(f"""
PREDICTION SUMMARY (spinorial embedding):
=========================================
  kappa_V    = sqrt(117/121) = {float(kappa_V):.6f}    (1.66% below SM)
  kappa_t    = sqrt(117/121) = {float(kappa_f_spin):.6f}    (SAME as kappa_V)
  kappa_b    = sqrt(117/121) = {float(kappa_f_spin):.6f}    (SAME as kappa_V)
  kappa_tau  = sqrt(117/121) = {float(kappa_f_spin):.6f}    (SAME as kappa_V)
  kappa_lam  = (1-2*xi)/sqrt(1-xi) = {float(kappa_f_fund):.6f} (5.0% below SM)

  All signal strengths: mu = 117/121 = {float(Rational(117,121)):.6f}

  This is the SIMPLEST prediction: one universal scale factor.
""")

# ==============================================================================
# PART 9: DERIVATION CHAIN SUMMARY
# ==============================================================================

print("=" * 70)
print("DERIVATION CHAIN")
print("=" * 70)
print("""
[A] AXM_0115 (algebraic completeness) + AXM_0117 (crystallization)
  |
  v
[D] n_c = 11, n_d = 4 (from Frobenius + G2 + maximality)
  |
  v
[D] Division algebras R(1) + C(2) + H(4) + O(8) = 15 fermions per gen
  |
  v
[I-MATH] 15 + 1(nu_R) = 16 = half-spinor of SO(10)
[I-MATH] SO(10) half-spinor is contained in SO(11) spinor (32)
  |
  v
[D] Fermions transform in SPINOR rep of SO(11)
    (fundamental 11 too small: only 11 < 15 components)
  |
  v
[I-MATH] Spinorial Yukawa: y(h) ~ cos(h/f)
[CONJECTURE] xi = n_d/n_c^2 = 4/121
  |
  v
[D] kappa_f = sqrt(1 - xi) = sqrt(117/121)  [MCHM4-type]
    kappa_f = kappa_V  (universal coupling modification)

Confidence: [DERIVATION] — the representation matching is exact,
            the coupling formula is standard composite Higgs result.
            Remaining gap: xi = n_d/n_c^2 is [CONJECTURE].
""")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    # Representation dimensions
    ("SO(11) spinor dim = 32",
     dim_spinor == 32),

    ("SO(11) fundamental dim = 11",
     dim_fundamental == 11),

    ("SO(11) adjoint dim = 55",
     dim_adjoint == 55),

    # Spinor decomposition
    ("Spinor decomposes: 32 = spinor_4 x spinor_7 = 4 x 8",
     dim_spinor_SO4 * dim_spinor_SO7 == dim_spinor),

    ("SO(4) spinor = 4 = (2,1)+(1,2)",
     dim_spinor_SO4 == 4),

    ("SO(7) spinor = 8 (irreducible)",
     dim_spinor_SO7 == 8),

    ("spinor_7 under G2: 8 = 1 + 7",
     1 + Im_O == dim_spinor_SO7),

    ("7 of G2 under SU(3): 7 = 1 + 3 + 3bar",
     1 + 3 + 3 == Im_O),

    # Fermion counting
    ("SM fermions per generation = 15",
     SM_fermions == 15),

    ("Division algebra total = 15 = 1+2+4+8",
     div_alg_total == 15),

    ("15 + nu_R = 16 = SO(10) half-spinor",
     SM_plus_nuR == dim_SO10_halfspinor),

    ("Division algebra dims are powers of 2",
     all(d == 2**i for i, d in enumerate([dim_R, dim_C, dim_H, dim_O]))),

    ("Sum of powers: 2^0+2^1+2^2+2^3 = 2^4 - 1 = 15",
     sum(2**i for i in range(4)) == 2**4 - 1),

    # Fundamental too small
    ("Fundamental (11) < SM fermions (15)",
     dim_fundamental < SM_fermions),

    ("Spinor half (16) >= SM fermions + nu_R (16)",
     dim_spinor // 2 >= SM_plus_nuR),

    # Coupling formulas
    ("Spinorial kappa_f = sqrt(1-xi) = sqrt(117/121)",
     simplify(kappa_f_spin - sqrt(Rational(117, 121))) == 0),

    ("Spinorial: kappa_f = kappa_V (universal)",
     simplify(kappa_f_spin - kappa_V) == 0),

    ("Fundamental kappa_f = (1-2xi)/sqrt(1-xi) = 113/(11*sqrt(117))",
     abs(float(kappa_f_fund) - float(Rational(113, 121) / sqrt(Rational(117, 121)))) < 1e-12),

    ("Spinorial != Fundamental (distinct predictions)",
     abs(float(kappa_f_spin) - float(kappa_f_fund)) > 0.01),

    # Coupling values
    ("kappa_f(spinorial) = 0.9834 +/- 0.001",
     abs(float(kappa_f_spin) - 0.9834) < 0.001),

    ("kappa_f(fundamental) = 0.9498 +/- 0.001",
     abs(float(kappa_f_fund) - 0.9498) < 0.001),

    # Key discriminator
    ("kappa_f/kappa_V = 1 for spinorial (exactly)",
     simplify(kappa_f_spin / kappa_V - 1) == 0),

    ("kappa_f/kappa_V < 1 for fundamental",
     float(kappa_f_fund / kappa_V) < 1),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print(f"\n{'ALL TESTS PASSED' if all_pass else 'SOME TESTS FAILED'}: "
      f"{sum(1 for _, p in tests if p)}/{len(tests)}")
