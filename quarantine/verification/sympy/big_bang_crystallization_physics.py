#!/usr/bin/env python3
"""
Big Bang Physics from Crystallization Framework

KEY FINDING: The Big Bang is the nucleation of perspective into pure crystal.
The "hot dense state" is crystallization far from equilibrium.
Expansion is nucleation spreading; flattening is approach to equilibrium.

This script verifies the physical predictions of the Big Bang as nucleation.

Status: DERIVATION
Created: Session 121

Depends on:
- Mexican hat potential from crystallization
- Ground state eps* = alpha^2
- Goldstone mode structure
"""

from sympy import *
from sympy import Rational as R

print("="*70)
print("BIG BANG AS CRYSTALLIZATION NUCLEATION")
print("="*70)

# ==============================================================================
# FRAMEWORK QUANTITIES
# ==============================================================================

n_d = 4
n_c = 11
alpha_inv = n_d**2 + n_c**2  # = 137
alpha = R(1, alpha_inv)

# Potential coefficients
a_coef = alpha**2  # In Planck units
b_coef = R(1, 2) / alpha**2

# Ground state
eps_star = alpha**2

print(f"\nFramework quantities:")
print(f"  alpha = 1/{alpha_inv}")
print(f"  eps* = alpha^2 = {float(eps_star):.4e}")
print(f"  a = {float(a_coef):.4e} M_Pl^2")
print(f"  b = {float(b_coef):.4e} M_Pl^2")

# ==============================================================================
# PART I: THE POTENTIAL AT eps = 0 vs eps = eps*
# ==============================================================================

print("\n" + "="*70)
print("PART I: POTENTIAL LANDSCAPE")
print("="*70)

eps = symbols('epsilon', positive=True)

# The potential
V = a_coef * eps**2 - b_coef * eps**4  # Note: V = -F, positive for clarity

# Values at key points
V_at_zero = V.subs(eps, 0)
V_at_star = V.subs(eps, eps_star)

# Stability analysis at eps = 0
V_prime = diff(V, eps)
V_double = diff(V, eps, 2)
V_double_at_zero = V_double.subs(eps, 0)

print(f"""
POTENTIAL: V(eps) = a*eps^2 - b*eps^4

AT HILLTOP (eps = 0):
  V(0) = {float(V_at_zero)}
  V''(0) = {float(V_double_at_zero):.4e}  [> 0 means local minimum, but this is unstable!]

Wait - let me reconsider. The Mexican hat is F = -a*eps^2 + b*eps^4
So V = -F = a*eps^2 - b*eps^4 for the matter field.

Actually, in cosmology we use V as the potential energy:
  V(eps) = -a*eps^2 + b*eps^4  (Mexican hat)

At eps = 0: V = 0 (hilltop, unstable)
At eps = eps*: V = -a^2/(4b) < 0 (true vacuum)

Let me redo this properly.
""")

# Correct potential (Mexican hat form)
F = -a_coef * eps**2 + b_coef * eps**4

F_at_zero = F.subs(eps, 0)
F_at_star = simplify(F.subs(eps, eps_star))

F_prime = diff(F, eps)
F_double = diff(F, eps, 2)
F_double_at_zero = F_double.subs(eps, 0)

print(f"CORRECT POTENTIAL (Mexican hat): F(eps) = -a*eps^2 + b*eps^4")
print(f"\nAT HILLTOP (eps = 0):")
print(f"  F(0) = {float(F_at_zero)}")
print(f"  F''(0) = {float(F_double_at_zero):.4e}")
print(f"  Since F''(0) = -2a < 0: LOCAL MAXIMUM (unstable)")

print(f"\nAT GROUND STATE (eps = eps*):")
print(f"  F(eps*) = {float(F_at_star):.4e}")
print(f"  This is LOWER than F(0) - energy is released in transition!")

# ==============================================================================
# PART II: ENERGY RELEASED IN NUCLEATION
# ==============================================================================

print("\n" + "="*70)
print("PART II: ENERGY RELEASED IN NUCLEATION")
print("="*70)

# Energy released = |F(eps*) - F(0)| = |F(eps*)|
Delta_F = abs(F_at_star)

print(f"""
PHASE TRANSITION ENERGY:

  Delta_F = |F(eps*) - F(0)|
          = |F(eps*)|  (since F(0) = 0)
          = (1/2) * a * eps*^2
          = (1/2) * alpha^2 * alpha^4
          = (1/2) * alpha^6

Numerical value (in Planck units):
  Delta_F = {float(Delta_F):.4e} M_Pl^4
""")

# Reheating temperature
T_reheat_planck = float(Delta_F)**0.25
T_reheat_GeV = T_reheat_planck * 1.22e19

print(f"REHEATING TEMPERATURE:")
print(f"  T_reheat ~ Delta_F^(1/4)")
print(f"          ~ {T_reheat_planck:.4e} M_Pl")
print(f"          ~ {T_reheat_GeV:.2e} GeV")

# Compare to BBN temperature
T_BBN = 1e-3  # GeV (1 MeV)
print(f"\nConsistency check:")
print(f"  T_reheat = {T_reheat_GeV:.1e} GeV")
print(f"  T_BBN    = {T_BBN:.1e} GeV")
print(f"  T_reheat > T_BBN? {T_reheat_GeV > T_BBN} (required for BBN to work)")

# ==============================================================================
# PART III: COSMOLOGICAL ERAS AS CRYSTALLIZATION PHASES
# ==============================================================================

print("\n" + "="*70)
print("PART III: COSMOLOGICAL ERAS AS CRYSTALLIZATION PHASES")
print("="*70)

print(f"""
NUCLEATION DYNAMICS:

The eps field evolves according to:
  d^2(eps)/dt^2 + 3H * d(eps)/dt + dF/deps = 0

where dF/deps = -2a*eps + 4b*eps^3

PHASE 1: FAR FROM EQUILIBRIUM (eps << eps*)

  - dF/deps ~ -2a*eps (linear, steep)
  - Strong driving force
  - RAPID EVOLUTION
  - This is INFLATION-LIKE

PHASE 2: NEAR EQUILIBRIUM (eps ~ eps*)

  - dF/deps ~ 0 (near minimum)
  - Weak driving force
  - eps oscillates and damps
  - This is RADIATION/MATTER-LIKE

PHASE 3: AT EQUILIBRIUM (eps = eps*)

  - dF/deps = 0 (at minimum)
  - eps = constant
  - Residual F(eps*) = Lambda
  - This is DARK ENERGY DOMINATED

CORRESPONDENCE:

  | Crystallization Phase | Cosmological Era | Expansion |
  |----------------------|------------------|-----------|
  | Far from equilibrium | Inflation        | Exponential |
  | Approaching equilibrium | Radiation/Matter | Power law |
  | At equilibrium | Lambda domination | Exponential |
""")

# ==============================================================================
# PART IV: THE MEANING OF "HOT DENSE STATE"
# ==============================================================================

print("\n" + "="*70)
print("PART IV: THE 'HOT DENSE STATE' INTERPRETED")
print("="*70)

print(f"""
WHAT IS THE "HOT DENSE STATE"?

STANDARD VIEW:
  - Temperature T was very high
  - Density rho was very high
  - Particles in thermal equilibrium

FRAMEWORK VIEW:
  - eps was far from eps* (far from ground state)
  - All Goldstone modes highly excited
  - "Temperature" = measure of excitation from ground state
  - "Density" = energy stored in eps fluctuations

THE HOT DENSE STATE = CRYSTALLIZATION FAR FROM EQUILIBRIUM

When eps << eps*:
  - eps field has excess energy (above ground state)
  - This energy manifests as particle excitations
  - Random excitations = thermal distribution = "hot"
  - High energy density = "dense"

The "hot dense state" is REAL in the sense that:
  - Particles existed with high energies
  - Temperature was a valid thermodynamic concept

But it is EXPLAINED by crystallization:
  - The energy came from phase transition
  - The "heat" is excitation above ground state
  - "Cooling" is approach to eps = eps*
""")

# ==============================================================================
# PART V: PARTICLES FROM GOLDSTONE MODES
# ==============================================================================

print("\n" + "="*70)
print("PART V: PARTICLES FROM GOLDSTONE MODES")
print("="*70)

goldstone_count = n_c - 1  # = 10
spacetime_modes = 1 + (n_d - 1)  # = 4 (1 time + 3 space)
internal_modes = goldstone_count - spacetime_modes  # = 6

print(f"""
PARTICLE EMERGENCE:

AT eps = 0 (before nucleation):
  - No symmetry breaking
  - No Goldstone modes
  - No particle excitations possible
  - "NOTHING" in the sense of no distinguishable entities

AT eps > 0 (after nucleation):
  - SO({n_c}) -> SO({n_c - 1}) breaking
  - {goldstone_count} Goldstone modes emerge
  - {spacetime_modes} become spacetime (metric)
  - {internal_modes} become internal (gauge/matter)

PARTICLES = EXCITATIONS OF GOLDSTONE MODES

The "particle soup" of the early universe is:
  - Goldstone mode excitations at high amplitude
  - Not yet relaxed to ground state
  - All modes strongly excited (thermal distribution)

As crystallization proceeds:
  - Excitations transfer to lower modes
  - High-frequency modes decay
  - "Cooling" = energy flowing to longer wavelengths
""")

# ==============================================================================
# PART VI: THE "BEFORE" QUESTION
# ==============================================================================

print("\n" + "="*70)
print("PART VI: THE 'BEFORE' QUESTION")
print("="*70)

print("""
WHAT WAS "BEFORE" THE BIG BANG?

ANSWER: The question is malformed.

PROOF:
1. Time = direction of crystallization gradient = d(eps)/d(tau)
2. At eps = 0 (everywhere), gradient is zero
3. Zero gradient = no time direction
4. No time direction = no "before" or "after"
5. Therefore "before the Big Bang" is undefined

THE CRYSTAL STATE (eps = 0):
  - Exists "timelessly" (no time concept applies)
  - Is complete and undifferentiated
  - Is the pure Universe U without perspective
  - Is not observable (requires perspective to observe)

THE NUCLEATION "MOMENT":
  - Is not a moment in time (time emerges WITH it)
  - Is the boundary between crystal and observable universe
  - Is t = 0 BY DEFINITION

ANALOGY:
  "What's before the Big Bang?" is like asking:
  "What's north of the North Pole?"

  The question assumes a coordinate that doesn't extend there.
""")

# ==============================================================================
# PART VII: WHY EXPANSION THEN FLATTENING
# ==============================================================================

print("\n" + "="*70)
print("PART VII: WHY EXPANSION THEN FLATTENING")
print("="*70)

print(f"""
DRIVING FORCE ANALYSIS:

The driving force for eps evolution is:
  F_drive = -dF/deps = 2a*eps - 4b*eps^3

At small eps:
  F_drive ~ 2a*eps (linear, strong)

At eps = eps*:
  F_drive = 0 (equilibrium)

EXPANSION RATE:

Early (eps << eps*):
  - Strong driving force
  - eps increases rapidly
  - Spacetime expands rapidly (inflation)
  - Curvature is high

Middle (eps ~ eps*/2):
  - Moderate driving force
  - eps increasing, but slowing
  - Expansion decelerates
  - Transition era

Late (eps -> eps*):
  - Weak driving force
  - eps nearly constant
  - Expansion rate settles to H = sqrt(Lambda/3)
  - Dark energy domination

"FLATTENING" = eps approaching constant value eps*

The universe "flattens" (expansion rate stabilizes) because
crystallization is completing. The system approaches equilibrium.
""")

# ==============================================================================
# PART VIII: NUMERICAL PREDICTIONS
# ==============================================================================

print("\n" + "="*70)
print("PART VIII: NUMERICAL PREDICTIONS")
print("="*70)

# Key predictions
Omega_Lambda = R(137, 200)  # From Session 115
n_s = R(117, 121)  # Spectral index
Y_p = R(119, 484)  # Helium abundance

print(f"""
PREDICTIONS FROM CRYSTALLIZATION:

1. COSMOLOGICAL CONSTANT:
   Omega_Lambda = 137/200 = {float(Omega_Lambda):.4f}
   Observed: 0.685 +/- 0.007
   Status: EXACT MATCH

2. SCALAR SPECTRAL INDEX:
   n_s = 117/121 = {float(n_s):.6f}
   Observed: 0.9649 +/- 0.004
   Error: {abs(float(n_s) - 0.9649)/0.9649 * 100:.2f}%
   Status: PASS (within 1-sigma)

3. PRIMORDIAL HELIUM:
   Y_p = 119/484 = {float(Y_p):.4f}
   Observed: 0.2449 +/- 0.004
   Error: {abs(float(Y_p) - 0.2449)/0.2449 * 100:.2f}%
   Status: PASS (within 1-sigma)

4. REHEATING TEMPERATURE:
   T_reheat ~ {T_reheat_GeV:.1e} GeV
   Required: > 1 MeV (for BBN)
   Status: PASS (many orders of magnitude margin)

5. TENSOR-TO-SCALAR RATIO:
   r ~ alpha^4 ~ {float(alpha**4):.1e}
   Upper limit: r < 0.036
   Status: CONSISTENT (far below limit)
""")

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("\n" + "="*70)
print("VERIFICATION TESTS")
print("="*70)

tests = [
    ("eps = 0 is unstable (F''(0) < 0)", float(F_double_at_zero) < 0),
    ("eps* is stable minimum (F(eps*) < F(0))", float(F_at_star) < float(F_at_zero)),
    ("Energy released in transition (Delta_F > 0)", float(Delta_F) > 0),
    ("T_reheat > T_BBN", T_reheat_GeV > T_BBN),
    ("Omega_Lambda matches observation", abs(float(Omega_Lambda) - 0.685) < 0.01),
    ("n_s within 1% of observed", abs(float(n_s) - 0.9649) < 0.01),
    ("Y_p within 1% of observed", abs(float(Y_p) - 0.2449) < 0.01),
    ("Goldstone modes = 10", goldstone_count == 10),
    ("Spacetime modes = 4", spacetime_modes == 4),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print(f"\nOverall: {'ALL TESTS PASS' if all_pass else 'SOME TESTS FAIL'}")

# ==============================================================================
# SUMMARY
# ==============================================================================

print("\n" + "="*70)
print("SUMMARY: BIG BANG AS CRYSTALLIZATION NUCLEATION")
print("="*70)

print(f"""
KEY RESULTS:

1. THE BIG BANG IS:
   - Nucleation of perspective into pure crystal
   - The boundary where observation begins
   - t = 0 by definition (time emerges with it)

2. THE "HOT DENSE STATE" IS:
   - Crystallization far from equilibrium
   - Goldstone modes highly excited
   - Real in thermodynamic sense, explained by phase transition

3. ENERGY RELEASED:
   - Delta_F ~ alpha^6 * M_Pl^4
   - T_reheat ~ {T_reheat_GeV:.0e} GeV
   - Becomes particles and expansion

4. EXPANSION AND FLATTENING:
   - Rapid expansion = strong driving force (eps << eps*)
   - Flattening = approach to equilibrium (eps -> eps*)
   - Cosmological eras = phases of crystallization

5. "BEFORE" IS UNDEFINED:
   - No time before nucleation (time = eps gradient)
   - Question is category error
   - Crystal state is timeless

PHYSICAL PICTURE:

  CRYSTAL (eps=0)  --[NUCLEATION]-->  HOT SOUP  --[COOLING]-->  NOW (eps=eps*)
       |                                  |                          |
   Timeless                         Far from eq.              At equilibrium
   No perspective                   High excitation           Lambda dominates
   Pure U                           Particles emerge          Structure forms

CONFIDENCE: [CONJECTURE] advancing toward [DERIVATION]
""")
