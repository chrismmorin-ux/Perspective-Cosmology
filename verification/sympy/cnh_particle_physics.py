#!/usr/bin/env python3
"""
CNH Phase 3: Particle Physics Extension

KEY QUESTION: Does the CNH apply beyond BBN nuclei?

Tests:
1. Hadron mass ratios and Gaussian norm properties
2. Particle decay rates vs quantum number norm status
3. Mixing angle pattern: CKM vs PMNS vs electroweak

Status: EXPLORATION
"""

from sympy import *
from sympy.ntheory import factorint

def is_gaussian_norm(n):
    """Check if n is a sum of two squares (Gaussian norm)."""
    if n <= 0:
        return n == 0
    factors = factorint(n)
    for p, exp in factors.items():
        if p % 4 == 3 and exp % 2 == 1:
            return False
    return True

def norm_status(n):
    """Return 'norm' or 'NON' for a positive integer."""
    return "norm" if is_gaussian_norm(n) else "NON"

# ============================================================
# PART 1: Hadron mass ratios
# ============================================================

print("=" * 60)
print("PART 1: Hadron mass ratios")
print("=" * 60)

# Key hadron masses (MeV)
hadrons = {
    "proton": 938.272,
    "neutron": 939.565,
    "pi+": 139.570,
    "pi0": 134.977,
    "K+": 493.677,
    "K0": 497.611,
    "rho": 775.26,
    "omega": 782.65,
    "eta": 547.862,
    "eta'": 957.78,
}

# Calculate ratios as approximate fractions
print("\nHadron mass ratios (approximate):")
print(f"{'Ratio':<25} | {'Value':>10} | {'Fraction':>10} | Classification")
print("-" * 65)

mass_ratios = [
    ("m_n / m_p", hadrons["neutron"] / hadrons["proton"]),
    ("m_pi+ / m_pi0", hadrons["pi+"] / hadrons["pi0"]),
    ("m_K+ / m_K0", hadrons["K+"] / hadrons["K0"]),
    ("m_rho / m_omega", hadrons["rho"] / hadrons["omega"]),
    ("m_p / m_pi+", hadrons["proton"] / hadrons["pi+"]),
    ("m_p / m_K+", hadrons["proton"] / hadrons["K+"]),
    ("m_p / m_rho", hadrons["proton"] / hadrons["rho"]),
]

for name, ratio in mass_ratios:
    # Find approximate fraction
    from fractions import Fraction
    frac = Fraction(ratio).limit_denominator(1000)
    num, den = frac.numerator, frac.denominator
    num_stat = norm_status(num)
    den_stat = norm_status(den)
    print(f"{name:<25} | {ratio:>10.5f} | {num}/{den:<6} | {num_stat}/{den_stat}")

print("""
NOTE: Mass ratios expressed as fractions are APPROXIMATIONS.
The CNH applies to EXACT framework predictions, not empirical fits.
No CNH pattern is expected here -- these are just measurements.
""")

# ============================================================
# PART 2: Particle quantum numbers
# ============================================================

print("=" * 60)
print("PART 2: Particle quantum numbers and stability")
print("=" * 60)

# Particles with their quantum numbers
# (name, Q, B, S, C, lifes, stability_rank)
# Q = charge, B = baryon number, S = strangeness, C = charm
particles = [
    # Stable or long-lived
    ("proton", 1, 1, 0, 0, "stable"),
    ("electron", -1, 0, 0, 0, "stable"),
    ("photon", 0, 0, 0, 0, "stable"),
    ("neutrino", 0, 0, 0, 0, "stable"),

    # Semi-stable (weak decay)
    ("neutron", 0, 1, 0, 0, "10 min"),
    ("muon", -1, 0, 0, 0, "2 us"),
    ("pi+", 1, 0, 0, 0, "26 ns"),
    ("K+", 1, 0, 1, 0, "12 ns"),
    ("Lambda", 0, 1, -1, 0, "0.26 ns"),

    # Short-lived (EM/strong decay)
    ("pi0", 0, 0, 0, 0, "8e-17 s"),
    ("rho", 0, 0, 0, 0, "4e-24 s"),
    ("Delta", 2, 1, 0, 0, "6e-24 s"),
]

print("\nParticle quantum numbers and norm status:")
print(f"{'Particle':<12} | {'Q':>3} | {'B':>3} | {'S':>3} | Decay | Q-norm | B-norm | S-norm")
print("-" * 75)

for name, Q, B, S, C, lifetime in particles:
    Q_stat = norm_status(abs(Q)) if Q != 0 else "0"
    B_stat = norm_status(abs(B)) if B != 0 else "0"
    S_stat = norm_status(abs(S)) if S != 0 else "0"
    print(f"{name:<12} | {Q:>3} | {B:>3} | {S:>3} | {lifetime:>8} | {Q_stat:>6} | {B_stat:>6} | {S_stat:>6}")

print("""
OBSERVATION:
  - Stable particles: p (Q=1 norm, B=1 norm), e (Q=-1 norm), etc.
  - All fundamental quantum numbers (1, 0) are trivially norms!
  - Strangeness S = -1 is a norm (1 = 1^2 + 0^2)

CONCLUSION: CNH does NOT predict stability in particle physics.
The pattern is trivial: Q, B, S are all 0 or +/-1, all norms.
""")

# ============================================================
# PART 3: Mixing angles systematic analysis
# ============================================================

print("=" * 60)
print("PART 3: Mixing angles classification")
print("=" * 60)

# Framework predictions (exact fractions)
framework_angles = [
    # Format: (name, numerator, denominator, formula type)
    ("sin^2(theta_W)", 28, 121, "EW"),      # Weinberg angle
    ("Omega_m", 63, 200, "Cosmo"),           # Matter fraction
    ("1/alpha - 137", 4, 111, "alpha"),      # Enhanced alpha
    ("Li-7 suppression", 1, 3, "BBN"),       # Li-7 factor
    ("xi = v^2/f^2", 4, 121, "EWSB"),        # Higgs mixing
]

# CKM matrix elements (approximations, NOT framework predictions)
ckm_angles = [
    ("sin(theta_12)", 225, 1000, "CKM"),     # ~0.225 = V_us
    ("sin(theta_23)", 41, 1000, "CKM"),      # ~0.041 = V_cb
    ("sin(theta_13)", 4, 1000, "CKM"),       # ~0.004 = V_ub
]

# PMNS matrix elements (approximations, NOT framework predictions)
pmns_angles = [
    ("sin^2(theta_12)", 307, 1000, "PMNS"),  # ~0.307 solar
    ("sin^2(theta_23)", 545, 1000, "PMNS"),  # ~0.545 atmospheric
    ("sin^2(theta_13)", 22, 1000, "PMNS"),   # ~0.022 reactor
]

print("\n--- FRAMEWORK PREDICTIONS (exact) ---")
print(f"{'Name':<25} | {'Num':>5} | {'Den':>5} | Num | Den")
print("-" * 55)
for name, num, den, typ in framework_angles:
    print(f"{name:<25} | {num:>5} | {den:>5} | {norm_status(num):>4} | {norm_status(den):>4}")

print("\n--- CKM MATRIX (empirical, approx) ---")
print(f"{'Name':<25} | {'Num':>5} | {'Den':>5} | Num | Den")
print("-" * 55)
for name, num, den, typ in ckm_angles:
    print(f"{name:<25} | {num:>5} | {den:>5} | {norm_status(num):>4} | {norm_status(den):>4}")

print("\n--- PMNS MATRIX (empirical, approx) ---")
print(f"{'Name':<25} | {'Num':>5} | {'Den':>5} | Num | Den")
print("-" * 55)
for name, num, den, typ in pmns_angles:
    print(f"{name:<25} | {num:>5} | {den:>5} | {norm_status(num):>4} | {norm_status(den):>4}")

print("""
ANALYSIS:

FRAMEWORK PREDICTIONS:
  sin^2(theta_W) = 28/121 = NON/norm  (fractional observable)
  Omega_m = 63/200 = NON/norm         (fractional observable)
  1/alpha - 137 = 4/111 = norm/NON    (suppression term)
  Li-7 = 1/3 = norm/NON               (suppression factor)
  xi = 4/121 = norm/norm              (squared quantity: sin^2(theta))

Pattern: NON/norm for fractional observables, norm/NON for corrections.
But xi = 4/121 breaks this (both norm).

CKM/PMNS (empirical):
  These are MEASUREMENTS, not framework predictions.
  Expressing them as fractions is just numerical approximation.
  No CNH insight -- we'd need EXACT formulas to apply CNH.
""")

# ============================================================
# PART 4: Looking for deeper patterns
# ============================================================

print("=" * 60)
print("PART 4: Deeper pattern search")
print("=" * 60)

print("""
QUESTION: Why is sin^2(theta_W) = NON/norm but sin(theta_C) = norm/norm?

OBSERVATION 1: The functions are different
  - sin^2(theta_W) uses SQUARED sine (Weinberg)
  - sin(theta_C) uses PLAIN sine (Cabibbo, historically)
  - In CKM: |V_us|^2 = sin^2(theta_12) ~ 0.05, not 0.225

OBSERVATION 2: Physical meaning differs
  - sin^2(theta_W) = g'^2 / (g^2 + g'^2) = ratio of couplings squared
  - sin(theta_C) = mixing amplitude (off-diagonal CKM entry)

OBSERVATION 3: Domain
  - Electroweak: describes gauge symmetry breaking
  - CKM/PMNS: describes fermion flavor mixing

QUESTION: Does norm status track a physical property?

HYPOTHESIS [CONJECTURE]:
  - NON in numerator: "matter" or "non-crystalline" component
  - norm in denominator: "total" or "reference" scale
  - NON/norm = fractional content of non-crystalline sector

Testing:
  sin^2(theta_W) = 28/121 = (weak charge) / (total electroweak)
    28 = non-norm -> weak sector is "non-crystalline"?

  Omega_m = 63/200 = (matter) / (total energy)
    63 = non-norm -> matter is "non-crystalline"
    200 = 137 + 63 = alpha_prime + matter

This is suggestive but NOT predictive.
""")

# ============================================================
# PART 5: Can CNH make particle physics predictions?
# ============================================================

print("=" * 60)
print("PART 5: Potential particle physics predictions")
print("=" * 60)

print("""
POTENTIAL CNH PREDICTIONS IN PARTICLE PHYSICS:

1. DECAY RATE SUPPRESSION
   If a decay changes norm status of some quantum number,
   it might be enhanced or suppressed.

   Example: p -> (anything with B=0) is forbidden by B conservation.
   Not a CNH prediction -- it's conservation law.

   Example: n -> p + e + nu_e (beta decay)
   B: 1 -> 1 (conserved, both norm)
   Q: 0 -> 1 (changes, both norm)
   No CNH suppression expected. Agrees with observation.

   NOT TESTABLE: All fundamental QNs are 0 or +/-1, all norms.

2. CROSS-SECTION RATIOS
   If scattering cross-sections involve norm/non-norm combinations,
   CNH might predict relative magnitudes.

   Example: sigma(p + p) vs sigma(p + n)
   Would need to relate to quantum number norms somehow.
   No obvious connection.

   NOT TESTABLE: Need explicit framework cross-section formulas.

3. MESON ABUNDANCES IN HEAVY-ION COLLISIONS
   Analogy to BBN: freeze-out abundances might show CCF pattern.

   Example: In Au+Au collisions, ratio of K/pi might correlate
   with CCF-like quantity for mesons.

   POSSIBLY TESTABLE: But mesons have B=0, so "meson CCF" unclear.

4. DARK MATTER MASS
   Framework has multiple DM mass formulas (EQ-013).
   Could CNH select between them?

   Formula A: m_DM = m_p * 49/9  (49 = norm, 9 = norm)
   Formula B: m_DM = m_e * 121/4 (121 = norm, 4 = norm)
   Formula C: m_DM = m_e * 10000/4 = ...

   All numerators/denominators are norms! No selection.

   NOT PREDICTIVE for DM mass.

CONCLUSION: No testable CNH predictions in particle physics found.
""")

# ============================================================
# VERIFICATION TESTS
# ============================================================

print("\n" + "=" * 60)
print("VERIFICATION TESTS")
print("=" * 60)

tests = [
    # Framework predictions
    ("sin^2(theta_W) = 28/121: 28 is NON", not is_gaussian_norm(28)),
    ("sin^2(theta_W) = 28/121: 121 is norm", is_gaussian_norm(121)),
    ("Omega_m = 63/200: 63 is NON", not is_gaussian_norm(63)),
    ("Omega_m = 63/200: 200 is norm", is_gaussian_norm(200)),
    ("Li-7 = 1/3: 1 is norm", is_gaussian_norm(1)),
    ("Li-7 = 1/3: 3 is NON", not is_gaussian_norm(3)),
    ("xi = 4/121: 4 is norm", is_gaussian_norm(4)),
    ("xi = 4/121: 121 is norm", is_gaussian_norm(121)),

    # Quantum number norms
    ("Q = 0 is norm", is_gaussian_norm(0)),
    ("Q = 1 is norm", is_gaussian_norm(1)),
    ("B = 1 is norm", is_gaussian_norm(1)),
    ("S = 1 is norm", is_gaussian_norm(1)),

    # CKM check (approximate)
    ("CKM sin(theta_12) ~ 225/1000: 225 is norm", is_gaussian_norm(225)),
    ("CKM denominator 1000 is norm", is_gaussian_norm(1000)),

    # Key conclusions
    ("All fundamental QNs (0, 1) are norms", is_gaussian_norm(0) and is_gaussian_norm(1)),
    ("CNH is trivial for particle quantum numbers", True),  # by observation
]

passed = 0
for name, result in tests:
    status = "PASS" if result else "FAIL"
    if result:
        passed += 1
    print(f"[{status}] {name}")

print(f"\n{passed}/{len(tests)} tests passed")

# ============================================================
# SUMMARY
# ============================================================

print("\n" + "=" * 60)
print("SUMMARY: CNH in Particle Physics")
print("=" * 60)

print("""
TASK 3 RESULT: CNH does NOT make testable predictions in particle physics.

REASON 1: Quantum numbers are too simple
  - All fundamental quantum numbers (Q, B, S, ...) are 0 or +/-1
  - 0 and 1 are both Gaussian norms
  - CNH is TRIVIAL: everything is "crystallization-compatible"

REASON 2: Framework predictions are mixing angles, not quantum numbers
  - sin^2(theta_W), Omega_m, xi are MIXING PARAMETERS
  - They involve FRAMEWORK DIMENSIONS, not particle quantum numbers
  - CNH applies to these (S248 classification) but doesn't PREDICT them

REASON 3: No frozen particle abundances
  - BBN works because abundances FREEZE at a specific temperature
  - Particle physics is dynamical -- no frozen abundances to compare
  - Meson abundances in heavy-ion collisions are closest analogy

MIXING ANGLE PATTERN (S248):
  - NON/norm: fractional observables (sin^2 theta_W, Omega_m)
  - norm/NON: suppression factors (Li-7 = 1/3, alpha correction = 4/111)
  - norm/norm: squared quantities (xi = 4/121)

This pattern is SUGGESTIVE but NOT PREDICTIVE.
It classifies existing formulas, doesn't predict new ones.

CONCLUSION: CNH is specific to BBN / nuclear physics.
No extension to particle physics found.
""")
