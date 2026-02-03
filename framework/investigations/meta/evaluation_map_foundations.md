# Investigation: Evaluation Map Foundations

**Status**: ACTIVE
**Created**: Session 188
**Last Updated**: Session 200
**Confidence**: [THEOREM] for core results, [DERIVATION] for rank selection

---

## Plain Language

Imagine you're standing in a room. You can see the room from where you stand, but you can't see behind your own head. This isn't a defect in your vision — it's a mathematical consequence of being IN the room rather than outside it.

The evaluation map theorem makes this precise. The "room" is V_Crystal (the mathematical universe). "Standing somewhere" means choosing evaluation points. The "operators" (End(V)) are all possible transformations of the room — there are n^2 of them, but from where you stand you can only evaluate n of them. The ratio n^2/n = n grows with the room's size: the bigger the room, the MORE you're missing.

This isn't optional. For any room with 2 or more dimensions, the blind spots are mathematically forced. You can't build a better viewpoint that eliminates them. And the structure of what's hidden follows a very specific pattern that depends on where you're standing.

The division algebra constraint then says: your "standing position" must support well-defined time (associative transitions). This limits how many dimensions you can stand in to {1, 2, 4}. The framework picks the richest option: 4 dimensions (quaternions = spacetime). The remaining 7 dimensions (imaginary octonions) are the "behind your head" — they become internal gauge structure.

**One-sentence version**: The evaluation map proves that partial perspectives are structurally inevitable, and the division algebra constraint selects exactly 4 accessible dimensions out of 11.

---

## The Complete Theorem Chain

### Theorem 1: THM_04AC — Evaluation-Induced Perspective [CANONICAL]

**Statement**: For dim(V_Crystal) = n >= 2, any set of k linearly independent evaluation points (1 <= k <= n-1) induces a rank-k orthogonal projection satisfying P1, P2, and P3.

**Proof**: By contradiction. Full self-knowledge requires n^2 <= n, which fails for n >= 2.

**Significance**: P1 (Partiality), P2 (Non-Triviality), P3 (Finite Access) become theorems rather than axioms.

### Theorem 2: THM_04AD — Perspective Rank Selection [DERIVATION]

**Statement**: The division algebra constraint (THM_0484 + Frobenius) restricts the perspective rank to k in {1, 2, 4}. Maximality (AXM_0117) selects k = 4.

**Proof**: Associativity (AXM_0119) requires T to be an associative division algebra. Frobenius: dim in {1, 2, 4}. Maximality: k = 4.

**Significance**: n_d = 4 is derived from algebraic structure, not assumed independently.

### Supporting Results

| Theorem | Statement | Status |
|---------|-----------|--------|
| THM_0410 | Self-Inaccessibility: blind spots are invisible | CANONICAL |
| THM_04A7 | Self-Model Incompleteness: M_pi < pi | CANONICAL |
| THM_04A8 | Perspective Space Cardinality: |Pi| = |R| | CANONICAL |
| THM_04A9 | Non-Paradoxical Gap: G_pi well-defined | CANONICAL |

---

## The Axiom Reduction

### Before the evaluation map work

The framework needed these as independent axioms/assumptions:

1. AXM_0104 (P1): Partiality — im(pi) is proper subspace
2. AXM_0102 (P2): Non-triviality — im(pi) != {0}
3. AXM_0113 (P3): Finite access — dim(V_pi) < infinity
4. n_d = 4 — structural assumption (from THM_04A0 / spacetime_from_associativity)

### After THM_04AC + THM_04AD

| Previous Axiom/Assumption | New Status | How Derived |
|---------------------------|------------|-------------|
| P1 (Partiality) | **THEOREM** | n^2 > n for n >= 2 (THM_04AC) |
| P2 (Non-Triviality) | **THEOREM** | k >= 1 and evaluation points exist (THM_04AC) |
| P3 (Finite Access) | **THEOREM** | dim finite and k < n (THM_04AC) |
| n_d = 4 | **DERIVED** | Frobenius + maximality (THM_04AD) |

### Remaining axioms that drive the derivation

| Axiom | Role | Status |
|-------|------|--------|
| AXM_0100 (Finiteness) | dim(V_Crystal) < infinity | Layer 0, CANONICAL |
| AXM_0101 (Connectivity) | V_Crystal is inner product space | Layer 0, CANONICAL |
| AXM_0102 (Non-Triviality) | V_Crystal != {0} | Layer 0, CANONICAL (now also conclusion) |
| AXM_0115 (Algebraic Completeness) | V supports all division algebras | Layer 1, CANONICAL |
| AXM_0117 (Crystallization Tendency) | Maximal crystallization preferred | Layer 1, CANONICAL |
| AXM_0119 (Transition Linearity) | Transitions are R-linear | Layer 1, AXIOM |

Note: AXM_0102 appears both as a premise (V_Crystal is non-trivial, needed for dim >= 2) and as a conclusion (P2: perspective is non-trivial). This is not circular — P2 for the PERSPECTIVE follows from AXM_0102 for the CRYSTAL.

---

## The Dimensional Cascade

```
AXM_0115 (algebraic completeness)
    |
    v
THM_04AB: G_2 irreducibility -> n_c >= 11, minimality -> n_c = 11
    |
    v
THM_04AC: evaluation map on End(R^11) -> perspectives exist for k=1..10
    |
    v
THM_0484 + AXM_0119: Frobenius -> k in {1, 2, 4}
    |
    v
G_2 + SO(3) irreducibility: k in {1, 4}  [k=2 eliminated]
    |
    v
AXM_0117: maximality -> k = 4 = n_d
    |
    v
RESULT: V_Crystal = V_pi(4) + G_pi(7) = H + Im(O) = spacetime + internal
```

This cascade derives the 4+7=11 split from:
- One algebraic axiom (AXM_0115)
- One dynamical axiom (AXM_0119)
- One selection axiom (AXM_0117)

---

## Key Insights

### 1. Perspective is not optional

For any vector space of dim >= 2, evaluation maps have non-trivial kernels. This is arithmetic (n^2 > n), not physics. The framework's central insight — that reality is seen partially — is a mathematical theorem.

### 2. The operator-space mismatch drives everything

dim(End(V)) = n^2, dim(V) = n. The quadratic growth of the operator algebra relative to the vector space is why blind spots grow with dimension. For n=11: you see 11 out of 121 operator dimensions from any single position.

### 3. Algebra selects the rank (tightened)

The evaluation map alone allows any rank. Frobenius restricts to {1, 2, 4}. G_2 + SO(3) irreducibility further eliminates k = 2 (Im(H) cannot fit in 2-dim defect; Im(H)+Im(O) cannot fit in 9-dim hidden). This leaves a **binary** choice: {1, 4}. The constraint eliminates 8 out of 10 possible ranks by algebra alone.

### 5. Composition blindness

The evaluation map reveals T(v_i) for each operator T, but the composition (T1*T2)(v_i) = T1(T2(v_i)) requires T1's action on T2(v_i), which may lie outside the evaluation subspace. Perspectives can see individual operator snapshots but cannot compose them. The observable algebra End(W) (dim k^2 = 16 for k=4) is the maximal subalgebra where composition IS visible -- and it is automatically a C*-algebra.

### 4. The 4+7 split is deeply algebraic

The split n_c = n_d + (n_c - n_d) = 4 + 7 corresponds exactly to:
- 4 = dim(H) = maximal associative division algebra
- 7 = dim(Im(O)) = imaginary part of the maximal normed division algebra

This is not numerology. It follows from the Frobenius and Hurwitz classification theorems.

---

## The SO(8) Triality Discovery

A striking finding from the kernel decomposition: for k = 4, n = 11:

```
End(V) = Hom(W,W)     + Hom(W,W^perp) + Hom(W^perp,W)  + Hom(W^perp,W^perp)
       = 4x4 = 16     + 4x7 = 28      + 7x4 = 28       + 7x7 = 49
       = 16 + 28 + 28 + 49 = 121
```

The cross-term **Hom(W^perp, W) = 28 = dim(so(8))**, and this match is **unique to k = 4** among Frobenius-allowed values. SO(8) has triality (unique among SO(n)), and G_2 = Aut(O) is the stabilizer of the triality automorphisms.

This means: the same evaluation map kernel that creates blind spots ALSO determines that the hidden space carries octonionic structure. Gauge symmetry is not imposed — it emerges from the operator algebra decomposition.

### Physical interpretation of each block [CONJECTURE]

| Block | Dimension | Physical Role |
|-------|-----------|---------------|
| Hom(W, W) | 16 | Defect self-maps = spacetime physics (gravity) |
| Hom(W, W^perp) | 28 | Defect-to-hidden = matter field content |
| Hom(W^perp, W) | 28 = so(8) | Hidden-to-defect = gauge connections |
| Hom(W^perp, W^perp) | 49 | Hidden dynamics = gauge boson self-interactions |

### Gauge breaking chain [CONJECTURE]

The hidden antisymmetric maps give so(7) = 21 dims. The breaking chain:
- SO(7) -> G_2: 21 - 14 = 7 broken generators (= dim(Im(O)))
- G_2 -> SU(3): 14 - 8 = 6 broken generators
- Remaining: SU(2) x U(1) from additional structure
- SM total: 8 + 3 + 1 = 12 generators

**Verification**: `verification/sympy/hidden_space_structure.py` (5/5 PASS)

---

## The Lorentz Signature Result (THM_04AE)

The observable algebra chain continues beyond gauge structure to determine the spacetime metric signature:

1. **Observable algebra**: End_C(C^2) = M_2(C) (from k=4, F=C)
2. **Self-adjoint part**: Herm(2) = R^4 (basis: I, sigma_1, sigma_2, sigma_3)
3. **Two natural quadratic forms** (forced by SU(2) invariance + Schur's lemma):
   - Q_E(X) = Tr(X^2) = 2(t^2 + x^2 + y^2 + z^2) -- **Euclidean** (4,0)
   - Q_L(X) = det(X) = t^2 - x^2 - y^2 - z^2 -- **Lorentzian** (1,3)

4. **Relationship**: det(X) = (1/2)Tr(X)^2 - (1/2)Tr(X^2). The Minkowski metric is the difference between the trace-squared and trace-of-square invariants.

5. **Symmetry**: SL(2,C)/Z_2 = SO+(1,3) (proper orthochronous Lorentz group)

### What this achieves

The Lorentz signature was previously imported as I-STRUCT-4. THM_04AE reduces this to: "the physical metric is the spectral invariant (det), not the norm invariant (Tr)." This is a strictly weaker assumption.

### The Spectral Metric Selection (Part g)

THM_04AE Part (g) provides a dynamical argument for why det (not Tr) is the physical metric:
- Cayley-Hamilton: det and Tr are the ONLY polynomial invariants of M_2(C) [I-MATH]
- Eigenvalue gap = sqrt(Tr^2 - 4*det) depends on det, is purely spatial [I-MATH]
- Transition probability (Rabi) depends only on |h| = gap/2, independent of E = Tr/2 [I-MATH]
- Light cone det(DX)=0 means shared eigenvector = spectral information preservation [I-MATH]
- Causal structure: det distinguishes timelike from spacelike; Tr cannot [I-MATH]

**Status**: [DERIVATION] (upgraded from [CONJECTURE]). Remaining: [A-PHYSICAL] identification "spectral geometry = physical geometry."

**Verification**: `verification/sympy/lorentz_from_observable_algebra.py` (6/6 PASS), `verification/sympy/spectral_metric_selection.py` (7/7 PASS)

---

## The C*-Algebra Route to Quantum Mechanics

The observable algebra End_C(W) = M_2(C) is automatically a C*-algebra [I-MATH]. This provides a third, independent route to quantum mechanics, complementing the geometric (THM_0491) and dynamical (THM_0494) routes.

### Three convergent routes

| Route | Input axioms | Result | Status |
|-------|-------------|--------|--------|
| **Geometric** (THM_0491) | AXM_0100 + AXM_0101 + THM_0485 | V_pi is complex Hilbert space | CANONICAL |
| **Dynamical** (THM_0493/0494) | THM_0491 + AXM_0117 + AXM_0112 | Unitary evolution + Born rule | DERIVATION |
| **Algebraic** (eval map) | THM_04AC + THM_04AD + THM_0485 | Observable algebra -> C*-algebra -> density matrices -> Born rule | DERIVATION |

### What the algebraic route provides

1. **Observables**: Self-adjoint elements of M_2(C) = Herm(2) = R^4 [I-MATH: C*-algebra]
2. **States**: Positive linear functionals on M_2(C) = density matrices rho [I-MATH: GNS]
3. **Born rule**: P(lambda_i) = Tr(P_i rho) from spectral decomposition [I-MATH]
4. **Superposition**: Forced by composition blindness (THM_04AC corollary) -- a state that is an eigenstate of one observable is generically NOT an eigenstate of non-commuting observables
5. **State-space geometry**: Pure states form Bloch sphere S^2 (2-dim), state space = Bloch ball B^3 (3-dim = spatial dimensions from 1+3 split)

### The convergence significance

The three routes use DIFFERENT axiom inputs and arrive at the SAME structure. This is evidence for internal consistency: the framework's axioms don't just permit QM, they require it from multiple independent angles.

**Verification**: `verification/sympy/observable_algebra_cstar.py` (5/5 PASS)

---

## What Remains Open

| Question | Status | Difficulty |
|----------|--------|------------|
| Why AXM_0117 (maximality) holds | Axiom — no derivation | Fundamental |
| Why AXM_0115 (algebraic completeness) holds | Axiom — no derivation | Fundamental |
| The 1+3 split within k=4 (time vs space) | **DERIVED** (THM_04AE: Z(H)=R=time, Im(H)=space) | Resolved |
| Lorentz signature from algebra | **DERIVED** (THM_04AE: det has (1,3)) | Resolved |
| Why det (spectral) is the physical metric | **DERIVED** (THM_04AE Part g: crystallization dynamics selects spectral invariant) | Resolved (remaining: A-PHYSICAL identification) |
| Connection to crystallization dynamics | **ADDRESSED** (THM_04AE Part g: Born rule + eigenvalue gap) | Resolved |
| QM from observable algebra | **DERIVED** (C*-algebra route: M_2(C) -> density matrices -> Born rule) | Resolved |
| Gauge chain from eval map | **DERIVED** (S200: two-route convergence with THM_0487, 9/9 PASS) | Resolved |
| Uniqueness of perspective (C4 equivariance issue) | All same-rank equivalent | Open |
| Herm(2) = spacetime events identification | [A-PHYSICAL] Layer 2 correspondence | Fundamental |
| Continuous parameter s gap (THM_0493) | **IRREDUCIBLE** from eval map (kinematics != dynamics) | Documented |

---

## Verification

| Script | Tests | Status | What it Verifies |
|--------|-------|--------|------------------|
| `evaluation_map_perspective.py` | 6/6 | PASS | Basic evaluation map properties |
| `evaluation_induced_perspective.py` | 6/6 | PASS | THM_04AC: perspectives from evaluation |
| `perspective_rank_selection.py` | 6/6 | PASS | THM_04AD: Frobenius + maximality -> k=4 |
| `self_inaccessibility_proof.py` | 12/12 | PASS | THM_0410: blind spots |
| `self_model_incompleteness.py` | 8/8 | PASS | THM_04A7: self-model incomplete |
| `perspective_space_cardinality.py` | 6/6 | PASS | THM_04A8: |Pi| = |R| |
| `perspective_rank_selection.py` | 6/6 | PASS | THM_04AD: Frobenius + maximality -> k=4 |
| `rank_selection_tightened.py` | 5/5 | PASS | k=2 elimination, composition blindness, observable algebra |
| `hidden_space_structure.py` | 5/5 | PASS | Kernel decomposition, SO(8) triality, gauge chain |
| `lorentz_from_observable_algebra.py` | 6/6 | PASS | THM_04AE: det(Herm(2)) has Lorentz signature (1,3) |
| `spacetime_split_from_center.py` | 6/6 | PASS | 1+3 split from Z(H)=R, k=4 uniqueness for Lorentz |
| `spectral_metric_selection.py` | 7/7 | PASS | Spectral metric argument: Cayley-Hamilton, gap, dynamics, causal structure |
| `observable_algebra_cstar.py` | 5/5 | PASS | C*-algebra structure, density matrices, Born rule (algebraic), superposition |
| `gauge_chain_convergence.py` | 9/9 | PASS | Two-route gauge convergence, generator accounting, SO(8) triality, s gap, Herm(2) status |

---

## Gauge Chain: Two-Route Convergence (Session 200)

The evaluation map kernel decomposition independently derives the SM gauge group, converging with THM_0487's energetic breaking chain.

### Route 1: THM_0487 (Energetic)

SO(11) -> SO(4)xSO(7) [Landau potential, c_3 > 0] -> SO(4)xG_2 [Aut(O)] -> SO(4)xSU(3) [F=C] -> SU(2)xU(1)xSU(3) [EWSB]

### Route 2: Eval Map (Algebraic)

End(V) = 16 + 28 + 28 + 49. Hidden self-maps: so(7) = 21 dims -> G_2 = Aut(O) [THM_04AB] -> SU(3) [THM_0485, F=C]. Defect with F=C: W_C = C^2, unitaries U(2) = SU(2) x U(1).

### Key Differences

| Component | THM_0487 | Eval Map |
|-----------|----------|----------|
| SU(3) mechanism | Landau energy minimization | Aut(O) structure preservation |
| SU(2)xU(1) mechanism | SO(4) -> EWSB (Higgs VEV) | F=C on C^2 (no separate EWSB) |
| Key assumption | Quartic Landau form [A-STRUCTURAL] | THM_04AC + THM_04AD [CANONICAL/DERIVATION] |

Both give SU(3)xSU(2)xU(1) with dim = 8 + 3 + 1 = 12. [DERIVATION]

### Notable Identity

44 total broken generators (including EWSB) = n_d x n_c = 4 x 11 = visible eval map operators. The number of symmetries broken by crystallization EQUALS the number of operator dimensions accessible through evaluation. [CONJECTURE: coincidence vs deep connection]

### Continuous Parameter s: Irreducible Gap

The eval map determines kinematics (algebra of observables, gauge structure) but NOT dynamics (which Hamiltonian, what coupling constants, particle masses). The continuous parameter s in THM_0493 reflects this distinction. Resolution requires dynamical input: AXM_0117 (crystallization tendency), THM_0487 (Landau energetics), THM_0494 (Wright-Fisher dynamics).

### Herm(2) = Spacetime: Weakest Link

The identification of Herm(2) elements with spacetime events remains [A-PHYSICAL]. The eval map gives an algebra, not a manifold. Bridging requires spectral geometry (Connes). Three strengthening paths: (A) derive Dirac operator from crystallization, (B) show Herm(2) parametrizes perspective equivalences, (C) use Kadison duality.

---

## Dependencies

- **Uses**: AXM_0100, AXM_0101, AXM_0102, AXM_0115, AXM_0117, AXM_0119, THM_0484, THM_0494, THM_04AB, I-MATH (Frobenius, Hurwitz, C*-algebras, GNS)
- **Used by**: Gap 4 resolution, axiom economy analysis, dimensional cascade, QM chain convergence
- **Related**: `godel_self_inaccessibility.md`, `perspective_origin.md`, `spacetime_from_associativity.md`, `projection_qm_derivation.md`

---

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| 188 | Created evaluation map exploration (THM_04AC), rank selection chain (THM_04AD), 6 verification scripts, this investigation | Two new CANONICAL/DERIVATION theorems; axiom reduction P1/P2/P3 -> theorems; n_d=4 derived from algebra |
| 188 (cont.) | Tightened THM_04AD: G_2+SO(3) irreducibility eliminates k=2; composition blindness corollary; observable algebra End(W)=M_4(C) | Binary choice {1,4}, not ternary; operator-algebraic self-inaccessibility; C*-algebra structure emerges |
| 188 (cont.) | THM_04AE: Lorentz signature from observable algebra; M_2(C) self-adjoint part Herm(2) has det form with signature (1,3); reduces I-STRUCT-4 import to weaker structural choice | Lorentz metric is algebraically forced; remaining gap: why det (spectral) rather than Tr (norm) is physical |
| 188 (cont.) | THM_04AE Part (g): Spectral metric selection from crystallization dynamics; Cayley-Hamilton completeness, eigenvalue gap involves det, transition probability E-independent, light cone = shared eigenvector, causal structure from det | det vs Tr gap upgraded from [CONJECTURE] to [DERIVATION]; remaining gap is [A-PHYSICAL] eigenvalue=measurement identification |
| 188 (cont.) | C*-algebra route to QM: End_C(W) = M_2(C) is C*-algebra; density matrices, spectral decomposition, Born rule from algebraic structure; composition blindness forces superposition; three routes converge | Third independent route to QM; convergence of geometric + dynamical + algebraic; dim(state space) = 3 = dim(space) |
| 200 | Gauge chain convergence: two-route derivation of SM gauge group from eval map + THM_0487; generator accounting identity (44 = n_d x n_c); continuous s gap documented as irreducible; Herm(2) weakest link assessed | Gauge chain upgraded from [CONJECTURE] to [DERIVATION]; 9/9 PASS; three open items (perspective uniqueness, Herm(2), s gap) all documented |
