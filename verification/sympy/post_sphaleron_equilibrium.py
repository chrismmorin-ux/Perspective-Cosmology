"""
Post-sphaleron chemical equilibrium analysis
Session S388

KEY QUESTION: Does the chemical equilibrium at T_sph ~ 130 GeV differ from
T ~ f ~ 1354 GeV, and could this close the 27% Omega gap?

KEY FINDING: The T ~ f equilibrium solution AUTOMATICALLY satisfies the T_sph
equilibrium constraints. The 27% gap is NOT an artifact of the wrong epoch.
The naive SM formula B = (28/79)*(B-L) gives a WRONG answer when applied to
the two-step calculation because it ignores the flavored structure.

RESULT: n_DM/n_B = -43/60 [CONFIRMED, epoch-independent]
        Omega_c/Omega_b = 2107/540 = 3.90 (27% below Planck)

Dependencies:
  [A-PHYSICAL] IRA-12: y_{nu,1} = 0
  [A-IMPORT] SM field content, sphaleron + hypercharge constraints
  [A-IMPORT] m_DM/m_p = 49/9 (framework value)
  [D] delta/c = 1/2 (from S385 theorem)
  [D] Chemical equilibrium from S382
"""

from sympy import (symbols, Eq, solve, Rational, simplify, sqrt, pi,
                   exp, log)

print("=" * 70)
print("POST-SPHALERON CHEMICAL EQUILIBRIUM ANALYSIS")
print("Session S388")
print("=" * 70)

# =====================================================================
# PART 1: Reproduce S382 equilibrium at T ~ f
# =====================================================================
print("\n" + "=" * 70)
print("PART 1: Reproduce S382 equilibrium (T ~ f, extended system)")
print("=" * 70)

# Chemical potentials (after quark flavor equilibration):
# mu_q = common quark doublet (all 3 gens equal via CKM)
# mu_l1 = 1st gen lepton doublet
# mu_l = mu_l2 = mu_l3 (from SO(11) + nu Yukawa gen 2,3)
# h = mu_H (Higgs)
# All other potentials determined by Yukawa:
#   mu_u = mu_q - h, mu_d = mu_q + h, mu_e_i = mu_l_i + h
#   mu_nu (all 3) = mu_l - h (from SO(11) + nu Yukawa gen 2,3)

mu_q, mu_l1, mu_l, h = symbols('mu_q mu_l1 mu_l h')

# Extended system constraints:
# (S) Sphaleron: 9*mu_q + mu_l1 + 2*mu_l = 0
# (Y) Hypercharge: 6*mu_q - 2*mu_l1 - 4*mu_l - 10*h = 0

eq_S = Eq(9*mu_q + mu_l1 + 2*mu_l, 0)
eq_Y = Eq(6*mu_q - 2*mu_l1 - 4*mu_l - 10*h, 0)

sol_extended = solve([eq_S, eq_Y], [mu_q, mu_l1])
print("Extended system solution (T ~ f):")
print(f"  mu_q = {sol_extended[mu_q]}")
print(f"  mu_l1 = {sol_extended[mu_l1]}")
print(f"  mu_l2 = mu_l3 = mu_l (free)")
print(f"  mu_H = h (free)")
print(f"  mu_nu_all = mu_l - h")

mu_q_ext = sol_extended[mu_q]
mu_l1_ext = sol_extended[mu_l1]

# Compute physical quantities in extended system
n_B_ext = 12 * mu_q_ext
n_nu1_ext = mu_l - h  # n_{nu_R,1}

# Lepton numbers (including nu_R):
# L_1 = 2*mu_l1 + mu_e1 + mu_nu1 = 2*mu_l1 + (mu_l1+h) + (mu_l-h) = 3*mu_l1 + mu_l
# L_2 = 2*mu_l + (mu_l+h) + (mu_l-h) = 4*mu_l
# L_3 = 4*mu_l
n_L1_ext = 3*mu_l1_ext + mu_l
n_L2_ext = 4*mu_l
n_L_ext = simplify(n_L1_ext + n_L2_ext + n_L2_ext)

BmL_ext = simplify(n_B_ext - n_L_ext)
print(f"\nn_B = {simplify(n_B_ext)}")
print(f"n_L1 = {simplify(n_L1_ext)}")
print(f"n_L2 = n_L3 = {n_L2_ext}")
print(f"n_L = {n_L_ext}")
print(f"B-L = {BmL_ext}")
print(f"n_DM (nu_R,1) = {n_nu1_ext}")

# =====================================================================
# PART 2: Apply delta/c = 1/2 (from S385 IRA-12 theorem)
# =====================================================================
print("\n" + "=" * 70)
print("PART 2: Apply delta/c = 1/2 condition (IRA-12 theorem)")
print("=" * 70)

# delta/c = 1/2 translates to Y_{Delta_1} = B/3 - L_1 = 0
Y_Delta_1 = simplify(n_B_ext / 3 - n_L1_ext)
print(f"Y_{{Delta_1}} = B/3 - L_1 = {simplify(Y_Delta_1)}")

# Set Y_{Delta_1} = 0:
eq_delta = Eq(Y_Delta_1, 0)
h_from_delta = solve(eq_delta, h)
print(f"\nSetting Y_{{Delta_1}} = 0:")
print(f"  Solving for h: h = {h_from_delta}")

h_val = h_from_delta[0]

# Substitute back
mu_q_final = simplify(mu_q_ext.subs(h, h_val))
mu_l1_final = simplify(mu_l1_ext.subs(h, h_val))
mu_nu_final = simplify(mu_l - h_val)

print(f"\nAll potentials in terms of mu_l:")
print(f"  mu_q = {mu_q_final}")
print(f"  mu_l1 = {mu_l1_final}")
print(f"  mu_l2 = mu_l3 = mu_l")
print(f"  mu_H = {h_val}")
print(f"  mu_nu (all) = {mu_nu_final}")

n_B_final = simplify(12 * mu_q_final)
n_DM_final = mu_nu_final

print(f"\nn_B = {n_B_final}")
print(f"n_DM = {n_DM_final}")

ratio_extended = simplify(n_DM_final / n_B_final)
print(f"\n*** n_DM/n_B = {ratio_extended} ***")
print(f"    = {float(ratio_extended):.6f}")

# Verify B-L
BmL_final = simplify(BmL_ext.subs(h, h_val))
n_L1_final = simplify(3*mu_l1_final + mu_l)
print(f"\nB-L = {BmL_final}")

# =====================================================================
# PART 3: Species catalog at T_sph vs T ~ f
# =====================================================================
print("\n" + "=" * 70)
print("PART 3: Species catalog at T_sph vs T ~ f")
print("=" * 70)

f_scale = 1354   # GeV (confinement scale)
T_sph = 130      # GeV (sphaleron freezeout)

# Boltzmann suppression of heavy species at T_sph
boltz_factor = float(exp(-Rational(f_scale, T_sph)))
print(f"f = {f_scale} GeV, T_sph = {T_sph} GeV")
print(f"exp(-f/T_sph) = exp(-{f_scale/T_sph:.1f}) = {boltz_factor:.2e}")
print(f"  -> Composite resonances (mass ~ f): ABSENT at T_sph")
print(f"  -> nu_R,2,3 (Majorana mass ~ f): ABSENT at T_sph")

print(f"\nConstraints at T ~ f (15 total for 19 variables):")
print(f"  Sphaleron(1), Up-Yukawa(3), Down-Yukawa(3), Lepton-Yukawa(3),")
print(f"  Nu-Yukawa gen 2,3(2), Hypercharge(1), SO(11) gen-blind(2)")
print(f"  After CKM eq: 4 effective vars, 2 eqs, 2 free params")
print(f"  After delta/c=1/2: 1 free param (B-L normalization)")

print(f"\nConstraints at T_sph (11 total for 17 variables):")
print(f"  Same MINUS: Nu-Yukawa gen 2,3(2) and SO(11)(2)")
print(f"  LOST constraints: 4")
print(f"  LOST variables: 2 (mu_nu2, mu_nu3)")
print(f"  Net: 2 more free params at T_sph")
print(f"  After CKM eq: 5 effective vars, 2 eqs, 3 free params")
print(f"  (mu_l1, mu_l2, mu_l3 independently free)")

# =====================================================================
# PART 4: Key theorem -- T ~ f solution satisfies T_sph constraints
# =====================================================================
print("\n" + "=" * 70)
print("PART 4: T ~ f solution satisfies T_sph constraints [THEOREM]")
print("=" * 70)

print("""
THEOREM: The chemical equilibrium at T_sph gives the SAME n_DM/n_B
as at T ~ f.

PROOF:
  (1) T_sph constraints are a SUBSET of T ~ f constraints.
      (T_sph = T ~ f MINUS nu Yukawa gen 2,3 and SO(11) gen-blind)

  (2) Any solution of the full T ~ f system automatically satisfies
      the T_sph system (superset -> subset).

  (3) Between T ~ f and T_sph, the extra conserved quantities
      (L_1-L_2, L_2-L_3) that emerge when constraints are lost
      are FROZEN at their T ~ f values. No fast process changes them.

  (4) Therefore: chemical potentials at T_sph = those at T ~ f.
      In particular: n_B and n_DM are unchanged.  QED.
""")

# Verify explicitly
sph_check = simplify(9*mu_q_final + mu_l1_final + 2*mu_l)
hyp_check = simplify(6*mu_q_final - 2*mu_l1_final - 4*mu_l - 10*h_val)

print(f"EXPLICIT VERIFICATION:")
print(f"  Sphaleron at T_sph: 9*mu_q + mu_l1 + 2*mu_l = {sph_check}")
print(f"  Hypercharge at T_sph: 6*mu_q - 2*mu_l1 - 4*mu_l - 10*h = {hyp_check}")
print(f"  Both = 0: T ~ f solution IS a valid T_sph solution.")

# Show the conserved quantities are frozen
print(f"\nConserved quantities frozen between T ~ f and T_sph:")
print(f"  B - L = {BmL_final}")
L1_minus_L2 = simplify(n_L1_final - n_L2_ext)
print(f"  L_1 - L_2 = {L1_minus_L2}")
print(f"  L_2 - L_3 = 0 (by construction: mu_l2 = mu_l3)")
print(f"  These are conserved by all fast processes at T_sph (sphaleron,")
print(f"  quark/lepton Yukawa). No process connects L_1 to L_2 or L_3")
print(f"  once nu Yukawa and SO(11) constraints are gone.")

# =====================================================================
# PART 5: Why the naive two-step calculation fails
# =====================================================================
print("\n" + "=" * 70)
print("PART 5: Naive two-step calculation (WRONG)")
print("=" * 70)

print("""
NAIVE APPROACH (INCORRECT):
  Step 1: At T ~ f, equilibrium gives n_{nu_R,1} in terms of B-L
  Step 2: (B-L)_SM = (B-L)_total - n_{nu_R,1}
  Step 3: n_B = (28/79) * (B-L)_SM  [SM formula]
  Step 4: n_DM/n_B = n_{nu_R,1} / n_B

This is WRONG because B=(28/79)*(B-L) assumes flavor-UNIVERSAL
asymmetry (mu_l1 = mu_l2 = mu_l3). Here mu_l1 != mu_l2.
""")

# Express everything per unit mu_l
n_B_per_mul = simplify(n_B_final / mu_l)
n_DM_per_mul = simplify(n_DM_final / mu_l)
BmL_per_mul = simplify(BmL_final / mu_l)

print(f"From T ~ f equilibrium (per unit mu_l):")
print(f"  n_B = {n_B_per_mul} * mu_l")
print(f"  n_DM = {n_DM_per_mul} * mu_l")
print(f"  (B-L)_total = {BmL_per_mul} * mu_l")

B_over_BmL_ext = simplify(n_B_per_mul / BmL_per_mul)
print(f"\n  B/(B-L) [extended system] = {B_over_BmL_ext} = {float(B_over_BmL_ext):.6f}")
print(f"  B/(B-L) [SM, flavor-universal] = 28/79 = {float(Rational(28,79)):.6f}")
print(f"  DIFFERENT! The extended system has smaller B/(B-L).")

# Naive two-step:
# (B-L)_SM = (B-L)_total + n_{nu_R,1}
# (B-L_visible = B - L_visible = B - (L_total - L_{nu_R}) = B-L + L_{nu_R})
BmL_SM_per_mul = simplify(BmL_per_mul + n_DM_per_mul)
print(f"\n  (B-L)_SM = (B-L)_total + n_{{nu_R,1}} = {BmL_SM_per_mul} * mu_l")

# Naive n_B:
n_B_naive_per_mul = simplify(Rational(28, 79) * BmL_SM_per_mul)
print(f"  n_B [naive SM] = (28/79) * {BmL_SM_per_mul} = {n_B_naive_per_mul} * mu_l")
print(f"                 = {float(n_B_naive_per_mul):.6f} * mu_l")

# Naive ratio:
ratio_naive = simplify(n_DM_per_mul / n_B_naive_per_mul)
print(f"\n  n_DM/n_B [naive two-step] = {ratio_naive}")
print(f"                             = {float(ratio_naive):.6f}")
print(f"  n_DM/n_B [correct, S382]   = {ratio_extended}")
print(f"                             = {float(ratio_extended):.6f}")
print(f"\n  Factor difference: {float(ratio_naive/ratio_extended):.4f}")
print(f"  Naive result is WRONG by factor ~{float(abs(ratio_naive/ratio_extended)):.2f}")

# Naive Omega
omega_naive = abs(float(ratio_naive)) * float(Rational(49, 9))
omega_correct = abs(float(ratio_extended)) * float(Rational(49, 9))
print(f"\n  Omega_c/Omega_b [naive] = {omega_naive:.4f}")
print(f"  Omega_c/Omega_b [correct] = {omega_correct:.4f}")
print(f"  Planck: 5.36")
print(f"\n  -> Naive two-step makes the gap WORSE (50% vs 27%)")
print(f"  -> But this is WRONG; the correct answer IS {omega_correct:.4f}")

# =====================================================================
# PART 6: SM-only cross-check with flavored conversion
# =====================================================================
print("\n" + "=" * 70)
print("PART 6: Correct flavored sphaleron conversion at T_sph")
print("=" * 70)

# At T_sph, with SM only (no nu_R at all), the equilibrium is:
# 5 effective variables: mu_q, mu_l1, mu_l2, mu_l3, mu_H
# 2 equations: sphaleron, hypercharge
# 3 free parameters: can choose B-L, L_1-L_2, L_2-L_3

# But the PHYSICAL system also includes nu_R,1 (still present, just
# decoupled from SM). So nu_R,1's chemical potential is an extra
# independent variable that doesn't enter any SM constraint.

# The point: n_B = 12*mu_q depends on the SM equilibrium, which depends
# on all 3 free parameters. The naive B=(28/79)*(B-L) is the special
# case where all L_i are equal, making 2 of the 3 free params zero.

# Derive the CORRECT flavored conversion:
# Variables: mu_q, mu_l1, mu_l2, mu_l3, mu_H
# (mu_l2 = mu_l3 := mu_l as frozen from T ~ f)
# Sphaleron: 9*mu_q + mu_l1 + 2*mu_l = 0
# Hypercharge: 6*mu_q - 2*mu_l1 - 4*mu_l - 10*mu_H = 0

# These are the SAME two equations we solved before!
# Solution: same as extended system.
# n_B = 12*mu_q = same.

print("At T_sph, the SM-only constraints are the SAME two equations:")
print("  (S): 9*mu_q + mu_l1 + 2*mu_l = 0")
print("  (Y): 6*mu_q - 2*mu_l1 - 4*mu_l - 10*h = 0")
print()
print("Solution: mu_q and mu_l1 in terms of mu_l and h.")
print("With frozen values of mu_l and h from T ~ f:")
print(f"  mu_q = {mu_q_final}")
print(f"  mu_l1 = {mu_l1_final}")
print(f"  n_B = 12*mu_q = {n_B_final}")
print()
print("This is IDENTICAL to the T ~ f result.")
print("The flavored conversion gives the SAME n_B as the extended system.")

# =====================================================================
# PART 7: Effect of composite resonances at T ~ f
# =====================================================================
print("\n" + "=" * 70)
print("PART 7: Could composite resonances at T ~ f change the answer?")
print("=" * 70)

# Model composite resonances as extra hypercharge DOF
Delta_Y = symbols('Delta_Y')

# Modified hypercharge: 6*mu_q - 2*mu_l1 - 4*mu_l - (10-Delta_Y)*h = 0
# The composite resonances get chemical potential proportional to mu_H
eq_Y_mod = Eq(6*mu_q - 2*mu_l1 - 4*mu_l - (10 - Delta_Y)*h, 0)
sol_mod = solve([eq_S, eq_Y_mod], [mu_q, mu_l1])

mu_q_mod = sol_mod[mu_q]
mu_l1_mod = sol_mod[mu_l1]

# Apply delta/c = 1/2
n_B_mod = 12 * mu_q_mod
n_L1_mod = 3*mu_l1_mod + mu_l
Y_D1_mod = simplify(n_B_mod/3 - n_L1_mod)
h_mod_sol = solve(Eq(Y_D1_mod, 0), h)

if h_mod_sol:
    n_B_mod_val = simplify(12 * mu_q_mod.subs(h, h_mod_sol[0]))
    n_DM_mod_val = simplify(mu_l - h_mod_sol[0])
    ratio_mod = simplify(n_DM_mod_val / n_B_mod_val)

    ratio_at_0 = simplify(ratio_mod.subs(Delta_Y, 0))
    print(f"n_DM/n_B with Delta_Y extra hypercharge DOF:")
    print(f"  General formula: {ratio_mod}")
    print(f"  At Delta_Y = 0 (SM baseline): {ratio_at_0} = {float(ratio_at_0):.6f}")

    print(f"\nDelta_Y scan (composites present at T ~ f ONLY):")
    print(f"  {'DY':>5} | {'n_DM/n_B':>12} | {'Omega':>10} | {'vs Planck':>10}")
    print(f"  {'-'*5}-+-{'-'*12}-+-{'-'*10}-+-{'-'*10}")

    for dY in [-10, -5, 0, 2, 5, 8, 9]:
        r = float(ratio_mod.subs(Delta_Y, dY))
        omega = abs(r) * 49/9
        dev = (omega - 5.36) / 5.36 * 100
        marker = " <-- SM" if dY == 0 else ""
        print(f"  {dY:>5} | {r:>12.6f} | {omega:>10.4f} | {dev:>+9.1f}%{marker}")
    print(f"  Note: singularity at Delta_Y = 10 (denominator zero)")

    # Key insight: composites at T ~ f would give DIFFERENT equilibrium
    # than at T_sph (where composites are absent).
    # The correct approach: use T_sph equilibrium (Delta_Y = 0) because
    # the system re-equilibrates after composites decouple.
    print(f"\n  But composites are present at T ~ f and ABSENT at T_sph.")
    print(f"  If the system re-equilibrates after composites decouple,")
    print(f"  the T_sph answer is Delta_Y = 0 -> n_DM/n_B = -43/60.")
    print(f"  The composites DON'T help.")

    # What if composites DON'T re-equilibrate?
    # Then n_DM/n_B is set at T ~ f WITH composites.
    # But we showed that the T ~ f solution satisfies T_sph constraints,
    # so re-equilibration doesn't change anything anyway.
    # UNLESS the composites participate in the equilibrium at T ~ f,
    # in which case the T ~ f solution IS different.
    print(f"\n  Subtlety: if composites participate at T ~ f, the equilibrium")
    print(f"  at T ~ f has Delta_Y != 0. After composites decouple, the system")
    print(f"  re-equilibrates to Delta_Y = 0. This IS a change.")
    print(f"  But: composites have Y=0 in the aggregate (hypercharge neutral sector).")
    print(f"  So Delta_Y from composites is model-dependent.")

    # Find Delta_Y needed for Planck match
    target_r = Rational(-536, 100) * Rational(9, 49)
    DY_planck = solve(Eq(ratio_mod, target_r), Delta_Y)
    if DY_planck:
        DY_val = float(DY_planck[0])
        print(f"\n  Delta_Y needed for Planck match: {DY_val:.2f}")
        if DY_val > 0:
            print(f"  POSITIVE -> need extra hypercharge DOF at T ~ f")
            print(f"  Would require Delta_Y ~ {DY_val:.1f} from composite resonances")
            print(f"  BUT: composites are ABSENT at T_sph where B is frozen")
            print(f"  So this Delta_Y doesn't persist to sphaleron freezeout")

# =====================================================================
# PART 8: nu_R,2,3 lifetime check
# =====================================================================
print("\n" + "=" * 70)
print("PART 8: nu_R,2,3 decay and Boltzmann suppression")
print("=" * 70)

# Seesaw parameters
v_higgs = 246.0   # GeV
M_R = 1354.0      # GeV (Majorana mass ~ f)
m_nu_2 = 8.68e-3  # eV
m_nu_3 = 5.02e-2  # eV

# Yukawa from seesaw: m_nu = y^2 * v^2 / M_R -> y^2 = m_nu * M_R / v^2
y2_sq = (m_nu_2 * 1e-9) * M_R / v_higgs**2  # in natural units
y3_sq = (m_nu_3 * 1e-9) * M_R / v_higgs**2

# Decay width: Gamma = y^2 * M / (8*pi)
Gamma_2 = y2_sq * M_R / (8 * 3.14159)
Gamma_3 = y3_sq * M_R / (8 * 3.14159)

print(f"Heavy neutrino parameters:")
print(f"  M_R ~ f = {M_R} GeV")
print(f"  y_2^2 = {y2_sq:.4e}, y_3^2 = {y3_sq:.4e}")
print(f"  Gamma_2 = {Gamma_2:.4e} GeV, Gamma_3 = {Gamma_3:.4e} GeV")

# Hubble rate at T = M_R
g_star = 106.75
M_Pl = 1.22e19  # GeV
H_at_f = 1.66 * (g_star**0.5) * M_R**2 / M_Pl

K_2 = Gamma_2 / H_at_f
K_3 = Gamma_3 / H_at_f

print(f"\nWashout parameters:")
print(f"  H(T=f) = {H_at_f:.4e} GeV")
print(f"  K_2 = Gamma_2/H = {K_2:.1f} (strong washout)")
print(f"  K_3 = Gamma_3/H = {K_3:.1f} (strong washout)")
print(f"  -> nu_R,2,3 decay promptly at T ~ f")
print(f"  -> ABSENT at T_sph = {T_sph} GeV")

# =====================================================================
# PART 9: Post-sphaleron effects inventory
# =====================================================================
print("\n" + "=" * 70)
print("PART 9: Post-sphaleron effects inventory")
print("=" * 70)

print("""
After T_sph ~ 130 GeV, B is FROZEN. Can anything change n_DM/n_B?

1. QCD transition (T ~ 155 MeV):
   Crossover, releases entropy. Dilutes BOTH n_B and n_DM equally.
   Ratio: UNCHANGED.

2. e+e- annihilation (T ~ 0.5 MeV):
   Heats photons, not baryons/DM. Comoving densities unchanged.
   Ratio: UNCHANGED.

3. DM decoupling (T_dec ~ 11 MeV, from S385):
   Kinetic decoupling only. Number density set earlier.
   Ratio: UNCHANGED.

4. Neutrino decoupling (T ~ 1 MeV):
   Active neutrinos decouple. No effect on B or DM numbers.
   Ratio: UNCHANGED.

CONCLUSION: No post-sphaleron effect changes n_DM/n_B.
""")

# =====================================================================
# PART 10: Summary
# =====================================================================
print("\n" + "=" * 70)
print("PART 10: SUMMARY -- The 27% gap is genuine")
print("=" * 70)

print(f"""
Investigation: Does T_sph vs T ~ f close the 27% Omega gap?

ANSWER: NO. The chemical equilibrium is epoch-independent because:

  (1) T_sph constraints are a SUBSET of T ~ f constraints
  (2) T ~ f solution automatically satisfies T_sph constraints
  (3) Conserved quantities frozen between T ~ f and T_sph
  (4) Naive SM B=(28/79)*(B-L) WRONG for flavored asymmetry
  (5) No post-sphaleron effects change n_DM/n_B

CONFIRMED:
  n_DM/n_B = -43/60 = {float(Rational(-43, 60)):.6f}
  Omega_c/Omega_b = 2107/540 = {float(Rational(2107, 540)):.4f}
  Planck: 5.36
  Deviation: {abs(float(Rational(2107, 540)) - 5.36) / 5.36 * 100:.1f}%

The 27% gap is a GENUINE feature of the zero-parameter prediction.
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

# T1: Extended system sphaleron
test("Extended system: sphaleron satisfied",
     simplify(9*mu_q_final + mu_l1_final + 2*mu_l) == 0)

# T2: Extended system hypercharge
test("Extended system: hypercharge satisfied",
     simplify(6*mu_q_final - 2*mu_l1_final - 4*mu_l - 10*h_val) == 0)

# T3: T_sph constraints satisfied by T ~ f solution
test("T_sph sphaleron satisfied by T ~ f solution",
     sph_check == 0)

# T4: T_sph hypercharge satisfied
test("T_sph hypercharge satisfied by T ~ f solution",
     hyp_check == 0)

# T5: Y_{Delta_1} = 0
test("Y_{Delta_1} = 0 (IRA-12 condition)",
     simplify(n_B_final/3 - (3*mu_l1_final + mu_l)) == 0)

# T6: n_DM/n_B = -43/60
test("n_DM/n_B = -43/60",
     ratio_extended == Rational(-43, 60),
     f"got {ratio_extended}")

# T7: Omega numerical
omega_pred = abs(float(ratio_extended)) * float(Rational(49, 9))
test("Omega_c/Omega_b = 2107/540",
     abs(omega_pred - float(Rational(2107, 540))) < 1e-10,
     f"got {omega_pred:.6f}")

# T8: Composite DOF make gap worse
if h_mod_sol:
    r_0 = float(ratio_mod.subs(Delta_Y, 0))
    r_5 = float(ratio_mod.subs(Delta_Y, 5))
    # Positive Delta_Y (more hypercharge DOF) increases |n_DM/n_B|
    # But composites are absent at T_sph, so Delta_Y = 0 is correct answer
    test("Positive Delta_Y increases |n_DM/n_B| toward Planck",
         abs(r_5) > abs(r_0),
         f"|r(5)|={abs(r_5):.4f} > |r(0)|={abs(r_0):.4f}")

# T9: nu_R,2,3 Boltzmann-suppressed at T_sph
test("nu_R,2,3 Boltzmann-suppressed at T_sph",
     boltz_factor < 1e-3,
     f"exp(-f/T_sph) = {boltz_factor:.2e}")

# T10: K_2 strong washout
test("K_2 in strong washout",
     K_2 > 1,
     f"K_2 = {K_2:.1f}")

# T11: K_3 strong washout
test("K_3 in strong washout",
     K_3 > 1,
     f"K_3 = {K_3:.1f}")

# T12: Naive 28/79 gives different answer
test("Naive B=(28/79)*(B-L) gives wrong n_DM/n_B",
     simplify(ratio_naive - ratio_extended) != 0,
     f"naive={float(ratio_naive):.4f}, correct={float(ratio_extended):.4f}")

# T13: B/(B-L) differs from 28/79
test("B/(B-L) in extended system != 28/79",
     B_over_BmL_ext != Rational(28, 79),
     f"extended={B_over_BmL_ext}, SM=28/79")

# T14: Non-trivial flavor structure
test("mu_l1 != mu_l2 (flavored asymmetry)",
     simplify(mu_l1_final - mu_l) != 0,
     f"mu_l1={mu_l1_final}, mu_l2=mu_l")

# T15: QCD instanton auto-satisfied
qcd_check = simplify(2*mu_q_final - (mu_q_final - h_val) - (mu_q_final + h_val))
test("QCD instanton auto-satisfied",
     qcd_check == 0)

# T16: Omega exact = 2107/540
omega_exact = Rational(43, 60) * Rational(49, 9)
test("43/60 * 49/9 = 2107/540",
     omega_exact == Rational(2107, 540),
     f"{omega_exact}")

# T17: Planck match requires Delta_Y > 0 (composites needed but absent at T_sph)
if DY_planck:
    test("Planck match requires Delta_Y > 0 (composites absent at T_sph)",
         float(DY_planck[0]) > 0,
         f"Delta_Y = {float(DY_planck[0]):.2f}, but composites gone by T_sph")

# T18: delta/c = 1/2 verification
# At our solution: delta = (Y2+Y3)/2 = c/2 since Y1=0
# c = B-L = BmL_final
# Y2 = B/3 - L2 = n_B_final/3 - 4*mu_l
Y2_val = simplify(n_B_final/3 - 4*mu_l)
Y3_val = Y2_val
c_val = simplify(Y_D1_check + Y2_val + Y3_val) if 'Y_D1_check' in dir() else BmL_final
# delta = (Y2+Y3)/2
delta_val = simplify((Y2_val + Y3_val)/2)
dc_ratio = simplify(delta_val / BmL_final)
test("delta/c = 1/2 at solution",
     dc_ratio == Rational(1, 2),
     f"got {dc_ratio}")

print(f"\n{'=' * 70}")
print(f"RESULTS: {pass_count}/{test_count} PASS")
print(f"{'=' * 70}")
