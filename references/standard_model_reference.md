# Standard Model Physics Reference Library

**Purpose**: Comprehensive reference of Standard Model physics with explicit assumptions, for comparison with Perspective Cosmology framework.

**Last Updated**: 2026-01-26

---

## Table of Contents

1. [Standard Model Structure](#1-standard-model-structure)
2. [Fundamental Constants](#2-fundamental-constants)
3. [Coupling Constants and Running](#3-coupling-constants-and-running)
4. [Grand Unified Theories](#4-grand-unified-theories)
5. [Quantum Field Theory Foundations](#5-quantum-field-theory-foundations)
6. [Electroweak Symmetry Breaking](#6-electroweak-symmetry-breaking)
7. [Hierarchy Problems](#7-hierarchy-problems)
8. [Quantum Gravity Approaches](#8-quantum-gravity-approaches)
9. [Information-Theoretic Physics](#9-information-theoretic-physics)
10. [Dimensional Arguments](#10-dimensional-arguments)
11. [Key Open Problems](#11-key-open-problems)

---

## 1. Standard Model Structure

### 1.1 Gauge Group

**The Standard Model gauge group is**: SU(3)_C × SU(2)_L × U(1)_Y

| Group | Force | Generators | Gauge Bosons |
|-------|-------|------------|--------------|
| SU(3)_C | Strong (QCD) | 8 | 8 gluons |
| SU(2)_L | Weak isospin | 3 | W⁺, W⁻, W⁰ |
| U(1)_Y | Weak hypercharge | 1 | B⁰ |

After electroweak symmetry breaking: W⁰ and B⁰ mix → Z⁰ and γ (photon)

**Source**: [Standard Model - Wikipedia](https://en.wikipedia.org/wiki/Standard_Model), [Mathematical formulation of the Standard Model](https://en.wikipedia.org/wiki/Mathematical_formulation_of_the_Standard_Model)

### 1.2 Explicit Assumptions of the Standard Model

| Assumption | Type | Status |
|------------|------|--------|
| Gauge group SU(3)×SU(2)×U(1) | POSTULATED | Not derived |
| Representation content (quarks, leptons) | EMPIRICAL | Fixed by observation |
| Three generations of fermions | EMPIRICAL | Not explained |
| Coupling constants (g₁, g₂, g₃) | FREE PARAMETERS | 3 parameters |
| Yukawa couplings | FREE PARAMETERS | ~13 parameters |
| Higgs potential parameters | FREE PARAMETERS | 2 parameters |
| Lorentz/Poincaré invariance | ASSUMED | Foundational |
| Locality (no action at a distance) | ASSUMED | Foundational |
| Unitarity | ASSUMED | Probability conservation |
| Renormalizability | ASSUMED | Mathematical consistency |

**Total free parameters**: ~19 (excluding neutrino sector)

**Key quote**: "Ordinary quantum field theory offers no deep explanation. The gauge group is postulated. Representation content is fixed empirically. Family structure is unexplained. Couplings are free parameters. Masses arise from Yukawa terms inserted by hand."

**Source**: [Part III — The Standard Model](https://dec41.user.srcf.net/notes/III_L/the_standard_model.pdf)

### 1.3 Particle Content

**Three generations**:

| Generation | Quarks | Leptons |
|------------|--------|---------|
| 1st | u, d | e, νₑ |
| 2nd | c, s | μ, νμ |
| 3rd | t, b | τ, ντ |

**Why three?** "Nobody knows why there are three generations." The three generations are "literally copy-paste of the first generation" — they differ primarily in mass.

**Experimental constraint**: Z-boson width measurements show exactly 3 light neutrino species.

**Source**: [Generation (particle physics) - Wikipedia](https://en.wikipedia.org/wiki/Generation_(particle_physics)), [The mystery of particle generations - Symmetry Magazine](https://www.symmetrymagazine.org/article/august-2015/the-mystery-of-particle-generations)

---

## 2. Fundamental Constants

### 2.1 Fine Structure Constant (α)

**Definition**: α = e²/(4πε₀ℏc) ≈ 1/137.036

**Current best value**: α⁻¹ = 137.035999177(21)

**Properties**:
- Dimensionless
- Measures strength of electromagnetic interaction
- RUNS with energy scale (from 1/137 at low energy to ~1/127 at Z mass)

**Historical derivation attempts**:

| Attempt | Method | Outcome |
|---------|--------|---------|
| Eddington (1929) | Integer numerology | Failed — adjusted when experiments improved |
| Wyler (1969) | Geometric volumes | Not unique, no physical basis |
| Gilson (1996) | Trigonometric | Circular reasoning |
| Atiyah (2018) | Mathematical | "Misguided" — α is a function, not a number |
| Various | Information-theoretic | Hidden free parameters |

**Modern consensus**: "Physicists have more or less given up on a century-old obsession over where alpha's particular value comes from."

**Key insight**: α is NOT a fixed number — it runs. "To a modern physicist, trying to derive α seems misguided. Renormalization theory teaches us that α isn't really a number at all; it's a function of the total amount of momentum involved."

**Source**: [Fine-structure constant - Wikipedia](https://en.wikipedia.org/wiki/Fine-structure_constant), [Atiyah and the Fine-Structure Constant – Sean Carroll](https://www.preposterousuniverse.com/blog/2018/09/25/atiyah-and-the-fine-structure-constant/), [Quanta Magazine](https://www.quantamagazine.org/physicists-measure-the-magic-fine-structure-constant-20201202/)

### 2.2 Weinberg Angle (sin²θ_W)

**Definition**: Mixing angle between SU(2) and U(1) in electroweak theory

**Measured values**:

| Scheme | Value | Energy Scale |
|--------|-------|--------------|
| On-shell | 0.22290(30) | From m_W/m_Z ratio |
| MS-bar at M_Z | 0.23122(4) | Z mass scale |
| Low energy | ~0.238 | Q ~ 0 |

**GUT prediction**: sin²θ_W = 3/8 = 0.375 at GUT scale

**Running**: From 3/8 at ~10¹⁶ GeV down to ~0.231 at M_Z through renormalization group

**Status**: "At present, there is no generally accepted theory that explains why the measured value θ_W ≈ 29° should be what it is. The Weinberg angle θ_W is an open, free parameter."

**Source**: [Weinberg angle - Wikipedia](https://en.wikipedia.org/wiki/Weinberg_angle)

### 2.3 Gravitational Coupling Constant (α_G)

**Definition**: α_G = Gm²/(ℏc) where m is typically electron mass

**Value**: α_G ≈ 1.75 × 10⁻⁴⁵ (using electron mass)

**Physical interpretation**: α_G = (m_e/m_P)² — the square of electron mass in Planck units

**Hierarchy**: α_G is 42 orders of magnitude smaller than α — "the hierarchy problem"

**Key insight**: "If you define the dimensionless strength of gravity using the Planck mass you get exactly 1. So the good question is: Why are the masses of elementary particles so small compared to the Planck mass? This is the Hierarchy Problem."

**Source**: [Gravitational coupling constant - Wikipedia](https://en.wikipedia.org/wiki/Gravitational_coupling_constant), [Coupling Constants for the Fundamental Forces](http://hyperphysics.phy-astr.gsu.edu/hbase/Forces/couple.html)

### 2.4 Coupling Constant Summary

| Force | Coupling | Approximate Value | Running Direction |
|-------|----------|-------------------|-------------------|
| Strong | α_s | ~1 (at low E), ~0.1 (at M_Z) | Decreases with E (asymptotic freedom) |
| Electromagnetic | α | 1/137 (low E), 1/127 (M_Z) | Increases with E |
| Weak | α_W | ~1/30 | Decreases with E |
| Gravity | α_G | ~10⁻⁴⁵ | Unknown |

**Source**: [Coupling constant - Wikipedia](https://en.wikipedia.org/wiki/Coupling_constant)

---

## 3. Coupling Constants and Running

### 3.1 Renormalization Group

**Beta function**: β(g) = μ(∂g/∂μ) — describes how coupling g changes with energy scale μ

**Key results**:
- QED: β > 0 → coupling increases with energy
- QCD: β < 0 → coupling decreases with energy (asymptotic freedom)
- Weak: β > 0 → coupling increases with energy

**Experimental verification**: "The coupling constants do change with energy, as demonstrated by comparing measurements at LEP, Tevatron, and LHC."

**Source**: [Beta function (physics) - Wikipedia](https://en.wikipedia.org/wiki/Beta_function_(physics)), [Running coupling constants](https://www.physicsmasterclasses.org/exercises/keyhole/en/projects/running_alphas.html)

### 3.2 Coupling Unification

**Observation**: At ~10¹⁵ GeV, the three SM couplings nearly converge

**Without SUSY**: Couplings don't quite meet at a single point

**With SUSY (MSSM)**: Couplings unify much more precisely at ~10¹⁶ GeV

**Significance**: "This matching is unlikely to be a coincidence and is often quoted as one of the main motivations to investigate supersymmetric theories."

**Source**: [Grand Unified Theory - Wikipedia](https://en.wikipedia.org/wiki/Grand_Unified_Theory)

---

## 4. Grand Unified Theories

### 4.1 SU(5) (Georgi-Glashow Model)

**Structure**: SM embeds as SU(3)×SU(2)×U(1) ⊂ SU(5)

**Key predictions**:
- sin²θ_W = 3/8 at GUT scale
- Proton decay with τ ~ 10²⁹-10³⁰ years
- Charge quantization

**Status**: RULED OUT — proton lifetime measured τ > 10³⁴ years

**Source**: [Georgi–Glashow model - Wikipedia](https://en.wikipedia.org/wiki/Georgi%E2%80%93Glashow_model)

### 4.2 SO(10)

**Advantages over SU(5)**:
- Naturally includes right-handed neutrinos
- Explains neutrino masses via seesaw mechanism
- Single 16-dimensional spinor representation contains one generation

**Predictions**: Proton decay preferentially to ν̄K⁺ or μ⁺K⁰

**Status**: Still viable with certain parameter choices

**Source**: [Grand Unified Theory - Wikipedia](https://en.wikipedia.org/wiki/Grand_Unified_Theory)

### 4.3 GUT Assumptions

| Assumption | Justification |
|------------|---------------|
| Larger gauge group contains SM | Simplicity, unification |
| Coupling unification at high scale | Approximate experimental support |
| Desert between M_Z and M_GUT | No new physics for 14 orders of magnitude |
| Proton decay exists | Baryon number violation required |

---

## 5. Quantum Field Theory Foundations

### 5.1 Wightman Axioms

**Purpose**: Mathematically rigorous formulation of QFT

**Key axioms**:
1. **Hilbert space**: States live in a Hilbert space H
2. **Poincaré invariance**: Unitary representation of Poincaré group
3. **Vacuum**: Unique Poincaré-invariant state |0⟩
4. **Fields as operator-valued distributions**: φ(x) smeared over test functions
5. **Locality/Causality**: [φ(x), φ(y)] = 0 for spacelike separation
6. **Spectrum condition**: Energy-momentum spectrum in forward light cone

**Open problem**: "Currently, there is no proof that the Wightman axioms can be satisfied for interacting theories in dimension 4. In particular, the Standard Model of particle physics has no mathematically rigorous foundations."

**Millennium Prize**: $1M for proving Yang-Mills theory satisfies Wightman axioms with mass gap

**Source**: [Wightman axioms - Wikipedia](https://en.wikipedia.org/wiki/Wightman_axioms), [Axiomatic quantum field theory - Wikipedia](https://en.wikipedia.org/wiki/Axiomatic_quantum_field_theory)

### 5.2 Key QFT Assumptions

| Assumption | Notes |
|------------|-------|
| Spacetime is Minkowski | Fixed background, not dynamical |
| Fields are fundamental | Not derived from deeper structure |
| Locality | Interactions at a point |
| Unitarity | Probability conserved |
| Causality | No faster-than-light signaling |

---

## 6. Electroweak Symmetry Breaking

### 6.1 Higgs Mechanism

**The problem**: Gauge symmetry forbids mass terms for gauge bosons

**The solution**: Spontaneous symmetry breaking via Higgs field

**Key parameters**:
- Higgs VEV: v = 246 GeV (sets electroweak scale)
- Higgs mass: m_H ≈ 125 GeV (discovered 2012)

**What it explains**:
- W and Z boson masses: m_W ≈ 80 GeV, m_Z ≈ 91 GeV
- Fermion masses via Yukawa couplings (but values are inputs)

**What it doesn't explain**:
- Why v = 246 GeV (hierarchy problem)
- Fermion mass hierarchy (why m_t >> m_e)

**Source**: [Higgs mechanism - Wikipedia](https://en.wikipedia.org/wiki/Higgs_mechanism), [Electroweak symmetry breaking - Modern Physics](https://modern-physics.org/electroweak-symmetry-breaking/)

### 6.2 Electroweak Unification

**Key relation**: e = g sin θ_W = g' cos θ_W

**Mass formulas**:
- m_W = gv/2
- m_Z = m_W/cos θ_W
- m_γ = 0 (photon remains massless)

---

## 7. Hierarchy Problems

### 7.1 The Gauge Hierarchy Problem

**The issue**: Why is the Higgs VEV (v ~ 10² GeV) so much smaller than the Planck scale (M_P ~ 10¹⁹ GeV)?

**Quantum corrections**: Higgs mass receives quadratically divergent corrections that should push it to M_P

**Proposed solutions**:
- Supersymmetry (cancels corrections)
- Technicolor (no fundamental scalar)
- Extra dimensions
- Anthropic selection

**Status**: No solution confirmed experimentally

### 7.2 The Cosmological Constant Problem

**The issue**: Observed Λ ≈ 10⁻¹²⁰ in Planck units; QFT predicts Λ ~ 1

**Discrepancy**: 120 orders of magnitude — "the largest discrepancy between theory and experiment in all of science"

**Key quote**: "It is a little unfair to emphasize the factor of 10¹²⁰... We should think of the cosmological constant problem as a discrepancy of 30 orders of magnitude in energy scale."

**Proposed solutions**:
- Supersymmetry (helps but doesn't solve)
- String landscape + anthropic selection
- Modified gravity
- Unknown mechanism

**Status**: Unsolved

**Source**: [Cosmological constant problem - Wikipedia](https://en.wikipedia.org/wiki/Cosmological_constant_problem), [Scientific American](https://www.scientificamerican.com/article/the-cosmological-constant-is-physics-most-embarrassing-problem/)

### 7.3 The Gravity-EM Hierarchy

**The ratio**: α/α_G ~ 10³⁷

**Why so large?**: Unknown — this is essentially asking why m_e << M_P

**Connection to Higgs**: Both hierarchies involve the question of why there are small masses compared to Planck scale

---

## 8. Quantum Gravity Approaches

### 8.1 Penrose-Diósi Gravitational Decoherence

**Core idea**: Gravity causes objective wave function collapse

**Mechanism**: "Nature dislikes superpositions of different spacetimes" and collapses them

**Collapse time**: τ ~ ℏ/E_Δ where E_Δ is gravitational self-energy of superposition

**Predictions**:
- Small molecules: τ ~ 10⁹ years
- Mesoscopic crystals: τ ~ days
- Macroscopic systems: τ ~ 10⁻²⁷ s

**Free parameter**: R₀ (mass density distribution width)

**Experimental status**: Parameter-free version ruled out; parameterized version constrained

**Source**: [Diósi–Penrose model - Wikipedia](https://en.wikipedia.org/wiki/Di%C3%B3si%E2%80%93Penrose_model), [Penrose interpretation - Wikipedia](https://en.wikipedia.org/wiki/Penrose_interpretation)

### 8.2 Holographic Principle

**Core idea**: Information in a region is bounded by its surface area, not volume

**Bekenstein bound**: S ≤ 2πkRE/(ℏc)

**Black hole entropy**: S = A/(4l_P²) — the Bekenstein-Hawking formula

**Implication**: The maximum entropy in any region scales with radius², not radius³

**Connection to quantum gravity**: Suggests spacetime may be emergent from information

**Source**: [Holographic principle - Wikipedia](https://en.wikipedia.org/wiki/Holographic_principle), [Bekenstein bound - Wikipedia](https://en.wikipedia.org/wiki/Bekenstein_bound)

### 8.3 Block Universe / Eternalism

**Core idea**: Past, present, and future all equally exist as a 4D "block"

**Support from relativity**: Relativity of simultaneity implies no universal "now"

**Key quote**: "Many philosophers have argued that relativity implies eternalism."

**Implications**:
- No objective flow of time
- All events are equally real
- Change is an illusion of perspective

**Challenges**: Quantum mechanics may conflict (inherent unpredictability)

**Source**: [Eternalism - Wikipedia](https://en.wikipedia.org/wiki/Eternalism_(philosophy_of_time))

---

## 9. Information-Theoretic Physics

### 9.1 Wheeler's "It from Bit"

**Core thesis**: "Every it — every particle, every field of force, even the spacetime continuum itself — derives its function, its meaning, its very existence entirely from the apparatus-elicited answers to yes or no questions, binary choices, bits."

**Key implications**:
- Reality is fundamentally informational
- Spacetime is emergent, not fundamental
- Observer participation is essential

**Status**: Philosophical framework; inspired much modern research

**Source**: [John Horgan on Wheeler](https://johnhorgan.org/cross-check/physicist-john-wheeler-and-the-it-from-bit), [The Marginalian](https://www.themarginalian.org/2016/09/02/it-from-bit-wheeler/)

### 9.2 Relational Quantum Mechanics (Rovelli)

**Core idea**: Quantum states are relational — there is no observer-independent state

**Key principle**: "Different observers may give different accurate accounts of the same system. There is no privileged, 'real' account."

**Analogy to relativity**: Just as simultaneity is relative, so is the quantum state

**Clarification**: "Observer" means any physical system, not necessarily conscious

**Source**: [Relational quantum mechanics - Wikipedia](https://en.wikipedia.org/wiki/Relational_quantum_mechanics), [Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/entries/qm-relational/)

---

## 10. Dimensional Arguments

### 10.1 Planck Units

**Definition**: Natural units where c = ℏ = G = k_B = 1

| Quantity | Formula | Value |
|----------|---------|-------|
| Planck length | l_P = √(ℏG/c³) | 1.616 × 10⁻³⁵ m |
| Planck mass | m_P = √(ℏc/G) | 2.176 × 10⁻⁸ kg |
| Planck time | t_P = √(ℏG/c⁵) | 5.391 × 10⁻⁴⁴ s |
| Planck energy | E_P = √(ℏc⁵/G) | 1.956 × 10⁹ J |

**Physical significance**: At Planck scale, quantum gravity effects become important

**Source**: [Planck units - Wikipedia](https://en.wikipedia.org/wiki/Planck_units)

### 10.2 Compton Wavelength

**Definition**: λ_C = h/(mc) — wavelength of photon with energy equal to particle's rest mass

**Electron Compton wavelength**: λ_C,e = 2.43 × 10⁻¹² m

**Physical significance**:
- Scale where QFT becomes necessary
- Below λ_C, particle creation becomes possible
- Ratio (Bohr radius)/(Compton wavelength) ~ 137 = 1/α

**Source**: [Compton wavelength - Wikipedia](https://en.wikipedia.org/wiki/Compton_wavelength)

### 10.3 Why Three Spatial Dimensions?

**Anthropic arguments**:
- Ehrenfest (1920): Planetary orbits unstable for d > 3
- Weyl (1922): Maxwell's equations only work for d = 3
- Tangherlini (1963): Electron orbitals unstable for d > 3
- Tegmark: d_time > 1 makes physics unpredictable

**Status**: No derivation from first principles; anthropic selection plausible

**Source**: [Anthropic principle - Wikipedia](https://en.wikipedia.org/wiki/Anthropic_principle)

---

## 11. Key Open Problems

### Problems with No Standard Solution

| Problem | Description | Status |
|---------|-------------|--------|
| Why α ≈ 1/137? | Origin of fine structure constant | Unknown |
| Why 3 generations? | Family replication | Unknown |
| Why θ_W ≈ 29°? | Origin of Weinberg angle | Unknown |
| Hierarchy problem | Why m_H << M_P | Multiple proposals, none confirmed |
| Cosmological constant | Why Λ ~ 10⁻¹²⁰? | "Worst prediction in physics" |
| Mass hierarchy | Why m_t/m_e ~ 10⁶? | Yukawa couplings unexplained |
| Quantum gravity | How to unify QM and GR | Multiple approaches, none complete |
| Dark matter | What is it? | Unknown |
| Dark energy | What is it? | Unknown |
| Matter-antimatter asymmetry | Why more matter? | CP violation insufficient |

### What the Standard Model Does NOT Explain

1. Values of coupling constants (inputs)
2. Values of fermion masses (inputs)
3. Number of generations (input)
4. Origin of gauge group (postulated)
5. Origin of spacetime (assumed)
6. Origin of quantum mechanics (assumed)
7. Gravity (not included)

---

## Quick Reference: Key Numbers

| Quantity | Value | Notes |
|----------|-------|-------|
| α | 1/137.036 | EM coupling |
| sin²θ_W | 0.231 (MS-bar) | Weinberg angle |
| sin²θ_W | 0.2229 (on-shell) | Tree-level value |
| α_s(M_Z) | 0.118 | Strong coupling at Z mass |
| α_G | 1.75 × 10⁻⁴⁵ | Gravitational coupling (electron) |
| v | 246 GeV | Higgs VEV |
| m_H | 125 GeV | Higgs mass |
| m_W | 80.4 GeV | W boson mass |
| m_Z | 91.2 GeV | Z boson mass |
| M_GUT | ~10¹⁶ GeV | GUT scale |
| M_P | 1.22 × 10¹⁹ GeV | Planck mass |
| l_P | 1.62 × 10⁻³⁵ m | Planck length |
| t_P | 5.39 × 10⁻⁴⁴ s | Planck time |

---

## Sources

### Wikipedia
- [Standard Model](https://en.wikipedia.org/wiki/Standard_Model)
- [Fine-structure constant](https://en.wikipedia.org/wiki/Fine-structure_constant)
- [Weinberg angle](https://en.wikipedia.org/wiki/Weinberg_angle)
- [Grand Unified Theory](https://en.wikipedia.org/wiki/Grand_Unified_Theory)
- [Wightman axioms](https://en.wikipedia.org/wiki/Wightman_axioms)
- [Higgs mechanism](https://en.wikipedia.org/wiki/Higgs_mechanism)
- [Cosmological constant problem](https://en.wikipedia.org/wiki/Cosmological_constant_problem)
- [Holographic principle](https://en.wikipedia.org/wiki/Holographic_principle)
- [Relational quantum mechanics](https://en.wikipedia.org/wiki/Relational_quantum_mechanics)
- [Planck units](https://en.wikipedia.org/wiki/Planck_units)
- [Compton wavelength](https://en.wikipedia.org/wiki/Compton_wavelength)

### Academic Sources
- [Part III — The Standard Model (Cambridge)](https://dec41.user.srcf.net/notes/III_L/the_standard_model.pdf)
- [The Standard Model (DAMTP)](https://www.damtp.cam.ac.uk/user/tong/sm/standardmodel.pdf)
- [Stanford Encyclopedia of Philosophy - Relational QM](https://plato.stanford.edu/entries/qm-relational/)

### Other
- [Quanta Magazine - Fine Structure Constant](https://www.quantamagazine.org/physicists-measure-the-magic-fine-structure-constant-20201202/)
- [Sean Carroll - Atiyah and α](https://www.preposterousuniverse.com/blog/2018/09/25/atiyah-and-the-fine-structure-constant/)
- [HyperPhysics - Coupling Constants](http://hyperphysics.phy-astr.gsu.edu/hbase/Forces/couple.html)

---

*This document serves as a reference for comparing Perspective Cosmology claims against established physics. All assumptions should be explicitly noted when translating between frameworks.*
