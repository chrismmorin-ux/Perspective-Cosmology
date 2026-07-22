"""
Chemical equilibrium calculation: n_DM/n_B from SO(11) composite sector
Session S380

Goal: Derive n_DM/n_B from chemical equilibrium at T ~ f = 1354 GeV.
Key question: Is n_DM/n_B = 1 (giving Omega_c/Omega_b = 49/9) or something else?

Setup:
- T ~ 1 TeV: all SM species in equilibrium
- 3 generations of quarks and leptons
- 3 nu_R, all participating in SO(11) composite equilibrium
- IRA-12: y_{nu,1} = 0 (1st gen nu_R has NO Yukawa coupling)
- SO(11) composite sector: generation-blind at T > f (S377 theorem)

Chemical potential conventions:
- mu_q_i = chemical potential for left-handed quark doublet, generation i
- mu_u_i = chemical potential for right-handed up-type quark, generation i
- mu_d_i = chemical potential for right-handed down-type quark, generation i
- mu_l_i = chemical potential for left-handed lepton doublet, generation i
- mu_e_i = chemical potential for right-handed charged lepton, generation i
- mu_nu_i = chemical potential for right-handed neutrino, generation i
- mu_H = chemical potential for Higgs doublet

At T ~ 1 TeV (above EWSB), the Higgs is in the symmetric phase.
All Yukawa interactions are in equilibrium EXCEPT y_{nu,1} = 0.
"""

from sympy import symbols, Eq, solve, Rational, simplify, Matrix
from sympy import pprint

print("=" * 70)
print("CHEMICAL EQUILIBRIUM: n_DM/n_B DERIVATION")
print("=" * 70)

# =====================================================================
# STEP 1: Define chemical potentials
# =====================================================================
print("\n--- Step 1: Chemical potentials ---")

# Left-handed quark doublets (3 generations, 3 colors each)
mu_q1, mu_q2, mu_q3 = symbols('mu_q1 mu_q2 mu_q3')

# Right-handed up-type quarks (3 gen, 3 colors)
mu_u1, mu_u2, mu_u3 = symbols('mu_u1 mu_u2 mu_u3')

# Right-handed down-type quarks (3 gen, 3 colors)
mu_d1, mu_d2, mu_d3 = symbols('mu_d1 mu_d2 mu_d3')

# Left-handed lepton doublets (3 gen)
mu_l1, mu_l2, mu_l3 = symbols('mu_l1 mu_l2 mu_l3')

# Right-handed charged leptons (3 gen)
mu_e1, mu_e2, mu_e3 = symbols('mu_e1 mu_e2 mu_e3')

# Right-handed neutrinos (3 gen)
mu_nu1, mu_nu2, mu_nu3 = symbols('mu_nu1 mu_nu2 mu_nu3')

# Higgs doublet
mu_H = symbols('mu_H')

# =====================================================================
# STEP 2: Equilibrium constraints
# =====================================================================
print("\n--- Step 2: Equilibrium constraints ---")

# All variables
all_vars = [mu_q1, mu_q2, mu_q3,
            mu_u1, mu_u2, mu_u3,
            mu_d1, mu_d2, mu_d3,
            mu_l1, mu_l2, mu_l3,
            mu_e1, mu_e2, mu_e3,
            mu_nu1, mu_nu2, mu_nu3,
            mu_H]
print(f"Total chemical potentials: {len(all_vars)}")  # 19

constraints = []

# --- Constraint 1: Electroweak sphalerons ---
# Sum over generations: 3*mu_q_i + mu_l_i = 0 for each generation? NO.
# The CORRECT sphaleron constraint is:
# sum_i (3*mu_q_i + mu_l_i) = 0 (sum over all 3 generations)
sphaleron = 3*mu_q1 + mu_l1 + 3*mu_q2 + mu_l2 + 3*mu_q3 + mu_l3
constraints.append(Eq(sphaleron, 0))
print(f"C1 (EW sphaleron): 3*(mu_q1+mu_q2+mu_q3) + (mu_l1+mu_l2+mu_l3) = 0")

# --- Constraint 2: Yukawa equilibrium ---
# Up-type Yukawa: mu_q_i - mu_u_i - mu_H = 0 (for i = 1,2,3)
# (All up-type Yukawas are nonzero)
for i, (mq, mu) in enumerate([(mu_q1, mu_u1), (mu_q2, mu_u2), (mu_q3, mu_u3)]):
    constraints.append(Eq(mq - mu - mu_H, 0))
print(f"C2a-c (up Yukawa): mu_qi - mu_ui - mu_H = 0 (i=1,2,3)")

# Down-type Yukawa: mu_q_i - mu_d_i + mu_H = 0 (for i = 1,2,3)
# (conjugate Higgs couples to down-type: mu_q = mu_d + mu_H_conj = mu_d - mu_H)
# Convention: Yukawa coupling is Q_L H d_R^c, so mu_q + mu_H - mu_d = 0
# Actually: L_Yukawa = y_d Q_L H d_R, chemical eq: mu_q + mu_H = mu_d
# Wait, need to be careful with conventions.
#
# Standard: y_u Q_L H_tilde u_R -> mu_q - mu_H_tilde - mu_u = 0 -> mu_q + mu_H - mu_u = 0
# Wait no. H_tilde = i sigma_2 H^*, so mu_{H_tilde} = -mu_H.
# y_u Q_L H_tilde u_R: mu_q + mu_{H_tilde} = mu_u -> mu_q - mu_H = mu_u
# y_d Q_L H d_R: mu_q + mu_H = mu_d
# y_e L H e_R: mu_l + mu_H = mu_e
# y_nu L H_tilde nu_R: mu_l - mu_H = mu_nu (Dirac neutrino Yukawa)
#
# Let me redo the up-type:
# mu_q - mu_H - mu_u = 0 -> mu_u = mu_q - mu_H (CORRECT, already done above)

# Down-type Yukawa: mu_q + mu_H - mu_d = 0
constraints_new = []
for c in constraints:
    constraints_new.append(c)
constraints = constraints_new

# Replace the up-type constraints - they were correct: mu_q - mu_u - mu_H = 0
# Now add down-type:
for i, (mq, md) in enumerate([(mu_q1, mu_d1), (mu_q2, mu_d2), (mu_q3, mu_d3)]):
    constraints.append(Eq(mq + mu_H - md, 0))
print(f"C3a-c (down Yukawa): mu_qi + mu_H - mu_di = 0 (i=1,2,3)")

# Charged lepton Yukawa: mu_l_i + mu_H - mu_e_i = 0
for i, (ml, me) in enumerate([(mu_l1, mu_e1), (mu_l2, mu_e2), (mu_l3, mu_e3)]):
    constraints.append(Eq(ml + mu_H - me, 0))
print(f"C4a-c (lepton Yukawa): mu_li + mu_H - mu_ei = 0 (i=1,2,3)")

# Neutrino Dirac Yukawa: mu_l_i - mu_H - mu_nu_i = 0
# BUT: y_{nu,1} = 0 (IRA-12), so this ONLY applies to i = 2, 3
for i, (ml, mn) in enumerate([(mu_l2, mu_nu2), (mu_l3, mu_nu3)]):
    constraints.append(Eq(ml - mu_H - mn, 0))
print(f"C5a-b (nu Yukawa, gen 2,3 ONLY): mu_li - mu_H - mu_nui = 0 (i=2,3)")
print(f"  NOTE: y_{{nu,1}} = 0 -> NO constraint on mu_nu1 from Yukawa!")

# --- Constraint 3: Hypercharge neutrality ---
# Y_Q = 1/6 (x2 for doublet, x3 for color) -> 6 * (1/6) = 1 per gen
# Y_u = 2/3 (x3 for color) -> 3 * (2/3) = 2 per gen
# Y_d = -1/3 (x3 for color) -> 3 * (-1/3) = -1 per gen
# Y_L = -1/2 (x2 for doublet) -> 2 * (-1/2) = -1 per gen
# Y_e = -1 -> -1 per gen
# Y_nu = 0 -> 0 per gen (nu_R is a singlet!)
# Y_H = 1/2 (x2 for doublet) -> 2 * (1/2) = 1
#
# Total hypercharge density proportional to sum of Y * mu * (multiplicity):
# For each generation i:
#   Q_L: 2 (doublet) * 3 (color) * (1/6) * mu_qi = mu_qi
#   u_R: 3 (color) * (2/3) * mu_ui = 2 * mu_ui
#   d_R: 3 (color) * (-1/3) * mu_di = -mu_di
#   L:   2 (doublet) * (-1/2) * mu_li = -mu_li
#   e_R: 1 * (-1) * mu_ei = -mu_ei
#   nu_R: 1 * 0 * mu_nui = 0

# Higgs: 2 (doublet) * (1/2) * mu_H = mu_H

# At T >> m_W, the susceptibility coefficients are T^2/6 per DOF.
# For fermions it's T^2/6 per Weyl fermion; for scalars T^2/6 per real scalar (T^2/3 per complex doublet).
# But in the HIGH-T limit with all species relativistic, the hypercharge neutrality
# simplifies because susceptibility is the same for all species (up to stat factors).
#
# Actually, the standard chemical equilibrium calculation uses:
# n_i - n_i_bar ~ (g_i * T^2 / 6) * mu_i/T for fermions (each Weyl DOF)
# n_i - n_i_bar ~ (g_i * T^2 / 3) * mu_i/T for bosons (each real DOF)
#
# Hypercharge neutrality: sum_i Y_i * (n_i - n_i_bar) = 0
# = sum_i Y_i * chi_i * mu_i = 0
#
# For fermions (per Weyl DOF): chi = T^2/6
# For complex scalar (per complex DOF): chi = T^2/3 (= 2 real DOFs * T^2/6)
# But the Higgs is a complex doublet = 4 real DOFs, so chi_H = 4 * T^2/6 = 2T^2/3
# Wait, let me be more careful.
#
# Standard approach (Harvey & Turner 1990):
# For a Weyl fermion with chemical potential mu:
#   n - n_bar = (T^2/6) * mu  (per internal DOF)
# For a complex scalar:
#   n - n_bar = (T^2/3) * mu  (per internal DOF)
#
# The "internal DOFs" are: for Q_L it's 2(doublet)*3(color) = 6 Weyl fermions per gen
# etc.
#
# For hypercharge neutrality, we need:
# sum over species: Y_i * (internal DOFs) * chi * mu_i = 0
# where chi = 1/6 for fermions, 1/3 for bosons (dropping T^2)
#
# Actually, the simplest way: for each chiral fermion, the contribution to
# hypercharge density is Y * (T^2/6) * mu, and for a complex scalar it's
# Y * (T^2/3) * mu.
#
# Per generation (fermions only):
#   Q_L: Y=1/6, DOF=2*3=6 Weyl -> contribution = (1/6)*6*(T^2/6)*mu_q = (1/6)*mu_q * T^2
#   u_R: Y=2/3, DOF=3 Weyl -> (2/3)*3*(T^2/6)*mu_u = (1/3)*mu_u * T^2
#   d_R: Y=-1/3, DOF=3 Weyl -> (-1/3)*3*(T^2/6)*mu_d = -(1/6)*mu_d * T^2
#   L:   Y=-1/2, DOF=2 Weyl -> (-1/2)*2*(T^2/6)*mu_l = -(1/6)*mu_l * T^2
#   e_R: Y=-1, DOF=1 Weyl -> (-1)*1*(T^2/6)*mu_e = -(1/6)*mu_e * T^2
#   nu_R: Y=0 -> 0
#
# Higgs: Y=1/2, DOF=2 complex = 4 real
#   -> (1/2)*2*(T^2/3)*mu_H = (1/3)*mu_H * T^2
#   Wait, for a complex doublet: 2 complex components, each contributes T^2/3.
#   So total: Y * 2 * (T^2/3) * mu_H = (1/2)*2*(1/3)*mu_H * T^2 = (1/3)*mu_H * T^2
#
# Let me factor out T^2/6:
#   Q_L per gen: Y*2*3 * mu_q = 1/6 * 6 * mu_q = mu_q
#   u_R per gen: Y*3 * mu_u = 2/3 * 3 * mu_u = 2*mu_u
#   d_R per gen: Y*3 * mu_d = -1/3 * 3 * mu_d = -mu_d
#   L per gen: Y*2 * mu_l = -1/2 * 2 * mu_l = -mu_l
#   e_R per gen: Y*1 * mu_e = -1 * mu_e = -mu_e
#   nu_R per gen: Y*1 * mu_nu = 0
#   Higgs: Y*2*2 * mu_H = 1/2 * 4 * mu_H = 2*mu_H  (factor 2 for boson vs fermion)
#
# Hmm, let me use the standard formulation more carefully.
#
# In the relativistic limit, for a single Weyl (2-component) fermion:
#   n - nbar = mu * T^2 / 6
#
# For a single complex scalar:
#   n - nbar = mu * T^2 / 3
#
# Hypercharge neutrality: sum_species Y_i * (n_i - nbar_i) = 0
#
# Species and their Weyl DOFs (internal):
#   Q_L: SU(2) doublet, SU(3) triplet -> 2*3 = 6 Weyl DOFs, Y = 1/6
#   u_R: SU(3) triplet -> 3 Weyl DOFs, Y = 2/3
#   d_R: SU(3) triplet -> 3 Weyl DOFs, Y = -1/3
#   L:   SU(2) doublet -> 2 Weyl DOFs, Y = -1/2
#   e_R: singlet -> 1 Weyl DOF, Y = -1
#   nu_R: singlet -> 1 Weyl DOF, Y = 0
#   H:   SU(2) doublet complex scalar -> 2 complex DOFs, Y = 1/2
#
# Contribution to Y-density (dropping T^2/6 common factor):
# Fermion with g internal DOFs, hypercharge Y, chem pot mu:
#   Y * g * mu
# Boson with g complex DOFs, hypercharge Y, chem pot mu:
#   Y * g * 2 * mu  (factor 2 because T^2/3 = 2 * T^2/6)
#
# So per generation:
#   Q_L: (1/6) * 6 * mu_q = mu_q
#   u_R: (2/3) * 3 * mu_u = 2 * mu_u
#   d_R: (-1/3) * 3 * mu_d = -mu_d
#   L:   (-1/2) * 2 * mu_l = -mu_l
#   e_R: (-1) * 1 * mu_e = -mu_e
#   nu_R: 0 * 1 * mu_nu = 0
# Higgs (once):
#   (1/2) * 2 * 2 * mu_H = 2 * mu_H

hypercharge = Rational(0)
for mq, mu, md, ml, me, mn in [
    (mu_q1, mu_u1, mu_d1, mu_l1, mu_e1, mu_nu1),
    (mu_q2, mu_u2, mu_d2, mu_l2, mu_e2, mu_nu2),
    (mu_q3, mu_u3, mu_d3, mu_l3, mu_e3, mu_nu3)]:
    hypercharge += mq + 2*mu - md - ml - me  # nu_R has Y=0
hypercharge += 2 * mu_H  # Higgs contribution (boson factor 2)

constraints.append(Eq(hypercharge, 0))
print(f"C6 (hypercharge neutrality): sum_gen(mu_q + 2*mu_u - mu_d - mu_l - mu_e) + 2*mu_H = 0")

# --- Constraint 4: SO(11) composite sector ---
# At T > f, the SO(11) strong sector enforces generation-blind chemical potentials
# for nu_R (S377: unique Yukawa invariant is generation-blind)
# mu_nu1 = mu_nu2 = mu_nu3
constraints.append(Eq(mu_nu1 - mu_nu2, 0))
constraints.append(Eq(mu_nu1 - mu_nu3, 0))
print(f"C7a-b (SO(11) composite): mu_nu1 = mu_nu2 = mu_nu3")

# --- Constraint 5: QCD instanton (optional) ---
# At T ~ 1 TeV, QCD instantons give: sum_i (2*mu_qi - mu_ui - mu_di) = 0
# This is actually automatically satisfied by Yukawa equilibrium if mu_H is
# unconstrained. Let's check:
# From up Yukawa: mu_ui = mu_qi - mu_H
# From down Yukawa: mu_di = mu_qi + mu_H
# So: 2*mu_qi - mu_ui - mu_di = 2*mu_qi - (mu_qi - mu_H) - (mu_qi + mu_H) = 0
# YES, automatically satisfied. No additional constraint needed.
print(f"C8 (QCD instanton): AUTOMATICALLY SATISFIED by Yukawa equilibrium")

print(f"\nTotal constraints: {len(constraints)}")
print(f"Total variables: {len(all_vars)}")
print(f"Expected free parameters: {len(all_vars) - len(constraints)} (should be 1: overall B-L)")

# =====================================================================
# STEP 3: Solve the system
# =====================================================================
print("\n--- Step 3: Solve system ---")

# Convert to equations to solve
# We have 19 variables and should have 18 constraints (leaving 1 free parameter)
# Let's count:
# C1: 1 (sphaleron)
# C2: 3 (up Yukawa)
# C3: 3 (down Yukawa)
# C4: 3 (lepton Yukawa)
# C5: 2 (nu Yukawa, gen 2,3 only)
# C6: 1 (hypercharge)
# C7: 2 (SO(11) composite)
# Total: 15 constraints, 19 variables -> 4 free parameters
# Hmm, that's too many. In the standard calculation there's typically 1 free parameter.
#
# Wait - in the SM without nu_R, there are:
# 15 variables (no nu_R, no mu_H sometimes absorbed)
# And typically the system reduces to everything in terms of mu_B-L.
#
# Here we have mu_H as a variable, but with 6 Yukawa constraints linking it to
# other potentials. Let me recount.
#
# Variables: mu_q1..3 (3), mu_u1..3 (3), mu_d1..3 (3), mu_l1..3 (3),
#            mu_e1..3 (3), mu_nu1..3 (3), mu_H (1) = 19
# Constraints: 1 + 3 + 3 + 3 + 2 + 1 + 2 = 15
# Free parameters: 19 - 15 = 4
#
# This is because without the nu_1 Yukawa, we have one less constraint, AND
# we haven't imposed any B-L conservation or similar.
#
# Actually, in the standard treatment, B-L is conserved and provides a normalization.
# The system is solved in terms of mu_{B-L} as the single free parameter.
# But B-L conservation means: the total B-L number is fixed (not a constraint equation,
# just a normalization). So we solve for ratios.
#
# Let me solve the linear system and express everything in terms of the free parameters.

solution = solve([c for c in constraints], all_vars, dict=True)

if solution:
    sol = solution[0]
    print(f"\nSolution found with {len(sol)} determined variables")

    # Find free parameters
    determined = set(sol.keys())
    free = [v for v in all_vars if v not in determined]
    print(f"Free parameters: {free}")

    print("\nAll chemical potentials in terms of free parameters:")
    for v in all_vars:
        if v in sol:
            expr = simplify(sol[v])
            print(f"  {v} = {expr}")
        else:
            print(f"  {v} = {v} (FREE)")
else:
    print("No solution found! Checking for inconsistencies...")
    # Try with explicit matrix approach
    pass

# =====================================================================
# STEP 4: Compute baryon and DM number densities
# =====================================================================
print("\n" + "=" * 70)
print("STEP 4: Baryon and DM number densities")
print("=" * 70)

# Baryon number density:
# n_B proportional to sum over quarks of (1/3) * g_i * mu_i
# Each quark Weyl fermion carries B = 1/3
# Q_L has 2 (doublet) * 3 (color) Weyl DOFs per generation
# u_R has 3 (color) Weyl DOFs per generation
# d_R has 3 (color) Weyl DOFs per generation
#
# n_B = (T^2/6) * sum_gen [ (1/3)*6*mu_q + (1/3)*3*mu_u + (1/3)*3*mu_d ]
#      = (T^2/6) * sum_gen [ 2*mu_q + mu_u + mu_d ]

if solution:
    sol = solution[0]

    n_B_coeff = Rational(0)
    for mq, mu_up, md in [(mu_q1, mu_u1, mu_d1),
                           (mu_q2, mu_u2, mu_d2),
                           (mu_q3, mu_u3, mu_d3)]:
        mq_val = sol.get(mq, mq)
        mu_val = sol.get(mu_up, mu_up)
        md_val = sol.get(md, md)
        n_B_coeff += 2*mq_val + mu_val + md_val

    n_B_coeff = simplify(n_B_coeff)
    print(f"\nn_B proportional to: {n_B_coeff}")

    # DM number density:
    # n_DM = n_{nu_R,1} = (T^2/6) * 1 * mu_nu1
    # (nu_R is a single Weyl fermion, singlet under everything)
    mu_nu1_val = sol.get(mu_nu1, mu_nu1)
    n_DM_coeff = mu_nu1_val
    print(f"n_DM proportional to: {n_DM_coeff}")

    # Ratio n_DM/n_B
    ratio = simplify(n_DM_coeff / n_B_coeff)
    print(f"\nn_DM / n_B = {ratio}")

    # Lepton number density for reference:
    # n_L = sum_gen [ 2*mu_l + mu_e + mu_nu ]
    n_L_coeff = Rational(0)
    for ml, me, mn in [(mu_l1, mu_e1, mu_nu1),
                        (mu_l2, mu_e2, mu_nu2),
                        (mu_l3, mu_e3, mu_nu3)]:
        ml_val = sol.get(ml, ml)
        me_val = sol.get(me, me)
        mn_val = sol.get(mn, mn)
        n_L_coeff += 2*ml_val + me_val + mn_val
    n_L_coeff = simplify(n_L_coeff)
    print(f"n_L proportional to: {n_L_coeff}")

    # B-L density:
    BmL = simplify(n_B_coeff - n_L_coeff)
    print(f"B-L proportional to: {BmL}")

# =====================================================================
# STEP 5: Alternative approach - explicit matrix
# =====================================================================
print("\n" + "=" * 70)
print("STEP 5: Explicit matrix approach")
print("=" * 70)

# Let's use the standard technique: solve everything in terms of mu_H and mu_nu1.
# From Yukawa equilibrium:
#   mu_u_i = mu_q_i - mu_H  (all i)
#   mu_d_i = mu_q_i + mu_H  (all i)
#   mu_e_i = mu_l_i + mu_H  (all i)
#   mu_nu_2 = mu_l_2 - mu_H
#   mu_nu_3 = mu_l_3 - mu_H
# From SO(11): mu_nu_1 = mu_nu_2 = mu_nu_3
# So: mu_nu_1 = mu_l_2 - mu_H = mu_l_3 - mu_H
# => mu_l_2 = mu_l_3 = mu_nu_1 + mu_H

# Let's denote mu_nu_1 = N (our free parameter, will relate to B-L)
N = symbols('N')  # = mu_nu1

# From SO(11) + nu Yukawa (gen 2,3):
# mu_l_2 = N + mu_H
# mu_l_3 = N + mu_H

# Substitute into sphaleron:
# 3*(mu_q1 + mu_q2 + mu_q3) + (mu_l1 + mu_l2 + mu_l3) = 0
# 3*(mu_q1 + mu_q2 + mu_q3) + mu_l1 + 2*(N + mu_H) = 0  ... (*)

# Substitute into hypercharge:
# For each gen: mu_q + 2*(mu_q - mu_H) - (mu_q + mu_H) - mu_l - (mu_l + mu_H) + 2*mu_H = 0
# = mu_q + 2*mu_q - 2*mu_H - mu_q - mu_H - mu_l - mu_l - mu_H + 2*mu_H = 0
# = 2*mu_q - 2*mu_l - 2*mu_H + 2*mu_H ... let me redo carefully

# Per generation contribution to hypercharge (using Yukawa to eliminate u,d,e):
# mu_q + 2*mu_u - mu_d - mu_l - mu_e
# = mu_q + 2*(mu_q - mu_H) - (mu_q + mu_H) - mu_l - (mu_l + mu_H)
# = mu_q + 2*mu_q - 2*mu_H - mu_q - mu_H - mu_l - mu_l - mu_H
# = 2*mu_q - 2*mu_l - 4*mu_H

# Hypercharge: sum_gen (2*mu_q_i - 2*mu_l_i - 4*mu_H) + 2*mu_H = 0
# = 2*sum(mu_q_i) - 2*sum(mu_l_i) - 12*mu_H + 2*mu_H = 0
# = 2*sum(mu_q_i) - 2*sum(mu_l_i) - 10*mu_H = 0
# => sum(mu_q_i) = sum(mu_l_i) + 5*mu_H  ... (**)

# From (*) and (**):
# (*): 3*sum(mu_q_i) + sum(mu_l_i) = -2*N - 2*mu_H + mu_l1 - mu_l1
# Wait, let me be more careful.
# sum(mu_l_i) = mu_l1 + mu_l2 + mu_l3 = mu_l1 + 2*(N + mu_H)

# (*): 3*sum(mu_q_i) + mu_l1 + 2*(N + mu_H) = 0
# (**): sum(mu_q_i) = mu_l1 + 2*(N + mu_H) + 5*mu_H
#       sum(mu_q_i) = mu_l1 + 2*N + 7*mu_H

# Substituting (**) into (*):
# 3*(mu_l1 + 2*N + 7*mu_H) + mu_l1 + 2*N + 2*mu_H = 0
# 3*mu_l1 + 6*N + 21*mu_H + mu_l1 + 2*N + 2*mu_H = 0
# 4*mu_l1 + 8*N + 23*mu_H = 0
# mu_l1 = -(8*N + 23*mu_H) / 4  ... (***)

print("Solving explicitly...")
print("From Yukawa + SO(11):")
print("  mu_u_i = mu_q_i - mu_H")
print("  mu_d_i = mu_q_i + mu_H")
print("  mu_e_i = mu_l_i + mu_H")
print("  mu_nu_2 = mu_l_2 - mu_H = N (SO(11))")
print("  mu_nu_3 = mu_l_3 - mu_H = N (SO(11))")
print("  => mu_l_2 = mu_l_3 = N + mu_H")
print()

# Now we need one more relation. In the SM with 3 gen + nu_R + Higgs,
# there's still a question: what determines mu_H?
#
# With all Yukawas in equilibrium, the system has 2 free parameters: B and L separately
# (or equivalently B+L and B-L, with sphalerons fixing B+L = 0... no, sphalerons
# violate B+L while preserving B-L).
#
# Actually, sphalerons set B+L = 0 in equilibrium? No. The sphaleron constraint
# is on the RATES, not on the total number. The constraint is:
# sum_i (3*mu_qi + mu_li) = 0
# This is a constraint on chemical potentials, equivalent to saying B+L
# production rate = 0 in equilibrium.
#
# In the standard SM, the conserved charges are:
# B-L (exactly conserved)
# B/3 - L_i (approximately conserved if flavor mixing is slow)
#
# At T ~ 1 TeV with all Yukawas (except y_{nu,1}) in equilibrium, the
# fast interactions are: gauge, Yukawa, sphalerons.
# Conserved quantities: B-L only (if all flavors mix fast).
#
# But wait: y_{nu,1} = 0 means there's an ADDITIONAL conserved quantity!
# Specifically, B/3 - L_1 + (something involving nu_R,1).
# Or more precisely: since nu_R,1 has NO Yukawa but IS in SO(11) equilibrium
# with nu_R,2 and nu_R,3, the situation is more subtle.
#
# Let me think about what's conserved:
# - B-L is conserved (no Majorana masses, no L-violating interactions)
# - Actually, with only Dirac Yukawas and no Majorana mass, individual
#   lepton flavors L_i are broken by flavor-mixing (CKM/PMNS).
#   But we're at T ~ f where composite interactions are active.
#
# The number of free parameters should equal the number of conserved charges.
# With sphalerons active: B+L is violated (so not conserved).
# B-L is conserved.
# If all Yukawas were active: 1 free parameter (B-L).
# With y_{nu,1} = 0: there's an additional conserved quantity.
# What is it? It's the "1st-generation right-handed neutrino number" N_{nu_R,1}
# minus something. Since nu_R,1 only participates in SO(11) interactions
# (which redistribute among nu_R generations but conserve total nu_R number),
# and nu_R,2, nu_R,3 have Yukawa couplings...
#
# Actually, the SO(11) composite interaction redistributes nu_R number
# among generations (generation-blind). And Yukawa y_{nu,2}, y_{nu,3}
# convert nu_R,2 <-> L_2 and nu_R,3 <-> L_3. So the combination
# (total nu_R number) is NOT conserved because y_{nu,2,3} convert
# some nu_R into leptons. But (nu_R,1 number) alone is not conserved
# either because SO(11) mixes generations.
#
# Hmm, but the SO(11) interaction conserves TOTAL nu_R number while
# redistributing among generations. And y_{nu,2,3} convert total nu_R
# into L. So total nu_R number IS violated by Yukawa. But...
#
# Wait. The Yukawa interaction converts one nu_R,i and one L_i into a Higgs.
# This changes nu_R number by -1 and L_i number by -1.
# With all 3 Yukawas: total nu_R number violated.
# With only y_{nu,2,3}: nu_R,2 and nu_R,3 can be converted, but nu_R,1
# can only be redistributed via SO(11) into nu_R,2 or nu_R,3, which
# then get converted via Yukawa. So even nu_R,1 number is eventually
# violated through the chain: nu_R,1 -> (SO(11)) -> nu_R,2 -> (Yukawa) -> L_2 + H
#
# Therefore: total nu_R number is NOT conserved. B-L is the only conserved charge.
# The system should have 1 free parameter.
#
# But we found 4 free parameters above. Let me recheck.
#
# OH WAIT. The issue is that we don't have generation-mixing constraints for quarks.
# In the SM at T ~ 1 TeV, CKM mixing equilibrates quark flavors, meaning
# mu_q1 = mu_q2 = mu_q3 (and similarly for u_R and d_R, via Yukawa).
# Similarly PMNS mixing equilibrates lepton flavors (if neutrino oscillations
# are fast enough at T ~ TeV).
#
# With generation-universal quark chemical potentials: mu_q1 = mu_q2 = mu_q3 := mu_q
# And from Yukawa: mu_u1 = mu_u2 = mu_u3 = mu_q - mu_H
# mu_d1 = mu_d2 = mu_d3 = mu_q + mu_H

# For leptons: CKM-like mixing (PMNS) equilibrates LEFT-handed leptons:
# mu_l1 = mu_l2 = mu_l3
# And from charged lepton Yukawa: mu_e1 = mu_e2 = mu_e3 = mu_l + mu_H

# BUT WAIT: if mu_l1 = mu_l2 = mu_l3, and mu_l2 = N + mu_H (from above),
# then mu_l1 = N + mu_H too.
# From (***): mu_l1 = -(8*N + 23*mu_H)/4
# Setting equal: N + mu_H = -(8*N + 23*mu_H)/4
# 4*N + 4*mu_H = -8*N - 23*mu_H
# 12*N = -27*mu_H
# mu_H = -12*N/27 = -4*N/9

print("\n--- With quark/lepton flavor equilibration ---")
print("CKM mixing: mu_q1 = mu_q2 = mu_q3 := mu_q")
print("PMNS mixing: mu_l1 = mu_l2 = mu_l3 := mu_l")
print()

# BUT: Is PMNS mixing really fast enough at T ~ 1 TeV?
# In the SM, neutrino oscillations are suppressed by m_nu^2/T^2.
# At T ~ 1 TeV, the oscillation rate ~ m_nu^2/T is tiny.
# However, in the composite Higgs model, the Yukawa couplings y_{nu,2,3}
# directly couple L_i to nu_R through the Higgs. This IS fast at T ~ f.
# But y_{nu,1} = 0, so L_1 is NOT coupled to nu_R,1 via Yukawa.
#
# The question is: is there any fast interaction that equilibrates mu_l1 with
# mu_l2 and mu_l3?
#
# Charged current weak interactions mix (nu_L,i, e_L,i) within generation,
# but don't mix generations.
# The PMNS matrix enters through neutrino oscillations (too slow at T ~ TeV).
#
# So actually mu_l1 may NOT equal mu_l2 and mu_l3!
# This is the key subtlety.
#
# Let me redo WITHOUT assuming lepton flavor equilibration:
# mu_l2 = mu_l3 = N + mu_H (from SO(11) + y_{nu,2,3})
# mu_l1 is independent

# But quark flavor equilibration IS valid (CKM mixing is fast via W exchange):
# mu_q1 = mu_q2 = mu_q3 := mu_q

print("KEY SUBTLETY: At T ~ 1 TeV, PMNS mixing is slow (m_nu^2/T << H).")
print("So mu_l1 != mu_l2 in general!")
print("But CKM mixing IS fast -> mu_q1 = mu_q2 = mu_q3 = mu_q")
print()

# Actually, wait. Even for quarks, CKM mixing occurs through W-boson exchange.
# The rate is ~ alpha_W^2 * T >> H at T ~ TeV, so quarks are flavor-equilibrated.
# For leptons, without neutrino masses (or with tiny masses),
# the only flavor-changing interaction is through the PMNS matrix in
# charged currents... but those conserve lepton flavor individually in the
# limit of zero neutrino mass.
#
# In our framework: y_{nu,1} = 0 means nu_1 is exactly massless (after EWSB).
# Before EWSB (T > T_EW), the Dirac Yukawa y_{nu,2,3} provides L_2-L_3 mixing
# through loops. But L_1 is decoupled from L_2, L_3 in the Yukawa sector.
#
# However, charged lepton Yukawas (y_e, y_mu, y_tau) DON'T mix flavors
# (they're diagonal in the mass basis).
# And gauge interactions DON'T mix flavors.
# So L_1 is indeed NOT equilibrated with L_2, L_3 at T ~ f!
#
# This means we have TWO conserved charges:
# 1. B - L (total)
# 2. B/3 - L_1 (or equivalently, L_1 minus some combination)
#
# Actually, if L_1 doesn't mix with anything else, then L_1 is separately
# conserved! (Up to sphalerons, which violate B + L but not B - L or
# individual L_i - L_j differences when there's no mixing.)
#
# Wait, sphalerons violate B + L: specifically, each sphaleron transition
# changes Delta B = Delta L = 3 (one unit per generation). So sphalerons
# produce EQUAL amounts of B and L in EACH generation:
# Delta(B/3) = Delta(L_1) = Delta(L_2) = Delta(L_3) = 1
#
# The sphaleron constraint then is: mu_B/3 + mu_{L_i} must be the same for
# each generation? No. The constraint is that the sphaleron rate equation:
# sum_i (3*mu_qi + mu_li) = 0
# This is the single constraint (not per-generation).
#
# If quarks are flavor-equilibrated (mu_q1=mu_q2=mu_q3=mu_q), this becomes:
# 9*mu_q + mu_l1 + mu_l2 + mu_l3 = 0
#
# The conserved quantities are:
# - B - L (anomaly-free, exactly conserved)
# - L_1 - L_2 (conserved if no mixing between gen 1 and gen 2)
# - L_2 - L_3 (if no mixing between gen 2 and 3 — but y_{nu,2,3} + SO(11) DO mix them!)
#
# Actually: L_2 - L_3 IS violated by the combination of y_{nu,2}, y_{nu,3}
# and SO(11) composite interaction. The SO(11) sector generates
# nu_R,2 <-> nu_R,3 transitions, and the Yukawas convert these into L_2 and L_3.
# So L_2 - L_3 is NOT conserved.
# But L_1 - L_2 IS conserved! Because the only way to change L_1 is through
# sphalerons (which change all L_i equally) or through a Yukawa coupling to nu_R,1
# (which is zero). Even though SO(11) mixes nu_R,1 with nu_R,2,3, this doesn't
# affect L_1 because nu_R,1 has no Yukawa coupling to L_1.
#
# Hmm wait, let me reconsider. The SO(11) composite interaction can convert
# nu_R,1 <-> nu_R,2. And then y_{nu,2} converts nu_R,2 + H <-> L_2.
# This changes total nu_R number and L_2 number, but NOT L_1 number.
# So L_1 is only changed by sphalerons.
#
# Delta_sphaleron(B) = 3, Delta_sphaleron(L_i) = 1 for each i.
# So Delta(B - L_1 - L_2 - L_3) = 0 (sphalerons conserve B-L).
# And Delta(L_1 - L_2) = 0 under sphalerons (they change all L_i equally).
# And L_1 - L_2 is not changed by any other interaction (since y_{nu,1} = 0).
# Similarly L_1 - L_3 is conserved.
# But L_2 - L_3 is NOT conserved (SO(11) + Yukawa mix them).
#
# So the conserved charges are:
# 1. B - L
# 2. L_1 - L_2 (or equivalently L_1 - L_3, since L_2 - L_3 is violated)
# Wait, if L_1 - L_2 and L_1 - L_3 are BOTH conserved, then L_2 - L_3 =
# (L_1 - L_3) - (L_1 - L_2) is also conserved. Contradiction!
#
# Let me reconsider. L_2 - L_3 violation: how exactly?
# SO(11) composite interaction: this generates transitions among nu_R
# generations. Each transition conserves total nu_R number but changes
# individual nu_R,i numbers. For example, nu_R,2 -> nu_R,3 changes
# N_{nu_R,2} by -1 and N_{nu_R,3} by +1.
# Does this change L_2 or L_3? NO! nu_R is a SM singlet. Its number
# is not "lepton number" in the SM sense. L_i = (lepton doublet L_i
# number) + (e_R,i number). The nu_R is separate.
#
# OK so: SM lepton number L_i = N(nu_L,i) + N(e_L,i) + N(e_R,i)
# (where nu_L,i and e_L,i are the components of the doublet L_i)
# nu_R is NOT part of SM lepton number!
#
# But in our framework, we're extending to include nu_R. The B-L symmetry
# includes nu_R: L includes all lepton species.
# With the conventional definition L_i = N(L_i doublet) + N(e_R,i) + N(nu_R,i):
# - Sphalerons change Delta(L_i_doublet) = +1 per generation -> Delta(L_i) = +1
# - y_{nu,2}: L_2 + H -> nu_R,2, changes L_2 doublet by -1, nu_R,2 by +1
#   So Delta(L_2) = Delta(N(L_2 doublet)) + Delta(N(nu_R,2)) = -1 + 1 = 0
#   Yukawa CONSERVES L_2!
# - SO(11) composite: nu_R,2 -> nu_R,3, changes N(nu_R,2) by -1, N(nu_R,3) by +1
#   So Delta(L_2) = -1, Delta(L_3) = +1. This VIOLATES L_2 - L_3!
#
# So the SO(11) composite interaction violates individual L_i (when nu_R,i
# is included in L_i) by redistributing nu_R among generations.
#
# Does it affect L_1? YES! If SO(11) converts nu_R,1 -> nu_R,2, then
# Delta(L_1) = -1, Delta(L_2) = +1. So L_1 IS changed by SO(11)!
#
# Therefore: the only conserved charge is B - L (total). And we should
# have exactly 1 free parameter.
#
# BUT: here's the subtlety. The SO(11) composite interaction equilibrates
# mu_nu1 = mu_nu2 = mu_nu3 (generation-blind). And the Yukawas give
# mu_nu2 = mu_l2 - mu_H, mu_nu3 = mu_l3 - mu_H. So mu_l2 = mu_l3.
# And mu_nu1 = mu_l2 - mu_H.
# But mu_l1 is NOT directly constrained to equal mu_l2!
# The only constraint involving mu_l1 is the sphaleron equation.
#
# However, mu_l1 IS indirectly constrained by the fact that L_1 is connected
# to everything else through sphalerons (which produce L_1 along with B).
# And the total system should have 1 free parameter (B-L normalization).
#
# Let me just solve the system properly. With quark flavor equilibration:
# mu_q1 = mu_q2 = mu_q3 = mu_q
# mu_u1 = mu_u2 = mu_u3 = mu_q - mu_H (from up Yukawa)
# mu_d1 = mu_d2 = mu_d3 = mu_q + mu_H (from down Yukawa)
# mu_l2 = mu_l3 (from SO(11) + nu Yukawa, shown above)
# mu_e1 = mu_l1 + mu_H (from charged lepton Yukawa)
# mu_e2 = mu_l2 + mu_H (from charged lepton Yukawa)
# mu_e3 = mu_l3 + mu_H = mu_l2 + mu_H
# mu_nu1 = mu_nu2 = mu_nu3 = mu_l2 - mu_H (from SO(11) + nu Yukawa)
#
# Remaining unknowns: mu_q, mu_l1, mu_l2, mu_H (4 unknowns)
# Remaining constraints:
# Sphaleron: 9*mu_q + mu_l1 + 2*mu_l2 = 0
# Hypercharge: 3*(2*mu_q - 4*mu_H) - mu_l1 - 2*mu_l2 + 2*mu_H ...
# Let me recompute hypercharge with the substitutions.

# Hypercharge: sum over 3 gen of (mu_q + 2*mu_u - mu_d - mu_l - mu_e) + 2*mu_H = 0
# Per gen: mu_q + 2*(mu_q - mu_H) - (mu_q + mu_H) - mu_l_i - (mu_l_i + mu_H)
#        = mu_q + 2*mu_q - 2*mu_H - mu_q - mu_H - mu_l_i - mu_l_i - mu_H
#        = 2*mu_q - 2*mu_l_i - 4*mu_H
# Gen 1: 2*mu_q - 2*mu_l1 - 4*mu_H
# Gen 2: 2*mu_q - 2*mu_l2 - 4*mu_H
# Gen 3: 2*mu_q - 2*mu_l2 - 4*mu_H
# Sum: 6*mu_q - 2*mu_l1 - 4*mu_l2 - 12*mu_H
# Plus Higgs: + 2*mu_H
# Total: 6*mu_q - 2*mu_l1 - 4*mu_l2 - 10*mu_H = 0

# So our system (4 unknowns, 2 equations):
# (S): 9*mu_q + mu_l1 + 2*mu_l2 = 0
# (Y): 6*mu_q - 2*mu_l1 - 4*mu_l2 - 10*mu_H = 0
#
# Two equations, four unknowns -> 2 free parameters.
# Hmm, that's 2, not 1. What's the second conserved charge?
#
# It must be related to the fact that mu_l1 is not connected to mu_l2
# through any fast interaction (other than sphalerons). Let me think...
#
# With y_{nu,1} = 0, the quantity (B/3 - L_1) is NOT changed by:
# - Gauge interactions (conserve B and L_i separately)
# - Yukawa interactions (don't involve L_1's nu_R coupling)
# - SO(11) composite (changes nu_R,1 but nu_R,1 is not part of L_1 in SM sense)
#   Wait, this depends on the definition.
#
# Let me use the CHEMICAL POTENTIAL definition of conserved charge.
# A charge Q = sum_species q_i * n_i is conserved iff sum_species q_i * Delta(n_i) = 0
# for all fast processes.
#
# Fast processes at T ~ f:
# 1. Sphalerons: Delta = (+1 to each q_L gen doublet, +1 to each l_L gen doublet)
#    In terms of our variables: Delta(mu_q) = +1 each gen, Delta(mu_l_i) = +1 each gen
#    Wait, sphalerons produce 1 left-handed doublet per generation:
#    Delta(Q_L,i) = +1, Delta(L_i) = +1 for i=1,2,3
#    So chemical potential constraint: sum_i (3*mu_qi + mu_li) = 0 (9 quarks + 3 leptons per event)

# 2. Up Yukawa: Q_L + H_tilde -> u_R. Chemical: mu_q - mu_H = mu_u
# 3. Down Yukawa: Q_L + H -> d_R. Chemical: mu_q + mu_H = mu_d
# 4. Charged lepton Yukawa: L + H -> e_R. Chemical: mu_l + mu_H = mu_e
# 5. Nu Yukawa (gen 2,3): L_i + H_tilde -> nu_R,i. Chemical: mu_l_i - mu_H = mu_nu_i
# 6. SO(11) composite: nu_R,i <-> nu_R,j. Chemical: mu_nu_i = mu_nu_j
# 7. QCD instanton: automatically satisfied

# A conserved charge Q = sum q_i mu_i must satisfy:
# For sphalerons: sum_i (3*q_{Q_L,i} + q_{L_i}) = 0
# For up Yukawa: q_{Q_L} - q_{H_tilde} - q_{u_R} = 0 -> q_{Q_L} + q_H - q_{u_R} = 0
# For down Yukawa: q_{Q_L} + q_H - q_{d_R} = 0
# Wait, actually this isn't quite right. Let me think about it differently.
#
# The conserved charges are the null space of the "interaction matrix" M_{a,i}
# where a indexes interactions and i indexes species. M_{a,i} is the change
# in species i number from interaction a.
#
# Let me just solve numerically to check my 2-free-parameter result.
# With B-L as normalization and L_1 - L_2 as the second parameter:

# Actually, I think the issue is cleaner than I'm making it.
# The point is: with y_{nu,1} = 0, there IS an additional conserved charge.
# It's related to the asymmetry between the 1st generation lepton sector
# and the 2nd/3rd generation.
#
# Specifically: Define X = (number of nu_R,1) - (number of nu_L,1)
# Or some similar quantity. Let me find it systematically.
#
# OK let me just solve the reduced system and see what happens.

print("\n--- Reduced system (quark flavor equilibrated) ---")

mu_q, mu_l, mu_l1_s = symbols('mu_q mu_l mu_l1_s')  # mu_l = mu_l2 = mu_l3
h = symbols('h')  # = mu_H

# Sphaleron: 9*mu_q + mu_l1_s + 2*mu_l = 0
eq1 = Eq(9*mu_q + mu_l1_s + 2*mu_l, 0)

# Hypercharge: 6*mu_q - 2*mu_l1_s - 4*mu_l - 10*h = 0
eq2 = Eq(6*mu_q - 2*mu_l1_s - 4*mu_l - 10*h, 0)

# Solve for mu_q, mu_l1_s in terms of mu_l, h
sol_reduced = solve([eq1, eq2], [mu_q, mu_l1_s])
print("Solution in terms of mu_l (= mu_l2 = mu_l3) and h (= mu_H):")
for var, expr in sol_reduced.items():
    print(f"  {var} = {simplify(expr)}")

# Now express everything:
mu_q_expr = sol_reduced[mu_q]
mu_l1_expr = sol_reduced[mu_l1_s]

print(f"\nmu_q = {mu_q_expr}")
print(f"mu_l1 = {mu_l1_expr}")
print(f"mu_l2 = mu_l3 = mu_l (free)")
print(f"mu_H = h (free)")
print(f"mu_u = mu_q - h = {simplify(mu_q_expr - h)}")
print(f"mu_d = mu_q + h = {simplify(mu_q_expr + h)}")
print(f"mu_e1 = mu_l1 + h = {simplify(mu_l1_expr + h)}")
print(f"mu_e2 = mu_l + h")
print(f"mu_nu (all 3) = mu_l - h")

# Baryon number density (proportional to):
# n_B ~ sum over 3 gen of [2*mu_q + mu_u + mu_d]
#      = 3 * [2*mu_q + (mu_q - h) + (mu_q + h)]
#      = 3 * 4 * mu_q = 12 * mu_q
n_B_expr = 12 * mu_q_expr
print(f"\nn_B ~ 12 * mu_q = {simplify(n_B_expr)}")

# DM number density (nu_R,1):
# n_DM ~ mu_nu1 = mu_l - h
n_DM_expr = mu_l - h
print(f"n_DM ~ mu_nu1 = mu_l - h")

# Now we need to fix the second free parameter.
# We have mu_l and h as free parameters. But physical observables should
# depend only on B-L (one parameter). The second "free" parameter
# corresponds to the additional conserved charge.
#
# The question for n_DM/n_B: we need to know the INITIAL CONDITIONS.
# What sets the B-L asymmetry and the second charge?
#
# In standard leptogenesis/baryogenesis: B-L is generated first, then
# sphalerons + Yukawas redistribute it. If the second conserved charge
# is initially zero (as expected from generic baryogenesis), then we
# can set it to zero and solve.
#
# What IS the second conserved charge? It's related to the decoupling
# of the 1st generation lepton sector.
#
# B - L = (baryon number) - (lepton number including nu_R)
# The second charge Q_2:
# From our equations, the free parameters are mu_l and h.
# The B-L density:
# n_{B-L} = n_B - n_L
# n_B = 12 * mu_q (as computed)
# n_L = (2*mu_l1 + mu_e1 + mu_nu1) + 2*(2*mu_l + mu_e + mu_nu)
# where all species for gen 2,3 are the same

# Gen 1: 2*mu_l1 + (mu_l1 + h) + (mu_l - h) = 3*mu_l1 + mu_l
# Gen 2: 2*mu_l + (mu_l + h) + (mu_l - h) = 4*mu_l
# Gen 3: same as gen 2 = 4*mu_l
# Total: n_L = 3*mu_l1 + mu_l + 8*mu_l = 3*mu_l1 + 9*mu_l

n_L_expr = 3*mu_l1_expr + 9*mu_l
print(f"\nn_L ~ 3*mu_l1 + 9*mu_l = {simplify(n_L_expr)}")

BmL_expr = simplify(n_B_expr - n_L_expr)
print(f"B - L ~ {BmL_expr}")

# Hmm wait - I need to be more careful about what n_L includes.
# If we define L_i to include nu_R,i:
# L_1 = (nu_L,1 + e_L,1 doublet contributions) + e_R,1 + nu_R,1
# In chemical potential language:
# n_{L_1} = 2*mu_l1 + mu_e1 + mu_nu1
# where the factor 2 is for the doublet (2 Weyl DOFs in L_1 doublet)

# Actually, let me count DOFs properly:
# L_1 doublet: 2 Weyl fermions (nu_L,1 and e_L,1), both with chemical potential mu_l1
# e_R,1: 1 Weyl fermion, chemical potential mu_e1
# nu_R,1: 1 Weyl fermion, chemical potential mu_nu1
# Total L_1 number: 2*mu_l1 + mu_e1 + mu_nu1

# For baryon number:
# Q_L,i doublet: 2 Weyl * 3 color = 6, each with B=1/3, chem pot mu_q
# u_R,i: 3 Weyl, B=1/3, chem pot mu_u
# d_R,i: 3 Weyl, B=1/3, chem pot mu_d
# B per gen: (1/3)*(6*mu_q + 3*mu_u + 3*mu_d) = (1/3)*(6*mu_q + 3*(mu_q-h) + 3*(mu_q+h))
#          = (1/3)*12*mu_q = 4*mu_q
# Total B = 3 * 4 * mu_q = 12*mu_q  -- correct

# n_{L_1} = 2*mu_l1_expr + (mu_l1_expr + h) + (mu_l - h) = 3*mu_l1_expr + mu_l
n_L1 = 3*mu_l1_expr + mu_l
n_L2 = 4*mu_l  # 2*mu_l + (mu_l + h) + (mu_l - h) = 4*mu_l
n_L3 = 4*mu_l
n_L_total = simplify(n_L1 + n_L2 + n_L3)

print(f"\nDetailed lepton numbers:")
print(f"  n_L1 = 3*mu_l1 + mu_l = {simplify(n_L1)}")
print(f"  n_L2 = 4*mu_l = {4*mu_l}")
print(f"  n_L3 = 4*mu_l")
print(f"  n_L = {n_L_total}")

BmL = simplify(n_B_expr - n_L_total)
print(f"\nB - L = {BmL}")

# The second conserved quantity: Q_2.
# It should be a linear combination of mu_l and h that is independent of B-L.
#
# One natural choice: Delta_L = L_1 - L_2
# (But we showed this might not be conserved due to SO(11) mixing nu_R)
# Actually, let me reconsider: the SO(11) interaction changes nu_R,1 number
# and nu_R,2 number, so it DOES change L_1 - L_2 (if nu_R is part of L).
#
# But the combination of SO(11) (which equilibrates mu_nu) and Yukawa
# (which connects mu_nu to mu_l for gen 2,3) means that the system
# automatically adjusts. The "free" parameter h is related to the Higgs
# charge, which represents a conserved quantity.
#
# Actually, I think what's happening is simpler: at T above EWSB,
# weak hypercharge is a GAUGE symmetry, which means the total hypercharge
# is exactly zero and cannot serve as a free parameter. The hypercharge
# constraint IS one of our equations. So we should have 1 free parameter.
#
# Let me recount: 4 unknowns (mu_q, mu_l1, mu_l, h), 2 equations.
# 2 free parameters. But we need initial conditions for both.
#
# Hmm, but for baryogenesis: typically the ONLY primordial asymmetry is
# in B-L (generated by e.g. leptogenesis or GUT baryogenesis). All other
# charges start at zero. Then sphalerons + Yukawas redistribute.
#
# If we parameterize B-L = c and the second charge Q_2 = 0:
# B - L = f(mu_l, h) = c
# Q_2 = g(mu_l, h) = 0
# Solving: mu_l and h determined, then everything determined.
#
# What is Q_2? Let me find it from the null space.
# From our 2 equations:
# 9*mu_q + mu_l1 + 2*mu_l = 0  ... (S)
# 6*mu_q - 2*mu_l1 - 4*mu_l - 10*h = 0  ... (Y)
#
# The general solution space is spanned by mu_l and h (free parameters).
# B - L and Q_2 are two independent linear combinations of mu_l and h.
#
# Let me compute B-L and find Q_2.

BmL_simplified = simplify(BmL)
print(f"\nB - L expressed in (mu_l, h): {BmL_simplified}")

# Let me also look at Higgs number:
# n_H = 2 * 2 * mu_H  (2 complex DOFs, boson factor 2)...
# Actually for Higgs: each complex component gives T^2/3 * mu_H.
# Higgs doublet: 2 complex components -> n_H = 2 * (T^2/3) * mu_H = (2/3)*T^2*mu_H
# In units of T^2/6: n_H = 4 * mu_H = 4*h
# No wait. Let me be consistent. If we're measuring everything in units of T^2/6:
# Weyl fermion: (T^2/6)*mu -> coefficient 1 per Weyl DOF
# Complex scalar: (T^2/3)*mu -> coefficient 2 per complex DOF
# Higgs doublet: 2 complex DOFs -> 4*h
n_H = 4*h
print(f"n_H (Higgs number) = {n_H}")

# What about weak isospin? It's gauged, so the constraint is
# sum Y_3 * n = 0 (but we already used hypercharge).
# Actually, SU(2)_L is non-abelian, so there's no separate chemical potential
# constraint from it. Only U(1)_Y gives a constraint.

# Let me try a different approach: find the second conserved charge by
# checking which linear combinations of mu_l and h are annihilated by
# all fast interactions.

# The two independent quantities are mu_l and h.
# B-L is some linear combination a*mu_l + b*h.
# The second conserved charge Q_2 is the other independent combination.

# From the expression for B-L:
print(f"\nExtracting coefficients of mu_l and h in B-L:")
BmL_poly = BmL_simplified.as_coefficients_dict()
print(f"  B-L = {BmL_poly}")

coeff_mul_in_BmL = BmL_simplified.coeff(mu_l)
coeff_h_in_BmL = BmL_simplified.coeff(h)
print(f"  Coefficient of mu_l: {coeff_mul_in_BmL}")
print(f"  Coefficient of h: {coeff_h_in_BmL}")

# The second conserved charge is orthogonal to B-L.
# A natural choice: Q_2 = h * coeff_mul_in_BmL * mu_l - mu_l * coeff_h_in_BmL * h
# ... that doesn't quite work. Let me just pick:
# If B-L = a*mu_l + b*h, then Q_2 = -b*mu_l + a*h (orthogonal).
# Q_2 = -coeff_h_in_BmL * mu_l + coeff_mul_in_BmL * h

# Actually, the second conserved charge has a PHYSICAL meaning.
# Let me think about what it is.
#
# I think the second conserved charge is related to the Higgs asymmetry.
# At T > T_EW, the Higgs can carry a chemical potential. In standard
# treatments with all Yukawas, mu_H is determined. With y_{nu,1} = 0,
# there's an additional freedom: mu_H is partially undetermined.
#
# Standard SM (no nu_R, n_gen = 3):
# 5 independent chem pots (mu_q, mu_u, mu_d, mu_l, mu_e),
# or 3 after using Yukawa (mu_q, mu_l, mu_H), and then sphaleron + hypercharge
# gives 2 equations for 3 unknowns -> 1 free parameter (B-L). Standard result.
#
# SM + 3 nu_R with all Yukawas:
# Add 3 mu_nu, but 3 Yukawa constraints -> still 1 free parameter (B-L).
#
# SM + 3 nu_R with y_{nu,1} = 0:
# Add 3 mu_nu, 2 Yukawa constraints + SO(11) (2 constraints = mu_nu equality) ->
# Wait let me count differently.
# After quark flavor eq: mu_q, mu_u = mu_q - h, mu_d = mu_q + h
# After charged lepton Yukawa: mu_e_i = mu_l_i + h
# After SO(11): mu_nu_1 = mu_nu_2 = mu_nu_3 := N
# After nu Yukawa (gen 2,3): N = mu_l_2 - h = mu_l_3 - h => mu_l_2 = mu_l_3 := mu_l = N + h
#
# Independent variables: mu_q, mu_l_1, mu_l (= mu_l_2 = mu_l_3), h, and
#   N is determined: N = mu_l - h
# So: mu_q, mu_l_1, mu_l, h -> 4 variables
# Constraints: sphaleron (1), hypercharge (1) -> 2 equations
# Free parameters: 2
#
# With all 3 nu Yukawas instead:
# mu_nu_i = mu_l_i - h for all i, plus SO(11): mu_nu_1 = mu_nu_2 = mu_nu_3
# => mu_l_1 = mu_l_2 = mu_l_3 (all equal!)
# Then: mu_q, mu_l, h -> 3 variables, 2 equations -> 1 free parameter. Good.
#
# So the EXTRA conserved charge (compared to having all Yukawas) comes from
# mu_l_1 being independent of mu_l_2 = mu_l_3.
#
# The second conserved charge is: Delta_1 = L_1 - (L_2 + L_3)/2
# or equivalently just (mu_l_1 - mu_l), which encodes the asymmetry
# between 1st generation leptons and 2nd/3rd generation.
#
# For STANDARD BARYOGENESIS/LEPTOGENESIS:
# - In leptogenesis: B-L asymmetry is generated, typically democratically
#   across generations. So initially B-L != 0 but Delta_1 = 0.
# - More precisely: in thermal leptogenesis, the asymmetry is produced
#   in specific lepton flavors depending on the heavy neutrino decay.
#   But for generic initial conditions, Delta_1 = 0 is the natural choice.
#
# If we assume Delta_1 = 0 initially (generation-democratic baryogenesis),
# and it's conserved, then Delta_1 = 0 at all times.
# This means: mu_l_1 = mu_l, so ALL lepton doublets have the same chemical potential!
# Then we're back to the standard result with 1 free parameter.
#
# BUT: if mu_l_1 = mu_l, then:
# From the solution: mu_l_1_expr = mu_l (setting them equal)
# This gives an additional equation to determine h in terms of mu_l.

print("\n" + "=" * 70)
print("STEP 6: Generation-democratic initial conditions (Delta_1 = 0)")
print("=" * 70)

# If baryogenesis is generation-democratic: mu_l1 = mu_l
# From our solution: mu_l1 = mu_l1_expr (function of mu_l, h)
# Set mu_l1_expr = mu_l:
eq_democratic = Eq(mu_l1_expr, mu_l)
print(f"Generation-democratic condition: {mu_l1_expr} = mu_l")
h_sol = solve(eq_democratic, h)
print(f"Solving for h: mu_H = {h_sol}")

if h_sol:
    h_val = h_sol[0]
    print(f"\nmu_H = {h_val}")

    # Now everything is in terms of mu_l alone:
    mu_q_final = simplify(mu_q_expr.subs(h, h_val))
    mu_l1_final = simplify(mu_l1_expr.subs(h, h_val))
    mu_nu_final = simplify((mu_l - h_val))

    print(f"mu_q = {mu_q_final}")
    print(f"mu_l1 = {mu_l1_final}")
    print(f"mu_l2 = mu_l3 = mu_l")
    print(f"mu_H = {h_val}")
    print(f"mu_nu (all 3) = mu_l - mu_H = {simplify(mu_nu_final)}")
    print(f"mu_u = mu_q - mu_H = {simplify(mu_q_final - h_val)}")
    print(f"mu_d = mu_q + mu_H = {simplify(mu_q_final + h_val)}")
    print(f"mu_e = mu_l + mu_H = {simplify(mu_l + h_val)}")

    # Baryon number:
    n_B_final = simplify(12 * mu_q_final)
    print(f"\nn_B = 12 * mu_q = {n_B_final}")

    # DM number (= nu_R,1 number):
    n_DM_final = simplify(mu_nu_final)
    print(f"n_DM = mu_nu1 = {n_DM_final}")

    # Ratio:
    ratio_final = simplify(n_DM_final / n_B_final)
    print(f"\n*** n_DM / n_B = {ratio_final} ***")
    print(f"    = {float(ratio_final):.6f}")

    # What is this as a fraction?
    from fractions import Fraction
    ratio_frac = Fraction(float(ratio_final)).limit_denominator(1000)
    print(f"    ~ {ratio_frac}")

    # Check: is it 1? 48/49? Something else?
    print(f"\n    Compared to 1: {float(ratio_final)/1:.6f}")
    print(f"    Compared to 48/49: {float(ratio_final)/(48/49):.6f}")

# =====================================================================
# STEP 7: Non-democratic initial conditions
# =====================================================================
print("\n" + "=" * 70)
print("STEP 7: General case (non-democratic)")
print("=" * 70)

# For completeness, let's also solve with mu_l1 != mu_l.
# Parameterize by B-L = c and Delta_1 = delta
# B-L = n_B - n_L (function of mu_l and h) = c
# Delta_1 = n_L1 - (n_L2 + n_L3)/2 (function of mu_l and h) = delta

# We already computed:
# n_L1 = 3*mu_l1_expr + mu_l
# n_L2 = 4*mu_l
# n_L3 = 4*mu_l

Delta_1 = simplify(n_L1 - (n_L2 + n_L3)/2)
print(f"Delta_1 = L_1 - (L_2+L_3)/2 = {Delta_1}")

print(f"\nWith Delta_1 = 0:")
# We already solved this above

print(f"\nWith Delta_1 = delta (general):")
# B-L = BmL_simplified  (function of mu_l, h)
# Delta_1 = Delta_1  (function of mu_l, h)
# Solve for mu_l, h in terms of c (=B-L) and delta (=Delta_1)
c, delta = symbols('c delta')
system_general = [Eq(BmL_simplified, c), Eq(Delta_1, delta)]
sol_general = solve(system_general, [mu_l, h])
if sol_general:
    print("mu_l and h in terms of B-L and Delta_1:")
    for var, expr in sol_general.items():
        print(f"  {var} = {simplify(expr)}")

    mu_l_gen = sol_general[mu_l]
    h_gen = sol_general[h]

    n_B_gen = simplify(12 * mu_q_expr.subs([(mu_l, mu_l_gen), (h, h_gen)]))
    n_DM_gen = simplify((mu_l_gen - h_gen))

    print(f"\nn_B = {simplify(n_B_gen)}")
    print(f"n_DM = {simplify(n_DM_gen)}")

    ratio_gen = simplify(n_DM_gen / n_B_gen)
    print(f"\nn_DM / n_B = {ratio_gen}")

    # Evaluate at delta = 0:
    ratio_at_0 = simplify(ratio_gen.subs(delta, 0))
    print(f"\nAt Delta_1 = 0: n_DM/n_B = {ratio_at_0}")

# =====================================================================
# STEP 8: Omega ratio implications
# =====================================================================
print("\n" + "=" * 70)
print("STEP 8: Omega ratio implications")
print("=" * 70)

if h_sol:
    # Omega_c / Omega_b = (n_DM * m_DM) / (n_B * m_p)
    # = (n_DM/n_B) * (m_DM/m_p)
    # With m_DM/m_p from framework: two options
    # Option A: m_DM/m_p = 49/9 (from Omega ratio directly) -> circular
    # Option B: m_DM = m_e * (n_c-1)^n_d = m_e * 10^4 = 5110 MeV
    #           m_DM/m_p = 5110/938.272 = 5.4459...

    from sympy import N as Neval

    m_e_MeV = Rational(511, 1000)  # 0.511 MeV (approximate for this calculation)
    m_p_MeV = Rational(938272088, 10**6)  # exact CODATA
    m_DM_canonical = m_e_MeV * 10**4  # det(M) formula

    mass_ratio = m_DM_canonical / m_p_MeV
    print(f"m_DM (canonical) = m_e * 10^4 = {float(m_DM_canonical):.1f} MeV")
    print(f"m_DM / m_p = {float(mass_ratio):.6f}")

    r = float(ratio_final)
    Omega_ratio = r * float(mass_ratio)
    print(f"\nOmega_c/Omega_b = (n_DM/n_B) * (m_DM/m_p)")
    print(f"  = {r:.6f} * {float(mass_ratio):.6f}")
    print(f"  = {Omega_ratio:.4f}")

    # Planck measurement:
    Omega_c_Planck = 0.2607  # Planck 2018 TT,TE,EE+lowE+lensing
    Omega_b_Planck = 0.04897
    Omega_ratio_Planck = Omega_c_Planck / Omega_b_Planck
    print(f"\nPlanck measured: Omega_c/Omega_b = {Omega_ratio_Planck:.4f}")
    print(f"Predicted: {Omega_ratio:.4f}")
    print(f"Deviation: {abs(Omega_ratio - Omega_ratio_Planck)/Omega_ratio_Planck * 100:.2f}%")

    print(f"\nFor comparison:")
    print(f"  49/9 = {49/9:.6f} (n_DM = n_B)")
    print(f"  48/9 = {48/9:.6f}")
    print(f"  Planck = {Omega_ratio_Planck:.6f}")

    # Check: does n_DM/n_B = 1?
    print(f"\n*** KEY RESULT ***")
    print(f"n_DM / n_B = {ratio_final} = {float(ratio_final):.8f}")
    if abs(float(ratio_final) - 1.0) < 0.001:
        print("  -> n_DM = n_B (EXACT or nearly so)")
        print("  -> Omega_c/Omega_b = m_DM/m_p (the simple asymmetric DM prediction)")
    elif abs(float(ratio_final) - 48/49) < 0.001:
        print("  -> n_DM/n_B = 48/49")
    else:
        print(f"  -> n_DM/n_B = {ratio_final} (neither 1 nor 48/49)")

# =====================================================================
# VERIFICATION TESTS
# =====================================================================
print("\n" + "=" * 70)
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

# Test 1: Sphaleron constraint satisfied
if solution:
    sol = solution[0]
    sph_check = sum(3*sol.get(mq, mq) + sol.get(ml, ml)
                    for mq, ml in [(mu_q1, mu_l1), (mu_q2, mu_l2), (mu_q3, mu_l3)])
    test("Sphaleron constraint", simplify(sph_check) == 0, f"sum = {simplify(sph_check)}")

# Test 2: Up Yukawa satisfied
for i, (mq, mu_up) in enumerate([(mu_q1, mu_u1), (mu_q2, mu_u2), (mu_q3, mu_u3)]):
    check = simplify(sol.get(mq, mq) - sol.get(mu_up, mu_up) - sol.get(mu_H, mu_H))
    test(f"Up Yukawa gen {i+1}", check == 0, f"residual = {check}")

# Test 3: Down Yukawa satisfied
for i, (mq, md) in enumerate([(mu_q1, mu_d1), (mu_q2, mu_d2), (mu_q3, mu_d3)]):
    check = simplify(sol.get(mq, mq) + sol.get(mu_H, mu_H) - sol.get(md, md))
    test(f"Down Yukawa gen {i+1}", check == 0, f"residual = {check}")

# Test 4: Charged lepton Yukawa satisfied
for i, (ml, me) in enumerate([(mu_l1, mu_e1), (mu_l2, mu_e2), (mu_l3, mu_e3)]):
    check = simplify(sol.get(ml, ml) + sol.get(mu_H, mu_H) - sol.get(me, me))
    test(f"Lepton Yukawa gen {i+1}", check == 0, f"residual = {check}")

# Test 5: Nu Yukawa gen 2,3 satisfied
for i, (ml, mn) in enumerate([(mu_l2, mu_nu2), (mu_l3, mu_nu3)], start=2):
    check = simplify(sol.get(ml, ml) - sol.get(mu_H, mu_H) - sol.get(mn, mn))
    test(f"Nu Yukawa gen {i}", check == 0, f"residual = {check}")

# Test 6: Hypercharge neutrality
hyp_check = Rational(0)
for mq, mu_up, md, ml, me in [
    (mu_q1, mu_u1, mu_d1, mu_l1, mu_e1),
    (mu_q2, mu_u2, mu_d2, mu_l2, mu_e2),
    (mu_q3, mu_u3, mu_d3, mu_l3, mu_e3)]:
    hyp_check += sol.get(mq, mq) + 2*sol.get(mu_up, mu_up) - sol.get(md, md) - sol.get(ml, ml) - sol.get(me, me)
hyp_check += 2*sol.get(mu_H, mu_H)
test("Hypercharge neutrality", simplify(hyp_check) == 0, f"residual = {simplify(hyp_check)}")

# Test 7: SO(11) composite
test("SO(11): mu_nu1 = mu_nu2",
     simplify(sol.get(mu_nu1, mu_nu1) - sol.get(mu_nu2, mu_nu2)) == 0)
test("SO(11): mu_nu1 = mu_nu3",
     simplify(sol.get(mu_nu1, mu_nu1) - sol.get(mu_nu3, mu_nu3)) == 0)

# Test 8: Democratic condition gives mu_l1 = mu_l
if h_sol:
    mu_l1_at_democratic = simplify(mu_l1_expr.subs(h, h_val))
    test("Democratic: mu_l1 = mu_l", simplify(mu_l1_at_democratic - mu_l) == 0,
         f"mu_l1 = {mu_l1_at_democratic}")

# Test 9: n_DM/n_B is a clean rational
if h_sol:
    test("n_DM/n_B is rational", ratio_final.is_Rational, f"value = {ratio_final}")
    test("n_DM/n_B > 0", float(ratio_final) > 0, f"value = {float(ratio_final)}")

# Test 10: QCD instanton auto-satisfied
# 2*mu_q - mu_u - mu_d = 2*mu_q - (mu_q - h) - (mu_q + h) = 0
qcd_check = simplify(2*mu_q_expr - (mu_q_expr - h) - (mu_q_expr + h))
test("QCD instanton auto-satisfied", qcd_check == 0, f"residual = {qcd_check}")

print(f"\n{'=' * 70}")
print(f"RESULTS: {pass_count}/{test_count} PASS")
print(f"{'=' * 70}")
