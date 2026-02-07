#!/usr/bin/env python3
"""
CNH Phase 3: Prediction Path Analysis

KEY QUESTION: Does the CNH make testable predictions beyond BBN nuclei?

Tests:
1. CCF for stable isotopes (Fe-56, C-12, O-16, Si-28, etc.)
2. CCF correlation with binding energy per nucleon
3. CCF for stellar nucleosynthesis products (CNO cycle)
4. Proton-rich vs neutron-rich isotope stability
5. Mixing angle norm classification (Cabibbo vs Weinberg)

Status: ANALYSIS
"""

from sympy import *

def is_gaussian_norm(n):
    """
    Check if n is a sum of two squares (Gaussian norm).
    By Fermat: n is a sum of two squares iff in prime factorization,
    every prime p ≡ 3 (mod 4) appears to an even power.
    """
    if n <= 0:
        return n == 0

    # Factor n
    from sympy.ntheory import factorint
    factors = factorint(n)

    for p, exp in factors.items():
        if p % 4 == 3 and exp % 2 == 1:
            return False
    return True

def ccf(A, Z):
    """
    Crystallization Compatibility Factor for nucleus (A, Z).
    CCF = #{norms among A, Z, N} / 3 where N = A - Z.
    """
    N = A - Z
    count = sum(1 for x in [A, Z, N] if is_gaussian_norm(x))
    return Rational(count, 3)

def norm_status(n):
    """Return 'norm' or 'NON' for a positive integer."""
    return "norm" if is_gaussian_norm(n) else "NON"

# ============================================================
# PART 1: CCF for common stable isotopes
# ============================================================

print("=" * 60)
print("PART 1: CCF for stable isotopes")
print("=" * 60)

# Stable isotopes with known binding energies (MeV per nucleon)
# Format: (name, A, Z, B/A in MeV)
stable_isotopes = [
    # Light nuclei (BBN products)
    ("H-1", 1, 1, 0),          # proton
    ("H-2", 2, 1, 1.112),      # deuterium
    ("He-3", 3, 2, 2.573),
    ("He-4", 4, 2, 7.074),     # alpha particle
    ("Li-6", 6, 3, 5.332),
    ("Li-7", 7, 3, 5.606),
    ("Be-9", 9, 4, 6.463),
    ("B-10", 10, 5, 6.475),
    ("B-11", 11, 5, 6.928),

    # CNO cycle nuclei
    ("C-12", 12, 6, 7.680),
    ("C-13", 13, 6, 7.470),
    ("N-14", 14, 7, 7.476),
    ("N-15", 15, 7, 7.699),
    ("O-16", 16, 8, 7.976),    # doubly magic
    ("O-17", 17, 8, 7.751),
    ("O-18", 18, 8, 7.767),

    # Heavier stable nuclei
    ("Ne-20", 20, 10, 8.032),
    ("Mg-24", 24, 12, 8.261),
    ("Si-28", 28, 14, 8.448),   # doubly magic
    ("S-32", 32, 16, 8.493),
    ("Ca-40", 40, 20, 8.551),   # doubly magic
    ("Ca-48", 48, 20, 8.666),   # doubly magic
    ("Fe-56", 56, 26, 8.790),   # max B/A
    ("Ni-62", 62, 28, 8.795),   # actually max B/A
    ("Zn-64", 64, 30, 8.736),
    ("Pb-208", 208, 82, 7.867), # doubly magic
]

print(f"\n{'Nucleus':<10} {'A':>4} {'Z':>4} {'N':>4} | {'A':>5} {'Z':>5} {'N':>5} | CCF  | B/A (MeV)")
print("-" * 75)

ccf_ba_data = []
for name, A, Z, BA in stable_isotopes:
    N = A - Z
    cf = ccf(A, Z)
    A_stat = norm_status(A)
    Z_stat = norm_status(Z)
    N_stat = norm_status(N)
    print(f"{name:<10} {A:>4} {Z:>4} {N:>4} | {A_stat:>5} {Z_stat:>5} {N_stat:>5} | {float(cf):.3f} | {BA:.3f}")
    if BA > 0:  # exclude H-1
        ccf_ba_data.append((float(cf), BA, name))

# ============================================================
# PART 2: CCF vs Binding Energy correlation
# ============================================================

print("\n" + "=" * 60)
print("PART 2: CCF vs Binding Energy correlation")
print("=" * 60)

# Group by CCF value
from collections import defaultdict
ccf_groups = defaultdict(list)
for cf_val, ba, name in ccf_ba_data:
    ccf_groups[cf_val].append((ba, name))

print("\nBinding energy per nucleon by CCF group:")
for cf_val in sorted(ccf_groups.keys()):
    entries = ccf_groups[cf_val]
    ba_values = [e[0] for e in entries]
    avg_ba = sum(ba_values) / len(ba_values)
    print(f"  CCF = {cf_val:.3f}: n={len(entries)}, avg B/A = {avg_ba:.3f} MeV")
    print(f"           Range: {min(ba_values):.3f} - {max(ba_values):.3f}")

# Statistical test: does CCF correlate with binding energy?
# Compute Pearson correlation coefficient
ccf_vals = [x[0] for x in ccf_ba_data]
ba_vals = [x[1] for x in ccf_ba_data]
n = len(ccf_vals)
mean_ccf = sum(ccf_vals) / n
mean_ba = sum(ba_vals) / n
cov = sum((ccf_vals[i] - mean_ccf) * (ba_vals[i] - mean_ba) for i in range(n)) / n
var_ccf = sum((x - mean_ccf)**2 for x in ccf_vals) / n
var_ba = sum((x - mean_ba)**2 for x in ba_vals) / n
if var_ccf > 0 and var_ba > 0:
    corr = cov / (var_ccf**0.5 * var_ba**0.5)
else:
    corr = 0

print(f"\nPearson correlation (CCF vs B/A): r = {corr:.4f}")
print("Interpretation: |r| < 0.3 = weak, 0.3-0.7 = moderate, > 0.7 = strong")

# ============================================================
# PART 3: Magic numbers and CCF
# ============================================================

print("\n" + "=" * 60)
print("PART 3: Nuclear magic numbers and CCF")
print("=" * 60)

magic_numbers = [2, 8, 20, 28, 50, 82, 126]
print("\nMagic numbers (shell closures):")
for m in magic_numbers:
    print(f"  {m}: {norm_status(m)}")

doubly_magic = [
    ("He-4", 4, 2),     # Z=2, N=2
    ("O-16", 16, 8),    # Z=8, N=8
    ("Ca-40", 40, 20),  # Z=20, N=20
    ("Ca-48", 48, 20),  # Z=20, N=28
    ("Ni-56", 56, 28),  # Z=28, N=28 (unstable, but doubly magic)
    ("Ni-78", 78, 28),  # Z=28, N=50 (neutron-rich, unstable)
    ("Sn-100", 100, 50), # Z=50, N=50 (unstable)
    ("Sn-132", 132, 50), # Z=50, N=82 (unstable)
    ("Pb-208", 208, 82), # Z=82, N=126
]

print("\nDoubly magic nuclei CCF:")
for name, A, Z in doubly_magic:
    N = A - Z
    cf = ccf(A, Z)
    print(f"  {name}: CCF = {float(cf):.3f} ({norm_status(A)}/{norm_status(Z)}/{norm_status(N)})")

# ============================================================
# PART 4: Proton-rich vs neutron-rich stability
# ============================================================

print("\n" + "=" * 60)
print("PART 4: Proton-rich vs neutron-rich isotopes")
print("=" * 60)

# Compare isotopes of the same element
# Focus on tin (Z=50) which has many stable isotopes
tin_isotopes = [
    ("Sn-112", 112, 50, True),   # p-rich
    ("Sn-114", 114, 50, True),
    ("Sn-116", 116, 50, True),
    ("Sn-117", 117, 50, True),
    ("Sn-118", 118, 50, True),
    ("Sn-119", 119, 50, True),
    ("Sn-120", 120, 50, True),   # most abundant
    ("Sn-122", 122, 50, True),
    ("Sn-124", 124, 50, True),   # n-rich
]

print("\nTin isotopes (Z=50):")
print(f"{'Isotope':<10} {'A':>4} {'N':>4} | {'A':>5} {'N':>5} | CCF")
print("-" * 45)
for name, A, Z, stable in tin_isotopes:
    N = A - Z
    cf = ccf(A, Z)
    print(f"{name:<10} {A:>4} {N:>4} | {norm_status(A):>5} {norm_status(N):>5} | {float(cf):.3f}")

# ============================================================
# PART 5: CNO cycle analysis
# ============================================================

print("\n" + "=" * 60)
print("PART 5: CNO cycle reactions")
print("=" * 60)

# CNO cycle main branch reactions
cno_reactions = [
    ("C-12 + p -> N-13", (12, 6), (13, 7)),    # C-12 captures proton
    ("N-13 -> C-13 + e+ + nu", (13, 7), (13, 6)),  # beta+ decay
    ("C-13 + p -> N-14", (13, 6), (14, 7)),
    ("N-14 + p -> O-15", (14, 7), (15, 8)),
    ("O-15 -> N-15 + e+ + nu", (15, 8), (15, 7)),  # beta+ decay
    ("N-15 + p -> C-12 + He-4", (15, 7), (12, 6)),  # back to C-12
]

print("\nCNO cycle CCF analysis:")
print(f"{'Reaction':<30} | {'Init CCF':>8} -> {'Final CCF':>8} | {'dCCF':>5}")
print("-" * 65)
for reaction, (A1, Z1), (A2, Z2) in cno_reactions:
    ccf1 = float(ccf(A1, Z1))
    ccf2 = float(ccf(A2, Z2))
    delta = ccf2 - ccf1
    direction = "+" if delta > 0 else ("-" if delta < 0 else "=")
    print(f"{reaction:<30} | {ccf1:>8.3f} -> {ccf2:>8.3f} | {direction}{abs(delta):.3f}")

# ============================================================
# PART 6: Mixing angles norm classification
# ============================================================

print("\n" + "=" * 60)
print("PART 6: Mixing angles norm classification")
print("=" * 60)

mixing_angles = [
    # Electroweak
    ("sin^2(theta_W) (Weinberg)", 28, 121),

    # CKM matrix
    ("sin^2(theta_C) (Cabibbo)", 9, 40),    # Actually sin^2(theta_12) ~ 0.225
    ("V_us^2", 225, 1000),          # |V_us|^2 ~ 0.0484 but sin^2(theta_C) ~ 0.05

    # Framework formulas
    ("Omega_m", 63, 200),
    ("1/alpha - 137", 4, 111),           # enhanced precision correction
    ("Li-7 suppression", 1, 3),
]

print(f"\n{'Formula':<25} | {'Num':>5} | {'Den':>5} | Classification")
print("-" * 60)
for name, num, den in mixing_angles:
    num_stat = norm_status(num)
    den_stat = norm_status(den)
    classification = f"{num_stat}/{den_stat}"
    print(f"{name:<25} | {num:>5} | {den:>5} | {classification}")

# Check: sin²θ_C = 9/40 claimed above
# Actually the Cabibbo angle θ_C ≈ 13.1°, sin²θ_C ≈ 0.051
# 9/40 = 0.225 = sin²θ_12 (quark mixing), NOT sin²θ_C
# Let's verify what we actually mean
print("\nNote on sin^2(theta_C):")
print("  Cabibbo angle theta_C ~ 13.1 deg")
print("  sin(theta_C) ~ 0.226 -> |V_us| ~ 0.226")
print("  sin^2(theta_C) ~ 0.051, NOT 0.225")
print("  9/40 = 0.225 ~ sin(theta_C), not sin^2(theta_C)")

# Correct analysis
print("\nCorrected mixing angle analysis:")
print("  sin(theta_C) ~ 9/40 = 0.225: 9=norm, 40=norm -> norm/norm")
print("  sin^2(theta_W) = 28/121: 28=NON, 121=norm -> NON/norm")
print("  Difference: CKM uses sin(theta), electroweak uses sin^2(theta)")

# ============================================================
# PART 7: Predictions assessment
# ============================================================

print("\n" + "=" * 60)
print("PART 7: Prediction assessment for CNH adoption")
print("=" * 60)

predictions = [
    ("Li-7 suppression = 1/3", "CONFIRMED", "BBN", "S100"),
    ("Li-6 maximally suppressed (CCF=0)", "QUALITATIVE", "BBN", "~10^-14 consistent"),
    ("He-3 suppression = 2/3", "BLOCKED", "BBN", "PDG: inappropriate probe"),
    ("B-11 suppression = 1/3", "NO DATA", "BBN", "No precise measurements"),
    ("CCF-stability correlation", "WEAK", "Nuclear", f"r = {corr:.3f}"),
    ("Magic numbers = norms", "FAILS", "Nuclear", "28, 50, 126 are NON-norms"),
]

print(f"\n{'Prediction':<35} | {'Status':<12} | {'Domain':<8} | Notes")
print("-" * 85)
for pred, status, domain, notes in predictions:
    print(f"{pred:<35} | {status:<12} | {domain:<8} | {notes}")

# ============================================================
# VERIFICATION TESTS
# ============================================================

print("\n" + "=" * 60)
print("VERIFICATION TESTS")
print("=" * 60)

tests = [
    # Basic CCF calculations
    ("CCF(He-4) = 1", ccf(4, 2) == 1),
    ("CCF(Li-7) = 1/3", ccf(7, 3) == Rational(1, 3)),
    ("CCF(Li-6) = 0", ccf(6, 3) == 0),
    ("CCF(He-3) = 2/3", ccf(3, 2) == Rational(2, 3)),
    ("CCF(C-12) = 0", ccf(12, 6) == 0),  # 12=NON, 6=NON, 6=NON
    ("CCF(O-16) = 1 (all norms)", ccf(16, 8) == 1),  # 16=norm, 8=norm, 8=norm

    # Gaussian norm tests
    ("7 is NOT a norm", not is_gaussian_norm(7)),
    ("3 is NOT a norm", not is_gaussian_norm(3)),
    ("11 is NOT a norm", not is_gaussian_norm(11)),
    ("4 is a norm", is_gaussian_norm(4)),
    ("8 is a norm", is_gaussian_norm(8)),
    ("28 is NOT a norm (7×4, odd power of 7)", not is_gaussian_norm(28)),
    ("50 is a norm (2×25, no inert primes)", is_gaussian_norm(50)),
    ("126 is NOT a norm (2×63=2×7×9)", not is_gaussian_norm(126)),

    # Magic numbers
    ("Magic 2 is a norm", is_gaussian_norm(2)),
    ("Magic 8 is a norm", is_gaussian_norm(8)),
    ("Magic 20 is a norm", is_gaussian_norm(20)),
    ("Magic 28 is NOT a norm", not is_gaussian_norm(28)),
    ("Magic 50 is a norm", is_gaussian_norm(50)),
    ("Magic 82 is a norm", is_gaussian_norm(82)),  # 82 = 2×41, 41 ≡ 1 mod 4
    ("Magic 126 is NOT a norm", not is_gaussian_norm(126)),

    # Mixing angles
    ("28 is NOT a norm", not is_gaussian_norm(28)),
    ("121 is a norm (11²)", is_gaussian_norm(121)),
    ("9 is a norm (3²)", is_gaussian_norm(9)),
    ("40 is a norm (8×5)", is_gaussian_norm(40)),
    ("63 is NOT a norm (7×9)", not is_gaussian_norm(63)),
    ("200 is a norm", is_gaussian_norm(200)),

    # Correlation check
    ("CCF-B/A correlation is weak (|r| < 0.4)", abs(corr) < 0.4),
]

passed = 0
failed = 0
for name, result in tests:
    status = "PASS" if result else "FAIL"
    if result:
        passed += 1
    else:
        failed += 1
    print(f"[{status}] {name}")

print(f"\n{passed}/{passed+failed} tests passed")

# ============================================================
# SUMMARY
# ============================================================

print("\n" + "=" * 60)
print("SUMMARY: CNH Prediction Paths")
print("=" * 60)

print(f"""
FINDING 1: CCF does NOT correlate strongly with binding energy
  - Pearson r = {corr:.3f} (weak/negligible)
  - Not a viable prediction path

FINDING 2: Magic numbers are NOT consistently norms
  - 2, 8, 20, 50, 82: norms
  - 28, 126: NON-norms
  - CNH does NOT explain magic numbers

FINDING 3: CNO cycle shows mixed CCF changes
  - Both increases and decreases occur
  - No systematic pattern

FINDING 4: Mixing angle pattern exists but subtle
  - sin^2(theta_W) = 28/121 = NON/norm (fractional, 0 < x < 1)
  - sin(theta_C) ~ 9/40 = norm/norm
  - But these are different FUNCTIONS (sin vs sin^2)

CONCLUSION for adoption criterion #4:
  - BBN predictions (He-3, B-11, Li-6) remain blocked
  - Nuclear stability/binding energy: NOT a CNH prediction
  - Magic numbers: CNH FAILS to predict
  - Stellar nucleosynthesis (CNO): no systematic pattern
  - Particle mixing angles: pattern exists but not testable

BEST REMAINING PATH:
  Wait for precision cosmology (He-3 proxy? D/H sensitivity?)
  or accept Li-7 as the ONE confirmed prediction
""")
