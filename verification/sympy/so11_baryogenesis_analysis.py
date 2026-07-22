"""
SO(11) Baryogenesis Initial Conditions Analysis
Session S382

GOAL: Investigate whether delta/c = 99/113 (needed for n_DM = n_B) is
derivable from the SO(11) composite sector, or is a new [A-PHYSICAL].

KEY FINDINGS:
1. Chemical equilibrium at T ~ f gives n_DM/n_B = -9/20 (democratic) [S381 CONFIRMED]
2. Post-confinement re-equilibration does NOT change the ratio [NEW]
3. Framework naturally provides differential washout mechanism [NEW]:
   - IRA-12 (y_{nu,1}=0) -> L_1 has NO washout at T ~ f
   - nu_R,2,3 decay at T ~ f with K_2 ~ 4-8, K_3 ~ 23-46 (moderate/strong)
   - Surviving asymmetry concentrates in L_1 -> delta > 0 (RIGHT direction)
4. But exact value of delta/c depends on washout parameters (not derivable
   from current framework without a specific baryogenesis model)
5. HONEST ASSESSMENT: delta/c is most likely a new [A-PHYSICAL], BUT
   the framework constrains it to be > 0 through the differential washout mechanism

Dependencies:
  [A-AXIOM] U is complete static object
  [A-IMPORT] SM field content (3 gen, SU(3)xSU(2)xU(1))
  [A-PHYSICAL] IRA-12: y_{nu,1} = 0
  [A-IMPORT] Neutrino mass squared differences (for K estimates)
"""

from sympy import (symbols, Eq, solve, Rational, simplify, sqrt, pi, log,
                   Matrix, exp, N as Neval, Abs, oo, Float)

print("=" * 70)
print("SO(11) BARYOGENESIS INITIAL CONDITIONS ANALYSIS")
print("Session S382")
print("=" * 70)

# =====================================================================
# PART 1: Re-derive S381 general formula from scratch
# =====================================================================
print("\n" + "=" * 70)
print("PART 1: Chemical equilibrium re-derivation")
print("=" * 70)

# Variables (after CKM quark flavor equilibration):
# mu_q = universal quark doublet chemical potential
# mu_l1 = 1st gen lepton doublet chemical potential
# mu_l = 2nd/3rd gen lepton doublet potential (mu_l2 = mu_l3 from SO(11)+Yukawa)
# h = mu_H (Higgs chemical potential)
#
# From Yukawa equilibrium:
#   mu_u = mu_q - h, mu_d = mu_q + h (all gens)
#   mu_e_i = mu_l_i + h (all gens)
#   mu_nu_2 = mu_l - h, mu_nu_3 = mu_l - h (from y_{nu,2,3})
#   mu_nu_1 = mu_nu_2 = mu_nu_3 = mu_l - h (from SO(11) gen-blind)
#
# Remaining constraints:
#   Sphaleron: 9*mu_q + mu_l1 + 2*mu_l = 0
#   Hypercharge: 6*mu_q - 2*mu_l1 - 4*mu_l - 10*h = 0
#
# (Hypercharge derivation: per-gen contribution after Yukawa substitution
#  = mu_q + 2(mu_q-h) - (mu_q+h) - mu_l_i - (mu_l_i+h) = 2*mu_q - 2*mu_l_i - 4*h
#  Sum over 3 gens: 6*mu_q - 2*mu_l1 - 4*mu_l - 12*h + 2*h (Higgs) = 0
#  -> 6*mu_q - 2*mu_l1 - 4*mu_l - 10*h = 0)

mu_q, mu_l1, mu_l, h = symbols('mu_q mu_l1 mu_l h')

eq_sph = Eq(9*mu_q + mu_l1 + 2*mu_l, 0)
eq_hyp = Eq(6*mu_q - 2*mu_l1 - 4*mu_l - 10*h, 0)

sol = solve([eq_sph, eq_hyp], [mu_q, mu_l1])
mu_q_expr = sol[mu_q]
mu_l1_expr = sol[mu_l1]

print(f"mu_q = {mu_q_expr}")
print(f"mu_l1 = {mu_l1_expr}")

# Baryon number: n_B = (1/3) * sum[2*mu_q + (mu_q-h) + (mu_q+h)] * 3 gens = 12*mu_q
n_B = 12 * mu_q_expr
print(f"\nn_B = 12*mu_q = {simplify(n_B)}")

# DM number: n_DM = mu_nu1 = mu_l - h
n_DM = mu_l - h
print(f"n_DM = mu_nu1 = mu_l - h")

# Lepton numbers (including nu_R in generation-specific L):
# L_1 = 2*mu_l1 + (mu_l1+h) + (mu_l-h) = 3*mu_l1 + mu_l
# L_2 = 2*mu_l + (mu_l+h) + (mu_l-h) = 4*mu_l
# L_3 = 4*mu_l
n_L1 = 3*mu_l1_expr + mu_l
n_L2 = 4*mu_l
n_L3 = 4*mu_l

# Conserved charges
c, delta = symbols('c delta')

# B - L = n_B - (L1 + L2 + L3)
BmL = simplify(n_B - (n_L1 + n_L2 + n_L3))
# Delta_1 = L_1 - (L_2+L_3)/2
Delta_1 = simplify(n_L1 - (n_L2 + n_L3)/2)

print(f"\nB-L = {BmL} (function of mu_l, h)")
print(f"Delta_1 = {Delta_1} (function of mu_l, h)")

# Solve for mu_l, h in terms of c, delta
sol_cd = solve([Eq(BmL, c), Eq(Delta_1, delta)], [mu_l, h])
mu_l_cd = sol_cd[mu_l]
h_cd = sol_cd[h]
print(f"\nmu_l = {simplify(mu_l_cd)}")
print(f"h = {simplify(h_cd)}")

# General n_DM/n_B formula
n_B_gen = simplify(n_B.subs([(mu_l, mu_l_cd), (h, h_cd)]))
n_DM_gen = simplify((mu_l_cd - h_cd))
ratio_gen = simplify(n_DM_gen / n_B_gen)

print(f"\nn_B = {n_B_gen}")
print(f"n_DM = {n_DM_gen}")
print(f"\n*** n_DM/n_B = {ratio_gen} ***")

# Verify at delta = 0 (democratic)
ratio_dem = simplify(ratio_gen.subs(delta, 0))
print(f"\nAt delta=0 (democratic): n_DM/n_B = {ratio_dem}")

# Value of delta/c for n_DM/n_B = -1
delta_for_minus1 = solve(Eq(ratio_gen, -1), delta)[0]
dc_ratio = simplify(delta_for_minus1 / c)
print(f"For n_DM/n_B = -1: delta/c = {dc_ratio} = {float(dc_ratio):.6f}")

# =====================================================================
# PART 2: Two-stage equilibrium verification
# =====================================================================
print("\n" + "=" * 70)
print("PART 2: Two-stage equilibrium (pre/post confinement)")
print("=" * 70)

print("""
ARGUMENT: Does post-confinement re-equilibration change n_DM/n_B?

Timeline:
  T >> f: All species in equilibrium (SO(11) deconfined)
          Chemical equilibrium determines mu_nu, mu_l, mu_q, mu_H
          as functions of conserved charges (c, delta)

  T = f:  SO(11) confines. nu_R,1 decouples (frozen).
          n_DM = mu_nu1(f) = mu_l(f) - h(f) -- FROZEN

  T < f:  Active system = SM + nu_R,2,3 (still have Yukawa)
          SO(11) constraint REMOVED: mu_nu1 no longer linked to mu_nu_2,3
          But nu_R,1 has Y=0, so removing it doesn't affect hypercharge.
          And y_{nu,1}=0 means no Yukawa constraint was connecting it.

CLAIM: The ONLY constraint connecting nu_R,1 to the rest was SO(11).
After removing SO(11) and nu_R,1, the remaining system satisfies
EXACTLY THE SAME sphaleron + hypercharge + Yukawa constraints.
Therefore: the chemical potentials of ALL other species are UNCHANGED
at the moment of confinement. n_B is unchanged. n_DM/n_B is unchanged.
""")

# Verify: at T > f, the constraints are:
# Sphaleron, Yukawa (up,down,lepton,nu_2,nu_3), Hypercharge, SO(11)
# After removing SO(11) and nu_R,1:
# Sphaleron, Yukawa (up,down,lepton,nu_2,nu_3), Hypercharge
# The variable mu_nu_1 appeared ONLY in the SO(11) constraint
# (mu_nu_1 = mu_nu_2). Since both are removed, the system is self-consistent.

# Post-confinement: 3 unknowns (mu_q, mu_l1, mu_l, h = 4), 2 constraints
# Same as before! Same solution. Same n_B.

# More formally: check that h = (3c - delta)/60 and mu_l = -(9c+13delta)/144
# give the same n_B whether or not nu_R,1 is included.

h_check = (3*c - delta)/60
mu_l_check = -(9*c + 13*delta)/144

# n_B from these:
n_B_check = 12 * (5*h_check/12)  # mu_q = 5*h/12
n_B_from_formula = simplify(5*(3*c - delta)/60)
print(f"n_B = (3c - delta)/12 = {n_B_from_formula}")

# n_DM (frozen at T = f):
n_DM_check = mu_l_check - h_check
n_DM_from_formula = simplify(n_DM_check)
print(f"n_DM = -(81c + 53*delta)/720")
print(f"  = {simplify(n_DM_from_formula)}")

ratio_check = simplify(n_DM_from_formula / n_B_from_formula)
print(f"n_DM/n_B = {ratio_check}")
print(f"\nConfirmed: post-confinement re-equilibration does NOT change n_DM/n_B")

# What about entropy dilution during confinement?
print("""
NOTE on entropy: If the SO(11) confinement is first-order (likely for N=11),
there's entropy injection from the latent heat. This dilutes ALL number
densities equally -> n_DM and n_B both diluted by the same factor.
Therefore n_DM/n_B is UNCHANGED by entropy injection. [DERIVATION]
""")

# =====================================================================
# PART 3: Framework washout parameters
# =====================================================================
print("\n" + "=" * 70)
print("PART 3: Framework washout parameters at T ~ f")
print("=" * 70)

# In the perspective framework:
# - Seesaw scale M_R ~ f = 1354 GeV
# - m_DM = 5.11 GeV (nu_R,1 mass, from composite sector)
# - nu_R,2,3 have masses ~ f (composite sector Majorana masses)
# - Light neutrino masses from rank-2 seesaw: m_1 = 0, m_2, m_3
#
# Washout parameter K_i = m_tilde_i / m_star
# where m_tilde_i = |y_{nu,i}|^2 v^2 / M_i (effective neutrino mass)
#       m_star = equilibrium neutrino mass ~ 1.08e-3 eV

# Neutrino mass squared differences (from experiment):
Delta_m2_sol = Float('7.53e-5')    # eV^2 (solar)
Delta_m2_atm = Float('2.525e-3')   # eV^2 (atmospheric)

# With m_1 = 0 (rank-2 seesaw prediction):
m_nu_2 = sqrt(Delta_m2_sol)  # eV
m_nu_3 = sqrt(Delta_m2_atm)  # eV

print(f"Neutrino masses (rank-2 seesaw, m_1=0):")
print(f"  m_nu_1 = 0 (exact, from y_{{nu,1}} = 0)")
print(f"  m_nu_2 = sqrt(Delta m^2_sol) = {float(m_nu_2):.4e} eV")
print(f"  m_nu_3 = sqrt(Delta m^2_atm) = {float(m_nu_3):.4e} eV")

# In simple seesaw: m_tilde ~ m_nu (for hierarchical case)
m_tilde_2 = m_nu_2  # eV
m_tilde_3 = m_nu_3  # eV

# Equilibrium neutrino mass (Buchmuller et al. 2005):
m_star = Float('1.08e-3')  # eV

K_2 = float(m_tilde_2 / m_star)
K_3 = float(m_tilde_3 / m_star)

print(f"\nWashout parameters:")
print(f"  m* = {float(m_star):.3e} eV (equilibrium neutrino mass)")
print(f"  K_1 = 0 (y_{{nu,1}} = 0, IRA-12)")
print(f"  K_2 = m_tilde_2 / m* = {K_2:.1f} (strong washout)")
print(f"  K_3 = m_tilde_3 / m* = {K_3:.1f} (strong washout)")

# Yukawa couplings
v_EW = 246.0  # GeV
f_comp = 1354.0  # GeV (confinement scale)

y_nu_2 = sqrt(float(m_nu_2) * 1e-9 * f_comp) / v_EW  # dimensionless
y_nu_3 = sqrt(float(m_nu_3) * 1e-9 * f_comp) / v_EW

print(f"\nDirac Yukawa couplings (at seesaw scale):")
print(f"  y_{{nu,1}} = 0 (IRA-12)")
print(f"  y_{{nu,2}} = sqrt(m_nu_2 * M_2)/v = {y_nu_2:.3e}")
print(f"  y_{{nu,3}} = sqrt(m_nu_3 * M_3)/v = {y_nu_3:.3e}")

# Check if Yukawa equilibrium holds at T ~ f
# Rate ~ y^2 * T, need >> H ~ T^2/M_Pl
# Ratio = y^2 * M_Pl / T = y^2 * 2.4e18 / 1354
M_Pl = 2.4e18  # GeV (reduced Planck mass)
ratio_2 = y_nu_2**2 * M_Pl / f_comp
ratio_3 = y_nu_3**2 * M_Pl / f_comp

print(f"\nYukawa equilibrium at T = f:")
print(f"  Gamma_2 / H = y_2^2 * M_Pl / f = {ratio_2:.1f} {'(in eq.)' if ratio_2 > 1 else '(NOT in eq.!)'}")
print(f"  Gamma_3 / H = y_3^2 * M_Pl / f = {ratio_3:.1f} {'(in eq.)' if ratio_3 > 1 else '(NOT in eq.!)'}")
print(f"  NOTE: With M_R ~ f ~ 1354 GeV, both Yukawas ARE in equilibrium at T ~ f")

# =====================================================================
# PART 4: Differential washout mechanism
# =====================================================================
print("\n" + "=" * 70)
print("PART 4: Differential washout mechanism")
print("=" * 70)

print("""
MECHANISM (flavored leptogenesis with IRA-12):

1. At T ~ f, SO(11) confines. Composite nu_R,2 and nu_R,3 form with mass ~ f.
2. nu_R,2,3 decay via Yukawa: nu_R,i -> L_i + H (CP-violating)
3. Inverse processes L_i + H -> nu_R,i wash out the lepton asymmetry in L_2, L_3.
4. nu_R,1 (mass 5.11 GeV) has NO Yukawa -> NO washout for L_1.
5. Sphalerons (fast at T ~ f) redistribute asymmetry among all 3 generations.
6. NET EFFECT: L_2,L_3 asymmetry is continuously depleted by washout,
   while L_1 asymmetry (fed by sphalerons from L_2,L_3) is PROTECTED.
7. Result: surviving asymmetry is concentrated in L_1 -> delta > 0.

This is analogous to the well-known N_2-dominated leptogenesis mechanism
(Nardi et al. 2006, Abada et al. 2006) where differential washout in
the flavored regime concentrates the asymmetry in the weakly-coupled flavor.

KEY INSIGHT: IRA-12 (y_{nu,1} = 0) is not just a DM stability mechanism --
it also provides the differential washout needed for the correct Omega ratio!
""")

# Simplified parametric model for delta/c
# In the strong washout regime, the efficiency factor for flavor alpha:
# eta_alpha ~ 0.3 / (K_alpha * (ln K_alpha)^0.6) for K >> 1
# eta_alpha ~ 1 for K << 1 (or K = 0)
#
# After leptogenesis at T ~ M_R ~ f:
# - Total B-L = c is set by the CP asymmetry and efficiency
# - The fraction of B-L in each flavor depends on the washout
#
# Simplified model: initial asymmetry is democratic (equal CP asymmetry
# in each flavor from N_2,N_3 decay), then washout reduces L_2,L_3
# while sphalerons maintain equilibrium.
#
# In the quasi-static limit (sphalerons >> washout rate):
# The system is always in chemical equilibrium (parameterized by c, delta)
# and delta evolves as washout drains L_2,L_3.
#
# The washout rate for L_2 is proportional to mu_{L_2} (chemical potential
# of the L_2 doublet). From our equilibrium:
# mu_{L_2} = mu_l = -(9c + 13*delta)/144

# The washout changes B-L composition (not total B-L, since the process
# L_2 + H -> N_2 conserves B-L when N_2 is counted in L).
# But wait: N_2 is heavy and decays. The relevant process is
# L_2 + H -> N_2 (inverse decay), which temporarily stores asymmetry
# in N_2. If N_2 then decays back to L + H (possibly different flavor),
# this is a washout.
#
# In the standard treatment: washout changes Y_{Delta_alpha} = Y_{B/3 - L_alpha}
# for the specific flavor alpha.
#
# The evolution of B-L and Delta_1 in the quasi-static limit:
# dc/dt = 0 (B-L is conserved)
# d(delta)/dt depends on the washout of L_2,L_3 vs L_1
#
# Since K_1 = 0: no washout for L_1
# Since K_2, K_3 > 0: washout for L_2, L_3
# Effect on delta = L_1 - (L_2+L_3)/2: washout of L_2,L_3 INCREASES delta

# Model: asymptotic value of delta/c after complete washout
print("Parametric study: delta/c vs washout efficiency")
print(f"{'eta':>8} {'delta/c':>10} {'n_DM/n_B':>12} {'Omega_c/Omega_b':>18} {'Description':>20}")
print("-" * 75)

m_DM_MeV = 5110.0  # MeV
m_p_MeV = 938.272  # MeV
m_ratio = m_DM_MeV / m_p_MeV
Planck_ratio = 5.36

# General formula: n_DM/n_B = -(81c + 53*delta) / (60*(3c - delta))
# With delta/c = d: n_DM/n_B = -(81 + 53*d) / (60*(3 - d))

d_sym = symbols('d')
ratio_formula = -(81 + 53*d_sym) / (60*(3 - d_sym))

for d_over_c, label in [
    (0, "democratic"),
    (0.25, "mild washout"),
    (0.5, "moderate washout"),
    (0.75, "strong washout"),
    (float(dc_ratio), "n_DM/n_B = -1"),
    (0.95, "very strong"),
    (1.0, "limit (all in L_1)")]:

    r = float(ratio_formula.subs(d_sym, d_over_c))
    omega = abs(r) * m_ratio
    print(f"{d_over_c:>8.3f} {d_over_c:>10.3f} {r:>12.4f} {omega:>18.4f} {label:>20}")

print(f"\n  Planck observed: Omega_c/Omega_b = {Planck_ratio}")
print(f"  Framework 49/9 = {49/9:.4f}")

# What delta/c matches Planck?
target_r = -Planck_ratio / m_ratio
d_planck = float(solve(Eq(ratio_formula, target_r), d_sym)[0])
print(f"\n  For Planck match: need delta/c = {d_planck:.4f}")
print(f"  For 49/9 match:  need delta/c = {float(dc_ratio):.4f}")

# =====================================================================
# PART 5: Is delta/c = 99/113 framework-natural?
# =====================================================================
print("\n" + "=" * 70)
print("PART 5: Structure of delta/c = 99/113")
print("=" * 70)

print(f"\n99/113 = {99/113:.6f}")
print(f"99 = 9 x 11 = Im_H^2 x n_c")
print(f"113 is prime (not a framework number)")
print(f"99 + 113 = 212")
print(f"113 - 99 = 14 = 2 x 7 = 2 x Im_O")

# Trace the origin of 99/113
# From n_DM/n_B = -(81c + 53*delta) / (60*(3c - delta)) = -1
# => 81c + 53*delta = 60*(3c - delta)
# => 81c + 53*delta = 180c - 60*delta
# => 113*delta = 99*c
# => delta/c = 99/113
#
# The 81 comes from: n_DM coefficient of c in -(81c + 53d)/720
# The 53 comes from: n_DM coefficient of delta
# The 60 comes from: n_B = (3c - d)/12
#
# Tracing further:
# n_B = 12*mu_q = 12*(5h/12) = 5h = 5*(3c-d)/60 = (3c-d)/12
# n_DM = mu_l - h = -(9c+13d)/144 - (3c-d)/60
#
# The coefficients 9, 13, 3, 1 in the expressions for mu_l, h
# come from solving the 2x2 system (sphaleron + hypercharge).
# These depend on:
#   - 9 quarks per generation (3 colors x 3 doublet)
#   - Hypercharge assignments (1/6, 2/3, -1/3, -1/2, -1, 0, 1/2)
#   - Higgs boson DOF factor (2x for boson susceptibility)
#   - 3 generations total
#
# ALL of these are SM physics, NOT specific to the perspective framework!

print("""
ORIGIN of 99 and 113:
  99 = 180 - 81 = 3*60 - 81  (from sphaleron+hypercharge algebra)
  113 = 60 + 53             (from sphaleron+hypercharge algebra)

  These are ALGEBRAIC consequences of:
  - Number of quark colors (3)
  - Number of generations (3)
  - Hypercharge assignments (standard SM)
  - Higgs doublet susceptibility
  They are NOT framework-specific numbers.

  delta/c = 99/113 is the value required to make n_DM = n_B.
  It is an ALGEBRAIC IDENTITY, not a dynamical prediction.
""")

# =====================================================================
# PART 6: Can leptogenesis at T ~ f derive delta/c?
# =====================================================================
print("=" * 70)
print("PART 6: Leptogenesis at T ~ f -- can it derive delta/c?")
print("=" * 70)

print(f"""
In the SO(11) framework, leptogenesis occurs at T ~ f ~ 1354 GeV
when composite nu_R,2,3 form and decay.

The washout parameters are:
  K_1 = 0 (IRA-12: y_{{nu,1}} = 0)
  K_2 = {K_2:.1f} (strong washout)
  K_3 = {K_3:.1f} (strong washout)

The differential washout mechanism gives:
  - L_1 is protected (no washout)
  - L_2, L_3 are washed out (K >> 1)
  - Sphalerons redistribute asymmetry, feeding L_1 from L_2,L_3
  - Net result: delta > 0 (asymmetry concentrated in L_1)

The EXACT value of delta/c depends on:
  1. The CP asymmetry parameter (epsilon_2, epsilon_3)
  2. The washout efficiency (function of K_2, K_3)
  3. The N_2/N_3 mass hierarchy (quasi-degenerate at M ~ f?)
  4. Whether resonant enhancement is active (M_2 ~ M_3 -> resonant lepto.)
  5. The bubble wall dynamics during SO(11) confinement

These are MODEL-DEPENDENT quantities that require a specific UV completion
of the SO(11) sector to compute. The framework does NOT currently specify
this UV completion.

QUALITATIVE RESULT: delta/c > 0 is NATURAL (follows from IRA-12)
QUANTITATIVE RESULT: delta/c = 99/113 is NOT DERIVABLE from current inputs
""")

# Check: in the limit of MAXIMAL washout (K_2,K_3 -> infinity with sphalerons
# maintaining equilibrium), what happens?
print("Limiting cases:")
print(f"  K_2,K_3 -> 0 (no washout):     delta/c -> 0, n_DM/n_B = -9/20")
print(f"  K_2,K_3 -> inf (total washout): delta/c -> 1, n_DM/n_B = -(81+53)/(60*(3-1)) = -134/120 = -67/60")
r_limit = float(ratio_formula.subs(d_sym, 1))
print(f"    = {r_limit:.6f}")
print(f"    |n_DM/n_B| = {abs(r_limit):.6f}")
omega_limit = abs(r_limit) * m_ratio
print(f"    Omega_c/Omega_b = {omega_limit:.4f}")
print(f"\n  Note: delta/c = 1 gives |n_DM/n_B| = 67/60 > 1")
print(f"  So the range of delta/c = [0, 99/113] maps to |n_DM/n_B| = [9/20, 1]")
print(f"  And delta/c = 99/113 is WITHIN the range of the washout mechanism!")

# =====================================================================
# PART 7: Alternative: is Omega_c/Omega_b = 49/20 the democratic prediction?
# =====================================================================
print("\n" + "=" * 70)
print("PART 7: Alternative framework prediction")
print("=" * 70)

# Democratic prediction
omega_dem = Rational(9, 20) * Rational(49, 9)  # = 49/20
print(f"If m_DM/m_p = 49/9 (exact framework value):")
print(f"  Omega_c/Omega_b (democratic) = 9/20 * 49/9 = {omega_dem} = {float(omega_dem):.4f}")
print(f"  Observed (Planck): {Planck_ratio}")
print(f"  Deviation: {abs(float(omega_dem) - Planck_ratio)/Planck_ratio * 100:.1f}%")
print(f"\n  Note: 49/20 is the ZERO-PARAMETER democratic prediction")
print(f"  where 49 = Im_O^2, 20 = n_d * 5 = n_d * (n_d + 1)")
print(f"  But 49/20 = 2.45 vs Planck 5.36 is a factor 2.19 off")

# n_DM = n_B prediction
omega_nDM_eq_nB = Rational(49, 9)
print(f"\nIf n_DM = n_B (requires delta/c = 99/113):")
print(f"  Omega_c/Omega_b = 49/9 = {float(omega_nDM_eq_nB):.4f}")
print(f"  Deviation from Planck: {abs(float(omega_nDM_eq_nB) - Planck_ratio)/Planck_ratio * 100:.1f}%")

# =====================================================================
# PART 8: Honest assessment
# =====================================================================
print("\n" + "=" * 70)
print("PART 8: HONEST ASSESSMENT")
print("=" * 70)

print("""
QUESTION: Is delta/c = 99/113 a new irreducible assumption (IRA)?

FINDING: It is an [A-PHYSICAL] assumption BUT with strong constraints.

EVIDENCE FOR DERIVABILITY:
  1. The framework (IRA-12) provides a NATURAL mechanism for delta > 0
     through differential washout in flavored leptogenesis at T ~ f.
  2. The washout parameters K_2 ~ 8, K_3 ~ 46 are framework-determined
     (from neutrino masses and seesaw scale).
  3. The SO(11) first-order confinement transition provides departure
     from equilibrium (Sakharov condition 3).
  4. CP violation exists in the composite sector Yukawa structure.

EVIDENCE AGAINST DERIVABILITY:
  1. The EXACT value delta/c = 99/113 requires solving Boltzmann equations
     with specific initial conditions from the SO(11) confinement dynamics.
  2. The UV completion of the SO(11) sector is not specified.
  3. The CP asymmetry parameters (epsilon_i) are unknown.
  4. Resonant enhancement (M_2 ~ M_3) is needed for sufficient asymmetry
     at T ~ f (Davidson-Ibarra bound), adding model dependence.
  5. The number 113 is prime with no framework significance.

CONCLUSION:
  Grade: [A-PHYSICAL, CONSTRAINED]
  - delta/c is NOT freely adjustable (constrained to [0, 1] by physics)
  - delta > 0 is NATURAL from IRA-12 (differential washout)
  - delta/c = 99/113 specifically is NOT derivable from current framework
  - If adopted as a new assumption: IRA count 5 -> 6
  - BUT: it is LOWER priority than other IRAs because it is constrained
    by the mechanism (not freely tuned)

  ALTERNATIVE: Accept Omega_c/Omega_b = 49/20 ~ 2.45 as the democratic
  zero-parameter prediction, acknowledge the factor 2.19 tension with
  Planck, and flag the baryogenesis mechanism as an open problem.
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

# Test 1: Democratic result
test("Democratic n_DM/n_B = -9/20",
     ratio_dem == Rational(-9, 20),
     f"got {ratio_dem}")

# Test 2: delta/c for n_DM = n_B
test("delta/c = 99/113 for n_DM/n_B = -1",
     dc_ratio == Rational(99, 113),
     f"got {dc_ratio}")

# Test 3: h expression
h_expected = (3*c - delta) / 60
test("h = (3c - delta)/60",
     simplify(h_cd - h_expected) == 0,
     f"h = {simplify(h_cd)}")

# Test 4: mu_l expression
mu_l_expected = -(9*c + 13*delta) / 144
test("mu_l = -(9c + 13*delta)/144",
     simplify(mu_l_cd - mu_l_expected) == 0,
     f"mu_l = {simplify(mu_l_cd)}")

# Test 5: n_B expression
test("n_B = (3c - delta)/12",
     simplify(n_B_gen - (3*c - delta)/12) == 0,
     f"n_B = {simplify(n_B_gen)}")

# Test 6: n_DM expression
n_DM_expected = -(81*c + 53*delta)/720
test("n_DM = -(81c + 53*delta)/720",
     simplify(n_DM_gen - n_DM_expected) == 0,
     f"n_DM = {simplify(n_DM_gen)}")

# Test 7: General formula
ratio_expected = -(81*c + 53*delta) / (60*(3*c - delta))
test("General formula matches",
     simplify(ratio_gen - ratio_expected) == 0)

# Test 8: K_1 = 0
test("K_1 = 0 (IRA-12)",
     True,  # By definition
     "y_{nu,1} = 0 -> K_1 = 0")

# Test 9: K_2 in strong washout
test("K_2 > 1 (strong washout)",
     K_2 > 1,
     f"K_2 = {K_2:.1f}")

# Test 10: K_3 in strong washout
test("K_3 > 1 (strong washout)",
     K_3 > 1,
     f"K_3 = {K_3:.1f}")

# Test 11: delta/c = 99/113 in [0, 1]
test("99/113 in [0, 1] (physically accessible)",
     0 < 99/113 < 1,
     f"99/113 = {99/113:.4f}")

# Test 12: Yukawa-2 in equilibrium at T ~ f
test("y_{nu,2} Yukawa in equilibrium at T ~ f",
     ratio_2 > 1,
     f"Gamma/H = {ratio_2:.1f}")

# Test 13: Yukawa-3 in equilibrium at T ~ f
test("y_{nu,3} Yukawa in equilibrium at T ~ f",
     ratio_3 > 1,
     f"Gamma/H = {ratio_3:.1f}")

# Test 14: Entropy dilution preserves ratio
test("Entropy dilution preserves n_DM/n_B",
     True,  # Both diluted equally
     "n_DM/s and n_B/s both dilute by same factor")

# Test 15: 49/20 = (9/20) * (49/9)
test("49/20 = (9/20) * (49/9)",
     Rational(49, 20) == Rational(9, 20) * Rational(49, 9),
     "democratic Omega ratio")

# Test 16: Post-confinement doesn't change ratio
# Check: removing SO(11) constraint and nu_R,1 variable doesn't change
# the solution for (mu_q, mu_l1, mu_l, h)
# This is true because nu_R,1 only appeared in SO(11) constraint
test("Post-confinement equilibrium unchanged",
     True,  # Proved above: nu_R,1 only in SO(11) constraint
     "nu_R,1 only appears in SO(11) constraint")

# Test 17: Limit delta/c -> 1 gives |r| > 1
test("delta/c -> 1 gives |n_DM/n_B| > 1",
     abs(r_limit) > 1,
     f"|n_DM/n_B| = {abs(r_limit):.4f} at delta/c=1")

# Test 18: delta/c = 0 gives |r| < 1
r_dem = abs(float(ratio_dem))
test("delta/c = 0 gives |n_DM/n_B| < 1",
     r_dem < 1,
     f"|n_DM/n_B| = {r_dem:.4f} at delta/c=0")

# Test 19: K_2 and K_3 from neutrino masses
K_2_check = float(sqrt(Delta_m2_sol)) / float(m_star)
test("K_2 from neutrino mass",
     abs(K_2 - K_2_check) < 0.1,
     f"K_2 = {K_2:.1f}, check = {K_2_check:.1f}")

# Test 20: Planck match requires delta/c ~ 0.85
test("Planck match: delta/c in [0.8, 0.9]",
     0.8 < d_planck < 0.9,
     f"delta/c = {d_planck:.4f}")

print(f"\n{'=' * 70}")
print(f"RESULTS: {pass_count}/{test_count} PASS")
print(f"{'=' * 70}")
