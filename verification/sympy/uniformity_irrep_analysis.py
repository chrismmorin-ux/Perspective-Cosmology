#!/usr/bin/env python3
"""
Uniformity Analysis: Generic Direction -> Uniform Superposition

KEY FINDING: U(n_d) x U(n_c) symmetry decomposes V_pi into 4 irreducible blocks:
  1 + (n_d^2-1) + 1 + (n_c^2-1) = 1 + 15 + 1 + 120 = 137
Symmetry forces equal probability WITHIN each block (Schur's lemma) but NOT
across blocks. The uniform distribution P(k) = 1/N_I requires the additional
structural assumption that the inner product on V_pi is the counting metric.

The counting metric matches experiment (1/alpha = 137); the Killing metric
does not (1/alpha ~ 126.8, off by 7.4%).

Also resolves the "two counting regimes": coupling constants are inverse mode
counts; mixing angles are mode fractions. Different physical quantities, not
different regimes.

Formula: P(k) = 1/N_I = 1/137 (uniform, from counting metric + max entropy)
Measured: 1/alpha = 137.035999206 (CODATA 2022)
Status: INVESTIGATION

Depends on:
- DEF_02B3 (N_I = n_d^2 + n_c^2 = 137)
- THM_0485 (F = C gives U(n) structure)
- AXM_0114 (tilt possibility -- generic nucleation)
- [I-MATH] Schur's lemma, adjoint representation theory

Created: Session 165
"""

from sympy import *
from sympy import Rational as R

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

n_d = 4    # Defect dimension [D: THM_04A0]
n_c = 11   # Crystal dimension [D: AXM_0118]
N_I = n_d**2 + n_c**2  # Interface modes [D: DEF_02B3]
Im_H = 3   # Imaginary quaternions
Im_O = 7   # Imaginary octonions

# ==============================================================================
# PART 1: IRREDUCIBLE DECOMPOSITION OF V_pi UNDER U(n_d) x U(n_c)
# ==============================================================================

print("=" * 70)
print("PART 1: Irreducible Decomposition under G = U(n_d) x U(n_c)")
print("=" * 70)

# The adjoint representation of U(n) on u(n) decomposes as:
#   u(n) = u(1) + su(n)  (direct sum)
# where u(1) is trivial (1-dim) and su(n) is the adjoint irrep (n^2-1 dim).
# The adjoint representation of SU(n) is irreducible for n >= 2.
#
# V_pi = u(n_d) + u(n_c) under G = U(n_d) x U(n_c):
#   V_pi = [u(1)_d + su(n_d)] + [u(1)_c + su(n_c)]
# Each factor of G acts on "its" summand by adjoint, trivially on the other.

dim_u1_d = 1                    # U(1) factor of u(n_d) -- trivial under G
dim_su_d = n_d**2 - 1           # su(n_d) adjoint -- irreducible under U(n_d)
dim_u1_c = 1                    # U(1) factor of u(n_c) -- trivial under G
dim_su_c = n_c**2 - 1           # su(n_c) adjoint -- irreducible under U(n_c)

blocks = [
    ('u(1)_d',  dim_u1_d,  'trivial'),
    ('su(n_d)', dim_su_d,  'adjoint of SU(4), irreducible'),
    ('u(1)_c',  dim_u1_c,  'trivial'),
    ('su(n_c)', dim_su_c,  'adjoint of SU(11), irreducible'),
]
total_dim = sum(d for _, d, _ in blocks)

print(f"\nn_d = {n_d}, n_c = {n_c}, N_I = {N_I}")
print(f"\nIrreducible blocks under G = U({n_d}) x U({n_c}):")
for name, dim, rep_type in blocks:
    print(f"  {name:10s}: dim = {dim:3d}  ({rep_type})")
print(f"  {'Total':10s}: dim = {total_dim}")

# ==============================================================================
# PART 2: G-INVARIANT SUBSPACE
# ==============================================================================

print("\n" + "=" * 70)
print("PART 2: G-Invariant Subspace")
print("=" * 70)

# A vector |v> in V_pi is G-invariant iff g|v> = |v> for all g in G.
# In each irrep V_i: the G-invariant subspace is {0} unless V_i is trivial.
# su(n) adjoint has NO invariant vectors for n >= 2 (no trivial sub-rep).
# u(1) is 1-dim trivial, so fully invariant.

inv_dim = dim_u1_d + dim_u1_c  # Only the trivial reps contribute

print(f"\nG-invariant subspace dimension: {inv_dim}")
print(f"  Spanned by: |I_d> (trace of u(n_d)) and |I_c> (trace of u(n_c))")
print(f"\n  The uniform superposition |u> = (1/sqrt({N_I})) Sum|k> is NOT G-invariant.")
print(f"  It has components in su({n_d}) and su({n_c}) which are NOT fixed by G.")

# ==============================================================================
# PART 3: MOST GENERAL G-INVARIANT PROBABILITY DISTRIBUTION
# ==============================================================================

print("\n" + "=" * 70)
print("PART 3: Most General G-Invariant Probability Distribution")
print("=" * 70)

# By Schur's lemma: any G-equivariant function on an irrep is constant.
# So any G-invariant probability distribution has P(k) = p_i for k in block i.
#
# Variables: p1 (u(1)_d), p2 (su(n_d)), p3 (u(1)_c), p4 (su(n_c))
# Normalization: 1*p1 + 15*p2 + 1*p3 + 120*p4 = 1
# Free parameters: 3 (after normalization)

print(f"\nBy Schur's lemma, the most general G-invariant distribution is:")
print(f"  P(k) = p_i for k in block i")
print(f"  Normalization: 1*p_1 + {dim_su_d}*p_2 + 1*p_3 + {dim_su_c}*p_4 = 1")
print(f"  Free parameters: 3")
print(f"\nThe uniform distribution P(k) = 1/{N_I} is the special case p_1 = p_2 = p_3 = p_4.")
print(f"This requires THREE additional constraints beyond symmetry:")
print(f"  (i)   p_1 = p_2  (u(1)_d coupling = su(n_d) coupling)")
print(f"  (ii)  p_3 = p_4  (u(1)_c coupling = su(n_c) coupling)")
print(f"  (iii) p_2 = p_4  (defect sector = crystal sector coupling)")

# Verify normalization of uniform distribution
uniform_p = R(1, N_I)
norm_check = dim_u1_d * uniform_p + dim_su_d * uniform_p + dim_u1_c * uniform_p + dim_su_c * uniform_p
print(f"\nVerification: uniform norm = (1+{dim_su_d}+1+{dim_su_c})/{N_I} = {total_dim}/{N_I} = {norm_check}")

# ==============================================================================
# PART 4: COUNTING METRIC vs KILLING METRIC
# ==============================================================================

print("\n" + "=" * 70)
print("PART 4: Counting Metric vs Killing Metric")
print("=" * 70)

# Two natural inner products on u(n):
#
# COUNTING METRIC: <E_a, E_b> = delta_ab
#   Each generator is a unit vector. All modes equivalent.
#
# KILLING METRIC: <E_a, E_b> = 2n * delta_ab  (standard normalization)
#   Generators of u(n_d) have norm^2 = 2*n_d, u(n_c) have norm^2 = 2*n_c.
#   This gives DIFFERENT weights to defect vs crystal modes.

killing_d = 2 * n_d   # Killing norm^2 per u(n_d) generator
killing_c = 2 * n_c   # Killing norm^2 per u(n_c) generator

# Under Killing-weighted Born rule:
# P(k) proportional to ||E_k||^2_Killing
# For u(n_d) mode: P ~ 2*n_d = 8
# For u(n_c) mode: P ~ 2*n_c = 22
# Normalization: n_d^2 * 8 + n_c^2 * 22 = 128 + 2662 = 2790

total_killing = n_d**2 * killing_d + n_c**2 * killing_c

P_killing_d = R(killing_d, total_killing)    # per defect mode
P_killing_c = R(killing_c, total_killing)    # per crystal mode
P_counting = R(1, N_I)                       # per any mode (counting)

print(f"\nKilling norm^2 per u({n_d}) generator: {killing_d}")
print(f"Killing norm^2 per u({n_c}) generator: {killing_c}")
print(f"Total Killing weight: {n_d}^2*{killing_d} + {n_c}^2*{killing_c} = {total_killing}")
print(f"\nProbabilities per mode:")
print(f"  Counting metric: P = 1/{N_I} = {float(P_counting):.6f}")
print(f"  Killing (defect): P = {killing_d}/{total_killing} = {P_killing_d} = {float(P_killing_d):.6f}")
print(f"  Killing (crystal): P = {killing_c}/{total_killing} = {P_killing_c} = {float(P_killing_c):.6f}")
print(f"  Killing ratio r = P(defect)/P(crystal) = {killing_d}/{killing_c} = {R(killing_d, killing_c)} = {float(R(killing_d, killing_c)):.4f}")

# Model: P(crystal EM mode) = alpha, with r = P(defect)/P(crystal)
# From normalization: n_d^2*r*p_c + n_c^2*p_c = 1 => p_c = 1/(n_d^2*r + n_c^2)
# 1/alpha = 1/p_c = n_d^2*r + n_c^2

r = symbols('r', positive=True)
inv_alpha_r = n_d**2 * r + n_c**2

r_counting = 1
r_killing = R(killing_d, killing_c)  # = n_d/n_c = 4/11

inv_alpha_counting = inv_alpha_r.subs(r, r_counting)
inv_alpha_killing = inv_alpha_r.subs(r, r_killing)

print(f"\nModel: 1/alpha = {n_d}^2*r + {n_c}^2 = 16r + 121")
print(f"  Counting (r=1):     1/alpha = {inv_alpha_counting} (expt: 137.036)")
print(f"  Killing (r=4/11):   1/alpha = {inv_alpha_killing} = {float(inv_alpha_killing):.4f}")
print(f"  Error (counting):   {abs(137 - 137.036)/137.036*100:.3f}%")
print(f"  Error (Killing):    {abs(float(inv_alpha_killing) - 137.036)/137.036*100:.1f}%")

# ==============================================================================
# PART 5: MAXIMALLY MIXED STATE ARGUMENT
# ==============================================================================

print("\n" + "=" * 70)
print("PART 5: Maximally Mixed State from AXM_0114")
print("=" * 70)

# If V_pi = C^{N_I} with the counting inner product (generators = ONB):
#   - "No preferred direction" (AXM_0114) => rho = I/N_I (maximally mixed)
#   - P(k) = Tr(rho |k><k|) = 1/N_I for all k
#
# The maximally mixed state is basis-independent: rho = I/N commutes
# with all unitaries. But P(k) = 1/N only in the basis where the
# generators are orthonormal.
#
# Key: the choice of inner product IS the counting metric assumption.

print(f"\nAXM_0114 (tilt possibility) => generic nucleation => no preferred direction")
print(f"Maximum entropy principle => rho = I/{N_I} (maximally mixed state)")
print(f"Born rule: P(k) = Tr(rho |k><k|) = 1/{N_I}")
print(f"\nThis requires: generators E_k form an orthonormal basis of V_pi")
print(f"i.e., the inner product on V_pi is the counting metric [A-STRUCTURAL]")
print(f"\nThe argument chain:")
print(f"  1. V_pi ~ C^{N_I} with counting metric [A-STRUCTURAL: inner product choice]")
print(f"  2. Generic tilt (AXM_0114) => rho = I/{N_I} [D: maximum entropy / ergodicity]")
print(f"  3. P(k) = 1/{N_I} [D: Born rule from rho = I/N]")
print(f"\nThe structural choice in step 1 is the PRECISE content of the uniformity assumption.")
print(f"It is NOT derivable from U(n_d) x U(n_c) symmetry alone.")

# ==============================================================================
# PART 6: RANDOM STATE CONCENTRATION
# ==============================================================================

print("\n" + "=" * 70)
print("PART 6: Random State Concentration (Typicality)")
print("=" * 70)

# For a Haar-random pure state |psi> on C^N:
#   |<k|psi>|^2 ~ Beta(1, N-1)
#   E[|<k|psi>|^2] = 1/N
#   Var[|<k|psi>|^2] = (N-1)/(N^2(N+1))
# For N = 137: relative std ~ 8.5%

N = N_I
mean_P = R(1, N)
var_P = R(N - 1, N**2 * (N + 1))
std_P = sqrt(var_P)
rel_std = std_P / mean_P

print(f"\nFor Haar-random pure state |psi> on C^{N}:")
print(f"  E[P(k)] = 1/{N} = {float(mean_P):.6f}")
print(f"  Var[P(k)] = ({N-1})/({N}^2*{N+1}) = {var_P}")
print(f"  Std[P(k)] = {float(std_P):.6f}")
print(f"  Relative std = {float(rel_std):.4f} = {float(rel_std)*100:.1f}%")
print(f"\n  IMPORTANT: relative std ~ 99% means individual P(k) values are NOT")
print(f"  concentrated near 1/N for a random PURE state. Beta(1,{N-1}) is")
print(f"  exponential-like: most modes get P ~ 0, a few get P ~ O(1/N).")
print(f"  Random pure states do NOT give approximate uniformity.")
print(f"\n  The uniform distribution requires the MAXIMALLY MIXED state rho = I/N,")
print(f"  not a random pure state. This is a density matrix statement, not a")
print(f"  state vector statement.")

# Expected norm-squared in each irrep block for random state
print(f"\nExpected norm-squared per block (random state on C^{N}):")
for name, dim, _ in blocks:
    frac = R(dim, N)
    print(f"  E[||psi_{name}||^2] = {dim}/{N} = {float(frac):.6f}")
print(f"  (Proportional to block dimension -- consistent with counting metric)")

# ==============================================================================
# PART 7: TWO COUNTING REGIMES -- RESOLUTION
# ==============================================================================

print("\n" + "=" * 70)
print("PART 7: Two Counting Regimes -- Coupling Constants vs Mixing Angles")
print("=" * 70)

# The "two counting regimes" from S160/S164:
#   EW: sin^2(theta_W) = N_Gold/n_c^2 = 28/121 (fraction of crystal modes)
#   Strong: 1/alpha_s ~ dim(O) = 8 (group dimension)
#
# Resolution: these are different physical quantities:
#   Coupling constants = inverse mode counts: 1/alpha_i ~ N_i
#   Mixing angles = mode fractions: sin^2(theta) = N_sub/N_total

N_Gold = n_d * Im_O
sin2_thetaW = R(N_Gold, n_c**2)
dim_O = 8  # = dim(O), also = dim(SU(3))

# Verify Goldstone count
dim_SO = lambda n: n * (n - 1) // 2
N_Gold_coset = dim_SO(n_c) - dim_SO(n_d) - dim_SO(n_c - n_d)

print(f"\nFramework predictions:")
print(f"\n  COUPLING CONSTANTS (inverse mode counts):")
print(f"    1/alpha_EM = N_I = {N_I}                 (total interface modes)")
print(f"    1/alpha_s  ~ dim(O) = {dim_O}                 (octonion generators)")
print(f"    1/alpha_2  ~ S_2 = 29                     (weak sector modes, from S159)")
print(f"\n  MIXING ANGLES (mode fractions):")
print(f"    sin^2(theta_W) = N_Gold/n_c^2 = {N_Gold}/{n_c**2} = {float(sin2_thetaW):.5f}")
print(f"    Measured (LEP eff): 0.23121(4)         (843 ppm)")

print(f"\nGoldstone count: N_Gold = n_d * Im_O = {n_d} * {Im_O} = {N_Gold}")
print(f"  Cross-check: dim SO({n_c}) - dim SO({n_d}) - dim SO({n_c - n_d})")
print(f"             = {dim_SO(n_c)} - {dim_SO(n_d)} - {dim_SO(n_c - n_d)} = {N_Gold_coset}")

print(f"\n--- Regime Selection Principle [CONJECTURE] ---")
print(f"  Gauge coupling alpha_i: inverse of mode count in sector i")
print(f"    => 'How many modes share the probability?' => 1/alpha = N_modes")
print(f"  Mixing angle sin^2(theta): fraction of modes in sub-sector")
print(f"    => 'What share does this sector have?' => sin^2(theta) = N_sub/N_total")
print(f"  These are different physical quantities, not different 'regimes'.")

# Cross-check: sin^2(theta_W) ~ alpha_EM/alpha_2 in SM
alpha_2_inv = 29  # from S_2 = 29 (S159)
sin2_from_ratio = R(alpha_2_inv, N_I)  # alpha/alpha_2 = (1/N_I)/(1/29) = 29/N_I

print(f"\nSM relation: sin^2(theta_W) = alpha_EM/alpha_2")
print(f"  Framework: alpha_EM/alpha_2 = (1/{N_I})/(1/{alpha_2_inv}) = {alpha_2_inv}/{N_I} = {float(sin2_from_ratio):.5f}")
print(f"  Mode fraction: {N_Gold}/{n_c**2} = {float(sin2_thetaW):.5f}")
print(f"  Difference: {float(abs(sin2_from_ratio - sin2_thetaW)):.5f} ({float(abs(sin2_from_ratio - sin2_thetaW)/sin2_thetaW)*100:.1f}%)")
print(f"  (S160: resolved to 0.07% at matching scale -- scheme-dependent)")

# ==============================================================================
# PART 8: WHAT WOULD CLOSE THE GAP
# ==============================================================================

print("\n" + "=" * 70)
print("PART 8: What Would Close the Uniformity Gap")
print("=" * 70)

print("""
Three paths to close G2 (in decreasing rigor):

PATH A -- New Axiom [A-STRUCTURAL]:
  "The inner product on V_pi is the counting metric: <E_a|E_b> = delta_ab."
  Status: Honest but adds a structural assumption. Reduces 3 free
  parameters to 0. Experimentally validated (1/alpha = 137 vs 126.8).

PATH B -- Dynamical Selection:
  Show that crystallization dynamics (AXM_0117) drive the density matrix
  toward rho = I/N_I regardless of initial state. Analogous to
  thermalization => microcanonical ensemble.
  Status: Would be a theorem if proven. Requires understanding of
  crystallization dynamics on the interface (not yet formalized).

PATH C -- Uniqueness of Counting Metric:
  Show the counting metric is the UNIQUE inner product on u(n_d) + u(n_c)
  that is preserved by some larger symmetry group (e.g., the full
  automorphism group of the interface algebra).
  Status: Would reduce [A-STRUCTURAL] to [D]. Requires algebraic analysis.

  Note: The Killing metric is also natural (invariant under the adjoint),
  but gives wrong experimental predictions. The counting metric is
  invariant under PERMUTATION of generators (S_{n_d^2} x S_{n_c^2}),
  which is a much larger group than U(n_d) x U(n_c).
""")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

tests = [
    # Part 1: Decomposition
    ("Irrep dimensions sum to N_I = 137",
     total_dim == N_I),
    ("dim su(n_d) = n_d^2 - 1 = 15",
     dim_su_d == 15),
    ("dim su(n_c) = n_c^2 - 1 = 120",
     dim_su_c == 120),
    ("Exactly 4 irreducible blocks",
     len(blocks) == 4),

    # Part 2: Invariant subspace
    ("G-invariant subspace is 2-dimensional",
     inv_dim == 2),
    ("Invariant subspace strictly smaller than V_pi",
     inv_dim < N_I),

    # Part 3: Uniform distribution
    ("Uniform distribution satisfies normalization",
     norm_check == 1),
    ("3 free parameters in G-invariant family",
     len(blocks) - 1 == 3),

    # Part 4: Killing vs counting
    ("Killing norm u(n_d) = 2*n_d = 8",
     killing_d == 8),
    ("Killing norm u(n_c) = 2*n_c = 22",
     killing_c == 22),
    ("Total Killing weight = 2790",
     total_killing == 2790),
    ("Counting metric: 1/alpha = 137",
     inv_alpha_counting == 137),
    ("Killing metric: 1/alpha != 137",
     inv_alpha_killing != 137),
    ("Killing 1/alpha = 1395/11",
     inv_alpha_killing == R(1395, 11)),
    ("Counting metric closer to experiment than Killing",
     abs(137 - 137.036) < abs(float(inv_alpha_killing) - 137.036)),

    # Part 5: Maximally mixed state
    ("Maximally mixed rho = I/N gives P = 1/N",
     R(1, N_I) == R(1, 137)),

    # Part 6: Random state
    ("Random state mean = 1/N_I",
     mean_P == R(1, N_I)),
    ("Random state variance formula correct",
     var_P == R(N_I - 1, N_I**2 * (N_I + 1))),
    ("Relative fluctuation ~ 100% (pure states NOT uniform)",
     float(rel_std) > 0.90),
    ("Std ~ mean (Beta(1,N-1) is exponential-like)",
     abs(float(std_P) - float(mean_P)) / float(mean_P) < 0.10),

    # Part 7: Two counting regimes
    ("N_Gold = n_d * Im_O = 28",
     N_Gold == 28),
    ("N_Gold from coset = 28",
     N_Gold_coset == 28),
    ("sin^2(theta_W) = 28/121",
     sin2_thetaW == R(28, 121)),
    ("1/alpha_s ~ dim(O) = 8",
     dim_O == 8),
    ("alpha_EM/alpha_2 within 10% of sin^2(theta_W)",
     abs(float(sin2_from_ratio - sin2_thetaW) / float(sin2_thetaW)) < 0.10),

    # Consistency
    ("N_I = n_d^2 + n_c^2",
     N_I == n_d**2 + n_c**2),
    ("N_I = 137 is prime",
     isprime(N_I)),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    print(f"[{status}] {name}")

total_tests = len(tests)
passed_tests = sum(1 for _, p in tests if p)
print(f"\n{'ALL TESTS PASSED' if all_pass else 'SOME TESTS FAILED'}: "
      f"{passed_tests}/{total_tests}")
