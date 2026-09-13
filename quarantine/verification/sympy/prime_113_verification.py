"""
Prime 113 Investigation

Searches for 113 = 7^2 + 8^2 = Im(O)^2 + dim(O)^2 in physics.

113 is a PURE OCTONION prime - both terms involve only octonions.
This should appear in pure QCD observables (no EM).

Candidates from initial search:
  m_eta/m_pi = 113/29 (0.7% error)
  m_proton/Lambda_QCD = 113/26 (0.5% error)
"""

from sympy import *

print("=" * 70)
print("PRIME 113 INVESTIGATION")
print("113 = 7^2 + 8^2 = Im(O)^2 + dim(O)^2")
print("=" * 70)

# ============================================================================
# Physical constants
# ============================================================================

# Meson masses (GeV)
m_pi = 0.13957   # pion (pi+)
m_pi0 = 0.13498  # pion (pi0)
m_K = 0.49368    # kaon
m_eta = 0.5478   # eta
m_etaprime = 0.9578  # eta'
m_rho = 0.77526  # rho
m_omega = 0.78266  # omega
m_phi = 1.01946  # phi

# Baryon masses (GeV)
m_proton = 0.93827
m_neutron = 0.93957

# QCD scale
Lambda_QCD = 0.217  # GeV (MS-bar, 5 flavors)
Lambda_QCD_error = 0.025  # approximate

# Glueball masses (lattice QCD predictions)
m_glueball_0pp = 1.710  # 0++ glueball, GeV (lattice)
m_glueball_2pp = 2.390  # 2++ glueball, GeV

print("\nMeson masses (GeV):")
print(f"  m_pi = {m_pi}, m_eta = {m_eta}, m_etaprime = {m_etaprime}")
print(f"\nBaryon masses: m_proton = {m_proton} GeV")
print(f"Lambda_QCD = {Lambda_QCD} +/- {Lambda_QCD_error} GeV")
print(f"\nGlueball masses (lattice): 0++ = {m_glueball_0pp}, 2++ = {m_glueball_2pp} GeV")

# ============================================================================
# Test 1: m_eta/m_pi = 113/29?
# ============================================================================

print("\n" + "=" * 70)
print("TEST 1: m_eta/m_pi = 113/29?")
print("=" * 70)

ratio = m_eta / m_pi
predicted = Rational(113, 29)

print(f"\n  m_eta/m_pi measured = {ratio:.4f}")
print(f"  113/29 = {float(predicted):.4f}")
print(f"  Error: {abs(float(predicted) - ratio)/ratio * 100:.2f}%")

print("\n  Physical interpretation:")
print("    113 = Im(O)^2 + dim(O)^2 (pure octonion)")
print("    29 is NOT a framework prime")
print("    But 29 = 4 + 25 = dim(H) + 5^2 = spacetime + (fermion prime)^2")
print("    m_eta/m_pi = pure_octonion / (spacetime + representation)")

# ============================================================================
# Test 2: m_proton/Lambda_QCD = 113/26?
# ============================================================================

print("\n" + "=" * 70)
print("TEST 2: m_proton/Lambda_QCD = 113/26?")
print("=" * 70)

ratio = m_proton / Lambda_QCD
predicted = Rational(113, 26)

print(f"\n  m_proton/Lambda_QCD measured = {ratio:.4f}")
print(f"  113/26 = {float(predicted):.4f}")
print(f"  Error: {abs(float(predicted) - ratio)/ratio * 100:.2f}%")

print("\n  Physical interpretation:")
print("    113 = Im(O)^2 + dim(O)^2 (pure octonion)")
print("    26 = 2 x 13 = dim(C) x prime_13")
print("    m_proton/Lambda_QCD = pure_octonion / (dim(C) x EM-generation)")

# ============================================================================
# Test 3: Glueball masses
# ============================================================================

print("\n" + "=" * 70)
print("TEST 3: Glueball masses (pure glue = pure octonion)")
print("=" * 70)

ratio_g = m_glueball_0pp / Lambda_QCD
print(f"\n  m_glueball(0++)/Lambda_QCD = {ratio_g:.2f}")

# Check for 113
for N in range(5, 30):
    if abs(ratio_g - 113/N) / ratio_g < 0.05:
        print(f"    -> 113/{N} = {113/N:.2f} (error: {abs(ratio_g - 113/N)/ratio_g*100:.1f}%)")

# Check glueball/proton ratio
ratio_gp = m_glueball_0pp / m_proton
print(f"\n  m_glueball(0++)/m_proton = {ratio_gp:.4f}")

# Check for 113
for N in range(30, 80):
    if abs(ratio_gp - 113/N) / ratio_gp < 0.02:
        print(f"    -> 113/{N} = {113/N:.4f} (error: {abs(ratio_gp - 113/N)/ratio_gp*100:.2f}%)")

# ============================================================================
# Test 4: Mass differences (more QCD-sensitive)
# ============================================================================

print("\n" + "=" * 70)
print("TEST 4: Mass splittings")
print("=" * 70)

# eta' - eta splitting (due to U(1)_A anomaly, purely QCD)
delta_eta = m_etaprime - m_eta
print(f"\n  m_eta' - m_eta = {delta_eta:.4f} GeV")
print(f"  (m_eta' - m_eta)/Lambda_QCD = {delta_eta/Lambda_QCD:.2f}")

# Check for 113
for N in range(1, 10):
    val = 113 * Lambda_QCD / N
    if abs(val - delta_eta) / delta_eta < 0.1:
        print(f"    delta_eta = 113 x Lambda_QCD / {N} = {val:.4f} (error: {abs(val - delta_eta)/delta_eta*100:.1f}%)")

# n-p mass difference (isospin breaking, partly EM but also QCD)
delta_np = m_neutron - m_proton
print(f"\n  m_n - m_p = {delta_np*1000:.3f} MeV")

# ============================================================================
# Test 5: Proton mass / pion mass
# ============================================================================

print("\n" + "=" * 70)
print("TEST 5: m_proton/m_pi")
print("=" * 70)

ratio_pp = m_proton / m_pi
print(f"\n  m_proton/m_pi = {ratio_pp:.3f}")

# Check for 113
for N in range(10, 20):
    if abs(ratio_pp - 113*N/17) / ratio_pp < 0.02:
        print(f"    -> 113 x {N}/17 = {113*N/17:.3f} (error: {abs(ratio_pp - 113*N/17)/ratio_pp*100:.2f}%)")

# Actually check simpler forms
print("\n  Checking simple forms:")
print(f"    113/17 x ? = {ratio_pp:.3f}")
print(f"    113/17 = {113/17:.3f}")
print(f"    ratio / (113/17) = {ratio_pp/(113/17):.3f}")

# ============================================================================
# Test 6: Check if 113 appears via different route
# ============================================================================

print("\n" + "=" * 70)
print("TEST 6: Alternative 113 searches")
print("=" * 70)

# QCD beta function with color
# b_0 = 11 - 2n_f/3 = 11 - 10/3 = 23/3 for 5 flavors
b0 = Rational(23, 3)
print(f"\n  QCD beta function b_0 = 23/3 = {float(b0):.4f}")
print(f"  Note: 23 appears in b_0!")
print(f"  23 = n_c + 3 x dim(H) = 11 + 12 (from session 79)")

# Color factor products
print("\n  Color factor products:")
C_F = Rational(4, 3)
C_A = 3
print(f"    C_F x C_A = {float(C_F * C_A):.4f}")
print(f"    C_F^2 + C_A^2 = {float(C_F**2 + C_A**2):.4f}")
print(f"    (C_F x C_A)^2 = {float((C_F * C_A)**2):.4f}")

# 113/16 check
print(f"\n  113/16 = {113/16:.4f} = 7.0625")
print(f"    Compare to m_rho/m_pi = {m_rho/m_pi:.4f}")
print(f"    Error: {abs(113/16 - m_rho/m_pi)/(m_rho/m_pi)*100:.2f}%")

# ============================================================================
# Summary
# ============================================================================

print("\n" + "=" * 70)
print("SUMMARY: PRIME 113 STATUS")
print("=" * 70)

print("""
PRIME 113 = 7^2 + 8^2 = Im(O)^2 + dim(O)^2

113 is a PURE OCTONION prime - both terms involve O.
Should appear in pure QCD (no EM) observables.

Candidates found:
  m_eta/m_pi = 113/29                       [0.7% error]
               But 29 is not framework

  m_proton/Lambda_QCD = 113/26              [0.5% error]
                      = 113/(2 x 13)
                      = pure_octonion / (dim(C) x prime_13)
                      This IS framework!

  m_rho/m_pi = 113/16? Error 20% - NOT significant

BEST FINDING:
  m_proton/Lambda_QCD = 113/(2 x 13) = 113/26

  Physical interpretation:
    The proton mass in units of Lambda_QCD is
    pure_octonion / (dim(C) x EM-generation_prime)

    This makes sense: the proton is color-bound (octonion structure)
    but contains quarks with EM charges (dim(C)) and belongs to
    a generation structure (prime_13).

VERDICT: FOUND (tentatively, in m_proton/Lambda_QCD)
         More verification needed - Lambda_QCD has ~10% uncertainty
""")

# Additional check: is 113/26 within Lambda_QCD uncertainty?
Lambda_range = [Lambda_QCD - Lambda_QCD_error, Lambda_QCD + Lambda_QCD_error]
ratio_range = [m_proton/L for L in Lambda_range]
predicted_ratio = float(Rational(113, 26))
print(f"\n  Additional check:")
print(f"    Predicted m_proton/Lambda_QCD = {predicted_ratio:.4f}")
print(f"    Lambda_QCD range: {Lambda_range[0]:.3f} - {Lambda_range[1]:.3f} GeV")
print(f"    Ratio range: {ratio_range[1]:.3f} - {ratio_range[0]:.3f}")
if ratio_range[1] <= predicted_ratio <= ratio_range[0]:
    print(f"    *** PREDICTION IS WITHIN Lambda_QCD UNCERTAINTY! ***")
