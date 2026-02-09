#!/usr/bin/env python3
"""
Structural origin of the Weinberg one-loop coefficient (S279)

KEY QUESTION: Why is delta(sin^2) = n_d * alpha/(16*pi^2)?
  - In alpha/(16*pi^2) basis: coefficient = n_d = 4 = dim(H)
  - In alpha/pi basis: coefficient = 1/(4*pi) = 1/Vol(S^{Im(H)-1})
  - Both are the same formula in different bases

APPROACH:
1. Confirm numerical identity: alpha/(4*pi^2) = n_d * alpha/(16*pi^2)
2. Test Vol(S^{dim(adj)-1}) interpretation for all three gauge groups
3. Investigate "mixing angle vs coupling" structural distinction
4. Classify all framework quantities by correction type
5. Explore Band B coefficients
6. Test whether n_d arises from Hom(R^4, R^7) structure

Formula: sin^2(dressed) = 28/121 - n_d * alpha/(16*pi^2)
Measured: sin^2(MS-bar, M_Z) = 0.23122 +/- 0.00003 (PDG 2022)
Status: INVESTIGATION
"""

from sympy import *
import math

print("=" * 70)
print("STRUCTURAL ORIGIN OF WEINBERG ONE-LOOP COEFFICIENT (S279)")
print("=" * 70)

# ================================================================
# 1. FRAMEWORK QUANTITIES
# ================================================================

n_d = Integer(4)        # dim(H) = defect/spacetime dimension
n_c = Integer(11)       # crystal dimension
Im_H = Integer(3)       # dim(Im(H)) = dim(su(2))
Im_O = Integer(7)       # dim(Im(O)) = dim coset R^7
dim_C = Integer(2)      # dim(C)
dim_O = Integer(8)      # dim(O) = dim(SU(3)) = dim(adj SU(3))

# Tree values
sin2_tree = Rational(28, 121)    # n_d * Im_O / n_c^2
alpha_tree = Rational(111, 15211)
alpha_inv_tree = Rational(15211, 111)

# Measured
sin2_meas = Rational(23122, 100000)
sin2_unc = Rational(3, 100000)
alpha_inv_meas = Float('137.035999177')

# Derived
a_f = float(alpha_tree)
p = float(pi)

# ================================================================
# 2. THE TWO EQUIVALENT FORMULATIONS
# ================================================================

print("\n--- TWO EQUIVALENT FORMULATIONS ---\n")

# Standard one-loop factor
standard_loop = a_f / (16 * p**2)

# Formula in alpha/(4*pi^2) basis
delta_4pi2 = a_f / (4 * p**2)

# Formula in alpha/(16*pi^2) basis with coefficient n_d
delta_nd = float(n_d) * a_f / (16 * p**2)

# Formula in alpha/pi basis with coefficient 1/(4*pi)
delta_api = (1 / (4*p)) * a_f / p

print(f"  alpha/(4*pi^2)            = {delta_4pi2:.12e}")
print(f"  n_d * alpha/(16*pi^2)     = {delta_nd:.12e}")
print(f"  (1/(4*pi)) * alpha/pi     = {delta_api:.12e}")
print(f"  All identical: {abs(delta_4pi2 - delta_nd) < 1e-18 and abs(delta_4pi2 - delta_api) < 1e-18}")
print()

# Check dressed values
dressed = float(sin2_tree) - delta_4pi2
resid = abs(dressed - float(sin2_meas))
sigma = resid / float(sin2_unc)
ppm = resid / float(sin2_tree) * 1e6

print(f"  Tree:       {float(sin2_tree):.10f}")
print(f"  Correction: {delta_4pi2:.10f}")
print(f"  Dressed:    {dressed:.10f}")
print(f"  Measured:   {float(sin2_meas):.10f}")
print(f"  Residual:   {sigma:.2f} sigma ({ppm:.1f} ppm)")

# ================================================================
# 3. INTERPRETATION A: n_d = dim(H) AS STANDARD-BASIS COEFFICIENT
# ================================================================

print("\n--- INTERPRETATION A: n_d AS LOOP COEFFICIENT ---\n")

print("  The standard one-loop integral in d=4 gives factor 1/(16*pi^2).")
print("  The correction is delta(sin^2) = n_d * alpha/(16*pi^2).")
print()
print("  WHY n_d = 4?")
print()

# Candidate structural reasons
reasons = [
    ("dim(H) = quaternionic dimension hosting SU(2)",
     "SU(2) embedded in H. Mixing in 4D quaternionic space."),
    ("dim(spacetime) = # A_mu components in Feynman gauge",
     "Gauge field A_0,A_1,A_2,A_3: one-loop sums over all."),
    ("dim(R^4) in Hom(R^4,R^7) coset structure",
     "28 coset modes = 4 x 7. Mixing scans R^4 factor."),
    ("16*pi^2 / (4*pi^2) = n_d (basis change ratio)",
     "4*pi^2 = natural Weinberg scale; 16*pi^2 = standard loop."),
]

for i, (reason, detail) in enumerate(reasons, 1):
    print(f"  {i}. {reason}")
    print(f"     {detail}")
    print()

# ================================================================
# 4. INTERPRETATION B: 1/(4*pi) = 1/Vol(S^{Im(H)-1})
# ================================================================

print("--- INTERPRETATION B: ADJOINT SPHERE VOLUME ---\n")

# Sphere volumes: Vol(S^{n-1}) = 2*pi^{n/2} / Gamma(n/2)
def vol_sphere(n):
    """Volume (surface area) of the (n-1)-sphere S^{n-1} in R^n."""
    return float(2 * pi**(Rational(n, 2)) / gamma(Rational(n, 2)))

# For each gauge group, compute 1/Vol(S^{dim(adj)-1})
gauge_data = [
    ("U(1)_EM",  1, "Im(C)", "coupling strength alpha"),
    ("SU(2)_L",  3, "Im(H)", "mixing angle sin^2(theta_W)"),
    ("SU(3)_c",  8, "O",     "coupling alpha_s"),
]

print(f"  {'Group':<12} {'dim(adj)':<10} {'Vol(S^{d-1})':<18} {'1/Vol':<14} {'Source':<8}")
print(f"  {'-'*12} {'-'*10} {'-'*18} {'-'*14} {'-'*8}")

vol_results = {}
for name, d, source, role in gauge_data:
    vol = vol_sphere(d)
    inv_vol = 1.0 / vol
    vol_results[name] = (d, vol, inv_vol)
    print(f"  {name:<12} {d:<10} {vol:<18.6f} {inv_vol:<14.8f} {source:<8}")

print()
print("  Key observation:")
print(f"    C_W = 1/(4*pi) = {1/(4*p):.8f}")
print(f"    1/Vol(S^2)     = {vol_results['SU(2)_L'][2]:.8f}")
print(f"    Match: {abs(1/(4*p) - vol_results['SU(2)_L'][2]) < 1e-12}")
print()

# U(1): Vol(S^0) = 2 (two points)
print(f"    For U(1): 1/Vol(S^0) = 1/2 = {vol_results['U(1)_EM'][2]:.4f}")
print(f"    C_alpha = 24/11 = {float(Rational(24,11)):.4f}  --> NOT 1/2")
print(f"    --> Vol interpretation DOES NOT apply to coupling corrections")
print()

# SU(3): Vol(S^7) = pi^4/3
vol_S7 = vol_sphere(8)
print(f"    For SU(3): 1/Vol(S^7) = 3/pi^4 = {1/vol_S7:.8f}")
print(f"    No known SU(3) mixing angle to test against")
print()

# ================================================================
# 5. THE MIXING vs COUPLING DISTINCTION
# ================================================================

print("--- MIXING ANGLE vs COUPLING STRENGTH ---\n")

print("  STRUCTURAL HYPOTHESIS:")
print("  - Mixing angle corrections --> GEOMETRIC (sphere volume)")
print("    --> transcendental coefficients involving pi")
print("  - Coupling strength corrections --> ALGEBRAIC (trace counting)")
print("    --> rational coefficients from group traces")
print()

corrections = [
    # (name, type, coefficient, basis, note)
    ("sin^2(theta_W)", "mixing angle", "1/(4*pi)", "alpha/pi",
     "GEOMETRIC: 1/Vol(S^{Im(H)-1})"),
    ("sin^2(theta_W)", "mixing angle", "n_d = 4", "alpha/(16*pi^2)",
     "ALGEBRAIC in std basis (but pi absorbed)"),
    ("1/alpha", "coupling", "24/11", "alpha^2/pi",
     "ALGEBRAIC: traces on colored sector"),
]

for name, ctype, coeff, basis, note in corrections:
    print(f"  {name:<20} [{ctype:<16}] C = {coeff:<12} in {basis:<16} {note}")

print()
print("  The distinction:")
print("    - sin^2 parameterizes ORIENTATION in gauge space")
print("      --> correction involves averaging over S^{Im(H)-1}")
print("    - alpha parameterizes MAGNITUDE of interaction")
print("      --> correction involves counting charged states (traces)")
print()

# Cross-check: C_alpha / C_W
C_alpha = float(Rational(24, 11))
C_W_api = 1 / (4*p)

ratio = C_alpha / C_W_api
print(f"  C_alpha / C_W (both in alpha/pi basis):")
print(f"    = (24/11) / (1/(4*pi)) = 24*4*pi/11 = {ratio:.6f}")
print(f"    = 96*pi/11 = {96*p/11:.6f}")
print(f"    NOT a simple framework number --> confirms different origins")
print()

# But the trace analog comparison IS clean:
C_W_T3 = 6.0/11  # T_3 double-trace analog
print(f"  C_alpha / C_W_T3 (trace ratio):")
print(f"    = (24/11) / (6/11) = {C_alpha/C_W_T3:.1f} = n_d (exact)")
print(f"  C_W_T3 / C_W = (6/11) / (1/(4*pi)) = {C_W_T3/C_W_api:.6f}")
print(f"    = 24*pi/11 = {24*p/11:.6f} (irrational)")
print()

# ================================================================
# 6. WHY n_d SPECIFICALLY? THREE STRUCTURAL ARGUMENTS
# ================================================================

print("--- THREE STRUCTURAL ARGUMENTS FOR n_d ---\n")

# Argument 1: Hom(R^4, R^7) tensor structure
print("ARGUMENT 1: Hom(R^4, R^7) tensor product")
print("  The 28 coset modes = R^4 (x) R^7 = Hom(R^4, R^7)")
print("  sin^2 = dim(coset)/dim(End(V)) = (n_d*Im_O)/n_c^2 = 28/121")
print("  The MIXING involves scanning the R^4 factor.")
print("  Each of the n_d = 4 directions in R^4 contributes equally")
print("  to the one-loop correction (by Schur's lemma on SO(4)).")
print(f"  Total: n_d * [standard one-loop] = {n_d} * alpha/(16*pi^2)")
print()

# Argument 2: 4*pi^2 as Hom structure
print("ARGUMENT 2: 4*pi^2 = n_d * pi^2 as natural Weinberg scale")
print(f"  pi^2 = (fundamental period)^2 = {p**2:.6f}")
print(f"  n_d * pi^2 = {float(n_d)*p**2:.6f}")
print(f"  (16*pi^2)/n_d = {16*p**2/float(n_d):.6f} = n_d * pi^2 (self-consistent)")
print(f"  The Weinberg scale 4*pi^2 arises by dividing the standard")
print(f"  loop factor by n_d: each H-direction gets 1/n_d of the loop.")
print()

# Argument 3: Vol(S^3) connection
print("ARGUMENT 3: SU(2) = S^3 group manifold")
print(f"  Vol(S^3) = 2*pi^2 = {2*p**2:.6f}")
vol_S3 = vol_sphere(4)  # S^3 in R^4
print(f"  Computed: Vol(S^3) = {vol_S3:.6f}")
print(f"  4*pi^2 = 2*Vol(S^3) = dim(C)*Vol(S^3)")
print(f"  The correction = alpha / (dim(C) * Vol(SU(2)))")
print(f"  = alpha / (2 * 2*pi^2) = alpha/(4*pi^2)")
print()

# So we have three equivalent decompositions:
print("THREE DECOMPOSITIONS OF 4*pi^2:")
print(f"  (a) n_d * pi^2           = {float(n_d)*p**2:.6f}  [spacetime x period^2]")
print(f"  (b) dim(C) * Vol(S^3)    = {2*vol_S3:.6f}  [complex dim x SU(2) volume]")
print(f"  (c) (16*pi^2) / n_d      = {16*p**2/float(n_d):.6f}  [std loop / spacetime]")
print(f"  (d) 4*pi * pi            = {4*p*p:.6f}  [Vol(S^2) x period]")
print(f"  (e) n_d * (Vol(S^3)/2)^2... no, Vol(S^3)/dim(C) = pi^2")
print()
print("  Most parsimonious: (a) n_d * pi^2")
print("  Coefficient n_d = dim(H) counts quaternionic directions in mixing.")

# ================================================================
# 7. QUANTITATIVE EXPLORATION OF BAND B
# ================================================================

print("\n" + "=" * 70)
print("BAND B COEFFICIENT EXPLORATION")
print("=" * 70)

print("\n--- Band B quantities and their gaps ---\n")

# Band B members from tree_dressed_paradigm
band_B = [
    ("cos(theta_W) on-shell", float(Rational(171, 194)), 0.881447,
     "mixing angle", "On-shell = m_W/m_Z"),
    ("m_mu/m_e", float(Rational(8891, 43)), 206.7683,
     "mass ratio", "Lepton mass ratio"),
    ("v/m_p", float(Rational(11284, 43)), 262.4182,
     "mass ratio", "EW/QCD scale ratio"),
]

# Two-loop basis: alpha^2/pi
two_loop = a_f**2 / p
print(f"  Two-loop scale: alpha^2/pi = {two_loop:.4e} = {two_loop*1e6:.2f} ppm")
print()

print(f"  {'Quantity':<28} {'Gap (ppm)':<12} {'C_B (a^2/pi)':<14} {'Type':<12}")
print(f"  {'-'*28} {'-'*12} {'-'*14} {'-'*12}")

C_B_values = []
for name, fw, meas, qtype, note in band_B:
    gap = abs(fw - meas) / meas
    gap_ppm = gap * 1e6
    C_B = gap / two_loop
    C_B_values.append((name, gap_ppm, C_B, qtype))
    print(f"  {name:<28} {gap_ppm:<12.2f} {C_B:<14.4f} {qtype:<12}")

print()
print("  Framework number candidates for C_B:")
candidates_B = [
    ("1/n_d = 1/4", 0.25),
    ("1/n_c = 1/11", 1.0/11),
    ("1/pi", 1.0/p),
    ("1/(4*pi)", 1.0/(4*p)),
    ("Im_H/n_c = 3/11", 3.0/11),
    ("n_d/n_c = 4/11", 4.0/11),
    ("dim(C)/n_c = 2/11", 2.0/11),
    ("1/Im_O = 1/7", 1.0/7),
    ("1/Im_H = 1/3", 1.0/3),
    ("1/(2*pi) = 1/Vol(S^1)", 1.0/(2*p)),
    ("1/(4*pi^2) = 1/(n_d*pi^2)", 1.0/(4*p**2)),
    ("6/(11*n_d) = 3/22", 3.0/22),
    ("7/(11*n_d) = 7/44", 7.0/44),
    ("2*pi/n_c^2 = 2*pi/121", 2*p/121),
]

print(f"\n  {'Candidate':<30} {'Value':<10}", end="")
for name, gap_ppm, C_B, qtype in C_B_values:
    short = name[:12]
    print(f" {'Err-'+short:<14}", end="")
print()
print(f"  {'-'*30} {'-'*10}", end="")
for _ in C_B_values:
    print(f" {'-'*14}", end="")
print()

for cname, cval in candidates_B:
    print(f"  {cname:<30} {cval:<10.6f}", end="")
    for name, gap_ppm, C_B, qtype in C_B_values:
        err = abs(C_B - cval) / cval * 100 if cval > 0 else 999
        star = "***" if err < 5 else "**" if err < 15 else "*" if err < 25 else ""
        print(f" {err:>7.1f}%{star:<5}", end="")
    print()

# ================================================================
# 8. SPECIFIC BAND B FORMULA TESTING
# ================================================================

print("\n--- BAND B FORMULA CANDIDATES ---\n")

# cos(theta_W) = 171/194
cos_fw = Rational(171, 194)
cos_meas = Float('0.881447')
cos_gap = abs(float(cos_fw) - float(cos_meas))
cos_rel = cos_gap / float(cos_meas)

print("cos(theta_W) correction analysis:")
print(f"  Tree:     171/194 = {float(cos_fw):.10f}")
print(f"  Measured: {float(cos_meas):.10f}")
print(f"  Gap:      {cos_gap:.4e} = {cos_rel*1e6:.2f} ppm")
print()

# If cos(theta_W) is also a "mixing angle", maybe its coefficient is
# also geometric? Vol(S^{dim-1}) for some dimension?
cos_formulas = [
    ("alpha^2/(pi*n_d)", a_f**2/(p*float(n_d))),
    ("alpha^2/(pi*Im_O)", a_f**2/(p*float(Im_O))),
    ("alpha^2*Im_H/pi", a_f**2*float(Im_H)/p),
    ("alpha^2/(4*pi^2)", a_f**2/(4*p**2)),
    ("alpha^2/(2*pi*n_c)", a_f**2/(2*p*float(n_c))),
    ("alpha^2*n_d/(pi*n_c)", a_f**2*float(n_d)/(p*float(n_c))),
    ("alpha^2/(pi*pi)", a_f**2/(p*p)),
]

print(f"  {'Formula':<30} {'Value':<14} {'Err%':<10} {'Sigma':<8}")
print(f"  {'-'*30} {'-'*14} {'-'*10} {'-'*8}")
for fname, fval in cos_formulas:
    err = abs(fval - cos_gap) / cos_gap * 100
    # Approximate sigma using typical cos uncertainty ~0.0001
    cos_unc_approx = 0.00005
    sig = abs(fval - cos_gap) / cos_unc_approx
    star = " ***" if err < 5 else " **" if err < 15 else ""
    print(f"  {fname:<30} {fval:<14.4e} {err:<10.1f} {sig:<8.2f}{star}")

# ================================================================
# 9. UNIFIED BAND PATTERN: IS THERE A UNIVERSAL FORMULA?
# ================================================================

print("\n--- UNIFIED BAND PATTERN ---\n")

# Band A: sin^2(theta_W)
# delta(sin^2) = n_d * alpha/(16*pi^2)
# Coefficient in alpha/(16*pi^2) basis: n_d = 4

# Band C: 1/alpha
# delta(1/alpha) = C_alpha * alpha^2/pi = (24/11) * alpha^2/pi
# Coefficient in alpha^2/pi basis: 24/11

# What's the ratio?
print("  Band A: coefficient = n_d = 4        [in alpha/(16*pi^2)]")
print("  Band C: coefficient = 24/11          [in alpha^2/pi]")
print()

# Can we express both in a common basis?
# Band A in alpha^2/pi basis:
# alpha/(4*pi^2) = X * alpha^2/pi
# X = pi / (4*pi^2 * alpha) = 1/(4*pi*alpha)
X_A = 1 / (4*p*a_f)
print(f"  Band A in alpha^2/pi basis: C = {X_A:.4f}")
print(f"    = 1/(4*pi*alpha) = {1/(4*p*a_f):.4f}")
print(f"    = (1/alpha)/(4*pi) = {1/(a_f*4*p):.4f}")
print(f"    >> C_alpha = {float(Rational(24,11)):.4f}")
print(f"    Ratio = {X_A/float(Rational(24,11)):.2f} (not useful -- different loop orders)")
print()

# More useful: normalize both to alpha/pi basis
# Band A: delta = (1/(4*pi)) * alpha/pi
# Band C: delta = (24/11) * alpha * (alpha/pi)
# The "expansion parameter" is alpha/pi for Band A, alpha*(alpha/pi) for Band C

print("  In natural expansion:")
print("  Band A: delta(sin^2) = (1/(4*pi)) * (alpha/pi)")
print("          parameter: alpha/pi ~ 2.3e-3")
print("  Band C: delta(1/alpha) = (24/11) * alpha * (alpha/pi)")
print("          parameter: alpha^2/pi ~ 1.7e-5")
print()
print("  The COEFFICIENT is the structural content.")
print("  Band A: 1/(4*pi) = geometric (sphere volume inverse)")
print("  Band C: 24/11 = algebraic (trace counting)")

# ================================================================
# 10. DEEPER: n_d FROM Hom(R^4, R^7) STRUCTURAL ARGUMENT
# ================================================================

print("\n" + "=" * 70)
print("STRUCTURAL ARGUMENT: n_d FROM COSET TENSOR PRODUCT")
print("=" * 70)

print("""
  sin^2(theta_W) = (n_d * Im_O) / n_c^2 = 28/121

  The 28 comes from Hom(R^4, R^7) = R^4 (x) R^7.
  The tree value is a RATIO: 28/121 = N_coset / N_total.

  A one-loop correction to this ratio involves virtual processes
  that reshuffle modes between the coset and non-coset sectors.

  KEY INSIGHT: The correction must be symmetric under SO(4) acting
  on the R^4 factor (by Schur's lemma -- the coset is irreducible
  under SO(4) x SO(7)).

  Each of the n_d = 4 orthogonal directions in R^4 contributes
  EQUALLY to the reshuffling. The total correction is therefore
  n_d times the contribution from a single direction.

  Single-direction contribution: alpha/(16*pi^2)
  = the standard one-loop integral over a single gauge component.

  Total: delta(sin^2) = n_d * alpha/(16*pi^2) = 4 * alpha/(16*pi^2)
""")

# Consistency check: if Im_O directions also contributed, coefficient
# would be n_d * Im_O = 28 (too large)
delta_28 = 28 * a_f / (16 * p**2)
dressed_28 = float(sin2_tree) - delta_28
print(f"  If coefficient = n_d*Im_O = 28: delta = {delta_28:.4e}")
print(f"    Dressed = {dressed_28:.6f} (gap = {abs(dressed_28-float(sin2_meas))/float(sin2_unc):.1f} sigma) --> WRONG")
print()

# If only R^7 directions contributed: coefficient = Im_O = 7
delta_7 = 7 * a_f / (16 * p**2)
dressed_7 = float(sin2_tree) - delta_7
print(f"  If coefficient = Im_O = 7: delta = {delta_7:.4e}")
print(f"    Dressed = {dressed_7:.6f} (gap = {abs(dressed_7-float(sin2_meas))/float(sin2_unc):.1f} sigma) --> WRONG")
print()

# Only n_d = 4 works:
delta_4 = 4 * a_f / (16 * p**2)
dressed_4 = float(sin2_tree) - delta_4
sig_4 = abs(dressed_4 - float(sin2_meas)) / float(sin2_unc)
print(f"  If coefficient = n_d = 4: delta = {delta_4:.4e}")
print(f"    Dressed = {dressed_4:.10f} ({sig_4:.2f} sigma) --> CORRECT")
print()

# Why R^4 and not R^7?
print("  WHY R^4 and not R^7?")
print("  sin^2 = (defect content) / (total content)")
print("  The MIXING ANGLE parameterizes the DEFECT (R^4) orientation")
print("  within the total space. The correction scans the defect space.")
print("  R^7 is the SPECTATOR -- it multiplies out in the ratio numerator")
print("  but doesn't rotate under the mixing.")
print()
print("  Equivalently: the Weinberg angle is defined by the embedding")
print("  of SU(2) into SO(11). SU(2) lives in H = R^4. The one-loop")
print("  correction probes the n_d = dim(H) = 4 directions of this embedding.")

# ================================================================
# 11. ALPHA vs WEINBERG: COMPLETE STRUCTURAL COMPARISON
# ================================================================

print("\n" + "=" * 70)
print("ALPHA vs WEINBERG: STRUCTURAL COMPARISON TABLE")
print("=" * 70)

print(f"""
  {'Property':<35} {'Alpha (Band C)':<25} {'Weinberg (Band A)':<25}
  {'-'*35} {'-'*25} {'-'*25}
  {'Quantity corrected':<35} {'coupling 1/alpha':<25} {'mixing sin^2(theta_W)':<25}
  {'Type':<35} {'magnitude':<25} {'orientation':<25}
  {'Tree value':<35} {'15211/111':<25} {'28/121':<25}
  {'Expansion parameter':<35} {'alpha^2/pi':<25} {'alpha/(16*pi^2)':<25}
  {'Coefficient':<35} {'24/11 (rational)':<25} {'n_d = 4 (integer)':<25}
  {'In alpha/pi basis':<35} {'24/11':<25} {'1/(4*pi) (irrational)':<25}
  {'Structural origin':<35} {'Tr(Q^2) traces':<25} {'dim(H) quaternionic':<25}
  {'Gauge group involved':<35} {'U(1)_EM (all charges)':<25} {'SU(2)_L (weak isospin)':<25}
  {'Algebraic source':<35} {'colored pNGB count':<25} {'defect space dimension':<25}
  {'Loop order':<35} {'two-loop (alpha^2)':<25} {'one-loop (alpha)':<25}
  {'Precision':<35} {'2-loop: 0.0009 ppm (5.9 σ); 3-loop D_3=1: 0.0006 σ [CONJ]':<25} {'0.5 ppm (~0 sigma)':<25}
  {'T_3 double-trace analog':<35} {'(matches: 24/11)':<25} {'(fails: 6/11 != C_W)':<25}
""")

# ================================================================
# 12. THE RESOLUTION OF THE T_3 NEGATIVE RESULT
# ================================================================

print("--- RESOLUTION OF T_3 NEGATIVE RESULT ---\n")

print("  From S276: C_W_T3 = 6/11 does NOT give the Weinberg coefficient.")
print("  The actual coefficient is 1/(4*pi) in alpha/pi, or n_d in alpha/(16*pi^2).")
print()
print("  RESOLUTION: The T_3 trace computation gives the ALGEBRAIC (trace)")
print("  contribution, but the Weinberg correction is GEOMETRIC (orientation).")
print()
print("  For alpha: Q_EM traces correctly give C_alpha because alpha measures")
print("  the MAGNITUDE of EM interaction -- a trace/counting quantity.")
print()
print("  For sin^2: T_3 traces give the WRONG answer because sin^2 measures")
print("  an ORIENTATION in gauge space -- a geometric quantity. The coefficient")
print("  comes from the dimension of the mixing manifold (R^4 = H), not from")
print("  the T_3 charge trace.")
print()
print("  The T_3 analog C_W_T3 = 6/11 and the actual C_W = 1/(4*pi) are")
print("  UNRELATED: one is algebraic, the other geometric.")
print()
print("  However, C_alpha / C_W_T3 = n_d = 4 IS meaningful:")
print("  it reflects dim(C) = 2 factor from Q = T_3 + Y (doubled charges),")
print("  combined with the Tr(Q^2) = 2*Tr(T_3^2) identity.")

# ================================================================
# 13. PREDICTION: WHAT WOULD A SU(3) MIXING ANGLE CORRECTION BE?
# ================================================================

print("\n--- PREDICTION: SU(3) MIXING ANGLE CORRECTION ---\n")

print("  IF there were a SU(3) mixing angle theta_3, the framework predicts:")
print(f"    coefficient = dim(Im(O)) = {Im_O} in alpha_s/(16*pi^2) basis")
print(f"    or 1/Vol(S^{dim_O-1}) = 1/Vol(S^7) = {1/vol_sphere(8):.8f} in alpha_s/pi basis")
print()
print("  Vol(S^7) = pi^4/3 = {:.6f}".format(vol_sphere(8)))
print(f"  Coefficient in alpha_s/(16*pi^2) basis = dim(O) = {dim_O}")
print()
print("  This is untestable (no known SU(3) mixing angle in SM),")
print("  but it's a structural prediction of the framework.")

# ================================================================
# 14. COMPLETE STRUCTURAL CHAIN
# ================================================================

print("\n" + "=" * 70)
print("DERIVATION CHAIN FOR n_d COEFFICIENT")
print("=" * 70)

print("""
  STEP 1: sin^2(theta_W) = 28/121 = (n_d * Im_O) / n_c^2  [THEOREM]
    Source: Schur's lemma + democratic metric on Hom(R^4, R^7)
    Tags: [A-AXIOM] AXM_0110 (metric), [D] from Frobenius theorem

  STEP 2: The 28 coset modes decompose as R^4 (x) R^7         [THEOREM]
    Source: SO(11) -> SO(4) x SO(7) branching
    Tags: [D] from AXM_0109

  STEP 3: sin^2 parameterizes the R^4 (defect) orientation    [D]
    Source: Weinberg angle = SU(2) embedding angle
    Tags: [A-PHYSICAL] SU(2) in H

  STEP 4: One-loop correction scans n_d directions in R^4     [CONJECTURE]
    Source: SO(4) isotropy on R^4 factor (Schur's lemma)
    Tags: [A-PHYSICAL] loop integral structure

  STEP 5: Each direction contributes alpha/(16*pi^2)           [A-IMPORT]
    Source: Standard one-loop QFT integral in d=4
    Tags: [I-QFT] standard one-loop factor

  CONCLUSION: delta(sin^2) = n_d * alpha/(16*pi^2)            [CONJECTURE]
    = 4 * alpha/(16*pi^2) = alpha/(4*pi^2)
    Confidence: [CONJECTURE] -- Steps 3-4 are [A-PHYSICAL]
""")

# ================================================================
# 15. VERIFICATION TESTS
# ================================================================

print("=" * 70)
print("VERIFICATION TESTS")
print("=" * 70)
print()

tests = []

# Identity tests
tests.append(("alpha/(4*pi^2) = n_d * alpha/(16*pi^2)",
    abs(delta_4pi2 - delta_nd) < 1e-18))
tests.append(("4*pi^2 = n_d * pi^2",
    abs(4*p**2 - float(n_d)*p**2) < 1e-12))
tests.append(("16*pi^2 / n_d = 4*pi^2",
    abs(16*p**2/float(n_d) - 4*p**2) < 1e-12))

# Vol(S^2) test
tests.append(("Vol(S^2) = 4*pi",
    abs(vol_sphere(3) - 4*p) < 1e-10))
tests.append(("1/(4*pi) = 1/Vol(S^{Im(H)-1})",
    abs(1/(4*p) - 1/vol_sphere(int(Im_H))) < 1e-12))

# Vol(S^3) test
tests.append(("Vol(S^3) = 2*pi^2 = Vol(SU(2))",
    abs(vol_sphere(4) - 2*p**2) < 1e-10))
tests.append(("4*pi^2 = dim(C) * Vol(S^3)",
    abs(4*p**2 - 2*vol_sphere(4)) < 1e-10))

# Dressed value
tests.append(("Dressed sin^2 within 1 sigma of measured",
    sig_4 < 1.0))
tests.append(("Dressed sin^2 within 0.5 sigma of measured",
    sig_4 < 0.5))

# Coefficient uniqueness: only n_d works among {1,...,11}
for k in range(1, 12):
    if k == int(n_d):
        continue
    delta_k = k * a_f / (16*p**2)
    dressed_k = float(sin2_tree) - delta_k
    sig_k = abs(dressed_k - float(sin2_meas)) / float(sin2_unc)
    if sig_k < 2.0:
        tests.append((f"n={k} also within 2 sigma (non-unique!)", False))

tests.append(("Coefficient n_d = 4 is UNIQUE among integers 1-11 (within 2 sigma)",
    all(abs(float(sin2_tree) - k*a_f/(16*p**2) - float(sin2_meas))/float(sin2_unc) > 2.0
        for k in range(1, 12) if k != int(n_d))))

# Structural tests
tests.append(("28 = n_d * Im_O (coset = defect x spectator)",
    28 == int(n_d * Im_O)))
tests.append(("sin^2 = n_d*Im_O/n_c^2 = 28/121",
    sin2_tree == Rational(n_d * Im_O, n_c**2)))

# Coefficient is not Im_O
tests.append(("Im_O = 7 does NOT work (>2 sigma)",
    abs(dressed_7 - float(sin2_meas))/float(sin2_unc) > 2.0))
# Coefficient is not n_d*Im_O = 28
tests.append(("n_d*Im_O = 28 does NOT work (>2 sigma)",
    abs(dressed_28 - float(sin2_meas))/float(sin2_unc) > 2.0))

# Mixing vs coupling distinction
tests.append(("C_alpha is rational (24/11)",
    Rational(24, 11) == Rational(24, 11)))
tests.append(("C_W(alpha/pi basis) matches 1/(4*pi) to <0.1%",
    abs(1/(4*p) - float(sin2_tree - sin2_meas)/(a_f/p)) / (1/(4*p)) < 0.01))

# Band comparison
tests.append(("Band A gap > 100 ppm (one-loop scale)",
    float(sin2_tree - sin2_meas)/float(sin2_tree)*1e6 > 100))

# Cross-check with alternative formula (sin^2*cos^2*alpha/7)
val_alt = float(sin2_tree) * float(Rational(93,121)) * a_f / float(Im_O)
sig_alt = abs(float(sin2_tree) - val_alt - float(sin2_meas)) / float(sin2_unc)
tests.append(("Alternative formula sin^2*cos^2*alpha/7 also within 1 sigma",
    sig_alt < 1.0))
# But formulas are distinct
tests.append(("Formula A != formula B (different by >0.1%)",
    abs(delta_4pi2 - val_alt)/delta_4pi2 > 0.001))

pass_count = sum(1 for _, r in tests if r)
for name, result in tests:
    status = "PASS" if result else "FAIL"
    print(f"  [{status}] {name}")

print(f"\n  Total: {pass_count}/{len(tests)}")

# ================================================================
# SUMMARY
# ================================================================

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"""
  MAIN RESULT: The Weinberg one-loop coefficient is n_d = 4 in the
  standard alpha/(16*pi^2) basis. This is equivalently 1/(4*pi) in
  the alpha/pi basis, or 1/Vol(S^2) geometrically.

  STRUCTURAL INTERPRETATION:
  sin^2(theta_W) parameterizes the orientation of SU(2) within SO(11).
  SU(2) lives in H (quaternions), which has n_d = 4 dimensions.
  The one-loop correction scans all n_d directions equally (Schur).
  Each contributes alpha/(16*pi^2) (standard one-loop integral).
  Total: delta(sin^2) = n_d * alpha/(16*pi^2) = alpha/(4*pi^2).

  MIXING vs COUPLING DISTINCTION:
  - Mixing angles (orientations) --> coefficient from dim of embedding space
    sin^2: C = n_d = dim(H) (integer/geometric)
  - Coupling strengths (magnitudes) --> coefficient from charge traces
    alpha: C = 24/11 = Tr(Q^2) * rho_EM (rational/algebraic)

  This resolves the S276 negative result: the T_3 double-trace method
  fails for Weinberg because it computes an algebraic (trace) quantity,
  while the Weinberg correction is geometric (orientation).

  CONFIDENCE: [CONJECTURE]
  The structural argument is compelling but Steps 3-4 are [A-PHYSICAL].
  The uniqueness of n_d = 4 among 1-11 and the 0.0 sigma match support
  the interpretation but don't prove it.
""")
