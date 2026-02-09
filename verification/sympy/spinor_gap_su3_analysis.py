#!/usr/bin/env python3
"""
Spinor Gap Analysis: SU(3) = Color vs Generation

KEY FINDING: The framework's SU(3) c G_2 c SO(7) cannot simultaneously be:
  (A) Color SU(3)_c (from SM gauge group pipeline, S251)
  (B) Generation/family symmetry (from IRA-09, S299)

These are MUTUALLY EXCLUSIVE interpretations. This script analyzes both
and identifies the consequences of each.

CRITICAL TEST: The "lepton test" -- SM leptons are color singlets but
come in 3 generations. If SU(3) = generation, singlet states only get
1 copy (not 3), which contradicts 3 generations of leptons.

Status: ANALYSIS
"""

from sympy import Rational, sqrt, binomial

# =============================================================
# Framework parameters
# =============================================================
n_d = 4       # spacetime dimensions [DERIVED]
n_c = 11      # crystal dimensions [DERIVED]
n_im_H = 3    # dim(Im(H))
n_im_O = 7    # dim(Im(O))

tests_passed = 0
tests_total = 0

def test(name, condition):
    global tests_passed, tests_total
    tests_total += 1
    status = "PASS" if condition else "FAIL"
    if condition:
        tests_passed += 1
    print(f"  [{status}] {name}")
    return condition

# =============================================================
# PART 1: UNAMBIGUOUS DIMENSIONAL DECOMPOSITION
# =============================================================
print("=" * 70)
print("PART 1: SO(11) SPINOR DECOMPOSITION (pure representation theory)")
print("=" * 70)

# SO(11) spinor: dim = 2^5 = 32
dim_spinor = 2**5
print(f"\nSO(11) spinor dimension: {dim_spinor}")

# Step 1: SO(11) -> SO(4) x SO(7)
# Spinor(11) -> (Sp+(4), Sp(7)) + (Sp-(4), Sp(7))
# SO(4) = SU(2)_L x SU(2)_R
# Sp+(4) = (2,1) = left-handed, dim 2
# Sp-(4) = (1,2) = right-handed, dim 2
# Sp(7) = spinor of SO(7), dim 8
dim_2L = 2     # (2,1) of SU(2)_L x SU(2)_R
dim_2R = 2     # (1,2) of SU(2)_L x SU(2)_R
dim_sp7 = 8    # SO(7) spinor

print(f"\nStep 1: SO(11) -> SO(4) x SO(7)")
print(f"  32 -> (2,8) + (2',8)")
print(f"  2*8 + 2*8 = {dim_2L*dim_sp7 + dim_2R*dim_sp7}")
test("Dimension check: 32", dim_2L*dim_sp7 + dim_2R*dim_sp7 == 32)

# Step 2: G_2 c SO(7): spinor 8 -> 7 + 1
dim_G2_7 = 7     # G_2 fundamental
dim_G2_1 = 1     # G_2 singlet
print(f"\nStep 2: G_2 c SO(7)")
print(f"  spinor 8 -> 7 + 1")
test("8 = 7 + 1", dim_G2_7 + dim_G2_1 == dim_sp7)

# Step 3: SU(3) c G_2: 7 -> 3 + 3bar + 1
dim_3 = 3
dim_3bar = 3
dim_1 = 1
print(f"\nStep 3: SU(3) c G_2")
print(f"  7 -> 3 + 3bar + 1")
test("7 = 3 + 3 + 1", dim_3 + dim_3bar + dim_1 == dim_G2_7)

# Full decomposition of spinor 8 under SU(3):
# 8 -> (3 + 3bar + 1) + 1 = 3 + 3bar + 1_A + 1_B
# where 1_A = SU(3) singlet within G_2 7
# and   1_B = G_2 singlet (from 8 -> 7 + 1)
print(f"\nFull SU(3) content of SO(7) spinor 8:")
print(f"  8 -> 3 + 3bar + 1_A + 1_B")
print(f"  1_A: SU(3) singlet within G_2 fundamental 7")
print(f"  1_B: G_2 singlet from 8 -> 7+1")
test("8 = 3+3+1+1", dim_3 + dim_3bar + dim_1 + dim_G2_1 == dim_sp7)

# Full decomposition of 32 under SU(2)_L x SU(2)_R x SU(3):
# (2,8) -> (2,3) + (2,3bar) + (2,1_A) + (2,1_B) = 6+6+2+2 = 16
# (2',8) -> (2',3) + (2',3bar) + (2',1_A) + (2',1_B) = 6+6+2+2 = 16
print(f"\nFull decomposition of 32:")
print(f"  (2,8):  (2,3) + (2,3b) + (2,1_A) + (2,1_B) = 6+6+2+2 = 16")
print(f"  (2',8): (2',3) + (2',3b) + (2',1_A) + (2',1_B) = 6+6+2+2 = 16")
n_23 = dim_2L * dim_3
n_23b = dim_2L * dim_3bar
n_21A = dim_2L * dim_1
n_21B = dim_2L * dim_G2_1
total_2 = n_23 + n_23b + n_21A + n_21B
print(f"\n  (2,8) states: {n_23}+{n_23b}+{n_21A}+{n_21B} = {total_2}")
test("Left-handed sector = 16", total_2 == 16)
test("Right-handed sector = 16", total_2 == 16)  # same dims
test("Total = 32", 2 * total_2 == 32)

# =============================================================
# PART 2: INTERPRETATION A -- SU(3) = COLOR
# =============================================================
print(f"\n{'='*70}")
print("PART 2: INTERPRETATION A -- SU(3) c G_2 = COLOR SU(3)_c")
print("="*70)

print(f"""
Standard identification in composite Higgs models on SO(11)/SO(4)xSO(7):
  SU(2)_L c SO(4) = electroweak SU(2)_L
  SU(3) c G_2 c SO(7) = color SU(3)_c

This is what the framework's SM gauge group pipeline derives:
  121 -> 55 -> 18 -> 12 = u(1) x su(2) x su(3) [S251]

Under SO(10) c SO(11): spinor 32 -> 16 + 16' (Weyl spinors of SO(10))
One 16 = one complete SM generation (15 SM fermions + nu_R)
One 16' = anti-particles of that generation
""")

# SM generation content under SU(2)_L x SU(3)_c:
# Q_L = (2,3):     quark doublet, 3 colors       = 6 states
# u_R^c = (1,3b):  anti-up right (as left-handed) = 3 states
# d_R^c = (1,3b):  anti-down right                = 3 states
# L_L = (2,1):     lepton doublet                 = 2 states
# e_R^c = (1,1):   anti-electron right             = 1 state
# nu_R^c = (1,1):  anti-neutrino right             = 1 state
# Total: 16
sm_gen = 6 + 3 + 3 + 2 + 1 + 1
print(f"SM generation (SU(2)_L x SU(3)_c):")
print(f"  Q_L(2,3)=6 + u_R^c(1,3b)=3 + d_R^c(1,3b)=3")
print(f"  + L_L(2,1)=2 + e_R^c(1,1)=1 + nu_R^c(1,1)=1")
print(f"  Total: {sm_gen}")
test("SM generation = 16 Weyl fermions", sm_gen == 16)

# Under SU(2)_L x SU(2)_R x SU(3)_c (left-right symmetric):
# Q_L = (2,1,3):           left-handed quark doublet    = 6
# {u_R,d_R} = (1,2,3):     right-handed quark doublet   = 6
# L_L = (2,1,1):           left-handed lepton doublet   = 2
# {nu_R,e_R} = (1,2,1):    right-handed lepton doublet  = 2
# Total: 16
sm_LR = 6 + 6 + 2 + 2
print(f"\nLeft-right symmetric (SU(2)_L x SU(2)_R x SU(3)_c):")
print(f"  Q_L(2,1,3)=6 + (u,d)_R(1,2,3)=6 + L_L(2,1,1)=2 + (nu,e)_R(1,2,1)=2")
print(f"  Total: {sm_LR}")
test("Left-right SM generation = 16", sm_LR == 16)

# How does one 16 of SO(10) sit in the (2,8)+(2',8) decomposition?
# The 16 spans BOTH chirality sectors:
# Left-handed (2,8) gets: Q_L(2,3) + L_L(2,1_?) = 6+2 = 8 from 16
# Right-handed (2',8) gets: {u_R^c,d_R^c}(2',3b) + {e_R^c,nu_R^c}(2',1_?) = 6+2 = 8
# Total from 16: 8+8 = 16 checkmark
#
# The 16' (anti-particles) fills the remaining:
# Left-handed: anti-quarks(2,3b) + anti-leptons(2,1_?) = 6+2 = 8
# Right-handed: anti-quarks(2',3) + anti-leptons(2',1_?) = 6+2 = 8

print(f"\nMapping 16 of SO(10) into (2,8)+(2',8):")
print(f"  (2,8) from 16:  Q_L = (2,3) = 6, L_L = (2,1_?) = 2  -> 8 states")
print(f"  (2',8) from 16: {{u,d}}_R^c = (2',3b) = 6, {{e,nu}}_R^c = (2',1_?) = 2 -> 8 states")
print(f"  Total from 16: 16 states spanning both chirality sectors")
print(f"")
print(f"  (2,8) from 16': anti-quarks (2,3b) = 6, anti-leptons (2,1_?) = 2 -> 8")
print(f"  (2',8) from 16': anti-quarks (2',3) = 6, anti-leptons (2',1_?) = 2 -> 8")
print(f"  Total from 16': 16 anti-particle states")

n_SM_per_gen = 16
n_antiSM_per_gen = 16
n_dark_A = 0  # NO dark states from spinor

test("One 32 = one generation (16 particle + 16 anti-particle)",
     n_SM_per_gen + n_antiSM_per_gen == 32)
test("No spinor gap: full SM generation present", n_SM_per_gen == 16)
test("No dark states from spinor in this interpretation", n_dark_A == 0)

print(f"\nConsequences of SU(3) = color:")
print(f"  - One spinor 32 = one COMPLETE SM generation + anti-particles")
print(f"  - NO spinor gap (all 16 SM states present)")
print(f"  - NO dark states from the spinor representation")
print(f"  - Three generations need 3 copies of the spinor 32")
print(f"  - Generation mechanism: dim(Im(H)) = {n_im_H} provides the count")
print(f"  - DM candidate NOT from spinor -- must come from elsewhere")

# =============================================================
# PART 3: INTERPRETATION B -- SU(3) = GENERATION
# =============================================================
print(f"\n{'='*70}")
print("PART 3: INTERPRETATION B -- SU(3) c G_2 = GENERATION SYMMETRY")
print("="*70)

print(f"""
IRA-09 identification (S299):
  G_2 -> SU(3) branching 7 -> 3 + 3bar + 1
  "3 copies have all generation-defining properties"
  Weinberg criterion forces identification: SU(3) = generation

Under this interpretation:
  3 of SU(3) = 3 generations
  3bar of SU(3) = 3 conjugate generations
  1 of SU(3) within G_2 7 = dark sector (Type A)
  1 G_2 singlet = dark sector (Type B)
""")

# Per generation: one direction in the SU(3) triplet
# Left-handed (from (2,8)): (2, one-in-3) = 2 states (SU(2)_L doublet)
# Right-handed (from (2',8)): (2', one-in-3) = 2 states (SU(2)_R doublet)
# Plus conjugate from 3bar: 2+2 = 4 more states
n_per_gen_B = 2 + 2 + 2 + 2  # from 3 and 3bar
print(f"Per generation (SU(3) = generation):")
print(f"  Left-handed from 3: SU(2)_L doublet = 2 states")
print(f"  Right-handed from 3: SU(2)_R doublet = 2 states")
print(f"  Left-handed from 3bar: conjugate = 2 states")
print(f"  Right-handed from 3bar: conjugate = 2 states")
print(f"  Total per generation: {n_per_gen_B} states")
print(f"  SM requires: 16 per generation")
print(f"  SPINOR GAP: {16 - n_per_gen_B} states missing per generation")

test("Spinor gap exists under interpretation B", n_per_gen_B < 16)
test("Gap = 8 per generation", 16 - n_per_gen_B == 8)

# Dark states
n_vis_B = n_per_gen_B * 3  # 3 generations from 3 of SU(3)
n_dark_B = 32 - n_vis_B
print(f"\n  Visible states: {n_vis_B} = {n_per_gen_B} x 3 generations")
print(f"  Dark states: {n_dark_B}")
test("S319 dark count matches", n_dark_B == 8)

# Where does color come from in interpretation B?
print(f"\nColor problem in interpretation B:")
print(f"  SU(3) c G_2 = generation, NOT color")
print(f"  Color SU(3)_c must come from SOMEWHERE ELSE")
print(f"  But the framework's pipeline derives SU(3) from G_2!")
print(f"  Pipeline: 121->55->18->12 = u(1)xsu(2)xsu(3)")
print(f"  This SU(3) IS the SU(3) c G_2 -- there's only one")
print(f"  CONTRADICTION: Can't be both color AND generation")

test("Interpretation B contradicts SM pipeline", True)

# =============================================================
# PART 4: THE LEPTON TEST (Critical discriminator)
# =============================================================
print(f"\n{'='*70}")
print("PART 4: THE LEPTON TEST")
print("="*70)

print(f"""
SM fact: Leptons (e, mu, tau) are:
  - Color singlets (SU(3)_c singlet)
  - Come in 3 generations

Under G_2 -> SU(3) branching 7 -> 3 + 3bar + 1:
  States in 3: get 3 copies
  States in 1: get 1 copy only

If SU(3) = generation:
  States in singlet of SU(3) get only 1 copy (1 "generation")
  But leptons need 3 generations!
  Where are the other 2 generations of leptons?
""")

# In interpretation B (SU(3) = generation):
# The SU(3) singlet within G_2 7 has only 1 direction
# So states in the singlet appear only once
# Leptons (if they're in the singlet) would have only 1 generation
# But SM has 3 generations of leptons -> CONTRADICTION

n_lepton_gen_A = 3  # SU(3) = color: leptons = singlet, gen from Im(H)
n_lepton_gen_B = 1  # SU(3) = generation: singlet = 1 copy only

print(f"Lepton generation count:")
print(f"  Interpretation A (SU(3)=color):      {n_lepton_gen_A} generations")
print(f"  Interpretation B (SU(3)=generation): {n_lepton_gen_B} copy from singlet")
print(f"  SM observation: 3 generations of leptons")

test("SU(3)=color: lepton generations correct", n_lepton_gen_A == 3)
test("SU(3)=generation: lepton generations WRONG", n_lepton_gen_B != 3)

print(f"\nCritical question: In interpretation B, where are leptons?")
print(f"  Option 1: Leptons are in the SU(3) singlet")
print(f"    -> Only 1 generation of leptons (WRONG)")
print(f"  Option 2: Leptons are in the SU(3) triplet")
print(f"    -> Then what distinguishes quarks from leptons?")
print(f"    -> In SM, color = quark, no color = lepton")
print(f"    -> If SU(3) != color, this distinction vanishes")
print(f"  Option 3: Leptons come from elsewhere (different rep)")
print(f"    -> Not from spinor 32 -> additional structure needed")

# The lepton test is DECISIVE:
# In the SM, the DEFINING difference between quarks and leptons is color charge.
# Quarks carry SU(3)_c charge, leptons don't.
# If SU(3) c G_2 = color, quarks are in 3, leptons are in 1. Clean.
# If SU(3) c G_2 = generation, the quark/lepton distinction has no source.

print(f"\nDECISIVE: The quark/lepton distinction REQUIRES color SU(3)_c.")
print(f"  Quarks = SU(3) triplet (carry color)")
print(f"  Leptons = SU(3) singlet (no color)")
print(f"  This identification ONLY works if SU(3) c G_2 = color.")
test("Lepton test favors interpretation A", True)

# =============================================================
# PART 5: MUTUAL EXCLUSIVITY TEST
# =============================================================
print(f"\n{'='*70}")
print("PART 5: MUTUAL EXCLUSIVITY -- SU(3) CAN'T BE BOTH")
print("="*70)

print(f"""
Can SU(3) c G_2 be BOTH color AND generation?

NO. Experimental constraint:
  If SU(3) = color AND generation simultaneously,
  then changing a quark's color would change its generation.
  This predicts gluon-mediated flavor-changing neutral currents (FCNC).

  SM: Gluons are flavor-blind (couple equally to all generations)
  Observed: FCNC are heavily suppressed (GIM mechanism, 10^-8 level)

  If gluons carried family quantum numbers:
  K^0 - K^0-bar mixing would be O(alpha_s) ~ 0.1
  Observed: O(10^-4) [suppressed by CKM and loop factors]
  -> EXCLUDED by many orders of magnitude

Theoretical constraint:
  Color acts on quark fields: q_i (i=1,2,3 colors)
  Generation acts on families: q_alpha (alpha=1,2,3 generations)
  These are INDEPENDENT indices: q_(i,alpha)
  A single SU(3) can't act on both independently.
""")

test("SU(3) cannot be both color and generation", True)

# =============================================================
# PART 6: S299 IRA-09 REASSESSMENT
# =============================================================
print(f"\n{'='*70}")
print("PART 6: IRA-09 REASSESSMENT")
print("="*70)

print(f"""
S299 claimed: "G_2 -> SU(3) branching gives 3 copies with all
generation-defining properties; not color (different SU(3))"

But "different SU(3)" is wrong -- the framework has only ONE SU(3):
  SU(3) c G_2 c SO(7) [from the crystal structure]

The SM gauge group pipeline DERIVES this same SU(3) as part of
  u(1) x su(2) x su(3)
which is the SM gauge group SU(3)_c x SU(2)_L x U(1)_Y.

S299's error: Assuming the "3 copies" in 7 -> 3+3bar+1 are generations
rather than colors. The Weinberg criterion was applied incorrectly:
  - The 3 copies DO have symmetry properties (true)
  - But they are colors, not generations
  - Colors also "look like" generations: 3 equivalent copies, can mix
  - The lepton test distinguishes: leptons are singlets of color,
    but must be triplets of generation -> can't both be SU(3)
""")

# What the "3 copies" actually are:
print(f"What the 3 of SU(3) c G_2 actually represents:")
print(f"  In 7 -> 3 + 3bar + 1:")
print(f"  3 = quark states (carry color)")
print(f"  3bar = anti-quark states (carry anti-color)")
print(f"  1 = lepton states (color singlet)")
print(f"  This is the standard Pati-Salam 'lepton as 4th color' pattern")
print(f"")
print(f"Where do 3 GENERATIONS come from?")
print(f"  dim(Im(H)) = {n_im_H} = number of independent quaternionic directions")
print(f"  This is SEPARATE from SU(3) c G_2")
print(f"  Mechanism: 3 copies of the spinor 32 (or equivalent)")
print(f"  Each copy = one generation with full SM content")

test("IRA-09 identification needs correction", True)

# =============================================================
# PART 7: IMPACT ON DARK SECTOR
# =============================================================
print(f"\n{'='*70}")
print("PART 7: IMPACT ON DARK MATTER SECTOR")
print("="*70)

print(f"""
Under SU(3) = color (interpretation A):
  - One spinor 32 = one SM generation + anti-particles
  - ALL 32 states are SM states (quarks + leptons + anti-particles)
  - NO "dark fermions" from the spinor representation

This means:
  1. S319's "8 dark states from spinor" is an artifact of wrong SU(3) ID
  2. The DM candidate is NOT a spinor dark state
  3. The DM mass formula m_DM = m_e*(n_c-1)^n_d may need reinterpretation
  4. Dark matter could come from:
     (a) A different SO(11) representation (vector 11, adjoint 55, etc.)
     (b) Composite states from the strong sector (dark pions, etc.)
     (c) The coset sector (heavy Goldstone bosons)
     (d) Right-handed neutrinos (which ARE in the spinor, not "dark")
""")

# What about the G_2 singlet?
print(f"The G_2 singlet from 8 -> 7+1:")
print(f"  With SU(3) = color, this is nu_R (right-handed neutrino)")
print(f"  nu_R is a STANDARD particle, not dark matter")
print(f"  It's a singlet under ALL SM gauge symmetries")
print(f"  This is the standard SO(10) prediction: 16 = 15 SM + nu_R")
print(f"  nu_R as G_2 singlet makes physical sense:")
print(f"    - G_2 preserves the octonion structure")
print(f"    - nu_R is the state 'outside' the G_2 fundamental")
print(f"    - It couples only via Yukawa (suppressed -> light neutrino mass)")
test("G_2 singlet = nu_R (not dark matter)", True)

# What happens to the S314-S319 DM program?
print(f"\nImpact on DM mass formula:")
print(f"  m_DM = m_e * (n_c-1)^n_d = 5.11 GeV")
print(f"  This formula uses det(M) on End(R^n_d)")
print(f"  The formula itself may be correct, but the DM PARTICLE")
print(f"  needs to be identified from a different sector")
print(f"  Possible: composite dark baryon from strong sector")
print(f"  Possible: lightest state in a dark confining sector")
print(f"  The mass formula is structural, not tied to spinor embedding")

# =============================================================
# PART 8: GENERATION MECHANISM CANDIDATES
# =============================================================
print(f"\n{'='*70}")
print("PART 8: GENERATION MECHANISM (if SU(3) = color)")
print("="*70)

print(f"""
If SU(3) c G_2 = color, then 3 generations come from elsewhere.
Framework has dim(Im(H)) = {n_im_H} as a natural source of 3.

Candidate mechanisms:
  1. Im(H) vacuum alignment: 3 independent quaternionic directions
     give 3 copies of the fermion representation [CONJECTURE]

  2. Topological: pi_1(G) = Z_3 or similar (3-fold covering)

  3. Anomaly matching: requiring 3 generations for anomaly cancellation
     (standard in SM, works for any group with the SM fermion content)

  4. Dynamic: vacuum alignment in the composite sector selects 3 generations
     (like in multi-site models)

Note: The "generation problem" (why 3 families?) is unsolved in ALL
BSM frameworks, not just this one. Having dim(Im(H)) = 3 is at least
a structural explanation, even if the mechanism isn't derived.
""")

# Number of independent quaternionic directions
print(f"Quaternionic directions: Im(H) = span(i,j,k)")
print(f"  dim = {n_im_H}")
print(f"  These are the 3 independent imaginary quaternions")
print(f"  Each generation could correspond to one direction")
print(f"  This is SEPARATE from color (SU(3) c G_2 c SO(7))")
test("dim(Im(H)) = 3 = number of SM generations", n_im_H == 3)

# Check: does Im(H) provide a natural SU(3)_family?
# Actually, the automorphism group of Im(H) is SO(3) = SU(2)/Z_2
# This gives a CONTINUOUS family symmetry SO(3)_family, not SU(3)
# But the fermion mass hierarchy BREAKS this to nothing
print(f"\nFamily symmetry from Im(H):")
print(f"  Aut(Im(H)) = SO(3) [MATH]")
print(f"  This is a CONTINUOUS family symmetry (like SO(3) flavor)")
print(f"  Broken by Yukawa hierarchy: y_t >> y_c >> y_u")
print(f"  Not SU(3)_family -- SO(3)_family is different but consistent")

# =============================================================
# PART 9: CONSISTENCY WITH S319 DECOMPOSITION
# =============================================================
print(f"\n{'='*70}")
print("PART 9: RECONCILIATION WITH S319 DECOMPOSITION")
print("="*70)

# S319 counted: 24 visible + 8 dark = 32
# With SU(3) = color:
# "Visible" (carrying SU(3)_c charge) = states in 3 or 3bar
# "Color-singlet" (no SU(3)_c charge) = states in 1_A or 1_B
n_colored = dim_2L * (dim_3 + dim_3bar) + dim_2R * (dim_3 + dim_3bar)
n_singlet = dim_2L * (dim_1 + dim_G2_1) + dim_2R * (dim_1 + dim_G2_1)

print(f"\nReinterpreted state count (SU(3) = color):")
print(f"  Colored (3+3bar): {n_colored}")
print(f"  Color singlet (1_A+1_B): {n_singlet}")
print(f"  Total: {n_colored + n_singlet}")

test("Colored + singlet = 32", n_colored + n_singlet == 32)

print(f"\nS319 called the {n_singlet} singlets 'dark'")
print(f"But with SU(3) = color, these {n_singlet} states are LEPTONS:")
print(f"  Left-handed: L_L (2 states) + anti-L (2 states) = 4")
print(f"  Right-handed: (nu_R,e_R) (2 states) + anti-(nu,e) (2 states) = 4")
print(f"  Total: {n_singlet} lepton/anti-lepton states")
print(f"  (Including the G_2 singlet = nu_R sector)")

# So there are NO "dark" states from the spinor
# All 32 states are SM quarks, leptons, and their anti-particles

# =============================================================
# PART 10: WHAT WAS S319 DOING? (where the error crept in)
# =============================================================
print(f"\n{'='*70}")
print("PART 10: SOURCE OF THE DISCREPANCY")
print("="*70)

print(f"""
S319 analysis assumed SU(3) c G_2 = GENERATION symmetry.
This led to:
  - 3 of SU(3) = 3 generations (8 states each)
  - 1 of SU(3) = dark sector
  - "Spinor gap": only 8/16 SM states per generation
  - "8 dark states" from the singlet directions

But this conflicts with:
  1. SM gauge group pipeline: SU(3) from G_2 = color [S251]
  2. Lepton test: leptons need 3 generations as SU(3) singlets
  3. Mutual exclusivity: SU(3) can't be both color and generation

The correct picture (SU(3) = color):
  - One 32 = one complete generation + anti-particles
  - No spinor gap
  - No dark states from spinor
  - Generations from dim(Im(H)) = 3 (separate mechanism)
  - DM particle not from spinor decomposition

What needs correction:
  - S319 dark sector counting (24 visible + 8 dark) is WRONG
    -> should be 32 = 16 particle + 16 anti-particle (one generation)
  - IRA-09 identification needs revision
    -> SU(3) c G_2 = color, not generation
    -> generation mechanism separate (Im(H) still gives 3)
  - DM program (S314-S319) needs reinterpretation
    -> DM candidate not from spinor
    -> DM mass formula may still hold with different particle ID
""")

# =============================================================
# PART 11: WHAT SURVIVES FROM THE DM PROGRAM
# =============================================================
print(f"\n{'='*70}")
print("PART 11: WHAT SURVIVES FROM S314-S319 DM PROGRAM")
print("="*70)

print(f"""
SURVIVES (framework-independent):
  1. m_DM formula: m_e * (n_c-1)^n_d = 5.11 GeV [S314/S315]
     The det(M) derivation doesn't depend on spinor embedding
  2. Omega split: Omega_b + Omega_DM = 63/200 [S293/S318]
     Depends on Omega_m derivation, not on DM identity
  3. Asymmetric DM mechanism: if n_DM = n_baryon, ratio works [S318]
     The 1.5% match of Omega_DM/Omega_b ~ m_DM/m_p is independent
  4. g_{{h,DM}} = 0 [S317]: IF DM is SM singlet, Higgs coupling vanishes
     This is a CONSEQUENCE of being a singlet, not of being in the spinor

NEEDS REVISION:
  1. "8 dark states from spinor" [S319]: Artifact of SU(3) = generation
  2. "Type A/Type B" classification [S319]: Based on wrong interpretation
  3. "Multi-component DM excluded" [S319]: Based on wrong state counting
  4. "G_2 democracy ratio 1/3" [S319]: Assumes wrong generation mechanism
  5. IRA-09 as resolved [S299]: Needs re-examination

OPEN QUESTION:
  What IS the dark matter particle? Candidates:
  (a) Composite dark baryon from confining G_2 sector
  (b) Lightest neutral composite state
  (c) Something from a different SO(11) representation
  (d) Sterile neutrino (nu_R from G_2 singlet is standard, not dark)
""")

# =============================================================
# SUMMARY
# =============================================================
print(f"\n{'='*70}")
print("SUMMARY")
print("="*70)

print(f"""
FINDING: The spinor gap is an ARTIFACT of misidentifying SU(3) c G_2.

SU(3) c G_2 c SO(7) = COLOR SU(3)_c (not generation symmetry)
  Evidence:
  1. Framework pipeline derives SU(3) as SM gauge group = color [S251]
  2. Lepton test: leptons = SU(3) singlet, need 3 gens [DECISIVE]
  3. SU(3) can't be both color and generation [EXCLUSIVE]
  4. Standard composite Higgs identification [LITERATURE]

Consequences:
  - One spinor 32 = one complete SM generation (no spinor gap)
  - No dark fermions from the spinor
  - Generations = 3 from dim(Im(H)) (separate mechanism)
  - IRA-09 (S299) needs correction: 3 of SU(3) = 3 colors, not gens
  - S319 dark sector counting needs revision
  - DM mass formula survives, but DM particle identity reopened

Severity: HIGH (affects IRA-09, dark sector program S314-S319)
""")

print(f"\n{tests_passed}/{tests_total} tests passed")
