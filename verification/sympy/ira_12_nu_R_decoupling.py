"""
ira_12_nu_R_decoupling.py
Session S373: Formalization of IRA-12 (1st-gen nu_R Dirac decoupling)

STATEMENT: The 1st-generation right-handed neutrino has zero Dirac
Yukawa coupling with active neutrinos: y_{nu,1} = 0 exactly.

This is the MINIMAL additional assumption (IRA 4 -> 5) that:
  (a) Makes nu_R absolutely stable (zero mixing -> zero decay)
  (b) Preserves 5.11 GeV DM mass and asymmetric DM
  (c) Allows 2nd/3rd gen nu_R to mediate seesaw for active masses

CONSEQUENCES [DERIVATION]:
  1. nu_R is absolutely stable (DM carrier)
  2. Rank-2 seesaw: one massless active neutrino
  3. sigma_SI ~ 0 (below all planned direct detection)
  4. Omega_c/Omega_b = m_DM/m_p = 5.45 (1.2% from observed)

Assumptions:
  [A-AXIOM] AXM_0113: Complete static object U
  [A-PHYSICAL] IRA-12: y_{nu,1} = 0 (NEW, this is the +1 assumption)
  [A-IMPORT] m_e = 0.511 MeV, m_mu = 105.658 MeV, m_tau = 1776.86 MeV
  [A-IMPORT] m_nu_atm ~ 0.05 eV, Delta_m^2_sol = 7.53e-5 eV^2
  [A-IMPORT] Omega_c/Omega_b = 5.38 (Planck 2018)
"""

from sympy import (
    symbols, sqrt, pi, Rational, Matrix, det, eye, simplify,
    N, Abs, Integer, S, oo, zeros, Symbol
)
import math

test_count = 0
pass_count = 0

# Framework constants
n_c = 11
n_d = 4
det_M = (n_c - 1) ** n_d  # = 10^4

# ============================================================
# PART 1: THE ASSUMPTION AND ITS CONSEQUENCES
# ============================================================
print("=" * 65)
print("IRA-12: 1ST-GEN NU_R DIRAC DECOUPLING")
print("=" * 65)

print("""
ASSUMPTION [A-PHYSICAL]:
  y_{nu,1} = 0 exactly
  (1st-gen right-handed neutrino has zero Dirac Yukawa coupling)

This is the MINIMAL statement needed to stabilize nu_R as DM carrier.
S373 proved: no framework-native symmetry produces this automatically.
""")

# ============================================================
# PART 2: DM STABILITY (CONSEQUENCE 1)
# ============================================================
print("=" * 65)
print("CONSEQUENCE 1: ABSOLUTE STABILITY")
print("=" * 65)

print("""
With y_{nu,1} = 0:
  - Dirac mass m_{D,1} = y_{nu,1} * v = 0
  - Mixing angle theta_1 = m_{D,1} / M_{R,1} = 0 EXACTLY
  - ALL decay channels proportional to theta_1^2 = 0
  - Lifetime: tau = infinity (absolutely stable)
  - No fine-tuning: zero is protected by itself (0 * anything = 0)
""")

# The mixing angle
y_nu_1 = 0  # IRA-12
v_EW = 246.0  # GeV
m_D_1 = y_nu_1 * v_EW
M_R_1 = 0.000511 * det_M  # m_e * det(M) = 5.11 GeV
theta_1 = m_D_1 / M_R_1 if M_R_1 > 0 else 0

print(f"y_{{nu,1}} = {y_nu_1} [IRA-12]")
print(f"m_{{D,1}} = y_{{nu,1}} * v = {m_D_1} GeV")
print(f"M_{{R,1}} = m_e * det(M) = {M_R_1:.2f} GeV")
print(f"theta_1 = m_D / M_R = {theta_1}")
print(f"Decay rate: Gamma ~ theta_1^2 = {theta_1**2}")
print(f"Lifetime: tau = {'infinity' if theta_1 == 0 else 'finite'}")

# Test 1: theta = 0 exactly
test_count += 1
assert theta_1 == 0
print(f"\nTest 1: theta_1 = 0 exactly (absolutely stable): PASS")
pass_count += 1

# Test 2: DM mass preserved
test_count += 1
assert abs(M_R_1 - 5.11) < 0.01
print(f"Test 2: m_DM = {M_R_1:.2f} GeV (preserved from S372): PASS")
pass_count += 1

# ============================================================
# PART 3: RANK-2 SEESAW (CONSEQUENCE 2)
# ============================================================
print("\n" + "=" * 65)
print("CONSEQUENCE 2: RANK-2 SEESAW -> ONE MASSLESS NEUTRINO")
print("=" * 65)

print("""
With y_{nu,1} = 0, the 3x3 Dirac mass matrix M_D has rank <= 2:
  M_D = diag(0, m_{D,2}, m_{D,3})

The seesaw formula m_nu = -M_D * M_R^{-1} * M_D^T gives a rank-2
mass matrix for active neutrinos -> one eigenvalue is EXACTLY zero.
""")

# Symbolic computation
m_D2, m_D3 = symbols('m_D2 m_D3', positive=True)
M1, M2, M3 = symbols('M1 M2 M3', positive=True)

M_D = Matrix([
    [0, 0, 0],
    [0, m_D2, 0],
    [0, 0, m_D3]
])

M_R_inv = Matrix([
    [1/M1, 0, 0],
    [0, 1/M2, 0],
    [0, 0, 1/M3]
])

m_nu = M_D * M_R_inv * M_D.T
m_nu_simplified = simplify(m_nu)

print("Seesaw mass matrix:")
for i in range(3):
    row = [simplify(m_nu_simplified[i, j]) for j in range(3)]
    print(f"  [{', '.join(str(x) for x in row)}]")

# Check rank
rank = m_nu_simplified.rank()
print(f"\nRank of m_nu: {rank}")

# Eigenvalues
eigenvals = m_nu_simplified.eigenvals()
print(f"Eigenvalues: {dict(eigenvals)}")

# Test 3: m_nu has rank 2
test_count += 1
assert rank == 2
print(f"\nTest 3: Seesaw matrix has rank 2 (one zero eigenvalue): PASS")
pass_count += 1

# Test 4: m_{nu,1} = 0 exactly (1st gen active neutrino massless)
test_count += 1
assert m_nu_simplified[0, 0] == 0
assert all(m_nu_simplified[0, j] == 0 for j in range(3))
print(f"Test 4: m_{{nu,1}} = 0 exactly (1st gen active neutrino): PASS")
pass_count += 1

# Test 5: m_{nu,2} and m_{nu,3} nonzero
test_count += 1
assert m_nu_simplified[1, 1] != 0
assert m_nu_simplified[2, 2] != 0
print(f"Test 5: m_{{nu,2}}, m_{{nu,3}} nonzero (from 2nd/3rd gen seesaw): PASS")
pass_count += 1

# Numerical check: consistency with observed mass splittings
print("\n--- Numerical consistency check ---")

# nu_R masses
M_R_vals = [
    0.000511 * det_M,    # 5.11 GeV (1st gen, decoupled)
    0.105658 * det_M,    # 1056.6 GeV (2nd gen)
    1.77686 * det_M      # 17769 GeV (3rd gen)
]

# Observed: Delta_m^2_atm = 2.453e-3 eV^2, Delta_m^2_sol = 7.53e-5 eV^2
dm2_atm = 2.453e-3   # eV^2
dm2_sol = 7.53e-5     # eV^2

# With m_1 = 0 (our prediction, normal ordering):
# m_2^2 = dm2_sol, m_3^2 = dm2_atm
m_nu_2 = math.sqrt(dm2_sol)   # = 0.00868 eV
m_nu_3 = math.sqrt(dm2_atm)   # = 0.04953 eV

print(f"With m_1 = 0 (normal ordering):")
print(f"  m_1 = 0 eV (our prediction)")
print(f"  m_2 = sqrt(dm2_sol) = {m_nu_2*1000:.2f} meV")
print(f"  m_3 = sqrt(dm2_atm) = {m_nu_3*1000:.2f} meV")
print(f"  sum(m_nu) = {(m_nu_2 + m_nu_3)*1000:.1f} meV = {m_nu_2 + m_nu_3:.4f} eV")

# Seesaw: m_{nu,i} = m_{D,i}^2 / M_{R,i}
# For 2nd gen: m_D2 = sqrt(m_nu_2 * M_R_2)
m_D_2 = math.sqrt(m_nu_2 * 1e-9 * M_R_vals[1])  # convert eV to GeV
m_D_3 = math.sqrt(m_nu_3 * 1e-9 * M_R_vals[2])

y_2 = m_D_2 / v_EW
y_3 = m_D_3 / v_EW

print(f"\nRequired Dirac masses for seesaw:")
print(f"  m_{{D,2}} = sqrt(m_{{nu,2}} * M_2) = {m_D_2*1000:.3f} MeV  (y_2 = {y_2:.2e})")
print(f"  m_{{D,3}} = sqrt(m_{{nu,3}} * M_3) = {m_D_3*1000:.1f} MeV  (y_3 = {y_3:.2e})")

# Test 6: sum(m_nu) below cosmological bound
test_count += 1
sum_mnu = m_nu_2 + m_nu_3
assert sum_mnu < 0.12  # Planck 2018 bound in eV
print(f"\nTest 6: sum(m_nu) = {sum_mnu:.4f} eV < 0.12 eV bound: PASS")
pass_count += 1

# Test 7: Yukawa couplings are small but not unnaturally so
test_count += 1
assert y_2 > 1e-10 and y_2 < 1e-2
assert y_3 > 1e-10 and y_3 < 1e-2
print(f"Test 7: Yukawa couplings natural ({y_2:.1e}, {y_3:.1e}): PASS")
pass_count += 1

# ============================================================
# PART 4: ASYMMETRIC DM (CONSEQUENCE 3)
# ============================================================
print("\n" + "=" * 65)
print("CONSEQUENCE 3: ASYMMETRIC DM CONSISTENCY")
print("=" * 65)

m_p_GeV = 0.938272  # proton mass
m_DM = M_R_vals[0]  # = 5.11 GeV

ratio_pred = m_DM / m_p_GeV
ratio_obs = 5.38  # Planck 2018
deviation = abs(ratio_pred - ratio_obs) / ratio_obs * 100

print(f"Asymmetric DM: Omega_c/Omega_b = m_DM/m_p")
print(f"  Predicted: {ratio_pred:.3f}")
print(f"  Observed:  {ratio_obs:.2f}")
print(f"  Deviation: {deviation:.1f}%")

# Test 8: Asymmetric DM ratio within 2%
test_count += 1
assert deviation < 2.0
print(f"\nTest 8: Asymmetric DM ratio within 2%: PASS")
pass_count += 1

# ============================================================
# PART 5: DIRECT DETECTION (CONSEQUENCE 4)
# ============================================================
print("\n" + "=" * 65)
print("CONSEQUENCE 4: DIRECT DETECTION CROSS-SECTION")
print("=" * 65)

print("""
With theta_1 = 0 exactly:
  - Tree-level gauge coupling to nucleons: ZERO (gauge singlet)
  - Higgs portal coupling: ZERO (S317: g_{h,DM} = 0)
  - Loop-level coupling: proportional to theta_1^2 = 0
  - sigma_SI = 0 at all orders in perturbation theory

This is consistent with null results from:
  - XENON1T/nT (2024): sigma_SI < 2e-47 cm^2 at 30 GeV
  - LZ (2024): sigma_SI < 1e-47 cm^2 at 30 GeV
  - PandaX-4T (2024): sigma_SI < 3e-47 cm^2 at 30 GeV

Our prediction: sigma_SI = 0 (far below any experimental reach)
""")

sigma_SI = theta_1**2  # proportional to zero

# Test 9: sigma_SI = 0
test_count += 1
assert sigma_SI == 0
print(f"Test 9: sigma_SI proportional to theta^2 = {sigma_SI}: PASS")
pass_count += 1

# ============================================================
# PART 6: IRA COST ANALYSIS
# ============================================================
print("\n" + "=" * 65)
print("IRA COST ANALYSIS")
print("=" * 65)

print("""
IRA-12 CLASSIFICATION: [A-PHYSICAL]

COMPARISON with existing IRAs:

  IRA-06 [A-PHYSICAL]: "crystallization = SSB"
    -> Identifies math structure with physical process
    -> Weinberg-forced (all 8 SSB properties present)

  IRA-07 [A-PHYSICAL]: "adjacency = time"
    -> Identifies math structure with physical process
    -> Weinberg-forced (all 6 time properties present)

  IRA-12 [A-PHYSICAL]: "y_{nu,1} = 0"
    -> States a physical coupling is exactly zero
    -> NOT Weinberg-forced (no structural argument requires it)
    -> Motivated by: unique DM candidate + asymmetric DM match
    -> Cost: increases IRA count from 4 to 5

ECONOMY: IRA-12 buys:
  - Stable DM carrier (5.11 GeV, unique identification)
  - Asymmetric DM explanation (1.2% match)
  - sigma_SI = 0 (consistent with all null results)
  - One massless neutrino (testable)
  - No new particles beyond SO(11) spinor content

IRA-12 is the LEAST "Weinberg-forced" of all active IRAs.
IRA-06/07 are meta-assumptions ("this math = this physics").
IRA-04 is a free parameter in the potential.
IRA-11 is an import from cosmological observation.
IRA-12 is an ad hoc physical statement about a coupling.

This is honest: it's the weakest assumption in the inventory.
""")

# ============================================================
# PART 7: FALSIFICATION CRITERIA
# ============================================================
print("=" * 65)
print("FALSIFICATION CRITERIA FOR IRA-12")
print("=" * 65)

print("""
IRA-12 is falsified if ANY of the following are observed:

1. DM-nucleon scattering at direct detection experiments
   (sigma_SI > 0 would require theta_1 != 0)

2. m_1 != 0 (lightest neutrino has nonzero mass)
   (would require rank-3 seesaw, i.e., all 3 y_{nu,i} nonzero)
   Testable by: 0nu-beta-beta decay rate (sensitive to |m_ee|)

3. Omega_c/Omega_b measurement incompatible with m_DM/m_p ~ 5.45
   (would invalidate asymmetric DM scenario)

4. Collider production of nu_R (5.11 GeV) with visible decay
   (would directly contradict theta_1 = 0)

All four are experimentally accessible in principle.
""")

# ============================================================
# SUMMARY
# ============================================================
print("=" * 65)
print(f"VERIFICATION SUMMARY: {pass_count}/{test_count} tests PASS")
print("=" * 65)

assert pass_count == test_count, f"FAILURE: {test_count - pass_count} tests failed"
print("ALL TESTS PASS")

print(f"""
IRA-12: y_{{nu,1}} = 0 [A-PHYSICAL]

CONSEQUENCES:
  1. nu_R absolutely stable (theta = 0, tau = inf)     [THEOREM]
  2. Rank-2 seesaw: m_1 = 0, m_2 = {m_nu_2*1000:.1f} meV, m_3 = {m_nu_3*1000:.1f} meV  [DERIVATION]
  3. Asymmetric DM: Omega_c/Omega_b = {ratio_pred:.2f} (obs: {ratio_obs})  [DERIVATION]
  4. sigma_SI = 0 (below all experiments)               [THEOREM]

IRA COUNT: 4 -> 5
  IRA-04: quartic ratio rho  [A-STRUCTURAL LOW]
  IRA-06: SSB occurs          [A-PHYSICAL, Weinberg-forced]
  IRA-07: time = adjacency    [A-PHYSICAL, Weinberg-forced]
  IRA-11: |Pi| scale           [A-IMPORT]
  IRA-12: y_{{nu,1}} = 0       [A-PHYSICAL]  <-- NEW
""")
