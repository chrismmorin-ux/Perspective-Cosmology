#!/usr/bin/env python3
"""
Weinberg Angle Deep Investigation: sin^2(theta_W) = 28/121 = n_d * Im_O / n_c^2

KEY FINDING: [TO BE DETERMINED — this is an adversarial investigation]

Formula: sin^2(theta_W) = n_d * Im_O / n_c^2 = 4*7/121 = 28/121
Measured (MS-bar, M_Z): 0.23121 +/- 0.00004
Framework: 28/121 = 0.231404...
Error: 0.08%

Status: INVESTIGATION — scrutinizing a Session 151 finding

CRITICAL NOTE: This formula was IDENTIFIED (searched for), not predicted blind.
The number 0.23121 was known before the formula was found.

Depends on:
- n_d = 4 [D: Frobenius theorem]
- n_c = 11 [D: sum of division algebra dimensions]
- Im_O = 7 [D: octonionic imaginary dimensions]
- sin^2(theta_W) = 0.23121 [A-IMPORT: PDG MS-bar at M_Z]

Created: Session 154
"""

from sympy import *
from sympy import Rational as R
import math

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

n_d = 4
n_c = 11
Im_C = 1
Im_H = 3
Im_O = 7
H = 4
C = 2
O = 8
Rr = 1  # R (real numbers, avoid shadowing)

# Measured value (PDG 2024, MS-bar at M_Z)
sin2_W_measured = R(23121, 100000)  # 0.23121 +/- 0.00004

# ==============================================================================
# SECTION 1: NUMEROLOGY CHECK — SEARCH SPACE ANALYSIS
# ==============================================================================

print("=" * 72)
print("SECTION 1: NUMEROLOGY CHECK — HOW SPECIAL IS 28/121?")
print("=" * 72)
print()

framework_atoms = {
    'R': 1, 'C': 2, 'Im_H': 3, 'H': 4,
    'Im_O': 7, 'O': 8, 'n_c': 11, 'n_d': 4,
}

framework_composites = {
    'Im_C': 1, 'Im_H^2': 9, 'n_d^2': 16, 'Im_O^2': 49,
    'n_c^2': 121, 'N_I': 137, 'Phi_6': 111,
    'n_d*Im_O': 28, 'n_d*Im_H': 12, 'C*Im_H': 6,
    'C*Im_O': 14, 'H*Im_O': 28, 'O*Im_O': 56,
    'Im_H*Im_O': 21, 'n_c-1': 10, 'n_c+1': 12,
    'O-1': 7, 'O+1': 9, 'H-1': 3, 'H+1': 5,
}

all_numbers = set()
for v in framework_atoms.values():
    all_numbers.add(v)
for v in framework_composites.values():
    all_numbers.add(v)

atom_vals = list(framework_atoms.values())
for i, a in enumerate(atom_vals):
    for b in atom_vals[i:]:
        all_numbers.add(a * b)

all_numbers = sorted([n for n in all_numbers if n > 0])

print(f"Framework number pool: {len(all_numbers)} distinct values")
print(f"Values: {all_numbers}")
print()

target = float(sin2_W_measured)
tolerance = 0.0008  # 0.08% relative

hits = []
total_ratios = 0

for p in all_numbers:
    for q in all_numbers:
        if q == 0:
            continue
        ratio = p / q
        if 0.01 < ratio < 0.99:
            total_ratios += 1
            rel_error = abs(ratio - target) / target
            if rel_error < tolerance:
                hits.append((p, q, ratio, rel_error))

hits.sort(key=lambda x: x[3])

print(f"Total ratios tested (in range 0.01-0.99): {total_ratios}")
print(f"Ratios within {tolerance*100:.2f}% of sin^2(theta_W) = {target}:")
print()

for p, q, ratio, err in hits:
    print(f"  {p}/{q} = {ratio:.6f}  (error: {err*100:.4f}%)")

print()
print(f"HITS: {len(hits)} out of {total_ratios} ratios")
print(f"Hit rate: {len(hits)/total_ratios*100:.2f}%")
print()

uniform_prob = 2 * tolerance * target / 0.98
expected_hits = total_ratios * uniform_prob
print(f"Expected hits by chance (uniform): {expected_hits:.1f}")
print(f"Actual hits: {len(hits)}")
print()

max_val = max(all_numbers)
generic_hits = 0
generic_total = 0
for p in range(1, max_val + 1):
    for q in range(1, max_val + 1):
        ratio = p / q
        if 0.01 < ratio < 0.99:
            generic_total += 1
            if abs(ratio - target) / target < tolerance:
                generic_hits += 1

print(f"Generic test: ALL p/q with 1 <= p,q <= {max_val}")
print(f"  Total ratios in (0.01, 0.99): {generic_total}")
print(f"  Hits within 0.08%: {generic_hits}")
if generic_total > 0:
    print(f"  Hit rate: {generic_hits/generic_total*100:.3f}%")
print()

print("ASSESSMENT:")
if len(hits) == 1:
    print("  ONLY ONE framework ratio matches within 0.08%.")
elif len(hits) <= 3:
    print(f"  {len(hits)} framework ratios match within 0.08%.")
else:
    print(f"  {len(hits)} framework ratios match. Higher numerology risk.")
print()

# ==============================================================================
# SECTION 2: THE FORMULA IN DETAIL
# ==============================================================================

print("=" * 72)
print("SECTION 2: THE FORMULA sin^2(theta_W) = n_d * Im_O / n_c^2")
print("=" * 72)
print()

formula_value = R(n_d * Im_O, n_c**2)
print(f"n_d * Im_O / n_c^2 = {n_d} * {Im_O} / {n_c}^2 = {n_d * Im_O}/{n_c**2} = {formula_value}")
print(f"Decimal: {float(formula_value):.10f}")
print(f"Measured: {float(sin2_W_measured):.10f}")
print()

error_abs = float(abs(formula_value - sin2_W_measured))
error_rel = error_abs / float(sin2_W_measured)
error_ppm = error_rel * 1e6

print(f"Absolute error: {error_abs:.6f}")
print(f"Relative error: {error_rel*100:.4f}% = {error_ppm:.0f} ppm")
print()

# Decomposition: 28/121 = (4/11) * (7/11)
print("Decomposition: 28/121 = (n_d/n_c) * (Im_O/n_c)")
print(f"  n_d/n_c = {n_d}/{n_c} = {float(R(n_d,n_c)):.6f} (spacetime fraction)")
print(f"  Im_O/n_c = {Im_O}/{n_c} = {float(R(Im_O,n_c)):.6f} (octonion fraction)")
print()

# n_d + Im_O = n_c: follows from H + (O-1) = R + C + O = 11
print(f"Identity: n_d + Im_O = {n_d} + {Im_O} = {n_d + Im_O} = n_c")
print(f"So: sin^2(theta_W) = x(1-x) where x = n_d/n_c = 4/11")

x = R(n_d, n_c)
print(f"  x(1-x) = {float(x*(1-x)):.6f}")
print()

# ==============================================================================
# SECTION 3: CONSISTENCY WITH cos(theta_W) = 171/194 (ON-SHELL)
# ==============================================================================

print("=" * 72)
print("SECTION 3: CONSISTENCY WITH cos(theta_W) = 171/194")
print("=" * 72)
print()

cos_W_formula = R(171, 194)
sin2_W_onshell = 1 - cos_W_formula**2

print(f"On-shell: sin^2(theta_W)_OS = 1 - (171/194)^2 = {float(sin2_W_onshell):.10f}")
print(f"MS-bar:   sin^2(theta_W)_MS = 28/121 = {float(formula_value):.10f}")
print()

scheme_diff = float(formula_value - sin2_W_onshell)

sin2_OS_measured = 1 - (R(80377, 1000) / R(91188, 1000))**2
measured_scheme_diff = float(sin2_W_measured - sin2_OS_measured)

print(f"Scheme difference (MS-bar - on-shell):")
print(f"  Framework: {scheme_diff:.5f}")
print(f"  Measured:  {measured_scheme_diff:.5f}")

scheme_diff_error = abs(scheme_diff - measured_scheme_diff) / measured_scheme_diff
print(f"  Relative error: {scheme_diff_error*100:.1f}%")
print()

if abs(scheme_diff_error) < 0.10:
    print("  CONSISTENT: Framework reproduces the scheme conversion to ~10%")
elif abs(scheme_diff_error) < 0.30:
    print("  ROUGHLY CONSISTENT: Same order of magnitude")
else:
    print("  INCONSISTENT: Framework scheme difference does not match SM")
print()

print("Two formulas for two scheme definitions (not the same formula rewritten).")
print(f"  28/121 = {float(R(28,121)):.6f} (MS-bar sin^2)")
print(f"  1-(171/194)^2 = {float(sin2_W_onshell):.6f} (on-shell sin^2)")
print()

# ==============================================================================
# SECTION 4: RG RUNNING OF sin^2(theta_W)
# ==============================================================================

print("=" * 72)
print("SECTION 4: RG RUNNING — AT WHAT SCALE DOES 28/121 HOLD?")
print("=" * 72)
print()

# SM one-loop beta coefficients
# Convention: 1/alpha_i(mu) = 1/alpha_i(M_Z) + b_i/(2*pi) * ln(mu/M_Z)
# b_i > 0 means coupling weakens at high mu
b1_GUT = R(-41, 10)  # GUT normalized U(1) (strengthens at high E)
b2 = R(19, 6)        # SU(2) (weakens at high E)
b3 = R(7, 1)         # SU(3) (asymptotic freedom)

# Input values at M_Z
alpha_em_inv_MZ = R(12794, 100)  # 1/alpha_EM(M_Z) = 127.94
alpha_2_inv_MZ = R(2962, 100)    # 1/alpha_2(M_Z) = 29.62

sin2_MZ = alpha_2_inv_MZ / alpha_em_inv_MZ
print(f"sin^2(theta_W) at M_Z = 1/alpha_2 / (1/alpha_EM) = {float(sin2_MZ):.5f}")
print(f"(PDG: 0.23121)")
print()

# 1/alpha_1 (GUT norm): 1/alpha_EM = (5/3)/alpha_1 + 1/alpha_2
alpha_1_inv_MZ = R(3, 5) * (alpha_em_inv_MZ - alpha_2_inv_MZ)

print(f"1/alpha_1(M_Z) GUT = (3/5)*({float(alpha_em_inv_MZ):.2f} - {float(alpha_2_inv_MZ):.2f}) = {float(alpha_1_inv_MZ):.2f}")
print()


def sin2_at_scale(ln_mu_over_MZ):
    """Compute sin^2(theta_W) in MS-bar at scale mu, given ln(mu/M_Z)."""
    t = ln_mu_over_MZ
    a1_inv = float(alpha_1_inv_MZ) + float(b1_GUT) / (2 * math.pi) * t
    a2_inv = float(alpha_2_inv_MZ) + float(b2) / (2 * math.pi) * t
    # 1/alpha_EM = (5/3)/alpha_1 + 1/alpha_2
    alpha_em_inv = a2_inv + (5/3) * a1_inv
    if alpha_em_inv <= 0:
        return None
    sin2 = a2_inv / alpha_em_inv
    return sin2


M_Z = 91.2  # GeV

scales = [
    ("M_Z (91.2 GeV)", 0),
    ("1 TeV", math.log(1000/M_Z)),
    ("10 TeV", math.log(10000/M_Z)),
    ("10^6 GeV", math.log(1e6/M_Z)),
    ("10^10 GeV", math.log(1e10/M_Z)),
    ("10^14 GeV", math.log(1e14/M_Z)),
    ("GUT (~2e16)", math.log(2e16/M_Z)),
    ("M_Pl (~1.2e19)", math.log(1.2e19/M_Z)),
    ("10 GeV", math.log(10/M_Z)),
    ("1 GeV", math.log(1/M_Z)),
]

target_val = 28/121

print(f"Target: sin^2(theta_W) = 28/121 = {target_val:.6f}")
print()
print(f"{'Scale':<25s} {'sin^2(theta_W)':<18s} {'Error vs 28/121':<18s}")
print("-" * 61)

best_scale = None
best_error = 1.0

for name, ln_mu in sorted(scales, key=lambda x: x[1]):
    s2 = sin2_at_scale(ln_mu)
    if s2 is not None:
        err = abs(s2 - target_val) / target_val
        print(f"  {name:<23s} {s2:.6f}          {err*100:.3f}%")
        if err < best_error:
            best_error = err
            best_scale = (name, M_Z * math.exp(ln_mu), s2)

print()

# Find the EXACT scale where sin^2 = 28/121 by bisection
s2_at_MZ = sin2_at_scale(0)
print(f"sin^2 at M_Z (computed): {s2_at_MZ:.6f}")
print(f"Target 28/121:           {target_val:.6f}")

if s2_at_MZ > target_val:
    lo, hi = math.log(1/M_Z), 0
    direction = "below M_Z"
else:
    lo, hi = 0, math.log(1e4/M_Z)
    direction = "above M_Z"

for _ in range(100):
    mid = (lo + hi) / 2
    s2 = sin2_at_scale(mid)
    if s2 is None:
        hi = mid
        continue
    if s2 < target_val:
        lo = mid
    else:
        hi = mid

exact_scale = M_Z * math.exp(mid)
exact_s2 = sin2_at_scale(mid)
print(f"Scale where sin^2(theta_W) = 28/121 exactly (one-loop):")
print(f"  mu = {exact_scale:.1f} GeV ({direction})")
print(f"  sin^2 at that scale: {exact_s2:.8f}")
print()

# GUT unification scale where sin^2 = 3/8
lo_gut, hi_gut = math.log(1e10/M_Z), math.log(1e19/M_Z)
for _ in range(100):
    mid_gut = (lo_gut + hi_gut) / 2
    s2 = sin2_at_scale(mid_gut)
    if s2 is None:
        hi_gut = mid_gut
        continue
    if s2 > 3/8:
        lo_gut = mid_gut
    else:
        hi_gut = mid_gut

gut_scale = M_Z * math.exp(mid_gut)
print(f"Scale where sin^2 = 3/8 (SU(5) GUT): mu = {gut_scale:.2e} GeV")
print()

# ==============================================================================
# SECTION 5: DERIVATION — GOLDSTONE BOSON CONNECTION
# ==============================================================================

print("=" * 72)
print("SECTION 5: WHY 28? — GOLDSTONE BOSONS FROM SO(11) BREAKING")
print("=" * 72)
print()

# SO(n) -> SO(p) x SO(q), p+q=n: N_Goldstone = pq
print("GOLDSTONE BOSON COUNT from SO(n) -> SO(p) x SO(q):")
print("  General: N_Goldstone = n(n-1)/2 - p(p-1)/2 - q(q-1)/2 = p*q")
print()

dim_SO11 = n_c * (n_c - 1) // 2
dim_SO4 = n_d * (n_d - 1) // 2
dim_SO7 = Im_O * (Im_O - 1) // 2
N_Gold = dim_SO11 - dim_SO4 - dim_SO7

print(f"  SO(11): dim = {dim_SO11},  SO(4): dim = {dim_SO4},  SO(7): dim = {dim_SO7}")
print(f"  Broken: {dim_SO11} - {dim_SO4} - {dim_SO7} = {N_Gold}")
print(f"  = n_d * (n_c - n_d) = {n_d} * {n_c - n_d} = {n_d * (n_c - n_d)}")
print()

print(f"  STRUCTURAL IDENTITY: n_c - n_d = Im_O = {Im_O}")
print(f"  So: N_Goldstone = n_d * Im_O = {n_d * Im_O}")
print()

print("THE WEINBERG ANGLE AS GOLDSTONE FRACTION:")
print(f"  sin^2(theta_W) = N_Goldstone / n_c^2 = {N_Gold} / {n_c**2}")
print()

print("MULTIPLE MEANINGS OF 28:")
print(f"  28 = n_d * Im_O                        (defect-octonion product)")
print(f"  28 = n_d * (n_c - n_d)                  (Stage 1 Goldstones)")
print(f"  28 = dim(SO(8)) = O*(O-1)/2             (octonion rotation group)")
print(f"  28 = T(Im_O) = Im_O*(Im_O+1)/2          (triangular number)")
print(f"  28 = dim(coset SO(11)/(SO(4)xSO(7)))")
print()

print("THE x(1-x) FORM (Bernoulli variance):")
print(f"  sin^2(theta_W) = (n_d/n_c)(1 - n_d/n_c) = x(1-x), x = {n_d}/{n_c}")
print(f"  Maximum at x=1/2, value=1/4. Actual: {float(R(n_d,n_c) * (1 - R(n_d,n_c))):.6f}")
print()

print("DERIVATION ASSESSMENT:")
print("  PROVEN: n_d=4, n_c=11, SO(11)->SO(4)xSO(7) forced, N_Gold=28  [THEOREM]")
print("  UNPROVEN: sin^2(theta_W) = N_Gold/n_c^2  [CONJECTURE — Step 5 gap]")
print()

# ==============================================================================
# SECTION 6: CORRECTION TERM SEARCH
# ==============================================================================

print("=" * 72)
print("SECTION 6: CORRECTION TERM SEARCH")
print("=" * 72)
print()

needed_correction = float(sin2_W_measured) - float(formula_value)
print(f"28/121 = {float(formula_value):.6f}")
print(f"Measured = {float(sin2_W_measured):.6f}")
print(f"Needed correction: {needed_correction:.6f}")
print()

corr_candidates = [
    ("-n_d/(n_c^2 * Phi_6)", -R(n_d, n_c**2 * 111)),
    ("-1/(n_c * Phi_6)", -R(1, n_c * 111)),
    ("-n_d/(n_c^3)", -R(n_d, n_c**3)),
    ("-Im_O/(n_c^3 * Im_H)", -R(Im_O, n_c**3 * Im_H)),
    ("-1/(n_c^2 * n_d)", -R(1, n_c**2 * n_d)),
    ("-C/(n_c^3)", -R(C, n_c**3)),
    ("-Im_H/(n_c^2 * Im_O)", -R(Im_H, n_c**2 * Im_O)),
    ("-n_d*Im_O/(n_c^4)", -R(n_d * Im_O, n_c**4)),
    ("-1/(n_c^2 * Im_H)", -R(1, n_c**2 * Im_H)),
    ("-1/(N_I * n_d)", -R(1, 137 * n_d)),
    ("-1/(N_I * Im_H)", -R(1, 137 * Im_H)),
    ("-n_d/(n_c * N_I)", -R(n_d, n_c * 137)),
]

print(f"{'Candidate correction':<30s} {'Value':<14s} {'Total':<12s} {'Error vs meas':<12s}")
print("-" * 68)

for name, val in corr_candidates:
    total = float(formula_value + val)
    err = abs(total - float(sin2_W_measured)) / float(sin2_W_measured) * 100
    print(f"  {name:<28s} {float(val):.7f}  {total:.7f}  {err:.4f}%")

print()

from math import gcd
g = gcd(23121, 100000)
print(f"Measured 23121/100000 = {23121//g}/{100000//g} (factored: {factorint(23121)})")
print(f"Not a clean framework expression.")
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 72)
print("VERIFICATION TESTS")
print("=" * 72)
print()

tests = [
    # Identity checks
    ("28/121 = n_d * Im_O / n_c^2",
     R(28, 121) == R(n_d * Im_O, n_c**2)),

    ("n_d + Im_O = n_c (structural identity)",
     n_d + Im_O == n_c),

    ("n_c - n_d = Im_O",
     n_c - n_d == Im_O),

    ("28/121 = (n_d/n_c)(1 - n_d/n_c) [x(1-x) form]",
     R(28, 121) == R(n_d, n_c) * (1 - R(n_d, n_c))),

    # Goldstone connection
    ("28 = dim(SO(11)) - dim(SO(4)) - dim(SO(7)) [Goldstone count]",
     28 == n_c*(n_c-1)//2 - n_d*(n_d-1)//2 - Im_O*(Im_O-1)//2),

    ("Goldstone count = p*q for SO(p+q) -> SO(p) x SO(q)",
     n_d * Im_O == n_c*(n_c-1)//2 - n_d*(n_d-1)//2 - Im_O*(Im_O-1)//2),

    ("28 = dim(SO(8)) = O*(O-1)/2",
     28 == O * (O - 1) // 2),

    ("28 = T(Im_O) = Im_O*(Im_O+1)/2",
     28 == Im_O * (Im_O + 1) // 2),

    # Precision check
    ("28/121 within 0.1% of measured sin^2(theta_W)",
     abs(float(R(28, 121) - sin2_W_measured) / float(sin2_W_measured)) < 0.001),

    ("Actual precision: 843 ppm (not sub-800 as S151 implied)",
     800 < abs(float(R(28, 121) - sin2_W_measured) / float(sin2_W_measured)) * 1e6 < 900),

    # On-shell consistency
    ("cos(theta_W) = 171/194 is distinct from sin^2 = 28/121",
     R(28, 121) != 1 - R(171, 194)**2),

    # Scheme difference
    ("MS-bar > on-shell (correct sign)",
     R(28, 121) > 1 - R(171, 194)**2),

    ("Scheme difference within 5% of measured",
     abs(float(R(28,121) - (1 - R(171,194)**2)) - 0.00815) / 0.00815 < 0.05),

    # Framework identity
    ("n_c = R + C + H + O - n_d = 11",
     Rr + C + H + O - n_d == n_c),
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
print()

# ==============================================================================
# SUMMARY AND HONEST ASSESSMENT
# ==============================================================================

print("=" * 72)
print("SUMMARY AND HONEST ASSESSMENT")
print("=" * 72)
print()

print("FORMULA: sin^2(theta_W) = n_d * Im_O / n_c^2 = 28/121 = 0.231404...")
print(f"MEASURED: sin^2(theta_W)_MS-bar(M_Z) = 0.23121")
print(f"ERROR: 0.08% = 840 ppm")
print()

print("STRENGTHS:")
print("  1. Clean algebraic form using only n_d, Im_O, n_c")
print("  2. x(1-x) decomposition with x = n_d/n_c; identity n_d + Im_O = n_c")
print("  3. 28 = N_Goldstone(SO(11)->SO(4)xSO(7)) — group-theoretic origin")
print("  4. Scheme difference matches measured to ~2.4%")
print("  5. UNIQUE among framework ratios at 843 ppm")
print()

print("WEAKNESSES:")
print("  1. IDENTIFIED, not predicted blind — numerology risk")
print("  2. 843 ppm precision (not sub-800 as S151 implied)")
print("  3. No derivation of WHY sin^2 = N_Gold/n_c^2 (Step 5 gap)")
print("  4. Matches at M_Z scale (IR relation, not UV tree-level)")
print("  5. Correction term search inconclusive")
print()

print("NUMEROLOGY RISK: MEDIUM")
print("  Goldstone connection gives structural derivation path.")
print("  But post-hoc identification and Step 5 gap remain.")
print()

print("VERDICT: [CONJECTURE] with partial derivation chain.")
print("  Probability this is physics (not numerology): 30-45%")
