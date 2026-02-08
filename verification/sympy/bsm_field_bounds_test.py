"""
BSM Field Bounds Test
=====================
Tests whether BSM models violate the field content bounds derived from
comparison channel counting.

From Session 30:
  - Max scalars (diagonal): 15
  - Max vectors (symmetric): 61
  - Max fermions (antisymmetric): 61

Total comparison channels: 137 (= 4^2 + 11^2 = 1/alpha)

Session: 2026-01-26-31
"""

from sympy import binomial, sqrt, Rational

# Our derived bounds
MAX_SCALARS = 15   # Type A: diagonal comparisons
MAX_VECTORS = 61   # Type B: symmetric off-diagonal
MAX_FERMIONS = 61  # Type C: antisymmetric off-diagonal

TOTAL_CHANNELS = 137

print("=" * 70)
print("BSM FIELD CONTENT BOUNDS TEST")
print("=" * 70)
print()
print("DERIVED BOUNDS (from comparison channel counting):")
print(f"  Max scalars:  {MAX_SCALARS}")
print(f"  Max vectors:  {MAX_VECTORS}")
print(f"  Max fermions: {MAX_FERMIONS}")
print(f"  Total:        {TOTAL_CHANNELS}")
print()

# =============================================================================
# STANDARD MODEL FIELD CONTENT
# =============================================================================

def count_sm():
    """Standard Model field content."""
    # Scalars
    higgs = 1  # Higgs doublet (after EWSB: 1 physical Higgs)
    scalars = higgs

    # Vectors (gauge bosons)
    photon = 1
    w_bosons = 2  # W+, W-
    z_boson = 1
    gluons = 8    # SU(3) generators
    vectors = photon + w_bosons + z_boson + gluons  # = 12

    # Fermions (Weyl fermions)
    # Per generation: (uL, dL, uR, dR) * 3 colors + (eL, nuL, eR) = 12 + 3 = 15 Weyl
    # Actually: quarks (3 colors * 2 chiralities * 2 flavors) + leptons (2 chiralities * 2 flavors for one lepton pair)
    # Let's count Weyl fermions properly:
    # Quarks per gen: uL, uR, dL, dR each in 3 colors = 12 Weyl
    # Leptons per gen: eL, eR, nuL (nuR not in SM) = 3 Weyl (if no nuR)
    # But modern SM often includes nuR for masses: 4 Weyl
    # Standard: 15 Weyl per generation (without nuR) or 16 with nuR
    # 3 generations * 15 = 45 Weyl fermions (without nuR)

    # Using standard counting (Weyl fermions):
    weyl_per_gen = 15  # Without right-handed neutrinos
    generations = 3
    fermions = weyl_per_gen * generations  # = 45

    return scalars, vectors, fermions

# =============================================================================
# MSSM (Minimal Supersymmetric Standard Model)
# =============================================================================

def count_mssm():
    """MSSM field content."""
    # MSSM doubles the SM fields + adds two Higgs doublets

    # Scalars: squarks + sleptons + 2 Higgs doublets
    # Squarks: 6 flavors * 3 colors * 2 chiralities = 36
    squarks = 6 * 3 * 2  # = 36
    # Sleptons: 3 charged + 3 sneutrinos * 2 chiralities (except sneutrino has 1)
    # Actually: (selectron_L, selectron_R, sneutrino) * 3 gen = 3 * 3 = 9
    # No, wait: sleptons per gen: eL, eR, nu = 3 complex = 6 real
    # Let's count complex scalar DoF:
    sleptons = 3 * 3  # 3 sleptons per gen * 3 gen = 9 (complex)
    # But eL, eR are separate, sneutrino: 2 + 1 = 3 per gen
    sleptons = 3 * 3  # = 9 complex scalars
    # Higgs: Hu, Hd (2 Higgs doublets = 4 complex = 8 real DoF)
    # After EWSB: 2 CP-even, 1 CP-odd, 2 charged = 5 physical Higgs
    higgs = 5

    # Actually let me count MSSM scalars more carefully
    # Complex scalars:
    # - Q (squark doublet): 3 gen * 2 * 3 colors = 18
    # - u_R: 3 gen * 3 colors = 9
    # - d_R: 3 gen * 3 colors = 9
    # - L (slepton doublet): 3 gen * 2 = 6
    # - e_R: 3 gen * 1 = 3
    # - Hu: 2
    # - Hd: 2
    # Total complex: 18 + 9 + 9 + 6 + 3 + 2 + 2 = 49 complex scalars
    # After EWSB, counting physical particles:
    # Squarks: 2 stops + 2 sbottoms + 4 other squark masses * chirality mix... complicated
    # Let's use the simple count: ~49 scalar fields in MSSM
    scalars = 49  # Before EWSB, complex scalars as fields

    # Vectors: Same as SM (12)
    # Gauginos are fermions, not vectors
    vectors = 12

    # Fermions: SM + gauginos + higgsinos
    sm_fermions = 45  # Weyl
    # Gauginos: bino (1), wino (3), gluinos (8) = 12
    gauginos = 1 + 3 + 8  # = 12 Majorana = 12 Weyl
    # Higgsinos: 2 Weyl (from 2 Higgs doublets)
    higgsinos = 4  # 2 doublets * 2 components
    fermions = sm_fermions + gauginos + higgsinos  # = 45 + 12 + 4 = 61 Weyl

    return scalars, vectors, fermions

# =============================================================================
# SO(10) GUT
# =============================================================================

def count_so10():
    """SO(10) GUT field content (at GUT scale)."""
    # SO(10) is a simple group that unifies SM

    # Vectors: SO(10) has 45 generators
    vectors = 45  # dim(SO(10)) = 10*9/2 = 45

    # Fermions: Each family in 16 representation (spinor)
    # 16 = 1 + 5 + 10 under SU(5)
    # Contains all SM fermions + right-handed neutrino
    fermions = 16 * 3  # = 48 Weyl (3 generations)

    # Scalars: Depends on the breaking chain
    # Minimal: 10 + 126 + ... representations for symmetry breaking
    # The Higgs sector is model-dependent
    # Typical: 10 (contains SM Higgs) + additional
    # Conservative estimate: 10 + 45 + 126 = lots
    # Let's use minimal case: just 10
    scalars = 10  # Minimal case

    return scalars, vectors, fermions

# =============================================================================
# E6 GUT
# =============================================================================

def count_e6():
    """E6 GUT field content."""
    # E6 is a larger unification group

    # Vectors: dim(E6) = 78
    vectors = 78

    # Fermions: Each family in 27 representation
    fermions = 27 * 3  # = 81 Weyl

    # Scalars: Model-dependent (large)
    scalars = 27  # Fundamental representation

    return scalars, vectors, fermions

# =============================================================================
# LEFT-RIGHT SYMMETRIC MODEL
# =============================================================================

def count_left_right():
    """SU(3)*SU(2)L*SU(2)R*U(1) model."""
    # Vectors
    gluons = 8
    wl = 3  # SU(2)L
    wr = 3  # SU(2)R
    u1 = 1
    vectors = gluons + wl + wr + u1  # = 15

    # Fermions: SM + right-handed neutrinos (automatic)
    # Same structure as SM but doubled SU(2) for R
    fermions = 16 * 3  # = 48 (with nuR)

    # Scalars: bi-doublet + triplets for breaking
    scalars = 4 + 3 + 3  # Minimal: 10

    return scalars, vectors, fermions

# =============================================================================
# RESULTS
# =============================================================================

models = {
    "Standard Model": count_sm(),
    "MSSM": count_mssm(),
    "SO(10) GUT": count_so10(),
    "E6 GUT": count_e6(),
    "Left-Right Symmetric": count_left_right(),
}

print("=" * 70)
print("MODEL COMPARISON")
print("=" * 70)
print()
print(f"{'Model':<25} {'Scalars':<10} {'Vectors':<10} {'Fermions':<10} {'Status'}")
print("-" * 70)

violations = []

for model, (s, v, f) in models.items():
    status = ""
    issues = []

    if s > MAX_SCALARS:
        issues.append(f"S>{MAX_SCALARS}")
    if v > MAX_VECTORS:
        issues.append(f"V>{MAX_VECTORS}")
    if f > MAX_FERMIONS:
        issues.append(f"F>{MAX_FERMIONS}")

    if issues:
        status = "VIOLATION: " + ", ".join(issues)
        violations.append((model, s, v, f, issues))
    else:
        status = "OK"

    print(f"{model:<25} {s:<10} {v:<10} {f:<10} {status}")

print()
print("=" * 70)
print("ANALYSIS")
print("=" * 70)
print()

# SM analysis
sm_s, sm_v, sm_f = count_sm()
print(f"STANDARD MODEL:")
print(f"  Uses {sm_s}/{MAX_SCALARS} = {100*sm_s/MAX_SCALARS:.0f}% of scalar slots")
print(f"  Uses {sm_v}/{MAX_VECTORS} = {100*sm_v/MAX_VECTORS:.0f}% of vector slots")
print(f"  Uses {sm_f}/{MAX_FERMIONS} = {100*sm_f/MAX_FERMIONS:.0f}% of fermion slots")
print(f"  Total: {sm_s+sm_v+sm_f}/{TOTAL_CHANNELS} = {100*(sm_s+sm_v+sm_f)/TOTAL_CHANNELS:.0f}% of channels")
print()

# MSSM analysis
mssm_s, mssm_v, mssm_f = count_mssm()
print(f"MSSM:")
print(f"  Scalars:  {mssm_s} vs limit {MAX_SCALARS} -- {'VIOLATION!' if mssm_s > MAX_SCALARS else 'OK'}")
print(f"  Vectors:  {mssm_v} vs limit {MAX_VECTORS} -- {'VIOLATION!' if mssm_v > MAX_VECTORS else 'OK'}")
print(f"  Fermions: {mssm_f} vs limit {MAX_FERMIONS} -- {'VIOLATION!' if mssm_f > MAX_FERMIONS else 'OK'}")
print()

# E6 analysis
e6_s, e6_v, e6_f = count_e6()
print(f"E6 GUT:")
print(f"  Vectors:  {e6_v} vs limit {MAX_VECTORS} -- {'VIOLATION!' if e6_v > MAX_VECTORS else 'OK'}")
print(f"  Fermions: {e6_f} vs limit {MAX_FERMIONS} -- {'VIOLATION!' if e6_f > MAX_FERMIONS else 'OK'}")
print()

print("=" * 70)
print("CONCLUSIONS")
print("=" * 70)
print()

if not violations:
    print("All tested models satisfy the field content bounds!")
    print("The bound is NOT yet falsified.")
else:
    print(f"VIOLATIONS FOUND in {len(violations)} model(s):")
    for model, s, v, f, issues in violations:
        print(f"  {model}: {', '.join(issues)}")
    print()
    print("CRITICAL: These violations could falsify the framework!")
    print()
    print("Possible resolutions:")
    print("  1. Our counting is wrong (different definition of 'fields')")
    print("  2. These models are unphysical (nature respects our bound)")
    print("  3. Our framework is wrong")
    print("  4. The bounds apply to effective low-energy content, not GUT scale")

print()
print("=" * 70)
print("NOTES ON COUNTING")
print("=" * 70)
print("""
Important caveats:

1. SCALARS: We count complex scalar fields. After EWSB, the physical particle
   count differs. Our bound might apply to pre-EWSB or post-EWSB differently.

2. VECTORS: At GUT scale, gauge groups are larger. At low E, they break to SM.
   The bound might apply at low E (where alpha = 1/137 is measured).

3. FERMIONS: Weyl vs Dirac counting matters. We use Weyl. With Dirac, divide by 2.

4. MSSM SCALARS: The 49 scalar fields is a significant violation of the 15 limit.
   This is the most problematic result.

5. E6: Both vectors (78) and fermions (81) exceed limits. But E6 is at GUT scale.

INTERPRETATIONS:

A) The bounds apply at LOW ENERGY only:
   - At low E, we measure alpha = 1/137
   - At GUT, dimensions change, bounds change
   - MSSM at low E has ~5 physical Higgs scalars (within bound!)

B) Virtual vs real particles:
   - Bounds are on REAL particles at a given scale
   - SUSY partners are heavy, not accessible at 137-scale

C) We're counting differently:
   - "Comparison channels" != field degrees of freedom
   - Need clearer definition of what counts
""")
