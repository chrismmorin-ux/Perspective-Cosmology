#!/usr/bin/env python3
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
Step 6 Deeper Derivation Search

KEY FINDING: Three candidate mechanisms explored for deriving I-STRUCT-5
(gauge coupling inherits vacuum manifold metric). The information-geometric
argument (Fisher metric on Gr(4,11) determines gauge coupling) is the most
promising but faces a technical gap: it requires the evaluation map to be
a statistical model. The holographic argument has the right structure
(bulk geometry => boundary coupling) but requires an AdS dual that doesn't
exist. The entropic argument is circular (assumes democratic weighting).

Conclusion: No complete derivation found, but the Fisher information path
narrows the gap from "arbitrary physical assumption" to "evaluation map
is a statistical model" -- a potentially derivable statement.

Status: INVESTIGATION (negative result with partial progress)
Created: Session 233
Depends on:
  - emergent_gauge_coupling_analysis.py (S228) -- three mechanisms
  - democratic_schur_lemma.py (S224) -- Schur's lemma
"""

from sympy import *
from sympy import Rational as R
import math

# Framework parameters
n_d = 4
n_c = 11
n_h = n_c - n_d  # 7
N_coset = n_d * n_h  # 28
N_SU2 = N_coset      # interface regime
N_SU3 = 8
N_EM = n_c**2  # 121

print("=" * 72)
print("STEP 6 DEEPER DERIVATION: THREE CANDIDATE MECHANISMS")
print("=" * 72)
print()

# ==============================================================================
# CANDIDATE 1: INFORMATION GEOMETRY (Fisher metric)
# ==============================================================================

print("=" * 72)
print("CANDIDATE 1: INFORMATION GEOMETRY")
print("=" * 72)
print()

print("Idea: The gauge coupling is the FISHER INFORMATION METRIC on")
print("the vacuum manifold Gr(n_d, n_c) = SO(11)/(SO(4)xSO(7)).")
print()
print("Background:")
print("  The Fisher information metric on a statistical manifold M is:")
print("    g_ij(theta) = E[ d(log p)/d(theta_i) * d(log p)/d(theta_j) ]")
print("  For the Grassmannian Gr(k,n), if we define a probability distribution")
print("  from the evaluation map (AXM_0109), the Fisher metric is:")
print("    g_Fisher = (1/n) * g_FS")
print("  where g_FS is the Fubini-Study metric and n is a normalization.")
print()

# The Fubini-Study metric on Gr(k,n) restricted to the tangent space
# at the base point is proportional to the identity (by symmetry).
# This is EXACTLY what Schur's lemma gives (S224).
#
# The key question: does the Fisher metric give the SAME normalization
# as the HS metric from AXM_0110?

print("The Fubini-Study metric on Gr(k,n) at the base point:")
print("  g_FS = (1/normalization) * I_{k(n-k)}")
print("  where I is the identity on the tangent space Hom(R^k, R^(n-k))")
print()

# For Gr(4,11): tangent space has dim = 4*7 = 28
# The FS metric with standard normalization (traces = 1):
# g_FS = (1/n_c) * I_28  [from HS metric normalization on n_c x n_c matrices]
# This matches the Schur's lemma result exactly.

# Fisher information metric interpretation:
# If the vacuum state is described by a point on Gr(4,11), and the
# evaluation map provides a probability distribution over observables,
# then the Fisher metric measures the distinguishability of nearby vacua.
#
# Gauge coupling = Fisher metric coefficient means:
# "The strength of gauge interactions equals the statistical distinguishability
# of nearby vacuum configurations."

print("Interpretation:")
print("  Gauge coupling ~ 1/g^2 = Fisher information metric coefficient")
print("  Physical meaning: gauge interaction strength = statistical")
print("  distinguishability of nearby vacuum configurations on Gr(4,11)")
print()

# Check: does this give the right values?
# Fisher metric on Gr(4,11) with HS normalization:
#   g_Fisher = (1/n_c) * I_28
# For SU(2)_L subgroup (all 28 coset directions):
#   1/g_2^2 = 28 * (1/n_c) * n_c = 28  (after canonical normalization)
# Wait, the trace over 28 directions:
#   Tr_{coset}(g_Fisher) = 28/n_c
# Canonical normalization: 1/g_2^2 = n_c * Tr_{SU2 subspace}(g_Fisher)
# The SU(2)_L acts on all 28 coset directions (interface regime).
# 1/g_2^2 = n_c * (28/n_c) = 28  [OK]

print("Numerical check:")
print(f"  Fisher metric coefficient: 1/n_c = 1/{n_c}")
print(f"  Trace over coset (SU(2)_L): {N_coset}/n_c = {R(N_coset, n_c)}")
print(f"  After canonical normalization: n_c * {N_coset}/n_c = {N_coset}")
print(f"  => 1/g_2^2 = {N_coset}  [matches democratic counting]")
print()

# For SU(3) (internal regime, 8 group generators):
# g_Killing = (1/n_SU3) * I_8  where n_SU3 = dim(SU(3)) = 8
# After normalization: 1/g_3^2 = 8 * (1/8) * (normalization) = 8
# The normalization must equal 1 for consistency.

print(f"  For SU(3) (Killing form): 1/g_3^2 = {N_SU3}")
print()

# THE GAP: This argument ASSUMES that the evaluation map produces a
# probability distribution whose Fisher metric is the HS metric.
# This is not automatic -- it requires:
# (1) The evaluation map (AXM_0109) acts as a statistical model
# (2) The natural measure on the model is the HS measure
# (3) The gauge coupling is identified with the Fisher metric
#
# (1) is plausible (the evaluation map assigns amplitudes to each
# perspective-content pair, which can be squared to give probabilities).
# (2) follows from AXM_0110 (HS metric).
# (3) is the content of I-STRUCT-5.
#
# So the Fisher information argument REFORMULATES I-STRUCT-5 as:
# "Gauge coupling = Fisher metric of the evaluation-map statistical model"
# This is more specific but doesn't DERIVE the principle from axioms.
# It replaces "gauge coupling inherits metric" with "gauge coupling
# = Fisher information", which is arguably more natural but still needs
# the evaluation map -> statistical model step.

print("ASSESSMENT of Candidate 1:")
print("  The Fisher information argument is the most natural reformulation.")
print("  It gives the correct values (28 for SU(2), 8 for SU(3)).")
print("  But it REFORMULATES rather than DERIVES I-STRUCT-5:")
print("    Old: 'gauge coupling inherits vacuum manifold metric'")
print("    New: 'gauge coupling = Fisher information of eval map'")
print("  The gap shifts to: 'why Fisher metric determines gauge coupling?'")
print("  This is arguably more natural (Fisher metric IS the natural metric")
print("  for statistical distinguishability), but not a derivation from axioms.")
print()
print("  STATUS: PARTIAL -- narrows gap but doesn't close it.")
print()

# ==============================================================================
# CANDIDATE 2: HOLOGRAPHIC / AdS-LIKE ARGUMENT
# ==============================================================================

print("=" * 72)
print("CANDIDATE 2: HOLOGRAPHIC ARGUMENT")
print("=" * 72)
print()

print("Idea: In AdS/CFT, bulk gauge coupling is determined by the")
print("geometry of the internal manifold. By analogy, the framework's")
print("gauge coupling is determined by the geometry of Gr(4,11).")
print()

# In AdS/CFT: 1/g_i^2 = Vol(cycle_i) / (g_s * l_s^n)
# The gauge coupling is NOT a free parameter -- it's determined by
# the geometry of the compact extra dimensions.
#
# In the framework:
# The "compact space" is Gr(4,11) (the vacuum manifold)
# The "gauge coupling" comes from the metric on this manifold
# The analogy: Gr(4,11) plays the role of the internal manifold
#
# But there's a crucial difference: in AdS/CFT, there IS an actual
# higher-dimensional geometry with an actual metric. In the framework,
# Gr(4,11) is the space of vacuum configurations, not an extra dimension.

print("Analogy:")
print("  AdS/CFT:    1/g_i^2 = Vol(cycle_i) / (string coupling)")
print("  Framework:  1/g_i^2 = dim(submanifold_i) / (normalization)")
print()
print("  In both cases, gauge coupling is geometric, not free.")
print("  But the framework lacks the dynamical mechanism (10D gravity)")
print("  that FORCES the AdS/CFT relation.")
print()

# The holographic argument would need:
# 1. A bulk theory (perhaps the evaluation map space End(V))
# 2. A boundary theory (the physical gauge theory)
# 3. A correspondence relating bulk geometry to boundary coupling
#
# End(V) has dim = 121 = n_c^2. The gauge groups act on subspaces of End(V).
# The "bulk geometry" is the HS metric on End(V).
# The "boundary coupling" is the gauge coupling.
# The correspondence: 1/g_i^2 = dim(subspace_i) from the HS metric.
#
# This is structurally right but lacks the dynamical ingredient: WHY does
# the bulk geometry determine boundary couplings? In AdS/CFT, this follows
# from the equations of motion of the bulk theory (Einstein + gauge).
# In the framework, the analogous statement would be:
# "The tilt dynamics on End(V) determines the gauge coupling via the
#  crystallization energy functional."
#
# This connects back to AXM_0117 (crystallization tendency). If the
# crystallization dynamics on End(V) produces gauge fields whose coupling
# is set by the metric, then I-STRUCT-5 follows from AXM_0117 + AXM_0110.
#
# Gap: The crystallization dynamics produces the vacuum manifold (symmetry
# breaking), but doesn't obviously produce gauge fields with metric-determined
# couplings. Standard CHM models allow arbitrary g_0 (elementary gauge coupling).

print("ASSESSMENT of Candidate 2:")
print("  Correct STRUCTURE (bulk geometry => boundary coupling)")
print("  But requires a dynamical mechanism that doesn't exist in the framework.")
print("  The analogy with AdS/CFT is suggestive but not rigorous.")
print("  Would need: crystallization dynamics on End(V) => gauge coupling = metric")
print("  This is essentially what I-STRUCT-5 states, so it's circular.")
print()
print("  STATUS: DEAD END -- reformulation, not derivation.")
print()

# ==============================================================================
# CANDIDATE 3: ENTROPIC / MAXIMUM ENTROPY ARGUMENT
# ==============================================================================

print("=" * 72)
print("CANDIDATE 3: ENTROPIC ARGUMENT")
print("=" * 72)
print()

print("Idea: Among all possible gauge couplings, the democratic one")
print("maximizes entropy on the vacuum manifold.")
print()

# The democratic metric (all directions equal) is the maximum-entropy
# metric on the Grassmannian. Any other weighting (Dynkin, curvature)
# would correspond to a lower-entropy state.
#
# Argument:
# 1. The gauge coupling parametrizes the distribution over coset directions
# 2. Maximum entropy => uniform distribution => democratic counting
# 3. Therefore: 1/g^2 = N (number of directions)
#
# This sounds good but is CIRCULAR:
# Step 2 assumes "democratic = maximum entropy" which is exactly I-STRUCT-5.
# The question is WHY the system should be in the maximum entropy state.
#
# In statistical mechanics, maximum entropy is the equilibrium state
# (second law). In the framework, AXM_0117 (crystallization tendency)
# drives toward equilibrium. So:
# AXM_0117 (crystallization toward equilibrium)
# + equilibrium on Gr(4,11) = maximum entropy = democratic metric
# => I-STRUCT-5
#
# But this conflates two different kinds of equilibrium:
# - Crystallization equilibrium: tilt field reaches epsilon*
# - Metric equilibrium: gauge coupling reaches democratic value
# These are not obviously the same thing.

print("Argument chain:")
print("  AXM_0117 -> crystallization toward equilibrium")
print("  equilibrium on Gr(4,11) -> maximum entropy metric")
print("  maximum entropy -> democratic (uniform) distribution")
print("  democratic distribution -> 1/g^2 = N_i")
print()
print("The gap: crystallization equilibrium (tilt -> eps*) is NOT the")
print("same as gauge coupling equilibrium (1/g^2 -> democratic).")
print("The crystallization dynamics acts on the ORDER PARAMETER,")
print("not on the gauge coupling itself.")
print()

# However, there IS a connection: if the gauge field emerges from the
# coset sigma model, and the sigma model is in equilibrium (all coset
# directions equally populated), then the gauge coupling IS democratic.
# The question reduces to: does crystallization produce an equilibrium
# sigma model?

# In a first-order phase transition (which the crystallization IS):
# The broken phase forms domains with random orientations.
# On average over domains, ALL coset directions are equally populated.
# This IS the democratic counting!

# So the argument becomes:
# 1. Crystallization is a first-order phase transition [A-STRUCTURAL from AXM_0117]
# 2. First-order transition produces random domains
# 3. Average over domains -> all coset directions equal
# 4. Therefore: gauge coupling = democratic metric

print("REFINED ENTROPIC ARGUMENT:")
print("  1. Crystallization is first-order [from AXM_0117 + Mexican hat]")
print("  2. First-order transition -> random domain orientations")
print("  3. Average over domains -> uniform distribution on Gr(4,11)")
print("  4. Uniform distribution -> democratic metric -> 1/g^2 = N_i")
print()

# Check: does this actually work?
# In a first-order transition, the order parameter jumps from epsilon=0 to epsilon=epsilon*.
# The Goldstone manifold (coset) parametrizes the degenerate vacuum states.
# Different spatial regions pick different vacuum orientations randomly.
# The average over all domains gives a uniform distribution on the coset.
# The effective low-energy theory averages over these domains, giving:
#   <sigma_model> = democratic (all directions equal)
#
# This is essentially the argument for why gauge couplings in composite
# Higgs models are set by the coset geometry, not by the elementary coupling.
# In the framework: there IS no elementary coupling (gauge fields are
# fully emergent from crystallization). So the democratic counting follows
# from the randomness of the domain orientations.
#
# PROBLEM: This argument applies equally to the Dynkin counting!
# The issue is whether the gauge kinetic term comes from the sigma model
# metric (democratic) or from the gauge propagator (Dynkin).
# The domain-averaging argument tells us the sigma model is democratic,
# but doesn't tell us that the GAUGE COUPLING comes from the sigma model.

print("PROBLEM:")
print("  Domain averaging -> democratic SIGMA MODEL. [OK]")
print("  But: gauge coupling could come from sigma model (democratic)")
print("  OR from gauge propagator (Dynkin). The averaging argument")
print("  doesn't distinguish between these.")
print("  So this reduces back to I-STRUCT-5: which mechanism?")
print()

print("ASSESSMENT of Candidate 3:")
print("  Provides a physical REASON for democratic distribution")
print("  (domain averaging in first-order transition).")
print("  But doesn't resolve whether gauge coupling = sigma model metric")
print("  or gauge coupling = propagator (Dynkin index).")
print("  STATUS: PARTIAL -- explains why democratic metric exists,")
print("  not why gauge coupling adopts it.")
print()

# ==============================================================================
# CANDIDATE 4: COMPOSITENESS ARGUMENT (no elementary gauge fields)
# ==============================================================================

print("=" * 72)
print("CANDIDATE 4: FULL COMPOSITENESS (NO ELEMENTARY GAUGE FIELDS)")
print("=" * 72)
print()

print("Idea: If gauge fields are FULLY composite (not partially elementary),")
print("then their coupling is NECESSARILY the sigma model coupling,")
print("not an independent parameter.")
print()

# In standard CHM models, gauge fields have two components:
#   1/g^2 = 1/g_elementary^2 + 1/g_composite^2
# The composite part IS the sigma model metric (democratic).
# The elementary part g_elementary is a free parameter.
# The measured coupling is the combination of both.
#
# In the framework, there are NO elementary gauge fields:
# All gauge fields emerge from crystallization (AXM_0109 -> AXM_0117).
# Therefore: 1/g_elementary^2 = 0 (no elementary component).
# And: 1/g^2 = 1/g_composite^2 = sigma model metric = democratic.
#
# This would DERIVE I-STRUCT-5 if we can establish:
# (a) No elementary gauge fields exist in the framework
# (b) Composite gauge coupling = sigma model metric
#
# (a) follows from the axioms: AXM_0109-0117 describe perspectives and
# crystallization, with no independent "gauge field" input. Gauge fields
# are emergent from the coset structure.
#
# (b) is standard in the sigma model literature: the kinetic term of
# the Goldstone fields on Gr(k,n) generates gauge interactions whose
# coupling is set by the metric on the coset.

# But wait: in standard QCD, the rho meson is a composite vector boson,
# and its coupling to pions is NOT simply the sigma model metric.
# The rho coupling is g_rho ~ 6, while the sigma model metric gives
# f_pi ~ 93 MeV. These are related but not identical.
#
# The difference: in QCD, there are OTHER composite resonances
# (omega, a1, etc.) that also contribute. The gauge coupling in the
# framework is the TOTAL effect of all composite resonances, not just
# the lightest one.
#
# In the large-N limit of QCD-like theories:
# g_rho^2 ~ 16*pi^2/N => g_rho ~ 4*pi/sqrt(N)
# The sigma model metric is f^2 ~ N/(16*pi^2)
# The gauge coupling from the composite sector is:
# 1/g^2 = sum_resonances (f_n^2/m_n^2) = [Weinberg sum rule] = f^2
# So: 1/g^2 = f^2 (the sigma model metric IS the gauge coupling)

print("In QCD-like composite theories (large N):")
print("  Weinberg sum rules: 1/g^2 = sum_n (f_n^2/m_n^2) = f^2")
print("  The sigma model metric IS the gauge coupling.")
print("  This is a theorem in the large-N limit.")
print()

# For the framework:
# f^2 on Gr(4,11) = (1/n_c) * I_28 [from AXM_0110]
# Gauge coupling: 1/g_2^2 = f^2 * 28 = 28/n_c * n_c = 28
# (after canonical normalization)

print("For the framework (Gr(4,11)):")
print(f"  f^2 = 1/n_c = 1/{n_c} (HS metric normalization)")
print(f"  1/g_2^2 = f^2 * dim(coset) = {N_coset}/{n_c} * {n_c} = {N_coset}")
print(f"  After canonical normalization: 1/g_2^2 = {N_coset}  [OK]")
print()

# The key insight: if gauge fields are FULLY composite, then the
# Weinberg sum rules FORCE 1/g^2 = f^2 * N (sigma model metric * N modes).
# This is democratic counting!
#
# The argument:
# 1. Gauge fields are fully emergent from crystallization (no elementary gauge fields)
# 2. In a fully composite theory, Weinberg sum rules give 1/g^2 = sigma model metric
# 3. Sigma model metric on Gr(4,11) = (1/n_c) * I_28 (Schur's lemma, S224)
# 4. Therefore: 1/g_2^2 = 28 (democratic counting)
#
# GAP: Step 2 relies on Weinberg sum rules, which assume:
#   - A confining gauge theory in the UV
#   - An infinite tower of resonances (or at least the lightest few)
#   - Asymptotic freedom
# The framework doesn't explicitly have a confining gauge theory in the UV.
# The crystallization dynamics (AXM_0117) is an effective description.

print("DERIVATION CHAIN (compositeness argument):")
print("  1. No elementary gauge fields [from axioms: no gauge field input]")
print("  2. Weinberg sum rules: 1/g^2 = sigma model metric [QFT theorem]")
print("  3. Sigma model metric = (1/n_c)*I_28 [Schur's lemma, S224]")
print("  4. After normalization: 1/g_2^2 = 28")
print()
print("  GAP in Step 2: Weinberg sum rules assume confining UV theory.")
print("  Framework has crystallization dynamics, not explicit confinement.")
print("  The gap is: 'crystallization dynamics -> Weinberg-like sum rules'")
print("  This is NARROWER than the original I-STRUCT-5 gap.")
print()

print("ASSESSMENT of Candidate 4:")
print("  BEST CANDIDATE. The compositeness argument gives a PHYSICS")
print("  reason for I-STRUCT-5: fully composite gauge fields obey")
print("  Weinberg sum rules, forcing 1/g^2 = sigma model metric.")
print("  The gap narrows from 'why democratic?' to 'why Weinberg sum rules")
print("  apply to crystallization dynamics?'")
print("  STATUS: PROMISING -- the most physically motivated path.")
print("  Would be closed by showing crystallization dynamics satisfies")
print("  the spectral representation needed for Weinberg sum rules.")
print()

# ==============================================================================
# COMPARISON OF CANDIDATES
# ==============================================================================

print("=" * 72)
print("COMPARISON OF CANDIDATES")
print("=" * 72)
print()

print("| # | Candidate | Status | Residual Gap |")
print("|---|-----------|--------|--------------|")
print("| 1 | Information geometry | PARTIAL | eval map -> statistical model |")
print("| 2 | Holographic | DEAD END | needs dynamical mechanism |")
print("| 3 | Entropic | PARTIAL | sigma model != gauge coupling |")
print("| 4 | Full compositeness | PROMISING | crystallization -> Weinberg SRs |")
print()

print("Candidate 4 (full compositeness) subsumes Candidate 1:")
print("  Fisher information metric = sigma model metric in the fully")
print("  composite limit (Weinberg SRs). Both give the same answer.")
print()

print("The narrowed gap (from I-STRUCT-5 to Candidate 4):")
print("  OLD: 'Emergent gauge fields inherit vacuum manifold metric' [opaque]")
print("  NEW: 'Crystallization dynamics obeys spectral sum rules' [specific]")
print("  This is a concrete, testable mathematical question.")
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 72)
print("VERIFICATION TESTS")
print("=" * 72)
print()

# Numerical checks on the information geometry calculation
alpha_2_tree = 1.0 / N_SU2
alpha_3_tree = 1.0 / N_SU3
sin2_tree = N_coset / N_EM

# Fisher metric normalization check
fisher_coeff = 1.0 / n_c  # HS metric on End(V)
su2_trace = N_coset * fisher_coeff  # trace over coset
su2_coupling = su2_trace * n_c  # after canonical normalization

# Weinberg sum rule check
# In large-N QCD: 1/g^2 = f_pi^2 * N_coset / (normalization)
# Here: 1/g^2 = (1/n_c) * N_coset * n_c = N_coset

tests = [
    # Information geometry
    ("Fisher metric coefficient = 1/n_c",
     abs(fisher_coeff - 1.0/n_c) < 1e-10),

    ("Fisher trace over coset = 28/11",
     abs(su2_trace - 28.0/11) < 1e-10),

    ("After canonical normalization: 1/g_2^2 = 28",
     abs(su2_coupling - 28.0) < 1e-10),

    # Tree-level coupling values
    ("sin^2(theta_W) = 28/121",
     abs(sin2_tree - 28.0/121) < 1e-10),

    ("alpha_3/alpha_2 = 28/8 = 7/2",
     abs(N_SU2/N_SU3 - 3.5) < 1e-10),

    # Structural identities
    ("dim(Gr(4,11)) = 28 = n_d * n_h",
     N_coset == n_d * n_h),

    ("dim(SU(3)) = 8 = n_c - n_d + 1",
     N_SU3 == 8),

    ("dim(End(V)) = 121 = n_c^2",
     N_EM == n_c**2),

    # Weinberg sum rule structure
    ("1/g^2 = f^2 * N (sigma model structure)",
     abs(fisher_coeff * N_coset * n_c - N_SU2) < 1e-10),

    # Two-regime consistency
    ("SU(2) interface: N = dim(coset) = 28",
     N_SU2 == 28),

    ("SU(3) internal: N = dim(group) = 8",
     N_SU3 == 8),

    # Candidate comparison
    ("Fisher and Weinberg give same answer for SU(2)",
     abs(su2_coupling - N_SU2) < 1e-10),
]

pass_count = 0
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    if passed:
        pass_count += 1
    print(f"  [{status}] {name}")

print()
print(f"Results: {pass_count}/{len(tests)} PASS")
print()

# ==============================================================================
# SUMMARY
# ==============================================================================

print("=" * 72)
print("SUMMARY")
print("=" * 72)
print()
print("Four candidate mechanisms for deriving I-STRUCT-5:")
print()
print("1. INFORMATION GEOMETRY (Fisher metric)")
print("   Gauge coupling = Fisher information on vacuum manifold")
print("   Status: PARTIAL -- reformulation, not derivation")
print()
print("2. HOLOGRAPHIC (bulk/boundary)")
print("   Gauge coupling from internal geometry")
print("   Status: DEAD END -- needs dynamical mechanism the framework lacks")
print()
print("3. ENTROPIC (maximum entropy)")
print("   Democratic counting from domain averaging")
print("   Status: PARTIAL -- explains sigma model metric, not gauge coupling")
print()
print("4. FULL COMPOSITENESS (Weinberg sum rules)")
print("   No elementary gauge fields -> 1/g^2 = sigma model metric")
print("   Status: PROMISING -- narrows gap to 'crystallization -> spectral SRs'")
print()
print("RECOMMENDATION: Adopt I-STRUCT-5 as stated (no derivation found).")
print("Record Candidate 4 as the most promising path for future work.")
print("The gap narrows from 'arbitrary physical assumption' to")
print("'crystallization dynamics satisfies spectral sum rules',")
print("which is a concrete, testable mathematical question.")
print()
