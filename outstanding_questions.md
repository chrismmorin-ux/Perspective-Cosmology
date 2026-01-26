# Outstanding Questions

Blocking or significant open problems in the mathematical framework.

---

## RESOLVED

### R1: Why does entropy increase? (Was Q-related)
**Resolution**: Entropy increase is not a law imposed on time — it is the **definition of valid adjacency**. Directed adjacency requires non-negative information loss. This IS the arrow of time, not something that happens within time.

### R2: Can entropy loop?
**Resolution**: No. The No-Loop Theorem shows that in finite U, adjacency chains cannot cycle. Looping would require zero information loss throughout, which makes the chain a single point, not a sequence.

### R3: What are "edges" of the universe?
**Resolution**: Edges are not spatial/temporal boundaries. They are limits of access:
- Projection edges (information collapse)
- Adjacency edges (continuity breakdown)
- Symmetry edges (crystalline limits)

### R4: What are black holes?
**Resolution**: Black holes are not collapse to nothingness — they are **recrystallization zones** where C reasserts itself within U.
- Event horizon = one-way perspectival membrane (D locks inward)
- Interior = convergent adjacency toward Var = 0
- Singularity = crystalline core (healed defect, not infinite density)
- Hawking radiation = perspectives that escape by riding the precipice
- Information paradox resolved: info shifts from accessible → hidden → crystalline, never destroyed

### R5: How do black holes relate to heat death?
**Resolution**: Both are paths to crystalline terminus:
- Heat death = global exhaustion (perspective runs out of fuel)
- Black holes = local reconquest (crystal forces recrystallization)
- Both end in Var = 0, but via different mechanisms

### R6: What is the mathematical type of U? (Was Q1)
**Resolution**: U is a **weighted simplicial complex with content**:
```
U = (P, Σ, Γ, C, V, B)
- P = finite set of points
- Σ = simplicial complex (connectivity structure)
- Γ = weight function on simplices [0,1]
- C: P → V = content map
- V = finite-dimensional value space with inner product
- B = orthonormal basis of V
```
See framework §1.1.1-1.1.2.

### R7: How is the access map A determined? (Was Q2)
**Resolution**: A is **derived from propagation** through U's structure:
```
A_π = Π_p ∘ eval_p ∘ lim_{n→∞} (P_D)^n
- P_D = D-restricted propagation operator
- Π_p = projection onto receptive subspace at p
- Content propagates along D-compatible paths, weighted by Γ
```
Decay parameter γ = max(Γ) determines regime (high-γ = QM-like, low-γ = GR-like).
See framework §1.2.1-1.2.4.

### R8: How do we formalize coherence? (Was Q3)
**Resolution**: Coherence is **mutual information between trajectory slices**:
```
Coh(γ, π₁, π₂) = I(A_π₁(γ ∩ U_π₁) ; A_π₂(γ ∩ U_π₂))
```
Object identity holds iff Coh ≥ ξ (coherence threshold) along entire chain.
Handles Ship of Theseus: gradual change preserves coherence, sudden change breaks it.
See framework §3.2.

### R9: What is the measure on Π? (Was Q4)
**Resolution**: Use **counting measure** for finite Π:
```
ν(S) = |S| for S ⊆ Π
⟨f⟩_Π = (1/|Π|) Σ_{π ∈ Π} f(π)
```
All perspectives weighted equally. Can introduce physics-motivated weighting later.
See framework §1.4.2-1.4.3.

### R10: How do eddies (life) work? (Was Q8)
**Resolution**: Eddies are **regions of local entropy decrease** balanced by boundary export:
- Local S can decrease if entropy is exported to surroundings
- Net global S still increases
- Life = eddy with metabolism, reproduction, adaptation, coherent trajectory
- Intelligence = deep eddy with modeling, prediction, planning, abstraction
See framework §15.

### R11: How do we recover quantum mechanics? (Was Q10)
**Resolution**: QM emerges from the **high-γ limit** of the perspective framework:
- Continuum limit: P_D → I + α∇² (diffusion kernel)
- Time from adjacency: ∂ψ/∂t evolves via propagation operator
- Complex V and unitary P_D give phase structure
- ℏ = δπ_min × E_0 (perspective grain × content scale)
- Schrödinger equation: iℏ∂ψ/∂t = (-ℏ²/2m∇² + V)ψ
- Born rule: P = |⟨φ|ψ⟩|² from overlap measure μ
See framework §12.1.1.

### R12: How do we recover general relativity? (Was Q11)
**Resolution**: GR emerges from the **low-γ limit** of the perspective framework:
- Metric from connectivity: g_μν from Γ structure
- Curvature from Γ-gradients: Riemann tensor from ∂∂Γ
- Geodesics from Γ-optimization: free fall = minimum resistance paths
- T_μν from perspective density: matter = concentrated perspectives
- Einstein equations: G_μν = 8πG T_μν from self-consistency
- Λ from boundary conditions (tentative)
See framework §12.2.1.

### R13: Bekenstein-Hawking entropy S = A/4 (Was Q16 partial)
**Resolution**: S = A/4 derived from **hidden dimension counting**:
- Horizon ∂B is the hiding boundary for external perspectives
- Hidden dimensions N_hidden = A/l_P² (one per Planck area)
- Entropy S ∝ N_hidden (indistinguishability count)
- Factor of 4 from geometric/spinor/correlation effects
- Holographic principle follows: info on surface because surface defines hiding
See framework §12.3.9.1.

---

## IMPORTANT (Not Immediately Blocking)

### Q5: What is the structure of the orthogonal basis B?

**Status**: IMPORTANT

**Problem**: We've introduced B as the finite set of "true" dimensions, but haven't characterized it.

**Sub-questions**:
- How many dimensions does our universe's B have?
- Are basis dimensions related to physical constants, symmetries, or conservation laws?
- Is B discoverable from within, or only inferrable?
- What determines the "size" of each dimension?

**Possible connections**:
- Physical constants as ratios between basis dimensions
- Symmetry groups as transformations preserving B-structure
- Conservation laws as invariants along certain basis directions

---

### Q6: What breaks crystalline symmetry?

**Status**: IMPORTANT

**Problem**: Why does our universe have perspectival defects rather than being crystalline?

**Sub-questions**:
- Is crystallinity unstable in any finite U?
- Are defects necessary for U to be self-consistent?
- Is there selection (only non-crystalline configurations are experienced)?

**Intuitions**:
- Perfect symmetry may be logically impossible for self-containing structures
- Defects may be equivalent to the incompleteness that forces perspective
- The question "why isn't U crystalline?" may be malformed (no one would ask it in a crystalline universe)

---

### Q7: Is this framework falsifiable?

**Status**: IMPORTANT (long-term)

**Problem**: A theory of everything that predicts nothing is not useful.

**Possible predictions**:
- Specific structure at the QM/GR interface
- Constraints on black hole information
- Novel phenomena at "perspective boundaries"
- Entropy behavior in extreme regimes

**Working approach**: Develop framework first. Seek predictions once structure is solid.

---

### Q8: How do "eddies" (life, structure) work?

**Status**: IMPORTANT

**Problem**: Ordered structures exist locally despite global entropy increase. How does the framework account for this?

**Current understanding**:
- Local regions can have dimensional realization (accessing latent orthogonality)
- This appears as local entropy decrease / order increase
- But it's "borrowed" — either the dimension was always there (no net creation) or it collapses
- Life/intelligence = systems that efficiently discover true orthogonality while shedding false

**Needs formalization**: What makes some regions better at sustaining local order?

---

## SPECULATIVE (Deferrable)

### Q9: Does Π have its own perspectives?

**Status**: SPECULATIVE

**Problem**: If U contains everything, and Π is derived from U, then Π ⊂ U in some sense. Can there be "meta-perspectives" on Π?

**Implications**:
- Higher-order experience?
- Self-reference and fixed points?
- Consciousness as recursive perspective?

**Working approach**: Defer. Note that the theory allows this in principle.

---

### Q10: How do we recover quantum mechanics?

**Status**: ADDRESSED (see R11)

Sketch-level derivation complete. See framework §12.1.1.

**Remaining sub-questions** (moved to new questions below):
- Why V has complex structure
- Spin and internal degrees of freedom
- Multi-particle systems and entanglement

---

### Q11: How do we recover general relativity?

**Status**: ADDRESSED (see R12)

Sketch-level derivation complete. See framework §12.2.1.

**Remaining sub-questions** (moved to new questions below):
- Exact Γ → g_μν mapping
- Derivation of G from framework constants
- Quantum gravity regime (intermediate γ)

---

### Q12: What is the "primordial perspective"?

**Status**: SPECULATIVE

**New question from recent discussion.**

**Problem**: Perspective is the primordial dimension that enables all others to be distinguished. What is the minimal structure that instantiates perspective?

**Sub-questions**:
- Can perspective exist without any "observer-like" structure?
- Is perspective itself a point in some meta-space?
- What is the relationship between "having perspective" and "being a location in U"?

---

### Q13: Can time manifest in "strange ways"?

**Status**: SPECULATIVE

**New question from recent discussion.**

**Problem**: We've been careful not to be human-centric about perspective. Time is defined as adjacency chains, but adjacency might look very different in other regions of U or for other configurations.

**Sub-questions**:
- Could there be adjacency chains that don't "feel" like time?
- What determines the "grain" or "speed" of adjacency?
- Are there regions of U with radically different temporal structure?

---

---

## NEW: Connections to Existing Physics

See `references/related_theories.md` for full details.

### Potential Bridges

| Our Concept | Existing Theory | Connection |
|-------------|-----------------|------------|
| Static U | Block Universe, Wheeler-DeWitt | Timeless fundamental structure |
| Adjacency → Time | Causal Set Theory | Order gives temporal structure |
| Access map A | Holographic Principle | Projection to lower dimensions |
| Hidden/Accessible | Constructor Theory | Possible/Impossible dichotomy |
| Perspectival entropy | Bekenstein bound | Information limits from geometry |

### Key Questions for Bridge-Building

**Q14**: Is adjacency equivalent to causal ordering?
- If yes: we recover causal set structure
- If no: what's the difference?

**Q15**: Does high-overlap (μ→1) recover quantum mechanics?
- Superposition = adjacent perspectives
- Collapse = path selection
- Born rule from overlap measure?

**Q16**: Is the access map A holographic?
- Does A encode 3D info on 2D?
- Is entropy = hidden dimensions related to Bekenstein bound?

**Q17**: What determines black hole formation?
- What causes "extreme convergence" that creates B?
- Is there a threshold in perspectival density?
- Connection to mass/energy in standard physics?

**Q18**: Can black holes merge?
- What happens to two crystalline cores?
- Do horizons combine smoothly?
- Is merger = union of recrystallization zones?

**Q19**: What is the structure of the crystalline core S_B?
- Is it truly uniform or does it retain structure?
- Is information recoverable in principle?
- Does S_B have internal perspectives (trivial ones)?

**Q20**: What causes Hawking radiation rate?
- "Adjacency volatility" at horizon — can we formalize?
- Connection to horizon area and temperature?
- Why does smaller B radiate faster?

---

## NEW: Questions from Physics Derivations

### From QM Derivation (§12.1.1)

**Q21**: Why does V have complex structure?
- Is complex V an axiom or derivable from more primitive structure?
- Does pairing of real dimensions to complex naturally emerge?
- Connection to phase and unitarity requirements?

**Q22**: How do spin and internal degrees of freedom arise?
- Spin from B-structure or trajectory topology?
- Half-integer spin from double-covering of rotation group?
- Internal quantum numbers from B-subspace projections?

**Q23**: How do multi-particle systems and entanglement work?
- Entanglement as shared hidden structure H_π?
- Tensor product structure from independent trajectories?
- Bell inequality violations from perspective overlap?

**Q24**: What determines the exact value of ℏ?
- ℏ = δπ_min × E_0 — but what sets these?
- Connection to Planck length and Planck time?
- Is ℏ universal or could other universes have different values?

### From GR Derivation (§12.2.1)

**Q25**: What is the exact Γ → g_μν mapping?
- Coordinate choices in the continuum limit?
- How does Lorentzian signature emerge?
- Connection to causal structure?

**Q26**: How is Newton's constant G derived?
- G ∝ (Γ-normalization)/(content-normalization) — make precise
- Why is G so small (hierarchy problem)?
- Does G run with energy scale in this framework?

**Q27**: What selects the cosmological constant Λ?
- Boundary conditions vs. hidden dimensions vs. crystalline pressure?
- Why is Λ small but non-zero?
- Connection to dark energy?

**Q28**: How does the intermediate-γ regime work?
- Explicit dynamics when γ ≈ 0.5?
- Decoherence as γ-regime transition?
- Quantum gravity phenomenology?

### From S = A/4 Derivation (§12.3.9.1)

**Q29**: What is the exact mechanism for the factor of 4?
- Partial distinguishability (correlations)?
- Dimensional projection factor (geometric)?
- Spinor structure?

**Q30**: How is the Planck length derived from framework?
- l_P from Γ-structure — explicit construction?
- Connection to δπ_min?
- Universal or framework-dependent?

### From Standard Model Derivation (§16.3.1)

**Q31**: Why are there exactly three generations?
- Repetition in B vs. hidden dimension vs. trajectory winding?
- Same quantum numbers, different masses — why?
- Is three fundamental or contingent?

**Q32**: Why does α ≈ 1/137?
- Angle between dimensions?
- Ratio of magnitudes?
- Topological invariant?

**Q33**: What explains the mass hierarchy?
- Why is m_top/m_electron ≈ 340,000?
- Higgs couplings from B-geometry?
- Connection to trajectory properties?

**Q34**: Where does CP violation enter B-structure?
- Complex phase in CKM/PMNS matrices?
- Asymmetry in B or Γ structure?
- Connection to matter-antimatter asymmetry?

**Q35**: What accounts for dark matter and dark energy?
- Additional B dimensions not visible to SM particles?
- Perspectives that don't interact electromagnetically?
- Connection to cosmological Λ?

---

## Log

| Date | Item | Update |
|------|------|--------|
| 2025-01-25 | Q1-Q10 | Initial formulation |
| 2025-01-25 | R1-R3 | Resolved: entropy increase, no-loop, edges |
| 2025-01-25 | Q5, Q8, Q12, Q13 | Added from dimensional/entropy discussion |
| 2025-01-25 | Framework | Major update: §5 Dimensional Structure, §6 Entropy, §7 Finiteness |
| 2025-01-25 | Framework | Added §8 Topology, §9 Boundaries, §10 Crystalline Embedding |
| 2025-01-25 | References | Created references/related_theories.md |
| 2025-01-25 | Q14-Q16 | Added physics bridge questions |
| 2025-01-25 | R4-R5 | Resolved: black holes as recrystallization, two paths to crystal |
| 2025-01-25 | Framework | Added §12.3 Black Holes (11 subsections, detailed) |
| 2025-01-25 | Q17-Q20 | Added black hole follow-up questions |
| 2025-01-25 | R6-R10 | Resolved: U structure, access map, coherence, measure on Π, eddies |
| 2025-01-25 | Framework | Added §1.1.1-1.1.2 (U axioms), §1.2.1-1.2.4 (access map derivation) |
| 2025-01-25 | Framework | Added §1.4.1-1.4.4 (Π structure and measure) |
| 2025-01-25 | Framework | Expanded §3 (coherence formalization, consciousness levels) |
| 2025-01-25 | Framework | Added §15 (eddies and life), §16 (physical constants), §17 (predictions) |
| 2025-01-25 | Framework | Added §18-19 (summary and next steps) |
| 2025-01-25 | R11-R13 | Resolved: QM from high-γ, GR from low-γ, S=A/4 from hidden dimensions |
| 2025-01-25 | Framework | Added §12.1.1 (Schrödinger from high-γ, 6-step derivation) |
| 2025-01-25 | Framework | Added §12.2.1 (Einstein equations from low-γ, 6-step derivation) |
| 2025-01-25 | Framework | Added §12.3.9.1 (Bekenstein-Hawking S=A/4, 6-step derivation) |
| 2025-01-25 | Framework | Added §16.3.1 (Minimal basis B for Standard Model, 6-step derivation) |
| 2025-01-25 | Q10, Q11 | Marked as ADDRESSED (see R11, R12) |
| 2025-01-25 | Q21-Q35 | Added new questions from physics derivations |
