#!/usr/bin/env python3
"""
Crystallization Mechanism for sin^2(theta_W) = 28/121

KEY FINDING: The Weinberg angle arises from the fraction of crystal
symmetry broken in Stage 1. In the induced gauge mechanism, each crystal
mode contributes equally to the inverse coupling. With 28 Goldstone
modes (SU(2)-sector) out of 121 total U(n_c) modes:

    sin^2(theta_W) = N_Goldstone / n_c^2 = 28/121

This connects three key results:
  1/alpha = n_d^2 + n_c^2 = 16 + 121 = 137
  sin^2(theta_W) = n_d * Im_O / n_c^2 = 28/121
  The x(1-x) form with x = n_d/n_c = 4/11

Formula: sin^2(theta_W) = p*q/(p+q)^2 where p=n_d=4, q=Im_O=7
Measured: 0.23122 (MS-bar at M_Z)
Predicted: 28/121 = 0.23140 (843 ppm)
Status: INVESTIGATION
Created: Session 158
"""

from sympy import *
from sympy import Rational as R

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

n_d = 4       # Defect dimension = dim(H)
n_c = 11      # Crystal dimension = R + C + H + O - 4
Im_C = 1
Im_H = 3
Im_O = 7
C_dim = 2     # dim(C)
H_dim = 4     # dim(H)
O_dim = 8     # dim(O)

# ==============================================================================
# PART 1: THE TILT SYMMETRY GROUP
# ==============================================================================

print("=" * 72)
print("PART 1: THE TILT SYMMETRY GROUP U(n_d) x U(n_c)")
print("=" * 72)
print()

dim_U_nd = n_d**2
dim_U_nc = n_c**2
dim_G_full = dim_U_nd + dim_U_nc

print(f"Tilt field lives in Herm({n_d}) x Herm({n_c})")
print(f"Full symmetry: U({n_d}) x U({n_c})")
print(f"  dim(U({n_d})) = {n_d}^2 = {dim_U_nd}")
print(f"  dim(U({n_c})) = {n_c}^2 = {dim_U_nc}")
print(f"  dim(G_full) = {dim_U_nd} + {dim_U_nc} = {dim_G_full}")
print(f"  = 1/alpha_EM (leading order)")
print()

# The fine structure constant connection
print("CONNECTION TO 1/alpha_EM:")
print(f"  1/alpha = dim(U(n_d) x U(n_c)) = n_d^2 + n_c^2")
print(f"  = {n_d}^2 + {n_c}^2 = {dim_G_full}")
print(f"  Measured: 137.036 (leading order: 137)")
print(f"  The 137 modes of the full tilt symmetry group")
print(f"  each contribute 1/(4*pi) to the inverse EM coupling.")
print()

# ==============================================================================
# PART 2: CRYSTAL MODE DECOMPOSITION
# ==============================================================================

print("=" * 72)
print("PART 2: CRYSTAL MODE DECOMPOSITION (n_c^2 = 121)")
print("=" * 72)
print()

# V = R^n_c decomposes under SO(n_d) x SO(Im_O) as:
#   V = R^n_d (+) R^Im_O
# V tensor V = R^(n_c^2) decomposes as:

block_dd = n_d * n_d       # spacetime-spacetime
block_ii = Im_O * Im_O     # internal-internal
block_di = n_d * Im_O      # mixed (spacetime-internal)
block_id = Im_O * n_d      # mixed (internal-spacetime)

print("V (x) V decomposition under SO(4) x SO(7):")
print(f"  Spacetime-spacetime (n_d x n_d):    {block_dd}")
print(f"  Internal-internal  (Im_O x Im_O):   {block_ii}")
print(f"  Mixed upper        (n_d x Im_O):    {block_di}")
print(f"  Mixed lower        (Im_O x n_d):    {block_id}")
print(f"  Total: {block_dd} + {block_ii} + {block_di} + {block_id} = "
      f"{block_dd + block_ii + block_di + block_id}")
print()

# Alternatively: symmetric + antisymmetric
dim_S2V = n_c * (n_c + 1) // 2     # Symmetric square
dim_L2V = n_c * (n_c - 1) // 2     # Antisymmetric square (= adjoint SO(n_c))

print("S^2(V) + Lambda^2(V) decomposition:")
print(f"  S^2(V):      {dim_S2V}  (symmetric matrices)")
print(f"  Lambda^2(V): {dim_L2V}  (antisymmetric = adjoint SO({n_c}))")
print(f"  Total:       {dim_S2V} + {dim_L2V} = {dim_S2V + dim_L2V}")
print()

assert dim_S2V + dim_L2V == n_c**2

# ==============================================================================
# PART 3: STAGE 1 GOLDSTONE MODES
# ==============================================================================

print("=" * 72)
print("PART 3: STAGE 1 GOLDSTONE MODES")
print("=" * 72)
print()

dim_SO_nc = n_c * (n_c - 1) // 2   # = 55
dim_SO_nd = n_d * (n_d - 1) // 2   # = 6
dim_SO_ImO = Im_O * (Im_O - 1) // 2  # = 21
N_Goldstone = dim_SO_nc - dim_SO_nd - dim_SO_ImO  # = 28

print(f"SO({n_c}) -> SO({n_d}) x SO({Im_O})")
print(f"  dim(SO({n_c})) = {dim_SO_nc}")
print(f"  dim(SO({n_d})) = {dim_SO_nd}")
print(f"  dim(SO({Im_O})) = {dim_SO_ImO}")
print(f"  Goldstone modes = {dim_SO_nc} - {dim_SO_nd} - {dim_SO_ImO} = {N_Goldstone}")
print(f"  = n_d x Im_O = {n_d} x {Im_O} = {n_d * Im_O}")
print()

assert N_Goldstone == n_d * Im_O

# Where do the Goldstones sit in V (x) V?
print("Goldstone location in V (x) V:")
print(f"  Lambda^2(V) = so({n_c}) generators = {dim_L2V} modes")
print(f"    - so({n_d}) block:     {dim_SO_nd}  (unbroken)")
print(f"    - so({Im_O}) block:    {dim_SO_ImO}  (unbroken)")
print(f"    - Mixed antisymm.:  {N_Goldstone}  (GOLDSTONES)")
print(f"    Total: {dim_SO_nd} + {dim_SO_ImO} + {N_Goldstone} = {dim_L2V}")
print()

assert dim_SO_nd + dim_SO_ImO + N_Goldstone == dim_L2V

# Mixed block decomposition
print("Mixed block in V (x) V:")
print(f"  Total mixed modes: 2 x n_d x Im_O = {2 * n_d * Im_O}")
print(f"  Antisymmetric mixed: n_d x Im_O = {n_d * Im_O} (Goldstones)")
print(f"  Symmetric mixed:     n_d x Im_O = {n_d * Im_O} (massive scalars)")
print()

# ==============================================================================
# PART 4: THE CRYSTALLIZATION MECHANISM
# ==============================================================================

print("=" * 72)
print("PART 4: THE CRYSTALLIZATION MECHANISM")
print("=" * 72)
print()

print("HYPOTHESIS: In the induced gauge mechanism, each crystal tilt mode")
print("contributes equally to the inverse coupling of the gauge group it")
print("couples to. The Weinberg angle emerges from the MODE PARTITION of")
print("the crystal matrix under Stage 1 breaking.")
print()

# The key formula
print("THE MECHANISM:")
print()
print("Step 1: The tilt symmetry U(n_c) = U(11) has dim = n_c^2 = 121 modes.")
print("Step 2: Stage 1 breaking generates N_Gold = 28 Goldstone modes.")
print("Step 3: These 28 modes live in the coset SO(11)/(SO(4) x SO(7)).")
print("Step 4: They connect spacetime (n_d) and internal (Im_O) sectors.")
print("Step 5: In the induced mechanism:")
print("    1/g_2^2 ~ N_SU2  (modes coupling to SU(2))")
print("    1/g_1^2 ~ N_U1   (modes coupling to U(1))")
print()

N_SU2 = N_Goldstone     # 28
N_U1 = n_c**2 - N_SU2   # 93
N_total = n_c**2         # 121

print(f"Step 6: Mode partition:")
print(f"    N_SU2 = N_Goldstone = {N_SU2}")
print(f"    N_U1  = n_c^2 - N_Gold = {N_U1}")
print(f"    N_total = n_c^2 = {N_total}")
print()

# The Weinberg angle
sin2_mechanism = R(N_SU2, N_total)

print("Step 7: Coupling relation sin^2(theta_W) = g'^2/(g^2 + g'^2)")
print("  With g_i^2 = C/N_i (democratic mode counting):")
print("  sin^2 = (1/N_U1) / (1/N_SU2 + 1/N_U1)")
print("        = N_SU2 / (N_SU2 + N_U1)")
print(f"        = {N_SU2}/{N_total}")
print(f"        = {sin2_mechanism} = {float(sin2_mechanism):.6f}")
print()

sin2_measured = R(23122, 100000)
error_ppm = abs(float(sin2_mechanism - sin2_measured) / float(sin2_measured)) * 1e6
print(f"Measured: {float(sin2_measured):.6f}")
print(f"Error: {error_ppm:.0f} ppm")
print()

# ==============================================================================
# PART 5: WHY N_SU2 = N_GOLDSTONE
# ==============================================================================

print("=" * 72)
print("PART 5: WHY THE SU(2) SECTOR = GOLDSTONE MODES")
print("=" * 72)
print()

print("The 28 Goldstone modes from SO(11) -> SO(4) x SO(7) transform as")
print("the bifundamental (n_d, Im_O) = (4, 7) representation.")
print()
print("Under SU(2)_L x SU(2)_R (from SO(4) ~= SU(2)_L x SU(2)_R):")
print("  4 -> (2, 2)")
print("  7 -> singlet (internal space)")
print()
print("So each Goldstone mode carries SU(2)_L quantum numbers:")
print("  (2, 2) (x) 7 -> 28 states, all SU(2)_L doublets")
print()

print("PHYSICAL INTERPRETATION:")
print("  The Goldstone modes are the ONLY modes that BRIDGE spacetime")
print("  and internal space. They carry BOTH spacetime (SU(2)) and")
print("  internal (SO(7)/color) quantum numbers.")
print()
print("  No other crystal modes span this bridge:")
print(f"  - {n_d}^2 = {n_d**2} spacetime-spacetime modes: purely spacetime")
print(f"  - {Im_O}^2 = {Im_O**2} internal-internal modes: purely internal")
print(f"  - {N_Goldstone} mixed Goldstones: bridge both sectors")
print()
print("  The SU(2) gauge bosons MUST be mediated by modes that connect")
print("  to the spacetime sector (where SU(2)_L lives). Only the")
print("  Goldstone modes do this.")
print()

# ==============================================================================
# PART 6: THE x(1-x) FORM
# ==============================================================================

print("=" * 72)
print("PART 6: THE x(1-x) BERNOULLI FORM")
print("=" * 72)
print()

x = R(n_d, n_c)
sin2_bernoulli = x * (1 - x)

print(f"Define x = n_d/n_c = {n_d}/{n_c}")
print(f"  1-x = Im_O/n_c = {Im_O}/{n_c}")
print()
print(f"sin^2(theta_W) = x(1-x) = ({n_d}/{n_c})({Im_O}/{n_c})")
print(f"  = n_d * Im_O / n_c^2")
print(f"  = {n_d * Im_O}/{n_c**2}")
print(f"  = {sin2_bernoulli} = {float(sin2_bernoulli):.6f}")
print()

assert sin2_bernoulli == sin2_mechanism

print("MEANING: x = n_d/n_c is the SPACETIME FRACTION of the crystal.")
print(f"  x = {float(x):.4f} = 36.4% of crystal dimensions are spacetime")
print(f"  1-x = {float(1-x):.4f} = 63.6% are internal")
print()
print("  sin^2(theta_W) = x(1-x) measures the ASYMMETRY of the split.")
print("  Maximum at x = 1/2 (equal split) -> sin^2 = 1/4")
print("  Actual x = 4/11 -> sin^2 = 28/121 = 0.2314")
print()
print("  The Weinberg angle is SMALL because the crystal is asymmetrically")
print("  split: more internal dimensions (7) than spacetime (4).")
print()

# Maximum of x(1-x)
print("Comparison to maximally symmetric case:")
print("  If n_d = Im_O (equal split): sin^2 = 1/4 = 0.25")
print(f"  Actual ratio: sin^2/sin^2_max = {float(sin2_mechanism / R(1,4)):.4f}")
print(f"  = 4 * 28/121 = 112/121")
print()

# ==============================================================================
# PART 7: CONNECTION TO 1/alpha = 137
# ==============================================================================

print("=" * 72)
print("PART 7: CONNECTION TO 1/alpha = 137")
print("=" * 72)
print()

print("THE UNIFIED PICTURE:")
print()
print(f"  1/alpha_EM = dim(U(n_d) x U(n_c))")
print(f"             = n_d^2 + n_c^2 = {dim_G_full}")
print()
print(f"  sin^2(theta_W) = N_Gold / n_c^2 = {N_SU2}/{N_total}")
print()
print("  These two relations share the SAME denominator-structure:")
print(f"    n_c^2 = {n_c**2} appears in both")
print(f"    n_d^2 = {n_d**2} is the 'gravity sector' contribution")
print()

# Consistency check: 1/alpha_2 and 1/alpha_1
# sin^2 = alpha_EM / alpha_2  (tree level)
# 1/alpha_2 = sin^2 * (1/alpha_EM)
# 1/alpha_1 = cos^2 * (1/alpha_EM)

inv_alpha_EM_leading = dim_G_full  # = 137
sin2_W = R(28, 121)

# In the induced mechanism:
# 1/alpha_EM = sum of ALL tilt mode contributions = n_d^2 + n_c^2 = 137
# Of the n_c^2 = 121 crystal modes:
#   28 contribute to SU(2) inverse coupling
#   93 contribute to U(1) inverse coupling
# The n_d^2 = 16 spacetime modes contribute to gravity, not electroweak

print("MODE ACCOUNTING:")
print(f"  U(n_d) sector: {dim_U_nd} modes -> gravity/spacetime")
print(f"  U(n_c) sector: {dim_U_nc} modes -> electroweak + color")
print(f"    - SU(2) (Goldstones):  {N_SU2} modes")
print(f"    - U(1) (non-Goldstone): {N_U1} modes")
print(f"  Total: {dim_U_nd} + {N_SU2} + {N_U1} = {dim_G_full}")
print()

# What is N_U1 = 93?
print(f"N_U1 = {N_U1} = n_c^2 - N_Gold")
print(f"     = n_c^2 - n_d*Im_O")
print(f"     = n_d^2 + Im_O^2 + n_d*Im_O")
print(f"     = {n_d**2} + {Im_O**2} + {n_d*Im_O}")
print(f"     = {n_d**2 + Im_O**2 + n_d*Im_O}")

assert N_U1 == n_d**2 + Im_O**2 + n_d*Im_O

print()
print(f"Factorization: 93 = 3 x 31")
print(f"Alternative: 93 = n_d^2 + Im_O(Im_O + n_d)")
print(f"                 = {n_d}^2 + {Im_O}({Im_O} + {n_d})")
print(f"                 = {n_d**2} + {Im_O * (Im_O + n_d)}")
print(f"                 = {n_d**2} + {Im_O * n_c}")
print()

# ==============================================================================
# PART 8: INDUCED COUPLING CONSISTENCY
# ==============================================================================

print("=" * 72)
print("PART 8: INDUCED COUPLING CONSISTENCY CHECKS")
print("=" * 72)
print()

# If each mode contributes k to inverse coupling:
# 1/alpha_EM = (N_SU2 + N_U1 + N_grav) * k = 137 * k
# For k = 1 (leading order): 1/alpha_EM = 137 [matches!]

# Then:
# 1/alpha_2 = N_SU2 * k (only SU(2) modes contribute to SU(2) coupling)
# ... but this would give 1/alpha_2 = 28, and measured is ~29.6

print("Test: Democratic mode counting with k = 1")
print(f"  1/alpha_EM = {dim_G_full} x k = 137k")
print(f"  For k = 1: 1/alpha_EM = 137 (matches leading order)")
print()

# But the relationship between alpha_2 and sin^2 is:
# alpha_2 = alpha_EM / sin^2(theta_W)
# 1/alpha_2 = sin^2(theta_W) / alpha_EM
#           = sin^2(theta_W) * (1/alpha_EM)

inv_alpha2_formula = sin2_W * inv_alpha_EM_leading
print(f"  1/alpha_2 = sin^2(theta_W) x (1/alpha_EM)")
print(f"            = (28/121) x 137")
print(f"            = {inv_alpha2_formula}")
print(f"            = {float(inv_alpha2_formula):.4f}")
print(f"  Measured:   ~29.6 (MS-bar at M_Z)")
print(f"  Error: {abs(float(inv_alpha2_formula) - 29.6)/29.6 * 100:.1f}%")
print()

# Similarly for alpha_1:
cos2_W = 1 - sin2_W
inv_alpha1_formula = cos2_W * inv_alpha_EM_leading
print(f"  1/alpha_1 = cos^2(theta_W) x (1/alpha_EM)")
print(f"            = (93/121) x 137")
print(f"            = {inv_alpha1_formula}")
print(f"            = {float(inv_alpha1_formula):.4f}")
print()

# Note: 1/alpha_EM = 1/alpha_1 + 1/alpha_2 [tree level]
check = inv_alpha1_formula + inv_alpha2_formula
print(f"  Check: 1/alpha_1 + 1/alpha_2 = {check} = {float(check):.1f}")
print(f"  Should equal 1/alpha_EM = {inv_alpha_EM_leading}")
print(f"  Match: {check == inv_alpha_EM_leading}")
print()

# The actual inverse couplings in the mode counting picture:
# 1/g_2^2 proportional to N_SU2 = 28
# 1/g_1^2 proportional to N_U1 = 93
# ratio: g_1^2/g_2^2 = N_SU2/N_U1 = 28/93

coupling_ratio = R(N_SU2, N_U1)
print(f"  g_1^2/g_2^2 = N_SU2/N_U1 = {coupling_ratio} = {float(coupling_ratio):.6f}")
print(f"  g_1 < g_2 because N_U1 > N_SU2 (more screening for U(1))")
print()

# ==============================================================================
# PART 9: ALTERNATIVE INTERPRETATION -- COSET VOLUME FRACTION
# ==============================================================================

print("=" * 72)
print("PART 9: COSET VOLUME FRACTION INTERPRETATION")
print("=" * 72)
print()

print("The coset SO(11)/(SO(4) x SO(7)) has dimension 28.")
print("The full crystal mode space has dimension n_c^2 = 121.")
print()
print("sin^2(theta_W) = dim(coset) / dim(crystal mode space)")
print(f"                = {N_Goldstone} / {n_c**2} = {sin2_mechanism}")
print()
print("INTERPRETATION:")
print("  sin^2(theta_W) is the FRACTION of crystal configuration space")
print("  that is 'used up' by the Stage 1 symmetry breaking.")
print()
print("  28 of 121 crystal modes become Goldstones (massless/long-range)")
print("  93 of 121 crystal modes remain massive (short-range/frozen)")
print()
print("  The Weinberg angle measures what fraction of crystal freedom")
print("  is invested in CONNECTING spacetime to internal space.")
print()

# ==============================================================================
# PART 10: STRONG COUPLING PREDICTION
# ==============================================================================

print("=" * 72)
print("PART 10: STRONG COUPLING IN THE MODE COUNTING PICTURE")
print("=" * 72)
print()

# Stage 2: SO(7) -> G2, Goldstones = 21 - 14 = 7
# Stage 3: G2 -> SU(3), Goldstones = 14 - 8 = 6

N_Gold_2 = Im_O * (Im_O - 1) // 2 - 14   # = 21 - 14 = 7
N_Gold_3 = 14 - 8                          # = 6

print("Goldstone count by stage:")
print(f"  Stage 1: SO(11) -> SO(4) x SO(7): {N_Goldstone} Goldstones")
print(f"  Stage 2: SO(7) -> G2:             {N_Gold_2} Goldstones")
print(f"  Stage 3: G2 -> SU(3):             {N_Gold_3} Goldstones")
print(f"  Total:                             {N_Goldstone + N_Gold_2 + N_Gold_3}")
print()

# If sin^2 = (Stage 1 Goldstones) / n_c^2, what about alpha_s?
# The strong sector involves Stage 2 + Stage 3 Goldstones = 7 + 6 = 13
N_strong = N_Gold_2 + N_Gold_3
print(f"Strong sector Goldstones: {N_Gold_2} + {N_Gold_3} = {N_strong}")
print()

# If 1/alpha_s ~ N_strong * k (same k as others):
# With k = 1: 1/alpha_s ~ 13
# But measured 1/alpha_s(M_Z) ~ 8.5
# With k adjusted: 1/alpha_s = 13 * (1/alpha_EM)/137 = 13/137 * 137 = 13?
# That's too high.
print("If 1/alpha_s proportional to strong-sector Goldstones:")
print(f"  1/alpha_s ~ {N_strong}")
print(f"  Measured 1/alpha_s(M_Z) ~ 8.5")
print(f"  Ratio: {N_strong}/8.5 = {N_strong/8.5:.2f}")
print()

# Alternative: 1/alpha_s = O = 8 (from previous work)
print("Previous framework result: 1/alpha_s = O = 8 (6% off)")
print(f"  O = {O_dim}")
print(f"  Note: O = dim(O) = 8, which is dim(SU(3)) = 8")
print(f"  The strong coupling is determined by the SURVIVING gauge group")
print(f"  dimension, not the Goldstone count.")
print()

# ==============================================================================
# PART 11: THE THREE-COUPLING SYSTEM
# ==============================================================================

print("=" * 72)
print("PART 11: UNIFIED MODE COUNTING FOR ALL THREE COUPLINGS")
print("=" * 72)
print()

# Full system from the crystallization mechanism:
print("PROPOSAL: In the induced gauge mechanism,")
print("  1/alpha_i proportional to (relevant mode count)")
print()

# Modes by sector:
print("Crystal mode partition (121 total):")
print(f"  Stage 1 Goldstones (EW mixing):    {N_Goldstone}")
print(f"  Stage 2 Goldstones (octonion):     {N_Gold_2}")
print(f"  Stage 3 Goldstones (color lock):   {N_Gold_3}")
print(f"  Unbroken SO(4) gauge:              {dim_SO_nd}")
print(f"  Unbroken SU(3) gauge:              8")
print(f"  Remaining symmetric:               {n_c**2 - N_Goldstone - N_Gold_2 - N_Gold_3 - dim_SO_nd - 8}")
print(f"  Total:                             {n_c**2}")
print()

remaining = n_c**2 - N_Goldstone - N_Gold_2 - N_Gold_3 - dim_SO_nd - 8
print(f"Remaining = {remaining}")
print(f"  = {dim_S2V} (symmetric square S^2(V)) - 2 = 66 - 2 = 64")
print(f"  Actually: 121 - 28 - 7 - 6 - 6 - 8 = {121-28-7-6-6-8}")
print()

# ==============================================================================
# PART 12: ALGEBRAIC IDENTITIES
# ==============================================================================

print("=" * 72)
print("PART 12: ALGEBRAIC IDENTITIES")
print("=" * 72)
print()

# Key identity: 28/121 = n_d * Im_O / n_c^2
# And n_c = n_d + Im_O
# So 28/121 = p*q/(p+q)^2 where p = n_d, q = Im_O

p, q = symbols('p q', positive=True)
sin2_pq = p * q / (p + q)**2

print(f"sin^2(theta_W) = p*q/(p+q)^2 with p = n_d = {n_d}, q = Im_O = {Im_O}")
print()

# Properties of this form
print("Properties of the p*q/(p+q)^2 form:")
print()

# 1. It's x(1-x) with x = p/(p+q)
print(f"  1. Equals x(1-x) with x = p/(p+q) = {n_d}/{n_c} = {float(R(n_d,n_c)):.4f}")
print()

# 2. Maximum is 1/4 at p = q
print(f"  2. Maximum = 1/4 at p = q (symmetric split)")
deriv = diff(sin2_pq, p)
extremum = solve(deriv, p)
print(f"     d/dp[pq/(p+q)^2] = 0 at p = {extremum}")
max_val = sin2_pq.subs(p, q)
print(f"     Maximum value: {simplify(max_val)}")
print()

# 3. Symmetric: same under p <-> q
print(f"  3. Symmetric under p <-> q (same angle for (4,7) and (7,4) splits)")
print()

# 4. Asymptotic: goes to 0 as p/q -> 0 or infinity
print(f"  4. Goes to 0 as p/q -> 0 or infinity (extreme asymmetry)")
print()

# 5. For p = 4, q = 7: 28/121 is the UNIQUE value
print(f"  5. For p = {n_d}, q = {Im_O}: sin^2 = {n_d*Im_O}/{n_c**2} = {float(R(n_d*Im_O, n_c**2)):.6f}")
print(f"     This is uniquely determined by n_d = 4, Im_O = 7")
print()

# What other splits would give?
print("What if the crystal split were different?")
for pp in range(1, 11):
    qq = 11 - pp
    if qq > 0:
        s2 = R(pp * qq, 121)
        print(f"  ({pp},{qq}): sin^2 = {pp*qq}/121 = {float(s2):.4f}", end="")
        if pp == n_d:
            print("  <-- ACTUAL (n_d, Im_O)")
        elif pp == Im_H:
            print(f"  <-- (Im_H, O) split")
        else:
            print()
print()

# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

print("=" * 72)
print("VERIFICATION TESTS")
print("=" * 72)
print()

tests = [
    # Part 1: Tilt symmetry group
    ("dim(U(4) x U(11)) = 137",
     dim_G_full == 137),

    ("n_d^2 + n_c^2 = 137",
     n_d**2 + n_c**2 == 137),

    # Part 2: Mode decomposition
    ("n_c^2 = S^2(V) + Lambda^2(V) = 66 + 55",
     n_c**2 == dim_S2V + dim_L2V and dim_S2V == 66 and dim_L2V == 55),

    ("Block decomposition: 16 + 49 + 56 = 121",
     block_dd + block_ii + block_di + block_id == n_c**2),

    # Part 3: Goldstone modes
    ("N_Goldstone = n_d x Im_O = 28",
     N_Goldstone == n_d * Im_O and N_Goldstone == 28),

    ("N_Gold sits in Lambda^2(V): 6 + 21 + 28 = 55",
     dim_SO_nd + dim_SO_ImO + N_Goldstone == dim_L2V),

    # Part 4: Weinberg angle
    ("sin^2(theta_W) = 28/121 from mode counting",
     sin2_mechanism == R(28, 121)),

    ("28/121 = x(1-x) with x = 4/11",
     sin2_mechanism == R(4,11) * R(7,11)),

    ("28/121 within 843 ppm of measured",
     error_ppm < 900),

    # Part 5: N_U1 decomposition
    ("N_U1 = 93 = n_d^2 + Im_O^2 + n_d*Im_O",
     N_U1 == 93 and N_U1 == n_d**2 + Im_O**2 + n_d*Im_O),

    # Part 7: Coupling consistency
    ("1/alpha_1 + 1/alpha_2 = 1/alpha_EM (tree level)",
     inv_alpha1_formula + inv_alpha2_formula == inv_alpha_EM_leading),

    # Part 8: Coupling ratio
    ("g_1^2/g_2^2 = 28/93",
     coupling_ratio == R(28, 93)),

    # Part 9: Goldstone count by stage
    ("Total Goldstones: 28 + 7 + 6 = 41",
     N_Goldstone + N_Gold_2 + N_Gold_3 == 41),

    ("Residual gauge dim = 55 - 41 = 14 = dim(SO(4) x SU(3))",
     dim_L2V - (N_Goldstone + N_Gold_2 + N_Gold_3) == dim_SO_nd + 8),

    # Part 12: Algebraic
    ("pq/(p+q)^2 maximized at p=q giving 1/4",
     simplify(max_val - R(1,4)) == 0),
]

all_pass = True
for name, passed in tests:
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed:
        all_pass = False

print()
if all_pass:
    print(f"ALL TESTS PASS")
else:
    print(f"SOME TESTS FAILED")
print(f"Total: {sum(1 for _, p in tests if p)}/{len(tests)} passed")
print()

# ==============================================================================
# SUMMARY
# ==============================================================================

print("=" * 72)
print("SUMMARY: THE CRYSTALLIZATION MECHANISM")
print("=" * 72)
print()

print("RESULT: sin^2(theta_W) = 28/121 arises from the crystallization")
print("mechanism through democratic mode counting:")
print()
print("  1. The tilt symmetry U(n_d) x U(n_c) has dim = n_d^2 + n_c^2 = 137")
print("  2. The U(n_c) = U(11) sector has n_c^2 = 121 modes")
print("  3. Stage 1 breaking produces 28 Goldstones in the coset")
print("     SO(11)/(SO(4) x SO(7))")
print("  4. These 28 modes bridge spacetime and internal sectors,")
print("     carrying SU(2)_L quantum numbers")
print("  5. In the induced gauge mechanism:")
print("       1/g_2^2 ~ N_SU2 = 28  (SU(2) inverse coupling)")
print("       1/g_1^2 ~ N_U1 = 93   (U(1) inverse coupling)")
print("  6. sin^2(theta_W) = N_SU2/(N_SU2 + N_U1) = 28/121")
print()
print("WHAT THIS UNIFIES:")
print("  - 1/alpha = 137 (total tilt symmetry dimension)")
print("  - sin^2(theta_W) = 28/121 (Goldstone fraction of crystal sector)")
print("  - The x(1-x) form with x = n_d/n_c (spacetime fraction)")
print("  - Why the denominator is n_c^2 (crystal modes), not dim(SO(11)) = 55")
print()
print("CONFIDENCE: [CONJECTURE]")
print("  The mode counting mechanism is plausible but has gaps:")
print("  - Why do Goldstones contribute specifically to SU(2) coupling?")
print("    (They bridge spacetime/internal, but detailed one-loop needed)")
print("  - The identification 1/g_i^2 ~ N_i needs a Lagrangian derivation")
print("  - The strong coupling (1/alpha_s = 8) does not obviously follow")
print("    from the same counting (13 strong Goldstones != 8)")
print("  - The tree-level relation gives 1/alpha_2 = 28*137/121 = 31.7,")
print("    but measured is 29.6 (7% off). Radiative corrections needed?")
print()
print("NEXT STEPS:")
print("  1. Derive 1/g_i^2 ~ N_i from the one-loop induced Lagrangian")
print("  2. Explain why strong coupling = O = 8 (surviving group dim)")
print("     rather than 13 (strong Goldstones)")
print("  3. Compute radiative corrections to 1/alpha_2 = 31.7")
print("  4. Test whether the 4/111 correction to 1/alpha fits this picture")
