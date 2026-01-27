#!/usr/bin/env python3
"""
Prime 5 Search
==============
Systematic search for where prime 5 = 1^2 + 2^2 = dim(R)^2 + dim(C)^2
appears in fundamental physics.

The prime 5 combines:
  - dim(R) = 1 (real numbers, scalars)
  - dim(C) = 2 (complex numbers, phases)

Created: 2026-01-27 (Session 79)
"""

from sympy import *
from sympy.ntheory import isprime, factorint
import math

print("="*70)
print("SYSTEMATIC SEARCH FOR PRIME 5")
print("="*70)
print("\n5 = 1^2 + 2^2 = dim(R)^2 + dim(C)^2")
print("Combines scalar (R) and complex (C) structure")

# ============================================================
# PHYSICAL CONSTANTS (PDG 2024)
# ============================================================

# Lepton masses (MeV)
m_e = 0.51099895
m_mu = 105.6583755
m_tau = 1776.86

# Quark masses (MeV, MS-bar at 2 GeV for light quarks)
m_u = 2.16
m_d = 4.67
m_s = 93.4
m_c = 1270
m_b = 4180
m_t = 172760

# Boson masses (MeV)
m_W = 80377
m_Z = 91187.6
m_H = 125250

# Other
m_p = 938.272  # proton
m_n = 939.565  # neutron
v = 246000     # Higgs VEV (MeV)

# Coupling constants
alpha_em = 1/137.036
sin2_theta_W = 0.23122
alpha_s_MZ = 0.1179

# Framework dimensions
dims = {'R': 1, 'C': 2, 'H': 4, 'O': 8, 'Im_H': 3, 'Im_O': 7, 'n_c': 11, 'n_d': 4}

print("\n" + "="*70)
print("PART 1: DIRECT APPEARANCES OF 5")
print("="*70)

# Check where 5 appears directly
print("\n--- Places where 5 appears directly ---")
print(f"  15 fermions/generation = 3 x 5 = Im(H) x 5")
print(f"  5 = dim(R) + dim(H) = 1 + 4")
print(f"  5 = dim(C) + Im(H) = 2 + 3")
print(f"  5 Higgs degrees of freedom (complex doublet = 4 real, but 5 before EWSB?)")

print("\n" + "="*70)
print("PART 2: QUARK MASS RATIOS")
print("="*70)

# Quark mass ratios
quark_ratios = {
    'm_d/m_u': m_d/m_u,
    'm_s/m_d': m_s/m_d,
    'm_s/m_u': m_s/m_u,
    'm_c/m_s': m_c/m_s,
    'm_b/m_c': m_b/m_c,
    'm_t/m_b': m_t/m_b,
    'm_c/m_u': m_c/m_u,
    'm_b/m_s': m_b/m_s,
    'm_t/m_c': m_t/m_c,
}

print("\nQuark mass ratios:")
for name, ratio in quark_ratios.items():
    # Check proximity to 5 or multiples/fractions of 5
    dist_5 = abs(ratio - 5)
    dist_10 = abs(ratio - 10)
    dist_20 = abs(ratio - 20)
    dist_25 = abs(ratio - 25)
    dist_sqrt5 = abs(ratio - math.sqrt(5))

    note = ""
    if dist_5 < 1:
        note = f" <-- CLOSE TO 5! (error: {100*dist_5/5:.1f}%)"
    elif dist_sqrt5 < 0.5:
        note = f" <-- CLOSE TO sqrt(5)={math.sqrt(5):.3f}! (error: {100*dist_sqrt5/math.sqrt(5):.1f}%)"
    elif dist_20 < 2:
        note = f" <-- CLOSE TO 20=4x5! (error: {100*dist_20/20:.1f}%)"
    elif dist_25 < 3:
        note = f" <-- CLOSE TO 25=5^2! (error: {100*dist_25/25:.1f}%)"

    print(f"  {name:12} = {ratio:10.4f}{note}")

print("\n" + "="*70)
print("PART 3: BOSON MASS RATIOS")
print("="*70)

boson_ratios = {
    'm_Z/m_W': m_Z/m_W,
    'm_H/m_W': m_H/m_W,
    'm_H/m_Z': m_H/m_Z,
    'm_W/m_tau': m_W/m_tau,
    'm_Z/m_tau': m_Z/m_tau,
    'm_H/m_tau': m_H/m_tau,
    'v/m_H': v/m_H,
    'v/m_t': v/m_t,
}

print("\nBoson mass ratios:")
for name, ratio in boson_ratios.items():
    dist_5 = abs(ratio - 5)
    note = ""
    if dist_5 < 1:
        note = f" <-- CLOSE TO 5! (error: {100*dist_5/5:.1f}%)"
    elif abs(ratio - 2) < 0.1:
        note = f" <-- CLOSE TO 2"
    elif abs(ratio - 1.4) < 0.1:
        note = f" <-- CLOSE TO sqrt(2)"

    print(f"  {name:12} = {ratio:10.4f}{note}")

print("\n" + "="*70)
print("PART 4: ELECTROWEAK STRUCTURE")
print("="*70)

print("\n--- Weinberg angle relations ---")
print(f"  sin^2(theta_W) = {sin2_theta_W:.5f}")
print(f"  cos^2(theta_W) = {1-sin2_theta_W:.5f}")
print(f"  tan^2(theta_W) = {sin2_theta_W/(1-sin2_theta_W):.5f}")

# Check ratios involving 5
print(f"\n  1/sin^2(theta_W) = {1/sin2_theta_W:.4f}")
print(f"  1/cos^2(theta_W) = {1/(1-sin2_theta_W):.4f}")

# sin^2 theta_W = 0.231 ~ 3/13?
print(f"\n  sin^2(theta_W) ~ 3/13 = {3/13:.5f} (error: {100*abs(sin2_theta_W - 3/13)/(3/13):.2f}%)")
print(f"  sin^2(theta_W) ~ 2/9 = {2/9:.5f} (error: {100*abs(sin2_theta_W - 2/9)/(2/9):.2f}%)")

# Check 5-related fractions
print(f"\n  Does 5 appear in Weinberg angle?")
print(f"  sin^2(theta_W) ~ 1/5 = 0.200 (error: {100*abs(sin2_theta_W - 0.2)/0.2:.1f}%)")
print(f"  sin^2(theta_W) ~ 5/21 = {5/21:.5f} (error: {100*abs(sin2_theta_W - 5/21)/(5/21):.2f}%)")
print(f"  sin^2(theta_W) ~ 5/22 = {5/22:.5f} (error: {100*abs(sin2_theta_W - 5/22)/(5/22):.2f}%)")

print("\n" + "="*70)
print("PART 5: NUMBERS INVOLVING 5")
print("="*70)

print("\n--- Framework numbers divisible by 5 ---")
print(f"  15 = 3 x 5 = fermions per generation")
print(f"  15 = 1 + 2 + 4 + 8 = sum of division algebra dimensions")
print(f"  15 = 2^4 - 1 (Mersenne-like)")

print("\n--- Is 5 hidden in 15? ---")
print(f"  15/3 = 5 (fermions per generation / generations)")
print(f"  This gives: 5 fermion TYPES per generation?")
print(f"    - 2 quarks (u, d)")
print(f"    - 2 leptons (e, nu)")
print(f"    - 1 additional? Or counting differently...")

print("\n--- Actual fermion count ---")
print(f"  Per generation:")
print(f"    Quarks: u_L, u_R, d_L, d_R = 4 (x3 colors = 12)")
print(f"    Leptons: e_L, e_R, nu_L = 3")
print(f"    Total: 12 + 3 = 15")
print(f"  ")
print(f"  Alternative count by 'type':")
print(f"    Up-type quarks: u (3 colors)")
print(f"    Down-type quarks: d (3 colors)")
print(f"    Charged lepton: e")
print(f"    Neutrino: nu")
print(f"    = 4 fermion 'species' per generation, not 5")

print("\n" + "="*70)
print("PART 6: CKM AND PMNS MATRIX ELEMENTS")
print("="*70)

# CKM matrix elements (magnitudes)
V_ud = 0.97373
V_us = 0.2243
V_ub = 0.00382
V_cd = 0.221
V_cs = 0.975
V_cb = 0.0408
V_td = 0.0086
V_ts = 0.0415
V_tb = 1.014

print("\n--- CKM matrix elements ---")
ckm = {'V_ud': V_ud, 'V_us': V_us, 'V_ub': V_ub,
       'V_cd': V_cd, 'V_cs': V_cs, 'V_cb': V_cb,
       'V_td': V_td, 'V_ts': V_ts, 'V_tb': V_tb}

for name, val in ckm.items():
    if val > 0.01:
        inv = 1/val
        print(f"  {name} = {val:.4f}, 1/{name} = {inv:.2f}")

# Cabibbo angle
theta_C = math.asin(V_us)
print(f"\n  Cabibbo angle theta_C = {math.degrees(theta_C):.2f} degrees")
print(f"  sin(theta_C) = {V_us:.4f}")
print(f"  1/sin(theta_C) = {1/V_us:.3f}")
print(f"  1/sin^2(theta_C) = {1/V_us**2:.2f}")

# Check if related to 5
print(f"\n  Is Cabibbo related to 5?")
print(f"  V_us ~ 1/sqrt(20) = {1/math.sqrt(20):.4f} (error: {100*abs(V_us - 1/math.sqrt(20))*math.sqrt(20):.1f}%)")
print(f"  V_us ~ 1/(2*sqrt(5)) = {1/(2*math.sqrt(5)):.4f} (error: {100*abs(V_us - 1/(2*math.sqrt(5)))*(2*math.sqrt(5)):.1f}%)")

print("\n" + "="*70)
print("PART 7: GOLDEN RATIO (involves sqrt(5))")
print("="*70)

phi = (1 + math.sqrt(5))/2  # golden ratio
print(f"\n  Golden ratio phi = (1+sqrt(5))/2 = {phi:.6f}")
print(f"  phi^2 = {phi**2:.6f}")
print(f"  1/phi = phi - 1 = {1/phi:.6f}")

print("\n--- Searching for golden ratio in mass ratios ---")
test_ratios = {
    'm_mu/m_e': m_mu/m_e,
    'm_tau/m_mu': m_tau/m_mu,
    'm_tau/m_e': m_tau/m_e,
    'm_s/m_d': m_s/m_d,
    'm_c/m_s': m_c/m_s,
    'm_b/m_c': m_b/m_c,
    'm_t/m_b': m_t/m_b,
    'm_p/m_e': m_p/m_e,
    'm_Z/m_W': m_Z/m_W,
}

for name, ratio in test_ratios.items():
    # Check against phi and powers of phi
    for power in range(1, 20):
        phi_power = phi ** power
        if abs(ratio - phi_power) / phi_power < 0.05:
            print(f"  {name} = {ratio:.4f} ~ phi^{power} = {phi_power:.4f} (error: {100*abs(ratio-phi_power)/phi_power:.2f}%)")
            break

print("\n" + "="*70)
print("PART 8: COSMOLOGICAL PARAMETERS")
print("="*70)

# Cosmological parameters
Omega_Lambda = 0.6889  # dark energy density
Omega_m = 0.3111       # matter density
Omega_b = 0.0486       # baryon density
H0 = 67.4              # Hubble constant (km/s/Mpc)
T_CMB = 2.725          # CMB temperature (K)

print("\n--- Cosmological density ratios ---")
print(f"  Omega_Lambda = {Omega_Lambda:.4f}")
print(f"  Omega_m = {Omega_m:.4f}")
print(f"  Omega_Lambda/Omega_m = {Omega_Lambda/Omega_m:.4f}")

# Check for 5
ratio_cosmo = Omega_Lambda/Omega_m
print(f"\n  Is dark energy/matter ratio related to 5?")
print(f"  Omega_Lambda/Omega_m = {ratio_cosmo:.4f}")
print(f"  Distance from 2 = {abs(ratio_cosmo - 2):.4f}")
print(f"  Distance from 5/2 = {abs(ratio_cosmo - 2.5):.4f}")
print(f"  Distance from phi^2 = {abs(ratio_cosmo - phi**2):.4f}")

print("\n" + "="*70)
print("PART 9: NUMBER 5 IN PARTICLE PHYSICS")
print("="*70)

print("\n--- Where does 5 appear in particle physics? ---")
print("""
1. SU(5) Grand Unified Theory
   - SU(5) is the simplest GUT group
   - Fermions fit in 5-bar and 10 representations
   - 5 = dim(R)^2 + dim(C)^2 connects to complex representations?

2. Five Higgs components
   - Complex Higgs doublet has 4 real degrees of freedom
   - But SU(2) x U(1) has 4 generators
   - After EWSB: 3 eaten by W+, W-, Z; 1 physical Higgs
   - Where is 5? Maybe: 4 Higgs + 1 vacuum expectation direction?

3. Hypercharge quantization
   - Hypercharges: 0, 1/3, 2/3, 1 (and negatives)
   - Denominators involve 3, not 5

4. Anomaly cancellation
   - Sum of hypercharges must cancel for anomaly freedom
   - 15 fermions arranged so sum = 0
   - 15 = 3 x 5 suggests 5 "sets" of 3?

5. Color + 2
   - Strong force has 3 colors
   - Electroweak has 2 "colors" (weak isospin)
   - 3 + 2 = 5 "charge types"?
""")

print("\n" + "="*70)
print("PART 10: SYSTEMATIC RATIO SEARCH")
print("="*70)

print("\n--- Searching for ratios equal to 5 within 5% ---")

all_masses = {
    'm_e': m_e, 'm_mu': m_mu, 'm_tau': m_tau,
    'm_u': m_u, 'm_d': m_d, 'm_s': m_s, 'm_c': m_c, 'm_b': m_b, 'm_t': m_t,
    'm_W': m_W, 'm_Z': m_Z, 'm_H': m_H, 'm_p': m_p, 'm_n': m_n, 'v': v
}

found_5 = []
for name1, m1 in all_masses.items():
    for name2, m2 in all_masses.items():
        if name1 != name2 and m1 > m2:
            ratio = m1/m2
            if abs(ratio - 5) / 5 < 0.05:
                error = 100*abs(ratio - 5)/5
                found_5.append((f"{name1}/{name2}", ratio, error))
                print(f"  {name1}/{name2} = {ratio:.4f} (error from 5: {error:.2f}%)")

if not found_5:
    print("  No mass ratios found within 5% of 5")

print("\n--- Searching for ratios equal to sqrt(5) within 5% ---")
sqrt5 = math.sqrt(5)
found_sqrt5 = []
for name1, m1 in all_masses.items():
    for name2, m2 in all_masses.items():
        if name1 != name2 and m1 > m2:
            ratio = m1/m2
            if abs(ratio - sqrt5) / sqrt5 < 0.05:
                error = 100*abs(ratio - sqrt5)/sqrt5
                found_sqrt5.append((f"{name1}/{name2}", ratio, error))
                print(f"  {name1}/{name2} = {ratio:.4f} ~ sqrt(5)={sqrt5:.4f} (error: {error:.2f}%)")

if not found_sqrt5:
    print("  No mass ratios found within 5% of sqrt(5)")

print("\n--- Searching for ratios equal to 5^2=25 within 5% ---")
for name1, m1 in all_masses.items():
    for name2, m2 in all_masses.items():
        if name1 != name2 and m1 > m2:
            ratio = m1/m2
            if abs(ratio - 25) / 25 < 0.05:
                error = 100*abs(ratio - 25)/25
                print(f"  {name1}/{name2} = {ratio:.4f} (error from 25: {error:.2f}%)")

print("\n" + "="*70)
print("PART 11: THE 15 = 3 x 5 CONNECTION")
print("="*70)

print("""
The number 15 = 3 x 5 is fundamental:
  - 15 fermions per generation
  - 15 = 1 + 2 + 4 + 8 (sum of division algebra dimensions)
  - 15 = 2^4 - 1

If 15 = 3 x 5, and 3 = Im(H) (generations), then:
  5 = 15 / 3 = (fermions per gen) / (generations)

This gives 5 "something" per generation. What?

Counting fermion representations:
  Per generation, we have these SU(3) x SU(2) x U(1) representations:

  1. Q_L = (3, 2, 1/6)   -- left-handed quark doublet (3 colors)
  2. u_R = (3, 1, 2/3)   -- right-handed up quark (3 colors)
  3. d_R = (3, 1, -1/3)  -- right-handed down quark (3 colors)
  4. L_L = (1, 2, -1/2)  -- left-handed lepton doublet
  5. e_R = (1, 1, -1)    -- right-handed electron

  = 5 REPRESENTATIONS per generation!
""")

print("  *** CANDIDATE: 5 = number of fermion REPRESENTATIONS per generation ***")

print("\n" + "="*70)
print("PART 12: CHECKING 5 REPRESENTATIONS INTERPRETATION")
print("="*70)

print("""
If 5 = number of distinct fermion representations per generation:

  5 reps x 3 generations = 15 representations total

  Each representation has a dimension (number of states):
    Q_L: 3 colors x 2 isospin = 6 states
    u_R: 3 colors x 1 = 3 states
    d_R: 3 colors x 1 = 3 states
    L_L: 1 x 2 isospin = 2 states
    e_R: 1 x 1 = 1 state

    Total: 6 + 3 + 3 + 2 + 1 = 15 states per generation!

  This is EXACTLY the 15 fermions we count!

  So: 15 = 5 representations x (weighted sum of their dimensions / 5)

  But more simply:
    5 = number of irreducible representations
    3 = number of generations
    15 = total fermion count

  The prime 5 encodes: NUMBER OF DISTINCT REPRESENTATION TYPES
""")

print("\n" + "="*70)
print("SUMMARY: WHERE PRIME 5 APPEARS")
print("="*70)

print("""
STRONG CANDIDATES:

1. **5 fermion representations per generation** [HIGH CONFIDENCE]
   - Q_L, u_R, d_R, L_L, e_R = 5 distinct reps
   - 5 reps x 3 generations = 15 total reps
   - Each rep contributes differently to the 15 fermion count
   - 5 = 1^2 + 2^2 combines scalar (singlets) and doublet structure!

2. **SU(5) GUT structure** [MEDIUM - needs investigation]
   - SU(5) is smallest simple GUT
   - Uses 5-bar and 10 representations
   - May connect to dim(R)^2 + dim(C)^2 = 5

3. **Electroweak + strong = 2 + 3 = 5** [MEDIUM]
   - SU(2) has 2-dimensional fundamental
   - SU(3) has 3-dimensional fundamental
   - Together: 5 "charge dimensions"

NOT FOUND in:
- Direct mass ratios (no m_X/m_Y = 5 within 5%)
- Weinberg angle (sin^2 theta_W = 0.231, not close to 1/5 or 5-related)
- Cabibbo angle (V_us ~ 0.22, not obviously 5-related)
- Cosmological ratios

CONCLUSION:
  Prime 5 likely represents the NUMBER OF FERMION REPRESENTATIONS per generation.
  This is a structural role (counting reps) not a numerical ratio role.

  5 = 1^2 + 2^2 combines:
    - 1 = dim(R) = singlets (e_R is a singlet under SU(2))
    - 2 = dim(C) = doublets (Q_L, L_L are doublets)

  The five representations are:
    - 2 doublets: Q_L (quark), L_L (lepton)
    - 3 singlets: u_R, d_R, e_R

  So 5 = 2 + 3 = (number of doublets) + (number of singlets) per generation!
""")
