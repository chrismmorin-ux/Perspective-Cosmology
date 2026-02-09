# The Periodic Table of Meaning-Carrying Mathematical Objects

**Status**: REFERENCE (cross-layer)
**Layer**: 0-2 (objects are Layer 0; physical roles noted as [Layer 2])
**Created**: Session S256
**Purpose**: Classify all mathematical objects that survive the framework's selection filters, as a reference vocabulary for derivation work

---

## Organizing Principle

An object is **meaning-carrying** if it:

1. **Survives automorphisms** — its existence is coordinate-independent
2. **Participates in a norm or measure** — it connects to something conserved
3. **Closes under iteration** — repeated application stays within the same category
4. **Persists under perturbation** — small changes don't destroy it (structural stability)

Not every object satisfies all four equally. The table notes which filters each group primarily satisfies. Objects that fail all four are "structurally silent" — mathematically valid but carrying no framework-relevant content.

**What this table is NOT**: It is not exhaustive over all mathematics. It is exhaustive over the objects that appear in, or could appear in, derivation chains from the perspective axioms (C1-C4 + CCP).

---

## Quick Reference Card

For fast lookup during derivation work:

| Need to reason about... | Go to Group | Key objects |
|------------------------|-------------|-------------|
| Phase, gauge redundancy | **I** (Units) | S^0, S^1, S^3, S^7 |
| Conservation, metric, measure | **II** (Norms) | <.,.>, HS metric, Killing form, Casimirs, spectral functions |
| Primes, quantization, lattices | **III** (Irreducibles) | Z[i], Gaussian primes, D_fw, root systems |
| Generator counts, coupling spaces | **IV** (Endomorphisms) | End(V)=121, Hom(R^4,R^7)=28, Lie algebras |
| Symmetry, gauge groups, reps | **V** (Automorphisms) | SO(11), SU(2), SU(3), G_2; adjoint/fund/spinorial reps |
| Observers, viewpoints, subspaces | **VI** (Projections) | pi^2=pi, rank-k projectors |
| Interaction, non-commutativity | **VII** (Commutators) | [a,b] in H -> 3D, (a,b,c) in O -> 7D |
| Splitting, independence, branching | **VIII** (Decompositions) | V=4+7, End=16+28+28+49, 7->3+3bar+1 |
| How structure builds | **IX** (Sequences) | R->C->H->O, pipeline 121->12, gap tower |
| Where consistency fails | **X** (Boundaries) | Hurwitz, Frobenius, sedenion ZDs, C3 convergence |
| Grassmannians, coset spaces | **Derived** | Gr(4,11), SO(11)/SO(4)xSO(7), vacuum manifold |
| RG flow, crystallization dynamics | **Beyond** | Not algebraic — requires separate treatment |

---

## The Ten Groups

### Group I: Units & Orientation

**What they encode**: identity up to perspective
**Primary filter**: survive automorphisms + close under iteration
**Mathematical class**: elements of norm 1 in a normed algebra

| Object | Algebra | Dimension | Properties |
|--------|---------|-----------|------------|
| {+1, -1} | R | 0-sphere | Discrete, Z/2 |
| e^{i theta} | C | 1-sphere (U(1)) | Continuous, abelian |
| Unit quaternions | H | 3-sphere (SU(2)) | Non-abelian, simply connected |
| Unit octonions | O | 7-sphere (S^7) | NOT a group (non-associative) |

**Framework role**: Units define the symmetry available at each algebraic level. The unit spheres S^0, S^1, S^3, S^7 are exactly the parallelizable spheres (Adams theorem [I-MATH]). This is NOT a coincidence — it follows from the division property.

**Key fact**: S^7 is not a Lie group. This is the algebraic shadow of non-associativity (Group VII), and it forces G_2 rather than SO(7) as the automorphism group of O (Group V).

**Cross-references**:
- `core/axioms/AXM_0115_algebraic_completeness.md` (T0: transitions form a group)
- `core/17_complex_structure.md` (F=C forces U(1) phase)

---

### Group II: Norms & Inner Products

**What they encode**: conservation, measure, magnitude
**Primary filter**: survive automorphisms + persist under perturbation
**Mathematical class**: positive-definite quadratic forms on normed algebras

| Object | Domain | Formula | Properties |
|--------|--------|---------|------------|
| x^2 | R | N(x) = x^2 | Trivial norm |
| a^2 + b^2 | C | N(a+bi) = a^2 + b^2 | Gaussian norm; splits primes |
| Quaternionic norm | H | N(q) = q*q_bar | Multiplicative; 4-square identity |
| Octonionic norm | O | N(x) = x*x_bar | Multiplicative; 8-square identity |
| Inner product <.,.> | V_Crystal | <b_i, b_j> = delta_ij | AXM_0110 (orthogonality) |
| Hilbert-Schmidt metric | End(V) | <A,B> = Tr(A^dag B) | Induced from <.,.> on V |
| Killing form | Lie(G) | B(X,Y) = Tr(ad_X ad_Y) | Unique up to scale on simple g |
| Casimir operators | Lie(G) | C_2 = sum_a (T^a)^2 | Quadratic invariant; commutes with all generators |
| Dynkin index | Rep(G) | T(rho) = Tr_rho(T^a T^a)/Tr_adj(T^a T^a) | Measures "size" of representation in algebra |
| Spectral function | QFT vacuum | rho(s) = Im(Pi(s))/pi | Pole structure of 2-point correlator [I-QFT] |

**Framework role**: The inner product (AXM_0110) is one of two primitives. Everything conserved traces back to a norm. The Gaussian norm N(a+bi) = a^2 + b^2 is the CNH classifier — it partitions D_framework = {1,2,3,4,7,8,11} into norms {1,2,4,8} vs non-norms {3,7,11}.

**Key fact**: The Hilbert-Schmidt metric on End(V) restricts to a unique SO(4)xSO(7)-invariant metric on Hom(R^4, R^7) by Schur's lemma (Group IV + Group V). This is where democratic counting comes from.

**Casimir / Dynkin sub-structure**: Casimir operators C_2(G) = sum_a (T^a)^2 bridge Group II (they ARE quadratic forms) and Group VII (they're built FROM commutator structure). The Dynkin index T(rho) measures how a representation "weighs" relative to the adjoint. The democratic vs Dynkin question (S218-S228) is: does the gauge coupling use the HS metric (democratic, N=28) or the Dynkin index (perturbative, T=7)? Answer: democratic, because Hom(R^4,R^7) is irreducible and Schur forces uniqueness.

**Spectral functions**: The spectral function rho(s) = Im(Pi(s^2))/pi encodes the pole structure of vacuum 2-point correlators. Weinberg sum rules (S238) equate integrals of rho(s) to the sigma model metric (HS metric). This connects [I-QFT] dynamics to Group II geometry — IF spectral convergence holds (C3, Group X boundary).

**Pi-power sums (THM_04B5)**: The pi-power f(d) = floor(d/2) = rank(SO(d)) counts independent rotation planes (U(1) subgroups) in SO(d). Over D_fw subsets, pi-power sums yield framework dimensions: DA dims -> 7 = Im(O), imaginary dims -> 4 = n_d, D_fw\{11} -> 11 = n_c, all D_fw -> 16 = 2^n_d = n_d^2. The Cayley-Dickson descent floor(Im(D_k)/2) = Im(D_{k-1}) connects these sums to the tower structure. The total pi-power sum equals n_d^2 = 2^n_d, linking angular geometry to the alpha denominator: 137 = (total angular DOF) + n_c^2.

**Cross-references**:
- `core/axioms/AXM_0110_orthogonality.md`
- `core/axioms/AXM_0118_prime_attractor_selection.md` (CNH / Gaussian norm)
- `framework/investigations/gauge/democratic_bilinear_principle.md` (HS metric -> Schur)
- `core/theorems/THM_04B5_pi_power_sums.md` (pi-power sum theorems)

---

### Group III: Irreducibles & Lattices

**What they encode**: atomic structure, quantization, discreteness
**Primary filter**: persist under perturbation (primes are topologically isolated)
**Mathematical class**: prime elements in integral domains; discrete subgroups of normed algebras

| Object | Domain | Examples | Properties |
|--------|--------|---------|------------|
| Prime integers | Z | 2, 3, 5, 7, 11, ... | Irreducible in Z |
| Gaussian primes | Z[i] | 1+i, 2+i, 3, 7, 11, ... | Irreducible in Z[i]; split vs inert |
| Hurwitz integers | H | 24-cell lattice | Unique factorization (up to units) |
| Integral octonions | O | E_8 lattice | Densest sphere packing in R^8 |
| D_framework primes | Z[i] | {2, 5, 13, 17, 53, 73, 113, 137} | Primes of form a^2+b^2 with a,b in D_fw |

**Framework role**: Lattices are where discrete structure lives. Primes in Z[i] are classified by the Gaussian norm (Group II): primes p with p = a^2 + b^2 split in Z[i]; those with p = 3 mod 4 remain inert. D_framework primes are the split primes constructible from framework dimensions.

**Key fact**: 137 = 4^2 + 11^2 is the UNIQUE D_framework prime that combines defect and crystal dimensions. This makes it a "bridge prime" in CNH language. [CONJECTURE: the physical significance of this is alpha = 1/137.]

**Merges old Groups III (Primes) and IV (Lattices)**: Primes exist only inside lattices. The lattice Z[i] generates the norm that classifies the primes. These are one concept from two angles.

**Cross-references**:
- `foundations/prime_theory/` (prime classification)
- `core/axioms/AXM_0118_prime_attractor_selection.md` (CNH)
- `framework/investigations/alpha/tilt_matrix_alpha_derivation.md` (137 as bridge prime)

---

### Group IV: Endomorphism Spaces

**What they encode**: the space of all mappings between structures
**Primary filter**: close under iteration (composition) + survive automorphisms (conjugation-invariant)
**Mathematical class**: End(V), Hom(V,W), tensor products V tensor W*

| Object | Definition | Dimension | Properties |
|--------|-----------|-----------|------------|
| End(V_crystal) | V tensor V* | n_c^2 = 121 | Contains ALL structure information |
| End(V_defect) | H tensor H* | n_d^2 = 16 | = u(4) Lie algebra generators |
| Hom(R^4, R^7) | R^4 tensor R^7 | 28 | Tangent space of Gr(4,11); irreducible under SO(4)xSO(7) |
| Hom(R^7, R^4) | R^7 tensor R^4 | 28 | Cotangent space; dual to above |
| End(R^4) | R^4 tensor R^4 | 16 | SO(4) action; contains so(4) = 6 |
| End(R^7) | R^7 tensor R^7 | 49 | SO(7) action; contains so(7) = 21 |
| u(n_c) generators | — | 121 | Full unitary group on V_crystal |
| u(n_d) generators | — | 16 | Full unitary group on V_defect |
| so(11) Lie algebra | Skew-sym 11x11 | 55 | Full rotation generators |
| so(4) + so(7) | Block-diagonal | 6 + 21 = 27 | Isotropy Lie algebra |

**Facets (distinguished elements)**: A "facet" is a specific direction in an endomorphism space — an element of End(V) or Hom(V,W), not just the space itself. The pipeline (121 -> 12) works by examining individual facets: which directions in End(V_crystal) survive successive algebraic constraints. Generators of Lie algebras (so(11), su(2), su(3)) are specific facets of End(V). The distinction matters: Group IV contains both the *spaces* and their *distinguished elements*.

**Framework role**: This is where alpha lives. The total generator count n_d^2 + n_c^2 = 16 + 121 = 137 is the raw interface complexity [CONJECTURE: = 1/alpha]. The Grassmannian Gr(4,11) has tangent space Hom(R^4, R^7), which gives the 28 Goldstone modes. The pipeline 121 -> 55 -> 18 -> 12 filters End(V_crystal) through successive constraints.

**Key fact**: End(V) decomposes under SO(n_d) x SO(n_c) as:

```
End(R^11) = End(R^4) + Hom(R^4,R^7) + Hom(R^7,R^4) + End(R^7)
     121  =    16    +      28       +      28       +     49
```

This is NOT a choice — it follows from the V = V_pi + V_pi-perp decomposition (Group VIII) applied to End.

**Why this group is essential**: The [A-COUPLING] assumption lives here. The question "does the gauge coupling inherit the vacuum metric?" is precisely: does the Group II inner product (HS metric) on Group IV endomorphism space determine the Group V automorphism coupling? Without Group IV as a separate category, this question can't even be stated cleanly.

**Cross-references**:
- `framework/investigations/alpha/ALPHA_DERIVATION_MASTER.md` (137 = n_d^2 + n_c^2)
- `framework/investigations/gauge/democratic_bilinear_principle.md` (121 decomposition)
- `framework/investigations/gauge/perspective_transformative_pipeline.md` (121 -> 12 pipeline)

---

### Group V: Automorphisms & Symmetry Groups

**What they encode**: what is objective (coordinate-independent)
**Primary filter**: survive automorphisms (by definition) + close under iteration
**Mathematical class**: automorphism groups of algebras and spaces

| Object | Of What | Dimension | Properties |
|--------|---------|-----------|------------|
| {id} (trivial) | R | 0 | Only real automorphism |
| Z/2 (conjugation) | C | discrete | a+bi -> a-bi |
| SO(3) ~ SU(2)/Z_2 | Im_H | 3 | Rotations of imaginary quaternions |
| G_2 | O | 14 | Exceptional; smallest exceptional Lie group |
| SO(n_c) = SO(11) | V_crystal | 55 | Full rotation group of crystal |
| SO(n_d) x SO(n_c) = SO(4)xSO(7) | V_pi + V_pi-perp | 6 + 21 = 27 | Isotropy group at Grassmannian base point |
| SU(2) | H (left action) | 3 | Gauge group [Layer 2: weak force] |
| SU(3) | O (subgroup of G_2) | 8 | Gauge group [Layer 2: strong force] |
| U(1) | C (phase) | 1 | Gauge group [Layer 2: electromagnetism] |

**Framework role**: The SM gauge group U(1) x SU(2) x SU(3) with dimension 1+3+8 = 12 emerges from the pipeline: SO(11) has Lie algebra dimension 55; filter to adjoint irreps that survive the breaking SO(11) -> SO(4) x SO(7); the result is 12 = dim(u(1) x su(2) x su(3)). [DERIVED from CCP via pipeline, S251]

**Key fact**: G_2 is the automorphism group of O, not SO(7). This is because O is non-associative — the automorphism group must preserve the multiplication table, not just the norm. G_2 has dimension 14 = 2 x 7 (not 21 = dim(SO(7))). The "missing" 7 dimensions correspond to the 7 independent associator directions (Group VII). The G_2 moment map on Gr(4,11) has codimension 11 = n_c [THM_04B6], confirming the crystal dimension geometrically.

**Representations**: Groups act on spaces (Group IV objects). The representation is the *pairing* of a Group V symmetry with a Group IV space:

| Group | Representation | Space Acted On | Dimension | Framework Role |
|-------|---------------|----------------|-----------|---------------|
| SO(11) | Fundamental | R^11 = V_crystal | 11 | Crystal rotations |
| SO(11) | Adjoint | so(11) | 55 | Pipeline input |
| SO(4)xSO(7) | (fund, fund) | Hom(R^4,R^7) | 28 | Goldstone modes (irreducible!) |
| SU(3) | Fundamental | C^3 | 3 | Quarks [Layer 2] |
| SU(3) | Adjoint | su(3) | 8 | Gluons [Layer 2] |
| SO(11) | Spinorial | S_32 = 16+16' | 32 | Fermion embedding (MCHM4, S212) |
| G_2 | Fundamental | Im_O = R^7 | 7 | Branches as 7 -> 3+3bar+1 under SU(3) |

Representations are not a separate group — they are the *interface* between Group V (who acts) and Group IV (what is acted on). Branching rules (Group VIII) describe how representations decompose when the group shrinks.

**Cross-references**:
- `core/axioms/AXM_0120_completeness_principle.md` (CCP forces SO(11))
- `framework/investigations/gauge/gauge_from_division_algebras.md`
- `framework/investigations/gauge/perspective_transformative_pipeline.md` (55 -> 12 pipeline)

---

### Group VI: Projections & Idempotents

**What they encode**: viewpoints, observers, subsystem selection
**Primary filter**: close under iteration (e^2 = e is a fixed point of squaring)
**Mathematical class**: self-adjoint idempotent operators; orthogonal projections

| Object | Space | Rank | Properties |
|--------|-------|------|------------|
| pi: V -> V | V_crystal | n_d = 4 | THE framework primitive (AXM_0104) |
| 1 - pi | V_crystal | n_c - n_d = 7 | Complementary projection |
| Minimal idempotents | End(V) | 1 | Rank-1 projectors; "points" |
| Grassmannian point | Gr(k,n) | k | Each point IS a rank-k projection |

**Framework role**: Perspective IS projection. The single act pi^2 = pi, pi^dag = pi, im(pi) != V breaks the crystal's perfect symmetry (C4) and creates all subsequent structure. The Grassmannian Gr(4,11) is the space of all rank-4 projections — it IS the space of all possible perspectives.

**Key fact**: For dim(V) >= 2, projections are STRUCTURALLY INEVITABLE (THM_04AC). You cannot have a vector space of dimension >= 2 without rank-k projections existing for 1 <= k <= n-1. CCP forces dim = 11 >> 2, so perspective is forced, not assumed.

**Eigenstructure note**: The eigenvalues of a projection are exactly {0, 1}. The eigenspaces are V_pi (seen) and V_pi-perp (hidden). This is why old Group VIII (eigenstructures) partially collapses into Group VI — projection eigenstructure is just the visible/hidden decomposition.

**Cross-references**:
- `core/axioms/AXM_0104_partiality.md` (perspective = projection)
- `framework/layer_0_pure_axioms.md` (Theorem P.1)
- `core/theorems/THM_04AC_evaluation_partiality.md`

---

### Group VII: Commutators & Associators

**What they encode**: interaction, order-sensitivity, non-triviality of composition
**Primary filter**: survive automorphisms (the commutator/associator is a natural operation)
**Mathematical class**: [a,b] = ab - ba; (a,b,c) = (ab)c - a(bc)

| Object | Algebra | Dimension of Output | Properties |
|--------|---------|-------------------|------------|
| [a,b] in R | R | 0 | Always zero (commutative + associative) |
| [a,b] in C | C | 0 | Always zero (commutative + associative) |
| [a,b] in H | H | 3 = dim(Im_H) | Non-zero; spans Im_H; gives so(3) |
| [a,b] in O | O | 7 = dim(Im_O) | Non-zero; spans Im_O |
| (a,b,c) in R,C,H | — | 0 | Always zero (associative) |
| (a,b,c) in O | O | 7 | Non-zero; measures non-associativity |

**Framework role**: This group is the *interaction detector*. If all commutators vanish, nothing interacts — physics is trivial. The dimension of the commutator output space directly controls the gauge content:

- Im_H has dim 3: gives SU(2) generators [Layer 2: weak isospin]
- Im_O has dim 7: gives the 7 non-associative directions (of which SU(3) = 8 generators act on 7+1)

**Key fact**: The difference between dim(SO(7)) = 21 and dim(G_2) = 14 is exactly 7 = dim(Im_O). These 7 "missing" automorphisms are precisely the 7 independent associator directions. Non-associativity REMOVES symmetry — it does not add structure.

**Connection to [A-STRUCTURAL]**: The commutator + trace coupling structure (assumption B2 in the irreducible set) lives here. The question is whether the coupling form Tr([epsilon_i, epsilon_j]^2) is forced or chosen.

**Cross-references**:
- `core/17_complex_structure.md` (F=C from directed time -> antisymmetric structure)
- `framework/investigations/meta/associativity_derivation.md`
- `framework/investigations/gauge/gauge_from_division_algebras.md`

---

### Group VIII: Decompositions & Splittings

**What they encode**: how wholes separate into independent parts
**Primary filter**: survive automorphisms (canonical decompositions are coordinate-free)
**Mathematical class**: direct sums V = V_1 + V_2; group-theoretic branching rules; block decompositions

| Object | What Decomposes | Into What | Forced By |
|--------|----------------|-----------|-----------|
| V = V_pi + V_pi-perp | V_crystal | R^4 + R^7 | Perspective (Group VI) |
| SO(11) -> SO(4) x SO(7) | Symmetry group | Isotropy subgroup | Breaking pattern |
| End(R^11) -> 16+28+28+49 | Endomorphism space | Hom blocks | V = R^4 + R^7 |
| Im_C + Im_H + Im_O | V_crystal | Algebraic sectors | CCP-2 + CCP-3 |
| 121 -> 55 -> 18 -> 12 | End(V) generators | Pipeline stages | Adjoint irrep filtering |
| n_d^2 + n_c^2 = 137 | Generator count | Defect + crystal | [A-STRUCTURAL] independent sectors |
| 7 -> 3 + 3-bar + 1 | Im_O under SU(3) | Color decomposition | G_2 -> SU(3) branching |

**Framework role**: This is the most consequential group for the remaining assumptions. The alpha derivation requires n_d^2 + n_c^2 (independent addition, not (n_d + n_c)^2 = 225). The generation count requires Im_H tensor (7 -> 3 + 3-bar + 1). The pipeline requires successive decomposition of End(V).

**Branching rules (structured restriction maps)**: When a group G breaks to a subgroup H, each G-representation rho restricts to a direct sum of H-representations:

```
Res_H^G(rho) = direct sum of n_i * rho_i   (where rho_i are H-irreps)
```

This is NOT just arithmetic decomposition — it encodes *which* sub-representations appear and with what multiplicity. Key framework branching rules:

| Breaking | Rep | Branches To | Multiplicities | Source |
|----------|-----|------------|----------------|--------|
| G_2 -> SU(3) | 7 (fund) | 3 + 3bar + 1 | (1,1,1) | Octonionic structure |
| SO(11) -> SO(4)xSO(7) | 55 (adj) | (6,1) + (1,21) + (4,7) | 6+21+28=55 | Isotropy decomposition |
| SO(11) -> SO(4)xSO(7) | 11 (fund) | (4,1) + (1,7) | (1,1) | V = V_pi + V_pi-perp |
| SU(2) on R^4 | (2,2) | 2 + 2 | (1,1) | No singlets -> interface regime |
| SU(3) on R^7 | 1+3+3bar | 1 + 3 + 3bar | (1,1,1) | 1 singlet -> internal regime |

The **singlet criterion** (S222, [CONJECTURE]): 0 singlets in fundamental -> interface regime (N = coset dim); 1+ singlets -> internal regime (N = group dim). Root cause: H associative (no preferred direction) vs O non-associative (invariant direction forced).

**Key fact**: The V = V_pi + V_pi-perp decomposition is FORCED by perspective (Theorem P.1). But whether defect and crystal contribute INDEPENDENTLY to the generator count (n_d^2 + n_c^2 vs (n_d + n_c)^2 = n^2) is the [A-STRUCTURAL] assumption A3. The difference: 225 - 137 = 88 cross-terms. Are they present or absent?

**The A3 question in group language**: The alpha formula counts U(n_d) + U(n_c) generators. The independence assumption says: the defect's U(n_d) and crystal's U(n_c) are separate groups, not embedded in a common U(n_d + n_c). If they WERE embedded, the total would be (n_d + n_c)^2 = 225 (including 2 x 28 = 56 cross-term generators from Hom blocks). The question is whether the Hom(R^4,R^7) directions count toward the interface complexity or not.

**Cross-references**:
- `framework/layer_0_pure_axioms.md` (Theorem P.1: V = V_pi + V_pi-perp)
- `core/axioms/AXM_0120_completeness_principle.md` (CCP-3: direct sum of Im(D_k))
- `framework/investigations/alpha/ALPHA_DERIVATION_MASTER.md` (Step 5: independent sectors)
- `framework/investigations/gauge/perspective_transformative_pipeline.md` (121 -> 12)

---

### Group IX: Construction Sequences

**What they encode**: how structure builds from simpler to more complex
**Primary filter**: close under iteration (each step generates the input for the next)
**Mathematical class**: recursive constructions; functorial chains; doubling procedures

| Sequence | Steps | What Changes | What's Preserved |
|----------|-------|-------------|-----------------|
| Cayley-Dickson | R -> C -> H -> O -> S | Dimension doubles; property lost | Norm (until S) |
| CCP cascade | Im_C -> Im_H -> Im_O | New algebraic directions added | Division property |
| Pipeline | 121 -> 55 -> 18 -> 12 | Generators filtered | Adjoint irreducibility |
| Gap tower | O(7) -> SU(3) -> SU(2) -> U(1) | Symmetry reduced | Algebraic closure at each level |
| Breaking chain | SO(11) -> SO(4)xSO(7) -> ... | Symmetry broken | Subgroup structure |
| Perspective seed | Im_C -> perspective -> time -> physics | Complexity grows | CCP consistency |

**Framework role**: The Cayley-Dickson sequence is the generative backbone of the framework. CCP walks this chain to force dim = 11, F = C, n_d = 4. Each step trades algebraic virtue for dimensional richness:

```
R(1)   -> C(2)   -> H(4)   -> O(8)   -> S(16)
         loses      loses      loses      loses
         ordering   commut.    assoc.     DIVISION
```

The chain MUST STOP at O because sedenions (S) violate the division property (Group X: boundaries). This is not a choice — it is the CCP consistency constraint enforced.

**Key fact**: The construction sequences are DIRECTED — they go from less complex to more complex. This directionality is structural, not temporal. CCP selects the maximal endpoint of each chain, then perspectives restrict downward. Construction goes up; observation goes down. This asymmetry is fundamental.

**Cross-references**:
- `core/axioms/AXM_0120_completeness_principle.md` (CCP walks Cayley-Dickson)
- `core/theorems/THM_04B0_recursive_gap_tower.md` (gap tower)
- `core/theorems/THM_04B2_perspective_from_seed.md` (Im_C as seed)
- `framework/investigations/gauge/perspective_transformative_pipeline.md` (pipeline)

---

### Group X: Boundaries & Obstructions

**What they encode**: where consistency fails; the limits of structure
**Primary filter**: persist under perturbation (boundaries are topologically stable)
**Mathematical class**: zero divisors; obstruction classes; impossibility theorems

| Boundary | Where | What Fails | Consequence |
|----------|-------|-----------|-------------|
| Sedenion zero divisors | S(16) | ab = 0 with a,b != 0 | Division fails; CCP stops here |
| Hurwitz theorem | dim > 8 | No normed division algebras | Only R, C, H, O exist |
| Frobenius theorem | dim > 4 | No associative division algebras | Only R, C, H for transitions |
| Adams theorem | S^n | Only S^0,1,3,7 parallelizable | Only division algebra spheres |
| Wedderburn (finite) | Finite division rings | Must be commutative | No finite non-abelian division algebras |
| Degenerate norms | Singular inner products | Measure = 0 regions | Horizons, singularities [Layer 2] |

**Framework role**: Boundaries are where CCP draws the line. The entire framework is defined by where consistency ENDS:

- O is the last division algebra -> V_crystal has exactly 4 algebras to draw from
- H is the last associative division algebra -> transitions are quaternionic (dim 4)
- C is the last commutative field -> F = C

**Key fact**: Every impossibility theorem is simultaneously a UNIQUENESS theorem. "There are no normed division algebras beyond O" equivalently says "R, C, H, O are the COMPLETE list." The framework exploits impossibility as exhaustive classification.

**Connection to quartic potential**: The Mexican hat potential (CONJ-B1, fully resolved S259+S285) is related to boundaries. The quartic is the leading-order invariant potential that has both an unstable maximum and a stable minimum. The bifurcation / boundary connection is now proven: degree 4 is the minimum for bounded SSB (necessity), Z₂ eliminates cubic via FFT on Hom(R^4,R^7) (S285), and Thom structural stability ensures the quartic is universal (cusp catastrophe unfolding). See CONJ-B1 section below.

**Cross-references**:
- `core/axioms/AXM_0120_completeness_principle.md` (CCP uses Hurwitz boundary)
- `framework/investigations/meta/recursive_gap_tower.md` (terminal obstructions)
- `framework/investigations/spacetime/dimension_emergence.md` (Frobenius for n_d)

---

## Derived Structures

These are composite objects built from multiple groups. They are not primitive "atoms" but are central to the framework's derivation chains. Including them here avoids the need for additional groups.

### Grassmannian Gr(4,11) — The Vacuum Manifold

**Built from**: Group VI (projections) + Group IV (tangent space) + Group II (metric) + Group V (isotropy)

```
Gr(4,11) = {pi in M_11(C) : pi^2 = pi, pi^dag = pi, rank(pi) = 4}
         = SO(11) / (SO(4) x SO(7))
```

| Aspect | Group | Object | Dimension |
|--------|-------|--------|-----------|
| Points of Gr | VI | Rank-4 projections | 28 (real manifold dim) |
| Tangent space at base | IV | Hom(R^4, R^7) | 28 |
| Riemannian metric | II | HS metric restricted via Schur | Unique (up to scale) |
| Isotropy group | V | SO(4) x SO(7) | 27 |
| Full isometry group | V | SO(11) | 55 |
| Goldstone modes | IV | Directions in tangent space | 28 |
| G_2 moment map | II+V | mu: Gr(4,11) -> g_2* | 14 constraints (rank 11) |
| mu^{-1}(0) locus | V+VI | G_2-balanced perspectives | 17 |
| Codimension of mu^{-1}(0) | — | Crystal constraints on perspectives | 11 = n_c |
| Symplectic reduction | II+V | mu^{-1}(0)/G_2 | 3 = Im_H |

**Why it matters**: Gr(4,11) IS the space of all possible perspectives. The G_2 moment map decomposes it as 28 = 17 (associative) + 11 (crystal), with the codimension equaling n_c [THM_04B6]. Symplectic reduction gives dim = 3 = Im_H, providing a geometric derivation of spatial dimensions independent of the algebraic route. Every point is a perspective. The tangent space at any point gives the Goldstone modes of symmetry breaking. The metric on this manifold (Group II) determines the gauge coupling (the [A-PHYSICAL] assumption A1). The entire Weinberg angle derivation takes place on this manifold.

### Coset Space SO(11)/SO(4)xSO(7)

The Grassmannian IS the coset space. More generally, coset spaces G/H arise whenever a Group V symmetry G breaks to a subgroup H. The coset parametrizes the inequivalent broken directions. Its dimension = dim(G) - dim(H) = 55 - 27 = 28.

### Vacuum Manifold / Order Parameter Space

In the crystallization picture (AXM_0117), the order parameter epsilon lives in the space of symmetric traceless matrices on V_crystal. The vacuum manifold is the set of epsilon values that minimize the potential. For the Mexican hat potential, this is a sphere S^(n-1) in tilt-magnitude space, with the angular directions parametrized by Gr(4,11).

### Sigma Model on Gr(4,11)

The low-energy dynamics of Goldstone modes is described by a nonlinear sigma model with target space Gr(4,11). The sigma model metric IS the HS metric (Group II). If I-STRUCT-5 holds, the gauge kinetic term is induced from this sigma model — making the gauge coupling a GEOMETRIC quantity, not a free parameter.

---

## Beyond the Table: What the Algebraic Framework Does NOT Cover

The 10 groups classify *static algebraic structures*. Several important objects in the derivation chains are inherently non-algebraic:

### Dynamics & Flows (needed for A1, B1, B3)

| Object | What It Is | Where It Appears | Why It's Outside |
|--------|-----------|-----------------|-----------------|
| RG flow | beta(g) = dg/d(ln mu) | Alpha mechanism S160; RG matching S228 | Time-dependent; requires quantization |
| Crystallization dynamics | d(epsilon)/dt from AXM_0117 | SO(11) breaking selection | Requires action principle beyond algebra |
| Perturbative stability | Small deviations decay or grow | Pipeline stability; B3 assumption | Requires dynamics, not just structure |
| Gradient flow | d(phi)/dt = -dV/d(phi) | Energy minimization; B3 assumption | Reduces dynamics to algebra IF V is algebraic |

**Connection to assumptions**: B3 (lower energy = preferred) IS a dynamical claim. If gradient flow can be derived from iterated quaternionic transitions (Group I + Group IX), then B3 becomes algebraic. This is a precise research question.

### Quantum Structures (needed for A2)

| Object | What It Is | Where It Appears | Why It's Outside |
|--------|-----------|-----------------|-----------------|
| Born rule | P = |psi|^2 | Alpha mechanism 5D; THM_04A2 | Meta-principle connecting algebra to probability |
| Hilbert space | Complex inner product space | Quantum mechanics foundation | IS a Group II object, but interpretation is physical |
| Density matrix | rho = |psi><psi| | Measurement; observer structure | Group VI (projection) but with probability |

**Connection to assumptions**: A2 (interface = 1/alpha) requires bridging the generator count (Group IV, purely algebraic) to the electromagnetic coupling (physical, measurable). The Born rule is one proposed bridge (S232: alpha = 1/N_I as branching fraction).

### Number Theory (needed for CNH, AXM_0118)

| Object | What It Is | Where It Appears | Why It's Outside |
|--------|-----------|-----------------|-----------------|
| Quadratic residues | a^2 mod p | Gaussian norm classification | Arithmetic, not algebraic structure |
| Fermat's theorem | p = a^2+b^2 iff p = 1 mod 4 | CNH: which D_fw elements are norms | Number theory import [I-MATH] |
| Cyclotomic polynomials | Phi_n(x) | Alpha correction Phi_6(11) = 111 | Number theory; appearance in framework is derived |

**Connection to framework**: These are [I-MATH] imports, not framework-generated objects. They become relevant only after D_framework = {1,2,3,4,7,8,11} is forced by CCP. The Gaussian norm partition (norms vs non-norms) is a theorem applied to a derived set.

---

## Cross-Group Interaction Map

The groups do not act in isolation. The framework's derivation chains involve specific group interactions:

```
         I (Units)
         |
         v
   II (Norms) <----------> III (Irreducibles)
         |                       |
         v                       v
  IV (Endomorphisms) <---> VIII (Decompositions)
         |                       |
         v                       v
   V (Automorphisms)       IX (Sequences)
         |                       |
         v                       v
  VI (Projections)         X (Boundaries)
         |
         v
 VII (Commutators)
```

**Key causal chains**:

1. **Alpha chain**: VI (projection) -> VIII (decomposition V=4+7) -> IV (End splits into Hom blocks) -> II (Killing form counts generators) -> [A3: independent sectors] -> 137
2. **Gauge chain**: IX (Cayley-Dickson) -> X (Hurwitz stops at O) -> V (SO(11) forced) -> VIII (breaking to SO(4)xSO(7)) -> IV (pipeline filters End) -> 12 generators
3. **CNH chain**: IX (CCP cascade) -> III (D_fw primes in Z[i]) -> II (Gaussian norm classifies) -> III (split vs inert primes)
4. **Weinberg chain**: VI (projection) -> IV (Hom(R^4,R^7) = 28 dims) -> II (HS metric, Schur) -> V (SU(2) gets 28, SU(3) gets 8) -> [A1: coupling = metric] -> sin^2 = 28/121

---

## Application to Irreducible Assumptions

Each assumption below is stated as a precise conjecture. If the conjecture can be proven, the corresponding assumption is eliminated.

### A1: Gauge coupling inherits vacuum metric [A-PHYSICAL]

**Groups involved**: II -> IV -> V (with IX dynamics and X boundary)
**The question**: Does the HS metric (Group II) on End(V) (Group IV) uniquely determine the gauge coupling (Group V)?

**What's proven**:
- Schur's lemma: HS metric on Hom(R^4,R^7) is the unique SO(4)xSO(7)-invariant metric -> democratic weighting [DERIVATION, S224]
- Weinberg sum rules: IF spectral convergence holds, THEN 1/g^2(tree) = sigma model metric = democratic count [I-QFT + C3, S238]
- Full compositeness: no elementary gauge fields in axiom set [DERIVED from AXM_0109-0117]
- **Spectral convergence from finiteness**: C5 (|Pi| finite) + IRA-10 (perspectives = QM) -> finite Hilbert space -> spectral function is finite sum of delta functions -> all spectral integrals converge [DERIVATION, S292]

**Precise conjecture (RESOLVED S292)**:

> **CONJ-A1 (Spectral Convergence)** [RESOLVED]: For the SO(11)-invariant quartic potential (AXM_0117) spontaneously broken to SO(4)xSO(7), the spectral function rho(s) of the vacuum polarization tensor satisfies: (a) integral(rho(s) ds) < infinity, and (b) integral(s * rho(s) ds) < infinity.

**Resolution (S292)**: CONJ-A1 CANNOT be proven from AXM_0117 (quartic potential) alone — the dim-2 condensate <eps^T eps> in the V-A OPE gives rho ~ 1/s, making WSR1 logarithmically divergent. However, CONJ-A1 IS proven from C5 (finiteness) + IRA-10 (perspectives = quantum states): the finite Hilbert space gives a discrete spectral function with compact support, making all integrals convergent. IRA-02 (democratic gauge coupling) is therefore REDUNDANT — it follows from IRA-06 + IRA-08 + IRA-10 + C5 + I-QFT + Schur's lemma (S224). IRA count: 9 -> 8.

**Caveats**: Requires strong reading of IRA-10 (finite Hilbert space). Low-energy dominance uses SO(11) symmetry of UV spectrum (from axioms via IRA-06/08). Verification: `spectral_convergence_conj_a1.py` (24/24 PASS).

---

### A2: Interface = 1/alpha — PARTIALLY RESOLVED (S297)

**Groups involved**: IV -> II -> (physics bridge)
**The question**: Why does the generator count n_d^2 + n_c^2 = 137 equal 1/alpha?

**Status**: **PARTIALLY RESOLVED S297** — upgraded from [CONJECTURE] to [A-STRUCTURAL within I-STRUCT-5]

**What's proven**:
- The number 137 is derived from axioms + CCP [DERIVED]
- WSR + Schur's lemma gives 1/g_i^2 = kappa * N_i for all gauge factors [DERIVED S292]
- kappa = 1 corresponds to the standard (unnormalized) Hilbert-Schmidt inner product <A,B> = Tr(A^dag B) [STANDARD MATH]
- DE-009 does NOT block the WSR/HS approach (only blocks Sub-problem B: photon ID) [S297, 12/12 PASS]
- Sigma model: sum(Q^2)_coset = 14 (scalars), S_EM = 126 (generators). Factor 9 gap. C = 24/11 consistent [S297, 12/12 PASS]
- EQ-002/EQ-003 duality: kappa = 1 gives BOTH alpha = 1/137 AND Omega_m = 63/200 [S297, 10/10 PASS]
- Only kappa = 1 matches observation; alternatives (1/n_c, 1/4pi, 1/n_d, 2/pi) off by >10%

**Classification**: kappa = 1 is [A-STRUCTURAL within I-STRUCT-5]: the standard Tr convention applied to the democratic bilinear principle. This is a Layer 2 identification (math convention -> physics), not a free parameter (duality gives two predictions from one parameter).

**Irreducible content**: "Use the standard (unnormalized) HS inner product, not the normalized Tr/n version."

**Verification**: `conj_a2_de009_scope.py` (12/12), `conj_a2_sigma_model_coefficient.py` (12/12), `conj_a2_normalization_principle.py` (10/10)

---

### A3: Independent sector addition — PROVEN (S258)

**Groups involved**: VI -> VIII -> IV -> V
**The question**: Are U(n_d) and U(n_c) independent groups with total generators n_d^2 + n_c^2, or do they embed in U(n_d + n_c) with generators (n_d + n_c)^2?

**Status**: **RESOLVED** — CONJ-A3 proven via Radon-Hurwitz composition algebra theory (S258). The [A-STRUCTURAL] assumption is eliminated.

**What's proven**:
- V = V_pi + V_pi-perp is forced [THEOREM, P.1]
- End(V) decomposes into 4 Hom blocks [THEOREM, linear algebra]
- The cross-term blocks Hom(R^4,R^7) contain the Goldstone modes (physical)
- **CONJ-A3 [THEOREM, S258]**: No norm-preserving cross-multiplication R^4 x R^7 -> R^7 exists. Three independent proofs:
  1. **Determinant obstruction**: det(-I_7) = (-1)^7 = -1 < 0, but det(A^2) = det(A)^2 >= 0. So no 7x7 real A has A^2 = -I. No complex structure on R^7.
  2. **Radon-Hurwitz**: rho(7) = 1 < 4 = dim(H). A [4,7,7]-composition requires 4 <= rho(7), which fails. Not even a [2,7,7] exists.
  3. **Norm extension**: Cross-term g: R^4 x R^7 -> R^7 with |g(a,v)| = |a||v| IS a [4,7,7]-composition, which doesn't exist. Therefore g = 0.

**Root cause**: n_c - n_d = 11 - 4 = 7 = dim(Im_O) is **odd**. Odd dimensions cannot carry complex structure, blocking all norm-preserving cross-multiplications. The oddness of 7 is itself derived from CCP (Im_O = O minus its real part = 8-1 = 7).

**Derivation chain**:
```
CCP [A-AXIOM] -> n_c = 11, n_d = 4 [DERIVED]
-> complement = 7 [DERIVED]
-> 7 odd [ARITHMETIC]
-> no complex structure on R^7 [I-MATH: det argument]
-> rho(7) = 1 [I-MATH: Radon-Hurwitz]
-> no [4,7,7]-composition [I-MATH]
-> cross-terms vanish [DERIVED]
-> independent sectors [DERIVED]
-> n_d^2 + n_c^2 = 137 [DERIVED]
```

**Bonus**: Composition algebra dimensions {1,2,4,8} = Gaussian norms from CNH. Non-composition dimensions {3,7,11} = CNH non-norms. The Hurwitz theorem and CNH classification are the **same** structure seen from different angles.

**Verification**: `verification/sympy/conj_a3_algebraic_incompatibility.py` (27/27 PASS)

**Former status**: [A-STRUCTURAL] Step 5 -> **[DERIVED from CCP + Radon-Hurwitz]**

---

### B1: Mexican hat potential — FULLY RESOLVED (S259+S285)

**Groups involved**: V -> X -> IV (tangent space geometry)
**The question**: Is the quartic Landau form forced, or is it a choice?

**Status**: **FULLY RESOLVED** — [THEOREM with I-MATH: FFT for orthogonal groups]

**What's proven (S259+S285)**:
- **Z₂ symmetry [THEOREM, S285]**: The tilt epsilon lives in Hom(R^4, R^7) (tangent space of Gr(4,11)), NOT in Sym_0(R^11). By the First Fundamental Theorem (FFT) for orthogonal groups [I-MATH: Weyl, Procesi], SO(4)xSO(7) invariants on M(4,7) are generated by entries of epsilon^T * epsilon (a 4x4 symmetric matrix). Since epsilon^T * epsilon = (-epsilon)^T * (-epsilon), ALL invariant polynomials are even-degree in epsilon. No cubic term can exist. This resolves the Z_2 gap: it is NOT a symmetry of SO(11) (since -I not in SO(11) for n=11 odd), but it IS automatic from the rectangular matrix structure of the tangent space.
- **Key insight**: The earlier script `conj_b1_invariant_ring.py` used the EMBEDDED representation in Sym_0(R^11) where Tr(epsilon^3) CAN be nonzero. The INTRINSIC representation Hom(R^4, R^7) has no cubic invariant — you can't even define epsilon^3 for a 4x7 matrix.
- **Necessity [THEOREM, S259]**: Degree < 4 cannot produce bounded SSB. Degree 4 is the MINIMUM.
- **Sufficiency [THEOREM, S132/S259]**: At quartic order, the (4,7) breaking pattern is uniquely selected (quartic ratio 37/308 < 49/264).
- **Structural stability [I-MATH, S259]**: Quartic critical points are non-degenerate (Morse/Thom). Higher-order terms are qualitative perturbations only.
- **QFT support [DERIVATION, S259]**: CCP -> n_d=4 -> 4D -> quartic marginal -> higher-order irrelevant.

**Derivation chain**:
```
CCP [AXIOM] -> crystallization on Gr(4,11) [DERIVED]
  -> tilt eps in Hom(R^4, R^7) [DERIVED from Grassmannian geometry]
  -> SO(4)xSO(7) invariance [DERIVED]
  -> FFT: invariants = f(eps^T eps) [I-MATH: Weyl, Procesi]
  -> eps^T eps = (-eps)^T (-eps) [ARITHMETIC]
  -> V(eps) even -> no cubic [THEOREM]
  -> quartic is lowest non-trivial order [S259: THEOREM]
```

**Former status**: [A-STRUCTURAL] (S256) -> [DERIVATION with imports] (S259) -> **[THEOREM with I-MATH]** (S285)

**Verification**: `verification/sympy/conj_b1_z2_rectangular_matrix.py` (10/10 PASS), `verification/sympy/conj_b1_invariant_ring.py` (6/6 PASS), `verification/sympy/conj_b1_quartic_truncation.py` (20/20 PASS)

---

### B3: Lower energy = preferred breaking — FULLY RESOLVED (S258+S259)

**Groups involved**: IX -> VIII -> V (simplicity)
**The question**: Does the system go to the energy minimum, and why?

**Status**: **RESOLVED** — B3 fully eliminated. Gradient flow convergence proven (S258) + ergodic sampling proven via normal closure theorem (S259).

**What's proven (S258+S259)**:
- Gradient flow of quartic V converges to a minimum [THEOREM, Lyapunov, S258]
- V is a Lyapunov function: dV/dt = -(dV/dr)² ≤ 0 [THEOREM, S258]
- Shape parameter σ bounded + monotone -> convergence guaranteed [THEOREM, S258]
- Generic perspective on Gr(4,11) gives (4,7) breaking [THEOREM, S258]
- **Ergodic sampling [THEOREM, S259]**: so(11) is simple (B_5). Center(SO(11)) = {I} (11 odd). Normal closure of SU(2) in SO(11) = SO(11). Therefore iterated quaternionic transitions from different perspectives generate the full SO(11) action, which is transitive on Gr(4,11).
- **Important subtlety**: Global V_min is at (5,6), NOT (4,7). But CCP forces n_d = 4, so (4,7) is the algebraically compatible minimum.
- **Combined mechanism**: Stochastic gradient descent on V over Gr(4,11). Ergodicity ensures all of Gr(4,11) is sampled; gradient flow pushes toward lower V; CCP constrains to (4,7).

**Resolved conjecture (derivation chain)**:
```
CCP [A-AXIOM] -> n_c=11, n_d=4 [DERIVED]
-> transitions quaternionic (SU(2)) [DERIVED: Frobenius + CCP]
-> so(11) simple [I-MATH: B_5 classification]
-> center trivial [I-MATH: 11 odd, det(-I)=-1]
-> normal closure of SU(2) in SO(11) = SO(11) [I-MATH: simplicity]
-> ergodic on Gr(4,11) [DERIVED]
+ quartic V is Lyapunov function [THEOREM, S258]
-> energy minimization [DERIVED]
-> B3 ELIMINATED [THEOREM]
```

**Verification**: `verification/sympy/conj_b3_algebraic_dynamics.py` (12/12 PASS), `verification/sympy/conj_b3_ergodicity_proof.py` (10/10 groups PASS)

**Former status**: [A-PHYSICAL] -> [CONJECTURE with structural support] (S258) -> **[DERIVED]** (S259)

---

## Outputs (Not Separate Groups)

These are derived quantities that result from group interactions, not independent atomic objects:

| Output | Groups Involved | Formula | Status |
|--------|----------------|---------|--------|
| Dimensionless ratios | IV / IV, or II / II | sin^2 = 28/121, xi = 4/121 | Derived from group ratios |
| Eigenvalues of operators | V acting on IV or VI | Casimir values, branching multiplicities | Derived from representation theory |
| Fixed points of dynamics | IX iterated with X constraints | Vacuum state, equilibrium | Derived from iteration + boundary |
| Physical constants [Layer 2] | Various -> identification | alpha, theta_W, masses | Require [A-PHYSICAL] bridge |

---

## Selection Filter Audit

How each group scores on the four selection criteria:

| Group | Survives Auts | Norm/Measure | Closes Under Iter | Stable Under Perturb |
|-------|:---:|:---:|:---:|:---:|
| I (Units) | Yes (conjugation-invariant) | Yes (norm = 1) | Yes (group closure) | Yes (compact) |
| II (Norms) | Yes (quadratic forms are invariant) | Yes (by definition) | Yes (norm of product = product of norms) | Yes (continuous) |
| III (Irreducibles) | Partially (Gaussian primes depend on Z[i]) | Participates (norm classifies) | No (prime x prime != prime) | Yes (discrete = robust) |
| IV (Endomorphisms) | Yes (End(V) is functorial) | Yes (HS norm) | Yes (composition) | Yes (finite-dim = continuous) |
| V (Automorphisms) | Yes (by definition) | Yes (preserve norm) | Yes (group closure) | Yes (Lie groups are stable) |
| VI (Projections) | Partially (specific pi changes under conjugation) | Partially (rank is preserved) | Yes (e^2 = e is fixed point) | Partially (nearby matrices may not be projections) |
| VII (Commutators) | Yes ([a,b] is natural) | Participates (Killing form uses [,]) | No ([a,[b,c]] needs Jacobi) | Yes (structure constants are discrete) |
| VIII (Decompositions) | Yes (canonical decompositions are invariant) | Participates (orthogonal decompositions use norm) | Partially (iterated decomposition = refinement) | Yes (rank conditions are open) |
| IX (Sequences) | Yes (Cayley-Dickson is canonical) | Partially (norm preserved until boundary) | Yes (doubling is iterable) | N/A (discrete sequence) |
| X (Boundaries) | Yes (impossibility is absolute) | Participates (norm failure = boundary) | Yes (beyond boundary stays beyond) | Yes (topological) |

**Conclusion**: No group scores a perfect 4/4, and the criteria are not uniformly applicable. The table is organized by STRUCTURAL ROLE rather than by uniform filter compliance. The four criteria serve as a GUIDE for what counts as meaning-carrying, not as a strict sieve.

---

## Version History

- v1.0 (S256): Initial creation. 10 groups. Adopted from user's 11-group proposal with restructuring: merged old III+IV into new III (Irreducibles & Lattices), merged old X+XI into new X (Boundaries & Obstructions), promoted ratios/eigenstructures from groups to outputs, added new groups IV (Endomorphisms), VIII (Decompositions), IX (Construction Sequences).
- v2.0 (S256): Refinement pass. Added: Quick Reference Card, Casimir/Dynkin/spectral objects to Group II, facets and Lie algebras to Group IV, representations sub-table in Group V, structured branching rules in Group VIII, Derived Structures section (Grassmannian, coset spaces, vacuum manifold, sigma model), Beyond the Table section (dynamics, quantum structures, number theory). Sharpened all 5 attack vectors into precise conjecture statements (CONJ-A1 through CONJ-B3). Verified coverage against 54 objects from alpha/Weinberg/pipeline/CCP derivation chains.
- v2.1 (S258): **CONJ-A3 PROVEN** — algebraic incompatibility forces independent sectors via Radon-Hurwitz theorem (27/27 PASS). Step 5 [A-STRUCTURAL] -> [DERIVED]. **CONJ-B3 PARTIALLY RESOLVED** — gradient flow convergence proven, B3 reduced from [A-PHYSICAL] to [CONJECTURE with structural support] (12/12 PASS). Root cause of A3: complement dim 7 is odd -> no complex structure -> no norm-preserving cross-multiplication. Bonus: Hurwitz dims {1,2,4,8} = CNH Gaussian norms.
- v2.2 (S259): **CONJ-B3 FULLY RESOLVED** — ergodic sampling proven via normal closure theorem. so(11) simple + center trivial -> normal closure of SU(2) = SO(11) -> iterated transitions generate full action on Gr(4,11). Combined with gradient flow convergence (S258), B3 fully eliminated: [A-PHYSICAL] -> [DERIVED]. Alpha derivation chain updated to 0+1 (CONJ-A3 integration). 10/10 test groups PASS.
- v2.3 (S285): **CONJ-B1 FULLY RESOLVED** — Z₂ symmetry proven via First Fundamental Theorem (FFT) for orthogonal groups on rectangular matrices. Tilt in Hom(R^4,R^7) forces all invariants even-degree. Combined with S259 (necessity + sufficiency + Thom), quartic potential is [THEOREM with I-MATH]. IRA-03 eliminated. IRA count 10 -> 9. 10/10 PASS.
- v2.4 (S292): **CONJ-A1 RESOLVED** — Spectral convergence proven from C5 (finiteness) + IRA-10 (perspectives = QM). Finite Hilbert space -> discrete spectral function -> all integrals converge. NEGATIVE: quartic potential alone insufficient (dim-2 condensate in V-A OPE). POSITIVE: finiteness provides UV completion. IRA-02 eliminated (redundant). IRA count 9 -> 8. 24/24 PASS.
- v2.5 (S297): **CONJ-A2 PARTIALLY RESOLVED** — Step 15 (interface = 1/alpha) upgraded from [CONJECTURE] to [A-STRUCTURAL within I-STRUCT-5]. kappa=1 = standard Tr convention for HS metric. DE-009 doesn't block WSR/HS approach. Sigma model: sum(Q^2)=14 (not 137), factor-9 gap. EQ-002/EQ-003 duality: one parameter -> alpha + Omega_m. 34/34 PASS (3 scripts). Alpha chain: 0 axioms + 1 structural + 0 conjectures.
