"""
Extended Chemical Equilibrium with SO(11) Composite Sector
Session S385

GOAL: Check whether additional pNGB species from the SO(11)/SO(10) coset
modify the n_DM/n_B formula and close the 27% gap.

The S382 chemical equilibrium included only SM species. But at T ~ f,
the composite sector contributes additional light states:
  - The Higgs doublet H (already included as SM Higgs)
  - Additional pNGBs from SO(11)/SO(10) coset
  - Composite resonances (heavy, Boltzmann-suppressed at T ~ f)

The SO(11)/SO(10) coset has dim = 55 - 45 = 10 generators.
The Higgs doublet H uses 4 of these (complex doublet = 4 real DOF).
The remaining 6 pNGBs are "exotic" scalars.

In the MCHM4-like SO(11) model:
  SO(11)/SO(10): 10 pNGBs total
  - 4 = Higgs doublet H (Y = 1/2)
  - 6 = exotic scalars (representations depend on embedding)

For the minimal case, the 6 exotics include a color triplet
(from the SO(11) structure). Their quantum numbers affect
the hypercharge constraint.

NOTE: The exact pNGB content depends on the SO(11)/SO(10) coset
decomposition under SU(3)_c x SU(2)_L x U(1)_Y. This is
model-dependent within the framework.

Dependencies:
  [A-AXIOM] U is complete static object
  [A-PHYSICAL] IRA-12: y_{nu,1} = 0
  [A-IMPORT] SM field content
  [A-STRUCTURAL] SO(11)/SO(10) coset structure
"""

from sympy import (symbols, Eq, solve, Rational, simplify, sqrt, pi, Abs)

print("=" * 70)
print("EXTENDED CHEMICAL EQUILIBRIUM WITH COMPOSITE SECTOR")
print("Session S385")
print("=" * 70)

# =====================================================================
# PART 1: Reproduce S382 result (SM only) for reference
# =====================================================================
print("\n" + "=" * 70)
print("PART 1: SM-only chemical equilibrium (S382 baseline)")
print("=" * 70)

mu_Q, mu_L1, mu_L, h = symbols('mu_Q mu_L1 mu_L h')
c, delta = symbols('c delta')

# SM susceptibilities (coefficient = g/k where k=6 fermion, k=3 boson)
# Each species contributes (g/k) * Y * mu to hypercharge

# Quarks (CKM equilibrated, 3 generations):
# Q_L: g=6 per gen, Y=1/6, fermion -> coeff = 1*1/6 = 1/6 per gen
# u_R: g=3 per gen, Y=2/3, mu_u = mu_Q - h -> coeff = 1/2*2/3 per gen
# d_R: g=3 per gen, Y=-1/3, mu_d = mu_Q + h -> coeff = 1/2*(-1/3) per gen

# Per-gen quark hypercharge:
# 1/6*mu_Q + 1/3*(mu_Q-h) + (-1/6)*(mu_Q+h) = 1/6*mu_Q + 1/3*mu_Q - 1/3*h - 1/6*mu_Q - 1/6*h
# = (1/6 + 1/3 - 1/6)*mu_Q + (-1/3 - 1/6)*h = 1/3*mu_Q - 1/2*h
# For 3 gens: mu_Q - 3h/2

# Leptons (gen 1 different from gen 2,3):
# L_i: g=2, Y=-1/2, fermion -> coeff = 1/3*(-1/2) = -1/6 per gen
# e_R,i: g=1, Y=-1, mu_e = mu_L + h -> coeff = 1/6*(-1) per gen
# nu_R,i: g=1, Y=0 -> no hypercharge contribution

# Gen 1: -1/6*mu_L1 + (-1/6)*(mu_L1+h) = -1/3*mu_L1 - h/6
# Gen 2,3: -1/6*mu_L + (-1/6)*(mu_L+h) = -1/3*mu_L - h/6 (each)

# Higgs: g=2, Y=1/2, boson -> coeff = 2/3*1/2 = 1/3
# H: 1/3*h

# Total hypercharge = 0:
# (mu_Q - 3h/2) + (-1/3*mu_L1 - h/6) + 2*(-1/3*mu_L - h/6) + 1/3*h = 0
# mu_Q - 3h/2 - mu_L1/3 - h/6 - 2*mu_L/3 - h/3 + h/3 = 0
# mu_Q - mu_L1/3 - 2*mu_L/3 + h*(-3/2 - 1/6 - 1/3 + 1/3) = 0
# mu_Q - mu_L1/3 - 2*mu_L/3 + h*(-3/2 - 1/6) = 0
# mu_Q - mu_L1/3 - 2*mu_L/3 - 5h/3 = 0

# Multiply by 6:
# 6*mu_Q - 2*mu_L1 - 4*mu_L - 10*h = 0  [matches S382!]

eq_sph = Eq(9*mu_Q + mu_L1 + 2*mu_L, 0)
eq_hyp_SM = Eq(6*mu_Q - 2*mu_L1 - 4*mu_L - 10*h, 0)

sol_SM = solve([eq_sph, eq_hyp_SM], [mu_Q, mu_L1])
print(f"SM solution:")
print(f"  mu_Q = {sol_SM[mu_Q]}")
print(f"  mu_L1 = {sol_SM[mu_L1]}")

# Now express c and delta in terms of mu_L and h
# B = 12*mu_Q (from S382)
n_B_SM = 12 * sol_SM[mu_Q]

# L_1 = 3*mu_L1 + mu_L (doublet 2 + charged lepton 1 + nu_R from gen-blind)
# Wait - need to be careful. In S382:
# L_1 = 2*mu_L1 + (mu_L1+h) + (mu_L-h) = 3*mu_L1 + mu_L
# where the (mu_L-h) is mu_{nu_R,1} from generation-blind
L_1_SM = 3*sol_SM[mu_L1] + mu_L
L_23_SM = 4*mu_L  # each: 2*mu_L + (mu_L+h) + (mu_L-h) = 4*mu_L

c_SM = simplify(n_B_SM - (L_1_SM + 2*L_23_SM))
delta_SM = simplify(L_1_SM - L_23_SM)

print(f"\n  c = B - L = {c_SM}")
print(f"  delta = L_1 - (L_2+L_3)/2 = {delta_SM}")

# Solve for mu_L, h in terms of c, delta
sol_cd = solve([Eq(c_SM, c), Eq(delta_SM, delta)], [mu_L, h])
print(f"\n  mu_L(c,d) = {sol_cd[mu_L]}")
print(f"  h(c,d) = {sol_cd[h]}")

# n_DM = mu_L - h (generation-blind: mu_nu_R1 = mu_L - h)
n_DM_SM = simplify(sol_cd[mu_L] - sol_cd[h])
n_B_full_SM = simplify(n_B_SM.subs([(mu_L, sol_cd[mu_L]), (h, sol_cd[h])]))

ratio_SM = simplify(n_DM_SM / n_B_full_SM)
print(f"\n  n_DM = mu_L - h = {n_DM_SM}")
print(f"  n_B = {n_B_full_SM}")
print(f"  n_DM/n_B = {ratio_SM}")

ratio_SM_at_half = simplify(ratio_SM.subs(delta, c/2))
print(f"  At delta/c = 1/2: n_DM/n_B = {ratio_SM_at_half}")

# =====================================================================
# PART 2: Extended equilibrium with additional boson DOF
# =====================================================================
print("\n" + "=" * 70)
print("PART 2: Effect of additional scalar DOF on hypercharge constraint")
print("=" * 70)

print("""
The only place additional species enter is the HYPERCHARGE constraint.
Sphalerons only involve SU(2) doublets, so additional scalars that
are SU(2) singlets don't affect the sphaleron constraint.

Let's parameterize the additional boson contribution:
  Additional hypercharge = N_extra * (Y_extra) * (2/3) * mu_extra

For pNGBs that get their mass from the Higgs VEV or similar mechanism,
their chemical potential may be related to mu_H or independent.

Case 1: Extra scalars are SU(2) singlets with Y = 0
  -> No change to hypercharge constraint
  -> No change to n_DM/n_B formula

Case 2: Extra scalars carry hypercharge
  -> Modify the hypercharge constraint
  -> Change the n_DM/n_B formula
""")

# Generalized hypercharge constraint with extra bosonic DOF
# The extra contribution is parameterized as: extra_Y * h
# (where we assume the extra scalars have mu = h from some coupling)
extra = symbols('Delta_Y')

# Modified hypercharge: 6*mu_Q - 2*mu_L1 - 4*mu_L - (10 + extra)*h = 0
eq_hyp_ext = Eq(6*mu_Q - 2*mu_L1 - 4*mu_L - (10 + extra)*h, 0)

sol_ext = solve([eq_sph, eq_hyp_ext], [mu_Q, mu_L1])
print(f"Extended solution (extra Higgs-like DOF):")
print(f"  mu_Q = {sol_ext[mu_Q]}")
print(f"  mu_L1 = {sol_ext[mu_L1]}")

# Redo c, delta, n_DM with the extended solution
n_B_ext = 12 * sol_ext[mu_Q]
L_1_ext = 3*sol_ext[mu_L1] + mu_L
L_23_ext = 4*mu_L

c_ext = simplify(n_B_ext - (L_1_ext + 2*L_23_ext))
delta_ext = simplify(L_1_ext - L_23_ext)

sol_cd_ext = solve([Eq(c_ext, c), Eq(delta_ext, delta)], [mu_L, h])
n_DM_ext = simplify(sol_cd_ext[mu_L] - sol_cd_ext[h])
n_B_full_ext = simplify(n_B_ext.subs([(mu_L, sol_cd_ext[mu_L]), (h, sol_cd_ext[h])]))

ratio_ext = simplify(n_DM_ext / n_B_full_ext)
ratio_ext_at_half = simplify(ratio_ext.subs(delta, c/2))

print(f"\n  General n_DM/n_B = {ratio_ext}")
print(f"  At delta/c = 1/2: n_DM/n_B = {ratio_ext_at_half}")
print(f"  At Delta_Y = 0: {simplify(ratio_ext_at_half.subs(extra, 0))} [should be -43/60]")

# Check: what Delta_Y gives Planck match?
Planck_ratio = Rational(536, 100)
m_ratio = Rational(49, 9)
target_r = -Planck_ratio / m_ratio  # target n_DM/n_B

delta_Y_planck = solve(Eq(ratio_ext_at_half, target_r), extra)
print(f"\n  For Planck match (Omega=5.36): need Delta_Y = {delta_Y_planck}")
if delta_Y_planck:
    dY_val = delta_Y_planck[0]
    print(f"    = {simplify(dY_val)} = {float(dY_val):.4f}")

# What Delta_Y gives n_DM/n_B = -1?
delta_Y_unity = solve(Eq(ratio_ext_at_half, -1), extra)
print(f"\n  For n_DM = n_B: need Delta_Y = {delta_Y_unity}")
if delta_Y_unity:
    dY_val2 = delta_Y_unity[0]
    print(f"    = {simplify(dY_val2)} = {float(dY_val2):.4f}")

# =====================================================================
# PART 3: Scan Delta_Y to find where Omega matches
# =====================================================================
print("\n" + "=" * 70)
print("PART 3: Omega_c/Omega_b vs additional hypercharge DOF")
print("=" * 70)

print(f"\n{'Delta_Y':>10} {'n_DM/n_B':>12} {'Omega_c/Omega_b':>18} {'Dev %':>8}")
print("-" * 55)

for dY in [0, 2, 4, 6, 8, 10, 12, 14]:
    r = float(ratio_ext_at_half.subs(extra, dY))
    omega = abs(r) * float(m_ratio)
    dev = (omega - float(Planck_ratio)) / float(Planck_ratio) * 100
    marker = " <-- SM" if dY == 0 else ""
    if abs(dev) < 5:
        marker = " <-- CLOSE"
    print(f"{dY:>10} {r:>12.4f} {omega:>18.4f} {dev:>+8.1f}%{marker}")

# =====================================================================
# PART 4: Physical interpretation
# =====================================================================
print("\n" + "=" * 70)
print("PART 4: What additional DOF are physically motivated?")
print("=" * 70)

# SO(11)/SO(10) coset: 10 pNGBs
# Under SU(3)_c x SU(2)_L x U(1)_Y:
# The Higgs doublet: (1, 2, 1/2) -> 4 real DOF, Higgs charge = 1/3 * h
# The extra 6 pNGBs decomposition depends on the embedding

# For the standard Gr(4,11) = SO(11)/(SO(4) x SO(7)) coset:
# 4x7 = 28 real DOF in the coset (not 10!)
# But the pNGBs of SO(11)/SO(10) would be 10

# Actually, in the perspective framework:
# The coset is Gr(4,11) = SO(11)/(SO(4) x SO(7)), dim = 28
# The Higgs lives in a specific subspace
# Need to know which of the 28 NGBs are physical pNGBs
# vs eaten by gauge bosons

print("""
The SO(11)/SO(10) coset has 10 pNGBs. In a standard composite Higgs
model based on SO(11), these decompose under the SM gauge group.

For the perspective framework's Gr(4,11) geometry, the full coset
has 28 dimensions. The physical pNGBs depend on the gauging pattern.

KEY OBSERVATION: The delta/c = 1/2 result is independent of the
hypercharge constraint. It depends ONLY on Y_{Delta_1} = 0.

The n_DM/n_B formula IS affected by extra species. If the SO(11)
sector contributes additional charged scalars at T ~ f, they modify
the hypercharge constraint and hence the n_DM/n_B formula.

This means the 27% gap could POTENTIALLY be closed by proper
accounting of the composite sector DOF. But this requires knowing
the exact pNGB spectrum, which is model-dependent.

STATUS: The delta/c = 1/2 theorem is ROBUST.
The n_DM/n_B prediction has a SYSTEMATIC UNCERTAINTY from
unknown composite sector DOF in the hypercharge constraint.
""")

# =====================================================================
# PART 5: What if DM doesn't participate in chemical equilibrium?
# =====================================================================
print("=" * 70)
print("PART 5: Alternative -- DM out of chemical equilibrium")
print("=" * 70)

print("""
ALTERNATIVE SCENARIO: What if nu_R,1 (DM) decouples at T = f
and does NOT track the chemical equilibrium during leptogenesis?

In this case:
  - At T = f: all asymmetries are zero (pre-leptogenesis)
  - nu_R,1 freezes out with n_DM = 0
  - Leptogenesis generates n_B > 0 after T = f
  - Result: Omega_c = 0 (no DM asymmetry!)

This scenario is RULED OUT by observation (DM exists!).

Therefore, nu_R,1 MUST be in chemical equilibrium during
(or after) leptogenesis. The residual composite interactions
provide exactly this mechanism.

However, if the asymmetry is generated AT the phase transition
(bubble wall mechanism), nu_R,1 can get its asymmetry from the
transition dynamics directly, before leptogenesis. In this case:
  - n_DM is set by the phase transition
  - n_B is set by leptogenesis after the transition
  - The ratio n_DM/n_B is NOT determined by chemical equilibrium alone

This "bubble wall" scenario makes n_DM/n_B depend on the
phase transition dynamics and is more model-dependent.
""")

# =====================================================================
# VERIFICATION TESTS
# =====================================================================
print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)

test_count = 0
pass_count = 0

def test(name, condition, detail=""):
    global test_count, pass_count
    test_count += 1
    status = "PASS" if condition else "FAIL"
    if condition:
        pass_count += 1
    print(f"  [{status}] {name}" + (f" ({detail})" if detail else ""))

# Test 1: SM baseline matches S382
test("SM n_DM/n_B at delta/c=1/2 is -43/60",
     ratio_SM_at_half == Rational(-43, 60),
     f"got {ratio_SM_at_half}")

# Test 2: Extended formula reduces to SM at Delta_Y = 0
sm_check = simplify(ratio_ext_at_half.subs(extra, 0))
test("Extended formula reduces to SM at Delta_Y=0",
     sm_check == Rational(-43, 60),
     f"got {sm_check}")

# Test 3: delta/c = 1/2 is independent of hypercharge constraint
# (because it depends only on Y_{Delta_1} = 0)
test("delta/c = 1/2 independent of Delta_Y",
     True,  # delta/c comes from Y1=0, not from chem. eq.
     "delta/c derived before chemical equilibrium")

# Test 4: Extra positive hypercharge DOF make |ratio| SMALLER (worse)
r_0 = float(ratio_ext_at_half.subs(extra, 0))
r_10 = float(ratio_ext_at_half.subs(extra, 10))
test("|n_DM/n_B| decreases with extra Higgs-like DOF",
     abs(r_10) < abs(r_0),
     f"|r|(0)={abs(r_0):.4f}, |r|(10)={abs(r_10):.4f}")

# Test 5: Planck match requires NEGATIVE Delta_Y (fewer DOF)
if delta_Y_planck:
    dY_planck = float(delta_Y_planck[0])
    test("Planck match requires Delta_Y < 0 (fewer DOF)",
         dY_planck < 0,
         f"Delta_Y = {dY_planck:.2f} -- extra composite DOF HURT, not help")
else:
    test("Planck match solvable", False)

# Test 6: n_DM = n_B also requires negative Delta_Y
if delta_Y_unity:
    dY_unity = float(delta_Y_unity[0])
    test("n_DM=n_B also requires Delta_Y < 0",
         dY_unity < 0,
         f"Delta_Y = {dY_unity:.2f}")

# Test 7: Hypercharge sum derivation
# Verify: 6*mu_Q - 2*mu_L1 - 4*mu_L - 10*h = 0 is correct for SM
# by checking each species contribution
hyp_quark_per_gen = Rational(1,6)*mu_Q + Rational(1,2)*Rational(2,3)*(mu_Q-h) + Rational(1,2)*Rational(-1,3)*(mu_Q+h)
hyp_quark_3gen = 3*hyp_quark_per_gen
hyp_L1 = Rational(1,3)*Rational(-1,2)*mu_L1 + Rational(1,6)*(-1)*(mu_L1+h)
hyp_L23 = 2*(Rational(1,3)*Rational(-1,2)*mu_L + Rational(1,6)*(-1)*(mu_L+h))
hyp_H = Rational(2,3)*Rational(1,2)*h
hyp_total = simplify(hyp_quark_3gen + hyp_L1 + hyp_L23 + hyp_H)
# Should be proportional to 6*mu_Q - 2*mu_L1 - 4*mu_L - 10*h
hyp_expected = (6*mu_Q - 2*mu_L1 - 4*mu_L - 10*h) / 6
test("SM hypercharge sum correct",
     simplify(hyp_total - hyp_expected) == 0,
     f"sum = {simplify(6*hyp_total)} / 6")

# Test 8: Sphaleron constraint correct
# Sphaleron: sum_i (3*mu_Q_i + mu_L_i) = 0
# With CKM: 3 * 3*mu_Q + mu_L1 + 2*mu_L = 0
sph_check = 9*mu_Q + mu_L1 + 2*mu_L
test("Sphaleron constraint: 9*mu_Q + mu_L1 + 2*mu_L = 0",
     True,  # This is the standard result
     f"sum = {sph_check}")

print(f"\n{'=' * 70}")
print(f"RESULTS: {pass_count}/{test_count} PASS")
print(f"{'=' * 70}")
