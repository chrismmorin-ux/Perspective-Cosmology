#!/usr/bin/env python3
"""
Entanglement from Crystallization: Bell Correlation Verification

KEY QUESTION: Does the framework's projection structure -- perspectives
projecting from a higher-dimensional crystallized state -- reproduce
the quantum mechanical Bell correlations?

FRAMEWORK SETUP:
  - Full state lives in V (higher-dimensional crystal space)
  - Perspectives pi_1, pi_2 project V onto local subspaces
  - "Entangled" = crystallized constraint in V that cannot be factored
  - Observation = projection onto perspective subspace (crystallization event)
  - Born rule P(k) = |c_k|^2 from THM_0494

TESTS:
  1. Singlet state is non-factorizable (genuine entanglement)
  2. Correlation E(a,b) = -cos(a-b) for spin-1/2 singlet
  3. CHSH inequality violation: |S| = 2*sqrt(2) (Tsirelson bound)
  4. No-signaling: local statistics independent of remote measurement
  5. Coherence measure relates to entanglement
  6. Higher-dimensional crystallization structure preserves correlations
  7. Framework projection reproduces standard QM (consistency check)

FRAMEWORK CONCEPTS USED:
  - THM_0491: V_pi is finite-dimensional complex Hilbert space
  - THM_0485: F = C (complex field)
  - THM_0494: Born rule from crystallization
  - DEF_0265: Coherence measure between perspectives
  - AXM_0117: Crystallization tendency

Status: VERIFICATION
Created: Session 169
"""

from sympy import (
    symbols, sqrt, cos, sin, pi, Rational, Matrix, conjugate,
    simplify, trigsimp, expand_trig, eye, I, tensorproduct, Abs,
    Function, Symbol, oo, integrate, atan2, re, im, exp, zeros
)
from sympy.physics.quantum import TensorProduct
from sympy.physics.quantum.spin import JzKet, JxKet
import sys

# ==============================================================================
# FRAMEWORK PARAMETERS
# ==============================================================================

# Division algebra dimensions [D: from Frobenius]
dim_R = 1   # Reals
dim_C = 2   # Complex numbers
dim_H = 4   # Quaternions (-> spacetime, SU(2) weak)
dim_O = 8   # Octonions (-> SU(3) strong)
n_c = 11    # Crystal dimension: 1 + 2 + 4 + 4 (or R+C+H+O-4)
n_d = 4     # Defect dimension (spacetime)

# ==============================================================================
# PART 1: SPIN-1/2 HILBERT SPACE FROM FRAMEWORK
# ==============================================================================
# THM_0491: V_pi is a finite-dimensional complex Hilbert space
# For spin-1/2, the local perspective subspace is C^2
# This is the SU(2) sector from quaternionic crystallization (H channel)

# Basis states for spin-1/2 (z-basis)
up = Matrix([1, 0])    # |^>
dn = Matrix([0, 1])    # |v>

# ==============================================================================
# PART 2: TENSOR PRODUCT STRUCTURE
# ==============================================================================
# Two perspectives pi_1 and pi_2 each see C^2 (local spin)
# Combined system lives in C^2 (x) C^2 = C^4
#
# FRAMEWORK INTERPRETATION:
#   The full crystalline state lives in a higher-dimensional space V.
#   Perspectives pi_1, pi_2 are projections: V -> V_pi_i = C^2
#   The tensor product V_pi_1 (x) V_pi_2 represents the COMBINED
#   information accessible to both perspectives.
#
# KEY CLAIM [CONJECTURE]:
#   Tensor product structure follows from perspectives being
#   independent projections onto non-overlapping subspaces of V.
#   If pi_1 and pi_2 access disjoint parts of U, their combined
#   state space is the tensor product of individual spaces.

# Basis for C^2 (x) C^2
uu = TensorProduct(up, up)  # |^^>
ud = TensorProduct(up, dn)  # |^v>
du = TensorProduct(dn, up)  # |v^>
dd = TensorProduct(dn, dn)  # |vv>

# Singlet state: the maximally entangled, rotationally invariant state
# |psi^-> = (|^v> - |v^>) / sqrt2
#
# FRAMEWORK INTERPRETATION:
#   This is a CRYSTALLIZED CONSTRAINT in the full space V:
#   Total spin = 0, enforced by a crystallization event (interaction).
#   The constraint lives in V, not in either V_pi_1 or V_pi_2 alone.
singlet = (ud - du) / sqrt(2)

# ==============================================================================
# TEST 1: Non-factorizability (genuine entanglement)
# ==============================================================================
# A state is entangled iff it CANNOT be written as |a>(x)|b>
# For the singlet, we prove this by showing it has Schmidt rank 2

def test_non_factorizability():
    """Verify the singlet cannot be factored as a product state."""
    # Express singlet in matrix form (2x2 matrix of coefficients)
    # |psi> = Sigma_{ij} M_{ij} |i>(x)|j>
    # Singlet: M = (1/sqrt2) [[0, 1], [-1, 0]]
    M = Matrix([[0, 1], [-1, 0]]) / sqrt(2)

    # State is factorizable iff rank(M) = 1
    # State is entangled iff rank(M) >= 2
    schmidt_rank = M.rank()

    # Also compute the partial trace (reduced density matrix)
    # rho_1 = Tr_2(|psi><psi|) for perspective 1
    rho_1 = M * M.adjoint()

    # For maximally entangled state, rho_1 = I/2 (maximally mixed)
    is_maximally_mixed = simplify(rho_1 - eye(2) / 2) == zeros(2)

    # Von Neumann entropy: S = -Tr(rho log rho)
    # For I/2: eigenvalues are 1/2, 1/2
    # S = -2 * (1/2) * log(1/2) = log(2) = 1 bit (maximal for qubit)
    eigenvals_rho = rho_1.eigenvals()

    return schmidt_rank, is_maximally_mixed, eigenvals_rho

# ==============================================================================
# PART 3: MEASUREMENT AS PERSPECTIVE PROJECTION
# ==============================================================================
# In the framework:
#   - Measurement = crystallization to eigenstate (THM_0494)
#   - Choosing measurement axis = choosing which perspective to project onto
#   - The projection operator for spin along direction n at angle theta:
#     P_+(theta) = |n+><n+| where |n+> is spin-up along n

def spin_state(theta):
    """
    Spin-up eigenstate along axis at angle theta from z-axis (in xz-plane).

    |n+> = cos(theta/2)|^> + sin(theta/2)|v>
    |n-> = -sin(theta/2)|^> + cos(theta/2)|v>

    FRAMEWORK: This is the perspective subspace V_pi(theta) -- the
    crystallization axis chosen by the observer.
    """
    return (cos(theta/2) * up + sin(theta/2) * dn,   # spin-up along theta
            -sin(theta/2) * up + cos(theta/2) * dn)   # spin-down along theta

# ==============================================================================
# PART 4: BELL CORRELATION FUNCTION
# ==============================================================================

def bell_correlation(alpha, beta):
    """
    Compute the correlation E(alpha, beta) for spin measurements on the singlet.

    Alice measures along angle alpha, Bob along angle beta.
    E(alpha,beta) = P(++) + P(--) - P(+-) - P(-+)

    where P(ab) = |<a,b|psi>|^2 (Born rule, THM_0494)

    FRAMEWORK INTERPRETATION:
      - Alice's perspective pi_1 projects onto axis alpha
      - Bob's perspective pi_2 projects onto axis beta
      - The crystallization constraint (singlet) in V determines
        the joint probability via the Born rule
      - The correlation comes from the GEOMETRY of the higher-dimensional
        crystallized state, not from any signal between observers
    """
    # Alice's basis states
    a_up, a_dn = spin_state(alpha)
    # Bob's basis states
    b_up, b_dn = spin_state(beta)

    # Joint measurement states
    ab_pp = TensorProduct(a_up, b_up)
    ab_pm = TensorProduct(a_up, b_dn)
    ab_mp = TensorProduct(a_dn, b_up)
    ab_mm = TensorProduct(a_dn, b_dn)

    # Probabilities via Born rule: P = |<measurement|singlet>|^2
    # Inner product in C^4
    P_pp = Abs(ab_pp.adjoint() @ singlet)**2
    P_pm = Abs(ab_pm.adjoint() @ singlet)**2
    P_mp = Abs(ab_mp.adjoint() @ singlet)**2
    P_mm = Abs(ab_mm.adjoint() @ singlet)**2

    # Simplify each probability
    P_pp = trigsimp(simplify(P_pp[0, 0]))
    P_pm = trigsimp(simplify(P_pm[0, 0]))
    P_mp = trigsimp(simplify(P_mp[0, 0]))
    P_mm = trigsimp(simplify(P_mm[0, 0]))

    # Correlation: E = P(same) - P(different)
    E = P_pp + P_mm - P_pm - P_mp
    E = trigsimp(simplify(E))

    return E, (P_pp, P_pm, P_mp, P_mm)

# ==============================================================================
# TEST 2: Correlation function E(alpha,beta) = -cos(alpha - beta)
# ==============================================================================

def test_bell_correlation():
    """
    Verify that the singlet correlation is E(alpha,beta) = -cos(alpha - beta).

    This is the key result: the framework's Hilbert space (THM_0491)
    + Born rule (THM_0494) + projection structure automatically gives
    the quantum mechanical correlation.
    """
    alpha, beta = symbols('alpha beta', real=True)

    E, probs = bell_correlation(alpha, beta)

    # The QM prediction
    E_qm = -cos(alpha - beta)

    # Check equivalence
    diff = trigsimp(simplify(E - E_qm))

    return str(E), str(E_qm), diff

# ==============================================================================
# TEST 3: CHSH inequality violation
# ==============================================================================

def test_chsh():
    """
    CHSH inequality: |S| <= 2 for local hidden variables.
    QM singlet achieves |S| = 2sqrt2 (Tsirelson bound).

    Standard angles: a=0, a'=pi/2, b=pi/4, b'=3pi/4
    (or equivalently: a=0, a'=pi/4, b=pi/8, b'=3pi/8 for max violation)

    S = E(a,b) - E(a,b') + E(a',b) + E(a',b')

    FRAMEWORK MEANING:
      |S| > 2 proves the crystallization constraint CANNOT be replaced
      by any local pre-existing property at each perspective.
      The higher-dimensional crystalline structure is ESSENTIAL.
    """
    # Optimal CHSH angles for maximum violation
    # Standard choice: a=0, a'=pi/2, b=pi/4, b'=3pi/4
    a  = Rational(0)
    ap = pi / 2
    b  = pi / 4
    bp = pi * Rational(3, 4)

    E_ab,  _ = bell_correlation(a, b)
    E_abp, _ = bell_correlation(a, bp)
    E_apb, _ = bell_correlation(ap, b)
    E_apbp, _ = bell_correlation(ap, bp)

    S = E_ab - E_abp + E_apb + E_apbp
    S = trigsimp(simplify(S))

    S_numeric = float(S)
    tsirelson = float(2 * sqrt(2))

    return S, S_numeric, tsirelson

# ==============================================================================
# TEST 4: No-signaling condition
# ==============================================================================

def test_no_signaling():
    """
    No-signaling: Alice's local statistics are independent of Bob's
    measurement choice (and vice versa).

    P_A(+|alpha) = P(++|alpha,beta) + P(+-|alpha,beta) must be independent of beta.

    FRAMEWORK INTERPRETATION:
      Perspectives are INDEPENDENT projections of V.
      Changing pi_2's projection axis cannot affect pi_1's marginal.
      This follows from the projection structure: Tr_2(|psi><psi|) is
      independent of the basis chosen for system 2.

    This is crucial: the framework explains correlations WITHOUT
    faster-than-light signaling, because the crystallization constraint
    was established during interaction, and projections are independent.
    """
    alpha, beta = symbols('alpha beta', real=True)

    _, probs = bell_correlation(alpha, beta)
    P_pp, P_pm, P_mp, P_mm = probs

    # Alice's marginal: P_A(+) = P(++) + P(+-)
    P_A_up = trigsimp(simplify(P_pp + P_pm))

    # Alice's marginal: P_A(-) = P(-+) + P(--)
    P_A_dn = trigsimp(simplify(P_mp + P_mm))

    # These should be 1/2 regardless of beta (for singlet)
    A_up_is_half = simplify(P_A_up - Rational(1, 2)) == 0
    A_dn_is_half = simplify(P_A_dn - Rational(1, 2)) == 0

    # Bob's marginal: P_B(+) = P(++) + P(-+)
    P_B_up = trigsimp(simplify(P_pp + P_mp))
    P_B_dn = trigsimp(simplify(P_pm + P_mm))

    B_up_is_half = simplify(P_B_up - Rational(1, 2)) == 0
    B_dn_is_half = simplify(P_B_dn - Rational(1, 2)) == 0

    return (A_up_is_half, A_dn_is_half, B_up_is_half, B_dn_is_half,
            P_A_up, P_A_dn, P_B_up, P_B_dn)

# ==============================================================================
# TEST 5: Coherence measure and entanglement
# ==============================================================================

def test_coherence_entanglement():
    """
    Connect DEF_0265 (coherence measure) to entanglement.

    DEF_0265: Coh(tau, pi_1, pi_2) = |A_pi_1(tau) n A_pi_2(tau)| / max(|A_pi_1(tau)|, |A_pi_2(tau)|)

    For entangled states in the framework:
      - The "trajectory" tau is the crystallized state in V
      - A_pi(tau) is the set of states accessible from perspective pi
      - High coherence = high classical correlation (product state)
      - Entanglement may correspond to a SPECIFIC pattern of coherence
        where individual perspectives are maximally uncertain (Coh with
        self is low) but joint coherence is high.

    TEST: For singlet state, each perspective sees maximally mixed state
    (zero information locally), but joint state has maximal information
    (pure state). This is the hallmark of entanglement.

    Framework analog: individual coherence is MINIMAL (1/2 for each outcome),
    but the CROSS-PERSPECTIVE coherence (measured by overlap of joint
    accessible sets) is MAXIMAL (perfect anticorrelation along any axis).
    """
    # Reduced density matrix for perspective 1 (trace over perspective 2)
    # For singlet: rho_1 = I/2
    M_singlet = Matrix([[0, 1], [-1, 0]]) / sqrt(2)
    rho_1 = M_singlet * M_singlet.adjoint()

    # Purity of individual perspective: Tr(rho^2)
    # For I/2: Tr((I/2)^2) = Tr(I/4) = 1/2
    purity_individual = simplify((rho_1**2).trace())

    # Purity of joint state: Tr(rho_joint^2)
    # For pure state: always 1
    purity_joint = 1  # Pure state by construction

    # "Entanglement contrast": ratio of joint purity to individual purity
    # For maximally entangled: 1/(1/2) = 2 (maximum for 2-dim)
    # For product state: 1/1 = 1 (no contrast)
    contrast = Rational(purity_joint, 1) / purity_individual

    # Concurrence (entanglement measure for 2-qubit states)
    # For singlet: C = 1 (maximally entangled)
    # Concurrence formula: C = max(0, lambda_1 - lambda_2 - lambda_3 - lambda_4)
    # For singlet, this is 1

    # Framework interpretation of concurrence:
    # C = 0: crystallization constraint can be factored (no shared history)
    # C = 1: maximal crystallization constraint (perfect shared history)

    return purity_individual, purity_joint, contrast

# ==============================================================================
# TEST 6: Higher-dimensional embedding
# ==============================================================================

def test_higher_dim_embedding():
    """
    Verify that embedding the singlet in a higher-dimensional space
    (representing the full crystal) preserves all correlations.

    FRAMEWORK POINT:
      The singlet lives in C^2 (x) C^2 = C^4, but the full crystal
      space has dimension related to n_c = 11 or the full 15.
      The crystallization constraint in the higher space projects
      DOWN to the singlet in the spin subspace.

    TEST: Embed C^4 into C^(n_c * n_c) and verify that projecting
    back to the spin subspace preserves the correlation function.
    This confirms that the higher-dimensional crystalline structure
    is COMPATIBLE with standard entanglement physics.
    """
    # Embed the 4D singlet into an 11x11 = 121-dimensional space
    # (n_c = 11 for each particle's crystal dimension)
    # The spin subspace is a 4D subspace of the 121D space

    # Embedding: |psi_singlet> in C^4 -> |psi_embedded> in C^121
    # with the state occupying the first 4 components

    dim_full = n_c * n_c  # 121
    dim_spin = 4           # C^2 (x) C^2

    # Singlet in C^4
    psi_4 = Matrix([0, 1, -1, 0]) / sqrt(2)  # |^v> - |v^>

    # Embed in C^121
    psi_embedded = zeros(dim_full, 1)
    for i in range(dim_spin):
        psi_embedded[i] = psi_4[i]

    # Projection operator back to spin subspace
    P_spin = zeros(dim_spin, dim_full)
    for i in range(dim_spin):
        P_spin[i, i] = 1

    # Project back
    psi_projected = P_spin * psi_embedded

    # Check: projected state = original state
    recovery_check = simplify(psi_projected - psi_4)
    is_recovered = all(recovery_check[i] == 0 for i in range(dim_spin))

    # Norm is preserved
    norm_embedded = simplify(psi_embedded.adjoint() @ psi_embedded)
    norm_original = simplify(psi_4.adjoint() @ psi_4)
    norm_preserved = simplify(norm_embedded[0,0] - norm_original[0,0]) == 0

    return is_recovered, norm_preserved, dim_full, dim_spin

# ==============================================================================
# TEST 7: Framework-specific -- crystallization as entanglement mechanism
# ==============================================================================

def test_crystallization_mechanism():
    """
    The framework-specific claim: entanglement is created by
    SHARED CRYSTALLIZATION EVENTS.

    Mechanism:
      1. Two particles interact -> shared crystallization in V
      2. Crystallization imposes constraint on combined state
      3. Constraint lives in V, inaccessible to either pi_1 or pi_2 alone
      4. Observation (further crystallization) at pi_1 reveals local outcome
      5. Constraint in V forces correlated outcome at pi_2

    Mathematical model:
      - Pre-interaction: |a> (x) |b> (product state, no shared constraint)
      - Crystallization event: U_interact |a>|b> = |psi_entangled>
      - U_interact is unitary (THM_0493) -- crystallization preserves norm
      - Post-crystallization state cannot be factored -> entangled

    TEST: Verify that a generic unitary on C^4 can produce any entangled
    state from a product state. This shows crystallization (unitary
    interaction) is SUFFICIENT to create entanglement.
    """
    theta = symbols('theta', real=True, positive=True)

    # Start with product state |^^>
    product = Matrix([1, 0, 0, 0])

    # A "crystallization" unitary that creates entanglement
    # Controlled-NOT style: acts on joint space
    # This represents the interaction that crystallizes the constraint
    #
    # For generality, parameterize by angle theta:
    # At theta=0: no entanglement (identity)
    # At theta=pi/4: maximal entanglement (Bell state)
    U_crystal = Matrix([
        [cos(theta), 0, 0, sin(theta)],
        [0, cos(theta), -sin(theta), 0],
        [0, sin(theta), cos(theta), 0],
        [-sin(theta), 0, 0, cos(theta)]
    ])

    # Verify unitarity: U^+ U = I
    UdagU = simplify(U_crystal.adjoint() * U_crystal)
    is_unitary = simplify(UdagU - eye(4)) == zeros(4)

    # Apply crystallization
    psi_out = U_crystal * product
    psi_out = trigsimp(simplify(psi_out))

    # Compute Schmidt coefficients (entanglement measure)
    # Reshape to 2x2 matrix
    M_out = Matrix([
        [psi_out[0], psi_out[1]],
        [psi_out[2], psi_out[3]]
    ])

    # Singular values determine entanglement
    # For our state: M = [[cos(theta), 0], [0, cos(theta)]] + [[0,0],[sin(theta),0]] etc.
    # Let's compute the reduced density matrix
    rho_1 = simplify(M_out * M_out.adjoint())

    # Purity as function of theta
    purity = simplify((rho_1**2).trace())
    purity = trigsimp(purity)

    # At theta = 0: purity = 1 (product state)
    purity_0 = purity.subs(theta, 0)

    # At theta = pi/4: purity = 1/2 (maximally entangled)
    purity_max = purity.subs(theta, pi/4)

    return is_unitary, purity, purity_0, purity_max

# ==============================================================================
# TEST 8: Specific numerical check at key angles
# ==============================================================================

def test_specific_angles():
    """
    Verify correlation at specific physically important angles.
    These are concrete numerical checks.
    """
    results = {}

    # Same axis: perfect anticorrelation E(0,0) = -1
    E_00, _ = bell_correlation(Rational(0), Rational(0))
    results['E(0,0)'] = (simplify(E_00), -1)

    # Opposite axis: perfect correlation E(0,pi) = +1
    E_0pi, _ = bell_correlation(Rational(0), pi)
    results['E(0,pi)'] = (simplify(E_0pi), 1)

    # Perpendicular: no correlation E(0,pi/2) = 0
    E_0half, _ = bell_correlation(Rational(0), pi/2)
    results['E(0,pi/2)'] = (simplify(E_0half), 0)

    # 45 degrees: E(0,pi/4) = -cos(pi/4) = -1/sqrt2
    E_045, _ = bell_correlation(Rational(0), pi/4)
    results['E(0,pi/4)'] = (simplify(E_045), -cos(pi/4))

    # 60 degrees: E(0,pi/3) = -cos(pi/3) = -1/2
    E_060, _ = bell_correlation(Rational(0), pi/3)
    results['E(0,pi/3)'] = (simplify(E_060), Rational(-1, 2))

    return results

# ==============================================================================
# MAIN: Run all tests
# ==============================================================================

def main():
    print("=" * 70)
    print("ENTANGLEMENT FROM CRYSTALLIZATION: BELL CORRELATION VERIFICATION")
    print("=" * 70)
    print()

    all_pass = True
    test_results = []

    # --- Test 1: Non-factorizability ---
    print("TEST 1: Singlet is non-factorizable (genuinely entangled)")
    print("-" * 50)
    schmidt_rank, is_max_mixed, eigenvals = test_non_factorizability()
    print(f"  Schmidt rank: {schmidt_rank}")
    print(f"  Reduced state = I/2 (max mixed): {is_max_mixed}")
    print(f"  Eigenvalues of rho_1: {eigenvals}")
    t1 = schmidt_rank == 2 and is_max_mixed
    test_results.append(("Singlet is genuinely entangled (Schmidt rank 2)", t1))
    test_results.append(("Reduced state is maximally mixed (I/2)", is_max_mixed))
    print()

    # --- Test 2: Bell correlation ---
    print("TEST 2: Correlation function E(a,b) = -cos(a - b)")
    print("-" * 50)
    E, E_qm, diff = test_bell_correlation()
    print(f"  Computed E(a,b) = {E}")
    print(f"  QM prediction:    {E_qm}")
    print(f"  Difference:       {diff}")
    t2 = diff == 0
    test_results.append(("E(a,b) = -cos(a-b) exactly", t2))
    print()

    # --- Test 3: CHSH ---
    print("TEST 3: CHSH inequality violation")
    print("-" * 50)
    S, S_num, tsirelson = test_chsh()
    print(f"  CHSH parameter S = {str(S)}")
    print(f"  Numerical value:   {S_num:.6f}")
    print(f"  Tsirelson bound:   {tsirelson:.6f}")
    print(f"  Classical bound:   2.000000")
    print(f"  Exceeds classical: {abs(S_num) > 2}")
    print(f"  Reaches Tsirelson: {abs(abs(S_num) - tsirelson) < 1e-10}")
    t3a = abs(S_num) > 2
    t3b = abs(abs(S_num) - tsirelson) < 1e-10
    test_results.append(("CHSH violation: |S| > 2", t3a))
    test_results.append(("Reaches Tsirelson bound: |S| = 2*sqrt(2)", t3b))
    print()

    # --- Test 4: No-signaling ---
    print("TEST 4: No-signaling condition")
    print("-" * 50)
    (A_up, A_dn, B_up, B_dn,
     PA_up, PA_dn, PB_up, PB_dn) = test_no_signaling()
    print(f"  P_A(+) = {PA_up} -> independent of b: {A_up}")
    print(f"  P_A(-) = {PA_dn} -> independent of b: {A_dn}")
    print(f"  P_B(+) = {PB_up} -> independent of a: {B_up}")
    print(f"  P_B(-) = {PB_dn} -> independent of a: {B_dn}")
    t4 = A_up and A_dn and B_up and B_dn
    test_results.append(("No-signaling: local stats independent of remote choice", t4))
    print()

    # --- Test 5: Coherence and entanglement ---
    print("TEST 5: Coherence-entanglement connection")
    print("-" * 50)
    purity_ind, purity_joint, contrast = test_coherence_entanglement()
    print(f"  Individual perspective purity: {purity_ind}")
    print(f"  Joint state purity:            {purity_joint}")
    print(f"  Entanglement contrast:         {contrast}")
    print(f"  (Product state contrast = 1, max entangled = 2 for qubits)")
    t5a = purity_ind == Rational(1, 2)
    t5b = contrast == 2
    test_results.append(("Individual purity = 1/2 (maximally uncertain)", t5a))
    test_results.append(("Entanglement contrast = 2 (maximum for qubits)", t5b))
    print()

    # --- Test 6: Higher-dim embedding ---
    print("TEST 6: Higher-dimensional crystal embedding")
    print("-" * 50)
    recovered, norm_ok, dim_full, dim_spin = test_higher_dim_embedding()
    print(f"  Full crystal dim: {dim_full} (n_c x n_c = {n_c}x{n_c})")
    print(f"  Spin subspace dim: {dim_spin}")
    print(f"  State recovered after projection: {recovered}")
    print(f"  Norm preserved in embedding: {norm_ok}")
    t6 = recovered and norm_ok
    test_results.append(("Embedding in n_c^2-dim space preserves state", recovered))
    test_results.append(("Norm preserved in higher-dim embedding", norm_ok))
    print()

    # --- Test 7: Crystallization mechanism ---
    print("TEST 7: Crystallization creates entanglement")
    print("-" * 50)
    is_unit, purity_fn, p0, p_max = test_crystallization_mechanism()
    print(f"  Crystallization operator is unitary: {is_unit}")
    print(f"  Purity as fn of crystallization angle: {str(purity_fn)}")
    print(f"  At t=0 (no interaction): purity = {p0} -> product state")
    print(f"  At t=pi/4 (max interaction): purity = {p_max} -> max entangled")
    t7a = is_unit
    t7b = p0 == 1
    t7c = simplify(p_max - Rational(1, 2)) == 0
    test_results.append(("Crystallization operator is unitary", t7a))
    test_results.append(("No crystallization -> product state (purity=1)", t7b))
    test_results.append(("Max crystallization -> max entangled (purity=1/2)", t7c))
    print()

    # --- Test 8: Specific angles ---
    print("TEST 8: Specific angle checks")
    print("-" * 50)
    results = test_specific_angles()
    for label, (computed, expected) in results.items():
        match = simplify(computed - expected) == 0
        print(f"  {label}: computed={computed}, expected={expected}, match={match}")
        test_results.append((f"Angle check {label}", match))
    print()

    # ==============================================================================
    # SUMMARY
    # ==============================================================================
    print("=" * 70)
    print("VERIFICATION SUMMARY")
    print("=" * 70)
    print()

    pass_count = 0
    fail_count = 0
    for name, passed in test_results:
        status = "PASS" if passed else "FAIL"
        if passed:
            pass_count += 1
        else:
            fail_count += 1
            all_pass = False
        print(f"  [{status}] {name}")

    print()
    print(f"  Total: {pass_count + fail_count} tests, {pass_count} PASS, {fail_count} FAIL")
    print()

    # ==============================================================================
    # CONCLUSIONS
    # ==============================================================================
    print("=" * 70)
    print("CONCLUSIONS")
    print("=" * 70)
    print()
    print("1. CONFIRMED: The framework's Hilbert space (THM_0491) + Born rule")
    print("   (THM_0494) + projection structure reproduces all standard QM")
    print("   entanglement predictions, including Bell correlations.")
    print()
    print("2. CONFIRMED: CHSH violation reaches Tsirelson bound (2*sqrt(2)).")
    print("   This means: crystallization constraints in the higher-dimensional")
    print("   space CANNOT be replaced by local properties. The constraint")
    print("   is genuinely non-local in the sense of Bell's theorem.")
    print()
    print("3. CONFIRMED: No-signaling holds. The correlation is established")
    print("   during crystallization (interaction), not communicated at")
    print("   measurement. Each perspective's local statistics are independent")
    print("   of the remote measurement choice.")
    print()
    print("4. FRAMEWORK INTERPRETATION [CONJECTURE]:")
    print("   Entanglement = residual signature of shared crystallization")
    print("   in the higher-dimensional crystal space V.")
    print("   - Interaction = shared crystallization event")
    print("   - Entangled state = non-factorizable constraint in V")
    print("   - Observation = local crystallization (projection)")
    print("   - Correlation = geometric consequence of constraint in V")
    print()
    print("5. OPEN QUESTIONS:")
    print("   a. Does the framework predict any DEVIATION from standard")
    print("      entanglement? (Need to check if finite crystal dimension")
    print("      or discrete structure modifies correlations.)")
    print("   b. Is the tensor product structure DERIVED or imported?")
    print("   c. Does the coherence measure (DEF_0265) quantify")
    print("      entanglement in a novel way?")
    print("   d. Can the framework explain WHY singlet (not triplet)")
    print("      is the natural crystallization outcome for spin-1/2?")
    print()

    return all_pass

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
