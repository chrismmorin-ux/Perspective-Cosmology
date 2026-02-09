"""
Investigation: What Determines the Isotropy Scale (~4 TeV)?
============================================================

The framework predicts sin^2(theta_W) = dim(C)/dim(O) = 1/4.
SM running shows this value occurs at approximately 4 TeV.

Key question: Can we DERIVE this scale from the framework?

This script explores several hypotheses:
1. Relationship to Higgs VEV (v = 246 GeV)
2. Relationship to division algebra dimensions
3. Relationship to alpha = 1/137
4. Relationship to Planck scale
5. Relationship to other SM parameters

CONFIDENCE: EXPLORATION
"""

import numpy as np
from fractions import Fraction

print("=" * 70)
print("WHAT DETERMINES THE ISOTROPY SCALE?")
print("=" * 70)

# =============================================================================
# Known Values
# =============================================================================

print("\n" + "=" * 70)
print("KNOWN VALUES")
print("=" * 70)

# The isotropy scale (from running analysis)
mu_isotropy = 3680  # GeV (where sin^2(theta_W) = 0.25)

# Division algebra dimensions
dim_R = 1
dim_C = 2
dim_H = 4
dim_O = 8

# Standard Model scales
v_higgs = 246.22  # GeV (Higgs VEV)
M_Z = 91.19  # GeV
M_W = 80.38  # GeV
M_H = 125.25  # GeV (Higgs boson mass)
m_t = 172.69  # GeV (top quark mass)
M_Planck = 1.22e19  # GeV

# Coupling constants
alpha_em = 1/137.036
alpha_em_MZ = 1/127.95

print(f"\nIsotropy scale: mu = {mu_isotropy} GeV = {mu_isotropy/1000:.1f} TeV")
print(f"\nDivision algebra dimensions:")
print(f"  dim(R) = {dim_R}, dim(C) = {dim_C}, dim(H) = {dim_H}, dim(O) = {dim_O}")
print(f"\nStandard Model scales:")
print(f"  v (Higgs VEV) = {v_higgs:.2f} GeV")
print(f"  M_Z = {M_Z:.2f} GeV")
print(f"  M_W = {M_W:.2f} GeV")
print(f"  M_H = {M_H:.2f} GeV")
print(f"  m_t = {m_t:.2f} GeV")
print(f"  M_Planck = {M_Planck:.2e} GeV")

# =============================================================================
# Hypothesis 1: Relationship to Higgs VEV
# =============================================================================

print("\n" + "=" * 70)
print("HYPOTHESIS 1: RELATIONSHIP TO HIGGS VEV")
print("=" * 70)

print("\nTrying various combinations of v and division algebra dimensions:")
print()

combinations_v = [
    ("v", v_higgs, ""),
    ("2*v", 2*v_higgs, ""),
    ("4*v = dim(H)*v", dim_H * v_higgs, ""),
    ("8*v = dim(O)*v", dim_O * v_higgs, ""),
    ("16*v = dim(O)*2*v", dim_O * 2 * v_higgs, "***"),
    ("dim(O)^2 * v / dim(H)", dim_O**2 * v_higgs / dim_H, ""),
    ("(dim(C)+dim(H)+dim(O))*v", (dim_C+dim_H+dim_O) * v_higgs, ""),
    ("dim(O)^2 * v / dim(C)", dim_O**2 * v_higgs / dim_C, ""),
    ("4*pi*v", 4 * np.pi * v_higgs, ""),
    ("sqrt(dim(O)^3) * v", np.sqrt(dim_O**3) * v_higgs, ""),
]

print(f"{'Formula':<35} {'Value (GeV)':<15} {'Ratio to mu':<12} {'Match?'}")
print("-" * 70)
for formula, value, marker in combinations_v:
    ratio = value / mu_isotropy
    match = "CLOSE" if 0.9 < ratio < 1.1 else ""
    print(f"{formula:<35} {value:<15.1f} {ratio:<12.3f} {match} {marker}")

# Check the best match
best_match_v = 16 * v_higgs
print(f"\n*** BEST MATCH: 16*v = 2*dim(O)*v = {best_match_v:.1f} GeV")
print(f"    Isotropy scale: {mu_isotropy} GeV")
print(f"    Ratio: {best_match_v/mu_isotropy:.4f}")
print(f"    Error: {abs(best_match_v - mu_isotropy)/mu_isotropy * 100:.1f}%")

# =============================================================================
# Hypothesis 2: Pure Division Algebra Formula
# =============================================================================

print("\n" + "=" * 70)
print("HYPOTHESIS 2: PURE DIVISION ALGEBRA RATIOS")
print("=" * 70)

print("\nIf mu_isotropy = f(dim) * v, what is f?")
f_observed = mu_isotropy / v_higgs
print(f"\nObserved: mu/v = {f_observed:.2f}")

print("\nLooking for f in terms of division algebra dimensions:")
candidates_f = [
    ("dim(O) * 2", dim_O * 2),
    ("dim(O) + dim(H) + dim(C) + dim(R)", dim_O + dim_H + dim_C + dim_R),
    ("dim(O)^2 / dim(H)", dim_O**2 / dim_H),
    ("dim(O) * dim(C)", dim_O * dim_C),
    ("(dim(O) + dim(H)) * (dim(O) - dim(H)) / dim(C)",
     (dim_O + dim_H) * (dim_O - dim_H) / dim_C),
    ("dim(O)^2 / (dim(H) + 1)", dim_O**2 / (dim_H + 1)),
    ("sum of dims = 1+2+4+8", 1+2+4+8),
    ("dim(O) + dim(H) + dim(C)", dim_O + dim_H + dim_C),
]

print(f"\n{'Formula':<50} {'Value':<10} {'vs {:.2f}'.format(f_observed)}")
print("-" * 70)
for formula, value in candidates_f:
    match = "MATCH!" if abs(value - f_observed) < 1 else ""
    print(f"{formula:<50} {value:<10.2f} {match}")

print(f"\nClosest: dim(O) * 2 = 16, observed f = {f_observed:.2f}")
print(f"         sum(dims) = 15, observed f = {f_observed:.2f}")

# =============================================================================
# Hypothesis 3: Relationship to alpha
# =============================================================================

print("\n" + "=" * 70)
print("HYPOTHESIS 3: RELATIONSHIP TO FINE STRUCTURE CONSTANT")
print("=" * 70)

print("\nThe framework predicts alpha ~ 1/137. Could mu_isotropy involve alpha?")

combinations_alpha = [
    ("v / alpha", v_higgs / alpha_em),
    ("v / sqrt(alpha)", v_higgs / np.sqrt(alpha_em)),
    ("v * sqrt(1/alpha)", v_higgs * np.sqrt(1/alpha_em)),
    ("M_Z / alpha", M_Z / alpha_em),
    ("M_W / alpha", M_W / alpha_em),
    ("v * dim(O) / sqrt(alpha)", v_higgs * dim_O / np.sqrt(alpha_em)),
    ("M_Z * sqrt(dim(O)/alpha)", M_Z * np.sqrt(dim_O / alpha_em)),
]

print(f"\n{'Formula':<40} {'Value (GeV)':<15} {'Ratio to mu'}")
print("-" * 70)
for formula, value in combinations_alpha:
    ratio = value / mu_isotropy
    match = "CLOSE" if 0.9 < ratio < 1.1 else ""
    print(f"{formula:<40} {value:<15.1f} {ratio:<12.3f} {match}")

# =============================================================================
# Hypothesis 4: Geometric Mean of Scales
# =============================================================================

print("\n" + "=" * 70)
print("HYPOTHESIS 4: GEOMETRIC MEAN OF SCALES")
print("=" * 70)

print("\nCould mu_isotropy be a geometric mean of other scales?")

geo_means = [
    ("sqrt(v * M_Planck)", np.sqrt(v_higgs * M_Planck)),
    ("sqrt(M_Z * M_Planck)", np.sqrt(M_Z * M_Planck)),
    ("(v^2 * M_Planck)^(1/3)", (v_higgs**2 * M_Planck)**(1/3)),
    ("(v * M_Planck^2)^(1/3)", (v_higgs * M_Planck**2)**(1/3)),
    ("sqrt(m_t * 10^5 GeV)", np.sqrt(m_t * 1e5)),
    ("sqrt(v * 10^5 GeV)", np.sqrt(v_higgs * 1e5)),
]

print(f"\n{'Formula':<35} {'Value (GeV)':<15} {'Ratio to mu'}")
print("-" * 70)
for formula, value in geo_means:
    ratio = value / mu_isotropy
    match = "CLOSE" if 0.5 < ratio < 2 else ""
    print(f"{formula:<35} {value:<15.2e} {ratio:<12.3f} {match}")

# =============================================================================
# Hypothesis 5: Electroweak-Strong Transition
# =============================================================================

print("\n" + "=" * 70)
print("HYPOTHESIS 5: WHERE COUPLINGS HAVE SPECIAL RATIOS")
print("=" * 70)

print("\nAt the isotropy scale, the coupling ratios are:")
print("  alpha_2/alpha_1 = 1.80")
print("  alpha_3/alpha_2 = 2.50")

print("\nCould these ratios have geometric meaning?")
print(f"  dim(C)/dim(R) = {dim_C/dim_R} = 2")
print(f"  dim(H)/dim(C) = {dim_H/dim_C} = 2")
print(f"  dim(O)/dim(H) = {dim_O/dim_H} = 2")
print(f"  dim(O)/dim(C) = {dim_O/dim_C} = 4")

print("\nObservation: alpha_2/alpha_1 = 1.80 is close to dim(C)/dim(R) = 2")
print("             alpha_3/alpha_2 = 2.50 is close to dim(O)/dim(H) = 2")
print("             (But not exact matches)")

# =============================================================================
# Hypothesis 6: The 16 = 2*dim(O) Pattern
# =============================================================================

print("\n" + "=" * 70)
print("HYPOTHESIS 6: THE FACTOR OF 16 = 2 * dim(O)")
print("=" * 70)

print("""
The best numerical match is:

  mu_isotropy = 16 * v = 2 * dim(O) * v

Why might the factor be 2 * dim(O) = 16?

Possible interpretations:

1. DOUBLE COVER STRUCTURE
   - SU(2) is the double cover of SO(3)
   - The "2" might relate to spinor/double cover structure
   - dim(O) appears because we're in the full octonionic space
   - Total: 2 * 8 = 16

2. COMPLEXIFIED OCTONIONS
   - C tensor O has dimension 2 * 8 = 16
   - The isotropy scale might be where "complexified O" structure emerges
   - Below this, the structure "splits"

3. O x O / SYMMETRY
   - Some quotient of O x O (64 dimensions)
   - With 4-fold symmetry: 64/4 = 16

4. SPINOR DIMENSION
   - In 8D, spinors have dimension 2^(8/2) = 16
   - The isotropy scale might relate to spinor structure in O

5. SO(10) CONNECTION
   - SO(10) has the 16-dimensional spinor representation
   - This is used in GUT models
   - Could connect to framework through O structure
""")

# Calculate what v would need to be for exact match
v_required = mu_isotropy / 16
print(f"\nFor exact mu = 16*v:")
print(f"  Required v = {v_required:.2f} GeV")
print(f"  Actual v = {v_higgs:.2f} GeV")
print(f"  Difference: {abs(v_required - v_higgs)/v_higgs * 100:.1f}%")

# =============================================================================
# Hypothesis 7: Connection to Framework's Alpha Prediction
# =============================================================================

print("\n" + "=" * 70)
print("HYPOTHESIS 7: CONNECTION TO ALPHA = 1/137 PREDICTION")
print("=" * 70)

print("""
The framework predicts alpha from geometry. If alpha involves dim(O),
could the isotropy scale also?

From the alpha derivation (session notes):
  alpha ~ 1 / (n_d^2 + n_c^2) where n_d = 4, n_c = 11

  n_d^2 + n_c^2 = 16 + 121 = 137

Observation: n_d^2 = 16 = 2 * dim(O)!

Could there be a connection?
  - n_d = 4 = dim(H)
  - n_d^2 = 16 = 2 * dim(O)
  - mu_isotropy = n_d^2 * v = 16 * v
""")

n_d = 4
n_c = 11
print(f"\nFramework parameters:")
print(f"  n_d = {n_d} = dim(H)")
print(f"  n_c = {n_c}")
print(f"  n_d^2 = {n_d**2} = 2 * dim(O)")
print(f"  n_d^2 + n_c^2 = {n_d**2 + n_c**2} = 137")

mu_from_nd = n_d**2 * v_higgs
print(f"\nIf mu_isotropy = n_d^2 * v:")
print(f"  Predicted: {mu_from_nd:.1f} GeV = {mu_from_nd/1000:.2f} TeV")
print(f"  Observed:  {mu_isotropy:.1f} GeV = {mu_isotropy/1000:.2f} TeV")
print(f"  Match: {abs(mu_from_nd - mu_isotropy)/mu_isotropy * 100:.1f}% error")

# =============================================================================
# Hypothesis 8: Self-Consistency Condition
# =============================================================================

print("\n" + "=" * 70)
print("HYPOTHESIS 8: SELF-CONSISTENCY AT THE ISOTROPY SCALE")
print("=" * 70)

print("""
Perhaps the isotropy scale is where a SELF-CONSISTENCY CONDITION is satisfied.

At the isotropy scale:
  sin^2(theta_W) = dim(C)/dim(O) = 1/4

This might be where the framework's geometric structure is "most symmetric"
or "isotropic" in the division algebra sense.

Possible conditions:
  1. Equal coupling per dimension: alpha_i * dim_i = constant
  2. Some trace or determinant condition over division algebras
  3. Normalization condition on gauge charge distribution
""")

# Check equal coupling per dimension
alpha_1_iso = 0.01766  # from running analysis at 4 TeV
alpha_2_iso = 0.03180
alpha_3_iso = 0.07944

print("\nAt isotropy scale (~4 TeV):")
print(f"  alpha_1 * dim(C) = {alpha_1_iso * dim_C:.5f}")
print(f"  alpha_2 * dim(H) = {alpha_2_iso * dim_H:.5f}")
print(f"  alpha_3 * dim(O) = {alpha_3_iso * dim_O:.5f}")

print("\nNot equal, but checking other combinations...")
print(f"  alpha_1 * dim(O) = {alpha_1_iso * dim_O:.5f}")
print(f"  alpha_2 * dim(O) = {alpha_2_iso * dim_O:.5f}")
print(f"  alpha_3 * dim(O) = {alpha_3_iso * dim_O:.5f}")

# Check ratios
print(f"\n  alpha_2/alpha_1 = {alpha_2_iso/alpha_1_iso:.3f}")
print(f"  alpha_3/alpha_2 = {alpha_3_iso/alpha_2_iso:.3f}")
print(f"  alpha_3/alpha_1 = {alpha_3_iso/alpha_1_iso:.3f}")

# =============================================================================
# Summary
# =============================================================================

print("\n" + "=" * 70)
print("SUMMARY: BEST CANDIDATES FOR ISOTROPY SCALE")
print("=" * 70)

print("""
MOST PROMISING HYPOTHESIS:

  mu_isotropy = 16 * v = n_d^2 * v

  where:
    - v = 246 GeV (Higgs VEV, electroweak scale)
    - n_d = 4 = dim(H) (from framework)
    - 16 = n_d^2 = 2 * dim(O)

  This gives: mu = 16 * 246 = 3936 GeV ~ 4 TeV

  Error vs computed isotropy scale: 7%

INTERPRETATION:

  The isotropy scale is where the Higgs VEV "lives" multiplied by the
  square of the "dimensional" parameter n_d = dim(H) = 4.

  This connects THREE things:
    1. Electroweak symmetry breaking (v)
    2. Division algebra structure (n_d = dim(H))
    3. Weinberg angle geometry (sin^2 = dim(C)/dim(O))

WHAT THIS WOULD MEAN:

  If mu = n_d^2 * v is derivable from the framework, then:

    sin^2(theta_W) at M_Z = f(dim(C), dim(O), n_d, running)

  would be a COMPLETE PREDICTION with no free parameters.

REMAINING QUESTIONS:

  1. Why n_d^2 and not just n_d or dim(O)?
  2. Can we derive v (Higgs VEV) from the framework?
  3. What is the physical meaning of the n_d^2 factor?

CONFIDENCE: SPECULATION
  - Numerically suggestive (7% match)
  - Connects to existing framework parameters (n_d = 4)
  - Not yet derived from first principles
""")

print("\n" + "=" * 70)
print("SCRIPT COMPLETE")
print("=" * 70)
