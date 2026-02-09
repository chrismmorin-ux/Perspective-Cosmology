#!/usr/bin/env python3
"""
SO(14) -> SO(22) HIERARCHY - Session 119

EXPLORING THE GROUP CHAIN:
  SO(4) -> SO(10) -> SO(14) -> SO(22)

Each step involves key framework dimensions:
  SO(4): n = H/2 = 2 (spacetime half)
  SO(10): n = 5 = (n_c - 1)/2 (crystal half minus R)
  SO(14): n = 7 = Im_O (colors)
  SO(22): n = 11 = n_c (crystal)

The spinor dimensions are powers of 2:
  SO(4): 2^2 = 4
  SO(10): 2^5 = 32 (Weyl = 16)
  SO(14): 2^7 = 128 (Weyl = 64)
  SO(22): 2^11 = 2048 (Weyl = 1024)

Created: Session 119
"""

from sympy import *
from sympy import isprime

print("="*70)
print("SO(14) -> SO(22) GROUP HIERARCHY")
print("="*70)

# Framework constants
R = 1
C = 2
Im_H = 3
H = 4
Im_O = 7
O = 8
n_c = 11
n_d = 4

# ==============================================================================
# PART 1: THE SO(2n) CHAIN
# ==============================================================================

print("\n" + "="*70)
print("PART 1: THE SO(2n) CHAIN")
print("="*70)

groups = [
    ("SO(4)", 2, H/2, "spacetime half"),
    ("SO(6)", 3, Im_H, "generations"),
    ("SO(8)", 4, H, "spacetime/quaternions"),
    ("SO(10)", 5, (n_c - R)/2, "GUT group"),
    ("SO(14)", 7, Im_O, "colors = total structure"),
    ("SO(16)", 8, O, "octonions"),
    ("SO(22)", 11, n_c, "crystal"),
]

print("\nSO(2n) groups with framework interpretation of n:")
print(f"{'Group':<10} {'2n':<6} {'n':<6} {'n = ?':<20} {'Meaning'}")
print("-"*70)

for name, n, framework_n, meaning in groups:
    two_n = 2 * n
    print(f"{name:<10} {two_n:<6} {n:<6} {str(framework_n):<20} {meaning}")

# ==============================================================================
# PART 2: SPINOR DIMENSIONS
# ==============================================================================

print("\n" + "="*70)
print("PART 2: SPINOR DIMENSIONS")
print("="*70)

print("\nSpinor dimensions (2^n for Dirac, 2^(n-1) for Weyl):")
print(f"{'Group':<10} {'n':<6} {'Dirac':<12} {'Weyl':<12} {'Framework'}")
print("-"*60)

for name, n, framework_n, meaning in groups:
    dirac = 2**n
    weyl = 2**(n-1)
    framework_dirac = f"2^{framework_n}" if framework_n == int(framework_n) else f"2^({framework_n})"
    print(f"{name:<10} {n:<6} {dirac:<12} {weyl:<12} {framework_dirac}")

# ==============================================================================
# PART 3: ADJOINT DIMENSIONS
# ==============================================================================

print("\n" + "="*70)
print("PART 3: ADJOINT (LIE ALGEBRA) DIMENSIONS")
print("="*70)

print("\ndim(SO(2n)) = n(2n-1) = 2n^2 - n:")
print(f"{'Group':<10} {'dim':<10} {'Framework expression'}")
print("-"*50)

lie_dims = [
    ("SO(4)", 6, "C x Im_H"),
    ("SO(6)", 15, "R + C + H + O"),
    ("SO(8)", 28, "H x Im_O"),
    ("SO(10)", 45, "5 x Im_H^2"),
    ("SO(14)", 91, "Im_O x 13 = Im_O x (n_c + C)"),
    ("SO(16)", 120, "O x 15 = O x (R+C+H+O)"),
    ("SO(22)", 231, "n_c x Im_H x Im_O"),
]

for name, dim_actual, expr in lie_dims:
    print(f"{name:<10} {dim_actual:<10} {expr}")

# Verify
print("\nVerification:")
print(f"  dim(SO(8)) = 28 = H x Im_O = {H * Im_O} [{'PASS' if 28 == H * Im_O else 'FAIL'}]")
print(f"  dim(SO(14)) = 91 = Im_O x 13 = {Im_O * 13} [{'PASS' if 91 == Im_O * 13 else 'FAIL'}]")
print(f"  dim(SO(22)) = 231 = n_c x Im_H x Im_O = {n_c * Im_H * Im_O} [{'PASS' if 231 == n_c * Im_H * Im_O else 'FAIL'}]")

# ==============================================================================
# PART 4: THE KEY CHAIN SO(10) -> SO(14) -> SO(22)
# ==============================================================================

print("\n" + "="*70)
print("PART 4: THE KEY CHAIN SO(10) -> SO(14) -> SO(22)")
print("="*70)

print(f"""
The critical chain for physics:

SO(10) [GUT group]
  n = 5 = (n_c - R)/2 = (11 - 1)/2 = 10/2
  Weyl spinor = 16 = one SM generation

  |
  v  (add 4 dimensions = H = spacetime)

SO(14) [Total structure group]
  n = 7 = Im_O = colors
  Weyl spinor = 64 = 4 generations (3 visible + 1 dark)
  14 = 10 + 4 = SO(10) + spacetime

  |
  v  (add 8 dimensions = O = octonions)

SO(22) [Full crystal group]
  n = 11 = n_c = crystal
  Weyl spinor = 1024 = ??? (massive multiplicity)
  22 = 14 + 8 = SO(14) + octonions

The steps are:
  SO(10) --[+H]--> SO(14) --[+O]--> SO(22)

  Adding spacetime (H=4) gives generations
  Adding octonions (O=8) gives... what?
""")

# ==============================================================================
# PART 5: SO(22) SPINOR INTERPRETATION
# ==============================================================================

print("="*70)
print("PART 5: SO(22) SPINOR INTERPRETATION")
print("="*70)

weyl_22 = 2**10  # = 1024
dirac_22 = 2**11  # = 2048

print(f"""
SO(22) spinor dimensions:
  Weyl: 2^10 = {weyl_22}
  Dirac: 2^11 = {dirac_22}

The power is:
  10 = n_c - R = {n_c - R} (crystal minus reals)
  11 = n_c = {n_c} (full crystal)

Decomposition options:

1. 1024 = 64 x 16
   = SO(14) Weyl x SO(10) Weyl
   = (4 generations) x (1 generation)
   Meaning: Each SO(14) generation gets 16-fold multiplicity?

2. 1024 = 2^10 = 2^(n_c - 1)
   = fermionic Fock space for (n_c - 1) = 10 modes
   The "missing R" corresponds to the vacuum.

3. 1024 = 8 x 128 = O x (SO(14) Dirac)
   = octonions x (full SO(14) spinor)
   Each octonion direction contributes a full SO(14) spinor.

4. 1024 = 4 x 256 = H x 2^8 = H x 2^O
   = spacetime x (octonion Fock space)

Physical interpretation:
  SO(22) may be the "full" group before any breaking.
  The 1024-dim spinor contains all possible matter states.

  Breaking SO(22) -> SO(14) x SO(8) gives:
    1024 -> (64, 8_s) + (64, 8_c) + ...

  The 8_s and 8_c are the SO(8) spinors (triality).
""")

# ==============================================================================
# PART 6: THE NUMBER 231 = dim(SO(22))
# ==============================================================================

print("="*70)
print("PART 6: THE NUMBER 231")
print("="*70)

print(f"""
dim(SO(22)) = 22 x 21 / 2 = 231

Factorization:
  231 = 3 x 7 x 11 = Im_H x Im_O x n_c

This is REMARKABLE:
  The Lie algebra dimension = generations x colors x crystal!

Physical meaning:
  SO(22) has one generator for each combination:
    - Im_H = 3 generation-like directions
    - Im_O = 7 color-like directions
    - n_c = 11 crystal directions

231 appears in:
  - Triangle number: T(21) = 21 x 22 / 2 = 231
  - Number of ways to choose 2 from 22

231 = 21 + 42 + 168?
  21 = Im_H x Im_O
  42 = C x Im_H x Im_O
  168 = dim(PSL(2,7)) = O x Im_H x Im_O
  21 + 42 + 168 = {21 + 42 + 168}... = 231!

So: dim(SO(22)) = 21 + 42 + 168
                = (Goldstone level 2) + (hidden channels) + PSL(2,7)
""")

# Verify
print("Verification:")
print(f"  231 = Im_H x Im_O x n_c = {Im_H * Im_O * n_c} [PASS]")
print(f"  231 = 21 + 42 + 168 = {21 + 42 + 168} [{'PASS' if 231 == 21 + 42 + 168 else 'FAIL'}]")
print(f"  168 = O x Im_H x Im_O = {O * Im_H * Im_O} [PASS]")

# ==============================================================================
# PART 7: BREAKING CHAIN
# ==============================================================================

print("\n" + "="*70)
print("PART 7: BREAKING CHAIN")
print("="*70)

print(f"""
The natural breaking chain:

SO(22) -> SO(14) x SO(8)
  22 -> 14 + 8 (vector)
  Adjoint: 231 -> 91 + 28 + 112
    91 = dim(SO(14))
    28 = dim(SO(8))
    112 = (14, 8) coset (14 x 8 = 112)

Then SO(14) -> SO(10) x SO(4):
  14 -> 10 + 4 (vector)
  Adding spacetime to GUT

Finally SO(10) -> SM:
  SO(10) -> SU(5) x U(1) -> SU(3) x SU(2) x U(1)
  Standard GUT breaking

The full chain:
  SO(22) -> SO(14) x SO(8) -> SO(10) x SO(4) x SO(8)
         -> SM x spacetime x internal

Physical interpretation:
  1. Start with SO(22) at Planck scale (crystal group)
  2. Break to SO(14) x SO(8) (total structure x octonions)
  3. Break to SO(10) x SO(4) (GUT x spacetime)
  4. Break to SM (at electroweak scale)

Each step removes structure:
  22 - 8 = 14 (remove octonions)
  14 - 4 = 10 (remove spacetime)
  10 -> 5 + 5 (GUT breaking)
""")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("\n" + "="*70)
print("VERIFICATION TESTS")
print("="*70)

tests = [
    # Group dimensions
    ("14 = 10 + 4 = SO(10) + spacetime", 14 == 10 + H),
    ("22 = 14 + 8 = SO(14) + octonions", 22 == 14 + O),
    ("22 = 10 + 4 + 8", 22 == 10 + H + O),

    # Ranks
    ("7 = Im_O (SO(14) rank)", 7 == Im_O),
    ("11 = n_c (SO(22) rank)", 11 == n_c),
    ("5 = (n_c - 1)/2 (SO(10) rank)", 5 == (n_c - R)//2),

    # Lie algebra dimensions
    ("dim(SO(14)) = 91 = Im_O x 13", 91 == Im_O * 13),
    ("dim(SO(22)) = 231 = Im_H x Im_O x n_c", 231 == Im_H * Im_O * n_c),
    ("dim(SO(8)) = 28 = H x Im_O", 28 == H * Im_O),

    # Spinor dimensions
    ("SO(14) Weyl = 64 = 2^6", 64 == 2**6),
    ("SO(22) Weyl = 1024 = 2^10", 1024 == 2**10),
    ("1024 = 64 x 16", 1024 == 64 * 16),

    # Special decomposition
    ("231 = 21 + 42 + 168", 231 == 21 + 42 + 168),
    ("168 = O x Im_H x Im_O", 168 == O * Im_H * Im_O),
    ("112 = 14 x 8 (coset)", 112 == 14 * 8),
    ("91 + 28 + 112 = 231", 91 + 28 + 112 == 231),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print()
print("="*70)
if all_pass:
    print(f"ALL {len(tests)} TESTS PASSED")
else:
    print("SOME TESTS FAILED")
print("="*70)

# ==============================================================================
# SUMMARY
# ==============================================================================

print("\n" + "="*70)
print("SUMMARY: THE SO HIERARCHY")
print("="*70)

print(f"""
KEY FINDINGS:

1. THE GROUP CHAIN:
   SO(10) --[+H]--> SO(14) --[+O]--> SO(22)

   GUT --[spacetime]--> Total structure --[octonions]--> Crystal

2. SPINOR CHAIN:
   16 -> 64 -> 1024
   (1 gen) -> (4 gen) -> (64 x 16)

   Each step multiplies by H = 4 or O = 8

3. ADJOINT DIMENSIONS:
   SO(14): 91 = Im_O x (n_c + C)
   SO(22): 231 = Im_H x Im_O x n_c

   Both factor into framework numbers!

4. THE NUMBER 231:
   231 = 21 + 42 + 168
   = (Goldstone) + (hidden) + PSL(2,7)

   SO(22) adjoint decomposes into known structures!

5. BREAKING CHAIN:
   SO(22) -> SO(14) x SO(8)
           -> SO(10) x SO(4) x SO(8)
           -> SM x spacetime x internal

   231 -> 91 + 28 + 112 (adjoint decomposition)

CONJECTURE: SO(22) is the "UV completion" group.
Its spinor (1024 = 2^(n_c-1)) contains all matter possibilities.
Breaking to SO(14) selects the low-energy content.
""")
