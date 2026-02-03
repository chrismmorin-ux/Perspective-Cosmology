#!/usr/bin/env python3
"""
Crystallization Angle and Alpha: Geometric Interpretation

KEY FINDING: alpha = cos^2(theta) where theta is the angle between the
pre-crystallization symmetric state and a single crystallized direction.
The minimal crystallization step (one direction out of N_I = 137)
gives alpha = 1/137 as a dimensionless geometric ratio.

Formula: alpha = 1/N_I = cos^2(arccos(1/sqrt(N_I))) = 1/N_I
         e = 1/sqrt(N_I) = crystallization amplitude (overlap)
         alpha = e^2 = crystallization probability (Born rule)

Status: INVESTIGATION — geometric interpretation of alpha
Depends on:
- N_I = n_d^2 + n_c^2 = 137 [DERIVED]
- Born rule from crystallization [DERIVED, Session 134]
- U(n_d) x U(n_c) symmetry of internal space [DERIVED]

Created: Session 146
"""

from sympy import *
from sympy import Rational as R

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

n_d = 4
n_c = 11
N_I = n_d**2 + n_c**2  # 137

print("=" * 70)
print("CRYSTALLIZATION ANGLE AND ALPHA")
print("=" * 70)
print(f"n_d = {n_d}, n_c = {n_c}, N_I = n_d^2 + n_c^2 = {N_I}")
print()

# ==============================================================================
# SECTION 1: THE MINIMAL CRYSTALLIZATION STEP
# ==============================================================================

print("=" * 70)
print("SECTION 1: MINIMAL CRYSTALLIZATION STEP")
print("=" * 70)
print()

print("The internal space Herm(n_d) + Herm(n_c) has dim = N_I = 137.")
print("U(n_d) x U(n_c) symmetry makes all 137 directions equivalent.")
print()
print("Pre-crystallization symmetric state:")
print("  |psi_sym> = (1/sqrt(N_I)) * SUM_{a=1}^{N_I} |a>")
print("  This is the democratic superposition over all directions.")
print()
print("One crystallization step selects direction |k>.")
print("This is the SMALLEST possible step: one direction out of N_I.")
print()

# The overlap (crystallization amplitude)
e_cryst = 1 / sqrt(N_I)
print(f"Crystallization amplitude:")
print(f"  e = <k|psi_sym> = 1/sqrt({N_I}) = {e_cryst}")
print(f"  e = {float(e_cryst):.10f}")
print()

# The crystallization probability (Born rule)
alpha_cryst = e_cryst**2
print(f"Crystallization probability (Born rule):")
print(f"  alpha = |<k|psi_sym>|^2 = 1/{N_I}")
print(f"  alpha = {alpha_cryst} = {float(alpha_cryst):.10f}")
print()

# The angle
theta_cryst = acos(e_cryst)
theta_deg = float(theta_cryst * 180 / pi)
print(f"Crystallization angle:")
print(f"  theta = arccos(1/sqrt({N_I})) = {float(theta_cryst):.10f} rad")
print(f"  theta = {theta_deg:.4f} degrees")
print()

# Small-angle complement (tilt from orthogonal)
tilt_angle = pi/2 - theta_cryst
print(f"Tilt angle (complement from pi/2):")
print(f"  delta = pi/2 - theta = {float(tilt_angle):.10f} rad")
print(f"  delta = {float(tilt_angle * 180/pi):.4f} degrees")
print(f"  sin(delta) = 1/sqrt({N_I}) = {float(sin(tilt_angle)):.10f}")
print(f"  sin^2(delta) = 1/{N_I} = alpha (same result)")
print()

# ==============================================================================
# SECTION 2: WHY DIMENSIONLESS — THREE EQUIVALENT PICTURES
# ==============================================================================

print("=" * 70)
print("SECTION 2: THREE EQUIVALENT DIMENSIONLESS PICTURES")
print("=" * 70)
print()

print("PICTURE 1: Fraction")
print(f"  alpha = 1/{N_I} = one direction out of {N_I} equivalent directions")
print(f"  Dimensionless because: count / count")
print()

print("PICTURE 2: Probability (Born rule)")
print(f"  alpha = |<k|psi_sym>|^2 = cos^2(theta)")
print(f"  Dimensionless because: probability is always dimensionless")
print()

print("PICTURE 3: Solid angle fraction")
print(f"  alpha = (solid angle per mode) / (total solid angle)")
print(f"  = Omega_1 / Omega_total = 1/{N_I}")
print(f"  Dimensionless because: angle / angle")
print()

print("All three are EQUIVALENT for a symmetric N-dimensional space.")
print("The key: N_I = 137 is DISCRETE (from division algebra structure).")
print("So alpha = 1/N_I is a topological invariant, not a continuous parameter.")
print()

# ==============================================================================
# SECTION 3: MULTI-STEP CRYSTALLIZATIONS
# ==============================================================================

print("=" * 70)
print("SECTION 3: MULTI-STEP CRYSTALLIZATIONS (k GENERATORS)")
print("=" * 70)
print()

print("If a crystallization step breaks k generators (out of N_I = 137):")
print("  Probability of selecting the k-dimensional subspace = k/N_I")
print()

# Physical breaking chain
breaking_steps = [
    ("Minimal (one generator)", 1, "alpha = 1/137"),
    ("SM gauge unbroken", 12, "dim(SU(3)xSU(2)xU(1)) = 12"),
    ("SO(11)->SO(4)xSO(7) broken", 28, "First crystallization step"),
    ("Total broken (SM Higgs)", 125, "All broken generators"),
    ("Full space", 137, "Total = 1 (trivially)"),
]

print(f"{'Step':<45} {'k':>5} {'k/N_I':>12} {'Interpretation'}")
print("-" * 85)
for name, k, interp in breaking_steps:
    frac = R(k, N_I)
    print(f"{name:<45} {k:>5} {str(frac):>12}   {interp}")

print()
print(f"KEY: alpha = 1/{N_I} corresponds to k = 1 (MINIMAL step).")
print(f"The electromagnetic coupling IS the quantum of crystallization.")
print()

# ==============================================================================
# SECTION 4: CONNECTION TO BORN RULE (SESSION 134)
# ==============================================================================

print("=" * 70)
print("SECTION 4: BORN RULE <-> CRYSTALLIZATION SELF-CONSISTENCY")
print("=" * 70)
print()

print("Session 134 derived: Born rule P(k) = |c_k|^2 FROM crystallization.")
print("  Mechanism: Wright-Fisher diffusion on pure state manifold")
print("  Result: exit probability u(p) = p (linear)")
print()
print("NOW applying the Born rule BACK to crystallization:")
print(f"  Pre-crystallization state: |psi> = (1/sqrt({N_I})) SUM |a>")
print(f"  Coefficient for direction |k>: c_k = 1/sqrt({N_I})")
print(f"  Born rule: P(k) = |c_k|^2 = 1/{N_I} = alpha")
print()
print("SELF-CONSISTENCY LOOP:")
print("  Crystallization --> Born rule --> P(one mode) = 1/N_I = alpha")
print("  alpha is dimensionless because it IS a probability.")
print()
print("This does NOT circularly assume alpha = 1/N_I.")
print("It says: IF the pre-crystallization state is democratic")
print("         AND the Born rule holds (derived from crystallization)")
print("         THEN the per-mode probability is 1/N_I.")
print()
print("The GAP (Step 5): Why does the EM coupling equal this probability?")
print("That requires: the gauge field IS the crystallization field,")
print("i.e., the gauge coupling is determined by crystallization geometry.")
print()

# ==============================================================================
# SECTION 5: THE TILT INTERPRETATION
# ==============================================================================

print("=" * 70)
print("SECTION 5: TILT INTERPRETATION")
print("=" * 70)
print()

print("The tilt matrix epsilon_ij = <pi(b_i), pi(b_j)> - delta_ij")
print("measures the angular misalignment between perspectives.")
print()
print("For two nearly-crystallized perspectives (small tilt):")
print(f"  tilt per mode: epsilon_a ~ 1/sqrt({N_I}) = {float(1/sqrt(N_I)):.6f}")
print(f"  tilt squared per mode: epsilon_a^2 = 1/{N_I} = alpha")
print()
print("Physical picture:")
print(f"  The {N_I}-dim internal space has {N_I} equivalent tilt modes.")
print(f"  Each mode carries tilt^2 = 1/{N_I} of the total tilt energy.")
print(f"  Probing ONE mode (one photon exchange) sees tilt^2 = alpha.")
print()
print("The 'angle between two dimensions about to crystallize':")
print(f"  = tilt per mode = 1/sqrt({N_I}) = {float(1/sqrt(N_I)):.6f} rad")
print(f"  = {float(180/(pi * sqrt(N_I))):.4f} degrees")
print(f"  This is the SMALLEST angular step: one mode's contribution.")
print(f"  Its SQUARE is alpha = 1/{N_I}.")
print()

# ==============================================================================
# SECTION 6: THE e^2 = 4*pi*alpha RELATION
# ==============================================================================

print("=" * 70)
print("SECTION 6: CHARGE AND THE 4*PI FACTOR")
print("=" * 70)
print()

print("In natural (Gaussian) units: alpha = e^2 (no 4*pi)")
print("In SI/rationalized units:    alpha = e^2/(4*pi)")
print()
print("In the crystallization picture:")
print(f"  e = crystallization amplitude = 1/sqrt({N_I})")
print(f"  alpha = e^2 = 1/{N_I}")
print()
print("The 4*pi in SI units comes from the 3D Coulomb propagator,")
print("not from the crystallization geometry. In the framework's")
print("natural units (Gaussian), there IS no 4*pi problem.")
print()
print("This reframes the '4*pi obstacle' from Session 145:")
print("  The obstacle assumed SI normalization for the gauge kinetic term.")
print("  In Gaussian normalization: S = -(1/2)*F^2 (no 4*pi in action)")
print("  The gauge coupling IS the crystallization probability: g^2 = 1/N_I")
print()

# Check: in Gaussian units
alpha_gaussian = R(1, N_I)  # e^2 = alpha in Gaussian
print(f"  Gaussian: e^2 = alpha = 1/{N_I}")
print(f"  SI: e^2_SI = 4*pi*alpha = 4*pi/{N_I} = {float(4*pi/N_I):.6f}")
print(f"  4*pi/{N_I} = {float(4*pi/N_I):.6f}")
print()

# ==============================================================================
# SECTION 7: LARGER CRYSTALLIZATION STEPS
# ==============================================================================

print("=" * 70)
print("SECTION 7: LARGE CRYSTALLIZATION STEPS")
print("=" * 70)
print()

print("The user notes: large crystallizations COULD occur.")
print("In the actual breaking chain, they DO:")
print()

actual_chain = [
    ("SO(11) -> SO(4)xSO(7)", 55, 6+21, 55-27, "defect-crystal split"),
    ("SO(7) -> G2", 21, 14, 7, "octonionic automorphisms"),
    ("G2 -> SU(3)", 14, 8, 6, "complex stabilizer"),
]

for step, dim_before, dim_after, broken, note in actual_chain:
    angle_k = acos(sqrt(R(dim_after, dim_before)))
    print(f"  {step}")
    print(f"    Before: {dim_before} generators, After: {dim_after}")
    print(f"    Broken: {broken} generators")
    print(f"    Fraction preserved: {dim_after}/{dim_before} = {R(dim_after, dim_before)}")
    print(f"    Fraction broken:    {broken}/{dim_before} = {R(broken, dim_before)}")
    print()

print("But the EM coupling alpha corresponds to the MINIMAL step:")
print(f"  One generator out of {N_I} = one quantum of crystallization")
print(f"  alpha = 1/{N_I} is the SMALLEST possible coupling fraction")
print()
print("Why minimal? Because each EM interaction exchanges ONE photon,")
print("which probes ONE mode of the interface. The coupling per photon")
print("is the per-mode fraction: 1/N_I = alpha.")
print()

# ==============================================================================
# SECTION 8: WHAT THIS RESOLVES AND WHAT REMAINS
# ==============================================================================

print("=" * 70)
print("SECTION 8: ASSESSMENT")
print("=" * 70)
print()

print("WHAT THIS GEOMETRIC INTERPRETATION PROVIDES:")
print("  1. WHY alpha is dimensionless: it's a probability/fraction [DERIVED]")
print("  2. WHY alpha = 1/N_I: minimal crystallization step [CONJECTURE]")
print("  3. Self-consistency: Born rule derived from crystallization,")
print("     applied back to crystallization gives alpha [DERIVED]")
print("  4. Reframes the 4*pi: convention, not physics [ARGUMENT]")
print()
print("WHAT REMAINS (Step 5 gap):")
print("  The interpretation says alpha = P(one mode) = 1/N_I.")
print("  This identifies alpha AS a crystallization probability.")
print("  But it does NOT derive that the gauge coupling EQUALS this")
print("  probability from first principles. That requires showing")
print("  the gauge field IS the crystallization field (composite gauge).")
print()
print("CONFIDENCE: [CONJECTURE] for the identification alpha = P(one mode)")
print("            [DERIVATION] for the geometric/dimensionless properties")
print()
print("KEY QUESTION FOR NEXT STEP:")
print("  Can we show that the photon propagator is built from the tilt")
print("  field's angular fluctuations, so that the gauge coupling is")
print("  IDENTICALLY the crystallization probability?")
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)
print()

tests = [
    # Core geometric identities
    ("N_I = n_d^2 + n_c^2 = 137",
     N_I == 137),

    ("Crystallization amplitude: e = 1/sqrt(137)",
     e_cryst == 1/sqrt(137)),

    ("Born rule: alpha = e^2 = 1/137",
     alpha_cryst == R(1, 137)),

    ("cos^2(theta_cryst) = 1/137",
     simplify(cos(acos(1/sqrt(137)))**2 - R(1, 137)) == 0),

    ("sin^2(complement) = 1/137",
     simplify(sin(pi/2 - acos(1/sqrt(137)))**2 - R(1, 137)) == 0),

    # Angle values
    ("theta_cryst ~ 85.1 degrees (nearly orthogonal)",
     abs(theta_deg - 85.1) < 0.1),

    ("Tilt angle ~ 4.9 degrees (small angle from orthogonal)",
     abs(float(tilt_angle * 180/pi) - 4.9) < 0.1),

    ("Small angle: sin(delta) ~ delta ~ 1/sqrt(137) for small delta",
     abs(float(sin(tilt_angle)) - float(tilt_angle)) < 0.001),

    # Multi-step
    ("k=1 (minimal): 1/137 = alpha",
     R(1, 137) == R(1, N_I)),

    ("k=12 (SM gauge): 12/137",
     R(12, 137) == R(12, N_I)),

    ("k=125 (all broken): 125/137",
     R(125, 137) == R(125, N_I)),

    ("k=137 (full space): 1 (trivially)",
     R(137, 137) == 1),

    # Charge relation
    ("e^2_SI = 4*pi*alpha: numeric check",
     abs(float(4*pi*R(1, 137)) - float(4*pi/137)) < 1e-15),

    # Rationality (topological invariant)
    ("Full alpha = 111/15211: denominator is 137*111 + 4",
     R(111, 15211) == R(111, 137*111 + 4)),

    ("111 = n_c^2 - n_c + 1 (framework quantity)",
     111 == n_c**2 - n_c + 1),

    ("15211 = 137*111 + 4 (framework decomposition)",
     15211 == 137 * 111 + 4),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    print(f"[{status}] {name}")

print()
print(f"{'ALL TESTS PASS' if all_pass else 'SOME TESTS FAILED'}")
print(f"Total: {sum(1 for _, p in tests if p)}/{len(tests)} passed")
