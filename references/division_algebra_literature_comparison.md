# Division Algebras and Standard Model: Literature Comparison

**Created**: 2026-01-27 (Session 57)
**Purpose**: Compare our framework to major division algebra approaches in physics
**Status**: RESEARCH DOCUMENT

---

## Executive Summary

**The Question**: How does our framework compare to existing work connecting division algebras to the Standard Model?

**Key Finding**: All major approaches share the same structural gap — they assume division algebras are fundamental rather than deriving why they must arise. Our Session 54 resolution ("can't see subset of zero") and Session 55 stability analysis (division algebras as stable imperfection patterns) may be novel contributions.

**Researchers Compared**:
- Cohl Furey (Cambridge/Humboldt)
- John Baez (UC Riverside)
- Geoffrey Dixon (Brandeis)
- Carlos Castro Perelman (Quantum Gravity Research)

---

## Part I: What Each Researcher Does

### 1.1 Cohl Furey

**Core Approach**: Uses the "Dixon algebra" T = R⊗C⊗H⊗O (64-dimensional) to construct Standard Model representations.

**Key Results**:
- From C⊗O: Finds minimal left ideals mirroring one generation of quarks and leptons
- SU(3) × SU(2) × U(1) emerges as automorphisms of the algebraic structure
- Electric charge quantization explained ("because whole numbers are")
- All 48 electric charges for three generations found in Cℓ(6)

**Unique Feature**: "No matrices or column vectors" — particles and transformations both come from the algebra itself.

**What She Derives**:
- Gauge group structure (SU(3) × SU(2) × U(1)) for one generation
- Correct electric charges
- Chiral structure

**What She Assumes**:
- That R⊗C⊗H⊗O is the relevant structure
- No derivation of WHY division algebras

**Gaps Acknowledged**:
- Three generations not fully derived (some progress with Cl(8) in recent work)
- Dynamics (scattering, decay) not addressed
- Gravity not included

**Sources**:
- [Standard Model Physics from an Algebra (PhD thesis)](https://arxiv.org/abs/1611.09182)
- [Quanta Magazine profile](https://www.quantamagazine.org/the-octonion-math-that-could-underpin-physics-20180720/)
- [Furey's website](https://www.furey.space/)

---

### 1.2 John Baez

**Core Approach**: Survey and synthesis of octonion-SM connections; emphasizes 10D spacetime splitting.

**Key Results**:
- "A lepton and a quark fit together into an octonion" (as SU(3) representations)
- Aut(O) fixing imaginary octonion = SU(3) exactly
- Dubois-Violette/Todorov construction: SM gauge group from exceptional Jordan algebra (3×3 octonionic matrices)
- 10D → 4+6 splitting connects to SM fermion representations

**His Stance**: Cautiously optimistic. "There are some tantalizing facts here and there" but he's "not extremely optimistic."

**What He Derives** (or surveys):
- Group-theoretic connections (SU(3) as octonion automorphisms)
- Why 10D appears in multiple approaches

**What He Assumes**:
- Octonions are relevant (doesn't derive this)
- The splitting 10 → 4+6 (motivated but not proven necessary)

**Key Insight**: "40 years trying to go beyond the Standard Model hasn't yet led to clear success. As an alternative, we could try to understand why the Standard Model is the way it is."

**Sources**:
- [Can We Understand the Standard Model Using Octonions?](https://math.ucr.edu/home/baez/standard/)
- [The Octonions (Bull. AMS 2002)](https://arxiv.org/abs/math/0105155)
- [Octonions and the Standard Model blog series](https://johncarlosbaez.wordpress.com/2020/11/13/octonions-and-the-standard-model/)

---

### 1.3 Geoffrey Dixon

**Core Approach**: T = C⊗H⊗O as fundamental, connecting to 10D spacetime.

**Key Results**:
- U(1) × SU(2) × SU(3) from division algebra structure
- Connection to 10-dimensional spacetime
- Extended to 26D and three families in later work

**His Book** (1994): "Division Algebras: Octonions, Quaternions, Complex Numbers and the Algebraic Design of Physics"
- Demonstrates "intimate connection" between division algebras and SM
- Emphasizes algebraic design over geometric

**What He Derives**:
- Gauge group structure
- 10D spacetime connection
- Some particle representations

**What He Assumes**:
- T = C⊗H⊗O is fundamental
- No derivation of why these specific algebras

**Sources**:
- [Division Algebras (Springer, 1994)](https://link.springer.com/book/10.1007/978-1-4757-2315-1)
- [Division Algebras, Lattices, Physics (2011)](https://arxiv.org/abs/1407.4818)

---

### 1.4 Carlos Castro Perelman

**Core Approach**: R⊗C⊗H⊗O-valued gravity as grand unification.

**Key Results**:
- Combines Einstein gravity with SM gauge theory
- [SU(4)]⁴ symmetry emerges
- Clifford space gauge theories
- Ternary octonionic gauge field theories

**Unique Feature**: Attempts explicit unification of gravity with SM.

**What He Derives**:
- Connection between Clifford algebras and SM group
- U(4)×U(4) grand unification from complex Clifford algebra

**What He Assumes**:
- Division algebra structure is fundamental
- Specific Clifford space framework

**Sources**:
- [R⊗C⊗H⊗O-Valued Gravity (Adv. Appl. Clifford Algebras, 2019)](https://link.springer.com/article/10.1007/s00006-019-0937-4)
- [Academia.edu profile](https://independent.academia.edu/CarlosCastroPerelman)

---

## Part II: The Common Gap

### 2.1 Everyone Assumes Division Algebras

**The Pattern**: All four researchers START with division algebras and DERIVE Standard Model features. None DERIVES why division algebras must be fundamental.

| Researcher | Starting Point | What's Derived |
|------------|---------------|----------------|
| Furey | R⊗C⊗H⊗O | Gauge groups, charges |
| Baez | Octonions + 10D | Group structure |
| Dixon | C⊗H⊗O | Gauge groups, 10D |
| Castro | R⊗C⊗H⊗O Clifford | Unification |

### 2.2 Criticisms in Literature

From Physics Forums discussions:

> "Right now it's more of a mere coincidence that the division algebras correlated to particles. We need some principle to require the division algebras first, then the particles can be considered inevitable."

> "The reason her work seems like numerology is because it does not seem to be justified on more basic grounds."

> "Division algebras are very frequent in mainstream research, it is just that they are not a good guiding rule and usually found a posteriori."

### 2.3 The Dynamics Problem

Multiple critics note: Where is the dynamics?

> "Something I don't understand about these alternative theories based on Clifford algebras, is when and how they become quantum field theory... Where is the dynamics? How do we describe a process, like decay or scattering?"

---

## Part III: Comparison to Our Framework

### 3.1 What We Share

| Feature | Literature | Our Framework |
|---------|------------|---------------|
| R, C, H, O structure | Assumed | Derived from associativity (T1) + invertibility |
| 1, 2, 4, 8 dimensions | Hurwitz theorem | Same + stability explanation (S55) |
| SU(3) × SU(2) × U(1) | From automorphisms | Same mechanism |
| 10D or 15D total | Various | 15 = R+C+H+O = 1+2+4+8 |

### 3.2 Where We Differ

| Aspect | Literature | Our Framework |
|--------|------------|---------------|
| **Why division algebras?** | Assumed | Partially derived (S54): no-zero-divisors from perspective definition |
| **Why these dimensions?** | Hurwitz only | Stability as imperfection patterns (S55) |
| **Dynamics** | Not addressed | Perspective chains, nucleation/recrystallization (S55) |
| **Coupling constants** | Rarely addressed | sin²θ_W = 1/4 from [A-COUPLING]; α formula |
| **Dimension dynamics** | Fixed | Created/destroyed (S55 reframe) |

### 3.3 Our Potential Novel Contributions

#### Contribution 1: No-Zero-Divisors from Perspective (S54)

**The Claim**: "You can't see a subset of zero" derives no-zero-divisors.

**Uniqueness**: I found no literature that derives no-zero-divisors from epistemological/observational constraints. All assume algebraic structure directly.

**Status**: DERIVED (from perspective definition)

#### Contribution 2: Division Algebras as Stability Valleys (S55)

**The Claim**: 1, 2, 4, 8 are stable imperfection patterns; other dimensions collapse to these.

**Uniqueness**: The literature treats 1, 2, 4, 8 as mathematical fact (Hurwitz). We propose physical interpretation: these are stability valleys for dimensional structure.

**Status**: CONJECTURE (needs formalization)

#### Contribution 3: Dimension Dynamics (S55)

**The Claim**: Dimensions are created (nucleation) and destroyed (recrystallization/gravity).

**Uniqueness**: Most approaches treat dimension count as fixed. The dynamic picture is novel.

**Status**: CONJECTURE (needs formalization)

#### Contribution 4: Coupling Scaling Law

**The Claim**: g² ∝ dim(Im(algebra)) gives sin²θ_W = 1/4.

**Uniqueness**: Some recent work (Kosmoplex preprint, Nov 2025) claims similar derivations of Weinberg angle from octonions. The preprint claims sin²θ_W ≈ 0.23064 at Z scale. Our claim is sin²θ_W = 1/4 at unification.

**Status**: [A-COUPLING] assumed (not derived)

---

## Part IV: Key Insights from Literature

### 4.1 Three Generations Problem

The literature struggles with three generations:

- **Furey**: Found 3 gen structure in Cl(6) ⊂ Cl(8), but mechanism unclear
- **Baez**: Notes triality of Spin(8) may underlie generations
- **Others**: S₃ family symmetry from sedenion automorphisms

**Our approach**: 3 = dim(Im(H)) = quaternionic imaginary directions

This matches Furey's observation that generations appear in structures derived from H, but we provide the physical interpretation (each imaginary quaternion direction supports one generation).

### 4.2 Why 8+2+1 = 11?

Dixon notes: T = C⊗H⊗O gives 64 dimensions, but relevant structure is 11 + 4.

**Our interpretation** (S55):
- 11 = 8+2+1 = O+C+R (crystal-side, stable imperfection patterns)
- 4 = H (defect, where physics happens)

This binary decomposition (every number factors into 1,2,4,8 components) explains why 11 and 4 are natural.

### 4.3 The 10D Connection

Multiple approaches get 10D:
- Dixon: 10D spacetime from T algebra
- Baez: 10D → 4+6 splitting for SM fermions
- String theory: 10D for superstrings

**Our interpretation**:
- 10 = 8+2 = O+C (or various combinations)
- The "missing" 4 is H (defect/observer)
- Total 15 = all division algebras = 1+2+4+8

---

## Part V: What We Can Learn

### 5.1 From Furey

**Useful**: Her explicit construction of SM representations from R⊗C⊗H⊗O.

**Gap we address**: She assumes the algebra; we (partially) derive it.

**Possible integration**: Use her representation theory on top of our derived algebraic structure.

### 5.2 From Baez

**Useful**: The Dubois-Violette/Todorov construction (exceptional Jordan algebra).

**Gap we address**: He doesn't derive why octonions are relevant; our stability analysis (S55) provides physical grounding.

**Possible integration**: The 10D → 4+6 splitting may connect to our defect/crystal decomposition.

### 5.3 From Dixon

**Useful**: The T = C⊗H⊗O framework matches our structure.

**Gap we address**: He doesn't explain why T; we have n_d = 4, n_c = 11 derivation.

**Possible integration**: His 10D → 26D extension might inform multi-universe structure.

### 5.4 From Castro

**Useful**: Explicit gravity unification attempt.

**Gap we address**: Our S55 insight that gravity IS recrystallization provides different unification route.

**Possible integration**: His Clifford gauge theory might formalize our imperfect dimension dynamics.

---

## Part VI: The Invertibility Question

### 6.1 Current Status

Our remaining gap for full Frobenius application is **universal invertibility** (every non-zero element has inverse).

### 6.2 What Literature Says

The literature generally ASSUMES division algebra structure, which includes invertibility by definition. No one derives it.

### 6.3 Possible Approach

**Argument sketch** (not yet rigorous):
1. Adjacency is symmetric: γ(π₁, π₂) = γ(π₂, π₁)
2. This suggests every transition has a reverse transition
3. For finite-dimensional structure, this implies inverses exist

**Gap**: Not all transitions are between adjacent perspectives. Need: every transition (not just adjacent) has inverse.

**Possible resolution**: If transitions form a GROUP (closure + associativity + identity + inverses), then invertibility follows from group structure. We have closure, associativity, and identity. Need to show: if T is a transition, then T⁻¹ is also a transition.

---

## Part VII: Recommendations

### 7.1 Literature to Read More Deeply

1. **Furey's PhD thesis** — Full details of R⊗C⊗H⊗O construction
2. **Baez's "The Octonions"** — Comprehensive mathematical treatment
3. **Dubois-Violette & Todorov papers** — Exceptional Jordan algebra approach

### 7.2 What to Cite if Publishing

Our framework should acknowledge:
- Hurwitz/Frobenius theorems (1898/1878)
- Furey, Dixon, Baez for division algebra-SM connection
- The general insight that division algebras relate to particle physics

Our novel contributions to emphasize:
- Derivation of no-zero-divisors from perspective (S54)
- Stability interpretation of 1,2,4,8 (S55)
- Dimension dynamics (nucleation/recrystallization)
- sin²θ_W = 1/4 prediction at unification

### 7.3 Next Steps

1. **Formalize invertibility argument** — Close the last Frobenius gap
2. **Compare to Kosmoplex preprint** — Check if their Weinberg angle approach overlaps
3. **Investigate Cl(8) for generations** — Furey's recent work may inform our Im(H) = 3 conjecture
4. **Read Castro on gravity** — May inform recrystallization formalization

---

## Part VIII: Summary Table

| Aspect | Furey | Baez | Dixon | Castro | **Our Framework** |
|--------|-------|------|-------|--------|-------------------|
| Starting point | R⊗C⊗H⊗O | Octonions | C⊗H⊗O | R⊗C⊗H⊗O Clifford | **Perspective (T1)** |
| Gauge groups | DERIVED | Surveyed | DERIVED | DERIVED | **DERIVED** |
| Why div algebras? | Assumed | Assumed | Assumed | Assumed | **PARTIALLY DERIVED (S54)** |
| Coupling constants | — | — | — | — | **sin²θ_W = 1/4 ([A-COUPLING])** |
| Three generations | Some progress | Noted | Extended | — | **dim(Im(H)) = 3 [CONJECTURE]** |
| Dynamics | Gap | Gap | Gap | Gap | **Nucleation/recrystallization (S55)** |
| Gravity | Not included | Not included | Not included | Unified | **= Recrystallization (S55)** |

---

## References

### Primary Sources

- Furey, C. (2016). [Standard model physics from an algebra?](https://arxiv.org/abs/1611.09182) PhD thesis.
- Baez, J. (2002). [The Octonions](https://arxiv.org/abs/math/0105155). Bull. Amer. Math. Soc. 39, 145-205.
- Dixon, G. (1994). Division Algebras: Octonions, Quaternions, Complex Numbers and the Algebraic Design of Physics. Springer.
- Castro, C. (2019). [R⊗C⊗H⊗O-Valued Gravity as Grand Unified Field Theory](https://link.springer.com/article/10.1007/s00006-019-0937-4). Adv. Appl. Clifford Algebras.

### Secondary Sources

- [Quanta Magazine: The Peculiar Math That Could Underlie the Laws of Nature](https://www.quantamagazine.org/the-octonion-math-that-could-underpin-physics-20180720/)
- [Physics Forums: Furey models with Division Algebras](https://www.physicsforums.com/threads/furey-models-with-division-algebras.822833/)
- Baez, J. [Octonions and the Standard Model (blog series)](https://johncarlosbaez.wordpress.com/2020/11/13/octonions-and-the-standard-model/)

### Recent Developments

- Furey, C. & Hughes, M. (2022). Electroweak structure and division algebra breaking
- [Geometric Derivation of the Weinberg Angle from Octonionic Operators](https://www.preprints.org/manuscript/202511.0690) (Nov 2025 preprint)

---

*Document created: Session 57*
*This comparison is for internal research purposes*
