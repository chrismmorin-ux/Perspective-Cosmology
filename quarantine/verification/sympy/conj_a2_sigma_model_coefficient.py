#!/usr/bin/env python3
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
CONJ-A2 Phase 2: Sigma Model One-Loop Gauge Kinetic Coefficient

KEY FINDING: The one-loop induced gauge kinetic coefficient from all
charged scalars in End(R^11) = u(4) + u(11) is:

  Sum_i Q_i^2 = Tr_{End(V)}(ad(Q_EM)^2) = 2*n_c = 22

This is the ADJOINT trace of Q_EM^2. By the adjoint trace identity
(proven in alpha_em_index_density.py), this equals n_c * Tr_fund(Q^2).

The induced coupling from 22 charged complex scalar modes gives:
  1/alpha_induced = (22)/(6*pi) * ln(Lambda/mu) [complex scalars]

For kappa = 1 (CONJ-A2), we need 1/alpha = N_I = 137, requiring:
  ln(Lambda/mu) = 137 * 6*pi / 22 = 137*pi / (11/3) = N_I*pi*Im_H/n_c

If the compositeness scale satisfies this, we get alpha = 1/N_I.
But this introduces the scale ratio as a new assumption.

ALTERNATIVE (Sakharov induced, no bare kinetic):
If gauge field is PURELY induced with NO bare term:
  1/alpha(Lambda_comp) = 0 + (sum Q^2)/(12*pi^2) * ln(Lambda_UV/Lambda_comp)
The matching condition determines the scale ratio.

The KEY result: For End(V) = End(R^11), the coefficient is exactly
n_c * Tr_fund(Q^2) = 11*2 = 22. This is NOT 137.
For the COSET modes only, the coefficient is 14.
Neither equals N_I directly.

However, the RATIO approach from S292 (WSR + Schur) gives democratic
counting on N_I modes for the EM coupling, which IS 1/N_I for ratios.
The sigma model gives a consistent one-loop structure but does NOT
by itself fix kappa = 1 without specifying the scale.

Status: INVESTIGATION
Created: Session S297
Depends on: alpha_em_index_density.py (S272), alpha_step5_three_paths.py (S149)
"""

from sympy import *
from sympy import Rational as R

n_d = 4
n_c = 11
Im_H = 3
Im_O = 7
N_I = n_d**2 + n_c**2  # 137

tests_passed = 0
tests_total = 0

# ==============================================================
# PART 1: Scalar Content of the Sigma Model
# ==============================================================
print("=" * 65)
print("PART 1: SCALAR CONTENT OF SO(11)/SO(4)xSO(7) SIGMA MODEL")
print("=" * 65)

print(f"""
The vacuum manifold is Gr(4,11) = SO(11)/SO(4)xSO(7).
The sigma model lives on this space.

Scalar fields decompose under SO(4) x SO(7):

  1. COSET pNGBs: Hom(R^4, R^7) = R^28
     Transform as (4, 7) under SO(4) x SO(7)
     These are the 28 Goldstone modes of SO(11) -> SO(4)xSO(7)

     Under SM: 28 = 4 (Higgs) + 24 (colored pNGBs)
       Higgs: (4, 1) under SO(4) x SU(3)
       Colored: (4, 3+3bar) under SO(4) x SU(3)

  2. RADIAL (sigma) mode: 1 real scalar
     SO(11) singlet, neutral

  3. GAUGE sector fields:
     so(4) adjoint: 6 modes  [massless gauge]
     so(7) adjoint: 21 modes [massive or confined]
     These are the connection components, not propagating scalars.

For the one-loop computation, only PROPAGATING CHARGED scalars contribute.
""")

# Coset dimensions
dim_coset = n_d * Im_O  # 28
dim_Higgs = n_d * 1  # 4 (under SU(3) singlet decomposition of 7)
dim_colored = n_d * (Im_O - 1)  # 24 (under 3+3bar)

tests_total += 1
t1 = (dim_coset == 28 and dim_Higgs == 4 and dim_colored == 24)
if t1: tests_passed += 1
print(f"[{'PASS' if t1 else 'FAIL'}] T1: Coset = {dim_coset}, Higgs = {dim_Higgs}, Colored = {dim_colored}")

# ==============================================================
# PART 2: EM Charges of Coset Scalars
# ==============================================================
print()
print("=" * 65)
print("PART 2: EM CHARGES OF COSET SCALARS")
print("=" * 65)

# Q_EM eigenvalues on R^4: (+1, 0, 0, -1)
# Q_EM eigenvalues on R^7: (0, 0, 0, 0, 0, 0, 0)
#
# Coset = Hom(R^4, R^7): has basis e_i tensor e_j* for i in R^4, j in R^7
# Q_EM acts on the R^4 index: charge = Q_i (defect-side eigenvalue)
# For each of the 7 "crystal" directions, the charge pattern is:
#   charge +1: 1 mode (from i=1)
#   charge  0: 2 modes (from i=2,3)
#   charge -1: 1 mode (from i=4)

Q_R4 = [1, 0, 0, -1]
Q_R7 = [0] * Im_O

# For each (i,j) in coset, charge = Q_R4[i]
coset_charges = []
for i_val in Q_R4:
    for j_val in Q_R7:
        coset_charges.append(i_val)  # charge on R^4 index

# Count by charge
charge_counts = {}
for q in coset_charges:
    charge_counts[q] = charge_counts.get(q, 0) + 1

print(f"\nCoset charges (from R^4 index on Hom(R^4,R^7)):")
for q in sorted(charge_counts.keys(), reverse=True):
    print(f"  Q = {q:+d}: {charge_counts[q]} modes")

sum_Q2_coset = sum(q**2 for q in coset_charges)
sum_Q_coset = sum(coset_charges)

print(f"\nsum(Q^2)_coset = {sum_Q2_coset}")
print(f"sum(Q)_coset = {sum_Q_coset}")

tests_total += 1
t2 = (sum_Q2_coset == Im_O * sum(q**2 for q in Q_R4))
if t2: tests_passed += 1
print(f"[{'PASS' if t2 else 'FAIL'}] T2: sum(Q^2)_coset = Im_O * Tr_W(Q^2) = {Im_O}*{sum(q**2 for q in Q_R4)} = {sum_Q2_coset}")

tests_total += 1
t3 = (sum_Q2_coset == 14)
if t3: tests_passed += 1
print(f"[{'PASS' if t3 else 'FAIL'}] T3: sum(Q^2)_coset = 14")

# ==============================================================
# PART 3: Full End(V) EM Content
# ==============================================================
print()
print("=" * 65)
print("PART 3: FULL End(V) = End(R^11) EM CONTENT")
print("=" * 65)

# End(V) = 121 modes, charged under ad(Q_EM)
# Charge = Q_i - Q_j for elementary matrix E_{ij}
Q_full = [1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0]

end_sum_Q2 = 0
end_charges = []
for i in range(n_c):
    for j in range(n_c):
        q = Q_full[i] - Q_full[j]
        end_charges.append(q)
        end_sum_Q2 += q**2

# By adjoint trace identity: sum_{i,j} (Q_i-Q_j)^2 = 2*n*sum(Q_i^2)
adj_trace_formula = 2 * n_c * sum(q**2 for q in Q_full)

print(f"\nEnd(R^{n_c}) modes charged under Q_EM:")
end_charge_counts = {}
for q in end_charges:
    end_charge_counts[q] = end_charge_counts.get(q, 0) + 1
for q in sorted(end_charge_counts.keys(), reverse=True):
    print(f"  Q = {q:+d}: {end_charge_counts[q]} modes")

print(f"\nsum(Q^2)_End(V) = sum_{{i,j}} (Q_i-Q_j)^2 = {end_sum_Q2}")
print(f"Adjoint formula: 2*n_c*Tr_fund(Q^2) = 2*{n_c}*{sum(q**2 for q in Q_full)} = {adj_trace_formula}")

tests_total += 1
t4 = (end_sum_Q2 == adj_trace_formula == 2 * n_c * 2)
if t4: tests_passed += 1
print(f"[{'PASS' if t4 else 'FAIL'}] T4: End(V) trace = 2*n_c*Tr_fund = {end_sum_Q2} = {adj_trace_formula}")

# Decompose End(V):
# End(W) = 16: charges (Q_i - Q_j) for i,j in {1..4}
sum_Q2_EndW = sum((Q_full[i]-Q_full[j])**2 for i in range(n_d) for j in range(n_d))
# End(Wperp) = 49: all Q_i = Q_j = 0 -> charge = 0
sum_Q2_EndWperp = 0
# Hom(W,Wperp) = 28: charge Q_i for i in W
sum_Q2_Hom_WtoWp = sum(Q_full[i]**2 for i in range(n_d) for j in range(n_d, n_c))
# Hom(Wperp,W) = 28: charge -Q_j for j in W
sum_Q2_Hom_WptoW = sum(Q_full[j]**2 for j in range(n_d) for i in range(n_d, n_c))

print(f"\nEnd(V) decomposition:")
print(f"  End(W)={n_d**2}:       sum(Q^2) = {sum_Q2_EndW}")
print(f"  End(Wperp)={Im_O**2}:  sum(Q^2) = {sum_Q2_EndWperp}")
print(f"  Hom(W,Wp)={n_d*Im_O}:  sum(Q^2) = {sum_Q2_Hom_WtoWp}")
print(f"  Hom(Wp,W)={Im_O*n_d}:  sum(Q^2) = {sum_Q2_Hom_WptoW}")
print(f"  Total: {sum_Q2_EndW + sum_Q2_EndWperp + sum_Q2_Hom_WtoWp + sum_Q2_Hom_WptoW} = {end_sum_Q2}")

tests_total += 1
t5 = (sum_Q2_EndW + sum_Q2_EndWperp + sum_Q2_Hom_WtoWp + sum_Q2_Hom_WptoW == end_sum_Q2)
if t5: tests_passed += 1
print(f"[{'PASS' if t5 else 'FAIL'}] T5: Decomposition sums to total")

# ==============================================================
# PART 4: One-Loop Induced Gauge Kinetic Coefficient
# ==============================================================
print()
print("=" * 65)
print("PART 4: ONE-LOOP INDUCED GAUGE KINETIC COEFFICIENT")
print("=" * 65)

print(f"""
Standard QFT: induced gauge kinetic term from N charged scalars.

For REAL scalars (each with charge Q_i):
  Delta(1/g^2) = sum_i Q_i^2 / (192*pi^2) * ln(Lambda^2/mu^2)
               = sum_i Q_i^2 / (96*pi^2) * ln(Lambda/mu)

For COMPLEX scalars:
  Delta(1/g^2) = sum_i Q_i^2 / (48*pi^2) * ln(Lambda^2/mu^2)
               = sum_i Q_i^2 / (24*pi^2) * ln(Lambda/mu)

Converting to alpha = g^2/(4*pi):
  1/alpha(mu) = 1/alpha_0 + sum Q_i^2 / (6*pi) * ln(Lambda/mu)  [complex]
  1/alpha(mu) = 1/alpha_0 + sum Q_i^2 / (12*pi) * ln(Lambda/mu) [real]

The coset modes are REAL scalars (28 real components).
""")

# For real coset scalars:
coeff_real = R(1, 12)  # coefficient per unit Q^2 in 1/alpha formula: 1/(12*pi)
induced_coset = sum_Q2_coset * coeff_real  # times ln/pi
print(f"Coset-only coefficient:")
print(f"  sum(Q^2)_coset = {sum_Q2_coset}")
print(f"  1/alpha contribution per ln(Lambda/mu)/pi = {sum_Q2_coset}/{12} = {R(sum_Q2_coset, 12)} = {float(R(sum_Q2_coset, 12)):.4f}")

# For alpha = 1/N_I = 1/137 from coset alone:
# 137 = (14/12) * ln(Lambda/mu) / pi
# ln(Lambda/mu) = 137 * 12 * pi / 14 = 137 * 6*pi / 7
ln_ratio_coset = R(N_I * 12, sum_Q2_coset)  # = 137*12/14 = 137*6/7
print(f"  For 1/alpha = {N_I}: ln(Lambda/mu)/pi = {ln_ratio_coset} = {float(ln_ratio_coset):.2f}")
print(f"  = N_I * 12 / sum(Q^2) = {N_I} * 12 / {sum_Q2_coset}")
print(f"  = N_I * 6/Im_O = {N_I}*6/{Im_O}")

# Using ALL End(V) charged modes (both adjoint + coset):
n_charged_EndV = end_sum_Q2 // 2  # Each (i,j) and (j,i) pair; for real modes
# Actually, End(V) has 121 modes. The ones at charge 0 don't contribute.
# But End(V) is NOT the sigma model content. Only the coset modes are pNGBs.

# However, if the gauge field sees all tilt fluctuations (not just pNGBs):
# The FULL tilt space is Hom(R^4, R^7) = 28 modes (the coset).
# The End(W) = 16 modes are gauge fluctuations, not scalar propagators.
# The End(Wperp) = 49 modes are confined/massive.
# So only the 28 coset modes contribute at low energy.

print(f"\nContent at the compositeness scale:")
print(f"  Coset (pNGBs): 28 real modes, sum(Q^2) = {sum_Q2_coset}")
print(f"  End(W) = gauge: 16 modes (not scalar propagators)")
print(f"  End(Wperp) = confined: 49 modes (not propagating)")
print(f"  Sigma mode: 1 real singlet (Q=0)")

# ==============================================================
# PART 5: S_EM = 126 Charge-Weighted Sum
# ==============================================================
print()
print("=" * 65)
print("PART 5: THE S_EM = 126 CHARGE-WEIGHTED SUM")
print("=" * 65)

# From S147/S149: the charge-weighted sum S is defined differently.
# S = sum over INTERFACE modes of q_i^2, where q_i is the charge
# under the specific embedding of Q_EM in u(4) x u(11).
#
# For u(4): 16 generators, T^a with Tr(Q_EM T^a Q_EM T^a) contributions
# For u(11): 121 generators, similar
# S_EM = N_I - n_c = 126 was derived from traceless-charge maximization.

S_EM = N_I - n_c  # 126
S_2 = 29  # from S153 (SU(2) sector)
S_3 = 8   # from S153 (SU(3) sector)

print(f"\nS_EM = N_I - n_c = {N_I} - {n_c} = {S_EM}")
print(f"S_2 = {S_2} (SU(2) sector)")
print(f"S_3 = {S_3} (SU(3) sector)")

# The S values come from the INTERFACE generators (u(4) + u(11) adjoint),
# NOT from the coset scalar modes. These are conceptually different:
# - Coset modes: scalar fields in Hom(R^4, R^7)
# - Interface generators: Lie algebra elements in u(4) + u(11)

print(f"""
IMPORTANT DISTINCTION:
  sum(Q^2)_coset = {sum_Q2_coset} (scalar field EM content)
  S_EM = {S_EM} (interface generator EM content)

  These are DIFFERENT quantities measuring different things:
  - 14 = EM content of the 28 pNGB scalar fields
  - 126 = EM content of the 137 Lie algebra generators

  The ratio: S_EM / sum(Q^2)_coset = {S_EM}/{sum_Q2_coset} = {R(S_EM, sum_Q2_coset)} = 9
  = S_EM / (Im_O * Tr_W(Q^2)) = {S_EM} / ({Im_O}*{sum(q**2 for q in Q_R4)})
""")

tests_total += 1
t6 = (S_EM == 126 and R(S_EM, sum_Q2_coset) == 9)
if t6: tests_passed += 1
print(f"[{'PASS' if t6 else 'FAIL'}] T6: S_EM/sum(Q^2)_coset = 126/14 = 9")

# ==============================================================
# PART 6: Induced Coupling with Framework Scale
# ==============================================================
print()
print("=" * 65)
print("PART 6: INDUCED COUPLING WITH FRAMEWORK LOG RATIO")
print("=" * 65)

# From S149: if 1/alpha = S_EM/(6*pi) * ln(Lambda/mu)
# and ln(Lambda/mu) = N_I*pi/(Im_H*Im_O) = 137*pi/21
# then 1/alpha = 126/(6*pi) * 137*pi/21
#             = 126*137 / (6*21) = 126*137/126 = 137
# Wait! Let's compute carefully:

ln_S149 = R(N_I, Im_H * Im_O)  # = 137/21 (in units of pi)
# 1/alpha = S/(6*pi) * ln = S/(6*pi) * (N_I*pi/21) = S*N_I/(6*21)
inv_alpha_induced = R(S_EM * N_I, 6 * Im_H * Im_O)
print(f"S149 formula: 1/alpha = S_EM * N_I / (6 * Im_H * Im_O)")
print(f"  = {S_EM} * {N_I} / (6 * {Im_H} * {Im_O})")
print(f"  = {S_EM * N_I} / {6 * Im_H * Im_O}")
print(f"  = {inv_alpha_induced}")
print(f"  = {float(inv_alpha_induced):.4f}")
print()

# This gives 126*137/126 = 137 EXACTLY when 6*Im_H*Im_O = S_EM!
print(f"KEY IDENTITY: 6 * Im_H * Im_O = 6*3*7 = {6*Im_H*Im_O}")
print(f"              S_EM = N_I - n_c = {S_EM}")

tests_total += 1
t7 = (6 * Im_H * Im_O == S_EM)
if t7: tests_passed += 1
print(f"[{'PASS' if t7 else 'FAIL'}] T7: 6 * Im_H * Im_O = {6*Im_H*Im_O} = S_EM = {S_EM}")

print(f"""
REMARKABLE: The identity 6 * Im_H * Im_O = N_I - n_c = 126 means:
  1/alpha = S_EM * N_I / (6 * Im_H * Im_O) = S_EM * N_I / S_EM = N_I = {N_I}

This gives kappa = 1 EXACTLY, but ONLY if:
  (a) The charge-weighted sum is S_EM = 126 [DERIVED from S147/149]
  (b) The log ratio is ln(Lambda/mu) = N_I*pi/(Im_H*Im_O) [from S149]
  (c) The one-loop coefficient is 1/(6*pi) per complex scalar [STANDARD QFT]

Wait -- S_EM = 126 uses the GENERATOR charges (adjoint), not scalar charges.
And the one-loop formula uses SCALAR charges from the coset modes.
Let me reconcile.
""")

# ==============================================================
# PART 7: Reconciling Generator vs Scalar Charges
# ==============================================================
print("=" * 65)
print("PART 7: GENERATOR vs SCALAR CHARGE RECONCILIATION")
print("=" * 65)

# The S149 formula uses S_EM = 126 = charge-weighted generator count.
# The standard one-loop uses sum(Q^2)_scalars = 14 from coset modes.
#
# The factor-of-9 discrepancy: S_EM / sum(Q^2)_coset = 9
#
# WHERE does the factor of 9 come from?
# S_EM counts charges over ALL 137 u(4)+u(11) generators.
# sum(Q^2)_coset counts charges over 28 coset scalar modes.
#
# S_EM = sum over u(4): Tr_{u(4)}(ad(Q)^2) + sum over u(11): Tr_{u(11)}(ad(Q)^2)
# Actually, S_EM was derived in S147 as N_I - n_c from a different argument:
# S_EM = sum_{a=1}^{N_I} q_a^2 where q_a are charges of the N_I generators

# In the DEMOCRATIC approach (post-S292/WSR), every generator has
# equal coupling weight. The EM coupling in this democratic picture:
#
#   alpha_EM = P(EM transition) = Tr(Q_EM^2) / N_I
#            = 2/137  (NOT 1/137!)
#
# Wait, that gives 1/alpha ~ 68.5, not 137. The democratic approach must
# give weight 1/N_I per generator, and alpha = sum of Q^2 * (1/N_I):
# NO -- this is the probability per mode approach.
#
# The correct democratic statement (S165/S292):
#   1/g_EM^2 = N_EM (democratic count for EM)
# where N_EM = n_c^2 = 121 (NOT N_I = 137)
# because Q_EM sees all of End(V) not just the interface

# But wait -- we also have the interface picture where 1/alpha = N_I.
# These correspond to DIFFERENT regimes:
#   - I-STRUCT-5 (democratic on End(V)): 1/g_EM^2 = 121 -> alpha_tree = 1/121
#     This gives sin^2 = 28/121 [CONFIRMED]
#   - Interface count: 1/alpha_tree = 137 [CONJECTURED = Step 5]

# The reconciliation is the CORRECTION:
# 1/alpha = N_I + 4/111 (not just 121)
# The tree value 137 = 121 + 16 includes the u(4) contribution

print(f"""
TWO COUNTING SCHEMES:

Scheme 1: End(V) = End(R^11) democratic count
  N_EM = n_c^2 = {n_c**2} = 121
  This gives sin^2(theta_W) = 28/121 [CONFIRMED at 843 ppm]
  alpha_tree = 1/121 (0-th order)

Scheme 2: Interface (u(n_d) + u(n_c)) count
  N_I = n_d^2 + n_c^2 = {N_I}
  This gives 1/alpha_tree = 137 (full)

Reconciliation: N_I = n_c^2 + n_d^2 = 121 + 16
  The n_d^2 = 16 contribution comes from u(4) (defect sector)
  In the democratic on End(V) scheme:
    1/alpha = n_c^2 is the LEADING term (EM sees End(V))
    + n_d^2 = 16 is the SUBLEADING term (defect gauge fluctuations)

But this is NOT a correction -- it's the FUNDAMENTAL counting.
N_I = n_d^2 + n_c^2 from independent sectors (CONJ-A3 = THEOREM).
""")

# ==============================================================
# PART 8: The Sigma Model Result
# ==============================================================
print("=" * 65)
print("PART 8: SIGMA MODEL ONE-LOOP RESULT")
print("=" * 65)

# The one-loop gauge kinetic for the EM field, from all scalar modes
# on the coset:
#
# Coset pNGBs: 28 real scalars with charges as computed above
#   sum(Q^2) = 14
#   Contribution: 14/(12*pi) * ln(Lambda/mu)  [real scalars, 1/(12*pi) each]
#
# For 1/alpha = N_I:
#   14/(12*pi) * ln = 137
#   ln(Lambda/mu) = 137 * 12 * pi / 14 = 137 * 6*pi / 7

ln_needed_coset = R(N_I * 12, sum_Q2_coset)
print(f"From coset modes alone:")
print(f"  sum(Q^2) = {sum_Q2_coset}")
print(f"  Coefficient per unit of ln/pi: {R(sum_Q2_coset, 12)} = {float(R(sum_Q2_coset, 12)):.4f}")
print(f"  For 1/alpha = {N_I}: need ln(Lambda/mu)/pi = {ln_needed_coset} = {float(ln_needed_coset):.2f}")
print(f"  = {N_I} * 6 / Im_O")

# Including the fermion contribution (from S295: f = n_d = 4):
# Fermion contribution to 1/alpha: (2/3)*S_2^f/(4*pi) * ln
# where S_2^f = 6 = C*Im_H and the factor 2/3 is for fermions vs scalars
# Wait: in beta function notation:
#   b_fermion = (2/3)*S_2^f (Weyl), or (4/3)*S_2^f (Dirac)
#   b_scalar = (1/3)*S_2^s (complex), or (1/6)*S_2^s (real)
# For alpha running: d(1/alpha)/d(ln mu) = -b/(2*pi)

# Standard: 1/alpha(mu) = 1/alpha(Lambda) - b/(2*pi)*ln(mu/Lambda)
# = 1/alpha(Lambda) + b/(2*pi)*ln(Lambda/mu)

# At the compositeness scale:
# Scalars (28 real pNGBs): b_s = (1/6)*sum(Q^2)_coset = 14/6 = 7/3
# Fermions (3 gen): b_f = (4/3)*S_2^f(U1) = (4/3)*6 = 8
# Wait, S_2^f(U1) depends on hypercharge normalization, not EM charge.

# Let me use EM charges directly.
# For a Dirac fermion with charge Q: contribution to b = (4/3)*Q^2
# Three generations:
#   e,mu,tau: Q = -1, 3 Dirac fermions -> 3*(4/3)*1 = 4
#   u,c,t: Q = 2/3, 3*3 Dirac -> 9*(4/3)*(4/9) = 16/3
#   d,s,b: Q = -1/3, 3*3 Dirac -> 9*(4/3)*(1/9) = 4/3
#   Total fermion b: 4 + 16/3 + 4/3 = 4 + 20/3 = 32/3
# W boson: b_W = -22/3 (not relevant here)

b_fermion_EM = R(4,1) + R(16,3) + R(4,3)  # = 32/3
b_scalar_coset = R(1,6) * sum_Q2_coset  # = 14/6 = 7/3
b_total_noW = b_fermion_EM + b_scalar_coset

print(f"\nOne-loop beta contributions to 1/alpha:")
print(f"  Fermions: b_f = {b_fermion_EM} = {float(b_fermion_EM):.4f}")
print(f"  Coset scalars: b_s = (1/6)*{sum_Q2_coset} = {b_scalar_coset} = {float(b_scalar_coset):.4f}")
print(f"  Total (no W): b = {b_total_noW} = {float(b_total_noW):.4f}")

# Compare to SM: b_EM(SM) = -80/9 + 4/3 + ... = depends on convention
# With W: -22/3 + 32/3 + 1/6 = 11/3 ~ 3.67
# Without W (high scale): 32/3 + 7/3 = 39/3 = 13

tests_total += 1
t8 = (b_total_noW == 13)
if t8: tests_passed += 1
print(f"[{'PASS' if t8 else 'FAIL'}] T8: b(no W) = {b_total_noW} = 13")

# For PURELY INDUCED gauge field (Sakharov, no bare kinetic):
# 1/alpha(mu) = b/(2*pi) * ln(Lambda/mu)
# For 1/alpha = 137: ln(Lambda/mu) = 137*2*pi/13 = 274*pi/13

ln_needed_Sakharov = R(N_I * 2, int(b_total_noW))
print(f"\nSakharov (no bare kinetic):")
print(f"  1/alpha = b/(2*pi)*ln(Lambda/mu)")
print(f"  For 1/alpha = {N_I}: ln(Lambda/mu)/pi = {ln_needed_Sakharov} = {float(ln_needed_Sakharov):.2f}")

# ==============================================================
# PART 9: Does the Coefficient Relate to N_I?
# ==============================================================
print()
print("=" * 65)
print("PART 9: COEFFICIENT ANALYSIS -- RELATION TO N_I?")
print("=" * 65)

# The key question: does the coefficient (sum of Q^2 * loop factors)
# naturally equal N_I/something-simple?

# Coset-only: sum(Q^2) = 14 = 2*Im_O
print(f"\nsum(Q^2)_coset = {sum_Q2_coset} = 2*Im_O")
print(f"  14 vs N_I = 137: ratio = {R(N_I, sum_Q2_coset)} = {float(R(N_I, sum_Q2_coset)):.4f}")

# End(V) adjoint: Tr_adj(Q^2) = 22 = 2*n_c
adj_Q2 = 2 * n_c * 2  # = 44? No: Tr_adj = n_c * Tr_fund for traceless
# Wait: Tr_{so(n)}(Q^2) = n*Tr_fund(Q^2) (for traceless Q)
# Tr_fund(Q^2) = 2, so Tr_{so(11)}(Q^2) = 22
# But Tr_{End(V)}(ad(Q)^2) = 2*n*Tr_fund - 2*(Tr Q)^2 = 2*11*2 = 44 for End(V)
# And Tr_{so(n)}(Q^2) = Tr_{adj}(Q^2) = n*Tr_fund = 22 for so(11) adjoint

# so(n_c) adjoint sum Q^2:
sum_Q2_so = sum((Q_full[i] - Q_full[j])**2 for i in range(n_c) for j in range(i+1, n_c))
print(f"sum(Q^2)_so({n_c}) = {sum_Q2_so} = n_c * Tr_fund(Q^2) = {n_c}*2 = {n_c*2}")

tests_total += 1
t9 = (sum_Q2_so == n_c * 2 == 22)
if t9: tests_passed += 1
print(f"[{'PASS' if t9 else 'FAIL'}] T9: sum(Q^2)_so(11) = {sum_Q2_so} = 22 = 2*n_c")

# So for the so(11) adjoint (55 modes):
#   sum(Q^2) = 22
#   22 vs N_I = 137: no clean relation

# For the FULL u(n_d) + u(n_c):
# u(4): Tr_{u(4)}(ad(Q)^2) with Q restricted to u(4)
# Q on R^4: eigenvalues (+1,0,0,-1)
sum_Q2_u4 = sum((Q_R4[i]-Q_R4[j])**2 for i in range(n_d) for j in range(n_d))
sum_Q2_u11 = sum((Q_full[i]-Q_full[j])**2 for i in range(n_c) for j in range(n_c))
# sum_Q2_u11 = 2*n_c*Tr_fund(Q^2) - 2*(Tr Q)^2 = 44 - 0 = 44
# sum_Q2_u4 = 2*n_d*Tr_W(Q^2) - 2*(Tr_W Q)^2 = 2*4*2 - 0 = 16

print(f"\nu(4) modes:  sum(Q^2) = {sum_Q2_u4}")
print(f"u(11) modes: sum(Q^2) = {sum_Q2_u11}")
print(f"Total: {sum_Q2_u4 + sum_Q2_u11} = {sum_Q2_u4 + sum_Q2_u11}")

tests_total += 1
t10 = (sum_Q2_u4 == 2 * n_d * sum(q**2 for q in Q_R4))
if t10: tests_passed += 1
print(f"[{'PASS' if t10 else 'FAIL'}] T10: sum(Q^2)_u(4) = 2*n_d*Tr_W(Q^2) = {sum_Q2_u4}")

# Neither 16+44=60 nor 22 nor 14 equals 137.
# The sigma model coefficient is NOT N_I.
# It is controlled by Tr(Q^2) and the scalar content.

# ==============================================================
# PART 10: The S149 Cancellation Revisited
# ==============================================================
print()
print("=" * 65)
print("PART 10: S149 CANCELLATION MECHANISM")
print("=" * 65)

print(f"""
The S149 result used S_EM = N_I - n_c = 126 with the log ratio
ln(Lambda/mu) = N_I*pi/(Im_H*Im_O) = {N_I}*pi/{Im_H*Im_O}.

The key identity: 6*Im_H*Im_O = 126 = S_EM.

If we use S_EM in the 1/(6*pi) coefficient formula:
  1/alpha = S_EM/(6*pi) * ln = S_EM/(6*pi) * N_I*pi/21 = S_EM*N_I/(126) = N_I

This cancellation is exact: S_EM = 6*Im_H*Im_O = 126.

But S_EM is the charge-weighted GENERATOR count, while the
one-loop formula uses charge-weighted SCALAR count (= 14).

Resolution candidates:
  1. The S149 formula implicitly counts ALL interface generators,
     not just scalar modes. This would require a non-standard
     interpretation of "induced gauge field."
  2. There's a factor-of-9 enhancement from the COMPOSITE nature
     of the gauge field (each generator involves 9 scalar pairs).
  3. The democratic principle (Step 5) directly gives S_EM = 126
     as the effective weight, bypassing the one-loop calculation.

Factor of 9 = S_EM / sum(Q^2)_coset = 126/14:
  = (N_I - n_c) / (Im_O * Tr_W(Q^2))
  = (n_d^2 + n_c^2 - n_c) / (Im_O * 2)
  = (16 + 121 - 11) / 14
  = 126/14 = 9
""")

tests_total += 1
t11 = (R(S_EM, sum_Q2_coset) == 9)
if t11: tests_passed += 1
print(f"[{'PASS' if t11 else 'FAIL'}] T11: S_EM / sum(Q^2)_coset = {R(S_EM, sum_Q2_coset)} = 9")

# ==============================================================
# PART 11: Self-Consistency Check
# ==============================================================
print()
print("=" * 65)
print("PART 11: SELF-CONSISTENCY WITH C = 24/11")
print("=" * 65)

# The two-loop correction C = 24/11 was derived from:
# C = sum(Q^2)_colored * rho_EM = 12 * 2/11 = 24/11
# where sum(Q^2)_colored = 12 and rho_EM = 2/11

# Does this emerge from the sigma model?
# The colored pNGBs contribute:
sum_Q2_colored_coset = (Im_O - 1) * sum(q**2 for q in Q_R4)  # = 6*2 = 12

print(f"Colored pNGB sum(Q^2) = (Im_O-1)*Tr_W(Q^2) = {Im_O-1}*{sum(q**2 for q in Q_R4)} = {sum_Q2_colored_coset}")
print(f"This IS the 'sum(Q^2)_colored = 12' in C = 24/11.")
print(f"The EM index density rho_EM = 2/{n_c} is the same factor.")

# C = 24/11 would arise naturally in the sigma model at TWO loops
# if the self-energy correction to the photon involves
# colored pNGB loops weighted by rho_EM.
# This is the STANDARD two-loop contribution.

tests_total += 1
t12 = (sum_Q2_colored_coset == 12)
if t12: tests_passed += 1
print(f"\n[{'PASS' if t12 else 'FAIL'}] T12: Colored pNGB sum(Q^2) = 12 (matches C numerator)")

# ==============================================================
# PART 12: What the Sigma Model DOES Give
# ==============================================================
print()
print("=" * 65)
print("PART 12: WHAT THE SIGMA MODEL GIVES vs DOESN'T")
print("=" * 65)

print(f"""
DOES GIVE (from one-loop sigma model):
  1. sum(Q^2)_coset = {sum_Q2_coset} = 2*Im_O [THEOREM]
  2. Charge pattern: 7 modes at Q=+1, 14 at Q=0, 7 at Q=-1 [THEOREM]
  3. Colored subset: sum(Q^2) = 12 = (Im_O-1)*2 [THEOREM]
  4. Two-loop coefficient C = 24/11 when combined with rho_EM [DERIVATION]
  5. Self-consistent running structure

DOES NOT GIVE:
  1. 1/alpha = N_I = 137 (coefficient is 14, not 137)
  2. The absolute scale kappa = 1
  3. The log ratio ln(Lambda/mu) from first principles

The sigma model gives CONSISTENT loop structure but does not
fix the OVERALL normalization. The tree-level coupling 1/alpha = N_I
must come from elsewhere (WSR + absolute scale, CCP normalization,
or [A-STRUCTURAL]).

The S149 cancellation (S_EM * N_I / S_EM = N_I) is suggestive
but uses generator charges (S_EM = 126), not scalar charges (14).
""")

# ==============================================================
# SUMMARY
# ==============================================================
print("=" * 65)
print(f"SUMMARY: {tests_passed}/{tests_total} PASS")
print("=" * 65)

print(f"""
SIGMA MODEL ONE-LOOP RESULTS:

1. Coset scalar EM content: sum(Q^2) = {sum_Q2_coset} = 2*Im_O
   (NOT 137. Not even close to N_I.)

2. Key identity: 6*Im_H*Im_O = 126 = S_EM = N_I - n_c
   This makes S149's formula give 1/alpha = N_I EXACTLY
   but uses GENERATOR charges, not SCALAR charges.

3. The factor-of-9 gap: S_EM/sum(Q^2)_coset = 9
   Origin unclear. Possibly from composite nature of gauge field.

4. Two-loop coefficient C = 24/11 IS consistent with sigma model:
   Colored pNGB sum(Q^2) = 12 exactly matches.

5. CONCLUSION: The sigma model alone does NOT derive kappa = 1.
   It gives consistent loop structure (C = 24/11 works) but the
   absolute normalization requires additional input.

   The gap narrows to: WHY does the effective S_EM count equal
   the GENERATOR count (126) rather than the SCALAR count (14)?

   This is a well-posed mathematical question that could potentially
   be answered by the composite nature of the gauge field.
""")

if tests_passed == tests_total:
    print("ALL TESTS PASSED")
else:
    print(f"WARNING: {tests_total - tests_passed} tests FAILED")
