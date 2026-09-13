# Derivation of Schrödinger Equation from Perspective Axioms

**Status**: ARCHIVE (stale, pre-S150; see projection_qm_derivation.md)
**Confidence**: [DERIVATION] with acknowledged gaps
**Created**: 2026-01-27
**Last Updated**: 2026-01-30

---

## 1. Goal

Derive the Schrödinger equation (or equivalent):
$$i\hbar \frac{\partial \psi}{\partial t} = \hat{H}\psi$$

From Layer 0 axioms ONLY:
- Crystal axioms C1-C5
- Perspective axioms P1-P4, Π1-Π2
- Transition axioms T0, T1

**Success criteria**: Explain why:
1. States evolve LINEARLY
2. Generator is HERMITIAN
3. Factor of i appears
4. ℏ sets a scale
5. Probability = |ψ|²

---

## 2. Available Structure (Layer 0 Inventory)

### 2.1 From Crystal (C1-C5)
- V_Crystal: inner product space over F (where F = ℝ or ℂ)
- Orthonormal basis {b_i} with ⟨b_i, b_j⟩ = δ_ij
- No preferred direction, complete symmetry

### 2.2 From Perspective (P1-P4, Π1-Π2)
- π: orthogonal projection, π² = π, π† = π
- V_π = im(π) ⊊ V_Crystal (partial access)
- dim(V_π) < ∞ (finite)
- Tilt matrix: ε_ij = ⟨π(b_i), π(b_j)⟩ - δ_ij
- Multiple overlapping perspectives exist

### 2.3 From Transitions (T0, T1)
- Transition algebra 𝒯 closed under composition, identity, inverse
- No time in Crystal; time IS path through 𝒯
- History h = (T₁, T₂, T₃, ...) = sequence of transitions

### 2.4 The Overlap
$$\gamma(\pi_1, \pi_2) = \frac{\dim(V_{\pi_1} \cap V_{\pi_2})}{\dim(V_{\pi_1} + V_{\pi_2})}$$

---

## 3. Step 1: Why States Live in Hilbert Space

### 3.1 The Argument

**Claim**: Quantum states are elements of a Hilbert space.

**From axioms**:
- V_Crystal is an inner product space over F (C1, C2)
- F = ℝ or ℂ (axiom allows both)
- V_π = im(π) inherits the inner product structure
- V_π is finite-dimensional (P3)

**Result**: V_π is automatically a finite-dimensional Hilbert space.

**Confidence**: [THEOREM] — This is direct consequence of axioms.

### 3.2 What Field F?

The axioms leave F = ℝ or ℂ as a choice. For QM, we need ℂ.

**Argument for F = ℂ**:
Consider what happens when perspectives compose. If π₁ and π₂ are both projections, the composition π₂π₁ is generally NOT a projection (not idempotent). To track how states transform, we need to represent general linear maps.

For a real vector space, general maps have eigenvalues in ℂ (fundamental theorem of algebra). The spectrum of any map requires ℂ for completeness.

More directly: **time direction requires complex structure**.

### 3.3 Time Direction and Complex Numbers [KEY]

**Claim**: Distinguishing past from future requires F = ℂ.

**Argument**:
- A transition T: π₁ → π₂ has an inverse T⁻¹: π₂ → π₁ (T0)
- On the algebra level, T and T⁻¹ are indistinguishable
- How does a history h = (T₁, T₂, ...) have a DIRECTION?

Consider continuous transitions parameterized by s ∈ ℝ:
$$T(s) = e^{sG}$$

where G is a generator. For s → -s to give a different result, we need:
$$e^{sG} \neq e^{-sG}$$

This requires G to have eigenvalues that distinguish sign. Real antisymmetric matrices work, but complex Hermitian generators with explicit i give:
$$e^{isH} \neq e^{-isH}$$

because the phases rotate in opposite directions.

**Conclusion**: F = ℂ is required for directed time.

**Confidence**: [DERIVATION] — argument is sound but not airtight. Gap: why must time be directed?

### 3.4 Summary of Step 1

| QM Feature | Source | Confidence |
|------------|--------|------------|
| Hilbert space | C1, C2 give inner product space | [THEOREM] |
| Complex field | Time direction + completeness | [DERIVATION] |
| Finite dimension | P3 (finite access) | [THEOREM] |

---

## 4. Step 2: Why Evolution is Linear

### 4.1 State as Overlap Pattern

**Definition**: A "state" s relative to perspective π is the pattern of overlaps with accessible structure.

If V_π has orthonormal basis {e₁, ..., eₙ}, then:
$$\psi_s = \sum_k \langle s, e_k \rangle e_k$$

This is just the projection of s onto V_π:
$$\psi_s = \pi(s)$$

**Key insight**: The state IS a projection.

### 4.2 Evolution of States

Consider a transition T: π → π' (possibly the same perspective at different "times" along a history).

How does T affect the state ψ_s?

Since T maps between perspectives, it defines how the accessible subspace transforms. The state transforms as:
$$\psi_s \mapsto \psi'_s = \pi'(s) = T(\psi_s)$$

where the last equality requires T to act linearly on states.

**Claim**: T must be linear.

**Proof**:
1. ψ_s = π(s) is a linear function of s (projections are linear)
2. T is a transition between perspectives
3. For T to respect the vector space structure of V_π, it must be linear
4. More formally: T: V_π → V_π' where both are vector spaces; the natural maps are linear

**Alternative proof (superposition)**:
- If s₁ and s₂ are both states, their superposition s₁ + s₂ is also valid
- T(s₁ + s₂) should give the evolution of the superposition
- For this to equal T(s₁) + T(s₂), T must be linear

**Confidence**: [THEOREM] — follows from vector space structure.

### 4.3 Summary of Step 2

| QM Feature | Source | Confidence |
|------------|--------|------------|
| Linear evolution | Vector space structure preserved | [THEOREM] |
| Superposition | Linearity of projections | [THEOREM] |

---

## 5. Step 3: Why Evolution is Unitary (Hermitian Generator)

### 5.1 The Conservation Argument

**Question**: What must transitions preserve?

**Candidate**: Total overlap should be conserved.

If ψ = Σ cₖ eₖ is a state in V_π, the "total content" is:
$$\|\psi\|^2 = \sum_k |c_k|^2 = \langle \psi, \psi \rangle$$

**Claim**: Physical transitions preserve ||ψ||².

**Argument**:
- ||ψ||² measures the perspective's access to content
- Transitions shouldn't create or destroy content (information conservation)
- By T0, transitions are invertible, so content sent forward equals content received

**What preserves ||ψ||²?** Unitary transformations:
$$U^\dagger U = U U^\dagger = I$$

**Confidence**: [DERIVATION] — Argument is physically motivated but "content conservation" is not an axiom.

### 5.2 Alternative: From Transition Algebra Structure

The transition algebra 𝒯 is closed under inverse (T0c).

Consider a one-parameter family of transitions:
$$T(s): \pi \to \pi_s$$

with T(0) = I (identity).

The group property requires:
$$T(s)T(t) = T(s+t)$$

By Stone's theorem (for strongly continuous groups on Hilbert space):
$$T(s) = e^{sG}$$

for some generator G.

For T(s)⁻¹ = T(-s) to also be in 𝒯, we need:
$$T(-s) = e^{-sG}$$

Combined with T(s)† = T(-s) (unitarity from conservation), we get:
$$e^{sG^\dagger} = e^{-sG}$$

Therefore G† = -G (anti-Hermitian).

Write G = iH where H† = H (Hermitian). Then:
$$T(s) = e^{isH}$$

This is the standard QM evolution with parameter s playing role of t/ℏ.

**Confidence**: [THEOREM] — Given content conservation, this follows mathematically.

### 5.3 The Gap: Why Content Conservation?

The argument above assumes transitions preserve ||ψ||². Why?

**Possible axiom**: Add to T0: "Transitions preserve the inner product on accessible content."

This would be a new axiom T2. But can we derive it?

**Attempt at derivation**:
- The inner product comes from the Crystal (C2)
- The Crystal doesn't change (it's the static background)
- Transitions change PERSPECTIVE, not Crystal
- Therefore the Crystal's inner product is preserved
- But: transitions act on V_π, not V_Crystal directly

**Better argument**:
- For any v ∈ V_π, ||v||² is computed via Crystal inner product
- T: π → π' maps V_π → V_π'
- Both V_π and V_π' are subspaces of the SAME V_Crystal
- The inner product on both is inherited from V_Crystal
- Therefore T preserves the inherited inner product

This is close to a proof. The gap: we need T to map vectors to vectors (not just subspaces to subspaces) in a compatible way.

**Confidence**: [DERIVATION] — Strong argument but some gaps.

### 5.4 Summary of Step 3

| QM Feature | Source | Confidence |
|------------|--------|------------|
| Unitary evolution | Content (norm) conservation | [DERIVATION] |
| Hermitian generator | Stone's theorem + unitarity | [THEOREM] |

---

## 6. Step 4: Where Does i Come From?

### 6.1 Mathematical Necessity

Once we have:
1. Complex field (from time direction argument)
2. Unitary evolution (from conservation)
3. Hermitian generator H

The factor i is FORCED:
$$U(t) = e^{-iHt/\hbar}$$

Taking derivative:
$$\frac{dU}{dt} = -\frac{iH}{\hbar}U$$

Applied to state ψ = U(t)ψ₀:
$$\frac{d\psi}{dt} = -\frac{iH}{\hbar}\psi$$

Rearranging:
$$i\hbar \frac{d\psi}{dt} = H\psi$$

**The i comes from**: Generator of unitary = i × Hermitian

This is pure mathematics, not physics. Given complex Hilbert space and norm-preserving evolution, the imaginary unit must appear.

**Confidence**: [THEOREM]

### 6.2 Physical Interpretation

The i connects to:
- Phase: ψ and e^{iθ}ψ are physically equivalent (overall phase)
- Interference: Relative phases matter (superposition)
- Time direction: i distinguishes forward/backward

In the framework: i encodes the directed nature of transitions along a history.

---

## 7. Step 5: What is ℏ? [HARDEST PART]

### 7.1 The Problem

ℏ ≈ 1.054 × 10⁻³⁴ J·s is a dimensionful constant. The axioms have no dimensionful quantities.

**Options**:
1. ℏ emerges from structure (derive its value)
2. ℏ is a unit choice (arbitrary scale)
3. ℏ relates to perspective properties (minimum quantum of action)

### 7.2 Approach: Minimum Transition

**Conjecture**: ℏ is the minimum action for a distinguishable transition.

From P3: dim(V_π) < ∞. This means perspectives have FINITE information capacity.

**Argument**:
- A transition that changes less than one bit of information is indistinguishable
- The minimum distinguishable change defines a quantum of action
- This quantum IS ℏ

More precisely:
- Perspectives distinguish states that differ by at least δ_min in some dimension
- The action required to create this minimal difference is ℏ

**Gap**: This is heuristic. We need to define "action" in the framework.

### 7.3 Approach: Dimensional Analysis

The Schrödinger equation relates:
- Time evolution (dimension T⁻¹)
- Energy (dimension ML²T⁻²)

The ratio needs dimension ML²T⁻¹ = [ℏ].

In the framework:
- Transitions are dimensionless (mathematical maps)
- We need to introduce physical dimensions via Layer 2 correspondence

**Insight**: ℏ might be a UNIT CONVERSION factor, not a fundamental constant.

### 7.4 Approach: From Tilt Structure

The tilt matrix ε_ij measures deviation from orthogonality.

**Speculation**: ℏ relates to the minimal tilt that makes a difference.

If the smallest non-zero eigenvalue of ε is ε_min, then:
$$\hbar \sim \text{(some function of } \epsilon_{\min}\text{)}$$

**Problem**: This requires knowing the tilt structure, which varies by perspective.

### 7.5 Approach: Information-Theoretic

If information is fundamental:
$$I_\pi = \dim(V_\pi)$$

The minimum information change is 1 dimension. The energy cost of this change might define ℏ.

$$\hbar = \frac{E_{\min}}{\omega_{\min}}$$

where E_min is minimum energy (ground state) and ω_min is minimum frequency (slowest oscillation).

**Gap**: Need to define energy and frequency from axioms.

### 7.6 Status of ℏ

**Honest assessment**: We cannot derive ℏ from Layer 0 alone.

What we CAN say:
- The FORM of Schrödinger (with SOME constant) follows from axioms
- The VALUE of ℏ requires either:
  - Additional axioms (quantization scale)
  - Layer 2 correspondence (matching to observation)
  - Derivation from other constants (if connected)

**Confidence**: [CONJECTURE] — ℏ exists as minimum action quantum, value not derived.

---

## 8. Step 6: Why |ψ|² Gives Probability (Born Rule)

### 8.1 The Challenge

The Born rule is notoriously hard to derive. Many attempts exist (Everett, Deutsch, Zurek, etc.) with varying success.

### 8.2 Framework Approach: Overlap as Probability

**Definition**: The overlap between state ψ and measurement basis |eₖ⟩ is:
$$\gamma_k = |\langle e_k, \psi \rangle|^2$$

**Claim**: This naturally gives probability.

**Argument from framework**:
1. γ(π₁, π₂) measures shared content between perspectives
2. A measurement is asking: "what does perspective π_k see?"
3. The answer is: the overlap between state and π_k
4. For normalized ψ: Σγₖ = ||ψ||² = 1
5. This is automatically a probability distribution

**Why |·|² and not |·|?**

The overlap γ = dim(V₁ ∩ V₂)/dim(V₁ + V₂) involves DIMENSION counting.

For vectors rather than subspaces:
$$\gamma(\psi, \phi) = \frac{|\langle \psi, \phi \rangle|^2}{\|\psi\|^2 \|\phi\|^2}$$

The squared magnitude appears because:
- Overlap is symmetric: γ(ψ,φ) = γ(φ,ψ)
- But ⟨ψ,φ⟩ = ⟨φ,ψ⟩* for complex inner products
- Only |⟨ψ,φ⟩|² is both symmetric and real

**Confidence**: [DERIVATION] — Compelling argument but not airtight proof.

### 8.3 Alternative: Round-Trip Overlap

The framework emphasizes going "out and back."

**Physical picture**:
- Measure in basis |eₖ⟩
- If you got outcome k, then:
  - Forward transition: ψ → eₖ has amplitude ⟨eₖ,ψ⟩
  - Backward reconstruction: eₖ → ψ has amplitude ⟨ψ,eₖ⟩ = ⟨eₖ,ψ⟩*
- Round-trip: |⟨eₖ,ψ⟩|²

The |·|² is the round-trip amplitude, which is what a measurement actually probes.

**Confidence**: [DERIVATION] — Physically motivated.

---

## 9. Putting It Together: The Derived Equation

### 9.1 What We Derived

From Layer 0 axioms:

1. **Hilbert space**: V_π is inner product space [THEOREM from C1-C2, P3]
2. **Complex field**: Needed for time direction [DERIVATION]
3. **Linear evolution**: T must be linear [THEOREM from vector structure]
4. **Unitary evolution**: Conservation of norm [DERIVATION + possible new axiom]
5. **Hermitian generator**: From Stone's theorem [THEOREM given unitarity]
6. **Factor i**: Mathematical necessity [THEOREM]
7. **Constant ℏ**: Exists but value not derived [CONJECTURE]
8. **Born rule**: From overlap structure [DERIVATION]

### 9.2 The Result

$$i\hbar \frac{\partial \psi}{\partial t} = \hat{H}\psi$$

| Symbol | Perspective Meaning | Derivation Status |
|--------|---------------------|-------------------|
| ψ | Overlap pattern (state = π(s)) | [THEOREM] |
| i | Time direction marker | [DERIVATION] |
| ℏ | Minimum action quantum | [CONJECTURE] |
| ∂/∂t | Infinitesimal transition | [THEOREM] |
| Ĥ | Transition generator | [THEOREM] |

### 9.3 What Ĥ IS

The Hamiltonian Ĥ is the generator of perspective transitions along a history.

Different Ĥ correspond to different paths through 𝒯.

**Physical interpretation**: Ĥ encodes how the accessible subspace V_π evolves.

---

## 10. Gaps and Honest Assessment

### 10.1 What's Solid

1. **Hilbert space structure** — Direct from axioms
2. **Linear evolution** — From vector space properties
3. **Hermitian generator** — From Stone's theorem (given unitarity)
4. **Factor i** — Mathematical necessity

### 10.2 What's Plausible but Not Proven

1. **F = ℂ** — Time direction argument is compelling but not forced by axioms
2. **Unitarity** — Requires conservation principle not explicit in T0
3. **Born rule** — The overlap argument is nice but not the only option

### 10.3 What's Missing

1. **ℏ value** — Only the form, not the constant
2. **Specific Ĥ** — We get "there exists Ĥ" not "Ĥ = p²/2m + V"
3. **Why specific physical systems** — Framework gives general structure, not particulars

### 10.4 Possible New Axioms Needed

To make derivation complete:

**T2 (Inner Product Preservation)**:
```
Transitions preserve the inner product on accessible content:
⟨T(v), T(w)⟩ = ⟨v, w⟩ for all v, w ∈ V_π
```

**T3 (Complex Structure)**:
```
F = ℂ (the field is complex, not real)
```

Or derive T3 from something deeper about time direction.

---

## 11. Comparison with Other Derivations

### 11.1 Standard QM Postulates

| Postulate | Our Derivation |
|-----------|---------------|
| States are vectors in Hilbert space | Derived from C1-C2, P3 |
| Evolution is unitary | Derived from conservation (needs axiom?) |
| Observables are Hermitian operators | Not derived — relates to what's measurable |
| Schrödinger equation | Derived (with ℏ as parameter) |
| Born rule | Derived from overlap structure |

### 11.2 Other Derivation Attempts

**Everett/Many-worlds**: Derives Born rule from branching — different approach
**Zurek/Environment decoherence**: Explains apparent collapse — complementary
**Rovelli/Relational QM**: Similar spirit (observer-dependent) — compare!

---

## 12. Predictions and Falsifiability

### 12.1 What This Derivation Predicts

1. **QM is universal** — All perspective-based observers see quantum mechanics
2. **No deviations from linearity** — Nonlinear QM would falsify the vector space origin
3. **Born rule exact** — No deviations from |ψ|² probabilities

### 12.2 What Would Falsify This

- Discovery of nonlinear quantum evolution
- Born rule violations (probability ≠ |ψ|²)
- Non-Hermitian observable with real spectrum that's physical
- A system not describable by Hilbert space structure

### 12.3 What This Doesn't Predict

- The value of ℏ (until derived from other constants)
- Specific Hamiltonians (needs physical content)
- Particle spectrum (needs additional structure)

---

## 13. Summary

### 13.1 Achievement

We derived the FORM of the Schrödinger equation:
$$i\hbar \frac{\partial \psi}{\partial t} = \hat{H}\psi$$

from Layer 0 perspective axioms, with:
- ψ = overlap pattern
- t = path through transition algebra
- Ĥ = transition generator
- i = from complex structure needed for time direction
- ℏ = minimum action (value not derived)

### 13.2 Confidence Summary

| Component | Confidence | Notes |
|-----------|------------|-------|
| Hilbert space | [THEOREM] | Direct from axioms |
| Linearity | [THEOREM] | Vector space structure |
| i factor | [THEOREM] | Mathematical necessity |
| Hermitian Ĥ | [DERIVATION] | From Stone's theorem (given unitarity) |
| Unitarity | [DERIVATION] | Needs conservation principle |
| F = ℂ | [DERIVATION] | Time direction argument |
| Born rule | [DERIVATION] | Overlap interpretation |
| ℏ exists | [CONJECTURE] | Value not derived |

### 13.3 Open Questions

1. Can we derive F = ℂ rather than assume it?
2. Can we derive ℏ from other framework constants?
3. How does specific Ĥ (particle physics) emerge?
4. Connection to path integral formulation?

---

## Appendix A: Technical Details

### A.1 Stone's Theorem Statement

For any strongly continuous one-parameter unitary group {U(t)} on a Hilbert space, there exists a unique self-adjoint operator A such that:
$$U(t) = e^{itA}$$

### A.2 Connection to Path Integral

The transition amplitude between perspectives might connect to Feynman's path integral:
$$\langle \pi_f | \pi_i \rangle = \int \mathcal{D}[path] e^{iS[path]/\hbar}$$

where the sum is over all paths in 𝒯 from π_i to π_f.

**Status**: [SPECULATION] — Needs development.

---

**Created**: 2026-01-27
**Author**: Claude + User collaboration
**Status**: ARCHIVE investigation (reclassified Run 4: no session reference S190-S210)
**Next steps**:
1. Write SymPy verification of mathematical claims
2. Investigate ℏ derivation from α or other constants
3. Compare with Rovelli's relational QM
