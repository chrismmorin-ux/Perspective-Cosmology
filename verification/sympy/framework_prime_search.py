"""
Framework Prime Search - Finding Primes 13, 53, and 113

Searches for the three missing framework primes in physical constants.

Framework primes (sums of division algebra dimension squares):
- 13 = 2^2 + 3^2 = dim(C)^2 + Im(H)^2
- 53 = 2^2 + 7^2 = dim(C)^2 + Im(O)^2
- 113 = 7^2 + 8^2 = Im(O)^2 + dim(O)^2

Also investigates prime 23 (non-framework anomaly).
"""

from sympy import *
import math

print("=" * 70)
print("FRAMEWORK PRIME SEARCH")
print("Finding primes 13, 53, and 113 in physics")
print("=" * 70)

# ============================================================================
# PHYSICAL CONSTANTS (PDG 2024)
# ============================================================================

print("\n" + "=" * 70)
print("SECTION 1: NEUTRINO MIXING (Search for prime 13)")
print("13 = 2^2 + 3^2 combines complex (EM) and generation structure")
print("=" * 70)

# PMNS matrix parameters (PDG 2024, normal ordering)
sin2_theta12 = 0.307      # solar angle
sin2_theta23 = 0.546      # atmospheric angle
sin2_theta13 = 0.02203    # reactor angle
delta_CP_rad = 1.36 * pi  # CP phase in radians (approx 245 deg)

print("\nNeutrino mixing angles:")
print(f"  sin^2(theta_12) = {sin2_theta12}")
print(f"  sin^2(theta_23) = {sin2_theta23}")
print(f"  sin^2(theta_13) = {sin2_theta13}")
print(f"  delta_CP = {float(delta_CP_rad):.4f} rad = {float(delta_CP_rad * 180/pi):.1f} deg")

# Search for 13 in neutrino mixing
print("\nSearching for prime 13 in neutrino mixing...")

# Check various combinations
tests_13 = [
    ("sin^2(theta_12) approx 13/42 ?", sin2_theta12, Rational(13, 42)),
    ("sin^2(theta_12) approx 4/13 ?", sin2_theta12, Rational(4, 13)),
    ("sin^2(theta_13) approx 2/91 = 2/(7x13) ?", sin2_theta13, Rational(2, 91)),
    ("sin^2(theta_13) approx 1/52 = 1/(4x13) ?", sin2_theta13, Rational(1, 52)),
    ("tan^2(theta_12) approx 4/9 ?", sin2_theta12/(1-sin2_theta12), Rational(4, 9)),
    ("sin^2(theta_23) approx 6/11 ?", sin2_theta23, Rational(6, 11)),
    ("sin^2(theta_23) approx 7/13 ?", sin2_theta23, Rational(7, 13)),
]

print("\nSystematic 13 search in mixing angles:")
for name, measured, predicted in tests_13:
    error = abs(float(predicted) - measured) / measured * 100
    print(f"  {name}: predicted={float(predicted):.6f}, measured={measured:.6f}, error={error:.2f}%")

# Check Jarlskog invariant (measure of CP violation)
# J = cos(theta_12)sin(theta_12)cos(theta_23)sin(theta_23)cos^2(theta_13)sin(theta_13)sin(delta)
s12 = sqrt(sin2_theta12)
c12 = sqrt(1 - sin2_theta12)
s23 = sqrt(sin2_theta23)
c23 = sqrt(1 - sin2_theta23)
s13 = sqrt(sin2_theta13)
c13 = sqrt(1 - sin2_theta13)
J_measured = float(c12 * s12 * c23 * s23 * c13**2 * s13 * sin(delta_CP_rad))
print(f"\nJarlskog invariant J = {J_measured:.6f}")
print(f"  1/|J| approx {1/abs(J_measured):.1f}")

# Check for 13 in J
tests_J = [
    ("J approx 3/130 = 3/(10x13) ?", abs(J_measured), Rational(3, 130)),
    ("J approx 1/26 = 1/(2x13) ?", abs(J_measured), Rational(1, 26)),
    ("J approx 1/39 = 1/(3x13) ?", abs(J_measured), Rational(1, 39)),
]

print("\nSearching for 13 in Jarlskog invariant:")
for name, measured, predicted in tests_J:
    error = abs(float(predicted) - measured) / measured * 100
    print(f"  {name}: predicted={float(predicted):.6f}, measured={measured:.6f}, error={error:.2f}%")

# ============================================================================
print("\n" + "=" * 70)
print("SECTION 2: CP VIOLATION PHASE (Another search for prime 13)")
print("=" * 70)

# The CP phase is delta approx 245 deg approx 1.36*pi radians
delta_deg = float(delta_CP_rad * 180 / pi)
print(f"\nCP phase delta = {delta_deg:.1f} deg")

# Check for 13 in angle
tests_delta = [
    ("delta/pi approx 13/10 ?", delta_deg/180, Rational(13, 10)),
    ("delta/pi approx 39/29 ?", delta_deg/180, Rational(39, 29)),  # 39 = 3x13
    ("360 - delta approx 115 deg -> sin(115 deg) ?", 360 - delta_deg, 115),
    ("cos(delta) approx -3/13 ?", math.cos(float(delta_CP_rad)), -3/13),
]

print("\nSearching for 13 in CP phase:")
for name, measured, predicted in tests_delta:
    pred_val = float(predicted)
    error = abs(pred_val - measured) / abs(measured) * 100 if measured != 0 else float('inf')
    print(f"  {name}: predicted={pred_val:.6f}, measured={measured:.6f}, error={error:.2f}%")

# ============================================================================
print("\n" + "=" * 70)
print("SECTION 3: QCD-QED RATIOS (Search for prime 53)")
print("53 = 2^2 + 7^2 combines EM (complex) and color (octonion) structure")
print("=" * 70)

# Strong coupling at Z mass
alpha_s_MZ = 0.1179   # alpha_s(M_Z)
alpha_EM = 1/137.036  # alpha (low energy)
alpha_MZ = 1/127.9    # alpha(M_Z) at Z scale

print(f"\nCoupling constants:")
print(f"  alpha_s(M_Z) = {alpha_s_MZ}")
print(f"  alpha = {alpha_EM:.6f} = 1/{1/alpha_EM:.3f}")
print(f"  alpha(M_Z) = {alpha_MZ:.6f} = 1/{1/alpha_MZ:.1f}")

# Ratio of couplings
alpha_ratio = alpha_s_MZ / alpha_MZ
print(f"\n  alpha_s(M_Z)/alpha(M_Z) = {alpha_ratio:.3f}")
print(f"  alpha_s/alpha(low energy) = {alpha_s_MZ/alpha_EM:.3f}")

# Search for 53
tests_53 = [
    ("alpha_s(M_Z)/alpha(M_Z) approx 53/3.5 ?", alpha_ratio, 53/3.5),
    ("1/alpha_s(M_Z) approx 53/6.2 ?", 1/alpha_s_MZ, 53/6.2),
    ("alpha_s x 53 approx 6.25 ?", alpha_s_MZ * 53, 6.25),
    ("alpha_MZ x 53 approx 0.415 ?", alpha_MZ * 53, 0.415),
]

print("\nSearching for 53 in coupling ratios:")
for name, measured, predicted in tests_53:
    error = abs(predicted - measured) / abs(measured) * 100
    print(f"  {name}: predicted={predicted:.4f}, measured={measured:.4f}, error={error:.2f}%")

# Check QCD color factor combinations
print("\nQCD color factors:")
N_c = 3  # Number of colors
C_F = Rational(4, 3)  # (N^2-1)/(2N) for SU(3)
C_A = 3  # Casimir for adjoint
T_F = Rational(1, 2)

print(f"  N_c = {N_c}")
print(f"  C_F = {C_F} = {float(C_F):.4f}")
print(f"  C_A = {C_A}")
print(f"  T_F = {T_F} = {float(T_F):.4f}")

# Can we get 53 from these?
print("\nSearching for 53 in color factor combinations:")
color_tests = [
    ("C_F x 40", float(C_F) * 40, 53),
    ("C_A x 17 + 2", C_A * 17 + 2, 53),
    ("N_c^2 x 6 - 1", N_c**2 * 6 - 1, 53),
]
for name, result, target in color_tests:
    print(f"  {name} = {result} (target: {target})")

# ============================================================================
print("\n" + "=" * 70)
print("SECTION 4: PURE QCD OBSERVABLES (Search for prime 113)")
print("113 = 7^2 + 8^2 = Im(O)^2 + dim(O)^2 -- pure octonion structure")
print("=" * 70)

# QCD scale
Lambda_QCD = 0.217  # GeV (MS-bar, 5 flavors)
M_Z = 91.1876  # GeV
M_proton = 0.93827  # GeV

print(f"\nQCD scales:")
print(f"  Lambda_QCD = {Lambda_QCD} GeV")
print(f"  M_Z = {M_Z} GeV")
print(f"  M_proton = {M_proton} GeV")

# Scale ratios
ratio_Z_Lambda = M_Z / Lambda_QCD
ratio_p_Lambda = M_proton / Lambda_QCD

print(f"\nScale ratios:")
print(f"  M_Z / Lambda_QCD = {ratio_Z_Lambda:.1f}")
print(f"  M_proton / Lambda_QCD = {ratio_p_Lambda:.2f}")

# Search for 113
tests_113 = [
    ("M_Z / Lambda_QCD approx 420 approx 4x105 ?", ratio_Z_Lambda, 4*(113-8)),
    ("M_proton / Lambda_QCD approx 4.32 approx 113/26 ?", ratio_p_Lambda, 113/26),
    ("Lambda_QCD x 521 approx M_Z ?", Lambda_QCD * 521, M_Z),
]

print("\nSearching for 113 in QCD scales:")
for name, measured, predicted in tests_113:
    error = abs(predicted - float(measured)) / abs(float(measured)) * 100
    print(f"  {name}: predicted={predicted:.2f}, measured={float(measured):.2f}, error={error:.2f}%")

# Beta function coefficient
b0_QCD = 11 - Rational(2*5, 3)  # 11 - 2n_f/3 for n_f=5 quarks
print(f"\nQCD beta function b_0 = {b0_QCD} = {float(b0_QCD):.4f}")

# Check hadron masses for 113
print("\nHadron mass ratios:")
m_pi = 0.13957  # pion mass (GeV)
m_K = 0.49368   # kaon mass
m_eta = 0.5478  # eta mass
m_etaprime = 0.9578  # eta prime mass
m_rho = 0.77526 # rho mass
m_omega = 0.78266  # omega mass
m_phi = 1.01946  # phi mass

ratios = [
    ("m_phi/m_pi", m_phi/m_pi),
    ("m_etaprime/m_pi", m_etaprime/m_pi),
    ("m_rho/m_pi", m_rho/m_pi),
    ("m_K/m_pi", m_K/m_pi),
    ("m_eta/m_pi", m_eta/m_pi),
]

print("\nMeson mass ratios:")
for name, ratio in ratios:
    print(f"  {name} = {ratio:.3f}")
    # Check if close to 113/N for some N
    for N in range(10, 30):
        if abs(ratio - 113/N) < 0.03:
            print(f"    -> approx 113/{N} = {113/N:.3f} (error: {abs(ratio - 113/N)/ratio*100:.1f}%)")

# ============================================================================
print("\n" + "=" * 70)
print("SECTION 5: PRIME 23 INVESTIGATION")
print("23 appears in m_mu/m_e approx 207 = 9x23 but is NOT a framework prime")
print("=" * 70)

m_e = 0.51099895  # MeV
m_mu = 105.6584   # MeV
m_tau = 1776.86   # MeV

ratio_mu_e = m_mu / m_e
print(f"\nm_mu/m_e = {ratio_mu_e:.3f}")
print(f"  = 3^2 x {ratio_mu_e/9:.3f}")
print(f"  approx 9 x 23 = 207 (error: {abs(207 - ratio_mu_e)/ratio_mu_e*100:.2f}%)")

# Can 23 be expressed in terms of framework dimensions?
print("\nCan 23 be expressed with division algebra dimensions?")
print("  23 = 4 + 19 = dim(H) + 19 -- 19 is not a framework number")
print("  23 = 8 + 15 = dim(O) + 15 = dim(O) + (1+2+4+8)")
print("  23 = 11 + 12 = n_c + 12 = n_c + 3x4 = n_c + 3xdim(H)")
print("  23 = 2 + 21 = dim(C) + 3x7 = dim(C) + 3xIm(O)")

# The 23 = n_c + 3xdim(H) formula is interesting!
print("\n*** INTERESTING: 23 = 11 + 3x4 = n_c + 3xdim(H) ***")
print("   This combines crystal dimensions (11) with 3 generations x spacetime (4)")

# Check if 23 appears elsewhere
print("\nChecking other places for 23:")
print(f"  m_tau/m_mu = {m_tau/m_mu:.2f} (no 23)")
print(f"  m_tau/m_e = {m_tau/m_e:.1f} = {m_tau/m_e/23:.1f} x 23 (approx 151 x 23 = 3473, actual 3477)")

# ============================================================================
print("\n" + "=" * 70)
print("SECTION 6: SYSTEMATIC FORMULA SEARCH")
print("=" * 70)

print("\nSearching for simple fractions involving 13, 53, 113...")

# Check sin^2(theta_12) more carefully
print("\nNeutrino solar angle sin^2(theta_12) = 0.307:")
for num in range(1, 30):
    for denom in range(2, 150):
        if denom % 13 == 0 or num % 13 == 0:  # Must involve 13
            frac = num / denom
            if abs(frac - sin2_theta12) / sin2_theta12 < 0.01:  # < 1% error
                print(f"  sin^2(theta_12) approx {num}/{denom} = {frac:.6f} (error: {abs(frac - sin2_theta12)/sin2_theta12*100:.2f}%)")

print("\nNeutrino reactor angle sin^2(theta_13) = 0.02203:")
for num in range(1, 10):
    for denom in range(30, 200):
        if denom % 13 == 0 or num % 13 == 0:
            frac = num / denom
            if abs(frac - sin2_theta13) / sin2_theta13 < 0.02:  # < 2% error
                print(f"  sin^2(theta_13) approx {num}/{denom} = {frac:.6f} (error: {abs(frac - sin2_theta13)/sin2_theta13*100:.2f}%)")

# Check strong coupling for 53
print(f"\nStrong coupling 1/alpha_s(M_Z) = {1/alpha_s_MZ:.2f}:")
for num in range(1, 20):
    for denom in range(1, 30):
        if num == 53 or denom == 53 or (num * denom) % 53 == 0:
            frac = num / denom
            target = 1/alpha_s_MZ
            if abs(frac - target) / target < 0.05:
                print(f"  1/alpha_s approx {num}/{denom} = {frac:.4f} (error: {abs(frac - target)/target*100:.2f}%)")

# ============================================================================
print("\n" + "=" * 70)
print("SECTION 7: NEW DIRECTION - Mass ratios divisible by framework primes")
print("=" * 70)

# Quark masses (PDG 2024, MS-bar at 2 GeV)
m_u = 2.16   # MeV
m_d = 4.67   # MeV
m_s = 93.4   # MeV
m_c = 1270   # MeV (at m_c)
m_b = 4180   # MeV (at m_b)
m_t = 172760 # MeV (pole)

print("\nQuark mass ratios:")
quark_ratios = [
    ("m_s/m_u", m_s/m_u),
    ("m_s/m_d", m_s/m_d),
    ("m_c/m_s", m_c/m_s),
    ("m_b/m_c", m_b/m_c),
    ("m_t/m_b", m_t/m_b),
    ("m_c/m_u", m_c/m_u),
    ("m_b/m_s", m_b/m_s),
    ("m_t/m_c", m_t/m_c),
]

for name, ratio in quark_ratios:
    print(f"  {name} = {ratio:.2f}")
    for p in [13, 53, 113]:
        for N in range(1, 20):
            if abs(ratio - p/N) / ratio < 0.05:
                print(f"    -> approx {p}/{N} = {p/N:.2f} (error: {abs(ratio - p/N)/ratio*100:.1f}%)")
            if abs(ratio - N*p) / ratio < 0.05:
                print(f"    -> approx {N}x{p} = {N*p} (error: {abs(ratio - N*p)/ratio*100:.1f}%)")

# ============================================================================
print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)

print("""
PRIME 13 (2^2 + 3^2):
- sin^2(theta_12) approx 4/13 = 0.3077 (0.22% error) -- PROMISING!
- Need to verify this is significant and not coincidence

PRIME 53 (2^2 + 7^2):
- No clear appearance found yet
- May appear in higher-order QCD corrections or specific processes

PRIME 113 (7^2 + 8^2):
- No clear appearance found yet
- Pure octonion structure suggests gluon-only processes

PRIME 23 (anomaly):
- Appears in m_mu/m_e approx 207 = 9x23
- 23 = 11 + 12 = n_c + 3xdim(H) -- combines crystal and generationxspacetime
- This suggests 23 IS a framework prime via addition (not sum of squares)

NEXT STEPS:
1. Verify sin^2(theta_12) approx 4/13 carefully
2. Check other PMNS elements for 13
3. Look for 53 in specific QCD processes (R ratio, jet rates)
4. Look for 113 in pure glue observables (glueball masses)
""")
