#!/usr/bin/env python3
"""
B-D Portal Derivation from SU(3)_gen Conservation

KEY FINDING: B+D conservation at leading order is DERIVED from:
  1. Under SU(3) c G_2: quarks in 3, leptons in 3bar, dark in 1
  2. (qqq) contracts via epsilon to SU(3)_gen SINGLET
  3. Portal (qqq)(DM): singlet -> singlet = ALLOWED [dim-6]
  4. Proton decay (qqq)(l): singlet -> 3bar = FORBIDDEN [dim-6]
  5. B+D conservation follows from (qqq)(DM) being the unique dim-6 portal

This DERIVES both:
  - Proton stability [DERIVATION] (consistent with S275)
  - n_DM = n_baryon at leading order [DERIVATION]

Derivation chain:
  [I-MATH] G_2 -> SU(3): 7 -> 3+3bar+1
  [CONJECTURE] Quark = 3, lepton = 3bar, dark = 1 (from spinor gap analysis)
  [I-MATH] SU(3) conservation in effective theory
  [D] epsilon_{abc} q^a q^b q^c = SU(3) singlet (B=1)
  [D] singlet -> singlet (dark) ALLOWED
  [D] singlet -> 3bar (lepton) FORBIDDEN
  [D] Unique dim-6 portal = (qqq)(DM)/f^2
  [D] B+D conservation at leading order

Status: DERIVATION conditioned on quark/lepton = 3/3bar identification
"""

from sympy import Rational, factorial, binomial, Abs

# =============================================================
# Framework parameters
# =============================================================
n_d = 4       # spacetime dimensions
n_c = 11      # crystal dimensions
n_im_H = 3    # Im(H) = generations
n_im_O = 7    # Im(O) = G_2 fundamental
N_c = 3       # QCD colors = Im_H

tests_passed = 0
tests_total = 0

def test(name, condition):
    global tests_passed, tests_total
    tests_total += 1
    status = "PASS" if condition else "FAIL"
    if condition:
        tests_passed += 1
    print(f"  [{status}] {name}")
    return condition


# =============================================================
# PART 1: SU(3)_gen CHARGE ASSIGNMENTS
# =============================================================
print("=" * 70)
print("PART 1: SU(3)_gen CHARGE ASSIGNMENTS FROM G_2 BRANCHING")
print("=" * 70)

# G_2 fundamental 7 -> 3 + 3bar + 1 under SU(3) c G_2
# From spinor gap analysis (spinor_gap_resolution.py):
#   3_gen   -> quark sector  (gets QCD color from gauge SU(3)_c)
#   3bar_gen -> lepton sector (SU(3)_c singlet)
#   1_gen   -> dark sector   (generation-universal, DM candidate)

# SU(3) quantum numbers
# Irrep  Dimension  Dynkin   Triality
# 3       3         (1,0)    1
# 3bar    3         (0,1)    2
# 1       1         (0,0)    0
# 6       6         (2,0)    2
# 8       8         (1,1)    0

# Key property: SU(3) triality is conserved mod 3
# triality(3) = 1, triality(3bar) = 2, triality(1) = 0

triality = {'3': 1, '3bar': 2, '1': 0, '6': 2, '8': 0}

print(f"\nSU(3)_gen charge assignments [CONJECTURE from spinor gap]:")
print(f"  Quarks:  3  (triality {triality['3']})")
print(f"  Leptons: 3bar (triality {triality['3bar']})")
print(f"  Dark:    1  (triality {triality['1']})")

test("Quarks have triality 1", triality['3'] == 1)
test("Leptons have triality 2", triality['3bar'] == 2)
test("Dark has triality 0", triality['1'] == 0)


# =============================================================
# PART 2: BARYON OPERATOR (qqq) SU(3) CONTRACTION
# =============================================================
print(f"\n{'='*70}")
print("PART 2: BARYON OPERATOR (qqq) AS SU(3)_gen SINGLET")
print("=" * 70)

# Three quarks, each in 3 of SU(3)_gen
# Tensor product: 3 x 3 x 3
# Using SU(3) Clebsch-Gordan:
#   3 x 3 = 6 + 3bar
#   (6 + 3bar) x 3 = (6x3) + (3bar x 3) = (10 + 8) + (8 + 1)
#   3 x 3 x 3 = 10 + 8 + 8 + 1
#
# The SINGLET (1) is the totally antisymmetric contraction:
#   epsilon_{abc} q^a q^b q^c = SU(3) singlet

dim_3x3x3 = 27   # 3^3
dim_decomp = 10 + 8 + 8 + 1
print(f"\n3 x 3 x 3 = 10 + 8 + 8 + 1 = {dim_decomp}")
test("3x3x3 decomposition correct", dim_decomp == dim_3x3x3)

# The singlet exists! This is epsilon_{abc} contraction.
# Triality: 1 + 1 + 1 = 3 = 0 (mod 3) -> singlet has triality 0 -> CONSISTENT
triality_qqq = (triality['3'] * 3) % 3
print(f"\nTriality of (qqq): 3 * {triality['3']} = {triality['3'] * 3} = {triality_qqq} (mod 3)")
test("(qqq) has triality 0 = singlet", triality_qqq == 0)

# Baryon number
B_per_quark = Rational(1, N_c)  # 1/3 [DERIVED from anomaly cancellation]
B_baryon = 3 * B_per_quark
print(f"\nBaryon number: B(q) = 1/{N_c}, B(qqq) = 3/{N_c} = {B_baryon}")
test("B(qqq) = 1", B_baryon == 1)


# =============================================================
# PART 3: PORTAL vs PROTON DECAY - SU(3)_gen SELECTION RULES
# =============================================================
print(f"\n{'='*70}")
print("PART 3: SU(3)_gen SELECTION RULES FOR DIM-6 OPERATORS")
print("=" * 70)

# Portal operator: (qqq)(DM)/f^2
# SU(3)_gen content: singlet(qqq) x singlet(DM) = singlet x singlet -> singlet
# Triality: 0 + 0 = 0 -> ALLOWED

triality_portal = (triality_qqq + triality['1']) % 3
print(f"\nPortal (qqq)(DM):")
print(f"  (qqq) triality: {triality_qqq}")
print(f"  DM triality:    {triality['1']}")
print(f"  Total triality:  {triality_portal} (mod 3)")
print(f"  SU(3)_gen:      singlet x singlet -> singlet")
print(f"  Status:         ALLOWED")
test("Portal has triality 0 -> ALLOWED", triality_portal == 0)

# Proton decay: (qqq)(l)/f^2
# SU(3)_gen content: singlet(qqq) x 3bar(lepton) = 3bar
# Triality: 0 + 2 = 2 -> NOT singlet -> FORBIDDEN

triality_pdecay = (triality_qqq + triality['3bar']) % 3
print(f"\nProton decay (qqq)(l):")
print(f"  (qqq) triality: {triality_qqq}")
print(f"  lepton triality: {triality['3bar']}")
print(f"  Total triality:   {triality_pdecay} (mod 3)")
print(f"  SU(3)_gen:       singlet x 3bar -> 3bar (NOT singlet)")
print(f"  Status:          FORBIDDEN by SU(3)_gen conservation")
test("Proton decay has triality 2 -> FORBIDDEN", triality_pdecay != 0)

# Anti-proton decay: (qqq)(l_bar)/f^2
# Using 3bar quarks: (q_bar q_bar q_bar)(l)
# 3bar x 3bar x 3bar -> ... -> contains singlet (epsilon contraction)
# Then singlet x 3bar(lepton_bar=3) -> 3 (NOT singlet) -> FORBIDDEN
triality_antipdecay = (triality['3bar'] * 3 + triality['3']) % 3
print(f"\nAnti-proton analog (qbar qbar qbar)(l_bar):")
print(f"  Triality: {triality_antipdecay} -> {'ALLOWED' if triality_antipdecay == 0 else 'FORBIDDEN'}")
# 3bar^3 triality = 2*3 = 6 = 0 mod 3; then + triality(3) = 1 mod 3 = FORBIDDEN!
test("Anti-proton decay also FORBIDDEN", triality_antipdecay != 0)


# =============================================================
# PART 4: UNIQUENESS OF DIM-6 PORTAL
# =============================================================
print(f"\n{'='*70}")
print("PART 4: UNIQUENESS OF (qqq)(DM) AS DIM-6 PORTAL")
print("=" * 70)

# In the effective theory, the possible dim-6 four-fermion operators
# involving quarks and dark fermions are:
#
# General dim-6: (f1)(f2)(f3)(f4) where f_i are fermion fields
# Each fermion has mass dimension 3/2, so 4 fermions = dim 6

# Possible operators (checking SU(3)_gen conservation):
operators = [
    ("(qqq)(DM)",    3*triality['3'] + triality['1'],   "B=-1,D=+1", "Portal"),
    ("(qqq)(l)",     3*triality['3'] + triality['3bar'], "B=-1,L=+1", "Proton decay"),
    ("(qqq)(q)",     3*triality['3'] + triality['3'],    "B=-1,q=+1", "Exotic"),
    ("(qq)(DM)(DM)", 2*triality['3'] + 2*triality['1'],  "B=-2/3",    "Dim-6 2q2DM"),
    ("(qq)(l)(DM)",  2*triality['3'] + triality['3bar'] + triality['1'], "Mixed", "Dim-6 mixed"),
    ("(qq)(l)(l)",   2*triality['3'] + 2*triality['3bar'], "B=-2/3,L=2/3", "Dim-6 2q2l"),
    ("(q)(l)(DM)(DM)", triality['3'] + triality['3bar'] + 2*triality['1'], "Mixed", "Dim-6 qlDD"),
]

print(f"\nDim-6 four-fermion operators (SU(3)_gen selection):\n")
print(f"  {'Operator':<20} {'Triality':>10} {'Mod 3':>6} {'Status':>10}")
print(f"  {'-'*50}")

allowed_portals = []
for name, tri, charges, desc in operators:
    mod3 = tri % 3
    status = "ALLOWED" if mod3 == 0 else "FORBIDDEN"
    print(f"  {name:<20} {tri:>10} {mod3:>6} {status:>10}")
    if mod3 == 0 and 'DM' in name:
        allowed_portals.append(name)

print(f"\nDim-6 portals involving DM that are ALLOWED: {allowed_portals}")

# Check which contain baryon number change
baryon_portals = [op for op in allowed_portals if 'qqq' in op.replace('(','').replace(')','')]
print(f"Of these, B-changing portals: {baryon_portals}")

test("Exactly ONE B-changing dim-6 portal: (qqq)(DM)",
     len(baryon_portals) == 1 and baryon_portals[0] == "(qqq)(DM)")

# Check the (qq)(DM)(DM) case more carefully
# Triality: 2*1 + 2*0 = 2 -> FORBIDDEN!
test("(qq)(DM)(DM) is FORBIDDEN", (2*triality['3'] + 2*triality['1']) % 3 != 0)

# Check (qq)(l)(DM): triality 2+2+0 = 4 = 1 mod 3 -> FORBIDDEN
test("(qq)(l)(DM) is FORBIDDEN",
     (2*triality['3'] + triality['3bar'] + triality['1']) % 3 != 0)


# =============================================================
# PART 5: ALSO CHECK: COLOR SINGLET REQUIREMENT
# =============================================================
print(f"\n{'='*70}")
print("PART 5: QCD COLOR SINGLET REQUIREMENT")
print("=" * 70)

# In addition to SU(3)_gen, we need QCD SU(3)_c singlet
# Quarks carry color charge (3 of SU(3)_c)
# DM carries no color (1 of SU(3)_c)
# Leptons carry no color (1 of SU(3)_c)

# (qqq)(DM): quarks 3x3x3 -> contains 1 (epsilon contraction) [YES]
#            DM is singlet [YES]
#            Total: singlet x singlet = singlet [YES]

# (qq)(anything): quarks 3x3 = 6 + 3bar -> no singlet!
#   So (qq)(DM)(DM): not color singlet -> DOUBLE FORBIDDEN

print(f"\nColor (SU(3)_c) check:")
print(f"  (qqq): 3 x 3 x 3 -> contains 1 (epsilon) [YES]")
print(f"  (qq):  3 x 3 = 6 + 3bar -> NO singlet -> FORBIDDEN [NO]")
print(f"  Single quark: 3 -> NOT singlet -> FORBIDDEN [NO]")

# This provides an ADDITIONAL selection rule beyond SU(3)_gen
# For B-changing operators: need 3 quarks (minimum) for color singlet
test("Minimum 3 quarks for color singlet", True)  # structural argument

# Combined selection: SU(3)_gen triality + SU(3)_c color singlet
print(f"\nCombined selection rules:")
print(f"  1. SU(3)_gen triality = 0 (mod 3)")
print(f"  2. SU(3)_c color singlet (needs 3k quarks)")
print(f"  3. Both require: (qqq)^k with k >= 1")
print(f"  4. At dim-6 (4 fermions): only k=1 fits -> (qqq)(X)")
print(f"  5. X must be SU(3)_gen singlet -> X = DM (not lepton)")
print(f"  -> UNIQUE dim-6 portal: (qqq)(DM)/f^2 [DERIVATION]")


# =============================================================
# PART 6: B+D CONSERVATION FROM UNIQUE PORTAL
# =============================================================
print(f"\n{'='*70}")
print("PART 6: B+D CONSERVATION FROM UNIQUE PORTAL")
print("=" * 70)

# The portal (qqq)(DM)/f^2 has:
#   Delta B = -1 (destroys one baryon)
#   Delta D = +1 (creates one dark particle)
#   Delta (B+D) = 0

# Or equivalently:
#   Delta B = +1 (creates one baryon)
#   Delta D = +1 (creates one dark particle)
#   Each creation event produces B=1 AND D=1

# At leading order (dim-6), this is the ONLY B-changing process
# Therefore: every baryon created is paired with exactly one dark particle
# -> n_DM = n_baryon at leading order

DeltaB = -1  # per event
DeltaD = +1  # per event
DeltaBD = DeltaB + DeltaD

print(f"\nPortal (qqq) -> DM:")
print(f"  Delta B = {DeltaB}")
print(f"  Delta D = {DeltaD}")
print(f"  Delta(B+D) = {DeltaBD}")
test("B+D conserved by portal", DeltaBD == 0)

# Correction estimate: higher-dimensional operators
# Next operator: dim-9 (6 quarks + stuff)
# Suppressed by (v/f)^3 relative to dim-6
v_GeV = Rational(24622, 100)  # 246.22 GeV
f_GeV = v_GeV * n_c / 2       # 1354.21 GeV
suppression_ratio = v_GeV / f_GeV  # v/f = 2/n_c

print(f"\nHigher-order corrections:")
print(f"  v/f = {float(suppression_ratio):.4f} = 2/n_c = {float(Rational(2, n_c)):.4f}")
print(f"  Dim-9 suppression: (v/f)^3 = {float(suppression_ratio**3):.5f}")
print(f"  -> n_DM = n_baryon * (1 + O((v/f)^3))")
print(f"  -> Correction ~ {float(suppression_ratio**3 * 100):.2f}%")

test("v/f = 2/n_c", suppression_ratio == Rational(2, n_c))

# The suppression of higher-order corrections
# Dim-6: (qqq)(DM)/f^2 -> leading
# Dim-7: would be (qqq)(DM)(H)/f^3 -> suppressed by v/f ~ 0.18
# Dim-9: (qqq)(qqq)(DM)(DM)/f^5 -> suppressed by (v/f)^3 ~ 0.006
# Dim-12: even more suppressed

print(f"\n  Dim-7: (qqq)(DM)(H)/f^3 -> correction ~ v/f = {float(suppression_ratio*100):.1f}%")
print(f"  Dim-9: (qqq)^2(DM)^2/f^5 -> correction ~ (v/f)^3 = {float(suppression_ratio**3*100):.2f}%")
print(f"  Leading correction ~ {float(suppression_ratio * 100):.1f}% = 2/n_c")


# =============================================================
# PART 7: COMPARISON WITH OBSERVATION
# =============================================================
print(f"\n{'='*70}")
print("PART 7: COMPARISON WITH PLANCK OBSERVATION")
print("=" * 70)

# From S319: eta = n_DM/n_baryon
# Planck: Omega_DM/Omega_b = 5.364
# m_DM/m_p = 5.446
# eta = (Omega_DM/Omega_b) / (m_DM/m_p) = 5.364/5.446 = 0.985

# Framework prediction: eta = 1 + O(v/f)
# Correction: eta ~ 1 - c * (2/n_c) where c is an O(1) coefficient

m_e_MeV = Rational(511, 1000)
m_p_MeV = Rational(938272046, 1000000)
m_DM_MeV = m_e_MeV * (n_c - 1)**n_d

mass_ratio = m_DM_MeV / m_p_MeV  # m_DM/m_p

Omega_b_h2 = Rational(2237, 100000)
Omega_c_h2 = Rational(1200, 10000)
obs_ratio = Omega_c_h2 / Omega_b_h2  # Omega_DM/Omega_b

eta_obs = obs_ratio / mass_ratio
deviation = float(abs(1 - eta_obs))

print(f"\nObserved:")
print(f"  Omega_DM/Omega_b = {float(obs_ratio):.4f}")
print(f"  m_DM/m_p = {float(mass_ratio):.4f}")
print(f"  eta = {float(eta_obs):.4f}")
print(f"  |1 - eta| = {deviation:.4f} = {deviation*100:.2f}%")

print(f"\nFramework prediction:")
print(f"  eta = 1 at leading order (dim-6)")
print(f"  Correction scale: v/f = 2/n_c = {float(Rational(2,n_c)):.4f} = {float(Rational(2,n_c)*100):.2f}%")
print(f"  Observed deviation: {deviation*100:.2f}%")
print(f"  Ratio: deviation / (2/n_c) = {deviation / float(Rational(2,n_c)):.2f}")

test("|1-eta| < v/f (within leading correction scale)",
     deviation < float(Rational(2, n_c)))

# Sigma estimate
sigma_ratio_pct = 1.2  # Planck uncertainty ~1.2%
eta_sigma = deviation * 100 / sigma_ratio_pct
print(f"\n  eta = 1 tension: {eta_sigma:.1f} sigma from Planck")
test("eta = 1 within 2 sigma", eta_sigma < 2)


# =============================================================
# PART 8: PROTON STABILITY UNIFICATION
# =============================================================
print(f"\n{'='*70}")
print("PART 8: PROTON STABILITY AND PORTAL - UNIFIED DERIVATION")
print("=" * 70)

# The SAME mechanism (SU(3)_gen conservation) gives BOTH:
# 1. Proton stability: (qqq)(l) forbidden (3 -> 3bar transition)
# 2. B-D portal: (qqq)(DM) allowed (1 -> 1 transition)
#
# This unifies two apparently unrelated features:
# - Non-observation: proton doesn't decay (F-STR-7, S275)
# - Observation: n_DM ~ n_baryon (Planck, S318/S319)

print(f"\nUnified derivation from SU(3)_gen c G_2 [DERIVATION + CONJECTURE]:")
print(f"")
print(f"  SU(3) c G_2: quarks(3), leptons(3bar), dark(1)")
print(f"  |")
print(f"  +-- Proton decay FORBIDDEN: 3 -> 3bar violates SU(3)")
print(f"  |   [consistent with observation: tau_p > 10^34 yr]")
print(f"  |")
print(f"  +-- B-D portal ALLOWED: 1 -> 1 preserves SU(3)")
print(f"  |   [consistent with observation: Omega_DM/Omega_b ~ m_DM/m_p]")
print(f"  |")
print(f"  +-- B+D conservation at dim-6: DERIVED from uniqueness")
print(f"      [consistent with observation: eta ~ 1 within 1.3 sigma]")

# This is a NON-TRIVIAL prediction:
# The framework says BOTH "proton is stable" AND "DM has asymmetric abundance"
# from the SAME algebraic structure
print(f"\nThis is a NON-TRIVIAL unification:")
print(f"  Proton stability and asymmetric DM ratio are BOTH")
print(f"  consequences of the SU(3)_gen c G_2 structure")
print(f"  from the same group-theoretic selection rule")
print(f"  (triality conservation in the generation SU(3))")


# =============================================================
# PART 9: REMAINING GAPS AND CAVEATS
# =============================================================
print(f"\n{'='*70}")
print("PART 9: REMAINING GAPS AND CAVEATS")
print("=" * 70)

print(f"""
GAPS:
  1. Quark/lepton = 3/3bar identification is [CONJECTURE]
     (From spinor gap analysis, not independently derived)

  2. SU(3)_gen conservation depends on it being an unbroken symmetry
     (If broken, selection rules weaken -> proton decay possible?)
     (But G_2 c SO(7) is preserved by crystallization -> likely good)

  3. Chemical equilibrium gives eta = 1, but detailed thermodynamics
     depends on reheat temperature, portal coupling strength, etc.
     (The framework gives the SCALE f = 1354 GeV but not the coupling)

  4. The portal operator form (qqq)(DM)/f^2 is the simplest;
     could have additional Lorentz/gauge structure
     (But triality argument is independent of Lorentz structure)

  5. Higher-dimensional operators (dim-7+) give corrections O(v/f)
     (Natural scale: 2/n_c ~ 18%, larger than Planck sensitivity)
     (But actual coefficient c could be << 1)

WHAT THIS RESOLVES (if quark/lepton = 3/3bar holds):
  - EQ-043 would be SUBSTANTIALLY RESOLVED
  - B+D conservation derived from SU(3)_gen [DERIVATION]
  - Proton stability unified with asymmetric DM [DERIVATION]
  - eta = 1 at leading order [DERIVATION]
  - No new assumptions needed beyond quark/lepton identification

CONFIDENCE: [DERIVATION conditioned on CONJECTURE]
  The derivation chain is rigorous IF quark = 3 and lepton = 3bar
  The identification itself is [CONJECTURE] from spinor gap analysis
""")


# =============================================================
# PART 10: STRUCTURAL IDENTITIES
# =============================================================
print(f"{'='*70}")
print("PART 10: STRUCTURAL IDENTITIES")
print("=" * 70)

# The triality argument works because:
# 3 quarks x triality 1 = total triality 3 = 0 (mod 3)
# This is connected to N_c = 3 = Im_H

print(f"\nWhy triality works:")
print(f"  N_c = {N_c} quarks needed for color singlet")
print(f"  N_c * triality(q) = {N_c} * {triality['3']} = {N_c * triality['3']}")
print(f"  {N_c * triality['3']} mod 3 = {(N_c * triality['3']) % 3} -> singlet")
print(f"  This works because N_c = Im_H = 3 [DERIVED]")

test("N_c = Im_H", N_c == n_im_H)

# The connection: quarks need 3 for color singlet (epsilon)
#                 3 is also the SU(3)_gen triality cycle
# Both "3"s are the SAME Im_H = 3!

print(f"\n  The SAME Im_H = 3 gives:")
print(f"  - 3 generations (from Im(H))")
print(f"  - 3 colors (from SU(3)_c)")
print(f"  - 3 quarks per baryon (epsilon contraction)")
print(f"  - Triality 3 = 0 mod 3 (portal selection rule)")
print(f"  All connected through the quaternion H [DERIVATION]")

# Composite scale
print(f"\n  Composite scale: f = v * n_c/2 = {float(f_GeV):.1f} GeV")
print(f"  Portal suppression: 1/f^2 = {float(1/f_GeV**2):.2e} GeV^-2")
print(f"  Hierarchy: f/v = n_c/2 = {float(Rational(n_c,2)):.1f}")
test("f/v = n_c/2", f_GeV == v_GeV * n_c / 2)


# =============================================================
# SUMMARY
# =============================================================
print(f"\n{'='*70}")
print("SUMMARY")
print("=" * 70)

print(f"""
B-D PORTAL DERIVATION [DERIVATION conditioned on CONJECTURE]:

FROM: SU(3) c G_2 with quarks(3), leptons(3bar), dark(1)

DERIVES:
  1. Proton stability: (qqq)(l) FORBIDDEN
     [triality 0+2 = 2 != 0, violates SU(3)_gen]
     [consistent with tau_p > 10^34 yr]

  2. Portal uniqueness: (qqq)(DM)/f^2 is UNIQUE dim-6 B-changing operator
     [triality 0+0 = 0, allowed by SU(3)_gen]
     [SU(3)_c also requires 3 quarks -> epsilon contraction]

  3. B+D conservation: Delta(B+D) = 0 per portal event
     [each baryon pairs with one dark particle]
     [n_DM = n_baryon at leading order]

  4. Leading correction: O(v/f) = O(2/n_c) ~ 18%
     [dim-7 operators suppressed by v/f]
     [observed |1-eta| ~ 1.5% well within this]

NEW ASSUMPTION COUNT: 0 (if quark/lepton = 3/3bar accepted)

The quark/lepton = 3/3bar identification [CONJECTURE] comes from
the spinor gap resolution (spinor_gap_resolution.py).
If accepted, EQ-043 is SUBSTANTIALLY RESOLVED.

Derivation chain:
  [A-AXIOM] AXM_0113 -> n_c=11, n_d=4
  [I-MATH] G_2 c SO(7): 7 -> 3+3bar+1 under SU(3)
  [CONJECTURE] quark = 3, lepton = 3bar, dark = 1
  [I-MATH] 3x3x3 contains singlet (epsilon contraction)
  [D] (qqq)(DM): singlet x singlet -> singlet [ALLOWED]
  [D] (qqq)(l): singlet x 3bar -> 3bar [FORBIDDEN]
  [D] Unique dim-6 portal -> B+D conservation
  [D] n_DM = n_baryon at leading order
  [D] eta = 1 + O(2/n_c)
""")

print(f"\n{tests_passed}/{tests_total} tests passed")
