# Consolidation Status: All Documents

**Created**: 2026-01-26
**Purpose**: Map every document to the organizational system, show connections, identify continuation paths

---

## How to Read This Document

Each section covers one document or group of related documents:

```
### [Document Name]
**Location**: current path
**Maps To**: thread/location in new structure
**Status**: ACTIVE | COMPLETE | PARTIAL | SPECULATION
**Confidence**: HIGH | MODERATE | LOW | SPECULATIVE

**Key Content**: What this document contains
**Connections**: What it relates to
**Continuation**: How to continue this work
**Gaps/Concerns**: What's missing or problematic
```

---

# PART 1: ACTIVE INVESTIGATIONS

## 1.1 Perspective Mutations

### framework/investigations/perspective_mutations.md
**Location**: framework/investigations/
**Maps To**: `threads/mutations_time/`
**Status**: ACTIVE
**Confidence**: MODERATE (Theorem M.1 verified, conjectures unproven)

**Key Content**:
- Mutation = (π₁, π₂) where π₁ ~ π₂ (adjacent perspectives)
- **Theorem M.1**: dim(Lost) = dim(Gained) — mutations SWAP dimensions
- Dark sector as "mutation substrate" hypothesis
- Antisymmetric modes → forced visibility (fermions)
- Symmetric modes → free to hide (scalars)
- Λ ~ 1/|Π| cosmological constant match (99.6%)

**Connections**:
- ← **Requires**: AXM_0104 (Partiality), DEF_0260 (Time)
- → **Feeds**: dark_sector_from_partiality.md, cosmological_constant
- ↔ **Adjacent**: continuous_visibility_model.md (visibility dynamics)

**Continuation**:
1. **Derive antisymmetry → visibility** rigorously from Layer 0
2. Investigate whether mutations form an algebra (M₁₂ ∘ M₂₃ = M₁₃?)
3. Derive 1/√3 hidden fraction from mutation statistics
4. Connect twilight pairs (28) to mutation mechanism

**Gaps/Concerns**:
- Visibility correlation is observed (74%, 20%, 7%) but mechanism is conjectured
- Why does antisymmetry FORCE visibility? Not derived
- Λ match could be coincidence (1 data point)

**Verification**: `perspective_mutation_analysis.py` — ALL TESTS PASS

---

## 1.2 Dark Sector from Partiality

### framework/investigations/dark_sector_from_partiality.md
**Location**: framework/investigations/
**Maps To**: `threads/dark_sector/`
**Status**: ACTIVE
**Confidence**: MODERATE (numerical matches strong, physical interpretation conjectural)

**Key Content**:
- AXM_0104 (Partiality) GUARANTEES hidden content exists
- 137 = 58 visible (SM) + 79 hidden (dark)
- 79/137 ≈ 1/√3 (0.12% error) — geometric significance
- Hidden vectors = 49 = dim(SU(7) × U(1)) — exact match
- Hidden fermions = 16 = SO(10) spinor dimension

**Proposed Dark Sector**:
| Type | Visible | Hidden |
|------|---------|--------|
| Scalar | 1 | 14 |
| Vector | 12 | 49 |
| Fermion | 45 | 16 |

**Connections**:
- ← **Requires**: AXM_0104, channel counting from crystal structure
- → **Feeds**: perspective_mutations.md, cosmological predictions
- ↔ **Adjacent**: alpha_crystal_interface.md (same 137 counting)

**Continuation**:
1. **Derive why 1/√3** — is this from tetrahedral structure (n_defect = 4)?
2. Check SU(7) anomaly cancellation for hidden fermion content
3. Investigate portal interactions between visible/hidden sectors
4. What sets the dark sector mass scale?

**Gaps/Concerns**:
- SU(7) gauge structure is IDENTIFIED, not DERIVED
- The 1/√3 match needs geometric explanation
- No physical observable proposed to test dark sector structure

**Verification**: `dark_sector_mapping.py`, `observable_fraction_analysis.py`

---

## 1.3 Dark Sections and |Π| = 137^55

### framework/investigations/dark_sections_and_pi_formula.md
**Location**: framework/investigations/
**Maps To**: `threads/dark_sector/` (overlaps with alpha_137)
**Status**: ACTIVE
**Confidence**: MODERATE (formula justified, pair decomposition insightful)

**Key Content**:
- |Π| = 137^55 ≈ 10^117.5 (matches cosmological horizon)
- 55 pairs decompose: Light (6) + Dark (21) + Twilight (28)
- Light pairs: Lorentz structure (6 = SO(3,1) generators)
- Dark pairs: Hidden dynamics (21 = SO(7) dimension)
- Twilight pairs: Light-dark coupling (28 = interface)

**Key Formula Justification**:
```
|Π| = (states per pair)^(number of pairs)
    = 137^55
    = (interface DoF)^(crystal pairs)
```

**Connections**:
- ← **Requires**: n_c = 11 (IMPORT), α = 1/137
- → **Feeds**: cosmological constant derivation, dark matter model
- ↔ **Adjacent**: continuous_visibility_model.md, pi_derivation_attempt.md

**Continuation**:
1. **Derive why 137 states per pair** — this is the main gap
2. Investigate twilight pair physics (portals, sterile neutrinos?)
3. Connect to dark matter ratio: Dark/Light ≈ 21:6 = 3.5:1 (observed ≈ 5:1)
4. Can visibility spectrum give better ratio (f = 0.113 twilight allocation)?

**Gaps/Concerns**:
- n_c = 11 is IMPORTED from M-theory, not derived
- Why 137 quantized states per pair? Uses α formula, which has same question
- Step 5 (tilt config ↔ perspective bijection) is CONJECTURED

**Verification**: `dark_sections_pi_formula.py`

---

## 1.4 Continuous Visibility Model

### framework/investigations/continuous_visibility_model.md
**Location**: framework/investigations/
**Maps To**: `threads/dark_sector/` (sub-investigation)
**Status**: ACTIVE
**Confidence**: LOW-MODERATE (mathematically consistent, physically unverified)

**Key Content**:
- Visibility v_i ∈ [0,1] per dimension (not binary)
- v_i = cos²(θ_i) where θ_i = angle to accessible subspace
- Binary (4 visible, 7 hidden) may be stable fixed point
- α depends only on TOTAL visibility (Σv_i = 4), not distribution
- Twilight allocation: f = 0.113 gives 5:1 dark/light ratio

**Key Insight**:
> Different physics probes different aspects of visibility structure:
> - α uses total visibility
> - Dark matter ratio uses pair allocation
> - No conflict between these

**Connections**:
- ← **Requires**: Layer 0 axioms, projection definitions
- → **Feeds**: dark_sections.md (pair visibility), matter ratio
- ↔ **Adjacent**: tilt_alpha_connection.md (tilt as visibility mechanism)

**Continuation**:
1. **Derive visibility dynamics** — what equation governs dv_i/dt?
2. Is binary split a stable attractor? Investigate bistability
3. Can visibility threshold explain why only 4 dimensions are "large"?
4. Energy-dependent visibility → running couplings?

**Gaps/Concerns**:
- No dynamics derived — don't know what determines {v_i}
- Binary vs continuous: which is fundamental?
- Twilight fraction f = 0.113 is fit, not derived

**Verification**: `continuous_visibility_model.py`

---

## 1.5 |Π| Derivation Attempt

### framework/investigations/pi_derivation_attempt.md
**Location**: framework/investigations/
**Maps To**: `threads/alpha_137/` (shares base)
**Status**: ACTIVE
**Confidence**: PARTIAL (structure derived, base questionable)

**Key Content**:
- |Π| = k^(n_c choose 2) structure is DERIVED
- k = 137 from interface channel counting
- **Theorem**: 55 = Gr(4,11) + SO(4) + SO(7) — three interpretations of exponent
- Perspectives = edge-labelings of complete graph K_11
- Upper triangular matrix structure (tilt matrix)

**The Three Interpretations of 55**:
| View | Formula | Meaning |
|------|---------|---------|
| Combinatorial | C(11,2) | Pairs of dimensions |
| Geometric | Gr(4,11) + SO(4) + SO(7) | Configuration space |
| Matrix | Upper-triangular 11×11 | Tilt parameters |

**Connections**:
- ← **Requires**: n_c = 11 (IMPORT), α = 1/137
- → **Feeds**: cosmological constant, dark sections
- ↔ **Adjacent**: tilt_alpha_connection.md (same 137 counting)

**Continuation**:
1. **Derive 137 states per edge** — why exactly interface DoF?
2. Prove tilt quantization (why discrete, not continuous)
3. Derive n_c = 11 from stability (currently imported)
4. Test at different scales — if dimensions change, does |Π| track?

**Gaps/Concerns**:
- k = 137 uses α formula, which itself needs justification
- Tilt quantization assumed, not derived
- n_c = 11 imported from M-theory

**Verification**: `grassmannian_55_connection.py`, `pi_derivation_mathematics.py`

---

## 1.6 Tilt-Alpha Connection

### framework/investigations/tilt_alpha_connection.md
**Location**: framework/investigations/
**Maps To**: `threads/alpha_137/`
**Status**: ACTIVE
**Confidence**: MODERATE (connection established, specific values not explained)

**Key Content**:
- Tilt matrix ε_ij parameterizes deviation from orthogonality
- dim(tilt space) = n² for n-dimensional subsystem
- α = 1/(n_d² + n_c²) = 1/(16 + 121) = 1/137
- Defect and crystal contributions ADD (orthogonal structures)
- Weinberg angle θ_W may be literal tilt angle

**Why Sum, Not Product?**:
- n_d² + n_c² = 137 (observed α)
- n_d² × n_c² = 1936 (wrong)
- (n_d + n_c)² = 225 (wrong)
- Sum indicates INDEPENDENT contributions

**Connections**:
- ← **Requires**: DEF_02A0 (tilt), n_d = 4, n_c = 11
- → **Feeds**: all α-related derivations, Weinberg angle
- ↔ **Adjacent**: pi_derivation.md (same 137), gauge_structure.md

**Continuation**:
1. **Derive specific tilt values** for masses and mixing angles
2. Connect Weinberg angle to literal tilt (θ_W = 28.7° → ε_WY ≈ 0.88)
3. Explain why EM specifically has this structure (vs weak, strong)
4. Global vs local tilt — which determines which physics?

**Gaps/Concerns**:
- n_d = 4 and n_c = 11 are IMPORTED
- Why does EM couple this way specifically?
- Other couplings (weak, strong) don't obviously fit pattern

**Verification**: `tilt_alpha_connection.py`

---

## 1.7 Associativity Derivation (n_defect = 4)

### framework/investigations/associativity_derivation.md
**Location**: framework/investigations/
**Maps To**: `threads/alpha_137/` (foundational)
**Status**: COMPLETE (partial derivation)
**Confidence**: MODERATE (strong argument, one gap)

**Key Content**:
- Time (T1) requires path independence → associativity
- Hurwitz theorem: associative division algebras are R(1), C(2), H(4) only
- Maximum associative dimension = 4 = quaternions
- **Therefore**: n_defect = 4 is the largest dimension with consistent time

**The Gap**:
- Argument requires transitions form a DIVISION ALGEBRA
- This is assumed, not proven from Layer 0
- Suggestive evidence: weights involve ratios, transitions can invert

**Connections**:
- ← **Requires**: T1 (time), transition structure
- → **Feeds**: ALL dimension-dependent formulas (α, |Π|, etc.)
- ↔ **Adjacent**: tilt_alpha_connection.md, pi_derivation.md

**Continuation**:
1. **Close the gap**: derive division algebra structure from axioms
2. Alternative approaches: spinor structure, Clifford algebras
3. If gap cannot be closed: add explicit axiom [A-DIV]

**Gaps/Concerns**:
- Division algebra assumption not derived
- Could be "smuggling in" the answer if made axiom

**Verification**: `associativity_requirement.py` — PASS (R,C,H associative; O not)

---

# PART 2: PRIME ORTHOGONALITY EXPLORATION

## 2.1 Primes as Perfect Separation (BREAKTHROUGH)

### explorations/primes_from_orthogonality/BREAKTHROUGH_primes_as_perfect_separation.md
**Location**: explorations/primes_from_orthogonality/
**Maps To**: `threads/primes_orthogonality/`
**Status**: NEW
**Confidence**: DERIVATION with CONJECTURE extension

**Key Content**:
> "Primes are what separation looks like when it's perfect; physics is what separation looks like when it's not."

- Primes = irreducible orthogonal dimensions
- Multiplication = perspective combination
- Physics = measurement of tilt (imperfect orthogonality)
- α ≈ 1/137 may measure "electromagnetic tilt"

**The Core Isomorphism**:
```
Natural numbers ←→ Perspective access patterns
      2        ←→ "See dimension 2 once"
      6 = 2×3  ←→ "See dimensions 2 and 3 together"
```

**Connections**:
- ← **Requires**: C2 (orthogonality), Π2 (combination), T1 (iteration)
- → **Feeds**: Number theory interpretations, prime distribution
- ↔ **Adjacent**: perspective_connection.md, all Crystal axioms

**Continuation**:
1. **Derive prime distribution** (~1/ln n) from perspective constraints
2. Connect tilt values to specific coupling constants
3. Explore twin primes, Goldbach through perspective lens
4. Physical predictions from this framework?

**Gaps/Concerns**:
- Physics = tilt is CONJECTURE, not derivation
- No specific predictions yet
- Could be beautiful analogy without predictive power

**Verification**: Multiple scripts — multiplication emergence VERIFIED (361/361)

---

## 2.2 Perspective Connection to Primes

### explorations/primes_from_orthogonality/perspective_connection.md
**Location**: explorations/primes_from_orthogonality/
**Maps To**: `threads/primes_orthogonality/`
**Status**: ACTIVE
**Confidence**: DERIVATION (multiplication), CONJECTURE (distribution)

**Key Content**:
- **Theorem 3.1**: φ: (N⁺, ×) → V_Crystal is isomorphism
- **Theorem 3.2**: Squarefree numbers = binary coordinate vectors = points
- Multiplication EMERGES from C2 + Π2 + T1 (VERIFIED)
- Primes FORCED by non-redundancy requirement
- Remaining gap: ordering (2 < 3 < 5 < ...) not explained

**What's Derived vs What's Not**:
| Aspect | Status |
|--------|--------|
| Orthogonal structure | THEOREM |
| Multiplication | DERIVATION |
| Why primes (not composites) | DERIVATION |
| Coprimality = orthogonality | VERIFIED |
| Counting order | PARTIAL |
| Prime density ~1/ln n | GAP |

**Connections**:
- ← **Requires**: Core axioms C2, Π2, T1
- → **Feeds**: Number-theoretic insights, Layer 1 mathematics
- ↔ **Adjacent**: BREAKTHROUGH document, all verification scripts

**Continuation**:
1. Can time sequences explain prime MAGNITUDE ordering?
2. Is there perspective interpretation of ~1/ln n density?
3. What about prime gaps, twin primes?
4. Formalize "Multiplication Emergence" theorem for Layer 1

**Gaps/Concerns**:
- Strong result, but ordering still needs work
- Half-dimension (~0.5) remains speculative
- Not clear how to make predictions

**Verification**: `multiplication_from_perspective.py`, `squarefree_point_correspondence.py`

---

# PART 3: PHYSICS LAYER DOCUMENTS

## 3.1 Alpha Crystal Interface

### physics/alpha_crystal_interface.md
**Location**: physics/
**Maps To**: `threads/alpha_137/`
**Status**: MODIFIED (needs consolidation)
**Confidence**: MODERATE

**Key Content**:
- α = 1/(n_d² + n_c²) = 1/137 formula
- Interface between defect (4D) and crystal (11D)
- Connection to channel counting (58 visible)

**Connections**:
- Overlaps heavily with tilt_alpha_connection.md
- Should be consolidated into single thread document

**Continuation**: Merge with tilt_alpha into unified `threads/alpha_137/THREAD.md`

---

## 3.2 Physics Limits (γ → 0, γ → 1)

### physics/quantum_limit.md, physics/gravity_limit.md, physics/intermediate_gamma.md
**Location**: physics/
**Maps To**: `physics/limits/`
**Status**: ACTIVE (varying confidence)
**Confidence**: CNJ_0800 (HIGH), CNJ_0801 (SPECULATION)

**Key Content**:
- γ → 1 (high overlap): Quantum mechanics emerges
- γ → 0 (low overlap): GR-like behavior
- Intermediate γ: Mesoscopic physics, decoherence

**Connections**:
- ← **Requires**: DEF_0230 (overlap), THM_0470 (critical slowing)
- → **Feeds**: QM-GR unification, decoherence model
- ↔ **Adjacent**: All γ-dependent derivations

**Continuation**:
1. Derive QM formalism from high-γ limit rigorously
2. Investigate whether GR actually emerges at low γ
3. Connect intermediate regime to quantum-classical boundary

---

## 3.3 Gauge Structure

### physics/gauge_structure.md
**Location**: physics/
**Maps To**: `threads/gauge_emergence/`
**Status**: ACTIVE
**Confidence**: LOW-MODERATE

**Key Content**:
- Aut(B) → SM gauge groups (SU(3) × SU(2) × U(1))
- Connection through basis automorphisms

**Connections**:
- ← **Requires**: DEF_0241 (Automorphisms), crystal structure
- → **Feeds**: alpha derivation, SM content
- ↔ **Adjacent**: alpha threads, field content

**Continuation**:
1. Derive gauge group structure from Aut(B) rigorously
2. Connect to 137 = 12 + 58 + ... counting

---

# PART 4: ADJACENT IDEA CLUSTERS

## Cluster A: The Alpha-137 Complex

**Documents that should be worked together**:
1. `tilt_alpha_connection.md` — core formula
2. `alpha_crystal_interface.md` — crystal interpretation
3. `pi_derivation_attempt.md` — |Π| formula (same 137)
4. `associativity_derivation.md` — why n_d = 4
5. `physics/constants/alpha_*.md` — various approaches

**Central Question**: Why is α = 1/(16 + 121) = 1/137?

**Strongest Path**: Tilt matrix dimension counting
**Weakest Link**: Why n_d = 4 and n_c = 11 specifically

---

## Cluster B: The Dark Sector Complex

**Documents that should be worked together**:
1. `dark_sector_from_partiality.md` — 58/79 split
2. `dark_sections_and_pi_formula.md` — light/dark/twilight pairs
3. `continuous_visibility_model.md` — visibility spectrum
4. `perspective_mutations.md` — dark as mutation substrate

**Central Question**: What is the dark sector, and why 79/137?

**Strongest Path**: Partiality guarantees hidden content
**Weakest Link**: What physics tests this structure?

---

## Cluster C: The Prime Emergence Complex

**Documents that should be worked together**:
1. `BREAKTHROUGH_primes_as_perfect_separation.md` — core insight
2. `perspective_connection.md` — formal analysis
3. All verification scripts in `explorations/primes_from_orthogonality/`

**Central Question**: Do primes emerge from perspective axioms?

**Strongest Path**: Multiplication from combination + iteration
**Weakest Link**: Prime distribution, ordering

---

## Cluster D: The Time/Mutation Complex

**Documents that should be worked together**:
1. `perspective_mutations.md` — mutations as time
2. `associativity_derivation.md` — path independence
3. Core axiom T1 and DEF_0260

**Central Question**: What is the structure of time?

**Strongest Path**: Mutation conservation theorem
**Weakest Link**: Mutation algebra structure

---

# PART 5: VERIFICATION SCRIPTS STATUS

## Uncommitted Scripts (15)

| Script | Thread | Purpose | Status |
|--------|--------|---------|--------|
| alpha_137_comprehensive_verification.py | alpha_137 | Full α verification | READY |
| alpha_137_verification_clean.py | alpha_137 | Clean version | READY |
| continuous_visibility_model.py | dark_sector | Visibility dynamics | READY |
| dark_sections_pi_formula.py | dark_sector | Pair decomposition | READY |
| dark_sector_mapping.py | dark_sector | Structure mapping | READY |
| fermion_visibility_analysis.py | dark_sector | Spin-visibility | READY |
| gauge_group_from_tilts.py | gauge | Gauge emergence | READY |
| grassmannian_55_connection.py | alpha_137 | Gr(4,11) identity | READY |
| interface_state_counting.py | alpha_137 | 137 states | READY |
| multiplication_from_perspective.py | primes | Mult emergence | VERIFIED |
| observable_fraction_analysis.py | dark_sector | 79/137 analysis | READY |
| perspective_mutation_analysis.py | mutations | ALL PASS | VERIFIED |
| pi_derivation_mathematics.py | alpha_137 | |Π| formula | READY |
| rg_flow_selection.py | alpha_137 | RG interpretation | READY |
| tetrahedral_connection.py | dark_sector | n=4 geometry | READY |
| tilt_alpha_connection.py | alpha_137 | ε_ij → α | READY |

---

# PART 6: PRIORITY CONTINUATION PATHS

## Highest Priority (Blocking Others)

### P1: Why exactly 58 visible dimensions?
**Thread**: alpha_137 + dark_sector
**Current Best**: Antisymmetry forces visibility
**Needed**: Rigorous derivation from Layer 0

### P2: Close the division algebra gap
**Thread**: alpha_137 (associativity)
**Current Best**: Suggestive evidence
**Needed**: Derive or accept as axiom

### P3: Derive 137 states per pair
**Thread**: alpha_137 (|Π| formula)
**Current Best**: Interface DoF counting
**Needed**: Why exactly this quantization?

## Medium Priority (Important But Not Blocking)

### P4: Physical observable for dark sector
**Thread**: dark_sector
**Current**: No specific test proposed
**Needed**: What experiment could confirm/falsify?

### P5: Derive 1/√3 hidden fraction
**Thread**: dark_sector
**Current**: Matches to 0.12%
**Needed**: Geometric explanation (tetrahedral?)

### P6: Mutation algebra structure
**Thread**: mutations_time
**Current**: Conservation proven
**Needed**: Does M₁₂ ∘ M₂₃ = M₁₃?

## Lower Priority (Interesting But Speculative)

### P7: Prime distribution from perspective
**Thread**: primes_orthogonality
**Current**: Multiplication derived
**Needed**: ~1/ln n density explanation

### P8: Visibility dynamics
**Thread**: dark_sector
**Current**: No dynamics derived
**Needed**: Equation for dv_i/dt

---

# PART 7: RECOMMENDED NEXT SESSION ACTIONS

1. **Create thread directories** and migrate documents
2. **Commit all verification scripts** with proper headers
3. **Start with Cluster A** (alpha complex) — most developed
4. **Write THREAD.md for alpha_137** consolidating:
   - tilt_alpha_connection.md
   - alpha_crystal_interface.md
   - associativity_derivation.md
   - pi_derivation_attempt.md
5. **Identify which "adjacent" documents should merge**

---

*Document status: COMPLETE*
*Ready for consolidation workflow*
